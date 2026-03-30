"use client";

const DealsOfTheDay = () => {
    return (
        <section className="section">
            <div className="deals-of-day">
                <div className="deals-text">
                    <span className="deals-label">⚡ Deals of the Day</span>
                    <h2 className="deals-title">
                        Health First Complete<br />
                        Wellness Package
                    </h2>
                    <p className="deals-subtitle">
                        Get the complete health checkup kit with glucometer, BP monitor,
                        thermometer and pulse oximeter — everything you need for home healthcare.
                    </p>
                    <div className="deals-price">
                        <span className="now">₹2,499</span>
                        <span className="was">₹4,999</span>
                    </div>
                    <button className="deals-cta">
                        Grab This Deal
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
                <div className="deals-image">
                    🏥
                </div>
            </div>
        </section>
    );
};

export default DealsOfTheDay;
