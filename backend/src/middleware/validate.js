import { ZodError } from "zod";

export function validateBody(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        const issues = Array.isArray(err.issues) ? err.issues : Array.isArray(err.errors) ? err.errors : [];
        return res.status(400).json({
          message: "Validation error",
          errors: issues.map((e) => ({
            path: Array.isArray(e.path) ? e.path.join(".") : "",
            message: e.message
          }))
        });
      }
      return next(err);
    }
  };
}

