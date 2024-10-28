import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import OpenSeadragon from 'openseadragon';
import Annotorious from '@recogito/annotorious-openseadragon/dist/openseadragon-annotorious.min.js';
import '@recogito/annotorious-openseadragon/dist/annotorious.min.css';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Stack, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Grid 
} from '@mui/material';
import { 
  ZoomIn, 
  ZoomOut, 
  Home, 
  Fullscreen, 
  PanTool, 
  Rectangle, 
  Timeline, 
  ArrowBack 
} from '@mui/icons-material';
import { AnnotationList } from './../components/Annotations/AnnotationList';
import { AnnotationService } from '../services/AnnotationService';
import { FormDetailsService } from '../services/FormDetailsService';

interface LocationState {
  dziPath: string;
  sampleCode: string;
  sampleId: number;
  description: string;
}

interface AnnotationViewer {
  setDrawingTool: (tool: string) => void;
  setDrawingEnabled: (enabled: boolean) => void;
  setTheme: (theme: any) => void;
  on: (event: string, callback: (annotation: any) => void) => void;
  destroy?: () => void;
}

interface FormDetails {
  sample_id: number;
  patient_name: string;
  birth_date: string;
  patient_id: string;
  procedure_date: string;
  sample_type: string;
  anatomical_location: string;
  dimensions: string;
  texture: string;
  cell_type: string;
  ki67_index: number;
  her2_status: string;
  brca_type: string;
  tnm_classification: string;
  recommendations: string;
}

const validationSchema = Yup.object().shape({
  patient_name: Yup.string().required('Nombre del paciente es requerido'),
  birth_date: Yup.date().required('Fecha de nacimiento es requerida'),
  patient_id: Yup.string().required('ID del paciente es requerido'),
  procedure_date: Yup.date().required('Fecha del procedimiento es requerida'),
  sample_type: Yup.string().required('Tipo de muestra es requerido'),
  anatomical_location: Yup.string().required('Localización anatómica es requerida'),
  dimensions: Yup.string().required('Dimensiones son requeridas'),
  texture: Yup.string().required('Textura es requerida'),
  cell_type: Yup.string().required('Tipo de célula es requerido'),
  ki67_index: Yup.number()
    .integer()
    .min(0, 'El índice debe ser mayor o igual a 0')
    .max(100, 'El índice debe ser menor o igual a 100')
    .required('Índice Ki-67 es requerido'),
  her2_status: Yup.string().required('Estado HER2 es requerido'),
  brca_type: Yup.string().required('Tipo BRCA es requerido'),
  tnm_classification: Yup.string().required('Clasificación TNM es requerida'),
  recommendations: Yup.string().required('Recomendaciones son requeridas'),
});

const MedicalViewer: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const viewerRef = useRef<OpenSeadragon.Viewer | null>(null);
  const annoRef = useRef<AnnotationViewer | null>(null);
  const [currentTool, setCurrentTool] = useState<string>('move');
  const [showDiagnosticForm, setShowDiagnosticForm] = useState(false);
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { dziPath, sampleCode, sampleId, description } = (location.state as LocationState) || {};

  const initialFormValues: FormDetails = {
    sample_id: sampleId,
    patient_name: '',
    birth_date: '',
    patient_id: '',
    procedure_date: '',
    sample_type: '',
    anatomical_location: '',
    dimensions: '',
    texture: '',
    cell_type: '',
    ki67_index: 0,
    her2_status: '',
    brca_type: '',
    tnm_classification: '',
    recommendations: '',
  };

  useEffect(() => {
    if (!dziPath) return;

    const initViewer = () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
      }
      if (annoRef.current?.destroy) {
        annoRef.current.destroy();
      }

      const viewer = OpenSeadragon({
        id: "openseadragon-viewer",
        prefixUrl: "/openseadragon/images/",
        tileSources: dziPath,
        showNavigator: true,
        navigatorPosition: 'BOTTOM_RIGHT',
        showNavigationControl: true,
        defaultZoomLevel: 0,
        minZoomLevel: 0.5,
        maxZoomLevel: 10,
        visibilityRatio: 1,
        constrainDuringPan: true,
        animationTime: 0.5,
        blendTime: 0.1,
        immediateRender: true,
        maxZoomPixelRatio: 2,
        gestureSettingsMouse: {
          clickToZoom: false,
          dblClickToZoom: true
        }
      });

      viewerRef.current = viewer;

      viewer.addOnceHandler('open', () => {
        const anno = Annotorious(viewer, {
          readOnly: false,
          allowEmpty: true,
          disableSelect: false,
          disableEditor: false,
          drawOnSingleClick: false
        });

        anno.setTheme({
          selection: {
            strokeWidth: 2,
            stroke: '#ff0000',
            fill: 'rgba(255, 0, 0, 0.3)'
          },
          polygon: {
            strokeWidth: 2,
            stroke: '#ff0000',
            fill: 'rgba(255, 0, 0, 0.3)',
            handleRadius: 6,
            handleFill: '#ffffff',
            handleStroke: '#ff0000'
          }
        });

        anno.on('createAnnotation', (annotation: any) => {
          console.log('Anotación creada:', annotation);
        });

        anno.on('updateAnnotation', (annotation: any, previous: any) => {
          console.log('Anotación actualizada:', annotation);
        });

        anno.on('deleteAnnotation', (annotation: any) => {
          console.log('Anotación eliminada:', annotation);
        });

        annoRef.current = anno;
      });
    };

    initViewer();

    const fetchAnnotations = async () => {
      try {
        const fetchedAnnotations = await AnnotationService.getAnnotations(sampleId);
        setAnnotations(fetchedAnnotations);
      } catch (error) {
        console.error('Error fetching annotations:', error);
        setErrorMessage('Error al cargar las anotaciones');
        setShowErrorDialog(true);
      }
    };

    fetchAnnotations();

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
      }
      if (annoRef.current?.destroy) {
        annoRef.current.destroy();
      }
    };
  }, [dziPath, sampleId]);
  const handleToolChange = (tool: string) => {
    setCurrentTool(tool);
    
    if (!annoRef.current || !viewerRef.current) return;

    switch (tool) {
      case 'move':
        annoRef.current.setDrawingEnabled(false);
        viewerRef.current.setMouseNavEnabled(true);
        break;
      case 'rectangle':
        annoRef.current.setDrawingEnabled(true);
        annoRef.current.setDrawingTool('rect');
        viewerRef.current.setMouseNavEnabled(false);
        break;
      case 'polygon':
        annoRef.current.setDrawingEnabled(true);
        annoRef.current.setDrawingTool('polygon');
        viewerRef.current.setMouseNavEnabled(false);
        break;
    }
  };

  const handleZoomIn = () => {
    if (viewerRef.current?.viewport) {
      viewerRef.current.viewport.zoomBy(1.5);
    }
  };

  const handleZoomOut = () => {
    if (viewerRef.current?.viewport) {
      viewerRef.current.viewport.zoomBy(0.75);
    }
  };

  const handleHome = () => {
    if (viewerRef.current?.viewport) {
      viewerRef.current.viewport.goHome();
    }
  };

  const handleFullScreen = () => {
    if (viewerRef.current) {
      viewerRef.current.setFullScreen(!viewerRef.current.isFullPage());
    }
  };

  const handleDeleteAnnotation = async (annotationId: number) => {
    try {
      await AnnotationService.deleteAnnotation(annotationId);
      const updatedAnnotations = annotations.filter(anno => anno.id !== annotationId);
      setAnnotations(updatedAnnotations);
    } catch (error) {
      console.error('Error deleting annotation:', error);
      setErrorMessage('Error al eliminar la anotación');
      setShowErrorDialog(true);
    }
  };

  const handleFormSubmit = async (values: FormDetails) => {
    try {
      await FormDetailsService.createFormDetails(values);
      setShowSuccessDialog(true);
      setShowDiagnosticForm(false);
    } catch (error) {
      console.error('Error creating form details:', error);
      setErrorMessage('Error al guardar los detalles del formulario');
      setShowErrorDialog(true);
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" color="default">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate(-1)}>
            <ArrowBack />
          </IconButton>
          
          <Typography variant="h6" sx={{ ml: 2, flex: 1 }}>
            {sampleCode || 'Sin código'} - {description || 'Sin descripción'}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mx: 2 }}>
            <Button 
              variant={currentTool === 'move' ? 'contained' : 'outlined'}
              startIcon={<PanTool />}
              onClick={() => handleToolChange('move')}
            >
              MOVER
            </Button>
            <Button 
              variant={currentTool === 'rectangle' ? 'contained' : 'outlined'}
              startIcon={<Rectangle />}
              onClick={() => handleToolChange('rectangle')}
            >
              RECTÁNGULO
            </Button>
            <Button 
              variant={currentTool === 'polygon' ? 'contained' : 'outlined'}
              startIcon={<Timeline />}
              onClick={() => handleToolChange('polygon')}
            >
              POLÍGONO
            </Button>
          </Stack>

          <IconButton onClick={handleZoomIn}>
            <ZoomIn />
          </IconButton>
          <IconButton onClick={handleZoomOut}>
            <ZoomOut />
          </IconButton>
          <IconButton onClick={handleHome}>
            <Home />
          </IconButton>
          <IconButton onClick={handleFullScreen}>
            <Fullscreen />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Grid container sx={{ flex: 1 }}>
        <Grid item xs={9}>
          <Box sx={{ 
            height: '100%',
            position: 'relative', 
            bgcolor: 'black',
            '& .openseadragon-container': {
              outline: 'none'
            }
          }}>
            <div 
              id="openseadragon-viewer" 
              style={{ 
                width: '100%', 
                height: '100%',
                outline: 'none'
              }} 
            />
          </Box>
        </Grid>
        <Grid item xs={3}>
          <AnnotationList
            annotations={annotations}
            onDelete={handleDeleteAnnotation}
          />
        </Grid>
      </Grid>

      <Typography
        sx={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          padding: 1,
          bgcolor: 'rgba(255,255,255,0.9)',
          borderRadius: 1
        }}
        variant="caption"
      >
        ID Muestra: {sampleId || 'No disponible'}
      </Typography>

      <Button
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 16
        }}
        variant="contained"
        color="primary"
        onClick={() => setShowDiagnosticForm(true)}
      >
        Agregar Diagnóstico
      </Button>

      <Dialog 
        open={showDiagnosticForm} 
        onClose={() => setShowDiagnosticForm(false)} 
        fullWidth 
        maxWidth="md"
      >
        <DialogTitle>Formulario de Diagnóstico Patológico</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            <Formik
              initialValues={initialFormValues}
              validationSchema={validationSchema}
              onSubmit={handleFormSubmit}
            >
              {({ errors, touched }) => (
                <Form>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Nombre Completo</Typography>
                      <Field
                        name="patient_name"
                        as="input"
                        className="w-full p-2 border rounded"
                      />
                      <ErrorMessage name="patient_name" component="div" className="text-red-500" />
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Fecha de Nacimiento</Typography>
                      <Field
                        name="birth_date"
                        type="date"
                        className="w-full p-2 border rounded"
                      />
                      <ErrorMessage name="birth_date" component="div" className="text-red-500" />
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="subtitle2">ID del Paciente</Typography>
                      <Field
                        name="patient_id"
                        className="w-full p-2 border rounded"
                      />
                      <ErrorMessage name="patient_id" component="div" className="text-red-500" />
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Fecha del Procedimiento</Typography>
                      <Field
                        name="procedure_date"
                        type="datetime-local"
                        className="w-full p-2 border rounded"
                      />
                      <ErrorMessage name="procedure_date" component="div" className="text-red-500" />
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Tipo de Muestra</Typography>
                      <Field
                        name="sample_type"
                        as="select"
                        className="w-full p-2 border rounded"
                      >
                        <option value="">Seleccione el tipo de muestra</option>
                        <option value="Biopsia">Biopsia</option>
                        <option value="Punción">Punción</option>
                        <option value="Citología">Citología</option>
                      </Field>
                      <ErrorMessage name="sample_type" component="div" className="text-red-500" />
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Localización Anatómica</Typography>
                      <Field
                        name="anatomical_location"
                        className="w-full p-2 border rounded"
                      />
                      <ErrorMessage name="anatomical_location" component="div" className="text-red-500" />
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Dimensiones</Typography>
                      <Field
                        name="dimensions"
                        className="w-full p-2 border rounded"
                      />
                      <ErrorMessage name="dimensions" component="div" className="text-red-500" />
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Textura</Typography>
                      <Field
                        name="texture"
                        className="w-full p-2 border rounded"
                      />
                      <ErrorMessage name="texture" component="div" className="text-red-500" />
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Tipo de Célula</Typography>
                      <Field
                        name="cell_type"
                        as="select"
                        className="w-full p-2 border rounded"
                      >
                        <option value="">Seleccione el tipo de célula</option>
                        <option value="Escamoso">Escamoso</option>
                        <option value="Glandular">Glandular</option>
                      </Field>
                      <ErrorMessage name="cell_type" component="div" className="text-red-500" />
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Índice Ki-67</Typography>
                      <Field
                        name="ki67_index"
                        type="number"
                        className="w-full p-2 border rounded"
                      />
                      <ErrorMessage name="ki67_index" component="div" className="text-red-500" />
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Estado HER2</Typography>
                      <Field
                        name="her2_status"
                        as="select"
                        className="w-full p-2 border rounded"
                      >
                        <option value="">Seleccione el estado HER2</option>
                        <option value="Positivo">Positivo</option>
                        <option value="Negativo">Negativo</option>
                        <option value="Inconcluso">Inconcluso</option>
                      </Field>
                      <ErrorMessage name="her2_status" component="div" className="text-red-500" />
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Tipo BRCA</Typography>
                      <Field
                        name="brca_type"
                        as="select"
                        className="w-full p-2 border rounded"
                      >
                        <option value="">Seleccione el tipo BRCA</option>
                        <option value="BRCA1">BRCA1</option>
                        <option value="BRCA2">BRCA2</option>
                      </Field>
                      <ErrorMessage name="brca_type" component="div" className="text-red-500" />
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Clasificación TNM</Typography>
                      <Field
                        name="tnm_classification"
                        className="w-full p-2 border rounded"
                      />
                      <ErrorMessage name="tnm_classification" component="div" className="text-red-500" />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="subtitle2">Recomendaciones</Typography>
                      <Field
                        name="recommendations"
                        as="textarea"
                        className="w-full p-2 border rounded"
                        rows={4}
                      />
                      <ErrorMessage name="recommendations" component="div" className="text-red-500" />
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      type="button" 
                      onClick={() => setShowDiagnosticForm(false)}
                      sx={{ mr: 1 }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" variant="contained" color="primary">
                      Guardar
                    </Button>
                  </Box>
                </Form>
              )}
            </Formik>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccessDialog} onClose={() => setShowSuccessDialog(false)}>
        <DialogTitle>Guardado Exitoso</DialogTitle>
        <DialogContent>
          <Typography>Los detalles se han guardado correctamente.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSuccessDialog(false)} color="primary">
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showErrorDialog} onClose={() => setShowErrorDialog(false)}>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <Typography>{errorMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowErrorDialog(false)} color="primary">
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MedicalViewer;