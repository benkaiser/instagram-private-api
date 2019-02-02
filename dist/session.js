"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const _ = require("lodash");
const Chance = require("chance");
const Exceptions = require("./exceptions");
const CONSTANTS = require("./constants/constants");
const Helpers = require("./helpers");
const Bluebird = require("bluebird");
const internal_1 = require("./v1/internal");
const story_tray_feed_1 = require("./v1/feeds/story-tray-feed");
const timeline_feed_1 = require("./v1/feeds/timeline-feed");
const Account = require("./v1/account");
const Request = require("./request");
const Inbox = require("./v1/feeds/inbox");
const Relationship = require("./v1/relationship");
class Session {
    constructor(device, cookieStore, proxy) {
        this.device = device;
        this.cookieStore = cookieStore;
        this.jar = Request.jar(cookieStore.store);
        if (_.isString(proxy) && !_.isEmpty(proxy))
            this.proxyUrl = proxy;
    }
    get proxyUrl() {
        return this._proxyUrl;
    }
    set proxyUrl(val) {
        if (!Helpers.isValidUrl(val) && val !== null)
            throw new Error('`proxyUrl` argument is not an valid url');
        this._proxyUrl = val;
    }
    get session_id() {
        const chance = new Chance(`${this.device.username}${Math.round(Date.now() / 3600000)}`);
        return chance.guid();
    }
    get uuid() {
        return this.device.uuid;
    }
    get phone_id() {
        return this.device.phoneId;
    }
    get advertising_id() {
        return this.device.adid;
    }
    get CSRFToken() {
        const cookies = this.jar.getCookies(CONSTANTS.HOST);
        const item = _.find(cookies, { key: 'csrftoken' });
        return item ? item.value : 'missing';
    }
    static create(device, storage, username, password, proxy) {
        const session = new Session(device, storage);
        if (_.isString(proxy) && !_.isEmpty(proxy))
            session.proxyUrl = proxy;
        return session
            .getAccountId()
            .then(() => session)
            .catch(Exceptions.CookieNotValidError, () => Session.login(session, username, password));
    }
    static login(session, username, password) {
        return Bluebird.try(() => __awaiter(this, void 0, void 0, function* () {
            yield session.preLoginFlow();
            yield new Request(session)
                .setResource('login')
                .setMethod('POST')
                .setData({
                username,
                password,
                guid: session.uuid,
                phone_id: session.phone_id,
                adid: session.adid,
                login_attempt_count: 0,
            })
                .signPayload()
                .send();
            yield session.loginFlow();
            return session;
        }))
            .catch(Exceptions.CheckpointError, (error) => __awaiter(this, void 0, void 0, function* () {
            yield session
                .getAccountId()
                .catch(Exceptions.CookieNotValidError, () => {
                throw error;
            });
            return session;
        }))
            .catch(error => {
            if (error.name === 'RequestError' && _.isObject(error.json)) {
                if (error.json.invalid_credentials)
                    throw new Exceptions.AuthenticationError(error.message);
                if (error.json.error_type === 'inactive user')
                    throw new Exceptions.AccountBanned(`${error.json.message} ${error.json.help_url}`);
            }
            throw error;
        });
    }
    setDevice(device) {
        this.device = device;
        return this;
    }
    getAccountId() {
        return this.cookieStore.getAccountId();
    }
    setProxy(url) {
        this.proxyUrl = url;
        return this;
    }
    getAccount() {
        return this.getAccountId().then(id => Account.getById(this, id));
    }
    destroy() {
        return new Request(this)
            .setMethod('POST')
            .setResource('logout')
            .generateUUID()
            .send()
            .then(response => {
            this.cookieStore.destroy();
            delete this.cookieStore;
            return response;
        });
    }
    loginFlow(concurrency = 1) {
        return Bluebird.map([
            new timeline_feed_1.TimelineFeed(this).get({}),
            new story_tray_feed_1.StoryTrayFeed(this).get(),
            new Inbox(this).get(),
            Relationship.getBootstrapUsers(this),
            internal_1.Internal.getRankedRecipients(this, 'reshare'),
            internal_1.Internal.getPresences(this),
            internal_1.Internal.getRecentActivityInbox(this),
            internal_1.Internal.getProfileNotice(this),
            internal_1.Internal.getExploreFeed(this),
        ], () => true, { concurrency });
    }
    preLoginFlow(concurrency = 1) {
        return Bluebird.map([
            internal_1.Internal.qeSync(this, true),
            internal_1.Internal.launcherSync(this, true),
            internal_1.Internal.logAttribution(this),
            internal_1.Internal.fetchZeroRatingToken(this),
            internal_1.Internal.setContactPointPrefill(this),
        ], () => true, { concurrency })
            .catch(error => {
            throw new Error(error.message);
        });
    }
}
module.exports = Session;
//# sourceMappingURL=session.js.map