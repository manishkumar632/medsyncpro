"use client";

const essentials = [
    { name: "Multivitamin Complete 90 caps", category: "Wellness", price: "₹599", original: "₹799", emoji: "🌿" },
    { name: "Organic Honey 500g", category: "Natural", price: "₹349", original: "₹449", emoji: "🍯" },
    { name: "Herbal Green Tea 25 bags", category: "Wellness", price: "₹199", original: "₹275", emoji: "🍵" },
    { name: "Ashwagandha Extract Caps", category: "Ayurvedic", price: "₹425", original: "₹599", emoji: "🌱" },
    { name: "Immunity Booster Syrup", category: "Wellness", price: "₹275", original: "₹375", emoji: "🛡️" },
    { name: "Biotin Hair & Nails Caps", category: "Supplement", price: "₹499", original: "₹650", emoji: "💇" },
    { name: "Electrolyte Powder Sachets", category: "Hydration", price: "₹149", original: "₹199", emoji: "💧" },
    { name: "Probiotics Daily 30 caps", category: "Gut Health", price: "₹549", original: "₹749", emoji: "🦠" },
];

const WellnessEssentials = () => {
    return (
        <div className="wellness-section">
            <div className="wellness-inner">
                <div className="section-header">
                    <h2 className="section-title">Wellness Essentials of the Week</h2>
                    <span className="section-view-all">
                        View All
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </span>
                </div>
                <div className="products-grid">
                    {essentials.map((product, i) => (
                        <div className="product-card" key={i}>
                            {i === 0 && <span className="product-badge new">PICK OF WEEK</span>}
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
            </div>
        </div>
    );
};

export default WellnessEssentials;
