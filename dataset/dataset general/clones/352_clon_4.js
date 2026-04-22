const FormAlteringObserver = (() => {

    const _configuration = {
        traceActivity: false,
        alteredFieldStyleClass: 'field-altered-markup',
        trackedFormStyleClass: 'form-monitored-state',
        includeHiddenInputs: false,
        elementObservationEvent: 'blur', // Original used 'blur'
        logSourceIdentifier: 'FormAlteringObserver',
        additionalClassTargets: null, // Function: element => [other elements to add class to]
        modalPrompt: {
            heading: "Warning: Unsaved Modifications!",
            heightPx: 300,
            widthPx: 500,
            isModal: true,
            canResize: false,
            autoResizeContent: false,
            overlayStyle: { backgroundColor: "rgba(0, 0, 0, 0.5)" }
        },
        promptMessage: '<br/><p>You have modified form data without saving. All of your modifications will be lost.</p><p>Are you certain you wish to proceed?</p>'
    };

    const _elementStateRegistry = new WeakMap(); // Key: HTMLElement, Value: { initialContent: any, isContentAltered: boolean, formConfig: Object }
    const _formInputRegistry = new WeakMap();    // Key: HTMLFormElement, Value: Set<HTMLElement> of inputs
    const _activeFormElements = new Set();       // Stores all HTMLFormElements currently being actively tracked

    function _recordActivity(message) {
        if (_configuration.traceActivity) {
            const fullMessage = `${_configuration.logSourceIdentifier}: ${message}`;
            if (window.console && typeof window.console.log === 'function') {
                console.log(fullMessage);
            } else {
                alert(fullMessage);
            }
        }
    }

    function _extractElementValue(element) {
        const type = element.type;
        if (type === 'radio' || type === 'checkbox') {
            return element.checked;
        }
        return element.value;
    }

    function _setElementValue(element, value) {
        const type = element.type;
        if (type === 'radio' || type === 'checkbox') {
            element.checked = value;
        } else {
            element.value = value;
        }
    }

    function _applyClassModification(element, className, add) {
        if (add) {
            element.classList.add(className);
        } else {
            element.classList.remove(className);
        }
    }

    function _revertElementToInitial(element) {
        if (_elementStateRegistry.has(element)) {
            const state = _elementStateRegistry.get(element);
            _setElementValue(element, state.initialContent);
            _applyClassModification(element, state.formConfig.alteredFieldStyleClass, false);

            if (typeof state.formConfig.additionalClassTargets === 'function') {
                const extraTargets = state.formConfig.additionalClassTargets.call(element);
                if (Array.isArray(extraTargets)) {
                    extraTargets.forEach(el => _applyClassModification(el, state.formConfig.alteredFieldStyleClass, false));
                }
            }
            state.isContentAltered = false;
        }
    }

    function _constructModalPrompt(title, messageHtml, buttons) {
        const modalContainer = document.createElement('div');
        modalContainer.className = 'modal-overlay-custom';
        modalContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: ${_configuration.modalPrompt.overlayStyle.backgroundColor};
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

        const dialogBox = document.createElement('div');
        dialogBox.className = 'modal-dialog-custom';
        dialogBox.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            max-width: ${_configuration.modalPrompt.widthPx}px;
            max-height: ${_configuration.modalPrompt.heightPx}px;
            overflow-y: auto;
            position: relative;
        `;
        if (!_configuration.modalPrompt.canResize) {
             dialogBox.style.resize = 'none';
        }

        const dialogTitle = document.createElement('h3');
        dialogTitle.textContent = title;
        dialogBox.appendChild(dialogTitle);

        const dialogContent = document.createElement('div');
        dialogContent.innerHTML = messageHtml;
        dialogBox.appendChild(dialogContent);

        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            margin-top: 20px;
            text-align: right;
        `;
        buttons.forEach(btn => {
            const buttonElement = document.createElement('button');
            buttonElement.textContent = btn.label;
            buttonElement.style.cssText = `
                margin-left: 10px;
                padding: 8px 15px;
                border: 1px solid #ccc;
                border-radius: 4px;
                cursor: pointer;
            `;
            buttonElement.addEventListener('click', () => {
                btn.action();
                modalContainer.remove();
            });
            buttonContainer.appendChild(buttonElement);
        });
        dialogBox.appendChild(buttonContainer);

        modalContainer.appendChild(dialogBox);
        document.body.appendChild(modalContainer);

        return modalContainer;
    }

    function _isFormCurrentlyAltered(formElement) {
        if (!_formInputRegistry.has(formElement)) {
            return false;
        }
        const inputs = _formInputRegistry.get(formElement);
        for (const input of inputs) {
            if (_elementStateRegistry.has(input) && _elementStateRegistry.get(input).isContentAltered) {
                return true;
            }
        }
        return false;
    }

    function _processFieldModification(event) {
        const inputElement = event.target;
        if (!inputElement || !_elementStateRegistry.has(inputElement)) {
            return;
        }

        const formElement = inputElement.form;
        if (!formElement || !_activeFormElements.has(formElement)) {
            return;
        }

        const currentFieldState = _elementStateRegistry.get(inputElement);
        const formConfig = currentFieldState.formConfig;

        const initialContent = currentFieldState.initialContent;
        const currentContent = _extractElementValue(inputElement);
        const wasFormAlteredBefore = _isFormCurrentlyAltered(formElement);

        if (initialContent !== currentContent) {
            if (!currentFieldState.isContentAltered) {
                _recordActivity(`Field "${inputElement.name || inputElement.id}" in form "${formElement.id || formElement.name}" altered from "${initialContent}" to "${currentContent}".`);
                _applyClassModification(inputElement, formConfig.alteredFieldStyleClass, true);
                if (typeof formConfig.additionalClassTargets === 'function') {
                    const extraTargets = formConfig.additionalClassTargets.call(inputElement);
                    if (Array.isArray(extraTargets)) {
                        extraTargets.forEach(el => _applyClassModification(el, formConfig.alteredFieldStyleClass, true));
                    }
                }
                currentFieldState.isContentAltered = true;
            }
        } else {
            if (currentFieldState.isContentAltered) {
                _recordActivity(`Field "${inputElement.name || inputElement.id}" in form "${formElement.id || formElement.name}" restored to initial state.`);
                _applyClassModification(inputElement, formConfig.alteredFieldStyleClass, false);
                if (typeof formConfig.additionalClassTargets === 'function') {
                    const extraTargets = formConfig.additionalClassTargets.call(inputElement);
                    if (Array.isArray(extraTargets)) {
                        extraTargets.forEach(el => _applyClassModification(el, formConfig.alteredFieldStyleClass, false));
                    }
                }
                currentFieldState.isContentAltered = false;
            }
        }

        const isFormAlteredNow = _isFormCurrentlyAltered(formElement);

        if (isFormAlteredNow && !wasFormAlteredBefore) {
            _recordActivity(`Form "${formElement.id || formElement.name}" is now altered.`);
            formElement.dispatchEvent(new CustomEvent('formModified', {
                bubbles: true,
                detail: {
                    targetElement: inputElement,
                    previousValue: initialContent,
                    currentValue: currentContent
                }
            }));
        } else if (!isFormAlteredNow && wasFormAlteredBefore) {
            _recordActivity(`Form "${formElement.id || formElement.name}" is now clean.`);
            formElement.dispatchEvent(new CustomEvent('formCleaned', {
                bubbles: true,
                detail: {
                    targetElement: inputElement
                }
            }));
        }
    }

    return {
        configure(options = {}) {
            Object.assign(_configuration, options);
            if (options.modalPrompt) {
                Object.assign(_configuration.modalPrompt, options.modalPrompt);
            }
        },

        activateFormTracking(targetForm, options = {}) {
            if (!(targetForm instanceof HTMLFormElement)) {
                _recordActivity("Error: Provided element is not an HTMLFormElement.");
                return;
            }

            const currentConfig = { ..._configuration, ...options };

            if (_activeFormElements.has(targetForm)) {
                _recordActivity(`Re-activating tracking for form "${targetForm.id || targetForm.name}".`);
                targetForm.removeEventListener(currentConfig.elementObservationEvent, _processFieldModification, true);
                _formInputRegistry.get(targetForm).forEach(input => {
                    _applyClassModification(input, currentConfig.alteredFieldStyleClass, false);
                    _elementStateRegistry.delete(input);
                });
                _formInputRegistry.delete(targetForm);
            } else {
                _recordActivity(`Activating tracking for form "${targetForm.id || targetForm.name}".`);
                targetForm.classList.add(currentConfig.trackedFormStyleClass);
                _activeFormElements.add(targetForm);
            }

            const inputsToMonitor = new Set();
            const allInputs = targetForm.querySelectorAll('input, select, textarea');

            const excludeInputTypes = ['submit', 'button', 'reset', 'password'];
            if (!currentConfig.includeHiddenInputs) {
                excludeInputTypes.push('hidden');
            }

            for (const input of allInputs) {
                if (input.name && !input.readOnly && !input.disabled && !excludeInputTypes.includes(input.type)) {
                    _elementStateRegistry.set(input, {
                        initialContent: _extractElementValue(input),
                        isContentAltered: false,
                        formConfig: currentConfig // Store config with element for _processFieldModification
                    });
                    inputsToMonitor.add(input);
                }
            }
            _formInputRegistry.set(targetForm, inputsToMonitor);

            targetForm.addEventListener(currentConfig.elementObservationEvent, _processFieldModification, true);

            _recordActivity(`Initial state stored for ${inputsToMonitor.size} inputs in form "${targetForm.id || targetForm.name}".`);
        },

        resetFormFields(targetForm) {
            if (!_activeFormElements.has(targetForm)) {
                _recordActivity(`Form "${targetForm.id || targetForm.name}" is not actively tracked, cannot reset.`);
                return;
            }

            _recordActivity(`Resetting fields for form "${targetForm.id || targetForm.name}".`);
            const inputs = _formInputRegistry.get(targetForm);
            if (inputs) {
                inputs.forEach(input => _revertElementToInitial(input));
            }

            if (_isFormCurrentlyAltered(targetForm)) {
                 targetForm.dispatchEvent(new CustomEvent('formModified', { bubbles: true }));
            } else {
                 targetForm.dispatchEvent(new CustomEvent('formCleaned', { bubbles: true }));
            }
        },

        isAnyTrackedFormAltered() {
            for (const form of _activeFormElements) {
                if (_isFormCurrentlyAltered(form)) {
                    return true;
                }
            }
            return false;
        },

        interceptNavigation(navigationElement, options = {}) {
            const currentConfig = { ..._configuration, ...options };
            const dialogConfig = { ..._configuration.modalPrompt, ...options.modalPrompt };

            const clickHandler = (event) => {
                if (this.isAnyTrackedFormAltered()) {
                    event.preventDefault();
                    _recordActivity(`Navigation intercepted by "${navigationElement.id || navigationElement.textContent}". Displaying prompt.`);

                    const proceedAction = () => {
                        const parentTablist = navigationElement.closest('[role="tablist"]');
                        if (parentTablist) {
                            const targetHref = navigationElement.getAttribute('href');
                            if (targetHref && targetHref.startsWith('#')) {
                                const activeTabContentId = parentTablist.querySelector('[role="tab"][aria-selected="true"]')?.getAttribute('aria-controls');
                                if (activeTabContentId) {
                                    const activeTabContent = document.getElementById(activeTabContentId);
                                    if (activeTabContent) {
                                        const formsInActiveTab = activeTabContent.querySelectorAll('form');
                                        formsInActiveTab.forEach(form => FormAlteringObserver.resetFormFields(form));
                                    }
                                }
                            }
                            // Dispatch a custom event for external tab systems to listen to
                            navigationElement.dispatchEvent(new CustomEvent('proceedNavigation', {bubbles: true, detail: {originalHref: navigationElement.href}}));
                        } else if (navigationElement.tagName === 'A' && navigationElement.href) {
                            window.location.href = navigationElement.href;
                        } else {
                            _recordActivity("Warning: Navigation element is not an anchor tag with href, cannot proceed automatically.");
                        }
                    };

                    const cancelAction = () => {
                        _recordActivity("Navigation cancelled by user.");
                    };

                    _constructModalPrompt(
                        dialogConfig.heading,
                        currentConfig.promptMessage,
                        [
                            { label: "Proceed", action: proceedAction },
                            { label: "Cancel", action: cancelAction }
                        ]
                    );
                }
            };
            navigationElement.addEventListener('click', clickHandler);
            _recordActivity(`Navigation interceptor set for "${navigationElement.id || navigationElement.textContent || 'unnamed element'}".`);
        },

        testFormStatusChecker(element) {
            _recordActivity("Setting up form status checker.");
            element.addEventListener('click', () => {
                if (this.isAnyTrackedFormAltered()) {
                    alert("One or more forms are altered!");
                } else {
                    alert("All tracked forms are clean!");
                }
            });
        },

        onFormModified(formElement, handler) {
            if (formElement instanceof HTMLFormElement) {
                formElement.addEventListener('formModified', handler);
            }
        },

        onFormCleaned(formElement, handler) {
            if (formElement instanceof HTMLFormElement) {
                formElement.addEventListener('formCleaned', handler);
            }
        }
    };
})();

window.FormAlteringObserver = FormAlteringObserver;