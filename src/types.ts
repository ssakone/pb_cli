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

export interface ScriptCommand {
    create?: CreateCommand[];
    list?: ListCommand[];
    modify?: ModifyCommand[];
    send?: SendCommand[];
}

export interface CreateCommand {
    collection: string;
    data: Record<string, any>;
}

export interface ListCommand {
    collection: string;
    options?: ListOptions;
}

export interface ModifyCommand {
    type: 'update' | 'delete';
    collection: string;
    filter?: string;
    data?: Record<string, any>;
    dryRun?: boolean;
}

export interface SendCommand {
    method: string;
    url: string;
    headers?: Record<string, string>;
    data?: Record<string, any>;
}

export interface Script {
    run: ScriptCommand[];
}
