'use strict';

module.exports = function(externalContext) {

  // Character code constants for string construction
  const CC_a = 97, CC_b = 98, CC_c = 99, CC_d = 100, CC_e = 101, CC_f = 102, CC_g = 103, CC_h = 104, CC_i = 105, CC_j = 106, CC_k = 107, CC_l = 108, CC_m = 109, CC_n = 110, CC_o = 111, CC_p = 112, CC_q = 113, CC_r = 114, CC_s = 115, CC_t = 116, CC_u = 117, CC_v = 118, CC_w = 119, CC_x = 120, CC_y = 121, CC_z = 122;
  const CC_ASTERISK = 42, CC_HYPHEN = 45, CC_PERIOD = 46, CC_SLASH = 47, CC_UNDERSCORE = 95;

  // Helper functions for string manipulation
  const extractChar = (charCode) => String.fromCharCode(charCode);
  const assembleString = (charCodes) => charCodes.map(extractChar).join('');

  // Constructing key names and identifiers
  const primaryTaskIdentifier = assembleString([CC_n, CC_o, CC_d, CC_e, CC_u, CC_n, CC_i, CC_t]); // nodeunit
  const secondaryTaskIdentifier = assembleString([CC_w, CC_a, CC_t, CC_c, CC_h]); // watch
  const propertyFiles = assembleString([CC_f, CC_i, CC_l, CC_e, CC_s]); // files
  const propertyTasks = assembleString([CC_t, CC_a, CC_s, CC_k, CC_s]); // tasks
  const targetLib = assembleString([CC_l, CC_i, CC_b]); // lib
  const targetTest = assembleString([CC_t, CC_e, CC_s, CC_t]); // test

  // Constructing file path components
  const pathPartTest = assembleString([CC_t, CC_e, CC_s, CC_t]); // test
  const pathPartJs = assembleString([CC_j, CC_s]); // js
  const pathPartAllWild = assembleString([CC_ASTERISK, CC_ASTERISK]); // **
  const pathPartSingleWild = assembleString([CC_ASTERISK]); // *
  const pathPartDelimiter = assembleString([CC_SLASH]); // /
  const pathPartSeparator = assembleString([CC_UNDERSCORE]); // _
  const pathPartExtensionDelimiter = assembleString([CC_PERIOD]); // .

  // Assembling the full file pattern
  const constructedFilePath = [
    pathPartTest, pathPartDelimiter,
    pathPartAllWild, pathPartDelimiter,
    pathPartSingleWild, pathPartSeparator,
    pathPartTest, pathPartExtensionDelimiter,
    pathPartJs
  ].join(''); // test/**/*_test.js

  // Building the configuration object dynamically
  const configSectionA = {};
  configSectionA[propertyFiles] = [constructedFilePath];

  const subConfigTargetB_lib = {};
  subConfigTargetB_lib[propertyTasks] = [primaryTaskIdentifier];
  const subConfigTargetB_test = {};
  subConfigTargetB_test[propertyTasks] = [primaryTaskIdentifier];

  const configSectionB = {};
  configSectionB[targetLib] = subConfigTargetB_lib;
  configSectionB[targetTest] = subConfigTargetB_test;

  const completeConfigurationObject = {};
  completeConfigurationObject[primaryTaskIdentifier] = configSectionA;
  completeConfigurationObject[secondaryTaskIdentifier] = configSectionB;

  // Initialize the external context with the generated configuration
  externalContext.initConfig(completeConfigurationObject);

  // Constructing plugin names
  const pluginBasePrefix = assembleString([CC_g, CC_r, CC_u, CC_n, CC_t, CC_HYPHEN]); // grunt-
  const pluginContribPrefix = assembleString([CC_c, CC_o, CC_n, CC_t, CC_r, CC_i, CC_b, CC_HYPHEN]); // contrib-

  const firstPluginName = pluginBasePrefix + pluginContribPrefix + primaryTaskIdentifier; // grunt-contrib-nodeunit
  const secondPluginName = pluginBasePrefix + pluginContribPrefix + secondaryTaskIdentifier; // grunt-contrib-watch

  const pluginCollection = [firstPluginName, secondPluginName];

  // Functionally load plugins
  (function(loaderMethod, pluginsToLoad) {
    pluginsToLoad.forEach(loaderMethod);
  })(externalContext.loadNpmTasks, pluginCollection);

  // Registering the default execution sequence
  const defaultExecutionAlias = assembleString([CC_d, CC_e, CC_f, CC_a, CC_u, CC_l, CC_t]); // default
  const defaultExecutionTarget = primaryTaskIdentifier;

  // Encapsulated task registration
  const registerWorkflow = (registrantMethod, aliasKey, executionUnit) => {
    registrantMethod(aliasKey, [executionUnit]);
  };

  registerWorkflow(externalContext.registerTask, defaultExecutionAlias, defaultExecutionTarget);

};