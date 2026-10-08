// Playback controls. Commands go straight to the <video> element; redux only
// mirrors what the element reports back, so the UI always shows what is
// actually playing.
import * as Types from '../actions/types';
import { getPlaybackEpoch, getVideo, seekTo } from '.';

export function reducer(state, action) {
  if (action.type === Types.ACTION_PLAYBACK_STATE) {
    return {
      ...state,
      isPaused: action.isPaused,
      playSpeed: action.playSpeed,
    };
  }
  return state;
}

// dispatched by DriveVideo from the element's play, pause and ratechange events
export function playbackChanged(video) {
  return {
    type: Types.ACTION_PLAYBACK_STATE,
    isPaused: video.paused,
    playSpeed: video.playbackRate,
  };
}

export function seek(offset) {
  return (dispatch) => {
    seekTo(offset);
    dispatch({ type: Types.ACTION_SEEK, offset }); // analytics only
  };
}

// resume, optionally at a new speed
export function play(speed) {
  return (dispatch) => {
    const video = getVideo();
    if (!video) {
      return;
    }
    if (speed) {
      video.playbackRate = speed;
    }
    // A refused play() leaves the element paused. Only resync if the same
    // video AND the same media source are still active.
    const epoch = getPlaybackEpoch();
    video.play()?.catch(() => {
      if (getVideo() === video && getPlaybackEpoch() === epoch) {
        dispatch(playbackChanged(video));
      }
    });
  };
}

export function pause() {
  return () => getVideo()?.pause();
}
