import { DecoratorInterface } from './DecoratorInterface';
import Request from '../Request';

export default class VersionSetterDecorator implements DecoratorInterface {
    private _version: string;

    /**
     * Constructor.
     */
    constructor(version: string);

    /**
     * Decorates the request.
     */
    decorate(request: Request<any>): Request<any>;
}
