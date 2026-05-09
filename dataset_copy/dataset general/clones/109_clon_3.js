/*
 * Enhanced Formatting Module v2.1
 * A utility for advanced data presentation in web applications.
 *
 * Copyright (c) 2023 [Your Name/Company]
 * Based on concepts from earlier jQuery format plugins.
 * Licensed under the Apache License 2.0.
 *
 * Date: 2023-10-27 10:00:00 +0000 (Fri, 27 Oct 2023)
 *
 * This module provides robust date and number formatting and parsing capabilities,
 * allowing for flexible localization and custom pattern definitions.
 */
(function (externalLib) {

    // Define core utility constants for clarity and minification potential.
    const TYPE_UNDEFINED = 'undefined';
    const BOOLEAN_TRUE = true;
    const BOOLEAN_FALSE = false;

    // Internal storage for localization settings.
    // This object holds the default patterns and names for various locales.
    let _localizationConfig = {
        datePatterns: { // Renamed from 'date' to 'datePatterns'
            defaultFormat: 'DDDD, MMMM dd, yyyy h:mm:ss a', // Modified default format
            fullMonths: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            fullDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            timeOnlyFormat: 'h:mm a', // Renamed from 'timeFormat'
            briefDateFormat: 'M/d/yyyy', // Renamed from 'shortDateFormat'
            extendedDateFormat: 'DDDD, MMMM dd, yyyy' // Renamed from 'longDateFormat'
        },
        numberFormats: { // Renamed from 'number' to 'numberFormats'
            defaultFormat: '#,##0.00', // Modified default number format
            digitGroupingSeparator: ',', // Renamed from 'groupingSeparator'
            decimalPointSeparator: '.' // Renamed from 'decimalSeparator'
        }
    };

    /**
     * Helper to pad a number with leading zeros.
     * @param {number} num - The number to pad.
     * @param {number} totalLength - The desired total length of the string.
     * @returns {string} The zero-padded string.
     */
    const padWithZeros = (num, totalLength) => {
        let str = String(num);
        // Ensure the string length matches the desired total length.
        while (str.length < totalLength) {
            str = '0' + str;
        }
        return str;
    };

    /**
     * Core utility object for formatting and parsing.
     * Assigned to externalLib.formatter (e.g., $.formatter).
     */
    externalLib.formatter = (function () {

        // Private helper function to extract a numeric segment from a string.
        // This is used during date parsing.
        const obtainNumericPart = (inputStr, startIdx, minLen, maxLen) => {
            // Validate input string and indices.
            if (!inputStr || startIdx < 0 || startIdx >= inputStr.length) {
                return null;
            }

            for (let currentLen = maxLen; currentLen >= minLen; currentLen--) {
                const segment = inputStr.substring(startIdx, startIdx + currentLen);
                // Check if the segment is valid and contains only digits.
                if (segment.length >= minLen && /^\d+$/.test(segment)) {
                    return segment;
                }
            }
            return null; // Return null if no valid segment is found.
        };

        return {

            /**
             * Updates or retrieves the current localization settings.
             * @param {object} [newSettings] - Optional object with new localization settings to merge.
             * @returns {object} The current localization configuration.
             */
            adjustLocalization: function (newSettings) {
                // If new settings are provided, merge them into the existing configuration.
                if (newSettings && typeof newSettings === 'object') {
                    for (const categoryKey in newSettings) {
                        // Ensure it's an own property to avoid iterating prototype chain.
                        if (Object.prototype.hasOwnProperty.call(newSettings, categoryKey)) {
                            // Ensure the category exists in the configuration. If not, initialize it.
                            if (!_localizationConfig[categoryKey]) {
                                _localizationConfig[categoryKey] = {};
                            }
                            for (const settingKey in newSettings[categoryKey]) {
                                if (Object.prototype.hasOwnProperty.call(newSettings[categoryKey], settingKey)) {
                                    _localizationConfig[categoryKey][settingKey] = newSettings[categoryKey][settingKey];
                                }
                            }
                        }
                    }
                }
                // Always return the complete, updated localization configuration.
                return _localizationConfig;
            },

            /**
             * Formats or parses a date value based on a specified pattern.
             * @param {string|Date} sourceValue - The date string to parse or Date object to format.
             * @param {string} [pattern] - The format pattern string.
             * @returns {Date|string|null} A Date object if parsing, a formatted string if formatting, or null on failure.
             */
            processDate: function (sourceValue, pattern) {

                // Guard clause for null or undefined sourceValue.
                if (sourceValue === null || sourceValue === undefined) {
                    console.warn("processDate received null/undefined sourceValue.");
                    return null;
                }

                // Branching logic based on the type of the input sourceValue.
                if (typeof sourceValue === 'string') { // Parsing a date string.

                    // If the input string is empty, it cannot be parsed.
                    if (sourceValue.trim().length === 0) {
                        return null;
                    }

                    // Determine the pattern to use; fall back to default if not provided.
                    const currentPattern = pattern || _localizationConfig.datePatterns.defaultFormat;

                    let parsingIndex = 0; // Current position in the input string.
                    let formatCharIterator = 0; // Current position in the format pattern.

                    // Initialize date components with current date values as a fallback.
                    const now = new Date();
                    let yr = now.getFullYear();
                    let mth = now.getMonth() + 1;
                    let day = 1; // Default to 1st of the month.
                    let hrs = now.getHours();
                    let mins = now.getMinutes();
                    let secs = now.getSeconds();
                    let millis = now.getMilliseconds();
                    let ampmIndicator = ''; // Stores 'AM' or 'PM' if found.

                    let tokenBuffer = ''; // Accumulates characters for the current format token.
                    let charInPattern = ''; // The character currently being examined in the pattern.

                    // Loop through the format pattern to parse the input string.
                    while (formatCharIterator < currentPattern.length) {
                        tokenBuffer = '';
                        charInPattern = currentPattern.charAt(formatCharIterator);

                        // Collect consecutive identical characters to form a token (e.g., 'MM', 'yyyy').
                        while ((currentPattern.charAt(formatCharIterator) === charInPattern) && (formatCharIterator < currentPattern.length)) {
                            tokenBuffer += currentPattern.charAt(formatCharIterator++);
                        }

                        // Special handling for long month/day names (e.g., 'MMMMM' is treated as 'MMMM').
                        // This ensures robustness against over-specified patterns.
                        if (tokenBuffer.includes('MMMM') && tokenBuffer.length > 4) {
                            tokenBuffer = 'MMMM';
                        }
                        if (tokenBuffer.includes('DDDD') && tokenBuffer.length > 4) { // Modified from EEEE
                            tokenBuffer = 'DDDD';
                        }

                        let extractedVal = null; // Value extracted from the input string.

                        // Process tokens based on their type using a switch statement for clarity.
                        switch (tokenBuffer) {
                            case 'yyyy':
                            case 'yy':
                            case 'y':
                                const yearMinLen = (tokenBuffer === 'yyyy') ? 4 : 2;
                                const yearMaxLen = (tokenBuffer === 'y') ? 4 : yearMinLen; // 'y' can be 2 or 4 digits.
                                extractedVal = obtainNumericPart(sourceValue, parsingIndex, yearMinLen, yearMaxLen);
                                if (!extractedVal) return null;
                                yr = parseInt(extractedVal, 10);
                                parsingIndex += extractedVal.length;
                                // Adjust 2-digit years to full year (e.g., 99 -> 1999, 01 -> 2001).
                                if (extractedVal.length === 2) {
                                    yr = (yr > 70) ? (1900 + yr) : (2000 + yr);
                                }
                                break;
                            case 'MMMM': // Full month name.
                                mth = 0;
                                for (let k = 0, fullName; (fullName = _localizationConfig.datePatterns.fullMonths[k]); k++) {
                                    const segmentToCheck = sourceValue.substring(parsingIndex, parsingIndex + fullName.length);
                                    if (segmentToCheck.toLowerCase() === fullName.toLowerCase()) {
                                        mth = k + 1;
                                        parsingIndex += fullName.length;
                                        break;
                                    }
                                }
                                if (mth === 0) return null; // Month name not found in input.
                                break;
                            case 'MMM': // Short month name.
                                mth = 0;
                                for (let k = 0, shortName; (shortName = _localizationConfig.datePatterns.shortMonths[k]); k++) {
                                    const segmentToCheck = sourceValue.substring(parsingIndex, parsingIndex + shortName.length);
                                    if (segmentToCheck.toLowerCase() === shortName.toLowerCase()) {
                                        mth = k + 1;
                                        parsingIndex += shortName.length;
                                        break;
                                    }
                                }
                                if (mth === 0) return null; // Short month name not found.
                                break;
                            case 'DDDD': // Full day name (e.g., 'EEEE' in original).
                                // Day names are parsed but not stored, as Date object determines day from year/month/day.
                                let foundFullDay = BOOLEAN_FALSE;
                                for (let k = 0, dayName; (dayName = _localizationConfig.datePatterns.fullDays[k]); k++) {
                                    const segmentToCheck = sourceValue.substring(parsingIndex, parsingIndex + dayName.length);
                                    if (segmentToCheck.toLowerCase() === dayName.toLowerCase()) {
                                        parsingIndex += dayName.length;
                                        foundFullDay = BOOLEAN_TRUE;
                                        break;
                                    }
                                }
                                if (!foundFullDay && tokenBuffer.length > 0) return null; // If token was expected but not found.
                                break;
                            case 'DDD': // Short day name (e.g., 'EEE' in original).
                                let foundShortDay = BOOLEAN_FALSE;
                                for (let k = 0, dayName; (dayName = _localizationConfig.datePatterns.shortDays[k]); k++) {
                                    const segmentToCheck = sourceValue.substring(parsingIndex, parsingIndex + dayName.length);
                                    if (segmentToCheck.toLowerCase() === dayName.toLowerCase()) {
                                        parsingIndex += dayName.length;
                                        foundShortDay = BOOLEAN_TRUE;
                                        break;
                                    }
                                }
                                if (!foundShortDay && tokenBuffer.length > 0) return null;
                                break;
                            case 'MM':
                            case 'M':
                                extractedVal = obtainNumericPart(sourceValue, parsingIndex, (tokenBuffer.length === 2 ? 2 : 1), 2);
                                if (!extractedVal || extractedVal < 1 || extractedVal > 12) return null;
                                mth = parseInt(extractedVal, 10);
                                parsingIndex += extractedVal.length;
                                break;
                            case 'dd':
                            case 'd':
                                extractedVal = obtainNumericPart(sourceValue, parsingIndex, (tokenBuffer.length === 2 ? 2 : 1), 2);
                                if (!extractedVal || extractedVal < 1 || extractedVal > 31) return null;
                                day = parseInt(extractedVal, 10);
                                parsingIndex += extractedVal.length;
                                break;
                            case 'hh':
                            case 'h': // 1-12 hour format (AM/PM).
                                extractedVal = obtainNumericPart(sourceValue, parsingIndex, (tokenBuffer.length === 2 ? 2 : 1), 2);
                                if (!extractedVal || extractedVal < 1 || extractedVal > 12) return null;
                                hrs = parseInt(extractedVal, 10);
                                parsingIndex += extractedVal.length;
                                break;
                            case 'HH':
                            case 'H': // 0-23 hour format.
                                extractedVal = obtainNumericPart(sourceValue, parsingIndex, (tokenBuffer.length === 2 ? 2 : 1), 2);
                                if (!extractedVal || extractedVal < 0 || extractedVal > 23) return null;
                                hrs = parseInt(extractedVal, 10);
                                parsingIndex += extractedVal.length;
                                break;
                            case 'KK':
                            case 'K': // 0-11 hour format (AM/PM).
                                extractedVal = obtainNumericPart(sourceValue, parsingIndex, (tokenBuffer.length === 2 ? 2 : 1), 2);
                                if (!extractedVal || extractedVal < 0 || extractedVal > 11) return null;
                                hrs = parseInt(extractedVal, 10);
                                parsingIndex += extractedVal.length;
                                break;
                            case 'kk':
                            case 'k': // 1-24 hour format.
                                extractedVal = obtainNumericPart(sourceValue, parsingIndex, (tokenBuffer.length === 2 ? 2 : 1), 2);
                                if (!extractedVal || extractedVal < 1 || extractedVal > 24) return null;
                                hrs = parseInt(extractedVal, 10) - 1; // Convert to 0-23.
                                parsingIndex += extractedVal.length;
                                break;
                            case 'mm':
                            case 'm': // Minutes.
                                extractedVal = obtainNumericPart(sourceValue, parsingIndex, (tokenBuffer.length === 2 ? 2 : 1), 2);
                                if (!extractedVal || extractedVal < 0 || extractedVal > 59) return null;
                                mins = parseInt(extractedVal, 10);
                                parsingIndex += extractedVal.length;
                                break;
                            case 'ss':
                            case 's': // Seconds.
                                extractedVal = obtainNumericPart(sourceValue, parsingIndex, (tokenBuffer.length === 2 ? 2 : 1), 2);
                                if (!extractedVal || extractedVal < 0 || extractedVal > 59) return null;
                                secs = parseInt(extractedVal, 10);
                                parsingIndex += extractedVal.length;
                                break;
                            case 'SSS':
                            case 'SS':
                            case 'S': // Milliseconds.
                                extractedVal = obtainNumericPart(sourceValue, parsingIndex, (tokenBuffer.length === 3 ? 3 : (tokenBuffer.length === 2 ? 2 : 1)), 3);
                                if (!extractedVal || extractedVal < 0 || extractedVal > 999) return null;
                                millis = parseInt(extractedVal, 10);
                                parsingIndex += extractedVal.length;
                                break;
                            case 'a': // AM/PM indicator.
                                const ampmSegment = sourceValue.substring(parsingIndex, parsingIndex + 2).toLowerCase();
                                if (ampmSegment === 'am') {
                                    ampmIndicator = 'AM';
                                } else if (ampmSegment === 'pm') {
                                    ampmIndicator = 'PM';
                                } else {
                                    return null; // Invalid AM/PM segment.
                                }
                                parsingIndex += 2;
                                break;
                            default: // Literal characters.
                                // If the token is not recognized as a date part, treat it as a literal.
                                const literalSegment = sourceValue.substring(parsingIndex, parsingIndex + tokenBuffer.length);
                                if (literalSegment !== tokenBuffer) {
                                    return null; // Mismatch with literal characters in the format.
                                }
                                parsingIndex += tokenBuffer.length;
                                break;
                        }
                    }

                    // Final validation: ensure the entire input string was consumed.
                    if (parsingIndex !== sourceValue.length) {
                        return null; // Input string has unparsed trailing characters.
                    }

                    // Adjust hours based on AM/PM, if applicable.
                    if (ampmIndicator === 'PM' && hrs < 12) {
                        hrs += 12;
                    } else if (ampmIndicator === 'AM' && hrs === 12) { // Midnight case: 12 AM -> 0 hours.
                        hrs = 0;
                    }

                    // Perform additional date validity checks (e.g., days in month).
                    // Create a temporary date to check for overflows (e.g., Feb 30).
                    const tempDateCheck = new Date(yr, mth - 1, day);
                    if (tempDateCheck.getFullYear() !== yr || tempDateCheck.getMonth() !== mth - 1 || tempDateCheck.getDate() !== day) {
                        return null; // The day/month combination was invalid (e.g., Feb 30).
                    }

                    // Construct and return the parsed Date object.
                    return new Date(yr, mth - 1, day, hrs, mins, secs, millis);

                } else if (sourceValue instanceof Date) { // Formatting a Date object.

                    // Check for invalid Date object (e.g., new Date('invalid string')).
                    if (isNaN(sourceValue.getTime())) {
                        console.warn("Attempted to format an invalid Date object.");
                        return null;
                    }

                    const currentPattern = pattern || _localizationConfig.datePatterns.defaultFormat;

                    // Extract all date components from the Date object.
                    const currentYear = sourceValue.getFullYear();
                    const currentMonth = sourceValue.getMonth() + 1; // 1-indexed month.
                    const currentDayOfMonth = sourceValue.getDate();
                    const currentDayOfWeek = sourceValue.getDay(); // 0 (Sunday) to 6 (Saturday).
                    const currentHours24 = sourceValue.getHours();
                    const currentMinutes = sourceValue.getMinutes();
                    const currentSeconds = sourceValue.getSeconds();
                    const currentMilliseconds = sourceValue.getMilliseconds();

                    // Prepare an object to map tokens to their formatted values for quick lookup.
                    const formatValueMap = {};

                    // Year components.
                    formatValueMap['y'] = currentYear;
                    formatValueMap['yy'] = padWithZeros(currentYear % 100, 2);
                    formatValueMap['yyyy'] = padWithZeros(currentYear, 4);

                    // Month components.
                    formatValueMap['M'] = currentMonth;
                    formatValueMap['MM'] = padWithZeros(currentMonth, 2);
                    formatValueMap['MMM'] = _localizationConfig.datePatterns.shortMonths[currentMonth - 1];
                    formatValueMap['MMMM'] = _localizationConfig.datePatterns.fullMonths[currentMonth - 1];

                    // Day of month components.
                    formatValueMap['d'] = currentDayOfMonth;
                    formatValueMap['dd'] = padWithZeros(currentDayOfMonth, 2);

                    // Day of week components (DDD/DDDD corresponds to EEE/EEEE in original).
                    formatValueMap['DDD'] = _localizationConfig.datePatterns.shortDays[currentDayOfWeek];
                    formatValueMap['DDDD'] = _localizationConfig.datePatterns.fullDays[currentDayOfWeek];

                    // Hour components.
                    formatValueMap['H'] = currentHours24;
                    formatValueMap['HH'] = padWithZeros(currentHours24, 2);

                    // 12-hour format (h, hh).
                    let hours12 = currentHours24 % 12;
                    if (hours12 === 0) hours12 = 12; // 0 hours (midnight) becomes 12 AM, 12 hours (noon) becomes 12 PM.
                    formatValueMap['h'] = hours12;
                    formatValueMap['hh'] = padWithZeros(hours12, 2);

                    // 0-11 hour format (K, KK).
                    const hours0_11 = currentHours24 % 12;
                    formatValueMap['K'] = hours0_11;
                    formatValueMap['KK'] = padWithZeros(hours0_11, 2);

                    // 1-24 hour format (k, kk).
                    const hours1_24 = currentHours24 === 0 ? 24 : currentHours24; // 0 becomes 24, others stay the same.
                    formatValueMap['k'] = hours1_24;
                    formatValueMap['kk'] = padWithZeros(hours1_24, 2);

                    // AM/PM indicator.
                    formatValueMap['a'] = (currentHours24 >= 12) ? 'PM' : 'AM';

                    // Minute components.
                    formatValueMap['m'] = currentMinutes;
                    formatValueMap['mm'] = padWithZeros(currentMinutes, 2);

                    // Second components.
                    formatValueMap['s'] = currentSeconds;
                    formatValueMap['ss'] = padWithZeros(currentSeconds, 2);

                    // Millisecond components.
                    formatValueMap['S'] = currentMilliseconds;
                    formatValueMap['SS'] = padWithZeros(currentMilliseconds, 2); // Pad to 2 digits.
                    formatValueMap['SSS'] = padWithZeros(currentMilliseconds, 3); // Pad to 3 digits.

                    let outputAccumulator = ''; // Stores the final formatted string.
                    let formatPatternIterator = 0;
                    let currentPatternChar = '';
                    let formatToken = '';
                    let inQuoteLiteral = BOOLEAN_FALSE; // Flag for handling quoted literal sections.

                    // Iterate through the format pattern to build the output string.
                    while (formatPatternIterator < currentPattern.length) {
                        formatToken = '';
                        currentPatternChar = currentPattern.charAt(formatPatternIterator);

                        if (currentPatternChar === '\'') { // Handle quoted literals.
                            formatPatternIterator++;
                            // If two quotes, it's an escaped quote, otherwise toggle literal mode.
                            if (currentPattern.charAt(formatPatternIterator) === '\'') {
                                outputAccumulator += '\'';
                                formatPatternIterator++;
                            } else {
                                inQuoteLiteral = !inQuoteLiteral;
                            }
                        } else {
                            // Collect consecutive identical characters for a token.
                            while (currentPattern.charAt(formatPatternIterator) === currentPatternChar && formatPatternIterator < currentPattern.length) {
                                formatToken += currentPattern.charAt(formatPatternIterator++);
                            }

                            // Again, special handling for long month/day names to match parsing logic.
                            if (formatToken.includes('MMMM') && formatToken.length > 4) {
                                formatToken = 'MMMM';
                            }
                            if (formatToken.includes('DDDD') && formatToken.length > 4) {
                                formatToken = 'DDDD';
                            }

                            // Append formatted value or the token itself if in literal mode or not a recognized token.
                            // Use `hasOwnProperty` for robustness against inherited properties.
                            if (Object.prototype.hasOwnProperty.call(formatValueMap, formatToken) && !inQuoteLiteral) {
                                outputAccumulator += formatValueMap[formatToken];
                            } else {
                                outputAccumulator += formatToken;
                            }
                        }
                    }
                    return outputAccumulator;
                } else {
                    // Invalid input type for date processing.
                    console.error("Invalid input type for date processing. Expected string or Date object.");
                    return null;
                }
            },

            /**
             * Formats or parses a numeric value based on a specified pattern.
             * @param {string|number} sourceNumericValue - The number string to parse or number to format.
             * @param {string} [pattern] - The format pattern string.
             * @returns {number|string|null} A number if parsing, a formatted string if formatting, or null on failure.
             */
            processNumber: function (sourceNumericValue, pattern) {

                // Guard for invalid or non-numeric input.
                if (sourceNumericValue === null || sourceNumericValue === undefined) {
                    return null;
                }

                if (typeof sourceNumericValue === 'string') { // Parsing a number string.

                    const currentGroupDelimiter = _localizationConfig.numberFormats.digitGroupingSeparator;
                    const currentDecimalMark = _localizationConfig.numberFormats.decimalPointSeparator;

                    // Remove grouping separators and replace decimal separator with standard dot for parseFloat.
                    let cleanedString = sourceNumericValue.replace(new RegExp('\\' + currentGroupDelimiter, 'g'), '');
                    cleanedString = cleanedString.replace(new RegExp('\\' + currentDecimalMark), '.');

                    // Use parseFloat for robust conversion, handling both integers and decimals.
                    const parsedNumber = parseFloat(cleanedString);

                    // Check for NaN resulting from parsing.
                    if (isNaN(parsedNumber)) {
                        console.warn(`Failed to parse numeric string: "${sourceNumericValue}"`);
                        return null;
                    }

                    return parsedNumber;

                } else if (typeof sourceNumericValue === 'number') { // Formatting a number.

                    // Guard for NaN or Infinity values; format them as their string representations.
                    if (isNaN(sourceNumericValue) || !isFinite(sourceNumericValue)) {
                        return String(sourceNumericValue); // Returns "NaN" or "Infinity".
                    }

                    const currentPattern = pattern || _localizationConfig.numberFormats.defaultFormat;

                    const currentGroupDelimiter = _localizationConfig.numberFormats.digitGroupingSeparator;
                    const currentDecimalMark = _localizationConfig.numberFormats.decimalPointSeparator;

                    let integerSection = '';
                    let fractionalSection = '';
                    let groupDelimiterPosition = currentPattern.lastIndexOf(currentGroupDelimiter);
                    let decimalPointPosition = currentPattern.indexOf(currentDecimalMark);

                    // Determine fractional part formatting.
                    if (decimalPointPosition !== -1) {
                        let minFractionDigits = currentPattern.substring(decimalPointPosition + 1).replace(/#/g, '').length;
                        let maxFractionDigits = currentPattern.substring(decimalPointPosition + 1).length;

                        // Round the number to the maximum required fraction digits before splitting.
                        // This prevents floating point inaccuracies from affecting rounding later.
                        let roundedValue = sourceNumericValue.toFixed(maxFractionDigits);
                        let parts = String(roundedValue).split('.');

                        integerSection = parts[0];
                        let actualFraction = parts[1] || '';

                        // Pad or truncate actual fraction based on min/max digits.
                        if (actualFraction.length < minFractionDigits) {
                            actualFraction = padWithZeros(actualFraction, minFractionDigits);
                        } else if (actualFraction.length > maxFractionDigits) {
                            actualFraction = actualFraction.substring(0, maxFractionDigits);
                        }

                        // Remove trailing zeros if '#' is used in the format, but respect minimum digits.
                        let formattedFraction = '';
                        for (let i = actualFraction.length - 1; i >= 0; i--) {
                            // If it's an optional zero ('#') and we are beyond the minimum required digits, skip it.
                            if (actualFraction[i] === '0' && (decimalPointPosition + 1 + i < currentPattern.length) && currentPattern[decimalPointPosition + 1 + i] === '#' && i >= minFractionDigits) {
                                continue;
                            }
                            formattedFraction = actualFraction[i] + formattedFraction;
                        }

                        if (formattedFraction.length > 0) {
                            fractionalSection = currentDecimalMark + formattedFraction;
                        }
                    } else {
                        // No decimal part in format, so round the number for the integer part.
                        integerSection = String(Math.round(sourceNumericValue));
                    }

                    // Determine integer part formatting (grouping and padding).
                    if (integerSection.length > 0) {
                        let groupingSize = 0;
                        if (groupDelimiterPosition !== -1) {
                            // Calculate grouping size based on the format string.
                            // e.g., in '#,##0', grouping size is 3 (before the 0).
                            const relevantIntegerPattern = (decimalPointPosition !== -1) ?
                                currentPattern.substring(0, decimalPointPosition) :
                                currentPattern;
                            groupingSize = relevantIntegerPattern.length - groupDelimiterPosition - 1;
                        }

                        if (groupingSize > 0) {
                            let tempInteger = '';
                            let digitCount = 0;
                            // Iterate from right to left to apply grouping.
                            for (let i = integerSection.length - 1; i >= 0; i--) {
                                tempInteger = integerSection.charAt(i) + tempInteger;
                                digitCount++;
                                if (digitCount % groupingSize === 0 && i !== 0) {
                                    tempInteger = currentGroupDelimiter + tempInteger;
                                }
                            }
                            integerSection = tempInteger;
                        }

                        // Pad integer part with leading zeros if format requires (e.g., '000').
                        const minIntegerDigits = currentPattern.substring(0, decimalPointPosition === -1 ? currentPattern.length : decimalPointPosition)
                                                            .replace(new RegExp('[#\\' + currentGroupDelimiter + ']', 'g'), '')
                                                            .length;
                        // Only pad if the current integer section is shorter than the required minimum.
                        if (integerSection.length < minIntegerDigits) {
                            integerSection = padWithZeros(integerSection, minIntegerDigits);
                        }
                    }

                    // Combine integer and fractional parts to form the final result.
                    return integerSection + fractionalSection;
                } else {
                    // Invalid input type for number processing.
                    console.error("Invalid input type for number processing. Expected string or number.");
                    return null;
                }
            }
        };

    })(); // End of IIFE for externalLib.formatter

}(jQuery)); // Pass jQuery as externalLib