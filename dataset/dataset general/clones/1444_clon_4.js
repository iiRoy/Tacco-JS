(function () {
    const dataAttributeIdentifier = "validation-attr-";
    const validationActivationMarker = "data-validation-active";
    const fieldMessageContainerMarker = "data-validation-for-field";
    const summaryMessageContainerMarker = "data-validation-summary";
    const errorDisplayClass = "input-validation-invalid";
    const fieldErrorContainerClass = "field-validation-message-error";
    const fieldValidContainerClass = "field-validation-message-valid";
    const summaryErrorContainerClass = "validation-summary-error-list";
    const summaryValidContainerClass = "validation-summary-valid-list";

    function boundFunction(method, context) {
        return function () {
            return method.apply(context, arguments);
        };
    }

    function selectElements(selector, context = document) {
        return Array.from(context.querySelectorAll(selector));
    }

    function retrieveAttribute(element, attributeName) {
        return element ? element.getAttribute(attributeName) : null;
    }

    function toggleClass(element, className, add) {
        if (element) {
            if (add) {
                element.classList.add(className);
            } else {
                element.classList.remove(className);
            }
        }
    }

    function purgeChildren(element) {
        if (element) {
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }
        }
    }

    function parseBooleanString(value) {
        if (value === null || value === undefined || value === "") return false;
        const lower = String(value).toLowerCase();
        return lower === "true" || lower === "1";
    }

    function divideStringByComma(text) {
        return text ? text.replace(/^\s+|\s+$/g, "").split(/\s*,\s*/g) : [];
    }

    function extractNameSegment(fullFieldName) {
        const lastDot = fullFieldName.lastIndexOf(".");
        return lastDot === -1 ? "" : fullFieldName.substring(0, lastDot + 1);
    }

    function expandNameSegment(value, segment) {
        if (value.startsWith("*.")) {
            return value.replace("*.", segment);
        }
        return value;
    }

    function locateInputByName(formElement, inputName) {
        return formElement.querySelector(`[name="${inputName}"]`);
    }

    const ruleCheckers = {};
    const formValidationMapping = new WeakMap();

    class FormValidationSystem {
        constructor(formElement) {
            this.formElement = formElement;
            this.fieldRules = {};
            this.fieldMessages = {};
            this.errorMessagePlacement = boundFunction(this.defaultErrorPlacement, this.formElement);
            this.formInvalidHandler = boundFunction(this.defaultFormInvalidHandler, this.formElement);
            this.fieldSuccessHandler = boundFunction(this.defaultFieldSuccessHandler, this.formElement);
            this.errorInputClass = errorDisplayClass;
            this.errorElementTag = "span";
            this.activeErrorElements = new WeakMap();
            this.validationFailures = [];
            this.pendingRemoteChecks = new WeakMap();
            this.remoteCheckResults = new WeakMap();
        }

        assignValidationSetting(options, ruleName, ruleValue) {
            options.rules[ruleName] = ruleValue;
            if (options.message) {
                options.messages[ruleName] = options.message;
            }
        }

        addRuleLogic(name, method) {
            ruleCheckers[name] = method;
        }

        isFieldOptional(inputElement) {
            const val = inputElement.value;
            if (inputElement.type === "checkbox" || inputElement.type === "radio") {
                return !inputElement.checked;
            }
            return !val || val.trim() === "";
        }

        defaultErrorPlacement(errorElement, inputElement) {
            const containerSelector = `[${fieldMessageContainerMarker}="${inputElement.name}"]`;
            let container = this.formElement.querySelector(containerSelector);
            const replaceContent = parseBooleanString(retrieveAttribute(container, `${fieldMessageContainerMarker}-replace`));

            if (!container) {
                container = document.createElement("div");
                inputElement.parentNode.insertBefore(container, inputElement.nextSibling);
                container.setAttribute(fieldMessageContainerMarker, inputElement.name);
            }

            toggleClass(container, fieldValidContainerClass, false);
            toggleClass(container, fieldErrorContainerClass, true);

            errorElement._associatedContainer = container;
            this.activeErrorElements.set(inputElement, errorElement); // Store reference to the error element

            if (replaceContent) {
                purgeChildren(container);
                toggleClass(errorElement, this.errorInputClass, false);
                container.appendChild(errorElement);
            } else {
                errorElement.style.display = "none";
            }
        }

        defaultFormInvalidHandler(failureList) {
            const summaryBox = this.formElement.querySelector(`[${summaryMessageContainerMarker}="true"]`);
            const summaryListElement = summaryBox ? summaryBox.querySelector("ul") : null;

            if (summaryListElement && failureList.length) {
                purgeChildren(summaryListElement);
                toggleClass(summaryBox, summaryErrorContainerClass, true);
                toggleClass(summaryBox, summaryValidContainerClass, false);

                failureList.forEach(failure => {
                    const listItem = document.createElement("li");
                    listItem.textContent = failure.message;
                    summaryListElement.appendChild(listItem);
                });
            }
        }

        defaultFieldSuccessHandler(errorElement) {
            const container = errorElement._associatedContainer;
            if (container) {
                toggleClass(container, fieldValidContainerClass, true);
                toggleClass(container, fieldErrorContainerClass, false);

                const replaceContent = parseBooleanString(retrieveAttribute(container, `${fieldMessageContainerMarker}-replace`));
                if (replaceContent) {
                    purgeChildren(container);
                }
                // errorElement._associatedContainer = null; // Clean up reference
            }
        }

        async performValidation() {
            this.validationFailures = [];
            const allInputs = selectElements(`[name]`, this.formElement);
            let overallFormStatus = true;
            let currentPendingRemote = [];

            allInputs.forEach(input => {
                toggleClass(input, this.errorInputClass, false);
                const existingErrorElement = this.activeErrorElements.get(input);
                if (existingErrorElement) {
                    this.fieldSuccessHandler(existingErrorElement);
                    this.activeErrorElements.delete(input);
                }
            });

            const summaryBox = this.formElement.querySelector(`[${summaryMessageContainerMarker}="true"]`);
            if (summaryBox) {
                const summaryListElement = summaryBox.querySelector("ul");
                if (summaryListElement) purgeChildren(summaryListElement);
                toggleClass(summaryBox, summaryErrorContainerClass, false);
                toggleClass(summaryBox, summaryValidContainerClass, true);
            }

            for (const currentInput of allInputs) {
                const fieldName = currentInput.name;
                const rulesForCurrentField = this.fieldRules[fieldName];
                const messagesForCurrentField = this.fieldMessages[fieldName];

                if (!rulesForCurrentField) continue;

                let currentFieldStatus = true;
                const fieldSpecificFailures = [];

                for (const ruleKey in rulesForCurrentField) {
                    if (Object.prototype.hasOwnProperty.call(rulesForCurrentField, ruleKey)) {
                        const ruleValue = rulesForCurrentField[ruleKey];
                        const ruleMethod = ruleCheckers[ruleKey];
                        const failureMessage = messagesForCurrentField[ruleKey];

                        if (!ruleMethod) {
                            console.warn(`Validation: No method defined for rule "${ruleKey}"`);
                            continue;
                        }

                        if (ruleKey === "remote") {
                            const cachedRemoteResult = this.remoteCheckResults.get(currentInput)?.[ruleKey];
                            if (typeof cachedRemoteResult === 'boolean') {
                                if (!cachedRemoteResult) {
                                    fieldSpecificFailures.push({ element: currentInput, message: failureMessage, ruleName: ruleKey });
                                    currentFieldStatus = false;
                                    break;
                                }
                            } else {
                                const remotePromise = this.executeRemoteCheck(currentInput, ruleValue, failureMessage);
                                currentPendingRemote.push(remotePromise);
                                overallFormStatus = false;
                            }
                        } else {
                            if (!ruleMethod.call(this, currentInput.value, currentInput, ruleValue)) {
                                fieldSpecificFailures.push({ element: currentInput, message: failureMessage, ruleName: ruleKey });
                                currentFieldStatus = false;
                                break;
                            }
                        }
                    }
                }

                if (!currentFieldStatus) {
                    overallFormStatus = false;
                    toggleClass(currentInput, this.errorInputClass, true);
                    const errorSpan = document.createElement(this.errorElementTag);
                    errorSpan.textContent = fieldSpecificFailures[0].message;
                    this.validationFailures.push(fieldSpecificFailures[0]);
                    this.errorMessagePlacement(errorSpan, currentInput);
                }
            }

            if (currentPendingRemote.length > 0) {
                await Promise.all(currentPendingRemote);
                return this.performValidation();
            }

            if (!overallFormStatus) {
                this.formInvalidHandler(this.validationFailures);
            }

            return overallFormStatus;
        }

        async executeRemoteCheck(inputElement, config, errorMessage) {
            if (this.pendingRemoteChecks.has(inputElement)) {
                return this.pendingRemoteChecks.get(inputElement);
            }

            const payloadData = {};
            for (const key in config.data) {
                if (Object.prototype.hasOwnProperty.call(config.data, key)) {
                    const valueProvider = config.data[key];
                    payloadData[key] = typeof valueProvider === 'function' ? valueProvider() : valueProvider;
                }
            }
            payloadData[inputElement.name] = inputElement.value;

            const queryString = new URLSearchParams(payloadData).toString();
            const requestUrl = config.url + (config.type?.toUpperCase() === 'GET' ? `?${queryString}` : '');

            const fetchOptions = {
                method: config.type || 'GET',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            };
            if (config.type?.toUpperCase() === 'POST') {
                fetchOptions.body = queryString;
            }

            const checkPromise = fetch(requestUrl, fetchOptions)
                .then(response => response.json())
                .then(isValid => {
                    const fieldRemoteData = this.remoteCheckResults.get(inputElement) || {};
                    fieldRemoteData.remote = isValid;
                    this.remoteCheckResults.set(inputElement, fieldRemoteData);
                    return isValid;
                })
                .catch(error => {
                    console.error("Remote validation failed:", error);
                    const fieldRemoteData = this.remoteCheckResults.get(inputElement) || {};
                    fieldRemoteData.remote = false;
                    this.remoteCheckResults.set(inputElement, fieldRemoteData);
                    return false;
                })
                .finally(() => {
                    this.pendingRemoteChecks.delete(inputElement);
                });

            this.pendingRemoteChecks.set(inputElement, checkPromise);
            return checkPromise;
        }
    }

    const validationAdapterList = [];

    const unobtrusiveSetup = {
        addRuleAdapter: function (adapterName, parameters, adapterFn) {
            if (!adapterFn) {
                adapterFn = parameters;
                parameters = [];
            }
            validationAdapterList.push({ name: adapterName, params: parameters, adapt: adapterFn });
            return this;
        },

        addBooleanRuleAdapter: function (adapterName, ruleKey) {
            return this.addRuleAdapter(adapterName, function (options) {
                options.validator.assignValidationSetting(options, ruleKey || adapterName, true);
            });
        },

        addMinMaxRuleAdapter: function (adapterName, minRule, maxRule, minMaxRule, minAttribute, maxAttribute) {
            return this.addRuleAdapter(adapterName, [minAttribute || "min", maxAttribute || "max"], function (options) {
                const minVal = options.params.min;
                const maxVal = options.params.max;

                if (minVal && maxVal) {
                    options.validator.assignValidationSetting(options, minMaxRule, [minVal, maxVal]);
                } else if (minVal) {
                    options.validator.assignValidationSetting(options, minRule, minVal);
                } else if (maxVal) {
                    options.validator.assignValidationSetting(options, maxRule, maxVal);
                }
            });
        },

        addSingleValueRuleAdapter: function (adapterName, attributeKey, ruleKey) {
            return this.addRuleAdapter(adapterName, [attributeKey || "val"], function (options) {
                options.validator.assignValidationSetting(options, ruleKey || adapterName, options.params[attributeKey]);
            });
        },

        scanElementAttributes: function (inputElement, deferFormActivation) {
            const containingForm = inputElement.form;
            if (!containingForm) return;

            let validatorInstance = formValidationMapping.get(containingForm);
            if (!validatorInstance) {
                validatorInstance = new FormValidationSystem(containingForm);
                formValidationMapping.set(containingForm, validatorInstance);
            }

            validatorInstance.fieldRules[inputElement.name] = validatorInstance.fieldRules[inputElement.name] || {};
            validatorInstance.fieldMessages[inputElement.name] = validatorInstance.fieldMessages[inputElement.name] || {};

            validationAdapterList.forEach(adapter => {
                const attrPrefix = dataAttributeIdentifier + adapter.name;
                const messageValue = retrieveAttribute(inputElement, attrPrefix);

                if (messageValue !== null) {
                    const parameterValues = {};
                    adapter.params.forEach(paramName => {
                        parameterValues[paramName] = retrieveAttribute(inputElement, `${attrPrefix}-${paramName}`);
                    });

                    adapter.adapt({
                        element: inputElement,
                        form: containingForm,
                        message: messageValue,
                        params: parameterValues,
                        rules: validatorInstance.fieldRules[inputElement.name],
                        messages: validatorInstance.fieldMessages[inputElement.name],
                        validator: validatorInstance
                    });
                }
            });

            if (!deferFormActivation) {
                this.activateFormBehaviors(containingForm);
            }
        },

        scanDocumentForValidation: function (rootNode = document) {
            selectElements(`input[${validationActivationMarker}="true"], select[${validationActivationMarker}="true"], textarea[${validationActivationMarker}="true"]`, rootNode).forEach(input => {
                this.scanElementAttributes(input, true);
            });

            selectElements("form", rootNode).forEach(form => {
                this.activateFormBehaviors(form);
            });
        },

        activateFormBehaviors: function (formElement) {
            let validatorInstance = formValidationMapping.get(formElement);
            if (!validatorInstance) {
                validatorInstance = new FormValidationSystem(formElement);
                formValidationMapping.set(formElement, validatorInstance);
            }

            if (formElement._validationAttached) {
                return;
            }
            formElement._validationAttached = true;

            formElement.addEventListener("submit", async function (event) {
                event.preventDefault();
                const formValidity = await validatorInstance.performValidation();
                if (formValidity) {
                    event.target.submit();
                }
            });

            selectElements(`input[name], select[name], textarea[name]`, formElement).forEach(inputElement => {
                inputElement.addEventListener("blur", async function () {
                    const fieldName = inputElement.name;
                    const rulesForField = validatorInstance.fieldRules[fieldName];
                    if (!rulesForField) return;

                    let fieldOK = true;
                    const specificFieldFailures = [];
                    toggleClass(inputElement, validatorInstance.errorInputClass, false);

                    for (const ruleName in rulesForField) {
                        if (Object.prototype.hasOwnProperty.call(rulesForField, ruleName)) {
                            const ruleValue = rulesForField[ruleName];
                            const ruleMethod = ruleCheckers[ruleName];
                            const failureMessage = validatorInstance.fieldMessages[fieldName][ruleName];

                            if (ruleName === "remote") {
                                const remoteResult = await validatorInstance.executeRemoteCheck(inputElement, ruleValue, failureMessage);
                                if (!remoteResult) {
                                    specificFieldFailures.push({ element: inputElement, message: failureMessage, ruleName: ruleName });
                                    fieldOK = false;
                                    break;
                                }
                            } else {
                                if (!ruleMethod.call(validatorInstance, inputElement.value, inputElement, ruleValue)) {
                                    specificFieldFailures.push({ element: inputElement, message: failureMessage, ruleName: ruleName });
                                    fieldOK = false;
                                    break;
                                }
                            }
                        }
                    }

                    const existingErrorElement = validatorInstance.activeErrorElements.get(inputElement);
                    if (fieldOK) {
                        if (existingErrorElement) {
                            validatorInstance.fieldSuccessHandler(existingErrorElement);
                            validatorInstance.activeErrorElements.delete(inputElement);
                        }
                    } else {
                        toggleClass(inputElement, validatorInstance.errorInputClass, true);
                        const errorSpan = document.createElement(validatorInstance.errorElementTag);
                        errorSpan.textContent = specificFieldFailures[0].message;
                        validatorInstance.errorMessagePlacement(errorSpan, inputElement);
                    }
                });

                if (inputElement.type === "checkbox" || inputElement.type === "radio") {
                    inputElement.addEventListener("change", async function () {
                        inputElement.dispatchEvent(new Event('blur'));
                    });
                }
            });
        }
    };

    const tempValidator = new FormValidationSystem(document.createElement('form'));

    tempValidator.addRuleLogic("regex", function (value, element, pattern) {
        if (this.isFieldOptional(element)) return true;
        const match = new RegExp(pattern).exec(value);
        return (match && (match.index === 0) && (match[0].length === value.length));
    });

    tempValidator.addRuleLogic("required", function (value, element) {
        if (element.tagName.toUpperCase() === "INPUT" && element.type.toUpperCase() === "CHECKBOX") {
            return element.checked;
        }
        return !this.isFieldOptional(element);
    });

    tempValidator.addRuleLogic("email", function (value, element) {
        if (this.isFieldOptional(element)) return true;
        return /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(value);
    });

    tempValidator.addRuleLogic("url", function (value, element) {
        if (this.isFieldOptional(element)) return true;
        return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
    });

    tempValidator.addRuleLogic("number", function (value, element) {
        if (this.isFieldOptional(element)) return true;
        return /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value);
    });

    tempValidator.addRuleLogic("digits", function (value, element) {
        if (this.isFieldOptional(element)) return true;
        return /^\d+$/.test(value);
    });

    tempValidator.addRuleLogic("creditcard", function (value, element) {
        if (this.isFieldOptional(element)) return true;
        if (/[^0-9 \-]+/.test(value)) return false;
        let nCheck = 0, bEven = false;
        value = value.replace(/\D/g, "");
        for (let n = value.length - 1; n >= 0; n--) {
            let cDigit = value.charAt(n), nDigit = parseInt(cDigit, 10);
            if (bEven && (nDigit *= 2) > 9) nDigit -= 9;
            nCheck += nDigit;
            bEven = !bEven;
        }
        return (nCheck % 10) === 0;
    });

    tempValidator.addRuleLogic("date", function (value, element) {
        if (this.isFieldOptional(element)) return true;
        return !/Invalid|NaN/.test(new Date(value).toString());
    });

    tempValidator.addRuleLogic("minlength", function (value, element, param) {
        return this.isFieldOptional(element) || value.length >= param;
    });

    tempValidator.addRuleLogic("maxlength", function (value, element, param) {
        return this.isFieldOptional(element) || value.length <= param;
    });

    tempValidator.addRuleLogic("rangelength", function (value, element, param) {
        return this.isFieldOptional(element) || (value.length >= param[0] && value.length <= param[1]);
    });

    tempValidator.addRuleLogic("min", function (value, element, param) {
        return this.isFieldOptional(element) || parseFloat(value) >= parseFloat(param);
    });

    tempValidator.addRuleLogic("max", function (value, element, param) {
        return this.isFieldOptional(element) || parseFloat(value) <= parseFloat(param);
    });

    tempValidator.addRuleLogic("range", function (value, element, param) {
        return this.isFieldOptional(element) || (parseFloat(value) >= parseFloat(param[0]) && parseFloat(value) <= parseFloat(param[1]));
    });

    tempValidator.addRuleLogic("equalTo", function (value, element, otherElement) {
        return this.isFieldOptional(element) || (otherElement && value === otherElement.value);
    });

    tempValidator.addRuleLogic("remote", function (value, element, params) {
        const cachedResult = this.remoteCheckResults.get(element)?.remote;
        if (this.pendingRemoteChecks.has(element)) {
            return true;
        }
        return typeof cachedResult === 'boolean' ? cachedResult : true;
    });

    unobtrusiveSetup.addSingleValueRuleAdapter("accept", "extensions", "accept").addSingleValueRuleAdapter("regex", "pattern");
    unobtrusiveSetup.addBooleanRuleAdapter("creditcard").addBooleanRuleAdapter("date").addBooleanRuleAdapter("digits").addBooleanRuleAdapter("email").addBooleanRuleAdapter("number").addBooleanRuleAdapter("url");
    unobtrusiveSetup.addMinMaxRuleAdapter("length", "minlength", "maxlength", "rangelength").addMinMaxRuleAdapter("range", "min", "max", "range");

    unobtrusiveSetup.addRuleAdapter("equalto", ["other"], function (options) {
        const fieldSegment = extractNameSegment(options.element.name);
        const otherFieldId = options.params.other;
        const fullOtherFieldName = expandNameSegment(otherFieldId, fieldSegment);
        const targetInput = locateInputByName(options.form, fullOtherFieldName);
        options.validator.assignValidationSetting(options, "equalTo", targetInput);
    });

    unobtrusiveSetup.addRuleAdapter("required", function (options) {
        options.validator.assignValidationSetting(options, "required", true);
    });

    unobtrusiveSetup.addRuleAdapter("remote", ["url", "type", "fields"], function (options) {
        const remoteConfiguration = {
            url: options.params.url,
            type: options.params.type || "GET",
            data: {}
        };
        const fieldSegment = extractNameSegment(options.element.name);

        divideStringByComma(options.params.fields || options.element.name).forEach(fName => {
            const paramKey = expandNameSegment(fName, fieldSegment);
            remoteConfiguration.data[paramKey] = function () {
                return locateInputByName(options.form, paramKey)?.value || "";
            };
        });

        options.validator.assignValidationSetting(options, "remote", remoteConfiguration);
    });

    function onDocumentReady(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    onDocumentReady(function () {
        unobtrusiveSetup.scanDocumentForValidation(document);
    });

})();