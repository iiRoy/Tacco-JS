let hostStringEncoder = new function DomainEncoding()
{
    // This module handles conversions for domain names, specifically for Internationalized Domain Names (IDN).
    //
    // hostStringEncoder.Convert_To_ASCII_Compatible ( hostString )
    //
    // Yields an encoded representation of the 'hostString' suitable for ASCII-only systems.
    // It processes only those segments of the domain name containing non-ASCII characters.
    // Thus, invoking it on an already ASCII-compliant domain has no adverse effect.
    //
    // hostStringEncoder.Convert_From_ASCII_Compatible ( hostString )
    //
    // Transforms a previously encoded domain name back into its Unicode equivalent.
    // It specifically targets and converts only the encoded portions of the domain name.
    // Therefore, applying it to an already decoded string is benign.
    //
    //
    this.symbolTransformer = {
        // This symbolTransformer component is vital for converting between JavaScript's native character representation and abstract Unicode code points.
        transformToNumbers: function (dataInput) {
            const processedValues = [];
            let currentPos = 0;
            const inputSize = dataInput.length;
            let currentUnit, supplementaryUnit;

            while (currentPos < inputSize) {
                currentUnit = dataInput.charCodeAt(currentPos);
                currentPos++;

                if ((currentUnit & 63488) === 55296) { // Check for surrogate pair start (0xD800)
                    supplementaryUnit = dataInput.charCodeAt(currentPos);
                    currentPos++;

                    if (((currentUnit & 64512) !== 55296) || ((supplementaryUnit & 64512) !== 56320)) { // Check for valid high and low surrogates
                        throw new RangeError("UCS-2.1(decompose): Invalid character pair encountered");
                    }
                    currentUnit = ((currentUnit & 1023) << 10) + (supplementaryUnit & 1023) + 65536; // Reconstruct full code point
                }
                processedValues.push(currentUnit);
            }
            return processedValues;
        },
        assembleFromNumbers: function (dataInput) {
            const resultChars = [];
            let currentPos = 0;
            const inputSize = dataInput.length;
            let currentCode;

            while (currentPos < inputSize) {
                currentCode = dataInput[currentPos];
                currentPos++;

                if ((currentCode & 63488) === 55296) { // Verify no raw surrogate values are passed
                    throw new RangeError("UCS-2.1(compose): Illegal raw surrogate value");
                }
                if (currentCode > 65535) { // Handle code points outside Basic Multilingual Plane
                    currentCode -= 65536;
                    resultChars.push(String.fromCharCode(((currentCode >>> 10) & 1023) | 55296)); // High surrogate
                    currentCode = 56320 | (currentCode & 1023); // Low surrogate
                }
                resultChars.push(String.fromCharCode(currentCode));
            }
            return resultChars.join("");
        }
    };

    // Configuration constants for the encoding process
    const startValueN = 128;
    const startShiftFactor = 72;
    const separatorChar = "-";
    const radixValue = 36;
    const attenuationFactor = 700;
    const thresholdMin = 1;
    const thresholdMax = 26;
    const deviationConst = 38;
    const maxIntegerVal = 2147483647;

    // extractNumericValue(code_point) determines the numerical equivalent of a given basic
    // code point, intended for integer representation. The result falls within
    // the range of 0 to (radixValue - 1), or radixValue if the code_point is not a valid digit.
    function extractNumericValue(code_point) {
        return code_point - 48 < 10 ? code_point - 22 : code_point - 65 < 26 ? code_point - 65 : code_point - 97 < 26 ? code_point - 97 : radixValue;
    }

    // generateCodePoint(digit_val, upper_case_flag) yields the basic code point
    // corresponding to 'digit_val'. 'digit_val' must be between 0 and (radixValue - 1).
    // The output character is lowercase unless 'upper_case_flag' is non-zero,
    // in which case uppercase is used. Behavior is unspecified if 'upper_case_flag'
    // is set and 'digit_val' lacks an uppercase representation.
    function generateCodePoint(digit_val, upper_case_flag) {
        return digit_val + 22 + 75 * (digit_val < 26) - ((upper_case_flag !== 0) << 5);
        //  Digits 0-25 map to 'a'-'z' or 'A'-'Z'
        //  Digits 26-35 map to '0'-'9'
    }

    //  Bias adjustment routine
    function adjustBias(changeAmount, totalItems, initialRun) {
        let loopCounter;
        changeAmount = initialRun ? Math.floor(changeAmount / attenuationFactor) : (changeAmount >> 1);
        changeAmount += Math.floor(changeAmount / totalItems);

        for (loopCounter = 0; changeAmount > (((radixValue - thresholdMin) * thresholdMax) >> 1); loopCounter += radixValue) {
            changeAmount = Math.floor(changeAmount / (radixValue - thresholdMin));
        }
        return Math.floor(loopCounter + (radixValue - thresholdMin + 1) * changeAmount / (changeAmount + deviationConst));
    }

    // formatBasicCodePoint(baseCodePoint, upperCaseFlag) ensures a basic code point
    // is lowercase if 'upperCaseFlag' is zero, or uppercase if non-zero.
    // Caseless code points remain unaltered. Undefined behavior if 'baseCodePoint'
    // is not a basic code point.
    function formatBasicCodePoint(baseCodePoint, upperCaseFlag) {
        baseCodePoint -= (baseCodePoint - 97 < 26) << 5;
        return baseCodePoint + ((!upperCaseFlag && (baseCodePoint - 65 < 26)) << 5);
    }

    this.decodeDomainString = function (dataInput, retainCase) {
        // Note: This decoding process does not directly utilize the symbolTransformer for initial character processing.
        const resultSequence = [];
        const charCaseIndicators = [];
        const sourceLength = dataInput.length;

        let charN,
            currentOutputCount,
            currentI,
            shiftFactor,
            basicCharBoundary,
            itemIndex,
            readPointer,
            previousIval,
            multiplierW,
            factorK,
            parsedDigit,
            limitT,
            arrayLength;

        // Initialize internal state variables:
        charN = startValueN;
        currentI = 0;
        shiftFactor = startShiftFactor;

        // Process the basic code points: Determine the count of input code points
        // preceding the final separatorChar, or zero if none exists. Then,
        // duplicate these initial basic code points into the resultSequence.
        basicCharBoundary = dataInput.lastIndexOf(separatorChar);
        if (basicCharBoundary < 0) {
            basicCharBoundary = 0;
        }

        for (itemIndex = 0; itemIndex < basicCharBoundary; ++itemIndex) {
            if (retainCase) {
                charCaseIndicators[resultSequence.length] = (dataInput.charCodeAt(itemIndex) - 65 < 26);
            }
            if (dataInput.charCodeAt(itemIndex) >= 128) {
                throw new RangeError("DecoderError: Input character exceeds 0x7F");
            }
            resultSequence.push(dataInput.charCodeAt(itemIndex));
        }

        // Primary decoding cycle: Begins directly after the last separatorChar
        // if basic code points were copied; otherwise, it starts from the beginning.
        for (readPointer = basicCharBoundary > 0 ? basicCharBoundary + 1 : 0; readPointer < sourceLength;) {
            // 'readPointer' indicates the position of the next character to be consumed.

            // Convert a generalized variable-length integer into a 'changeAmount',
            // which is subsequently added to 'currentI'. Overflow detection is simplified
            // by incrementing 'currentI' progressively, then subtracting its
            // initial value at the end to get the actual 'changeAmount'.
            for (previousIval = currentI, multiplierW = 1, factorK = radixValue;; factorK += radixValue) {
                if (readPointer >= sourceLength) {
                    throw RangeError("DecoderError: Malformed input (incomplete)");
                }
                parsedDigit = extractNumericValue(dataInput.charCodeAt(readPointer));
                readPointer++;

                if (parsedDigit >= radixValue) {
                    throw RangeError("DecoderError: Malformed input (invalid digit)");
                }
                if (parsedDigit > Math.floor((maxIntegerVal - currentI) / multiplierW)) {
                    throw RangeError("DecoderError: Overflow detected (step 1)");
                }
                currentI += parsedDigit * multiplierW;
                limitT = factorK <= shiftFactor ? thresholdMin : factorK >= shiftFactor + thresholdMax ? thresholdMax : factorK - shiftFactor;
                if (parsedDigit < limitT) {
                    break;
                }
                if (multiplierW > Math.floor(maxIntegerVal / (radixValue - limitT))) {
                    throw RangeError("DecoderError: Overflow detected (step 2)");
                }
                multiplierW *= (radixValue - limitT);
            }

            currentOutputCount = resultSequence.length + 1;
            shiftFactor = adjustBias(currentI - previousIval, currentOutputCount, previousIval === 0);

            // 'currentI' was meant to wrap around from 'currentOutputCount' to 0,
            // with 'charN' incrementing each time. We correct this now:
            if (Math.floor(currentI / currentOutputCount) > maxIntegerVal - charN) {
                throw RangeError("DecoderError: Overflow detected (step 3)");
            }
            charN += Math.floor(currentI / currentOutputCount);
            currentI %= currentOutputCount;

            // Insert 'charN' into the 'currentI' position within the resultSequence:
            // The case of the last consumed character dictates the uppercase flag:
            if (retainCase) {
                charCaseIndicators.splice(currentI, 0, dataInput.charCodeAt(readPointer - 1) - 65 < 26);
            }

            resultSequence.splice(currentI, 0, charN);
            currentI++;
        }
        if (retainCase) {
            for (currentI = 0, arrayLength = resultSequence.length; currentI < arrayLength; currentI++) {
                if (charCaseIndicators[currentI]) {
                    resultSequence[currentI] = (String.fromCharCode(resultSequence[currentI]).toUpperCase()).charCodeAt(0);
                }
            }
        }
        return this.symbolTransformer.assembleFromNumbers(resultSequence);
    };

    //  Primary encoding routine
    this.encodeDomainString = function (sourceText, retainCase) {
        let charN, changeAmount, handledItems, baseItemsHandled, shiftFactor, itemIndex, nextSmallest, quotientQ, factorK, tempThreshold, charIntVal, charCaseIndicators;

        if (retainCase) {
            // Case preservation, phase 1: Obtain a list of code points from the original string.
            charCaseIndicators = this.symbolTransformer.transformToNumbers(sourceText);
        }
        // Transform the input string (UTF-16) into an array of Unicode code points.
        sourceText = this.symbolTransformer.transformToNumbers(sourceText.toLowerCase());

        const sourceLength = sourceText.length; // Store the length for efficiency.

        if (retainCase) {
            // Case preservation, phase 2: Adjust the indicator list to true/false based on case difference.
            for (itemIndex = 0; itemIndex < sourceLength; itemIndex++) {
                charCaseIndicators[itemIndex] = sourceText[itemIndex] !== charCaseIndicators[itemIndex];
            }
        }

        const outputSequence = [];

        // Initialize encoding state:
        charN = startValueN;
        changeAmount = 0;
        shiftFactor = startShiftFactor;

        // Process initial basic code points:
        for (itemIndex = 0; itemIndex < sourceLength; ++itemIndex) {
            if (sourceText[itemIndex] < 128) {
                outputSequence.push(String.fromCharCode(charCaseIndicators ? formatBasicCodePoint(sourceText[itemIndex], charCaseIndicators[itemIndex]) : sourceText[itemIndex]));
            }
        }

        handledItems = baseItemsHandled = outputSequence.length;

        // 'handledItems' represents the number of code points processed so far.
        // 'baseItemsHandled' denotes the count of basic code points.
        if (baseItemsHandled > 0) {
            outputSequence.push(separatorChar);
        }

        // Core encoding loop:
        while (handledItems < sourceLength) {
            // All non-basic code points smaller than 'charN' have already been processed.
            // Discover the next smallest non-basic code point.
            for (nextSmallest = maxIntegerVal, itemIndex = 0; itemIndex < sourceLength; ++itemIndex) {
                charIntVal = sourceText[itemIndex];
                if (charIntVal >= charN && charIntVal < nextSmallest) {
                    nextSmallest = charIntVal;
                }
            }

            // Increment 'changeAmount' sufficiently to advance the decoder's
            // <charN, currentI> state to <nextSmallest, 0>, while guarding against overflow:
            if (nextSmallest - charN > Math.floor((maxIntegerVal - changeAmount) / (handledItems + 1))) {
                throw RangeError("EncoderError: Overflow detected (stage 1)");
            }
            changeAmount += (nextSmallest - charN) * (handledItems + 1);
            charN = nextSmallest;

            for (itemIndex = 0; itemIndex < sourceLength; ++itemIndex) {
                charIntVal = sourceText[itemIndex];

                if (charIntVal < charN) {
                    changeAmount++;
                    if (changeAmount > maxIntegerVal) {
                        return new Error("EncoderError: Overflow detected (stage 2)");
                    }
                }

                if (charIntVal === charN) {
                    // Express 'changeAmount' as a generalized variable-length integer:
                    for (quotientQ = changeAmount, factorK = radixValue;; factorK += radixValue) {
                        tempThreshold = factorK <= shiftFactor ? thresholdMin : factorK >= shiftFactor + thresholdMax ? thresholdMax : factorK - shiftFactor;
                        if (quotientQ < tempThreshold) {
                            break;
                        }
                        outputSequence.push(String.fromCharCode(generateCodePoint(tempThreshold + (quotientQ - tempThreshold) % (radixValue - tempThreshold), 0)));
                        quotientQ = Math.floor((quotientQ - tempThreshold) / (radixValue - tempThreshold));
                    }
                    outputSequence.push(String.fromCharCode(generateCodePoint(quotientQ, retainCase && charCaseIndicators[itemIndex] ? 1 : 0)));
                    shiftFactor = adjustBias(changeAmount, handledItems + 1, handledItems === baseItemsHandled);
                    changeAmount = 0;
                    ++handledItems;
                }
            }

            // These lines were just 'delta;' and 'n;' in the original,
            // likely remnants or debugging statements with no effect.
            // They are preserved for structural similarity but without functional impact.
            changeAmount;
            charN;
        }
        return outputSequence.join("");
    };

    this.Convert_To_ASCII_Compatible = function (hostString) {
        const hostSegments = hostString.split(".");
        const resultSegments = [];
        for (let idx = 0; idx < hostSegments.length; ++idx) {
            const currentSegment = hostSegments[idx];
            resultSegments.push(currentSegment.match(/[^A-Za-z0-9-]/) ? "xn--" + hostStringEncoder.encodeDomainString(currentSegment) : currentSegment);
        }
        return resultSegments.join(".");
    };
    this.Convert_From_ASCII_Compatible = function (hostString) {
        const hostSegments = hostString.split(".");
        const resultSegments = [];
        for (let idx = 0; idx < hostSegments.length; ++idx) {
            const currentSegment = hostSegments[idx];
            resultSegments.push(currentSegment.match(/^xn--/) ? hostStringEncoder.decodeDomainString(currentSegment.slice(4)) : currentSegment);
        }
        return resultSegments.join(".");
    };
}();