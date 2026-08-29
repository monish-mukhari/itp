import PptxGenJS from "pptxgenjs";
import axios from "axios";

// Interface for slide data
interface Slide {
    title: string;
    template_id: number;
    texts: string[];
    images: string[];
    speaker_notes: string


}

interface Lecture {
    title: string;
    description: string;
    slides: Slide[]

}

// JSON Data
// const slidesData: SlideData[] = [
//   {
//     title: "DFS Algorithm",
//     template_id: 2,
//     texts: ["Visit a node", "Mark as visited", "Recursively explore"],
//     images: ["https://i.stack.imgur.com/r0Y7x.png"],
//     speaker_notes: "The algorithm visits a node, marks it, and then recursively explores its neighbors.",
//   },
//   {
//     title: "Stack Implementation",
//     template_id: 0,
//     texts: ["Uses a stack", "LIFO structure", "Efficient for DFS"],
//     images: ["https://www.tutorialspoint.com/data_structures_algorithms/images/stack_representation.jpg"],
//     speaker_notes: "A stack, a LIFO data structure, is crucial for managing the order of node visits.",
//   },
// ];

// Function to fetch correct images from Google Custom Search API
export async function fetchCorrectImage(query: string): Promise<string | null> {

  const apiKey = process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_CX;

  const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&cx=${cx}&searchType=image&num=1&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    if (response.data.items && response.data.items.length > 0) {
        console.log(response.data.items[0].link);
      return response.data.items[0].link; // First image result
    }
  } catch (error) {
    console.error(`Error fetching image for ${query}:`, error);
  }

  return null; // Default to null if no image is found
}

// Function to generate slides
export async function createPresentation(lecture: Lecture): Promise<void> {
  const pptx = new PptxGenJS();

  const slidesData = lecture.slides;
  for (const slideData of slidesData) {
    const slide = pptx.addSlide();

    // Title
    slide.addText(slideData.title, { x: 1, y: 0.5, fontSize: 24, bold: true });

    // Texts
    slideData.texts.forEach((text, index) => {
      slide.addText(text, { x: 1, y: 1 + index * 0.5, fontSize: 18 });
    });

    // Fetch correct image
    const imageUrl = (await fetchCorrectImage(slideData.title)) || slideData.images[0];

    // Add Image
    slide.addImage({ path: imageUrl, x: 5, y: 1, w: 3, h: 2 });

    // Speaker Notes
    slide.addNotes(slideData.speaker_notes);
  }

  // Save the presentation
  await pptx.writeFile({ fileName: "Generated_Slides.pptx" });
  console.log("Presentation created successfully!");
}

// Run the function

