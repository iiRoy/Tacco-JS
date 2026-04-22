var labelProcessor = (function() {
    // Private constants for the Punycode algorithm (renamed from original)
    const initialCharacterValue = 0x80;
    const initialAdjustmentFactor = 72;
    const labelSegmentDelimiter = "-";
    const encodingRadix = 36;
    const dampingConstant = 700;
    const minThreshold = 1;
    const maxThreshold = 26;
    const skewConstant = 38;
    const largestSafeInteger = 0x7FFFFFFF;

    // Utility for handling Unicode scalar values and UTF-16 strings (renamed from utf16)
    const characterMapping = {
        // Converts a UTF-16 JavaScript string to an array of Unicode scalar values
        toUnicodeScalars: function(sourceText) {
            const scalarValues = [];
            let currentPointer = 0;
            const textLength = sourceText.length;

            while (currentPointer < textLength) {
                let currentCode = sourceText.charCodeAt(currentPointer++);
                // Check for high surrogate (0xD800 to 0xDBFF)
                if (currentCode >= 0xD800 && currentCode <= 0xDBFF) {
                    if (currentPointer >= textLength) {
                        throw new RangeError("Invalid Unicode sequence: incomplete surrogate pair at end of string.");
                    }
                    const nextCode = sourceText.charCodeAt(currentPointer++);
                    // Check for low surrogate (0xDC00 to 0xDFFF)
                    if (!(nextCode >= 0xDC00 && nextCode <= 0xDFFF)) {
                        throw new RangeError("Invalid Unicode sequence: malformed surrogate pair.");
                    }
                    // Combine surrogates to get the actual code point
                    currentCode = ((currentCode & 0x3FF) << 10) + (nextCode & 0x3FF) + 0x10000;
                } else if (currentCode >= 0xDC00 && currentCode <= 0xDFFF) {
                    // Isolated low surrogate is invalid
                    throw new RangeError("Invalid Unicode sequence: isolated low surrogate.");
                }
                scalarValues.push(currentCode);
            }
            return scalarValues;
        },

        // Converts an array of Unicode scalar values back to a UTF-16 JavaScript string
        fromUnicodeScalars: function(scalarArray) {
            const charFragments = [];
            for (let i = 0; i < scalarArray.length; i++) { // Using for loop
                let scalarValue = scalarArray[i];
                // Check if scalar is in surrogate range but not a valid combined value
                if (scalarValue >= 0xD800 && scalarValue <= 0xDFFF) {
                    throw new RangeError("Invalid Unicode scalar value for UTF-16 conversion: " + scalarValue);
                }
                if (scalarValue > 0xFFFF) { // Requires surrogate pair
                    scalarValue -= 0x10000;
                    charFragments.push(String.fromCharCode(0xD800 | (scalarValue >>> 10))); // High surrogate
                    charFragments.push(String.fromCharCode(0xDC00 | (scalarValue & 0x3FF))); // Low surrogate
                } else {
                    charFragments.push(String.fromCharCode(scalarValue));
                }
            }
            return charFragments.join("");
        }
    };

    // Helper functions for the Punycode algorithm (renamed and refactored)

    // Converts a character's code point to its numerical value in the encoding radix
    function retrieveValueFromChar(codePoint) {
        if (codePoint >= 48 && codePoint <= 57) { // '0' through '9'
            return codePoint - 22; // Maps to 26-35
        } else if (codePoint >= 65 && codePoint <= 90) { // 'A' through 'Z'
            return codePoint - 65; // Maps to 0-25
        } else if (codePoint >= 97 && codePoint <= 122) { // 'a' through 'z'
            return codePoint - 97; // Maps to 0-25
        }
        return encodingRadix; // Value indicating out-of-range
    }

    // Converts a numerical value (0-35) to its corresponding character code point
    function generateCharFromValue(numericalValue, shouldBeUpper) {
        if (numericalValue < 26) { // 0-25 corresponds to letters 'a'-'z' or 'A'-'Z'
            return numericalValue + (shouldBeUpper ? 65 : 97); // ASCII 'A' or 'a' base
        } else { // 26-35 corresponds to digits '0'-'9'
            return numericalValue + 22; // ASCII '0' base (26+22=48 for '0')
        }
    }

    // Calculates the adjusted bias value
    function calculateAdjustedBias(currentDelta, numResultPoints, isInitialRun) {
        let workingDelta = isInitialRun ? Math.floor(currentDelta / dampingConstant) : (currentDelta >> 1);
        workingDelta += Math.floor(workingDelta / numResultPoints);

        let loopAccumulator = 0;
        // Loop to scale delta until it's within the threshold range
        for (; workingDelta > (((encodingRadix - minThreshold) * maxThreshold) >> 1); loopAccumulator += encodingRadix) {
            workingDelta = Math.floor(workingDelta / (encodingRadix - minThreshold));
        }
        return Math.floor(loopAccumulator + (encodingRadix - minThreshold + 1) * workingDelta / (workingDelta + skewConstant));
    }

    // Adjusts the case of a basic ASCII character based on a flag
    function adjustBasicCharacterCase(charCodepoint, forceUppercase) {
        if (charCodepoint >= 97 && charCodepoint <= 122) { // Is lowercase 'a'-'z'
            return forceUppercase ? (charCodepoint - 32) : charCodepoint;
        } else if (charCodepoint >= 65 && charCodepoint <= 90) { // Is uppercase 'A'-'Z'
            return forceUppercase ? charCodepoint : (charCodepoint + 32);
        }
        return charCodepoint; // Not an ASCII letter, case-insensitive
    }

    // Main decoding logic for a single Punycode label (renamed from this.decode)
    function processEncodedLabel(sourceString, retainCaseInformation) {
        const resultScalars = [];
        const caseIndicatorArray = [];
        const stringLength = sourceString.length;

        let currentN = initialCharacterValue;
        let currentI = 0;
        let currentBias = initialAdjustmentFactor;

        // Find the last delimiter to separate basic and encoded parts
        const separatorPosition = sourceString.lastIndexOf(labelSegmentDelimiter);
        const basicSegmentEnd = (separatorPosition < 0) ? 0 : separatorPosition;

        // Copy basic ASCII code points to the result
        for (let k = 0; k < basicSegmentEnd; ++k) {
            const charValue = sourceString.charCodeAt(k);
            if (retainCaseInformation) {
                caseIndicatorArray.push(charValue >= 65 && charValue <= 90); // Check if uppercase
            }
            if (charValue >= 0x80) {
                throw new RangeError("Encoded label contains non-ASCII characters in its basic part.");
            }
            resultScalars.push(charValue);
        }

        let readIndex = (basicSegmentEnd > 0) ? basicSegmentEnd + 1 : 0; // Start reading from after delimiter or beginning

        // Main decoding loop
        while (readIndex < stringLength) {
            let oldIValue = currentI;
            let currentWeight = 1;
            let currentK = encodingRadix;

            // Inner loop to decode a generalized variable-length integer (delta)
            while (true) {
                if (readIndex >= stringLength) {
                    throw new RangeError("Incomplete encoded sequence: unexpected end of string.");
                }
                const decodedDigit = retrieveValueFromChar(sourceString.charCodeAt(readIndex++));
                if (decodedDigit >= encodingRadix) {
                    throw new RangeError("Invalid character in encoded sequence: digit out of range.");
                }
                if (decodedDigit > Math.floor((largestSafeInteger - currentI) / currentWeight)) {
                    throw new RangeError("Decoding overflow (phase 1): calculation exceeds safe integer limit.");
                }
                currentI += decodedDigit * currentWeight;

                const thresholdValue = (currentK <= currentBias)
                    ? minThreshold
                    : (currentK >= currentBias + maxThreshold)
                        ? maxThreshold
                        : currentK - currentBias;

                if (decodedDigit < thresholdValue) {
                    break; // Exit inner loop
                }
                if (currentWeight > Math.floor(largestSafeInteger / (encodingRadix - thresholdValue))) {
                    throw new RangeError("Decoding overflow (phase 2): weight factor exceeds safe integer limit.");
                }
                currentWeight *= (encodingRadix - thresholdValue);
                currentK += encodingRadix;
            }

            const currentResultLength = resultScalars.length + 1;
            currentBias = calculateAdjustedBias(currentI - oldIValue, currentResultLength, oldIValue === 0);

            if (Math.floor(currentI / currentResultLength) > largestSafeInteger - currentN) {
                throw new RangeError("Decoding overflow (phase 3): n value exceeds safe integer limit.");
            }
            currentN += Math.floor(currentI / currentResultLength);
            currentI %= currentResultLength;

            // Insert the new code point into the result
            if (retainCaseInformation) {
                caseIndicatorArray.splice(currentI, 0, (sourceString.charCodeAt(readIndex - 1) >= 65 && sourceString.charCodeAt(readIndex - 1) <= 90));
            }
            resultScalars.splice(currentI, 0, currentN);
            currentI++;
        }

        // Apply case information if requested
        if (retainCaseInformation) {
            for (let scalarIdx = 0; scalarIdx < resultScalars.length; scalarIdx++) {
                if (caseIndicatorArray[scalarIdx]) {
                    // Convert scalar back to char, uppercase, then get its code.
                    // This handles only ASCII characters correctly for case.
                    resultScalars[scalarIdx] = (String.fromCharCode(resultScalars[scalarIdx]).toUpperCase()).charCodeAt(0);
                }
            }
        }
        return characterMapping.fromUnicodeScalars(resultScalars);
    }

    // Main encoding logic for a single Punycode label (renamed from this.encode)
    function generateEncodedLabel(sourceText, retainCaseInformation) {
        let unicodeScalars;
        let originalCaseState;

        if (retainCaseInformation) {
            originalCaseState = characterMapping.toUnicodeScalars(sourceText);
        }
        // Convert input to lowercase Unicode scalar values for core algorithm
        unicodeScalars = characterMapping.toUnicodeScalars(sourceText.toLowerCase());

        const totalScalars = unicodeScalars.length;

        if (retainCaseInformation) {
            // Determine actual case differences for later application
            for (let idx = 0; idx < totalScalars; idx++) {
                originalCaseState[idx] = unicodeScalars[idx] !== originalCaseState[idx];
            }
        }

        const outputSegments = [];

        let currentN = initialCharacterValue;
        let currentDelta = 0;
        let currentBias = initialAdjustmentFactor;

        // Process basic ASCII characters first
        unicodeScalars.forEach(function(scalar, index) { // Using forEach for a different loop style
            if (scalar < 0x80) {
                outputSegments.push(String.fromCharCode(
                    originalCaseState ? adjustBasicCharacterCase(scalar, originalCaseState[index]) : scalar
                ));
            }
        });

        let processedCount = outputSegments.length; // Number of code points handled
        const initialProcessedCount = outputSegments.length; // Number of basic code points

        if (initialProcessedCount > 0) {
            outputSegments.push(labelSegmentDelimiter);
        }

        // Main encoding loop
        while (processedCount < totalScalars) {
            let nextSmallestScalar = largestSafeInteger;
            let scannerIndex = 0;

            // Find the smallest non-basic code point greater than or equal to currentN
            while(scannerIndex < totalScalars) { // Using while loop instead of for
                const currentScalar = unicodeScalars[scannerIndex];
                if (currentScalar >= currentN && currentScalar < nextSmallestScalar) {
                    nextSmallestScalar = currentScalar;
                }
                scannerIndex++;
            }

            // Increase delta enough to advance the decoder's <n,i> state to <m,0>
            if (nextSmallestScalar - currentN > Math.floor((largestSafeInteger - currentDelta) / (processedCount + 1))) {
                throw new RangeError("Encoding overflow (phase 1): calculation exceeds safe integer limit.");
            }
            currentDelta += (nextSmallestScalar - currentN) * (processedCount + 1);
            currentN = nextSmallestScalar;

            scannerIndex = 0; // Reset for next loop
            while(scannerIndex < totalScalars) { // Using while loop instead of for
                const currentScalar = unicodeScalars[scannerIndex];

                if (currentScalar < currentN) {
                    currentDelta++;
                    if (currentDelta > largestSafeInteger) {
                        throw new RangeError("Encoding overflow (phase 2): delta exceeds safe integer limit.");
                    }
                }

                if (currentScalar === currentN) {
                    let tempValue = currentDelta;
                    let loopCount = encodingRadix;

                    // Encode delta as a generalized variable-length integer
                    while (true) {
                        const threshold = (loopCount <= currentBias)
                            ? minThreshold
                            : (loopCount >= currentBias + maxThreshold)
                                ? maxThreshold
                                : loopCount - currentBias;
                        if (tempValue < threshold) {
                            break;
                        }
                        outputSegments.push(String.fromCharCode(generateCharFromValue(threshold + (tempValue - threshold) % (encodingRadix - threshold), false)));
                        tempValue = Math.floor((tempValue - threshold) / (encodingRadix - threshold));
                        loopCount += encodingRadix;
                    }
                    outputSegments.push(String.fromCharCode(generateCharFromValue(tempValue, retainCaseInformation && originalCaseState[scannerIndex])));
                    currentBias = calculateAdjustedBias(currentDelta, processedCount + 1, processedCount === initialProcessedCount);
                    currentDelta = 0;
                    processedCount++;
                }
                scannerIndex++;
            }
            currentN++; // Increment n for the next iteration of the outer loop
        }
        return outputSegments.join("");
    }

    // Public API methods (renamed from ToASCII, ToUnicode)
    return {
        // Converts a domain name with Unicode labels to its Punycode (ASCII) representation
        ToASCII: function(domainName) {
            const domainSegments = domainName.split(".");
            // Using Array.prototype.map for a functional transformation
            return domainSegments.map(function(segment) {
                // Check if the segment contains any non-ASCII characters
                return segment.match(/[^A-Za-z0-9-]/)
                    ? "xn--" + generateEncodedLabel(segment)
                    : segment;
            }).join(".");
        },

        // Converts a domain name with Punycode (ASCII) labels back to its Unicode representation
        ToUnicode: function(domainName) {
            const domainSegments = domainName.split(".");
            // Using Array.prototype.map for a functional transformation
            return domainSegments.map(function(segment) {
                // Check if the segment is a Punycode-encoded label
                return segment.toLowerCase().startsWith("xn--")
                    ? processEncodedLabel(segment.substring(4))
                    : segment;
            }).join(".");
        },

        // Exposing the core encoding/decoding functions as well, mirroring the original
        encode: generateEncodedLabel,
        decode: processEncodedLabel,

        // Exposing the character mapping utility, similar to original's utf16
        charProcessor: characterMapping
    };
})();