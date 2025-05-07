import ApiClient from 'ec_rm/utils/ApiClient'; // Adjust the import path as necessary

export const downloadExcel = async (
  url: string,
  params: any,
  fileName: string
): Promise<void> => {
  try {
    const response = await ApiClient.get(url, {
      params,
      responseType: 'blob',
      headers: {
        Accept: 'application/vnd.ms-excel',
      },
    });

    if (response.status === 200) {
      const blob = new Blob([response.data], {
        type: 'application/vnd.ms-excel',
      });
      const fileUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = `${fileName}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(fileUrl);
      a.remove();
    }
  } catch (error) {
    console.error('Error downloading Excel file:', error);
  }
};
