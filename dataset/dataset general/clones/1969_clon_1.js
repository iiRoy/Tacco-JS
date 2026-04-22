/*
 * This file contains the JavaScript code for the Snipe image zoom plugin.
 * It's a Type I clone, meaning only whitespace and comments have been altered.
 * All variable names, function names, operators, and expressions remain identical.
 */
( function ( )
{

    // Declare global variables for the module.
    var $, Bounds, Snipe, defaultsSettings, forceSettings;

    // Assign jQuery to the local $ variable for convenience.
    $ = jQuery;

    // Default settings for the Snipe plugin.
    defaultsSettings = {
        "class"      : 'snipe-lens', // CSS class for the lens element
        size         : 200,          // Size of the zoom lens (width and height)
        animation    : null,         // Animation type (not fully implemented here, placeholder)
        image        : null,         // URL of the high-resolution image for zooming
        cursor       : 'none',       // Cursor style when hovering over the lens
        bounds       : [ ],          // Array to store custom bounds, if any (not used in current logic)
        css          : {             // Default CSS properties for the lens
            borderRadius    : 200,                                         // Makes the lens circular
            width           : 200,                                         // Width of the lens
            height          : 200,                                         // Height of the lens
            border          : '2px solid white',                           // Border style
            backgroundColor : 'white',                                     // Background color
            boxShadow       : '0 0 10px #777, 0 0 8px black inset, 0 0 80px white inset' // Box shadow for visual effect
        },
        // Callback functions for various zoom events
        zoomin       : function ( lens ) { /* No-op by default */ },
        zoomout      : function ( lens ) { /* No-op by default */ },
        zoommoved    : function ( lend ) { /* No-op by default */ }
    };

    // Settings that are forced and cannot be overridden by user settings.
    forceSettings = {
        css: {
            position       : 'absolute',    // Lens must be absolutely positioned
            top            : 0,             // Initial top position
            left           : 0,             // Initial left position
            backgroundRepeat : 'no-repeat'  // Background image should not repeat
        }
    };


    /*
     * Bounds Class Definition
     * Represents the rectangular boundaries of an element.
     */
    Bounds = ( function ( )
    {

        // Constructor for the Bounds class.
        function Bounds ( top, right, bottom, left )
        {
            this.top    = top;      // Top edge coordinate
            this.right  = right;    // Right edge coordinate
            this.bottom = bottom;   // Bottom edge coordinate
            this.left   = left;     // Left edge coordinate

            return this; // Return the instance.
        }


        // Method to check if a given point (x, y) is within these bounds.
        Bounds.prototype.contains = function ( x, y )
        {
            // Check if x is between left and right, AND y is between top and bottom.
            return ( this.left < x && x < this.right ) && ( this.top < y && y < this.bottom );
        };


        return Bounds; // Return the Bounds class.

    } ) ( );


    /*
     * Snipe Class Definition
     * Main class for the image zoom functionality.
     */
    Snipe = ( function ( )
    {

        // Constructor for the Snipe class.
        function Snipe ( el, settings )
        {
            var _this = this; // Store reference to 'this' for use in callbacks.

            this.el = el;     // The jQuery element on which Snipe is initialized.

            // Ensure settings object is not null.
            if ( settings == null ) {
                settings = { };
            }

            this.body       = $( 'body' );           // Reference to the document body.
            this.defaults   = defaultsSettings;      // Use the predefined default settings.

            // Process and merge user settings with defaults and forced settings.
            this.makeSettings( settings );

            // Bind a 'load' event handler to the element to calculate bounds after image loads.
            this.el.one( 'load', function ( )
            {
                return _this.makeBounds( ); // Calculate element bounds.
            } ).each( function ( )
            {
                // Trigger load event if the image is already complete (cached).
                if ( this.complete ) {
                    return $( this ).load( );
                }
            } );

            this.el.data( 'snipe', this ); // Store the Snipe instance on the element's data.

            // Create the lens element, add its class, hide it, and append to body.
            this.lens = $( '<div>' ).addClass( this.settings[ "class" ] ).css( 'display', 'none' ).appendTo( 'body' );

            this.ratioX = 1; // Initialize X-axis ratio for background positioning.
            this.ratioY = 1; // Initialize Y-axis ratio for background positioning.

            // Create a temporary image element to get the full size of the zoom image.
            this.ratioEl = $( '<img>' ).attr( 'src', this.settings.image );

            // Bind 'load' to the ratio element to calculate zoom ratios.
            this.ratioEl.one( 'load', function ( )
            {
                return _this.calculateRatio.call( _this ); // Calculate ratios.
            } ).each( function ( )
            {
                // Trigger load if image is already complete.
                if ( this.complete ) {
                    return $( this ).load( );
                }
            } );

            // Bind mousemove event to the main element to track cursor position.
            this.el.bind( 'mousemove', function ( e )
            {
                return _this.onMouseMove( e ); // Handle mouse movement.
            } );

            return this.el; // Return the original element.
        }


        // Method to process and merge settings.
        Snipe.prototype.makeSettings = function ( settings )
        {
            var img; // Variable to hold the actual image element.

            // Determine the image source based on whether the element is an anchor or an image.
            if ( this.el.is( 'a' ) ) {
                img = this.el.find( 'img:first' ); // Find the first image within the anchor.
                this.defaults.image = settings.image || this.el.attr( 'href' ); // Use href as zoom image.
            } else {
                img = this.el.is( 'img' ) ? this.el : this.el.find( 'img:first' ); // If not img, find first img.
                this.defaults.image = settings.image || this.el.data( 'zoom' ) || this.el.attr( 'src' ); // Use data-zoom or src.
            }

            this.el = img; // Update this.el to be the actual image element.

            // Set the background image for the lens using the determined zoom image.
            this.defaults.css.backgroundImage = "url(" + this.defaults.image + ")";

            // Set the cursor for the lens, prioritizing user settings.
            this.defaults.css.cursor = settings.cursor || this.defaults.cursor;

            // Merge default, user, and forced settings.
            this.settings = $.extend( { }, this.defaults, settings, forceSettings );

            // Merge CSS settings specifically, allowing user CSS to override defaults but forced to override all.
            return this.settings.css = $.extend( { }, this.defaults.css, settings && settings.css, forceSettings.css );
        };


        // Method to calculate the boundaries of the main image element.
        Snipe.prototype.makeBounds = function ( )
        {
            this.offset = this.el.offset( ); // Get the position of the element.

            // Create a new Bounds object based on the element's position and dimensions.
            return this.bounds = new Bounds(
                this.offset.top,
                this.offset.left + this.el.width( ),
                this.offset.top + this.el.height( ),
                this.offset.left
            );
        };


        // Initial run method, essentially hiding the lens until interaction.
        Snipe.prototype.run = function ( )
        {
            return this.hide( ); // Hide the lens by default.
        };


        // Calculates the ratio between the full-size zoom image and the display image.
        Snipe.prototype.calculateRatio = function ( )
        {
            // Calculate ratio for X-axis.
            this.ratioX = this.ratioEl[ 0 ].width / this.el[ 0 ].width;
            // Calculate ratio for Y-axis.
            this.ratioY = this.ratioEl[ 0 ].height / this.el[ 0 ].height;

            this.ratioEl.remove( ); // Remove the temporary ratio calculation image.

            this.lens.css( this.settings.css ); // Apply final CSS settings to the lens.

            return this.run( ); // Start the plugin's interaction logic.
        };


        // Handles mouse movement events.
        Snipe.prototype.onMouseMove = function ( e )
        {
            var backgroundX, backgroundY; // Variables for background position.

            // If bounds are not set or lens is animating, do nothing.
            if ( ! ( this.bounds != null ) && this.lens.not( ':animated' ) ) {
                return;
            } else {
                // If mouse moves out of bounds, hide the lens.
                if ( ! this.bounds.contains( e.pageX, e.pageY ) ) {
                    this.hide( );
                }
            }

            // Calculate background position for the zoomed image within the lens.
            backgroundX = -( ( e.pageX - this.offset.left ) * this.ratioX - this.settings.size * .5 );
            backgroundY = -( ( e.pageY - this.offset.top ) * this.ratioY - this.settings.size * .5 );

            // Update the lens's position and background position.
            return this.lens.css( {
                left             : e.pageX - this.settings.size * .5,
                top              : e.pageY - this.settings.size * .5,
                backgroundPosition : "" + backgroundX + "px " + backgroundY + "px"
            } );
        };


        /*
         * Public API Methods for Snipe instances.
         */


        // Displays the zoom lens.
        Snipe.prototype.show = function ( animation )
        {
            var _this = this; // Store 'this' context.

            // Default animation to true if not provided.
            if ( animation == null ) {
                animation = true;
            }

            this.makeBounds( ); // Recalculate bounds in case element moved.

            // Unbind mousemove and mouseover from the original element to prevent conflicts.
            this.el.unbind( 'mousemove' );
            this.el.unbind( 'mouseover' );

            // Bind mousemove to the body to track mouse globally for lens positioning.
            this.body.bind( 'mousemove', function ( e )
            {
                return _this.onMouseMove( e ); // Handle mouse movement.
            } );

            // Show the lens, set opacity, and apply cursor style.
            this.lens.show( ).css( {
                opacity : 1,
                cursor  : this.settings.css.cursor
            } );

            return this; // Allow method chaining.
        };


        // Hides the zoom lens.
        Snipe.prototype.hide = function ( animation )
        {
            var _this = this; // Store 'this' context.

            // Default animation to true if not provided.
            if ( animation == null ) {
                animation = true;
            }

            // Bind mouseover to the original element to re-show the lens on re-entry.
            this.el.bind( 'mouseover', function ( e )
            {
                return _this.show( ); // Show the lens.
            } );

            this.body.unbind( 'mousemove' ); // Unbind global mousemove from the body.

            // Hide the lens, set opacity to 0, and revert cursor.
            this.lens.css( {
                opacity : 0,
                cursor  : 'default'
            } ).hide( );

            return this; // Allow method chaining.
        };


        return Snipe; // Return the Snipe class.

    } ) ( );


    /*
     * jQuery Plugin Integration
     * This section extends jQuery's prototype to allow `$.fn.snipe()` calls.
     */
    ( function ( $ )
    {
        // Define the `snipe` plugin method.
        return $.fn.snipe = function ( settings )
        {
            // Iterate over each matched element in the jQuery collection.
            return this.each( function ( )
            {
                // Initialize Snipe if not already initialized on this element, otherwise return existing instance.
                return $( this ).data( 'snipe' ) || new Snipe( $( this ), settings );
            } );
        };
    } ) ( jQuery );


} ).call( this ); // Immediately invoke the function, setting 'this' to the global object.