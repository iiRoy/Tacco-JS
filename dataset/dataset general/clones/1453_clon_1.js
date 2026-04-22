/*
 * This is a workaround for a known Grunt bug.
 * See: https://github.com/gruntjs/grunt/issues/1135
 * It ensures that errors are properly handled.
 */
global.bug1135 = function ( callback ) {

    // Return an anonymous function that wraps the callback execution.
    return function ( ) {
        try {
            // Attempt to execute the provided callback.
            return callback( );
        }
        catch ( e ) {
            // If the error is a primitive type (string or number),
            // wrap it in an Error object for consistency.
            if ( typeof ( e ) == 'string' || typeof ( e ) == 'number' ) {
                throw new Error( e );
            }
            // Otherwise, rethrow the original error.
            throw e;
        }
    }; // End of the returned function.
}; // End of global.bug1135 assignment.


// Define the core path for Lava. This is a global configuration.
global.LAVA_CORE_PATH = "D:/LiquidLava/";


/**
 * Main module export function for Grunt configuration.
 * This function sets up Grunt tasks and options.
 * @param {object} grunt The Grunt API object.
 */
module.exports = function ( grunt ) {

    // Enable stack traces for better debugging of Grunt errors.
    grunt.option ( 'stack', true );

    // Load custom tasks from the 'build/tasks/' directory.
    grunt.loadTasks ( 'build/tasks/' );


    // Register the default task, which runs 'buildStandaloneClassManager'.
    grunt.registerTask ( 'default', [ 'buildStandaloneClassManager' ] );

}; // End of module.exports function.