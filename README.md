### Nexra
Nexra is a compiled programming language based on JavaScript. Currently, the language compiles to assembly for NASM and LD to compile to native binaries.

### Grammar
Grammar can be found [here](./docs/grammar.md).

### Build
To build the project, you will need to have [Node.js](https://nodejs.org/) installed. Once you have Node.js, you can build the project by running the following command in the root directory of the project:

```bash
npm i
npm run build
npm link
```

### Usage

To use Nexra, you can run the following command on Linux with ```nasm``` and ```ld``` installed:
```bash
nexra <input_file>
```

### Credits
Most of the code was taken from [Hydrogen](https://github.com/orosmatthew/hydrogen-cpp), and the YouTube series [Creating a Compiler](https://www.youtube.com/playlist?list=PLUDlas_Zy_qC7c5tCgTMYq2idyyT241qs) by [Pixeled](https://www.youtube.com/@pixeled-yt).