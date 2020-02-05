import Request from "../../Request";

declare class HttpBasicAuthenticator {
    private _auth: string;

    /**
     * Constructor.
     */
    constructor(encodedAuth: string);
    constructor(username: string, password: string);

    /**
     * Decorates the request adding basic authentication header.
     */
    decorate(request: Request): Request;
}
