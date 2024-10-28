import request from './api';
import { Sample, Annotation, FormDetail } from '../interfaces/sample';

export const getSamples = (token: string) =>
  request<Sample[]>('api/samples', { token });

export const getSample = (id: number, token: string) =>
  request<Sample>(`api/samples/${id}`, { token });

export const getSampleAnnotations = (sampleId: number, token: string) =>
  request<Annotation[]>(`api/samples/${sampleId}/annotations`, { token });

export const createAnnotation = (sampleId: number, data: Partial<Annotation>, token: string) =>
  request<Annotation>(`api/samples/${sampleId}/annotations`, {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });

export const getFormDetails = (sampleId: number, token: string) =>
  request<FormDetail>(`api/samples/${sampleId}/form-details`, { token });

export const createFormDetails = (sampleId: number, data: Partial<FormDetail>, token: string) =>
  request<FormDetail>(`api/samples/${sampleId}/form-details`, {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
