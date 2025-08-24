// @ts-check

// Tokens
// TokenType represents a struct
// The values aren't numbers to match what it is in C and C++ because of debugging
// Type = "integer_literal" is much easier to understand than type = 1
class TokenType {
    static "exit" = "exit";
    static "int_lit" = "integer_literal";
    static "semi" = ";";
    static "open_paren" = "(";
    static "close_paren" = ")";
    static "ident" = "identifier";
    static "let" = "let";
    static "eq" = "=";
}
class Token {
    /**
     * @param {TokenType} type 
     * @param {string} value 
     */
    constructor(type, value = "") {
        this.type = type;
        this.value = value;
    }
}

// Expression Nodes
class NodeExprIntLit {
    /** @type {Token} */
    int_lit
    /** @param {Token} int_lit */
    constructor(int_lit) {
        this.int_lit = int_lit;
    }
};
class NodeExprIdent {
    /** @type {Token} */
    ident
    /** @param {Token} ident */
    constructor(ident) {
        this.ident = ident;
    }
};
class NodeExpr {
    /** @type {NodeExprIntLit | NodeExprIdent} */
    var
    /** @param {NodeExprIntLit | NodeExprIdent} v */
    constructor(v) {
        this.var = v;
    }
};

// Program Nodes
class NodeProg {
    /** @type {NodeStmt[]} */
    stmts
    /** @param {NodeStmt[]} stmts */
    constructor(stmts) {
        this.stmts = stmts;
    }
};
class NodeStmt {
    /** @type {NodeStmtExit | NodeStmtLet} */
    var
    /** @param {NodeStmtExit | NodeStmtLet} v */
    constructor(v) {
        this.var = v;
    }
}
class NodeStmtExit {
    /** @type {NodeExpr} */
    expr
    /** @param {NodeExpr} expr */
    constructor(expr) {
        this.expr = expr;
    }
}
class NodeStmtLet {
    /** @type {Token} */
    ident
    /** @type {NodeExpr} */
    expr
    /** 
     * @param {Token} ident 
     * @param {NodeExpr} expr
    */
    constructor(ident, expr) {
        this.ident = ident;
        this.expr = expr;
    }
}
module.exports = {
    TokenType,
    Token,
    NodeExprIntLit,
    NodeExprIdent,
    NodeExpr,
    NodeProg,
    NodeStmt,
    NodeStmtExit,
    NodeStmtLet
};