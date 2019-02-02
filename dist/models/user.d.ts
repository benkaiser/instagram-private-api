import { FriendshipStatus } from './friendship-status';
import { BaseModel } from './base-model';
export declare class User extends BaseModel {
    pk: number;
    username: string;
    full_name: string;
    is_private: boolean;
    profile_pic_url: string;
    profile_pic_id: string;
    is_verified: boolean;
    is_unpublished: boolean;
    is_favorite: boolean;
    has_anonymous_profile_picture: boolean;
    friendship_status: FriendshipStatus;
}
