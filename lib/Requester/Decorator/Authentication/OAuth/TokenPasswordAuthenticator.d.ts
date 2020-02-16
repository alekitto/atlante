import ClientTokenAuthenticator, { ClientTokenAuthenticatorConfiguration } from './ClientTokenAuthenticator';
import RequesterInterface from "../../../RequesterInterface";
import StorageInterface from "../../../../Storage/StorageInterface";
import Response from "../../../Response";

declare interface TokenPasswordAuthenticatorConfiguration extends ClientTokenAuthenticatorConfiguration {
    access_token_key?: string;
    refresh_token_key?: string;
}

declare class TokenPasswordAuthenticator extends ClientTokenAuthenticator {
    private _accessTokenKey: string;
    private _refreshTokenKey: string;

    /**
     * Constructor.
     */
    constructor(requester: RequesterInterface, tokenStorage: StorageInterface, config: TokenPasswordAuthenticatorConfiguration);

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
     * Tries to refresh a token. Returns a string if refresh succeeded.
     */
    protected _refreshToken(): Promise<string|null>;

    /**
     * Stores the access/refresh tokens from response.
     */
    protected _storeTokenFromResponse(response: Response): Promise<void>;
}

export default TokenPasswordAuthenticator;
