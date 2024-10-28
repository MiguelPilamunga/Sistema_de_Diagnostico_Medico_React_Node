import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

// Definición de la interfaz de anotaciones
export interface Annotation {
  id: number;
  sample_id: number;
  user_id: number;
  annotation_data: {
    type: string;
    properties?: {
      color: string;
    };
  };
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
  text: string;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    username: string;
    fullname: string;
    email: string;
  };
}

export class AnnotationService {
  // Obtener los encabezados de autenticación
  private static getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  }

  // Manejo de errores de autenticación
  private static handleAuthError(error: any) {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    throw error;
  }

  // Realizar una solicitud autenticada
  private static async makeAuthenticatedRequest<T>(
    requestFn: () => Promise<T>
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  // Obtener anotaciones por ID de muestra
  static async getAnnotations(sampleId: number): Promise<Annotation[]> {
    return this.makeAuthenticatedRequest(async () => {
      const response = await axios.get(
        `${API_BASE_URL}/samples/${sampleId}/annotations`,
        this.getAuthHeaders()
      );
      return response.data;
    });
  }

  // Crear una nueva anotación
  static async createAnnotation(sampleId: number, annotationData: Partial<Annotation>): Promise<Annotation> {
    return this.makeAuthenticatedRequest(async () => {
      const response = await axios.post(
        `${API_BASE_URL}/samples/${sampleId}/annotations`,
        annotationData,
        this.getAuthHeaders()
      );
      return response.data;
    });
  }

  // Actualizar una anotación existente
  static async updateAnnotation(sampleId: number, annotationId: number, annotationData: Partial<Annotation>): Promise<Annotation> {
    return this.makeAuthenticatedRequest(async () => {
      const response = await axios.put(
        `${API_BASE_URL}/samples/${sampleId}/annotations/${annotationId}`,
        annotationData,
        this.getAuthHeaders()
      );
      return response.data;
    });
  }

  // Eliminar una anotación
  static async deleteAnnotation(sampleId: number, annotationId: number): Promise<void> {
    return this.makeAuthenticatedRequest(async () => {
      await axios.delete(
        `${API_BASE_URL}/samples/${sampleId}/annotations/${annotationId}`,
        this.getAuthHeaders()
      );
    });
  }
}
