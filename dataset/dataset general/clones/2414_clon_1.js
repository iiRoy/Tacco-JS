/*
 * This is a Type I clone of the original Fullscreener JavaScript plugin.
 *
 * This version maintains complete logical and structural identity with the
 * source code. The only modifications are to whitespace (indentation,
 * spacing, line breaks) and comments.
 *
 * All variable names, function names, operators, and expressions are
 * preserved exactly as they appeared in the original.
 *
 * The purpose of this clone is to demonstrate Type I code similarity,
 * where superficial textual differences (like formatting and commenting)
 * do not alter the underlying functionality or execution flow.
 *
 * Author: A skilled code cloner
 * Date: 2023-10-27
 * Version: 1.0.0 (Type I Clone)
 */

; ( function ( factory ) {

    // Check for AMD loader (e.g., RequireJS)
    if ( typeof define === 'function' && define.amd ) {

        // AMD. Register as an anonymous module.
        define( [ 'jquery' ] , factory ) ;

    } else {

        // Browser globals
        factory( jQuery ) ;
    }

} ( function ( $ ) {

    // Ensure strict mode for better code quality and error handling.
    'use strict' ;

    // --- Core Variables and Configuration ---

    // Global jQuery-wrapped DOM elements for efficiency.
    // @type { jQuery }
    var $doc = $( document ) ;

    // @type { jQuery }
    var $win = $( window ) ;


    // CSS class names used by the plugin.
    // These are standardized to avoid magic strings throughout the code.
    // @type { Object.<string, string> }
    var classes = {
        container : 'fsr-container' , // Class for the container element.
        image     : 'fsr-image'     , // Class for the image element.
        hidden    : 'fsr-hidden'      // Class to hide elements (e.g., original image).
    } ;


    // Default configuration settings for the Fullscreener plugin.
    // These can be overridden by user-provided options.
    // @type { Object }
    var defaults = {
        useCSS          : true    , // Whether to use CSS background-size for resizing.
        container       : 'parent', // The container for the image: 'parent' or a jQuery object.
        position        : {         // Default image positioning.
            x : 'center' ,          // Horizontal position.
            y : 'center'            // Vertical position.
        } ,
        throttleTimeout : 100       // Timeout for throttling resize events (in ms).
    } ;


    // Feature detection for 'background-size' CSS property.
    // This determines if CSS-based resizing can be used.
    // @type { Boolean }
    var backgroundSize = 'backgroundSize' in document.createElement( 'div' ).style ;


    // --- Fullscreener Constructor ---

    // Creates a new instance of the Fullscreener plugin.
    // @constructor
    // @param  { DOM Element } image   - The raw DOM image element to make fullscreen.
    // @param  { Object }      options - User-defined options to override defaults.
    // @return { void }
    var Fullscreener = function ( image , options ) {

        // Store the original image DOM element.
        this.image = image ;

        // Store the jQuery-wrapped image element.
        this.$image = $( image ) ;

        // Merge default settings with user-provided options.
        this.settings = $.extend( {} , defaults , options ) ;

        // Internal parameters for calculations.
        this.params = {
            image     : {
                width  : null , // Original image width.
                height : null   // Original image height.
            } ,
            container : {
                width  : null , // Container width.
                height : null   // Container height.
            } ,
            ratios    : {
                image     : null , // Aspect ratio of the image.
                container : null   // Aspect ratio of the container.
            }
        } ;

        // Determine the container element based on settings.
        if ( this.settings.container === 'parent' ) {
            this.$container = this.$image.parent() ;
        }
        // If it's a jQuery object and not empty.
        else if ( this.settings.container instanceof jQuery && this.settings.container.length ) {
            this.$container = this.settings.container ;
        }
        // Invalid container setting.
        else {
            this.log( 'The container is missing.' ) ;
            return ; // Exit constructor if container is invalid.
        }

        // Generate a unique ID for this instance (used for event namespacing).
        this.id = this.uuid() ;

        // Initialize the plugin logic.
        this.init() ;

    } ;


    // Shortcut to the prototype for easier method definition.
    Fullscreener.fn = Fullscreener.prototype ;


    // --- Fullscreener Prototype Methods ---

    // Initializes the plugin's core logic and sets up.
    // @return { void }
    Fullscreener.fn.init = function () {

        // Add specific classes to the image and container elements.
        this.$image.addClass( classes.image ) ;
        this.$container.addClass( classes.container ) ;

        // Determine the method for resizing based on browser support and settings.
        if ( backgroundSize && this.settings.useCSS ) {
            // Use CSS background-size if supported and enabled.
            this.setBackground() ;
        }
        else if ( ! backgroundSize || ! this.settings.useCSS ) {
            // Fallback to JS resizing if CSS is not supported or disabled.
            this.listen() ; // Set up event listeners for resize.
            this.resize() ; // Perform an initial resize.
        }
        else {
            // If neither method is applicable (shouldn't happen with current logic).
            this.log( 'No resize method.' ) ;
            return ;
        }

    } ;


    // Sets the image as a background for its container using CSS properties.
    // This is used when `background-size` is supported and `useCSS` is true.
    // @return { void }
    Fullscreener.fn.setBackground = function () {

        var $image     = this.$image ;
        var $container = this.$container ;
        var pos        = this.settings.position ;

        // Hide the original image element.
        $image.addClass( classes.hidden ) ;

        // Apply background styles to the container.
        $container.css( {
            'background-image'    : 'url(' + $image[ 0 ].src + ')' ,
            'background-position' : pos.x + ' ' + pos.y
        } ) ;

    } ;


    // Adds event listeners for window resize and orientation change events.
    // Events are namespaced with the instance's unique ID to prevent conflicts.
    // @return { void }
    Fullscreener.fn.listen = function () {

        var _this = this ; // Cache 'this' for use inside the throttled function.

        $win.on( 'resize.' + this.id + ' orientationchange.' + this.id ,
            this.throttle( function () {
                _this.resize() ;
            } , this.settings.throttleTimeout )
        ) ;

    } ;


    // Triggers the calculation of ratios and updates the image position/size.
    // This is the main entry point for responsive adjustments.
    // @return { void }
    Fullscreener.fn.resize = function () {
        this.calcRatios() ; // Calculate current ratios.
        this.update() ;     // Apply changes.
    } ;


    // Calculates the aspect ratios of both the image and its container.
    // Image ratio is calculated only once.
    // @return { void }
    Fullscreener.fn.calcRatios = function () {

        var $image          = this.$image ;
        var $container      = this.$container ;
        var params          = this.params ;

        var imageWidth , imageHeight , containerWidth , containerHeight ;

        // Calculate the image ratio only on the first run.
        if ( ! params.ratios.image ) {

            // Check if width and height attributes are present on the image.
            if ( ! $image.attr( 'width' ) || ! $image.attr( 'height' ) ) {
                this.log( 'The image should have width/height attributes.' ) ;
                return ;
            }

            // Parse image dimensions from attributes.
            imageWidth  = parseInt( $image.attr( 'width' ) , 10 ) ;
            imageHeight = parseInt( $image.attr( 'height' ) , 10 ) ;

            // Store image ratio and dimensions.
            params.ratios.image = imageHeight / imageWidth ;
            params.image.width  = imageWidth ;
            params.image.height = imageHeight ;

        }

        // Get current container dimensions.
        containerWidth  = $container.width() ;
        containerHeight = $container.height() ;

        // Store container ratio and dimensions.
        params.ratios.container = containerHeight / containerWidth ;
        params.container.width  = containerWidth ;
        params.container.height = containerHeight ;

    } ;


    // Updates the image's CSS properties (width, height, top, left)
    // when CSS background-size is not used or supported.
    // @return { void }
    Fullscreener.fn.update = function () {

        var $image        = this.$image ;
        var ratios        = this.params.ratios ;
        var containerDims = this.params.container ;
        var config        = this.settings ;

        // Object to hold new CSS properties for the image.
        var props = {
            width  : 0    ,
            height : 0    ,
            top    : 'auto' ,
            right  : 'auto' ,
            bottom : 'auto' ,
            left   : 'auto'
        } ;

        // Calculate the new image dimensions to cover the container.
        if ( ratios.image < ratios.container ) {
            // Image is "taller" relative to its width than the container.
            // Fit by container height, then scale width.
            props.width  = containerDims.height / ratios.image ;
            props.height = containerDims.height ;
        } else {
            // Image is "wider" relative to its height than the container.
            // Fit by container width, then scale height.
            props.width  = containerDims.width ;
            props.height = containerDims.width * ratios.image ;
        }

        // Calculate the vertical position based on settings.
        switch ( config.position.y ) {
            case 'top' :
                props.top = 0 ;
                break ;

            case 'bottom' :
                props.bottom = 0 ;
                break ;

            case 'center' :
                props.top = ( containerDims.height - props.height ) / 2 ;
                break ;

            default :
                this.log( 'The vertical position cannot be calculated.' ) ;
                return ;
        }

        // Calculate the horizontal position based on settings.
        switch ( config.position.x ) {
            case 'left' :
                props.left = 0 ;
                break ;

            case 'right' :
                props.right = 0 ;
                break ;

            case 'center' :
                props.left = ( containerDims.width - props.width ) / 2 ;
                break ;

            default :
                this.log( 'The horizontal position cannot be calculated.' ) ;
                return ;
        }

        // Apply the calculated CSS properties to the image.
        $image.css( props ) ;

    } ;


    // Destroys the current instance of the plugin, cleaning up DOM and event listeners.
    // @return { void }
    Fullscreener.fn.destroy = function () {

        var $image     = this.$image ;
        var $container = this.$container ;

        // Remove plugin-specific classes and inline styles from the image.
        $image
            .removeClass( classes.hidden )
            .removeClass( classes.image )
            .removeAttr( 'style' ) ;

        // Remove plugin-specific classes and inline styles from the container.
        $container
            .removeClass( classes.container )
            .removeAttr( 'style' ) ;

        // Remove all event listeners namespaced to this instance.
        $win.off( 'resize.' + this.id + ' orientationchange.' + this.id ) ;

        // Remove the plugin data associated with the image element.
        $image.removeData( 'fullscreener' ) ;

    } ;


    // Returns a throttled version of the provided function.
    // This limits how often a function can be called over a given time period.
    // Implementation based on Underscore.js throttle.
    // @param  { Function } func    - The function to throttle.
    // @param  { Number }   wait    - The timeout duration in milliseconds.
    // @param  { Object }   options - Optional settings: `{leading: false}` to disable leading edge call.
    // @return { Function }         - The throttled function.
    Fullscreener.fn.throttle = function ( func , wait , options ) {

        var timeout  = null ;
        var previous = 0 ;
        var options  = options || {} ;

        var context , args , result ;

        // Function executed after the timeout.
        function later () {
            previous = options.leading == false ? 0 : new Date ;
            timeout  = null ;
            result   = func.apply( context , args ) ;
        }

        // The returned throttled function.
        return function () {

            var now = new Date ;
            var remaining ;

            // Set previous to 'now' if leading edge execution is disabled and it's the first call.
            if ( ! previous && options.leading == false ) {
                previous = now ;
            }

            // Calculate remaining time until the next execution is allowed.
            remaining = wait - ( now - previous ) ;
            context   = this ;
            args      = arguments ;

            // If remaining time is less than or equal to 0, execute immediately.
            if ( remaining <= 0 ) {
                clearTimeout( timeout ) ; // Clear any pending timeout.

                timeout  = null ;
                previous = now ;
                result   = func.apply( context , args ) ;
            }
            // Otherwise, set a timeout to execute later if no timeout is pending
            // and leading edge execution is not disabled.
            else {
                if ( ! timeout && options.leading != false ) {
                    timeout = setTimeout( later , remaining ) ;
                }
            }

            return result ;

        } ;

    } ;


    // Generates a unique ID string for plugin instances.
    // Uses a prefix 'fsr' followed by a timestamp.
    // @return { String } - A unique identifier.
    Fullscreener.fn.uuid = function () {
        return 'fsr' + parseInt( new Date().getTime() / 1000 , 10 ) ;
    } ;


    // Provides a simple logging mechanism for error notifications.
    // @param  { String } message - The error message to display.
    // @return { void }
    Fullscreener.fn.log = function ( message ) {
        alert( 'Fullscreener ' + message ) ;
    } ;


    // --- jQuery Plugin Registration ---

    // Registers the Fullscreener plugin with jQuery.
    // Allows calling `$( 'img' ).fullscreener( options );`
    // @param { Object | String } args - Options object or method name ('destroy', etc.).
    // @return { jQuery Object } - The original jQuery object for chaining.
    $.fn.fullscreener = function ( args ) {

        return this.each( function () {

            var $image   = $( this ) ;
            var instance = $image.data( 'fullscreener' ) ; // Get existing instance.

            // If no instance exists for this element.
            if ( ! instance ) {
                // If arguments are not a string (i.e., an options object).
                if ( typeof args !== 'string' ) {
                    // Create a new instance and store it on the element's data.
                    $image.data( 'fullscreener' , new Fullscreener( this , args ) ) ;
                }
            }
            // If an instance already exists.
            else {
                // If arguments are a string (i.e., a method call).
                if ( typeof args === 'string' ) {
                    // Check if the method exists on the instance.
                    if ( instance[ args ] ) {
                        instance[ args ]() ; // Call the method.
                    } else {
                        // Log an error if the method is not found.
                        Fullscreener.fn.log( 'No valid method.' ) ;
                    }
                }
            }

        } ) ;

    } ;

} ) ) ;