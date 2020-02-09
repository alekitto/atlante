import RequesterInterface from './RequesterInterface';
import Response from './Response'

/**
 * Requester that can be used in a browser context.
 */
declare class WebRequester implements RequesterInterface {
    /**
     * Constructor.
     */
    constructor(xmlHttp?: typeof XMLHttpRequest);

    /**
     * @inheritdoc
     */
    request<T = any>(method: string, path: string, headers?: any, requestData?: any): Promise<Response<T>>;
}

export default WebRequester;
