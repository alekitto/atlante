import BaseClientInterface from '../Http/ClientInterface';

/**
 * @deprecated Use Http.ClientInterface instead.
 */
declare interface ClientInterface extends BaseClientInterface {
    /**
     * Authenticates user.
     */
    authenticate(username: string, password: string): Promise<void>;

    /**
     * Logs user out.
     */
    logout(): Promise<void>;
}

export default ClientInterface;
