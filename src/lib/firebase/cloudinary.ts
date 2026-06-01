// src/lib/firebase/cloudinary.ts
"use client";

/**
 * Delete an image from Cloudinary by its secure URL.
 * This uses Cloudinary's signed "destroy" endpoint, which requires API key/secret.
 * The function extracts the public_id from the URL and sends a POST request.
 *
 * Required environment variables (must be defined on the server side, NOT public):
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 *   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME (public name is okay for URL construction)
 */
export async function deleteImageByUrl(imageUrl: string): Promise<void> {
  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      console.warn('Missing Cloudinary environment variables for image deletion');
      return;
    }

    // Extract the public_id from the URL. Example:
    // https://res.cloudinary.com/demo/image/upload/v1681234567/folder/myImage.jpg
    const match = imageUrl.match(/\/upload\/(?:v\d+\/)?([^\.]+)\.[a-zA-Z0-9]+$/);
    if (!match) {
      console.warn('Unable to parse Cloudinary public_id from URL:', imageUrl);
      return;
    }
    const publicId = match[1];

    const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`;
    const payload = new URLSearchParams({ public_id: publicId, invalidate: 'true' });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        // Basic auth using API key and secret
        Authorization: 'Basic ' + btoa(`${apiKey}:${apiSecret}`),
      },
      body: payload,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Cloudinary image deletion failed:', errText);
    }
  } catch (e) {
    console.error('Error in deleteImageByUrl:', e);
  }
}
