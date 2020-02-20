import ClientInterface from './ClientInterface';
import Request from "../Requester/Request";
import Response from '../Requester/Response';
import RequesterInterface from '../Requester/RequesterInterface';
import { DecoratorInterface } from "../Requester/Decorator/DecoratorInterface";

declare class Client implements ClientInterface {
    protected _decorators: DecoratorInterface[];

    constructor(requester: RequesterInterface, requestDecorators?: DecoratorInterface[]);

    /**
     * @inheritdoc
     */
    request<T = any>(method: string, path: string, requestData?: any, headers?: {}): Promise<Response<T>>;

    /**
     * @inheritdoc
     */
    get<T = any>(path: string, headers?: {}): Promise<Response<T>>;

    /**
     * @inheritdoc
     */
    post<T = any>(path: string, requestData?: any, headers?: {}): Promise<Response<T>>;

    /**
     * @inheritdoc
     */
    put<T = any>(path: string, requestData?: any, headers?: {}): Promise<Response<T>>;

    /**
     * @inheritdoc
     */
    patch<T = any>(path: string, requestData?: any, headers?: {}): Promise<Response<T>>;

    /**
     * Filters a response, eventually throwing an error in case response status is not successful.
     */
    protected _filterResponse(request: Request, response: Response): void;
}

export default Client;
