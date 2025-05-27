// compiler.js
let registerCount = 1;
let localVars = {};
const printfStr = `@.str = private unnamed_addr constant [4 x i8] c"%d\\0A\\00"
declare i32 @printf(i8*, ...)\n`;

function compile(ast) {
  registerCount = 1;
  localVars = {};
  const body = ast.body.map(compileNode).flat().join("\n");

  return (
    printfStr +
    "define i32 @main() {\nentry:\n" +
    body +
    "\n  ret i32 0\n}\n"
  );
}

function newRegister() {
  return `%${registerCount++}`;
}

function compileNode(node) {
  switch (node.type) {
    case "Literal":
      return compileLiteral(node);
    case "VariableDeclaration":
      return compileVariable(node);
    case "BinaryExpression":
      return compileBinary(node);
    case "CallExpression":
      return compileCall(node);
    case "FunctionDeclaration":
      return [`; Function declarations are not yet compiled to IR`];
    case "ReturnStatement":
      return compileReturn(node);
    case "Identifier":
      return compileIdentifier(node);
    case "IfStatement":
      return compileIf(node);
    case "WhileStatement":
      return compileWhile(node);
    default:
      throw new Error("Unknown node type: " + node.type);
  }
}

function compileLiteral(node) {
  const reg = newRegister();
  return [`${reg} = add i32 0, ${node.value}`];
}

function compileIdentifier(node) {
  if (!localVars[node.name]) throw new Error("Undefined variable: " + node.name);
  const reg = newRegister();
  return [`${reg} = load i32, i32* ${localVars[node.name]}`];
}

function compileVariable(node) {
  const alloca = newRegister();
  const valueLines = compileNode(node.value);
  const lastReg = valueLines[valueLines.length - 1].match(/(%\d+)/)?.[1];
  localVars[node.name] = alloca;
  return [
    `${alloca} = alloca i32`,
    ...valueLines,
    `store i32 ${lastReg}, i32* ${alloca}`
  ];
}

function compileBinary(node) {
  const left = compileNode(node.left);
  const right = compileNode(node.right);
  const leftReg = left[left.length - 1].match(/(%\d+)/)[1];
  const rightReg = right[right.length - 1].match(/(%\d+)/)[1];
  const result = newRegister();
  const opMap = {
    '+': 'add',
    '-': 'sub',
    '*': 'mul',
    '/': 'sdiv',
    '%': 'srem',
    '==': 'icmp eq',
    '!=': 'icmp ne',
    '<': 'icmp slt',
    '>': 'icmp sgt',
    '<=': 'icmp sle',
    '>=': 'icmp sge'
  };
  const llvmOp = opMap[node.operator] || 'add';
  return [...left, ...right, `${result} = ${llvmOp} i32 ${leftReg}, ${rightReg}`];
}

function compileCall(node) {
  if (node.callee.name === "console.log") {
    const args = node.arguments.map(compileNode);
    const argRegs = args.map(lines => lines[lines.length - 1].match(/(%\d+)/)[1]);
    return [
      ...args.flat(),
      `call i32 (i8*, ...) @printf(i8* getelementptr ([4 x i8], [4 x i8]* @.str, i32 0, i32 0), i32 ${argRegs[0]})`
    ];
  } else {
    return [`; Unknown call to ${node.callee.name}`];
  }
}

function compileReturn(node) {
  const valueLines = compileNode(node.argument);
  const lastReg = valueLines[valueLines.length - 1].match(/(%\d+)/)[1];
  return [...valueLines, `ret i32 ${lastReg}`];
}

function compileIf(node) {
  const cond = compileNode(node.test);
  const condReg = cond[cond.length - 1].match(/(%\d+)/)[1];
  const thenLabel = `then${registerCount}`;
  const elseLabel = `else${registerCount}`;
  const endLabel = `endif${registerCount++}`;
  const thenBlock = node.consequent.map(compileNode).flat();
  const elseBlock = node.alternate ? node.alternate.map(compileNode).flat() : [];

  return [
    ...cond,
    `br i1 ${condReg}, label %${thenLabel}, label %${elseLabel}`,
    `${thenLabel}:`,
    ...thenBlock,
    `br label %${endLabel}`,
    `${elseLabel}:`,
    ...elseBlock,
    `br label %${endLabel}`,
    `${endLabel}:`
  ];
}

function compileWhile(node) {
  const condLabel = `cond${registerCount}`;
  const loopLabel = `loop${registerCount}`;
  const endLabel = `endloop${registerCount++}`;
  const condExpr = compileNode(node.test);
  const condReg = condExpr[condExpr.length - 1].match(/(%\d+)/)[1];
  const body = node.body.map(compileNode).flat();

  return [
    `br label %${condLabel}`,
    `${condLabel}:`,
    ...condExpr,
    `br i1 ${condReg}, label %${loopLabel}, label %${endLabel}`,
    `${loopLabel}:`,
    ...body,
    `br label %${condLabel}`,
    `${endLabel}:`
  ];
}

module.exports = { compile };
