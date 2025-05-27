#!/usr/bin/env node

const lexer = require("./src/lexer")
const arguments = process.argv.slice(2);

switch (arguments[0]) {
    case "run":
        if (arguments[1]) {
            console.log(lexer.lex(arguments[1]))
        } else {
            console.log("Usage: nexra run {file}");
        }
        break;

    default:
        console.log("No arguments specified...");
        break;
}
