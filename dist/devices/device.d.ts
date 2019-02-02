import * as _ from 'lodash';
export declare class Device {
    username: string;
    language: string;
    static appUserAgentTemplate: _.TemplateExecutor;
    static webUserAgentTemplate: _.TemplateExecutor;
    deviceString: string;
    android_version: string;
    android_release: string;
    model: string;
    build: string;
    md5: string;
    uuid: string;
    phoneId: string;
    adid: string;
    id: string;
    private payload;
    constructor(username: string, language?: string);
    userAgent(version: string): string;
    userAgentWeb(version: string): string;
}
