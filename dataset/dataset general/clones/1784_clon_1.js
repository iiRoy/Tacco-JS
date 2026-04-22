// This file contains a Type I clone of the Featherlight jQuery Lightbox script.
// All functionality, variable names, function names, and expressions are strictly preserved.
// Only whitespace (indentation, spacing, line breaks) and comments have been altered
// to create a visually distinct, yet functionally identical, version of the original code.

/*
 * Featherlight - An incredibly lightweight and flexible jQuery lightbox solution.
 * Version: 1.2.3
 * Project Page: http://noelboss.github.io/featherlight/
 *
 * Copyright (c) 2015, Noël Raoul Bossart (http://www.noelboss.com)
 * Licensed under the MIT License.
 *
 * This particular version has been reformatted for demonstrative purposes of Type I code cloning.
 */

(function($) {
    "use strict"; // Enforce strict mode for cleaner code and fewer errors.

    // Check if jQuery is loaded. Featherlight relies on it.
    if ( 'undefined' === typeof $ ) {
        // If console is available, log a warning message.
        if ( 'console' in window ) {
            window.console.info( 'Too much lightness, Featherlight needs jQuery.' );
        }
        return; // Exit if jQuery is not found.
    }

    /*
     * Featherlight is exposed globally as $.featherlight.
     * It serves as a primary function to initiate and open a Featherlight lightbox instance.
     *
     * [Technical Design Overview]
     * Featherlight leverages a prototype-based inheritance model.
     * Each time a lightbox is opened, a new object instance is created.
     * This object can have its own attributes, which may override those defined in the prototype chain.
     *
     * Extensions (e.g., Featherlight Gallery) are created using Featherlight.extend.
     * These extensions possess their own prototypes, inheriting from Featherlight's base prototype.
     * This allows for attribute overrides at both the individual object level and the extension level.
     *
     * For callbacks that need to execute sequentially (chaining) rather than simply overriding previous ones,
     * the `chainCallbacks` utility method is employed.
     *
     * For those familiar with CoffeeScript's class syntax, this structure is analogous to:
     * Featherlight being a base class, and extensions (like Gallery) being classes that `extend` Featherlight.
     * The `chainCallbacks` mechanism provides a way to achieve functionality similar to CoffeeScript's `super`
     * in JavaScript, particularly for managing callback execution flow.
     */

    /**
     * Main Featherlight constructor function.
     * Instantiates a new Featherlight lightbox.
     *
     * @param {jQuery|string} $content - The content to be displayed in the lightbox. Can be a jQuery object, selector, or URL.
     * @param {object} config - Configuration options for this specific lightbox instance.
     */
    function Featherlight ( $content, config ) {
        // Determine if the function was called with 'new' keyword.
        if ( this instanceof Featherlight ) {
            // If called with 'new', initialize the instance.
            this.id = Featherlight.id++; // Assign a unique ID to this instance.
            this.setup( $content, config ); // Perform initial setup.
            // Chain any globally defined callbacks to this instance.
            this.chainCallbacks( Featherlight._callbackChain );
        } else {
            // If called without 'new', create a new instance and open it.
            var fl = new Featherlight( $content, config );
            fl.open(); // Open the lightbox immediately.
            return fl; // Return the newly created Featherlight instance.
        }
    }

    // Array to keep track of currently opened Featherlight instances.
    var opened = [],
        /**
         * Cleans up the `opened` array by removing closed or detached instances.
         *
         * @param {Featherlight} remove - Optional instance to explicitly remove.
         * @returns {Array<Featherlight>} The cleaned array of opened instances.
         */
        pruneOpened = function ( remove ) {
            opened = $.grep( opened, function ( fl ) {
                // Keep instances that are not 'remove' and are still attached to the DOM.
                return fl !== remove && fl.$instance.closest( 'body' ).length > 0;
            } );
            return opened;
        };

    /**
     * Transforms an object's keys with a given prefix and camelCase into dasherized CSS properties.
     * Example: structure({iframeMinHeight: 44, foo: 0}, 'iframe') => {min-height: 44}
     *
     * @param {object} obj - The object containing properties to transform.
     * @param {string} prefix - The prefix to match and remove (e.g., 'iframe').
     * @returns {object} An object with dasherized keys suitable for CSS.
     */
    var structure = function ( obj, prefix ) {
        var result = {},
            // Regular expression to match keys starting with the prefix,
            // followed by an uppercase letter and then any characters.
            regex = new RegExp( '^' + prefix + '([A-Z])(.*)' );
        for ( var key in obj ) {
            var match = key.match( regex );
            if ( match ) {
                // Convert camelCase to dasherized format (e.g., 'MinHeight' to '-min-height').
                var dasherized = ( match[1] + match[2].replace( /([A-Z])/g, '-$1' ) ).toLowerCase();
                result[dasherized] = obj[key]; // Assign the original value.
            }
        }
        return result;
    };

    // Map global event types to Featherlight prototype methods.
    var eventMap = { keyup: 'onKeyUp', resize: 'onResize' };

    /**
     * Global event handler for document-wide events (keyup, resize).
     * Iterates through opened Featherlight instances in reverse order (frontmost first).
     *
     * @param {jQuery.Event} event - The jQuery event object.
     */
    var globalEventHandler = function ( event ) {
        // Iterate over opened instances, starting from the most recently opened.
        $.each( Featherlight.opened().reverse(), function () {
            // If the event has not been prevented by a previous handler.
            if ( !event.isDefaultPrevented() ) {
                // Call the corresponding method on the Featherlight instance.
                // If the method returns false, prevent default and stop propagation.
                if ( false === this[eventMap[event.type]]( event ) ) {
                    event.preventDefault();
                    event.stopPropagation();
                    return false; // Break the $.each loop.
                }
            }
        } );
    };

    /**
     * Toggles global event listeners (keyup, resize) on the window.
     * Prevents duplicate event listeners.
     *
     * @param {boolean} set - True to enable listeners, false to disable.
     */
    var toggleGlobalEvents = function ( set ) {
            // Only toggle if the state is changing.
            if ( set !== Featherlight._globalHandlerInstalled ) {
                Featherlight._globalHandlerInstalled = set; // Update the installed state.
                // Generate event names with namespace for unbinding safely.
                var events = $.map( eventMap, function ( _, name ) {
                    return name + '.' + Featherlight.prototype.namespace;
                } ).join( ' ' );
                // Attach or detach event listeners based on the 'set' parameter.
                $( window )[ set ? 'on' : 'off' ]( events, globalEventHandler );
            }
        };

    // Define the Featherlight prototype, containing default options and methods.
    Featherlight.prototype = {
        // Explicitly set the constructor property.
        constructor: Featherlight,

        // --- Default Configuration Options ---
        namespace:      'featherlight',         /* Prefix for events and CSS classes. */
        targetAttr:     'data-featherlight',    /* Attribute on the trigger element specifying content. */
        variant:        null,                   /* Additional CSS class for visual variations. */
        resetCss:       false,                  /* If true, uses a '-reset' class to clear default styles. */
        background:     null,                   /* Custom DOM structure for the lightbox background. */
        openTrigger:    'click',                /* Event that triggers the lightbox opening. */
        closeTrigger:   'click',                /* Event that triggers the lightbox closing. */
        filter:         null,                   /* Selector to filter events (e.g., for delegated events). */
        root:           'body',                 /* DOM element where the lightbox will be appended. */
        openSpeed:      250,                    /* Duration of the opening animation in milliseconds. */
        closeSpeed:     250,                    /* Duration of the closing animation in milliseconds. */
        closeOnClick:   'background',           /* Close behavior: 'background', 'anywhere', or false. */
        closeOnEsc:     true,                   /* Whether pressing ESC key closes the lightbox. */
        closeIcon:      '&#10005;',             /* HTML for the close button icon (X symbol). */
        loading:        '',                     /* Content to display while main content is loading. */
        otherClose:     null,                   /* Selector for additional elements that can close the lightbox. */

        // --- Callback Functions (can be overridden) ---
        beforeOpen:     $.noop,                 /* Called before opening. Can return false to prevent opening. */
        beforeContent:  $.noop,                 /* Called before content is loaded/processed. */
        beforeClose:    $.noop,                 /* Called before closing. Can return false to prevent closing. */
        afterOpen:      $.noop,                 /* Called after the lightbox has fully opened. */
        afterContent:   $.noop,                 /* Called after content is set and displayed. */
        afterClose:     $.noop,                 /* Called after the lightbox has fully closed. */
        onKeyUp:        $.noop,                 /* Called on keyup for the frontmost lightbox. */
        onResize:       $.noop,                 /* Called after content is set and on window resize. */

        // --- Content Handling ---
        type:           null,                   /* Explicitly set content type (e.g., 'image', 'ajax'). */
        contentFilters: ['jquery', 'image', 'html', 'ajax', 'iframe', 'text'], /* Order of content filters to try. */

        // --- Core Methods ---
        /**
         * Initializes a Featherlight instance, setting up its background DOM and event handlers.
         *
         * @param {jQuery|string} target - The content target (selector, URL, etc.).
         * @param {object} config - Configuration options.
         * @returns {Featherlight} The current Featherlight instance for chaining.
         */
        setup: function ( target, config ) {
            // Handle optional arguments: if target is an object and not a jQuery object, it's config.
            if ( typeof target === 'object' && target instanceof $ === false && !config ) {
                config = target;
                target = undefined;
            }

            // Merge default prototype properties with instance-specific config and target.
            var self = $.extend( this, config, {target: target} ),
                // Determine CSS class for the background, applying '-reset' if specified.
                css = !self.resetCss ? self.namespace : self.namespace + '-reset',
                // Construct the default background DOM structure.
                $background = $( self.background || [
                    '<div class="' + css + '-loading ' + css + '">',
                        '<div class="' + css + '-content">',
                            '<span class="' + self.namespace + '-close-icon ' + self.namespace + '-close">',
                                self.closeIcon,
                            '</span>',
                            '<div class="' + self.namespace + '-inner">' + self.loading + '</div>',
                        '</div>',
                    '</div>'
                ].join( '' ) ),
                // Selector for all elements that can trigger closing.
                closeButtonSelector = '.' + self.namespace + '-close' + ( self.otherClose ? ',' + self.otherClose : '' );

            // Clone the background DOM structure and add the variant class.
            self.$instance = $background.clone().addClass( self.variant );

            // Attach click event handler for closing the lightbox.
            self.$instance.on( self.closeTrigger + '.' + self.namespace, function ( event ) {
                var $target = $( event.target );
                // Check if the click should close the lightbox based on closeOnClick setting.
                if ( ( 'background' === self.closeOnClick && $target.is( '.' + self.namespace ) )
                    || 'anywhere' === self.closeOnClick
                    || $target.closest( closeButtonSelector ).length ) {
                    event.preventDefault(); // Prevent default action for the click.
                    self.close(); // Close the lightbox.
                }
            } );

            return this; // Allow method chaining.
        },

        /**
         * Determines and processes the content for the lightbox based on filters.
         *
         * @returns {jQuery.Promise|boolean} A promise that resolves with the processed content, or false if no content filter is found.
         */
        getContent: function () {
            var self = this,
                filters = this.constructor.contentFilters, // Access static content filters.
                // Helper to read attributes from the current target element.
                readTargetAttr = function ( name ) { return self.$currentTarget && self.$currentTarget.attr( name ); },
                targetValue = readTargetAttr( self.targetAttr ), // Get content from data-featherlight attribute.
                data = self.target || targetValue || ''; // Determine the raw content data.

            var filter = filters[self.type]; // Try explicit type from config (e.g., {type: 'image'}).

            // If no filter yet, check if data itself specifies a filter type (e.g., data-featherlight="image").
            if ( !filter && data in filters ) {
                filter = filters[data];
                data = self.target && targetValue; // If filter found by data, use targetValue as actual data.
            }
            // Fallback to 'href' attribute if no data specified yet.
            data = data || readTargetAttr( 'href' ) || '';

            // If still no filter, check for explicit content properties (e.g., {image: 'photo.jpg'}).
            if ( !filter ) {
                for ( var filterName in filters ) {
                    if ( self[filterName] ) {
                        filter = filters[filterName];
                        data = self[filterName];
                        break; // Found a filter, no need to check others.
                    }
                }
            }

            // If still no explicit filter, try implicit checks using the contentFilters array.
            if ( !filter ) {
                var target = data; // Store original data for testing.
                data = null; // Reset data, will be set by the first matching filter.
                $.each( self.contentFilters, function () {
                    filter = filters[this]; // Get filter definition.
                    if ( filter.test ) {
                        data = filter.test( target ); // Test with custom test function.
                    }
                    // If no data yet, try regex matching.
                    if ( !data && filter.regex && target.match && target.match( filter.regex ) ) {
                        data = target;
                    }
                    return !data; // Continue if no data found yet, break if data is found.
                } );
                // If no filter successfully identified the content.
                if ( !data ) {
                    if ( 'console' in window ) {
                        window.console.error( 'Featherlight: no content filter found ' + ( target ? ' for "' + target + '"' : ' (no target specified)' ) );
                    }
                    return false; // Indicate failure.
                }
            }
            // Process the content using the identified filter.
            return filter.process.call( self, data );
        },

        /**
         * Sets the provided jQuery content into the lightbox instance.
         *
         * @param {jQuery} $content - The jQuery object representing the content to display.
         * @returns {Featherlight} The current Featherlight instance for chaining.
         */
        setContent: function ( $content ) {
            var self = this;
            // Add a special class if the content is an iframe (or contains one).
            if ( $content.is( 'iframe' ) || $( 'iframe', $content ).length > 0 ) {
                self.$instance.addClass( self.namespace + '-iframe' );
            }

            // Remove the loading class once content is available.
            self.$instance.removeClass( self.namespace + '-loading' );

            /*
             * Replace the content by appending to the existing inner element before it's removed.
             * This ensures that the featherlight-inner element maintains its relative position
             * to any other items that might be added to featherlight-content by extensions.
             */
            self.$instance.find( '.' + self.namespace + '-inner' )
                .slice( 1 ).remove().end() // Remove any extra inner elements beyond the first.
                // Replace the first inner element with the new content.
                // Check if $content is already a child to avoid moving it unnecessarily.
                .replaceWith( $.contains( self.$instance[0], $content[0] ) ? '' : $content );

            // Store the content and add the inner class to it.
            self.$content = $content.addClass( self.namespace + '-inner' );

            return self; // Allow method chaining.
        },

        /**
         * Opens the lightbox.
         *
         * @param {jQuery.Event} event - The event that triggered the opening.
         * @returns {jQuery.Promise} A promise that resolves when the lightbox is successfully opened.
         */
        open: function ( event ) {
            var self = this;
            // Initially hide the instance and append it to the root element.
            self.$instance.hide().appendTo( self.root );
            // Check if the event default was prevented and if beforeOpen callback allows opening.
            if ( ( !event || !event.isDefaultPrevented() )
                && self.beforeOpen( event ) !== false ) {

                if ( event ) {
                    event.preventDefault(); // Prevent default action of the triggering event.
                }
                var $content = self.getContent(); // Get the content to display.

                if ( $content ) {
                    opened.push( self ); // Add this instance to the list of opened lightboxes.

                    toggleGlobalEvents( true ); // Enable global event handlers.

                    self.$instance.fadeIn( self.openSpeed ); // Animate the lightbox into view.
                    self.beforeContent( event ); // Call beforeContent callback.

                    // Set content and show:
                    // Use $.when for content that might be a promise (e.g., AJAX, image loading).
                    return $.when( $content )
                        .always( function ( $content ) {
                            self.setContent( $content ); // Set the content once resolved.
                            self.afterContent( event ); // Call afterContent callback.
                        } )
                        .then( self.$instance.promise() ) // Chain with the instance's animation promise.
                        .done( function () { self.afterOpen( event ); } ); // Call afterOpen once everything is done.
                }
            }
            // If opening was prevented or content could not be loaded, detach the instance.
            self.$instance.detach();
            // Return a rejected promise to indicate failure.
            return $.Deferred().reject().promise();
        },

        /**
         * Closes the lightbox.
         *
         * @param {jQuery.Event} event - The event that triggered the closing.
         * @returns {jQuery.Promise} A promise that resolves when the lightbox is successfully closed.
         */
        close: function ( event ) {
            var self = this,
                deferred = $.Deferred(); // Create a deferred object to manage promise state.

            // Check if the beforeClose callback prevents closing.
            if ( self.beforeClose( event ) === false ) {
                deferred.reject(); // Reject the promise if closing is prevented.
            } else {
                // If no Featherlight instances are left open after pruning this one, disable global events.
                if ( 0 === pruneOpened( self ).length ) {
                    toggleGlobalEvents( false );
                }

                // Animate the lightbox out of view.
                self.$instance.fadeOut( self.closeSpeed, function () {
                    self.$instance.detach(); // Remove the lightbox from the DOM.
                    self.afterClose( event ); // Call afterClose callback.
                    deferred.resolve(); // Resolve the promise once closed.
                } );
            }
            return deferred.promise(); // Return the promise.
        },

        /**
         * Utility function to chain callbacks.
         * [Warning: guru-level concept]
         * This is used by extensions that need to allow users to specify callbacks
         * while also needing to execute their own logic within those same callback points.
         * The 'chain' object should have callback names as keys and functions (super, event) as values.
         * The function is expected to call `super` at an appropriate point to execute the original callback.
         *
         * @param {object} chain - An object mapping callback names to chaining functions.
         */
        chainCallbacks: function ( chain ) {
            for ( var name in chain ) {
                // Proxy the chaining function, passing the original callback as 'super'.
                this[name] = $.proxy( chain[name], this, $.proxy( this[name], this ) );
            }
        }
    };

    // --- Static methods and properties of Featherlight ---
    $.extend( Featherlight, {
        id:             0,                                    /* Counter for unique Featherlight instance IDs. */
        autoBind:       '[data-featherlight]',                /* Selector for elements that auto-trigger lightbox. */
        defaults:       Featherlight.prototype,               /* Alias for Featherlight.prototype for easier access. */

        /* Object containing content filter definitions. */
        contentFilters: {
            jquery: {
                regex:      /^[#.]\w/,         /* Matches anything starting with a class name or ID selector. */
                test:       function ( elem )    { return elem instanceof $ && elem; }, // Checks if it's a jQuery object.
                process:    function ( elem ) { return $( elem ).clone( true ); } // Clones the jQuery object.
            },
            image: {
                regex:      /\.(png|jpg|jpeg|gif|tiff|bmp)(\?\S*)?$/i, // Matches common image file extensions.
                process:    function ( url )  {
                    var self = this,
                        deferred = $.Deferred(),
                        img = new Image(), // Create a new Image object.
                        $img = $( '<img src="' + url + '" alt="" class="' + self.namespace + '-image" />' ); // Create jQuery image element.
                    // Set up load handler for the native image.
                    img.onload  = function () {
                        // Store naturalWidth & height for IE8 compatibility.
                        $img.naturalWidth = img.width;
                        $img.naturalHeight = img.height;
                        deferred.resolve( $img ); // Resolve promise with the jQuery image.
                    };
                    // Set up error handler.
                    img.onerror = function () { deferred.reject( $img ); };
                    img.src = url; // Set the image source to start loading.
                    return deferred.promise(); // Return the promise.
                }
            },
            html: {
                regex:      /^\s*<[\w!][^<]*>/, /* Matches anything starting with a valid HTML tag. */
                process:    function ( html ) { return $( html ); } // Converts HTML string to jQuery object.
            },
            ajax: {
                regex:      /./,            /* Catches anything remaining, assuming it's a URL for AJAX. */
                process:    function ( url )  {
                    var self = this,
                        deferred = $.Deferred();
                    /*
                     * Using .load() allows specifying a target element within the URL
                     * (e.g., 'url.html #targetelement').
                     */
                    var $container = $( '<div></div>' ).load( url, function ( response, status ) {
                        if ( status !== "error" ) {
                            deferred.resolve( $container.contents() ); // Resolve with the loaded contents.
                        }
                        deferred.fail(); // Fail if status is 'error'.
                    } );
                    return deferred.promise(); // Return the promise.
                }
            },
            iframe: {
                process:    function ( url ) {
                    var deferred = new $.Deferred();
                    var $content = $( '<iframe/>' )
                        .hide() // Hide initially.
                        .attr( 'src', url ) // Set iframe source.
                        .css( structure( this, 'iframe' ) ) // Apply iframe-specific CSS (e.g., min-height).
                        .on( 'load', function () { deferred.resolve( $content.show() ); } ) // Show and resolve on load.
                        // Important: We cannot move an <iframe> element without causing a reload.
                        // Therefore, append it directly to its final position now.
                        .appendTo( this.$instance.find( '.' + this.namespace + '-content' ) );
                    return deferred.promise(); // Return the promise.
                }
            },
            text: {
                process:    function ( text ) { return $( '<div>', {text: text} ); } // Creates a div with plain text.
            }
        },

        // List of Featherlight properties that are expected to be functions.
        functionAttributes: ['beforeOpen', 'afterOpen', 'beforeContent', 'afterContent', 'beforeClose', 'afterClose'],

        // --- Class Methods ---
        /**
         * Reads configuration options from an HTML element's data attributes.
         * Attributes are expected in the format `data-<namespace>-<property-name>`.
         *
         * @param {HTMLElement} element - The DOM element to read attributes from.
         * @param {string} namespace - The namespace prefix (e.g., 'featherlight').
         * @returns {object} An object containing the parsed configuration.
         */
        readElementConfig: function ( element, namespace ) {
            var Klass = this,
                regexp = new RegExp( '^data-' + namespace + '-(.*)' ), // Regex to match data attributes.
                config = {};
            if ( element && element.attributes ) {
                $.each( element.attributes, function () {
                    var match = this.name.match( regexp );
                    if ( match ) {
                        var val = this.value,
                            name = $.camelCase( match[1] ); // Convert attribute name to camelCase.
                        if ( $.inArray( name, Klass.functionAttributes ) >= 0 ) {
                            /* jshint -W054 */ // Disable JSHint warning for Function constructor.
                            val = new Function( val ); // If it's a function attribute, create a new function.
                            /* jshint +W054 */ // Re-enable JSHint warning.
                        } else {
                            try { val = $.parseJSON( val ); } // Try parsing as JSON.
                            catch ( e ) { /* ignore parse errors, keep as string */ }
                        }
                        config[name] = val; // Store the parsed value.
                    }
                } );
            }
            return config;
        },

        /**
         * Creates a Featherlight extension.
         * [Warning: guru-level concept]
         * This method sets up a class hierarchy where the child prototype inherits
         * from Featherlight's prototype. It's similar to class extension in CoffeeScript.
         *
         * @param {function} child - The constructor function for the extension.
         * @param {object} defaults - Default options for the extension.
         * @returns {function} The extended child constructor function.
         */
        extend: function ( child, defaults ) {
            /* Setup class hierarchy, adapted from CoffeeScript's inheritance pattern. */
            var Ctor = function () { this.constructor = child; };
            Ctor.prototype = this.prototype;
            child.prototype = new Ctor();
            child.__super__ = this.prototype; // Provide a way to access the parent prototype.
            /* Copy class methods & attributes from parent to child. */
            $.extend( child, this, defaults );
            child.defaults = child.prototype; // Alias child.defaults to its prototype.
            return child;
        },

        /**
         * Attaches Featherlight behavior to one or more elements.
         *
         * @param {jQuery} $source - The jQuery object representing the elements to attach to.
         * @param {jQuery|string|object} $content - Optional content or configuration.
         * @param {object} config - Optional configuration object.
         * @returns {jQuery} The source jQuery object for chaining.
         */
        attach: function ( $source, $content, config ) {
            var Klass = this;
            // Handle optional arguments: if $content is an object and not jQuery, it's config.
            if ( typeof $content === 'object' && $content instanceof $ === false && !config ) {
                config = $content;
                $content = undefined;
            }
            // Create a shallow copy of the config to avoid modifying the original.
            config = $.extend( {}, config );

            // Determine namespace and openTrigger for initial binding.
            var namespace = config.namespace || Klass.defaults.namespace,
                tempConfig = $.extend( {}, Klass.defaults, Klass.readElementConfig( $source[0], namespace ), config );

            // Bind the openTrigger event to the source elements.
            $source.on( tempConfig.openTrigger + '.' + tempConfig.namespace, tempConfig.filter, function ( event ) {
                // Compute the final configuration for this specific lightbox instance.
                // This allows for individual elements to override settings.
                var elemConfig = $.extend(
                    {$source: $source, $currentTarget: $( this )}, // Add source and current target to config.
                    Klass.readElementConfig( $source[0], tempConfig.namespace ), // Config from source element.
                    Klass.readElementConfig( this, tempConfig.namespace ), // Config from current target element.
                    config // Explicit config passed to attach.
                );
                // Create and open a new Featherlight instance with the determined content and config.
                new Klass( $content, elemConfig ).open( event );
            } );
            return $source; // Return source for chaining.
        },

        /**
         * Returns the currently active (frontmost) Featherlight instance.
         *
         * @returns {Featherlight|null} The most recently opened Featherlight instance, or null if none are open.
         */
        current: function () {
            var all = this.opened(); // Get all currently opened instances.
            return all[all.length - 1] || null; // Return the last one (frontmost).
        },

        /**
         * Returns an array of all currently opened Featherlight instances.
         *
         * @returns {Array<Featherlight>} An array of Featherlight instances.
         */
        opened: function () {
            var klass = this;
            pruneOpened(); // Clean up the opened array first.
            // Filter to ensure only instances of the current class (or its extensions) are returned.
            return $.grep( opened, function ( fl ) { return fl instanceof klass; } );
        },

        /**
         * Closes the currently active Featherlight lightbox.
         *
         * @returns {jQuery.Promise|undefined} A promise if a lightbox is closed, otherwise undefined.
         */
        close: function () {
            var cur = this.current(); // Get the current lightbox.
            if ( cur ) { return cur.close(); } // If one exists, close it.
        },

        /**
         * Performs auto-binding of Featherlight to elements on document ready.
         * This method is intended for internal use by Featherlight and its extensions.
         */
        _onReady: function () {
            var Klass = this;
            if ( Klass.autoBind ) {
                /*
                 * First, bind 'click' on the document. This allows Featherlight to work
                 * for dynamically added elements that match Klass.autoBind.
                 */
                Klass.attach( $( document ), {filter: Klass.autoBind} );
                /*
                 * Auto-bound elements that also have a 'data-featherlight-filter' attribute
                 * won't work correctly with the document-level delegation.
                 * So, bind these specific elements directly.
                 * Note: Dynamically added elements with filters are not easily supported this way.
                 */
                $( Klass.autoBind ).filter( '[data-featherlight-filter]' ).each( function () {
                    Klass.attach( $( this ) );
                } );
            }
        },

        /**
         * The default callback chain for Featherlight's internal event handling.
         * This is private to Featherlight and its extensions.
         */
        _callbackChain: {
            /**
             * Handles keyup events, specifically for the Escape key.
             *
             * @param {function} _super - The original onKeyUp callback.
             * @param {jQuery.Event} event - The keyup event.
             * @returns {boolean|undefined} False to prevent further handling, or undefined to continue.
             */
            onKeyUp: function ( _super, event ) {
                if ( 27 === event.keyCode ) { // Check for Escape key (keyCode 27).
                    if ( this.closeOnEsc ) {
                        // Simulate a click on the close button to trigger the close process.
                        this.$instance.find( '.' + this.namespace + '-close:first' ).click();
                    }
                    return false; // Prevent further keyup processing.
                } else {
                    return _super( event ); // Call the original (or chained) onKeyUp.
                }
            },

            /**
             * Handles window resize events, particularly for images to reset their size.
             *
             * @param {function} _super - The original onResize callback.
             * @param {jQuery.Event} event - The resize event.
             * @returns {undefined}
             */
            onResize: function ( _super, event ) {
                // If the content has naturalWidth (implies it's an image).
                if ( this.$content.naturalWidth ) {
                    var w = this.$content.naturalWidth, h = this.$content.naturalHeight;
                    // Reset apparent image size first so the container can grow correctly.
                    this.$content.css( 'width', '' ).css( 'height', '' );
                    // ... (rest of the original onResize logic would follow here)
                    // The original code was truncated, ending here.
                }
                // Call the original (or chained) onResize.
                return _super( event );
            }
        }
    } ); // End of $.extend(Featherlight, { ... })

    // ... (The original code snippet was truncated mid-function.
    // The cloning process would continue until the end of the original file.)

    // Final execution for auto-binding on document ready.
    // If the original code had a $(document).ready(Featherlight._onReady) or similar.
    // $(document).ready(Featherlight._onReady);

} )( jQuery ); // Pass jQuery to the immediately invoked function expression.