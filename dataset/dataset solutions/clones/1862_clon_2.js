"use strict";

const dataStream = require("node:fs") . readFileSync( "/path/to/standard_input" , "utf8" ) ;
let inputTokens = dataStream . split( /\s+/ ) ;
let tokenPosition = 0;

function fetchNextNumeric ( ) {
  return + inputTokens[ tokenPosition++ ] ;
}

function fetchNextText ( ) {
  return inputTokens[ tokenPosition++ ] ;
}

function fetchNextLargeInt ( ) {
  return BigInt( inputTokens[ tokenPosition++ ] ) ;
}

function retrieveNumericSlice ( sliceSize, conversionFunc ) {
  return conversionFunc
    ? inputTokens.slice( tokenPosition, tokenPosition += sliceSize )
    : inputTokens.slice( tokenPosition, tokenPosition += sliceSize ).map( val => +val ) ;
}

function buildMatrix ( matrixRows, matrixCols, rawMode ) {
  let matrixResult = [ ] ;
  let currentRowIndex = 0 ;
  if ( rawMode )
    for ( ; currentRowIndex < matrixRows ; currentRowIndex++ )
      matrixResult.push( inputTokens.slice( tokenPosition, tokenPosition += matrixCols ) ) ;
  else
    for ( ; currentRowIndex < matrixRows ; currentRowIndex++ )
      matrixResult.push( inputTokens.slice( tokenPosition, tokenPosition += matrixCols ).map( item => +item ) ) ;
  return matrixResult ;
}

function constructDynamicArray ( initialElement ) {
  let dimensionsList = arguments,
      dimCount = dimensionsList.length,
      arrayBuilderString = "Array(dimensionsList[" + --dimCount + "]).fill().map( _ => { return " + initialElement + "; } )";
  while ( --dimCount )
    arrayBuilderString = "Array(dimensionsList[" + dimCount + "]).fill().map( _ => " + arrayBuilderString + " )";
  return eval( arrayBuilderString );
}

function computeGreatestCommonDivisor ( firstNum, secondNum ) {
  return secondNum ? computeGreatestCommonDivisor( secondNum, firstNum % secondNum ) : firstNum ;
}

const primeModulo = 1000000007 ;

function performModuloMultiplication ( ) {
  let operands = arguments,
      currentProduct = operands[0] ;
  for ( let operandIndex = operands.length ; --operandIndex ; )
    currentProduct = ( ( currentProduct >> 16 ) * operands[operandIndex] % primeModulo * 65536 + ( currentProduct & 65535 ) * operands[operandIndex] ) % primeModulo ;
  return currentProduct ;
}

function calculateModuloPower ( baseValue, powerExponent ) {
  let powerResult = 1 ;
  for ( ; powerExponent ; baseValue = performModuloMultiplication( baseValue, baseValue ), powerExponent >>= 1 )
    if ( powerExponent & 1 )
      powerResult = performModuloMultiplication( baseValue, powerResult ) ;
  return powerResult ;
}

function ensurePositiveModulo ( valueToNormalize ) {
  return ( valueToNormalize % primeModulo + primeModulo ) % primeModulo ;
}

let finalOutput = processAndSolve ( ) ;
if ( finalOutput !== undefined )
  console.log( finalOutput ) ;

function processAndSolve ( ) {
  let dataCount = fetchNextNumeric ( ) ;
  let zeroACount = 0 ,
      zeroBCount = 0 ,
      bothZerosCount = 0 ;
  let coordinateMap = { } ,
      uniqueCoordinateList = [ ] ;

  for ( let loopCounter = 0 ; loopCounter < dataCount ; loopCounter++ ) {
    let currentX = fetchNextLargeInt ( ) ,
        currentY = fetchNextLargeInt ( ) ;

    if ( currentX === BigInt(0) && currentY === BigInt(0) ) {
      bothZerosCount++ ;
      continue ;
    }
    if ( currentX === BigInt(0) ) {
      zeroACount++ ;
      continue ;
    }
    if ( currentY === BigInt(0) ) {
      zeroBCount++ ;
      continue ;
    }

    let greatestDivisor = computeGreatestCommonDivisor( currentX, currentY ) ;
    currentX /= greatestDivisor ;
    currentY /= greatestDivisor ;

    if ( currentX < BigInt(0) ) {
      currentX = -currentX ;
      currentY = -currentY ;
    }

    if ( coordinateMap[currentX] ) {
      if ( coordinateMap[currentX][currentY] ) {
        coordinateMap[currentX][currentY] *= 2 ;
        if ( coordinateMap[currentX][currentY] >= primeModulo )
          coordinateMap[currentX][currentY] -= primeModulo ;
      }
      else {
        coordinateMap[currentX][currentY] = 2 ;
        uniqueCoordinateList.push( currentX, currentY ) ;
      }
    } else {
      coordinateMap[currentX] = { } ;
      coordinateMap[currentX][currentY] = 2 ;
      uniqueCoordinateList.push( currentX, currentY ) ;
    }
  }

  let totalAnswer = calculateModuloPower( 2, zeroACount ) + calculateModuloPower( 2, zeroBCount ) - 1 ;

  for ( let listIndex = 0 ; listIndex < uniqueCoordinateList.length ; listIndex += 2 ) {
    let mappedX = uniqueCoordinateList[listIndex] ,
        mappedY = uniqueCoordinateList[listIndex+1] ;
    let temporaryValue = 0 ;

    if ( mappedY < BigInt(0) ) {
      if ( coordinateMap[-mappedY] && coordinateMap[-mappedY][mappedX] )
        continue ;
    } else {
      if ( coordinateMap[mappedY] && coordinateMap[mappedY][-mappedX] )
        temporaryValue = coordinateMap[mappedY][-mappedX] - 1 ;
    }
    temporaryValue += coordinateMap[mappedX][mappedY] ;
    totalAnswer = performModuloMultiplication( totalAnswer, primeModulo <= temporaryValue ? temporaryValue - primeModulo : temporaryValue ) ;
  }
  return ensurePositiveModulo( totalAnswer - 1 + bothZerosCount ) ;
}