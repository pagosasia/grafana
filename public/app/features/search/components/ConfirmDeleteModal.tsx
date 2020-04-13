import React, { Dispatch, FC } from 'react';
import { css } from 'emotion';
import { GrafanaTheme } from '@grafana/data';
import { ConfirmModal, stylesFactory, useTheme } from '@grafana/ui';
import { getLocationSrv } from '@grafana/runtime';
import { backendSrv } from 'app/core/services/backend_srv';
import { DashboardSection, SearchAction } from '../types';
import { getCheckedUids } from '../utils';
import { DELETE_ITEMS } from '../reducers/actionTypes';

interface Props {
  dispatch: Dispatch<SearchAction>;
  results: DashboardSection[];
  isOpen: boolean;
  onClose: () => void;
}

export const ConfirmDeleteModal: FC<Props> = ({ results, dispatch, isOpen, onClose }) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const uids = getCheckedUids(results);
  const { folders, dashboards } = uids;
  const folderCount = folders.length;
  const dashCount = dashboards.length;
  let text = 'Do you want to delete the ';
  let subtitle;
  const dashEnding = dashCount === 1 ? '' : 's';
  const folderEnding = folderCount === 1 ? '' : 's';

  if (folderCount > 0 && dashCount > 0) {
    text += `selected folder${folderEnding} and dashboard${dashEnding}?\n`;
    subtitle = `All dashboards of the selected folder${folderEnding} will also be deleted`;
  } else if (folderCount > 0) {
    text += `selected folder${folderEnding} and all its dashboards?`;
  } else {
    text += `selected dashboard${dashEnding}?`;
  }

  const deleteItems = () => {
    backendSrv.deleteFoldersAndDashboards(folders, dashboards).then(() => {
      onClose();
      // Redirect to /dashboard in case folder was deleted from f/:folder.uid
      getLocationSrv().update({ path: '/dashboards' });
      dispatch({ type: DELETE_ITEMS, payload: { folders, dashboards } });
    });
  };

  return (
    <ConfirmModal
      isOpen={isOpen}
      title="Delete"
      body={
        <>
          {text} {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
        </>
      }
      confirmText="Delete"
      onConfirm={deleteItems}
      onDismiss={onClose}
    />
  );
};

const getStyles = stylesFactory((theme: GrafanaTheme) => {
  return {
    subtitle: css`
      font-size: ${theme.typography.size.base};
      padding-top: ${theme.spacing.md};
    `,
  };
});
