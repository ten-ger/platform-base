import { Component, h, Element, Listen, State } from "@stencil/core";
import { Account, User } from "../../../interfaces/application";
import { RouterService } from "../../../services/router";
import { App } from "../../../services/app-state";
import { MenuService } from "../../../services/menu";
import { ResizeObserverService } from "../../../services/resize-observer";

@Component({
  tag: 'main-menu',
  styleUrl: 'main-menu.css'
})
export class MainMenu {

  @Element() el: HTMLElement;

  @State() width: number = window.innerWidth;
  @State() isSplitPaneWide: boolean = true;
  @State() currentUser: User | null = null;
  @State() currentAccount: Account | null = null;
  @State() selectedMenuTitle: string;
  @State() menuRoutes: any[] = [];

  menuOptions = [
    { title: "Home", icon: "home", url: "/", component: "app-home" },
  ]

  async componentWillLoad() {
    await this.determineSelectedMenuItem();
    this.loadMenuItems();
  }

  async componentDidLoad() {
    ResizeObserverService.observe(this.el, (e) => this.width = e.contentRect.width);
    App.bindState(this, 'isSplitPaneWide', (value) => {
      this.isSplitPaneWide = value;
    });
  }

  disconnectedCallback() {
    ResizeObserverService.unobserve(this.el);
    App.unbindState(this, ['isSplitPaneWide']);
  }

  private get isNarrow(): boolean {
    return this.width < 992;
  }

  async loadMenuItems() {
    this.menuRoutes = [...this.menuOptions];
  }

  @Listen('ionRouteDidChange', { target: 'document' })
  async determineSelectedMenuItem() {
    let menuFound = false;
    for (let menu of [...this.menuOptions]) {
      if (window.location.pathname.includes(menu.url)) {
        this.selectedMenuTitle = menu.title;
        menuFound = true;
        break;
      }
    }
    if (!menuFound) {
      this.selectedMenuTitle = '';
    }
  }

  async hMenuClicked(menuRoute: any) {
    this.selectedMenuTitle = menuRoute.title;
    if (this.isNarrow) {
      await MenuService.close();
    }
    await RouterService.forwardTo(`/${menuRoute.url ? menuRoute.url : menuRoute.component}`);
  }

  renderButtonItem(menuRoute: any) {
    return (
      <ion-button class={menuRoute.title == this.selectedMenuTitle ? "flex-1 menu-item-selected" : "flex-1 bg-menu"}
        color='medium' onClick={() => this.hMenuClicked(menuRoute)} title={menuRoute.title}>
        {!!menuRoute.icon &&
          <material-icon slot='icon-only' iconName={menuRoute.icon} color="var(--ion-color-light)" />
        }
      </ion-button>
    );
  }

  renderListItem(menuRoute: any) {
    return (
      <div class='flex row'>
        {menuRoute.title == this.selectedMenuTitle &&
          <div class="menu-selection-indicator" />
        }
        <ion-item class={menuRoute.title == this.selectedMenuTitle ? "flex-1 menu-item-selected" : "flex-1 bg-menu"}
          lines='full' onClick={() => this.hMenuClicked(menuRoute)}>
          {!!menuRoute.icon &&
            <material-icon slot='start' iconName={menuRoute.icon} />
          }
          {menuRoute.title}
        </ion-item>
      </div>
    );
  }

  render() {
    const buttonsView = !this.isNarrow && !this.isSplitPaneWide;
    return (
      buttonsView
        ? <div class='flex col items-center h-full pt-2'>
            <div class='flex col items-center flex-1'>
              {this.menuRoutes.map(menuRoute => this.renderButtonItem(menuRoute))}
            </div>
          </div>
        : <div class='flex col h-full'>
            <div class='flex-1'>
              {this.menuRoutes.map(menuRoute => this.renderListItem(menuRoute))}
            </div>
          </div>
    );
  }
}