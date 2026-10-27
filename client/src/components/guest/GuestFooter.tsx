//  Footer component for the guest-facing pages, displaying the current year and location of The Retreat.
export function GuestFooter() {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} The Retreat · South Africa</p>
    </footer>
  );
}