#!/usr/bin/env node

// Imports
import * as fs from "fs";
import { spawn } from "child_process";

import * as tokenization from "./tokenization.js";
import * as parsing from "./parsing.js";
import * as generation from "./generation.js";
import { NodeProg, Token } from "./classes.js";

// Constants
const commandLineArguments: string[] = process.argv;

// Main
function main() {
    if (commandLineArguments.length < 3) {
        console.error("Incorrect usage;");
        console.error("Correct usage: 'nexra <file>'");
        return 1;
    }
    const file: string = commandLineArguments[2];
    const buffer: Buffer = fs.readFileSync(file);
    const contents: string = buffer.toString();

    const tokenizer: tokenization.Tokenizer = new tokenization.Tokenizer(contents);
    const tokens: Token[] = tokenizer.tokenize();

    const parser: parsing.Parser = new parsing.Parser(tokens);
    const tree: NodeProg = parser.parse_prog();

    if (!tree) {
        console.error("Invalid Program...");
        return 1;
    }
    const generator: generation.Generator = new generation.Generator(tree);
    const ASM: string = generator.gen_prog();
    fs.writeFileSync("./build/out.asm", ASM);
    spawn("sh", ["-c", "nasm -f elf64 build/out.asm -o build/out.o && ld -o build/out build/out.o"], { stdio: "inherit" })
        .on("error", e => console.error("sh spawn failed:", e))
        .on("spawn", () => console.log("Compiled successfully to build/out"));
    return 0;
}

process.exit(main());