import '@jymfony/util/lib/Error/trigger_deprecated';
import '@jymfony/util/lib/String/sprintf';

import BaseClient from '../Http/Client';
import BodyConverterDecorator from '../Requester/Decorator/BodyConverterDecorator';
import TokenPasswordAuthenticator from '../Requester/Decorator/Authentication/OAuth/TokenPasswordAuthenticator';
import UrlDecorator from '../Requester/Decorator/UrlDecorator';
import VersionSetterDecorator from '../Requester/Decorator/VersionSetterDecorator';

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
     * @param {Fazland.Atlante.Requester.RequesterInterface} requester Object which performs http requests.
     * @param {Fazland.Atlante.Storage.StorageInterface} tokenStorage Storage for CLIENT TOKEN.
     * @param {Object.<string, *>} config Configuration values (client_id, secret, ...)
     */
    constructor(requester, tokenStorage, config) {
        if ('undefined' === typeof window) {
            __jymfony.trigger_deprecated(__jymfony.sprintf('"%s" is deprecated. Please use %s with properly set request decorators', ReflectionClass.getClassName(__self), ReflectionClass.getClassName(Fazland.Atlante.Http.Client)));
        } else {
            console.warn('Api.Client is deprecated. Please use Http.Client with properly set request decorators.');
        }

        const decorators = [];
        const authenticator = new TokenPasswordAuthenticator(requester, tokenStorage, {
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

        super(requester, decorators);

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
