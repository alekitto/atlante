import '@jymfony/util/lib/Async/Mutex';
import '@jymfony/util/lib/Platform';
import '@jymfony/util/lib/is';
import '@jymfony/util/lib/Object/filter';

import Headers from '../Requester/Headers';
import HttpException from '../Exception/HttpException';
import NotFoundHttpException from '../Exception/NotFoundHttpException';

/**
 * @memberOf Fazland.Atlante.Http
 * @implements ClientInterface
 */
export default class Client {
    /**
     * Constructor.
     *
     * @param {RequesterInterface} requester Object which performs http requests.
     * @param {DecoratorInterface[]} [requestDecorators = []] Decorators to apply to the request.
     */
    constructor(requester, requestDecorators = []) {
        /**
         * @type {RequesterInterface}
         *
         * @protected
         */
        this._requester = requester;

        /**
         * @type {DecoratorInterface[]}
         *
         * @protected
         */
        this._decorators = requestDecorators;
    }

    /**
     * @inheritdoc
     */
    get(path, headers = {}) {
        return this.request('GET', path, null, headers);
    }

    /**
     * @inheritdoc
     */
    post(path, requestData, headers = {}) {
        return this.request('POST', path, requestData, headers);
    }

    /**
     * @inheritdoc
     */
    put(path, requestData, headers = {}) {
        return this.request('PUT', path, requestData, headers);
    }

    /**
     * @inheritdoc
     */
    patch(path, requestData, headers = {}) {
        return this.request('PATCH', path, requestData, headers);
    }

    /**
     * @inheritdoc
     */
    mergePatch(path, requestData, headers = {}) {
        return this.patch(path, requestData, Object.assign(headers, { 'Content-Type': 'application/merge-patch+json'}));
    }

    /**
     * @inheritdoc
     */
    async request(method, path, requestData, headers = {}) {
        if ('GET' === method && 'HEAD' === method && 'DELETE' === method) {
            requestData = null;
        }

        headers = new Headers(headers);
        headers.set('Accept', 'application/json');

        let request = {
            body: requestData,
            method,
            url: path,
            headers,
        };

        for (const decorator of this._decorators) {
            request = await decorator.decorate(request);
        }

        const response = await this._requester.request(request.method, request.url, request.headers.all, request.body);
        this._filterResponse(request, response);

        return response;
    }

    /**
     * Filters a response, eventually throwing an error in case response status is not successful.
     *
     * @protected
     */
    _filterResponse(request, response) {
        if (200 <= response.status && 300 > response.status) {
            return;
        }

        switch (response.status) {
            case 404:
                throw new NotFoundHttpException(response, request);

            case 400:
            case 401:
            case 403:
            default:
                throw new HttpException(response.statusText, response, request);
        }
    }
}
