#!/usr/bin/env node
const fs = require("fs");
const lexer = require("./src/lexer")
const interpreter = require("./src/interpreter")
const arguments = process.argv.slice(2)

switch (arguments[0]) {
    case "run":
        if (arguments[1]) {
            let file = arguments[1];
            if (!fs.existsSync(file)) console.error("File provided doesn't exist");
            
            let fileText = fs.readFileSync(file).toString();
            let AST = lexer.lex(fileText);
            let env = interpreter.interpret(AST);
            
            if (arguments.includes("--ast")) fs.writeFileSync("AST.json", JSON.stringify(AST));
            if (arguments.includes("--env")) fs.writeFileSync("env.json", JSON.stringify(env));
        } else {
            console.error("Usage: nexra run {file}");
        }
        break;

    default:
        console.error("No arguments specified...");
        break;
}
