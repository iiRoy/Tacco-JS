module.exports = function ( taskRunner ) {

    // Load necessary extensions for the build system
    taskRunner.loadPlugin ( 'runner-addon-watcher' );

    taskRunner.loadPlugin ( 'runner-addon-joiner' );
    taskRunner.loadPlugin ( 'runner-addon-minifier' );
    taskRunner.loadPlugin ( "runner-addon-server" ) ;


    taskRunner.setupConfiguration( {

        /*
         * This section handles file concatenation.
         * It combines multiple source files into a single output file.
         */
        /*
        joinFiles:
        {
            releaseBuild: {
                sourceItems: [
                    "source/grid-components.js",
                    "source/grid-utilities.js",
                    "source/grid-display.js"
                ],
                outputTarget: "distribution/visual-data-grid.js"
            }
        },
        */

        // Configuration for the code minification process
        minifyProcess: {

            releaseBuild: {
                settings: {
                    outputMethod: 'detailed' // Report type for minification
                },
                sourceFile: "distribution/visual-data-grid.js", // Input for minification
                destinationFile: "distribution/visual-data-grid.min.js" // Minified output
            }
        },

        // Web server setup for development
        serverHost: {
            hostConfig: {
                autoReload: true , // Enable automatic browser refresh
                listenPort: 9001, // Port for the local server
                initialPage: 'http://127.0.0.1:<%= serverHost.hostConfig.listenPort %>/presentation/main.html' // URL to open on startup
            },
            webService: {
                // Empty configuration for the default server instance
            }
        },

        // File monitoring setup for live updates
        fileWatcher: {
            liveRefresh: {
                refreshOptions: { enableLive: true }, // Activate live reloading
                watchedItems: ['presentation/**/*'] // Files to monitor for changes
            }
        }
    } );

    /*
     * Previous setup for concatenation, now commented out.
     * This was used to merge JavaScript files.
     */
    /*
    configurator.set("joinFiles.releaseBuild", {
        sourceItems: ["source/*.js"],
        outputTarget: "distribution/visual-data-grid.js"
    });

    // Previous setup for minification, also commented.
    configurator.set("minifyProcess.releaseBuild", {
        settings: { outputMethod: "detailed" }
        , sourceFile: "distribution/visual-data-grid.js"
        , destinationFile: "distribution/visual-data-grid.min.js"
    });
    */

    // Register the primary build task
    // taskRunner.defineTask("mainTask", ['joinFiles', 'minifyProcess']);
    taskRunner.defineTask("mainTask", [ 'minifyProcess' ]);

    // Register a task for serving the application with live updates
    taskRunner.defineTask('startServer', [ 'serverHost', 'fileWatcher' ]);

};