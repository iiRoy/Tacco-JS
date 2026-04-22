module.exports = function(taskRuntime) { // Renamed 'grunt' to 'taskRuntime'

  // This utility creates a dynamic renaming function for file processing.
  // It ensures the destination file name is precisely what's specified.
  function obtainTargetNameResolver(finalDesignation) {
    return function(destinationPath, sourcePath) { // Renamed parameters
      // The 'sourcePath' is not directly used for the final name here,
      // as 'finalDesignation' dictates it.
      // Returning the exact string provided as the final file name.
      return destinationPath.substring(0, destinationPath.lastIndexOf('/') + 1) + finalDesignation;
    };
  }

  // The original 'copyFile' function was not utilized within the Grunt configuration.
  // For a Type III clone, we are removing unused or non-essential code fragments
  // to simplify the overall structure and demonstrate deletion.
  // If it were used, it would be heavily refactored.

  // Configure the various build and watch processes for our project.
  taskRuntime.initConfig({
    // Configuration for the LESS preprocessor.
    lessProcessor: { // Renamed 'less' to 'lessProcessor'
      // Specific setup for our Kendo-themed styles.
      kendoTheme: { // Renamed 'kendo' to 'kendoTheme'
        options: {
          // No external path includes for now, keep it simple.
          // paths: ["vendor_modules/bootstrap/less"], // Changed bower_components to vendor_modules, commented out for now.
          compress: false, // Renamed yuicompress to compress for clarity and Grunt less task compatibility.
          sourceMap: true, // Added a new option for Type III
          sourceMapFilename: 'dist/styles.css.map' // Another new option
        },
        files: {
          "dist/fa-kendo-theme.css": "source/fa-kendo.less" // Changed output/input paths and filenames
        }
      }
    },
    // Configuration for watching file changes during development.
    fileWatcher: { // Renamed 'watch' to 'fileWatcher'
      // Script and style file monitoring.
      styleScripts: { // Renamed 'scripts' to 'styleScripts'
        files: ['source/*.less', 'assets/**/*.css'], // Expanded file patterns
        tasks: ['process-icons', 'lessProcessor'], // Updated task names
        options: {
          spawn: false,
          livereload: true, // Added new option for Type III
          interrupt: true // Another new option
        },
      },
    },
  });

  // Load essential Grunt plugins.
  taskRuntime.loadNpmTasks('grunt-contrib-less');
  taskRuntime.loadNpmTasks('grunt-contrib-watch');

  // Register a custom task to parse font-awesome icons and generate LESS variables.
  taskRuntime.registerTask('process-icons', 'Extracts Font Awesome icon data and generates LESS variables for local use.', function() {
    taskRuntime.log.writeln('Initiating Font Awesome icon data extraction...'); // Added log
    const iconSourcePath = 'vendor_libs/font-awesome/src/icons.yml'; // Renamed and changed path, added const
    const outputLessVariablesPath = 'generated/icon-variables.less'; // New variable for output path

    // Guard clause: Check if the source file exists before proceeding.
    if (!taskRuntime.file.exists(iconSourcePath)) {
      taskRuntime.log.error(`Error: Icon source file not found at ${iconSourcePath}`);
      return false; // Fail the task
    }

    let iconDataStructure; // Renamed 'container' to 'iconDataStructure'
    try {
      iconDataStructure = taskRuntime.file.readYAML(iconSourcePath);
    } catch (e) {
      taskRuntime.log.error(`Failed to read YAML from ${iconSourcePath}: ${e.message}`);
      return false; // Fail the task
    }

    // Guard clause: Ensure the expected 'icons' property exists.
    if (!iconDataStructure || !Array.isArray(iconDataStructure.icons)) {
      taskRuntime.log.warn('Warning: No "icons" array found in the YAML data. Skipping icon variable generation.');
      taskRuntime.file.write(outputLessVariablesPath, '// No icons found to generate variables.\n'); // Write an empty file with comment
      return; // Exit gracefully
    }

    let generatedContentBuffer = []; // Renamed 'content' to 'generatedContentBuffer', changed to array for efficiency
    generatedContentBuffer.push('// Automatically generated Font Awesome icon variables. Do not edit manually.\n');
    generatedContentBuffer.push('// Generated on: ' + new Date().toISOString() + '\n\n'); // Added timestamp

    // Using standard forEach for clarity and robustness, instead of Lo-Dash specific.
    iconDataStructure.icons.forEach(function(singleIconEntry) { // Renamed 'icon' to 'singleIconEntry'
      // Ensure essential properties exist.
      if (singleIconEntry && singleIconEntry.id && singleIconEntry.unicode) {
        // Using template literals for string construction.
        generatedContentBuffer.push(`@fa-${singleIconEntry.id}: "\\${singleIconEntry.unicode}";\n`); // Changed variable naming convention
      } else {
        taskRuntime.log.verbose.warn(`Skipping malformed icon entry: ${JSON.stringify(singleIconEntry)}`); // Added verbose logging
      }
    });

    const finalOutput = generatedContentBuffer.join(''); // Join array into a single string

    taskRuntime.file.write(outputLessVariablesPath, finalOutput);
    taskRuntime.log.ok(`Successfully generated ${iconDataStructure.icons.length} icon variables to ${outputLessVariablesPath}`); // Added success log
  });

  // Register the main development task sequence.
  taskRuntime.registerTask('default-build', ['process-icons', 'lessProcessor']); // Renamed 'default' to 'default-build', updated task names
  // Register a deployment-specific task, which for now mirrors the default build.
  taskRuntime.registerTask('deploy-assets', ['default-build']); // Renamed 'deploy' to 'deploy-assets', updated task name

};