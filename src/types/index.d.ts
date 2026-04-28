/// <reference types="vite-plugin-monkey/client" />

declare global {
  function GM_getValue<T = any>(key: string, defaultValue?: T | null): T | null;
  function GM_setValue(key: string, value: any): void;
  function GM_xmlhttpRequest(details: GM.XHRDetails): void;
}

export namespace GM {
  interface XHRDetails {
    method?: "GET" | "POST" | "PUT" | "DELETE" | "HEAD" | "OPTIONS" | "PATCH";
    url: string;
    headers?: Record<string, string>;
    data?: string | Blob | FormData;
    timeout?: number;
    context?: any;
    responseType?: "text" | "arraybuffer" | "blob" | "json" | "document" | "stream";
    overrideMimeType?: string;
    onload?: (response: XHRResponse) => void;
    onloadstart?: (response: XHRResponse) => void;
    onloadend?: (response: XHRResponse) => void;
    onprogress?: (response: XHRProgressResponse) => void;
    onerror?: (error: XHRResponse | null) => void;
    ontimeout?: () => void;
    onabort?: () => void;
  }

  interface XHRResponse {
    readonly responseHeaders: string;
    readonly readyState: number;
    readonly response: any;
    readonly responseText: string;
    readonly responseXML: Document | null;
    readonly status: number;
    readonly statusText: string;
    readonly finalUrl: string;
  }

  interface XHRProgressResponse extends XHRResponse {
    done: number;
    lengthComputable: boolean;
    loaded: number;
    position?: number;
    total: number;
    totalSize: number;
  }
}

export interface CardTranslationResponse {
  success: boolean;
  data: {
    total: number;
    cards: Array<{
      ename: string;
      cname: string;
      img?: string;
      thumbnail?: string;
    }>;
  };
}

export interface CustomTranslations {
  [original: string]: string;
}

export interface Config {
  [key: `enable_${string}`]: boolean;
}

export type StorageManagerType = {
  gm: {
    get<T = any>(key: string, defaultValue?: T | null): T | null;
    set(key: string, value: any): void;
    remove(key: string): void;
  };
  local: {
    get<T = any>(key: string, defaultValue?: T | null): T | null;
    set(key: string, value: any): void;
    remove(key: string): void;
  };
};

export {};
