import { Media } from '../../models/media';
import FeedBase = require('./feed-base');
export declare class UserMediaFeed extends FeedBase {
    accountId: any;
    limit: number | null;
    constructor(session: any, accountId: any, limit?: number | null);
    get(): Promise<Media[]>;
}
