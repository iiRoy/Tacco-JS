// -- Example path: ../dataset\'dataset general'\js_files\2.js
// -- Execution command: node Tokenizer-Moo.js ../dataset\'dataset general'\js_files\2.js

const moo = require('moo');
const fs = require('fs');

// ── 1. Definition of Token rules ──────────────────────────────────────────────
const lexer = moo.compile({
  WS:       { match: /[ \t]+/,    lineBreaks: false },
  NL:       { match: /\n/,        lineBreaks: true  },
  Comment:  /\/\/.*?$/,
  Block_comment: /\/\*[\s\S]*?\*\//,
  Number:    /[0-9]+(.[0-9]+)?/,Number: /[0-9]+(?:\.[0-9]+)?/,
  Bigint:    /([0-9]+n)|(BigInt\([0-9]+\))/,
  String:    /"(?:\\["\\]|[^\n"\\])*"/,
  Boolean:   /true|false/,
  Undefined: /let\ [a-zA-Z]+/,
  Null:      /null/,
  Symbol:    /Symbol\(("(?:\\["\\]|[^\n"\\])*")?\)/,
  Object:    /{[a-zA-Z]+\_?:\ ?("(?:\\["\\]|[^\n"\\])*")(\ ?,\ ?[a-zA-Z]+\_?:\ ?("(?:\\["\\]|[^\n"\\])*"))*\}/,
  Array:     /\[("(?:\\["\\]|[^\n"\\])*"|[0-9]+)|(\ ?,\ ?("(?:\\["\\]|[^\n"\\])*"|[0-9]))*\]/,
  Data:      /new Date\(("[0-9]+-[0-9]+-[0-9]+")?\)/,
  Lparen:    '(',
  Rparen:    ')',
  Lbrace:    '{',
  Rbrace:    '}',
  Semi:      ';',
  Comma:     ',',
  Assign:    '=',
  Keyword: [
  'while', 'for', 'of', 'in',
  'if', 'else', 'switch', 'case', 'break', 'continue', 'default',
  'return', 'throw', 'try', 'catch', 'finally',
  'function', 'class', 'extends', 'new', 'this', 'super',
  'const', 'let', 'var',
  'import', 'export', 'from', 'default',
  'typeof', 'instanceof', 'void', 'delete',
  'true', 'false', 'null', 'undefined',
  'async', 'await', 'yield',
  'static', 'get', 'set',
  ]
});

// ── 2. Read the file from the path given as a CLI argument ──────────────────
const filePath = process.argv[2];

if (!filePath) {
  console.error('Usage: node tokenize.js <path/to/your/file>');
  process.exit(1);
}

const source = fs.readFileSync(filePath, 'utf-8');

// ── 3. Feed the source to Moo and print tokens ─────────────────────────────
lexer.reset(source);

for (const token of lexer) {
  // Skip whitespace/newlines unnnecesary in the output
  if (token.type === 'WS' || token.type === 'NL') continue;

  console.log(`[${token.type}] "${token.value}"  (line ${token.line})`);
}