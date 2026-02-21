# ⚽ Football Club Manager

A web-based admin panel for managing a football club. Built with **Next.js**, **Prisma**, and **PostgreSQL**, it lets you track players, matches, payments, and goals all in one place.

## Features

- **Players** – Add and manage players with their jersey numbers, positions, and active status.
- **Matches** – Record match details including rival team, date, location, score, and squad.
- **Goals** – Log goals scored per match and per player.
- **Payments** – Track event-based payments (e.g. training fees, referee costs) for each player.

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Framework   | [Next.js](https://nextjs.org/) (App Router) |
| Database    | PostgreSQL via [Prisma ORM](https://www.prisma.io/) |
| Styling     | [Tailwind CSS](https://tailwindcss.com/) |
| Language    | TypeScript                          |
| Deployment  | Docker (multi-stage build)          |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [PostgreSQL](https://www.postgresql.org/) database
- [Docker](https://www.docker.com/) (optional, for containerised setup)

### Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

### Local Development

```bash
# Install dependencies
npm install

# Push the database schema
npx prisma db push

# (Optional) Seed the database with sample data
npx ts-node prisma/seed.ts

# Start the development server
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Docker

Build and run the application using Docker:

```bash
# Build the image
docker build -t football-admin .

# Run the container
docker run -p 3000:3000 -e DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE" football-admin
```

The container will automatically apply the database schema on startup before serving the app.

## Project Structure

```
src/
├── app/
│   ├── admin/
│   │   ├── players/    # Player management
│   │   ├── matches/    # Match management
│   │   ├── goals/      # Goal tracking
│   │   └── payments/   # Payment tracking
│   ├── actions/        # Server actions
│   ├── layout.tsx
│   └── page.tsx
├── components/         # Shared UI components
└── lib/                # Utility functions and Prisma client

prisma/
├── schema.prisma       # Database schema
└── seed.ts             # Database seed script
```

## Available Scripts

| Command          | Description                        |
|------------------|------------------------------------|
| `npm run dev`    | Start the development server       |
| `npm run build`  | Build for production               |
| `npm run start`  | Start the production server        |
| `npm run lint`   | Run ESLint                         |
