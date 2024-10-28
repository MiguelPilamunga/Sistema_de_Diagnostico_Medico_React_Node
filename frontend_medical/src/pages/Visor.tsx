import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  Grid,
  CircularProgress,
  Alert,
  Snackbar 
} from '@mui/material';
import { 
  ZoomIn, 
  ZoomOut, 
  Home, 
  Fullscreen, 
  PanTool, 
  Rectangle, 
  Timeline, 
  ArrowBack,
  Save,
  Edit,
  Delete,
  Add,
  Visibility
} from '@mui/icons-material';
import { AnnotationService, Annotation } from '../services/AnnotationService';
import { FormDetailsService } from '../services/FormDetailsService';
import { FormDetails } from '../interfaces/formDetails';

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
  addAnnotation: (annotation: any) => void;
  removeAnnotation: (annotation: any) => void;
  updateAnnotation: (oldAnnotation: any, newAnnotation: any) => void;
  destroy?: () => void;
}

const validationSchema = Yup.object().shape({
  patient_name: Yup.string()
    .required('El nombre del paciente es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  birth_date: Yup.date()
    .required('La fecha de nacimiento es requerida')
    .max(new Date(), 'La fecha no puede ser futura'),
  patient_id: Yup.string()
    .required('El ID del paciente es requerido')
    .matches(/^[A-Za-z0-9-]+$/, 'ID inválido'),
  procedure_date: Yup.date()
    .required('La fecha del procedimiento es requerida')
    .max(new Date(), 'La fecha no puede ser futura'),
  sample_type: Yup.string()
    .required('El tipo de muestra es requerido')
    .oneOf(['Biopsia', 'Punción', 'Citología'], 'Tipo de muestra inválido'),
  anatomical_location: Yup.string()
    .required('La localización anatómica es requerida')
    .min(3, 'La localización debe tener al menos 3 caracteres'),
  dimensions: Yup.string()
    .required('Las dimensiones son requeridas')
    .matches(/^\d+x\d+[cm|mm]$/, 'Formato inválido (ejemplo: 2x3cm)'),
  texture: Yup.string()
    .required('La textura es requerida'),
  cell_type: Yup.string()
    .required('El tipo de célula es requerido')
    .oneOf(['Escamoso', 'Glandular', 'Columnar', 'Cuboidal'], 'Tipo de célula inválido'),
  ki67_index: Yup.number()
    .required('El índice Ki-67 es requerido')
    .min(0, 'El índice debe ser mayor o igual a 0')
    .max(100, 'El índice debe ser menor o igual a 100'),
  her2_status: Yup.string()
    .required('El estado HER2 es requerido')
    .oneOf(['Positivo', 'Negativo', 'Inconcluso'], 'Estado HER2 inválido'),
  brca_type: Yup.string()
    .required('El tipo BRCA es requerido')
    .oneOf(['BRCA1', 'BRCA2', 'Ninguno'], 'Tipo BRCA inválido'),
  tnm_classification: Yup.string()
    .required('La clasificación TNM es requerida')
    .matches(/^T[0-4]N[0-3]M[0-1]$/, 'Formato TNM inválido (ejemplo: T2N0M0)'),
  recommendations: Yup.string()
    .required('Las recomendaciones son requeridas')
    .min(10, 'Las recomendaciones deben tener al menos 10 caracteres')
    .max(500, 'Las recomendaciones no pueden exceder 500 caracteres')
});

const MedicalViewer: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const viewerRef = useRef<OpenSeadragon.Viewer | null>(null);
  const annoRef = useRef<AnnotationViewer | null>(null);
  
  const [currentTool, setCurrentTool] = useState<string>('move');
  const [showDiagnosticForm, setShowDiagnosticForm] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [formDetails, setFormDetails] = useState<FormDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { dziPath, sampleCode, sampleId, description } = (location.state as LocationState) || {};
  const initialFormValues: FormDetails = {
    sample_id: sampleId,
    patient_name: '',
    birth_date: new Date().toISOString().split('T')[0],
    patient_id: '',
    procedure_date: new Date().toISOString().split('T')[0],
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

  const convertAnnotationFormat = (annotation: any): Partial<Annotation> => {
    const bounds = annotation.target.selector.value;
    const coordinates = bounds.split(',').map(parseFloat);

    return {
      annotation_data: {
        type: annotation.target.selector.type,
        properties: {
          color: 'red'
        }
      },
      x: coordinates[0],
      y: coordinates[1],
      width: coordinates[2],
      height: coordinates[3],
      type: annotation.target.selector.type === 'FragmentSelector' ? 'rectangle' : 'polygon',
      text: annotation.body?.[0]?.value || 'Área de interés'
    };
  };

  const convertToAnnotoriousFormat = (annotation: Annotation) => {
    return {
      "@context": "http://www.w3.org/ns/anno.jsonld",
      "type": "Annotation",
      "body": [{
        "value": annotation.text,
        "purpose": "commenting"
      }],
      "target": {
        "selector": {
          "type": annotation.type === 'rectangle' ? 'FragmentSelector' : 'SvgSelector',
          "value": `${annotation.x},${annotation.y},${annotation.width},${annotation.height}`
        }
      },
      "id": annotation.id
    };
  };

  const handleFormSubmit = async (values: FormDetails, { setSubmitting }: any) => {
    try {
      setLoading(true);
      const formData = {
        ...values,
        sample_id: sampleId,
        birth_date: new Date(values.birth_date).toISOString(),
        procedure_date: new Date(values.procedure_date).toISOString(),
        ki67_index: parseFloat((values.ki67_index ?? 0).toString())
      };
      
      const savedForm = await FormDetailsService.createFormDetails(formData);
      setFormDetails(savedForm);
      setShowDiagnosticForm(false);
      setSuccessMessage('Diagnóstico guardado exitosamente');
      setShowSuccessDialog(true);
      
      await loadFormDetails();
    } catch (error: any) {
      console.error('Error al guardar el diagnóstico:', error);
      setErrorMessage(error.response?.data?.message || 'Error al guardar el diagnóstico');
      setShowErrorDialog(true);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleCreateAnnotation = async (annotation: any) => {
    try {
      setLoading(true);
      const annotationData = convertAnnotationFormat(annotation);
      const savedAnnotation = await AnnotationService.createAnnotation(sampleId, annotationData);
      
      setAnnotations(prevAnnotations => [...prevAnnotations, savedAnnotation]);
      setSuccessMessage('Anotación guardada correctamente');
      setShowSuccessDialog(true);
      
      return savedAnnotation;
    } catch (error: any) {
      console.error('Error al guardar la anotación:', error);
      setErrorMessage(error.response?.data?.message || 'Error al guardar la anotación');
      setShowErrorDialog(true);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAnnotation = async (oldAnnotation: any, newAnnotation: any) => {
    try {
      setLoading(true);
      const annotationData = convertAnnotationFormat(newAnnotation);
      const updatedAnnotation = await AnnotationService.updateAnnotation(
        sampleId,
        oldAnnotation.id,
        annotationData
      );
      
      setAnnotations(prevAnnotations =>
        prevAnnotations.map(anno => 
          anno.id === oldAnnotation.id ? updatedAnnotation : anno
        )
      );
      
      setSuccessMessage('Anotación actualizada correctamente');
      setShowSuccessDialog(true);
      
      return updatedAnnotation;
    } catch (error: any) {
      console.error('Error al actualizar la anotación:', error);
      setErrorMessage(error.response?.data?.message || 'Error al actualizar la anotación');
      setShowErrorDialog(true);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnnotation = async (annotation: any) => {
    try {
      setLoading(true);
      await AnnotationService.deleteAnnotation(sampleId, annotation.id);
      
      setAnnotations(prevAnnotations =>
        prevAnnotations.filter(anno => anno.id !== annotation.id)
      );
      
      setSuccessMessage('Anotación eliminada correctamente');
      setShowSuccessDialog(true);
    } catch (error: any) {
      console.error('Error al eliminar la anotación:', error);
      setErrorMessage(error.response?.data?.message || 'Error al eliminar la anotación');
      setShowErrorDialog(true);
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const loadFormDetails = async () => {
    try {
      setLoading(true);
      const details = await FormDetailsService.getFormDetailsBySampleId(sampleId);
      if (details && details.length > 0) {
        setFormDetails(details[0]);
      }
    } catch (error: any) {
      console.error('Error al cargar detalles del formulario:', error);
      setErrorMessage(error.response?.data?.message || 'Error al cargar detalles del formulario');
      setShowErrorDialog(true);
    } finally {
      setLoading(false);
    }
  };

  const loadAnnotations = async () => {
    try {
      setLoading(true);
      const existingAnnotations = await AnnotationService.getAnnotations(sampleId);
      setAnnotations(existingAnnotations);
      
      if (annoRef.current) {
        existingAnnotations.forEach((annotation: Annotation) => {
          const annotoriousFormat = convertToAnnotoriousFormat(annotation);
          annoRef.current?.addAnnotation(annotoriousFormat);
        });
      }
    } catch (error: any) {
      console.error('Error al cargar las anotaciones:', error);
      setErrorMessage(error.response?.data?.message || 'Error al cargar las anotaciones');
      setShowErrorDialog(true);
    } finally {
      setLoading(false);
    }
  };

  const canEditDiagnosis = useCallback(() => {
    const userRoles = JSON.parse(localStorage.getItem('userRoles') || '[]');
  
    console.log('User roles:', userRoles);
    return userRoles.some((role: any) => 
      ['ADMIN', 'DOCTOR'].includes(role.name)
    );
  }, []);

  useEffect(() => {
    if (!dziPath || !sampleId) return;

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
          drawOnSingleClick: false,
          style: {
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
          }
        });

        anno.setDrawingTool('rect');
        anno.on('createAnnotation', handleCreateAnnotation);
        anno.on('updateAnnotation', handleUpdateAnnotation);
        anno.on('deleteAnnotation', handleDeleteAnnotation);
        anno.on('selectAnnotation', (annotation: any) => {
          setSelectedAnnotation(annotation);
        });

        annoRef.current = anno;
        loadAnnotations();
      });
    };

    initViewer();
    loadFormDetails();

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
              style={{ width: '100%', height: '100%', outline: 'none' }} 
            />
            {loading && (
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1000
              }}>
                <CircularProgress />
              </Box>
            )}
          </Box>
        </Grid>
        <Grid item xs={3} sx={{ p: 2, overflowY: 'auto' }}>
          <Typography variant="h6" gutterBottom>
            Anotaciones
          </Typography>
          {annotations.map((annotation) => (
            <Box
              key={annotation.id}
              sx={{
                p: 2,
                mb: 1,
                border: '1px solid #ddd',
                borderRadius: 1,
                backgroundColor: '#f5f5f5'
              }}
            >
              <Typography variant="subtitle2">
                {annotation.text}
              </Typography>
              <Typography variant="caption" display="block">
                Creado por: {annotation.user.fullname}
              </Typography>
              <Typography variant="caption" display="block">
                Fecha: {new Date(annotation.created_at).toLocaleString()}
              </Typography>
            </Box>
          ))}
        </Grid>
      </Grid>

      <Box sx={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', gap: 2 }}>
        {formDetails && (
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setShowDetailsDialog(true)}
            startIcon={<Visibility />}
          >
            Ver Diagnóstico
          </Button>
        )}
        {canEditDiagnosis() && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowDiagnosticForm(true)}
            startIcon={formDetails ? <Edit /> : <Add />}
          >
            {formDetails ? 'Editar Diagnóstico' : 'Agregar Diagnóstico'}
          </Button>
        )}
      </Box>

      <Dialog 
        open={showDiagnosticForm} 
        onClose={() => setShowDiagnosticForm(false)} 
        fullWidth 
        maxWidth="md"
      >
        <DialogTitle>
          {formDetails ? 'Editar Diagnóstico Patológico' : 'Nuevo Diagnóstico Patológico'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            <Formik
              initialValues={formDetails || initialFormValues}
              validationSchema={validationSchema}
              onSubmit={handleFormSubmit}
              enableReinitialize
            >
              {({ isSubmitting, errors, touched }) => (
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
                        as="input"
                        className="w-full p-2 border rounded"
                      />
                      <ErrorMessage name="patient_id" component="div" className="text-red-500" />
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Fecha del Procedimiento</Typography>
                      <Field
                        name="procedure_date"
                        type="date"
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
                        as="input"
                        className="w-full p-2 border rounded"
                      />
                      <ErrorMessage name="anatomical_location" component="div" className="text-red-500" />
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Dimensiones</Typography>
                      <Field
                        name="dimensions"
                        as="input"
                        className="w-full p-2 border rounded"
                        placeholder="Ej: 2x3cm"
                      />
                      <ErrorMessage name="dimensions" component="div" className="text-red-500" />
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Textura</Typography>
                      <Field
                        name="texture"
                        as="input"
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
                        <option value="Columnar">Columnar</option>
                        <option value="Cuboidal">Cuboidal</option>
                      </Field>
                      <ErrorMessage name="cell_type" component="div" className="text-red-500" />
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Índice Ki-67 (%)</Typography>
                      <Field
                        name="ki67_index"
                        type="number"
                        className="w-full p-2 border rounded"
                        min="0"
                        max="100"
                        step="0.1"
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
                        <option value="Ninguno">Ninguno</option>
                      </Field>
                      <ErrorMessage name="brca_type" component="div" className="text-red-500" />
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Clasificación TNM</Typography>
                      <Field
                        name="tnm_classification"
                        as="input"
                        className="w-full p-2 border rounded"
                        placeholder="Ej: T2N0M0"
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
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      color="primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? <CircularProgress size={24} /> : 'Guardar'}
                    </Button>
                  </Box>
                </Form>
              )}
            </Formik>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={showDetailsDialog} 
        onClose={() => setShowDetailsDialog(false)}
        fullWidth 
        maxWidth="md"
      >
        <DialogTitle>Detalles del Diagnóstico</DialogTitle>
        <DialogContent>
          {formDetails && (
            <Box sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Nombre del Paciente</Typography>
                  <Typography>{formDetails.patient_name}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Fecha de Nacimiento</Typography>
                  <Typography>{new Date(formDetails.birth_date).toLocaleDateString()}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">ID del Paciente</Typography>
                  <Typography>{formDetails.patient_id}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Fecha del Procedimiento</Typography>
                  <Typography>{new Date(formDetails.procedure_date).toLocaleDateString()}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Tipo de Muestra</Typography>
                  <Typography>{formDetails.sample_type}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Localización Anatómica</Typography>
                  <Typography>{formDetails.anatomical_location}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Dimensiones</Typography>
                  <Typography>{formDetails.dimensions}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Textura</Typography>
                  <Typography>{formDetails.texture}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Tipo de Célula</Typography>
                  <Typography>{formDetails.cell_type}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Índice Ki-67</Typography>
                  <Typography>{formDetails.ki67_index}%</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Estado HER2</Typography>
                  <Typography>{formDetails.her2_status}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Tipo BRCA</Typography>
                  <Typography>{formDetails.brca_type}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Clasificación TNM</Typography>
                  <Typography>{formDetails.tnm_classification}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Recomendaciones</Typography>
                  <Typography>{formDetails.recommendations}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetailsDialog(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showSuccessDialog} onClose={() => setShowSuccessDialog(false)}>
        <DialogTitle>Éxito</DialogTitle>
        <DialogContent>
          <Typography>{successMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSuccessDialog(false)}>Aceptar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showErrorDialog} onClose={() => setShowErrorDialog(false)}>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <Typography>{errorMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowErrorDialog(false)}>Aceptar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>¿Está seguro que desea eliminar esta anotación?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteConfirm(false)}>Cancelar</Button>
          <Button 
            onClick={() => selectedAnnotation && handleDeleteAnnotation(selectedAnnotation)}
            color="error"
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
      >
        <Alert severity="error">{error}</Alert>
      </Snackbar>

      <Snackbar 
        open={!!success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess(null)}
      >
        <Alert severity="success">{success}</Alert>
      </Snackbar>
    </Box>
  );
};

export default MedicalViewer;