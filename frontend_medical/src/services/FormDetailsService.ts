// services/FormDetailsService.ts
import axios from 'axios';
import { API_BASE_URL } from '../config/constants';
import { FormDetails } from '../interfaces/formDetails';

export class FormDetailsService {
  private static getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  }

  static async createFormDetails(formDetails: FormDetails): Promise<FormDetails> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/samples/${formDetails.sample_id}/form-details`,
        formDetails,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error in createFormDetails:', error);
      throw error;
    }
  }

  static async getFormDetailsBySampleId(sampleId: number): Promise<FormDetails[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/samples/${sampleId}/form-details`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error in getFormDetailsBySampleId:', error);
      throw error;
    }
  }
}