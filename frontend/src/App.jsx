import { useState } from "react";
import UploadPdf from "./pages/UploadPdf";
import YouTubeUploads from "./pages/YouTubeUploads";

function App() {

    const [page, setPage] = useState("upload");

    return (
        <>
            {/* Navigation */}
            <div
                style={{
                    display: "flex",
                    gap: "10px",
                    padding: "15px 25px",
                    background: "#111827"
                }}
            >
                <button
                    onClick={() => setPage("upload")}
                    style={{
                        padding: "10px 16px",
                        borderRadius: "7px",
                        border: "none",
                        cursor: "pointer"
                    }}
                >
                    Upload PDF
                </button>

                <button
                    onClick={() => setPage("youtube")}
                    style={{
                        padding: "10px 16px",
                        borderRadius: "7px",
                        border: "none",
                        cursor: "pointer"
                    }}
                >
                    YouTube Uploads
                </button>
            </div>

            {/* Pages */}
            {page === "upload" && <UploadPdf />}

            {page === "youtube" && <YouTubeUploads />}
        </>
    );
}

export default App;