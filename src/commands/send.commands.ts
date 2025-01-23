import { Command } from 'commander';
import { getActiveProfile } from '../utils.js';
import fetch from 'node-fetch';
import { initPocketBase, ensureAuthenticated, pb } from '../services/pb.service.js';

export function createSendCommand(): Command {
    const cmd = new Command('send')
        .description('Send HTTP requests to PocketBase with authentication')
        .argument('<method>', 'HTTP method (GET, POST, PUT, DELETE, PATCH)')
        .argument('<url>', 'Request URL path (e.g., /api/collections)')
        .option('-h, --headers <headers>', 'Custom headers as JSON string', '{}')
        .option('-d, --data <data>', 'Request body as JSON string', '{}')
        .addHelpText('after', `
Examples:
  $ pb_cli send GET /api/health                    # Check API health
  $ pb_cli send GET /api/collections               # List all collections
  $ pb_cli send POST /api/collections -d '{"name": "posts"}'  # Create collection
  $ pb_cli send GET /api/collections/posts/records # List records
  $ pb_cli send DELETE /api/collections/posts      # Delete collection

Arguments:
  method   HTTP method (required)
  url      Request URL path (required)

Options:
  -h, --headers <json>  Additional headers as JSON string
  -d, --data <json>    Request body as JSON string
        `)
        .showHelpAfterError('Add --help for additional information');

    cmd.action(async (method?: string, url?: string, options?: any) => {
        if (!method || !url) {
            cmd.help();
            return;
        }
        try {
            const profile = getActiveProfile();
            if (!profile) {
                console.error("No active profile. Please add a profile first with: profile add <name> <url> <email> <password>");
                process.exit(1);
            }

            // Initialize PB and ensure we're authenticated
            initPocketBase();
            await ensureAuthenticated();

            const headers = JSON.parse(options.headers);
            headers['Authorization'] = pb.authStore.token;

            const fullUrl = url.startsWith('http') ? url : `${profile.url}${url}`;
            const data = JSON.parse(options.data);

            const response = await fetch(fullUrl, {
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

    return cmd;
}
