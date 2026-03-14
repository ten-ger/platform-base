import { Component, h, Listen, State } from '@stencil/core';
import { Log } from '../../services/log';
import { LocalStorageService } from '../../services/local-storage';
import { App } from '../../services/app-state';
import { IndexedDbService } from '../../services/indexed-db';
import { ToastService } from '../../services/toast';
import { UserPreferencesService } from '../../services/user-preferences';
import { MenuService } from '../../services/menu';
import { RouterService } from '../../services/router';
import { appVersion } from '../../version';
import { Account, User } from '../../interfaces/application';
import { FirebaseAppService } from '../../services/firebase-app';
import { FirestoreBaseService } from '../../services/firestore';

@Component({
  tag: 'app-root'
})
export class AppRoot {

  @State() darkThemeEnabled: boolean;
  @State() viewportSize: string;
  @State() isSplitPaneWide: boolean = true;
  @State() currentUser: User | null = null;
  @State() selectedAccount: Account | null = null;

  menuElem: HTMLIonMenuElement;

  menuRoutes = [
    { title: "Home", icon: "home-outline", url: "/", component: "app-home" },
  ]
  appManifest: any;
  appConfigSettings: any;

  async componentWillLoad() {
    await this.loadAppManifest();
    await this.loadAppConfigSettings();
    await LocalStorageService.setLocalStoragePrefix(`${this.appConfigSettings.applicationSlug}-`);
    await App.initialize(); // must come after setting local storage prefix
    await FirebaseAppService.initialize();
    await FirestoreBaseService.initialize();
    await UserPreferencesService.initialize();
    await Log.setLogLevel(this.appConfigSettings.logLevel || "debug");
    await this.initializeDatabase();
    App.bindAppState(this, 'viewportSize', (value) => { this.viewportSize = value; });
    // Detect user's system setting for preferred theme
    this.darkThemeEnabled = window.matchMedia("(prefers-color-scheme: dark)").matches;
    this.isSplitPaneWide = App.getState('isSplitPaneWide');

    this.currentUser = App.getState('user');
  }

  async componentDidLoad() {
    await App.registerEventHandlers();
    await App.setState('darkThemeEnabled', this.darkThemeEnabled);
    let vpWidth = document.body.clientWidth;
    await App.setViewportSize(vpWidth);
  }

  @Listen('userChanged', { target: 'document' })
  async hUserChanged(event: any) {
    Log.debug('User changed', event);
    if (event?.detail?.id) {
      this.currentUser = event.detail;
    }
    else {
      this.currentUser = null;
    }
    setTimeout(() => { RouterService.setRoot('/') }, 100);
  }

  private get isLargeView(): boolean {
    return ['lg', 'xl'].includes(this.viewportSize);
  }

  async loadAppManifest() {
    const appManifestFile = await fetch('/manifest.json');
    this.appManifest = await appManifestFile.json();
  }

  async loadAppConfigSettings() {
    const appConfigFile = await fetch('/app-config.json');
    this.appConfigSettings = await appConfigFile.json();
  }

  async initializeDatabase() {
    const databaseName = this.appConfigSettings.applicationSlug || 'app-db';
    const dbSchema = {
      accounts: 'id, name',
    }

    try {
      await IndexedDbService.openDatabase(databaseName, dbSchema);
    }
    catch (error) {
      // Attempt to recover from database schema breaking changes...
      try {
        IndexedDbService.closeDatabase();
        Log.debug(`Attempting to recover from database schema change...`);
        await IndexedDbService.deleteDatabase(databaseName);
        Log.debug(`Database dropped.`);
        await IndexedDbService.openDatabase(databaseName, dbSchema);
        Log.debug(`Database reopened.`)
      }
      catch (err) {
        Log.error('Error initializing local database.', error);
        await ToastService.showFailureToast({
          message: `Error initializing local database: ${error}`,
          duration: 10000
        });
      }
    }
  }

  configureRoutes() {
    return [
      <ion-router useHash={false} >
        <ion-route-redirect from='/' to={this.currentUser ? '/home' : '/login'} />
        <ion-route url='/login' component='user-login' />
        <ion-route url='/home' component='app-home' />
      </ion-router>
    ]
  }

  async hResizeLeftNav() {
    this.isSplitPaneWide = !this.isSplitPaneWide;
    await App.setState('isSplitPaneWide', this.isSplitPaneWide);
  }

  render() {
    return (
      <ion-app>
        {this.configureRoutes()}
        <ion-split-pane
          when={!!this.currentUser ? 'lg' : false}
          contentId='main'
          style={{
            '--side-max-width': this.isSplitPaneWide ? '250px' : '50px',
            '--side-min-width': this.isSplitPaneWide ? '250px' : '50px'
          }}
        >
          {!!this.currentUser &&
            <ion-menu contentId='main' ref={(el) => this.menuElem = el}>
              <ion-header>
                {this.isLargeView &&
                  <ion-toolbar>
                    {this.isSplitPaneWide ?
                      <div class='text-xl text-medium px-4'
                        onClick={() => RouterService.setRoot('/')}>
                        {this.appManifest.name}
                      </div>
                      :
                      <img src="/assets/icon/icon.png" alt="icon" height={30} class='pl-2' />
                    }
                  </ion-toolbar>
                }
                {!this.isLargeView &&
                  <ion-toolbar>
                    <div class='text-xl text-medium px-4'
                      onClick={() => RouterService.setRoot('/')}>
                      {this.appManifest.name}
                    </div>
                  </ion-toolbar>
                }
              </ion-header>
              <ion-content >
                {/* Buttons menu */}
                {(this.isLargeView && !this.isSplitPaneWide) &&
                  this.menuRoutes.map(menuRoute =>
                    <ion-button color='medium' href={`/${menuRoute.url ? menuRoute.url : menuRoute.component}`} title={menuRoute.title}>
                      {!!menuRoute.icon &&
                        <ion-icon slot='icon-only' name={menuRoute.icon} />
                      }
                    </ion-button>
                  )
                }
                {/* Full menu */}
                {(!this.isLargeView || this.isSplitPaneWide) &&
                  this.menuRoutes.map(menuRoute =>
                    <ion-item href={`/${menuRoute.url ? menuRoute.url : menuRoute.component}`}>
                      {!!menuRoute.icon &&
                        <ion-icon slot='start' name={menuRoute.icon} />
                      }
                      {menuRoute.title}
                    </ion-item>
                  )
                }
              </ion-content>
              <ion-footer>
                <ion-toolbar>
                  {this.isLargeView &&
                    <ion-buttons slot='start'>
                      <ion-button slot='start' color='medium' fill='clear' title={`v${appVersion.full}`}
                        onClick={() => this.hResizeLeftNav()}>
                        <ion-icon slot='icon-only' name={this.isSplitPaneWide ? 'chevron-back' : 'chevron-forward'} />
                      </ion-button>
                    </ion-buttons>
                  }
                  {(!this.isLargeView || this.isSplitPaneWide) &&
                    <div slot='end' class='px-4 text-medium' >
                      v{appVersion.full}
                    </div>
                  }
                </ion-toolbar>
              </ion-footer>
            </ion-menu>
          }
          <ion-router-outlet id='main' animated={false} />
        </ion-split-pane>
        {!!this.currentUser &&
          <ion-menu
            contentId='main' menuId='rightMenu' id='rightMenu' swipeGesture={false}
            side='end' onIonDidClose={() => MenuService.dismiss()} />
        }

      </ion-app>
    )
  }
}
