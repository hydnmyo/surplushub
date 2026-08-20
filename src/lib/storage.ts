import { supabase } from './supabase';

const BUCKET_NAME = 'listings_images';

/**
 * Uploads an image file to the `listings_images` bucket
 * and returns its public URL.
 */
export async function uploadListingImage(
  file: File,
  pathPrefix = 'public'
): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${pathPrefix}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading image:', uploadError.message);
      return null;
    }

    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Unexpected storage error:', error);
    return null;
  }
}

/**
 * Deletes an image from the `listings_images` bucket given its full public URL.
 */
export async function deleteListingImage(publicUrl: string): Promise<boolean> {
  try {
    const urlParts = publicUrl.split(`${BUCKET_NAME}/`);
    const filePath = urlParts[1];

    // Safely check if filePath exists to satisfy TypeScript strict null checks
    if (!filePath) {
      console.error('Invalid public URL format for deletion');
      return false;
    }

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting image:', error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected storage delete error:', error);
    return false;
  }
}