// Imports
import { Token, TokenType } from "./classes.js";
import { strings } from "./helpers.js";

export class Tokenizer {
    constructor(str: string) {
        this.m_src = str;
        this.m_index = 0;
    }
    tokenize(): Token[] {
        let tokens: Token[] = [];
        let buf = new strings.stream;
        while (this.peek()) {
            let c: string = this.peek();
            if (strings.isAlpha(c)) {
                buf.push(this.consume());
                while (this.peek() && strings.isAlphaNumeric(this.peek())) {
                    buf.push(this.consume());
                }
                if (buf.value === "exit") {
                    tokens.push({type: TokenType.exit});
                    buf.clear();

                } else if (buf.value === "let") {
                    tokens.push({type: TokenType.let});
                    buf.clear();

                } else if (buf.value === "if") {
                    tokens.push({type: TokenType.if});
                    buf.clear();
                } else {
                    tokens.push({type: TokenType.ident, value: buf.value});
                    buf.clear();

                }
            } else if (strings.isNumber(c)) {
                buf.push(this.consume());
                while (this.peek() && strings.isNumber(this.peek())) {
                    buf.push(this.consume());
                }
                tokens.push({type: TokenType.int_lit, value: buf.value});
                buf.clear();

            } else if (c === '(') {
                this.consume();
                tokens.push({type: TokenType.open_paren});

            } else if (c === ')') {
                this.consume();
                tokens.push({type: TokenType.close_paren});

            } else if (c === ';') {
                this.consume();
                tokens.push({type: TokenType.semi});

            } else if (c === '=') {
                this.consume();
                tokens.push({type: TokenType.eq});

            } else if (c === '+') {
                this.consume();
                tokens.push({type: TokenType.plus});

            } else if (c === '*') {
                this.consume();
                tokens.push({type: TokenType.star});

            } else if (c === '-') {
                this.consume();
                tokens.push({type: TokenType.dash});

            } else if (c === '/') {
                this.consume();
                tokens.push({type: TokenType.fslash});

            } else if (c === '{') {
                this.consume();
                tokens.push({type: TokenType.open_curly});
            } else if (c === '}') {
                this.consume();
                tokens.push({type: TokenType.close_curly});
            } else if (strings.isWhiteSpace(c)) {
                this.consume();
            } else {
                error(`Unexpected character: ${c}`);
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
    private readonly m_src: string;
    private m_index: number;
}

const error = (message: string) => {
    console.error("❌ Error during tokenization: " + message);
    process.exit(1);
}