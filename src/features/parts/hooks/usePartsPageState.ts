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
  ChildPartUsage,
  PartDetails,
  PartSummary,
} from '../../../shared/types/partBom';
import { getErrorMessage } from '../../../shared/utils/errors';
import type { UiBomNode } from '../types';
import { mergeBomNodes, normalizeBomTree } from '../utils/bomTree';

const INITIAL_BOM_DEPTH = 1;

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

function upsertPartSummary(
  currentParts: PartSummary[],
  part: PartSummary,
): PartSummary[] {
  const withoutPart = currentParts.filter((item) => item.id !== part.id);
  return [...withoutPart, part].sort((a, b) =>
    a.partNumber.localeCompare(b.partNumber),
  );
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
  const selectedPartIdRef = useRef<string | null>(null);

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
    () => {
      if (partDetails && partDetails.id === selectedPartId) {
        return {
          id: partDetails.id,
          partNumber: partDetails.partNumber,
          name: partDetails.name,
        };
      }

      return (
        parts.find((part) => part.id === selectedPartId) ??
        allParts.find((part) => part.id === selectedPartId) ??
        null
      );
    },
    [allParts, partDetails, parts, selectedPartId],
  );

  const applyLocalChildLinkUpdate = useCallback(
    (updater: (currentChildren: ChildPartUsage[]) => ChildPartUsage[]) => {
      setPartDetails((current) => {
        if (!current) {
          return current;
        }

        const nextChildren = updater(current.childParts);

        return {
          ...current,
          childParts: nextChildren,
          childCount: nextChildren.length,
        };
      });
    },
    [],
  );

  useEffect(() => {
    selectedPartIdRef.current = selectedPartId;
  }, [selectedPartId]);

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

  const refreshCatalogSilently = useCallback(async () => {
    try {
      const latestAllParts = await searchParts('');
      setAllParts(latestAllParts);

      if (searchInput.trim()) {
        const latestSearchResults = await searchParts(searchInput);
        setParts(latestSearchResults);
      } else {
        setParts(latestAllParts);
      }
    } catch {
      // Keep current list state when silent refresh fails.
    }
  }, [searchInput]);

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
        getBomTree(selectedPartId, INITIAL_BOM_DEPTH),
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
        const nodes = normalizeBomTree(bomResult.value.tree, INITIAL_BOM_DEPTH);
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
      const createdSummary: PartSummary = {
        id: createdPart.id,
        partNumber: createdPart.partNumber,
        name: createdPart.name,
      };

      setAllParts((current) => upsertPartSummary(current, createdSummary));
      setParts((current) => upsertPartSummary(current, createdSummary));
      setSearchInput('');
      setSelectedPartId(createdPart.id);
      setPartDetails({
        ...createdPart,
        parentCount: 0,
        childCount: 0,
        parentParts: [],
        childParts: [],
      });
      setDetailsError(null);
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
      const createdSummary: PartSummary = {
        id: createdPart.id,
        partNumber: createdPart.partNumber,
        name: createdPart.name,
      };

      setAllParts((current) => upsertPartSummary(current, createdSummary));
      setParts((current) => upsertPartSummary(current, createdSummary));

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

  const onRefreshSelected = useCallback(async (options?: { silent?: boolean }) => {
    const currentSelectedPartId = selectedPartIdRef.current;
    if (!currentSelectedPartId) {
      return;
    }

    const isSilentRefresh = options?.silent ?? false;

    if (!isSilentRefresh) {
      setDetailsLoading(true);
      setAuditLoading(true);
      setBomLoading(true);
      setBomMutationError(null);
    }

    const [detailsResult, auditResult, bomResult] = await Promise.allSettled([
      getPartDetails(currentSelectedPartId),
      getPartAuditLogs(currentSelectedPartId),
      getBomTree(currentSelectedPartId, INITIAL_BOM_DEPTH),
    ]);

    if (selectedPartIdRef.current !== currentSelectedPartId) {
      return;
    }

    if (detailsResult.status === 'fulfilled') {
      const updatedSummary: PartSummary = {
        id: detailsResult.value.id,
        partNumber: detailsResult.value.partNumber,
        name: detailsResult.value.name,
      };

      setPartDetails(detailsResult.value);
      setDetailsError(null);
      setAllParts((current) => upsertPartSummary(current, updatedSummary));
      setParts((current) =>
        current.some((part) => part.id === updatedSummary.id)
          ? upsertPartSummary(current, updatedSummary)
          : current,
      );
    } else {
      if (!isSilentRefresh) {
        setDetailsError(getErrorMessage(detailsResult.reason));
      }
    }
    if (!isSilentRefresh) {
      setDetailsLoading(false);
    }

    if (auditResult.status === 'fulfilled') {
      setAuditLogs(auditResult.value);
      setAuditError(null);
    } else {
      if (!isSilentRefresh) {
        setAuditError(getErrorMessage(auditResult.reason));
      }
    }
    if (!isSilentRefresh) {
      setAuditLoading(false);
    }

    if (bomResult.status === 'fulfilled') {
      const nextRootId = bomResult.value.tree.part.id;
      const incomingNodes = normalizeBomTree(
        bomResult.value.tree,
        INITIAL_BOM_DEPTH,
      );

      setBomRootId(nextRootId);
      setBomNodes(incomingNodes);
      setExpandedNodeIds((current) => {
        const next = new Set<string>();
        for (const nodeId of current) {
          if (incomingNodes[nodeId]) {
            next.add(nodeId);
          }
        }
        next.add(nextRootId);
        return next;
      });
      setBomError(null);
    } else {
      if (!isSilentRefresh) {
        setBomError(getErrorMessage(bomResult.reason));
      }
    }
    if (!isSilentRefresh) {
      setBomLoading(false);
    }
  }, []);

  useEffect(() => {
    const refreshOnFocus = () => {
      if (document.visibilityState === 'visible') {
        void refreshCatalogSilently();
        if (selectedPartIdRef.current) {
          void onRefreshSelected({ silent: true });
        }
      }
    };

    window.addEventListener('focus', refreshOnFocus);
    document.addEventListener('visibilitychange', refreshOnFocus);

    return () => {
      window.removeEventListener('focus', refreshOnFocus);
      document.removeEventListener('visibilitychange', refreshOnFocus);
    };
  }, [onRefreshSelected, refreshCatalogSilently]);

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
      const linkedPart =
        allParts.find((part) => part.id === childId) ??
        parts.find((part) => part.id === childId);

      if (linkedPart) {
        applyLocalChildLinkUpdate((currentChildren) => {
          const existingIndex = currentChildren.findIndex(
            (child) => child.id === childId,
          );

          if (existingIndex >= 0) {
            const nextChildren = [...currentChildren];
            nextChildren[existingIndex] = {
              ...nextChildren[existingIndex],
              quantity,
            };
            return nextChildren;
          }

          return [...currentChildren, { ...linkedPart, quantity }].sort((a, b) =>
            a.partNumber.localeCompare(b.partNumber),
          );
        });
      }

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
      applyLocalChildLinkUpdate((currentChildren) =>
        currentChildren.map((child) =>
          child.id === childId ? { ...child, quantity } : child,
        ),
      );

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
      applyLocalChildLinkUpdate((currentChildren) =>
        currentChildren.filter((child) => child.id !== childId),
      );

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
