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
}

export interface ProfilesConfig {
    activeProfile?: string;
    profiles: Record<string, Profile>;
}
