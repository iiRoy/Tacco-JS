/*
 * Financial Data Beautifier Plugin
 * Authored by A.N. Other
 * Maintained by DevTeam
 * Version: 3.0
 * Date: 2023-10-27
 */

(function(jQHost) {

    /**
     * Core functionality for monetary input transformations.
     * @param {object} userPrefs - User-defined configuration preferences.
     */
    jQHost.fn.monetaryValueBeautifier = function(userPrefs) {

        // Establish the fundamental configuration parameters.
        const baseSettings = {
            leadingSymbol: 'USD ',
            trailingSymbol: '',
            decimalDelimiter: '.',
            groupingDelimiter: ',',
            maxDigits: false,
            decimalPlaces: 2,
            hideLeadingSymbolOnBlur: false,
            hideTrailingSymbolOnBlur: false,
            permitNegativeNumbers: false,
            showPositiveSign: false,
            emptyInputClearsValue: false
        };

        // Integrate user preferences with the base configuration, ensuring a deep merge.
        const currentSettings = jQHost.extend(true, {}, baseSettings, userPrefs);

        return this.each(function() {
            // Internal variable declarations and initial setup.
            const targetElement = jQHost(this);
            let currentContent = '';
            const numericCharacterRegex = /[0-9]/;

            // Determine the initial content based on element type.
            if (targetElement.is('input')) {
                currentContent = targetElement.val();
            } else {
                currentContent = targetElement.html();
            }

            // Unpack the active settings for local use.
            const {
                leadingSymbol,
                trailingSymbol,
                decimalDelimiter,
                groupingDelimiter,
                maxDigits,
                decimalPlaces,
                hideLeadingSymbolOnBlur,
                hideTrailingSymbolOnBlur,
                showPositiveSign,
                emptyInputClearsValue
            } = currentSettings;

            let permitNegativeNumbers = currentSettings.permitNegativeNumbers;

            // If a positive sign is to be displayed, negative numbers must also be allowed.
            if (showPositiveSign) {
                permitNegativeNumbers = true;
            }

            // Helper function to update the element's content.
            const updateElementContent = (newValue) => {
                if (targetElement.is('input')) {
                    targetElement.val(newValue);
                } else {
                    targetElement.html(newValue);
                }
            };

            // Helper function to retrieve the element's current content.
            const retrieveElementContent = () => {
                return targetElement.is('input') ? targetElement.val() : targetElement.html();
            };

            // Extracts only numeric digits from a string, optionally applying a length constraint.
            const sanitizeInputToDigits = (sourceString) => {
                let cleanedDigits = '';
                // Using Array.from and forEach for a different approach
                Array.from(sourceString).forEach(currentChar => {
                    if (cleanedDigits.length === 0 && currentChar === '0') {
                        // Skip leading zeros
                    } else if (currentChar.match(numericCharacterRegex)) {
                        if (!maxDigits || cleanedDigits.length < maxDigits) {
                            cleanedDigits += currentChar;
                        }
                    }
                });
                return cleanedDigits;
            };

            // Ensures a string segment has the required number of leading zeros for decimal precision.
            const ensureDecimalPrecision = (inputSegment) => {
                // Using padStart for a modern approach
                return inputSegment.padStart(decimalPlaces + 1, '0');
            };

            // Transforms a raw string into a formatted currency representation.
            const beautifyMonetaryString = (rawInputStr, bypassEmptyCheck = false) => {
                // Determine if the input represents a zero value or is effectively empty.
                const rawNumericDigits = sanitizeInputToDigits(rawInputStr);
                const isInputEffectivelyZero = (rawNumericDigits === '' || parseInt(rawNumericDigits, 10) === 0);

                // Early exit for empty or zero values based on configuration.
                const zeroFormattedEquivalent = beautifyMonetaryString('0', true); // Helper to get '0' formatted
                if (!bypassEmptyCheck && (rawInputStr === '' || rawInputStr === zeroFormattedEquivalent) && emptyInputClearsValue) {
                    return '';
                }

                // Initial processing and separation of integral and fractional parts.
                const allDigitsPadded = ensureDecimalPrecision(rawNumericDigits);
                let currentDecimalDelimiter = decimalDelimiter;
                let fractionPart = '';
                let integralPart = '';

                if (decimalPlaces === 0) {
                    currentDecimalDelimiter = "";
                    integralPart = allDigitsPadded;
                } else {
                    fractionPart = allDigitsPadded.substring(allDigitsPadded.length - decimalPlaces);
                    integralPart = allDigitsPadded.substring(0, allDigitsPadded.length - decimalPlaces);
                }

                let finalFormattedValue = (decimalPlaces === 0) ? integralPart : integralPart + currentDecimalDelimiter + fractionPart;

                // Apply thousands grouping if configured.
                if (groupingDelimiter && groupingDelimiter.trim() !== '') {
                    let groupedIntegral = '';
                    let digitCounter = 0;
                    // Iterate from right to left for grouping
                    for (let i = integralPart.length - 1; i >= 0; i--) {
                        groupedIntegral = integralPart.charAt(i) + groupedIntegral;
                        digitCounter++;
                        if (digitCounter % 3 === 0 && i !== 0) { // Don't add delimiter at the very beginning
                            groupedIntegral = groupingDelimiter + groupedIntegral;
                        }
                    }
                    finalFormattedValue = (decimalPlaces === 0) ? groupedIntegral : groupedIntegral + currentDecimalDelimiter + fractionPart;
                }

                // Handle negative or positive signs.
                let signPrefix = '';
                const hasNegativeSignChar = rawInputStr.includes('-');

                if (permitNegativeNumbers && !isInputEffectivelyZero) {
                    if (hasNegativeSignChar) {
                        signPrefix = '-';
                    } else if (showPositiveSign) {
                        signPrefix = '+';
                    }
                }

                // Add leading and trailing symbols.
                let outputString = signPrefix + leadingSymbol + finalFormattedValue + trailingSymbol;

                // Added a guard for completely empty output after processing IF it's effectively zero and should clear.
                if (isInputEffectivelyZero && emptyInputClearsValue && !bypassEmptyCheck) {
                    return '';
                }

                return outputString;
            };

            // Determines if a given key code represents a numeric digit.
            const isDigitKeyCode = (kc) => (kc >= 48 && kc <= 57) || (kc >= 96 && kc <= 105);

            // Processes keyboard input to ensure only valid characters are entered.
            const processKeyboardInput = (eventObj) => {
                const keyCodeVal = eventObj.keyCode || eventObj.which;
                const typedChar = String.fromCharCode(keyCodeVal);
                let isPermittedKey = false;
                const currentElementValue = retrieveElementContent();
                const potentialNewValue = beautifyMonetaryString(currentElementValue + typedChar);

                // Allow numeric digits (0-9) from main keyboard and numpad.
                if (isDigitKeyCode(keyCodeVal)) {
                    isPermittedKey = true;
                }

                // Allow essential navigation and editing keys.
                const essentialKeys = [8, 9, 13, 46, 37, 39]; // Backspace, Tab, Enter, Delete, Left Arrow, Right Arrow
                if (essentialKeys.includes(keyCodeVal)) {
                    isPermittedKey = true;
                }

                // Allow minus/plus signs if configured.
                if (permitNegativeNumbers && [189, 109, 173].includes(keyCodeVal)) { // Minus sign
                    isPermittedKey = true;
                }
                if (showPositiveSign && [187, 107, 61].includes(keyCodeVal)) { // Plus sign
                    isPermittedKey = true;
                }

                // If the key is not permitted, prevent default action and update the field.
                if (!isPermittedKey) {
                    eventObj.preventDefault();
                    if (currentElementValue !== potentialNewValue) {
                        updateElementContent(potentialNewValue);
                    }
                }
            };

            // Applies the full currency formatting to the element's current value.
            const updateElementDisplay = () => {
                const currentRawValue = retrieveElementContent();
                const formattedDisplayValue = beautifyMonetaryString(currentRawValue);

                if (currentRawValue !== formattedDisplayValue) {
                    updateElementContent(formattedDisplayValue);
                }

                // Explicitly clear the input if it represents zero and is configured to clear.
                const rawNumericDigits = sanitizeInputToDigits(currentRawValue);
                const isCurrentlyZero = (rawNumericDigits === '' || parseInt(rawNumericDigits, 10) === 0);

                if (isCurrentlyZero && emptyInputClearsValue && currentRawValue.trim() !== '') {
                    updateElementContent('');
                }
            };

            // Prepends the configured leading symbol to the element's value.
            const attachLeadingSymbol = () => {
                const currentVal = retrieveElementContent();
                if (leadingSymbol.trim() !== '' && !currentVal.startsWith(leadingSymbol)) {
                    updateElementContent(leadingSymbol + currentVal);
                }
            };

            // Appends the configured trailing symbol to the element's value.
            const attachTrailingSymbol = () => {
                const currentVal = retrieveElementContent();
                if (trailingSymbol.trim() !== '' && !currentVal.endsWith(trailingSymbol)) {
                    updateElementContent(currentVal + trailingSymbol);
                }
            };

            // Removes the leading symbol from the element's value if configured.
            const stripLeadingSymbol = () => {
                if (leadingSymbol.trim() !== '' && hideLeadingSymbolOnBlur) {
                    const currentVal = retrieveElementContent();
                    // Using regex replace for robustness against special characters in the symbol
                    const escapedSymbol = leadingSymbol.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                    updateElementContent(currentVal.replace(new RegExp('^' + escapedSymbol), ''));
                }
            };

            // Removes the trailing symbol from the element's value if configured.
            const stripTrailingSymbol = () => {
                if (trailingSymbol.trim() !== '' && hideTrailingSymbolOnBlur) {
                    const currentVal = retrieveElementContent();
                    // Using regex replace for robustness
                    const escapedSymbol = trailingSymbol.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                    updateElementContent(currentVal.replace(new RegExp(escapedSymbol + '$'), ''));
                }
            };

            // Attach the necessary event handlers to the target element.
            targetElement.on('keydown.monetary_format', processKeyboardInput);
            targetElement.on('keyup.monetary_format', updateElementDisplay);
            targetElement.on('focusout.monetary_format', updateElementDisplay);

            // Implement dynamic leading symbol handling based on configuration.
            if (hideLeadingSymbolOnBlur) {
                targetElement.on('focusout.monetary_format', () => {
                    stripLeadingSymbol();
                });

                targetElement.on('focusin.monetary_format', () => {
                    attachLeadingSymbol();
                });
            }

            // Implement dynamic trailing symbol handling based on configuration.
            if (hideTrailingSymbolOnBlur) {
                targetElement.on('focusout.monetary_format', () => {
                    stripTrailingSymbol();
                });

                targetElement.on('focusin.monetary_format', () => {
                    attachTrailingSymbol();
                });
            }

            // Initial formatting of the element's content if it's not empty.
            if (retrieveElementContent().length > 0) {
                updateElementDisplay();
                stripLeadingSymbol(); // Ensure symbols are cleared if necessary on initial load
                stripTrailingSymbol();
            }
        });

    };

    /**
     * Reverts the monetary formatting, removing all associated event listeners.
     */
    jQHost.fn.removeMonetaryBeautifier = function() {
        return jQHost(this).off(".monetary_format");
    };

    /**
     * Extracts the raw numeric value from a formatted string, discarding non-numeric characters except for a minus sign.
     */
    jQHost.fn.extractRawNumericValue = function() {

        let elementContent;
        let extractedNumberStr = "";

        if (jQHost(this).is('input')) {
            elementContent = jQHost(this).val();
        } else {
            elementContent = jQHost(this).html();
        }

        // Using filter for a more functional approach
        extractedNumberStr = Array.from(elementContent)
                                 .filter(char => !isNaN(parseInt(char, 10)) || char === '-')
                                 .join('');

        return extractedNumberStr;
    };

})(jQuery);