var applicationValidationEngine = null;

class InputCriterionProcessor {
    constructor() {
        this.registeredForms = new Map();
        this.cachedElements = new Map();
        this.criterionHandlers = new Map();

        this.initializeDefaultCriteria();
    }

    #getInputValue(elementIdentifier) {
        const inputElement = this.#retrieveInput(elementIdentifier);
        if (!inputElement || !inputElement.jquery) {
            return '';
        }
        return inputElement.val();
    }

    #retrieveInput(elementIdentifier) {
        if (!this.cachedElements.has(elementIdentifier)) {
            const input = $('#' + elementIdentifier);
            const errorContainer = $('#error-' + elementIdentifier);
            this.cachedElements.set(elementIdentifier, {
                inputElement: input,
                errorDisplay: errorContainer
            });
        }
        return this.cachedElements.get(elementIdentifier).inputElement;
    }

    #retrieveErrorDisplay(elementIdentifier) {
        if (!this.cachedElements.has(elementIdentifier)) {
            this.#retrieveInput(elementIdentifier);
        }
        return this.cachedElements.get(elementIdentifier).errorDisplay;
    }

    initializeDefaultCriteria() {
        this.criterionHandlers.set('matchValue', (elementId, fieldValue, ruleData) => {
            let comparisonTarget = ruleData.value;
            if (typeof comparisonTarget === 'object' && comparisonTarget !== null && comparisonTarget.jquery) {
                comparisonTarget = comparisonTarget.val();
            }
            return fieldValue == comparisonTarget;
        });

        this.criterionHandlers.set('lessThanValue', (elementId, fieldValue, ruleData) => {
            return parseInt(fieldValue, 10) < ruleData.comparisonValue;
        });

        this.criterionHandlers.set('greaterThanValue', (elementId, fieldValue, ruleData) => {
            return parseInt(fieldValue, 10) > ruleData.comparisonValue;
        });

        this.criterionHandlers.set('minimumLength', (elementId, fieldValue, ruleData) => {
            return fieldValue.length >= ruleData.comparisonValue;
        });

        this.criterionHandlers.set('maximumLength', (elementId, fieldValue, ruleData) => {
            return fieldValue.length <= ruleData.comparisonValue;
        });

        this.criterionHandlers.set('patternMatch', (elementId, fieldValue, ruleData) => {
            return ruleData.expression.test(fieldValue);
        });

        this.criterionHandlers.set('emailFormat', (elementId, fieldValue, ruleData) => {
            const emailPattern = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            return this.criterionHandlers.get('patternMatch')(elementId, fieldValue, { expression: emailPattern });
        });
    }

    registerCustomCriterion(criterionName, customCheckFunction) {
        this.criterionHandlers.set(criterionName, (elementIdentifier, fieldValue, ruleData) => {
            const inputElement = this.#retrieveInput(elementIdentifier);
            return customCheckFunction(inputElement, ruleData);
        });
    }

    evaluateField(elementIdentifier, criteria) {
        let allPassed = true;
        const errorContainer = this.#retrieveErrorDisplay(elementIdentifier);
        const fieldValue = this.#getInputValue(elementIdentifier);

        if (errorContainer && errorContainer.length) {
            errorContainer.hide();
            errorContainer.empty();
        }

        for (const criterionKey in criteria) {
            if (this.criterionHandlers.has(criterionKey)) {
                if (!this.criterionHandlers.get(criterionKey)(elementIdentifier, fieldValue, criteria[criterionKey])) {
                    allPassed = false;
                    if (errorContainer && errorContainer.length && criteria[criterionKey].message) {
                        errorContainer.append('<div>' + criteria[criterionKey].message + '</div>');
                    }
                }
            } else {
                allPassed = false;
            }
        }

        if (!allPassed && errorContainer && errorContainer.length) {
            errorContainer.show();
        }

        return allPassed;
    }

    processAllFields(fieldRulesMap) {
        let overallSuccess = true;
        for (const fieldId in fieldRulesMap) {
            if (!this.evaluateField(fieldId, fieldRulesMap[fieldId])) {
                overallSuccess = false;
            }
        }
        return overallSuccess;
    }

    bindForm(formJqObject, fieldRules, successCallback) {
        const formId = formJqObject.attr('id');
        
        this.registeredForms.set(formId, {
            formReference: formJqObject,
            validationSchema: fieldRules,
            onSuccess: successCallback
        });

        if (!formJqObject.data('validator-bound')) {
            formJqObject.on('submit', (evt) => {
                const currentFormId = $(evt.currentTarget).attr('id');
                const formRegistration = this.registeredForms.get(currentFormId);

                if (formRegistration && this.processAllFields(formRegistration.validationSchema)) {
                    formRegistration.onSuccess(evt);
                } else {
                    evt.preventDefault();
                }
            });
            formJqObject.data('validator-bound', true);
        }
    }
}

if (typeof applicationValidationEngine === 'undefined' || applicationValidationEngine === null) {
    applicationValidationEngine = new InputCriterionProcessor();
}

(function($) {
    $.fn.attachValidator = function(rulesDefinition, successHandler) {
        if (this.length === 0 || !this.is('form')) {
            return this;
        }
        applicationValidationEngine.bindForm(this, rulesDefinition, successHandler);
        return this;
    };
})(jQuery);

var registerValidationLogic = function(criterionName, validationFunction) {
    applicationValidationEngine.registerCustomCriterion(criterionName, validationFunction);
};