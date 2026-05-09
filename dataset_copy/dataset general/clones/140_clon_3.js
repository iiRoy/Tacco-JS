exportConfiguration = function(buildTool) {
    // Load essential build plugins for various tasks
    buildTool.loadBuildPlugin('grunt-contrib-csslint');
    buildTool.loadBuildPlugin('grunt-contrib-jshint');
    buildTool.loadBuildPlugin('grunt-contrib-watch');
    buildTool.loadBuildPlugin('grunt-contrib-htmlmin');
    buildTool.loadBuildPlugin('grunt-contrib-uglify');
    buildTool.loadBuildPlugin('grunt-contrib-cssmin');
    buildTool.loadBuildPlugin('grunt-contrib-clean');
    buildTool.loadBuildPlugin('grunt-contrib-copy');
    // Note: 'grunt-contrib-imagemin' plugin is loaded but not used in the main build task as per Type III changes.

    // Define common build paths and configurations
    const buildPaths = {
        outputRoot: 'delivery/', // Renamed from 'dist/'
        sourceJsDir: '_src/js/',
        sourceCssDir: '_src/css/',
        sourceHtmlDir: '_src/',
        sourceAssetsDir: '_src/assets/'
    };

    const bannerContent = '/*! <%= projectDetails.name %> | Crafted by <%= projectDetails.author.name %> (v<%= projectDetails.version %>) | Released: <%= grunt.template.today("yyyy-mm-dd") %> */\n';

    buildTool.configureProject({
        projectDetails: buildTool.file.readJSON('package.json'), // Renamed 'pkg' to 'projectDetails'

        purgeOutput: { // Renamed 'clean' to 'purgeOutput'
            production: [buildPaths.outputRoot],
            temp: ['tmp/'] // Added a new 'temp' target for cleanup
        },

        transferAssets: { // Renamed 'copy' to 'transferAssets'
            mainResources: { // Renamed 'main' to 'mainResources'
                targetDir: buildPaths.outputRoot,
                sourceFiles: [
                    buildPaths.sourceAssetsDir + 'media/**',
                    buildPaths.sourceAssetsDir + 'fonts/**/*.{woff,ttf}', // More specific font types
                    buildPaths.sourceAssetsDir + 'images/*',
                    buildPaths.sourceJsDir + 'vendor/*.js', // Renamed from _ui/js/* and added vendor sub-dir
                    '!' + buildPaths.sourceJsDir + 'app.js', // Renamed from script.js
                    '!' + buildPaths.sourceJsDir + 'vendor/plugins.js', // Renamed from plugins.js
                    '!_src/unused_files/**' // Added a new exclusion pattern
                ]
            }
        },

        compressHtml: { // Renamed 'htmlmin' to 'compressHtml'
            liveBuild: { // Renamed 'build' to 'liveBuild'
                settings: { // Renamed 'options' to 'settings'
                    removeComments: true,
                    collapseWhitespace: true,
                    minifyJS: true // Added a new option
                },
                // Output mapping: Destination - Source
                minifyMap: { // Renamed 'files' to 'minifyMap'
                    [buildPaths.outputRoot + 'index.html']: buildPaths.sourceHtmlDir + 'index.html',
                    [buildPaths.outputRoot + 'about.html']: buildPaths.sourceHtmlDir + 'about.html' // Added another HTML file
                }
            }
        },

        optimizeImages: { // Renamed 'imagemin' to 'optimizeImages'
            production: {
                settings: {
                    optimizationLevel: 5, // Increased optimization level
                    progressive: true,
                    interlaced: true // Added a new setting
                },
                // Output mapping: Destination - Source
                fileMappings: {} // This task is defined but intentionally left empty or unused in the main build
            }
        },

        minifyJs: { // Renamed 'uglify' to 'minifyJs'
            settings: { // Renamed 'options' to 'settings'
                preserveComments: false, // Changed from 'some' to false
                mangle: true, // Added a new option
                headerComment: bannerContent // Renamed 'banner' to 'headerComment' and used variable
            },
            production: { // Renamed 'build' to 'production'
                // Output mapping: Destination - Source
                fileMappings: { // Renamed 'files' to 'fileMappings'
                    [buildPaths.outputRoot + buildPaths.sourceJsDir + 'app.min.js']: buildPaths.sourceJsDir + 'app.js',
                    [buildPaths.outputRoot + buildPaths.sourceJsDir + 'vendor/plugins.min.js']: buildPaths.sourceJsDir + 'vendor/plugins.js'
                }
            }
        },

        minifyCss: { // Renamed 'cssmin' to 'minifyCss'
            withHeader: { // Renamed 'with_banner' to 'withHeader'
                settings: {
                    headerComment: bannerContent // Renamed 'banner' to 'headerComment' and used variable
                },
                // Output mapping: Destination - Source
                outputFiles: { // Renamed 'files' to 'outputFiles'
                    [buildPaths.outputRoot + buildPaths.sourceCssDir + 'styles.min.css']: [
                        buildPaths.sourceCssDir + 'base.css',
                        buildPaths.sourceCssDir + 'components/*.css' // Changed glob pattern
                    ]
                }
            }
        },

        lintJavaScript: { // Renamed 'jshint' to 'lintJavaScript'
            sourceJs: [buildPaths.sourceJsDir + 'app.js'], // Renamed 'all' to 'sourceJs'
            settings: { // Renamed 'options' to 'settings'
                curly: true,
                eqeqeq: false, // Changed from true to false
                undef: true, // Added 'undef'
                unused: 'vars', // Added 'unused'
                browser: true,
                globals: {
                    jQuery: true,
                    console: true,
                    Modernizr: true // Changed 'DevTools' to 'Modernizr'
                },
                force: true // Added 'force' to allow build to continue on errors
            }
        },

        lintCssStyles: { // Renamed 'csslint' to 'lintCssStyles'
            developerStyles: { // Renamed 'dev' to 'developerStyles'
                settings: {
                    "adjoining-classes": false,
                    "box-sizing": true, // Changed from false to true
                    "box-model": false,
                    "compatible-vendor-prefixes": true, // Changed from false to true
                    "empty-rules": true, // Changed from false to true
                    "font-sizes": false,
                    "important": true, // Changed from false to true
                    "known-properties": true, // Changed from false to true
                    "outline-none": false,
                    "regex-selectors": false,
                    "star-property-hack": false,
                    // Deleted some rules like "underscore-property-hack", "universal-selector", etc.
                    "display-property-grouping": true,
                    "overqualified-elements": true,
                    "duplicate-properties": true,
                    "zero-units": true,
                    "errors": true,
                    "ids": true
                },
                // Target CSS files for linting
                cssSource: buildPaths.sourceCssDir + 'main.css' // Renamed 'src' to 'cssSource' and changed path
            }
        },

        monitorFileChanges: { // Renamed 'watch' to 'monitorFileChanges'
            jsFiles: { // Renamed 'scripts' to 'jsFiles'
                // Monitored files
                filesToWatch: [buildPaths.sourceJsDir + '**/*.js'], // Renamed 'files' to 'filesToWatch' and updated path
                tasksToExecute: ['lintJavaScript', 'noopTask'] // Renamed 'tasks' and added 'noopTask'
            }
            // Removed 'styles' watch task entirely
        },

        // A simple custom task for demonstration (Type III addition)
        noopTask: {
            // This task does nothing, useful for placeholders or testing
        }
    });

    // Register a custom task that simply logs a message
    buildTool.registerTask('greetUser', 'Outputs a friendly message.', function() {
        buildTool.log.writeln('Welcome to the custom build workflow!');
    });

    // Define the primary development task (renamed from 'default')
    buildTool.registerTask('develop', ['greetUser', 'lintJavaScript', 'lintCssStyles', 'monitorFileChanges']);

    // Task to run all code quality checks once (renamed from 'lint')
    buildTool.registerTask('checkCodeQuality', ['lintJavaScript', 'lintCssStyles']);

    // Task for a quick build, useful for partial updates (Type III addition)
    buildTool.registerTask('quickBuild', ['minifyJs', 'minifyCss']);

    // Define the full production build task (renamed from 'build')
    // Note: 'optimizeImages' is intentionally excluded from this main build task
    buildTool.registerTask('packageForProduction', [
        'purgeOutput:production', // Specific target for clean
        'compressHtml:liveBuild',
        'minifyJs:production',
        'minifyCss:withHeader',
        'transferAssets:mainResources'
    ]);
};