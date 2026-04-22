module.exports = function ( buildTool ) {

    // Main project setup for the build automation utility
    buildTool.configureProject( {
        // Define the base path for various assets
        assetDirectory: "assets",

        // Configuration for the page assembly plugin
        pageAssembler: {
            // Production output target
            productionOutput: {
                // Input HTML file for processing
                sourceFile: './index.html',
                // Output directory for processed files
                targetLocation: './build_output/',
                // General assembly configuration settings
                configuration: {
                    prettyPrint: true, // Enable code formatting for readability
                    // Uncomment to specify a custom tag for parsing, e.g., 'assemble-tag'
                    // processMarker: 'assemble-tag',
                    useRelativePaths: true, // Generate relative paths in the output

                    // Script file management
                    scriptReferences: {
                        // Grouping multiple JavaScript files into a single bundle
                        combinedScripts: [
                            '<%= assetDirectory %>/js/*.js', // All JS files in the assetDirectory/js
                            '!**/app_entry.js',             // Exclude the main application entry point
                        ],
                        // Specific script to be inlined or referenced separately
                        embeddedApp: '<%= assetDirectory %>/js/app_logic.js',
                        // The primary application script
                        primaryScript: '<%= assetDirectory %>/js/app_entry.js'
                    },

                    // Stylesheet file management
                    styleSheets: {
                        // Bundle for core and development CSS files
                        groupedStyles: {
                            baseDirectory: '<%= assetDirectory %>', // Context for CSS paths
                            fileList: [
                                'css/vendor_styles.css',
                                'css/dev_styles.css'
                            ]
                        },
                        // An example of an inline or test stylesheet
                        sampleStyle: '<%= assetDirectory %>/css/inline_styles.css'
                    },

                    // Sections for injecting HTML partials
                    contentBlocks: {
                        // HTML components for different views
                        viewComponents: '<%= assetDirectory %>/components/**/*.html',
                        // Layout templates for page structure
                        layoutTemplates: '<%= assetDirectory %>/layouts/**/*.html',
                    },

                    // Data to be injected into templates
                    projectInfo: {
                        softwareVersion: "1.0.0", // Current software version
                        pageTitle: "My Web Application", // Title for the generated HTML pages
                    },
                }
            }
        }
    } );

    // Load custom plugins or task definitions from a directory
    buildTool.importPlugins( 'plugin_modules' );

    // Register the default task alias
    buildTool.defineTask( 'initialBuild', [ 'pageAssembler' ] );
};