import { formatDateTime } from "../utils/helpers";

class LogController {

  logLevel: 'debug' | 'info' | 'error';
  messageRoll: string[] = [];

  async setLogLevel(level: 'debug' | 'info' | 'error') {
    this.logLevel = level;
  }

  async addMessageToRoll(message) {

    let dateTimestamp = formatDateTime(Date.now());

    this.messageRoll.unshift(`${dateTimestamp}: ${message}`);

    if (this.messageRoll.length > 30) {

      this.messageRoll.pop();
    }
  }

  async getRecentMessages() {

    return this.messageRoll;
  }

  stringifyData(data: any) {

    try {

      //TODO: Move this to util function
      let stringConstructor = "test".constructor;
      let arrayConstructor = [].constructor;
      let objectConstructor = ({}).constructor;

      if (data === null) {
        return "null";
      }
      if (data === undefined) {
        return "undefined";
      }
      if (data.constructor === stringConstructor) {
        return data.toString();
      }
      if (data.constructor === arrayConstructor) {
        return JSON.stringify(data);
      }
      if (data.constructor === objectConstructor) {
        return JSON.stringify(data);
      }
    } catch (error) {}

    return '';
  }

  debug(message: string, data?: any) {

    if (!['debug'].includes(this.logLevel)) { return }

    if (data) {

      console.log(`%c${message}`, 'color: lightblue; font-size: 1.2em', data);
      this.addMessageToRoll(`${message} - ${this.stringifyData(data)}`);
    }
    else {
      
      console.log(`%c${message}`, 'color: lightblue; font-size: 1.2em');
      this.addMessageToRoll(`${message}`);
    }
  }

  info(message: string, data?: any) {
    
    if (!['debug', 'info'].includes(this.logLevel)) { return }

    if (data) {

      console.log(`%c${message}`, 'color: lightblue; font-style: italic', data);
      this.addMessageToRoll(`${message} - ${this.stringifyData(data)}`);
    }
    else {

      console.log(`%c${message}`, 'color: lightblue; font-style: italic');
      this.addMessageToRoll(`${message}`);
    }
  }

  error(message: string, data?: any) {
    
    if (!['debug', 'info', 'error'].includes(this.logLevel)) { return }

    if (data) {

      console.log(`%c${message}`, 'color: red; font-weight: bold', data);
      this.addMessageToRoll(`${message} - ${this.stringifyData(data)}`);
    }
    else {

      console.log(`%c${message}`, 'color: red; font-weight: bold');
      this.addMessageToRoll(`${message}`);
    }
  }

  table(content: any) {

    if (content) {

      console.table(content);
    }
  }
}

export const Log = new LogController();