// This module defines the core routing logic for the application,
// managing navigation and orchestrating the display of different views.

// Global constants for frequently used DOM selectors and configuration values.
const MAIN_CONTENT_CONTAINER_SELECTOR = '#content';
const GLOBAL_HEADER_REGION_SELECTOR = '.header';
const PAGINATED_CATALOG_ITEM_LIMIT = 8; // Max items to show per page in product listings.

/**
 * A utility function to centralize the rendering of main content.
 * This helps in abstracting DOM manipulation logic from router methods.
 * @param {HTMLElement} elementToInject - The DOM element (or jQuery object) to be placed into the content area.
 */
const injectIntoMainDisplayArea = (elementToInject) => {
    // For debugging: log the type of content being rendered.
    console.debug('Application Router: Attempting to render content into:', MAIN_CONTENT_CONTAINER_SELECTOR);
    $(MAIN_CONTENT_CONTAINER_SELECTOR).html(elementToInject);
};

var ApplicationRoutingService = Backbone.Router.extend({

    // Defines the URL-to-method mapping for the application.
    // Each entry links a URL pattern to a specific handler function within this router.
    applicationRoutes: {
        "":                                 "showHomePage",
        "products-catalog":                 "displayProductListings",
        "products-catalog/page/:pageNum":   "displayProductListings",
        "products/create-new":              "initiateProductCreation",
        "products/:entityId":               "viewProductDetails",
        "about-us":                         "renderAboutSection"
    },

    /**
     * Initializes the routing service and essential application components.
     * This method is invoked once when the router instance is created.
     */
    initializeService: function () {
        console.log('ApplicationRoutingService: Initializing core components...');

        // Instantiate the global header component, responsible for top navigation.
        this.globalNavHeader = new MainNavigationHeader();
        // Attach the header's element to the designated header region in the DOM.
        $(GLOBAL_HEADER_REGION_SELECTOR).html(this.globalNavHeader.el);

        // Assign the shared content rendering utility to the router instance for convenience.
        this.renderContentArea = injectIntoMainDisplayArea;

        console.log('ApplicationRoutingService: Initialization complete. Ready for navigation.');
    },

    /**
     * Handles the display of the application's primary landing page.
     * @param {string} [potentialId] - An optional parameter that might be passed from the route, though not typically used here.
     */
    showHomePage: function (potentialId) {
        console.info('Navigating to the application homepage.');

        // If an unexpected ID is present, log a warning (could indicate a misconfigured route).
        if (potentialId) {
            console.warn('Homepage route received an unexpected identifier:', potentialId);
        }

        // Implement lazy-loading and caching for the homepage view.
        // The view is created only once and then reused for subsequent visits.
        if (!this.cachedHomePageView) {
            this.cachedHomePageView = new LandingPageView();
            console.debug('Homepage view instantiated for the first time.');
        } else {
            console.debug('Re-using existing homepage view instance.');
        }

        // Render the homepage view into the main content area.
        this.renderContentArea(this.cachedHomePageView.el);
        // Ensure the correct navigation item is highlighted.
        this.globalNavHeader.highlightNavItem('dashboard-link');
    },

    /**
     * Fetches and displays a paginated list of products.
     * Includes error handling and page number validation.
     * @param {string} pageNum - The requested page number, as extracted from the URL.
     */
    displayProductListings: function(pageNum) {
        console.info(`Displaying product listings for page: ${pageNum || 'default'}`);

        let currentPage = 1; // Default to page 1.
        if (pageNum) {
            const parsedPage = parseInt(pageNum, 10);
            // Validate the parsed page number.
            if (!isNaN(parsedPage) && parsedPage >= 1) {
                currentPage = parsedPage;
            } else {
                console.error(`Invalid page number provided: '${pageNum}'. Using default page 1.`);
                // Optionally, redirect to a valid page to correct the URL.
                // this.navigate('products-catalog/page/1', { replace: true });
            }
        }

        // Construct query parameters for the API request.
        const requestParameters = {
            'pageNumber': currentPage,
            'limit': PAGINATED_CATALOG_ITEM_LIMIT
        };

        // Instantiate a new collection to hold the product data for the current page.
        let productsCollection = new ProductDataCollection();

        // Define a named callback for successful data retrieval.
        const onProductsFetchSuccess = (collection, response, options) => {
            console.log(`Successfully loaded product data for page ${currentPage}.`);
            this.renderContentArea(new ProductCatalogDisplay({
                model: collection,
                currentPaginationPage: currentPage // Renamed 'page' to 'currentPaginationPage' for clarity.
            }).el);
        };

        // Define a named callback for failed data retrieval.
        const onProductsFetchError = (collection, response, options) => {
            console.error(`Failed to fetch product listings for page ${currentPage}:`, response);
            // Display an informative error message to the user.
            this.renderContentArea($('<div>').addClass('error-message').text('Could not load product catalog. Please try again later.'));
        };

        // Execute the fetch operation with success and error handlers.
        productsCollection.fetch({
            data: requestParameters,
            success: onProductsFetchSuccess,
            error: onProductsFetchError
        });

        // Update the active state of the corresponding navigation item.
        this.globalNavHeader.highlightNavItem('catalog-link');
    },

    /**
     * Shows the detailed view for a single product.
     * Includes a guard clause for missing identifiers.
     * @param {string} entityId - The unique identifier of the product.
     */
    viewProductDetails: function (entityId) {
        console.info(`Requesting details for product ID: ${entityId}`);

        // Guard clause: If no product ID is provided, redirect to the catalog.
        if (!entityId) {
            console.error('No product identifier specified for detail view. Redirecting to catalog.');
            this.navigate('products-catalog', { trigger: true, replace: true });
            return;
        }

        // Create a model instance for the specific product using its ID.
        let targetProductModel = new ProductEntity({ id: entityId });

        // Define a success callback for fetching product details.
        const onProductDetailLoadSuccess = (model, response, options) => {
            console.log(`Product details for ID ${entityId} loaded successfully.`);
            this.renderContentArea(new ProductDetailView({ model: model }).el);
        };

        // Define an error callback for failed product detail fetching.
        const onProductDetailLoadError = (model, response, options) => {
            console.error(`Failed to load details for product ID ${entityId}:`, response);
            // Display a user-friendly error message, potentially a "not found" view.
            this.renderContentArea($('<div>').addClass('error-message').text(`Product with ID '${entityId}' could not be found or an error occurred.`));
        };

        // Initiate the fetch operation for the product data.
        targetProductModel.fetch({
            success: onProductDetailLoadSuccess,
            error: onProductDetailLoadError
        });

        // Clear any active navigation item or set a default if no specific item applies.
        this.globalNavHeader.highlightNavItem(null); // No specific menu item for individual product details.
    },

    /**
     * Displays the form for creating a brand new product entry.
     */
    initiateProductCreation: function() {
        console.info('Initiating the process for creating a new product.');

        // Create an empty product model instance to bind to the creation form.
        let newProductInstance = new ProductEntity();
        // Render the product detail view, which is reused for both viewing and editing/creating.
        this.renderContentArea(new ProductDetailView({ model: newProductInstance }).el);
        // Highlight the 'add new product' menu item.
        this.globalNavHeader.highlightNavItem('create-product-link');
    },

    /**
     * Renders the 'About Us' informational section of the application.
     */
    renderAboutSection: function () {
        console.info('Navigating to the About Us section.');

        // Implement lazy-loading and caching for the About Us view.
        // This optimizes performance by avoiding re-instantiation on repeat visits.
        if (!this.cachedAboutPageView) {
            this.cachedAboutPageView = new AboutInformationView();
            console.debug('About Us view instantiated for the first time.');
        } else {
            console.debug('Re-using existing About Us view instance.');
        }

        // Render the About Us view into the main content area.
        this.renderContentArea(this.cachedAboutPageView.el);
        // Highlight the 'about us' link in the navigation.
        this.globalNavHeader.highlightNavItem('about-link');
    }

});

// --- Application Bootstrap Sequence ---
// This section is responsible for loading necessary templates and starting the Backbone application.

// Assuming 'templateManager' is a global utility responsible for asynchronous template loading.
// Template names have been updated to reflect new naming conventions.
templateManager.loadViewsConcurrently([
    'LandingPageView',
    'MainNavigationHeader',
    'ProductDetailView',
    'ProductListItemDisplay', // Renamed from WineListItemView
    'AboutInformationView'
], function() {
    console.log('All essential visual components have been preloaded. Proceeding to initialize application.');

    // Instantiate the primary application router.
    // The instance is stored globally for easy access if needed.
    window.mainApplicationCore = new ApplicationRoutingService();

    // Start Backbone's history, which listens for URL changes and dispatches routes.
    Backbone.history.start({
        pushState: true, // Enables HTML5 pushState for clean, hash-less URLs.
        root: '/'        // Specifies the root URL for the application.
    });

    console.log('Application routing system successfully activated.');
});