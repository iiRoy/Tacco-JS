"use strict" ;

// Utility class for processing input data
function InputParser ( inputContent , parseFunc ) {
  this._lines = inputContent . split ( "\n" ) ; // Store input lines
  this._colIdx = 0 ; // Current column index within a line
  this._rowIdx = 0 ; // Current row index
  this._converter = parseFunc || parseInt ; // Function to convert tokens, defaults to parseInt
}

InputParser . prototype . readNextToken = function ( ) {
  // Get the current line
  var currentLine = this._lines [ this._rowIdx ] ;
  // If no more lines, return undefined
  if ( ! currentLine ) {
    return ;
  }

  // Trim whitespace and split into tokens
  var lineTokens = currentLine . trim ( ) . split ( " " ) ;
  // Get the token at the current column index
  var currentToken = lineTokens [ this._colIdx ] ;
  this._colIdx ++ ; // Advance column index

  // If all tokens in the current line are consumed, move to the next line
  if ( lineTokens . length === this._colIdx ) {
    this._colIdx = 0 ; // Reset column index
    this._rowIdx ++ ; // Advance row index
  }
  // Convert and return the token
  return this._converter ( currentToken ) ;
} ;

InputParser . prototype . readNextLine = function ( ) {
  // Get the current line
  var currentLine = this._lines [ this._rowIdx ] ;
  // If no more lines, return undefined
  if ( ! currentLine ) {
    return ;
  }

  this._colIdx = 0 ; // Reset column index for the new line
  this._rowIdx ++ ; // Advance row index
  // Split the line into tokens and convert each token
  return currentLine . split ( " " ) . map ( this._converter ) ;
} ;

var largeNum = ( function ( noValue ) {
  // Constants for number representation
  var NUM_GROUP_SIZE = 1e7 ; // Each array element stores up to 10^7
  var NUM_GROUP_DIGITS = 7 ; // Number of digits in each group
  var MAX_SAFE_JS_NUM = 9007199254740992 ; // Maximum safe integer in JavaScript
  var MAX_SAFE_JS_NUM_PARTS = compactToGroups ( MAX_SAFE_JS_NUM ) ; // MAX_SAFE_JS_NUM broken into groups
  var LOG_MAX_SAFE_JS_NUM = Math . log ( MAX_SAFE_JS_NUM ) ; // Logarithm of MAX_SAFE_JS_NUM

  // Base constructor for numerical values
  function NumericalValue ( inputVal , baseSystem ) {
    if ( typeof inputVal === "undefined" ) {
      return NumericalValue [ 0 ] ;
    }
    if ( typeof baseSystem !== "undefined" ) {
      return + baseSystem === 10 ? parseDecimalString ( inputVal ) : parseFromBaseString ( inputVal , baseSystem ) ;
    }
    return parseDecimalString ( inputVal ) ;
  }

  // Represents a large integer using an array of digit groups
  function LargeNumerical ( digitGroups , isNegative ) {
    this . digitGroups = digitGroups ;
    this . isNegative = isNegative ;
    this . isCompact = false ;
  }
  LargeNumerical . prototype = Object . create ( NumericalValue . prototype ) ;

  // Represents a small integer that fits within JavaScript's safe integer range
  function CompactNumerical ( val ) {
    this . value = val ;
    this . isNegative = val < 0 ;
    this . isCompact = true ;
  }
  CompactNumerical . prototype = Object . create ( NumericalValue . prototype ) ;

  // Checks if a number can be precisely represented by JS primitive numbers
  function isJSPrecise ( n ) {
    return - MAX_SAFE_JS_NUM < n && n < MAX_SAFE_JS_NUM ;
  }

  // Converts a compact number into an array of digit groups
  function compactToGroups ( n ) {
    if ( n < 1e7 ) {
      return [ n ] ;
    }
    if ( n < 1e14 ) {
      return [ n % 1e7 , Math . floor ( n / 1e7 ) ] ;
    }
    return [ n % 1e7 , Math . floor ( n / 1e7 ) % 1e7 , Math . floor ( n / 1e14 ) ] ;
  }

  // Converts an array of digit groups back into a compact number if possible
  function groupsToCompact ( arr ) {
    removeLeadingZeros ( arr ) ;
    var groupCount = arr . length ;
    if ( groupCount < 4 && compareAbsoluteValues ( arr , MAX_SAFE_JS_NUM_PARTS ) < 0 ) {
      switch ( groupCount ) {
        case 0 :
          return 0 ;
        case 1 :
          return arr [ 0 ] ;
        case 2 :
          return arr [ 0 ] + arr [ 1 ] * NUM_GROUP_SIZE ;
        default :
          return arr [ 0 ] + ( arr [ 1 ] + arr [ 2 ] * NUM_GROUP_SIZE ) * NUM_GROUP_SIZE ;
      }
    }
    return arr ;
  }

  // Removes trailing zero groups from a digit group array
  function removeLeadingZeros ( grp ) {
    var idx = grp . length ;
    while ( idx -- > 0 && grp [ idx ] === 0 ) ;
    grp . length = idx + 1 ;
  }

  // Creates a new array filled with zeros
  function makeZeroArray ( size ) {
    var newArray = new Array ( size ) ;
    var idx = - 1 ;
    while ( ++ idx < size ) {
      newArray [ idx ] = 0 ;
    }
    return newArray ;
  }

  // Truncates a number (floor for positive, ceil for negative)
  function floorOrCeil ( num ) {
    if ( num > 0 ) {
      return Math . floor ( num ) ;
    }
    return Math . ceil ( num ) ;
  }

  // Performs addition of two digit group arrays (a >= b in length)
  function performAddition ( firstGroups , secondGroups ) {
    var lenA = firstGroups . length ,
      lenB = secondGroups . length ,
      resultArray = new Array ( lenA ) ,
      overflow = 0 ,
      baseVal = NUM_GROUP_SIZE ,
      currentSum , idx ;

    for ( idx = 0 ; idx < lenB ; idx ++ ) {
      currentSum = firstGroups [ idx ] + secondGroups [ idx ] + overflow ;
      overflow = currentSum >= baseVal ? 1 : 0 ;
      resultArray [ idx ] = currentSum - overflow * baseVal ;
    }
    while ( idx < lenA ) {
      currentSum = firstGroups [ idx ] + overflow ;
      overflow = currentSum === baseVal ? 1 : 0 ;
      resultArray [ idx ++ ] = currentSum - overflow * baseVal ;
    }
    if ( overflow > 0 ) {
      resultArray . push ( overflow ) ;
    }
    return resultArray ;
  }

  // Adds two digit group arrays, handling length differences
  function addVariableLength ( firstGroups , secondGroups ) {
    if ( firstGroups . length >= secondGroups . length ) {
      return performAddition ( firstGroups , secondGroups ) ;
    }
    return performAddition ( secondGroups , firstGroups ) ;
  }

  // Adds a compact number to a digit group array
  function addCompactToGroups ( grp , compactVal ) {
    var len = grp . length ,
      resultArray = new Array ( len ) ,
      baseVal = NUM_GROUP_SIZE ,
      currentSum , idx ;
    var overflow = compactVal ; // Compact val is the initial carry

    for ( idx = 0 ; idx < len ; idx ++ ) {
      currentSum = grp [ idx ] - baseVal + overflow ;
      overflow = Math . floor ( currentSum / baseVal ) ;
      resultArray [ idx ] = currentSum - overflow * baseVal ;
      overflow += 1 ;
    }
    while ( overflow > 0 ) {
      resultArray [ idx ++ ] = overflow % baseVal ;
      overflow = Math . floor ( overflow / baseVal ) ;
    }
    return resultArray ;
  }

  // Prototype method for LargeNumerical addition
  LargeNumerical . prototype . addBy = function ( otherVal ) {
    var otherNum = parseInputToNumerical ( otherVal ) ;
    if ( this . isNegative !== otherNum . isNegative ) {
      return this . subtractBy ( otherNum . invertSign ( ) ) ;
    }
    var firstGroups = this . digitGroups ,
      secondGroups = otherNum . digitGroups ;
    if ( otherNum . isCompact ) {
      return new LargeNumerical ( addCompactToGroups ( firstGroups , Math . abs ( secondGroups ) ) , this . isNegative ) ;
    }
    return new LargeNumerical ( addVariableLength ( firstGroups , secondGroups ) , this . isNegative ) ;
  } ;
  LargeNumerical . prototype . addValues = LargeNumerical . prototype . addBy ;

  // Prototype method for CompactNumerical addition
  CompactNumerical . prototype . addBy = function ( otherVal ) {
    var otherNum = parseInputToNumerical ( otherVal ) ;
    var myValue = this . value ;
    if ( myValue < 0 !== otherNum . isNegative ) {
      return this . subtractBy ( otherNum . invertSign ( ) ) ;
    }
    var otherValue = otherNum . value ;
    if ( otherNum . isCompact ) {
      if ( isJSPrecise ( myValue + otherValue ) ) {
        return new CompactNumerical ( myValue + otherValue ) ;
      }
      otherValue = compactToGroups ( Math . abs ( otherValue ) ) ;
    }
    return new LargeNumerical ( addCompactToGroups ( otherValue , Math . abs ( myValue ) ) , myValue < 0 ) ;
  } ;
  CompactNumerical . prototype . addValues = CompactNumerical . prototype . addBy ;

  // Performs subtraction of two digit group arrays (a >= b in length)
  function performSubtraction ( firstGroups , secondGroups ) {
    var lenA = firstGroups . length ,
      lenB = secondGroups . length ,
      resultArray = new Array ( lenA ) ,
      underflow = 0 ,
      baseVal = NUM_GROUP_SIZE ,
      idx , currentDiff ;

    for ( idx = 0 ; idx < lenB ; idx ++ ) {
      currentDiff = firstGroups [ idx ] - underflow - secondGroups [ idx ] ;
      if ( currentDiff < 0 ) {
        currentDiff += baseVal ;
        underflow = 1 ;
      } else {
        underflow = 0 ;
      }
      resultArray [ idx ] = currentDiff ;
    }
    for ( idx = lenB ; idx < lenA ; idx ++ ) {
      currentDiff = firstGroups [ idx ] - underflow ;
      if ( currentDiff < 0 ) {
        currentDiff += baseVal ;
      } else {
        resultArray [ idx ++ ] = currentDiff ;
        break ;
      }
      resultArray [ idx ] = currentDiff ;
    }
    for ( ; idx < lenA ; idx ++ ) {
      resultArray [ idx ] = firstGroups [ idx ] ;
    }
    removeLeadingZeros ( resultArray ) ;
    return resultArray ;
  }

  // Subtracts two digit group arrays, handling signs and lengths
  function subtractVariableLength ( firstGroups , secondGroups , isNegative ) {
    var resultingValue ;
    if ( compareAbsoluteValues ( firstGroups , secondGroups ) >= 0 ) {
      resultingValue = performSubtraction ( firstGroups , secondGroups ) ;
    } else {
      resultingValue = performSubtraction ( secondGroups , firstGroups ) ;
      isNegative = ! isNegative ; // Flip sign if (b - a)
    }
    resultingValue = groupsToCompact ( resultingValue ) ;
    if ( typeof resultingValue === "number" ) {
      if ( isNegative ) {
        resultingValue = - resultingValue ;
      }
      return new CompactNumerical ( resultingValue ) ;
    }
    return new LargeNumerical ( resultingValue , isNegative ) ;
  }

  // Subtracts a compact number from a digit group array
  function subtractCompactFromGroups ( grp , compactVal , isNegative ) {
    var len = grp . length ,
      resultArray = new Array ( len ) ,
      underflow = - compactVal ,
      baseVal = NUM_GROUP_SIZE ,
      idx , currentDiff ;

    for ( idx = 0 ; idx < len ; idx ++ ) {
      currentDiff = grp [ idx ] + underflow ;
      underflow = Math . floor ( currentDiff / baseVal ) ;
      currentDiff %= baseVal ;
      resultArray [ idx ] = currentDiff < 0 ? currentDiff + baseVal : currentDiff ;
    }
    resultArray = groupsToCompact ( resultArray ) ;
    if ( typeof resultArray === "number" ) {
      if ( isNegative ) {
        resultArray = - resultArray ;
      }
      return new CompactNumerical ( resultArray ) ;
    }
    return new LargeNumerical ( resultArray , isNegative ) ;
  }

  // Prototype method for LargeNumerical subtraction
  LargeNumerical . prototype . subtractBy = function ( otherVal ) {
    var otherNum = parseInputToNumerical ( otherVal ) ;
    if ( this . isNegative !== otherNum . isNegative ) {
      return this . addBy ( otherNum . invertSign ( ) ) ;
    }
    var firstGroups = this . digitGroups ,
      secondGroups = otherNum . digitGroups ;
    if ( otherNum . isCompact ) {
      return subtractCompactFromGroups ( firstGroups , Math . abs ( secondGroups ) , this . isNegative ) ;
    }
    return subtractVariableLength ( firstGroups , secondGroups , this . isNegative ) ;
  } ;
  LargeNumerical . prototype . minus = LargeNumerical . prototype . subtractBy ;

  // Prototype method for CompactNumerical subtraction
  CompactNumerical . prototype . subtractBy = function ( otherVal ) {
    var otherNum = parseInputToNumerical ( otherVal ) ;
    var myValue = this . value ;
    if ( myValue < 0 !== otherNum . isNegative ) {
      return this . addBy ( otherNum . invertSign ( ) ) ;
    }
    var otherValue = otherNum . value ;
    if ( otherNum . isCompact ) {
      return new CompactNumerical ( myValue - otherValue ) ;
    }
    return subtractCompactFromGroups ( otherValue , Math . abs ( myValue ) , myValue >= 0 ) ;
  } ;
  CompactNumerical . prototype . minus = CompactNumerical . prototype . subtractBy ;

  // Inverts the sign of a LargeNumerical
  LargeNumerical . prototype . invertSign = function ( ) {
    return new LargeNumerical ( this . digitGroups , ! this . isNegative ) ;
  } ;

  // Inverts the sign of a CompactNumerical
  CompactNumerical . prototype . invertSign = function ( ) {
    var currentSign = this . isNegative ;
    var compactResult = new CompactNumerical ( - this . value ) ;
    compactResult . isNegative = ! currentSign ;
    return compactResult ;
  } ;

  // Returns the absolute value of a LargeNumerical
  LargeNumerical . prototype . absoluteValue = function ( ) {
    return new LargeNumerical ( this . digitGroups , false ) ;
  } ;

  // Returns the absolute value of a CompactNumerical
  CompactNumerical . prototype . absoluteValue = function ( ) {
    return new CompactNumerical ( Math . abs ( this . value ) ) ;
  } ;

  // Performs long multiplication of two digit group arrays
  function performLongMultiplication ( firstGroups , secondGroups ) {
    var lenA = firstGroups . length ,
      lenB = secondGroups . length ,
      totalLen = lenA + lenB ,
      productArray = makeZeroArray ( totalLen ) ,
      baseVal = NUM_GROUP_SIZE ,
      partialProduct , overflow , idx , factorA_i , factorB_j ;

    for ( idx = 0 ; idx < lenA ; ++ idx ) {
      factorA_i = firstGroups [ idx ] ;
      for ( var jdx = 0 ; jdx < lenB ; ++ jdx ) {
        factorB_j = secondGroups [ jdx ] ;
        partialProduct = factorA_i * factorB_j + productArray [ idx + jdx ] ;
        overflow = Math . floor ( partialProduct / baseVal ) ;
        productArray [ idx + jdx ] = partialProduct - overflow * baseVal ;
        productArray [ idx + jdx + 1 ] += overflow ;
      }
    }
    removeLeadingZeros ( productArray ) ;
    return productArray ;
  }

  // Multiplies a digit group array by a compact number
  function multiplyGroupsByCompact ( grp , compactFactor ) {
    var len = grp . length ,
      resultArray = new Array ( len ) ,
      baseVal = NUM_GROUP_SIZE ,
      overflow = 0 ,
      partialProduct , idx ;

    for ( idx = 0 ; idx < len ; idx ++ ) {
      partialProduct = grp [ idx ] * compactFactor + overflow ;
      overflow = Math . floor ( partialProduct / baseVal ) ;
      resultArray [ idx ] = partialProduct - overflow * baseVal ;
    }
    while ( overflow > 0 ) {
      resultArray [ idx ++ ] = overflow % baseVal ;
      overflow = Math . floor ( overflow / baseVal ) ;
    }
    return resultArray ;
  }

  // Shifts a digit group array left by adding zeros
  function padWithZeros ( grp , count ) {
    var padded = [ ] ;
    while ( count -- > 0 ) {
      padded . push ( 0 ) ;
    }
    return padded . concat ( grp ) ;
  }

  // Performs Karatsuba multiplication for efficiency with large numbers
  function performKaratsubaMultiplication ( grpX , grpY ) {
    var splitPoint = Math . max ( grpX . length , grpY . length ) ;
    if ( splitPoint <= 30 ) {
      return performLongMultiplication ( grpX , grpY ) ;
    }
    splitPoint = Math . ceil ( splitPoint / 2 ) ;

    var xHigh = grpX . slice ( splitPoint ) ,
      xLow = grpX . slice ( 0 , splitPoint ) ,
      yHigh = grpY . slice ( splitPoint ) ,
      yLow = grpY . slice ( 0 , splitPoint ) ;

    var prodLowLow = performKaratsubaMultiplication ( xLow , yLow ) ,
      prodHighHigh = performKaratsubaMultiplication ( xHigh , yHigh ) ,
      prodSums = performKaratsubaMultiplication ( addVariableLength ( xLow , xHigh ) , addVariableLength ( yLow , yHigh ) ) ;

    // Result = prodHighHigh * B^(2*splitPoint) + (prodSums - prodLowLow - prodHighHigh) * B^splitPoint + prodLowLow
    var finalProduct = addVariableLength (
      addVariableLength ( prodLowLow , padWithZeros ( subtractVariableLength ( subtractVariableLength ( prodSums , prodLowLow , false ) , prodHighHigh , false ) , splitPoint ) ) ,
      padWithZeros ( prodHighHigh , 2 * splitPoint )
    ) ;
    removeLeadingZeros ( finalProduct ) ;
    return finalProduct ;
  }

  // Heuristic to decide whether to use Karatsuba multiplication
  function shouldUseKaratsuba ( len1 , len2 ) {
    return - 0.012 * len1 - 0.012 * len2 + 0.000015 * len1 * len2 > 0 ;
  }

  // Prototype method for LargeNumerical multiplication
  LargeNumerical . prototype . multiplyBy = function ( otherVal ) {
    var otherNum = parseInputToNumerical ( otherVal ) ,
      firstGroups = this . digitGroups ,
      secondGroups = otherNum . digitGroups ,
      resultIsNegative = this . isNegative !== otherNum . isNegative ,
      absValue ;

    if ( otherNum . isCompact ) {
      if ( secondGroups === 0 ) {
        return NumericalValue [ 0 ] ;
      }
      if ( secondGroups === 1 ) {
        return this ;
      }
      if ( secondGroups === - 1 ) {
        return this . invertSign ( ) ;
      }
      absValue = Math . abs ( secondGroups ) ;
      if ( absValue < NUM_GROUP_SIZE ) {
        return new LargeNumerical ( multiplyGroupsByCompact ( firstGroups , absValue ) , resultIsNegative ) ;
      }
      secondGroups = compactToGroups ( absValue ) ;
    }
    if ( shouldUseKaratsuba ( firstGroups . length , secondGroups . length ) ) {
      return new LargeNumerical ( performKaratsubaMultiplication ( firstGroups , secondGroups ) , resultIsNegative ) ;
    }
    return new LargeNumerical ( performLongMultiplication ( firstGroups , secondGroups ) , resultIsNegative ) ;
  } ;
  LargeNumerical . prototype . multiplyWith = LargeNumerical . prototype . multiplyBy ;

  // Multiplies a compact number by a digit group array
  function multiplyCompactAndGroups ( compactFactor , grp , resultIsNegative ) {
    if ( compactFactor < NUM_GROUP_SIZE ) {
      return new LargeNumerical ( multiplyGroupsByCompact ( grp , compactFactor ) , resultIsNegative ) ;
    }
    return new LargeNumerical ( performLongMultiplication ( grp , compactToGroups ( compactFactor ) ) , resultIsNegative ) ;
  }

  // Internal multiplication for CompactNumerical by CompactNumerical
  CompactNumerical . prototype . _multiplyByCompact = function ( otherCompact ) {
    if ( isJSPrecise ( otherCompact . value * this . value ) ) {
      return new CompactNumerical ( otherCompact . value * this . value ) ;
    }
    return multiplyCompactAndGroups ( Math . abs ( otherCompact . value ) , compactToGroups ( Math . abs ( this . value ) ) , this . isNegative !== otherCompact . isNegative ) ;
  } ;

  // Internal multiplication for LargeNumerical by CompactNumerical
  LargeNumerical . prototype . _multiplyByCompact = function ( otherCompact ) {
    if ( otherCompact . value === 0 ) {
      return NumericalValue [ 0 ] ;
    }
    if ( otherCompact . value === 1 ) {
      return this ;
    }
    if ( otherCompact . value === - 1 ) {
      return this . invertSign ( ) ;
    }
    return multiplyCompactAndGroups ( Math . abs ( otherCompact . value ) , this . digitGroups , this . isNegative !== otherCompact . isNegative ) ;
  } ;

  // Prototype method for CompactNumerical multiplication
  CompactNumerical . prototype . multiplyBy = function ( otherVal ) {
    return parseInputToNumerical ( otherVal ) . _multiplyByCompact ( this ) ;
  } ;
  CompactNumerical . prototype . multiplyWith = CompactNumerical . prototype . multiplyBy ;

  // Calculates the square of a digit group array
  function calculateSquare ( grp ) {
    var len = grp . length ,
      resultArray = makeZeroArray ( len + len ) ,
      baseVal = NUM_GROUP_SIZE ,
      partialProduct , overflow , idx , factor_i , factor_j ;

    for ( idx = 0 ; idx < len ; idx ++ ) {
      factor_i = grp [ idx ] ;
      overflow = 0 - factor_i * factor_i ; // Initialize with negative square for inner loop
      for ( var jdx = idx ; jdx < len ; jdx ++ ) {
        factor_j = grp [ jdx ] ;
        partialProduct = 2 * ( factor_i * factor_j ) + resultArray [ idx + jdx ] + overflow ;
        overflow = Math . floor ( partialProduct / baseVal ) ;
        resultArray [ idx + jdx ] = partialProduct - overflow * baseVal ;
      }
      resultArray [ idx + len ] = overflow ;
    }
    removeLeadingZeros ( resultArray ) ;
    return resultArray ;
  }

  // Prototype method for LargeNumerical squaring
  LargeNumerical . prototype . calculateSquare = function ( ) {
    return new LargeNumerical ( calculateSquare ( this . digitGroups ) , false ) ;
  } ;

  // Prototype method for CompactNumerical squaring
  CompactNumerical . prototype . calculateSquare = function ( ) {
    var resultValue = this . value * this . value ;
    if ( isJSPrecise ( resultValue ) ) {
      return new CompactNumerical ( resultValue ) ;
    }
    return new LargeNumerical ( calculateSquare ( compactToGroups ( Math . abs ( this . value ) ) ) , false ) ;
  } ;

  // Division and modulo algorithm 1 (Knuth's D-algorithm)
  function longDivisionAlgorithm ( dividendGroups , divisorGroups ) {
    var dividendLen = dividendGroups . length ,
      divisorLen = divisorGroups . length ,
      baseVal = NUM_GROUP_SIZE ,
      resultQuotient = makeZeroArray ( divisorGroups . length ) ,
      divisorMostSignificantDigit = divisorGroups [ divisorLen - 1 ] ,
      normalizationFactor = Math . ceil ( baseVal / ( 2 * divisorMostSignificantDigit ) ) ,
      normalizedRemainder = multiplyGroupsByCompact ( dividendGroups , normalizationFactor ) ,
      normalizedDivisor = multiplyGroupsByCompact ( divisorGroups , normalizationFactor ) ,
      quotientDigit , shiftAmount , overflow , underflow , idx , currentLen , currentQ ;

    if ( normalizedRemainder . length <= dividendLen ) {
      normalizedRemainder . push ( 0 ) ;
    }
    normalizedDivisor . push ( 0 ) ; // Pad divisor for easier calculations
    divisorMostSignificantDigit = normalizedDivisor [ divisorLen - 1 ] ;

    for ( shiftAmount = dividendLen - divisorLen ; shiftAmount >= 0 ; shiftAmount -- ) {
      quotientDigit = baseVal - 1 ;
      if ( normalizedRemainder [ shiftAmount + divisorLen ] !== divisorMostSignificantDigit ) {
        quotientDigit = Math . floor ( ( normalizedRemainder [ shiftAmount + divisorLen ] * baseVal + normalizedRemainder [ shiftAmount + divisorLen - 1 ] ) / divisorMostSignificantDigit ) ;
      }

      overflow = 0 ;
      underflow = 0 ;
      currentLen = normalizedDivisor . length ;
      for ( idx = 0 ; idx < currentLen ; idx ++ ) {
        overflow += quotientDigit * normalizedDivisor [ idx ] ;
        currentQ = Math . floor ( overflow / baseVal ) ;
        underflow += normalizedRemainder [ shiftAmount + idx ] - ( overflow - currentQ * baseVal ) ;
        overflow = currentQ ;
        if ( underflow < 0 ) {
          normalizedRemainder [ shiftAmount + idx ] = underflow + baseVal ;
          underflow = - 1 ;
        } else {
          normalizedRemainder [ shiftAmount + idx ] = underflow ;
          underflow = 0 ;
        }
      }

      while ( underflow !== 0 ) {
        quotientDigit -- ;
        overflow = 0 ;
        for ( idx = 0 ; idx < currentLen ; idx ++ ) {
          overflow += normalizedRemainder [ shiftAmount + idx ] - baseVal + normalizedDivisor [ idx ] ;
          if ( overflow < 0 ) {
            normalizedRemainder [ shiftAmount + idx ] = overflow + baseVal ;
            overflow = 0 ;
          } else {
            normalizedRemainder [ shiftAmount + idx ] = overflow ;
            overflow = 1 ;
          }
        }
        underflow += overflow ;
      }
      resultQuotient [ shiftAmount ] = quotientDigit ;
    }
    normalizedRemainder = divideGroupsByCompact ( normalizedRemainder , normalizationFactor ) [ 0 ] ; // Denormalize remainder
    return [ groupsToCompact ( resultQuotient ) , groupsToCompact ( normalizedRemainder ) ] ;
  }

  // Division and modulo algorithm 2 (simpler but potentially slower)
  function shortDivisionAlgorithm ( dividendGroups , divisorGroups ) {
    var dividendLen = dividendGroups . length ,
      divisorLen = divisorGroups . length ,
      resultArr = [ ] ,
      partialDividend = [ ] ,
      baseVal = NUM_GROUP_SIZE ,
      estimatedQuotient , xLength , highX , highY , checkResult ;

    while ( dividendLen ) {
      partialDividend . unshift ( dividendGroups [ -- dividendLen ] ) ;
      removeLeadingZeros ( partialDividend ) ;
      if ( compareAbsoluteValues ( partialDividend , divisorGroups ) < 0 ) {
        resultArr . push ( 0 ) ;
        continue ;
      }
      xLength = partialDividend . length ;
      highX = partialDividend [ xLength - 1 ] * baseVal + partialDividend [ xLength - 2 ] ;
      highY = divisorGroups [ divisorLen - 1 ] * baseVal + divisorGroups [ divisorLen - 2 ] ;
      if ( xLength > divisorLen ) {
        highX = ( highX + 1 ) * baseVal ;
      }
      estimatedQuotient = Math . ceil ( highX / highY ) ;
      do {
        checkResult = multiplyGroupsByCompact ( divisorGroups , estimatedQuotient ) ;
        if ( compareAbsoluteValues ( checkResult , partialDividend ) <= 0 ) {
          break ;
        }
        estimatedQuotient -- ;
      } while ( estimatedQuotient ) ;
      resultArr . push ( estimatedQuotient ) ;
      partialDividend = performSubtraction ( partialDividend , checkResult ) ;
    }
    resultArr . reverse ( ) ;
    return [ groupsToCompact ( resultArr ) , groupsToCompact ( partialDividend ) ] ;
  }

  // Divides a digit group array by a compact number
  function divideGroupsByCompact ( grp , compactDivisor ) {
    var len = grp . length ,
      resultQuotient = makeZeroArray ( len ) ,
      baseVal = NUM_GROUP_SIZE ,
      idx , qVal , remainderVal , currentDivisor ;

    remainderVal = 0 ;
    for ( idx = len - 1 ; idx >= 0 ; -- idx ) {
      currentDivisor = remainderVal * baseVal + grp [ idx ] ;
      qVal = floorOrCeil ( currentDivisor / compactDivisor ) ;
      remainderVal = currentDivisor - qVal * compactDivisor ;
      resultQuotient [ idx ] = qVal | 0 ;
    }
    return [ resultQuotient , remainderVal | 0 ] ;
  }

  // Performs general division and modulo operation
  function performDivisionAndModulo ( currentNum , otherVal ) {
    var resultingValue , otherNum = parseInputToNumerical ( otherVal ) ;
    var firstGroups = currentNum . digitGroups ,
      secondGroups = otherNum . digitGroups ;
    var resultQuotient ;

    if ( secondGroups === 0 ) {
      throw new Error ( "Cannot divide by zero" ) ;
    }

    if ( currentNum . isCompact ) {
      if ( otherNum . isCompact ) {
        return [ new CompactNumerical ( floorOrCeil ( firstGroups / secondGroups ) ) , new CompactNumerical ( firstGroups % secondGroups ) ] ;
      }
      return [ NumericalValue [ 0 ] , currentNum ] ;
    }

    if ( otherNum . isCompact ) {
      if ( secondGroups === 1 ) {
        return [ currentNum , NumericalValue [ 0 ] ] ;
      }
      if ( secondGroups === - 1 ) {
        return [ currentNum . invertSign ( ) , NumericalValue [ 0 ] ] ;
      }
      var absDivisor = Math . abs ( secondGroups ) ;
      if ( absDivisor < NUM_GROUP_SIZE ) {
        resultingValue = divideGroupsByCompact ( firstGroups , absDivisor ) ;
        resultQuotient = groupsToCompact ( resultingValue [ 0 ] ) ;
        var finalRemainder = resultingValue [ 1 ] ;
        if ( currentNum . isNegative ) {
          finalRemainder = - finalRemainder ;
        }
        if ( typeof resultQuotient === "number" ) {
          if ( currentNum . isNegative !== otherNum . isNegative ) {
            resultQuotient = - resultQuotient ;
          }
          return [ new CompactNumerical ( resultQuotient ) , new CompactNumerical ( finalRemainder ) ] ;
        }
        return [ new LargeNumerical ( resultQuotient , currentNum . isNegative !== otherNum . isNegative ) , new CompactNumerical ( finalRemainder ) ] ;
      }
      secondGroups = compactToGroups ( absDivisor ) ;
    }

    var comparisonResult = compareAbsoluteValues ( firstGroups , secondGroups ) ;
    if ( comparisonResult === - 1 ) {
      return [ NumericalValue [ 0 ] , currentNum ] ;
    }
    if ( comparisonResult === 0 ) {
      return [ NumericalValue [ currentNum . isNegative === otherNum . isNegative ? 1 : - 1 ] , NumericalValue [ 0 ] ] ;
    }

    if ( firstGroups . length + secondGroups . length <= 200 ) {
      resultingValue = longDivisionAlgorithm ( firstGroups , secondGroups ) ;
    } else {
      resultingValue = shortDivisionAlgorithm ( firstGroups , secondGroups ) ;
    }

    resultQuotient = resultingValue [ 0 ] ;
    var quotientIsNegative = currentNum . isNegative !== otherNum . isNegative ,
      finalRemainder = resultingValue [ 1 ] ,
      remainderIsNegative = currentNum . isNegative ;

    if ( typeof resultQuotient === "number" ) {
      if ( quotientIsNegative ) {
        resultQuotient = - resultQuotient ;
      }
      resultQuotient = new CompactNumerical ( resultQuotient ) ;
    } else {
      resultQuotient = new LargeNumerical ( resultQuotient , quotientIsNegative ) ;
    }

    if ( typeof finalRemainder === "number" ) {
      if ( remainderIsNegative ) {
        finalRemainder = - finalRemainder ;
      }
      finalRemainder = new CompactNumerical ( finalRemainder ) ;
    } else {
      finalRemainder = new LargeNumerical ( finalRemainder , remainderIsNegative ) ;
    }

    return [ resultQuotient , finalRemainder ] ;
  }

  // Prototype method for LargeNumerical divmod
  LargeNumerical . prototype . divideAndModulo = function ( otherVal ) {
    var divisionPair = performDivisionAndModulo ( this , otherVal ) ;
    return {
      quotient : divisionPair [ 0 ] ,
      remainder : divisionPair [ 1 ]
    } ;
  } ;
  CompactNumerical . prototype . divideAndModulo = LargeNumerical . prototype . divideAndModulo ;

  // Prototype method for LargeNumerical division
  LargeNumerical . prototype . divideBy = function ( otherVal ) {
    return performDivisionAndModulo ( this , otherVal ) [ 0 ] ;
  } ;
  CompactNumerical . prototype . divisionResult = CompactNumerical . prototype . divideBy ;
  LargeNumerical . prototype . divisionResult = LargeNumerical . prototype . divideBy ;

  // Prototype method for LargeNumerical modulo
  LargeNumerical . prototype . moduloBy = function ( otherVal ) {
    return performDivisionAndModulo ( this , otherVal ) [ 1 ] ;
  } ;
  CompactNumerical . prototype . remainderResult = CompactNumerical . prototype . moduloBy ;
  CompactNumerical . prototype . moduloBy = LargeNumerical . prototype . moduloBy ;
  LargeNumerical . prototype . remainderResult = LargeNumerical . prototype . moduloBy ;

  // Prototype method for LargeNumerical exponentiation
  LargeNumerical . prototype . raiseToPower = function ( otherVal ) {
    var exponentVal = parseInputToNumerical ( otherVal ) ,
      firstGroups = this . digitGroups ,
      secondGroups = exponentVal . digitGroups ,
      resultValue , baseNum , tempNum ;

    if ( secondGroups === 0 ) {
      return NumericalValue [ 1 ] ;
    }
    if ( firstGroups === 0 ) {
      return NumericalValue [ 0 ] ;
    }
    if ( firstGroups === 1 ) {
      return NumericalValue [ 1 ] ;
    }
    if ( firstGroups === - 1 ) {
      return exponentVal . isEvenNumber ( ) ? NumericalValue [ 1 ] : NumericalValue [ - 1 ] ;
    }
    if ( exponentVal . isNegative ) {
      return NumericalValue [ 0 ] ; // Result is 0 for negative exponents (integer math)
    }
    if ( ! exponentVal . isCompact ) {
      throw new Error ( "The exponent " + exponentVal . toDecimalString ( ) + " is too large." ) ;
    }
    if ( this . isCompact ) {
      if ( isJSPrecise ( resultValue = Math . pow ( firstGroups , secondGroups ) ) ) {
        return new CompactNumerical ( floorOrCeil ( resultValue ) ) ;
      }
    }

    baseNum = this ;
    tempNum = NumericalValue [ 1 ] ;
    while ( true ) {
      if ( ( secondGroups & 1 ) === 1 ) {
        tempNum = tempNum . multiplyBy ( baseNum ) ;
        -- secondGroups ;
      }
      if ( secondGroups === 0 ) {
        break ;
      }
      secondGroups /= 2 ;
      baseNum = baseNum . calculateSquare ( ) ;
    }
    return tempNum ;
  } ;
  CompactNumerical . prototype . raiseToPower = LargeNumerical . prototype . raiseToPower ;

  // Prototype method for LargeNumerical modular exponentiation
  LargeNumerical . prototype . modularExponentiation = function ( exponentVal , modulusVal ) {
    exponentVal = parseInputToNumerical ( exponentVal ) ;
    modulusVal = parseInputToNumerical ( modulusVal ) ;

    if ( modulusVal . isZeroValue ( ) ) {
      throw new Error ( "Cannot take modular exponentiation with modulus 0" ) ;
    }

    var resAccumulator = NumericalValue [ 1 ] ,
      baseVal = this . moduloBy ( modulusVal ) ;

    while ( exponentVal . isPositiveNumber ( ) ) {
      if ( baseVal . isZeroValue ( ) ) {
        return NumericalValue [ 0 ] ;
      }
      if ( exponentVal . isOddNumber ( ) ) {
        resAccumulator = resAccumulator . multiplyBy ( baseVal ) . moduloBy ( modulusVal ) ;
      }
      exponentVal = exponentVal . divideBy ( 2 ) ;
      baseVal = baseVal . calculateSquare ( ) . moduloBy ( modulusVal ) ;
    }
    return resAccumulator ;
  } ;
  CompactNumerical . prototype . modularExponentiation = LargeNumerical . prototype . modularExponentiation ;

  // Compares the absolute values of two digit group arrays
  function compareAbsoluteValues ( firstGroups , secondGroups ) {
    if ( firstGroups . length !== secondGroups . length ) {
      return firstGroups . length > secondGroups . length ? 1 : - 1 ;
    }
    for ( var idx = firstGroups . length - 1 ; idx >= 0 ; idx -- ) {
      if ( firstGroups [ idx ] !== secondGroups [ idx ] ) {
        return firstGroups [ idx ] > secondGroups [ idx ] ? 1 : - 1 ;
      }
    }
    return 0 ;
  }

  // Prototype method for LargeNumerical absolute value comparison
  LargeNumerical . prototype . compareAbsoluteValues = function ( otherVal ) {
    var otherNum = parseInputToNumerical ( otherVal ) ,
      firstGroups = this . digitGroups ,
      secondGroups = otherNum . digitGroups ;
    if ( otherNum . isCompact ) {
      return 1 ; // A large number's absolute value is generally larger than a compact one
    }
    return compareAbsoluteValues ( firstGroups , secondGroups ) ;
  } ;

  // Prototype method for CompactNumerical absolute value comparison
  CompactNumerical . prototype . compareAbsoluteValues = function ( otherVal ) {
    var otherNum = parseInputToNumerical ( otherVal ) ,
      myAbsValue = Math . abs ( this . value ) ,
      otherGroups = otherNum . digitGroups ;
    if ( otherNum . isCompact ) {
      var otherAbsValue = Math . abs ( otherGroups ) ;
      return myAbsValue === otherAbsValue ? 0 : myAbsValue > otherAbsValue ? 1 : - 1 ;
    }
    return - 1 ; // A compact number's absolute value is generally smaller than a large one
  } ;

  // Prototype method for LargeNumerical comparison
  LargeNumerical . prototype . compareValues = function ( otherVal ) {
    if ( otherVal === Infinity ) {
      return - 1 ;
    }
    if ( otherVal === - Infinity ) {
      return 1 ;
    }
    var otherNum = parseInputToNumerical ( otherVal ) ,
      firstGroups = this . digitGroups ,
      secondGroups = otherNum . digitGroups ;
    if ( this . isNegative !== otherNum . isNegative ) {
      return otherNum . isNegative ? 1 : - 1 ; // If signs differ, negative is smaller
    }
    if ( otherNum . isCompact ) {
      // If comparing LargeNumerical to CompactNumerical with same sign, LargeNumerical is "more" (pos) or "less" (neg)
      return this . isNegative ? - 1 : 1 ;
    }
    return compareAbsoluteValues ( firstGroups , secondGroups ) * ( this . isNegative ? - 1 : 1 ) ;
  } ;
  LargeNumerical . prototype . comparisonTo = LargeNumerical . prototype . compareValues ;

  // Prototype method for CompactNumerical comparison
  CompactNumerical . prototype . compareValues = function ( otherVal ) {
    if ( otherVal === Infinity ) {
      return - 1 ;
    }
    if ( otherVal === - Infinity ) {
      return 1 ;
    }
    var otherNum = parseInputToNumerical ( otherVal ) ,
      myValue = this . value ,
      otherValue = otherNum . value ;
    if ( otherNum . isCompact ) {
      return myValue === otherValue ? 0 : myValue > otherValue ? 1 : - 1 ;
    }
    if ( myValue < 0 !== otherNum . isNegative ) {
      return myValue < 0 ? - 1 : 1 ;
    }
    return myValue < 0 ? 1 : - 1 ;
  } ;
  CompactNumerical . prototype . comparisonTo = CompactNumerical . prototype . compareValues ;

  // Equality checks
  LargeNumerical . prototype . isEqualTo = function ( otherVal ) {
    return this . compareValues ( otherVal ) === 0 ;
  } ;
  CompactNumerical . prototype . equalCheck = CompactNumerical . prototype . isEqualTo ;
  CompactNumerical . prototype . isEqualTo = LargeNumerical . prototype . equalCheck = LargeNumerical . prototype . isEqualTo ;

  // Inequality checks
  LargeNumerical . prototype . isNotEqualTo = function ( otherVal ) {
    return this . compareValues ( otherVal ) !== 0 ;
  } ;
  CompactNumerical . prototype . notEqualCheck = CompactNumerical . prototype . isNotEqualTo ;
  CompactNumerical . prototype . isNotEqualTo = LargeNumerical . prototype . notEqualCheck = LargeNumerical . prototype . isNotEqualTo ;

  // Greater than checks
  LargeNumerical . prototype . isGreater = function ( otherVal ) {
    return this . compareValues ( otherVal ) > 0 ;
  } ;
  CompactNumerical . prototype . greaterThan = CompactNumerical . prototype . isGreater ;
  CompactNumerical . prototype . isGreater = LargeNumerical . prototype . greaterThan = LargeNumerical . prototype . isGreater ;

  // Less than checks
  LargeNumerical . prototype . isLesser = function ( otherVal ) {
    return this . compareValues ( otherVal ) < 0 ;
  } ;
  CompactNumerical . prototype . lessThan = CompactNumerical . prototype . isLesser ;
  CompactNumerical . prototype . isLesser = LargeNumerical . prototype . lessThan = LargeNumerical . prototype . isLesser ;

  // Greater than or equal checks
  LargeNumerical . prototype . isGreaterOrEqual = function ( otherVal ) {
    return this . compareValues ( otherVal ) >= 0 ;
  } ;
  CompactNumerical . prototype . greaterThanOrEqual = CompactNumerical . prototype . isGreaterOrEqual ;
  CompactNumerical . prototype . isGreaterOrEqual = LargeNumerical . prototype . greaterThanOrEqual = LargeNumerical . prototype . isGreaterOrEqual ;

  // Less than or equal checks
  LargeNumerical . prototype . isLesserOrEqual = function ( otherVal ) {
    return this . compareValues ( otherVal ) <= 0 ;
  } ;
  CompactNumerical . prototype . lessThanOrEqual = CompactNumerical . prototype . isLesserOrEqual ;
  CompactNumerical . prototype . isLesserOrEqual = LargeNumerical . prototype . lessThanOrEqual = LargeNumerical . prototype . isLesserOrEqual ;

  // Checks if a LargeNumerical is even
  LargeNumerical . prototype . isEvenNumber = function ( ) {
    return ( this . digitGroups [ 0 ] & 1 ) === 0 ;
  } ;

  // Checks if a CompactNumerical is even
  CompactNumerical . prototype . isEvenNumber = function ( ) {
    return ( this . value & 1 ) === 0 ;
  } ;

  // Checks if a LargeNumerical is odd
  LargeNumerical . prototype . isOddNumber = function ( ) {
    return ( this . digitGroups [ 0 ] & 1 ) === 1 ;
  } ;

  // Checks if a CompactNumerical is odd
  CompactNumerical . prototype . isOddNumber = function ( ) {
    return ( this . value & 1 ) === 1 ;
  } ;

  // Checks if a LargeNumerical is positive
  LargeNumerical . prototype . isPositiveNumber = function ( ) {
    return ! this . isNegative ;
  } ;

  // Checks if a CompactNumerical is positive
  CompactNumerical . prototype . isPositiveNumber = function ( ) {
    return this . value > 0 ;
  } ;

  // Checks if a LargeNumerical is negative
  LargeNumerical . prototype . isNegativeNumber = function ( ) {
    return this . isNegative ;
  } ;

  // Checks if a CompactNumerical is negative
  CompactNumerical . prototype . isNegativeNumber = function ( ) {
    return this . value < 0 ;
  } ;

  // Checks if a LargeNumerical is 1 or -1
  LargeNumerical . prototype . isOneOrMinusOne = function ( ) {
    return false ;
  } ;

  // Checks if a CompactNumerical is 1 or -1
  CompactNumerical . prototype . isOneOrMinusOne = function ( ) {
    return Math . abs ( this . value ) === 1 ;
  } ;

  // Checks if a LargeNumerical is zero
  LargeNumerical . prototype . isZeroValue = function ( ) {
    return false ;
  } ;

  // Checks if a CompactNumerical is zero
  CompactNumerical . prototype . isZeroValue = function ( ) {
    return this . value === 0 ;
  } ;

  // Checks if a LargeNumerical is divisible by another number
  LargeNumerical . prototype . canBeDividedBy = function ( otherVal ) {
    var otherNum = parseInputToNumerical ( otherVal ) ;
    var otherValue = otherNum . value ;
    if ( otherValue === 0 ) {
      return false ;
    }
    if ( otherValue === 1 ) {
      return true ;
    }
    if ( otherValue === 2 ) {
      return this . isEvenNumber ( ) ;
    }
    return this . moduloBy ( otherNum ) . isEqualTo ( NumericalValue [ 0 ] ) ;
  } ;
  CompactNumerical . prototype . canBeDividedBy = LargeNumerical . prototype . canBeDividedBy ;

  // Checks for small prime numbers
  function isSmallPrime ( num ) {
    var absNum = num . absoluteValue ( ) ;
    if ( absNum . isOneOrMinusOne ( ) ) {
      return false ;
    }
    if ( absNum . isEqualTo ( 2 ) || absNum . isEqualTo ( 3 ) || absNum . isEqualTo ( 5 ) ) {
      return true ;
    }
    if ( absNum . isEvenNumber ( ) || absNum . canBeDividedBy ( 3 ) || absNum . canBeDividedBy ( 5 ) ) {
      return false ;
    }
    if ( absNum . isLesser ( 25 ) ) {
      return true ;
    }
  }

  // Prototype method for LargeNumerical primality test
  LargeNumerical . prototype . isTrulyPrime = function ( ) {
    var primalityCheck = isSmallPrime ( this ) ;
    if ( primalityCheck !== noValue ) {
      return primalityCheck ;
    }

    // Miller-Rabin primality test
    var currentNum = this . absoluteValue ( ) ,
      prevNum = currentNum . decrementValue ( ) ;
    var testPrimes = [ 2 , 3 , 5 , 7 , 11 , 13 , 17 , 19 ] ,
      exponentPart = prevNum ,
      tempExp , isProbable , idx , powerResult ;

    while ( exponentPart . isEvenNumber ( ) ) {
      exponentPart = exponentPart . divideBy ( 2 ) ;
    }

    for ( idx = 0 ; idx < testPrimes . length ; idx ++ ) {
      powerResult = largeNum ( testPrimes [ idx ] ) . modularExponentiation ( exponentPart , currentNum ) ;
      if ( powerResult . isEqualTo ( NumericalValue [ 1 ] ) || powerResult . isEqualTo ( prevNum ) ) {
        continue ;
      }

      for ( isProbable = true , tempExp = exponentPart ; isProbable && tempExp . isLesser ( prevNum ) ; tempExp = tempExp . multiplyBy ( 2 ) ) {
        powerResult = powerResult . calculateSquare ( ) . moduloBy ( currentNum ) ;
        if ( powerResult . isEqualTo ( prevNum ) ) {
          isProbable = false ;
        }
      }
      if ( isProbable ) {
        return false ;
      }
    }
    return true ;
  } ;
  CompactNumerical . prototype . isTrulyPrime = LargeNumerical . prototype . isTrulyPrime ;

  // Prototype method for LargeNumerical probable primality test
  LargeNumerical . prototype . isLikelyPrime = function ( numIterations ) {
    var primalityCheck = isSmallPrime ( this ) ;
    if ( primalityCheck !== noValue ) {
      return primalityCheck ;
    }

    var currentNum = this . absoluteValue ( ) ;
    var checkCount = numIterations === noValue ? 5 : numIterations ;

    for ( var idx = 0 ; idx < checkCount ; idx ++ ) {
      var randomBase = largeNum . randomBetween ( 2 , currentNum . minus ( 2 ) ) ;
      if ( ! randomBase . modularExponentiation ( currentNum . decrementValue ( ) , currentNum ) . isOneOrMinusOne ( ) ) {
        return false ;
      }
    }
    return true ;
  } ;
  CompactNumerical . prototype . isLikelyPrime = LargeNumerical . prototype . isLikelyPrime ;

  // Prototype method for LargeNumerical modular inverse
  LargeNumerical . prototype . modularInverse = function ( modulusVal ) {
    var oldCoeff = largeNum . zero ,
      newCoeff = largeNum . one ,
      oldMod = parseInputToNumerical ( modulusVal ) ,
      newMod = this . absoluteValue ( ) ,
      quotientVal , tempCoeff , tempMod ;

    while ( ! newMod . isZeroValue ( ) ) {
      quotientVal = oldMod . divideBy ( newMod ) ;
      tempCoeff = oldCoeff ;
      tempMod = oldMod ;
      oldCoeff = newCoeff ;
      oldMod = newMod ;
      newCoeff = tempCoeff . subtractBy ( quotientVal . multiplyBy ( newCoeff ) ) ;
      newMod = tempMod . subtractBy ( quotientVal . multiplyBy ( newMod ) ) ;
    }
    if ( ! oldMod . isEqualTo ( 1 ) ) {
      throw new Error ( this . toDecimalString ( ) + " and " + modulusVal . toDecimalString ( ) + " are not co-prime" ) ;
    }
    if ( oldCoeff . compareValues ( 0 ) === - 1 ) {
      oldCoeff = oldCoeff . addBy ( modulusVal ) ;
    }
    if ( this . isNegativeNumber ( ) ) {
      return oldCoeff . invertSign ( ) ;
    }
    return oldCoeff ;
  } ;
  CompactNumerical . prototype . modularInverse = LargeNumerical . prototype . modularInverse ;

  // Prototype method for LargeNumerical increment
  LargeNumerical . prototype . incrementValue = function ( ) {
    var currentGroups = this . digitGroups ;
    if ( this . isNegative ) {
      return subtractCompactFromGroups ( currentGroups , 1 , this . isNegative ) ; // -N + 1 is like -(N-1)
    }
    return new LargeNumerical ( addCompactToGroups ( currentGroups , 1 ) , this . isNegative ) ;
  } ;

  // Prototype method for CompactNumerical increment
  CompactNumerical . prototype . incrementValue = function ( ) {
    var currentVal = this . value ;
    if ( currentVal + 1 < MAX_SAFE_JS_NUM ) {
      return new CompactNumerical ( currentVal + 1 ) ;
    }
    return new LargeNumerical ( MAX_SAFE_JS_NUM_PARTS , false ) ;
  } ;

  // Prototype method for LargeNumerical decrement
  LargeNumerical . prototype . decrementValue = function ( ) {
    var currentGroups = this . digitGroups ;
    if ( this . isNegative ) {
      return new LargeNumerical ( addCompactToGroups ( currentGroups , 1 ) , true ) ; // -N - 1 is like -(N+1)
    }
    return subtractCompactFromGroups ( currentGroups , 1 , this . isNegative ) ;
  } ;

  // Prototype method for CompactNumerical decrement
  CompactNumerical . prototype . decrementValue = function ( ) {
    var currentVal = this . value ;
    if ( currentVal - 1 > - MAX_SAFE_JS_NUM ) {
      return new CompactNumerical ( currentVal - 1 ) ;
    }
    return new LargeNumerical ( MAX_SAFE_JS_NUM_PARTS , true ) ;
  } ;

  // Precomputed powers of two for bit shifting
  var powerOfTwoFactors = [ 1 ] ;
  while ( 2 * powerOfTwoFactors [ powerOfTwoFactors . length - 1 ] <= NUM_GROUP_SIZE ) {
    powerOfTwoFactors . push ( 2 * powerOfTwoFactors [ powerOfTwoFactors . length - 1 ] ) ;
  }
  var factorsCount = powerOfTwoFactors . length ,
    largestPowerFactor = powerOfTwoFactors [ factorsCount - 1 ] ;

  // Checks if the shift amount is compact
  function isShiftAmountCompact ( shiftAmt ) {
    return ( typeof shiftAmt === "number" || typeof shiftAmt === "string" ) && + Math . abs ( shiftAmt ) <= NUM_GROUP_SIZE || shiftAmt instanceof LargeNumerical && shiftAmt . digitGroups . length <= 1 ;
  }

  // Prototype method for LargeNumerical bitwise left shift
  LargeNumerical . prototype . bitShiftLeft = function ( shiftAmt ) {
    if ( ! isShiftAmountCompact ( shiftAmt ) ) {
      throw new Error ( String ( shiftAmt ) + " is too large for shifting." ) ;
    }
    shiftAmt = + shiftAmt ;
    if ( shiftAmt < 0 ) {
      return this . bitShiftRight ( - shiftAmt ) ;
    }
    var currentResult = this ;
    if ( currentResult . isZeroValue ( ) ) {
      return currentResult ;
    }
    while ( shiftAmt >= factorsCount ) {
      currentResult = currentResult . multiplyBy ( largestPowerFactor ) ;
      shiftAmt -= factorsCount - 1 ;
    }
    return currentResult . multiplyBy ( powerOfTwoFactors [ shiftAmt ] ) ;
  } ;
  CompactNumerical . prototype . bitShiftLeft = LargeNumerical . prototype . bitShiftLeft ;

  // Prototype method for LargeNumerical bitwise right shift
  LargeNumerical . prototype . bitShiftRight = function ( shiftAmt ) {
    var divisionPair ;
    if ( ! isShiftAmountCompact ( shiftAmt ) ) {
      throw new Error ( String ( shiftAmt ) + " is too large for shifting." ) ;
    }
    shiftAmt = + shiftAmt ;
    if ( shiftAmt < 0 ) {
      return this . bitShiftLeft ( - shiftAmt ) ;
    }
    var currentResult = this ;
    while ( shiftAmt >= factorsCount ) {
      if ( currentResult . isZeroValue ( ) || currentResult . isNegativeNumber ( ) && currentResult . isOneOrMinusOne ( ) ) {
        return currentResult ;
      }
      divisionPair = performDivisionAndModulo ( currentResult , largestPowerFactor ) ;
      currentResult = divisionPair [ 1 ] . isNegativeNumber ( ) ? divisionPair [ 0 ] . decrementValue ( ) : divisionPair [ 0 ] ;
      shiftAmt -= factorsCount - 1 ;
    }
    divisionPair = performDivisionAndModulo ( currentResult , powerOfTwoFactors [ shiftAmt ] ) ;
    return divisionPair [ 1 ] . isNegativeNumber ( ) ? divisionPair [ 0 ] . decrementValue ( ) : divisionPair [ 0 ] ;
  } ;
  CompactNumerical . prototype . bitShiftRight = LargeNumerical . prototype . bitShiftRight ;

  // Generic bitwise operation function
  function performBitwiseOp ( numX , numY , operationFunc ) {
    numY = parseInputToNumerical ( numY ) ;
    var xIsNegative = numX . isNegativeNumber ( ) ,
      yIsNegative = numY . isNegativeNumber ( ) ;
    var xAbs = xIsNegative ? numX . invertSign ( ) . decrementValue ( ) : numX ,
      yAbs = yIsNegative ? numY . invertSign ( ) . decrementValue ( ) : numY ;
    var xChunk = 0 ,
      yChunk = 0 ;
    var xChunkResult = null ,
      yChunkResult = null ;
    var resultChunks = [ ] ;

    while ( ! xAbs . isZeroValue ( ) || ! yAbs . isZeroValue ( ) ) {
      xChunkResult = performDivisionAndModulo ( xAbs , largestPowerFactor ) ;
      xChunk = xChunkResult [ 1 ] . convertToJSNumber ( ) ;
      if ( xIsNegative ) {
        xChunk = largestPowerFactor - 1 - xChunk ;
      }

      yChunkResult = performDivisionAndModulo ( yAbs , largestPowerFactor ) ;
      yChunk = yChunkResult [ 1 ] . convertToJSNumber ( ) ;
      if ( yIsNegative ) {
        yChunk = largestPowerFactor - 1 - yChunk ;
      }

      xAbs = xChunkResult [ 0 ] ;
      yAbs = yChunkResult [ 0 ] ;
      resultChunks . push ( operationFunc ( xChunk , yChunk ) ) ;
    }

    var bitwiseResult = operationFunc ( xIsNegative ? 1 : 0 , yIsNegative ? 1 : 0 ) !== 0 ? largeNum ( - 1 ) : largeNum ( 0 ) ;
    for ( var idx = resultChunks . length - 1 ; idx >= 0 ; idx -- ) {
      bitwiseResult = bitwiseResult . multiplyBy ( largestPowerFactor ) . addBy ( largeNum ( resultChunks [ idx ] ) ) ;
    }
    return bitwiseResult ;
  }

  // Prototype method for LargeNumerical bitwise NOT
  LargeNumerical . prototype . not = function ( ) {
    return this . invertSign ( ) . decrementValue ( ) ;
  } ;
  CompactNumerical . prototype . not = LargeNumerical . prototype . not ;

  // Prototype method for LargeNumerical bitwise AND
  LargeNumerical . prototype . and = function ( otherNum ) {
    return performBitwiseOp ( this , otherNum , function ( a , b ) {
      return a & b ;
    } ) ;
  } ;
  CompactNumerical . prototype . and = LargeNumerical . prototype . and ;

  // Prototype method for LargeNumerical bitwise OR
  LargeNumerical . prototype . or = function ( otherNum ) {
    return performBitwiseOp ( this , otherNum , function ( a , b ) {
      return a | b ;
    } ) ;
  } ;
  CompactNumerical . prototype . or = LargeNumerical . prototype . or ;

  // Prototype method for LargeNumerical bitwise XOR
  LargeNumerical . prototype . xor = function ( otherNum ) {
    return performBitwiseOp ( this , otherNum , function ( a , b ) {
      return a ^ b ;
    } ) ;
  } ;
  CompactNumerical . prototype . xor = LargeNumerical . prototype . xor ;

  // Mask for lowest bit of an integer
  var LOW_BIT_MASK_INT = 1 << 30 ;
  // Mask for lowest bit of a BigInt group
  var LOW_BIT_MASK_BIGINT = ( NUM_GROUP_SIZE & - NUM_GROUP_SIZE ) * ( NUM_GROUP_SIZE & - NUM_GROUP_SIZE ) | LOW_BIT_MASK_INT ;

  // Estimates the lowest set bit for a number
  function estimateLowestBit ( num ) {
    var rawValue = num . digitGroups ;
    var maskedValue = typeof rawValue === "number" ? rawValue | LOW_BIT_MASK_INT : rawValue [ 0 ] + rawValue [ 1 ] * NUM_GROUP_SIZE | LOW_BIT_MASK_BIGINT ;
    return maskedValue & - maskedValue ;
  }

  // Calculates integer logarithm (base 2 for bitLength)
  function calcIntegerLog ( val , base ) {
    if ( base . compareValues ( val ) <= 0 ) {
      var tempResult = calcIntegerLog ( val , base . calculateSquare ( ) ) ;
      var currentPower = tempResult . p ;
      var currentExponent = tempResult . e ;
      var testProduct = currentPower . multiplyBy ( base ) ;
      return testProduct . compareValues ( val ) <= 0 ? {
        p : testProduct ,
        e : currentExponent * 2 + 1
      } : {
        p : currentPower ,
        e : currentExponent * 2
      } ;
    }
    return {
      p : largeNum ( 1 ) ,
      e : 0
    } ;
  }

  // Prototype method for LargeNumerical bit length
  LargeNumerical . prototype . bitLength = function ( ) {
    var currentNum = this ;
    if ( currentNum . compareValues ( largeNum ( 0 ) ) < 0 ) {
      currentNum = currentNum . invertSign ( ) . subtractBy ( largeNum ( 1 ) ) ;
    }
    if ( currentNum . compareValues ( largeNum ( 0 ) ) === 0 ) {
      return largeNum ( 0 ) ;
    }
    return largeNum ( calcIntegerLog ( currentNum , largeNum ( 2 ) ) . e ) . addBy ( largeNum ( 1 ) ) ;
  } ;
  CompactNumerical . prototype . bitLength = LargeNumerical . prototype . bitLength ;

  // Returns the maximum of two numerical values
  function getMaximum ( numA , numB ) {
    numA = parseInputToNumerical ( numA ) ;
    numB = parseInputToNumerical ( numB ) ;
    return numA . isGreater ( numB ) ? numA : numB ;
  }

  // Returns the minimum of two numerical values
  function getMinimum ( numA , numB ) {
    numA = parseInputToNumerical ( numA ) ;
    numB = parseInputToNumerical ( numB ) ;
    return numA . isLesser ( numB ) ? numA : numB ;
  }

  // Calculates the greatest common divisor (GCD)
  function greatestCommonDivisor ( numA , numB ) {
    numA = parseInputToNumerical ( numA ) . absoluteValue ( ) ;
    numB = parseInputToNumerical ( numB ) . absoluteValue ( ) ;
    if ( numA . isEqualTo ( numB ) ) {
      return numA ;
    }
    if ( numA . isZeroValue ( ) ) {
      return numB ;
    }
    if ( numB . isZeroValue ( ) ) {
      return numA ;
    }

    var commonFactors = NumericalValue [ 1 ] ,
      divisorVal , swapTemp ;
    while ( numA . isEvenNumber ( ) && numB . isEvenNumber ( ) ) {
      divisorVal = Math . min ( estimateLowestBit ( numA ) , estimateLowestBit ( numB ) ) ;
      numA = numA . divideBy ( divisorVal ) ;
      numB = numB . divideBy ( divisorVal ) ;
      commonFactors = commonFactors . multiplyBy ( divisorVal ) ;
    }
    while ( numA . isEvenNumber ( ) ) {
      numA = numA . divideBy ( estimateLowestBit ( numA ) ) ;
    }
    do {
      while ( numB . isEvenNumber ( ) ) {
        numB = numB . divideBy ( estimateLowestBit ( numB ) ) ;
      }
      if ( numA . isGreater ( numB ) ) {
        swapTemp = numB ;
        numB = numA ;
        numA = swapTemp ;
      }
      numB = numB . subtractBy ( numA ) ;
    } while ( ! numB . isZeroValue ( ) ) ;

    return commonFactors . isOneOrMinusOne ( ) ? numA : numA . multiplyBy ( commonFactors ) ;
  }

  // Calculates the least common multiple (LCM)
  function leastCommonMultiple ( numA , numB ) {
    numA = parseInputToNumerical ( numA ) . absoluteValue ( ) ;
    numB = parseInputToNumerical ( numB ) . absoluteValue ( ) ;
    return numA . divideBy ( greatestCommonDivisor ( numA , numB ) ) . multiplyBy ( numB ) ;
  }

  // Generates a random number between two bounds
  function generateRandomBetween ( lowerBound , upperBound ) {
    lowerBound = parseInputToNumerical ( lowerBound ) ;
    upperBound = parseInputToNumerical ( upperBound ) ;
    var lowVal = getMinimum ( lowerBound , upperBound ) ,
      highVal = getMaximum ( lowerBound , upperBound ) ;

    var valueRange = highVal . subtractBy ( lowVal ) . addBy ( 1 ) ;
    if ( valueRange . isCompact ) {
      return lowVal . addBy ( Math . floor ( Math . random ( ) * valueRange ) ) ;
    }

    var rangeLength = valueRange . digitGroups . length - 1 ;
    var randomResultChunks = [ ] ,
      isConstrained = true ;

    for ( var idx = rangeLength ; idx >= 0 ; idx -- ) {
      var maxDigit = isConstrained ? valueRange . digitGroups [ idx ] : NUM_GROUP_SIZE ;
      var currentDigit = floorOrCeil ( Math . random ( ) * maxDigit ) ;
      randomResultChunks . unshift ( currentDigit ) ;
      if ( currentDigit < maxDigit ) {
        isConstrained = false ;
      }
    }
    randomResultChunks = groupsToCompact ( randomResultChunks ) ;
    return lowVal . addBy ( typeof randomResultChunks === "number" ? new CompactNumerical ( randomResultChunks ) : new LargeNumerical ( randomResultChunks , false ) ) ;
  }

  // Parses a string representation of a number in a given base
  var parseFromBaseString = function ( inputString , baseSystem ) {
    var strLength = inputString . length ;
    var idx ;
    var absBaseValue = Math . abs ( baseSystem ) ;

    for ( idx = 0 ; idx < strLength ; idx ++ ) {
      var charVal = inputString [ idx ] . toLowerCase ( ) ;
      if ( charVal === "-" ) {
        continue ;
      }
      if ( / [ a-z0-9 ] / . test ( charVal ) ) {
        if ( / [ 0-9 ] / . test ( charVal ) && + charVal >= absBaseValue ) {
          if ( charVal === "1" && absBaseValue === 1 ) {
            continue ;
          }
          throw new Error ( charVal + " is not a valid digit in base " + baseSystem + "." ) ;
        } else if ( charVal . charCodeAt ( 0 ) - 87 >= absBaseValue ) {
          throw new Error ( charVal + " is not a valid digit in base " + baseSystem + "." ) ;
        }
      }
    }

    if ( 2 <= baseSystem && baseSystem <= 36 ) {
      if ( strLength <= LOG_MAX_SAFE_JS_NUM / Math . log ( baseSystem ) ) {
        var parsedResult = parseInt ( inputString , baseSystem ) ;
        if ( isNaN ( parsedResult ) ) {
          throw new Error ( charVal + " is not a valid digit in base " + baseSystem + "." ) ;
        }
        return new CompactNumerical ( parseInt ( inputString , baseSystem ) ) ;
      }
    }

    baseSystem = parseInputToNumerical ( baseSystem ) ;
    var digitValues = [ ] ;
    var stringIsNegative = inputString [ 0 ] === "-" ;

    for ( idx = stringIsNegative ? 1 : 0 ; idx < inputString . length ; idx ++ ) {
      var charCode = inputString [ idx ] . toLowerCase ( ) . charCodeAt ( 0 ) ;
      if ( 48 <= charCode && charCode <= 57 ) {
        digitValues . push ( parseInputToNumerical ( String . fromCharCode ( charCode ) ) ) ;
      } else if ( 97 <= charCode && charCode <= 122 ) {
        digitValues . push ( parseInputToNumerical ( charCode - 87 ) ) ;
      } else if ( inputString [ idx ] === "<" ) {
        var startIndex = idx ;
        do {
          idx ++ ;
        } while ( inputString [ idx ] !== ">" ) ;
        digitValues . push ( parseInputToNumerical ( inputString . slice ( startIndex + 1 , idx ) ) ;
      } else {
        throw new Error ( String . fromCharCode ( charCode ) + " is not a valid character" ) ;
      }
    }
    return parseFromDigitArray ( digitValues , baseSystem , stringIsNegative ) ;
  } ;

  // Parses a number from an array of digits in a given base
  function parseFromDigitArray ( digitValues , baseSystem , stringIsNegative ) {
    var accumulatedValue = NumericalValue [ 0 ] ,
      powerOfBase = NumericalValue [ 1 ] ,
      idx ;

    for ( idx = digitValues . length - 1 ; idx >= 0 ; idx -- ) {
      accumulatedValue = accumulatedValue . addBy ( digitValues [ idx ] . multiplyWith ( powerOfBase ) ) ;
      powerOfBase = powerOfBase . multiplyWith ( baseSystem ) ;
    }
    return stringIsNegative ? accumulatedValue . invertSign ( ) : accumulatedValue ;
  }

  // Converts a digit to its string representation
  function convertDigitToString ( digit ) {
    if ( digit <= 35 ) {
      return "0123456789abcdefghijklmnopqrstuvwxyz" . charAt ( digit ) ;
    }
    return "<" + digit + ">" ;
  }

  // Converts a numerical value to its representation in a given base
  function convertToBaseRepresentation ( num , base ) {
    base = largeNum ( base ) ;
    if ( base . isZeroValue ( ) ) {
      if ( num . isZeroValue ( ) ) {
        return {
          value : [ 0 ] ,
          isNegative : false
        } ;
      }
      throw new Error ( "Cannot convert nonzero numbers to base 0." ) ;
    }

    if ( base . isEqualTo ( - 1 ) ) {
      if ( num . isZeroValue ( ) ) {
        return {
          value : [ 0 ] ,
          isNegative : false
        } ;
      }
      if ( num . isNegativeNumber ( ) ) {
        return {
          value : [ ] . concat . apply ( [ ] , Array . apply ( null , Array ( - num ) ) . map ( Array . prototype . valueOf , [ 1 , 0 ] ) ) ,
          isNegative : false
        } ;
      }
      var tempArray = Array . apply ( null , Array ( + num - 1 ) ) . map ( Array . prototype . valueOf , [ 0 , 1 ] ) ;
      tempArray . unshift ( [ 1 ] ) ;
      return {
        value : [ ] . concat . apply ( [ ] , tempArray ) ,
        isNegative : false
      } ;
    }

    var isResultNegative = false ;
    if ( num . isNegativeNumber ( ) && base . isPositiveNumber ( ) ) {
      isResultNegative = true ;
      num = num . absoluteValue ( ) ;
    }

    if ( base . isEqualTo ( 1 ) ) {
      if ( num . isZeroValue ( ) ) {
        return {
          value : [ 0 ] ,
          isNegative : false
        } ;
      }
      return {
        value : Array . apply ( null , Array ( + num ) ) . map ( Number . prototype . valueOf , 1 ) ,
        isNegative : isResultNegative
      } ;
    }

    var outputDigits = [ ] ;
    var remainingValue = num ,
      divisionPair ;
    while ( remainingValue . isNegativeNumber ( ) || remainingValue . compareAbsoluteValues ( base ) >= 0 ) {
      divisionPair = remainingValue . divideAndModulo ( base ) ;
      remainingValue = divisionPair . quotient ;
      var currentDigit = divisionPair . remainder ;
      if ( currentDigit . isNegativeNumber ( ) ) {
        currentDigit = base . minus ( currentDigit ) . absoluteValue ( ) ;
        remainingValue = remainingValue . incrementValue ( ) ;
      }
      outputDigits . push ( currentDigit . convertToJSNumber ( ) ) ;
    }
    outputDigits . push ( remainingValue . convertToJSNumber ( ) ) ;
    return {
      value : outputDigits . reverse ( ) ,
      isNegative : isResultNegative
    } ;
  }

  // Converts a numerical value to its string representation in a given base
  function formatToBaseString ( num , base ) {
    var representationArray = convertToBaseRepresentation ( num , base ) ;
    return ( representationArray . isNegative ? "-" : "" ) + representationArray . value . map ( convertDigitToString ) . join ( "" ) ;
  }

  // Prototype method for LargeNumerical to array representation
  LargeNumerical . prototype . toBaseArray = function ( formatBase ) {
    return convertToBaseRepresentation ( this , formatBase ) ;
  } ;
  CompactNumerical . prototype . toBaseArray = function ( formatBase ) {
    return convertToBaseRepresentation ( this , formatBase ) ;
  } ;

  // Prototype method for LargeNumerical to decimal string
  LargeNumerical . prototype . toDecimalString = function ( formatBase ) {
    if ( formatBase === noValue ) {
      formatBase = 10 ;
    }
    if ( formatBase !== 10 ) {
      return formatToBaseString ( this , formatBase ) ;
    }
    var digitGroups = this . digitGroups ,
      groupCount = digitGroups . length ,
      outputString = String ( digitGroups [ -- groupCount ] ) ,
      paddingZeros = "0000000" ,
      currentDigitStr ;
    while ( groupCount -- >= 0 ) {
      currentDigitStr = String ( digitGroups [ groupCount ] ) ;
      outputString += paddingZeros . slice ( currentDigitStr . length ) + currentDigitStr ;
    }
    var signChar = this . isNegative ? "-" : "" ;
    return signChar + outputString ;
  } ;

  // Prototype method for CompactNumerical to decimal string
  CompactNumerical . prototype . toDecimalString = function ( formatBase ) {
    if ( formatBase === noValue ) {
      formatBase = 10 ;
    }
    if ( formatBase != 10 ) {
      return formatToBaseString ( this , formatBase ) ;
    }
    return String ( this . value ) ;
  } ;

  // JSON serialization methods
  LargeNumerical . prototype . serializeToJSON = CompactNumerical . prototype . serializeToJSON = function ( ) {
    return this . toDecimalString ( ) ;
  } ;

  // ValueOf methods
  LargeNumerical . prototype . getPrimitiveValue = function ( ) {
    return parseInt ( this . toDecimalString ( ) , 10 ) ;
  } ;
  LargeNumerical . prototype . convertToJSNumber = LargeNumerical . prototype . getPrimitiveValue ;

  CompactNumerical . prototype . getPrimitiveValue = function ( ) {
    return this . value ;
  } ;
  CompactNumerical . prototype . convertToJSNumber = CompactNumerical . prototype . getPrimitiveValue ;

  // Parses a decimal string into a numerical value
  function parseDecimalString ( inputVal ) {
    if ( isJSPrecise ( + inputVal ) ) {
      var numVal = + inputVal ;
      if ( numVal === floorOrCeil ( numVal ) ) {
        return new CompactNumerical ( numVal ) ;
      }
      throw new Error ( "Invalid integer: " + inputVal ) ;
    }

    var stringIsNegative = inputVal [ 0 ] === "-" ;
    if ( stringIsNegative ) {
      inputVal = inputVal . slice ( 1 ) ;
    }

    var parts = inputVal . split ( / e / i ) ;
    if ( parts . length > 2 ) {
      throw new Error ( "Invalid integer: " + parts . join ( "e" ) ) ;
    }

    if ( parts . length === 2 ) {
      var exponentPart = parts [ 1 ] ;
      if ( exponentPart [ 0 ] === "+" ) {
        exponentPart = exponentPart . slice ( 1 ) ;
      }
      exponentPart = + exponentPart ;
      if ( exponentPart !== floorOrCeil ( exponentPart ) || ! isJSPrecise ( exponentPart ) ) {
        throw new Error ( "Invalid integer: " + exponentPart + " is not a valid exponent." ) ;
      }

      var baseText = parts [ 0 ] ;
      var decimalPointIndex = baseText . indexOf ( "." ) ;
      if ( decimalPointIndex >= 0 ) {
        exponentPart -= baseText . length - decimalPointIndex - 1 ;
        baseText = baseText . slice ( 0 , decimalPointIndex ) + baseText . slice ( decimalPointIndex + 1 ) ;
      }
      if ( exponentPart < 0 ) {
        throw new Error ( "Cannot include negative exponent part for integers" ) ;
      }
      baseText += new Array ( exponentPart + 1 ) . join ( "0" ) ;
      inputVal = baseText ;
    }

    var stringIsValid = / ^ ( [ 0-9 ] [ 0-9 ] * ) $ / . test ( inputVal ) ;
    if ( ! stringIsValid ) {
      throw new Error ( "Invalid integer: " + inputVal ) ;
    }

    var digitChunks = [ ] ,
      maxLength = inputVal . length ,
      groupDigits = NUM_GROUP_DIGITS ,
      currentMin = maxLength - groupDigits ;
    while ( maxLength > 0 ) {
      digitChunks . push ( + inputVal . slice ( currentMin , maxLength ) ) ;
      currentMin -= groupDigits ;
      if ( currentMin < 0 ) {
        currentMin = 0 ;
      }
      maxLength -= groupDigits ;
    }
    removeLeadingZeros ( digitChunks ) ;
    return new LargeNumerical ( digitChunks , stringIsNegative ) ;
  }

  // Parses a primitive number into a numerical value
  function parsePrimitiveNumber ( inputVal ) {
    if ( isJSPrecise ( inputVal ) ) {
      if ( inputVal !== floorOrCeil ( inputVal ) ) {
        throw new Error ( inputVal + " is not an integer." ) ;
      }
      return new CompactNumerical ( inputVal ) ;
    }
    return parseDecimalString ( inputVal . toDecimalString ( ) ) ;
  }

  // Main parsing function for various input types
  function parseInputToNumerical ( inputVal ) {
    if ( typeof inputVal === "number" ) {
      return parsePrimitiveNumber ( inputVal ) ;
    }
    if ( typeof inputVal === "string" ) {
      return parseDecimalString ( inputVal ) ;
    }
    return inputVal ;
  }

  // Pre-populate small integer instances for efficiency
  for ( var idx = 0 ; idx < 1e3 ; idx ++ ) {
    NumericalValue [ idx ] = new CompactNumerical ( idx ) ;
    if ( idx > 0 ) {
      NumericalValue [ - idx ] = new CompactNumerical ( - idx ) ;
    }
  }

  // Define common numerical constants and utility functions
  NumericalValue . one = NumericalValue [ 1 ] ;
  NumericalValue . zero = NumericalValue [ 0 ] ;
  NumericalValue . minusOne = NumericalValue [ - 1 ] ;
  NumericalValue . maximum = getMaximum ;
  NumericalValue . minimum = getMinimum ;
  NumericalValue . greatestCommonDivisor = greatestCommonDivisor ;
  NumericalValue . leastCommonMultiple = leastCommonMultiple ;
  NumericalValue . isInstance = function ( x ) {
    return x instanceof LargeNumerical || x instanceof CompactNumerical ;
  } ;
  NumericalValue . randomBetween = generateRandomBetween ;
  NumericalValue . fromParts = function ( digitValues , baseSystem , isNegative ) {
    return parseFromDigitArray ( digitValues . map ( parseInputToNumerical ) , parseInputToNumerical ( baseSystem || 10 ) , isNegative ) ;
  } ;

  return NumericalValue ;
} ) ( ) ;

// Main entry point for the problem solution
function processSolution ( rawData ) {
  // Initialize an input reader to parse the raw data
  var dataReader = new InputParser ( rawData ) ;

  // Read problem parameters: N, K, and the array A
  var totalElements = dataReader . readNextToken ( ) ; // N
  var maxConstraint = dataReader . readNextToken ( ) ; // K
  var elementList = dataReader . readNextLine ( ) ; // Array A

  // Define a fixed bit length for calculations
  var bitLength = 40 ;
  // Precompute powers of two (2^0, 2^1, ..., 2^39)
  var powerOfTwoValues = [ 1 ] ;
  for ( var idx = 1 ; idx < bitLength ; idx ++ ) {
    powerOfTwoValues [ idx ] = powerOfTwoValues [ idx - 1 ] * 2 ;
  }
  // Reverse the array to have 2^39, 2^38, ..., 2^0
  powerOfTwoValues = powerOfTwoValues . reverse ( ) ;

  // Initialize an array to count set bits at each position
  var bitCounts = Array ( bitLength ) . fill ( 0 ) ;
  for ( var idx = 0 ; idx < bitLength ; idx ++ ) {
    // Iterate through each element in the input list
    elementList . forEach ( currentElement => {
      // Check if the current bit is set for the element
      if ( Math . floor ( currentElement / powerOfTwoValues [ idx ] ) % 2 === 1 ) {
        bitCounts [ idx ] += 1 ; // Increment count for this bit position
      }
    } ) ;
  }

  // Determine the "optimal" bit string based on majority counts
  // If a bit position has more than half elements with 1, optimal is 0, else 1
  var optimalBitString = bitCounts . map ( count => count >= Math . floor ( elementList . length / 2 ) ? 0 : 1 ) . join ( '' ) ;

  // Convert the constraint K to its binary string representation
  var binaryMaxConstraint = maxConstraint . toString ( 2 ) ;
  // Initialize candidate values for the XOR operation
  var candidateValues = [ maxConstraint ] ;

  // Generate additional candidate values by flipping bits in K
  for ( var idx = 0 ; idx < binaryMaxConstraint . length ; idx ++ ) {
    if ( binaryMaxConstraint [ idx ] === "1" ) {
      // Create a new candidate: prefix of K, then '0', then optimal bits
      var tempBinaryString = binaryMaxConstraint . slice ( 0 , binaryMaxConstraint . length - idx - 1 ) + "0" + optimalBitString . slice ( optimalBitString . length - idx , optimalBitString . length ) ;
      candidateValues . push ( parseInt ( tempBinaryString , 2 ) ) ;
    }
  }

  // Initialize the final result with a large numerical zero
  var finalResult = largeNum ( 0 ) ;
  // Iterate through each candidate value
  candidateValues . forEach ( currentCandidate => {
    // Convert the candidate to its binary string representation
    var binaryCandidate = currentCandidate . toString ( 2 ) ;
    // Pad with leading zeros to match the fixed bit length
    while ( binaryCandidate . length < bitLength ) {
      binaryCandidate = "0" + binaryCandidate ;
    }

    // Calculate the sum of (element XOR candidate) for all elements
    var currentSum = binaryCandidate . split ( "" ) . reduce ( ( accumulator , currentBit , idx ) => {
      if ( currentBit === "0" ) {
        // If candidate bit is 0, sum 2^idx * (count of 0s at this bit position in A)
        return accumulator . addBy ( largeNum ( powerOfTwoValues [ idx ] ) . multiplyBy ( bitCounts [ idx ] ) ) ;
      } else {
        // If candidate bit is 1, sum 2^idx * (count of 1s at this bit position in A)
        return accumulator . addBy ( largeNum ( powerOfTwoValues [ idx ] ) . multiplyBy ( elementList . length - bitCounts [ idx ] ) ) ;
      }
    } , largeNum ( 0 ) ) ;

    // Update the final result if the current sum is greater
    if ( currentSum . isGreater ( finalResult ) ) {
      finalResult = currentSum ;
    }
  } ) ;

  // Output the final maximum sum
  console . log ( finalResult . toDecimalString ( ) ) ;
}

// Read input from stdin and pass to the solution function
processSolution ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;