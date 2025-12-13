declare module '@cycjimmy/jsmpeg-player' {
  interface JSMpegPlayerOptions {
    canvas: HTMLCanvasElement;
    audio?: boolean;
    videoBufferSize?: number;
    preserveDrawingBuffer?: boolean;
    onDestroy?: () => void;
    onPlay?: () => void;
  }

  interface WSSource {
    socket?: WebSocket;
  }

  class Player {
    constructor(url: string, options: JSMpegPlayerOptions);
    destroy(): void;
    source?: WSSource;
  }

  export default {
    Player: Player
  };
}