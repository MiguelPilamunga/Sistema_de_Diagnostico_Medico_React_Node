import React, { useEffect, useRef, useState } from 'react';
import OpenSeadragon from 'openseadragon';

interface DragSelectorProps {
  viewer: OpenSeadragon.Viewer;
  onSelectionComplete: (rectangle: { x: number; y: number; width: number; height: number }) => void;
}

interface Position {
  x: number;
  y: number;
}

interface DragState {
  startPosition: Position | null;
  currentPosition: Position | null;
}

export const DragSelector: React.FC<DragSelectorProps> = ({ viewer, onSelectionComplete }) => {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [dragState, setDragState] = useState<DragState>({
    startPosition: null,
    currentPosition: null
  });
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (!viewer) return;

    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.cursor = 'crosshair';
    overlay.style.backgroundColor = 'transparent';
    overlay.style.pointerEvents = 'none';

    const selectionBox = document.createElement('div');
    selectionBox.style.position = 'absolute';
    selectionBox.style.border = '2px solid rgba(0, 123, 255, 0.5)';
    selectionBox.style.backgroundColor = 'rgba(0, 123, 255, 0.1)';
    selectionBox.style.display = 'none';
    
    overlay.appendChild(selectionBox);
    viewer.canvas.appendChild(overlay);
    overlayRef.current = overlay;

    const handleMouseDown = (event: any) => {
      const viewportPoint = viewer.viewport.pointFromPixel(event.position);
      setDragState((prevState: DragState): DragState => ({
        startPosition: { x: viewportPoint.x, y: viewportPoint.y },
        currentPosition: { x: viewportPoint.x, y: viewportPoint.y }
      }));
      setIsDrawing(true);
      selectionBox.style.display = 'block';
    };

    const handleMouseMove = (event: any) => {
      if (!isDrawing) return;

      const viewportPoint = viewer.viewport.pointFromPixel(event.position);
      setDragState((prevState: DragState): DragState => ({
        ...prevState,
        currentPosition: { x: viewportPoint.x, y: viewportPoint.y }
      }));

      if (dragState.startPosition) {
        const start = viewer.viewport.viewportToViewerElementCoordinates(
          new OpenSeadragon.Point(dragState.startPosition.x, dragState.startPosition.y)
        );
        const current = viewer.viewport.viewportToViewerElementCoordinates(
          new OpenSeadragon.Point(viewportPoint.x, viewportPoint.y)
        );

        const left = Math.min(start.x, current.x);
        const top = Math.min(start.y, current.y);
        const width = Math.abs(current.x - start.x);
        const height = Math.abs(current.y - start.y);

        selectionBox.style.left = `${left}px`;
        selectionBox.style.top = `${top}px`;
        selectionBox.style.width = `${width}px`;
        selectionBox.style.height = `${height}px`;
      }
    };

    const handleMouseUp = () => {
      if (!isDrawing || !dragState.startPosition || !dragState.currentPosition) return;

      const rectangle = {
        x: Math.min(dragState.startPosition.x, dragState.currentPosition.x),
        y: Math.min(dragState.startPosition.y, dragState.currentPosition.y),
        width: Math.abs(dragState.currentPosition.x - dragState.startPosition.x),
        height: Math.abs(dragState.currentPosition.y - dragState.startPosition.y)
      };

      onSelectionComplete(rectangle);
      setIsDrawing(false);
      selectionBox.style.display = 'none';
      setDragState((prevState: DragState): DragState => ({
        startPosition: null,
        currentPosition: null
      }));
    };

    viewer.addHandler('canvas-press', handleMouseDown);
    viewer.addHandler('canvas-drag', handleMouseMove);
    viewer.addHandler('canvas-release', handleMouseUp);

    return () => {
      viewer.removeHandler('canvas-press', handleMouseDown);
      viewer.removeHandler('canvas-drag', handleMouseMove);
      viewer.removeHandler('canvas-release', handleMouseUp);
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    };
  }, [viewer, onSelectionComplete, isDrawing, dragState]);

  return null;
};
