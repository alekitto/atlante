import NoTokenAvailableException from '../../../Exception/NoTokenAvailableException';

export default class OAuthClientTokenAuthenticator {
    /**
     * Constructor.
     *
     * @param {Fazland.Atlante.Requestor.RequestorInterface} requestor
     * @param {Fazland.Atlante.Storage.StorageInterface} tokenStorage
     * @param {string} token_endpoint
     * @param {string} client_id
     * @param {null|string} client_secret
     * @param {string} client_token_key
     */
    constructor(
        requestor,
        tokenStorage,
        {
            token_endpoint,
            client_id,
            client_secret = null,
            client_token_key = 'fazland_atlante_client_token',
        }
    ) {
        /**
         * @type {Fazland.Atlante.Requestor.RequestorInterface}
         *
         * @protected
         */
        this._requestor = requestor;

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
         * @type {string}
         *
         * @private
         */
        this._clientTokenKey = client_token_key;

        /**
         * @type {null|Promise<string>}
         *
         * @protected
         */
        this._tokenPromise = null;
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

        const response = await this._requestor.request('POST', this._tokenEndpoint, {}, {
            grant_type: 'client_credentials',
            client_id: this._clientId,
            client_secret: this._clientSecret,
        });

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
}
