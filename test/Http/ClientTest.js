const Client = Fazland.Atlante.Http.Client;
const RequestorInterface = Fazland.Atlante.Requestor.RequestorInterface;
const DecoratorInterface = Fazland.Atlante.Requestor.Decorator.DecoratorInterface;
const ItemInterface = Fazland.Atlante.Storage.ItemInterface;
const StorageInterface = Fazland.Atlante.Storage.StorageInterface;

const HttpException = Fazland.Atlante.Exception.HttpException;
const NoTokenAvailableException = Fazland.Atlante.Exception.NoTokenAvailableException;
const NotFoundHttpException = Fazland.Atlante.Exception.NotFoundHttpException;

const Argument = Jymfony.Component.Testing.Argument.Argument;
const Prophet = Jymfony.Component.Testing.Prophet;
const { expect } = require('chai');

describe('[Http] Client', function () {
    beforeEach(() => {
        /**
         * @type {Jymfony.Component.Testing.Prophet}
         *
         * @private
         */
        this._prophet = new Prophet();

        this._requestor = this._prophet.prophesize(RequestorInterface);
        this._client = new Client(this._requestor.reveal(), []);
    });

    afterEach(() => {
        if (this.currentTest && this.currentTest.state === 'passed') {
            this._prophet.checkPredictions();
        }
    });

    it('should forward request to requestor', async () => {
        const response = { data: {}, status: 200, statusText: 'OK' };

        this._requestor
            .request('GET', 'http://example.org/', { Accept: 'application/json' }, undefined)
            .shouldBeCalled()
            .willReturn(response)
        ;

        expect(await this._client.request('GET', 'http://example.org/'))
            .to.be.equal(response)
        ;
    });

    it('should pass request to decorators', async () => {
        const response = { data: {}, status: 200, statusText: 'OK' };
        const decorator = this._prophet.prophesize(DecoratorInterface);

        decorator.decorate(Argument.any())
            .shouldBeCalledTimes(1)
            .will(request => {
                request.url = new URL(request.url, 'http://example.org');
                return request;
            })
        ;

        this._client._decorators.push(decorator.reveal());
        this._requestor
            .request('GET', 'http://example.org/', { Accept: 'application/json' }, undefined)
            .shouldBeCalled()
            .willReturn(response)
        ;

        expect(await this._client.request('GET', '/'))
            .to.be.equal(response)
        ;
    });
});
