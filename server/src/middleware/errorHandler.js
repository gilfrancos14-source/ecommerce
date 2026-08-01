const errorHandler = (err, req, res, _next) => {
  if (err.issues) {
    return res.status(400).json({
      success: false,
      message: err.issues[0].message,
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Ressource introuvable',
    });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Erreur lors de l\'inscription',
    });
  }

  if (err.code === 'P2003') {
    return res.status(400).json({
      success: false,
      message: 'Référence invalide',
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Erreur interne du serveur';

  if (process.env.NODE_ENV !== 'production' || process.env.DEBUG === 'true') {
    console.error('ERROR:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && process.env.DEBUG === 'true' && { stack: err.stack }),
  });
};

export default errorHandler;