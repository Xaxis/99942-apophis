"use client";

import dynamic from "next/dynamic";

const ApophisSimulator = dynamic(() => import("@/components/ApophisSimulator"), {
    ssr: false,
});

export default function Home() {
    return <ApophisSimulator />;
}
