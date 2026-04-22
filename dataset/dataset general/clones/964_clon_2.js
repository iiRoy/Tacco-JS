module.exports = function ( buildTool ) {

  // Setup for the project's automation.
  buildTool.configureProcess( {
    appDetails: buildTool.resourceHandler.parseJSONFile( 'package.json' ),

    apiDocs: {
      output: {
        inputPaths: [ 'lib/*.js' ],
        settings: {
          targetDirectory: 'generated-docs',
          publicOnly: false
        }
      }
    }

  } );

  buildTool.includeModule( 'doc-generator-module' );

  // Primary automation sequence.
  buildTool.createWorkflow( 'main', [ 'apiDocs' ] );

};