// @ts-check
const strings = {
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

module.exports = { strings };