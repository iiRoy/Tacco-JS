const ValidationRules = {};

ValidationRules.Failure = class extends Error {
    constructor(message) {
        super(message);
        this.name = "ValidationRules.Failure";
    }
};

ValidationRules.isPresent = function(value, options = {}) {
    if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
        throw new ValidationRules.Failure(options.failureMessage || "This field is required.");
    }
};

ValidationRules.isAccepted = function(value, options = {}) {
    if (value !== true) {
        throw new ValidationRules.Failure(options.failureMessage || "Must be accepted.");
    }
};

ValidationRules.isConfirmed = function(value, options = {}) {
    const originalValue = options.matchWithElement ? (typeof options.matchWithElement === 'string' ? document.getElementById(options.matchWithElement).value : options.matchWithElement.value) : '';
    if (value !== originalValue) {
        throw new ValidationRules.Failure(options.failureMessage || "Does not match the confirmation field.");
    }
};

ValidationRules.isCustom = function(value, options = {}) {
    if (options.validator && typeof options.validator === 'function') {
        const result = options.validator(value, options.args);
        if (result === false) {
            throw new ValidationRules.Failure(options.failureMessage || "Invalid value.");
        }
    } else {
        throw new Error("ValidationRules.isCustom requires a 'validator' function.");
    }
};

const InputKind = {
    TEXT_AREA: 101,
    PLAIN_TEXT: 102,
    SECRET_TEXT: 103,
    TOGGLE_BOX: 104,
    OPTION_PICKER: 105,
    FILE_UPLOAD: 106
};

class InputValidator {

    static batchVerify(validators) {
        let overallResult = true;
        for (const checker of validators) {
            const currentResult = checker.verifyCurrent();
            if (!currentResult) {
                overallResult = false;
            }
        }
        return overallResult;
    }

    constructor(targetElement, config = {}) {
        if (!targetElement) {
            throw new Error("InputValidator::constructor - No element reference or ID provided!");
        }
        this.targetElement = typeof targetElement === 'string' ? document.getElementById(targetElement) : targetElement;
        if (!this.targetElement) {
            throw new Error(`InputValidator::constructor - No element with reference or ID '${targetElement}' exists!`);
        }

        this.inputKind = this.resolveInputKind();
        this.validationRules = [];
        this.associatedForm = this.targetElement.form;

        const defaultSettings = {
            successMessage: 'Looks good!',
            feedbackInsertionPoint: this.targetElement,
            verifyOnlyOnBlur: false,
            debounceDelay: 0,
            verifyOnlyOnSubmit: false,
            successCss: 'LV_success',
            failureCss: 'LV_failure',
            messageCss: 'LV_feedback_message',
            successFieldCss: 'LV_success_field',
            failureFieldCss: 'LV_failure_field',
            preVerification: () => {},
            preSuccess: () => {},
            onSuccess: function() { this.displayFeedback(this.composeFeedbackElement()); this.applyFieldStyle(); },
            postSuccess: () => {},
            preFailure: () => {},
            onFailure: function() { this.displayFeedback(this.composeFeedbackElement()); this.applyFieldStyle(); },
            postFailure: () => {},
            postVerification: () => {},
        };

        Object.assign(this, { ...defaultSettings, ...config });

        this.feedbackInsertionPoint = typeof this.feedbackInsertionPoint === 'string' ? document.getElementById(this.feedbackInsertionPoint) : this.feedbackInsertionPoint;
        if (!this.feedbackInsertionPoint) {
            this.feedbackInsertionPoint = this.targetElement;
        }

        if (this.associatedForm) {
            this.formProcessorInstance = FormProcessor.obtainProcessor(this.associatedForm);
            this.formProcessorInstance.registerInput(this);
        }

        this.boundFocusHandler = this.handleFocus.bind(this);
        this.boundBlurHandler = this.verifyCurrent.bind(this);
        this.boundKeyupHandler = this.debounceCheck.bind(this);
        this.boundChangeHandler = this.verifyCurrent.bind(this);
        this.boundClickHandler = this.verifyCurrent.bind(this);

        this.targetElement.addEventListener('focus', this.boundFocusHandler);

        if (!this.verifyOnlyOnSubmit) {
            switch (this.inputKind) {
                case InputKind.TOGGLE_BOX:
                    this.targetElement.addEventListener('click', this.boundClickHandler);
                case InputKind.OPTION_PICKER:
                case InputKind.FILE_UPLOAD:
                    this.targetElement.addEventListener('change', this.boundChangeHandler);
                    break;
                default:
                    if (!this.verifyOnlyOnBlur) {
                        this.targetElement.addEventListener('keyup', this.boundKeyupHandler);
                    }
                    this.targetElement.addEventListener('blur', this.boundBlurHandler);
            }
        }
    }

    destroy() {
        if (this.formProcessorInstance) {
            this.formProcessorInstance.deregisterInput(this);
            this.formProcessorInstance.destroyIfEmpty();
        }

        this.targetElement.removeEventListener('focus', this.boundFocusHandler);
        if (!this.verifyOnlyOnSubmit) {
            switch (this.inputKind) {
                case InputKind.TOGGLE_BOX:
                    this.targetElement.removeEventListener('click', this.boundClickHandler);
                case InputKind.OPTION_PICKER:
                case InputKind.FILE_UPLOAD:
                    this.targetElement.removeEventListener('change', this.boundChangeHandler);
                    break;
                default:
                    if (!this.verifyOnlyOnBlur) {
                        this.targetElement.removeEventListener('keyup', this.boundKeyupHandler);
                    }
                    this.targetElement.removeEventListener('blur', this.boundBlurHandler);
            }
        }
        this.validationRules = [];
        this.clearAllFeedback();
    }

    attachRule(ruleFunction, ruleConfig = {}) {
        this.validationRules.push({ type: ruleFunction, config: ruleConfig });
        return this;
    }

    detachRule(ruleFunction, ruleConfig = {}) {
        this.validationRules = this.validationRules.filter(
            (r) => !(r.type === ruleFunction && r.config === ruleConfig)
        );
        return this;
    }

    debounceCheck() {
        if (this.debounceDelay >= 300) {
            this.clearAllFeedback();
        }
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        this.debounceTimer = setTimeout(this.verifyCurrent.bind(this), this.debounceDelay);
    }

    handleFocus() {
        this.inputHasFocus = true;
        this.clearAllFeedback();
    }

    resolveInputKind() {
        const nodeName = this.targetElement.nodeName.toUpperCase();
        const inputType = this.targetElement.type ? this.targetElement.type.toUpperCase() : '';

        if (nodeName === 'TEXTAREA') return InputKind.TEXT_AREA;
        if (nodeName === 'INPUT') {
            switch (inputType) {
                case 'TEXT': return InputKind.PLAIN_TEXT;
                case 'PASSWORD': return InputKind.SECRET_TEXT;
                case 'CHECKBOX': return InputKind.TOGGLE_BOX;
                case 'FILE': return InputKind.FILE_UPLOAD;
                default:
                    throw new Error(`InputValidator::resolveInputKind - Cannot process '${inputType}' input type!`);
            }
        }
        if (nodeName === 'SELECT') return InputKind.OPTION_PICKER;

        throw new Error(`InputValidator::resolveInputKind - Element must be an input, select, or textarea - '${nodeName}' was given!`);
    }

    performAllChecks() {
        this.checkFailed = false;
        for (const rule of this.validationRules) {
            this.checkFailed = !this.executeSingleCheck(rule.type, rule.config);
            if (this.checkFailed) return false;
        }
        this.currentMessage = this.successMessage;
        return true;
    }

    executeSingleCheck(ruleFunction, ruleConfig) {
        let displayEmptyMessage = false;
        switch (ruleFunction) {
            case ValidationRules.isPresent:
            case ValidationRules.isConfirmed:
            case ValidationRules.isAccepted:
                displayEmptyMessage = true;
                break;
            case ValidationRules.isCustom:
                if (ruleConfig.displayMessageWhenEmpty) displayEmptyMessage = true;
                break;
        }
        this.displayMessageForEmpty = displayEmptyMessage;

        let valueToValidate;
        if (this.inputKind === InputKind.OPTION_PICKER) {
            valueToValidate = this.targetElement.options[this.targetElement.selectedIndex].value;
        } else if (ruleFunction === ValidationRules.isAccepted) {
            if (this.inputKind !== InputKind.TOGGLE_BOX) {
                throw new Error('InputValidator::executeSingleCheck - Element for acceptance rule must be a checkbox!');
            }
            valueToValidate = this.targetElement.checked;
        } else {
            valueToValidate = this.targetElement.value;
        }

        let isValid = true;
        try {
            ruleFunction(valueToValidate, ruleConfig);
        } catch (error) {
            if (error instanceof ValidationRules.Failure) {
                if (valueToValidate !== '' || (valueToValidate === '' && this.displayMessageForEmpty) || this.inputKind === InputKind.TOGGLE_BOX) {
                    this.checkFailed = true;
                    this.currentMessage = error.message.split('\n')[0];
                    isValid = false;
                }
            } else {
                throw error;
            }
        } finally {
            return isValid;
        }
    }

    verifyCurrent() {
        if (this.targetElement.disabled) {
            return true;
        }

        this.preVerification();
        const allChecksPassed = this.performAllChecks();

        if (allChecksPassed) {
            this.preSuccess();
            this.onSuccess();
            this.postSuccess();
        } else {
            this.preFailure();
            this.onFailure();
            this.postFailure();
        }
        this.postVerification();
        return allChecksPassed;
    }

    enableInput() {
        this.targetElement.disabled = false;
        return this;
    }

    disableInput() {
        this.targetElement.disabled = true;
        this.clearAllFeedback();
        return this;
    }

    composeFeedbackElement() {
        const feedbackSpan = document.createElement('span');
        const messageText = document.createTextNode(this.currentMessage);
        feedbackSpan.appendChild(messageText);
        return feedbackSpan;
    }

    displayFeedback(feedbackElement) {
        this.clearFeedback();

        if (!this.checkFailed && !this.successMessage) {
            return;
        }

        const shouldDisplay = (this.displayMessageForEmpty && (this.inputKind === InputKind.TOGGLE_BOX || this.targetElement.value === '')) || this.targetElement.value !== '';

        if (shouldDisplay) {
            const cssClass = this.checkFailed ? this.failureCss : this.successCss;
            feedbackElement.classList.add(this.messageCss, cssClass);

            const parentNode = this.feedbackInsertionPoint.parentNode;
            const nextSibling = this.feedbackInsertionPoint.nextElementSibling;

            if (nextSibling) {
                parentNode.insertBefore(feedbackElement, nextSibling);
            } else {
                parentNode.appendChild(feedbackElement);
            }
        }
    }

    applyFieldStyle() {
        this.clearFieldStyle();
        
        const shouldApply = (this.displayMessageForEmpty && (this.inputKind === InputKind.TOGGLE_BOX || this.targetElement.value === '')) || this.targetElement.value !== '';

        if (shouldApply) {
            if (!this.checkFailed) {
                if (!this.targetElement.classList.contains(this.successFieldCss)) {
                    this.targetElement.classList.add(this.successFieldCss);
                }
            } else {
                if (!this.targetElement.classList.contains(this.failureFieldCss)) {
                    this.targetElement.classList.add(this.failureFieldCss);
                }
            }
        }
    }

    clearFeedback() {
        const nextElement = this.feedbackInsertionPoint.nextElementSibling;
        if (nextElement && nextElement.classList.contains(this.messageCss)) {
            nextElement.remove();
        }
    }

    clearFieldStyle() {
        this.targetElement.classList.remove(this.failureFieldCss);
        this.targetElement.classList.remove(this.successFieldCss);
    }

    clearAllFeedback() {
        this.clearFeedback();
        this.clearFieldStyle();
    }
}

class FormProcessor {

    static registry = new Map();

    static obtainProcessor(formElement) {
        if (!formElement) {
            throw new Error("FormProcessor::obtainProcessor - No element reference or ID provided!");
        }
        const form = typeof formElement === 'string' ? document.getElementById(formElement) : formElement;
        if (!form) {
            throw new Error(`FormProcessor::obtainProcessor - No form with reference or ID '${formElement}' exists!`);
        }

        let formId = form.id;
        if (!formId) {
            formId = 'formProc_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
            form.id = formId;
        }

        if (!FormProcessor.registry.has(formId)) {
            FormProcessor.registry.set(formId, new FormProcessor(form));
        }
        return FormProcessor.registry.get(formId);
    }

    constructor(formElement) {
        this.formElement = formElement;
        this.registeredInputs = [];

        this.preFormValidation = () => {};
        this.onFormSuccess = () => {};
        this.onFormFailure = () => {};
        this.postFormValidation = () => {};

        this.originalOnSubmit = this.formElement.onsubmit;
        this.formElement.onsubmit = (event) => {
            const validationResult = this.processFormSubmission(event);
            if (!validationResult) {
                event.preventDefault();
            }
            if (typeof this.originalOnSubmit === 'function') {
                const originalResult = this.originalOnSubmit.call(this.formElement, event);
                if (originalResult === false) {
                    return false;
                }
            }
            return validationResult;
        };
    }

    registerInput(validatorInstance) {
        this.registeredInputs.push(validatorInstance);
    }

    deregisterInput(validatorInstance) {
        this.registeredInputs = this.registeredInputs.filter(instance => instance !== validatorInstance);
    }

    destroyIfEmpty() {
        if (this.registeredInputs.length === 0) {
            this.formElement.onsubmit = this.originalOnSubmit;
            FormProcessor.registry.delete(this.formElement.id);
        }
    }

    processFormSubmission(event) {
        this.preFormValidation();
        const allInputsValid = InputValidator.batchVerify(this.registeredInputs);

        if (allInputsValid) {
            this.onFormSuccess();
        } else {
            this.onFormFailure();
        }
        this.postFormValidation();
        return allInputsValid;
    }
}