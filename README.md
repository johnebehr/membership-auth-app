# Membership App

This project now includes a basic MySQL-backed API layer for authentication, user management, and simple admin-or-user access control.

The backend remains SQL-first: there are no ORM abstractions or migration tooling in this MVP. Database changes should be applied directly with SQL scripts when needed.

## Setup

Make sure to install dependencies:

```bash
npm install
```

## Environment configuration

Copy [.env.example](.env.example) to .env and set the database connection values used by the app:

- DB_HOST
- DB_PORT
- DB_USER
- DB_PASSWORD
- DB_DATABASE

These values are used for the current development/staging environment and can be pointed at the production server when needed.

## Database setup

1. Apply the SQL in [app/server/utils/schema.sql](app/server/utils/schema.sql) to your MySQL database.
2. Confirm the users table exists and includes the is_admin column.
3. Start the app with:

```bash
npm run dev
```

## API endpoints

- POST /api/login
- GET /api/users
- POST /api/users
- DELETE /api/users/:id

## Access model

The current schema uses a simple access model:

- Admin: can manage users and the core app experience
- User: can access the app without administrative controls

## MVP data model notes

The initial membership app will focus on a small set of core entities:

- User: authenticated account for app access
- Member: a person tracked by the membership system

Suggested initial relationships:

- One user is either an admin or a standard user
- One member may be linked to one primary user account for administration
- Membership status can be tracked for each member as part of the first feature set

Suggested starter member fields:

- full name
- email address
- phone number
- membership status
- join date
- renewal date
- notes

Suggested starter statuses:

- Active
- Pending
- Expired

This MVP intentionally keeps the model simple and can expand as new workflows are introduced.
