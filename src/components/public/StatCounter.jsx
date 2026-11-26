import { useEffect, useRef } from 'react';
import { gsap } from '../../lib/scroll';

export default function StatCounter({ value = '0' }) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const numeric = Number.parseFloat(String(value).replace(/[^\d.]/g, '')) || 0;
    const suffix = String(value).replace(/[\d.,]/g, '');
    const decimals = String(value).includes('.') ? 1 : 0;
    const digitMatch = String(value).match(/\d+/);
    const minDigits = digitMatch ? digitMatch[0].length : 1;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || numeric === 0) {
      node.textContent = value;
      return undefined;
    }
    const state = { current: 0 };
    const tween = gsap.to(state, {
      current: numeric,
      duration: 1.5,
      ease: 'power3.out',
      scrollTrigger: { trigger: node, start: 'top 94%', once: true },
      onUpdate: () => {
        const current = decimals
          ? state.current.toFixed(1)
          : String(Math.round(state.current)).padStart(minDigits, '0');
        node.textContent = `${current}${suffix}`;
      },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [value]);

  return <span ref={ref}>{value}</span>;
}
