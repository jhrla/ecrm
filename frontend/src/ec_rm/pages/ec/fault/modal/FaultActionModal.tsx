import ApiClient from 'ec_rm/utils/ApiClient';
import React, { useState, useEffect } from 'react';

interface FaultData {
  event_id: number;
  recover_person: string;
  recover_date: string;
  fault_reason: string;
  fault_result: string;
  fault_recover_yn: string;
  non_recover_reason: string;
}

interface FaultActionModalProps {
  show: boolean;
  onClose: () => void;
  faultData: FaultData | null;
}

interface ValidationErrors {
  recover_person?: string;
  recover_date?: string;
  fault_reason?: string;
  fault_result?: string;
}

export const FaultActionModal: React.FC<FaultActionModalProps> = ({
  show,
  onClose,
  faultData,
}) => {
  const [formData, setFormData] = useState({
    recover_person: '',
    recover_date: '',
    fault_reason: '',
    fault_result: '',
    fault_recover_yn: 'N',
    non_recover_reason: '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    if (faultData) {
      setFormData({
        ...faultData,
        recover_date: faultData.recover_date
          ? faultData.recover_date.split('.')[0].replace(' ', 'T') // '2024-12-02 23:44:00.000' -> '2024-12-02T23:44:00'
          : new Date().toISOString().slice(0, 16),
      });
    }
  }, [faultData]);

  const handleChange = (
    e:
      | React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
      | { target: { name: string; value: string } }
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.recover_person.trim()) {
      newErrors.recover_person = '조치자를 입력해주세요';
    }

    if (!formData.recover_date) {
      newErrors.recover_date = '조치일시를 입력해주세요';
    }

    if (!formData.fault_reason.trim()) {
      newErrors.fault_reason = '현장 확인결과를 입력해주세요';
    }

    if (!formData.fault_result.trim()) {
      newErrors.fault_result = '조치결과를 입력해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (action: string) => {
    console.log(formData);
    if (validateForm()) {
      try {
        // 페이지 번호를 params에 포함하여 서버로 전달
        const response = await ApiClient.post(
          '/api/saveFaultAction',
          {
            ...formData,
            action: action,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        console.log(response.data);
        onClose();
      } catch (error) {
        console.error('Error fetching Devices:', error);
      }
    }
  };

  if (!show) return null;

  return (
    <div className='modal fade modal_sm show' style={{ display: 'block' }}>
      <div className='modal-dialog modal-dialog-centered modal-dialog-scrollable'>
        <div className='modal-content'>
          <form>
            <div className='modal-header modal-header-bg longBg'>
              <h5 className='modal-title'>장애 조치</h5>
              <button
                type='button'
                className='close'
                onClick={onClose}
                aria-label='Close'
              ></button>
            </div>
            <div className='modal-body pb00'>
              <div className='mscrollTable'>
                <div className='form-group row'>
                  <label className='col-sm-3 col-form-label'>조치자</label>
                  <div className='col-sm-9'>
                    <input
                      type='text'
                      className={`form-control ${errors.recover_person ? 'is-invalid' : ''}`}
                      name='recover_person'
                      value={formData.recover_person || ''}
                      onChange={handleChange}
                    />
                    {errors.recover_person && (
                      <div className='invalid-feedback'>
                        {errors.recover_person}
                      </div>
                    )}
                  </div>
                </div>

                <div className='form-group row'>
                  <label className='col-sm-3 col-form-label'>조치일시</label>
                  <div className='col-sm-9'>
                    <input
                      type='datetime-local'
                      className={`form-control ${errors.recover_date ? 'is-invalid' : ''}`}
                      name='recover_date'
                      value={formData.recover_date || ''}
                      onChange={handleDateChange}
                    />
                    {errors.recover_date && (
                      <div className='invalid-feedback'>
                        {errors.recover_date}
                      </div>
                    )}
                  </div>
                </div>

                <div className='form-group row'>
                  <label className='col-sm-3 col-form-label'>
                    현장 확인결과
                  </label>
                  <div className='col-sm-9'>
                    <input
                      type='text'
                      className={`form-control ${errors.fault_reason ? 'is-invalid' : ''}`}
                      name='fault_reason'
                      value={formData.fault_reason || ''}
                      onChange={handleChange}
                    />
                    {errors.fault_reason && (
                      <div className='invalid-feedback'>
                        {errors.fault_reason}
                      </div>
                    )}
                  </div>
                </div>

                <div className='form-group row'>
                  <label className='col-sm-3 col-form-label'>조치결과</label>
                  <div className='col-sm-9'>
                    <input
                      className={`form-control ${errors.fault_result ? 'is-invalid' : ''}`}
                      name='fault_result'
                      value={formData.fault_result || ''}
                      onChange={handleChange}
                    />
                    {errors.fault_result && (
                      <div className='invalid-feedback'>
                        {errors.fault_result}
                      </div>
                    )}
                  </div>
                </div>

                <div className='form-group row'>
                  <label className='col-sm-3 col-form-label'>미복구여부</label>
                  <div className='col-sm-9'>
                    <div style={{ textAlign: 'left' }}>
                      <input
                        type='checkbox'
                        className='form-control'
                        style={{
                          width: '40px',
                          height: '40px',
                          display: 'inline-block',
                        }}
                        name='fault_recover_yn'
                        checked={formData.fault_recover_yn === '1'}
                        onChange={(e) =>
                          handleChange({
                            target: {
                              name: 'fault_recover_yn',
                              value: e.target.checked ? '1' : '0',
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className='form-group row'>
                  <label className='col-sm-3 col-form-label'>미복구사유</label>
                  <div className='col-sm-9'>
                    <textarea
                      className='form-control'
                      name='non_recover_reason'
                      value={formData.non_recover_reason || ''}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className='modal-footer blue'>
              <button
                type='button'
                className={`btn ${faultData?.recover_person ? 'btn-danger text-white' : 'btn-primary'}`}
                onClick={() =>
                  handleSave(faultData?.recover_person ? 'update' : 'save')
                }
              >
                {faultData?.recover_person ? '수정' : '저장'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FaultActionModal;
