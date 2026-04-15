interface BrandLogoMarkProps {
  className?: string;
  iconClassName?: string;
}

export default function BrandLogoMark({
  className = "h-8 w-8 rounded-lg",
  iconClassName = "h-5 w-5 text-black",
}: BrandLogoMarkProps) {
  return (
    <div className={`flex items-center justify-center bg-green-accent ${className}`}>
      <svg
        className={iconClassName}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <circle cx="10.8" cy="12.2" r="5.1" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="8.9" cy="11.8" r="0.9" fill="currentColor" />
        <circle cx="12.7" cy="11.8" r="0.9" fill="currentColor" />
        <path
          d="M8.2 14.2c.8.7 1.7 1.1 2.7 1.1 1 0 2-.4 2.7-1.1"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M9.9 7.3 7.2 5.3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="6.4" cy="4.7" r="1" fill="currentColor" />
        <circle cx="15.7" cy="12.2" r="3" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M17.9 14.4 20.5 16.9"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
