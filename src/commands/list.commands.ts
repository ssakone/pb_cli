import { Command } from 'commander';
import { ListOptions } from '../types.js';
import { listCollection } from '../services/pb.service.js';
import { ensureAuthenticated } from '../services/pb.service.js';

export function createListCommand(): Command {
    return new Command('list')
        .description('List items from any collection with optional parameters')
        .argument('<collection>', 'Collection name')
        .option('-f, --fields <fields...>', 'Fields to return')
        .option('-q, --filter <filter>', 'Filter query')
        .option('-s, --sort <sort>', 'Sort field(s)', '-created')
        .option('-e, --expand <expand>', 'Expand relations')
        .option('-p, --page <page>', 'Page number', '1')
        .option('-n, --per-page <perPage>', 'Items per page', '50')
        .action(async (collection, options) => {
            await ensureAuthenticated();
            const listOptions: ListOptions = {
                fields: options.fields,
                filter: options.filter,
                sort: options.sort,
                expand: options.expand,
                page: parseInt(options.page),
                perPage: parseInt(options.perPage)
            };
            listCollection(collection, listOptions);
        });
}
