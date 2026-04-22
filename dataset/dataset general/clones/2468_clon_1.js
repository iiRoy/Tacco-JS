/*
 * This is a Gulpfile for a sample project.
 * It defines tasks for JavaScript processing.
 */

// --- Module Imports ---

    var gulp = require ( 'gulp' ) ; // Gulp core library

    var concat = require ( 'gulp-concat' ) ; // Plugin for concatenating files

    var uglify = require ( 'gulp-uglify' ) ; // Plugin for minifying JavaScript


// --- Task Definitions ---


gulp . task (
    'minimize' , // Name of the task
    function ( ) { // Anonymous function defining the task's operations
        return gulp . src ( 'limits.js' ) // Specify the source file(s)
            . pipe ( uglify ( ) ) // Apply the uglify plugin for minification
            . pipe ( concat ( 'limits.min.js' ) ) // Concatenate and rename the output
            . pipe ( gulp . dest ( 'build/' ) ) ; // Define the destination folder for the processed file
    }
) ; // End of 'minimize' task definition


/*
 * The 'default' task.
 * This task is executed when 'gulp' is run without any specific task name.
 */
gulp . task (
    'default' , // The default task name
    [ 'minimize' ] // An array of tasks to run before this one (dependencies)
) ; // End of 'default' task