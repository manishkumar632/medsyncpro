"use client";

const topProducts = [
    { name: "Dolo 650mg Tablet", category: "Medicine", price: "₹30", original: "₹35", emoji: "💊" },
    { name: "Himalaya Neem Face Wash", category: "Skincare", price: "₹189", original: "₹225", emoji: "🧴" },
    { name: "Ensure Protein Powder", category: "Supplement", price: "₹799", original: "₹999", emoji: "🥤" },
    { name: "Oximeter Pulse Monitor", category: "Equipment", price: "₹599", original: "₹899", emoji: "🫁" },
    { name: "Crocin Advance Tablet", category: "Medicine", price: "₹25", original: "₹30", emoji: "💉" },
    { name: "Pampers Baby Diapers", category: "Baby Care", price: "₹649", original: "₹849", emoji: "🧒" },
    { name: "Nivea Body Lotion", category: "Personal Care", price: "₹249", original: "₹325", emoji: "🧴" },
    { name: "Sugar Check Glucometer", category: "Diabetic Care", price: "₹899", original: "₹1,299", emoji: "🩸" },
];

const TopSelling = () => {
    return (
        <section className="section">
            <div className="section-header">
                <h2 className="section-title">Top Selling</h2>
                <span className="section-view-all">
                    View All
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </span>
            </div>
            <div className="products-grid">
                {topProducts.map((product, i) => (
                    <div className="product-card" key={i}>
                        {i < 3 && <span className="product-badge new">BEST SELLER</span>}
                        <div className="product-wishlist">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                        </div>
                        <div className="product-image">
                            <div className="product-img-placeholder">{product.emoji}</div>
                        </div>
                        <div className="product-info">
                            <div className="product-category-label">{product.category}</div>
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
        </section>
    );
};

export default TopSelling;
