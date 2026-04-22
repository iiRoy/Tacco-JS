/*
 * jQuery FitFrame Plugin - Responsive Iframes
 *
 * This script provides a lightweight and user-friendly solution
 * for making iframes responsive across various screen sizes.
 *
 * Author:          @benfosterdev (http://ben.onfabrik.com)
 * Copyright:       (c) 2013 Ben Foster. All rights reserved.
 * License:         MIT License (Open Source)
 * Project Link:    https://github.com/benfoster/FitFrame.js
 * Current Version: 0.0.0.1 (Alpha Release)
 *
 * Further details and documentation can be found on the GitHub repository.
 */

; ( function ( $, window, document, undefined ) { /* Anonymous function for scope isolation */

    var PLUGIN_NAME  =  "fitFrame" , // The name of our jQuery plugin
        INSTANCE_KEY =  "plugin_" + PLUGIN_NAME ; // Key for storing plugin instance data

    // Constructor function for the FitFrame plugin
    function FitFrame ( element , options , defaults ) {
        this.element   =   $( element ) ; // Store the jQuery element
        this.options   =   $.extend( { } , defaults , options ) ; // Merge default and user options

        this._defaults =   defaults ; // Keep a reference to the default options
        this._init( ) ; // Initialize the plugin instance
    }

    FitFrame.prototype = {

        // Public method: Updates and fits any new iframes
        // that might have been dynamically added to the DOM
        // since the plugin was initially applied.
        update : function ( ) {
            if ( this.options.mode === 'resize' ) {
                this._resizeNew( ) ; // Handle 'resize' mode updates
            } else {
                this._wrapNew( ) ; // Handle 'wrap' mode updates
            }
        } ,

        // Private method (exposed for internal use): Wraps a single iframe element.
        // This is primarily used when the plugin's mode is set to 'wrap'.
        wrap : function ( iframe ) {

            var padding =   ( this._calculateRatio( iframe ) * 100 ) + '%' , // Calculate padding based on aspect ratio
                wrapper =   $( '<div/>' ) // Create a new div element
                                .addClass( this.options.wrapperCssClass ) // Add the configured wrapper CSS class
                                .css( 'padding-bottom' , padding ) ; // Set the calculated padding for aspect ratio

            // Perform the actual wrapping of the iframe within the new div
            // and then return the newly created parent wrapper element.
            return iframe.wrap( wrapper ).parent( ) ;
        } ,

        // Public method: Initializes and resizes a single iframe element.
        // This method is used when the plugin's mode is set to 'resize'.
        resize : function ( iframe ) {

            this._setupIframe( iframe ) ; // Prepare the iframe for resizing

            // Call the internal resizing logic, passing necessary dimensions and options.
            this._resizeIframe(
                  iframe ,
                  this.element.width( ) ,
                  this.element.height( ) ,
                  this.options.fitHeight
            ) ;

            // Return the iframe element after it has been resized.
            return iframe ;
        } ,

        // Public method: Cleans up and removes all traces of the fitFrame.js plugin
        // from the DOM and associated elements.
        destroy : function ( ) {
            var self =   this ; // Cache 'this' for use in inner functions

            if ( self.options.mode === 'resize' ) {
                // If in 'resize' mode, revert iframe styles and data.
                this.element.find( 'iframe.' + this.options.iframeCssClass )
                            .each( function ( ) {
                                var data =   $( this ).data( PLUGIN_NAME ) ; // Retrieve original data
                                $( this ).removeClass( self.options.iframeCssClass ) // Remove plugin CSS class
                                         .width( data.width ) // Restore original width
                                         .height( data.height ) // Restore original height
                                         .data( PLUGIN_NAME , null ) ; // Clear plugin data
                            } ) ;

                this._unbind( ) ; // Unbind window resize event handler

            } else { // Handle 'wrap' mode cleanup

                // Remove the wrapper divs, leaving the iframes in place.
                this.element.find( '.' + this.options.wrapperCssClass )
                            .children( )
                            .unwrap( ) ;
            }

            // Finally, remove the plugin instance data from the main element.
            this.element.data( INSTANCE_KEY , null ) ;
        } ,

        // Private method: Initializes the plugin's internal state.
        _init : function ( ) {
            if ( this.options.mode === 'resize' ) {
                this._bind( ) ; // Attach event listeners, specifically for window resize in 'resize' mode.
            }

            this.update( ) ; // Perform an initial update to fit existing iframes.
        } ,

        // Private method: Identifies and wraps any new iframes that are not yet handled.
        // This is specific to the 'wrap' mode.
        _wrapNew : function ( ) {
            var self =   this , // Preserve context
                // Find all iframes within the plugin's element,
                // then filter to include only those not already inside a wrapper.
                iframes =   this.element.find( 'iframe' )
                                        .filter( function ( ) {
                                            return ! $( this ).closest( self.options.wrapperCssClass ).length ;
                                        } ) ;

            // Iterate through the newly found iframes and apply the wrapping logic.
            iframes.each( function ( ) {
                self.wrap( $( this ) ) ;
            } ) ;
        } ,

        // Private method: Sets up and resizes any new iframes for 'resize' mode.
        _resizeNew : function ( ) {
            var self =   this ; // Context preservation

            // Select all iframes that do NOT have the plugin's CSS class,
            // then set them up for resizing.
            $( 'iframe' ).not( this.options.iframeCssClass )
                         .each( function ( ) {
                             self._setupIframe( $( this ) ) ;
                         } ) ;

            this._resizeAll( ) ; // After setup, perform a full resize operation.
        } ,

        // Private method: Prepares an individual iframe by storing its original dimensions
        // and aspect ratio, and applying the necessary CSS class.
        _setupIframe : function ( iframe ) {
            iframe
                .data( PLUGIN_NAME , { // Store initial data on the iframe itself
                    ratio  :   this._calculateRatio( iframe ) , // Calculate and store aspect ratio
                    width  :   iframe.width( ) , // Store original width
                    height :   iframe.height( ) // Store original height
                } )
                .addClass( this.options.iframeCssClass ) ; // Add the designated iframe CSS class
        } ,

        // Private method: Resizes ALL iframes that are currently managed by this plugin instance.
        // This is typically called on window resize events in 'resize' mode.
        _resizeAll : function ( ) {

            var self            =   this , // Context for inner function
                containerWidth  =   this.element.width( ) , // Get the width of the main container
                containerHeight =   this.element.height( ) , // Get the height of the main container
                fitHeight       =   this.options.fitHeight ; // Check if height fitting is enabled

            // Find all iframes with the plugin's CSS class within the container
            // and apply the resizing logic to each of them.
            this.element.find( 'iframe.' + this.options.iframeCssClass )
                        .each( function ( ) {
                            self._resizeIframe( $( this ) , containerWidth , containerHeight , fitHeight ) ;
                        } ) ;
        } ,

        // Private method: Handles the actual resizing logic for a single iframe.
        // It takes into account container dimensions and the 'fitHeight' option.
        _resizeIframe : function ( iframe , containerWidth , containerHeight , fitHeight ) {
            var ratio     =   iframe.data( PLUGIN_NAME ).ratio , // Retrieve the stored aspect ratio
                newHeight =   containerWidth * ratio ; // Calculate potential new height

            if ( fitHeight && ( newHeight > containerHeight ) ) {
                // If 'fitHeight' is enabled AND the calculated new height exceeds the container height,
                // then scale the iframe based on the container's height to prevent overflow.
                iframe.height( containerHeight ).width( containerHeight / ratio ) ;
            } else {
                // Otherwise (if 'fitHeight' is false, or new height fits),
                // scale the iframe's height based on the container's width,
                // maintaining aspect ratio, and set width to 100%.
                iframe.height( containerWidth * ratio ).width( '100%' ) ;
            }
        } ,

        // Private method: Calculates the aspect ratio of an iframe.
        // It uses the 'width' and 'height' attributes of the iframe element.
        _calculateRatio : function ( iframe ) {
            var width  =   iframe.attr( 'width' ) , // Get the original width attribute
                height =   iframe.attr( 'height' ) ; // Get the original height attribute

            return ( ( height / width ) ).toPrecision( 4 ) ; // Return ratio, formatted to 4 decimal places
        } ,

        // Private method: Binds event handlers, specifically for window resizing.
        // Includes a debounce mechanism to prevent excessive resizing calls.
        _bind : function ( ) {
            // Implement debounced resizing to optimize performance during window resize.
            var self =   this , // Store 'this' context
                t ; // Timer variable for debouncing

            $( window ).on( 'resize.' + PLUGIN_NAME , function ( ) {
                clearTimeout( t ) ; // Clear any existing resize timeout
                t =   setTimeout( function ( ) {
                    self._resizeAll( ) ; // Trigger resize after a short delay
                } , 100 ) ; // 100ms debounce delay
            } ) ;
        } ,

        // Private method: Unbinds all event handlers that were attached
        // by this plugin instance, using its unique namespace.
        _unbind : function ( ) {
            // Remove all event handlers with the plugin's namespace from the window object.
            $( window ).off( '.' + PLUGIN_NAME ) ;
        }
    } ; // End of FitFrame.prototype object definition

    // Define the jQuery plugin method for FitFrame.
    // This allows users to call `$(selector).fitFrame(options);`
    $.fn[ PLUGIN_NAME ] = function ( options ) {

        var args    =   arguments , // Capture all arguments passed to the plugin call
            returns ; // Variable to store return values from public methods

        this.each( function ( ) { // Iterate over each selected element

            var instance =   $.data( this , INSTANCE_KEY ) ; // Attempt to retrieve an existing plugin instance

            if ( instance ) {
                // If an instance already exists, check if a public method is being invoked.
                // Public methods are strings that do not start with an underscore.
                if ( typeof ( options ) === 'string' && options[ 0 ] !== '_' ) {
                    var method =   instance[ options ] ; // Get the method from the instance

                    if ( typeof ( method ) === 'function' ) {
                        // If the method exists and is a function, call it with arguments.
                        // Arguments are sliced to exclude the method name itself.
                        returns =   method.apply( instance , Array.prototype.slice.call( args , 1 ) ) ;
                    } else {
                        // If the requested method does not exist on the instance, throw an error.
                        $.error( 'Public method \'' + options + '\' does not exist on jQuery.' + PLUGIN_NAME ) ;
                    }
                }

            } else {
                // If no plugin instance exists for this element, create a new one.
                $.data( this , INSTANCE_KEY , new FitFrame( this , options , $.fn[ PLUGIN_NAME ].defaults ) ) ;
            }
        } ) ;

        // Return value: If a public method returned a value, return it.
        // Otherwise, return 'this' (the jQuery object) to maintain chainability.
        return returns !== undefined ? returns : this ;
    } ;

    // Define the default options for the FitFrame plugin.
    // These can be overridden by user-provided options.
    $.fn[ PLUGIN_NAME ].defaults = {
        wrapperCssClass :   'fitframe-wrap' , // CSS class applied to the wrapper div in 'wrap' mode
        iframeCssClass  :   'fitframe' , // CSS class applied to iframes managed by the plugin
        mode            :   'wrap' , // Default operating mode: 'wrap' or 'resize'
        fitHeight       :   false // In 'resize' mode, attempt to fit height if true, otherwise scale width
    } ;

} ) ( jQuery , window , document ) ; // Pass jQuery, window, and document objects to the IIFE