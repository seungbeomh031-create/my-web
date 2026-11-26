/**
 * Cloudinary 설정
 */
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'l9wpigxf';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'my-web';

export const isCloudinaryConfigured = Boolean(
  CLOUDINARY_CLOUD_NAME && 
  CLOUDINARY_UPLOAD_PRESET
);

/**
 * 이미지 파일을 Cloudinary에 업로드하고 최적화된 secure_url을 반환합니다.
 * Cloudinary 오류 시에는 로컬 Base64 DataURL로 폴백하여 원활한 작동을 보장합니다.
 */
export const uploadImageFile = async (
  file: File, 
  userId?: string
): Promise<string> => {
  // 파일 크기 제한 (10MB)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('이미지 파일 크기는 10MB 이하여야 합니다.');
  }

  // 1. Cloudinary Unsigned Upload 시도
  if (isCloudinaryConfigured) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      if (userId) {
        formData.append('folder', `my-web/users/${userId}`);
      } else {
        formData.append('folder', 'my-web/uploads');
      }

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.error?.message || `Cloudinary 업로드 실패 (HTTP ${response.status})`;
        console.warn('Cloudinary 업로드 실패:', message);
        throw new Error(message);
      }

      const data = await response.json();
      if (data.secure_url) {
        return data.secure_url;
      }
    } catch (error) {
      console.warn('Cloudinary 업로드 중 오류 발생, 로컬 DataURL로 대체합니다:', error);
    }
  }

  // 2. Fallback: FileReader Base64
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('이미지 변환에 실패했습니다.'));
      }
    };
    reader.onerror = () => reject(new Error('파일 읽기 오류'));
    reader.readAsDataURL(file);
  });
};
