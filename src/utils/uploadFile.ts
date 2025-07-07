import { supabase, STORAGE_BUCKET } from '@lib/supabase';

export interface UploadResult {
  downloadURL: string;
  fileName: string;
  fileSize: number;
}

export const uploadFile = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadResult> => {
  try {
    // Generate a unique filename with timestamp
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}_${randomId}.${fileExtension}`;
    const filePath = `uploads/${fileName}`;
    
    if (onProgress) {
      onProgress(0);
    }
    
    // Upload the file to Supabase Storage
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
    
    if (onProgress) {
      onProgress(50);
    }
    
    // Get the public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);
    
    if (!urlData.publicUrl) {
      throw new Error('Failed to get download URL');
    }
    
    if (onProgress) {
      onProgress(100);
    }
    
    return {
      downloadURL: urlData.publicUrl,
      fileName: file.name,
      fileSize: file.size
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    if (error instanceof Error) {
      throw new Error(`Upload failed: ${error.message}`);
    } else {
      throw new Error('Failed to upload file. Please try again.');
    }
  }
}; 