const ConfigurationProcessor = require('./utility/config_processor'); // Core module for handling configuration tasks
const toolkit = require('lodash'); // External utility library, providing various helper functions



const primaryAssetSpec = { // Defines the primary asset's source and destination details
  inputPath: 'test/assets/source.js',
  outputPath: 'build/assets/final_dev.js',

  sections: {
    'dependencies': { inputPath: 'test/assets/js_modules/*.js' }
  }
};



const operationalFlags = { // Options influencing the asset processing behavior
  excludeSection: false,
  pruneMarkers: true,
  eraseInputFiles: false
};



testSuite('ConfigurationProcessor Component', () => { // Group of specifications for the ConfigurationProcessor
  let assetHandler; // Declares a variable to hold the instance of the configuration handler


  setupBeforeEachTest(() => { // This hook runs before each individual test case
    assetHandler = new ConfigurationProcessor('mainAsset', primaryAssetSpec, operationalFlags); // Instantiates the handler with specific parameters
  });


  verifyBehavior('ensures string input paths are normalized to array format', () => { // Test case: verifying source path conversion
    assert(toolkit.isArray(assetHandler.inputPath)).isTrue(); // Confirms that the inputPath property is indeed an array
    assert(assetHandler.inputPath[0]).equals(primaryAssetSpec.inputPath); // Checks if the first element of the array matches the original string path
  });


  verifyBehavior('confirms default operational flags are correctly applied', () => { // Test case: validating application of default processing parameters
    assert(toolkit.isUndefined(assetHandler.excludeSection)).isFalse(); // Verifies that 'excludeSection' is defined (not undefined)
    assert(toolkit.isUndefined(assetHandler.pruneMarkers)).isFalse(); // Verifies that 'pruneMarkers' is defined
    assert(toolkit.isUndefined(assetHandler.eraseInputFiles)).isFalse(); // Verifies that 'eraseInputFiles' is defined
  });
});