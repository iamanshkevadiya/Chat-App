import {StreamChat} from "stream-chat";
import "dotenv/config";

const apiKey = process.env.STREAM_API_KEY || "yw7bussr5yx4";
const apiSecret = process.env.STREAM_API_SECRET || "a79ng7gjr5hpqvzrgk2ppwdccje4bum5htqf8m4pw9z8rxukgfnyeejz6cunvq83";

if (!apiKey || !apiSecret) {
    console.error("stream api key or secret is missing");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => { 
    try {
        await streamClient.upsertUser([userData])
        return userData

    } catch (error) {
        console.error("Error creating Stream user:", error);
    }
}
export const generateStreamToken = (userId) => {}