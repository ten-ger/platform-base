# App Standards

## Responsive Layout & Device Adaptation

Every component is expected to adapt its layout and behaviour based on two independent signals:

| Signal | App State Key | Type | Source |
|---|---|---|---|
| Viewport size | `viewportSize` | `ViewportSize` | `window.matchMedia` on width breakpoints |
| Primary input device | `deviceInputType` | `DeviceInputType` | `window.matchMedia("(hover: hover) and (pointer: fine)")` |

Both signals are initialised in `app-root` and re-emitted whenever they change, so components only need to bind to app state — they never query the DOM or `window` directly.

---

## Viewport Breakpoints

Breakpoints are defined in `src/services/app-state.ts`.

| Key | Width range | Typical context |
|---|---|---|
| `xs` | 1 – 319 px | Very small phones / embedded views |
| `sm` | 320 – 511 px | Phones (portrait) |
| `md` | 512 – 991 px | Phones (landscape), tablets (portrait) |
| `lg` | 992 – 1199 px | Tablets (landscape), small desktops |
| `xl` | 1200 px + | Full desktops / wide monitors |

Helper already in `app-root`: `isLargeView` → `['lg', 'xl'].includes(viewportSize)`.

---

## Device Input Types

Defined in `src/interfaces/type.ts` as `DeviceInputType = 'touch' | 'mouse'`.

| Value | Detection condition | Typical devices |
|---|---|---|
| `mouse` | `(hover: hover) and (pointer: fine)` matches | Desktop, laptop, Chromebook with trackpad |
| `touch` | anything else | Phones, tablets, touch-only devices |

> **Why this matters:** Interaction patterns that rely on hover (e.g. revealing action buttons when the cursor enters a list row) are invisible on touch devices. Components must not rely on hover as the *only* way to expose functionality when `deviceInputType === 'touch'`.

Note: some devices (e.g. detachable tablets, hybrid laptops) can switch input type at runtime. The `deviceInputTypeChanged` event fires when this happens and bound component state will update automatically.

---

## Component Binding Pattern

Components that need to respond to either signal bind to app state in `componentWillLoad` and clean up in `disconnectedCallback`:

```tsx
@State() viewportSize: ViewportSize;
@State() deviceInputType: DeviceInputType;

componentWillLoad() {
  App.bindAppState(this, 'viewportSize', (v) => { this.viewportSize = v; });
  App.bindAppState(this, 'deviceInputType', (v) => { this.deviceInputType = v; });
}

disconnectedCallback() {
  App.unbindAppState(this, ['viewportSize', 'deviceInputType']);
}
```

Derive boolean helpers from these state values rather than embedding raw comparisons throughout the render method:

```tsx
private get isTouchDevice(): boolean {
  return this.deviceInputType === 'touch';
}

private get isCompact(): boolean {
  return ['xs', 'sm'].includes(this.viewportSize);
}
```

---

## Adaptation Rules

### Layout

- Use `viewportSize` to decide column count, stack vs. side-by-side orientation, and whether to collapse sections behind toggles.
- Prefer CSS flex/grid over conditional rendering for pure layout shifts — only conditionally render elements when the semantic content itself changes (e.g. a detail pane that only makes sense on wide screens).

### Interaction affordances

- **Hover-revealed controls** (edit/delete buttons that appear on mouse-over) must also be persistently visible, or reachable via a tap-opened menu, when `deviceInputType === 'touch'`.
- **Long-press** patterns are acceptable as a secondary gesture on touch but must never be the *only* way to reach a feature.
- **Tooltips** triggered by hover should be omitted or replaced with inline labels when `deviceInputType === 'touch'`.

### Combined decisions

When both signals are needed together, create a single helper that combines them:

```tsx
// Show always-visible action column on touch; show it only on hover via CSS on mouse.
private get showInlineActions(): boolean {
  return this.isTouchDevice || this.isCompact;
}
```

---

## CSS Conventions

- Global flex/structural styles live in `src/global/app.css` (not in shadow-DOM component styles) so they apply app-wide.
- Use Ionic's built-in responsive utilities (`ion-col` with `size-*` props, `hide-*` breakpoint classes) before reaching for custom CSS.
- Avoid media queries inside individual component `.css` files; prefer using `viewportSize` and `deviceInputType` state to drive conditional class names or inline style changes, keeping all breakpoint logic in one place.
