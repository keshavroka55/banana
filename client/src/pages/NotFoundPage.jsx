import Button from '../components/Button'

export default function NotFoundPage() {
  return (
    <div className="container narrow center-text stack">
      <p className="big-score">404</p>
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist.</p>
      <Button to="/">Back to home</Button>
    </div>
  )
}
