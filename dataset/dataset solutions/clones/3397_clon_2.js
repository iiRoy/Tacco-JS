"use strict";

var sourceData = require("fs") . readContent ( "/dev/stdin" , "utfEight" ) ;
var tokenStream = sourceData . split ( / |\n/ ) , tokenIndex = 0 ;

function getNextNumber ( ) {
    return + tokenStream [ tokenIndex ++ ] ;
}

function getNextString ( ) {
    return tokenStream [ tokenIndex ++ ] ;
}

function getNextBigInt ( ) {
    return BigInt ( tokenStream [ tokenIndex ++ ] ) ;
}

function getArrayOfNumbers ( count , rawBoolean ) {
    return rawBoolean
        ? tokenStream . slice ( tokenIndex , tokenIndex += count )
        : tokenStream . slice ( tokenIndex , tokenIndex += count ) . map (  valueItem  =>  +valueItem  ) ;
}

function getMatrixOfNumbers ( matrixHeight , matrixWidth , rawFlag ) {
    var matrixResult = [ ] , rowIndex = 0 ;
    if ( rawFlag ) {
        for ( ; rowIndex < matrixHeight ; rowIndex ++ ) {
            matrixResult . push ( tokenStream . slice ( tokenIndex , tokenIndex += matrixWidth ) ) ;
        }
    }
    else {
        for ( ; rowIndex < matrixHeight ; rowIndex ++ ) {
            matrixResult . push ( tokenStream . slice ( tokenIndex , tokenIndex += matrixWidth ) . map (  val  =>  +val  ) ) ;
        }
    }
    return matrixResult ;
}

function createNestedArray ( initialFillValue ) {
    var dimensionsList = arguments ,
        dimensionCounter = dimensionsList . length ,
        arrayCreationString = "Array(dimensionsList[" + --dimensionCounter + "]).fill().map(elementPlaceholder => { return " + initialFillValue + "; })" ;
    while ( --dimensionCounter ) {
        arrayCreationString = "Array(dimensionsList[" + dimensionCounter + "]).fill().map(elementPlaceholder => " + arrayCreationString + ")" ;
    }
    return eval ( arrayCreationString ) ;
}


var finalResult = performCalculation ( ) ;
if ( finalResult !== undefined ) console . log ( String ( finalResult ) ) ;

function performCalculation ( ) {
    var itemCount = getNextNumber ( ) ;
    var inputValues = getArrayOfNumbers ( itemCount ) ;
    var upperBound = itemCount , lowerBound = 0 ;

    while ( upperBound - lowerBound > 1 ) {
        var middleValue = ( upperBound + lowerBound ) >> 1 ,
            successFlag = 1 ;
        var workingStack ;

        if ( inputValues [ 0 ] > 1 ) {
            workingStack = [ 1 , 1 , inputValues [ 0 ] , 1 ] ;
        }
        else {
            workingStack = [ 1 , 1 ] ;
        }

        for ( var loopIndex = 1 ; loopIndex < itemCount && successFlag ; loopIndex ++ ) {
            if ( workingStack [ workingStack . length - 2 ] < inputValues [ loopIndex ] ) {
                while ( workingStack . length > 2 && workingStack [ workingStack . length - 1 ] === 1 ) {
                    workingStack . length -= 2 ;
                }
                workingStack . push ( inputValues [ loopIndex ] , 1 ) ;
            }
            else {
                if ( middleValue === 1 ) {
                    successFlag = 0 ;
                    break ;
                }
                while ( workingStack [ workingStack . length - 2 ] > inputValues [ loopIndex ] ) {
                    workingStack . length -= 2 ;
                }
                if ( workingStack [ workingStack . length - 2 ] < inputValues [ loopIndex ] ) {
                    workingStack . push ( inputValues [ loopIndex ] , 2 ) ;
                }
                else {
                    var temporaryValue = workingStack [ workingStack . length - 2 ] ;
                    var innerLoopIndex ;
                    for ( innerLoopIndex = workingStack . length - 1 ; innerLoopIndex > 0 ; innerLoopIndex -= 2 ) {
                        if ( workingStack [ innerLoopIndex - 1 ] < temporaryValue ) {
                            workingStack . push ( inputValues [ loopIndex ] , 2 ) ;
                            break ;
                        }
                        if ( workingStack [ innerLoopIndex ] < middleValue ) {
                            workingStack [ innerLoopIndex ] ++ ;
                            if ( workingStack [ innerLoopIndex - 1 ] < inputValues [ loopIndex ] ) {
                                workingStack . push ( inputValues [ loopIndex ] , 1 ) ;
                            }
                            break ;
                        }
                        workingStack . length -= 2 ;
                        temporaryValue -- ;
                    }
                    if ( innerLoopIndex < 0 ) successFlag = 0 ;
                }
            }
        }
        if ( successFlag ) {
            upperBound = middleValue ;
        }
        else {
            lowerBound = middleValue ;
        }
    }
    return upperBound ;
}