import Headers from './Headers';

declare interface HttpMessage<T = any> {
    readonly headers: Headers;
}

export default HttpMessage;
