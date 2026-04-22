/*
 * This file contains the core Handlebars library functionalities.
 * It defines helper methods for registration and common utilities.
 * Original source: lib/handlebars/base.js
 */

var Handlebars = {}; /* Global object for Handlebars functionality */

Handlebars.VERSION = "1.0.beta.6"; // Current version of the Handlebars library

// Initialize collections for helpers and partials
Handlebars.helpers  = {};
Handlebars.partials = {};


/**
 * Registers a helper function with Handlebars.
 * @param {string} name - The name of the helper.
 * @param {function} fn - The helper function.
 * @param {function} [inverse] - Optional inverse function for block helpers.
 */
Handlebars.registerHelper = function ( name, fn, inverse ) {
    // If an inverse function is provided, attach it to the main function.
    if ( inverse ) {
        fn.not = inverse;
    }
    // Store the helper in the helpers collection.
    this.helpers[ name ] = fn;
};


/**
 * Registers a partial template string with Handlebars.
 * @param {string} name - The name of the partial.
 * @param {string} str - The partial template string.
 */
Handlebars.registerPartial = function ( name, str ) {
    this.partials[ name ] = str;
};


// Register a built-in helper for handling missing helpers.
Handlebars.registerHelper ( 'helperMissing', function ( arg ) {
    // If there are exactly two arguments, it implies a simple variable lookup that failed.
    if ( arguments.length === 2 ) {
        return undefined; // Return undefined for graceful failure.
    }
    // Otherwise, it's a more serious issue, throw an error.
    else {
        throw new Error ( "Could not find property '" + arg + "'" );
    }
});


// Cache Object.prototype.toString and the function type string for performance.
var toString = Object.prototype.toString,
    functionType = "[object Function]";


// Register a built-in helper for block helper logic.
Handlebars.registerHelper ( 'blockHelperMissing', function ( context, options ) {
    // Define an inverse function, defaulting to an empty function if not provided.
    var inverse = options.inverse || function () { },
        fn = options.fn; // The primary block function.

    var ret = ""; // Accumulator for the return string.
    var type = toString.call ( context ); // Determine the type of the context.

    // If context is a function, call it to get the actual value.
    if ( type === functionType ) {
        context = context.call ( this );
    }

    // Handle different context types:
    if ( context === true ) {
        return fn ( this ); // If context is true, execute the primary block.
    } else if ( context === false || context == null ) {
        return inverse ( this ); // If context is false or null/undefined, execute the inverse block.
    } else if ( type === "[object Array]" ) {
        // If context is an array, iterate over it.
        if ( context.length > 0 ) {
            for ( var i = 0, j = context.length; i < j; i++ ) {
                ret = ret + fn ( context[i] ); // Concatenate results of applying block to each item.
            }
        } else {
            ret = inverse ( this ); // If array is empty, execute the inverse block.
        }
        return ret; // Return the accumulated string.
    } else {
        return fn ( context ); // For other types, execute the primary block with the context.
    }
});


// Register the 'each' helper for iterating over arrays.
Handlebars.registerHelper ( 'each', function ( context, options ) {
    var fn = options.fn,
        inverse = options.inverse;
    var ret = ""; // Initialize return string.

    // If context is truthy and has a length property (implies array-like).
    if ( context && context.length > 0 ) {
        for ( var i = 0, j = context.length; i < j; i++ ) {
            ret = ret + fn ( context[i] ); // Apply block to each item.
        }
    } else {
        ret = inverse ( this ); // If no context or empty, execute inverse.
    }
    return ret; // Return the result.
});


// Register the 'if' helper for conditional rendering.
Handlebars.registerHelper ( 'if', function ( context, options ) {
    var type = toString.call ( context );
    // Resolve context if it's a function.
    if ( type === functionType ) {
        context = context.call ( this );
    }

    // Check if context is falsy or an empty Handlebars.Utils object.
    if ( !context || Handlebars.Utils.isEmpty ( context ) ) {
        return options.inverse ( this ); // Execute inverse if condition is false.
    } else {
        return options.fn ( this ); // Execute primary block if condition is true.
    }
});


// Register the 'unless' helper (inverse of 'if').
Handlebars.registerHelper ( 'unless', function ( context, options ) {
    var fn = options.fn,
        inverse = options.inverse;
    // Swap fn and inverse to achieve 'unless' logic.
    options.fn = inverse;
    options.inverse = fn;

    // Delegate to the 'if' helper with swapped functions.
    return Handlebars.helpers['if'].call ( this, context, options );
});


// Register the 'with' helper for changing context.
Handlebars.registerHelper ( 'with', function ( context, options ) {
    return options.fn ( context ); // Execute primary block with the given context.
});


// Register the 'log' helper for logging context.
Handlebars.registerHelper ( 'log', function ( context ) {
    Handlebars.log ( context ); // Calls the Handlebars.log utility.
});

// End of base.js

/**
 * Jison generated parser for Handlebars templates.
 * This section defines the grammar and parsing logic.
 * Original source: lib/handlebars/compiler/parser.js
 */
var handlebars = ( function () {

    // The parser object, containing grammar rules and actions.
    var parser = {
        trace: function trace () { /* Placeholder for tracing functionality */ },
        yy: {}, // Custom properties for the parser.
        symbols_: {
            "error": 2, "root": 3, "program": 4, "EOF": 5, "statements": 6,
            "simpleInverse": 7, "statement": 8, "openInverse": 9, "closeBlock": 10,
            "openBlock": 11, "mustache": 12, "partial": 13, "CONTENT": 14,
            "COMMENT": 15, "OPEN_BLOCK": 16, "inMustache": 17, "CLOSE": 18,
            "OPEN_INVERSE": 19, "OPEN_ENDBLOCK": 20, "path": 21, "OPEN": 22,
            "OPEN_UNESCAPED": 23, "OPEN_PARTIAL": 24, "params": 25, "hash": 26,
            "param": 27, "STRING": 28, "INTEGER": 29, "BOOLEAN": 30,
            "hashSegments": 31, "hashSegment": 32, "ID": 33, "EQUALS": 34,
            "pathSegments": 35, "SEP": 36, "$accept": 0, "$end": 1
        },
        terminals_: {
            2: "error", 5: "EOF", 14: "CONTENT", 15: "COMMENT", 16: "OPEN_BLOCK",
            18: "CLOSE", 19: "OPEN_INVERSE", 20: "OPEN_ENDBLOCK", 22: "OPEN",
            23: "OPEN_UNESCAPED", 24: "OPEN_PARTIAL", 28: "STRING", 29: "INTEGER",
            30: "BOOLEAN", 33: "ID", 34: "EQUALS", 36: "SEP"
        },
        productions_: [
            0, [3, 2], [4, 3], [4, 1], [4, 0], [6, 1], [6, 2], [8, 3], [8, 3],
            [8, 1], [8, 1], [8, 1], [8, 1], [11, 3], [9, 3], [10, 3], [12, 3],
            [12, 3], [13, 3], [13, 4], [7, 2], [17, 3], [17, 2], [17, 2], [17, 1],
            [25, 2], [25, 1], [27, 1], [27, 1], [27, 1], [27, 1], [26, 1], [31, 2],
            [31, 1], [32, 3], [32, 3], [32, 3], [32, 3], [21, 1], [35, 3], [35, 1]
        ],
        performAction: function anonymous ( yytext, yyleng, yylineno, yy, yystate, $$, _$ ) {

            var $0 = $$.length - 1; // Index of the last token in the stack.
            switch ( yystate ) {
                case 1:
                    return $$[$0 - 1]; // Return the program node.
                case 2:
                    this.$ = new yy.ProgramNode ( $$[$0 - 2], $$[$0] ); // Program with inverse.
                    break;
                case 3:
                    this.$ = new yy.ProgramNode ( $$[$0] ); // Program without inverse.
                    break;
                case 4:
                    this.$ = new yy.ProgramNode ( [] ); // Empty program.
                    break;
                case 5:
                    this.$ = [$$[$0]]; // Single statement.
                    break;
                case 6:
                    $$[$0 - 1].push ( $$[$0] );
                    this.$ = $$[$0 - 1]; // Multiple statements.
                    break;
                case 7:
                    this.$ = new yy.InverseNode ( $$[$0 - 2], $$[$0 - 1], $$[$0] ); // Inverse block.
                    break;
                case 8:
                    this.$ = new yy.BlockNode ( $$[$0 - 2], $$[$0 - 1], $$[$0] ); // Regular block.
                    break;
                case 9:
                    this.$ = $$[$0]; // Simple statement.
                    break;
                case 10:
                    this.$ = $$[$0]; // Another simple statement.
                    break;
                case 11:
                    this.$ = new yy.ContentNode ( $$[$0] ); // Content node.
                    break;
                case 12:
                    this.$ = new yy.CommentNode ( $$[$0] ); // Comment node.
                    break;
                case 13:
                    this.$ = new yy.MustacheNode ( $$[$0 - 1][0], $$[$0 - 1][1] ); // Mustache with params.
                    break;
                case 14:
                    this.$ = new yy.MustacheNode ( $$[$0 - 1][0], $$[$0 - 1][1] ); // Inverse mustache.
                    break;
                case 15:
                    this.$ = $$[$0 - 1]; // Close block.
                    break;
                case 16:
                    this.$ = new yy.MustacheNode ( $$[$0 - 1][0], $$[$0 - 1][1] ); // Regular mustache.
                    break;
                case 17:
                    this.$ = new yy.MustacheNode ( $$[$0 - 1][0], $$[$0 - 1][1], true ); // Unescaped mustache.
                    break;
                case 18:
                    this.$ = new yy.PartialNode ( $$[$0 - 1] ); // Partial without context.
                    break;
                case 19:
                    this.$ = new yy.PartialNode ( $$[$0 - 2], $$[$0 - 1] ); // Partial with context.
                    break;
                case 20:
                    // This case does nothing, likely for a production that consumes tokens without producing a node.
                    break;
                case 21:
                    this.$ = [[$$[$0 - 2]].concat ( $$[$0 - 1] ), $$[$0]]; // InMustache with params and hash.
                    break;
                case 22:
                    this.$ = [[$$[$0 - 1]].concat ( $$[$0] ), null]; // InMustache with params only.
                    break;
                case 23:
                    this.$ = [[$$[$0 - 1]], $$[$0]]; // InMustache with a single param and hash.
                    break;
                case 24:
                    this.$ = [[$$[$0]], null]; // InMustache with a single param only.
                    break;
                case 25:
                    $$[$0 - 1].push ( $$[$0] );
                    this.$ = $$[$0 - 1]; // Multiple parameters.
                    break;
                case 26:
                    this.$ = [$$[$0]]; // Single parameter.
                    break;
                case 27:
                    this.$ = $$[$0]; // Parameter is a path.
                    break;
                case 28:
                    this.$ = new yy.StringNode ( $$[$0] ); // Parameter is a string literal.
                    break;
                case 29:
                    this.$ = new yy.IntegerNode ( $$[$0] ); // Parameter is an integer literal.
                    break;
                case 30:
                    this.$ = new yy.BooleanNode ( $$[$0] ); // Parameter is a boolean literal.
                    break;
                case 31:
                    this.$ = new yy.HashNode ( $$[$0] ); // Hash object.
                    break;
                case 32:
                    $$[$0 - 1].push ( $$[$0] );
                    this.$ = $$[$0 - 1]; // Multiple hash segments.
                    break;
                case 33:
                    this.$ = [$$[$0]]; // Single hash segment.
                    break;
                case 34:
                    this.$ = [$$[$0 - 2], $$[$0]]; // Hash segment with ID and Path.
                    break;
                case 35:
                    this.$ = [$$[$0 - 2], new yy.StringNode ( $$[$0] )]; // Hash segment with ID and String.
                    break;
                case 36:
                    this.$ = [$$[$0 - 2], new yy.IntegerNode ( $$[$0] )]; // Hash segment with ID and Integer.
                    break;
                case 37:
                    this.$ = [$$[$0 - 2], new yy.BooleanNode ( $$[$0] )]; // Hash segment with ID and Boolean.
                    break;
                case 38:
                    this.$ = new yy.IdNode ( $$[$0] ); // ID node.
                    break;
                case 39:
                    $$[$0 - 2].push ( $$[$0] );
                    this.$ = $$[$0 - 2]; // Multiple path segments.
                    break;
                case 40:
                    this.$ = [$$[$0]]; // Single path segment.
                    break;
            }
        },
        table: [
            { 3: 1, 4: 2, 5: [2, 4], 6: 3, 8: 4, 9: 5, 11: 6, 12: 7, 13: 8, 14: [1, 9], 15: [1, 10], 16: [1, 12], 19: [1, 11], 22: [1, 13], 23: [1, 14], 24: [1, 15] },
            { 1: [3] },
            { 5: [1, 16] },
            { 5: [2, 3], 7: 17, 8: 18, 9: 5, 11: 6, 12: 7, 13: 8, 14: [1, 9], 15: [1, 10], 16: [1, 12], 19: [1, 19], 20: [2, 3], 22: [1, 13], 23: [1, 14], 24: [1, 15] },
            { 5: [2, 5], 14: [2, 5], 15: [2, 5], 16: [2, 5], 19: [2, 5], 20: [2, 5], 22: [2, 5], 23: [2, 5], 24: [2, 5] },
            { 4: 20, 6: 3, 8: 4, 9: 5, 11: 6, 12: 7, 13: 8, 14: [1, 9], 15: [1, 10], 16: [1, 12], 19: [1, 11], 20: [2, 4], 22: [1, 13], 23: [1, 14], 24: [1, 15] },
            { 4: 21, 6: 3, 8: 4, 9: 5, 11: 6, 12: 7, 13: 8, 14: [1, 9], 15: [1, 10], 16: [1, 12], 19: [1, 11], 20: [2, 4], 22: [1, 13], 23: [1, 14], 24: [1, 15] },
            { 5: [2, 9], 14: [2, 9], 15: [2, 9], 16: [2, 9], 19: [2, 9], 20: [2, 9], 22: [2, 9], 23: [2, 9], 24: [2, 9] },
            { 5: [2, 10], 14: [2, 10], 15: [2, 10], 16: [2, 10], 19: [2, 10], 20: [2, 10], 22: [2, 10], 23: [2, 10], 24: [2, 10] },
            { 5: [2, 11], 14: [2, 11], 15: [2, 11], 16: [2, 11], 19: [2, 11], 20: [2, 11], 22: [2, 11], 23: [2, 11], 24: [2, 11] },
            { 5: [2, 12], 14: [2, 12], 15: [2, 12], 16: [2, 12], 19: [2, 12], 20: [2, 12], 22: [2, 12], 23: [2, 12], 24: [2, 12] },
            { 17: 22, 21: 23, 33: [1, 25], 35: 24 },
            { 17: 26, 21: 23, 33: [1, 25], 35: 24 },
            { 17: 27, 21: 23, 33: [1, 25], 35: 24 },
            { 17: 28, 21: 23, 33: [1, 25], 35: 24 },
            { 21: 29, 33: [1, 25], 35: 24 },
            { 1: [2, 1] },
            { 6: 30, 8: 4, 9: 5, 11: 6, 12: 7, 13: 8, 14: [1, 9], 15: [1, 10], 16: [1, 12], 19: [1, 11], 22: [1, 13], 23: [1, 14], 24: [1, 15] },
            { 5: [2, 6], 14: [2, 6], 15: [2, 6], 16: [2, 6], 19: [2, 6], 20: [2, 6], 22: [2, 6], 23: [2, 6], 24: [2, 6] },
            { 17: 22, 18: [1, 31], 21: 23, 33: [1, 25], 35: 24 },
            { 10: 32, 20: [1, 33] },
            { 10: 34, 20: [1, 33] },
            { 18: [1, 35] },
            { 18: [2, 24], 21: 40, 25: 36, 26: 37, 27: 38, 28: [1, 41], 29: [1, 42], 30: [1, 43], 31: 39, 32: 44, 33: [1, 45], 35: 24 },
            { 18: [2, 38], 28: [2, 38], 29: [2, 38], 30: [2, 38], 33: [2, 38], 36: [1, 46] },
            { 18: [2, 40], 28: [2, 40], 29: [2, 40], 30: [2, 40], 33: [2, 40], 36: [2, 40] },
            { 18: [1, 47] },
            { 18: [1, 48] },
            { 18: [1, 49] },
            { 18: [1, 50], 21: 51, 33: [1, 25], 35: 24 },
            { 5: [2, 2], 8: 18, 9: 5, 11: 6, 12: 7, 13: 8, 14: [1, 9], 15: [1, 10], 16: [1, 12], 19: [1, 11], 20: [2, 2], 22: [1, 13], 23: [1, 14], 24: [1, 15] },
            { 14: [2, 20], 15: [2, 20], 16: [2, 20], 19: [2, 20], 22: [2, 20], 23: [2, 20], 24: [2, 20] },
            { 5: [2, 7], 14: [2, 7], 15: [2, 7], 16: [2, 7], 19: [2, 7], 20: [2, 7], 22: [2, 7], 23: [2, 7], 24: [2, 7] },
            { 21: 52, 33: [1, 25], 35: 24 },
            { 5: [2, 8], 14: [2, 8], 15: [2, 8], 16: [2, 8], 19: [2, 8], 20: [2, 8], 22: [2, 8], 23: [2, 8], 24: [2, 8] },
            { 14: [2, 14], 15: [2, 14], 16: [2, 14], 19: [2, 14], 20: [2, 14], 22: [2, 14], 23: [2, 14], 24: [2, 14] },
            { 18: [2, 22], 21: 40, 26: 53, 27: 54, 28: [1, 41], 29: [1, 42], 30: [1, 43], 31: 39, 32: 44, 33: [1, 45], 35: 24 },
            { 18: [2, 23] },
            { 18: [2, 26], 28: [2, 26], 29: [2, 26], 30: [2, 26], 33: [2, 26] },
            { 18: [2, 31], 32: 55, 33: [1, 56] },
            { 18: [2, 27], 28: [2, 27], 29: [2, 27], 30: [2, 27], 33: [2, 27] },
            { 18: [2, 28], 28: [2, 28], 29: [2, 28], 30: [2, 28], 33: [2, 28] },
            { 18: [2, 29], 28: [2, 29], 29: [2, 29], 30: [2, 29], 33: [2, 29] },
            { 18: [2, 30], 28: [2, 30], 29: [2, 30], 30: [2, 30], 33: [2, 30] },
            { 18: [2, 33], 33: [2, 33] },
            { 18: [2, 40], 28: [2, 40], 29: [2, 40], 30: [2, 40], 33: [2, 40], 34: [1, 57], 36: [2, 40] },
            { 33: [1, 58] },
            { 14: [2, 13], 15: [2, 13], 16: [2, 13], 19: [2, 13], 20: [2, 13], 22: [2, 13], 23: [2, 13], 24: [2, 13] },
            { 5: [2, 16], 14: [2, 16], 15: [2, 16], 16: [2, 16], 19: [2, 16], 20: [2, 16], 22: [2, 16], 23: [2, 16], 24: [2, 16] },
            { 5: [2, 17], 14: [2, 17], 15: [2, 17], 16: [2, 17], 19: [2, 17], 20: [2, 17], 22: [2, 17], 23: [2, 17], 24: [2, 17] },
            { 5: [2, 18], 14: [2, 18], 15: [2, 18], 16: [2, 18], 19: [2, 18], 20: [2, 18], 22: [2, 18], 23: [2, 18], 24: [2, 18] },
            { 18: [1, 59] },
            { 18: [1, 60] },
            { 18: [2, 21] },
            { 18: [2, 25], 28: [2, 25], 29: [2, 25], 30: [2, 25], 33: [2, 25] },
            { 18: [2, 32], 33: [2, 32] },
            { 34: [1, 57] },
            { 21: 61, 28: [1, 62], 29: [1, 63], 30: [1, 64], 33: [1, 25], 35: 24 },
            { 18: [2, 39], 28: [2, 39], 29: [2, 39], 30: [2, 39], 33: [2, 39], 36: [2, 39] },
            { 5: [2, 19], 14: [2, 19], 15: [2, 19], 16: [2, 19], 19: [2, 19], 20: [2, 19], 22: [2, 19], 23: [2, 19], 24: [2, 19] },
            { 5: [2, 15], 14: [2, 15], 15: [2, 15], 16: [2, 15], 19: [2, 15], 20: [2, 15], 22: [2, 15], 23: [2, 15], 24: [2, 15] },
            { 18: [2, 34], 33: [2, 34] },
            { 18: [2, 35], 33: [2, 35] },
            { 18: [2, 36], 33: [2, 36] },
            { 18: [2, 37], 33: [2, 37] }
        ],
        defaultActions: {
            16: [2, 1],
            37: [2, 23],
            53: [2, 21]
        },
        parseError: function parseError ( str, hash ) {
            throw new Error ( str );
        },
        parse: function parse ( input ) {
            var self = this,
                stack = [0],
                vstack = [null],
                lstack = [],
                table = this.table,
                yytext = "",
                yylineno = 0,
                yyleng = 0,
                recovering = 0,
                TERROR = 2,
                EOF = 1;

            this.lexer.setInput ( input );
            this.lexer.yy = this.yy;
            this.yy.lexer = this.lexer;

            if ( typeof this.lexer.yylloc == "undefined" ) {
                this.lexer.yylloc = {};
            }
            var yyloc = this.lexer.yylloc;
            lstack.push ( yyloc );

            if ( typeof this.yy.parseError === "function" ) {
                this.parseError = this.yy.parseError;
            }

            // Pops n states from the stack.
            function popStack ( n ) {
                stack.length = stack.length - 2 * n;
                vstack.length = vstack.length - n;
                lstack.length = lstack.length - n;
            }

            // Gets the next token from the lexer.
            function lex () {
                var token;
                token = self.lexer.lex () || 1; // EOF is token 1.
                if ( typeof token !== "number" ) {
                    token = self.symbols_[token] || token;
                }
                return token;
            }

            var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;

            while ( true ) {
                state = stack[stack.length - 1]; // Current state is the top of the stack.

                if ( this.defaultActions[state] ) {
                    action = this.defaultActions[state];
                } else {
                    if ( symbol == null ) {
                        symbol = lex (); // Get the next symbol if not already available.
                    }
                    action = table[state] && table[state][symbol]; // Look up action in the parse table.
                }

                // Error handling for undefined or invalid actions.
                if ( typeof action === "undefined" || !action.length || !action[0] ) {
                    if ( !recovering ) {
                        expected = [];
                        for ( p in table[state] ) {
                            if ( this.terminals_[p] && p > 2 ) {
                                expected.push ( "'" + this.terminals_[p] + "'" );
                            }
                        }
                        var errStr = "";
                        if ( this.lexer.showPosition ) {
                            errStr = "Parse error on line " + ( yylineno + 1 ) + ":\n" + this.lexer.showPosition () + "\nExpecting " + expected.join ( ", " ) + ", got '" + this.terminals_[symbol] + "'";
                        } else {
                            errStr = "Parse error on line " + ( yylineno + 1 ) + ": Unexpected " + ( symbol == 1 ? "end of input" : "'" + ( this.terminals_[symbol] || symbol ) + "'" );
                        }
                        this.parseError ( errStr, { text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected } );
                    }
                }

                if ( action[0] instanceof Array && action.length > 1 ) {
                    throw new Error ( "Parse Error: multiple actions possible at state: " + state + ", token: " + symbol );
                }

                // Execute the action based on its type.
                switch ( action[0] ) {
                    case 1: // Shift action.
                        stack.push ( symbol );
                        vstack.push ( this.lexer.yytext );
                        lstack.push ( this.lexer.yylloc );
                        stack.push ( action[1] );
                        symbol = null;
                        if ( !preErrorSymbol ) {
                            yyleng = this.lexer.yyleng;
                            yytext = this.lexer.yytext;
                            yylineno = this.lexer.yylineno;
                            yyloc = this.lexer.yylloc;
                            if ( recovering > 0 ) {
                                recovering--;
                            }
                        } else {
                            symbol = preErrorSymbol;
                            preErrorSymbol = null;
                        }
                        break;

                    case 2: // Reduce action.
                        len = this.productions_[action[1]][1]; // Number of symbols to pop.
                        yyval.$ = vstack[vstack.length - len]; // Value of the reduced non-terminal.
                        yyval._$ = {
                            first_line: lstack[lstack.length - ( len || 1 )].first_line,
                            last_line: lstack[lstack.length - 1].last_line,
                            first_column: lstack[lstack.length - ( len || 1 )].first_column,
                            last_column: lstack[lstack.length - 1].last_column
                        };
                        r = this.performAction.call ( yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack );

                        if ( typeof r !== "undefined" ) {
                            return r; // If action returns a value, it's the final parse result.
                        }

                        if ( len ) {
                            stack = stack.slice ( 0, -1 * len * 2 );
                            vstack = vstack.slice ( 0, -1 * len );
                            lstack = lstack.slice ( 0, -1 * len );
                        }

                        stack.push ( this.productions_[action[1]][0] ); // Push the non-terminal symbol.
                        vstack.push ( yyval.$ ); // Push its value.
                        lstack.push ( yyval._$ ); // Push its location.
                        newState = table[stack[stack.length - 2]][stack[stack.length - 1]]; // Get the new state.
                        stack.push ( newState ); // Push the new state.
                        break;

                    case 3: // Accept action.
                        return true;
                }
            }
            return true; // Should ideally be unreachable.
        }
    };

    /* Jison generated lexer */
    var lexer = ( function () {

        var lexer = ({
            EOF: 1, // End Of File token.
            parseError: function parseError ( str, hash ) {
                if ( this.yy.parseError ) {
                    this.yy.parseError ( str, hash );
                } else {
                    throw new Error ( str );
                }
            },
            setInput: function ( input ) {
                this._input = input;
                this._more = this._less = this.done = false;
                this.yylineno = this.yyleng = 0;
                this.yytext = this.matched = this.match = '';
                this.conditionStack = ['INITIAL'];
                this.yylloc = { first_line: 1, first_column: 0, last_line: 1, last_column: 0 };
                return this;
            },
            input: function () {
                var ch = this._input[0];
                this.yytext += ch;
                this.yyleng++;
                this.match += ch;
                this.matched += ch;
                var lines = ch.match ( /\n/ );
                if ( lines ) {
                    this.yylineno++;
                }
                this._input = this._input.slice ( 1 );
                return ch;
            },
            unput: function ( ch ) {
                this._input = ch + this._input;
                return this;
            },
            more: function () {
                this._more = true;
                return this;
            },
            pastInput: function () {
                var past = this.matched.substr ( 0, this.matched.length - this.match.length );
                return ( past.length > 20 ? '...' : '' ) + past.substr ( -20 ).replace ( /\n/g, "" );
            },
            upcomingInput: function () {
                var next = this.match;
                if ( next.length < 20 ) {
                    next += this._input.substr ( 0, 20 - next.length );
                }
                return ( next.substr ( 0, 20 ) + ( next.length > 20 ? '...' : '' ) ).replace ( /\n/g, "" );
            },
            showPosition: function () {
                var pre = this.pastInput ();
                var c = new Array ( pre.length + 1 ).join ( "-" );
                return pre + this.upcomingInput () + "\n" + c + "^";
            },
            next: function () {
                if ( this.done ) {
                    return this.EOF;
                }
                if ( !this._input ) {
                    this.done = true;
                }

                var token,
                    match,
                    col,
                    lines;

                if ( !this._more ) {
                    this.yytext = '';
                    this.match = '';
                }

                var rules = this._currentRules ();
                for ( var i = 0; i < rules.length; i++ ) {
                    match = this._input.match ( this.rules[rules[i]] );
                    if ( match ) {
                        lines = match[0].match ( /\n.*/g );
                        if ( lines ) {
                            this.yylineno += lines.length;
                        }
                        this.yylloc = {
                            first_line: this.yylloc.last_line,
                            last_line: this.yylineno + 1,
                            first_column: this.yylloc.last_column,
                            last_column: lines ? lines[lines.length - 1].length - 1 : this.yylloc.last_column + match[0].length
                        };
                        this.yytext += match[0];
                        this.match += match[0];
                        this.matches = match;
                        this.yyleng = this.yytext.length;
                        this._more = false;
                        this._input = this._input.slice ( match[0].length );
                        this.matched += match[0];
                        token = this.performAction.call ( this, this.yy, this, rules[i], this.conditionStack[this.conditionStack.length - 1] );
                        if ( token ) {
                            return token;
                        } else {
                            return;
                        }
                    }
                }
                if ( this._input === "" ) {
                    return this.EOF;
                } else {
                    this.parseError ( 'Lexical error on line ' + ( this.yylineno + 1 ) + '. Unrecognized text.\n' + this.showPosition (),
                        { text: "", token: null, line: this.yylineno } );
                }
            },
            lex: function lex () {
                var r = this.next ();
                if ( typeof r !== 'undefined' ) {
                    return r;
                } else {
                    return this.lex ();
                }
            },
            begin: function begin ( condition ) {
                this.conditionStack.push ( condition );
            },
            popState: function popState () {
                return this.conditionStack.pop ();
            },
            _currentRules: function _currentRules () {
                return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
            },
            topState: function () {
                return this.conditionStack[this.conditionStack.length - 2];
            },
            pushState: function begin ( condition ) {
                this.begin ( condition );
            }
        });

        // Lexer actions mapped to rules.
        lexer.performAction = function anonymous ( yy, yy_, $avoiding_name_collisions, YY_START ) {

            var YYSTATE = YY_START; // Current lexer state.
            switch ( $avoiding_name_collisions ) {
                case 0:
                    if ( yy_.yytext.slice ( -1 ) !== "\\" ) {
                        this.begin ( "mu" );
                    }
                    if ( yy_.yytext.slice ( -1 ) === "\\" ) {
                        yy_.yytext = yy_.yytext.substr ( 0, yy_.yyleng - 1 ), this.begin ( "emu" );
                    }
                    if ( yy_.yytext ) {
                        return 14;
                    }
                    break;
                case 1:
                    return 14; // CONTENT token.
                case 2:
                    this.popState ();
                    return 14; // CONTENT token, pop state.
                case 3:
                    return 24; // OPEN_PARTIAL token.
                case 4:
                    return 16; // OPEN_BLOCK token.
                case 5:
                    return 20; // OPEN_ENDBLOCK token.
                case 6:
                    return 19; // OPEN_INVERSE token.
                case 7:
                    return 19; // OPEN_INVERSE token (for 'else').
                case 8:
                    return 23; // OPEN_UNESCAPED token.
                case 9:
                    return 23; // OPEN_UNESCAPED token (for '&').
                case 10:
                    yy_.yytext = yy_.yytext.substr ( 3, yy_.yyleng - 5 );
                    this.popState ();
                    return 15; // COMMENT token.
                case 11:
                    return 22; // OPEN token.
                case 12:
                    return 34; // EQUALS token.
                case 13:
                    return 33; // ID token (for dot).
                case 14:
                    return 33; // ID token (for dot-dot).
                case 15:
                    return 36; // SEP token.
                case 16:
                    /* Ignore whitespace */
                    break;
                case 17:
                    this.popState ();
                    return 18; // CLOSE token.
                case 18:
                    this.popState ();
                    return 18; // CLOSE token.
                case 19:
                    yy_.yytext = yy_.yytext.substr ( 1, yy_.yyleng - 2 ).replace ( /\\"/g, '"' );
                    return 28; // STRING token.
                case 20:
                    return 30; // BOOLEAN token (true).
                case 21:
                    return 30; // BOOLEAN token (false).
                case 22:
                    return 29; // INTEGER token.
                case 23:
                    return 33; // ID token.
                case 24:
                    yy_.yytext = yy_.yytext.substr ( 1, yy_.yyleng - 2 );
                    return 33; // ID token (for bracketed IDs).
                case 25:
                    return 'INVALID'; // Invalid token.
                case 26:
                    return 5; // EOF token.
            }
        };

        // Lexer rules (regular expressions).
        lexer.rules = [
            /^[^\x00]*?(?=(\{\{))/,
            /^[^\x00]+/,
            /^[^\x00]{2,}?(?=(\{\{))/,
            /^\{\{>/,
            /^\{\{#/,
            /^\{\{\//,
            /^\{\{\^/,
            /^\{\{\s*else\b/,
            /^\{\{\{/,
            /^\{\{&/,
            /^\{\{![\s\S]*?\}\}/,
            /^\{\{/,
            /^=/,
            /^\.(?=[} ])/,
            /^\.\./,
            /^[\/.]/,
            /^\s+/,
            /^\}\}\}/,
            /^\}\}/,
            /^"(\\["]|[^"])*"/,
            /^true(?=[}\s])/,
            /^false(?=[}\s])/,
            /^[0-9]+(?=[}\s])/,
            /^[a-zA-Z0-9_$-]+(?=[=}\s\/.])/,
            /^\[[^\]]*\]/,
            /^./,
            /^$/
        ];

        // Lexer conditions (states).
        lexer.conditions = {
            "mu": { "rules": [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26], "inclusive": false },
            "emu": { "rules": [2], "inclusive": false },
            "INITIAL": { "rules": [0, 1, 26], "inclusive": true }
        };
        return lexer;
    })();

    parser.lexer = lexer; // Attach the lexer to the parser.
    return parser; // Return the configured parser.
})();

// CommonJS module export for Node.js environments.
if ( typeof require !== 'undefined' && typeof exports !== 'undefined' ) {
    exports.parser = handlebars; // Export the parser object.
    exports.parse = function () {
        return handlebars.parse.apply ( handlebars, arguments ); // Wrapper for the parse function.
    };
    exports.main = function commonjsMain ( args ) {
        if ( !args[1] ) {
            throw new Error ( 'Usage: ' + args[0] + ' FILE' ); // Error for incorrect usage.
        }
        var source;
        if ( typeof process !== 'undefined' ) {
            // Node.js environment.
            var fs = require ( 'fs' );
            var path = require ( 'path' );
            source = fs.readFileSync ( path.join ( process.cwd (), args[1] ), "utf8" );
        } else {
            // Other environments (e.g., CommonJS for browsers).
            var cwd = require ( "file" ).path ( require ( "file" ).cwd () );
            source = cwd.join ( args[1] ).read ( { charset: "utf-8" } );
        }
        return exports.parser.parse ( source ); // Parse the file content.
    };
    // If this script is run directly (not required as a module).
    if ( typeof module !== 'undefined' && require.main === module ) {
        // Determine arguments based on environment.
        exports.main ( typeof process !== 'undefined' ? process.argv.slice ( 1 ) : require ( "system" ).args );
    }
}