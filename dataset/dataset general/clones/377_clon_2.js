utility.parserFunction = ( function ( ) {
    /*
     *  Produced by Parser.Gen 0.7.0.
     *
     *  http://parser.gen.majda.cz/
     */
    function formatStr ( inputStr ) {
        /*
         *  ECMA-262, 5th ed., 7.8.4: All characters may appear literally in a
         *  string literal except for the closing quote character, backslash,
         *  carriage return, line separator, paragraph separator, and line feed.
         *  Any character may appear in the form of an escape sequence.
         *
         *  For portability, we also escape all control and non-ASCII
         *  characters. Note that "\0" and "\v" escape sequences are not used
         *  because JSHint does not like the first and IE the second.
         */
        return '\'' + inputStr
            .replace( /\\/g, '\\\\' )  // backslash
            .replace( /'/g, '\\\'' )    // closing quote character
            .replace( /\x08/g, '\\b' ) // backspace
            .replace( /\t/g, '\\t' )   // horizontal tab
            .replace( /\n/g, '\\n' )   // line feed
            .replace( /\f/g, '\\f' )   // form feed
            .replace( /\r/g, '\\r' )   // carriage return
            .replace( /[\x00-\x07\x0B\x0E-\x1F\x80-\uFFFF]/g, escape )
            + '\'';
    }
    var processingResult = {
        /*
         *  Parses the input with a generated parser. If the parsing is successful,
         *  returns a value explicitly or implicitly specified by the grammar from
         *  which the parser was generated (see |Parser.Gen.buildParser|). If the parsing is
         *  unsuccessful, throws |Parser.Gen.parser.SyntaxError| describing the error.
         */
        parse: function ( textInput, initialRule ) {
            var parsingMethods = {
                "spaceChar": parsingMethod_spaceChar,
                "separator": parsingMethod_separator,
                "statement": parsingMethod_statement,
                "predicate": parsingMethod_predicate,
                "comparison": parsingMethod_comparison,
                "argument": parsingMethod_argument,
                "variable": parsingMethod_variable,
                "constant": parsingMethod_constant
            };
            if ( initialRule !== undefined ) {
                if ( parsingMethods[ initialRule ] === undefined ) {
                    throw new Error( "Invalid rule name: " + formatStr( initialRule ) + "." );
                }
            } else {
                initialRule = "statement";
            }
            var currentPosition = { currentOffset: 0, currentLine: 1, currentColumn: 1, newlineEncountered: false };
            var failureCount = 0;
            var furthestFailurePosition = { currentOffset: 0, currentLine: 1, currentColumn: 1, newlineEncountered: false };
            var furthestFailureExpected = [];
            var parseCache = {};
            function padStringLeft ( str, padChar, totalLength ) {
                var outputStr = str;
                var paddingAmount = totalLength - str.length;
                for ( var i = 0; i < paddingAmount; i++ ) {
                    outputStr = padChar + outputStr;
                }
                return outputStr;
            }
            function escapeCharacter ( charValue ) {
                var charCodeVal = charValue.charCodeAt( 0 );
                var escapePrefix;
                var numLength;
                if ( charCodeVal <= 0xFF ) {
                    escapePrefix = 'x';
                    numLength = 2;
                } else {
                    escapePrefix = 'u';
                    numLength = 4;
                }
                return '\\' + escapePrefix + padStringLeft( charCodeVal.toString( 16 ).toUpperCase(), '0', numLength );
            }
            function duplicateObject ( originalObj ) {
                var newObj = {};
                for ( var keyName in originalObj ) {
                    newObj[ keyName ] = originalObj[ keyName ];
                }
                return newObj;
            }
            function advancePosition ( posObj, steps ) {
                var endOffset = posObj.currentOffset + steps;
                for ( var offsetIterator = posObj.currentOffset; offsetIterator < endOffset; offsetIterator++ ) {
                    var currentChar = textInput.charAt( offsetIterator );
                    if ( currentChar === "\n" ) {
                        if ( !posObj.newlineEncountered ) {
                            posObj.currentLine++;
                        }
                        posObj.currentColumn = 1;
                        posObj.newlineEncountered = false;
                    } else if ( currentChar === "\r" || currentChar === "\u2028" || currentChar === "\u2029" ) {
                        posObj.currentLine++;
                        posObj.currentColumn = 1;
                        posObj.newlineEncountered = true;
                    } else {
                        posObj.currentColumn++;
                        posObj.newlineEncountered = false;
                    }
                }
                posObj.currentOffset += steps;
            }
            function registerFailure ( failureDescription ) {
                if ( currentPosition.currentOffset < furthestFailurePosition.currentOffset ) {
                    return;
                }
                if ( currentPosition.currentOffset > furthestFailurePosition.currentOffset ) {
                    furthestFailurePosition = duplicateObject( currentPosition );
                    furthestFailureExpected = [];
                }
                furthestFailureExpected.push( failureDescription );
            }
            function parsingMethod_spaceChar ( ) {
                var cacheIdentifier = "spaceChar@" + currentPosition.currentOffset;
                var cachedOutcome = parseCache[ cacheIdentifier ];
                if ( cachedOutcome ) {
                    currentPosition = duplicateObject( cachedOutcome.nextPosition );
                    return cachedOutcome.outcome;
                }
                var outcome0;
                if ( textInput.charCodeAt( currentPosition.currentOffset ) === 32 ) {
                    outcome0 = " ";
                    advancePosition( currentPosition, 1 );
                } else {
                    outcome0 = null;
                    if ( failureCount === 0 ) {
                        registerFailure( "\" \"" );
                    }
                }
                parseCache[ cacheIdentifier ] = {
                    nextPosition: duplicateObject( currentPosition ),
                    outcome:  outcome0
                };
                return outcome0;
            }
            function parsingMethod_separator ( ) {
                var cacheIdentifier = "separator@" + currentPosition.currentOffset;
                var cachedOutcome = parseCache[ cacheIdentifier ];
                if ( cachedOutcome ) {
                    currentPosition = duplicateObject( cachedOutcome.nextPosition );
                    return cachedOutcome.outcome;
                }
                var outcome0;
                if ( textInput.charCodeAt( currentPosition.currentOffset ) === 44 ) {
                    outcome0 = ",";
                    advancePosition( currentPosition, 1 );
                } else {
                    outcome0 = null;
                    if ( failureCount === 0 ) {
                        registerFailure( "\",\"" );
                    }
                }
                parseCache[ cacheIdentifier ] = {
                    nextPosition: duplicateObject( currentPosition ),
                    outcome:  outcome0
                };
                return outcome0;
            }
            function parsingMethod_statement ( ) {
                var cacheIdentifier = "statement@" + currentPosition.currentOffset;
                var cachedOutcome = parseCache[ cacheIdentifier ];
                if ( cachedOutcome ) {
                    currentPosition = duplicateObject( cachedOutcome.nextPosition );
                    return cachedOutcome.outcome;
                }
                var outcome0, outcome1, outcome2, outcome3, outcome4, outcome5, outcome6, outcome7, outcome8, outcome9, outcome10, outcome11, outcome12, outcome13, outcome14;
                var position0, position1;
                position0 = duplicateObject( currentPosition );
                position1 = duplicateObject( currentPosition );
                if ( textInput.substr( currentPosition.currentOffset, 3 ) === "(if" ) {
                    outcome0 = "(if";
                    advancePosition( currentPosition, 3 );
                } else {
                    outcome0 = null;
                    if ( failureCount === 0 ) {
                        registerFailure( "\"(if\"" );
                    }
                }
                if ( outcome0 !== null ) {
                    outcome1 = [];
                    outcome2 = parsingMethod_spaceChar();
                    while ( outcome2 !== null ) {
                        outcome1.push( outcome2 );
                        outcome2 = parsingMethod_spaceChar();
                    }
                    if ( outcome1 !== null ) {
                        outcome2 = parsingMethod_predicate();
                        if ( outcome2 !== null ) {
                            outcome3 = [];
                            outcome4 = parsingMethod_spaceChar();
                            while ( outcome4 !== null ) {
                                outcome3.push( outcome4 );
                                outcome4 = parsingMethod_spaceChar();
                            }
                            if ( outcome3 !== null ) {
                                if ( textInput.charCodeAt( currentPosition.currentOffset ) === 40 ) {
                                    outcome4 = "(";
                                    advancePosition( currentPosition, 1 );
                                } else {
                                    outcome4 = null;
                                    if ( failureCount === 0 ) {
                                        registerFailure( "\"(\"" );
                                    }
                                }
                                if ( outcome4 !== null ) {
                                    outcome5 = [];
                                    outcome6 = parsingMethod_argument();
                                    while ( outcome6 !== null ) {
                                        outcome5.push( outcome6 );
                                        outcome6 = parsingMethod_argument();
                                    }
                                    if ( outcome5 !== null ) {
                                        if ( textInput.charCodeAt( currentPosition.currentOffset ) === 41 ) {
                                            outcome6 = ")";
                                            advancePosition( currentPosition, 1 );
                                        } else {
                                            outcome6 = null;
                                            if ( failureCount === 0 ) {
                                                registerFailure( "\")\"" );
                                            }
                                        }
                                        if ( outcome6 !== null ) {
                                            outcome7 = [];
                                            outcome8 = parsingMethod_spaceChar();
                                            while ( outcome8 !== null ) {
                                                outcome7.push( outcome8 );
                                                outcome8 = parsingMethod_spaceChar();
                                            }
                                            if ( outcome7 !== null ) {
                                                outcome8 = parsingMethod_comparison();
                                                if ( outcome8 !== null ) {
                                                    outcome9 = [];
                                                    outcome10 = parsingMethod_spaceChar();
                                                    while ( outcome10 !== null ) {
                                                        outcome9.push( outcome10 );
                                                        outcome10 = parsingMethod_spaceChar();
                                                    }
                                                    if ( outcome9 !== null ) {
                                                        if ( textInput.charCodeAt( currentPosition.currentOffset ) === 40 ) {
                                                            outcome10 = "(";
                                                            advancePosition( currentPosition, 1 );
                                                        } else {
                                                            outcome10 = null;
                                                            if ( failureCount === 0 ) {
                                                                registerFailure( "\"(\"" );
                                                            }
                                                        }
                                                        if ( outcome10 !== null ) {
                                                            outcome11 = [];
                                                            outcome12 = parsingMethod_argument();
                                                            while ( outcome12 !== null ) {
                                                                outcome11.push( outcome12 );
                                                                outcome12 = parsingMethod_argument();
                                                            }
                                                            if ( outcome11 !== null ) {
                                                                if ( textInput.charCodeAt( currentPosition.currentOffset ) === 41 ) {
                                                                    outcome12 = ")";
                                                                    advancePosition( currentPosition, 1 );
                                                                } else {
                                                                    outcome12 = null;
                                                                    if ( failureCount === 0 ) {
                                                                        registerFailure( "\")\"" );
                                                                    }
                                                                }
                                                                if ( outcome12 !== null ) {
                                                                    outcome13 = [];
                                                                    outcome14 = parsingMethod_spaceChar();
                                                                    while ( outcome14 !== null ) {
                                                                        outcome13.push( outcome14 );
                                                                        outcome14 = parsingMethod_spaceChar();
                                                                    }
                                                                    if ( outcome13 !== null ) {
                                                                        if ( textInput.charCodeAt( currentPosition.currentOffset ) === 41 ) {
                                                                            outcome14 = ")";
                                                                            advancePosition( currentPosition, 1 );
                                                                        } else {
                                                                            outcome14 = null;
                                                                            if ( failureCount === 0 ) {
                                                                                registerFailure( "\")\"" );
                                                                            }
                                                                        }
                                                                        if ( outcome14 !== null ) {
                                                                            outcome0 = [ outcome0, outcome1, outcome2, outcome3, outcome4, outcome5, outcome6, outcome7, outcome8, outcome9, outcome10, outcome11, outcome12, outcome13, outcome14 ];
                                                                        } else {
                                                                            outcome0 = null;
                                                                            currentPosition = duplicateObject( position1 );
                                                                        }
                                                                    } else {
                                                                        outcome0 = null;
                                                                        currentPosition = duplicateObject( position1 );
                                                                    }
                                                                } else {
                                                                    outcome0 = null;
                                                                    currentPosition = duplicateObject( position1 );
                                                                }
                                                            } else {
                                                                outcome0 = null;
                                                                currentPosition = duplicateObject( position1 );
                                                            }
                                                        } else {
                                                            outcome0 = null;
                                                            currentPosition = duplicateObject( position1 );
                                                        }
                                                    } else {
                                                        outcome0 = null;
                                                        currentPosition = duplicateObject( position1 );
                                                    }
                                                } else {
                                                    outcome0 = null;
                                                    currentPosition = duplicateObject( position1 );
                                                }
                                            } else {
                                                outcome0 = null;
                                                currentPosition = duplicateObject( position1 );
                                            }
                                        } else {
                                            outcome0 = null;
                                            currentPosition = duplicateObject( position1 );
                                        }
                                    } else {
                                        outcome0 = null;
                                        currentPosition = duplicateObject( position1 );
                                    }
                                } else {
                                    outcome0 = null;
                                    currentPosition = duplicateObject( position1 );
                                }
                            } else {
                                outcome0 = null;
                                currentPosition = duplicateObject( position1 );
                            }
                        } else {
                            outcome0 = null;
                            currentPosition = duplicateObject( position1 );
                        }
                    } else {
                        outcome0 = null;
                        currentPosition = duplicateObject( position1 );
                    }
                } else {
                    outcome0 = null;
                    currentPosition = duplicateObject( position1 );
                }
                if ( outcome0 !== null ) {
                    outcome0 = ( function ( offset, line, column, p, q, r, s ) { return [ p, q, r, s ]; } )( position0.currentOffset, position0.currentLine, position0.currentColumn, outcome0[ 2 ], outcome0[ 5 ], outcome0[ 8 ], outcome0[ 11 ] );
                }
                if ( outcome0 === null ) {
                    currentPosition = duplicateObject( position0 );
                }
                parseCache[ cacheIdentifier ] = {
                    nextPosition: duplicateObject( currentPosition ),
                    outcome:  outcome0
                };
                return outcome0;
            }
            function parsingMethod_predicate ( ) {
                var cacheIdentifier = "predicate@" + currentPosition.currentOffset;
                var cachedOutcome = parseCache[ cacheIdentifier ];
                if ( cachedOutcome ) {
                    currentPosition = duplicateObject( cachedOutcome.nextPosition );
                    return cachedOutcome.outcome;
                }
                var outcome0;
                if ( textInput.substr( currentPosition.currentOffset, 8 ) === "val of" ) {
                    outcome0 = "val of";
                    advancePosition( currentPosition, 8 );
                } else {
                    outcome0 = null;
                    if ( failureCount === 0 ) {
                        registerFailure( "\"val of\"" );
                    }
                }
                if ( outcome0 === null ) {
                    if ( textInput.substr( currentPosition.currentOffset, 6 ) === "any of" ) {
                        outcome0 = "any of";
                        advancePosition( currentPosition, 6 );
                    } else {
                        outcome0 = null;
                        if ( failureCount === 0 ) {
                            registerFailure( "\"any of\"" );
                        }
                    }
                    if ( outcome0 === null ) {
                        if ( textInput.substr( currentPosition.currentOffset, 6 ) === "all of" ) {
                            outcome0 = "all of";
                            advancePosition( currentPosition, 6 );
                        } else {
                            outcome0 = null;
                            if ( failureCount === 0 ) {
                                registerFailure( "\"all of\"" );
                            }
                        }
                    }
                }
                parseCache[ cacheIdentifier ] = {
                    nextPosition: duplicateObject( currentPosition ),
                    outcome:  outcome0
                };
                return outcome0;
            }
            function parsingMethod_comparison ( ) {
                var cacheIdentifier = "comparison@" + currentPosition.currentOffset;
                var cachedOutcome = parseCache[ cacheIdentifier ];
                if ( cachedOutcome ) {
                    currentPosition = duplicateObject( cachedOutcome.nextPosition );
                    return cachedOutcome.outcome;
                }
                var outcome0, outcome1, outcome2, outcome3;
                var position0;
                position0 = duplicateObject( currentPosition );
                outcome0 = [];
                outcome1 = textInput.charCodeAt( currentPosition.currentOffset ) === 105 ? "i" : null;
                if ( outcome1 === null ) {
                    outcome1 = textInput.charCodeAt( currentPosition.currentOffset ) === 97 ? "a" : null;
                }
                if ( outcome1 !== null ) {
                    for ( var i = 0; i < 1; i++ ) {
                        if ( outcome1 === null ) {
                            outcome0 = null;
                            break;
                        }
                        outcome0.push( outcome1 );
                        outcome1 = textInput.charCodeAt( currentPosition.currentOffset ) === 105 ? "i" : null;
                        if ( outcome1 === null ) {
                            outcome1 = textInput.charCodeAt( currentPosition.currentOffset ) === 97 ? "a" : null;
                        }
                    }
                } else {
                    outcome0 = null;
                }
                if ( outcome0 !== null ) {
                    outcome1 = [];
                    outcome2 = parsingMethod_spaceChar();
                    while ( outcome2 !== null ) {
                        outcome1.push( outcome2 );
                        outcome2 = parsingMethod_spaceChar();
                    }
                    if ( outcome1 !== null ) {
                        if ( textInput.substr( currentPosition.currentOffset, 3 ) === "not" ) {
                            outcome2 = "not";
                            advancePosition( currentPosition, 3 );
                        } else {
                            outcome2 = null;
                            if ( failureCount === 0 ) {
                                registerFailure( "\"not\"" );
                            }
                        }
                        outcome2 = outcome2 === null ? '' : outcome2;
                        if ( outcome2 !== null ) {
                            outcome3 = [];
                            var outcome4 = parsingMethod_spaceChar();
                            while ( outcome4 !== null ) {
                                outcome3.push( outcome4 );
                                outcome4 = parsingMethod_spaceChar();
                            }
                            if ( outcome3 !== null ) {
                                if ( textInput.substr( currentPosition.currentOffset, 2 ) === "in" ) {
                                    outcome4 = "in";
                                    advancePosition( currentPosition, 2 );
                                } else {
                                    outcome4 = null;
                                    if ( failureCount === 0 ) {
                                        registerFailure( "\"in\"" );
                                    }
                                }
                                outcome4 = outcome4 === null ? '' : outcome4;
                                if ( outcome4 !== null ) {
                                    outcome0 = [ outcome0, outcome1, outcome2, outcome3, outcome4 ];
                                } else {
                                    outcome0 = null;
                                    currentPosition = duplicateObject( position0 );
                                }
                            } else {
                                outcome0 = null;
                                currentPosition = duplicateObject( position0 );
                            }
                        } else {
                            outcome0 = null;
                            currentPosition = duplicateObject( position0 );
                        }
                    } else {
                        outcome0 = null;
                        currentPosition = duplicateObject( position0 );
                    }
                } else {
                    outcome0 = null;
                    currentPosition = duplicateObject( position0 );
                }
                if ( outcome0 !== null ) {
                    outcome0 = ( function ( offset, line, column, txt ) { return txt.join( "" ).replace( /\s+$/, '' ).replace( /\s+/, ' ' ); } )( position0.currentOffset, position0.currentLine, position0.currentColumn, outcome0 );
                }
                if ( outcome0 === null ) {
                    currentPosition = duplicateObject( position0 );
                }
                if ( outcome0 === null ) {
                    position0 = duplicateObject( currentPosition );
                    outcome0 = [];
                    outcome1 = textInput.charCodeAt( currentPosition.currentOffset ) === 109 ? "m" : null;
                    if ( outcome1 !== null ) {
                        for ( var i = 0; i < 1; i++ ) {
                            if ( outcome1 === null ) {
                                outcome0 = null;
                                break;
                            }
                            outcome0.push( outcome1 );
                            outcome1 = textInput.charCodeAt( currentPosition.currentOffset ) === 109 ? "m" : null;
                        }
                    } else {
                        outcome0 = null;
                    }
                    if ( outcome0 !== null ) {
                        outcome1 = [];
                        outcome2 = parsingMethod_spaceChar();
                        while ( outcome2 !== null ) {
                            outcome1.push( outcome2 );
                            outcome2 = parsingMethod_spaceChar();
                        }
                        if ( outcome1 !== null ) {
                            if ( textInput.substr( currentPosition.currentOffset, 3 ) === "not" ) {
                                outcome2 = "not";
                                advancePosition( currentPosition, 3 );
                            } else {
                                outcome2 = null;
                                if ( failureCount === 0 ) {
                                    registerFailure( "\"not\"" );
                                }
                            }
                            outcome2 = outcome2 === null ? '' : outcome2;
                            if ( outcome2 !== null ) {
                                outcome0 = [ outcome0, outcome1, outcome2 ];
                            } else {
                                outcome0 = null;
                                currentPosition = duplicateObject( position0 );
                            }
                        } else {
                            outcome0 = null;
                            currentPosition = duplicateObject( position0 );
                        }
                    } else {
                        outcome0 = null;
                        currentPosition = duplicateObject( position0 );
                    }
                    if ( outcome0 !== null ) {
                        outcome0 = ( function ( offset, line, column, txt ) { return txt.join( "" ).replace( /\s+$/, '' ).replace( /\s+/, ' ' ); } )( position0.currentOffset, position0.currentLine, position0.currentColumn, outcome0 );
                    }
                    if ( outcome0 === null ) {
                        currentPosition = duplicateObject( position0 );
                    }
                }
                parseCache[ cacheIdentifier ] = {
                    nextPosition: duplicateObject( currentPosition ),
                    outcome:  outcome0
                };
                return outcome0;
            }
            function parsingMethod_argument ( ) {
                var cacheIdentifier = "argument@" + currentPosition.currentOffset;
                var cachedOutcome = parseCache[ cacheIdentifier ];
                if ( cachedOutcome ) {
                    currentPosition = duplicateObject( cachedOutcome.nextPosition );
                    return cachedOutcome.outcome;
                }
                var outcome0, outcome1, outcome2;
                var position0;
                position0 = duplicateObject( currentPosition );
                outcome0 = [];
                outcome1 = parsingMethod_spaceChar();
                while ( outcome1 !== null ) {
                    outcome0.push( outcome1 );
                    outcome1 = parsingMethod_spaceChar();
                }
                if ( outcome0 !== null ) {
                    outcome1 = parsingMethod_variable();
                    if ( outcome1 === null ) {
                        outcome1 = parsingMethod_statement();
                        if ( outcome1 === null ) {
                            outcome1 = parsingMethod_constant();
                        }
                    }
                    if ( outcome1 !== null ) {
                        outcome2 = parsingMethod_separator();
                        outcome2 = outcome2 === null ? '' : outcome2;
                        if ( outcome2 !== null ) {
                            outcome0 = [ outcome0, outcome1, outcome2 ];
                        } else {
                            outcome0 = null;
                            currentPosition = duplicateObject( position0 );
                        }
                    } else {
                        outcome0 = null;
                        currentPosition = duplicateObject( position0 );
                    }
                } else {
                    outcome0 = null;
                    currentPosition = duplicateObject( position0 );
                }
                if ( outcome0 !== null ) {
                    outcome0 = ( function ( offset, line, column, arr ) { arr.pop(); return arr.length > 0 ? arr[ 0 ] : ''; } )( position0.currentOffset, position0.currentLine, position0.currentColumn, outcome0 );
                }
                if ( outcome0 === null ) {
                    currentPosition = duplicateObject( position0 );
                }
                parseCache[ cacheIdentifier ] = {
                    nextPosition: duplicateObject( currentPosition ),
                    outcome:  outcome0
                };
                return outcome0;
            }
            function parsingMethod_variable ( ) {
                var cacheIdentifier = "variable@" + currentPosition.currentOffset;
                var cachedOutcome = parseCache[ cacheIdentifier ];
                if ( cachedOutcome ) {
                    currentPosition = duplicateObject( cachedOutcome.nextPosition );
                    return cachedOutcome.outcome;
                }
                var outcome0, outcome1, outcome2, outcome3;
                var position0, position1;
                position0 = duplicateObject( currentPosition );
                position1 = duplicateObject( currentPosition );
                if ( textInput.substr( currentPosition.currentOffset, 2 ) === '{$' ) {
                    outcome0 = '{$';
                    advancePosition( currentPosition, 2 );
                } else {
                    outcome0 = null;
                    if ( failureCount === 0 ) {
                        registerFailure( "'{$'" );
                    }
                }
                if ( outcome0 !== null ) {
                    outcome1 = [];
                    outcome2 = textInput.charAt( currentPosition.currentOffset );
                    if ( outcome2 !== null && ! ( ( textInput.charCodeAt( currentPosition.currentOffset ) >= 44 && textInput.charCodeAt( currentPosition.currentOffset ) <= 44 ) || ( textInput.charCodeAt( currentPosition.currentOffset ) >= 32 && textInput.charCodeAt( currentPosition.currentOffset ) <= 32 ) || ( textInput.charCodeAt( currentPosition.currentOffset ) >= 125 && textInput.charCodeAt( currentPosition.currentOffset ) <= 125 ) ) ) {
                        advancePosition( currentPosition, 1 );
                    } else {
                        outcome2 = null;
                        if ( failureCount === 0 ) {
                            registerFailure( "[^,\\s}]" );
                        }
                    }
                    while ( outcome2 !== null ) {
                        outcome1.push( outcome2 );
                        outcome2 = textInput.charAt( currentPosition.currentOffset );
                        if ( outcome2 !== null && ! ( ( textInput.charCodeAt( currentPosition.currentOffset ) >= 44 && textInput.charCodeAt( currentPosition.currentOffset ) <= 44 ) || ( textInput.charCodeAt( currentPosition.currentOffset ) >= 32 && textInput.charCodeAt( currentPosition.currentOffset ) <= 32 ) || ( textInput.charCodeAt( currentPosition.currentOffset ) >= 125 && textInput.charCodeAt( currentPosition.currentOffset ) <= 125 ) ) ) {
                            advancePosition( currentPosition, 1 );
                        } else {
                            outcome2 = null;
                            if ( failureCount === 0 ) {
                                registerFailure( "[^,\\s}]" );
                            }
                        }
                    }
                    if ( outcome1 !== null ) {
                        if ( textInput.charCodeAt( currentPosition.currentOffset ) === 125 ) {
                            outcome2 = "}";
                            advancePosition( currentPosition, 1 );
                        } else {
                            outcome2 = null;
                            if ( failureCount === 0 ) {
                                registerFailure( "\"}\"" );
                            }
                        }
                        if ( outcome2 !== null ) {
                            outcome0 = [ outcome0, outcome1, outcome2 ];
                        } else {
                            outcome0 = null;
                            currentPosition = duplicateObject( position1 );
                        }
                    } else {
                        outcome0 = null;
                        currentPosition = duplicateObject( position1 );
                    }
                } else {
                    outcome0 = null;
                    currentPosition = duplicateObject( position1 );
                }
                if ( outcome0 !== null ) {
                    outcome0 = ( function ( offset, line, column, s ) { return '{$' + s.join( "" ) + '}'; } )( position0.currentOffset, position0.currentLine, position0.currentColumn, outcome0[ 1 ] );
                }
                if ( outcome0 === null ) {
                    currentPosition = duplicateObject( position0 );
                }
                parseCache[ cacheIdentifier ] = {
                    nextPosition: duplicateObject( currentPosition ),
                    outcome:  outcome0
                };
                return outcome0;
            }
            function parsingMethod_constant ( ) {
                var cacheIdentifier = "constant@" + currentPosition.currentOffset;
                var cachedOutcome = parseCache[ cacheIdentifier ];
                if ( cachedOutcome ) {
                    currentPosition = duplicateObject( cachedOutcome.nextPosition );
                    return cachedOutcome.outcome;
                }
                var outcome0, outcome1;
                var position0;
                position0 = duplicateObject( currentPosition );
                outcome0 = [];
                outcome1 = textInput.charAt( currentPosition.currentOffset );
                if ( outcome1 !== null && ! ( ( textInput.charCodeAt( currentPosition.currentOffset ) >= 44 && textInput.charCodeAt( currentPosition.currentOffset ) <= 44 ) || ( textInput.charCodeAt( currentPosition.currentOffset ) >= 40 && textInput.charCodeAt( currentPosition.currentOffset ) <= 41 ) ) ) {
                    advancePosition( currentPosition, 1 );
                } else {
                    outcome1 = null;
                    if ( failureCount === 0 ) {
                        registerFailure( "[^,()]" );
                    }
                }
                if ( outcome1 === null ) {
                    var position1 = duplicateObject( currentPosition );
                    if ( textInput.charCodeAt( currentPosition.currentOffset ) === 40 ) {
                        outcome1 = "(";
                        advancePosition( currentPosition, 1 );
                    } else {
                        outcome1 = null;
                        if ( failureCount === 0 ) {
                            registerFailure( "\"(\"" );
                        }
                    }
                    if ( outcome1 !== null ) {
                        var outcome2 = [];
                        var outcome3 = parsingMethod_constant();
                        while ( outcome3 !== null ) {
                            outcome2.push( outcome3 );
                            outcome3 = parsingMethod_constant();
                        }
                        if ( outcome2 !== null ) {
                            if ( textInput.charCodeAt( currentPosition.currentOffset ) === 41 ) {
                                outcome3 = ")";
                                advancePosition( currentPosition, 1 );
                            } else {
                                outcome3 = null;
                                if ( failureCount === 0 ) {
                                    registerFailure( "\")\"" );
                                }
                            }
                            if ( outcome3 !== null ) {
                                outcome1 = [ outcome1, outcome2, outcome3 ];
                            } else {
                                outcome1 = null;
                                currentPosition = duplicateObject( position1 );
                            }
                        } else {
                            outcome1 = null;
                            currentPosition = duplicateObject( position1 );
                        }
                    } else {
                        outcome1 = null;
                        currentPosition = duplicateObject( position1 );
                    }
                }
                while ( outcome1 !== null ) {
                    outcome0.push( outcome1 );
                    outcome1 = textInput.charAt( currentPosition.currentOffset );
                    if ( outcome1 !== null && ! ( ( textInput.charCodeAt( currentPosition.currentOffset ) >= 44 && textInput.charCodeAt( currentPosition.currentOffset ) <= 44 ) || ( textInput.charCodeAt( currentPosition.currentOffset ) >= 40 && textInput.charCodeAt( currentPosition.currentOffset ) <= 41 ) ) ) {
                        advancePosition( currentPosition, 1 );
                    } else {
                        outcome1 = null;
                        if ( failureCount === 0 ) {
                            registerFailure( "[^,()]" );
                        }
                    }
                    if ( outcome1 === null ) {
                        var position2 = duplicateObject( currentPosition );
                        if ( textInput.charCodeAt( currentPosition.currentOffset ) === 40 ) {
                            outcome1 = "(";
                            advancePosition( currentPosition, 1 );
                        } else {
                            outcome1 = null;
                            if ( failureCount === 0 ) {
                                registerFailure( "\"(\"" );
                            }
                        }
                        if ( outcome1 !== null ) {
                            var outcome4 = [];
                            var outcome5 = parsingMethod_constant();
                            while ( outcome5 !== null ) {
                                outcome4.push( outcome5 );
                                outcome5 = parsingMethod_constant();
                            }
                            if ( outcome4 !== null ) {
                                if ( textInput.charCodeAt( currentPosition.currentOffset ) === 41 ) {
                                    outcome5 = ")";
                                    advancePosition( currentPosition, 1 );
                                } else {
                                    outcome5 = null;
                                    if ( failureCount === 0 ) {
                                        registerFailure( "\")\"" );
                                    }
                                }
                                if ( outcome5 !== null ) {
                                    outcome1 = [ outcome1, outcome4, outcome5 ];
                                } else {
                                    outcome1 = null;
                                    currentPosition = duplicateObject( position2 );
                                }
                            } else {
                                outcome1 = null;
                                currentPosition = duplicateObject( position2 );
                            }
                        } else {
                            outcome1 = null;
                            currentPosition = duplicateObject( position2 );
                        }
                    }
                }
                if ( outcome0 !== null ) {
                    outcome0 = ( function ( offset, line, column, s ) { return s.join( "" ); } )( position0.currentOffset, position0.currentLine, position0.currentColumn, outcome0 );
                }
                if ( outcome0 === null ) {
                    currentPosition = duplicateObject( position0 );
                }
                parseCache[ cacheIdentifier ] = {
                    nextPosition: duplicateObject( currentPosition ),
                    outcome:  outcome0
                };
                return outcome0;
            }
            function buildSyntaxError ( expected ) {
                function buildMessage ( expected, found ) {
                    var expectedHuman = [];
                    for ( var i = 0; i < expected.length; i++ ) {
                        expectedHuman.push( formatStr( expected[ i ] ) );
                    }
                    expectedHuman.sort();
                    if ( expectedHuman.length > 0 ) {
                        if ( expectedHuman.length === 1 ) {
                            return "Expected " + expectedHuman[ 0 ] + " but " + found + " found.";
                        } else {
                            return "Expected one of " + expectedHuman.slice( 0, expectedHuman.length - 1 ).join( ", " ) + " or " + expectedHuman[ expectedHuman.length - 1 ] + " but " + found + " found.";
                        }
                    } else {
                        return "Expected " + found + " but " + found + " found.";
                    }
                }
                var found = currentPosition.currentOffset < textInput.length ? formatStr( textInput.charAt( currentPosition.currentOffset ) ) : "end of input";
                return new parsingResult.SyntaxError(
                    buildMessage( expected, found ),
                    expected,
                    found,
                    currentPosition.currentOffset,
                    currentPosition.currentLine,
                    currentPosition.currentColumn
                );
            }
            if ( parsingMethods[ initialRule ] === undefined ) {
                throw new Error( "Invalid rule name: " + formatStr( initialRule ) + "." );
            }
            var parsedResult = parsingMethods[ initialRule ]();
            if ( parsedResult !== null && currentPosition.currentOffset === textInput.length ) {
                return parsedResult;
            } else {
                if ( parsedResult !== null && currentPosition.currentOffset < textInput.length ) {
                    registerFailure( "end of input" );
                }
                throw buildSyntaxError( furthestFailureExpected );
            }
        }
    };
    /*
     *  The parser throws an instance of this for syntactic errors.
     *
     *  @param {string} message The error message.
     *  @param {Array.<string>} expected The list of expected tokens.
     *  @param {string} found The token that was actually found.
     *  @param {number} offset The offset into the input text where the error occurred.
     *  @param {number} line The line number into the input text where the error occurred.
     *  @param {number} column The column number into the input text where the error occurred.
     */
    processingResult.SyntaxError = function ( message, expected, found, offset, line, column ) {
        this.name = "SyntaxError";
        this.message = message;
        this.expected = expected;
        this.found = found;
        this.offset = offset;
        this.line = line;
        this.column = column;
    };
    processingResult.SyntaxError.prototype = Error.prototype;
    return processingResult;
} )();