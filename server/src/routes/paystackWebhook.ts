
import { Router } from 'express';
import { createHmac, timingSafeEqual } from 'node:crypto';
import {
  BookingStatus,
  PaymentStatus
} from '@prisma/client';

import { prisma } from '../services/prisma.js';
import { verifyPayment } from '../services/paystack.js';

const router = Router();

type PaystackWebhookEvent = {
  event?: string;
  data?: {
    reference?: string;
  };
};

router.post('/', async (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const signature = req.header('x-paystack-signature');

    if (!secret || !signature || !Buffer.isBuffer(req.body)) {
      res.status(401).json({ error: 'Invalid webhook request.' });
      return;
    }

    const expected = createHmac('sha512', secret)
      .update(req.body)
      .digest('hex');

    const supplied = Buffer.from(signature, 'hex');
    const calculated = Buffer.from(expected, 'hex');

    if (
      supplied.length !== calculated.length ||
      !timingSafeEqual(supplied, calculated)
    ) {
      res.status(401).json({ error: 'Invalid webhook signature.' });
      return;
    }

    const event = JSON.parse(
      req.body.toString('utf8')
    ) as PaystackWebhookEvent;

    if (event.event !== 'charge.success') {
      res.sendStatus(200);
      return;
    }

    const reference = event.data?.reference;

    if (!reference) {
      res.status(400).json({ error: 'Missing payment reference.' });
      return;
    }

    const booking = await prisma.booking.findUnique({
      where: { paymentReference: reference }
    });

    if (!booking) {
      console.error('Webhook booking not found:', reference);
      res.status(404).json({ error: 'Booking not found.' });
      return;
    }

    // Check the payment independently with Paystack.
    const payment = await verifyPayment(reference);

    if (
      payment.status !== 'success' ||
      payment.reference !== reference ||
      payment.currency !== 'ZAR' ||
      payment.amount !== booking.total * 100 ||
      !payment.paid_at
    ) {
      console.error('Webhook payment verification failed:', reference);
      res.status(409).json({ error: 'Payment verification failed.' });
      return;
    }

    if (
      booking.paymentStatus === PaymentStatus.SUCCESS &&
      booking.status === BookingStatus.CONFIRMED
    ) {
      res.sendStatus(200);
      return;
    }

    // Do not silently confirm a cancelled booking.
    if (booking.status !== BookingStatus.PENDING) {
      console.error(
        'Paid booking requires reconciliation:',
        booking.id,
        booking.status
      );
      res.status(409).json({
        error: 'Booking requires payment reconciliation.'
      });
      return;
    }

    await prisma.$transaction(async tx => {
      const updated = await tx.booking.updateMany({
        where: {
          id: booking.id,
          paymentReference: reference,
          paymentStatus: PaymentStatus.PENDING,
          status: BookingStatus.PENDING
        },
        data: {
          paymentStatus: PaymentStatus.SUCCESS,
          status: BookingStatus.CONFIRMED,
          paidAt: new Date(payment.paid_at!)
        }
      });

      if (updated.count === 1) {
        await tx.notification.create({
          data: {
            userId: booking.userId,
            title: 'Booking confirmed',
            message:
              `Payment received. Booking ${booking.id} is confirmed.`,
            read: false
          }
        });
      }
    });

    res.sendStatus(200);
  } catch (error) {
    console.error('Paystack webhook error:', error);
    res.status(500).json({
      error: 'Unable to process webhook.'
    });
  }
});

export default router;
