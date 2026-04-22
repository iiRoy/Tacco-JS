"use strict" ;

const   dataStream = require ( "fs" ) . readFileSync ( "/proc/self/fd/0" , "utf_8" ) ;
let     tokenArray = dataStream.split ( / |\n/ ) ;
let     tokenIndex = 0 ;

function getNextNumber ( ) {
  return +tokenArray [ tokenIndex++ ] ;
}

function getNextString ( ) {
  return tokenArray [ tokenIndex++ ] ;
}

function getNextBigInt ( ) {
  return BigInt ( tokenArray [ tokenIndex++ ] ) ;
}

function getNumbersSlice ( count , doMap ) {
  if ( doMap ) {
    return tokenArray.slice ( tokenIndex , tokenIndex += count ) ;
  }
  else {
    return tokenArray.slice ( tokenIndex , tokenIndex += count ) . map ( val => +val ) ;
  }
}

function getMatrix ( height , width , isStringMatrix ) {
  let resultMatrix = [ ] ;
  let currentRow = 0 ;
  if ( isStringMatrix ) {
    for ( ; currentRow < height ; currentRow++ ) {
      resultMatrix.push ( tokenArray.slice ( tokenIndex , tokenIndex += width ) ) ;
    }
  }
  else {
    for ( ; currentRow < height ; currentRow++ ) {
      resultMatrix.push ( tokenArray.slice ( tokenIndex , tokenIndex += width ) . map ( item => +item ) ) ;
    }
  }
  return resultMatrix ;
}

function createMultiDimArray ( initialValue ) {
  const   argsList = arguments ;
  let     argsLength = argsList.length ;
  let     arrayCreationString = "Array(argsList[" + --argsLength + "]).fill().map(elem => { return " + initialValue + "; })" ;
  while ( --argsLength ) {
    arrayCreationString = "Array(argsList[" + argsLength + "]).fill().map(elem => " + arrayCreationString + ")" ;
  }
  return eval ( arrayCreationString ) ;
}


class MinHeap {

  constructor ( ) {
    this.heapElements = [ ] ;
  }

  insertElement ( itemValue , itemPayload ) {
    const   heapArr = this.heapElements ;
    let     currentIndex = heapArr.length ;
    let     parentIndex ;

    while ( currentIndex > 0 ) {
      parentIndex = ( currentIndex - 1 ) >> 1 ;
      if ( heapArr [ parentIndex ] [ 0 ] <= itemValue ) {
        break ;
      }
      heapArr [ currentIndex ] = heapArr [ parentIndex ] ;
      currentIndex = parentIndex ;
    }
    heapArr [ currentIndex ] = [ itemValue , itemPayload ] ;
  }

  extractMin ( ) {
    const   heapArr = this.heapElements ;
    const   minElement = heapArr [ 0 ] ;
    const   lastElement = heapArr.pop ( ) ;
    const   halfLength = heapArr.length >> 1 ;

    let     parentIdx = 0 ;
    let     leftChildIdx ;

    while ( parentIdx < halfLength ) {
      leftChildIdx = ( parentIdx << 1 ) + 1 ;
      if ( heapArr [ leftChildIdx + 1 ] && heapArr [ leftChildIdx + 1 ] [ 0 ] < heapArr [ leftChildIdx ] [ 0 ] ) {
        leftChildIdx++ ;
      }
      if ( lastElement [ 0 ] <= heapArr [ leftChildIdx ] [ 0 ] ) {
        break ;
      }
      heapArr [ parentIdx ] = heapArr [ leftChildIdx ] ;
      parentIdx = leftChildIdx ;
    }
    if ( heapArr.length > 0 ) {
      heapArr [ parentIdx ] = lastElement ;
    }
    return minElement ;
  }

  get getSize ( ) {
    return this.heapElements.length ;
  }

  get peekMin ( ) {
    return this.heapElements [ 0 ] ;
  }
}

const programResult = executeProgram ( ) ;
if ( programResult !== undefined ) {
  console.info ( programResult ) ;
}

function executeProgram ( ) {
  const numIterations = getNextNumber ( ) ;
  const primeFactors = [ BigInt ( 2 ) , BigInt ( 3 ) , BigInt ( 5 ) ] ;

  for ( let loopCounter = 0 ; loopCounter < numIterations ; loopCounter++ ) {
    let targetValue = getNextBigInt ( ) ;
    const costArray = [ getNextBigInt ( ) , getNextBigInt ( ) , getNextBigInt ( ) ] ;
    const distanceLookup = [ BigInt ( 0 ) , getNextBigInt ( ) ] ;

    distanceLookup [ 2 ] = distanceLookup [ 1 ] < costArray [ 0 ] ? distanceLookup [ 1 ] + distanceLookup [ 1 ] : distanceLookup [ 1 ] + costArray [ 0 ] ;
    distanceLookup [ 3 ] = distanceLookup [ 2 ] < costArray [ 1 ] ? distanceLookup [ 2 ] + distanceLookup [ 1 ] : distanceLookup [ 1 ] + costArray [ 1 ] ;

    let distOption1 = distanceLookup [ 3 ] + distanceLookup [ 1 ] ;
    let distOption2 = distanceLookup [ 2 ] + costArray [ 0 ] ;
    let distOption3 = distanceLookup [ 1 ] + costArray [ 2 ] ;

    if ( distOption3 < distOption2 )
      distOption2 = distOption3 ;
    if ( distOption2 < distOption1 )
      distOption1 = distOption2 ;
    distanceLookup [ 4 ] = distOption1 ;

    const valueHeap = new MinHeap ( ) ;
    valueHeap.insertElement ( BigInt ( 0 ) , targetValue ) ;

    const visitedCosts = new Map ( ) ;
    visitedCosts.set ( targetValue , BigInt ( 0 ) ) ;

    while ( true ) {
      const [ currentCost , currentNum ] = valueHeap.extractMin ( ) ;
      if ( visitedCosts.has ( currentNum ) && visitedCosts.get ( currentNum ) < currentCost ) {
        continue ;
      }
      if ( currentNum === BigInt ( 0 ) ) {
        console.info ( currentCost.toString ( ) ) ;
        break ;
      }
      if ( currentNum < BigInt ( 5 ) ) {
        const totalCostForSmallNum = currentCost + distanceLookup [ Number ( currentNum ) ] ;
        if ( ! visitedCosts.has ( BigInt ( 0 ) ) || visitedCosts.get ( BigInt ( 0 ) ) > totalCostForSmallNum ) {
          visitedCosts.set ( BigInt ( 0 ) , totalCostForSmallNum ) ;
          valueHeap.insertElement ( totalCostForSmallNum , BigInt ( 0 ) ) ;
        }
        continue ;
      }

      for ( let idx = 0 ; idx < 3 ; idx++ ) {
        const divisorFactor = primeFactors [ idx ] ;
        const operationCost = costArray [ idx ] ;

        let nextNum = currentNum / divisorFactor ;
        let calcCost1 = operationCost + distanceLookup [ 1 ] * ( currentNum % divisorFactor ) ;
        let calcCost2 = ( currentNum - nextNum ) * distanceLookup [ 1 ] ;

        if ( calcCost2 < calcCost1 )
          calcCost1 = calcCost2 ;

        if ( ! visitedCosts.has ( nextNum ) || visitedCosts.get ( nextNum ) > calcCost1 + currentCost ) {
          visitedCosts.set ( nextNum , calcCost1 + currentCost ) ;
          valueHeap.insertElement ( calcCost1 + currentCost , nextNum ) ;
        }

        if ( currentNum % divisorFactor !== BigInt ( 0 ) ) {
          nextNum++ ;
          calcCost1 = operationCost + distanceLookup [ 1 ] * ( divisorFactor - currentNum % divisorFactor ) ;
          calcCost2 = ( currentNum - nextNum ) * distanceLookup [ 1 ] ;
          if ( calcCost2 < calcCost1 )
            calcCost2 = calcCost2 ;
          if ( ! visitedCosts.has ( nextNum ) || visitedCosts.get ( nextNum ) > calcCost1 + currentCost ) {
            visitedCosts.set ( nextNum , calcCost1 + currentCost ) ;
            valueHeap.insertElement ( calcCost1 + currentCost , nextNum ) ;
          }
        }
      }
    }
  }
}