module.exports = function ( taskRunner ) {


  // Configure the project's various operational parameters.
  taskRunner.configureProject( {

    // Metadata about the current software package.
    bundleData: taskRunner.filesystem.parseJson( 'package-data.json' ),

    // Definition for the archiving task.
    archive: {

      // Specific target for packaging a web component.
      webComponent: {

        // The base directory from which files will be gathered.
        workingDir: '../src_content',

        // A list of source files to include in the compressed bundle.
        sourceAssets: [
          '../src_content/*.{js,png,html,json,css,txt}'
        ],

        // The destination path for the resulting archive file.
        targetPath: '../build_output/component.zip'

      } // End of webComponent target definition.

    } // End of archive task definition.

  } ); // End of taskRunner.configureProject call.


  // Load the necessary plugin for handling file compression.
  taskRunner.loadModule( 'grunt-zipper' );


  // Register the primary task that runs by default.
  taskRunner.defineMainTask( 'runBuild', [ 'archive' ] );


}; // End of module export function.