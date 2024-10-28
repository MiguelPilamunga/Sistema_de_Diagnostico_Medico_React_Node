import axios from 'axios';
import { API_BASE_URL } from '../config/constants';
import { FormDetails } from '../interfaces/formDetails';

export class FormDetailsService {
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

  // Obtener detalles del formulario por ID de muestra
  static async getFormDetailsBySampleId(sampleId: number): Promise<FormDetails[]> {
    return this.makeAuthenticatedRequest(async () => {
      const response = await axios.get(
        `${API_BASE_URL}/samples/${sampleId}/form-details`,
        this.getAuthHeaders()
      );
      return response.data;
    });
  }

  // Crear detalles del formulario
  static async createFormDetails(formDetails: FormDetails): Promise<FormDetails> {
    return this.makeAuthenticatedRequest(async () => {
      const response = await axios.post(
        `${API_BASE_URL}/samples/${formDetails.sample_id}/form-details`,
        formDetails,
        this.getAuthHeaders()
      );
      return response.data;
    });
  }
}
