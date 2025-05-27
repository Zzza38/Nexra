const fs = require("fs");
const grammar = {
    keywords: ["let", "const"],
    operators: ["+", "-", "*", "/"],
    punctuation: ["(", ")"],
    literals: []
};
const functions = [
    "console.log"
];

function lex(file) {
    let text = fs.readFileSync(file).toString();
    const AST = {
        type: "Program",
        body: []
    };
    // Parse every line of the program and push the correct AST format
    for (const line of text.split("\n")) {
        let keyword, name, value, type;
        for (const keywordTest of grammar.keywords) {
            const match = line.match(new RegExp(`^${keywordTest}\\s+(?:(int|float|string|bool)\\s+)?([A-Za-z_][A-Za-z0-9_]*)\\s*=\\s*(.+?)\\s*;?\\s*$`));
            if (match) {
                keyword = keywordTest;
                type = match[1] ? match[1] : "null";
                name = match[2];
                value = match[3];
                break;
            }
        }
        switch (keyword) {
            case "let":
                AST.body.push({
                    type: "VariableDeclaration",
                    name: name,
                    kind: "let",
                    value: parseExpression(value),
                    declaredType: type
                });
                break;
            case "const":
                AST.body.push({
                    type: "VariableDeclaration",
                    name: name,
                    kind: "const",
                    value: parseExpression(value),
                    declaredType: type
                });
                break;
            default:
                throw new Error("undefined keyword")
        }
    }

    return AST;
}

function parseExpression(val) {
    const ASTNode = {};
    const regex = /^\s*([+\-]?\d+(?:\.\d+)?(?:[eE][+\-]?\d+)?(?:\s+)*)\s*([a-zA-Z\s]*?)\s*([^a-zA-Z0-9.\-\+\sEe]*)\s*$/;
    let value = "";
    for (const char of val.split(/./)) {
        value += char;
        if (grammar.operators.includes(char)) {
            ASTNode.type = "BinaryExpression";
            ASTNode.operator = char;
            let [_, numbers, letters, symbols] = value.match(regex)
            let type;
            if (numbers) type = "Literal"
            if (letters) type = "Identifier"
            if (symbols) type = "BinaryExpression" // not handled yet
            if (ASTNode.left) ASTNode.right = { type: type, value: parseFloat(value.slice(0, -1)) };
            else ASTNode.left = { type: type, value: parseFloat(value.slice(0, -1)) }
            value = "";
        }
    }
    if (!ASTNode.type) {
        ASTNode.type = "Literal";
        ASTNode.value = parseFloat(val)
    }
    return ASTNode;
}
module.exports = { lex }