"use client";

import { PANCHAKARMA_THERAPIES } from "@/lib/data/panchakarma";
import { PanchakarmaReelsView } from "@/components/media/PanchakarmaReelsView";

export default function PanchakarmaGuidePage() {
  return (
    <div className="w-full h-[calc(100dvh-4rem)] md:h-[100dvh] bg-zinc-950 overflow-hidden">
      <PanchakarmaReelsView therapies={PANCHAKARMA_THERAPIES} />
    </div>
  );
}
