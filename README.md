# muluerp

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines Next.js, Hono, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **Next.js** - Full-stack React framework
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **shadcn/ui** - Reusable UI components
- **Hono** - Lightweight, performant server framework
- **Node.js** - Runtime environment
- **Prisma** - TypeScript-first ORM
- **PostgreSQL** - Database engine
- **Authentication** - Better-Auth
- **Turborepo** - Optimized monorepo build system

## Getting Started

First, install the dependencies:

```bash
pnpm install
```

## Database Setup

This project uses PostgreSQL with Prisma.

1. Make sure you have a PostgreSQL database set up.
2. Update your `apps/server/.env` file with your PostgreSQL connection details.

3. Apply the schema to your database:

```bash
pnpm run db:push
```

4. **(Optional)** Create the first admin user and seed roles:

```bash
pnpm run db:seed
```

This creates an admin with **email** and **password** from `apps/server/.env`, or defaults:

- `ADMIN_EMAIL` (default: `admin@muluerp.com`)
- `ADMIN_PASSWORD` (default: `admin123`)

Example with custom credentials:

```bash
# In apps/server/.env add:
ADMIN_EMAIL=your@email.com
ADMIN_PASSWORD=your-secure-password
```

Then run `pnpm run db:seed` again (or before first seed).

5. **Change the admin email or password later:**

```bash
# Set in apps/server/.env (or export in shell):
ADMIN_EMAIL=new@example.com
ADMIN_PASSWORD=newpassword

pnpm run update-admin
```

You can set only `ADMIN_PASSWORD` to change just the password. In the app, admins can also set or change passwords for other users (e.g. ministry admins) from the Users and Ministry Admin pages.

Then, run the development server:

```bash
pnpm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see the web application.
The API is running at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
muluerp/
├── apps/
│   ├── web/         # Frontend application (Next.js)
│   └── server/      # Backend API (Hono)
├── packages/
│   ├── auth/        # Authentication configuration & logic
│   └── db/          # Database schema & queries
```

## Available Scripts

- `pnpm run dev`: Start all applications in development mode
- `pnpm run build`: Build all applications
- `pnpm run dev:web`: Start only the web application
- `pnpm run dev:server`: Start only the server
- `pnpm run check-types`: Check TypeScript types across all apps
- `pnpm run db:push`: Push schema changes to database
- `pnpm run db:generate`: Generate database client/types
- `pnpm run db:migrate`: Run database migrations
- `pnpm run db:seed`: Create first admin user (and ADMIN role)
- `pnpm run db:studio`: Open database studio UI
- `pnpm run update-admin`: Update admin email/password (set `ADMIN_EMAIL` and/or `ADMIN_PASSWORD` in `apps/server/.env`)
