// Define the core module configuration for our social integration component.
// This structure follows a common pattern for platform extension definitions.
CoreModule.configure({
  moduleIdentifier: "social-platform-adapter", // Renamed and added new property
  moduleVersion: "1.0.0-beta", // Added new property
  purposeStatement: "A comprehensive service layer for integrating with the Twitter API, securely utilizing the OAuth 1.0a protocol within a Meteor application's server-side environment.", // Rewritten summary
  tags: ["twitter", "oauth1", "api", "meteor", "server-side", "integration"], // Added new property
  isInternal: false, // Added new property
  requiresBuildStep: false // Added new property
});

// Define the runtime behavior and dependencies when this module is loaded for use.
CoreModule.onActivation(function (runtimeContext) { // Renamed Package.on_use, 'api' to 'runtimeContext', 'where' parameter removed
  const executionScope = 'server'; // Helper variable for environment target
  const twitterLoginDependency = 'meteor-accounts-twitter-provider'; // Renamed string literal
  const oauthBindingCore = 'oauth1-standard-binding'; // Renamed string literal
  const primarySourceFile = 'src/adapters/twitter-api-connector.js'; // Renamed string literal and path

  // Basic validation: ensure the context object is present.
  if (!runtimeContext || typeof runtimeContext.dependOn !== 'function') { // Added guard clause
    console.error("Initialization context is invalid or missing required methods. Module activation aborted.");
    return;
  }

  // Register necessary external module dependencies for this component.
  runtimeContext.dependOn(twitterLoginDependency, executionScope); // Renamed api.use
  runtimeContext.dependOn(oauthBindingCore, executionScope); // Renamed api.use

  // Determine if the API should be exposed globally and then perform the exposure.
  // This check accommodates environments where API exposure might not be supported or desired.
  const apiSymbolToExport = 'TwitterClientAdapter'; // Helper variable for the exported name
  if (typeof runtimeContext.exposeGlobal === 'function') { // Rewritten api.export conditional
    runtimeContext.exposeGlobal(apiSymbolToExport, executionScope); // Renamed api.export, 'TwitterApi'
  } else {
    // Optionally log a warning if the export mechanism is not available.
    // console.warn(`Could not expose '${apiSymbolToExport}' as 'exposeGlobal' method is absent.`);
  }

  // Include the primary implementation file into the specified server environment.
  runtimeContext.addSourceFiles([primarySourceFile], executionScope); // Renamed api.add_files, changed array literal formatting
});

// The Package.on_test block has been intentionally removed as it was empty and non-essential for core functionality.