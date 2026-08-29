"use server"
import axios from 'axios';

export default async function wikipediahandler(query: string) {

  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${query}&format=json`;

    const response = await axios.get(url);
    const pages = response.data.query.search;

    return { pages };
  } catch (error) {
    return {
        error
    }
  }
}
