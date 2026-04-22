const nodeUtilities = require('util'); // Renamed 'util' to 'nodeUtilities'

/**
 * Deconstructs an input string using a regular expression to identify delimiters.
 * It produces an array of content segments and processed delimiter tokens.
 * @param {string} inputString - The source string to be analyzed.
 * @param {RegExp} delimiterRegex - The regular expression that defines the delimiters.
 * @param {Function} [delimiterProcessor] - An optional callback function to interpret each delimiter match.
 *                                          It receives captured groups (excluding full match) as arguments.
 *                                          If it returns a value, that value is added to the result array.
 * @param {object} [contextObject] - The 'this' context for the delimiterProcessor callback.
 * @returns {Array<string|any>} A sequence of string parts and parsed delimiter objects.
 */
const splitByPattern = (inputString, delimiterRegex, delimiterProcessor, contextObject) => {
  const resultSegments = []; // Renamed 'tokens' to 'resultSegments'
  let currentMatch; // Renamed 'match' to 'currentMatch'
  let segmentContent; // Renamed 'content' to 'segmentContent'
  let lastPosition = 0; // Renamed 'lastIndex' to 'lastPosition'

  // Input validation for robustness
  if (typeof inputString !== 'string') {
    throw new TypeError('The provided source string must be of type string.');
  }
  if (!(delimiterRegex instanceof RegExp)) {
    throw new TypeError('The delimiter pattern must be a valid regular expression.');
  }

  // Traverse the input string, finding all occurrences of the delimiter pattern.
  while ((currentMatch = delimiterRegex.exec(inputString)) !== null) {
    // Extract the segment of the string that came before the current delimiter.
    segmentContent = inputString.slice(lastPosition, delimiterRegex.lastIndex - currentMatch[0].length);
    if (segmentContent.length > 0) {
      resultSegments.push(segmentContent);
    }

    // If a processor is supplied, invoke it with the captured groups of the delimiter.
    if (typeof delimiterProcessor === 'function') {
      const capturedGroups = currentMatch.slice(1); // Exclude the full match (group 0)
      const processorArgs = capturedGroups.concat(resultSegments.length); // Append current count for potential use
      const processedValue = delimiterProcessor.apply(contextObject, processorArgs);

      // If the processor yields a value, incorporate it into the result sequence.
      if (processedValue !== undefined) {
        // Special case for '%%' (literal percent sign) handled as a distinct object.
        if (typeof processedValue === 'object' && processedValue !== null && processedValue.typeSpecifier === '%') {
          resultSegments.push('%');
        } else {
          resultSegments.push(processedValue);
        }
      }
    }
    lastPosition = delimiterRegex.lastIndex; // Advance the starting point for the next slice.
  }

  // Append any remaining string content after the very last delimiter.
  segmentContent = inputString.slice(lastPosition);
  if (segmentContent.length > 0) {
    resultSegments.push(segmentContent);
  }

  return resultSegments;
};

/**
 * Provides a flexible engine for formatting strings, inspired by C's printf.
 * It supports positional, named, and flag-based formatting.
 */
class FormatEngine { // Renamed 'Formatter' to 'FormatEngine'
  /**
   * Initializes the formatting engine with a specific format template.
   * @param {string} formatTemplate - The template string containing format specifiers.
   */
  constructor(formatTemplate) { // Renamed 'format' to 'formatTemplate'
    if (typeof formatTemplate !== 'string') {
      throw new TypeError('The format template must be a string value.');
    }
    this.hasNamedPlaceholders = false; // Renamed '_mapped' to 'hasNamedPlaceholders'
    this.sourceTemplate = formatTemplate; // Renamed '_format' to 'sourceTemplate'

    // Utilize the `splitByPattern` utility to break down the format string.
    this.parsedTokens = splitByPattern(formatTemplate, this._patternRecognizer, this._handleDelimiterMatch, this);
  }

  /**
   * Regular expression for identifying printf-style format specifiers.
   * This regex captures various components like flags, width, precision, and type.
   * @private
   */
  _patternRecognizer = /\%(?:\(([\w_]+)\)|([1-9]\d*)\$)?([0 +\-\#]*)(\*|\d+)?(\.)?(\*|\d+)?[hlL]?([\%bscdeEfFgGioOuxX])/g;

  /**
   * Callback function used by `splitByPattern` to process each matched format specifier.
   * It extracts details like named keys, positional indices, flags, etc., into a token object.
   * @private
   * @param {string} namedKey - The identifier for a named argument (e.g., 'name' in %(name)s).
   * @param {string} positionalIndex - The index for a positional argument (e.g., '1' in %1$s).
   * @param {string} formatFlags - A string containing formatting flags (e.g., '0', '+', '-').
   * @param {string} minimumWidthSpec - The raw string for minimum field width (e.g., '10' or '*').
   * @param {string} periodChar - The period character ('.') if precision is specified.
   * @param {string} precisionSpec - The raw string for precision (e.g., '5' or '*').
   * @param {string} typeSpecifier - The character indicating the data type (e.g., 's', 'd', 'f').
   * @returns {object|undefined} A structured token object or a special marker for '%%'.
   */
  _handleDelimiterMatch(namedKey, positionalIndex, formatFlags, minimumWidthSpec, periodChar, precisionSpec, typeSpecifier) {
    if (namedKey) {
      this.hasNamedPlaceholders = true; // Flag that named arguments are in use.
    }

    // If the specifier is '%%', it's an escape sequence for a literal percent sign.
    if (typeSpecifier === '%') {
      return { typeSpecifier: '%' };
    }

    // Construct and return the token object containing all parsed specifier details.
    const formatTokenDetails = {
      namedKey: namedKey,
      positionalIndex: positionalIndex,
      formatFlags: formatFlags,
      _minWidthSpecifier: minimumWidthSpec, // Store raw specifier for dynamic width handling
      periodChar: periodChar,
      _precisionSpecifier: precisionSpec, // Store raw specifier for dynamic precision handling
      typeSpecifier: typeSpecifier
    };
    return formatTokenDetails;
  }

  /**
   * Defines the behavior and properties for various format specifier types.
   * This object serves as a lookup table for processing different data types.
   * @private
   */
  _typeDefinitions = { // Renamed '_specifiers' to '_typeDefinitions'
    // Integer type definitions
    binary: { numericalBase: 2, isIntegral: true }, // 'b'
    octal: { numericalBase: 8, isIntegral: true }, // 'o'
    hexLower: { numericalBase: 16, isIntegral: true }, // 'x'
    hexUpper: { inheritsFrom: ['hexLower'], convertToUppercase: true }, // 'X'
    decimalInt: { numericalBase: 10, isIntegral: true }, // 'd'
    integer: { inheritsFrom: ['decimalInt'] }, // 'i'
    unsignedInt: { inheritsFrom: ['decimalInt'], isUnsigned: true }, // 'u'

    // Character type definition
    character: { // 'c'
      argumentProcessor: (token) => { // Renamed 'setArg' to 'argumentProcessor'
        const numericCode = parseInt(token.argumentValue, 10);
        if (Number.isInteger(numericCode)) {
          if (numericCode < 0 || numericCode > 127) {
            throw new Error(`Character code ${numericCode} is outside the valid ASCII range (0-127) for %c.`);
          }
          token.argumentValue = String.fromCharCode(numericCode);
        } else {
          // If the argument is not a number, treat it as a string and take its first char
          token.argumentValue = String(token.argumentValue).charAt(0);
        }
      }
    },

    // String type definition
    string: { // 's'
      widthSetter: (token) => { // Renamed 'setMaxWidth' to 'widthSetter'
        // If a period is present, precision determines max width; otherwise, no max width.
        token.maximumWidth = (token.periodChar === '.') ? token.precisionValue : -1;
      }
    },

    // Floating-point type definitions
    expLower: { isFloatingPoint: true, floatNotation: 'e' }, // 'e'
    expUpper: { inheritsFrom: ['expLower'], convertToUppercase: true }, // 'E'
    floatFixed: { isFloatingPoint: true, floatNotation: 'f' }, // 'f'
    floatFixedUpper: { inheritsFrom: ['floatFixed'] }, // 'F'
    genLower: { isFloatingPoint: true, floatNotation: 'g' }, // 'g'
    genUpper: { inheritsFrom: ['genLower'], convertToUppercase: true }, // 'G'

    // Object inspection type definition
    objectDump: { isObject: true }, // 'O'
  };

  /**
   * Orchestrates the formatting process, applying the template to the provided arguments.
   * @param {...any} inputArguments - The values to be formatted.
   * @returns {string} The final formatted string.
   */
  applyFormat(...inputArguments) { // Renamed 'format' to 'applyFormat', changed to rest parameters
    const outputBuffer = []; // Using an array for efficient string concatenation.
    let argumentCursor = 0; // Tracks the current position in the `inputArguments` array.

    // Validate the argument type if named placeholders are expected.
    if (this.hasNamedPlaceholders && (typeof inputArguments[0] !== 'object' || inputArguments[0] === null)) {
      throw new Error('A mapping object is required as the first argument when using named placeholders.');
    }

    // Process each token (string literal or format specifier) in the parsed template.
    for (let idx = 0; idx < this.parsedTokens.length; idx++) {
      const currentElement = this.parsedTokens[idx];

      // If it's a plain string, append it directly to the output.
      if (typeof currentElement === 'string') {
        outputBuffer.push(currentElement);
        continue;
      }

      // Handle the '%%' escape sequence for a literal percent sign.
      if (currentElement.typeSpecifier === '%') {
        outputBuffer.push('%');
        continue;
      }

      // Assign the correct argument value to the current format token.
      if (this.hasNamedPlaceholders) {
        const mappingObject = inputArguments[0];
        const key = currentElement.namedKey;
        // Robust check for property existence, including inherited ones.
        if (mappingObject === undefined || !Object.prototype.hasOwnProperty.call(mappingObject, key)) {
          throw new Error(`Missing argument for named key '${key}'.`);
        }
        currentElement.argumentValue = mappingObject[key];
      } else {
        // Handle positional arguments, adjusting the cursor if specified.
        if (currentElement.positionalIndex) {
          argumentCursor = parseInt(currentElement.positionalIndex, 10) - 1;
        }

        // Ensure there are enough arguments for the current specifier.
        if (argumentCursor >= inputArguments.length) {
          throw new Error(`Not enough arguments provided for format string '${this.sourceTemplate}'. ` +
            `Expected at least ${argumentCursor + 1}, but received ${inputArguments.length}.`);
        }
        currentElement.argumentValue = inputArguments[argumentCursor++]; // Assign and advance cursor.
      }

      // Perform one-time compilation of token properties if not already done.
      if (!currentElement.isCompiled) {
        currentElement.isCompiled = true;
        currentElement.signPrefix = '';
        currentElement.shouldZeroPad = false;
        currentElement.isRightJustified = false;
        currentElement.useAlternativeForm = false;

        const activeFlags = new Set(); // Use a Set for efficient flag checking.
        for (let fi = 0; fi < currentElement.formatFlags.length; fi++) {
          const flagChar = currentElement.formatFlags.charAt(fi);
          activeFlags.add(flagChar);

          switch (flagChar) {
            case ' ':
              currentElement.signPrefix = ' ';
              break;
            case '+':
              currentElement.signPrefix = '+';
              break;
            case '0':
              // '0' padding is ignored if '-' (left-justify) flag is present.
              currentElement.shouldZeroPad = !activeFlags.has('-');
              break;
            case '-':
              currentElement.isRightJustified = true;
              currentElement.shouldZeroPad = false; // Left-justify overrides zero-padding.
              break;
            case '#':
              currentElement.useAlternativeForm = true;
              break;
            default:
              throw new Error(`Unrecognized formatting flag '${flagChar}'.`);
          }
        }

        currentElement.minimumWidth = currentElement._minWidthSpecifier ? parseInt(currentElement._minWidthSpecifier, 10) : 0;
        currentElement.maximumWidth = -1; // Default to no max width.
        currentElement.convertToUppercase = false;
        currentElement.isUnsigned = false;
        currentElement.isIntegral = false;
        currentElement.isFloatingPoint = false;
        currentElement.isObject = false;
        currentElement.precisionValue = 1; // Default precision.
        if (currentElement.periodChar === '.') {
          currentElement.precisionValue = currentElement._precisionSpecifier ? parseInt(currentElement._precisionSpecifier, 10) : 0;
        }

        // Retrieve and apply type-specific definitions.
        let typeDefinition = this._typeDefinitions[currentElement.typeSpecifier];
        if (!typeDefinition) {
          throw new Error(`Unknown format specifier type '${currentElement.typeSpecifier}'.`);
        }

        // Handle inheritance between specifier types (e.g., 'X' inherits from 'x').
        if (typeDefinition.inheritsFrom) {
          const baseSpecifierKey = typeDefinition.inheritsFrom[0];
          const baseDefinition = this._typeDefinitions[baseSpecifierKey];
          if (!baseDefinition) {
            throw new Error(`Base specifier '${baseSpecifierKey}' not found for '${currentElement.typeSpecifier}'.`);
          }
          // Merge base properties, with current type's properties taking precedence.
          typeDefinition = { ...baseDefinition, ...typeDefinition };
          delete typeDefinition.inheritsFrom; // Clean up the inheritance key.
        }

        // Apply all relevant properties from the type definition to the current token.
        Object.assign(currentElement, typeDefinition);
      }

      // Execute custom argument pre-processing if defined for the specifier.
      if (typeof currentElement.argumentProcessor === 'function') {
        currentElement.argumentProcessor(currentElement);
      }

      // Execute custom maximum width setting if defined.
      if (typeof currentElement.widthSetter === 'function') {
        currentElement.widthSetter(currentElement);
      }

      // Handle dynamic minimum width specified by '*'.
      if (currentElement._minWidthSpecifier === '*') {
        if (this.hasNamedPlaceholders) {
          throw new Error('Dynamic width (*) is not supported in named placeholder formats.');
        }
        const widthArg = inputArguments[argumentCursor++];
        if (typeof widthArg !== 'number' || !Number.isInteger(widthArg)) {
          throw new TypeError(`The argument for dynamic width at position ${argumentCursor} must be an integer.`);
        }
        currentElement.minimumWidth = Math.abs(widthArg);
        // A negative width implies left justification.
        if (widthArg < 0) {
          currentElement.isRightJustified = false; // Left-justified implies not right-justified.
        }
      }

      // Handle dynamic precision specified by '*' and a period.
      if (currentElement._precisionSpecifier === '*' && currentElement.periodChar === '.') {
        if (this.hasNamedPlaceholders) {
          throw new Error('Dynamic precision (*) is not supported in named placeholder formats.');
        }
        const precisionArg = inputArguments[argumentCursor++];
        if (typeof precisionArg !== 'number' || !Number.isInteger(precisionArg)) {
          throw new TypeError(`The argument for dynamic precision at position ${argumentCursor} must be an integer.`);
        }
        currentElement.precisionValue = precisionArg;
        // Negative precision means it's effectively unspecified (like no period at all).
        if (currentElement.precisionValue < 0) {
          currentElement.precisionValue = 1; // C-like default for unspecified precision.
          currentElement.periodChar = ''; // Clear period to indicate no precision.
        }
      }

      // Dispatch to specific format handling methods based on the token's type.
      if (currentElement.isIntegral) {
        // For integers, a specified precision disables zero padding.
        if (currentElement.periodChar === '.') {
          currentElement.shouldZeroPad = false;
        }
        this.processIntegerFormat(currentElement);
      } else if (currentElement.isFloatingPoint) {
        // If no precision is specified for floats, default to 6.
        if (currentElement.periodChar !== '.') {
          currentElement.precisionValue = 6;
        }
        this.processFloatFormat(currentElement);
      } else if (currentElement.isObject) {
        this.processObjectDump(currentElement);
      }

      // Final adjustment of the field width, including padding or truncation.
      this.adjustFieldWidth(currentElement);

      // Append the formatted argument to the output buffer.
      outputBuffer.push(String(currentElement.argumentValue));
    }

    return outputBuffer.join(''); // Concatenate all segments to form the final string.
  }

  _zeroSequence = '0000000000'; // A pre-defined string of zeros for padding.
  _spaceSequence = '          '; // A pre-defined string of spaces for padding.

  /**
   * Formats an integer value according to the token's specifications (base, sign, padding).
   * @private
   * @param {object} token - The format token containing argument and specifiers.
   */
  processIntegerFormat(token) { // Renamed 'formatInt' to 'processIntegerFormat'
    let numericValue = parseInt(token.argumentValue, 10);

    // Validate if the argument is a finite number.
    if (!Number.isFinite(numericValue)) {
      if (typeof token.argumentValue !== 'number') {
        throw new TypeError(`Argument '${token.argumentValue}' is not a valid integer for %${token.typeSpecifier}.`);
      }
      numericValue = 0; // Default to 0 if numeric but non-finite.
    }

    // Handle unsigned conversion for negative numbers or non-decimal bases.
    if (numericValue < 0 && (token.isUnsigned || token.numericalBase !== 10)) {
      // Simplified 32-bit unsigned conversion for negative numbers.
      numericValue = 0xFFFFFFFF + numericValue + 1;
    }

    let formattedString;
    if (numericValue < 0) {
      formattedString = (-numericValue).toString(token.numericalBase);
      this.applyZeroPadding(token, token.precisionValue); // Apply precision padding.
      formattedString = `-${formattedString}`;
    } else {
      // Special case: `0` with `precisionValue === 0` should yield an empty string.
      if (numericValue === 0 && token.periodChar === '.' && token.precisionValue === 0) {
        formattedString = '';
      } else {
        formattedString = numericValue.toString(token.numericalBase);
        this.applyZeroPadding(token, token.precisionValue); // Apply precision padding.
      }

      // Prepend sign if specified and the string is not empty.
      if (token.signPrefix && formattedString !== '') {
        formattedString = token.signPrefix + formattedString;
      }
    }
    token.argumentValue = formattedString;

    // Apply alternative form (e.g., '0x' for hex) and case conversion.
    if (token.numericalBase === 16) {
      if (token.useAlternativeForm && token.argumentValue !== '') {
        token.argumentValue = `0x${token.argumentValue}`;
      }
      token.argumentValue = token.convertToUppercase ? token.argumentValue.toUpperCase() : token.argumentValue.toLowerCase();
    } else if (token.numericalBase === 8) {
      if (token.useAlternativeForm && token.argumentValue.charAt(0) !== '0' && token.argumentValue !== '') {
        token.argumentValue = `0${token.argumentValue}`;
      }
    }
  }

  /**
   * Formats a floating-point value based on the token's notation (e, f, g) and precision.
   * @private
   * @param {object} token - The format token.
   */
  processFloatFormat(token) { // Renamed 'formatDouble' to 'processFloatFormat'
    let floatValue = parseFloat(token.argumentValue);

    // Validate if the argument is a finite number.
    if (!Number.isFinite(floatValue)) {
      if (typeof token.argumentValue !== 'number') {
        throw new TypeError(`Argument '${token.argumentValue}' is not a valid float for %${token.typeSpecifier}.`);
      }
      floatValue = 0; // Default to 0 if numeric but non-finite.
    }

    switch (token.floatNotation) {
      case 'e':
        token.argumentValue = floatValue.toExponential(token.precisionValue);
        break;
      case 'f':
        token.argumentValue = floatValue.toFixed(token.precisionValue);
        break;
      case 'g':
        // C-style 'g' format logic: decides between fixed and exponential notation.
        // If absolute value is very small or very large, use exponential.
        if (Math.abs(floatValue) < 1e-4 || Math.abs(floatValue) >= Math.pow(10, token.precisionValue)) {
          // Precision for toExponential in 'g' format is usually precisionValue - 1.
          token.argumentValue = floatValue.toExponential(token.precisionValue > 0 ? token.precisionValue - 1 : 0);
        } else {
          token.argumentValue = floatValue.toPrecision(token.precisionValue);
        }

        // Remove trailing zeros from fractional part unless alternative form '#' is used.
        if (!token.useAlternativeForm) {
          token.argumentValue = token.argumentValue.replace(/(\..*[^0])0*e/, '$1e'); // Zeros before 'e'.
          token.argumentValue = token.argumentValue.replace(/\.0*e/, 'e').replace(/\.0$/, ''); // '.0' or '.00' without 'e'.
        }
        break;
      default:
        throw new Error(`Unsupported floating-point notation type '${token.floatNotation}'.`);
    }

    // Ensure the exponent part has at least two digits (e.g., 'e+01' instead of 'e+1').
    token.argumentValue = token.argumentValue.replace(/e([+\-])(\d)$/, 'e$10$2');

    // If alternative form is active and it's not 'g' (which handles its own alt form), ensure a decimal point.
    if (token.useAlternativeForm && token.floatNotation !== 'g' && !token.argumentValue.includes('.')) {
      if (token.argumentValue.includes('e')) {
        token.argumentValue = token.argumentValue.replace(/e/, '.e');
      } else {
        token.argumentValue += '.';
      }
    }

    // Prepend sign for non-negative values if the sign flag is set.
    if (floatValue >= 0 && token.signPrefix) {
      token.argumentValue = token.signPrefix + token.argumentValue;
    }

    // Apply case conversion for scientific notation (E/e, G/g).
    if (token.convertToUppercase) {
      token.argumentValue = token.argumentValue.toUpperCase();
    } else {
      token.argumentValue = token.argumentValue.toLowerCase();
    }
  }

  /**
   * Formats an object argument using Node's `util.inspect` for detailed output.
   * @private
   * @param {object} token - The format token.
   */
  processObjectDump(token) { // Renamed 'formatObject' to 'processObjectDump'
    // Precision determines the depth of inspection; null means infinite depth.
    const dumpDepth = (token.periodChar === '.') ? token.precisionValue : null;
    // The alternative flag ('#') maps to `showHidden` in `util.inspect`.
    token.argumentValue = nodeUtilities.inspect(token.argumentValue, token.useAlternativeForm, dumpDepth);
  }

  /**
   * Applies leading zero padding to the argument value to reach a specified length.
   * @private
   * @param {object} token - The format token.
   * @param {number} [targetLength] - The desired final length of the string. Defaults to `token.precisionValue`.
   */
  applyZeroPadding(token, targetLength) { // Renamed 'zeroPad' to 'applyZeroPadding'
    targetLength = targetLength !== undefined ? targetLength : token.precisionValue;
    let currentArgString = String(token.argumentValue);

    let isNegative = false;
    if (currentArgString.startsWith('-')) {
      isNegative = true;
      currentArgString = currentArgString.substring(1); // Temporarily remove negative sign.
    }

    // Use `padStart` for concise zero padding.
    if (currentArgString.length < targetLength) {
      currentArgString = currentArgString.padStart(targetLength, '0');
    }

    token.argumentValue = isNegative ? `-${currentArgString}` : currentArgString; // Re-add sign.
  }

  /**
   * Adjusts the argument value to fit the specified field width, applying truncation or padding.
   * @private
   * @param {object} token - The format token.
   */
  adjustFieldWidth(token) { // Renamed 'fitField' to 'adjustFieldWidth'
    let currentArgString = String(token.argumentValue);

    // Truncate if the argument exceeds the maximum width.
    if (token.maximumWidth >= 0 && currentArgString.length > token.maximumWidth) {
      token.argumentValue = currentArgString.substring(0, token.maximumWidth);
      return; // No further padding needed.
    }

    // Apply padding based on whether zero-padding or space-padding is required.
    if (token.shouldZeroPad) {
      this.applyZeroPadding(token, token.minimumWidth);
    } else {
      this.applySpacePadding(token, token.minimumWidth);
    }
  }

  /**
   * Pads the argument value with spaces to achieve a specified minimum length, respecting justification.
   * @private
   * @param {object} token - The format token.
   * @param {number} [targetLength] - The desired final length of the string. Defaults to `token.minimumWidth`.
   */
  applySpacePadding(token, targetLength) { // Renamed 'spacePad' to 'applySpacePadding'
    targetLength = targetLength !== undefined ? targetLength : token.minimumWidth;
    let currentArgString = String(token.argumentValue);

    // Only pad if the current string length is less than the target length.
    if (currentArgString.length < targetLength) {
      if (token.isRightJustified) {
        token.argumentValue = currentArgString.padEnd(targetLength, ' '); // Pad with spaces at the end.
      } else {
        token.argumentValue = currentArgString.padStart(targetLength, ' '); // Pad with spaces at the beginning.
      }
    }
  }
}

// Extract the Stream constructor for type checking.
const Stream = require('stream').Stream;

/**
 * A printf-style function for Node.js, providing flexible string formatting.
 * It can either return the formatted string or write it to a specified stream.
 * @param {Stream|string} initialArgument - Can be a writable stream or the format template string.
 * @param {...any} subsequentArguments - The format template (if a stream was initialArgument) or the arguments for formatting.
 * @returns {string|undefined} The formatted string if no stream is provided, otherwise nothing (writes to stream).
 */
module.exports = function(...invocationArgs) { // Renamed 'arguments' to 'invocationArgs', using rest parameters.
  let outputStream = null; // Renamed 'stream' to 'outputStream'.
  let formatPattern = null; // Renamed 'format' to 'formatPattern'.
  const actualArguments = [...invocationArgs]; // Convert `arguments` object to a real array.

  // Check if the first argument is a Node.js writable stream.
  if (actualArguments[0] instanceof Stream) {
    outputStream = actualArguments.shift(); // Remove the stream from the arguments array.
  }

  // The next argument in the sequence must be the format string.
  formatPattern = actualArguments.shift();

  if (typeof formatPattern !== 'string') {
    throw new TypeError('The format pattern must be a string value.');
  }

  // Instantiate the formatting engine and apply the formatting.
  const formatterInstance = new FormatEngine(formatPattern); // Renamed 'formatter'.
  const formattedOutput = formatterInstance.applyFormat(...actualArguments); // Call the renamed method.

  // Either write the result to the stream or return the string.
  if (outputStream) {
    outputStream.write(formattedOutput);
    // No return value when writing to a stream, consistent with Node.js stream behavior.
  } else {
    return formattedOutput;
  }
};

// Export the FormatEngine class itself, allowing direct instantiation.
module.exports.FormatEngine = FormatEngine; // Renamed 'Formatter' to 'FormatEngine'.