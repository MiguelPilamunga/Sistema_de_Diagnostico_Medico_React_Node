export interface Sample {
  id: number;
  code: string;
  description: string;
  is_scanned: boolean;
  tissue_type_id: number;
  dzi_path: string;
  created_at: string;
  updated_at: string;
}

export interface Annotation {
  id: number;
  sample_id: number;
  user_id: number;
  annotation_data: any;
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
  text: string;
  created_at: string;
  updated_at: string;
}

export interface FormDetail {
  id: number;
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
