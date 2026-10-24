"use client";

import { useState } from "react";

export function YouTubeLite({ id, title }: { id: string; title: string }) {
  const [active, setActive] = useState(false);
  const thumb = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

  if (active) {
    return (
      <iframe
        className="aspect-video w-full rounded-2xl border border-line bg-black"
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    );
  }

  return (
    <button
      type="button"
      className="group relative aspect-video w-full overflow-hidden rounded-2xl border border-line bg-black text-left"
      onClick={() => setActive(true)}
      aria-label={`Play ${title}`}
    >
      {/* Thumbnail is a remote YouTube preview; next/image sizing is handled via intrinsic aspect box. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thumb}
        alt=""
        width={480}
        height={270}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover opacity-90 transition group-hover:opacity-100 group-hover:scale-[1.02]"
      />
      <span className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20" aria-hidden="true" />
      <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-brand-gradient text-white shadow-glow" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="ml-0.5 h-6 w-6 fill-current"><path d="M8 5v14l11-7z" /></svg>
      </span>
    </button>
  );
}
