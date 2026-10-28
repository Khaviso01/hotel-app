// Hotel gallery component that displays images of a hotel.
export function HotelGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  // Render the hotel gallery.
  return (
    <div className="gallery">
      {/* Filter out empty image values and display each valid image. */}
      {images
        .filter(Boolean)
        .map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`${name} photo ${i + 1}`}
            loading="lazy"
          />
        ))}
    </div>
  );
}
