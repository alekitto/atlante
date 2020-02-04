import BaseClient from '../Http/Client';
import ClientInterface from './ClientInterface';
import RequestorInterface from '../Requestor/RequestorInterface';
import StorageInterface from '../Storage/StorageInterface';

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
    constructor(requestor: RequestorInterface, tokenStorage: StorageInterface, config: ClientConfig);

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
