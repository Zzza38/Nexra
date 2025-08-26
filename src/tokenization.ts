// @ts-check
// Imports
import { Token, TokenType } from "./classes.js";
import { strings } from "./helpers.js";

export class Tokenizer {
    constructor(str) {
        this.m_src = str;
        this.m_index = 0;
    }
    tokenize(): Token[] {
        let tokens: Token[] = [];
        let buf = new strings.stream;
        while (this.peek()) {
            if (strings.isAlpha(this.peek())) {
                buf.push(this.consume());
                while (this.peek() && strings.isAlphaNumeric(this.peek())) {
                    buf.push(this.consume());
                }
                if (buf.value === "exit") {
                    tokens.push({ type: TokenType.exit });
                    buf.clear();
                    continue;
                } else if (buf.value === "let") {
                    tokens.push({ type: TokenType.let });
                    buf.clear();
                    continue;
                } else {
                    tokens.push({ type: TokenType.ident, value: buf.value });
                    buf.clear();
                    continue;
                }
            } else if (strings.isNumber(this.peek())) {
                buf.push(this.consume());
                while (this.peek() && strings.isNumber(this.peek())) {
                    buf.push(this.consume());
                }
                tokens.push({ type: TokenType.int_lit, value: buf.value });
                buf.clear();
                continue;
            } else if (this.peek() === '(') {
                this.consume();
                tokens.push({ type: TokenType.open_paren });
                continue;
            } else if (this.peek() === ')') {
                this.consume();
                tokens.push({ type: TokenType.close_paren });
                continue;
            } else if (this.peek() === ';') {
                this.consume();
                tokens.push({ type: TokenType.semi });
                continue;
            } else if (this.peek() === '=') {
                this.consume();
                tokens.push({ type: TokenType.eq });
                continue;
            } else if (this.peek() === '+') {
                this.consume();
                tokens.push({ type: TokenType.plus });
                continue;
            } else if (this.peek() === '*') {
                this.consume();
                tokens.push({ type: TokenType.star });
                continue;
            } else if (this.peek() === '-') {
                this.consume();
                tokens.push({ type: TokenType.dash });
                continue;
            } else if (this.peek() === '/') {
                this.consume();
                tokens.push({ type: TokenType.slash });
                continue;
            } else if (strings.isWhiteSpace(this.peek())) {
                this.consume();
                continue;
            } else {
                console.error("❌ou messed up.");
                process.exit(1);
            }
        }
        this.m_index = 0;
        return tokens;
    }
    private peek(offset: number = 0): string {
        if (this.m_index + offset >= this.m_src.length) {
            return null;
        } else {
            return this.m_src[this.m_index + offset];
        }
    }
    private consume(): string {
        return this.m_src[this.m_index++];
    }
    private m_src: string;
    private m_index: number;
}