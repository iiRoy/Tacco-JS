/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and logical structures are preserved.
 * Only whitespace and comments have been altered significantly.
 * This file aims to look visually distinct from the original while maintaining
 * exact functional equivalence.
 */
( function ( $, flash ) {
    // Helper function to create HTML attributes string
    var createAttrs = function ( obj ) {
        var aEach ,  // Loop variable for object properties
            aArray = [ ] ; // Array to hold attribute strings

        for ( aEach in obj ) { // Iterate over all properties in the object
            // Check if the property value is a string or number and not empty
            if ( /string|number/.test( typeof obj[aEach] ) && obj[aEach] !== '' ) {
                aArray.push( aEach + '="' + obj[aEach] + '"' ) ; // Add formatted attribute
            }
        }

        // Join all attributes into a single string
        return aArray[j]( '' ) ;
    } ,
    // Helper function to create HTML <param> tags
    createParams = function ( obj ) {
        var aEach ,
            bEach ,
            aArray = [ ] ,
            bArray ;

        if ( typeof obj == 'object' ) { // Ensure the input is an object
            for ( aEach in obj ) { // Iterate through main parameters
                if ( typeof obj[aEach] == 'object' ) { // If a parameter value is an object (e.g., flashvars)
                    bArray = [ ] ; // Initialize array for sub-parameters
                    for ( bEach in obj[aEach] ) { // Iterate through sub-parameters
                        // Encode URI component for values and add to sub-parameter array
                        bArray.push( [ bEach , '=' , encodeURIComponent( obj[aEach][bEach] ) ][j]( '' ) ) ;
                    }
                    obj[aEach] = bArray[j]( '&amp;' ) ; // Join sub-parameters with '&amp;'
                }
                if ( obj[aEach] ) { // If the parameter has a value
                    // Create a <param> tag string
                    aArray.push( [ '<param name="' , aEach , '" value="' , obj[aEach] , '" />' ][j]( '' ) ) ;
                }
            }
            obj = aArray[j]( '' ) ; // Join all <param> tags
        }
        return obj ; // Return the combined string of <param> tags or original object
    } ,
    expressInstallIsActive = false , // Flag to track if express install is currently active
    j = 'join' ; // Shorthand for the join method name

    // Expose flash related functionality under $.flash
    $[flash] = ( function ( ) {
        var flashVersion = '0,0,0' , // Default flash version
            Plugin ; // Variable to hold the Flash Plugin object

        try {
            Plugin = navigator.plugins['Shockwave Flash'] || ActiveXObject ; // Try to get plugin or ActiveXObject

            // Determine flash version from description or by creating an instance
            flashVersion = Plugin.description || ( function ( ) {
                try {
                    return ( new Plugin( 'ShockwaveFlash.ShockwaveFlash' ) ).GetVariable( '$version' ) ;
                }
                catch ( eIE ) { /* Ignore IE-specific errors */ }
            } ( ) ) ;
        }
        catch ( e ) { /* Ignore general errors during plugin detection */ }

        // Parse the flash version string using regex
        flashVersion = flashVersion.match( /^[A-Za-z\s]*?(\d+)[\.|,](\d+)(?:\s+[d|r]|,)(\d+)/ ) ;

        // Return an object containing flash capabilities
        return {
            available: flashVersion[1] > 0 , // Is Flash player available?

            activeX: Plugin && !Plugin.name , // Is it an ActiveX control?

            version: { // Parsed version numbers
                major: flashVersion[1] * 1 ,
                minor: flashVersion[2] * 1 ,
                release: flashVersion[3] * 1
            } ,

            hasVersion: function ( version ) { // Check if a required version is met
                var versionCompare = this.version , // Current Flash player version
                    major = 'major' ,
                    minor = 'minor' ,
                    release = 'release' ;

                // Normalize the input version to an array [major, minor, release]
                version = ( /string|number/.test( typeof version ) ) ? version.toString( ).split( '.' ) : version || [ 0 , 0 , 0 ] ;

                version = [
                    version[major] || version[0] || versionCompare[major] ,
                    version[minor] || version[1] || versionCompare[minor] ,
                    version[release] || version[2] || versionCompare[release]
                ] ;

                // Compare versions
                return ( version[0] < versionCompare[major] ) ||
                       ( version[0] == versionCompare[major] && version[1] < versionCompare[minor] ) ||
                       ( version[0] == versionCompare[major] && version[1] == versionCompare[minor] && version[2] <= versionCompare[release] ) ;
            } ,

            expressInstall: 'expressInstall.swf' , // Path to the express install SWF

            create: function ( obj ) { // Function to create the SWF object HTML
                // Check prerequisites for SWF creation
                if ( !$[flash].available || expressInstallIsActive || !typeof obj == 'object' || !obj.swf ) {
                    return false ; // Cannot create SWF
                }

                // Handle express installation if required version is not met
                if ( obj.hasVersion && !$[flash].hasVersion( obj.hasVersion ) ) {
                    obj = { // Override object with express install parameters
                        swf: obj.expressInstall || $[flash].expressInstall ,
                        attrs: {
                            id: obj.id || 'SWFObjectExprInst' ,
                            name: obj.name ,
                            height: Math.max( obj.height || 137 ) ,
                            width: Math.max( obj.width || 214 )
                        } ,
                        params: {
                            flashvars: {
                                MMredirectURL: location.href ,
                                MMplayerType: ( $[flash].activeX ) ? 'ActiveX' : 'PlugIn' ,
                                MMdoctitle: document.title.slice( 0 , 47 ) + ' - Flash Player Installation'
                            }
                        }
                    } ;

                    expressInstallIsActive = true ; // Set flag for active express install
                }
                else {
                    // Extend the object with default attributes and parameters
                    obj = $.extend(
                        true , // Deep copy
                        {
                            attrs: {
                                id: obj.id ,
                                name: obj.name ,
                                height: obj.height || 180 ,
                                width: obj.width || 320
                            } ,
                            params: {
                                wmode: obj.wmode || 'opaque' ,
                                flashvars: obj.flashvars
                            }
                        } ,
                        obj // Merge with original object
                    ) ;
                }

                // Set specific attributes based on ActiveX or Plugin type
                if ( $[flash].activeX ) {
                    obj.attrs.classid = obj.attrs.classid || 'clsid:D27CDB6E-AE6D-11cf-96B8-444553540000' ;
                    obj.params.movie = obj.params.movie || obj.swf ;
                }
                else {
                    obj.attrs.type = obj.attrs.classid || 'application/x-shockwave-flash' ;
                    obj.attrs.data = obj.attrs.data || obj.swf ;
                }

                // Return the complete <object> HTML tag
                return [ '<object ' , createAttrs( obj.attrs ) , '>' , createParams( obj.params ) , '</object>' ][j]( '' ) ;
            }
        } ;
    } ( ) ) ;

    // jQuery plugin for embedding Flash objects or interacting with them
    $.fn[flash] = function ( args ) {
        // If arguments are an object, it means we are creating a new flash object
        if ( typeof args == 'object' ) {
            this.each( // Iterate over each selected element
                function ( ) {
                    var test = document.createElement( flash ) ; // Create a temporary element to hold the generated HTML

                    var newFlash = $[flash].create( args ) ; // Generate the Flash object HTML
                    if ( newFlash ) { // If HTML was successfully generated
                        test.innerHTML = newFlash ; // Insert the HTML into the temporary element
                        if ( test.childNodes[0] ) { // If the temporary element has child nodes (the object)
                            this.appendChild( test.childNodes[0] ) ; // Append the Flash object to the current jQuery element
                        }
                    } ;
                }
            ) ;
        }
        // If arguments are a function, it means we are trying to interact with existing flash objects
        else if ( typeof args == 'function' ) {
            this.find( 'object' ).andSelf( ).filter( 'object' ).each( // Find all object tags within the selection and the selection itself if it's an object
                function ( ) {
                    var elem = this , // Current DOM element (Flash object)
                        jsInteractionTimeoutMs = 'jsInteractionTimeoutMs' ; // Property name for tracking timeout

                    // Initialize or increment interaction timeout counter
                    elem[jsInteractionTimeoutMs] = elem[jsInteractionTimeoutMs] || 0 ;

                    // Prevent infinite loops / excessive retries
                    if ( elem[jsInteractionTimeoutMs] < 660 ) { // Max retry time (66ms * 10 = 660ms)
                        if ( elem.clientWidth || elem.clientHeight ) { // Check if the object is rendered and visible
                            args.call( this ) ; // Call the provided function in the context of the Flash object
                        }
                        else {
                            // If not rendered yet, retry after a short delay
                            setTimeout(
                                function ( ) {
                                    $( elem )[flash]( args ) ; // Recursively call the plugin on the element
                                } ,
                                elem[jsInteractionTimeoutMs] + 66 // Increase delay for next retry
                            ) ;
                        }
                    }
                }
            ) ;
        }

        return this ; // Return the jQuery object for chaining
    } ;
} ( jQuery , 'flash' ) ) ;