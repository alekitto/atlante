import BaseAuthenticator, { AuthFlowDisplay, OpenidAuthenticatorConfiguration } from "./BaseAuthenticator";
import RequesterInterface from "../../../RequesterInterface";
import StorageInterface from "../../../../Storage/StorageInterface";

declare class CodeFlowAuthenticator extends BaseAuthenticator {
    constructor(requester: RequesterInterface, tokenStorage: StorageInterface, config: OpenidAuthenticatorConfiguration);

    /**
     * @inheritdoc
     */
    startAuthorization(callbackUri: string, display?: AuthFlowDisplay, state?: string): Promise<never>;

    /**
     * Exchanges an authorization code with an access token.
     */
    authenticateFromCode(code: string, callbackUri: string): Promise<void>;
}

export default CodeFlowAuthenticator;
