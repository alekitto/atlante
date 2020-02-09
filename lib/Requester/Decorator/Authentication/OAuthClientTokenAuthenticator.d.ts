import { DecoratorInterface } from "../DecoratorInterface";
import Request from "../../Request";
import RequesterInterface from "../../RequesterInterface";
import StorageInterface from "../../../Storage/StorageInterface";
import Response from "../../Response";
import Headers from "../../Headers";

export interface OAuthClientTokenAuthenticatorConfiguration {
    token_endpoint: string;
    client_id: string;
    client_secret?: string;
    client_token_key?: string;
    data_encoding?: 'json' | 'form';
}

interface OAuthTokenRequestParams extends Record<string, any> {
    grant_type: string,
}

declare class OAuthClientTokenAuthenticator implements DecoratorInterface {
    protected _requester: RequesterInterface;
    protected _tokenEndpoint: string;
    protected _tokenStorage: StorageInterface;
    protected _clientId: string;
    protected _clientSecret: string;
    protected _tokenPromise: null | Promise<string>;
    private _clientTokenKey: string;

    /**
     * Constructor.
     */
    constructor(requester: RequesterInterface, tokenStorage: StorageInterface, config: OAuthClientTokenAuthenticatorConfiguration);

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

    /**
     * Builds token request body and headers.
     */
    protected _buildTokenRequest(params: OAuthTokenRequestParams): { body: any, headers: Headers };

    /**
     * Encodes data and perform POST request.
     */
    protected _request(data: any, headers?: any): Promise<Response>;
}

export default OAuthClientTokenAuthenticator;
