async function getCaptions(videoId) {
    const url = `https://youtubetranscript.com/?server_vid=${videoId}`;
    
    try {
        const response = await fetch(url);
        const text = await response.text();
        console.log("Transcript:", text);
    } catch (error) {
        console.error("Error fetching captions:", error);
    }
}

getCaptions("MFhxShGxHWc");