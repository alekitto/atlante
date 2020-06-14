import BaseAuthenticator, {AuthFlowDisplay} from './BaseAuthenticator';
import NoTokenAvailableException from '../../../../Exception/NoTokenAvailableException';

export default class ImplicitFlowAuthenticator extends BaseAuthenticator {
    constructor(requester, tokenStorage, config) {
        super(requester, tokenStorage, config);

        /**
         * @type {string}
         *
         * @private
         */
        this._refreshRedirectUri = config.refresh_redirect_uri;
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

        const nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        authorizationUrl.searchParams.append('nonce', nonce);

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

        const error = params.get('error');
        if (error) {
            let errorDescription, errorHint;
            const errorMessage = 'Error: ' + error +
                ((errorDescription = params.get('error_description')) ? '\nDescription: ' + decodeURIComponent(errorDescription) : '') +
                ((errorHint = params.get('error_hint')) ? '\nHint: ' + decodeURIComponent(errorHint) : '');

            window.parent.postMessage(data, '*');
            throw new NoTokenAvailableException(errorMessage);
        }

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
            return null;
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
        authorizationUrl.searchParams.append('redirect_uri', this._refreshRedirectUri);
        authorizationUrl.searchParams.append('id_token_hint', item.get());
        authorizationUrl.searchParams.append('state', state);

        const nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        authorizationUrl.searchParams.append('nonce', nonce);

        if (this._audience) {
            authorizationUrl.searchParams.append('audience', this._audience);
        }

        const frame = window.document.createElement('iframe');
        let resolved = false;
        const responsePromise = new Promise((resolve, reject) => {
            frame.style.position = 'fixed';
            frame.style.top = '0';
            frame.style.left = '0';
            frame.style.width = '0';
            frame.style.height = '0';
            frame.src = authorizationUrl.href;
            frame.onerror = reject;
            frame.onabort = () => reject(new NoTokenAvailableException('Refresh token request has been aborted.'));

            window.addEventListener('message', (event) => {
                if (! event.data || 'implicit_flow_refresh' !== event.data.event) {
                    return;
                }

                resolved = true;
                document.body.removeChild(frame);

                if (event.data.error) {
                    reject(new NoTokenAvailableException('Refresh token returned "' + event.data.error + '"'));
                } else {
                    resolve();
                }
            });

            document.body.appendChild(frame);
        });

        return Promise.race([
            responsePromise,
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (resolved) {
                        return;
                    }

                    document.body.removeChild(frame);
                    reject(new NoTokenAvailableException('Timed out while refreshing access token'));
                }, 60000);
            }),
        ]);
    }
}
