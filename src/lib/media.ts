/** Product media lives in one list (`images`): photos and videos, told apart by file type. */
export function isVideo(url: string) {
  return /\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/i.test(url);
}

/** Photos only (cards, thumbnails in lists, the cropper). */
export function photosOf(media: string[] | undefined) {
  return (media ?? []).filter((m) => !isVideo(m));
}

/** Largest video the dashboard accepts (Supabase's default per-file limit is 50 MB). */
export const MAX_VIDEO_MB = 50;
