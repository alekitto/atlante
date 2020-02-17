import BaseAuthenticator, { AuthFlowDisplay } from "./BaseAuthenticator";

declare class CodeFlowAuthenticator extends BaseAuthenticator {
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
