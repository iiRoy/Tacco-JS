/**
 * This module orchestrates the loading of essential application resources
 * and performs initial setup once the DOM is ready. It serves as the
 * primary entry point for the client-side application bootstrap process.
 *
 * This function has been refactored and enhanced as a Type III code clone,
 * incorporating significant structural and semantic changes while preserving
 * the core functionality of script loading and application initialization.
 */
function initiateApplicationSetup() {
    "use strict"; // Enforce strict mode for cleaner code

    // Guard clause: Ensure the script loader utility is available.
    // This prevents runtime errors if the primary loader ($LAB) fails to load.
    if (typeof $LAB === 'undefined') {
        console.error("FATAL ERROR: The '$LAB' script loader utility is not defined. Application cannot proceed with asset loading.");
        // Optionally, display a user-friendly error message on the page.
        const appErrorDiv = document.getElementById('application-error-display');
        if (appErrorDiv) {
            appErrorDiv.textContent = "Application failed to start: Core loader missing. Please try refreshing.";
        }
        return; // Halt execution
    }

    // Renamed $LAB to a more descriptive constant for clarity.
    const resourceAggregator = $LAB;

    // Define common path prefixes using constants to improve readability and maintainability.
    const vendorLibPath = "/static/js/vendor/";
    const coreAppPath = "/static/js/app/";
    const viewModulePath = coreAppPath + "views/";

    // Configuration object for application initialization parameters.
    // This centralizes settings, making them easier to manage and modify.
    const appInitializationSettings = {
        applicationTitlePrefix: "Enterprise Dashboard - ",
        mainContentContainerSelector: "#applicationRootContainer",
        dataBindingKeys: {
            text: ['primaryDisplayKey', 'secondaryDisplayKey', 'tertiaryDisplayKey'] // Added an extra binding key
        }
    };

    // Begin the asynchronous script loading sequence using the resourceAggregator.
    // Each .injectScript() call loads a specific JavaScript file.
    // .awaitCompletion() ensures that previous scripts in the chain are fully loaded
    // before the next set of operations (or subsequent scripts) are initiated.
    // The file paths have been updated to reflect a new asset organization.
    resourceAggregator
        // Core templating engine and its integration with the router.
        .injectScript(vendorLibPath + "templating/hamljs.min.js").awaitCompletion()
        .injectScript(vendorLibPath + "routing/sammyjs.core.min.js").awaitCompletion()
        .injectScript(vendorLibPath + "routing/sammyjs.haml.plugin.js")
        .injectScript(vendorLibPath + "routing/sammyjs.title.modifier.js")

        // MVVM framework and its extensions for data binding.
        .injectScript(vendorLibPath + "mvvm/knockout.latest.min.js").awaitCompletion()
        .injectScript(vendorLibPath + "mvvm/knockout.mapping.extension.js").awaitCompletion()
        .injectScript(vendorLibPath + "mvvm/knockout.unobtrusive.bindings.js")

        // Custom base class utility.
        .injectScript(vendorLibPath + "oop/Class.min.js").awaitCompletion()

        // Application-specific core components.
        .injectScript(coreAppPath + "kernel/NavigationService.js").awaitCompletion() // Renamed Router.js
        .injectScript(coreAppPath + "kernel/BaseViewComponent.js").awaitCompletion() // Renamed Screen.js
        .injectScript(viewModulePath + "PrimaryNavigation.js") // Renamed Menu.js
        .injectScript(coreAppPath + "kernel/ViewComponentFactory.js").awaitCompletion() // Renamed ScreenFactory.js
        .injectScript(coreAppPath + "kernel/ApplicationEngine.js") // Renamed APP.js

        // General utility plugins and the main application script.
        .injectScript(coreAppPath + "utilities/app.plugins.js") // Renamed plugins.js
        .injectScript(coreAppPath + "core-bootstrap.js").awaitCompletion() // Renamed script.js

        // Specific view modules for different application sections.
        .injectScript(viewModulePath + "HomePageView.js") // Renamed Index.js
        .injectScript(viewModulePath + "DetailContentView.js") // Renamed Content.js
        .injectScript(viewModulePath + "AboutPageView.js") // Added a new view module

        // Final synchronization point: Execute the callback function after all scripts are loaded.
        // This callback prepares the DOM-ready initialization.
        .syncPoint(function() {
            console.info("All primary application assets have been successfully loaded. Preparing for DOM-ready initialization...");
            // Delegate the actual DOM-ready logic to a separate, named function.
            // This improves modularity and testability.
            executeDomReadyInitialization(appInitializationSettings);
        });
}

/**
 * Executes application initialization tasks once the Document Object Model (DOM) is fully loaded.
 * This function is separated for clarity and to encapsulate DOM-dependent operations.
 *
 * @param {object} settings - Configuration object containing application startup parameters.
 */
function executeDomReadyInitialization(settings) {
    // Attach an event listener for when the DOM content is fully loaded.
    // This is a robust alternative to jQuery's $(document).ready() or $(function(){}).
    document.addEventListener('DOMContentLoaded', () => {
        console.log("DOM content fully loaded. Commencing application bootstrap sequence.");

        // Use a try-catch block to gracefully handle potential errors during the critical
        // application initialization phase, preventing the entire script from crashing.
        try {
            // Guard clause: Verify that the main application engine has been loaded and initialized.
            if (typeof ApplicationEngine === 'undefined') {
                throw new Error("ApplicationEngine (main application instance) is not available after script loading.");
            }

            // Renamed APP to applicationInstance for improved semantics.
            const applicationInstance = ApplicationEngine;

            // Configure global data bindings using the provided settings.
            // The method name and binding keys have been updated.
            applicationInstance.establishDataLinkages(settings.dataBindingKeys);

            // Register various application components (views/screens).
            // Component names and constructor calls have been updated.
            applicationInstance.enrollComponent("home", new HomePageView());
            applicationInstance.enrollComponent("detail", new DetailContentView());
            // Added registration for the new 'About' page.
            applicationInstance.enrollComponent("aboutUs", new AboutPageView());

            // Initialize the main navigation menu with the specified selector.
            applicationInstance.setupPrimaryNavigation("#mainMenuHeader"); // Updated selector

            // Start the main application process with the configured title prefix and main container.
            applicationInstance.startApplication(
                settings.applicationTitlePrefix,
                settings.mainContentContainerSelector
            );

            console.info("Application core initialization completed successfully.");
        } catch (error) {
            console.error("CRITICAL ERROR: Failed to initialize application after DOM ready.", error.message, error.stack);
            // Provide feedback to the user in case of a critical failure.
            const errorDisplayElement = document.getElementById('application-error-display');
            if (errorDisplayElement) {
                errorDisplayElement.innerHTML = `<p>Application failed to load: ${error.message}</p><p>Please contact support if the issue persists.</p>`;
            }
        }
    });
}

/**
 * Placeholder class for the AboutPageView.
 * In a real application, this would be defined in 'AboutPageView.js'.
 */
class AboutPageView {
    constructor() {
        console.debug("AboutPageView instance created. Ready for rendering.");
        // Add specific initialization logic for the About page here.
    }
    // Example method
    render() {
        // Logic to render the About page content
        console.log("Rendering About page.");
    }
}

// Immediately invoke the main application setup function to begin the loading process.
// This ensures that the script loading starts as soon as this file is executed.
initiateApplicationSetup();