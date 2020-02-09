/**
 * @memberOf Fazland.Atlante.Requester.Decorator
 */
class DecoratorInterface {
    /**
     * Decorates the request object adding/removing headers,
     * authenticating the request, etc.
     */
    decorate(request) { }
}

export default getInterface(DecoratorInterface);
