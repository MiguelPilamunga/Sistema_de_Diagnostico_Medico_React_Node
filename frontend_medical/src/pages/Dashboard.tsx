import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Snackbar,
  IconButton,
  Paper,
  InputAdornment,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';

import { 
  DataGrid, 
  GridColDef,
  GridToolbar,
} from '@mui/x-data-grid';
import { 
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Description as DescriptionIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import SampleDialog from '../components/Dialog';

const API_BASE_URL = 'http://localhost:3000/api';

interface Sample {
  id: number;
  code: string;
  description: string;
  tissue_type_id: number;
  is_scanned: boolean;
  tissue_type_name: string;
  dzi_path: string;
}

interface TissueType {
  id: number;
  name: string;
}

const PageBanner: React.FC<{ title: string }> = ({ title }) => (
  <Box sx={{
    position: 'relative',
    height: '300px',
    width: '100%',
    marginBottom: 4,
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1
    }
  }}>
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'url(/images/13.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    />
    <Box sx={{ position: 'relative', zIndex: 2 }}>
      <Typography variant="h2" component="h1" 
        sx={{ 
          mb: 2,
          fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
          fontWeight: 'bold'
        }}
      >
        {title}
      </Typography>
    </Box>
  </Box>
);

// Componente para el overlay de carga
const CustomLoadingOverlay = () => (
  <Box
    sx={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
    }}
  >
    <CircularProgress />
  </Box>
);

// Componente para resaltar texto coincidente
const HighlightedCell: React.FC<{ text: string; searchText: string }> = ({ text, searchText }) => {
  if (!searchText || !text) return <span>{text}</span>;
  
  const parts = text.toString().split(new RegExp(`(${searchText})`, 'gi'));
  
  return (
    <span>
      {parts.map((part, index) => 
        part.toLowerCase() === searchText.toLowerCase() ? (
          <span key={index} style={{ backgroundColor: '#fff59d' }}>
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
};

const Dashboard: React.FC = () => {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();
  const [samples, setSamples] = useState<Sample[]>([]);
  const [tissueTypes, setTissueTypes] = useState<TissueType[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentSample, setCurrentSample] = useState<Partial<Sample> | null>(null);
  const [searchText, setSearchText] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const isAdmin = user?.roles.some(role => role.name === 'ADMIN');

  useEffect(() => {
    if (accessToken) {
      fetchSamples();
      fetchTissueTypes();
    }
  }, [accessToken]); 

  const fetchSamples = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/samples`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar las muestras');
      }
      
      const data = await response.json();
      setSamples(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching samples:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar las muestras',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTissueTypes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tissue-types`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar los tipos de tejido');
      }
      
      const data = await response.json();
      setTissueTypes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching tissue types:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar los tipos de tejido',
        severity: 'error'
      });
    }
  };

  const handleSave = async () => {
    if (!currentSample) return;
    
    try {
      const sampleData = {
        ...currentSample,
        dzi_path: currentSample.dzi_path || '', 
      };
  
      const url = sampleData.id 
        ? `${API_BASE_URL}/samples/${sampleData.id}`
        : `${API_BASE_URL}/samples`;
      
      const response = await fetch(url, {
        method: sampleData.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(sampleData)
      });
  
      if (!response.ok) {
        throw new Error('Error al guardar la muestra');
      }
  
      await fetchSamples();
      setOpenDialog(false);
      setCurrentSample(null);
      setSnackbar({
        open: true,
        message: `Muestra ${sampleData.id ? 'actualizada' : 'creada'} exitosamente`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving sample:', error);
      setSnackbar({
        open: true,
        message: 'Error al guardar la muestra',
        severity: 'error'
      });
    }
  };


  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta muestra?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/samples/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la muestra');
      }

      await fetchSamples();
      setSnackbar({
        open: true,
        message: 'Muestra eliminada exitosamente',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error al eliminar la muestra',
        severity: 'error'
      });
    }
  };

  const filteredSamples = useMemo(() => {
    if (!searchText) return samples;
    
    const searchLower = searchText.toLowerCase();
    return samples.filter(sample => 
      sample.code.toLowerCase().includes(searchLower) ||
      sample.description.toLowerCase().includes(searchLower) ||
      (sample.tissue_type_name || '').toLowerCase().includes(searchLower)
    );
  }, [samples, searchText]);

  const columns: GridColDef[] = [
    {
      field: 'code',
      headerName: 'Código',
      width: 130,
      renderCell: (params) => (
        <HighlightedCell text={params.value || ''} searchText={searchText} />
      )
    },
    {
      field: 'description',
      headerName: 'Descripción',
      width: 300,
      flex: 1,
      renderCell: (params) => (
        <HighlightedCell text={params.value || ''} searchText={searchText} />
      )
    },
    {
      field: 'tissue_type_name',
      headerName: 'Tipo de Tejido',
      width: 200,
      renderCell: (params) => (
        <HighlightedCell text={params.value || ''} searchText={searchText} />
      )
    },
    {
      field: 'is_scanned',
      headerName: 'Estado',
      width: 130,
      renderCell: (params) => (
        <Box
          sx={{
            color: params.value ? 'success.main' : 'error.main',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          {params.value ? 'Escaneado' : 'No Escaneado'}
        </Box>
      )
    },


    {
      field: 'actions',
      headerName: 'Acciones',
      width: 150,
      sortable: false,
      renderCell: (params) => {
        const sample = params.row as Sample;

        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={() => {
                if (sample.is_scanned) {
                  console.log('Sample data:', {
                    dziPath: sample.dzi_path,
                    sampleCode: sample.code,
                    sampleId: sample.id,
                    description: sample.description
                  });
                  
                  navigate('/visor', {
                    state: {
                      dziPath: "/dzi_files/test_img_todzi.dzi",
                      sampleCode: sample.code,
                      sampleId: sample.id,
                      description: sample.description
                    }
                  });
                } 
              }}
              size="small"
              color="primary"
              title="Ver muestra"
              disabled={!sample.is_scanned}
            >
              <ViewIcon />
            </IconButton>
            {isAdmin && (
              <>
                <IconButton
                  onClick={() => {
                    setCurrentSample(params.row);
                    setOpenDialog(true);
                  }}
                  size="small"
                  color="info"
                  title="Editar"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => handleDelete(params.row.id)}
                  size="small"
                  color="error"
                  title="Eliminar"
                >
                  <DeleteIcon />
                </IconButton>
              </>
            )}
          </Box>
        );
      }
    }

    ];

  return (
    <Box>
      <PageBanner title="Muestras Médicas" />
      
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            mb: 3,
            alignItems: { sm: 'center' },
            justifyContent: 'space-between'
          }}>
            <TextField
              placeholder="Buscar muestras..."
              variant="outlined"
              size="small"
              fullWidth={false}
              sx={{ minWidth: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchText && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchText('')}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            
            {isAdmin && (
              <Button
                startIcon={<AddIcon />}
                variant="contained"
                onClick={() => {
                  setCurrentSample({});
                  setOpenDialog(true);
                }}
              >
                Nueva Muestra
              </Button>
            )}
          </Box>

          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={filteredSamples}
              columns={columns}
              loading={loading}
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 10 },
                },
              }}
              slots={{
                toolbar: GridToolbar,
                loadingOverlay: CustomLoadingOverlay,
              }}
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
                  quickFilterProps: { debounceMs: 500 },
                  printOptions: { disableToolbarButton: true },
                },
              }}
              disableRowSelectionOnClick
              getRowHeight={() => 'auto'}
              sx={{
                '& .MuiDataGrid-cell': {
                  whiteSpace: 'normal',
                  padding: '8px',
                  alignItems: 'center',
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
                boxShadow: 1,
                borderRadius: 2,
                position: 'relative',
              }}
            />
          </Box>
        </Paper>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Servicios Disponibles
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon><ViewIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Visualización de Alta Resolución" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><EditIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Anotaciones y Marcadores" />
                </ListItem>
              </List>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Recursos
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon><DescriptionIcon color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="Guías de Usuario"
                    secondary="Documentación detallada del sistema" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><HelpIcon color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="Soporte Técnico"
                    secondary="Asistencia disponible 24/7" 
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Estadísticas
              </Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary={`Total de Muestras: ${samples.length}`}
                    secondary="Actualizado en tiempo real"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary={`Muestras Escaneadas: ${samples.filter(s => s.is_scanned).length}`}
                    secondary="Listas para visualización"
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
        <SampleDialog 
          open={openDialog}
          onClose={() => {
            setOpenDialog(false);
            setCurrentSample(null);
          }}
          currentSample={currentSample}
          setCurrentSample={setCurrentSample}
          onSave={handleSave}
          tissueTypes={tissueTypes}
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default Dashboard;
