import { useEffect, useState } from "react";

function TopicDetail({
    topic,
    topicIndex,
    jobId,
    setPage
}) {

    const [progress, setProgress] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // ========================================
    // Load Progress
    // ========================================

    useEffect(() => {

        if (!jobId || topicIndex === undefined) {
            return;
        }

        const loadProgress = () => {

            fetch(
                `http://localhost:5000/api/jobs/${jobId}/topics/${topicIndex}/progress`
            )
                .then((response) => {

                    if (!response.ok) {
                        throw new Error(
                            "Failed to fetch progress"
                        );
                    }

                    return response.json();
                })
                .then((data) => {

                    console.log(
                        "Topic Progress:",
                        data
                    );

                    setProgress(
                        data.progress || {}
                    );

                    setLoading(false);
                    setError("");
                })
                .catch((error) => {

                    console.error(
                        "Progress fetch error:",
                        error
                    );

                    setError(
                        "Failed to load progress."
                    );

                    setLoading(false);
                });
        };


        // First load
        loadProgress();


        // Refresh every 3 seconds
        const interval = setInterval(
            loadProgress,
            3000
        );


        return () => {
            clearInterval(interval);
        };

    }, [jobId, topicIndex]);


    // ========================================
    // No Topic
    // ========================================

    if (!topic) {

        return (
            <div
                style={{
                    padding: "40px"
                }}
            >

                <h2>
                    Topic not found.
                </h2>

                <button
                    onClick={() =>
                        setPage("topics")
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
                    ← Back to Topics
                </button>

            </div>
        );

    }


    // ========================================
    // Get Status
    // ========================================

    const getStatus = (value) => {

        if (value === true) {
            return "Complete";
        }

        if (
            value === "processing" ||
            value === "running"
        ) {
            return "Processing";
        }

        return "Pending";
    };


    // ========================================
    // Pipeline Stages
    // ========================================

    const stages = [

        {
    name: "Narration",
    key: "narration",
    clickable: true
},

        {
            name: "Reviewed Narration",
            key: "reviewed-narration",
            clickable: true
        },

        {
    name: "Image",
    key: "images",
    clickable: true
},

        {
            name: "Audio",
            key: "audio"
        },

       {
    name: "English Video",
    key: "merge",
    clickable: true
},

        {
            name: "Hindi Narration",
            key: "hindi-narration",
            clickable: true
        },

        {
            name: "Hindi Audio",
            key: "hindi-audio"
        },

        {
            name: "Hindi Video",
            key: "hindi-merge",
            clickable: true
        }

    ];


    return (

        <div
            style={{
                padding: "30px",
                maxWidth: "1100px"
            }}
        >

            {/* ========================================
                Back Button
            ======================================== */}

            <button
                onClick={() =>
                    setPage("topics")
                }
                style={{
                    padding: "9px 16px",
                    marginBottom: "20px",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer"
                }}
            >
                ← Back to Topics
            </button>


            {/* ========================================
                Topic Title
            ======================================== */}

            <h1
                style={{
                    marginBottom: "20px"
                }}
            >
                {topic.title}
            </h1>


            {/* ========================================
                Topic Details
            ======================================== */}

            <div
                style={{
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    padding: "20px",
                    background: "#f9fafb"
                }}
            >

                <p>
                    <strong>ID:</strong>{" "}
                    {topic.id}
                </p>

                <p>
                    <strong>Section:</strong>{" "}
                    {topic.sectionNumber || "-"}
                </p>

                <p>
                    <strong>Type:</strong>{" "}
                    {topic.type || "-"}
                </p>

                <p>
                    <strong>Start Heading:</strong>{" "}
                    {topic.startHeading || "-"}
                </p>

                <p
                    style={{
                        marginBottom: "0"
                    }}
                >
                    <strong>End Heading:</strong>{" "}
                    {topic.endHeading || "-"}
                </p>

            </div>


            {/* ========================================
                Pipeline
            ======================================== */}

            <h2
                style={{
                    marginTop: "35px",
                    marginBottom: "15px"
                }}
            >
                Pipeline
            </h2>


            {/* Loading */}

            {loading && (
                <p>
                    Loading progress...
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


            {/* Pipeline Stages */}

            {!loading && !error && (

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px"
                    }}
                >

                    {stages.map((stage) => {

                        const status =
                            getStatus(
                                progress[stage.key]
                            );


                        return (

                          <div
    key={stage.name}

   onClick={() => {

    if (
        stage.name === "Narration" &&
        progress[stage.key] === true
    ) {
        setPage("narration");
    }


    if (
        stage.name === "Image" &&
        progress[stage.key] === true
    ) {
        setPage("images");
    }

     if (
        stage.name === "English Video" &&
        progress[stage.key] === true
    ) {
        setPage("englishVideo");
    }
if (
    stage.name === "Hindi Narration" &&
    progress[stage.key] === true
) {
    setPage("hindiNarration");
}
if (
    stage.name === "Hindi Video" &&
    progress[stage.key] === true
) {
    setPage("hindiVideo");
}
if (
    stage.name === "Reviewed Narration" &&
    progress[stage.key] === true
) {
    setPage("reviewedNarration");
}
}}

    style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",

        border: "1px solid #d1d5db",
        borderRadius: "8px",

        padding: "14px 18px",

        background:
            status === "Complete"
                ? "#f0fdf4"
                : status === "Processing"
                    ? "#fffbeb"
                    : "#f9fafb",

       cursor:
    (
        stage.name === "Narration" ||
        stage.name === "Image"||
        stage.name === "English Video"||
        stage.name === "Hindi Narration"||
        stage.name === "Hindi Video"||
        stage.name === "Reviewed Narration"
    ) &&
    progress[stage.key] === true
        ? "pointer"
        : "default"
    }}
>

                                {/* Stage Name */}

                                <strong>
                                    {stage.name}
                                </strong>


                                {/* Status */}

                                <span
                                    style={{
                                        fontWeight: "600",

                                        padding: "5px 12px",

                                        borderRadius: "5px",

                                        background:
                                            status === "Complete"
                                                ? "#dcfce7"
                                                : status === "Processing"
                                                    ? "#fef3c7"
                                                    : "#e5e7eb"
                                    }}
                                >
                                    {status}
                                </span>

                            </div>

                        );

                    })}

                </div>

            )}

        </div>

    );
}

export default TopicDetail;