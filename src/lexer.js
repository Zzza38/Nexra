const grammar = {
    keywords: ["let", "const"],
    operators: ["+", "-", "*", "/", "==", "!=", "<", ">", "<=", ">="],
    punctuation: ["(", ")"],
    literals: []
};

/**
 * Parses the given text into an Abstract Syntax Tree (AST) representation.
 *
 * @param {string} text - The source code to be lexed, consisting of lines of variable declarations.
 * @returns {Object} AST - The Abstract Syntax Tree representation of the program.
 * @returns {string} AST.type - The type of the AST, always "Program".
 * @returns {Array} AST.body - The body of the AST, containing variable declarations.
 * @throws {Error} Throws an error if an undefined variable type is encountered.
 */
function lex(text) {
    const AST = {
        type: "Program",
        body: []
    };
    // Parse every line of the program and push the correct AST format
    for (const line of text.split("\n")) {
        if (line.includes("console.log(")) {
            const startIndex = line.indexOf("console.log(") + 12;
            const endIndex = line.lastIndexOf(")");
            const inside = line.slice(startIndex, endIndex);
            AST.body.push({
                type: "PrintStatement",
                expression: parseExpression(inside)
            });
            continue;
        }
        
    }

    return AST;
}

function parseExpression(val) {
    // Remove whitespace for easier parsing
    val = val.trim();

    // Helper to check if a string is an operator
    function isOperator(str) {
        return grammar.operators.some(op => str.startsWith(op));
    }

    // Simple recursive binary expression parser (left-to-right, no precedence)
    function parseBinary(expr) {
        let depth = 0;
        let lastOpIndex = -1;
        let op = null;

        // Find the first operator not inside parentheses
        for (let i = 0; i < expr.length; i++) {
            if (expr[i] === '(') depth++;
            else if (expr[i] === ')') depth--;
            else if (depth === 0) {
                for (const operator of grammar.operators) {
                    if (expr.slice(i, i + operator.length) === operator) {
                        lastOpIndex = i;
                        op = operator;
                        i += operator.length - 1; // Skip the length of the operator
                        break;
                    }
                }
                if (op) break; // left-to-right, so break on first found
            }
        }

        if (lastOpIndex !== -1) {
            // Split and recursively parse left/right
            const left = expr.slice(0, lastOpIndex).trim();
            const right = expr.slice(lastOpIndex + op.length).trim();
            return {
                type: "BinaryExpression",
                operator: op,
                left: parseBinary(left),
                right: parseBinary(right)
            };
        }

        // Handle parentheses
        if (expr[0] === '(' && expr[expr.length - 1] === ')') {
            return parseBinary(expr.slice(1, -1));
        }

        // Check for number
        if (!isNaN(expr)) {
            return {
                type: "Literal",
                value: parseFloat(expr)
            };
        }

        // Check for string
        if (expr.startsWith('"') && expr.endsWith('"')) {
            return {
                type: "Literal",
                value: expr.slice(1, -1)
            };
        }

        // Check for boolean
        if (expr === "true" || expr === "false") {
            return {
                type: "Literal",
                value: expr === "true"
            };
        }

        // Otherwise, treat as identifier
        return {
            type: "Identifier",
            name: expr
        };
    }

    return parseBinary(val);
}

function parseVariable(line) {
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
        // If no keyword, check for assignment like: a = 8;
        const assignMatch = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+?)\s*;?\s*$/);
        if (assignMatch) {
            const name = assignMatch[1];
            const value = assignMatch[2];
            AST.body.push({
                type: "AssignmentExpression",
                name,
                value: parseExpression(value)
            });
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
                throw new Error("undefined variable type, line: " + line)
        }
}
module.exports = { lex }