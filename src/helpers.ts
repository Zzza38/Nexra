// @ts-check
export const strings = {
    isAlpha: (c) => {
        return /^[a-zA-Z]$/.test(c);
    },
    isAlphaNumeric: (c) => {
        return /^[a-zA-Z0-9]$/.test(c);
    },
    isNumber: (c) => {
        return /^[0-9]$/.test(c);
    },
    isWhiteSpace: (c) => {
        return /^\s$/.test(c);
    }
}
export function visit(visitor, obj) {
    const className = obj.constructor.name;
    const fn = visitor[className];
    if (!fn) throw new TypeError("no visitor for " + className);
    return fn(obj);
}