"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  useEffect(() => {
    const clearLenisClasses = () => {
      document.documentElement.classList.remove(
        "lenis",
        "lenis-smooth",
        "lenis-stopped",
        "lenis-scrolling",
      );
    };

    if (isAdminRoute) {
      clearLenisClasses();
      return;
    }

    const lenis = new Lenis({
      duration: 1,        // smoothness time
      smoothWheel: true,
    });

    let rafId = 0;

    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      clearLenisClasses();
    };
  }, [isAdminRoute]);

  return <>{children}</>;
}
