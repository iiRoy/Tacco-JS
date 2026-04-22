const formValidationRegistry = new WeakMap();
let hintIdentifierSeed = 0;

const domUtility = {
    fetchElement: (selector, parent = document) => parent.querySelector(selector),
    fetchAllElements: (selector, parent = document) => Array.from(parent.querySelectorAll(selector)),
    createDOMElement: (tag, classes = [], id = '') => {
        const element = document.createElement(tag);
        if (classes.length) element.className = classes.join(' ');
        if (id) element.id = id;
        return element;
    },
    insertChild: (parent, child) => parent.appendChild(child),
    removeChild: (element) => element.parentNode && element.parentNode.removeChild(element),
    findClosestAncestor: (element, selector) => {
        if (!element) return null;
        if (element.closest) return element.closest(selector);
        let current = element;
        while (current && current.nodeType === 1) {
            if (current.matches(selector)) return current;
            current = current.parentNode;
        }
        return null;
    },
    retrieveAttribute: (element, attribute) => element.getAttribute(attribute),
    assignAttribute: (element, attribute, value) => element.setAttribute(attribute, value),
    listenFor: (element, event, handler, options) => element.addEventListener(event, handler, options),
    stopListening: (element, event, handler, options) => element.removeEventListener(event, handler, options),
    addCSSClass: (element, cssClass) => element.classList.add(cssClass),
    removeCSSClass: (element, cssClass) => element.classList.remove(cssClass),
    hasCSSClass: (element, cssClass) => element.classList.contains(cssClass),
};

const validationLogicProcessor = {
    // Standard configuration options
    baselineConfiguration: {
        eventActivationTrigger: "blur",
        tipDisplayPlacement: "topRight",
        dynamicTipRelocation: true,
        scrollToFirstIssue: true,
        focusOnFirstIssue: true,
        showAllErrorsOnAttempt: false,
        fadeTransitionDuration: 150,
        asynchronousFormSubmission: false,
        onOverallCompletion: null,
        onSuccessfulValidation: null,
        onFailedValidation: null,
        asyncRequestMode: "GET",
        asyncDataFormat: "json",
        beforeAsyncFormRequest: (formObj, configObj) => true,
        afterAsyncFormRequest: (validStatus, formObj, dataResult, configObj) => {},
        validationRuleDefinitions: {
            "mandatory": { "alertText": "* This input is required" },
            "emailFormat": { "alertText": "* Invalid email address format" },
            "custom[alphaOnly]": { "alertText": "* Only alphabetic characters allowed" },
            "asyncFieldCheck": { "alertText": "* This field requires an asynchronous check" }
        },
        // Internal tracking states
        boundElementsTracking: new Set(),
        errorInputCollection: [],
        asyncStatusCache: {},
        currentInteractionType: "",
        validationDirectiveAttribute: "data-validation-rules",
        displayTipArrow: true,
    },

    // Renamed from _saveOptions
    establishConfiguration: function(targetFormElement, customSettings) {
        let formSpecificConfig = formValidationRegistry.get(targetFormElement);
        if (!formSpecificConfig) {
            formSpecificConfig = { ...this.baselineConfiguration };
            formValidationRegistry.set(targetFormElement, formSpecificConfig);
        }
        Object.assign(formSpecificConfig, customSettings);
        return formSpecificConfig;
    },

    // Renamed from _onFieldEvent
    processElementInteraction: function(eventInstance, auxiliaryData = {}) {
        const interactedElement = eventInstance.target;
        const owningForm = domUtility.findClosestAncestor(interactedElement, 'form');
        const currentConfig = formValidationRegistry.get(owningForm);
        if (!currentConfig) return;

        currentConfig.currentInteractionType = "field";

        setTimeout(() => {
            const isElementValid = validationLogicProcessor.evaluateSingleElement(interactedElement, currentConfig);
            if (isElementValid && currentConfig.errorInputCollection.length === 0 && currentConfig.onSuccessfulValidation) {
                currentConfig.onSuccessfulValidation();
            } else if (!isElementValid && currentConfig.errorInputCollection.length > 0 && currentConfig.onFailedValidation) {
                currentConfig.onFailedValidation();
            }
        }, auxiliaryData.delay || 0);
    },

    // Renamed from _onSubmitEvent
    handleFormSubmission: function(eventInstance) {
        eventInstance.preventDefault();
        const submittedForm = eventInstance.target;
        const currentConfig = formValidationRegistry.get(submittedForm);
        if (!currentConfig) return;

        currentConfig.currentInteractionType = "submit";
        const isFormGloballyValid = validationLogicProcessor.evaluateAllFormElements(submittedForm, currentConfig);

        if (isFormGloballyValid && currentConfig.asynchronousFormSubmission) {
            validationLogicProcessor.initiateAsynchronousFormValidation(submittedForm, currentConfig);
            return false;
        }

        if (currentConfig.onOverallCompletion) {
            const completionOutcome = currentConfig.onOverallCompletion(submittedForm, isFormGloballyValid);
            if (completionOutcome === false) {
                return false;
            }
        }

        if (isFormGloballyValid) {
            submittedForm.submit();
        }
        return isFormGloballyValid;
    },

    // Renamed from _validateFields
    evaluateAllFormElements: function(targetForm, currentConfig) {
        currentConfig.errorInputCollection = [];
        let anyErrorsPresent = false;
        let primaryErrorElement = null;

        const validationStartEvent = new CustomEvent("validationOverseer.form.validating", { detail: { form: targetForm } });
        targetForm.dispatchEvent(validationStartEvent);

        const elementsRequiringValidation = domUtility.fetchAllElements(`[${currentConfig.validationDirectiveAttribute}*=validate]`, targetForm);
        const processedNames = new Set();

        for (const element of elementsRequiringValidation) {
            if (element.disabled) continue;

            const elementName = element.name;
            if (processedNames.has(elementName)) continue;
            processedNames.add(elementName);

            const elementFailedCheck = !validationLogicProcessor.evaluateSingleElement(element, currentConfig);
            if (elementFailedCheck) {
                anyErrorsPresent = true;
                if (!primaryErrorElement) {
                    primaryErrorElement = element;
                    if (element.type === "hidden" && currentConfig.prettySelect) {
                        const targetId = element.id;
                        const prettyElement = domUtility.fetchElement(`#${currentConfig.usePrefix || ''}${targetId}${currentConfig.useSuffix || ''}`, targetForm);
                        if (prettyElement) primaryErrorElement = prettyElement;
                    }
                }
                if (!currentConfig.showAllErrorsOnAttempt) {
                    break;
                }
            }
        }

        const validationResultEvent = new CustomEvent("validationOverseer.form.result", { detail: { form: targetForm, hasErrors: anyErrorsPresent } });
        targetForm.dispatchEvent(validationResultEvent);

        if (anyErrorsPresent) {
            if (currentConfig.scrollToFirstIssue && primaryErrorElement) {
                let scrollYPosition = primaryErrorElement.offsetTop;
                let scrollXPosition = primaryErrorElement.offsetLeft;

                const errorTip = validationLogicProcessor.retrieveErrorTipDisplay(primaryErrorElement);
                if (errorTip && !currentConfig.tipDisplayPlacement.startsWith("bottom")) {
                    scrollYPosition = errorTip.offsetTop;
                }

                if (currentConfig.isOverflown && currentConfig.overflownDIV) {
                    const overflowContainer = domUtility.fetchElement(currentConfig.overflownDIV);
                    if (overflowContainer) {
                        const containerScrollTop = overflowContainer.scrollTop;
                        const containerOffsetTop = overflowContainer.offsetTop;
                        scrollYPosition += containerScrollTop + containerOffsetTop - 5;
                        overflowContainer.scrollTo({ top: scrollYPosition, behavior: 'smooth' });
                    }
                } else {
                    window.scrollTo({
                        top: scrollYPosition,
                        left: scrollXPosition,
                        behavior: 'smooth'
                    });
                }
            }
            if (currentConfig.focusOnFirstIssue && primaryErrorElement) {
                primaryErrorElement.focus();
            }
            return false;
        }
        return true;
    },

    // Renamed from _validateField
    evaluateSingleElement: function(inputElement, currentConfig, disregardAsyncStatus = false) {
        if (!inputElement.id) {
            inputElement.id = `input-validation-id-${hintIdentifierSeed++}`;
        }

        if ((inputElement.hidden && !currentConfig.prettySelect) || domUtility.findClosestAncestor(inputElement, '.validationTipWrapper')) {
            return true;
        }

        const validationRulesAttributeValue = domUtility.retrieveAttribute(inputElement, currentConfig.validationDirectiveAttribute);
        const rulesExtract = /validate\[(.*)\]/.exec(validationRulesAttributeValue);

        if (!rulesExtract) {
            validationLogicProcessor.hideErrorTip(inputElement);
            return true;
        }

        const rawRulesList = rulesExtract[1];
        const ruleIdentifiers = rawRulesList.split(/\[|,|\]/).map(s => s.trim()).filter(Boolean);

        let hasAsyncRule = false;
        let issueMessage = "";
        let isRequired = false;
        let elementCurrentlyPasses = true;

        validationLogicProcessor.hideErrorTip(inputElement);
        currentConfig.errorInputCollection = currentConfig.errorInputCollection.filter(el => el !== inputElement);

        for (let i = 0; i < ruleIdentifiers.length; i++) {
            const currentRuleId = ruleIdentifiers[i];
            let ruleEvaluationResult = true;

            switch (currentRuleId) {
                case "mandatory":
                    isRequired = true;
                    ruleEvaluationResult = validationLogicProcessor.checkMandatoryInput(inputElement);
                    if (!ruleEvaluationResult) {
                        issueMessage = validationLogicProcessor.getRuleMessage(currentConfig, inputElement, currentRuleId, ruleIdentifiers, i);
                        elementCurrentlyPasses = false;
                    }
                    break;
                case "custom":
                    const customRuleIdentifier = ruleIdentifiers[i + 1];
                    if (customRuleIdentifier) {
                        if (customRuleIdentifier === "emailFormat") {
                            ruleEvaluationResult = validationLogicProcessor.checkEmailFormat(inputElement.value);
                            if (!ruleEvaluationResult) {
                                issueMessage = validationLogicProcessor.getRuleMessage(currentConfig, inputElement, `custom[${customRuleIdentifier}]`, ruleIdentifiers, i);
                                elementCurrentlyPasses = false;
                            }
                        }
                        i++;
                    }
                    break;
                case "asyncFieldCheck":
                    hasAsyncRule = true;
                    if (!disregardAsyncStatus && !validationLogicProcessor.isAsyncFieldValid(inputElement.id, currentConfig)) {
                         elementCurrentlyPasses = false;
                         issueMessage = validationLogicProcessor.getRuleMessage(currentConfig, inputElement, currentRuleId, ruleIdentifiers, i);
                    }
                    break;
                default:
                    // Other rules like minLength, maxLength, numeric, etc. would be implemented here
                    break;
            }

            if (!elementCurrentlyPasses && !currentConfig.showAllErrorsOnAttempt && currentConfig.currentInteractionType === "submit") {
                break;
            }
        }

        if (!elementCurrentlyPasses) {
            currentConfig.errorInputCollection.push(inputElement);
            validationLogicProcessor.displayValidationTip(inputElement, issueMessage, "failure", false, currentConfig);
        } else {
            validationLogicProcessor.hideErrorTip(inputElement);
        }

        return elementCurrentlyPasses;
    },

    // Renamed from _validateFormWithAjax
    initiateAsynchronousFormValidation: function(targetForm, currentConfig) {
        const formData = new FormData(targetForm);
        const requestPayload = new URLSearchParams(formData).toString();

        let endpointURL = currentConfig.asyncFormSubmissionValidationURL || targetForm.action;
        const requestMethod = currentConfig.asyncRequestMode || "GET";
        const expectedResponseFormat = currentConfig.asyncDataFormat || "json";

        const fetchParameters = {
            method: requestMethod,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        if (requestMethod === "POST") {
            fetchParameters.body = requestPayload;
        } else {
            endpointURL += (endpointURL.includes('?') ? '&' : '?') + requestPayload;
        }

        if (currentConfig.beforeAsyncFormRequest(targetForm, currentConfig) === false) {
            return;
        }

        fetch(endpointURL, fetchParameters)
            .then(response => {
                if (!response.ok) throw new Error(`Network response error: ${response.status}`);
                return expectedResponseFormat === "json" ? response.json() : response.text();
            })
            .then(responsePayload => {
                let formHadAsyncIssues = false;
                if (responsePayload !== true) {
                    responsePayload.forEach(fieldFeedback => {
                        const affectedElementId = fieldFeedback[0];
                        const fieldPassed = fieldFeedback[1];
                        let feedbackMessageContent = fieldFeedback[2];

                        const targetElement = domUtility.fetchElement(`#${affectedElementId}`);
                        if (targetElement) {
                            if (fieldPassed) {
                                if (!feedbackMessageContent) {
                                    validationLogicProcessor.hideErrorTip(targetElement);
                                } else {
                                    const ruleDefinition = currentConfig.validationRuleDefinitions[feedbackMessageContent];
                                    if (ruleDefinition && ruleDefinition.alertTextOk) feedbackMessageContent = ruleDefinition.alertTextOk;
                                    validationLogicProcessor.displayValidationTip(targetElement, feedbackMessageContent, "success", false, currentConfig, true);
                                }
                            } else {
                                formHadAsyncIssues = true;
                                const ruleDefinition = currentConfig.validationRuleDefinitions[feedbackMessageContent];
                                if (ruleDefinition && ruleDefinition.alertText) feedbackMessageContent = ruleDefinition.alertText;
                                validationLogicProcessor.displayValidationTip(targetElement, feedbackMessageContent, "failure", false, currentConfig, true);
                            }
                        }
                    });
                    currentConfig.afterAsyncFormRequest(!formHadAsyncIssues, targetForm, responsePayload, currentConfig);
                } else {
                    currentConfig.afterAsyncFormRequest(true, targetForm, "", currentConfig);
                }
            })
            .catch(error => {
                console.error("ValidationOverseer: Asynchronous form validation encountered an error:", error);
                currentConfig.afterAsyncFormRequest(false, targetForm, error, currentConfig);
            });
    },

    // Renamed from _checkAjaxStatus
    checkOverallAsyncValidationStatus: function(currentConfig) {
        let allChecksPassed = true;
        for (const key in currentConfig.asyncStatusCache) {
            if (Object.prototype.hasOwnProperty.call(currentConfig.asyncStatusCache, key)) {
                if (!currentConfig.asyncStatusCache[key]) {
                    allChecksPassed = false;
                    break;
                }
            }
        }
        return allChecksPassed;
    },

    // Renamed from _checkAjaxFieldStatus
    isAsyncFieldValid: function(fieldId, currentConfig) {
        return currentConfig.asyncStatusCache[fieldId] === true;
    },

    // Renamed from _getErrorMessage
    getRuleMessage: function(currentConfig, inputElement, ruleIdentifier, allRules, ruleIndex) {
        const ruleDefinition = currentConfig.validationRuleDefinitions[ruleIdentifier];
        if (ruleDefinition && ruleDefinition.alertText) {
            return ruleDefinition.alertText;
        }
        if (ruleIdentifier.startsWith("custom[") && allRules[ruleIndex + 1]) {
            const customRuleKey = `custom[${allRules[ruleIndex + 1]}]`;
            const customRuleDefinition = currentConfig.validationRuleDefinitions[customRuleKey];
            if (customRuleDefinition && customRuleDefinition.alertText) {
                return customRuleDefinition.alertText;
            }
        }
        return `Validation issue for: ${ruleIdentifier}`;
    },

    // Renamed from _required
    checkMandatoryInput: function(inputElement) {
        if (inputElement.type === "checkbox" || inputElement.type === "radio") {
            const inputName = inputElement.name;
            const owningForm = domUtility.findClosestAncestor(inputElement, 'form');
            if (!owningForm) return false;
            return domUtility.fetchElement(`input[name="${inputName}"]:checked`, owningForm) !== null;
        }
        return inputElement.value.trim() !== "";
    },

    // Example custom rule: email format
    checkEmailFormat: function(value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    },

    // Renamed from _getClassName
    createUniqueElementKey: function(elementId) {
        if (!elementId) return `noId_${hintIdentifierSeed++}`;
        return elementId.replace(/[^a-zA-Z0-9]/g, '_');
    },

    // Renamed from _getPrompt
    retrieveErrorTipDisplay: function(inputElement) {
        const uniqueKey = validationLogicProcessor.createUniqueElementKey(inputElement.id);
        return domUtility.fetchElement(`#validationTipWrapper_${uniqueKey} .validationTipContainer`);
    },

    // Renamed from _updatePrompt / _showPrompt (split into positioning and rendering)
    positionErrorTipDisplay: function(inputElement, tipElement, contentText, tipStyle, forceUpdate, currentConfig, disableAnimation = false) {
        if (contentText) {
            domUtility.fetchElement(".validationTipContent", tipElement).innerHTML = contentText;
        }
        if (tipStyle) {
            domUtility.removeCSSClass(tipElement, "success");
            domUtility.removeCSSClass(tipElement, "failure");
            domUtility.removeCSSClass(tipElement, "loading");
            domUtility.addCSSClass(tipElement, tipStyle === "success" ? "success" : (tipStyle === "loading" ? "loading" : "failure"));
        }

        const inputRect = inputElement.getBoundingClientRect();
        const tipRect = tipElement.getBoundingClientRect();
        const wrapperElement = tipElement.parentNode;

        let topCoordinate, leftCoordinate;

        switch (currentConfig.tipDisplayPlacement) {
            case "topRight":
            default:
                topCoordinate = inputRect.top + window.scrollY - tipRect.height - 5;
                leftCoordinate = inputRect.right + window.scrollX - tipRect.width;
                break;
            case "topLeft":
                topCoordinate = inputRect.top + window.scrollY - tipRect.height - 5;
                leftCoordinate = inputRect.left + window.scrollX;
                break;
            case "bottomRight":
                topCoordinate = inputRect.bottom + window.scrollY + 5;
                leftCoordinate = inputRect.right + window.scrollX - tipRect.width;
                break;
            case "bottomLeft":
                topCoordinate = inputRect.bottom + window.scrollY + 5;
                leftCoordinate = inputRect.left + window.scrollX;
                break;
            case "centerRight":
                topCoordinate = inputRect.top + window.scrollY + (inputRect.height / 2) - (tipRect.height / 2);
                leftCoordinate = inputRect.right + window.scrollX + 5;
                break;
        }

        const placementParts = currentConfig.tipDisplayPlacement.split(':');
        if (placementParts.length > 1) {
            const offsets = placementParts[1].split(',').map(Number);
            if (offsets[0]) leftCoordinate += offsets[0];
            if (offsets[1]) topCoordinate += offsets[1];
        }

        wrapperElement.style.top = `${topCoordinate}px`;
        wrapperElement.style.left = `${leftCoordinate}px`;
        wrapperElement.style.position = 'absolute';
        wrapperElement.style.zIndex = '9999';

        if (!disableAnimation) {
            wrapperElement.style.opacity = '0';
            requestAnimationFrame(() => {
                wrapperElement.style.transition = `opacity ${currentConfig.fadeTransitionDuration / 1000}s ease-in-out`;
                wrapperElement.style.opacity = '1';
            });
        } else {
            wrapperElement.style.opacity = '1';
        }
        wrapperElement.style.display = 'block';
    },

    // Renamed from _showPrompt (main rendering)
    displayValidationTip: function(inputElement, messageContent, tipStyle, isGlobalHint, currentConfig, isAsync = false) {
        const uniqueKey = validationLogicProcessor.createUniqueElementKey(inputElement.id);
        let wrapper = domUtility.fetchElement(`#validationTipWrapper_${uniqueKey}`);
        let tipContainer;

        if (!wrapper) {
            wrapper = domUtility.createDOMElement("div", ["validationTipWrapper"], `validationTipWrapper_${uniqueKey}`);
            domUtility.insertChild(document.body, wrapper);

            tipContainer = domUtility.createDOMElement("div", [`validationTipContainer`, `elementTip_${uniqueKey}`]);
            domUtility.insertChild(wrapper, tipContainer);

            const contentDiv = domUtility.createDOMElement("div", ["validationTipContent"]);
            domUtility.insertChild(tipContainer, contentDiv);

            if (currentConfig.displayTipArrow) {
                const arrowDiv = domUtility.createDOMElement("div", ["validationTipArrow"]);
                domUtility.insertChild(tipContainer, arrowDiv);
            }
        } else {
            tipContainer = domUtility.fetchElement(".validationTipContainer", wrapper);
        }

        validationLogicProcessor.positionErrorTipDisplay(inputElement, tipContainer, messageContent, tipStyle, true, currentConfig);
    },

    // Renamed from _closePrompt
    hideErrorTip: function(inputElement) {
        const wrapper = domUtility.fetchElement(`#validationTipWrapper_${validationLogicProcessor.createUniqueElementKey(inputElement.id)}`);
        if (wrapper) {
            const currentConfig = formValidationRegistry.get(domUtility.findClosestAncestor(inputElement, 'form'));
            const duration = currentConfig ? currentConfig.fadeTransitionDuration : 150;
            validationLogicProcessor.concealSingleTipDisplay(domUtility.fetchElement(".validationTipContainer", wrapper), duration);
        }
    },

    // Renamed from hideAll/hide (internal helper)
    concealSingleTipDisplay: function(tipElement, duration = 150) {
        const wrapper = tipElement.parentNode;
        if (wrapper) {
            wrapper.style.transition = `opacity ${duration / 1000}s ease-in-out`;
            wrapper.style.opacity = '0';
            setTimeout(() => {
                wrapper.style.display = 'none';
                domUtility.removeChild(wrapper);
            }, duration);
        }
    }
};

// Global setup for prompt click handler
domUtility.listenFor(document, "click", (eventInstance) => {
    const targetElement = eventInstance.target;
    if (domUtility.hasCSSClass(targetElement, "validationTipContainer")) {
        validationLogicProcessor.concealSingleTipDisplay(targetElement);
    }
});

// Public interface object, replacing the jQuery plugin
const validationOverseer = {
    // Renamed from init/attach
    initializeValidation: function(targetElementOrSelector, configurationOptions = {}) {
        const targetElement = typeof targetElementOrSelector === 'string' ? domUtility.fetchElement(targetElementOrSelector) : targetElementOrSelector;
        if (!targetElement || targetElement.tagName !== "FORM") {
            console.error("ValidationOverseer: 'initializeValidation' must be invoked on a FORM element.");
            return;
        }

        const currentConfig = validationLogicProcessor.establishConfiguration(targetElement, configurationOptions);

        domUtility.listenFor(targetElement, "submit", validationLogicProcessor.handleFormSubmission);

        const validateableInputs = domUtility.fetchAllElements(`[${currentConfig.validationDirectiveAttribute}*=validate]`, targetElement);
        validateableInputs.forEach(element => {
            if (currentConfig.boundElementsTracking.has(element)) return;
            
            if (element.type === "checkbox" || element.type === "radio") {
                domUtility.listenFor(element, "click", validationLogicProcessor.processElementInteraction);
            } else if (domUtility.hasCSSClass(element, "datepicker")) {
                domUtility.listenFor(element, currentConfig.eventActivationTrigger, (e) => validationLogicProcessor.processElementInteraction(e, { delay: 300 }));
            } else {
                domUtility.listenFor(element, currentConfig.eventActivationTrigger, validationLogicProcessor.processElementInteraction);
            }
            currentConfig.boundElementsTracking.add(element);
        });

        if (currentConfig.dynamicTipRelocation) {
            domUtility.listenFor(window, "resize", validationOverseer.repositionAllTips.bind(null, targetElement, { disableAnimation: true }));
        }
    },

    // Renamed from detach
    deactivateValidation: function(targetElementOrSelector) {
        const targetElement = typeof targetElementOrSelector === 'string' ? domUtility.fetchElement(targetElementOrSelector) : targetElementOrSelector;
        if (!targetElement || targetElement.tagName !== "FORM") {
            console.error("ValidationOverseer: 'deactivateValidation' must be invoked on a FORM element.");
            return;
        }

        const currentConfig = formValidationRegistry.get(targetElement);
        if (!currentConfig) return;

        domUtility.stopListening(targetElement, "submit", validationLogicProcessor.handleFormSubmission);

        currentConfig.boundElementsTracking.forEach(element => {
            if (element.type === "checkbox" || element.type === "radio") {
                domUtility.stopListening(element, "click", validationLogicProcessor.processElementInteraction);
            } else if (domUtility.hasCSSClass(element, "datepicker")) {
                domUtility.stopListening(element, currentConfig.eventActivationTrigger, validationLogicProcessor.processElementInteraction);
            } else {
                domUtility.stopListening(element, currentConfig.eventActivationTrigger, validationLogicProcessor.processElementInteraction);
            }
        });
        currentConfig.boundElementsTracking.clear();

        if (currentConfig.dynamicTipRelocation) {
            domUtility.stopListening(window, "resize", validationOverseer.repositionAllTips);
        }

        formValidationRegistry.delete(targetElement);
    },

    // Renamed from validate
    initiateValidation: function(elementOrSelector) {
        const targetElement = typeof elementOrSelector === 'string' ? domUtility.fetchElement(elementOrSelector) : elementOrSelector;
        if (!targetElement) return false;

        const owningForm = domUtility.findClosestAncestor(targetElement, 'form');
        const currentConfig = formValidationRegistry.get(owningForm);
        if (!currentConfig) return true;

        if (targetElement.tagName === "FORM") {
            return validationLogicProcessor.evaluateAllFormElements(targetElement, currentConfig);
        } else {
            const isValid = validationLogicProcessor.evaluateSingleElement(targetElement, currentConfig);
            if (isValid && currentConfig.errorInputCollection.length === 0 && currentConfig.onSuccessfulValidation) {
                currentConfig.onSuccessfulValidation();
            } else if (!isValid && currentConfig.errorInputCollection.length > 0 && currentConfig.onFailedValidation) {
                currentConfig.onFailedValidation();
            }
            return isValid;
        }
    },

    // Renamed from updatePromptsPosition
    repositionAllTips: function(formElementOrSelector, options = {}) {
        const targetForm = typeof formElementOrSelector === 'string' ? domUtility.fetchElement(formElementOrSelector) : formElementOrSelector;
        if (!targetForm) return;

        const currentConfig = formValidationRegistry.get(targetForm);
        if (!currentConfig) return;

        domUtility.fetchAllElements(`[${currentConfig.validationDirectiveAttribute}*=validate]`, targetForm).forEach(element => {
            const tip = validationLogicProcessor.retrieveErrorTipDisplay(element);
            if (tip) {
                const tipText = domUtility.fetchElement(".validationTipContent", tip).innerHTML;
                validationLogicProcessor.positionErrorTipDisplay(element, tip, tipText, undefined, false, currentConfig, options.disableAnimation);
            }
        });
    },

    // Renamed from showPrompt
    showCustomValidationTip: function(inputElementOrSelector, messageContent, tipType, customPlacement, showArrowFlag) {
        const inputElement = typeof inputElementOrSelector === 'string' ? domUtility.fetchElement(inputElementOrSelector) : inputElementOrSelector;
        if (!inputElement) return;

        const owningForm = domUtility.findClosestAncestor(inputElement, 'form');
        let currentConfig = formValidationRegistry.get(owningForm);

        if (!currentConfig) {
            currentConfig = validationLogicProcessor.establishConfiguration(owningForm || document.body, {});
        }

        if (customPlacement) currentConfig.tipDisplayPlacement = customPlacement;
        currentConfig.displayTipArrow = showArrowFlag === true;

        validationLogicProcessor.displayValidationTip(inputElement, messageContent, tipType, false, currentConfig);
    },

    // Renamed from hide
    hideSpecificTips: function(elementOrSelector) {
        const targetElement = typeof elementOrSelector === 'string' ? domUtility.fetchElement(elementOrSelector) : elementOrSelector;
        if (!targetElement) return;
        validationLogicProcessor.hideErrorTip(targetElement);
    },

    // Renamed from hideAll
    hideAllValidationTips: function() {
        domUtility.fetchAllElements('.validationTipContainer').forEach(tip => {
            validationLogicProcessor.concealSingleTipDisplay(tip);
        });
    }
};