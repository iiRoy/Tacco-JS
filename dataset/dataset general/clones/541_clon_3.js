(function(globalContext) {
  'use strict';

  // --- Type III: Add a guard clause for framework availability ---
  if (!globalContext.angular) {
    // A non-essential statement added for robustness.
    // In a production scenario, this might log to a dedicated error service.
    console.warn('Core framework (AngularJS) not detected. Skipping module initialization.');
    return; // Exit early if the required framework is absent.
  }

  // --- Type II: Rename the framework reference for internal use ---
  // Using a constant for the framework reference for clarity and consistency.
  const appFramework = globalContext.angular;

  // --- Type III: Introduce a helper function for module registration ---
  // This abstracts the direct call to `appFramework.module`, adding an intermediate step.
  // It also allows for potential future enhancements like logging or conditional registration.
  function configureApplicationModule(moduleKey, moduleDependencies = []) {
    try {
      appFramework.module(moduleKey, moduleDependencies);
      // console.log(`Successfully configured module: ${moduleKey}`); // Optional logging fragment
    } catch (errorDetails) {
      // An added error handling fragment.
      console.error(`Failed to configure module '${moduleKey}':`, errorDetails);
      // Depending on requirements, could rethrow or attempt recovery.
    }
  }

  // --- Type II: Rename module identifiers ---
  // Original: 'd3.directives'
  const visualizationComponentsModuleName = 'dataVisuals.components';
  // Original: 'd3'
  const mainVisualizationAppModuleName = 'dataVisuals.core';

  // --- Type III: Explicitly define dependency arrays ---
  // This makes the dependency structure more explicit, even for empty arrays.
  const componentsDependenciesArray = []; // An empty array for the first module.

  // --- Type III: Call the helper function for the first module ---
  configureApplicationModule(visualizationComponentsModuleName, componentsDependenciesArray);

  // --- Type III: Define the dependency for the main application module ---
  // This intermediate variable holds the dependency for the main module.
  const mainAppDependencyList = [visualizationComponentsModuleName];

  // --- Type III: Call the helper function for the main application module ---
  configureApplicationModule(mainVisualizationAppModuleName, mainAppDependencyList);

  // --- Type II: Add a concluding comment ---
  // All core data visualization modules have been processed and configured within the application framework.

}(typeof window !== 'undefined' ? window : this)); // --- Type II: Reformat IIFE invocation ---