import { NextRequest } from "next/server";
import { spawn } from "child_process";
import path from "path";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("videoId");

    if (!videoId) {
        return new Response(JSON.stringify({ error: "Missing videoId parameter" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const scriptPath = path.join(process.cwd(), "scripts/youtube_summary.py");

    return new Promise<Response>((resolve) => {
        const pythonBinary = process.env.PYTHON_BINARY || (process.platform === "win32" ? "python" : "python3");
        const pythonProcess = spawn(pythonBinary, [scriptPath, videoId]);

        let output = "";
        pythonProcess.stdout.on("data", (data) => {
            output += data.toString();
        });

        pythonProcess.stderr.on("data", (data) => {
            console.error(`Error: ${data}`);
        });

        pythonProcess.on("close", (code) => {
            if (code === 0) {
                try {
                    const parsedOutput = JSON.parse(output);
                    resolve(new Response(JSON.stringify(parsedOutput), {
                        status: 200,
                        headers: { "Content-Type": "application/json" },
                    }));
                } catch (error) {
                    resolve(new Response(JSON.stringify({ error: "Failed to parse Python response" }), {
                        status: 500,
                        headers: { "Content-Type": "application/json" },
                    }));
                }
            } else {
                resolve(new Response(JSON.stringify({ error: "Python script execution failed" }), {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                }));
            }
        });
    });
}
