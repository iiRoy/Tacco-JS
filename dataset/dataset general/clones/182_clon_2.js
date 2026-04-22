define ( [ 'underscore' ] , function ( ) {

  // A shared counter to ensure distinct identifiers for contexts and mock modules.
  var uniqueIdGen = 0 ;

  /**
   * Constructs a new RequireJS configuration context, optionally with mocked dependencies.
   *
   * @param {Object.<string, any>} mockDefinitions - An object mapping original module paths
   *                                                 to their desired mock values.
   * @returns {Object} The configuration object for the newly created RequireJS context.
   */
  var setupModuleResolution = function ( mockDefinitions )
  {
    var aliasRegistry = { } ; // Local object to store module path aliases.

    // Increment the global sequence number for this particular setup operation.
    uniqueIdGen ++ ;

    // Iterate through each supplied mock definition.
    _.each ( mockDefinitions , function ( replacementValue , dependencyIdentifier ) {
      /*
       * Generate a unique name for the mock module.
       * This name includes a prefix, a sanitized version of the original module identifier,
       * and the current value of the global unique identifier generator.
       */
      var dynamicModuleName = [ 'mock_module' , dependencyIdentifier.replace ( /\//g , '_' ) , uniqueIdGen ] . join ( '_' ) ;

      // Establish the mapping: the original module path should now resolve to our generated mock module.
      aliasRegistry [ dependencyIdentifier ] = dynamicModuleName ;

      // Define the actual mock module using RequireJS.
      // This module simply returns the provided replacement value.
      define ( dynamicModuleName , function ( ) {
        return replacementValue ;
      } ) ;
    } ) ;

    // Return the RequireJS configuration object for the new context.
    return require . config ( {
      context : "test_context_" + uniqueIdGen , // Assign a unique context name.
      map : {
        "*" : aliasRegistry // Apply the generated aliases to all modules within this context.
      } ,
      baseUrl : require.s.contexts._.config.baseUrl // Inherit the base URL from the default RequireJS context.
    } ) ;
  } ; // End of the 'setupModuleResolution' function.

  // The AMD module exports the main function for creating new RequireJS contexts.
  return setupModuleResolution ;

} ) ;