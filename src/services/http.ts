import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { Log } from "./log";

export interface RequestConfig {
  headers?: Record<string, string>;
  data?: any;
  params?: Record<string, any>;
  responseType?: 'json' | 'text' | 'arraybuffer';
}

export abstract class HttpController {

  protected async makeRequest(
    method: 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE',
    url: string,
    config?: AxiosRequestConfig
  ) {
    try {
      const requestConfig: AxiosRequestConfig = {
        method,
        url,
        ...config, // Merge provided config, allowing overrides
      };

      const res: AxiosResponse = await axios(requestConfig);
      Log.debug('API response', res);
      return res;
    } catch (error) {
      Log.error(`HTTP call error ${error.response?.status}`, error.message);
      return {
        data: null,
        status: error.response?.status || 401,
        statusText: error.response?.statusText || 'Unauthorized',
      };
    }
  }

  public async httpGet(url: string, config?: RequestConfig) {
    return this.makeRequest('GET', url, config);
  }

  public async httpPost(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.makeRequest('POST', url, { ...config, data });
  }

  public async httpPut(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.makeRequest('PUT', url, { ...config, data });
  }

  public async httpPatch(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.makeRequest('PATCH', url, { ...config, data });
  }

  public async httpDelete(url: string, config?: RequestConfig) {
    return this.makeRequest('DELETE', url, config);
  }
}
