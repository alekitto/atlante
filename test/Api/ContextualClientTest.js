const Argument = Jymfony.Component.Testing.Argument.Argument;
const Client = Fazland.Atlante.Api.Client;
const ErrorHandler = Jymfony.Component.Debug.ErrorHandler;
const ItemInterface = Fazland.Atlante.Storage.ItemInterface;
const NullLogger = Jymfony.Component.Logger.NullLogger;
const Prophet = Jymfony.Component.Testing.Prophet;
const RequesterInterface = Fazland.Atlante.Requester.RequesterInterface;
const StorageInterface = Fazland.Atlante.Storage.StorageInterface;
const { expect } = require('chai');

describe('[Api] ContextualClient', function () {
    let handler, prevLogger;
    before(() => {
        const warningListeners = process.listeners('warning');
        for (const listener of warningListeners) {
            if (!! listener.innerObject && (handler = listener.innerObject.getObject()) instanceof ErrorHandler) {
                prevLogger = handler.setDefaultLogger(new NullLogger());
            }
        }
    });

    after(() => {
        if (prevLogger) {
            handler.setDefaultLogger(prevLogger);
        }
    });

    beforeEach(() => {
        /**
         * @type {Jymfony.Component.Testing.Prophet}
         *
         * @private
         */
        this._prophet = new Prophet();

        this._requester = this._prophet.prophesize(RequesterInterface);
        this._tokenStorage = this._prophet.prophesize(StorageInterface);
        this._client = new Client(
            this._requester.reveal(),
            this._tokenStorage.reveal(),
            {
                base_url: 'http://example.org',
                client_id: 'foo_id',
                client_secret: 'foo_secret',
            }
        );
    });

    afterEach(() => {
        this._prophet.checkPredictions();
    });

    it('should use user token to make request', async () => {
        const clientToken = this._prophet.prophesize(ItemInterface);
        clientToken.isHit().willReturn(true);
        clientToken.get().willReturn('TEST TOKEN');

        const response = { data: {}, status: 200, statusText: 'OK' };

        this._tokenStorage.getItem('access_token')
            .shouldBeCalled()
            .willReturn(clientToken)
        ;

        this._requester
            .request('GET', 'http://example.org/', {
                Authorization: 'Bearer TEST TOKEN',
                Accept: 'application/json',
            }, null)
            .shouldBeCalled()
            .willReturn(response)
        ;

        expect(await this._client.request('GET', '/'))
            .to.be.equal(response)
        ;
    });

    it('should request a new token via refresh token', async () => {
        const clientToken = this._prophet.prophesize(ItemInterface);
        clientToken.isHit().willReturn(false);
        clientToken.set('TEST TOKEN').willReturn();
        clientToken.get().willReturn('TEST TOKEN');
        clientToken.expiresAfter(3540).willReturn();

        const refreshToken = this._prophet.prophesize(ItemInterface);
        refreshToken.isHit().willReturn(true);
        refreshToken.get().willReturn('REFRESH TOKEN');
        refreshToken.set('REFRESH AGAIN').willReturn();

        const response = { data: {}, status: 200, statusText: 'OK' };
        const tokenResponse = {
            data: {
                access_token: 'TEST TOKEN',
                expires_in: 3600,
                refresh_token: 'REFRESH AGAIN',
            }, status: 200, statusText: 'OK',
        };

        this._tokenStorage.getItem('access_token').willReturn(clientToken);
        this._tokenStorage.getItem('refresh_token').willReturn(refreshToken);

        this._tokenStorage.save(clientToken).shouldBeCalled();
        this._tokenStorage.save(refreshToken).shouldBeCalled();

        this._requester
            .request('POST', 'http://example.org/token', {
                'Content-Type': 'application/json'
            }, JSON.stringify({
                grant_type: 'refresh_token',
                client_id: 'foo_id',
                client_secret: 'foo_secret',
                refresh_token: 'REFRESH TOKEN',
            }))
            .shouldBeCalled()
            .willReturn(tokenResponse)
        ;

        this._requester
            .request('GET', 'http://example.org/', {
                Authorization: 'Bearer TEST TOKEN',
                Accept: 'application/json',
            }, null)
            .willReturn(response)
        ;

        expect(await this._client.request('GET', '/'))
            .to.be.equal(response)
        ;
    });

    it ('authenticate should request a new token', async () => {
        const clientToken = this._prophet.prophesize(ItemInterface);
        clientToken.isHit().willReturn(false);
        clientToken.set('TEST TOKEN').willReturn();
        clientToken.expiresAfter(3540).willReturn();

        const refreshToken = this._prophet.prophesize(ItemInterface);
        refreshToken.isHit().willReturn(true);
        refreshToken.set('REFRESH TOKEN').willReturn();

        this._tokenStorage.getItem('access_token').willReturn(clientToken);
        this._tokenStorage.getItem('refresh_token').willReturn(refreshToken);

        this._tokenStorage.save(clientToken).shouldBeCalled();
        this._tokenStorage.save(refreshToken).shouldBeCalled();

        const tokenResponse = {
            data: {
                access_token: 'TEST TOKEN',
                expires_in: 3600,
                refresh_token: 'REFRESH TOKEN',
            }, status: 200, statusText: 'OK',
        };

        this._requester
            .request('POST', 'http://example.org/token', {
                'Content-Type': 'application/json'
            }, JSON.stringify({
                grant_type: 'password',
                client_id: 'foo_id',
                client_secret: 'foo_secret',
                username: 'username',
                password: 'password',
            }))
            .shouldBeCalled()
            .willReturn(tokenResponse)
        ;

        await this._client.authenticate('username', 'password');
    });

    it ('requests after token expiration should refresh the token', async () => {
        const clientToken = this._prophet.prophesize(ItemInterface);
        clientToken.isHit().willReturn(false);
        clientToken.set('TEST TOKEN').willReturn();
        clientToken.expiresAfter(3540).willReturn();

        const refreshToken = this._prophet.prophesize(ItemInterface);
        refreshToken.isHit().willReturn(true);
        refreshToken.set('REFRESH TOKEN').willReturn();
        refreshToken.get().willReturn('OLD REFRESH TOKEN');

        this._tokenStorage.getItem('access_token').will(async () => {
            await __jymfony.sleep(50);

            return clientToken.reveal();
        });
        this._tokenStorage.getItem('refresh_token').will(async () => {
            await __jymfony.sleep(50);

            return refreshToken.reveal();
        });

        this._tokenStorage.save(clientToken)
            .shouldBeCalledTimes(1)
            .will(async function () {
                clientToken.isHit().willReturn(true);
                clientToken.get().willReturn('TEST TOKEN');
            });

        this._tokenStorage.save(refreshToken)
            .shouldBeCalledTimes(1)
            .will(async () => {
                await __jymfony.sleep(20);
            });

        const tokenResponse = {
            data: {
                access_token: 'TEST TOKEN',
                expires_in: 3600,
                refresh_token: 'REFRESH TOKEN',
            }, status: 200, statusText: 'OK',
        };

        this._requester.request('GET', 'http://example.org/', Argument.any(), Argument.any())
            .willReturn({ data: {}, status: 200, statusText: 'OK' }).shouldBeCalledTimes(1);
        this._requester.request('POST', 'http://example.org/resources', Argument.any(), Argument.any())
            .willReturn({ data: {}, status: 200, statusText: 'OK' }).shouldBeCalledTimes(1);
        this._requester.request('PATCH', 'http://example.org/res1', Argument.any(), Argument.any())
            .willReturn({ data: {}, status: 200, statusText: 'OK' }).shouldBeCalledTimes(1);

        this._requester
            .request('POST', 'http://example.org/token', {
                'Content-Type': 'application/json'
            }, JSON.stringify({
                grant_type: 'refresh_token',
                client_id: 'foo_id',
                client_secret: 'foo_secret',
                refresh_token: 'OLD REFRESH TOKEN',
            }))
            .shouldBeCalledTimes(1)
            .will(async () => {
                await __jymfony.sleep(100);

                return tokenResponse;
            })
        ;

        const r1 = this._client.get('/');
        const r2 = this._client.post('/resources');
        const r3 = this._client.patch('/res1');

        await Promise.all([ r1, r2, r3 ]);
    });
});
