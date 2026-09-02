# API Documentation

## User Service — Initial API

The following endpoints are planned for the initial User Service. Authentication and JWT functionality are not included yet.

### Create a user

`POST /api/users`

Creates a user from a name, email, password, and optional phone number. Returns the created user without its password.

### Get a user by ID

`GET /api/users/{id}`

Returns a user by their ID, without the password.

### List users

`GET /api/users`

Returns all users without passwords.

### Get a user by email

`GET /api/users/email/{email}`

Returns a user by email, without the password.