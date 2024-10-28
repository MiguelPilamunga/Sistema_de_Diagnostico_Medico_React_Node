export interface Sample {
  id: number;
  code: string;
  description: string;
  tissue_type_id: number;
  is_scanned: boolean;
  tissue_type_name: string;
  dzi_path: string;
}

export interface TissueType {
  id: number;
  name: string;
}

export interface SampleDialogProps {
  open: boolean;
  onClose: () => void;
  currentSample: Partial<Sample> | null;
  setCurrentSample: (sample: Partial<Sample> | null | ((prev: Partial<Sample> | null) => Partial<Sample> | null)) => void;
  onSave: () => Promise<void>;
  tissueTypes: TissueType[];
}

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}