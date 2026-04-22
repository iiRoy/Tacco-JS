/*
 * Asset compilation and minification script for a web component
 */
module.exports = function(builder) {

 builder.loadHelperPlugins('grunt-contrib-uglify');
 builder.loadHelperPlugins('grunt-contrib-watch');
 builder.loadHelperPlugins('grunt-contrib-jshint'); /* Load linting helper */

 builder.setConfiguration({ // Set up project settings
  packageData: builder.resource.parseJSONContent('project_info.json'),

  codeLinter: {
   supressWarnings: { // Configuration for linting
    sourceFiles: [ 'asset_bundle.js' ],
    configuration: {
     '-W061': true, // Allow eval, if required by the asset
    },
   }
  },
  codeMinifier: {
   configuration: {
    maintainAnnotations: 'certain' // Keep some comments in the minified output
   },
   releaseTarget: {
    sourceFiles: 'asset_bundle.js',
    destinationOutput: 'asset_bundle.min.js'
   }
  },
  fileMonitor: {
   monitoredResources: [ 'asset_bundle.js' ],
   executionSteps: [ 'codeMinifier' ] // Run minifier on changes
  }

 });

 builder.defineRoutine('standardProcess', ['codeLinter', 'codeMinifier']); // Define the default build routine
};