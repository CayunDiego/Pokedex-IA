import type { SVGProps } from 'react';

export function PokeballIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" />
      <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" />
      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.5" fill="var(--background-hsl, #fff)" stroke="none" />
    </svg>
  );
}
