# NextGen

NextGen is a modern web application built with Next.js, Prisma, and Tailwind CSS. It features authentication powered by Clerk and UI components built with Radix UI and Shadcn.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Database ORM:** [Prisma](https://www.prisma.io/)
- **Authentication:** [Clerk](https://clerk.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Components:** [Radix UI](https://www.radix-ui.com/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand) & [React Query](https://tanstack.com/query/latest)
- **Testing:** Vitest & Playwright

## Getting Started

First, make sure to install the dependencies (assuming you use `npm`, `pnpm`, or `yarn`):

```bash
npm install
# or
pnpm install
# or
yarn install
```

### Environment Variables

Copy the `.env.example` file to `.env.local` and fill in the required environment variables:

```bash
cp .env.example .env.local
```

### Database Setup

Run the following commands to generate the Prisma client and push the schema to your database:

```bash
npm run db:generate
npm run db:push
```

If you have a seed file to populate the database with initial data:

```bash
npm run db:seed
```

### Running the Development Server

Start the development server:

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Scripts

- `dev`: Starts the development server.
- `build`: Builds the app for production.
- `start`: Runs the built app in production mode.
- `lint`: Lints the codebase.
- `typecheck`: Checks for TypeScript errors.
- `db:generate`: Generates Prisma client.
- `db:studio`: Opens Prisma Studio to view and edit data.
- `test`: Runs unit tests using Vitest.
- `test:e2e`: Runs end-to-end tests using Playwright.

## License

This project is licensed under the MIT License.
