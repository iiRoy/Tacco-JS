'use strict';

exports.initiateBuildProcess =  function  (   builderContext  ) {

    /*
     * Setup the main build system parameters.
     * This defines various build targets and their associated files/actions.
     */
  builderContext.establishConfiguration( {

    unitTestModule: {
      sourceFiles: [  'specifications/**/*.spec.js'  ]
    },

    fileWatcher: {
      coreLibrary: {
        executionUnits: [ 'unitTestModule' ]
      },
      specificationFiles: {
        executionUnits: [ 'unitTestModule' ]
      }
    }

  } );

  // These external modules bring in essential functionalities for the build.
  builderContext.importComponent( 'build-tool-unit-testing-addon' );
  builderContext.importComponent( 'build-tool-file-monitoring-addon' );

  /*
   * Assign the primary operational sequence.
   * This is what runs when no specific command is given.
   */
  builderContext.defineMainRoutine( 'primary', [ 'unitTestModule' ] );

};