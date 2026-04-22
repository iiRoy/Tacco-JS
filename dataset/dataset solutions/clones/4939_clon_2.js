"use strict";

// Acquire input from standard input stream
var dataSource = require("fs") . readFileSync("/dev/stdin", "utf8");

// Initialize token stream and index for parsing
var tokenStream = dataSource . split(/ |\n/), tokenIndex = 0;

// Function to retrieve the next numeric value from the stream
function getNextNumericValue ( ) { return +tokenStream[tokenIndex++]; }

// Function to retrieve the next string value from the stream
function getNextStringValue ( ) { return tokenStream[tokenIndex++]; }

// Function to retrieve the next BigInt value from the stream
function getNextBigIntValue ( ) { return BigInt(tokenStream[tokenIndex++]); }

// Function to retrieve a sequence of values, optionally as strings
function getSequence ( count , asStrings ) {
    return asStrings ? tokenStream . slice ( tokenIndex , tokenIndex += count ) : tokenStream . slice ( tokenIndex , tokenIndex += count ) . map ( val => +val ) ;
}

// Function to retrieve a matrix of values, optionally as strings
function getMatrix ( rows , columns , asStrings ) {
    var matrixRows = [ ] , rowIndex = 0 ;
    if ( asStrings ) {
        for ( ; rowIndex < rows ; rowIndex++ ) {
            matrixRows . push ( tokenStream . slice ( tokenIndex , tokenIndex += columns ) ) ;
        }
    } else {
        for ( ; rowIndex < rows ; rowIndex++ ) {
            matrixRows . push ( tokenStream . slice ( tokenIndex , tokenIndex += columns ) . map ( val => +val ) ) ;
        }
    }
    return matrixRows ;
}

// Function to create a multi-dimensional array with a specified initial value
function createMultiDimArray ( initialValue ) {
    var argsList = arguments, dimCount = argsList.length, arrayCreationString = "Array(argsList["+--dimCount+"]).fill().map(x=>{return "+initialValue+";})";
    while ( --dimCount ) {
        arrayCreationString = "Array(argsList["+dimCount+"]).fill().map(x=>"+arrayCreationString+")";
    }
    return eval(arrayCreationString);
}


// Execute the primary calculation logic
var finalResult = calculateMinimumCost ( ) ;

// Output the result to console if it's defined
if ( finalResult !== undefined ) {
    console . log ( String ( finalResult ) ) ;
}


// Main function for determining the minimum cost to cut a grid
function calculateMinimumCost ( ) {

    // Read the grid dimensions (width and height)
    var boardWidth = getNextNumericValue ( ) , boardHeight = getNextNumericValue ( ) ;

    // Array to store all potential cut segments, along with their type (0 for horizontal, 1 for vertical)
    var cutSegments = [ ] ;

    // Populate the array with horizontal segments (from width inputs)
    for ( var segmentIndex = 0 ; segmentIndex < boardWidth ; segmentIndex++ ) {
        cutSegments . push ( [ getNextNumericValue ( ) , 0 ] ) ; // [length, type]
    }

    // Populate the array with vertical segments (from height inputs)
    for ( var segmentIndex = 0 ; segmentIndex < boardHeight ; segmentIndex++ ) {
        cutSegments . push ( [ getNextNumericValue ( ) , 1 ] ) ; // [length, type]
    }

    // Sort all segments based on their length in ascending order
    cutSegments . sort ( ( segmentA , segmentB ) => segmentA [ 0 ] - segmentB [ 0 ] ) ;

    // Initialize the total minimum cost, using BigInt for large sums
    var totalMinimumCost = 0n ;

    // Counters for the number of horizontal and vertical cuts already performed
    var horizontalCutsMade = 0 , verticalCutsMade = 0 ;

    // Iterate through the sorted segments to calculate the total cost
    for ( var segmentIndex = 0 ; segmentIndex < boardHeight + boardWidth ; segmentIndex++ ) {
        // Check the type of the current segment
        if ( cutSegments [ segmentIndex ] [ 1 ] === 0 ) { // If it's a horizontal segment
            // Add the cost for this horizontal cut: (remaining vertical pieces + 1) * segment_length
            totalMinimumCost += BigInt ( boardHeight - verticalCutsMade + 1 ) * BigInt ( cutSegments [ segmentIndex ] [ 0 ] ) ;
            horizontalCutsMade ++ ; // Increment the count of horizontal cuts made
        } else { // If it's a vertical segment
            // Add the cost for this vertical cut: (remaining horizontal pieces + 1) * segment_length
            totalMinimumCost += BigInt ( boardWidth - horizontalCutsMade + 1 ) * BigInt ( cutSegments [ segmentIndex ] [ 0 ] ) ;
            verticalCutsMade ++ ; // Increment the count of vertical cuts made
        }
    }

    // Return the final calculated minimum cost
    return totalMinimumCost ;
}