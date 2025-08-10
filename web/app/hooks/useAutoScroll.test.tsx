import React, { useEffect, useRef, useState } from 'react';
import { render, screen } from '@testing-library/react';
import { act } from 'react';
import { useAutoScroll } from './useAutoScroll';

function TestAutoScroll({ setterRef }: { setterRef: React.MutableRefObject<(v: number) => void> }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    setterRef.current = (v: number) => setCount(v);
  }, [setterRef]);

  useAutoScroll(containerRef, endRef, [count]);

  return (
    <div
      ref={containerRef}
      data-testid="container"
      style={{ height: 200, overflowY: 'auto' }}
    >
      <div style={{ height: 2000 }}>
        content
        <div ref={endRef} data-testid="end" />
      </div>
    </div>
  );
}

describe('useAutoScroll', () => {
  it('auto-scrolls when near bottom and watch changes', () => {
    const setterRef = { current: (_v: number) => {} };
    render(<TestAutoScroll setterRef={setterRef} />);

    const container = screen.getByTestId('container');
    const end = screen.getByTestId('end');

    Object.defineProperty(container, 'scrollHeight', { value: 1200, configurable: true });
    Object.defineProperty(container, 'clientHeight', { value: 200, configurable: true });
    let scrollTop = 1000;
    Object.defineProperty(container, 'scrollTop', {
      get: () => scrollTop,
      set: (v) => { scrollTop = Number(v); },
      configurable: true,
    });

    const spy = vi.spyOn(end, 'scrollIntoView').mockImplementation(() => {});

    act(() => {
      container.dispatchEvent(new Event('scroll'));
    });

    act(() => setterRef.current(1));
    expect(spy).toHaveBeenCalled();
  });

  it('does not auto-scroll when not near bottom', () => {
    const setterRef = { current: (_v: number) => {} };
    render(<TestAutoScroll setterRef={setterRef} />);

    const container = screen.getByTestId('container');
    const end = screen.getByTestId('end');

    Object.defineProperty(container, 'scrollHeight', { value: 2000, configurable: true });
    Object.defineProperty(container, 'clientHeight', { value: 200, configurable: true });
    let scrollTop = 200;
    Object.defineProperty(container, 'scrollTop', {
      get: () => scrollTop,
      set: (v) => { scrollTop = Number(v); },
      configurable: true,
    });

    const spy = vi.spyOn(end, 'scrollIntoView').mockImplementation(() => {});

    act(() => {
      container.dispatchEvent(new Event('scroll'));
    });

    act(() => setterRef.current(2));
    expect(spy).not.toHaveBeenCalled();
  });
});
