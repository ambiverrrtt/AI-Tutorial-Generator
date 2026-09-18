import { useEffect, useState } from "react";

function Topics({
    jobId,
    setPage,
    setSelectedTopic,
    setSelectedTopicIndex
}) {

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        if (!jobId) {
            setError("Job ID not found.");
            setLoading(false);
            return;
        }

        fetch(`http://localhost:5000/api/jobs/${jobId}/topics`)
            .then((response) => {

                if (!response.ok) {
                    throw new Error("Failed to fetch topics");
                }

                return response.json();
            })
            .then((result) => {

                console.log("Topics API Response:", result);

                setData(result);
                setLoading(false);
            })
            .catch((error) => {

                console.error("Topics fetch error:", error);

                setError("Failed to load topics.");
                setLoading(false);
            });

    }, [jobId]);


    if (loading) {
        return (
            <div style={{ padding: "40px" }}>
                <h2>Loading Topics...</h2>
            </div>
        );
    }


    if (error) {
        return (
            <div style={{ padding: "40px" }}>
                <h2>{error}</h2>
            </div>
        );
    }


    return (
        <div style={{ padding: "30px" }}>

            <button
                onClick={() => setPage("jobs")}
                style={{
                    padding: "8px 15px",
                    marginBottom: "20px",
                    cursor: "pointer"
                }}
            >
                ← Back to Jobs
            </button>


            <h1>Topics</h1>


            {data?.job && (
                <div
                    style={{
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        padding: "20px",
                        marginTop: "20px",
                        marginBottom: "25px"
                    }}
                >

                    <p>
                        <strong>Job ID:</strong>{" "}
                        {data.job.jobId}
                    </p>

                    <p>
                        <strong>Class:</strong>{" "}
                        {data.job.className}
                    </p>

                    <p>
                        <strong>Subject:</strong>{" "}
                        {data.job.subject}
                    </p>

                    <p>
                        <strong>Chapter:</strong>{" "}
                        {data.job.chapterName}
                    </p>

                </div>
            )}


            <h2>All Topics</h2>


            {data?.topics?.length === 0 ? (

                <p>No topics found.</p>

            ) : (

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        marginTop: "20px"
                    }}
                >

                   {data.topics.map((topic, index) => (

    <div
        key={index}
       onClick={() => {

    console.log(
        "Selected Topic:",
        topic
    );

    setSelectedTopic(topic);

    setSelectedTopicIndex(index);

    setPage("topicDetail");
}}
        style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "20px",
            cursor: "pointer",
            background: "#f9fafb"
        }}
    >

        <h3>
            {topic.title || `Topic ${index + 1}`}
        </h3>

        {topic.sectionNumber && (
            <p>
                <strong>
                    Section:
                </strong>{" "}
                {topic.sectionNumber}
            </p>
        )}

        {topic.type && (
            <p>
                <strong>
                    Type:
                </strong>{" "}
                {topic.type}
            </p>
        )}

        {topic.startHeading && (
            <p>
                <strong>
                    Start Heading:
                </strong>{" "}
                {topic.startHeading}
            </p>
        )}

        {topic.endHeading && (
            <p>
                <strong>
                    End Heading:
                </strong>{" "}
                {topic.endHeading}
            </p>
        )}

        <div
            style={{
                marginTop: "15px",
                padding: "15px",
                background: "white",
                border: "1px solid #ddd",
                borderRadius: "6px",
                lineHeight: "1.6",
                whiteSpace: "pre-wrap"
            }}
        >
            <strong>Content:</strong>

            <p>
                {topic.content || "Content not available."}
            </p>
        </div>

    </div>

))}

                </div>

            )}

        </div>
    );
}

export default Topics;