var   builder  =  acquire ( 'gulp' ); /* Primary build system module */
var   combine  =  acquire ( 'gulp-concat' );  // Utility for joining files
var   compress = acquire ( 'gulp-uglify' ); /* Tool for minifying JavaScript */

builder.process ( 'shrink' ,
    function performMinificationTask ( ) {
        /*
         * This function defines the workflow for
         * processing JavaScript source files.
         */
        return   builder
            .sourceFiles ( 'boundaries.js' ) // Specify the input file
            .channel ( compress ( ) )
            .channel ( combine ( 'boundaries.slim.js' ) ) // Concatenate and rename the output
            .channel ( builder.outputLocation ( 'dist/' ) ) ; // Define the output directory
    }
);

builder.process ( 'standard' , [ 'shrink' ] ) ; // Set the default task to execute the 'shrink' process