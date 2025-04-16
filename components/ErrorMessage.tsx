interface ErrorMessageProps {
  error: string | null;
  className?: string;
}

export default function ErrorMessage({ error, className = '' }: ErrorMessageProps) {
  if (!error) return null;

  return (
    <div className={`alert alert-danger ${className}`} role="alert">
      {error}
    </div>
  );
}
