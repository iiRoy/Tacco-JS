/*
 * SPDX-FileCopyrightText: 2026 Rodrigo López Guerra
 * SPDX-FileCopyrightText: 2026 Abigail Pérez García
 * SPDX-FileCopyrightText: 2026 Fernando Maggi Llerandi
 *
 * SPDX-License-Identifier: Apache-2.0
 */

// -- Example path: ../dataset/'dataset general'/js_files/2.js
// -- Execution command: node Tokenizer-Tokenizr.js ../dataset/'dataset general'/js_files/2.js

import fs   from "fs";
import path from "path";
import { createHash } from "crypto";
import { createRequire } from "module";
import { fileURLToPath } from "url";

import { Tokenizr } from "tokenizr";

const require = createRequire(import.meta.url);
const acorn   = require("acorn");

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 — TOKENIZER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tokenize a raw JavaScript source string.
 *
 * Rules are applied in declaration order; the first match wins.
 * Whitespace, line breaks and comments are silently discarded.
 *
 * Token categories produced:
 *   Keyword · Ident · Boolean · Bigint · Number · String · Symbol ·
 *   Object · Array · Date · Operator · Lparen · Rparen · Lbrace ·
 *   Rbrace · Lbracket · Rbracket · Semi · Comma · Assign · Dot · Colon
 *
 * @param {string} source  Raw JavaScript source code.
 * @returns {{ type: string, value: string, line: number }[]}
 */
export function tokenizeSource(source) {
  const lexer = new Tokenizr();

  const keywords = [
    "while", "for", "of", "in", "if", "else", "switch", "case",
    "break", "continue", "default", "return", "throw", "try", "catch",
    "finally", "function", "class", "extends", "new", "this", "super",
    "const", "let", "var", "import", "export", "from", "typeof",
    "instanceof", "void", "delete", "async", "await", "yield",
    "static", "get", "set", "null", "undefined",
  ];

  // ── Ignored ──────────────────────────────────────────────────────────────
  lexer.rule(/\r/,              (ctx) => ctx.ignore());
  lexer.rule(/[ \t]+/,          (ctx) => ctx.ignore());
  lexer.rule(/\n/,              (ctx) => ctx.ignore());
  lexer.rule(/\/\/[^\n]*/,      (ctx) => ctx.ignore());
  lexer.rule(/\/\*[\s\S]*?\*\//, (ctx) => ctx.ignore());

  // ── Literals ─────────────────────────────────────────────────────────────
  lexer.rule(/\b(?:true|false)\b/,                               (ctx) => ctx.accept("Boolean"));
  lexer.rule(/([0-9]+n)|(BigInt\([0-9]+\))/,                     (ctx) => ctx.accept("Bigint"));
  lexer.rule(/[0-9]+(\.[0-9]+)?/,                                (ctx) => ctx.accept("Number"));
  lexer.rule(/(["'])((?:(?!\1)).)*\1/,                           (ctx) => ctx.accept("String"));
  lexer.rule(/Symbol\(("(?:\\["\\]|[^\n"\\])*")?\)/,             (ctx) => ctx.accept("Symbol"));
  lexer.rule(
    /\{[a-zA-Z]+_?:\ ?"(?:\\["\\]|[^\n"\\])*"(?:,\ ?[a-zA-Z]+_?:\ ?"(?:\\["\\]|[^\n"\\])*")*\}/,
    (ctx) => ctx.accept("Object"),
  );
  lexer.rule(
    /\[(?:"(?:\\["\\]|[^\n"\\])*"|[0-9]+)(?:,\ ?(?:"(?:\\["\\]|[^\n"\\])*"|[0-9]+))*\]/,
    (ctx) => ctx.accept("Array"),
  );
  lexer.rule(/new Date\(("[0-9]+-[0-9]+-[0-9]+")?\)/, (ctx) => ctx.accept("Date"));

  // ── Operators (longest match first) ──────────────────────────────────────
  for (const op of [
    />>>=/, /\*\*=/, /<<=/, />>=/, />>>/,
    /&&=/, /\|\|=/, /\?\?=/,
    /===/, /!==/, /\*\*/, /=>/, /\.\.\./, /\?\./, /\?\?/,
    /<</, />>/, /&&/, /\|\|/,
    /\+=/, /-=/, /\*=/, /\/=/, /%=/, /&=/, /\|=/, /\^=/,
    /==/, /!=/, /<=/, />=/,
    /\+\+/, /--/,
    /\+/, /-/, /\*/, /\//, /%/,
    /&/, /\|/, /\^/, /~/, /!/,
    /</, />/, /\?/, /\\/,
  ]) {
    lexer.rule(op, (ctx) => ctx.accept("Operator"));
  }

  // ── Identifiers / Keywords ────────────────────────────────────────────────
  lexer.rule(/[a-zA-Z_$][a-zA-Z0-9_$]*/, (ctx, match) =>
    keywords.includes(match[0]) ? ctx.accept("Keyword") : ctx.accept("Ident"),
  );

  // ── Delimiters ────────────────────────────────────────────────────────────
  lexer.rule(/\(/,  (ctx) => ctx.accept("Lparen"));
  lexer.rule(/\)/,  (ctx) => ctx.accept("Rparen"));
  lexer.rule(/\{/,  (ctx) => ctx.accept("Lbrace"));
  lexer.rule(/\}/,  (ctx) => ctx.accept("Rbrace"));
  lexer.rule(/\[/,  (ctx) => ctx.accept("Lbracket"));
  lexer.rule(/\]/,  (ctx) => ctx.accept("Rbracket"));
  lexer.rule(/;/,   (ctx) => ctx.accept("Semi"));
  lexer.rule(/,/,   (ctx) => ctx.accept("Comma"));
  lexer.rule(/=/,   (ctx) => ctx.accept("Assign"));
  lexer.rule(/\./,  (ctx) => ctx.accept("Dot"));
  lexer.rule(/:/,   (ctx) => ctx.accept("Colon"));

  // ── Fallback ──────────────────────────────────────────────────────────────
  lexer.rule(/./, (ctx, match) => {
    if (process.env.TACCO_TOKENIZER_WARNINGS === "1") {
      console.error(`Unrecognized: "${match[0]}"`);
    }
    ctx.ignore();
  });

  lexer.input(source);
  return lexer
    .tokens()
    .filter((t) => t.type !== "EOF")
    .map((t) => ({ type: t.type, value: t.value, line: t.line }));
}

/**
 * Convenience wrapper — tokenize a file on disk.
 * @param {string} filePath
 * @returns {{ type: string, value: string, line: number }[]}
 */
export function tokenizeFile(filePath) {
  return tokenizeSource(fs.readFileSync(filePath, "utf-8"));
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2 — AST  (Acorn)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse a JavaScript source string into an ESTree-format AST using Acorn.
 *
 * @param {string} source  Raw JavaScript source code.
 * @param {{ ecmaVersion?: number, sourceType?: string }} [opts]
 * @returns {acorn.Node}   ESTree Program node.
 *
 * @throws Will throw if the source is syntactically invalid.
 */
export function buildAST(source, opts = {}) {
  return acorn.parse(source, {
    ecmaVersion : opts.ecmaVersion  ?? 2022,
    sourceType  : opts.sourceType   ?? "module",
    locations   : true,   // kept here so normalizeAST can strip them explicitly
  });
}

/**
 * Build an AST from a file on disk.
 * @param {string} filePath
 * @param {object} [opts]   Forwarded to buildAST.
 * @returns {acorn.Node}
 */
export function buildASTFromFile(filePath, opts = {}) {
  return buildAST(fs.readFileSync(filePath, "utf-8"), opts);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3 — AST NORMALIZATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Keys removed from every AST node during normalization.
 *
 * - start / end / loc / range : source positions — irrelevant for structural
 *   comparison and cause identical programs at different file offsets to hash
 *   differently.
 * - raw : unparsed token text (e.g. "0x1F" vs "31") — normalised away so that
 *   numeric literal representations do not affect structural equality.
 */
const STRIP_KEYS = new Set(["start", "end", "loc", "range", "raw"]);

/**
 * Identifier normalization strategy for normalizeAST.
 *
 * - "keep"     : leave identifier names unchanged (default, best for Type-1).
 * - "abstract" : replace all Identifier.name values with a canonical
 *                placeholder "ID" (best for Type-2, eliminates renaming noise).
 */

/**
 * Recursively normalize an Acorn AST node.
 *
 * What this does:
 *   1. Strips position keys (start, end, loc, range, raw).
 *   2. Optionally abstracts identifier names to "ID".
 *   3. Sorts object keys deterministically so that structurally equivalent
 *      subtrees always serialize to the same string regardless of property
 *      insertion order.
 *
 * @param {any}    node      AST node (or any JSON value inside the tree).
 * @param {"keep"|"abstract"} [identMode="keep"]
 * @returns {any}  A new plain object — the original AST is not mutated.
 */
export function normalizeAST(node, identMode = "keep") {
  if (node === null || typeof node !== "object") return node;

  if (Array.isArray(node)) {
    return node.map((child) => normalizeAST(child, identMode));
  }

  // Abstract identifier names when requested
  if (identMode === "abstract" && node.type === "Identifier") {
    return { type: "Identifier", name: "ID" };
  }

  const result = {};
  // Sort keys so serialization is deterministic
  for (const key of Object.keys(node).sort()) {
    if (STRIP_KEYS.has(key)) continue;
    result[key] = normalizeAST(node[key], identMode);
  }
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4 — AST HASHING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute a SHA-256 hash of a normalized AST.
 *
 * Two programs that are structurally identical (after normalization) will
 * produce the same hash.  This is useful for exact-match detection of
 * Type-1 clones (positions stripped, same structure) and, with
 * identMode="abstract", for Type-2 clones (positions + names stripped).
 *
 * @param {any}    normalizedAST  Output of normalizeAST().
 * @param {"hex"|"base64"} [encoding="hex"]
 * @returns {string}  Hash string.
 */
export function hashAST(normalizedAST, encoding = "hex") {
  const canonical = JSON.stringify(normalizedAST);
  return createHash("sha256").update(canonical).digest(encoding);
}

/**
 * Convenience: build, normalize and hash in one call.
 *
 * @param {string} source
 * @param {{ ecmaVersion?: number, sourceType?: string,
 *           identMode?: "keep"|"abstract",
 *           encoding?: "hex"|"base64" }} [opts]
 * @returns {{ hash: string, normalizedAST: any }}
 */
export function hashSource(source, opts = {}) {
  const ast            = buildAST(source, opts);
  const normalizedAST  = normalizeAST(ast, opts.identMode ?? "keep");
  const hash           = hashAST(normalizedAST, opts.encoding ?? "hex");
  return { hash, normalizedAST };
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5 — CONTROL FLOW GRAPH (CFG)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A CFG node (basic block).
 *
 * @typedef {Object} CFGNode
 * @property {string}   id          Unique block identifier, e.g. "B0".
 * @property {string}   label       Human-readable description of the block.
 * @property {string[]} stmts       AST node types of statements in this block.
 * @property {string[]} successors  IDs of blocks this block may transfer to.
 * @property {string}   [condition] Stringified test expression (If/Switch/loop).
 */

/**
 * Build a CFG for a single function body (BlockStatement) or for a top-level
 * Program node.
 *
 * Algorithm
 * ─────────
 * We traverse statements left-to-right and emit basic blocks.  A new block
 * starts whenever the previous block ends with a branching statement.
 * Supported control-flow constructs:
 *
 *   IfStatement           → true-branch block + false-branch block (or fall-through)
 *   WhileStatement        → loop-header block + body block + exit block
 *   ForStatement          → same shape as While (init merged into header)
 *   ForInStatement /
 *   ForOfStatement        → same shape as While
 *   DoWhileStatement      → body block first, then header/test block
 *   SwitchStatement       → one block per case + default, fall-through modelled
 *   TryStatement          → try block + catch block + finally block
 *   ReturnStatement /
 *   ThrowStatement        → terminates the current block (no fall-through)
 *   BreakStatement /
 *   ContinueStatement     → terminates the current block with a back/exit edge
 *
 * All other statement types (ExpressionStatement, VariableDeclaration, etc.)
 * are collected into the current linear block.
 *
 * @param {acorn.Node} astNode  A Program node or a FunctionDeclaration /
 *                              FunctionExpression / ArrowFunctionExpression.
 * @returns {{ nodes: CFGNode[], entry: string, exits: string[] }}
 */
export function buildCFG(astNode) {
  const nodes  = [];   // CFGNode[]
  let   nextId = 0;

  // ── internal helpers ────────────────────────────────────────────────────

  function newBlock(label = "") {
    const id = `B${nextId++}`;
    /** @type {CFGNode} */
    const block = { id, label, stmts: [], successors: [] };
    nodes.push(block);
    return block;
  }

  function addEdge(from, toId) {
    if (from && !from.successors.includes(toId)) {
      from.successors.push(toId);
    }
  }

  function exprText(node) {
    if (!node) return "";
    // Best-effort one-line representation for labels
    switch (node.type) {
      case "BinaryExpression":
      case "LogicalExpression":
        return `${exprText(node.left)} ${node.operator} ${exprText(node.right)}`;
      case "UnaryExpression":
        return `${node.operator}${exprText(node.argument)}`;
      case "Identifier":
        return node.name;
      case "Literal":
        return String(node.value);
      case "MemberExpression":
        return `${exprText(node.object)}.${exprText(node.property)}`;
      case "CallExpression":
        return `${exprText(node.callee)}(...)`;
      case "AssignmentExpression":
        return `${exprText(node.left)} ${node.operator} ${exprText(node.right)}`;
      default:
        return node.type;
    }
  }

  /**
   * Process an array of statements into the CFG.
   *
   * @param {acorn.Node[]} stmts      List of statement AST nodes.
   * @param {CFGNode}      current    The block currently being filled.
   * @param {string|null}  breakTarget   ID of the block a break statement jumps to.
   * @param {string|null}  continueTarget ID of the block a continue statement jumps to.
   * @returns {CFGNode|null}  The last block after processing (null if all paths
   *                          terminated with return/throw/break/continue).
   */
  function processStmts(stmts, current, breakTarget = null, continueTarget = null) {
    let cur = current;

    for (const stmt of stmts) {
      if (!cur) break; // previous statement was a terminator

      switch (stmt.type) {

        // ── If ─────────────────────────────────────────────────────────────
        case "IfStatement": {
          cur.stmts.push("IfStatement");
          cur.condition = exprText(stmt.test);
          cur.label     = cur.label || `if (${cur.condition})`;

          const thenBlock = newBlock("then");
          const elseBlock = stmt.alternate ? newBlock("else") : null;
          const exitBlock = newBlock("if-exit");

          addEdge(cur, thenBlock.id);
          if (elseBlock) addEdge(cur, elseBlock.id);
          else           addEdge(cur, exitBlock.id);

          // then branch
          const thenEnd = processStmts(
            stmt.consequent.type === "BlockStatement"
              ? stmt.consequent.body
              : [stmt.consequent],
            thenBlock, breakTarget, continueTarget,
          );
          if (thenEnd) addEdge(thenEnd, exitBlock.id);

          // else branch
          if (elseBlock && stmt.alternate) {
            const elseEnd = processStmts(
              stmt.alternate.type === "BlockStatement"
                ? stmt.alternate.body
                : [stmt.alternate],
              elseBlock, breakTarget, continueTarget,
            );
            if (elseEnd) addEdge(elseEnd, exitBlock.id);
          }

          cur = exitBlock;
          break;
        }

        // ── While ──────────────────────────────────────────────────────────
        case "WhileStatement": {
          const headerBlock = newBlock(`while (${exprText(stmt.test)})`);
          const bodyBlock   = newBlock("while-body");
          const exitBlock   = newBlock("while-exit");

          addEdge(cur, headerBlock.id);
          addEdge(headerBlock, bodyBlock.id);
          addEdge(headerBlock, exitBlock.id);    // condition false

          const bodyEnd = processStmts(
            stmt.body.type === "BlockStatement" ? stmt.body.body : [stmt.body],
            bodyBlock, exitBlock.id, headerBlock.id,
          );
          if (bodyEnd) addEdge(bodyEnd, headerBlock.id);  // back-edge

          cur = exitBlock;
          break;
        }

        // ── For ────────────────────────────────────────────────────────────
        case "ForStatement": {
          // init goes into the current block, then same shape as while
          if (stmt.init) cur.stmts.push(stmt.init.type);

          const test        = stmt.test ? exprText(stmt.test) : "true";
          const headerBlock = newBlock(`for (${test})`);
          const bodyBlock   = newBlock("for-body");
          const exitBlock   = newBlock("for-exit");

          addEdge(cur, headerBlock.id);
          addEdge(headerBlock, bodyBlock.id);
          addEdge(headerBlock, exitBlock.id);

          const bodyEnd = processStmts(
            stmt.body.type === "BlockStatement" ? stmt.body.body : [stmt.body],
            bodyBlock, exitBlock.id, headerBlock.id,
          );
          if (bodyEnd) {
            // update expression before back-edge
            if (stmt.update) bodyEnd.stmts.push(stmt.update.type);
            addEdge(bodyEnd, headerBlock.id);
          }

          cur = exitBlock;
          break;
        }

        // ── ForIn / ForOf ──────────────────────────────────────────────────
        case "ForInStatement":
        case "ForOfStatement": {
          const kind        = stmt.type === "ForInStatement" ? "for..in" : "for..of";
          const headerBlock = newBlock(`${kind} header`);
          const bodyBlock   = newBlock(`${kind}-body`);
          const exitBlock   = newBlock(`${kind}-exit`);

          addEdge(cur, headerBlock.id);
          addEdge(headerBlock, bodyBlock.id);
          addEdge(headerBlock, exitBlock.id);

          const bodyEnd = processStmts(
            stmt.body.type === "BlockStatement" ? stmt.body.body : [stmt.body],
            bodyBlock, exitBlock.id, headerBlock.id,
          );
          if (bodyEnd) addEdge(bodyEnd, headerBlock.id);

          cur = exitBlock;
          break;
        }

        // ── DoWhile ────────────────────────────────────────────────────────
        case "DoWhileStatement": {
          const bodyBlock   = newBlock("do-body");
          const testBlock   = newBlock(`while (${exprText(stmt.test)})`);
          const exitBlock   = newBlock("do-exit");

          addEdge(cur, bodyBlock.id);

          const bodyEnd = processStmts(
            stmt.body.type === "BlockStatement" ? stmt.body.body : [stmt.body],
            bodyBlock, exitBlock.id, testBlock.id,
          );
          if (bodyEnd) addEdge(bodyEnd, testBlock.id);

          addEdge(testBlock, bodyBlock.id);  // true → back
          addEdge(testBlock, exitBlock.id);  // false → exit

          cur = exitBlock;
          break;
        }

        // ── Switch ─────────────────────────────────────────────────────────
        case "SwitchStatement": {
          cur.stmts.push("SwitchStatement");
          cur.condition = exprText(stmt.discriminant);
          cur.label     = cur.label || `switch (${cur.condition})`;

          const exitBlock   = newBlock("switch-exit");
          let   prevBlock   = null;

          for (const caseNode of stmt.cases) {
            const caseLabel = caseNode.test
              ? `case ${exprText(caseNode.test)}`
              : "default";
            const caseBlock = newBlock(caseLabel);

            addEdge(cur, caseBlock.id);              // discriminant → case
            if (prevBlock) addEdge(prevBlock, caseBlock.id); // fall-through

            const caseEnd = processStmts(
              caseNode.consequent, caseBlock, exitBlock.id, null,
            );
            prevBlock = caseEnd; // may fall through to next case
          }

          if (prevBlock) addEdge(prevBlock, exitBlock.id);

          cur = exitBlock;
          break;
        }

        // ── Try / Catch / Finally ──────────────────────────────────────────
        case "TryStatement": {
          const tryBlock     = newBlock("try");
          const catchBlock   = stmt.handler  ? newBlock("catch")   : null;
          const finallyBlock = stmt.finalizer ? newBlock("finally") : null;
          const exitBlock    = newBlock("try-exit");

          addEdge(cur, tryBlock.id);

          const tryEnd = processStmts(
            stmt.block.body, tryBlock, breakTarget, continueTarget,
          );

          // Exception edge
          if (catchBlock) {
            addEdge(tryBlock, catchBlock.id);
            if (tryEnd) addEdge(tryEnd, catchBlock.id);  // implicit throw path

            const catchEnd = processStmts(
              stmt.handler.body.body, catchBlock, breakTarget, continueTarget,
            );
            if (finallyBlock) {
              if (catchEnd) addEdge(catchEnd, finallyBlock.id);
            } else {
              if (catchEnd) addEdge(catchEnd, exitBlock.id);
            }
          } else if (tryEnd) {
            addEdge(tryEnd, finallyBlock ? finallyBlock.id : exitBlock.id);
          }

          if (finallyBlock) {
            const finallyEnd = processStmts(
              stmt.finalizer.body, finallyBlock, breakTarget, continueTarget,
            );
            if (finallyEnd) addEdge(finallyEnd, exitBlock.id);
          }

          cur = exitBlock;
          break;
        }

        // ── Return / Throw  (terminators) ─────────────────────────────────
        case "ReturnStatement":
        case "ThrowStatement": {
          cur.stmts.push(stmt.type);
          cur.label = cur.label || stmt.type;
          cur = null;  // path ends — no fall-through
          break;
        }

        // ── Break ──────────────────────────────────────────────────────────
        case "BreakStatement": {
          cur.stmts.push("BreakStatement");
          if (breakTarget) addEdge(cur, breakTarget);
          cur = null;
          break;
        }

        // ── Continue ───────────────────────────────────────────────────────
        case "ContinueStatement": {
          cur.stmts.push("ContinueStatement");
          if (continueTarget) addEdge(cur, continueTarget);
          cur = null;
          break;
        }

        // ── Nested function declarations: recurse but keep in same CFG ─────
        case "FunctionDeclaration": {
          cur.stmts.push("FunctionDeclaration");
          // The nested function gets its own sub-CFG appended to the same
          // nodes array so callers see the complete picture.
          const subEntry = newBlock(`fn:${stmt.id ? stmt.id.name : "anon"}`);
          addEdge(cur, subEntry.id);  // declaration flow continues after
          processStmts(stmt.body.body, subEntry, null, null);
          // execution continues in cur after the declaration
          break;
        }

        // ── Linear statements (default) ───────────────────────────────────
        default: {
          cur.stmts.push(stmt.type);
          if (!cur.label) cur.label = stmt.type;
          break;
        }
      }
    }

    return cur; // null if all paths terminated
  }

  // ── Entry point ──────────────────────────────────────────────────────────

  let stmtsToProcess;

  switch (astNode.type) {
    case "Program":
      stmtsToProcess = astNode.body;
      break;
    case "FunctionDeclaration":
    case "FunctionExpression":
    case "ArrowFunctionExpression":
      stmtsToProcess = astNode.body.type === "BlockStatement"
        ? astNode.body.body
        : [{ type: "ReturnStatement", argument: astNode.body }];
      break;
    default:
      throw new Error(
        `buildCFG: unsupported root node type "${astNode.type}". ` +
        "Pass a Program, FunctionDeclaration, FunctionExpression or " +
        "ArrowFunctionExpression node.",
      );
  }

  const entryBlock = newBlock("entry");
  const lastBlock  = processStmts(stmtsToProcess, entryBlock, null, null);

  // Collect exit blocks: blocks with no successors
  const exits = nodes
    .filter((b) => b.successors.length === 0)
    .map((b) => b.id);

  return { nodes, entry: entryBlock.id, exits };
}

/**
 * Build a CFG from a file on disk.
 *
 * For multi-function files this returns the top-level Program CFG, which
 * includes edges into nested function declaration sub-graphs.
 *
 * @param {string} filePath
 * @param {object} [opts]   Forwarded to buildAST.
 * @returns {{ nodes: CFGNode[], entry: string, exits: string[] }}
 */
export function buildCFGFromFile(filePath, opts = {}) {
  const ast = buildASTFromFile(filePath, opts);
  return buildCFG(ast);
}
  
// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6 — CLI
// ─────────────────────────────────────────────────────────────────────────────

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const filePath = process.argv[2];
  const mode     = process.argv[3] ?? "tokens"; // tokens | ast | hash | cfg | all

  if (!filePath) {
    console.error(
      "Usage: node Tokenizer-Tokenizr.js <file.js> [tokens|ast|hash|cfg|all]",
    );
    process.exit(1);
  }

  const source = fs.readFileSync(filePath, "utf-8");

  switch (mode) {

    case "tokens": {
      const tokens = tokenizeSource(source);
      tokens.forEach((t) =>
        console.log(`[${t.type}] "${t.value}"  (line ${t.line})`),
      );
      break;
    }

    case "ast": {
      const ast  = buildAST(source);
      const norm = normalizeAST(ast);
      console.log(JSON.stringify(norm, null, 2));
      break;
    }

    case "hash": {
      const { hash: h1 } = hashSource(source, { identMode: "keep"     });
      const { hash: h2 } = hashSource(source, { identMode: "abstract" });
      console.log(JSON.stringify({
        file          : path.basename(filePath),
        hash_type1    : h1,
        hash_type2    : h2,
      }, null, 2));
      break;
    }

    case "cfg": {
      const ast = buildAST(source);
      const cfg = buildCFG(ast);
      console.log(JSON.stringify(cfg, null, 2));
      break;
    }

    case "all": {
      const tokens = tokenizeSource(source);
      const ast    = buildAST(source);
      const norm   = normalizeAST(ast);
      const { hash: h1 } = hashSource(source, { identMode: "keep"     });
      const { hash: h2 } = hashSource(source, { identMode: "abstract" });
      const cfg    = buildCFG(ast);

      console.log(JSON.stringify({
        file          : path.basename(filePath),
        token_count   : tokens.length,
        tokens,
        hash_type1    : h1,
        hash_type2    : h2,
        normalizedAST : norm,
      }, null, 2));
      break;
    }

    default:
      console.error(`Unknown mode "${mode}". Use: tokens | ast | hash | all`);
      process.exit(1);
  }
}
