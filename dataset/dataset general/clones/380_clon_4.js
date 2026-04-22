var FormGuardian = (function() {
    var defaultConfiguration = {
        styleMarkers: {
            valid: 'is-valid',
            invalid: 'is-invalid',
            required: 'is-required'
        },
        feedbackPrompts: {
            required: "This information is essential.",
            pattern: "Please adhere to the specified format.",
            email: "A valid email address is needed.",
            url: "A URL format is expected.",
            numeric: "Only numerical values are permitted.",
            largeValue: "Value exceeds maximum allowed.",
            smallValue: "Value is below minimum allowed."
        },
        issueHandling: {
            forceDisplay: false,
            createVisualFeedback: function(inputElement) {
                var feedbackSpan = document.createElement('span');
                feedbackSpan.className = 'validation-error-message';
                inputElement.parentNode.insertBefore(feedbackSpan, inputElement.nextSibling);
                return feedbackSpan;
            }
        }
    };

    function deepMerge(target, source) {
        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key]) && typeof target[key] === 'object' && target[key] !== null) {
                    target[key] = deepMerge(target[key] || {}, source[key]);
                } else {
                    target[key] = source[key];
                }
            }
        }
        return target;
    }

    var testElement = document.createElement("input");

    function isHostAccessor(obj, prop) {
        var propType = typeof obj[prop];
        return !!((/^(function|object)$/i.test(propType) && obj[prop]) || propType === 'unknown');
    }

    var nativeFeatureSet = {
        attributePresence: {
            needsValue: ('required' in testElement),
            formatConstraint: ('pattern' in testElement),
            minimumValue: ('min' in testElement),
            maximumValue: ('max' in testElement)
        },
        methodAvailability: {
            statusObject: isHostAccessor(testElement, 'validity'),
            selfCheck: isHostAccessor(testElement, 'checkValidity'),
            customFeedback: isHostAccessor(testElement, 'setCustomValidity'),
            numericalRepresentation: isHostAccessor(testElement, 'valueAsNumber'),
            dateRepresentation: isHostAccessor(testElement, 'valueAsDate')
        }
    };
    
    function queryAll(selector, context) {
        return Array.prototype.slice.call((context || document).querySelectorAll(selector));
    }

    var regexRepository = {
        'email': /^[a-z0-9_.%+-]+@[0-9a-z.-]+\.[a-z.]{2,6}$/i,
        'url': /[a-z][-\.+a-z]*:\/\//i
    };

    function FieldValidator(inputEl, currentOptions) {
        this.inputElement = inputEl;
        this.currentOptions = currentOptions;
        this.visualFeedbackElement = null;

        if (!this.inputElement.validity) {
            this.inputElement.validity = {
                customError: false, patternMismatch: false, rangeOverflow: false,
                rangeUnderflow: false, stepMismatch: false, tooLong: false,
                typeMismatch: false, valid: true, valueMissing: false
            };
        }
        if (!this.inputElement.validationMessage) {
            this.inputElement.validationMessage = '';
        }

        this.inputElement.fieldAgent = this;

        if (this.inputElement.hasAttribute('required')) {
            this.inputElement.classList.add(this.currentOptions.styleMarkers.required);
        }

        if (!nativeFeatureSet.methodAvailability.customFeedback) {
            this.inputElement.setCustomValidity = this.assignCustomFeedback.bind(this);
        }
        if (!nativeFeatureSet.methodAvailability.selfCheck) {
            this.inputElement.checkValidity = this.assessValidityStatus.bind(this);
        }

        if (!nativeFeatureSet.methodAvailability.statusObject) {
            this.setupCustomValidationChain();
        }

        if (!nativeFeatureSet.methodAvailability.statusObject || this.currentOptions.issueHandling.forceDisplay) {
            this.attachErrorDisplay();
        }
    }

    FieldValidator.prototype.setupCustomValidationChain = function() {
        this.inputElement.addEventListener('input', this.evaluateFieldStatus.bind(this));
        this.inputElement.addEventListener('change', this.evaluateFieldStatus.bind(this));
        this.evaluateFieldStatus();
    };

    FieldValidator.prototype.assignCustomFeedback = function(msg) {
        this.inputElement.validity.customError = !!msg;
        this.inputElement.validationMessage = msg || '';
        if (!nativeFeatureSet.methodAvailability.statusObject) {
             this.evaluateFieldStatus();
        } else {
             // If native validity object is present, we only update customError and trigger validity check
             this.inputElement.validity.valid = !this.inputElement.validity.customError;
             this.updateClassesBasedOnValidity();
             this.assessValidityStatus();
        }
    };

    FieldValidator.prototype.assessValidityStatus = function() {
        var overallStatus = this.inputElement.validity.valid;
        var customEvent = new Event(overallStatus ? 'field-valid' : 'field-invalid');
        this.inputElement.dispatchEvent(customEvent);
        return overallStatus;
    };

    FieldValidator.prototype.evaluateFieldStatus = function() {
        var value = this.inputElement.value;
        var inputType = this.inputElement.getAttribute('type');

        var initialCustomError = this.inputElement.validity.customError;
        this.inputElement.validity = {
            customError: initialCustomError,
            patternMismatch: false, rangeOverflow: false, rangeUnderflow: false,
            stepMismatch: false, tooLong: false, typeMismatch: false,
            valid: true, valueMissing: false
        };
        this.inputElement.validationMessage = '';

        var currentFeedback = null;

        var setFirstError = function(statusKey, messageKey) {
            if (!currentFeedback) {
                currentFeedback = this.currentOptions.feedbackPrompts[messageKey];
            }
            this.inputElement.validity[statusKey] = true;
        }.bind(this);

        if (this.inputElement.validity.customError) {
             currentFeedback = this.inputElement.validationMessage;
        }

        if (this.inputElement.hasAttribute('required') && value === "") {
            setFirstError('valueMissing', 'required');
        }

        if (value !== "") {
            if (inputType === 'email' && !regexRepository.email.test(value)) {
                setFirstError('typeMismatch', 'email');
            } else if (inputType === 'url' && !regexRepository.url.test(value)) {
                setFirstError('typeMismatch', 'url');
            } else if (inputType === 'number' && isNaN(value)) {
                setFirstError('typeMismatch', 'numeric');
            }
        }

        if (this.inputElement.hasAttribute('pattern') && value !== "") {
            try {
                var fieldPattern = new RegExp(this.inputElement.getAttribute('pattern'));
                if (!fieldPattern.test(value)) {
                    setFirstError('patternMismatch', 'pattern');
                }
            } catch (e) {
                setFirstError('patternMismatch', 'pattern');
            }
        }

        this.inputElement.validity.valid = !(
            this.inputElement.validity.customError ||
            this.inputElement.validity.valueMissing ||
            this.inputElement.validity.tooLong ||
            this.inputElement.validity.typeMismatch ||
            this.inputElement.validity.patternMismatch ||
            this.inputElement.validity.rangeOverflow ||
            this.inputElement.validity.rangeUnderflow ||
            this.inputElement.validity.stepMismatch
        );

        this.inputElement.validationMessage = currentFeedback || '';
        this.updateClassesBasedOnValidity();
        this.assessValidityStatus();
    };
    
    FieldValidator.prototype.updateClassesBasedOnValidity = function() {
        this.inputElement.classList.remove(this.currentOptions.styleMarkers.valid, this.currentOptions.styleMarkers.invalid);
        if (this.inputElement.validity.valid) {
            this.inputElement.classList.add(this.currentOptions.styleMarkers.valid);
        } else {
            this.inputElement.classList.add(this.currentOptions.styleMarkers.invalid);
        }
    };

    FieldValidator.prototype.attachErrorDisplay = function() {
        this.visualFeedbackElement = this.currentOptions.issueHandling.createVisualFeedback(this.inputElement);

        if (!nativeFeatureSet.methodAvailability.statusObject) {
            this.inputElement.addEventListener('field-invalid', this.handleInvalidFeedback.bind(this));
            this.inputElement.addEventListener('field-valid', this.handleValidFeedback.bind(this));
        } else {
            this.inputElement.addEventListener('invalid', this.handleNativeInvalidFeedback.bind(this));
            this.inputElement.addEventListener('input', this.updateFeedbackOnNativeValidityChange.bind(this));
            this.inputElement.addEventListener('change', this.updateFeedbackOnNativeValidityChange.bind(this));
        }
        
        this.inputElement.addEventListener('focus', this.showFeedback.bind(this));
        this.inputElement.addEventListener('blur', this.hideFeedback.bind(this));
    };

    FieldValidator.prototype.handleInvalidFeedback = function(event) {
        if (this.visualFeedbackElement) {
            this.visualFeedbackElement.textContent = this.inputElement.validationMessage;
            this.showFeedback();
            this.inputElement.focus();
        }
    };

    FieldValidator.prototype.handleValidFeedback = function(event) {
        if (this.visualFeedbackElement) {
            this.visualFeedbackElement.textContent = '';
            this.hideFeedback();
        }
    };

    FieldValidator.prototype.handleNativeInvalidFeedback = function(event) {
        if (this.visualFeedbackElement) {
            this.visualFeedbackElement.textContent = this.inputElement.validationMessage;
            this.showFeedback();
            event.preventDefault();
            this.inputElement.focus();
        }
    };

    FieldValidator.prototype.updateFeedbackOnNativeValidityChange = function() {
        if (this.inputElement.checkValidity()) {
            this.handleValidFeedback();
        } else {
            if (this.visualFeedbackElement && this.inputElement.validationMessage === '') {
                 this.handleValidFeedback();
            }
        }
    };

    FieldValidator.prototype.showFeedback = function() {
        if (this.visualFeedbackElement) {
            this.visualFeedbackElement.style.display = '';
        }
    };

    FieldValidator.prototype.hideFeedback = function() {
        if (this.visualFeedbackElement) {
            this.visualFeedbackElement.style.display = 'none';
        }
    };

    var customFormEnhancer = function(selectorOrElement, userOptions) {
        var targetElements = [];
        if (typeof selectorOrElement === 'string') {
            targetElements = queryAll(selectorOrElement);
        } else if (selectorOrElement instanceof HTMLElement) {
            targetElements = [selectorOrElement];
        } else if (Array.isArray(selectorOrElement) || (typeof NodeList !== 'undefined' && selectorOrElement instanceof NodeList)) {
            targetElements = Array.prototype.slice.call(selectorOrElement);
        } else {
            return selectorOrElement;
        }

        targetElements.filter(function(el) {
            return el.tagName.toLowerCase() === 'form';
        }).forEach(function(formEl) {
            var options = deepMerge({}, defaultConfiguration);
            deepMerge(options, userOptions);

            var formInputs = queryAll('input:not([type="submit"]):not([type="reset"]):not([type="button"]), select, textarea', formEl);

            formInputs.forEach(function(inputEl) {
                new FieldValidator(inputEl, options);
            });

            if (!nativeFeatureSet.methodAvailability.selfCheck || options.issueHandling.forceDisplay) {
                formEl.checkValidity = function() {
                    var allInputsValid = true;
                    var firstInvalidElement = null;

                    formInputs.forEach(function(inputEl) {
                        if (inputEl.fieldAgent) {
                            if (!inputEl.fieldAgent.assessValidityStatus()) {
                                allInputsValid = false;
                                if (!firstInvalidElement) {
                                    firstInvalidElement = inputEl;
                                }
                            }
                        } else if (inputEl.checkValidity && !inputEl.checkValidity()) {
                             allInputsValid = false;
                             if (!firstInvalidElement) {
                                 firstInvalidElement = inputEl;
                             }
                        }
                    });

                    if (!allInputsValid && firstInvalidElement) {
                        firstInvalidElement.focus();
                        if (typeof firstInvalidElement.select === 'function') {
                            firstInvalidElement.select();
                        }
                    }
                    return allInputsValid;
                };
            }

            formEl.addEventListener('submit', function(event) {
                if (!formEl.checkValidity()) {
                    event.preventDefault();
                }
            });
        });
        return selectorOrElement;
    };

    return customFormEnhancer;
})();

window.FormGuardian = FormGuardian;