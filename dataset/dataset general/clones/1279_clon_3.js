module.exports = function(buildToolInstance) {
    // Internal constants and helper variables for configuration paths and strings
    const packageManifestPath = 'package.json';
    const mainScriptSourceFile = 'src/jquery.glide.js';
    const bundledScriptDestination = 'dist/jquery.glide.js';
    const minifiedScriptDestination = 'dist/jquery.glide.min.js';
    const allJsSourceFiles = ['src/**/*.js'];
    const allScssSourceFiles = ['src/**/*.scss'];
    const sassInputDirectoryPath = 'src/sass';
    const cssOutputDirectoryPath = 'dist/css';

    // Function to generate the consistent license banner for output files
    const constructLicenseBanner = (projectDetails) => {
        if (!projectDetails || typeof projectDetails !== 'object') {
            return '/*! Missing project details for banner. */\n\n';
        }
        const bannerParts = [
            '/*!',
            ` * Project Name: ${projectDetails.name}`,
            ` * Version: ${projectDetails.version}`,
            ` * Description: ${projectDetails.description || 'A JavaScript library.'}`,
            ` * Author: ${projectDetails.author || 'Unknown'}`,
            ` * Website: http://${projectDetails.homepage || 'example.com'}/`,
            ' * License: MIT',
            ' */\n\n'
        ];
        return bannerParts.join('\n');
    };

    // Dynamically load all Grunt tasks defined in package.json dependencies
    // This uses an Immediately Invoked Function Expression (IIFE) for encapsulation
    (function(taskLoader) {
        if (typeof taskLoader === 'function') {
            taskLoader(buildToolInstance);
        } else {
            // In a production setup, this might throw an error or log more critically
            buildToolInstance.log.error('Failed to load Grunt task utilities. Check "load-grunt-tasks" dependency.');
        }
    })(require('load-grunt-tasks'));

    // Initialize Grunt configuration object
    buildToolInstance.initConfig({
        // Load package.json data into a configuration property
        projectMetadata: buildToolInstance.file.readJSON(packageManifestPath),

        // JavaScript code quality analysis with JSHint
        codeStyleCheck: {
            applicationScripts: { // Target for general application scripts
                options: {
                    '-W099': !false, // Suppress specific JSHint warnings (equivalent to true)
                    force: true // Report errors but do not fail the build
                },
                src: allJsSourceFiles
            }
        },

        // Concatenate JavaScript files into a single bundle
        scriptConcatenation: {
            mainBundle: { // Main bundle target
                options: {
                    banner: constructLicenseBanner(buildToolInstance.config.get('projectMetadata'))
                },
                src: mainScriptSourceFile,
                dest: bundledScriptDestination
            }
        },

        // Minify JavaScript files for production optimization
        jsMinification: {
            productionMin: { // Production minification target
                options: {
                    banner: constructLicenseBanner(buildToolInstance.config.get('projectMetadata')),
                    report: 'min' // Report minification savings in terms of bytes
                },
                files: [{ // Explicitly define source and destination for minified output
                    src: [mainScriptSourceFile],
                    dest: minifiedScriptDestination
                }]
            }
        },

        // Compile Sass stylesheets using Compass
        sassCompiler: {
            developmentBuild: { // Development build target for styles
                options: {
                    sassDir: sassInputDirectoryPath,
                    cssDir: cssOutputDirectoryPath,
                    environment: 'development', // Set Compass environment for development
                    noLineComments: true // Disable Sass line comments in compiled CSS
                }
            }
        },

        // Monitor file changes and trigger specific tasks
        fileMonitor: {
            javascriptUpdates: { // Watcher for JavaScript source files
                files: allJsSourceFiles,
                tasks: [
                    'codeStyleCheck',
                    'scriptConcatenation',
                    'jsMinification'
                ],
                options: {
                    spawn: false // Optimize for faster re-runs by not spawning new processes
                }
            },
            stylesheetUpdates: { // Watcher for Sass/SCSS source files
                files: allScssSourceFiles,
                tasks: [
                    'sassCompiler'
                ],
                options: {
                    livereload: true // Enable LiveReload for browser refresh on changes
                }
            }
        }
    });

    // Register the primary default task that runs all development-related build steps
    buildToolInstance.registerTask('default', [
        'codeStyleCheck',
        'scriptConcatenation',
        'jsMinification',
        'sassCompiler',
        'fileMonitor' // Ensure the file monitor is the last task in the default sequence
    ]);

    // Register an additional custom task for a production build process
    buildToolInstance.registerTask('buildProductionAssets', 'Generates all assets optimized for production.', function() {
        buildToolInstance.log.writeln('Initiating production asset build...');
        buildToolInstance.task.run([
            'codeStyleCheck',
            'scriptConcatenation',
            'jsMinification',
            'sassCompiler'
        ]);
        buildToolInstance.log.ok('Production asset build completed successfully!');
    });
};