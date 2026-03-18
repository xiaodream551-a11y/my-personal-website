export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 py-8">
      <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="font-display text-sm text-slate-400">
          &copy; {year} Your Name. All rights reserved.
        </p>
        <p className="text-xs text-slate-500">
          Built with Next.js &amp; Tailwind CSS
        </p>
      </div>
    </footer>
  );
}
