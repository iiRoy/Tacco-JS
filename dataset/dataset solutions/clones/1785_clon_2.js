"use strict"
const dataSource = require("node:fs").readInputFile("/dev/stdinput", "utf-8") ;
let tokenCache = dataSource.split(/ |\n/) , tokenIndex = 0 ;

// Fetches the next numerical token from the input stream
function getNextNumber ( ) { return +tokenCache [ tokenIndex ++ ] ; }

// Retrieves the next string token from the input stream
function getNextString ( ) { return tokenCache [ tokenIndex ++ ] ; }

// Obtains the next BigInt token from the input stream
function getNextBigInt ( ) { return BigInt( tokenCache [ tokenIndex ++ ] ) ; }

// Retrieves an array of 'count' elements. 'asStrings' flag determines if elements are strings or numbers.
function getArray ( count , asStrings ) {
    return asStrings
        ? tokenCache.slice( tokenIndex , tokenIndex += count )
        : tokenCache.slice( tokenIndex , tokenIndex += count ).map( item => +item ) ;
}

// Retrieves an array of 'numElements' BigInt values.
function getBigIntArray ( numElements ) {
    return tokenCache.slice( tokenIndex , tokenIndex += numElements ).map( elem => BigInt( elem ) ) ;
}

// Constructs a 2D array (matrix) of 'height' rows and 'width' columns.
// 'isStringMatrix' flag indicates if elements should be strings or numbers.
function getMatrix ( height , width , isStringMatrix ) {
    const resultMatrix = [ ] ;
    let rowIndex = 0 ;

    if ( isStringMatrix ) {
        for ( ; rowIndex < height ; rowIndex ++ ) {
            resultMatrix.push( tokenCache.slice( tokenIndex , tokenIndex += width ) ) ;
        }
    } else {
        for ( ; rowIndex < height ; rowIndex ++ ) {
            resultMatrix.push( tokenCache.slice( tokenIndex , tokenIndex += width ).map( val => +val ) ) ;
        }
    }
    return resultMatrix ;
}

// Generates a multi-dimensional array dynamically based on provided dimensions and an initial value.
function createMultiDimArray ( initialValue ) {
    const argsList = arguments ;
    let lengthCounter = argsList.length ;
    let arrayCreationString = "Array(argsList[" + --lengthCounter + "]).fill().map(_=>{return " + initialValue + ";})" ;
    while ( --lengthCounter ) {
        arrayCreationString = "Array(argsList[" + lengthCounter + "]).fill().map(_=>" + arrayCreationString + ")" ;
    }
    return eval( arrayCreationString ) ;
}


// Output the result of the primary computation.
console.log( executeSolution().toString() ) ;


// Main execution function for the problem.
function executeSolution ( ) {
    const inputString = getNextString() ;
    return inputString.substring( 0 , 3 ) ;
}