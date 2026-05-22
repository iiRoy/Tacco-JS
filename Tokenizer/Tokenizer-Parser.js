// -- Example path: ../dataset/'dataset general'/js_files/2.js
// -- Execution command: node Tokenizer-Tokenizr.js ../dataset/'dataset general'/js_files/2.js

import fs   from "fs";
import path from "path";
import { createHash } from "crypto";
import { createRequire } from "module";

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
    console.error(`Unrecognized: "${match[0]}"`);
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
// SECTION 5 — CLI
// ─────────────────────────────────────────────────────────────────────────────

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
    // Print both hashes so callers can compare Type-1 vs Type-2 similarity
    const { hash: h1 } = hashSource(source, { identMode: "keep"     });
    const { hash: h2 } = hashSource(source, { identMode: "abstract" });
    console.log(JSON.stringify({
      file          : path.basename(filePath),
      hash_type1    : h1,   // sensitive to identifier names
      hash_type2    : h2,   // abstracts identifier names → Type-2 matching
    }, null, 2));
    break;
  }


  case "all": {
    const tokens = tokenizeSource(source);
    const ast    = buildAST(source);
    const norm   = normalizeAST(ast);
    const { hash: h1 } = hashSource(source, { identMode: "keep"     });
    const { hash: h2 } = hashSource(source, { identMode: "abstract" });

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
