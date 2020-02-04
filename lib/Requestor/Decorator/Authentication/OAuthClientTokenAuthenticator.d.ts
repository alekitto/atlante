import { DecoratorInterface } from "../DecoratorInterface";
import Request from "../../Request";
import RequestorInterface from "../../RequestorInterface";
import StorageInterface from "../../../Storage/StorageInterface";

export interface OAuthClientTokenAuthenticatorConfiguration {
    token_endpoint: string;
    client_id: string;
    client_secret?: string;
    client_token_key?: string;
}

declare class OAuthClientTokenAuthenticator implements DecoratorInterface {
    protected _requestor: RequestorInterface;
    protected _tokenStorage: StorageInterface;
    protected _clientId: string;
    protected _clientSecret: string;
    protected _tokenPromise: null | Promise<string>;
    private _clientTokenKey: string;

    /**
     * Constructor.
     */
    constructor(requestor: RequestorInterface, tokenStorage: StorageInterface, config: OAuthClientTokenAuthenticatorConfiguration);

    /**
     * Decorates the request adding client token authorization if not already set.
     */
    decorate(request: Request): Promise<Request>;

    /**
     * Gets a token promise.
     */
    public readonly token: Promise<string>;

    /**
     * Request a token.
     */
    protected _getToken(): Promise<string>;
}

export default OAuthClientTokenAuthenticator;
