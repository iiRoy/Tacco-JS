/*
 * This file contains the core logic for the 'ncp' utility,
 * which provides functionality similar to the 'cp -R' command.
 * It's designed to copy files and directories recursively.
 *
 * This module leverages Node.js built-in file system (fs) and path modules
 * to perform robust and concurrent copy operations.
 */

var fs   = require('fs')
  , path = require('path')
  ; /* Node.js built-in modules for file system operations and path manipulation */


// Export the main 'ncp' function for external usage.
module.exports = ncp;

/* Self-reference for compatibility or internal access. */
ncp.ncp = ncp;


/**
 * Main function to recursively copy files and directories from a source to a destination.
 * Supports various options like filtering, renaming, transforming, and concurrency limits.
 *
 * @param {string} source   The source path to copy from. This can be a file or a directory.
 * @param {string} dest     The destination path to copy to.
 * @param {object} options  Configuration options for the copy operation.
 *                          - `filter`: A RegExp or function to filter files/directories.
 *                          - `rename`: A function to rename target paths.
 *                          - `transform`: A function to transform file streams.
 *                          - `clobber`: Boolean, whether to overwrite existing files (default: true).
 *                          - `modified`: Boolean, whether to only copy if source is newer (default: false).
 *                          - `dereference`: Boolean, whether to dereference symbolic links (default: false).
 *                          - `limit`: Number, maximum concurrent operations (default: 16).
 *                          - `stopOnError`: Boolean, whether to stop on the first error (default: false).
 *                          - `errs`: String, path to a file to write errors, or errors are collected in an array.
 * @param {function} callback The callback function to execute upon completion or error.
 *                            It receives an error object (or array of errors) if any occurred, otherwise `null`.
 */
function ncp ( source, dest, options, callback )
{
    // Initialize the callback variable.
    var cback = callback;

    // Handle optional 'options' parameter: if 'options' is actually the callback.
    if  ( ! callback )
    {
        cback   = options;    // Assign 'options' to 'cback'
        options = {};         // Initialize 'options' as an empty object for default settings.
    }


    /*
     * Initialize various variables for the copy operation.
     * These include base paths, specific filters/transformers, operational flags, and concurrency counters.
     */
    var basePath      = process.cwd()
      , currentPath   = path.resolve( basePath, source )
      , targetPath    = path.resolve( basePath, dest   )
      , filter        = options.filter
      , rename        = options.rename
      , transform     = options.transform
      , clobber       = options.clobber !== false  // Default to true if not explicitly false.
      , modified      = options.modified
      , dereference   = options.dereference
      , errs          = null                       // Stores errors encountered during the copy, can be stream or array.
      , started       = 0                          // Counter for initiated copy operations.
      , finished      = 0                          // Counter for completed copy operations.
      , running       = 0                          // Counter for currently active copy operations.
      , limit         = options.limit || ncp.limit || 16
      ; // End of variable declarations.


    // Ensure the concurrency limit is within a reasonable range (1 to 512).
    limit = ( limit < 1 ) ? 1 : ( ( limit > 512 ) ? 512 : limit );

    // Begin the recursive copy process from the initial source path.
    startCopy( currentPath );


    /**
     * Initiates the copying process for a given source item.
     * Applies filters if provided before proceeding to get file/directory statistics.
     *
     * @param {string} source The path of the item to start copying.
     */
    function startCopy ( source )
    {
        started++; // Increment the count of items for which copying has been started.

        // Check if a filter function or regular expression is provided and apply it.
        if ( filter )
        {
            // If the filter is a regular expression, test the source path against it.
            if ( filter instanceof RegExp )
            {
                if ( ! filter.test( source ) )
                {
                    return cb( true ); // If filter does not match, skip this item.
                }
            }
            // If the filter is a function, execute it with the source path.
            else if ( typeof filter === 'function' )
            {
                if ( ! filter( source ) )
                {
                    return cb( true ); // If filter function returns false, skip this item.
                }
            }
        }
        // If no filter or filter passes, proceed to get statistics for the source item.
        return getStats( source );
    }


    /**
     * Retrieves file system statistics for a given source path.
     * Manages concurrency using the 'limit' variable to prevent overwhelming the system.
     *
     * @param {string} source The path to get stats for.
     */
    function getStats ( source )
    {
        // Determine whether to use `fs.stat` (dereferencing symlinks) or `fs.lstat` (not dereferencing).
        var stat = dereference ? fs.stat : fs.lstat;

        // Implement concurrency limit. If 'running' tasks exceed 'limit', defer processing using `setImmediate`.
        if ( running >= limit )
        {
            return setImmediate( function ( )
            {
                getStats( source ); // Retry getting stats for this source later.
            } );
        }

        running++; // Increment the count of currently running tasks.

        // Get file system statistics for the source path.
        stat( source, function ( err, stats )
        {
            var item = {}; // Object to hold extracted item details.

            if ( err )
            {
                return onError( err ); // Handle any errors that occur during stat retrieval.
            }

            // Populate item details from the `stats` object.
            item.name  = source;         // Original source path.
            item.mode  = stats.mode;     // File permissions and type.
            item.mtime = stats.mtime;    // Modified time of the file/directory.
            item.atime = stats.atime;    // Access time of the file/directory.

            // Determine the type of file system entry and call the appropriate handler function.
            if ( stats.isDirectory() )
            {
                return onDir( item ); // Handle directory item.
            }
            else if ( stats.isFile() )
            {
                return onFile( item ); // Handle regular file item.
            }
            else if ( stats.isSymbolicLink() )
            {
                // For symbolic links, the mode might not be as relevant for the link itself, but its target.
                return onLink( source ); // Handle symbolic link item.
            }
        } );
    }


    /**
     * Handles the copying of a file.
     * Checks if the target is writable, or if clobbering/modification options are enabled.
     *
     * @param {object} file The file item object containing `name`, `mode`, `mtime`, `atime`.
     */
    function onFile ( file )
    {
        // Construct the target path by replacing the current source base with the target base path.
        var target = file.name.replace( currentPath, targetPath );

        // Apply a custom rename function if it's provided in options.
        if ( rename )
        {
            target = rename( target );
        }

        // Check if the target path is writable (i.e., it doesn't exist, allowing creation).
        isWritable( target, function ( writable )
        {
            if ( writable )
            {
                return copyFile( file, target ); // If writable, proceed to copy the file.
            }

            // If the target is not writable (it exists) and clobbering is enabled.
            if ( clobber )
            {
                rmFile( target, function ( )
                {
                    copyFile( file, target ); // Remove the existing file, then copy the new one.
                } );
            }
            // If not writable, not clobbering, but the 'modified' option is enabled.
            else if ( modified )
            {
                var statFn = dereference ? fs.stat : fs.lstat; // Choose stat function based on dereference option.
                statFn( target, function ( err, stats )
                {
                    // If the source file's modified time is newer than the target's, copy it.
                    if ( file.mtime.getTime() > stats.mtime.getTime() )
                    {
                        copyFile( file, target );
                    }
                    else
                    {
                        return cb(); // Otherwise, skip copying and call the main callback.
                    }
                } );
            }
            else
            {
                return cb(); // If none of the above conditions met, just skip and call the main callback.
            }
        } );
    }


    /**
     * Performs the actual file copying using Node.js streams.
     * This method also handles optional transformation of the stream content
     * and updates the modification times of the destination file if specified.
     *
     * @param {object} file   The file item object (source).
     * @param {string} target The destination path for the file.
     */
    function copyFile ( file, target )
    {
        // Create a readable stream from the source file and a writable stream to the target file.
        var readStream  = fs.createReadStream( file.name )
          , writeStream = fs.createWriteStream( target, { mode: file.mode } )
          ;

        // Attach error handlers to both the read and write streams to catch potential issues.
        readStream.on( 'error', onError );
        writeStream.on( 'error', onError );

        // If a transform function is provided in options, apply it to the streams.
        if ( transform )
        {
            transform( readStream, writeStream, file );
        }
        // Otherwise, pipe the read stream directly to the write stream.
        else
        {
            writeStream.on( 'open', function ( )
            {
                readStream.pipe( writeStream );
            } );
        }

        // Once the write stream has finished writing all data.
        writeStream.once( 'finish', function ( )
        {
            if ( modified )
            {
                // Synchronize the target file's access and modification times with the source file.
                fs.utimesSync( target, file.atime, file.mtime );
                cb(); // Call the main callback to signal completion for this file.
            }
            else
            {
                cb(); // Call the main callback if no time synchronization is needed.
            }
        } );
    }


    /**
     * Removes a file from the file system.
     * This is typically used when the `clobber` option is enabled.
     *
     * @param {string} file The path of the file to remove.
     * @param {function} done The callback to execute after removal, or if an error occurs.
     */
    function rmFile ( file, done )
    {
        fs.unlink( file, function ( err )
        {
            if ( err )
            {
                return onError( err ); // Report error if `fs.unlink` fails.
            }
            return done(); // Call the `done` callback on successful removal.
        } );
    }


    /**
     * Handles the copying of a directory.
     * It determines if a new directory needs to be created or if its contents should simply be copied.
     *
     * @param {object} dir The directory item object containing `name`, `mode`, etc.
     */
    function onDir ( dir )
    {
        // Determine the target path for the directory by replacing the source base with the target base.
        var target = dir.name.replace( currentPath, targetPath );

        // Check if the target directory path is writable (i.e., it doesn't exist).
        isWritable( target, function ( writable )
        {
            if ( writable )
            {
                return mkDir( dir, target ); // If writable, create the new directory.
            }
            copyDir( dir.name ); // If not writable (directory already exists), just proceed to copy its contents.
        } );
    }


    /**
     * Creates a new directory at the specified target path with the given mode.
     *
     * @param {object} dir    The source directory item object.
     * @param {string} target The target path for the new directory.
     */
    function mkDir ( dir, target )
    {
        fs.mkdir( target, dir.mode, function ( err )
        {
            if ( err )
            {
                return onError( err ); // Handle errors during directory creation.
            }
            copyDir( dir.name ); // Upon successful creation, proceed to copy the contents of the source directory.
        } );
    }


    /**
     * Reads the contents of a source directory and initiates copying for each item found within it.
     *
     * @param {string} dir The path of the directory whose contents are to be copied.
     */
    function copyDir ( dir )
    {
        fs.readdir( dir, function ( err, items )
        {
            if ( err )
            {
                return onError( err ); // Handle errors that occur during directory reading.
            }

            // For each item (file or subdirectory) found in the directory, start a new copy operation.
            items.forEach( function ( item )
            {
                startCopy( path.join( dir, item ) );
            } );
            return cb(); // Signal completion for this directory's processing (all its immediate children initiated).
        } );
    }


    /**
     * Handles symbolic links. Reads the link's target and then proceeds to check and potentially create it.
     *
     * @param {string} link The path of the symbolic link to process.
     */
    function onLink ( link )
    {
        var target = link.replace( currentPath, targetPath ); // Determine the target path for the new link.

        fs.readlink( link, function ( err, resolvedPath )
        {
            if ( err )
            {
                return onError( err ); // Handle errors that occur while reading the source link.
            }
            checkLink( resolvedPath, target ); // Proceed to check and create the symbolic link at the target.
        } );
    }


    /**
     * Checks if a symbolic link needs to be created or updated at the target destination.
     * It compares the resolved path of the source link with an existing target link.
     *
     * @param {string} resolvedPath The path the source link points to.
     * @param {string} target       The destination path where the symbolic link should exist.
     */
    function checkLink ( resolvedPath, target )
    {
        // If dereferencing is enabled, resolve the path relative to the base directory.
        if ( dereference )
        {
            resolvedPath = path.resolve( basePath, resolvedPath );
        }

        isWritable( target, function ( writable )
        {
            if ( writable )
            {
                return makeLink( resolvedPath, target ); // If target doesn't exist, create the link.
            }

            // If the target exists, read its symbolic link target to compare.
            fs.readlink( target, function ( err, targetDest )
            {
                if ( err )
                {
                    return onError( err ); // Handle errors reading the existing target link.
                }

                // If dereferencing is enabled, resolve the target's destination path for comparison.
                if ( dereference )
                {
                    targetDest = path.resolve( basePath, targetDest );
                }

                // If the existing target link already points to the same place as the source, no action needed.
                if ( targetDest === resolvedPath )
                {
                    return cb();
                }

                // Otherwise (link exists but points elsewhere), remove the old link and create the new one.
                return rmFile( target, function ( )
                {
                    makeLink( resolvedPath, target );
                } );
            } );
        } );
    }


    /**
     * Creates a symbolic link in the file system.
     *
     * @param {string} linkPath The path that the new symbolic link will point to.
     * @param {string} target   The path where the new symbolic link will be created.
     */
    function makeLink ( linkPath, target )
    {
        fs.symlink( linkPath, target, function ( err )
        {
            if ( err )
            {
                return onError( err ); // Handle errors that occur during symbolic link creation.
            }
            return cb(); // Signal completion after successful link creation.
        } );
    }


    /**
     * Checks if a given path is "writable" in the context of `ncp`,
     * which means determining if a new file or directory can be created at that path.
     * This is typically true if the path does not currently exist.
     *
     * @param {string} path The file system path to check for writability.
     * @param {function(boolean)} done Callback function that receives `true` if writable, `false` otherwise.
     */
    function isWritable ( path, done )
    {
        fs.lstat( path, function ( err )
        {
            // If an error occurs, and it's 'ENOENT' (Entry Not Found), then the path is writable (can create there).
            if ( err )
            {
                if ( err.code === 'ENOENT' ) return done( true );
                return done( false ); // Any other error means the path is not writable or inaccessible.
            }
            return done( false ); // If no error, the path exists, so it's not "writable" for creation purposes.
        } );
    }


    /**
     * Handles errors encountered during the copy process.
     * Depending on `options.stopOnError`, it either immediately stops the operation
     * or collects the errors for a final report.
     *
     * @param {Error} err The error object that occurred.
     */
    function onError ( err )
    {
        // If the 'stopOnError' option is true, immediately stop and invoke the main callback with the error.
        if ( options.stopOnError )
        {
            return cback( err );
        }
        // If an 'errs' file path is specified and the error stream hasn't been created yet.
        else if ( ! errs && options.errs )
        {
            errs = fs.createWriteStream( options.errs ); // Create a write stream to the specified error file.
        }
        // If no 'errs' file path is specified and `errs` is not yet initialized, initialize it as an array.
        else if ( ! errs )
        {
            errs = [ ];
        }

        // Write the error to the stream or push it to the array, depending on `errs` type.
        if ( typeof errs.write === 'undefined' )
        {
            errs.push( err ); // If `errs` is an array, push the error object.
        }
        else
        {
            errs.write( err.stack + '\n\n' ); // If `errs` is a stream, write the error stack.
        }
        return cb(); // Continue with the next task, as this error is being collected/logged.
    }


    /**
     * The main callback function for each completed or skipped item.
     * It manages the count of finished tasks and triggers the final `ncp` callback
     * when all operations have been completed.
     *
     * @param {boolean} skipped Optional. True if the item was skipped, false otherwise.
     */
    function cb ( skipped )
    {
        if ( ! skipped )
        {
            running--; // Decrement the count of running tasks only if the item was not skipped.
        }
        finished++; // Increment the count of finished tasks.

        // Check if all started tasks have finished and no tasks are currently running.
        if ( ( started === finished ) && ( running === 0 ) )
        {
            // If a final callback was provided when `ncp` was initially called, invoke it.
            if ( cback !== undefined )
            {
                // Pass collected errors (if any) or `null` to the final callback.
                return errs ? cback( errs ) : cback( null );
            }
        }
    }

}