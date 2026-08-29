import sys
import json
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import TextFormatter

def get_transcript(video_id):
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        formatter = TextFormatter()
        text_transcript = formatter.format_transcript(transcript)
        return text_transcript
    except Exception as e:
        error_message = str(e)
        if "No transcripts were found" in error_message:
            return "Summary not available"
        return f"Error: {error_message}"

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Missing videoId"}))
    else:
        video_id = sys.argv[1]
        transcript = get_transcript(video_id)
        print(json.dumps({"summary": transcript}))
