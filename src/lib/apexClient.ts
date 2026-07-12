import {
  ApexKit as BaseApexKit,
  ApexKitRealtimeWSClient,
  ApexKitRealtimeSSEClient,
  ApexError,
  type ScopeType,
  type Scope,
  type User,
  type AuthResponse,
  type BaseRecord,
  type ListResult,
  type QueryOptions,
  type StoredFile,
  type InstantResult,
  type SubscriptionFilter,
} from '@apexkit/sdk';

export { ApexKitRealtimeWSClient, ApexKitRealtimeSSEClient, ApexError };
export type { 
  ScopeType, 
  Scope, 
  User, 
  AuthResponse, 
  BaseRecord, 
  ListResult, 
  QueryOptions, 
  StoredFile, 
  InstantResult, 
  SubscriptionFilter 
};

/**
 * Extended ApexKit client to handle secure token persistence
 * across page refreshes using browser sessionStorage/localStorage.
 */
export class ApexKit extends BaseApexKit {
  public isTenantFallback: boolean = false;
  public missingCollectionsHandled: string[] = [];

  constructor(baseUrl: string, scopeType: ScopeType = 'root', scopeId: string = '') {
    super(baseUrl, scopeType, scopeId);

    // Hydrate existing session if available in the browser context
    if (typeof window !== 'undefined') {
      const cachedToken = localStorage.getItem('apex_token');
      const cachedUser = localStorage.getItem('apex_user');
      if (cachedToken) {
        this.setToken(cachedToken, cachedUser ? JSON.parse(cachedUser) : undefined);
      }
    }
  }

  override tenant(tenantId: string): ApexKit {
    const instance = new ApexKit(`${this.baseUrl}/tenant/${tenantId}`, 'tenant', tenantId);
    const token = this.getToken();
    const user = this.getUser();
    if (token) {
      instance.setToken(token, user || undefined);
    }
    return instance;
  }

  override sandbox(uuid: string): ApexKit {
    const instance = new ApexKit(`${this.baseUrl}/sandbox/${uuid}`, 'sandbox', uuid);
    const token = this.getToken();
    const user = this.getUser();
    if (token) {
      instance.setToken(token, user || undefined);
    }
    return instance;
  }

  override getToken(): string | null {
    const token = super.getToken();
    if (token) return token;

    // Direct fallback to browser storage if in-memory token is uninitialized
    if (typeof window !== 'undefined') {
      return localStorage.getItem('apex_token');
    }
    return null;
  }

  override setToken(token: string, user?: User) {
    super.setToken(token, user);
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('apex_token', token);
      } else {
        localStorage.removeItem('apex_token');
      }

      if (user) {
        localStorage.setItem('apex_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('apex_user');
      }
    }
  }
}