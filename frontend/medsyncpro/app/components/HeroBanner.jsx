"use client";

const HeroBanner = () => {
    return (
        <section className="hero-banner">
            {/* Floating decorative elements */}
            <div className="hero-float hero-float-1"></div>
            <div className="hero-float hero-float-2"></div>
            <div className="hero-float hero-float-3"></div>

            <div className="hero-content">
                <div className="hero-text">
                    <span className="hero-badge">✨ Limited Time Offer</span>
                    <h1 className="hero-title">
                        Flat <span>20% Off</span><br />
                        Your First Order
                    </h1>
                    <p className="hero-subtitle">
                        Discover genuine medicines, wellness products, and healthcare essentials delivered straight to your doorstep.
                    </p>
                    <button className="hero-cta">
                        Shop Now
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                <div className="hero-image">
                    <img src="/online-medication/images/hero-banner.png" alt="Healthcare products" />
                </div>
            </div>

            {/* Dots */}
            <div className="hero-dots">
                <span className="hero-dot active"></span>
                <span className="hero-dot"></span>
                <span className="hero-dot"></span>
                <span className="hero-dot"></span>
            </div>
        </section>
    );
};

export default HeroBanner;
