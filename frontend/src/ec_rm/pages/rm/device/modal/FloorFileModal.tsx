import axios from 'axios';
import ApiClient from 'ec_rm/utils/ApiClient';
import React, { useState } from 'react';

interface FloorInfo {
  contract_code: string;
  client_code: string;
  customer_name: string;
  city_code: string;
  city_name: string;
  district_code: string;
  district_name: string;
  building_type: string;
  address: string;
  service_type: string;
  contract_date: string;
  contract_qty: string;
}

interface FileItem {
  contract_code: string;
  client_code: string;
  floor_no: string | null;
  floor_name: string;
  file: File | null;
  file_path: string | null;
  fromDB: boolean;
}

interface FloorFileModalProps {
  floorInfo: FloorInfo;
  existingFiles: FileItem[];
  onClose: () => void; // 모달을 닫는 함수 prop으로 받음
}

export const FloorFileModal: React.FC<FloorFileModalProps> = ({
  floorInfo,
  existingFiles,
  onClose,
}) => {
  const [removeFiles, setRemoveFiles] = useState<FileItem[]>([]);

  const [files, setFiles] = useState<FileItem[]>(
    existingFiles.length > 0
      ? existingFiles
      : [
          {
            floor_no: null,
            floor_name: '',
            contract_code: floorInfo.contract_code,
            client_code: floorInfo.client_code,
            file: null,
            file_path: null,
            fromDB: false,
          },
        ]
  );

  // 파일 추가 함수 수정 (floor 값을 순차적으로 할당)
  const handleAddFile = () => {
    setFiles((prevFiles) => [
      {
        floor_no: null, // 첫 번째 파일은 floor 0, 그 이후로는 순차적으로
        floor_name: '',
        contract_code: floorInfo.contract_code,
        client_code: floorInfo.client_code,
        file: null,
        file_path: null,
        fromDB: false,
      },
      ...prevFiles,
    ]);
  };

  // 파일 변경 함수 수정 (index로 각 파일 구분)
  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const { name, value, files: inputFiles } = event.target;

    if (inputFiles && inputFiles.length > 0) {
      setFiles((prevFiles) =>
        prevFiles.map((file, i) =>
          i === index
            ? {
                ...file,
                [name]: inputFiles[0],
                file_path: inputFiles[0].name,
              }
            : file
        )
      );
    } else {
      setFiles((prevFiles) =>
        prevFiles.map((file, i) =>
          i === index
            ? {
                ...file,
                [name]: value, // 일반 텍스트 업데이트
              }
            : file
        )
      );
    }
  };

  // 파일 제거 함수 수정
  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => {
      // 현재 파일이 DB에서 온 파일이면 removeFiles에 추가
      const fileToRemove = prevFiles[index];
      if (fileToRemove.fromDB) {
        setRemoveFiles((prev) => [...prev, fileToRemove]);
      }

      // 파일이 1개이고 첫 번째 행인 경우, 초기화된 상태로 유지
      if (prevFiles.length === 1) {
        return [
          {
            floor_no: null,
            floor_name: '',
            contract_code: floorInfo.contract_code,
            client_code: floorInfo.client_code,
            file: null,
            file_path: null,
            fromDB: false,
          },
        ];
      }

      // 그 외의 경우 해당 파일 제거
      return prevFiles.filter((_, i) => i !== index);
    });
  };

  const handleMultiFileUpload = async () => {
    // 유효한 파일 항목만 필터링 (수정된 조건)
    const validFiles = files.filter((fileItem) => {
      // 파일이 이미 �거나(fromDB가 true) 새로운 파일이 선택된 경우에만 유효성 검사
      const isValid =
        (fileItem.fromDB || fileItem.file) &&
        fileItem.floor_no &&
        fileItem.floor_name;
      if (!isValid) {
        console.log('Invalid file item:', fileItem);
      }
      return isValid;
    });

    console.log('Files before validation:', files);
    console.log('Valid files to upload:', validFiles);

    if (validFiles.length === 0 && removeFiles.length === 0) {
      alert('업로드할 파일을 선택하거나 삭제할 파일을 지정해주세요.');
      return;
    }

    const formData = new FormData();

    // 기본 정보 추가
    formData.append('contract_code', floorInfo.contract_code);
    formData.append('client_code', floorInfo.client_code);

    // 유효한 파일이 있는 경우에만 파일 관련 데이터 추가
    validFiles.forEach((fileItem, index) => {
      // 새로운 파일이 있는 경우에만 파일 추가
      if (fileItem.file) {
        formData.append('files', fileItem.file);
      }
      formData.append('floors', String(fileItem.floor_no));
      formData.append('floors_name', fileItem.floor_name);
    });

    // 삭제할 파일이 있는 경우
    if (removeFiles.length > 0) {
      const removeFilesData = removeFiles.map((file) => ({
        contract_code: file.contract_code,
        client_code: file.client_code,
        floor_no: file.floor_no,
        floor_name: file.floor_name,
        file_path: file.file_path,
      }));
      formData.append('removeFiles', JSON.stringify(removeFilesData));
    }

    // FormData 내용 확인
    console.log('FormData contents:');
    Array.from(formData.entries()).forEach((pair) => {
      console.log('Key:', pair[0], 'Value:', pair[1]);
    });

    try {
      const response = await ApiClient.post('api/setFloorInfo', formData);
      console.log('Upload response:', response);

      if (response.data > 0) {
        alert('파일 및 데이터가 성공적으로 처리되었습니다.');
        onClose();
      } else {
        alert('처리 중 오류가 발생하였습니다. (처리된 항목 없음)');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(`처리중 오류가 발생하였습니다: ${error.message}`);
    }
  };

  return (
    <div
      className='modal fade modal_sm show'
      id='FloorFileModal'
      style={{ display: 'block' }}
    >
      <div className='modal-dialog modal-dialog-centered modal-dialog-scrollable'>
        <div className='modal-content'>
          <div className='modal-header modal-header-bg longBg'>
            <h5 className='modal-title'>평면도 등록하기</h5>
            <button
              type='button'
              className='close'
              onClick={onClose}
              aria-label='Close'
            ></button>
          </div>
          <form>
            <div className='modal-body pb00'>
              <div className='row floorplan_input'>
                <div className='form-group col-6'>
                  <label className='col-form-label'>계약번호</label>
                  <input
                    type='text'
                    className='form-control'
                    value={floorInfo.contract_code}
                    readOnly
                  />
                </div>
                <div className='form-group col-6'>
                  <label className='col-form-label'>고객명</label>
                  <input
                    type='text'
                    className='form-control'
                    value={floorInfo.customer_name}
                    readOnly
                  />
                </div>
                <div className='form-group col-6'>
                  <label className='col-form-label'>계약일시</label>
                  <input
                    type='text'
                    className='form-control'
                    value={floorInfo.contract_date}
                    readOnly
                  />
                </div>
                <div className='form-group col-6'>
                  <label className='col-form-label'>건물유형</label>
                  <input
                    type='text'
                    className='form-control'
                    value={floorInfo.building_type}
                    readOnly
                  />
                </div>
                <div className='form-group col-12'>
                  <label className='col-form-label'>주소</label>
                  <input
                    type='text'
                    className='form-control'
                    value={floorInfo.address}
                    readOnly
                  />
                </div>
              </div>

              {/* 파일 업로드 섹션 */}
              <div className='blue-inner'>
                <div className='title_style d-flex justify-content-between'>
                  증빙서류 (평면도)
                  <button
                    type='button'
                    className='add_upload_file'
                    style={{ marginRight: '10px' }}
                    onClick={handleAddFile}
                  >
                    <i className='ti-plus'></i>
                  </button>
                </div>

                <div className='floorplan_file'>
                  {files.map((file, index) => (
                    <div key={index} className='mb5'>
                      <label className='floor_num_label col-form-label'>
                        도면정보
                      </label>
                      <input
                        key={index}
                        type='text'
                        className='floor_num form-control'
                        placeholder='층입력'
                        name='floor_no'
                        value={file.floor_no ?? ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          // 숫자 또는 단일 음수만 허용 (정규식: 숫자와 음수 기호만 허용)
                          if (/^-?\d*$/.test(value)) {
                            handleFileChange(
                              {
                                target: {
                                  name: 'floor_no',
                                  value: value === '' ? null : value,
                                },
                              } as React.ChangeEvent<HTMLInputElement>,
                              index
                            );
                          }
                        }}
                        readOnly={Boolean(file.fromDB)}
                      />
                      <input
                        type='text'
                        className='floor_nm form-control'
                        placeholder='별칭 입력'
                        name='floor_name'
                        value={file.floor_name}
                        onChange={(e) => handleFileChange(e, index)}
                      />
                      <div className='upload_file_form'>
                        <input
                          type='text'
                          className='imsi_file_form form-control'
                          name='file_path'
                          readOnly
                          value={file.file_path ? file.file_path : ''}
                        />
                        {!file.file_path ? (
                          <>
                            <button type='button' className='file_button_image'>
                              파일선택
                            </button>
                            <input
                              type='file'
                              className='input_file_button'
                              name='file'
                              onChange={(e) => handleFileChange(e, index)}
                              style={{ width: '100%' }}
                            />
                          </>
                        ) : null}
                      </div>
                      {/* 첫 번째 행은 파일이 있을 때 마이너스, 없을 때 플러스 버튼 표시 */}
                      <button
                        type='button'
                        className='delete_upload_file'
                        onClick={() => handleRemoveFile(index)}
                      >
                        <i className='ti-minus'></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className='modal-footer blue'>
              <button
                type='button'
                className='btn btn-primary'
                onClick={handleMultiFileUpload}
              >
                저장
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FloorFileModal;
