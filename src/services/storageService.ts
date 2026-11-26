/**
 * Cloudinary 설정 (.env 환경 변수에서 안전하게 로드)
 */
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';

export const isCloudinaryConfigured = Boolean(
  CLOUDINARY_CLOUD_NAME &&
    CLOUDINARY_CLOUD_NAME.trim() !== '' &&
    CLOUDINARY_CLOUD_NAME !== 'your-cloud-name' &&
    CLOUDINARY_UPLOAD_PRESET &&
    CLOUDINARY_UPLOAD_PRESET.trim() !== '' &&
    CLOUDINARY_UPLOAD_PRESET !== 'your-upload-preset'
);

/**
 * 이미지 파일을 Cloudinary에 업로드하고 최적화된 secure_url을 반환합니다.
 * Cloudinary 미설정 또는 오류 시에는 로컬 Base64 DataURL로 폴백합니다.
 */
export const uploadImageFile = async (
  file: File,
  userId?: string
): Promise<string> => {
  // 이미지 파일 타입 검증
  if (!file.type.startsWith('image/')) {
    throw new Error('이미지 파일(JPG, PNG, WebP 등)만 업로드할 수 있습니다.');
  }

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
      formData.append('folder', userId ? `my-web/users/${userId}` : 'my-web/uploads');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message =
          errorData.error?.message || `Cloudinary 업로드 실패 (HTTP ${response.status})`;
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
