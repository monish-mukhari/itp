"use server"
import axios from 'axios';

export default async function youtubeHandler(query: string) {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY || "";
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=${apiKey}`;

    const response = await axios.get(url);
    const videos = response.data.items;

    return { videos };
  } catch (error) {
    return {
        error
    }
  }
}
