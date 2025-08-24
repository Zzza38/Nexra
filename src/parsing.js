// @ts-check
// Imports
const helpers = require("./helpers");
const classes = require("./classes");

class Parser {
    #m_tokens
    #m_index
    constructor(tokens) {
        this.#m_tokens = tokens;
        this.#m_index = 0;
    }

    /** @returns {classes.NodeExpr} */
    parse_expr() {
        if (this.#peek() && this.#peek().type === classes.TokenType.int_lit) {
            return new classes.NodeExpr(new classes.NodeExprIntLit(this.#consume()));
        } else if (this.#peek() && this.#peek().type === classes.TokenType.ident) {
            return new classes.NodeExpr(new classes.NodeExprIdent(this.#consume()));
        } else {
            return null;
        }
    }
    /** @returns {classes.NodeStmt} */
    parse_stmt() {
        if (this.#peek() && this.#peek().type === classes.TokenType.exit && this.#peek(1) && this.#peek(1).type === classes.TokenType.open_paren) {
            this.#consume();
            this.#consume();
            /** @type {classes.NodeStmtExit} */
            let stmt_exit;
            let node_expr = this.parse_expr();
            if (node_expr) {
                stmt_exit = new classes.NodeStmtExit(node_expr);
            } else {
                console.error("Invalid Expression");
                process.exit(1);
            }
            if (this.#peek() && this.#peek().type === classes.TokenType.close_paren) {
                this.#consume()
            } else {
                console.error("Expected ')'");
                process.exit(1);
            }
            if (this.#peek() && this.#peek().type === classes.TokenType.semi) {
                this.#consume();
            } else {
                console.error("Expected ';'");
                process.exit(1);
            }
            return new classes.NodeStmt(stmt_exit);
        } else if (this.#peek() && this.#peek().type === classes.TokenType.let && this.#peek(1) && this.#peek(1).type === classes.TokenType.ident && this.#peek(2) && this.#peek(2).type === classes.TokenType.eq) {
            this.#consume();
            /** @type {classes.NodeStmtLet} */
            let stmt_let = new classes.NodeStmtLet(this.#consume(), null);
            this.#consume();
            /** @type {classes.NodeExpr} */
            let expr = this.parse_expr();
            if (expr) {
                stmt_let.expr = expr;
            } else {
                console.error("Invalid Expression");
                process.exit(1);
            }
            if (this.#peek() && this.#peek().type === classes.TokenType.semi) {
                this.#consume();
            } else {
                console.error("Expected ';'");
                process.exit(1);
            }
            return new classes.NodeStmt(stmt_let);
        } else {
            return null;
        }
    }
    /** @returns {classes.NodeProg} */
    parse_prog() {
        /** @type {classes.NodeProg} */
        let prog = new classes.NodeProg([]);
        while (this.#peek()) {
            /** @type {classes.NodeStmt} */
            let stmt = this.parse_stmt();
            if (stmt) {
                prog.stmts.push(stmt);
            } else {
                console.error("Invalid statement");
                process.exit(1);
            }
        }
        return prog;
    }

    /**
     * @param {Number} offset 
     * @returns {classes.Token}
     */
    #peek(offset = 0) {
        if (this.#m_index + offset >= this.#m_tokens.length) {
            return null;
        } else {
            return this.#m_tokens[this.#m_index + offset];
        }
    }
    /** @returns {classes.Token} */
    #consume() {
        return this.#m_tokens[this.#m_index++];
    }
}

module.exports = { Parser };