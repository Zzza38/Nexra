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
        error("---Incorrect usage---\n❌ Correct usage: 'nexra <file> (args)'")
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
        error("Invalid program");
    }

    const generator: generation.Generator = new generation.Generator(tree);
    const ASM: string = generator.gen_prog();
    console.log("✅ Generation complete");
    fs.writeFileSync("./build/out.asm", ASM);

    spawn("/usr/bin/nasm", ["-f", "elf64", "build/out.asm", "-o", "build/out.o"], { stdio: "inherit" })
        .on("error", e => {
            error(`nasm spawn failed, ${JSON.stringify(e)}`)
        })
        .on("exit", code => {
            if (code !== 0) {
                error(`nasm exited with code ${code}`);
            }

            spawn("ld", ["-o", "build/out", "build/out.o"], { stdio: "inherit" })
                .on("error", e => {
                    error(`ld spawn failed, ${JSON.stringify(e)}`)
                })
                .on("exit", code2 => {
                    if (code2 === 0) {
                        console.log(`✅ Compiled ${file} successfully to ./build/out`);
                        if (commandLineArguments[3] === "--exit-code") {
                            spawn("./build/out", { stdio: "inherit" })
                                .on("error", e => {
                                    error(`./build/out spawn failed, ${JSON.stringify(e)}`);
                                })
                                .on("exit", code3 => {
                                    console.log(`✅ ./build/out exited with code ${code3}`);
                                });
                        }
                    } else {
                        error(`ld exited with code ${code}`);
                    }
                });
        });
}

main();

const error = (message: string) => {
    console.error("❌ Error in main: " + message);
    process.exit(1);
}