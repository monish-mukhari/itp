"use server"
import aggregateHandler from "../aggregateResearch";
import generateHandler from "../streamline/generateslide";

import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import textToSpeech from '@google-cloud/text-to-speech';
import path from "path";
import { fetchCorrectImage } from "../searchImage";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import { protos } from "@google-cloud/text-to-speech";
import { promisify } from 'util';

async function isImageValid(url: string): Promise<boolean> {
    try {
        const response = await fetch(url, { method: 'HEAD' });  // HEAD request for checking existence
        return response.ok;
    } catch (error) {
        console.error(`Error fetching URL: ${url}`, error);
        return false;
    }
}

async function downloadImage(url: string, filepath: string): Promise<string | null> {
    const directory = path.dirname(filepath); // Extract the directory path

    // Ensure the directory exists
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true }); // Create directory recursively
    }

    const isValid = await isImageValid(url);
    if (!isValid) {
        console.log(`Image URL invalid, skipping image.`);
        return null; // Skip image instead of using a fallback
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.log(`Failed to fetch image: ${response.statusText}. Skipping image.`);
            return null; // Skip image instead of stopping execution
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await fs.promises.writeFile(filepath, new Uint8Array(buffer));

        return filepath; // Return the image path if successful
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log(`Error downloading image: ${error.message}. Skipping image.`);
        } else {
            console.log(`An unknown error occurred while downloading the image.`);
        }
        return null; // Skip image on error
    }
}


async function createSlide(slide: any, slideNum: number) {
    const width = 1280;
    const height = 720;
    const canvas = createCanvas(width, height);
    const context = canvas.getContext("2d");

    // Background
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);

    // Title
    context.fillStyle = "black";
    context.font = "bold 36px Arial";
    context.fillText(slide.title, 50, 80);

    // Text settings
    context.font = "30px Arial";
    const textX = 50;
    let textY = 150;
    const maxWidth = width - 100; // Leave margin on both sides
    const lineHeight = 40; // Space between wrapped lines

    // Function to wrap text
    function wrapText(text: string, x: number, y: number) {
        const words = text.split(" ");
        let line = "";

        for (let i = 0; i < words.length; i++) {
            let testLine = line + words[i] + " ";
            let testWidth = context.measureText(testLine).width;

            if (testWidth > maxWidth && i > 0) {
                context.fillText(line, x, y);
                line = words[i] + " ";
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        context.fillText(line, x, y);
        return y; // Return new Y position
    }

    // Display text with wrapping
    slide.texts.forEach((text: string) => {
        textY = wrapText(`- ${text}`, textX, textY + lineHeight);
    });

    // Always fetch a new image
    let imageUrl = await fetchCorrectImage(slide.title);

    // If fetching fails, fallback to provided images
    if (!imageUrl && slide.images && slide.images.length > 0) {
        imageUrl = slide.images[0];
    }

    if (imageUrl) {
        const imagePath = `./images/image_${slideNum}.png`;

        try {
            await downloadImage(imageUrl, imagePath); // Attempt to download

            // Try loading the image
            const image = await loadImage(imagePath);

            const imageWidth = 300;
            const imageHeight = 300;

            // Center image horizontally
            const x = (width - imageWidth) / 2;

            // Place at bottom, ensuring no overlap with text
            const y = Math.min(height - imageHeight - 20, textY + 50);

            context.drawImage(image, x, y, imageWidth, imageHeight);
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.warn(`Failed to load image for slide ${slideNum}: ${error.message}`);
            } else {
                console.warn(`Failed to load image for slide ${slideNum}: Unknown error occurred.`);
            }
        }
    }

    const buffer = canvas.toBuffer("image/png");
    const slidePath = `./slides/slide_${slideNum}.png`;
    fs.writeFileSync(slidePath, new Uint8Array(buffer));

    return slidePath;
}


// Uses Google Application Default Credentials. In Docker, Compose points this
// at the service-account file mounted read-only from ./config.
const client = new textToSpeech.TextToSpeechClient();

async function createAudio(slide: any, slideNum: any) {
    const request: protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
        input: { text: slide.speaker_notes },
        voice: { 
            languageCode: "en-US", 
            ssmlGender: protos.google.cloud.texttospeech.v1.SsmlVoiceGender.NEUTRAL // ✅ Correct usage
        },
        audioConfig: { audioEncoding: "MP3" },
    };

    const [response] = await client.synthesizeSpeech(request);
    const audioPath = `./audio/audio_${slideNum}.mp3`;

    if (response.audioContent) {
        fs.writeFileSync(audioPath, response.audioContent, "binary");
        return audioPath;
    } else {
        throw new Error("Failed to generate audio.");
    }
}

async function getAudioDuration(audioFile: any) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(audioFile, (err, metadata) => {
            if (err) return reject(err);
            const duration = metadata.format.duration;
            resolve(duration);
        });
    });
}

async function createVideoSlide(slideImage: any, audioFile: any, slideNum: any) {
    const outputPath = `./videos/clip_${slideNum}.mp4`;
    
    try {
        const audioDuration = await getAudioDuration(audioFile); // Get audio duration
        return new Promise((resolve, reject) => {
            ffmpeg()
                .input(slideImage)
                .loop(1)  // Loop the image indefinitely
                .input(audioFile)
                // @ts-ignore
                .outputOptions([
                    '-c:v libx264',      // Video codec
                    '-c:a aac',          // Audio codec
                    '-pix_fmt yuv420p',  // Pixel format for compatibility
                    '-t', audioDuration, // Set duration to match audio length
                    '-shortest'          // Stop when audio ends
                ])
                .save(outputPath)
                .on('end', () => resolve(outputPath))
                .on('error', (err) => reject(err));
        });
    } catch (error) {
        console.error(`Error getting audio duration for slide ${slideNum}:`, error);
    }
}

async function concatenateVideos(clips: any) {
    console.log(__dirname);
    const outputVideo = './public/final_lecture_video.mp4';
    return new Promise((resolve, reject) => {
        const ffmpegCommand = ffmpeg();
        clips.forEach((clip: any) => {
            ffmpegCommand.input(clip);
        });

        ffmpegCommand
            .on('end', () => resolve(outputVideo))
            .on('error', (err) => reject(err))
            .mergeToFile(outputVideo, './temp/');
    });
}

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

const unlinkAsync = promisify(fs.unlink);
const readdirAsync = promisify(fs.readdir);

async function generateLectureVideo(lecture: Lecture) {
    const slidePaths: string[] = [];
    const audioPaths: string[] = [];
    const videoClips: string[] = [];

    // Ensure directories exist
    if (!fs.existsSync('./slides')) fs.mkdirSync('./slides');
    if (!fs.existsSync('./audio')) fs.mkdirSync('./audio');
    if (!fs.existsSync('./videos')) fs.mkdirSync('./videos');
    if (!fs.existsSync('./images')) fs.mkdirSync('./images'); // Ensure images folder exists
    if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');

    try {
        for (let i = 0; i < lecture.slides.length; i++) {
            const slide = lecture.slides[i];

            // Create slide images
            const slidePath = await createSlide(slide, i);
            slidePaths.push(slidePath);

            // Create audio narration
            const audioPath = await createAudio(slide, i);
            audioPaths.push(audioPath);

            // Create video clip for the slide
            const videoClipPath = await createVideoSlide(slidePath, audioPath, i);
            videoClips.push(videoClipPath as string);
        }

        // Concatenate all video clips into the final lecture video
        const finalVideo = await concatenateVideos(videoClips);
        console.log(`Lecture video created: ${finalVideo}`);

        // Cleanup intermediate files and images folder
        await cleanupFiles([...slidePaths, ...audioPaths, ...videoClips]);
        await cleanupFolder('./images'); // Empty the images folder

        return finalVideo;
    } catch (error) {
        console.error("Error generating lecture video:", error instanceof Error ? error.message : String(error));
    }
}

// Function to delete files asynchronously
async function cleanupFiles(files: string[]) {
    for (const file of files) {
        try {
            if (fs.existsSync(file)) {
                await unlinkAsync(file);
                console.log(`Deleted: ${file}`);
            }
        } catch (error) {
            console.error(`Error deleting ${file}:`, error instanceof Error ? error.message : String(error));
        }
    }
}

// Function to empty the images folder
async function cleanupFolder(folderPath: string) {
    try {
        if (fs.existsSync(folderPath)) {
            const files = await readdirAsync(folderPath);
            for (const file of files) {
                const filePath = path.join(folderPath, file);
                await unlinkAsync(filePath);
                console.log(`Deleted: ${filePath}`);
            }
            console.log(`Emptied folder: ${folderPath}`);
        }
    } catch (error) {
        console.error(`Error emptying folder ${folderPath}:`, error instanceof Error ? error.message : String(error));
    }
}


// Sample lecture object structure
// const lecture = {
//     "title": "Black Holes: Unveiling the Mysteries of Space",
//     "description": "Explore the enigmatic world of black holes, their formation, properties, and the profound impact they have on the universe.",
//     "slides": [
//         {
//             "title": "What are Black Holes?",
//             "template_id": 4,
//             "texts": [],
//             "images": [],
//             "speaker_notes": "Welcome to our exploration of black holes. Today, we'll delve into these fascinating objects, understanding their formation, properties, and their profound impact on the universe."
//         },
//         {
//             "title": "Gravity's Ultimate Triumph",
//             "template_id": 1,
//             "texts": [
//                 "Black holes are regions of spacetime",
//                 "Gravity is so strong that nothing, not even light, can escape.",
//                 "They form when massive stars collapse at the end of their lives."
//             ],
//             "images": [
//                 "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Black_hole_schematic.svg/1200px-Black_hole_schematic.svg.png"
//             ],
//             "speaker_notes": "Imagine a region of spacetime where gravity is so intense that nothing, not even light, can escape. This is a black hole. They form when massive stars exhaust their fuel and collapse under their own gravity."
//         },
//         {
//             "title": "The Event Horizon",
//             "template_id": 2,
//             "texts": [
//                 "The boundary of a black hole",
//                 "Point of no return",
//                 "Anything crossing the event horizon is lost forever."
//             ],
//             "images": [
//                 "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Black_hole_event_horizon.svg/1200px-Black_hole_event_horizon.svg.png"
//             ],
//             "speaker_notes": "The event horizon is the boundary of a black hole. It's the point of no return. Anything that crosses the event horizon, including light, is trapped forever."
//         },
//         {
//             "title": "Types of Black Holes",
//             "template_id": 9,
//             "texts": [
//                 "Stellar black holes",
//                 "Supermassive black holes",
//                 "Intermediate-mass black holes"
//             ],
//             "images": [
//                 "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Black_hole_artist_concept.jpg/1200px-Black_hole_artist_concept.jpg"
//             ],
//             "speaker_notes": "Black holes come in different sizes. Stellar black holes form from the collapse of massive stars. Supermassive black holes reside at the centers of galaxies. And intermediate-mass black holes are still being studied."
//         },
//         {
//             "title": "Black Holes and the Universe",
//             "template_id": 0,
//             "texts": [
//                 "Black holes play a crucial role in galaxy evolution",
//                 "They influence the distribution of matter and energy",
//                 "They can trigger star formation and galactic mergers."
//             ],
//             "images": [
//                 "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Galaxy_M87_black_hole_shadow_EHT_image_2019.jpg/1200px-Galaxy_M87_black_hole_shadow_EHT_image_2019.jpg"
//             ],
//             "speaker_notes": "Black holes are not just cosmic vacuum cleaners. They play a crucial role in galaxy evolution. They influence the distribution of matter and energy, triggering star formation and even galactic mergers."
//         },
//         {
//             "title": "Observing Black Holes",
//             "template_id": 8,
//             "texts": [
//                 "Indirectly through their gravitational effects",
//                 "Observing the accretion disk",
//                 "Event Horizon Telescope captured the first image of a black hole's shadow."
//             ],
//             "images": [
//                 "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Galaxy_M87_black_hole_shadow_EHT_image_2019.jpg/1200px-Galaxy_M87_black_hole_shadow_EHT_image_2019.jpg"
//             ],
//             "speaker_notes": "While we can't directly see black holes, we can observe their effects. We study the accretion disk of matter swirling around them, and the Event Horizon Telescope captured the first image of a black hole's shadow."
//         },
//         {
//             "title": "Black Hole Research",
//             "template_id": 10,
//             "texts": [],
//             "images": [
//                 "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Galaxy_M87_black_hole_shadow_EHT_image_2019.jpg/1200px-Galaxy_M87_black_hole_shadow_EHT_image_2019.jpg",
//                 "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Black_hole_event_horizon.svg/1200px-Black_hole_event_horizon.svg.png",
//                 "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Black_hole_artist_concept.jpg/1200px-Black_hole_artist_concept.jpg"
//             ],
//             "speaker_notes": "Research on black holes continues to advance, with new telescopes and technologies providing deeper insights into these enigmatic objects. We're constantly learning more about their formation, properties, and their role in the universe."
//         },
//         {
//             "title": "The Future of Black Hole Research",
//             "template_id": 11,
//             "texts": [],
//             "images": [
//                 "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Galaxy_M87_black_hole_shadow_EHT_image_2019.jpg/1200px-Galaxy_M87_black_hole_shadow_EHT_image_2019.jpg"
//             ],
//             "speaker_notes": "The future of black hole research holds exciting possibilities. With advancements in technology, we can expect to unravel more mysteries about these cosmic giants and their impact on the universe."
//         }
//     ]
// }

// Generate the video
// generateLectureVideo(lecture).catch(console.error);


interface SlideData {
    title: string;
    template_id: number;
    texts: string[];
    images: string[];
    speaker_notes: string;
  }
export default async function engine(original_prompt: string) {
    console.log("Received prompt:", original_prompt);
    const aggregateSource = await aggregateHandler(original_prompt);
    const lecture  = await generateHandler(aggregateSource.data?.youtube, aggregateSource.data?.wikipedia as string, original_prompt);
    if(!lecture) {
        console.error("Error: Lecture content is null or undefined.");
        return;
    }

    // const result = await createPresentation(lecture).catch(console.error);

    // Remove all occurrences of backticks
    let cleanedString = lecture?.replace(/^```json/, '').replace(/```$/, '').trim();

    // Extract only the first valid JSON object (to prevent duplicates)
    const match = cleanedString.match(/\{[\s\S]*\}/);
    if (!match) {
        console.error("Error: No valid JSON object found in lecture.");
        console.error("Received Data:", cleanedString);
        return;
    }
 
    cleanedString = match[0];

    try {
        const lecResult = JSON.parse(cleanedString as string) as Lecture;
        // const ppt = await createPresentation(lecResult).catch(console.error);
        const result = await generateLectureVideo(lecResult).catch(console.error);
        return lecResult;
    } catch (error) {
        console.error("JSON Parsing Error:", error);
        console.error("Faulty JSON:", cleanedString);
    }
    
}
