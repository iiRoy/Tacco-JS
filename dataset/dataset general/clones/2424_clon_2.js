var sysUtil = require('util');

var parseSegments = function( rawString, regexPattern, processDivider, contextObject ) {
  // This function divides a string based on a regular expression,
  // allowing for the capture and processing of the delimiters themselves.

  // rawString: The string to be segmented.
  // regexPattern: The regular expression used for splitting.
  // processDivider: An optional function to handle captured delimiters.
  //                 Each captured group (excluding group 0) is passed as a parameter.
  //                 If it returns a value, that value is added to the list of segments.
  // contextObject: The 'this' context for calling processDivider.

  var segmentsList = []; // Array to store the resulting segments.
  var currentMatch, pieceText, lastPosition = 0;

  // Iterate while matches are found in the string.
  while ( (currentMatch = regexPattern.exec(rawString)) !== null ) {
    // Extract the content before the current delimiter.
    pieceText = rawString.slice( lastPosition, regexPattern.lastIndex - currentMatch[0].length );

    // If there's content, add it to the segments list.
    if ( pieceText.length > 0 ) {
      segmentsList.push(pieceText);
    }

    // If a divider processing function is provided, call it.
    if ( processDivider ) {
      // Pass captured groups and the current length of the segments list.
      var processedPart = processDivider.apply( contextObject, currentMatch.slice(1).concat(segmentsList.length) );

      // If the processing function returned a meaningful value, add it.
      if ( typeof processedPart !== 'undefined' ) {
        // Special handling for a '%' specifier, as in printf-style formatting.
        if ( processedPart.typeSpecifier === '%' ) {
          segmentsList.push('%');
        } else {
          segmentsList.push(processedPart);
        }
      }
    }
    // Update the last position to continue searching after the current match.
    lastPosition = regexPattern.lastIndex;
  }

  // Add any remaining content after the last delimiter.
  pieceText = rawString.slice(lastPosition);
  if ( pieceText.length > 0 ) {
    segmentsList.push(pieceText);
  }

  return segmentsList;
};

var StringComposer = function( layoutSchema ) {
  // Constructor for the StringComposer.
  // It takes a layout schema string (like a format string)
  // and parses it into an internal representation.

  var initialSegments = []; // Temporary array, not directly used here but good to keep structure.
  this._hasMapping = false; // Flag indicating if format string uses named mappings.
  this._originalTemplate = layoutSchema; // Store the original format string.

  // Parse the layout schema using the internal regex and delimiter handler.
  this._layoutParts = parseSegments(
    layoutSchema,
    this._parsingRegex,
    this._handleDivider,
    this
  );
};

StringComposer.prototype._parsingRegex = /\%(?:\(([\w_]+)\)|([1-9]\d*)\$)?([0 +\-\#]*)(\*|\d+)?(\.)?(\*|\d+)?[hlL]?([\%bscdeEfFgGioOuxX])/g;

StringComposer.prototype._handleDivider = function(
  mapIdentifier,
  ordinalPosition,
  styleIndicators,
  minCharCount,
  dotIndicator,
  fractionalDigits,
  typeSpecifier
) {
  // This method processes a captured delimiter (format specifier) from the regex.
  // It extracts various properties like mapping, flags, width, precision, and type.

  if (mapIdentifier) {
    this._hasMapping = true; // Set flag if a named mapping is used.
  }

  // Return an object representing the parsed format token.
  return {
    keyMapping: mapIdentifier,
    numericIndex: ordinalPosition,
    formatFlags: styleIndicators,
    _rawMinWidth: minCharCount, // Raw minimum width, might be '*'
    decimalPoint: dotIndicator,
    _rawPrecision: fractionalDigits, // Raw precision, might be '*'
    typeSpecifier: typeSpecifier
  };
};

StringComposer.prototype._formatRules = {
  // Defines rules and properties for different format specifiers.
  binaryCode: {
    numericalBase: 2,
    isInteger: true
  },
  octalCode: {
    numericalBase: 8,
    isInteger: true
  },
  hexLower: {
    numericalBase: 16,
    isInteger: true
  },
  hexUpper: {
    inheritsFrom: ['hexLower'],
    convertToUppercase: true
  },
  decimalInt: {
    numericalBase: 10,
    isInteger: true
  },
  integerType: {
    inheritsFrom: ['decimalInt']
  },
  unsignedInt: {
    inheritsFrom: ['decimalInt'],
    isUnsignedNumber: true
  },
  charCode: {
    configureArgument: function(segmentItem) {
      // Special handler for character code specifier.
      if (!isNaN(segmentItem.argumentValue)) {
        var numericValue = parseInt(segmentItem.argumentValue);
        if (numericValue < 0 || numericValue > 127) {
          throw new Error('Invalid character code provided for %c in printf-style formatting');
        }
        segmentItem.argumentValue = isNaN(numericValue) ? '' + numericValue : String.fromCharCode(numericValue);
      }
    }
  },
  stringType: {
    adjustMaxWidth: function(segmentItem) {
      // Adjusts max width based on precision for string types.
      segmentItem.maxWidth = (segmentItem.decimalPoint === '.') ? segmentItem.decimalPrecision : -1;
    }
  },
  expLower: {
    isFloatingPoint: true,
    floatNotation: 'e'
  },
  expUpper: {
    inheritsFrom: ['expLower'],
    convertToUppercase: true
  },
  floatLower: {
    isFloatingPoint: true,
    floatNotation: 'f'
  },
  floatUpper: {
    inheritsFrom: ['floatLower']
  },
  genLower: {
    isFloatingPoint: true,
    floatNotation: 'g'
  },
  genUpper: {
    inheritsFrom: ['genLower'],
    convertToUppercase: true
  },
  objectType: {
    isObject: true
  },
};

StringComposer.prototype.composeOutput = function( /*mixed...*/ dataArguments ) {
  // Main method to format the string using the provided arguments.

  // If named mappings are used, the input values must be an object.
  if ( this._hasMapping && typeof dataArguments !== 'object' ) {
    throw new Error('Format requires an object for named mappings');
  }

  var composedText = '';
  var argumentPointer = 0; // Tracks the current argument for positional specifiers.

  // Iterate through each parsed segment (literal string or format token).
  for ( var loopCounter = 0, segmentItem; loopCounter < this._layoutParts.length; loopCounter++ ) {
    segmentItem = this._layoutParts[loopCounter];

    if ( typeof segmentItem === 'string' ) {
      composedText += segmentItem; // Append literal strings directly.
    } else {
      // This is a format token, process it.
      if ( this._hasMapping ) {
        // If using named mappings, retrieve argument by key.
        if ( typeof dataArguments[segmentItem.keyMapping] === 'undefined' ) {
          throw new Error('Missing key for mapped format: ' + segmentItem.keyMapping);
        }
        segmentItem.argumentValue = dataArguments[segmentItem.keyMapping];
      } else {
        // If using positional arguments.
        if ( segmentItem.numericIndex ) {
          argumentPointer = parseInt(segmentItem.numericIndex) - 1;
        }
        // Check if enough arguments are provided.
        if ( argumentPointer >= arguments.length ) {
          throw new Error('Insufficient arguments provided for template: \'' + this._originalTemplate + '\'');
        }
        segmentItem.argumentValue = arguments[argumentPointer++]; // Assign and advance pointer.
      }

      // Compile token properties if not already done.
      if ( !segmentItem.isCompiled ) {
        segmentItem.isCompiled = true;
        segmentItem.signChar = '';
        segmentItem.padWithZeros = false;
        segmentItem.alignRight = false;
        segmentItem.alternateForm = false;

        var currentFlags = {};
        // Process each flag character.
        for ( var flagIndex = segmentItem.formatFlags.length; flagIndex--; ) {
          var currentFlag = segmentItem.formatFlags.charAt(flagIndex);
          currentFlags[currentFlag] = true; // Mark flag as seen.

          switch (currentFlag) {
            case ' ':
              segmentItem.signChar = ' ';
              break;
            case '+':
              segmentItem.signChar = '+';
              break;
            case '0':
              segmentItem.padWithZeros = (currentFlags['-']) ? false : true; // '0' overridden by '-'
              break;
            case '-':
              segmentItem.alignRight = true;
              segmentItem.padWithZeros = false; // '-' overrides '0'
              break;
            case '#':
              segmentItem.alternateForm = true;
              break;
            default:
              throw Error('Bad formatting flag: \'' + segmentItem.formatFlags.charAt(flagIndex) + '\'');
          }
        }

        // Determine minimum width and initialize other properties.
        segmentItem.minimumWidth = (segmentItem._rawMinWidth) ? parseInt(segmentItem._rawMinWidth) : 0;
        segmentItem.maxWidth = -1;
        segmentItem.convertToUppercase = false;
        segmentItem.isUnsignedNumber = false;
        segmentItem.isInteger = false;
        segmentItem.isFloatingPoint = false;
        segmentItem.isObject = false;
        segmentItem.decimalPrecision = 1; // Default precision.

        // If precision is explicitly specified.
        if ( segmentItem.decimalPoint === '.' ) {
          if ( segmentItem._rawPrecision ) {
            segmentItem.decimalPrecision = parseInt(segmentItem._rawPrecision);
          } else {
            segmentItem.decimalPrecision = 0; // Empty precision after '.' means 0.
          }
        }

        // Apply rules from the specifier definitions.
        var typeProperties = this._formatRules[segmentItem.typeSpecifier];
        if ( typeof typeProperties === 'undefined' ) {
          throw new Error('Unexpected type specifier: \'' + segmentItem.typeSpecifier + '\'');
        }

        // Handle inheritance of properties.
        if ( typeProperties.inheritsFrom ) {
          var extendedRules = this._formatRules[typeProperties.inheritsFrom];
          for ( var keyName in extendedRules ) {
            typeProperties[keyName] = extendedRules[keyName];
          }
          delete typeProperties.inheritsFrom; // Remove the inheritance property itself.
        }

        // Mix in all properties from the rule set to the token.
        for ( var propName in typeProperties ) {
          segmentItem[propName] = typeProperties[propName];
        }
      }

      // Call specific argument configuration if defined.
      if ( typeof segmentItem.configureArgument === 'function' ) {
        segmentItem.configureArgument(segmentItem);
      }

      // Call max width adjustment if defined.
      if ( typeof segmentItem.adjustMaxWidth === 'function' ) {
        segmentItem.adjustMaxWidth(segmentItem);
      }

      // Handle dynamic width specified by '*'.
      if ( segmentItem._rawMinWidth === '*' ) {
        if ( this._hasMapping ) {
          throw new Error('Dynamic width (*) not supported in mapped formats');
        }
        segmentItem.minimumWidth = parseInt(arguments[argumentPointer++]);
        if ( isNaN(segmentItem.minimumWidth) ) {
          throw new Error('Argument for dynamic width at position ' + argumentPointer + ' is not a number in \'' + this._originalTemplate + '\'');
        }
        // Negative width implies right justification.
        if ( segmentItem.minimumWidth < 0 ) {
          segmentItem.alignRight = true;
          segmentItem.minimumWidth = -segmentItem.minimumWidth;
        }
      }

      // Handle dynamic precision specified by '*'.
      if ( segmentItem._rawPrecision === '*' && segmentItem.decimalPoint === '.' ) {
        if ( this._hasMapping ) {
          throw new Error('Dynamic precision (*) not supported in mapped formats');
        }
        segmentItem.decimalPrecision = parseInt(arguments[argumentPointer++]);
        if ( isNaN(segmentItem.decimalPrecision) ) {
          throw Error('Argument for dynamic precision at position ' + argumentPointer + ' is not a number in \'' + this._originalTemplate + '\'');
        }
        // Negative precision means unspecified.
        if ( segmentItem.decimalPrecision < 0 ) {
          segmentItem.decimalPrecision = 1;
          segmentItem.decimalPoint = ''; // Effectively remove precision.
        }
      }

      // Apply specific formatting based on type.
      if ( segmentItem.isInteger ) {
        // If precision is specified for an integer, disable zero padding.
        if ( segmentItem.decimalPoint === '.' ) {
          segmentItem.padWithZeros = false;
        }
        this.formatInteger(segmentItem);
      } else if ( segmentItem.isFloatingPoint ) {
        // Default precision for floats if not specified.
        if ( segmentItem.decimalPoint !== '.' ) {
          segmentItem.decimalPrecision = 6;
        }
        this.formatFloat(segmentItem);
      } else if ( segmentItem.isObject ) {
        this.formatObject(segmentItem);
      }

      // Adjust the field to fit minWidth and maxWidth.
      this.adjustField(segmentItem);

      composedText += '' + segmentItem.argumentValue; // Append formatted value.
    }
  }

  return composedText;
};

StringComposer.prototype._tenZeros = '0000000000';
StringComposer.prototype._tenSpaces = '          ';

StringComposer.prototype.formatInteger = function(segmentItem) {
  var integerValue = parseInt(segmentItem.argumentValue);

  // Handle non-finite numbers (NaN, Infinity).
  if ( !isFinite(integerValue) ) {
    // Only allow if the original argument was a number.
    if ( typeof segmentItem.argumentValue !== 'number' ) {
      throw new Error('Format argument \'' + segmentItem.argumentValue + '\' is not an integer; parseInt returned ' + integerValue);
    }
    integerValue = 0; // Default to 0 for non-finite numbers.
  }

  // For non-base-10 and unsigned, handle negative numbers correctly.
  // E.g., (-10).toString(16) is '-a' in JS, not 'fffffff6'.
  if ( integerValue < 0 && (segmentItem.isUnsignedNumber || segmentItem.numericalBase !== 10) ) {
    integerValue = 0xffffffff + integerValue + 1;
  }

  if ( integerValue < 0 ) {
    segmentItem.argumentValue = (-integerValue).toString(segmentItem.numericalBase);
    this.applyZeroPadding(segmentItem); // Apply padding to the absolute value.
    segmentItem.argumentValue = '-' + segmentItem.argumentValue; // Re-add negative sign.
  } else {
    segmentItem.argumentValue = integerValue.toString(segmentItem.numericalBase);
    // Special case: argument 0 with precision 0 formats as an empty string.
    if ( !integerValue && !segmentItem.decimalPrecision ) {
      segmentItem.argumentValue = '';
    } else {
      this.applyZeroPadding(segmentItem);
    }
    if ( segmentItem.signChar ) {
      segmentItem.argumentValue = segmentItem.signChar + segmentItem.argumentValue;
    }
  }

  // Handle hexadecimal specific formatting.
  if ( segmentItem.numericalBase === 16 ) {
    if ( segmentItem.alternateForm ) {
      segmentItem.argumentValue = '0x' + segmentItem.argumentValue;
    }
    segmentItem.argumentValue = segmentItem.convertToUppercase ? segmentItem.argumentValue.toUpperCase() : segmentItem.argumentValue.toLowerCase();
  }

  // Handle octal specific formatting.
  if ( segmentItem.numericalBase === 8 ) {
    // Add '0' prefix if alternative form and not already prefixed.
    if ( segmentItem.alternateForm && segmentItem.argumentValue.charAt(0) !== '0' ) {
      segmentItem.argumentValue = '0' + segmentItem.argumentValue;
    }
  }
};

StringComposer.prototype.formatFloat = function(segmentItem) {
  var floatValue = parseFloat(segmentItem.argumentValue);

  // Handle non-finite float values.
  if ( !isFinite(floatValue) ) {
    // Only proceed if the original argument was a number.
    if ( typeof segmentItem.argumentValue !== 'number' ) {
      throw new Error('Format argument \'' + segmentItem.argumentValue + '\' is not a float; parseFloat returned ' + floatValue);
    }
    floatValue = 0; // Default to 0.
  }

  switch (segmentItem.floatNotation) {
    case 'e': {
      segmentItem.argumentValue = floatValue.toExponential(segmentItem.decimalPrecision);
      break;
    }
    case 'f': {
      segmentItem.argumentValue = floatValue.toFixed(segmentItem.decimalPrecision);
      break;
    }
    case 'g': {
      // 'g' notation logic: use exponential if very small or very large.
      if ( Math.abs(floatValue) < 0.0001 ) {
        segmentItem.argumentValue = floatValue.toExponential(segmentItem.decimalPrecision > 0 ? segmentItem.decimalPrecision - 1 : segmentItem.decimalPrecision);
      } else {
        segmentItem.argumentValue = floatValue.toPrecision(segmentItem.decimalPrecision);
      }

      // Remove trailing zeros from fractional part for 'g' unless alternative form is used.
      if ( !segmentItem.alternateForm ) {
        segmentItem.argumentValue = segmentItem.argumentValue.replace(/(\..*[^0])0*e/, '$1e');
        segmentItem.argumentValue = segmentItem.argumentValue.replace(/\.0*e/, 'e').replace(/\.0$/, '');
      }
      break;
    }
    default:
      throw new Error('Unexpected float notation: \'' + segmentItem.floatNotation + '\'');
  }

  // Ensure exponent has at least two digits (e.g., e+08 instead of e+8).
  segmentItem.argumentValue = segmentItem.argumentValue.replace(/e\+(\d)$/, 'e+0$1').replace(/e\-(\d)$/, 'e-0$1');

  // If alternate form, ensure a decimal point is present.
  if ( segmentItem.alternateForm ) {
    segmentItem.argumentValue = segmentItem.argumentValue.replace(/^(\d+)$/, '$1.');
    segmentItem.argumentValue = segmentItem.argumentValue.replace(/^(\d+)e/, '$1.e');
  }

  // Prepend sign if positive and sign char is specified.
  if ( floatValue >= 0 && segmentItem.signChar ) {
    segmentItem.argumentValue = segmentItem.signChar + segmentItem.argumentValue;
  }

  // Convert to upper or lower case based on specifier.
  segmentItem.argumentValue = segmentItem.convertToUppercase ? segmentItem.argumentValue.toUpperCase() : segmentItem.argumentValue.toLowerCase();
};

StringComposer.prototype.formatObject = function(segmentItem) {
  // Determine object inspection depth based on precision.
  var inspectionDepth = (segmentItem.decimalPoint === '.') ? segmentItem.decimalPrecision : null;
  // Use Node.js util.inspect for object representation.
  segmentItem.argumentValue = sysUtil.inspect(
    segmentItem.argumentValue,
    !segmentItem.alternateForm, // showHidden equivalent
    inspectionDepth
  );
};

StringComposer.prototype.applyZeroPadding = function(segmentItem, targetLength) {
  // Applies zero padding to the argument value.
  targetLength = (arguments.length === 2) ? targetLength : segmentItem.decimalPrecision;
  var isNegative = false;

  if ( typeof segmentItem.argumentValue !== "string" ) {
    segmentItem.argumentValue = "" + segmentItem.argumentValue;
  }

  // Handle negative sign separately for padding.
  if ( segmentItem.argumentValue.substr(0,1) === '-' ) {
    isNegative = true;
    segmentItem.argumentValue = segmentItem.argumentValue.substr(1);
  }

  // Efficiently pad with '0's.
  var lessThanTen = targetLength - 10;
  while ( segmentItem.argumentValue.length < lessThanTen ) {
    segmentItem.argumentValue = (segmentItem.alignRight) ? segmentItem.argumentValue + this._tenZeros : this._tenZeros + segmentItem.argumentValue;
  }
  var paddingAmount = targetLength - segmentItem.argumentValue.length;
  segmentItem.argumentValue = (segmentItem.alignRight) ? segmentItem.argumentValue + this._tenZeros.substring(0, paddingAmount) : this._tenZeros.substring(0, paddingAmount) + segmentItem.argumentValue;

  if ( isNegative ) segmentItem.argumentValue = '-' + segmentItem.argumentValue;
};

StringComposer.prototype.adjustField = function(segmentItem) {
  // Adjusts the field based on max width, zero padding, or space padding.
  if ( segmentItem.maxWidth >= 0 && segmentItem.argumentValue.length > segmentItem.maxWidth ) {
    segmentItem.argumentValue = segmentItem.argumentValue.substring(0, segmentItem.maxWidth);
    return;
  }
  if ( segmentItem.padWithZeros ) {
    this.applyZeroPadding(segmentItem, segmentItem.minimumWidth);
    return;
  }
  this.applySpacePadding(segmentItem);
};

StringComposer.prototype.applySpacePadding = function(segmentItem, targetLength) {
  // Applies space padding to the argument value.
  targetLength = (arguments.length === 2) ? targetLength : segmentItem.minimumWidth;
  if ( typeof segmentItem.argumentValue !== 'string' ) {
    segmentItem.argumentValue = '' + segmentItem.argumentValue;
  }

  // Efficiently pad with spaces.
  var lessThanTen = targetLength - 10;
  while ( segmentItem.argumentValue.length < lessThanTen ) {
    segmentItem.argumentValue = (segmentItem.alignRight) ? segmentItem.argumentValue + this._tenSpaces : this._tenSpaces + segmentItem.argumentValue;
  }
  var paddingAmount = targetLength - segmentItem.argumentValue.length;
  segmentItem.argumentValue = (segmentItem.alignRight) ? segmentItem.argumentValue + this._tenSpaces.substring(0, paddingAmount) : this._tenSpaces.substring(0, paddingAmount) + segmentItem.argumentValue;
};


// Main export function for printf-style formatting.
module.exports = function() {
  var inputArgs = Array.prototype.slice.call(arguments),
    outputStream; // Declare outputStream here.
  var layoutSchema;

  // Check if the first argument is a stream.
  if ( inputArgs[0] instanceof require('stream').Stream ) {
    outputStream = inputArgs.shift(); // Extract and remove the stream.
  }
  layoutSchema = inputArgs.shift(); // The next argument is the format string.

  var composerInstance = new StringComposer(layoutSchema);
  // Apply formatting using the remaining arguments.
  var resultString = composerInstance.composeOutput.apply(composerInstance, inputArgs);

  // If a stream was provided, write the result to it.
  if ( outputStream ) {
    outputStream.write(resultString);
  } else {
    // Otherwise, return the formatted string.
    return resultString;
  }
};

// Also export the StringComposer constructor for direct use.
module.exports.StringComposer = StringComposer;