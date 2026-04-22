module.exports = function (buildTool) {

    // A collection of essential Grunt plugins to load.
    // These modules are typically installed via npm and specified
    // in the project's package.json dependencies.
    buildTool.loadNpmTasks('grunt-contrib-concat');
    buildTool.loadNpmTasks('grunt-contrib-jshint');
    buildTool.loadNpmTasks('grunt-contrib-clean');
    buildTool.loadNpmTasks('grunt-contrib-copy');
    buildTool.loadNpmTasks('grunt-karma');
    buildTool.loadNpmTasks('grunt-contrib-uglify');
    buildTool.loadNpmTasks('grunt-ngmin');
    buildTool.loadNpmTasks('grunt-contrib-watch');
    buildTool.loadNpmTasks('grunt-recess');


    // Main configuration object for Grunt.
    // This defines how each plugin operates during the build process.
    buildTool.initConfig({

        // Destination folder for all compiled and processed assets.
        outputFolder: 'dist',

        // Project metadata loaded from package.json for dynamic configuration.
        projectInfo: buildTool.file.readJSON("package.json"),

        // Standard header for generated files.
        // Utilizes Grunt templating to embed project details and build date.
        buildMetadata: {
            fileHeader: '/*!\n' +
                ' * <%- projectInfo.title || projectInfo.name %> | v<%- projectInfo.version %> | <%- buildTool.template.today("yyyy-mm-dd HH:MM:ss") %>\n' +
                ' * Project URI: <%- projectInfo.homepage %>\n' +
                ' *\n' +
                ' * (c) <%- buildTool.template.today("yyyy") %> <%- projectInfo.author %>\n' +
                ' * License: <%- projectInfo.licenses[0].type %> (<%- projectInfo.licenses[0].url %>)\n' +
                ' */\n'
        },

        // Definitions for application source files.
        // These are categorized for various build steps.
        sourceAssets: {
            scriptFiles: ['source/**/*.js', '!source/**/*.test.js'],
            markupPages: ['source/**/*.html'],
            styleSheets: 'source/main.less',
            testScripts: ['source/**/*.test.js']
        },

        // Definitions for third-party libraries.
        // These are typically concatenated and minified separately.
        externalLibs: {
            scriptDependencies: [
                'third-party/jquery/jquery.min.js',
                'third-party/angular/angular.min.js',
                'third-party/custom-scroll/scroll.js',
                'third-party/syntax-highlighter/prettify.js'
            ]
        },

        // Directories and files to be removed before a new build.
        cleanupTarget: [
            '<%= outputFolder %>',
            'reports'
        ],

        // Task to transfer static assets to the build directory.
        assetTransfer: {
            fontAssets: {
                files: [
                    {
                        expand: true,
                        src: ['third-party/font-library/webfonts/*'],
                        dest: '<%= outputFolder %>/fonts',
                        flatten: true
                    }
                ]
            },
            imageAssets: {
                files: [
                    {
                        expand: true,
                        cwd: 'source/img/',
                        src: ['**/*.{png,jpg,gif}'],
                        dest: '<%= outputFolder %>/img/'
                    }
                ]
            }
        },

        // Task for concatenating multiple files into single bundles.
        fileCombine: {
            options: {
                separator: ';\n' // Ensure proper separation between combined files
            },
            // Main application script bundle.
            mainAppBundle: {
                options: {
                    banner: '<%= buildMetadata.fileHeader %>'
                },
                src: ['module.wrapper.start', '<%= sourceAssets.scriptFiles %>', 'module.wrapper.end'],
                dest: '<%= outputFolder %>/<%= projectInfo.name %>.js'
            },
            // Third-party library script bundle.
            vendorBundle: {
                src: ['<%= externalLibs.scriptDependencies %>'],
                dest: '<%= outputFolder %>/vendor-libs.js'
            }
        },

        // Prepares AngularJS source files for minification
        // by adding explicit dependency annotations.
        angularPrepare: {
            appModule: {
                src: ['<%= outputFolder %>/<%= projectInfo.name %>.js'],
                dest: '<%= outputFolder %>/<%= projectInfo.name %>.annotated.js'
            }
        },

        // Minifies JavaScript files to reduce their size.
        codeCompress: {
            options: {
                banner: '<%= buildMetadata.fileHeader %>',
                mangle: true, // Obfuscate variable names
                compress: {
                    drop_console: true // Remove console.log statements
                }
            },
            finalMinified: {
                files: {
                    '<%= outputFolder %>/<%= projectInfo.name %>.min.js': ['<%= outputFolder %>/<%= projectInfo.name %>.annotated.js']
                }
            }
        },

        // Processes LESS stylesheets into CSS.
        styleProcess: {
            options: {
                compile: true,
                compress: true, // Minify the CSS output
                noUnderscores: false,
                noIDs: false,
                zeroUnits: false
            },
            mainStyles: {
                src: ['<%= sourceAssets.styleSheets %>'],
                dest: '<%= outputFolder %>/<%= projectInfo.name %>.css'
            },
            exampleStyles: {
                src: ['<%= sourceAssets.styleSheets %>', 'source/example.less'],
                dest: '<%= outputFolder %>/<%= projectInfo.name %>-example.css'
            }
        },

        // Linting configuration for JavaScript code quality.
        codeQuality: {
            options: {
                curly: true,    // Require curly braces for all control statements
                eqeqeq: true,   // Require triple equals
                immed: true,    // Require immediate function invocation to be wrapped in parentheses
                newcap: true,   // Require capitalization of all constructor functions
                noarg: true,    // Prohibit use of `arguments.caller` or `arguments.callee`
                sub: true,      // Suppress warnings about using [] notation for properties
                boss: true,     // Tolerate assignments inside conditional expressions
                eqnull: true,   // Tolerate == null
                browser: true,  // Define globals available in browsers
                globals: {
                    jQuery: true,
                    angular: true
                }
            },
            appSource: [
                'Gruntfile.js',
                '<%= sourceAssets.scriptFiles %>'
            ],
            unitTestFiles: [
                '<%= sourceAssets.testScripts %>'
            ],
            configScript: [
                'Gruntfile.js'
            ]
        },

        // Karma test runner configuration.
        unitTests: {
            options: {
                configFile: 'testing/karma-conf.js'
            },
            devTests: {
                background: true,
                singleRun: false // Keep browser open for continuous testing
            },
            ciTests: {
                singleRun: true // Run tests once and exit
            }
        },

        // Monitors file changes and automatically triggers tasks.
        liveMonitor: {
            monitorOptions: {
                livereload: true // Enable live reloading in the browser
            },

            // Watch for changes in the Gruntfile itself.
            configChanges: {
                files: 'Gruntfile.js',
                tasks: ['codeQuality:configScript'],
                options: {
                    livereload: false // No browser refresh needed for config changes
                }
            },

            // Watch for changes in application source scripts.
            appSourceChanges: {
                files: [
                    '<%= sourceAssets.scriptFiles %>'
                ],
                tasks: ['codeQuality:appSource', 'fileCombine:mainAppBundle', 'angularPrepare:appModule', 'codeCompress:finalMinified']
            },

            // Watch for changes in HTML templates.
            markupChanges: {
                files: ['<%= sourceAssets.markupPages %>'],
                tasks: ['processTemplates']
            },

            // Watch for changes in LESS stylesheets.
            styleChanges: {
                files: ['source/**/*.less'],
                tasks: ['styleProcess']
            },

            // Watch for changes in unit test files.
            testChanges: {
                files: [
                    '<%= sourceAssets.testScripts %>'
                ],
                tasks: ['codeQuality:unitTestFiles', 'unitTests:devTests:run'], // Re-run tests
                options: {
                    livereload: false
                }
            },

            // Watch for new or updated image assets.
            imageChanges: {
                files: ['source/img/**/*.{png,jpg,gif}'],
                tasks: ['assetTransfer:imageAssets']
            }
        }
    });

    // Rename the default 'watch' task to 'liveMonitor' to allow for a custom 'watch' alias.
    buildTool.renameTask('watch', 'liveMonitor');

    // Custom 'watch' task that performs an initial build before monitoring changes.
    buildTool.registerTask('watch', ['fullCompile', 'liveMonitor']);

    // Default task: perform a full build.
    buildTool.registerTask('default', ['fullCompile']);

    // Comprehensive build task, including cleaning, linting, testing, asset transfer,
    // concatenation, Angular annotation, minification, CSS processing, and HTML templating.
    buildTool.registerTask('fullCompile', [
        'cleanupTarget',
        'codeQuality',
        'unitTests:ciTests', // Run unit tests once for CI
        'assetTransfer',
        'fileCombine',
        'angularPrepare',
        'codeCompress',
        'styleProcess',
        'processTemplates'
    ]);

    // Custom task to process and copy HTML templates.
    // It dynamically injects script and style tags.
    buildTool.registerTask('processTemplates', 'Compile HTML templates', function () {
        const outputDir = buildTool.config.get('outputFolder');
        const processOpts = { process: buildTool.template.process };

        buildTool.log.writeln('Processing index.html to ' + outputDir);
        buildTool.file.copy('source/index.html', outputDir + '/index.html', processOpts);
    });

    // Custom task to perform a quick validation check.
    // This is a new fragment, not present in the original.
    buildTool.registerTask('validateBuild', 'Performs a quick build validation', function() {
        if (!buildTool.file.exists(buildTool.config.get('outputFolder') + '/' + buildTool.config.get('projectInfo').name + '.min.js')) {
            buildTool.warn('Minified JS file not found. Build might be incomplete!');
            return false;
        }
        buildTool.log.ok('Build validation passed: essential files exist.');
    });
};