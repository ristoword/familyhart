/**
 * CallOverlay - Interfaccia chiamata WebRTC
 * Chiamate audio/video reali con accept/decline
 */

import { useEffect, useRef } from 'react';
import { useApp } from '../store/AppContext';
import { CALL_STATE, CALL_TYPE, PARTICIPANT_STATE } from '../data/constants';
import './CallOverlay.css';

const STATE_LABELS = {
  [CALL_STATE.DIALING]: 'Chiamata in corso...',
  [CALL_STATE.RINGING]: 'Sta squillando...',
  [CALL_STATE.INCOMING]: 'Chiamata in arrivo',
  [CALL_STATE.CONNECTING]: 'Collegamento...',
  [CALL_STATE.CONNECTED]: 'Collegato',
  [CALL_STATE.ENDED]: 'Terminata',
  [CALL_STATE.FAILED]: 'Connessione fallita',
  [CALL_STATE.DECLINED]: 'Rifiutata',
  [CALL_STATE.UNAVAILABLE]: 'Non disponibile',
  [CALL_STATE.PERMISSION_DENIED]: 'Permesso negato',
};

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function ParticipantStateLabel(state) {
  const map = {
    [PARTICIPANT_STATE.ONLINE]: 'Online',
    [PARTICIPANT_STATE.UNAVAILABLE]: 'Non disponibile',
    [PARTICIPANT_STATE.IN_CALL]: 'In chiamata',
  };
  return map[state] || state;
}

export default function CallOverlay() {
  const {
    activeCall,
    family,
    endCall,
    acceptCall,
    declineCall,
    toggleCallMute,
    toggleCallSpeaker,
    toggleCallVideo,
    localStream,
    remoteStream,
  } = useApp();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const isIncoming = activeCall?.direction === 'incoming';
  const targetMember = activeCall?.targetId && !activeCall?.isGroup
    ? family.members?.find((m) => m.id === activeCall.targetId)
    : null;
  const displayName = isIncoming ? activeCall.callerName : activeCall.targetName;
  const displayAvatar = targetMember?.avatar || displayName?.charAt(0) || '?';

  if (!activeCall) return null;

  const isVideo = activeCall.type === CALL_TYPE.VIDEO;
  const isConnected = activeCall.state === CALL_STATE.CONNECTED;
  const isIncomingState = activeCall.state === CALL_STATE.INCOMING;
  const showAcceptDecline = isIncomingState;
  const showDismiss = [CALL_STATE.FAILED, CALL_STATE.UNAVAILABLE, CALL_STATE.PERMISSION_DENIED, CALL_STATE.DECLINED].includes(activeCall.state);

  return (
    <div className="call-overlay">
      <div className="call-content">
        <div className="call-header">
          <span className="call-type-badge">{isVideo ? '📹 Videochiamata' : '📞 Chiamata'}</span>
          <span className="call-state-label">{STATE_LABELS[activeCall.state] || activeCall.state}</span>
        </div>

        {isVideo && (localStream || remoteStream) ? (
          <div className="call-video-area">
            <div className="call-video-remote">
              {remoteStream ? (
                <video ref={remoteVideoRef} autoPlay playsInline muted={false} />
              ) : (
                <div className="call-avatar large">{displayAvatar}</div>
              )}
            </div>
            {localStream && (
              <div className="call-video-local">
                <video ref={localVideoRef} autoPlay playsInline muted />
              </div>
            )}
          </div>
        ) : (
        <div className="call-avatar-area">
          {activeCall.isGroup ? (
            <div className="call-avatar-group">
              {activeCall.participants?.slice(0, 4).map((p) => (
                <div key={p.id} className="call-avatar-participant">
                  <span className="call-avatar">{p.avatar}</span>
                  <span className="call-participant-name">{p.name}</span>
                  <span className="call-participant-state">{ParticipantStateLabel(p.state)}</span>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="call-avatar large">{displayAvatar}</div>
              <h2 className="call-target-name">{displayName}</h2>
            </>
          )}
        </div>
        )}

        {showDismiss ? (
          <button type="button" className="call-end-btn" onClick={endCall} title="Chiudi">
            ✕
          </button>
        ) : showAcceptDecline ? (
          <div className="call-incoming-actions">
            <button type="button" className="call-accept-btn" onClick={acceptCall} title="Accetta">
              📞
            </button>
            <button type="button" className="call-decline-btn" onClick={declineCall} title="Rifiuta">
              ✕
            </button>
          </div>
        ) : (
          <>
            {isConnected && (
              <div className="call-timer">{formatDuration(activeCall.duration || 0)}</div>
            )}
            <div className="call-controls">
              <button
                type="button"
                className={`call-control-btn ${activeCall.muted ? 'active' : ''}`}
                onClick={toggleCallMute}
                title={activeCall.muted ? 'Attiva microfono' : 'Disattiva microfono'}
              >
                <span className="call-control-icon">{activeCall.muted ? '🔇' : '🎤'}</span>
                <span className="call-control-label">Mute</span>
              </button>
              <button
                type="button"
                className={`call-control-btn ${activeCall.speaker ? 'active' : ''}`}
                onClick={toggleCallSpeaker}
                title={activeCall.speaker ? 'Speaker off' : 'Speaker on'}
              >
                <span className="call-control-icon">🔊</span>
                <span className="call-control-label">Speaker</span>
              </button>
              {isVideo && (
                <button
                  type="button"
                  className={`call-control-btn ${activeCall.videoOn ? 'active' : ''}`}
                  onClick={toggleCallVideo}
                  title={activeCall.videoOn ? 'Video off' : 'Video on'}
                >
                  <span className="call-control-icon">{activeCall.videoOn ? '📹' : '📷'}</span>
                  <span className="call-control-label">Video</span>
                </button>
              )}
            </div>
            <button
          type="button"
          className="call-end-btn"
          onClick={endCall}
          title="Termina chiamata"
        >
          📞
        </button>
          </>
        )}
      </div>
    </div>
  );
}
