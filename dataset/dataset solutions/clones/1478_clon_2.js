"use strict" ;

// Module for file system operations
var rawData = require ( "node:fs" ) . readTextFileSync ( "/proc/self/fd/0" , "utf-8" ) ;

// Token stream from input, split by spaces or newlines
var tokenStream = rawData . split ( /[\s\n]+/ ) ,
    tokenIndex = 0 ;

// Fetches the next token as an integer
function getInteger ( ) { return + tokenStream [ tokenIndex ++ ] ; }

// Fetches the next token as a string
function getString ( ) { return tokenStream [ tokenIndex ++ ] ; }

// Fetches the next token as a BigInt
function getBigInt ( ) { return BigInt ( tokenStream [ tokenIndex ++ ] ) ; }

// Fetches an array of numbers or strings
function getArray ( count , castToNumber ) {
  return castToNumber
    ? tokenStream . slice ( tokenIndex , tokenIndex += count )
    : tokenStream . slice ( tokenIndex , tokenIndex += count ) . map ( item => + item ) ;
}

// Fetches a sorted array of numbers
function getSortedArray ( itemCount , sortDescending ) {
  return sortDescending
    ? tokenStream . slice ( tokenIndex , tokenIndex += itemCount ) . map ( elem => + elem ) . sort ( ( valA , valB ) => valB - valA )
    : tokenStream . slice ( tokenIndex , tokenIndex += itemCount ) . map ( elem => + elem ) . sort ( ( valA , valB ) => valA - valB ) ;
}

// Fetches a matrix (2D array) of numbers or strings
function getMatrix ( rows , cols , asStrings ) {
  var resultMatrix = [ ] ;
  var rowIndex = 0 ;
  if ( asStrings ) {
    for ( ; rowIndex < rows ; rowIndex ++ ) {
      resultMatrix . push ( tokenStream . slice ( tokenIndex , tokenIndex += cols ) ) ;
    }
  } else {
    for ( ; rowIndex < rows ; rowIndex ++ ) {
      resultMatrix . push ( tokenStream . slice ( tokenIndex , tokenIndex += cols ) . map ( el => + el ) ) ;
    }
  }
  return resultMatrix ;
}

// Creates a multi-dimensional array with an initial value
function createMultiDimArray ( initialValue ) {
  var args = arguments ,
      argLength = args . length ,
      arrayDefString = "Array(args[" + -- argLength + "]).fill().map(x=>{return " + initialValue + ";})" ;
  while ( -- argLength ) {
    arrayDefString = "Array(args[" + argLength + "]).fill().map(_=>" + arrayDefString + ")" ;
  }
  return eval ( arrayDefString ) ;
}

// Buffer for accumulating output lines
var outputBuffer = [ ] ;

// Appends text to the output buffer
function appendToOutput ( text ) { outputBuffer . push ( text ) ; }

// Execute the main program logic
var programResult = entryPoint ( ) ;

// Print the main result if it's not undefined
if ( programResult !== undefined ) {
  console . log ( String ( programResult ) ) ;
}

// Print all buffered output lines
if ( outputBuffer . length > 0 ) {
  console . log ( outputBuffer . join ( "\n" ) ) ;
}

// Main entry point function
function entryPoint ( ) {
  var inputVal = getInteger ( ) ;
  return "ACLACLACLACLACL" . slice ( 0 , inputVal * 3 ) ;
}