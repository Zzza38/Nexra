// @ts-check
// Imports
const classes = require("./classes");

// Classes
class Var {
    /** @type {number} */
    stack_loc;
    /** @param {number} stack_loc */
    constructor(stack_loc) {
        this.stack_loc = stack_loc;
    }
}

class Generator {
    /** @param {classes.NodeProg} prog */
    constructor(prog) {
        this.#m_prog = prog;
    }
    /**  @param {classes.NodeExpr} expr */
    gen_expr(expr) {
        const ExprVisitor = {
            /** @type {Generator} */
            gen: null,
            /**
             * @param {classes.NodeExprIntLit} expr_int_lit 
             */
            NodeExprIntLit(expr_int_lit) {
                this.gen.#m_output += "    mov rax, " + expr_int_lit.int_lit.value + "\n";
                this.gen.#push("rax");
            },
            /**
             * @param {classes.NodeExprIdent} expr_ident 
             */
            NodeExprIdent(expr_ident) {
                if (!this.gen.#m_vars.has(expr_ident.ident.value)) {
                    console.error("Undeclared identifier: " + expr_ident.ident.value);
                    process.exit(1);
                }
                const v = this.gen.#m_vars.get(expr_ident.ident.value);
                let offset = "";
                offset += "QWORD [rsp + " + ((this.gen.#m_stack_size - v.stack_loc - 1) * 8)+ "]\n";
                this.gen.#push(offset);
            }
        }
        ExprVisitor.gen = this;
        visitVariant(ExprVisitor, expr.var)
    }
    /** @param {classes.NodeStmt} stmt */
    gen_stmt(stmt) {
        /**
         * 
         * @param {Object} visitor 
         * @param {classes.NodeStmt} node 
         * @returns 
         */

        const StmtVisitor = {
            /** @type {Generator} */
            gen: this,
            /** @param {classes.NodeStmtExit} stmt_exit */
            NodeStmtExit(stmt_exit) {
                this.gen.gen_expr(stmt_exit.expr);
                this.gen.#m_output += "    mov rax, 60\n";
                this.gen.#pop("rdi");
                this.gen.#m_output += "    syscall\n";
            },
            /** @param {classes.NodeStmtLet} stmt_let */
            NodeStmtLet(stmt_let) {
                if (this.gen.#m_vars.has(stmt_let.ident.value)) {
                    console.error("Identifier already used: " + stmt_let.ident.value);
                    process.exit(1);
                }
                this.gen.#m_vars.set(stmt_let.ident.value, new Var(this.gen.#m_stack_size));
                this.gen.gen_expr(stmt_let.expr);
            },
        }
        StmtVisitor.gen = this;
        visitVariant(StmtVisitor, stmt.var);
    }
    /** @returns {String} */
    gen_prog() {
        this.#m_output = "global _start\n_start:\n";
        /** @type {classes.NodeStmt} */
        for (const stmt of this.#m_prog.stmts) {
            this.gen_stmt(stmt);
        }
        this.#m_output += "    mov rax, 60\n";
        this.#m_output += "    mov rdi, 0\n";
        this.#m_output += "    syscall";
        return this.#m_output;
    }

    // Privates
    /** @param {String} reg // Register to push from */
    #push(reg) {
        this.#m_output += "    push " + reg + "\n";
        this.#m_stack_size++;
    }
    /** @param {String} reg // Register to pop to */
    #pop(reg) {
        this.#m_output += "    pop " + reg + "\n";
        this.#m_stack_size--;
    }

    // Variables
    /** @type {classes.NodeProg} */
    #m_prog;
    /** @type {number} */
    #m_stack_size = 0;
    /** @type {string} */
    #m_output;
    /** @typedef {InstanceType<typeof Var>} VarT */
    /** @type {Map<string, VarT>} */
    #m_vars = new Map();

}
function visitVariant(visitor, variant) {
    const className = variant.constructor.name;
    const fn = visitor[className];
    if (!fn) throw new TypeError("no visitor for " + className);
    return fn.call(visitor, variant);
}

module.exports = { Generator };