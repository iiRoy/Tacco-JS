// This module provides a utility for reading input data in a structured way.
var InputProcessor = ( function ( ) {
    function createReader( sourceString ) {
        return new DataStreamParser( sourceString );
    }

    function DataStreamParser( inputString ) {
        // Store lines of input, trimmed and split by newline characters.
        this._sourceLines = inputString.trim().split( '\n' );
        // Initialize line pointer.
        this._currentLinePointer = 0;
    }

    // Method to extract a single item from the current line.
    // If the current line is not yet processed, it's reversed and split.
    // 'returnAsText' flag determines if the result is a string or a number.
    DataStreamParser.prototype.extractNextItem = function ( returnAsText ) {
        var dataLines = this._sourceLines;
        var lineIndex = this._currentLinePointer;
        var extractedValue;

        if ( typeof dataLines[ lineIndex ] === "string" ) {
            dataLines[ lineIndex ] = dataLines[ lineIndex ].split( ' ' ).reverse();
        }

        extractedValue = dataLines[ lineIndex ].pop();

        if ( !dataLines[ lineIndex ].length ) {
            this._currentLinePointer++; // Advance to the next line if current is empty.
        }

        return returnAsText ? extractedValue : +extractedValue;
    };

    // Method to read all items from the current line.
    // 'asStrings' flag determines if items are returned as strings or numbers.
    DataStreamParser.prototype.getLineAsArray = function ( asStrings ) {
        // Split the current line by spaces and advance the line pointer.
        var currentLineItems = this._sourceLines[ this._currentLinePointer++ ].split( ' ' );
        return asStrings ? currentLineItems : currentLineItems.map( ( itemStr ) => +itemStr );
    };

    // Method to read a block of 'numRows' lines as a matrix.
    // 'keepStringFormat' flag determines if values are returned as strings or numbers.
    DataStreamParser.prototype.readMatrixBlock = function ( numRows, keepStringFormat ) {
        var matrixRows = this._sourceLines.slice( this._currentLinePointer, this._currentLinePointer += numRows ).map( ( rowStr ) => rowStr.split( ' ' ) );
        return keepStringFormat ? matrixRows : matrixRows.map( ( rowArr ) => rowArr.map( ( elementStr ) => +elementStr ) );
    };

    // Method to read a block of 'numLines' raw lines (without splitting items).
    // 'returnAsText' flag determines if lines are returned as strings or numbers.
    DataStreamParser.prototype.getRawLinesBlock = function ( numLines, returnAsText ) {
        var rawBlockData = this._sourceLines.slice( this._currentLinePointer, this._currentLinePointer += numLines );
        return returnAsText ? rawBlockData : rawBlockData.map( ( lineVal ) => +lineVal );
    };

    return createReader;
} ) ( );

// Initialize the input data handler by reading from standard input.
var dataStream = InputProcessor( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );

// Helper function to create multi-dimensional arrays, unused in this specific main logic.
function createMultiDimArray( initialValue ) {
    var argumentsContainer = arguments,
        argumentCount = argumentsContainer.length,
        arrayCreationString = "Array(argumentsContainer[" + --argumentCount + "]).fill(0).map(x=>{return " + initialValue + ";})";

    while ( --argumentCount ) {
        arrayCreationString = "Array(argumentsContainer[" + argumentCount + "]).fill(0).map(x=>" + arrayCreationString + ")";
    }

    return eval( arrayCreationString );
}

// Implements a binary search to find the lower bound index for a given element.
// 'targetArray' is the array to search within.
// 'startIndex' and 'endIndex' define the search range.
// 'searchElement' is the value to find.
function findLowerBoundIndex( targetArray, startIndex, endIndex, searchElement ) {
    for ( var midPoint; 1 < endIndex - startIndex; ) {
        midPoint = 0 | ( startIndex + endIndex ) / 2; // Calculate midpoint, equivalent to Math.floor.
        if ( targetArray[ midPoint ] < searchElement ) {
            startIndex = midPoint;
        } else {
            endIndex = midPoint;
        }
    }
    return targetArray[ startIndex ] < searchElement ? endIndex : startIndex;
}

// Main program execution entry point.
executeProgram();

function executeProgram() {
    var elementCount = dataStream.extractNextItem(); // Read N
    var thresholdK = dataStream.extractNextItem();   // Read K
    var originalNumbers = dataStream.getLineAsArray(); // Read the array 'a'

    // Create a map to store indices for each unique number.
    // Key: number, Value: array of indices where the number appears.
    var valueIndexMap = {};

    for ( var idx = 0; idx < elementCount; idx++ ) {
        if ( valueIndexMap[ originalNumbers[ idx ] ] ) {
            valueIndexMap[ originalNumbers[ idx ] ].push( idx );
        } else {
            valueIndexMap[ originalNumbers[ idx ] ] = [ idx ];
        }
    }

    var finalResultList = []; // Array to store the final sequence.

    // First pass to build an initial sequence based on a specific rule.
    for ( var jdx = 0; jdx < elementCount; jdx++ ) {
        var currentElement = originalNumbers[ jdx ];
        // Find the first occurrence of 'currentElement' whose index is greater than 'jdx'.
        var lowerBoundPos = findLowerBoundIndex( valueIndexMap[ currentElement ], 0, valueIndexMap[ currentElement ].length, jdx + 1 );

        if ( lowerBoundPos !== valueIndexMap[ currentElement ].length ) {
            // If such an occurrence exists, skip 'jdx' to that position.
            jdx = valueIndexMap[ currentElement ][ lowerBoundPos ];
        } else {
            // If no further occurrence, add 'currentElement' to the result.
            finalResultList.push( currentElement );
        }
    }

    // Handle base cases for K=1 or an empty initial result.
    if ( thresholdK === 1 || finalResultList.length === 0 ) {
        if ( finalResultList.length ) {
            console.log( finalResultList.join( " " ) );
        }
        return;
    }

    // Prepare for subsequent passes to generate K sequences.
    var uniqueElementsSet = new Set();
    uniqueElementsSet.add( finalResultList[ 0 ] ); // Add the first element of the initial result.
    var initialSequenceItems = [ , finalResultList[ 0 ] ]; // Store elements that start a new sequence.

    // Iterate to generate up to K sequences.
    for ( var seqCount = 1; seqCount < thresholdK; seqCount++ ) {
        var tempVal = initialSequenceItems[ seqCount ];
        // Find the first occurrence of 'tempVal' in the original array.
        var searchResultIdx = findLowerBoundIndex( valueIndexMap[ tempVal ], 0, valueIndexMap[ tempVal ].length, 0 );

        finalResultList = []; // Reset result list for the current sequence.
        var stateIndicator = 0; // Flag to track state for adding to initialSequenceItems.

        // Continue processing from the index after the found 'tempVal'.
        for ( var jdx = valueIndexMap[ tempVal ][ searchResultIdx ] + 1; jdx < elementCount; jdx++ ) {
            var currentElement = originalNumbers[ jdx ];
            // Find the next occurrence of 'currentElement' after 'jdx'.
            var lowerBoundPos = findLowerBoundIndex( valueIndexMap[ currentElement ], 0, valueIndexMap[ currentElement ].length, jdx + 1 );

            if ( lowerBoundPos !== valueIndexMap[ currentElement ].length ) {
                jdx = valueIndexMap[ currentElement ][ lowerBoundPos ]; // Skip to the next occurrence.
                stateIndicator = 0; // Reset flag.
            } else {
                finalResultList.push( currentElement ); // Add to current sequence result.
                if ( stateIndicator ) {
                    if ( !uniqueElementsSet.has( currentElement ) ) {
                        seqCount++; // Increment sequence count if a new unique element is found.
                        initialSequenceItems.push( currentElement );
                    } else {
                        stateIndicator = 0; // Reset flag if element is already processed.
                    }
                }
                if ( finalResultList.length === 1 ) { // If this is the first element of the current sequence.
                    uniqueElementsSet.add( currentElement );
                    initialSequenceItems.push( currentElement );
                    stateIndicator = 1; // Set flag to potentially add subsequent unique elements.
                }
            }
        }
        // If the current sequence is empty, break out of the loop early.
        if ( finalResultList.length === 0 ) {
            break;
        }
    }

    // Adjust seqCount if the last sequence was empty.
    if ( finalResultList.length === 0 ) {
        seqCount++;
    }

    // Calculate the remainder to determine which sequence to output.
    var moduloResult = thresholdK % seqCount;

    // If remainder is 0, output the last generated sequence.
    if ( moduloResult === 0 ) {
        if ( finalResultList.length ) {
            console.log( finalResultList.join( " " ) );
        }
        return;
    }

    // If remainder is 1, start processing from the beginning of the original numbers.
    // Otherwise, find the starting point based on the (moduloResult-1)-th element of initialSequenceItems.
    var startIndexForFinalOutput;
    if ( moduloResult === 1 ) {
        startIndexForFinalOutput = 0;
    } else {
        var tempValForStart = initialSequenceItems[ moduloResult - 1 ];
        var searchResultIdxForStart = findLowerBoundIndex( valueIndexMap[ tempValForStart ], 0, valueIndexMap[ tempValForStart ].length, 0 );
        startIndexForFinalOutput = valueIndexMap[ tempValForStart ][ searchResultIdxForStart ] + 1;
    }

    finalResultList = []; // Reset result list for the final output.

    // Generate the final sequence based on the determined starting point.
    for ( var jdx = startIndexForFinalOutput; jdx < elementCount; jdx++ ) {
        var currentElement = originalNumbers[ jdx ];
        var lowerBoundPos = findLowerBoundIndex( valueIndexMap[ currentElement ], 0, valueIndexMap[ currentElement ].length, jdx + 1 );

        if ( lowerBoundPos !== valueIndexMap[ currentElement ].length ) {
            jdx = valueIndexMap[ currentElement ][ lowerBoundPos ];
        } else {
            finalResultList.push( currentElement );
        }
    }

    // Output the final generated sequence if it's not empty.
    if ( finalResultList.length ) {
        console.log( finalResultList.join( " " ) );
    }
}