import { useEffect, useState } from "react";

function Images({
    topic,
    topicIndex,
    jobId,
    setPage
}) {

    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // ========================================
    // Load Images
    // ========================================

    useEffect(() => {

        if (!jobId || topicIndex === undefined) {
            return;
        }


        const loadImages = () => {

            fetch(
                `http://localhost:5000/api/jobs/${jobId}/topics/${topicIndex}/images`
            )
                .then((response) => {

                    if (!response.ok) {
                        throw new Error(
                            "Failed to fetch images"
                        );
                    }

                    return response.json();
                })
                .then((data) => {

                    console.log(
                        "Images API Response:",
                        data
                    );

                    setImages(
                        data.images || []
                    );

                    setLoading(false);
                    setError("");
                })
                .catch((error) => {

                    console.error(
                        "Images fetch error:",
                        error
                    );

                    setError(
                        "Failed to load images."
                    );

                    setLoading(false);
                });

        };


        // First load
        loadImages();


        // Refresh every 3 seconds
        const interval = setInterval(
            loadImages,
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
                Images
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
                    Loading images...
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


            {/* No Images */}

            {!loading &&
                !error &&
                images.length === 0 && (

                    <p>
                        No images generated yet.
                    </p>
                )}


            {/* Images */}

            {!loading &&
                !error &&
                images.length > 0 && (

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fill, minmax(250px, 1fr))",
                            gap: "20px"
                        }}
                    >

                        {images.map((image, index) => (

                            <div
                                key={`${image.path}-${index}`}
                                style={{
                                    border: "1px solid #d1d5db",
                                    borderRadius: "8px",
                                    padding: "12px",
                                    background: "#f9fafb"
                                }}
                            >

                               <img
    src={`http://localhost:5000${image.url}`}
    alt={image.name}

    onClick={() => {
        window.open(
            `http://localhost:5000${image.url}`,
            "_blank"
        );
    }}

    style={{
        width: "100%",
        height: "220px",
        objectFit: "contain",
        background: "#ffffff",
        borderRadius: "6px",
        cursor: "pointer"
    }}
/>


                                <p
                                    style={{
                                        marginTop: "10px",
                                        marginBottom: "0",
                                        fontSize: "13px",
                                        wordBreak: "break-word"
                                    }}
                                >
                                    {image.name}
                                </p>

                            </div>

                        ))}

                    </div>
                )}

        </div>

    );
}

export default Images;