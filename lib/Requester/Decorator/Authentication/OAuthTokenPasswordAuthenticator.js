import NoTokenAvailableException from '../../../Exception/NoTokenAvailableException';
import OAuthClientTokenAuthenticator from './OAuthClientTokenAuthenticator';

export default class OAuthTokenPasswordAuthenticator extends OAuthClientTokenAuthenticator {
    /**
     * Constructor.
     *
     * @param {Fazland.Atlante.Requester.RequesterInterface} requester
     * @param {Fazland.Atlante.Storage.StorageInterface} tokenStorage
     * @param {string} token_endpoint
     * @param {string} client_id
     * @param {null|string} [client_secret]
     * @param {string} [client_token_key]
     * @param {string} [data_encoding]
     * @param {string} [access_token_key]
     * @param {string} [refresh_token_key]
     */
    constructor(
        requester,
        tokenStorage,
        {
            token_endpoint,
            client_id,
            client_secret = undefined,
            client_token_key = undefined,
            data_encoding = undefined,
            access_token_key = 'access_token',
            refresh_token_key = 'refresh_token',
        }
    ) {
        super(requester, tokenStorage, { token_endpoint, client_id, client_secret, client_token_key, data_encoding });

        /**
         * @type {string}
         *
         * @private
         */
        this._accessTokenKey = access_token_key;

        /**
         * @type {string}
         *
         * @private
         */
        this._refreshTokenKey = refresh_token_key;
    }

    /**
     * Authenticates user.
     *
     * @param {string} username
     * @param {string} password
     *
     * @return {Promise<string>}
     */
    authenticate(username, password) {
        this._tokenPromise = (async () => {
            const request = this._buildTokenRequest({
                grant_type: 'password',
                username,
                password,
            });

            const response = await this._request(request.body, request.headers.all);
            await this._storeTokenFromResponse(response);

            return response.data.access_token;
        })();

        return this.token;
    }

    /**
     * Logs user out.
     *
     * @return {Promise<void>}
     */
    async logout() {
        await this._tokenStorage.deleteItem(this._accessTokenKey);
        await this._tokenStorage.deleteItem(this._refreshTokenKey);
    }

    /**
     * Request a token.
     *
     * @return {Promise<string>}
     *
     * @protected
     */
    async _getToken() {
        const item = await this._tokenStorage.getItem(this._accessTokenKey);
        if (item.isHit) {
            return item.get();
        }

        const refreshed = await this._refreshToken();
        if (null === refreshed) {
            return await super._getToken();
        }

        return refreshed;
    }

    /**
     * Tries to refresh a token. Returns a string if refresh succeeded.
     *
     * @return {Promise<string|null>}
     *
     * @protected
     */
    async _refreshToken() {
        const refreshItem = await this._tokenStorage.getItem('refresh_token');
        if (! refreshItem.isHit) {
            return null;
        }

        const request = this._buildTokenRequest({
            grant_type: 'refresh_token',
            refresh_token: refreshItem.get(),
        });
        const response = await this._request(request.body, request.headers.all);
        await this._storeTokenFromResponse(response);

        return response.data.access_token;
    }

    /**
     * Stores the access/refresh tokens from response.
     *
     * @protected
     */
    async _storeTokenFromResponse(response) {
        const item = await this._tokenStorage.getItem(this._accessTokenKey);
        const refreshItem = await this._tokenStorage.getItem(this._refreshTokenKey);

        if (200 !== response.status) {
            throw new NoTokenAvailableException(`Token refresh responded with status ${response.status} (${response.statusText})`);
        }

        const content = response.data;

        item.set(content.access_token);
        item.expiresAfter(content.expires_in - 60);
        await this._tokenStorage.save(item);

        if (!! content.refresh_token) {
            refreshItem.set(content.refresh_token);
            await this._tokenStorage.save(refreshItem);
        }
    }
}
