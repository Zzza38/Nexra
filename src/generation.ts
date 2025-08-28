// Imports
import { 
    NodeExpr, 
    NodeTermIdent, 
    NodeTermIntLit, 
    NodeProg, 
    NodeStmt, 
    NodeStmtExit, 
    NodeStmtLet, 
    NodeTerm, 
    NodeBinExpr,
    NodeBinExprAdd,
    NodeBinExprMulti,
    NodeBinExprSub,
    NodeBinExprDiv,
    NodeTermParen,
    NodeScope,
    NodeStmtIf
} from './classes.js';
import { visit, Visitor, assert } from './helpers.js';

// Classes
interface Var {
    name: String;
    stack_loc: number;
}

export class Generator {
    constructor(prog: NodeProg) {
        this.m_prog = prog;
    }
    gen_term(term: NodeTerm) {
        const TermVisitor: Visitor = new Visitor(this, {
            NodeTermIntLit(term_int_lit: NodeTermIntLit) {
                const gen: Generator = this.visitor;
                gen.m_output += `    mov rax, ${term_int_lit.int_lit.value}\n`;
                gen.push("rax");
            },
            NodeTermIdent(term_ident: NodeTermIdent) {
                const gen: Generator = this.visitor;
                if (!gen.m_vars.find(v => v.name === term_ident.ident.value)) {
                    error(`Undeclared identifier: ${term_ident.ident.value}`);
                }
                const v: Var = gen.m_vars[gen.m_vars.push({ name: term_ident.ident.value, stack_loc: gen.m_stack_size - 1 }) - 1];
                let offset: string = "";
                offset += `QWORD [rsp + ${((gen.m_stack_size - v.stack_loc) * 8)}]`
                gen.push(offset);
            },
            NodeTermParen(term_paren: NodeTermParen) {
                const gen: Generator = this.visitor;
                gen.gen_expr(term_paren.expr);
            },
        });
        visit(TermVisitor, term.variant);
    }

    gen_bin_expr(bin_expr: NodeBinExpr) {
        const BinExprVisitor: Visitor = new Visitor(this, {
            NodeBinExprAdd(add: NodeBinExprAdd) {
                const gen: Generator = this.visitor;
                gen.gen_expr(add.rhs);
                gen.gen_expr(add.lhs);
                gen.pop("rax");
                gen.pop("rbx");
                gen.m_output += "    add rax, rbx\n";
                gen.push("rax");
            },
            NodeBinExprSub(sub: NodeBinExprSub) {
                const gen: Generator = this.visitor;
                gen.gen_expr(sub.rhs);
                gen.gen_expr(sub.lhs);
                gen.pop("rax");
                gen.pop("rbx");
                gen.m_output += "    sub rax, rbx\n";
                gen.push("rax");
            },
            NodeBinExprMulti(multi: NodeBinExprMulti) {
                const gen: Generator = this.visitor;
                gen.gen_expr(multi.rhs);
                gen.gen_expr(multi.lhs);
                gen.pop("rax");
                gen.pop("rbx");
                gen.m_output += "    mul rbx\n";
                gen.push("rax");
            },
            NodeBinExprDiv(div: NodeBinExprDiv) {
                const gen: Generator = this.visitor;
                gen.gen_expr(div.rhs);
                gen.gen_expr(div.lhs);
                gen.pop("rax");
                gen.pop("rbx");
                gen.m_output += "    div rbx\n";
                gen.push("rax");
            },
        });
        visit(BinExprVisitor, bin_expr.variant);
    }
    gen_expr(expr: NodeExpr) {
        const ExprVisitor: Visitor = new Visitor(this, {
            NodeTerm(term: NodeTerm) {
                const gen: Generator = this.visitor;
                gen.gen_term(term);
            },
            NodeBinExpr(bin_expr: NodeBinExpr) {
                const gen: Generator = this.visitor;
                gen.gen_bin_expr(bin_expr);
            }
        });
        visit(ExprVisitor, expr.variant)
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
                if (gen.m_vars.find(v => v.name === stmt_let.ident.value)) {
                    error(`Identifier already used: ${stmt_let.ident.value}`);
                }
                gen.m_vars.push({ name: stmt_let.ident.value,  stack_loc: gen.m_stack_size - 1 });
                gen.gen_expr(stmt_let.expr);
            },
            NodeScope(scope: NodeScope) {
                const gen: Generator = this.visitor;
                gen.begin_scope();
                for (const stmt of scope.stmts) {
                    gen.gen_stmt(stmt);
                }
                gen.end_scope();
            },
            NodeStmtIf(stmt_if: NodeStmtIf) {
                const gen: Generator = this.visitor;
                gen.gen_expr(stmt_if.expr);
                gen.pop("rax");
                let label: string = gen.create_label();
                gen.m_output += "    test rax, rax\n";
                gen.m_output += `    jz ${label}\n`;
                gen.gen_stmt(stmt_if.stmt);
                gen.m_output += `${label}:\n`;
            }
        });
        visit(StmtVisitor, stmt.variant);
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
        this.m_output += `    push ${reg}\n`;
        this.m_stack_size++;
    }
    private pop(reg: string) {
        this.m_output += `    pop ${reg}\n`;
        this.m_stack_size--;
    }
    private begin_scope() {
        this.m_scopes.push(this.m_vars.length);
    }
    private end_scope() {
        let pop_count: number = this.m_vars.length - (this.m_scopes[this.m_scopes.length - 1] ?? 0);
        this.m_stack_size -= pop_count;
        this.m_output += `    add rsp, ${pop_count * 8}\n`;
        this.m_vars.splice(this.m_scopes.pop(), pop_count);
    }
    private create_label() {
        return `label${this.m_label_count}`
    }
    // Variables
    private m_prog: NodeProg;
    private m_stack_size: number = 0;
    private m_output: string;
    private m_vars: Var[] = [];
    private m_scopes: number[] = [];
    private m_label_count: number = 0;
}

const error = (message: string) => {
    console.error("❌ Error during generation: " + message);
    process.exit(1);
}