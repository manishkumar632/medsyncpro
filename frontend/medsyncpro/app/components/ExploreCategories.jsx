"use client";

const categories = [
    { name: "Medicine", icon: "💊", bgClass: "medicine" },
    { name: "Skincare", icon: "🧴", bgClass: "skincare" },
    { name: "Baby Care", icon: "🍼", bgClass: "babycare" },
    { name: "Equipment", icon: "🩺", bgClass: "equipment" },
    { name: "Personal Care", icon: "🧼", bgClass: "personalcare" },
];

const ExploreCategories = () => {
    return (
        <section className="section">
            <div className="section-header">
                <h2 className="section-title">Explore Categories</h2>
                <span className="section-view-all">
                    View All
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </span>
            </div>
            <div className="categories-grid">
                {categories.map((cat) => (
                    <div className="category-card" key={cat.name}>
                        <div className={`category-icon ${cat.bgClass}`}>
                            {cat.icon}
                        </div>
                        <span className="category-name">{cat.name}</span>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ExploreCategories;
