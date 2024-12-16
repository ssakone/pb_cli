import { Command } from 'commander';
import { createRecord } from '../services/modify.service.js';

export function createCreateCommand(): Command {
    return new Command('create')
        .description('Create a new record in a collection')
        .argument('<collection>', 'Collection name')
        .requiredOption('-d, --data <json>', 'JSON string of data for the new record')
        .action(async (collection: string, options: any) => {
            try {
                const recordData = JSON.parse(options.data);
                await createRecord(collection, recordData);
                console.log(`Record created successfully in collection ${collection}`);
            } catch (error) {
                if (error instanceof SyntaxError) {
                    console.error("Invalid JSON data format. Please provide a valid JSON string.");
                } else {
                    console.error("Error creating record:", error);
                }
                process.exit(1);
            }
        });
}
