import { Navigation } from '@/components/navigation'

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      <Navigation />
      <div className="flex flex-col w-0 flex-1 overflow-hidden lg:ml-64">
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  )
}