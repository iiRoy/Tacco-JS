const configurationVault = (function() {
    const storageKey = 'applicationConfigurationData';
    const displayCountKey = 'interceptDisplayFlag';
    let currentSettingsStore = [];

    const safeParse = (data) => {
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error("Failed to decode stored configuration:", e);
            return null;
        }
    };

    return {
        fetchConfigurationState: function() {
            const storedValue = localStorage.getItem(storageKey);
            currentSettingsStore = storedValue ? safeParse(storedValue) : [];
            return [...currentSettingsStore];
        },

        preserveConfigurationState: function(settings) {
            currentSettingsStore = [...settings];
            localStorage.setItem(storageKey, JSON.stringify(currentSettingsStore));
        },

        getDisplayCounterPreference: function() {
            const flag = localStorage.getItem(displayCountKey);
            if (flag === null) return true;
            try {
                return JSON.parse(flag);
            } catch (e) {
                console.warn("Issue parsing counter display preference, defaulting to active.", e);
                return true;
            }
        },

        setDisplayCounterPreference: function(value) {
            localStorage.setItem(displayCountKey, JSON.stringify(!!value));
        },

        updateConfigurationStore: function(newSettings) {
            currentSettingsStore = [...newSettings];
            this.preserveConfigurationState(currentSettingsStore);
        }
    };
})();

const domUtilities = (function() {
    const createElement = (tag, attributes = {}, children = []) => {
        const element = document.createElement(tag);
        for (const key in attributes) {
            if (key === 'classIdentifier') {
                element.className = attributes[key];
            } else if (key === 'textualContent') {
                element.textContent = attributes[key];
            } else if (key === 'htmlFragment') {
                element.innerHTML = attributes[key];
            } else if (key.startsWith('on') && typeof attributes[key] === 'function') {
                element.addEventListener(key.substring(2).toLowerCase(), attributes[key]);
            } else {
                element.setAttribute(key, attributes[key]);
            }
        }
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof Node) {
                element.appendChild(child);
            }
        });
        return element;
    };

    const findElement = (selector) => document.querySelector(selector);
    const findAllElements = (selector) => Array.from(document.querySelectorAll(selector));

    const purgeChildren = (parent) => {
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
    };

    return {
        createElement,
        findElement,
        findAllElements,
        purgeChildren,
        showTemporaryFeedback: (element, duration = 2500) => {
            element.style.display = 'block';
            element.style.opacity = '1';
            setTimeout(() => {
                element.style.transition = `opacity 0.5s ease-out`;
                element.style.opacity = '0';
                setTimeout(() => {
                    element.style.display = 'none';
                    element.style.transition = '';
                }, 500);
            }, duration);
        }
    };
})();

const siteConfigurationProvider = (function() {
    let siteDefinitions = [];

    const refreshDefinitions = () => {
        siteDefinitions = configurationVault.fetchConfigurationState();
        if (siteDefinitions.length === 0) {
            siteDefinitions.push({ urlPath: 'http://default.url', customHeaderEntries: [] });
        }
    };

    refreshDefinitions();

    return {
        retrieveAllDefinitions: () => [...siteDefinitions],
        getDefinitionAtIndex: (index) => siteDefinitions[index],
        addDefinition: (path, headers = []) => {
            const newDefinition = { urlPath: path, customHeaderEntries: headers };
            siteDefinitions.push(newDefinition);
            configurationVault.preserveConfigurationState(siteDefinitions);
            return newDefinition;
        },
        removeDefinitionByIndex: (index) => {
            if (index >= 0 && index < siteDefinitions.length) {
                siteDefinitions.splice(index, 1);
                configurationVault.preserveConfigurationState(siteDefinitions);
            }
        },
        clearAllDefinitions: () => {
            siteDefinitions = [];
            configurationVault.preserveConfigurationState(siteDefinitions);
        },
        updateAllDefinitions: (newDefinitions) => {
            siteDefinitions = newDefinitions;
            configurationVault.preserveConfigurationState(siteDefinitions);
        },
        countDefinitions: () => siteDefinitions.length,
        reloadDefinitions: () => refreshDefinitions()
    };
})();

const headerSectionDisplay = (function() {
    const createEditableTableCell = (dataRecord, propertyIdentifier, initialContent, parentRow) => {
        let displayCell = domUtilities.createElement('td', { textualContent: initialContent });

        const persistEdit = (inputElement) => {
            const updatedValue = inputElement.value;
            dataRecord[propertyIdentifier] = updatedValue;
            displayCell.textContent = updatedValue;
            // Replace the current content of the cell (input+button) with just the text
            domUtilities.purgeChildren(displayCell);
            displayCell.textContent = updatedValue;
            appEventStream.emit('configurationModified');
        };

        const activateEditMode = (event) => {
            const targetCell = event.target;
            if (targetCell.querySelector('input')) return;

            const originalContent = dataRecord[propertyIdentifier];
            const inputElement = domUtilities.createElement('input', { type: 'text', value: originalContent, classIdentifier: 'edit-input-field' });
            const saveButton = domUtilities.createElement('button', {
                textualContent: 'Save',
                classIdentifier: 'action-button edit-save-button',
                onclick: () => {
                    persistEdit(inputElement);
                }
            });

            domUtilities.purgeChildren(targetCell);
            targetCell.appendChild(inputElement);
            targetCell.appendChild(saveButton);
            inputElement.focus();

            inputElement.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    saveButton.click();
                }
            });
            displayCell = targetCell; // Update reference to the actual cell DOM element
        };

        displayCell.addEventListener('click', activateEditMode);
        return displayCell;
    };

    const generateHeaderRowElement = (headerData) => {
        const row = domUtilities.createElement('tr');
        const nameCell = createEditableTableCell(headerData, 'name', headerData.name, row);
        const valueCell = createEditableTableCell(headerData, 'value', headerData.value, row);
        row.appendChild(nameCell);
        row.appendChild(valueCell);
        return row;
    };

    return {
        renderHeaderConfigurations: (siteRecord, targetTableBody) => {
            domUtilities.purgeChildren(targetTableBody);

            if (!siteRecord || !siteRecord.customHeaderEntries) {
                return;
            }

            siteRecord.customHeaderEntries.forEach(header => {
                targetTableBody.appendChild(generateHeaderRowElement(header));
            });

            const addHeaderActionBtn = domUtilities.findElement('.addHeaderButton');
            if (addHeaderActionBtn) {
                const existingListener = addHeaderActionBtn._clickHandler; // Store listener reference
                if (existingListener) {
                    addHeaderActionBtn.removeEventListener('click', existingListener);
                }

                const newHandler = function() {
                    const newHeader = { name: '', value: '' };
                    siteRecord.customHeaderEntries.push(newHeader);
                    const newRow = generateHeaderRowElement(newHeader);
                    targetTableBody.appendChild(newRow);
                    newRow.querySelector('td').click();
                    appEventStream.emit('configurationModified');
                };
                addHeaderActionBtn.addEventListener('click', newHandler);
                addHeaderActionBtn._clickHandler = newHandler; // Store for later removal
            }
        }
    };
})();

const urlSelectionControl = (function() {
    let activeUrlDropdown = null;

    const handleSelectionChange = (event) => {
        const selectedIndex = event.target.options[event.target.selectedIndex].value;
        const selectedSiteDefinition = siteConfigurationProvider.getDefinitionAtIndex(parseInt(selectedIndex, 10));
        const headerTableContentArea = domUtilities.findElement('#headerDisplayArea');
        headerSectionDisplay.renderHeaderConfigurations(selectedSiteDefinition, headerTableContentArea);
    };

    return {
        buildSelectionOptions: () => {
            const urlSelectElement = domUtilities.findElement('#siteAddressChooser');
            activeUrlDropdown = urlSelectElement;
            domUtilities.purgeChildren(urlSelectElement);

            siteConfigurationProvider.retrieveAllDefinitions().forEach((definition, index) => {
                const option = domUtilities.createElement('option', {
                    value: index,
                    textualContent: definition.urlPath
                });
                if (index === 0) {
                    option.selected = true;
                }
                urlSelectElement.appendChild(option);
            });

            urlSelectElement.removeEventListener('change', handleSelectionChange);
            urlSelectElement.addEventListener('change', handleSelectionChange);

            urlSelectElement.dispatchEvent(new Event('change'));
            return urlSelectElement;
        },
        getActiveDropdownElement: () => activeUrlDropdown
    };
})();

const appEventStream = (function() {
    const eventSubscribers = {};

    return {
        on: function(eventName, callback) {
            if (!eventSubscribers[eventName]) {
                eventSubscribers[eventName] = [];
            }
            eventSubscribers[eventName].push(callback);
        },
        off: function(eventName, callback) {
            if (eventSubscribers[eventName]) {
                eventSubscribers[eventName] = eventSubscribers[eventName].filter(cb => cb !== callback);
            }
        },
        emit: function(eventName, data) {
            if (eventSubscribers[eventName]) {
                eventSubscribers[eventName].forEach(callback => callback(data));
            }
        }
    };
})();

const persistAndNotify = () => {
    const successFeedback = domUtilities.findElement('.success-feedback');
    const errorFeedback = domUtilities.findElement('.error-feedback');
    try {
        configurationVault.setDisplayCounterPreference(domUtilities.findElement('#showInterceptCount').checked);

        if (typeof chrome !== 'undefined' && chrome.extension && chrome.extension.sendMessage) {
            chrome.extension.sendMessage({ type: 'updateConfiguration' }, (response) => {
                if (response && response.status === 'success') {
                    urlSelectionControl.buildSelectionOptions();
                    domUtilities.showTemporaryFeedback(successFeedback);
                } else {
                    errorFeedback.textContent = 'Extension update failed: ' + (response ? response.message : 'Unknown error');
                    domUtilities.showTemporaryFeedback(errorFeedback, 5000);
                }
            });
        } else {
            urlSelectionControl.buildSelectionOptions();
            domUtilities.showTemporaryFeedback(successFeedback);
        }

    } catch (e) {
        errorFeedback.textContent = 'An internal system error occurred: ' + e.toString();
        domUtilities.showTemporaryFeedback(errorFeedback, 5000);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    urlSelectionControl.buildSelectionOptions();

    domUtilities.findAllElements('.application-alert').forEach(alert => alert.style.display = 'none');

    const addNewUrlForm = domUtilities.findElement('#addNewUrlEntryForm');
    addNewUrlForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const urlInputField = domUtilities.findElement('#newUrlInput');
        const newAddressValue = urlInputField.value.trim();

        if (newAddressValue) {
            siteConfigurationProvider.addDefinition(newAddressValue, []);
            urlSelectionControl.buildSelectionOptions();
            const selectorElement = urlSelectionControl.getActiveDropdownElement();
            selectorElement.value = siteConfigurationProvider.countDefinitions() - 1;
            selectorElement.dispatchEvent(new Event('change'));
            urlInputField.value = '';

            domUtilities.findElement('.addHeaderButton').click();
        }
    });

    const displayCountToggle = domUtilities.findElement('#showInterceptCount');
    displayCountToggle.checked = configurationVault.getDisplayCounterPreference();
    displayCountToggle.addEventListener('change', () => {
        configurationVault.setDisplayCounterPreference(displayCountToggle.checked);
    });

    const globalSaveActionBtn = domUtilities.findElement('#globalSaveAction');
    globalSaveActionBtn.addEventListener('click', persistAndNotify);

    const purgeAllSettingsBtn = domUtilities.findElement('#purgeAllSettings');
    purgeAllSettingsBtn.addEventListener('click', () => {
        siteConfigurationProvider.clearAllDefinitions();
        persistAndNotify();
        urlSelectionControl.buildSelectionOptions();
    });

    const removeSelectedSettingBtn = domUtilities.findElement('#removeSelectedSetting');
    removeSelectedSettingBtn.addEventListener('click', () => {
        const selectorElement = urlSelectionControl.getActiveDropdownElement();
        const selectedIndex = selectorElement.options[selectorElement.selectedIndex].value;
        if (selectedIndex !== undefined && selectedIndex !== null) {
            siteConfigurationProvider.removeDefinitionByIndex(parseInt(selectedIndex, 10));
            persistAndNotify();
            urlSelectionControl.buildSelectionOptions();
        }
    });

    const importExportDialog = domUtilities.findElement('#importExportDialog');
    const exportDataField = domUtilities.findElement('#exportInputArea');
    const importConfirmationBtn = domUtilities.findElement('#importDataConfirmBtn');
    const importErrorDisplay = domUtilities.findElement('.import-error-display');

    appEventStream.on('showImportExportModal', () => {
        exportDataField.value = JSON.stringify(siteConfigurationProvider.retrieveAllDefinitions(), null, 2);
        importErrorDisplay.style.display = 'none';

        const importProcessHandler = () => {
            try {
                const incomingData = JSON.parse(exportDataField.value);
                const dataIsValid = Array.isArray(incomingData) && incomingData.every(item =>
                    typeof item === 'object' && item !== null &&
                    typeof item.urlPath === 'string' &&
                    Array.isArray(item.customHeaderEntries) && item.customHeaderEntries.every(header =>
                        typeof header === 'object' && header !== null &&
                        typeof header.name === 'string' && typeof header.value === 'string'
                    )
                );

                if (dataIsValid) {
                    siteConfigurationProvider.updateAllDefinitions(incomingData);
                    appEventStream.emit('hideImportExportModal');
                    persistAndNotify();
                } else {
                    importErrorDisplay.textContent = 'Invalid configuration structure detected. Verify JSON schema.';
                    importErrorDisplay.style.display = 'block';
                }
            } catch (e) {
                importErrorDisplay.textContent = 'Error parsing JSON input: ' + e.message;
                importErrorDisplay.style.display = 'block';
            }
        };

        importConfirmationBtn.addEventListener('click', importProcessHandler);
        appEventStream.on('hideImportExportModal', () => {
            importConfirmationBtn.removeEventListener('click', importProcessHandler);
        }, { once: true });
    });

    const openImportExportBtn = domUtilities.findElement('#openImportExport');
    if (openImportExportBtn) {
        openImportExportBtn.addEventListener('click', () => {
            appEventStream.emit('showImportExportModal');
            if (importExportDialog) importExportDialog.style.display = 'block';
        });
    }

    const closeImportExportBtn = domUtilities.findElement('#closeImportExport');
    if (closeImportExportBtn) {
        closeImportExportBtn.addEventListener('click', () => {
            appEventStream.emit('hideImportExportModal');
            if (importExportDialog) importExportDialog.style.display = 'none';
        });
    }

    appEventStream.on('configurationModified', () => {
        // Triggered when any part of the configuration is changed (e.g., header cell edit)
        // This ensures the internal state is persisted, which is already handled by
        // siteConfigurationProvider methods. This event can be used for other UI updates
        // if needed, e.g., enabling a 'save changes' indicator.
    });
});