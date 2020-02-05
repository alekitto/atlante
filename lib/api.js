/* eslint-disable sort-imports */

import Client from './Api/Client';

import HttpException from './Exception/HttpException';
import NotFoundHttpException from './Exception/NotFoundHttpException';
import NoTokenAvailableException from './Exception/NoTokenAvailableException';

import HttpClient from './Http/Client';

import HttpBasicAuthenticator from './Requestor/Decorator/Authentication/HttpBasicAuthenticator';
import OAuthClientTokenAuthenticator from './Requestor/Decorator/Authentication/OAuthClientTokenAuthenticator';
import OAuthTokenPasswordAuthenticator from './Requestor/Decorator/Authentication/OAuthTokenPasswordAuthenticator';

import BodyConverterDecorator from './Requestor/Decorator/BodyConverterDecorator';
import UrlDecorator from './Requestor/Decorator/UrlDecorator';
import VersionSetterDecorator from './Requestor/Decorator/VersionSetterDecorator';

import Accept from './Requestor/Header/Accept';
import BaseAccept from './Requestor/Header/BaseAccept';

import Headers from './Requestor/Headers';
import WebRequestor from './Requestor/WebRequestor';

import JSONMarshaller from './Storage/Marshaller/JSONMarshaller';
import NullMarshaller from './Storage/Marshaller/NullMarshaller';

import AbstractStorage from './Storage/AbstractStorage';
import CookieStorage from './Storage/CookieStorage';
import ChainStorage from './Storage/ChainStorage';
import InMemoryStorage from './Storage/InMemoryStorage';
import Item from './Storage/Item';
import ProvidedTokenStorage from './Storage/ProvidedTokenStorage';
import WebLocalStorage from './Storage/WebLocalStorage';

import ArrayUtils from './Utils/ArrayUtils';

export default {
    Api: { Client },
    Exception: {
        HttpException,
        NotFoundHttpException,
        NoTokenAvailableException,
    },
    Http: {
        Client: HttpClient,
    },
    Requestor: {
        Decorator: {
            Authentication: {
                HttpBasicAuthenticator,
                OAuthClientTokenAuthenticator,
                OAuthTokenPasswordAuthenticator,
            },
            BodyConverterDecorator,
            UrlDecorator,
            VersionSetterDecorator,
        },
        Header: {
            Accept,
            BaseAccept,
        },
        Headers,
        WebRequestor,
    },
    Storage: {
        Marshaller: { JSONMarshaller, NullMarshaller },
        AbstractStorage,
        ChainStorage,
        CookieStorage,
        InMemoryStorage,
        Item,
        ProvidedTokenStorage,
        WebLocalStorage,
    },
    Utils: { ArrayUtils },
};
