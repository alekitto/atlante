import BaseClientInterface from '../Http/ClientInterface';
import Response from "../Requester/Response";

/**
 * @deprecated Use Http.ClientInterface instead.
 */
declare interface ClientInterface extends BaseClientInterface {
    /**
     * Performs a request to the API service using a PATCH method with merge patch header set.
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

export default ClientInterface;
