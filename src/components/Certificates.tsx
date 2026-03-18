"use client";

import { useState } from "react";
import Image from "next/image";

interface Certificate {
  title: string;
  description: string;
  image: string;
}

const certificates: Certificate[] = [
  {
    title: "全国大学生智能建造竞赛 一等奖",
    description: "第一届（2025）全国大学生智能建造竞赛 土木组",
    image: "/certificates/ad409b07413d582176d4882ec61560bd.JPG",
  },
  {
    title: "LSCAT 江苏省笔译大赛 二等奖",
    description: "2024 年第十届\u201CLSCAT\u201D杯江苏省笔译大赛 汉译英本科组",
    image: "/certificates/Snipaste_2024-07-02_22-17-31.png",
  },
  {
    title: "外教社·词达人杯 校赛二等奖",
    description: "第四届\u201C外教社\u00B7词达人杯\u201D全国大学生英语词汇能力大赛",
    image: "/certificates/mmexportdc6fda8c26d5367ac8abae7a57269420_1717483630014.png",
  },
];

function ImagePlaceholder() {
  return (
    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
      <svg
        className="w-12 h-12 text-slate-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
        />
      </svg>
    </div>
  );
}

export default function Certificates() {
  const [selected, setSelected] = useState<Certificate | null>(null);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

  const handleImageError = (image: string) => {
    setImgErrors((prev) => new Set(prev).add(image));
  };

  return (
    <section id="certificates" className="py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-12">
          <span className="text-accent font-display text-sm font-semibold tracking-widest uppercase">
            荣誉证书
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2 tracking-tight">
            证书与荣誉
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert) => (
            <button
              key={cert.title}
              onClick={() => setSelected(cert)}
              className="group text-left rounded-2xl border border-border bg-white overflow-hidden hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                {imgErrors.has(cert.image) ? (
                  <ImagePlaceholder />
                ) : (
                  <Image
                    src={cert.image}
                    alt={cert.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={() => handleImageError(cert.image)}
                  />
                )}
              </div>
              <div className="p-5">
                <h3 className="font-display font-semibold text-foreground">
                  {cert.title}
                </h3>
                <p className="text-sm text-muted mt-1">{cert.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox dialog */}
      {selected && (
        <dialog
          open
          className="fixed inset-0 z-50 flex items-center justify-center bg-transparent"
        >
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          />
          <div className="relative z-10 max-w-3xl w-full mx-4 bg-white rounded-2xl overflow-hidden shadow-2xl">
            <div className="relative aspect-[4/3]">
              {imgErrors.has(selected.image) ? (
                <ImagePlaceholder />
              ) : (
                <Image
                  src={selected.image}
                  alt={selected.title}
                  fill
                  className="object-contain bg-slate-50"
                />
              )}
            </div>
            <div className="p-6 flex items-center justify-between">
              <div>
                <h3 className="font-display font-semibold text-foreground text-lg">
                  {selected.title}
                </h3>
                <p className="text-sm text-muted mt-1">
                  {selected.description}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="shrink-0 ml-4 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                aria-label="关闭"
              >
                <svg
                  className="w-5 h-5 text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </dialog>
      )}
    </section>
  );
}
