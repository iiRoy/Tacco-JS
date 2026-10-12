module.exports = function ( moduleDefinitions ) {
  var moduleCache = {};

  function internalRequire ( moduleId ) {
    if ( moduleCache[ moduleId ] ) {
      return moduleCache[ moduleId ].exports;
    }

    var moduleObject = moduleCache[ moduleId ] = {
      id: moduleId,
      isLoaded: false,
      exports: {}
    };

    moduleDefinitions[ moduleId ].call( moduleObject.exports, moduleObject, moduleObject.exports, internalRequire );
    moduleObject.isLoaded = true;
    return moduleObject.exports;
  }

  internalRequire.moduleDefinitions = moduleDefinitions;
  internalRequire.cacheStore = moduleCache;

  internalRequire.defineExport = function ( targetObject, exportName, getterFunction ) {
    if ( !internalRequire.hasOwn( targetObject, exportName ) ) {
      Object.defineProperty( targetObject, exportName, {
        enumerable: true,
        get: getterFunction
      } );
    }
  };

  internalRequire.registerModule = function ( moduleObject ) {
    if ( typeof Symbol !== 'undefined' && Symbol.toStringTag ) {
      Object.defineProperty( moduleObject, Symbol.toStringTag, {
        value: 'Module'
      } );
    }
    Object.defineProperty( moduleObject, '__esModule', {
      value: true
    } );
  };

  internalRequire.typeCheck = function ( moduleSource, flags ) {
    if ( ( 1 & flags ) ) {
      moduleSource = internalRequire( moduleSource );
    }
    if ( ( 8 & flags ) ) {
      return moduleSource;
    }
    if ( ( 4 & flags ) && typeof moduleSource === 'object' && moduleSource && moduleSource.__esModule ) {
      return moduleSource;
    }

    var tempObject = Object.create( null );
    internalRequire.registerModule( tempObject );
    Object.defineProperty( tempObject, 'default', {
      enumerable: true,
      value: moduleSource
    } );
    if ( ( 2 & flags ) && typeof moduleSource !== 'string' ) {
      for ( var propKey in moduleSource ) {
        internalRequire.defineExport( tempObject, propKey, ( function ( key ) {
          return moduleSource[ key ];
        } ).bind( null, propKey ) );
      }
    }
    return tempObject;
  };

  internalRequire.interopDefault = function ( moduleSource ) {
    var defaultGetter = moduleSource && moduleSource.__esModule ?
      function () {
        return moduleSource.default;
      } :
      function () {
        return moduleSource;
      };
    internalRequire.defineExport( defaultGetter, 'a', defaultGetter );
    return defaultGetter;
  };

  internalRequire.hasOwn = function ( targetObject, propertyName ) {
    return Object.prototype.hasOwnProperty.call( targetObject, propertyName );
  };

  internalRequire.publicPath = '';

  return internalRequire( internalRequire.startupModule = 0 );
}( [
  function ( currentModule, moduleExports, internalRequire ) {
    "strict mode";
    var fileSystemUtility = internalRequire( 1 );
    internalRequire( 2 )( fileSystemUtility.readFileSync( "/dev/stdin", "utf8" ) );
  },
  function ( currentModule, moduleExports ) {
    currentModule.exports = require( "fs" );
  },
  function ( currentModule, moduleExports, internalRequire ) {
    "strict mode";
    var inputParserClass = internalRequire( 3 );
    var mainProcessingFunction = internalRequire( 5 );
    currentModule.exports = function ( rawInputText ) {
      var parserObject = new inputParserClass( rawInputText );
      mainProcessingFunction( parserObject );
    };
  },
  function ( currentModule, moduleExports, internalRequire ) {
    "strict mode";
    var dataQueueClass = internalRequire( 4 );
    currentModule.exports = class InputDataProcessor {
      constructor ( sourceString ) {
        var tokenizedStrings = sourceString.trim().split( /\s+/g );
        this.dataQueue = new dataQueueClass( tokenizedStrings );
      }
      readNextRaw () {
        return this.dataQueue.dequeueItem();
      }
      readNextNumber () {
        return parseInt( this.dataQueue.dequeueItem(), 10 );
      }
      clearQueue () {
        this.dataQueue.resetQueue();
      }
    };
  },
  function ( currentModule, moduleExports, internalRequire ) {
    "strict mode";
    currentModule.exports = class DataElementQueue {
      constructor () {
        var initialData = arguments.length > 0 && arguments[ 0 ] !== undefined ? arguments[ 0 ] : [];
        this.queueSize = initialData.length;
        this.queueItems = initialData;
        this.readIndex = 0;
      }
      enqueueItem ( element ) {
        this.queueSize += 1;
        this.queueItems.push( element );
      }
      dequeueItem () {
        var element = this.queueItems[ this.readIndex ];
        this.queueSize -= 1;
        this.readIndex += 1;
        return element;
      }
      resetQueue () {
        this.queueItems = [];
        this.queueSize = 0;
        this.readIndex = 0;
      }
    };
  },
  function ( currentModule, moduleExports, internalRequire ) {
    "strict mode";
    var bigNumberUtility = internalRequire( 6 );
    currentModule.exports = function ( inputReader ) {
      var firstCount = inputReader.readNextNumber();
      var bigNumConverter = new bigNumberUtility( inputReader.readNextRaw() );
      var firstDataSet = new Array( firstCount );
      var maxValFirst = 0;
      for ( var firstLoopIdx = 0; firstLoopIdx < firstCount; firstLoopIdx++ ) {
        firstDataSet[ firstLoopIdx ] = inputReader.readNextNumber();
        maxValFirst = Math.max( maxValFirst, firstDataSet[ firstLoopIdx ] );
      }

      var secondDataSet = new Array( firstCount );
      var maxValSecond = 0;
      for ( var secondLoopIdx = 0; secondLoopIdx < firstCount; secondLoopIdx++ ) {
        secondDataSet[ secondLoopIdx ] = inputReader.readNextNumber();
        maxValSecond = Math.max( maxValSecond, secondDataSet[ secondLoopIdx ] );
      }

      firstDataSet.sort( function ( valA, valB ) {
        return valA - valB;
      } );
      secondDataSet.sort( function ( valA, valB ) {
        return valB - valA;
      } );

      var lowerBound = maxValFirst * maxValSecond;
      var upperBound = -1;

      while ( Math.abs( lowerBound - upperBound ) > 1 ) {
        var midPoint = Math.floor( ( lowerBound + upperBound ) / 2 );
        var requiredConversions = 0;
        for ( var dataIdx = 0; dataIdx < firstCount; dataIdx++ ) {
          var productValue = firstDataSet[ dataIdx ] * secondDataSet[ dataIdx ];
          if ( productValue <= midPoint ) {
            // No operation
          } else {
            requiredConversions += Math.ceil( ( productValue - midPoint ) / secondDataSet[ dataIdx ] );
          }
        }

        if ( bigNumConverter.comparedTo( requiredConversions ) >= 0 ) {
          lowerBound = midPoint;
        } else {
          upperBound = midPoint;
        }
      }
      console.log( lowerBound );
    };
  },
  function ( currentModule, moduleExports, internalRequire ) {
    var bigNumberExport;
    ( function ( globalScope ) {
      "strict mode";

      var randomNumberGen,
        numberPattern = /^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i,
        mathCeil = Math.ceil,
        mathFloor = Math.floor,
        errorPrefix = "[DecimalValue Error] ",
        precisionWarning = errorPrefix + "Number primitive has more than 15 significant digits: ",
        powerOfTenBase = 1e14,
        digitsPerChunk = 14,
        maxSafeInteger = 9007199254740991,
        powersOfTenLookup = [ 1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13 ],
        halfChunkBase = 1e7,
        maxPrecisionSetting = 1e9;

      function integerPart ( value ) {
        var num = 0 | value;
        return value > 0 || value === num ? num : num - 1;
      }

      function formatChunks ( chunkArray ) {
        var idx, len, numStr = chunkArray[ 0 ] + "";
        var currentIdx = 1;
        var arrayLength = chunkArray.length;

        while ( currentIdx < arrayLength ) {
          idx = chunkArray[ currentIdx++ ] + "";
          for ( len = digitsPerChunk - idx.length; len--; idx = "0" + idx );
          numStr += idx;
        }

        for ( arrayLength = numStr.length; 48 === numStr.charCodeAt( --arrayLength ); );
        return numStr.slice( 0, arrayLength + 1 || 1 );
      }

      function compareBigNumbers ( firstNum, secondNum ) {
        var firstNumZero, secondNumZero,
          firstSign = firstNum.signValue,
          secondSign = secondNum.signValue,
          firstExponent = firstNum.exponentValue,
          secondExponent = secondNum.exponentValue;

        if ( !firstSign || !secondSign ) {
          return null;
        }

        firstNumZero = firstNum.chunkArray && !firstNum.chunkArray[ 0 ];
        secondNumZero = secondNum.chunkArray && !secondNum.chunkArray[ 0 ];

        if ( firstNumZero || secondNumZero ) {
          return firstNumZero ? ( secondNumZero ? 0 : -secondSign ) : firstSign;
        }

        if ( firstSign !== secondSign ) {
          return firstSign;
        }

        firstNumZero = firstSign < 0;
        secondNumZero = firstExponent === secondExponent;

        if ( !firstNum.chunkArray || !secondNum.chunkArray ) {
          return secondNumZero ? 0 : ( !firstNum.chunkArray ^ firstNumZero ? 1 : -1 );
        }

        if ( !secondNumZero ) {
          return ( firstExponent > secondExponent ^ firstNumZero ) ? 1 : -1;
        }

        secondSign = ( firstExponent = firstNum.chunkArray.length ) < ( secondExponent = secondNum.chunkArray.length ) ? firstExponent : secondExponent;
        firstSign = 0;

        for ( ; firstSign < secondSign; firstSign++ ) {
          if ( firstNum.chunkArray[ firstSign ] !== secondNum.chunkArray[ firstSign ] ) {
            return ( firstNum.chunkArray[ firstSign ] > secondNum.chunkArray[ firstSign ] ^ firstNumZero ) ? 1 : -1;
          }
        }

        return firstExponent === secondExponent ? 0 : ( ( firstExponent > secondExponent ^ firstNumZero ) ? 1 : -1 );
      }

      function validateRange ( value, min, max, argName ) {
        if ( value < min || value > max || value !== mathFloor( value ) ) {
          throw Error( errorPrefix + ( argName || "Argument" ) + ( typeof value === 'number' ? ( value < min || value > max ? " out of range: " : " not an integer: " ) : " not a primitive number: " ) + String( value ) );
        }
      }

      function isOdd ( bigNum ) {
        var lastChunkIndex = bigNum.chunkArray.length - 1;
        return integerPart( bigNum.exponentValue / digitsPerChunk ) === lastChunkIndex && bigNum.chunkArray[ lastChunkIndex ] % 2 !== 0;
      }

      function formatExponential ( numString, exponent ) {
        return ( numString.length > 1 ? numString.charAt( 0 ) + "." + numString.slice( 1 ) : numString ) + ( exponent < 0 ? "e" : "e+" ) + exponent;
      }

      function insertDecimal ( numString, exponent, padChar ) {
        var tempVar, idx;
        if ( exponent < 0 ) {
          for ( idx = padChar + "."; ++exponent; idx += padChar );
          numString = idx + numString;
        } else if ( ++exponent > ( tempVar = numString.length ) ) {
          for ( idx = padChar, exponent -= tempVar; --exponent; idx += padChar );
          numString += idx;
        } else if ( exponent < tempVar ) {
          numString = numString.slice( 0, exponent ) + "." + numString.slice( exponent );
        }
        return numString;
      }

      ( randomNumberGen = function createBigNumberClass ( configObject ) {
        var tempNum, tempVal,
          DecimalValuePrototype = DecimalValue.prototype = {
            constructor: DecimalValue,
            toString: null,
            valueOf: null
          },
          ONE_DECIMAL = new DecimalValue( 1 ),
          DEFAULT_DECIMAL_PLACES = 20,
          DEFAULT_ROUNDING_MODE = 4,
          EXP_AT_LOWER = -7,
          EXP_AT_UPPER = 21,
          RANGE_MIN = -1e7,
          RANGE_MAX = 1e7,
          USE_CRYPTO_RANDOM = false,
          MODULO_OPERATION_MODE = 1,
          POWER_PRECISION = 0,
          FORMAT_SETTINGS = {
            prefix: "",
            groupSize: 3,
            secondaryGroupSize: 0,
            groupSeparator: ",",
            decimalSeparator: ".",
            fractionGroupSize: 0,
            fractionGroupSeparator: " ",
            suffix: ""
          },
          BASE_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";

        function DecimalValue ( valueParam, baseParam ) {
          var charIdx, currentDigit, numChunks,
            currentExponent, strValue,
            isNumber, tempDigit,
            isDecimal, charCode,
            instance = this;

          if ( !( instance instanceof DecimalValue ) ) {
            return new DecimalValue( valueParam, baseParam );
          }

          if ( baseParam == null ) {
            if ( valueParam && true === valueParam._isBigNumber ) {
              instance.signValue = valueParam.signValue;
              if ( !valueParam.chunkArray || valueParam.exponentValue > RANGE_MAX ) {
                instance.chunkArray = instance.exponentValue = null;
              } else if ( valueParam.exponentValue < RANGE_MIN ) {
                instance.chunkArray = [ instance.exponentValue = 0 ];
              } else {
                instance.exponentValue = valueParam.exponentValue;
                instance.chunkArray = valueParam.chunkArray.slice();
              }
              return;
            }

            if ( ( isNumber = typeof valueParam === 'number' ) && 0 * valueParam === 0 ) {
              if ( instance.signValue = 1 / valueParam < 0 ? ( valueParam = -valueParam, -1 ) : 1, valueParam === ~~valueParam ) {
                for ( currentExponent = 0, tempDigit = valueParam; tempDigit >= 10; tempDigit /= 10, currentExponent++ );
                return void ( currentExponent > RANGE_MAX ? instance.chunkArray = instance.exponentValue = null : ( instance.exponentValue = currentExponent, instance.chunkArray = [ valueParam ] ) );
              }
              strValue = String( valueParam );
            } else {
              if ( !numberPattern.test( strValue = String( valueParam ) ) ) {
                parseInputString( instance, strValue, isNumber );
                return;
              }
              instance.signValue = 45 === strValue.charCodeAt( 0 ) ? ( strValue = strValue.slice( 1 ), -1 ) : 1;
            }

            if ( ( currentExponent = strValue.indexOf( "." ) ) > -1 ) {
              strValue = strValue.replace( ".", "" );
            } else {
              currentExponent = strValue.length;
            }

            if ( ( tempDigit = strValue.search( /e/i ) ) > 0 ) {
              if ( currentExponent < 0 ) {
                currentExponent = tempDigit;
              }
              currentExponent += +strValue.slice( tempDigit + 1 );
              strValue = strValue.substring( 0, tempDigit );
            } else if ( currentExponent < 0 ) {
              currentExponent = strValue.length;
            }
          } else {
            validateRange( baseParam, 2, BASE_ALPHABET.length, "Base" );
            if ( 10 === baseParam ) {
              return roundDecimal( instance = new DecimalValue( valueParam ), DEFAULT_DECIMAL_PLACES + instance.exponentValue + 1, DEFAULT_ROUNDING_MODE );
            }

            strValue = String( valueParam );
            isNumber = typeof valueParam === 'number';

            if ( isNumber ) {
              if ( 0 * valueParam !== 0 ) {
                parseInputString( instance, strValue, isNumber, baseParam );
                return;
              }
              if ( instance.signValue = 1 / valueParam < 0 ? ( strValue = strValue.slice( 1 ), -1 ) : 1, DecimalValue.DEBUG && strValue.replace( /^0\.0*|\./, "" ).length > 15 ) {
                throw Error( precisionWarning + valueParam );
              }
            } else {
              instance.signValue = 45 === strValue.charCodeAt( 0 ) ? ( strValue = strValue.slice( 1 ), -1 ) : 1;
            }

            for ( charIdx = BASE_ALPHABET.slice( 0, baseParam ), currentExponent = tempDigit = 0, numChunks = strValue.length; tempDigit < numChunks; tempDigit++ ) {
              if ( charIdx.indexOf( currentDigit = strValue.charAt( tempDigit ) ) < 0 ) {
                if ( "." === currentDigit ) {
                  if ( tempDigit > currentExponent ) {
                    currentExponent = numChunks;
                    continue;
                  }
                } else if ( !isDecimal && ( strValue === strValue.toUpperCase() && ( strValue = strValue.toLowerCase() ) || strValue === strValue.toLowerCase() && ( strValue = strValue.toUpperCase() ) ) ) {
                  isDecimal = true;
                  tempDigit = -1;
                  currentExponent = 0;
                  continue;
                }
                parseInputString( instance, String( valueParam ), isNumber, baseParam );
                return;
              }
            }

            isNumber = false;
            if ( ( currentExponent = ( strValue = baseConversionUtil( strValue, baseParam, 10, instance.signValue ) ).indexOf( "." ) ) > -1 ) {
              strValue = strValue.replace( ".", "" );
            } else {
              currentExponent = strValue.length;
            }
          }

          for ( tempDigit = 0; 48 === strValue.charCodeAt( tempDigit ); tempDigit++ );
          for ( numChunks = strValue.length; 48 === strValue.charCodeAt( --numChunks ); );

          if ( strValue = strValue.slice( tempDigit, ++numChunks ) ) {
            if ( numChunks -= tempDigit, isNumber && DecimalValue.DEBUG && numChunks > 15 && ( valueParam > maxSafeInteger || valueParam !== mathFloor( valueParam ) ) ) {
              throw Error( precisionWarning + instance.signValue * valueParam );
            }
            if ( ( currentExponent = currentExponent - tempDigit - 1 ) > RANGE_MAX ) {
              instance.chunkArray = instance.exponentValue = null;
            } else if ( currentExponent < RANGE_MIN ) {
              instance.chunkArray = [ instance.exponentValue = 0 ];
            } else {
              if ( instance.exponentValue = currentExponent, instance.chunkArray = [], tempDigit = ( currentExponent + 1 ) % digitsPerChunk, currentExponent < 0 && ( tempDigit += digitsPerChunk ), tempDigit < numChunks ) {
                if ( tempDigit ) {
                  instance.chunkArray.push( +strValue.slice( 0, tempDigit ) );
                }
                for ( numChunks -= digitsPerChunk; tempDigit < numChunks; ) {
                  instance.chunkArray.push( +strValue.slice( tempDigit, tempDigit += digitsPerChunk ) );
                }
                tempDigit = digitsPerChunk - ( strValue = strValue.slice( tempDigit ) ).length;
              } else {
                tempDigit -= numChunks;
              }
              for ( ; tempDigit--; strValue += "0" );
              instance.chunkArray.push( +strValue );
            }
          } else {
            instance.chunkArray = [ instance.exponentValue = 0 ];
          }
        }

        function formatToString ( decimalNum, decimalPlaces, roundingMode, formatType ) {
          var firstChunk, exponentVal, formattedString, len, numDigits;

          if ( roundingMode == null ) {
            roundingMode = DEFAULT_ROUNDING_MODE;
          } else {
            validateRange( roundingMode, 0, 8 );
          }

          if ( !decimalNum.chunkArray ) {
            return decimalNum.toString();
          }

          firstChunk = decimalNum.chunkArray[ 0 ];
          exponentVal = decimalNum.exponentValue;

          if ( decimalPlaces == null ) {
            formattedString = formatChunks( decimalNum.chunkArray );
            formattedString = ( 1 === formatType || ( 2 === formatType && ( exponentVal <= EXP_AT_LOWER || exponentVal >= EXP_AT_UPPER ) ) ) ?
              formatExponential( formattedString, exponentVal ) :
              insertDecimal( formattedString, exponentVal, "0" );
          } else if ( numDigits = ( decimalNum = roundDecimal( new DecimalValue( decimalNum ), decimalPlaces + decimalNum.exponentValue + 1, roundingMode ) ).exponentValue, len = ( formattedString = formatChunks( decimalNum.chunkArray ) ).length, 1 === formatType || ( 2 === formatType && ( decimalPlaces <= numDigits || numDigits <= EXP_AT_LOWER ) ) ) {
            for ( ; len < decimalPlaces; formattedString += "0", len++ );
            formattedString = formatExponential( formattedString, numDigits );
          } else if ( decimalPlaces -= numDigits, formattedString = insertDecimal( formattedString, numDigits, "0" ), numDigits + 1 > len ) {
            if ( --decimalPlaces > 0 ) {
              for ( formattedString += "."; decimalPlaces--; formattedString += "0" );
            }
          } else if ( ( decimalPlaces += numDigits - len ) > 0 ) {
            if ( numDigits + 1 === len ) {
              formattedString += ".";
            }
            for ( ; decimalPlaces--; formattedString += "0" );
          }
          return decimalNum.signValue < 0 && firstChunk ? "-" + formattedString : formattedString;
        }

        function compareValues ( valuesArray, comparator ) {
          var currentVal, result = new DecimalValue( valuesArray[ 0 ] );
          var idx = 1;
          var arrLen = valuesArray.length;

          while ( idx < arrLen ) {
            if ( !( currentVal = new DecimalValue( valuesArray[ idx++ ] ) ).signValue ) {
              result = currentVal;
              break;
            }
            if ( comparator.call( result, currentVal ) ) {
              result = currentVal;
            }
          }
          return result;
        }

        function normalizeAndSet ( decimalNum, chunkArray, exponent ) {
          var idx, len = chunkArray.length;
          for ( ; !chunkArray[ --len ]; chunkArray.pop() );
          for ( idx = chunkArray[ 0 ]; idx >= 10; idx /= 10, len++ );
          return ( exponent = len + exponent * digitsPerChunk - 1 ) > RANGE_MAX ?
            ( decimalNum.chunkArray = decimalNum.exponentValue = null ) :
            ( exponent < RANGE_MIN ? ( decimalNum.chunkArray = [ decimalNum.exponentValue = 0 ] ) : ( decimalNum.exponentValue = exponent, decimalNum.chunkArray = chunkArray ) ),
            decimalNum;
        }

        function roundDecimal ( decimalNum, targetPrecision, roundingMode, checkRemainder ) {
          var initialPrecision, digitCount,
            chunkArray = decimalNum.chunkArray,
            powersLookup = powersOfTenLookup;

          if ( chunkArray ) {
            // Label for early exit from rounding logic
            roundingProcess: {
              initialPrecision = 1;
              for ( digitCount = chunkArray[ 0 ]; digitCount >= 10; digitCount /= 10, initialPrecision++ );

              if ( ( tempNum = targetPrecision - initialPrecision ) < 0 ) {
                tempNum += digitsPerChunk;
                tempVal = targetPrecision;
                checkRemainder = ( digitCount = chunkArray[ currentExponent = 0 ] ) / powersLookup[ initialPrecision - tempVal - 1 ] % 10 | 0;
              } else if ( ( currentExponent = mathCeil( ( tempNum + 1 ) / digitsPerChunk ) ) >= chunkArray.length ) {
                if ( !checkRemainder ) {
                  break roundingProcess;
                }
                for ( ; chunkArray.length <= currentExponent; chunkArray.push( 0 ) );
                digitCount = checkRemainder = 0;
                initialPrecision = 1;
                tempVal = ( tempNum %= digitsPerChunk ) - digitsPerChunk + 1;
              } else {
                for ( digitCount = tempVal = chunkArray[ currentExponent ], initialPrecision = 1; tempVal >= 10; tempVal /= 10, initialPrecision++ );
                checkRemainder = ( tempVal = ( tempNum %= digitsPerChunk ) - digitsPerChunk + initialPrecision ) < 0 ? 0 : digitCount / powersLookup[ initialPrecision - tempVal - 1 ] % 10 | 0;
              }

              checkRemainder = checkRemainder || targetPrecision < 0 || chunkArray[ currentExponent + 1 ] != null ||
                ( tempVal < 0 ? digitCount : digitCount % powersLookup[ initialPrecision - tempVal - 1 ] );

              checkRemainder = roundingMode < 4 ?
                ( checkRemainder || roundingMode === 0 || ( roundingMode === ( decimalNum.signValue < 0 ? 3 : 2 ) ) ) :
                ( checkRemainder > 5 || ( 5 === checkRemainder && ( 4 === roundingMode || checkRemainder || ( 6 === roundingMode && ( tempNum > 0 ? ( tempVal > 0 ? digitCount / powersLookup[ initialPrecision - tempVal ] : 0 ) : chunkArray[ currentExponent - 1 ] ) % 10 & 1 ) || ( roundingMode === ( decimalNum.signValue < 0 ? 8 : 7 ) ) ) ) );

              if ( targetPrecision < 1 || !chunkArray[ 0 ] ) {
                chunkArray.length = 0;
                if ( checkRemainder ) {
                  targetPrecision -= decimalNum.exponentValue + 1;
                  chunkArray[ 0 ] = powersLookup[ ( digitsPerChunk - targetPrecision % digitsPerChunk ) % digitsPerChunk ];
                  decimalNum.exponentValue = -targetPrecision || 0;
                } else {
                  chunkArray[ 0 ] = decimalNum.exponentValue = 0;
                }
                return decimalNum;
              }

              if ( 0 === tempNum ? ( chunkArray.length = currentExponent, digitCount = 1, currentExponent-- ) : ( chunkArray.length = currentExponent + 1, digitCount = powersLookup[ digitsPerChunk - tempNum ], chunkArray[ currentExponent ] = tempVal > 0 ? mathFloor( digitCount / powersLookup[ initialPrecision - tempVal ] % powersLookup[ tempVal ] ) * digitCount : 0 ), checkRemainder ) {
                for ( ;; ) {
                  if ( 0 === currentExponent ) {
                    for ( tempNum = 1, tempVal = chunkArray[ 0 ]; tempVal >= 10; tempVal /= 10, tempNum++ );
                    for ( tempVal = chunkArray[ 0 ] += digitCount, digitCount = 1; tempVal >= 10; tempVal /= 10, digitCount++ );
                    if ( tempNum !== digitCount ) {
                      decimalNum.exponentValue++;
                      if ( chunkArray[ 0 ] === powerOfTenBase ) {
                        chunkArray[ 0 ] = 1;
                      }
                    }
                    break;
                  }
                  if ( chunkArray[ currentExponent ] += digitCount, chunkArray[ currentExponent ] !== powerOfTenBase ) {
                    break;
                  }
                  chunkArray[ currentExponent-- ] = 0;
                  digitCount = 1;
                }
              }

              for ( tempNum = chunkArray.length; 0 === chunkArray[ --tempNum ]; chunkArray.pop() );
            }
            if ( decimalNum.exponentValue > RANGE_MAX ) {
              decimalNum.chunkArray = decimalNum.exponentValue = null;
            } else if ( decimalNum.exponentValue < RANGE_MIN ) {
              decimalNum.chunkArray = [ decimalNum.exponentValue = 0 ];
            }
          }
          return decimalNum;
        }

        function toPrimitiveString ( decimalNum ) {
          var exponentVal = decimalNum.exponentValue;
          if ( exponentVal === null ) {
            return decimalNum.toString();
          }
          var str = formatChunks( decimalNum.chunkArray );
          str = exponentVal <= EXP_AT_LOWER || exponentVal >= EXP_AT_UPPER ?
            formatExponential( str, exponentVal ) :
            insertDecimal( str, exponentVal, "0" );
          return decimalNum.signValue < 0 ? "-" + str : str;
        }

        DecimalValue.clone = createBigNumberClass;
        DecimalValue.ROUND_UP = 0;
        DecimalValue.ROUND_DOWN = 1;
        DecimalValue.ROUND_CEIL = 2;
        DecimalValue.ROUND_FLOOR = 3;
        DecimalValue.ROUND_HALF_UP = 4;
        DecimalValue.ROUND_HALF_DOWN = 5;
        DecimalValue.ROUND_HALF_EVEN = 6;
        DecimalValue.ROUND_HALF_CEIL = 7;
        DecimalValue.ROUND_HALF_FLOOR = 8;
        DecimalValue.EUCLID = 9;

        DecimalValue.config = DecimalValue.set = function ( settings ) {
          var settingKey, value;
          if ( settings != null ) {
            if ( typeof settings !== 'object' ) {
              throw Error( errorPrefix + "Object expected: " + settings );
            }
            if ( settings.hasOwnProperty( settingKey = "DECIMAL_PLACES" ) && ( validateRange( value = settings[ settingKey ], 0, maxPrecisionSetting, settingKey ), DEFAULT_DECIMAL_PLACES = value ),
              settings.hasOwnProperty( settingKey = "ROUNDING_MODE" ) && ( validateRange( value = settings[ settingKey ], 0, 8, settingKey ), DEFAULT_ROUNDING_MODE = value ),
              settings.hasOwnProperty( settingKey = "EXPONENTIAL_AT" ) && ( ( value = settings[ settingKey ] ) && value.pop ? ( validateRange( value[ 0 ], -maxPrecisionSetting, 0, settingKey ), validateRange( value[ 1 ], 0, maxPrecisionSetting, settingKey ), EXP_AT_LOWER = value[ 0 ], EXP_AT_UPPER = value[ 1 ] ) : ( validateRange( value, -maxPrecisionSetting, maxPrecisionSetting, settingKey ), EXP_AT_LOWER = -( EXP_AT_UPPER = value < 0 ? -value : value ) ) ),
              settings.hasOwnProperty( settingKey = "RANGE" ) ) {
              if ( ( value = settings[ settingKey ] ) && value.pop ) {
                validateRange( value[ 0 ], -maxPrecisionSetting, -1, settingKey );
                validateRange( value[ 1 ], 1, maxPrecisionSetting, settingKey );
                RANGE_MIN = value[ 0 ];
                RANGE_MAX = value[ 1 ];
              } else {
                if ( validateRange( value, -maxPrecisionSetting, maxPrecisionSetting, settingKey ), !value ) {
                  throw Error( errorPrefix + settingKey + " cannot be zero: " + value );
                }
                RANGE_MIN = -( RANGE_MAX = value < 0 ? -value : value );
              }
            }
            if ( settings.hasOwnProperty( settingKey = "CRYPTO" ) ) {
              if ( ( value = settings[ settingKey ] ) !== !!value ) {
                throw Error( errorPrefix + settingKey + " not true or false: " + value );
              }
              if ( value ) {
                if ( typeof crypto === 'undefined' || !crypto || !( crypto.getRandomValues || crypto.randomBytes ) ) {
                  throw USE_CRYPTO_RANDOM = !value, Error( errorPrefix + "crypto unavailable" );
                }
                USE_CRYPTO_RANDOM = value;
              } else {
                USE_CRYPTO_RANDOM = value;
              }
            }
            if ( settings.hasOwnProperty( settingKey = "MODULO_MODE" ) && ( validateRange( value = settings[ settingKey ], 0, 9, settingKey ), MODULO_OPERATION_MODE = value ),
              settings.hasOwnProperty( settingKey = "POW_PRECISION" ) && ( validateRange( value = settings[ settingKey ], 0, maxPrecisionSetting, settingKey ), POWER_PRECISION = value ),
              settings.hasOwnProperty( settingKey = "FORMAT" ) ) {
              if ( typeof ( value = settings[ settingKey ] ) !== 'object' ) {
                throw Error( errorPrefix + settingKey + " not an object: " + value );
              }
              FORMAT_SETTINGS = value;
            }
            if ( settings.hasOwnProperty( settingKey = "ALPHABET" ) ) {
              if ( typeof ( value = settings[ settingKey ] ) !== 'string' || /^.$|[+-.\s]|(.).*\1/.test( value ) ) {
                throw Error( errorPrefix + settingKey + " invalid: " + value );
              }
              BASE_ALPHABET = value;
            }
          }
          return {
            DECIMAL_PLACES: DEFAULT_DECIMAL_PLACES,
            ROUNDING_MODE: DEFAULT_ROUNDING_MODE,
            EXPONENTIAL_AT: [ EXP_AT_LOWER, EXP_AT_UPPER ],
            RANGE: [ RANGE_MIN, RANGE_MAX ],
            CRYPTO: USE_CRYPTO_RANDOM,
            MODULO_MODE: MODULO_OPERATION_MODE,
            POW_PRECISION: POWER_PRECISION,
            FORMAT: FORMAT_SETTINGS,
            ALPHABET: BASE_ALPHABET
          };
        };

        DecimalValue.isBigNumber = function ( value ) {
          if ( !value || true !== value._isBigNumber ) {
            return false;
          }
          if ( !DecimalValue.DEBUG ) {
            return true;
          }

          var chunk, exponent, sign;
          var chunkArray = value.chunkArray;
          var exponentValue = value.exponentValue;
          var signValue = value.signValue;

          validationCheck: if ( Object.prototype.toString.call( chunkArray ) === "[object Array]" ) {
            if ( ( 1 === signValue || -1 === signValue ) && exponentValue >= -maxPrecisionSetting && exponentValue <= maxPrecisionSetting && exponentValue === mathFloor( exponentValue ) ) {
              if ( 0 === chunkArray[ 0 ] ) {
                if ( 0 === exponentValue && 1 === chunkArray.length ) {
                  return true;
                }
                break validationCheck;
              }
              if ( ( chunk = ( exponentValue + 1 ) % digitsPerChunk ) < 1 && ( chunk += digitsPerChunk ), String( chunkArray[ 0 ] ).length === chunk ) {
                for ( chunk = 0; chunk < chunkArray.length; chunk++ ) {
                  if ( ( exponent = chunkArray[ chunk ] ) < 0 || exponent >= powerOfTenBase || exponent !== mathFloor( exponent ) ) {
                    break validationCheck;
                  }
                }
                if ( 0 !== exponent ) {
                  return true;
                }
              }
            } else if ( null === chunkArray && null === exponentValue && ( null === signValue || 1 === signValue || -1 === signValue ) ) {
              return true;
            }
            throw Error( errorPrefix + "Invalid BigNumber: " + value );
          }
          return false;
        };

        DecimalValue.maximum = DecimalValue.max = function () {
          return compareValues( arguments, DecimalValuePrototype.lt );
        };
        DecimalValue.minimum = DecimalValue.min = function () {
          return compareValues( arguments, DecimalValuePrototype.gt );
        };

        DecimalValue.random = ( randomNumberGen = 9007199254740992 * Math.random() & 2097151 ?
          function () {
            return mathFloor( 9007199254740992 * Math.random() );
          } :
          function () {
            return 8388608 * ( 1073741824 * Math.random() | 0 ) + ( 8388608 * Math.random() | 0 );
          },
          function ( precision ) {
            var randomArray, numChunks,
              tempVal, element,
              idx = 0,
              chunkBuffer = [],
              oneDecimal = new DecimalValue( ONE_DECIMAL );

            if ( precision == null ) {
              precision = DEFAULT_DECIMAL_PLACES;
            } else {
              validateRange( precision, 0, maxPrecisionSetting );
            }

            numChunks = mathCeil( precision / digitsPerChunk );

            if ( USE_CRYPTO_RANDOM ) {
              if ( crypto.getRandomValues ) {
                for ( randomArray = crypto.getRandomValues( new Uint32Array( numChunks *= 2 ) ); idx < numChunks; ) {
                  if ( ( element = 131072 * randomArray[ idx ] + ( randomArray[ idx + 1 ] >>> 11 ) ) >= 9e15 ) {
                    tempVal = crypto.getRandomValues( new Uint32Array( 2 ) );
                    randomArray[ idx ] = tempVal[ 0 ];
                    randomArray[ idx + 1 ] = tempVal[ 1 ];
                  } else {
                    chunkBuffer.push( element % 1e14 );
                    idx += 2;
                  }
                }
                idx = numChunks / 2;
              } else {
                if ( !crypto.randomBytes ) {
                  throw USE_CRYPTO_RANDOM = false, Error( errorPrefix + "crypto unavailable" );
                }
                for ( randomArray = crypto.randomBytes( numChunks *= 7 ); idx < numChunks; ) {
                  if ( ( element = 281474976710656 * ( 31 & randomArray[ idx ] ) + 1099511627776 * randomArray[ idx + 1 ] + 4294967296 * randomArray[ idx + 2 ] + 16777216 * randomArray[ idx + 3 ] + ( randomArray[ idx + 4 ] << 16 ) + ( randomArray[ idx + 5 ] << 8 ) + randomArray[ idx + 6 ] ) >= 9e15 ) {
                    crypto.randomBytes( 7 ).copy( randomArray, idx );
                  } else {
                    chunkBuffer.push( element % 1e14 );
                    idx += 7;
                  }
                }
                idx = numChunks / 7;
              }
            }

            if ( !USE_CRYPTO_RANDOM ) {
              for ( ; idx < numChunks; ) {
                if ( ( element = randomNumberGen() ) < 9e15 ) {
                  chunkBuffer[ idx++ ] = element % 1e14;
                }
              }
            }

            for ( numChunks = chunkBuffer[ --idx ], precision %= digitsPerChunk, numChunks && precision && ( element = powersOfTenLookup[ digitsPerChunk - precision ], chunkBuffer[ idx ] = mathFloor( numChunks / element ) * element ); 0 === chunkBuffer[ idx ]; chunkBuffer.pop(), idx-- );

            if ( idx < 0 ) {
              chunkBuffer = [ tempVal = 0 ];
            } else {
              for ( tempVal = -1; 0 === chunkBuffer[ 0 ]; chunkBuffer.splice( 0, 1 ), tempVal -= digitsPerChunk );
              for ( idx = 1, element = chunkBuffer[ 0 ]; element >= 10; element /= 10, idx++ );
              if ( idx < digitsPerChunk ) {
                tempVal -= digitsPerChunk - idx;
              }
            }
            return oneDecimal.exponentValue = tempVal, oneDecimal.chunkArray = chunkBuffer, oneDecimal;
          } );

        DecimalValue.sum = function () {
          var idx = 1,
            args = arguments,
            sumResult = new DecimalValue( args[ 0 ] );
          for ( ; idx < args.length; ) {
            sumResult = sumResult.plus( args[ idx++ ] );
          }
          return sumResult;
        };

        baseConversionUtil = function () {
          function convertToBase10 ( valueString, sourceBase, targetBase, digitLookup ) {
            for ( var idx, len,
                resultChunks = [ 0 ],
                currentIdx = 0,
                stringLength = valueString.length; currentIdx < stringLength; ) {
              for ( len = resultChunks.length; len--; resultChunks[ len ] *= sourceBase );
              for ( resultChunks[ 0 ] += digitLookup.indexOf( valueString.charAt( currentIdx++ ) ), idx = 0; idx < resultChunks.length; idx++ ) {
                if ( resultChunks[ idx ] > targetBase - 1 ) {
                  if ( resultChunks[ idx + 1 ] == null ) {
                    resultChunks[ idx + 1 ] = 0;
                  }
                  resultChunks[ idx + 1 ] += resultChunks[ idx ] / targetBase | 0;
                  resultChunks[ idx ] %= targetBase;
                }
              }
            }
            return resultChunks.reverse();
          }

          return function ( valueString, sourceBase, targetBase, isSigned, useAlphabet ) {
            var tempResult, decimalPointIndex,
              tempPrecision = DEFAULT_DECIMAL_PLACES,
              tempRounding = DEFAULT_ROUNDING_MODE;
            var numChunks, baseVal,
              isNegative, tempNum,
              digitArray, exponentVal,
              remainder, convertedString;

            decimalPointIndex = valueString.indexOf( "." );
            if ( decimalPointIndex >= 0 ) {
              tempNum = POWER_PRECISION;
              POWER_PRECISION = 0;
              valueString = valueString.replace( ".", "" );
              baseVal = ( numChunks = new DecimalValue( sourceBase ) ).pow( valueString.length - decimalPointIndex );
              POWER_PRECISION = tempNum;
              baseVal.chunkArray = convertToBase10( insertDecimal( formatChunks( baseVal.chunkArray ), baseVal.exponentValue, "0" ), 10, targetBase, "0123456789" );
              baseVal.exponentValue = baseVal.chunkArray.length;
            }

            isNegative = isSigned;
            digitArray = tempResult = ( exponentVal = convertToBase10( valueString, sourceBase, targetBase, useAlphabet ? ( tempNum = BASE_ALPHABET, "0123456789" ) : ( tempNum = "0123456789", BASE_ALPHABET ) ) ).length;

            for ( ; 0 === exponentVal[ --isNegative ]; exponentVal.pop() );

            if ( !exponentVal[ 0 ] ) {
              return tempNum.charAt( 0 );
            }

            if ( decimalPointIndex < 0 ) {
              --digitArray;
            } else {
              baseVal.chunkArray = exponentVal;
              baseVal.exponentValue = digitArray;
              baseVal.signValue = isSigned;
              exponentVal = ( baseVal = divisionAlgorithm( baseVal, numChunks, tempPrecision, tempRounding, targetBase ) ).chunkArray;
              remainder = baseVal.remainder;
              digitArray = baseVal.exponentValue;
            }

            decimalPointIndex = exponentVal[ tempNum = digitArray + tempPrecision + 1 ];
            isNegative = targetBase / 2;

            remainder = remainder || tempNum < 0 || exponentVal[ tempNum + 1 ] != null;
            remainder = tempRounding < 4 ?
              ( ( decimalPointIndex != null || remainder ) && ( 0 === tempRounding || tempRounding === ( baseVal.signValue < 0 ? 3 : 2 ) ) ) :
              ( decimalPointIndex > isNegative || ( decimalPointIndex === isNegative && ( 4 === tempRounding || remainder || ( 6 === tempRounding && 1 & exponentVal[ tempNum - 1 ] ) || ( tempRounding === ( baseVal.signValue < 0 ? 8 : 7 ) ) ) ) );

            if ( digitArray < 1 || !exponentVal[ 0 ] ) {
              convertedString = remainder ? insertDecimal( tempNum.charAt( 1 ), -tempPrecision, tempNum.charAt( 0 ) ) : tempNum.charAt( 0 );
            } else {
              if ( exponentVal.length = tempNum, remainder ) {
                for ( --targetBase; ++exponentVal[ --tempNum ] > targetBase; ) {
                  exponentVal[ tempNum ] = 0;
                  if ( !tempNum ) {
                    ++digitArray;
                    exponentVal = [ 1 ].concat( exponentVal );
                  }
                }
              }

              for ( isNegative = exponentVal.length; !exponentVal[ --isNegative ]; );
              for ( tempNum = 0, convertedString = ""; tempNum <= isNegative; convertedString += tempNum.charAt( exponentVal[ tempNum++ ] ) );
              convertedString = insertDecimal( convertedString, digitArray, tempNum.charAt( 0 ) );
            }
            return convertedString;
          };
        }();

        divisionAlgorithm = function () {
          function multiplyChunkArray ( chunkArray, multiplier, base ) {
            var idx, len,
              tempVal, currentVal,
              carry = 0,
              chunkLen = chunkArray.length,
              halfBase = multiplier % halfChunkBase,
              fullBase = multiplier / halfChunkBase | 0;

            chunkArray = chunkArray.slice();

            while ( chunkLen-- ) {
              carry = ( ( tempVal = halfBase * ( currentVal = chunkArray[ chunkLen ] % halfChunkBase ) + ( idx = fullBase * currentVal + ( len = chunkArray[ chunkLen ] / halfChunkBase | 0 ) * halfBase ) % halfChunkBase * halfChunkBase + chunkArray[ chunkLen ] + carry ) / base | 0 ) + ( idx / halfChunkBase | 0 ) + fullBase * len;
              chunkArray[ chunkLen ] = tempVal % base;
            }

            return carry && ( chunkArray = [ carry ].concat( chunkArray ) ), chunkArray;
          }

          function compareArrays ( arr1, arr2, len1, len2 ) {
            var idx, result;
            if ( len1 !== len2 ) {
              result = len1 > len2 ? 1 : -1;
            } else {
              for ( idx = result = 0; idx < len1; idx++ ) {
                if ( arr1[ idx ] !== arr2[ idx ] ) {
                  result = arr1[ idx ] > arr2[ idx ] ? 1 : -1;
                  break;
                }
              }
            }
            return result;
          }

          function subtractChunkArray ( targetArr, subtractArr, len, base ) {
            for ( var idx = 0; len--; ) {
              targetArr[ len ] -= idx;
              idx = targetArr[ len ] < subtractArr[ len ] ? 1 : 0;
              targetArr[ len ] = idx * base + targetArr[ len ] - subtractArr[ len ];
            }
            for ( ; !targetArr[ 0 ] && targetArr.length > 1; targetArr.splice( 0, 1 ) );
          }

          return function ( dividend, divisor, precision, roundingMode, base ) {
            var quotientChunk, dividendExp, divisorExp,
              divisorLen, dividendLen,
              tempDividend, tempDivisor,
              tempRem, tempQ,
              tempOffset, scaleFactor,
              chunkIdx, resultChunks,
              dividendChunks = dividend.chunkArray,
              divisorChunks = divisor.chunkArray,
              signResult = dividend.signValue === divisor.signValue ? 1 : -1;

            if ( !( dividendChunks && dividendChunks[ 0 ] && divisorChunks && divisorChunks[ 0 ] ) ) {
              return new DecimalValue( dividend.signValue && divisor.signValue && ( dividendChunks ? ( !divisorChunks || dividendChunks[ 0 ] !== divisorChunks[ 0 ] ) : divisorChunks ) ? ( dividendChunks && 0 === dividendChunks[ 0 ] || !divisorChunks ? 0 * signResult : signResult / 0 ) : NaN );
            }

            dividendExp = precision + ( quotientChunk = dividend.exponentValue - divisor.exponentValue ) + 1;
            if ( !base ) {
              base = powerOfTenBase;
              quotientChunk = integerPart( dividend.exponentValue / digitsPerChunk ) - integerPart( divisor.exponentValue / digitsPerChunk );
              dividendExp = dividendExp / digitsPerChunk | 0;
            }

            for ( chunkIdx = 0; divisorChunks[ chunkIdx ] === ( dividendChunks[ chunkIdx ] || 0 ); chunkIdx++ );

            if ( divisorChunks[ chunkIdx ] > ( dividendChunks[ chunkIdx ] || 0 ) && quotientChunk-- );

            if ( dividendExp < 0 ) {
              resultChunks = [ 1 ];
              tempRem = true;
            } else {
              for ( resultChunks = [], tempOffset = 0, dividendExp += 2,
                divisorLen = divisorChunks.length, dividendLen = dividendChunks.length, chunkIdx = 0,
                tempDividend = divisorChunks.slice(), tempQ = ( tempRem = dividendChunks.slice( 0, divisorLen ) ).length; tempQ < divisorLen; tempRem[ tempQ++ ] = 0 );

              tempDivisor = divisorChunks.slice();
              tempDivisor = [ 0 ].concat( tempDivisor );
              scaleFactor = divisorChunks[ 0 ];

              if ( divisorChunks[ 1 ] >= base / 2 ) {
                scaleFactor++;
              }

              do {
                if ( tempQ = 0, ( quotientChunk = compareArrays( divisorChunks, tempRem, divisorLen, tempQ = tempRem.length ) ) < 0 ) {
                  if ( ( tempDividend = tempRem[ 0 ] ) === divisorLen ) {
                    tempDividend = tempDividend * base + ( tempRem[ 1 ] || 0 );
                  }

                  if ( ( tempQ = mathFloor( tempDividend / scaleFactor ) ) > 1 ) {
                    for ( tempQ >= base && ( tempQ = base - 1 ), tempDividend = ( tempDivisor = multiplyChunkArray( divisorChunks, tempQ, base ) ).length, tempQ = tempRem.length; 1 === compareArrays( tempDivisor, tempRem, tempDividend, tempQ ); ) {
                      tempQ--;
                      subtractChunkArray( tempDivisor, divisorLen < tempDividend ? tempDivisor : divisorChunks, tempDividend, base );
                      tempDividend = tempDivisor.length;
                    }
                  } else if ( 0 === tempQ ) {
                    quotientChunk = tempQ = 1;
                    tempDividend = ( tempDivisor = divisorChunks.slice() ).length;
                  }

                  if ( tempDividend < tempQ && ( tempDivisor = [ 0 ].concat( tempDivisor ) ), subtractChunkArray( tempRem, tempDivisor, tempQ, base ), tempQ = tempRem.length, -1 === quotientChunk ) {
                    for ( ; compareArrays( divisorChunks, tempRem, divisorLen, tempQ ) < 1; ) {
                      tempQ++;
                      subtractChunkArray( tempRem, divisorLen < tempQ ? tempDivisor : divisorChunks, tempQ, base );
                      tempQ = tempRem.length;
                    }
                  }
                } else if ( 0 === quotientChunk ) {
                  tempQ++;
                  tempRem = [ 0 ];
                }
                resultChunks[ chunkIdx++ ] = tempQ;
                tempRem[ 0 ] ? tempRem[ tempQ++ ] = dividendChunks[ tempOffset ] || 0 : ( tempRem = [ dividendChunks[ tempOffset ] ], tempQ = 1 );
              } while ( ( tempOffset++ < dividendLen || null != tempRem[ 0 ] ) && dividendExp-- );
              tempRem = null != tempRem[ 0 ];
              if ( !resultChunks[ 0 ] ) {
                resultChunks.splice( 0, 1 );
              }
            }

            if ( base === powerOfTenBase ) {
              for ( chunkIdx = 1, tempDivisor = resultChunks[ 0 ]; tempDivisor >= 10; tempDivisor /= 10, chunkIdx++ );
              roundDecimal( dividend, precision + ( dividend.exponentValue = chunkIdx + quotientChunk * digitsPerChunk - 1 ) + 1, roundingMode, tempRem );
            } else {
              dividend.exponentValue = quotientChunk;
              dividend.remainder = +tempRem;
            }
            return dividend;
          };
        }();

        var basePrefixPattern = /^(-?)0([xbo])(?=\w[\w.]*$)/i,
          trailingDotPattern = /^([^.]+)\.$/,
          leadingDotPattern = /^\.([^.]+)$/,
          infinityNanPattern = /^-?(Infinity|NaN)$/,
          whitespacePattern = /^\s*\+(?=[\w.])|^\s+|\s+$/g;

        function parseInputString ( instance, inputString, isNumber, base ) {
          var baseVal, processedString = isNumber ? inputString : inputString.replace( whitespacePattern, "" );
          if ( infinityNanPattern.test( processedString ) ) {
            instance.signValue = isNaN( processedString ) ? null : ( processedString < 0 ? -1 : 1 );
          } else {
            if ( !isNumber && ( processedString = processedString.replace( basePrefixPattern, function ( match, sign, prefix ) {
                return baseVal = "x" === ( prefix = prefix.toLowerCase() ) ? 16 : ( "b" === prefix ? 2 : 8 ), base && base !== baseVal ? match : sign;
              } ), base && ( baseVal = base, processedString = processedString.replace( trailingDotPattern, "$1" ).replace( leadingDotPattern, "0.$1" ) ), inputString !== processedString ) ) {
              return new DecimalValue( processedString, baseVal );
            }
            if ( DecimalValue.DEBUG ) {
              throw Error( errorPrefix + "Not a" + ( base ? " base " + base : "" ) + " number: " + inputString );
            }
            instance.signValue = null;
          }
          instance.chunkArray = instance.exponentValue = null;
        }

        DecimalValuePrototype.absoluteValue = DecimalValuePrototype.abs = function () {
          var newDecimal = new DecimalValue( this );
          return newDecimal.signValue < 0 && ( newDecimal.signValue = 1 ), newDecimal;
        };

        DecimalValuePrototype.comparedTo = function ( value, base ) {
          return compareBigNumbers( this, new DecimalValue( value, base ) );
        };

        DecimalValuePrototype.decimalPlaces = DecimalValuePrototype.dp = function ( decimalPlaces, roundingMode ) {
          var chunk, len,
            instance = this;
          if ( decimalPlaces != null ) {
            return validateRange( decimalPlaces, 0, maxPrecisionSetting ), ( roundingMode == null ? roundingMode = DEFAULT_ROUNDING_MODE : validateRange( roundingMode, 0, 8 ) ), roundDecimal( new DecimalValue( instance ), decimalPlaces + instance.exponentValue + 1, roundingMode );
          }
          if ( !( chunk = instance.chunkArray ) ) {
            return null;
          }
          if ( len = ( ( tempVal = chunk.length - 1 ) - integerPart( this.exponentValue / digitsPerChunk ) ) * digitsPerChunk, tempVal = chunk[ tempVal ] ) {
            for ( ; tempVal % 10 === 0; tempVal /= 10, len-- );
          }
          return len < 0 && ( len = 0 ), len;
        };

        DecimalValuePrototype.dividedBy = DecimalValuePrototype.div = function ( value, base ) {
          return divisionAlgorithm( this, new DecimalValue( value, base ), DEFAULT_DECIMAL_PLACES, DEFAULT_ROUNDING_MODE );
        };

        DecimalValuePrototype.dividedToIntegerBy = DecimalValuePrototype.idiv = function ( value, base ) {
          return divisionAlgorithm( this, new DecimalValue( value, base ), 0, 1 );
        };

        DecimalValuePrototype.exponentiatedBy = DecimalValuePrototype.pow = function ( exponent, modulus ) {
          var firstOperand, secondOperand,
            tempExponent, multiplier,
            isNegativeExponent, currentMultiplier,
            tempResult, powerCheck,
            result = this;

          if ( ( exponent = new DecimalValue( exponent ) ).chunkArray && !exponent.isInteger() ) {
            throw Error( errorPrefix + "Exponent not an integer: " + toPrimitiveString( exponent ) );
          }

          if ( modulus != null ) {
            modulus = new DecimalValue( modulus );
          }

          isNegativeExponent = exponent.signValue < 0;

          if ( !result.chunkArray || !result.chunkArray[ 0 ] || ( 1 === result.chunkArray[ 0 ] && !result.exponentValue && 1 === result.chunkArray.length ) || !exponent.chunkArray || !exponent.chunkArray[ 0 ] ) {
            return powerCheck = new DecimalValue( Math.pow( +toPrimitiveString( result ), isNegativeExponent ? 2 - isOdd( exponent ) : +toPrimitiveString( exponent ) ) ), modulus ? powerCheck.mod( modulus ) : powerCheck;
          }

          if ( modulus ) {
            if ( modulus.chunkArray ? !modulus.chunkArray[ 0 ] : !modulus.signValue ) {
              return new DecimalValue( NaN );
            }
            if ( ( firstOperand = !isNegativeExponent && result.isInteger() && modulus.isInteger() ) ) {
              result = result.mod( modulus );
            }
          } else {
            if ( exponent.exponentValue > 9 && ( result.exponentValue > 0 || result.exponentValue < -1 || ( 0 === result.exponentValue ? result.chunkArray[ 0 ] > 1 || isNegativeExponent && result.chunkArray[ 1 ] >= 24e7 : result.chunkArray[ 0 ] < 8e13 || isNegativeExponent && result.chunkArray[ 0 ] <= 9999975e7 ) ) ) {
              return multiplier = result.signValue < 0 && isOdd( exponent ) ? -0 : 0, result.exponentValue > -1 && ( multiplier = 1 / multiplier ), new DecimalValue( isNegativeExponent ? 1 / multiplier : multiplier );
            }
            if ( POWER_PRECISION ) {
              multiplier = mathCeil( POWER_PRECISION / digitsPerChunk + 2 );
            }
          }

          isNegativeExponent ? ( firstOperand = new DecimalValue( 0.5 ), isNegativeExponent && ( exponent.signValue = 1 ), currentMultiplier = isOdd( exponent ) ) : currentMultiplier = ( tempExponent = Math.abs( +toPrimitiveString( exponent ) ) ) % 2;
          tempResult = new DecimalValue( ONE_DECIMAL );

          for ( ;; ) {
            if ( currentMultiplier ) {
              if ( !( tempResult = tempResult.times( result ) ).chunkArray ) {
                break;
              }
              if ( multiplier ) {
                if ( tempResult.chunkArray.length > multiplier ) {
                  tempResult.chunkArray.length = multiplier;
                }
              } else if ( firstOperand ) {
                tempResult = tempResult.mod( modulus );
              }
            }

            if ( tempExponent ) {
              if ( 0 === ( tempExponent = mathFloor( tempExponent / 2 ) ) ) {
                break;
              }
              currentMultiplier = tempExponent % 2;
            } else {
              if ( roundDecimal( exponent = exponent.times( firstOperand ), exponent.exponentValue + 1, 1 ), exponent.exponentValue > 14 ) {
                currentMultiplier = isOdd( exponent );
              } else {
                if ( 0 === ( tempExponent = +toPrimitiveString( exponent ) ) ) {
                  break;
                }
                currentMultiplier = tempExponent % 2;
              }
            }

            result = result.times( result );

            if ( multiplier ) {
              if ( result.chunkArray && result.chunkArray.length > multiplier ) {
                result.chunkArray.length = multiplier;
              }
            } else if ( firstOperand ) {
              result = result.mod( modulus );
            }
          }

          return firstOperand ? tempResult : ( isNegativeExponent && ( tempResult = ONE_DECIMAL.div( tempResult ) ), modulus ? tempResult.mod( modulus ) : multiplier ? roundDecimal( tempResult, POWER_PRECISION, DEFAULT_ROUNDING_MODE, undefined ) : tempResult );
        };

        DecimalValuePrototype.integerValue = function ( roundingMode ) {
          var newDecimal = new DecimalValue( this );
          return roundingMode == null ? roundingMode = DEFAULT_ROUNDING_MODE : validateRange( roundingMode, 0, 8 ), roundDecimal( newDecimal, newDecimal.exponentValue + 1, roundingMode );
        };

        DecimalValuePrototype.isEqualTo = DecimalValuePrototype.eq = function ( value, base ) {
          return 0 === compareBigNumbers( this, new DecimalValue( value, base ) );
        };

        DecimalValuePrototype.isFinite = function () {
          return !!this.chunkArray;
        };

        DecimalValuePrototype.isGreaterThan = DecimalValuePrototype.gt = function ( value, base ) {
          return compareBigNumbers( this, new DecimalValue( value, base ) ) > 0;
        };

        DecimalValuePrototype.isGreaterThanOrEqualTo = DecimalValuePrototype.gte = function ( value, base ) {
          var comparisonResult = compareBigNumbers( this, new DecimalValue( value, base ) );
          return 1 === comparisonResult || 0 === comparisonResult;
        };

        DecimalValuePrototype.isInteger = function () {
          return !!this.chunkArray && integerPart( this.exponentValue / digitsPerChunk ) > this.chunkArray.length - 2;
        };

        DecimalValuePrototype.isLessThan = DecimalValuePrototype.lt = function ( value, base ) {
          return compareBigNumbers( this, new DecimalValue( value, base ) ) < 0;
        };

        DecimalValuePrototype.isLessThanOrEqualTo = DecimalValuePrototype.lte = function ( value, base ) {
          var comparisonResult = compareBigNumbers( this, new DecimalValue( value, base ) );
          return -1 === comparisonResult || 0 === comparisonResult;
        };

        DecimalValuePrototype.isNaN = function () {
          return !this.signValue;
        };

        DecimalValuePrototype.isNegative = function () {
          return this.signValue < 0;
        };

        DecimalValuePrototype.isPositive = function () {
          return this.signValue > 0;
        };

        DecimalValuePrototype.isZero = function () {
          return !!this.chunkArray && 0 === this.chunkArray[ 0 ];
        };

        DecimalValuePrototype.minus = function ( value, base ) {
          var idx, len,
            isFirstLarger, carry,
            firstNum = this,
            firstSign = firstNum.signValue;

          if ( base = ( value = new DecimalValue( value, base ) ).signValue, !firstSign || !base ) {
            return new DecimalValue( NaN );
          }

          if ( firstSign !== base ) {
            return value.signValue = -base, firstNum.plus( value );
          }

          var firstExponentChunk = firstNum.exponentValue / digitsPerChunk;
          var secondExponentChunk = value.exponentValue / digitsPerChunk;
          var firstChunks = firstNum.chunkArray;
          var secondChunks = value.chunkArray;

          if ( !firstExponentChunk || !secondExponentChunk ) {
            if ( !firstChunks || !secondChunks ) {
              return firstChunks ? ( value.signValue = -base, value ) : new DecimalValue( secondChunks ? firstNum : NaN );
            }
            if ( !firstChunks[ 0 ] || !secondChunks[ 0 ] ) {
              return secondChunks[ 0 ] ? ( value.signValue = -base, value ) : new DecimalValue( firstChunks[ 0 ] ? firstNum : ( 3 === DEFAULT_ROUNDING_MODE ? -0 : 0 ) );
            }
          }

          firstExponentChunk = integerPart( firstExponentChunk );
          secondExponentChunk = integerPart( secondExponentChunk );
          firstChunks = firstChunks.slice();
          firstSign = firstExponentChunk - secondExponentChunk;

          if ( firstSign ) {
            isFirstLarger = firstSign < 0;
            if ( isFirstLarger ) {
              firstSign = -firstSign;
              carry = firstChunks;
            } else {
              secondExponentChunk = firstExponentChunk;
              carry = secondChunks;
            }
            carry.reverse();
            for ( base = firstSign; base--; carry.push( 0 ) );
            carry.reverse();
          } else {
            for ( len = ( isFirstLarger = firstChunks.length < ( idx = secondChunks.length ) ) ? firstChunks.length : idx, firstSign = idx = 0; idx < len; idx++ ) {
              if ( firstChunks[ idx ] !== secondChunks[ idx ] ) {
                isFirstLarger = firstChunks[ idx ] < secondChunks[ idx ];
                break;
              }
            }
          }

          if ( isFirstLarger && ( carry = firstChunks, firstChunks = secondChunks, secondChunks = carry, value.signValue = -value.signValue ), ( idx = ( len = secondChunks.length ) - ( carry = firstChunks.length ) ) > 0 ) {
            for ( ; idx--; firstChunks[ carry++ ] = 0 );
          }

          for ( idx = powerOfTenBase - 1; len > firstSign; ) {
            if ( firstChunks[ --len ] < secondChunks[ len ] ) {
              for ( carry = len; carry && !firstChunks[ --carry ]; firstChunks[ carry ] = idx );
              --firstChunks[ carry ];
              firstChunks[ len ] += powerOfTenBase;
            }
            firstChunks[ len ] -= secondChunks[ len ];
          }

          for ( ; 0 === firstChunks[ 0 ]; firstChunks.splice( 0, 1 ), --secondExponentChunk );

          return firstChunks[ 0 ] ? normalizeAndSet( value, firstChunks, secondExponentChunk ) : ( value.signValue = ( 3 === DEFAULT_ROUNDING_MODE ? -1 : 1 ), value.chunkArray = [ value.exponentValue = 0 ], value );
        };

        DecimalValuePrototype.modulo = DecimalValuePrototype.mod = function ( value, base ) {
          var result, sign;
          var instance = this;
          return value = new DecimalValue( value, base ),
            !instance.chunkArray || !value.signValue || ( value.chunkArray && !value.chunkArray[ 0 ] ) ?
            new DecimalValue( NaN ) :
            !value.chunkArray || ( instance.chunkArray && !instance.chunkArray[ 0 ] ) ?
            new DecimalValue( instance ) :
            ( 9 === MODULO_OPERATION_MODE ?
              ( sign = value.signValue, value.signValue = 1, result = divisionAlgorithm( instance, value, 0, 3 ), value.signValue = sign, result.signValue *= sign ) :
              result = divisionAlgorithm( instance, value, 0, MODULO_OPERATION_MODE ),
              ( value = instance.minus( result.times( value ) ) ).chunkArray[ 0 ] || 1 !== MODULO_OPERATION_MODE || ( value.signValue = instance.signValue ),
              value );
        };

        DecimalValuePrototype.multipliedBy = DecimalValuePrototype.times = function ( value, base ) {
          var firstChunk, secondChunk,
            idx, len,
            tempVal, carry,
            product, currentDigit,
            firstLength, secondLength,
            resultExponent, firstChunks,
            secondChunks, currentIdx,
            resultArray, baseVal,
            halfBase,
            instance = this;

          firstChunks = instance.chunkArray;
          secondChunks = ( value = new DecimalValue( value, base ) ).chunkArray;

          if ( !( firstChunks && secondChunks && firstChunks[ 0 ] && secondChunks[ 0 ] ) ) {
            return !instance.signValue || !value.signValue || ( firstChunks && !firstChunks[ 0 ] && !secondChunks ) || ( secondChunks && !secondChunks[ 0 ] && !firstChunks ) ?
              ( value.chunkArray = value.exponentValue = value.signValue = null ) :
              ( value.signValue *= instance.signValue, firstChunks && secondChunks ? ( value.chunkArray = [ 0 ], value.exponentValue = 0 ) : ( value.chunkArray = value.exponentValue = null ) ),
              value;
          }

          resultExponent = integerPart( instance.exponentValue / digitsPerChunk ) + integerPart( value.exponentValue / digitsPerChunk );
          value.signValue *= instance.signValue;

          if ( ( firstLength = firstChunks.length ) < ( secondLength = secondChunks.length ) ) {
            tempVal = firstChunks;
            firstChunks = secondChunks;
            secondChunks = tempVal;
            idx = firstLength;
            firstLength = secondLength;
            secondLength = idx;
          }

          len = firstLength + secondLength;
          resultArray = [];
          for ( ; len--; resultArray.push( 0 ) );

          baseVal = powerOfTenBase;
          halfBase = halfChunkBase;

          for ( idx = secondLength; --idx >= 0; ) {
            for ( firstChunk = 0, currentDigit = secondChunks[ idx ] % halfBase, product = secondChunks[ idx ] / halfBase | 0, len = idx + ( tempVal = firstLength ); len > idx; ) {
              firstChunk = ( ( carry = currentDigit * ( carry = firstChunks[ --tempVal ] % halfBase ) + ( secondChunk = product * carry + ( currentIdx = firstChunks[ tempVal ] / halfBase | 0 ) * currentDigit ) % halfBase * halfBase + resultArray[ len ] + firstChunk ) / baseVal | 0 ) + ( secondChunk / halfBase | 0 ) + product * currentIdx;
              resultArray[ len-- ] = carry % baseVal;
            }
            resultArray[ len ] = firstChunk;
          }

          return firstChunk ? ++resultExponent : resultArray.splice( 0, 1 ), normalizeAndSet( value, resultArray, resultExponent );
        };

        DecimalValuePrototype.negated = function () {
          var newDecimal = new DecimalValue( this );
          return newDecimal.signValue = -newDecimal.signValue || null, newDecimal;
        };

        DecimalValuePrototype.plus = function ( value, base ) {
          var idx,
            firstNum = this,
            firstSign = firstNum.signValue;

          if ( base = ( value = new DecimalValue( value, base ) ).signValue, !firstSign || !base ) {
            return new DecimalValue( NaN );
          }

          if ( firstSign !== base ) {
            return value.signValue = -base, firstNum.minus( value );
          }

          var firstExpChunk = firstNum.exponentValue / digitsPerChunk;
          var secondExpChunk = value.exponentValue / digitsPerChunk;
          var firstChunks = firstNum.chunkArray;
          var secondChunks = value.chunkArray;

          if ( !firstExpChunk || !secondExpChunk ) {
            if ( !firstChunks || !secondChunks ) {
              return new DecimalValue( firstSign / 0 );
            }
            if ( !firstChunks[ 0 ] || !secondChunks[ 0 ] ) {
              return secondChunks[ 0 ] ? value : new DecimalValue( firstChunks[ 0 ] ? firstNum : 0 * firstSign );
            }
          }

          firstExpChunk = integerPart( firstExpChunk );
          secondExpChunk = integerPart( secondExpChunk );
          firstChunks = firstChunks.slice();
          firstSign = firstExpChunk - secondExpChunk;

          if ( firstSign ) {
            if ( firstSign > 0 ) {
              secondExpChunk = firstExpChunk;
              idx = secondChunks;
            } else {
              firstSign = -firstSign;
              idx = firstChunks;
            }
            idx.reverse();
            for ( ; firstSign--; idx.push( 0 ) );
            idx.reverse();
          }

          if ( ( firstSign = firstChunks.length ) - ( base = secondChunks.length ) < 0 && ( idx = secondChunks, secondChunks = firstChunks, firstChunks = idx, base = firstSign ), firstSign = 0, base ) {
            for ( ; base--; ) {
              firstSign = ( firstChunks[ base ] = firstChunks[ base ] + secondChunks[ base ] + firstSign ) / powerOfTenBase | 0;
              firstChunks[ base ] = powerOfTenBase === firstChunks[ base ] ? 0 : firstChunks[ base ] % powerOfTenBase;
            }
          }

          return firstSign && ( firstChunks = [ firstSign ].concat( firstChunks ), ++secondExpChunk ), normalizeAndSet( value, firstChunks, secondExpChunk );
        };

        DecimalValuePrototype.precision = DecimalValuePrototype.sd = function ( significantDigits, roundingMode ) {
          var chunk, len,
            instance = this;
          if ( significantDigits != null && significantDigits !== !!significantDigits ) {
            return validateRange( significantDigits, 1, maxPrecisionSetting ), ( roundingMode == null ? roundingMode = DEFAULT_ROUNDING_MODE : validateRange( roundingMode, 0, 8 ) ), roundDecimal( new DecimalValue( instance ), significantDigits, roundingMode );
          }
          if ( !( chunk = instance.chunkArray ) ) {
            return null;
          }
          if ( len = ( ( tempVal = chunk.length - 1 ) * digitsPerChunk ) + 1, tempVal = chunk[ tempVal ] ) {
            for ( ; tempVal % 10 === 0; tempVal /= 10, len-- );
            for ( tempVal = chunk[ 0 ]; tempVal >= 10; tempVal /= 10, len++ );
          }
          return significantDigits && instance.exponentValue + 1 > len && ( len = instance.exponentValue + 1 ), len;
        };

        DecimalValuePrototype.shiftedBy = function ( shiftAmount ) {
          return validateRange( shiftAmount, -maxSafeInteger, maxSafeInteger ), this.times( "1e" + shiftAmount );
        };

        DecimalValuePrototype.squareRoot = DecimalValuePrototype.sqrt = function () {
          var resultNum, tempResult,
            tempVal, tempStr,
            sqrtInstance, currentInstance,
            instance = this,
            chunkArray = instance.chunkArray,
            signValue = instance.signValue,
            exponentValue = instance.exponentValue,
            precision = DEFAULT_DECIMAL_PLACES + 4,
            half = new DecimalValue( "0.5" );

          if ( 1 !== signValue || !chunkArray || !chunkArray[ 0 ] ) {
            return new DecimalValue( !signValue || signValue < 0 && ( !chunkArray || chunkArray[ 0 ] ) ? NaN : ( chunkArray ? instance : 1 / 0 ) );
          }

          if ( 0 === ( signValue = Math.sqrt( +toPrimitiveString( instance ) ) ) || signValue === 1 / 0 ) {
            if ( ( ( tempResult = formatChunks( chunkArray ) ).length + exponentValue ) % 2 === 0 && ( tempResult += "0" ), signValue = Math.sqrt( +tempResult ), exponentValue = integerPart( ( exponentValue + 1 ) / 2 ) - ( exponentValue < 0 || exponentValue % 2 ), sqrtInstance = new DecimalValue( tempStr = signValue === 1 / 0 ? "1e" + exponentValue : ( tempResult = signValue.toExponential() ).slice( 0, tempResult.indexOf( "e" ) + 1 ) + exponentValue ) );
          } else {
            sqrtInstance = new DecimalValue( signValue + "" );
          }

          if ( sqrtInstance.chunkArray[ 0 ] ) {
            for ( ( signValue = ( exponentValue = sqrtInstance.exponentValue ) + precision ) < 3 && ( signValue = 0 );; ) {
              if ( currentInstance = sqrtInstance, sqrtInstance = half.times( currentInstance.plus( divisionAlgorithm( instance, currentInstance, precision, 1 ) ) ), formatChunks( currentInstance.chunkArray ).slice( 0, signValue ) === ( tempResult = formatChunks( sqrtInstance.chunkArray ) ).slice( 0, signValue ) ) {
                if ( sqrtInstance.exponentValue < exponentValue && ( --signValue ), "9999" !== ( tempResult = tempResult.slice( signValue - 3, signValue + 1 ) ) && ( tempVal || "4999" !== tempResult ) ) {
                  if ( +tempResult && ( +tempResult.slice( 1 ) || "5" !== tempResult.charAt( 0 ) ) || ( roundDecimal( sqrtInstance, sqrtInstance.exponentValue + DEFAULT_DECIMAL_PLACES + 2, 1 ), resultNum = !sqrtInstance.times( sqrtInstance ).eq( instance ) ), resultNum ) {
                    break;
                  }
                }
                if ( !tempVal && ( roundDecimal( currentInstance, currentInstance.exponentValue + DEFAULT_DECIMAL_PLACES + 2, 0 ), currentInstance.times( currentInstance ).eq( instance ) ) ) {
                  sqrtInstance = currentInstance;
                  break;
                }
                precision += 4;
                signValue += 4;
                tempVal = true;
              }
            }
          }
          return roundDecimal( sqrtInstance, sqrtInstance.exponentValue + DEFAULT_DECIMAL_PLACES + 1, DEFAULT_ROUNDING_MODE, resultNum );
        };

        DecimalValuePrototype.toExponential = function ( decimalPlaces, roundingMode ) {
          return decimalPlaces != null && ( validateRange( decimalPlaces, 0, maxPrecisionSetting ), decimalPlaces++ ), formatToString( this, decimalPlaces, roundingMode, 1 );
        };

        DecimalValuePrototype.toFixed = function ( decimalPlaces, roundingMode ) {
          return decimalPlaces != null && ( validateRange( decimalPlaces, 0, maxPrecisionSetting ), decimalPlaces = decimalPlaces + this.exponentValue + 1 ), formatToString( this, decimalPlaces, roundingMode );
        };

        DecimalValuePrototype.toFormat = function ( decimalPlaces, roundingMode, formatOptions ) {
          var formattedString, tempOptions = this;
          if ( formatOptions == null ) {
            if ( decimalPlaces != null && roundingMode && typeof roundingMode === 'object' ) {
              formatOptions = roundingMode;
              roundingMode = null;
            } else if ( decimalPlaces && typeof decimalPlaces === 'object' ) {
              formatOptions = decimalPlaces;
              decimalPlaces = roundingMode = null;
            } else {
              formatOptions = FORMAT_SETTINGS;
            }
          } else if ( typeof formatOptions !== 'object' ) {
            throw Error( errorPrefix + "Argument not an object: " + formatOptions );
          }

          formattedString = tempOptions.toFixed( decimalPlaces, roundingMode );

          if ( tempOptions.chunkArray ) {
            var tempIdx,
              parts = formattedString.split( "." ),
              groupSize = +formatOptions.groupSize,
              secondaryGroupSize = +formatOptions.secondaryGroupSize,
              groupSeparator = formatOptions.groupSeparator || "",
              integerPart = parts[ 0 ],
              fractionPart = parts[ 1 ],
              isNegative = tempOptions.signValue < 0,
              absInteger = isNegative ? integerPart.slice( 1 ) : integerPart,
              absIntegerLength = absInteger.length;

            if ( secondaryGroupSize && ( tempIdx = groupSize, groupSize = secondaryGroupSize, secondaryGroupSize = tempIdx, absIntegerLength -= tempIdx ) );

            if ( groupSize > 0 && absIntegerLength > 0 ) {
              for ( tempIdx = absIntegerLength % groupSize || groupSize, integerPart = absInteger.substr( 0, tempIdx ); tempIdx < absIntegerLength; tempIdx += groupSize ) {
                integerPart += groupSeparator + absInteger.substr( tempIdx, groupSize );
              }
              if ( secondaryGroupSize > 0 ) {
                integerPart += groupSeparator + absInteger.slice( tempIdx );
              }
              if ( isNegative ) {
                integerPart = "-" + integerPart;
              }
            }

            formattedString = fractionPart ? integerPart + ( formatOptions.decimalSeparator || "" ) + ( ( tempIdx = +formatOptions.fractionGroupSize ) ? fractionPart.replace( new RegExp( "\\d{" + tempIdx + "}\\B", "g" ), "$&" + ( formatOptions.fractionGroupSeparator || "" ) ) : fractionPart ) : integerPart;
          }
          return ( formatOptions.prefix || "" ) + formattedString + ( formatOptions.suffix || "" );
        };

        DecimalValuePrototype.toFraction = function ( maxDenominator ) {
          var numerator, denominator,
            numeratorPrev, denominatorPrev,
            remainder, quotient,
            tempNum, tempDen,
            exponent, currentNum,
            precision, originalRange,
            result,
            instance = this,
            chunkArray = instance.chunkArray;

          if ( maxDenominator != null && ( !( ( tempNum = new DecimalValue( maxDenominator ) ).isInteger() && ( tempNum.chunkArray || 1 !== tempNum.signValue ) ) || tempNum.lt( ONE_DECIMAL ) ) ) {
            throw Error( errorPrefix + "Argument " + ( tempNum.isInteger() ? "out of range: " : "not an integer: " ) + toPrimitiveString( tempNum ) );
          }

          if ( !chunkArray ) {
            return new DecimalValue( instance );
          }

          numerator = new DecimalValue( ONE_DECIMAL );
          currentNum = new DecimalValue( ONE_DECIMAL );
          numeratorPrev = new DecimalValue( ONE_DECIMAL );
          denominatorPrev = new DecimalValue( ONE_DECIMAL );

          result = formatChunks( chunkArray );
          numerator.exponentValue = result.length - instance.exponentValue - 1;
          numerator.chunkArray[ 0 ] = powersOfTenLookup[ ( exponent = numerator.exponentValue % digitsPerChunk ) < 0 ? digitsPerChunk + exponent : exponent ];

          maxDenominator = !maxDenominator || tempNum.comparedTo( numerator ) > 0 ? ( numerator.exponentValue > 0 ? numerator : currentNum ) : tempNum;
          originalRange = RANGE_MAX;
          RANGE_MAX = 1 / 0;

          tempNum = new DecimalValue( result );
          denominatorPrev.chunkArray[ 0 ] = 0;

          while ( 1 !== ( quotient = currentNum.plus( ( remainder = divisionAlgorithm( tempNum, numerator, 0, 1 ) ).times( denominatorPrev ) ) ).comparedTo( maxDenominator ) ) {
            currentNum = denominatorPrev;
            denominatorPrev = quotient;
            numeratorPrev = numeratorPrev.plus( remainder.times( ( tempDen = numeratorPrev ) ) );
            tempDen = remainder;
            numerator = tempNum.minus( remainder.times( ( tempNum = numerator ) ) );
            tempNum = tempNum;
          }

          quotient = divisionAlgorithm( maxDenominator.minus( currentNum ), denominatorPrev, 0, 1 );
          numeratorPrev = numeratorPrev.plus( quotient.times( tempDen ) );
          currentNum = currentNum.plus( quotient.times( denominatorPrev ) );
          numeratorPrev.signValue = currentNum.signValue = instance.signValue;

          precision = numerator.exponentValue * 2;
          result = divisionAlgorithm( tempDen, denominatorPrev, precision, DEFAULT_ROUNDING_MODE ).minus( instance ).abs().comparedTo( divisionAlgorithm( numeratorPrev, currentNum, precision, DEFAULT_ROUNDING_MODE ).minus( instance ).abs() ) < 1 ? [ tempDen, denominatorPrev ] : [ numeratorPrev, currentNum ];
          RANGE_MAX = originalRange;
          return result;
        };

        DecimalValuePrototype.toNumber = function () {
          return +toPrimitiveString( this );
        };

        DecimalValuePrototype.toPrecision = function ( significantDigits, roundingMode ) {
          return significantDigits != null && validateRange( significantDigits, 1, maxPrecisionSetting ), formatToString( this, significantDigits, roundingMode, 2 );
        };

        DecimalValuePrototype.toString = function ( base ) {
          var str,
            instance = this,
            signVal = instance.signValue,
            exponentVal = instance.exponentValue;

          if ( exponentVal === null ) {
            str = signVal ? ( str = "Infinity", signVal < 0 && ( str = "-" + str ) ) : ( str = "NaN" );
          } else {
            if ( base == null ) {
              str = exponentVal <= EXP_AT_LOWER || exponentVal >= EXP_AT_UPPER ?
                formatExponential( formatChunks( instance.chunkArray ), exponentVal ) :
                insertDecimal( formatChunks( instance.chunkArray ), exponentVal, "0" );
            } else if ( 10 === base ) {
              str = insertDecimal( formatChunks( ( instance = roundDecimal( new DecimalValue( instance ), DEFAULT_DECIMAL_PLACES + exponentVal + 1 ) ).chunkArray ), instance.exponentValue, "0" );
            } else {
              validateRange( base, 2, BASE_ALPHABET.length, "Base" );
              str = baseConversionUtil( insertDecimal( formatChunks( instance.chunkArray ), exponentVal, "0" ), 10, base, signVal, true );
            }
            if ( signVal < 0 && instance.chunkArray[ 0 ] ) {
              str = "-" + str;
            }
          }
          return str;
        };

        DecimalValuePrototype.valueOf = DecimalValuePrototype.toJSON = function () {
          return toPrimitiveString( this );
        };

        DecimalValuePrototype._isBigNumber = true;

        if ( configObject != null ) {
          DecimalValue.set( configObject );
        }

        return DecimalValue;
      }() ).default = randomNumberGen.BigNumber = randomNumberGen,
      ( typeof ( bigNumberExport = function () {
        return randomNumberGen;
      }.call( moduleExports, internalRequire, moduleExports, currentModule ) ) === 'undefined' || ( currentModule.exports = bigNumberExport ) );
    }() );
  }
] );