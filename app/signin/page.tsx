"use client"
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { toast } from 'sonner';

export default function Signin() {

    const router = useRouter();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [checkingPassword, setCheckingPassword] = useState(false);
    const [requiredError, setRequiredError] = useState({
        emailReq: false,
        passReq: false,
    });
    const email = useRef('');
    const password = useRef('');

    function togglePasswordVisibility() {
        setIsPasswordVisible((prevState: any) => !prevState);
    }

    const handleSubmit = async (e?: React.FormEvent<HTMLButtonElement>) => {
        
        const loadId = toast.loading('Signing in...');

        if (e) {
            e.preventDefault();
        }

        if (!email.current || !password.current) {
            setRequiredError({
                emailReq: email.current ? false : true,
                passReq: password.current ? false : true,
            });
            toast.dismiss(loadId);
            return;
        }

        const res = await signIn("credentials", {
            username: email.current,
            password: password.current,
            redirect: false,
        });

        toast.dismiss(loadId);
        if (!res?.error) {
            router.push("/input");
            toast.success('Signed In');
        } else {
            toast.error('oops something went wrong..!');
        }
        
    }


    return <div className="flex justify-center h-screen">
        <div className="flex flex-col justify-center pt-32">
            <div className="border border-slate-800 text-white px-10 pb-12 pt-8 max-w-lg rounded-md text-3xl">
                <div className="font-semibold text-left pr-24">
                    Signin to your Account
                </div>
                <div className="pt-7 pb-4">
                    <div className="text-lg font-semibold pb-4">
                        Email
                    </div>
                    <div className="">
                        <input onChange={(e) => {setRequiredError((prevState) => ({
                            ...prevState,
                            emailReq: false,
                        }));
                            email.current = e.target.value;
                        }} name="email" id="email" type="email" placeholder="name@email.com" className="w-full h-12 rounded-md border border-slate-800 bg-black p-4 pb-4 text-lg focus:border-purple-800 focus:outline-none focus:ring-2 ring-purple-800" />
                    </div>
                </div>
                <div className="pb-4">
                    <div className="text-lg font-semibold pb-4">
                        Password
                    </div>
                    <div>
                        <input onChange={(e) => {setRequiredError((prevState) => ({
                            ...prevState,
                            passReq: false,
                        }));
                            password.current = e.target.value;
                  }} type={isPasswordVisible ? 'text' : 'password'} name="password" id="password" placeholder="••••••••" className="w-full h-12 rounded-md bg-black border border-slate-800 p-4 pb-4 text-lg focus:border-purple-800 focus:outline-none focus:ring-2 ring-purple-800" />
                    </div>
                </div>
                <div className={`group ${!email.current || !password.current ? 'pointer-events-none' : ''}`}>
                <button id="login" name="login" className={`bg-purple-800 text-center w-full py-3 text-black text-xl font-semibold rounded-md hover:bg-purple-900 cursor-pointer transition-all ${!email.current || !password.current ? 'cursor-default bg-purple-950' : 'bg-purple-800 text-center w-full py-3 text-black text-xl font-semibold rounded-md hover:bg-purple-900 cursor-pointer transition-all'}`} onClick={handleSubmit} disabled={!email.current || !password.current}>Login</button>
                </div>
            </div>
        </div>
    </div>
}