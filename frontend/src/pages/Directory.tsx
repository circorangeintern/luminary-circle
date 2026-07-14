const markets = [
  { name: 'Bodija Market', location: 'Ibadan, Oyo', products: ['Rice', 'Beans', 'Tomatoes', 'Garri', 'Palm oil'] },
  { name: 'Dugbe Market', location: 'Ibadan, Oyo', products: ['Rice', 'Beans', 'Tomatoes', 'Garri', 'Palm oil'] },
  { name: 'Gbagi Market', location: 'Ibadan, Oyo', products: ['Rice', 'Beans', 'Tomatoes', 'Garri', 'Palm oil'] },
]

export default function Directory() {
  return (
    <main className="max-w-5xl mx-auto px-6 sm:px-12 lg:px-20 py-20">
      <h1 className="text-3xl font-bold mb-8">Market Directory</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {markets.map((m) => (
          <div key={m.name} className="border border-grey-border rounded-xl p-6 bg-white">
            <h2 className="text-xl font-semibold mb-1">{m.name}</h2>
            <p className="text-sm text-gray-600 mb-3">{m.location}</p>
            <div className="flex gap-2 flex-wrap">
              {m.products.map((p) => (
                <span key={p} className="bg-input-bg border border-input-border rounded-lg px-3 py-1 text-xs">{p}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
