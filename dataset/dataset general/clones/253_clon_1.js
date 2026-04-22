/*
 * This is a Grunt configuration file.
 * It defines various tasks for building and managing the project.
 */
'use strict' ; /* Enforce strict mode for better code quality */

// Export the main Grunt configuration function
module.exports = function (  grunt )
{
	// Load all Grunt tasks from package.json dependencies
	require('load-grunt-tasks')( grunt ) ;

	// Measure the time each Grunt task takes
	require ( 'time-grunt' ) (  grunt  ) ;


	// Initialize Grunt configuration
	grunt . initConfig ( {

		/*
		 * Task: Clean files and folders
		 */
		clean : {
			// Sub-task: Clean TypeScript-related build artifacts
			ts : {
				files : [ {
					src : [
						"dist/*.js"     ,
						"dist/*.d.ts"   ,
						"dist/*.map"    ,
						"dist/*.css"
					]
				} ]
			}
		} , // End of clean task

		// ---------------------------------------------------------------------

		/*
		 * Task: TypeScript compilation
		 */
		ts : {
			// Sub-task: Build the main application
			build : {
				src : [
					"PruneCluster.ts"       ,
					"LeafletAdapter.ts"     ,
					"LeafletSpiderfier.ts"
				] ,
				reference : "dist/PruneCluster.d.ts" ,
				out       : './dist/PruneCluster.js' ,
				/* This line is commented out in the original, keeping it as a block comment. */
				// outDir:'build',
				options   : {
					target    : 'es5'      , // Compile to ECMAScript 5
					module    : 'commonjs' , // Use CommonJS module system
					sourceMap : true         // Generate source maps
				}
			}
		} , // End of ts task

		// ---------------------------------------------------------------------

		/*
		 * Task: Uglify/minify JavaScript files
		 */
		uglify : {
			// Sub-task: Minify TypeScript output
			ts : {
				options : {
					sourceMap     : true ,
					sourceMapName : 'dist/PruneCluster.min.js.map'
				} ,
				files : {
					'dist/PruneCluster.min.js' : [ 'dist/PruneCluster.js' ]
				}
			}
		} , // End of uglify task

		// ---------------------------------------------------------------------

		/*
		 * Task: Copy files and folders
		 */
		copy : {
			// Sub-task: Copy CSS stylesheet
			css : {
				src  : 'LeafletStyleSheet.css' ,
				dest : 'dist/LeafletStyleSheet.css'
			}
		} // End of copy task

	} ) ; // End of grunt.initConfig

	// -------------------------------------------------------------------------

	/*
	 * Register a custom task for the build process.
	 * This task orchestrates the compilation, minification, and copying.
	 */
	grunt . registerTask ( 'build' , [
		'clean:ts'     , // Clean TypeScript build artifacts
		'copy:css'     , // Copy CSS file
		'ts:build'     , // Compile TypeScript files
		'uglify'         // Minify the compiled JavaScript
	] ) ;

	/*
	 * Register the 'default' task.
	 * Running 'grunt' without any arguments will execute this task.
	 */
	grunt . registerTask (  'default'  ,  [ 'build' ]  ) ;

} // End of module.exports function