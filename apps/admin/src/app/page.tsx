export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6">
        <h1 className="text-xl font-bold mb-8">Rally Admin</h1>
        <nav className="space-y-2">
          <a href="/" className="block px-4 py-2 rounded bg-gray-800">Dashboard</a>
          <a href="/customers" className="block px-4 py-2 rounded hover:bg-gray-800">Customers</a>
          <a href="/transactions" className="block px-4 py-2 rounded hover:bg-gray-800">Transactions</a>
          <a href="/assets" className="block px-4 py-2 rounded hover:bg-gray-800">Assets</a>
          <a href="/settings" className="block px-4 py-2 rounded hover:bg-gray-800">Settings</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Customers" value="--" />
          <StatCard title="Points Issued" value="--" />
          <StatCard title="Pending Reviews" value="--" />
        </div>
        <p className="mt-8 text-gray-500">
          Rally Customer Engagement Platform v0.1.0 - Phase 1 Scaffold
        </p>
      </main>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
    </div>
  );
}
