// Imports
import {
    NodeExpr,
    // NodeTermIdent,
    // NodeTermIntLit,
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
} from './classes.js';
import { bin_prec } from './helpers.js'

export class Parser {
    constructor(tokens) {
        this.m_tokens = tokens;
        this.m_index = 0;
    }
    parse_term(): NodeTerm {
        let int_lit: Token, ident: Token;
        if (int_lit = this.try_consume(TokenType.int_lit)) {
            return { variant: { int_lit: int_lit, __type: "NodeTermIntLit" }, __type: "NodeTerm" };
        } else if (ident = this.try_consume(TokenType.ident)) {
            return { variant: { ident: ident, __type: "NodeTermIdent" }, __type: "NodeTerm" };
        } else {
            return null;
        }
    }

    parse_expr(min_prec: number = 0): NodeExpr {
        let term_lhs: NodeTerm = this.parse_term();
        if (!term_lhs) { return null; }

        let expr_lhs: NodeExpr = { variant: term_lhs, __type: "NodeExpr" };

        while (true) {
            let curr_tok: Token = this.peek();
            if (!curr_tok) { break; }
            let prec: number = bin_prec(curr_tok.type);
            if (!prec || prec < min_prec) { break; }
            let op: Token = this.consume();
            let next_min_prec: number = prec + 1;
            let expr_rhs = this.parse_expr(next_min_prec);
            if (!expr_rhs) {
                console.error("❌nable to parse expression");
                process.exit(1);
            }

            let expr: NodeBinExpr = { __type: "NodeBinExpr" };
            let expr_lhs2: NodeExpr = { __type: "NodeExpr" };
            expr_lhs2.variant = expr_lhs.variant;
            if (op.type === TokenType.plus) {
                let add: NodeBinExprAdd = { __type: "NodeBinExprAdd" };
                add.lhs = expr_lhs2;
                add.rhs = expr_rhs;
                expr.variant = add;
            } else if (op.type === TokenType.star) {
                let multi: NodeBinExprMulti = { __type: "NodeBinExprMulti" };
                multi.lhs = expr_lhs2;
                multi.rhs = expr_rhs;
                expr.variant = multi;
            }

            expr_lhs.variant = expr;
        }
        return expr_lhs;
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
                console.error("❌nvalid Expression");
                process.exit(1);
            }
            this.try_consume(TokenType.close_paren, "Expected ')'");
            this.try_consume(TokenType.semi, "Expected ';'");
            return {
                variant: stmt_exit,
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
                console.error("❌nvalid Expression");
                process.exit(1);
            }
            this.try_consume(TokenType.semi, "Expected ';'");
            return {
                variant: stmt_let,
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
                console.error("❌nvalid statement");
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
    private try_consume(type: TokenType, err_msg?: string): Token {
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