// src/components/ManageWriteModal.tsx
import React, { useState } from "react";

interface ManageWriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  onSync: () => void;
}

const ManageWriteModal = ({
  isOpen,
  onClose,
  onSave,
  onSync,
}: ManageWriteModalProps): JSX.Element | null => {
  const [formData, setFormData] = useState({});

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal fade modal_sm show" id="manageWriteModal">
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header modal-header-bg longBg">
            <h5 className="modal-title">무선수신기 정보설정</h5>
            <button type="button" className="close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">{/* Add form fields here */}</div>
            <div className="modal-footer">
              <button type="submit" className="btn btn-primary">
                저장
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onSync}
              >
                동기화
              </button>
              <button type="button" className="btn btn-clear" onClick={onClose}>
                취소
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManageWriteModal;
