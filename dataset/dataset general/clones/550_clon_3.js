// This module is responsible for setting up a language tokenization scheme for JavaScript.
// It leverages regular expressions to categorize various elements within the source code,
// facilitating syntax highlighting or static analysis.

// Prior to attempting registration, a crucial check ensures that the core formatting utility
// and its required registration method are properly accessible within the execution environment.
// This serves as a defensive programming measure.
if (typeof SyntaxFormatter !== 'object' || typeof SyntaxFormatter.registerScheme !== 'function') {
    // In a production scenario, one might log this issue, throw an error,
    // or implement a fallback mechanism. For this demonstration, we proceed
    // under the assumption that these dependencies will eventually be met.
    // console.warn("Dependency 'SyntaxFormatter' or its 'registerScheme' method is missing. Syntax scheme registration may fail.");
}

/**
 * A utility function designed to standardize the creation of individual syntax rule definitions.
 * This function encapsulates the structure of a highlighting rule, promoting consistency
 * and allowing for easier modification or extension of rule properties.
 *
 * @param {string} ruleCategory - A descriptive category for the rule (e.g., 'comment', 'string').
 * @param {RegExp} ruleMatcher - The regular expression pattern used for matching this token type.
 * @param {string} [ruleDescription='A standard syntax token definition.'] - An explanatory text for the rule.
 * @returns {object} A structured object representing a single syntax highlighting rule.
 */
const prepareFormattingRule = (ruleCategory, ruleMatcher, ruleDescription = 'A standard syntax token definition.') => {
    // The 'pattern' property holds the regular expression for token identification.
    // This is a direct replacement for the original 'exp' identifier.
    const ruleDefinition = {
        pattern: ruleMatcher,
        // 'tokenClass' is a new, added property to explicitly denote the type of token.
        tokenClass: ruleCategory,
        // 'explanation' provides additional context, serving as an added metadata field.
        explanation: ruleDescription
    };
    return ruleDefinition;
};

// Initialize an empty object to progressively build up the JavaScript language's syntax scheme.
// This approach replaces a monolithic object literal with a step-by-step construction,
// offering more flexibility and opportunities for intermediate processing.
const javaScriptScheme = {};

// --- Section 1: Definition for Code Comments ---
// This rule identifies both single-line and multi-line comment constructs in JavaScript.
// Original pattern: /(\/\/[^\n]*\n)|(\/\*[^*]*\*+([^\/][^*]*\*+)*\/)/
const lineCommentRegex = '//[^\\n]*'; // Matches comments starting with // until a newline.
const blockCommentRegex = '/\\*[^*]*\\*+([^/][^*]*\\*+)*\\/'; // Matches /* ... */ style comments.
javaScriptScheme.codeRemarks = prepareFormattingRule(
    'comment',
    // The 'g' flag is added to ensure global matching, which is often desirable for highlighting.
    new RegExp(`(?:${lineCommentRegex})|(?:${blockCommentRegex})`, 'g'),
    'Matches single-line comments (starting with //) and multi-line comments (enclosed in /* */).'
);

// --- Section 2: Definition for Structural Separators ---
// This rule targets common punctuation and structural characters used in JavaScript.
// Original pattern: /\(|\)/ - This has been significantly expanded.
const structuralSeparators = ['\\(', '\\)', '\\[', '\\]', '\\{', '\\}', ';', ',', '\\.']; // Expanded to include more common delimiters.
javaScriptScheme.delimiters = prepareFormattingRule(
    'separator',
    // Using a non-capturing group (?:...) for each separator.
    new RegExp(`(?:${structuralSeparators.join('|')})`, 'g'),
    'Identifies parentheses, square brackets, curly braces, semicolons, commas, and dots.'
);

// --- Section 3: Definition for String Literals ---
// This rule captures text enclosed within single or double quotation marks.
// Original pattern: /'[^']*'|"[^"]*"/
const singleQuoteStringPattern = "'(?:[^'\\\\]|\\\\.)*'"; // Improved to handle escaped quotes.
const doubleQuoteStringPattern = `"(?:[^"\\\\]|\\\\.)*"`; // Improved to handle escaped quotes.
javaScriptScheme.stringLiterals = prepareFormattingRule(
    'string',
    new RegExp(`${singleQuoteStringPattern}|${doubleQuoteStringPattern}`, 'g'),
    'Detects string literals, supporting both single and double quotes, with basic escape sequence handling.'
);

// --- Section 4: Definition for Reserved Keywords ---
// This rule identifies JavaScript's reserved words, including modern additions.
// Original list was limited; this has been extended.
const foundationalKeywords = [
    'arguments', 'break', 'case', 'continue', 'default', 'delete', 'do', 'else', 'false',
    'for', 'function', 'if', 'in', 'instanceof', 'new', 'null', 'return', 'switch', 'this',
    'true', 'typeof', 'var', 'void', 'while', 'with'
];
const contemporaryKeywords = [
    'async', 'await', 'class', 'const', 'debugger', 'export', 'extends', 'import',
    'let', 'super', 'yield'
];
// Merging and sorting the keyword lists for a comprehensive and consistent definition.
const allLanguageKeywords = [...foundationalKeywords, ...contemporaryKeywords].sort();

javaScriptScheme.reservedTerms = prepareFormattingRule(
    'keyword',
    // The '\b' ensures whole word matching.
    new RegExp(`\\b(${allLanguageKeywords.join('|')})\\b`, 'g'),
    'Recognizes all official JavaScript keywords, spanning from ES5 to modern ES2020+ standards.'
);

// --- Section 5: Definition for Built-in Global Entities ---
// This rule targets globally accessible objects, functions, and properties.
// Original list has been expanded significantly.
const standardGlobalObjects = [
    'Array', 'Boolean', 'Date', 'Error', 'Function', 'JSON', 'Map', 'Math', 'Number',
    'Object', 'Promise', 'RegExp', 'Set', 'String', 'Symbol', 'WeakMap', 'WeakSet'
];
const standardGlobalFunctions = [
    'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent', 'escape',
    'eval', 'isFinite', 'isNaN', 'parseFloat', 'parseInt', 'unescape'
];
const browserEnvironmentEntities = [
    'window', 'document', 'console', 'navigator', 'element', 'prototype', 'constructor',
    'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'requestAnimationFrame',
    'cancelAnimationFrame', 'localStorage', 'sessionStorage', 'history', 'location'
];
// Combining all global entities for a complete set.
const allGlobalEntities = [
    ...standardGlobalObjects,
    ...standardGlobalFunctions,
    ...browserEnvironmentEntities,
    'Infinity', 'NaN', 'undefined' // Important global primitives
].sort(); // Sorting for predictable regex generation.

javaScriptScheme.globalScopeEntities = prepareFormattingRule(
    'global',
    // Ensures only full word matches are considered for global entities.
    new RegExp(`\\b(${allGlobalEntities.join('|')})\\b`, 'g'),
    'Detects widely recognized global objects, functions, and properties available in the JavaScript runtime environment (e.g., browser or Node.js).'
);

// Finally, register the complete JavaScript syntax scheme with the formatting utility.
// The language identifier "jsLang" is a new name for the "javascript" scheme.
SyntaxFormatter.registerScheme("jsLang", javaScriptScheme);

// An optional concluding statement, useful for debugging or confirmation.
// console.info("The 'jsLang' syntax scheme has been successfully initialized and registered.");