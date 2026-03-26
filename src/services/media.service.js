/**
 * Media Devices - Microfono e camera
 * Richiesta permessi, getUserMedia, cleanup
 */
export const MEDIA_ERROR = {
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  NOT_FOUND: 'NOT_FOUND',
  NOT_SUPPORTED: 'NOT_SUPPORTED',
  UNKNOWN: 'UNKNOWN',
};

export function isMediaSupported() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

export function requestMedia(audio = true, video = false) {
  if (!isMediaSupported()) {
    return Promise.reject({ code: MEDIA_ERROR.NOT_SUPPORTED, message: 'Media non supportato' });
  }
  return navigator.mediaDevices
    .getUserMedia({ audio, video: video ? { facingMode: 'user' } : false })
    .catch((err) => {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        return Promise.reject({ code: MEDIA_ERROR.PERMISSION_DENIED, message: 'Permesso microfono/camera negato' });
      }
      if (err.name === 'NotFoundError') {
        return Promise.reject({ code: MEDIA_ERROR.NOT_FOUND, message: 'Dispositivo non trovato' });
      }
      return Promise.reject({ code: MEDIA_ERROR.UNKNOWN, message: err.message || 'Errore media' });
    });
}

export function stopStream(stream) {
  if (!stream) return;
  stream.getTracks().forEach((track) => {
    track.stop();
  });
}
