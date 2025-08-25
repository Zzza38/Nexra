// @ts-check
// Imports
import {
    NodeExpr,
    NodeTermIdent,
    NodeTermIntLit,
    NodeProg,
    NodeStmt,
    NodeStmtExit,
    NodeStmtLet,
    Token,
    TokenType,
    NodeBinExpr,
    NodeBinExprAdd,
    NodeBinExprMulti,
    NodeTerm
}
    from './classes.js';

export class Parser {
    constructor(tokens) {
        this.m_tokens = tokens;
        this.m_index = 0;
    }
    parse_term(): NodeTerm {
        let int_lit: Token, ident: Token;
        if (int_lit = this.tryConsume(TokenType.int_lit)) {
            return { var: { int_lit: int_lit, __type: "NodeTermIntLit" }, __type: "NodeTerm" };
        } else if (ident = this.tryConsume(TokenType.ident)) {
            return { var: { ident: ident, __type: "NodeTermIdent" }, __type: "NodeTerm" };
        } else {
            return null;
        }
    }

    parse_expr(): NodeExpr {
        let term: NodeTerm;
        if (term = this.parse_term()) {
            if (this.tryConsume(TokenType.plus)) {
                let bin_expr: NodeBinExpr, rhs: NodeExpr;
                let lhs_expr: NodeExpr = { var: term, __type: "NodeExpr" };
                let bin_expr_add: NodeBinExprAdd = { lhs: lhs_expr, __type: "NodeBinExprAdd" };

                if (rhs = this.parse_expr()) {
                    bin_expr_add.rhs = rhs;
                    bin_expr = { var: bin_expr_add, __type: "NodeBinExpr" };
                    let expr: NodeExpr = {
                        var: bin_expr,
                        __type: 'NodeExpr'
                    };
                    return expr;
                } else {
                    console.error("Expected expression");
                    process.exit(1);
                }
            } else {
                let expr: NodeExpr = {
                    var: term,
                    __type: 'NodeExpr'
                };
                return expr;
            }

        } else {
            return null;
        }
    }

    parse_stmt(): NodeStmt {
        if (this.peek() && this.peek().type === TokenType.exit && this.peek(1) && this.peek(1).type === TokenType.open_paren) {
            this.consume();
            this.consume();

            let stmt_exit: NodeStmtExit;
            let node_expr = this.parse_expr();
            if (node_expr) {
                stmt_exit = { expr: node_expr, __type: "NodeStmtExit" };
            } else {
                console.error("Invalid Expression");
                process.exit(1);
            }
            this.tryConsume(TokenType.close_paren, "Expected ')'");
            this.tryConsume(TokenType.semi, "Expected ';'");
            return {
                var: stmt_exit,
                __type: 'NodeStmt'
            };
        } else if (this.peek() && this.peek().type === TokenType.let &&
            this.peek(1) && this.peek(1).type === TokenType.ident &&
            this.peek(2) && this.peek(2).type === TokenType.eq) {
            this.consume();

            let stmt_let: NodeStmtLet = {
                ident: this.consume(), expr: null,
                __type: 'NodeStmtLet'
            };
            this.consume();

            let expr: NodeExpr = this.parse_expr();
            if (expr) {
                stmt_let.expr = expr;
            } else {
                console.error("Invalid Expression");
                process.exit(1);
            }
            this.tryConsume(TokenType.semi, "Expected ';'");
            return {
                var: stmt_let,
                __type: 'NodeStmt',
            };
        } else {
            return null;
        }
    }

    parse_prog(): NodeProg {
        let prog: NodeProg = {
            stmts: [],
            __type: 'NodeProg'
        };
        while (this.peek()) {
            let stmt: NodeStmt = this.parse_stmt();
            if (stmt) {
                prog.stmts.push(stmt);
            } else {
                console.error("Invalid statement");
                process.exit(1);
            }
        }
        return prog;
    }
    private peek(offset: number = 0): Token {
        if (this.m_index + offset >= this.m_tokens.length) {
            return null;
        } else {
            return this.m_tokens[this.m_index + offset];
        }
    }
    private consume(): Token {
        return this.m_tokens[this.m_index++];
    }
    private tryConsume(type: TokenType, err_msg?: string): Token {
        if (this.peek() && this.peek().type === type) {
            return this.consume();
        } else {
            if (err_msg) {
                console.error(err_msg);
                process.exit(1);
            } else {
                return null;
            }

        }
    }
    private m_tokens: Token[];
    private m_index: number;
}