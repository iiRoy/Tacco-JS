/*
 *  CloudFront API Wrapper for Browser-based Access
 *  Original Author: Sajal Kayan
 *  Contact: http://www.cdnplanet.com/
 *  License: BSD-style (Unconfirmed)
 *
 *  Description:
 *    This module provides a JavaScript interface to the AWS CloudFront API.
 *    It relies on cross-domain XMLHttpRequest (CORS) capabilities,
 *    making it suitable for environments like Chrome Extensions,
 *    but generally not for standard web pages due to browser security restrictions.
 *
 *  Usage Example (Illustrative):
 *    // Initialize the API client with your AWS credentials
 *    var myCloudFrontClient = new cloudfrontapi( "YOUR_AWS_ACCESS_KEY_ID", "YOUR_AWS_SECRET_ACCESS_KEY" );
 *
 *    // Optionally, disable system time usage if local clock is unreliable
 *    // myCloudFrontClient.usesystemtime = false;
 *
 *    // Define a simple callback for logging results
 *    var logResult = function( dataObject ){
 *      console.log( "API Response:", dataObject );
 *    };
 *
 *    // Fetch all CloudFront distributions
 *    // myCloudFrontClient.getAllDistributions( logResult );
 *
 *    // Fetch invalidations for a specific distribution ID
 *    // myCloudFrontClient.getAllInvalidations( "DISTRIBUTION_ID_XYZ", logResult );
 *
 *    // Get only pending invalidations for a distribution
 *    // myCloudFrontClient.getPendingInvalidations( "DISTRIBUTION_ID_XYZ", logResult );
 *
 *  External Dependencies:
 *    - XML to JSON Converter: http://davidwalsh.name/convert-xml-json (xmlToJson function)
 *    - SHA1 Hashing Library: http://www.java2s.com/Open-Source/Javascript/Benchmark/sunspider-mod/tests/sunspider-0.9.1/crypto-sha1.js.htm (Crypto object)
 *
 */

var cloudfrontapi = function( aws_access , aws_secret )
{
    // Store AWS access key and secret key for signing requests
    this.aws_access    = aws_access;
    this.aws_secret    = aws_secret;

    // Flag to determine whether to use local system time or fetch from AWS
    this.usesystemtime = true;

    // The CloudFront API endpoint
    this.endpoint      = "cloudfront.amazonaws.com";

    // // Placeholder for a temporary date string, currently unused.
    // this.tmpdatestr = ""


    /**
     *  Fetches the current GMT date and time directly from AWS.
     *  This is used when `usesystemtime` is false to ensure time synchronization.
     *  @returns {string} The GMT date string from AWS.
     */
    this.getAWStime = function()
    {
        var req = new XMLHttpRequest();

        // Open a synchronous GET request to the AWS date endpoint
        req.open(
            "GET",
            "https://cloudfront.amazonaws.com/date", // AWS endpoint for fetching current date
            false                                    // Synchronous request
        );

        req.send( null ); // Send the request without any body

        // Return the 'Date' header from the response
        return req.getResponseHeader( "Date" );
    };


    /**
     *  Determines and returns the GMT date string to be used in API requests.
     *  It either uses the client's system time or fetches it from AWS.
     *  @returns {string} The formatted GMT date string.
     */
    this.getDate = function()
    {
        // Check if system time is deemed reliable for signing requests
        if ( this.usesystemtime )
        {
            return ( new Date() ).toGMTString(); // Use local system time
        }
        else
        {
            // If system time is not trusted, retrieve the official time from AWS
            return this.getAWStime();
        }
    };


    /**
     *  Generates the AWS authorization header components required for API calls.
     *  This includes the date string and the calculated signature.
     *  @returns {object} An object containing `datestr` and `authorization` string.
     */
    this.getAuth = function()
    {
        var datestr = this.getDate(); // Get the date string for the signature

        // Calculate the HMAC-SHA1 signature using the secret key and date string
        // The result is then base64 encoded.
        var signature = Crypto.util.bytesToBase64(
            Crypto.HMAC( Crypto.SHA1, datestr, this.aws_secret, { asBytes: true } )
        );

        // Construct the full Authorization header value
        var authorization = "AWS " + this.aws_access + ":" + signature;

        // Return both the date string and the authorization header
        return { datestr: datestr, authorization: authorization };
    };


    /**
     *  Makes an XMLHttpRequest to the CloudFront API endpoint.
     *  Handles authorization, content type, and basic error parsing.
     *  @param {string}   path     The API path (e.g., "/2010-11-01/distribution").
     *  @param {function} callback A callback function to handle the successful response or error.
     *  @param {string}   [data]   Optional XML body for POST requests (e.g., for invalidations).
     */
    this.makeRequest = function( path, callback, data )
    {
        var req    = new XMLHttpRequest();
        var auth   = this.getAuth(); // Get authorization details
        var method = "POST";         // Default method is POST

        // If no data is provided, assume a GET request
        if ( data == undefined )
        {
            method = "GET";
            data   = null; // Ensure data is explicitly null for GET requests
        }

        // Open the XMLHttpRequest
        req.open(
            method,                               // HTTP method (GET or POST)
            "https://" + this.endpoint + path,    // Full URL for the API request
            true                                  // Asynchronous request
        );

        // Set required AWS authorization headers
        req.setRequestHeader( "Authorization", auth.authorization );
        req.setRequestHeader( "x-amz-date",    auth.datestr );

        // If it's a POST request, set the Content-Type header
        if ( method == "POST" )
        {
            req.setRequestHeader( "Content-Type", "text/xml" );
        }

        // Define the onload event handler for the request
        req.onload = function()
        {
            console.log( req ); // Log the raw XMLHttpRequest object for debugging

            var error = null;

            // Check for non-success HTTP status codes
            if ( ( req.status != 200 ) && ( req.status != 201 ) )
            {
                // Parse error details from the XML response
                error = {
                    status:  req.status,
                    message: req.responseXML.getElementsByTagName( "Message" )[0].textContent,
                    code:    req.responseXML.getElementsByTagName( "Code" )[0].textContent
                };
            }

            console.log( error ); // Log any error that occurred

            // Invoke the provided callback with the request object and error (if any)
            callback( req, error );
        };

        // Send the request with the specified data (or null for GET)
        req.send( data );
    };


    /**
     *  Helper function to extract text content from a specific XML tag within a node.
     *  @param {Node}   node    The parent XML node.
     *  @param {string} tagname The name of the tag to find.
     *  @returns {string} The text content of the first matching tag.
     */
    this.getfield = function( node, tagname )
    {
        console.log( tagname ); // Log the tag name for debugging
        console.log( node );    // Log the node for debugging

        // Get the text content of the first element with the specified tag name
        return node.getElementsByTagName( tagname )[0].textContent;
    };


    /**
     *  Retrieves a list of all CloudFront distributions associated with the AWS account.
     *  @param {function} callback  Function to call on success with an array of distributions.
     *  @param {function} errorfn   Function to call on error.
     *  @returns {Array<object>} An array of distribution summary objects.
     */
    this.getAllDistributions = function( callback, errorfn )
    {
        /*
         *  Returns an Array containing a List of CloudFront distributions.
         */
        var getfield_ref = this.getfield; // Keep a reference to getfield

        var localcb = function( res, error )
        {
            console.log( error ); // Log any error encountered

            if ( error == null )
            {
                // Convert the XML response to JSON and extract distribution summaries
                var distributions = xmlToJson( res.responseXML ).DistributionList.DistributionSummary;

                // If there's only one distribution, xmlToJson might return an object, not an array.
                // Ensure it's always an array for consistent handling.
                if ( distributions.length == undefined )
                {
                    distributions = [ distributions ];
                }

                // Call the user's success callback
                callback( distributions );
            }
            else
            {
                // Call the user's error callback
                errorfn( error );
            }
        };

        // Make the API request to get all distributions
        this.makeRequest( "/2010-11-01/distribution", function( res, error ) { localcb( res, error ); } );
    };


    /**
     *  Retrieves a list of the most recent 20 invalidation requests for a given distribution.
     *  @param {string}   distid   The ID of the CloudFront distribution.
     *  @param {function} callback Function to call on success with an array of invalidation summaries.
     *  @returns {Array<object>} An array of invalidation summary objects.
     */
    this.getAllInvalidations = function( distid, callback )
    {
        /*
         *  Returns an Array representing a List of the last 20 invalidation requests.
         */
        var getfield_ref = this.getfield; // Reference to the getfield helper

        var localcb = function( res )
        {
            // Convert XML response to JSON and extract invalidation summaries
            var invalidations = xmlToJson( res.responseXML ).InvalidationList.InvalidationSummary;

            // Handle cases where there are no invalidations or only one
            if ( invalidations == undefined )
            {
                callback( [] ); // Return an empty array if no invalidations
            }
            else
            {
                // Ensure invalidations is always an array
                if ( invalidations.length == undefined )
                {
                    invalidations = [ invalidations ];
                }
                callback( invalidations );
            }
        };

        // Construct the API path for invalidations, limiting to 20 items
        var requestPath = "/2010-11-01/distribution/" + distid + "/invalidation?MaxItems=20";
        this.makeRequest( requestPath, localcb );
    };


    /**
     *  Filters the list of invalidations to return only those that are still pending (not 'Completed').
     *  @param {string}   distid   The ID of the CloudFront distribution.
     *  @param {function} callback Function to call on success with an array of pending invalidation summaries.
     *  @returns {Array<object>} An array of pending invalidation summary objects.
     */
    this.getPendingInvalidations = function( distid, callback )
    {
        /*
         *  Returns an Array containing a List of last 20 invalidation requests,
         *  specifically filtering for those that are not yet 'Completed'.
         */
        var localcb = function( allinvalidations )
        {
            var pending = []; // Initialize an array to store pending invalidations

            // Iterate through all fetched invalidations
            for ( var i = 0; i < allinvalidations.length; i++ )
            {
                // Check if the status of the invalidation is not 'Completed'
                if ( allinvalidations[i].Status["#text"] != 'Completed' )
                {
                    pending.push( allinvalidations[i] ); // Add to the pending list
                }
            }
            callback( pending ); // Return the list of pending invalidations
        };

        // First, get all invalidations for the distribution
        this.getAllInvalidations( distid, localcb );
    };


    /**
     *  Submits a new invalidation (purge) request for a comma-separated list of paths.
     *  @param {string}   distid    The ID of the CloudFront distribution.
     *  @param {string}   pathcsv   Comma-separated string of paths to invalidate (e.g., "/image.jpg,/css/*").
     *  @param {function} callback  Function to call on successful submission.
     *  @param {function} errorfn   Function to call if an error occurs.
     */
    this.AddNewPurgeRequest = function( distid, pathcsv, callback, errorfn )
    {
        /*
         *  Initiates a purge request for a list of paths, provided as a comma-separated string.
         */
        var localcb = function( res, error )
        {
            if ( error == null )
            {
                callback( res ); // Call success callback
            }
            else
            {
                errorfn( error ); // Call error callback
            }
        };

        var files     = pathcsv.split( ',' ); // Split the CSV string into an array of paths
        var invallist = "";                   // Initialize XML string for invalidation paths

        // Build the XML <Path> elements for each file
        for ( var i = 0; i < files.length; i++ )
        {
            invallist += '<Path>' + files[i].trim() + '</Path>';
        }

        // Generate a unique CallerReference for the batch request
        var callerref = "batch" + ( new Date() ).getTime();

        // Construct the complete XML body for the invalidation batch
        var requestBody = "<InvalidationBatch>" + invallist + "<CallerReference>" + callerref + "</CallerReference></InvalidationBatch>";

        console.log( requestBody ); // Log the XML body being sent

        // Define the API path for submitting invalidation requests
        var apiPath = "/2010-11-01/distribution/" + distid + "/invalidation";

        // Make the POST request with the XML body
        this.makeRequest( apiPath, localcb, requestBody );
    };


    /**
     *  Retrieves detailed information about a specific invalidation request.
     *  @param {string}   distid   The ID of the CloudFront distribution.
     *  @param {string}   invalid  The ID of the specific invalidation request.
     *  @param {function} callback Function to call on success with the invalidation details (as JSON).
     */
    this.getInvalidationDetails = function( distid, invalid, callback )
    {
        // TODO: Implement more robust error handling and specific data extraction if needed.
        var localcb = function( res )
        {
            // Convert the XML response to JSON and pass to the callback
            callback( xmlToJson( res.responseXML ) );
        };

        // Construct the API path for fetching specific invalidation details
        var apiPath = "/2010-11-01/distribution/" + distid + "/invalidation/" + invalid;

        console.log( apiPath ); // Log the API path for debugging

        // Make the GET request
        this.makeRequest( apiPath, localcb );
    };

}; // End of cloudfrontapi constructor function