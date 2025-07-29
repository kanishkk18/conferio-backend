# Conferio - Next.js Meeting Scheduling API

A modern meeting scheduling API built with Next.js, Prisma, and PostgreSQL.

## Features

- **Authentication**: JWT-based user authentication
- **Event Management**: Create, update, and manage events
- **Meeting Scheduling**: Book meetings with availability checking
- **Calendar Integration**: Google Calendar integration
- **Availability Management**: Set and manage user availability
- **Public Booking**: Allow guests to book meetings without accounts

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **Validation**: Zod schemas
- **Calendar**: Google Calendar API
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Google OAuth credentials

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Fill in your database URL, JWT secret, and Google OAuth credentials.

4. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Events
- `POST /api/event/create` - Create a new event
- `GET /api/event/all` - Get user's events
- `PUT /api/event/toggle-privacy` - Toggle event privacy
- `DELETE /api/event/[eventId]` - Delete an event
- `GET /api/event/public/[username]` - Get public events by username
- `GET /api/event/public/[username]/[slug]` - Get specific public event

### Availability
- `GET /api/availability/me` - Get user's availability
- `PUT /api/availability/update` - Update availability
- `GET /api/availability/public/[eventId]` - Get availability for public event

### Meetings
- `GET /api/meeting/user/all` - Get user's meetings
- `POST /api/meeting/public/create` - Create a meeting (public)
- `PUT /api/meeting/cancel/[meetingId]` - Cancel a meeting

### Integrations
- `GET /api/integration/all` - Get user's integrations
- `GET /api/integration/check/[appType]` - Check integration status
- `GET /api/integration/connect/[appType]` - Connect to integration
- `GET /api/integration/google/callback` - Google OAuth callback

## Database Schema

The application uses the following main entities:

- **User**: User accounts with authentication
- **Event**: Schedulable events created by users
- **Meeting**: Booked meetings between users and guests
- **Availability**: User availability settings
- **DayAvailability**: Daily availability slots
- **Integration**: Third-party service integrations

## Development

### Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes to database
npm run db:push

# Create and run migrations
npm run db:migrate

# Open Prisma Studio
npm run db:studio
```

### Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── lib/                   # Utility libraries
│   ├── prisma.ts          # Prisma client
│   ├── auth.ts            # Authentication utilities
│   ├── config.ts          # Configuration
│   ├── errors.ts          # Error classes
│   ├── middleware.ts      # API middleware
│   ├── oauth.ts           # OAuth configuration
│   ├── utils.ts           # General utilities
│   └── validation.ts      # Zod schemas
├── prisma/                # Prisma configuration
│   └── schema.prisma      # Database schema
└── package.json           # Dependencies and scripts
```

## License

MIT License