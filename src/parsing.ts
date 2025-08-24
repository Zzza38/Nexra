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
    #m_tokens
    #m_index
    constructor(tokens) {
        this.#m_tokens = tokens;
        this.#m_index = 0;
    }

    
    parse_bin_expr(): NodeBinExpr {
        
        let lhs: NodeExpr;
        
        let rhs: NodeExpr;
        if (lhs = this.parse_expr()) {
            
            let bin_expr: NodeBinExpr;
            if (this.#peek() && this.#peek().type === TokenType.plus) {
                let bin_expr_add: NodeBinExprAdd = { lhs: lhs };
                this.#consume();
                if (rhs = this.parse_expr()) {
                    bin_expr_add.rhs = rhs;
                    bin_expr = { var: bin_expr_add };
                    return bin_expr;
                } else {
                    console.error("Expected expression");
                    process.exit(1);
                }
            } else {
                console.error("Unsupported binary operator");
                process.exit(1);
            }
        } else {
            return null;
        }
    }
    
    parse_term(): NodeTerm {
        if (this.#peek() && this.#peek().type === TokenType.int_lit) {
            return { var: { int_lit: this.#consume() } };
        } else if (this.#peek() && this.#peek().type === TokenType.ident) {
            return { var: { ident: this.#consume() } };
        } else {
            return null;
        }
    }

    parse_expr(): NodeExpr {
        
        let bin_expr: NodeBinExpr;
        
        let term: NodeTerm;
        if (term = this.parse_term()) {

        }  else {
            return null;
        }  
        if (bin_expr = this.parse_bin_expr()) {
            let expr = { var: bin_expr };
            return expr;
        } else {
            return null;
        }
    }
    
    parse_stmt(): NodeStmt {
        if (this.#peek() && this.#peek().type === TokenType.exit && this.#peek(1) && this.#peek(1).type === TokenType.open_paren) {
            this.#consume();
            this.#consume();
            
            let stmt_exit: NodeStmtExit;
            let node_expr = this.parse_expr();
            if (node_expr) {
                stmt_exit = { expr: node_expr };
            } else {
                console.error("Invalid Expression");
                process.exit(1);
            }
            if (this.#peek() && this.#peek().type === TokenType.close_paren) {
                this.#consume()
            } else {
                console.error("Expected ')'");
                process.exit(1);
            }
            if (this.#peek() && this.#peek().type === TokenType.semi) {
                this.#consume();
            } else {
                console.error("Expected ';'");
                process.exit(1);
            }
            return { var: stmt_exit };
        } else if (this.#peek() && this.#peek().type === TokenType.let && this.#peek(1) && this.#peek(1).type === TokenType.ident && this.#peek(2) && this.#peek(2).type === TokenType.eq) {
            this.#consume();

            let stmt_let: NodeStmtLet = { ident: this.#consume(), expr: null };
            this.#consume();
            
            let expr: NodeExpr = this.parse_expr();
            if (expr) {
                stmt_let.expr = expr;
            } else {
                console.error("Invalid Expression");
                process.exit(1);
            }
            if (this.#peek() && this.#peek().type === TokenType.semi) {
                this.#consume();
            } else {
                console.error("Expected ';'");
                process.exit(1);
            }
            return { var: stmt_let };
        } else {
            return null;
        }
    }
    
    parse_prog(): NodeProg {

        let prog: NodeProg = { stmts: [] };
        while (this.#peek()) {
            
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
        if (this.#m_index + offset >= this.#m_tokens.length) {
            return null;
        } else {
            return this.#m_tokens[this.#m_index + offset];
        }
    }
    
    private consume(): Token {
        return this.#m_tokens[this.#m_index++];
    }
}