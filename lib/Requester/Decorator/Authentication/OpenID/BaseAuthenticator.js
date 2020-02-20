import Headers from '../../../Headers';
import HttpBasicAuthenticator from '../HttpBasicAuthenticator';
import ServerConfiguration from './ServerConfiguration';
import TokenPasswordAuthenticator from '../OAuth/TokenPasswordAuthenticator';

export class AuthFlowDisplay {
}

AuthFlowDisplay.PAGE = 'page';
AuthFlowDisplay.POPUP = 'popup';
AuthFlowDisplay.TOUCH = 'touch';

/**
 * @memberOf Fazland.Atlante.Requester.Decorator.Authentication.OpenID
 * @abstract
 */
export default class BaseAuthenticator extends TokenPasswordAuthenticator {
    constructor(requester, tokenStorage, config) {
        super(requester, tokenStorage, {
            ...config,
            token_endpoint: '',
            client_token_key: 'client_access_token',
            data_encoding: 'form',
        });

        /**
         * @type {string}
         *
         * @private
         */
        this._serverUrl = config.server_url;

        const scopes = (config.openid_scope || [ 'profile', 'email', 'address', 'phone', 'offline_access' ]);
        scopes.push('openid');

        /**
         * @type {string}
         *
         * @private
         */
        this._scopes = scopes.join(' ');

        /**
         * @type {string}
         *
         * @private
         */
        this._audience = config.audience;

        /**
         * @type {"client_secret_basic" | "client_secret_post"}
         *
         * @private
         */
        this._authMethod = config.auth_method || 'client_secret_basic';

        /**
         * @type {string | null}
         *
         * @private
         */
        this._postLogoutRedirectUri = config.post_logout_redirect_uri || null;
    }

    /**
     * Get the current token information (using token introspection endpoint).
     *
     * @returns {Promise<*>}
     */
    get tokenInfo() {
        return this._tokenInfo();
    }

    /**
     * @inheritdoc
     */
    async logout() {
        const configuration = await this._openidConfiguration;
        if (! configuration.logoutEndpoint) {
            return super.logout();
        }

        const returnUrl = new URL(configuration.logoutEndpoint);
        returnUrl.searchParams.append('post_logout_redirect_uri', this._postLogoutRedirectUri || window.location.href);

        if (!! this._idTokenKey) {
            const idItem = await this._tokenStorage.getItem(this._idTokenKey);
            if (idItem.isHit) {
                returnUrl.searchParams.append('id_token_hint', idItem.get());
            }
        }

        await super.logout();
        window.location.href = returnUrl.href;
    }

    /**
     * @inheritdoc
     */
    async _getToken() {
        const configuration = await this._openidConfiguration;
        this._tokenEndpoint = configuration.tokenEndpoint;

        return super._getToken();
    }

    /**
     * @inheritdoc
     */
    _buildTokenRequest({ grant_type, ...extra }) {
        let headers = new Headers();

        if ('client_secret_basic' === this._authMethod) {
            const basic = new HttpBasicAuthenticator(this._clientId, this._clientSecret || null);
            headers = basic.decorate({ method: 'POST', headers, url: '' }).headers;

            return {
                body: {
                    grant_type,
                    ...extra,
                },
                headers,
            };
        }

        return super._buildTokenRequest({ grant_type, ...extra });
    }

    /**
     * Gets the openid configuration from the well known configuration endpoint.
     *
     * @returns {Promise<ServerConfiguration>}
     *
     * @private
     */
    get _openidConfiguration() {
        return this._oidConfig = this._oidConfig || this._getConfiguration();
    }

    /**
     * @returns {Promise<ServerConfiguration>}
     *
     * @private
     */
    async _getConfiguration() {
        const configurationUrl = new URL('/.well-known/openid-configuration', this._serverUrl).toString();
        const response = await this._requester.request('GET', configurationUrl);
        if (200 !== response.status) {
            throw new Error('Server misconfiguration or server does not support OpenID Connect');
        }

        return new ServerConfiguration(response.data);
    }

    /**
     * Retrieves token info.
     *
     * @returns {Promise<*>}
     *
     * @private
     */
    async _tokenInfo() {
        const token = await this.token;

        const configuration = await this._openidConfiguration;
        const response = await this._requester.request('GET', configuration.userinfoEndpoint, {
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + token,
        });

        if (200 !== response.status) {
            throw new Error('Bad response');
        }

        return response.data;
    }
}
