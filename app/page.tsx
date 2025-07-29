export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold">Conferio API</h1>
        <p className="text-lg">Next.js + Prisma + PostgreSQL</p>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100">
          <h2 className="mb-3 text-2xl font-semibold">
            Authentication
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            POST /api/auth/register - Register new user
            <br />
            POST /api/auth/login - Login user
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100">
          <h2 className="mb-3 text-2xl font-semibold">
            Events
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            POST /api/event/create - Create event
            <br />
            GET /api/event/all - Get user events
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100">
          <h2 className="mb-3 text-2xl font-semibold">
            Meetings
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            POST /api/meeting/public/create - Book meeting
            <br />
            GET /api/meeting/user/all - Get user meetings
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100">
          <h2 className="mb-3 text-2xl font-semibold">
            Integrations
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            GET /api/integration/all - Get integrations
            <br />
            GET /api/integration/connect/[appType] - Connect app
          </p>
        </div>
      </div>
    </main>
  )
}