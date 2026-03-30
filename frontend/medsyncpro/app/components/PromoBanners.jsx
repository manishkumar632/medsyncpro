"use client";

const PromoBanners = () => {
    return (
        <section className="section">
            <div className="promo-banners">
                <div className="promo-card teal">
                    <div className="promo-text">
                        <h3>Immunity Boosters<br />Up to 40% Off</h3>
                        <p>Strengthen your health with trusted supplements</p>
                        <button className="promo-btn">
                            Shop Now
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                    <span className="promo-emoji">🛡️</span>
                </div>
                <div className="promo-card dark">
                    <div className="promo-text">
                        <h3>Baby Care Essentials<br />Starting ₹149</h3>
                        <p>Safe & gentle products for your little one</p>
                        <button className="promo-btn">
                            Explore
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                    <span className="promo-emoji">👶</span>
                </div>
            </div>
        </section>
    );
};

export default PromoBanners;
