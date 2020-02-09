const Blob = 'undefined' !== typeof window ? window.Blob : undefined;

/**
 * @memberOf Fazland.Atlante.Requester.Decorator
 */
export default class BodyConverterDecorator {
    /**
     * Converts the body to json if it is a js object.
     */
    decorate(request) {
        let { body = null, method, url, headers } = request;
        if (body && 'string' !== typeof body && ! (undefined !== Blob && body instanceof Blob)) {
            body = JSON.stringify(body);
            headers.set('Content-Type', 'application/json');
        }

        return { body, method, url, headers };
    }
}
