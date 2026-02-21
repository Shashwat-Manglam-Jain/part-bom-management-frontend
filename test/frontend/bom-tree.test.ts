import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeBomNodes, normalizeBomTree } from '../../src/features/parts/utils/bomTree';
import type { BomTreeNode } from '../../src/shared/types/partBom';
import type { UiBomNode } from '../../src/features/parts/types';

function sampleTree(): BomTreeNode {
  return {
    part: {
      id: 'PART-0001',
      partNumber: 'PRT-000001',
      name: 'Root Assembly',
    },
    hasChildren: true,
    children: [
      {
        part: {
          id: 'PART-0002',
          partNumber: 'PRT-000002',
          name: 'Child Module',
        },
        quantityFromParent: 2,
        hasChildren: true,
        children: [
          {
            part: {
              id: 'PART-0003',
              partNumber: 'PRT-000003',
              name: 'Leaf Component',
            },
            quantityFromParent: 4,
            hasChildren: false,
            children: [],
          },
        ],
      },
    ],
  };
}

test('normalizeBomTree marks full tree as loaded for depth=all', () => {
  const normalized = normalizeBomTree(sampleTree(), 'all');

  assert.equal(normalized['PART-0001'].childrenLoaded, true);
  assert.equal(normalized['PART-0002'].childrenLoaded, true);
  assert.equal(normalized['PART-0003'].childrenLoaded, true);
  assert.deepEqual(normalized['PART-0001'].childIds, ['PART-0002']);
  assert.deepEqual(normalized['PART-0002'].childIds, ['PART-0003']);
});

test('mergeBomNodes replaces childIds with incoming loaded nodes', () => {
  const current: Record<string, UiBomNode> = {
    'PART-0001': {
      part: { id: 'PART-0001', partNumber: 'PRT-000001', name: 'Root' },
      hasChildren: true,
      childIds: ['PART-OLD'],
      childrenLoaded: false,
      loadingChildren: false,
    },
  };

  const incoming: Record<string, UiBomNode> = {
    'PART-0001': {
      part: { id: 'PART-0001', partNumber: 'PRT-000001', name: 'Root' },
      hasChildren: true,
      childIds: ['PART-0002'],
      childrenLoaded: true,
      loadingChildren: false,
    },
  };

  const merged = mergeBomNodes(current, incoming);
  assert.deepEqual(merged['PART-0001'].childIds, ['PART-0002']);
  assert.equal(merged['PART-0001'].childrenLoaded, true);
});

test('mergeBomNodes keeps existing loaded children on shallow incoming payload', () => {
  const current: Record<string, UiBomNode> = {
    'PART-0002': {
      part: { id: 'PART-0002', partNumber: 'PRT-000002', name: 'Child' },
      hasChildren: true,
      childIds: ['PART-0003'],
      childrenLoaded: true,
      loadingChildren: false,
    },
  };

  const incoming: Record<string, UiBomNode> = {
    'PART-0002': {
      part: { id: 'PART-0002', partNumber: 'PRT-000002', name: 'Child' },
      hasChildren: true,
      childIds: [],
      childrenLoaded: false,
      loadingChildren: false,
    },
  };

  const merged = mergeBomNodes(current, incoming);
  assert.deepEqual(merged['PART-0002'].childIds, ['PART-0003']);
  assert.equal(merged['PART-0002'].childrenLoaded, true);
});
