import { useEffect, useState } from "react";

function HindiNarration({
    topic,
    topicIndex,
    jobId,
    setPage
}) {

    const [scenes, setScenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // ========================================
    // Load Hindi Narration
    // ========================================

    useEffect(() => {

        if (!jobId || topicIndex === undefined) {
            return;
        }


        const loadNarration = () => {

            fetch(
                `http://localhost:5000/api/jobs/${jobId}/topics/${topicIndex}/hindi-narration`
            )
                .then((response) => {

                    if (!response.ok) {
                        throw new Error(
                            "Failed to fetch Hindi narration"
                        );
                    }

                    return response.json();
                })
                .then((data) => {

                    console.log(
                        "Hindi Narration API Response:",
                        data
                    );

                    setScenes(
                        data.scenes || []
                    );

                    setLoading(false);
                    setError("");
                })
                .catch((error) => {

                    console.error(
                        "Hindi narration fetch error:",
                        error
                    );

                    setError(
                        "Failed to load Hindi narration."
                    );

                    setLoading(false);
                });

        };


        // First load
        loadNarration();


        // Refresh every 3 seconds
        const interval = setInterval(
            loadNarration,
            3000
        );


        return () => {
            clearInterval(interval);
        };

    }, [jobId, topicIndex]);


    return (

       <div
    style={{
        width: "100%",
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "30px",
        boxSizing: "border-box"
    }}
>

            {/* ========================================
                Back Button
            ======================================== */}

            <button
                onClick={() =>
                    setPage("topicDetail")
                }
              style={{
    padding: "11px 20px",
    marginBottom: "25px",

    background: "#ffffff",
    color: "#111827",

    border: "1px solid #d1d5db",
    borderRadius: "7px",

    fontSize: "14px",
    fontWeight: "600",

    cursor: "pointer",

    boxShadow:
        "0 2px 5px rgba(0, 0, 0, 0.08)"
}}
            >
                ← Back to Topic
            </button>


            {/* ========================================
                Title
            ======================================== */}

            <h1>
                Hindi Narration
            </h1>


            <h2
                style={{
                    marginTop: "10px",
                    marginBottom: "25px"
                }}
            >
                {topic?.title}
            </h2>


            {/* ========================================
                Loading
            ======================================== */}

            {loading && (
                <p>
                    Loading Hindi narration...
                </p>
            )}


            {/* ========================================
                Error
            ======================================== */}

            {error && (
                <p
                    style={{
                        color: "#dc2626"
                    }}
                >
                    {error}
                </p>
            )}


            {/* ========================================
                No Scenes
            ======================================== */}

            {!loading &&
                !error &&
                scenes.length === 0 && (

                    <p>
                        No Hindi narration found.
                    </p>
                )}


            {/* ========================================
                Scenes
            ======================================== */}

            {!loading &&
                !error &&
                scenes.length > 0 && (

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "15px"
                        }}
                    >

                        {scenes.map((scene) => (

                            <div
                                key={scene.scene}
                               style={{
    width: "100%",
    boxSizing: "border-box",

    border: "1px solid #d1d5db",
    borderRadius: "8px",

    padding: "20px",

    background: "#f9fafb"
}}
                            >

                                <h3
                                    style={{
                                        marginTop: "0",
                                        marginBottom: "15px"
                                    }}
                                >
                                    Scene {scene.scene}
                                </h3>


                                <pre
                                    style={{
                                        background: "#ffffff",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "6px",
                                        padding: "18px",

                                        whiteSpace: "pre-wrap",
                                        wordBreak: "break-word",

                                        lineHeight: "1.6",
                                        fontSize: "14px",

                                        fontFamily:
                                            "Segoe UI, Arial, sans-serif",

                                        overflowX: "auto"
                                    }}
                                >
                                    {JSON.stringify(
                                        scene,
                                        null,
                                        2
                                    )}
                                </pre>

                            </div>

                        ))}

                    </div>
                )}

        </div>

    );
}

export default HindiNarration;