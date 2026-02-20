import type { BomTreeNode } from '../../../shared/types/partBom';
import type { UiBomNode } from '../types';

export function normalizeBomTree(
  node: BomTreeNode,
  requestedDepth: number,
  currentDepth = 0,
  target: Record<string, UiBomNode> = {},
): Record<string, UiBomNode> {
  const childIds = node.children.map((child) => child.part.id);

  target[node.part.id] = {
    part: node.part,
    quantityFromParent: node.quantityFromParent,
    hasChildren: node.hasChildren,
    childIds,
    childrenLoaded: !node.hasChildren || currentDepth < requestedDepth,
    loadingChildren: false,
  };

  for (const child of node.children) {
    normalizeBomTree(child, requestedDepth, currentDepth + 1, target);
  }

  return target;
}

export function mergeBomNodes(
  current: Record<string, UiBomNode>,
  incoming: Record<string, UiBomNode>,
): Record<string, UiBomNode> {
  const next = { ...current };

  for (const [nodeId, incomingNode] of Object.entries(incoming)) {
    const existingNode = next[nodeId];
    const preserveLoadedChildren =
      Boolean(existingNode?.childrenLoaded) && !incomingNode.childrenLoaded;

    next[nodeId] = {
      ...existingNode,
      ...incomingNode,
      childIds: preserveLoadedChildren
        ? existingNode?.childIds ?? incomingNode.childIds
        : incomingNode.childIds,
      childrenLoaded: preserveLoadedChildren
        ? true
        : incomingNode.childrenLoaded,
      quantityFromParent:
        incomingNode.quantityFromParent ?? existingNode?.quantityFromParent,
      childrenError: undefined,
      loadingChildren: false,
    };
  }

  return next;
}
