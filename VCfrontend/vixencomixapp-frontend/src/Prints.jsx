import React from "react";

export default function Prints() {
  const prints = [
    { title: "Vixen Portrait", description: "A stunning illustration of Vixen.", image: "/placeholder-print1.jpg", price: "$15" },
    { title: "Monster Sketch", description: "Hand-drawn monster artwork.", image: "/placeholder-print2.jpg", price: "$20" },
    { title: "Mystery Scene", description: "Atmospheric mystery illustration.", image: "/placeholder-print3.jpg", price: "$18" },
  ];

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-8">Care for a Print?</h2>
      <p className="text-center mb-8">Check out these prints of your favorite Vixen characters!</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prints.map((print, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-4">
            <img src={print.image} alt={print.title} className="w-full h-48 object-cover rounded mb-4" />
            <h3 className="text-xl font-semibold mb-2">{print.title}</h3>
            <p className="text-gray-600 mb-2">{print.description}</p>
            <p className="text-lg font-bold text-purple-600">{print.price}</p>
            <button className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">Buy Now</button>
          </div>
        ))}
      </div>
    </div>
  );
}