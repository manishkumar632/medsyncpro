"use client";

const Footer = () => {
    return (
        <footer className="nexcart-footer">
            <div className="footer-inner">
                <div className="footer-grid">
                    {/* Brand Column */}
                    <div className="footer-brand">
                        <div className="footer-brand-name">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#14919b' }}>
                                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                <path d="M2 17l10 5 10-5" />
                                <path d="M2 12l10 5 10-5" />
                            </svg>
                            MedSyncpro
                        </div>
                        <p className="footer-brand-desc">
                            Your trusted online pharmacy. We deliver genuine medicines,
                            health products, and wellness essentials right to your doorstep
                            with care and reliability.
                        </p>
                        <div className="footer-social">
                            <span className="social-icon" title="Facebook">f</span>
                            <span className="social-icon" title="Twitter">𝕏</span>
                            <span className="social-icon" title="Instagram">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <rect x="2" y="2" width="20" height="20" rx="5" />
                                    <circle cx="12" cy="12" r="5" />
                                    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                                </svg>
                            </span>
                            <span className="social-icon" title="LinkedIn">in</span>
                            <span className="social-icon" title="YouTube">▶</span>
                        </div>
                    </div>

                    {/* Customer Service */}
                    <div className="footer-col">
                        <h4>Customer Service</h4>
                        <ul>
                            <li>Help Center</li>
                            <li>Track Order</li>
                            <li>Returns & Refunds</li>
                            <li>Shipping Info</li>
                            <li>FAQs</li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div className="footer-col">
                        <h4>Company</h4>
                        <ul>
                            <li>About Us</li>
                            <li>Careers</li>
                            <li>Blog</li>
                            <li>Press</li>
                            <li>Partner With Us</li>
                        </ul>
                    </div>

                    {/* Policies */}
                    <div className="footer-col">
                        <h4>Policies</h4>
                        <ul>
                            <li>Privacy Policy</li>
                            <li>Terms of Service</li>
                            <li>Return Policy</li>
                            <li>Cookie Policy</li>
                            <li>Disclaimer</li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="footer-col">
                        <h4>Contact</h4>
                        <ul>
                            <li>📧 support@nexcart.com</li>
                            <li>📞 1800-123-4567</li>
                            <li>📍 Mumbai, India</li>
                            <li>🕐 Mon-Sat: 9AM-9PM</li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="footer-bottom">
                    <p>© 2026 MedSyncpro. All rights reserved. Licensed Pharmacy.</p>
                    <div className="footer-payments">
                        <span className="payment-icon">VISA</span>
                        <span className="payment-icon">MC</span>
                        <span className="payment-icon">UPI</span>
                        <span className="payment-icon">GPay</span>
                        <span className="payment-icon">COD</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
