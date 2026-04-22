(function(globalScope, docContext, noValue) {

    // Configuration settings for the validation logic.
    // These defaults can be overridden for specific validation instances.
    var validationConfig = {
        // Collection of default error messages for various validation rules.
        errorMessages: {
            // Standard validation rule messages
            requiredField: 'The {field} is mandatory.',
            matchField: 'The {field} does not match the {otherField}.',
            defaultPlaceholder: 'The {field} still has its default value, please update it.',
            validEmail: 'The {field} must contain a valid email address.',
            allValidEmails: 'The {field} must contain only valid email addresses.',
            minChars: 'The {field} needs at least {length} characters.',
            maxChars: 'The {field} cannot exceed {length} characters.',
            exactChars: 'The {field} must be exactly {length} characters long.',
            greaterThanNum: 'The {field} must be a number greater than {value}.',
            lessThanNum: 'The {field} must be a number less than {value}.',
            onlyAlpha: 'The {field} can only contain alphabetical characters.',
            alphaNumericOnly: 'The {field} can only contain alphanumeric characters.',
            alphaDashUnderscore: 'The {field} can only contain alphanumeric characters, underscores, and dashes.',
            justNumbers: 'The {field} must contain only numeric digits.',
            isInteger: 'The {field} must be an integer.',
            isDecimal: 'The {field} must be a decimal number.',
            naturalNumber: 'The {field} must contain only positive numbers.',
            naturalNumberNoZero: 'The {field} must contain a positive number greater than zero.',
            validIpAddress: 'The {field} must be a valid IP address.',
            validBase64String: 'The {field} must contain a valid base64 encoded string.',
            validCreditCardNum: 'The {field} must contain a valid credit card number.',
            fileTypeRestricted: 'The {field} must contain only {types} files.',
            validWebUrl: 'The {field} must contain a valid URL.',
            dateAfter: 'The {field} must be a date after {comparisonDate}.',
            dateBefore: 'The {field} must be a date before {comparisonDate}.',
            dateOnOrAfter: 'The {field} must be a date on or after {comparisonDate}.',
            dateOnOrBefore: 'The {field} must be a date on or before {comparisonDate}.',
            // Custom messages for new rules
            isJson: 'The {field} must contain valid JSON data.'
        },
        // Default function to execute after validation completes.
        onValidationComplete: function(issues) { /* No operation by default */ }
    };

    // Regular expressions for various validation patterns.
    var regExpPatterns = {
        ruleDefinition: /^(.+?)\[(.+)\]$/, // Extracts rule name and parameter, e.g., 'rule[param]'
        numeric: /^[0-9]+$/,
        integer: /^\-?[0-9]+$/,
        decimal: /^\-?[0-9]*\.?[0-9]+$/,
        email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
        alpha: /^[a-z]+$/i,
        alphaNumeric: /^[a-z0-9]+$/i,
        alphaDash: /^[a-z0-9_\-]+$/i,
        natural: /^[0-9]+$/i,
        naturalNoZero: /^[1-9][0-9]*$/i,
        ipAddress: /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/i,
        base64: /[^a-zA-Z0-9\/\+=]/i, // Used to detect invalid base64 chars
        numericDashWhitespace: /^[\d\-\s]+$/, // For credit card pre-check
        webUrl: /^((http|https):\/\/(\w+:{0,1}\w*@)?(\S+)|)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/,
        isoDate: /\d{4}-\d{1,2}-\d{1,2}/ // Matches YYYY-MM-DD
    };

    /**
     * Utility for formatting strings using placeholders.
     * Replaces '{placeholder}' with corresponding values from an object.
     * @param {string} str - The string to format.
     * @param {object} replacements - An object where keys are placeholders and values are replacements.
     * @returns {string} The formatted string.
     */
    var formatString = function(str, replacements) {
        if (typeof str !== 'string' || !replacements) {
            return str;
        }
        for (var key in replacements) {
            if (replacements.hasOwnProperty(key)) {
                str = str.replace(new RegExp('{' + key + '}', 'g'), String(replacements[key]));
            }
        }
        return str;
    };

    /**
     * Retrieves the value of a specific attribute from a DOM element.
     * Handles radio/checkbox groups by returning the attribute from the checked element.
     * @param {HTMLElement|NodeList|HTMLCollection} elementRef - The DOM element or NodeList/HTMLCollection.
     * @param {string} attrName - The name of the attribute to retrieve.
     * @returns {string|boolean|undefined} The attribute's value, or undefined if not found/applicable.
     */
    var getElementAttribute = function(elementRef, attrName) {
        if (!elementRef) {
            return noValue; // Guard against null/undefined elementRef
        }

        // Handle NodeList/HTMLCollection for radio/checkbox groups
        if (elementRef.length > 0 && (elementRef[0].type === 'radio' || elementRef[0].type === 'checkbox')) {
            for (var k = 0, len = elementRef.length; k < len; k++) {
                if (elementRef[k].checked) {
                    return elementRef[k][attrName];
                }
            }
            return noValue; // No checked element found
        }
        // Handle single element
        return elementRef[attrName];
    };

    /**
     * Retrieves the actual value from a form input element.
     * Handles different input types (text, radio, checkbox, select multiple).
     * @param {HTMLElement|NodeList|HTMLCollection} elementRef - The DOM element or NodeList/HTMLCollection.
     * @returns {string|boolean|Array<string>|null|undefined} The element's value.
     */
    var getInputValue = function(elementRef) {
        if (!elementRef) {
            return noValue;
        }

        var elementType = getElementAttribute(elementRef, 'type');

        if (elementType === 'checkbox' || elementType === 'radio') {
            return getElementAttribute(elementRef, 'checked');
        } else if (elementRef.nodeName === 'SELECT' && elementRef.multiple) {
            // Handle multi-select dropdowns
            var selectedValues = [];
            for (var i = 0; i < elementRef.options.length; i++) {
                if (elementRef.options[i].selected) {
                    selectedValues.push(elementRef.options[i].value);
                }
            }
            return selectedValues;
        } else if (elementRef.length > 0 && elementRef[0].nodeName === 'SELECT' && elementRef[0].multiple) {
             // Handle case where elementRef is a NodeList but represents a single multiple select
            var selectedValuesList = [];
            for (var j = 0; j < elementRef[0].options.length; j++) {
                if (elementRef[0].options[j].selected) {
                    selectedValuesList.push(elementRef[0].options[j].value);
                }
            }
            return selectedValuesList;
        }

        return getElementAttribute(elementRef, 'value');
    };

    /**
     * Core validation class responsible for managing and executing validation rules on a form.
     *
     * @param {string|HTMLElement} targetFormRef - The name attribute of the form or the form's DOM node.
     * @param {Array<object>} fieldDefinitions - An array of objects, each defining a field and its rules.
     *     Example: [{ name: 'myField', displayName: 'My Field', rules: 'required|minChars[5]' }]
     * @param {Function} [completionHandler] - Callback function executed after validation.
     *     Arguments: (validationIssues: Array, eventObject: Event)
     */
    var InputChecker = function(targetFormRef, fieldDefinitions, completionHandler) {
        this.completionHandler = completionHandler || validationConfig.onValidationComplete;
        this.validationIssues = []; // Stores all errors found during validation
        this.managedFields = {};    // Map of field names to their validation configurations
        this.currentForm = this._resolveFormTarget(targetFormRef); // The DOM form element
        this.customMessages = {};   // Custom error messages for specific rules/fields
        this.customHandlers = {};   // User-defined callback functions for custom rules
        this.dynamicConditions = {}; // User-defined functions for 'dependsOn' logic

        // Guard clause: If the form element isn't found, log a warning and stop initialization.
        if (!this.currentForm) {
            console.warn('InputChecker: Target form not found for reference:', targetFormRef);
            return;
        }

        // Iterate through provided field definitions to set up internal field objects.
        fieldDefinitions.forEach(function(fieldDef) {
            // Skip malformed field definitions.
            if ((!fieldDef.name && !fieldDef.names) || !fieldDef.rules) {
                console.warn('InputChecker: Skipping malformed field definition:', fieldDef);
                return;
            }

            // Handle fields defined by an array of names (e.g., multiple checkboxes with the same rules).
            if (fieldDef.names && Array.isArray(fieldDef.names)) {
                fieldDef.names.forEach(function(fieldName) {
                    this._registerField(fieldDef, fieldName);
                }, this);
            } else {
                this._registerField(fieldDef, fieldDef.name);
            }
        }, this); // Ensure 'this' refers to InputChecker instance within forEach

        // Attach a validation trigger to the form's submission event.
        var _originalSubmitHandler = this.currentForm.onsubmit;

        this.currentForm.onsubmit = (function(instanceRef) {
            return function(eventObject) {
                // Execute validation and then, if successful, the original submit handler (if any).
                var validationPassed = instanceRef._performValidation(eventObject);
                return validationPassed && (_originalSubmitHandler === noValue || _originalSubmitHandler.apply(this, arguments));
            };
        })(this);
    };

    /**
     * Public method to set a custom error message for a specific rule.
     * @param {string} ruleKey - The name of the validation rule (e.g., 'requiredField', 'minChars').
     * @param {string} customMsg - The custom message string.
     * @returns {InputChecker} - Returns the instance for method chaining.
     */
    InputChecker.prototype.setCustomMessage = function(ruleKey, customMsg) {
        this.customMessages[ruleKey] = customMsg;
        return this;
    };

    /**
     * Public method to register a custom callback function for a validation rule.
     * This allows users to define their own validation logic.
     * @param {string} handlerName - The name of the custom rule (e.g., 'username_check').
     * @param {Function} ruleHandler - The function to execute for this rule.
     *     Arguments: (fieldValue: any, parameter: string, fieldObject: object)
     *     Should return `true` for valid, `false` for invalid.
     * @returns {InputChecker} - Returns the instance for method chaining.
     */
    InputChecker.prototype.addCustomRuleHandler = function(handlerName, ruleHandler) {
        if (typeof handlerName === 'string' && typeof ruleHandler === 'function') {
            this.customHandlers[handlerName] = ruleHandler;
        }
        return this;
    };

    /**
     * Public method to register a conditional logic function for the 'dependsOn' rule.
     * This function determines if a field should be validated based on other conditions.
     * @param {string} conditionName - The name of the conditional logic (e.g., 'isAdmin').
     * @param {Function} logicFunction - The function to execute.
     *     Arguments: (fieldObject: object)
     *     Should return `true` to validate the field, `false` to skip.
     * @returns {InputChecker} - Returns the instance for method chaining.
     */
    InputChecker.prototype.addConditionalLogic = function(conditionName, logicFunction) {
        if (typeof conditionName === 'string' && typeof logicFunction === 'function') {
            this.dynamicConditions[conditionName] = logicFunction;
        }
        return this;
    };

    /**
     * Private method: Resolves the form target from a string name or a direct DOM node.
     * @private
     * @param {string|HTMLElement} formIdentifier - The form's name or its DOM element.
     * @returns {HTMLElement|null} The resolved form DOM element, or null if not found.
     */
    InputChecker.prototype._resolveFormTarget = function(formIdentifier) {
        if (typeof formIdentifier === 'object' && formIdentifier instanceof HTMLElement) {
            return formIdentifier;
        }
        if (typeof formIdentifier === 'string') {
            // Check by name attribute first, then by ID.
            return docContext.forms[formIdentifier] || docContext.getElementById(formIdentifier);
        }
        return null;
    };

    /**
     * Private method: Adds a field's configuration to the internal managedFields array.
     * @private
     * @param {object} fieldDefinition - The original field definition object.
     * @param {string} fieldName - The actual name of the input element.
     */
    InputChecker.prototype._registerField = function(fieldDefinition, fieldName) {
        // Generate a default display name if not provided.
        var displayName = fieldDefinition.display || fieldName.replace(/_/g, ' ').replace(/\b\w/g, function(l) { return l.toUpperCase(); });

        this.managedFields[fieldName] = {
            name: fieldName,
            displayName: displayName,
            rules: fieldDefinition.rules,
            dependsOn: fieldDefinition.depends,
            domId: noValue,
            domElement: noValue,
            elementType: noValue,
            currentValue: noValue,
            isChecked: noValue
        };
    };

    /**
     * Private method: Retrieves a field object from `managedFields` by its name.
     * @private
     * @param {string} fieldName - The name of the field to retrieve.
     * @returns {object|null} The field object or null if not found.
     */
    InputChecker.prototype._getFieldByName = function(fieldName) {
        return this.managedFields[fieldName] || null;
    };

    /**
     * Private method: Executes the entire validation process for the form.
     * @private
     * @param {Event} eventObject - The submit event object.
     * @returns {boolean} True if validation passes, false otherwise.
     */
    InputChecker.prototype._performValidation = function(eventObject) {
        this.validationIssues = []; // Clear previous errors

        // Guard: if form is not found, prevent submission and return false.
        if (!this.currentForm) {
            console.error('InputChecker: Cannot perform validation; form element is missing.');
            if (eventObject && eventObject.preventDefault) {
                eventObject.preventDefault();
            }
            return false;
        }

        // Iterate over all fields registered for validation.
        for (var fieldNameKey in this.managedFields) {
            if (this.managedFields.hasOwnProperty(fieldNameKey)) {
                var currentField = this.managedFields[fieldNameKey] || {};
                var domElement = this.currentForm[currentField.name];

                // Ensure the DOM element for the field actually exists.
                if (!domElement) {
                    console.warn('InputChecker: Field DOM element not found for field:', currentField.name);
                    continue; // Skip to the next field
                }

                // Populate currentField properties from the DOM element.
                currentField.domId = getElementAttribute(domElement, 'id');
                currentField.domElement = domElement;
                currentField.elementType = (domElement.length > 0) ? domElement[0].type : domElement.type;
                currentField.currentValue = getInputValue(domElement); // Use the new helper
                currentField.isChecked = getElementAttribute(domElement, 'checked');

                var shouldValidateField = true;

                // Check for 'dependsOn' conditional logic.
                if (currentField.dependsOn) {
                    if (typeof currentField.dependsOn === "function") {
                        shouldValidateField = currentField.dependsOn.call(this, currentField);
                    } else if (typeof currentField.dependsOn === "string" && this.dynamicConditions[currentField.dependsOn]) {
                        shouldValidateField = this.dynamicConditions[currentField.dependsOn].call(this, currentField);
                    } else {
                        console.warn('InputChecker: Invalid "dependsOn" configuration for field:', currentField.name);
                        // If dependsOn is misconfigured, assume it should validate to prevent unexpected skips
                    }
                }

                if (shouldValidateField) {
                    this._checkSingleField(currentField);
                }
            }
        }

        // Execute the user-defined completion handler.
        if (typeof this.completionHandler === 'function') {
            this.completionHandler(this.validationIssues, eventObject);
        }

        // If there are errors, prevent form submission.
        if (this.validationIssues.length > 0) {
            if (eventObject && eventObject.preventDefault) {
                eventObject.preventDefault();
            } else if (globalScope.event) { // For older IE compatibility
                globalScope.event.returnValue = false;
            }
            return false; // Validation failed
        }

        return true; // Validation passed
    };

    /**
     * Private method: Parses a rule string (e.g., "minChars[5]") into its method name and parameter.
     * @private
     * @param {string} ruleString - The full rule string.
     * @returns {{method: string, param: string|null}} Object with method name and parameter.
     */
    InputChecker.prototype._processRuleAndParam = function(ruleString) {
        var ruleParts = regExpPatterns.ruleDefinition.exec(ruleString);
        if (ruleParts) {
            return { method: ruleParts[1], param: ruleParts[2] };
        }
        return { method: ruleString, param: null };
    };

    /**
     * Private method: Validates a single field against its defined rules.
     * @private
     * @param {object} currentField - The field object containing its configuration and current state.
     */
    InputChecker.prototype._checkSingleField = function(currentField) {
        var appliedRules = currentField.rules.split('|');
        var isRequired = currentField.rules.indexOf('required') !== -1;
        var isFieldEmpty = (currentField.currentValue === null || currentField.currentValue === '' || currentField.currentValue === noValue || (Array.isArray(currentField.currentValue) && currentField.currentValue.length === 0));

        // Iterate through each rule defined for the field.
        for (var i = 0, ruleCount = appliedRules.length; i < ruleCount; i++) {
            var fullRule = appliedRules[i];
            var ruleInfo = this._processRuleAndParam(fullRule);
            var checkMethod = ruleInfo.method;
            var methodParameter = ruleInfo.param;
            var validationFailed = false;

            // Determine if it's a callback or negated rule.
            var isCallbackRule = checkMethod.substring(0, 9) === 'callback_';
            var isNegatedRule = checkMethod.charAt(0) === '!';

            // If the field is not required and its value is empty, skip non-callback rules.
            // Callbacks should always run as they might perform actions even on empty fields.
            if (!isRequired && !isCallbackRule && isFieldEmpty) {
                continue;
            }

            // Handle negated rules (e.g., '!alpha').
            if (isNegatedRule) {
                checkMethod = checkMethod.substring(1);
            }

            // Execute the validation hook or custom handler.
            var ruleResult = true; // Assume valid until proven otherwise
            if (typeof this._validationMethods[checkMethod] === 'function') {
                ruleResult = this._validationMethods[checkMethod].apply(this, [currentField, methodParameter]);
            } else if (isCallbackRule) {
                var customHandlerName = checkMethod.substring(9);
                if (typeof this.customHandlers[customHandlerName] === 'function') {
                    ruleResult = this.customHandlers[customHandlerName].apply(this, [currentField.currentValue, methodParameter, currentField]);
                } else {
                    console.warn('InputChecker: Custom handler "' + customHandlerName + '" not registered. Treating as failed.');
                    ruleResult = false; // Treat as failed if handler is missing to prevent unexpected passes
                }
            } else {
                console.warn('InputChecker: Unknown validation rule or method "' + checkMethod + '" for field:', currentField.name);
                ruleResult = false; // Unknown rule should fail
            }

            // Apply negation if '!' prefix was used.
            if (isNegatedRule) {
                ruleResult = !ruleResult;
            }

            // If validation failed for this rule, record the error.
            if (!ruleResult) {
                validationFailed = true;

                // Determine the appropriate error message.
                var messageKey = currentField.name + '.' + checkMethod; // Field-specific message first
                var messageSource = this.customMessages[messageKey] || this.customMessages[checkMethod] || validationConfig.errorMessages[checkMethod];
                
                // Fallback if no specific message is found
                if (!messageSource) {
                    messageSource = 'Validation failed for {field}.'; // Generic fallback message
                }

                // Format the message with field display names and parameters.
                var replacements = {
                    field: currentField.displayName
                };
                if (methodParameter) {
                    // Try to get display name for parameter if it refers to another field
                    var paramField = this._getFieldByName(methodParameter);
                    replacements.otherField = paramField ? paramField.displayName : methodParameter;
                    replacements.value = methodParameter; // For numeric comparisons
                    replacements.length = methodParameter; // For length checks
                    replacements.types = methodParameter; // For file types
                    replacements.comparisonDate = methodParameter; // For date comparisons
                }
                var finalMessage = formatString(messageSource, replacements);

                this.validationIssues.push({
                    fieldId: currentField.domId,
                    fieldElement: currentField.domElement,
                    fieldName: currentField.name,
                    messageText: finalMessage,
                    ruleName: checkMethod
                });

                // Stop validating this field after the first failure to avoid multiple errors for one field.
                break;
            }
        }
    };

    /**
     * Private method: Helper function to convert a date string (YYYY-MM-DD or 'today') into a Date object.
     * @private
     * @param {string} dateString - The date string to parse.
     * @returns {Date|null} A Date object or null if invalid format.
     */
    InputChecker.prototype._parseDateForComparison = function(dateString) {
        if (typeof dateString !== 'string') {
            return null;
        }

        if (dateString.toLowerCase() === 'today') {
            var today = new Date();
            today.setHours(0, 0, 0, 0); // Normalize to start of day
            return today;
        }

        if (!regExpPatterns.isoDate.test(dateString)) {
            return null; // Invalid date format
        }

        var dateComponents = dateString.split('-').map(Number);
        // Month is 0-indexed in Date constructor
        var parsedDate = new Date(dateComponents[0], dateComponents[1] - 1, dateComponents[2]);

        // Basic check for valid date (e.g., '2023-02-30' becomes March 2nd, which is not desired)
        // Check if the parsed date components match the input components after parsing
        if (parsedDate.getFullYear() !== dateComponents[0] ||
            parsedDate.getMonth() !== dateComponents[1] - 1 ||
            parsedDate.getDate() !== dateComponents[2]) {
            return null; // The date string was invalid (e.g., 2023-02-30)
        }

        parsedDate.setHours(0, 0, 0, 0); // Normalize to start of day
        return parsedDate;
    };

    /**
     * Private object: Collection of built-in validation methods (hooks).
     * Each method receives the field object and an optional parameter.
     * Returns `true` for valid, `false` for invalid.
     * @private
     */
    InputChecker.prototype._validationMethods = {
        required: function(currentField) {
            var elementValue = currentField.currentValue;

            if (currentField.elementType === 'checkbox' || currentField.elementType === 'radio') {
                return currentField.isChecked === true;
            }
            // Handle select multiple case (currentValue is an array)
            if (Array.isArray(elementValue)) {
                return elementValue.length > 0;
            }
            // For other input types, check for non-empty string or non-null/undefined value
            return elementValue !== null && elementValue !== '' && elementValue !== noValue;
        },

        defaultPlaceholder: function(currentField, defaultText) {
            return currentField.currentValue !== defaultText;
        },

        matchField: function(currentField, otherFieldName) {
            var otherFieldElement = this.currentForm[otherFieldName];
            if (otherFieldElement) {
                var otherFieldValue = getInputValue(otherFieldElement);
                return currentField.currentValue === otherFieldValue;
            }
            console.warn('InputChecker: matchField rule: field to match against "' + otherFieldName + '" not found.');
            return false; // If the field to match against isn't found, consider it a failure.
        },

        validEmail: function(currentField) {
            return regExpPatterns.email.test(currentField.currentValue);
        },

        allValidEmails: function(currentField) {
            if (typeof currentField.currentValue !== 'string' || currentField.currentValue.trim() === '') {
                return false; // Empty or non-string value can't contain valid emails
            }
            var emailList = currentField.currentValue.split(/\s*,\s*/g).filter(function(e) { return e.trim() !== ''; }); // Filter out empty strings
            return emailList.every(function(email) {
                return regExpPatterns.email.test(email);
            });
        },

        minChars: function(currentField, minLength) {
            var lengthNum = parseInt(minLength, 10);
            if (isNaN(lengthNum) || !regExpPatterns.numeric.test(minLength)) {
                console.warn('InputChecker: minChars rule received invalid length parameter:', minLength);
                return false; // Invalid parameter, treat as validation failure
            }
            return (String(currentField.currentValue).length >= lengthNum);
        },

        maxChars: function(currentField, maxLength) {
            var lengthNum = parseInt(maxLength, 10);
            if (isNaN(lengthNum) || !regExpPatterns.numeric.test(maxLength)) {
                console.warn('InputChecker: maxChars rule received invalid length parameter:', maxLength);
                return false;
            }
            return (String(currentField.currentValue).length <= lengthNum);
        },

        exactChars: function(currentField, exactLength) {
            var lengthNum = parseInt(exactLength, 10);
            if (isNaN(lengthNum) || !regExpPatterns.numeric.test(exactLength)) {
                console.warn('InputChecker: exactChars rule received invalid length parameter:', exactLength);
                return false;
            }
            return (String(currentField.currentValue).length === lengthNum);
        },

        greaterThanNum: function(currentField, comparisonValue) {
            if (!regExpPatterns.decimal.test(currentField.currentValue)) {
                return false;
            }
            var numValue = parseFloat(currentField.currentValue);
            var compValue = parseFloat(comparisonValue);
            if (isNaN(numValue) || isNaN(compValue)) {
                console.warn('InputChecker: greaterThanNum rule received non-numeric values:', currentField.currentValue, comparisonValue);
                return false;
            }
            return (numValue > compValue);
        },

        lessThanNum: function(currentField, comparisonValue) {
            if (!regExpPatterns.decimal.test(currentField.currentValue)) {
                return false;
            }
            var numValue = parseFloat(currentField.currentValue);
            var compValue = parseFloat(comparisonValue);
            if (isNaN(numValue) || isNaN(compValue)) {
                console.warn('InputChecker: lessThanNum rule received non-numeric values:', currentField.currentValue, comparisonValue);
                return false;
            }
            return (numValue < compValue);
        },

        onlyAlpha: function(currentField) {
            return regExpPatterns.alpha.test(currentField.currentValue);
        },

        alphaNumericOnly: function(currentField) {
            return regExpPatterns.alphaNumeric.test(currentField.currentValue);
        },

        alphaDashUnderscore: function(currentField) {
            return regExpPatterns.alphaDash.test(currentField.currentValue);
        },

        justNumbers: function(currentField) {
            return regExpPatterns.numeric.test(currentField.currentValue);
        },

        isInteger: function(currentField) {
            return regExpPatterns.integer.test(currentField.currentValue);
        },

        isDecimal: function(currentField) {
            return regExpPatterns.decimal.test(currentField.currentValue);
        },

        naturalNumber: function(currentField) {
            return regExpPatterns.natural.test(currentField.currentValue);
        },

        naturalNumberNoZero: function(currentField) {
            return regExpPatterns.naturalNoZero.test(currentField.currentValue);
        },

        validIpAddress: function(currentField) {
            return regExpPatterns.ipAddress.test(currentField.currentValue);
        },

        validBase64String: function(currentField) {
            var value = String(currentField.currentValue);
            // Check for invalid characters, then check length divisibility by 4
            return !regExpPatterns.base64.test(value) && (value.length % 4 === 0);
        },

        validCreditCardNum: function(currentField) {
            // Basic Luhn algorithm implementation.
            // This is a simplified check; real CC validation involves more specific regexes for card types.
            var value = String(currentField.currentValue).replace(/\D/g, ''); // Remove all non-digits
            if (!regExpPatterns.numeric.test(value) || value.length < 13 || value.length > 19) {
                return false;
            }

            var sum = 0;
            var double = false;
            for (var k = value.length - 1; k >= 0; k--) {
                var digit = parseInt(value.charAt(k), 10);
                if (double) {
                    digit *= 2;
                    if (digit > 9) {
                        digit -= 9; // Sum digits if > 9 (e.g., 12 becomes 1+2=3)
                    }
                }
                sum += digit;
                double = !double;
            }
            return (sum % 10) === 0;
        },

        fileTypeRestricted: function(currentField, allowedTypes) {
            // This rule applies only to file input types.
            if (currentField.elementType === 'file' && currentField.domElement.files && currentField.domElement.files.length > 0) {
                var typesArray = allowedTypes.split(',').map(function(t) { return t.trim().toLowerCase(); });
                for (var k = 0; k < currentField.domElement.files.length; k++) {
                    var file = currentField.domElement.files[k];
                    var fileExtension = file.name.split('.').pop().toLowerCase();
                    var fileMimeType = file.type.toLowerCase();

                    // Check if file extension or MIME type is in the allowed list
                    if (!(typesArray.indexOf(fileExtension) !== -1 || typesArray.indexOf(fileMimeType) !== -1)) {
                        return false; // File type not allowed
                    }
                }
                return true;
            }
            // If not a file input or no files, it's considered valid for this rule (unless 'required' is also set).
            return true;
        },

        validWebUrl: function(currentField) {
            return regExpPatterns.webUrl.test(currentField.currentValue);
        },

        dateAfter: function(currentField, comparisonDateString) {
            var fieldDate = this._parseDateForComparison(currentField.currentValue);
            var compDate = this._parseDateForComparison(comparisonDateString);
            return fieldDate !== null && compDate !== null && fieldDate > compDate;
        },

        dateBefore: function(currentField, comparisonDateString) {
            var fieldDate = this._parseDateForComparison(currentField.currentValue);
            var compDate = this._parseDateForComparison(comparisonDateString);
            return fieldDate !== null && compDate !== null && fieldDate < compDate;
        },

        dateOnOrAfter: function(currentField, comparisonDateString) {
            var fieldDate = this._parseDateForComparison(currentField.currentValue);
            var compDate = this._parseDateForComparison(comparisonDateString);
            return fieldDate !== null && compDate !== null && fieldDate >= compDate;
        },

        dateOnOrBefore: function(currentField, comparisonDateString) {
            var fieldDate = this._parseDateForComparison(currentField.currentValue);
            var compDate = this._parseDateForComparison(comparisonDateString);
            return fieldDate !== null && compDate !== null && fieldDate <= compDate;
        },

        // New custom rule example: Validate if content is valid JSON
        isJson: function(currentField) {
            if (typeof currentField.currentValue !== 'string' || currentField.currentValue.trim() === '') {
                return false; // Empty or non-string values are not valid JSON
            }
            try {
                JSON.parse(currentField.currentValue);
                return true;
            } catch (e) {
                return false;
            }
        }
    };

    // Expose the InputChecker constructor to the global scope.
    globalScope.InputChecker = InputChecker;

})(window, document); // Pass window, document, and undefined for minification safety