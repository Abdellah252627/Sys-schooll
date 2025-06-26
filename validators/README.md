# Validators

This directory contains validation logic for the application. Each validator should be a separate file that exports validation functions.

## Available Validators

- `auth.validator.js` - Authentication related validations (register, login, etc.)
- `user.validator.js` - User profile validations
- `class.validator.js` - Class related validations
- `assignment.validator.js` - Assignment related validations

## Usage Example

```javascript
const { validateUserRegistration } = require('./validators/auth.validator');

// In your route handler
const { error } = validateUserRegistration(req.body);
if (error) {
  return res.status(400).json({ error: error.details[0].message });
}
```
