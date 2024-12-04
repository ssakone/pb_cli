import { Command } from "commander";
import { modifyRecords, deleteRecords } from "../services/modify.service.js";

export function createModifyCommand(): Command {
    const modifyCommand = new Command("modify")
        .description("Commands for modifying records");

    modifyCommand
        .command("update <collection>")
        .description("Update records in a collection based on a filter")
        .requiredOption("-f, --filter <filter>", "Filter expression (e.g. 'created >= \"2022-01-01\"')")
        .requiredOption("-d, --data <json>", "JSON string of data to update")
        .option("--dry-run", "Show what would be updated without making changes", false)
        .action(async (collection: string, options: any) => {
            try {
                const updateData = JSON.parse(options.data);
                await modifyRecords(collection, options.filter, updateData, options.dryRun);
            } catch (error) {
                if (error instanceof SyntaxError) {
                    console.error("Invalid JSON data format. Please provide a valid JSON string.");
                } else {
                    console.error("Error updating records:", error);
                }
                process.exit(1);
            }
        });

    modifyCommand
        .command("delete <collection>")
        .description("Delete records from a collection based on a filter")
        .requiredOption("-f, --filter <filter>", "Filter expression (e.g. 'created >= \"2022-01-01\"')")
        .option("--dry-run", "Show what would be deleted without making changes", false)
        .action(async (collection: string, options: any) => {
            try {
                await deleteRecords(collection, options.filter, options.dryRun);
            } catch (error) {
                console.error("Error deleting records:", error);
                process.exit(1);
            }
        });

    return modifyCommand;
}
