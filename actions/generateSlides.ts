import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import aggregateHandler from './aggregateResearch';

export default async function generateslideHandler(query: string) {
  const { data } = await aggregateHandler(query);

  try {
    const model = process.env.GEMINI_MODEL ?? "gemini-3.6-flash";
    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;


    const response = await axios.post(
      geminiApiUrl,
      { data, tokenLimit: 1500000 },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const slides = response.data;
    // console.log("slides",slides);
    return { slides };
  } catch (error) {
    return {
        error
    }
  }
}
