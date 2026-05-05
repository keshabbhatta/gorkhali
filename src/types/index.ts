export type ModuleId =
  | 'upload'
  | 'colorspaces'
  | 'brightness'
  | 'histogram'
  | 'noise'
  | 'edges'
  | 'threshold'
  | 'morphology'
  | 'segmentation'
  | 'features';

export interface Module {
  id: ModuleId;
  label: string;
  icon: string;
  description: string;
}

export interface ProcessResult {
  result?: string;
  histogram?: string;
  before_histogram?: string;
  after_histogram?: string;
  red?: string;
  green?: string;
  blue?: string;
  sobel?: string;
  laplacian?: string;
  canny?: string;
  mask?: string;
  shapes?: ShapeInfo[];
  boxes?: BoundingBox[];
  count?: number;
  threshold_value?: number;
}

export interface ShapeInfo {
  shape: string;
  area: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
  area: number;
}
