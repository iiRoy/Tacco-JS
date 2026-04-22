"use strict"
;
function createMultiDimArray (
  valueFiller
) {
  let argumentList = arguments,
    argumentLength = argumentList.length,
    expressionString = "Array(argumentList[" + --argumentLength + "]).fill(0).map( _ => { return " + valueFiller + ";} )"
  ;
  while ( --argumentLength ) {
    expressionString = "Array(argumentList[" + argumentLength + "]).fill(0).map( _ => " + expressionString + " )"
    ;
  }
  return eval( expressionString )
  ;
}

const lineReader = require( "readline" )
  .createInterface( process.stdin, process.stdout )
;
const asyncProcessor = (
  function* (
  ) {
    const fetchInput = (
    ) => lineReader.once( "line", ( inputLine ) => asyncProcessor.next( inputLine ) )
    ;
    let countElements = yield fetchInput( )
    ;
    countElements = Number( countElements )
    ;
    let permutationArray = [ ]
    ;
    for ( let idx = 1; idx <= countElements; idx++ ) {
      permutationArray[ idx - 1 ] = idx
      ;
    }
    console.log( "?", permutationArray.join( " " ) )
    ;
    let initialResponse = yield fetchInput( )
    ;
    let currentPosition = 1
    ;
    while ( true ) {
      permutationArray[ currentPosition - 1 ] = currentPosition + countElements
      ;
      console.log( "?", permutationArray.join( " " ) )
      ;
      let currentResponse = yield fetchInput( )
      ;
      if ( initialResponse[ 0 ] !== currentResponse[ 0 ] ) {
        break
        ;
      }
      currentPosition++
      ;
    }
    let finalResults = [ ]
    ;
    let secondaryArray = [ ]
    ;
    let visitedIndices = new Set( )
    ;
    for ( let idx = 0; idx < countElements - 1; idx++ ) {
      permutationArray[ idx ] = currentPosition + idx - 1
      ;
      secondaryArray[ idx ] = ( permutationArray[ idx ] + countElements ) % ( 2 * countElements )
      ;
      visitedIndices.add( idx + currentPosition - 1 )
      ;
    }
    for ( let currentVal = 1; currentVal <= 2 * countElements; currentVal++ ) {
      if ( visitedIndices.has( currentVal ) ) {
        secondaryArray[ countElements - 1 ] = currentVal
        ;
        console.log( "?", secondaryArray.join( " " ) )
        ;
        let loopResponse = yield fetchInput( )
        ;
        if ( loopResponse[ 0 ] === "R" ) {
          finalResults[ currentVal - 1 ] = "R"
          ;
        } else {
          finalResults[ currentVal - 1 ] = "B"
          ;
        }
      } else {
        permutationArray[ countElements - 1 ] = currentVal
        ;
        console.log( "?", permutationArray.join( " " ) )
        ;
        let loopResponse = yield fetchInput( )
        ;
        if ( loopResponse[ 0 ] === "R" ) {
          finalResults[ currentVal - 1 ] = "R"
          ;
        } else {
          finalResults[ currentVal - 1 ] = "B"
          ;
        }
      }
    }
    console.log( "!", finalResults.join( "" ) )
    ;
  }
)( )
;
asyncProcessor.next( )
;