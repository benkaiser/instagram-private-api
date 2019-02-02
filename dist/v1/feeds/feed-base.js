const _ = require('lodash');
const Promise = require('bluebird');
const Exceptions = require('../../exceptions');
const EventEmitter = require('events').EventEmitter;
class FeedBase extends EventEmitter {
    constructor(session) {
        super();
        this.session = session;
        this.allResults = [];
        this.totalCollected = 0;
        this.cursor = null;
        this.moreAvailable = null;
        this.iteration = 0;
        this.parseErrorsMultiplier = 0;
    }
    all(parameters) {
        const that = this;
        parameters = _.isObject(parameters) ? parameters : {};
        _.defaults(parameters, {
            delay: 1500,
            every: 200,
            pause: 30000,
            maxErrors: 9,
            limit: this.limit,
        });
        const delay = this.iteration === 0
            ? 0
            : this.iteration % parameters.every !== 0
                ? parameters.delay
                : parameters.pause;
        return (Promise.delay(delay)
            .then(this.get.bind(this))
            .then(results => {
            that.parseErrorsMultiplier = 0;
            return results;
        })
            .catch(Exceptions.ParseError, () => {
            that.parseErrorsMultiplier++;
            if (that.parseErrorsMultiplier > parameters.maxErrors)
                throw new Exceptions.RequestsLimitError();
            return Promise.resolve([]).delay(parameters.pause * that.parseErrorsMultiplier);
        })
            .then(response => {
            const results = response.filter(that.filter).map(that.map);
            if (_.isFunction(that.reduce))
                that.allResults = that.reduce(that.allResults, results);
            that.totalCollected += response.length;
            that._handleInfinityListBug(response, results);
            that.emit('data', results);
            let exceedLimit = false;
            if ((parameters.limit && that.totalCollected > parameters.limit) ||
                that._stopAll === true)
                exceedLimit = true;
            if (that.isMoreAvailable() && !exceedLimit) {
                that.iteration++;
                return that.all(parameters);
            }
            else {
                that.iteration = 0;
                that.emit('end', that.allResults);
                return that.allResults;
            }
        }));
    }
    map(item) {
        return item;
    }
    reduce(accumulator, response) {
        return accumulator.concat(response);
    }
    filter() {
        return true;
    }
    _handleInfinityListBug(response, results) {
        const that = this;
        if (this.iteration % 2 === 0) {
            this.allResultsMap = {};
            this._allResultsLentgh = 0;
        }
        this._allResultsLentgh += response.length;
        response.forEach(result => {
            that.allResultsMap[result.id] = undefined;
        });
        if (_.keys(this.allResultsMap).length !== this._allResultsLentgh)
            this.stop();
    }
    stop() {
        this._stopAll = true;
    }
    setCursor(cursor) {
        this.cursor = cursor;
    }
    getCursor() {
        return this.cursor;
    }
    isMoreAvailable() {
        return !!this.moreAvailable;
    }
    allSafe(parameters, timeout = 10 * 60 * 1000) {
        const that = this;
        return this.all(parameters)
            .timeout(timeout || this.timeout)
            .catch(Promise.TimeoutError, reason => {
            that.stop();
            throw reason;
        });
    }
}
module.exports = FeedBase;
//# sourceMappingURL=feed-base.js.map