function interpret(ast) {
    const env = {}; // environment to store variable values

    function evaluate(node) {
        switch (node.type) {
            case "Program":
                for (const stmt of node.body) {
                    evaluate(stmt);
                }
                break;

            case "VariableDeclaration":
                env[node.name] = evaluate(node.value);
                break;

            case "Literal":
                return node.value;

            case "Identifier":
                if (env.hasOwnProperty(node.name)) {
                    return env[node.name];
                } else {
                    console.error(`Variable "${node.name}" is not defined.`);
                    process.exit(1);
                }

            case "BinaryExpression": 
                const left = evaluate(node.left, env);
                const right = evaluate(node.right, env);
                switch (node.operator) {
                    case "+": return left + right;
                    case "-": return left - right;
                    case "*": return left * right;
                    case "/": return left / right;
                    case "==": return left === right;
                    case "!=": return left !== right;
                    case "<": return left < right;
                    case ">": return left > right;
                    case "<=": return left <= right;
                    case ">=": return left >= right;
                    default:
                        console.error(`Unsupported operator: ${node.operator}`);
                        process.exit(1);
                }
                break;
            case "PrintStatement":
                const val = evaluate(node.expression);
                console.log(val);
                break;
            case "AssignmentExpression":
                if (!(node.name in env)) {
                    console.error(`Cannot assign to undeclared variable "${node.name}"`);
                    process.exit(1);
                }
                env[node.name] = evaluate(node.value);
                break;
            case "IfStatement":
                if (evaluate(node.test)) {
                    for (const stmt of node.consequent) {
                        evaluate(stmt);
                    }
                } else if (node.alternate.length) {
                    for (const stmt of node.alternate) {
                        evaluate(stmt);
                    }
                }
                break;

            default:
                console.error("Unknown node type: " + node.type);
                process.exit(1);
        }
    }

    evaluate(ast);
    return env; // return env so we can see the result of the program
}

module.exports = { interpret }