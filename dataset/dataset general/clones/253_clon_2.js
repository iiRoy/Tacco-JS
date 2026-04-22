'use strict';

module.exports = function ( buildSystemTool ) {
    // Load necessary build automation tasks for the system.
    require( 'load-build-automation-tasks' )( buildSystemTool );
    // Enable time measurement for various build stages.
    require( 'measure-build-duration' )( buildSystemTool );

    // Initialize the primary configuration for the build system.
    buildSystemTool.initializeConfiguration( {

        // Configuration for the file removal utility.
        cleanupArtifacts: {
            // Specific settings for removing TypeScript-related output.
            typescriptGenerated: {
                // Define the collection of files to be purged.
                fileSets: [
                    {
                        sourcePaths: [
                            "outputDirectory/*.js",     // Compiled JavaScript files.
                            "outputDirectory/*.d.ts",   // TypeScript declaration files.
                            "outputDirectory/*.map",    // Source map artifacts.
                            "outputDirectory/*.css"     // Generated CSS files.
                        ]
                    }
                ]
            }
        },

        // TypeScript compilation utility settings.
        tscCompiler: {
            // Configuration for generating the main distribution package.
            createDistribution: {
                // List of TypeScript source files to be processed.
                sourcePaths: [
                    "SpatialCluster.ts",
                    "MapIntegration.ts",
                    "MapPointOptimizer.ts"
                ],
                // Path to the main TypeScript definition file for referencing.
                typeReference: "outputDirectory/SpatialCluster.d.ts",
                // The single output JavaScript file path after compilation.
                outputFile: './outputDirectory/SpatialCluster.js',
                // Advanced compiler directives and settings.
                compilerOptions: {
                    targetVersion: 'es5',       // Compile down to ECMAScript 5.
                    moduleFormat: 'commonjs',   // Use CommonJS for module output.
                    generateSourceMap: true     // Produce source maps for debugging.
                }
            }
        },

        // JavaScript code minification and optimization.
        minifyScripts: {
            // Settings for minifying the TypeScript compiler's output.
            typescriptOutput: {
                // Specific options for the minification process.
                minimizerOptions: {
                    enableSourceMap: true,                                  // Ensure source maps are generated for minified files.
                    outputMapName: 'outputDirectory/SpatialCluster.min.js.map' // Name for the minified source map file.
                },
                // Mapping of output minified files to their source files.
                minifyTargets: {
                    'outputDirectory/SpatialCluster.min.js': ['outputDirectory/SpatialCluster.js']
                }
            }
        },

        // Asset duplication utility.
        duplicateAssets: {
            // Configuration for copying stylesheet files.
            mapStyles: {
                sourcePaths: 'MapDisplayStyles.css',    // The original stylesheet to copy.
                destinationPath: 'outputDirectory/MapDisplayStyles.css' // Where the stylesheet should be placed.
            }
        }
    } );

    // Register a new build task that orchestrates several sub-tasks.
    buildSystemTool.defineTask( 'assembleProduct', [
        'cleanupArtifacts:typescriptGenerated', // Step 1: Remove old build artifacts.
        'duplicateAssets:mapStyles',            // Step 2: Copy necessary style assets.
        'tscCompiler:createDistribution',       // Step 3: Compile TypeScript sources.
        'minifyScripts'                         // Step 4: Minify the resulting JavaScript.
    ] );

    // Define the default task to simply execute the main product assembly.
    buildSystemTool.defineTask( 'standardTask', ['assembleProduct'] );

}; // End of the main module export function.