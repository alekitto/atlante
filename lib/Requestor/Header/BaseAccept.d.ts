declare abstract class BaseAccept {
    protected _type: string;

    private _quality: number;
    private _value: string;
    private _normalized: string;
    private _parameters: Record<string, string>;

    /**
     * Constructor.
     */
    protected constructor(value: string);

    public readonly normalizedValue: string;
    public readonly value: string;
    public readonly quality: number;
    public readonly parameters: Record<string, string>;

    /**
     * Adds a parameter to the accept header.
     */
    setParameter(key: string, value: string): void;

    getParameter(key: string, default_?: any): any;
    hasParameter(key: string): boolean;

    /**
     * Parses accept header parameters.
     */
    private _parseParameters(acceptPart: string): [string, Record<string, string>];
    private _buildParametersString(parameters: string): string;
}

export default BaseAccept;
