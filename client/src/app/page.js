import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';

export const dynamic = 'force-dynamic';

async function getProducts() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://antigravity-e-commerce-uv1a.vercel.app';
    const res = await fetch(`${apiUrl}/api/products`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error('Failed to fetch data');
    }
    return res.json();
  } catch (error) {
    console.error('Data Fetch Error:', error);
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();
  const featuredProducts = products.slice(0, 3);

  return (
    <div>
      <Hero />

      <section className="py-20 bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Featured Products</h2>
              <p className="text-gray-400">Top picks for this week</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
            {featuredProducts.length === 0 && (
              <div className="col-span-full text-center text-gray-500">
                No products found. Is the server running?
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
