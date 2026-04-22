const AppVerification = {};

AppVerification.DomHelper = (function() {
    const isBlank = (val) => val === null || val === undefined || val === '';
    const isListEmpty = (arr) => arr === null || arr === undefined || arr.length === 0;

    const tryParseFloat = (text) => {
        if (typeof text !== 'string') return NaN;
        let num = parseFloat(text);
        if (!isNaN(num)) return num;

        if (text.includes(',') && !text.includes('.')) {
            num = parseFloat(text.replace(/,/g, '.'));
            if (!isNaN(num)) return num;
        }
        return NaN;
    };

    const findElementsByNameInScope = (scopeElement, name) => {
        const matchingElements = [];
        const allNamedElements = document.getElementsByName(name);
        for (let i = 0; i < allNamedElements.length; i++) {
            const currentElement = allNamedElements[i];
            if (scopeElement.contains(currentElement)) {
                matchingElements.push(currentElement);
            }
        }
        return matchingElements;
    };

    const clearChildren = (parent) => {
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
    };

    const writeTextContent = (element, text) => {
        if (element) {
            element.textContent = text;
        }
    };

    const addCssClass = (element, className) => {
        if (element && className) {
            element.classList.add(className);
        }
    };

    const removeCssClass = (element, className) => {
        if (element && className) {
            element.classList.remove(className);
        }
    };

    const hasEventSupport = (element, eventName) => {
        if (eventName === 'onpropertychange') {
            return 'onpropertychange' in element;
        }
        return `on${eventName.toLowerCase()}` in element;
    };

    return {
        isEmptyText: isBlank,
        isEmptyList: isListEmpty,
        numericParser: tryParseFloat,
        getScopedElements: findElementsByNameInScope,
        clearElementChildren: clearChildren,
        setElementText: writeTextContent,
        applyClass: addCssClass,
        stripClass: removeCssClass,
        elementSupportsEvent: hasEventSupport,
        fetchElementById: (id) => document.getElementById(id)
    };
})();

AppVerification.createRuleOutcome = () => ({
    fieldErrorMessage: '',
    validator: null
});

AppVerification.createFieldConfig = () => ({
    FieldName: '',
    ValidationMessageId: '',
    ReplaceValidationMessageContents: false,
    ValidationRules: []
});

AppVerification.createFormConfig = () => ({
    FormId: '',
    ValidationSummaryId: '',
    ReplaceValidationSummary: false,
    Fields: []
});

AppVerification.createValidationRule = () => ({
    ErrorMessage: '',
    RuleName: '',
    ValidationParameters: {}
});

AppVerification.createVerificationState = () => ({});


class NumericVerifier {
    constructor() {
        this.check = this.check.bind(this);
    }

    check(valToExamine, stateInfo) {
        if (AppVerification.DomHelper.isEmptyText(valToExamine)) {
            return true;
        }
        const parsedNum = AppVerification.DomHelper.numericParser(valToExamine);
        return (!isNaN(parsedNum));
    }

    static generate(ruleConfig) {
        return new NumericVerifier().check;
    }
}
AppVerification.NumericVerifier = NumericVerifier;


AppVerification.RuleRegistry = (function() {
    const knownVerifiers = {
        'number': AppVerification.NumericVerifier.generate,
    };

    const retrieveVerifier = (ruleConfig) => {
        const generator = knownVerifiers[ruleConfig.RuleName];
        if (generator) {
            return generator(ruleConfig);
        }
        return null;
    };

    return {
        retrieveVerifier: retrieveVerifier
    };
})();


class InputOverseer {
    static _changedFlag = new WeakMap();
    static _firedFlag = new WeakMap();

    static _inputErrorClass = 'input-failure-style';
    static _inputValidClass = 'input-success-style';
    static _messageErrorClass = 'message-failure-style';
    static _messageValidClass = 'message-success-style';

    constructor(parentOverseer) {
        this._issueList = [];
        this.targetElements = [];
        this.verificationRules = [];
        this.parentOverseer = parentOverseer;
        this.updateMessageContent = false;
        this.messageDisplayElement = null;
        this.defaultIssueMessage = null;

        this._handleBlur = this._onBlurEvent.bind(this);
        this._handleChange = this._onChangeEvent.bind(this);
        this._handleInput = this._onInputEvent.bind(this);
        this._handlePropertyChange = this._onPropertyChangeEvent.bind(this);
    }

    appendIssue(msg) {
        this.appendIssues([msg]);
    }

    appendIssues(messages) {
        if (!AppVerification.DomHelper.isEmptyList(messages)) {
            this._issueList.push(...messages);
            this._onIssueCountChange();
        }
    }

    clearIssues() {
        this._issueList.length = 0;
        this._onIssueCountChange();
    }

    _showIssueFeedback() {
        const msgElem = this.messageDisplayElement;
        if (msgElem) {
            if (this.updateMessageContent) {
                AppVerification.DomHelper.setElementText(msgElem, this._issueList[0]);
            }
            AppVerification.DomHelper.stripClass(msgElem, InputOverseer._messageValidClass);
            AppVerification.DomHelper.applyClass(msgElem, InputOverseer._messageErrorClass);
        }
        for (const elem of this.targetElements) {
            AppVerification.DomHelper.stripClass(elem, InputOverseer._inputValidClass);
            AppVerification.DomHelper.applyClass(elem, InputOverseer._inputErrorClass);
        }
    }

    _showSuccessFeedback() {
        const msgElem = this.messageDisplayElement;
        if (msgElem) {
            if (this.updateMessageContent) {
                AppVerification.DomHelper.setElementText(msgElem, '');
            }
            AppVerification.DomHelper.stripClass(msgElem, InputOverseer._messageErrorClass);
            AppVerification.DomHelper.applyClass(msgElem, InputOverseer._messageValidClass);
        }
        for (const elem of this.targetElements) {
            AppVerification.DomHelper.stripClass(elem, InputOverseer._inputErrorClass);
            AppVerification.DomHelper.applyClass(elem, InputOverseer._inputValidClass);
        }
    }

    _onBlurEvent(event) {
        const elem = event.target;
        if (InputOverseer._changedFlag.get(elem) || InputOverseer._firedFlag.get(elem)) {
            this.verify('blur');
        }
    }

    _onChangeEvent(event) {
        InputOverseer._changedFlag.set(event.target, true);
    }

    _onInputEvent(event) {
        InputOverseer._changedFlag.set(event.target, true);
        if (InputOverseer._firedFlag.get(event.target)) {
            this.verify('input');
        }
    }

    _onPropertyChangeEvent(event) {
        if (event.propertyName === 'value') {
            InputOverseer._changedFlag.set(event.target, true);
            if (InputOverseer._firedFlag.get(event.target)) {
                this.verify('input');
            }
        }
    }

    activateDynamicVerification() {
        for (const elem of this.targetElements) {
            if (AppVerification.DomHelper.elementSupportsEvent(elem, 'onpropertychange')) {
                const compatMode = document.documentMode;
                if (compatMode && compatMode >= 8) { // Preserve original IE check
                    elem.addEventListener('propertychange', this._handlePropertyChange);
                }
            } else {
                elem.addEventListener('input', this._handleInput);
            }
            elem.addEventListener('change', this._handleChange);
            elem.addEventListener('blur', this._handleBlur);
        }
    }

    _getIssueText(verifierResult, fieldIssueMsg) {
        if (verifierResult === true) {
            return null;
        }
        if (typeof verifierResult === 'string') {
            return verifierResult;
        }
        return fieldIssueMsg || this.defaultIssueMessage;
    }

    _onIssueCountChange() {
        if (!this._issueList.length) {
            this._showSuccessFeedback();
        } else {
            this._showIssueFeedback();
        }
    }

    verify(triggerEventName) {
        this.clearIssues();
        const currentFieldIssues = [];
        const firstElement = this.targetElements[0];
        if (!firstElement) {
            return currentFieldIssues;
        }

        InputOverseer._firedFlag.set(firstElement, true);

        for (const verification of this.verificationRules) {
            const val = firstElement.value;
            const state = AppVerification.createVerificationState();

            const result = verification.validator(val, state);
            const issueMsg = this._getIssueText(result, verification.fieldErrorMessage);

            if (issueMsg) {
                currentFieldIssues.push(issueMsg);
            }
        }

        if (currentFieldIssues.length > 0) {
            this.appendIssues(currentFieldIssues);
        }
        return currentFieldIssues;
    }
}
AppVerification.InputOverseer = InputOverseer;


class FormOverseer {
    static _formDataTag = new WeakMap();

    static _summaryErrorClass = 'summary-error-style';
    static _summaryValidClass = 'summary-valid-style';

    constructor(frmElement, summaryElement) {
        this._reportedIssues = [];
        this.managedFields = [];
        this._associatedForm = frmElement;
        this._summaryDisplayElement = summaryElement;
        this._summaryListElement = null;
        this.overrideSummaryContent = false;
        this._lastSubmitInitiator = null;

        FormOverseer._formDataTag.set(frmElement, this);

        if (summaryElement) {
            const listElements = summaryElement.getElementsByTagName('ul');
            if (listElements.length > 0) {
                this._summaryListElement = listElements[0];
            }
        }

        this._clickHandler = this._onFormClick.bind(this);
        this._submitHandler = this._onFormSubmit.bind(this);
    }

    appendReportedIssue(message) {
        this.appendReportedIssues([message]);
    }

    appendReportedIssues(messages) {
        if (!AppVerification.DomHelper.isEmptyList(messages)) {
            this._reportedIssues.push(...messages);
            this._onReportedIssueCountChange();
        }
    }

    clearReportedIssues() {
        this._reportedIssues.length = 0;
        this._onReportedIssueCountChange();
    }

    _presentIssueSummary() {
        if (this._summaryDisplayElement) {
            if (this._summaryListElement) {
                AppVerification.DomHelper.clearElementChildren(this._summaryListElement);
                for (const issue of this._reportedIssues) {
                    const listItem = document.createElement('li');
                    AppVerification.DomHelper.setElementText(listItem, issue);
                    this._summaryListElement.appendChild(listItem);
                }
            }
            AppVerification.DomHelper.stripClass(this._summaryDisplayElement, FormOverseer._summaryValidClass);
            AppVerification.DomHelper.applyClass(this._summaryDisplayElement, FormOverseer._summaryErrorClass);
        }
    }

    _presentSuccessSummary() {
        const summaryElem = this._summaryDisplayElement;
        if (summaryElem) {
            const summaryListElem = this._summaryListElement;
            if (summaryListElem) {
                summaryListElem.innerHTML = '';
            }
            AppVerification.DomHelper.stripClass(summaryElem, FormOverseer._summaryErrorClass);
            AppVerification.DomHelper.applyClass(summaryElem, FormOverseer._summaryValidClass);
        }
    }

    activateVerificationLifecycle() {
        this._associatedForm.addEventListener('click', this._clickHandler);
        this._associatedForm.addEventListener('submit', this._submitHandler);
    }

    _identifySubmitTrigger(triggeredElement) {
        if (triggeredElement.disabled) {
            return null;
        }
        const tag = triggeredElement.tagName.toUpperCase();
        if (tag === 'INPUT' && ['SUBMIT', 'IMAGE'].includes(triggeredElement.type.toUpperCase())) {
            return triggeredElement;
        }
        if (tag === 'BUTTON' && triggeredElement.type.toUpperCase() === 'SUBMIT') {
            return triggeredElement;
        }
        return null;
    }

    _onFormClick(event) {
        this._lastSubmitInitiator = this._identifySubmitTrigger(event.target);
    }

    _onFormSubmit(event) {
        const submitBtn = this._lastSubmitInitiator;
        if (submitBtn && submitBtn.disableValidation) {
            return;
        }
        const issuesFound = this.performVerification('submit');
        if (!AppVerification.DomHelper.isEmptyList(issuesFound)) {
            event.preventDefault();
        }
    }

    _onReportedIssueCountChange() {
        if (!this._reportedIssues.length) {
            this._presentSuccessSummary();
        } else {
            this._presentIssueSummary();
        }
    }

    performVerification(triggerName) {
        const fieldsToVerify = this.managedFields;
        const collectedIssues = [];
        for (const fieldOverseer of fieldsToVerify) {
            if (fieldOverseer.targetElements.length > 0 && fieldOverseer.targetElements[0].disabled) {
                continue;
            }
            const fieldIssues = fieldOverseer.verify(triggerName);
            if (fieldIssues) {
                collectedIssues.push(...fieldIssues);
            }
        }
        if (this.overrideSummaryContent) {
            this.clearReportedIssues();
            this.appendReportedIssues(collectedIssues);
        }
        return collectedIssues;
    }

    static getInstanceForForm(frmElement) {
        return FormOverseer._formDataTag.get(frmElement);
    }

    static processMetadata(configData) {
        const formEl = AppVerification.DomHelper.fetchElementById(configData.FormId);
        const summaryEl = (!AppVerification.DomHelper.isEmptyText(configData.ValidationSummaryId)) ?
            AppVerification.DomHelper.fetchElementById(configData.ValidationSummaryId) : null;

        const overseerInstance = new FormOverseer(formEl, summaryEl);
        overseerInstance.activateVerificationLifecycle();
        overseerInstance.overrideSummaryContent = configData.ReplaceValidationSummary;

        for (const fieldData of configData.Fields) {
            const fieldElements = AppVerification.DomHelper.getScopedElements(formEl, fieldData.FieldName);
            const msgElement = (!AppVerification.DomHelper.isEmptyText(fieldData.ValidationMessageId)) ?
                AppVerification.DomHelper.fetchElementById(fieldData.ValidationMessageId) : null;

            const fieldOverseer = new InputOverseer(overseerInstance);
            fieldOverseer.targetElements.push(...fieldElements);
            fieldOverseer.messageDisplayElement = msgElement;
            fieldOverseer.updateMessageContent = fieldData.ReplaceValidationMessageContents;

            for (const ruleData of fieldData.ValidationRules) {
                const verifierFn = AppVerification.RuleRegistry.retrieveVerifier(ruleData);
                if (verifierFn) {
                    const ruleOutcome = AppVerification.createRuleOutcome();
                    ruleOutcome.fieldErrorMessage = ruleData.ErrorMessage;
                    ruleOutcome.validator = verifierFn;
                    fieldOverseer.verificationRules.push(ruleOutcome);
                }
            }
            fieldOverseer.activateDynamicVerification();
            overseerInstance.managedFields.push(fieldOverseer);
        }

        if (!formEl.verificationCallbacks) {
            formEl.verificationCallbacks = [];
        }
        formEl.verificationCallbacks.push(() => {
            return AppVerification.DomHelper.isEmptyList(overseerInstance.performVerification('submit'));
        });

        return overseerInstance;
    }

    static applicationInit() {
        const allFormConfigs = window.mvcClientValidationMetadata;
        if (allFormConfigs) {
            while (allFormConfigs.length > 0) {
                const currentFormConfig = allFormConfigs.pop();
                FormOverseer.processMetadata(currentFormConfig);
            }
        }
    }
}
AppVerification.FormOverseer = FormOverseer;

document.addEventListener('DOMContentLoaded', AppVerification.FormOverseer.applicationInit);