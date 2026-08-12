import { Link, useNavigate } from 'react-router';
import {
  saveCopyStudioImport,
  saveReaderImport,
  savePracticeSheetsImport,
  getPracticeGroupIdsForText,
} from '../lib/tool-bridge';

export default function ReaderConnectionsBar({
  takriText,
  romanText,
  title,
  sampleId,
  practiceGroupCount,
}) {
  const navigate = useNavigate();
  const hasText = Boolean(takriText?.trim());

  const handleCopyStudio = () => {
    saveCopyStudioImport({
      roman: romanText ?? '',
      takri: takriText ?? '',
      title: title ?? 'Reader text',
      source: 'reader',
    });
    navigate('/copy-studio');
  };

  const handlePracticeSheets = () => {
    const groupIds = getPracticeGroupIdsForText(takriText);
    savePracticeSheetsImport({
      groupIds,
      title: title ?? 'Characters from reader text',
    });
    navigate('/practice-sheets');
  };

  if (!hasText) return null;

  return (
    <div className="tr-connections-bar">
      <span className="tr-connections-label">Connect</span>
      <button type="button" className="tr-connection-btn" onClick={handleCopyStudio}>
        Copy Studio
      </button>
      <Link to="/character-reference" className="tr-connection-btn tr-connection-btn--link">
        Character Reference
      </Link>
      <button
        type="button"
        className="tr-connection-btn"
        onClick={handlePracticeSheets}
        disabled={practiceGroupCount === 0}
        title={practiceGroupCount === 0 ? 'No mapped character groups in this text' : undefined}
      >
        Practice Sheets
        {practiceGroupCount > 0 && (
          <span className="tr-connection-badge">{practiceGroupCount}</span>
        )}
      </button>
    </div>
  );
}

export function sendTextToReader(navigate, { takri, title, sampleId }) {
  saveReaderImport({ takri, title, sampleId });
  navigate('/reader');
}
