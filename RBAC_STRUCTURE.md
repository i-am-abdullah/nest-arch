# RBAC Structure Documentation

## Overview

This application implements a complete Role-Based Access Control (RBAC) system with the following structure:

```
User → Roles → Permissions
```

- Users can have multiple Roles
- Roles can have multiple Permissions
- Permissions define access to resources and actions

## Database Schema

### Tables

1. **users**
   - id (UUID, PK)
   - email (VARCHAR, UNIQUE)
   - name (VARCHAR)
   - created_at, updated_at

2. **roles**
   - id (UUID, PK)
   - name (VARCHAR, UNIQUE)
   - description (TEXT, nullable)
   - created_at, updated_at

3. **permissions**
   - id (UUID, PK)
   - name (VARCHAR)
   - resource (VARCHAR) - e.g., "users", "posts", "comments"
   - action (VARCHAR) - e.g., "create", "read", "update", "delete"
   - description (TEXT, nullable)
   - created_at, updated_at
   - UNIQUE(resource, action)

4. **user_roles** (junction table)
   - user_id (UUID, FK → users.id)
   - role_id (UUID, FK → roles.id)

5. **role_permissions** (junction table)
   - role_id (UUID, FK → roles.id)
   - permission_id (UUID, FK → permissions.id)

## Domain Models

### Permission Domain
```typescript
Permission {
  id, name, resource, action, description
  
  Methods:
  - create() - Factory method
  - update() - Update permission
  - fullName - Computed property (resource:action)
}
```

### Role Domain
```typescript
Role {
  id, name, description, permissions[]
  
  Methods:
  - create() - Factory method
  - update() - Update role
  - addPermission() - Add permission to role
  - removePermission() - Remove permission from role
  - hasPermission() - Check if role has permission
  - hasPermissionByResourceAndAction() - Check by resource/action
}
```

### User Domain
```typescript
User {
  id, email, name, roles[]
  
  Methods:
  - create() - Factory method
  - update() - Update user
  - addRole() - Add role to user
  - removeRole() - Remove role from user
  - hasRole() - Check if user has role
  - hasPermission() - Check if user has permission (via roles)
  - getAllPermissions() - Get all unique permissions from all roles
}
```

## API Endpoints

### Permissions
- `GET /permissions` - List all permissions (uses slave DB)
- `GET /permissions/:id` - Get permission by ID (uses slave DB)
- `POST /permissions` - Create permission
- `PUT /permissions/:id` - Update permission
- `DELETE /permissions/:id` - Delete permission

### Roles
- `GET /roles` - List all roles (uses slave DB)
- `GET /roles/:id` - Get role with permissions (uses slave DB)
- `POST /roles` - Create role
- `PUT /roles/:id` - Update role
- `DELETE /roles/:id` - Delete role
- `POST /roles/:id/permissions` - Assign permission to role
- `DELETE /roles/:id/permissions/:permissionId` - Remove permission from role

### Users
- `GET /users` - List all users (uses slave DB)
- `GET /users/:id` - Get user by ID (uses slave DB)
- `POST /users` - Create user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `POST /users/:id/roles` - Assign role to user (to be implemented)
- `DELETE /users/:id/roles/:roleId` - Remove role from user (to be implemented)

## Architecture Highlights

### Clean Architecture
- **Domain Layer**: Pure business logic (User, Role, Permission)
- **Infrastructure Layer**: Database entities, repositories, mappers
- **Application Layer**: Services, DTOs
- **Presentation Layer**: Controllers

### Design Patterns
1. **Repository Pattern**: Abstract data access
2. **Mapper Pattern**: Convert between domain ↔ entity
3. **Factory Pattern**: Domain object creation
4. **Template Method**: BaseRepository with hooks

### Key Features
1. **Master-Slave DB Support**: Read operations use replica DB
2. **Domain-Driven Design**: Business logic in domain models
3. **Immutable Domains**: Domain objects are immutable
4. **Type Safety**: Full TypeScript support
5. **Validation**: DTO validation with class-validator

## RBAC Implementation

### Permission Check Flow
```
1. User makes request
2. Check user.hasPermission(resource, action)
3. User checks all roles
4. Each role checks its permissions
5. Return true if any role has the permission
```

### Example Usage
```typescript
// Check if user can delete posts
const canDelete = user.hasPermission('posts', 'delete');

// Get all user permissions
const allPermissions = user.getAllPermissions();

// Check if user has admin role
const isAdmin = user.hasRole(adminRoleId);
```

## Database Optimization

### Indexes
- `permissions.resource` - Indexed for fast lookups
- `permissions.action` - Indexed for fast lookups
- `permissions(resource, action)` - Unique constraint
- `roles.name` - Unique constraint
- `users.email` - Unique constraint

### Query Optimization
- Lazy loading for relations (MikroORM Collections)
- Explicit populate for relations when needed
- Separate read/write databases (master-slave)

## Best Practices Implemented

1. **No N+1 Queries**: Use populate for relations
2. **Unique Constraints**: Prevent duplicate permissions/roles
3. **Conflict Checking**: Service layer validates uniqueness
4. **Error Handling**: Proper exceptions (NotFoundException, ConflictException)
5. **Immutability**: Domain objects return new instances
6. **Separation of Concerns**: Clear layer boundaries

## Next Steps for RBAC

To implement full RBAC, add:

1. **Guards**: `@RequirePermission('resource', 'action')` decorator
2. **Middleware**: Extract user from JWT and check permissions
3. **Decorators**: `@CurrentUser()` to inject user in controllers
4. **Caching**: Cache user permissions for performance
5. **Audit Log**: Track permission changes

## Example RBAC Setup

```typescript
// 1. Create permissions
POST /permissions
{
  "name": "Create Post",
  "resource": "posts",
  "action": "create"
}

// 2. Create role
POST /roles
{
  "name": "Editor",
  "description": "Can create and edit posts"
}

// 3. Assign permission to role
POST /roles/{roleId}/permissions
{
  "permissionId": "{permissionId}"
}

// 4. Assign role to user
POST /users/{userId}/roles
{
  "roleId": "{roleId}"
}

// 5. Check permission in code
if (user.hasPermission('posts', 'create')) {
  // Allow action
}
```

## Performance Considerations

1. **Connection Pooling**: Configured (min: 2, max: 20)
2. **Read Replicas**: GET requests use slave DB
3. **Lazy Loading**: Relations loaded only when needed
4. **Efficient Queries**: Use populate to avoid N+1

## Security Notes

- Permissions are immutable once assigned
- Role/permission changes require explicit API calls
- All endpoints validate input with DTOs
- Database constraints prevent invalid states



