"use strict" ;

function _chopArrayIntoPieces ( sourceArray , indexLimit ) {
  return _checkArrayValidity ( sourceArray ) || _iterateAndLimit ( sourceArray , indexLimit ) || _noMoreIterations () ;
}

function _noMoreIterations ( ) {
  throw new TypeError( "Unable to deconstruct non-iterable instance" ) ;
}

function _iterateAndLimit ( inputArr , limitVal ) {
  let tempArr = [ ] ;
  let notDone = true ;
  let hasError = false ;
  let thrownError = undefined ;
  try {
    for (
      let iterator = inputArr[ Symbol.iterator ] ( ) , iterStep ;
      ! ( notDone = ( iterStep = iterator.next ( ) ).done ) ;
      notDone = true
    ) {
      tempArr.push ( iterStep.value ) ;
      if ( limitVal && tempArr.length === limitVal ) break ;
    }
  } catch ( errVal ) {
    hasError = true ;
    thrownError = errVal ;
  } finally {
    try {
      if ( ! notDone && iterator[ "return" ] != null ) iterator[ "return" ] ( ) ;
    } finally {
      if ( hasError ) throw thrownError ;
    }
  }
  return tempArr ;
}

function _checkArrayValidity ( candidateArray ) {
  if ( Array.isArray ( candidateArray ) ) return candidateArray ;
}

function _verifyClassCreation ( instanceObj , ConstructorFn ) {
  if ( ! ( instanceObj instanceof ConstructorFn ) ) {
    throw new TypeError ( "Cannot invoke a class without 'new'" ) ;
  }
}

function _setObjectProperties ( targetObj , propertyDefinitions ) {
  for ( let propIdx = 0 ; propIdx < propertyDefinitions.length ; propIdx++ ) {
    let propDescriptor = propertyDefinitions[ propIdx ] ;
    propDescriptor.enumerable = propDescriptor.enumerable || false ;
    propDescriptor.configurable = true ;
    if ( "value" in propDescriptor ) propDescriptor.writable = true ;
    Object.defineProperty ( targetObj , propDescriptor.key , propDescriptor ) ;
  }
}

function _assembleClass ( MainConstructor , instanceMethods , staticMethods ) {
  if ( instanceMethods ) _setObjectProperties ( MainConstructor.prototype , instanceMethods ) ;
  if ( staticMethods ) _setObjectProperties ( MainConstructor , staticMethods ) ;
  return MainConstructor ;
}

( function ( ) {
  // A Binary Indexed Tree (Fenwick Tree) implementation.
  const FenwickTree =
    /* PURE_ANNOTATION */
    ( function ( ) {
      function FenwickTree ( sizeLimit ) {
        _verifyClassCreation ( this , FenwickTree ) ;

        this.maxIndex = sizeLimit ;
        this.values = new Array ( sizeLimit + 1 ).fill ( 0 ) ;
      }

      _assembleClass ( FenwickTree , [ {
        key: "updateValue" ,
        value: function updateValue ( indexPos , deltaValue ) {
          for ( let currentIdx = indexPos ; currentIdx <= this.maxIndex ; currentIdx += currentIdx & - currentIdx ) {
            this.values[ currentIdx ] += deltaValue ;
          }
        }
      } , {
        key: "querySum" ,
        value: function ( indexPos ) {
          let totalAmount = 0 ;

          for ( let currentIdx = indexPos ; currentIdx > 0 ; currentIdx -= currentIdx & - currentIdx ) {
            totalAmount += this.values[ currentIdx ] ;
          }

          return totalAmount ;
        }
      } ] ) ;

      return FenwickTree ;
    } ) ( ) ;

  // A utility to compress coordinate values.
  const CoordinateMapper =
    /* PURE_ANNOTATION */
    ( function ( ) {
      function CoordinateMapper ( inputValues ) {
        _verifyClassCreation ( this , CoordinateMapper ) ;

        inputValues.sort ( function ( valA , valB ) {
          return valA - valB ;
        } ) ;
        let inputLength = inputValues.length ;
        this.minimumValue = inputValues[ 0 ] ;
        this.maximumValue = inputValues[ inputLength - 1 ] ;
        let mappedToOriginal = new Array ( inputLength ) ;
        let originalToMapped = new Map ( ) ;
        let uniqueCount = 0 ;
        let lastProcessed = null ;

        for ( let idx = 0 ; idx < inputLength ; idx++ ) {
          let currentVal = inputValues[ idx ] ;
          if ( lastProcessed !== currentVal ) uniqueCount++ ;
          mappedToOriginal[ idx ] = currentVal ;
          originalToMapped.set ( currentVal , idx ) ;
          lastProcessed = currentVal ;
        }

        this.mappedToOriginal = mappedToOriginal ;
        this.originalToMapped = originalToMapped ;
        this.uniqueCount = uniqueCount ;
      }

      _assembleClass ( CoordinateMapper , [ {
        key: "getOriginal" ,
        value: function getOriginal ( mappedIndex ) {
          return this.mappedToOriginal[ mappedIndex ] ;
        }
      } , {
        key: "getMapped" ,
        value: function getMapped ( originalValue ) {
          return this.originalToMapped.get ( originalValue ) ;
        }
      } ] ) ;

      return CoordinateMapper ;
    } ) ( ) ;

  // Parses a line of text into an array of integers.
  function parseNumbers ( inputLine ) {
    return ( Array.isArray ( inputLine ) ? inputLine : inputLine.split ( /\s+/ ) ).map ( function ( parsedNum ) {
      return parseInt ( parsedNum ) ;
    } ) ;
  }

  // Main execution block, processing input from stdin.
  ( function ( rawData ) {
    let dataLines = rawData.split ( "\n" ) ;

    let parsedFirstLine = parseNumbers ( dataLines[ 0 ] ) ,
        extractedQueryCount = _chopArrayIntoPieces ( parsedFirstLine , 1 ) ,
        totalQueries = extractedQueryCount[ 0 ] ;

    let parsedQueries = dataLines.slice ( 1 , totalQueries + 1 ).map ( function ( queryLine ) {
      let parsedQueryValues = parseNumbers ( queryLine ) ,
          extractedValues = _chopArrayIntoPieces ( parsedQueryValues , 3 ) ,
          queryType = extractedValues[ 0 ] ,
          paramA = extractedValues[ 1 ] ,
          paramB = extractedValues[ 2 ] ;

      return {
        type: queryType ,
        valA: paramA ,
        valB: paramB
      } ;
    } ) ;
    
    // Collect all 'add' operation values for coordinate compression.
    let initialValuesForCompression = parsedQueries.filter ( function ( queryItem ) {
      let typeIdentifier = queryItem.type ;
      return 1 === typeIdentifier ;
    } ).map ( function ( queryItemParam ) {
      let paramValueA = queryItemParam.valA ;
      return paramValueA ;
    } ) ;
    
    let coordMapper = new CoordinateMapper ( initialValuesForCompression ) ;
    let treeStructure = new FenwickTree ( coordMapper.uniqueCount ) ;
    
    let currentMinimumCost = 0 ,
        currentMinIndex = null ;
    
    let loopFinished = true ;
    let hadError = false ;
    let caughtError = undefined ;

    try {
      for (
        let queryIterator = parsedQueries[ Symbol.iterator ] ( ) , iterationStep ;
        ! ( loopFinished = ( iterationStep = queryIterator.next ( ) ).done ) ;
        loopFinished = true
      ) {
        let queryData = iterationStep.value ,
            actionType = queryData.type ,
            operandA = queryData.valA ,
            operandB = queryData.valB ;

        if ( 1 === actionType ) {
          // Handle 'add' operation.
          let previousMinPoint = ( 0 === treeStructure.querySum ( currentMinIndex ) ) ? ( currentMinIndex + 1 ) : currentMinIndex ;
          let mappedAIndex = coordMapper.getMapped ( operandA ) + 1 ;
          treeStructure.updateValue ( 1 , - 1 ) ;
          treeStructure.updateValue ( mappedAIndex , 2 ) ;
          if ( null == currentMinIndex ) {
            currentMinimumCost = operandB ;
          } else {
            currentMinimumCost += Math.abs ( operandA - coordMapper.getOriginal ( previousMinPoint ) ) + operandB ;
          }
          currentMinIndex = locateMinimumPoint ( ) ;
        } else {
          // Handle 'query' operation.
          console.log ( `${ coordMapper.getOriginal ( currentMinIndex ) } ${ currentMinimumCost }` ) ;
        }
      }
    } catch ( errValue ) {
      hadError = true ;
      caughtError = errValue ;
    } finally {
      try {
        if ( ! loopFinished && queryIterator.return != null ) {
          queryIterator.return ( ) ;
        }
      } finally {
        if ( hadError ) {
          throw caughtError ;
        }
      }
    }

    // Finds the point that minimizes the cost.
    function locateMinimumPoint ( ) {
      let lowBound = 1 ,
          highBound = coordMapper.uniqueCount + 1 ;

      for ( ; lowBound < highBound ; ) {
        let midPoint = Math.floor ( ( lowBound + highBound ) / 2 ) ;
        let currentSum = treeStructure.querySum ( midPoint ) ;
        if ( currentSum > 0 ) {
          highBound = midPoint ;
        } else if ( 0 === currentSum ) {
          lowBound = midPoint ;
          break ;
        } else {
          lowBound = midPoint + 1 ;
        }
      }

      return lowBound - 1 ;
    }
  } ) ( require ( "fs" ).readFileSync ( "/dev/stdin" , "utf8" ) ) ;
} ) ( ) ;