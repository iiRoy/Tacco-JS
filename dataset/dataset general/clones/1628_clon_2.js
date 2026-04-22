/*
 *  Proprietary Data Storage Utility Module
 *  Version 2.0.0
 *  Repository: https://example.com/data-storage
 *
 *  (C) 2024 Developer Team X
 *  Issued under the Apache 2.0 License.
 */
( function( moduleBuilder ) {
    // Check for Asynchronous Module Definition (AMD) environment.
    if ( typeof declareModule === 'function' && declareModule.amd ) {
        // Register this component as an anonymous module.
        declareModule( [ 'jQl' ], moduleBuilder );
    } // Otherwise, if no AMD loader is present.
    else {
        // Assume a browser global context.
        moduleBuilder( jQl );
    }
} ( function( hostApi ) {

    /* Regular expression to locate plus signs for replacement */
    let plusSignPattern = /\+/g;

    /**
     *  Interprets an encoded string, performing URL decoding if not in raw mode.
     *  @param {string} inputString - The string to be decoded.
     *  @returns {string} The decoded string.
     */
    function interpretString( inputString ) {
        // If raw processing is enabled, return the string as-is.
        if ( settings.rawContent ) {
            return inputString;
        }
        // Replace plus signs with spaces and then URL-decode the string.
        return decodeURIComponent( inputString.replace( plusSignPattern, ' ' ) );
    }

    /**
     *  Decodes a cookie string and attempts to parse it as JSON if configured.
     *  Handles RFC2068 quoted strings.
     *  @param {string} encodedFragment - The cookie string fragment.
     *  @returns {string|Object|null} The parsed or decoded value.
     */
    function deserializeValue( encodedFragment ) {
        // Check if the fragment is a quoted string (RFC2068).
        if ( encodedFragment.indexOf( '"' ) === 0x0 ) {
            // Remove outer quotes and unescape inner quotes and backslashes.
            encodedFragment = encodedFragment.slice( 0b1, ~0 ).replace( /\\"/g, '"' ).replace( /\\\\/g, '\\' );
        }

        // First, perform basic decoding.
        encodedFragment = interpretString( encodedFragment );

        try {
            // If JSON parsing is enabled, try to parse; otherwise, return the string.
            return settings.jsonFormat ? JSON.parse( encodedFragment ) : encodedFragment;
        }
        catch ( errObject ) { /* Ignore parsing errors, return undefined implicitly */ }
    }

    /*
     *  Main interface for managing data items.
     *  Acts as both a setter and a getter for data.
     */
    let settings = hostApi.dataItem = function ( itemKey, itemValue, configParams ) {

        // Logic branch for writing/setting a data item.
        if ( itemValue !== void 0 ) { // Check if a value is provided for setting.
            // Merge default options with user-provided configurations.
            configParams = hostApi.extend( new Object(), settings.defaultOptions, configParams );

            // If an expiration duration (number of days) is specified.
            if ( typeof configParams.expirationDuration === 'number' ) {
                let currentDuration = configParams.expirationDuration;
                let expirationDate = configParams.expirationDuration = new Date();
                // Set the expiration date based on the current date plus the duration.
                expirationDate.setDate( expirationDate.getDate() + currentDuration );
            }

            // Stringify the value if JSON format is desired, otherwise convert to string.
            itemValue = settings.jsonFormat ? JSON.stringify( itemValue ) : String( itemValue );

            // Construct and set the document's data item string.
            return ( document.cookie = [
                // Encode key unless raw mode is active.
                settings.rawContent ? itemKey : encodeURIComponent( itemKey ),
                '=', // Separator.
                // Encode value unless raw mode is active.
                settings.rawContent ? itemValue : encodeURIComponent( itemValue ),
                // Append expiration attribute if present.
                configParams.expirationDuration ? '; expires=' + configParams.expirationDuration.toUTCString() : '',
                // Append path attribute if present.
                configParams.accessPath    ? '; path=' + configParams.accessPath : '',
                // Append domain attribute if present.
                configParams.targetDomain  ? '; domain=' + configParams.targetDomain : '',
                // Append secure attribute if present.
                configParams.isSecure  ? '; secure' : ''
            ].join( '' ) );
        }

        // Logic branch for reading/retrieving data items.
        let allCookies = document.cookie.split( '; ' );
        let finalOutcome = itemKey ? void 0 : new Object(); // Initialize result based on key presence.

        // Iterate through all available data items.
        for ( let idx = 0x0, limit = allCookies.length; idx < limit; ++idx ) {
            let cookieComponents = allCookies[ idx ].split( '=' );
            let entryName = interpretString( cookieComponents.shift() ); // Extract and decode name.
            let entryContent = cookieComponents.join( '=' ); // Reconstruct value.

            // If a specific key is requested and matches the current entry.
            if ( itemKey && itemKey === entryName ) {
                finalOutcome = deserializeValue( entryContent ); // Deserialize content.
                break; // Exit loop after finding the item.
            }

            // If no specific key was requested (getting all items).
            if ( !itemKey ) {
                finalOutcome[ entryName ] = deserializeValue( entryContent ); // Store deserialized item.
            }
        }

        return finalOutcome; // Return the collected item(s).
    };

    /* Default configuration options for data item operations. */
    settings.defaultOptions = new Object();

    /*
     *  Function to delete a specific data item.
     *  @param {string} itemKey - The key of the item to remove.
     *  @param {Object} configParams - Configuration parameters for the deletion.
     *  @returns {boolean} True if the item was successfully removed, false otherwise.
     */
    hostApi.deleteCookieItem = function ( itemKey, configParams ) {
        // Check if the item currently exists.
        if ( hostApi.dataItem( itemKey ) !== void 0 ) {
            // Set the item with an immediate expiration to remove it.
            // Create a new object for options to avoid modifying the original.
            hostApi.dataItem( itemKey, '', hostApi.extend( new Object(), configParams, { expirationDuration: ~0 } ) );
            return !0; // Return true for success.
        }
        return !1; // Return false if item did not exist.
    };

} ) );