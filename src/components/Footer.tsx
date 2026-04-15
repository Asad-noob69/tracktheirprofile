import BrandLogoMark from "@/components/BrandLogoMark";

export default function Footer() {
  return (
    <footer className="border-t border-card-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <BrandLogoMark className="h-6 w-6 rounded-md" iconClassName="object-contain" />
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
