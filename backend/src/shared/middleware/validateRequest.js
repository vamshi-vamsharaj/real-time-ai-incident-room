

export const createError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

export const validateRequest = (schema) => (req, res, next) => {
  const errors = [];

  for (const [field, validator] of Object.entries(schema)) {
    const error = validator(req.body[field], field);
    if (error) errors.push(error);
  }

  if (errors.length > 0) {
    return next(createError(errors.join(", "), 400));
  }

  next();
};

// ── Reusable validators ────────────────────────────────────────────────────

export const required = (label) => (value) => {
  if (value === undefined || value === null || String(value).trim() === "") {
    return `${label} is required`;
  }
};

export const minLength = (min, label) => (value) => {
  if (value && String(value).trim().length < min) {
    return `${label} must be at least ${min} characters`;
  }
};

export const maxLength = (max, label) => (value) => {
  if (value && String(value).trim().length > max) {
    return `${label} must be at most ${max} characters`;
  }
};

export const isEnum = (values, label) => (value) => {
  if (value && !values.includes(value)) {
    return `${label} must be one of: ${values.join(", ")}`;
  }
};

export const composeValidators =
  (...validators) =>
  (value, field) => {
    for (const validator of validators) {
      const error = validator(value, field);
      if (error) return error;
    }
  };
