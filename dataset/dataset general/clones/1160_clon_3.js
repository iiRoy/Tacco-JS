const DOM_ELEMENT_TARGETS = {
    GLOBAL_APP_HEADER: '.application-top-bar-container', // Renamed from '.header'
    MAIN_PAGE_CONTENT: '#primary-content-area',          // Renamed from '#content'
};

const NAV_ITEM_IDENTIFIERS = {
    DEFAULT_DASHBOARD: 'main-dashboard-nav', // Renamed from 'home-menu'
    WIDGET_COLLECTION: 'widgets-overview-nav', // Renamed from 'portlets-menu'
};

/**
 * Core Application Navigation Handler.
 * This class extends Backbone.Router to manage the application's URL-based routing
 * and orchestrate the display of different views.
 * This is a Type III clone of the original AppRouter.
 */
const MainAppNavigationController = Backbone.Router.extend({

    // Defines the mapping of URL fragments to specific handler methods within this controller.
    urlRoutes: {
        "": "renderDefaultDashboard",      // Renamed from "home"
        "widgets": "displayWidgetsCollection" // Renamed from "portlets", URL path also changed
    },

    /**
     * Performs initial setup of essential application components.
     * This method is invoked once when the router is instantiated.
     */
    initializeCoreComponents: function () { // Renamed from 'initialize'
        // Log initialization start for debugging.
        console.log("MainAppNavigationController: Starting core component initialization...");

        // Instantiate the application's header view.
        // This component typically contains global navigation elements.
        this.appHeaderComponent = new ApplicationHeaderComponent(); // Renamed from HeaderView, headerView

        // Render the header component into its designated DOM area.
        // Using `empty().append()` for a slight variation from direct `.html()`.
        $(DOM_ELEMENT_TARGETS.GLOBAL_APP_HEADER).empty().append(this.appHeaderComponent.el);

        // Confirm initialization completion.
        console.info("MainAppNavigationController: Global header component rendered successfully.");
    },

    /**
     * Handles the default route, displaying the main dashboard view.
     * @param {string} [routeParam] - An optional parameter passed from the URL, if any.
     */
    renderDefaultDashboard: function (routeParam) { // Renamed from 'home', parameter renamed
        // Log navigation for traceability.
        console.log(`Navigating to Default Dashboard. Route parameter received: '${routeParam || 'N/A'}'`);

        // Check if the dashboard view has been created yet. Instantiate if not.
        if (!this.dashboardViewInstance) { // Renamed from homeView
            this.dashboardViewInstance = new DefaultDashboardView(); // Renamed from HomeView
            console.log("Default Dashboard View created for the first time.");
        } else {
            console.log("Reusing existing Default Dashboard View instance.");
        }

        // Get a jQuery reference to the main content area.
        const mainContentContainer = $(DOM_ELEMENT_TARGETS.MAIN_PAGE_CONTENT);

        // Clear previous content and append the new view's element.
        mainContentContainer.empty();
        mainContentContainer.append(this.dashboardViewInstance.el); // Changed from .html() to .append()

        // Instruct the header component to highlight the appropriate navigation link.
        this.appHeaderComponent.activateNavLink(NAV_ITEM_IDENTIFIERS.DEFAULT_DASHBOARD); // Renamed from selectMenuItem, 'home-menu'

        // A simple guard clause for the optional route parameter.
        if (routeParam && routeParam.length > 0) {
            console.warn(`Note: Route parameter '${routeParam}' was passed to the dashboard, but its specific handling is not implemented here.`);
        }
    },

    /**
     * Displays the collection of interactive widgets.
     * This method is triggered when the "widgets" route is activated.
     */
    displayWidgetsCollection: function () { // Renamed from 'portlets'
        console.log("Activating Widgets Collection display.");

        // Lazy-load the widgets view using a ternary for a different instantiation pattern.
        // If `this.widgetCollectionViewer` exists, use it; otherwise, create a new one.
        this.widgetCollectionViewer = this.widgetCollectionViewer || new DynamicWidgetsView(); // Renamed from portletsView, PortletsView

        // Render the widgets view into the main content area.
        // Keeping `.html()` here for variety in rendering methods.
        $(DOM_ELEMENT_TARGETS.MAIN_PAGE_CONTENT).html(this.widgetCollectionViewer.el);

        // Update the active state of the navigation menu in the header.
        this.appHeaderComponent.activateNavLink(NAV_ITEM_IDENTIFIERS.WIDGET_COLLECTION); // Renamed from selectMenuItem, 'portlets-menu'
    }
});

// A global helper object for application-wide utilities, e.g., template loading.
const ApplicationSupport = { // Renamed from 'utils'
    /**
     * Simulates asynchronous loading of application templates.
     * In a production environment, this would involve actual file fetching.
     * @param {Array<string>} templateComponentNames - List of template names to load.
     * @param {Function} completionCallback - Function to execute once templates are "loaded".
     */
    loadApplicationTemplatesAsync: function (templateComponentNames, completionCallback) { // Renamed from loadTemplate
        console.log(`ApplicationSupport: Initiating async template loading for: ${templateComponentNames.join(', ')}`);
        // Simulate network delay for template loading.
        setTimeout(() => {
            console.log("ApplicationSupport: Templates simulated as loaded after a delay.");
            completionCallback(); // Execute the callback after the simulated load.
        }, 75); // A slightly longer delay for effect.
    }
};

// --- Application Bootstrap Sequence ---
// Load necessary view templates first, then initialize the router and start history.
ApplicationSupport.loadApplicationTemplatesAsync(['DefaultDashboardView', 'ApplicationHeaderComponent', 'DynamicWidgetsView'], function() { // Renamed view names
    // Instantiate the main application router.
    // Making it a global property for easy access in the console, if needed.
    window.applicationCoreRouter = new MainAppNavigationController(); // Renamed from 'app'

    // Begin Backbone's history management.
    // Added `pushState: true` for cleaner URLs without hashbangs.
    Backbone.history.start({ pushState: true });
    console.log("Backbone.history started. Application is now ready for routing.");
});