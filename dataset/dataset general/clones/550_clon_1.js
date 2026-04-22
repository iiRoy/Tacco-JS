// This file defines the syntax highlighting style for JavaScript
// using the CodeHighlighter library.

CodeHighlighter.addStyle(
    "javascript", // The language name for this style
    {
        // Definition for comments in JavaScript
        comment: {
            // Regular expression to match single-line (//) and multi-line (/* ... */) comments
            exp: /(\/\/[^\n]*\n)|(\/\*[^*]*\*+([^\/][^*]*\*+)*\/)/
        },


        // Definition for brackets (parentheses)
        brackets: {
            exp: /\(|\)/ // Matches opening and closing parentheses
        },


        // Definition for string literals
        string: {
            exp: /'[^']*'|"[^"]*"/ // Matches single-quoted or double-quoted strings
        },


        // Definition for JavaScript keywords
        keywords: {
            exp: /\b(arguments|break|case|continue|default|delete|do|else|false|for|function|if|in|instanceof|new|null|return|switch|this|true|typeof|var|void|while|with)\b/
        },


        // Definition for global objects and functions
        global: {
            exp: /\b(toString|valueOf|window|element|prototype|constructor|document|escape|unescape|parseInt|parseFloat|setTimeout|clearTimeout|setInterval|clearInterval|NaN|isNaN|Infinity)\b/
        }
    }
);

// End of JavaScript style definition.