import { DecoratorInterface } from './DecoratorInterface';
import Request from '../Request';

declare class UrlDecorator implements DecoratorInterface {
    private readonly _baseUrl: string;

    /**
     * Constructor.
     */
    constructor(baseUrl: string);

    /**
     * @inheritdoc
     */
    decorate(request: Request<any>): Request<any>;
}

export default UrlDecorator;
