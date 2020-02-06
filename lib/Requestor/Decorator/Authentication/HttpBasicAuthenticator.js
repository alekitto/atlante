const encode = (() => {
    if ('undefined' !== typeof Buffer) {
        // Node.JS
        return str => new Buffer(str).toString('base64');
    }

    return str => {
        const arr = new Uint16Array(str.length);
        Array.prototype.forEach.call(arr, (_, idx) => arr[idx] = str.charCodeAt(idx));

        return btoa(String.fromCharCode.apply(null, new Uint8Array(arr.buffer)));
    };
})();

export default class HttpBasicAuthenticator {
    /**
     * Constructor.
     *
     * @param {string} usernameOrEncodedAuth The username or the base64-encoded auth if password is undefined
     * @param {string} password
     */
    constructor(usernameOrEncodedAuth, password = undefined) {
        /**
         * @type {string}
         *
         * @private
         */
        this._auth = undefined === password ? usernameOrEncodedAuth : encode(usernameOrEncodedAuth + (!! password ? ':' + password : ''));
    }

    /**
     * Decorates the request adding basic authentication header.
     */
    decorate(request) {
        const { body = undefined, method, url, headers } = request;
        if (! headers.has('Authorization')) {
            headers.set('Authorization', 'Basic ' + this._auth);
        }

        return { body, method, url, headers };
    }
}
