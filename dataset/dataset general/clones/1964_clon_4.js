const adjunctUtilities = {
    determineImportance(itemElement) {
        if (!itemElement || itemElement.priority === undefined) return 'Normal';
        return itemElement.priority > 5 ? 'Critical' : (itemElement.priority > 2 ? 'Significant' : 'Minor');
    },
    isPending(itemElement) {
        return itemElement && itemElement.status !== 'completed';
    },
    formatCalendarDate(inputDateString) {
        if (!inputDateString) return '';
        const yearValue = parseInt(inputDateString.substring(0, 4), 10);
        const monthValue = parseInt(inputDateString.substring(4, 6), 10) - 1;
        const dayValue = parseInt(inputDateString.substring(6, 8), 10);
        const dateInstance = new Date(Date.UTC(yearValue, monthValue, dayValue));
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(dateInstance);
    }
};

const networkOperator = {
    async sendRequest(resourcePath, requestMethod = 'GET', requestPayload = null) {
        const fetchOptions = {
            method: requestMethod,
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
            },
        };
        if (requestPayload) {
            fetchOptions.body = JSON.stringify(requestPayload);
        }

        const responseData = await fetch(resourcePath, fetchOptions);
        if (!responseData.ok) {
            const errorDetails = await responseData.json().catch(() => ({ message: 'Unknown network issue' }));
            throw new Error(`Data operation failed: ${responseData.status} - ${errorDetails.message || responseData.statusText}`);
        }
        return responseData.headers.get("content-type")?.includes("application/json") ? responseData.json() : responseData.text();
    }
};

class AppCentralStore {
    constructor() {
        this.appData = {
            items: [],
            collections: []
        };
        this.subscribers = [];
        this.currentSelection = null;
        this.isEditingMode = false;
        this.isNoteInputMode = false;
        this.newItemFormState = {};
        this.newNoteFormState = {};
        this.loadInitialData();
    }

    registerObserver(callbackFunction) {
        this.subscribers.push(callbackFunction);
    }

    notifyObservers() {
        this.subscribers.forEach(fn => fn(this.appData));
    }

    async loadInitialData() {
        try {
            this.appData.items = await networkOperator.sendRequest('/tasks');
            this.appData.collections = await networkOperator.sendRequest('/projects');
            this.notifyObservers();
        } catch (error) {
            console.error("Initial data loading error:", error);
        }
    }

    async refreshAllData() {
        console.info('Initiating data refresh...');
        await networkOperator.sendRequest('/tasks', 'PUT');
        setTimeout(async () => {
            try {
                this.appData.items = await networkOperator.sendRequest('/tasks');
                this.appData.collections = await networkOperator.sendRequest('/projects');
                this.notifyObservers();
            } catch (error) {
                console.error("Data refresh error:", error);
            }
        }, 1000);
    }
}

const globalDataStore = new AppCentralStore();

const navigationController = (() => {
    let activePathway = '';
    const pathwayRenderers = {};
    let initialPathway = '/item-view';

    const updateDisplay = () => {
        const hashPath = window.location.hash.substring(1) || initialPathway;

        if (pathwayRenderers[hashPath]) {
            if (activePathway) {
                const previousTabId = activePathway === '/table-display' ? 'data-display-tab' : 'item-display-tab';
                const previousTab = document.getElementById(previousTabId);
                if (previousTab) previousTab.classList.remove('active');
            }

            pathwayRenderers[hashPath]();
            activePathway = hashPath;

            const currentTabId = activePathway === '/table-display' ? 'data-display-tab' : 'item-display-tab';
            const currentTab = document.getElementById(currentTabId);
            if (currentTab) currentTab.classList.add('active');
        } else {
            console.warn('No handler for pathway:', hashPath);
            window.location.hash = initialPathway;
        }
    };

    const registerPathway = (path, renderer) => {
        pathwayRenderers[path] = renderer;
    };

    const startNavigation = (defaultPath) => {
        initialPathway = defaultPath;
        window.addEventListener('hashchange', updateDisplay);
        updateDisplay();
    };

    return { registerPathway, startNavigation, navigateTo: (path) => { window.location.hash = path; } };
})();


function renderItemListing(containerElement) {
    const currentData = globalDataStore.appData;
    const selectedItem = globalDataStore.currentSelection;
    const inEditing = globalDataStore.isEditingMode;
    const inNoteAdding = globalDataStore.isNoteInputMode;
    const newItemInput = globalDataStore.newItemFormState;
    const newNoteInput = globalDataStore.newNoteFormState;

    containerElement.innerHTML = '';

    const listContainer = document.createElement('div');
    listContainer.id = 'item-listing-area';
    currentData.items.forEach(itemEntry => {
        const itemDiv = document.createElement('div');
        itemDiv.id = itemEntry.uuid;
        itemDiv.className = 'item-record' + (selectedItem && selectedItem.uuid === itemEntry.uuid ? ' active' : '');
        itemDiv.innerHTML = `
            <span class="item-description">${itemEntry.description}</span>
            <span class="item-priority-label">${adjunctUtilities.determineImportance(itemEntry)}</span>
            <span class="item-date-label">${adjunctUtilities.formatCalendarDate(itemEntry.dueDate)}</span>
            ${adjunctUtilities.isPending(itemEntry) ? '<span class="item-status-pending">Pending</span>' : '<span class="item-status-completed">Finished</span>'}
        `;
        itemDiv.addEventListener('click', () => {
            if (globalDataStore.currentSelection === itemEntry) {
                globalDataStore.currentSelection = null;
            } else {
                globalDataStore.currentSelection = itemEntry;
            }
            globalDataStore.isEditingMode = false;
            globalDataStore.isNoteInputMode = false;
            renderItemListing(containerElement);
        });
        listContainer.appendChild(itemDiv);
    });
    containerElement.appendChild(listContainer);

    if (selectedItem) {
        const detailsPanel = document.createElement('div');
        detailsPanel.className = 'item-details-panel';
        detailsPanel.innerHTML = `
            <h3>Chosen Item: ${selectedItem.description}</h3>
            <button id="alter-record-button">&#x270e; ${inEditing ? 'cancel' : 'modify'}</button>
            <button id="add-remark-button">Add Remark</button>
            <button id="complete-record-button">Mark Complete</button>
            <button id="remove-record-button">Remove</button>
        `;
        containerElement.appendChild(detailsPanel);

        document.getElementById('alter-record-button').addEventListener('click', () => {
            globalDataStore.isEditingMode = !globalDataStore.isEditingMode;
            renderItemListing(containerElement);
        });
        document.getElementById('add-remark-button').addEventListener('click', () => {
            globalDataStore.isNoteInputMode = !globalDataStore.isNoteInputMode;
            renderItemListing(containerElement);
        });
        document.getElementById('complete-record-button').addEventListener('click', async () => {
            try {
                await networkOperator.sendRequest(`/tasks/${selectedItem.uuid}`, 'POST');
                globalDataStore.currentSelection = null;
                globalDataStore.refreshAllData();
            } catch (error) {
                console.error("Completion marking failed:", error);
            }
        });
        document.getElementById('remove-record-button').addEventListener('click', async () => {
            try {
                await networkOperator.sendRequest(`/tasks/${selectedItem.uuid}`, 'DELETE');
                globalDataStore.currentSelection = null;
                globalDataStore.refreshAllData();
                console.log("Record deleted successfully");
            } catch (error) {
                console.error("Record deletion failed:", error);
            }
        });

        if (inEditing) {
            const editForm = document.createElement('div');
            editForm.className = 'record-editing-form';
            editForm.innerHTML = `
                <label>Summary: <input type="text" id="edited-summary" value="${selectedItem.description}"></label><br>
                <label>Category: <input type="text" id="edited-category" value="${selectedItem.project || ''}"></label><br>
                <label>Weight: <input type="number" id="edited-weight" value="${selectedItem.priority || 0}"></label><br>
                <button id="submit-edits">Save Edits</button>
            `;
            containerElement.appendChild(editForm);

            document.getElementById('submit-edits').addEventListener('click', async () => {
                const newSummary = document.getElementById('edited-summary').value;
                const newCategory = document.getElementById('edited-category').value;
                const newWeight = parseInt(document.getElementById('edited-weight').value, 10);

                if (newSummary) {
                    const payloadUpdate = { description: newSummary, project: newCategory, priority: newWeight };
                    try {
                        await networkOperator.sendRequest(`/tasks/${selectedItem.uuid}`, 'PUT', payloadUpdate);
                        console.log('Record modification successful!');
                        globalDataStore.isEditingMode = false;
                        globalDataStore.refreshAllData();
                    } catch (error) {
                        console.error("Record modification failed:", error);
                    }
                } else {
                    document.getElementById('edited-summary').classList.add('validation-error');
                }
            });
        }

        if (inNoteAdding) {
            const noteForm = document.createElement('div');
            noteForm.className = 'remark-entry-form';
            noteForm.innerHTML = `
                <label>Remark: <textarea id="new-remark-content">${newNoteInput.description || ''}</textarea></label><br>
                <button id="submit-remark">Add Remark</button>
            `;
            containerElement.appendChild(noteForm);

            document.getElementById('new-remark-content').addEventListener('input', (e) => {
                globalDataStore.newNoteFormState.description = e.target.value;
            });

            document.getElementById('submit-remark').addEventListener('click', async () => {
                const remarkText = globalDataStore.newNoteFormState.description;
                if (remarkText) {
                    try {
                        await networkOperator.sendRequest(`tasks/${selectedItem.uuid}/annotate`, 'POST', { annotation: remarkText });
                        console.log('Remark added successfully');
                        globalDataStore.isNoteInputMode = false;
                        globalDataStore.newNoteFormState = {};
                        globalDataStore.refreshAllData();
                    } catch (error) {
                        console.error("Remark addition failed:", error);
                    }
                }
            });
        }
    }

    const addNewFormDiv = document.createElement('div');
    addNewFormDiv.className = 'new-item-form-section';
    addNewFormDiv.innerHTML = `
        <h3>Create New Item</h3>
        <label>Summary: <input type="text" id="new-item-summary" value="${newItemInput.description || ''}"></label><br>
        <label>Category: <input type="text" id="new-item-category" value="${newItemInput.project || ''}"></label><br>
        <label>Weight: <input type="number" id="new-item-weight" value="${newItemInput.priority || 0}"></label><br>
        <button id="submit-new-item">Create Item</button>
    `;
    containerElement.appendChild(addNewFormDiv);

    document.getElementById('new-item-summary').addEventListener('input', (e) => {
        globalDataStore.newItemFormState.description = e.target.value;
        if (e.target.value) {
            e.target.classList.remove('validation-error');
        }
    });
    document.getElementById('new-item-category').addEventListener('input', (e) => {
        globalDataStore.newItemFormState.project = e.target.value;
    });
    document.getElementById('new-item-weight').addEventListener('input', (e) => {
        globalDataStore.newItemFormState.priority = parseInt(e.target.value, 10);
    });

    document.getElementById('submit-new-item').addEventListener('click', async () => {
        const itemSummary = globalDataStore.newItemFormState.description;
        const itemCategory = globalDataStore.newItemFormState.project;
        const itemWeight = globalDataStore.newItemFormState.priority;

        if (itemSummary) {
            const submissionData = { description: itemSummary, project: itemCategory, priority: itemWeight };
            try {
                await networkOperator.sendRequest('/tasks', 'POST', submissionData);
                globalDataStore.newItemFormState = {};
                globalDataStore.refreshAllData();
            } catch (error) {
                console.error("New item creation failed:", error);
            }
        } else {
            document.getElementById('new-item-summary').classList.add('validation-error');
        }
    });
}

function renderTabularView(containerElement) {
    const currentData = globalDataStore.appData;
    containerElement.innerHTML = '';

    const dataTable = document.createElement('table');
    dataTable.innerHTML = `
        <thead>
            <tr>
                <th>Summary</th>
                <th>Category</th>
                <th>Weighting</th>
                <th>Status</th>
                <th>Due Calendar Date</th>
            </tr>
        </thead>
        <tbody>
            ${currentData.items.map(itemEntry => `
                <tr>
                    <td>${itemEntry.description}</td>
                    <td>${itemEntry.project || 'Unassigned'}</td>
                    <td>${adjunctUtilities.determineImportance(itemEntry)}</td>
                    <td>${adjunctUtilities.isPending(itemEntry) ? 'Pending' : 'Completed'}</td>
                    <td>${adjunctUtilities.formatCalendarDate(itemEntry.dueDate)}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
    containerElement.appendChild(dataTable);
}

const applicationOrchestrator = (() => {
    const mainAppContainer = document.createElement('div');
    mainAppContainer.id = 'primary-application-entry';
    document.body.appendChild(mainAppContainer);

    const setupAppHeader = () => {
        const appHeader = document.createElement('header');
        appHeader.innerHTML = `
            <nav>
                <ul id="main-navigation-links">
                    <li id="item-display-tab"><a href="#/item-view">Item Display</a></li>
                    <li id="data-display-tab"><a href="#/table-display">Data Display</a></li>
                </ul>
            </nav>
            <button id="revert-last-action">Revert Recent</button>
            <button id="reload-all-items">Reload All</button>
        `;
        mainAppContainer.appendChild(appHeader);

        document.getElementById('revert-last-action').addEventListener('click', async () => {
            try {
                await networkOperator.sendRequest('/undo', 'POST');
                globalDataStore.refreshAllData();
            } catch (error) {
                console.error("Undo operation failed:", error);
            }
        });
        document.getElementById('reload-all-items').addEventListener('click', () => globalDataStore.refreshAllData());
    };

    const setupAppViews = () => {
        const itemViewSection = document.createElement('section');
        itemViewSection.id = 'item-view-section';
        mainAppContainer.appendChild(itemViewSection);

        const tableViewSection = document.createElement('section');
        tableViewSection.id = 'table-view-section';
        mainAppContainer.appendChild(tableViewSection);

        navigationController.registerPathway('/item-view', () => {
            itemViewSection.style.display = 'block';
            tableViewSection.style.display = 'none';
            renderItemListing(itemViewSection);
        });
        navigationController.registerPathway('/table-display', () => {
            tableViewSection.style.display = 'block';
            itemViewSection.style.display = 'none';
            renderTabularView(tableViewSection);
        });

        navigationController.startNavigation('/item-view');
    };

    const initializeApplication = () => {
        setupAppHeader();
        setupAppViews();
        globalDataStore.registerObserver(() => {
            const currentHashPath = window.location.hash.substring(1) || '/item-view';
            navigationController.navigateTo(currentHashPath);
        });
    };

    return { initializeApplication };
})();

applicationOrchestrator.initializeApplication();