"use server"
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { prompt } = req.body;
  
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }
  
    // Example search queries based on the input prompt
    const youtubeQuery = `${prompt} site:youtube.com`;
    const wikipediaQuery = `${prompt} site:wikipedia.org`;
    const textbookQuery = `${prompt} OpenStax`;
  
    return {
      queries: {
        youtubeQuery,
        wikipediaQuery,
        textbookQuery
      }
    };
}

