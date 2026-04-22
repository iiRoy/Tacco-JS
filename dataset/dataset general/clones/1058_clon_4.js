(function(doc, win, _, markdownRenderer) {
    const cloudService = (function() {
        let authenticatedStatus = false;
        let dataStore = [];
        let currentUserId = null;

        return {
            init: function() {
                authenticatedStatus = !!localStorage.getItem('user_auth_key');
                if (authenticatedStatus) {
                    currentUserId = "user_alpha_123";
                    this.retrieveRecords();
                }
            },
            isSignedIn: function() {
                return authenticatedStatus;
            },
            obtainAccess: function() {
                if (!authenticatedStatus) {
                    localStorage.setItem('user_auth_key', 'temporary_key');
                    authenticatedStatus = true;
                    currentUserId = "user_alpha_123";
                    win.location.reload();
                }
            },
            revokeAccess: function() {
                localStorage.removeItem('user_auth_key');
                authenticatedStatus = false;
                currentUserId = null;
                win.location.reload();
            },
            getUserId: function() {
                return currentUserId;
            },
            retrieveRecords: function() {
                let stored = localStorage.getItem('application_data_store');
                if (stored) {
                    dataStore = JSON.parse(stored);
                } else {
                    dataStore = [];
                }
                return dataStore;
            },
            storeRecord: function(record) {
                let existingIndex = _.findIndex(dataStore, { identifier: record.identifier });
                if (existingIndex > -1) {
                    dataStore[existingIndex] = record;
                } else {
                    dataStore.push(record);
                }
                localStorage.setItem('application_data_store', JSON.stringify(dataStore));
            },
            removeRecord: function(identifier) {
                dataStore = _.reject(dataStore, { identifier: identifier });
                localStorage.setItem('application_data_store', JSON.stringify(dataStore));
            }
        };
    })();

    const eventHub = (function() {
        const subscriptions = {};

        return {
            publish: function(eventName, data) {
                if (subscriptions[eventName]) {
                    subscriptions[eventName].forEach(callback => callback(data));
                }
            },
            subscribe: function(eventName, callback) {
                if (!subscriptions[eventName]) {
                    subscriptions[eventName] = [];
                }
                subscriptions[eventName].push(callback);
            },
            unsubscribe: function(eventName, callback) {
                if (subscriptions[eventName]) {
                    subscriptions[eventName] = subscriptions[eventName].filter(cb => cb !== callback);
                }
            }
        };
    })();

    const contentVault = (function() {
        let entries = [];
        let currentIdentifier = null;

        const generateUniqueId = () => `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const validateEntry = (entry) => {
            if (!entry.titleContent || entry.titleContent.trim() === "") {
                return "A title is required.";
            }
            return null;
        };

        return {
            loadAll: function() {
                entries = cloudService.retrieveRecords();
                eventHub.publish('allEntriesLoaded', entries);
            },
            getAll: function() {
                return [...entries];
            },
            getOne: function(id) {
                return _.find(entries, { identifier: id });
            },
            addOrUpdate: function(data) {
                let validationError = validateEntry(data);
                if (validationError) {
                    return { success: false, message: validationError };
                }

                let entry;
                if (data.identifier) {
                    entry = this.getOne(data.identifier);
                    if (entry) {
                        Object.assign(entry, data);
                        cloudService.storeRecord(entry);
                        eventHub.publish('entryUpdated', entry);
                    } else {
                        entry = { identifier: data.identifier, creationTime: Date.now(), ...data };
                        entries.unshift(entry);
                        cloudService.storeRecord(entry);
                        eventHub.publish('entryAdded', entry);
                    }
                } else {
                    entry = { identifier: generateUniqueId(), creationTime: Date.now(), ...data };
                    entries.unshift(entry);
                    cloudService.storeRecord(entry);
                    eventHub.publish('entryAdded', entry);
                }
                this.setCurrentIdentifier(entry.identifier);
                return { success: true, message: "Content saved.", entry: entry };
            },
            remove: function(id) {
                const removedEntry = _.find(entries, { identifier: id });
                if (removedEntry) {
                    entries = _.reject(entries, { identifier: id });
                    cloudService.removeRecord(id);
                    eventHub.publish('entryRemoved', id);
                    return true;
                }
                return false;
            },
            setCurrentIdentifier: function(id) {
                currentIdentifier = id;
                eventHub.publish('currentIdentifierChanged', id);
            },
            getCurrentIdentifier: function() {
                return currentIdentifier;
            },
            clearCurrentIdentifier: function() {
                this.setCurrentIdentifier(null);
            }
        };
    })();

    const mainApplication = (function() {
        const uiElements = {};
        let quickNavModeActive = false;
        let currentQuickNavIndex = -1;

        const retrieveElementById = (id) => doc.getElementById(id);
        const retrieveElementByClass = (className) => doc.querySelector(`.${className}`);
        const retrieveAllElementsByClass = (className) => doc.querySelectorAll(`.${className}`);

        const addCssClass = (element, className) => element && element.classList.add(className);
        const removeCssClass = (element, className) => element && element.classList.remove(className);

        const applyAnimation = (element, properties, durationMs, callback) => {
            if (!element) return;
            const originalTransition = element.style.transition;
            element.style.transition = `all ${durationMs / 1000}s ease-in-out`;
            Object.keys(properties).forEach(prop => {
                element.style[prop] = properties[prop];
            });
            setTimeout(() => {
                element.style.transition = originalTransition;
                if (callback) callback();
            }, durationMs);
        };

        const updateAuthButtonText = () => {
            if (cloudService.isSignedIn()) {
                uiElements.syncAction.innerHTML = '<i class="fa fa-sign-out"></i>Sign Out';
                uiElements.syncAction.dataset.action = 'signOut';
                uiElements.syncAction.onclick = mainApplication.requestLogout;
            } else {
                uiElements.syncAction.innerHTML = '<i class="fa fa-cloud"></i>Sync';
                uiElements.syncAction.dataset.action = 'syncIn';
                uiElements.syncAction.onclick = mainApplication.requestSync;
            }
        };

        const generateListingItem = (entryData) => {
            const listItem = doc.createElement('li');
            addCssClass(listItem, 'list-entry-item');
            listItem.dataset.recordId = entryData.identifier;
            listItem.innerHTML = `
                <a href="#">${_.escape(entryData.titleContent || 'Untitled')}</a>
            `;
            listItem.addEventListener('click', (e) => {
                e.preventDefault();
                mainApplication.selectContentItem(entryData.identifier);
            });
            return listItem;
        };

        const displayAllEntries = () => {
            uiElements.entriesListing.innerHTML = '';
            contentVault.getAll().forEach(entry => {
                uiElements.entriesListing.prepend(generateListingItem(entry));
            });
        };

        const updateContentPreview = () => {
            uiElements.previewTitleArea.textContent = uiElements.titleInput.value;
            uiElements.previewBodyArea.innerHTML = markdownRenderer(uiElements.bodyInput.value);
        };

        const showTemporaryNotification = (message) => {
            uiElements.notificationDisplay.textContent = message;
            applyAnimation(uiElements.notificationDisplay, { opacity: '1' }, 300, () => {
                setTimeout(() => {
                    applyAnimation(uiElements.notificationDisplay, { opacity: '0' }, 800);
                }, 1000);
            });
        };

        const populateEditorFields = (entryData) => {
            if (!entryData) {
                uiElements.titleInput.value = '';
                uiElements.bodyInput.value = '';
            } else {
                uiElements.titleInput.value = entryData.titleContent || '';
                uiElements.bodyInput.value = entryData.bodyContent || '';
            }
            updateContentPreview();
        };

        const retrieveEditorContents = () => ({
            titleContent: uiElements.titleInput.value.trim(),
            bodyContent: uiElements.bodyInput.value
        });

        const showSidePanel = () => {
            activateQuickNavigation();
            applyAnimation(uiElements.sidePanel, { marginLeft: '0px', display: 'block' }, 50, () => {
                if (uiElements.titleInput) uiElements.titleInput.blur();
                if (uiElements.bodyInput) uiElements.bodyInput.blur();
            });
        };

        const hideSidePanel = () => {
            deactivateQuickNavigation();
            applyAnimation(uiElements.sidePanel, { marginLeft: '-250px' }, 100);
        };

        const toggleSidePanelVisibility = () => {
            if (uiElements.sidePanel.style.marginLeft === "-250px" || uiElements.sidePanel.style.marginLeft === "") {
                showSidePanel();
            } else {
                hideSidePanel();
            }
        };

        const activateQuickNavigation = () => {
            quickNavModeActive = true;
            currentQuickNavIndex = -1;
            const previouslySelected = uiElements.entriesListing.querySelector('.quick-selection');
            if (previouslySelected) removeCssClass(previouslySelected, 'quick-selection');
            doc.body.addEventListener('keypress', handleQuickNavigationKeys);
        };

        const deactivateQuickNavigation = () => {
            quickNavModeActive = false;
            currentQuickNavIndex = -1;
            const previouslySelected = uiElements.entriesListing.querySelector('.quick-selection');
            if (previouslySelected) removeCssClass(previouslySelected, 'quick-selection');
            doc.body.removeEventListener('keypress', handleQuickNavigationKeys);
        };

        const adjustQuickSelection = (newIndex) => {
            const listItems = uiElements.entriesListing.children;
            if (listItems.length === 0) return;

            if (currentQuickNavIndex !== -1 && listItems[currentQuickNavIndex]) {
                removeCssClass(listItems[currentQuickNavIndex], 'quick-selection');
            }

            if (newIndex >= 0 && newIndex < listItems.length) {
                currentQuickNavIndex = newIndex;
                addCssClass(listItems[currentQuickNavIndex], 'quick-selection');
            } else if (newIndex < 0) {
                currentQuickNavIndex = 0;
                addCssClass(listItems[currentQuickNavIndex], 'quick-selection');
            } else {
                currentQuickNavIndex = listItems.length - 1;
                addCssClass(listItems[currentQuickNavIndex], 'quick-selection');
            }
            if (listItems[currentQuickNavIndex] && listItems[currentQuickNavIndex].scrollIntoView) {
                listItems[currentQuickNavIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        };

        const handleGlobalKeyboardEvents = (e) => {
            if (e.ctrlKey) {
                switch (e.keyCode) {
                    case 83: // Ctrl+S
                        e.preventDefault();
                        mainApplication.saveCurrentContent();
                        break;
                    case 76: // Ctrl+L
                        e.preventDefault();
                        toggleSidePanelVisibility();
                        break;
                    case 68: // Ctrl+D
                        e.preventDefault();
                        mainApplication.deleteCurrentContent();
                        break;
                    case 78: // Ctrl+N
                        e.preventDefault();
                        mainApplication.openNewBlankContent();
                        break;
                }
            }
        };

        const handleQuickNavigationKeys = (e) => {
            const listItems = uiElements.entriesListing.children;
            if (listItems.length === 0) return;

            switch (e.keyCode) {
                case 106: // 'j' - down
                    e.preventDefault();
                    adjustQuickSelection(currentQuickNavIndex + 1);
                    break;
                case 107: // 'k' - up
                    e.preventDefault();
                    adjustQuickSelection(currentQuickNavIndex - 1);
                    break;
                case 111: // 'o' - open
                    e.preventDefault();
                    if (currentQuickNavIndex !== -1 && listItems[currentQuickNavIndex]) {
                        listItems[currentQuickNavIndex].click();
                    }
                    break;
            }
        };

        const handleEditorFocusEvent = () => {
            hideSidePanel();
            applyAnimation(uiElements.mainNavigation, { opacity: '0.3' }, 200);
        };

        const handleEditorBlurEvent = () => {
            applyAnimation(uiElements.mainNavigation, { opacity: '1.0' }, 200);
        };

        return {
            initiate: function() {
                uiElements.mainNavigation = retrieveElementByClass('navbar-default');
                uiElements.sidePanel = retrieveElementById('sidebar');
                uiElements.entriesListing = retrieveElementById('draftsList');
                uiElements.titleInput = retrieveElementById('title');
                uiElements.bodyInput = retrieveElementById('body');
                uiElements.notificationDisplay = retrieveElementById('notice');
                uiElements.previewArea = retrieveElementById('preview');
                uiElements.previewTitleArea = retrieveElementById('preview-title');
                uiElements.previewBodyArea = retrieveElementById('preview-body');

                uiElements.menuToggle = retrieveElementByClass('menuBar');
                uiElements.saveButton = retrieveElementById('saveBtn');
                uiElements.deleteButton = retrieveElementById('deleteBtn');
                uiElements.addButton = retrieveElementById('addBtn');
                uiElements.syncAction = retrieveElementById('syncBtn');

                cloudService.init();
                if (cloudService.isSignedIn()) {
                    contentVault.loadAll();
                    updateAuthButtonText();
                }

                doc.body.addEventListener('keydown', handleGlobalKeyboardEvents);
                uiElements.menuToggle.addEventListener('click', toggleSidePanelVisibility);
                uiElements.titleInput.addEventListener('keyup', updateContentPreview);
                uiElements.bodyInput.addEventListener('keyup', updateContentPreview);
                uiElements.titleInput.addEventListener('focus', handleEditorFocusEvent);
                uiElements.bodyInput.addEventListener('focus', handleEditorFocusEvent);
                uiElements.titleInput.addEventListener('blur', handleEditorBlurEvent);
                uiElements.bodyInput.addEventListener('blur', handleEditorBlurEvent);

                uiElements.saveButton.addEventListener('click', this.saveCurrentContent);
                uiElements.deleteButton.addEventListener('click', this.deleteCurrentContent);
                uiElements.addButton.addEventListener('click', this.openNewBlankContent);
                uiElements.syncAction.addEventListener('click', this.requestSync);

                eventHub.subscribe('entryAdded', (entry) => {
                    uiElements.entriesListing.prepend(generateListingItem(entry));
                    this.selectContentItem(entry.identifier);
                });
                eventHub.subscribe('entryUpdated', (entry) => {
                    const existingItem = uiElements.entriesListing.querySelector(`[data-record-id="${entry.identifier}"]`);
                    if (existingItem) {
                        existingItem.querySelector('a').textContent = _.escape(entry.titleContent || 'Untitled');
                    }
                    this.selectContentItem(entry.identifier);
                });
                eventHub.subscribe('entryRemoved', (id) => {
                    const itemToRemove = uiElements.entriesListing.querySelector(`[data-record-id="${id}"]`);
                    if (itemToRemove) itemToRemove.remove();
                    this.openNewBlankContent();
                });
                eventHub.subscribe('allEntriesLoaded', () => {
                    displayAllEntries();
                    const firstEntry = contentVault.getAll()[0];
                    if (firstEntry) {
                        this.selectContentItem(firstEntry.identifier);
                    } else {
                        this.openNewBlankContent();
                    }
                });
                eventHub.subscribe('currentIdentifierChanged', (id) => {
                    const allItems = retrieveAllElementsByClass('list-entry-item');
                    allItems.forEach(item => {
                        if (item.dataset.recordId === id) {
                            addCssClass(item, 'active-selection');
                        } else {
                            removeCssClass(item, 'active-selection');
                        }
                    });
                    const currentEntryData = contentVault.getOne(id);
                    populateEditorFields(currentEntryData);
                });

                displayAllEntries();
                updateContentPreview();
                this.openNewBlankContent();
            },

            requestLogout: function() {
                cloudService.revokeAccess();
            },

            requestSync: function() {
                if (!cloudService.isSignedIn()) {
                    cloudService.obtainAccess();
                } else {
                    showTemporaryNotification("Already signed in.");
                }
            },

            saveCurrentContent: function() {
                const data = retrieveEditorContents();
                const currentId = contentVault.getCurrentIdentifier();
                if (currentId) {
                    data.identifier = currentId;
                }
                const result = contentVault.addOrUpdate(data);
                showTemporaryNotification(result.message);
            },

            deleteCurrentContent: function() {
                const currentId = contentVault.getCurrentIdentifier();
                if (currentId) {
                    if (win.confirm("Confirm deletion?")) {
                        contentVault.remove(currentId);
                        showTemporaryNotification("Content deleted.");
                    }
                } else {
                    showTemporaryNotification("No content selected to delete.");
                }
            },

            openNewBlankContent: function() {
                hideSidePanel();
                populateEditorFields(null);
                uiElements.titleInput.focus();
                contentVault.clearCurrentIdentifier();
                showTemporaryNotification("New content started.");
            },

            selectContentItem: function(id) {
                hideSidePanel();
                contentVault.setCurrentIdentifier(id);
            }
        };
    })();

    doc.addEventListener('DOMContentLoaded', mainApplication.initiate);

})(document, window, _, marked);