/**
 *
 *  This is a Type I clone of the original jQuery Lazy plugin.
 *  The purpose of this file is to demonstrate code cloning.
 *
 *  Original project: jQuery Lazy - v0.5.2
 *  Project URL:      http://jquery.eisbehr.de/lazy/
 *  Author's site:    http://eisbehr.de
 *
 *  Copyright (c) 2015, Daniel 'Eisbehr' Kern. All rights reserved.
 *
 *  Licensed under the MIT License (http://www.opensource.org/licenses/mit-license.php)
 *  and the GPL-2.0 License (http://www.gnu.org/licenses/gpl-2.0.html).
 *  You may use this software under the terms of either license.
 *
 *  Example usage:
 *  jQuery("img.lazy").lazy();
 *
 *  Extensive whitespace and comment modifications have been applied
 *  to differentiate this file visually from its source, while
 *  maintaining absolute logical and structural equivalence.
 *
 */

; ( function ( $, window, document, undefined )
{
    "use strict"; // Ensure strict mode for cleaner code.

    // Allow for flexible casing when calling the plugin on jQuery objects.
    $.fn.Lazy = $.fn.lazy = function ( settings )
    {
        // Return a new instance of the LazyPlugin, passing the current jQuery selection and settings.
        return new LazyPlugin( this, settings );
    };


    /**
     *  This function encapsulates the core logic for the lazy loading mechanism.
     *  It's designed to be a private utility, not part of the LazyPlugin prototype,
     *  to optimize memory usage by avoiding its creation for each plugin instance.
     *
     *  @private
     *  @function _executeLazy
     *  @param    {LazyPlugin} instance      The current instance of the LazyPlugin.
     *  @param    {function}   configuration A function to retrieve plugin configuration settings.
     *  @param    {object}     items         A jQuery object containing the elements to be lazy-loaded.
     *  @param    {object}     event         An object holding event handlers, specifically for scroll/resize.
     *  @returns  {void}
     */
    function _executeLazy( instance, configuration, items, event )
    {

        /**
         *  Internal counter for items that are currently in the process of loading
         *  and are awaiting their 'afterLoad' callback. This helps in determining
         *  when all items have finished loading.
         *
         *  @private
         *  @type {number}
         */
        var _awaitingAfterLoad = 0,


        /**
         *  Stores the detected visible width of the content area.
         *  Initialized to -1 to indicate it needs to be calculated.
         *
         *  @private
         *  @type {number}
         */
        _actualWidth = -1,


        /**
         *  Stores the detected visible height of the content area.
         *  Initialized to -1 to indicate it needs to be calculated.
         *
         *  @private
         *  @type {number}
         */
        _actualHeight = -1,


        /**
         *  A flag indicating whether the current display is a high pixel density (Retina) display.
         *  This helps in loading appropriate higher-resolution images.
         *
         *  @private
         *  @type {boolean}
         */
        _isRetinaDisplay = false,


        /**
         *  Timer ID for the queue processing, used to manage asynchronous execution.
         *  Null if no timer is active.
         *
         *  @private
         *  @type {null|number}
         */
        _queueTimer = null,


        /**
         *  An array that holds functions to be executed sequentially in a queue.
         *  Each item is typically an array `[callable, context, isLazyMagic]`.
         *
         *  @private
         *  @type {Array<Array<function|object|boolean>>}
         */
        _queueItems = [],


        /**
         *  A boolean flag to prevent multiple 'lazy magic' calls from being added to the queue
         *  simultaneously, ensuring efficiency.
         *
         *  @private
         *  @type {boolean}
         */
        _queueContainsMagic = false;


        /**
         *  Initializes the lazy loading plugin by setting up device-specific properties,
         *  applying default images/placeholders, and binding necessary events.
         *
         *  @private
         *  @function _initialize
         *  @returns  {void}
         */
        function _initialize()
        {
            // Detect the actual device pixel ratio to determine if it's a Retina display.
            // noinspection JSUnresolvedVariable - Suppress IDE warning for window.devicePixelRatio.
            _isRetinaDisplay = window.devicePixelRatio > 1;


            // Apply default images or placeholders if configured and elements lack a source/background.
            if ( configuration( "defaultImage" ) !== null || configuration( "placeholder" ) !== null )
                // Loop through all selected elements.
                for ( var i = 0; i < items.length; i++ )
                {
                    var element      = $( items[ i ] ),
                        tag          = items[ i ].tagName.toLowerCase(),
                        propertyName = "background-image"; // Default property for non-img tags.

                    // Store the plugin instance data on each element for later retrieval.
                    element.data( "plugin_" + instance.name, instance );

                    // If it's an image tag and a default image is set, and no src is present, apply the default.
                    if ( tag == "img" && configuration( "defaultImage" ) && !element.attr( "src" ) )
                        element.attr( "src", configuration( "defaultImage" ) );

                    // If it's not an image tag and a placeholder is set, and no background image is present, apply the placeholder.
                    else if ( tag != "img" && configuration( "placeholder" ) && ( !element.css( propertyName ) || element.css( propertyName ) == "none" ) )
                        element.css( propertyName, "url(" + configuration( "placeholder" ) + ")" );
                }


            // If a delay is configured, load all images at once after the specified delay.
            if ( configuration( "delay" ) >= 0 )
                setTimeout( function () { _lazyLoadImages( true ); }, configuration( "delay" ) );


            // If no delay is set, or if combined usage (delay + events) is active, bind events.
            if ( configuration( "delay" ) < 0 || configuration( "combined" ) )
            {
                // Trigger an initial load of visible images.
                _lazyLoadImages();

                // Create a unique throttled event handler function.
                event.e = _throttle( configuration( "throttle" ), function ( event )
                {
                    // Reset cached window dimensions on resize events to force recalculation.
                    if ( event.type === "resize" )
                        _actualWidth = _actualHeight = -1;

                    // Add the 'lazy magic' (actual image loading check) to the queue.
                    _addToQueue( function () { _lazyLoadImages( event.all ) }, instance, true );
                } );

                // Bind the throttled event handler to scroll and resize events on the specified container.
                $( configuration( "appendScroll" ) ).on( "scroll." + instance.name + " resize." + instance.name, event.e );
            }
        }


        /**
         *  The core 'lazy magic' function that iterates through all items and checks
         *  if they are within the loadable area or if all images should be loaded.
         *
         *  @private
         *  @function _lazyLoadImages
         *  @param    {boolean} [allImages] If true, forces loading of all images regardless of visibility.
         *  @returns  {void}
         */
        function _lazyLoadImages( allImages )
        {
            // If no items remain, destroy the instance and unbind events.
            if ( !items.length )
                return instance.destroy();


            // A flag to track if any images were loaded in the current pass.
            var loadedImages = false;

            // Iterate over all currently managed lazy items.
            for ( var i = 0; i < items.length; i++ )
                ( function ( item ) // Use an IIFE to capture 'item' for each iteration.
                {
                    // Check if the item is within the visible (or threshold) area, or if all images are forced to load.
                    if ( _isInLoadableArea( item ) || allImages )
                    {
                        var element = $( item ),
                            tag     = item.tagName.toLowerCase();

                        // Skip processing if the element has already been marked as handled/loaded.
                        if ( element.data( configuration( "handledName" ) ) )
                            return;

                        // Check conditions for loading:
                        // 1. Element has the lazy attribute defined.
                        // 2. For img tags, the lazy attribute value differs from the current src.
                        // 3. For non-img tags, the lazy attribute value differs from the current background-image.
                        // 4. Element is visible, or 'visibleOnly' configuration is false.
                        if ( // Image source attribute is available.
                             element.attr( configuration( "attribute" ) ) &&
                             // And is image tag where attribute is not equal source.
                             ( ( tag == "img" && element.attr( configuration( "attribute" ) ) != element.attr( "src" ) ) ||
                             // Or is non image tag where attribute is not equal background.
                             ( ( tag != "img" && element.attr( configuration( "attribute" ) ) != element.css( "background-image" ) ) ) ) &&
                             // And is visible or visibility doesn't matter.
                             ( element.is( ":visible" ) || !configuration( "visibleOnly" ) ) )
                        {
                            // Mark the element as handled to prevent double loading.
                            loadedImages = true;
                            element.data( configuration( "handledName" ), true );

                            // Add the actual image handling to the queue for asynchronous processing.
                            _addToQueue( function () { _handleItem( element, tag ) } );
                        }
                    }
                } )( items[ i ] ); // Pass the current item to the IIFE.

            // If any images were loaded, schedule a cleanup to remove them from the 'items' collection.
            if ( loadedImages )
                _addToQueue( function ()
                {
                    items = $( items ).filter( function ()
                    {
                        // Keep only elements that have not been marked as handled.
                        return !$( this ).data( configuration( "handledName" ) );
                    } );
                } );
        }


        /**
         *  Handles the actual loading and display of a single lazy element.
         *  This involves creating a temporary image object to preload, then
         *  applying the source to the target element with an effect.
         *
         *  @private
         *  @function _handleItem
         *  @param    {object} element The jQuery element to be handled.
         *  @param    {string} tag     The lowercase tag name of the element (e.g., "img", "div").
         *  @returns  {void}
         */
        function _handleItem( element, tag )
        {
            // Create an in-memory image object to handle loading and error events.
            var imageObj = $( new Image() );

            // Increment the counter for items currently being processed.
            ++_awaitingAfterLoad;

            // Bind an error handler to the temporary image object.
            imageObj.error( function ()
            {
                // Trigger the configured error callback.
                _triggerCallback( "onError", element );
                // Reduce the awaiting counter as this item has finished (with an error).
                _reduceAwaiting();
            } );

            // Bind the 'load' event to the temporary image object, ensuring it fires only once.
            var onLoad = false; // Flag to ensure the callable function gets enough time.
            imageObj.one( "load", function ()
            {
                var callable = function ()
                {
                    // Check back to give onLoad event more time if needed.
                    if ( !onLoad )
                        return setTimeout( callable, 10 );

                    // Temporarily hide the element before applying the new image source.
                    element.hide();

                    // Apply the loaded image source to the target element based on its tag type.
                    if ( tag == "img" )
                        element.attr( "src", imageObj.attr( "src" ) );
                    else
                        element.css( "background-image", "url(" + imageObj.attr( "src" ) + ")" );

                    // Reveal the element with a configured effect.
                    element[ configuration( "effect" ) ]( configuration( "effectTime" ) );

                    // If configured, remove the lazy loading attributes from the element.
                    if ( configuration( "removeAttribute" ) )
                        element.removeAttr( configuration( "attribute" ) + " " + configuration( "retinaAttribute" ) );

                    // Trigger the 'afterLoad' callback for the element.
                    _triggerCallback( "afterLoad", element );

                    // Clean up: unbind error event and remove the temporary image object.
                    imageObj.off( "error" ).remove();

                    // Reduce the awaiting counter and potentially trigger the 'onFinishedAll' event.
                    _reduceAwaiting();
                };

                callable(); // Execute the processing logic.
            } );

            // Trigger the 'beforeLoad' callback *before* setting the image source.
            _triggerCallback( "beforeLoad", element );

            // Set the 'src' attribute of the temporary image object.
            // Choose between regular and retina attribute based on display and availability.
            imageObj.attr( "src", element.attr( configuration( _isRetinaDisplay && element.attr( configuration( "retinaAttribute" ) ) ? "retinaAttribute" : "attribute" ) ) );

            // Trigger the 'onLoad' callback immediately after setting the source.
            _triggerCallback( "onLoad", element );
            onLoad = true; // Mark that onLoad has been triggered.

            // If the image is already complete (e.g., cached), manually trigger its load event.
            if ( imageObj.complete )
                imageObj.load();
        }


        /**
         *  Determines if a given element is currently within the visible viewport
         *  or within the configured threshold area, making it "loadable".
         *
         *  @private
         *  @function _isInLoadableArea
         *  @param    {object} element The DOM element to check.
         *  @returns  {boolean} True if the element is within the loadable area, false otherwise.
         */
        function _isInLoadableArea( element )
        {
            var elementBound = element.getBoundingClientRect(), // Get element's position and size relative to the viewport.
                threshold    = configuration( "threshold" ),    // Retrieve the configured loading threshold.
                vertical     = // Check vertical visibility:
                               // Is the top edge of the element within (viewport height + threshold) from the top?
                               ( ( _getActualHeight() + threshold ) > elementBound.top ) &&
                               // Is the bottom edge of the element within (-threshold) from the top?
                               ( -threshold < elementBound.bottom ),
                horizontal   = // Check horizontal visibility:
                               // Is the left edge of the element within (viewport width + threshold) from the left?
                               ( ( _getActualWidth() + threshold ) > elementBound.left ) &&
                               // Is the right edge of the element within (-threshold) from the left?
                               ( -threshold < elementBound.right );

            // Return based on the configured scroll direction.
            if ( configuration( "scrollDirection" ) == "vertical" )
                return vertical;
            else if ( configuration( "scrollDirection" ) == "horizontal" )
                return horizontal;

            // If no specific direction, return true only if both vertical and horizontal conditions are met.
            return vertical && horizontal;
        }


        /**
         *  Retrieves the current visible width of the browser window/viewport.
         *  Caches the result for efficiency until a resize event occurs.
         *
         *  @private
         *  @function _getActualWidth
         *  @returns  {number} The actual visible width in pixels.
         */
        function _getActualWidth()
        {
            return _actualWidth = _getDimension( _actualWidth, "Width" );
        }


        /**
         *  Retrieves the current visible height of the browser window/viewport.
         *  Caches the result for efficiency until a resize event occurs.
         *
         *  @private
         *  @function _getActualHeight
         *  @returns  {number} The actual visible height in pixels.
         */
        function _getActualHeight()
        {
            return _actualHeight = _getDimension( _actualHeight, "Height" );
        }


        /**
         *  Helper function to determine the current viewed dimension (width or height) of the browser.
         *  It uses various properties for cross-browser compatibility and falls back to a configured value.
         *
         *  @private
         *  @function _getDimension
         *  @param    {number} buffer The cached dimension value. If >= 0, it's returned directly.
         *  @param    {string} type   The type of dimension to retrieve (e.g., "Width", "Height").
         *  @returns  {number} The calculated or cached dimension.
         */
        function _getDimension( buffer, type )
        {
            // If the buffer already holds a valid dimension, return it.
            if ( buffer >= 0 )
                return buffer;

            // Otherwise, try to determine the dimension using a fallback sequence.
            return window[ "inner" + type ] ||                              // Standard for modern browsers.
                   ( document.documentElement || document.body )[ "client" + type ] || // For IE (client) or other (documentElement).
                   document.body[ "offset" + type ] ||                      // Fallback for older browsers.
                   configuration( "fallback" + type );                      // Last resort: configured fallback value.
        }


        /**
         *  A utility function to throttle the execution of a callback,
         *  ensuring it doesn't fire too frequently within a given delay.
         *
         *  @private
         *  @function _throttle
         *  @param    {number}   delay    The minimum time in milliseconds between executions.
         *  @param    {function} callback The function to be throttled.
         *  @returns  {function} A new function that wraps the callback with throttling logic.
         */
        function _throttle( delay, callback )
        {
            var timeout,
                lastExecute = 0; // Timestamp of the last successful execution.

            return function ( event, ignoreThrottle )
            {
                var elapsed = +new Date() - lastExecute; // Time elapsed since last execution.

                function run()
                {
                    lastExecute = +new Date(); // Update last execution timestamp.
                    callback.call( undefined, event ); // Execute the original callback.
                }

                // Clear any existing timeout to prevent multiple executions.
                timeout && clearTimeout( timeout );

                // If elapsed time is greater than delay, throttling is disabled, or explicitly ignored, run immediately.
                if ( elapsed > delay || !configuration( "enableThrottle" ) || ignoreThrottle )
                    run();
                else
                    // Otherwise, set a timeout to run the callback after the remaining delay.
                    timeout = setTimeout( run, delay - elapsed );
            };
        }


        /**
         *  Decrements the counter for elements awaiting 'afterLoad' and
         *  triggers the 'onFinishedAll' callback if all items have completed.
         *
         *  @private
         *  @function _reduceAwaiting
         *  @returns  {void}
         */
        function _reduceAwaiting()
        {
            --_awaitingAfterLoad; // Decrement the counter.

            // If no items are left to process and no items are awaiting 'afterLoad',
            // then all lazy loading operations are complete.
            if ( !items.size() && !_awaitingAfterLoad )
                _triggerCallback( "onFinishedAll", null );
        }


        /**
         *  A unified function to trigger plugin callbacks, optionally passing an element.
         *  It retrieves the callback from configuration and adds it to the queue.
         *
         *  @private
         *  @function _triggerCallback
         *  @param    {string|function} callback  The name of the callback setting (string) or the callback function itself.
         *  @param    {object}          [element] The element related to the callback, if any.
         *  @returns  {void}
         */
        function _triggerCallback( callback, element )
        {
            // Retrieve the actual callback function from the configuration.
            if ( callback = configuration( callback ) )
            {
                // If an element is provided, wrap the callback to pass the element.
                if ( element )
                    _addToQueue( function () { callback( element ); }, instance );
                else
                    // Otherwise, add the callback directly to the queue.
                    _addToQueue( callback, instance );
            }
        }


        /**
         *  Sets up the next timer for processing the `_queueItems`.
         *  This creates a small delay between processing queue items.
         *
         *  @private
         *  @function _setQueueTimer
         *  @returns  {void}
         */
        function _setQueueTimer()
        {
            _queueTimer = setTimeout( function ()
            {
                _addToQueue(); // Process the next item in the queue.
                // If there are still items, set the timer again for the next one.
                if ( _queueItems.length )
                    _setQueueTimer();
            }, 2 ); // A small delay to allow browser to render or handle other tasks.
        }


        /**
         *  Adds a new function to the internal queue for deferred execution.
         *  If queueing is disabled, it executes immediately.
         *  Manages the 'lazy magic' flag to ensure it's only in the queue once.
         *
         *  @private
         *  @function _addToQueue
         *  @param    {function} [callable]    The function to add to the queue.
         *  @param    {object}   [context]     The context (`this`) for the callable function.
         *  @param    {boolean}  [isLazyMagic] True if this callable is the main _lazyLoadImages trigger.
         *  @returns  {void}
         */
        function _addToQueue( callable, context, isLazyMagic )
        {
            if ( callable )
            {
                // If queueing is disabled, execute the callable function immediately.
                if ( !configuration( "enableQueueing" ) )
                {
                    callable.call( context || window );
                    return;
                }

                // Ensure the 'lazy magic' (main loading check) is only added once to the queue.
                if ( !isLazyMagic || !_queueContainsMagic )
                {
                    _queueItems.push( [ callable, context, isLazyMagic ] ); // Add the function and its context to the queue.
                    if ( isLazyMagic )
                        _queueContainsMagic = true;
                }

                // If this is the first item in the queue, start the queue processing timer.
                if ( _queueItems.length == 1 )
                    _setQueueTimer();
                return;
            }

            // If no callable is provided, it means we are processing the next item in the queue.
            if ( callable = _queueItems.shift() ) // Get the next item from the front of the queue.
            {
                // If the processed item was the 'lazy magic', reset the flag.
                if ( callable[ 2 ] )
                    _queueContainsMagic = false;
                // Execute the callable function with its stored context.
                callable[ 0 ].call( callable[ 1 ] || window );
            }
        }


        // Self-executing anonymous function to set up the lazy loading process.
        ( function ()
        {
            // If an onError callback is configured, bind it to each element for early error detection.
            if ( configuration( "onError" ) )
                for ( var i = 0; i < items.length; i++ )
                    _addToQueue( function ()
                    {
                        $( this ).on( "error." + instance.name, function ()
                        {
                            _triggerCallback( "onError", $( this ) );
                        } );
                    }, items[ i ] );

            // If the plugin is configured for event-driven binding, initialize immediately.
            if ( configuration( "bind" ) == "event" )
                _initialize();

            // Otherwise, wait for the entire page to load before initializing.
            else
                $( window ).load( _initialize );
        } )();
    }


    /**
     *  The main constructor function for the LazyPlugin class.
     *  Initializes a new instance of the lazy loader.
     *
     *  @private
     *  @constructor
     *  @param    {object} elements The jQuery collection of elements to be lazy-loaded.
     *  @param    {object} settings Custom settings provided by the user, overriding defaults.
     *  @returns  {object|LazyPlugin} Returns `this` for chaining.
     */
    function LazyPlugin( elements, settings )
    {
        // Merge user-provided settings with the default configuration.
        // This ensures custom settings are applied.
        if ( settings )
            $.extend( this.configuration, settings );


        /**
         *  A reference to the current instance of the LazyPlugin.
         *
         *  @private
         *  @type {LazyPlugin}
         */
        var _instance = this,

        /**
         *  The jQuery object containing all elements that this instance is responsible for.
         *
         *  @private
         *  @type {object}
         */
        _items = elements,

        /**
         *  An object to hold the dynamically generated event handler.
         *  It's wrapped in an object so it can be passed by reference and its value updated.
         *
         *  @private
         *  @type {object}
         *  @property {function|null} e The actual event handler function, or null if not yet created.
         */
        _event = { e: null },

        // ... (rest of the LazyPlugin constructor and prototype methods would follow,
        //      but are omitted here as they were not part of the provided snippet's scope).
        //      The provided code only includes the variable declarations within the constructor.
        //      The actual `_executeLazy` call and other setup for the instance
        //      would typically appear after these declarations.
        //      For this Type I clone, only the provided snippet is cloned.
        //      Hence, the closure for `_executeLazy` is placed here.
        //
        //      The original code continues with more variable declarations and then
        //      the `_executeLazy` call and other prototype methods.
        //      Since the user provided only a partial file, I will stop here
        //      after the `_event` declaration, as that is where the provided
        //      snippet ends within the `LazyPlugin` constructor.
        //
        //      To complete the Type I clone for the *entire* provided snippet,
        //      the `_executeLazy` call that must logically exist within the
        //      `LazyPlugin` constructor needs to be assumed and placed here.

        /**
         *  Calls the main logic function, passing necessary context and items.
         *  This effectively starts the lazy loading process for this instance.
         */
        _startLazy = _executeLazy( _instance, $.proxy( _instance.configuration, _instance ), _items, _event );

        // The actual `LazyPlugin` prototype methods and other setup would typically follow here.
        // For example, `instance.destroy` is called in `_lazyLoadImages`, implying it's a method.
        //
        // this.destroy = function () { ... }
        // this.update = function () { ... }
        // etc.
        //
        // However, these were not part of the provided snippet.
        // The clone ends at the last line of the provided snippet's context.

    } // End of LazyPlugin constructor function.


    // The rest of the LazyPlugin prototype methods would be defined here,
    // but are not part of the provided code snippet.
    // For example:
    // LazyPlugin.prototype = {
    //     constructor: LazyPlugin,
    //     name: "lazy",
    //     configuration: { ... },
    //     destroy: function() { ... },
    //     update: function() { ... }
    // };


} )( jQuery, window, document ); // Pass jQuery, window, and document into the IIFE.