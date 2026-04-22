const coreDataHub = {
    activeApplicationProfile: null,
    currentCollectionDesignation: null,
    selectedEntityIdentifiers: new Set(),
    displayPageLength: 10,
    
    applicationChoices: [],
    currentlySelectedAppName: "Choose an Application",
    applicationDetailsRecord: null,
    primaryIdentifierField: null,
    chosenCollectionName: "",
    availableCollections: [],
    collectionAttributeDefinitions: null,
    displayEntitiesList: [],
    previousPageLinkURL: null,
    nextPageLinkURL: null,
    collectionSchemaDefinition: null,
    totalRecordCount: 0
};

const obtainCookieValue = (keyName) => {
    const namePattern = keyName + "=";
    const decodedCookies = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookies.split(';');
    for(let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i];
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(namePattern) === 0) {
            return cookie.substring(namePattern.length, cookie.length);
        }
    }
    return "";
};

const safeRequestMethods = new Set(["GET", "HEAD", "OPTIONS", "TRACE"]);
const checkSameOrigin = (url) => {
    const parser = document.createElement('a');
    parser.href = url;
    const loc = window.location;
    return parser.protocol === loc.protocol && parser.host === loc.host;
};

const getRequestHeaders = (method, targetUrl) => {
    const headers = {
        'Content-Type': 'application/json',
    };
    if (coreDataHub.applicationDetailsRecord && coreDataHub.applicationDetailsRecord.key) {
        headers['AppId'] = coreDataHub.applicationDetailsRecord.key;
    }
    if (!safeRequestMethods.has(method.toUpperCase()) && checkSameOrigin(targetUrl)) {
        const csrfToken = obtainCookieValue('csrftoken');
        if (csrfToken) {
            headers['X-CSRFToken'] = csrfToken;
        }
    }
    return headers;
};

const fetchResource = async (endpoint, options = {}) => {
    const requestOptions = {
        method: options.method || 'GET',
        headers: getRequestHeaders(options.method || 'GET', endpoint),
        ...options
    };
    
    try {
        const response = await fetch(endpoint, requestOptions);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Fetch operation failed:", error);
        alert("Operation could not be completed. Server Error!");
        throw error;
    }
};

const visualFeedbackManager = {
    loaderElement: null,
    initialize: (elementId) => {
        visualFeedbackManager.loaderElement = document.getElementById(elementId);
    },
    display: () => {
        if (visualFeedbackManager.loaderElement) {
            visualFeedbackManager.loaderElement.style.display = 'block';
        }
    },
    conceal: () => {
        if (visualFeedbackManager.loaderElement) {
            visualFeedbackManager.loaderElement.style.display = 'none';
        }
    }
};

const updateDisplayElement = (identifier, content, isHtml = false) => {
    const element = document.getElementById(identifier);
    if (element) {
        if (isHtml) element.innerHTML = content;
        else element.textContent = content;
    }
};

const manageClassAttribute = (identifier, classToManage, add = true) => {
    const element = document.getElementById(identifier);
    if (element) {
        if (add) element.classList.add(classToManage);
        else element.classList.remove(classToManage);
    }
};

const toggleElementVisibility = (identifier, show) => {
    const element = document.getElementById(identifier);
    if (element) {
        element.style.display = show ? '' : 'none';
    }
};

class DataPanelController {
    constructor() {
        this.initializeUIReferences();
        this.setupEventHandlers();
        this.loadInitialApplicationData();
        visualFeedbackManager.initialize("spinner");
    }

    initializeUIReferences() {
        this.fileUploadButton = document.getElementById("btn-file-upload");
        this.fileDownloadButton = document.getElementById("btn-file-download");
        this.deleteClassButton = document.getElementById("delete-class");
        this.deleteObjectsButton = document.getElementById("delete-objects");
        this.applicationListContainer = document.getElementById("app-list-container");
        this.collectionListTable = document.getElementById("classes-table");
        this.entityListTable = document.getElementById("obj-table");
        this.pageInformationDisplay = document.getElementById("page-info");
        this.paginationControls = document.getElementById("btn-paginator");
        this.previousPageButton = document.getElementById("prev-page-btn");
        this.nextPageButton = document.getElementById("next-page-btn");
    }

    setupEventHandlers() {
        this.fileUploadButton?.addEventListener("click", () => this.handleFileUploadAttempt());
        this.fileDownloadButton?.addEventListener("click", () => this.handleFileDownloadAttempt());
        this.deleteClassButton?.addEventListener("click", () => this.initiateCollectionRemoval());
        this.deleteObjectsButton?.addEventListener("click", () => this.initiateEntityRemoval());
        this.previousPageButton?.addEventListener("click", () => this.navigatePreviousPage());
        this.nextPageButton?.addEventListener("click", () => this.navigateNextPage());
    }

    async loadInitialApplicationData() {
        if (!coreDataHub.activeApplicationProfile) {
            updateDisplayElement("selected-app-display", coreDataHub.currentlySelectedAppName);
        } else {
            updateDisplayElement("selected-app-display", coreDataHub.activeApplicationProfile.name);
        }
        await this.refreshApplicationOptions();
    }

    handleFileUploadAttempt() {
        if (!coreDataHub.activeApplicationProfile) {
            alert("Please choose an application first");
            return false;
        }
    }

    handleFileDownloadAttempt() {
        if (!coreDataHub.activeApplicationProfile) {
            alert("Please choose an application first");
            return false;
        }
        if (!coreDataHub.currentCollectionDesignation) {
            alert("Please choose a collection first");
            return false;
        }
    }

    async refreshApplicationOptions() {
        visualFeedbackManager.display();
        try {
            const appData = await fetchResource("/api/v2/apps/");
            coreDataHub.applicationChoices = appData.results;
            this.renderApplicationOptions();
        } catch (error) {
            console.error("Failed to load applications:", error);
        } finally {
            visualFeedbackManager.conceal();
        }
    }

    renderApplicationOptions() {
        if (this.applicationListContainer) {
            this.applicationListContainer.innerHTML = '';
            coreDataHub.applicationChoices.forEach(app => {
                const appLink = document.createElement('a');
                appLink.href = "#";
                appLink.textContent = app.name;
                appLink.classList.add('app-item-link');
                appLink.dataset.appName = app.name;
                appLink.addEventListener('click', (event) => {
                    event.preventDefault();
                    this.activateApplicationProfile(app.name);
                });
                this.applicationListContainer.appendChild(appLink);
            });
        }
    }

    async activateApplicationProfile(appName) {
        coreDataHub.primaryIdentifierField = "";
        
        manageClassAttribute("delete-class", "disabled", true);
        manageClassAttribute("delete-objects", "disabled", true);

        coreDataHub.chosenCollectionName = "";
        coreDataHub.selectedEntityIdentifiers.clear();
        coreDataHub.collectionAttributeDefinitions = null;
        coreDataHub.currentlySelectedAppName = appName;
        coreDataHub.availableCollections = [];
        coreDataHub.displayEntitiesList = [];

        visualFeedbackManager.display();

        const selectedApp = coreDataHub.applicationChoices.find(app => app.name === appName);
        if (selectedApp) {
            coreDataHub.activeApplicationProfile = selectedApp;
            coreDataHub.applicationDetailsRecord = selectedApp;
        }
        updateDisplayElement("selected-app-display", appName);

        try {
            const collectionData = await fetchResource("/api/v2/classes/");
            coreDataHub.availableCollections = collectionData.results;
            this.renderCollectionList();
        } catch (error) {
            console.error("Failed to load collections:", error);
        } finally {
            visualFeedbackManager.conceal();
        }
    }

    renderCollectionList() {
        if (this.collectionListTable) {
            const tbody = this.collectionListTable.querySelector('tbody');
            if (tbody) {
                tbody.innerHTML = '';
                coreDataHub.availableCollections.forEach((cls, index) => {
                    const row = tbody.insertRow();
                    row.dataset.collectionName = cls;
                    row.addEventListener('click', () => this.chooseCollection(cls, index));
                    const cell = row.insertCell();
                    cell.textContent = cls;
                    if (coreDataHub.chosenCollectionName === cls) {
                        row.classList.add("checked");
                    }
                });
            }
        }
    }

    async chooseCollection(collectionId, rowIndex) {
        coreDataHub.chosenCollectionName = collectionId;
        coreDataHub.currentCollectionDesignation = collectionId;
        coreDataHub.displayEntitiesList = [];
        coreDataHub.selectedEntityIdentifiers.clear();

        visualFeedbackManager.display();

        manageClassAttribute("delete-class", "disabled", false);
        manageClassAttribute("delete-objects", "disabled", true);
        
        if (this.collectionListTable) {
            Array.from(this.collectionListTable.querySelectorAll('tbody tr')).forEach((row, idx) => {
                if (idx === rowIndex) {
                    row.classList.toggle("checked");
                } else {
                    row.classList.remove("checked");
                }
            });
        }

        try {
            const schemaData = await fetchResource(`/api/v2/classes/schema/${collectionId}/`);
            coreDataHub.collectionSchemaDefinition = schemaData;
            
            const entityData = await fetchResource(`/api/v2/classes/${collectionId}/`);
            coreDataHub.displayEntitiesList = entityData.results;
            coreDataHub.totalRecordCount = entityData.count;
            coreDataHub.previousPageLinkURL = entityData.previous;
            coreDataHub.nextPageLinkURL = entityData.next;

            this.processEntityFields();
            this.renderEntityList();
            this.updatePaginationDisplay();
            toggleElementVisibility("btn-paginator", true);
            
        } catch (error) {
            console.error("Failed to load collection data:", error);
        } finally {
            visualFeedbackManager.conceal();
        }
    }

    processEntityFields() {
        const uniqueFields = new Set();
        coreDataHub.displayEntitiesList.forEach(entity => {
            Object.keys(entity).forEach(field => uniqueFields.add(field));
        });
        coreDataHub.primaryIdentifierField = "_id";
        uniqueFields.delete("_id");
        coreDataHub.collectionAttributeDefinitions = Array.from(uniqueFields);
    }

    renderEntityList() {
        if (this.entityListTable) {
            const thead = this.entityListTable.querySelector('thead tr');
            const tbody = this.entityListTable.querySelector('tbody');
            if (thead && tbody) {
                thead.innerHTML = '';
                tbody.innerHTML = '';

                const idHeader = document.createElement('th');
                idHeader.textContent = coreDataHub.primaryIdentifierField;
                thead.appendChild(idHeader);
                coreDataHub.collectionAttributeDefinitions.forEach(field => {
                    const header = document.createElement('th');
                    header.textContent = field;
                    thead.appendChild(header);
                });

                coreDataHub.displayEntitiesList.forEach((entity, index) => {
                    const row = tbody.insertRow();
                    row.dataset.entityId = entity[coreDataHub.primaryIdentifierField];
                    row.addEventListener('click', () => this.toggleEntitySelection(entity[coreDataHub.primaryIdentifierField], index));
                    
                    if (coreDataHub.selectedEntityIdentifiers.has(entity[coreDataHub.primaryIdentifierField])) {
                        row.classList.add("checked");
                    }

                    const idCell = row.insertCell();
                    idCell.textContent = entity[coreDataHub.primaryIdentifierField];
                    coreDataHub.collectionAttributeDefinitions.forEach(field => {
                        const cell = row.insertCell();
                        cell.textContent = JSON.stringify(entity[field]);
                    });
                });
            }
        }
    }

    updatePaginationDisplay() {
        let startIdx = 0;
        let endIdx = 0;
        
        if (coreDataHub.previousPageLinkURL === null) {
            startIdx = 1;
            endIdx = coreDataHub.displayEntitiesList.length;
        } else {
            const prevOffsetMatch = coreDataHub.previousPageLinkURL.match(/offset=(\d+)/);
            
            let prevOffsetValue = 0;
            if (prevOffsetMatch) {
                prevOffsetValue = parseInt(prevOffsetMatch[1], 10);
            }
            
            startIdx = prevOffsetValue + 1;
            endIdx = startIdx + coreDataHub.displayEntitiesList.length - 1;
        }

        const message = `Displaying records ${startIdx} to ${endIdx} of ${coreDataHub.totalRecordCount}`;
        updateDisplayElement("page-info", message);
    }

    async navigatePage(direction) {
        let targetUrl = null;
        if (direction === 'prev') {
            targetUrl = coreDataHub.previousPageLinkURL;
        } else if (direction === 'next') {
            targetUrl = coreDataHub.nextPageLinkURL;
        }

        if (!targetUrl) {
            return false;
        }

        visualFeedbackManager.display();
        coreDataHub.selectedEntityIdentifiers.clear();
        manageClassAttribute("delete-objects", "disabled", true);

        try {
            const entityData = await fetchResource(targetUrl);
            coreDataHub.displayEntitiesList = entityData.results;
            coreDataHub.totalRecordCount = entityData.count;
            coreDataHub.previousPageLinkURL = entityData.previous;
            coreDataHub.nextPageLinkURL = entityData.next;

            this.processEntityFields();
            this.renderEntityList();
            this.updatePaginationDisplay();
        } catch (error) {
            console.error(`Failed to navigate to ${direction} page:`, error);
        } finally {
            visualFeedbackManager.conceal();
        }
    }

    navigatePreviousPage() {
        this.navigatePage('prev');
    }

    navigateNextPage() {
        this.navigatePage('next');
    }

    toggleEntitySelection(entityUniqueId, entityRowIndex) {
        const row = this.entityListTable?.querySelector(`tbody tr:nth-child(${entityRowIndex + 1})`);
        if (!row) return;

        if (coreDataHub.selectedEntityIdentifiers.has(entityUniqueId)) {
            coreDataHub.selectedEntityIdentifiers.delete(entityUniqueId);
            row.classList.remove("checked");
        } else {
            coreDataHub.selectedEntityIdentifiers.add(entityUniqueId);
            row.classList.add("checked");
        }

        if (coreDataHub.selectedEntityIdentifiers.size > 0) {
            manageClassAttribute("delete-objects", "disabled", false);
        } else {
            manageClassAttribute("delete-objects", "disabled", true);
        }
    }

    async initiateCollectionRemoval() {
        if (!coreDataHub.currentCollectionDesignation) return;

        const confirmation = confirm("Warning: All objects within this collection will be permanently removed.\nAre you certain you wish to proceed with this collection's deletion?");
        if (!confirmation) return false;

        visualFeedbackManager.display();

        try {
            await fetchResource(`/api/v2/classes/${coreDataHub.currentCollectionDesignation}/`, {
                method: 'DELETE'
            });

            coreDataHub.availableCollections = coreDataHub.availableCollections.filter(
                col => col !== coreDataHub.currentCollectionDesignation
            );
            coreDataHub.collectionAttributeDefinitions = [];
            coreDataHub.displayEntitiesList = [];
            coreDataHub.chosenCollectionName = "";
            coreDataHub.currentCollectionDesignation = null;
            coreDataHub.primaryIdentifierField = null;
            coreDataHub.previousPageLinkURL = null;
            coreDataHub.nextPageLinkURL = null;
            coreDataHub.totalRecordCount = 0;

            this.renderCollectionList();
            this.renderEntityList();
            updateDisplayElement("page-info", "");
            toggleElementVisibility("btn-paginator", false);

            manageClassAttribute("delete-class", "disabled", true);
            manageClassAttribute("delete-objects", "disabled", true);

        } catch (error) {
            console.error("Failed to delete collection:", error);
        } finally {
            visualFeedbackManager.conceal();
        }
    }

    async initiateEntityRemoval() {
        if (!coreDataHub.currentCollectionDesignation || coreDataHub.selectedEntityIdentifiers.size === 0) return;

        const confirmation = confirm("Warning: All chosen records will be permanently removed.\nAre you certain you wish to proceed with this record deletion?");
        if (!confirmation) return false;

        visualFeedbackManager.display();
        let successfulDeletions = 0;
        const deletionPromises = Array.from(coreDataHub.selectedEntityIdentifiers).map(async (entityId) => {
            try {
                await fetchResource(`/api/v2/classes/${coreDataHub.currentCollectionDesignation}/${entityId}/`, {
                    method: 'DELETE'
                });
                successfulDeletions++;
            } catch (error) {
                console.error(`Failed to delete entity ${entityId}:`, error);
            }
        });

        await Promise.allSettled(deletionPromises);

        visualFeedbackManager.conceal();

        if (successfulDeletions > 0) {
            await this.chooseCollection(coreDataHub.currentCollectionDesignation, -1);
        } else {
            alert("No records were successfully deleted.");
        }
        
        coreDataHub.selectedEntityIdentifiers.clear();
        manageClassAttribute("delete-objects", "disabled", true);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new DataPanelController();
});