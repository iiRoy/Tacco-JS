// -- Example path: ../dataset\'dataset general'\js_files\2.js
// -- Execution command: node Tokenizer-Tokenizr.js ../dataset\'dataset general'\js_files\2.js

import fs from "fs";
import { Tokenizr } from "tokenizr";

const lexer = new Tokenizr();

// Definition of Token rules

// Keywords list to check against Ident matches
const keywords = [
  "while",
  "for",
  "of",
  "in",
  "if",
  "else",
  "switch",
  "case",
  "break",
  "continue",
  "default",
  "return",
  "throw",
  "try",
  "catch",
  "finally",
  "function",
  "class",
  "extends",
  "new",
  "this",
  "super",
  "const",
  "let",
  "var",
  "import",
  "export",
  "from",
  "typeof",
  "instanceof",
  "void",
  "delete",
  "async",
  "await",
  "yield",
  "static",
  "get",
  "set",
  "null",
  "undefined",
];

// Whitespace and comments (Ignored)
lexer.rule(/\r/, (ctx) => {
  ctx.ignore();
});
lexer.rule(/[ \t]+/, (ctx) => {
  ctx.ignore();
});
lexer.rule(/\n/, (ctx) => {
  ctx.ignore();
});
lexer.rule(/\/\/[^\n]*/, (ctx) => {
  ctx.ignore();
});
lexer.rule(/\/\*[\s\S]*?\*\//, (ctx) => {
  ctx.ignore();
});

// Tokenization of main data types
lexer.rule(/\b(?:true|false)\b/, (ctx) => {
  ctx.accept("Boolean");
}); // Boolean
lexer.rule(/([0-9]+n)|(BigInt\([0-9]+\))/, (ctx) => {
  ctx.accept("Bigint");
}); // Bigint
lexer.rule(/[0-9]+(\.[0-9]+)?/, (ctx) => {
  ctx.accept("Number");
}); // Number
lexer.rule(/(["'])((?:(?!\1)).)*\1/, (ctx) => {
  ctx.accept("String");
}); // String
lexer.rule(/Symbol\(("(?:\\["\\]|[^\n"\\])*")?\)/, (ctx) => {
  ctx.accept("Symbol");
}); // Symbol
lexer.rule(
  /\{[a-zA-Z]+_?:\ ?"(?:\\["\\]|[^\n"\\])*"(?:,\ ?[a-zA-Z]+_?:\ ?"(?:\\["\\]|[^\n"\\])*")*\}/,
  (ctx) => {
    ctx.accept("Object");
  },
); // Object
lexer.rule(
  /\[(?:"(?:\\["\\]|[^\n"\\])*"|[0-9]+)(?:,\ ?(?:"(?:\\["\\]|[^\n"\\])*"|[0-9]+))*\]/,
  (ctx) => {
    ctx.accept("Array");
  },
); // Array
lexer.rule(/new Date\(("[0-9]+-[0-9]+-[0-9]+")?\)/, (ctx) => {
  ctx.accept("Date");
}); // Date

// Tokenization of operators
lexer.rule(/>>>=/, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/\*\*=/, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/<<=/, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/>>=/, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/>>>/, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/&&=/, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/\|\|=/, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/\?\?=/, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/===/, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/!==/, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/\*\*/, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/=>/, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/\.\.\./, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/\?\./, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/\?\?/, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/<</, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/>>/, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/&&/, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/\|\|/, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/\+=/, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/-=/, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/\*=/, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/\/=/, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/%=/, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/&=/, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/\|=/, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/\^=/, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/==/, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/!=/, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/<=/, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/>=/, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/\+\+/, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/--/, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/\+/, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/-/, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/\*/, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/\//, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/%/, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/&/, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/\|/, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/\^/, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/~/, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/!/, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/</, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/>/, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/\?/, (ctx) => {
  ctx.accept("Operator");
});
lexer.rule(/\\/, (ctx) => {
  ctx.accept("Operator");
});

// Tokenization of Identifies and Keywords
lexer.rule(/[a-zA-Z_$][a-zA-Z0-9_$]*/, (ctx, match) => {
  if (keywords.includes(match[0])) ctx.accept("Keyword");
  else ctx.accept("Ident");
});

// Tokenization of special characters
lexer.rule(/\(/, (ctx) => {
  ctx.accept("Lparen");
});
lexer.rule(/\)/, (ctx) => {
  ctx.accept("Rparen");
});
lexer.rule(/\{/, (ctx) => {
  ctx.accept("Lbrace");
});
lexer.rule(/\}/, (ctx) => {
  ctx.accept("Rbrace");
});
lexer.rule(/\[/, (ctx) => {
  ctx.accept("Lbracket");
});
lexer.rule(/\]/, (ctx) => {
  ctx.accept("Rbracket");
});
lexer.rule(/;/, (ctx) => {
  ctx.accept("Semi");
});
lexer.rule(/,/, (ctx) => {
  ctx.accept("Comma");
});
lexer.rule(/=/, (ctx) => {
  ctx.accept("Assign");
});
lexer.rule(/\./, (ctx) => {
  ctx.accept("Dot");
});
lexer.rule(/:/, (ctx) => {
  ctx.accept("Colon");
});

// Identification of illegal characters
lexer.rule(/./, (ctx, match) => {
  console.error(`Unrecognized: "${match[0]}"`);
  ctx.ignore();
});

// Reading of the file from the path given
const filePath = process.argv[2];

if (!filePath) {
  console.error("Usage: node tokenize-tokenizr.js <path/to/your/file>");
  process.exit(1);
}

const source = fs.readFileSync(filePath, "utf-8");

lexer.input(source);

lexer.tokens().forEach((token) => {
  if (token.type === "EOF") return;
  console.log(`[${token.type}] "${token.value}"  (line ${token.line})`);
});
