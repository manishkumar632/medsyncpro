"use client";

const brands = [
    { name: "Cipla", tagline: "Caring for Life", color: "#e53935" },
    { name: "Himalaya", tagline: "Since 1930", color: "#2e7d32" },
    { name: "Dr. Reddy's", tagline: "Good Health Can't Wait", color: "#1565c0" },
    { name: "Sun Pharma", tagline: "Reaching People", color: "#ff8f00" },
    { name: "Abbott", tagline: "Life. To the Fullest.", color: "#00838f" },
    { name: "Mankind", tagline: "Serving Mankind", color: "#6a1b9a" },
];

const FeaturedBrands = () => {
    return (
        <section className="section">
            <div className="section-header">
                <h2 className="section-title">Featured Brands</h2>
                <span className="section-view-all">
                    All Brands
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </span>
            </div>
            <div className="brands-grid">
                {brands.map((brand) => (
                    <div className="brand-card" key={brand.name}>
                        <span className="brand-logo" style={{ color: brand.color }}>{brand.name}</span>
                        <span className="brand-tagline">{brand.tagline}</span>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default FeaturedBrands;
