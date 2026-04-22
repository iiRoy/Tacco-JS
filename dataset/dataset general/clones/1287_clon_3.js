/* Core Application Management */

var CatalogManagerApp = new Backbone.Marionette.Application(); // Central application instance

/* Data Models and Collections */

// Collection for tracking pending catalog modifications
var PendingUpdates = Backbone.Collection.extend({
    model: Backbone.Model, // Each item in this collection is a simple Backbone Model
    url: 'process_queue', // Endpoint for saving changes

    // Custom method to persist all pending updates to the server
    persistChanges: function(completionCallback) {
        // Reference to the collection itself for use in async callbacks
        const selfCollection = this;
        // Determine if a callback function was provided
        const hasCallback = (typeof completionCallback === 'function');

        // Execute an AJAX POST request to the server
        $.ajax({
            type: 'POST', // HTTP method
            url: this.url, // Target URL
            data: JSON.stringify(this.toJSON()), // Convert collection data to JSON string
            dataType: 'json', // Expected response data type
            contentType: 'application/json; charset=UTF-8', // Request content type
            success: function(responsePayload) {
                // Execute the provided callback if it exists
                if (hasCallback) {
                    completionCallback(selfCollection, responsePayload);
                }
                // Optional: Add a console log for successful persistence
                console.info('Pending updates successfully processed.');
            },
            error: function(xhr, status, errorMsg) {
                console.error('Failed to persist updates:', status, errorMsg, xhr.responseText);
                // Optional: Trigger an application-level error event
                CatalogManagerApp.trigger('persistence:failed', { status, errorMsg });
            }
        });
    }
});

// Collection representing available product branches
var ProductBranches = Backbone.Collection.extend({
    model: Backbone.Model,
    url: 'branches' // Endpoint to fetch branch data
});

// Collection of products, enriched with branch information
var ProductList = Backbone.Collection.extend({
    model: Backbone.Model,
    url: 'products', // Endpoint for product data

    // Constructor override for initial setup
    initialize: function(initialModels, configOptions) {
        // Ensure configOptions is an object before accessing properties
        if (typeof configOptions === "object" && configOptions !== null && 'updateQueue' in configOptions) {
            this.updateQueue = configOptions.updateQueue;
        } else {
            // Fallback: create a new PendingUpdates collection if not provided
            this.updateQueue = new PendingUpdates();
            console.warn("ProductList initialized without an existing updateQueue. A new one was created.");
        }

        // Bind the 'sync' event to trigger fetching branch details
        this.on('sync', this.retrieveBranchDetails, this);
        // Add a custom property for tracking processing status
        this.isProcessingBranches = false;
    },

    // Fetches and integrates branch-specific data into each product model
    retrieveBranchDetails: function() {
        if (this.isProcessingBranches) {
            console.warn("Branch details retrieval already in progress. Skipping duplicate call.");
            return; // Prevent multiple simultaneous fetches
        }
        this.isProcessingBranches = true; // Set flag

        console.log(`ProductList: Contains ${this.length} items.`);

        const currentProductCollection = this; // Alias for use in nested callbacks

        // Asynchronous request to get all branch data
        $.ajax({
            url: 'branches',
            dataType: 'json',
            success: function(branchDataArray) {
                // Extract just the 'name' property from each branch object
                currentProductCollection.availableBranchNames = branchDataArray.map(br => br.name);

                console.log(`Branches: Found ${branchDataArray.length} branches (${currentProductCollection.availableBranchNames.join(', ')})`);

                // Iterate over each product in the collection
                currentProductCollection.forEach(function (singleProduct) {
                    const productId = singleProduct.get('id');
                    const productBranchStatuses = []; // Array to store branch status for this product

                    // For each branch, determine its status relative to the current product
                    branchDataArray.forEach(function (branchItem) {
                        const isListedInBranch = branchItem.products.includes(productId);
                        productBranchStatuses.push({
                            name: branchItem.name,
                            listed: isListedInBranch, // Is the product explicitly listed in this branch?
                            pendingChange: false,     // Is there a pending change for this product in this branch?
                        });
                    });

                    // Update the product model with its branch-specific status
                    singleProduct.set('branches', productBranchStatuses);
                });

                // Notify interested components that branch data has been loaded and processed
                currentProductCollection.trigger("branchDataLoaded");
                currentProductCollection.isProcessingBranches = false; // Reset flag
            },
            error: function(xhr, status, errorMsg) {
                console.error('Failed to fetch branch data:', status, errorMsg);
                currentProductCollection.isProcessingBranches = false; // Reset flag on error
                // Trigger a specific error event for branch data
                currentProductCollection.trigger('branchData:error', { status, errorMsg });
            }
        });
    },

    // Custom parsing logic for initial product data
    parse: function(serverResponse) {
        // Iterate through each product object in the response
        serverResponse.forEach(function (productObject) {
            // Add a 'queued' flag, initially false, to each product
            productObject.pendingChange = false;
        });
        return serverResponse; // Return the modified response
    }
});

// Model for filtering criteria
var DisplayFilters = Backbone.Model.extend({
    defaults: {
        hideCommonItems: true, // Default to hiding common products
        searchText: ''         // Default empty search string
    }
});

/* User Interface Views */

// View for the button that shows pending changes
var PendingChangesButtonView = Backbone.Marionette.ItemView.extend({
    tagName: 'a', // Render as an anchor tag
    attributes: { 'href': '#' }, // Prevent default navigation
    template: "#queuedChangesBtnViewTpl", // Template for button content
    events: {
        'click': 'initiateChangesProcessing' // Handle click event
    },
    // Initialize event listeners for collection changes
    initialize: function() {
        this.collection.on('add remove reset', this.render, this);
        // Add a listener for persistence success to update UI if needed
        CatalogManagerApp.on('persistence:success', this.render, this);
    },
    // Handler for button click
    initiateChangesProcessing: function(event) {
        event.preventDefault(); // Stop default anchor behavior

        // Check if there are any changes to process
        if (this.collection.length < 1) {
            alert('No catalog modifications are currently queued. Please make changes to product-branch associations first.');
            return; // Exit if no changes
        }

        // Trigger an application-wide event indicating processing has started
        CatalogManagerApp.trigger("catalogUpdate:started");

        // Save the collection and define a success callback
        this.collection.persistChanges(function(collectionRef, response) {
            console.log("Catalog modifications saved successfully.");
            // Trigger an application-wide event indicating processing has completed
            CatalogManagerApp.trigger("catalogUpdate:completed", {response: response});
            // Optional: Clear the collection after successful save
            collectionRef.reset();
        });
    }
});

// View for the button that toggles hiding common items
var ToggleCommonVisibilityButtonView = Backbone.Marionette.ItemView.extend({
    tagName: 'a',
    attributes: { 'href': '#' },
    events: { 'click': 'handleToggleClick' }, // Event handler for click
    template: '#toggleHideCommonBtnViewTpl', // Template for the button
    // Initialize event listener for model changes
    initialize: function() {
        this.model.on('change:hideCommonItems', this.render, this); // Re-render on specific model attribute change
    },
    // Click handler to toggle the 'hideCommonItems' flag
    handleToggleClick: function(event) {
        event.preventDefault(); // Prevent default link behavior

        // Get current state and set to opposite
        const currentVisibility = this.model.get('hideCommonItems');
        this.model.set('hideCommonItems', !currentVisibility);
        console.log(`Visibility of common items toggled to: ${!currentVisibility}`);
    },
});

// View for the search input box
var ProductSearchInputView = Backbone.Marionette.ItemView.extend({
    template: '#vw-search', // Template for search input
    events: {
        'keypress input': 'processInput', // Key press event
        'keyup input': 'processInput',    // Key up event (for backspace/delete)
        'submit form': function(event) { event.preventDefault(); }, // Disable form submission
    },
    // Handles key input with a debounce mechanism
    processInput: function() {
        // Clear any existing timer to prevent multiple updates
        if (this.searchDelayTimer) {
            window.clearTimeout(this.searchDelayTimer);
        }

        const viewContext = this; // Capture 'this' for the timer callback

        // Set a new timer to update the filter model after a short delay
        this.searchDelayTimer = window.setTimeout(function() {
            viewContext.searchDelayTimer = null; // Clear timer reference
            const currentFilterText = viewContext.$el.find('input').val().trim(); // Get trimmed input value

            // Update the filter model
            viewContext.model.set('searchText', currentFilterText);

            if (currentFilterText) {
                console.log(`Filtering products by text: "${currentFilterText}"`);
            } else {
                console.log('Text filtering cleared.');
            }
        }, 250); // Debounce delay of 250 milliseconds
    },
});

// Layout for the main navigation bar
var TopNavbarLayout = Backbone.Marionette.LayoutView.extend({
    template: "#navbarLayout", // Template for the navbar structure

    regions: {
        pendingChangesArea:    "#queuedChangesButtonViewRegion", // Region for pending changes button
        commonVisibilityToggle: "#toggleHideCommonButtonViewRegion", // Region for common items toggle
        productSearchArea: '#rgn-search', // Region for search box
    }
});

// View for displaying detailed product update information
var ProductDetailsRowView = Backbone.Marionette.ItemView.extend({
    tagName: 'tr', // Renders as a table row
    template: '#vw-update-description', // Template for product details
});

// View for a single product update row in the table
var ProductUpdateRowView = Backbone.Marionette.ItemView.extend({
    tagName: 'tr', // Renders as a table row
    template: '#update-row', // Template for the update row
    events: {
        'click .toggle-branch-status':   'handleBranchStatusToggle', // Generic class for branch status buttons
        'click .info-display-trigger': 'toggleProductInfoDisplay', // Button to show/hide detailed info
    },
    // Initialize view properties
    initialize: function() {
        this.model.on('change', this.render, this); // Re-render on any model change
        this.isInfoVisible = false; // Flag to track info panel visibility
    },
    // Handles clicks on branch status buttons
    handleBranchStatusToggle: function (event) {
        event.preventDefault(); // Prevent default button behavior

        const clickedElement = $(event.currentTarget);
        const productUpdateQueue = this.model.collection.updateQueue; // Access the app's update queue

        // Extract necessary data from the clicked element and model
        const currentProductId = this.model.get('id');
        const targetBranchName = clickedElement.data('branch'); // Get branch name from data attribute
        let productBranchesData = this.model.get('branches'); // Get the array of branch statuses

        // Find the specific branch entry in the product's branches array
        let branchIndex = -1;
        const targetBranch = productBranchesData.find((b, idx) => {
            if (b.name === targetBranchName) {
                branchIndex = idx;
                return true;
            }
            return false;
        });

        if (!targetBranch) {
            console.error(`Branch '${targetBranchName}' not found for product ID ${currentProductId}.`);
            return;
        }

        const changeIdentifier = `${targetBranchName}-${currentProductId}`; // Unique ID for this change

        // Determine if this change is currently queued
        const currentPendingState = targetBranch.pendingChange;

        // Update the internal state of the branch
        productBranchesData[branchIndex].pendingChange = !currentPendingState;

        // Add or remove the change from the global pending updates collection
        if (!currentPendingState) {
            // If not queued, add it
            productUpdateQueue.add({
                id: changeIdentifier,
                branch: targetBranch.name,
                listed: targetBranch.listed,
                productId: currentProductId,
                action: targetBranch.listed ? 'unlist' : 'list' // Action to perform
            });
        } else {
            // If already queued, remove it
            productUpdateQueue.remove(productUpdateQueue.get(changeIdentifier));
        }

        // Manually trigger model events since we modified an array directly
        this.model.trigger('change', this.model);
        this.model.trigger('change:branches', this.model, productBranchesData);
    },
    // Toggles the visibility of detailed product information
    toggleProductInfoDisplay: function(event) {
        event.preventDefault();

        this.isInfoVisible = !this.isInfoVisible; // Flip the visibility flag
        const currentRow = $(event.currentTarget).closest('tr'); // Get the parent table row
        const toggleButton = currentRow.find('.info-display-trigger'); // Get the toggle button within this row

        // Lazy-initialize the details view
        if (!this.productDetailsView) {
            this.productDetailsView = new ProductDetailsRowView({model: this.model});
            this.productDetailsView.render(); // Render it once
        }

        // Insert or remove the details row based on visibility
        if (this.isInfoVisible) {
            toggleButton.addClass('active'); // Highlight the button
            currentRow.after(this.productDetailsView.el); // Insert details row after current row
        } else {
            toggleButton.removeClass('active'); // De-highlight the button
            this.productDetailsView.$el.remove(); // Remove the details row
        }
    }
});

// Composite view for the main product updates table
var ProductUpdatesGridView = Backbone.Marionette.CompositeView.extend({
    tagName: 'table', // Renders as a table
    className: 'table table-striped table-hover', // Add Bootstrap classes
    template: '#update-table', // Template for the table structure (header, etc.)
    itemView: ProductUpdateRowView, // Item view for each row
    itemViewContainer: 'tbody', // Where to append item views

    events: {
        'click .add-all-products-action': 'addAllProductsToBranch', // Action to add all products to a branch
        'click .remove-branch-action':   'initiateBranchDeletion', // Action to delete a branch
        'click .duplicate-apple-action':  'duplicateAppleCatalog', // Action to duplicate Apple's catalog
        'click .duplicate-branch-action': 'duplicateExistingBranch', // Action to duplicate an existing branch
    },
    // Initialize event listeners for filter changes
    initialize: function() {
        this.options.filterCriteria.on('change', this.render, this); // Re-render on filter changes
        this.collection.on('branchDataLoaded', this.render, this); // Re-render when branch data is ready
        this.collection.on('change reset sort', this.render, this); // Re-render on collection changes
    },
    // Prepares data for the main template (e.g., table header)
    serializeData: function() {
        // Provide available branch names to the template for header rendering
        const viewData = {
            availableBranches: this.collection.availableBranchNames || []
        };
        return viewData;
    },
    // Custom method to append individual item views, applying filters
    appendHtml: function(compositeView, singleItemView) {
        let shouldDisplayItem = false; // Flag to determine if item should be shown
        const productIsDeprecated = singleItemView.model.get('depr'); // Check for deprecation status

        const filterModel = this.options.filterCriteria;
        const hideCommon = filterModel.get('hideCommonItems');
        const currentSearchText = filterModel.get('searchText').toLowerCase();

        // Filtering logic:
        if (!hideCommon || productIsDeprecated) {
            // Always show if not hiding common items OR if the product is deprecated
            shouldDisplayItem = true;
        } else {
            const productBranchDetails = singleItemView.model.get('branches');
            // Create an array of 'listed' statuses, including the "not deprecated" status
            const listedStatuses = productBranchDetails.map(br => br.listed);
            listedStatuses.push(!productIsDeprecated); // Consider "not deprecated" as a "listed" status

            // Show if any branch is unlisted (or if product is deprecated, already covered above)
            // The `some` method is equivalent to `_.contains(array, false)`
            if (listedStatuses.some(status => status === false)) {
                shouldDisplayItem = true;
            }
        }

        // Apply text filtering if a search term is present
        if (shouldDisplayItem && currentSearchText) {
            const productTitle = singleItemView.model.get('title');
            if (!productTitle || productTitle.toLowerCase().indexOf(currentSearchText) === -1) {
                shouldDisplayItem = false; // Hide if title doesn't match search text
            }
        }

        // Append the item view only if it should be displayed
        if (shouldDisplayItem) {
            compositeView.getItemViewContainer().append(singleItemView.el);
        }
    },
    // Handler for adding all products to a specific branch
    addAllProductsToBranch: function (event) {
        const targetBranch = $(event.currentTarget).data('branch');

        if (!confirm(`Are you sure you want to add ALL products to the branch "${targetBranch}"? This action cannot be easily undone.`)) {
            return;
        }

        CatalogManagerApp.trigger("catalogUpdate:started"); // Notify app of pending changes

        // Use $.ajax for more explicit control over the POST request
        $.ajax({
            url: `add_all/${encodeURIComponent(targetBranch)}`,
            type: 'POST',
            data: {}, // Empty data payload
            success: function () {
                CatalogManagerApp.trigger("catalogUpdate:completed"); // Notify app of completion
            },
            error: function(xhr) {
                console.error("Failed to add all products:", xhr.responseText);
                CatalogManagerApp.trigger("catalogUpdate:failed", { action: 'addAll', branch: targetBranch, error: xhr.responseText });
            }
        });
    },
    // Handler for initiating branch deletion
    initiateBranchDeletion: function (event) {
        const branchToDelete = $(event.currentTarget).data('branch');

        if (!confirm(`Confirm deletion: Are you absolutely sure you want to delete the branch "${branchToDelete}"? This action is permanent.`)) {
            return;
        }

        CatalogManagerApp.trigger("catalogUpdate:started");

        $.ajax({
            url: `delete_branch/${encodeURIComponent(branchToDelete)}`,
            type: 'POST',
            data: {},
            success: function () {
                CatalogManagerApp.trigger("catalogUpdate:completed");
            },
            error: function(xhr) {
                console.error("Failed to delete branch:", xhr.responseText);
                CatalogManagerApp.trigger("catalogUpdate:failed", { action: 'deleteBranch', branch: branchToDelete, error: xhr.responseText });
            }
        });
    },
    // Handler for duplicating the 'Apple' branch catalog
    duplicateAppleCatalog: function(event) {
        const destinationBranch = $(event.currentTarget).data('branch');

        if (!confirm(`Warning: Duplicating will overwrite all data in branch "${destinationBranch}" with the Apple direct catalog. Proceed?`)) {
            return;
        }

        console.log(`Duplicating Apple direct catalog into branch: ${destinationBranch}`);

        CatalogManagerApp.trigger("catalogUpdate:started");

        $.ajax({
            url: `dup_apple/${encodeURIComponent(destinationBranch)}`,
            type: 'POST',
            data: {},
            success: function () {
                CatalogManagerApp.trigger("catalogUpdate:completed");
            },
            error: function(xhr) {
                console.error("Failed to duplicate Apple catalog:", xhr.responseText);
                CatalogManagerApp.trigger("catalogUpdate:failed", { action: 'dupApple', branch: destinationBranch, error: xhr.responseText });
            }
        });
    },
    // Handler for duplicating an arbitrary existing branch
    duplicateExistingBranch: function(event) {
        const targetBranch = $(event.currentTarget).data('branch');
        const sourceBranch = $(event.currentTarget).data('dupbranch');

        if (!confirm(`Confirm overwrite: Duplicating branch "${sourceBranch}" will completely overwrite "${targetBranch}". Are you sure?`)) {
            return;
        }

        console.log(`Duplicating branch "${sourceBranch}" into "${targetBranch}"`);

        CatalogManagerApp.trigger("catalogUpdate:started");

        $.ajax({
            url: `dup/${encodeURIComponent(sourceBranch)}/${encodeURIComponent(targetBranch)}`,
            type: 'POST',
            data: {},
            success: function () {
                CatalogManagerApp.trigger("catalogUpdate:completed");
            },
            error: function(xhr) {
                console.error("Failed to duplicate branch:", xhr.responseText);
                CatalogManagerApp.trigger("catalogUpdate:failed", { action: 'dupBranch', source: sourceBranch, target: targetBranch, error: xhr.responseText });
            }
        });
    },
});

// View for displaying a progress bar during long operations
var LoadingIndicatorView = Backbone.Marionette.ItemView.extend({
    // className: 'col-md-4 col-md-offset-4', // Optional: for smaller, centered bar
    template: '#span12-progress-bar', // Template for a full-width progress bar
});

// View for the form to create a new branch
var CreateNewBranchFormView = Backbone.View.extend({
    events: {
        'click button[type="submit"]': 'submitNewBranchForm' // Handle button click
    },
    // Handler for submitting the new branch form
    submitNewBranchForm: function (event) {
        event.preventDefault(); // Prevent default form submission

        const branchNameInput = this.$('#branchname-input'); // Select input field by ID

        const newBranchValue = branchNameInput.val().trim();
        if (!newBranchValue) {
            alert('Please enter a name for the new branch.');
            return; // Don't proceed if input is empty
        }

        CatalogManagerApp.trigger("catalogUpdate:started"); // Notify app of operation start

        // Use $.ajax for POST request
        $.ajax({
            url: `new_branch/${encodeURIComponent(newBranchValue)}`,
            type: 'POST',
            data: {},
            success: function () {
                branchNameInput.val(''); // Clear the input field
                CatalogManagerApp.trigger("catalogUpdate:completed"); // Notify app of successful completion
                console.log(`New branch '${newBranchValue}' created successfully.`);
            },
            error: function(xhr) {
                console.error("Failed to create new branch:", xhr.responseText);
                alert(`Error creating branch: ${xhr.statusText || 'Unknown error'}. Check console for details.`);
                CatalogManagerApp.trigger("catalogUpdate:failed", { action: 'newBranch', name: newBranchValue, error: xhr.responseText });
            }
        });
    }
});

/* Application Initialization and Event Handling */

// Define regions for the Marionette application
CatalogManagerApp.addRegions({
    navigationPanel: "#navbarRegion", // Region for the main navigation bar
    mainContentArea: '#updates', // Region for the main content (e.g., product table)
});

// Event handler for when catalog updates have completed
CatalogManagerApp.on("catalogUpdate:completed", function (options) {
    // Reset the pending changes queue
    CatalogManagerApp.pendingChangesCollection.reset();
    // Re-fetch all product data to refresh the display
    CatalogManagerApp.allProducts.fetch();
    console.log("Catalog update process finished. UI refreshed.");
});

// Event handler for when catalog updates are in progress
CatalogManagerApp.on("catalogUpdate:started", function (options) {
    // Show a loading indicator in the main content area
    CatalogManagerApp.mainContentArea.show(new LoadingIndicatorView());
    console.log("Catalog update process initiated. Displaying loading indicator.");
});

// Event handler for when catalog updates have failed
CatalogManagerApp.on("catalogUpdate:failed", function(errorInfo) {
    console.error("A catalog update operation failed:", errorInfo);
    // Optionally re-fetch to revert to last known good state or display specific error
    CatalogManagerApp.pendingChangesCollection.reset(); // Clear pending changes on failure
    CatalogManagerApp.allProducts.fetch();
    alert(`An error occurred during a catalog operation. Please check the console for details. Action: ${errorInfo.action}`);
});


// Initializer function, executed when the application starts
CatalogManagerApp.addInitializer(function () {
    const mainNavbar = new TopNavbarLayout();
    CatalogManagerApp.navigationPanel.show(mainNavbar); // Display the navbar layout

    CatalogManagerApp.trigger('catalogUpdate:started'); // Trigger initial loading state

    // Initialize core application data models and collections
    CatalogManagerApp.filterSettings = new DisplayFilters();
    CatalogManagerApp.pendingChangesCollection = new PendingUpdates();
    CatalogManagerApp.allProducts = new ProductList([], { updateQueue: CatalogManagerApp.pendingChangesCollection });

    // When product branch data is loaded, display the main product grid
    CatalogManagerApp.allProducts.on('branchDataLoaded', function () {
        const productGrid = new ProductUpdatesGridView({
            collection: CatalogManagerApp.allProducts,
            filterCriteria: CatalogManagerApp.filterSettings,
        });
        CatalogManagerApp.mainContentArea.show(productGrid);
        console.log("Product grid displayed with branch data.");
    });

    // Populate navbar regions with their respective views
    mainNavbar.pendingChangesArea.show(new PendingChangesButtonView({ collection: CatalogManagerApp.pendingChangesCollection }));
    mainNavbar.commonVisibilityToggle.show(new ToggleCommonVisibilityButtonView({ model: CatalogManagerApp.filterSettings }));
    mainNavbar.productSearchArea.show(new ProductSearchInputView({ model: CatalogManagerApp.filterSettings }));

    CatalogManagerApp.trigger('catalogUpdate:completed'); // Trigger initial completion, which fetches products

    // Initialize and render the new branch creation form
    const branchCreationForm = new CreateNewBranchFormView({ el: $('#newbranch-container') });
    branchCreationForm.render(); // Ensure the view is rendered
    console.log("Application initialization complete. UI components are ready.");
});

/* Document Ready Event - Start the Application */

$(document).ready(function () {
    CatalogManagerApp.start(); // Launch the Marionette application
});