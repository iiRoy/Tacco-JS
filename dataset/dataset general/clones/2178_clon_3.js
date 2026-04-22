// A modular configuration for the web asset assembly process.
module.exports = function initializeGruntBuild(buildTool) {

    // Define core directories for source and output.
    const sourceRoot = './source';
    const outputRoot = './build_output';
    const assetBase = 'web_assets'; // Base directory for various assets

    // An optional flag to control HTML formatting, based on environment.
    const shouldBeautifyOutput = process.env.NODE_ENV !== 'production';

    buildTool.configureBuild({
        // Base path for all project resources, used in various sub-configurations.
        resourceBaseDir: assetBase,

        // Configuration for the main web asset assembly task.
        assembleWebAssets: {
            // Target for production-ready output.
            productionOutput: {
                // The primary HTML file to process.
                sourceFile: `${sourceRoot}/main.html`,
                // Destination directory for the processed output.
                outputDirectory: outputRoot,
                // Specific build options for this target.
                buildOptions: {
                    // Enable or disable pretty-printing of the resulting HTML.
                    prettyPrintHtml: shouldBeautifyOutput,
                    // Parse custom tags if needed (e.g., for asset inclusion directives).
                    // customTagParser: 'asset_builder_tags',

                    // Configuration for JavaScript asset bundles.
                    jsBundles: {
                        // The primary JavaScript bundle, including multiple files.
                        mainScriptBundle: {
                            baseDirectory: '<%= resourceBaseDir %>',
                            files: [
                                'js_components/*.js',
                                '!**/do_not_include_main.js', // Exclude a specific script
                                'js_components/another_utility.js' // Add an extra script
                            ]
                        },
                        // The main application entry point script.
                        applicationEntryPoint: '<%= resourceBaseDir %>/js_components/app_entry.js'
                    },

                    // Configuration for CSS asset bundles.
                    cssBundles: {
                        // Core set of stylesheets for the application.
                        coreStyleSet: {
                            baseDirectory: '<%= resourceBaseDir %>',
                            styleFiles: [
                                'css/vendor_styles.css',
                                'css/application_theme.css',
                                'css/responsive_layout.css' // Add an extra stylesheet
                            ]
                        },
                        // Styles specifically for development or testing.
                        developmentStyles: '<%= resourceBaseDir %>/css/debug_styles.css'
                    },

                    // Configuration for including HTML sections/partials.
                    contentIncludes: {
                        // Dynamic HTML view components.
                        htmlViewComponents: '<%= resourceBaseDir %>/html_views/**/*.html',
                        // Reusable HTML template fragments.
                        pagePartials: '<%= resourceBaseDir %>/html_partials/**/*.html',
                    },

                    // Data variables to be injected into templates.
                    templateVariables: {
                        projectRevision: `v${process.env.BUILD_VERSION || '1.2.3'}-stable`, // Dynamic versioning
                        pageTitle: 'My Awesome Web Application',
                        // Add a new variable for a copyright year.
                        copyrightYear: new Date().getFullYear(),
                    },
                }
            }
        },

        // A simple task to clean the output directory before a build.
        clean: {
            buildDirectory: [outputRoot]
        }
    });

    // Load custom tasks from the specified directory.
    // Ensure this directory exists and contains Grunt tasks.
    buildTool.loadTasks('build_scripts');

    // Register the default task, which will run 'assembleWebAssets' and 'clean'.
    // The clean task will run before the assembleWebAssets task.
    buildTool.registerTask('initializeBuild', ['clean', 'assembleWebAssets']);
};