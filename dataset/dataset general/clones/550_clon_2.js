SyntaxDecorator.defineTheme("ecmaScript", {
    // Defines patterns for various syntactic elements within ECMAScript code.
    lineNote: {
        pattern: /(\/\/[^\n]*\n)|(\/\*[^*]*\*+([^\/][^*]*\*+)*\/)/ // Matches both single-line and multi-line comments.
    },
    parentheses: {
        pattern: /\(|\)/ // Matches opening and closing parenthesis symbols.
    },
    textLiteral: {
        pattern: /'[^']*'|"[^"]*"/ // Matches strings enclosed in single or double quotes.
    },
    reservedWords: {
        pattern: /\b(arguments|break|case|continue|default|delete|do|else|false|for|function|if|in|instanceof|new|null|return|switch|this|true|typeof|var|void|while|with)\b/ // Matches JavaScript's reserved keywords.
    },
    builtinObjects: {
        pattern: /\b(toString|valueOf|window|element|prototype|constructor|document|escape|unescape|parseInt|parseFloat|setTimeout|clearTimeout|setInterval|clearInterval|NaN|isNaN|Infinity)\b/ // Matches common global objects and functions.
    }
});