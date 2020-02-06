import OAuthClientTokenAuthenticator, { OAuthClientTokenAuthenticatorConfiguration } from './OAuthClientTokenAuthenticator';
import RequestorInterface from "../../RequestorInterface";
import StorageInterface from "../../../Storage/StorageInterface";
import Response from "../../Response";

declare interface OAuthTokenPasswordAuthenticatorConfiguration extends OAuthClientTokenAuthenticatorConfiguration {
    access_token_key?: string;
    refresh_token_key?: string;
}

declare class OAuthTokenPasswordAuthenticator extends OAuthClientTokenAuthenticator {
    private _accessTokenKey: string;
    private _refreshTokenKey: string;

    /**
     * Constructor.
     */
    constructor(requestor: RequestorInterface, tokenStorage: StorageInterface, config: OAuthTokenPasswordAuthenticatorConfiguration);

    /**
     * Authenticates user.
     */
    authenticate(username: string, password: string): Promise<string>;

    /**
     * Logs user out.
     */
    logout(): Promise<void>;

    /**
     * Request a token.
     */
    protected _getToken(): Promise<string>;

    /**
     * Stores the access/refresh tokens from response.
     */
    protected _storeTokenFromResponse(response: Response): Promise<void>;
}

export default OAuthTokenPasswordAuthenticator;
