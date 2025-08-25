// @ts-check
// Imports
import { NodeExpr, NodeTermIdent, NodeTermIntLit, NodeProg, NodeStmt, NodeStmtExit, NodeStmtLet, NodeTerm, NodeBinExpr } from './classes.js';
import { visit, Visitor } from './helpers.js';
// Classes
class Var {
    stack_loc: number;
    constructor(stack_loc: number) {
        this.stack_loc = stack_loc;
    }
}

export class Generator {
    constructor(prog: NodeProg) {
        this.m_prog = prog;
    }
    gen_term(term: NodeTerm) {
        const TermVisitor: Visitor = new Visitor(this, {
            NodeTermIntLit(term_int_lit: NodeTermIntLit) {
                const gen: Generator = this.visitor;
                gen.m_output += "    mov rax, " + term_int_lit.int_lit.value + "\n";
                gen.push("rax");
            },
            NodeTermIdent(term_ident: NodeTermIdent) {
                const gen: Generator = this.visitor;
                if (!gen.m_vars.has(term_ident.ident.value)) {
                    console.error("Undeclared identifier: " + term_ident.ident.value);
                    process.exit(1);
                }
                const v: Var = gen.m_vars.get(term_ident.ident.value);
                let offset: string = "";
                offset += "QWORD [rsp + " + ((gen.m_stack_size - v.stack_loc - 1) * 8) + "]"
                gen.push(offset);
            }
        });
        visit(TermVisitor, term.var);
    }
    gen_expr(expr: NodeExpr) {
        const ExprVisitor: Visitor = new Visitor(this, {
            NodeTerm(term: NodeTerm) {
                const gen: Generator = this.visitor;
                gen.gen_term(term);
            },
            NodeBinExpr(bin_expr: NodeBinExpr) {
                const gen: Generator = this.visitor;
                gen.gen_expr(bin_expr.var.lhs);
                gen.gen_expr(bin_expr.var.rhs); 
                gen.pop("rax");
                gen.pop("rbx");
                gen.m_output += "    add rax, rbx\n";
                gen.push("rax");
            }
        });
        visit(ExprVisitor, expr.var)
    }
    gen_stmt(stmt: NodeStmt) {
        const StmtVisitor: Visitor = new Visitor(this, {
            NodeStmtExit(stmt_exit: NodeStmtExit) {
                const gen: Generator = this.visitor;
                gen.gen_expr(stmt_exit.expr);
                gen.m_output += "    mov rax, 60\n";
                gen.pop("rdi");
                gen.m_output += "    syscall\n";
            },
            NodeStmtLet(stmt_let: NodeStmtLet) {
                const gen: Generator = this.visitor;
                if (gen.m_vars.has(stmt_let.ident.value)) {
                    console.error("Identifier already used: " + stmt_let.ident.value);
                    process.exit(1);
                }
                gen.m_vars.set(stmt_let.ident.value, new Var(gen.m_stack_size));
                gen.gen_expr(stmt_let.expr);
            },
        });
        visit(StmtVisitor, stmt.var);
    }

    gen_prog(): string {
        this.m_output = "global _start\n_start:\n";
        for (const stmt of this.m_prog.stmts) {
            this.gen_stmt(stmt);
        }
        this.m_output += "    mov rax, 60\n";
        this.m_output += "    mov rdi, 0\n";
        this.m_output += "    syscall";
        return this.m_output;
    }

    // Privates
    // Functions
    private push(reg: string) {
        this.m_output += "    push " + reg + "\n";
        this.m_stack_size++;
    }
    private pop(reg: string) {
        this.m_output += "    pop " + reg + "\n";
        this.m_stack_size--;
    }
    // Variables
    private m_prog: NodeProg;
    private m_stack_size: number = 0;
    private m_output: string;
    private m_vars: Map<string, Var> = new Map(); // yes it is used don't worry VSCode
}