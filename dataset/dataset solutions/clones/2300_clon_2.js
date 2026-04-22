"use strict";

var largeNum = function ( noValue ) {
  "use strict";

  var CHUNK_SIZE = 10000000,
      CHUNK_LOG = 7,
      MAX_SAFE_JS_NUM = 9007199254740992,
      MAX_SAFE_NUM_ARRAY = compactToValueArray( MAX_SAFE_JS_NUM ),
      NATURAL_LOG_MAX_SAFE_NUM = Math.log( MAX_SAFE_JS_NUM );

  function NumericalEntity ( inputVal, baseSystem ) {
    if ( typeof inputVal === "undefined" ) {
      return NumericalEntity[ 0 ];
    }
    if ( typeof baseSystem !== "undefined" ) {
      return +baseSystem === 10 ? processInput( inputVal ) : parseValueWithBase( inputVal, baseSystem );
    }
    return processInput( inputVal );
  }

  function LargeNumber ( numericData, isNegativeFlag ) {
    this.numericData = numericData;
    this.isNegativeFlag = isNegativeFlag;
    this.isCompact = false;
  }
  LargeNumber.prototype = Object.create( NumericalEntity.prototype );

  function CompactNumber ( numericData ) {
    this.numericData = numericData;
    this.isNegativeFlag = numericData < 0;
    this.isCompact = true;
  }
  CompactNumber.prototype = Object.create( NumericalEntity.prototype );

  function isAccurate ( numToCheck ) {
    return -MAX_SAFE_JS_NUM < numToCheck && numToCheck < MAX_SAFE_JS_NUM;
  }

  function compactToValueArray ( numVal ) {
    if ( numVal < 10000000 ) {
      return [ numVal ];
    }
    if ( numVal < 100000000000000 ) {
      return [ numVal % 10000000, Math.floor( numVal / 10000000 ) ];
    }
    return [ numVal % 10000000, Math.floor( numVal / 10000000 ) % 10000000, Math.floor( numVal / 100000000000000 ) ];
  }

  function valueArrayToCompact ( chunkArray ) {
    removeLeadingZeros( chunkArray );
    var currentLength = chunkArray.length;
    if ( currentLength < 4 && compareAbsoluteValues( chunkArray, MAX_SAFE_NUM_ARRAY ) < 0 ) {
      switch ( currentLength ) {
        case 0:
          return 0;
        case 1:
          return chunkArray[ 0 ];
        case 2:
          return chunkArray[ 0 ] + chunkArray[ 1 ] * CHUNK_SIZE;
        default:
          return chunkArray[ 0 ] + ( chunkArray[ 1 ] + chunkArray[ 2 ] * CHUNK_SIZE ) * CHUNK_SIZE;
      }
    }
    return chunkArray;
  }

  function removeLeadingZeros ( valueArray ) {
    var idx = valueArray.length;
    while ( valueArray[ --idx ] === 0 ) ;
    valueArray.length = idx + 1;
  }

  function makeZeroArray ( arrayLength ) {
    var outputArray = new Array( arrayLength );
    var idx = -1;
    while ( ++idx < arrayLength ) {
      outputArray[ idx ] = 0;
    }
    return outputArray;
  }

  function chopDecimal ( numVal ) {
    if ( numVal > 0 ) {
      return Math.floor( numVal );
    }
    return Math.ceil( numVal );
  }

  function sumArrays ( firstArray, secondArray ) {
    var lenA = firstArray.length,
        lenB = secondArray.length,
        resultArray = new Array( lenA ),
        carryOver = 0,
        baseVal = CHUNK_SIZE,
        currentSum,
        idx;

    for ( idx = 0; idx < lenB; idx++ ) {
      currentSum = firstArray[ idx ] + secondArray[ idx ] + carryOver;
      carryOver = currentSum >= baseVal ? 1 : 0;
      resultArray[ idx ] = currentSum - carryOver * baseVal;
    }
    while ( idx < lenA ) {
      currentSum = firstArray[ idx ] + carryOver;
      carryOver = currentSum === baseVal ? 1 : 0;
      resultArray[ idx++ ] = currentSum - carryOver * baseVal;
    }
    if ( carryOver > 0 ) {
      resultArray.push( carryOver );
    }
    return resultArray;
  }

  function addAnyLengthArrays ( firstArray, secondArray ) {
    if ( firstArray.length >= secondArray.length ) {
      return sumArrays( firstArray, secondArray );
    }
    return sumArrays( secondArray, firstArray );
  }

  function addCompactToValueArray ( valueArray, carryAmount ) {
    var currentLength = valueArray.length,
        resultArray = new Array( currentLength ),
        baseVal = CHUNK_SIZE,
        currentSum,
        idx;

    for ( idx = 0; idx < currentLength; idx++ ) {
      currentSum = valueArray[ idx ] - baseVal + carryAmount;
      carryAmount = Math.floor( currentSum / baseVal );
      resultArray[ idx ] = currentSum - carryAmount * baseVal;
      carryAmount += 1;
    }
    while ( carryAmount > 0 ) {
      resultArray[ idx++ ] = carryAmount % baseVal;
      carryAmount = Math.floor( carryAmount / baseVal );
    }
    return resultArray;
  }

  LargeNumber.prototype.sum = function ( inputVal ) {
    var otherNum = processInput( inputVal );
    if ( this.isNegativeFlag !== otherNum.isNegativeFlag ) {
      return this.difference( otherNum.invertSign( ) );
    }
    var operandA = this.numericData,
        operandB = otherNum.numericData;
    if ( otherNum.isCompact ) {
      return new LargeNumber( addCompactToValueArray( operandA, Math.abs( operandB ) ), this.isNegativeFlag );
    }
    return new LargeNumber( addAnyLengthArrays( operandA, operandB ), this.isNegativeFlag );
  };
  LargeNumber.prototype.addUp = LargeNumber.prototype.sum;

  CompactNumber.prototype.sum = function ( inputVal ) {
    var otherNum = processInput( inputVal );
    var operandA = this.numericData;
    if ( operandA < 0 !== otherNum.isNegativeFlag ) {
      return this.difference( otherNum.invertSign( ) );
    }
    var operandB = otherNum.numericData;
    if ( otherNum.isCompact ) {
      if ( isAccurate( operandA + operandB ) ) {
        return new CompactNumber( operandA + operandB );
      }
      operandB = compactToValueArray( Math.abs( operandB ) );
    }
    return new LargeNumber( addCompactToValueArray( operandB, Math.abs( operandA ) ), operandA < 0 );
  };
  CompactNumber.prototype.addUp = CompactNumber.prototype.sum;

  function subtractArrays ( firstArray, secondArray ) {
    var lenA = firstArray.length,
        lenB = secondArray.length,
        resultArray = new Array( lenA ),
        borrowAmount = 0,
        baseVal = CHUNK_SIZE,
        idx,
        calcDifference;

    for ( idx = 0; idx < lenB; idx++ ) {
      calcDifference = firstArray[ idx ] - borrowAmount - secondArray[ idx ];
      if ( calcDifference < 0 ) {
        calcDifference += baseVal;
        borrowAmount = 1;
      } else {
        borrowAmount = 0;
      }
      resultArray[ idx ] = calcDifference;
    }
    for ( idx = lenB; idx < lenA; idx++ ) {
      calcDifference = firstArray[ idx ] - borrowAmount;
      if ( calcDifference < 0 ) {
        calcDifference += baseVal;
      } else {
        resultArray[ idx++ ] = calcDifference;
        break;
      }
      resultArray[ idx ] = calcDifference;
    }
    for ( ; idx < lenA; idx++ ) {
      resultArray[ idx ] = firstArray[ idx ];
    }
    removeLeadingZeros( resultArray );
    return resultArray;
  }

  function subtractAnyLengthArrays ( firstArray, secondArray, isNegativeFlag ) {
    var numericData;
    if ( compareAbsoluteValues( firstArray, secondArray ) >= 0 ) {
      numericData = subtractArrays( firstArray, secondArray );
    } else {
      numericData = subtractArrays( secondArray, firstArray );
      isNegativeFlag = !isNegativeFlag;
    }
    numericData = valueArrayToCompact( numericData );
    if ( typeof numericData === "number" ) {
      if ( isNegativeFlag ) {
        numericData = -numericData;
      }
      return new CompactNumber( numericData );
    }
    return new LargeNumber( numericData, isNegativeFlag );
  }

  function subtractCompactFromValueArray ( valueArray, subtractorValue, isNegativeFlag ) {
    var currentLength = valueArray.length,
        resultArray = new Array( currentLength ),
        carryAmount = -subtractorValue,
        baseVal = CHUNK_SIZE,
        idx,
        calcDifference;

    for ( idx = 0; idx < currentLength; idx++ ) {
      calcDifference = valueArray[ idx ] + carryAmount;
      carryAmount = Math.floor( calcDifference / baseVal );
      calcDifference %= baseVal;
      resultArray[ idx ] = calcDifference < 0 ? calcDifference + baseVal : calcDifference;
    }
    resultArray = valueArrayToCompact( resultArray );
    if ( typeof resultArray === "number" ) {
      if ( isNegativeFlag ) {
        resultArray = -resultArray;
      }
      return new CompactNumber( resultArray );
    }
    return new LargeNumber( resultArray, isNegativeFlag );
  }

  LargeNumber.prototype.difference = function ( inputVal ) {
    var otherNum = processInput( inputVal );
    if ( this.isNegativeFlag !== otherNum.isNegativeFlag ) {
      return this.sum( otherNum.invertSign( ) );
    }
    var operandA = this.numericData,
        operandB = otherNum.numericData;
    if ( otherNum.isCompact ) {
      return subtractCompactFromValueArray( operandA, Math.abs( operandB ), this.isNegativeFlag );
    }
    return subtractAnyLengthArrays( operandA, operandB, this.isNegativeFlag );
  };
  LargeNumber.prototype.takeAway = LargeNumber.prototype.difference;

  CompactNumber.prototype.difference = function ( inputVal ) {
    var otherNum = processInput( inputVal );
    var operandA = this.numericData;
    if ( operandA < 0 !== otherNum.isNegativeFlag ) {
      return this.sum( otherNum.invertSign( ) );
    }
    var operandB = otherNum.numericData;
    if ( otherNum.isCompact ) {
      return new CompactNumber( operandA - operandB );
    }
    return subtractCompactFromValueArray( operandB, Math.abs( operandA ), operandA >= 0 );
  };
  CompactNumber.prototype.takeAway = CompactNumber.prototype.difference;

  LargeNumber.prototype.invertSign = function ( ) {
    return new LargeNumber( this.numericData, !this.isNegativeFlag );
  };

  CompactNumber.prototype.invertSign = function ( ) {
    var isNegativeFlag = this.isNegativeFlag;
    var compactVal = new CompactNumber( -this.numericData );
    compactVal.isNegativeFlag = !isNegativeFlag;
    return compactVal;
  };

  LargeNumber.prototype.absolute = function ( ) {
    return new LargeNumber( this.numericData, false );
  };

  CompactNumber.prototype.absolute = function ( ) {
    return new CompactNumber( Math.abs( this.numericData ) );
  };

  function longMultiplication ( firstArray, secondArray ) {
    var lenOfA = firstArray.length,
        lenOfB = secondArray.length,
        totalLength = lenOfA + lenOfB,
        resultArray = makeZeroArray( totalLength ),
        baseVal = CHUNK_SIZE,
        partialProduct,
        carryOver,
        idx,
        elemA,
        elemB;

    for ( idx = 0; idx < lenOfA; ++idx ) {
      elemA = firstArray[ idx ];
      for ( var innerIdx = 0; innerIdx < lenOfB; ++innerIdx ) {
        elemB = secondArray[ innerIdx ];
        partialProduct = elemA * elemB + resultArray[ idx + innerIdx ];
        carryOver = Math.floor( partialProduct / baseVal );
        resultArray[ idx + innerIdx ] = partialProduct - carryOver * baseVal;
        resultArray[ idx + innerIdx + 1 ] += carryOver;
      }
    }
    removeLeadingZeros( resultArray );
    return resultArray;
  }

  function smallMultiplication ( valueArray, multiplier ) {
    var currentLength = valueArray.length,
        resultArray = new Array( currentLength ),
        baseVal = CHUNK_SIZE,
        carryOver = 0,
        partialProduct,
        idx;

    for ( idx = 0; idx < currentLength; idx++ ) {
      partialProduct = valueArray[ idx ] * multiplier + carryOver;
      carryOver = Math.floor( partialProduct / baseVal );
      resultArray[ idx ] = partialProduct - carryOver * baseVal;
    }
    while ( carryOver > 0 ) {
      resultArray[ idx++ ] = carryOver % baseVal;
      carryOver = Math.floor( carryOver / baseVal );
    }
    return resultArray;
  }

  function padWithZeros ( valueArray, zeroCount ) {
    var newArray = [];
    while ( zeroCount-- > 0 ) {
      newArray.push( 0 );
    }
    return newArray.concat( valueArray );
  }

  function karatsubaProduct ( factorX, factorY ) {
    var halfLen = Math.max( factorX.length, factorY.length );
    if ( halfLen <= 30 ) {
      return longMultiplication( factorX, factorY );
    }
    halfLen = Math.ceil( halfLen / 2 );

    var bPart = factorX.slice( halfLen ),
        aPart = factorX.slice( 0, halfLen ),
        dPart = factorY.slice( halfLen ),
        cPart = factorY.slice( 0, halfLen );

    var acResult = karatsubaProduct( aPart, cPart ),
        bdResult = karatsubaProduct( bPart, dPart ),
        abcdResult = karatsubaProduct( addAnyLengthArrays( aPart, bPart ), addAnyLengthArrays( cPart, dPart ) );

    var finalProduct = addAnyLengthArrays(
      addAnyLengthArrays( acResult, padWithZeros( subtractArrays( subtractArrays( abcdResult, acResult ), bdResult ), halfLen ) ),
      padWithZeros( bdResult, 2 * halfLen )
    );
    removeLeadingZeros( finalProduct );
    return finalProduct;
  }

  function shouldUseKaratsuba ( len1, len2 ) {
    return -.012 * len1 - .012 * len2 + 15e-6 * len1 * len2 > 0;
  }

  LargeNumber.prototype.product = function ( inputVal ) {
    var otherNum = processInput( inputVal ),
        operandA = this.numericData,
        operandB = otherNum.numericData,
        isResultNegative = this.isNegativeFlag !== otherNum.isNegativeFlag,
        absoluteValue;

    if ( otherNum.isCompact ) {
      if ( operandB === 0 ) {
        return NumericalEntity[ 0 ];
      }
      if ( operandB === 1 ) {
        return this;
      }
      if ( operandB === -1 ) {
        return this.invertSign( );
      }
      absoluteValue = Math.abs( operandB );
      if ( absoluteValue < CHUNK_SIZE ) {
        return new LargeNumber( smallMultiplication( operandA, absoluteValue ), isResultNegative );
      }
      operandB = compactToValueArray( absoluteValue );
    }
    if ( shouldUseKaratsuba( operandA.length, operandB.length ) ) {
      return new LargeNumber( karatsubaProduct( operandA, operandB ), isResultNegative );
    }
    return new LargeNumber( longMultiplication( operandA, operandB ), isResultNegative );
  };
  LargeNumber.prototype.multiplyBy = LargeNumber.prototype.product;

  function multiplyCompactByValueArray ( smallNum, valueArray, isNegativeFlag ) {
    if ( smallNum < CHUNK_SIZE ) {
      return new LargeNumber( smallMultiplication( valueArray, smallNum ), isNegativeFlag );
    }
    return new LargeNumber( longMultiplication( valueArray, compactToValueArray( smallNum ) ), isNegativeFlag );
  }

  CompactNumber.prototype._multiplyBySmall = function ( otherCompactNum ) {
    if ( isAccurate( otherCompactNum.numericData * this.numericData ) ) {
      return new CompactNumber( otherCompactNum.numericData * this.numericData );
    }
    return multiplyCompactByValueArray(
      Math.abs( otherCompactNum.numericData ),
      compactToValueArray( Math.abs( this.numericData ) ),
      this.isNegativeFlag !== otherCompactNum.isNegativeFlag
    );
  };

  LargeNumber.prototype._multiplyBySmall = function ( otherCompactNum ) {
    if ( otherCompactNum.numericData === 0 ) {
      return NumericalEntity[ 0 ];
    }
    if ( otherCompactNum.numericData === 1 ) {
      return this;
    }
    if ( otherCompactNum.numericData === -1 ) {
      return this.invertSign( );
    }
    return multiplyCompactByValueArray(
      Math.abs( otherCompactNum.numericData ),
      this.numericData,
      this.isNegativeFlag !== otherCompactNum.isNegativeFlag
    );
  };

  CompactNumber.prototype.product = function ( inputVal ) {
    return processInput( inputVal )._multiplyBySmall( this );
  };
  CompactNumber.prototype.multiplyBy = CompactNumber.prototype.product;

  function raiseToPowerTwoArray ( valueArray ) {
    var currentLength = valueArray.length,
        resultArray = makeZeroArray( currentLength + currentLength ),
        baseVal = CHUNK_SIZE,
        partialProduct,
        carryOver,
        idx,
        elemA_i,
        elemA_j;

    for ( idx = 0; idx < currentLength; idx++ ) {
      elemA_i = valueArray[ idx ];
      carryOver = 0 - elemA_i * elemA_i;
      for ( var innerIdx = idx; innerIdx < currentLength; innerIdx++ ) {
        elemA_j = valueArray[ innerIdx ];
        partialProduct = 2 * ( elemA_i * elemA_j ) + resultArray[ idx + innerIdx ] + carryOver;
        carryOver = Math.floor( partialProduct / baseVal );
        resultArray[ idx + innerIdx ] = partialProduct - carryOver * baseVal;
      }
      resultArray[ idx + currentLength ] = carryOver;
    }
    removeLeadingZeros( resultArray );
    return resultArray;
  }

  LargeNumber.prototype.raiseToPowerTwo = function ( ) {
    return new LargeNumber( raiseToPowerTwoArray( this.numericData ), false );
  };

  CompactNumber.prototype.raiseToPowerTwo = function ( ) {
    var squaredValue = this.numericData * this.numericData;
    if ( isAccurate( squaredValue ) ) {
      return new CompactNumber( squaredValue );
    }
    return new LargeNumber( raiseToPowerTwoArray( compactToValueArray( Math.abs( this.numericData ) ) ), false );
  };

  function divideAndModAlgorithm1 ( dividendArray, divisorArray ) {
    var lenOfDividend = dividendArray.length,
        lenOfDivisor = divisorArray.length,
        baseVal = CHUNK_SIZE,
        quotientResult = makeZeroArray( divisorArray.length ),
        topDivisorDigit = divisorArray[ lenOfDivisor - 1 ],
        scalingFactor = Math.ceil( baseVal / ( 2 * topDivisorDigit ) ),
        remainderArray = smallMultiplication( dividendArray, scalingFactor ),
        scaledDivisor = smallMultiplication( divisorArray, scalingFactor ),
        currentQuotientDigit,
        shiftAmount,
        carryOver,
        borrowAmount,
        idx,
        currentLength,
        tempQuotient;

    if ( remainderArray.length <= lenOfDividend ) {
      remainderArray.push( 0 );
    }
    scaledDivisor.push( 0 );
    topDivisorDigit = scaledDivisor[ lenOfDivisor - 1 ];

    for ( shiftAmount = lenOfDividend - lenOfDivisor; shiftAmount >= 0; shiftAmount-- ) {
      currentQuotientDigit = baseVal - 1;
      if ( remainderArray[ shiftAmount + lenOfDivisor ] !== topDivisorDigit ) {
        currentQuotientDigit = Math.floor( ( remainderArray[ shiftAmount + lenOfDivisor ] * baseVal + remainderArray[ shiftAmount + lenOfDivisor - 1 ] ) / topDivisorDigit );
      }
      carryOver = 0;
      borrowAmount = 0;
      currentLength = scaledDivisor.length;
      for ( idx = 0; idx < currentLength; idx++ ) {
        carryOver += currentQuotientDigit * scaledDivisor[ idx ];
        tempQuotient = Math.floor( carryOver / baseVal );
        borrowAmount += remainderArray[ shiftAmount + idx ] - ( carryOver - tempQuotient * baseVal );
        carryOver = tempQuotient;
        if ( borrowAmount < 0 ) {
          remainderArray[ shiftAmount + idx ] = borrowAmount + baseVal;
          borrowAmount = -1;
        } else {
          remainderArray[ shiftAmount + idx ] = borrowAmount;
          borrowAmount = 0;
        }
      }
      while ( borrowAmount !== 0 ) {
        currentQuotientDigit -= 1;
        carryOver = 0;
        for ( idx = 0; idx < currentLength; idx++ ) {
          carryOver += remainderArray[ shiftAmount + idx ] - baseVal + scaledDivisor[ idx ];
          if ( carryOver < 0 ) {
            remainderArray[ shiftAmount + idx ] = carryOver + baseVal;
            carryOver = 0;
          } else {
            remainderArray[ shiftAmount + idx ] = carryOver;
            carryOver = 1;
          }
        }
        borrowAmount += carryOver;
      }
      quotientResult[ shiftAmount ] = currentQuotientDigit;
    }
    remainderArray = divideAndModCompact( remainderArray, scalingFactor )[ 0 ];
    return [ valueArrayToCompact( quotientResult ), valueArrayToCompact( remainderArray ) ];
  }

  function divideAndModAlgorithm2 ( dividendArray, divisorArray ) {
    var lenOfDividend = dividendArray.length,
        lenOfDivisor = divisorArray.length,
        quotientResult = [],
        partialDividend = [],
        baseVal = CHUNK_SIZE,
        guessValue,
        xLength,
        highXPart,
        highYPart,
        checkValue;

    while ( lenOfDividend ) {
      partialDividend.unshift( dividendArray[ --lenOfDividend ] );
      removeLeadingZeros( partialDividend );
      if ( compareAbsoluteValues( partialDividend, divisorArray ) < 0 ) {
        quotientResult.push( 0 );
        continue;
      }
      xLength = partialDividend.length;
      highXPart = partialDividend[ xLength - 1 ] * baseVal + partialDividend[ xLength - 2 ];
      highYPart = divisorArray[ lenOfDivisor - 1 ] * baseVal + divisorArray[ lenOfDivisor - 2 ];
      if ( xLength > lenOfDivisor ) {
        highXPart = ( highXPart + 1 ) * baseVal;
      }
      guessValue = Math.ceil( highXPart / highYPart );
      do {
        checkValue = smallMultiplication( divisorArray, guessValue );
        if ( compareAbsoluteValues( checkValue, partialDividend ) <= 0 ) {
          break;
        }
        guessValue--;
      } while ( guessValue );
      quotientResult.push( guessValue );
      partialDividend = subtractArrays( partialDividend, checkValue );
    }
    quotientResult.reverse( );
    return [ valueArrayToCompact( quotientResult ), valueArrayToCompact( partialDividend ) ];
  }

  function divideAndModCompact ( valueArray, divisorNum ) {
    var currentLength = valueArray.length,
        quotientResult = makeZeroArray( currentLength ),
        baseVal = CHUNK_SIZE,
        idx,
        tempQuotient,
        remainderResult,
        currentDivisor;

    remainderResult = 0;
    for ( idx = currentLength - 1; idx >= 0; --idx ) {
      currentDivisor = remainderResult * baseVal + valueArray[ idx ];
      tempQuotient = chopDecimal( currentDivisor / divisorNum );
      remainderResult = currentDivisor - tempQuotient * divisorNum;
      quotientResult[ idx ] = tempQuotient | 0;
    }
    return [ quotientResult, remainderResult | 0 ];
  }

  function performDivisionAndModulo ( selfRef, inputVal ) {
    var numericData,
        otherNum = processInput( inputVal );
    var operandA = selfRef.numericData,
        operandB = otherNum.numericData;
    var quotientResult;

    if ( operandB === 0 ) {
      throw new Error( "Cannot divide by zero" );
    }
    if ( selfRef.isCompact ) {
      if ( otherNum.isCompact ) {
        return [ new CompactNumber( chopDecimal( operandA / operandB ) ), new CompactNumber( operandA % operandB ) ];
      }
      return [ NumericalEntity[ 0 ], selfRef ];
    }
    if ( otherNum.isCompact ) {
      if ( operandB === 1 ) {
        return [ selfRef, NumericalEntity[ 0 ] ];
      }
      if ( operandB === -1 ) {
        return [ selfRef.invertSign( ), NumericalEntity[ 0 ] ];
      }
      var absoluteValue = Math.abs( operandB );
      if ( absoluteValue < CHUNK_SIZE ) {
        numericData = divideAndModCompact( operandA, absoluteValue );
        quotientResult = valueArrayToCompact( numericData[ 0 ] );
        var remainderValue = numericData[ 1 ];
        if ( selfRef.isNegativeFlag ) {
          remainderValue = -remainderValue;
        }
        if ( typeof quotientResult === "number" ) {
          if ( selfRef.isNegativeFlag !== otherNum.isNegativeFlag ) {
            quotientResult = -quotientResult;
          }
          return [ new CompactNumber( quotientResult ), new CompactNumber( remainderValue ) ];
        }
        return [ new LargeNumber( quotientResult, selfRef.isNegativeFlag !== otherNum.isNegativeFlag ), new CompactNumber( remainderValue ) ];
      }
      operandB = compactToValueArray( absoluteValue );
    }

    var comparisonResult = compareAbsoluteValues( operandA, operandB );
    if ( comparisonResult === -1 ) {
      return [ NumericalEntity[ 0 ], selfRef ];
    }
    if ( comparisonResult === 0 ) {
      return [ NumericalEntity[ selfRef.isNegativeFlag === otherNum.isNegativeFlag ? 1 : -1 ], NumericalEntity[ 0 ] ];
    }

    if ( operandA.length + operandB.length <= 200 ) {
      numericData = divideAndModAlgorithm1( operandA, operandB );
    } else {
      numericData = divideAndModAlgorithm2( operandA, operandB );
    }

    quotientResult = numericData[ 0 ];
    var qIsNegative = selfRef.isNegativeFlag !== otherNum.isNegativeFlag,
        moduloValue = numericData[ 1 ],
        mIsNegative = selfRef.isNegativeFlag;

    if ( typeof quotientResult === "number" ) {
      if ( qIsNegative ) {
        quotientResult = -quotientResult;
      }
      quotientResult = new CompactNumber( quotientResult );
    } else {
      quotientResult = new LargeNumber( quotientResult, qIsNegative );
    }

    if ( typeof moduloValue === "number" ) {
      if ( mIsNegative ) {
        moduloValue = -moduloValue;
      }
      moduloValue = new CompactNumber( moduloValue );
    } else {
      moduloValue = new LargeNumber( moduloValue, mIsNegative );
    }
    return [ quotientResult, moduloValue ];
  }

  LargeNumber.prototype.divideAndMod = function ( inputVal ) {
    var resultPair = performDivisionAndModulo( this, inputVal );
    return {
      quotient: resultPair[ 0 ],
      remainder: resultPair[ 1 ]
    };
  };
  CompactNumber.prototype.divideAndMod = LargeNumber.prototype.divideAndMod;

  LargeNumber.prototype.quotient = function ( inputVal ) {
    return performDivisionAndModulo( this, inputVal )[ 0 ];
  };
  CompactNumber.prototype.divideBy = CompactNumber.prototype.quotient;
  CompactNumber.prototype.quotient = CompactNumber.prototype.divideBy;
  LargeNumber.prototype.divideBy = LargeNumber.prototype.quotient;

  LargeNumber.prototype.remainder = function ( inputVal ) {
    return performDivisionAndModulo( this, inputVal )[ 1 ];
  };
  CompactNumber.prototype.modulo = CompactNumber.prototype.remainder;
  CompactNumber.prototype.remainder = CompactNumber.prototype.modulo;
  LargeNumber.prototype.modulo = LargeNumber.prototype.remainder;

  LargeNumber.prototype.power = function ( inputVal ) {
    var exponentVal = processInput( inputVal ),
        baseValue = this.numericData,
        powerValue = exponentVal.numericData,
        tempNumericValue,
        factorX,
        factorY;

    if ( powerValue === 0 ) {
      return NumericalEntity[ 1 ];
    }
    if ( baseValue === 0 ) {
      return NumericalEntity[ 0 ];
    }
    if ( baseValue === 1 ) {
      return NumericalEntity[ 1 ];
    }
    if ( baseValue === -1 ) {
      return exponentVal.isEvenNumber( ) ? NumericalEntity[ 1 ] : NumericalEntity[ -1 ];
    }
    if ( exponentVal.isNegativeFlag ) {
      return NumericalEntity[ 0 ];
    }
    if ( !exponentVal.isCompact ) {
      throw new Error( "The exponent " + exponentVal.toStringRepresentation( ) + " is too large." );
    }
    if ( this.isCompact ) {
      if ( isAccurate( tempNumericValue = Math.pow( baseValue, powerValue ) ) ) {
        return new CompactNumber( chopDecimal( tempNumericValue ) );
      }
    }

    factorX = this;
    factorY = NumericalEntity[ 1 ];
    while ( true ) {
      if ( ( powerValue & 1 ) === 1 ) {
        factorY = factorY.multiplyBy( factorX );
        --powerValue;
      }
      if ( powerValue === 0 ) {
        break;
      }
      powerValue /= 2;
      factorX = factorX.raiseToPowerTwo( );
    }
    return factorY;
  };
  CompactNumber.prototype.power = LargeNumber.prototype.power;

  LargeNumber.prototype.modularPower = function ( exponentRef, modulusRef ) {
    exponentRef = processInput( exponentRef );
    modulusRef = processInput( modulusRef );
    if ( modulusRef.isZeroValue( ) ) {
      throw new Error( "Cannot take modularPower with modulus 0" );
    }
    var resultValue = NumericalEntity[ 1 ],
        currentBase = this.remainder( modulusRef );

    while ( exponentRef.isPositiveValue( ) ) {
      if ( currentBase.isZeroValue( ) ) {
        return NumericalEntity[ 0 ];
      }
      if ( exponentRef.isOddNumber( ) ) {
        resultValue = resultValue.multiplyBy( currentBase ).remainder( modulusRef );
      }
      exponentRef = exponentRef.quotient( 2 );
      currentBase = currentBase.raiseToPowerTwo( ).remainder( modulusRef );
    }
    return resultValue;
  };
  CompactNumber.prototype.modularPower = LargeNumber.prototype.modularPower;

  function compareAbsoluteValues ( firstArray, secondArray ) {
    if ( firstArray.length !== secondArray.length ) {
      return firstArray.length > secondArray.length ? 1 : -1;
    }
    for ( var idx = firstArray.length - 1; idx >= 0; idx-- ) {
      if ( firstArray[ idx ] !== secondArray[ idx ] ) {
        return firstArray[ idx ] > secondArray[ idx ] ? 1 : -1;
      }
    }
    return 0;
  }

  LargeNumber.prototype.compareAbsoluteValues = function ( inputVal ) {
    var otherNum = processInput( inputVal ),
        operandA = this.numericData,
        operandB = otherNum.numericData;
    if ( otherNum.isCompact ) {
      return 1;
    }
    return compareAbsoluteValues( operandA, operandB );
  };

  CompactNumber.prototype.compareAbsoluteValues = function ( inputVal ) {
    var otherNum = processInput( inputVal ),
        operandA = Math.abs( this.numericData ),
        operandB = otherNum.numericData;
    if ( otherNum.isCompact ) {
      operandB = Math.abs( operandB );
      return operandA === operandB ? 0 : operandA > operandB ? 1 : -1;
    }
    return -1;
  };

  LargeNumber.prototype.compareTo = function ( inputVal ) {
    if ( inputVal === Infinity ) {
      return -1;
    }
    if ( inputVal === -Infinity ) {
      return 1;
    }
    var otherNum = processInput( inputVal ),
        operandA = this.numericData,
        operandB = otherNum.numericData;

    if ( this.isNegativeFlag !== otherNum.isNegativeFlag ) {
      return otherNum.isNegativeFlag ? 1 : -1;
    }
    if ( otherNum.isCompact ) {
      return this.isNegativeFlag ? -1 : 1;
    }
    return compareAbsoluteValues( operandA, operandB ) * ( this.isNegativeFlag ? -1 : 1 );
  };
  LargeNumber.prototype.compareWith = LargeNumber.prototype.compareTo;

  CompactNumber.prototype.compareTo = function ( inputVal ) {
    if ( inputVal === Infinity ) {
      return -1;
    }
    if ( inputVal === -Infinity ) {
      return 1;
    }
    var otherNum = processInput( inputVal ),
        operandA = this.numericData,
        operandB = otherNum.numericData;

    if ( otherNum.isCompact ) {
      return operandA == operandB ? 0 : operandA > operandB ? 1 : -1;
    }
    if ( operandA < 0 !== otherNum.isNegativeFlag ) {
      return operandA < 0 ? -1 : 1;
    }
    return operandA < 0 ? 1 : -1;
  };
  CompactNumber.prototype.compareWith = CompactNumber.prototype.compareTo;

  LargeNumber.prototype.isEqualTo = function ( inputVal ) {
    return this.compareTo( inputVal ) === 0;
  };
  CompactNumber.prototype.equal = CompactNumber.prototype.isEqualTo;
  CompactNumber.prototype.isEqualTo = CompactNumber.prototype.equal;
  LargeNumber.prototype.equal = LargeNumber.prototype.isEqualTo;

  LargeNumber.prototype.isNotEqualTo = function ( inputVal ) {
    return this.compareTo( inputVal ) !== 0;
  };
  CompactNumber.prototype.notEqual = CompactNumber.prototype.isNotEqualTo;
  CompactNumber.prototype.isNotEqualTo = CompactNumber.prototype.notEqual;
  LargeNumber.prototype.notEqual = LargeNumber.prototype.isNotEqualTo;

  LargeNumber.prototype.isGreater = function ( inputVal ) {
    return this.compareTo( inputVal ) > 0;
  };
  CompactNumber.prototype.greaterThan = CompactNumber.prototype.isGreater;
  CompactNumber.prototype.isGreater = CompactNumber.prototype.greaterThan;
  LargeNumber.prototype.greaterThan = LargeNumber.prototype.isGreater;

  LargeNumber.prototype.isLesser = function ( inputVal ) {
    return this.compareTo( inputVal ) < 0;
  };
  CompactNumber.prototype.lessThan = CompactNumber.prototype.isLesser;
  CompactNumber.prototype.isLesser = CompactNumber.prototype.lessThan;
  LargeNumber.prototype.lessThan = LargeNumber.prototype.isLesser;

  LargeNumber.prototype.isGreaterOrEqualTo = function ( inputVal ) {
    return this.compareTo( inputVal ) >= 0;
  };
  CompactNumber.prototype.greaterOrEqual = CompactNumber.prototype.isGreaterOrEqualTo;
  CompactNumber.prototype.isGreaterOrEqualTo = CompactNumber.prototype.greaterOrEqual;
  LargeNumber.prototype.greaterOrEqual = LargeNumber.prototype.isGreaterOrEqualTo;

  LargeNumber.prototype.isLesserOrEqualTo = function ( inputVal ) {
    return this.compareTo( inputVal ) <= 0;
  };
  CompactNumber.prototype.lessOrEqual = CompactNumber.prototype.isLesserOrEqualTo;
  CompactNumber.prototype.isLesserOrEqualTo = CompactNumber.prototype.lessOrEqual;
  LargeNumber.prototype.lessOrEqual = LargeNumber.prototype.isLesserOrEqualTo;

  LargeNumber.prototype.isEvenNumber = function ( ) {
    return ( this.numericData[ 0 ] & 1 ) === 0;
  };

  CompactNumber.prototype.isEvenNumber = function ( ) {
    return ( this.numericData & 1 ) === 0;
  };

  LargeNumber.prototype.isOddNumber = function ( ) {
    return ( this.numericData[ 0 ] & 1 ) === 1;
  };

  CompactNumber.prototype.isOddNumber = function ( ) {
    return ( this.numericData & 1 ) === 1;
  };

  LargeNumber.prototype.isPositiveValue = function ( ) {
    return !this.isNegativeFlag;
  };

  CompactNumber.prototype.isPositiveValue = function ( ) {
    return this.numericData > 0;
  };

  LargeNumber.prototype.isNegativeValue = function ( ) {
    return this.isNegativeFlag;
  };

  CompactNumber.prototype.isNegativeValue = function ( ) {
    return this.numericData < 0;
  };

  LargeNumber.prototype.isUnity = function ( ) {
    return false;
  };

  CompactNumber.prototype.isUnity = function ( ) {
    return Math.abs( this.numericData ) === 1;
  };

  LargeNumber.prototype.isZeroValue = function ( ) {
    return false;
  };

  CompactNumber.prototype.isZeroValue = function ( ) {
    return this.numericData === 0;
  };

  LargeNumber.prototype.canBeDividedBy = function ( inputVal ) {
    var otherNum = processInput( inputVal );
    var divisorNumericValue = otherNum.numericData;
    if ( divisorNumericValue === 0 ) {
      return false;
    }
    if ( divisorNumericValue === 1 ) {
      return true;
    }
    if ( divisorNumericValue === 2 ) {
      return this.isEvenNumber( );
    }
    return this.remainder( otherNum ).isEqualTo( NumericalEntity[ 0 ] );
  };
  CompactNumber.prototype.canBeDividedBy = LargeNumber.prototype.canBeDividedBy;

  function checkBasicPrimal ( numVal ) {
    var absoluteNum = numVal.absolute( );
    if ( absoluteNum.isUnity( ) ) {
      return false;
    }
    if ( absoluteNum.isEqualTo( 2 ) || absoluteNum.isEqualTo( 3 ) || absoluteNum.isEqualTo( 5 ) ) {
      return true;
    }
    if ( absoluteNum.isEvenNumber( ) || absoluteNum.canBeDividedBy( 3 ) || absoluteNum.canBeDividedBy( 5 ) ) {
      return false;
    }
    if ( absoluteNum.isLesser( 25 ) ) {
      return true;
    }
  }

  LargeNumber.prototype.isAPrime = function ( ) {
    var primalCheck = checkBasicPrimal( this );
    if ( primalCheck !== noValue ) {
      return primalCheck;
    }
    var absoluteNum = this.absolute( ),
        numMinusOne = absoluteNum.decrement( );
    var testPrimes = [ 2, 3, 5, 7, 11, 13, 17, 19 ],
        tempB = numMinusOne,
        divisorFactor,
        tempFlag,
        idx,
        testValue;

    while ( tempB.isEvenNumber( ) ) {
      tempB = tempB.quotient( 2 );
    }

    for ( idx = 0; idx < testPrimes.length; idx++ ) {
      testValue = largeNum( testPrimes[ idx ] ).modularPower( tempB, absoluteNum );
      if ( testValue.isEqualTo( NumericalEntity[ 1 ] ) || testValue.isEqualTo( numMinusOne ) ) {
        continue;
      }
      for ( tempFlag = true, divisorFactor = tempB; tempFlag && divisorFactor.isLesser( numMinusOne ); divisorFactor = divisorFactor.multiplyBy( 2 ) ) {
        testValue = testValue.raiseToPowerTwo( ).remainder( absoluteNum );
        if ( testValue.isEqualTo( numMinusOne ) ) {
          tempFlag = false;
        }
      }
      if ( tempFlag ) {
        return false;
      }
    }
    return true;
  };
  CompactNumber.prototype.isAPrime = LargeNumber.prototype.isAPrime;

  LargeNumber.prototype.isLikelyPrime = function ( iterationsCount ) {
    var primalCheck = checkBasicPrimal( this );
    if ( primalCheck !== noValue ) {
      return primalCheck;
    }
    var absoluteNum = this.absolute( );
    var numIterations = iterationsCount === noValue ? 5 : iterationsCount;
    for ( var idx = 0; idx < numIterations; idx++ ) {
      var randomTestVal = largeNum.randomBetween( 2, absoluteNum.takeAway( 2 ) );
      if ( !randomTestVal.modularPower( absoluteNum.decrement( ), absoluteNum ).isUnity( ) ) {
        return false;
      }
    }
    return true;
  };
  CompactNumber.prototype.isLikelyPrime = LargeNumber.prototype.isLikelyPrime;

  LargeNumber.prototype.modularInverse = function ( inputVal ) {
    var tempVal = largeNum.zeroVal,
        newTemp = largeNum.oneVal,
        modulusRef = processInput( inputVal ),
        newRemainder = this.absolute( ),
        quotientVal,
        oldTemp,
        oldRemainder;

    while ( !newRemainder.isEqualTo( largeNum.zeroVal ) ) {
      quotientVal = modulusRef.quotient( newRemainder );
      oldTemp = tempVal;
      oldRemainder = modulusRef;
      tempVal = newTemp;
      modulusRef = newRemainder;
      newTemp = oldTemp.difference( quotientVal.multiplyBy( newTemp ) );
      newRemainder = oldRemainder.difference( quotientVal.multiplyBy( newRemainder ) );
    }
    if ( !modulusRef.isEqualTo( 1 ) ) {
      throw new Error( this.toStringRepresentation( ) + " and " + inputVal.toStringRepresentation( ) + " are not co-prime" );
    }
    if ( tempVal.compareTo( 0 ) === -1 ) {
      tempVal = tempVal.sum( inputVal );
    }
    if ( this.isNegativeValue( ) ) {
      return tempVal.invertSign( );
    }
    return tempVal;
  };
  CompactNumber.prototype.modularInverse = LargeNumber.prototype.modularInverse;

  LargeNumber.prototype.increment = function ( ) {
    var currentNumericValue = this.numericData;
    if ( this.isNegativeFlag ) {
      return subtractCompactFromValueArray( currentNumericValue, 1, this.isNegativeFlag );
    }
    return new LargeNumber( addCompactToValueArray( currentNumericValue, 1 ), this.isNegativeFlag );
  };

  CompactNumber.prototype.increment = function ( ) {
    var currentNumericValue = this.numericData;
    if ( currentNumericValue + 1 < MAX_SAFE_JS_NUM ) {
      return new CompactNumber( currentNumericValue + 1 );
    }
    return new LargeNumber( MAX_SAFE_NUM_ARRAY, false );
  };

  LargeNumber.prototype.decrement = function ( ) {
    var currentNumericValue = this.numericData;
    if ( this.isNegativeFlag ) {
      return new LargeNumber( addCompactToValueArray( currentNumericValue, 1 ), true );
    }
    return subtractCompactFromValueArray( currentNumericValue, 1, this.isNegativeFlag );
  };

  CompactNumber.prototype.decrement = function ( ) {
    var currentNumericValue = this.numericData;
    if ( currentNumericValue - 1 > -MAX_SAFE_JS_NUM ) {
      return new CompactNumber( currentNumericValue - 1 );
    }
    return new LargeNumber( MAX_SAFE_NUM_ARRAY, true );
  };

  var powersOfTwoArray = [ 1 ];
  while ( 2 * powersOfTwoArray[ powersOfTwoArray.length - 1 ] <= CHUNK_SIZE ) {
    powersOfTwoArray.push( 2 * powersOfTwoArray[ powersOfTwoArray.length - 1 ] );
  }
  var powersArrayLength = powersOfTwoArray.length,
      maxPowerOfTwo = powersOfTwoArray[ powersArrayLength - 1 ];

  function isSmallForShifting ( numVal ) {
    return ( typeof numVal === "number" || typeof numVal === "string" ) && +Math.abs( numVal ) <= CHUNK_SIZE || numVal instanceof LargeNumber && numVal.numericData.length <= 1;
  }

  LargeNumber.prototype.bitShiftLeft = function ( shiftAmount ) {
    if ( !isSmallForShifting( shiftAmount ) ) {
      throw new Error( String( shiftAmount ) + " is too large for shifting." );
    }
    shiftAmount = +shiftAmount;
    if ( shiftAmount < 0 ) {
      return this.bitShiftRight( -shiftAmount );
    }
    var resultNum = this;
    if ( resultNum.isZeroValue( ) ) {
      return resultNum;
    }
    while ( shiftAmount >= powersArrayLength ) {
      resultNum = resultNum.multiplyBy( maxPowerOfTwo );
      shiftAmount -= powersArrayLength - 1;
    }
    return resultNum.multiplyBy( powersOfTwoArray[ shiftAmount ] );
  };
  CompactNumber.prototype.bitShiftLeft = LargeNumber.prototype.bitShiftLeft;

  LargeNumber.prototype.bitShiftRight = function ( shiftAmount ) {
    var remainderAndQuotient;
    if ( !isSmallForShifting( shiftAmount ) ) {
      throw new Error( String( shiftAmount ) + " is too large for shifting." );
    }
    shiftAmount = +shiftAmount;
    if ( shiftAmount < 0 ) {
      return this.bitShiftLeft( -shiftAmount );
    }
    var resultNum = this;
    while ( shiftAmount >= powersArrayLength ) {
      if ( resultNum.isZeroValue( ) || resultNum.isNegativeValue( ) && resultNum.isUnity( ) ) {
        return resultNum;
      }
      remainderAndQuotient = performDivisionAndModulo( resultNum, maxPowerOfTwo );
      resultNum = remainderAndQuotient[ 1 ].isNegativeValue( ) ? remainderAndQuotient[ 0 ].decrement( ) : remainderAndQuotient[ 0 ];
      shiftAmount -= powersArrayLength - 1;
    }
    remainderAndQuotient = performDivisionAndModulo( resultNum, powersOfTwoArray[ shiftAmount ] );
    return remainderAndQuotient[ 1 ].isNegativeValue( ) ? remainderAndQuotient[ 0 ].decrement( ) : remainderAndQuotient[ 0 ];
  };
  CompactNumber.prototype.bitShiftRight = LargeNumber.prototype.bitShiftRight;

  function performBitwiseOperation ( firstOperand, secondOperand, operationFunc ) {
    secondOperand = processInput( secondOperand );
    var firstSign = firstOperand.isNegativeValue( ),
        secondSign = secondOperand.isNegativeValue( );
    var firstRemaining = firstSign ? firstOperand.bitwiseNot( ) : firstOperand,
        secondRemaining = secondSign ? secondOperand.bitwiseNot( ) : secondOperand;
    var firstDigit = 0,
        secondDigit = 0;
    var firstDivMod = null,
        secondDivMod = null;
    var outputResult = [];

    while ( !firstRemaining.isZeroValue( ) || !secondRemaining.isZeroValue( ) ) {
      firstDivMod = performDivisionAndModulo( firstRemaining, maxPowerOfTwo );
      firstDigit = firstDivMod[ 1 ].toJavascriptNumber( );
      if ( firstSign ) {
        firstDigit = maxPowerOfTwo - 1 - firstDigit;
      }
      secondDivMod = performDivisionAndModulo( secondRemaining, maxPowerOfTwo );
      secondDigit = secondDivMod[ 1 ].toJavascriptNumber( );
      if ( secondSign ) {
        secondDigit = maxPowerOfTwo - 1 - secondDigit;
      }
      firstRemaining = firstDivMod[ 0 ];
      secondRemaining = secondDivMod[ 0 ];
      outputResult.push( operationFunc( firstDigit, secondDigit ) );
    }

    var cumulativeResult = operationFunc( firstSign ? 1 : 0, secondSign ? 1 : 0 ) !== 0 ? largeNum( -1 ) : largeNum( 0 );
    for ( var idx = outputResult.length - 1; idx >= 0; idx -= 1 ) {
      cumulativeResult = cumulativeResult.multiplyBy( maxPowerOfTwo ).sum( largeNum( outputResult[ idx ] ) );
    }
    return cumulativeResult;
  }

  LargeNumber.prototype.bitwiseNot = function ( ) {
    return this.invertSign( ).decrement( );
  };
  CompactNumber.prototype.bitwiseNot = LargeNumber.prototype.bitwiseNot;

  LargeNumber.prototype.bitwiseAnd = function ( otherNum ) {
    return performBitwiseOperation( this, otherNum, function ( valA, valB ) {
      return valA & valB;
    } );
  };
  CompactNumber.prototype.bitwiseAnd = LargeNumber.prototype.bitwiseAnd;

  LargeNumber.prototype.bitwiseOr = function ( otherNum ) {
    return performBitwiseOperation( this, otherNum, function ( valA, valB ) {
      return valA | valB;
    } );
  };
  CompactNumber.prototype.bitwiseOr = LargeNumber.prototype.bitwiseOr;

  LargeNumber.prototype.bitwiseXor = function ( otherNum ) {
    return performBitwiseOperation( this, otherNum, function ( valA, valB ) {
      return valA ^ valB;
    } );
  };
  CompactNumber.prototype.bitwiseXor = LargeNumber.prototype.bitwiseXor;

  var LOW_ORDER_BIT_MASK_INT = 1 << 30,
      LOW_ORDER_BIT_MASK_BIG_INT = ( CHUNK_SIZE & -CHUNK_SIZE ) * ( CHUNK_SIZE & -CHUNK_SIZE ) | LOW_ORDER_BIT_MASK_INT;

  function approximateLowestOneBit ( numVal ) {
    var internalValue = numVal.numericData,
        bitRepresentation = typeof internalValue === "number" ? internalValue | LOW_ORDER_BIT_MASK_INT : internalValue[ 0 ] + internalValue[ 1 ] * CHUNK_SIZE | LOW_ORDER_BIT_MASK_BIG_INT;
    return bitRepresentation & -bitRepresentation;
  }

  function calculateIntegerLog ( currentVal, baseVal ) {
    if ( baseVal.compareTo( currentVal ) <= 0 ) {
      var tempCalculation = calculateIntegerLog( currentVal, baseVal.raiseToPowerTwo( ) );
      var powerResult = tempCalculation.powerResult;
      var exponentCount = tempCalculation.exponentCount;
      var intermediateResult = powerResult.multiplyBy( baseVal );
      return intermediateResult.compareTo( currentVal ) <= 0 ? {
        powerResult: intermediateResult,
        exponentCount: exponentCount * 2 + 1
      } : {
        powerResult: powerResult,
        exponentCount: exponentCount * 2
      };
    }
    return {
      powerResult: largeNum( 1 ),
      exponentCount: 0
    };
  }

  LargeNumber.prototype.getBitLength = function ( ) {
    var numRef = this;
    if ( numRef.compareTo( largeNum( 0 ) ) < 0 ) {
      numRef = numRef.invertSign( ).difference( largeNum( 1 ) );
    }
    if ( numRef.compareTo( largeNum( 0 ) ) === 0 ) {
      return largeNum( 0 );
    }
    return largeNum( calculateIntegerLog( numRef, largeNum( 2 ) ).exponentCount ).sum( largeNum( 1 ) );
  };
  CompactNumber.prototype.getBitLength = LargeNumber.prototype.getBitLength;

  function findMaximum ( valA, valB ) {
    valA = processInput( valA );
    valB = processInput( valB );
    return valA.isGreater( valB ) ? valA : valB;
  }

  function findMinimum ( valA, valB ) {
    valA = processInput( valA );
    valB = processInput( valB );
    return valA.isLesser( valB ) ? valA : valB;
  }

  function greatestCommonDivisor ( valA, valB ) {
    valA = processInput( valA ).absolute( );
    valB = processInput( valB ).absolute( );
    if ( valA.isEqualTo( valB ) ) {
      return valA;
    }
    if ( valA.isZeroValue( ) ) {
      return valB;
    }
    if ( valB.isZeroValue( ) ) {
      return valA;
    }

    var commonFactor = NumericalEntity[ 1 ],
        divisorFactor,
        tempVar;
    while ( valA.isEvenNumber( ) && valB.isEvenNumber( ) ) {
      divisorFactor = Math.min( approximateLowestOneBit( valA ), approximateLowestOneBit( valB ) );
      valA = valA.quotient( divisorFactor );
      valB = valB.quotient( divisorFactor );
      commonFactor = commonFactor.multiplyBy( divisorFactor );
    }
    while ( valA.isEvenNumber( ) ) {
      valA = valA.quotient( approximateLowestOneBit( valA ) );
    }
    do {
      while ( valB.isEvenNumber( ) ) {
        valB = valB.quotient( approximateLowestOneBit( valB ) );
      }
      if ( valA.isGreater( valB ) ) {
        tempVar = valB;
        valB = valA;
        valA = tempVar;
      }
      valB = valB.difference( valA );
    } while ( !valB.isZeroValue( ) );
    return commonFactor.isUnity( ) ? valA : valA.multiplyBy( commonFactor );
  }

  function leastCommonMultiple ( valA, valB ) {
    valA = processInput( valA ).absolute( );
    valB = processInput( valB ).absolute( );
    return valA.quotient( greatestCommonDivisor( valA, valB ) ).multiplyBy( valB );
  }

  function generateRandomBetween ( lowerBound, upperBound ) {
    lowerBound = processInput( lowerBound );
    upperBound = processInput( upperBound );
    var minVal = findMinimum( lowerBound, upperBound ),
        maxVal = findMaximum( lowerBound, upperBound );
    var valueRange = maxVal.difference( minVal ).sum( 1 );

    if ( valueRange.isCompact ) {
      return minVal.sum( Math.floor( Math.random( ) * valueRange.numericData ) );
    }

    var rangeLength = valueRange.numericData.length - 1;
    var outputResult = [],
        isRestricted = true;

    for ( var idx = rangeLength; idx >= 0; idx-- ) {
      var upperLimit = isRestricted ? valueRange.numericData[ idx ] : CHUNK_SIZE;
      var currentDigit = chopDecimal( Math.random( ) * upperLimit );
      outputResult.unshift( currentDigit );
      if ( currentDigit < upperLimit ) {
        isRestricted = false;
      }
    }
    outputResult = valueArrayToCompact( outputResult );
    return minVal.sum( typeof outputResult === "number" ? new CompactNumber( outputResult ) : new LargeNumber( outputResult, false ) );
  }

  var parseValueWithBase = function ( inputText, baseSystem ) {
    var textLength = inputText.length;
    var idx;
    var absoluteBase = Math.abs( baseSystem );

    for ( idx = 0; idx < textLength; idx++ ) {
      var charValue = inputText[ idx ].toLowerCase( );
      if ( charValue === "-" ) {
        continue;
      }
      if ( /[a-z0-9]/.test( charValue ) ) {
        if ( /[0-9]/.test( charValue ) && +charValue >= absoluteBase ) {
          if ( charValue === "1" && absoluteBase === 1 ) {
            continue;
          }
          throw new Error( charValue + " is not a valid digit in base " + baseSystem + "." );
        } else if ( charValue.charCodeAt( 0 ) - 87 >= absoluteBase ) {
          throw new Error( charValue + " is not a valid digit in base " + baseSystem + "." );
        }
      }
    }

    if ( 2 <= baseSystem && baseSystem <= 36 ) {
      if ( textLength <= NATURAL_LOG_MAX_SAFE_NUM / Math.log( baseSystem ) ) {
        var parsedResult = parseInt( inputText, baseSystem );
        if ( isNaN( parsedResult ) ) {
          throw new Error( charValue + " is not a valid digit in base " + baseSystem + "." );
        }
        return new CompactNumber( parseInt( inputText, baseSystem ) );
      }
    }

    baseSystem = processInput( baseSystem );
    var digitList = [];
    var isNegativeInput = inputText[ 0 ] === "-";
    for ( idx = isNegativeInput ? 1 : 0; idx < inputText.length; idx++ ) {
      var charValue = inputText[ idx ].toLowerCase( ),
          characterCode = charValue.charCodeAt( 0 );
      if ( 48 <= characterCode && characterCode <= 57 ) {
        digitList.push( processInput( charValue ) );
      } else if ( 97 <= characterCode && characterCode <= 122 ) {
        digitList.push( processInput( charValue.charCodeAt( 0 ) - 87 ) );
      } else if ( charValue === "<" ) {
        var startIndex = idx;
        do {
          idx++;
        } while ( inputText[ idx ] !== ">" );
        digitList.push( processInput( inputText.slice( startIndex + 1, idx ) ) );
      } else {
        throw new Error( charValue + " is not a valid character" );
      }
    }
    return parseArrayWithBase( digitList, baseSystem, isNegativeInput );
  };

  function parseArrayWithBase ( digitList, baseVal, isNegativeInput ) {
    var accumulatedValue = NumericalEntity[ 0 ],
        powerOfBase = NumericalEntity[ 1 ],
        idx;
    for ( idx = digitList.length - 1; idx >= 0; idx-- ) {
      accumulatedValue = accumulatedValue.sum( digitList[ idx ].multiplyBy( powerOfBase ) );
      powerOfBase = powerOfBase.multiplyBy( baseVal );
    }
    return isNegativeInput ? accumulatedValue.invertSign( ) : accumulatedValue;
  }

  function digitToString ( digitVal ) {
    if ( digitVal <= 35 ) {
      return "0123456789abcdefghijklmnopqrstuvwxyz".charAt( digitVal );
    }
    return "<" + digitVal + ">";
  }

  function convertToBaseRepresentation ( numVal, targetBase ) {
    targetBase = largeNum( targetBase );
    if ( targetBase.isZeroValue( ) ) {
      if ( numVal.isZeroValue( ) ) {
        return {
          numericData: [ 0 ],
          isNegativeOutput: false
        };
      }
      throw new Error( "Cannot convert nonzero numbers to base 0." );
    }
    if ( targetBase.isEqualTo( -1 ) ) {
      if ( numVal.isZeroValue( ) ) {
        return {
          numericData: [ 0 ],
          isNegativeOutput: false
        };
      }
      if ( numVal.isNegativeValue( ) ) {
        return {
          numericData: [ ].concat.apply( [ ], Array.apply( null, Array( -numVal.numericData ) ).map( Array.prototype.valueOf, [ 1, 0 ] ) ),
          isNegativeOutput: false
        };
      }
      var digitArr = Array.apply( null, Array( +numVal.numericData - 1 ) ).map( Array.prototype.valueOf, [ 0, 1 ] );
      digitArr.unshift( [ 1 ] );
      return {
        numericData: [ ].concat.apply( [ ], digitArr ),
        isNegativeOutput: false
      };
    }

    var isNegativeOutput = false;
    if ( numVal.isNegativeValue( ) && targetBase.isPositiveValue( ) ) {
      isNegativeOutput = true;
      numVal = numVal.absolute( );
    }
    if ( targetBase.isEqualTo( 1 ) ) {
      if ( numVal.isZeroValue( ) ) {
        return {
          numericData: [ 0 ],
          isNegativeOutput: false
        };
      }
      return {
        numericData: Array.apply( null, Array( +numVal.numericData ) ).map( Number.prototype.valueOf, 1 ),
        isNegativeOutput: isNegativeOutput
      };
    }

    var outputDigits = [];
    var remainingValue = numVal,
        divisionResult;
    while ( remainingValue.isNegativeValue( ) || remainingValue.compareAbsoluteValues( targetBase ) >= 0 ) {
      divisionResult = remainingValue.divideAndMod( targetBase );
      remainingValue = divisionResult.quotient;
      var currentDigit = divisionResult.remainder;
      if ( currentDigit.isNegativeValue( ) ) {
        currentDigit = targetBase.takeAway( currentDigit ).absolute( );
        remainingValue = remainingValue.increment( );
      }
      outputDigits.push( currentDigit.toJavascriptNumber( ) );
    }
    outputDigits.push( remainingValue.toJavascriptNumber( ) );
    return {
      numericData: outputDigits.reverse( ),
      isNegativeOutput: isNegativeOutput
    };
  }

  function toBaseStringRepresentation ( numVal, targetBase ) {
    var baseArrayResult = convertToBaseRepresentation( numVal, targetBase );
    return ( baseArrayResult.isNegativeOutput ? "-" : "" ) + baseArrayResult.numericData.map( digitToString ).join( "" );
  }

  LargeNumber.prototype.toNumericalArray = function ( targetBase ) {
    return convertToBaseRepresentation( this, targetBase );
  };
  CompactNumber.prototype.toNumericalArray = LargeNumber.prototype.toNumericalArray;

  LargeNumber.prototype.toStringRepresentation = function ( targetBase ) {
    if ( targetBase === noValue ) {
      targetBase = 10;
    }
    if ( targetBase !== 10 ) {
      return toBaseStringRepresentation( this, targetBase );
    }
    var internalValue = this.numericData,
        currentLength = internalValue.length,
        stringPart = String( internalValue[ --currentLength ] ),
        zeroPadding = "0000000",
        currentDigit;

    while ( --currentLength >= 0 ) {
      currentDigit = String( internalValue[ currentLength ] );
      stringPart += zeroPadding.slice( currentDigit.length ) + currentDigit;
    }
    var signPrefix = this.isNegativeFlag ? "-" : "";
    return signPrefix + stringPart;
  };

  CompactNumber.prototype.toStringRepresentation = function ( targetBase ) {
    if ( targetBase === noValue ) {
      targetBase = 10;
    }
    if ( targetBase != 10 ) {
      return toBaseStringRepresentation( this, targetBase );
    }
    return String( this.numericData );
  };

  LargeNumber.prototype.toJSONObject = CompactNumber.prototype.toJSONObject = function ( ) {
    return this.toStringRepresentation( );
  };

  LargeNumber.prototype.getValueOf = function ( ) {
    return parseInt( this.toStringRepresentation( ), 10 );
  };
  LargeNumber.prototype.toJavascriptNumber = LargeNumber.prototype.getValueOf;

  CompactNumber.prototype.getValueOf = function ( ) {
    return this.numericData;
  };
  CompactNumber.prototype.toJavascriptNumber = CompactNumber.prototype.getValueOf;

  function parseTextValue ( inputVal ) {
    if ( isAccurate( +inputVal ) ) {
      var numX = +inputVal;
      if ( numX === chopDecimal( numX ) ) {
        return new CompactNumber( numX );
      }
      throw new Error( "Invalid integer: " + inputVal );
    }
    var isNegativeInput = inputVal[ 0 ] === "-";
    if ( isNegativeInput ) {
      inputVal = inputVal.slice( 1 );
    }

    var parts = inputVal.split( /e/i );
    if ( parts.length > 2 ) {
      throw new Error( "Invalid integer: " + parts.join( "e" ) );
    }
    if ( parts.length === 2 ) {
      var exponentPart = parts[ 1 ];
      if ( exponentPart[ 0 ] === "+" ) {
        exponentPart = exponentPart.slice( 1 );
      }
      exponentPart = +exponentPart;
      if ( exponentPart !== chopDecimal( exponentPart ) || !isAccurate( exponentPart ) ) {
        throw new Error( "Invalid integer: " + exponentPart + " is not a valid exponent." );
      }
      var textContent = parts[ 0 ];
      var decimalPos = textContent.indexOf( "." );
      if ( decimalPos >= 0 ) {
        exponentPart -= textContent.length - decimalPos - 1;
        textContent = textContent.slice( 0, decimalPos ) + textContent.slice( decimalPos + 1 );
      }
      if ( exponentPart < 0 ) {
        throw new Error( "Cannot include negative exponent part for integers" );
      }
      textContent += new Array( exponentPart + 1 ).join( "0" );
      inputVal = textContent;
    }

    var isStringValid = /^([0-9][0-9]*)$/.test( inputVal );
    if ( !isStringValid ) {
      throw new Error( "Invalid integer: " + inputVal );
    }

    var resultArray = [],
        maxLength = inputVal.length,
        chunkLength = CHUNK_LOG,
        minLength = maxLength - chunkLength;
    while ( maxLength > 0 ) {
      resultArray.push( +inputVal.slice( minLength, maxLength ) );
      minLength -= chunkLength;
      if ( minLength < 0 ) {
        minLength = 0;
      }
      maxLength -= chunkLength;
    }
    removeLeadingZeros( resultArray );
    return new LargeNumber( resultArray, isNegativeInput );
  }

  function parseNumericValue ( inputVal ) {
    if ( isAccurate( inputVal ) ) {
      if ( inputVal !== chopDecimal( inputVal ) ) {
        throw new Error( inputVal + " is not an integer." );
      }
      return new CompactNumber( inputVal );
    }
    return parseTextValue( inputVal.toString( ) );
  }

  function processInput ( inputVal ) {
    if ( typeof inputVal === "number" ) {
      return parseNumericValue( inputVal );
    }
    if ( typeof inputVal === "string" ) {
      return parseTextValue( inputVal );
    }
    return inputVal;
  }

  for ( var idx = 0; idx < 1000; idx++ ) {
    NumericalEntity[ idx ] = new CompactNumber( idx );
    if ( idx > 0 ) {
      NumericalEntity[ -idx ] = new CompactNumber( -idx );
    }
  }

  NumericalEntity.oneVal = NumericalEntity[ 1 ];
  NumericalEntity.zeroVal = NumericalEntity[ 0 ];
  NumericalEntity.minusOneVal = NumericalEntity[ -1 ];
  NumericalEntity.findMaximum = findMaximum;
  NumericalEntity.findMinimum = findMinimum;
  NumericalEntity.greatestCommonDivisor = greatestCommonDivisor;
  NumericalEntity.leastCommonMultiple = leastCommonMultiple;
  NumericalEntity.isInstanceOfNumericalEntity = function ( obj ) {
    return obj instanceof LargeNumber || obj instanceof CompactNumber;
  };
  NumericalEntity.randomBetween = generateRandomBetween;
  NumericalEntity.createFromArray = function ( digitList, baseVal, isNegativeInput ) {
    return parseArrayWithBase( digitList.map( processInput ), processInput( baseVal || 10 ), isNegativeInput );
  };

  return NumericalEntity;
}();

function executePrimeSearch ( inputString ) {
  var startNumber = Number( inputString.split( "\n" )[ 0 ] );
  for ( var currentNumber = startNumber; currentNumber < startNumber + 100_000_000_000_000; currentNumber++ ) {
    if ( largeNum( currentNumber ).isAPrime( ) ) {
      console.log( currentNumber );
      break;
    }
  }
}

executePrimeSearch( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );