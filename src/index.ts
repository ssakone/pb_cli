#!/usr/bin/env node

import { Command } from "commander";
import dotenv from "dotenv";
import { createProfileCommands } from "./commands/profile.commands.js";
import { createListCommand } from "./commands/list.commands.js";
import { createModifyCommand } from "./commands/modify.commands.js";
import { adminLogin, initPocketBase } from "./services/pb.service.js";

dotenv.config();

const program = new Command();

program
  .name("pb_cli")
  .description("CLI tool for managing PocketBase collections and profiles")
  .version("1.0.0");

// Add commands
program.addCommand(createProfileCommands());
program.addCommand(createListCommand());
program.addCommand(createModifyCommand());

// Add login command
program
  .command("login")
  .description("Login as admin")
  .action(() => {
    initPocketBase();
    adminLogin();
  });

program.parse();
