export default function Prints() {
  const prints = [
    {
      title: "Halloween 2022",
      description: "A Halloween-themed print featuring Amanda and Lili under the moonlight.",
      image: "https://64.media.tumblr.com/8af62a01767a5aebfb90bc125e7f0df0/9d59f92447e2c115-a7/s1280x1920/ab001d2a6aed9edf36d42254a3f8675318f44796.jpg"
    },
    {
      title: "Vixen Portrait",
      description: "A stylized portrait study of the Vixen Comix heroine in vibrant color.",
      image: "/prints/vixen-portrait.jpg"
    },
    {
      title: "Vale of Wales Landscape",
      description: "The Welsh Otherworld rendered as a cinematic landscape scene.",
      image: "/prints/vale-of-wales-landscape.jpg"
    }
  ];

  const isComingSoon = prints.length === 0;

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-4">Vixen Prints Gallery</h2>
      <p className="text-center mb-10 text-gray-600 max-w-2xl mx-auto">
        Browse the current collection of artwork from Vixen Comix. Enjoy our gallery!
      </p>

      {isComingSoon ? (
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-8 text-center border-t-4 border-purple-600">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Gallery Coming Soon</h3>
          <p className="text-gray-600 mb-6">Artwork is being prepared for the gallery. Check back soon for new prints.</p>
          <div className="inline-block bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-semibold">
            Gallery Launching Soon
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prints.map((print, index) => (
            <div key={index} className="bg-white rounded-3xl shadow-xl overflow-hidden hover:-translate-y-1 transition-transform duration-200">
              {print.image ? (
                <img src={print.image} alt={print.title} className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                  Image coming soon
                </div>
              )}
              <div className="p-5">
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{print.title}</h3>
                <p className="text-gray-600">{print.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
