interface ServerConfigurationProps {
    issuer: string;
    authorization_endpoint: string;
    token_endpoint: string;
    end_session_endpoint: string;
    userinfo_endpoint: string;
    jwks_uri: string;
}

declare class ServerConfiguration {
    public readonly issuer: string;
    public readonly authorizationEndpoint: string;
    public readonly tokenEndpoint: string;
    public readonly logoutEndpoint: string;
    public readonly userinfoEndpoint: string;

    private _jwks_uri: string;

    constructor(config: ServerConfigurationProps);
}

export default ServerConfiguration;
