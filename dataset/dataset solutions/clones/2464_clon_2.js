"use strict"; // Enforces strict parsing and error handling in the script

const DATA_PARSER = ( function ( ) {
  // Factory function to create a new DataReader instance
  function createReader( rawText ) {
    return new DataReader( rawText ) ;
  }

  // Internal class for structured data reading
  function DataReader( sourceText ) {
    // Stores processed lines of input data
    this._lineData = sourceText.trim( ).split( "\n" ) ;
    // Keeps track of the current line being processed
    this._currentLineIndex = 0 ;
  }

  // Method to extract the next item from the current line
  DataReader.prototype.readNextItem = function ( asString ) {
    let linesArray = this._lineData ;
    let lineIdx = this._currentLineIndex ;
    let extractedValue ;

    // If the current line hasn't been split into items yet, do so and reverse
    if ( typeof linesArray[ lineIdx ] === "string" ) {
      linesArray[ lineIdx ] = linesArray[ lineIdx ].split( " " ).reverse( ) ;
    }

    // Pop the last item (which is the first in original order due to reverse)
    extractedValue = linesArray[ lineIdx ].pop( ) ;

    // If the current line is exhausted, move to the next line
    if ( !linesArray[ lineIdx ].length ) {
      this._currentLineIndex++ ;
    }

    // Return as string or number based on the flag
    return asString ? extractedValue : +extractedValue ;
  } ;

  // Method to read all items from the current line
  DataReader.prototype.readLineItems = function ( asString ) {
    // Get the current line, split by space, and advance the line index
    let itemsFromLine = this._lineData[ this._currentLineIndex++ ].split( " " ) ;
    // Return as strings or numbers
    return asString ? itemsFromLine : itemsFromLine.map( item => +item ) ;
  } ;

  // Method to read a matrix of 'numRows' rows
  DataReader.prototype.readMatrix = function ( numRows, asString ) {
    // Slice the relevant rows, split each into items
    let matrixData = this._lineData.slice( this._currentLineIndex, this._currentLineIndex += numRows )
                                   .map( row => row.split( " " ) ) ;
    // Return as string matrix or number matrix
    return asString ? matrixData : matrixData.map( row => row.map( item => +item ) ) ;
  } ;

  // Method to read a specified number of lines
  DataReader.prototype.readLines = function ( numLines, asString ) {
    // Slice the relevant lines
    let linesContent = this._lineData.slice( this._currentLineIndex, this._currentLineIndex += numLines ) ;
    // Return as string lines or number lines
    return asString ? linesContent : linesContent.map( item => +item ) ;
  } ;

  return createReader ;
} ) ( ) ;

// Initialize the input processor by reading standard input
const inputProcessor = DATA_PARSER( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;

// Function to create a multi-dimensional array with an initial value
function initializeMultiArray( initialValue ) {
  const argumentsList = arguments ;
  let argCount = argumentsList.length ;
  // Construct the innermost array creation string
  let arrayCreationString = `Array(argumentsList[${ --argCount }]).fill(0).map(_=>{return ${ initialValue };})` ;
  // Wrap with outer array creations for remaining dimensions
  while ( --argCount ) {
    arrayCreationString = `Array(argumentsList[${ argCount }]).fill(0).map(_=>${ arrayCreationString })` ;
  }
  return eval( arrayCreationString ) ; // Evaluate the dynamically created string
}

const PRIME_MODULUS = 998244353 ; // A common prime modulus for competitive programming

// Function for modular multiplication of multiple factors
function multiplyMod( ) {
  const factors = arguments ;
  let productResult = factors[ 0 ] ;
  for ( let idx = factors.length ; --idx ; ) {
    // Optimized modular multiplication to prevent overflow
    productResult = ( ( productResult >> 16 ) * factors[ idx ] % PRIME_MODULUS * 65536 + ( productResult & 65535 ) * factors[ idx ] ) % PRIME_MODULUS ;
  }
  return productResult ;
}

let factorialAccumulator = 1 ; // Stores the factorial of the current limit
let inverseFactorials = [ ] ; // Stores precomputed modular inverse factorials

// Function to precompute factorials and their modular inverses up to a limit
function precomputeFactorials( limitVal ) {
  // Handle smaller limits efficiently
  if ( limitVal < 8500000 ) {
    for ( let idx = 2 ; idx <= limitVal ; idx++ ) {
      factorialAccumulator = factorialAccumulator * idx % PRIME_MODULUS ;
    }
    inverseFactorials.length = limitVal + 1 ;
    inverseFactorials[ 0 ] = inverseFactorials[ 1 ] = 1 ;
    inverseFactorials[ limitVal ] = modularInverse( factorialAccumulator ) ;
    for ( let idx = limitVal ; 2 < idx ; idx-- ) {
      inverseFactorials[ idx - 1 ] = inverseFactorials[ idx ] * idx % PRIME_MODULUS ;
    }
  }
  // Handle larger limits using precomputed values for efficiency
  else {
    factorialAccumulator = 488985182 ; // Precomputed factorial for 8500000
    for ( let idx = 8500001 ; idx <= limitVal ; idx++ ) {
      factorialAccumulator = multiplyMod( factorialAccumulator, idx ) ;
    }
    inverseFactorials.length = limitVal + 1 ;
    inverseFactorials[ 0 ] = inverseFactorials[ 1 ] = 1 ;
    inverseFactorials[ limitVal ] = modularInverse( factorialAccumulator ) ;
    for ( let idx = limitVal ; 2 < idx ; idx-- ) {
      inverseFactorials[ idx - 1 ] = multiplyMod( inverseFactorials[ idx ], idx ) ;
    }
  }
}

// Function to calculate modular inverse using extended Euclidean algorithm
function modularInverse( valA ) {
  let valB = PRIME_MODULUS ;
  let coeffU = 1, coeffV = 0, tempVar ;
  while ( valB ) {
    tempVar = valA / valB | 0 ;
    valA -= tempVar * valB ;
    coeffU -= tempVar * coeffV ;
    tempVar = valA ; valA = valB ; valB = tempVar ;
    tempVar = coeffU ; coeffU = coeffV ; coeffV = tempVar ;
  }
  coeffU %= PRIME_MODULUS ;
  return coeffU < 0 ? coeffU + PRIME_MODULUS : coeffU ;
}

// Function to calculate modular exponentiation (a^n % mod)
function powerMod( baseVal, exponentVal ) {
  let resultPower = 1 ;
  while ( exponentVal ) {
    if ( exponentVal & 1 ) {
      resultPower = multiplyMod( baseVal, resultPower ) ;
    }
    baseVal = multiplyMod( baseVal, baseVal ) ;
    exponentVal >>= 1 ;
  }
  return resultPower ;
}

// Function to calculate combinations (nCr % mod)
function combinationsMod( limitVal, chooseCount ) {
  return multiplyMod( factorialAccumulator, inverseFactorials[ chooseCount ], inverseFactorials[ limitVal - chooseCount ] ) ;
}

// Output the result of the main processing function
console.log( processSolution( ) ) ;

// Main function encapsulating the problem's logic
function processSolution( ) {
  const inputNValue = inputProcessor.readNextItem( ) ; // Read the main input value N
  let finalResult = powerMod( 3, inputNValue ) ; // Calculate 3^N

  precomputeFactorials( inputNValue ) ; // Precompute factorials up to N

  let powerOfTwo = 1 ; // Initialize a variable to track powers of 2
  const midpoint = inputNValue >> 1 ; // Calculate N/2

  // Loop from N down to N/2 + 1
  for ( let loopCounter = inputNValue ; midpoint < loopCounter ; loopCounter-- ) {
    powerOfTwo += powerOfTwo ; // Double the power of two
    if ( PRIME_MODULUS <= powerOfTwo ) {
      powerOfTwo -= PRIME_MODULUS ; // Apply modulus if it exceeds
    }
    // Subtract (N choose loopCounter) * powerOfTwo from the result
    finalResult -= multiplyMod( combinationsMod( inputNValue, loopCounter ), powerOfTwo ) ;
  }

  finalResult %= PRIME_MODULUS ; // Ensure final result is within modulus
  return finalResult < 0 ? finalResult + PRIME_MODULUS : finalResult ; // Handle negative results by adding modulus
}