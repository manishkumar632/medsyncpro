"use client";

export default function NotFound() {
    return (
        <div style={styles.page}>
            {/* Sadness Character Image */}
            <div style={styles.characterContainer}>
                <img
                    src="/online-medication/Sadness.png"
                    alt="Sadness character crying"
                    style={styles.characterImage}
                />
            </div>

            {/* Error Text */}
            <div style={styles.textContainer}>
                <h1 style={styles.title}>Awww...Don&rsquo;t Cry.</h1>
                <p style={styles.subtitle}>It&rsquo;s just a <span style={styles.errorCode}>404</span> Error!</p>
                <p style={styles.description}>
                    What you&rsquo;re looking for may have been<br />
                    misplaced in <strong>Long Term Memory</strong>.
                </p>
                <a href="/online-medication" style={styles.homeBtn}>
                    Go Back Home
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ marginLeft: 8 }}>
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </a>
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "60px",
        padding: "40px 80px",
        background: "linear-gradient(180deg, #f8fbff 0%, #ffffff 50%, #f0f5fa 100%)",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        overflow: "hidden",
    },
    characterContainer: {
        flexShrink: 0,
    },
    characterImage: {
        width: "340px",
        height: "auto",
        objectFit: "contain",
    },
    textContainer: {
        maxWidth: "420px",
    },
    title: {
        fontSize: "2.8rem",
        fontWeight: 700,
        color: "#1a1a2e",
        lineHeight: 1.2,
        marginBottom: "12px",
        letterSpacing: "-0.02em",
    },
    subtitle: {
        fontSize: "1.15rem",
        color: "#555",
        marginBottom: "20px",
        fontWeight: 400,
    },
    errorCode: {
        fontWeight: 700,
        color: "#5B8DD9",
        fontSize: "1.2rem",
    },
    description: {
        fontSize: "1.05rem",
        color: "#777",
        lineHeight: 1.7,
        marginBottom: "32px",
    },
    homeBtn: {
        display: "inline-flex",
        alignItems: "center",
        padding: "14px 32px",
        background: "#5B8DD9",
        color: "#fff",
        fontSize: "0.9rem",
        fontWeight: 600,
        borderRadius: "999px",
        textDecoration: "none",
        boxShadow: "0 4px 15px rgba(91, 141, 217, 0.3)",
    },
};
