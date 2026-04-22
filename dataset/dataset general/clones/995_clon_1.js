! function ( e ) {
    /*
     * This is an immediately invoked function expression (IIFE)
     * It handles module loading for different environments:
     * CommonJS (Node.js), AMD (RequireJS), or global scope (browser).
     */
    if ( "object" == typeof exports && "undefined" != typeof module ) {
        // CommonJS environment
        module.exports = e();
    }
    else if ( "function" == typeof define && define.amd ) {
        // AMD environment
        define( [], e );
    }
    else {
        // Browser or global scope
        var f; /* Declare a variable 'f' to hold the global object. */
        if ( "undefined" != typeof window ) {
            f = window; /* Assign window object if available. */
        }
        else if ( "undefined" != typeof global ) {
            f = global; /* Assign global object if available (e.g., Node.js global). */
        }
        else if ( "undefined" != typeof self ) {
            f = self; /* Assign self object if available (e.g., Web Workers). */
        }
        f.cssprima = e(); /* Expose the module globally under 'cssprima'. */
    }
} ( function () {
    /* This is the main module definition function. */

    var define , module , exports; /* These variables might be used by webpack/browserify. */

    return ( function e( t , n , r ) {
        /*
         * This is a simplified webpack/browserify-like module loader.
         * It manages module dependencies and exports.
         */
        function s( o , u ) {
            /* Helper function to require modules. */
            if ( ! n[ o ] ) {
                if ( ! t[ o ] ) {
                    var a = typeof require == "function" && require;
                    if ( ! u && a ) {
                        return a( o , ! 0 );
                    }
                    if ( i ) {
                        return i( o , ! 0 );
                    }
                    throw new Error( "Cannot find module '" + o + "'" );
                }
                var f = n[ o ] = { exports : {} };
                t[ o ][ 0 ].call( f.exports , function ( e ) {
                    var n = t[ o ][ 1 ][ e ];
                    return s( n ? n : e );
                } , f , f.exports , e , t , n , r );
            }
            return n[ o ].exports;
        }

        var i = typeof require == "function" && require; /* Check for global 'require' function. */

        for ( var o = 0 ; o < r.length ; o ++ ) {
            s( r[ o ] ); /* Load initial modules. */
        }

        return s; /* Return the module loading function. */

    } ) ( {
        // Module 1: Main API entry point.
        1 : [ function ( _dereq_ , module , exports ) {
            'use strict'; /* Enforce strict mode for cleaner code. */

            var API
                , Types = _dereq_( './Types.js' ) // Import token types.
                , Tokenizer = _dereq_( './Tokenizer/Tokenizer.js' ) // Import tokenizer.
                ;

            // The core API is primarily defined in Parser/EntryPoints.
            API = _dereq_( './Parser/EntryPoints.js' );

            // Expose token types via the API.
            API.Types = Types;

            /**
             * Tokenizes the input string into a list of tokens.
             * @param {string} input - The string to tokenize.
             * @returns {Array<Object>} An array of token objects.
             */
            API.tokenize = function ( input ) {
                var token /* Current token being processed. */
                    , tokens = [] /* Array to store all tokens. */
                    , tokenizer = new Tokenizer( input ) /* Initialize tokenizer with input. */
                    ;

                for ( ; ; ) { /* Infinite loop, broken by EOF. */
                    tokenizer.consumeNextToken(); // Get the next token from the input stream.
                    token = tokenizer.getCurrentToken(); // Retrieve the token.

                    if ( token.type === Types.EOF ) {
                        break; // End of file reached, exit loop.
                    }

                    tokens.push( token ); // Add the token to the list.
                }

                return tokens; // Return the complete list of tokens.
            };

            module.exports = API; // Export the API object.

        } , { "./Parser/EntryPoints.js" : 3 , "./Tokenizer/Tokenizer.js" : 8 , "./Types.js" : 9 } ] ,

        // Module 2: Parser Algorithms.
        2 : [ function ( _dereq_ , module , exports ) {
            'use strict';

            var Types = _dereq_( '../Types.js' ) // Token types.
                , Tokenizer = _dereq_( '../Tokenizer/Tokenizer.js' ) // Tokenizer instance.

                , consumeRules // Function to consume a list of rules.
                , consumeAtRule // Function to consume an at-rule.
                , consumeQualifiedRule // Function to consume a qualified rule.
                , consumeDeclarations // Function to consume a list of declarations.
                , consumeDeclaration // Function to consume a single declaration.
                , consumeComponentValue // Function to consume a component value.
                , consumeSimpleBlock // Function to consume a simple block.
                , consumeFunction // Function to consume a function.
                ;

            /*
             * CSS Syntax Module Level 3
             * 5.4: Parser Algorithms
             * ------------------------------------------------------------------
             */

            // 5.4.1: Consume a list of rules
            // ------------------------------------------------------------------
            consumeRules = function ( tokenizer , toplevel ) {
                var rules , rule , error; // Declare local variables.

                error = {
                    type : Types.ERROR ,
                    value : 'invalid' /* Default error object. */
                };

                // Create an initially empty list of rules.
                rules = [];

                for ( ; ; ) { // Loop until EOF.
                    // Repeatedly consume the next input token:
                    tokenizer.consumeNextToken();

                    switch ( tokenizer.getCurrentToken().type ) {
                        case Types.WHITESPACE:
                            // Do nothing with whitespace tokens.
                            break;
                        case Types.EOF:
                            // End of input reached. Return the collected rules.
                            return rules;
                        case Types.CDO: // <!--
                        case Types.CDC: // -->
                            // If the top-level flag is set, these are ignored.
                            if ( ! toplevel ) {
                                // Otherwise, reconsume the current input token.
                                tokenizer.reconsumeCurrentToken();

                                // Consume a qualified rule.
                                rule = consumeQualifiedRule( tokenizer );

                                // If a rule was successfully returned, append it.
                                if ( rule ) {
                                    rules.push( rule );
                                }
                                else {
                                    rules.push( error ); // Push an error if rule consumption failed.
                                }
                            }
                            break;
                        case Types.AT_KEYWORD:
                            // Reconsume the current input token to process it again.
                            tokenizer.reconsumeCurrentToken();

                            // Consume an at-rule (e.g., @media, @import).
                            rule = consumeAtRule( tokenizer );

                            // If anything is returned, append it to the list of rules.
                            if ( rule ) {
                                rules.push( rule );
                            }
                            else {
                                rules.push( error ); // Error handling for at-rule.
                            }
                            break;
                        default:
                            // For any other token type, reconsume.
                            tokenizer.reconsumeCurrentToken();

                            // Consume a qualified rule (e.g., a selector block).
                            rule = consumeQualifiedRule( tokenizer );

                            // If a valid rule is found, add it.
                            if ( rule ) {
                                rules.push( rule );
                            }
                            else {
                                rules.push( error ); // Add an error if qualified rule parsing fails.
                            }
                            break;
                    }
                }
            };

            exports.consumeRules = consumeRules; /* Export the consumeRules function. */

            // 5.4.2: Consume an at-rule
            // ------------------------------------------------------------------
            consumeAtRule = function ( tokenizer ) {
                var atRule , returnValue; // Declare variables for the at-rule and component value.

                // Consume the next input token. This should be an AT_KEYWORD.
                tokenizer.consumeNextToken();

                // Create a new at-rule object.
                atRule = {
                    type : Types.AT_RULE ,
                    name : tokenizer.getCurrentToken().value , // Name is the value of the AT_KEYWORD.
                    prelude : [] , // Initialize prelude as an empty list.
                    value : null // Block value, initially null.
                };

                for ( ; ; ) { // Loop to consume prelude and block.
                    // Repeatedly consume the next input token:
                    tokenizer.consumeNextToken();

                    switch ( tokenizer.getCurrentToken().type ) {
                        case Types.SEMICOLON:
                        case Types.EOF:
                            // Semicolon or EOF marks the end of the at-rule.
                            return atRule;
                        case Types.LEFT_BRACE:
                            // A left brace indicates the start of a block.
                            // Consume a simple block and assign it to the at-rule’s block.
                            atRule.block = consumeSimpleBlock( tokenizer );

                            // After consuming the block, the at-rule is complete.
                            return atRule;
                        default:
                            // Any other token is part of the prelude.
                            // Reconsume the current input token.
                            tokenizer.reconsumeCurrentToken();

                            // Consume a component value.
                            returnValue = consumeComponentValue( tokenizer );

                            // Append the returned value to the at-rule’s prelude.
                            atRule.prelude.push( returnValue );
                    }
                }
            };

            exports.consumeAtRule = consumeAtRule; /* Export the at-rule consumption function. */

            // 5.4.3: Consume a qualified rule
            // ------------------------------------------------------------------
            consumeQualifiedRule = function ( tokenizer ) {
                var qualifiedRule , returnValue; // Variables for the rule and component value.

                // Create a new qualified rule object.
                qualifiedRule = {
                    type : Types.QUALIFIED_RULE ,
                    prelude : [] , // Selector list or other prelude.
                    value : null // Declaration block.
                };

                for ( ; ; ) { // Loop to consume prelude and block.
                    // Repeatedly consume the next input token:
                    tokenizer.consumeNextToken();

                    switch ( tokenizer.getCurrentToken().type ) {
                        case Types.EOF:
                            // This is a parse error if EOF is encountered before a block.
                            return null;
                        case Types.LEFT_BRACE:
                            // A left brace indicates the start of the declaration block.
                            // Consume a simple block and assign it to the qualified rule’s block.
                            qualifiedRule.block = consumeSimpleBlock( tokenizer );

                            // The qualified rule is now complete.
                            return qualifiedRule;
                        default:
                            // Any other token is part of the prelude.
                            // Reconsume the current input token.
                            tokenizer.reconsumeCurrentToken();

                            // Consume a component value (e.g., selector parts).
                            returnValue = consumeComponentValue( tokenizer );

                            // Append the returned value to the qualified rule’s prelude.
                            qualifiedRule.prelude.push( returnValue );
                    }
                }
            };

            exports.consumeQualifiedRule = consumeQualifiedRule; /* Export qualified rule consumption. */

            // 5.4.4: Consume a list of declarations
            // ------------------------------------------------------------------
            consumeDeclarations = function ( tokenizer ) {
                var declarations , temporaryList , returnValue; // Variables for lists and return values.

                // Create an initially empty list of declarations.
                declarations = [];

                // Repeatedly consume the next input token:
                for ( ; ; ) {
                    tokenizer.consumeNextToken();

                    switch ( tokenizer.getCurrentToken().type ) {
                        case Types.WHITESPACE:
                        case Types.SEMICOLON:
                            // Whitespace and semicolons are ignored here.
                            break;
                        case Types.EOF:
                            // End of input. Return the collected declarations.
                            return declarations;
                        case Types.AT_KEYWORD:
                            // An at-keyword might start an at-rule within a declaration list.
                            // Reconsume the current input token.
                            tokenizer.reconsumeCurrentToken();

                            // Consume an at-rule.
                            returnValue = consumeAtRule( tokenizer );

                            // Append the returned rule to the list of declarations.
                            declarations.push( returnValue );
                            break;
                        case Types.IDENT:
                            // An identifier token typically starts a declaration.
                            // Initialize a temporary list with the current input token.
                            temporaryList = [ tokenizer.getCurrentToken() ];

                            // As long as the next input token is anything other than a <semicolon-token>
                            // or <EOF-token>, consume a component value and append it to the temporary list.
                            while ( tokenizer.getNextToken().type !== Types.SEMICOLON
                                && tokenizer.getNextToken().type !== Types.EOF ) {

                                temporaryList.push( consumeComponentValue( tokenizer ) );
                            }

                            // Consume a declaration from the temporary list of tokens.
                            // A new tokenizer is created for this sub-list.
                            returnValue = consumeDeclaration( new Tokenizer( temporaryList ) );

                            // If a declaration was successfully parsed, add it.
                            if ( returnValue ) {
                                declarations.push( returnValue );
                            }
                            else {
                                declarations.push( {
                                    type : Types.ERROR ,
                                    value : 'invalid' // Mark as invalid if parsing failed.
                                } );
                            }
                            break;
                        default:
                            // This is a parse error for unexpected tokens.
                            declarations.push( {
                                type : Types.ERROR ,
                                value : 'invalid'
                            } );

                            // Reconsume the current input token to start error recovery.
                            tokenizer.reconsumeCurrentToken();

                            // As long as the next input token is anything other than a
                            // <semicolon-token> or <EOF-token>, consume a component value
                            // and throw away the returned value to skip past the error.
                            while ( tokenizer.getNextToken().type !== Types.SEMICOLON
                                && tokenizer.getNextToken().type !== Types.EOF ) {

                                consumeComponentValue( tokenizer );
                            }
                    }
                }
            };

            exports.consumeDeclarations = consumeDeclarations; /* Export the declarations parser. */

            // 5.4.5: Consume a declaration
            // ------------------------------------------------------------------
            consumeDeclaration = function ( tokenizer ) {
                var declaration /* The declaration object to build. */
                    , firstNonWhitespaceToken /* Used for '!important' check. */
                    , secondNonWhitespaceToken /* Used for '!important' check. */
                    , i , j /* Loop counters for finding 'important'. */
                    ;

                // Consume the next input token. This should be the property name.
                tokenizer.consumeNextToken();

                // Create a new declaration object.
                declaration = {
                    type : Types.DECLARATION ,
                    name : tokenizer.getCurrentToken().value , // Property name.
                    value : [] // Property value (list of component values).
                };

                // While the next input token is a <whitespace-token>, consume it.
                while ( tokenizer.getNextToken().type === Types.WHITESPACE ) {
                    tokenizer.consumeNextToken();
                }

                // If the next input token is anything other than a <colon-token>,
                // this is a parse error. Declarations require a colon.
                if ( tokenizer.getNextToken().type !== Types.COLON ) {
                    // Return nothing to indicate a failure to parse a valid declaration.
                    return null;
                }

                // Otherwise, consume the next input token (the colon).
                tokenizer.consumeNextToken();

                // As long as the next input token is anything other than an <EOF-token>,
                // consume a component value and append it to the declaration’s value.
                while ( tokenizer.getNextToken().type !== Types.EOF ) {
                    declaration.value.push( consumeComponentValue( tokenizer ) );
                }

                // Check for '!important' suffix:
                // If the last two non-<whitespace-token>s in the declaration’s value are a
                // <delim-token> with the value "!" followed by an <ident-token> with a
                // value that is an ASCII case-insensitive match for "important", remove
                // them from the declaration’s value and set the declaration’s important
                // flag to true.

                // Find the last '!' delim token.
                for ( j = declaration.value.length - 1 ; j >= 0 ; j -= 1 ) {
                    if ( declaration.value[ j ].type === Types.DELIM
                        && declaration.value[ j ].value === '!' ) {

                        firstNonWhitespaceToken = declaration.value[ j ];
                        break;
                    }
                }

                // Find the 'important' ident token after the '!'
                for ( i = j + 1 ; i < declaration.value.length ; i += 1 ) {
                    if ( declaration.value[ i ].type === Types.IDENT
                        && declaration.value[ i ].value.toLowerCase() === 'important' ) {

                        secondNonWhitespaceToken = declaration.value[ i ];
                        break;
                    }
                }

                if ( firstNonWhitespaceToken ) {
                    if ( secondNonWhitespaceToken ) {
                        declaration.important = true; // Set important flag.
                        declaration.value.splice( i , 1 ); // Remove 'important' token.
                        declaration.value.splice( j , 1 ); // Remove '!' token.
                    }
                    else {
                        // If '!' is present but not followed by 'important'.
                        return {
                            type : Types.ERROR ,
                            value : 'invalid'
                        };
                    }
                }

                // Return the completed declaration.
                return declaration;
            };

            exports.consumeDeclaration = consumeDeclaration; /* Export the declaration parser. */

            // 5.4.6: Consume a component value
            // ------------------------------------------------------------------
            consumeComponentValue = function ( tokenizer ) {
                // Consume the next input token.
                tokenizer.consumeNextToken();

                switch ( tokenizer.getCurrentToken().type ) {
                    case Types.LEFT_BRACE: // {
                    case Types.LEFT_BRACKET: // [
                    case Types.LEFT_PAREN: // (
                        // If the current input token is a <{-token>, <[-token>, or <(-token>,
                        // consume a simple block and return it.
                        return consumeSimpleBlock( tokenizer );
                    case Types.FUNCTION:
                        // Otherwise, if the current input token is a <function-token>,
                        // consume a function and return it.
                        return consumeFunction( tokenizer );
                    case Types.RIGHT_BRACE: // }
                    case Types.RIGHT_BRACKET: // ]
                    case Types.RIGHT_PAREN: // )
                        // These are unexpected closing tokens when consuming a single component value.
                        return {
                            type : Types.ERROR ,
                            value : tokenizer.getCurrentToken().value
                        };
                }

                // Otherwise, return the current input token itself as a component value.
                return tokenizer.getCurrentToken();
            };

            exports.consumeComponentValue = consumeComponentValue; /* Export the component value parser. */

            // 5.4.7: Consume a simple block
            // ------------------------------------------------------------------
            consumeSimpleBlock = function ( tokenizer ) {
                var mirrorVariant , endingToken , simpleBlock; // Variables for matching tokens and the block.

                // Map opening tokens to their closing counterparts.
                mirrorVariant = {};
                mirrorVariant[ Types.LEFT_BRACE ] = Types.RIGHT_BRACE;
                mirrorVariant[ Types.LEFT_PAREN ] = Types.RIGHT_PAREN;
                mirrorVariant[ Types.LEFT_BRACKET ] = Types.RIGHT_BRACKET;

                // The ending token is the mirror variant of the current input token.
                // (E.g. if it was called with <[-token>, the ending token is <]-token>.)
                endingToken = mirrorVariant[ tokenizer.getCurrentToken().type ];

                // Create a simple block object.
                simpleBlock = {
                    type : Types.SIMPLE_BLOCK ,
                    associatedToken : tokenizer.getCurrentToken() , // The opening token.
                    value : [] // List of component values within the block.
                };

                for ( ; ; ) { // Loop until the ending token or EOF is found.
                    // Repeatedly consume the next input token and process it as follows:
                    tokenizer.consumeNextToken();

                    switch ( tokenizer.getCurrentToken().type ) {
                        case Types.EOF:
                        case endingToken:
                            // End of block or end of file reached.
                            return simpleBlock;
                        default:
                            // Reconsume the current input token.
                            tokenizer.reconsumeCurrentToken();

                            // Consume a component value and append it
                            // to the value of the block.
                            simpleBlock.value.push( consumeComponentValue( tokenizer ) );
                    }
                }
            };

            exports.consumeSimpleBlock = consumeSimpleBlock; /* Export the simple block parser. */

            // 5.4.8: Consume a function
            // ------------------------------------------------------------------
            consumeFunction = function ( tokenizer ) {
                var phunction; // Using 'phunction' to avoid potential keyword clash, though 'function' is fine.

                // Create a function object.
                phunction = {
                    type : 'Function' , // Note: The spec uses 'function', but the Types enum might have a different value.
                    name : tokenizer.getCurrentToken().value , // The name of the function (e.g., 'url').
                    value : [] // List of component values within the function's arguments.
                };

                for ( ; ; ) { // Loop until the closing parenthesis or EOF.
                    // Repeatedly consume the next input token and process it as follows:
                    tokenizer.consumeNextToken();

                    switch ( tokenizer.getCurrentToken().type ) {
                        case Types.EOF:
                        case Types.RIGHT_PAREN:
                            // End of function or end of file.
                            return phunction;
                        default:
                            // Reconsume the current input token.
                            tokenizer.reconsumeCurrentToken();

                            // Consume a component value and append the returned value
                            // to the function’s value.
                            phunction.value.push( consumeComponentValue( tokenizer ) );
                    }
                }
            };

            exports.consumeFunction = consumeFunction; /* Export the function parser. */

        } , { "../Tokenizer/Tokenizer.js" : 8 , "../Types.js" : 9 } ] ,

        // Module 3: Parser Entry Points.
        3 : [ function ( _dereq_ , module , exports ) {
            'use strict';

            var Types = _dereq_( '../Types.js' ) /* Token types for reference. */
                , Algorithms = _dereq_( './Algorithms.js' ) /* Core parsing algorithms. */
                , Tokenizer = _dereq_( '../Tokenizer/Tokenizer.js' ) /* The tokenizer. */
                ;

            // 5.3: Parser Entry Points
            // ------------------------------------------------------------------

            // 5.3.1: Parse a stylesheet
            // ------------------------------------------------------------------
            exports.parseStylesheet = function ( input ) {
                /*
                 * This function serves as the entry point for parsing a complete CSS stylesheet.
                 * It initializes the tokenizer and then uses the `consumeRules` algorithm
                 * to process the entire input, treating it as a top-level context.
                 */