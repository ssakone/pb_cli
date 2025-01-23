import { Command } from "commander";
import fs from "fs/promises";
import { Script, ScriptCommand } from "../types.js";
import { getActiveProfile } from "../utils.js";
import {
  scriptCreateRecord,
  scriptModifyRecords,
  scriptDeleteRecords,
} from "../services/script.service.js";
import {
  listCollection,
  ensureAuthenticated,
  pb,
  initPocketBase,
} from "../services/pb.service.js";
import fetch from "node-fetch";
import console from "console";

function showStat(state: boolean) {
  if (state) console.log("[✅] Operation successful");
  else console.log("[❌] Operation failed");
}

async function executeScript(scriptPath: string) {
  try {
    // Read and parse the script file
    const scriptContent = await fs.readFile(scriptPath, "utf-8");
    const script: Script = JSON.parse(scriptContent);

    // Initialize PocketBase and ensure we're authenticated
    initPocketBase();
    await ensureAuthenticated();

    // Execute each command in sequence
    for (const command of script.run) {
      await executeCommand(command);
    }
  } catch (error) {
    console.error("Error executing script:", error);
    throw error;
  }
}

async function executeCommand(command: ScriptCommand) {
  // Execute create commands
  if (command.create) {
    for (const createCmd of command.create) {
      showStat(await scriptCreateRecord(createCmd.collection, createCmd.data));
    }
  }

  // Execute list commands
  if (command.list) {
    for (const listCmd of command.list) {
      showStat(await listCollection(listCmd.collection, listCmd.options));
    }
  }

  // Execute modify commands
  if (command.modify) {
    for (const modifyCmd of command.modify) {
      if (modifyCmd.type === "update") {
        showStat(
          await scriptModifyRecords(
            modifyCmd.collection,
            modifyCmd.filter || "",
            modifyCmd.data || {},
            modifyCmd.dryRun || false
          )
        );
      } else if (modifyCmd.type === "delete") {
        showStat(
          await scriptDeleteRecords(
            modifyCmd.collection,
            modifyCmd.filter || "",
            modifyCmd.dryRun || false
          )
        );
      }
    }
  }

  // Execute send commands
  if (command.send) {
    for (const sendCmd of command.send) {
      const profile = getActiveProfile();
      if (!profile) {
        throw new Error("No active profile");
      }

      const headers = {
        ...sendCmd.headers,
        Authorization: pb.authStore.token,
      };

      const fullUrl = sendCmd.url.startsWith("http")
        ? sendCmd.url
        : `${profile.url}${sendCmd.url}`;

      try {
        const response = await fetch(fullUrl, {
          method: sendCmd.method,
          headers,
          body: sendCmd.data ? JSON.stringify(sendCmd.data) : undefined,
        });

        if (!response.ok) {
          console.log(
            `HTTP error! status: ${response.status}: ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log("Response:", JSON.stringify(data, null, 2));
        showStat(true);
      } catch (error: any) {
        console.log(
          `Error sending ${sendCmd.method} request to ${fullUrl}:`,
          error.statusText
        );
        showStat(false);
      }
    }
  }
}

export function registerScriptCommands(program: Command) {
  program
    .command("script")
    .description(
      "Execute a JSON script containing multiple PocketBase operations"
    )
    .argument("<path>", "Path to the JSON script file")
    .action(executeScript);
}
