"use client";
import React, { useState, useEffect } from "react";
import withAuth from "@/components/withAuth";
import NotesDisplay from "@/components/Notes";
import { RxHamburgerMenu } from "react-icons/rx";

function DashBoard() {
  const apiKey=process.env.GEMINI_KEY_API || "";
    const [extended, setExtended] = useState(false);
    const [loading, setLoading] = useState(true); 
    const [result, setResult] = useState({
        introduction: "Introduction",
        detailed_explanation: "Detailed Explanation",
        examples: ["Example 1", "Example 2"],
        important_points: ["Important Point 1", "Important Point 2"],
        exam_tips: "Exam Tips",
    });

    function formatText(input: string): string {
          return input
              .replace(/(\d)️\s*\*\*(.*?)\*\*/g, '\n$1. **$2**') // Ensure new line and proper numbering
              .replace(/\*\*(.*?)\*\*/g, '**$1**'); // Keep bold formatting
    }

    function formatState(state: {
        introduction: string;
        detailed_explanation: string;
        examples: string[];
        important_points: string[];
        exam_tips: string;
      }): typeof state {
        return {
          introduction: formatText(state.introduction),
          detailed_explanation: formatText(state.detailed_explanation),
          examples: state.examples.map(formatText),
          important_points: state.important_points.map(formatText),
          exam_tips: formatText(state.exam_tips),
        };
      }

    useEffect(() => {
        const storedResult = localStorage.getItem("result");
        if (storedResult && storedResult !== "undefined") {
            try {
                const parsedResult = JSON.parse(storedResult);
                const storedResult2 = formatState(parsedResult.notes); 
                console.log("Stored result:", storedResult2); 
                setResult(storedResult2);
            } catch (error) {
                console.error("Error parsing result:", error);
            }
        }
        setTimeout(() => setLoading(false), 3000); 
    }, []);

    return (
        <div className="grid grid-cols-12 h-screen w-screen">
            <div className={`${extended ? "col-span-12" : "col-span-1"} pt-28 ml-8 border-r border-slate-800`}>
                <div className="text-white text-5xl pb-10 font-bold">
                    <RxHamburgerMenu onClick={() => setExtended((prev) => !prev)} className="p-2 hover:cursor-pointer hover:bg-gray-800 hover:rounded-md" />
                </div>
                {extended && <NotesDisplay notes={{introduction:result.introduction, detailed_explanation:result.detailed_explanation, examples:result.examples, important_points:result.important_points, exam_tips:result.exam_tips}} />}
            </div>

            <div className={`text-white bg-slate-950 ${extended ? "col-span-10" : "col-span-11"} pt-28 flex justify-center items-center`}>
                {loading ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 border-4 border-t-white border-gray-600 rounded-full animate-spin"></div>
                        <p className="text-xl font-semibold">Preparing your video...</p>
                    </div>
                ) : (
                    !extended && <video className="rounded-xl w-3/4 h-auto" controls>
                        <source src="../final_lecture_video.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                )}
            </div>
        </div>
    );
}

export default withAuth(DashBoard);

// "use client"
// import React,{useEffect} from "react";
// import Head from 'next/head';
// import Chat from "@/components/chat";
// import Chatbot from "@/components/chatbot";
// import { useState } from "react";
// import { BsClipboard2Data } from "react-icons/bs";
// import { FaMagic } from "react-icons/fa";
// import { SlNote } from "react-icons/sl";
// import { FaUser } from "react-icons/fa";
// import { RxHamburgerMenu } from "react-icons/rx";
// import withAuth from "@/components/withAuth";
// import NotesDisplay from "@/components/Notes";
// // import { VideoPlayer } from "@/components/videoPlayer/videoPlayer";

// interface LearnLandSidebarButton {
//     title: string;
//     icon: React.ReactNode
// }

// const sidebarMenuItems: LearnLandSidebarButton[] = [
//     {
//         title: "statistics",
//         icon: <BsClipboard2Data />
//       },
//       {
//         title: "create",
//         icon: <FaMagic />
//       },
//       {
//         title: "notes",
//         icon: <SlNote />
//       }, 
// ]



// function DashBoard() {
//   const apiKey=process.env.GEMINI_KEY_API || "";
//   const [extended, setExtended] = useState(false);
//   const [result, setResult] = useState({
//     introduction: "Introduction",
//     detailed_explanation: "Detailed Explanation",
//     examples: ["Example 1", "Example 2"],
//     important_points: ["Important Point 1", "Important Point 2"],
//     exam_tips: "Exam Tips",
//   });

//   function formatText(input: string): string {
//     return input
//         .replace(/(\d)️\s*\*\*(.*?)\*\*/g, '\n$1. **$2**') // Ensure new line and proper numbering
//         .replace(/\*\*(.*?)\*\*/g, '**$1**'); // Keep bold formatting
// }

// function formatState(state: {
//   introduction: string;
//   detailed_explanation: string;
//   examples: string[];
//   important_points: string[];
//   exam_tips: string;
// }): typeof state {
//   return {
//     introduction: formatText(state.introduction),
//     detailed_explanation: formatText(state.detailed_explanation),
//     examples: state.examples.map(formatText),
//     important_points: state.important_points.map(formatText),
//     exam_tips: formatText(state.exam_tips),
//   };
// }
//   useEffect(() => {
//     const storedResult = localStorage.getItem("result");
//     if (storedResult && storedResult !== "undefined") { 
//       try {
//         const parsedResult = JSON.parse(storedResult);
//         const storedResult2 = formatState(parsedResult.notes);    
//         console.log("Stored result:", storedResult2); 
//         setResult(storedResult2);
//       } catch (error) {
//         console.error("Error parsing result from localStorage:", error);
//       }
//     }
//   }, []);

//   console.log(result)
  

//   const videoJsOptions = {
//     controls: true,
//     responsive: true,
//     fluid: true,
//     sources: [
//       {
//         src: "https://www.youtube.com/watch?v=mt-9V0qL1X0",
//         type: "video/mp4",
//       },
//     ],
//   };

//     return <div className="grid grid-cols-12 h-screen w-screen">
//        <div className={${extended ? "col-span-12": "col-span-1"} pt-28 ml-8 border-r border-slate-800}>

//        <div className="text-white text-5xl pb-10 font-bold">
//           <RxHamburgerMenu onClick={() => setExtended(prev => !prev)} className="p-2 hover:cursor-pointer hover:bg-gray-800 hover:rounded-md" />
//         </div>

//         {/* <div className="mt-1 text-xl text-white">
//           <ul>
//             <div>
//           {sidebarMenuItems.map((item) => (<li className={${extended ? "w-40" : "w-16"} flex justify-start items-center gap-4 hover:bg-gray-800 rounded-md px-3 py-3 cursor-pointer transition-all mt-2 border} key={item.title}>
//             <span className={${extended ? "text-lg" : "text-2xl"}}>{item.icon}</span>
//             {extended ? <span className="text-xl">{item.title}</span> : null}
//             </li>))}
//             </div>
//           </ul>
//         </div> */}
        
//         {extended && <NotesDisplay notes={{introduction:result.introduction, detailed_explanation:result.detailed_explanation, examples:result.examples, important_points:result.important_points, exam_tips:result.exam_tips}} />}
//       </div>

//        <div className={text-white bg-slate-950 ${extended ? "col-span-10" : "col-span-11"} pt-28}>

//        {/* <VideoPlayer options={videoJsOptions} /> */}

//        {!extended && <video className="rounded-xl w-3/4 h-auto" controls>
//           <source src="../final_lecture_video.mp4" type="video/mp4" />
//           Your browser does not support the video tag.
//         </video>}

      
//       {/* <Chatbot apiKey={apiKey} /> */}
      
      
//        </div>
//     </div>
// }

// export default withAuth(DashBoard);
