import ClientInterface from './ClientInterface';
import Request from "../Requestor/Request";
import Response from '../Requestor/Response';
import RequestorInterface from '../Requestor/RequestorInterface';
import { DecoratorInterface } from "../Requestor/Decorator/DecoratorInterface";


declare class Client implements ClientInterface {
    protected _decorators: DecoratorInterface[];

    constructor(requestor: RequestorInterface, requestDecorators?: DecoratorInterface[]);

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
     * @inheritdoc
     */
    mergePatch<T = any>(path: string, requestData?: any, headers?: {}): Promise<Response<T>>;

    /**
     * Filters a response, eventually throwing an error in case response status is not successful.
     */
    protected _filterResponse(request: Request, response: Response): void;
}

export default Client;
