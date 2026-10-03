"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PersonPage } from "@/components/person-page";

function PersonBioInner() {
  const searchParams = useSearchParams();
  return <PersonPage id={Number(searchParams.get("id"))} />;
}

export default function PersonBioRoute() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">
          <div className="h-48 animate-pulse rounded-md bg-[var(--surface)]" />
        </div>
      }
    >
      <PersonBioInner />
    </Suspense>
  );
}
