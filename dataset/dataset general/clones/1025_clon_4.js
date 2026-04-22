(function() {

    const defaultMoneyDisplaySettings = {
        displayPrefix: '$',
        displaySuffix: '',
        decimalSeparator: '.',
        groupSeparator: ',',
        maximumInputLength: null,
        decimalDigits: 2,
        stripPrefixOnBlur: false,
        stripSuffixOnBlur: false,
        allowNegativeNumbers: false,
        showPositiveSign: false,
        resetOnZeroValue: false
    };

    class NumericInputProcessor {
        constructor(domElement, customConfiguration) {
            this.targetElement = domElement;
            this.activeConfiguration = { ...defaultMoneyDisplaySettings, ...customConfiguration };

            if (this.activeConfiguration.showPositiveSign) {
                this.activeConfiguration.allowNegativeNumbers = true;
            }

            this.eventHandlers = {
                inputChange: this.handleInputChange.bind(this),
                keyPressFilter: this.handleKeyPressFilter.bind(this),
                focusExit: this.handleFocusExit.bind(this),
                focusEntry: this.handleFocusEntry.bind(this)
            };

            this.attachEventListeners();
            this.performInitialDisplayAdjustment();
        }

        getDisplayValue() {
            return this.targetElement.value !== undefined ? this.targetElement.value : this.targetElement.textContent;
        }

        setDisplayValue(newValue) {
            if (this.targetElement.value !== undefined) {
                this.targetElement.value = newValue;
            } else {
                this.targetElement.textContent = newValue;
            }
        }

        // Core formatting method
        formatNumericString(rawInputContent, bypassResetCheck) {
            if (!bypassResetCheck && (rawInputContent === '' || this.formatNumericString('0', true) === rawInputContent) && this.activeConfiguration.resetOnZeroValue) {
                return '';
            }

            let processingContent = rawInputContent;
            let isNegativeDetected = false;
            let isExplicitPositiveDetected = false;

            const initialSignMatch = processingContent.match(/^[+-]/);
            if (initialSignMatch) {
                if (initialSignMatch[0] === '-' && this.activeConfiguration.allowNegativeNumbers) {
                    isNegativeDetected = true;
                } else if (initialSignMatch[0] === '+' && this.activeConfiguration.showPositiveSign) {
                    isExplicitPositiveDetected = true;
                }
                processingContent = processingContent.substring(1); // Remove sign for digit extraction
            }

            let digitSequence = this.extractPureDigits(processingContent);

            if (digitSequence === '') {
                digitSequence = '0';
            }

            digitSequence = digitSequence.padStart(this.activeConfiguration.decimalDigits + 1, '0');

            let integerComponent = digitSequence.slice(0, -this.activeConfiguration.decimalDigits);
            let decimalComponent = digitSequence.slice(-this.activeConfiguration.decimalDigits);

            if (this.activeConfiguration.groupSeparator && String(this.activeConfiguration.groupSeparator).trim() !== '') {
                integerComponent = integerComponent.replace(/\B(?=(\d{3})+(?!\d))/g, this.activeConfiguration.groupSeparator);
            }

            let combinedResult;
            if (this.activeConfiguration.decimalDigits === 0) {
                combinedResult = integerComponent;
            } else {
                combinedResult = integerComponent + this.activeConfiguration.decimalSeparator + decimalComponent;
            }

            let finalSignPrefix = '';
            const numericalValue = parseFloat(this.removeFormatting(combinedResult));

            if (isNegativeDetected) {
                finalSignPrefix = '-';
            } else if (isExplicitPositiveDetected && this.activeConfiguration.showPositiveSign) {
                finalSignPrefix = '+';
            } else if (this.activeConfiguration.showPositiveSign && numericalValue !== 0) {
                finalSignPrefix = '+';
            }

            combinedResult = finalSignPrefix + combinedResult;

            return this.activeConfiguration.displayPrefix + combinedResult + this.activeConfiguration.displaySuffix;
        }

        extractPureDigits(sourceString) {
            let collectedDigits = '';
            for (let i = 0; i < sourceString.length; i++) {
                const currentCharacter = sourceString.charAt(i);

                if (currentCharacter.match(/[0-9]/)) {
                    if (collectedDigits.length === 0 && currentCharacter === '0') {
                        continue; // Skip leading zeros
                    }

                    if (this.activeConfiguration.maximumInputLength === null || collectedDigits.length < this.activeConfiguration.maximumInputLength) {
                        collectedDigits += currentCharacter;
                    }
                }
            }
            return collectedDigits;
        }

        handleKeyPressFilter(event) {
            const charCode = event.keyCode || event.which;
            let isKeyPermitted = false;

            if ((charCode >= 48 && charCode <= 57) || (charCode >= 96 && charCode <= 105)) {
                isKeyPermitted = true;
            } else if ([8, 9, 13, 46, 37, 39].includes(charCode)) { // Backspace, Tab, Enter, Delete, Left/Right
                isKeyPermitted = true;
            } else if (this.activeConfiguration.allowNegativeNumbers && [189, 109, 173].includes(charCode)) { // Minus
                isKeyPermitted = true;
            } else if (this.activeConfiguration.showPositiveSign && [187, 107, 61].includes(charCode)) { // Plus
                isKeyPermitted = true;
            }

            if (!isKeyPermitted) {
                event.preventDefault();
                event.stopPropagation();
            }
        }

        handleInputChange() {
            const currentContent = this.getDisplayValue();
            const formattedContent = this.formatNumericString(currentContent);
            if (currentContent !== formattedContent) {
                this.setDisplayValue(formattedContent);
            }
            if (parseFloat(this.removeFormatting(currentContent)) === 0.0 && this.activeConfiguration.resetOnZeroValue) {
                this.setDisplayValue('');
            }
        }

        handleFocusExit() {
            const currentContent = this.getDisplayValue();
            const formattedContent = this.formatNumericString(currentContent);
            if (currentContent !== formattedContent) {
                this.setDisplayValue(formattedContent);
            }

            if (parseFloat(this.removeFormatting(currentContent)) === 0.0 && this.activeConfiguration.resetOnZeroValue) {
                this.setDisplayValue('');
            }

            if (this.activeConfiguration.stripPrefixOnBlur && String(this.activeConfiguration.displayPrefix).trim() !== '') {
                let currentVal = this.getDisplayValue();
                if (currentVal.startsWith(this.activeConfiguration.displayPrefix)) {
                    this.setDisplayValue(currentVal.substring(this.activeConfiguration.displayPrefix.length));
                }
            }
            if (this.activeConfiguration.stripSuffixOnBlur && String(this.activeConfiguration.displaySuffix).trim() !== '') {
                let currentVal = this.getDisplayValue();
                if (currentVal.endsWith(this.activeConfiguration.displaySuffix)) {
                    this.setDisplayValue(currentVal.substring(0, currentVal.length - this.activeConfiguration.displaySuffix.length));
                }
            }
        }

        handleFocusEntry() {
            if (this.activeConfiguration.stripPrefixOnBlur && String(this.activeConfiguration.displayPrefix).trim() !== '') {
                let currentVal = this.getDisplayValue();
                if (!currentVal.startsWith(this.activeConfiguration.displayPrefix)) {
                    this.setDisplayValue(this.activeConfiguration.displayPrefix + currentVal);
                }
            }
            if (this.activeConfiguration.stripSuffixOnBlur && String(this.activeConfiguration.displaySuffix).trim() !== '') {
                let currentVal = this.getDisplayValue();
                if (!currentVal.endsWith(this.activeConfiguration.displaySuffix)) {
                    this.setDisplayValue(currentVal + this.activeConfiguration.displaySuffix);
                }
            }
        }

        attachEventListeners() {
            this.targetElement.addEventListener('input', this.eventHandlers.inputChange);
            this.targetElement.addEventListener('keydown', this.eventHandlers.keyPressFilter);
            this.targetElement.addEventListener('focusout', this.eventHandlers.focusExit);
            this.targetElement.addEventListener('focusin', this.eventHandlers.focusEntry);
        }

        performInitialDisplayAdjustment() {
            const initialValue = this.getDisplayValue();
            if (initialValue.length > 0) {
                this.setDisplayValue(this.formatNumericString(initialValue));
                if (this.activeConfiguration.stripPrefixOnBlur && String(this.activeConfiguration.displayPrefix).trim() !== '') {
                    let currentVal = this.getDisplayValue();
                    if (currentVal.startsWith(this.activeConfiguration.displayPrefix)) {
                        this.setDisplayValue(currentVal.substring(this.activeConfiguration.displayPrefix.length));
                    }
                }
                if (this.activeConfiguration.stripSuffixOnBlur && String(this.activeConfiguration.displaySuffix).trim() !== '') {
                    let currentVal = this.getDisplayValue();
                    if (currentVal.endsWith(this.activeConfiguration.displaySuffix)) {
                        this.setDisplayValue(currentVal.substring(0, currentVal.length - this.activeConfiguration.displaySuffix.length));
                    }
                }
            }
        }

        // Helper to convert formatted string to a standard numeric string (e.g., "1234.56")
        removeFormatting(formattedText) {
            let cleaned = formattedText;
            if (this.activeConfiguration.displayPrefix && cleaned.startsWith(this.activeConfiguration.displayPrefix)) {
                cleaned = cleaned.substring(this.activeConfiguration.displayPrefix.length);
            }
            if (this.activeConfiguration.displaySuffix && cleaned.endsWith(this.activeConfiguration.displaySuffix)) {
                cleaned = cleaned.substring(0, cleaned.length - this.activeConfiguration.displaySuffix.length);
            }
            if (this.activeConfiguration.groupSeparator && String(this.activeConfiguration.groupSeparator).trim() !== '') {
                cleaned = cleaned.replace(new RegExp(this.activeConfiguration.groupSeparator.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), '');
            }
            if (this.activeConfiguration.decimalDigits > 0 && this.activeConfiguration.decimalSeparator) {
                cleaned = cleaned.replace(this.activeConfiguration.decimalSeparator, '.');
            }
            return cleaned;
        }

        // Public method to remove event listeners
        deactivate() {
            this.targetElement.removeEventListener('input', this.eventHandlers.inputChange);
            this.targetElement.removeEventListener('keydown', this.eventHandlers.keyPressFilter);
            this.targetElement.removeEventListener('focusout', this.eventHandlers.focusExit);
            this.targetElement.removeEventListener('focusin', this.eventHandlers.focusEntry);
        }

        // Public method to retrieve the unmasked numeric value (digits and hyphens only)
        getUnmaskedValue() {
            const currentVal = this.getDisplayValue();
            return currentVal.replace(/[^0-9-]/g, '');
        }
    }

    const MonetaryInputManagement = {};

    MonetaryInputManagement.initializeFormatting = function(elements, configuration = {}) {
        const selectedElements = elements instanceof HTMLElement ? [elements] : Array.from(elements);
        const activeInstances = [];
        selectedElements.forEach(elem => {
            if (elem.__formatterInstance) {
                elem.__formatterInstance.deactivate();
            }
            const instance = new NumericInputProcessor(elem, configuration);
            elem.__formatterInstance = instance;
            activeInstances.push(instance);
        });
        return activeInstances;
    };

    MonetaryInputManagement.removeFormatting = function(elements) {
        const selectedElements = elements instanceof HTMLElement ? [elements] : Array.from(elements);
        selectedElements.forEach(elem => {
            if (elem.__formatterInstance) {
                elem.__formatterInstance.deactivate();
                delete elem.__formatterInstance;
            }
        });
    };

    MonetaryInputManagement.retrieveMaskedNumeric = function(element) {
        if (element.__formatterInstance) {
            return element.__formatterInstance.getUnmaskedValue();
        }
        return (element.value !== undefined ? element.value : element.textContent).replace(/[^0-9-]/g, '');
    };

    window.MonetaryInputManagement = MonetaryInputManagement;

})();