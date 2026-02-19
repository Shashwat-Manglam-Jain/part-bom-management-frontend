export interface PartSummary {
  id: string;
  partNumber: string;
  name: string;
}

export interface ChildPartUsage extends PartSummary {
  quantity: number;
}

export interface PartDetails extends PartSummary {
  description: string;
  createdAt: string;
  updatedAt: string;
  parentCount: number;
  childCount: number;
  parentParts: PartSummary[];
  childParts: ChildPartUsage[];
}

export interface AuditLog {
  id: string;
  partId: string;
  action:
    | 'PART_CREATED'
    | 'PART_UPDATED'
    | 'BOM_LINK_CREATED'
    | 'BOM_LINK_UPDATED'
    | 'BOM_LINK_REMOVED';
  message: string;
  timestamp: string;
  metadata?: Record<string, string | number>;
}

export interface BomTreeNode {
  part: PartSummary;
  quantityFromParent?: number;
  hasChildren: boolean;
  children: BomTreeNode[];
}

export interface BomTreeResponse {
  rootPartId: string;
  requestedDepth: number;
  nodeLimit: number;
  nodeCount: number;
  tree: BomTreeNode;
}
