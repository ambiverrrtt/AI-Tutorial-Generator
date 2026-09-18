function Home({ setPage }) {

    return (

        <div
            style={{
                minHeight: "calc(100vh - 70px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px",
                background: "#f8fafc"
            }}
        >

            <div
                style={{
                    width: "100%",
                    maxWidth: "850px",
                    textAlign: "center",
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "14px",
                    padding: "60px 40px",
                    boxShadow:
                        "0 4px 15px rgba(0, 0, 0, 0.06)"
                }}
            >

                {/* Small Heading */}

                <p
                    style={{
                        margin: "0 0 12px",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#64748b",
                        letterSpacing: "1px",
                        textTransform: "uppercase"
                    }}
                >
                    AI Powered Education
                </p>


                {/* Main Heading */}

                <h1
                    style={{
                        margin: "0",
                        fontSize: "38px",
                        lineHeight: "1.2",
                        color: "#111827"
                    }}
                >
                    NCERT Tutorial Generator
                </h1>


                {/* Description */}

                <p
                    style={{
                        maxWidth: "650px",
                        margin:
                            "20px auto 30px",
                        fontSize: "16px",
                        lineHeight: "1.7",
                        color: "#64748b"
                    }}
                >
                    Generate and monitor educational
                    tutorials from NCERT content.
                    View topics, narration, images,
                    videos and pipeline progress
                    in one place.
                </p>


                {/* Button */}

                <button
                    onClick={() =>
                        setPage("jobs")
                    }
                    style={{
                        padding: "12px 24px",
                        fontSize: "15px",
                        fontWeight: "600",

                        color: "#ffffff",
                        background: "#111827",

                        border: "none",
                        borderRadius: "8px",

                        cursor: "pointer",

                        transition:
                            "background 0.2s"
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                            "#374151";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                            "#111827";
                    }}
                >
                    View Jobs →
                </button>


                {/* Simple Features */}

                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "15px",
                        flexWrap: "wrap",
                        marginTop: "45px"
                    }}
                >

                    <div
                        style={{
                            padding: "10px 18px",
                            borderRadius: "7px",
                            background: "#f1f5f9",
                            color: "#475569",
                            fontSize: "13px"
                        }}
                    >
                        NCERT Content
                    </div>


                    <div
                        style={{
                            padding: "10px 18px",
                            borderRadius: "7px",
                            background: "#f1f5f9",
                            color: "#475569",
                            fontSize: "13px"
                        }}
                    >
                        AI Narration
                    </div>


                    <div
                        style={{
                            padding: "10px 18px",
                            borderRadius: "7px",
                            background: "#f1f5f9",
                            color: "#475569",
                            fontSize: "13px"
                        }}
                    >
                        Image & Video
                    </div>


                    <div
                        style={{
                            padding: "10px 18px",
                            borderRadius: "7px",
                            background: "#f1f5f9",
                            color: "#475569",
                            fontSize: "13px"
                        }}
                    >
                        Pipeline Monitoring
                    </div>

                </div>

            </div>

        </div>

    );
}

export default Home;