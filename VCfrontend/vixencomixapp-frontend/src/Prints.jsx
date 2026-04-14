export default function Prints() {
  const prints = [
    {
      title: "Prints Coming Soon!",
      description: "We are currently preparing high-quality prints for the shop. Stay tuned!",
      price: "TBA"
    }
  ];

  // Check if we actually have inventory or just the placeholder
  const isComingSoon = prints.length === 1 && prints[0].title === "Prints Coming Soon!";

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-8">Care for a Print?</h2>
      
      {isComingSoon ? (
        /* Single, Centered Coming Soon Card */
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-8 text-center border-t-4 border-purple-600">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">{prints[0].title}</h3>
          <p className="text-gray-600 mb-6">{prints[0].description}</p>
          <div className="inline-block bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-semibold">
            Store Launching Soon
          </div>
        </div>
      ) : (
        /* Normal Grid view for when you have multiple prints */
        <>
          <p className="text-center mb-8">Check out these prints of your favorite Vixen characters!</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prints.map((print, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-4">
                {print.image && (
                  <img src={print.image} alt={print.title} className="w-full h-48 object-cover rounded mb-4" />
                )}
                <h3 className="text-xl font-semibold mb-2">{print.title}</h3>
                <p className="text-gray-600 mb-2">{print.description}</p>
                <p className="text-lg font-bold text-purple-600">{print.price}</p>
                <button className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}