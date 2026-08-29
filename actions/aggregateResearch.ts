"use server";
import youtubeHandler from "./youtubeSearch";
import axios from "axios";
import wikipediaHandler from "./wikipediaSearch";
import openstackHandler from "./openStaxSearch";

interface YouTubeVideo {
  kind: "youtube#searchResult";
  etag: string;
  id: { kind: "youtube#video"; videoId: string };
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: object;
    channelTitle: string;
    liveBroadcastContent: string;
    publishTime: string;
  };
}

interface YouTubePlaylist {
  kind: "youtube#searchResult";
  etag: string;
  id: { kind: "youtube#playlist"; playlistId: string };
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: object;
    channelTitle: string;
    liveBroadcastContent: string;
    publishTime: string;
  };
}

type YouTubeItem = YouTubeVideo | YouTubePlaylist;

// Filtered video type
interface FilteredVideo {
  title: string;
  description: string;
  videoId: string;
  summary?: string;
}

function formatSummaries(videos: FilteredVideo[]): FilteredVideo[] {
  return videos.map(video => ({
    ...video,
    summary: video.summary ? video.summary.replace(/\n/g, ' ').trim() : undefined
  }));
}

// Function to filter only video results
function filterVideos(data: YouTubeItem[]): FilteredVideo[] {
  return data
    .filter((item): item is YouTubeVideo => item.id.kind === "youtube#video") // Type guard for videos
    .map((video) => ({
      title: video.snippet.title,
      description: video.snippet.description,
      videoId: video.id.videoId,
    }));
}

async function fetchVideoSummary(video: FilteredVideo): Promise<FilteredVideo> {
  try {
    const response = await axios.get(`http://localhost:3000/api/run-python?videoId=${video.videoId}`);

return {
  ...video,
  summary: response.data.summary || "Transcript not available",
};
  } catch (error) {
    console.error(`Error fetching summary for ${video.videoId}:`, error);
    return {
      ...video,
      summary: "Failed to fetch summary",
    };
  }
}

// Function to update the global youtubeData with summaries
async function updateYouTubeData(youtubeData: FilteredVideo[]): Promise<FilteredVideo[]> {
  return Promise.all(youtubeData.map(fetchVideoSummary));
}



interface WikipediaPage {
  ns: number;
  title: string;
  pageid: number;
  size: number;
  wordcount: number;
  snippet: string;
  timestamp: string;
}

interface WikipediaData {
  pages?: WikipediaPage[];  // Make pages optional to handle missing cases
  error?: unknown;          // Allow for an error response
}

function getWikipediaSummary(wikipediaData: WikipediaData): string {
  if (!wikipediaData.pages || wikipediaData.pages.length === 0) {
      return "Summary not available";
  }

  return wikipediaData.pages
      .map(page => `**${page.title}**: ${page.snippet.replace(/<span class="searchmatch">|<\/span>/g, '')}`)
      .join("\n\n");
}


export default async function aggregateHandler(query: string) {
  try {
    // Fetch data from YouTube API
    const youtubeResponse = await youtubeHandler(query);

    // Validate the response structure
    if (!youtubeResponse || !Array.isArray(youtubeResponse.videos)) {
      throw new Error("Invalid YouTube API response");
    }

    // Extract YouTube videos
    const youtubeData: YouTubeItem[] = youtubeResponse.videos;

    // Filter YouTube video results
    const filteredVideos = filterVideos(youtubeData);

    console.log(filteredVideos);

    const videosWithSummaries = await updateYouTubeData(filteredVideos);
    const formattedVideos = formatSummaries(videosWithSummaries);
    console.log("Youtube Summary", formattedVideos);
    // console.log(formattedVideos);
    // Fetch additional data (commented out for now)
    const wikipediaData = await wikipediaHandler(query);
    const wikipediaSummary = getWikipediaSummary(wikipediaData);
    console.log("wikipediaSummary", wikipediaSummary);
    // const openStaxData = await openstackHandler(query);

    // Combine data
    const aggregatedData = {
      youtube: formattedVideos,
      wikipedia: wikipediaSummary || "Summary not available",
      // openStax: openStaxData.content
    };

    return {
      status: 200,
      data: aggregatedData,
    };
  } catch (error) {
    return {
      status: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
