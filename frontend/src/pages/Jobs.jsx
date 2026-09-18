import { useEffect, useState } from "react";

function Jobs({ setPage, setSelectedJobId }) {

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        fetch("http://localhost:5000/api/jobs")
            .then((response) => {

                if (!response.ok) {
                    throw new Error("Failed to fetch jobs");
                }

                return response.json();
            })
            .then((data) => {

                setJobs(data);
                setLoading(false);
            })
            .catch((error) => {

                console.error("Jobs fetch error:", error);

                setError("Failed to load jobs");
                setLoading(false);
            });

    }, []);


    if (loading) {
        return (
            <div style={{ padding: "40px" }}>
                <h2>Loading Jobs...</h2>
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

            <h1>Jobs</h1>


            {jobs.length === 0 ? (

                <p>No jobs found.</p>

            ) : (

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "15px",
                        marginTop: "20px"
                    }}
                >

                    {jobs.map((job) => (

                        <div
                            key={job.jobId}

                            onClick={() => {

                                console.log(
                                    "Selected Job:",
                                    job.jobId
                                );

                                setSelectedJobId(job.jobId);

                                setPage("topics");
                            }}

                            style={{
                                border: "1px solid #ccc",
                                borderRadius: "8px",
                                padding: "20px",
                                cursor: "pointer",
                                background: "#f9fafb"
                            }}
                        >

                            <h2>{job.jobId}</h2>

                            <p>
                                <strong>Class:</strong>{" "}
                                {job.className}
                            </p>

                            <p>
                                <strong>Subject:</strong>{" "}
                                {job.subject}
                            </p>

                            <p>
                                <strong>Chapter:</strong>{" "}
                                {job.chapterName || "Not available"}
                            </p>

                            <p>
                                <strong>Worker:</strong>{" "}
                                {job.workerId}
                            </p>

                            <p>
                                <strong>Account:</strong>{" "}
                                {job.accountId}
                            </p>

                            <p>
                                <strong>Status:</strong>{" "}
                                {job.status}
                            </p>

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
}

export default Jobs;