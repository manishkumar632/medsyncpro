"use client";

const products = [
    { name: "Vitamin D3 Supplement", category: "Supplements", price: "₹349", original: "₹499", discount: "30% OFF", badge: "hot", emoji: "💊" },
    { name: "Cetaphil Face Wash", category: "Skincare", price: "₹445", original: "₹595", discount: "25% OFF", badge: "sale", emoji: "🧴" },
    { name: "Digital Thermometer", category: "Equipment", price: "₹299", original: "₹450", discount: "33% OFF", badge: "hot", emoji: "🌡️" },
    { name: "Baby Diaper Premium Pack", category: "Baby Care", price: "₹699", original: "₹999", discount: "30% OFF", badge: "sale", emoji: "👶" },
    { name: "Protein Powder 1kg", category: "Supplements", price: "₹1,299", original: "₹1,799", discount: "28% OFF", badge: "hot", emoji: "💪" },
    { name: "Antiseptic Liquid 500ml", category: "Medicine", price: "₹145", original: "₹199", discount: "27% OFF", badge: "sale", emoji: "🧪" },
    { name: "Sunscreen SPF 50+", category: "Skincare", price: "₹389", original: "₹549", discount: "29% OFF", badge: "hot", emoji: "☀️" },
    { name: "Blood Pressure Monitor", category: "Equipment", price: "₹1,599", original: "₹2,499", discount: "36% OFF", badge: "sale", emoji: "🫀" },
];

const DealHotOfMonth = () => {
    return (
        <section className="section">
            <div className="section-header">
                <h2 className="section-title">Deal Hot of the Month 🔥</h2>
                <span className="section-view-all">
                    View All Deals
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </span>
            </div>
            <div className="products-grid">
                {products.map((product, i) => (
                    <div className="product-card" key={i}>
                        <span className={`product-badge ${product.badge === "hot" ? "hot" : ""}`}>
                            {product.discount}
                        </span>
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
                                <span className="discount">{product.discount}</span>
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

export default DealHotOfMonth;
