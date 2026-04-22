// Utility functions for Type IV clone
const DomManipulator = (function() {
    const DATA_KEY_PREFIX = 'formProc';

    const isFormElement = (potentialForm) => {
        return potentialForm instanceof HTMLFormElement;
    };

    const getElementAttribute = (element, attributeName) => {
        return element?.getAttribute(attributeName);
    };

    const setElementAttribute = (element, attributeName, value) => {
        if (element) {
            if (value === null) {
                element.removeAttribute(attributeName);
            } else {
                element.setAttribute(attributeName, value);
            }
        }
    };

    const manageElementData = (element, key, value) => {
        if (!element || !key) return;
        const fullKey = DATA_KEY_PREFIX + key.charAt(0).toUpperCase() + key.slice(1);
        if (value === null) {
            delete element.dataset[fullKey];
        } else if (value === undefined) {
            return element.dataset[fullKey];
        } else {
            element.dataset[fullKey] = value;
        }
    };

    const preventEventDefault = (event) => {
        event?.preventDefault();
    };

    const addEventHook = (element, eventName, handler, options) => {
        element?.addEventListener(eventName, handler, options);
    };

    const removeEventHook = (element, eventName, handler, options) => {
        element?.removeEventListener(eventName, handler, options);
    };

    return {
        isFormElement,
        getElementAttribute,
        setElementAttribute,
        manageElementData,
        preventEventDefault,
        addEventHook,
        removeEventHook
    };
})();

const ObjectManipulator = (function() {
    const deepCopy = (obj) => {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        if (obj instanceof RegExp) {
            return new RegExp(obj);
        }
        if (obj instanceof Map) {
            const newMap = new Map();
            obj.forEach((val, key) => newMap.set(key, deepCopy(val)));
            return newMap;
        }
        if (obj instanceof Set) {
            const newSet = new Set();
            obj.forEach(val => newSet.add(deepCopy(val)));
            return newSet;
        }

        const copy = Array.isArray(obj) ? [] : {};
        for (let key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                copy[key] = deepCopy(obj[key]);
            }
        }
        return copy;
    };

    const deepMerge = (target, ...sources) => {
        if (target === null || typeof target !== 'object') {
            target = {};
        }
        for (const source of sources) {
            if (source === null || typeof source !== 'object') {
                continue;
            }
            for (const key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                        if (!Object.prototype.hasOwnProperty.call(target, key) || typeof target[key] !== 'object' || target[key] === null) {
                            target[key] = {};
                        }
                        deepMerge(target[key], source[key]);
                    } else {
                        target[key] = deepCopy(source[key]);
                    }
                }
            }
        }
        return target;
    };

    return {
        deepCopy,
        deepMerge
    };
})();

// Constants for element types and configurations
const BUTTON_KIND_SET = new Set(['button', 'submit']);
const INPUT_KIND_SET = new Set(['text', 'password', 'select-one', 'checkbox', 'textarea', 'range', 'number', 'email', 'hidden', 'file', 'date', 'datetime-local', 'search', 'tel', 'time', 'url', 'month', 'week']);
const CHANGE_ONLY_TAGS = new Set(['checkbox', 'select-one', 'select', 'file']);
const ADDITIONAL_CHANGE_TAGS = new Set(['number', 'date', 'datetime-local', 'time', 'month', 'week', 'range']);

const PROCESSOR_CONFIG_KEYS = new Set(['timeout', 'requestTimeout', 'errorClass', 'disabledClass', 'processingClass', 'validationEvent', 'submitControlEnabled', 'submissionActivator', 'onSubmitCallback', 'beforeCallback', 'onErrorCallback', 'onValidationSuccessCallback', 'eventBeforeName', 'eventErrorName', 'eventValidName']);
const INPUT_CONFIG_KEYS = new Set(['timeout', 'requestTimeout', 'requestFunction', 'successClass', 'errorClass', 'disabledClass', 'processingClass', 'validationRules', 'validationEvent', 'beforeCallback', 'onErrorCallback', 'onValidationSuccessCallback', 'selfManaged', 'eventBeforeName', 'eventErrorName', 'eventValidName']);
const ACTION_CONFIG_KEYS = new Set(['disabledClass', 'processingClass']);

const DEFAULT_OPTIONS_SCHEMA = Object.freeze({
    errorClass: 'error',
    processingClass: 'processing',
    disabledClass: 'disabled',
    successClass: 'valid',

    eventBeforeName: 'formProcessor:before',
    eventErrorName: 'formProcessor:error',
    eventValidName: 'formProcessor:valid',

    timeout: 0,
    requestTimeout: 2000,

    validationEvent: 'input keyup', // Space-separated events

    inputSettings: {},
    buttonSettings: {},

    submitControlEnabled: true,
    submissionActivator: null // Can be a selector or an element
});

// Base class for form elements
class DomNodeBase {
    #nodeElement;
    #settings;
    #activeHandlers = [];
    #controller;
    isActive = false;

    constructor(parentController, element) {
        this.#controller = parentController;
        this.#nodeElement = element;
        this.#settings = ObjectManipulator.deepCopy(DEFAULT_OPTIONS_SCHEMA); // Base settings
    }

    retrieveSetting(key) {
        return this.#settings[key];
    }

    applySettings(newOptions) {
        const isCurrentlyActive = this.isActive;
        if (isCurrentlyActive) {
            this.deactivate();
        }
        ObjectManipulator.deepMerge(this.#settings, newOptions);
        if (isCurrentlyActive) {
            this.activate();
        }
        return this;
    }

    get element() {
        return this.#nodeElement;
    }

    get parentController() {
        return this.#controller;
    }

    addStyleClass(className) {
        this.#nodeElement?.classList.add(className);
        return this;
    }

    removeStyleClass(className) {
        this.#nodeElement?.classList.remove(className);
        return this;
    }

    hasStyleClass(className) {
        return this.#nodeElement?.classList.contains(className);
    }

    addEvent(eventName, handler, options) {
        DomManipulator.addEventHook(this.#nodeElement, eventName, handler, options);
        this.#activeHandlers.push([eventName, handler]);
        return this;
    }

    removeEvent(eventName, handler, options) {
        DomManipulator.removeEventHook(this.#nodeElement, eventName, handler, options);
        this.#activeHandlers = this.#activeHandlers.filter(([ev, h]) => !(ev === eventName && h === handler));
        return this;
    }

    dispatchCustomEvent(eventName, detail) {
        this.#nodeElement?.dispatchEvent(new CustomEvent(eventName, { bubbles: true, detail }));
        return this;
    }

    activate() {
        this.isActive = true;
        return this;
    }

    deactivate() {
        this.#activeHandlers.forEach(([eventName, handler]) => {
            DomManipulator.removeEventHook(this.#nodeElement, eventName, handler);
        });
        this.#activeHandlers = [];

        this.removeStyleClass(this.retrieveSetting('errorClass'));
        this.removeStyleClass(this.retrieveSetting('disabledClass'));
        this.removeStyleClass(this.retrieveSetting('processingClass'));

        DomManipulator.manageElementData(this.#nodeElement, 'holdState', null);
        DomManipulator.manageElementData(this.#nodeElement, 'errorState', null);

        this.isActive = false;
        return this;
    }

    resetConfiguration() {
        this.deactivate();
        this.#settings = ObjectManipulator.deepCopy(DEFAULT_OPTIONS_SCHEMA);
        this.activate();
        return this;
    }

    invokeCallback(callbackName, context, params) {
        let callback = this.retrieveSetting(callbackName);
        if (typeof callback === 'function') {
            return callback.apply(context, params || []);
        }
        return null;
    }
}

// Handler for input fields
class InputNode extends DomNodeBase {
    #validationTimer = null;
    #xhrRequest = null;
    #xhrTimeoutTimer = null;
    #isValid = true;

    constructor(parentController, element, options) {
        super(parentController, element);
        // Re-initialize settings specifically for InputNode, then apply specific options
        // This ensures InputNode starts with a clean slate of defaults before merging its own options
        this.#settings = ObjectManipulator.deepCopy(DEFAULT_OPTIONS_SCHEMA);
        this.applySettings(options);
        this.activate();
    }

    applySettings(newOptions) {
        const isCurrentlyActive = this.isActive;
        if (isCurrentlyActive) {
            this.deactivate();
        }
        // Filter options specific to InputNode
        const filteredOptions = {};
        for (const key in newOptions) {
            if (Object.prototype.hasOwnProperty.call(newOptions, key) && INPUT_CONFIG_KEYS.has(key)) {
                filteredOptions[key] = newOptions[key];
            }
        }
        ObjectManipulator.deepMerge(this.#settings, filteredOptions);
        if (isCurrentlyActive) {
            this.activate();
        }
        return this;
    }

    activate() {
        if (this.isActive) return this;
        super.activate();

        const validationEvents = this.retrieveSetting('validationEvent').split(' ').filter(Boolean);
        validationEvents.forEach(eventName => {
            this.addEvent(eventName, this.#handleValidationAttempt.bind(this));
        });

        if (CHANGE_ONLY_TAGS.has(this.element.type) || ADDITIONAL_CHANGE_TAGS.has(this.element.type)) {
            this.addEvent('change', this.#handleValidationAttempt.bind(this));
        }
        return this;
    }

    deactivate() {
        super.deactivate();
        clearTimeout(this.#validationTimer);
        this.#validationTimer = null;
        if (this.#xhrRequest) {
            this.#xhrRequest.abort();
            this.#xhrRequest = null;
        }
        clearTimeout(this.#xhrTimeoutTimer);
        this.#xhrTimeoutTimer = null;

        if (!this.#isValid) {
            this.parentController.updateInvalidCount(-1);
        }
        this.parentController.manageSubmissionButtonState();
        return this;
    }

    verifyIntegrity(options = {}) {
        const { suppressHighlight = false, triggerEvents = true, silent = false } = options;

        clearTimeout(this.#validationTimer);
        this.removeStyleClass(this.retrieveSetting('errorClass'));
        this.removeStyleClass(this.retrieveSetting('successClass'));
        DomManipulator.manageElementData(this.element, 'errorState', null);

        const currentValidity = this.#performInternalValidation();
        const previousValidity = this.#isValid;
        this.#isValid = currentValidity;

        if (!currentValidity) {
            if (!suppressHighlight) {
                this.addStyleClass(this.retrieveSetting('errorClass'));
            }
            DomManipulator.manageElementData(this.element, 'errorState', 'true');
            if (triggerEvents) {
                this.dispatchCustomEvent(this.retrieveSetting('eventErrorName'), { element: this.element, isValid: false });
                this.invokeCallback('onErrorCallback', this.element, [this.element, this.parentController]);
            }
            if (!silent && previousValidity) { // Only increment if it became invalid
                this.parentController.updateInvalidCount(1);
            }
        } else {
            if (!suppressHighlight) {
                this.addStyleClass(this.retrieveSetting('successClass'));
            }
            if (triggerEvents) {
                this.dispatchCustomEvent(this.retrieveSetting('eventValidName'), { element: this.element, isValid: true });
                this.invokeCallback('onValidationSuccessCallback', this.element, [this.element, this.parentController]);
            }
            if (!silent && !previousValidity) { // Only decrement if it became valid
                this.parentController.updateInvalidCount(-1);
            }
        }

        this.parentController.manageSubmissionButtonState();
        return currentValidity;
    }

    #performInternalValidation() {
        const rules = this.retrieveSetting('validationRules');
        if (!rules) return true;

        if (rules.required && !String(this.element.value).trim()) {
            return false;
        }
        if (rules.minlength && String(this.element.value).length < rules.minlength) {
            return false;
        }
        // Add more validation rules as needed for complex scenarios.
        return true;
    }

    #handleValidationAttempt() {
        const timeout = this.retrieveSetting('timeout');
        if (timeout > 0) {
            clearTimeout(this.#validationTimer);
            this.#validationTimer = setTimeout(() => this.verifyIntegrity(), timeout);
        } else {
            this.verifyIntegrity();
        }
    }

    isValid() {
        return this.#isValid;
    }
}

// Handler for buttons
class ActionNode extends DomNodeBase {
    constructor(parentController, element, options) {
        super(parentController, element);
        this.#settings = ObjectManipulator.deepCopy(DEFAULT_OPTIONS_SCHEMA); // Critical for button-specific defaults
        this.applySettings(options);
        this.activate();
    }

    applySettings(newOptions) {
        const isCurrentlyActive = this.isActive;
        if (isCurrentlyActive) {
            this.deactivate();
        }
        // Filter options specific to ActionNode
        const filteredOptions = {};
        for (const key in newOptions) {
            if (Object.prototype.hasOwnProperty.call(newOptions, key) && ACTION_CONFIG_KEYS.has(key)) {
                filteredOptions[key] = newOptions[key];
            }
        }
        ObjectManipulator.deepMerge(this.#settings, filteredOptions);
        if (isCurrentlyActive) {
            this.activate();
        }
        return this;
    }

    setProcessingState(isProcessing) {
        if (isProcessing) {
            this.addStyleClass(this.retrieveSetting('processingClass'));
            this.element.disabled = true;
        } else {
            this.removeStyleClass(this.retrieveSetting('processingClass'));
            this.element.disabled = false;
        }
        return this;
    }

    enable() {
        this.element.disabled = false;
        this.removeStyleClass(this.retrieveSetting('disabledClass'));
        return this;
    }

    disable() {
        this.element.disabled = true;
        this.addStyleClass(this.retrieveSetting('disabledClass'));
        return this;
    }
}

// Main Form Processor class
class FormProcessor {
    static #controllerRegistry = new WeakMap();
    static #FORM_ACTIVATION_ATTRIBUTE = 'form-activated';

    #managedForm;
    #settings;
    #inputHandlers = new Map();
    #actionTriggers = new Map();
    #lockedState = 0;
    #heldState = 0;
    #invalidCount = 0;
    #isActive = false;

    constructor(targetForm, options) {
        let formElement;
        if (typeof targetForm === 'string') {
            formElement = document.forms[targetForm] || document.querySelector(targetForm);
        } else {
            formElement = targetForm;
        }

        if (!DomManipulator.isFormElement(formElement)) {
            return null;
        }

        const existingInstance = FormProcessor.#controllerRegistry.get(formElement);
        if (existingInstance) {
            existingInstance.applySettings(options);
            return existingInstance;
        }

        this.#managedForm = formElement;
        this.#settings = ObjectManipulator.deepCopy(DEFAULT_OPTIONS_SCHEMA);
        this.applySettings(options);

        DomManipulator.setElementAttribute(this.#managedForm, FormProcessor.#FORM_ACTIVATION_ATTRIBUTE, '1');
        DomManipulator.setElementAttribute(this.#managedForm, 'novalidate', 'novalidate');

        this.activate();
        FormProcessor.#controllerRegistry.set(this.#managedForm, this);
        return this;
    }

    static acquire(targetForm, options) {
        return new FormProcessor(targetForm, options);
    }

    activate() {
        if (this.#isActive) return this;
        this.#isActive = true;

        this.#inputHandlers.clear();
        this.#actionTriggers.clear();
        this.#lockedState = 0;
        this.#heldState = 0;
        this.#invalidCount = 0;

        this.xhrRegistry = new Map();
        this.xhrTimeoutRegistry = new Map();

        let submitButtonElement = this.retrieveSetting('submissionActivator');
        if (submitButtonElement) {
            if (typeof submitButtonElement === 'string') {
                submitButtonElement = this.#managedForm.querySelector(submitButtonElement);
            }
            if (submitButtonElement && BUTTON_KIND_SET.has(submitButtonElement.type)) {
                this.#actionTriggers.set('submit', new ActionNode(this, submitButtonElement, this.retrieveSetting('buttonSettings').submit));
            }
        }

        Array.from(this.#managedForm.elements).forEach(element => {
            const elementType = element.type;
            const elementName = DomManipulator.getElementAttribute(element, 'name');

            if (INPUT_KIND_SET.has(elementType) && elementName) {
                const inputOptions = this.retrieveSetting('inputSettings')[elementName];
                this.#inputHandlers.set(elementName, new InputNode(this, element, inputOptions));
            }

            if (BUTTON_KIND_SET.has(elementType)) {
                const buttonName = (elementType === 'submit') ? 'submit' : elementName;
                if (buttonName && !(buttonName === 'submit' && this.#actionTriggers.has('submit'))) {
                    const buttonOptions = this.retrieveSetting('buttonSettings')[buttonName];
                    this.#actionTriggers.set(buttonName, new ActionNode(this, element, buttonOptions));
                }
            }
        });

        this.#managedForm.addEventListener('submit', this.#handleFormSubmission.bind(this));

        this.verifyIntegrity({ suppressHighlight: true, triggerEvents: false, silent: true });
        this.manageSubmissionButtonState();
        return this;
    }

    deactivate() {
        if (!this.#isActive) return this;
        this.#isActive = false;

        this.#managedForm.removeEventListener('submit', this.#handleFormSubmission.bind(this));

        this.#inputHandlers.forEach(handler => handler.deactivate());
        this.#actionTriggers.forEach(trigger => trigger.deactivate());

        this.#inputHandlers.clear();
        this.#actionTriggers.clear();

        this.xhrRegistry.forEach(xhr => xhr.abort());
        this.xhrRegistry.clear();
        this.xhrTimeoutRegistry.forEach(timer => clearTimeout(timer));
        this.xhrTimeoutRegistry.clear();

        DomManipulator.setElementAttribute(this.#managedForm, FormProcessor.#FORM_ACTIVATION_ATTRIBUTE, null);

        return this;
    }

    resetConfiguration() {
        this.deactivate();
        this.#settings = ObjectManipulator.deepCopy(DEFAULT_OPTIONS_SCHEMA);
        this.activate();
        return this;
    }

    updateInvalidCount(change) {
        this.#invalidCount = Math.max(0, this.#invalidCount + change);
    }

    verifyIntegrity(options) {
        let allValid = true;
        this.#invalidCount = 0; // Reset count before re-validation

        for (const handler of this.#inputHandlers.values()) {
            if (!handler.verifyIntegrity(options)) {
                allValid = false;
            }
        }
        // Recalculate based on final states of all handlers
        this.#invalidCount = Array.from(this.#inputHandlers.values()).filter(handler => !handler.isValid()).length;

        return allValid;
    }

    extractPayload() {
        const dataObject = {};
        Array.from(this.#managedForm.elements).forEach(element => {
            const elementName = DomManipulator.getElementAttribute(element, 'name');
            if (!elementName) return;

            if (element.type === 'checkbox') {
                dataObject[elementName] = element.checked;
            } else if (element.type === 'radio') {
                if (element.checked) {
                    dataObject[elementName] = element.value;
                } else if (!dataObject[elementName]) {
                    dataObject[elementName] = '';
                }
            } else if (!BUTTON_KIND_SET.has(element.type)) {
                dataObject[elementName] = element.value;
            }
        });
        return dataObject;
    }

    retrieveSetting(key) {
        return this.#settings[key];
    }

    applySettings(newOptions) {
        const isCurrentlyActive = this.#isActive;
        if (isCurrentlyActive) {
            this.deactivate();
        }
        const filteredProcessorOptions = {};
        for (const key in newOptions) {
            if (Object.prototype.hasOwnProperty.call(newOptions, key) && PROCESSOR_CONFIG_KEYS.has(key)) {
                filteredProcessorOptions[key] = newOptions[key];
            }
        }
        ObjectManipulator.deepMerge(this.#settings, filteredProcessorOptions);

        if (newOptions?.inputSettings) {
            ObjectManipulator.deepMerge(this.#settings.inputSettings, newOptions.inputSettings);
        }
        if (newOptions?.buttonSettings) {
            ObjectManipulator.deepMerge(this.#settings.buttonSettings, newOptions.buttonSettings);
        }

        if (isCurrentlyActive) {
            this.activate();
        }
        return this;
    }

    getDatumNode(name) {
        return this.#inputHandlers.get(name);
    }

    getActionButton(name) {
        return this.#actionTriggers.get(name);
    }

    assignSubmissionHandler(handler) {
        if (typeof handler === 'function') {
            this.#settings.onSubmitCallback = handler;
        }
        return this;
    }

    manageSubmissionButtonState(forceValidState) {
        const submissionButton = this.getActionButton('submit');
        const controlEnabled = this.retrieveSetting('submitControlEnabled');

        const formIsCurrentlyValid = (this.#invalidCount === 0 && this.#heldState === 0 && this.#lockedState === 0);
        const finalValidState = (forceValidState === true || forceValidState === false) ? forceValidState : formIsCurrentlyValid;

        if (submissionButton && controlEnabled) {
            if (finalValidState) {
                submissionButton.enable();
            } else {
                submissionButton.disable();
            }
        }
        return this;
    }

    disableSubmission() {
        return this.manageSubmissionButtonState(false);
    }

    enableSubmission() {
        return this.manageSubmissionButtonState(true);
    }

    setProcessingState(isProcessing) {
        const submissionButton = this.getActionButton('submit');
        if (submissionButton) {
            submissionButton.setProcessingState(isProcessing);
        }
        return this;
    }

    preventModification(count = 1) {
        this.#lockedState += count;
        return this.manageSubmissionButtonState(false);
    }

    allowModification(count = 1) {
        this.#lockedState = Math.max(0, this.#lockedState - count);
        return this.manageSubmissionButtonState();
    }

    invokeCallback(callbackName, context, params) {
        let callback = this.retrieveSetting(callbackName);
        if (typeof callback === 'function') {
            return callback.apply(context, params || []);
        }
        return null;
    }

    #handleFormSubmission(event) {
        const submissionButton = this.getActionButton('submit');
        const controlEnabled = this.retrieveSetting('submitControlEnabled');
        const customSubmissionHandler = typeof this.retrieveSetting('onSubmitCallback') === 'function';
        const processingClass = submissionButton?.retrieveSetting('processingClass');

        if ((submissionButton && submissionButton.hasStyleClass(processingClass)) || this.#lockedState > 0) {
            DomManipulator.preventEventDefault(event);
            return false;
        }

        const formIsValid = this.verifyIntegrity();
        const shouldPreventDefault = formIsValid && customSubmissionHandler;

        if (shouldPreventDefault) {
            DomManipulator.preventEventDefault(event);
        }

        if (formIsValid) {
            if (controlEnabled) {
                submissionButton?.setProcessingState(true);
            }
            if (customSubmissionHandler) {
                this.invokeCallback('onSubmitCallback', this.#managedForm, [event, this]);
                DomManipulator.preventEventDefault(event);
                return false;
            }
        } else {
            DomManipulator.preventEventDefault(event);
            submissionButton?.setProcessingState(false);
            return false;
        }

        return true;
    }
}

window.FormProcessor = FormProcessor;