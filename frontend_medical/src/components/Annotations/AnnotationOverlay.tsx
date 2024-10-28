import React, { useEffect, useRef } from 'react';
import OpenSeadragon from 'openseadragon';
import { Annotation } from '../../services/AnnotationService';

interface AnnotationOverlayProps {
  viewer: OpenSeadragon.Viewer;
  mode: 'rectangle' | 'polygon' | null;
  annotations: Annotation[];
  onAnnotationCreate: (annotation: Annotation) => void;
}

export const AnnotationOverlay: React.FC<AnnotationOverlayProps> = ({
  viewer,
  mode,
  annotations,
  onAnnotationCreate
}) => {
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const overlay = document.createElement('canvas');
    overlay.style.position = 'absolute';
    overlay.style.left = '0';
    overlay.style.top = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.pointerEvents = 'none';

    viewer.canvas.appendChild(overlay);
    overlayRef.current = overlay;
    contextRef.current = overlay.getContext('2d');

    const resizeHandler = () => {
      overlay.width = viewer.canvas.clientWidth;
      overlay.height = viewer.canvas.clientHeight;
      drawAnnotations();
    };

    viewer.addHandler('update-viewport', drawAnnotations);
    viewer.addHandler('resize', resizeHandler);
    resizeHandler();

    return () => {
      viewer.removeHandler('update-viewport', drawAnnotations);
      viewer.removeHandler('resize', resizeHandler);
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    };
  }, [viewer]);

  const drawAnnotations = () => {
    const ctx = contextRef.current;
    const overlay = overlayRef.current;

    if (!ctx || !overlay) return;

    ctx.clearRect(0, 0, overlay.width, overlay.height);
    
    annotations.forEach(annotation => {
      const viewportPoint = new OpenSeadragon.Point(annotation.x, annotation.y);
      const windowPoint = viewer.viewport.viewportToWindowCoordinates(viewportPoint);

      ctx.strokeStyle = annotation.annotation_data.properties?.color || '#ff0000';
      ctx.lineWidth = 2;
      ctx.beginPath();

      if (annotation.type === 'rectangle') {
        const width = annotation.width * viewer.viewport.getZoom();
        const height = annotation.height * viewer.viewport.getZoom();
        ctx.rect(windowPoint.x, windowPoint.y, width, height);
      } else if (annotation.type === 'polygon') {
        // Implementar lógica para polígonos si es necesario
      }

      ctx.stroke();
    });
  };

  useEffect(() => {
    drawAnnotations();
  }, [annotations]);

  return null;
};
