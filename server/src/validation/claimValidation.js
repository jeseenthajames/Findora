export const validateClaimCreate = (req, res, next) => {
  const { message } = req.body;
  const errors = [];

  if (!message || typeof message !== 'string' || message.trim().length < 10) {
    errors.push('Please provide a message explaining proof or details of ownership (at least 10 characters).');
  }

  if (message && message.trim().length > 600) {
    errors.push('Message cannot exceed 600 characters.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors.join(' '),
      errors
    });
  }

  next();
};
