/*
 * This is a Type I clone of the original preloader plugin code.
 * All identifiers, variables, functions, and expressions remain identical.
 * Only whitespace and comments have been altered significantly to
 * create a visually distinct but functionally equivalent version.
 */
;
( function ( $, window, undefined ) {

    // Define the plugin's name and essential document reference.
    var pluginName = 'preloader'
        , document = window.document
        ;

    // Default configuration options for the plugin.
    // These can be overridden by user-provided options.
    var defaults = {
        data: 'src' /* Attribute to check for image source */,
        hideIfNoData: true /* Hide elements without specified data attribute */,
        each: null /* Callback for each image loaded/errored */,
        all: null /* Callback when all images have been processed */
    };

    /**
     * @constructor
     * Primary constructor function for the Preloader plugin.
     * Initializes the plugin on a given set of elements.
     * @param {HTMLElement|jQuery} element - The DOM element(s) to apply the plugin to.
     * @param {Object} options - User-defined options to override defaults.
     */
    function Plugin ( element, options ) {
        // Store a reference to the current instance for use in callbacks.
        var _this = this;

        // Merge default options with user-provided options.
        // The result is stored in this.options.
        this.options = $.extend( {}, defaults, options );

        // Filter elements: only include those that have the specified data attribute.
        // Elements without the data attribute might be hidden based on options.
        this.element = $( element ).map( function ( i ) {

            // Check if the element has the required data attribute.
            if ( $( this ).data( _this.options.data ) ) {

                // If data exists, include this element in the collection.
                return this;

            } else {

                // If no data, decide whether to hide the element.
                if ( _this.options.hideIfNoData ) {

                    // Hide the element if configured to do so.
                    $( this ).hide();

                } // End of hideIfNoData check.

            } // End of data check (if/else).

        } ); // End of element mapping.

        // Store references to the default options and plugin name.
        // These are typically used for internal plugin management.
        this._defaults = defaults;
        this._name = pluginName;

        // Initialize the plugin's core functionality.
        this.init();

    } // End of Plugin constructor.

    // Define methods for the Plugin's prototype.
    Plugin.prototype.init = function () {
        // Cache 'this' for use in nested functions.
        var _this = this
            ;
        // Array to keep track of processed elements.
        var done = []
            ;

        // Iterate over each element selected by the plugin.
        $.each( $( this.element ), function ( i, elem ) {

            // Create a new image element in memory.
            var $img = $( '<img />' )
                ;
            // Get the source URL from the element's data attribute.
            var src = $( elem ).data( _this.options.data )
                ;

            // Set the image source and attach event handlers for load and error.
            $img.attr( 'src', src ).on( 'load error', function ( e ) {

                // Add the current element to the 'done' array.
                done.push( elem );

                // Store whether the image loaded successfully or errored.
                $.data( elem, 'done', ( 'error' == e.type ) ? false : true );

                // Execute the 'each' callback if it's a function.
                if ( _this.options.each instanceof Function ) {

                    _this.options.each.call( $img[0] );

                } // End of 'each' callback check.

                // Check if all elements have been processed and execute 'all' callback.
                if ( done.length >= _this.element.length && _this.options.all instanceof Function ) {

                    _this.options.all.call( done );

                } // End of 'all' callback check.

                // Detach event handlers to prevent memory leaks or multiple calls.
                $( this ).off( 'load error' );

                // Replace the original element with the newly loaded image.
                _this.replace( elem, $img );

            } ); // End of load/error event handler.

        } ); // End of $.each loop.

        /**
         * Replaces the original element with the loaded image,
         * transferring all original attributes except 'src'.
         * This method is added inside init for scope reasons, but effectively
         * acts as a helper for the image loading process.
         * @param {HTMLElement} elem - The original element to be replaced.
         * @param {jQuery} $img - The new jQuery image object.
         */
        Plugin.prototype.replace = function ( elem, $img ) {
            // Cache 'this' for nested functions.
            var _this = this
                ;
            // Get all attributes from the original element.
            var attributes = $( elem ).prop( 'attributes' )
                ;

            // Iterate over the original element's attributes.
            $.each( attributes, function () {

                // Do not transfer the 'src' attribute, as the new image already has it.
                if ( this.name !== 'src' ) {

                    // Set the attribute on the new image element.
                    $img.attr( this.name, this.value );

                } // End of 'src' attribute check.

            } ); // End of attribute iteration.

            // Finally, replace the original element in the DOM with the new image.
            $( elem ).replaceWith( $img );

        }; // End of replace method definition.

    }; // End of Plugin.prototype.init.

    // Attach the plugin to jQuery's fn object.
    // This makes the plugin available via $.fn.preloader().
    $.fn[ pluginName ] = function ( options ) {
        // Prevent multiple instantiations of the plugin on the same element.
        if ( !$.data( this, 'plugin_' + pluginName ) ) {
            // Instantiate the plugin and store its instance in jQuery's data cache.
            $.data( this, 'plugin_' + pluginName, new Plugin( this, options ) );
        }
    }; // End of $.fn[pluginName] definition.

// Immediately Invoked Function Expression (IIFE) closure.
// Passes jQuery and window objects for scope and performance.
} ( jQuery, window ) );