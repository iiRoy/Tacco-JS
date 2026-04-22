+ function ( $ ) { /* Enforce strict mode for cleaner code and better error handling */ "use strict" ;

    /*
     * LIGHTBOX CLASS DEFINITION
     * =========================================
     * Defines the core Lightbox functionality.
     * This class manages the state and behavior of a lightbox instance.
     */

    var Lightbox = function ( element , options )
    {
        // Initialize instance properties with provided options and element data.
        this.options    = options ;
        this.$element   = $( element ) ;
        this.$backdrop  = null ; // Reference to the backdrop DOM element.
        this.isShown    = null ; // Boolean indicating if the lightbox is currently visible.

        // If a remote URL is provided in options, load its content into the lightbox element.
        if ( this.options.remote ) { this.$element.load( this.options.remote ) ; }
    } ;

    // We depend upon Twitter Bootstrap's Modal library to simplify things here.
    // Extend Lightbox's prototype with Bootstrap's Modal constructor prototype for shared methods.
    Lightbox.prototype = $.extend( { } , $.fn.modal.Constructor.prototype ) ;

    // Ensure the constructor property points back to the Lightbox class itself.
    Lightbox.prototype.constructor = Lightbox ;

    // Default options for the Lightbox instance. These can be overridden by data attributes or explicit options.
    Lightbox.DEFAULTS = {
        backdrop : true , // Show a backdrop element behind the lightbox (true, false, or 'static').
        keyboard : true , // Allow keyboard interaction (e.g., ESC key to close the lightbox).
        show     : true   // Automatically show the lightbox when it is initialized.
    } ;

    /**
     * Displays the lightbox.
     *
     * @param {HTMLElement} _relatedTarget - The element that triggered the lightbox to show.
     */
    Lightbox.prototype.show = function ( _relatedTarget )
    {
        var that = this ; // Cache 'this' (the Lightbox instance) for use in nested functions and callbacks.
        // Create a custom jQuery event for 'show.bs.lightbox'.
        var e    = $.Event( 'show.bs.lightbox' , { relatedTarget : _relatedTarget } ) ;

        this.$element.trigger( e ) ; // Trigger the 'show' event on the lightbox element.

        // If the lightbox is already shown or the default action of the event was prevented,
        // then gracefully exit without proceeding to show.
        if ( this.isShown || e.isDefaultPrevented( ) ) {
            return ;
        }

        this.isShown = true ; // Update the internal state to reflect that the lightbox is now shown.

        this.escape( ) ; // Initialize or enable keyboard escape functionality (e.g., ESC key to hide).

        // Attach a click event handler to dismiss buttons within the lightbox.
        // Using $.proxy to ensure 'this' context is correctly maintained in the hide method.
        this.$element.on( 'click.dismiss.lightbox' , '[data-dismiss="lightbox"]' , $.proxy( this.hide , this ) ) ;

        /*
         * This crucial bit of logic is added to ensure we don't display the lightbox
         * until its content (especially images) has been preloaded and sized.
         * This effectively prevents any visual "jumping" or reflow issues when the content loads.
         */
        this.preloadSize( function ( )
        {
            that.backdrop( function ( )
            {
                // Determine if CSS transitions are supported by the browser and if the lightbox has the 'fade' class.
                var transition = $.support.transition && that.$element.hasClass( 'fade' ) ;

                // If the lightbox element is not currently a child of any parent, append it to the document body.
                // This ensures it's always in a consistent DOM position and z-index context.
                if ( !that.$element.parent( ).length )
                {
                    that.$element.appendTo( document.body ) ; // Append to body to prevent unintended DOM repositioning.
                }

                that.$element.show( ) ; // Make the main lightbox element visible.

                // If transitions are enabled, force a browser reflow.
                // This ensures that the browser calculates layout before applying the 'in' class,
                // allowing CSS transitions to correctly animate from the initial state.
                if ( transition )
                {
                    that.$element[ 0 ].offsetWidth ; // Trigger browser reflow by accessing an offset property.
                }

                // Add the 'in' class to trigger any CSS fade-in animations
                // and set the ARIA attribute for accessibility.
                that.$element
                    .addClass( 'in' )
                    .attr( 'aria-hidden' , false ) ;

                that.enforceFocus( ) ; // Activate focus management to keep keyboard focus within the lightbox.

                // Create a new custom jQuery event for 'shown.bs.lightbox'.
                var e = $.Event( 'shown.bs.lightbox' , { relatedTarget : _relatedTarget } ) ;

                // If transitions are active, wait for the lightbox dialog to complete its slide-in animation.
                transition
                    ? that.$element.find( '.lightbox-dialog' ) // Target the specific dialog element for transition end.
                        .one( $.support.transition.end , function ( )
                        {
                            that.$element.focus( ).trigger( e ) ; // Focus the lightbox and then trigger the 'shown' event.
                        } )
                        .emulateTransitionEnd( 300 ) // Provide a fallback for transition end, in case it doesn't fire.
                    : that.$element.focus( ).trigger( e ) ; // If no transition, focus and trigger the event immediately.
            } ) ; // End of backdrop callback function.
        } ) ; // End of preloadSize callback function.
    } ;

    /**
     * Hides the lightbox.
     *
     * @param {Event} e - The event object that triggered the hide action (optional).
     * @param {boolean} slide - A flag indicating if the hide is part of a slide transition.
     */
    Lightbox.prototype.hide = function ( e , slide )
    {
        // Prevent the default action of the event if an event object is provided.
        if ( e ) { e.preventDefault( ) ; }

        // Create a new custom jQuery event for 'hide.bs.lightbox'.
        e = $.Event( 'hide.bs.lightbox' ) ;

        this.$element.trigger( e ) ; // Trigger the 'hide' event on the lightbox element.

        // If the lightbox is not shown or the default action of the event was prevented,
        // then gracefully exit without proceeding to hide.
        if ( !this.isShown || e.isDefaultPrevented( ) ) { return ; }

        this.isShown = false ; // Update the internal state to reflect that the lightbox is now hidden.

        this.escape( ) ; // Disable keyboard escape functionality.

        // Remove the global 'focusin' event handler to stop trapping focus.
        $( document ).off( 'focusin.bs.lightbox' ) ;

        // Remove the 'in' class (for fade-out animation), set ARIA attribute for accessibility,
        // and remove any click handlers for dismiss buttons.
        this.$element
            .removeClass( 'in' )
            .attr( 'aria-hidden' , true )
            .off( 'click.dismiss.lightbox' ) ;

        // Check for transition support and the 'fade' class to determine if an animated hide is needed.
        $.support.transition && this.$element.hasClass( 'fade' )
            ? this.$element
                .one( $.support.transition.end , $.proxy( this.hideModal( slide ) , this ) ) // Wait for the CSS transition to complete.
                .emulateTransitionEnd( 300 ) // Provide a fallback for transition end.
            : this.hideModal( slide ) ; // If no transition, hide the modal immediately.
    } ;

    /**
     * Enforces focus within the lightbox.
     * This prevents users from tabbing out of the lightbox while it's active.
     */
    Lightbox.prototype.enforceFocus = function ( )
    {
        $( document )
            .off( 'focusin.bs.lightbox' ) // First, remove any existing focusin handlers to prevent infinite loops or duplicates.
            .on( 'focusin.bs.lightbox' , $.proxy( function ( e )
            {
                // If the currently focused element is not the lightbox itself AND is not a child of the lightbox,
                // then refocus the lightbox to keep keyboard navigation contained.
                if ( this.$element[ 0 ] !== e.target && !this.$element.has( e.target ).length )
                {
                    this.$element.focus( ) ; // Direct the focus back to the lightbox element.
                }
            } , this ) ) ;
    } ;

    /**
     * Manages the keyboard escape (ESC key) functionality for closing the lightbox.
     */
    Lightbox.prototype.escape = function ( )
    {
        // If the lightbox is currently shown and the 'keyboard' option is enabled.
        if ( this.isShown && this.options.keyboard )
        {
            // Attach a keyup event listener to the lightbox element.
            this.$element.on( 'keyup.dismiss.bs.lightbox' , $.proxy( function ( e )
            {
                // If the key pressed is the ESC key (keyCode 27), call the hide method.
                e.which == 27 && this.hide( ) ;
            } , this ) ) ;
        }
        else if ( !this.isShown ) // If the lightbox is not shown.
        {
            // Remove any previously attached keyup event handlers for dismissal to clean up.
            this.$element.off( 'keyup.dismiss.bs.lightbox' ) ;
        }
    } ;

    /**
     * Performs the final steps of hiding the modal content and backdrop.
     *
     * @param {boolean} slide - A flag indicating if the hide is part of a slide transition.
     */
    Lightbox.prototype.hideModal = function ( slide )
    {
        var that = this ; // Store context for use in the backdrop callback.

        this.$element.hide( ) ; // Immediately hide the main lightbox element from view.

        // Call the backdrop method to handle the removal of the backdrop, providing a callback.
        this.backdrop( function ( )
        {
            that.removeBackdrop( ) ; // Remove the backdrop element from the DOM.

            // Only trigger the 'hidden' event if this hide operation is NOT part of a slide transition.
            // This prevents premature event firing when navigating between multiple lightboxes.
            if ( !slide ) { that.$element.trigger( 'hidden.bs.lightbox' ) ; }
        } ) ;
    } ;

    /**
     * Handles the creation, display, and removal of the lightbox backdrop.
     *
     * @param {Function} callback - A function to execute after the backdrop has been handled.
     */
    Lightbox.prototype.backdrop = function ( callback )
    {
        var that    = this ; // Store reference to the Lightbox instance.
        // Determine if a fade animation should be applied to the backdrop based on the lightbox's classes.
        var animate = this.$element.hasClass( 'fade' ) ? 'fade' : '' ;

        // Scenario 1: The lightbox is currently shown AND the backdrop option is enabled.
        if ( this.isShown && this.options.backdrop )
        {
            var doAnimate = $.support.transition && animate ; // Check if animation is supported and desired.

            // Create the backdrop element with appropriate classes and append it to the document body.
            this.$backdrop = $( '<div class="modal-backdrop ' + animate + '" />' )
                .appendTo( document.body ) ;

            // Attach a click handler to the lightbox element to manage backdrop interaction.
            this.$element.on( 'click.dismiss.lightbox' , $.proxy( function ( e )
            {
                // Ensure the click originated directly on the lightbox element, not from a child.
                if ( e.target !== e.currentTarget ) { return ; }
                // If the backdrop is 'static', refocus the lightbox; otherwise, hide the lightbox.
                this.options.backdrop == 'static'
                    ? this.$element[ 0 ].focus.call( this.$element[ 0 ] )
                    : this.hide.call( this ) ;
            } , this ) ) ;

            // Force browser reflow if animation is active, to correctly apply CSS transitions.
            if ( doAnimate ) { this.$backdrop[ 0 ].offsetWidth ; } // Trigger reflow.

            this.$backdrop.addClass( 'in' ) ; // Add the 'in' class to trigger the fade-in animation.

            if ( !callback ) { return ; } // If no callback is provided, we can stop here.

            // If animating, wait for the transition to complete before executing the callback;
            // otherwise, execute the callback immediately.
            doAnimate
                ? this.$backdrop
                    .one( $.support.transition.end , callback ) // Execute callback after transition ends.
                    .emulateTransitionEnd( 150 ) // Fallback for browsers that might not fire transition end.
                : callback( ) ;

        }
        // Scenario 2: The lightbox is hidden, but a backdrop element currently exists from a previous showing.
        else if ( !this.isShown && this.$backdrop )
        {
            this.$backdrop.removeClass( 'in' ) ; // Remove the 'in' class to trigger the fade-out animation.

            // If animating, wait for the transition to complete before executing the callback;
            // otherwise, execute the callback immediately.
            $.support.transition && this.$element.hasClass( 'fade' )
                ? this.$backdrop
                    .one( $.support.transition.end , callback )
                    .emulateTransitionEnd( 150 )
                : callback( ) ;

        }
        // Scenario 3: No backdrop is involved (either not shown or option is false), but a callback was provided.
        else if ( callback )
        {
            callback( ) ; // Execute the callback directly.
        }
    } ;

    /**
     * Removes the backdrop element from the DOM.
     * This method is called after the backdrop has faded out.
     */
    Lightbox.prototype.removeBackdrop = function ( )
    {
        this.$backdrop && this.$backdrop.remove( ) ; // If a backdrop exists, remove it.
        this.$backdrop = null ; // Clear the reference.
    } ;

    /**
     * Preloads image content and calculates appropriate dimensions for the lightbox
     * to prevent visual "jumping" when the lightbox is displayed.
     *
     * @param {Function} callback - A function to execute once sizing is complete.
     */
    Lightbox.prototype.preloadSize = function ( callback )
    {
        // Initialize a jQuery Callbacks object to manage post-sizing actions.
        var callbacks = $.Callbacks( ) ;
        if ( callback ) { callbacks.add( callback ) ; } // Add the provided callback if it exists.

        var that = this ; // Store reference to the Lightbox instance for use in nested scopes.

        // Declare variables for dimensions and elements.
        var windowHeight     ,
            windowWidth      ,
            padTop           ,
            padBottom        ,
            padLeft          ,
            padRight         ,
            $image           ,
            preloader        ,
            originalWidth    ,
            originalHeight   ;

        // --- Step 1: Gather viewport dimensions ---
        windowHeight = $( window ).height( ) ; // Get current height of the browser window.
        windowWidth  = $( window ).width( ) ;  // Get current width of the browser window.

        // --- Step 2: Retrieve padding values from the lightbox content area ---
        // These paddings will be factored into the total size calculations.
        padTop    = parseInt( that.$element.find( '.lightbox-content' ).css( 'padding-top' )    , 10 ) ;
        padBottom = parseInt( that.$element.find( '.lightbox-content' ).css( 'padding-bottom' ) , 10 ) ;
        padLeft   = parseInt( that.$element.find( '.lightbox-content' ).css( 'padding-left' )   , 10 ) ;
        padRight  = parseInt( that.$element.find( '.lightbox-content' ).css( 'padding-right' )  , 10 ) ;

        // --- Step 3: Load the target image to get its natural dimensions ---
        // Find the first image within the lightbox content.
        $image    = that.$element.find( '.lightbox-content' ).find( 'img:first' ) ;

        // If no image element is found, there's nothing to preload or size;
        // fire callbacks immediately and exit.
        if ( $image.length <= 0 ) { return callbacks.fire( ) ; }

        preloader = new Image( ) ; // Create a new Image object; this will trigger image loading.

        // Define the onload handler for the preloader. This function executes
        // only once the image is fully loaded and its natural dimensions are available.
        preloader.onload = function ( )
        {
            // The image content might be larger than the available window space.
            // We need to scale it down proportionally if it exceeds the viewport boundaries.

            // Check if the image's width (including horizontal padding) exceeds the window width.
            if ( ( preloader.width + padLeft + padRight ) >= windowWidth )
            {
                originalWidth  = preloader.width ;  // Store original dimensions for aspect ratio calculation.
                originalHeight = preloader.height ;
                preloader.width  = windowWidth - padLeft - padRight ; // Adjust width to fit within window.
                preloader.height = originalHeight / originalWidth * preloader.width ; // Maintain aspect ratio.
            }

            // Check if the image's height (including vertical padding) exceeds the window height.
            // This check uses potentially adjusted 'preloader.width'/'preloader.height' from the previous step.
            if ( ( preloader.height + padTop + padBottom ) >= windowHeight )
            {
                originalWidth  = preloader.width ;  // Re-store (potentially adjusted) dimensions.
                originalHeight = preloader.height ;
                preloader.height = windowHeight - padTop - padBottom ; // Adjust height to fit within window.
                preloader.width  = originalWidth / originalHeight * preloader.height ; // Maintain aspect ratio.
            }

            // --- Step 4: Apply calculated dimensions and positioning to lightbox elements ---
            // Set CSS properties for the lightbox dialog, including fixed positioning and centering.
            that.$element.find( '.lightbox-dialog' ).css( {
                'position'    : 'fixed' , // Use fixed positioning relative to the viewport.
                'width'       : preloader.width + padLeft + padRight , // Calculated total width.
                'height'      : preloader.height + padTop + padBottom , // Calculated total height.
                'top'         : ( windowHeight / 2 ) - ( ( preloader.height + padTop + padBottom ) / 2 ) , // Vertically center the dialog.
                'left'        : '50%' , // Position from the left for horizontal centering.
                'margin-left' : -1 * ( preloader.width + padLeft + padRight ) / 2 // Offset by half its width for true horizontal centering.
            } ) ;

            // Apply calculated dimensions to the inner lightbox content area.
            that.$element.find( '.lightbox-content' ).css( {
                'width'  : preloader.width + padLeft + padRight ,
                'height' : preloader.height + padTop + padBottom
            } ) ;

            // Apply the final scaled dimensions directly to the image itself.
            $image.css( {
                'width'  : preloader.width ,
                'height' : preloader.height
            } ) ;

            // All sizing calculations and CSS applications are now complete.
            callbacks.fire( ) ; // Trigger all registered callbacks to proceed with showing the lightbox.
        } ;

        preloader.src = $image.attr( 'src' ) ; // Set the source of the preloader image to begin loading.
    } ;

    /**
     * Handles sliding between multiple lightboxes (e.g., for galleries).
     *
     * @param {string} direction - The direction to slide ('next' or 'prev').
     */
    Lightbox.prototype.slide = function ( direction )
    {
        var that = this ; // Capture the current Lightbox instance context.

        that.hide( that.event , true ) ; // Hide the current lightbox, indicating it's part of a slide transition.

        // Check if we are trying to navigate to the 'next' lightbox in the DOM.
        if ( direction == 'next' && that.$element.next( '.lightbox' ).length )
        {
            that.$element.next( '.lightbox' ).lightbox( 'show' ) ; // Initialize and show the next lightbox.
        }
        // Check if we are trying to navigate to the 'prev' (previous) lightbox in the DOM.
        else if ( direction == 'prev' && that.$element.prev( '.lightbox' ).length )
        {
            that.$element.prev( '.lightbox' ).lightbox( 'show' ) ; // Initialize and show the previous lightbox.
        }
        else
        {
            // If no next or previous lightbox is found, the sliding sequence has ended.
            // Trigger the 'hidden' event to signify that the lightbox is no longer active.
            that.$element.trigger( 'hidden.bs.lightbox' ) ;
        }
    } ;


    /*
     * LIGHTBOX PLUGIN DEFINITION
     * =========================================
     * jQuery plugin integration for Lightbox,
     * allowing it to be used with $('selector').lightbox().
     */

    var old = $.fn.lightbox ; // Store the original jQuery .lightbox() function to allow for noConflict.

    $.fn.lightbox = function ( option , _relatedTarget )
    {
        return this.each( function ( )
        {
            var $this   = $( this ) ; // Cache the current jQuery element in the loop.
            var data    = $this.data( 'bs.lightbox' ) ; // Attempt to retrieve an existing lightbox instance from data.
            // Merge default options with element data attributes and any explicitly passed options.
            var options = $.extend( { } , Lightbox.DEFAULTS , $this.data( ) , typeof option == 'object' && option ) ;

            // If no lightbox instance exists on this element, create a new one and store it.
            if ( !data ) { $this.data( 'bs.lightbox' , ( data = new Lightbox( this , options ) ) ) ; }

            // If 'option' is a string, it's assumed to be a method name to call on the lightbox instance.
            if ( typeof option == 'string' ) { data[ option ]( _relatedTarget ) ; }
            // Otherwise, if the 'show' option is true, call the show method on the instance.
            else if ( options.show ) { data.show( _relatedTarget ) ; }
        } ) ;
    } ;

    // Expose the Lightbox constructor through the jQuery plugin for direct access.
    $.fn.lightbox.Constructor = Lightbox ;


    /*
     * NO CONFLICT METHOD
     * =========================================
     * Allows other plugins to use $.fn.lightbox without conflict.
     * Restores the previous value of $.fn.lightbox and returns this plugin.
     */

    $.fn.lightbox.noConflict = function ( )
    {
        $.fn.lightbox = old ; // Revert jQuery's lightbox plugin to its original state before this plugin.
        return this ; // Return the current lightbox plugin for chaining.
    } ;


    /*
     * LIGHTBOX DATA-API INTEGRATION
     * =========================================
     * Auto-initialization and event handling for lightboxes
     * declared via HTML data attributes (e.g., data-toggle="lightbox").
     */

    $( document ).on( 'click.bs.lightbox.data-api' , '[data-toggle="lightbox"]' , function ( e )
    {
        var $this   = $( this ) ; // The clicked element that triggered the lightbox.
        var href    = $this.attr( 'href' ) ; // Get the href attribute of the trigger element.
        // Determine the target lightbox element. Uses 'data-target' or extracts from 'href'.
        // The regex is to strip part of the href for IE7 compatibility.
        var $target = $( $this.attr( 'data-target' ) || ( href && href.replace( /.*(?=#[^\s]+$)/ , '' ) ) ) ;
        // Determine the option: 'toggle' if the lightbox is already initialized,
        // otherwise create options from data attributes and the href (for remote content).
        var option  = $target.data( 'lightbox' )
                      ? 'toggle'
                      : $.extend( { remote : !/#/.test( href ) && href } , $target.data( ) , $this.data( ) ) ;

        e.preventDefault( ) ; // Prevent the default anchor link behavior (e.g., scrolling to a hash).

        $target
            .lightbox( option , this ) // Initialize or toggle the lightbox on the target element.
            .one( 'hide' , function ( )
            {
                // After the lightbox has hidden, if the original trigger element is still visible, refocus it.
                $this.is( ':visible' ) && $this.focus( ) ;
            } ) ;
    } ) ;

    // Event handler for lightbox control buttons (e.g., next/previous slide buttons).
    $( document ).on( 'click' , '.lightbox-control' , function ( e )
    {
        e.preventDefault( ) ; // Prevent default button action.

        var $this = $( this ) ; // The control button that was clicked.

        $this.parents( '.lightbox' ) // Find the closest parent element with the 'lightbox' class.
            .lightbox( 'slide' , $( this ).data( 'lightbox-slide' ) ) ; // Call the 'slide' method with the direction from data attribute.
    } ) ;

    // Global event listeners to manage a CSS class on the document body.
    // This can be used to prevent body scrolling or apply other global styles when a lightbox is open.
    $( document )
        .on( 'show.bs.lightbox'   , '.lightbox' , function ( ) { $( document.body ).addClass( 'lightbox-open' ) ; } ) // Add 'lightbox-open' class when a lightbox shows.
        .on( 'hidden.bs.lightbox' , '.lightbox' , function ( ) { $( document.body ).removeClass( 'lightbox-open' ) ; } ) ; // Remove 'lightbox-open' class when a lightbox hides.

}( window.jQuery ) ; // Self-executing anonymous function, passing window.jQuery as the $ parameter.