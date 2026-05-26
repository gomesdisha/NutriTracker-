export function notFound(req, res) {
  return res.status(404).json({ message: "Route not found" });
}

// Central error handler; keep messages safe for clients
export function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error(err);

  if (res.headersSent) return next(err);

  return res.status(500).json({
    message: "Internal server error"
  });
}

