import { attachVideo, currentOffset, resumePosition, seekTo } from '.';

// Focus on gaps not covered by playback.test.js: route identity and rapid seeks.
const makeVideo = () => ({ currentTime: 0, readyState: HTMLMediaElement.HAVE_NOTHING });
const routeA = { start: 10000, end: 80000 };
const routeB = { start: 3000, end: 180000 };

afterEach(() => attachVideo(null));

describe('route-scoped playback clock', () => {
  it('drops a pending seek when the route changes but the same element is reused', () => {
    const video = makeVideo();
    attachVideo(video, 0, routeA, 'route-A');
    seekTo(48000);
    expect(currentOffset()).toBe(48000);

    attachVideo(video, 3000, routeB, 'route-B');
    expect(currentOffset()).toBe(3000);
    video.readyState = HTMLMediaElement.HAVE_METADATA;
    resumePosition();
    expect(video.currentTime).toBe(0);
  });

  it('preserves pending seek through same-route rerenders', () => {
    const video = makeVideo();
    attachVideo(video, 0, routeA, 'route-A');
    seekTo(27000);
    attachVideo(video, 0, { ...routeA }, 'route-A');
    video.readyState = HTMLMediaElement.HAVE_METADATA;
    resumePosition();
    expect(video.currentTime).toBe(27);
  });

  it('applies the most recent seek made before metadata arrives', () => {
    const video = makeVideo();
    attachVideo(video, 1000, routeA, 'route-A');
    seekTo(15000);
    seekTo(26000);
    seekTo(37000);
    video.readyState = HTMLMediaElement.HAVE_METADATA;
    resumePosition();
    expect(video.currentTime).toBe(36);
  });
});
