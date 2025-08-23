// @ts-check
// Imports
const helpers = require("./helpers");
const classes = require("./classes");

class Tokenizer {
    #m_src
    #m_index
    constructor(str) {
        this.#m_src = str;
        this.#m_index = 0;
    }
    /** @returns {classes.Token[]} */
    tokenize() {
        /** @type {classes.Token[]} */
        let tokens = [];
        let buf = {
            value: "",
            clear() {
                this.value = "";
            },
            push(val) {
                this.value += val;
            }
        }
        while (this.#peek()) {
            if (helpers.strings.isAlpha(this.#peek())) {
                buf.push(this.#consume());
                while (this.#peek() && helpers.strings.isAlphaNumeric(this.#peek())) {
                    buf.push(this.#consume());
                }
                if (buf.value === "exit") {
                    tokens.push(new classes.Token(classes.TokenType.exit));
                    buf.clear();
                    continue;
                } else if (buf.value === "let") {
                    tokens.push(new classes.Token(classes.TokenType.let));
                    buf.clear();
                    continue;
                } else {
                    tokens.push(new classes.Token(classes.TokenType.ident, buf.value));
                    buf.clear();
                    continue;
                }
            } else if (helpers.strings.isNumber(this.#peek())) {
                buf.push(this.#consume());
                while (this.#peek() && helpers.strings.isNumber(this.#peek())) {
                    buf.push(this.#consume());
                }
                tokens.push(new classes.Token(classes.TokenType.int_lit, buf.value));
                buf.clear();
                continue;
            } else if (this.#peek() === '(') {
                this.#consume();
                tokens.push(new classes.Token(classes.TokenType.open_paren));
                continue;
            } else if (this.#peek() === ')') {
                this.#consume();
                tokens.push(new classes.Token(classes.TokenType.close_paren));
                continue;
            } else if (this.#peek() === ';') {
                tokens.push(new classes.Token(classes.TokenType.semi));
                this.#consume();
                continue;
            } else if (this.#peek() === '=') {
                tokens.push(new classes.Token(classes.TokenType.eq));
                this.#consume();
                continue;
            } else if (helpers.strings.isWhiteSpace(this.#peek())) {
                this.#consume();
                continue;
            } else {
                console.error("You messed up.");
                process.exit(1);
            }
        }
        this.#m_index = 0;
        return tokens;
    }
    /**
     * @param {Number} offset 
     * @returns {String}
     */
    #peek(offset = 0) {
        if (this.#m_index + offset >= this.#m_src.length) {
            return null;
        } else {
            return this.#m_src[this.#m_index + offset];
        }
    }
    /** @returns {String} */
    #consume() {
        return this.#m_src[this.#m_index++];
    }
}
module.exports = { Tokenizer };