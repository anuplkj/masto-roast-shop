import { supabase } from "@/integrations/supabase/client";

const MAX_DIM = 1600;
const QUALITY = 0.85;

async function resizeImage(file: File, preserveTransparency = false): Promise<Blob> {
  if (file.type === "image/svg+xml") return file;
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = URL.createObjectURL(file);
  });
  let { width, height } = img;
  if (width > MAX_DIM || height > MAX_DIM) {
    const scale = Math.min(MAX_DIM / width, MAX_DIM / height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, width, height);
  URL.revokeObjectURL(img.src);
  const isPng = preserveTransparency || file.type === "image/png";
  const outType = isPng ? "image/png" : "image/jpeg";
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), outType, QUALITY)
  );
  return blob;
}

export async function uploadImage(
  bucket: "product-images" | "gallery" | "branding",
  file: File,
  pathPrefix = ""
): Promise<string> {
  // Preserve transparency for branding assets (logos)
  const preserveTransparency = bucket === "branding" && file.type === "image/png";
  const blob = await resizeImage(file, preserveTransparency);
  const ext =
    blob.type === "image/svg+xml" ? "svg" : blob.type === "image/png" ? "png" : "jpg";
  const path = `${pathPrefix}${pathPrefix ? "/" : ""}${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, blob, {
    cacheControl: "3600",
    contentType: blob.type || "image/jpeg",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export function pathFromPublicUrl(url: string, bucket: string): string | null {
  const marker = `/${bucket}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

export async function deleteImage(bucket: "product-images" | "gallery" | "branding", url: string) {
  const path = pathFromPublicUrl(url, bucket);
  if (!path) return;
  await supabase.storage.from(bucket).remove([path]);
}
