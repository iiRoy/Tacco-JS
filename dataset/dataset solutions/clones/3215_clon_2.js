"use strict"
let PrimaryProcessor=function(initialInput){
  // Process raw input string: trim, split by whitespace, convert to numbers
  initialInput =  initialInput .  trim ( ) .  split ( / \s + / ) .  map ( val => val - 0 ) ;
  const rowCount = initialInput.shift ( ) ;
  const colCount = initialInput.shift ( ) ;

  let basisSize = 0 ; // Counter for the rank of the matrix
  let linearSystem = new BitMatrix ( rowCount , colCount , initialInput ) ; // Initialize the bit matrix

  // Gaussian elimination-like process to find the rank
  while( linearSystem . matrixRows . length > 0 ) {
    let pivotRowIndex = 0; // Index of the potential pivot row
    for(let currentVectorIdx = 0; currentVectorIdx < linearSystem.matrixRows.length; currentVectorIdx++) {
      // Find the first row with a '1' in the first column
      if( linearSystem . matrixRows [ currentVectorIdx ] [ 0 ] === 1 ) break ;
      pivotRowIndex ++ ;
    }

    // If no pivot (all zeros in the first column)
    if( pivotRowIndex === linearSystem . matrixRows . length ) {
      // Move the first column to the end and then delete it
      linearSystem . exchangeColumns ( 0 , linearSystem . matrixRows [ 0 ] . length - 1 ) ;
      linearSystem . removeLastColumn ( ) ;
    } else {
      // A pivot was found, increment the basis size
      basisSize ++ ;
      // Perform XOR operations to eliminate other '1's in the first column
      while( true ) {
        let targetRowIndex = pivotRowIndex + 1 ; // Index of row to be XORed
        for(let scanIdx = pivotRowIndex + 1 ; scanIdx < linearSystem . matrixRows . length ; scanIdx ++) {
          // Find the next row with a '1' in the first column
          if( linearSystem . matrixRows [ scanIdx ] [ 0 ] === 1 ) break ;
          targetRowIndex ++ ;
        }
        // If no more rows with '1's in the first column
        if( targetRowIndex === linearSystem . matrixRows . length ) break ;
        // XOR the target row with the pivot row to zero out its first element
        linearSystem . matrixRows [ targetRowIndex ] = vectorBitwiseXOR ( linearSystem . matrixRows [ pivotRowIndex ] , linearSystem . matrixRows [ targetRowIndex ] ) ;
      }
      // Move the pivot row to the end and remove it
      linearSystem . exchangeMatrixRows ( pivotRowIndex , linearSystem . matrixRows . length - 1 ) ;
      linearSystem . trimMatrixRow ( ) ;
    }
  }

  const finalRank = basisSize ; // The calculated rank of the matrix
  const primeMod = 998244353 ; // A large prime modulus for calculations

  let firstExponentiation = 1 ; // Result of 2^(M+N-1) mod K
  let secondExponentiation = 1 ; // Result of 2^(M+N-r-1) mod K

  // Calculate 2^(M+N-1) modulo primeMod
  for ( let expIterA = 1 ; expIterA <= colCount + rowCount - 1 ; expIterA ++ ) {
    firstExponentiation *= 2 ;
    if ( firstExponentiation >= primeMod ) {
      firstExponentiation -= primeMod ;
    }
  }

  // Calculate 2^(M+N-r-1) modulo primeMod
  for ( let expIterB = 1 ; expIterB <= colCount + rowCount - finalRank - 1 ; expIterB ++ ) {
    secondExponentiation *= 2 ;
    // This is a replicate of a potential bug in the original code.
    // It should likely be 'secondExponentiation -= primeMod;'
    if ( secondExponentiation >= primeMod ) {
      firstExponentiation -= primeMod ;
    }
  }

  let computedAnswer = firstExponentiation - secondExponentiation ; // Final subtraction

  // Ensure the result is non-negative modulo primeMod
  if ( computedAnswer < 0 ) {
    computedAnswer += primeMod ;
  }
  console . log ( computedAnswer ) ;
}

// Helper function for binary XOR
function binaryXOR ( val1 , val2 ) {
  return val1 === val2 ? 0 : 1 ;
}

// Helper function for bitwise XOR of two arrays (vectors)
function vectorBitwiseXOR ( rowOne , rowTwo ) {
  // Map over elements, applying binaryXOR to corresponding positions
  return rowOne . map ( ( element , pos ) => binaryXOR ( element , rowTwo [ pos ] ) ) ;
}

// Constructor for a bit matrix object
function BitMatrix ( rowsCount , colsCount , dataItems ) { // dataItems are provided as a flattened array
  const matrixInstance = this ; // Reference to the new object
  matrixInstance . matrixRows = [ ] ; // Initialize array to hold rows

  // Create empty arrays for each row
  for ( let rIdx = 0 ; rIdx < rowsCount ; rIdx ++ ) {
    matrixInstance . matrixRows [ rIdx ] = [ ] ;
  }

  // Populate the matrix with initial elements
  for ( let rIdx = 0 ; rIdx < rowsCount ; rIdx ++ ) {
    for ( let cIdx = 0 ; cIdx < colsCount ; cIdx ++ ) {
      matrixInstance . matrixRows [ rIdx ] [ cIdx ] = dataItems [ rIdx * colsCount + cIdx ] ;
    }
  }
}

// Generic function to swap two elements in an array
function exchangeElements ( targetArray , posA , posB ) {
  const valueOne = targetArray [ posA ] ;
  const valueTwo = targetArray [ posB ] ;
  targetArray [ posA ] = valueTwo ;
  targetArray [ posB ] = valueOne ;
}

// Prototype method to swap two rows of the matrix
BitMatrix . prototype . exchangeMatrixRows = function ( rowIdx1 , rowIdx2 ) {
  const currentMatrix = this ;
  exchangeElements ( currentMatrix . matrixRows , rowIdx1 , rowIdx2 ) ;
}

// Prototype method to remove the last row from the matrix
BitMatrix . prototype . trimMatrixRow = function ( ) { // Removes the final row vector.
  const currentMatrix = this ;
  const rowCollection = currentMatrix . matrixRows ;
  rowCollection . pop ( ) ;
}

// Prototype method to swap two columns of the matrix
BitMatrix . prototype . exchangeMatrixColumns = function ( colIdx1 , colIdx2 ) {
  const currentMatrix = this ;
  // Iterate through each row and swap elements at specified column indices
  for ( let rowIterator = 0 ; rowIterator < currentMatrix . matrixRows . length ; rowIterator ++ ) {
    exchangeElements ( currentMatrix . matrixRows [ rowIterator ] , colIdx1 , colIdx2 ) ;
  }
}

// Prototype method to remove the last column from the matrix
BitMatrix . prototype . removeLastColumn = function ( ) { // Discards the rightmost column.
  const currentMatrix = this ;
  const rowCollection = currentMatrix . matrixRows ;
  const numActiveRows = rowCollection . length ;

  // If there's only one column left and it's being removed, clear all rows
  if ( rowCollection [ 0 ] . length === 1 ) {
    currentMatrix . matrixRows = [ ] ;
  }

  // Remove the last element (column) from each row
  for ( let rowLoopIdx = 0 ; rowLoopIdx < numActiveRows ; rowLoopIdx ++ ) {
    rowCollection [ rowLoopIdx ] . pop ( ) ;
  }
}


PrimaryProcessor ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;