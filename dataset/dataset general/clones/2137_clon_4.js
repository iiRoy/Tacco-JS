const SecureVault = (function() {
    let storageIsFunctional = null;

    function verifyStorageCapability() {
        if (storageIsFunctional !== null) {
            return storageIsFunctional;
        }
        try {
            const testIdentifier = '__test_storage_capability__';
            localStorage.setItem(testIdentifier, testIdentifier);
            localStorage.removeItem(testIdentifier);
            storageIsFunctional = true;
            return true;
        } catch (e) {
            storageIsFunctional = false;
            return false;
        }
    }

    function storeEntry(designation, content) {
        if (verifyStorageCapability()) {
            try {
                localStorage.setItem(designation, String(content));
            } catch (e) {
                // Ignore storage capacity exceeded errors or similar
            }
        }
    }

    function retrieveEntry(designation) {
        if (verifyStorageCapability()) {
            return localStorage.getItem(designation);
        }
        return null;
    }

    function removeEntry(designation) {
        if (verifyStorageCapability()) {
            localStorage.removeItem(designation);
        }
    }

    return {
        checkAvailability: verifyStorageCapability,
        saveData: storeEntry,
        loadData: retrieveEntry,
        clearData: removeEntry
    };
})();

const FormStateGuardian = (function() {
    const activeInstances = new Map();
    let ckEditorScanHandle = null;

    class GuardianModule {
        constructor(domElements, userConfiguration) {
            this.monitoredForms = Array.from(domElements);
            this.uniqueIdentity = this.createCollectionIdentity(this.monitoredForms);
            this.settings = this.applyConfiguration(userConfiguration);
            this.documentLocation = window.location.hostname + window.location.pathname + window.location.search + window.location.hash;
            this.isCurrentlyObserving = false;
            this.periodicSaveTimer = null;

            this.performInitialRestoration();
            if (this.settings.autoPurge) {
                this.setPurgeHooks();
            }
            this.beginFormObservation();
        }

        applyConfiguration(userConfig) {
            const defaultSettings = {
                excludedElements: [], // Elements to exclude from saving
                keySuffix: "",
                locationDependent: false,
                saveInterval: 0, // In seconds
                autoPurge: true,
                onContentSaved: () => {},
                onBeforeContentRestore: () => {},
                onContentRestored: () => {},
                onContentPurged: () => {}
            };
            return { ...defaultSettings, ...userConfig };
        }

        createCollectionIdentity(elements) {
            return elements.map(elm => (elm.id || '') + (elm.name || '')).join('_') || 'default_form_group_id';
        }

        // Checks for CKEditor and waits for it to be ready
        awaitCKEditor(completionCallback) {
            if (typeof window.CKEDITOR === 'object' && window.CKEDITOR !== null) {
                if (window.CKEDITOR.status === 'loaded') {
                    completionCallback(true);
                } else {
                    let attemptCount = 0;
                    const maxAttempts = 100; // 10 seconds timeout
                    ckEditorScanHandle = setInterval(() => {
                        if (window.CKEDITOR.status === 'loaded') {
                            clearInterval(ckEditorScanHandle);
                            ckEditorScanHandle = null;
                            completionCallback(true);
                        } else if (attemptCount++ > maxAttempts) {
                            clearInterval(ckEditorScanHandle);
                            ckEditorScanHandle = null;
                            completionCallback(false);
                        }
                    }, 100);
                }
                return true;
            }
            completionCallback(false);
            return false;
        }

        // Identifies all savable input fields within a given form
        locateSavableInputs(formElement) {
            const inputSelector = 'input:not([type="submit"]):not([type="reset"]):not([type="button"]):not([type="file"]):not([type="password"]):not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly]), select:not([disabled]):not([readonly])';
            return Array.from(formElement.querySelectorAll(inputSelector))
                .filter(field => !this.settings.excludedElements.includes(field));
        }

        // Constructs a unique key for storing a field's data
        buildStorageKey(formElement, fieldElement) {
            const formDesignator = (formElement.id || '') + (formElement.name || '');
            const fieldDesignator = fieldElement.name || fieldElement.id || '';
            let keyComponent = formDesignator + fieldDesignator + this.settings.keySuffix;
            if (this.settings.locationDependent) {
                keyComponent = this.documentLocation + keyComponent;
            }
            return keyComponent;
        }

        // --- Data Restoration Logic ---
        performInitialRestoration() {
            if (!SecureVault.checkAvailability()) {
                return;
            }

            const preRestoreOutcome = this.settings.onBeforeContentRestore.call(this);
            if (preRestoreOutcome === false) return;

            let dataWasApplied = false;
            this.monitoredForms.forEach(formElement => {
                this.locateSavableInputs(formElement).forEach(fieldElement => {
                    if (!fieldElement.name) {
                        return;
                    }
                    const storageKey = this.buildStorageKey(formElement, fieldElement);
                    const retrievedContent = SecureVault.loadData(storageKey);
                    if (retrievedContent !== null) {
                        this.repopulateFieldWithSavedValue(fieldElement, retrievedContent);
                        dataWasApplied = true;
                    }
                });
            });

            if (dataWasApplied) {
                this.settings.onContentRestored.call(this);
            }
        }

        // Populates a form field with its previously saved value
        repopulateFieldWithSavedValue(fieldElement, savedContent) {
            const fieldType = fieldElement.type;
            const fieldName = fieldElement.name;

            if (fieldType === 'checkbox') {
                if (fieldName && fieldName.includes('[]')) {
                    const values = savedContent.split(',');
                    fieldElement.checked = values.includes(fieldElement.value);
                } else {
                    fieldElement.checked = (savedContent === 'true');
                }
            } else if (fieldType === 'radio') {
                fieldElement.checked = (fieldElement.value === savedContent);
            } else if (fieldElement.tagName === 'SELECT') {
                if (fieldElement.multiple) {
                    const values = savedContent.split(',');
                    Array.from(fieldElement.options).forEach(option => {
                        option.selected = values.includes(option.value);
                    });
                } else {
                    fieldElement.value = savedContent;
                }
            } else {
                fieldElement.value = savedContent;
            }
            fieldElement.dispatchEvent(new Event('change', { bubbles: true })); // Trigger change event
        }

        // --- Data Saving Logic ---
        beginFormObservation() {
            if (!SecureVault.checkAvailability() || this.isCurrentlyObserving) {
                return;
            }

            this.isCurrentlyObserving = true;

            if (this.settings.saveInterval > 0) {
                this.schedulePeriodicSaving();
            }

            this.awaitCKEditor(isCKEditorReady => {
                this.monitoredForms.forEach(formElement => {
                    this.locateSavableInputs(formElement).forEach(fieldElement => {
                        this.attachInputEventHandlers(fieldElement, formElement, isCKEditorReady);
                    });
                });
            });
        }

        // Attaches event listeners to form fields for data saving
        attachInputEventHandlers(fieldElement, formElement, ckEditorPresent) {
            const storageKey = this.buildStorageKey(formElement, fieldElement);
            const inputKind = fieldElement.type || fieldElement.tagName.toLowerCase();
            const selfRef = this;

            function processFieldChange() {
                if (inputKind === 'text' || inputKind === 'textarea' || inputKind === 'search' || inputKind === 'url' || inputKind === 'email' || inputKind === 'number') {
                    selfRef.saveSingleField(storageKey, fieldElement.value, false);
                } else {
                    selfRef.collectAndSaveAllFormData();
                }
            }

            if (inputKind === 'text' || inputKind === 'textarea' || inputKind === 'search' || inputKind === 'url' || inputKind === 'email' || inputKind === 'number') {
                fieldElement.addEventListener('input', processFieldChange);
                if ('onpropertychange' in fieldElement) { // IE < 9 fallback
                    fieldElement.addEventListener('propertychange', e => {
                        if (e.propertyName === 'value') {
                            processFieldChange();
                        }
                    });
                }

                if (ckEditorPresent) {
                    const editorInstance = window.CKEDITOR.instances[fieldElement.id] || window.CKEDITOR.instances[fieldElement.name];
                    if (editorInstance) {
                        editorInstance.on('change', () => {
                            editorInstance.updateElement();
                            selfRef.saveSingleField(storageKey, fieldElement.value, false);
                        });
                    }
                }
            } else {
                fieldElement.addEventListener('change', () => {
                    selfRef.collectAndSaveAllFormData();
                });
            }
        }

        // Saves an individual field's value to storage
        saveSingleField(key, value, triggerCompletionCallback = true) {
            SecureVault.saveData(key, value);
            if (triggerCompletionCallback && value !== "") {
                this.settings.onContentSaved.call(this);
            }
        }

        // Collects and saves data from all fields in all monitored forms
        collectAndSaveAllFormData() {
            const selfRef = this;
            this.monitoredForms.forEach(formElement => {
                const multiCheckboxRegistry = new Set();

                this.locateSavableInputs(formElement).forEach(fieldElement => {
                    if (!fieldElement.name) {
                        return;
                    }

                    const storageKey = selfRef.buildStorageKey(formElement, fieldElement);
                    let contentValue = fieldElement.value;
                    const inputKind = fieldElement.type;
                    const fieldName = fieldElement.name;

                    if (inputKind === 'checkbox') {
                        if (fieldName.includes('[]')) {
                            if (multiCheckboxRegistry.has(fieldName)) {
                                return;
                            }
                            const checkedValues = Array.from(formElement.querySelectorAll(`input[name="${fieldName}"]:checked`))
                                .map(cb => cb.value);
                            contentValue = checkedValues.join(',');
                            multiCheckboxRegistry.add(fieldName);
                        } else {
                            contentValue = fieldElement.checked;
                        }
                        selfRef.saveSingleField(storageKey, contentValue, false);
                    } else if (inputKind === 'radio') {
                        if (fieldElement.checked) {
                            contentValue = fieldElement.value;
                            selfRef.saveSingleField(storageKey, contentValue, false);
                        }
                    } else if (fieldElement.tagName === 'SELECT') {
                        if (fieldElement.multiple) {
                            const selectedValues = Array.from(fieldElement.options)
                                .filter(option => option.selected)
                                .map(option => option.value);
                            contentValue = selectedValues.join(',');
                        }
                        selfRef.saveSingleField(storageKey, contentValue, false);
                    } else {
                        selfRef.saveSingleField(storageKey, contentValue, false);
                    }
                });
            });
            this.settings.onContentSaved.call(this);
        }

        // Sets up a timer for periodic saving
        schedulePeriodicSaving() {
            if (this.settings.saveInterval > 0) {
                if (this.periodicSaveTimer) {
                    clearInterval(this.periodicSaveTimer);
                }
                this.periodicSaveTimer = setInterval(() => {
                    this.collectAndSaveAllFormData();
                }, this.settings.saveInterval * 1000);
            }
        }

        // --- Data Purging Logic ---
        setPurgeHooks() {
            this.monitoredForms.forEach(formElement => {
                formElement.addEventListener('submit', () => this.clearFormRecords(formElement));
                formElement.addEventListener('reset', () => this.clearFormRecords(formElement));
            });
        }

        // Clears saved data for a specific form
        clearFormRecords(formElement) {
            let dataWasCleared = false;
            this.locateSavableInputs(formElement).forEach(fieldElement => {
                if (!fieldElement.name) {
                    return;
                }
                const storageKey = this.buildStorageKey(formElement, fieldElement);
                SecureVault.clearData(storageKey);
                dataWasCleared = true;
            });
            if (dataWasCleared) {
                this.settings.onContentPurged.call(this);
            }
            this.isCurrentlyObserving = false;
            if (this.periodicSaveTimer) {
                clearInterval(this.periodicSaveTimer);
                this.periodicSaveTimer = null;
            }
            activeInstances.delete(this.uniqueIdentity);
        }

        // Manually triggers data purging for all managed forms
        initiateManualPurge() {
            this.monitoredForms.forEach(formElement => this.clearFormRecords(formElement));
        }
    }

    return {
        // Factory method to retrieve or create a GuardianModule instance
        getFormProtection: function(targetForms, configuration) {
            const formElements = Array.from(targetForms);
            const temporaryIdentity = formElements.map(elm => (elm.id || '') + (elm.name || '')).join('_') || 'default_form_group_id';

            if (activeInstances.has(temporaryIdentity)) {
                const existingUnit = activeInstances.get(temporaryIdentity);
                existingUnit.settings = existingUnit.applyConfiguration(configuration); // Update settings
                return existingUnit;
            } else {
                const newUnit = new GuardianModule(formElements, configuration);
                activeInstances.set(newUnit.uniqueIdentity, newUnit);
                return newUnit;
            }
        }
    };
})();

(function(globalScope) {
    globalScope.formInputProtector = function(targetInput, config = {}) {
        let formTargets;
        if (typeof targetInput === 'string') {
            formTargets = document.querySelectorAll(targetInput);
        } else if (targetInput instanceof NodeList || Array.isArray(targetInput)) {
            formTargets = targetInput;
        } else if (targetInput instanceof HTMLElement) {
            formTargets = [targetInput];
        } else {
            console.warn("formInputProtector: Invalid input provided. Expected selector string, NodeList, Array of elements, or single HTMLElement.");
            return null;
        }

        if (formTargets.length === 0) {
            console.warn("formInputProtector: No elements found for the given target.");
            return null;
        }

        return FormStateGuardian.getFormProtection(formTargets, config);
    };

})(window);