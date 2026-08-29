"use server"
import axios from 'axios';

export default async function openstackHandler(query: string) {

  try {
    const url = `https://openstax.org/books?query=${query}`;
    const response = await axios.get(url);

    // Assuming OpenStax returns HTML content, parse as needed
    return { content: response.data };
  } catch (error) {
    return {
        error
    }
  }
}

