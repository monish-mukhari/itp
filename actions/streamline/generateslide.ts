import run from "./gemini";
import { templates } from "./template";

export default async function generateHandler(
    summary: any, 
    wikipediaSummary: string, 
    original_prompt: string
) {
    const prompt = `
You are an AI assistant that generates **lecture slides** and **detailed exam notes** from structured YouTube and Wikipedia summaries.

### **Available Templates:**  
${JSON.stringify(templates)}

### **Original Topic:**  
${original_prompt}

### **YouTube Summary Provided:**  
${JSON.stringify(summary)}

### **Wikipedia Summary:**  
${wikipediaSummary}

---

## **Lecture Format**
- Extract key insights, explanations, and examples from both the **YouTube summary** and **Wikipedia data**.
- Ensure the lecture **flows logically** and is **easy to understand**.
- Use the **necessary** number of slides (no fixed limit).
- Each slide should focus on a **key concept** from the topic.
- Provide relevant **images** where needed to enhance understanding.
- **Speaker Notes:**  
  - Must **explain the slide content in detail**.  
  - Provide additional **context, examples, or explanations** beyond the text on the slide.  
  - If applicable, include **real-world applications** or **historical background**.  

---

## **Exam Notes Format**
Along with the slides, generate **detailed notes** formatted for study and exams. The notes should be structured as follows:
1. **Introduction** – A clear and concise overview of the topic.
2. **Detailed Explanation** – Expand on the concepts with insights and structured explanations.
3. **Examples** – Provide real-world and theoretical examples to reinforce understanding.
4. **Important Points** – List the most crucial takeaways in bullet points.
5. **Exam Tips** – Summarized key takeaways in an exam-oriented writing style.

---

### **Expected Response Format (JSON)**
\`\`\`json
{
    "title": "Lecture Title",
    "description": "Brief description of the lecture topic.",
    "slides": [
        {
            "title": "Slide Title",
            "template_id": 1,
            "texts": [
                "Key concept 1",
                "Key concept 2",
                "Key concept 3",
                "Additional details..."
            ],
            "images": [
                "https://example.com/image.jpg"
            ],
            "speaker_notes": "Detailed explanation for the speaker, including examples, real-world applications, and step-by-step breakdowns."
        }
    ],
     "notes": {
        "introduction": "A clear and concise introduction to the topic, outlining its significance and relevance.",
       "detailed_explanation": "A deep dive into the topic covering all necessary aspects with structured logical flow. \n\nEach concept should be broken down as follows:\n\n 1️ **Definition & Importance** - Explain the concept clearly.\n 2️ **Historical or Scientific Background** - If applicable, provide historical evolution.\n 3️  **Breakdown of Subtopics** - If the concept has multiple parts, explain each step.\n 4️ **Real-World Relevance** - How does it apply in real scenarios?\n 5️ **Common Misconceptions & Mistakes** - Highlight any confusion students may have.\n\nEnsure that no key aspect is omitted."
        ,
        "examples": [
            "Example 1: Real-world application with practical insights and how it is implemented in industry.",
            "Example 2: Theoretical scenario that explains the concept in an academic framework.",
            "Example 3: Case study showcasing how the concept has been applied in a real-life problem."
        ],
        "important_points": [
            "Key takeaway 1: Fundamental principle or rule.",
            "Key takeaway 2: Commonly misunderstood concept explained in simple terms.",
            "Key takeaway 3: Best practices and practical insights."
        ],
        "exam_tips": "Summarized key points for exams, highlighting essential concepts and common exam questions.\n\n- **Likely Exam Questions:** What is X? Explain Y with an example.\n- **Common Mistakes:** Avoid these misconceptions and ensure clarity in explanations.\n- **Memory Aids:** Mnemonics, acronyms, or simple tricks to recall key concepts."
    }
}
\`\`\`

Ensure that the key points are **not limited** in number—include **as many necessary** for clarity.
`;

    const lecture = await run(prompt);
    return lecture;
}
