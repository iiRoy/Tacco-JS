const configureBuildProcess = (buildTool) => {
    // This function sets up the build automation tasks for our application.
    // It takes a 'buildTool' object (analogous to Grunt) as its argument.

    // Define a set of consistent path variables for better maintainability.
    const projectLayout = {
        outputRoot: 'dist_build',
        temporaryOutput: 'temp_assets',
        sourceRootDirectory: 'application_source'
    };

    // Initialize the build tool's configuration object.
    buildTool.initConfig({
        // Project-specific meta-information.
        // This data is now defined inline instead of reading from an external file,
        // representing a Type III modification for data source.
        applicationDetails: {
            nameKey: 'ngWidgetTree',
            displayTitle: 'Angular UI Tree Component',
            currentVersion: '1.0.0-release',
            developer: 'Automated Clone System'
        },

        // Content for the header banner to be applied to output files.
        // The source file for the header has been renamed and moved.
        outputHeaderContent: buildTool.file.read('configuration_files/project_header.txt'),

        // Task for cleaning up generated files and directories.
        cleanupBuildArtifacts: {
            // Specifies which directories should be removed during cleanup.
            // Paths are now derived from 'projectLayout'.
            foldersToDelete: [projectLayout.outputRoot, projectLayout.temporaryOutput]
        },

        // Task for combining multiple JavaScript files into a single bundle.
        javascriptBundler: {
            // Configuration options for the bundling process.
            bundleSettings: {
                // Prepend the defined header content to the top of the combined file.
                insertFileHeader: '<%= outputHeaderContent %>',
                // Instructs the bundler to remove any existing banners from individual source files.
                stripPreviousBanners: true
            },
            // Specific configuration for the main application script bundle.
            mainAppScriptBundle: {
                // The list of source JavaScript files to be concatenated.
                // The path and filename have been changed significantly.
                sourceFileSet: projectLayout.sourceRootDirectory + '/ui_components/tree/angularTreeDirective.js',
                // The destination path and filename for the resulting bundled script.
                destinationBundle: projectLayout.outputRoot + '/<%= applicationDetails.nameKey %>.js'
            }
        },

        // Task for minifying (uglifying) JavaScript code to reduce file size.
        codeCompressor: {
            // Options specific to the code minification process.
            compressionOptions: {
                // Ensure the custom header is also included in the minified output.
                addMinifiedHeader: '<%= outputHeaderContent %>'
            },
            // Configuration for minifying the primary application bundle.
            minifiedApplicationBundle: {
                // The source file for minification, which is the output of the bundler.
                inputForMinification: '<%= javascriptBundler.mainAppScriptBundle.destinationBundle %>',
                // The destination path and filename for the minified script.
                outputMinifiedFile: projectLayout.outputRoot + '/<%= applicationDetails.nameKey %>.min.js'
            }
        },

        // Task for watching file system changes and re-running tasks automatically.
        fileChangeMonitor: {
            // Configuration for monitoring during development.
            developmentWatcher: {
                // Defines the files and patterns to observe for modifications.
                // Paths have been updated, and a new file type (`.json`) is being watched.
                pathsToWatch: [
                    projectLayout.sourceRootDirectory + '/**/*.js',
                    projectLayout.sourceRootDirectory + '/**/*.json'
                ],
                // The list of tasks to execute when any of the watched files change.
                // Task name has been updated.
                tasksToExecute: ['performFullBuild']
            }
        },

        // Task for generating API documentation from source code.
        documentationGenerator: {
            // General settings for the documentation generation process.
            generatorSettings: {
                // The target directory where generated documentation will be placed.
                // Path uses 'projectLayout'.
                targetDocDirectory: projectLayout.temporaryOutput + '/documentation',
                // The main title for the documentation site.
                siteTitle: "<%= applicationDetails.displayTitle %> API Reference",
                // Option to use or not use HTML5 history API for routing.
                useModernUrls: false,
                // Added a new configuration option: a custom template for docs.
                docTemplate: 'doc_templates/custom_ngdoc_template.html'
            },
            // Specifies all source code files that should be processed for documentation.
            // Path uses 'projectLayout'.
            allSourceFiles: [projectLayout.sourceRootDirectory + '/**/*.js']
        },

        // New task: Copies static assets from source to the build output directory.
        // This is an added feature (Type III addition).
        staticAssetCopier: {
            primaryAssets: {
                files: [{
                    expand: true,
                    cwd: projectLayout.sourceRootDirectory + '/static_assets', // Source directory for assets
                    src: ['**'], // Copy all files and subdirectories
                    dest: projectLayout.outputRoot + '/static_assets' // Destination directory in build output
                }]
            }
        },

        // New task: Configures and starts a simple development web server.
        // This task's configuration was previously implied but not explicitly defined.
        developmentWebServer: {
            // Configuration for the live development server instance.
            localDevServer: {
                options: {
                    port: 9002, // Changed the default port.
                    base: projectLayout.outputRoot, // Serve files from the final output directory.
                    hostname: '0.0.0.0', // Allow access from any network interface.
                    keepalive: false // Do not keep the server process alive after task completion.
                }
            }
        }
    });

    // Load external build tool plugins required for our tasks.
    // The method name for loading plugins has been renamed.
    buildTool.loadPlugin('grunt-contrib-clean');
    buildTool.loadPlugin('grunt-contrib-concat');
    buildTool.loadPlugin('grunt-contrib-uglify');
    buildTool.loadPlugin('grunt-contrib-watch');
    buildTool.loadPlugin('grunt-contrib-connect'); // Now explicitly configured and used.
    buildTool.loadPlugin('grunt-contrib-copy');    // Now explicitly configured and used.
    buildTool.loadPlugin('grunt-ngdocs');

    // Define custom sequences of tasks (workflows).
    // The method name for defining tasks has been renamed, and task aliases are different.

    // The primary default workflow: clean the workspace then perform a full build.
    buildTool.defineTask('defaultWorkflow', ['cleanupBuildArtifacts', 'performFullBuild']);

    // Development mode workflow: clean, build, copy assets, start a web server, and then watch for changes.
    // The order of tasks has been re-arranged, and new tasks have been included.
    buildTool.defineTask('devDevelopment', ['cleanupBuildArtifacts', 'performFullBuild', 'staticAssetCopier', 'developmentWebServer', 'fileChangeMonitor']);

    // The comprehensive project build workflow: bundle, minify, and copy static assets.
    // The 'staticAssetCopier' task has been added to this core build process.
    buildTool.defineTask('performFullBuild', ['javascriptBundler', 'codeCompressor', 'staticAssetCopier']);

    // A dedicated task to generate the API documentation.
    // This is a newly defined task alias (Type III addition).
    buildTool.defineTask('generateDocumentation', ['documentationGenerator']);

    // A dedicated task to start the local development web server.
    // This is a newly defined task alias (Type III addition).
    buildTool.defineTask('startLocalServer', ['developmentWebServer:localDevServer']);

    // Add a simple diagnostic task for testing purposes.
    // This is a non-essential addition (Type III addition).
    buildTool.registerTask('diagnose', 'Outputs build environment information.', function() {
        buildTool.log.writeln('Build process initiated by: ' + buildTool.util.user.name);
        buildTool.log.writeln('Current Node.js version: ' + process.version);
    });

    // Introduce a simple validation or guard clause.
    // This checks for a critical configuration piece (Type III addition).
    if (!buildTool.config.get('applicationDetails.nameKey')) {
        buildTool.warn('WARNING: The applicationDetails.nameKey is not defined. Output filenames might be incorrect.');
    }
};

// Export the configuration function so it can be used by the build tool.
module.exports = configureBuildProcess;