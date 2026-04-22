/*
 * This is a Gruntfile.js configuration.
 * It sets up various tasks for front-end development workflow.
 *
 * All tasks are defined within grunt.initConfig().
 */
'use strict'; // Enforce strict mode for better code quality.

module.exports = function ( grunt ) {

	// Initialize Grunt configuration object.
	grunt.initConfig ( {
		// --- CONCATENATION TASK ---
		concat : {
			options : {
				separator : ';', // Use a semicolon to separate concatenated files.
			},
			dev : { // Development build for JavaScript concatenation.
				src : [ // Source files to be concatenated.
					'vendor/react/react.js',
					'vendor/promise-0.1.1.min/index.js',
					'vendor/numeral/min/numeral.min.js',
					'js/index.js' // Main application JavaScript file.
				],
				dest : 'app.js', // Destination file for the concatenated output.
			},
		},


		// --- CLEAN TASK ---
		// Cleans specified files or directories.
		clean : [
			'app.css', // Remove compiled CSS.
			'app.js'   // Remove compiled JavaScript.
		],


		// --- SASS TASK ---
		// Compiles Sass files into CSS.
		sass : {
			options : {
				compass   : true, // Enable Compass support.
				require   : [ 'sass-css-importer' ], // Require sass-css-importer.
				sourcemap : true // Generate source maps for debugging.
			},
			dev : { // Development build for Sass.
				options : {
					style : 'expanded' // Output CSS in expanded style (readable).
				},
				files : {
					'app.css' : 'scss/app.scss' // Compile scss/app.scss to app.css.
				}
			},
			dist : { // Distribution build for Sass.
				options : {
					style : 'compressed' // Output CSS in compressed style (minified).
				},
				files : {
					'app.css' : 'scss/app.scss' // Compile scss/app.scss to app.css.
				}
			}
		},


		// --- UGLIFY TASK ---
		// Minifies JavaScript files.
		uglify : {
			dist : { // Distribution build for JavaScript minification.
				options : {
					sourceMap : 'source-map.js', // Generate a source map file.
					report    : 'gzip' // Report gzip size savings.
				},
				files : {
					'app.js' : [ // Destination and source files for minification.
						'vendor/react/react.min.js',
						'vendor/promise-0.1.1.min/index.js',
						'vendor/numeral/numeral.js',
						'js/index.js'
					]
				}
			}
		},


		// --- WATCH TASK ---
		// Watches for changes in files and runs specified tasks.
		watch : {
			css : { // Watch CSS (Sass) files.
				files : 'scss/**/*', // Watch all files in the scss directory and its subdirectories.
				tasks : [ 'sass:dev' ] // Run the 'sass:dev' task on change.
			},
			js : { // Watch JavaScript files.
				files : 'js/**/*', // Watch all files in the js directory and its subdirectories.
				tasks : [ 'concat:dev' ] // Run the 'concat:dev' task on change.
			}
		}
	} ); // End of grunt.initConfig()


	// Load Grunt plugins.
	// This array contains all the necessary Grunt plugin names.
	[
		'grunt-contrib-clean',   // Plugin for cleaning files/directories.
		'grunt-contrib-concat',  // Plugin for concatenating files.
		'grunt-contrib-sass',    // Plugin for compiling Sass.
		'grunt-contrib-uglify',  // Plugin for minifying JavaScript.
		'grunt-contrib-watch'    // Plugin for watching file changes.
	].forEach( grunt.loadNpmTasks.bind( grunt ) ); // Load each plugin.


	// Register Grunt tasks.
	// These define common workflows.

	// Development task: Cleans, compiles Sass, concatenates JS, and watches for changes.
	grunt.registerTask( 'dev', [
		'clean',      // Run clean task first.
		'sass:dev',   // Compile Sass for development.
		'concat:dev', // Concatenate JS for development.
		'watch'       // Start watching for file changes.
	] );

	// Distribution task: Cleans, compiles Sass, and minifies JS for production.
	grunt.registerTask( 'dist', [
		'clean',        // Run clean task.
		'sass:dist',    // Compile Sass for distribution.
		'uglify:dist'   // Minify JS for distribution.
	] );

	// Default task: Alias for the 'dev' task.
	grunt.registerTask( 'default', [ 'dev' ] );

}; // End of module.exports function.