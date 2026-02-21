import { request } from './httpClient';
import type {
  AuditLog,
  BomTreeResponse,
  PartDetails,
  PartRecord,
  PartSummary,
} from '../types/partBom';

interface BomLinkPayload {
  parentId: string;
  childId: string;
  quantity: number;
}

export interface CreatePartPayload {
  name: string;
  partNumber?: string;
  description?: string;
}

export async function searchParts(query: string): Promise<PartSummary[]> {
  const params = new URLSearchParams();
  if (query.trim()) {
    params.set('q', query.trim());
  }

  const queryString = params.toString();
  return request<PartSummary[]>(`/parts${queryString ? `?${queryString}` : ''}`);
}

export async function getPartDetails(partId: string): Promise<PartDetails> {
  return request<PartDetails>(`/parts/${partId}`);
}

export async function createPart(payload: CreatePartPayload) {
  return request<PartRecord>('/parts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getPartAuditLogs(partId: string): Promise<AuditLog[]> {
  return request<AuditLog[]>(`/parts/${partId}/audit-logs`);
}

export async function getBomTree(
  rootPartId: string,
  depth: number | 'all' = 1,
  nodeLimit?: number,
): Promise<BomTreeResponse> {
  const params = new URLSearchParams({ depth: String(depth) });
  if (nodeLimit !== undefined) {
    params.set('nodeLimit', String(nodeLimit));
  }

  return request<BomTreeResponse>(`/bom/${rootPartId}?${params.toString()}`);
}

export async function createBomLink(payload: BomLinkPayload) {
  return request<BomLinkPayload>('/bom/links', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateBomLink(payload: BomLinkPayload) {
  return request<BomLinkPayload>('/bom/links', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteBomLink(parentId: string, childId: string) {
  return request<{ message: string; parentId: string; childId: string }>(
    `/bom/links/${parentId}/${childId}`,
    {
      method: 'DELETE',
    },
  );
}
