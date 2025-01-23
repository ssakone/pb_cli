import { Command } from 'commander';
import { getActiveProfile, loadToken } from '../utils.js';
import fetch from 'node-fetch';

export function createSendCommand(): Command {
    return new Command('send')
        .description('Send a custom request with method, custom header (including token), and custom data')
        .argument('<method>', 'HTTP method (GET, POST, PUT, DELETE, etc.)')
        .argument('<url>', 'Request URL')
        .option('-h, --headers <headers>', 'Custom headers as JSON string', '{}')
        .option('-d, --data <data>', 'Request data as JSON string', '{}')
        .action(async (method: string, url: string, options: any) => {
            try {
                const profile = getActiveProfile();
                if (!profile) {
                    console.error("No active profile. Please add a profile first with: profile add <name> <url> <email> <password>");
                    process.exit(1);
                }

                const token = loadToken();
                if (!token) {
                    console.error("No token found. Please login first.");
                    process.exit(1);
                }

                const headers = JSON.parse(options.headers);
                headers['Authorization'] = `Bearer ${token}`;

                const data = JSON.parse(options.data);

                const response = await fetch(url, {
                    method,
                    headers,
                    body: method !== 'GET' ? JSON.stringify(data) : undefined
                });

                const responseBody = await response.text();
                console.log(`Response: ${response.status} ${response.statusText}`);
                console.log(responseBody);
            } catch (error) {
                if (error instanceof SyntaxError) {
                    console.error("Invalid JSON format. Please provide a valid JSON string.");
                } else {
                    console.error("Error sending request:", error);
                }
                process.exit(1);
            }
        });
}
