// --- Core Utilities ---

// Custom event system to replace Backbone.Events
class ActionEmitter {
    constructor() {
        this.observers = new Map();
    }

    register(eventSymbol, handlerFunction) {
        if (!this.observers.has(eventSymbol)) {
            this.observers.set(eventSymbol, new Set());
        }
        this.observers.get(eventSymbol).add(handlerFunction);
    }

    deregister(eventSymbol, handlerFunction) {
        if (this.observers.has(eventSymbol)) {
            this.observers.get(eventSymbol).delete(handlerFunction);
        }
    }

    broadcast(eventSymbol, ...payload) {
        if (this.observers.has(eventSymbol)) {
            this.observers.get(eventSymbol).forEach(handler => {
                try {
                    handler(...payload);
                } catch (err) {
                    console.error(`Issue in event handler for ${eventSymbol}:`, err);
                }
            });
        }
    }
}

// Function to delay execution (debounce for search)
function throttleOperation(operationFunc, delayTime) {
    let timerId;
    return function(...args) {
        const currentContext = this;
        clearTimeout(timerId);
        timerId = setTimeout(() => operationFunc.apply(currentContext, args), delayTime);
    };
}

// --- Data Communication Service (replaces $.ajax calls) ---
class WebService {
    constructor(routePrefix = '') {
        this.prefix = routePrefix;
    }

    async submitQuery(pathSegment, requestMethod = 'GET', dataBody = null) {
        const requestOptions = {
            method: requestMethod,
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                'Accept': 'application/json'
            },
        };

        if (dataBody) {
            requestOptions.body = JSON.stringify(dataBody);
        }

        try {
            const serverResponse = await fetch(`${this.prefix}${pathSegment}`, requestOptions);
            if (!serverResponse.ok) {
                const errorInfo = await serverResponse.text();
                throw new Error(`Server request failed! Code: ${serverResponse.status}, Details: ${errorInfo}`);
            }
            return serverResponse.json();
        } catch (queryError) {
            console.error("Data communication failure:", queryError);
            throw queryError;
        }
    }

    async fetchItemData() {
        return this.submitQuery('products');
    }

    async fetchBranchData() {
        return this.submitQuery('branches');
    }

    async sendPendingActions(actionsPayload) {
        return this.submitQuery('process_queue', 'POST', actionsPayload);
    }

    async addAllItemsToBranch(branchNameKey) {
        return this.submitQuery(`add_all/${encodeURIComponent(branchNameKey)}`, 'POST');
    }

    async deleteBranchEntry(branchNameKey) {
        return this.submitQuery(`delete_branch/${encodeURIComponent(branchNameKey)}`, 'POST');
    }

    async replicateAppleBranch(targetBranchNameKey) {
        return this.submitQuery(`dup_apple/${encodeURIComponent(targetBranchNameKey)}`, 'POST');
    }

    async duplicateBranchContent(sourceBranchNameKey, destinationBranchNameKey) {
        return this.submitQuery(`dup/${encodeURIComponent(sourceBranchNameKey)}/${encodeURIComponent(destinationBranchNameKey)}`, 'POST');
    }

    async createNewBranchEntry(branchNameKey) {
        return this.submitQuery(`new_branch/${encodeURIComponent(branchNameKey)}`, 'POST');
    }
}

// --- Application Data Management (replaces Backbone.Collections/Models) ---
class CatalogManager extends ActionEmitter {
    constructor(networkGateway) {
        super();
        this.network = networkGateway;
        this.catalogItems = []; // Array of product objects
        this.queuedActions = new Map(); // Map for pending changes, keyed by a unique change ID
        this.displayOptions = { // Object for UI filter settings
            hideCommonEntries: true,
            searchQuery: '',
            availableBranchNames: [] // List of branch names
        };
        this.expandedItemDetails = new Set(); // Tracks product IDs with open details
    }

    async initializeCatalogData() {
        this.broadcast('appState:busy');
        try {
            const [productsResponse, branchesResponse] = await Promise.all([
                this.network.fetchItemData(),
                this.network.fetchBranchData()
            ]);

            this.displayOptions.availableBranchNames = branchesResponse.map(b => b.name);
            this.catalogItems = productsResponse.map(prod => {
                const enhancedProd = { ...prod,
                    hasQueuedChange: false
                };
                enhancedProd.branchInfo = branchesResponse.map(branch => ({
                    branchName: branch.name,
                    isListed: branch.products.includes(prod.id),
                    isQueuedForChange: false,
                }));
                return enhancedProd;
            });
            this.broadcast('data:catalogUpdated');
        } catch (error) {
            console.error("Failed to load initial catalog data:", error);
        } finally {
            this.broadcast('appState:ready');
        }
    }

    toggleProductBranchListing(itemId, branchIdentifier) {
        const itemRecord = this.catalogItems.find(p => p.id === itemId);
        if (!itemRecord) return;

        const branchRecord = itemRecord.branchInfo.find(b => b.branchName === branchIdentifier);
        if (!branchRecord) return;

        const changeKey = `${branchIdentifier}-${itemId}`;

        if (branchRecord.isQueuedForChange) {
            branchRecord.isQueuedForChange = false;
            this.queuedActions.delete(changeKey);
        } else {
            branchRecord.isQueuedForChange = true;
            this.queuedActions.set(changeKey, {
                actionId: changeKey,
                targetBranch: branchRecord.branchName,
                initialListingState: branchRecord.isListed,
                productId: itemId
            });
        }
        itemRecord.hasQueuedChange = this.queuedActions.size > 0;
        this.broadcast('item:listingChanged', itemRecord);
        this.broadcast('actions:queuedCountChanged', this.queuedActions.size);
    }

    toggleDisplayFilter(filterKey) {
        this.displayOptions[filterKey] = !this.displayOptions[filterKey];
        this.broadcast('data:filtersUpdated', this.displayOptions);
    }

    updateSearchQuery(termString) {
        this.displayOptions.searchQuery = termString;
        this.broadcast('data:filtersUpdated', this.displayOptions);
    }

    async commitAllPendingActions(completionCallback) {
        if (this.queuedActions.size === 0) {
            alert('No items are in the modification queue yet. Please make some adjustments to a branch first.');
            return;
        }

        this.broadcast('appState:busy');
        try {
            const pendingActionsArray = Array.from(this.queuedActions.values());
            await this.network.sendPendingActions(pendingActionsArray);
            this.queuedActions.clear();
            this.catalogItems.forEach(item => item.branchInfo.forEach(b => b.isQueuedForChange = false));
            this.catalogItems.forEach(item => item.hasQueuedChange = false);
            this.broadcast('actions:queuedCountChanged', 0);
            this.broadcast('appState:ready');
            if (completionCallback) completionCallback();
            await this.initializeCatalogData();
        } catch (error) {
            console.error("Failed to commit modifications:", error);
            this.broadcast('appState:ready');
            alert('Failed to apply changes. Refer to console for details.');
        }
    }

    async executeBranchOperation(operationType, mainBranchId, secondaryBranchId = null) {
        this.broadcast('appState:busy');
        try {
            switch (operationType) {
                case 'add_all_items':
                    await this.network.addAllItemsToBranch(mainBranchId);
                    break;
                case 'delete_branch':
                    if (!confirm(`Are you certain you wish to remove the branch "${mainBranchId}"? Confirm to proceed, Cancel to abort.`)) return;
                    await this.network.deleteBranchEntry(mainBranchId);
                    break;
                case 'replicate_apple':
                    if (!confirm(`Replication will overwrite branch "${mainBranchId}". Are you sure you want to do this? Confirm to replicate Apple direct branch, Cancel to abort.`)) return;
                    await this.network.replicateAppleBranch(mainBranchId);
                    break;
                case 'duplicate_from':
                    if (!confirm(`Duplication will overwrite branch "${mainBranchId}". Are you sure you want to do this? Confirm to duplicate "${secondaryBranchId}", Cancel to abort.`)) return;
                    await this.network.duplicateBranchContent(secondaryBranchId, mainBranchId);
                    break;
                case 'create_new':
                    await this.network.createNewBranchEntry(mainBranchId);
                    break;
                default:
                    throw new Error(`Unsupported branch operation: ${operationType}`);
            }
            this.broadcast('appState:ready');
            await this.initializeCatalogData();
        } catch (error) {
            console.error(`Branch operation "${operationType}" failed:`, error);
            this.broadcast('appState:ready');
            alert(`Failed to perform branch operation "${operationType}". Refer to console for details.`);
        }
    }

    toggleItemDetailsDisplay(itemId) {
        if (this.expandedItemDetails.has(itemId)) {
            this.expandedItemDetails.delete(itemId);
        } else {
            this.expandedItemDetails.add(itemId);
        }
        this.broadcast('item:detailsToggled', itemId);
    }
}

// --- UI Rendering Module (replaces Backbone.Marionette Views) ---
class ViewComposer extends ActionEmitter {
    constructor(displayRootElement, dataCoordinator) {
        super();
        this.displayRoot = displayRootElement;
        this.coordinator = dataCoordinator;
        this.domElements = {}; // Cache for specific DOM nodes

        this.setupBaseLayout();
        this.linkDataEvents();
        this.attachGlobalDomListeners();
    }

    setupBaseLayout() {
        this.displayRoot.innerHTML = `
            <div id="navigation-panel-area"></div>
            <div id="content-display-area"></div>
            <div id="branch-creation-form-area"></div>
        `;
        this.domElements.navPanel = this.displayRoot.querySelector('#navigation-panel-area');
        this.domElements.contentDisplay = this.displayRoot.querySelector('#content-display-area');
        this.domElements.branchCreationForm = this.displayRoot.querySelector('#branch-creation-form-area');
    }

    linkDataEvents() {
        this.coordinator.register('appState:busy', () => this.presentLoadingOverlay());
        this.coordinator.register('appState:ready', () => this.removeLoadingOverlay());
        this.coordinator.register('data:catalogUpdated', () => this.renderFullProductTable());
        this.coordinator.register('item:listingChanged', (item) => this.refreshProductRow(item));
        this.coordinator.register('actions:queuedCountChanged', (count) => this.updateCommitButtonDisplay(count));
        this.coordinator.register('data:filtersUpdated', () => {
            this.updateFilterToggleButtonDisplay(this.coordinator.displayOptions.hideCommonEntries);
            this.renderFullProductTable(); // Re-render table on filter change
        });
        this.coordinator.register('item:detailsToggled', (itemId) => this.toggleProductDetailsView(itemId));

        this.renderNavigationBar();
        this.renderNewBranchEntryForm();
    }

    attachGlobalDomListeners() {
        // Event delegation for general UI actions
        this.domElements.navPanel.addEventListener('click', (event) => {
            const targetElement = event.target;
            if (targetElement.matches('.commit-changes-btn')) {
                this.coordinator.commitAllPendingActions();
            } else if (targetElement.matches('.toggle-common-filter-btn')) {
                this.coordinator.toggleDisplayFilter('hideCommonEntries');
            }
        });

        // Event delegation for product table and branch controls
        this.domElements.contentDisplay.addEventListener('click', (event) => {
            const targetElement = event.target;
            const productLine = targetElement.closest('[data-product-identifier]');
            const branchControl = targetElement.closest('.branch-action-control');

            if (productLine) {
                const productId = parseInt(productLine.dataset.productIdentifier);
                if (targetElement.matches('.branch-status-btn')) {
                    const branchName = targetElement.dataset.branchKey;
                    this.coordinator.toggleProductBranchListing(productId, branchName);
                } else if (targetElement.matches('.info-display-toggle')) {
                    this.coordinator.toggleItemDetailsDisplay(productId);
                }
            } else if (branchControl) {
                const actionType = branchControl.dataset.actionType;
                const branchKey = branchControl.dataset.branchKey;
                const secondaryKey = branchControl.dataset.secondaryBranchKey;
                if (actionType && branchKey) {
                    this.coordinator.executeBranchOperation(actionType, branchKey, secondaryKey);
                }
            }
        });

        // New branch form submission
        this.domElements.branchCreationForm.addEventListener('click', (event) => {
            if (event.target.matches('.initiate-new-branch-btn')) {
                const inputField = this.domElements.branchCreationForm.querySelector('.new-branch-input-field');
                const newBranchName = inputField.value.trim();
                if (newBranchName) {
                    this.coordinator.executeBranchOperation('create_new', newBranchName)
                        .then(() => inputField.value = '');
                }
            }
        });

        // Search input with debounce
        this.domElements.navPanel.addEventListener('input', throttleOperation((event) => {
            if (event.target.matches('.product-search-input')) {
                this.coordinator.updateSearchQuery(event.target.value);
            }
        }, 200));

        // Prevent form submission for search
        this.domElements.navPanel.addEventListener('submit', (event) => {
            if (event.target.matches('.search-form-element')) {
                event.preventDefault();
            }
        });
    }

    // --- Navigation Panel Components ---
    renderNavigationBar() {
        const {
            hideCommonEntries,
            searchQuery
        } = this.coordinator.displayOptions;
        const pendingCount = this.coordinator.queuedActions.size;

        this.domElements.navPanel.innerHTML = `
            <nav class="application-nav">
                <div class="nav-segment" id="commit-btn-slot">
                    ${this.generateCommitButtonHtml(pendingCount)}
                </div>
                <div class="nav-segment" id="filter-toggle-slot">
                    ${this.generateFilterToggleButtonHtml(hideCommonEntries)}
                </div>
                <div class="nav-segment" id="search-input-slot">
                    ${this.generateSearchInputHtml(searchQuery)}
                </div>
            </nav>
        `;
        // Re-cache specific slots after innerHTML update
        this.domElements.commitButtonSlot = this.domElements.navPanel.querySelector('#commit-btn-slot');
        this.domElements.filterToggleButtonSlot = this.domElements.navPanel.querySelector('#filter-toggle-slot');
        this.domElements.searchInputSlot = this.domElements.navPanel.querySelector('#search-input-slot');
    }

    generateCommitButtonHtml(count) {
        return `
            <a href="#" class="btn btn-primary commit-changes-btn ${count === 0 ? 'disabled-action' : ''}">
                <span class="badge badge-light">${count}</span> Pending Operations
            </a>
        `;
    }

    updateCommitButtonDisplay(count) {
        if (this.domElements.commitButtonSlot) {
            this.domElements.commitButtonSlot.innerHTML = this.generateCommitButtonHtml(count);
        }
    }

    generateFilterToggleButtonHtml(isCommonHidden) {
        return `
            <a href="#" class="btn btn-secondary toggle-common-filter-btn">
                ${isCommonHidden ? 'Display All' : 'Conceal Common'}
            </a>
        `;
    }

    updateFilterToggleButtonDisplay(isCommonHidden) {
        if (this.domElements.filterToggleButtonSlot) {
            this.domElements.filterToggleButtonSlot.innerHTML = this.generateFilterToggleButtonHtml(isCommonHidden);
        }
    }

    generateSearchInputHtml(currentText) {
        return `
            <form class="search-form-element">
                <input type="text" class="form-control product-search-input" placeholder="Search product names..." value="${currentText}">
            </form>
        `;
    }

    // --- Main Product Catalog Table ---
    renderFullProductTable() {
        const {
            catalogItems,
            displayOptions
        } = this.coordinator;
        const {
            hideCommonEntries,
            searchQuery,
            availableBranchNames
        } = displayOptions;

        const filteredCatalog = catalogItems.filter(item => {
            let shouldBeVisible = false;
            if (!hideCommonEntries || item.depr) {
                shouldBeVisible = true;
            } else {
                const listingStates = item.branchInfo.map(b => b.isListed);
                listingStates.push(!item.depr); // Treat deprecated as "unlisted" equivalent
                if (listingStates.includes(false)) {
                    shouldBeVisible = true;
                }
            }

            if (shouldBeVisible && searchQuery) {
                if (!item.title || !item.title.toLowerCase().includes(searchQuery.toLowerCase())) {
                    shouldBeVisible = false;
                }
            }
            return shouldBeVisible;
        });

        this.domElements.contentDisplay.innerHTML = `
            <table class="product-data-grid">
                <thead>
                    <tr>
                        <th class="info-cell"></th>
                        <th>Product Title</th>
                        ${availableBranchNames.map(branch => `
                            <th>
                                ${branch}
                                <div class="branch-menu-dropdown">
                                    <button class="btn btn-sm btn-light dropdown-trigger" type="button"></button>
                                    <ul class="dropdown-options">
                                        <li><a class="dropdown-option branch-action-control" href="#" data-action-type="add_all_items" data-branch-key="${branch}">Add All Products</a></li>
                                        <li><a class="dropdown-option branch-action-control" href="#" data-action-type="delete_branch" data-branch-key="${branch}">Remove Branch</a></li>
                                        <li><div class="dropdown-separator"></div></li>
                                        <li><a class="dropdown-option branch-action-control" href="#" data-action-type="replicate_apple" data-branch-key="${branch}">Replicate Apple Branch</a></li>
                                        ${availableBranchNames.filter(b => b !== branch).map(otherBranch => `
                                            <li><a class="dropdown-option branch-action-control" href="#" data-action-type="duplicate_from" data-branch-key="${branch}" data-secondary-branch-key="${otherBranch}">Duplicate From ${otherBranch}</a></li>
                                        `).join('')}
                                    </ul>
                                </div>
                            </th>
                        `).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${filteredCatalog.map(item => this.generateProductRowHtml(item)).join('')}
                </tbody>
            </table>
        `;
        this.activateDropdowns(); // Enable dropdown functionality
    }

    generateProductRowHtml(item) {
        const isDetailsOpen = this.coordinator.expandedItemDetails.has(item.id);
        const infoToggleClass = isDetailsOpen ? 'active' : '';

        return `
            <tr data-product-identifier="${item.id}" class="product-listing-row ${item.hasQueuedChange ? 'pending-action-highlight' : ''}">
                <td class="info-cell">
                    <button class="btn btn-sm info-display-toggle ${infoToggleClass}">i</button>
                </td>
                <td>${item.title || 'Untitled Product'}</td>
                ${item.branchInfo.map(branch => `
                    <td>
                        <button class="btn btn-sm branch-status-btn
                            ${branch.isQueuedForChange ? 'btn-warning' : (branch.isListed ? 'btn-success' : 'btn-danger')}"
                            data-branch-key="${branch.branchName}">
                            ${branch.isQueuedForChange ? 'Pending' : (branch.isListed ? 'Active' : 'Inactive')}
                        </button>
                    </td>
                `).join('')}
            </tr>
            ${isDetailsOpen ? this.generateProductDetailsRowHtml(item) : ''}
        `;
    }

    generateProductDetailsRowHtml(item) {
        const descriptionContent = item.description || 'No detailed description available.';
        return `
            <tr class="product-details-row" data-product-identifier="${item.id}">
                <td colspan="${this.coordinator.displayOptions.availableBranchNames.length + 2}">
                    <div class="details-content-panel">
                        <h4>Details for ${item.title || 'Untitled Product'}</h4>
                        <p>${descriptionContent}</p>
                    </div>
                </td>
            </tr>
        `;
    }

    refreshProductRow(item) {
        const existingRow = this.domElements.contentDisplay.querySelector(`tr[data-product-identifier="${item.id}"].product-listing-row`);
        if (existingRow) {
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = this.generateProductRowHtml(item);
            const updatedRow = tempContainer.firstElementChild;
            existingRow.replaceWith(updatedRow);

            // Re-check and re-render details row if it was open
            if (this.coordinator.expandedItemDetails.has(item.id)) {
                const existingDetailsRow = this.domElements.contentDisplay.querySelector(`tr[data-product-identifier="${item.id}"].product-details-row`);
                if (existingDetailsRow) {
                    existingDetailsRow.replaceWith(tempContainer.children[1]); // Assuming details row is second child
                } else {
                    updatedRow.after(tempContainer.children[1]);
                }
            }
        }
    }

    toggleProductDetailsView(itemId) {
        // Re-rendering the whole table is a simple way to handle this
        // as per Type IV; a more surgical DOM update would be more complex.
        this.renderFullProductTable();
    }

    // --- Loading State ---
    presentLoadingOverlay() {
        this.domElements.contentDisplay.innerHTML = `
            <div class="loading-feedback-area">
                <div class="loading-spinner-element">Loading...</div>
            </div>
        `;
    }

    removeLoadingOverlay() {
        // This is implicitly handled by `renderFullProductTable`
        // when `data:catalogUpdated` is broadcasted.
    }

    // --- New Branch Form ---
    renderNewBranchEntryForm() {
        this.domElements.branchCreationForm.innerHTML = `
            <div class="branch-creation-section">
                <h3>Establish New Branch</h3>
                <input type="text" class="form-control new-branch-input-field" placeholder="Enter new branch identifier">
                <button class="btn btn-primary mt-2 initiate-new-branch-btn">Create Branch</button>
            </div>
        `;
    }

    // Simple JS for dropdown activation (replaces Bootstrap/jQuery dropdowns)
    activateDropdowns() {
        this.domElements.contentDisplay.querySelectorAll('.branch-menu-dropdown').forEach(dropdown => {
            const trigger = dropdown.querySelector('.dropdown-trigger');
            const menu = dropdown.querySelector('.dropdown-options');

            if (trigger && menu) {
                trigger.addEventListener('click', (event) => {
                    event.preventDefault();
                    menu.classList.toggle('show-dropdown');
                });

                document.addEventListener('click', (event) => {
                    if (!dropdown.contains(event.target)) {
                        menu.classList.remove('show-dropdown');
                    }
                });
            }
        });
    }
}

// --- Application Bootstrapping ---
document.addEventListener('DOMContentLoaded', () => {
    const mainApplicationRoot = document.getElementById('application-container');
    if (!mainApplicationRoot) {
        console.error("Main application root element not found. Please ensure an element with id='application-container' exists.");
        return;
    }

    const communicationService = new WebService();
    const dataHub = new CatalogManager(communicationService);
    const userInterfaceManager = new ViewComposer(mainApplicationRoot, dataHub);

    dataHub.initializeCatalogData();
});