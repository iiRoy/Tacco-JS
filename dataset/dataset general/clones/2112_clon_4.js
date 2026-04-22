const dataVault = Object.freeze({
    storeSegment: (keyIdentifier, contentPayload) => {
        try {
            localStorage.setItem(keyIdentifier, JSON.stringify(contentPayload));
        } catch (error) {
            console.error("Failed to store data segment:", error);
        }
    },
    retrieveSegment: (keyIdentifier) => {
        try {
            const rawData = localStorage.getItem(keyIdentifier);
            return rawData ? JSON.parse(rawData) : null;
        } catch (error) {
            console.error("Failed to retrieve or parse data segment:", error);
            return null;
        }
    },
    removeSegment: (keyIdentifier) => {
        try {
            localStorage.removeItem(keyIdentifier);
        } catch (error) {
            console.error("Failed to remove data segment:", error);
        }
    }
});

const activeFormManagers = new WeakMap();

function establishFormPersistence(targetFormElement, customConfiguration = {}) {
    if (!(targetFormElement instanceof HTMLFormElement)) {
        console.error("Persistence setup requires a valid form element.");
        return null;
    }

    if (!window.localStorage || !window.JSON) {
        if (console && console.log) {
            !window.localStorage && console.log("ERROR: Your environment lacks localStorage support.");
            !window.JSON && console.log("ERROR: Your environment lacks JSON support.");
        }
        return {
            capture: () => {},
            repopulate: () => {},
            annihilate: () => {},
            destroy: () => {}
        };
    }

    const defaultSettings = {
        preserveOnSubmission: true,
        notificationBuilder: null,
        notificationAnchorSelector: "a",
        notificationDismissSelector: "",
        excludedFields: [],
        notificationContainerSelector: ".form-recall-prompt",
        useElementIdForStorageKey: false,
        explicitStorageKey: null
    };

    const currentSettings = { ...defaultSettings, ...customConfiguration };

    let formStorageKey = currentSettings.explicitStorageKey || targetFormElement.id;
    if (!formStorageKey) {
        console.error("ERROR: Form needs an 'id' attribute or an 'explicitStorageKey' in configuration for persistence.");
        return null;
    }
    
    let currentNotificationElement = null;
    let resetBtnClickObserver = null;

    const extractFormValues = () => {
        const collectedInputs = [];
        for (const input of targetFormElement.elements) {
            const fieldName = input.name;
            if (!fieldName || currentSettings.excludedFields.includes(fieldName)) {
                continue;
            }

            let fieldValue;
            if (input.type === 'radio') {
                if (input.checked) {
                    fieldValue = input.value;
                    collectedInputs.push({ name: fieldName, value: fieldValue, type: input.type });
                }
            } else if (input.type === 'checkbox') {
                fieldValue = input.checked;
                collectedInputs.push({ name: fieldName, value: fieldValue, type: input.type });
            } else if (input.tagName === 'SELECT') {
                if (input.multiple) {
                    fieldValue = Array.from(input.options)
                                      .filter(option => option.selected)
                                      .map(option => option.value);
                } else {
                    fieldValue = input.value;
                }
                collectedInputs.push({ name: fieldName, value: fieldValue, type: input.tagName.toLowerCase() });
            } else {
                fieldValue = input.value;
                collectedInputs.push({ name: fieldName, value: fieldValue, type: input.type });
            }
        }
        return collectedInputs;
    };

    const recordFormInputs = () => {
        const currentValues = extractFormValues();
        if (currentValues.length > 0) {
            dataVault.storeSegment(formStorageKey, currentValues);
        } else {
            dataVault.removeSegment(formStorageKey);
        }
    };

    const repopulateFormFields = (event) => {
        const storedData = dataVault.retrieveSegment(formStorageKey);
        if (!storedData) return;

        storedData.forEach(item => {
            const inputElements = targetFormElement.querySelectorAll(`[name="${item.name}"]`);
            if (inputElements.length === 0) return;

            if (item.type === 'radio') {
                const radioToSelect = Array.from(inputElements).find(radio => radio.value === item.value);
                if (radioToSelect) {
                    radioToSelect.checked = true;
                    radioToSelect.dispatchEvent(new Event('change', { bubbles: true }));
                }
            } else if (item.type === 'checkbox') {
                Array.from(inputElements).forEach(checkbox => {
                    checkbox.checked = !!item.value;
                    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                });
            } else if (item.type === 'select') { // For both single and multiple selects
                Array.from(inputElements).forEach(select => {
                    Array.from(select.options).forEach(option => {
                        if (Array.isArray(item.value)) { // Multiple select
                            option.selected = item.value.includes(option.value);
                        } else { // Single select
                            option.selected = option.value === item.value;
                        }
                    });
                    select.dispatchEvent(new Event('change', { bubbles: true }));
                });
            }
            else {
                Array.from(inputElements).forEach(input => {
                    input.value = item.value;
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                });
            }
        });
        
        dismissNotification();
        event && event.preventDefault && event.preventDefault();
    };

    const eraseStoredData = (event) => {
        dataVault.removeSegment(formStorageKey);
        dismissNotification();
        if (event && event.type === 'submit') {
            window.removeEventListener('beforeunload', recordFormInputs);
            window.removeEventListener('unload', recordFormInputs);
        }
    };

    const buildDefaultNotification = () => {
        const notificationDiv = document.createElement('div');
        notificationDiv.className = 'form-recall-prompt';
        notificationDiv.style.display = 'none';
        notificationDiv.innerHTML = `
            <p>
                Do you wish to <a href="#" class="recall-action">restore previously entered information</a>?
                <button type="button" class="dismiss-action" style="margin-left: 10px; cursor: pointer;">X</button>
            </p>
        `;
        return notificationDiv;
    };

    const attachNotificationListeners = () => {
        if (!currentNotificationElement) return;

        const recallLink = currentNotificationElement.querySelector(currentSettings.notificationAnchorSelector);
        if (recallLink) {
            recallLink.addEventListener('click', repopulateFormFields);
        }
        const dismissButton = currentNotificationElement.querySelector(currentSettings.notificationDismissSelector || '.dismiss-action');
        if (dismissButton) {
            dismissButton.addEventListener('click', dismissNotification);
        }
    };

    const detachNotificationListeners = () => {
        if (!currentNotificationElement) return;

        const recallLink = currentNotificationElement.querySelector(currentSettings.notificationAnchorSelector);
        if (recallLink) {
            recallLink.removeEventListener('click', repopulateFormFields);
        }
        const dismissButton = currentNotificationElement.querySelector(currentSettings.notificationDismissSelector || '.dismiss-action');
        if (dismissButton) {
            dismissButton.removeEventListener('click', dismissNotification);
        }
    };

    const constructNotification = () => {
        if (!currentNotificationElement) {
            currentNotificationElement = currentSettings.notificationBuilder
                ? currentSettings.notificationBuilder()
                : buildDefaultNotification();
            
            if (!(currentNotificationElement instanceof Element)) {
                console.error("Notification builder did not return a valid DOM element.");
                currentNotificationElement = buildDefaultNotification();
            }

            if (targetFormElement.firstChild) {
                targetFormElement.insertBefore(currentNotificationElement, targetFormElement.firstChild);
            } else {
                targetFormElement.appendChild(currentNotificationElement);
            }
            attachNotificationListeners();
        }
    };

    const presentNotification = () => {
        if (dataVault.retrieveSegment(formStorageKey)) {
            constructNotification();
            currentNotificationElement.style.display = '';
        }
    };

    const dismissNotification = () => {
        if (currentNotificationElement) {
            currentNotificationElement.style.display = 'none';
        }
    };

    const bindFormEvents = () => {
        window.addEventListener('beforeunload', recordFormInputs);
        window.addEventListener('unload', recordFormInputs);

        if (!currentSettings.preserveOnSubmission) {
            targetFormElement.addEventListener('submit', eraseStoredData);
        }

        targetFormElement.addEventListener('dataAnnihilationRequest', eraseStoredData);
        targetFormElement.addEventListener('dataRecallRequest', repopulateFormFields);

        resetBtnClickObserver = (e) => {
            targetFormElement.dispatchEvent(new CustomEvent('dataAnnihilationRequest', { bubbles: true }));
        };
        targetFormElement.querySelectorAll('input[type="reset"], button[type="reset"]').forEach(resetButton => {
            resetButton.addEventListener('click', resetBtnClickObserver);
        });
    };

    const unbindAllEvents = () => {
        window.removeEventListener('beforeunload', recordFormInputs);
        window.removeEventListener('unload', recordFormInputs);
        targetFormElement.removeEventListener('submit', eraseStoredData);
        targetFormElement.removeEventListener('dataAnnihilationRequest', eraseStoredData);
        targetFormElement.removeEventListener('dataRecallRequest', repopulateFormFields);
        
        targetFormElement.querySelectorAll('input[type="reset"], button[type="reset"]').forEach(resetButton => {
            if (resetBtnClickObserver) {
                resetButton.removeEventListener('click', resetBtnClickObserver);
            }
        });
        
        detachNotificationListeners();
        if (currentNotificationElement && currentNotificationElement.parentNode) {
            currentNotificationElement.parentNode.removeChild(currentNotificationElement);
        }
        currentNotificationElement = null;
    };

    bindFormEvents();
    presentNotification();

    const managerInstance = {
        capture: recordFormInputs,
        repopulate: repopulateFormFields,
        annihilate: eraseStoredData,
        destroy: unbindAllEvents
    };
    activeFormManagers.set(targetFormElement, managerInstance);

    return managerInstance;
}

(function(globalScope) {
    globalScope.setupFormMemory = (inputIdentifier, optionsOrMethod) => {
        let formsToProcess = [];

        if (typeof inputIdentifier === 'string') {
            formsToProcess = Array.from(document.querySelectorAll(inputIdentifier));
        } else if (inputIdentifier instanceof HTMLFormElement) {
            formsToProcess = [inputIdentifier];
        } else if (Array.isArray(inputIdentifier) && inputIdentifier.every(el => el instanceof HTMLFormElement)) {
            formsToProcess = inputIdentifier;
        } else {
            console.error("Invalid input for setupFormMemory. Expected a selector string, a form element, or an array of form elements.");
            return [];
        }

        formsToProcess.forEach(formEl => {
            let manager = activeFormManagers.get(formEl);

            if (typeof optionsOrMethod === 'string') {
                if (manager && typeof manager[optionsOrMethod] === 'function') {
                    manager[optionsOrMethod]();
                } else {
                    console.warn(`Method "${optionsOrMethod}" not found or manager not initialized for this form.`);
                }
            } else {
                if (manager) {
                    manager.destroy();
                }
                const newManager = establishFormPersistence(formEl, optionsOrMethod || {});
                if (newManager) {
                    activeFormManagers.set(formEl, newManager);
                }
            }
        });

        return formsToProcess;
    };
})(window);