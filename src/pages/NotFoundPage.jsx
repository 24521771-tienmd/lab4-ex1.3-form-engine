import { Link } from 'react-router'

export default function NotFoundPage() {
  return (
    <section aria-labelledby="not-found-title">
      <h1 id="not-found-title">Page not found</h1>
      <p>The page you requested does not exist.</p>
      <Link to="/">Back to the Arena</Link>
    </section>
  )
}
