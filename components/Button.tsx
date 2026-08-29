import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { EventHandler } from "react";

export function Button({ children, onClick }: { children: React.ReactNode, onClick: () => void }) {
    const router = useRouter();
    return <button className="bg-purple-800 text-center w-full py-3 text-black text-xl font-semibold rounded-md hover:bg-purple-900 cursor-pointer transition-all" onClick={onClick}>{ children }</button>
}