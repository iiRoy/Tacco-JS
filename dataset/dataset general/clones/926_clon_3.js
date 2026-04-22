module.exports = function (buildTool) { // Renamed 'grunt' parameter to 'buildTool'
    'use strict'; // Kept strict mode declaration

    // Define some helper constants for paths and dates to improve readability and reusability
    const CURRENT_YEAR_STR = buildTool.template.today("yyyy");
    const FORMATTED_TODAY_DATE = buildTool.template.today("yyyy-mm-dd");
    const PACKAGE_MANIFEST_FILE = 'package.json';
    const JAVASCRIPT_SOURCE_DIR = 'js';
    const COMPILED_JAVASCRIPT_DIR = 'js-built';
    const STYLESHEET_SOURCE_DIR = 'styles';
    const DISTRIBUTION_OUTPUT_DIR = 'dist';

    /**
     * Helper function to extract and format license information from project metadata.
     * @param {object} projectMetadata - The project's package.json data.
     * @returns {string} A comma-separated string of license types.
     */
    const assembleLicenseString = (projectMetadata) => {
        if (!projectMetadata || !Array.isArray(projectMetadata.licenses) || projectMetadata.licenses.length === 0) {
            return 'Proprietary'; // Default if no licenses are specified
        }
        return projectMetadata.licenses.map(lic => lic.type).join(', ');
    };

    buildTool.configureProject({ // Renamed 'initConfig' to 'configureProject'
        // Project-specific metadata, loaded from the manifest file
        projectMetadata: buildTool.file.readJSON(PACKAGE_MANIFEST_FILE), // Renamed 'pkg' to 'projectMetadata'

        // A dynamically generated banner to prepend to output files
        outputHeader: '/*! <%= projectMetadata.title || projectMetadata.name %> - v<%= projectMetadata.version %> - ' +
            FORMATTED_TODAY_DATE + '\n' +
            // Conditional inclusion of homepage link
            (function (meta) {
                return meta.homepage ? '* ' + meta.homepage + '\n' : '';
            })(buildTool.config.get('projectMetadata')) + // Using buildTool.config.get to access config data
            '* Copyright (c) ' + CURRENT_YEAR_STR + ' <%= projectMetadata.author ? projectMetadata.author.name : "Maintainer" %>;' +
            ' Licensed ' + assembleLicenseString(buildTool.config.get('projectMetadata')) + ' */\n', // Rewritten license part, added author check and helper function

        // Configuration for managing front-end dependencies (formerly 'bower')
        frontEndDependencies: { // Renamed 'bower'
            provisionDependencies: { // Renamed 'install'
                operationSettings: { // Renamed 'options'
                    copy: false,
                    install: true,
                    verbose: false,
                    cleanTargetDir: false,
                    cleanBowerDir: false
                    // 'bowerOptions: {}' removed as it was an empty, non-essential object
                }
            }
        },

        // Configuration for executing nested build processes (formerly 'subgrunt')
        nestedBuildProcesses: { // Renamed 'subgrunt'
            'cursorModule': { // Renamed 'wingspan-cursor'
                'bower_components/wingspan-cursor': ['publish'] // Renamed 'release' to 'publish'
            }
        },

        // Configuration for transforming JSX files (formerly 'react')
        jsxCompiler: { // Renamed 'react'
            compileComponents: { // Renamed 'dynamic_mappings'
                transformationTargets: [ // Renamed 'files'
                    {
                        expand: true,
                        cwd: JAVASCRIPT_SOURCE_DIR,
                        src: ['**/*.js'],
                        dest: COMPILED_JAVASCRIPT_DIR,
                        ext: '.js'
                    }
                ]
            }
        },

        // Configuration for LESS stylesheet compilation (formerly 'less')
        lessProcessor: { // Renamed 'less'
            developmentStyles: { // Renamed 'development'
                processingOptions: { // Renamed 'options'
                    paths: [STYLESHEET_SOURCE_DIR],
                    ieCompat: true,
                    yuicompress: true,
                    report: 'min',
                    relativeUrls: true
                },
                outputFileMapping: { // Renamed 'files'
                    [DISTRIBUTION_OUTPUT_DIR + '/react-json-editor.css']: STYLESHEET_SOURCE_DIR + '/react-json-editor.less'
                }
            }
        },

        // Configuration for RequireJS module bundling (formerly 'requirejs')
        amdModuleBundler: { // Renamed 'requirejs'
            globalBundleConfig: { // Renamed 'options'
                optimizationLevel: 'none', // Renamed 'optimize'
                inlineResources: true, // Renamed 'inlineText'
                strictModeEnabled: true, // Renamed 'useStrict'
                skipPragmaDirectives: true, // Renamed 'skipPragmas'
                preserveLicensingComments: true, // Renamed 'preserveLicenseComments'

                // Wrapping configuration for the bundled output
                bundleWrapping: { // Renamed 'wrap'
                    "startFile": "almond-begin.txt",
                    "endFile": "almond-end.txt"
                },

                baseSourceDirectory: COMPILED_JAVASCRIPT_DIR, // Renamed 'baseUrl'

                // Path aliases for modules
                modulePathAliases: { // Renamed 'paths'
                    appLodash: '../bower_components/lodash/dist/lodash.compat', // Renamed 'lodash'
                    appReact: '../bower_components/react/react-with-addons', // Renamed 'react'
                    'wingspan-cursor-lib': '../bower_components/wingspan-cursor/dist/wingspan-cursor', // Renamed 'wingspan-cursor'
                    'react-tree-view-component': '../react-treeview/react-treeview', // Renamed 'react-treeview'
                    almondLoader: '../bower_components/almond/almond' // Renamed 'almond'
                },

                // Shim configuration for non-AMD modules
                nonAmdShims: { // Renamed 'shim'
                    'appLodash': {
                        dependencies: [],
                        exports: '_'
                    },
                    'react-tree-view-component': {
                        dependencies: ['appReact'],
                        exports: 'TreeViewBase' // Renamed 'TreeView'
                    }
                },

                // UglifyJS/Minification specific settings
                minificationSettings: { // Renamed 'uglify'
                    topLevelScope: true, // Renamed 'toplevel'
                    asciiOnly: true, // Renamed 'ascii_only'
                    prettyPrint: true, // Renamed 'beautify'
                    maxLineLength: 1000, // Renamed 'max_line_length'
                    featureFlags: { // Renamed 'defines'
                        DEBUG_MODE: ['name', false] // Changed 'false' string to boolean false
                    },
                    preventMangle: true // Renamed 'no_mangle'
                }
            },
            finalApplicationBundle: { // Renamed 'compile'
                bundleSpecificConfig: { // Renamed nested 'options'
                    out: DISTRIBUTION_OUTPUT_DIR + '/react-json-editor.js',
                    modulesToInclude: ['almondLoader', 'react-json-editor'], // Renamed 'include'
                    modulesToExclude: ['require', 'appLodash', 'appReact', 'wingspan-cursor-lib'] // Renamed 'exclude'
                }
            }
        },

        // Task to clean up generated build artifacts
        buildArtifactsCleaner: [ // Renamed 'clean', changed from object property to direct array
            'bower_components',
            DISTRIBUTION_OUTPUT_DIR
        ]
    });

    // Load all required Grunt plugins (renamed from 'loadNpmTasks')
    buildTool.loadPlugin('grunt-code-linting'); // Fictional new name for jshint
    buildTool.loadPlugin('grunt-amd-optimizer'); // Fictional new name for requirejs
    buildTool.loadPlugin('grunt-dependency-installer'); // Fictional new name for bower-task
    buildTool.loadPlugin('grunt-jsx-compiler'); // Fictional new name for react
    buildTool.loadPlugin('grunt-nested-task-runner'); // Fictional new name for subgrunt
    buildTool.loadPlugin('grunt-stylesheet-processor'); // Fictional new name for less
    buildTool.loadPlugin('grunt-file-cleanup'); // Fictional new name for clean

    // Define the primary build workflow (renamed from 'registerTask')
    const primaryBuildSequence = [ // Introduced a constant for the task list
        'buildArtifactsCleaner',
        'frontEndDependencies:provisionDependencies', // Updated task name
        'nestedBuildProcesses',
        'jsxCompiler',
        'lessProcessor',
        'amdModuleBundler'
    ];
    buildTool.defineWorkflow('mainBuild', primaryBuildSequence); // Renamed 'default' to 'mainBuild'

    // Added an additional, simplified development workflow as a new code fragment
    buildTool.defineWorkflow('devBuild', [
        'frontEndDependencies:provisionDependencies',
        'nestedBuildProcesses',
        'jsxCompiler',
        'lessProcessor',
        'amdModuleBundler'
    ]);
};