/* eslint-disable sort-imports */

import Client from './Api/Client';

import HttpException from './Exception/HttpException';
import NotFoundHttpException from './Exception/NotFoundHttpException';
import NoTokenAvailableException from './Exception/NoTokenAvailableException';

import HttpClient from './Http/Client';

import HttpBasicAuthenticator from './Requester/Decorator/Authentication/HttpBasicAuthenticator';
import OAuthClientTokenAuthenticator from './Requester/Decorator/Authentication/OAuthClientTokenAuthenticator';
import OAuthTokenPasswordAuthenticator from './Requester/Decorator/Authentication/OAuthTokenPasswordAuthenticator';

import BodyConverterDecorator from './Requester/Decorator/BodyConverterDecorator';
import UrlDecorator from './Requester/Decorator/UrlDecorator';
import VersionSetterDecorator from './Requester/Decorator/VersionSetterDecorator';

import Accept from './Requester/Header/Accept';
import BaseAccept from './Requester/Header/BaseAccept';

import Headers from './Requester/Headers';
import WebRequester from './Requester/WebRequester';

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
    Requester: {
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
        WebRequester,
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
