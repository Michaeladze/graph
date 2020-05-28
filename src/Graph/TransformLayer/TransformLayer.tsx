import React, { ReactNode, useRef } from 'react';
import { ReactComponent as Fit } from '../icons/fit.svg';
import { ReactComponent as Reset } from '../icons/reset.svg';
import './TransformLayer.scss';

interface IProps {
  children: ReactNode | ReactNode[];
  /** Восстановить вид */
  reset: () => void;
  /** Сцена */
  scene: HTMLDivElement | null;
  /** Сцена SVG */
  sceneSvg: SVGSVGElement | null;
}

const TransformLayer: React.FC<IProps> = ({ children, reset, scene, sceneSvg }) => {

  /** Ограничения */
  const restrictions = {
    minZoom: 0.125,
    maxZoom: 4,
    scaleStep: 0.01,
    scrollStep: 1,
    minScrollX: -3000,
    maxScrollX: 3000,
    minScrollY: -3000,
    maxScrollY: 3000
  }

  /** Анимации */
  const animations = {
    transition: 500
  }

  // -------------------------------------------------------------------------------------------------------------------

  const layer = useRef<HTMLDivElement>(null);

  /** Увеличение / Уменьшение */
  const scale = useRef<number>(1);
  /** Скролл */
  const scroll = useRef({ x: 0, y: 0 });


  // -------------------------------------------------------------------------------------------------------------------

  /** Прокурутки */
  const onWheel = (e: React.WheelEvent) => {
    if (scene && sceneSvg) {

      /** Zoom in/out */
      if (e.ctrlKey) {
        scale.current += e.deltaY * -restrictions.scaleStep;
        scale.current = Math.min(Math.max(restrictions.minZoom, scale.current), restrictions.maxZoom);
      } else {
        /** Scroll X */
        scroll.current.x += e.deltaX * -restrictions.scrollStep;
        scroll.current.x = Math.min(Math.max(restrictions.minScrollX, scroll.current.x), restrictions.maxScrollX);

        /** Scroll Y */
        scroll.current.y += e.deltaY * -restrictions.scrollStep;
        scroll.current.y = Math.min(Math.max(restrictions.minScrollY, scroll.current.y), restrictions.maxScrollY);
      }

      scene.style.transform = `scale(${scale.current}) translate(${scroll.current.x}px, ${scroll.current.y}px)`;
      const g: SVGGElement = sceneSvg.firstElementChild as SVGGElement;
      g.style.transform = `scale(${scale.current}) translate(${scroll.current.x}px, ${scroll.current.y}px)`;

    }
  }

  // -------------------------------------------------------------------------------------------------------------------

  /** Помещаем сцену в экран */
  const fitToScreen = () => {
    if (layer.current && scene && sceneSvg) {
      const g: SVGGElement = sceneSvg.firstElementChild as SVGGElement;

      scene.style.transition = `transform ${animations.transition / 1000}s ease-in-out`;
      g.style.transition = `transform ${animations.transition / 1000}s ease-in-out`;
      scene.style.transformOrigin = 'center';

      const initWidth = scene.scrollWidth;
      const initHeight = scene.scrollHeight;

      const rx = layer.current.offsetWidth / scene.scrollWidth;
      const ry = layer.current.offsetHeight / scene.scrollHeight;

      scale.current = Math.max(Math.min(rx, ry) * 0.98, restrictions.minZoom);

      scroll.current.x = ((scale.current * scene.scrollWidth) - initWidth) / 2;
      scroll.current.y = ((scale.current * scene.scrollHeight) - initHeight) / 2;

      scene.style.transform = `scale(${scale.current}) translate(${scroll.current.x}px, ${scroll.current.y}px)`;
      g.style.transform = `scale(${scale.current}) translate(${scroll.current.x}px, ${scroll.current.y}px)`;

      setTimeout(() => {
        scene.style.transition = 'none';
        g.style.transition = 'none';
      }, animations.transition);
    }
  }

  // -------------------------------------------------------------------------------------------------------------------

  return (
    <div className='transform-layer' ref={layer} onWheel={onWheel}>
      {children}
      <div className='overlay-block'>
        <button className='overlay-block__button' onClick={reset}>
          <Reset/>
        </button>
        <button className='overlay-block__button' onClick={fitToScreen}>
          <Fit/>
        </button>
      </div>
    </div>
  );
};

export default TransformLayer;
