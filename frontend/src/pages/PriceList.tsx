import { Link } from 'react-router-dom'

interface PriceItem {
  name: string
  market: string
  size: string
  price: string
  updated: string
}

const products: PriceItem[] = [
  { name: 'Beans (brown)', market: 'Dugbe', size: '5kg', price: '₦15,000', updated: '5th June' },
  { name: 'Garri (white)', market: 'Bodija', size: '5kg', price: '₦15,000', updated: '5th June' },
  { name: 'Beans (white)', market: 'Dugbe', size: '5kg', price: '₦15,000', updated: '5th June' },
  { name: 'Cassava', market: 'Bodija', size: '5kg', price: '₦15,000', updated: '5th June' },
  { name: 'Flour', market: 'Gbagi', size: '5kg', price: '₦15,000', updated: '5th June' },
  { name: 'Garri (red)', market: 'Dugbe', size: '5kg', price: '₦15,000', updated: '5th June' },
  { name: 'Rice (local)', market: 'Bodija', size: '5kg', price: '₦15,000', updated: '5th June' },
  { name: 'Plantain', market: 'Gbagi', size: '5kg', price: '₦15,000', updated: '5th June' },
  { name: 'Chicken', market: 'Bodija', size: '5kg', price: '₦15,000', updated: '5th June' },
  { name: 'Noodles', market: 'Bodija', size: '5kg', price: '₦15,000', updated: '5th June' },
  { name: 'Yam', market: 'Bodija', size: '5kg', price: '₦15,000', updated: '5th June' },
  { name: 'Rice (foreign)', market: 'Gbagi', size: '5kg', price: '₦15,000', updated: '5th June' },
  { name: 'Tomatoes', market: 'Dugbe', size: '5kg', price: '₦15,000', updated: '5th June' },
  { name: 'Onions', market: 'Bodija', size: '5kg', price: '₦15,000', updated: '5th June' },
  { name: 'Maize', market: 'Gbagi', size: '5kg', price: '₦15,000', updated: '5th June' },
  { name: 'Fish (fresh fish)', market: 'Dugbe', size: '5kg', price: '₦15,000', updated: '5th June' },
  { name: 'Potato (irish)', market: 'Gbagi', size: '5kg', price: '₦15,000', updated: '5th June' },
  { name: 'Turkey', market: 'Bodija', size: '5kg', price: '₦15,000', updated: '5th June' },
  { name: 'Meat (beef)', market: 'Bodija', size: '5kg', price: '₦15,000', updated: '5th June' },
  { name: 'Pepper', market: 'Bodija', size: '5kg', price: '₦15,000', updated: '5th June' },
  { name: 'Vegetables', market: 'Bodija', size: '5kg', price: '₦15,000', updated: '5th June' },
  { name: 'Oil (vegetable oil)', market: 'Dugbe', size: '5kg', price: '₦15,000', updated: '5th June' },
  { name: 'Fish (crayfish)', market: 'Bodija', size: '5kg', price: '₦15,000', updated: '5th June' },
  { name: 'Cereal/Flakes', market: 'Gbagi', size: '5kg', price: '₦15,000', updated: '5th June' },
  { name: 'Egusi', market: 'Bodija', size: '5kg', price: '₦15,000', updated: '5th June' },
  { name: 'Chicken', market: 'Dugbe', size: '5kg', price: '₦15,000', updated: '5th June' },
  { name: 'Eggs', market: 'Bodija', size: '5kg', price: '₦15,000', updated: '5th June' },
  { name: 'Fish (stockfish)', market: 'Gbagi', size: '5kg', price: '₦15,000', updated: '5th June' },
  { name: 'Meat (goat)', market: 'Bodija', size: '5kg', price: '₦15,000', updated: '5th June' },
]

export default function PriceList() {
  return (
    <div className="min-h-screen bg-bg-grey">
      <div className="max-w-[797px] mx-auto flex flex-col">
        <div className="bg-[#262121] flex items-center justify-between px-[27px] py-[10px]">
          <h1 className="text-[37px] font-bold text-white leading-[31px] tracking-[-0.37px]" style={{ fontFamily: "'Neue Haas Grotesk Display Pro', 'Inter', sans-serif" }}>
            Current price of products
          </h1>
          <Link
            to="/submit"
            className="bg-white text-black border border-black rounded-[10px] flex items-center justify-center gap-2 px-10 py-[10px] text-base leading-[19px] hover:bg-gray-50 transition"
          >
            Update Price
            <span className="w-6 h-6 rounded-full border border-black flex items-center justify-center text-sm leading-none shrink-0 relative">
              <span className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <line x1="8" y1="12" x2="16" y2="12" stroke="black" strokeWidth="1.5" />
                  <line x1="12" y1="8" x2="12" y2="16" stroke="black" strokeWidth="1.5" />
                </svg>
              </span>
            </span>
          </Link>
        </div>

        <div className="bg-white rounded-[20px] mt-0">
          <div className="px-[59px] py-5 border-b border-days-grey">
            <div className="flex items-center gap-[136px]">
              <span className="text-base font-bold leading-5 tracking-[-0.24px] text-black">Products</span>
              <div className="flex items-center gap-[81px]">
                <span className="text-base font-bold leading-5 tracking-[-0.24px] text-black">Market</span>
                <span className="text-base font-bold leading-5 tracking-[-0.24px] text-black">Size</span>
                <span className="text-base font-bold leading-5 tracking-[-0.24px] text-black">Price</span>
                <span className="text-base font-bold leading-5 tracking-[-0.24px] text-black">Updated</span>
              </div>
            </div>
          </div>

          <div className="px-[30px]">
            {products.map((p, i) => (
              <div
                key={i}
                className="flex items-center gap-[78px] border-b border-days-grey min-h-[84px]"
              >
                <div className="flex items-center gap-[27px] w-[172px] shrink-0">
                  <div className="w-[18px] h-[18px] rounded-full border border-black shrink-0" />
                  <span className="text-base leading-6 tracking-[-0.24px] text-black">
                    {p.name}
                  </span>
                </div>
                <div className="flex items-center gap-[61px]">
                  <span className="w-[69px] text-base leading-5 tracking-[-0.24px] text-black text-center">{p.market}</span>
                  <span className="w-[48px] text-base leading-5 tracking-[-0.24px] text-black text-center">{p.size}</span>
                  <span className="w-[82px] text-base leading-5 tracking-[-0.24px] text-black text-center">{p.price}</span>
                  <span className="w-[85px] text-base leading-5 tracking-[-0.24px] text-black text-center">{p.updated}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
