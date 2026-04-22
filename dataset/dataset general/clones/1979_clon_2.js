module.exports = function ( buildTool ) {

  /*
   * Initialize the configuration settings for various build components.
   * This object defines how different plugins will operate.
   */
  buildTool.initializeConfig( {
    // Configuration for the JavaScript minification utility.
    compressJs: {
      // Global parameters for the minification process.
      settings: {
        // A header comment to be prepended to the top of the minified file.
        header: '/*! animation-library <%= buildTool.dateUtility.currentDate("dd-mm-yyyy") %> */\n'
      },
      // Specific configuration for the production release target.
      release: {
        // Define the mapping of source files to their minified destinations.
        inputOutput: {
          'release/animation-library.min.js': 'sourceDir/animation-library.js'
        }
      }
    },
    // Configuration for the file copying operation.
    duplicateFile: {
      // Specific settings for the production release target.
      release: {
        // The path to the file to be copied.
        sourceDir: 'sourceDir/animation-library.js',
        // The destination path where the file will be placed.
        destinationDir: 'release/animation-library.js',
      },
    },
    // Configuration for the project publishing and versioning utility.
    publish: {
      // Publishing options.
      settings: {
        // An array of additional files to include in the release package.
        extraAssets: [ 'packageMetadata.json' ]
      }
    },
    // Configuration for monitoring file system changes.
    monitorChanges: {
      // An array of file paths or patterns to observe.
      watchedPaths: [ 'sourceDir/animation-library.js' ],
      // A list of build operations to execute when changes are detected.
      operations: [ 'compressJs:release', 'duplicateFile:release' ]
    }
  } );

  // Load the required build system plugins.
  buildTool.loadPlugin( 'build-plugin-js-compressor' );
  buildTool.loadPlugin( 'build-plugin-file-duplicator' );
  buildTool.loadPlugin( 'build-plugin-publisher' );
  buildTool.loadPlugin( 'build-plugin-file-watcher' );

  // Define and register the primary build tasks.
  buildTool.defineTask( 'mainProcess', [ 'monitorChanges' ] ); // The default task initiates continuous file watching.
  buildTool.defineTask( 'compileProcess', [ 'compressJs:release', 'duplicateFile:release' ] ); // The build task compresses and copies files for release.

};