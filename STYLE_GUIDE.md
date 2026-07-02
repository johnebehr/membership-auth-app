# Membership App Style Guide and Expectations

## Product direction

- Build a membership management application with Nuxt 3.
- Prefer JavaScript over TypeScript for implementation.
- Follow a test-driven development workflow where practical.
- Start with authentication and an index experience, then expand toward membership workflows.

## Visual theme

- Use a single, cohesive palette across the app.
- Base colors:
  - Primary navy: #0F2537
  - Secondary teal: #2D7F84
  - Text dark: #1A1A1A
  - Text muted: #687A86
  - Background light: #F4F6F8
  - Background white: #FFFFFF
  - Data green: #3D8C5A
  - Data red: #C44C44
  - Data blue: #2A6F97
  - Data amber: #D4A373
- Keep a clean, professional, minimal interface with strong contrast and consistent spacing.

## UX expectations

- Authentication should support a simple login flow with clear feedback.
- The initial experience should include a dashboard-style index page.
- Favor clear labels, concise copy, and predictable layout patterns.

## Technical expectations

- Keep component and composable logic simple and readable.
- Use Nuxt pages and composables for app structure.
- Use Vitest for unit tests around core behavior.
- Keep the database connection work separate from the UI layer until backend integration is ready.

## Future schema discussion notes

- Authentication and user identity are the first priorities.
- Membership, renewal, and communication data will be discussed as the app evolves.
- MySQL 9 and mysql2 will be used for backend connectivity when the integration work begins.
- For the initial phase, user accounts and admin status should live in the main application database on the database server so they can be managed with the same operational tooling and access controls.
- If the system grows, we can split authentication and authorization into dedicated schemas or a separate service, but that should be a later architectural decision rather than a default starting point.

## Long-term todo list

- Add member lifecycle tracking with statuses such as Active, Pending, Expired, and Inactive.
- Add search, filtering, and sorting for members and users.
- Expand member profile details with phone number, join date, renewal date, and notes.
- Track activity and audit history for member and user changes.
- Add bulk actions such as import/export and simple multi-update workflows.
- Improve reporting with dashboard summaries for active members, pending members, admins, and renewals.

## Implementation roadmap

### Priority 1 - Foundation (High)

- Extend the member data model to store the remaining profile information needed for the membership workflow.
- Add member status handling and validation for the main lifecycle states.
- Build a consistent create/edit member experience so forms stay predictable as the app grows.

### Priority 2 - Usability (High)

- Add search, filtering, and sorting to keep member lists usable as data grows.
- Add dashboard summaries for active members, pending records, and upcoming renewals.

### Priority 3 - Admin workflows (Medium)

- Add activity and audit history for important member and user changes.
- Add bulk actions such as import/export and simple multi-update workflows.

### Priority 4 - Reporting and scale (Medium/Low)

- Add reporting views for renewals, inactive members, and admin activity.
- Prepare for future membership workflows such as reminders and communication history.
