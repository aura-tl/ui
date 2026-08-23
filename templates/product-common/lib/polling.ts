export type PollingPlatform = {
  visible: () => boolean;
  listen: (listener: () => void) => void;
  unlisten: (listener: () => void) => void;
  schedule: (
    callback: () => void,
    delay: number,
  ) => ReturnType<typeof setTimeout>;
  cancel: (timer: ReturnType<typeof setTimeout>) => void;
};

const browserPlatform: PollingPlatform = {
  visible: () => document.visibilityState === "visible",
  listen: (listener) => document.addEventListener("visibilitychange", listener),
  unlisten: (listener) =>
    document.removeEventListener("visibilitychange", listener),
  schedule: (callback, delay) => setTimeout(callback, delay),
  cancel: (timer) => clearTimeout(timer),
};

export function pollWhileVisible(
  load: (signal: AbortSignal) => Promise<void>,
  delay: number,
  platform: PollingPlatform = browserPlatform,
) {
  let active = true;
  let generation = 0;
  let request: AbortController | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const clear = () => {
    generation += 1;
    request?.abort();
    request = null;
    if (timer) platform.cancel(timer);
    timer = null;
  };

  const run = async () => {
    clear();
    if (!active || !platform.visible()) return;
    const current = generation;
    const controller = new AbortController();
    request = controller;
    try {
      await load(controller.signal);
    } finally {
      if (
        active &&
        current === generation &&
        !controller.signal.aborted &&
        platform.visible()
      ) {
        timer = platform.schedule(run, delay);
      }
    }
  };

  const onVisibility = () => {
    clear();
    if (platform.visible()) run();
  };

  platform.listen(onVisibility);
  run();
  return () => {
    active = false;
    clear();
    platform.unlisten(onVisibility);
  };
}
