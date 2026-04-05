export default function Footer() {
  return (
    <footer className="border-t border-card-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-green-accent">
              <svg
                className="h-3.5 w-3.5 text-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold text-zinc-400">
              Track<span className="text-green-accent">Their</span>Profile
            </span>
          </div>
          <p className="text-xs text-zinc-600">
            &copy; {new Date().getFullYear()} TrackTheirProfile. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
