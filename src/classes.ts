// Tokens

// noinspection SpellCheckingInspection
export enum TokenType {
    // Special / control tokens
    exit = "exit",                  // Exit or end-of-program
    ident = "identifier",           // Variable or function names
    int_lit = "integer_literal",    // Integer literal values

    // Keywords
    let = "let",                    // Variable declaration keyword
    if = "if",

    // Punctuation
    semi = ";",                     // Statement terminator
    open_paren = "(",               // Opening parenthesis
    close_paren = ")",              // Closing parenthesis
    open_curly = "{",               // Opening curly brace
    close_curly = "}",              // Closing curly brace

    // Operators
    eq = "=",                       // Assignment operator
    plus = "+",                     // Addition
    dash = "-",                     // Subtraction
    star = "*",                     // Multiplication
    fslash = "/",                   // Division
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
    int_lit?: Token;
}

export interface NodeTermIdent {
    readonly __type: "NodeTermIdent";
    ident?: Token;
}
export interface NodeTermParen {
    readonly __type: "NodeTermParen";
    expr?: NodeExpr;
}
export interface NodeTerm {
    readonly __type: "NodeTerm";
    variant?: NodeTermIntLit | NodeTermIdent | NodeTermParen;
}

// ===== Binary Expressions =====
export interface NodeBinExprAdd {
    readonly __type: "NodeBinExprAdd";
    lhs?: NodeExpr;
    rhs?: NodeExpr;
}
export interface NodeBinExprSub {
    readonly __type: "NodeBinExprSub";
    lhs?: NodeExpr;
    rhs?: NodeExpr;
}
export interface NodeBinExprMulti {
    readonly __type: "NodeBinExprMulti";
    lhs?: NodeExpr;
    rhs?: NodeExpr;
}
export interface NodeBinExprDiv {
    readonly __type: "NodeBinExprDiv";
    lhs?: NodeExpr;
    rhs?: NodeExpr;
}
export interface NodeBinExpr {
    readonly __type: "NodeBinExpr";
    variant?: NodeBinExprAdd | NodeBinExprSub | NodeBinExprMulti | NodeBinExprDiv;
}

// ===== Program & Statement Nodes =====
export interface NodeProg {
    readonly __type: "NodeProg";
    stmts: NodeStmt[];
}
// Statements
export interface NodeStmt {
    readonly __type: "NodeStmt";
    variant?: NodeStmtExit | NodeStmtLet | NodeScope | NodeStmtIf;
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

export interface NodeStmtIf {
    readonly __type: "NodeStmtIf";
    expr?: NodeExpr;
    stmt?: NodeStmt;
}
// Node Scope
export interface NodeScope {
    readonly __type: "NodeScope";
    stmts: NodeStmt[];
}