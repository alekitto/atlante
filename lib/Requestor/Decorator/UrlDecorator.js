/**
 * @memberOf Fazland.Atlante.Requestor.Decorator
 */
export default class UrlDecorator {
    /**
     * Constructor.
     *
     * @param {string} baseUrl
     */
    constructor(baseUrl) {
        /**
         * @type {string}
         *
         * @private
         */
        this._baseUrl = baseUrl;
    }

    /**
     * Decorates the request.
     */
    decorate(request) {
        let { body = undefined, method, url, headers } = request;
        if (-1 === url.indexOf('://')) {
            const parsedUrl = new URL(url, this._baseUrl);
            url = parsedUrl.href;
        }

        return { body, method, url, headers };
    }
}
