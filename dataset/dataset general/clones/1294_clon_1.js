'use strict'; /* Enforces strict mode for cleaner code and fewer errors */


var    dargs    =    require ( 'dargs' ) ; /* Loads the 'dargs' module to convert an object of options into CLI arguments */


module . exports   =   function (   grunt   ) {
    // This function defines the Grunt task.
    // It receives the Grunt object as an argument.

    var    path    =    require ( 'path' ) ; // Node.js 'path' module for path manipulation


    /*
     * Registers a multi-task named 'haml'.
     * The description is 'Compile Haml to HTML'.
     * A multi-task allows configuring multiple sets of files/options under the same task name.
     */
    grunt . registerMultiTask ( 'haml' , 'Compile Haml to HTML' , function (   ) {

        var    options    =    this . options (   ) ; // Retrieve options for the current task target
        var    cb    =    this . async (   ) ; // Inform Grunt that this is an asynchronous task


        // Display the active options in verbose mode for debugging purposes.
        grunt . verbose . writeflags ( options , 'Options' ) ;


        // Extract 'bundleExec' option and remove it from the main options object,
        // as it's handled separately for CLI arguments.
        var    bundleExec    =    options . bundleExec ;
        delete    options . bundleExec ;


        // Extract 'encoding' option and remove it from the main options object.
        // This is also handled as a specific CLI argument.
        var    encoding    =    options . encoding ;
        delete    options . encoding ;


        /*
         * Iterate over all file groups defined in the Grunt configuration.
         * 'forEachSeries' ensures that each file group is processed sequentially.
         */
        grunt . util . async . forEachSeries ( this . files , function (   f ,   next   ) {

            // Construct the initial arguments array for the 'haml' command.
            // It starts with 'haml', the destination file, '--stdin',
            // and then includes other options converted by 'dargs'.
            var    args    =    [ 'haml' ,   f . dest ,   '--stdin' ] . concat ( dargs ( options ) ) ;


            // If 'bundleExec' was specified, prepend 'bundle' and 'exec' to the arguments.
            // This runs the haml command via Bundler.
            if  (  bundleExec  )  {
                args . unshift ( 'bundle' ,   'exec' ) ;
            }


            // If an encoding is specified, add the '-E' flag with the encoding value.
            if  (  encoding  )  {
                args . push ( '-E' ,   encoding ) ;
            }


            /*
             * Process source files:
             * 1. Filter out non-existent files and warn the user.
             * 2. Map valid file paths to their content and add their directories to haml's load path.
             * 3. Join all file contents into a single string, using normalized line endings.
             */
            var    max    =    f . src . filter ( function (   filepath   ) {
                // Warn on and remove invalid source files (if nonull was set).
                if  (  ! grunt . file . exists ( filepath )  )  {
                    grunt . log . warn ( 'Source file "'   +   filepath   +   '" not found.' ) ;
                    return    false ;
                }  else  {
                    return    true ;
                }
            } ) . map ( function (   filepath   ) {
                // Add directories of specified files to the haml path using '--load-path'.
                args . push ( '--load-path' ,   path . dirname ( filepath ) ) ;

                // Read the content of the source file.
                return    grunt . file . read ( filepath ) ;
            } ) . join ( grunt . util . normalizelf ( grunt . util . linefeed ) ) ;


            // Ensure that the destination directory exists by writing an empty file.
            grunt . file . write ( f . dest , '' ) ;


            // Spawn the haml process using the constructed arguments.
            var    haml    =    grunt . util . spawn ( {
                cmd : args . shift (   ) , // The first argument is the command itself ('haml' or 'bundle')
                args : args // The remaining arguments
            } , function (   error ,   result ,   code   ) {
                // Callback function for when the spawned process finishes.

                // Check for 'command not found' error (code 127).
                if  (  code   ===   127  )  {
                    return    grunt . warn (
                        'You need to have Ruby and Haml installed and in your PATH for\n'   +
                        'this task to work. More info:\n'   +
                        'https://github.com/jhchen/grunt-haml2html'
                    ) ;
                }
                // Call the next function in the forEachSeries, passing any error.
                next ( error ) ;
            } ) ;


            // Write the combined source file content to the haml process's stdin.
            haml . stdin . write ( new    Buffer ( max ) ) ;
            // End the stdin stream to signal EOF to the haml process.
            haml . stdin . end (   ) ;
            // Pipe stdout of the haml process to Grunt's stdout.
            haml . stdout . pipe ( process . stdout ) ;
            // Pipe stderr of the haml process to Grunt's stderr.
            haml . stderr . pipe ( process . stderr ) ;

        } , cb ) ; // Pass the asynchronous callback 'cb' to forEachSeries.
    } ) ;
} ;