"use strict" ;
const rawInputContent = require( "node:fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ;
let tokenizedStream = rawInputContent . split( / |\n/ ) ;
let currentTokenIndex = 0 ;

function retrieveNextNumber ( ) {
  return Number( tokenizedStream[ currentTokenIndex ++ ] ) ;
}
function retrieveNextString ( ) {
  return tokenizedStream[ currentTokenIndex ++ ] ;
}
function retrieveNextLargeInteger ( ) {
  return BigInt( tokenizedStream[ currentTokenIndex ++ ] ) ;
}
function retrieveArrayElements ( count , asNumbers ) {
  return asNumbers
    ? tokenizedStream.slice( currentTokenIndex , ( currentTokenIndex += count ) )
    : tokenizedStream.slice( currentTokenIndex , ( currentTokenIndex += count ) ).map( ( elem ) => Number( elem ) ) ;
}
function retrieveMatrixElements ( rowsCount , colsCount , asNumbers ) {
  let matrixResult = [ ] ;
  let currentRow = 0 ;
  if ( asNumbers ) {
    for ( ; currentRow < rowsCount ; currentRow ++ ) {
      matrixResult.push( tokenizedStream.slice( currentTokenIndex , ( currentTokenIndex += colsCount ) ) ) ;
    }
  } else {
    for ( ; currentRow < rowsCount ; currentRow ++ ) {
      matrixResult.push( tokenizedStream.slice( currentTokenIndex , ( currentTokenIndex += colsCount ) ).map( ( elem ) => Number( elem ) ) ) ;
    }
  }
  return matrixResult ;
}
function constructMultiDimensionalArray ( initialVal ) {
  const allArguments = arguments ;
  let numDimensions = allArguments.length ;
  let arrayStructure = "Array(allArguments[" + --numDimensions + "]).fill().map(element => { return " + initialVal + "; })" ;
  while ( --numDimensions ) {
    arrayStructure = "Array(allArguments[" + numDimensions + "]).fill().map(element => " + arrayStructure + ")" ;
  }
  return eval( arrayStructure ) ;
}

const finalExecutionResult = processData ( ) ;
if ( finalExecutionResult !== undefined ) {
  console.log( String( finalExecutionResult ) ) ;
}

function processData ( ) {
  const totalItemsCount = retrieveNextNumber ( ) ;
  const itemValuePairs = retrieveMatrixElements ( totalItemsCount , 2 ) ;
  const bitwiseDepthLimit = 11 ;
  const limitedItemsCount = Math.min( totalItemsCount , 1 << bitwiseDepthLimit ) ;
  const chunkProcessingCache = new Array( limitedItemsCount ) ;
  chunkProcessingCache[ 0 ] = [ itemValuePairs[ 0 ] ] ;

  for ( let currentSegmentIndex = 1 ; currentSegmentIndex < limitedItemsCount ; currentSegmentIndex ++ ) {
    const currentBitDepth = 31 - Math.clz32( currentSegmentIndex + 1 ) ;
    const parentSegmentIndex = ( currentSegmentIndex - 1 ) >> 1 ;
    let workingCombinations = chunkProcessingCache[ parentSegmentIndex ].concat( ) ;
    workingCombinations.push( itemValuePairs[ currentSegmentIndex ] ) ;

    for ( let combinationIter = 0 ; combinationIter < chunkProcessingCache[ parentSegmentIndex ].length ; combinationIter ++ ) {
      if ( chunkProcessingCache[ parentSegmentIndex ][ combinationIter ][ 1 ] + itemValuePairs[ currentSegmentIndex ][ 1 ] <= 100000 ) {
        workingCombinations.push( [
          chunkProcessingCache[ parentSegmentIndex ][ combinationIter ][ 0 ] + itemValuePairs[ currentSegmentIndex ][ 0 ] ,
          chunkProcessingCache[ parentSegmentIndex ][ combinationIter ][ 1 ] + itemValuePairs[ currentSegmentIndex ][ 1 ]
        ] ) ;
      }
    }
    workingCombinations.sort( ( firstPair , secondPair ) => firstPair[ 1 ] - secondPair[ 1 ] ) ;

    chunkProcessingCache[ currentSegmentIndex ] = [ workingCombinations[ 0 ] ] ;
    for ( let distinctIter = 1 ; distinctIter < workingCombinations.length ; distinctIter ++ ) {
      if ( workingCombinations[ distinctIter ][ 0 ] > chunkProcessingCache[ currentSegmentIndex ][ chunkProcessingCache[ currentSegmentIndex ].length - 1 ][ 0 ] ) {
        chunkProcessingCache[ currentSegmentIndex ].push( workingCombinations[ distinctIter ] ) ;
      }
    }
  }

  const numberOfQueries = retrieveNextNumber ( ) ;
  const resultAccumulator = new Array( numberOfQueries ) ;

  for ( let queryIteration = 0 ; queryIteration < numberOfQueries ; queryIteration ++ ) {
    let queryIndex = retrieveNextNumber ( ) ;
    const queryBudget = retrieveNextNumber ( ) ;
    const queryBitDepth = 31 - Math.clz32( queryIndex ) ;
    let maxAchievedValue = 0 ;
    queryIndex -- ;

    if ( queryBitDepth < bitwiseDepthLimit ) {
      for ( let cachedEntryIdx = 0 ; cachedEntryIdx < chunkProcessingCache[ queryIndex ].length ; cachedEntryIdx ++ ) {
        if ( maxAchievedValue < chunkProcessingCache[ queryIndex ][ cachedEntryIdx ][ 0 ] && chunkProcessingCache[ queryIndex ][ cachedEntryIdx ][ 1 ] <= queryBudget ) {
          maxAchievedValue = chunkProcessingCache[ queryIndex ][ cachedEntryIdx ][ 0 ] ;
        }
      }
      resultAccumulator[ queryIteration ] = maxAchievedValue ;
    } else {
      let temporaryWorkingSet = [ itemValuePairs[ queryIndex ] ] ;
      queryIndex = ( queryIndex - 1 ) >> 1 ;

      for ( let currentRecursiveDepth = queryBitDepth ; currentRecursiveDepth >= bitwiseDepthLimit ; currentRecursiveDepth -- ) {
        const currentSetLength = temporaryWorkingSet.length ;
        temporaryWorkingSet.push( itemValuePairs[ queryIndex ] ) ;
        for ( let tempSetIter = 0 ; tempSetIter < currentSetLength ; tempSetIter ++ ) {
          if ( temporaryWorkingSet[ tempSetIter ][ 1 ] + itemValuePairs[ queryIndex ][ 1 ] <= 100000 ) {
            temporaryWorkingSet.push( [
              temporaryWorkingSet[ tempSetIter ][ 0 ] + itemValuePairs[ queryIndex ][ 0 ] ,
              temporaryWorkingSet[ tempSetIter ][ 1 ] + itemValuePairs[ queryIndex ][ 1 ]
            ] ) ;
          }
        }
        queryIndex = ( queryIndex - 1 ) >> 1 ;
      }
      temporaryWorkingSet.sort( ( elementA , elementB ) => elementA[ 1 ] - elementB[ 1 ] ) ;

      let rightPointer = temporaryWorkingSet.length ;
      for ( let cleanUpIter = 1 ; cleanUpIter < rightPointer ; cleanUpIter ++ ) {
        if ( temporaryWorkingSet[ cleanUpIter ][ 0 ] < temporaryWorkingSet[ cleanUpIter - 1 ][ 0 ] ) {
          temporaryWorkingSet[ cleanUpIter ][ 0 ] = temporaryWorkingSet[ cleanUpIter - 1 ][ 0 ] ;
          temporaryWorkingSet[ cleanUpIter ][ 1 ] = 1000000 ;
        }
      }
      rightPointer -- ;

      for ( let finalCombineIter = 0 ; finalCombineIter < chunkProcessingCache[ queryIndex ].length ; finalCombineIter ++ ) {
        if ( chunkProcessingCache[ queryIndex ][ finalCombineIter ][ 1 ] > 100000 ) {
          continue ;
        }
        while ( rightPointer >= 0 && temporaryWorkingSet[ rightPointer ][ 1 ] + chunkProcessingCache[ queryIndex ][ finalCombineIter ][ 1 ] > queryBudget ) {
          rightPointer -- ;
        }
        if ( rightPointer < 0 ) {
          break ;
        }
        if ( maxAchievedValue < temporaryWorkingSet[ rightPointer ][ 0 ] + chunkProcessingCache[ queryIndex ][ finalCombineIter ][ 0 ] ) {
          maxAchievedValue = temporaryWorkingSet[ rightPointer ][ 0 ] + chunkProcessingCache[ queryIndex ][ finalCombineIter ][ 0 ] ;
        }
      }
      resultAccumulator[ queryIteration ] = maxAchievedValue ;
    }
  }
  return resultAccumulator.join( "\n" ) ;
}