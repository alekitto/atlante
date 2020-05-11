import BaseAuthenticator from './BaseAuthenticator';
import NoTokenAvailableException from '../../../../Exception/NoTokenAvailableException';

export default class ImplicitFlowAuthenticator extends BaseAuthenticator {
    constructor(requester, tokenStorage, config) {
        super(requester, tokenStorage, config);

        /**
         * @type {null|string}
         *
         * @private
         */
        this._lastCallbackUri = null;
    }

    /**
     * @inheritdoc
     */
    async startAuthorization(callbackUri, display, state) {
        const configuration = await this._openidConfiguration;

        // Generate a random state if none is passed.
        state = state || Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        const authorizationUrl = new URL(configuration.authorizationEndpoint);
        authorizationUrl.searchParams.append('response_type', 'token id_token');
        authorizationUrl.searchParams.append('prompt', 'login consent');
        authorizationUrl.searchParams.append('scope', this._scopes);
        authorizationUrl.searchParams.append('client_id', this._clientId);
        authorizationUrl.searchParams.append('client_secret', this._clientSecret);
        authorizationUrl.searchParams.append('redirect_uri', callbackUri);
        authorizationUrl.searchParams.append('display', display);
        authorizationUrl.searchParams.append('state', state);

        if (this._audience) {
            authorizationUrl.searchParams.append('audience', this._audience);
        }

        location.href = authorizationUrl.href;

        return super.startAuthorization(callbackUri, display, state);
    }

    /**
     * Finish implicit authorization flow.
     *
     * @param {string} state
     * @param {string} [fragment = location.hash]
     *
     * @returns {Promise<void>}
     */
    async authorize({ state, fragment = location.hash }) {
        const params = new URLSearchParams(fragment.replace(/^#/, ''));
        const data = { event: 'implicit_flow_refresh', ...params.entries() };

        if (undefined !== state && params.get('state') !== state) {
            throw new NoTokenAvailableException('Invalid state returned');
        }

        const item = await this._tokenStorage.getItem(this._accessTokenKey);

        item.set(params.get('access_token'));
        item.expiresAfter(params.get('expires_in') - 60);
        await this._tokenStorage.save(item);

        const id_token = params.get('id_token');
        if (!! id_token) {
            const idItem = await this._tokenStorage.getItem(this._idTokenKey);
            idItem.set(id_token);
            await this._tokenStorage.save(idItem);
        }

        window.parent.postMessage(data, '*');
    }

    /**
     * @inheritdoc
     */
    async _refreshToken() {
        if (undefined === window) {
            throw new NoTokenAvailableException('Implicit flow called from a non-browser environment');
        }

        const item = await this._tokenStorage.getItem(this._idTokenKey);
        if (! item.isHit) {
            throw new NoTokenAvailableException('Cannot refresh implicit flow released token');
        }

        const configuration = await this._openidConfiguration;

        // Generate a random state.
        const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        const authorizationUrl = new URL(configuration.authorizationEndpoint);
        authorizationUrl.searchParams.append('response_type', 'token id_token');
        authorizationUrl.searchParams.append('prompt', 'none');
        authorizationUrl.searchParams.append('scope', this._scopes);
        authorizationUrl.searchParams.append('client_id', this._clientId);
        authorizationUrl.searchParams.append('client_secret', this._clientSecret);
        authorizationUrl.searchParams.append('redirect_uri', this._lastCallbackUri);
        authorizationUrl.searchParams.append('id_token_hint', item.get());
        authorizationUrl.searchParams.append('state', state);

        if (this._audience) {
            authorizationUrl.searchParams.append('audience', this._audience);
        }

        const frame = window.document.createElement('iframe');
        let resolved = false;
        const responsePromise = new Promise((resolve, reject) => {
            frame.width = '0';
            frame.height = '0';
            frame.src = authorizationUrl.href;
            frame.onerror = reject;
            frame.onabort = () => reject(new NoTokenAvailableException('Refresh token request has been aborted.'));

            window.addEventListener('message', (event) => {
                if (! event.data || 'implicit_flow_refresh' !== event.data.event) {
                    return;
                }

                resolved = true;
                resolve();
            });

            document.append(frame);
        });

        return Promise.race([
            responsePromise,
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (resolved) {
                        return;
                    }

                    frame.parentNode.removeChild(frame);
                    reject(new NoTokenAvailableException('Timed out while refreshing access token'));
                }, 60000);
            }),
        ]);
    }
}
