const Client = Fazland.Atlante.Api.Client;
const RequestorInterface = Fazland.Atlante.Requestor.RequestorInterface;
const ItemInterface = Fazland.Atlante.Storage.ItemInterface;
const StorageInterface = Fazland.Atlante.Storage.StorageInterface;

const HttpException = Fazland.Atlante.Exception.HttpException;
const NoTokenAvailableException = Fazland.Atlante.Exception.NoTokenAvailableException;
const NotFoundHttpException = Fazland.Atlante.Exception.NotFoundHttpException;

const Argument = Jymfony.Component.Testing.Argument.Argument;
const Prophet = Jymfony.Component.Testing.Prophet;
const { expect } = require('chai');

describe('[Api] Client', function () {
    beforeEach(() => {
        /**
         * @type {Jymfony.Component.Testing.Prophet}
         *
         * @private
         */
        this._prophet = new Prophet();

        this._requestor = this._prophet.prophesize(RequestorInterface);
        this._tokenStorage = this._prophet.prophesize(StorageInterface);
        this._client = new Client(this._requestor.reveal(), this._tokenStorage.reveal(), {
            base_url: 'http://example.org',
            client_id: 'foo_id',
            client_secret: 'foo_secret',
            version: '20181015',
        });

        const userToken = this._prophet.prophesize(ItemInterface);
        userToken.isHit().willReturn(false);

        this._tokenStorage.getItem('access_token').willReturn(userToken);
        this._tokenStorage.getItem('refresh_token').willReturn(userToken);
    });

    afterEach(() => {
        if (this.currentTest && 'passed' === this.currentTest.state) {
            this._prophet.checkPredictions();
        }
    });

    it('should use client token to make request', async () => {
        const clientToken = this._prophet.prophesize(ItemInterface);
        clientToken.isHit().willReturn(true);
        clientToken.get().willReturn('TEST TOKEN');

        const response = { data: {}, status: 200, statusText: 'OK' };

        this._tokenStorage.getItem('fazland_atlante_client_token')
            .shouldBeCalled()
            .willReturn(clientToken)
        ;

        this._requestor.request(Argument.cetera()).will((...args) => dd(args));

        this._requestor
            .request('GET', 'http://example.org/', {
                Authorization: 'Bearer TEST TOKEN',
                Accept: 'application/json; version=20181015',
            }, null)
            .shouldBeCalled()
            .willReturn(response)
        ;

        expect(await this._client.request('GET', '/'))
            .to.be.equal(response)
        ;
    });

    it('should request client token if not in storage', async () => {
        const clientToken = this._prophet.prophesize(ItemInterface);
        clientToken.isHit().willReturn(false);
        clientToken.set('TEST TOKEN').shouldBeCalled();
        clientToken.expiresAfter(3540).shouldBeCalled();

        const response = { data: {}, status: 200, statusText: 'OK' };

        this._tokenStorage.getItem('fazland_atlante_client_token')
            .shouldBeCalled()
            .willReturn(clientToken)
        ;
        this._tokenStorage.save(clientToken).shouldBeCalled();

        this._requestor
            .request('POST', 'http://example.org/token', {}, {
                grant_type: 'client_credentials',
                client_id: 'foo_id',
                client_secret: 'foo_secret',
            })
            .shouldBeCalled()
            .willReturn({
                data: { access_token: 'TEST TOKEN', expires_in: 3600 },
                status: 200,
            })
        ;

        this._requestor.request('GET', 'http://example.org/', Argument.cetera())
            .willReturn(response)
        ;

        expect(await this._client.request('GET', '/')).to.be.equal(response);
    });

    it('should throw on 404', async () => {
        const clientToken = this._prophet.prophesize(ItemInterface);
        clientToken.isHit().willReturn(true);
        clientToken.get().willReturn('TEST TOKEN');

        const response = { data: {}, status: 404, statusText: 'Not Found' };

        this._tokenStorage.getItem('fazland_atlante_client_token').willReturn(clientToken);
        this._requestor.request('GET', 'http://example.org/', Argument.cetera()).willReturn(response);

        let caughtErr;
        try {
            await this._client.request('GET', '/');
        } catch (e) {
            caughtErr = e;
        }

        expect(caughtErr).to.be.instanceOf(NotFoundHttpException);
        expect(caughtErr.response).to.be.equal(response);
    });

    it('should throw on http error', async () => {
        const clientToken = this._prophet.prophesize(ItemInterface);
        clientToken.isHit().willReturn(true);
        clientToken.get().willReturn('TEST TOKEN');

        const response = { data: {}, status: 500, statusText: 'Internal Server Error' };

        this._tokenStorage.getItem('fazland_atlante_client_token').willReturn(clientToken);
        this._requestor.request('GET', 'http://example.org/', Argument.cetera()).willReturn(response);

        let caughtErr;
        try {
            await this._client.request('GET', '/');
        } catch (e) {
            caughtErr = e;
        }

        expect(caughtErr).to.be.instanceOf(HttpException);
        expect(caughtErr.response).to.be.equal(response);
        expect(caughtErr.message).to.be.equal('Internal Server Error');
    });

    it('should throw on error requesting token', async () => {
        const clientToken = this._prophet.prophesize(ItemInterface);
        clientToken.isHit().willReturn(false);

        const response = { data: {}, status: 404, statusText: 'Not Found' };

        this._tokenStorage.getItem('fazland_atlante_client_token').willReturn(clientToken);
        this._requestor.request('POST', 'http://example.org/token', Argument.cetera()).willReturn(response);

        let caughtErr;
        try {
            await this._client.request('GET', '/');
        } catch (e) {
            caughtErr = e;
        }

        expect(caughtErr).to.be.instanceOf(NoTokenAvailableException);
    });

    it ('requests after token expiration should refresh the token', async () => {
        const clientToken = this._prophet.prophesize(ItemInterface);
        clientToken.isHit().willReturn(false);
        clientToken.set('TEST TOKEN').willReturn();
        clientToken.expiresAfter(3540).willReturn();

        this._tokenStorage.getItem('fazland_atlante_client_token').will(async () => {
            await __jymfony.sleep(50);

            return clientToken.reveal();
        });

        this._tokenStorage.save(clientToken)
            .shouldBeCalledTimes(1)
            .will(async function () {
                clientToken.isHit().willReturn(true);
                clientToken.get().willReturn('TEST TOKEN');
            });

        const tokenResponse = {
            data: {
                access_token: 'TEST TOKEN',
                expires_in: 3600,
            }, status: 200, statusText: 'OK',
        };

        this._requestor.request('GET', 'http://example.org/', Argument.any(), Argument.any())
            .willReturn({ data: {}, status: 200, statusText: 'OK' }).shouldBeCalledTimes(1);
        this._requestor.request('POST', 'http://example.org/resources', Argument.any(), Argument.any())
            .willReturn({ data: {}, status: 200, statusText: 'OK' }).shouldBeCalledTimes(1);
        this._requestor.request('PATCH', 'http://example.org/res1', Argument.any(), Argument.any())
            .willReturn({ data: {}, status: 200, statusText: 'OK' }).shouldBeCalledTimes(1);

        this._requestor
            .request('POST', 'http://example.org/token', {}, {
                grant_type: 'client_credentials',
                client_id: 'foo_id',
                client_secret: 'foo_secret',
            })
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
