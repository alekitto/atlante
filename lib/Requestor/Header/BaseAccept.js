import '@jymfony/util/lib/String/trim';
import '@jymfony/util/lib/Object/sort';

/**
 * @memberOf Fazland.Atlante.Requestor.Header
 */
export default class BaseAccept {
    /**
     * Constructor.
     *
     * @param {string} value
     */
    constructor(value) {
        const [ type, parameters ] = this._parseParameters(value);

        if (!! parameters.q) {
            /**
             * @type {number}
             *
             * @private
             */
            this._quality = parseFloat(parameters.q);
            delete parameters.q;
        } else {
            this._quality = 1.0;
        }

        /**
         * @type {string}
         *
         * @private
         */
        this._value = value;

        /**
         * @type {string}
         *
         * @protected
         */
        this._type = type.trim().toLowerCase();

        /**
         * @type {Object<string, string>}
         *
         * @private
         */
        this._parameters = parameters;
    }

    /**
     * Gets the string representation of this header.
     *
     * @return {string}
     */
    toString() {
        return this.normalizedValue;
    }

    /**
     * @returns {string}
     */
    get normalizedValue() {
        return this._type + (0 < Object.keys(this._parameters).length ? '; ' + this._buildParametersString(this._parameters) : '');
    }

    /**
     * @returns {string}
     */
    get value() {
        return this._value;
    }

    /**
     * @returns {string}
     */
    get type() {
        return this._type;
    }

    /**
     * @return float
     */
    get quality() {
        return this._quality;
    }

    /**
     * @return {Object.<string, string>}
     */
    get parameters() {
        return { ...this._parameters };
    }

    /**
     * Adds a parameter to the accept header.
     *
     * @param {string} key
     * @param {string} value
     */
    setParameter(key, value) {
        if (undefined === value || null === value) {
            delete this._parameters[key];
            return;
        }

        this._parameters[key] = String(value);
    }


    /**
     * @param {string} key
     * @param {*} default_
     *
     * @returns {string|*}
     */
    getParameter(key, default_ = null) {
        return undefined !== this._parameters[key] ? this._parameters[key] : default_;
    }

    /**
     * @param {string} key
     *
     * @returns {boolean}
     */
    hasParameter(key) {
        return undefined !== this._parameters[key];
    }

    /**
     * Parses accept header parameters.
     *
     * @param {string} acceptPart
     *
     * @returns {[string, Object.<string, string>]}
     *
     * @private
     */
    _parseParameters(acceptPart) {
        const [ type, ...parts ] = acceptPart.split(';');

        const parameters = {};
        for (let part of parts) {
            part = part.split('=');
            if (2 !== part.length) {
                continue;
            }

            const key = part[0].trim().toLowerCase();
            parameters[key] = __jymfony.trim(part[1], ' "');
        }

        return [ type, parameters ];
    }

    /**
     * @param {Object.<string, string>} parameters
     *
     * @returns {string}
     *
     * @private
     */
    _buildParametersString(parameters) {
        const parts = [];

        parameters = Object.ksort(parameters);
        for (const [ key, val ] of Object.entries(parameters)) {
            parts.push(String(key) + '=' + String(val));
        }

        return parts.join('; ');
    }
}
