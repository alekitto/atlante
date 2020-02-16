import Headers from '../../../Headers';
import NoTokenAvailableException from '../../../../Exception/NoTokenAvailableException';

/**
 * @memberOf Fazland.Atlante.Requester.Decorator.Authentication.OAuth
 */
export default class ClientTokenAuthenticator {
    /**
     * Constructor.
     *
     * @param {Fazland.Atlante.Requester.RequesterInterface} requester
     * @param {Fazland.Atlante.Storage.StorageInterface} tokenStorage
     * @param {string} token_endpoint
     * @param {string} client_id
     * @param {null|string} [client_secret = null]
     * @param {string} [client_token_key = 'fazland_atlante_client_token']
     * @param {string} [data_encoding = 'json'] could be "json" or "form". If "json" encodes token request data with JSON.stringify, if "form" data will be encoded as form data.
     */
    constructor(
        requester,
        tokenStorage,
        {
            token_endpoint,
            client_id,
            client_secret = null,
            client_token_key = 'fazland_atlante_client_token',
            data_encoding = 'json',
        }
    ) {
        /**
         * @type {Fazland.Atlante.Requester.RequesterInterface}
         *
         * @protected
         */
        this._requester = requester;

        /**
         * @type {string}
         *
         * @protected
         */
        this._tokenEndpoint = token_endpoint;

        /**
         * @type {Fazland.Atlante.Storage.StorageInterface}
         *
         * @protected
         */
        this._tokenStorage = tokenStorage;

        /**
         * @type {string}
         *
         * @protected
         */
        this._clientId = client_id;

        /**
         * @type {string}
         *
         * @protected
         */
        this._clientSecret = client_secret;

        /**
         * @type {null|Promise<string>}
         *
         * @protected
         */
        this._tokenPromise = null;

        /**
         * @type {string}
         *
         * @private
         */
        this._clientTokenKey = client_token_key;

        /**
         * @type {string}
         *
         * @private
         */
        this._encoding = data_encoding;
    }

    /**
     * Decorates the request adding client token authorization if not already set.
     */
    async decorate(request) {
        const { body = undefined, method, url, headers } = request;
        if (! headers.has('Authorization')) {
            headers.set('Authorization', 'Bearer ' + await this.token);
        }

        return { body, method, url, headers };
    }

    /**
     * Gets a token promise.
     *
     * @return {Promise<string>}
     */
    get token() {
        return this._tokenPromise = this._tokenPromise ||
            (this._getToken().then(res => (this._tokenPromise = null, res)));
    }

    /**
     * Request a token.
     *
     * @return {Promise<string>}
     *
     * @protected
     */
    async _getToken() {
        const item = await this._tokenStorage.getItem(this._clientTokenKey);
        if (item.isHit) {
            return item.get();
        }

        const request = this._buildTokenRequest({ grant_type: 'client_credentials' });
        const response = await this._request(request.body, request.headers.all);

        if (200 !== response.status) {
            throw new NoTokenAvailableException(`Client credentials token returned status ${response.status} (${response.statusText})`);
        }

        const content = response.data;
        const token = content.access_token;

        item.set(token);
        item.expiresAfter(content.expires_in - 60);
        await this._tokenStorage.save(item);

        return token;
    }

    /**
     * Builds token request body and headers.
     *
     * @protected
     */
    _buildTokenRequest({ grant_type, ...extra }) {
        return {
            body: {
                grant_type,
                client_id: this._clientId,
                client_secret: this._clientSecret,
                ...extra,
            },
            headers: new Headers(),
        };
    }

    /**
     * Encodes data and perform POST request.
     *
     * @param {*} data
     * @param {*} headers
     *
     * @return {Promise<Response>}
     *
     * @protected
     */
    _request(data, headers = {}) {
        if ('json' === this._encoding) {
            headers['Content-Type'] = 'application/json';
            data = JSON.stringify(data);
        } else {
            headers['Content-Type'] = 'application/x-www-form-urlencoded';
            const params = [];
            for (const key of Object.keys(data)) {
                params.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
            }

            data = params.join('&');
        }

        return this._requester.request('POST', this._tokenEndpoint, headers, data);
    }
}
