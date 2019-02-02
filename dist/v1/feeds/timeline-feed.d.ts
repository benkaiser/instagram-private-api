import { Media } from '../../models/media';
declare const FeedBase: any;
interface TimelineFeedGetProps {
    is_pull_to_refresh?: boolean | null;
}
export declare class TimelineFeed extends FeedBase {
    limit: number | null;
    constructor(session: any, limit?: number | null);
    get({ is_pull_to_refresh }: TimelineFeedGetProps): Promise<Media[]>;
}
export {};
