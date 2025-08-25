// Tokens

// The values aren't numbers to match what it is in C and C++ because of debugging
// Type = "integer_literal" is much easier to understand than type = 1
export enum TokenType {
    exit = "exit",
    int_lit = "integer_literal",
    semi = ";",
    open_paren = "(",
    close_paren = ")",
    ident = "identifier",
    let = "let",
    eq = "=",
    plus = "+",
    star = "*",
}

export interface Token {
    type: TokenType;
    value?: string;
}

// ===== Expression Node =====
export interface NodeExpr {
    readonly __type: "NodeExpr";
    variant?: NodeTerm | NodeBinExpr;
}

// ===== Terms (and conditions) =====
export interface NodeTermIntLit {
    readonly __type: "NodeTermIntLit";
    int_lit: Token;
}

export interface NodeTermIdent {
    readonly __type: "NodeTermIdent";
    ident: Token;
}

export interface NodeTerm {
    readonly __type: "NodeTerm";
    variant?: NodeTermIntLit | NodeTermIdent;
}

// ===== Binary Expressions =====
export interface NodeBinExprAdd {
    readonly __type: "NodeBinExprAdd";
    lhs?: NodeExpr;
    rhs?: NodeExpr;
}

export interface NodeBinExprMulti {
    readonly __type: "NodeBinExprMulti";
    lhs?: NodeExpr;
    rhs?: NodeExpr;
}

export interface NodeBinExpr {
    readonly __type: "NodeBinExpr";
    variant?: NodeBinExprAdd | NodeBinExprMulti;
}

// ===== Program Nodes =====
export interface NodeProg {
    readonly __type: "NodeProg";
    stmts: NodeStmt[];
}

export interface NodeStmt {
    readonly __type: "NodeStmt";
    variant?: NodeStmtExit | NodeStmtLet;
}

export interface NodeStmtExit {
    readonly __type: "NodeStmtExit";
    expr: NodeExpr;
}

export interface NodeStmtLet {
    readonly __type: "NodeStmtLet";
    ident: Token;
    expr: NodeExpr;
}