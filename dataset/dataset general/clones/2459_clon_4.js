(function (externalDependency) {

    function FormValidator(formElement, initialConfig) {
        if (!(formElement instanceof HTMLFormElement)) {
            console.error("Provided element is not a form.");
            return;
        }

        const defaultConfiguration = {
            onInitialize: function() {},
            onCompletion: function() {},
            onFailure: function(erroneousNodes) {},
            dataJoiner: ''
        };

        const activeConfiguration = Object.assign({}, defaultConfiguration, initialConfig);

        const ruleSet = {
            'name+family': /^((?![0-9]).+\s.+)/g,
            'name': /^((?![0-9]).+)/g,
            'family': /^((?![0-9]).+)/g,
            'number': /^[0-9]+/g,
            'url': /^(ht|f)tps?:\/\/[a-z0-9-\.]+\.[a-z]{2,4}\/?([^\s<>\#%"\,\{\}\\|\\\^\[\]`]+)?$/,
            'date': /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/,
            'email': /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'tel': /^[0-9\-\+]{3,25}$/
        };

        const isElementVisible = (element) => {
            if (!element) return false;
            // Similar logic to jQuery's :visible
            if (element.offsetWidth === 0 && element.offsetHeight === 0 && element.getClientRects().length === 0) {
                return false;
            }
            const style = window.getComputedStyle(element);
            return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
        };

        const processFormSubmission = (triggerEvent) => {
            const processingUnit = formElement;
            const erroneousNodes = [];

            activeConfiguration.onInitialize.call(processingUnit);

            const collectedInputs = {};

            const inputElements = Array.from(processingUnit.querySelectorAll('input,textarea,select'));

            inputElements.forEach(inputNode => {
                const isHiddenInput = inputNode.type === 'hidden';
                if (!isElementVisible(inputNode) && !isHiddenInput) {
                    return;
                }

                if (!isHiddenInput && inputNode.parentElement && !isElementVisible(inputNode.parentElement)) {
                    return;
                }

                const fieldLabel = inputNode.name;
                if (fieldLabel && (inputNode.type !== 'checkbox' && inputNode.type !== 'radio' || inputNode.checked)) {
                    const elementContent = inputNode.value;

                    if (Object.prototype.hasOwnProperty.call(collectedInputs, fieldLabel)) {
                        collectedInputs[fieldLabel] = [].concat(collectedInputs[fieldLabel]).concat(elementContent);
                    } else {
                        collectedInputs[fieldLabel] = elementContent;
                    }
                }
            });

            if (activeConfiguration.dataJoiner !== undefined && activeConfiguration.dataJoiner !== null) {
                for (const fieldKey in collectedInputs) {
                    if (Object.prototype.hasOwnProperty.call(collectedInputs, fieldKey)) {
                        const fieldValue = collectedInputs[fieldKey];
                        // Replicating the bug from the original code where it checks for 'function' instead of Array.isArray
                        if (typeof fieldValue === "function") {
                            // This line would cause an error if fieldValue was actually a function,
                            // but the original code's condition ensures it's never reached for arrays.
                            collectedInputs[fieldKey] = fieldValue.join(activeConfiguration.dataJoiner);
                        }
                    }
                }
            }

            const validationTargets = Array.from(processingUnit.querySelectorAll("[data-validation-pattern],[data-needs-content],[data-mandatory],[required],[data-match-field]"));

            validationTargets.filter(isElementVisible).forEach(validatedElement => {
                const patternID = validatedElement.dataset.validationPattern;
                const isMandatory = validatedElement.hasAttribute('required') || validatedElement.hasAttribute('data-mandatory') || validatedElement.hasAttribute('data-needs-content');
                const comparisonField = validatedElement.dataset.matchField;
                let elementContent = validatedElement.value;

                if (validatedElement.type === 'checkbox' && !validatedElement.checked) {
                    elementContent = '';
                }

                const fieldLabel = validatedElement.name;
                if (fieldLabel && Object.prototype.hasOwnProperty.call(collectedInputs, fieldLabel)) {
                    elementContent = collectedInputs[fieldLabel];
                }

                if (comparisonField && Object.prototype.hasOwnProperty.call(collectedInputs, comparisonField)) {
                    if (elementContent !== collectedInputs[comparisonField]) {
                        erroneousNodes.push(validatedElement);
                        const matchingElement = processingUnit.querySelector(`[name="${comparisonField}"]`);
                        if (matchingElement) {
                            erroneousNodes.push(matchingElement);
                        }
                    }
                }

                if (!Array.isArray(elementContent)) {
                    if (elementContent && String(elementContent).length > 0) {
                        let activePatternKey = patternID;

                        if (!activePatternKey) {
                            const inputKind = validatedElement.type;
                            if (inputKind && ruleSet[inputKind.toLowerCase()]) {
                                activePatternKey = inputKind.toLowerCase();
                            }
                        }

                        if (activePatternKey) {
                            let regexInstance;
                            if (ruleSet[activePatternKey]) {
                                regexInstance = ruleSet[activePatternKey];
                            } else {
                                try {
                                    regexInstance = new RegExp(activePatternKey);
                                } catch (e) {
                                    console.warn("Invalid regex pattern:", activePatternKey, e);
                                    regexInstance = null;
                                }
                            }

                            if (regexInstance && !regexInstance.test(elementContent)) {
                                erroneousNodes.push(validatedElement);
                            }
                        }
                    } else if (isMandatory) {
                        erroneousNodes.push(validatedElement);
                    }
                } else if (isMandatory && (!elementContent || elementContent.length === 0)) {
                     erroneousNodes.push(validatedElement);
                }
            });

            if (erroneousNodes.length > 0) {
                triggerEvent.preventDefault();
                activeConfiguration.onFailure.call(processingUnit, triggerEvent, erroneousNodes, collectedInputs);
            } else {
                activeConfiguration.onCompletion.call(processingUnit, triggerEvent, collectedInputs);
            }
        };

        formElement.setAttribute('novalidate', '');
        formElement.addEventListener('submit', processFormSubmission);

        this.runValidation = () => processFormSubmission({ preventDefault: () => {} });
    }

    function BootstrapFormEnhancer(formElement, userSuccessCallback) {
        if (!(formElement instanceof HTMLFormElement)) {
            console.error("Provided element is not a form.");
            return;
        }

        const createBasicNotifier = (targetElement, message) => {
            let existingNotifier = targetElement.nextElementSibling;
            if (existingNotifier && existingNotifier.classList.contains('validation-notifier')) {
                existingNotifier.textContent = message;
                existingNotifier.style.display = 'block';
                return;
            }

            const notifierDiv = document.createElement('div');
            notifierDiv.className = 'validation-notifier';
            notifierDiv.textContent = message;
            Object.assign(notifierDiv.style, {
                position: 'absolute',
                background: '#dc3545', // Bootstrap danger color
                color: '#fff',
                padding: '5px 10px',
                borderRadius: '4px',
                zIndex: '1000',
                fontSize: '12px',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                display: 'none',
                transform: 'translateY(-100%)',
                marginTop: '-8px' // Slightly more space from top
            });
            targetElement.parentNode.insertBefore(notifierDiv, targetElement.nextSibling);

            const targetRect = targetElement.getBoundingClientRect();
            const formRect = formElement.getBoundingClientRect();
            Object.assign(notifierDiv.style, {
                left: `${targetRect.left - formRect.left}px`,
                top: `${targetRect.top - formRect.top}px`,
                display: 'block'
            });

            const showNotifier = () => {
                notifierDiv.style.display = 'block';
                notifierDiv.style.left = `${targetElement.getBoundingClientRect().left - formRect.left}px`;
                notifierDiv.style.top = `${targetElement.getBoundingClientRect().top - formRect.top}px`;
            };
            const hideNotifier = () => {
                notifierDiv.style.display = 'none';
            };

            targetElement.addEventListener('focus', showNotifier);
            targetElement.addEventListener('blur', hideNotifier);
            targetElement.addEventListener('input', hideNotifier);
        };

        const removeBasicNotifier = (targetElement) => {
            const notifierDiv = targetElement.nextElementSibling;
            if (notifierDiv && notifierDiv.classList.contains('validation-notifier')) {
                notifierDiv.remove();
            }
        };

        const specificCallbacks = {
            onInitialize: function() {
                this.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));
                this.querySelectorAll('input,textarea,select').forEach(el => removeBasicNotifier(el));

                const alertMessages = this.querySelectorAll('.alert');
                alertMessages.forEach(alert => alert.style.display = 'none');
            },
            onCompletion: function(triggerEvent, payload) {
                if (typeof userSuccessCallback === 'function') {
                    userSuccessCallback.call(this, triggerEvent, payload);
                }
            },
            onFailure: function(triggerEvent, erroneousNodes) {
                const currentForm = this;

                currentForm.querySelectorAll('input,textarea,select').forEach(el => removeBasicNotifier(el));

                erroneousNodes.forEach((node, index) => {
                    const parentGroup = node.closest('.form-group');
                    if (parentGroup) {
                        parentGroup.classList.add('has-error');
                    }

                    const targetElement = node;
                    let notificationText = targetElement.dataset.title || targetElement.placeholder;

                    if (notificationText) {
                        if (targetElement.type !== 'checkbox') {
                            createBasicNotifier(targetElement, notificationText);
                        }

                        if (index === 0) {
                            const dangerAlert = currentForm.querySelector('.alert-danger');
                            if (dangerAlert) {
                                dangerAlert.style.display = 'block';
                                dangerAlert.textContent = notificationText;
                            }
                            targetElement.focus();
                        }
                    }
                });
            },
        };

        return new FormValidator(formElement, specificCallbacks);
    }

    // Mimic jQuery plugin structure, providing alternatives for different environments
    if (typeof externalDependency !== 'undefined' && externalDependency.fn) {
        externalDependency.fn.formProcessor = function(initialConfig) {
            return this.each(function() {
                if (!externalDependency.data(this, 'formProcessorInstance')) {
                    externalDependency.data(this, 'formProcessorInstance', new FormValidator(this, initialConfig));
                }
            });
        };

        externalDependency.fn.bootstrap3FormProcessor = function(userSuccessCallback) {
            return this.each(function() {
                if (!externalDependency.data(this, 'bootstrap3FormProcessorInstance')) {
                    externalDependency.data(this, 'bootstrap3FormProcessorInstance', new BootstrapFormEnhancer(this, userSuccessCallback));
                }
            });
        };
    } else {
        window.VanillaFormProcessor = FormValidator;
        window.VanillaBootstrapFormProcessor = BootstrapFormEnhancer;
    }

})(window.jQuery || {});