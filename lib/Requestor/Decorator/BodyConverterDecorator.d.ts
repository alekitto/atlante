import Request from '../Request';
import { DecoratorInterface } from "./DecoratorInterface";

declare class BodyConverterDecorator implements DecoratorInterface {
    /**
     * Converts the body to json if it is a js object.
     */
    decorate(request: Request<any>): Request<any>;
}

export default BodyConverterDecorator;
