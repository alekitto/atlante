import Accept from '../Header/Accept';

/**
 * @memberOf Fazland.Atlante.Requester.Decorator
 */
export default class VersionSetterDecorator {
    /**
     * Constructor.
     *
     * @param {string} version
     */
    constructor(version) {
        /**
         * @type {string}
         *
         * @private
         */
        this._version = version;
    }

    /**
     * Decorates the request.
     */
    decorate(request) {
        const { body = undefined, method, url, headers } = request;

        const header = headers.get('Accept', new Accept('application/json'));
        header.setParameter('version', this._version);
        headers.set('Accept', header);

        return { body, method, url, headers };
    }
}
