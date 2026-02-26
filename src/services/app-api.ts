import { User } from "../interfaces/application";
import { App } from "./app-state";
import { HttpController } from "./http";
import { Log } from "./log";

export class AppApiController extends HttpController {

  //TODO: Add application-specific functions for HTTP calls
  
  async login(_username: string, _password: string) {
    Log.debug("Not actually logging in...");

    const user = {
      id: 'user1',
      name: 'User One'
    } as User;
    await App.setState('user', user);
    return user;
  }

  async logout() {
    await App.setState('user', null);
  }
}

export const AppApiService = new AppApiController();