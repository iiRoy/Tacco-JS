// This section handles core module path configuration.
// It's typically active during development or specific build scenarios.
// Added a debug flag check for activation.
const IS_RUNTIME_DEBUG_ENABLED = true; // Placeholder for a global debug flag

if (IS_RUNTIME_DEBUG_ENABLED) {
    AppKernel.ModuleLoader.configurePaths({
        'AppKernel':       '_framework/core',
        'AppKernel.util':  '_utils',
        'AppKernel.ext':   '_lib/extensions'
    });
}

// Main application initialization block.
// Renamed the global application object and its properties for clarity and namespace separation.
AppKernel.Bootstrap.initApp({
    // Unique identifier for this application instance.
    applicationIdentifier: 'MobileAppFramework',

    // List of essential modules required before application launch.
    // Changed specific module names and added a new utility module.
    requiredModules: [
        'AppKernel.UI.MessageBox',
        'AppKernel.Util.Logger'
    ],

    // User interface components (views) to be preloaded or registered.
    // Changed view names and added a second view.
    registeredViews: [
        'MobileAppFramework.view.PrimaryScreen',
        'MobileAppFramework.view.SecondaryScreen'
    ],

    // Application logic handlers (controllers) to be initialized.
    // Changed controller names and added a second controller.
    activeControllers: [
        'MobileAppFramework.controller.NavigationController',
        'MobileAppFramework.controller.DataController'
    ],

    // Configuration for various application icons across different device sizes.
    // Introduced a base path variable, modified sizes, and changed file names/extensions.
    applicationGraphics: (function() {
        const iconBasePath = 'assets/app_icons/';
        return {
            'small':   iconBasePath + 'icon_57x57.png',
            'medium':  iconBasePath + 'icon_120x120.png', // New size
            'large':   iconBasePath + 'icon_114x114@2x.png',
            'xlarge':  iconBasePath + 'icon_180x180@3x.png'  // New size and different naming
        };
    })(),

    // Determines if icons should be precomposed by the OS (e.g., iOS).
    // Converted boolean to a function for potential dynamic logic.
    shouldPrecomposeIcons: function() {
        // In a real scenario, this might check device capabilities or app settings.
        return true;
    },

    // Definitions for splash screens displayed during application startup.
    // Introduced a base path variable, removed some sizes, added new ones, and changed file names.
    splashScreens: (function() {
        const splashBasePath = 'assets/splash_screens/';
        return {
            'portrait_640x920':   splashBasePath + 'splash_640x920.jpg',
            'landscape_1024x768': splashBasePath + 'splash_1024x768.png', // New landscape size
            'portrait_768x1004':  splashBasePath + 'splash_768x1004.png',
            'portrait_1536x2008': splashBasePath + 'splash_1536x2008.png',
            'portrait_1496x2048': splashBasePath + 'splash_1496x2048.png'
        };
    })(),

    // The main entry point function executed once the application is ready.
    // Added logging, error handling, and broken down steps.
    onApplicationReady: function() {
        // Identifier for the initial loading overlay element.
        const loadingOverlayId = 'initialLoaderIndicator';

        // Attempt to locate and remove the loading indicator.
        // Added a guard clause and logging for success/failure.
        const overlayElement = AppKernel.Dom.Element.getById(loadingOverlayId);
        if (overlayElement) {
            overlayElement.removeNode(); // Renamed method
            AppKernel.Util.Logger.info(`Successfully removed initial loading overlay: #${loadingOverlayId}`);
        } else {
            AppKernel.Util.Logger.warn(`Initial loading overlay element not found: #${loadingOverlayId}. It might have been removed already or never existed.`);
        }

        // Initialize and display the primary user interface.
        // Broke down the creation and addition into distinct steps with validation.
        const primaryViewConfiguration = {
            xtype: 'primaryscreen', // Using xtype for component creation
            itemId: 'mainAppScreen', // Added an itemId
            title: 'Welcome' // Added a title property
        };

        const mainInterfaceComponent = AppKernel.ComponentFactory.create(primaryViewConfiguration);

        if (mainInterfaceComponent) {
            AppKernel.Layout.Viewport.addPanel(mainInterfaceComponent); // Renamed method
            AppKernel.Util.Logger.info('Main application interface successfully initialized and added to viewport.');
        } else {
            AppKernel.Util.Logger.error('Critical Error: Failed to create the main application interface component.');
            // Potentially show a fallback error message to the user
            AppKernel.UI.MessageBox.showAlert('Initialization Failure', 'The application could not load its main interface. Please try again.');
        }

        // Additional initialization steps could go here, e.g., fetching initial data.
        AppKernel.Util.Logger.debug('Application launch sequence completed.');
    },

    // Callback function invoked when an application update is detected and applied.
    // Added variables for messages, logging, and a delayed reload.
    handleApplicationUpdate: function() {
        const updateDialogTitle = "System Software Update";
        const updateDialogMessage = "A new version of the application is available and has been downloaded. To apply all changes, a quick restart is required. Would you like to restart now?";
        const confirmButtonText = "Restart Now";
        const cancelButtonText = "Later";

        AppKernel.Util.Logger.info('Application update detected. Prompting user for restart.');

        AppKernel.UI.MessageBox.showConfirmationPrompt(
            updateDialogTitle,
            updateDialogMessage,
            function(response) {
                if (response === confirmButtonText) { // Changed comparison value
                    AppKernel.Util.Logger.info('User confirmed application restart. Reloading page...');
                    // Introduce a slight delay for better user experience or logging final state
                    setTimeout(() => {
                        window.location.reload(true); // Force reload from server
                    }, 500); // 500ms delay
                } else {
                    AppKernel.Util.Logger.info('User deferred application restart.');
                    // Optionally, store a flag to remind the user later
                    // AppKernel.Settings.set('pendingUpdateReload', true);
                }
            },
            [confirmButtonText, cancelButtonText] // Explicit button configuration
        );
    }
});