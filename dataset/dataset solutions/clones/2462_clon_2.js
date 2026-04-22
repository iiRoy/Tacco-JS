"use strict";
const StreamHandler = ( function () {
  function makeReader( rawData ) {
    return new DataReader( rawData ) ;
  }
  function DataReader( rawData ) {
    this.allLines = rawData.trim() .split( "\n" ) ;
    this.currentPos = 0 ;
  }
  DataReader.prototype.getOne = function ( asText ) {
    var sourceLines = this.allLines,
        currentIdx = this.currentPos,
        extractedVal ;
    if ( typeof sourceLines[ currentIdx ] === "string" ) {
      sourceLines[ currentIdx ] = sourceLines[ currentIdx ] .split( " " ) .reverse() ;
    }
    extractedVal = sourceLines[ currentIdx ] .pop() ;
    if ( !sourceLines[ currentIdx ] .length ) {
      this.currentPos++ ;
    }
    return asText ? extractedVal : +extractedVal ;
  } ;
  DataReader.prototype.getLine = function ( asText ) {
    var lineParts = this.allLines[ this.currentPos++ ] .split( " " ) ;
    return asText ? lineParts : lineParts .map( ( segment ) => +segment ) ;
  } ;
  DataReader.prototype.getGrid = function ( countRows, asText ) {
    var gridData = this.allLines .slice( this.currentPos, this.currentPos += countRows )
                       .map( ( lineStr ) => lineStr .split( " " ) ) ;
    return asText ? gridData : gridData .map( ( rowArr ) => rowArr .map( ( val ) => +val ) ) ;
  } ;
  DataReader.prototype.getMany = function ( countRows, asText ) {
    var lineData = this.allLines .slice( this.currentPos, this.currentPos += countRows ) ;
    return asText ? lineData : lineData .map( ( singleVal ) => +singleVal ) ;
  } ;
  return makeReader ;
} )() ;
const inputReader = StreamHandler( require( "fs" ) .readFileSync( "/dev/stdin", "utf8" ) ) ;

function createMultiDimArray( initialValue ) {
  let dims = arguments ;
  let dimCount = dims.length ;
  let arrayCreationString = `Array(dims[${--dimCount}]).fill(0).map(_ => { return ${initialValue}; })` ;
  while ( --dimCount ) {
    arrayCreationString = `Array(dims[${dimCount}]).fill(0).map(_ => ${arrayCreationString})` ;
  }
  return eval( arrayCreationString ) ;
}

const PRIME_MODULUS = 998244353 ;
function multiplyMod() {
  let factors = arguments ;
  let product = factors[0] ;
  for ( let idx = factors.length ; --idx ; ) {
    product = ( ( product >> 16 ) * factors[idx] % PRIME_MODULUS * 65536 + ( product & 65535 ) * factors[idx] ) % PRIME_MODULUS ;
  }
  return product ;
}
let factorialAccumulator = 1 ;
let inverseFactorials = [] ;
function precomputeFactorials( limitVal ) {
  if ( limitVal < 8e6 ) {
    for ( let counter = 2 ; counter <= limitVal ; counter++ ) {
      factorialAccumulator = factorialAccumulator * counter % PRIME_MODULUS ;
    }
  } else {
    factorialAccumulator = 833655840 ;
    for ( let counter = 8000001 ; counter <= limitVal ; counter++ ) {
      factorialAccumulator = multiplyMod( factorialAccumulator, counter ) ;
    }
  }
  inverseFactorials.length = limitVal + 1 ;
  inverseFactorials[0] = inverseFactorials[1] = 1 ;
  inverseFactorials[limitVal] = modularInverse( factorialAccumulator ) ;
  for ( let counter = limitVal ; 2 < counter ; ) {
    inverseFactorials[ counter - 1 ] = multiplyMod( inverseFactorials[ counter ], counter-- ) ;
  }
}
function modularInverse( valueA ) {
  let valueB = PRIME_MODULUS ;
  let coeffU = 1,
      coeffV = 0,
      tempVar ;
  while ( valueB ) {
    tempVar = valueA / valueB | 0 ;
    valueA -= tempVar * valueB ;
    coeffU -= tempVar * coeffV ;
    tempVar = valueA ;
    valueA = valueB ;
    valueB = tempVar ;
    tempVar = coeffU ;
    coeffU = coeffV ;
    coeffV = tempVar ;
  }
  coeffU %= PRIME_MODULUS ;
  return coeffU < 0 ? coeffU + PRIME_MODULUS : coeffU ;
}
function powerMod( baseVal, exponent ) {
  let currentResult = 1 ;
  while ( exponent ) {
    if ( exponent & 1 ) {
      currentResult = multiplyMod( baseVal, currentResult ) ;
    }
    baseVal = multiplyMod( baseVal, baseVal ) ;
    exponent >>= 1 ;
  }
  return currentResult ;
}
function combinationsMod( totalItems, chooseCount ) {
  return multiplyMod( factorialAccumulator, inverseFactorials[ chooseCount ], inverseFactorials[ totalItems - chooseCount ] ) ;
}

console.log( calculateSolution() ) ;
function calculateSolution() {
  let inputN = inputReader.getOne() ;
  let finalAnswer = powerMod( 3, inputN ) ;
  precomputeFactorials( inputN ) ;
  let powerOfTwo = 1 ;
  for ( let loopCounter = inputN, halfN = inputN >> 1 ; halfN < loopCounter ; loopCounter-- ) {
    powerOfTwo += powerOfTwo ;
    if ( PRIME_MODULUS <= powerOfTwo ) {
      powerOfTwo -= PRIME_MODULUS ;
    }
    finalAnswer -= multiplyMod( combinationsMod( inputN, loopCounter ), powerOfTwo ) ;
  }
  finalAnswer %= PRIME_MODULUS ;
  return finalAnswer < 0 ? finalAnswer + PRIME_MODULUS : finalAnswer ;
}