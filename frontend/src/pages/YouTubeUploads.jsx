import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./YouTubeUploads.css";

const API_URL = "http://localhost:5000/api/youtube-uploads";

function YouTubeUploads() {

    const [uploads, setUploads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [classFilter, setClassFilter] = useState("All");
    const [subjectFilter, setSubjectFilter] = useState("All");
    const [chapterFilter, setChapterFilter] = useState("All");
    const [languageFilter, setLanguageFilter] = useState("All");
const [editingRow, setEditingRow] = useState(null);
const [showAddForm, setShowAddForm] = useState(false);
const [saving, setSaving] = useState(false);

const [form, setForm] = useState({
    className: "",
    subject: "",
    chapterName: "",
    tutorialTitle: "",
    language: "English",
    youtubeUrl: "",
    videoId: "",
    playlistId: "",
    uploadedAt: ""
});
    // ==========================================
    // LOAD EXCEL DATA
    // ==========================================

    const loadUploads = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await axios.get(API_URL);

            setUploads(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (err) {

            console.error(
                "Failed to load YouTube uploads:",
                err
            );

            setError(
                "Unable to load YouTube upload data."
            );

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        loadUploads();

    }, []);

    // ==========================================
    // FILTER OPTIONS
    // ==========================================

    const classes = useMemo(() => {

        return [
            "All",
            ...new Set(
                uploads
                    .map(item => item.className)
                    .filter(Boolean)
            )
        ];

    }, [uploads]);

    const subjects = useMemo(() => {

        return [
            "All",
            ...new Set(
                uploads
                    .map(item => item.subject)
                    .filter(Boolean)
            )
        ];

    }, [uploads]);

    const chapters = useMemo(() => {

        return [
            "All",
            ...new Set(
                uploads
                    .map(item => item.chapter)
                    .filter(Boolean)
            )
        ];

    }, [uploads]);

    // ==========================================
    // FILTER DATA
    // ==========================================

    const filteredUploads = useMemo(() => {

        const searchValue =
            search.trim().toLowerCase();

        return uploads.filter(item => {

            const matchesSearch =
                !searchValue ||
                String(item.className || "")
                    .toLowerCase()
                    .includes(searchValue) ||
                String(item.subject || "")
                    .toLowerCase()
                    .includes(searchValue) ||
                String(item.chapter || "")
                    .toLowerCase()
                    .includes(searchValue) ||
                String(item.topic || "")
                    .toLowerCase()
                    .includes(searchValue);

            const matchesClass =
                classFilter === "All" ||
                item.className === classFilter;

            const matchesSubject =
                subjectFilter === "All" ||
                item.subject === subjectFilter;

            const matchesChapter =
                chapterFilter === "All" ||
                item.chapter === chapterFilter;

            const matchesLanguage =
                languageFilter === "All" ||
                item.language === languageFilter;

            return (
                matchesSearch &&
                matchesClass &&
                matchesSubject &&
                matchesChapter &&
                matchesLanguage
            );

        });

    }, [
        uploads,
        search,
        classFilter,
        subjectFilter,
        chapterFilter,
        languageFilter
    ]);

    // ==========================================
    // DOWNLOAD EXCEL
    // ==========================================

    const downloadExcel = () => {

        window.open(
            `${API_URL}/download`,
            "_blank"
        );

    };

    // ==========================================
    // RESET FILTERS
    // ==========================================

    const resetFilters = () => {

        setSearch("");
        setClassFilter("All");
        setSubjectFilter("All");
        setChapterFilter("All");
        setLanguageFilter("All");

    };

    // ==========================================
// FORM CHANGE
// ==========================================

const handleFormChange = (e) => {

    const { name, value } = e.target;

    setForm(prev => ({
        ...prev,
        [name]: value
    }));

};


// ==========================================
// START EDIT
// ==========================================

const startEdit = (item) => {

    setEditingRow(item.rowNumber);

    setShowAddForm(false);

    setForm({

        className: item.className || "",
        subject: item.subject || "",
        chapterName: item.chapter || "",
        tutorialTitle: item.topic || "",
        language: item.language || "English",
        youtubeUrl: item.youtubeLink || "",
        videoId: item.videoId || "",
        playlistId: item.playlistId || "",
        uploadedAt: item.uploadedAt || ""

    });

};


// ==========================================
// CANCEL EDIT
// ==========================================

const cancelEdit = () => {

    setEditingRow(null);

    setShowAddForm(false);

    setForm({
        className: "",
        subject: "",
        chapterName: "",
        tutorialTitle: "",
        language: "English",
        youtubeUrl: "",
        videoId: "",
        playlistId: "",
        uploadedAt: ""
    });

};


// ==========================================
// SAVE EDIT
// ==========================================

const saveEdit = async () => {

    try {

        setSaving(true);

        await axios.put(
            `${API_URL}/${editingRow}`,
            form
        );

        alert("Entry updated successfully.");

        cancelEdit();

        await loadUploads();

    } catch (error) {

        console.error(
            "Failed to update entry:",
            error
        );

        alert(
            error?.response?.data?.message ||
            "Failed to update entry."
        );

    } finally {

        setSaving(false);

    }

};


// ==========================================
// ADD NEW ENTRY
// ==========================================

const addNewEntry = async () => {

    try {

        setSaving(true);

        await axios.post(
            API_URL,
            form
        );

        alert("Entry added successfully.");

        cancelEdit();

        await loadUploads();

    } catch (error) {

        console.error(
            "Failed to add entry:",
            error
        );

        alert(
            error?.response?.data?.message ||
            "Failed to add entry."
        );

    } finally {

        setSaving(false);

    }

};
    // ==========================================
    // UI
    // ==========================================

    return (

        <div className="youtube-page">

            <div className="youtube-header">

                <div>

                    <h1>
                        YouTube Uploads
                    </h1>

                    <p>
                        Manage and track all uploaded
                        tutorial videos.
                    </p>

                </div>

                <div className="header-actions">
<button
    className="add-entry-btn"
    onClick={() => {

        setShowAddForm(true);
        setEditingRow(null);

        setForm({
            className: "",
            subject: "",
            chapterName: "",
            tutorialTitle: "",
            language: "English",
            youtubeUrl: "",
            videoId: "",
            playlistId: "",
            uploadedAt: ""
        });

    }}
>
    + Add Entry
</button>
                    <button
                        className="refresh-btn"
                        onClick={loadUploads}
                    >
                        ↻ Refresh
                    </button>

                    <button
                        className="download-btn"
                        onClick={downloadExcel}
                    >
                        ↓ Download Excel
                    </button>

                </div>

            </div>

            {/* ==================================
                STATS
            ================================== */}

            <div className="youtube-stats">

                <div className="stat-card">

                    <span>
                        Total Videos
                    </span>

                    <strong>
                        {uploads.length}
                    </strong>

                </div>

                <div className="stat-card">

                    <span>
                        English
                    </span>

                    <strong>
                        {
                            uploads.filter(
                                item =>
                                    item.language === "English"
                            ).length
                        }
                    </strong>

                </div>

                <div className="stat-card">

                    <span>
                        Hindi
                    </span>

                    <strong>
                        {
                            uploads.filter(
                                item =>
                                    item.language === "Hindi"
                            ).length
                        }
                    </strong>

                </div>

                <div className="stat-card">

                    <span>
                        Showing
                    </span>

                    <strong>
                        {filteredUploads.length}
                    </strong>

                </div>

            </div>

            {/* ==================================
                FILTERS
            ================================== */}

            <div className="filter-panel">

                <input
                    type="text"
                    placeholder="Search class, subject, chapter or topic..."
                    value={search}
                    onChange={e =>
                        setSearch(e.target.value)
                    }
                />

                <select
                    value={classFilter}
                    onChange={e =>
                        setClassFilter(e.target.value)
                    }
                >
                    {classes.map(item => (
                        <option
                            key={item}
                            value={item}
                        >
                            {item === "All"
                                ? "All Classes"
                                : item}
                        </option>
                    ))}
                </select>

                <select
                    value={subjectFilter}
                    onChange={e =>
                        setSubjectFilter(e.target.value)
                    }
                >
                    {subjects.map(item => (
                        <option
                            key={item}
                            value={item}
                        >
                            {item === "All"
                                ? "All Subjects"
                                : item}
                        </option>
                    ))}
                </select>

                <select
                    value={chapterFilter}
                    onChange={e =>
                        setChapterFilter(e.target.value)
                    }
                >
                    {chapters.map(item => (
                        <option
                            key={item}
                            value={item}
                        >
                            {item === "All"
                                ? "All Chapters"
                                : item}
                        </option>
                    ))}
                </select>

                <select
                    value={languageFilter}
                    onChange={e =>
                        setLanguageFilter(e.target.value)
                    }
                >

                    <option value="All">
                        All Languages
                    </option>

                    <option value="English">
                        English
                    </option>

                    <option value="Hindi">
                        Hindi
                    </option>

                </select>

                <button
                    className="reset-btn"
                    onClick={resetFilters}
                >
                    Reset
                </button>

            </div>
{/* ==================================
    ADD / EDIT FORM
================================== */}

{(showAddForm || editingRow !== null) && (

    <div className="youtube-form">

        <div className="youtube-form-header">

            <h2>
                {editingRow !== null
                    ? "Edit YouTube Entry"
                    : "Add YouTube Entry"}
            </h2>

            <button
                className="close-form-btn"
                onClick={cancelEdit}
            >
                ×
            </button>

        </div>


        <div className="youtube-form-grid">

            <div className="form-field">

                <label>
                    Class
                </label>

                <input
                    name="className"
                    value={form.className}
                    onChange={handleFormChange}
                    placeholder="Class 10"
                />

            </div>


            <div className="form-field">

                <label>
                    Subject
                </label>

                <input
                    name="subject"
                    value={form.subject}
                    onChange={handleFormChange}
                    placeholder="Mathematics"
                />

            </div>


            <div className="form-field">

                <label>
                    Chapter
                </label>

                <input
                    name="chapterName"
                    value={form.chapterName}
                    onChange={handleFormChange}
                    placeholder="TRIANGLES"
                />

            </div>


            <div className="form-field">

                <label>
                    Topic
                </label>

                <input
                    name="tutorialTitle"
                    value={form.tutorialTitle}
                    onChange={handleFormChange}
                    placeholder="Introduction"
                />

            </div>


            <div className="form-field">

                <label>
                    Language
                </label>

                <select
                    name="language"
                    value={form.language}
                    onChange={handleFormChange}
                >

                    <option value="English">
                        English
                    </option>

                    <option value="Hindi">
                        Hindi
                    </option>

                </select>

            </div>


            <div className="form-field">

                <label>
                    YouTube Link
                </label>

                <input
                    name="youtubeUrl"
                    value={form.youtubeUrl}
                    onChange={handleFormChange}
                    placeholder="https://www.youtube.com/watch?v=..."
                />

            </div>

        </div>


        <div className="form-actions">

            <button
                className="cancel-form-btn"
                onClick={cancelEdit}
                disabled={saving}
            >
                Cancel
            </button>


            <button
                className="save-form-btn"
                onClick={
                    editingRow !== null
                        ? saveEdit
                        : addNewEntry
                }
                disabled={saving}
            >

                {saving
                    ? "Saving..."
                    : editingRow !== null
                        ? "Save Changes"
                        : "Add Entry"}

            </button>

        </div>

    </div>

)}
            {/* ==================================
                TABLE
            ================================== */}

            <div className="youtube-table-container">

                {loading ? (

                    <div className="table-message">
                        Loading YouTube uploads...
                    </div>

                ) : error ? (

                    <div className="table-message error">
                        {error}
                    </div>

                ) : filteredUploads.length === 0 ? (

                    <div className="table-message">
                        No YouTube uploads found.
                    </div>

                ) : (

                    <table className="youtube-table">

                        <thead>

                            <tr>

                                <th>
                                    #
                                </th>

                                <th>
                                    Class
                                </th>

                                <th>
                                    Subject
                                </th>

                                <th>
                                    Chapter
                                </th>

                                <th>
                                    Topic
                                </th>

                                <th>
                                    Language
                                </th>

                                <th>
                                    YouTube
                                </th>
<th>
    Actions
</th>
                            </tr>

                        </thead>

                        <tbody>

                            {filteredUploads.map(
                                (item, index) => (

                                    <tr
                                        key={
                                            item.videoId ||
                                            `${item.chapter}-${item.topic}-${index}`
                                        }
                                    >

                                        <td>
                                            {index + 1}
                                        </td>

                                        <td>
                                            {item.className}
                                        </td>

                                        <td>
                                            {item.subject}
                                        </td>

                                        <td>
                                            {item.chapter}
                                        </td>

                                        <td className="topic-cell">
                                            {item.topic}
                                        </td>

                                        <td>

                                            <span
                                                className={
                                                    item.language ===
                                                    "Hindi"
                                                        ? "language-badge hindi"
                                                        : "language-badge english"
                                                }
                                            >
                                                {item.language}
                                            </span>

                                        </td>

                                        <td>

                                            {item.youtubeLink ? (

                                                <a
                                                    href={
                                                        item.youtubeLink
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="youtube-link"
                                                >
                                                    ▶ Watch
                                                </a>

                                            ) : (

                                                "-"
                                            )}

                                        </td>
<td>

    <button
        className="edit-btn"
        onClick={() => startEdit(item)}
    >
        ✏️ Edit
    </button>

</td>
                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>

                )}

            </div>

        </div>

    );

}

export default YouTubeUploads;