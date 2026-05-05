export default function CustomerHome() {
  return (
    <div className="max-w-md mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Rally Rewards</h1>
        <p className="text-gray-500 mt-1">Your loyalty, rewarded</p>
      </div>

      {/* Points Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white mb-6">
        <p className="text-sm opacity-80">Points Balance</p>
        <p className="text-4xl font-bold mt-1">--</p>
        <p className="text-sm opacity-80 mt-4">Tier: --</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <QuickAction icon="receipt" label="Upload Receipt" />
        <QuickAction icon="car" label="My Vehicles" />
        <QuickAction icon="history" label="History" />
        <QuickAction icon="gift" label="Rewards" />
      </div>

      <p className="text-center text-gray-400 text-sm mt-8">
        Rally v0.1.0 - Phase 1 Scaffold
      </p>
    </div>
  );
}

function QuickAction({ icon, label }: { icon: string; label: string }) {
  return (
    <button className="bg-gray-50 rounded-xl p-4 text-center hover:bg-gray-100 transition">
      <div className="text-2xl mb-2">{icon === 'receipt' ? '\u{1F4C4}' : icon === 'car' ? '\u{1F697}' : icon === 'history' ? '\u{1F4CA}' : '\u{1F381}'}</div>
      <p className="text-sm font-medium text-gray-700">{label}</p>
    </button>
  );
}
