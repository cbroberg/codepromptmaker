interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = "", showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Circular icon with prompt/code elements */}
      <svg 
        width="32" 
        height="32" 
        viewBox="0 0 32 32" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Circle background with gradient */}
        <circle cx="16" cy="16" r="16" fill="url(#logoGradient)" />
        
        {/* Left angle bracket - code symbol */}
        <path 
          d="M13 10L8 16L13 22" 
          stroke="white" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        
        {/* Right angle bracket - code symbol */}
        <path 
          d="M19 10L24 16L19 22" 
          stroke="white" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        
        {/* Center prompt cursor */}
        <path 
          d="M16 12V20" 
          stroke="white" 
          strokeWidth="2" 
          strokeLinecap="round"
          opacity="0.8"
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient 
            id="logoGradient" 
            x1="0" 
            y1="0" 
            x2="32" 
            y2="32" 
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#6366F1" /> {/* indigo-500 */}
            <stop offset="100%" stopColor="#06B6D4" /> {/* cyan-500 */}
          </linearGradient>
        </defs>
      </svg>
      
      {/* Text logo */}
      {showText && (
        <span className="text-xl font-semibold tracking-tight">
          Code<span className="font-normal">Prompt</span>Maker
        </span>
      )}
    </div>
  );
}
