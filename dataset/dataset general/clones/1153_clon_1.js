/*
 * This file defines the Git utility class
 * for interacting with Git repositories.
 */


    var     exec = require('child_process').exec; // External dependency for executing shell commands.
    var     fs   =   require('fs');                 // Node.js file system module.
    var     temp = require('temp');               /* Temporary file creation utility. */
    var _    = require('underscore')._;         // Underscore.js utility library, specifically the '_' object.


/**
 * @class Git
 * @constructor
 * @param {object} conf Configuration object for Git operations.
 */
var Git = exports.Git = function(  conf  )
{
    // Returns the configured tag pattern.
    this.tagPattern = function( )
    {
        return conf.TagPattern;
    };
    // Returns whether tags should be signed.
    this.signTag = function(  )
    {
        return conf.SignTag;
    };
    // Returns the remote to push to.
    this.pushTo = function()
    {
        return conf.PushTo;
    };
};

// Define prototype methods for the Git class.
Git.prototype =
{

    /*
     * Commits changes to the Git repository.
     * @param {string} msg Commit message.
     * @param {function} cb Callback function (err).
     */
    commit : function( msg, cb )
    {
        var that = this; // Store context for nested callbacks.

        /* Command to list untracked or modified files that are not ignored. */
        var cmd = 'git ls-files -z --others --exclude-per-directory=.gitignore --exclude-from=.git/info/exclude';

        exec( cmd, function(err, stdout)
        {
            if ( err )
            {
                return cb( err ); // Propagate error if command fails.
            }


            if ( stdout.length > 0 )
            {
                // If there are untracked files, return an error.
                return cb( new Error("Unknown local files:\n" + stdout + "\nUpdate .gitignore, or git add them") );
            }
            else
            {
                // Create a temporary file for the commit message.
                temp.open( 'tmpcomment', function( err, info )
                {
                    if (err)
                    {
                        return cb(err); // Handle temp file opening error.
                    }

                    fs.write( info.fd, msg ); // Write the commit message to the temp file.

                    fs.close( info.fd, function( err )
                    {
                        if (err)
                        {
                            return cb(err); // Handle temp file closing error.
                        }

                        // Execute the git commit command using the temporary message file.
                        exec( "git commit -a -F " + info.path, function( err )
                        {
                            if (err)
                            {
                                return cb(err); // Handle commit error.
                            }

                            // If a push target is configured, push the changes.
                            if ( that.pushTo() )
                            {
                                that.getBranch( function( err, branch )
                                {
                                    if (err)
                                    {
                                        return cb(err); // Handle branch retrieval error.
                                    }

                                    // Construct the push command.
                                    var cmd = 'git push ' + that.pushTo() + ' ' + branch;
                                    exec( cmd, function( err )
                                    {
                                        return cb(err); // Complete with push error or null.
                                    });
                                });
                            }
                            else
                            {
                                return cb(null); // No push target, so just complete.
                            }
                        });
                    });
                });
            }
        });
    },

    /**
     * Resets the most recent commit.
     * @param {function} cb Callback function (err).
     */
    resetRecentCommit : function( cb )
    {
        if ( !this.pushTo() )
        {
            // Only allow soft reset if no push target is configured.
            exec( 'git reset --soft HEAD^', function( err )
            {
                cb( err );
            });
        }
        else
        {
            // Warn if trying to reset an already pushed commit.
            console.warn( '[WARN] Can not reset already pushed commit' );
            cb( null );
        }
    },

    /**
     * Tags the current version in Git.
     * @param {string} ver Version string.
     * @param {string} msg Optional tag message.
     * @param {function} cb Callback function (err).
     */
    tagVersion : function( ver, msg, cb )
    {
        var that = this; // Keep context.
        if ( !msg )
        {
            msg = "Tagging version " + ver + ".\n"; // Default tag message.
        }

        temp.open( 'tmptag', function( err, info )
        {
            if (err)
            {
                return cb(err); // Error opening temp file for tag message.
            }

            fs.write( info.fd, msg ); // Write tag message.
            fs.close( info.fd ); // Close the temp file.

            var tag = that.tagPattern() || ''; // Get tag pattern from configuration.
            if ( !tag.match(/\%v/i) )
            {
                tag += '%v'; // Ensure pattern includes version placeholder.
            }
            tag = tag.replace( /\%v/, ver ); // Replace placeholder with actual version.
            tag = tag.replace( /\s/, "" ); // Remove any whitespace from the tag.

            var cmd = 'git tag -a'; // Base command for annotated tag.
            if ( that.signTag() )
            {
                cmd += ' -s '; // Add signing option if configured.
            }
            cmd += ' -F' + info.path + ' ' + tag; // Add message file and tag name.

            exec( cmd, function( err )
            {
                cb( err ); // Execute tag command and return result.
            });
        });
    },

    /**
     * Deletes a specific Git tag.
     * @param {string} ver Version of the tag to delete.
     * @param {function} cb Callback function (err).
     */
    deleteTag : function( ver, cb )
    {
        var tag = this.tagPattern() || ''; // Retrieve tag pattern.
        if ( !tag.match(/\%v/i) )
        {
            tag += '%v'; // Append version placeholder if missing.
        }
        tag = tag.replace( /\%v/, ver ); // Substitute version.

        var cmd = 'git tag -d ' + tag; // Command to delete the tag.
        exec( cmd, function( err )
        {
            cb( err ); // Execute and callback.
        });
    },

    /**
     * Generates a local diff for a given file.
     * @param {string} file The file to diff.
     * @param {string} diffTarget The target to diff against (e.g., HEAD).
     * @param {function} cb Callback function (err, stdout).
     */
    localDiff : function( file, diffTarget, cb )
    {
        var cmd = 'git diff --no-color ' + diffTarget + ' ' + file; // Construct diff command.
        exec( cmd, function( err, stdout )
        {
            if (err)
            {
                return cb(err); // Handle command execution error.
            }
            return cb( null, stdout ); // Return stdout if successful.
        });
    },

    /**
     * Retrieves the current Git branch name.
     * @param {function} cb Callback function (err, branchName).
     */
    getBranch : function( cb )
    {
        fs.readFile( '.git/HEAD', 'utf8', function( err, data )
        {
            if (err)
            {
                return cb(err); // Handle file read error.
            }
            // Parse branch name from the HEAD file content.
            var head = data.match( /ref: refs\/heads\/(\S+)/ );
            cb( null, head[1] ); // Return the branch name.
        });
    },

    /**
     * Checks if a specific version tag exists.
     * @param {string} ver The version string to check for.
     * @param {function} cb Callback function (err, tagName|null).
     */
    existsTaggedVersion : function( ver, cb )
    {
        exec( 'git tag -l ' + ver, function( err, stdout )
        {
            if (err)
            {
                return cb(err); // Handle command error.
            }
            var tag = stdout.replace( /\s+$/, '' ); // Remove trailing whitespace.
            if ( tag.length === 0 )
            {
                tag = null; // If no tag found, set to null.
            }
            cb( null, tag ); // Return the tag name or null.
        });
    },

    /**
     * Checks if there are local differences compared to a given version.
     * @param {string} ver The version to compare against.
     * @param {function} cb Callback function (err, hasDiffs).
     */
    areLocalDiffs : function( ver, cb )
    {
        exec( 'git diff --no-color ' + ver, function( err, stdout )
        {
            if (err)
            {
                return cb(err); // Handle command error.
            }
            var res = stdout.match( /\S/ ) ? true : false; // Check for any non-whitespace character in diff output.
            cb( null, res ); // Return true if diffs exist, false otherwise.
        });
    }
};