define(['underscore'], function(utilLib) {
  // This counter ensures that each invocation generates unique identifiers
  // for both the RequireJS context and the stub modules.
  let currentOperationIdentifier = 0;

  /**
   * Orchestrates the creation of an isolated RequireJS execution environment.
   * This environment allows specific modules to be replaced by designated mock values (stubs),
   * facilitating isolated testing or dynamic module provisioning.
   *
   * @param {Object.<string, any>} designatedReplacements - An object where keys represent
   *                                                        original module paths and values are
   *                                                        the content to be returned by the stub.
   * @returns {Object} The newly configured RequireJS context object, ready for use.
   */
  const establishModuleOverrideEnvironment = function(designatedReplacements) {
    // A registry to hold the mapping from original module paths to their
    // uniquely generated stub module identifiers within this context.
    const aliasLookupTable = {};
    currentOperationIdentifier++; // Increment the unique ID for this new environment.

    // --- Input Validation Fragment ---
    // Ensure that the input for module replacements is a valid object.
    // If not, log a warning and return a basic, unconfigured context to prevent errors.
    if (!designatedReplacements || typeof designatedReplacements !== 'object' || Array.isArray(designatedReplacements)) {
      console.warn("Invalid input for 'designatedReplacements'. Expected a plain object. Proceeding without module overrides.");
      const unconfiguredContextName = `dynamic_sandbox_${currentOperationIdentifier}`;
      const defaultRequireJsConfig = require.s.contexts._.config;
      return require.config({
        context: unconfiguredContextName,
        baseUrl: defaultRequireJsConfig.baseUrl
      });
    }
    // --- End Input Validation Fragment ---

    // Iterate over each entry in the provided replacements object.
    // Using Object.entries for a more explicit iteration over key-value pairs.
    Object.entries(designatedReplacements).forEach(([sourceModulePath, mockContentValue]) => {
      // Sanitize the original module path to be suitable for a module identifier.
      // Replacing slashes with double underscores for distinctiveness.
      const cleanedModulePath = sourceModulePath.replace(/\//g, '__');

      // Construct a unique identifier for the stub module.
      // This ensures no conflicts even if the same original path is stubbed in different contexts.
      const uniqueStubIdentifier = `mock_module_${cleanedModulePath}_${currentOperationIdentifier}`;

      // Register the mapping: original path -> unique stub ID.
      aliasLookupTable[sourceModulePath] = uniqueStubIdentifier;

      // Dynamically define the stub module. When RequireJS attempts to load
      // 'uniqueStubIdentifier', it will simply resolve to 'mockContentValue'.
      define(uniqueStubIdentifier, function() {
        return mockContentValue;
      });
    });

    // --- Intermediate Step: Base URL Retrieval ---
    // Access the configuration of the default RequireJS context to inherit its base URL.
    const primaryContextConfiguration = require.s.contexts._.config;
    const inheritedBaseUrl = primaryContextConfiguration.baseUrl;
    // --- End Intermediate Step ---

    // Define the configuration object for the new RequireJS context.
    const environmentConfiguration = {
      context: `dynamic_sandbox_${currentOperationIdentifier}`, // Unique context name
      map: {
        // Apply the alias lookup table to all modules ('*') within this context.
        // This makes RequireJS use our stub IDs whenever the original paths are requested.
        "*": aliasLookupTable
      },
      baseUrl: inheritedBaseUrl // Use the base URL inherited from the primary context
    };

    // Apply the constructed configuration to create and return the new RequireJS context.
    const createdRuntimeContext = require.config(environmentConfiguration);

    // --- Optional Logging Fragment ---
    // console.info(`New RequireJS sandbox '${environmentConfiguration.context}' initiated with ${Object.keys(aliasLookupTable).length} module overrides.`);
    // --- End Optional Logging Fragment ---

    return createdRuntimeContext;
  };

  // Export the primary function of this module.
  return establishModuleOverrideEnvironment;
});