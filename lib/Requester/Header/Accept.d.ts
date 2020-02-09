import BaseAccept from './BaseAccept';

declare class Accept extends BaseAccept {
    private _basePart: string;
    private _subPart: string;

    /**
     * Constructor.
     */
    constructor(value: string);

    public readonly subPart: string;
    public readonly basePart: string;
}

export default Accept;
