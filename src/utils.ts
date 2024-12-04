import fs from 'fs';
import path from 'path';
import os from 'os';
import { Profile, ProfilesConfig } from './types';

const CONFIG_DIR = path.join(os.homedir(), '.pb-boutique');
const PROFILES_FILE = path.join(CONFIG_DIR, 'profiles.json');

export function ensureConfigDir() {
    if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
}

function loadProfiles(): ProfilesConfig {
    ensureConfigDir();
    if (!fs.existsSync(PROFILES_FILE)) {
        return { profiles: {} };
    }
    try {
        return JSON.parse(fs.readFileSync(PROFILES_FILE, 'utf8'));
    } catch (error) {
        console.error('Error loading profiles:', error);
        return { profiles: {} };
    }
}

function saveProfiles(config: ProfilesConfig) {
    ensureConfigDir();
    fs.writeFileSync(PROFILES_FILE, JSON.stringify(config, null, 2));
}

export function addProfile(name: string, url: string, adminEmail: string, adminPassword: string) {
    const config = loadProfiles();
    if (config.profiles[name]) {
        throw new Error(`Profile ${name} already exists`);
    }
    config.profiles[name] = { name, url, adminEmail, adminPassword };
    if (!config.activeProfile) {
        config.activeProfile = name;
    }
    saveProfiles(config);
}

export function removeProfile(name: string) {
    const config = loadProfiles();
    if (!config.profiles[name]) {
        throw new Error(`Profile ${name} does not exist`);
    }
    delete config.profiles[name];
    if (config.activeProfile === name) {
        config.activeProfile = Object.keys(config.profiles)[0];
    }
    saveProfiles(config);
}

export function listProfiles(): { profiles: Profile[]; activeProfile?: string } {
    const config = loadProfiles();
    return {
        profiles: Object.values(config.profiles),
        activeProfile: config.activeProfile
    };
}

export function loadProfile(name: string): Profile {
    const config = loadProfiles();
    const profile = config.profiles[name];
    if (!profile) {
        throw new Error(`Profile ${name} does not exist`);
    }
    config.activeProfile = name;
    saveProfiles(config);
    return profile;
}

export function getActiveProfile(): Profile | undefined {
    const config = loadProfiles();
    return config.activeProfile ? config.profiles[config.activeProfile] : undefined;
}

export function saveToken(token: string) {
    const config = loadProfiles();
    if (!config.activeProfile) {
        throw new Error('No active profile');
    }
    config.profiles[config.activeProfile].token = token;
    saveProfiles(config);
}

export function loadToken(): string | null {
    const profile = getActiveProfile();
    return profile?.token || null;
}
