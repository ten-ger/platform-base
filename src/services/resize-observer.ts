type ResizeHandler = (entry: ResizeObserverEntry) => void;

class ResizeObserverController {

  private observer: ResizeObserver;
  private handlers = new Map<Element, ResizeHandler>();

  constructor() {
    this.observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        this.handlers.get(entry.target)?.(entry);
      }
    });
  }

  observe(el: Element, handler: ResizeHandler): void {
    this.handlers.set(el, handler);
    this.observer.observe(el);
  }

  unobserve(el: Element): void {
    this.handlers.delete(el);
    this.observer.unobserve(el);
  }
}

export const ResizeObserverService = new ResizeObserverController();
