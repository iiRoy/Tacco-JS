const utility = require('util');

// Helper function for parsing the format string into a structured list of components.
// This replaces the original 'tokenize' function and its regex-based approach.
function parsePattern(inputString) {
    const components = [];
    let currentOffset = 0;

    while (currentOffset < inputString.length) {
        const percentMarker = inputString.indexOf('%', currentOffset);

        if (percentMarker === -1) {
            // No more format specifiers, add remaining string as a literal.
            if (currentOffset < inputString.length) {
                components.push({ type: 'literal', content: inputString.substring(currentOffset) });
            }
            break;
        }

        // Add any literal text before the '%' marker.
        if (percentMarker > currentOffset) {
            components.push({ type: 'literal', content: inputString.substring(currentOffset, percentMarker) });
        }

        // Move past the '%' character.
        currentOffset = percentMarker + 1;

        // Handle '%%' escape sequence.
        if (currentOffset >= inputString.length) {
            throw new Error("Incomplete format specifier at end of string.");
        }
        if (inputString[currentOffset] === '%') {
            components.push({ type: 'literal', content: '%' });
            currentOffset++;
            continue;
        }

        // Parse the format instruction details.
        const instructionSpecs = {};
        let scanCursor = currentOffset;
        let currentChar = inputString[scanCursor];

        // 1. Mapping reference (e.g., %(key) or N$)
        if (currentChar === '(') {
            const closingParen = inputString.indexOf(')', scanCursor);
            if (closingParen === -1) throw new Error("Unclosed mapping group in format string.");
            instructionSpecs.keyReference = inputString.substring(scanCursor + 1, closingParen);
            scanCursor = closingParen + 1;
            currentChar = inputString[scanCursor];
        } else if (currentChar && currentChar >= '1' && currentChar <= '9') {
            let numSequence = '';
            while (currentChar && currentChar >= '0' && currentChar <= '9') {
                numSequence += currentChar;
                scanCursor++;
                currentChar = inputString[scanCursor];
            }
            if (currentChar === '$') {
                instructionSpecs.positionalReference = parseInt(numSequence);
                scanCursor++;
                currentChar = inputString[scanCursor];
            }
        }

        // 2. Flags (e.g., 0, ' ', +, -, #)
        let flagAccumulator = '';
        while (currentChar && ('0 +-'.includes(currentChar) || currentChar === '#')) {
            flagAccumulator += currentChar;
            scanCursor++;
            currentChar = inputString[scanCursor];
        }
        instructionSpecs.styleFlags = flagAccumulator;

        // 3. Minimum Width (e.g., 5 or *)
        if (currentChar === '*' || (currentChar && currentChar >= '0' && currentChar <= '9')) {
            if (currentChar === '*') {
                instructionSpecs.minimumFieldWidth = '*';
                scanCursor++;
                currentChar = inputString[scanCursor];
            } else {
                let widthSequence = '';
                while (currentChar && currentChar >= '0' && currentChar <= '9') {
                    widthSequence += currentChar;
                    scanCursor++;
                    currentChar = inputString[scanCursor];
                }
                instructionSpecs.minimumFieldWidth = parseInt(widthSequence);
            }
        }

        // 4. Precision (e.g., .2 or .*)
        if (currentChar === '.') {
            instructionSpecs.dotPresent = true;
            scanCursor++;
            currentChar = inputString[scanCursor];
            if (currentChar === '*' || (currentChar && currentChar >= '0' && currentChar <= '9')) {
                if (currentChar === '*') {
                    instructionSpecs.decimalPointPrecision = '*';
                    scanCursor++;
                } else {
                    let precisionSequence = '';
                    while (currentChar && currentChar >= '0' && currentChar <= '9') {
                        precisionSequence += currentChar;
                        scanCursor++;
                        currentChar = inputString[scanCursor];
                    }
                    instructionSpecs.decimalPointPrecision = parseInt(precisionSequence);
                }
            } else {
                instructionSpecs.decimalPointPrecision = 0; // Default for '.' without digits
            }
            currentChar = inputString[scanCursor]; // Update currentChar after precision parsing
        }

        // 5. Length modifier (h, l, L) - original ignores these, so we will too.
        if (currentChar && 'hlL'.includes(currentChar)) {
            scanCursor++;
            currentChar = inputString[scanCursor];
        }

        // 6. Specifier character (e.g., s, d, f)
        if (currentChar && 'bscdeEfFgGioOuxX'.includes(currentChar)) {
            instructionSpecs.typeCharacter = currentChar;
            scanCursor++;
        } else {
            throw new Error(`Unexpected format specifier character '${currentChar}' at position ${scanCursor-1}`);
        }
        components.push({ type: 'instruction', details: instructionSpecs });
        currentOffset = scanCursor;
    }
    return components;
}

// Defines the properties and processing logic for each format type.
// This replaces the original '_specifiers' object and its 'extend' mechanism.
const typeDefinitions = {
    'b': { category: 'integral', radix: 2 },
    'o': { category: 'integral', radix: 8 },
    'x': { category: 'integral', radix: 16, casing: 'lower' },
    'X': { category: 'integral', radix: 16, casing: 'upper' },
    'd': { category: 'integral', radix: 10 },
    'i': { category: 'integral', radix: 10 },
    'u': { category: 'integral', radix: 10, isUnsigned: true },
    'c': {
        category: 'character',
        valueTransformer: (val) => {
            const num = parseInt(val);
            if (isNaN(num)) return String(val); // Original allows non-numeric values to be stringified
            if (num < 0 || num > 127) throw new Error('invalid character code passed to %c in printf');
            return String.fromCharCode(num);
        }
    },
    's': {
        category: 'string',
        postFormatter: (val, config) => {
            // Precision for 's' acts as max width.
            if (config.dotPresent && config.decimalPointPrecision !== undefined && config.decimalPointPrecision !== null) {
                return String(val).substring(0, config.decimalPointPrecision);
            }
            return String(val);
        }
    },
    'e': { category: 'floating', style: 'scientific', casing: 'lower' },
    'E': { category: 'floating', style: 'scientific', casing: 'upper' },
    'f': { category: 'floating', style: 'fixed', casing: 'lower' },
    'F': { category: 'floating', style: 'fixed', casing: 'upper' },
    'g': { category: 'floating', style: 'general', casing: 'lower' },
    'G': { category: 'floating', style: 'general', casing: 'upper' },
    'O': { category: 'object_inspect' }
};

// Generic function for padding a string.
// This replaces 'zeroPad' and 'spacePad'.
function fillString(contentValue, minSize, fillChar, justifyRight) {
    let currentContent = String(contentValue);
    if (currentContent.length >= minSize) {
        return currentContent;
    }

    const requiredPadding = minSize - currentContent.length;
    let paddingContent = fillChar.repeat(requiredPadding);

    if (justifyRight) {
        // Special handling for zero-padding signed numbers: sign should be before zeros.
        if (fillChar === '0' && (currentContent.startsWith('-') || currentContent.startsWith('+') || currentContent.startsWith(' '))) {
            return currentContent[0] + paddingContent + currentContent.substring(1);
        }
        return paddingContent + currentContent;
    } else {
        return currentContent + paddingContent;
    }
}

// Represents a pre-parsed format string, ready to be applied to data.
// This replaces the 'Formatter' class.
function PatternBuilder(format) {
    this.parsedComponents = parsePattern(format);
    this.needsKeyedInput = this.parsedComponents.some(pc => pc.type === 'instruction' && pc.details.keyReference);
    this.sourceFormat = format; // Stored for error messages
}

PatternBuilder.prototype.produce = function(/*mixed... data*/) {
    if (this.needsKeyedInput && typeof arguments[0] !== 'object') {
        throw new Error('format requires a mapping');
    }

    let inputData = Array.from(arguments);
    let isInputKeyed = typeof arguments[0] === 'object' && !Array.isArray(arguments[0]) && arguments.length === 1;

    let dataPointer = 0; // For positional arguments

    const finalSegments = this.parsedComponents.map(segment => {
        if (segment.type === 'literal') {
            return segment.content;
        }

        const instruction = segment.details;
        let valueForFormatting;

        // Determine the argument based on mapping or position.
        if (isInputKeyed) {
            if (!instruction.keyReference) throw new Error('Mapped format requires key reference, but none found.');
            if (!(instruction.keyReference in inputData[0])) throw new Error('missing key ' + instruction.keyReference);
            valueForFormatting = inputData[0][instruction.keyReference];
        } else {
            if (instruction.positionalReference) {
                dataPointer = instruction.positionalReference - 1;
            }
            if (dataPointer >= inputData.length) {
                throw new Error('got ' + inputData.length + ' printf arguments, insufficient for \'' + this.sourceFormat + '\'');
            }
            valueForFormatting = inputData[dataPointer++];
        }

        // Resolve '*' for minWidth and precision, consuming arguments if necessary.
        let resolvedMinWidth = instruction.minimumFieldWidth;
        if (resolvedMinWidth === '*') {
            if (isInputKeyed) throw new Error('* width not supported in mapped formats');
            resolvedMinWidth = parseInt(inputData[dataPointer++]);
            if (isNaN(resolvedMinWidth)) throw new Error('the argument for * width at position ' + dataPointer + ' is not a number in ' + this.sourceFormat);
            if (resolvedMinWidth < 0) {
                instruction.negativeWidth = true; // Store this state for flags
                resolvedMinWidth = -resolvedMinWidth;
            }
        }

        let resolvedPrecision = instruction.decimalPointPrecision;
        if (instruction.dotPresent && resolvedPrecision === '*') {
            if (isInputKeyed) throw new Error('* precision not supported in mapped formats');
            resolvedPrecision = parseInt(inputData[dataPointer++]);
            if (isNaN(resolvedPrecision)) throw new Error('the argument for * precision at position ' + dataPointer + ' is not a number in ' + this.sourceFormat);
            if (resolvedPrecision < 0) {
                instruction.dotPresent = false; // Negative precision means unspecified
                resolvedPrecision = undefined;
            }
        }

        // Compile effective flags from the styleFlags string.
        const effectiveFormatFlags = {
            signPrefix: '',
            padZeros: false,
            justifyRight: true, // Default for numbers
            alternateForm: false,
            ...instruction.styleFlags.split('').reduce((acc, flag) => {
                switch (flag) {
                    case ' ': acc.signPrefix = ' '; break;
                    case '+': acc.signPrefix = '+'; break;
                    case '0': acc.padZeros = true; break;
                    case '-': acc.justifyRight = false; acc.padZeros = false; break; // '-' overrides '0'
                    case '#': acc.alternateForm = true; break;
                    default: throw Error('bad formatting flag \'' + flag + '\'');
                }
                return acc;
            }, {})
        };
        // Re-apply negative width justification if it was set.
        if (instruction.negativeWidth) {
            effectiveFormatFlags.justifyRight = false; // Negative width implies left-justification
            effectiveFormatFlags.padZeros = false; // Negative width also implies no zero padding
        }
        // If precision is specified for integers, zero padding is disabled.
        if (instruction.dotPresent && instruction.typeCharacter.match(/[diouxXb]/)) {
            effectiveFormatFlags.padZeros = false;
        }


        // Get type-specific rules.
        const currentTypeRules = { ...typeDefinitions[instruction.typeCharacter] };
        if (!currentTypeRules) throw new Error('unexpected specifier \'' + instruction.typeCharacter + '\'');

        let processedResult = valueForFormatting;

        // Apply custom value transformation if defined (e.g., for 'c').
        if (currentTypeRules.valueTransformer) {
            processedResult = currentTypeRules.valueTransformer(processedResult, { ...instruction, ...effectiveFormatFlags, minWidth: resolvedMinWidth, precision: resolvedPrecision });
        } else if (currentTypeRules.category === 'integral') {
            let numValue = parseInt(processedResult);
            if (!isFinite(numValue)) { // Use global isFinite for original behavior
                if (typeof processedResult !== 'number') throw new Error('format argument \'' + processedResult + '\' not an integer; parseInt returned ' + numValue);
                numValue = 0;
            }

            if (numValue < 0 && (currentTypeRules.isUnsigned || currentTypeRules.radix !== 10)) {
                numValue = 0xFFFFFFFF + numValue + 1; // Unsigned conversion
            }

            let stringRepresentation = '';
            if (numValue === 0 && instruction.dotPresent && resolvedPrecision === 0) {
                stringRepresentation = ''; // Special case: 0 with precision 0
            } else {
                stringRepresentation = Math.abs(numValue).toString(currentTypeRules.radix);
            }

            // Apply precision for integers (zero padding before sign and alternative prefix).
            if (instruction.dotPresent && resolvedPrecision !== undefined && resolvedPrecision !== null) {
                stringRepresentation = fillString(stringRepresentation, resolvedPrecision, '0', true); // Always left pad with zeros for precision
            }

            if (numValue < 0) {
                stringRepresentation = '-' + stringRepresentation;
            } else if (numValue >= 0 && effectiveFormatFlags.signPrefix) {
                stringRepresentation = effectiveFormatFlags.signPrefix + stringRepresentation;
            }

            if (currentTypeRules.radix === 16 && effectiveFormatFlags.alternateForm) {
                stringRepresentation = '0x' + stringRepresentation;
            }
            if (currentTypeRules.radix === 8 && effectiveFormatFlags.alternateForm && stringRepresentation[0] !== '0') {
                stringRepresentation = '0' + stringRepresentation;
            }

            if (currentTypeRules.casing === 'upper') stringRepresentation = stringRepresentation.toUpperCase();
            processedResult = stringRepresentation;

        } else if (currentTypeRules.category === 'floating') {
            let floatValue = parseFloat(processedResult);
            if (!isFinite(floatValue)) { // Use global isFinite for original behavior
                if (typeof processedResult !== 'number') throw new Error('format argument \'' + processedResult + '\' not a float; parseFloat returned ' + floatValue);
                floatValue = 0;
            }

            let floatString;
            const actualPrecision = (instruction.dotPresent && resolvedPrecision !== undefined && resolvedPrecision !== null) ? resolvedPrecision : 6;

            switch (currentTypeRules.style) {
                case 'scientific':
                    floatString = floatValue.toExponential(actualPrecision);
                    break;
                case 'fixed':
                    floatString = floatValue.toFixed(actualPrecision);
                    break;
                case 'general':
                    // C's rule for 'gG': use 'e' notation if exponent < -4 or >= precision
                    if (Math.abs(floatValue) < 0.0001) {
                        floatString = floatValue.toExponential(actualPrecision > 0 ? actualPrecision - 1 : actualPrecision);
                    } else {
                        floatString = floatValue.toPrecision(actualPrecision);
                    }
                    // In C, unlike 'f', 'gG' removes trailing 0s from fractional part, unless alternative format flag ('#').
                    if (!effectiveFormatFlags.alternateForm) {
                        floatString = floatString.replace(/(\..*[^0])0*e/, '$1e');
                        floatString = floatString.replace(/\.0*e/, 'e').replace(/\.0$/, '');
                    }
                    break;
            }

            // Ensure exponent has at least two digits (e.g., e+01 instead of e+1).
            floatString = floatString.replace(/e\+(\d)$/, 'e+0$1').replace(/e\-(\d)$/, 'e-0$1');

            // If alternative form, ensure a decimal point.
            if (effectiveFormatFlags.alternateForm) {
                floatString = floatString.replace(/^(\d+)$/, '$1.');
                floatString = floatString.replace(/^(\d+)e/, '$1.e');
            }

            if (floatValue >= 0 && effectiveFormatFlags.signPrefix) {
                floatString = effectiveFormatFlags.signPrefix + floatString;
            }
            if (currentTypeRules.casing === 'upper') floatString = floatString.toUpperCase();
            processedResult = floatString;

        } else if (currentTypeRules.category === 'object_inspect') {
            const inspectDepth = instruction.dotPresent ? resolvedPrecision : null;
            processedResult = utility.inspect(processedResult, !effectiveFormatFlags.alternateForm, inspectDepth);
        } else if (currentTypeRules.category === 'string') {
            // String truncation based on precision (handled by postFormatter).
        }

        // Apply post-formatter if defined (e.g., for 's' to handle max width).
        if (currentTypeRules.postFormatter) {
            processedResult = currentTypeRules.postFormatter(processedResult, { ...instruction, ...effectiveFormatFlags, minWidth: resolvedMinWidth, precision: resolvedPrecision });
        }

        let finalRenderedString = String(processedResult);

        // Apply minimum field width and padding.
        if (resolvedMinWidth > 0 && finalRenderedString.length < resolvedMinWidth) {
            const padCharacter = effectiveFormatFlags.padZeros ? '0' : ' ';
            finalRenderedString = fillString(finalRenderedString, resolvedMinWidth, padCharacter, effectiveFormatFlags.justifyRight);
        }

        return finalRenderedString;
    }).join('');

    return finalSegments;
};

// Main entry point for the formatting utility.
// This replaces the top-level 'module.exports' function.
function executeFormat() {
    const suppliedArguments = Array.from(arguments);
    let targetStream;
    // Check if the first argument is a stream.
    if (suppliedArguments[0] instanceof require('stream').Stream) {
        targetStream = suppliedArguments.shift();
    }
    const formatInstruction = suppliedArguments.shift();

    if (typeof formatInstruction !== 'string') {
        throw new Error('The primary format string is missing or invalid.');
    }

    const formatProcessor = new PatternBuilder(formatInstruction);
    const outputContent = formatProcessor.produce.apply(formatProcessor, suppliedArguments); // Pass remaining args to produce

    if (targetStream) {
        targetStream.write(outputContent);
    } else {
        return outputContent;
    }
}

// Export the main function and the PatternBuilder for direct instantiation.
module.exports = executeFormat;
module.exports.PatternBuilder = PatternBuilder;