/* Top-level application management */

var BreweryApp = new Backbone.Marionette.Application();

/* Data Models and Collections */

var ItemModifications = Backbone.Collection.extend({
    // Defines the base model for items in this collection
    dataModel: Backbone.Model,
    // API endpoint for persisting changes
    apiEndpoint: 'handle_queue',

    /**
     * Persists the collection's current state to the backend.
     * @param {Function} onSuccess - Callback to execute upon successful save.
     */
    persist: function(onSuccess) {
        var selfRef = this; // Reference to the current collection instance
        var paramCount = arguments.length; // Number of arguments passed

        $.ajax({
            type: 'POST', // HTTP method for the request
            url: this.apiEndpoint, // Target URL
            data: JSON.stringify(this.toJSON()), // Convert collection data to JSON string
            dataType: 'json', // Expected data type from server response
            contentType: 'application/json; charset=UTF-8', // Request content type
            success: function() { // Function executed on successful request
                // If a success callback was provided, invoke it
                if (paramCount >= 1) {
                    onSuccess(selfRef);
                }
            }
        });
    }
});

var Departments = Backbone.Collection.extend({
    // Default model for each department entry
    dataModel: Backbone.Model,
    // URL for department data retrieval
    apiEndpoint: 'departments'
});

var Merchandise = Backbone.Collection.extend({
    // Standard data model for individual merchandise items
    dataModel: Backbone.Model,
    // Endpoint for fetching product data
    apiEndpoint: 'merchandise',

    /**
     * Initial setup for the merchandise collection.
     * @param {Array} dataModels - Initial models for the collection.
     * @param {Object} configSettings - Configuration options.
     */
    setup: function(dataModels, configSettings) {
        // Check if configuration options are provided and contain item modifications
        if (typeof(configSettings) === "object" && 'itemModifications' in configSettings) {
            this.itemModifications = configSettings['itemModifications'];
        } else {
            // Otherwise, create a new ItemModifications collection
            this.itemModifications = new ItemModifications();
        }

        // Bind the 'sync' event to trigger department fetching
        this.bind('sync', this.retrieveDepartments);
    },

    /**
     * Fetches department information related to the products.
     */
    retrieveDepartments: function() {
        console.log('Merchandise items loaded: ' + this.length.toString());

        var currentMerchandise = this; // Self-reference for use in callbacks

        // Asynchronously fetch department data
        $.ajax({
            url: 'departments',
            dataType: 'json',
            success: function(deptList) {
                currentMerchandise.departments = _.pluck(deptList, 'name'); // Extract department names

                console.log('Departments retrieved: ' + deptList.length.toString() +
                            ' (Names: ' + currentMerchandise.departments.toString() + ')');

                // Iterate through each merchandise item to assign department info
                currentMerchandise.each(function (singleItem) {
                    var itemID = singleItem.get('id'); // Get the ID of the current item
                    var itemDepartments = []; // Array to store department details for this item

                    // Map each department to the item's branch status
                    _.each(deptList, function (dept) {
                        itemDepartments.push({
                            name: dept.name,
                            listed: (_.indexOf(dept.products, itemID) !== -1), // Is item listed in this department?
                            queued: false, // Not in queue initially
                        });
                    });

                    singleItem.set('departments', itemDepartments); // Set department data on the item model
                });

                currentMerchandise.trigger("departmentsLoaded"); // Notify that departments are loaded
            }
        });
    },

    /**
     * Parses the raw server response before adding models to the collection.
     * @param {Array} serverResponse - The raw response data from the server.
     * @returns {Array} Processed response data.
     */
    processData: function(serverResponse) {
        // Add a 'queued' status to each entry, defaulting to false
        _.each(serverResponse, function (recordEntry) {
            recordEntry.queued = false;
        });
        return serverResponse;
    }
});

var DisplayOptions = Backbone.Model.extend({
    // Default values for display settings
    defaults: {
        concealShared: true // By default, hide common items
    }
});

/* User Interface Components (Views) */

var PendingActionsButtonView = Backbone.Marionette.ItemView.extend({
    tagName: 'a', // Render as an anchor tag
    attributes: { 'href': '#' }, // Default href attribute
    template: "#pendingActionsBtnTemplate", // Template for this view
    events: {
        'click': 'executePendingActions' // Handle click event
    },
    /**
     * Initializes the view and binds collection events for re-rendering.
     */
    setup: function() {
        this.collection.bind('add', this.render, this); // Re-render on item addition
        this.collection.bind('remove', this.render, this); // Re-render on item removal
        this.collection.bind('reset', this.render, this); // Re-render on collection reset
    },
    /**
     * Handles the click event to apply queued changes.
     * @param {Event} eventObject - The event object.
     */
    executePendingActions: function(eventObject) {
        eventObject.preventDefault(); // Prevent default link behavior

        // Check if there are any changes in the queue
        if (this.collection.length < 1) {
            alert('No items are in the modification queue. Please make some changes to a department first.');
            return;
        }

        BreweryApp.trigger("catalogsChanging"); // Notify that catalog changes are in progress

        // Save the collection and trigger a 'changed' event on success
        this.collection.persist(function() {
            BreweryApp.trigger("catalogsChanged");
        });
    }
});

var SwitchDisplayModeButtonView = Backbone.Marionette.ItemView.extend({
    tagName: 'a', // Render as an anchor tag
    attributes: { 'href': '#' }, // Default href attribute
    events: { 'click': 'tap' }, // Handle click event with 'tap' method
    template: '#switchDisplayModeBtnTemplate', // Template for this view
    /**
     * Initializes the view and binds model change events.
     */
    setup: function() {
        this.dataModel.bind('change', this.render, this); // Re-render on model change
    },
    /**
     * Handles the click event to toggle the display mode.
     * @param {Event} eventObject - The event object.
     */
    tap: function(eventObject) {
        eventObject.preventDefault(); // Prevent default link behavior

        // Toggle the 'concealShared' flag in the model
        this.dataModel.set('concealShared', !this.dataModel.get('concealShared'));
    },
});

var QueryInputView = Backbone.Marionette.ItemView.extend({
    template: '#view-search-box', // Template for the search input
    events: {
        'keypress input': 'inputDetected', // On key press in input field
        'keyup input': 'inputDetected', // On key release in input field
        'submit form': function(eventObject) { eventObject.preventDefault(); },
            // Prevent form submission, especially on Enter key
    },
    /**
     * Handles key press and key up events in the search input.
     */
    inputDetected: function() {
        // Clear any existing search timer to debounce input
        if (this.queryTimer) {
            window.clearTimeout(this.queryTimer);
        }

        selfRef = this; // Reference to the view instance

        // Set a new timer to process search input after a delay
        this.queryTimer = window.setTimeout(function() {
            selfRef.queryTimer = null; // Clear timer reference
            var queryText = selfRef.$el.find('input').val(); // Get current input value

            if (queryText) {
                console.log('Filtering items by: "' + queryText + '"');
            } else {
                console.log('No text filtering applied.');
            }

            selfRef.dataModel.set('queryText', queryText); // Update model with filter text
        }, 200); // 200ms delay
    },
});

var HeaderLayout = Backbone.Marionette.Layout.extend({
    template: "#headerLayoutTemplate", // Main layout template for the header

    regions: {
        pendingActionsButton:    "#queuedChangesButtonViewRegion", // Region for queued changes button
        switchDisplayModeButton: "#toggleHideCommonButtonViewRegion", // Region for hide common button
        searchBox: '#rgn-search-box', // Region for the search input
    }
});

var DetailDisplayView = Backbone.Marionette.ItemView.extend({
    tagName: 'tr', // Render as a table row
    template: '#view-detail-description', // Template for item description
});

var ItemEntryView = Backbone.Marionette.ItemView.extend({
    tagName: 'tr', // Render as a table row
    template: '#item-row-template', // Template for a single item row
    events: {
        'click .button-listed':   'itemDepartmentButtonClick', // Handle click for 'listed' button
        'click .button-unlisted': 'itemDepartmentButtonClick', // Handle click for 'unlisted' button
        'click .info-toggle-button': 'toggleItemDetails', // Handle click for info toggle
        'click .info-toggle': 'toggleItemDetails', // Another handler for info toggle
    },
    /**
     * Initializes the view and binds model change events.
     */
    setup: function() {
        this.dataModel.bind('change', this.render, this); // Re-render on model change
        this.displayDetails = false; // Flag to control info display
    },
    /**
     * Handles clicks on department-related buttons for an item.
     * @param {Event} eventObject - The event object.
     */
    itemDepartmentButtonClick: function (eventObject) {
        var itemModifications = this.dataModel.collection.itemModifications; // Access item modifications collection

        // Gather relevant data for the change
        var itemID = this.dataModel.get('id'); // Item's unique identifier
        var deptName = $(eventObject.currentTarget).data('department'); // Which department button was clicked
        var itemDepartments = this.dataModel.get('departments'); // All departments associated with this item
        var deptIndex = -1; // Index of the clicked department
        var dept = _.find(itemDepartments, function (d) { deptIndex++; return d.name === deptName; }); // Find the specific department

        var modificationID = deptName + itemID; // Unique ID for this specific modification

        if (dept.queued) {
            // If already queued, un-queue it
            itemDepartments[deptIndex].queued = false;
            itemModifications.remove({id: modificationID});
        } else {
            // If not queued, add it to the queue
            itemDepartments[deptIndex].queued = true;
            itemModifications.add({
                id: modificationID,
                department: dept.name,
                listed: dept.listed,
                itemID: itemID
            });
        }

        // Manually trigger change events since an array within the model was modified directly
        this.dataModel.trigger('change');
        this.dataModel.trigger('change:departments');
    },
    /**
     * Toggles the display of detailed information for the item.
     * @param {Event} eventObject - The event object.
     */
    toggleItemDetails: function(eventObject) {
        this.displayDetails = !this.displayDetails; // Flip the display state
        var rowElement = $(eventObject.currentTarget).closest('tr'); // Get the parent table row
        var actionButton = $(rowElement).find('.info-toggle-button'); // Get the toggle button within the row

        // If detail view not yet created, instantiate and render it
        if (!this.detailsDisplay) {
            this.detailsDisplay = new DetailDisplayView({dataModel: this.dataModel});
            this.detailsDisplay.render();
        }

        if (this.displayDetails) {
            actionButton.addClass('active'); // Add active class to button
            rowElement.after(this.detailsDisplay.el); // Insert detail view after the item row
        } else {
            actionButton.removeClass('active'); // Remove active class
            rowElement.next().remove(); // Remove the detail view (which is the next row)
        }
    }
});

var InventoryTableDisplay = Backbone.Marionette.CompositeView.extend({
    tagName: 'table', // Render as a table
    className: 'table', // CSS class for the table
    template: '#item-table-template', // Template for the entire table structure
    itemView: ItemEntryView, // View for individual items in the collection
    events: {
        'click .addAllProductsMenuSel': 'addEntireCategory', // Add all items from a department
        'click .deleteBranchMenuSel':   'removeDepartment', // Delete a department
        'click .duplicateAppleBranch':  'copyCoreDepartment', // Duplicate a core department
        'click .duplicateBranch':       'replicateDepartment', // Duplicate an existing department
    },
    /**
     * Initializes the table display and binds filter criteria changes.
     */
    setup: function() {
        this.options.filterCriteria.bind('change', this.render, this); // Re-render on filter changes
    },
    /**
     * Prepares data for serialization to the template.
     * @returns {Object} Data object for template.
     */
    prepareDataForSerialization: function() {
        // This relies on the 'departments' property being populated by Merchandise::retrieveDepartments
        var dataObject = { departments: this.collection.departments };
        return dataObject;
    },
    /**
     * Appends an item view to the collection view, with filtering logic.
     * @param {Backbone.Marionette.CollectionView} collectionDisplay - The parent collection view.
     * @param {Backbone.Marionette.ItemView} itemDisplay - The individual item view to append.
     */
    attachElementToDOM: function(collectionDisplay, itemDisplay) {
        var shouldDisplay = false; // Flag to determine if item should be shown
        var isDeprecated = itemDisplay.dataModel.get('deprecated'); // Check if item is deprecated

        // Logic for hiding common items
        if (this.options.filterCriteria.get('concealShared') === false || isDeprecated === true) {
            // Always show if not hiding common items, OR if the item is deprecated
            shouldDisplay = true;
        } else {
            var itemDepartments = itemDisplay.dataModel.get('departments'); // Departments for this item

            // Create an array of 'listed' statuses, including the deprecated status
            var listedStatusArray = _.pluck(itemDepartments, 'listed');
            listedStatusArray.push(!isDeprecated); // Add inverse of deprecated status

            if (_.contains(listedStatusArray, false) === true) {
                // Show if any department lists the item as unlisted, or if it's deprecated
                shouldDisplay = true;
            }
        }

        // Apply text filtering
        var queryText = this.options.filterCriteria.get('queryText');
        if (queryText) {
            var itemName = itemDisplay.dataModel.get('title');
            if (itemName.toLowerCase().indexOf(queryText.toLowerCase()) === -1) {
                shouldDisplay = false; // Hide if title doesn't match filter text
            }
        }

        // If the item should be displayed, append it to the table body
        if (shouldDisplay === true) {
            collectionDisplay.$("tbody").append(itemDisplay.el);
        }
    },
    /**
     * Adds all items to a specific department.
     * @param {Event} eventObject - The event object.
     */
    addEntireCategory: function (eventObject) {
        var targetDepartment = $(eventObject.currentTarget).data('department'); // Get department name

        BreweryApp.trigger("catalogsChanging"); // Notify app of changes

        // Send POST request to add all items
        $.post('add_all_items/' + encodeURIComponent(targetDepartment), {}, function () {
            BreweryApp.trigger("catalogsChanged"); // Notify app that changes are complete
        });
    },
    /**
     * Deletes a specified department.
     * @param {Event} eventObject - The event object.
     */
    removeDepartment: function (eventObject) {
        var deptToDelete = $(eventObject.currentTarget).data('department'); // Get department name

        // Confirm deletion with the user
        if (!confirm('Are you absolutely sure you wish to permanently remove the department "' +
                deptToDelete + '"? Click OK to proceed, or Cancel to abort.')) {
            return;
        }

        BreweryApp.trigger("catalogsChanging"); // Notify app of changes

        // Send POST request to delete the department
        $.post('delete_dept/' + encodeURIComponent(deptToDelete), {}, function () {
            BreweryApp.trigger("catalogsChanged"); // Notify app that changes are complete
        });
    },
    /**
     * Duplicates the core "Apple" department into another department.
     * @param {Event} eventObject - The event object.
     */
    copyCoreDepartment: function(eventObject) {
        var targetDepartment = $(eventObject.currentTarget).data('department'); // Get target department name

        // Confirm overwrite with the user
        if (!confirm('Duplication will overwrite the existing department "' + targetDepartment +
                '". Are you certain you want to proceed? Click OK to duplicate the primary branch, Cancel otherwise.')) {
            return;
        }

        console.log("Duplicating primary (Apple) department into " + targetDepartment);

        BreweryApp.trigger("catalogsChanging"); // Notify app of changes

        // Send POST request to duplicate the core department
        $.post('copy_core_dept/' + encodeURIComponent(targetDepartment), {}, function () {
            BreweryApp.trigger("catalogsChanged"); // Notify app that changes are complete
        });

    },
    /**
     * Duplicates an arbitrary source department into a target department.
     * @param {Event} eventObject - The event object.
     */
    replicateDepartment: function(eventObject) {
        var targetDepartment = $(eventObject.currentTarget).data('department'); // Get target department name
        var sourceDepartment = $(eventObject.currentTarget).data('dupbranch'); // Get source department name to duplicate from

        // Confirm overwrite with the user
        if (!confirm('Duplication will overwrite the existing department "' + targetDepartment +
                '". Are you certain you want to proceed? Click OK to replicate "' + sourceDepartment + '", Cancel otherwise.')) {
            return;
        }

        console.log("Replicating department " + sourceDepartment + " into " + targetDepartment);

        BreweryApp.trigger("catalogsChanging"); // Notify app of changes

        // Send POST request to duplicate the specified department
        $.post('duplicate_dept/' + encodeURIComponent(sourceDepartment) + '/' + encodeURIComponent(targetDepartment), {}, function () {
            BreweryApp.trigger("catalogsChanged"); // Notify app that changes are complete
        });
    },
});

var ActivityIndicatorView = Backbone.Marionette.ItemView.extend({
    // className: 'span4 offset4', // Optional: for a smaller progress bar
    template: '#fullwidth-activity-indicator', // Template for a full-width progress bar
});

var NewDepartmentFormView = Backbone.View.extend({
    events: {
        'click button': 'createNewDepartment' // Handle button click to create new department
    },
    /**
     * Handles the creation of a new department.
     */
    createNewDepartment: function () {
        var newDeptInputBox = $('#branchname', this.el); // Get the input field for new department name

        BreweryApp.trigger("catalogsChanging"); // Notify app of changes

        // Send POST request to create a new department
        // Consider using a Backbone.Model for more structured interaction
        $.post('new_dept/' + encodeURIComponent(newDeptInputBox.val()), {}, function () {
            newDeptInputBox.val(''); // Clear the input field
            BreweryApp.trigger("catalogsChanged"); // Notify app that changes are complete
        });
    }
});

/* Application Initialization and Configuration */

BreweryApp.addRegions({
    headerArea: "#navbarRegion", // Region for the main navigation bar
    itemDisplays: '#updates', // Region for displaying item updates
});

// Event handler for when catalogs have finished changing
BreweryApp.on("catalogsChanged", function (configSettings) {
    BreweryApp.itemModifications.reset(); // Clear pending item modifications
    BreweryApp.merchandise.fetch(); // Re-fetch merchandise data
});

// Event handler for when catalog changes are initiated
BreweryApp.on("catalogsChanging", function (configSettings) {
    BreweryApp.itemDisplays.show(new ActivityIndicatorView()); // Show a progress indicator
});

// Application initializer function
BreweryApp.addInitializer(function () {
    var mainHeader = new HeaderLayout(); // Create the header layout
    BreweryApp.headerArea.show(mainHeader); // Display the header

    BreweryApp.trigger('catalogsChanging'); // Trigger initial 'changing' state

    BreweryApp.filterCriteria = new DisplayOptions(); // Initialize display options model
    BreweryApp.itemModifications = new ItemModifications(); // Initialize item modifications collection
    BreweryApp.merchandise = new Merchandise([], {itemModifications: BreweryApp.itemModifications}); // Initialize merchandise collection

    // Bind to 'departmentsLoaded' event on merchandise collection
    BreweryApp.merchandise.bind('departmentsLoaded', function () {
        var itemTableDisplay = new InventoryTableDisplay({
            collection: BreweryApp.merchandise, // Pass the merchandise collection
            filterCriteria: BreweryApp.filterCriteria, // Pass the filter criteria model
        });
        BreweryApp.itemDisplays.show(itemTableDisplay); // Display the merchandise table
    });

    // Show views in their respective regions within the header
    mainHeader.pendingActionsButton.show(new PendingActionsButtonView({collection: BreweryApp.itemModifications}));
    mainHeader.switchDisplayModeButton.show(new SwitchDisplayModeButtonView({dataModel: BreweryApp.filterCriteria}));
    mainHeader.searchBox.show(new QueryInputView({dataModel: BreweryApp.filterCriteria}));

    BreweryApp.trigger('catalogsChanged'); // Trigger initial 'changed' state

    // Initialize the new department form view
    var newDeptFormDisplay = new NewDepartmentFormView({el: $('#newbranch')});
});

/* Document Ready Event */

$(document).ready(function () {
    BreweryApp.start(); // Start the Marionette application
});