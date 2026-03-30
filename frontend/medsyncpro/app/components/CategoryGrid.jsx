"use client";

const categoryData = {
    "Personal Care": [
        { name: "Dove Shampoo 340ml", price: "₹299", original: "₹375", emoji: "🧴" },
        { name: "Colgate Toothpaste 200g", price: "₹125", original: "₹155", emoji: "🪥" },
        { name: "Gillette Razor Pack", price: "₹349", original: "₹450", emoji: "🪒" },
        { name: "Lux Body Wash 250ml", price: "₹199", original: "₹250", emoji: "🚿" },
    ],
    "Diabetic Care": [
        { name: "Glucometer Test Strips", price: "₹499", original: "₹699", emoji: "🩸" },
        { name: "Sugar Free Gold 500 tab", price: "₹225", original: "₹299", emoji: "🍬" },
        { name: "Diabetic Foot Cream", price: "₹349", original: "₹450", emoji: "🦶" },
        { name: "Insulin Syringe Pack", price: "₹189", original: "₹249", emoji: "💉" },
    ],
    "Pet Care": [
        { name: "Dog Shampoo 500ml", price: "₹349", original: "₹450", emoji: "🐕" },
        { name: "Cat Food Premium 1kg", price: "₹599", original: "₹750", emoji: "🐈" },
        { name: "Pet Vitamin Drops", price: "₹275", original: "₹375", emoji: "💧" },
        { name: "Flea & Tick Collar", price: "₹449", original: "₹599", emoji: "🦮" },
    ],
    "Skin Care": [
        { name: "Neutrogena Moisturizer", price: "₹499", original: "₹650", emoji: "✨" },
        { name: "Bioderma Micellar Water", price: "₹699", original: "₹899", emoji: "💦" },
        { name: "La Shield Sunscreen", price: "₹389", original: "₹499", emoji: "☀️" },
        { name: "Minimalist Retinol Serum", price: "₹549", original: "₹699", emoji: "🧪" },
    ],
    "Diapers": [
        { name: "Pampers All-Round Pack", price: "₹799", original: "₹999", emoji: "👶" },
        { name: "MamyPoko Pants L 64", price: "₹849", original: "₹1,049", emoji: "🩲" },
        { name: "Huggies Wonder Pants", price: "₹649", original: "₹799", emoji: "👼" },
        { name: "Adult Diapers Pack 10", price: "₹499", original: "₹650", emoji: "🏥" },
    ],
    "Supplement": [
        { name: "Omega-3 Fish Oil Caps", price: "₹449", original: "₹599", emoji: "🐟" },
        { name: "Multivitamin Daily Plus", price: "₹399", original: "₹550", emoji: "💊" },
        { name: "Calcium + Vitamin D3", price: "₹349", original: "₹475", emoji: "🦴" },
        { name: "Iron Folic Acid Tablets", price: "₹199", original: "₹275", emoji: "🩸" },
    ],
    "Baby Care": [
        { name: "Johnson Baby Powder", price: "₹175", original: "₹210", emoji: "👶" },
        { name: "Himalaya Baby Lotion", price: "₹225", original: "₹299", emoji: "🧴" },
        { name: "Cerelac Stage 1 300g", price: "₹249", original: "₹299", emoji: "🥣" },
        { name: "Baby Wet Wipes 72s", price: "₹149", original: "₹199", emoji: "🧻" },
    ],
};

const CategoryGrid = () => {
    return (
        <div className="section">
            {Object.entries(categoryData).map(([categoryName, products]) => (
                <div className="category-section" key={categoryName}>
                    <div className="category-section-header">
                        <h3 className="category-section-title">
                            <span className="dot"></span>
                            {categoryName}
                        </h3>
                        <span className="section-view-all">
                            View All
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </span>
                    </div>
                    <div className="products-grid">
                        {products.map((product, i) => (
                            <div className="product-card" key={i}>
                                <div className="product-wishlist">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                    </svg>
                                </div>
                                <div className="product-image">
                                    <div className="product-img-placeholder">{product.emoji}</div>
                                </div>
                                <div className="product-info">
                                    <div className="product-category-label">{categoryName}</div>
                                    <div className="product-name">{product.name}</div>
                                    <div className="product-price">
                                        <span className="current">{product.price}</span>
                                        <span className="original">{product.original}</span>
                                    </div>
                                    <button className="product-add-btn">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                        </svg>
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CategoryGrid;
