const moo = require('moo');
const fs = require('fs');

// ── 1. Define your token rules ──────────────────────────────────────────────
const lexer = moo.compile({
  WS:       { match: /[ \t]+/,    lineBreaks: false },
  NL:       { match: /\n/,        lineBreaks: true  },
  comment:  /\/\/.*?$/,
  block_comment: /\/\*[\s\S]*?\*\//,
  number:   /0|[1-9][0-9]*/,
  string:   /"(?:\\["\\]|[^\n"\\])*"/,
  keyword:  ['while', 'if', 'else', 'return', 'function', 'const', 'let', 'var'],
  ident:    /[a-zA-Z_$][a-zA-Z0-9_$]*/,
  lparen:   '(',
  rparen:   ')',
  lbrace:   '{',
  rbrace:   '}',
  semi:     ';',
  comma:    ',',
  assign:   '='
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
  // Skip whitespace/newlines if you don't need them in the output
  if (token.type === 'WS' || token.type === 'NL') continue;

  console.log(`[${token.type}] "${token.value}"  (line ${token.line})`);
}