import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createPart,
  createBomLink,
  deleteBomLink,
  getBomTree,
  getPartAuditLogs,
  getPartDetails,
  searchParts,
  updateBomLink,
} from '../../../shared/api/partBomApi';
import type {
  AuditLog,
  PartDetails,
  PartSummary,
} from '../../../shared/types/partBom';
import { getErrorMessage } from '../../../shared/utils/errors';
import type { UiBomNode } from '../types';
import { mergeBomNodes, normalizeBomTree } from '../utils/bomTree';

interface SearchState {
  input: string;
  loading: boolean;
  error: string | null;
  createLoading: boolean;
  createError: string | null;
  parts: PartSummary[];
}

interface DetailsState {
  data: PartDetails | null;
  loading: boolean;
  error: string | null;
}

interface AuditState {
  logs: AuditLog[];
  loading: boolean;
  error: string | null;
}

interface BomState {
  rootId: string | null;
  nodes: Record<string, UiBomNode>;
  expandedNodeIds: Set<string>;
  loading: boolean;
  error: string | null;
  mutationLoading: boolean;
  mutationError: string | null;
}

export interface PartsPageState {
  search: SearchState;
  details: DetailsState;
  audit: AuditState;
  bom: BomState;
  allParts: PartSummary[];
  selectedPartId: string | null;
  selectedPart: PartSummary | null;
  setSearchInput: (nextValue: string) => void;
  selectPart: (partId: string) => void;
  onCreatePart: (payload: {
    name: string;
    partNumber?: string;
    description?: string;
  }) => Promise<void>;
  onCreatePartForBom: (payload: {
    name: string;
    partNumber?: string;
    description?: string;
  }) => Promise<PartSummary>;
  clearCreatePartError: () => void;
  onToggleNode: (nodeId: string) => void;
  onRetryChildren: (nodeId: string) => void;
  onRefreshSelected: () => Promise<void>;
  onCreateBomLink: (childId: string, quantity: number) => Promise<void>;
  onUpdateBomLink: (childId: string, quantity: number) => Promise<void>;
  onDeleteBomLink: (childId: string) => Promise<void>;
  clearBomMutationError: () => void;
}

export function usePartsPageState(): PartsPageState {
  const [searchInput, setSearchInput] = useState('');
  const [parts, setParts] = useState<PartSummary[]>([]);
  const [allParts, setAllParts] = useState<PartSummary[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [createPartLoading, setCreatePartLoading] = useState(false);
  const [createPartError, setCreatePartError] = useState<string | null>(null);
  const hasMountedSearchInputEffect = useRef(false);

  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);

  const [partDetails, setPartDetails] = useState<PartDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);

  const [bomRootId, setBomRootId] = useState<string | null>(null);
  const [bomNodes, setBomNodes] = useState<Record<string, UiBomNode>>({});
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set());
  const [bomLoading, setBomLoading] = useState(false);
  const [bomError, setBomError] = useState<string | null>(null);
  const [bomMutationLoading, setBomMutationLoading] = useState(false);
  const [bomMutationError, setBomMutationError] = useState<string | null>(null);

  const selectedPart = useMemo(
    () => parts.find((part) => part.id === selectedPartId) ?? null,
    [parts, selectedPartId],
  );

  const applySearchResults = useCallback((nextParts: PartSummary[]) => {
    setParts(nextParts);
    setSelectedPartId((currentSelected) => {
      if (
        currentSelected &&
        nextParts.some((part) => part.id === currentSelected)
      ) {
        return currentSelected;
      }

      return nextParts[0]?.id ?? null;
    });
  }, []);

  const runSearch = useCallback(
    async (query: string) => {
      setSearchLoading(true);
      setSearchError(null);

      try {
        const results = await searchParts(query);
        applySearchResults(results);
      } catch (error) {
        setSearchError(getErrorMessage(error));
      } finally {
        setSearchLoading(false);
      }
    },
    [applySearchResults],
  );

  useEffect(() => {
    void runSearch('');
  }, [runSearch]);

  useEffect(() => {
    if (!hasMountedSearchInputEffect.current) {
      hasMountedSearchInputEffect.current = true;
      return;
    }

    const debounceTimerId = window.setTimeout(() => {
      void runSearch(searchInput);
    }, 280);

    return () => {
      window.clearTimeout(debounceTimerId);
    };
  }, [runSearch, searchInput]);

  useEffect(() => {
    let ignoreResponse = false;

    const loadAllParts = async () => {
      try {
        const results = await searchParts('');
        if (!ignoreResponse) {
          setAllParts(results);
        }
      } catch {
        if (!ignoreResponse) {
          setAllParts([]);
        }
      }
    };

    void loadAllParts();

    return () => {
      ignoreResponse = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedPartId) {
      setPartDetails(null);
      setAuditLogs([]);
      setBomRootId(null);
      setBomNodes({});
      setExpandedNodeIds(new Set());
      setBomMutationError(null);
      return;
    }

    let ignoreResponse = false;

    const loadPartContext = async () => {
      setDetailsLoading(true);
      setAuditLoading(true);
      setBomLoading(true);
      setDetailsError(null);
      setAuditError(null);
      setBomError(null);
      setBomMutationError(null);

      const [detailsResult, auditResult, bomResult] = await Promise.allSettled([
        getPartDetails(selectedPartId),
        getPartAuditLogs(selectedPartId),
        getBomTree(selectedPartId, 1),
      ]);

      if (ignoreResponse) {
        return;
      }

      if (detailsResult.status === 'fulfilled') {
        setPartDetails(detailsResult.value);
      } else {
        setPartDetails(null);
        setDetailsError(getErrorMessage(detailsResult.reason));
      }
      setDetailsLoading(false);

      if (auditResult.status === 'fulfilled') {
        setAuditLogs(auditResult.value);
      } else {
        setAuditLogs([]);
        setAuditError(getErrorMessage(auditResult.reason));
      }
      setAuditLoading(false);

      if (bomResult.status === 'fulfilled') {
        const nodes = normalizeBomTree(bomResult.value.tree, 1);
        setBomRootId(bomResult.value.tree.part.id);
        setBomNodes(nodes);
        setExpandedNodeIds(new Set([bomResult.value.tree.part.id]));
      } else {
        setBomRootId(null);
        setBomNodes({});
        setExpandedNodeIds(new Set());
        setBomError(getErrorMessage(bomResult.reason));
      }
      setBomLoading(false);
    };

    void loadPartContext();

    return () => {
      ignoreResponse = true;
    };
  }, [selectedPartId]);

  const loadBomChildren = useCallback(async (nodeId: string) => {
    setBomNodes((current) => {
      const node = current[nodeId];
      if (!node || node.loadingChildren || node.childrenLoaded || !node.hasChildren) {
        return current;
      }

      return {
        ...current,
        [nodeId]: {
          ...node,
          loadingChildren: true,
          childrenError: undefined,
        },
      };
    });

    try {
      const response = await getBomTree(nodeId, 1);
      const incoming = normalizeBomTree(response.tree, 1);

      setBomNodes((current) => {
        const merged = mergeBomNodes(current, incoming);
        const rootNode = merged[nodeId];

        if (!rootNode) {
          return merged;
        }

        return {
          ...merged,
          [nodeId]: {
            ...rootNode,
            childrenLoaded: true,
            loadingChildren: false,
            childrenError: undefined,
          },
        };
      });
    } catch (error) {
      const message = getErrorMessage(error);

      setBomNodes((current) => {
        const node = current[nodeId];
        if (!node) {
          return current;
        }

        return {
          ...current,
          [nodeId]: {
            ...node,
            loadingChildren: false,
            childrenError: message,
          },
        };
      });
    }
  }, []);

  const onCreatePart = async (payload: {
    name: string;
    partNumber?: string;
    description?: string;
  }) => {
    setCreatePartLoading(true);
    setCreatePartError(null);
    setSearchError(null);

    try {
      const createdPart = await createPart(payload);
      const results = await searchParts('');

      setAllParts(results);
      setParts(results);
      setSearchInput('');
      setSelectedPartId(createdPart.id);
    } catch (error) {
      const message = getErrorMessage(error);
      setCreatePartError(message);
      throw new Error(message);
    } finally {
      setCreatePartLoading(false);
    }
  };

  const onCreatePartForBom = async (payload: {
    name: string;
    partNumber?: string;
    description?: string;
  }) => {
    setCreatePartLoading(true);
    setCreatePartError(null);
    setSearchError(null);

    try {
      const createdPart = await createPart(payload);
      const results = await searchParts('');

      setAllParts(results);
      setParts(results);

      return {
        id: createdPart.id,
        partNumber: createdPart.partNumber,
        name: createdPart.name,
      };
    } catch (error) {
      const message = getErrorMessage(error);
      setCreatePartError(message);
      throw new Error(message);
    } finally {
      setCreatePartLoading(false);
    }
  };

  const clearCreatePartError = () => {
    setCreatePartError(null);
  };

  const onToggleNode = (nodeId: string) => {
    const node = bomNodes[nodeId];
    const isExpanded = expandedNodeIds.has(nodeId);

    setExpandedNodeIds((current) => {
      const next = new Set(current);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });

    if (!isExpanded && node && node.hasChildren && !node.childrenLoaded) {
      void loadBomChildren(nodeId);
    }
  };

  const onRetryChildren = (nodeId: string) => {
    void loadBomChildren(nodeId);
  };

  const onRefreshSelected = async () => {
    if (!selectedPartId) {
      return;
    }

    setDetailsLoading(true);
    setAuditLoading(true);
    setBomLoading(true);
    setBomMutationError(null);

    const [detailsResult, auditResult, bomResult] = await Promise.allSettled([
      getPartDetails(selectedPartId),
      getPartAuditLogs(selectedPartId),
      getBomTree(selectedPartId, 1),
    ]);

    if (detailsResult.status === 'fulfilled') {
      setPartDetails(detailsResult.value);
      setDetailsError(null);
    } else {
      setDetailsError(getErrorMessage(detailsResult.reason));
    }
    setDetailsLoading(false);

    if (auditResult.status === 'fulfilled') {
      setAuditLogs(auditResult.value);
      setAuditError(null);
    } else {
      setAuditError(getErrorMessage(auditResult.reason));
    }
    setAuditLoading(false);

    if (bomResult.status === 'fulfilled') {
      const nodes = normalizeBomTree(bomResult.value.tree, 1);
      setBomRootId(bomResult.value.tree.part.id);
      setBomNodes(nodes);
      setExpandedNodeIds(new Set([bomResult.value.tree.part.id]));
      setBomError(null);
    } else {
      setBomError(getErrorMessage(bomResult.reason));
    }
    setBomLoading(false);
  };

  const onCreateBomLink = async (childId: string, quantity: number) => {
    if (!selectedPartId) {
      throw new Error('Select a parent part before creating a BOM link.');
    }

    setBomMutationLoading(true);
    setBomMutationError(null);

    try {
      await createBomLink({
        parentId: selectedPartId,
        childId,
        quantity,
      });
      await onRefreshSelected();
    } catch (error) {
      const message = getErrorMessage(error);
      setBomMutationError(message);
      throw new Error(message);
    } finally {
      setBomMutationLoading(false);
    }
  };

  const onUpdateBomLink = async (childId: string, quantity: number) => {
    if (!selectedPartId) {
      throw new Error('Select a parent part before updating a BOM link.');
    }

    setBomMutationLoading(true);
    setBomMutationError(null);

    try {
      await updateBomLink({
        parentId: selectedPartId,
        childId,
        quantity,
      });
      await onRefreshSelected();
    } catch (error) {
      const message = getErrorMessage(error);
      setBomMutationError(message);
      throw new Error(message);
    } finally {
      setBomMutationLoading(false);
    }
  };

  const onDeleteBomLink = async (childId: string) => {
    if (!selectedPartId) {
      throw new Error('Select a parent part before deleting a BOM link.');
    }

    setBomMutationLoading(true);
    setBomMutationError(null);

    try {
      await deleteBomLink(selectedPartId, childId);
      await onRefreshSelected();
    } catch (error) {
      const message = getErrorMessage(error);
      setBomMutationError(message);
      throw new Error(message);
    } finally {
      setBomMutationLoading(false);
    }
  };

  const clearBomMutationError = () => {
    setBomMutationError(null);
  };

  return {
    search: {
      input: searchInput,
      loading: searchLoading,
      error: searchError,
      createLoading: createPartLoading,
      createError: createPartError,
      parts,
    },
    details: {
      data: partDetails,
      loading: detailsLoading,
      error: detailsError,
    },
    audit: {
      logs: auditLogs,
      loading: auditLoading,
      error: auditError,
    },
    bom: {
      rootId: bomRootId,
      nodes: bomNodes,
      expandedNodeIds,
      loading: bomLoading,
      error: bomError,
      mutationLoading: bomMutationLoading,
      mutationError: bomMutationError,
    },
    allParts,
    selectedPartId,
    selectedPart,
    setSearchInput,
    selectPart: setSelectedPartId,
    onCreatePart,
    onCreatePartForBom,
    clearCreatePartError,
    onToggleNode,
    onRetryChildren,
    onRefreshSelected,
    onCreateBomLink,
    onUpdateBomLink,
    onDeleteBomLink,
    clearBomMutationError,
  };
}
