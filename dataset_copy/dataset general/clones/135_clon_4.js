(function() {

    const formProcessingDefaults = {
        controlWrapperIdentifier: 'input-group-field',
        issueStateClass: 'problem-indicator',
        faultStateClass: 'error-highlight',
        successStateClass: 'valid-check',
        targetInputSelector: 'input:not([type="submit"]):not([type="button"]):not([type="reset"]), textarea, select',
        placeholderTextColor: '#AAAAAA',
        hintMessageContainerClass: 'guidance-text',
        formIssuePanelID: 'form-alert-display',
        formSuccessPanelID: 'form-confirmation-display',
        scrollTransitionDuration: 700,
        validationEventTrigger: 'blur',
        validationAttributeName: 'data-validation-conditions',
        compareValueAttributePrefix: 'data-condition-'
    };

    class TextComposer {
        constructor(textMap) {
            this.phrasebook = textMap;
        }

        formatMessage(key, ...replacements) {
            let phraseTemplate = this.phrasebook[key];
            if (!phraseTemplate) {
                return `[Undefined text for: ${key}]`;
            }

            return phraseTemplate.replace(/%([sd])/g, (match, type) => {
                const argument = replacements.shift();
                if (argument === undefined || argument === null) return '';
                return (type === 'd') ? parseInt(argument, 10) : String(argument);
            });
        }
    }

    const systemMessages = {
        'mandatory_field': 'The "%s" field is required.',
        'radio_selection_needed': 'Please select an option for "%s".',
        'checkbox_must_be_checked': 'You must check "%s".',
        'minimum_length_violation': 'The "%s" field needs at least %d characters.',
        'maximum_length_exceeded': 'The "%s" field cannot exceed %d characters.',
        'minimum_value_breach': 'The value of "%s" must be at least %d.',
        'maximum_value_breach': 'The value of "%s" cannot be greater than %d.',
        'email_format_invalid': 'Please enter a valid email address for "%s".',
        'url_format_invalid': 'Please enter a valid URL for "%s".',
        'numeric_value_expected': 'The "%s" field must contain a number.',
        'integer_value_expected': 'The "%s" field must contain a whole number.',
        'alphabetic_only': 'The "%s" field must contain only letters.',
        'alphanumeric_only': 'The "%s" field must contain only letters and numbers.',
        'phrase_characters_invalid': 'The "%s" field contains unsupported characters.',
        'phone_number_invalid': 'Please enter a valid phone number for "%s".',
        'date_format_invalid': 'Please enter a date in MM/DD/YYYY format for "%s".',
        'values_do_not_match': 'The "%s" field must match the value of "%s".',
        'external_validator_missing': 'Validation for "%s" failed: Custom function "%s" is unavailable.'
    };
    const globalTextComposer = new TextComposer(systemMessages);

    class ValidationEngine {
        constructor(textService) {
            this.textProvider = textService;
        }

        // Extracts rule parameters from data attributes, e.g., data-condition-min-length="5"
        getRuleParameterValue(element, ruleName, fallback = 0) {
            const attrKey = `condition${ruleName.charAt(0).toUpperCase() + ruleName.slice(1)}`;
            const parameter = element.dataset[attrKey];
            if (parameter !== undefined && parameter !== null && parameter !== '') {
                if (['minLength', 'maxLength', 'min', 'max'].includes(ruleName)) {
                    return parseInt(parameter, 10);
                }
                return parameter;
            }
            return fallback;
        }

        isInputRequired(controlElement, fieldDescriptor) {
            if (controlElement.type === 'radio') {
                const groupName = controlElement.name;
                if (document.querySelector(`input[name="${groupName}"]:checked`)) {
                    return true;
                }
                return this.textProvider.formatMessage('radio_selection_needed', fieldDescriptor);
            }
            if (controlElement.type === 'checkbox') {
                if (controlElement.checked) {
                    return true;
                }
                return this.textProvider.formatMessage('checkbox_must_be_checked', fieldDescriptor);
            }
            if (controlElement.value.trim() === '') {
                return this.textProvider.formatMessage('mandatory_field', fieldDescriptor);
            }
            return true;
        }

        hasMinimumLength(controlElement, fieldDescriptor) {
            const minimum = this.getRuleParameterValue(controlElement, 'minLength', 0);
            if (minimum > 0 && controlElement.value.length < minimum) {
                return this.textProvider.formatMessage('minimum_length_violation', fieldDescriptor, minimum);
            }
            return true;
        }

        hasMinimumValue(controlElement, fieldDescriptor) {
            const minimum = this.getRuleParameterValue(controlElement, 'min', 0);
            if (parseInt(controlElement.value, 10) < minimum) {
                return this.textProvider.formatMessage('minimum_value_breach', fieldDescriptor, minimum);
            }
            return true;
        }

        hasMaximumLength(controlElement, fieldDescriptor) {
            const maximum = this.getRuleParameterValue(controlElement, 'maxLength', 0);
            if (maximum > 0 && controlElement.value.length > maximum) {
                return this.textProvider.formatMessage('maximum_length_exceeded', fieldDescriptor, maximum);
            }
            return true;
        }

        hasMaximumValue(controlElement, fieldDescriptor) {
            const maximum = this.getRuleParameterValue(controlElement, 'max', 0);
            if (parseInt(controlElement.value, 10) > maximum) {
                return this.textProvider.formatMessage('maximum_value_breach', fieldDescriptor, maximum);
            }
            return true;
        }

        isValidEmail(controlElement, fieldDescriptor) {
            const emailRegex = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            if (!emailRegex.test(controlElement.value)) {
                return this.textProvider.formatMessage('email_format_invalid', fieldDescriptor);
            }
            return true;
        }

        isValidUrl(controlElement, fieldDescriptor) {
            const urlRegex = /^(http|https|ftp):\/\/(([A-Z0-9][A-Z0-9_-]*)(\.[A-Z0-9][A-Z0-9_-]*)+)(:(\d+))?\/?/i;
            if (!urlRegex.test(controlElement.value)) {
                return this.textProvider.formatMessage('url_format_invalid', fieldDescriptor);
            }
            return true;
        }

        isNumeric(controlElement, fieldDescriptor) {
            const numericRegex = /(^-?\d\d*\.\d*$)|(^-?\d\d*$)|(^-?\.\d\d*$)/;
            if (controlElement.value !== '' && !numericRegex.test(controlElement.value)) {
                return this.textProvider.formatMessage('numeric_value_expected', fieldDescriptor);
            }
            return true;
        }

        isInteger(controlElement, fieldDescriptor) {
            const integerRegex = /(^-?\d\d*$)/;
            if (controlElement.value !== '' && !integerRegex.test(controlElement.value)) {
                return this.textProvider.formatMessage('integer_value_expected', fieldDescriptor);
            }
            return true;
        }

        isAlphabetic(controlElement, fieldDescriptor) {
            const alphaRegex = /^[a-zA-Z]+$/;
            if (!alphaRegex.test(controlElement.value)) {
                return this.textProvider.formatMessage('alphabetic_only', fieldDescriptor);
            }
            return true;
        }

        isAlphanumeric(controlElement, fieldDescriptor) {
            const alphanumericRegex = /\W/; // Matches non-word characters
            if (alphanumericRegex.test(controlElement.value)) {
                return this.textProvider.formatMessage('alphanumeric_only', fieldDescriptor);
            }
            return true;
        }

        isPhrase(controlElement, fieldDescriptor) {
            const phraseRegex = /^[\w\d\.\-_\(\)\*'# :,]+$/i;
            if (controlElement.value !== '' && !phraseRegex.test(controlElement.value)) {
                return this.textProvider.formatMessage('phrase_characters_invalid', fieldDescriptor);
            }
            return true;
        }

        isPhoneNumber(controlElement, fieldDescriptor) {
            const phoneRegex = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;
            if (!phoneRegex.test(controlElement.value)) {
                return this.textProvider.formatMessage('phone_number_invalid', fieldDescriptor);
            }
            return true;
        }

        isDateFormat(controlElement, fieldDescriptor) {
            const dateRegex = '(1[0-9]|[1-9])/([1-3][0-9]|[1-9])/((19|20)[0-9][0-9]|[0-9][0-9])';
            if (!controlElement.value.match(dateRegex)) {
                return this.textProvider.formatMessage('date_format_invalid', fieldDescriptor);
            }
            return true;
        }

        matchesOtherField(controlElement, fieldDescriptor) {
            const targetFieldName = this.getRuleParameterValue(controlElement, 'sameAs');
            if (targetFieldName) {
                const targetElement = document.querySelector(`[name="${targetFieldName}"]`);
                if (targetElement && targetElement.value !== controlElement.value) {
                    const targetLabel = targetElement.closest(`div.${formProcessingDefaults.controlWrapperIdentifier}`)
                                                     ?.querySelector('label')?.textContent?.replace('*', '') || targetFieldName;
                    return this.textProvider.formatMessage('values_do_not_match', fieldDescriptor, targetLabel);
                }
            }
            return true;
        }

        executesCustomFunction(controlElement, fieldDescriptor) {
            const functionName = this.getRuleParameterValue(controlElement, 'callback');
            if (functionName && typeof window[functionName] === 'function') {
                return window[functionName](controlElement, fieldDescriptor);
            }
            return this.textProvider.formatMessage('external_validator_missing', fieldDescriptor, functionName);
        }
    }
    const globalValidationEngine = new ValidationEngine(globalTextComposer);

    // Map rule names found in data-validation-conditions to ValidationEngine methods
    const validationMethodRegistry = {
        'required': 'isInputRequired',
        'minLength': 'hasMinimumLength',
        'min': 'hasMinimumValue',
        'maxLength': 'hasMaximumLength',
        'max': 'hasMaximumValue',
        'email': 'isValidEmail',
        'url': 'isValidUrl',
        'number': 'isNumeric',
        'integer': 'isInteger',
        'alpha': 'isAlphabetic',
        'alphanum': 'isAlphanumeric',
        'phrase': 'isPhrase',
        'phone': 'isPhoneNumber',
        'date': 'isDateFormat',
        'sameAs': 'matchesOtherField',
        'callback': 'executesCustomFunction'
    };

    class VisualFeedbackManager {
        constructor(settings, textService) {
            this.config = settings;
            this.textSource = textService;
        }

        // Updates the visual state of a form control
        adjustControlDisplay(controlElement, passedValidation, message) {
            const parentContainer = controlElement.closest(`div.${this.config.controlWrapperIdentifier}`);
            if (!parentContainer) return;

            const hintParagraph = parentContainer.querySelector(`p.${this.config.hintMessageContainerClass}`);
            if (!hintParagraph) return;

            if (!hintParagraph.dataset.initialTextContent) {
                hintParagraph.dataset.initialTextContent = hintParagraph.innerHTML;
            }

            parentContainer.classList.toggle(this.config.issueStateClass, !passedValidation);
            parentContainer.classList.toggle(this.config.faultStateClass, !passedValidation);
            parentContainer.classList.toggle(this.config.successStateClass, passedValidation);

            if (message) {
                hintParagraph.innerHTML = message;
            } else if (passedValidation && hintParagraph.dataset.initialTextContent) {
                hintParagraph.innerHTML = hintParagraph.dataset.initialTextContent;
            }
        }

        // Displays a general error panel at the top of the form
        showErrorPanel(formElement, headerTitle, issuesList) {
            let errorPanel = document.getElementById(this.config.formIssuePanelID);
            if (errorPanel) {
                errorPanel.remove();
            }

            errorPanel = document.createElement('div');
            errorPanel.id = this.config.formIssuePanelID;
            errorPanel.innerHTML = `<h3>${headerTitle}</h3>`;

            if (issuesList && issuesList.length > 0) {
                const listContainer = document.createElement('ol');
                issuesList.forEach(text => {
                    const listItem = document.createElement('li');
                    listItem.textContent = text;
                    listContainer.appendChild(listItem);
                });
                errorPanel.appendChild(listContainer);
            }

            formElement.prepend(errorPanel);
            this.smoothScrollToElement(formElement, this.config.scrollTransitionDuration);
            errorPanel.style.display = 'block';
        }

        // Displays a general success panel at the top of the form
        showSuccessPanel(formElement, headerTitle) {
            let successPanel = document.getElementById(this.config.formSuccessPanelID);
            if (successPanel) {
                successPanel.remove();
            }

            successPanel = document.createElement('div');
            successPanel.id = this.config.formSuccessPanelID;
            successPanel.innerHTML = `<h3>${headerTitle}</h3>`;

            formElement.prepend(successPanel);
            this.smoothScrollToElement(formElement, this.config.scrollTransitionDuration);
            successPanel.style.display = 'block';
        }

        // Custom scroll animation
        smoothScrollToElement(element, duration) {
            const startY = window.pageYOffset;
            const targetY = element.getBoundingClientRect().top + startY;
            const distance = targetY - startY;
            let startTime = null;

            function animateScroll(currentTime) {
                if (startTime === null) startTime = currentTime;
                const timeElapsed = currentTime - startTime;
                const progress = Math.min(timeElapsed / duration, 1);
                window.scrollTo(0, startY + distance * progress);
                if (timeElapsed < duration) {
                    requestAnimationFrame(animateScroll);
                }
            }
            requestAnimationFrame(animateScroll);
        }
    }
    const globalVisualFeedbackManager = new VisualFeedbackManager(formProcessingDefaults, globalTextComposer);

    class EnhancedFormProcessor {
        constructor(targetFormElement, customConfiguration = {}) {
            if (!(targetFormElement instanceof HTMLFormElement)) {
                console.error("The provided object is not an HTMLFormElement:", targetFormElement);
                return;
            }

            this.formElement = targetFormElement;
            this.config = { ...formProcessingDefaults, ...customConfiguration };
            this.inputControls = Array.from(this.formElement.querySelectorAll(this.config.targetInputSelector));
            this.initialFormSnapshot = null;
            this.uiManager = globalVisualFeedbackManager;
            this.validator = globalValidationEngine;

            this.prepareFormControls();
            this.registerEventBindings();
        }

        prepareFormControls() {
            this.inputControls.forEach(control => {
                if (!control.dataset.originalControlColor) {
                    control.dataset.originalControlColor = control.style.color || window.getComputedStyle(control).color;
                }

                const defaultContent = control.dataset.defaultFill;

                if (defaultContent !== undefined && (control.value === '' || control.value === defaultContent)) {
                    control.style.color = this.config.placeholderTextColor;
                    control.value = defaultContent;
                }
            });
        }

        registerEventBindings() {
            this.formElement.addEventListener('submit', this.handleFormSubmit.bind(this));

            this.inputControls.forEach(control => {
                control.addEventListener('focus', this.handleControlFocus.bind(this));
                control.addEventListener(this.config.validationEventTrigger, this.handleControlBlurOrChange.bind(this));
                if (control.type === 'radio' || control.type === 'checkbox' || control.tagName === 'SELECT') {
                    control.addEventListener('change', this.handleControlBlurOrChange.bind(this));
                }
            });

            if (this.config.preventNavigationIfModified || this.formElement.classList.contains('askOnLeave')) {
                this.captureFormState();
                window.addEventListener('beforeunload', this.confirmPageExit.bind(this));
            }
        }

        handleControlFocus(event) {
            const control = event.target;
            const defaultContent = control.dataset.defaultFill;
            if (defaultContent !== undefined && control.value === defaultContent) {
                control.value = '';
                control.style.color = control.dataset.originalControlColor;
            }
            this.uiManager.adjustControlDisplay(control, true, null);
        }

        handleControlBlurOrChange(event) {
            const control = event.target;
            const defaultContent = control.dataset.defaultFill;
            if (defaultContent !== undefined && control.value === '') {
                control.value = defaultContent;
                control.style.color = this.config.placeholderTextColor;
            }
            this.performSingleControlValidation(control);
        }

        performSingleControlValidation(controlElement) {
            const conditionsString = controlElement.dataset[this.config.validationAttributeName.replace('data-', '')];
            if (!conditionsString) {
                this.uiManager.adjustControlDisplay(controlElement, true, null);
                return true;
            }

            const fieldLabel = controlElement.closest(`div.${this.config.controlWrapperIdentifier}`)
                                            ?.querySelector('label')?.textContent?.replace('*', '') || controlElement.name || controlElement.id || 'Input Field';

            const conditions = conditionsString.split(' ').filter(c => c.trim() !== '');
            let firstValidationIssue = null;

            for (const condition of conditions) {
                let conditionName = condition;
                let parameter = null;

                if (condition.includes(':')) {
                    [conditionName, parameter] = condition.split(':');
                    // Temporarily store parameter in dataset for the validator to pick up
                    controlElement.dataset[`condition${conditionName.charAt(0).toUpperCase() + conditionName.slice(1)}`] = parameter;
                }

                const validatorMethodKey = validationMethodRegistry[conditionName];
                if (validatorMethodKey && typeof this.validator[validatorMethodKey] === 'function') {
                    const validationOutcome = this.validator[validatorMethodKey](controlElement, fieldLabel);
                    if (validationOutcome !== true) {
                        firstValidationIssue = validationOutcome;
                        break;
                    }
                } else {
                    console.warn(`Unrecognized or unsupported validation condition: "${conditionName}" for control "${fieldLabel}"`);
                }
            }

            this.uiManager.adjustControlDisplay(controlElement, firstValidationIssue === null, firstValidationIssue);
            return firstValidationIssue === null;
        }

        validateAllFormControls() {
            let allControlsPass = true;
            let collectedErrorMessages = [];

            this.inputControls.forEach(control => {
                const passes = this.performSingleControlValidation(control);
                if (!passes) {
                    allControlsPass = false;
                    const parentContainer = control.closest(`div.${this.config.controlWrapperIdentifier}`);
                    const hintParagraph = parentContainer?.querySelector(`p.${this.config.hintMessageContainerClass}`);
                    if (hintParagraph && hintParagraph.textContent) {
                        collectedErrorMessages.push(hintParagraph.textContent);
                    }
                }
            });
            return { isValid: allControlsPass, messages: collectedErrorMessages };
        }

        handleFormSubmit(event) {
            event.preventDefault();

            const overallValidationResult = this.validateAllFormControls();

            if (overallValidationResult.isValid) {
                this.uiManager.showSuccessPanel(this.formElement, "Form Submitted Successfully!");
                // event.target.submit(); // Uncomment to allow native form submission
            } else {
                this.uiManager.showErrorPanel(
                    this.formElement,
                    "Please Correct the Following Issues:",
                    overallValidationResult.messages
                );
            }
        }

        captureFormState() {
            this.initialFormSnapshot = new URLSearchParams(new FormData(this.formElement)).toString();
        }

        confirmPageExit(event) {
            const currentFormSnapshot = new URLSearchParams(new FormData(this.formElement)).toString();
            if (this.initialFormSnapshot !== currentFormSnapshot) {
                event.preventDefault();
                event.returnValue = '';
                return '';
            }
        }
    }

    window.FormInitializer = function(cssSelector, configuration = {}) {
        const selectedElements = document.querySelectorAll(cssSelector);
        selectedElements.forEach(element => {
            if (element.tagName === 'FORM') {
                new EnhancedFormProcessor(element, configuration);
            } else {
                console.warn(`Selector "${cssSelector}" matched a non-form element. Skipping:`, element);
            }
        });
    };

})();