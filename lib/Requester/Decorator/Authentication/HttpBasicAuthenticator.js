const encode = (() => {
    if ('undefined' !== typeof Buffer) {
        // Node.JS
        return str => new Buffer(str).toString('base64');
    }

    /* Base64 string to array encoding */
    const uint6ToB64 = (n) => {
        switch (true) {
            case n < 26: return n + 65;
            case n < 52: return n + 71;
            case n < 62: return n - 4;
            case n === 62: return 43;
            case n === 63: return 47;
            default:
                return 65;
        }
    };

    return str => {
        const arr = new Uint16Array(str.length);
        Array.prototype.forEach.call(arr, (_, idx) => arr[idx] = str.charCodeAt(idx));

        const eqLen = (3 - (arr.length % 3)) % 3;
        let sB64Enc = '';

        for (let nMod3, nLen = arr.length, nUint24 = 0, nIdx = 0; nIdx < nLen; nIdx++) {
            nMod3 = nIdx % 3;
            nUint24 |= arr[nIdx] << (16 >>> nMod3 & 24);
            if (nMod3 === 2 || arr.length - nIdx === 1) {
                sB64Enc += String.fromCharCode(uint6ToB64(nUint24 >>> 18 & 63), uint6ToB64(nUint24 >>> 12 & 63), uint6ToB64(nUint24 >>> 6 & 63), uint6ToB64(nUint24 & 63));
                nUint24 = 0;
            }
        }

        return  eqLen === 0 ? sB64Enc : sB64Enc.substring(0, sB64Enc.length - eqLen) + (eqLen === 1 ? "=" : "==");
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
