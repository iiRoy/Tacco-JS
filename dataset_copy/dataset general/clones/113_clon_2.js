// CommonJS module loader
// This module provides a basic implementation for loading modules
// akin to Node.js's 'require' in a browser environment.

function retrieveModule( moduleIdentifier ) {
    // Determine the absolute path for the requested module
    var moduleLocation = retrieveModule.locateUnit( moduleIdentifier );

    // Fetch the module definition from the cache
    var moduleUnit = retrieveModule.unitCache[ moduleLocation ];

    // If module not found, throw an error
    if ( !moduleUnit )
        throw new Error( 'Failed to load module: "' + moduleIdentifier + '"' );

    // If module has not been initialized (exported), do so
    if ( !moduleUnit.moduleOutput ) {
        moduleUnit.moduleOutput = {}; // Initialize exports object
        // Call the module's registration function with its context
        moduleUnit.invoke(
            moduleUnit.moduleOutput,
            moduleUnit.moduleOutput,
            retrieveModule.retrieveRelative( moduleLocation )
        );
    }
    // Return the module's exports
    return moduleUnit.moduleOutput;
}

// Storage for all registered module functions
retrieveModule.unitCache = {};

// Function to resolve a module identifier to its canonical path
retrieveModule.locateUnit = function ( modulePath ) {
    var originalPath = modulePath; // Keep original for fallback
    var jsExtensionPath = modulePath + '.js'; // Try with .js extension
    var indexPath = modulePath + '/index.js'; // Try with /index.js

    // Check cache for various path permutations
    return retrieveModule.unitCache[ jsExtensionPath ] && jsExtensionPath
        || retrieveModule.unitCache[ indexPath ] && indexPath
        || originalPath; // Fallback to original if no match
};

// Function to register a module
retrieveModule.enrollUnit = function ( modulePath, moduleFunction ) {
    retrieveModule.unitCache[ modulePath ] = moduleFunction; // Store the module's function
};

// Function to create a relative module loader for a given parent module
retrieveModule.retrieveRelative = function ( basePath ) {
    return function ( relativePath ) {
        // If it's an absolute path, use the main loader
        if ( '.' != relativePath.charAt( 0 ) )
            return retrieveModule( relativePath );

        // Split parent path and relative path into segments
        var pathSegments = basePath.split( '/' );
        var relativeSegments = relativePath.split( '/' );

        pathSegments.pop(); // Remove current module name from parent path

        // Process relative path segments
        for ( var segmentIndex = 0; segmentIndex < relativeSegments.length; segmentIndex++ ) {
            var currentSegment = relativeSegments[ segmentIndex ];
            if ( '..' == currentSegment )
                pathSegments.pop(); // Go up one directory
            else if ( '.' != currentSegment )
                pathSegments.push( currentSegment ); // Add segment to path
        }

        // Load the module from the resolved path
        return retrieveModule( pathSegments.join( '/' ) );
    };
};


retrieveModule.enrollUnit( "browser/debug.js", function ( unit, unitExports, importModule ) {

    // Export a function that returns another function
    unit.moduleOutput = function ( kind ) {
        return function () {
            // This space intentionally left blank for debug functions
        };
    };
} ); // module: browser/debug.js

retrieveModule.enrollUnit( "browser/diff.js", function ( unit, unitExports, importModule ) {
    /*
     * This file implements a text differencing algorithm.
     * It supports various granularities: character, word, line, and CSS token diffs.
     * The core algorithm is based on Myers' O(ND) algorithm.
     */
    var TextCompareEngine = ( function () {
        // Duplicates a path object for branching
        function duplicatePath( currentPath ) {
            return { currentPosition: currentPath.currentPosition, elements: currentPath.elements.slice( 0 ) };
        }

        // Filters out empty strings from an array
        function filterEmpty( stringArray ) {
            var cleanedArray = [];
            for ( var idx = 0; idx < stringArray.length; idx++ ) {
                if ( stringArray[ idx ] ) {
                    cleanedArray.push( stringArray[ idx ] );
                }
            }
            return cleanedArray;
        }

        // Escapes HTML special characters in a string
        function escapeHtmlChars( inputString ) {
            var processedString = inputString;
            processedString = processedString.replace( /&/g, "&amp;" );
            processedString = processedString.replace( /</g, "&lt;" );
            processedString = processedString.replace( />/g, "&gt;" );
            processedString = processedString.replace( /"/g, "&quot;" );

            return processedString;
        }


        // Constructor for the differencing processor
        var ComparisonProcessor = function ( ignoreWhitespace ) {
            this.skipWhitespace = ignoreWhitespace;
        };

        // Prototype methods for the differencing processor
        ComparisonProcessor.prototype = {
            // Main differencing function
            compare: function ( sourceText, targetText ) {
                // Identity case: if strings are identical, no diff needed
                if ( targetText == sourceText ) {
                    return [ { elementContent: targetText } ];
                }
                // If new string is empty, all of old string was removed
                if ( !targetText ) {
                    return [ { elementContent: sourceText, removedIndicator: true } ];
                }
                // If old string is empty, all of new string was added
                if ( !sourceText ) {
                    return [ { elementContent: targetText, addedIndicator: true } ];
                }

                // Tokenize input strings
                targetText = this.parseText( targetText );
                sourceText = this.parseText( sourceText );

                var targetLength = targetText.length,
                    sourceLength = sourceText.length;
                var maxOperationLength = targetLength + sourceLength;
                // Initialize the best path array
                var optimalPath = [ { currentPosition: -1, elements: [] } ];

                // Seed with editLength = 0, find initial common elements
                var sourcePosition = this.findCommon( optimalPath[ 0 ], targetText, sourceText, 0 );
                // If all common, return immediately
                if ( optimalPath[ 0 ].currentPosition + 1 >= targetLength && sourcePosition + 1 >= sourceLength ) {
                    return optimalPath[ 0 ].elements;
                }

                // Iterate through possible edit lengths
                for ( var stepLength = 1; stepLength <= maxOperationLength; stepLength++ ) {
                    // Iterate through diagonals
                    for ( var diagPath = -1 * stepLength; diagPath <= stepLength; diagPath += 2 ) {
                        var baseEntry;
                        var insertionPath = optimalPath[ diagPath - 1 ],
                            deletionPath = optimalPath[ diagPath + 1 ];
                        sourcePosition = ( deletionPath ? deletionPath.currentPosition : 0 ) - diagPath;

                        // Clear previous diagonal's entry if it's no longer needed
                        if ( insertionPath ) {
                            optimalPath[ diagPath - 1 ] = undefined;
                        }

                        // Determine if insertion or deletion is possible
                        var canInsert = insertionPath && insertionPath.currentPosition + 1 < targetLength;
                        var canDelete = deletionPath && 0 <= sourcePosition && sourcePosition < sourceLength;

                        // If neither is possible, skip this diagonal
                        if ( !canInsert && !canDelete ) {
                            optimalPath[ diagPath ] = undefined;
                            continue;
                        }

                        // Select the path that is furthest from the origin
                        if ( !canInsert || ( canDelete && insertionPath.currentPosition < deletionPath.currentPosition ) ) {
                            baseEntry = duplicatePath( deletionPath );
                            this.addElement( baseEntry.elements, sourceText[ sourcePosition ], undefined, true );
                        } else {
                            baseEntry = duplicatePath( insertionPath );
                            baseEntry.currentPosition++;
                            this.addElement( baseEntry.elements, targetText[ baseEntry.currentPosition ], true, undefined );
                        }

                        // Extend the path by finding common elements
                        sourcePosition = this.findCommon( baseEntry, targetText, sourceText, diagPath );

                        // If the end of both strings is reached, return the path
                        if ( baseEntry.currentPosition + 1 >= targetLength && sourcePosition + 1 >= sourceLength ) {
                            return baseEntry.elements;
                        } else {
                            optimalPath[ diagPath ] = baseEntry;
                        }
                    }
                }
            },

            // Adds a component to the diff result, merging if possible
            addElement: function ( elementList, valueItem, addedFlag, removedFlag ) {
                var finalElement = elementList[ elementList.length - 1 ];
                // Merge with previous component if types match
                if ( finalElement && finalElement.addedIndicator === addedFlag && finalElement.removedIndicator === removedFlag ) {
                    elementList[ elementList.length - 1 ] = {
                        elementContent: this.concatValues( finalElement.elementContent, valueItem ),
                        addedIndicator: addedFlag,
                        removedIndicator: removedFlag
                    };
                } else {
                    elementList.push( {
                        elementContent: valueItem,
                        addedIndicator: addedFlag,
                        removedIndicator: removedFlag
                    } );
                }
            },

            // Finds common elements between two strings and extends the path
            findCommon: function ( currentPath, targetText, sourceText, diagPath ) {
                var targetLength = targetText.length,
                    sourceLength = sourceText.length,
                    targetPos = currentPath.currentPosition,
                    sourcePos = targetPos - diagPath;

                // While elements are common, advance positions and add to path
                while ( targetPos + 1 < targetLength && sourcePos + 1 < sourceLength && this.areEqual( targetText[ targetPos + 1 ], sourceText[ sourcePos + 1 ] ) ) {
                    targetPos++;
                    sourcePos++;

                    this.addElement( currentPath.elements, targetText[ targetPos ], undefined, undefined );
                }
                currentPath.currentPosition = targetPos;
                return sourcePos;
            },

            // Compares two values for equality, considering whitespace option
            areEqual: function ( leftValue, rightValue ) {
                var whitespaceRegex = /\S/; // Non-whitespace character regex
                // If ignoring whitespace and both are whitespace, consider them equal
                if ( this.skipWhitespace && !whitespaceRegex.test( leftValue ) && !whitespaceRegex.test( rightValue ) ) {
                    return true;
                } else {
                    // Otherwise, strict equality
                    return leftValue == rightValue;
                }
            },

            // Concatenates two string values
            concatValues: function ( first, second ) {
                return first + second;
            },

            // Default tokenizer (no-op)
            parseText: function ( value ) {
                return value;
            }
        };

        // Specific differ instances
        var CharacterComparer = new ComparisonProcessor(); // Character-level diff

        var WordComparer = new ComparisonProcessor( true ); // Word-level diff, ignore whitespace
        WordComparer.parseText = function ( textValue ) {
            return filterEmpty( textValue.split( /(\s+|\b)/ ) ); // Split by words and whitespace
        };

        var CssComparer = new ComparisonProcessor( true ); // CSS-level diff, ignore whitespace
        CssComparer.parseText = function ( textValue ) {
            return filterEmpty( textValue.split( /([{}:;,]|\s+)/ ) ); // Split by CSS tokens
        };

        var LineComparer = new ComparisonProcessor(); // Line-level diff
        LineComparer.parseText = function ( textValue ) {
            return textValue.split( /^/m ); // Split by lines
        };

        return {
            // Public API for different diff types
            diffByChars: function ( oldStr, newStr ) {
                return CharacterComparer.compare( oldStr, newStr );
            },
            diffByWords: function ( oldStr, newStr ) {
                return WordComparer.compare( oldStr, newStr );
            },
            diffByLines: function ( oldStr, newStr ) {
                return LineComparer.compare( oldStr, newStr );
            },

            diffByCss: function ( oldStr, newStr ) {
                return CssComparer.compare( oldStr, newStr );
            },

            // Generates a standard unified diff patch format
            generatePatch: function ( sourceFile, oldContent, newContent, sourceHead, targetHead ) {
                var reportLines = [];

                reportLines.push( "Index: " + sourceFile );
                reportLines.push( "===================================================================" );
                reportLines.push( "--- " + sourceFile + ( typeof sourceHead === "undefined" ? "" : "\t" + sourceHead ) );
                reportLines.push( "+++ " + sourceFile + ( typeof targetHead === "undefined" ? "" : "\t" + targetHead ) );

                var changeSet = LineComparer.compare( oldContent, newContent );
                // Remove trailing newline if it's the last change and empty
                if ( !changeSet[ changeSet.length - 1 ].elementContent ) {
                    changeSet.pop();
                }
                // Append an empty value to make cleanup easier
                changeSet.push( { elementContent: "", lineElements: [] } );

                // Helper to format context lines
                function getChunkLines( lines ) {
                    return lines.map( function ( lineEntry ) {
                        return ' ' + lineEntry;
                    } );
                }

                // Helper to check for No Newline at End of File
                function noTrailingNewline( currentChunk, entryIndex, currentItem ) {
                    var lastChange = changeSet[ changeSet.length - 2 ],
                        isLastEntry = entryIndex === changeSet.length - 2,
                        isLastOfType = entryIndex === changeSet.length - 3 && ( currentItem.addedIndicator === !lastChange.addedIndicator || currentItem.removedIndicator === !lastChange.removedIndicator );

                    // Figure out if this is the last line for the given file and missing NL
                    if ( !/\n$/.test( currentItem.elementContent ) && ( isLastEntry || isLastOfType ) ) {
                        currentChunk.push( '\\ No newline at end of file' );
                    }
                }

                var startSourceRange = 0,
                    startTargetRange = 0,
                    currentReportChunk = [],
                    sourceLineCounter = 1,
                    targetLineCounter = 1;

                for ( var entryIndex = 0; entryIndex < changeSet.length; entryIndex++ ) {
                    var currentItem = changeSet[ entryIndex ],
                        lineElements = currentItem.lineElements || currentItem.elementContent.replace( /\n$/, "" ).split( "\n" );
                    currentItem.lineElements = lineElements;

                    if ( currentItem.addedIndicator || currentItem.removedIndicator ) {
                        if ( !startSourceRange ) {
                            var previousEntry = changeSet[ entryIndex - 1 ];
                            startSourceRange = sourceLineCounter;
                            startTargetRange = targetLineCounter;

                            if ( previousEntry ) {
                                currentReportChunk = getChunkLines( previousEntry.lineElements.slice( -4 ) );
                                startSourceRange -= currentReportChunk.length;
                                startTargetRange -= currentReportChunk.length;
                            }
                        }
                        currentReportChunk.push.apply( currentReportChunk, lineElements.map( function ( lineEntry ) {
                            return ( currentItem.addedIndicator ? "+" : "-" ) + lineEntry;
                        } ) );
                        noTrailingNewline( currentReportChunk, entryIndex, currentItem );

                        if ( currentItem.addedIndicator ) {
                            targetLineCounter += lineElements.length;
                        } else {
                            sourceLineCounter += lineElements.length;
                        }
                    } else {
                        if ( startSourceRange ) {
                            // Close out any changes that have been output (or join overlapping)
                            if ( lineElements.length <= 8 && entryIndex < changeSet.length - 2 ) {
                                // Overlapping context, add more lines
                                currentReportChunk.push.apply( currentReportChunk, getChunkLines( lineElements ) );
                            } else {
                                // End the range and output the chunk
                                var overlapSize = Math.min( lineElements.length, 4 );
                                reportLines.push(
                                    "@@ -" + startSourceRange + "," + ( sourceLineCounter - startSourceRange + overlapSize ) +
                                    " +" + startTargetRange + "," + ( targetLineCounter - startTargetRange + overlapSize ) +
                                    " @@"
                                );
                                reportLines.push.apply( reportLines, currentReportChunk );
                                reportLines.push.apply( reportLines, getChunkLines( lineElements.slice( 0, overlapSize ) ) );
                                if ( lineElements.length <= 4 ) {
                                    noTrailingNewline( reportLines, entryIndex, currentItem );
                                }

                                startSourceRange = 0;
                                startTargetRange = 0;
                                currentReportChunk = [];
                            }
                        }
                        sourceLineCounter += lineElements.length;
                        targetLineCounter += lineElements.length;
                    }
                }

                return reportLines.join( '\n' ) + '\n';
            },

            // Converts diff changes into HTML markup
            convertChangesToMarkup: function ( changes ) {
                var markupOutput = [];
                for ( var idx = 0; idx < changes.length; idx++ ) {
                    var change = changes[ idx ];
                    if ( change.addedIndicator ) {
                        markupOutput.push( "<ins>" );
                    } else if ( change.removedIndicator ) {
                        markupOutput.push( "<del>" );
                    }

                    markupOutput.push( escapeHtmlChars( change.elementContent ) );

                    if ( change.addedIndicator ) {
                        markupOutput.push( "</ins>" );
                    } else if ( change.removedIndicator ) {
                        markupOutput.push( "</del>" );
                    }
                }
                return markupOutput.join( "" );
            }
        };
    } )();

    // Export the diff engine if module environment is detected
    if ( typeof unit !== "undefined" ) {
        unit.moduleOutput = TextCompareEngine;
    }

} ); // module: browser/diff.js

retrieveModule.enrollUnit( "browser/events.js", function ( unit, unitExports, importModule ) {

    // Module exports declaration
    unitExports.EventPublisher = EventPublisher;

    // Utility to check if an object is an array
    function checkIfArray( subject ) {
        return '[object Array]' == {}.toString.call( subject );
    }

    // Event publisher constructor
    function EventPublisher() {}

    // Attaches a handler function to a named event
    EventPublisher.prototype.attachHandler = function ( eventName, handlerFunction ) {
        if ( !this.eventHandlers ) {
            this.eventHandlers = {};
        }

        if ( !this.eventHandlers[ eventName ] ) {
            this.eventHandlers[ eventName ] = handlerFunction;
        } else if ( checkIfArray( this.eventHandlers[ eventName ] ) ) {
            this.eventHandlers[ eventName ].push( handlerFunction );
        } else {
            this.eventHandlers[ eventName ] = [ this.eventHandlers[ eventName ], handlerFunction ];
        }

        return this;
    };

    // Alias for attachHandler
    EventPublisher.prototype.addSubscription = EventPublisher.prototype.attachHandler;

    // Attaches a handler that will only execute once
    EventPublisher.prototype.attachVolatileHandler = function ( eventName, handlerFunction ) {
        var thisContext = this;

        function oneTimeHandler() {
            thisContext.detachHandler( eventName, oneTimeHandler );
            handlerFunction.apply( this, arguments );
        };

        oneTimeHandler.handlerReference = handlerFunction;
        this.attachHandler( eventName, oneTimeHandler );

        return this;
    };

    // Detaches a specific handler from an event
    EventPublisher.prototype.detachHandler = function ( eventName, handlerFunction ) {
        if ( this.eventHandlers && this.eventHandlers[ eventName ] ) {
            var handlerList = this.eventHandlers[ eventName ];

            if ( checkIfArray( handlerList ) ) {
                var position = -1;

                for ( var idx = 0, listLength = handlerList.length; idx < listLength; idx++ ) {
                    if ( handlerList[ idx ] === handlerFunction || ( handlerList[ idx ].handlerReference && handlerList[ idx ].handlerReference === handlerFunction ) ) {
                        position = idx;
                        break; // Found the handler, exit loop
                    }
                }

                if ( position < 0 ) {
                    return this; // Handler not found
                }

                handlerList.splice( position, 1 ); // Remove handler

                if ( !handlerList.length ) {
                    delete this.eventHandlers[ eventName ]; // Remove event entry if no handlers left
                }
            } else if ( handlerList === handlerFunction || ( handlerList.handlerReference && handlerList.handlerReference === handlerFunction ) ) {
                delete this.eventHandlers[ eventName ]; // Remove single handler entry
            }
        }

        return this;
    };

    // Removes all handlers for a given event name, or all events if no name provided
    EventPublisher.prototype.clearAllHandlers = function ( eventName ) {
        if ( eventName === undefined ) {
            this.eventHandlers = {}; // Clear all events
            return this;
        }

        if ( this.eventHandlers && this.eventHandlers[ eventName ] ) {
            this.eventHandlers[ eventName ] = null; // Clear handlers for specific event
        }

        return this;
    };

    // Retrieves all handlers for a specified event
    EventPublisher.prototype.retrieveHandlers = function ( eventName ) {
        if ( !this.eventHandlers ) {
            this.eventHandlers = {};
        }

        if ( !this.eventHandlers[ eventName ] ) {
            this.eventHandlers[ eventName ] = []; // Initialize empty array if no handlers
        }

        if ( !checkIfArray( this.eventHandlers[ eventName ] ) ) {
            this.eventHandlers[ eventName ] = [ this.eventHandlers[ eventName ] ]; // Convert single handler to array
        }

        return this.eventHandlers[ eventName ];
    };

    // Emits an event, invoking all registered handlers
    EventPublisher.prototype.emitEvent = function ( eventName ) {
        // Implementation for emitEvent would go here.
        // It's not present in the original code snippet.
    };
} ); // module: browser/events.js