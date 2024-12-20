import PocketBase from "pocketbase";
import { getActiveProfile, saveToken, loadToken } from "../utils.js";
import { ListOptions } from "../types.js";

export let pb: PocketBase;

export function initPocketBase() {
    const profile = getActiveProfile();
    if (!profile) {
        console.error("No active profile. Please add a profile first with: profile add <name> <url> <email> <password>");
        process.exit(1);
    }
    pb = new PocketBase(profile.url);
}

export async function adminLogin(): Promise<void> {
    try {
        const profile = getActiveProfile();
        if (!profile) {
            throw new Error("No active profile");
        }
        
        const authData = await pb.admins.authWithPassword(
            profile.adminEmail,
            profile.adminPassword
        );
        saveToken(pb.authStore.token);
        console.log("Successfully logged in as admin");
    } catch (error) {
        console.error("Failed to login:", error);
        process.exit(1);
    }
}

export async function ensureAuthenticated(): Promise<void> {
    const token = loadToken();
    if (token) {
        pb.authStore.save(token, null);
        try {
            // Verify if the token is still valid
            await pb.admins.authRefresh();
            return;
        } catch (error) {
            console.log("Token expired, logging in again...");
        }
    }
    await adminLogin();
}

export async function listCollection(collection: string, options: ListOptions = {}): Promise<void> {
    try {
        initPocketBase();
        await ensureAuthenticated();
        
        const {
            fields = [],
            filter = "",
            sort = "-created",
            expand = "",
            page = 1,
            perPage = 50
        } = options;

        const queryOptions: Record<string, any> = {
            sort,
        };

        if (fields.length > 0) {
            queryOptions.fields = fields.join(",");
        }

        if (filter) {
            queryOptions.filter = filter;
        }

        if (expand) {
            queryOptions.expand = expand;
        }

        const records = await pb.collection(collection).getList(page, perPage, queryOptions);
        
        console.log(`Collection ${collection}:`);
        console.log("Items:", records.items);
        console.log(`Page ${page} of ${Math.ceil(records.totalItems / perPage)}`);
        console.log(`Total items: ${records.totalItems}`);
        
    } catch (error) {
        console.error(`Failed to fetch collection ${collection}:`, error);
        process.exit(1);
    }
}
