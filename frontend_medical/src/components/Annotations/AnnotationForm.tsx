import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box
} from '@mui/material';

interface AnnotationFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    text: string;
    type: 'rectangle' | 'polygon';
    annotation_data: {
      type: string;
      properties: {
        color: string;
      };
    };
  }) => void;
}

interface FormData {
  text: string;
  type: 'rectangle' | 'polygon';
  color: string;
}

export const AnnotationForm: React.FC<AnnotationFormProps> = ({
  open,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = React.useState<FormData>({
    text: '',
    type: 'rectangle',
    color: '#ff0000'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      text: formData.text,
      type: formData.type,
      annotation_data: {
        type: formData.type,
        properties: {
          color: formData.color
        }
      }
    });
    setFormData({ text: '', type: 'rectangle', color: '#ff0000' });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Nueva Anotación</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Descripción"
              value={formData.text}
              onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
              fullWidth
              required
              multiline
              rows={3}
            />
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={formData.type}
                label="Tipo"
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  type: e.target.value as 'rectangle' | 'polygon' 
                }))}
              >
                <MenuItem value="rectangle">Rectángulo</MenuItem>
                <MenuItem value="polygon">Polígono</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Color"
              type="color"
              value={formData.color}
              onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" color="primary">
            Guardar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
