import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './config';
import { compressImage } from '../utils/imageCompressor';

/**
 * Uploads a product photo using a quota-safe, cost-free approach:
 * 1. Resizes and compresses the image client-side to ~15-30KB (600px max, 0.75 WebP/JPEG).
 * 2. If Firebase Storage is accessible and online, uploads to user's isolated folder and returns download URL.
 * 3. If Firebase Storage is disabled, offline, or unavailable, seamlessly falls back to the compressed data URL.
 * 4. Never fails or blocks the user, and never requires a paid plan.
 */
export async function uploadProductImage(
  userId: string,
  file: File
): Promise<string> {
  // Always compress client-side first to minimize data footprint
  const compressedDataUrl = await compressImage(file, 600, 0.75);

  // If storage is available and browser is online, attempt cloud storage upload
  if (storage && navigator.onLine) {
    try {
      // Convert data URL to Blob
      const response = await fetch(compressedDataUrl);
      const blob = await response.blob();

      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `users/${userId}/items/${timestamp}_${sanitizedName}`;
      const fileRef = ref(storage, storagePath);

      await uploadBytes(fileRef, blob, {
        contentType: blob.type || 'image/webp',
        customMetadata: {
          uploadedBy: userId,
          originalName: file.name,
        },
      });

      const downloadUrl = await getDownloadURL(fileRef);
      return downloadUrl;
    } catch (storageError) {
      console.warn(
        'Firebase Storage upload unavailable or denied, utilizing lightweight compressed image locally:',
        storageError
      );
      // Fallback to compressed image data URL - zero data loss, works 100% offline and free
      return compressedDataUrl;
    }
  }

  // If offline or storage not enabled, return compressed data URL
  return compressedDataUrl;
}
