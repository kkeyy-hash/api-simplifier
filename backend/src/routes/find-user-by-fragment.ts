// Dependencies //
import { Router, Request, Response } from "express";
import Fetch, { Response as FetchResponse } from "node-fetch";

const router: Router = Router();


// Types //
interface UserType {
    previousUsernames: string[];
    hasVerifiedBadge: boolean;
    id: number;
    name: string;
    displayName: string;
    thumbnail: string | null;
};
interface AllUsersType {
    previousPageCursor?: string;
    nextPageCursor?: string;
    data: UserType[];
};
interface ThumbnailItem {
    targetId: number;
    state: string;
    imageUrl: string;
    version: string;
};
interface ThumbnailType {
    data: ThumbnailItem[];
};


/**
 * @route   GET /api/find-user-by-fragment
 * @desc    Fetches the Roblox API to retrieve 25 players matching the username
 * @access  Public
 */
router.get("/:Username", async (Request: Request, Response: Response) => {
    const { Username } = Request.params;
    if (!Username) return Response.status(400).json({ Success: false, Message: "Username field is required" });
    if (Username.length < 3) return Response.status(400).json({ Success: false, Message: "Username field must be atleast 3 characters of length" });

    try {
        const UsersResponse: FetchResponse = await Fetch(`https://users.roblox.com/v1/users/search?keyword=${Username}&limit=25&excludeBannedUsers=true`);
        const UsersData: AllUsersType = (await UsersResponse.json()) as AllUsersType;
        const UserIds: string = UsersData.data.map((User: UserType) => User.id).join(",");

        const ThumbnailResponse: FetchResponse = await Fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${UserIds}&size=150x150&format=Png&isCircular=true`);
        const ThumbnailData: ThumbnailType = (await ThumbnailResponse.json()) as ThumbnailType;
        const UsersWithThumbnail: UserType[] = UsersData.data.map((User: UserType) => {
            const Thumb: ThumbnailItem | undefined = ThumbnailData.data.find((t: ThumbnailItem) => t.targetId === User.id);
            return {
                ...User,
                thumbnail: Thumb?.imageUrl || null
            };
        });

        return Response.status(200).json({ Success: true, Message: UsersWithThumbnail });
    } catch (Error: unknown) {
        return Response.status(400).json({ Success: false, Message: `Internal server error: ${Error}` });
    };
});

export default router;