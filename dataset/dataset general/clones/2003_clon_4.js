(function(environmentNode, documentObject, voidValue) {
    var systemPreferences = {
        feedbackTemplates: {
            mandatory: 'The %s data point is required.',
            matching: 'The %s data point does not match the %s data point.',
            initial: 'The %s data point is still at its default setting; please alter it.',
            valid_email_format: 'The %s data point must contain a valid electronic mail address.',
            valid_email_formats: 'The %s data point must contain only valid electronic mail addresses.',
            minimum_length: 'The %s data point must be at least %s characters in size.',
            maximum_length: 'The %s data point must not exceed %s characters in size.',
            exact_length: 'The %s data point must be exactly %s characters in size.',
            greater_than_value: 'The %s data point must contain a numerical value larger than %s.',
            less_than_value: 'The %s data point must contain a numerical value smaller than %s.',
            alphabetical: 'The %s data point must contain only alphabetic characters.',
            alphanumeric: 'The %s data point must contain only alphanumeric characters.',
            alphanumeric_dash_underscore: 'The %s data point must contain only alphanumeric characters, underscores, and hyphens.',
            numerical_only: 'The %s data point must contain only numerical digits.',
            integral_number: 'The %s data point must contain an integer.',
            decimal_number: 'The %s data point must contain a decimal number.',
            positive_natural: 'The %s data point must contain only positive integers.',
            positive_natural_nonzero: 'The %s data point must contain a positive integer greater than zero.',
            valid_internet_protocol: 'The %s data point must contain a valid Internet Protocol address.',
            valid_base64_string: 'The %s data point must contain a Base64 encoded string.',
            valid_credit_card_number: 'The %s data point must contain a valid credit card number.',
            specific_file_type: 'The %s data point must contain only %s files.',
            valid_universal_resource_locator: 'The %s data point must contain a valid Universal Resource Locator.',
            later_date: 'The %s data point must contain a more recent date than %s.',
            earlier_date: 'The %s data point must contain an older date than %s.',
            later_or_equal_date: 'The %s data point must contain a date that\'s at least as recent as %s.',
            earlier_or_equal_date: 'The %s data point must contain a date that\'s %s or older.'
        },
        feedbackProcessor: function(problemLog) {}
    };

    const rulePattern = /^(.+?)\[(.+)\]$/;
    const digitPattern = /^[0-9]+$/;
    const integerPattern = /^\-?[0-9]+$/;
    const decimalPattern = /^\-?[0-9]*\.?[0-9]+$/;
    const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    const alphaPattern = /^[a-z]+$/i;
    const alphaNumericPattern = /^[a-z0-9]+$/i;
    const alphaDashPattern = /^[a-z0-9_\-]+$/i;
    const naturalPattern = /^[0-9]+$/i;
    const naturalNonZeroPattern = /^[1-9][0-9]*$/i;
    const ipPattern = /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/i;
    const base64Pattern = /[^a-zA-Z0-9\/\+=]/i;
    const urlPattern = /^((http|https):\/\/(\w+:{0,1}\w*@)?(\S+)|)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/;
    const datePattern = /\d{4}-\d{1,2}-\d{1,2}/;

    const retrieveInputAttribute = (inputElement, attributeKey) => {
        if (!inputElement) return voidValue;
        if (inputElement.length > 0 && (inputElement[0].type === 'radio' || inputElement[0].type === 'checkbox')) {
            for (let k = 0, length = inputElement.length; k < length; k++) {
                if (inputElement[k].checked) {
                    return inputElement[k][attributeKey];
                }
            }
            return voidValue;
        }
        return inputElement[attributeKey];
    };

    const obtainValidDate = (dateString) => {
        if (!dateString.match('today') && !dateString.match(datePattern)) {
            return false;
        }
        let dateObj = new Date();
        if (!dateString.match('today')) {
            const dateParts = dateString.split('-');
            dateObj.setFullYear(parseInt(dateParts[0], 10));
            dateObj.setMonth(parseInt(dateParts[1], 10) - 1);
            dateObj.setDate(parseInt(dateParts[2], 10));
        }
        return dateObj;
    };

    const validationRoutines = {
        mandatory: (fieldConfig) => {
            const fieldInput = fieldConfig.inputValue;
            if ((fieldConfig.inputType === 'checkbox') || (fieldConfig.inputType === 'radio')) {
                return (fieldConfig.isChecked === true);
            }
            return (fieldInput !== null && fieldInput !== '' && fieldInput !== voidValue);
        },
        initial: (fieldConfig, inputDataMap, initialValue) => {
            return fieldConfig.inputValue !== initialValue;
        },
        matching: (fieldConfig, inputDataMap, targetFieldName) => {
            const targetInput = inputDataMap[targetFieldName];
            if (targetInput !== voidValue) {
                return fieldConfig.inputValue === targetInput.inputValue;
            }
            return false;
        },
        valid_email_format: (fieldConfig) => emailPattern.test(fieldConfig.inputValue),
        valid_email_formats: (fieldConfig) => {
            const emailList = fieldConfig.inputValue.split(/\s*,\s*/g);
            return emailList.every(email => emailPattern.test(email));
        },
        minimum_length: (fieldConfig, inputDataMap, minLength) => {
            if (!digitPattern.test(minLength)) return false;
            return (fieldConfig.inputValue.length >= parseInt(minLength, 10));
        },
        maximum_length: (fieldConfig, inputDataMap, maxLength) => {
            if (!digitPattern.test(maxLength)) return false;
            return (fieldConfig.inputValue.length <= parseInt(maxLength, 10));
        },
        exact_length: (fieldConfig, inputDataMap, exactLength) => {
            if (!digitPattern.test(exactLength)) return false;
            return (fieldConfig.inputValue.length === parseInt(exactLength, 10));
        },
        greater_than_value: (fieldConfig, inputDataMap, comparisonValue) => {
            if (!decimalPattern.test(fieldConfig.inputValue)) return false;
            return (parseFloat(fieldConfig.inputValue) > parseFloat(comparisonValue));
        },
        less_than_value: (fieldConfig, inputDataMap, comparisonValue) => {
            if (!decimalPattern.test(fieldConfig.inputValue)) return false;
            return (parseFloat(fieldConfig.inputValue) < parseFloat(comparisonValue));
        },
        alphabetical: (fieldConfig) => alphaPattern.test(fieldConfig.inputValue),
        alphanumeric: (fieldConfig) => alphaNumericPattern.test(fieldConfig.inputValue),
        alphanumeric_dash_underscore: (fieldConfig) => alphaDashPattern.test(fieldConfig.inputValue),
        numerical_only: (fieldConfig) => digitPattern.test(fieldConfig.inputValue),
        integral_number: (fieldConfig) => integerPattern.test(fieldConfig.inputValue),
        decimal_number: (fieldConfig) => decimalPattern.test(fieldConfig.inputValue),
        positive_natural: (fieldConfig) => naturalPattern.test(fieldConfig.inputValue),
        positive_natural_nonzero: (fieldConfig) => naturalNonZeroPattern.test(fieldConfig.inputValue),
        valid_internet_protocol: (fieldConfig) => ipPattern.test(fieldConfig.inputValue),
        valid_base64_string: (fieldConfig) => !base64Pattern.test(fieldConfig.inputValue),
        valid_universal_resource_locator: (fieldConfig) => urlPattern.test(fieldConfig.inputValue),
        later_date: (fieldConfig, inputDataMap, comparisonDateString) => {
            const inputDate = obtainValidDate(fieldConfig.inputValue);
            const comparisonDate = obtainValidDate(comparisonDateString);
            return inputDate && comparisonDate && inputDate.getTime() > comparisonDate.getTime();
        },
        earlier_date: (fieldConfig, inputDataMap, comparisonDateString) => {
            const inputDate = obtainValidDate(fieldConfig.inputValue);
            const comparisonDate = obtainValidDate(comparisonDateString);
            return inputDate && comparisonDate && inputDate.getTime() < comparisonDate.getTime();
        },
        later_or_equal_date: (fieldConfig, inputDataMap, comparisonDateString) => {
            const inputDate = obtainValidDate(fieldConfig.inputValue);
            const comparisonDate = obtainValidDate(comparisonDateString);
            return inputDate && comparisonDate && inputDate.getTime() >= comparisonDate.getTime();
        },
        earlier_or_equal_date: (fieldConfig, inputDataMap, comparisonDateString) => {
            const inputDate = obtainValidDate(fieldConfig.inputValue);
            const comparisonDate = obtainValidDate(comparisonDateString);
            return inputDate && comparisonDate && inputDate.getTime() <= comparisonDate.getTime();
        }
    };

    const interpretRuleString = (ruleString) => {
        return ruleString.split('|').map(ruleSegment => {
            const parts = rulePattern.exec(ruleSegment);
            if (parts) {
                return { type: parts[1], parameter: parts[2] };
            }
            return { type: ruleSegment };
        });
    };

    const generateFeedbackMessage = (errorInfo, customTemplates, defaultTemplates, fieldDetailsMap) => {
        const fieldName = errorInfo.inputName;
        const ruleType = errorInfo.issueType;
        const fieldDisplay = errorInfo.inputDisplay;
        const ruleParameter = errorInfo.ruleParameter;

        let template = customTemplates[`${fieldName}.${ruleType}`] || customTemplates[ruleType] || defaultTemplates[ruleType];
        let message = `A problem has occurred with the ${fieldDisplay} data point.`;

        if (template) {
            message = template.replace('%s', fieldDisplay);
            if (ruleParameter) {
                const paramDisplay = fieldDetailsMap[ruleParameter] ? fieldDetailsMap[ruleParameter].inputDisplay : ruleParameter;
                message = message.replace('%s', paramDisplay);
            }
        }
        return message;
    };

    const conductInputAssessment = (fieldConfig, fullInputDataMap, currentIssueLog, customCheckpoints, conditionalRules, specificTemplates, generalTemplates) => {
        const rules = interpretRuleString(fieldConfig.validationRules);
        const isMandatoryPresent = fieldConfig.validationRules.includes('mandatory');
        const isEmptyField = (!fieldConfig.inputValue || fieldConfig.inputValue === '' || fieldConfig.inputValue === voidValue);

        const fieldDetailsForMessages = Object.values(fullInputDataMap).reduce((acc, current) => {
            acc[current.inputName] = current;
            return acc;
        }, {});

        for (let i = 0; i < rules.length; i++) {
            const currentRule = rules[i];
            let ruleType = currentRule.type;
            const ruleParameter = currentRule.parameter;
            let validationFailed = false;

            if (!isMandatoryPresent && !ruleType.startsWith('custom_') && isEmptyField) {
                continue;
            }

            if (ruleType.startsWith('!')) {
                ruleType = ruleType.substring(1);
            }

            if (validationRoutines[ruleType]) {
                if (!validationRoutines[ruleType](fieldConfig, fullInputDataMap, ruleParameter)) {
                    validationFailed = true;
                }
            } else if (ruleType.startsWith('custom_')) {
                const customHandlerName = ruleType.substring(7);
                if (customCheckpoints[customHandlerName]) {
                    if (customCheckpoints[customHandlerName](fieldConfig.inputValue, ruleParameter, fieldConfig) === false) {
                        validationFailed = true;
                    }
                }
            }

            if (validationFailed) {
                const problemDetails = {
                    elementID: fieldConfig.elementID,
                    domElement: fieldConfig.domElement,
                    inputName: fieldConfig.inputName,
                    issueType: ruleType,
                    ruleParameter: ruleParameter,
                    inputDisplay: fieldConfig.inputDisplay
                };
                currentIssueLog.push({
                    ...problemDetails,
                    feedback: generateFeedbackMessage(problemDetails, specificTemplates, generalTemplates, fieldDetailsForMessages)
                });
                break;
            }
        }
    };

    var InputExaminer = function(formIdentifier, dataPointSpecifications, completionHandler) {
        this.completionHandler = completionHandler || systemPreferences.feedbackProcessor;
        this.issueLog = [];
        this.dataPointConfigurations = {};
        this.targetForm = this._locateFormElement(formIdentifier) || {};
        this.notificationTemplates = {};
        this.customCheckpoints = {};
        this.conditionalRules = {};

        dataPointSpecifications.forEach(spec => {
            if ((!spec.pointName && !spec.pointNames) || !spec.validationRules) {
                return;
            }
            if (spec.pointNames) {
                spec.pointNames.forEach(name => this._establishDataPoint(spec, name));
            } else {
                this._establishDataPoint(spec, spec.pointName);
            }
        });

        const originalFormSubmission = this.targetForm.onsubmit;
        this.targetForm.onsubmit = ((examinerInstance) => {
            return (eventObject) => {
                try {
                    const formDataMap = Object.values(examinerInstance.dataPointConfigurations).reduce((acc, config) => {
                        const formElement = examinerInstance.targetForm[config.inputName];
                        if (formElement) {
                            acc[config.inputName] = {
                                ...config,
                                elementID: retrieveInputAttribute(formElement, 'id'),
                                domElement: formElement,
                                inputType: (formElement.length > 0) ? formElement[0].type : formElement.type,
                                inputValue: retrieveInputAttribute(formElement, 'value'),
                                isChecked: retrieveInputAttribute(formElement, 'checked')
                            };
                        }
                        return acc;
                    }, {});

                    const isFormValid = examinerInstance._processSubmission(eventObject, formDataMap);
                    return isFormValid && (originalFormSubmission === voidValue || originalFormSubmission());
                } catch(e) {
                    return false;
                }
            };
        })(this);
    };

    InputExaminer.prototype.setFeedbackTemplate = function(ruleKey, templateString) {
        this.notificationTemplates[ruleKey] = templateString;
        return this;
    };

    InputExaminer.prototype.addCustomCheck = function(checkName, checkHandler) {
        if (checkName && typeof checkName === 'string' && checkHandler && typeof checkHandler === 'function') {
            this.customCheckpoints[checkName] = checkHandler;
        }
        return this;
    };

    InputExaminer.prototype.addConditionalRule = function(ruleName, rulePredicate) {
        if (ruleName && typeof ruleName === 'string' && rulePredicate && typeof rulePredicate === 'function') {
            this.conditionalRules[ruleName] = rulePredicate;
        }
        return this;
    };

    InputExaminer.prototype._locateFormElement = function(identifier) {
        return (typeof identifier === 'object') ? identifier : documentObject.forms[identifier];
    };

    InputExaminer.prototype._establishDataPoint = function(spec, nameVal) {
        this.dataPointConfigurations[nameVal] = {
            inputName: nameVal,
            inputDisplay: spec.display || nameVal,
            validationRules: spec.validationRules,
            dependencyCondition: spec.depends,
            elementID: null,
            domElement: null,
            inputType: null,
            inputValue: null,
            isChecked: null
        };
    };

    InputExaminer.prototype._processSubmission = function(eventObject, collectedFormData) {
        this.issueLog = [];

        for (const dataPointName in this.dataPointConfigurations) {
            if (this.dataPointConfigurations.hasOwnProperty(dataPointName)) {
                const dataPoint = collectedFormData[dataPointName];
                if (!dataPoint) continue;

                let shouldValidate = true;

                if (dataPoint.dependencyCondition) {
                    if (typeof dataPoint.dependencyCondition === "function") {
                        shouldValidate = dataPoint.dependencyCondition.call(this, dataPoint);
                    } else if (typeof dataPoint.dependencyCondition === "string" && this.conditionalRules[dataPoint.dependencyCondition]) {
                        shouldValidate = this.conditionalRules[dataPoint.dependencyCondition].call(this, dataPoint);
                    }
                }

                if (shouldValidate) {
                    conductInputAssessment(
                        dataPoint,
                        collectedFormData,
                        this.issueLog,
                        this.customCheckpoints,
                        this.conditionalRules,
                        this.notificationTemplates,
                        systemPreferences.feedbackTemplates
                    );
                }
            }
        }

        if (typeof this.completionHandler === 'function') {
            this.completionHandler(this.issueLog, eventObject);
        }

        if (this.issueLog.length > 0) {
            if (eventObject && eventObject.preventDefault) {
                eventObject.preventDefault();
            } else if (environmentNode.event) {
                environmentNode.event.returnValue = false;
            }
            return false;
        }

        return true;
    };

    environmentNode.InputExaminer = InputExaminer;

})(window, document);