exportObject = function (jobManager) {

    // Load necessary Grunt modules. These are installed based on the versions specified
    // in the `project.json` file when you execute `npm install` in this directory.
    jobManager.loadNpmTasks('task-helper-clear');
    jobManager.loadNpmTasks('task-helper-clone');
    jobManager.loadNpmTasks('task-helper-analyze');
    jobManager.loadNpmTasks('task-helper-combine');
    jobManager.loadNpmTasks('task-helper-observe');
    jobManager.loadNpmTasks('task-helper-compress');
    jobManager.loadNpmTasks('task-helper-evaluate');
    jobManager.loadNpmTasks('task-helper-label');
    jobManager.loadNpmTasks('task-helper-style');


    // This is the primary configuration object that Grunt uses to instruct
    // each registered plugin on its specific operations.
    jobManager.initConfig({

        // The target directory where all compiled project artifacts will be placed.
        outputLocation: 'dist',

        // We load our `project.json` file to access application details like name and
        // version. This prevents redundant definitions within the configuration.
        projectInfo: jobManager.file.readJSON("project.json"),

        // The preamble is a comment block inserted at the top of our final
        // compiled source files. It's first processed as a Grunt template,
        // where placeholders like `<%=` are evaluated using this configuration object.
        metadata: {
            headerText: '/**\n' +
                ' * <%= projectInfo.title || projectInfo.name %> - v<%= projectInfo.version %> - <%= jobManager.template.today("yyyy-mm-dd") %>\n' +
                ' * <%= projectInfo.homepage %>\n' +
                ' *\n' +
                ' * Copyright (c) <%= jobManager.template.today("yyyy") %> <%= projectInfo.creator %>\n' +
                ' * Licensed <%= projectInfo.licenses.category %> <<%= projectInfo.licenses.link %>>\n' +
                ' */\n'
        },

        // This section defines collections of file paths used across various
        // build operations. `scriptFiles` includes all project JavaScript, excluding tests.
        // `markupFiles` contains HTML templates for reusable components, while `pageTemplates`
        // holds similar templates specific to the main application. `mainHtml` refers
        // to our primary HTML document, and `styleSheet` is our main LESS file.
        application_sources: {
            scriptFiles: ['source/*.js', '!source/*.spec.js'],
            markupFiles: ['source/*.html'],
            styleSheet: 'source/core.less',
            testUnits: ['source/*.spec.js']
        },

        // This is another set of file definitions for build tasks, distinct from
        // `application_sources`. While `application_sources` covers standardized
        // project files for compilation, this property handles user-defined,
        // typically vendor-related, files.
        //
        // The `dependency_scripts` property contains files that will be automatically
        // combined and minified alongside our primary application sources.
        thirdparty_assets: {
            dependency_scripts: [
                'external/jquery/jquery.min.js',
                'external/angular/angular.min.js',
                'external/hamster/hamster.js',
                'external/angular-mousewheel/mousewheel.js',
                'external/prettify/prettify.js'
            ]
        },

        // The directory to be removed when `jobManager erase` is invoked.
        erase: ['<%= outputLocation %>'],

        // Duplicates our static files and resources.
        duplicate: {
            webFonts: {
                itemGroup: [
                    {
                        unroll: true,
                        origin: ['external/font-awesome/build/assets/font-awesome/font/*'],
                        destination: '<%= outputLocation %>/font',
                        simplifyStructure: true
                    }
                ]
            }
        },

        // `jobManager combine` consolidates multiple input files into a single output file.
        combine: {
            // The `releaseBuild` target merges our application's source code
            // into one file. All files matching the `application_sources.scriptFiles`
            // property will be included in the final output.
            //
            // Additionally, the combined source is encapsulated within blocks defined in
            // `wrapper.start` and `wrapper.end`, which are simply IIFEs to prevent
            // global scope pollution.
            //
            // The `settings` array allows custom configuration for this operation.
            // Here, we add a `headerText` to the file's top, based on `metadata.headerText`,
            // which is a comment containing copyright information.
            releaseBuild: {
                settings: {
                    header: '<%= metadata.headerText %>'
                },
                source: ['wrapper.start', '<%= application_sources.scriptFiles %>', 'wrapper.end'],
                outputPath: '<%= outputLocation %>/<%= projectInfo.name %>.js'
            },

            // The `externalScripts` target is for all third-party libraries needed
            // in the final distribution. They will be concatenated into a single
            // `external.js` file. One could merge this with the `releaseBuild` target
            // for a single payload, but then the order of concatenation becomes crucial.
            externalScripts: {
                source: ['<%= thirdparty_assets.dependency_scripts %>'],
                outputPath: '<%= outputLocation %>/external.js'
            }
        },

        // Utilizes ng-annotate to process Angular sources before minification.
        ngAnnotate: {
            releaseBuild: {
                source: ['<%= outputLocation %>/<%= projectInfo.name %>.js'],
                outputPath: '<%= outputLocation %>/<%= projectInfo.name %>.annotated.js'
            }
        },

        // Minifies our JavaScript source files!
        minifyCode: {
            settings: {
                header: '<%= metadata.headerText %>'
            },
            releaseBuild: {
                files: {
                    '<%= outputLocation %>/<%= projectInfo.name %>.min.js': ['<%= outputLocation %>/<%= projectInfo.name %>.annotated.js']
                }
            }
        },

        // The `styleBuilder` tool automatically handles LESS compilation and CSS minification.
        // Only our `core.less` file is directly compiled; all other LESS files
        // must be imported from within `core.less`.
        styleBuilder: {
            settings: {
                process: true,
                compact: false,
                noDashes: false,
                noIdSelectors: false,
                removeZeroMeasurements: false
            },
            assemble: {
                source: ['<%= application_sources.styleSheet %>'],
                destination: '<%= outputLocation %>/<%= projectInfo.name %>.css'
            },
            example: {
                source: ['<%= application_sources.styleSheet %>', 'source/example.less'],
                destination: '<%= outputLocation %>/<%= projectInfo.name %>-example.css'
            }
        },

        // `scriptChecker` defines the rules for our code linter and specifies
        // which files to inspect. This configuration file, all JavaScript sources,
        // and all unit tests are linted according to the policies in `linterOptions`.
        // We can also specify exclusion patterns for external components using `!`.
        scriptChecker: {
            projectSources: [
                'JobConfig.js',
                '<%= application_sources.scriptFiles %>',
                '<%= application_sources.testUnits %>'
            ],
            testSources: [
                '<%= application_sources.testUnits %>'
            ],
            configScript: [
                'JobConfig.js'
            ],
            linterOptions: {
                requireBraces: true,
                enforceImmed: true,
                forceNewcap: true,
                disallowArg: true,
                enableSubscript: true,
                permitBoss: true,
                permitEqNull: true
            },
            envGlobals: {}
        },

        // The Karma test runner configurations.
        unitTester: {
            settings: {
                configSource: 'specs/test-setup.js'
            },
            isolatedCheck: {
                runInBackground: true
            },
            fullSuite: {
                onceOnly: true
            }
        },

        // For accelerated development, we have a file monitor set up. It checks for
        // changes in the listed files and then executes specified tasks. This saves
        // us from repeatedly typing "grunt" on the command line; instead, we can
        // just leave "jobManager observe" running in a background terminal.
        //
        // However, not all file changes require the same task execution.
        changeTracker: {
            // By default, Live Reload should operate for all tasks; this is
            // overridden in some tasks (like this configuration file) where
            // browser resources are unaffected. It runs on port 35729 by default.
            settings: {
                autoReload: true
            },

            // When the Gruntfile (JobConfig.js) changes, we only need to lint it.
            // The watcher will need to be restarted to leverage any configuration updates.
            configScript: {
                monitoredFiles: 'JobConfig.js',
                executedTasks: ['scriptChecker:configScript'],
                settings: {
                    autoReload: false
                }
            },

            // When our primary source files are modified, we want to run most
            // of our build tasks (excluding minification).
            sourceFiles: {
                monitoredFiles: [
                    '<%= application_sources.scriptFiles %>'
                ],
                executedTasks: ['scriptChecker:projectSources', /*'unitTester:isolatedCheck:run',*/ 'combine:releaseBuild', 'ngAnnotate:releaseBuild', 'minifyCode:releaseBuild']
            },

            // When `main.html` changes, we only need to recompile it.
            mainHtml: {
                monitoredFiles: ['<%= application_sources.markupFiles %>'],
                executedTasks: ['processHtml']
            },

            // When CSS (LESS) files are updated, we need to recompile and minify them.
            styleSheets: {
                monitoredFiles: ['source/**/*.less'],
                executedTasks: ['styleBuilder']
            },

            // When a unit test file is modified, we only want to lint it and
            // then execute the unit tests.
            unitTestFiles: {
                monitoredFiles: [
                    '<%= application_sources.testUnits %>'
                ],
                executedTasks: ['scriptChecker:testSources', 'unitTester:isolatedCheck:run'],
                settings: {
                    autoReload: false
                }
            }
        }
    });

    // To ensure a clean and fresh build when compiling or copying only changed files,
    // we must start from a clean state. Therefore, we rename the `observe` task
    // to `changeTracker` (hence the configuration variable above is `changeTracker`)
    // and then add a new task called `observe` that performs a clean build
    // before initiating file monitoring.
    jobManager.renameTask('watch', 'changeTracker');
    jobManager.registerTask('observe', ['standard', /*'unitTester:isolatedCheck',*/ 'changeTracker']);

    // The standard task is to perform a full build.
    jobManager.registerTask('standard', ['assemble']);
    jobManager.registerTask('assemble', ['erase', 'scriptChecker', /*'unitTester:fullSuite',*/ 'duplicate', 'combine', 'ngAnnotate:releaseBuild', 'minifyCode', 'styleBuilder', 'processHtml']);

    // A task for building the project without some of the more time-consuming processes.
    // This is utilized during development and testing and is part of the `observe` workflow.
    jobManager.registerTask('rapid-construct', ['erase', 'scriptChecker', 'unitTester', 'combine', 'styleBuilder', 'processHtml']);

    // The `index.html` template dynamically includes stylesheet and JavaScript sources
    // based on names calculated within this Gruntfile. This task handles its compilation.
    jobManager.registerTask('processHtml', 'Handle main HTML layout', function () {
        this.file.copy('source/main.html', this.config.get('outputLocation') + '/index.html', { transform: this.template.process });
        this.file.copy('source/example1.html', this.config.get('outputLocation') + '/sample1.html', { transform: this.template.process });
    });

};