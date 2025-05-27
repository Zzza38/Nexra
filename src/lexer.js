const fs = require("fs");
const grammar = {
    keywords: ["let", "const", "if", "else", "function", "return", "while"],
    operators: ["+", "-", "*", "/", "%", "^", "&&", "||", "!", "==", "!=", "<", ">", "<=", ">="],
    punctuation: ["(", ")", "{", "}"],
    literals: ["true", "false"]
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
    const lines = text.split("\n");

    let i = 0;
    while (i < lines.length) {
        let line = lines[i].trim();

        if (line.startsWith("function")) {
            const funcMatch = line.match(/^function\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\((.*?)\)\s*\{$/);
            if (!funcMatch) throw new Error("Invalid function declaration: " + line);
            const funcName = funcMatch[1];
            const params = funcMatch[2] ? funcMatch[2].split(',').map(p => p.trim()).filter(Boolean) : [];
            const body = [];
            i++;
            while (i < lines.length && lines[i].trim() !== "}") {
                body.push(lines[i]);
                i++;
            }
            i++; // skip '}'
            AST.body.push({
                type: "FunctionDeclaration",
                name: funcName,
                params,
                body: body.map(l => lexLine(l))
            });
            continue;
        }

        if (line.startsWith("if")) {
            const ifMatch = line.match(/^if\s*\((.*?)\)\s*\{$/);
            if (!ifMatch) throw new Error("Invalid if statement: " + line);
            const condition = ifMatch[1];
            const consequent = [];
            i++;
            while (i < lines.length && lines[i].trim() !== "}") {
                consequent.push(lines[i]);
                i++;
            }
            i++; // skip '}'

            let alternate = null;
            if (i < lines.length && lines[i].trim().startsWith("else")) {
                const elseLine = lines[i].trim();
                if (!elseLine.match(/^else\s*\{$/)) throw new Error("Invalid else block: " + elseLine);
                i++;
                const altBody = [];
                while (i < lines.length && lines[i].trim() !== "}") {
                    altBody.push(lines[i]);
                    i++;
                }
                i++; // skip '}'
                alternate = altBody.map(l => lexLine(l));
            }

            AST.body.push({
                type: "IfStatement",
                test: parseExpression(condition),
                consequent: consequent.map(l => lexLine(l)),
                alternate
            });
            continue;
        }

        if (line.startsWith("while")) {
            const whileMatch = line.match(/^while\s*\((.*?)\)\s*\{$/);
            if (!whileMatch) throw new Error("Invalid while statement: " + line);
            const condition = whileMatch[1];
            const body = [];
            i++;
            while (i < lines.length && lines[i].trim() !== "}") {
                body.push(lines[i]);
                i++;
            }
            i++; // skip '}'

            AST.body.push({
                type: "WhileStatement",
                test: parseExpression(condition),
                body: body.map(l => lexLine(l))
            });
            continue;
        }

        if (line.trim()) {
            AST.body.push(lexLine(line));
        }
        i++;
    }

    return AST;
}

function lexLine(line) {
    if (line.startsWith("return ")) {
        const returnExpr = line.slice(7).replace(/;$/, '').trim();
        return {
            type: "ReturnStatement",
            argument: parseExpression(returnExpr)
        };
    }

    for (const keywordTest of ["let", "const"]) {
        const match = line.match(new RegExp(`^${keywordTest}\\s+(?:(int|float|string|bool)\\s+)?([A-Za-z_][A-Za-z0-9_]*)\\s*=\\s*(.+?)\\s*;?$`));
        if (match) {
            return {
                type: "VariableDeclaration",
                name: match[2],
                kind: keywordTest,
                value: parseExpression(match[3]),
                declaredType: match[1] ? match[1] : "null"
            };
        }
    }

    // Fallback for standalone expressions like function calls
    if (/^[A-Za-z_][A-Za-z0-9_]*\(.*\);?$/.test(line)) {
        return parseExpression(line.replace(/;$/, ''));
    }

    throw new Error("Syntax error or unsupported line: " + line);
}

function splitArguments(argString) {
    const args = [];
    let current = "";
    let depth = 0;
    for (let i = 0; i < argString.length; i++) {
        const char = argString[i];
        if (char === '(') depth++;
        else if (char === ')') depth--;
        else if (char === ',' && depth === 0) {
            args.push(current.trim());
            current = "";
            continue;
        }
        current += char;
    }
    if (current.trim()) args.push(current.trim());
    return args;
}

function parseExpression(val) {
    return parseBinary(val, ['||']);
}

function parseBinary(val, operators) {
    let depth = 0, opIndex = -1, op = null;
    for (let i = val.length - 1; i >= 0; i--) {
        const char = val[i];
        if (char === ')') depth++;
        if (char === '(') depth--;
        for (let opSymbol of operators) {
            if (depth === 0 && val.slice(i - opSymbol.length + 1, i + 1) === opSymbol) {
                op = opSymbol;
                opIndex = i - opSymbol.length + 1;
                break;
            }
        }
        if (op) break;
    }
    if (opIndex !== -1) {
        const left = val.slice(0, opIndex).trim();
        const right = val.slice(opIndex + op.length).trim();
        return {
            type: "BinaryExpression",
            operator: op,
            left: parseExpression(left),
            right: parseExpression(right)
        };
    }
    return parseLogic(val.trim());
}

function parseLogic(val) {
    return parseBinary(val, ['&&', '==', '!=', '<=', '>=', '<', '>']) || parseTerm(val);
}

function parseTerm(val) {
    return parseBinary(val, ['*', '/', '%']) || parseFactor(val.trim());
}

function parseFactor(val) {
    return parseBinary(val, ['^']) || parseUnary(val.trim());
}

function parseUnary(val) {
    val = val.trim();
    if (val.startsWith('!')) {
        return {
            type: "UnaryExpression",
            operator: '!',
            argument: parseUnary(val.slice(1))
        };
    }
    return parsePrimary(val);
}

function parsePrimary(val) {
    val = val.trim();
    if (val.startsWith('(') && val.endsWith(')')) {
        return parseExpression(val.slice(1, -1).trim());
    }
    const callMatch = val.match(/^([a-zA-Z_][a-zA-Z0-9_.]*)\((.*)\)$/);
    if (callMatch) {
        return {
            type: "CallExpression",
            callee: { type: "Identifier", name: callMatch[1] },
            arguments: splitArguments(callMatch[2]).map(parseExpression)
        };
    }
    if (val === "true" || val === "false") {
        return {
            type: "Literal",
            value: val === "true",
            valueType: "bool"
        };
    }
    if (/^-?\d+(\.\d+)?([eE][+\-]?\d+)?$/.test(val)) {
        return {
            type: "Literal",
            value: parseFloat(val),
            valueType: val.includes(".") || /[eE]/.test(val) ? "float" : "int"
        };
    }
    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(val)) {
        return {
            type: "Identifier",
            name: val
        };
    }
    throw new Error("Unsupported expression: " + val);
}

module.exports = { lex }
