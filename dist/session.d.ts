import { Device } from './devices/device';
import CookieStorage = require('./v1/cookie-storage');
declare class Session {
    device: Device;
    cookieStore: CookieStorage;
    private jar;
    constructor(device: Device, cookieStore: CookieStorage, proxy?: string);
    private _proxyUrl;
    proxyUrl: string;
    readonly session_id: string;
    readonly uuid: string;
    readonly phone_id: string;
    readonly advertising_id: string;
    readonly CSRFToken: any;
    static create(device: any, storage: any, username: any, password: any, proxy: any): any;
    static login(session: any, username: any, password: any): any;
    setDevice(device: Device): this;
    getAccountId(): any;
    setProxy(url: any): this;
    getAccount(): any;
    destroy(): any;
    loginFlow(concurrency?: number): any;
    preLoginFlow(concurrency?: number): any;
}
export = Session;
