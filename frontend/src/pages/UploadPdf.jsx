// import { useState } from "react";
// import axios from "axios";
// import "./UploadPdf.css";

// function UploadPdf() {

//     const [className, setClassName] = useState("");
//     const [subject, setSubject] = useState("");
//     const [pdf, setPdf] = useState(null);
//     const [workerId, setWorkerId] = useState("1");

//     function handleFile(e) {
//         setPdf(e.target.files[0]);
//     }

//     async function handleSubmit(e) {

//     e.preventDefault();

//     const finalClass = `class-${className}`;

//     if (!className || !subject || !pdf) {

//         alert("Please fill all fields.");

//         return;

//     }

//     const formData = new FormData();

//     formData.append("className", finalClass);
//     formData.append("subject", subject);
//     formData.append("pdf", pdf);
// formData.append("workerId", workerId);
//     try {

//         const response = await axios.post(

//             "http://localhost:5000/api/process-pdf",

//             formData,

//             {
//                 headers: {
//                     "Content-Type": "multipart/form-data"
//                 }
//             }

//         );

//         console.log(response.data);

//         alert("PDF Uploaded Successfully");

//     } catch (err) {

//         console.log(err);

//         alert("Upload Failed");

//     }

// }

//     return (
//         <div className="upload-container">

//             <h1>Tutorial Generator</h1>

//             <form onSubmit={handleSubmit}>

//                 <label>Class</label>

//                 <input
//                     type="text"
//                     placeholder="ex.- 10"
//                     value={className}
//                     onChange={(e) =>
//                         setClassName(e.target.value)
//                     }
//                 />

//                 <label>Subject</label>

//                 <input
//                     type="text"
//                     placeholder="Mathematics"
//                     value={subject}
//                     onChange={(e) =>
//                         setSubject(e.target.value)
//                     }
//                 />

//                 <label>Worker</label>

// <select
//     value={workerId}
//     onChange={(e) => setWorkerId(e.target.value)}
// >
//     <option value="1">Worker 1 - Abhijeet</option>
//     <option value="2">Worker 2 - Mayank Bro</option>
//     <option value="3">Worker 3 - Priyanshu</option>
//     <option value="4">Worker 4 - Harsh</option>
//     <option value="5">Worker 5 - Rohit</option>
//     <option value="6">Worker 6 - Tech</option>
//     <option value="7">Worker 7 - Vinayak</option>
//     <option value="8">Worker 8 - Monika</option>
//     <option value="9">Worker 9 - Abhinav</option>
//     <option value="10">Worker 10 - Mayank Kumar</option>
// </select>

//                 <label>Upload PDF</label>

//                 <input
//                     type="file"
//                     accept=".pdf"
//                     onChange={handleFile}
//                 />

//                 {pdf && (
//                     <p>
//                         Selected : {pdf.name}
//                     </p>
//                 )}

//                 <button type="submit">
//                     Process PDF
//                 </button>

//             </form>

//         </div>
//     );
// }

// export default UploadPdf;

import { useEffect, useState } from "react";
import axios from "axios";
import "./UploadPdf.css";

function UploadPdf() {

    const [className, setClassName] = useState("");
    const [subject, setSubject] = useState("");
    const [pdf, setPdf] = useState(null);
    const [workerId, setWorkerId] = useState("1");

    // YouTube accounts
    const [youtubeAccounts, setYoutubeAccounts] = useState([]);
    const [youtubeAccountId, setYoutubeAccountId] = useState("");


    // ========================================
    // Load YouTube Accounts
    // ========================================

    useEffect(() => {

        async function loadYouTubeAccounts() {

            try {

                const response = await axios.get(
                    "http://localhost:5000/api/youtube-accounts"
                );

                setYoutubeAccounts(
                    response.data.accounts
                );

            } catch (error) {

                console.error(
                    "Failed to load YouTube accounts:",
                    error
                );

            }

        }

        loadYouTubeAccounts();

    }, []);


    // ========================================
    // Select PDF
    // ========================================

    function handleFile(e) {

        setPdf(
            e.target.files[0]
        );

    }


    // ========================================
    // Submit
    // ========================================

    async function handleSubmit(e) {

        e.preventDefault();

        const finalClass =
            `class-${className}`;


        // Validation

        if (
            !className ||
            !subject ||
            !pdf ||
            !youtubeAccountId
        ) {

            alert(
                "Please fill all fields and select a YouTube account."
            );

            return;

        }


        // FormData

        const formData =
            new FormData();

        formData.append(
            "className",
            finalClass
        );

        formData.append(
            "subject",
            subject
        );

        formData.append(
            "pdf",
            pdf
        );

        formData.append(
            "workerId",
            workerId
        );

        // Selected YouTube account
        formData.append(
            "youtubeAccountId",
            youtubeAccountId
        );


        try {

            const response =
                await axios.post(

                    "http://localhost:5000/api/process-pdf",

                    formData,

                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data"
                        }
                    }

                );

            console.log(
                response.data
            );

            alert(
                "PDF Uploaded Successfully"
            );

        } catch (err) {

            console.error(
                "PDF Upload Error:",
                err
            );

            alert(
                "Upload Failed"
            );

        }

    }


    // ========================================
    // UI
    // ========================================

    return (

        <div className="upload-container">

            <h1>
                Tutorial Generator
            </h1>

            <form
                onSubmit={handleSubmit}
            >

                {/* Class */}

                <label>
                    Class
                </label>

                <input
                    type="text"
                    placeholder="ex.- 10"
                    value={className}
                    onChange={(e) =>
                        setClassName(
                            e.target.value
                        )
                    }
                />


                {/* Subject */}

                <label>
                    Subject
                </label>

                <input
                    type="text"
                    placeholder="Mathematics"
                    value={subject}
                    onChange={(e) =>
                        setSubject(
                            e.target.value
                        )
                    }
                />


                {/* Worker */}

                <label>
                    Worker
                </label>

                <select
                    value={workerId}
                    onChange={(e) =>
                        setWorkerId(
                            e.target.value
                        )
                    }
                >

                    <option value="1">
                        Worker 1 - Abhijeet
                    </option>

                    <option value="2">
                        Worker 2 - Mayank Bro
                    </option>

                    <option value="3">
                        Worker 3 - Priyanshu
                    </option>

                    <option value="4">
                        Worker 4 - Ashu
                    </option>

                    <option value="5">
                        Worker 5 - Rohit
                    </option>

                    <option value="6">
                        Worker 6 - Tech
                    </option>

                    <option value="7">
                        Worker 7 - Vinayak
                    </option>

                    <option value="8">
                        Worker 8 - Monika
                    </option>

                    <option value="9">
                        Worker 9 - Abhinav
                    </option>

                    <option value="10">
                        Worker 10 - Mayank Kumar
                    </option>

                    <option value="11">
                        Worker 11 - Nmabagli
                    </option>
                </select>


                {/* YouTube Account */}

                <label>
                    YouTube Account
                </label>

                <select
                    value={youtubeAccountId}
                    onChange={(e) =>
                        setYoutubeAccountId(
                            e.target.value
                        )
                    }
                >

                    <option value="">
                        Select YouTube Account
                    </option>

                    {youtubeAccounts.map(
                        (account) => (

                            <option
                                key={
                                    account.accountId
                                }
                                value={
                                    account.accountId
                                }
                            >
                                {account.channelName}
                                {" - "}
                                {account.email}
                            </option>

                        )
                    )}

                </select>


                {/* PDF */}

                <label>
                    Upload PDF
                </label>

                <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFile}
                />

                {pdf && (

                    <p>
                        Selected : {pdf.name}
                    </p>

                )}


                {/* Process */}

                <button
                    type="submit"
                >
                    Process PDF
                </button>


                {/* Back */}

               <button
    type="button"
    onClick={() => window.location.href = "/"}
>
    Back to One Page Notes
</button>
            </form>

        </div>

    );

}

export default UploadPdf;