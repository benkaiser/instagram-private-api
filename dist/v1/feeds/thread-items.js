const _ = require('lodash');
const util = require('util');
const FeedBase = require('./feed-base');
const ThreadItem = require('../thread-item');
const Request = require('../../request');
class ThreadItemsFeed extends FeedBase {
    constructor(session, threadId, limit) {
        super(...arguments);
        this.threadId = threadId;
        this.limit = parseInt(limit) || null;
    }
    get() {
        const that = this;
        return new Request(this.session)
            .setMethod('GET')
            .setResource('threadsShow', {
            cursor: this.getCursor(),
            threadId: this.threadId,
        })
            .send()
            .then(json => {
            const items = _.map(json.thread.items, item => new ThreadItem(that.session, item));
            that.moreAvailable = json.thread.has_older;
            if (that.isMoreAvailable())
                that.setCursor(json.thread.oldest_cursor);
            return items;
        });
    }
}
module.exports = ThreadItemsFeed;
//# sourceMappingURL=thread-items.js.map