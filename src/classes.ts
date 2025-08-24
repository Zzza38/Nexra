// Tokens

// The values aren't numbers to match what it is in C and C++ because of debugging
// Type = "integer_literal" is much easier to understand than type = 1
export enum TokenType {
  exit        = "exit",
  int_lit      = "integer_literal",
  semi        = ";",
  open_paren   = "(",
  close_paren  = ")",
  ident       = "identifier",
  let         = "let",
  eq          = "=",
  plus        = "+",
}

export interface Token {
    type: TokenType;
    value?: string;
}

// Expression Node
export interface NodeExpr {
    var: NodeTerm | NodeBinExpr;
};
// Terms (and conditions)
export interface NodeTermIntLit {
    int_lit: Token;
};
export interface NodeTermIdent {
    ident: Token;
};
export interface NodeTerm {
    var: NodeTermIntLit | NodeTermIdent;
}
// Binary Expressions
export interface NodeBinExprAdd {
    lhs: NodeExpr;
    rhs?: NodeExpr;
}

export interface NodeBinExprMulti {
    lhs: NodeExpr;
    rhs?: NodeExpr;
}
export interface NodeBinExpr {
    var: NodeBinExprAdd | NodeBinExprMulti;
}

// Program Nodes
export interface NodeProg {
    stmts: NodeStmt[];
};
export interface NodeStmt {
    var: NodeStmtExit | NodeStmtLet;
}
export interface NodeStmtExit {  
    expr: NodeExpr;
}
export interface NodeStmtLet {
    ident: Token;
    expr: NodeExpr;
}