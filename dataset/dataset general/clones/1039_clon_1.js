( function ( window , document ) {

    'use strict' ; // Enable strict mode for better error handling and cleaner code.

    /*
     * Custom utility function to retrieve elements by their class name.
     * This provides a fallback for older browsers that may not support
     * `document.getElementsByClassName` directly or if a specific tag
     * type is required for filtering.
     *
     * @param {string} type      The tag name of elements to search within (e.g., 'div', 'img').
     * @param {string} className The class name to match.
     * @returns {Array<HTMLElement>} An array of matching elements.
     */
    function getElementsByClassName ( type , className ) {
        var arr = [ ] ;
        var els = document . getElementsByTagName ( type ) ;
        var pattern = new RegExp ( '(^|\\s)' + className + '(\\s|$)' ) ; // Regular expression to match whole class names.

        for ( var i = 0 ; i < els . length ; i ++ ) {
            if ( pattern . test ( els [ i ] . className ) ) {
                arr . push ( els [ i ] ) ;
            }
        }

        return arr ;
    }

    /*
     * Determines the current width of the browser window.
     * Utilizes `window.innerWidth` for modern browsers and
     * `document.documentElement.offsetWidth` for compatibility.
     *
     * @returns {number} The width of the viewport in pixels.
     */
    function windowWidth ( ) {
        return window . innerWidth || document . documentElement . offsetWidth ;
    }

    /*
     * Updates the 'src' attribute of a collection of image elements
     * based on a provided size identifier. Optionally sets width and
     * height to 'auto'.
     *
     * @param {string} size   The size identifier (e.g., 'small', 'medium') to construct the `data-` attribute name.
     * @param {Array<HTMLElement>} els  A collection of image elements to update.
     * @param {boolean} setAuto If true, sets the image's style width and height to 'auto'.
     */
    function updateImg ( size , els , setAuto ) {

        for ( var i = 0 ; i < els . length ; i ++ ) {

            var new_src = els [ i ] . getAttribute ( 'data-' + size ) ;
            els [ i ] . setAttribute ( 'src' , new_src ) ;

            // Condition to apply auto width/height, useful for older IE versions
            // where images might otherwise retain incorrect dimensions.
            if ( setAuto ) {
                els [ i ] . style . width = 'auto' ;
                els [ i ] . style . height = 'auto' ;
            }
        }
    }

    /*
     * Extracts all attributes from a given HTML element and returns them
     * as a key-value pair object.
     *
     * @param {HTMLElement} el The element from which to retrieve attributes.
     * @returns {Object<string, string>} An object where keys are attribute names and values are their corresponding values.
     */
    function getElAttributes ( el ) {

        // Initialize an empty object to store the attributes.
        var obj = { } ;
        var attributes = el . attributes ; // Get the NamedNodeMap of attributes.

        // Iterate over the element's attributes list.
        for ( var i = 0 ; i < attributes . length ; i ++ ) {
            var attr = attributes [ i ] ;
            obj [ attr . nodeName ] = attr . nodeValue ;
        }

        return obj ;
    }

    // Constructor function for the Respimg library.
    var respimg = function respimg ( o ) {
        this . opts = o ;
    } ;

    respimg . prototype = {

        /*
         * Initializes the responsive image functionality.
         * This method finds `<noscript>` tags containing image data,
         * creates actual `<img>` elements, and replaces the `<noscript>` tags.
         */
        init : function ( ) {

            // Find all noscript elements with the specified class name.
            var els = getElementsByClassName ( 'noscript' , this . opts . className ) ;

            // Store the initial image size based on current window width.
            this . size = this . getImageSize ( ) ;

            // Loop through each found noscript element.
            for ( var i = 0 ; i < els . length ; i ++ ) {
                var img = document . createElement ( 'img' ) ; // Create a new image element.
                var src = els [ i ] . getAttribute ( 'data-' + this . size ) ; // Get the appropriate src.
                var alt = els [ i ] . getAttribute ( 'data-alt' ) ; // Get the alt text.

                // Proceed only if a source for the image was successfully retrieved.
                if ( src ) {
                    img . setAttribute ( 'src' , src ) ;
                    img . setAttribute ( 'alt' , alt ) ;
                    img . className = this . opts . className ;

                    // Retrieve all attributes from the noscript tag for transfer.
                    var elAttributes = getElAttributes ( els [ i ] ) ;

                    // Apply all attributes from the noscript tag to the new image element.
                    for ( var key in elAttributes ) {
                        if ( elAttributes . hasOwnProperty ( key ) ) {
                            img . setAttribute ( key , elAttributes [ key ] ) ;
                        }
                    }

                    // Insert the newly created image element before its corresponding noscript tag.
                    els [ i ] . parentNode . insertBefore ( img , els [ i ] ) ;

                    // Remove the original noscript tag from the DOM.
                    els [ i ] . parentNode . removeChild ( els [ i ] ) ;
                }
            }

            // After initialization, store references to the actual image elements.
            this . els = getElementsByClassName ( 'img' , this . opts . className ) ;

        } ,

        /*
         * Updates the 'src' attributes of the responsive images if the
         * window size has changed, requiring a different image variant.
         */
        update : function ( ) {

            // Get the current image size based on the viewport.
            var size = this . getImageSize ( ) ;

            // Only perform an update if the detected size is different from the stored size.
            if ( this . size !== size ) {
                // Call the helper function to update the image sources.
                updateImg ( size , this . els , this . opts . setAuto ) ;

                // Update the stored size variable to reflect the new state.
                this . size = size ;
            }

        } ,

        /*
         * Determines the appropriate image size based on the current
         * window width and the configured size breakpoints.
         *
         * @returns {string|undefined} The key of the matching size, or undefined if no match.
         */
        getImageSize : function ( ) {

            var size ; // Variable to hold the determined size key.
            var sizes = this . opts . sizes ; // Get the configured size breakpoints.
            var wW = windowWidth ( ) ; // Get the current window width.

            // Iterate over each defined size breakpoint.
            for ( var key in sizes ) {
                if ( sizes . hasOwnProperty ( key ) ) {
                    var obj = sizes [ key ] ; // Current size object with min/max properties.
                    // Check if the window width falls within the current breakpoint's range.
                    if ( wW >= ( obj . min || 0 ) && wW <= ( obj . max || Infinity ) ) {
                        size = key ; // Assign the key of the matching size.
                    }
                }
            }

            return size ;
        }

    } ;

    // Expose the Respimg constructor globally on the window object.
    window . Respimg = respimg ;

} ) ( window , document ) ;