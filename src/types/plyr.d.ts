declare module "plyr" {
  export interface PlyrOptions {
    controls?: string[];
    fullscreen?: {
      enabled?: boolean;
      fallback?: boolean;
      iosNative?: boolean;
    };
    ratio?: string;
    storage?: { enabled?: boolean };
  }

  export default class Plyr {
    constructor(target: HTMLElement | string, options?: PlyrOptions);
    destroy(): void;
  }
}

declare module "plyr/dist/plyr.css";
