export interface CustomError extends Error {
    code?: string | number;
    status?: number;
    details?: any;
}
