/*
 * This is a module for handling Google OAuth2 JWT authentication.
 * It provides functions to authenticate and encode JSON Web Tokens.
 */
var fs = require('fs') // File system module for reading private keys
  , crypto = require('crypto') // Cryptography module for signing JWTs
  , request = require('request') // HTTP client for making requests to Google
  , debug = require('debug')('google-oauth-jwt') // Debugging utility for logging messages
; // End of variable declarations

// Define a constant for the Google OAuth2 token endpoint URL.
var GOOGLE_OAUTH2_URL = 'https://accounts.google.com/o/oauth2/token'
; // Semicolon for consistency, though not strictly needed here

/**
 * Requests an authentication token from the Google OAuth2 service.
 * This is done by submitting a cryptographically signed JSON Web Token (JWT).
 *
 * @param   {Object}    options     The configuration options required for JWT generation and the authentication request.
 * @param   {Function}  callback    The callback function to be invoked once the token is received, or if an error occurs.
 *                                  It follows the standard Node.js callback signature: `function(err, token)`.
 * @returns {void}
 */
exports.authenticate = function ( options , callback ) {

    // Ensure a callback function is always available, even if not provided by the caller.
    callback = callback || function () { /* no-op function */ }
    ;

    // First, encode the JSON Web Token using the provided options.
    exports.encodeJWT( options , function ( err , jwt ) {

        // If there was an error during JWT encoding, immediately return it via the callback.
        if ( err ) {
            return callback( err )
            ;
        }

        // If JWT encoding was successful, proceed to make a POST request to the Google OAuth2 URL.
        // The request body will contain the grant type and the generated JWT assertion.
        return request.post(
            GOOGLE_OAUTH2_URL
            , {
                headers : {
                    'Content-Type' : 'application/x-www-form-urlencoded' // Specify content type for the request body.
                }
                , form : {
                    grant_type : 'urn:ietf:params:oauth:grant-type:jwt-bearer' // OAuth2 grant type for JWT bearer tokens.
                    , assertion : jwt // The signed JWT itself.
                }
            }
            , function ( err , res , body ) {

                // Handle any network-related errors during the HTTP request.
                if ( err ) {
                    return callback( err )
                    ;
                }
                else {
                    // Log the response from the OAuth server for debugging purposes.
                    debug( 'response from OAuth server: HTTP %d -> %j' , res.statusCode , body )
                    ;
                }

                // Check if the HTTP status code indicates a successful response (200 OK).
                if ( res.statusCode != 200 ) {
                    // Construct an error object if the request failed.
                    err = new Error(
                        'failed to obtain an authentication token, request failed with HTTP code '
                        + res.statusCode
                        + ': '
                        + body.error // Assuming 'body.error' contains a descriptive error message from Google.
                    )
                    ;
                    err.statusCode = res.statusCode
                    ; // Attach the HTTP status code to the error.
                    err.body = body
                    ; // Attach the full response body to the error for further inspection.
                    return callback( err )
                    ;
                }

                // Attempt to parse the response body as JSON.
                try {
                    body = JSON.parse( body )
                    ;
                }
                catch ( e ) {
                    // If JSON parsing fails, return an error indicating malformed response.
                    return callback( new Error( 'failed to parse response body: ' + body ) )
                    ;
                }

                // If everything is successful, return the access token from the parsed body.
                return callback( null , body.access_token )
                ;

            }
        )
        ;
    } )
    ;
}
; // End of exports.authenticate function

/**
 * Encodes a JSON Web Token (JWT) based on the provided options.
 * This token is used to authenticate with Google services.
 *
 * The JWT represents an authentication request for a specific service account or delegated user
 * and is signed using a private key to ensure its authenticity and integrity.
 *
 * Detailed explanation of available options:
 *   `options.email`:             The email address associated with the Google service account. This is a mandatory field.
 *   `options.scopes`:            An array of URI strings, each representing a specific API scope for which access is being requested. This is also mandatory.
 *   `options.key` or `options.keyFile`: The private key material itself (as a string) or the path to a file containing the private key. One of these is required for signing.
 *   `options.expiration`:        The desired duration of the requested token's validity, expressed in milliseconds. Defaults to 1 hour (3600000 ms).
 *   `options.delegationEmail`:   (Optional) An email address of a user for whom access is being granted. This is used for domain-wide delegation.
 *
 * @param   {Object}    options     The configuration parameters used to generate the JWT.
 * @param   {Function}  callback    The callback function to be executed with the encoded JWT string, or an error.
 *                                  Signature: `function(err, jwtString)`.
 * @returns {void}
 */
exports.encodeJWT = function ( options , callback ) {

    // --- Input Validation ---
    if ( ! options ) throw new Error( 'options is required' )
    ;
    if ( ! options.email ) throw new Error( 'options.email is required' )
    ;
    if ( ! options.scopes ) throw new Error( 'options.scopes is required' )
    ;
    if ( ! Array.isArray( options.scopes ) ) throw new Error( 'options.scopes must be an array' )
    ;
    if ( options.scopes.length == 0 ) throw new Error( 'options.scopes must contain at least one scope' )
    ;
    if ( ! options.key && ! options.keyFile ) throw new Error( 'options.key or options.keyFile are required' )
    ;

    // Ensure callback is always a function to prevent potential errors.
    callback = callback || function () { /* empty function */ }
    ;

    // Log the options being used for JWT generation for debugging.
    debug( 'generating jwt for %j' , options )
    ;

    // Calculate 'issued at' (iat) and 'expiration' (exp) times for the JWT claims.
    // Times are in seconds since the Unix epoch.
    var iat = Math.floor( new Date().getTime() / 1000 ) // Current time in seconds.
      , exp = iat + Math.floor( ( options.expiration || 60 * 60 * 1000 ) / 1000 ) // Expiration time: iat + duration (default 1 hour).
      , claims = {
            iss : options.email // Issuer: service account email.
            , scope : options.scopes.join( ' ' ) // Scopes: space-separated string of requested permissions.
            , aud : GOOGLE_OAUTH2_URL // Audience: the Google OAuth2 token endpoint.
            , exp : exp // Expiration time.
            , iat : iat // Issued at time.
        }
    ;

    // If delegation email is provided, add it as the 'sub' (subject) claim.
    if ( options.delegationEmail ) {
        claims.sub = options.delegationEmail
        ;
    }

    // Construct the JWT header and claimset, then base64-encode them.
    var JWT_header = new Buffer( JSON.stringify( { alg : "RS256" , typ : "JWT" } ) ).toString( 'base64' ) // JWT header: algorithm (RS256) and type (JWT).
      , JWT_claimset = new Buffer( JSON.stringify( claims ) ).toString( 'base64' ) // JWT payload (claims).
      , unsignedJWT = [ JWT_header , JWT_claimset ].join( '.' ) // The unsigned part of the JWT (header.payload).
    ;

    // Obtain the private key, either from a string or by reading a file.
    obtainKey( function ( err , key ) {

        // If there's an error obtaining the key, propagate it.
        if ( err ) {
            return callback( err )
            ;
        }

        // Sign the unsigned JWT using the obtained private key and RSA-SHA256 algorithm.
        var JWT_signature = crypto.createSign( 'RSA-SHA256' ).update( unsignedJWT ).sign( key , 'base64' ) // Generate the signature.
          , signedJWT = [ unsignedJWT , JWT_signature ].join( '.' ) // Combine unsigned part and signature to form the full JWT.
        ;

        // Check if the signature generation was successful. An empty signature usually indicates an invalid key.
        if ( JWT_signature === '' ) {
            return callback( new Error( 'failed to sign JWT, the key is probably invalid' ) )
            ;
        }

        // Log the successfully signed JWT for debugging purposes.
        debug( 'signed jwt: %s' , signedJWT )
        ;
        // Return the signed JWT.
        return callback( null , signedJWT )
        ;

    } )
    ; // End of obtainKey callback

    /**
     * Helper function to retrieve the private key for signing.
     * The key can be provided directly as a string or as a path to a file.
     *
     * @private
     * @param {Function} callback The callback to invoke with the key (err, keyString).
     * @returns {void}
     */
    function obtainKey ( callback ) {
        // If the key is provided directly as a string in options.key.
        if ( options.key && options.key != '' ) {
            return callback( null , options.key )
            ;
        }
        // If a key file path is provided in options.keyFile.
        else if ( options.keyFile ) {
            // Read the key from the specified file asynchronously.
            return fs.readFile( options.keyFile , callback )
            ;
        }
        // If neither key nor keyFile is specified, throw an error.
        return callback( new Error(
            'key is not specified, use "options.key" or "options.keyFile" to specify the key to use to sign the JWT'
        ) )
        ;
    } // End of obtainKey function

}
; // End of exports.encodeJWT function