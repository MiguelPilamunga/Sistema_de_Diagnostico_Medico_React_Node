import React from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemText, 
  Typography, 
  IconButton,
  Paper 
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { Annotation } from '../../services/AnnotationService';

interface AnnotationListProps {
  annotations: Annotation[];
  onDelete: (annotationId: number) => void;
}

export const AnnotationList: React.FC<AnnotationListProps> = ({
  annotations,
  onDelete
}) => {
  return (
    <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
      <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
        Anotaciones
      </Typography>
      
      {annotations.length === 0 ? (
        <Typography color="text.secondary" align="center">
          No hay anotaciones
        </Typography>
      ) : (
        <List>
          {annotations.map((annotation) => (
            <ListItem
              key={annotation.id}
              divider
              sx={{ 
                backgroundColor: 'background.paper',
                mb: 1,
                borderRadius: 1,
                boxShadow: 1
              }}
              secondaryAction={
                <IconButton 
                  edge="end" 
                  aria-label="delete"
                  onClick={() => onDelete(annotation.id)}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={
                  <Typography variant="subtitle2" component="div">
                    {annotation.text}
                  </Typography>
                }
                secondary={
                  <Box>
                    <Typography variant="caption" display="block" color="text.secondary">
                      Creado por: {annotation.user.fullname}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      Fecha: {format(new Date(annotation.created_at), 'dd/MM/yyyy HH:mm')}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      Tipo: {annotation.type}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      Posición: ({Math.round(annotation.x)}, {Math.round(annotation.y)})
                    </Typography>
                    {annotation.type === 'rectangle' && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        Dimensiones: {Math.round(annotation.width)} x {Math.round(annotation.height)}
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};
