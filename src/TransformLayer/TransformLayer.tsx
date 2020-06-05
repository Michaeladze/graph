import React, { ReactNode, useCallback, useEffect, useRef } from 'react';
import { ReactComponent as Fit } from '../icons/fit.svg';
import { ReactComponent as Reset } from '../icons/reset.svg';
import { ReactComponent as ScreenShot } from '../icons/screenshot.svg';
import './TransformLayer.scss';

interface IProps {
  children: ReactNode | ReactNode[];
  /** Восстановить вид */
  reset: () => void;
  /** Сделать скриншот */
  onScreenshot?: (e: HTMLElement | null, w: number, h: number, cb: () => void) => void;
  /** Сцена */
  scene: HTMLDivElement | null;
  /** Сцена SVG */
  sceneSvg: SVGSVGElement | null;
}

const TransformLayer: React.FC<IProps> = ({
  children, reset, onScreenshot, scene, sceneSvg 
}) => {

  const isMac = useRef<boolean>(navigator.platform.indexOf('Mac') > -1)

  /** Ограничения */
  const restrictions = {
    minZoom: 0.125,
    maxZoom: 4,
    scaleStep: isMac.current ? 0.01 : 0.07,
    scrollStep: isMac.current ? 1 : 30,
    minScrollX: -3000,
    maxScrollX: 3000,
    minScrollY: -3000,
    maxScrollY: 3000
  };

  /** Анимации */
  const animations = {
    transition: 500
  };

  // -------------------------------------------------------------------------------------------------------------------

  const layer = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);

  /** Увеличение / Уменьшение */
  const scale = useRef<number>(1);
  /** Скролл */
  const scroll = useRef({ x: 0, y: 0 });

  // -------------------------------------------------------------------------------------------------------------------

  /** Прокурутки */
  const onWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();

      const deltaX = isMac.current ? e.deltaX : e.deltaX === 0 ? 0 : e.deltaX > 0 ? 1 : -1;
      const deltaY = isMac.current ? e.deltaY : e.deltaY === 0 ? 0 : e.deltaY > 0 ? 1 : -1;

      if (scene && sceneSvg) {
        /** Zoom in/out */
        if (e.ctrlKey) {
          scale.current += deltaY * -restrictions.scaleStep;
          scale.current = Math.min(Math.max(restrictions.minZoom, scale.current), restrictions.maxZoom);
        } else {
          if (e.shiftKey) {
            /** Scroll X on shift */
            scroll.current.x += deltaY * -restrictions.scrollStep;
            scroll.current.x = Math.min(Math.max(restrictions.minScrollX, scroll.current.x), restrictions.maxScrollX);
          } else {
            /** Scroll X */
            scroll.current.x += deltaX * -restrictions.scrollStep;
            scroll.current.x = Math.min(Math.max(restrictions.minScrollX, scroll.current.x), restrictions.maxScrollX);

            /** Scroll Y */
            scroll.current.y += deltaY * -restrictions.scrollStep;
            scroll.current.y = Math.min(Math.max(restrictions.minScrollY, scroll.current.y), restrictions.maxScrollY);
          }
        }

        scene.style.transform = `scale(${scale.current}) translate(${scroll.current.x}px, ${scroll.current.y}px)`;
        const g: SVGGElement = sceneSvg.firstElementChild as SVGGElement;
        g.style.transform = `scale(${scale.current}) translate(${scroll.current.x}px, ${scroll.current.y}px)`;
      }
    },
    [scene]
  );

  // -------------------------------------------------------------------------------------------------------------------

  useEffect(() => {
    layer.current && layer.current.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      layer.current && layer.current.removeEventListener('wheel', onWheel);
    };
  }, [layer.current]);

  // -------------------------------------------------------------------------------------------------------------------

  /** Помещаем сцену в экран */
  const fitToScreen = () => {
    if (layer.current && scene && sceneSvg) {
      const g: SVGGElement = sceneSvg.firstElementChild as SVGGElement;

      scene.style.transition = `transform ${animations.transition / 1000}s ease-in-out`;
      g.style.transition = `transform ${animations.transition / 1000}s ease-in-out`;
      scene.style.transformOrigin = 'center';
      g.style.transformOrigin = 'center';

      const initWidth = scene.scrollWidth;
      const initHeight = scene.scrollHeight;

      const rx = layer.current.offsetWidth / scene.scrollWidth;
      const ry = layer.current.offsetHeight / scene.scrollHeight;

      scale.current = Math.max(Math.min(rx, ry) * 0.98, restrictions.minZoom);

      scroll.current.x = (scale.current * scene.scrollWidth - initWidth) / 2;
      scroll.current.y = (scale.current * scene.scrollHeight - initHeight) / 2;

      scene.style.transform = `scale(${scale.current}) translate(${scroll.current.x}px, ${scroll.current.y}px)`;
      g.style.transform = `scale(${scale.current}) translate(${scroll.current.x}px, ${scroll.current.y}px)`;

      setTimeout(() => {
        scene.style.transition = 'none';
        g.style.transition = 'none';
      }, animations.transition);
    }
  };

  // -------------------------------------------------------------------------------------------------------------------

  /** Скриншот */
  const onScreenShot = () => {
    if (onScreenshot && layer.current && overlay.current && scene && sceneSvg) {
      const g: SVGGElement = sceneSvg.firstElementChild as SVGGElement;
      let style: string = 'scale(1) translate(0px, 0px)';

      // todo Пока такое решение. Оно дергает экран.

      scene.style.transform = style;
      g.style.transform = style;
      overlay.current.style.opacity = '0';

      const { width, height }: DOMRect = g.getBoundingClientRect();
      const EXTRA_SPACE: number = 50;
      onScreenshot(layer.current, width + EXTRA_SPACE, height + EXTRA_SPACE, () => {
        style = `scale(${scale.current}) translate(${scroll.current.x}px, ${scroll.current.y}px)`;
        scene.style.transform = style;
        g.style.transform = style;
        (overlay.current as HTMLDivElement).style.opacity = '1';
      });
    }
  };

  // -------------------------------------------------------------------------------------------------------------------

  return (
    <div className='transform-layer' ref={layer}>
      {children}
      <div className='overlay-block' ref={overlay}>
        <button className='overlay-block__button' onClick={fitToScreen}>
          <Fit />
        </button>
        <button className='overlay-block__button' onClick={reset}>
          <Reset />
        </button>
        <button className='overlay-block__button overlay-block__button-photo' onClick={onScreenShot}>
          <ScreenShot />
        </button>
      </div>
    </div>
  );
};

export default TransformLayer;
