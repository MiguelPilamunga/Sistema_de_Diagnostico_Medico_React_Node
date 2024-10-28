import React from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { 
  Rectangle as RectangleIcon,
  Polyline as PolygonIcon,
  PanTool as PanIcon
} from '@mui/icons-material';

export type AnnotationModeType = 'rectangle' | 'polygon' | 'pan' | null;

interface AnnotationControlsProps {
  mode: AnnotationModeType;
  onModeChange: (newMode: AnnotationModeType) => void;
}

export const AnnotationControls: React.FC<AnnotationControlsProps> = ({
  mode,
  onModeChange
}) => {
  const handleChange = (_: React.MouseEvent<HTMLElement>, newMode: AnnotationModeType) => {
    if (newMode !== null) {
      onModeChange(newMode);
    }
  };

  return (
    <Box sx={{ 
      position: 'absolute', 
      top: 16, 
      left: 16, 
      zIndex: 1000,
      bgcolor: 'background.paper',
      borderRadius: 1,
      boxShadow: 3,
      p: 0.5
    }}>
      <ToggleButtonGroup
        value={mode}
        exclusive
        onChange={handleChange}
        size="small"
      >
        <ToggleButton value="rectangle">
          <Tooltip title="Dibujar Rectángulo">
            <RectangleIcon />
          </Tooltip>
        </ToggleButton>
        <ToggleButton value="polygon">
          <Tooltip title="Dibujar Polígono">
            <PolygonIcon />
          </Tooltip>
        </ToggleButton>
        <ToggleButton value="pan">
          <Tooltip title="Modo Pan">
            <PanIcon />
          </Tooltip>
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};
