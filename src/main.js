#!/usr/bin/env node
// @ts-check

// Imports
const fs = require("fs");
const { exec } = require("child_process");

const tokenization = require("./tokenization");
const parsing = require("./parsing");
const generation = require("./generation");

// const classes = require("./classes");
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
    const tree = parser.parse();

    if (!tree) {
        console.error("No exit statement found");
        return 1;
    }
    const generator =  new generation.Generator(tree);
    const ASM = generator.generate();

    fs.writeFileSync("./build/out.asm", ASM);
    exec("nasm -f elf64 build/out.asm && ld build/out.o -o build/out");
    return 0;
}

process.exit(main());