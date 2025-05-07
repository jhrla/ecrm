import React, { useState } from 'react';

interface PasswordModalProps {
  show: boolean;
  onClose: () => void;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
  show,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  if (!show) return null;

  return (
    <div className='modal_wrap'>
      <div className='modal_content modal_sm'>
        <div className='modal_header'>
          <h3>회원정보수정</h3>
          <button type='button' className='close' onClick={onClose}>
            <span>&times;</span>
          </button>
        </div>

        <div className='modal_body'>
          <div className='table_type4'>
            <table>
              <tbody>
                <tr>
                  <th>현재비밀번호</th>
                  <td>
                    <input
                      type='password'
                      className='form-control'
                      value={formData.currentPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          currentPassword: e.target.value,
                        })
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <th>신규비밀번호</th>
                  <td>
                    <input
                      type='password'
                      className='form-control'
                      value={formData.newPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          newPassword: e.target.value,
                        })
                      }
                    />
                    <span className='small point_color1'>
                      *영문 대소문자/숫자/특수문자 (~!@#$%^&*) 등 2가지이상 조합
                      10~16자내외
                    </span>
                  </td>
                </tr>
                <tr>
                  <th>신규비밀번호 확인</th>
                  <td>
                    <input
                      type='password'
                      className='form-control'
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className='modal_footer'>
          <button type='button' className='btn btn-primary'>
            저장
          </button>
          <button type='button' className='btn btn-secondary' onClick={onClose}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordModal;
