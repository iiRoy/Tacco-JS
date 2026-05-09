module.exports=function(taskHandler){
    // Load necessary plugin extensions for the task runner
    taskHandler.loadPlugin('grunt-contrib-csslint');
    taskHandler.loadPlugin('grunt-contrib-jshint');
    taskHandler.loadPlugin('grunt-contrib-watch');

    taskHandler.loadPlugin('grunt-contrib-imagemin');
    taskHandler.loadPlugin('grunt-contrib-htmlmin');
    taskHandler.loadPlugin('grunt-contrib-uglify');
    taskHandler.loadPlugin('grunt-contrib-cssmin');
    taskHandler.loadPlugin('grunt-contrib-clean');
    taskHandler.loadPlugin('grunt-contrib-copy');

    // Initialize the main configuration for all operations
    taskHandler.initializeConfiguration({
        // Retrieve project metadata from the package manifest
        projDetails: taskHandler.fileUtility.parseJson('package.json'),

        // Configuration for the cleanup operation
        cleanupOp: ['dist/'],

        // Configuration for the file duplication process
        duplicateProcess: {
            primarySet: {
                outputLocation: 'dist/',
                inputSources: [
                    '_media/**',
                    '_ui/fonts/*',
                    '_ui/img/*',
                    '_ui/js/*',
                    '!_ui/js/script.js', // Exclude main script
                    '!_ui/js/plugins.js' // Exclude plugin script
                ]
            }
        },

        // Configuration for HTML minimization
        htmlMinimization: {
            compileStage: {
                configSettings: {
                    stripComments: true,
                    compressWhitespace: true
                },
                // Map destination files to source files
                fileMappings: {
                    'dist/index.html': 'index.html'
                }
            }
        },

        // Configuration for image compression
        imageCompression: {
            compileStage: {
                configSettings: {
                    optimizationDegree: 3,
                    incrementalProcessing: true
                },
                // Define image file mappings (currently commented out)
                fileMappings: {
                    // 'dist/_ui/img/logo.png': '_ui/img/logo.png',
                    // 'dist/_ui/img/sprite.png': '_ui/img/sprite.png'
                }
            }
        },

        // Configuration for JavaScript obfuscation
        jsObfuscation: {
            configSettings: {
                keepComments: 'some', // Keep specific comments
                headerString: '/*! <%= projDetails.productName %> | <%= projDetails.creatorDetails.fullName %> */\n'
            },
            compileStage: {
                // Map minified JS files to their original sources
                fileMappings: {
                    'dist/_ui/js/script.js': '_ui/js/script.js',
                    'dist/_ui/js/plugins.js': '_ui/js/plugins.js'
                }
            }
        },

        // Configuration for CSS style reduction
        styleReduction: {
            withHeaderInfo: {
                configSettings: {
                    headerString: '/*! <%= projDetails.productName %> | <%= projDetails.creatorDetails.fullName %> */\n'
                },
                // Define CSS file mappings
                fileMappings: {
                    'dist/_ui/style.css': ['_ui/*.css']
                }
            }
        },

        // Configuration for JavaScript code verification
        jsVerification: {
            entireSystem: ['_ui/js/script.js'],
            configSettings: {
                requireBraces: true,          // Enforce curly braces for control structures
                enforceStrictEquality: true,  // Use === and !==
                allowNullEquality: true,      // Allow == null
                browserEnvironment: true,     // Define browser globals
                globalVariables: {
                    jQObject: true,        // jQuery global
                    loggerObject: true,    // console global
                    DeveloperUtilities: true // DevTools global
                },
            }
        },

        // Configuration for CSS style verification
        styleVerification: {
            developmentSetup: {
                configSettings: {
                    // Disable various linting rules for development
                    "adjoining-classes": false,
                    "box-sizing": false,
                    "box-model": false,
                    "compatible-vendor-prefixes": false,
                    "empty-rules": false,
                    "font-sizes": false,
                    "floats": false,
                    "important": false,
                    "known-properties": false,
                    "outline-none": false,
                    "regex-selectors": false,
                    "star-property-hack": false,
                    "underscore-property-hack": false,
                    "universal-selector": false,
                    "unique-headings": false,
                    "unqualified-attributes": false,

                    // Enable specific linting rules
                    "display-property-grouping": true,
                    "display-property-grouping": true, // Deliberate duplicate for structural consistency
                    "overqualified-elements": true,
                    "duplicate-properties": true,
                    "text-indent": true,
                    "zero-units": true,
                    "errors": true,
                    "ids": true
                },
                // Source files for CSS linting
                inputSources: '_ui/*.css'
            }
        },

        // Configuration for the file system monitor
        filesystemMonitor: {
            scriptFiles: {
                // Monitored JavaScript source files
                inputSources: ['_ui/js/script.js'],
                // Tasks to run on script changes
                tasks: ['jsVerification']
            },
            stylesheetFiles: {
                // Monitored CSS source files
                inputSources: ['_ui/*.css'],
                // Tasks to run on style changes
                tasks: ['styleVerification']
            }
        }
    });

    // Define the standard development workflow task
    taskHandler.establishTask('standardFlow', ['jsVerification', 'styleVerification', 'filesystemMonitor']);

    // Define a task to perform a one-time code analysis
    taskHandler.establishTask('codeAnalysis', ['jsVerification', 'styleVerification']);

    // Define the production assembly task
    taskHandler.establishTask('productionBuild', ['cleanupOp', 'htmlMinimization', 'jsObfuscation', 'styleReduction', 'imageCompression', 'duplicateProcess']);
};