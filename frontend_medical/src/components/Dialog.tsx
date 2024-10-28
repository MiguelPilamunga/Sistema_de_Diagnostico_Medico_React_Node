import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Box
} from '@mui/material';
import { Sample, TissueType, SampleDialogProps } from '../types/sample.types';

const SampleDialog: React.FC<SampleDialogProps> = ({
  open,
  onClose,
  currentSample,
  setCurrentSample,
  onSave,
  tissueTypes
}) => {
  const handleChange = (
    field: keyof Sample,
    value: string | number
  ) => {
    setCurrentSample((prev: Partial<Sample> | null) => {
      if (!prev) return null;
      return {
        ...prev,
        [field]: value
      };
    });
  };

  console.log('Current Sample in Dialog:', currentSample); // Para debugging

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {currentSample?.id ? 'Editar Muestra' : 'Nueva Muestra'}
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Código"
            value={currentSample?.code || ''}
            onChange={(e) => handleChange('code', e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Descripción"
            value={currentSample?.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            fullWidth
            multiline
            rows={3}
            required
          />
          <TextField
            label="URL DZI"
            value={currentSample?.dzi_path || ''}
            onChange={(e) => handleChange('dzi_path', e.target.value)}
            fullWidth
            required
            helperText="Ruta del archivo DZI para la visualización"
          />
          <TextField
            select
            label="Tipo de Tejido"
            value={currentSample?.tissue_type_id || ''}
            onChange={(e) => handleChange('tissue_type_id', Number(e.target.value))}
            fullWidth
            required
          >
            {tissueTypes.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Cancelar
        </Button>
        <Button 
          onClick={onSave} 
          variant="contained" 
          color="primary"
          disabled={!currentSample?.code || !currentSample?.description || !currentSample?.tissue_type_id}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SampleDialog;