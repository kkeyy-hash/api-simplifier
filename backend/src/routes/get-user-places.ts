// Dependencies //
import { Router, Request, Response } from "express";
import Fetch, { Response as FetchResponse } from "node-fetch";

const router: Router = Router();


// Types //
interface UserType {
    data: [
        {
            requestedUsername: string;
            hasVerifiedBadge: boolean;
            id: number;
            name: string;
            displayName: string;
        }
    ];
};
interface GameType {
    id: number;
    name: string;
    description: string | null;
    creator: {
        id: number;
        type: string;
    };
    rootPlace: {
        id: number;
        type: string;
    };
    created: string;
    updated: string;
    placeVisits: string;
    thumbnail: string | null;
};
interface AllGamesType {
    previousPageCursor?: string;
    nextPageCursor?: string;
    data: [];
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
 * @route   GET /api/get-user-places
 * @desc    Fetches the Roblox API to retrieve public places of a player
 * @access  Public
 */
router.get("/:Username", async (Request: Request, Response: Response) => {
    const { Username } = Request.params;
    if (!Username) return Response.status(400).json({ Success: false, Message: "Username field is required" });

    try {
        const UserResponse: FetchResponse = await Fetch(`https://users.roblox.com/v1/usernames/users`, { method: "POST", body: JSON.stringify({ "usernames": [Username], "excludeBannedUsers": true }) });
        const UserData: UserType = (await UserResponse.json()) as UserType;
        if (!UserData || !UserData.data || !UserData.data[0]) return Response.status(400).json({ Success: false, Message: "Username is invalid" });

        const GamesResponse: FetchResponse = await Fetch(`https://games.roblox.com/v2/users/${UserData.data[0].id}/games?sortOrder=Asc`);
        const GamesData: AllGamesType = (await GamesResponse.json()) as AllGamesType;
        const GameIds: string = GamesData.data.map((Game: GameType) => Game.rootPlace.id).join(",");
        
        const ThumbnailResponse: FetchResponse = await Fetch(`https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${GameIds}&size=256x256&format=Png&isCircular=true`);
        const ThumbnailData: ThumbnailType = (await ThumbnailResponse.json()) as ThumbnailType;
        const GamesWithThumbnails: GameType[] = GamesData.data.map((Game: GameType) => {
            const Thumb: ThumbnailItem | undefined = ThumbnailData.data.find((t: ThumbnailItem) => t.targetId === Game.rootPlace.id);
            return {
                ...Game,
                thumbnail: Thumb?.imageUrl || null
            };
        });

        return Response.status(200).json({ Success: true, Message: GamesWithThumbnails });
    } catch (Error: unknown) {
        return Response.status(400).json({ Success: false, Message: `Internal server error: ${Error}` });
    };
});

export default router;