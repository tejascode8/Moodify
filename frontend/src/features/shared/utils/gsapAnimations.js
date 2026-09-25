/**
 * GSAP Animation helper library for Moodify
 */

export const staggerEntrance = (selector, options = {}) => {
  if (!window.gsap) return;
  const { delay = 0.1, y = 20, stagger = 0.08, duration = 0.6 } = options;

  window.gsap.fromTo(
    selector,
    { opacity: 0, y },
    {
      opacity: 1,
      y: 0,
      duration,
      stagger,
      delay,
      ease: "power3.out",
      clearProps: "all",
    }
  );
};

export const pulseScale = (element) => {
  if (!window.gsap || !element) return;

  window.gsap.fromTo(
    element,
    { scale: 0.94 },
    {
      scale: 1,
      duration: 0.45,
      ease: "elastic.out(1.2, 0.4)",
    }
  );
};

export const animateTrackChange = (element) => {
  if (!window.gsap || !element) return;

  window.gsap.fromTo(
    element,
    { opacity: 0, x: -10 },
    {
      opacity: 1,
      x: 0,
      duration: 0.35,
      ease: "power2.out",
    }
  );
};
