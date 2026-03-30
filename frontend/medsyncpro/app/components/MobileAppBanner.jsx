"use client";

const MobileAppBanner = () => {
    return (
        <section className="section">
            <div className="app-banner">
                <div className="app-banner-text">
                    <h2>Download the<br />MedSyncpro App</h2>
                    <p>
                        Get exclusive app-only deals, track your orders in real-time,
                        set medication reminders, and enjoy seamless health shopping on the go.
                    </p>
                    <div className="app-store-btns">
                        <button className="store-btn dark-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                            </svg>
                            App Store
                        </button>
                        <button className="store-btn outline-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3.18 23.79l8.49-4.87-2.4-2.63-6.09 7.5zm.8-23.58l9.54 10.47 2.79-3.08L3.98.21zM20.63 10.73l-3.54-1.96-3.17 3.5 3.17 3.47 3.54-1.96c.97-.54.97-2.51 0-3.05zM4.2 1.18l10.57 11.59-10.57 11.59V1.18z" />
                            </svg>
                            Google Play
                        </button>
                    </div>
                </div>

                <div className="app-phone">
                    <div className="phone-mockup">
                        <div className="phone-notch"></div>
                        <div className="phone-screen">
                            <div className="phone-screen-logo">MedSyncpro</div>
                            <div className="phone-screen-text">Your Health, Delivered</div>
                            <div className="phone-screen-grid">
                                <div className="phone-grid-item">💊</div>
                                <div className="phone-grid-item">🧴</div>
                                <div className="phone-grid-item">🩺</div>
                                <div className="phone-grid-item">👶</div>
                                <div className="phone-grid-item">🧼</div>
                                <div className="phone-grid-item">💪</div>
                                <div className="phone-grid-item">🐕</div>
                                <div className="phone-grid-item">✨</div>
                                <div className="phone-grid-item">🫀</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MobileAppBanner;
