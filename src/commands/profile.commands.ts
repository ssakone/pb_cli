import { Command } from 'commander';
import { addProfile, removeProfile, listProfiles, loadProfile } from '../utils.js';

export function createProfileCommands(): Command {
    const profileCommand = new Command('profile')
        .description('Manage PocketBase profiles');

    profileCommand
        .addCommand(
            new Command('add')
                .description('Add a new profile')
                .argument('<name>', 'Profile name')
                .argument('<url>', 'PocketBase URL')
                .argument('<email>', 'Admin email')
                .argument('<password>', 'Admin password')
                .action((name, url, email, password) => {
                    try {
                        addProfile(name, url, email, password);
                        console.log(`Profile ${name} added successfully`);
                    } catch (error) {
                        console.error('Failed to add profile:', error);
                        process.exit(1);
                    }
                })
        )
        .addCommand(
            new Command('remove')
                .description('Remove a profile')
                .argument('<name>', 'Profile name')
                .action((name) => {
                    try {
                        removeProfile(name);
                        console.log(`Profile ${name} removed successfully`);
                    } catch (error) {
                        console.error('Failed to remove profile:', error);
                        process.exit(1);
                    }
                })
        )
        .addCommand(
            new Command('list')
                .description('List all profiles')
                .action(() => {
                    const { profiles, activeProfile } = listProfiles();
                    console.log('Profiles:');
                    profiles.forEach(profile => {
                        const isActive = profile.name === activeProfile ? ' (active)' : '';
                        console.log(`- ${profile.name}${isActive}:`);
                        console.log(`  URL: ${profile.url}`);
                        console.log(`  Email: ${profile.adminEmail}`);
                    });
                })
        )
        .addCommand(
            new Command('use')
                .description('Switch to a profile')
                .argument('<name>', 'Profile name')
                .action((name) => {
                    try {
                        const profile = loadProfile(name);
                        console.log(`Switched to profile ${profile.name}`);
                    } catch (error) {
                        console.error('Failed to switch profile:', error);
                        process.exit(1);
                    }
                })
        );

    return profileCommand;
}
