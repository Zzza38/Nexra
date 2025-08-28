import {
    TokenType
} from "./classes.js";

// Strings
export const strings = {
    isAlpha: (c: string) => {
        return /^[a-zA-Z]$/.test(c);
    },
    isAlphaNumeric: (c: string) => {
        return /^[a-zA-Z0-9]$/.test(c);
    },
    isNumber: (c: string) => {
        return /^[0-9]$/.test(c);
    },
    isWhiteSpace: (c: string) => {
        return /^\s$/.test(c);
    },
    stream: class {
        value: string = "";
        clear() {
            this.value = "";
        }
        push(val: string) {
            this.value += val;
        }
    }
}

// Visitors
export class Visitor {
    constructor(
        public visitor: any,
        public handlers: Record<string, (this: Visitor, obj: any) => any>
    ) { }
}
export function visit(visitor: Visitor, obj: any) {
    if (!obj || !obj.__type) { throw new TypeError(obj ? "no __type field on " + obj : "no object"); }
    const key: string = obj.__type;
    const fn: Function = visitor.handlers[key];
    if (typeof fn !== "function") {
        throw new TypeError("no visitor for " + key);
    }
    return fn.call(visitor, obj);                // bind this → Visitor (so this.gen works)
}

// Binary Operation Functions
export function bin_prec(token: TokenType): number {
    switch (token) {
        case TokenType.plus:
        case TokenType.dash:
            return 1;
        case TokenType.star:
        case TokenType.fslash:
            return 2;
        default:
            return null;
    }
}

// Assert
export const assert = (value: any, message: string) => {
    if (!value) {
        console.log("❌ Assert failed: " + message);
        process.exit(2);
    }
};