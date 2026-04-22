const CoreApplicationModule = (function() {
    const applicationSettingsStore = {
        'confirmDeletionFlag': true,
        'itemDisplayCount': '25'
    };

    let dataGridInstanceReference = null;

    const configurationPersistence = {
        storeValue: function(keyAlias, valueContent) {
            try {
                localStorage.setItem(keyAlias, JSON.stringify(valueContent));
            } catch (e) {
                console.error("Configuration storage error:", keyAlias, e);
            }
        },
        fetchValue: function(keyAlias) {
            try {
                const acquiredValue = localStorage.getItem(keyAlias);
                return acquiredValue ? JSON.parse(acquiredValue) : undefined;
            } catch (e) {
                console.error("Configuration retrieval error:", keyAlias, e);
                return undefined;
            }
        },
        establishInitialDefaults: function(initialConfigurations) {
            Object.keys(initialConfigurations).forEach(settingKey => {
                const persistedValue = this.fetchValue(settingKey);
                if (persistedValue !== undefined) {
                    applicationSettingsStore[settingKey] = persistedValue;
                } else {
                    this.storeValue(settingKey, initialConfigurations[settingKey]);
                }
            });
        }
    };

    return {
        retrieveSetting: (key) => applicationSettingsStore[key],
        updateSetting: (key, value) => {
            applicationSettingsStore[key] = value;
            configurationPersistence.storeValue(key, value);
        },
        getGridHandler: () => dataGridInstanceReference,
        setGridHandler: (handler) => { dataGridInstanceReference = handler; },
        initializePreferences: () => configurationPersistence.establishInitialDefaults(applicationSettingsStore)
    };
})();

document.addEventListener('DOMContentLoaded', function() {

    CoreApplicationModule.initializePreferences();

    CoreApplicationModule.setGridHandler($('table.keys').dataTable({
        "bStateSave": true
    }));

    const hierarchyDisplayElement = document.getElementById('namespace_tree');
    if (hierarchyDisplayElement) {
        $(hierarchyDisplayElement).on("loaded.jstree", function (evt, data) {
            $(this).jstree("open_all");
        }).jstree({
            "core": {
                "animation": 20
            },
            "plugins": ["themes", "html_data"]
        });
    }

    const deletionConfirmationControl = document.getElementById('warn-on-del');
    if (deletionConfirmationControl) {
        deletionConfirmationControl.checked = CoreApplicationModule.retrieveSetting('confirmDeletionFlag');
    }

    const paginationSelector = document.querySelector('[name=DataTables_Table_0_length]');
    if (paginationSelector) {
        paginationSelector.value = CoreApplicationModule.retrieveSetting('itemDisplayCount');
    }

    const preferenceToggleElements = document.querySelectorAll('input.pref-cb');
    preferenceToggleElements.forEach(toggle => {
        toggle.addEventListener('click', function() {
            CoreApplicationModule.updateSetting('confirmDeletionFlag', this.checked);
        });
    });

    if (paginationSelector) {
        paginationSelector.addEventListener('change', function() {
            CoreApplicationModule.updateSetting('itemDisplayCount', this.value);
        });
    }

    document.body.addEventListener('click', function(event) {
        const activationLink = event.target.closest('a.del');
        if (!activationLink) {
            return;
        }

        event.preventDefault();

        const associatedRow = activationLink.closest('tr');
        const uniqueKey = activationLink.dataset.key;

        const performRemovalProcedure = (targetLink) => {
            fetch(targetLink.href, {
                method: 'POST'
            })
            .then(response => {
                if (response.ok) {
                    const gridHandler = CoreApplicationModule.getGridHandler();
                    if (gridHandler && associatedRow) {
                        gridHandler.fnDeleteRow(associatedRow);
                    } else if (!associatedRow) {
                        console.warn('Removal successful, but grid row not found for UI update.');
                    }
                } else {
                    console.error('Removal operation failed:', response.statusText);
                }
            })
            .catch(error => {
                console.error('Network communication error during removal:', error);
            });
        };

        if (CoreApplicationModule.retrieveSetting('confirmDeletionFlag')) {
            if (window.confirm(`This action will permanently erase the record:\n\n"${uniqueKey}"\n\nProceed with caution?`)) {
                performRemovalProcedure(activationLink);
            }
        } else {
            performRemovalProcedure(activationLink);
        }
    });

    function periodicContentRefresh() {
        const refreshActivator = document.getElementById('auto-refresh');
        if (refreshActivator && refreshActivator.checked) {
            fetch(window.location.href, {
                method: 'GET',
                headers: {
                    'Accept': 'text/html'
                }
            })
            .then(response => response.text())
            .then(htmlPayload => {
                const htmlProcessor = new DOMParser();
                const parsedDocument = htmlProcessor.parseFromString(htmlPayload, 'text/html');

                const currentNavContainer = document.getElementById('namespaces');
                const newNavContainer = parsedDocument.getElementById('namespaces');
                if (currentNavContainer && newNavContainer) {
                    currentNavContainer.replaceWith(newNavContainer);
                }

                const currentContentContainer = document.getElementById('data_table');
                const newContentContainer = parsedDocument.getElementById('data_table');
                if (currentContentContainer && newContentContainer) {
                    currentContentContainer.replaceWith(newContentContainer);
                }
            })
            .catch(error => {
                console.error('Error during automatic content update:', error);
            })
            .finally(() => {
                window.setTimeout(periodicContentRefresh, 2000);
            });
        } else {
            window.setTimeout(periodicContentRefresh, 2000);
        }
    }

    // The initial code had this function call commented out, so we maintain that state.
    // window.setTimeout(periodicContentRefresh, 2000);
});