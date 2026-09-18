
import { useState } from "react";

import UploadPdf from "./pages/UploadPdf";
// import YouTubeUploads from "./pages/YouTubeUploads";
import Jobs from "./pages/Jobs";
import Home from "./pages/Home";
import Topics from "./pages/Topics";
import TopicDetail from "./pages/TopicDetail";
import Narration from "./pages/Narration";
import Images from "./pages/Images";
import EnglishVideo from "./pages/EnglishVideo";
import HindiNarration from "./pages/HindiNarration";
import HindiVideo from "./pages/HindiVideo";
import ReviewedNarration from "./pages/ReviewedNarration";

function App() {

    const [page, setPage] = useState("home");
const [selectedJobId, setSelectedJobId] = useState(null);
const [selectedTopic, setSelectedTopic] = useState(null);
const [selectedTopicIndex, setSelectedTopicIndex] =
    useState(null);
return (
        <>
            {/* Navigation */}
           <div
    style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "12px 25px",
        background: "#111827",
        borderBottom: "1px solid #374151",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)"
    }}
>

    {/* Logo / Title */}

    <div
        style={{
            color: "#ffffff",
            fontSize: "18px",
            fontWeight: "700",
            marginRight: "20px",
            whiteSpace: "nowrap"
        }}
    >
        NCERT Tutorial Generator
    </div>


    {/* Home */}

    <button
        onClick={() => setPage("home")}
        style={{
            padding: "9px 15px",
            border: "none",
            borderRadius: "6px",
            background: "#ffffff",
            color: "#111827",
            fontWeight: "600",
            cursor: "pointer"
        }}
    >
        Home
    </button>


    {/* Upload PDF */}

    <button
        onClick={() => setPage("upload")}
        style={{
            padding: "9px 15px",
            border: "none",
            borderRadius: "6px",
            background: "#ffffff",
            color: "#111827",
            fontWeight: "600",
            cursor: "pointer"
        }}
    >
        Upload PDF
    </button>


    {/* Jobs */}

    <button
        onClick={() => setPage("jobs")}
        style={{
            padding: "9px 15px",
            border: "none",
            borderRadius: "6px",
            background: "#ffffff",
            color: "#111827",
            fontWeight: "600",
            cursor: "pointer"
        }}
    >
        Jobs
    </button>


    {/* YouTube Uploads

    <button
        onClick={() => setPage("youtube")}
        style={{
            padding: "9px 15px",
            border: "none",
            borderRadius: "6px",
            background: "#ffffff",
            color: "#111827",
            fontWeight: "600",
            cursor: "pointer"
        }}
    >
        YouTube Uploads
    </button> */}

</div>
            {/* Pages */}

            {page === "home" && (
                <Home setPage={setPage} />
            )}

            {page === "upload" && (
                <UploadPdf />
            )}

            {page === "jobs" && (
    <Jobs
        setPage={setPage}
        setSelectedJobId={setSelectedJobId}
    />
)}

{page === "topics" && (
    <Topics
        jobId={selectedJobId}
        setPage={setPage}
        setSelectedTopic={setSelectedTopic}
        setSelectedTopicIndex={setSelectedTopicIndex}
    />
)}
{page === "topicDetail" && (
    <TopicDetail
        topic={selectedTopic}
        topicIndex={selectedTopicIndex}
        jobId={selectedJobId}
        setPage={setPage}
    />
)}

{page === "narration" && (
    <Narration
        topic={selectedTopic}
        topicIndex={selectedTopicIndex}
        jobId={selectedJobId}
        setPage={setPage}
    />
)}

{page === "images" && (
    <Images
        topic={selectedTopic}
        topicIndex={selectedTopicIndex}
        jobId={selectedJobId}
        setPage={setPage}
    />
)}
{page === "englishVideo" && (
    <EnglishVideo
        topic={selectedTopic}
        topicIndex={selectedTopicIndex}
        jobId={selectedJobId}
        setPage={setPage}
    />
)}

{page === "hindiNarration" && (
    <HindiNarration
        topic={selectedTopic}
        topicIndex={selectedTopicIndex}
        jobId={selectedJobId}
        setPage={setPage}
    />
)}

{page === "hindiVideo" && (
    <HindiVideo
        topic={selectedTopic}
        topicIndex={selectedTopicIndex}
        jobId={selectedJobId}
        setPage={setPage}
    />
)}
{page === "reviewedNarration" && (
    <ReviewedNarration
        topic={selectedTopic}
        topicIndex={selectedTopicIndex}
        jobId={selectedJobId}
        setPage={setPage}
    />
)}

            {page === "youtube" && (
                <YouTubeUploads />
            )}

        </>
    );
}

export default App;