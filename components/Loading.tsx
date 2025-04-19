interface LoadingProps {
  fullScreen?: boolean;
  message?: string;
}

export default function Loading({ fullScreen = false, message = 'Loading...' }: LoadingProps) {
  const content = (
    <div className="d-flex justify-content-center align-items-center">
      <div className="spinner-border text-primary me-2" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <span>{message}</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-light d-flex justify-content-center align-items-center">
        {content}
      </div>
    );
  }

  return content;
}
