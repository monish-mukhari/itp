import React from "react";

export default function NotesDisplay({ notes }: { notes: any }) {
    // Function to format text (handles line breaks & bold text)
    const formatText = (text?: string) => {
        if (!text) return ""; // Return empty string if text is undefined
    
        return text
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Convert **text** to <strong>text</strong>
            .replace(/\n/g, "<br />"); // Convert newlines to <br />
    };

    return (
        <div className="p-4 m-20 bg-white shadow-lg rounded-lg">
            <h2 className="text-xl font-bold mb-3">Exam Notes</h2>

            <section className="mb-4">
                <h3 className="font-semibold">Introduction</h3>
                <p dangerouslySetInnerHTML={{ __html: formatText(notes.introduction) }} />
            </section>

            <section className="mb-4">
                <h3 className="font-semibold">Detailed Explanation</h3>
                <p dangerouslySetInnerHTML={{ __html: formatText(notes.detailed_explanation) }} />
            </section>

            <section className="mb-4">
                <h3 className="font-semibold">Examples</h3>
                <ul className="list-disc pl-4">
                    {notes.examples?.map((example: string, index: number) => (
                        <li key={index}>{example}</li>
                    ))}
                </ul>
            </section>

            <section className="mb-4">
                <h3 className="font-semibold">Important Points</h3>
                <ul className="list-disc pl-4">
                    {notes.important_points?.map((point: string, index: number) => (
                        <li key={index}>{point}</li>
                    ))}
                </ul>
            </section>

            <section className="mb-4">
                <h3 className="font-semibold">Exam Tips</h3>
                <p dangerouslySetInnerHTML={{ __html: formatText(notes.exam_tips) }} />
            </section>
        </div>
    );
}
