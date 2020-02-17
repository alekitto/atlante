export default class ServerConfiguration {
    /**
     * Constructor.
     *
     * @param {object} config
     * @param {string} config.issuer
     * @param {string} config.authorization_endpoint
     * @param {string} config.token_endpoint
     * @param {string} config.end_session_endpoint
     * @param {string} config.userinfo_endpoint
     * @param {string} config.jwks_uri
     */
    constructor(config) {
        /**
         * @type {string}
         * @readonly
         */
        this.issuer = config.issuer;

        /**
         * @type {string}
         * @readonly
         */
        this.authorizationEndpoint = config.authorization_endpoint;

        /**
         * @type {string}
         * @readonly
         */
        this.tokenEndpoint = config.token_endpoint;

        /**
         * @type {string}
         * @readonly
         */
        this.logoutEndpoint = config.end_session_endpoint;

        /**
         * @type {string}
         * @readonly
         */
        this.userinfoEndpoint = config.userinfo_endpoint;

        /**
         * @type {string}
         * @private
         */
        this._jwks_uri = config.jwks_uri;
    }
}
