// interfaces/formDetails.ts
export interface FormDetails {
    id?: number;
    sample_id: number;
    patient_name: string;
    birth_date: string;
    patient_id: string;
    procedure_date: string;
    sample_type: string;
    anatomical_location: string;
    dimensions?: string;
    texture?: string;
    cell_type?: string;
    ki67_index?: number;
    her2_status?: string;
    brca_type?: string;
    tnm_classification?: string;
    recommendations?: string;
    created_at?: string;
    updated_at?: string;
  }