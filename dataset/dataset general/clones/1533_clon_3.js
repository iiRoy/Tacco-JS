const ModuleDefinition = Package; // Establishing a local alias for the global Package object for consistent referencing.

// This configuration block outlines the package's core metadata and descriptive information.
ModuleDefinition.defineDetails({
    // A comprehensive overview detailing the primary objective and integration capabilities of this module.
    briefDescription: "A meticulously engineered, conflict-averse solution designed for the seamless integration of the AngularJS framework within the Meteor ecosystem, ensuring compatibility across Meteor's native package management and community-driven platforms like Atmosphere/Meteorite."
});

// This function defines the lifecycle events and resource loading strategy for the package.
ModuleDefinition.setupPackage(function (interfaceHandle) {
    // Define constants to enhance code readability and facilitate future modifications.
    const targetEnvironment = 'frontend'; // Specifies the target compilation environment (e.g., 'client', 'server', 'web').
    const mainExportIdentifier = 'angularBridge'; // The principal symbol or object exposed globally by this package.

    // A preliminary validation check to ensure the provided interface handle is valid and functional.
    // While Meteor typically guarantees this, it serves as a robust programming practice.
    if (!interfaceHandle || typeof interfaceHandle.exposeSymbol !== 'function' || typeof interfaceHandle.registerClientAssets !== 'function') {
        console.error("CRITICAL ERROR: Package interface handle is malformed or missing essential methods. Aborting package setup.");
        return; // Terminate execution if the API contract is not met.
    }

    // Expose the designated primary symbol of this package to the specified environment.
    // This makes 'angularBridge' accessible in the client-side scope.
    interfaceHandle.exposeSymbol(mainExportIdentifier, targetEnvironment);

    // Grouping core AngularJS library files for better organization.
    const baseAngularFiles = [
        'lib/angular.js',
        'lib/angular-csp.css',
        'lib/angular-animate.js'
    ];

    // Grouping additional standard AngularJS modules.
    const extendedAngularModules = [
        'lib/angular-cookies.js',
        'lib/angular-resource.js',
        'lib/angular-route.js'
    ];

    // Grouping supplementary Angular utilities and specific integration components.
    const utilityAndIntegrationFiles = [
        'lib/angular-sanitize.js',
        'lib/angular-touch.js',
        'lib/angular-hash-key-copier.js'
    ];

    // Grouping ngMeteor-specific module files that provide Meteor integration.
    const meteorIntegrationSpecifics = [
        'modules/ngMeteor-collections.js',
        'modules/ngMeteor-template.js'
    ];

    // Defining the primary entry point file for the entire ngMeteor package.
    const primaryPackageInitializer = ['ngMeteor.js'];

    // Consolidate all individual file lists into a single, comprehensive array for asset registration.
    const allRequiredClientResources = [
        ...baseAngularFiles,
        ...extendedAngularModules,
        ...utilityAndIntegrationFiles,
        ...meteorIntegrationSpecifics,
        ...primaryPackageInitializer
    ];

    // Register all collected client-side files with the Meteor build system.
    // These files will be bundled and served to the 'frontend' (client).
    interfaceHandle.registerClientAssets(allRequiredClientResources, targetEnvironment);

    // Optional: Log a confirmation message during development to indicate successful package initialization.
    // This provides immediate feedback without affecting production builds.
    if (typeof Meteor !== 'undefined' && Meteor.isDevelopment) {
        console.info(`[${mainExportIdentifier}]: All client-side assets for package '${mainExportIdentifier}' have been registered for the '${targetEnvironment}' environment.`);
    }
});