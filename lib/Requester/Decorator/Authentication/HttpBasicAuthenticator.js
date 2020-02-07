const encode = (() => {
    if ('undefined' !== typeof Buffer) {
        // Node.JS
        return str => new Buffer(str).toString('base64');
    }

    /* Base64 string to array encoding */
    const uint6ToB64 = (n) => {
        switch (true) {
            case 26 > n: return n + 65;
            case 52 > n: return n + 71;
            case 62 > n: return n - 4;
            case 62 === n: return 43;
            case 63 === n: return 47;
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
            if (2 === nMod3 || 1 === arr.length - nIdx) {
                sB64Enc += String.fromCharCode(uint6ToB64(nUint24 >>> 18 & 63), uint6ToB64(nUint24 >>> 12 & 63), uint6ToB64(nUint24 >>> 6 & 63), uint6ToB64(nUint24 & 63));
                nUint24 = 0;
            }
        }

        return 0 === eqLen ? sB64Enc : sB64Enc.substring(0, sB64Enc.length - eqLen) + (1 === eqLen ? '=' : '==');
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
