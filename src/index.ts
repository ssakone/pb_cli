#!/usr/bin/env node

import { Command } from "commander";
import dotenv from "dotenv";
import { createProfileCommands } from "./commands/profile.commands.js";
import { createListCommand } from "./commands/list.commands.js";
import { createModifyCommand } from "./commands/modify.commands.js";
import { adminLogin, autoLogin, initPocketBase } from "./services/pb.service.js";
import { createCreateCommand } from "./commands/create.commands.js";
import { createSendCommand } from "./commands/send.commands.js";
import { registerScriptCommands } from "./commands/script.commands.js";

dotenv.config();

const program = new Command();

program.name("pb_cli").description("CLI tool for managing PocketBase collections and profiles").version("1.1.0");

// Add commands
program.addCommand(createProfileCommands());
program.addCommand(createListCommand());
program.addCommand(createModifyCommand());
program.addCommand(createCreateCommand());
program.addCommand(createSendCommand());
registerScriptCommands(program);

// Add login command
program
  .command("login")
  .description("Login as admin")
  .action(() => {
    initPocketBase();
    autoLogin();
  });

program.parse();
