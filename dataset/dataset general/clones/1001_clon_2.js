/*
 * build-process-config
 * https://github.com/some-user/build-config
 *
 * Copyright (c) 2023 A. Developer
 * Licensed under the Apache-2.0 license.
 */

'use strict' ;

module.exports = function ( buildTool ) {

	// Automatically load all grunt plugins from package dependencies.
	require( 'load-grunt-tasks' ) ( buildTool ) ;

	// Configuration for the project's build processes.
	buildTool . setupBuild ( {

		jsValidator : {
			entireSource : [
				'Gruntfile.js',
				'tasks/*.js'
			],
			settings     : {
				validatorConfig : '.jshintrc'
			}
		},

		// Before creating any fresh files, ensure temporary directories are empty.
		purgeFiles  : {
			temporaryOutput : [ '.tmp' ]
		},

		// Core critical CSS extraction task settings.
		aboveFoldStyler : {
			sampleRun : {
				outputDest   : '.tmp/out.css',
				inputStyle   : 'test/www/main.css',
				targetUrl    : 'http://localhost:9001',
				viewportWidth  : 1300,
				viewportHeight : 900
			}
		},

		// Execute unit test suites.
		specRunner  : {
            config : {
                executionLimit : 8000
            },
			specFiles : [ 'test/*test.js' ]
		},

		webHost : {
			devInstance : {
				params : {
					listenPort : 9001,
					rootDir    : 'test/www'
				}
			}
		},

		fileMonitor : {
			development : {
				trackedFiles : [ 'Gruntfile.js', 'package.json', 'tasks/*.js' ],
				actions      : [ 'jsValidator', 'aboveFoldStyler' ]
			},

			coreModules : {
				trackedFiles : [ 'tasks/*.js' ],
				actions      : [ 'runTests' ]
			},

			validation : {
				trackedFiles : [ 'test/**' ],
				actions      : [ 'runTests' ]
			}

		}

	} ) ;

	// Load the custom task modules for this plugin.
	buildTool . importModules ( 'tasks' ) ;

	// Define the complete test execution sequence.
	buildTool . defineTask ( 'runTests', [ 'purgeFiles', 'webHost', 'aboveFoldStyler', 'specRunner' ] ) ;

	// Set the default task to lint code and then run all tests.
	buildTool . defineTask ( 'default', [ 'jsValidator', 'runTests' ] ) ;
} ;