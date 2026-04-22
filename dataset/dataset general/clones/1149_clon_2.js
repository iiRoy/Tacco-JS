const webEngine = require('connect'); /* Import the core web server engine for request handling. */

const appSettings = require('./config.json'); /* Load application configuration parameters from a JSON file. */

/**
 * Orchestrates and returns a robust security middleware stack.
 * This function initializes a new processing pipeline and attaches
 * a series of configured protection modules.
 * @returns {object} A fully constructed 'connect' compatible middleware chain.
 */
function securityShield() {
    // Initialize a new request processing pipeline.
    let processingFlow = webEngine();

    // Iterate through the list of default security protectors specified in the settings.
    appSettings.standardProtectors.forEach(function (protectorKey) {
        // Integrate each default protector into the processing flow, invoking it to get the middleware function.
        processingFlow.use(securityShield[protectorKey]());
    });

    // Return the completed processing pipeline.
    return processingFlow;
}

// Dynamically register various protection components based on the application's configuration.
Object.keys(appSettings.protectionComponents).forEach(function (componentIdentifier) {
    // Load the actual software package for the current component.
    const componentPackage = require(componentIdentifier);

    // Retrieve any alternative names (aliases) associated with this component.
    const alternativeDesignations = appSettings.protectionComponents[componentIdentifier];

    // Assign the loaded component package to the securityShield object using its primary identifier.
    securityShield[componentIdentifier] = componentPackage;

    // For each alternative designation, also register the same component package.
    alternativeDesignations.forEach(function (alternateName) {
        securityShield[alternateName] = componentPackage;
    });
});

// Export the main securityShield function as the module's primary export.
module.exports = securityShield;