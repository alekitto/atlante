import Accept from './Header/Accept';
import BaseAccept from './Header/BaseAccept';

/**
 * @memberOf Fazland.Atlante.Requester
 */
export default class Headers {
    constructor(headers = null) {
        if (headers instanceof Headers) {
            return headers;
        }

        /**
         * @type {Object.<string, (string|Accept)[]>}
         *
         * @private
         */
        this._headers = {};

        /**
         * @type {Object.<string, string>}
         *
         * @private
         */
        this._headersName = {};

        if (null !== headers) {
            for (const [ key, value ] of Object.entries(headers)) {
                this.set(key, value);
            }
        }
    }

    /**
     * Sets an header.
     *
     * @param {string} name
     * @param {string|Accept|string[]} value
     *
     * @returns {this}
     */
    set(name, value) {
        const lowerName = name.toLowerCase();

        if ('accept' === lowerName && ! (value instanceof Accept)) {
            value = new Accept(value);
        }

        if (value instanceof BaseAccept && ! lowerName.startsWith('accept')) {
            throw new Error('Cannot set accept to non-Accept header');
        }

        this._headers[lowerName] = Array.isArray(value) ? value : [ value ];
        this._headersName[lowerName] = name;

        return this;
    }

    /**
     * Gets an header by name.
     *
     * @param {string} name
     *
     * @returns {undefined|string|string[]}
     */
    get(name) {
        if (! this.has(name)) {
            return undefined;
        }

        const lowerName = name.toLowerCase();
        const hdr = this._headers[lowerName];

        return 1 === hdr.length ? hdr[0] : hdr;
    }

    /**
     * Checks whether an header is present.
     *
     * @param {string} name
     *
     * @returns {boolean}
     */
    has(name) {
        const lowerName = name.toLowerCase();

        return this._headers.hasOwnProperty(lowerName);
    }

    /**
     * Removes an header.
     *
     * @param {string} name
     *
     * @returns {this}
     */
    remove(name) {
        const lowerName = name.toLowerCase();

        delete this._headers[lowerName];
        delete this._headersName[lowerName];

        return this;
    }

    /**
     * Adds an header.
     *
     * @param {string} name
     * @param {string|Accept|string[]} value
     *
     * @returns {this}
     */
    add(name, value) {
        if (! this.has(name)) {
            return this.set(name, value);
        }

        const lowerName = name.toLowerCase();
        if ('accept' === lowerName && ! (value instanceof Accept)) {
            value = new Accept(value);
        }

        if (value instanceof BaseAccept) {
            return this.set(name, value);
        }

        value = ! Array.isArray(value) ? [ value ] : value;
        this._headers[lowerName] = [ ...this._headers[lowerName], ...value ];

        return this;
    }

    get all() {
        const headers = {};
        for (const name of Object.keys(this._headersName)) {
            const headerName = this._headersName[name];
            let header = this._headers[name];

            if (isArray(header) && 1 === header.length) {
                header = header[0];
            }

            headers[headerName] = isArray(header) ? header.map(String) : String(header);
        }

        return headers;
    }
}
