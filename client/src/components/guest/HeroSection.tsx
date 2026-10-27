import { Link } from 'react-router-dom';

// Hero section component for the landing page featuring a title, tagline, and a call-to-action link to explore hotel branches.
export function HeroSection() {
  return (
    <section className="hero">
      <h1>Find your retreat</h1>
      <p>Beautiful stays across South Africa.</p>
      <Link className="btn btn-primary" to="/branches">
        Explore our branches
      </Link>
    </section>
  );
}