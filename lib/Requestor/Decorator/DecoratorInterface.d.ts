import Request from '../Request';

declare interface DecoratorInterface {
    /**
     * Decorates the request object adding/removing headers,
     * authenticating the request, etc.
     */
    decorate(request: Request<any>): Request<any> | Promise<Request<any>>;
}
