import AdminSidebar from '@/components/admin/Sidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <AdminSidebar />
      <main className="md:ml-64 min-h-screen transition-all duration-300 pt-16 md:pt-0">
        {children}
      </main>
    </div>
  )
}
