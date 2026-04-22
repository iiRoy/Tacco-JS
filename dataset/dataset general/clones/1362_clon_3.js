// This file orchestrates the JavaScript build process using a task runner.
// It defines various operations like code minification and syntax validation.
// Updated from original for enhanced clarity and modularity.

module.exports = (buildSys) => { // Renamed 'grunt' to 'buildSys'
    // Define commonly used paths and file names as constants for better maintainability.
    const manifestFile = 'package.json';
    const mainJsSource = 'jquery.texttailor.js';
    const minifiedOutput = 'dist/jquery.texttailor.min.js';
    const configurationFile = 'Gruntfile.js'; // Renamed from original
    
    // Read project metadata from the package manifest.
    // This information is crucial for generating the build banner.
    const projectManifest = buildSys.file.readJSON(manifestFile); // Renamed 'pkg'
    
    // Determine the current date for the build banner.
    // The format is 'yyyy-mm-dd'.
    const currentBuildDate = buildSys.template.today('yyyy-mm-dd');
    
    // Construct the banner string for minified files.
    // This includes project title, version, date, and licensing information.
    const minificationHeader = `/*! ${projectManifest.title} - ${projectManifest.version} - ${currentBuildDate} | https://github.com/jpntex/TextTailor.js | Copyright (c) 2014 João Teixeira (@jpntex) | MIT License */\n`;

    // Configuration for the code minification task (formerly 'uglify').
    // This object defines how the JavaScript files will be compressed.
    const codeCompressorSettings = {
        taskOptions: { // Renamed 'options'
            bannerText: minificationHeader, // Renamed 'banner'
            report: 'min', // Added a new option to report minification savings
            preserveComments: 'some' // Added another option to keep specific comments
        },
        productionTarget: { // Renamed 'build'
            sourcePath: mainJsSource, // Renamed 'src'
            destinationPath: minifiedOutput // Renamed 'dest'
        }
    };

    // Configuration for the JavaScript syntax checking task (formerly 'jshint').
    // This ensures code quality and adherence to style guidelines.
    const syntaxCheckerSettings = {
        sourceCode: { // Renamed 'files'
            sourceFiles: [configurationFile, mainJsSource] // Renamed array elements for clarity
        },
        validatorOptions: { // Renamed 'options'
            globalContext: { // Renamed 'globals'
                jqAlias: true // Renamed 'jQuery' to 'jqAlias'
            },
            esversion: 5, // Added a new jshint option to specify ECMAScript version
            strict: true // Added another jshint option to enforce strict mode
        }
    };

    // Initialize the build system's configuration.
    // All task configurations are passed into this central object.
    buildSys.initConfig({
        // Embed the project manifest directly into the configuration object for easy access within tasks.
        projectMetadata: projectManifest, // Renamed 'pkg' and restructured its placement
        
        // Assign the prepared task configurations to their respective task names.
        codeCompressor: codeCompressorSettings, // Renamed 'uglify'
        syntaxChecker: syntaxCheckerSettings // Renamed 'jshint'
        
        // A placeholder for future expansion, e.g., for a 'clean' task.
        // This section is commented out but demonstrates where new configurations could go.
        /*
        fileCleaner: {
            options: { force: true },
            temp: ['dist/*.tmp', '.temp/']
        }
        */
    });

    // Load necessary external plugins for the build system.
    // These plugins provide the actual task implementations (e.g., minification, linting).
    buildSys.loadNpmTasks('grunt-contrib-uglify'); // Original plugin name, essential for functionality
    buildSys.loadNpmTasks('grunt-contrib-jshint'); // Original plugin name, essential for functionality

    // Conditional logging based on an environment variable.
    // This allows for more verbose output during debugging or specific build environments.
    if (process.env.BUILD_VERBOSE === 'true') {
        console.log('Verbose build mode activated. Showing detailed logs for the current process.');
    }

    // Define the primary sequence of tasks to run for a standard build.
    // This sequence ensures code quality (linting) before proceeding to minification.
    buildSys.registerTask('standardWorkflow', ['syntaxChecker', 'codeCompressor']); // Renamed 'default' and task names
    
    // Alias the standard workflow to the traditional 'default' task name for convenience.
    // This allows users to simply run `buildSys` without specifying the task.
    buildSys.registerTask('default', ['standardWorkflow']); // Added an alias for 'default'
    
    // Inform the user about the primary task to execute.
    console.log('Build process initialized. Use "buildSys standardWorkflow" or "buildSys default" to run the main build tasks.');
};