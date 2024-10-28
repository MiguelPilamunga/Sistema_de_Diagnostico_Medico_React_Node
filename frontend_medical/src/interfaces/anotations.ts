export interface Annotation {
    id?: number;          
    sample_id: number;
    user_id?: number;     
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
    created_at?: string;  
    updated_at?: string;  
    user?: {              
      id: number;
      username: string;
      fullname: string;
      email: string;
    };
  }