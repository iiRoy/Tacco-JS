// -- Example path: ../dataset\'dataset general'\js_files\2.js
// -- Execution command: node Tokenizer-Moo.js ../dataset\'dataset general'\js_files\2.js

const moo = require('moo');
const fs  = require('fs');

// Definition of Token rules
const lexer = moo.compile({
  WS:            { match: /[ \t]+/,    lineBreaks: false },
  NL:            { match: /\r?\n/, lineBreaks: true },
  Block_comment: { match: /\/\*[\s\S]*?\*\//, lineBreaks: true },
  Comment:       { match: /\/\/[^\n]*/, lineBreaks: false },
  Regex: { match: /\/(?:[^\/\\\n]|\\.)+\/[gimsuy]*/, lineBreaks: false },

  // Operators
  Op_unsign_rsh_assign: '>>>=',
  Op_exp_assign:        '**=',
  Op_lsh_assign:        '<<=',
  Op_rsh_assign:        '>>=',
  Op_and_assign:        '&&=',
  Op_or_assign:         '||=',
  Op_nullish_assign:    '??=',
  Op_strict_eq:         '===',
  Op_strict_neq:        '!==',
  Op_unsign_rsh:        '>>>',
  Op_exp:               '**',
  Op_arrow:             '=>',
  Op_spread:            '...',
  Op_optional_chain:    '?.',
  Op_nullish:           '??',
  Op_lsh:               '<<',
  Op_rsh:               '>>',
  Op_logical_and:       '&&',
  Op_logical_or:        '||',
  Op_plus_assign:       '+=',
  Op_minus_assign:      '-=',
  Op_mul_assign:        '*=',
  Op_div_assign:        '/=',
  Op_mod_assign:        '%=',
  Op_band_assign:       '&=',
  Op_bor_assign:        '|=',
  Op_xor_assign:        '^=',
  Op_eq:                '==',
  Op_neq:               '!=',
  Op_lte:               '<=',
  Op_gte:               '>=',
  Op_incr:              '++',
  Op_decr:              '--',
  Op_plus:              '+',
  Op_minus:             '-',
  Op_mul:               '*',
  Op_div:               '/',
  Op_mod:               '%',
  Op_band:              '&',
  Op_bor:               '|',
  Op_xor:               '^',
  Op_bnot:              '~',
  Op_not:               '!',
  Op_lt:                '<',
  Op_gt:                '>',
  Op_ternary:           '?',

  // Data types
  Bigint:  /[0-9]+n/,
  Number:  /[0-9]+(?:\.[0-9]+)?/,
  String_double:   /"(?:\\["\\]|[^\n"\\])*"/,
  String_single:   /'(?:\\['\\]|[^\n'\\])*'/,
  String_template: { match: /`(?:\\[\s\S]|[^`\\])*`/, lineBreaks: true },

  // Keywords and identifiers
  Keyword: {
    match: /[a-zA-Z_$][a-zA-Z0-9_$]*/,
    type: moo.keywords({
      Keyword: [
        'while', 'for', 'of', 'in',
        'if', 'else', 'switch', 'case', 'break', 'continue', 'default',
        'return', 'throw', 'try', 'catch', 'finally',
        'function', 'class', 'extends', 'new', 'this', 'super',
        'const', 'let', 'var',
        'import', 'export', 'from',
        'typeof', 'instanceof', 'void', 'delete',
        'true', 'false', 'null', 'undefined',
        'async', 'await', 'yield',
        'static', 'get', 'set',
      ]
    })
  },
  Ident: /[a-zA-Z_$][a-zA-Z0-9_$]*/,

  // Punctuation
  Lparen:   '(',
  Rparen:   ')',
  Lbrace:   '{',
  Rbrace:   '}',
  Lbracket: '[',
  Rbracket: ']',
  Semi:     ';',
  Comma:    ',',
  Colon:    ':',
  Dot:      '.',
  Assign:   '=',
});

// Read the file from the path given
const filePath = process.argv[2];

if (!filePath) {
  console.error('Usage: node Tokenizer-Moo.js <path/to/your/file>');
  process.exit(1);
}

const source = fs.readFileSync(filePath, 'utf-8');

// Feed the source to Moo and write output
lexer.reset(source);

const lines = [];

for (const token of lexer) {
  if (token.type === 'WS' || token.type === 'NL') continue;
  lines.push(`[${token.type}] "${token.value}"  (line ${token.line})`);
}

fs.writeFileSync('Moo.txt', lines.join('\n'), 'utf-8');
console.log(`Done! ${lines.length} tokens written to Moo.txt`);