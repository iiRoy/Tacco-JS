!function(globObj) {
    if ("object" == typeof expMod && "undefined" != typeof curMod) {
        curMod.exports = globObj();
    } else if ("function" == typeof defFunc && defFunc.amd) {
        defFunc([], globObj);
    } else {
        var glVar;
        if ("undefined" != typeof winObj) {
            glVar = winObj;
        } else if ("undefined" != typeof glbVar) {
            glVar = glbVar;
        } else if ("undefined" != typeof slfVar) {
            glVar = slfVar;
        }
        glVar.styleParser = globObj();
    }
}(function() {
    var defFunc, curMod, expMod;
    return (function packLoader(modDefs, modCache, entryPoints) {
        function getModule(modId, isRoot) {
            if (!modCache[modId]) {
                if (!modDefs[modId]) {
                    var reqFunc = typeof reqRef == "function" && reqRef;
                    if (!isRoot && reqFunc) {
                        return reqFunc(modId, true);
                    }
                    if (baseReq) {
                        return baseReq(modId, true);
                    }
                    throw new Error("Cannot find module '" + modId + "'");
                }
                var modObj = modCache[modId] = {
                    exports: {}
                };
                modDefs[modId][0].call(modObj.exports, function(depId) {
                    var depPath = modDefs[modId][1][depId];
                    return getModule(depPath ? depPath : depId);
                }, modObj, modObj.exports, packLoader, modDefs, modCache, entryPoints);
            }
            return modCache[modId].exports;
        }
        var baseReq = typeof reqRef == "function" && reqRef;
        for (var modIdx = 0; modIdx < entryPoints.length; modIdx++) {
            getModule(entryPoints[modIdx]);
        }
        return getModule(entryPoints[0]);
    })({
        1: [function(_req_, curMod, expMod) {
            'use strict';

            // This module serves as the primary interface for the CSS parsing library.
            // It integrates the lexical analysis and parsing components.

            var StyleAPI_Main, // The main API object to be exposed
                KindConstants = _req_('./Types.js'), // Imports the constants defining token categories
                Lexer = _req_('./Tokenizer/Tokenizer.js'); // Imports the Lexer class for tokenization

            // Load the core parsing entry points, which contain the main parsing functions.
            StyleAPI_Main = _req_('./Parser/EntryPoints.js');

            // Attach the token kind constants directly to the main API for easy access.
            StyleAPI_Main.KindConstants = KindConstants;

            /**
             * Performs lexical analysis on the given source text and returns a list of tokens.
             * @param {string} sourceText - The CSS source code string to tokenize.
             * @returns {Array<Object>} An array of token objects.
             */
            StyleAPI_Main.lexicalAnalyze = function(sourceText) {
                var lexItem, // Variable to hold the current token being processed
                    lexItems = [], // Array to accumulate all tokens
                    textLexer = new Lexer(sourceText); // Initializes the lexical analyzer

                // Loop indefinitely until the end of the input stream is reached.
                for (;;) {
                    textLexer.processNextElement(); // Advances the lexer to the next token
                    lexItem = textLexer.retrieveCurrentElement(); // Retrieves the token that was just processed

                    // If the current token signifies the end of the file, break the loop.
                    if (lexItem.category === KindConstants.END_OF_FILE) {
                        break;
                    }

                    lexItems.append(lexItem); // Adds the current token to the list of collected tokens
                }

                return lexItems; // Returns the complete list of tokens
            };

            // Export the main API object so it's accessible to other modules.
            curMod.exports = StyleAPI_Main;

        }, {
            "./Parser/EntryPoints.js": 3,
            "./Tokenizer/Tokenizer.js": 8,
            "./Types.js": 9
        }],
        2: [function(_req_, curMod, expMod) {
            'use strict';

            // This module contains the core parsing algorithms for CSS.
            // It implements the logic described in the CSS Syntax Module Level 3 specification.

            var KindConstants = _req_('../Types.js'), // Imports constants for various token categories
                Lexer = _req_('../Tokenizer/Tokenizer.js'), // Imports the Lexer class for token stream management

                processRuleList, // Function to parse a sequence of CSS rules
                processAtDirective, // Function to parse an @-rule (e.g., @media, @import)
                processQualifiedDirective, // Function to parse a qualified rule (e.g., selector { declarations })
                processDeclList, // Function to parse a list of declarations within a rule's block
                processSingleDecl, // Function to parse a single CSS declaration (property: value)
                processComponentValue, // Function to parse a single component value (e.g., token, block, function)
                processSimpleBlock, // Function to parse a block enclosed by braces, brackets, or parentheses
                processFuncBlock; // Function to parse a CSS function (e.g., url(), rgb())

            // CSS Syntax Module Level 3: Section 5.4 - Parsing Routines
            // -------------------------------------------------------------

            // 5.4.1: Process a sequence of rules
            // -----------------------------------
            /**
             * Consumes a stream of tokens to produce a list of CSS rules.
             * @param {Lexer} lexicalAnalyzer - The tokenizer instance to read tokens from.
             * @param {boolean} isTopLevel - Flag indicating if parsing at the top-level of a stylesheet.
             * @returns {Array<Object>} A list of parsed rule objects.
             */
            processRuleList = function(lexicalAnalyzer, isTopLevel) {
                var parsedRules, currentRule, parseError;

                // Define a generic error object for parsing failures.
                parseError = {
                    category: KindConstants.ERROR_TOKEN,
                    content: 'malformed_syntax'
                };

                // Initialize an empty array to store the rules found.
                parsedRules = [];
                // Loop continuously to consume tokens until the end of the input.
                for (;;) {
                    // Get the next token from the input stream.
                    lexicalAnalyzer.processNextElement();

                    // Evaluate the type of the current token to decide the parsing path.
                    switch (lexicalAnalyzer.retrieveCurrentElement().category) {
                        case KindConstants.WHITESPACE_TOKEN:
                            // Whitespace tokens are ignored in this context.
                            break;
                        case KindConstants.END_OF_FILE:
                            // End of file indicates the completion of rule parsing.
                            return parsedRules; // Return the accumulated rules.
                        case KindConstants.COMMENT_DELIMITER_OPEN: // CDO (<!--)
                        case KindConstants.COMMENT_DELIMITER_CLOSE: // CDC (-->)
                            // CDO/CDC handling differs based on whether we are at the top-level.
                            if (!isTopLevel) {
                                // If not top-level, these tokens might signify a qualified rule.
                                lexicalAnalyzer.revertCurrentElement(); // Put the token back for re-consumption.

                                // Attempt to parse a qualified rule.
                                currentRule = processQualifiedDirective(lexicalAnalyzer);

                                // If a rule was successfully parsed, add it to the list.
                                if (currentRule) {
                                    parsedRules.append(currentRule);
                                } else {
                                    parsedRules.append(parseError); // Otherwise, record a parse error.
                                }
                            }
                            // If at top-level, CDO/CDC are simply ignored (do nothing).
                            break;
                        case KindConstants.AT_KEYWORD_TOKEN:
                            // An @-keyword signals the start of an at-directive.
                            lexicalAnalyzer.revertCurrentElement(); // Re-consume the token to be processed by `processAtDirective`.

                            // Attempt to parse an at-directive.
                            currentRule = processAtDirective(lexicalAnalyzer);

                            // If a directive was successfully parsed, add it to the list.
                            if (currentRule) {
                                parsedRules.append(currentRule);
                            } else {
                                parsedRules.append(parseError); // Otherwise, record a parse error.
                            }
                            break;
                        default:
                            // For any other token, it's assumed to be the start of a qualified rule.
                            lexicalAnalyzer.revertCurrentElement(); // Re-consume the token.

                            // Attempt to parse a qualified rule.
                            currentRule = processQualifiedDirective(lexicalAnalyzer);

                            // If a rule was successfully parsed, add it to the list.
                            if (currentRule) {
                                parsedRules.append(currentRule);
                            } else {
                                parsedRules.append(parseError); // Otherwise, record a parse error.
                            }
                            break;
                    }
                }
            };

            expMod.processRuleList = processRuleList; // Export the function for parsing rule lists.

            // 5.4.2: Process an at-directive
            // -------------------------------
            /**
             * Consumes tokens to parse a single CSS @-rule.
             * @param {Lexer} lexicalAnalyzer - The tokenizer instance.
             * @returns {Object} The parsed at-directive object.
             */
            processAtDirective = function(lexicalAnalyzer) {
                var atDirectiveNode, parsedValue;

                // The first token (the @-keyword) has already been processed and its value is needed.
                lexicalAnalyzer.processNextElement();

                // Create a new object representing the at-directive.
                atDirectiveNode = {
                    category: KindConstants.AT_DIRECTIVE, // Indicates this is an at-directive.
                    directiveName: lexicalAnalyzer.retrieveCurrentElement().content, // The name of the directive (e.g., "media").
                    initialPart: [], // An array to store the prelude (tokens between @name and { or ;).
                    codeBlock: null // Will hold the block if present (e.g., { ... }).
                };

                // Loop to consume tokens for the directive's prelude and optional block.
                for (;;) {
                    lexicalAnalyzer.processNextElement(); // Get the next token.

                    switch (lexicalAnalyzer.retrieveCurrentElement().category) {
                        case KindConstants.SEMICOLON_TOKEN:
                        case KindConstants.END_OF_FILE:
                            // A semicolon or EOF terminates the at-directive (without a block).
                            return atDirectiveNode; // Return the completed directive.
                        case KindConstants.LEFT_BRACE_TOKEN:
                            // A left brace indicates the start of a block for the at-directive.
                            atDirectiveNode.codeBlock = processSimpleBlock(lexicalAnalyzer); // Parse the block content.

                            return atDirectiveNode; // Return the directive including its block.
                        default:
                            // Any other token is considered part of the directive's prelude.
                            lexicalAnalyzer.revertCurrentElement(); // Re-consume the token to be parsed as a component value.

                            parsedValue = processComponentValue(lexicalAnalyzer); // Parse a single component value.

                            atDirectiveNode.initialPart.append(parsedValue); // Add the parsed value to the prelude.
                    }
                }
            };

            expMod.processAtDirective = processAtDirective; // Export the function for parsing at-directives.

            // 5.4.3: Process a qualified directive
            // ------------------------------------
            /**
             * Consumes tokens to parse a single CSS qualified rule (selector block).
             * @param {Lexer} lexicalAnalyzer - The tokenizer instance.
             * @returns {Object|null} The parsed qualified directive object, or null if parsing failed (e.g., EOF before block).
             */
            processQualifiedDirective = function(lexicalAnalyzer) {
                var qualifiedDirectiveNode, parsedValue;

                // Create a new object to represent the qualified rule.
                qualifiedDirectiveNode = {
                    category: KindConstants.QUALIFIED_DIRECTIVE, // Indicates this is a qualified rule.
                    initialPart: [], // An array to store the prelude (e.g., the selector tokens).
                    codeBlock: null // Will hold the declaration block (e.g., { color: red; }).
                };

                // Loop to consume tokens for the rule's prelude and block.
                for (;;) {
                    lexicalAnalyzer.processNextElement(); // Get the next token.

                    switch (lexicalAnalyzer.retrieveCurrentElement().category) {
                        case KindConstants.END_OF_FILE:
                            // Reaching EOF here is a parse error for a qualified rule.
                            return null; // Indicate failure by returning null.
                        case KindConstants.LEFT_BRACE_TOKEN:
                            // A left brace indicates the start of the declaration block.
                            qualifiedDirectiveNode.codeBlock = processSimpleBlock(lexicalAnalyzer); // Parse the block content.

                            return qualifiedDirectiveNode; // Return the complete qualified rule.
                        default:
                            // Any other token is part of the qualified rule's prelude (selector).
                            lexicalAnalyzer.revertCurrentElement(); // Re-consume the token.

                            parsedValue = processComponentValue(lexicalAnalyzer); // Parse a single component value.

                            qualifiedDirectiveNode.initialPart.append(parsedValue); // Add the parsed value to the prelude.
                    }
                }
            };

            expMod.processQualifiedDirective = processQualifiedDirective; // Export the function for parsing qualified directives.

            // 5.4.4: Process a sequence of declarations
            // -----------------------------------------
            /**
             * Consumes tokens to parse a list of CSS declarations within a block.
             * @param {Lexer} lexicalAnalyzer - The tokenizer instance.
             * @returns {Array<Object>} A list of parsed declaration objects.
             */
            processDeclList = function(lexicalAnalyzer) {
                var declarationItems, tempItemList, parsedResult;

                // Initialize an empty array to store the declarations.
                declarationItems = [];

                // Loop indefinitely to consume tokens until a block ends or EOF.
                for (;;) {
                    lexicalAnalyzer.processNextElement(); // Get the next token.

                    switch (lexicalAnalyzer.retrieveCurrentElement().category) {
                        case KindConstants.WHITESPACE_TOKEN:
                        case KindConstants.SEMICOLON_TOKEN:
                            // Whitespace and semicolons are ignored at this level.
                            break;
                        case KindConstants.END_OF_FILE:
                            // EOF indicates the end of the declaration list.
                            return declarationItems; // Return the collected declarations.
                        case KindConstants.AT_KEYWORD_TOKEN:
                            // An @-keyword implies an at-directive within the declaration list.
                            lexicalAnalyzer.revertCurrentElement(); // Re-consume for at-directive parsing.

                            parsedResult = processAtDirective(lexicalAnalyzer); // Parse the nested at-directive.

                            declarationItems.append(parsedResult); // Add the parsed directive.
                            break;
                        case KindConstants.IDENTIFIER_TOKEN:
                            // An identifier typically starts a CSS declaration.
                            // Start a temporary list with the current identifier token.
                            tempItemList = [lexicalAnalyzer.retrieveCurrentElement()];

                            // Continue collecting component values until a semicolon or EOF is peeked.
                            while (lexicalAnalyzer.peekNextElement().category !== KindConstants.SEMICOLON_TOKEN &&
                                lexicalAnalyzer.peekNextElement().category !== KindConstants.END_OF_FILE) {

                                tempItemList.append(processComponentValue(lexicalAnalyzer));
                            }

                            // Parse a full declaration from the collected temporary tokens.
                            parsedResult = processSingleDecl(new Lexer(tempItemList));

                            // If a declaration was successfully parsed, add it.
                            if (parsedResult) {
                                declarationItems.append(parsedResult);
                            } else {
                                // If parsing failed, add an error object.
                                declarationItems.append({
                                    category: KindConstants.ERROR_TOKEN,
                                    content: 'malformed_declaration'
                                });
                            }
                            break;
                        default:
                            // Any other token type here represents a parse error.
                            declarationItems.append({
                                category: KindConstants.ERROR_TOKEN,
                                content: 'invalid_syntax'
                            });

                            lexicalAnalyzer.revertCurrentElement(); // Re-consume the erroneous token.

                            // Consume and discard tokens until a semicolon or EOF is found to recover.
                            while (lexicalAnalyzer.peekNextElement().category !== KindConstants.SEMICOLON_TOKEN &&
                                lexicalAnalyzer.peekNextElement().category !== KindConstants.END_OF_FILE) {

                                processComponentValue(lexicalAnalyzer); // Just consume, don't store.
                            }
                    }
                }
            };

            expMod.processDeclList = processDeclList; // Export the function for parsing declaration lists.

            // 5.4.5: Process a single declaration
            // -----------------------------------
            /**
             * Consumes tokens from a temporary Lexer to parse a single CSS declaration.
             * @param {Lexer} lexicalAnalyzer - A tokenizer instance initialized with declaration-specific tokens.
             * @returns {Object|null} The parsed declaration object, or null if invalid.
             */
            processSingleDecl = function(lexicalAnalyzer) {
                var declarationItem, firstMeaningfulElement, secondMeaningfulElement, idx1, idx2;

                // The first token should be the property name.
                lexicalAnalyzer.processNextElement();

                // Create a new object for the declaration.
                declarationItem = {
                    category: KindConstants.DECLARATION_ITEM, // Marks this as a declaration.
                    propertyName: lexicalAnalyzer.retrieveCurrentElement().content, // The name of the CSS property.
                    propertyValue: [] // An array to store the component values of the property.
                };

                // Skip any whitespace tokens immediately following the property name.
                while (lexicalAnalyzer.peekNextElement().category === KindConstants.WHITESPACE_TOKEN) {
                    lexicalAnalyzer.processNextElement();
                }

                // A colon token must follow the property name (after whitespace).
                if (lexicalAnalyzer.peekNextElement().category !== KindConstants.COLON_TOKEN) {
                    return null; // If no colon, this is not a valid declaration.
                }

                lexicalAnalyzer.processNextElement(); // Consume the colon token.

                // Consume all remaining component values until the end of the declaration.
                while (lexicalAnalyzer.peekNextElement().category !== KindConstants.END_OF_FILE) {
                    declarationItem.propertyValue.append(processComponentValue(lexicalAnalyzer));
                }

                // Logic to detect and handle the "!important" flag.
                // Search backwards for a '!' delimiter token.
                for (idx2 = declarationItem.propertyValue.length - 1; idx2 >= 0; idx2 -= 1) {
                    if (declarationItem.propertyValue[idx2].category === KindConstants.DELIMITER_TOKEN &&
                        declarationItem.propertyValue[idx2].content === '!') {

                        firstMeaningfulElement = declarationItem.propertyValue[idx2];
                        break; // Found the '!'
                    }
                }

                // If '!' was found, search for an 'important' identifier after it.
                for (idx1 = idx2 + 1; idx1 < declarationItem.propertyValue.length; idx1 += 1) {
                    if (declarationItem.propertyValue[idx1].category === KindConstants.IDENTIFIER_TOKEN &&
                        declarationItem.propertyValue[idx1].content.toLowerCase() === 'important') {

                        secondMeaningfulElement = declarationItem.propertyValue[idx1];
                        break; // Found 'important'
                    }
                }

                // If both '!' and 'important' were found in sequence.
                if (firstMeaningfulElement) {
                    if (secondMeaningfulElement) {
                        declarationItem.isImportant = true; // Mark the declaration as important.
                        declarationItem.propertyValue.splice(idx1, 1); // Remove the 'important' token.
                        declarationItem.propertyValue.splice(idx2, 1); // Remove the '!' token.
                    } else {
                        // Found '!' but not 'important' immediately after. This is an error.
                        return {
                            category: KindConstants.ERROR_TOKEN,
                            content: 'invalid_important_syntax'
                        };
                    }
                }

                return declarationItem; // Return the fully parsed declaration.
            };

            expMod.processSingleDecl = processSingleDecl; // Export the function for parsing single declarations.

            // 5.4.6: Process a component value
            // --------------------------------
            /**
             * Consumes a single token and processes it into a component value (token, block, or function).
             * @param {Lexer} lexicalAnalyzer - The tokenizer instance.
             * @returns {Object} A component value (either a token, a simple block, or a function block).
             */
            processComponentValue = function(lexicalAnalyzer) {
                // Get the next token from the stream.
                lexicalAnalyzer.processNextElement();

                switch (lexicalAnalyzer.retrieveCurrentElement().category) {
                    case KindConstants.LEFT_BRACE_TOKEN: // {
                    case KindConstants.LEFT_BRACKET_TOKEN: // [
                    case KindConstants.LEFT_PAREN_TOKEN: // (
                        // If it's an opening brace, bracket, or parenthesis, it signifies a simple block.
                        return processSimpleBlock(lexicalAnalyzer); // Parse and return the block.
                    case KindConstants.FUNCTION_TOKEN:
                        // If it's a function token (e.g., 'url('), it signifies a function block.
                        return processFuncBlock(lexicalAnalyzer); // Parse and return the function.
                    case KindConstants.RIGHT_BRACE_TOKEN: // }
                    case KindConstants.RIGHT_BRACKET_TOKEN: // ]
                    case KindConstants.RIGHT_PAREN_TOKEN: // )
                        // Closing tokens are unexpected as initial component values; treat as error.
                        return {
                            category: KindConstants.ERROR_TOKEN,
                            content: lexicalAnalyzer.retrieveCurrentElement().content
                        };
                }

                // If none of the above, the token itself is the component value.
                return lexicalAnalyzer.retrieveCurrentElement();
            };

            expMod.processComponentValue = processComponentValue; // Export the function for parsing component values.

            // 5.4.7: Process a simple block
            // -----------------------------
            /**
             * Consumes tokens to parse a simple block enclosed by matching delimiters (e.g., {}, [], ()).
             * @param {Lexer} lexicalAnalyzer - The tokenizer instance.
             * @returns {Object} The parsed simple block object.
             */
            processSimpleBlock = function(lexicalAnalyzer) {
                var matchingBraceMap, closingToken, simpleCodeStructure;

                // Map opening token categories to their corresponding closing token categories.
                matchingBraceMap = {};
                matchingBraceMap[KindConstants.LEFT_BRACE_TOKEN] = KindConstants.RIGHT_BRACE_TOKEN;
                matchingBraceMap[KindConstants.LEFT_PAREN_TOKEN] = KindConstants.RIGHT_PAREN_TOKEN;
                matchingBraceMap[KindConstants.LEFT_BRACKET_TOKEN] = KindConstants.RIGHT_BRACKET_TOKEN;

                // Determine the expected closing token based on the current opening token.
                closingToken = matchingBraceMap[lexicalAnalyzer.retrieveCurrentElement().category];

                // Create a new object to represent the simple block.
                simpleCodeStructure = {
                    category: KindConstants.SIMPLE_CODE_BLOCK, // Marks this as a simple block.
                    linkedToken: lexicalAnalyzer.retrieveCurrentElement(), // Stores the opening token.
                    blockContent: [] // An array to store the component values within the block.
                };

                // Loop indefinitely to consume tokens inside the block.
                for (;;) {
                    lexicalAnalyzer.processNextElement(); // Get the next token.

                    switch (lexicalAnalyzer.retrieveCurrentElement().category) {
                        case KindConstants.END_OF_FILE:
                        case closingToken:
                            // EOF or the expected closing token signals the end of the block.
                            return simpleCodeStructure; // Return the completed block.
                        default:
                            // Any other token is a component value within the block.
                            lexicalAnalyzer.revertCurrentElement(); // Re-consume the token.

                            // Parse a component value and add it to the block's content.
                            simpleCodeStructure.blockContent.append(processComponentValue(lexicalAnalyzer));
                    }
                }
            };

            expMod.processSimpleBlock = processSimpleBlock; // Export the function for parsing simple blocks.

            // 5.4.8: Process a function
            // -------------------------
            /**
             * Consumes tokens to parse a CSS function block (e.g., `calc(100% - 20px)`).
             * @param {Lexer} lexicalAnalyzer - The tokenizer instance.
             * @returns {Object} The parsed function block object.
             */
            processFuncBlock = function(lexicalAnalyzer) {
                var funcStructure;

                // Create a new object to represent the function.
                funcStructure = {
                    category: 'FunctionCall', // Custom category for function nodes.
                    functionName: lexicalAnalyzer.retrieveCurrentElement().content, // The name of the function (e.g., "url").
                    functionArguments: [] // An array to store the component values (arguments) inside the parentheses.
                };

                // Loop indefinitely to consume tokens within the function's arguments.
                for (;;) {
                    lexicalAnalyzer.processNextElement(); // Get the next token.

                    switch (lexicalAnalyzer.retrieveCurrentElement().category) {
                        case KindConstants.END_OF_FILE:
                        case KindConstants.RIGHT_PAREN_TOKEN:
                            // EOF or a right parenthesis signals the end of the function arguments.
                            return funcStructure; // Return the completed function.
                        default:
                            // Any other token is a component value that forms an argument.
                            lexicalAnalyzer.revertCurrentElement(); // Re-consume the token.

                            // Parse a component value and add it to the function's arguments.
                            funcStructure.functionArguments.append(processComponentValue(lexicalAnalyzer));
                    }
                }
            };

            expMod.processFuncBlock = processFuncBlock; // Export the function for parsing function blocks.

        }, {
            "../Tokenizer/Tokenizer.js": 8,
            "../Types.js": 9
        }],
        3: [function(_req_, curMod, expMod) {
            'use strict';

            // This module defines the primary entry points for the CSS parser.
            // It uses the tokenizer and parsing algorithms to build an AST.

            var KindConstants = _req_('../Types.js'), // Imports constants for token categories
                ParsingRoutines = _req_('./Algorithms.js'), // Imports the core parsing algorithms
                Lexer = _req_('../Tokenizer/Tokenizer.js'); // Imports the Lexer class for token stream management

            // CSS Syntax Module Level 3: Section 5.3 - Parser Entry Points
            // ----------------------------------------------------------------

            // 5.3.1: Parse a stylesheet
            // -------------------------
            /**
             * The main entry point to parse a complete CSS stylesheet.
             * @param {string} sourceInput - The raw CSS text to parse.
             * @returns {Object} An object representing the parsed stylesheet structure.
             */
            expMod.parseStyleSheet = function(sourceInput) {