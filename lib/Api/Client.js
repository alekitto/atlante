import '@jymfony/util/lib/Async/Mutex';
import '@jymfony/util/lib/Platform';
import '@jymfony/util/lib/is';
import '@jymfony/util/lib/Object/filter';
import '@jymfony/util/lib/Error/trigger_deprecated';
import '@jymfony/util/lib/String/sprintf';

import BaseClient from '../Http/Client';
import BodyConverterDecorator from '../Requestor/Decorator/BodyConverterDecorator';
import OAuthTokenPasswordAuthenticator from '../Requestor/Decorator/Authentication/OAuthTokenPasswordAuthenticator';
import UrlDecorator from '../Requestor/Decorator/UrlDecorator';
import VersionSetterDecorator from '../Requestor/Decorator/VersionSetterDecorator';

/**
 * @memberOf Fazland.Atlante.Api
 *
 * @implements ClientInterface
 * @deprecated Api.Client has been deprecated. Please use Http.Client instead.
 */
export default class Client extends BaseClient {
    /**
     * Constructor.
     *
     * @param {Fazland.Atlante.Requestor.RequestorInterface} requestor Object which performs http requests.
     * @param {Fazland.Atlante.Storage.StorageInterface} tokenStorage Storage for CLIENT TOKEN.
     * @param {Object.<string, *>} config Configuration values (client_id, secret, ...)
     */
    constructor(requestor, tokenStorage, config) {
        if ('undefined' === typeof window) {
            __jymfony.trigger_deprecated(__jymfony.sprintf('"%s" is deprecated. Please use %s with properly set request decorators', ReflectionClass.getClassName(__self), ReflectionClass.getClassName(Fazland.Atlante.Http.Client)));
        } else {
            console.warn('Api.Client is deprecated. Please use Http.Client with properly set request decorators.');
        }

        const decorators = [];
        const authenticator = new OAuthTokenPasswordAuthenticator(requestor, tokenStorage, {
            token_endpoint: (new URL('/token', config.base_url)).toString(),
            client_id: config.client_id,
            client_secret: config.client_secret,
        });

        if (config.version) {
            decorators.push(new VersionSetterDecorator(config.version));
        }

        decorators.push(
            new UrlDecorator(config.base_url),
            new BodyConverterDecorator(),
            authenticator,
        );

        super(requestor, decorators);

        this._authenticator = authenticator;
    }

    /**
     * Authenticates user.
     */
    authenticate(username, password) {
        return this._authenticator.authenticate(username, password);
    }

    /**
     * Logs user out.
     */
    logout() {
        return this._authenticator.logout();
    }
}
