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
async function main() {
    await spawn("cmd", ["-c", "echo test"], {stdio: "inherit"}).on;
    if (commandLineArguments.length < 3) {
        console.error("❌ Incorrect usage;");
        console.error("❌ Correct usage: 'nexra <file>'");
        process.exit(1);
    }
    const file: string = commandLineArguments[2];
    const buffer: Buffer = fs.readFileSync(file);
    const contents: string = buffer.toString();
    console.log("✅ File read");

    const tokenizer: tokenization.Tokenizer = new tokenization.Tokenizer(contents);
    const tokens: Token[] = tokenizer.tokenize();
    console.log("✅ Tokenization complete");

    const parser: parsing.Parser = new parsing.Parser(tokens);
    const tree: NodeProg = parser.parse_prog();
    console.log("✅ Parsing complete");
    if (!tree) {
        console.error("❌ Invalid Program...");
        process.exit(1);
    }

    const generator: generation.Generator = new generation.Generator(tree);
    const ASM: string = generator.gen_prog();
    console.log("✅ Generation complete");
    fs.writeFileSync("./build/out.asm", ASM);
    
    spawn("/usr/bin/nasm", ["-f", "elf64", "build/out.asm", "-o", "build/out.o"], { stdio: "inherit" })
        .on("error", e => {
            console.error("❌ nasm spawn failed:", e);
            process.exit(1);
        })
        .on("exit", code => {
            if (code !== 0) {
                console.error(`❌ nasm exited with code ${code}`);
                return process.exit(1);
            }

            spawn("ld", ["-o", "build/out", "build/out.o"], { stdio: "inherit" })
                .on("error", e => {
                    console.error("❌ ld spawn failed:", e);
                    process.exit(1);
                })
                .on("exit", code2 => {
                    if (code2 === 0) {
                        console.log(`✅ Compiled ${file} successfully to ./build/out`);
                        process.exit(0);
                    } else {
                        console.error(`❌ ld exited with code ${code2}`);
                        process.exit(1);
                    }
                });
        });
}

main();