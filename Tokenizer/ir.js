/**
 *
 * IR grammar (text representation)
 * ─────────────────────────────────
 *   Label       ::= "Bk:" where k is a non-negative integer
 *   Assignment  ::= "  t<n> = <operand> <op> <operand>"
 *                |  "  t<n> = <operand>"
 *                |  "  t<n> = call <name>(<args>)"
 *   Branch      ::= "  if <cond> goto <label> else <label>"
 *   Jump        ::= "  goto <label>"
 *   Return      ::= "  ret [<operand>]"
 *   Throw       ::= "  throw <operand>"
 *   Phi hint    ::= "  ; phi <var> <- [<label>, ...]"
 *
 * Usage
 * ─────
 *   import { buildIR, buildCFGFromIR, extractIRFeatures } from './ir.js';
 *   import { buildASTFromFile } from './Tokenizer/Tokenizer-Tokenizr.js';
 *
 *   const ast = buildASTFromFile('foo.js');
 *   const ir  = buildIR(ast);
 *
 *   // Text representation
 *   console.log(ir.text);
 *
 *   // CFG over the IR
 *   const cfg = buildCFGFromIR(ir);
 *
 *   // Numerical feature vector (12 floats) for two files
 *   const astB = buildASTFromFile('bar.js');
 *   const irB  = buildIR(astB);
 *   const features = extractIRFeatures(ir, irB);
 *
 * CLI
 * ───
 *   node ir.js <file.js> [ir|cfg|features <file2.js>]
 */

import fs            from "fs";
import path          from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const acorn   = require("acorn");

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 — TAC EMITTER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} IRResult
 * @property {IRInstruction[]} instructions  Flat list of all IR instructions.
 * @property {string}          text          Human-readable text form.
 * @property {IRFunction[]}    functions     Per-function breakdowns.
 * @property {IRStats}         stats         Aggregate statistics.
 */

/**
 * @typedef {Object} IRInstruction
 * @property {"label"|"assign"|"branch"|"jump"|"ret"|"throw"|"call"|"phi"|"comment"} kind
 * @property {string}   raw     Raw text line.
 * @property {string}   [label]
 * @property {string}   [dest]
 * @property {string}   [op]
 * @property {string[]} [operands]
 * @property {string}   [target]    Jump/branch target label.
 * @property {string}   [altTarget] Else-branch target.
 */

/**
 * @typedef {Object} IRFunction
 * @property {string}          name
 * @property {IRInstruction[]} instructions
 * @property {IRStats}         stats
 */

/**
 * @typedef {Object} IRStats
 * @property {number} instructionCount
 * @property {number} labelCount        Basic-block entry points.
 * @property {number} branchCount       Conditional branches.
 * @property {number} jumpCount         Unconditional jumps.
 * @property {number} assignCount
 * @property {number} callCount
 * @property {number} retCount
 * @property {number} tempCount         Unique temporary variables (t0, t1 …).
 * @property {number} functionCount     Nested function declarations.
 */

class IREmitter {
  constructor() {
    this._lines        = [];   // all raw text lines
    this._instructions = [];   // all IRInstruction objects
    this._functions    = [];   // IRFunction[]
    this._tempIdx      = 0;
    this._blockIdx     = 0;
    this._currentFn    = null; // current IRFunction being built
  }

  // ── temp & label factories ─────────────────────────────────────────────

  _newTemp()  { return `t${this._tempIdx++}`; }
  _newBlock() { return `B${this._blockIdx++}`; }

  // ── low-level emit ──────────────────────────────────────────────────────

  _emit(kind, raw, extra = {}) {
    const instr = { kind, raw, ...extra };
    this._lines.push(raw);
    this._instructions.push(instr);
    if (this._currentFn) this._currentFn.instructions.push(instr);
    return instr;
  }

  _label(name) {
    return this._emit("label", `${name}:`, { label: name });
  }

  _assign(dest, lhs, op = null, rhs = null) {
    const raw = op !== null
      ? `  ${dest} = ${lhs} ${op} ${rhs}`
      : `  ${dest} = ${lhs}`;
    return this._emit("assign", raw, { dest, operands: op ? [lhs, rhs] : [lhs], op });
  }

  _branch(cond, thenLabel, elseLabel) {
    const raw = `  if ${cond} goto ${thenLabel} else ${elseLabel}`;
    return this._emit("branch", raw, {
      operands: [cond], target: thenLabel, altTarget: elseLabel,
    });
  }

  _jump(label) {
    return this._emit("jump", `  goto ${label}`, { target: label });
  }

  _ret(val = null) {
    const raw = val !== null ? `  ret ${val}` : `  ret`;
    return this._emit("ret", raw, { operands: val ? [val] : [] });
  }

  _throw(val) {
    return this._emit("throw", `  throw ${val}`, { operands: [val] });
  }

  _call(dest, callee, args) {
    const argStr = args.join(", ");
    const raw    = dest
      ? `  ${dest} = call ${callee}(${argStr})`
      : `  call ${callee}(${argStr})`;
    return this._emit("call", raw, { dest, operands: [callee, ...args] });
  }

  _comment(text) {
    return this._emit("comment", `  ; ${text}`);
  }

  // ── expression lowering ─────────────────────────────────────────────────
  // Returns the name of the temporary (or literal string) holding the value.

  _expr(node) {
    if (!node) return "undefined";

    switch (node.type) {

      case "Literal":
        return JSON.stringify(node.value);

      case "Identifier":
        return node.name;

      case "BinaryExpression":
      case "LogicalExpression": {
        const l = this._expr(node.left);
        const r = this._expr(node.right);
        const t = this._newTemp();
        this._assign(t, l, node.operator, r);
        return t;
      }

      case "UnaryExpression": {
        const arg = this._expr(node.argument);
        const t   = this._newTemp();
        this._assign(t, `${node.operator}${arg}`);
        return t;
      }

      case "UpdateExpression": {
        // ++x / x++ etc.
        const t   = this._newTemp();
        const op  = node.operator === "++" ? "+" : "-";
        const arg = this._expr(node.argument);
        this._assign(t, arg, op, "1");
        this._assign(arg, t);
        return node.prefix ? t : arg;
      }

      case "AssignmentExpression": {
        const rhs = this._expr(node.right);
        const lhs = this._expr(node.left);
        if (node.operator === "=") {
          this._assign(lhs, rhs);
        } else {
          // +=  -=  etc.
          const op = node.operator.slice(0, -1);
          const t  = this._newTemp();
          this._assign(t, lhs, op, rhs);
          this._assign(lhs, t);
        }
        return lhs;
      }

      case "CallExpression": {
        const callee = this._expr(node.callee);
        const args   = node.arguments.map((a) => this._expr(a));
        const t      = this._newTemp();
        this._call(t, callee, args);
        return t;
      }

      case "NewExpression": {
        const callee = this._expr(node.callee);
        const args   = node.arguments.map((a) => this._expr(a));
        const t      = this._newTemp();
        this._emit("call", `  ${t} = new ${callee}(${args.join(", ")})`, {
          dest: t, operands: [callee, ...args],
        });
        return t;
      }

      case "MemberExpression": {
        const obj  = this._expr(node.object);
        const prop = node.computed
          ? `[${this._expr(node.property)}]`
          : `.${node.property.name}`;
        const t = this._newTemp();
        this._assign(t, `${obj}${prop}`);
        return t;
      }

      case "ConditionalExpression": {
        // ternary: test ? consequent : alternate
        const thenLabel = this._newBlock();
        const elseLabel = this._newBlock();
        const exitLabel = this._newBlock();
        const result    = this._newTemp();
        const cond      = this._expr(node.test);
        this._branch(cond, thenLabel, elseLabel);
        this._label(thenLabel);
        this._assign(result, this._expr(node.consequent));
        this._jump(exitLabel);
        this._label(elseLabel);
        this._assign(result, this._expr(node.alternate));
        this._jump(exitLabel);
        this._label(exitLabel);
        return result;
      }

      case "ArrayExpression": {
        const t    = this._newTemp();
        const elts = node.elements.map((e) => (e ? this._expr(e) : "empty"));
        this._emit("assign", `  ${t} = [${elts.join(", ")}]`, {
          dest: t, operands: elts,
        });
        return t;
      }

      case "ObjectExpression": {
        const t     = this._newTemp();
        const pairs = node.properties.map((p) => {
          const key = p.key.name ?? p.key.value;
          const val = this._expr(p.value);
          return `${key}: ${val}`;
        });
        this._emit("assign", `  ${t} = {${pairs.join(", ")}}`, {
          dest: t, operands: [],
        });
        return t;
      }

      case "ArrowFunctionExpression":
      case "FunctionExpression": {
        // Inline function — emit as nested fn, return a reference name
        const name = node.id ? node.id.name : this._newTemp();
        this._lowerFunction(node, name);
        return name;
      }

      case "TemplateLiteral": {
        const t = this._newTemp();
        this._assign(t, "`template`");
        return t;
      }

      case "AwaitExpression": {
        const val = this._expr(node.argument);
        const t   = this._newTemp();
        this._assign(t, `await ${val}`);
        return t;
      }

      case "YieldExpression": {
        const val = node.argument ? this._expr(node.argument) : "undefined";
        const t   = this._newTemp();
        this._assign(t, `yield ${val}`);
        return t;
      }

      case "SpreadElement": {
        const val = this._expr(node.argument);
        return `...${val}`;
      }

      case "SequenceExpression": {
        let last = "undefined";
        for (const e of node.expressions) last = this._expr(e);
        return last;
      }

      default:
        // Unsupported expression — emit a comment and return a temp
        this._comment(`unsupported expr: ${node.type}`);
        return this._newTemp();
    }
  }

  // ── statement lowering ───────────────────────────────────────────────────

  _stmt(node) {
    if (!node) return;

    switch (node.type) {

      case "ExpressionStatement":
        this._expr(node.expression);
        break;

      case "VariableDeclaration":
        for (const decl of node.declarations) {
          if (decl.init) {
            const val = this._expr(decl.init);
            const lhs = this._patternName(decl.id);
            this._assign(lhs, val);
          }
        }
        break;

      case "ReturnStatement":
        if (node.argument) {
          const val = this._expr(node.argument);
          this._ret(val);
        } else {
          this._ret();
        }
        break;

      case "ThrowStatement": {
        const val = this._expr(node.argument);
        this._throw(val);
        break;
      }

      case "IfStatement": {
        const cond      = this._expr(node.test);
        const thenLabel = this._newBlock();
        const elseLabel = node.alternate ? this._newBlock() : null;
        const exitLabel = this._newBlock();

        this._branch(cond, thenLabel, elseLabel ?? exitLabel);

        this._label(thenLabel);
        this._stmt(node.consequent);
        this._jump(exitLabel);

        if (elseLabel) {
          this._label(elseLabel);
          this._stmt(node.alternate);
          this._jump(exitLabel);
        }

        this._label(exitLabel);
        break;
      }

      case "WhileStatement": {
        const headerLabel = this._newBlock();
        const bodyLabel   = this._newBlock();
        const exitLabel   = this._newBlock();

        this._jump(headerLabel);
        this._label(headerLabel);
        const cond = this._expr(node.test);
        this._branch(cond, bodyLabel, exitLabel);

        this._label(bodyLabel);
        this._stmt(node.body);
        this._jump(headerLabel);

        this._label(exitLabel);
        break;
      }

      case "ForStatement": {
        // init
        if (node.init) {
          if (node.init.type === "VariableDeclaration") this._stmt(node.init);
          else this._expr(node.init);
        }

        const headerLabel = this._newBlock();
        const bodyLabel   = this._newBlock();
        const exitLabel   = this._newBlock();

        this._jump(headerLabel);
        this._label(headerLabel);

        if (node.test) {
          const cond = this._expr(node.test);
          this._branch(cond, bodyLabel, exitLabel);
        } else {
          this._jump(bodyLabel);
        }

        this._label(bodyLabel);
        this._stmt(node.body);
        if (node.update) this._expr(node.update);
        this._jump(headerLabel);

        this._label(exitLabel);
        break;
      }

      case "ForInStatement":
      case "ForOfStatement": {
        const iterVal     = this._expr(node.right);
        const headerLabel = this._newBlock();
        const bodyLabel   = this._newBlock();
        const exitLabel   = this._newBlock();

        this._jump(headerLabel);
        this._label(headerLabel);
        const iterCond = this._newTemp();
        this._assign(iterCond, `hasNext(${iterVal})`);
        this._branch(iterCond, bodyLabel, exitLabel);

        this._label(bodyLabel);
        const iterItem = this._newTemp();
        this._assign(iterItem, `next(${iterVal})`);
        const lhs = this._patternName(node.left.type === "VariableDeclaration"
          ? node.left.declarations[0].id
          : node.left);
        this._assign(lhs, iterItem);
        this._stmt(node.body);
        this._jump(headerLabel);

        this._label(exitLabel);
        break;
      }

      case "DoWhileStatement": {
        const bodyLabel   = this._newBlock();
        const testLabel   = this._newBlock();
        const exitLabel   = this._newBlock();

        this._jump(bodyLabel);
        this._label(bodyLabel);
        this._stmt(node.body);
        this._jump(testLabel);

        this._label(testLabel);
        const cond = this._expr(node.test);
        this._branch(cond, bodyLabel, exitLabel);

        this._label(exitLabel);
        break;
      }

      case "SwitchStatement": {
        const disc      = this._expr(node.discriminant);
        const exitLabel = this._newBlock();
        const caseLabels = node.cases.map(() => this._newBlock());

        for (let i = 0; i < node.cases.length; i++) {
          const c     = node.cases[i];
          const label = caseLabels[i];
          const next  = caseLabels[i + 1] ?? exitLabel;

          if (c.test) {
            const testVal = this._expr(c.test);
            const t       = this._newTemp();
            this._assign(t, disc, "===", testVal);
            this._branch(t, label, next);
          } else {
            // default
            this._jump(label);
          }

          this._label(label);
          for (const s of c.consequent) {
            if (s.type === "BreakStatement") { this._jump(exitLabel); break; }
            this._stmt(s);
          }
        }

        this._label(exitLabel);
        break;
      }

      case "TryStatement": {
        const tryLabel     = this._newBlock();
        const catchLabel   = node.handler  ? this._newBlock() : null;
        const finallyLabel = node.finalizer ? this._newBlock() : null;
        const exitLabel    = this._newBlock();

        this._comment("try");
        this._label(tryLabel);
        this._stmtList(node.block.body);
        this._jump(finallyLabel ?? exitLabel);

        if (catchLabel) {
          this._comment("catch");
          this._label(catchLabel);
          this._stmtList(node.handler.body.body);
          this._jump(finallyLabel ?? exitLabel);
        }

        if (finallyLabel) {
          this._comment("finally");
          this._label(finallyLabel);
          this._stmtList(node.finalizer.body);
          this._jump(exitLabel);
        }

        this._label(exitLabel);
        break;
      }

      case "BlockStatement":
        this._stmtList(node.body);
        break;

      case "FunctionDeclaration":
        this._lowerFunction(node, node.id.name);
        break;

      case "ClassDeclaration":
        this._lowerClass(node);
        break;

      case "ImportDeclaration":
      case "ExportNamedDeclaration":
      case "ExportDefaultDeclaration":
      case "ExportAllDeclaration":
        this._comment(`module: ${node.type}`);
        if (node.declaration) this._stmt(node.declaration);
        break;

      case "BreakStatement":
        this._emit("jump", "  break", { target: "break" });
        break;

      case "ContinueStatement":
        this._emit("jump", "  continue", { target: "continue" });
        break;

      case "LabeledStatement":
        this._comment(`label: ${node.label.name}`);
        this._stmt(node.body);
        break;

      case "EmptyStatement":
        break;

      default:
        this._comment(`unsupported stmt: ${node.type}`);
    }
  }

  _stmtList(stmts) {
    for (const s of stmts) this._stmt(s);
  }

  // ── destructuring pattern → single name ──────────────────────────────────

  _patternName(node) {
    if (!node) return "_";
    if (node.type === "Identifier") return node.name;
    if (node.type === "MemberExpression") return this._expr(node);
    // Destructuring patterns — use a temp
    const t = this._newTemp();
    this._comment(`destructure → ${t}`);
    return t;
  }

  // ── function lowering ────────────────────────────────────────────────────

  _lowerFunction(node, name) {
    const params  = node.params.map((p) => this._patternName(p)).join(", ");
    const fnLabel = `fn_${name}`;

    const fn = {
      name,
      instructions: [],
      stats: null, // computed at end
    };
    this._functions.push(fn);

    const prevFn    = this._currentFn;
    this._currentFn = fn;

    this._emit("label", `\n${fnLabel}(${params}):`, { label: fnLabel });

    if (node.body.type === "BlockStatement") {
      this._stmtList(node.body.body);
    } else {
      // Arrow function with expression body
      const val = this._expr(node.body);
      this._ret(val);
    }

    this._currentFn = prevFn;
    fn.stats = _computeStats(fn.instructions);
  }

  // ── class lowering ───────────────────────────────────────────────────────

  _lowerClass(node) {
    const name = node.id ? node.id.name : "AnonymousClass";
    this._comment(`class ${name}`);

    for (const method of node.body.body) {
      if (method.type !== "MethodDefinition") continue;
      const methodName = method.key.name ?? method.key.value ?? "computed";
      this._lowerFunction(method.value, `${name}.${methodName}`);
    }
  }

  // ── public entry ─────────────────────────────────────────────────────────

  build(ast) {
    this._stmtList(ast.body);

    const stats = _computeStats(this._instructions);

    return {
      instructions : this._instructions,
      text         : this._lines.join("\n"),
      functions    : this._functions,
      stats,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2 — STATISTICS HELPER
// ─────────────────────────────────────────────────────────────────────────────

function _computeStats(instructions) {
  const stats = {
    instructionCount : 0,
    labelCount       : 0,
    branchCount      : 0,
    jumpCount        : 0,
    assignCount      : 0,
    callCount        : 0,
    retCount         : 0,
    tempCount        : 0,
    functionCount    : 0,
  };

  const tempsSeen = new Set();

  for (const instr of instructions) {
    stats.instructionCount++;
    switch (instr.kind) {
      case "label":   stats.labelCount++;  break;
      case "branch":  stats.branchCount++; break;
      case "jump":    stats.jumpCount++;   break;
      case "assign":  stats.assignCount++; break;
      case "call":    stats.callCount++;   break;
      case "ret":     stats.retCount++;    break;
    }
    if (instr.dest && /^t\d+$/.test(instr.dest)) tempsSeen.add(instr.dest);
  }

  // Count fn_ labels as functions
  stats.functionCount = instructions.filter(
    (i) => i.kind === "label" && i.label?.startsWith("fn_"),
  ).length;

  stats.tempCount = tempsSeen.size;
  return stats;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3 — CFG OVER THE IR
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} IRCFGNode
 * @property {string}   id
 * @property {string[]} lines       Raw IR lines in this block.
 * @property {string[]} successors  IDs of successor blocks.
 */

/**
 * Build a CFG from an IRResult by grouping instructions between labels.
 *
 * @param {IRResult} ir  Output of buildIR().
 * @returns {{ nodes: IRCFGNode[], entry: string, exits: string[] }}
 */
export function buildCFGFromIR(ir) {
  const nodes  = [];
  let   current = null;

  const byId = new Map();

  for (const instr of ir.instructions) {
    if (instr.kind === "label") {
      current = { id: instr.label, lines: [], successors: [] };
      nodes.push(current);
      byId.set(instr.label, current);
      continue;
    }

    if (!current) {
      // Instructions before any label — attach to a synthetic entry block
      current = { id: "entry", lines: [], successors: [] };
      nodes.push(current);
      byId.set("entry", current);
    }

    current.lines.push(instr.raw.trim());

    if (instr.kind === "branch") {
      current.successors.push(instr.target, instr.altTarget);
      current = null;
    } else if (instr.kind === "jump") {
      if (instr.target !== "break" && instr.target !== "continue") {
        current.successors.push(instr.target);
      }
      current = null;
    } else if (instr.kind === "ret" || instr.kind === "throw") {
      current = null;
    }
  }

  const exits = nodes
    .filter((b) => b.successors.length === 0)
    .map((b) => b.id);

  const entry = nodes.length > 0 ? nodes[0].id : "entry";

  return { nodes, entry, exits };
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4 — PUBLIC BUILDER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a TAC IR from an Acorn Program AST.
 *
 * @param {acorn.Node} ast  Acorn Program node.
 * @returns {IRResult}
 */
export function buildIR(ast) {
  return new IREmitter().build(ast);
}

/**
 * Parse a file and build its IR.
 *
 * @param {string} filePath
 * @returns {IRResult}
 */
export function buildIRFromFile(filePath) {
  const source = fs.readFileSync(filePath, "utf-8");
  const ast    = acorn.parse(source, {
    ecmaVersion : 2022,
    sourceType  : "module",
    locations   : false,
  });
  return buildIR(ast);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5 — FEATURE EXTRACTION  (12 new features for similarity.js)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Names of the 12 IR-derived features.
 * Import this array in similarity.js to extend METRIC_NAMES.
 */
export const IR_FEATURE_NAMES = [
  "IR_InstrCountRatio",      // relative size of the two IRs
  "IR_LabelCountRatio",      // relative number of basic blocks
  "IR_BranchCountRatio",     // relative branching complexity
  "IR_JumpCountRatio",       // relative number of unconditional jumps
  "IR_AssignCountRatio",     // relative assignment density
  "IR_CallCountRatio",       // relative call density
  "IR_RetCountRatio",        // relative return count
  "IR_TempCountRatio",       // relative number of unique temporaries
  "IR_FunctionCountRatio",   // relative number of function declarations
  "IR_BranchDensity_A",      // branch / instruction ratio for file A
  "IR_BranchDensity_B",      // branch / instruction ratio for file B
  "IR_BranchDensityDiff",    // |densityA - densityB|  (structural divergence)
];

/**
 * Compute the 12-element IR feature vector comparing two IRResult objects.
 *
 * All "ratio" features are min/max ratios in [0, 1]:
 *   ratio(a, b) = min(a,b) / max(a,b)   (1 = identical, 0 = maximally different)
 *
 * @param {IRResult} irA
 * @param {IRResult} irB
 * @returns {number[]}  12 floats in [0, 1].
 */
export function extractIRFeatures(irA, irB) {
  const sA = irA.stats;
  const sB = irB.stats;

  function ratio(a, b) {
    const mx = Math.max(a, b);
    return mx === 0 ? 1.0 : Math.min(a, b) / mx;
  }

  const densityA = sA.instructionCount > 0
    ? sA.branchCount / sA.instructionCount : 0;
  const densityB = sB.instructionCount > 0
    ? sB.branchCount / sB.instructionCount : 0;

  return [
    ratio(sA.instructionCount, sB.instructionCount),
    ratio(sA.labelCount,       sB.labelCount),
    ratio(sA.branchCount,      sB.branchCount),
    ratio(sA.jumpCount,        sB.jumpCount),
    ratio(sA.assignCount,      sB.assignCount),
    ratio(sA.callCount,        sB.callCount),
    ratio(sA.retCount,         sB.retCount),
    ratio(sA.tempCount,        sB.tempCount),
    ratio(sA.functionCount,    sB.functionCount),
    densityA,
    densityB,
    Math.abs(densityA - densityB),
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5b — CFG FEATURE EXTRACTION
// ─────────────────────────────────────────────────────────────────────────────

export const CFG_FEATURE_NAMES = [
  "CFG_NodeCountRatio",   // ratio of basic-block counts
  "CFG_EdgeCountRatio",   // ratio of CFG edge counts
  "CFG_CyclomaticRatio",  // ratio of cyclomatic complexity (E - N + 2)
];

/**
 * Compute 3 CFG-level similarity features between two IR results.
 * All features are min/max ratios in [0, 1].
 *
 * @param {IRResult} irA
 * @param {IRResult} irB
 * @returns {number[]}  3 floats in [0, 1].
 */
export function extractCFGFeatures(irA, irB) {
  function cfgStats(ir) {
    const cfg = buildCFGFromIR(ir);
    const n   = cfg.nodes.length;
    const e   = cfg.nodes.reduce((s, nd) => s + nd.successors.length, 0);
    return { n, e, cc: Math.max(1, e - n + 2) };
  }

  function ratio(a, b) {
    const mx = Math.max(a, b);
    return mx === 0 ? 1.0 : Math.min(a, b) / mx;
  }

  const sA = cfgStats(irA);
  const sB = cfgStats(irB);

  return [
    ratio(sA.n,  sB.n),
    ratio(sA.e,  sB.e),
    ratio(sA.cc, sB.cc),
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6 — CLI
// ─────────────────────────────────────────────────────────────────────────────

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [,, cliFile, cliMode = "ir", cliFile2] = process.argv;

  if (!cliFile) {
    console.error(
      "Usage: node ir.js <file.js> [ir|cfg|stats|features <file2.js>]",
    );
    process.exit(1);
  }

  const irA = buildIRFromFile(cliFile);

  switch (cliMode) {

    case "ir":
      console.log(irA.text);
      break;

    case "cfg": {
      const cfg = buildCFGFromIR(irA);
      console.log(JSON.stringify(cfg, null, 2));
      break;
    }

    case "stats":
      console.log(JSON.stringify({
        file      : path.basename(cliFile),
        stats     : irA.stats,
        functions : irA.functions.map((f) => ({ name: f.name, stats: f.stats })),
      }, null, 2));
      break;

    case "features": {
      if (!cliFile2) {
        console.error("features mode requires a second file: node ir.js <a.js> features <b.js>");
        process.exit(1);
      }
      const irB  = buildIRFromFile(cliFile2);
      const vec  = extractIRFeatures(irA, irB);
      console.log(JSON.stringify({
        fileA    : path.basename(cliFile),
        fileB    : path.basename(cliFile2),
        features : Object.fromEntries(IR_FEATURE_NAMES.map((n, i) => [n, vec[i]])),
        vector   : vec,
      }, null, 2));
      break;
    }

    default:
      console.error(`Unknown mode "${cliMode}". Use: ir | cfg | stats | features <file2.js>`);
      process.exit(1);
  }
}
