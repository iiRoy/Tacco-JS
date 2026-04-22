(function() {
    const elementModificationRecords = new WeakMap();
    const registeredForms = new WeakSet();

    function activateInputPlaceholders(customSettings) {
        const functionalConfig = {
            hintStyleClass: 'placeholder',
            hintAttribute: 'placeholder',
            ...customSettings
        };

        const temporaryElement = document.createElement('input');
        if (functionalConfig.hintAttribute === 'placeholder' && temporaryElement.placeholder !== undefined) {
            return;
        }

        const elementsWithHints = document.querySelectorAll(`[${functionalConfig.hintAttribute}]`);

        elementsWithHints.forEach(targetElement => {
            const elementHintContent = targetElement.getAttribute(functionalConfig.hintAttribute);
            const containingForm = targetElement.closest('form');

            const inputFocusHandler = function() {
                const isUserModified = elementModificationRecords.get(targetElement);
                if (targetElement.value === elementHintContent && !isUserModified) {
                    targetElement.classList.remove(functionalConfig.hintStyleClass);
                    targetElement.value = '';
                }
            };

            const inputBlurHandler = function() {
                if (targetElement.value === '') {
                    elementModificationRecords.set(targetElement, false);
                    targetElement.value = elementHintContent;
                    targetElement.classList.add(functionalConfig.hintStyleClass);
                } else {
                    elementModificationRecords.set(targetElement, true);
                }
            };

            const inputKeyupHandler = function(keyEvent) {
                if (keyEvent.keyCode === 13) {
                    if (targetElement.value === '') {
                        elementModificationRecords.set(targetElement, false);
                        targetElement.value = elementHintContent;
                        targetElement.classList.add(functionalConfig.hintStyleClass);
                    } else {
                        elementModificationRecords.set(targetElement, true);
                    }
                }
            };

            targetElement.addEventListener('focus', inputFocusHandler);
            targetElement.addEventListener('blur', inputBlurHandler);
            targetElement.addEventListener('keyup', inputKeyupHandler);

            targetElement.dispatchEvent(new Event('blur'));

            if (containingForm && !registeredForms.has(containingForm)) {
                registeredForms.add(containingForm);

                const formSubmissionHandler = function() {
                    const formInputsWithHints = containingForm.querySelectorAll(`[${functionalConfig.hintAttribute}]`);
                    formInputsWithHints.forEach(formInput => {
                        const isFormInputModified = elementModificationRecords.get(formInput);
                        if (!isFormInputModified) {
                            formInput.value = '';
                        }
                    });
                };
                containingForm.addEventListener('submit', formSubmissionHandler);
            }
        });
    }

    window.initInputHintEmulation = activateInputPlaceholders;
})();