import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Icon from '@mui/material/Icon';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { ReactNodeIcon } from '../../shared/ui/ReactGlyphs';
import { AuditLogsPanel } from './components/AuditLogsPanel';
import { BomPanel } from './components/BomPanel';
import { CreatePartPanel } from './components/CreatePartPanel';
import { PartDetailsPanel } from './components/PartDetailsPanel';
import { PartsSidebar, type PartsViewMode } from './components/PartsSidebar';
import { PartSearchPanel } from './components/PartSearchPanel';
import { usePartsPageState } from './hooks/usePartsPageState';

export function PartsPage() {
  const state = usePartsPageState();
  const [activeView, setActiveView] = useState<PartsViewMode>('details');
  const [showSelectorPage, setShowSelectorPage] = useState(false);
  const currentWorkspaceLabel = showSelectorPage
    ? 'Search Parts'
    : activeView === 'create'
      ? 'Create Part'
      : activeView === 'details'
        ? 'Part Details'
        : activeView === 'bom'
          ? 'BOM Manager'
          : 'Audit Logs';
  const currentWorkspaceIcon = showSelectorPage
    ? 'search'
    : activeView === 'create'
      ? 'add_circle'
      : activeView === 'details'
        ? 'description'
        : activeView === 'bom'
          ? 'account_tree'
          : 'history';

  const clearSearchInput = useCallback(() => {
    state.setSearchInput('');
  }, [state.setSearchInput]);

  const handleOpenPartSelector = useCallback(() => {
    setShowSelectorPage(true);
  }, []);

  const handleOpenCreatePage = useCallback(() => {
    clearSearchInput();
    setShowSelectorPage(false);
    setActiveView('create');
  }, [clearSearchInput]);

  useEffect(() => {
    const onOpenCreate = () => {
      handleOpenCreatePage();
    };

    window.addEventListener('parts:open-create', onOpenCreate);
    return () => {
      window.removeEventListener('parts:open-create', onOpenCreate);
    };
  }, [handleOpenCreatePage]);

  const handleChangeView = (nextView: PartsViewMode) => {
    clearSearchInput();
    setActiveView(nextView);
    setShowSelectorPage(false);
  };

  const handleClosePartSelector = () => {
    clearSearchInput();
    setShowSelectorPage(false);
  };

  const handleSelectPartFromSelector = (partId: string) => {
    clearSearchInput();
    state.selectPart(partId);
    setShowSelectorPage(false);
  };

  return (
    <Box
      component="section"
      sx={{
        width: '100%',
        minHeight: 0,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '320px minmax(0, 1fr)' },
        gap: { xs: 1.25, md: 1.75 },
        alignItems: 'stretch',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gap: 1.25,
          minWidth: 0,
          minHeight: 0,
          alignContent: 'start',
        }}
      >
        <PartsSidebar
          activeView={activeView}
          onChangeView={handleChangeView}
          isSelectorPageOpen={showSelectorPage}
          selectedPart={state.selectedPart}
          selectedPartDetails={state.details.data}
          partsCount={state.search.parts.length}
          onOpenPartSelector={handleOpenPartSelector}
          onOpenCreatePage={handleOpenCreatePage}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateRows: 'auto minmax(0, 1fr)',
          gap: 1.15,
          minWidth: 0,
          minHeight: 0,
        }}
      >
        <Box
          sx={{
            px: 0.95,
            py: 0.9,
            display: 'flex',
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            gap: 0.9,
            borderRadius: 2,
            border: '1px solid',
            borderColor: (theme) => alpha(theme.palette.primary.main, 0.24),
            background: (theme) =>
              `linear-gradient(92deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 56%, ${alpha(theme.palette.primary.light, 0.2)} 100%)`,
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              Current Workspace
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55 }}>
              <Icon baseClassName="material-symbols-rounded" color="primary" sx={{ fontSize: 18 }}>
                {currentWorkspaceIcon}
              </Icon>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {currentWorkspaceLabel}
              </Typography>
            </Box>
          </Box>
          <Chip
            size="small"
            color="primary"
            variant={state.selectedPart ? 'filled' : 'outlined'}
            icon={<ReactNodeIcon sx={{ fontSize: 16 }} />}
            label={
              state.selectedPart
                ? `${state.selectedPart.partNumber} - ${state.selectedPart.name}`
                : 'No part selected'
            }
            sx={{
              maxWidth: { xs: '100%', sm: 390 },
              alignSelf: { xs: 'stretch', sm: 'center' },
              width: { xs: '100%', sm: 'auto' },
              '& .MuiChip-label': {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              },
            }}
          />
        </Box>

        {showSelectorPage ? (
          <PartSearchPanel
            mode="workspace"
            onBackToWorkspace={handleClosePartSelector}
            searchInput={state.search.input}
            onSearchInputChange={state.setSearchInput}
            searchLoading={state.search.loading}
            searchError={state.search.error}
            parts={state.search.parts}
            selectedPartId={state.selectedPartId}
            onSelectPart={handleSelectPartFromSelector}
          />
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: 1,
              minHeight: 0,
              alignContent: 'start',
            }}
          >
            {activeView === 'details' ? (
              <PartDetailsPanel
                details={state.details.data}
                loading={state.details.loading}
                error={state.details.error}
              />
            ) : null}

            {activeView === 'create' ? (
              <CreatePartPanel
                loading={state.search.createLoading}
                error={state.search.createError}
                onCreatePart={state.onCreatePart}
                onClearError={state.clearCreatePartError}
                onOpenSearch={handleOpenPartSelector}
                onOpenDetails={() => {
                  handleChangeView('details');
                }}
              />
            ) : null}

            {activeView === 'bom' ? (
              <BomPanel
                key={state.bom.rootId ?? 'no-root'}
                rootId={state.bom.rootId}
                nodes={state.bom.nodes}
                expandedNodeIds={state.bom.expandedNodeIds}
                loading={state.bom.loading}
                error={state.bom.error}
                mutationLoading={state.bom.mutationLoading}
                mutationError={state.bom.mutationError}
                availableParts={state.allParts}
                managedChildLinks={state.details.data?.childParts ?? []}
                onToggleNode={state.onToggleNode}
                onRetryChildren={state.onRetryChildren}
                onCreateLink={state.onCreateBomLink}
                onCreatePartForBom={state.onCreatePartForBom}
                onUpdateLink={state.onUpdateBomLink}
                onDeleteLink={state.onDeleteBomLink}
                onClearMutationError={state.clearBomMutationError}
              />
            ) : null}

            {activeView === 'audit' ? (
              <AuditLogsPanel
                logs={state.audit.logs}
                loading={state.audit.loading}
                error={state.audit.error}
              />
            ) : null}
          </Box>
        )}
      </Box>
    </Box>
  );
}
