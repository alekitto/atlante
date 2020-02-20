import BaseClient from '../Http/Client';
import ClientInterface from './ClientInterface';
import RequesterInterface from '../Requester/RequesterInterface';
import StorageInterface from '../Storage/StorageInterface';
import Response from "../Requester/Response";

declare interface ClientConfig {
    client_id: string;
    client_secret: string;
    base_url: string;
    version?: string;
}

/**
 * @deprecated Api.Client has been deprecated. Please use Http.Client instead.
 */
declare class Client extends BaseClient implements ClientInterface {
    constructor(requester: RequesterInterface, tokenStorage: StorageInterface, config: ClientConfig);

    /**
     * @inheritdoc
     */
    mergePatch<T = any>(path: string, requestData?: any, headers?: {}): Promise<Response<T>>;

    /**
     * Authenticates user.
     */
    authenticate(username: string, password: string): Promise<void>;

    /**
     * Logs user out.
     */
    logout(): Promise<void>;
}

export default Client;
