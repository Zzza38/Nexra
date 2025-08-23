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
    /** @returns {String} */
    gen_stmt() {
        return;
    }
    /** @returns {String} */
    gen_prog() {
        let output = "global _start\n_start:\n";
        /** @type {classes.NodeStmt} */
        for (const stmt of this.#m_prog.stmts) {
            output += this.gen_stmt(stmt) + "\n";
        }

        output += "    mov rax, 60\n";
        output += "    mov rdi, 0\n";
        output += "    syscall";
        return output;
    }
}

module.exports = { Generator };