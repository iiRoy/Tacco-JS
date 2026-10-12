module.exports = function( moduleDefinitions ) {
  // Cache for already loaded modules
  var loadedModulesCache = {};

  // Main module resolution function, similar to webpack's __webpack_require__
  function moduleResolver( currentModuleId ) {
    // If module is already in cache, return its exports
    if ( loadedModulesCache[currentModuleId] ) {
      return loadedModulesCache[currentModuleId].exports;
    }

    // Create a new module instance and add it to the cache
    var moduleInstance = loadedModulesCache[currentModuleId] = {
      moduleId: currentModuleId, // The identifier for this module
      isLoaded: false,           // Flag to indicate if module has been loaded
      exports: {}                // The exports object for the module
    };

    // Execute the module function, passing module context and the resolver itself
    moduleDefinitions[currentModuleId].call( moduleInstance.exports, moduleInstance, moduleInstance.exports, moduleResolver );

    // Mark module as loaded
    moduleInstance.isLoaded = true;

    // Return the module's exports
    return moduleInstance.exports;
  }

  // Store all module definitions on the resolver
  moduleResolver.allDefinitions = moduleDefinitions;
  // Store the module cache on the resolver
  moduleResolver.moduleCache = loadedModulesCache;

  // Helper to define export properties with getters
  moduleResolver.defineExportGetters = function( targetObject, propertyName, getterFunction ) {
    moduleResolver.objectHasProperty( targetObject, propertyName ) || Object.defineProperty( targetObject, propertyName, {
      enumerable: true, // Make property enumerable
      get: getterFunction // Define a getter for the property
    });
  };

  // Helper to register harmony exports for ES module compatibility
  moduleResolver.registerHarmonyExports = function( targetObject ) {
    if ( typeof Symbol !== "undefined" && Symbol.toStringTag ) {
      Object.defineProperty( targetObject, Symbol.toStringTag, {
        value: "Module"
      });
    }
    Object.defineProperty( targetObject, "__esModule", {
      value: true
    });
  };

  // Helper to create a synthetic namespace object for module interoperability
  moduleResolver.createNamespaceObject = function( moduleContent, flagValue ) {
    // If flag 1 is set, resolve module content first
    if ( 1 & flagValue ) {
      moduleContent = moduleResolver( moduleContent );
    }
    // If flag 8 is set, return content directly
    if ( 8 & flagValue ) {
      return moduleContent;
    }
    // If flag 4 is set and it's an object with __esModule, return it
    if ( 4 & flagValue && typeof moduleContent === "object" && moduleContent && moduleContent.__esModule ) {
      return moduleContent;
    }

    // Create a new namespace object
    var syntheticNamespace = Object.create( null );
    moduleResolver.registerHarmonyExports( syntheticNamespace ); // Register as ES module
    Object.defineProperty( syntheticNamespace, "default", {
      enumerable: true,
      value: moduleContent
    });
    // If flag 2 is set and content is not a string, iterate and define getters
    if ( 2 & flagValue && typeof moduleContent !== "string" ) {
      for ( var propName in moduleContent ) {
        moduleResolver.defineExportGetters( syntheticNamespace, propName, function( currentProp ) {
          return moduleContent[currentProp];
        }.bind( null, propName ));
      }
    }
    return syntheticNamespace;
  };

  // Helper to retrieve the default export from a module
  moduleResolver.retrieveDefaultExport = function( moduleContent ) {
    var defaultGetter = moduleContent && moduleContent.__esModule ? function() {
      return moduleContent.default;
    } : function() {
      return moduleContent;
    };
    moduleResolver.defineExportGetters( defaultGetter, "a", defaultGetter );
    return defaultGetter;
  };

  // Helper to check for own property existence
  moduleResolver.objectHasProperty = function( targetObject, propertyKey ) {
    return Object.prototype.hasOwnProperty.call( targetObject, propertyKey );
  };

  // Public path for assets (empty in this case)
  moduleResolver.basePath = "";

  // Set the entry point and start module resolution
  return moduleResolver( moduleResolver.entryPoint = 0 );
}(
  [
    // Module 0: Application Entry Point
    function( moduleRef, exportedContent, depLoader ) {
      // Read input from stdin, split by newline, and pass to module 1 for processing
      depLoader( 1 )( depLoader( 3 ).readFileSync( "/dev/stdin", "UTF-8" ).split( "\n" ) );
    },

    // Module 1: Prime Factorization and Calculation Logic
    function( moduleObj, exportedObj, dependencyLoader ) {
      // Load the BigNumber library from module 2
      var largeNumberProcessor = dependencyLoader( 2 );

      // Export a function that takes an array of input lines
      moduleObj.exports = function( inputLineArray ) {
        var factorCountsMap = {}; // Stores prime factors and their total counts across all numbers
        var currentNumericValue = Number( inputLineArray[0] ); // Get the upper limit from the first line of input

        // Iterate from the upper limit down to 2
        for ( ; currentNumericValue >= 2; currentNumericValue-- ) {
          var limitForDivisors = Math.ceil( Math.sqrt( currentNumericValue ) ); // Optimization: check divisors up to sqrt
          var primeFactorOccurrences = 0; // Counts how many distinct prime factors found for currentNumericValue

          // Iterate through possible divisors starting from 2
          for ( var testDivisor = 2; testDivisor <= limitForDivisors; testDivisor++ ) {
            // If currentNumericValue is divisible by testDivisor, it's a prime factor
            if ( currentNumericValue % testDivisor === 0 ) {
              primeFactorOccurrences += 1; // Increment distinct prime factor count
              var primePower = 0; // Count the exponent of this prime factor
              var remainingNumber = currentNumericValue; // Temporary variable for division

              // Find the exponent of the current prime factor
              for ( ; remainingNumber % testDivisor === 0; ) {
                remainingNumber /= testDivisor;
                primePower += 1;
              }

              // Add or update the count of this prime factor in the map
              if ( !factorCountsMap[testDivisor] ) {
                factorCountsMap[testDivisor] = 0;
              }
              factorCountsMap[testDivisor] += primePower;
            }
          }

          // If no divisors were found (primeFactorOccurrences is 0), currentNumericValue itself is prime
          if ( primeFactorOccurrences === 0 ) {
            if ( !factorCountsMap[currentNumericValue] ) {
              factorCountsMap[currentNumericValue] = 0;
            }
            factorCountsMap[currentNumericValue] += 1;
          }
        }

        // Initialize a BigNumber with value 1 for the final product calculation
        var finalProductResult = new largeNumberProcessor( 1 );

        // Calculate the final product using the formula (p1^e1 + 1) * (p2^e2 + 1) ...
        for ( var primeFactorKey in factorCountsMap ) {
          finalProductResult = finalProductResult.times( factorCountsMap[primeFactorKey] + 1 );
        }

        // Output the result to console
        console.log( finalProductResult.convertToString() );
      };
    },

    // Module 2: BigNumber.js Library Implementation
    function( moduleRef, exportedObj, depLoader ) {
      var bigNumConstructor; // Variable to hold the BigNumber constructor

      ( function( globalContext ) {
        "use strict"; // Enforce strict mode

        var largeNumPrototype, // Reference to the BigNumber constructor (will be assigned later)
          numStringPattern = /^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i, // Regex for numeric strings
          ceilingFunction = Math.ceil, // Reference to Math.ceil
          floorFunction = Math.floor,   // Reference to Math.floor
          errorMsgPrefix = "[BigNumber Error] ", // Prefix for error messages
          precisionWarnMessage = errorMsgPrefix + "Number primitive has more than 15 significant digits: ", // Warning for JS number precision
          baseConstantTenPow14 = 100000000000000, // 1e14, used for coefficient arithmetic
          chunkSize = 14, // Number of digits per coefficient chunk
          maxSafeIntJS = 9007199254740991, // JavaScript's MAX_SAFE_INTEGER
          tenPowersLookup = [1, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000, 10000000000, 100000000000, 1000000000000, 10000000000000], // Powers of 10 for quick lookups
          divisorConstant = 10000000, // 1e7, used in multiplication
          maxPrecisionLimit = 1000000000; // 1e9, maximum precision setting

        // Helper to floor a number, handling negative values correctly
        function integerFloor( value ) {
          var intValue = value | 0;
          return value > 0 || value === intValue ? intValue : intValue - 1;
        }

        // Helper to format coefficient array into a string
        function formatCoefficients( coeffArray ) {
          var index = 1,
            arrayLength = coeffArray.length,
            resultString = coeffArray[0] + "";
          for ( ; index < arrayLength; ) {
            var currentCoeffString = coeffArray[index++] + "";
            var paddingLength = chunkSize - currentCoeffString.length;
            for ( ; paddingLength--; currentCoeffString = "0" + currentCoeffString );
            resultString += currentCoeffString;
          }
          // Trim trailing zeros
          for ( arrayLength = resultString.length; 48 === resultString.charCodeAt( --arrayLength ); );
          return resultString.slice( 0, arrayLength + 1 || 1 );
        }

        // Helper to compare two BigNumber instances
        function compareNumericValues( numA, numB ) {
          var coeffsA = numA.coeffs,
            coeffsB = numB.coeffs,
            signA = numA.sign,
            signB = numB.sign,
            expA = numA.exponent,
            expB = numB.exponent;

          // Handle NaN or zero values
          if ( !signA || !signB ) return null;
          if ( !coeffsA && !coeffsB ) return 0;
          if ( !coeffsA || !coeffsB ) return coeffsA ? signA : -signB;

          // Compare signs
          if ( signA !== signB ) return signA;

          // Check if one number is zero
          if ( !coeffsA[0] && !coeffsB[0] ) return 0;

          // Compare exponents
          if ( expA !== expB ) return expA > expB ^ ( signA < 0 ) ? 1 : -1;

          // Compare coefficients
          var lenA = coeffsA.length,
            lenB = coeffsB.length;
          var minLen = lenA < lenB ? lenA : lenB;
          for ( var idx = 0; idx < minLen; idx++ ) {
            if ( coeffsA[idx] !== coeffsB[idx] ) return coeffsA[idx] > coeffsB[idx] ^ ( signA < 0 ) ? 1 : -1;
          }

          // If prefixes are same, compare lengths
          return lenA === lenB ? 0 : lenA > lenB ^ ( signA < 0 ) ? 1 : -1;
        }

        // Helper to validate numeric arguments against min/max and integer constraints
        function validateParameter( val, min, max, name ) {
          if ( val < min || val > max || val !== floorFunction( val ) ) {
            throw Error( errorMsgPrefix + ( name || "Argument" ) + ( typeof val === "number" ? val < min || val > max ? " out of range: " : " not an integer: " : " not a primitive number: " ) + String( val ) );
          }
        }

        // Helper to check if a BigNumber's coefficient array represents an odd number
        function isNumberOdd( bigNum ) {
          var lastCoeffIndex = bigNum.coeffs.length - 1;
          return integerFloor( bigNum.exponent / chunkSize ) === lastCoeffIndex && bigNum.coeffs[lastCoeffIndex] % 2 !== 0;
        }

        // Helper to format a number into exponential notation string
        function toExponentialFormat( coefficientString, exponentVal ) {
          return ( coefficientString.length > 1 ? coefficientString.charAt( 0 ) + "." + coefficientString.slice( 1 ) : coefficientString ) + ( exponentVal < 0 ? "e" : "e+" ) + exponentVal;
        }

        // Helper to insert a decimal point into a number string
        function insertDecimalPointAt( numString, exponentVal, paddingChar ) {
          var targetLength, resultString;
          if ( exponentVal < 0 ) {
            for ( resultString = paddingChar + "."; ++exponentVal; resultString += paddingChar );
            numString = resultString + numString;
          } else if ( ++exponentVal > ( targetLength = numString.length ) ) {
            for ( resultString = paddingChar, exponentVal -= targetLength; --exponentVal; resultString += paddingChar );
            numString += resultString;
          } else if ( exponentVal < targetLength ) {
            numString = numString.slice( 0, exponentVal ) + "." + numString.slice( exponentVal );
          }
          return numString;
        }

        // BigNumber class definition factory
        largeNumPrototype = function bigNumFactory( configOptions ) {
          var temporaryVarOne, temporaryVarTwo, // Unused/temporary local vars
            parseInputHelper, convertNumberToBase, // Function references
            hexBinOctalPrefixPattern = /^(-?)0([xbo])(?=\w[\w.]*$)/i, // Regex for hex/binary/octal prefixes
            trailingDecimalPattern = /^([^.]+)\.$/, // Regex for trailing decimal point
            leadingDecimalPattern = /^\.([^.]+)$/,  // Regex for leading decimal point
            infinityNaNSignature = /^-?(Infinity|NaN)$/, // Regex for Infinity/NaN
            leadingTrailingWhitespace = /^\s*\+(?=[\w.])|^\s+|\s+$/g, // Regex to trim whitespace and leading plus
            bigNumMethods = BigNumberClass.prototype = {
              constructor: BigNumberClass,
              convertToString: null,
              getValue: null
            },
            oneBigNumInstance = new BigNumberClass( 1 ), // BigNumber instance for 1
            decimalPlaceCount = 20, // Default decimal places
            currentRoundingMode = 4, // Default rounding mode (ROUND_HALF_UP)
            expFormatLowerBound = -7, // Default exponential format lower bound
            expFormatUpperBound = 21, // Default exponential format upper bound
            rangeLowerLimit = -10000000, // Default range lower limit (1e7)
            rangeUpperLimit = 10000000,  // Default range upper limit (1e7)
            useCryptoRandom = false, // Default to not use crypto random
            moduloCalculationMode = 1, // Default modulo mode (ROUND_DOWN)
            powerOperationPrecision = 0, // Default precision for power operations
            outputFormatSettings = {
              prefix: "",
              groupSize: 3,
              secondaryGroupSize: 0,
              groupSeparator: ",",
              decimalSeparator: ".",
              fractionGroupSize: 0,
              fractionGroupSeparator: " ",
              suffix: ""
            },
            customAlphabetChars = "0123456789abcdefghijklmnopqrstuvwxyz"; // Default alphabet for custom bases

          // BigNumber constructor function
          function BigNumberClass( value, base ) {
            var baseCharIndex, charValue, caseSensitiveFlag, decimalPointPosition, charIndex, isNumericInput, stringLength, inputString, instanceRef = this;

            // Ensure `new` keyword is used
            if ( !( instanceRef instanceof BigNumberClass ) ) return new BigNumberClass( value, base );

            // Handle cloning an existing BigNumber instance
            if ( base === null ) { // Using `null` as a sentinel for cloning, as `undefined` is default
              if ( value && true === value._isLargeNumber ) {
                instanceRef.sign = value.sign;
                if ( !value.coeffs || value.exponent > rangeUpperLimit ) {
                  instanceRef.coeffs = instanceRef.exponent = null;
                } else if ( value.exponent < rangeLowerLimit ) {
                  instanceRef.coeffs = [instanceRef.exponent = 0];
                } else {
                  instanceRef.exponent = value.exponent;
                  instanceRef.coeffs = value.coeffs.slice();
                }
                return;
              }
              inputString = String( value );
              isNumericInput = ( typeof value === "number" ) && ( 0 * value === 0 ); // Check for valid number
              if ( isNumericInput ) {
                instanceRef.sign = 1 / value < 0 ? ( value = -value, -1 ) : 1;
                if ( value === floorFunction( value ) ) { // If it's an integer
                  for ( decimalPointPosition = 0, charIndex = value; charIndex >= 10; charIndex /= 10, decimalPointPosition++ );
                  if ( decimalPointPosition > rangeUpperLimit ) {
                    instanceRef.coeffs = instanceRef.exponent = null;
                  } else {
                    instanceRef.exponent = decimalPointPosition;
                    instanceRef.coeffs = [value];
                  }
                  return;
                }
              } else if ( !numStringPattern.test( inputString ) ) {
                parseInputString( instanceRef, inputString, isNumericInput );
                return;
              }
              decimalPointPosition = inputString.indexOf( "." );
              if ( decimalPointPosition > -1 ) {
                inputString = inputString.replace( ".", "" );
              }
              charIndex = inputString.search( /e/i );
              if ( charIndex > 0 ) {
                if ( decimalPointPosition < 0 ) decimalPointPosition = charIndex;
                decimalPointPosition += +inputString.slice( charIndex + 1 );
                inputString = inputString.substring( 0, charIndex );
              } else if ( decimalPointPosition < 0 ) {
                decimalPointPosition = inputString.length;
              }
            } else { // Handle custom base input
              validateParameter( base, 2, customAlphabetChars.length, "Base" );
              if ( base === 10 ) {
                instanceRef = new BigNumberClass( value );
                return roundBigNumberToPrecision( instanceRef, decimalPlaceCount + instanceRef.exponent + 1, currentRoundingMode );
              }
              inputString = String( value );
              isNumericInput = ( typeof value === "number" );
              if ( isNumericInput ) {
                if ( 0 * value !== 0 ) {
                  parseInputString( instanceRef, inputString, isNumericInput, base );
                  return;
                }
                instanceRef.sign = 1 / value < 0 ? ( inputString = inputString.slice( 1 ), -1 ) : 1;
                if ( BigNumberClass.DEBUG && inputString.replace( /^0\.0*|\./, "" ).length > 15 ) {
                  throw Error( precisionWarnMessage + value );
                }
              } else {
                instanceRef.sign = 45 === inputString.charCodeAt( 0 ) ? ( inputString = inputString.slice( 1 ), -1 ) : 1;
              }

              for ( baseCharIndex = customAlphabetChars.slice( 0, base ), decimalPointPosition = charIndex = 0, stringLength = inputString.length; charIndex < stringLength; charIndex++ ) {
                charValue = inputString.charAt( charIndex );
                if ( baseCharIndex.indexOf( charValue ) < 0 ) {
                  if ( "." === charValue ) {
                    if ( charIndex > decimalPointPosition ) {
                      decimalPointPosition = stringLength;
                      continue;
                    }
                  } else if ( !caseSensitiveFlag && ( ( inputString === inputString.toUpperCase() && ( inputString = inputString.toLowerCase() ) ) || ( inputString === inputString.toLowerCase() && ( inputString = inputString.toUpperCase() ) ) ) ) {
                    caseSensitiveFlag = true;
                    charIndex = -1;
                    decimalPointPosition = 0;
                    continue;
                  }
                  parseInputString( instanceRef, String( value ), isNumericInput, base );
                  return;
                }
              }

              isNumericInput = false;
              inputString = convertNumberToBase( inputString, base, 10, instanceRef.sign );
              decimalPointPosition = inputString.indexOf( "." );
              if ( decimalPointPosition > -1 ) {
                inputString = inputString.replace( ".", "" );
              } else {
                decimalPointPosition = inputString.length;
              }
            }

            // Remove leading zeros
            for ( charIndex = 0; 48 === inputString.charCodeAt( charIndex ); charIndex++ );
            // Remove trailing zeros
            for ( stringLength = inputString.length; 48 === inputString.charCodeAt( --stringLength ); );

            if ( ( inputString = inputString.slice( charIndex, ++stringLength ) ) ) {
              stringLength -= charIndex;
              if ( isNumericInput && BigNumberClass.DEBUG && stringLength > 15 && ( value > maxSafeIntJS || value !== floorFunction( value ) ) ) {
                throw Error( precisionWarnMessage + instanceRef.sign * value );
              }
              decimalPointPosition = decimalPointPosition - charIndex - 1;
              if ( decimalPointPosition > rangeUpperLimit ) {
                instanceRef.coeffs = instanceRef.exponent = null;
              } else if ( decimalPointPosition < rangeLowerLimit ) {
                instanceRef.coeffs = [instanceRef.exponent = 0];
              } else {
                instanceRef.exponent = decimalPointPosition;
                instanceRef.coeffs = [];
                charIndex = ( decimalPointPosition + 1 ) % chunkSize;
                if ( decimalPointPosition < 0 ) charIndex += chunkSize;
                if ( charIndex < stringLength ) {
                  charIndex && instanceRef.coeffs.push( +inputString.slice( 0, charIndex ) );
                  for ( stringLength -= chunkSize; charIndex < stringLength; ) {
                    instanceRef.coeffs.push( +inputString.slice( charIndex, charIndex += chunkSize ) );
                  }
                  charIndex = chunkSize - ( inputString = inputString.slice( charIndex ) ).length;
                } else {
                  charIndex -= stringLength;
                }
                for ( ; charIndex--; inputString += "0" );
                instanceRef.coeffs.push( +inputString );
              }
            } else {
              instanceRef.coeffs = [instanceRef.exponent = 0];
            }
          }

          // Formats a BigNumber to a string based on specified parameters
          function formatNumberToString( bigNum, decimalPlaces, roundingMode, formatType ) {
            var currentDigit, roundedExponent, coefficientLength, stringifiedCoeffs, formattedString;

            // If roundingMode is not provided, use default
            if ( roundingMode === null ) roundingMode = currentRoundingMode;
            // Validate roundingMode
            validateParameter( roundingMode, 0, 8 );

            // If BigNumber has no coefficients, return special string
            if ( !bigNum.coeffs ) return bigNum.convertToString();

            currentDigit = bigNum.coeffs[0];

            // If decimalPlaces is not provided, return default string format
            if ( decimalPlaces === null ) {
              stringifiedCoeffs = formatCoefficients( bigNum.coeffs );
              formattedString = formatType === 1 || ( formatType === 2 && ( bigNum.exponent <= expFormatLowerBound || bigNum.exponent >= expFormatUpperBound ) ) ? toExponentialFormat( stringifiedCoeffs, bigNum.exponent ) : insertDecimalPointAt( stringifiedCoeffs, bigNum.exponent, "0" );
            } else {
              // Round the number to the specified decimalPlaces
              bigNum = roundBigNumberToPrecision( new BigNumberClass( bigNum ), decimalPlaces, roundingMode );
              roundedExponent = bigNum.exponent;
              stringifiedCoeffs = formatCoefficients( bigNum.coeffs );
              coefficientLength = stringifiedCoeffs.length;

              // Apply exponential or fixed format based on formatType
              if ( formatType === 1 || ( formatType === 2 && ( decimalPlaces <= roundedExponent || roundedExponent <= expFormatLowerBound ) ) ) {
                for ( ; coefficientLength < decimalPlaces; stringifiedCoeffs += "0", coefficientLength++ );
                formattedString = toExponentialFormat( stringifiedCoeffs, roundedExponent );
              } else if ( ( decimalPlaces -= roundedExponent ) > 0 ) {
                formattedString = insertDecimalPointAt( stringifiedCoeffs, roundedExponent, "0" );
                if ( roundedExponent + 1 > coefficientLength ) {
                  for ( formattedString += "."; decimalPlaces--; formattedString += "0" );
                } else {
                  if ( ( roundedExponent + 1 ) === coefficientLength ) formattedString += ".";
                  for ( ; decimalPlaces--; formattedString += "0" );
                }
              } else {
                formattedString = insertDecimalPointAt( stringifiedCoeffs, roundedExponent, "0" );
              }
            }
            return bigNum.sign < 0 && currentDigit ? "-" + formattedString : formattedString;
          }

          // Aggregates arguments for min/max functions
          function aggregateComparisons( valuesArray, comparisonFunc ) {
            var nextNumber, indexCounter = 1,
              resultAccumulator = new BigNumberClass( valuesArray[0] );
            for ( ; indexCounter < valuesArray.length; indexCounter++ ) {
              nextNumber = new BigNumberClass( valuesArray[indexCounter] );
              if ( !nextNumber.sign ) {
                resultAccumulator = nextNumber;
                break;
              }
              comparisonFunc.call( resultAccumulator, nextNumber ) && ( resultAccumulator = nextNumber );
            }
            return resultAccumulator;
          }

          // Normalizes coefficient array after operations (removes trailing zeros, adjusts exponent)
          function normalizeCoefficientArray( bigNum, coefficients, exponentVal ) {
            var powerOfTen, lastCoeffIndex = coefficients.length - 1;
            for ( ; !coefficients[lastCoeffIndex]; coefficients.pop(), lastCoeffIndex-- );
            lastCoeffIndex = coefficients[0];
            for ( powerOfTen = 1; lastCoeffIndex >= 10; lastCoeffIndex /= 10, powerOfTen++ );
            exponentVal = powerOfTen + exponentVal * chunkSize - 1;
            if ( exponentVal > rangeUpperLimit ) {
              bigNum.coeffs = bigNum.exponent = null;
            } else if ( exponentVal < rangeLowerLimit ) {
              bigNum.coeffs = [bigNum.exponent = 0];
            } else {
              bigNum.exponent = exponentVal;
              bigNum.coeffs = coefficients;
            }
            return bigNum;
          }

          // Rounds a BigNumber to a specified precision
          function roundBigNumberToPrecision( bigNum, precision, roundingMode, isStrictRounding ) {
            var leadingDigits, targetPrecision, exponentDiff, coefficientVal, numChunks, chunkIndex, roundingDigit, coefficientsRef = bigNum.coeffs,
              tenPowersRef = tenPowersLookup; // Use local reference to avoid scope chain lookup

            if ( coefficientsRef ) {
              // Calculate index for rounding
              leadingDigits = 1;
              targetPrecision = coefficientsRef[0];
              for ( ; targetPrecision >= 10; targetPrecision /= 10, leadingDigits++ );

              exponentDiff = precision - leadingDigits;
              if ( exponentDiff < 0 ) {
                exponentDiff += chunkSize;
                roundingDigit = precision;
                coefficientVal = ( coefficientsRef[chunkIndex = 0] / tenPowersRef[leadingDigits - roundingDigit - 1] ) % 10 | 0;
              } else if ( ( chunkIndex = floorFunction( ( exponentDiff + 1 ) / chunkSize ) ) >= coefficientsRef.length ) {
                if ( !isStrictRounding ) return bigNum;
                for ( ; coefficientsRef.length <= chunkIndex; coefficientsRef.push( 0 ) );
                coefficientVal = roundingDigit = 0;
                leadingDigits = 1;
                roundingDigit = ( exponentDiff %= chunkSize ) - chunkSize + 1;
              } else {
                coefficientVal = targetPrecision = coefficientsRef[chunkIndex];
                leadingDigits = 1;
                for ( ; targetPrecision >= 10; targetPrecision /= 10, leadingDigits++ );
                roundingDigit = ( exponentDiff %= chunkSize ) - chunkSize + leadingDigits;
                coefficientVal = roundingDigit < 0 ? 0 : ( coefficientVal / tenPowersRef[leadingDigits - roundingDigit - 1] ) % 10 | 0;
              }

              // Determine if rounding up is needed
              isStrictRounding = isStrictRounding || precision < 0 || coefficientsRef[chunkIndex + 1] !== null || ( roundingDigit < 0 ? coefficientVal : coefficientVal % tenPowersRef[leadingDigits - roundingDigit - 1] ) !== null;
              isStrictRounding = roundingMode < 4 ? ( coefficientVal || isStrictRounding ) && ( roundingMode === 0 || roundingMode === ( bigNum.sign < 0 ? 3 : 2 ) ) : coefficientVal > 5 || ( coefficientVal === 5 && ( roundingMode === 4 || isStrictRounding || ( roundingMode === 6 && ( exponentDiff > 0 ? roundingDigit > 0 ? coefficientsRef[chunkIndex] / tenPowersRef[leadingDigits - roundingDigit] : 0 : coefficientsRef[chunkIndex - 1] ) % 10 & 1 ) || roundingMode === ( bigNum.sign < 0 ? 8 : 7 ) ) );

              // Apply rounding
              if ( precision < 1 || !coefficientsRef[0] ) {
                coefficientsRef.length = 0;
                if ( isStrictRounding ) {
                  precision -= bigNum.exponent + 1;
                  coefficientsRef[0] = tenPowersRef[( chunkSize - precision % chunkSize ) % chunkSize];
                  bigNum.exponent = -precision || 0;
                } else {
                  coefficientsRef[0] = bigNum.exponent = 0;
                }
                return bigNum;
              }

              if ( exponentDiff === 0 ) {
                coefficientsRef.length = chunkIndex;
                targetPrecision = 1;
                chunkIndex--;
              } else {
                coefficientsRef.length = chunkIndex + 1;
                targetPrecision = tenPowersRef[chunkSize - exponentDiff];
                coefficientsRef[chunkIndex] = roundingDigit > 0 ? floorFunction( coefficientsRef[chunkIndex] / tenPowersRef[leadingDigits - roundingDigit] ) * targetPrecision : 0;
              }

              if ( isStrictRounding ) {
                for ( ;; ) {
                  if ( chunkIndex === 0 ) {
                    for ( exponentDiff = 1, roundingDigit = coefficientsRef[0]; roundingDigit >= 10; roundingDigit /= 10, exponentDiff++ );
                    roundingDigit = coefficientsRef[0] += targetPrecision;
                    targetPrecision = 1;
                    for ( ; roundingDigit >= 10; roundingDigit /= 10, targetPrecision++ );
                    exponentDiff !== targetPrecision && ( bigNum.exponent++, coefficientsRef[0] === baseConstantTenPow14 && ( coefficientsRef[0] = 1 ) );
                    break;
                  }
                  if ( ( coefficientsRef[chunkIndex] += targetPrecision ) !== baseConstantTenPow14 ) break;
                  coefficientsRef[chunkIndex--] = 0;
                  targetPrecision = 1;
                }
              }
              for ( exponentDiff = coefficientsRef.length; 0 === coefficientsRef[--exponentDiff]; coefficientsRef.pop() );
            }
            if ( bigNum.exponent > rangeUpperLimit ) {
              bigNum.coeffs = bigNum.exponent = null;
            } else if ( bigNum.exponent < rangeLowerLimit ) {
              bigNum.coeffs = [bigNum.exponent = 0];
            }
            return bigNum;
          }

          // Converts a BigNumber to its primitive string representation
          function convertValueToPrimitiveString( bigNum ) {
            var resultString, exponentVal = bigNum.exponent;
            if ( bigNum.exponent === null ) {
              resultString = bigNum.sign ? ( "Infinity", bigNum.sign < 0 && ( resultString = "-" + resultString ) ) : ( resultString = "NaN" );
            } else {
              resultString = formatCoefficients( bigNum.coeffs );
              resultString = exponentVal <= expFormatLowerBound || exponentVal >= expFormatUpperBound ? toExponentialFormat( resultString, exponentVal ) : insertDecimalPointAt( resultString, exponentVal, "0" );
              if ( bigNum.sign < 0 && bigNum.coeffs[0] ) resultString = "-" + resultString;
            }
            return resultString;
          }

          BigNumberClass.createClone = bigNumFactory; // Method to create a clone of the BigNumber factory
          BigNumberClass.ROUNDING_UP = 0;             // Rounding mode constant
          BigNumberClass.ROUNDING_DOWN = 1;           // Rounding mode constant
          BigNumberClass.ROUNDING_CEIL = 2;           // Rounding mode constant
          BigNumberClass.ROUNDING_FLOOR = 3;          // Rounding mode constant
          BigNumberClass.ROUNDING_HALF_UP = 4;        // Rounding mode constant
          BigNumberClass.ROUNDING_HALF_DOWN = 5;      // Rounding mode constant
          BigNumberClass.ROUNDING_HALF_EVEN = 6;      // Rounding mode constant
          BigNumberClass.ROUNDING_HALF_CEIL = 7;      // Rounding mode constant
          BigNumberClass.ROUNDING_HALF_FLOOR = 8;     // Rounding mode constant
          BigNumberClass.EUCLID_MODULO = 9;           // Modulo mode constant

          // Configuration method for BigNumber settings
          BigNumberClass.configure = BigNumberClass.applySettings = function( settingsObject ) {
            var settingKey, settingValue;
            if ( settingsObject !== null ) {
              if ( typeof settingsObject !== "object" ) throw Error( errorMsgPrefix + "Object expected: " + settingsObject );
              // DECIMAL_PLACES setting
              if ( settingsObject.hasOwnProperty( settingKey = "DECIMAL_PLACES" ) ) {
                settingValue = settingsObject[settingKey];
                validateParameter( settingValue, 0, maxPrecisionLimit, settingKey );
                decimalPlaceCount = settingValue;
              }
              // ROUNDING_MODE setting
              if ( settingsObject.hasOwnProperty( settingKey = "ROUNDING_MODE" ) ) {
                settingValue = settingsObject[settingKey];
                validateParameter( settingValue, 0, 8, settingKey );
                currentRoundingMode = settingValue;
              }
              // EXPONENTIAL_AT setting
              if ( settingsObject.hasOwnProperty( settingKey = "EXPONENTIAL_AT" ) ) {
                settingValue = settingsObject[settingKey];
                if ( settingValue && settingValue.pop ) { // Array format [low, high]
                  validateParameter( settingValue[0], -maxPrecisionLimit, 0, settingKey );
                  validateParameter( settingValue[1], 0, maxPrecisionLimit, settingKey );
                  expFormatLowerBound = settingValue[0];
                  expFormatUpperBound = settingValue[1];
                } else { // Single number format
                  validateParameter( settingValue, -maxPrecisionLimit, maxPrecisionLimit, settingKey );
                  expFormatLowerBound = -( expFormatUpperBound = settingValue < 0 ? -settingValue : settingValue );
                }
              }
              // RANGE setting
              if ( settingsObject.hasOwnProperty( settingKey = "RANGE" ) ) {
                settingValue = settingsObject[settingKey];
                if ( settingValue && settingValue.pop ) { // Array format [low, high]
                  validateParameter( settingValue[0], -maxPrecisionLimit, -1, settingKey );
                  validateParameter( settingValue[1], 1, maxPrecisionLimit, settingKey );
                  rangeLowerLimit = settingValue[0];
                  rangeUpperLimit = settingValue[1];
                } else { // Single number format
                  validateParameter( settingValue, -maxPrecisionLimit, maxPrecisionLimit, settingKey );
                  if ( !settingValue ) throw Error( errorMsgPrefix + settingKey + " cannot be zero: " + settingValue );
                  rangeLowerLimit = -( rangeUpperLimit = settingValue < 0 ? -settingValue : settingValue );
                }
              }
              // CRYPTO setting
              if ( settingsObject.hasOwnProperty( settingKey = "CRYPTO" ) ) {
                settingValue = settingsObject[settingKey];
                if ( settingValue !== !!settingValue ) throw Error( errorMsgPrefix + settingKey + " not true or false: " + settingValue );
                if ( settingValue ) {
                  if ( typeof crypto === "undefined" || !crypto || ( !crypto.getRandomValues && !crypto.randomBytes ) ) {
                    useCryptoRandom = !settingValue;
                    throw Error( errorMsgPrefix + "crypto unavailable" );
                  }
                  useCryptoRandom = settingValue;
                } else {
                  useCryptoRandom = settingValue;
                }
              }
              // MODULO_MODE setting
              if ( settingsObject.hasOwnProperty( settingKey = "MODULO_MODE" ) ) {
                settingValue = settingsObject[settingKey];
                validateParameter( settingValue, 0, 9, settingKey );
                moduloCalculationMode = settingValue;
              }
              // POW_PRECISION setting
              if ( settingsObject.hasOwnProperty( settingKey = "POW_PRECISION" ) ) {
                settingValue = settingsObject[settingKey];
                validateParameter( settingValue, 0, maxPrecisionLimit, settingKey );
                powerOperationPrecision = settingValue;
              }
              // FORMAT setting
              if ( settingsObject.hasOwnProperty( settingKey = "FORMAT" ) ) {
                settingValue = settingsObject[settingKey];
                if ( typeof settingValue !== "object" ) throw Error( errorMsgPrefix + settingKey + " not an object: " + settingValue );
                outputFormatSettings = settingValue;
              }
              // ALPHABET setting
              if ( settingsObject.hasOwnProperty( settingKey = "ALPHABET" ) ) {
                settingValue = settingsObject[settingKey];
                if ( typeof settingValue !== "string" || /^.$|[+-.\s]|(.).*\1/.test( settingValue ) ) {
                  throw Error( errorMsgPrefix + settingKey + " invalid: " + settingValue );
                }
                customAlphabetChars = settingValue;
              }
            }
            // Return current settings
            return {
              DECIMAL_PLACES: decimalPlaceCount,
              ROUNDING_MODE: currentRoundingMode,
              EXPONENTIAL_AT: [expFormatLowerBound, expFormatUpperBound],
              RANGE: [rangeLowerLimit, rangeUpperLimit],
              CRYPTO: useCryptoRandom,
              MODULO_MODE: moduloCalculationMode,
              POW_PRECISION: powerOperationPrecision,
              FORMAT: outputFormatSettings,
              ALPHABET: customAlphabetChars
            };
          };

          // Checks if an object is a BigNumber instance
          BigNumberClass.checkIfBigNumber = function( obj ) {
            if ( !obj || true !== obj._isLargeNumber ) return false;
            if ( !BigNumberClass.DEBUG ) return true;
            // Debug checks for BigNumber validity
            var coeffsArray, exponentVal, signVal = obj.sign;
            coeffsArray = obj.coeffs;
            exponentVal = obj.exponent;

            // Validate internal structure of a BigNumber
            e: if ( "[object Array]" === {}.toString.call( coeffsArray ) ) {
              if ( ( signVal === 1 || signVal === -1 ) && exponentVal >= -maxPrecisionLimit && exponentVal <= maxPrecisionLimit && exponentVal === floorFunction( exponentVal ) ) {
                if ( coeffsArray[0] === 0 ) {
                  if ( exponentVal === 0 && coeffsArray.length === 1 ) return true;
                  break e;
                }
                var requiredLength = ( exponentVal + 1 ) % chunkSize;
                if ( requiredLength < 1 ) requiredLength += chunkSize;
                if ( String( coeffsArray[0] ).length === requiredLength ) {
                  for ( var idx = 0; idx < coeffsArray.length; idx++ ) {
                    var currentCoeff = coeffsArray[idx];
                    if ( currentCoeff < 0 || currentCoeff >= baseConstantTenPow14 || currentCoeff !== floorFunction( currentCoeff ) ) break e;
                  }
                  if ( coeffsArray[0] !== 0 ) return true;
                }
              } else if ( coeffsArray === null && exponentVal === null && ( signVal === null || signVal === 1 || signVal === -1 ) ) {
                return true;
              }
              throw Error( errorMsgPrefix + "Invalid BigNumber: " + obj );
            }
            return false;
          };

          // Returns the maximum of the provided BigNumbers
          BigNumberClass.getMaximum = BigNumberClass.findMax = function() {
            return aggregateComparisons( arguments, bigNumMethods.lessThan );
          };

          // Returns the minimum of the provided BigNumbers
          BigNumberClass.getMinimum = BigNumberClass.findMin = function() {
            return aggregateComparisons( arguments, bigNumMethods.greaterThan );
          };

          // Generates a random BigNumber
          BigNumberClass.generateRandom = ( largeNumPrototype = 9007199254740992 * Math.random() & 2097151 ? function() {
            return floorFunction( 9007199254740992 * Math.random() );
          } : function() {
            return 8388608 * ( 1073741824 * Math.random() | 0 ) + ( 8388608 * Math.random() | 0 );
          }, function( precision ) {
            var randomArray, randomUintArray, tempVal, numChunks = 0,
              coeffList = [],
              resultBigNum = new BigNumberClass( oneBigNumInstance );
            if ( precision === null ) precision = decimalPlaceCount;
            validateParameter( precision, 0, maxPrecisionLimit );

            numChunks = ceilingFunction( precision / chunkSize );

            if ( useCryptoRandom ) {
              if ( crypto.getRandomValues ) {
                for ( randomUintArray = crypto.getRandomValues( new Uint32Array( numChunks *= 2 ) ); numChunks > numChunks; ) {
                  tempVal = 131072 * randomUintArray[numChunks] + ( randomUintArray[numChunks + 1] >>> 11 );
                  if ( tempVal >= 9000000000000000 ) { // If value is too large, re-generate
                    randomUintArray = crypto.getRandomValues( new Uint32Array( 2 ) );
                    randomUintArray[numChunks] = randomUintArray[0];
                    randomUintArray[numChunks + 1] = randomUintArray[1];
                  } else {
                    coeffList.push( tempVal % baseConstantTenPow14 );
                    numChunks += 2;
                  }
                }
                numChunks = randomUintArray.length / 2;
              } else {
                if ( !crypto.randomBytes ) {
                  useCryptoRandom = false;
                  throw Error( errorMsgPrefix + "crypto unavailable" );
                }
                for ( randomArray = crypto.randomBytes( numChunks *= 7 ); numChunks > numChunks; ) {
                  tempVal = 281474976710656 * ( 31 & randomArray[numChunks] ) + 1099511627776 * randomArray[numChunks + 1] + 4294967296 * randomArray[numChunks + 2] + 16777216 * randomArray[numChunks + 3] + ( randomArray[numChunks + 4] << 16 ) + ( randomArray[numChunks + 5] << 8 ) + randomArray[numChunks + 6];
                  if ( tempVal >= 9000000000000000 ) { // If value is too large, re-generate
                    crypto.randomBytes( 7 ).copy( randomArray, numChunks );
                  } else {
                    coeffList.push( tempVal % baseConstantTenPow14 );
                    numChunks += 7;
                  }
                }
                numChunks = randomArray.length / 7;
              }
            }

            if ( !useCryptoRandom ) {
              for ( ; numChunks > numChunks; ) {
                tempVal = largeNumPrototype();
                if ( tempVal < 9000000000000000 ) { // Ensure value is not too large
                  coeffList[numChunks++] = tempVal % baseConstantTenPow14;
                }
              }
            }

            numChunks = coeffList.length - 1;
            tempVal = coeffList[numChunks];
            precision %= chunkSize;
            if ( tempVal && precision ) {
              coeffList[numChunks] = floorFunction( tempVal / tenPowersLookup[chunkSize - precision] ) * tenPowersLookup[chunkSize - precision];
            }

            for ( ; 0 === coeffList[numChunks]; coeffList.pop(), numChunks-- );

            if ( numChunks < 0 ) {
              coeffList = [tempVal = 0];
            } else {
              for ( tempVal = -1; 0 === coeffList[0]; coeffList.splice( 0, 1 ), tempVal -= chunkSize );
              for ( numChunks = 1, tempVal = coeffList[0]; tempVal >= 10; tempVal /= 10, numChunks++ );
              if ( numChunks < chunkSize ) tempVal -= chunkSize - numChunks;
            }

            resultBigNum.exponent = tempVal;
            resultBigNum.coeffs = coeffList;
            return resultBigNum;
          } );

          // Calculates the sum of all provided BigNumbers
          BigNumberClass.calculateSum = function() {
            var index = 1,
              argArray = arguments,
              sumResult = new BigNumberClass( argArray[0] );
            for ( ; index < argArray.length; ) {
              sumResult = sumResult.add( argArray[index++] );
            }
            return sumResult;
          };

          // Internal function to convert a number string from one base to another
          convertNumberToBase = function() {
            // Helper to perform base conversion for digits
            function convertDigits( sourceDigits, sourceBase, targetBase, alphabetChars ) {
              var digitIndex, outputArray, currentSum = [0],
                arrLength = 0,
                sourceLength = sourceDigits.length;

              for ( ; arrLength < sourceLength; ) {
                for ( digitIndex = currentSum.length; digitIndex--; currentSum[digitIndex] *= sourceBase );
                currentSum[0] += alphabetChars.indexOf( sourceDigits.charAt( arrLength++ ) );
                for ( digitIndex = 0; digitIndex < currentSum.length; digitIndex++ ) {
                  if ( currentSum[digitIndex] > targetBase - 1 ) {
                    if ( currentSum[digitIndex + 1] === null ) currentSum[digitIndex + 1] = 0;
                    currentSum[digitIndex + 1] += floorFunction( currentSum[digitIndex] / targetBase );
                    currentSum[digitIndex] %= targetBase;
                  }
                }
              }
              return currentSum.reverse();
            }

            return function( inputValue, sourceNumericBase, targetNumericBase, originalSign, isRecursiveCall ) {
              var charMap, decimalPointPos, decimalPlacesSetting = decimalPlaceCount,
                roundingModeSetting = currentRoundingMode,
                convertedBigNum, denominator, numeratorCoeffs, decimalParts, lastDigit, halfBase, roundUpCondition;

              decimalPointPos = inputValue.indexOf( "." );
              decimalPlaceCount = 0; // Temporarily set decimal places to 0 for base conversion
              powerOperationPrecision = 0;

              if ( decimalPointPos >= 0 ) {
                numeratorCoeffs = powerOperationPrecision; // Store original powerOperationPrecision
                powerOperationPrecision = 0; // Reset for calculation
                inputValue = inputValue.replace( ".", "" );
                denominator = ( charMap = new BigNumberClass( sourceNumericBase ) ).power( inputValue.length - decimalPointPos );
                powerOperationPrecision = numeratorCoeffs; // Restore powerOperationPrecision
                charMap.coeffs = convertDigits( formatCoefficients( denominator.coeffs ), 10, targetNumericBase, "0123456789" );
                charMap.exponent = charMap.coeffs.length;
              }

              // Convert integer part
              decimalParts = ( numeratorCoeffs = convertDigits( inputValue, sourceNumericBase, targetNumericBase, isRecursiveCall ? ( charMap = customAlphabetChars, "0123456789" ) : ( charMap = "0123456789", customAlphabetChars ) ) ).length;
              for ( ; 0 === numeratorCoeffs[--decimalParts]; numeratorCoeffs.pop() );

              if ( !numeratorCoeffs[0] ) return charMap.charAt( 0 );

              if ( decimalPointPos < 0 ) {
                decimalParts--;
              } else {
                convertedBigNum = new BigNumberClass( numeratorCoeffs );
                convertedBigNum.exponent = decimalParts;
                convertedBigNum.sign = originalSign;
                numeratorCoeffs = ( convertedBigNum = performDivision( convertedBigNum, denominator, decimalPlacesSetting, roundingModeSetting, targetNumericBase ) ).coeffs;
                lastDigit = convertedBigNum.remainder;
                decimalParts = convertedBigNum.exponent;
              }

              // Determine rounding
              halfBase = targetNumericBase / 2;
              roundUpCondition = lastDigit || decimalParts < 0 || numeratorCoeffs[decimalParts + decimalPlacesSetting + 1] !== null;
              roundUpCondition = roundingModeSetting < 4 ? ( ( lastDigit !== null || roundUpCondition ) && ( roundingModeSetting === 0 || roundingModeSetting === ( convertedBigNum.sign < 0 ? 3 : 2 ) ) ) : lastDigit > halfBase || ( lastDigit === halfBase && ( roundingModeSetting === 4 || roundUpCondition || ( roundingModeSetting === 6 && ( 1 & numeratorCoeffs[decimalParts - 1] ) ) || roundingModeSetting === ( convertedBigNum.sign < 0 ? 8 : 7 ) ) );

              if ( decimalParts < 1 || !numeratorCoeffs[0] ) {
                inputValue = roundUpCondition ? insertDecimalPointAt( charMap.charAt( 1 ), -decimalPlacesSetting, charMap.charAt( 0 ) ) : charMap.charAt( 0 );
              } else {
                // Apply rounding to coefficients
                if ( roundUpCondition ) {
                  decimalParts--;
                  for ( ; ++numeratorCoeffs[decimalParts] > targetNumericBase - 1; ) {
                    numeratorCoeffs[decimalParts] = 0;
                    if ( !decimalParts ) {
                      decimalParts++;
                      numeratorCoeffs = [1].concat( numeratorCoeffs );
                    }
                  }
                }
                // Trim trailing zeros
                for ( decimalParts = numeratorCoeffs.length; !numeratorCoeffs[--decimalParts]; );
                for ( decimalPointPos = 0, inputValue = ""; decimalPointPos <= decimalParts; inputValue += charMap.charAt( numeratorCoeffs[decimalPointPos++] ) );
                inputValue = insertDecimalPointAt( inputValue, decimalParts, charMap.charAt( 0 ) );
              }
              return inputValue;
            };
          }();

          // Internal function to perform division of BigNumbers
          performDivision = function() {
            // Helper to multiply a coefficient array by a scalar and add to a base
            function multiplyAndAdd( coeffArray, multiplier, baseValue ) {
              var tempProduct, carryVal, currentDigit, lowPart, highPart, arrayLen = coeffArray.length;
              for ( coeffArray = coeffArray.slice(); arrayLen--; ) {
                carryVal = ( ( lowPart = multiplier * ( currentDigit = coeffArray[arrayLen] % divisorConstant ) + ( tempProduct = floorFunction( multiplier * ( coeffArray[arrayLen] / divisorConstant ) + floorFunction( carryVal / divisorConstant ) ) ) % divisorConstant * divisorConstant + carryVal ) / baseValue | 0 ) + ( tempProduct / divisorConstant | 0 ) + floorFunction( multiplier * ( currentDigit / divisorConstant ) );
                coeffArray[arrayLen] = lowPart % baseValue;
              }
              return carryVal && ( coeffArray = [carryVal].concat( coeffArray ) ), coeffArray;
            }

            // Helper to compare two coefficient arrays
            function compareArrays( arrayA, arrayB, lenA, lenB ) {
              var index, comparisonResult;
              if ( lenA !== lenB ) {
                comparisonResult = lenA > lenB ? 1 : -1;
              } else {
                for ( index = comparisonResult = 0; index < lenA; index++ ) {
                  if ( arrayA[index] !== arrayB[index] ) {
                    comparisonResult = arrayA[index] > arrayB[index] ? 1 : -1;
                    break;
                  }
                }
              }
              return comparisonResult;
            }

            // Helper to subtract one coefficient array from another
            function subtractArrays( minuend, subtrahend, length, borrow ) {
              for ( borrow = 0; length--; ) {
                minuend[length] -= borrow;
                borrow = minuend[length] < subtrahend[length] ? 1 : 0;
                minuend[length] = borrow * baseConstantTenPow14 + minuend[length] - subtrahend[length];
              }
              for ( ; !minuend[0] && minuend.length > 1; minuend.splice( 0, 1 ) );
            }

            return function( dividendNum, divisorNum, decimalPrecision, roundingBehavior ) {
              var currentQuotient, coefficientOffset, currentPrecision, scaledDivisor, scaledDividend, dividendLength, divisorLength, tempDivisor, tempDividend, currentDividendChunk, initialDividendDigit, estimatedQuotient, tempProductArray, tempProductLength, tempRemainderLength, lastDigitDivisor, paddedDivisor = dividendNum.sign === divisorNum.sign ? 1 : -1;
              currentQuotient = ( new BigNumberClass( paddedDivisor ) ).coeffs = []; // Initialize quotient BigNumber

              // Handle special cases (NaN, Zero, Infinity)
              if ( !( dividendNum.coeffs && dividendNum.coeffs[0] && divisorNum.coeffs && divisorNum.coeffs[0] ) ) {
                return new BigNumberClass( dividendNum.sign && divisorNum.sign && ( dividendNum.coeffs ? !divisorNum.coeffs || dividendNum.coeffs[0] !== divisorNum.coeffs[0] : divisorNum.coeffs ) ? dividendNum.coeffs && dividendNum.coeffs[0] === 0 || !divisorNum.coeffs ? 0 * paddedDivisor : paddedDivisor / 0 : NaN );
              }

              currentPrecision = decimalPrecision + ( coefficientOffset = dividendNum.exponent - divisorNum.exponent ) + 1;
              roundingBehavior === null || ( roundingBehavior = baseConstantTenPow14, coefficientOffset = integerFloor( dividendNum.exponent / chunkSize ) - integerFloor( divisorNum.exponent / chunkSize ), currentPrecision = currentPrecision / chunkSize | 0 );

              for ( paddedDivisor = 0; divisorNum.coeffs[paddedDivisor] === ( dividendNum.coeffs[paddedDivisor] || 0 ); paddedDivisor++ );
              if ( divisorNum.coeffs[paddedDivisor] > ( dividendNum.coeffs[paddedDivisor] || 0 ) && coefficientOffset-- );
              if ( currentPrecision < 0 ) {
                currentQuotient.push( 1 );
                estimatedQuotient = true;
              } else {
                dividendLength = dividendNum.coeffs.length;
                divisorLength = divisorNum.coeffs.length;
                paddedDivisor = 0;
                currentPrecision += 2; // Add some extra precision for intermediate calculations

                // Scale divisor and dividend for more accurate estimation
                lastDigitDivisor = floorFunction( roundingBehavior / ( divisorNum.coeffs[0] + 1 ) );
                if ( lastDigitDivisor > 1 ) {
                  divisorNum.coeffs = multiplyAndAdd( divisorNum.coeffs, lastDigitDivisor, roundingBehavior );
                  dividendNum.coeffs = multiplyAndAdd( dividendNum.coeffs, lastDigitDivisor, roundingBehavior );
                  divisorLength = divisorNum.coeffs.length;
                  dividendLength = dividendNum.coeffs.length;
                }

                // Prepare temp dividend array
                tempDividend = dividendNum.coeffs.slice( 0, divisorLength );
                for ( tempRemainderLength = tempDividend.length; tempRemainderLength < divisorLength; tempDividend[tempRemainderLength++] = 0 );

                // Prepare temp divisor array for subtraction
                tempDivisor = divisorNum.coeffs.slice();
                tempDivisor = [0].concat( tempDivisor ); // Pad with a zero for easier subtraction
                initialDividendDigit = divisorNum.coeffs[0];
                if ( divisorNum.coeffs[1] >= roundingBehavior / 2 ) initialDividendDigit++;

                // Main division loop
                do {
                  estimatedQuotient = 0;
                  currentQuotient[paddedDivisor++] = 0;
                  currentDividendChunk = compareArrays( divisorNum.coeffs, tempDividend, divisorLength, tempRemainderLength );
                  if ( currentDividendChunk < 0 ) {
                    initialDividendDigit = tempDividend[0];
                    if ( divisorLength !== tempRemainderLength ) initialDividendDigit = initialDividendDigit * roundingBehavior + ( tempDividend[1] || 0 );
                    estimatedQuotient = floorFunction( initialDividendDigit / initialDividendDigit ); // Estimate quotient digit

                    // Adjust estimated quotient if it's too high
                    if ( estimatedQuotient > 1 ) {
                      if ( estimatedQuotient >= roundingBehavior ) estimatedQuotient = roundingBehavior - 1;
                      tempProductArray = multiplyAndAdd( divisorNum.coeffs, estimatedQuotient, roundingBehavior );
                      tempProductLength = tempProductArray.length;
                      tempRemainderLength = tempDividend.length;
                      for ( ; 1 === compareArrays( tempProductArray, tempDividend, tempProductLength, tempRemainderLength ); ) {
                        estimatedQuotient--;
                        subtractArrays( tempProductArray, divisorLength < tempProductLength ? tempDivisor : divisorNum.coeffs, tempProductLength, roundingBehavior );
                        tempProductLength = tempProductArray.length;
                        currentDividendChunk = 1;
                      }
                    } else if ( estimatedQuotient === 0 ) {
                      currentDividendChunk = estimatedQuotient = 1;
                      tempProductArray = divisorNum.coeffs.slice();
                      tempProductLength = tempProductArray.length;
                    } else {
                      tempProductArray = multiplyAndAdd( divisorNum.coeffs, estimatedQuotient, roundingBehavior );
                      tempProductLength = tempProductArray.length;
                    }

                    if ( tempProductLength < tempRemainderLength ) tempProductArray = [0].concat( tempProductArray );
                    subtractArrays( tempDividend, tempProductArray, tempRemainderLength, roundingBehavior );
                    tempRemainderLength = tempDividend.length;
                  } else if ( currentDividendChunk === 0 ) {
                    estimatedQuotient++;
                    tempDividend = [0]; // Remainder is zero
                  }
                  currentQuotient[paddedDivisor - 1] = estimatedQuotient;
                  if ( tempDividend[0] ) {
                    tempDividend[tempRemainderLength++] = dividendNum.coeffs[divisorLength + paddedDivisor - 1] || 0;
                  } else {
                    tempDividend = [dividendNum.coeffs[divisorLength + paddedDivisor - 1]];
                    tempRemainderLength = 1;
                  }
                } while ( ( divisorLength + paddedDivisor - 1 < dividendLength || tempDividend[0] !== null ) && currentPrecision-- );

                estimatedQuotient = tempDividend[0] !== null; // True if there is a remainder
                currentQuotient[0] || currentQuotient.splice( 0, 1 ); // Remove leading zero if any
              }

              // Final rounding and normalization
              if ( roundingBehavior === baseConstantTenPow14 ) {
                normalizeCoefficientArray( currentQuotient = new BigNumberClass( currentQuotient ), decimalPrecision + ( currentQuotient.exponent = paddedDivisor + coefficientOffset * chunkSize - 1 ) + 1, decimalPrecision, estimatedQuotient );
              } else {
                currentQuotient.exponent = coefficientOffset;
                currentQuotient.remainder = +estimatedQuotient;
              }
              return currentQuotient;
            };
          }();

          // Regex patterns for parsing input strings
          hexBinOctalPrefixPattern = /^(-?)0([xbo])(?=\w[\w.]*$)/i;
          trailingDecimalPattern = /^([^.]+)\.$/;
          leadingDecimalPattern = /^\.([^.]+)$/;
          infinityNaNSignature = /^-?(Infinity|NaN)$/;
          leadingTrailingWhitespace = /^\s*\+(?=[\w.])|^\s+|\s+$/g;

          // Helper function to parse input strings for BigNumber constructor
          parseInputString = function( instanceRef, inputStr, isNumeric, baseVal ) {
            var tempBase;
            var processedString = isNumeric ? inputStr : inputStr.replace( leadingTrailingWhitespace, "" );

            // Handle Infinity/NaN strings
            if ( infinityNaNSignature.test( processedString ) ) {
              instanceRef.sign = isNaN( processedString ) ? null : processedString < 0 ? -1 : 1;
            } else {
              // Handle hex/binary/octal prefixes
              if ( !isNumeric ) {
                processedString = processedString.replace( hexBinOctalPrefixPattern, function( match, sign, prefixChar ) {
                  tempBase = "x" === ( prefixChar = prefixChar.toLowerCase() ) ? 16 : "b" === prefixChar ? 2 : 8;
                  return ( baseVal && baseVal !== tempBase ) ? match : sign;
                } );
                // Handle trailing/leading dots
                if ( baseVal ) {
                  tempBase = baseVal;
                  processedString = processedString.replace( trailingDecimalPattern, "$1" ).replace( leadingDecimalPattern, "0.$1" );
                }
              }
              // If string changed, re-parse
              if ( inputStr !== processedString ) return new BigNumberClass( processedString, tempBase );
              // If in debug mode, throw error for invalid numbers
              if ( BigNumberClass.DEBUG ) {
                throw Error( errorMsgPrefix + "Not a" + ( baseVal ? " base " + baseVal : "" ) + " number: " + inputStr );
              }
              instanceRef.sign = null; // Mark as NaN
            }
            instanceRef.coeffs = instanceRef.exponent = null; // Clear coefficients and exponent
          };

          // BigNumber prototype methods

          // Returns the absolute value of a BigNumber
          bigNumMethods.getAbsoluteValue = bigNumMethods.absolute = function() {
            var newBigNum = new BigNumberClass( this );
            if ( newBigNum.sign < 0 ) newBigNum.sign = 1;
            return newBigNum;
          };

          // Compares this BigNumber with another value
          bigNumMethods.compareWith = function( otherValue, base ) {
            return compareNumericValues( this, new BigNumberClass( otherValue, base ) );
          };

          // Returns the number of decimal places
          bigNumMethods.getDecimalPlaces = bigNumMethods.decimalCount = function( precision, roundingMode ) {
            var coeffs, exponent, lastCoeff, resultCount = this;
            if ( precision !== null ) {
              validateParameter( precision, 0, maxPrecisionLimit );
              if ( roundingMode === null ) roundingMode = currentRoundingMode;
              else validateParameter( roundingMode, 0, 8 );
              return roundBigNumberToPrecision( new BigNumberClass( resultCount ), precision + resultCount.exponent + 1, roundingMode );
            }
            if ( !( coeffs = resultCount.coeffs ) ) return null;
            lastCoeff = ( exponent = coeffs.length - 1 ) - integerFloor( this.exponent / chunkSize );
            resultCount = lastCoeff * chunkSize;
            lastCoeff = coeffs[exponent];
            for ( ; lastCoeff % 10 === 0; lastCoeff /= 10, resultCount-- );
            if ( resultCount < 0 ) resultCount = 0;
            return resultCount;
          };

          // Divides this BigNumber by another value
          bigNumMethods.divideBy = bigNumMethods.divValue = function( divisorValue, base ) {
            return performDivision( this, new BigNumberClass( divisorValue, base ), decimalPlaceCount, currentRoundingMode );
          };

          // Divides this BigNumber by another value, returning an integer result
          bigNumMethods.divideToInteger = bigNumMethods.intDiv = function( divisorValue, base ) {
            return performDivision( this, new BigNumberClass( divisorValue, base ), 0, 1 ); // Rounding mode 1: ROUND_DOWN
          };

          // Raises this BigNumber to the power of another value
          bigNumMethods.raiseToPower = bigNumMethods.power = function( exponentValue, moduloValue ) {
            var tempBigNum, exponentBigNum, exponentIsNegative,
              resultBigNum, baseNum = this;

            exponentBigNum = new BigNumberClass( exponentValue );

            // Validate exponent is an integer
            if ( exponentBigNum.coeffs && !exponentBigNum.isWholeNumber() ) {
              throw Error( errorMsgPrefix + "Exponent not an integer: " + convertValueToPrimitiveString( exponentBigNum ) );
            }

            // Handle modulo argument
            if ( moduloValue !== null ) moduloValue = new BigNumberClass( moduloValue );

            // Handle special cases: 0^0, 1^X, X^0
            if ( !baseNum.coeffs || !baseNum.coeffs[0] || ( baseNum.coeffs[0] === 1 && !baseNum.exponent && baseNum.coeffs.length === 1 ) || !exponentBigNum.coeffs || !exponentBigNum.coeffs[0] ) {
              resultBigNum = new BigNumberClass( Math.pow( +convertValueToPrimitiveString( baseNum ), exponentBigNum.exponent > 14 ? 2 - isNumberOdd( exponentBigNum ) : +convertValueToPrimitiveString( exponentBigNum ) ) );
              return moduloValue ? resultBigNum.moduloRemainder( moduloValue ) : resultBigNum;
            }

            exponentIsNegative = exponentBigNum.sign < 0;

            // Apply modulo if provided and base is an integer
            if ( moduloValue ) {
              if ( !moduloValue.coeffs ? !moduloValue.coeffs[0] : !moduloValue.sign ) return new BigNumberClass( NaN );
              tempBigNum = !exponentIsNegative && baseNum.isWholeNumber() && moduloValue.isWholeNumber();
              if ( tempBigNum ) baseNum = baseNum.moduloRemainder( moduloValue );
            } else {
              // Handle large exponents that would result in Infinity/0
              if ( exponentBigNum.exponent > 9 && ( baseNum.exponent > 0 || baseNum.exponent < -1 || ( baseNum.exponent === 0 ? baseNum.coeffs[0] > 1 || exponentBigNum.exponent > 14 && baseNum.coeffs[1] >= 240000000 : baseNum.coeffs[0] < 8000000000000 || exponentBigNum.exponent > 14 && baseNum.coeffs[0] <= 99999750000000 ) ) ) {
                tempBigNum = baseNum.sign < 0 && isNumberOdd( exponentBigNum ) ? -0 : 0;
                if ( baseNum.exponent > -1 ) tempBigNum = 1 / tempBigNum;
                return new BigNumberClass( exponentIsNegative ? 1 / tempBigNum : tempBigNum );
              }
              // Set power operation precision if configured
              if ( powerOperationPrecision ) tempBigNum = ceilingFunction( powerOperationPrecision / chunkSize + 2 );
            }

            // Determine if exponent is odd for negative bases
            if ( exponentBigNum.exponent > 14 ) {
              exponentBigNum = new BigNumberClass( 0.5 );
              if ( exponentIsNegative ) exponentBigNum.sign = 1;
              tempBigNum = isNumberOdd( exponentBigNum );
            } else {
              tempBigNum = ( temporaryVarOne = Math.abs( +convertValueToPrimitiveString( exponentBigNum ) ) ) % 2;
            }

            resultBigNum = new BigNumberClass( oneBigNumInstance );

            // Loop for exponentiation by squaring
            for ( ;; ) {
              if ( tempBigNum ) {
                if ( !( resultBigNum = resultBigNum.timesValue( baseNum ) ).coeffs ) break;
                if ( powerOperationPrecision ) {
                  if ( resultBigNum.coeffs.length > powerOperationPrecision ) resultBigNum.coeffs.length = powerOperationPrecision;
                } else if ( moduloValue ) {
                  resultBigNum = resultBigNum.moduloRemainder( moduloValue );
                }
              }
              if ( temporaryVarOne ) {
                if ( ( temporaryVarOne = floorFunction( temporaryVarOne / 2 ) ) === 0 ) break;
                tempBigNum = temporaryVarOne % 2;
              } else {
                roundBigNumberToPrecision( exponentBigNum = exponentBigNum.timesValue( new BigNumberClass( 0.5 ) ), exponentBigNum.exponent + 1, 1 );
                if ( exponentBigNum.exponent > 14 ) {
                  tempBigNum = isNumberOdd( exponentBigNum );
                } else {
                  if ( ( temporaryVarOne = +convertValueToPrimitiveString( exponentBigNum ) ) === 0 ) break;
                  tempBigNum = temporaryVarOne % 2;
                }
              }
              baseNum = baseNum.timesValue( baseNum );
              if ( powerOperationPrecision ) {
                if ( baseNum.coeffs && baseNum.coeffs.length > powerOperationPrecision ) baseNum.coeffs.length = powerOperationPrecision;
              } else if ( moduloValue ) {
                baseNum = baseNum.moduloRemainder( moduloValue );
              }
            }

            if ( moduloValue ) {
              return resultBigNum;
            } else {
              return exponentIsNegative ? oneBigNumInstance.divValue( resultBigNum ) : powerOperationPrecision ? roundBigNumberToPrecision( resultBigNum, powerOperationPrecision, currentRoundingMode, undefined ) : resultBigNum;
            }
          };

          // Returns the integer value of a BigNumber
          bigNumMethods.getIntegerValue = function( roundingMode ) {
            var newBigNum = new BigNumberClass( this );
            if ( roundingMode === null ) roundingMode = currentRoundingMode;
            else validateParameter( roundingMode, 0, 8 );
            return roundBigNumberToPrecision( newBigNum, newBigNum.exponent + 1, roundingMode );
          };

          // Checks if this BigNumber is equal to another value
          bigNumMethods.isEqual = bigNumMethods.equals = function( otherValue, base ) {
            return 0 === compareNumericValues( this, new BigNumberClass( otherValue, base ) );
          };

          // Checks if this BigNumber is finite
          bigNumMethods.isTrulyFinite = function() {
            return !!this.coeffs;
          };

          // Checks if this BigNumber is greater than another value
          bigNumMethods.isGreater = bigNumMethods.greaterThan = function( otherValue, base ) {
            return compareNumericValues( this, new BigNumberClass( otherValue, base ) ) > 0;
          };

          // Checks if this BigNumber is greater than or equal to another value
          bigNumMethods.isGreaterOrEqual = bigNumMethods.greaterThanOrEqual = function( otherValue, base ) {
            var comparisonResult = compareNumericValues( this, new BigNumberClass( otherValue, base ) );
            return 1 === comparisonResult || 0 === comparisonResult;
          };

          // Checks if this BigNumber is an integer (whole number)
          bigNumMethods.isWholeNumber = function() {
            return !!this.coeffs && integerFloor( this.exponent / chunkSize ) > this.coeffs.length - 2;
          };

          // Checks if this BigNumber is less than another value
          bigNumMethods.isLesser = bigNumMethods.lessThan = function( otherValue, base ) {
            return compareNumericValues( this, new BigNumberClass( otherValue, base ) ) < 0;
          };

          // Checks if this BigNumber is less than or equal to another value
          bigNumMethods.isLesserOrEqual = bigNumMethods.lessThanOrEqual = function( otherValue, base ) {
            var comparisonResult = compareNumericValues( this, new BigNumberClass( otherValue, base ) );
            return -1 === comparisonResult || 0 === comparisonResult;
          };

          // Checks if this BigNumber is NaN
          bigNumMethods.isNotANumber = function() {
            return !this.sign;
          };

          // Checks if this BigNumber is negative
          bigNumMethods.isNegativeNumber = function() {
            return this.sign < 0;
          };

          // Checks if this BigNumber is positive
          bigNumMethods.isPositiveNumber = function() {
            return this.sign > 0;
          };

          // Checks if this BigNumber is zero
          bigNumMethods.isZeroValue = function() {
            return !!this.coeffs && this.coeffs[0] === 0;
          };

          // Subtracts another value from this BigNumber
          bigNumMethods.subtract = function( subtrahendValue, base ) {
            var newBigNum, otherBigNum, thisSign,
              subtrahendBigNum = new BigNumberClass( subtrahendValue, base );
            thisSign = this.sign;
            otherBigNum = subtrahendBigNum.sign;

            // Handle NaN
            if ( !thisSign || !otherBigNum ) return new BigNumberClass( NaN );

            // If signs are different, convert to addition
            if ( thisSign !== otherBigNum ) {
              subtrahendBigNum.sign = -otherBigNum;
              return this.add( subtrahendBigNum );
            }

            var thisExponentChunk = this.exponent / chunkSize,
              otherExponentChunk = subtrahendBigNum.exponent / chunkSize,
              thisCoeffs = this.coeffs,
              otherCoeffs = subtrahendBigNum.coeffs;

            // Handle cases where one or both numbers are null/zero
            if ( !thisExponentChunk || !otherExponentChunk ) {
              if ( !thisCoeffs || !otherCoeffs ) {
                return thisCoeffs ? ( subtrahendBigNum.sign = -otherBigNum, subtrahendBigNum ) : new BigNumberClass( otherCoeffs ? this : NaN );
              }
              if ( !thisCoeffs[0] || !otherCoeffs[0] ) {
                return otherCoeffs[0] ? ( subtrahendBigNum.sign = -otherBigNum, subtrahendBigNum ) : new BigNumberClass( thisCoeffs[0] ? this : ( currentRoundingMode === 3 ? -0 : 0 ) );
              }
            }

            thisExponentChunk = integerFloor( thisExponentChunk );
            otherExponentChunk = integerFloor( otherExponentChunk );
            thisCoeffs = thisCoeffs.slice();

            // Align exponents by padding with zeros
            thisSign = thisExponentChunk - otherExponentChunk;
            if ( thisSign ) {
              var smallerCoeffs, padLength;
              if ( ( newBigNum = thisSign < 0 ) ) {
                padLength = -thisSign;
                smallerCoeffs = thisCoeffs;
              } else {
                padLength = thisSign;
                smallerCoeffs = otherCoeffs;
                otherExponentChunk = thisExponentChunk; // Adjust exponent for alignment
              }
              smallerCoeffs.reverse();
              for ( ; padLength--; smallerCoeffs.push( 0 ) );
              smallerCoeffs.reverse();
            } else {
              var minLength = ( thisSign = thisCoeffs.length ) < ( padLength = otherCoeffs.length ) ? thisSign : padLength;
              for ( thisSign = padLength = 0; padLength < minLength; padLength++ ) {
                if ( thisCoeffs[padLength] !== otherCoeffs[padLength] ) {
                  newBigNum = thisCoeffs[padLength] < otherCoeffs[padLength];
                  break;
                }
              }
            }

            // Ensure minuend is always larger or equal (swap if needed)
            if ( newBigNum ) {
              smallerCoeffs = thisCoeffs;
              thisCoeffs = otherCoeffs;
              otherCoeffs = smallerCoeffs;
              subtrahendBigNum.sign = -subtrahendBigNum.sign; // Flip sign
            }

            // Pad with zeros if lengths differ
            padLength = ( thisSign = thisCoeffs.length ) - ( newBigNum = otherCoeffs.length );
            for ( ; padLength--; thisCoeffs[newBigNum++] = 0 );

            // Perform subtraction
            for ( padLength = baseConstantTenPow14 - 1; thisSign > newBigNum; ) {
              if ( thisCoeffs[--thisSign] < otherCoeffs[thisSign] ) {
                for ( newBigNum = thisSign; newBigNum && !thisCoeffs[--newBigNum]; thisCoeffs[newBigNum] = padLength );
                thisCoeffs[newBigNum]--;
                thisCoeffs[thisSign] += baseConstantTenPow14;
              }
              thisCoeffs[thisSign] -= otherCoeffs[thisSign];
            }

            // Remove leading zeros and normalize
            for ( ; thisCoeffs[0] === 0; thisCoeffs.splice( 0, 1 ), otherExponentChunk-- );
            return thisCoeffs[0] ? normalizeCoefficientArray( subtrahendBigNum, thisCoeffs, otherExponentChunk ) : ( subtrahendBigNum.sign = currentRoundingMode === 3 ? -1 : 1, subtrahendBigNum.coeffs = [subtrahendBigNum.exponent = 0], subtrahendBigNum );
          };

          // Calculates the modulo of this BigNumber by another value
          bigNumMethods.getModulo = bigNumMethods.moduloRemainder = function( divisorValue, base ) {
            var tempBigNum, otherSign, baseNum = this;
            divisorValue = new BigNumberClass( divisorValue, base );

            // Handle NaN or zero divisor
            if ( !baseNum.coeffs || !divisorValue.sign || ( divisorValue.coeffs && !divisorValue.coeffs[0] ) ) {
              return new BigNumberClass( NaN );
            }
            // Handle zero dividend
            if ( !divisorValue.coeffs || ( baseNum.coeffs && !baseNum.coeffs[0] ) ) {
              return new BigNumberClass( baseNum );
            }

            // Apply different modulo modes
            if ( moduloCalculationMode === 9 ) { // Euclid
              otherSign = divisorValue.sign;
              divisorValue.sign = 1;
              tempBigNum = performDivision( baseNum, divisorValue, 0, 3 ); // Divide using ROUND_FLOOR
              divisorValue.sign = otherSign;
              tempBigNum.sign *= otherSign;
            } else { // Other modes
              tempBigNum = performDivision( baseNum, divisorValue, 0, moduloCalculationMode );
            }

            divisorValue = baseNum.subtract( tempBigNum.timesValue( divisorValue ) );
            if ( divisorValue.coeffs[0] === 0 && moduloCalculationMode === 1 ) { // If result is zero and mode is ROUND_DOWN
              divisorValue.sign = baseNum.sign; // Match sign of dividend
            }
            return divisorValue;
          };

          // Multiplies this BigNumber by another value
          bigNumMethods.multiplyBy = bigNumMethods.timesValue = function( multiplierValue, base ) {
            var tempBigNum, coeffLenA, coeffLenB,
              idx, productCoeffs, currentCoeff,
              multiplierBigNum = new BigNumberClass( multiplierValue, base ),
              baseNumCoeffs = this.coeffs,
              multiplierCoeffs = multiplierBigNum.coeffs;

            // Handle NaN, Infinity, Zero
            if ( !( baseNumCoeffs && multiplierCoeffs && baseNumCoeffs[0] && multiplierCoeffs[0] ) ) {
              multiplierBigNum.coeffs = multiplierBigNum.exponent = multiplierBigNum.sign = null;
              if ( !this.sign || !multiplierBigNum.sign || ( baseNumCoeffs && !baseNumCoeffs[0] && !multiplierBigNum.coeffs ) || ( multiplierCoeffs && !multiplierCoeffs[0] && !baseNumCoeffs ) ) {
                multiplierBigNum.sign *= this.sign;
                if ( baseNumCoeffs && multiplierCoeffs ) {
                  multiplierBigNum.coeffs = [0];
                  multiplierBigNum.exponent = 0;
                } else {
                  multiplierBigNum.coeffs = multiplierBigNum.exponent = null;
                }
              }
              return multiplierBigNum;
            }

            tempBigNum = integerFloor( this.exponent / chunkSize ) + integerFloor( multiplierBigNum.exponent / chunkSize );
            multiplierBigNum.sign *= this.sign;

            // Ensure coeffLenA is always the longer array length
            coeffLenA = baseNumCoeffs.length;
            coeffLenB = multiplierCoeffs.length;
            if ( coeffLenA < coeffLenB ) {
              productCoeffs = baseNumCoeffs;
              baseNumCoeffs = multiplierCoeffs;
              multiplierCoeffs = productCoeffs;
              idx = coeffLenA;
              coeffLenA = coeffLenB;
              coeffLenB = idx;
            }

            productCoeffs = []; // Resulting coefficients
            for ( idx = coeffLenA + coeffLenB; idx--; productCoeffs.push( 0 ) ); // Initialize product array with zeros

            var baseVal = baseConstantTenPow14,
              subDivisor = divisorConstant;

            // Perform long multiplication
            for ( idx = coeffLenB; --idx >= 0; ) {
              var carry = 0,
                lowPart = multiplierCoeffs[idx] % subDivisor,
                highPart = floorFunction( multiplierCoeffs[idx] / subDivisor ),
                productIndex = idx + ( currentCoeff = coeffLenA );

              for ( ; productIndex > idx; ) {
                carry = ( ( tempBigNum = lowPart * ( tempBigNum = baseNumCoeffs[--currentCoeff] % subDivisor ) + ( productCoeffs = highPart * tempBigNum + floorFunction( baseNumCoeffs[currentCoeff] / subDivisor ) * lowPart ) % subDivisor * subDivisor + productCoeffs[productIndex] + carry ) / baseVal | 0 ) + ( productCoeffs / subDivisor | 0 ) + highPart * floorFunction( baseNumCoeffs[currentCoeff] / subDivisor );
                productCoeffs[productIndex--] = tempBigNum % baseVal;
              }
              productCoeffs[productIndex] = carry;
            }

            // Normalize the result
            if ( carry ) {
              tempBigNum++;
            } else {
              productCoeffs.splice( 0, 1 );
            }
            return normalizeCoefficientArray( multiplierBigNum, productCoeffs, tempBigNum );
          };

          // Returns a BigNumber with its sign negated
          bigNumMethods.getNegated = function() {
            var newBigNum = new BigNumberClass( this );
            newBigNum.sign = -newBigNum.sign || null;
            return newBigNum;
          };

          // Adds another value to this BigNumber
          bigNumMethods.add = function( addendValue, base ) {
            var newBigNum, otherBigNum, thisSign,
              addendBigNum = new BigNumberClass( addendValue, base );
            thisSign = this.sign;
            otherBigNum = addendBigNum.sign;

            // Handle NaN
            if ( !thisSign || !otherBigNum ) return new BigNumberClass( NaN );

            // If signs are different, convert to subtraction
            if ( thisSign !== otherBigNum ) {
              addendBigNum.sign = -otherBigNum;
              return this.subtract( addendBigNum );
            }

            var thisExponentChunk = this.exponent / chunkSize,
              otherExponentChunk = addendBigNum.exponent / chunkSize,
              thisCoeffs = this.coeffs,
              otherCoeffs = addendBigNum.coeffs;

            // Handle cases where one or both numbers are null/zero
            if ( !thisExponentChunk || !otherExponentChunk ) {
              if ( !thisCoeffs || !otherCoeffs ) return new BigNumberClass( thisSign / 0 );
              if ( !thisCoeffs[0] || !otherCoeffs[0] ) return otherCoeffs[0] ? addendBigNum : new BigNumberClass( thisCoeffs[0] ? this : 0 * thisSign );
            }

            thisExponentChunk = integerFloor( thisExponentChunk );
            otherExponentChunk = integerFloor( otherExponentChunk );
            thisCoeffs = thisCoeffs.slice();

            // Align exponents by padding with zeros
            thisSign = thisExponentChunk - otherExponentChunk;
            if ( thisSign ) {
              var smallerCoeffs, padLength;
              if ( thisSign > 0 ) {
                otherExponentChunk = thisExponentChunk;
                smallerCoeffs = otherCoeffs;
              } else {
                padLength = -thisSign;
                smallerCoeffs = thisCoeffs;
              }
              smallerCoeffs.reverse();
              for ( ; padLength--; smallerCoeffs.push( 0 ) );
              smallerCoeffs.reverse();
            }

            // Ensure thisCoeffs is always the longer array
            if ( ( thisSign = thisCoeffs.length ) < ( otherBigNum = otherCoeffs.length ) ) {
              smallerCoeffs = otherCoeffs;
              otherCoeffs = thisCoeffs;
              thisCoeffs = smallerCoeffs;
              otherBigNum = thisSign;
            }

            // Perform addition
            for ( thisSign = 0; otherBigNum; ) {
              thisSign = ( thisCoeffs[--otherBigNum] = thisCoeffs[otherBigNum] + otherCoeffs[otherBigNum] + thisSign ) / baseConstantTenPow14 | 0;
              thisCoeffs[otherBigNum] = baseConstantTenPow14 === thisCoeffs[otherBigNum] ? 0 : thisCoeffs[otherBigNum] % baseConstantTenPow14;
            }

            // Handle final carry
            if ( thisSign ) {
              thisCoeffs = [thisSign].concat( thisCoeffs );
              otherExponentChunk++;
            }

            return normalizeCoefficientArray( addendBigNum, thisCoeffs, otherExponentChunk );
          };

          // Returns the precision (significant digits) of a BigNumber
          bigNumMethods.getPrecision = bigNumMethods.significantDigits = function( includeZeros, roundingMode ) {
            var coeffs, exponent, lastCoeff, resultCount = this;
            if ( includeZeros !== null && includeZeros !== !!includeZeros ) {
              validateParameter( includeZeros, 1, maxPrecisionLimit );
              if ( roundingMode === null ) roundingMode = currentRoundingMode;
              else validateParameter( roundingMode, 0, 8 );
              return roundBigNumberToPrecision( new BigNumberClass( resultCount ), includeZeros, roundingMode );
            }
            if ( !( coeffs = resultCount.coeffs ) ) return null;
            resultCount = ( ( exponent = coeffs.length - 1 ) * chunkSize ) + 1;
            lastCoeff = coeffs[exponent];
            if ( lastCoeff ) {
              for ( ; lastCoeff % 10 === 0; lastCoeff /= 10, resultCount-- );
              lastCoeff = coeffs[0];
              for ( ; lastCoeff >= 10; lastCoeff /= 10, resultCount++ );
            }
            if ( includeZeros && resultCount < resultCount.exponent + 1 ) resultCount = resultCount.exponent + 1;
            return resultCount;
          };

          // Shifts the decimal point of a BigNumber by an exponent
          bigNumMethods.shiftDecimalBy = function( exponentValue ) {
            validateParameter( exponentValue, -maxSafeIntJS, maxSafeIntJS );
            return this.timesValue( "1e" + exponentValue );
          };

          // Calculates the square root of a BigNumber
          bigNumMethods.getSquareRoot = bigNumMethods.squareRootValue = function() {
            var currentPrecision, tempNum, sqrtResult, tempCoeffs,
              isApproximate, otherValue, baseNum = this,
              baseNumCoeffs = baseNum.coeffs,
              baseNumSign = baseNum.sign,
              baseNumExp = baseNum.exponent,
              targetPrecision = decimalPlaceCount + 4,
              halfBigNum = new BigNumberClass( "0.5" );

            // Handle special cases (negative, NaN, 0, Infinity)
            if ( baseNumSign !== 1 || !baseNumCoeffs || !baseNumCoeffs[0] ) {
              return new BigNumberClass( !baseNumSign || ( baseNumSign < 0 && ( !baseNumCoeffs || baseNumCoeffs[0] ) ) ? NaN : baseNumCoeffs ? baseNum : 1 / 0 );
            }

            // Estimate square root using JavaScript's Math.sqrt
            tempNum = Math.sqrt( +convertValueToPrimitiveString( baseNum ) );
            if ( tempNum === 0 || tempNum === 1 / 0 ) {
              tempCoeffs = formatCoefficients( baseNumCoeffs );
              if ( ( tempCoeffs.length + baseNumExp ) % 2 === 0 ) tempCoeffs += "0";
              tempNum = Math.sqrt( +tempCoeffs );
              baseNumExp = integerFloor( ( baseNumExp + 1 ) / 2 ) - ( baseNumExp < 0 || baseNumExp % 2 );
              sqrtResult = new BigNumberClass( tempNum === 1 / 0 ? "1e" + baseNumExp : ( tempCoeffs = tempNum.toExponential() ).slice( 0, tempCoeffs.indexOf( "e" ) + 1 ) + baseNumExp );
            } else {
              sqrtResult = new BigNumberClass( tempNum + "" );
            }

            // Iterate to refine square root using Newton's method
            if ( sqrtResult.coeffs[0] ) {
              currentPrecision = ( tempNum = sqrtResult.exponent ) + targetPrecision;
              if ( currentPrecision < 3 ) currentPrecision = 0;
              for ( ;; ) {
                otherValue = sqrtResult;
                sqrtResult = halfBigNum.timesValue( otherValue.add( performDivision( baseNum, otherValue, targetPrecision, 1 ) ) );
                if ( formatCoefficients( otherValue.coeffs ).slice( 0, currentPrecision ) === ( tempCoeffs = formatCoefficients( sqrtResult.coeffs ) ).slice( 0, currentPrecision ) ) {
                  if ( sqrtResult.exponent < tempNum && ( currentPrecision--, tempCoeffs = tempCoeffs.slice( currentPrecision - 3, currentPrecision + 1 ) ) !== "9999" && ( isApproximate || "4999" !== tempCoeffs ) ) {
                    ( +tempCoeffs && ( +tempCoeffs.slice( 1 ) || "5" !== tempCoeffs.charAt( 0 ) ) ) || ( roundBigNumberToPrecision( sqrtResult, sqrtResult.exponent + decimalPlaceCount + 2, 1 ), tempNum = !sqrtResult.timesValue( sqrtResult ).equals( baseNum ) );
                    break;
                  }
                  if ( !isApproximate && ( roundBigNumberToPrecision( otherValue, otherValue.exponent + decimalPlaceCount + 2, 0 ), otherValue.timesValue( otherValue ).equals( baseNum ) ) ) {
                    sqrtResult = otherValue;
                    break;
                  }
                  targetPrecision += 4;
                  currentPrecision += 4;
                  isApproximate = 1;
                }
              }
            }
            return roundBigNumberToPrecision( sqrtResult, sqrtResult.exponent + decimalPlaceCount + 1, currentRoundingMode, tempNum );
          };

          // Converts the BigNumber to exponential notation
          bigNumMethods.convertToExponential = function( decimalPlaces, roundingMode ) {
            if ( decimalPlaces !== null ) {
              validateParameter( decimalPlaces, 0, maxPrecisionLimit );
              decimalPlaces++;
            }
            return formatNumberToString( this, decimalPlaces, roundingMode, 1 );
          };

          // Converts the BigNumber to fixed-point notation
          bigNumMethods.convertToFixed = function( decimalPlaces, roundingMode ) {
            if ( decimalPlaces !== null ) {
              validateParameter( decimalPlaces, 0, maxPrecisionLimit );
              decimalPlaces = decimalPlaces + this.exponent + 1;
            }
            return formatNumberToString( this, decimalPlaces, roundingMode );
          };

          // Formats the BigNumber using a custom format object
          bigNumMethods.formatOutput = function( formatObj, roundingMode, customFormat ) {
            var formattedString, isNegativeSign,
              currentBigNum = this;
            if ( customFormat === null ) {
              if ( formatObj !== null && roundingMode && typeof roundingMode === "object" ) {
                customFormat = roundingMode;
                roundingMode = null;
              } else if ( formatObj && typeof formatObj === "object" ) {
                customFormat = formatObj;
                formatObj = roundingMode = null;
              } else {
                customFormat = outputFormatSettings;
              }
            } else if ( typeof customFormat !== "object" ) {
              throw Error( errorMsgPrefix + "Argument not an object: " + customFormat );
            }

            formattedString = currentBigNum.convertToFixed( formatObj, roundingMode );

            if ( currentBigNum.coeffs ) {
              var integerPart, fractionalPart, groupSize = +customFormat.groupSize,
                secondaryGroupSize = +customFormat.secondaryGroupSize,
                groupSeparator = customFormat.groupSeparator || "",
                stringParts = formattedString.split( "." );

              integerPart = stringParts[0];
              fractionalPart = stringParts[1];
              isNegativeSign = currentBigNum.sign < 0;

              var integerDigits = isNegativeSign ? integerPart.slice( 1 ) : integerPart,
                integerLength = integerDigits.length;

              if ( secondaryGroupSize ) {
                var tempGroupSize = groupSize;
                groupSize = secondaryGroupSize;
                secondaryGroupSize = tempGroupSize;
                integerLength -= tempGroupSize;
              }

              if ( groupSize > 0 && integerLength > 0 ) {
                var offset = integerLength % groupSize || groupSize;
                integerPart = integerDigits.substr( 0, offset );
                for ( ; offset < integerLength; offset += groupSize ) {
                  integerPart += groupSeparator + integerDigits.substr( offset, groupSize );
                }
                if ( secondaryGroupSize > 0 ) integerPart += groupSeparator + integerDigits.slice( offset );
                if ( isNegativeSign ) integerPart = "-" + integerPart;
              }

              formattedString = fractionalPart ? integerPart + ( customFormat.decimalSeparator || "" ) + ( ( secondaryGroupSize = +customFormat.fractionGroupSize ) ? fractionalPart.replace( new RegExp( "\\d{" + secondaryGroupSize + "}\\B", "g" ), "$&" + ( customFormat.fractionGroupSeparator || "" ) ) : fractionalPart ) : integerPart;
            }
            return ( customFormat.prefix || "" ) + formattedString + ( customFormat.suffix || "" );
          };

          // Converts the BigNumber to a fraction
          bigNumMethods.convertToFraction = function( maxDenominator ) {
            var numeratorBigNum, denominatorBigNum, tempBigNum,
              remainderBigNum, currentNumerator, currentDenominator,
              tempQuotient, tempFraction, currentFraction,
              targetExponent, precisionConfig, currentPrecision,
              baseNum = this,
              baseNumCoeffs = baseNum.coeffs;

            // Validate maxDenominator
            if ( maxDenominator !== null && ( !( currentFraction = new BigNumberClass( maxDenominator ) ).isWholeNumber() && ( currentFraction.coeffs || currentFraction.sign !== 1 ) || currentFraction.lessThan( oneBigNumInstance ) ) ) {
              throw Error( errorMsgPrefix + "Argument " + ( currentFraction.isWholeNumber() ? "out of range: " : "not an integer: " ) + convertValueToPrimitiveString( currentFraction ) );
            }

            if ( !baseNumCoeffs ) return new BigNumberClass( baseNum ); // Return NaN/Infinity if input is NaN/Infinity

            numeratorBigNum = new BigNumberClass( oneBigNumInstance );
            currentNumerator = new BigNumberClass( oneBigNumInstance );
            denominatorBigNum = new BigNumberClass( oneBigNumInstance );
            currentDenominator = new BigNumberClass( oneBigNumInstance );

            tempCoeffs = formatCoefficients( baseNumCoeffs );
            tempBigNum = numeratorBigNum.exponent = tempCoeffs.length - baseNum.exponent - 1;
            numeratorBigNum.coeffs[0] = tenPowersLookup[( currentFraction = tempBigNum % chunkSize ) < 0 ? chunkSize + currentFraction : currentFraction];

            maxDenominator = !maxDenominator || currentFraction.compareWith( numeratorBigNum ) > 0 ? tempBigNum > 0 ? numeratorBigNum : currentNumerator : currentFraction;
            precisionConfig = rangeUpperLimit; // Store original rangeUpperLimit
            rangeUpperLimit = 1 / 0; // Temporarily set to infinity to avoid range errors
            currentFraction = new BigNumberClass( tempCoeffs );
            currentDenominator.coeffs[0] = 0;

            for ( ; tempQuotient = performDivision( currentFraction, numeratorBigNum, 0, 1 ), ( currentNumerator = currentNumerator.add( tempQuotient.timesValue( currentDenominator ) ) ).compareWith( maxDenominator ) !== 1; ) {
              currentDenominator = currentNumerator;
              currentNumerator = currentFraction;
              numeratorBigNum = currentDenominator.add( tempQuotient.timesValue( ( tempCoeffs = numeratorBigNum ) ) );
              currentFraction = tempCoeffs;
              numeratorBigNum = currentFraction.subtract( tempQuotient.timesValue( ( tempCoeffs = numeratorBigNum ) ) );
              currentFraction = tempCoeffs;
            }

            tempCoeffs = performDivision( maxDenominator.subtract( currentDenominator ), numeratorBigNum, 0, 1 );
            currentDenominator = currentDenominator.add( tempCoeffs.timesValue( currentNumerator ) );
            currentNumerator = currentNumerator.add( tempCoeffs.timesValue( numeratorBigNum ) );

            currentDenominator.sign = currentNumerator.sign = baseNum.sign;
            tempBigNum = performDivision( currentNumerator, numeratorBigNum, targetExponent = tempBigNum * 2, currentRoundingMode ).subtract( baseNum ).getAbsoluteValue().compareWith( performDivision( currentDenominator, currentNumerator, targetExponent, currentRoundingMode ).subtract( baseNum ).getAbsoluteValue() ) < 1 ? [currentNumerator, numeratorBigNum] : [currentDenominator, currentNumerator];

            rangeUpperLimit = precisionConfig; // Restore original rangeUpperLimit
            return tempBigNum;
          };

          // Converts the BigNumber to a JavaScript number primitive
          bigNumMethods.convertToNumber = function() {
            return +convertValueToPrimitiveString( this );
          };

          // Converts the BigNumber to a string with a specified precision
          bigNumMethods.convertToPrecision = function( precision, roundingMode ) {
            if ( precision !== null ) validateParameter( precision, 1, maxPrecisionLimit );
            return formatNumberToString( this, precision, roundingMode, 2 );
          };

          // Converts the BigNumber to its string representation
          bigNumMethods.convertToString = function( base ) {
            var resultString, bigNum = this,
              signVal = bigNum.sign,
              exponentVal = bigNum.exponent;

            if ( exponentVal === null ) {
              resultString = signVal ? ( resultString = "Infinity", signVal < 0 && ( resultString = "-" + resultString ) ) : ( resultString = "NaN" );
            } else {
              if ( base === null ) {
                resultString = exponentVal <= expFormatLowerBound || exponentVal >= expFormatUpperBound ? toExponentialFormat( formatCoefficients( bigNum.coeffs ), exponentVal ) : insertDecimalPointAt( formatCoefficients( bigNum.coeffs ), exponentVal, "0" );
              } else if ( base === 10 ) {
                resultString = insertDecimalPointAt( formatCoefficients( ( bigNum = roundBigNumberToPrecision( new BigNumberClass( bigNum ), decimalPlaceCount + exponentVal + 1, currentRoundingMode ) ).coeffs ), bigNum.exponent, "0" );
              } else {
                validateParameter( base, 2, customAlphabetChars.length, "Base" );
                resultString = convertNumberToBase( insertDecimalPointAt( formatCoefficients( bigNum.coeffs ), exponentVal, "0" ), 10, base, signVal, true );
              }
              if ( signVal < 0 && bigNum.coeffs[0] ) resultString = "-" + resultString;
            }
            return resultString;
          };

          // Returns the primitive value of the BigNumber (used by valueOf and JSON.stringify)
          bigNumMethods.getValue = bigNumMethods.serializeToJSON = function() {
            return convertValueToPrimitiveString( this );
          };

          bigNumMethods._isLargeNumber = true; // Internal flag to identify BigNumber instances

          // Apply initial configuration if provided
          if ( configOptions !== null ) BigNumberClass.applySettings( configOptions );

          return BigNumberClass; // Return the BigNumber constructor
        }();

        // Export BigNumber constructor to global context, and define module exports
        if ( typeof bigNumConstructor === "undefined" ) {
          largeNumPrototype.default = largeNumPrototype.BigNumber = largeNumPrototype;
          moduleRef.exports = largeNumPrototype;
        } else {
          // AMD/CommonJS export handling
          moduleRef.exports = bigNumConstructor;
        }
      }() );
    },

    // Module 3: Node.js 'fs' (File System) Module
    function( currentModule, moduleExports ) {
      currentModule.exports = require( "fs" );
    }
  ]
);