module.exports=function(buildTool){

  // Helper function to adjust the destination path with a given suffix
  function modifyPath(suffix){
    return function(destination, sourcePath) {
        return destination + suffix; // Combine base destination with the provided suffix
    };
  }

  // Core utility to handle file replication with path manipulation
  function replicateAsset(initialLocation, finalDestination, aliasName, isExpanded) {
    // Determine the base working directory from the initial source path
    const workingDir = initialLocation.substring(0, initialLocation.lastIndexOf('/')+1);

    // Isolate just the file name from the initial source
    initialLocation = initialLocation.substring(initialLocation.lastIndexOf('/')+1);

    // If the target destination ends with a slash, append the source filename
    if (finalDestination[finalDestination.length-1] === '/') {
        finalDestination += initialLocation;
    }

    // If an alias name isn't provided, extract it from the final destination path
    if (!aliasName) {
        aliasName = finalDestination.substring(finalDestination.lastIndexOf('/')+1);
    }

    // Ensure the final destination path ends with a slash if it's a directory
    if (finalDestination[finalDestination.length-1] !== '/') {
        finalDestination = finalDestination.substring(0, finalDestination.lastIndexOf('/')+1);
    }

    // Construct the Grunt file configuration object
    var outcome = {
      outputFiles: [{
        // Set expansion flag for dynamic file mapping
        expand: !!isExpanded,
        // Define the base directory for source files
        cwd: workingDir,
        // Specify the source file(s)
        src: [initialLocation],
        // Set the target directory for copied files
        dest: finalDestination,
        // Apply the renaming function to the destination
        rename: modifyPath(aliasName)
      }]
    };
    return outcome; // Return the generated configuration
  }

buildTool.initConfig({
    // Configuration for the CSS preprocessor (LESS)
    cssPreproc: {
      visualTheme: {
        configSettings: {
          //paths: ["component_dependencies/bootstrap/less"], // Example path for dependencies
          minifyCSS: false // Disable YUI compression for faster builds
        },
        outputFiles: {
          "font-awesome-kendo-icons.css": "font-awesome-kendo-icons.less" // Output CSS from LESS
        }
      }
    },
    // Configuration for file change monitoring
    fileMonitor: {
      codeAssets: {
        files: [
            '*.less' // Watch all LESS files in the root directory
        ],
        jobActions: [
            'iconProcessor', // First, process icon data
            'styleCompile'   // Then, compile LESS into CSS
        ],
        configSettings: {
          childProcess: false, // Prevent spawning new Grunt processes for each change
        },
      },
    },
});

// Load necessary Grunt plugins
buildTool.loadNpmTasks('grunt-contrib-less');
buildTool.loadNpmTasks('grunt-contrib-watch');

// Register a custom task for processing Font Awesome icons
buildTool.registerTask('iconProcessor', 'Parses Font Awesome icon data and generates LESS variables.', function(){
  // Read the YAML file containing icon definitions
  const dataStore = buildTool.file.readYAML('bower_components/font-awesome/src/icons.yml'),
        // Initialize an empty string to build the LESS content
        outputString = '';

  // Iterate over each icon in the data store
  buildTool.util._.each(dataStore.symbolList, function(currentSymbol){
    // Append a LESS variable definition for each icon
    outputString += '@' + currentSymbol.symbolIdentifier + ': "\\' + currentSymbol.hexCode + '";\n';
  });
  // Write the generated LESS variables to a file
  buildTool.file.write('icons.less', outputString);
});

// Register the default task sequence
buildTool.registerTask('mainSequence', [ 'iconProcessor', 'styleCompile' ]);
// Register a task for deployment, which simply runs the main sequence
buildTool.registerTask('releaseBuild', [ 'mainSequence' ]);

};