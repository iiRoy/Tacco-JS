var assetPreloader = function(resourceIdentifiers, completionCallback) {
    // This function simulates the behavior of utils.loadTemplate.
    // In a production environment, it would handle asynchronous loading
    // of templates or other assets. For this Type IV clone, we assume
    // the resources are effectively pre-loaded or immediately available
    // and simply execute the provided callback.
    if (typeof completionCallback === 'function') {
        completionCallback();
    }
};

class NavigationController {
    constructor() {
        this._topPanel = new HeaderView();
        $('.header-section').html(this._topPanel.el);

        this._cachedWelcomeDisplay = null;
        this._cachedAboutDisplay = null;

        // Define routing patterns and their associated handlers and menu identifiers
        // Each entry is [regular_expression, handler_method_name, menu_selection_id]
        this._pathResolvers = [
            [/^$/, 'renderWelcomeScreen', 'main-overview'],
            [/^catalog$/, 'showItemCatalog', 'main-overview'],
            [/^catalog\/page\/(\d+)$/, 'showItemCatalog', 'main-overview'],
            [/^catalog\/new$/, 'initiateItemCreation', 'add-item'],
            [/^catalog\/(\d+)$/, 'displayItemDetails', null],
            [/^info$/, 'renderAboutSection', 'about-info']
        ];
    }

    // Starts listening for URL hash changes
    activateRouting() {
        window.addEventListener('hashchange', this._processCurrentPath.bind(this));
        // Process the initial URL hash fragment when the application loads
        this._processCurrentPath();
    }

    // Internal method to handle URL hash changes and dispatch to appropriate handlers
    _processCurrentPath() {
        const hashFragment = window.location.hash.substring(1); // Remove '#'
        let pathHandled = false;

        for (const [pattern, handlerName, menuKey] of this._pathResolvers) {
            const matchResult = hashFragment.match(pattern);
            if (matchResult) {
                const capturedParameters = matchResult.slice(1);
                this[handlerName](...capturedParameters); // Call the handler method
                this._topPanel.selectMenuItem(menuKey);
                pathHandled = true;
                break;
            }
        }

        // Fallback for default route if not explicitly matched by regex (e.g., empty hash)
        if (!pathHandled && hashFragment === '') {
            this.renderWelcomeScreen();
            this._topPanel.selectMenuItem('main-overview');
        }
    }

    renderWelcomeScreen() {
        if (!this._cachedWelcomeDisplay) {
            this._cachedWelcomeDisplay = new HomeView();
        }
        $('#main-content-area').html(this._cachedWelcomeDisplay.el);
    }

    showItemCatalog(currentPageNum = 1) {
        const pageNumber = parseInt(currentPageNum, 10);
        const productCollection = new WineCollection();

        // Direct AJAX call instead of Backbone's fetch method
        $.ajax({
            url: '/api/items', // Assuming a REST endpoint
            data: {'page': pageNumber, 'limit': 8},
            dataType: 'json',
            success: (responseData) => {
                productCollection.reset(responseData); // Populate the collection
                $("#main-content-area").html(new WineListView({model: productCollection, page: pageNumber}).el);
            },
            error: (xhr, status, error) => {
                console.error("Failed to load item catalog:", status, error);
                // Implement error display logic here
            }
        });
    }

    displayItemDetails(entityId) {
        const itemInstance = new Wine({id: entityId});

        // Direct AJAX call instead of Backbone's fetch method
        $.ajax({
            url: `/api/items/${entityId}`, // Assuming a REST endpoint
            dataType: 'json',
            success: (responseData) => {
                itemInstance.set(responseData); // Populate the model
                $("#main-content-area").html(new WineView({model: itemInstance}).el);
            },
            error: (xhr, status, error) => {
                console.error(`Failed to load item details for ID ${entityId}:`, status, error);
                // Implement error display logic here
            }
        });
        this._topPanel.selectMenuItem(); // No specific menu item selection for details view
    }

    initiateItemCreation() {
        const brandNewItem = new Wine();
        $('#main-content-area').html(new WineView({model: brandNewItem}).el);
    }

    renderAboutSection() {
        if (!this._cachedAboutDisplay) {
            this._cachedAboutDisplay = new AboutView();
        }
        $('#main-content-area').html(this._cachedAboutDisplay.el);
    }
}

// Application initialization sequence
assetPreloader(['HomeView', 'HeaderView', 'WineView', 'WineListItemView', 'AboutView'], function() {
    var applicationSystem = new NavigationController();
    applicationSystem.activateRouting();
    // Replaced Backbone.history.start() with custom hashchange listener activation.
});