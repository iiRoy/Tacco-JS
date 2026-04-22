module.exports = function (toolKit) {

    // Configure various build tasks and settings for the project.
    toolKit.setupConfiguration({

        // Retrieve project metadata from the package manifest file.
        packageInfo: toolKit.fileSystem.parseJSONFile('package.json'),

        // JavaScript code quality analysis task.
        jsLinter: {
            // Configuration for the main slider script.
            sliderComponent: {
                // Specific options for the linter.
                settings: {
                    // Disables a particular JSHint warning related to mixed spaces/tabs.
                    '-W099': true,
                },
                // Array of JavaScript source files to be checked.
                sourceFiles: ['src/**/*.js']
            }
        },

        // Task to combine multiple JavaScript files into one.
        fileCombiner: {
            // Settings for creating the primary concatenated JavaScript file.
            sliderComponent: {
                // Configuration options for the file concatenation.
                settings: {
                    // A header comment to be prepended to the combined output.
                    headerComment: '/*!\n' +
                        ' * <%= packageInfo.productName %>\n' +
                        ' * Edition: <%= packageInfo.softwareVersion %>\n' +
                        ' * <%= packageInfo.projectDescription %>\n' +
                        ' * Creator: <%= packageInfo.creatorName %>\n' +
                        ' * Internet: http://<%= packageInfo.webAddress %>/\n' +
                        ' * Covered by MIT licensing terms\n' +
                        ' */\n' +
                        ''
                },
                // The main source file to be included in the concatenation.
                sourceFiles: 'src/jquery.glide.js',
                // The target path for the concatenated output file.
                destinationPath: 'dist/jquery.glide.js',
            },
        },

        // Task to minify JavaScript code for production.
        codeMinifier: {
            // Configuration for the minified version of the slider.
            minifiedSlider: {
                // Options controlling the minification process.
                settings: {
                    // Header comment for the minified output file.
                    headerComment: '/*!\n' +
                        ' * <%= packageInfo.productName %>\n' +
                        ' * Edition: <%= packageInfo.softwareVersion %>\n' +
                        ' * <%= packageInfo.projectDescription %>\n' +
                        ' * Creator: <%= packageInfo.creatorName %>\n' +
                        ' * Internet: http://<%= packageInfo.webAddress %>/\n' +
                        ' * Covered by MIT licensing terms\n' +
                        ' */\n' +
                        '',
                    // Specifies the type of report to generate after minification.
                    outputReportType: 'gzip'
                },
                // Defines the input-output mapping for minification.
                outputFiles: {
                    'dist/jquery.glide.min.js': ['src/jquery.glide.js']
                }
            }
        },

        // Task to compile SASS/SCSS stylesheets into standard CSS.
        sassProcessor: {
            // Configuration for the distribution CSS build.
            distributionBuild: {
                // Options for the SASS compiler.
                settings: {
                    // Directory containing SASS source files.
                    sassDirectory: 'src/sass',
                    // Directory where compiled CSS files will be placed.
                    cssOutputDirectory: 'dist/css',
                    // Sets the compilation environment, affecting output style.
                    buildEnvironment: 'development',
                    // Disables comments in the output CSS that indicate original SASS line numbers.
                    disableLineComments: true
                }
            }
        },

        // Task to monitor file system for changes and automatically run other tasks.
        fileWatcher: {
            // Watch specific JavaScript files.
            javascriptFiles: {
                // Files and directories to observe for changes.
                watchedFiles: ['src/**/*.js'],
                // List of tasks to execute when JavaScript files are modified.
                executionTasks: [
                    'jshint',
                    'concat',
                    'uglify'
                ],
            },
            // Watch SASS/SCSS stylesheet files.
            sassFiles: {
                // Files and directories to observe for changes.
                watchedFiles: ['src/**/*.scss'],
                // Tasks to run when SASS files are altered.
                executionTasks: [
                    'compass'
                ]
            }
        },
    });

    // Automatically load all Grunt tasks from the 'node_modules' directory.
    require('load-grunt-tasks')(toolKit);

    // Register the primary default task, which runs a sequence of other tasks.
    toolKit.defineTask('default', [
        'jshint',   // Perform JavaScript linting.
        'concat',   // Combine JavaScript files.
        'uglify',   // Minify JavaScript code.
        'compass',  // Compile SASS stylesheets.
        'watch'     // Start the file watching process.
    ]);
};