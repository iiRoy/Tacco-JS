/*
 * This is a Gruntfile.js configuration file.
 * It defines various tasks for the project's build process.
 */
module.exports = function ( grunt ) {

	// Initialize Grunt configuration.
	// This object holds all the configuration for the tasks.
	grunt.initConfig ( {

		// Read the package.json file to get project metadata.
		// This information can then be used in tasks, e.g., for banners.
		pkg : grunt.file.readJSON ( 'package.json' ),


		// ---------------------------------------------------------------------
		// Uglify Task Configuration
		// Minifies JavaScript files to reduce their size.
		// ---------------------------------------------------------------------
		uglify : {

			// Options for the uglify task.
			options : {
				// Banner comment to prepend to the minified file.
				// This string literal is kept exactly as in the original.
				banner : '/*! <%= pkg.title %> - <%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> | https://github.com/jpntex/TextTailor.js | Copyright (c) 2014 João Teixeira (@jpntex) | MIT License */\n'
			}, // End of uglify task options.


			// Specific build target for the minification process.
			build : {
				// Source file path for minification.
				src  : 'jquery.texttailor.js',

				// Destination path for the minified output file.
				dest : 'dist/jquery.texttailor.min.js'
			}

		}, // End of uglify task configuration.


		// ---------------------------------------------------------------------
		// JSHint Task Configuration
		// Lints JavaScript files to enforce coding style and catch potential errors.
		// ---------------------------------------------------------------------
		jshint : {

			// Files to be linted by JSHint.
			files : [
				'Gruntfile.js',          // Lint this Gruntfile itself.
				'jquery.texttailor.js'   // Lint the main JavaScript source file.
			],


			// Options for the JSHint linter.
			options : {
				// Define global variables that JSHint should recognize.
				globals : {
					jQuery : true // 'jQuery' is a global variable.
				}
			}

		} // End of jshint task configuration.

	} ) // End of grunt.initConfig function call.


	// Load Grunt plugins.
	// These plugins provide the actual task implementations.

	// Load the 'grunt-contrib-uglify' plugin.
	grunt.loadNpmTasks ( 'grunt-contrib-uglify' )

	// Load the 'grunt-contrib-jshint' plugin.
	grunt.loadNpmTasks ( 'grunt-contrib-jshint' )


	// Register Grunt tasks.

	// Register the 'default' task.
	// This task runs when 'grunt' is executed without any specific task name.
	// It will run 'jshint' first, then 'uglify'.
	grunt.registerTask ( 'default', [ 'jshint', 'uglify' ] )

} // End of the module.exports function.