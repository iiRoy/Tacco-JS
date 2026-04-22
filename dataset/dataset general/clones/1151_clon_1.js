/*
 * This JavaScript module is encapsulated within an Immediately Invoked Function Expression (IIFE).
 * Its primary purpose is to manage user interface interactions related to CSS transformations.
 * It leverages the jQuery library for DOM manipulation and event handling,
 * and assumes the presence of a jQuery transform plugin.
 *
 * Parameters passed to the IIFE:
 *   $         : A reference to the jQuery object, aliased as '$'.
 *   window    : The global 'window' object, providing access to browser APIs.
 *   document  : The global 'document' object, representing the DOM.
 *   undefined : Ensures that the 'undefined' keyword is truly undefined within this scope,
 *               preventing potential issues if it were redefined elsewhere.
 */
( function ( $, window, document, undefined ) {

    // --------------------------------------------------------------------------
    // Event Binding Section
    // Handles user interactions that trigger form processing and animations.
    // --------------------------------------------------------------------------

    // Capture the submission event for the form identified by the ID 'transform'.
    // When this form is submitted, the provided callback function will execute.
    $( '#transform' ).submit( function ( e ) {
        // Prevent the default browser behavior for form submission,
        // which typically causes a page reload.
        e.preventDefault();

        // Invoke the main function responsible for processing form data
        // and applying the computed transformations.
        processForm();
    } ); // --- End of #transform submit handler ---


    // Attach a click event listener to the element with the ID 'go'.
    // This is likely a button that initiates the transformation process.
    $( '#go' ).click( function ( e ) {
        // Prevent any default action associated with the click event.
        e.preventDefault();

        // Call the form processing function to update transformations based on current inputs.
        processForm();

        // Cache the jQuery object for the element that was clicked.
        // This avoids re-querying the DOM if '$el' is used multiple times.
        var $el = $( this );

        // Animate the clicked element by rotating it 360 degrees.
        // This provides visual feedback to the user that an action has occurred.
        $el.animate( {
            rotate: '+=360deg'
        } );
    } ); // --- End of #go click handler ---


    // --------------------------------------------------------------------------
    // Form Field References Caching
    // Stores jQuery selectors for various input elements for efficient access.
    // --------------------------------------------------------------------------

    /*
     * This object serves as a cache for jQuery-wrapped DOM elements
     * representing various form input fields used for defining transformations.
     * Storing these references prevents repetitive and potentially costly DOM lookups.
     *
     * @type {Object} A collection where keys are logical names and values are
     *                either jQuery objects or nested objects of jQuery objects.
     */
    var fields = {
        reflect:   $( '#reflect' ),    /* Checkbox for general reflection */
        reflectX:  $( '#reflectX' ),   /* Checkbox for X-axis reflection */
        reflectY:  $( '#reflectY' ),   /* Checkbox for Y-axis reflection */
        reflectXY: $( '#reflectXY' ),  /* Checkbox for XY-axis reflection */
        rotate:    $( '#rotate' ),     /* Input field for rotation angle */

        scale:     {                   /* Object holding X and Y scale inputs */
            x: $( '#scale-x' ),
            y: $( '#scale-y' )
        },
        scaleX:    $( '#scaleX' ),     /* Input field for X-axis scale */
        scaleY:    $( '#scaleY' ),     /* Input field for Y-axis scale */

        skew:      {                   /* Object holding X and Y skew inputs */
            x: $( '#skew-x' ),
            y: $( '#skew-y' )
        },
        skewX:     $( '#skewX' ),      /* Input field for X-axis skew */
        skewY:     $( '#skewY' ),      /* Input field for Y-axis skew */

        translate: {                   /* Object holding X and Y translation inputs */
            x: $( '#translate-x' ),
            y: $( '#translate-y' )
        },
        translateX: $( '#translateX' ), /* Input field for X-axis translation */
        translateY: $( '#translateY' ), /* Input field for Y-axis translation */

        origin:    {                   /* Object holding X and Y origin inputs */
            x: $( '#origin-x' ),
            y: $( '#origin-y' )
        }
    }; // --- End of 'fields' object definition ---


    // --------------------------------------------------------------------------
    // Core Logic Function
    // Processes form inputs to generate and apply CSS transformations.
    // --------------------------------------------------------------------------

    /**
     * @function processForm
     * @description This function orchestrates the reading of values from all
     *              cached form fields, constructs a transformation object based
     *              on these values, and then applies the resulting transformations
     *              to designated target elements in the DOM. It distinguishes
     *              between animated and non-animated application of transforms.
     * @returns {void}
     */
    function processForm() {
        // Initialize an empty object to store the collected transformation
        // properties and their corresponding values.
        var funcs = {};

        // Iterate over each property (key) in the 'fields' cache object.
        // Each key represents a specific transformation type or component.
        for ( var key in fields ) {
            // Retrieve the jQuery object (or nested object of jQuery objects)
            // associated with the current key from the 'fields' cache.
            var field = fields[ key ];
            var val = null; // Initialize a variable to hold the extracted value for the current field.

            // Conditional logic to determine how to extract the value
            // based on the structure and type of the 'field'.

            // Case 1: Field represents a compound transformation (e.g., 'scale', 'skew', 'translate', 'origin')
            //         which has separate 'x' and 'y' components.
            if ( field.x ) {
                // Retrieve values for the 'x' and 'y' sub-components.
                var x = field.x.val();
                var y = field.y.val();

                // If both 'x' and 'y' values are provided, store them as an array.
                if ( x && y ) {
                    val = [ x, y ];
                }
                // If only 'x' value is provided, store 'x' as the value.
                else if ( x ) {
                    val = x;
                }
                // If neither 'x' nor 'y' is provided, 'val' remains null.
            }
            // Case 2: Field is a checkbox related to reflection,
            //         identified using a regular expression from the jQuery transform plugin.
            else if ( $.transform.rfunc.reflect.test( key ) ) {
                // Get the checked state (true/false) of the checkbox.
                val = field.is( ':checked' );
            }
            // Case 3: Field is a simple single-value input (e.g., 'rotate', 'scaleX', 'translateX').
            else {
                // Retrieve the value directly from the input field.
                var x = field.val();
                // If a value is present (not empty string, null, or undefined), assign it.
                if ( x ) {
                    val = x;
                }
            }

            // If a valid value was successfully extracted for the current field,
            // add it to the 'funcs' object under its respective key.
            if ( val ) {
                funcs[ key ] = val;
            }
        } // --- End of loop through 'fields' ---


        // Determine whether transformations should be applied with animation
        // or immediately, based on the state of the '#animate' checkbox.
        if ( $( '#animate' ).is( ':checked' ) ) {
            // If animation is enabled, prepare array values for CSS animation.
            // Many CSS animation libraries expect multi-part values (like '10px 20px')
            // as space-separated strings rather than arrays.
            $.each( funcs, function ( func, val ) {
                if ( $.isArray( val ) ) {
                    // Convert array values (e.g., [x, y]) into a space-separated string.
                    funcs[ func ] = val.join( ' ' );
                }
            } ); // --- End of $.each for preparing animated values ---

            // Apply the accumulated transformations to the '#target' element.
            // First, clear any existing transforms with an empty object, then animate.
            $( '#target' ).transform( {} ).animate( funcs );

            // Apply transformations to the '#target2' element.
            // Explicitly set its origin to [0, 0] before animating.
            $( '#target2' ).transform( {
                origin: [ 0, 0 ]
            } ).animate( funcs );
        }
        // If the '#animate' checkbox is not checked, apply transformations instantly.
        else {
            // Apply the accumulated transformations directly to the '#target' element.
            $( '#target' ).transform( funcs );

            // For '#target2', add 'origin: [0, 0]' to the 'funcs' object
            // before applying the transformations, and force matrix calculation.
            // This might be required for specific rendering behavior of the plugin.
            funcs[ 'origin' ] = [ 0, 0 ];
            $( '#target2' ).transform( funcs, {
                forceMatrix: true
            } );
        }
    } // --- End of 'processForm' function ---

} )( jQuery, this, this.document ); // --- IIFE Invocation ---