# Services

This directory contains business logic services that handle the core functionality of the application.

## Available Services

- `auth.service.js` - Authentication related services
- `user.service.js` - User management services
- `class.service.js` - Class management services
- `assignment.service.js` - Assignment management services
- `grade.service.js` - Grade management services

## Service Architecture

Each service should be a class that encapsulates business logic and interacts with the database layer. Services should be stateless and reusable across different parts of the application.

## Usage Example

```javascript
const UserService = require('../services/user.service');

// In your controller
const user = await UserService.getUserById(userId);
if (!user) {
  throw new Error('User not found');
}
```
