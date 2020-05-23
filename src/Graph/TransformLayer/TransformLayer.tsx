import React, { ReactNode, useRef } from 'react';
import { ReactComponent as Fit } from '../icons/fit.svg';
import './TransformLayer.scss';

interface IProps {
  children: ReactNode | ReactNode[];
}

const TransformLayer: React.FC<IProps> = ({ children }) => {

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
  /** Точка начала зума */
  const scaleOrigin = useRef({ x: 0, y: 0 });

  /** Скролл */
  const scroll = useRef({ x: 0, y: 0 });


  // -------------------------------------------------------------------------------------------------------------------

  /** Прокурутки */
  const onWheel = (e: React.WheelEvent) => {
    if (layer.current) {
      const scene = layer.current.firstElementChild as HTMLDivElement;

      /** Zoom in/out */
      if (e.ctrlKey) {
        const cs = scale.current;
        scale.current += e.deltaY * -restrictions.scaleStep;
        scale.current = Math.min(Math.max(restrictions.minZoom, scale.current), restrictions.maxZoom);

        const ratio = 1 - scale.current / cs;
        scroll.current.x += (e.clientX + scroll.current.x) * ratio;
        scroll.current.y += (e.clientY + scroll.current.y) * ratio;

        scaleOrigin.current.x = e.clientX * ratio;
        scaleOrigin.current.y = e.clientY * ratio;

        scene.style.transformOrigin = `center`;

        scene.style.transform = `scale(${scale.current}) translate(${scroll.current.x}px, ${scroll.current.y}px)`;
      } else {
        /** Scroll X */
        scroll.current.x += e.deltaX * -restrictions.scrollStep;
        scroll.current.x = Math.min(Math.max(restrictions.minScrollX, scroll.current.x), restrictions.maxScrollX);
        scene.style.transform = `scale(${scale.current}) translate(${scroll.current.x}px, ${scroll.current.y}px)`;

        /** Scroll Y */
        scroll.current.y += e.deltaY * -restrictions.scrollStep;
        scroll.current.y = Math.min(Math.max(restrictions.minScrollY, scroll.current.y), restrictions.maxScrollY);
        scene.style.transform = `scale(${scale.current}) translate(${scroll.current.x}px, ${scroll.current.y}px)`;
      }

    }
  }

  // -------------------------------------------------------------------------------------------------------------------

  /** Помещаем сцену в экран */
  const fitToScreen = () => {
    if (layer.current) {
      const scene = layer.current.firstElementChild as HTMLDivElement;
      scene.style.transition = `transform ${animations.transition / 1000}s ease-in-out`;
      scene.style.transformOrigin = 'center';

      const initWidth = scene.scrollWidth;
      const initHeight = scene.scrollHeight;

      const rx = layer.current.offsetWidth / scene.scrollWidth;
      const ry = layer.current.offsetHeight / scene.scrollHeight;

      scale.current = Math.max(Math.min(rx, ry) * 0.98, restrictions.minZoom);

      scroll.current.x = ((scale.current * scene.scrollWidth) - initWidth) / 2;
      scroll.current.y = ((scale.current * scene.scrollHeight) - initHeight) / 2;

      scene.style.transform = `scale(${scale.current}) translate(${scroll.current.x}px, ${scroll.current.y}px)`;

      setTimeout(() => {
        scene.style.transition = 'none';
      }, animations.transition);
    }
  }

  // -------------------------------------------------------------------------------------------------------------------

  return (
    <div className='transform-layer' ref={layer} onWheel={onWheel}>
      {children}
      <div className='overlay-block'>
        <button className='overlay-block__button' onClick={fitToScreen}>
          <Fit/>
        </button>
      </div>
    </div>
  );
};

export default TransformLayer;
