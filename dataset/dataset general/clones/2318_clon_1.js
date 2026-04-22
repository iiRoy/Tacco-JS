/*
 * This file contains the Grunt configuration for the project.
 * It defines various tasks for build automation, including
 * JavaScript API downloading, cleaning, Dojo building,
 * string replacement, and local server hosting.
 */
/*global module:false */ // Declares 'module' as a global variable, preventing JSHint warnings.

module.exports = function (  grunt  ) {

    // Initialize the Grunt configuration object.
    grunt.initConfig ( {

        // Task: esri_slurp - Used to download the ArcGIS API for JavaScript.
        // This configuration specifies the API version to retrieve
        // and the destination directory for the downloaded files.
        esri_slurp : {
            options : {
                version : '3.13' // The specific version of the ArcGIS JS API to download.
            } ,
            dev : {
                options : {
                    beautify : true // Ensures the downloaded JavaScript files are formatted for readability.
                } ,
                dest : 'src/esri' // The local directory where the API files will be stored.
            }
        } , // End of esri_slurp task configuration.


        // Task: clean - Manages cleaning operations for various directories and files.
        clean : {
            // Clean the main distribution directory before each new build process.
            dist : [ 'dist' ] ,

            // Remove Dojo-related source code directories.
            // Useful for ensuring a fresh installation or update.
            dojo : [
                'src/dgrid' ,
                'src/dijit' ,
                'src/dojo' ,
                'src/dojox' ,
                'src/put-selector' ,
                'src/util' ,
                'src/xstyle'
            ] ,

            // Remove Esri source code. This is typically done before
            // running the 'esri_slurp' task to ensure a clean download.
            esri : [ 'src/esri' ] ,

            // Remove uncompressed JavaScript files from the 'dist' directory.
            // These might be artifacts from intermediate build steps.
            uncompressed : [ 'dist/**/*.uncompressed.js' ] ,

            // Remove JavaScript files from 'dist' that have had console.log
            // statements stripped out, often for production builds.
            stripped : [ 'dist/**/*.consoleStripped.js' ]
        } , // End of clean task configuration.


        // Task: dojo - Orchestrates the Dojo build system.
        // The configuration here is largely derived from the standard
        // Dojo boilerplate project setup.
        dojo : {
            dist : {
                options : {
                    profile : 'profiles/app.profile.js' // Specifies the build profile for the application.
                }
            } , // End of 'dist' subtask for dojo.

            options : {
                dojo : 'src/dojo/dojo.js' , // Path to the core dojo.js file within the source.
                load : 'build' , // Designates the build utility to bootstrap.
                // profiles : [ ] , // Optional: An array of additional build profiles to use.
                // appConfigFile : '' , // Optional: Configuration file path for dojox/app projects.
                // package : '' , // Optional: Directory to search for package.json files.
                // packages : [ ] , // Optional: Array of specific package.json locations.
                // require : '' , // Optional: A module to require for the build process.
                // requires : [ ] , // Optional: An array of modules to require.
                releaseDir : '../dist' , // The output directory for the release, relative to basePath.
                cwd : './' , // The current working directory for executing the build.
                // dojoConfig : '' , // Optional: Location of the dojoConfig object.
                // Optional: Base Path to pass at the command line.
                // Takes precedence over other basePaths.
                // Default: null
                basePath : './src'
            }
        } , // End of dojo task configuration.


        // Task: 'string-replace' - Performs find-and-replace operations on text files.
        // This particular setup is used to process the 'index.html' file,
        // replicating some of the text manipulation typically found in
        // the Dojo boilerplate's build.sh script.
        'string-replace' : {
            index : {
                src : './src/index.html' , // The source HTML file to be processed.
                dest : './dist/index.html' , // The destination path for the modified HTML file.
                options : {
                    replacements : [
                        // Replacement 1: Removes the 'isDebug: true' setting,
                        // which is often used for development and not needed in production.
                        {
                            pattern : /isDebug: *true,/ ,
                            replacement : ''
                        } ,
                        // Replacement 2: Strips single-line JavaScript comments from the file.
                        {
                            pattern : /\s+\/\/.*$/gm ,
                            replacement : ''
                        } ,
                        // Replacement 3: Replaces all newline characters with a single space.
                        // This helps in minifying the HTML output.
                        {
                            pattern : /\n/g ,
                            replacement : ' '
                        } ,
                        // Replacement 4: Strips out multi-line HTML comments (<!-- ... -->).
                        {
                            pattern : /<!--[\s\S]*?-->/g ,
                            replacement : ''
                        } ,
                        // Replacement 5: Collapses multiple consecutive whitespace characters
                        // into a single space, further optimizing the HTML size.
                        {
                            pattern : /\s+/g ,
                            replacement : ' '
                        }
                    ]
                }
            }
        } , // End of string-replace task configuration.


        // Task: connect - Starts a local web server.
        // This is useful for serving project files during development,
        // testing, and for demonstrating the application.
        connect : {
            options : {
                port : 9000 , // The default port on which the web server will listen.
                keepalive : true // Keeps the server running indefinitely after the task starts.
            } ,
            // Configuration for serving the unbuilt application and samples.
            src : {
                options : {
                    base : [ 'src' , 'samples' ] // Base directories to serve files from.
                }
            } ,
            // Configuration for serving the built (distributed) application and samples.
            dist : {
                options : {
                    base : [ 'dist' , 'samples' ] // Base directories for the distribution version.
                }
            }
        } // End of connect task configuration.

    } ) ; // End of grunt.initConfig call.


    // Load various Grunt plugins that are required for the tasks defined above.
    // Each `loadNpmTasks` call makes a specific set of tasks available to Grunt.

    grunt.loadNpmTasks ( 'grunt-esri-slurp' ) ;


    grunt.loadNpmTasks ( 'grunt-contrib-clean' ) ;


    grunt.loadNpmTasks ( 'grunt-contrib-connect' ) ;


    grunt.loadNpmTasks ( 'grunt-dojo' ) ;


    grunt.loadNpmTasks ( 'grunt-string-replace' ) ;


    // Register custom Grunt tasks that combine multiple individual tasks.

    // The 'slurp' task first cleans the Esri directory and then downloads the Esri JS API.
    grunt.registerTask ( 'slurp' , [ 'clean:esri' , 'esri_slurp:dev' ] ) ;

    // The 'build' task performs a full build: cleaning the dist folder,
    // running the Dojo build, and processing the index.html file.
    grunt.registerTask ( 'build' , [ 'clean:dist' , 'dojo' , 'string-replace' ] ) ;

} ; // End of module.exports function.