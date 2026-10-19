// Optional photo uploads through Cloudinary (free tier is enough to start).
// Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET (an *unsigned* preset)
// to enable. Without them, barbers can still paste photo links.
const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const isUploadConfigured = Boolean(CLOUD && PRESET);

export const MAX_PHOTO_MB = 5;

export async function uploadImage(file) {
  if (!isUploadConfigured) throw new Error("Photo upload is not set up yet. Paste a photo link instead.");
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  if (file.size > MAX_PHOTO_MB * 1024 * 1024) throw new Error(`Photos must be under ${MAX_PHOTO_MB} MB.`);

  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", PRESET);
  body.append("folder", "techbarberqueen/barbers");

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, { method: "POST", body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.secure_url) throw new Error(data?.error?.message || "Upload failed. Please try again.");
  return data.secure_url;
}
