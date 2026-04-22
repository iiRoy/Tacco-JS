"use strict";
var rawData = require("fs") . readFileSync( "/dev/stdin" , "utf8" );

var tokenStream = rawData . split( / |\n/ ) , tokenIndex = 0 ;

function getNextNumber ( ) { return + tokenStream [ tokenIndex ++ ] ; }

function getNextString ( ) { return tokenStream [ tokenIndex ++ ] ; }

function getNextLargeInteger ( ) { return BigInt( tokenStream [ tokenIndex ++ ] ) ; }

function retrieveSequence ( sequenceLength , isPureString ) {
    return isPureString
        ? tokenStream . slice( tokenIndex , ( tokenIndex += sequenceLength ) )
        : tokenStream . slice( tokenIndex , ( tokenIndex += sequenceLength ) ) . map( elementItem => + elementItem ) ;
}

function generateMatrix ( matrixHeight , matrixWidth , isStringType ) {
    var matrixRows = [ ] , rowIterator = 0 ;
    if ( isStringType ) {
        for ( ; rowIterator < matrixHeight ; rowIterator ++ ) {
            matrixRows . push( tokenStream . slice( tokenIndex , ( tokenIndex += matrixWidth ) ) ) ;
        }
    } else {
        for ( ; rowIterator < matrixHeight ; rowIterator ++ ) {
            matrixRows . push( tokenStream . slice( tokenIndex , ( tokenIndex += matrixWidth ) ) . map( itemValue => + itemValue ) ) ;
        }
    }
    return matrixRows ;
}

function createNestedArray ( initialContent ) {
    var argsList = arguments , argCount = argsList . length , arrayDefinition = "Array(argsList[" + --argCount + "]).fill().map(placeholderItem=>{return " + initialContent + ";})" ;
    while ( --argCount ) {
        arrayDefinition = "Array(argsList[" + argCount + "]).fill().map(placeholderItem=>" + arrayDefinition + ")" ;
    }
    return eval( arrayDefinition ) ;
}

var programResult = processExecution ( ) ;
if ( programResult !== undefined ) {
    console . log ( programResult ) ;
}

function processExecution ( ) {
    var elementCount = getNextNumber ( ) ;
    var numericData = retrieveSequence ( elementCount + 1 ) ;

    if ( elementCount === 0 ) {
        if ( numericData [ 0 ] === 1 ) { return 1 ; }
        return -1 ;
    }

    if ( numericData [ 0 ] ) { return -1 ; }

    var maximumBound = 1e8 * elementCount ;
    var firstDynamicArray = Array ( elementCount + 1 ) ;
    firstDynamicArray [ 0 ] = 1 ;

    for ( var currentIteration = 1 ; currentIteration <= elementCount ; currentIteration ++ ) {
        firstDynamicArray [ currentIteration ] = Math . min ( firstDynamicArray [ currentIteration - 1 ] * 2 , maximumBound ) ;
        firstDynamicArray [ currentIteration ] -= numericData [ currentIteration ] ;
        if ( firstDynamicArray [ currentIteration ] < 0 ) { return -1 ; }
    }

    var secondDynamicArray = Array ( elementCount + 1 ) ;
    secondDynamicArray [ elementCount ] = 0 ;

    for ( var reverseIteration = elementCount - 1 ; reverseIteration >= 0 ; reverseIteration -- ) {
        secondDynamicArray [ reverseIteration ] = secondDynamicArray [ reverseIteration + 1 ] + numericData [ reverseIteration + 1 ] ;
    }

    var totalSum = 0n ;
    for ( var finalLoopIndex = 0 ; finalLoopIndex <= elementCount ; finalLoopIndex ++ ) {
        totalSum += BigInt( Math . min ( firstDynamicArray [ finalLoopIndex ] , secondDynamicArray [ finalLoopIndex ] ) + numericData [ finalLoopIndex ] ) ;
    }

    return totalSum . toString ( ) ;
}