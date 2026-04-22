"use strict"; // Enable strict mode for better error handling

var systemInput = require("fs") . readFileSync ( "/dev/stdin", "utf8" ) ; // Read raw data from standard input
var tokenStream = systemInput . split ( / |\n/ ) , // Split input by spaces or newlines into tokens
    streamIndex = 0 ; // Initialize index for token stream

/**
 * Retrieves the next token from the stream and converts it to a number.
 * @returns {number} The next numeric value.
 */
function obtainNextNumber ( ) {
    return + tokenStream [ streamIndex++ ] ;
}

/**
 * Retrieves the next token from the stream as a string.
 * @returns {string} The next string value.
 */
function obtainNextString ( ) {
    return tokenStream [ streamIndex++ ] ;
}

/**
 * Retrieves the next token from the stream and converts it to a BigInt.
 * @returns {BigInt} The next large integer value.
 */
function obtainNextBigInt ( ) {
    return BigInt ( tokenStream [ streamIndex++ ] ) ;
}

/**
 * Retrieves a sequence of 'count' values from the stream.
 * @param {number} count The number of values to retrieve.
 * @param {boolean} asStrings If true, returns values as strings; otherwise, as numbers.
 * @returns {Array<string|number>} An array of values.
 */
function fetchValueSequence ( count , asStrings ) {
    if ( asStrings ) {
        return tokenStream . slice ( streamIndex , streamIndex += count ) ;
    } else {
        return tokenStream . slice ( streamIndex , streamIndex += count ) . map ( currentElement => + currentElement ) ;
    }
}

/**
 * Retrieves a matrix of values from the stream.
 * @param {number} matrixHeight The number of rows.
 * @param {number} matrixWidth The number of columns per row.
 * @param {boolean} asStrings If true, returns values as strings; otherwise, as numbers.
 * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
 */
function fetchValueMatrix ( matrixHeight , matrixWidth , asStrings ) {
    var resultingMatrix = [ ] ; // Initialize an empty array for the matrix
    var currentRowIndex = 0 ; // Loop counter for rows

    if ( asStrings ) {
        for ( ; currentRowIndex < matrixHeight ; currentRowIndex++ ) {
            resultingMatrix . push ( tokenStream . slice ( streamIndex , streamIndex += matrixWidth ) ) ;
        }
    } else {
        for ( ; currentRowIndex < matrixHeight ; currentRowIndex++ ) {
            resultingMatrix . push ( tokenStream . slice ( streamIndex , streamIndex += matrixWidth ) . map ( element => + element ) ) ;
        }
    }
    return resultingMatrix ;
}

/**
 * Dynamically creates a multi-dimensional array initialized with a default value.
 * @param {*} initialValue The value to initialize array elements with.
 * @param {...number} dimensions The sizes of each dimension.
 * @returns {Array} The created multi-dimensional array.
 */
function createDynamicArray ( initialValue ) {
    var allArguments = arguments ; // Get all arguments passed to the function
    var argCount = allArguments . length ; // Number of dimensions plus the initial value
    var arrayBuilderString = "Array(allArguments[" + --argCount + "]) . fill ( ) . map ( _ => { return " + initialValue + "; } )" ; // Innermost array creation

    // Build the string for outer dimensions
    while ( --argCount ) {
        arrayBuilderString = "Array(allArguments[" + argCount + "]) . fill ( ) . map ( _ => " + arrayBuilderString + " )" ;
    }
    // Evaluate the constructed string to create the array
    return eval ( arrayBuilderString ) ;
}


var finalResult = executeMainAlgorithm ( ) ; // Execute the core logic and store its output

if ( finalResult !== undefined ) {
    console . log ( String ( finalResult ) ) ; // Output the result if it's not undefined
}


/**
 * The primary function containing the problem's solution logic.
 * @returns {*} The calculated result.
 */
function executeMainAlgorithm ( ) {
    var problemSize = obtainNextNumber ( ) ; // Read the main size parameter

    // Initialize a 2D dynamic programming table with -1, and an adjustment counter
    var dpTable = createDynamicArray ( -1 , problemSize + 1 , problemSize + 1 ) ,
        adjustmentCount = 0 ;

    // Read the initial pair of values, sort them
    var initialValues = fetchValueSequence ( 2 ) . sort ( ( firstVal , secondVal ) => firstVal - secondVal ) ;
    var processingQueue ; // Declare queue for state updates

    // Initialize DP table entries based on the initial values
    dpTable [ 0 ] [ 0 ] = dpTable [ 0 ] [ initialValues [ 0 ] ] = dpTable [ 0 ] [ initialValues [ 1 ] ] = dpTable [ initialValues [ 0 ] ] [ initialValues [ 1 ] ] = 0 ;

    // Iterate through subsequent sets of values
    for ( var loopCounter = 1 ; loopCounter < problemSize ; loopCounter++ ) {
        // Read the next triplet of values and sort them
        var currentValues = fetchValueSequence ( 3 ) . sort ( ( valX , valY ) => valX - valY ) ;
        processInputTriplet ( ... currentValues ) ; // Process the triplet
    }

    var finalInputVal = obtainNextNumber ( ) ; // Read the final single input value

    // Calculate and return the maximum value from the DP table plus the adjustment count
    return Math . max ( dpTable [ 0 ] [ 0 ] , dpTable [ finalInputVal ] [ finalInputVal ] + 1 ) + adjustmentCount ;


    /**
     * Processes a triplet of input values (u, v, w) to update the DP table.
     * This function uses nested helper functions to handle different update scenarios.
     * @param {number} firstVal The first value of the triplet.
     * @param {number} secondVal The second value of the triplet.
     * @param {number} thirdVal The third value of the triplet.
     */
    function processInputTriplet ( firstVal , secondVal , thirdVal ) {
        // If the first and third values are identical, increment adjustment and return
        if ( firstVal === thirdVal ) {
            return adjustmentCount++ ;
        }

        processingQueue = [ ] ; // Reset the processing queue for this triplet

        // Handle single element updates
        updateForSingleElement ( firstVal ) ;
        if ( firstVal < secondVal ) {
            updateForSingleElement ( secondVal ) ;
        }
        if ( secondVal < thirdVal ) {
            updateForSingleElement ( thirdVal ) ;
        }

        // Handle pair element updates
        updateForPairElements ( firstVal , secondVal ) ;
        if ( secondVal < thirdVal ) {
            updateForPairElements ( firstVal , thirdVal ) ;
        }
        if ( firstVal < secondVal ) {
            updateForPairElements ( secondVal , thirdVal ) ;
        }

        // Handle triplet element updates
        updateForTripletElements ( firstVal , secondVal , thirdVal ) ;

        // Apply all pending updates from the queue to the DP table
        while ( processingQueue . length ) {
            var valToUpdate = processingQueue . pop ( ) , // Value to assign
                colIndex = processingQueue . pop ( ) , // Column index
                rowIndex = processingQueue . pop ( ) ; // Row index

            // Update DP table if the new value is greater
            if ( dpTable [ rowIndex ] [ colIndex ] < valToUpdate ) {
                dpTable [ rowIndex ] [ colIndex ] = valToUpdate ;
            }
        }
    }

    /**
     * Updates the DP table based on a single element.
     * @param {number} currentElementValue The value for which to perform updates.
     */
    function updateForSingleElement ( currentElementValue ) {
        // Apply update with increment for a specific state
        applyUpdateWithIncrement ( 0 , 0 , currentElementValue , currentElementValue ) ;

        // Iterate for values less than currentElementValue
        for ( var iterationA = 0 ; iterationA < currentElementValue ; iterationA++ ) {
            applyUpdateWithoutIncrement ( iterationA , currentElementValue , 0 , iterationA ) ;
        }

        // Iterate for values from currentElementValue up to problemSize
        for ( var iterationB = currentElementValue ; iterationB <= problemSize ; iterationB++ ) {
            applyUpdateWithoutIncrement ( currentElementValue , iterationB , 0 , iterationB ) ;
        }
    }

    /**
     * Updates the DP table based on a pair of elements.
     * @param {number} valueOne The first element of the pair.
     * @param {number} valueTwo The second element of the pair.
     */
    function updateForPairElements ( valueOne , valueTwo ) {
        applyUpdateWithoutIncrement ( valueOne , valueTwo , 0 , 0 ) ;
        applyUpdateWithIncrement ( 0 , valueTwo , valueOne , valueOne ) ;

        // Different logic if values are distinct or identical
        if ( valueOne < valueTwo ) {
            applyUpdateWithIncrement ( 0 , valueOne , valueTwo , valueTwo ) ;
        } else { // When values are equal (valueOne = valueTwo)
            for ( var indexC = 0 ; indexC < valueOne ; indexC++ ) {
                applyUpdateWithIncrement ( 0 , indexC , indexC , valueOne ) ;
            }
            for ( var indexD = valueOne ; indexD <= problemSize ; indexD++ ) {
                applyUpdateWithIncrement ( 0 , indexD , valueOne , indexD ) ;
            }
        }
    }

    /**
     * Updates the DP table based on a triplet of elements.
     * @param {number} valA The first element of the triplet.
     * @param {number} valB The second element of the triplet.
     * @param {number} valC The third element of the triplet.
     */
    function updateForTripletElements ( valA , valB , valC ) {
        applyUpdateWithIncrement ( valB , valC , valA , valA ) ;

        // Conditional logic based on relationships between triplet values
        if ( valA < valB ) {
            applyUpdateWithIncrement ( valA , valC , valB , valB ) ;
            if ( valB < valC ) {
                applyUpdateWithIncrement ( valA , valB , valC , valC ) ;
            } else { // Case where second and third values are equal (valB = valC)
                for ( var indexE = 0 ; indexE < valA ; indexE++ ) {
                    applyUpdateWithIncrement ( indexE , valA , indexE , valC ) ;
                }
                for ( var indexF = valA ; indexF < valC ; indexF++ ) {
                    applyUpdateWithIncrement ( valA , indexF , indexF , valC ) ;
                }
                for ( var indexG = valC ; indexG <= problemSize ; indexG++ ) {
                    applyUpdateWithIncrement ( valA , indexG , valC , indexG ) ;
                }
            }
        } else { // Case where first and second values are equal (valA = valB)
            applyUpdateWithIncrement ( valA , valA , valC , valC ) ;
            for ( var indexH = 0 ; indexH < valA ; indexH++ ) {
                applyUpdateWithIncrement ( indexH , valC , indexH , valA ) ;
            }
            for ( var indexI = valA ; indexI < valC ; indexI++ ) {
                applyUpdateWithIncrement ( indexI , valC , valA , indexI ) ;
            }
            for ( var indexJ = valC ; indexJ <= problemSize ; indexJ++ ) {
                applyUpdateWithIncrement ( valC , indexJ , valA , indexJ ) ;
            }
        }
    }

    /**
     * Enqueues an update to the processing queue without incrementing the source value.
     * @param {number} targetRow The target row index in DP table.
     * @param {number} targetCol The target column index in DP table.
     * @param {number} sourceRow The source row index in DP table.
     * @param {number} sourceCol The source column index in DP table.
     */
    function applyUpdateWithoutIncrement ( targetRow , targetCol , sourceRow , sourceCol ) {
        if ( dpTable [ targetRow ] [ targetCol ] < dpTable [ sourceRow ] [ sourceCol ] ) {
            processingQueue . push ( dpTable [ sourceRow ] [ sourceCol ] , targetCol , targetRow ) ;
        }
    }

    /**
     * Enqueues an update to the processing queue with incrementing the source value by 1.
     * @param {number} targetRow The target row index in DP table.
     * @param {number} targetCol The target column index in DP table.
     * @param {number} sourceRow The source row index in DP table.
     * @param {number} sourceCol The source column index in DP table.
     */
    function applyUpdateWithIncrement ( targetRow , targetCol , sourceRow , sourceCol ) {
        if ( dpTable [ targetRow ] [ targetCol ] < dpTable [ sourceRow ] [ sourceCol ] + 1 ) {
            processingQueue . push ( dpTable [ sourceRow ] [ sourceCol ] + 1 , targetCol , targetRow ) ;
        }
    }
}