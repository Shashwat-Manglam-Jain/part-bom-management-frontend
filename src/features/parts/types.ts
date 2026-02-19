import type { PartSummary } from '../../shared/types/partBom';

export interface UiBomNode {
  part: PartSummary;
  quantityFromParent?: number;
  hasChildren: boolean;
  childIds: string[];
  childrenLoaded: boolean;
  loadingChildren: boolean;
  childrenError?: string;
}
