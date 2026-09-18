import { useEffect, useState } from "react";

function EnglishVideo({
    topic,
    topicIndex,
    jobId,
    setPage
}) {

    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // ========================================
    // Load English Video
    // ========================================

    useEffect(() => {

        if (!jobId || topicIndex === undefined) {
            return;
        }


        const loadVideo = () => {

            fetch(
                `http://localhost:5000/api/jobs/${jobId}/topics/${topicIndex}/video`
            )
                .then((response) => {

                    if (!response.ok) {
                        throw new Error(
                            "Failed to fetch video"
                        );
                    }

                    return response.json();
                })
                .then((data) => {

                    console.log(
                        "English Video API Response:",
                        data
                    );

                    setVideo(
                        data.video || null
                    );

                    setLoading(false);
                    setError("");
                })
                .catch((error) => {

                    console.error(
                        "Video fetch error:",
                        error
                    );

                    setError(
                        "Failed to load English video."
                    );

                    setLoading(false);
                });

        };


        // First load
        loadVideo();


        // Refresh every 3 seconds
        const interval = setInterval(
            loadVideo,
            3000
        );


        return () => {
            clearInterval(interval);
        };

    }, [jobId, topicIndex]);


    return (

        <div
            style={{
                padding: "30px",
                maxWidth: "1100px"
            }}
        >

            {/* Back */}

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


            {/* Title */}

            <h1>
                English Video
            </h1>


            <h2
                style={{
                    marginTop: "10px",
                    marginBottom: "25px"
                }}
            >
                {topic?.title}
            </h2>


            {/* Loading */}

            {loading && (
                <p>
                    Loading video...
                </p>
            )}


            {/* Error */}

            {error && (
                <p
                    style={{
                        color: "#dc2626"
                    }}
                >
                    {error}
                </p>
            )}


            {/* Video */}

            {!loading &&
                !error &&
                video && (

                    <div
                        style={{
                            border: "1px solid #d1d5db",
                            borderRadius: "8px",
                            padding: "15px",
                            background: "#f9fafb"
                        }}
                    >

                        <video
                            controls
                            style={{
                                width: "100%",
                                maxWidth: "1000px",
                                display: "block",
                                borderRadius: "6px"
                            }}
                        >

                            <source
                                src={
                                    `http://localhost:5000${video.url}`
                                }
                                type="video/mp4"
                            />

                            Your browser does not support
                            the video player.

                        </video>


                        <p
                            style={{
                                marginBottom: "0",
                                marginTop: "12px"
                            }}
                        >
                            <strong>
                                File:
                            </strong>{" "}
                            {video.name}
                        </p>

                    </div>
                )}


            {/* No Video */}

            {!loading &&
                !error &&
                !video && (

                    <p>
                        English video not generated yet.
                    </p>
                )}

        </div>

    );
}

export default EnglishVideo;