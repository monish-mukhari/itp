"use client"

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";  
import { Poppins } from 'next/font/google';
import AppBar from "@/components/AppBar";
import { PiMedalFill } from "react-icons/pi";
//@ts-ignore
import Fade from "react-reveal/Fade";
import { TypeAnimation } from 'react-type-animation';
import localFont from 'next/font/local';
import { cn } from '@/lib/utils';

const textFont = Poppins({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
});

const headingFont = localFont({
  src: '../public/fonts/font.woff2',
});


export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/input");
    }
  }, [status, router]);

  if (status === "loading") {
      return <div>Loading...</div>;
  }

  return (
    <div className={
      headingFont.className
    }>
      <div className="pt-72 pb-5 flex justify-center">
        <div className="text-purple-800 rounded-full bg-white max-w-screen px-6 py-3 flex justify-center gap-2 font-sans text-lg font-semibold uppercase">
                <div className="flex flex-col justify-center text-3xl">
                  <PiMedalFill />
                </div>
                <div className='flex flex-col justify-center'>
                  #1 AI TUTORING PLATFORM
                </div>  
            </div>
      </div>


      <div className="flex justify-center">

        <div>

          <div className="pb-2">
              <h1 className="mb-3 bg-gradient-to-r from-purple-500 to-purple-900 bg-clip-text text-center text-transparent text-4xl md:mb-4 md:text-7xl">
              LearnLand
              </h1>
          </div>

          <div className="text-white text-7xl">
            Learn through conversations!
          </div>




          <div className="flex justify-center pt-7 pb-10">
            <h1 className="text-white text-6xl">
                Not 
                <TypeAnimation
                  className="inline-block text-6xl pl-5 text-purple-600"
                  sequence={[
                    // Same substring at the start will only be typed out once, initially
                    "Textbooks.",
                    3000, // wait 1s before replacing "Mice" with "Hamsters"
                    "Lectures.",
                    3000,
                    "Articles.",
                    3000,
                  ]}
                  wrapper="span"
                  speed={30}
                  repeat={Infinity}
                />
              </h1>
          </div>

          <div
          className={cn(
            'mx-auto mt-4 max-w-sm px-2 text-center text-4xl text-neutral-400 dark:text-neutral-500 md:max-w-3xl md:text-2xl',
            textFont.className,
          )}
        >
         You can learn any topic before an exam, even if you have no prior knowledge about it!
        </div>
        
        </div>
      </div>
    </div>
    
  );
}
