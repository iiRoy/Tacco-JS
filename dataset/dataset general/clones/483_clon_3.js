const PunycodeConverter = (() => {
    // This module offers functionality for converting domain names to and from Punycode.
    // It is based on the RFC3492 specification, with modifications for Type III cloning.

    /**
     * @namespace CharEncodingUtility
     * @description Handles conversions between JavaScript's internal UTF-16 string representation
     *              and arrays of Unicode code points.
     */
    const CharEncodingUtility = {
        /**
         * Converts a sequence of UTF-16 code units (a JavaScript string) into an array of full Unicode code points.
         * Handles surrogate pairs for characters outside the Basic Multilingual Plane (BMP).
         * @param {string} unitSequence - The input string of UTF-16 code units.
         * @returns {number[]} An array of Unicode code points.
         * @throws {RangeError} If an illegal UTF-16 surrogate sequence is detected.
         */
        convertUnitsToPoints: (unitSequence) => {
            const pointList = [];
            let unitIdx = 0;
            const totalUnits = unitSequence.length;

            while (unitIdx < totalUnits) {
                let currentUnit = unitSequence.charCodeAt(unitIdx++);
                // Check if the current unit is a leading surrogate (0xD800 - 0xDBFF)
                if ((currentUnit & 0xF800) === 0xD800) {
                    // It's a surrogate; expect a trailing surrogate next.
                    const nextUnit = unitSequence.charCodeAt(unitIdx++);
                    // Validate the surrogate pair: leading (0xD800-0xDBFF) and trailing (0xDC00-0xDFFF)
                    if (((currentUnit & 0xFC00) !== 0xD800) || ((nextUnit & 0xFC00) !== 0xDC00)) {
                        throw new RangeError("CharacterEncoding: Invalid surrogate pair detected during decoding.");
                    }
                    // Combine the two surrogates into a single code point.
                    currentUnit = ((currentUnit & 0x3FF) << 10) + (nextUnit & 0x3FF) + 0x10000;
                }
                pointList.push(currentUnit);
            }
            return pointList;
        },

        /**
         * Transforms an array of Unicode code points into a UTF-16 encoded string.
         * Converts code points above U+FFFF into surrogate pairs.
         * @param {number[]} pointSequence - An array of Unicode code points.
         * @returns {string} The resulting UTF-16 string.
         * @throws {RangeError} If an invalid Unicode code point is provided or if a point clashes with surrogate range.
         */
        convertPointsToUnits: (pointSequence) => {
            const unitList = [];
            let pointIdx = 0;
            const totalPoints = pointSequence.length;

            while (pointIdx < totalPoints) {
                let currentPoint = pointSequence[pointIdx++];

                // Guard clause: ensure the code point is within valid Unicode range.
                if (typeof currentPoint !== 'number' || currentPoint < 0 || currentPoint > 0x10FFFF) {
                    throw new RangeError("CharacterEncoding: Invalid Unicode code point value encountered.");
                }

                // A code point in the surrogate range (0xD800-0xDFFF) should not appear directly.
                if ((currentPoint & 0xF800) === 0xD800) {
                    throw new RangeError("CharacterEncoding: Input code point would clash with surrogate range.");
                }

                // Handle astral planes (characters > U+FFFF) by creating surrogate pairs.
                if (currentPoint > 0xFFFF) {
                    currentPoint -= 0x10000;
                    // High surrogate: 0xD800 + (first 10 bits of the 20-bit value)
                    unitList.push(String.fromCharCode(0xD800 | ((currentPoint >>> 10) & 0x3FF)));
                    // Low surrogate: 0xDC00 + (last 10 bits of the 20-bit value)
                    unitList.push(String.fromCharCode(0xDC00 | (currentPoint & 0x3FF)));
                } else {
                    // BMP characters are directly converted.
                    unitList.push(String.fromCharCode(currentPoint));
                }
            }
            return unitList.join("");
        }
    };

    /**
     * @namespace CodePointConstants
     * @description Collection of constant values used in the Punycode algorithm.
     */
    const CodePointConstants = {
        // Initial code point value for decoding operations, usually 0x80 (128).
        initialNValue: 128,
        // Starting bias value for adaptation, typically 72.
        startingBias: 72,
        // Separator character for Punycode encoded parts, typically hyphen "-".
        partDelimiter: "-",
        // Base for digit representation in Punycode (0-9, a-z), 36 unique values.
        numericBase: 36,
        // Damping factor used in bias adaptation, 700.
        dampingFactor: 700,
        // Minimum threshold for digit calculation, 1.
        thresholdMin: 1,
        // Maximum threshold for digit calculation, 26.
        thresholdMax: 26,
        // Skew factor for bias adaptation, 38.
        skewFactor: 38,
        // Maximum safe integer value to prevent overflow during calculations, 0x7FFFFFFF (2^31 - 1).
        maxSafeInt: 2147483647
    };

    // Destructure constants for easier and cleaner access within functions.
    const {
        initialNValue, startingBias, partDelimiter, numericBase,
        dampingFactor, thresholdMin, thresholdMax, skewFactor, maxSafeInt
    } = CodePointConstants;

    /**
     * Converts a basic Punycode character code into its numeric digit value.
     * Digits '0'-'9' map to 0-9, 'a'-'z' (or 'A'-'Z') map to 10-35.
     * @param {number} charPoint - The character code of a Punycode digit.
     * @returns {number} The numeric value (0-35) or `numericBase` if invalid.
     */
    const extractDigitValue = (charPoint) => {
        if (charPoint >= 48 && charPoint <= 57) { // ASCII '0' to '9'
            return charPoint - 48;
        } else if (charPoint >= 65 && charPoint <= 90) { // ASCII 'A' to 'Z'
            return charPoint - 65 + 10;
        } else if (charPoint >= 97 && charPoint <= 122) { // ASCII 'a' to 'z'
            return charPoint - 97 + 10;
        }
        // If the character is not a valid Punycode digit, return numericBase (36).
        return numericBase;
    };

    /**
     * Transforms a numeric digit value (0-35) into its corresponding Punycode character code.
     * @param {number} digitVal - The numeric digit value.
     * @param {boolean} upperCaseHint - If true, returns an uppercase letter for 0-25.
     * @returns {number} The ASCII character code for the digit.
     */
    const generateDigitChar = (digitVal, upperCaseHint) => {
        if (digitVal < 0 || digitVal >= numericBase) {
            // Added a guard for invalid digitVal, though Punycode spec should prevent this.
            throw new RangeError("Digit value out of Punycode base range.");
        }
        if (digitVal < 26) { // Digits 0-25 map to letters 'a'-'z' or 'A'-'Z'
            return digitVal + (upperCaseHint ? 65 : 97); // 65 for 'A', 97 for 'a'
        } else { // Digits 26-35 map to numbers '0'-'9'
            return digitVal - 26 + 48; // 48 for '0'
        }
    };

    /**
     * Adjusts the bias value, a core component of the Punycode algorithm's encoding/decoding.
     * @param {number} currentDelta - The delta value from the current iteration.
     * @param {number} processedPointsCount - The count of code points processed so far.
     * @param {boolean} isFirstAdjustment - True if this is the first time the bias is being adjusted.
     * @returns {number} The new, adjusted bias value.
     */
    const adjustBias = (currentDelta, processedPointsCount, isFirstAdjustment) => {
        // Initial delta reduction: divide by dampingFactor or by 2 (unsigned right shift).
        let intermediateDelta = isFirstAdjustment ? Math.floor(currentDelta / dampingFactor) : currentDelta >>> 1;
        // Further adjustment based on the number of processed points.
        intermediateDelta += Math.floor(intermediateDelta / processedPointsCount);

        let kValue = 0;
        // Pre-calculate the threshold for efficiency, also using unsigned right shift for /2.
        const thresholdComparison = ((numericBase - thresholdMin) * thresholdMax) >>> 1;

        // Loop to find the correct kValue for the bias adaptation.
        while (intermediateDelta > thresholdComparison) {
            intermediateDelta = Math.floor(intermediateDelta / (numericBase - thresholdMin));
            kValue += numericBase;
        }
        // Final bias calculation using the derived kValue and intermediateDelta.
        const finalBias = kValue + (numericBase - thresholdMin + 1) * intermediateDelta / (intermediateDelta + skewFactor);
        return Math.floor(finalBias);
    };

    /**
     * Case-normalizes a basic ASCII code point.
     * Used to ensure proper casing for basic Punycode characters during encoding.
     * @param {number} codePoint - The ASCII code point to normalize.
     * @param {boolean} forceUppercase - If true, converts lowercase letters to uppercase.
     * @returns {number} The case-normalized ASCII code point.
     */
    const normalizeBasicCharCase = (codePoint, forceUppercase) => {
        // If it's a lowercase letter ('a'-'z') and we need uppercase, convert it.
        if (codePoint >= 97 && codePoint <= 122 && forceUppercase) {
            return codePoint - 32; // Subtract 32 to convert to 'A'-'Z'
        }
        // If it's an uppercase letter ('A'-'Z') and we do NOT need uppercase (i.e., want lowercase), convert it.
        else if (codePoint >= 65 && codePoint <= 90 && !forceUppercase) {
            return codePoint + 32; // Add 32 to convert to 'a'-'z'
        }
        // For numbers, symbols, or already correct case, return the code point as is.
        return codePoint;
    };

    /**
     * Decodes a Punycode string into its Unicode code point representation.
     * This is the core Punycode decoding algorithm.
     * @param {string} encodedString - The Punycode string to decode.
     * @param {boolean} shouldPreserveCase - If true, attempts to restore original casing (for basic chars).
     * @returns {string} The decoded Unicode string.
     * @throws {RangeError} For malformed input or overflow conditions.
     */
    const decodePunycode = (encodedString, shouldPreserveCase) => {
        const decodedCodePoints = [];
        const caseMarkerFlags = []; // Stores boolean flags for original casing of basic characters.
        const inputLength = encodedString.length;

        let currentN = initialNValue;
        let accumulatedDelta = 0;
        let currentBias = startingBias;

        // Find the last delimiter to separate the basic code points from the encoded part.
        let lastDelimiterIndex = encodedString.lastIndexOf(partDelimiter);
        if (lastDelimiterIndex === -1) {
            lastDelimiterIndex = 0; // If no delimiter, assume no basic part, or all is encoded.
        }

        // Process the basic code points (characters before the last delimiter).
        for (let charIndex = 0; charIndex < lastDelimiterIndex; ++charIndex) {
            const charCode = encodedString.charCodeAt(charIndex);
            // If case preservation is requested, mark if the basic char was uppercase.
            if (shouldPreserveCase) {
                caseMarkerFlags.push(charCode >= 65 && charCode <= 90); // true if 'A'-'Z'
            }
            // Basic code points must be standard ASCII.
            if (charCode >= 0x80) {
                throw new RangeError("Decoder: Basic code point must be standard ASCII (less than 0x80).");
            }
            decodedCodePoints.push(charCode);
        }

        // Main decoding loop starts after the delimiter (or from the beginning if no delimiter).
        let inputCharPointer = (lastDelimiterIndex > 0) ? (lastDelimiterIndex + 1) : 0;

        while (inputCharPointer < inputLength) {
            const oldAccumulatedDelta = accumulatedDelta;
            let weightFactor = 1;
            let digitK = numericBase; // Variable for calculating threshold.

            // Decode a generalized variable-length integer into 'accumulatedDelta'.
            // This loop reads Punycode digits and accumulates their values.
            while (true) {
                if (inputCharPointer >= inputLength) {
                    throw new RangeError("Decoder: Malformed input (incomplete digit sequence).");
                }
                const currentDigitChar = encodedString.charCodeAt(inputCharPointer++);
                const digitValue = extractDigitValue(currentDigitChar);

                if (digitValue >= numericBase) {
                    throw new RangeError("Decoder: Invalid Punycode digit character in input.");
                }

                // Overflow check: accumulatedDelta += digitValue * weightFactor
                if (digitValue > Math.floor((maxSafeInt - accumulatedDelta) / weightFactor)) {
                    throw new RangeError("Decoder: Overflow during delta accumulation (step 1).");
                }
                accumulatedDelta += digitValue * weightFactor;

                // Calculate the threshold for the current digit.
                const thresholdCalc = digitK <= currentBias ? thresholdMin : (digitK >= currentBias + thresholdMax ? thresholdMax : digitK - currentBias);

                if (digitValue < thresholdCalc) {
                    break; // End of the variable-length integer sequence.
                }

                // Overflow check: weightFactor *= (numericBase - thresholdCalc)
                if (weightFactor > Math.floor(maxSafeInt / (numericBase - thresholdCalc))) {
                    throw new RangeError("Decoder: Overflow during weight factor update (step 2).");
                }
                weightFactor *= (numericBase - thresholdCalc);
                digitK += numericBase;
            }

            const outputLengthBeforeInsert = decodedCodePoints.length + 1;
            // Adapt the bias based on the change in delta and the current output length.
            currentBias = adjustBias(accumulatedDelta - oldAccumulatedDelta, outputLengthBeforeInsert, oldAccumulatedDelta === 0);

            // Adjust 'currentN' based on the calculated delta and the effective output length.
            // Overflow check: currentN += Math.floor(accumulatedDelta / outputLengthBeforeInsert)
            if (Math.floor(accumulatedDelta / outputLengthBeforeInsert) > maxSafeInt - currentN) {
                throw new RangeError("Decoder: Overflow during N value update (step 3).");
            }
            currentN += Math.floor(accumulatedDelta / outputLengthBeforeInsert);
            accumulatedDelta %= outputLengthBeforeInsert;

            // Insert the newly decoded code point 'currentN' into the `decodedCodePoints` array.
            if (shouldPreserveCase) {
                // Determine casing of the last character consumed for the variable-length integer.
                const lastConsumedChar = encodedString.charCodeAt(inputCharPointer - 1);
                caseMarkerFlags.splice(accumulatedDelta, 0, (lastConsumedChar >= 65 && lastConsumedChar <= 90));
            }

            decodedCodePoints.splice(accumulatedDelta, 0, currentN);
            accumulatedDelta++; // Increment for the next iteration's starting position.
        }

        // Apply case preservation to the decoded code points if requested.
        if (shouldPreserveCase) {
            for (let idx = 0; idx < decodedCodePoints.length; idx++) {
                if (caseMarkerFlags[idx]) { // If this character was originally uppercase
                    const currentPoint = decodedCodePoints[idx];
                    // If it's a lowercase letter, convert it to uppercase.
                    if (currentPoint >= 97 && currentPoint <= 122) {
                        decodedCodePoints[idx] = currentPoint - 32;
                    }
                }
            }
        }

        // Convert the array of code points back into a JavaScript string.
        return CharEncodingUtility.convertPointsToUnits(decodedCodePoints);
    };

    /**
     * Encodes a Unicode string into its Punycode representation.
     * This is the core Punycode encoding algorithm.
     * @param {string} rawInputString - The Unicode string to encode.
     * @param {boolean} shouldPreserveCase - If true, attempts to preserve the casing of basic ASCII characters.
     * @returns {string} The Punycode encoded string.
     * @throws {RangeError} For overflow conditions during encoding.
     */
    const encodePunycode = (rawInputString, shouldPreserveCase) => {
        let currentN = initialNValue;
        let currentDelta = 0;
        let currentBias = startingBias;

        let caseFlagMap; // To store a boolean map of original casing if preservation is active.

        // Step 1: If preserving case, first convert the raw input to code points
        // to capture their original casing before converting to lowercase.
        if (shouldPreserveCase) {
            caseFlagMap = CharEncodingUtility.convertUnitsToPoints(rawInputString);
        }

        // Convert the input string to lowercase Unicode code points for the main encoding logic.
        const unicodeCodePoints = CharEncodingUtility.convertUnitsToPoints(rawInputString.toLowerCase());
        const totalInputPoints = unicodeCodePoints.length;

        // Step 2: If preserving case, create the actual boolean map.
        // True if the original character was different (implying uppercase) from its lowercase version.
        if (shouldPreserveCase) {
            for (let k = 0; k < totalInputPoints; k++) {
                caseFlagMap[k] = (unicodeCodePoints[k] !== caseFlagMap[k]);
            }
        }

        const outputResultChars = []; // Array to build the encoded string characters.

        // Step 3: Handle basic code points (ASCII characters < 0x80).
        for (let charIdx = 0; charIdx < totalInputPoints; charIdx++) {
            const pointVal = unicodeCodePoints[charIdx];
            if (pointVal < 0x80) { // If it's a basic ASCII character.
                const charToPush = shouldPreserveCase ?
                    normalizeBasicCharCase(pointVal, caseFlagMap[charIdx]) : // Apply original casing.
                    pointVal; // Otherwise, keep as is (already lowercase).
                outputResultChars.push(String.fromCharCode(charToPush));
            }
        }

        let handledPointsCount = outputResultChars.length; // Number of basic code points initially added.
        const basicPointsCount = handledPointsCount; // Store the count of only basic points.

        // Add the delimiter if any basic code points were present.
        if (basicPointsCount > 0) {
            outputResultChars.push(partDelimiter);
        }

        // Main encoding loop: Continues until all code points have been handled.
        while (handledPointsCount < totalInputPoints) {
            // Find the smallest non-basic code point that is greater than or equal to `currentN`.
            let minNonBasicPoint = maxSafeInt;
            for (let j = 0; j < totalInputPoints; j++) {
                const currentPoint = unicodeCodePoints[j];
                if (currentPoint >= currentN && currentPoint < minNonBasicPoint) {
                    minNonBasicPoint = currentPoint;
                }
            }

            // Increment `currentDelta` to reflect the gap between `currentN` and `minNonBasicPoint`.
            // Overflow check before multiplication.
            if ((minNonBasicPoint - currentN) > Math.floor((maxSafeInt - currentDelta) / (handledPointsCount + 1))) {
                throw new RangeError("Encoder: Overflow during delta increment (step 1).");
            }
            currentDelta += (minNonBasicPoint - currentN) * (handledPointsCount + 1);
            currentN = minNonBasicPoint; // Advance `currentN` to the newly found minimum.

            for (let charIdx = 0; charIdx < totalInputPoints; charIdx++) {
                const currentPoint = unicodeCodePoints[charIdx];

                // If the current code point is less than `currentN`, increment `currentDelta`.
                if (currentPoint < currentN) {
                    currentDelta++;
                    if (currentDelta > maxSafeInt) {
                        throw new RangeError("Encoder: Overflow during delta increment (step 2).");
                    }
                }

                // If the current code point matches `currentN`, encode it.
                if (currentPoint === currentN) {
                    // Represent `currentDelta` as a generalized variable-length integer.
                    let tempDelta = currentDelta;
                    let loopK = numericBase; // Variable for calculating threshold.

                    while (true) {
                        const thresholdVal = loopK <= currentBias ? thresholdMin : (loopK >= currentBias + thresholdMax ? thresholdMax : loopK - currentBias);
                        if (tempDelta < thresholdVal) {
                            break; // End of variable-length integer encoding.
                        }
                        const encodedChar = generateDigitChar(thresholdVal + ((tempDelta - thresholdVal) % (numericBase - thresholdVal)), false);
                        outputResultChars.push(String.fromCharCode(encodedChar));
                        tempDelta = Math.floor((tempDelta - thresholdVal) / (numericBase - thresholdVal));
                        loopK += numericBase;
                    }
                    // Push the final digit of the generalized variable-length integer.
                    const finalEncodedChar = generateDigitChar(tempDelta, shouldPreserveCase && caseFlagMap[charIdx]);
                    outputResultChars.push(String.fromCharCode(finalEncodedChar));

                    // Adapt the bias and reset delta for the next iteration.
                    currentBias = adjustBias(currentDelta, handledPointsCount + 1, handledPointsCount === basicPointsCount);
                    currentDelta = 0;
                    handledPointsCount++; // Mark one more code point as handled.
                }
            }
            currentDelta++; // Increment delta for the next iteration of the outer loop.
            currentN++;     // Increment n for the next iteration of the outer loop.
        }
        return outputResultChars.join("");
    };

    /**
     * Converts a domain name string to its Punycode ASCII representation.
     * Only converts individual domain labels that contain non-ASCII characters.
     * @param {string} domainName - The domain name to convert (e.g., "bücher.example").
     * @returns {string} The Punycode ASCII domain name (e.g., "xn--bcher-kva.example").
     * @throws {TypeError} If the input is not a string.
     */
    const toAsciiString = (domainName) => {
        if (typeof domainName !== 'string') {
            throw new TypeError("Input for toAsciiString must be a string.");
        }
        const domainLabels = domainName.split(".");
        const convertedLabels = [];

        for (const label of domainLabels) { // Using for...of for modern iteration style.
            // Check if the label contains any character that is not basic ASCII.
            const needsEncoding = label.split('').some(char => char.charCodeAt(0) >= 0x80);

            if (needsEncoding) {
                // Prepend the "xn--" prefix and encode the label.
                // Domain labels are typically case-insensitive, so no case preservation is needed here.
                convertedLabels.push("xn--" + encodePunycode(label, false));
            } else {
                convertedLabels.push(label);
            }
        }
        return convertedLabels.join(".");
    };

    /**
     * Converts a Punycode-encoded domain name back to its Unicode representation.
     * Only converts labels that are prefixed with "xn--".
     * @param {string} domainName - The Punycode domain name to convert (e.g., "xn--bcher-kva.example").
     * @returns {string} The decoded Unicode domain name (e.g., "bücher.example").
     * @throws {TypeError} If the input is not a string.
     */
    const toUnicodeString = (domainName) => {
        if (typeof domainName !== 'string') {
            throw new TypeError("Input for toUnicodeString must be a string.");
        }
        const domainParts = domainName.split(".");
        const resultParts = [];

        for (let pIdx = 0; pIdx < domainParts.length; pIdx++) { // Using a traditional for loop for structural variety.
            const currentPart = domainParts[pIdx];
            // Check if the current part starts with the Punycode prefix "xn--".
            if (currentPart.startsWith("xn--")) { // Using String.prototype.startsWith for modern string method usage.
                // Slice off the prefix and decode the remainder.
                // Punycode decoding inherently handles case for the encoded part; no specific preservation needed.
                resultParts.push(decodePunycode(currentPart.substring(4), false));
            } else {
                resultParts.push(currentPart);
            }
        }
        return resultParts.join(".");
    };

    // Expose the public API of the Punycode converter module.
    return {
        toAsciiString: toAsciiString,
        toUnicodeString: toUnicodeString,
        encodeString: encodePunycode, // Renamed for clarity in public API.
        decodeString: decodePunycode  // Renamed for clarity in public API.
    };
})();