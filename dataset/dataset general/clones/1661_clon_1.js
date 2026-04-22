module.exports = function ( grunt )
{
    // Regular expression for capturing base URLs within CSS url() properties
    var BASE_URL_REGEX = 'url\\(["\']?([^"\'\\(\\)]+?)["\']?\\)[};,\\s]';

    /*
     * Regular expression to match URLs that should be exclusively embedded.
     * It excludes URLs followed by a 'noembed' comment.
     */
    var EXCLUSIVE_URL_REGEX = BASE_URL_REGEX + '(?!\\s*?\\/\\*\\s*?noembed\\s*?\\*\\/)';

    // Regular expression to match URLs that are explicitly marked for embedding with an 'embed' comment.
    var INCLUSIVE_URL_REGEX = BASE_URL_REGEX + '\\s*?\\/\\*\\s*?embed\\s*?\\*\\/';

    // Regular expression to identify data URIs (which should not be re-embedded).
    var EMBEDDABLE_URL_REGEX = /^data:/;

    // Regular expression to identify remote HTTP/HTTPS URLs.
    var REMOTE_URL_REGEX = /^(http|https):/;


    // Core Node.js modules for file system and path manipulation.
    var fs = require('fs');
    var path = require('path');

    // Third-party libraries used for various utilities.
    var units = require('node-units');
    var request = require('request');
    var mime = require('mime');


    // Variable to hold the mmmagic instance, if available.
    var mmmagicMimeType;


    // Attempt to load 'mmmagic' for more accurate MIME type detection.
    // If 'mmmagic' is not available, gracefully degrade.
    try {
        var mmmagic = require('mmmagic');
        mmmagicMimeType = new mmmagic.Magic(mmmagic.MAGIC_MIME_TYPE);
    }
    catch ( e ) {
        // If mmmagic fails to load, the variable remains undefined,
        // and a fallback will be used. No action needed here.
    }


    /**
     * Checks if a given size exceeds the configured skip threshold.
     * @param {number} size - The size in bytes.
     * @param {object} options - Task options, including 'skipUrlsLargerThan'.
     * @returns {boolean} - True if the size is too big, false otherwise.
     */
    function isTooBig( size, options )
    {
        // Convert the 'skipUrlsLargerThan' option to bytes for comparison.
        return options.skipUrlsLargerThan && size > units.convert( options.skipUrlsLargerThan + ' to B' );
    }


    /**
     * Embeds the content of a URL as a base64 Data URI into the file content.
     * Then, it proceeds to the next URL in the processing queue.
     *
     * @param {string} url - The original URL string.
     * @param {Buffer} urlContentInBuffer - The content of the URL as a Buffer.
     * @param {string} mimeType - The detected MIME type of the content.
     * @param {object} fileContent - An object holding the file's content (e.g., { content: '...' }).
     * @param {function} nextUrl - Callback to process the next URL.
     */
    function embedUrlAndGoToNext( url, urlContentInBuffer, mimeType, fileContent, nextUrl )
    {
        // Convert the buffer content to a base64 string.
        var base64Content = urlContentInBuffer.toString('base64');

        // Construct the Data URI string.
        var dataUri = '("data:' + mimeType + ';base64,' + base64Content + '")';

        // Escape special characters in the URL for use in a regular expression.
        var escapedUrl = url.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');

        // Create a regex to find and replace the original URL in the CSS.
        var embedUrlRegex = '\\([\'"]?' + escapedUrl + '[\'"]?\\)';

        // Perform the replacement in the file content.
        fileContent.content = fileContent.content.replace( new RegExp(embedUrlRegex, 'g'), dataUri );

        // Log successful embedding.
        grunt.log.ok( '"' + url + '" embedded' );

        // Move to the next URL.
        nextUrl();
    }


    /**
     * Resolves the MIME type of the URL content and then embeds it.
     *
     * @param {string} url - The original URL string.
     * @param {Buffer|string} urlContent - The content of the URL (Buffer for binary, string for text).
     * @param {object} fileContent - An object holding the file's content (e.g., { content: '...' }).
     * @param {function} nextUrl - Callback to process the next URL.
     */
    function resolveMimeTypeEmbedUrlAndGoToNext( url, urlContent, fileContent, nextUrl )
    {
        // Ensure content is a Buffer for MIME type detection.
        var urlContentInBuffer = new Buffer( urlContent );

        // If mmmagic is available, use it for more accurate MIME type detection.
        if ( mmmagicMimeType )
        {
            mmmagicMimeType.detect( urlContentInBuffer, function ( error, mimeType ) {
                if ( error )
                {
                    // Fallback MIME type if detection fails.
                    mimeType = 'application/octet-stream';
                    grunt.log.warn( 'Failed to get MIME-type of "' + url + '". Defaulting to "' + mimeType + '".' );
                }

                // Proceed to embed the URL.
                embedUrlAndGoToNext( url, urlContentInBuffer, mimeType, fileContent, nextUrl );
            });
        }
        else
        {
            // If mmmagic is not available, use the 'mime' library as a fallback.
            embedUrlAndGoToNext( url, urlContentInBuffer, mime.lookup( url ), fileContent, nextUrl );
        }
    }


    /**
     * Advances to the next URL in the array or finishes processing if all URLs are done.
     *
     * @param {object} fileContent - Object containing the file's content.
     * @param {number} currentUrlIndex - Current index of the URL being processed.
     * @param {Array<string>} urlArray - Array of URLs to process.
     * @param {object} options - Task options.
     * @param {string} baseDir - Base directory for resolving local URLs.
     * @param {boolean} isVerbose - Flag indicating verbose logging.
     * @param {function} finishCallback - Callback to execute when all URLs are processed.
     */
    function processNextUrl( fileContent, currentUrlIndex, urlArray, options, baseDir, isVerbose, finishCallback )
    {
        // Increment the index and check if all URLs have been processed.
        if ( ++currentUrlIndex === urlArray.length )
        {
            finishCallback(); // All URLs processed, trigger finish callback.
        }
        else
        {
            // Process the next URL in the array.
            processUrl( fileContent, currentUrlIndex, urlArray, options, baseDir, isVerbose, finishCallback );
        }
    }


    /**
     * Processes a single URL: fetches its content (local or remote), checks size,
     * resolves MIME type, and embeds it into the file content.
     *
     * @param {object} fileContent - Object containing the file's content.
     * @param {number} currentUrlIndex - Current index of the URL being processed.
     * @param {Array<string>} urlArray - Array of URLs to process.
     * @param {object} options - Task options.
     * @param {string} baseDir - Base directory for resolving local URLs.
     * @param {boolean} isVerbose - Flag indicating verbose logging.
     * @param {function} finishCallback - Callback to execute when all URLs are processed.
     */
    function processUrl( fileContent, currentUrlIndex, urlArray, options, baseDir, isVerbose, finishCallback )
    {
        var url = urlArray[ currentUrlIndex ];
        var nextUrl = processNextUrl.bind( null, fileContent, currentUrlIndex, urlArray, options, baseDir, isVerbose, finishCallback );

        try {
            if ( isVerbose )
            {
                grunt.log.writeln( '\n[ #' + ( currentUrlIndex + 1 ) + ' ]' );
            }

            // Check if the URL is a remote HTTP/HTTPS URL.
            if ( REMOTE_URL_REGEX.test( url ) )
            {
                // Make an HTTP request to fetch the remote content.
                request( { url: url, encoding: null }, function ( error, response, body ) {
                    if ( error || response.statusCode !== 200 )
                    {
                        var failedUrlMessage = '"' + url + '" request failed';

                        if ( options.failOnMissingUrl )
                        {
                            grunt.fail.warn( failedUrlMessage + '\n' );
                        }

                        if ( error )
                        {
                            grunt.log.error( error );
                        }

                        grunt.log.warn( failedUrlMessage );

                        return nextUrl(); // Proceed to the next URL despite failure.
                    }

                    // Check if the fetched content is too large.
                    if ( isTooBig( body.length, options ) )
                    {
                        grunt.log.warn( '"' + url + '" is too big' );

                        return nextUrl(); // Skip embedding and proceed.
                    }

                    // Resolve MIME type and embed the content.
                    resolveMimeTypeEmbedUrlAndGoToNext( url, body, fileContent, nextUrl );
                });
            }
            else // Assume it's a local file path.
            {
                var noArgumentUrl = url;

                // Remove query parameters from local URLs for path resolution.
                if ( url.indexOf('?') >= 0 )
                {
                    noArgumentUrl = url.split('?')[0];

                    if ( isVerbose )
                    {
                        grunt.log.writeln( '"' + url + '" trimmed to "' + noArgumentUrl + '"' );
                    }
                }

                // Resolve the full path of the local file.
                var urlFullPath = path.resolve( baseDir + '/' + noArgumentUrl );

                if ( isVerbose )
                {
                    grunt.log.writeln( '"' + url + '" resolved to "' + urlFullPath + '"' );
                }

                // Check if the local file exists.
                if ( !grunt.file.exists( urlFullPath ) )
                {
                    var missingUrlMessage = '"' + ( isVerbose ? urlFullPath : url ) + '" not found on disk';

                    if ( options.failOnMissingUrl )
                    {
                        grunt.fail.warn( missingUrlMessage + '\n' );
                    }

                    grunt.log.warn( missingUrlMessage );

                    return nextUrl(); // Skip and proceed.
                }

                // Get the size of the local file.
                var urlFileSize = fs.statSync( urlFullPath )['size'];

                // Check if the local file is too large.
                if ( isTooBig( urlFileSize, options ) )
                {
                    grunt.log.warn( '"' + ( isVerbose ? urlFullPath : url ) + '" is too big' );

                    return nextUrl(); // Skip and proceed.
                }

                // Read the content of the local file.
                var urlContent = fs.readFileSync( urlFullPath );

                // Resolve MIME type and embed the content.
                resolveMimeTypeEmbedUrlAndGoToNext( url, urlContent, fileContent, nextUrl );
            }
        }
        catch ( e )
        {
            grunt.log.error( e );
            grunt.fail.warn( 'Failed to embed "' + url + '"\n' );
        }
    }


    /**
     * Processes a single source file, extracts URLs, and initiates embedding.
     *
     * @param {string} fileSrc - The source file path.
     * @param {string} fileDest - The destination file path.
     * @param {object} options - Task options.
     * @param {function} callback - Callback to execute when file processing is complete.
     */
    function processFile( fileSrc, fileDest, options, callback )
    {
        try {
            grunt.log.subhead( 'Processing source file "' + fileSrc + '"' );

            var fileContent = grunt.file.read( fileSrc );
            var isVerbose = grunt.option('verbose');

            // Determine the base directory for resolving relative URLs.
            var baseDir = path.resolve( options.baseDir ? options.baseDir : path.dirname( fileSrc ) );

            // Select the appropriate URL regex based on 'inclusive' option.
            var urlRegex = new RegExp( options.inclusive ? INCLUSIVE_URL_REGEX : EXCLUSIVE_URL_REGEX, 'g' );
            var allUrls = [];
            var urlMatch;

            // Find all potential URLs in the file content.
            while ( ( urlMatch = urlRegex.exec( fileContent ) ) )
            {
                allUrls.push( urlMatch[1] );
            }

            // Filter out any URLs that are already data URIs.
            var embeddableUrls = allUrls.filter( function( url ) {
                return !url.match( EMBEDDABLE_URL_REGEX );
            });

            // If no embeddable URLs are found, simply write the original file content.
            if ( embeddableUrls.length === 0 )
            {
                grunt.file.write( fileDest, fileContent );
                grunt.log.writeln('Nothing to embed here!');
                grunt.log.writeln('File "' + fileDest + '" created');
                return callback();
            }

            if ( isVerbose )
            {
                grunt.log.writeln( 'Using "' + baseDir + '" as base directory for URLs' );
            }

            // Get unique URLs to avoid processing the same URL multiple times.
            var uniqueEmbeddableUrls = grunt.util._.uniq( embeddableUrls );

            grunt.log.writeln( uniqueEmbeddableUrls.length + ' embeddable URL' + ( uniqueEmbeddableUrls.length > 1 ? 's' : '' ) + ' found' );

            // Create a reference object for fileContent so it can be modified by nested functions.
            var fileContentRef = { content: fileContent };

            // Start processing the unique URLs one by one.
            processUrl( fileContentRef, 0, uniqueEmbeddableUrls, options, baseDir, isVerbose, function () {
                // Once all URLs are processed, write the modified content to the destination file.
                grunt.file.write( fileDest, fileContentRef.content );
                grunt.log.writeln( 'File "' + fileDest + '" created' );
                callback(); // Signal completion for this file.
            });
        }
        catch ( e )
        {
            grunt.log.error( e );
            grunt.fail.warn( 'URL embedding failed\n' );
        }
    }


    // Register the Grunt multi-task 'cssUrlEmbed'.
    grunt.registerMultiTask( 'cssUrlEmbed', "Embed URLs as base64 strings inside your stylesheets", function () {
        // Inform Grunt that this is an asynchronous task.
        var async = this.async();

        // Merge task-specific and/or target-specific options with default values.
        var options = this.options( {
            failOnMissingUrl: true, // Default: fail if a URL cannot be found/fetched.
            inclusive: false        // Default: use exclusive URL matching (ignore 'noembed').
        });

        // Filter out files that do not exist to prevent errors.
        var existingFiles = this.files.filter( function ( file ) {
            if ( !grunt.file.exists( file.src[0] ) )
            {
                grunt.log.warn( 'Source file "' + file.src[0] + '" not found.' );
                return false; // Exclude this file from processing.
            }

            return true; // Include this file.
        });

        // Keep track of how many files are left to process.
        var leftToProcess = existingFiles.length;

        // If no existing files, complete the async task immediately.
        if (leftToProcess === 0) {
            grunt.log.writeln('No source files found to process.');
            return async();
        }

        // Iterate over each file group and process them.
        existingFiles.forEach( function ( file ) {
            processFile( file.src[0], file.dest, options, function () {
                // Decrement the counter and call the async callback when all files are done.
                if ( --leftToProcess === 0 )
                {
                    async(); // Mark the Grunt task as complete.
                }
            });
        });
    });
};