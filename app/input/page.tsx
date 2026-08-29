"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import engine from "@/actions/engine/s2v";
import withAuth from "@/components/withAuth";

function Input() {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    return (
        <div className="grid grid-cols-12 h-screen w-screen">
            <div className="col-span-2 border-r border-slate-800 pt-20 overflow-y-auto">
                <div className="p-8">
                    <p className="font-sans text-2xl text-white">Recent</p>
                </div>
            </div>

            <div className="col-span-10 bg-slate-950 pt-28 text-white px-6 overflow-y-auto">
                <div className="rounded-2xl bg-[url('../public/inputBackground_adapted.svg')] bg-center bg-cover flex justify-center p-96">
                    <div className="flex flex-col justify-center items-center">
                        <div className="text-4xl pb-10 flex flex-col items-center gap-2">
                            <span className="font-semibold">Teach me</span> 
                            <input 
                                onChange={(e) => setPrompt(e.target.value)}
                                className="rounded-full border border-slate-800 bg-black p-5 pb-4"
                                type="text"
                                placeholder="name a topic..."
                                disabled={loading} // Disable input while loading
                            />
                        </div>

                        <div>
                            <button
                                className={`font-bold bg-white text-black text-2xl rounded-md transition-all px-10 py-3 ${
                                    loading ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-200 cursor-pointer"
                                }`}
                                disabled={loading}
                                onClick={async () => {
                                    setLoading(true);
                                    try {
                                        const result = await engine(prompt);
                                        localStorage.setItem("result", JSON.stringify(result));
                                        router.push("/dashboard");
                                    } catch (error) {
                                        console.error("Error:", error);
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                            >
                                {loading ? "Preparing..." : "Learn"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default withAuth(Input);
