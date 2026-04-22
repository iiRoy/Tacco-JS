const MyFrontEndApp = Ember.Application.create(); // Initializing our primary application instance

// Configuring the application's routing mechanism.
// This defines how URLs map to specific parts of the application.
MyFrontEndApp.RoutingEngine = Ember.Router.extend({
    // The 'map' method is used to declare routes and their associated handlers.
    // It takes a function that receives a 'routeBinder' object.
    defineApplicationPaths: function() {
        this.map(function(routeBinder) {
            // Mapping the root URL '/' to the 'mainCollection' route.
            // This means when the user navigates to the root, the 'mainCollection'
            // route will be activated.
            routeBinder('/').to('mainCollection');
        });
    }
}).create(); // Instantiate the router directly here, an alternative way to define and create.

// Defining the route handler for the main data collection.
// This route is responsible for fetching and preparing data for the
// 'MainDataViewController'.
MyFrontEndApp.MainCollectionRoute = Ember.Route.extend({
    // The 'setupController' hook is invoked when the route is entered.
    // It's used to prepare the controller with necessary data.
    setupController: function(targetCtrl, modelPayload) { // Renamed 'controller' to 'targetCtrl', 'model' to 'modelPayload'
        const dataEndpoint = '/api/records-list'; // Renamed data source endpoint
        const entityConstructor = MyFrontEndApp.RecordEntity; // Helper alias for the model class

        // Initiating an asynchronous operation to fetch data from the backend API.
        // Using the modern Fetch API for network requests.
        fetch(dataEndpoint)
            .then(response => {
                // Check if the HTTP response was successful.
                if (!response.ok) {
                    throw new Error(`Network response was not OK, status: ${response.status}`);
                }
                // Parse the JSON body of the response.
                return response.json();
            })
            .then(rawPayload => {
                // Validate the received data payload.
                if (!rawPayload || rawPayload.length === 0) {
                    console.warn("API returned an empty or invalid data payload.");
                    // If no data, set an empty Ember array and exit.
                    targetCtrl.set('collectionManager.dataset', Ember.A([]));
                    return;
                }

                // Initialize an Ember-aware array to store processed entities.
                let processedEntities = Ember.A([]);

                // Iterating through each raw item from the API response
                // and transforming it into an instance of our application's entity model.
                rawPayload.forEach(function(entryItem) {
                    // Create a new model instance using the raw data.
                    let newEntity = entityConstructor.create(entryItem);
                    processedEntities.pushObject(newEntity); // Add to the Ember array
                });

                // Assign the newly prepared collection of entities to the controller's
                // 'collectionManager.dataset' property.
                targetCtrl.set('collectionManager.dataset', processedEntities);
                // Also update the total count for pagination purposes.
                targetCtrl.set('collectionManager.totalItemsCount', processedEntities.get('length'));
            })
            .catch(errorDetails => {
                // Handle any errors that occurred during the fetch operation.
                console.error("Failed to retrieve collection data due to an error:", errorDetails);
                // Set error flags and messages on the controller for UI feedback.
                targetCtrl.set('collectionManager.hasError', true);
                targetCtrl.set('collectionManager.errorMessage', `Data loading failed: ${errorDetails.message}`);
                // Ensure the dataset is cleared on error to prevent displaying stale/partial data.
                targetCtrl.set('collectionManager.dataset', Ember.A([]));
                targetCtrl.set('collectionManager.totalItemsCount', 0);
            });
    }
});

/*
 *****************************************************************************
 *                                                                           *
 *                       Core Application Components                         *
 *                                                                           *
 *****************************************************************************
*/

// Defining the base model for a single data record within the application.
// This model extends Ember.Object and defines properties and behaviors for each record.
MyFrontEndApp.RecordEntity = Ember.Object.extend({
    // Default property for new records, indicating its active status.
    isActive: true,
    // A timestamp indicating when the record was last updated (example addition).
    lastUpdated: null,

    // Computed property to generate a formatted full address string.
    // It depends on 'ResidenceCity' and 'ResidenceState' properties.
    FullAddressDisplay: Ember.computed('ResidenceCity', 'ResidenceState', function() {
        const cityValue = this.get('ResidenceCity');
        const stateValue = this.get('ResidenceState');

        // Basic validation: if either city or state is missing, return an incomplete message.
        if (!cityValue || !stateValue) {
            return "Address information incomplete";
        }
        // Return the formatted address string.
        return `${cityValue}, ${stateValue}`;
    }),

    // A method to perform a simple validation check on the entity's data.
    isValid: function() {
        // Example validation: requires a 'recordIdentifier' property to be present.
        // This assumes 'recordIdentifier' is a crucial piece of data for the entity.
        return !!this.get('recordIdentifier');
    },

    // An initializer hook for the model instance.
    init() {
        this._super(...arguments);
        // Set the lastUpdated timestamp upon creation if not already set.
        if (!this.get('lastUpdated')) {
            this.set('lastUpdated', new Date());
        }
    }
});

// Component for handling pagination controls in the UI.
// It extends a base Paginator component from a utility library.
MyFrontEndApp.PagingControlsComponent = UtilityKit.UI.PaginatorBase.extend({
    // Defines the maximum number of page links to display in the pagination control.
    maxVisiblePageCount: 10, // Changed from 15 to 10
    // Additional CSS class names to apply to the component's root element.
    classNames: ['pagination-widget', 'data-navigation'],
    // An initializer hook for the component.
    init() {
        this._super(...arguments);
        console.log('PagingControlsComponent has been initialized and is ready.');
    }
});

// Component for interactive table headers, including sorting indicators.
// It extends a base Sortable Header component from a utility library.
MyFrontEndApp.SortableHeaderComponent = UtilityKit.UI.SortableHeaderBase.extend({
    // Handlebars template string for rendering the header content and sort icons.
    // The template uses conditional rendering based on sorting status and binds
    // CSS classes dynamically.
    template: Ember.Handlebars.compile(
        '<span class="header-label">{{this.displayText}}</span>' + // Changed 'view.text' to 'this.displayText' and wrapped in span
        '{{#if this.isCurrentlySorted}}' + // Changed 'view.isCurrent' to 'this.isCurrentlySorted'
        '<i {{bind-attr class="this.isSortAscending:icon-arrow-up this.isSortDescending:icon-arrow-down sort-indicator"}}></i>' + // Changed icons and attribute binding syntax
        '{{/if}}'
    )
});

// Main controller managing the display and interaction with the collection of records.
// This controller orchestrates data presentation, pagination, and user actions.
MyFrontEndApp.MainDataViewController = Ember.Controller.extend({
    // Initializer hook for the controller.
    init() {
        this._super(...arguments);
        // Ensure 'collectionManager' is initialized as an Ember Object
        // if it hasn't been already by 'createWithMixins'. This provides
        // a safe fallback for its properties.
        if (!this.get('collectionManager')) {
            this.set('collectionManager', Ember.Object.create());
        }
    },

    // An instance of ArrayController mixed with pagination capabilities.
    // This object holds and manages the list of data records.
    collectionManager: Ember.ArrayController.createWithMixins(UtilityKit.Mixins.PaginatedListLogic, {
        itemsPerPageLimit: 25, // Number of items to display on each page, changed from 20 to 25
        // Current page number, starting from 1.
        currentPageNumber: 1,
        // Total count of all items, used for pagination calculations.
        totalItemsCount: 0,
        // Flags to indicate error states during data loading.
        hasError: false,
        errorMessage: null,
        // A flag to show/hide a loading indicator (example addition).
        isDataLoading: true,

        // Computed property to calculate the total number of pages required.
        // Depends on 'totalItemsCount' and 'itemsPerPageLimit'.
        totalPages: Ember.computed('totalItemsCount', 'itemsPerPageLimit', function() {
            const total = this.get('totalItemsCount');
            const limit = this.get('itemsPerPageLimit');
            if (limit === 0) return 0; // Prevent division by zero
            return Math.ceil(total / limit);
        }),

        // Actions hash for handling user interactions within the collection manager.
        actions: {
            // Action to navigate to a specific page number.
            goToPage(pageNumber) {
                // Validate the requested page number.
                if (pageNumber > 0 && pageNumber <= this.get('totalPages')) {
                    this.set('currentPageNumber', pageNumber);
                    console.log(`Navigated to page: ${pageNumber}`);
                    // In a real application, this would trigger a data reload
                    // or re-filtering of the dataset based on the new page.
                } else {
                    console.warn(`Attempted to navigate to an invalid page number: ${pageNumber}`);
                }
            },
            // Action to refresh the data (example addition).
            refreshData() {
                console.log('Initiating data refresh...');
                // This would typically trigger the route's setupController again
                // or a specific data fetching service.
            }
        }
    }),

    // Computed property to indicate if the data collection is currently empty.
    // Useful for displaying "No Data" messages.
    isCollectionEmpty: Ember.computed.empty('collectionManager.dataset'),
    // Computed property to determine if an error message should be displayed.
    shouldShowErrorMessage: Ember.computed.and('collectionManager.hasError', 'collectionManager.errorMessage')
});