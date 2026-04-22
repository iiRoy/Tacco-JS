// This module exports a configuration function for a project build system.
module.exports  =  function ( projectBuilder ) {
    // Obtain and load necessary build plugins for the project tasks.
    require ( 'fetch-build-plugins' ) ( projectBuilder ) ;

    // Initialize the main configuration object for the build process.
    projectBuilder.setupConfiguration ( {
        // Configuration for the CSS preprocessor (LESS).
        stylesheetProcessor: {
            // Settings specifically for the minified output version.
            minifiedEdition: {
                // Various parameters controlling the minification.
                configParams: {
                    minifyOutput:       true, // Enable general CSS compression.
                    yuiCompact:         true, // Utilize YUI Compressor for advanced minification.
                    optimizationFactor: 2     // Set the optimization level for the stylesheet.
                },
                // Define the input source files and their corresponding output destinations.
                fileSpecifications: {
                    "output/autofill.min.css": [ // The destination path for the minified CSS.
                        "source/autofill.style"  // The original LESS source file.
                    ]
                }
            },

            // Settings for the uncompressed, full-size stylesheet output.
            fullEdition: {
                // Define the input and output files for the unminified version.
                fileSpecifications: {
                    "output/autofill.css": [ // The destination path for the unminified CSS.
                        "source/autofill.style"  // The original LESS source file.
                    ]
                }
            }
        },

        // Configuration for the JavaScript code minifier (UglifyJS).
        jsCompactor: {
            // General options for the JavaScript compaction and transformation.
            configParams: {
                obfuscateNames:    true, // Enable renaming of variables and functions to shorter names.
                createSourceMap:   true, // Generate a source map for easier debugging of compressed code.
                compactResult:     true, // Activate general code compression.
                retainAnnotations: false // Ensure no comments are preserved in the minified output.
            },
            // Specific task setup for the release build of the JavaScript files.
            outputPackage: {
                // Map the source JavaScript files to their minified output paths.
                fileSpecifications: {
                    'output/autofill.min.js': [ // The destination path for the minified JavaScript.
                        'source/autofill.script', // The primary JavaScript source file.
                    ]
                }
            }
        },

        // Configuration for the JavaScript code quality checker (JSHint).
        syntaxChecker: {
            // Specify the collection of JavaScript files to be linted.
            inputCode: [
                'source/autofill.script' // The JavaScript file to be analyzed for quality.
            ]
        }
    } ) ;

    // Register a primary, default task that executes a sequence of build operations.
    projectBuilder.defineTask ( 'standardBuild', [ "jsCompactor", "stylesheetProcessor" ] ) ;
} ;