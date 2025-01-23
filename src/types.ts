export interface ListOptions {
    fields?: string[];
    filter?: string;
    sort?: string;
    expand?: string;
    page?: number;
    perPage?: number;
}

export interface Profile {
    name: string;
    url: string;
    adminEmail: string;
    adminPassword: string;
    token?: string;
    authType: 'admin' | 'collection';  // Add auth type
    collectionName?: string;  // Add optional collection name for collection auth
}

export interface ProfilesConfig {
    activeProfile?: string;
    profiles: Record<string, Profile>;
}
