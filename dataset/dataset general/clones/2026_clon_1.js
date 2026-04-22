/*
 * Noty - jQuery Notification Plugin - Type I Clone
 * Version 2.0.3
 *
 * This is a Type I clone of the original Noty source code.
 * All functional aspects, identifiers, variable names, and expressions
 * are preserved exactly as in the original.
 * Only whitespace (indentation, spacing, blank lines) and comments
 * have been extensively modified to create a visually distinct,
 * yet logically identical, representation of the code.
 *
 * Original project contributors and documentation:
 * Contributors: https://github.com/needim/noty/graphs/contributors
 * Examples and Documentation: http://needim.github.com/noty/
 *
 * Licensed under the MIT licenses:
 * http://www.opensource.org/licenses/mit-license.php
 *
 */


// Polyfill for Object.create to ensure compatibility with older JavaScript environments.
// This checks if Object.create is not a function and provides a basic implementation.
if ( typeof Object.create !== 'function' )
{
    Object.create = function ( o )
    {
        // A dummy constructor function is used as an intermediary.
        function F ( ) { }

        // The prototype of F is set to the object 'o'.
        F.prototype = o;

        // A new instance of F is returned, which inherits from 'o'.
        return new F ( );
    };
}


// Immediately Invoked Function Expression (IIFE) to encapsulate the Noty plugin.
// It passes 'jQuery' as '$' to avoid conflicts and ensure proper scope.
( function ( $ )
{

    // The core NotyObject definition, containing methods and properties for a single notification.
    var NotyObject = {

        /**
         * Initializes a new Noty notification instance with the given options.
         * This method sets up the notification's configuration and builds its DOM structure.
         *
         * @param {object} options - Configuration options for the notification.
         * @returns {object} The Noty instance itself, allowing for method chaining.
         */
        init: function ( options )
        {

            // Merge user-provided options with the global default settings.
            this.options = $.extend ( { }, $.noty.defaults, options );

            // Resolve the specific layout and theme objects based on their names.
            // If 'custom' is true, it defaults to the 'inline' layout.
            this.options.layout = ( this.options.custom ) ? $.noty.layouts [ 'inline' ] : $.noty.layouts [ this.options.layout ];
            this.options.theme = $.noty.themes [ this.options.theme ];

            // Delete layout and theme from the original options object to prevent them
            // from overriding layout-specific options in the next merge.
            delete options.layout;
            delete options.theme;

            // Merge layout-specific options into the main options object.
            this.options = $.extend ( { }, this.options, this.options.layout.options );
            // Generate a unique ID for this notification instance using a timestamp and random number.
            this.options.id = 'noty_' + ( new Date ( ).getTime ( ) * Math.floor ( Math.random ( ) * 1000000 ) );

            // Perform a final merge, ensuring that any original options (that weren't layout/theme)
            // can override layout defaults.
            this.options = $.extend ( { }, this.options, options );

            // Call the private _build method to create the notification's DOM elements.
            this._build ( );

            // Return the current Noty instance for method chaining.
            return this;

        }, // End of 'init' method.


        /**
         * Private method to construct the DOM elements of the notification.
         * This method is called internally during initialization.
         */
        _build: function ( )
        {

            // Create the main notification bar div and set its unique ID.
            var $bar = $ ( '<div class="noty_bar"></div>' ).attr ( 'id', this.options.id );
            // Append the notification template and insert the text content into the '.noty_text' element.
            $bar.append ( this.options.template ).find ( '.noty_text' ).html ( this.options.text );

            // Determine where the notification bar should be appended.
            // If a parent object is specified in the layout, append to it and apply its CSS.
            // Otherwise, $bar itself is the top-level element.
            this.$bar = ( this.options.layout.parent.object !== null )
                ? $ ( this.options.layout.parent.object ).css ( this.options.layout.parent.css ).append ( $bar )
                : $bar;

            // Check if buttons are defined in the notification options.
            if ( this.options.buttons )
            {

                // If buttons are present, disable automatic closing mechanisms like closeWith and timeout.
                this.options.closeWith = [ ];
                this.options.timeout = false;

                // Create a container div for the buttons.
                var $buttons = $ ( '<div/>' ).addClass ( 'noty_buttons' );

                // Append the buttons container to the appropriate parent element.
                ( this.options.layout.parent.object !== null )
                    ? this.$bar.find ( '.noty_bar' ).append ( $buttons )
                    : this.$bar.append ( $buttons );

                var self = this; // Cache 'this' for use within the jQuery.each loop.

                // Iterate over each button configuration provided in the options.
                $.each ( this.options.buttons, function ( i, button )
                {
                    // Create a button element, add custom classes or 'gray' default, set its text.
                    var $button = $ ( '<button/>' )
                        .addClass ( ( button.addClass ) ? button.addClass : 'gray' )
                        .html ( button.text )
                        .appendTo ( self.$bar.find ( '.noty_buttons' ) ) // Append to the buttons container.
                        .bind ( 'click', function ( )
                        {
                            // If an 'onClick' function is defined for the button, execute it.
                            if ( $.isFunction ( button.onClick ) )
                            {
                                button.onClick.call ( $button, self ); // Call with button as 'this' and Noty instance as argument.
                            }
                        } );
                } );
            }

            // Store references to frequently accessed DOM elements for efficiency.
            this.$message = this.$bar.find ( '.noty_message' );
            this.$closeButton = this.$bar.find ( '.noty_close' );
            this.$buttons = this.$bar.find ( '.noty_buttons' );

            // Store the current Noty instance in the global $.noty.store object, indexed by its ID.
            $.noty.store [ this.options.id ] = this; // This enables external API access to the instance.

        }, // End of '_build' method.


        /**
         * Displays the notification.
         * This method handles animation, theme styling, and event binding for closing.
         *
         * @returns {object} The Noty instance for chaining.
         */
        show: function ( )
        {

            var self = this; // Cache 'this' to maintain context within callbacks.

            // Append the notification bar to its designated layout container.
            $ ( self.options.layout.container.selector ).append ( self.$bar );

            // Apply theme-specific styling to the notification.
            self.options.theme.style.apply ( self );

            // Apply layout-specific CSS to the notification bar.
            // It can be a function (which is called with $bar as 'this') or a CSS object.
            ( $.type ( self.options.layout.css ) === 'function' )
                ? this.options.layout.css.apply ( self.$bar )
                : self.$bar.css ( this.options.layout.css || { } );

            // Add layout-specific classes to the notification bar.
            self.$bar.addClass ( self.options.layout.addClass );

            // Apply styling to the layout container itself.
            self.options.layout.container.style.apply ( $ ( self.options.layout.container.selector ) );

            // Execute the theme's 'onShow' callback function.
            self.options.theme.callback.onShow.apply ( this );

            // Bind closing behavior based on 'closeWith' options.
            // If 'click' is specified, make the bar clickable to close.
            if ( $.inArray ( 'click', self.options.closeWith ) > -1 )
                self.$bar.css ( 'cursor', 'pointer' ).one ( 'click', function ( )
                {
                    self.close ( ); // Close the notification.
                } );

            // If 'hover' is specified, close on mouse entry.
            if ( $.inArray ( 'hover', self.options.closeWith ) > -1 )
                self.$bar.one ( 'mouseenter', function ( )
                {
                    self.close ( ); // Close the notification.
                } );

            // If 'button' is specified, bind click to the close button.
            if ( $.inArray ( 'button', self.options.closeWith ) > -1 )
                self.$closeButton.one ( 'click', function ( )
                {
                    self.close ( ); // Close the notification.
                } );

            // If 'button' is NOT specified in 'closeWith', remove the close button from the DOM.
            if ( $.inArray ( 'button', self.options.closeWith ) == -1 )
                self.$closeButton.remove ( );

            // Execute the custom 'onShow' callback from options, if provided.
            if ( self.options.callback.onShow )
                self.options.callback.onShow.apply ( self );

            // Animate the notification bar to open using the specified animation settings.
            self.$bar.animate (
                self.options.animation.open,
                self.options.animation.speed,
                self.options.animation.easing,
                function ( )
                {
                    // After the open animation completes, execute the 'afterShow' callback.
                    if ( self.options.callback.afterShow ) self.options.callback.afterShow.apply ( self );
                    self.shown = true; // Mark the notification as shown.
                } );

            // If a 'timeout' is set, schedule the notification to close automatically.
            if ( self.options.timeout )
                self.$bar.delay ( self.options.timeout ).promise ( ).done ( function ( )
                {
                    self.close ( ); // Close the notification after the delay.
                } );

            return this; // Return the instance for chaining.

        }, // End of 'show' method.


        /**
         * Closes the notification.
         * Handles animations, cleanup, and queue management.
         */
        close: function ( )
        {

            // If the notification is already marked as closed, do nothing.
            if ( this.closed ) return;

            var self = this; // Cache 'this' for consistent context.

            // If the notification has not yet been displayed (i.e., it's still in the queue),
            // remove it from the queue directly without animation.
            if ( !this.shown )
            {
                var queue = [ ];
                $.each ( $.noty.queue, function ( i, n )
                {
                    if ( n.options.id != self.options.id )
                    {
                        queue.push ( n );
                    }
                } );
                $.noty.queue = queue; // Rebuild the queue without this notification.
                return; // Exit, as there's no visual element to close.
            }

            // Add a class to indicate that the notification is in the process of closing.
            self.$bar.addClass ( 'i-am-closing-now' );

            // Execute the custom 'onClose' callback from options, if provided.
            if ( self.options.callback.onClose )
            {
                self.options.callback.onClose.apply ( self );
            }

            // Clear any pending animations, stop current animations, and start the close animation.
            self.$bar.clearQueue ( ).stop ( ).animate (
                self.options.animation.close,
                self.options.animation.speed,
                self.options.animation.easing,
                function ( )
                {
                    // After the close animation completes, execute the 'afterClose' callback.
                    if ( self.options.callback.afterClose ) self.options.callback.afterClose.apply ( self );
                } )
                .promise ( ).done ( function ( )
                {

                    // Modal cleanup:
                    // If the notification was modal, decrement the modal count.
                    if ( self.options.modal )
                    {
                        $.notyRenderer.setModalCount ( -1 );
                        // If no more modals are active, fade out and remove the modal overlay.
                        if ( $.notyRenderer.getModalCount ( ) == 0 ) $ ( '.noty_modal' ).fadeOut ( 'fast', function ( )
                        {
                            $ ( this ).remove ( );
                        } );
                    }

                    // Layout cleanup:
                    // Decrement the count of notifications in this specific layout container.
                    $.notyRenderer.setLayoutCountFor ( self, -1 );
                    // If no more notifications are in this layout container, remove the container itself.
                    if ( $.notyRenderer.getLayoutCountFor ( self ) == 0 ) $ ( self.options.layout.container.selector ).remove ( );

                    // Safely remove the notification bar from the DOM and clear its reference.
                    if ( typeof self.$bar !== 'undefined' && self.$bar !== null ) {
                        self.$bar.remove ( );
                        self.$bar = null;
                        self.closed = true; // Mark the notification as completely closed.
                    }

                    // Remove the notification instance from the global store.
                    delete $.noty.store [ self.options.id ];

                    // Execute the theme's 'onClose' callback.
                    self.options.theme.callback.onClose.apply ( self );

                    // If 'dismissQueue' is false (meaning notifications are shown one by one),
                    // signal the renderer to show the next item in the queue.
                    if ( !self.options.dismissQueue )
                    {
                        $.noty.ontap = true; // Allow the next item to be rendered.
                        $.notyRenderer.render ( ); // Trigger the renderer.
                    }

                } );

        }, // End of 'close' method.


        /**
         * Updates the text content of the notification.
         *
         * @param {string} text - The new text to display.
         * @returns {object} The Noty instance for chaining.
         */
        setText: function ( text )
        {
            if ( !this.closed )
            {
                this.options.text = text;
                this.$bar.find ( '.noty_text' ).html ( text );
            }
            return this;
        },


        /**
         * Changes the type (style) of the notification.
         * This will re-apply theme styles and trigger the onShow callback for visual updates.
         *
         * @param {string} type - The new type (e.g., 'success', 'error', 'warning', 'information').
         * @returns {object} The Noty instance for chaining.
         */
        setType: function ( type )
        {
            if ( !this.closed )
            {
                this.options.type = type;
                this.options.theme.style.apply ( this );
                this.options.theme.callback.onShow.apply ( this );
            }
            return this;
        },


        /**
         * Sets or updates the timeout for the notification to close automatically.
         *
         * @param {number|boolean} time - The timeout duration in milliseconds, or `false` to disable timeout.
         * @returns {object} The Noty instance for chaining.
         */
        setTimeout: function ( time )
        {
            if ( !this.closed )
            {
                var self = this;
                this.options.timeout = time;
                // Re-schedule the close action with the new timeout.
                self.$bar.delay ( self.options.timeout ).promise ( ).done ( function ( )
                {
                    self.close ( );
                } );
            }
            return this;
        },

        closed: false, // Boolean flag: true if the notification has been closed.
        shown: false   // Boolean flag: true if the notification has been rendered and displayed.

    }; // End of NotyObject definition.


    // The NotyRenderer object, responsible for managing the queue and rendering notifications.
    $.notyRenderer = { };

    /**
     * Initializes a new notification through the renderer.
     * This is the entry point for creating and queuing notifications.
     *
     * @param {object} options - Options for the notification.
     * @returns {object|string} The Noty instance object or its ID, depending on `$.noty.returns`.
     */
    $.notyRenderer.init = function ( options )
    {

        // Create a new Noty instance by cloning NotyObject and initializing it.
        var notification = Object.create ( NotyObject ).init ( options );

        // Add the new notification to the queue.
        // If 'force' option is true, it's added to the front; otherwise, to the end.
        ( notification.options.force )
            ? $.noty.queue.unshift ( notification )
            : $.noty.queue.push ( notification );

        // Attempt to render notifications from the queue.
        $.notyRenderer.render ( );

        // Return either the notification object or its ID based on the global setting.
        return ( $.noty.returns == 'object' ) ? notification : notification.options.id;
    };


    /**
     * Processes the notification queue and displays notifications.
     * It handles different queue dismissal strategies (dismissQueue, ontap).
     */
    $.notyRenderer.render = function ( )
    {

        var instance = $.noty.queue [ 0 ]; // Get the first notification in the queue.

        // Check if there is an instance waiting in the queue.
        if ( $.type ( instance ) === 'object' )
        {
            // If 'dismissQueue' is true, show the notification immediately and remove it from the queue.
            if ( instance.options.dismissQueue )
            {
                $.notyRenderer.show ( $.noty.queue.shift ( ) );
            }
            else
            {
                // If 'dismissQueue' is false, only show if 'ontap' is true (meaning the previous notification has closed).
                if ( $.noty.ontap )
                {
                    $.notyRenderer.show ( $.noty.queue.shift ( ) );
                    $.noty.ontap = false; // Prevent showing another until this one closes.
                }
            }
        }
        else
        {
            $.noty.ontap = true; // If the queue is empty, reset 'ontap' to true, indicating readiness.
        }

    };


    /**
     * Displays a specific notification instance.
     * This involves creating/finding its container and calling its 'show' method.
     *
     * @param {object} notification - The Noty instance to be displayed.
     */
    $.notyRenderer.show = function ( notification )
    {

        // If the notification is modal, create a modal overlay and increment the modal count.
        if ( notification.options.modal )
        {
            $.notyRenderer.createModalFor ( notification );
            $.notyRenderer.setModalCount ( +1 );
        }

        // Check if the layout container for this notification already exists in the DOM.
        if ( $ ( notification.options.layout.container.selector ).length == 0 )
        {
            // If the container does not exist:
            if ( notification.options.custom )
            {
                // If it's a custom container, append it to the specified custom parent.
                notification.options.custom.append ( $ ( notification.options.layout.container.object ).addClass ( 'i-am-new' ) );
            }
            else
            {
                // Otherwise, append it to the body.
                $ ( 'body' ).append ( $ ( notification.options.layout.container.object ).addClass ( 'i-am-new' ) );
            }
        }
        else
        {
            // If the container already exists, ensure it doesn't have the 'i-am-new' class.
            $ ( notification.options.layout.container.selector ).removeClass ( 'i-am-new' );
        }

        // Increment the count of notifications for this specific layout container.
        $.notyRenderer.setLayoutCountFor ( notification, +1 );

        // Call the notification's own 'show' method to display it.
        notification.show ( );
    };


    /**
     * Creates a modal overlay element if one does not already exist.
     *
     * @param {object} notification - The Noty instance that requires a modal.
     */
    $.notyRenderer.createModalFor = function ( notification )
    {
        // Only create the modal if no existing modal element is found.
        if ( $ ( '.noty_modal' ).length == 0 )
            $ ( '<div/>' )
                .addClass ( 'noty_modal' ) // Add the 'noty_modal' class.
                .data ( 'noty_modal_count', 0 ) // Initialize a count for active modals.
                .css ( notification.options.theme.modal.css ) // Apply theme-specific modal CSS.
                .prependTo ( $ ( 'body' ) ) // Prepend to the body.
                .fadeIn ( 'fast' ); // Fade it in.
    };


    /**
     * Retrieves the current number of notifications present in a given layout container.
     *
     * @param {object} notification - A Noty instance used to identify its layout container.
     * @returns {number} The count of notifications in that container, or 0 if none.
     */
    $.notyRenderer.getLayoutCountFor = function ( notification )
    {
        return $ ( notification.options.layout.container.selector ).data ( 'noty_layout_count' ) || 0;
    };


    /**
     * Updates the count of notifications for a specific layout container.
     *
     * @param {object} notification - A Noty instance to identify its layout container.
     * @param {number} arg - The value to add to (or subtract from) the current count.
     * @returns {number} The updated count.
     */
    $.notyRenderer.setLayoutCountFor = function ( notification, arg )
    {
        return $ ( notification.options.layout.container.selector ).data ( 'noty_layout_count', $.notyRenderer.getLayoutCountFor ( notification ) + arg );
    };


    /**
     * Retrieves the current total count of active modal notifications.
     *
     * @returns {number} The count of active modals, or 0 if none.
     */
    $.notyRenderer.getModalCount = function ( )
    {
        return $ ( '.noty_modal' ).data ( 'noty_modal_count' ) || 0;
    };


    /**
     * Updates the total count of active modal notifications.
     *
     * @param {number} arg - The value to add to (or subtract from) the current modal count.
     * @returns {number} The updated modal count.
     */
    $.notyRenderer.setModalCount = function ( arg )
    {
        return $ ( '.noty_modal' ).data ( 'noty_modal_count', $.notyRenderer.getModalCount ( ) + arg );
    };


    // Extend jQuery's prototype to allow creating Noty notifications from a jQuery selector.
    // This is primarily used for custom container layouts.
    $.fn.noty = function ( options )
    {
        options.custom = $ ( this ); // Set the jQuery object as the custom container.
        return $.notyRenderer.init ( options ); // Initialize a new Noty instance with these options.
    };


    // Global Noty object to hold configuration, queue, layouts, themes, and API methods.
    $.noty = { };
    $.noty.queue = [ ];       // The array holding notification instances waiting to be displayed.
    $.noty.ontap = true;      // A flag indicating if the renderer is ready to process the next item in the queue.
    $.noty.layouts = { };     // Object to store registered layout definitions.
    $.noty.themes = { };      // Object to store registered theme definitions.
    $.noty.returns = 'object';// Specifies what the `noty()` function should return ('object' or 'id').
    $.noty.store = { };       // Object to store active Noty instances, indexed by their unique IDs.


    /**
     * Retrieves a Noty instance from the store by its ID.
     *
     * @param {string} id - The ID of the notification.
     * @returns {object|boolean} The Noty instance if found, otherwise `false`.
     */
    $.noty.get = function ( id )
    {
        return $.noty.store.hasOwnProperty ( id ) ? $.noty.store [ id ] : false;
    };


    /**
     * Closes a specific notification by its ID.
     *
     * @param {string} id - The ID of the notification to close.
     * @returns {boolean} `true` if the notification was found and closed, `false` otherwise.
     */
    $.noty.close = function ( id )
    {
        return $.noty.get ( id ) ? $.noty.get ( id ).close ( ) : false;
    };


    /**
     * Sets the text content of a specific notification by its ID.
     *
     * @param {string} id - The ID of the notification.
     * @param {string} text - The new text content.
     * @returns {object|boolean} The Noty instance if found, otherwise `false`.
     */
    $.noty.setText = function ( id, text )
    {
        return $.noty.get ( id ) ? $.noty.get ( id ).setText ( text ) : false;
    };


    /**
     * Sets the type (style) of a specific notification by its ID.
     *
     * @param {string} id - The ID of the notification.
     * @param {string} type - The new type (e.g., 'success', 'error').
     * @returns {object|boolean} The Noty instance if found, otherwise `false`.
     */
    $.noty.setType = function ( id, type )
    {
        return $.noty.get ( id ) ? $.noty.get ( id ).setType ( type ) : false;
    };


    /**
     * Clears all notifications currently waiting in the queue.
     * Does not affect already displayed notifications.
     */
    $.noty.clearQueue = function ( )
    {
        $.noty.queue = [ ]; // Reset the queue to an empty array.
    };


    /**
     * Closes all currently displayed notifications and clears the entire queue.
     */
    $.noty.closeAll = function ( )
    {
        $.noty.clearQueue ( ); // First, clear any pending notifications in the queue.
        // Then, iterate through all currently stored (displayed) notifications and close each one.
        $.each ( $.noty.store, function ( id, noty )
        {
            noty.close ( );
        } );
    };


    var windowAlert = window.alert; // Store a reference to the original `window.alert` function.


    /**
     * Overrides the native `window.alert` function to display Noty notifications instead.
     *
     * @param {object} options - Default options to apply to Noty notifications created via `alert`.
     */
    $.noty.consumeAlert = function ( options )
    {
        window.alert = function ( text )
        {
            if ( options )
                options.text = text; // If options are provided, set the alert text in them.
            else
                options = { text: text }; // Otherwise, create a new options object with the text.

            $.notyRenderer.init ( options ); // Initialize a Noty notification with the alert text.
        };
    };


    /**
     * Restores the original `window.alert` function, undoing the `consumeAlert` override.
     */
    $.noty.stopConsumeAlert = function ( )
    {
        window.alert = windowAlert; // Restore the saved original `window.alert`.
    };


    // Default configuration options for all Noty notifications.
    // These can be overridden during initialization or by specific layouts/themes.
    $.noty.defaults = {
        layout:        'top',                                                                                                // Default layout position.
        theme:         'defaultTheme',                                                                                         // Default theme to apply.
        type:          'alert',                                                                                                // Default notification type (e.g., 'alert', 'success', 'error').
        text:          '',                                                                                                     // Default text content for the notification.
        dismissQueue:  true,                                                                                                   // If true, shows notifications one by one; if false, shows all simultaneously.
        template:      '<div class="noty_message"><span class="noty_text"></span><div class="noty_close"></div></div>',      // HTML template for the notification bar.
        animation:     {                                                                                                      // Animation settings for showing and hiding.
            open:      { height: 'toggle' },                                                                                   // jQuery animation properties for opening.
            close:     { height: 'toggle' },                                                                                   // jQuery animation properties for closing.
            easing:    'swing',                                                                                                // Easing function for animations.
            speed:     500                                                                                                     // Animation speed in milliseconds.
        },
        timeout:       false,                                                                                                  // Timeout duration in milliseconds for auto-closing, or false to disable.
        force:         false,                                                                                                  // If true, forces the notification to be displayed immediately, bypassing the queue.
        modal:         false,                                                                                                  // If true, displays a modal overlay behind the notification.
        closeWith:     [ 'click' ],                                                                                            // Array of events that will close the notification (e.g., 'click', 'hover', 'button').
        callback:      {                                                                                                      // Callback functions for various lifecycle events.
            onShow:    function ( ) { },                                                                                       // Called before the notification is shown.
            afterShow: function ( ) { },                                                                                       // Called after the open animation completes.
            onClose:   function ( ) { },                                                                                       // Called before the notification starts closing.
            afterClose:function ( ) { }                                                                                        // Called after the close animation completes and cleanup is done.
        },
        buttons:       false                                                                                                   // If an array of button configurations is provided, buttons will be rendered.
    };


    // Event listener for window resize events.
    // When the window is resized, it re-applies layout container styles for all active layouts.
    $ ( window ).resize ( function ( )
    {
        $.each ( $.noty.layouts, function ( index, layout )
        {
            layout.container.style.apply ( $ ( layout.container.selector ) );
        } );
    } );


} ) ( jQuery ); // End of the IIFE, passing jQuery.


// Global helper function `noty()` for creating notifications.
// This function also handles backward compatibility for deprecated options.
function noty ( options )
{

    // This block is for backward compatibility with older Noty versions.
    // It maps deprecated option names to their new equivalents.
    // The original comment indicated it would be deleted on v2.2.0.
    var using_old = 0, // Counter to track how many old options were used.
        old_to_new = { // Mapping object from old option names to new paths.
            'animateOpen':     'animation.open',
            'animateClose':    'animation.close',
            'easing':          'animation.easing',
            'speed':           'animation.speed',
            'onShow':          'callback.onShow',
            'onShown':         'callback.afterShow',
            'onClose':         'callback.onClose',
            'onClosed':        'callback.afterClose'
        };

    // Iterate through the provided options to check for deprecated names.
    jQuery.each ( options, function ( key, value )
    {
        if ( old_to_new [ key ] )
        {
            using_old++; // Increment the counter if an old option is found.
            var _new = old_to_new [ key ].split ( '.' ); // Split the new option path (e.g., 'animation.open').

            // Ensure the parent object for the new option path exists.
            if ( !options [ _new [ 0 ] ] ) options [ _new [ 0 ] ] = { };

            // Assign the value to the new, correctly structured option path.
            options [ _new [ 0 ] ] [ _new [ 1 ] ] = ( value ) ? value : function ( ) { };
            delete options [ key ]; // Remove the deprecated option from the options object.
        }
    } );

    // Ensure 'closeWith' is initialized if not explicitly provided in options.
    // It defaults to the value from $.noty.defaults.closeWith.
    if ( !options.closeWith )
    {
        options.closeWith = jQuery.noty.defaults.closeWith;
    }

    // Backward compatibility for the 'closeButton' option.
    if ( options.hasOwnProperty ( 'closeButton' ) )
    {
        using_old++;
        if ( options.closeButton ) options.closeWith.push ( 'button' ); // Add 'button' to closeWith if true.
        delete options.closeButton; // Remove the old option.
    }

    // Backward compatibility for the 'closeOnSelfClick' option.
    if ( options.hasOwnProperty ( 'closeOnSelfClick' ) )
    {
        using_old++;
        if ( options.closeOnSelfClick ) options.closeWith.push ( 'click' ); // Add 'click' to closeWith if true.
        delete options.closeOnSelfClick; // Remove the old option.
    }

    // Backward compatibility for the 'closeOnSelfOver' option.
    if ( options.hasOwnProperty ( 'closeOnSelfOver' ) )
    {
        using_old++;
        if ( options.closeOnSelfOver ) options.closeWith.push ( 'hover' ); // Add 'hover' to closeWith if true.
        delete options.closeOnSelfOver; // Remove the old option.
    }

    // Backward compatibility for the 'custom' option's structure.
    if ( options.hasOwnProperty ( 'custom' ) )
    {
        using_old++;
        if ( options.custom.container != 'null' ) options.custom = options.custom.container;
    }

    // Backward compatibility for the 'cssPrefix' option (which was removed).
    if ( options.hasOwnProperty ( 'cssPrefix' ) )
    {
        using_old++;
        delete options.cssPrefix; // Simply delete it as it's no longer used.
    }

    // Backward compatibility for the old 'noty_theme_default' theme name.
    if ( options.theme == 'noty_theme_default' )
    {
        using_old++;
        options.theme = 'defaultTheme'; // Map to the new 'defaultTheme' name.
    }

    // Backward compatibility: automatically set 'dismissQueue' based on layout for certain positions.
    if ( !options.hasOwnProperty ( 'dismissQueue' ) )
    {
        if ( options.layout == 'topLeft'
            || options.layout == 'topRight'
            || options.layout == 'bottomLeft'
            || options.layout == 'bottomRight' )
        {
            options.dismissQueue = true; // For these layouts, dismissQueue defaults to true.
        }
        else
        {
            options.dismissQueue = false; // For other layouts, it defaults to false.
        }
    }

    // Backward compatibility for the 'buttons' click handler.
    if ( options.buttons )
    {
        jQuery.each ( options.buttons, function ( i, button )
        {
            if ( button.click )
            {
                using_old++;
                button.onClick = button.click; // Map the old 'click' property to the new 'onClick'.
                delete button.click; // Remove the old 'click' property.
            }
        } );
    }
    // The original code snippet provided ended abruptly here.
    // Assuming the function would continue to call $.notyRenderer.init(options)
    // to actually create the notification, or similar.
    // For a Type I clone, I will stop at the exact point the original code does.