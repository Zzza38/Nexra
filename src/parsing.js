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

    /**
     * @returns {}
     */
    parse_expr() {
        if (this.#peek() && this.#peek().type === classes.TokenType.int_lit) {
            return new classes.NodeExpr(this.#consume());
        } else {
            return null;
        }
    }

    /**
     * @returns {classes.NodeExit}
     */
    parse() {
        let exit_node;
        while (this.#peek()) {
            if (this.#peek().type === classes.TokenType.exit) {
                this.#consume();
                let node_expr = this.parse_expr();
                if (node_expr) {
                    exit_node = new classes.NodeExit(node_expr);
                } else {
                    console.error("Invalid Expression");
                    process.exit(1);
                }
                if (!this.#peek() || this.#peek().type !== classes.TokenType.semi) {
                    console.error("Invalid Expression");
                    process.exit(1);
                }
            }
        }
        this.#m_index = 0;
        return exit_node;
    }

    /**
     * 
     * @param {Number} ahead 
     * @returns {classes.Token}
     */
    #peek(ahead = 1) {
        if (this.#m_index + ahead > this.#m_tokens.length) {
            return null;
        } else {
            return this.#m_tokens[this.#m_index];
        }
    }
    /**
     * 
     * @returns {classes.Token}
     */
    #consume() {
        return this.#m_tokens[this.#m_index++];
    }
}

module.exports = { Parser };