#!/usr/bin/env node
// @ts-check

// Imports
import * as fs from "fs";
import { spawn } from "child_process";

import * as tokenization from "./tokenization.js";
import * as parsing from "./parsing.js";
import * as generation from "./generation.js";

// Constants
const commandLineArguments = process.argv;

// Main
function main() {
    if (commandLineArguments.length < 3) {
        console.error("Incorrect usage;");
        console.error("Correct usage: 'nexra <file>'");
        return 1;
    }
    const file = commandLineArguments[2];
    const buffer = fs.readFileSync(file);
    const contents = buffer.toString();

    const tokenizer = new tokenization.Tokenizer(contents);
    const tokens = tokenizer.tokenize();

    const parser = new parsing.Parser(tokens);
    const tree = parser.parse_prog();

    if (!tree) {
        console.error("Invalid Program...");
        return 1;
    }
    const generator = new generation.Generator(tree);
    const ASM = generator.gen_prog();
    fs.writeFileSync("./build/out.asm", ASM);
    spawn("sh", ["-c", "nasm -f elf64 build/out.asm -o build/out.o && ld -o build/out build/out.o"], { stdio: "inherit" })
        .on("error", e => console.error("sh spawn failed:", e))
    return 0;
}

process.exit(main());