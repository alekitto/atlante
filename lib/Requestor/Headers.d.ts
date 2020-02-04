import Accept from "./Header/Accept";

declare class Headers {
    /**
     * Constructor.
     */
    constructor(headers?: Record<string, string|string[]> | Headers);

    /**
     * Sets an header.
     */
    set(name: 'Accept', value: string | Accept): Headers;
    set(name: string, value: string | Accept | string[]): Headers;

    /**
     * Gets an header by name.
     */
    get(name: string): string | Accept | string[] | undefined;

    /**
     * Checks whether an header is present.
     */
    has(name: string): boolean;

    /**
     * Removes an header.
     */
    remove(name: string): Headers;

    /**
     * Adds an header.
     */
    add(name: 'Accept', value: string | Accept): Headers;
    add(name: string, value: string | Accept | string[]): Headers;
}

export default Headers;
