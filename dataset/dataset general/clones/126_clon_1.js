/*
 * Gumby Responsive Images Module - Type I Clone
 * This file is a clone of the original source code.
 * All functional logic, identifiers, operators, and expressions remain precisely the same.
 * The only modifications are to whitespace (spacing, indentation, blank lines) and comments.
 * This ensures logical equivalence while presenting a visually distinct structure.
 */
! function (  )
{ // Start of the Immediately Invoked Function Expression (IIFE) for the module.

    'use strict'; // Enforce strict mode for cleaner code and better error handling.

    /**
     * The main constructor function for the Images module.
     * Manages responsive loading of images based on various conditions.
     * @param {jQuery} $el The jQuery-wrapped HTML element that this module instance controls.
     */
    function  Images ( $el )
    {

        Gumby.debug( 'Initializing Responsive Images module', $el ); // Log the initialization process.


        this.$el       = $el;       // Store the reference to the jQuery element.

        this.type      = '';        // Stores whether it's an 'img' tag or a background image ('bg').
        this.supports  = '';        // Stores parsed 'supports' attribute data.
        this.media     = '';        // Stores parsed 'media' attribute data.
        this.def       = '';        // Stores the default image URL.
        this.current   = '';        // Stores the URL of the currently loaded image.


        // Call the setup method to parse attributes and prepare the module.
        this.setup (  );

        var scope = this; // Cache 'this' (the Images instance) for use within event handlers.

        // Attach event listeners to the window.
        // It listens for 'load', 'gumby.trigger', and 'resize' (if media queries are used).
        $( window ).on( 'load gumby.trigger ' + ( ! this.media || 'resize' ), function ( e )
        {
            // When any of these events occur, re-evaluate and potentially load a new image.
            scope.fire (  );
        } );

        // Attach a custom event listener for re-initialization on the element itself.
        this.$el.on( 'gumby.initialize', function (  )
        {
            Gumby.debug( 'Re-initializing Responsive Images module', scope.$el ); // Log re-initialization.
            scope.setup (  ); // Re-run the setup to re-parse attributes.
            scope.fire (  );  // Re-evaluate and load the appropriate image.
        } );

        // Fire immediately upon construction to load the initial image.
        scope.fire (  );
    }


    /**
     * Configures the module by extracting and parsing attributes from the element.
     * This method determines the image type and processes 'supports' and 'media' definitions.
     */
    Images.prototype.setup = function (  )
    {
        // Determine if the element is an <img> tag or if it will use background-image.
        this.type = this.$el.is( 'img' ) ? 'img' : 'bg';

        // Retrieve the 'supports' attribute value (e.g., "webp|image.webp, retina|image@2x.png").
        this.supports = Gumby.selectAttr.apply( this.$el, [ 'supports' ] ) || false;

        // Retrieve the 'media' attribute value (e.g., ">400px|small.jpg, <800px|medium.jpg").
        this.media = Gumby.selectAttr.apply( this.$el, [ 'media' ] ) || false;

        // Retrieve the 'default' attribute value, which specifies a fallback image.
        this.def = Gumby.selectAttr.apply( this.$el, [ 'default' ] ) || false;


        // If 'supports' attribute data exists, parse it into a structured array.
        if ( this.supports ) { this.supports = this.parseAttr( this.supports ); }

        // If 'media' attribute data exists, parse it into a structured array.
        if ( this.media ) { this.media = this.parseAttr( this.media ); }


        // Define the check functions used to evaluate different types of conditions.
        this.checks =
        {
            /**
             * Checks for Modernizr feature support.
             * @param {string} val The Modernizr test string (e.g., 'webp', 'retina').
             * @returns {boolean} True if the feature is supported.
             */
            supports : function ( val )
            {
                return Modernizr[ val ];
            },
            /**
             * Checks for CSS media query matches.
             * @param {string} val The media query string (e.g., '(min-width: 768px)').
             * @returns {boolean} True if the media query matches.
             */
            media: function ( val )
            {
                return window.matchMedia( val ).matches;
            }
        };
    };


    /**
     * The core method that orchestrates the checks and image loading.
     * It evaluates support, media queries, and default images to determine which image to display.
     */
    Images.prototype.fire = function (  )
    {
        // Variable to hold the URL of the image that should be loaded.
        var success = false;

        // First, check 'supports' attributes if they are defined and Modernizr is available.
        if ( this.supports && Modernizr )
        {
            success = this.handleTests( 'supports', this.supports );
        }

        // If 'media' attributes are defined, window.matchMedia is supported,
        // AND no 'supports' match has been found yet, then check media queries.
        if ( this.media && window.matchMedia && ! success )
        {
            success = this.handleTests( 'media', this.media );
        }

        // If no specific support or media query match, attempt to load the default image.
        if ( ! success && this.def )
        {
            success = this.def; // The default image URL becomes the candidate.
        }

        // If after all checks, no image URL could be determined, then exit.
        if ( ! success )
        {
            return false;
        }

        // Only proceed to load the image if the determined 'success' image
        // is different from the one currently displayed.
        if ( this.current !== success )
        {
            this.current = success; // Update the record of the current image.
            this.insertImage( this.type, success ); // Load and insert the new image.
        }
    };


    /**
     * Processes an array of tests (either 'supports' or 'media' definitions).
     * It iterates through them in order and returns the image URL for the first successful test.
     * @param {string} type The type of test to perform ('supports' or 'media').
     * @param {Array<Object>} array An array of objects, each with 'test' and 'img' properties.
     * @returns {string|boolean} The URL of the matching image, or false if no match.
     */
    Images.prototype.handleTests = function ( type, array )
    {
        var scope     = this,      // Preserve the context of the Images instance.
            supported = false;     // Flag to store the image URL if a match is found.

        // Iterate over each test definition in the provided array.
        $( array ).each( function ( key, val )
        {
            // Perform the actual check using the appropriate function (Modernizr or matchMedia).
            // Tests are provided in order of preference, so the first one that passes is used.
            if ( scope.check( type, val.test ) )
            {
                supported = val.img; // Store the URL of the image associated with the passing test.
                return false;        // Break out of the jQuery .each loop early.
            }
        } );

        return supported; // Return the image URL or false.
    };


    /**
     * Executes the specific check function (from `this.checks`) based on the given type.
     * @param {string} type The category of the check ('supports' or 'media').
     * @param {string} val The value to pass to the check function (e.g., 'webp', '(min-width: 768px)').
     * @returns {boolean} The boolean result of the invoked check function.
     */
    Images.prototype.check = function ( type, val )
    {
        return this.checks[ type ]( val ); // Dynamically call the correct check method.
    };


    /**
     * Preloads an image and then updates the element's 'src' attribute or 'background-image' style.
     * @param {string} type The type of update ('img' for src, 'bg' for background-image).
     * @param {string} img The URL of the image to load and insert.
     */
    Images.prototype.insertImage = function ( type, img )
    {
        var scope = this,         // Preserve context for the event handler.
            image = $( new Image(  ) ); // Create a temporary Image object for preloading.

        // Attach a 'load' event handler to the temporary image.
        image.load( function (  )
        {
            // If the element is an <img>, set its 'src'.
            // Otherwise (for 'bg' type), set the 'background-image' CSS property.
            type === 'img'
                ? scope.$el.attr( 'src', img )
                : scope.$el.css( 'background-image', 'url(' + img + ')' )
            ;

            // Log the event and trigger a custom 'gumby.onChange' event on the element.
            Gumby.debug( 'Triggering onChange event', img, scope.$el );
            scope.$el.trigger( 'gumby.onChange', [ img ] );
        } )
        .attr( 'src', img ); // Set the 'src' of the temporary image to start preloading.
    };


    /**
     * Parses a comma-separated string of attribute values (e.g., "test1|img1.jpg,test2|img2.png")
     * into an array of objects, each containing a 'test' and 'img' property.
     * @param {string} support The raw attribute string to be parsed.
     * @returns {Array<Object>} An array of objects, each representing a test-image pair.
     */
    Images.prototype.parseAttr = function ( support )
    {
        var scope = this,            // Keep context for calling shorthand.
            supp  = support.split( ',' ), // Split the input string by commas into individual entries.
            res   = [ ],             // Array to store the final parsed objects.
            splt  = [ ];             // Temporary array to hold parts after splitting by '|'.

        // Iterate through each individual entry obtained from the split.
        $( supp ).each( function ( key, val )
        {
            splt = val.split( '|' ); // Split each entry by the '|' character.

            // Ensure that each entry has exactly two parts: a test and an image URL.
            if ( splt.length !== 2 )
            {
                return true; // If malformed, skip this entry and continue to the next one.
            }

            // Push a new object into the results array.
            // The 'test' part is first processed by the shorthand method.
            res.push( {
                'test' : scope.shorthand( splt[ 0 ] ), // Process shorthand syntax for the test.
                'img'  : splt[ 1 ]                     // The image URL.
            } );
        } );

        return res; // Return the array of parsed test-image objects.
    };


    /**
     * Converts shorthand media query syntax (e.g., ">400", "<800") into full CSS media query strings.
     * It also ensures that media queries are properly wrapped in parentheses.
     * @param {string} str The string representing a media query or feature test.
     * @returns {string} The formatted media query string.
     */
    Images.prototype.shorthand = function ( str )
    {
        // Replace '>' with 'min-width: ' and '<' with 'max-width: ' for media queries.
        if ( str.indexOf( '>' ) > -1 || str.indexOf( '<' ) > -1 )
        {
            str = str.replace( '>', 'min-width: ' ).replace( '<', 'max-width: ' );
        }

        // If the string contains 'width' (indicating a media query) AND it's not already
        // enclosed in parentheses, wrap it to form a valid CSS media query.
        // This prevents wrapping feature detection strings (like 'webp') in parentheses.
        if ( str.indexOf( 'width' ) > -1
             && str.charAt( 0 ) !== '('
             && str.charAt( str.length - 1 ) !== ')' )
        {
            str = '(' + str + ')';
        }

        return str; // Return the potentially modified string.
    };


    /**
     * Registers the 'images' module with Gumby's global initialization system.
     * This function is called by Gumby when it needs to initialize or re-initialize modules.
     */
    Gumby.addInitalisation( 'images', function ( all )
    {
        // Select all elements that possess any of the responsive image attributes.
        $( '[gumby-supports],[data-supports],[supports],[gumby-media],[data-media],[media]' ).each( function (  )
        {
            var $this = $( this ); // Cache the current element as a jQuery object.

            // Case 1: The element has already been initialized (checked by 'isImage' data attribute)
            // AND the 'all' flag is false (meaning we are only initializing new modules).
            if ( $this.data( 'isImage' ) && ! all )
            {
                return true; // Skip this element and proceed to the next in the loop.
            }
            // Case 2: The element has already been initialized
            // AND the 'all' flag is true (meaning we need to reinitialize all modules).
            else if ( $this.data( 'isImage' ) && all )
            {
                $this.trigger( 'gumby.initialize' ); // Trigger the custom re-initialization event.
                return true;                         // Skip and move to the next element.
            }

            // If neither of the above conditions met, this is a new element to be initialized.
            $this.data( 'isImage', true ); // Mark the element as initialized.
            new Images( $this );           // Create a new Images instance for this element.
        } );
    } );


    /**
     * Registers the 'images' module with Gumby's UI module registry.
     * This defines the module's name, its custom events, and its initialization callback.
     */
    Gumby.UIModule( {
        module: 'images',                    // The unique identifier for this module.
        events: [ 'onChange', 'trigger' ], // Custom events that this module can emit or respond to.
        init: function (  )
        {
            Gumby.initialize( 'images' ); // The function to call when Gumby's UI module system initializes 'images'.
        }
    } );

} (  ); // End of the IIFE.