const globalApplicationState = {};

// Service for data persistence, replaces 'todoDb' factory
globalApplicationState.dataRepository = (function() {
    const databaseHandle = new PouchDB('job_assignments'); // Renamed database
    return {
        // Renamed from 'get'
        retrieveItem: (identifier) => databaseHandle.get(identifier),
        // Renamed from 'post'
        storeItem: (entry) => databaseHandle.post(entry),
        // Renamed from 'put'
        updateItem: (entry, currentRevision) => databaseHandle.put(entry, currentRevision),
        // Renamed from 'remove'
        deleteItem: (entry) => databaseHandle.remove(entry),
        // Renamed from 'changes'
        observeDataChanges: (callback) => {
            databaseHandle.changes({
                live: true,
                include_docs: true // Get the full document directly in the change object
            }).on('change', (modification) => {
                callback(modification);
            }).on('error', (issue) => {
                console.error("Data repository error:", issue);
            });
        },
        // Expose for initial load
        getAllItems: () => databaseHandle.allDocs({ include_docs: true })
    };
})();

// Centralized state management, replaces $scope.tasks and $scope.$apply
globalApplicationState.stateManager = (function() {
    let currentAssignmentList = [];
    const stateObservers = [];

    const notifyObservers = () => {
        stateObservers.forEach(fn => fn([...currentAssignmentList])); // Pass a copy
    };

    return {
        // Renamed from 'getWorkItems' or similar
        getAssignments: () => [...currentAssignmentList],

        // Renamed from 'updateWorkItems'
        setAssignments: (newCollection) => {
            currentAssignmentList = newCollection;
            notifyObservers();
        },

        // Renamed from 'addWorkItem'
        addAssignment: (item) => {
            currentAssignmentList = [...currentAssignmentList, item];
            notifyObservers();
        },

        // Renamed from 'removeWorkItem'
        removeAssignment: (itemId) => {
            currentAssignmentList = currentAssignmentList.filter(item => item._id !== itemId);
            notifyObservers();
        },

        // Renamed from 'modifyWorkItem'
        modifyAssignment: (modifiedItem) => {
            currentAssignmentList = currentAssignmentList.map(item =>
                item._id === modifiedItem._id ? modifiedItem : item
            );
            notifyObservers();
        },

        // Renamed from 'registerObserver'
        subscribeToState: (callback) => {
            stateObservers.push(callback);
        }
    };
})();

// UI components and interaction logic, replaces TodoCtrl, $ionicModal, $ionicPopup, $ionicListDelegate
globalApplicationState.interfaceController = (function(stateManager, dataRepository) {
    const domElements = {
        assignmentDisplayArea: document.getElementById('assignment-list-area'),
        modalContainer: document.getElementById('dialog-overlay'),
        modalContentArea: document.getElementById('dialog-content'),
        promptContainer: document.getElementById('input-prompt-overlay'),
        promptInputControl: document.getElementById('prompt-input-field'),
        promptConfirmButton: document.getElementById('prompt-confirm-button'),
        promptCancelButton: document.getElementById('prompt-cancel-button'),
        promptTitleDisplay: document.getElementById('prompt-title-text'),
        addNewButton: document.getElementById('add-new-assignment-button')
    };

    // Utility for creating DOM elements
    const generateElement = (tag, classes = [], attributes = {}, content = '') => {
        const el = document.createElement(tag);
        if (classes.length) el.className = classes.join(' ');
        for (const key in attributes) {
            el.setAttribute(key, attributes[key]);
        }
        if (content) el.textContent = content;
        return el;
    };

    // Custom Modal implementation, replaces $ionicModal
    const modalService = {
        show: (contentElement, onCloseCallback) => {
            domElements.modalContentArea.innerHTML = '';
            domElements.modalContentArea.appendChild(contentElement);
            domElements.modalContainer.style.display = 'flex';
            modalService.onCloseCallback = onCloseCallback;
        },
        hide: () => {
            domElements.modalContainer.style.display = 'none';
            if (modalService.onCloseCallback) modalService.onCloseCallback();
            modalService.onCloseCallback = null;
        }
    };

    // Custom Prompt implementation, replaces $ionicPopup.prompt
    const promptService = {
        displayPrompt: (label, initialValue) => {
            return new Promise((resolve) => {
                const handleConfirm = () => {
                    domElements.promptContainer.style.display = 'none';
                    resolve(domElements.promptInputControl.value);
                    cleanupListeners();
                };
                const handleCancel = () => {
                    domElements.promptContainer.style.display = 'none';
                    resolve(null);
                    cleanupListeners();
                };

                const cleanupListeners = () => {
                    domElements.promptConfirmButton.removeEventListener('click', handleConfirm);
                    domElements.promptCancelButton.removeEventListener('click', handleCancel);
                };

                domElements.promptTitleDisplay.textContent = label;
                domElements.promptInputControl.value = initialValue;
                domElements.promptInputControl.focus();

                domElements.promptConfirmButton.addEventListener('click', handleConfirm);
                domElements.promptCancelButton.addEventListener('click', handleCancel);

                domElements.promptContainer.style.display = 'flex';
            });
        }
    };

    // Main rendering logic, called when state changes
    const renderAssignmentList = (assignments) => {
        if (!domElements.assignmentDisplayArea) {
            console.error("Assignment list display area not found!");
            return;
        }
        domElements.assignmentDisplayArea.innerHTML = ''; // Clear previous entries

        // Functional approach to rendering list items
        assignments.forEach(item => {
            const assignmentEntry = generateElement('li', ['assignment-entry', item.completed ? 'finished' : '']);
            assignmentEntry.setAttribute('data-item-id', item._id);

            const statusToggle = generateElement('input', [], { type: 'checkbox', checked: item.completed });
            statusToggle.addEventListener('change', () => operationHandler.toggleCompletionStatus(item._id));

            const descriptionText = generateElement('span', ['assignment-description'], {}, item.title);
            descriptionText.addEventListener('click', () => operationHandler.reviseDescription(item._id));

            const deleteAction = generateElement('button', ['delete-action'], {}, 'Remove');
            deleteAction.addEventListener('click', (e) => {
                e.stopPropagation();
                operationHandler.removeAssignmentEntry(item._id);
            });

            const editAction = generateElement('button', ['edit-action'], {}, 'Modify');
            editAction.addEventListener('click', (e) => {
                e.stopPropagation();
                operationHandler.reviseDescription(item._id);
            });

            assignmentEntry.appendChild(statusToggle);
            assignmentEntry.appendChild(descriptionText);
            assignmentEntry.appendChild(editAction);
            assignmentEntry.appendChild(deleteAction);
            domElements.assignmentDisplayArea.appendChild(assignmentEntry);
        });
    };

    // Application logic, replaces functions in TodoCtrl
    const operationHandler = {
        // Renamed from 'completionChanged'
        toggleCompletionStatus: async (itemId) => {
            const currentAssignments = stateManager.getAssignments();
            const targetAssignment = currentAssignments.find(item => item._id === itemId);
            if (!targetAssignment) return;

            const updatedAssignment = { ...targetAssignment, completed: !targetAssignment.completed };
            await operationHandler.persistModifiedAssignment(updatedAssignment);
        },

        // Renamed from 'update'
        persistModifiedAssignment: async (record) => {
            try {
                const existingRecord = await dataRepository.retrieveItem(record._id);
                const result = await dataRepository.updateItem({ ...record, _rev: existingRecord._rev }, existingRecord._rev);
                stateManager.modifyAssignment({ ...record, _rev: result.rev }); // Optimistic UI update
            } catch (err) {
                console.error("Failed to persist modified assignment:", err);
            }
        },

        // Renamed from 'delete'
        removeAssignmentEntry: async (itemId) => {
            try {
                const recordToRemove = await dataRepository.retrieveItem(itemId);
                await dataRepository.deleteItem(recordToRemove);
                stateManager.removeAssignment(itemId); // Optimistic UI update
            } catch (err) {
                console.error("Failed to remove assignment entry:", err);
            }
        },

        // Renamed from 'editTitle'
        reviseDescription: async (itemId) => {
            const currentAssignments = stateManager.getAssignments();
            const targetAssignment = currentAssignments.find(item => item._id === itemId);
            if (!targetAssignment) return;

            const newDescription = await promptService.displayPrompt('Change assignment description:', targetAssignment.title);
            if (newDescription !== null && newDescription !== targetAssignment.title) {
                const updatedAssignment = { ...targetAssignment, title: newDescription };
                await operationHandler.persistModifiedAssignment(updatedAssignment);
            }
        },

        // Renamed from 'createTask' and 'newTask' combined
        showAssignmentCreationForm: () => {
            const formContainer = generateElement('div');
            formContainer.innerHTML = `
                <h3>New Assignment Details</h3>
                <form id="assignment-entry-form">
                    <input type="text" id="assignment-title-input" placeholder="Enter assignment title" required>
                    <button type="submit">Add Assignment</button>
                    <button type="button" id="cancel-assignment-button">Cancel</button>
                </form>
            `;
            const titleInput = formContainer.querySelector('#assignment-title-input');
            const formElement = formContainer.querySelector('#assignment-entry-form');
            const cancelButton = formContainer.querySelector('#cancel-assignment-button');

            const handleFormSubmission = async (e) => {
                e.preventDefault();
                const title = titleInput.value.trim();
                if (!title) return;

                const newItem = { title: title, completed: false };
                try {
                    const result = await dataRepository.storeItem(newItem);
                    stateManager.addAssignment({ ...newItem, _id: result.id, _rev: result.rev }); // Optimistic update
                    modalService.hide();
                } catch (err) {
                    console.error("Failed to store new assignment:", err);
                }
            };

            formElement.addEventListener('submit', handleFormSubmission);
            cancelButton.addEventListener('click', modalService.hide);

            modalService.show(formContainer, () => {
                // Clean up listeners when modal closes
                formElement.removeEventListener('submit', handleFormSubmission);
                cancelButton.removeEventListener('click', modalService.hide);
            });
            titleInput.focus();
        }
    };

    return {
        // Initialization function, replaces angular.module.controller setup
        startup: () => {
            // Subscribe the rendering function to state changes
            stateManager.subscribeToState(renderAssignmentList);

            // Set up listener for PouchDB data changes
            dataRepository.observeDataChanges((modification) => {
                if (modification.deleted) {
                    stateManager.removeAssignment(modification.id);
                } else if (modification.doc) {
                    const existingAssignments = stateManager.getAssignments();
                    const itemExists = existingAssignments.some(item => item._id === modification.id);
                    if (itemExists) {
                        stateManager.modifyAssignment(modification.doc);
                    } else {
                        stateManager.addAssignment(modification.doc);
                    }
                }
            });

            // Load initial data from PouchDB
            dataRepository.getAllItems().then(result => {
                const items = result.rows.map(row => row.doc);
                stateManager.setAssignments(items);
            }).catch(err => {
                console.error("Failed to retrieve initial assignments:", err);
            });

            // Attach event listener for the 'Add New Assignment' button
            if (domElements.addNewButton) {
                domElements.addNewButton.addEventListener('click', operationHandler.showAssignmentCreationForm);
            }

            // Perform an initial render
            renderAssignmentList(stateManager.getAssignments());
        }
    };

})(globalApplicationState.stateManager, globalApplicationState.dataRepository);

// Application bootstrap, replaces angular.bootstrap
document.addEventListener('DOMContentLoaded', () => {
    // Expected minimal HTML structure:
    /*
    <div id="application-root">
        <h1>My Assignments</h1>
        <button id="add-new-assignment-button">Add New Assignment</button>
        <ul id="assignment-list-area"></ul>

        <!-- Modal/Dialog Overlay -->
        <div id="dialog-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); justify-content: center; align-items: center; z-index: 1000;">
            <div id="dialog-content" style="background: white; padding: 20px; border-radius: 8px; min-width: 300px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <!-- Dynamic modal content goes here -->
            </div>
        </div>

        <!-- Input Prompt Overlay -->
        <div id="input-prompt-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); justify-content: center; align-items: center; z-index: 1001;">
            <div style="background: white; padding: 20px; border-radius: 8px; min-width: 300px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h3 id="prompt-title-text"></h3>
                <input type="text" id="prompt-input-field" style="width: calc(100% - 20px); padding: 10px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 4px;">
                <button id="prompt-confirm-button" style="padding: 8px 15px; margin-right: 10px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Confirm</button>
                <button id="prompt-cancel-button" style="padding: 8px 15px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
            </div>
        </div>
    </div>
    */
    globalApplicationState.interfaceController.startup();
});