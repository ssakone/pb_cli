# @enokas/pb_cli

A command-line interface tool for managing PocketBase collections and profiles.

## Installation

```bash
# Using npm
npm install -g @enokas/pb_cli

# Using pnpm
pnpm add -g @enokas/pb_cli

# Using yarn
yarn global add @enokas/pb_cli
```

## Usage

```bash
# Add a profile
pb_cli profile add myapp http://localhost:8090 admin@example.com mypassword

# List records from a collection
pb_cli list users --filter "created >= '2023-01-01'"

# Update records
pb_cli modify update users -f "active = false" -d '{"active": true}'

# Delete records
pb_cli modify delete logs -f "created < '2023-01-01'" --dry-run

# Create a new record
pb_cli create users -d '{"name": "John Doe", "email": "john@example.com"}'

# Send a custom request
pb_cli send POST http://localhost:8090/api/endpoint -h '{"Content-Type": "application/json"}' -d '{"key": "value"}'
```

## Features

- Profile Management: Create and manage multiple PocketBase profiles
- List Records: Query and display records from any collection
- Modify Records: Update or delete records in bulk with filters
- Create Records: Add new records to any collection
- Send Custom Requests: Make custom requests with method, custom header (including token), and custom data
- Dry Run: Preview changes before applying them

## Commands

### Profile Management
- `profile add <name> <url> <email> <password>`: Add a new profile
- `profile list`: List all profiles
- `profile use <name>`: Switch to a profile
- `profile remove <name>`: Remove a profile

### List Records
- `list <collection> [options]`: List records from a collection
  - `-f, --filter <filter>`: Filter expression
  - `-s, --sort <sort>`: Sort expression
  - `--fields <fields>`: Comma-separated list of fields to display
  - `--page <page>`: Page number
  - `--per-page <count>`: Records per page

### Modify Records
- `modify update <collection> [options]`: Update records
  - `-f, --filter <filter>`: Filter expression
  - `-d, --data <json>`: JSON data for update
  - `--dry-run`: Preview changes without applying them

- `modify delete <collection> [options]`: Delete records
  - `-f, --filter <filter>`: Filter expression
  - `--dry-run`: Preview deletions without applying them

### Create Records
- `create <collection> [options]`: Create a new record
  - `-d, --data <json>`: JSON data for the new record

### Send Custom Requests
- `send <method> <url> [options]`: Send a custom request
  - `-h, --headers <headers>`: Custom headers as JSON string
  - `-d, --data <data>`: Request data as JSON string

### Script Execution
- `script <path>`: Execute a JSON script containing multiple PocketBase operations
  - The script file should be a JSON file with the following structure:
  ```json
  {
    "run": [
      {
        "create": [
          {
            "collection": "users",
            "data": { "name": "John Doe", "email": "john@example.com" }
          }
        ],
        "list": [
          {
            "collection": "users",
            "options": {
              "filter": "created >= '2023-01-01'",
              "sort": "-created"
            }
          }
        ],
        "modify": [
          {
            "type": "update",
            "collection": "users",
            "filter": "active = false",
            "data": { "active": true }
          }
        ],
        "send": [
          {
            "method": "POST",
            "url": "http://localhost:8090/api/endpoint",
            "headers": { "Content-Type": "application/json" },
            "data": { "key": "value" }
          }
        ]
      }
    ]
  }
  ```

## License

MIT
