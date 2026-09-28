import { useEffect, useState } from 'react';

/** Mirrors the old small-screen breakpoint (Tailwind sm = 640px). */
export function useIsSmallScreen(): boolean {
  const [isSmall, setIsSmall] = useState<boolean>(
    () => window.matchMedia('(max-width: 639px)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const onChange = (e: MediaQueryListEvent) => setIsSmall(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return isSmall;
}
