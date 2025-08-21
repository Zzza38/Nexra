// @ts-check
// Imports
const classes = require("./classes");

class Generator {
    /**
    * @type {classes.NodeExit}
    */
    #m_root
    constructor(root) {
        this.#m_root = root;
    }
    /**
     * @returns {String}
     */
    generate() {
        let output = "global _start\n_start:\n";
        output += "    mov rax, 60\n";
        output += "    mov rdi, " + this.#m_root.expr.int_lit + "\n";
        output += "    syscall";
        return output;
    }
}

module.exports = { Generator };