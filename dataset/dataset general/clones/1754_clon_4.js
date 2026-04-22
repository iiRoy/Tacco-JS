(function() {
    window.inputFieldEnricher = function(targetSelector, processSettings) {
        const configuration = {
            dataElementKey: "placeholderData",
            attributeToExtract: "placeholder",
            visualClassIndicator: "active-input-text",
            predefinedValuesList: [],
            preventSubmissionCondition: false,
            clearContentOnSubmission: false,
            customFormSubmitCallback: null,
            emptyStateValue: "",
            initialCaretPosition: 0,
            processedMarker: "enhancedInput"
        };
        Object.assign(configuration, processSettings);

        const targetElements = document.querySelectorAll(targetSelector);
        const processedForms = new Set();

        targetElements.forEach((currentElement, elementIndex) => {
            if (!(currentElement instanceof HTMLInputElement || currentElement instanceof HTMLTextAreaElement)) {
                return;
            }

            const actualPlaceholderText = configuration.predefinedValuesList[elementIndex] || currentElement.getAttribute(configuration.attributeToExtract);
            if (!actualPlaceholderText) {
                return;
            }

            currentElement.dataset[configuration.dataElementKey] = actualPlaceholderText;
            currentElement.dataset[configuration.processedMarker] = "true";

            if (currentElement.value.trim() === "") {
                currentElement.classList.add(configuration.visualClassIndicator);
                currentElement.value = currentElement.dataset[configuration.dataElementKey];
            }

            currentElement.addEventListener('focus', function() {
                if (this.value.trim() === this.dataset[configuration.dataElementKey]) {
                    this.classList.remove(configuration.visualClassIndicator);
                    this.value = configuration.emptyStateValue;
                    if (typeof this.setSelectionRange === 'function') {
                        this.setSelectionRange(configuration.initialCaretPosition, configuration.initialCaretPosition);
                    }
                }
            });

            currentElement.addEventListener('blur', function() {
                if (this.value.trim() === configuration.emptyStateValue) {
                    this.classList.add(configuration.visualClassIndicator);
                    this.value = this.dataset[configuration.dataElementKey];
                }
            });

            const containingForm = currentElement.form;
            if (containingForm && !processedForms.has(containingForm)) {
                containingForm.addEventListener('submit', function(eventObject) {
                    let formManagedInputs = this.querySelectorAll(`[data-${configuration.dataElementKey}][data-${configuration.processedMarker}="true"]`);
                    let preventCurrentSubmission = false;

                    formManagedInputs.forEach(inputField => {
                        const storedTextValue = inputField.dataset[configuration.dataElementKey];
                        const currentFieldValue = inputField.value.trim();

                        if (configuration.preventSubmissionCondition && currentFieldValue === storedTextValue) {
                            preventCurrentSubmission = true;
                        }
                        if (configuration.clearContentOnSubmission && currentFieldValue === storedTextValue) {
                            inputField.classList.remove(configuration.visualClassIndicator);
                            inputField.value = "";
                        }
                    });

                    if (preventCurrentSubmission) {
                        eventObject.preventDefault();
                        return false;
                    }

                    if (typeof configuration.customFormSubmitCallback === 'function') {
                        return configuration.customFormSubmitCallback.call(this, eventObject);
                    }

                    return true;
                });
                processedForms.add(containingForm);
            }
        });
    };
})();