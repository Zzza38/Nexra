// @ts-check
// Imports
import { NodeExpr, NodeTermIdent, NodeTermIntLit, NodeProg, NodeStmt, NodeStmtExit, NodeStmtLet } from './classes.js';

// Classes
class Var {

    stack_loc: number;

    constructor(stack_loc: number) {
        this.stack_loc = stack_loc;
    }
}

export class Generator {

    constructor(prog: NodeProg) {
        this.#m_prog = prog;
    }

    gen_expr(expr: NodeExpr) {
        const ExprVisitor = {
            gen: this,
            NodeExprIntLit(expr_int_lit: NodeTermIntLit) {
                this.gen.#m_output += "    mov rax, " + expr_int_lit.int_lit.value + "\n";
                this.gen.push("rax");
            },
            NodeExprIdent(expr_ident: NodeTermIdent) {
                if (!this.gen.#m_vars.has(expr_ident.ident.value)) {
                    console.error("Undeclared identifier: " + expr_ident.ident.value);
                    process.exit(1);
                }
                const v = this.gen.#m_vars.get(expr_ident.ident.value);
                let offset = "";
                offset += "QWORD [rsp + " + ((this.gen.#m_stack_size - v.stack_loc - 1) * 8) + "]\n";
                this.gen.push(offset);
            }
        }
        visitVariant(ExprVisitor, expr.var)
    }

    gen_stmt(stmt: NodeStmt) {
        const StmtVisitor = {
            gen: this,
            NodeStmtExit(stmt_exit: NodeStmtExit) {
                this.gen.gen_expr(stmt_exit.expr);
                this.gen.#m_output += "    mov rax, 60\n";
                this.gen.pop("rdi");
                this.gen.#m_output += "    syscall\n";
            },
            NodeStmtLet(stmt_let: NodeStmtLet) {
                if (this.gen.#m_vars.has(stmt_let.ident.value)) {
                    console.error("Identifier already used: " + stmt_let.ident.value);
                    process.exit(1);
                }
                this.gen.#m_vars.set(stmt_let.ident.value, new Var(this.gen.#m_stack_size));
                this.gen.gen_expr(stmt_let.expr);
            },
        }
        visitVariant(StmtVisitor, stmt.var);
    }

    gen_prog(): string {
        this.#m_output = "global _start\n_start:\n";
        for (const stmt of this.#m_prog.stmts) {
            this.gen_stmt(stmt);
        }
        this.#m_output += "    mov rax, 60\n";
        this.#m_output += "    mov rdi, 0\n";
        this.#m_output += "    syscall";
        return this.#m_output;
    }

    // Privates
    private push(reg: string) {
        this.#m_output += "    push " + reg + "\n";
        this.#m_stack_size++;
    }
    private pop(reg: string) {
        this.#m_output += "    pop " + reg + "\n";
        this.#m_stack_size--;
    }
    // Variables
    #m_prog: NodeProg;
    #m_stack_size: number = 0;
    #m_output: string;
    #m_vars: Map<string, Var> = new Map();

}
function visitVariant(visitor, variant) {
    const className = variant.constructor.name;
    const fn = visitor[className];
    if (!fn) throw new TypeError("no visitor for " + className);
    return fn.call(visitor, variant);
}