class TokenType {
    static "exit" = "exit";
    static "int_lit" = "int_lit";
    static "semi" = "semi";
}

class Token {
    /**
     * 
     * @param {TokenType} type 
     * @param {string} value 
     */
    constructor(type, value = "") {
        this.type = type;
        this.value = value;
    }
}

class NodeExpr {
    /** @type {Number} */
    int_lit
    constructor(int) {
        this.int_lit = int;
    }
};
class NodeExit {
    /** @type {NodeExpr} */
    expr
    constructor(expr) {
        expr
    }
};

module.exports = { TokenType, Token, NodeExpr, NodeExit };