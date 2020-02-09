import Request from "../Requester/Request";
import Response from "../Requester/Response";

declare class HttpException extends Error {
    /**
     * Constructor.
     */
    constructor(message?: string, response?: Response, request?: Request);

    /**
     * Request sent to the API.
     */
    readonly request: Request|undefined;

    /**
     * Response received by the API.
     */
    readonly response: Response|undefined;
}

export default HttpException;
