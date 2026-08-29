"use client";

import { useState, useEffect } from "react";
import { BsMoonStars } from "react-icons/bs";

export default function ThemeToggle() {
    

    return <button className="flex flex-col justify-center text-white font-semibold rounded-lg px-4 py-2 text-lg border border-slate-800 hover:bg-slate-800 transition-all cursor-pointer">
        <BsMoonStars />
    </button>
}