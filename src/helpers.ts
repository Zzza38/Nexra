// @ts-check
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
        push(val) {
            this.value += val;
        }
    }
}
export class Visitor {
    constructor(
        public visitor: any,
        public handlers: Record<string, (this: Visitor, obj: any) => any>
    ) { }
}

export function visit(visitor: Visitor, obj: any) {
    const key: string = obj.__type;
    if (!key) { throw new TypeError("no __type field on " + obj) };
    const fn: Function = visitor.handlers[key];
    if (typeof fn !== "function") {
        throw new TypeError("no visitor for " + key);
    }
    return fn.call(visitor, obj);                // bind this → Visitor (so this.gen works)
}
