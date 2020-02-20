import Headers from "../../../Headers";
import RequesterInterface from "../../../RequesterInterface";
import ServerConfiguration from './ServerConfiguration';
import StorageInterface from "../../../../Storage/StorageInterface";
import TokenPasswordAuthenticator from '../OAuth/TokenPasswordAuthenticator';
import { TokenRequestParams } from "../OAuth/ClientTokenAuthenticator";

export interface OpenidAuthenticatorConfiguration {
    server_url: string;
    client_id: string;
    openid_scope?: string[];
    client_secret?: string;
    audience?: string;
    auth_method?: 'client_secret_basic' | 'client_secret_post';
    post_logout_redirect_uri?: string;
}

export enum AuthFlowDisplay {
    PAGE = 'page',
    POPUP = 'popup',
    TOUCH = 'touch',
}

declare abstract class BaseAuthenticator extends TokenPasswordAuthenticator {
    /**
     * Get the current token information (using token introspection endpoint).
     */
    readonly tokenInfo: Promise<any>;

    /**
     * Gets the openid configuration from the well known configuration endpoint.
     */
    protected readonly _openidConfiguration: Promise<ServerConfiguration>;

    protected readonly _scopes: string;
    protected readonly _audience: string;

    private _oidConfig: Promise<any>;
    private readonly _serverUrl: string;
    private readonly _authMethod: 'client_secret_basic' | 'client_secret_post';

    protected constructor(requester: RequesterInterface, tokenStorage: StorageInterface, config: OpenidAuthenticatorConfiguration);

    /**
     * Starts the authorization flow (code or implicit).
     */
    abstract startAuthorization(callbackUri: string, display?: AuthFlowDisplay, state?: string): Promise<never>;

    /**
     * @inheritdoc
     */
    logout(): Promise<void>;

    /**
     * @inheritdoc
     */
    protected _getToken(): Promise<string>;

    /**
     * @inheritdoc
     */
    protected _buildTokenRequest(params: TokenRequestParams): { body: any, headers: Headers };

    private _getConfiguration(): Promise<ServerConfiguration>;

    /**
     * Retrieves token info.
     */
    private _tokenInfo(): Promise<any>;
}

export default BaseAuthenticator;
