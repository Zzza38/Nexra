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
    NodeTerm,
    NodeBinExprSub,
    NodeBinExprDiv,
    NodeTermParen,
    NodeScope,
    NodeStmtIf
} from './classes.js';
import {bin_prec, assert} from './helpers.js'

export class Parser {
    constructor(tokens: Token[]) {
        this.m_tokens = tokens;
        this.m_index = 0;
    }

    parse_term(): NodeTerm {
        let int_lit: Token = this.try_consume(TokenType.int_lit),
            ident: Token = this.try_consume(TokenType.ident),
            open_paren: Token = this.try_consume(TokenType.open_paren);
        if (int_lit) {
            return {variant: {int_lit: int_lit, __type: "NodeTermIntLit"}, __type: "NodeTerm"};
        } else if (ident) {
            return {variant: {ident: ident, __type: "NodeTermIdent"}, __type: "NodeTerm"};
        } else if (open_paren) {
            let expr: NodeExpr = this.parse_expr();
            if (!expr) {
                error("Expected expression");
            }
            if (!this.try_consume(TokenType.close_paren)) {
                error("Expected ')'");
            }
            let term_paren: NodeTermParen = {__type: "NodeTermParen"};
            term_paren.expr = expr;
            let term: NodeTerm = {__type: "NodeTerm"};
            term.variant = term_paren;
            return term;

        } else {
            return null;
        }
    }

    parse_expr(min_prec: number = 0): NodeExpr {
        let term_lhs: NodeTerm = this.parse_term();
        if (!term_lhs) {
            return null;
        }

        let expr_lhs: NodeExpr = {variant: term_lhs, __type: "NodeExpr"};

        while (true) {
            let curr_tok: Token = this.peek();
            if (!curr_tok) {
                break;
            }
            let prec: number = bin_prec(curr_tok.type);
            if (!prec || prec < min_prec) {
                break;
            }
            let op: Token = this.consume();
            let next_min_prec: number = prec + 1;
            let expr_rhs = this.parse_expr(next_min_prec);
            if (!expr_rhs) {
                error("Unable to parse expression");
            }

            let expr: NodeBinExpr = {__type: "NodeBinExpr"};
            let expr_lhs2: NodeExpr = {__type: "NodeExpr"};
            expr_lhs2.variant = expr_lhs.variant;
            if (op.type === TokenType.plus) {
                let add: NodeBinExprAdd = {__type: "NodeBinExprAdd"};
                add.lhs = expr_lhs2;
                add.rhs = expr_rhs;
                expr.variant = add;
            } else if (op.type === TokenType.star) {
                let multi: NodeBinExprMulti = {__type: "NodeBinExprMulti"};
                multi.lhs = expr_lhs2;
                multi.rhs = expr_rhs;
                expr.variant = multi;
            } else if (op.type === TokenType.dash) {
                let sub: NodeBinExprSub = {__type: "NodeBinExprSub"};
                sub.lhs = expr_lhs2;
                sub.rhs = expr_rhs;
                expr.variant = sub;
            } else if (op.type === TokenType.fslash) {
                let div: NodeBinExprDiv = {__type: "NodeBinExprDiv"};
                div.lhs = expr_lhs2;
                div.rhs = expr_rhs;
                expr.variant = div;
            } else {
                assert(false, "Unexpected binary operator");
            }

            expr_lhs.variant = expr;
        }
        return expr_lhs;
    }

    parse_stmt(): NodeStmt {
        let open_curly: Token = this.try_consume(TokenType.open_curly),
            if_: Token = this.try_consume(TokenType.if);
        if (this.peek() && this.peek().type === TokenType.exit && this.peek(1) && this.peek(1).type === TokenType.open_paren) {
            this.consume();
            this.consume();

            let stmt_exit: NodeStmtExit;
            let node_expr = this.parse_expr();
            if (node_expr) {
                stmt_exit = {expr: node_expr, __type: "NodeStmtExit"};
            } else {
                error("Invalid Expression");
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
                error("Invalid Expression");
            }
            this.try_consume(TokenType.semi, "Expected ';'");
            return {
                variant: stmt_let,
                __type: 'NodeStmt',
            };
        } else if (open_curly) {
            let scope: NodeScope = {__type: 'NodeScope', stmts: []};
            let stmt: NodeStmt = {__type: "NodeStmt"};
            while (stmt = this.parse_stmt()) {
                scope.stmts.push(stmt);
            }
            this.try_consume(TokenType.close_curly, "Expected '}'");
            stmt = {__type: "NodeStmt"};
            stmt.variant = scope;
            return stmt;
        } else if (if_) {
            this.try_consume(TokenType.open_paren, "Expected '('");
            let expr: NodeExpr = this.parse_expr(),
                stmt_if: NodeStmtIf = {__type: "NodeStmtIf"};
            if (!expr) {
                error("Invalid Expression");
            }
            stmt_if.expr = expr;
            this.try_consume(TokenType.close_paren, "Expected ')' after 'if' condition");
            let if_stmt: NodeStmt  = this.parse_stmt();
            if (!if_stmt) {
                error("Invalid Statement");
            }
            stmt_if.stmt = if_stmt;
            return {
                __type: "NodeStmt",
                variant: stmt_if
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
                error(`Invalid statement: ${this.peek().type}`);
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
                error(err_msg);
            } else {
                return null;
            }

        }
    }

    private readonly m_tokens: Token[];
    private m_index: number;
}

const error = (message: string) => {
    console.error("❌ Error during parsing: " + message);
    process.exit(1);
}