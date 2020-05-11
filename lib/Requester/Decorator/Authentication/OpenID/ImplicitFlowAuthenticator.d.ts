import BaseAuthenticator, { AuthFlowDisplay, OpenidAuthenticatorConfiguration } from './BaseAuthenticator';
import RequesterInterface from "../../../RequesterInterface";
import StorageInterface from "../../../../Storage/StorageInterface";

declare class ImplicitFlowAuthenticator extends BaseAuthenticator {
    private readonly _lastCallbackUri: null | string;

    constructor(requester: RequesterInterface, tokenStorage: StorageInterface, config: OpenidAuthenticatorConfiguration);

    /**
     * @inheritdoc
     */
    startAuthorization(callbackUri: string, display: AuthFlowDisplay, state: string): Promise<never>;

    /**
     * Finish implicit authorization flow.
     *
     * @returns {Promise<void>}
     */
    authorize(options?: { state: string, fragment?: string }): Promise<void>;

    /**
     * @inheritdoc
     */
    protected _refreshToken(): Promise<string|null>;
}
