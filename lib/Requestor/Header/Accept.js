import BaseAccept from './BaseAccept';

/**
 * @memberOf Fazland.Atlante.Requestor.Header
 */
export default class Accept extends BaseAccept {
    /**
     * Constructor.
     *
     * @param {string} value
     */
    constructor(value) {
        super(value);

        if ('*' === this._type) {
            this._type = '*/*';
        }

        const parts = this._type.split('/');
        if (2 !== parts.length || ! parts[0] || ! parts[1]) {
            throw new Error('Invalid media type');
        }

        /**
         * @type {string}
         *
         * @private
         */
        this._basePart = parts[0];

        /**
         * @type {string}
         *
         * @private
         */
        this._subPart = parts[1];
    }

    /**
     * @returns {string}
     */
    get subPart() {
        return this._subPart;
    }

    /**
     * @returns {string}
     */
    get basePart() {
        return this._basePart;
    }
}
