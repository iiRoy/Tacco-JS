// !----------------------------------------------------------
// ! Copyright (C) Web Application Framework. All rights reserved.
// !----------------------------------------------------------
// ! webValidationLogic.js

// Initialize the primary application namespace
WebApp = {};
WebApp.Namespace = {
    register: function(namespacePath) {
        let pathSegments = namespacePath.split('.');
        let currentScope = window;
        for (let i = 0; i < pathSegments.length; i++) {
            currentScope = currentScope[pathSegments[i]] = currentScope[pathSegments[i]] || {};
        }
    }
};

// Utility functions for binding methods
WebApp.FuncUtil = {
    createBoundMethod: function(instanceObject, targetMethod) {
        return function() {
            return targetMethod.apply(instanceObject, arguments);
        };
    }
};

// Helper methods for DOM manipulation and event handling
Web = {};
Web.UI = {};
Web.UI.utilityHelpers = {
    isStringEmptyOrNull: function(checkString) {
        return !checkString || checkString.length === 0;
    },
    isArrayEmptyOrNull: function(checkArray) {
        return !checkArray || checkArray.length === 0;
    },
    removeAllChildren: function(parentNode) {
        if (parentNode) {
            while (parentNode.firstChild) {
                parentNode.removeChild(parentNode.firstChild);
            }
        }
    },
    setTextContent: function(targetNode, newText) {
        if (targetNode) {
            targetNode.textContent = newText;
        }
    },
    nodeSupportsEvent: function(targetNode, eventNameString) {
        // A basic check for event support, might need more robust implementation for edge cases.
        return typeof targetNode['on' + eventNameString] !== 'undefined';
    }
};

Web.UI.DomNodeHelper = {
    removeClass: function(domNode, cssClass) {
        if (domNode && domNode.classList) {
            domNode.classList.remove(cssClass);
        }
    },
    addClass: function(domNode, cssClass) {
        if (domNode && domNode.classList) {
            domNode.classList.add(cssClass);
        }
    }
};

Web.UI.DomEventHelper = {
    addEventHandler: function(domNode, eventType, handlerFunction) {
        if (domNode && domNode.addEventListener) {
            domNode.addEventListener(eventType, handlerFunction, false);
        } else if (domNode && domNode.attachEvent) { // Backward compatibility for older IE
            domNode.attachEvent('on' + eventType, handlerFunction);
        }
    }
};

Web.UI.CheckerRegistry = {
    // This object would hold references to various validator functions based on rule types.
    retrieveChecker: function(ruleConfiguration) {
        // Placeholder for actual validator retrieval logic.
        // In a real system, this would map ruleConfiguration.RuleName to a function.
        // For cloning, we just need to ensure the call structure is maintained.
        return ruleConfiguration ? function() { return true; } : null; // Dummy checker
    }
};

WebApp.Namespace.register('Web.UI');

// A generic object for holding validation state.
Web.UI.makeValidationObject = function Web_UI_ValidationObject() { return {}; }

// Represents a field's configuration for JSON-based validation.
Web.UI.makeJsonCheckField = function Web_UI_JsonCheckField() { return {}; }

// Represents overall options for JSON-based validation.
Web.UI.makeJsonCheckOptions = function Web_UI_JsonCheckOptions() { return {}; }

// Represents a single validation rule from JSON.
Web.UI.makeJsonCheckRule = function Web_UI_JsonCheckRule() { return {}; }

// Provides context for a validation operation.
Web.UI.makeCheckContext = function Web_UI_CheckContext() { return {}; }


// Validator for numeric inputs.
Web.UI.NumericInputChecker = function Web_UI_NumericInputChecker() {
}
Web.UI.NumericInputChecker.createInstance = function Web_UI_NumericInputChecker_createInstance(validationRuleConfig) {
    /// <param name="validationRuleConfig" type="Web.UI.JsonCheckRule">
    /// Configuration for the numeric check.
    /// </param>
    /// <returns type="Web.UI.InputValidator"></returns>
    return WebApp.FuncUtil.createBoundMethod(new Web.UI.NumericInputChecker(), (new Web.UI.NumericInputChecker()).checkValue);
}
Web.UI.NumericInputChecker.prototype = {

    checkValue: function Web_UI_NumericInputChecker_checkValue(inputData, processContext) {
        /// <param name="inputData" type="String">
        /// The string value to be validated.
        /// </param>
        /// <param name="processContext" type="Web.UI.CheckContext">
        /// Context information for the validation.
        /// </param>
        /// <returns type="Object"></returns>
        // If the input is empty or null, it's considered valid (absence of value is not a numeric error).
        if (Web.UI.utilityHelpers.isStringEmptyOrNull(inputData)) {
            return true;
        }
        // Attempt to parse the value using locale-specific number parsing.
        var parsedNum = Number.parseLocalised(inputData);
        // Return true if the parsed number is not 'Not-a-Number'.
        return (!Number.isNaN(parsedNum));
    }
}


// Manages validation for an entire HTML form.
Web.UI.FormProcessor = function Web_UI_FormProcessor(htmlFormElement, summaryDisplayElement) {
    /// <param name="htmlFormElement" type="Object" domElement="true">
    /// The HTML form element to be processed.
    /// </param>
    /// <param name="summaryDisplayElement" type="Object" domElement="true">
    /// The DOM element for displaying a validation summary.
    /// </param>
    /// <field name="_summaryErrorStyleClass" type="String" static="true">
    /// CSS class for error state of the summary.
    /// </field>
    /// <field name="_summaryValidStyleClass" type="String" static="true">
    /// CSS class for valid state of the summary.
    /// </field>
    /// <field name="_formCheckIdentifier" type="String" static="true">
    /// Identifier used to attach this processor to the form element.
    /// </field>
    /// <field name="_clickEventHandler" type="Sys.UI.DomEventHandler">
    /// Handler for click events on the form.
    /// </field>
    /// <field name="_submitEventHandler" type="Sys.UI.DomEventHandler">
    /// Handler for form submission events.
    /// </field>
    /// <field name="_faultMessages" type="Array">
    /// Collection of accumulated error messages for the form.
    /// </field>
    /// <field name="_triggeredSubmitButton" type="Object" domElement="true">
    /// The specific submit button that was clicked.
    /// </field>
    /// <field name="_summaryDisplayNode" type="Object" domElement="true">
    /// Reference to the validation summary display element.
    /// </field>
    /// <field name="_summaryListNode" type="Object" domElement="true">
    /// Reference to the unordered list within the summary element.
    /// </field>
    /// <field name="formFields" type="Array" elementType="FieldProcessor">
    /// List of field processors associated with this form.
    /// </field>
    /// <field name="_targetFormNode" type="Object" domElement="true">
    /// Reference to the main HTML form element.
    /// </field>
    /// <field name="overrideSummaryContent" type="Boolean">
    /// Flag to indicate if the summary content should be replaced.
    /// </field>
    this._faultMessages = [];
    this.formFields = [];
    this._targetFormNode = htmlFormElement;
    this._summaryDisplayNode = summaryDisplayElement;
    // Attach this form processor instance to the form element itself using a unique tag.
    htmlFormElement[Web.UI.FormProcessor._formCheckIdentifier] = this;
    if (summaryDisplayElement) {
        // Look for an unordered list inside the summary display element.
        var listElements = summaryDisplayElement.getElementsByTagName('ul');
        if (listElements.length > 0) {
            this._summaryListNode = listElements[0];
        }
    }
    // Create delegates for event handlers to ensure 'this' context is correct.
    this._clickEventHandler = WebApp.FuncUtil.createBoundMethod(this, this._handleFormClick);
    this._submitEventHandler = WebApp.FuncUtil.createBoundMethod(this, this._handleFormSubmit);
}
// Static method: Handles application load to process form validation metadata.
Web.UI.FormProcessor._App_Load = function Web_UI_FormProcessor_App_Load() {
    var allFormConfigurations = window.clientFormChecksData; // Global variable holding validation metadata.
    if (allFormConfigurations) {
        // Process configurations one by one, removing them from the array.
        while (allFormConfigurations.length > 0) {
            var currentFormConfig = allFormConfigurations.pop();
            Web.UI.FormProcessor.processJsonConfigurations(currentFormConfig);
        }
    }
}
// Static method: Retrieves form elements by name within a specific form.
Web.UI.FormProcessor._getNamedFormElements = function Web_UI_FormProcessor_getNamedFormElements(parentFormNode, elementName) {
    /// <param name="parentFormNode" type="Object" domElement="true">
    /// The parent form element to search within.
    /// </param>
    /// <param name="elementName" type="String">
    /// The 'name' attribute of the elements to find.
    /// </param>
    /// <returns type="Array" elementType="Object" elementDomElement="true"></returns>
    var matchingElementsInForm = [];
    var allNamedElements = document.getElementsByName(elementName); // Get all elements with this name globally.
    for (var i = 0; i < allNamedElements.length; i++) {
        var thisElement = allNamedElements[i];
        // Check if the found element is actually a descendant of the target form.
        if (Web.UI.FormProcessor._isElementWithinParent(parentFormNode, thisElement)) {
            matchingElementsInForm.push(thisElement); // Add to the results.
        }
    }
    return matchingElementsInForm;
}
// Static method: Retrieves the FormProcessor instance for a given form element.
Web.UI.FormProcessor.getChecksForForm = function Web_UI_FormProcessor_getChecksForForm(targetFormNode) {
    /// <param name="targetFormNode" type="Object" domElement="true">
    /// The HTML form element.
    /// </param>
    /// <returns type="Web.UI.FormProcessor"></returns>
    return targetFormNode[Web.UI.FormProcessor._formCheckIdentifier];
}
// Static method: Checks if a child element is contained within a parent element's hierarchy.
Web.UI.FormProcessor._isElementWithinParent = function Web_UI_FormProcessor_isElementWithinParent(ancestorNode, descendantNode) {
    /// <param name="ancestorNode" type="Object" domElement="true">
    /// The potential parent element.
    /// </param>
    /// <param name="descendantNode" type="Object" domElement="true">
    /// The potential child element.
    /// </param>
    /// <returns type="Boolean"></returns>
    while (descendantNode) {
        if (ancestorNode === descendantNode) {
            return true;
        }
        descendantNode = descendantNode.parentNode;
    }
    return false;
}
// Static method: Parses JSON validation options and initializes a FormProcessor.
Web.UI.FormProcessor.processJsonConfigurations = function Web_UI_FormProcessor_processJsonConfigurations(configOptions) {
    /// <param name="configOptions" type="Web.UI.JsonCheckOptions">
    /// JSON object containing form validation configuration.
    /// </param>
    /// <returns type="Web.UI.FormProcessor"></returns>
    // Retrieve form and summary elements by their IDs.
    var htmlFormElement = document.getElementById(configOptions.FormIdentifier);
    var summaryDisplayElement = (!Web.UI.utilityHelpers.isStringEmptyOrNull(configOptions.SummaryIdentifier)) ? document.getElementById(configOptions.SummaryIdentifier) : null;
    // Create a new FormProcessor instance.
    var formProcessingInstance = new Web.UI.FormProcessor(htmlFormElement, summaryDisplayElement);
    formProcessingInstance.activateLiveChecks(); // Enable dynamic validation.
    formProcessingInstance.overrideSummaryContent = configOptions.ReplaceSummaryContent;
    // Iterate through each field configuration.
    for (var i = 0; i < configOptions.InputFields.length; i++) {
        var inputFieldConfig = configOptions.InputFields[i];
        // Get all elements belonging to this field within the form.
        var inputNodes = Web.UI.FormProcessor._getNamedFormElements(htmlFormElement, inputFieldConfig.ElementName);
        // Get the validation message display element for this field.
        var messageDisplayNode = (!Web.UI.utilityHelpers.isStringEmptyOrNull(inputFieldConfig.MessageIdentifier)) ? document.getElementById(inputFieldConfig.MessageIdentifier) : null;
        // Create a new FieldProcessor for this field.
        var fieldProcessingInstance = new Web.UI.FieldProcessor(formProcessingInstance);
        fieldProcessingInstance.inputNodes.push(...inputNodes); // Add elements to the field processor.
        fieldProcessingInstance.messageDisplayNode = messageDisplayNode;
        fieldProcessingInstance.replaceMessageContent = inputFieldConfig.ReplaceMessageContent;
        // Iterate through each validation rule for the current field.
        for (var j = 0; j < inputFieldConfig.CheckRules.length; j++) {
            var validationRule = inputFieldConfig.CheckRules[j];
            var checker = Web.UI.CheckerRegistry.retrieveChecker(validationRule); // Get the actual validator function.
            if (checker) {
                var validationObject = Web.UI.makeValidationObject(); // Create a validation object.
                validationObject.fieldIssueMessage = validationRule.IssueMessage;
                validationObject.checker = checker;
                fieldProcessingInstance.checks.push(validationObject); // Add to the field's validations.
            }
        }
        fieldProcessingInstance.activateLiveChecks(); // Enable dynamic validation for this field.
        formProcessingInstance.formFields.push(fieldProcessingInstance); // Add field processor to the form processor.
    }
    // Register a callback function for form submission.
    var registeredCheckFunctions = htmlFormElement.checkCallbacks;
    if (!registeredCheckFunctions) {
        registeredCheckFunctions = [];
        htmlFormElement.checkCallbacks = registeredCheckFunctions;
    }
    registeredCheckFunctions.push(WebApp.FuncUtil.createBoundMethod(null, function() {
        return Web.UI.utilityHelpers.isArrayEmptyOrNull(formProcessingInstance.assessValidity('submission'));
    }));
    return formProcessingInstance;
}
Web.UI.FormProcessor.prototype = {
    _clickEventHandler: null,
    _submitEventHandler: null,
    _triggeredSubmitButton: null,
    _summaryDisplayNode: null,
    _summaryListNode: null,
    _targetFormNode: null,
    overrideSummaryContent: false,

    recordIssue: function Web_UI_FormProcessor_recordIssue(issueText) {
        /// <param name="issueText" type="String">
        /// The error message to add.
        /// </param>
        this.recordIssues([ issueText ]);
    },

    recordIssues: function Web_UI_FormProcessor_recordIssues(issueTexts) {
        /// <param name="issueTexts" type="Array" elementType="String">
        /// An array of error messages to add.
        /// </param>
        if (!Web.UI.utilityHelpers.isArrayEmptyOrNull(issueTexts)) {
            this._faultMessages.push(...issueTexts);
            this._onFaultCountChange();
        }
    },

    clearFaults: function Web_UI_FormProcessor_clearFaults() {
        this._faultMessages = [];
        this._onFaultCountChange();
    },

    _showFaultUI: function Web_UI_FormProcessor_showFaultUI() {
        if (this._summaryDisplayNode) {
            if (this._summaryListNode) {
                Web.UI.utilityHelpers.removeAllChildren(this._summaryListNode);
                for (var i = 0; i < this._faultMessages.length; i++) {
                    var listItemNode = document.createElement('li');
                    Web.UI.utilityHelpers.setTextContent(listItemNode, this._faultMessages[i]);
                    this._summaryListNode.appendChild(listItemNode);
                }
            }
            Web.UI.DomNodeHelper.removeClass(this._summaryDisplayNode, Web.UI.FormProcessor._summaryValidStyleClass);
            Web.UI.DomNodeHelper.addClass(this._summaryDisplayNode, Web.UI.FormProcessor._summaryErrorStyleClass);
        }
    },

    _showSuccessUI: function Web_UI_FormProcessor_showSuccessUI() {
        var summaryDisplayElement = this._summaryDisplayNode;
        if (summaryDisplayElement) {
            var summaryListNode = this._summaryListNode;
            if (summaryListNode) {
                summaryListNode.innerHTML = ''; // Clear existing list items.
            }
            Web.UI.DomNodeHelper.removeClass(summaryDisplayElement, Web.UI.FormProcessor._summaryErrorStyleClass);
            Web.UI.DomNodeHelper.addClass(summaryDisplayElement, Web.UI.FormProcessor._summaryValidStyleClass);
        }
    },

    activateLiveChecks: function Web_UI_FormProcessor_activateLiveChecks() {
        Web.UI.DomEventHelper.addEventHandler(this._targetFormNode, 'click', this._clickEventHandler);
        Web.UI.DomEventHelper.addEventHandler(this._targetFormNode, 'submit', this._submitEventHandler);
    },

    _locateSubmitButton: function Web_UI_FormProcessor_locateSubmitButton(eventTargetNode) {
        /// <param name="eventTargetNode" type="Object" domElement="true">
        /// The DOM element that was clicked.
        /// </param>
        /// <returns type="Object" domElement="true"></returns>
        if (eventTargetNode.disabled) {
            return null;
        }
        var nodeTag = eventTargetNode.tagName.toUpperCase();
        var inputNode = eventTargetNode;
        if (nodeTag === 'INPUT') {
            var buttonType = inputNode.type;
            if (buttonType === 'submit' || buttonType === 'image') {
                return inputNode;
            }
        }
        else if ((nodeTag === 'BUTTON') && (inputNode.type === 'submit')) {
            return inputNode;
        }
        return null;
    },

    _handleFormClick: function Web_UI_FormProcessor_handleFormClick(eventData) {
        /// <param name="eventData" type="Sys.UI.DomEvent">
        /// Event arguments for the click.
        /// </param>
        this._triggeredSubmitButton = this._locateSubmitButton(eventData.target);
    },

    _handleFormSubmit: function Web_UI_FormProcessor_handleFormSubmit(eventData) {
        /// <param name="eventData" type="Sys.UI.DomEvent">
        /// Event arguments for the submit.
        /// </param>
        var eventForm = eventData.target;
        var submitButton = this._triggeredSubmitButton;
        // If a submit button was clicked and it's set to skip validation, do nothing.
        if (submitButton && submitButton.skipChecks) {
            return;
        }
        var faultMessages = this.assessValidity('submission'); // Perform validation.
        if (!Web.UI.utilityHelpers.isArrayEmptyOrNull(faultMessages)) {
            eventData.preventDefault(); // Prevent form submission if there are errors.
        }
    },

    _onFaultCountChange: function Web_UI_FormProcessor_onFaultCountChange() {
        // Update the UI based on whether there are errors or not.
        if (!this._faultMessages.length) {
            this._showSuccessUI();
        }
        else {
            this._showFaultUI();
        }
    },

    assessValidity: function Web_UI_FormProcessor_assessValidity(triggerEventName) {
        /// <param name="triggerEventName" type="String">
        /// The name of the event that triggered validation (e.g., 'submission', 'blur').
        /// </param>
        /// <returns type="Array" elementType="String"></returns>
        var formFields = this.formFields;
        var faults = [];
        // Iterate through each field and validate it.
        for (var i = 0; i < formFields.length; i++) {
            var currentField = formFields[i];
            // Only validate if the first element of the field is not disabled.
            if (!currentField.inputNodes[0].isDisabled) {
                var fieldFaults = currentField.assessValidity(triggerEventName);
                if (fieldFaults) {
                    faults.push(...fieldFaults); // Collect all errors.
                }
            }
        }
        // If the summary should be replaced, clear existing and add new errors.
        if (this.overrideSummaryContent) {
            this.clearFaults();
            this.recordIssues(faults);
        }
        return faults;
    }
}


// Manages validation for a single input field or a group of related elements.
Web.UI.FieldProcessor = function Web_UI_FieldProcessor(parentFormProcessor) {
    /// <param name="parentFormProcessor" type="Web.UI.FormProcessor">
    /// The parent form processor this field belongs to.
    /// </param>
    /// <field name="_hasContentChangedFlag" type="String" static="true">
    /// Tag to mark if the field's content has changed.
    /// </field>
    /// <field name="_hasChecksRunFlag" type="String" static="true">
    /// Tag to mark if validation has been run on the field.
    /// </field>
    /// <field name="_inputFaultStyleClass" type="String" static="true">
    /// CSS class for input element error state.
    /// </field>
    /// <field name="_inputValidStyleClass" type="String" static="true">
    /// CSS class for input element valid state.
    /// </field>
    /// <field name="_messageFaultStyleClass" type="String" static="true">
    /// CSS class for validation message error state.
    /// </field>
    /// <field name="_messageValidStyleClass" type="String" static="true">
    /// CSS class for validation message valid state.
    /// </field>
    /// <field name="_blurHandler" type="Sys.UI.DomEventHandler">
    /// Handler for the blur event.
    /// </field>
    /// <field name="_changeHandler" type="Sys.UI.DomEventHandler">
    /// Handler for the change event.
    /// </field>
    /// <field name="_inputHandler" type="Sys.UI.DomEventHandler">
    /// Handler for the input event.
    /// </field>
    /// <field name="_propertyChangeHandler" type="Sys.UI.DomEventHandler">
    /// Handler for the propertychange event (IE specific).
    /// </field>
    /// <field name="_fieldFaults" type="Array">
    /// Collection of error messages specific to this field.
    /// </field>
    /// <field name="defaultIssueMessage" type="String">
    /// Default error message if no specific one is provided.
    /// </field>
    /// <field name="inputNodes" type="Array" elementType="Object" elementDomElement="true">
    /// Array of DOM elements associated with this field.
    /// </field>
    /// <field name="parentFormProcessor" type="Web.UI.FormProcessor">
    /// Reference to the parent form processor.
    /// </field>
    /// <field name="replaceMessageContent" type="Boolean">
    /// Flag to indicate if the validation message element's content should be replaced.
    /// </field>
    /// <field name="messageDisplayNode" type="Object" domElement="true">
    /// The DOM element where validation messages for this field are displayed.
    /// </field>
    /// <field name="checks" type="Array" elementType="Validation">
    /// List of validation objects (rules and their messages) for this field.
    /// </field>
    this._fieldFaults = [];
    this.inputNodes = [];
    this.checks = [];
    this.parentFormProcessor = parentFormProcessor;
    // Create delegates for event handlers.
    this._blurHandler = WebApp.FuncUtil.createBoundMethod(this, this._handleElementBlur);
    this._changeHandler = WebApp.FuncUtil.createBoundMethod(this, this._handleElementChange);
    this._inputHandler = WebApp.FuncUtil.createBoundMethod(this, this._handleElementInput);
    this._propertyChangeHandler = WebApp.FuncUtil.createBoundMethod(this, this._handleElementPropertyChange);
}
Web.UI.FieldProcessor.prototype = {
    _blurHandler: null,
    _changeHandler: null,
    _inputHandler: null,
    _propertyChangeHandler: null,
    defaultIssueMessage: null,
    parentFormProcessor: null,
    replaceMessageContent: false,
    messageDisplayNode: null,

    recordFault: function Web_UI_FieldProcessor_recordFault(faultText) {
        /// <param name="faultText" type="String">
        /// The error message to add to this field.
        /// </param>
        this.recordFaults([ faultText ]);
    },

    recordFaults: function Web_UI_FieldProcessor_recordFaults(faultTexts) {
        /// <param name="faultTexts" type="Array" elementType="String">
        /// An array of error messages to add to this field.
        /// </param>
        if (!Web.UI.utilityHelpers.isArrayEmptyOrNull(faultTexts)) {
            this._fieldFaults.push(...faultTexts);
            this._onFaultCountChange();
        }
    },

    clearFieldFaults: function Web_UI_FieldProcessor_clearFieldFaults() {
        this._fieldFaults = [];
        this._onFaultCountChange();
    },

    _renderFaultState: function Web_UI_FieldProcessor_renderFaultState() {
        var messageDisplayNode = this.messageDisplayNode;
        if (messageDisplayNode) {
            // If configured, update the text content of the message element.
            if (this.replaceMessageContent) {
                Web.UI.utilityHelpers.setTextContent(messageDisplayNode, this._fieldFaults[0]);
            }
            // Apply error CSS classes.
            Web.UI.DomNodeHelper.removeClass(messageDisplayNode, Web.UI.FieldProcessor._messageValidStyleClass);
            Web.UI.DomNodeHelper.addClass(messageDisplayNode, Web.UI.FieldProcessor._messageFaultStyleClass);
        }
        var inputNodes = this.inputNodes;
        // Apply error CSS classes to all associated input elements.
        for (var i = 0; i < inputNodes.length; i++) {
            var currentElement = inputNodes[i];
            Web.UI.DomNodeHelper.removeClass(currentElement, Web.UI.FieldProcessor._inputValidStyleClass);
            Web.UI.DomNodeHelper.addClass(currentElement, Web.UI.FieldProcessor._inputFaultStyleClass);
        }
    },

    _renderSuccessState: function Web_UI_FieldProcessor_renderSuccessState() {
        var messageDisplayNode = this.messageDisplayNode;
        if (messageDisplayNode) {
            // If configured, clear the text content of the message element.
            if (this.replaceMessageContent) {
                Web.UI.utilityHelpers.setTextContent(messageDisplayNode, '');
            }
            // Apply valid CSS classes.
            Web.UI.DomNodeHelper.removeClass(messageDisplayNode, Web.UI.FieldProcessor._messageFaultStyleClass);
            Web.UI.DomNodeHelper.addClass(messageDisplayNode, Web.UI.FieldProcessor._messageValidStyleClass);
        }
        var inputNodes = this.inputNodes;
        // Apply valid CSS classes to all associated input elements.
        for (var i = 0; i < inputNodes.length; i++) {
            var currentElement = inputNodes[i];
            Web.UI.DomNodeHelper.removeClass(currentElement, Web.UI.FieldProcessor._inputFaultStyleClass);
            Web.UI.DomNodeHelper.addClass(currentElement, Web.UI.FieldProcessor._inputValidStyleClass);
        }
    },

    _handleElementBlur: function Web_UI_FieldProcessor_handleElementBlur(blurEvent) {
        /// <param name="blurEvent" type="Sys.UI.DomEvent">
        /// Event arguments for the blur event.
        /// </param>
        // Validate if content has changed or validation has already run.
        if (blurEvent.target[Web.UI.FieldProcessor._hasContentChangedFlag] || blurEvent.target[Web.UI.FieldProcessor._hasChecksRunFlag]) {
            this.assessValidity('focusOut');
        }
    },

    _handleElementChange: function Web_UI_FieldProcessor_handleElementChange(changeEvent) {
        /// <param name="changeEvent" type="Sys.UI.DomEvent">
        /// Event arguments for the change event.
        /// </param>
        changeEvent.target[Web.UI.FieldProcessor._hasContentChangedFlag] = true;
    },

    _handleElementInput: function Web_UI_FieldProcessor_handleElementInput(inputEvent) {
        /// <param name="inputEvent" type="Sys.UI.DomEvent">
        /// Event arguments for the input event.
        /// </param>
        inputEvent.target[Web.UI.FieldProcessor._hasContentChangedFlag] = true;
        // If validation has already fired, re-validate on input.
        if (inputEvent.target[Web.UI.FieldProcessor._hasChecksRunFlag]) {
            this.assessValidity('typing');
        }
    },

    _handleElementPropertyChange: function Web_UI_FieldProcessor_handleElementPropertyChange(propChangeEvent) {
        /// <param name="propChangeEvent" type="Sys.UI.DomEvent">
        /// Event arguments for the propertychange event (IE specific).
        /// </param>
        if (propChangeEvent.nativeEvent.property === 'value') {
            propChangeEvent.target[Web.UI.FieldProcessor._hasContentChangedFlag] = true;
            // If validation has already fired, re-validate on property change.
            if (propChangeEvent.target[Web.UI.FieldProcessor._hasChecksRunFlag]) {
                this.assessValidity('propertyUpdate');
            }
        }
    },

    activateLiveChecks: function Web_UI_FieldProcessor_activateLiveChecks() {
        var inputNodes = this.inputNodes;
        for (var i = 0; i < inputNodes.length; i++) {
            var fieldNode = inputNodes[i];
            // Attach propertychange handler for IE compatibility.
            if (Web.UI.utilityHelpers.nodeSupportsEvent(fieldNode, 'propertychange')) {
                var browserCompatibilityMode = document.browserCompatibilityMode;
                if (browserCompatibilityMode && browserCompatibilityMode >= 8) {
                    Web.UI.DomEventHelper.addEventHandler(fieldNode, 'propertychange', this._propertyChangeHandler);
                }
            }
            else {
                // Attach standard input event handler for modern browsers.
                Web.UI.DomEventHelper.addEventHandler(fieldNode, 'input', this._inputHandler);
            }
            // Attach change and blur handlers.
            Web.UI.DomEventHelper.addEventHandler(fieldNode, 'change', this._changeHandler);
            Web.UI.DomEventHelper.addEventHandler(fieldNode, 'blur', this._blurHandler);
        }
    },

    _getFaultString: function Web_UI_FieldProcessor_getFaultString(checkerResult, fieldIssueMessage) {
        /// <param name="checkerResult" type="Object">
        /// The return value from the validator function.
        /// </param>
        /// <param name="fieldIssueMessage" type="String">
        /// The error message defined for this field.
        /// </param>
        // Placeholder for logic to determine the final error string.
        // In original: if checkerResult is string, use it; else if false, use fieldErrorMessage.
        if (typeof checkerResult === 'string') {
            return checkerResult;
        }
        if (checkerResult === false) {
            return fieldIssueMessage;
        }
        return null;
    }
}