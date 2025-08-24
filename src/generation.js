// @ts-check
// Imports
const classes = require("./classes");

class Generator {
    /** @type {classes.NodeProg} */
    #m_prog
    /** @param {classes.NodeProg} prog */
    constructor(prog) {
        this.#m_prog = prog;
    }
    /** 
     * @param {classes.NodeExpr} expr
    */
    gen_expr(expr) {
        const ExprVisitor = {
            /**
             * @param {classes.NodeExprIntLit} expr_int_lit 
             */
            NodeExprIntLit(expr_int_lit) {
                this.#m_output += "mov rax, " + expr_int_lit.value + "\n";
                this.#m_output += "";
            },
            /**
             * @param {classes.NodeExprIdent} expr_ident 
             */
            NodeExprIdent(expr_ident) {

            }
        }
        visitVariant(ExprVisitor, expr.var)
    }
    /** 
     * @param {classes.NodeStmt} stmt
     * */
    gen_stmt(stmt) {
        /**
         * 
         * @param {Object} visitor 
         * @param {classes.NodeStmt} node 
         * @returns 
         */

        const StmtVisitor = {
            /**
             * @param {classes.NodeStmtExit} stmt_exit 
             */
            NodeStmtExit(stmt_exit) {
                this.#m_output += "    mov rax, 60\n";
                this.#m_output += "    mov rdi, " // TODO
                this.#m_output += "    syscall";
            },
            /**
             * @param {classes.NodeStmtLet} stmt_let
             */
            NodeStmtLet(stmt_let) {
                console.log("let")
            },
        }
        visitVariant(StmtVisitor, stmt.var);
    }
    /** @returns {String} */
    gen_prog() {
        this.#m_output = "global _start\n_start:\n";
        /** @type {classes.NodeStmt} */
        for (const stmt of this.#m_prog.stmts) {
            this.#m_output += this.gen_stmt(stmt);
        }
        this.#m_output += "    mov rax, 60\n";
        this.#m_output += "    mov rdi, 0\n";
        this.#m_output += "    syscall";
        return this.#m_output;
    }

    /** @type {String} */
    #m_output
}

function visitVariant(visitor, variant) {
    const className = variant.constructor.name;
    const fn = visitor[className];
    if (!fn) throw new TypeError("no visitor for " + className);
    return fn(variant);
}

module.exports = { Generator };