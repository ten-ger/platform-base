import { Component, h, Listen, State } from "@stencil/core";
import { Log } from "../../../services/log";
import { App } from "../../../services/app-state";
import { Account, Environment, User } from "../../../interfaces/application";
import { IndexedDbService } from "../../../services/indexed-db";
import { LoadingService } from "../../../services/loading";
import { ModalService } from "../../../services/modal";
import { AppApiService } from "../../../services/app-api";
import { ToastService } from "../../../services/toast";
import { AccountsService } from "../../../services/accounts";
import { EnvironmentsService } from "../../../services/environments";
import { RouterService } from "../../../services/router";

@Component({
  tag: 'login-and-account-selection'
})
export class LoginAndAccountSelection {

  @State() environments: Environment[] = [];
  @State() currentUser: User;
  @State() username: string;
  @State() password: string;
  @State() selectedEnvironmentId: string = 'prd';
  @State() selectedEnvironment: Environment;
  @State() showVerificationEntry: boolean;
  @State() verificationCode: string;
  // @State() cognitoUser: CognitoUser;
  @State() isLoggedIn: boolean;
  @State() accounts: Account[] = [];
  @State() selectedAccount: Account;
  @State() canContinue: boolean;

  async componentWillLoad() {
    try {
      await this.loadEnvironments();
      this.selectedAccount = App.getState("account");
      this.currentUser = App.getState("user");
      if (this.currentUser) {
        this.isLoggedIn = true;
        await this.loadAccounts();
      }
    }
    catch (error) {
      Log.error('Error loading company login and selection', error);
    }
  }

  async updateState() {
    if (!this.isLoggedIn) {
      this.canContinue = (this.selectedEnvironment?.id
        ? this.username?.length > 3 && this.password?.length > 3
        : false
      );
    }
    else {
      this.canContinue = !!this.selectedAccount?.id;
    }
  }

  async loadEnvironments() {
    try {
      this.environments = await EnvironmentsService.getEnvironments();
    }
    catch (error) {
      Log.error('Error loading environments', error);
    }
  }

  async loadAccounts() {
    try {
      let accounts = await IndexedDbService.getAll('accounts');
      if (!accounts || !accounts.length) {
        accounts = await AccountsService.getAccounts();
        await IndexedDbService.bulkPut('accounts', accounts);
      }
      this.accounts = accounts;
    }
    catch (error) {
      Log.error('Error loading accounts', error);
      await ToastService.showFailureToast({
        message: `Error getting accounts: ${error}`,
        duration: 3000
      });
    }
  }

  async submitCredentials() {
    try {
      await LoadingService.showLoading();
      const response = await AppApiService.login(this.username, this.password);
      Log.debug('Submit credentials response', response);
      // if (response.challengeName && response.challengeName.includes('MFA')) {
        // this.showVerificationEntry = true;
        // this.cognitoUser = response;
      // }
      // else {  // No MFA required
        // await AppApiService.storeSessionInfo();
        await this.loadAccounts();
        this.showVerificationEntry = false;
        this.isLoggedIn = true;
      // }
    }
    catch (error) {
      Log.error('Error logging in', error);
      await ToastService.showFailureToast({
        message: `Error logging in: ${error}`,
        duration: 3000
      });
    }
    finally {
      await LoadingService.dismiss();
    }
  }

  async submitVerification() {
    try {
      await LoadingService.showLoading();
      // await AppApiService.respondToAuthChallenge(this.cognitoUser, this.verificationCode);
      // await AppApiService.storeSessionInfo();
      await this.loadAccounts();
      this.showVerificationEntry = false;
      this.isLoggedIn = true;
    }
    catch (error) {
      Log.error('Error verifying login code', error);
      await ToastService.showFailureToast({
        message: 'Error verifying code - ' + error,
        duration: 10000,
      });
    }
    finally {
      await LoadingService.dismiss();
    }
  }

  async hRefreshAccountsClicked() {
    try {
      await LoadingService.showLoading();
      await IndexedDbService.clearTable("accounts");
      await this.loadAccounts();
    }
    catch (error) {
      Log.error('Error refreshing accounts', error);
    }
    finally {
      await LoadingService.dismiss();
    }
  }

  async hEnvironmentSelected(event: any) {
    this.selectedEnvironment = this.environments.find(e => e.id === event.detail.value);
    Log.debug('Selected environment', this.selectedEnvironment);
    await App.setState('environment', this.selectedEnvironment);
    // await App.setState('apiBaseUrl', `${this.selectedEnvironment.tenna_api_protocol}://${this.selectedEnvironment.tenna_api_domain}`);
    // AppApiService.configure(this.selectedEnvironment.client_id, this.selectedEnvironment.pool_id, this.selectedEnvironment.cognito_domain);
    await this.updateState();
  }

  async hAccountSelected(event: any) {
    try {
      await LoadingService.showLoading();
      this.selectedAccount = event.detail;

      await this.updateState();
    }
    catch (error) {
      Log.error('Error handling account selection', error);
    }
    finally {
      await LoadingService.dismiss();
    }
  }

  async hLogoutClicked() {
    try {
      await AppApiService.logout();
      this.isLoggedIn = false;
      await IndexedDbService.clearTable("accounts");
      await RouterService.setRoot('/');
    }
    catch (error) {
      Log.error('Error logging out', error);
    }
  }

  async hContinueClicked() {
    try {
      if (this.isLoggedIn && this.selectedAccount?.id) {
        // Finalizing account selection and closing modal
        // const imperstonateToken = await AppApiService.getImpersonateToken(this.selectedAccount.id);
        await App.setState('account', this.selectedAccount);
        // await App.setState('impersonateToken', imperstonateToken);
        await ModalService.dismiss();
        return;
      }
      else if (this.showVerificationEntry) {
        // Submitting MFA verification code
        await this.submitVerification();
      }
      else {
        // Clicking Coninue after entering username/password
        await this.submitCredentials();
      }
    }
    catch (error) {
      Log.error('Error', error);
      await ToastService.showFailureToast({
        message: `Error: ${error}`,
        duration: 3000
      });
    }
  }

  @Listen('keydown')
  async handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      if (this.canContinue) {
        await this.hContinueClicked();
      }
    }
  }

  renderSegment() {
    return [
      this.isLoggedIn && [
        <search-content
          id='searchContent'
          key='searchContent'
          idPropertyName="id"
          displayPropertyName="name"
          defaultValue={this.selectedAccount}
          showSelectedFirst
          defaultOptions={() => this.accounts}
          searchOptions={(t) => this.accounts.filter(a => a.name.toLowerCase().includes(t.toLowerCase()))}
          onValueChanged={e => this.hAccountSelected(e)}
        >
          <ion-button slot='searchbar-end' fill='clear' style={{ marginRight: '6px' }}
            onClick={() => this.hRefreshAccountsClicked()}>
            <ion-icon slot='icon-only' name='refresh-outline' />
          </ion-button>
        </search-content>
      ],
      this.showVerificationEntry && [
        <text-input
          id="verificationCode" key="verificationCode"
          labelText="Verification Code"
          onValueChanged={e => (this.verificationCode = e.detail.value)}
        />
      ],
      !this.isLoggedIn && !this.showVerificationEntry && [
        <single-select
          lines='full'
          labelText="Environment"
          placeholder='Select environment'
          options={this.environments}
          onValueChanged={(e) => this.hEnvironmentSelected(e)}
        />,
        <text-input
          labelText="Username"
          onValueChanged={(e) => { this.username = e.detail.value; this.updateState() }}
        />,
        <text-input
          labelText="Password"
          type="password"
          onValueChanged={(e) => { this.password = e.detail.value; this.updateState() }}
        />
      ]
    ]
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar>
          <ion-title>
            {this.isLoggedIn ? "Select Account" : "Log In"}
          </ion-title>
        </ion-toolbar>
      </ion-header>,
      <ion-content>
        {this.renderSegment()}
      </ion-content>,
      <ion-footer>
        <ion-toolbar>
          <div slot='start' style={{ marginLeft: '16px' }}>
            <ion-button fill='clear' onClick={() => this.hLogoutClicked()}>
              Logout
            </ion-button>
          </div>
          <div slot='end' style={{ marginRight: '16px' }}>
            <ion-button fill='clear' onClick={() => ModalService.dismiss()}>
              Cancel
            </ion-button>
            <ion-button disabled={!this.canContinue} onClick={() => this.hContinueClicked()}>
              Continue
            </ion-button>
          </div>
        </ion-toolbar>
      </ion-footer>
    ]
  }
}