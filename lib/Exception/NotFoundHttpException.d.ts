import HttpException from './HttpException';
import Response from "../Requester/Response";
import Request from "../Requester/Request";

declare class NotFoundHttpException extends HttpException {
    constructor(response?: Response, request?: Request);
}

export default NotFoundHttpException;
