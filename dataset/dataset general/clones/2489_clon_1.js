/*
 * Freetile.js v0.3.1
 * A dynamic layout plugin for jQuery.
 *
 * This file is part of the Freetile.js project.
 * It provides core functionalities for dynamic tiling layouts.
 */
//
//  Copyright (c) 2010-2013, Ioannis (Yannis) Chatzikonstantinou, All rights reserved.
//  http://www.yconst.com
//
//  Redistribution and use in source and binary forms, with or without modification,
//  are permitted provided that the following conditions are met:
//      - Redistributions of source code must retain the above copyright
//  notice, this list of conditions and the following disclaimer.
//      - Redistributions in binary form must reproduce the above copyright
//  notice, this list of conditions and the following disclaimer in the documentation
//  and/or other materials provided with the distribution.
//
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
//  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
//  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
//  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
//  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
//  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
//  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
//  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY
//  OF SUCH DAMAGE.
//

/*
 * This is an Immediately Invoked Function Expression (IIFE).
 * It creates a private scope for the plugin,
 * preventing variables from leaking into the global namespace.
 * The '$' alias is passed, ensuring jQuery compatibility,
 * even if another library uses '$'.
 */
( function( $ )
{

    "use strict" ; /* Enforces stricter parsing and error handling in code. */


    //
    // Entry Point for the jQuery plugin.
    // This is where users will interact with Freetile.js.
    // _________________________________________________________

    $.fn.freetile = function( method ) /* Main plugin function, accepts a method name or options object. */
    {
        // Method calling logic:
        // Checks if the requested method exists within the Freetile object.
        if ( typeof Freetile[ method ] === 'function' )
        {
          // If it's a valid function, call it with the current jQuery object ('this')
          // and pass along any additional arguments.
          return Freetile[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ) ) ;
        }
        // If the argument is an object or undefined, assume it's an initialization call.
        else if ( typeof method === 'object' || ! method )
        {
          // Call the 'init' method.
          return Freetile.init.apply( this, arguments ) ;
        }
        // If none of the above, the method does not exist.
        else
        {
          // Output an error message to the console.
          $.error( 'Method ' +  method + ' does not exist on jQuery.Freetile' ) ;
        }

        // Return the jQuery object for chaining.
        return this ;
    } ;


    /*
     * The core Freetile object, containing all plugin methods and properties.
     * This object is not directly exposed globally but is accessed via `$.fn.freetile`.
     */
    var Freetile =
    {
        //
        // "Public" Methods of the Freetile object.
        // These methods are callable via `$(selector).freetile('methodName', args)`.
        // _________________________________________________________

        /**
         * Method 1: The primary entry point for initializing, re-laying out, or appending elements.
         * This method intelligently determines the desired action based on the current state and options.
         * @param {object} options - Configuration options for Freetile.
         * @returns {jQuery} The container element for chaining.
         */
        init : function( options )
        {
            // Cache the container element for easier access.
            var container = this ,
                // Setup and retrieve the merged options object.
                o = Freetile.setupOptions( container, options ) ,
                // Get new content to append, if any.
                c = Freetile.newContent( o.contentToAppend ) ;

            // Set up event bindings for resize and custom events if not already done.
            if ( !o.tiled ) {
                Freetile.setupContainerBindings( container, o ) ;
            }

            // If there's content to append AND the container has been previously tiled,
            // proceed in append mode.
            if ( o.tiled && c )
            {
                // Append the new content to the container.
                container.append( c ) ;
                // Filter the newly appended content and ensure images are loaded
                // before positioning them.
                c.filter( o.selector || '*' ).filter( o.loadCheckSelector ).imagesLoaded( function()
                {
                    // Once images are loaded, position all elements.
                    Freetile.positionAll( container, o ) ;
                } ) ;
            }
            // Otherwise (if not tiled yet, or no new content to append),
            // just position the existing elements.
            else
            {
                // Ensure images in existing children are loaded before positioning.
                container.children( o.loadCheckSelector ).imagesLoaded( function()
                {
                    Freetile.positionAll( container, o ) ;
                } ) ;
            }

            // Return the container for method chaining.
            return container ;
        } ,

        /**
         * Method 2: Appends new content to an already tiled container.
         * This method is a specialized version of `init`, focusing only on appending.
         * @param {object} options - Configuration options, specifically `contentToAppend`.
         * @returns {jQuery} The container element for chaining.
         */
        append : function( options )
        {
            var container = this , // Reference to the current jQuery object (container).
                o = Freetile.setupOptions( container, options ) , // Get the current options.
                c = Freetile.newContent( o.contentToAppend ) ; // Check for new content.

            // Only append if the container is already tiled and new content exists.
            if ( o.tiled && c )
            {
                // Add content to the DOM.
                container.append( c ) ;
                // Wait for images within the new content to load.
                c.filter( o.loadCheckSelector ).imagesLoaded( function()
                {
                    Freetile.positionAll( container, o ) ; // Then re-position everything.
                } ) ;
            }

            return container ; // Allow chaining.
        } ,

        /**
         * Method 3: Performs a single layout pass of all elements.
         * This method does not handle appending or event bindings; it's purely for layout.
         * @param {object} options - Configuration options.
         * @returns {jQuery} The container element for chaining.
         */
        layout : function( options )
        {
            var container = this , // Store the container.
                o = Freetile.setupOptions( container, options ) ; // Set up options.

            // Position all elements within the container.
            Freetile.positionAll( container, o ) ;

            return container ; // Enable method chaining.
        } ,

        /**
         * Method 4: Destroys the Freetile instance on a container.
         * This removes all bindings and inline styles applied by Freetile.
         * @returns {boolean} True if destruction was successful.
         */
        destroy: function()
        {
            var container = this , // Get the container element.
                options = container.data( 'FreetileData' ) ; // Retrieve stored options.

            // Remove inline styles from all child elements managed by Freetile.
            Freetile.resetElementsStyle( container, options ) ;
            // Remove inline style from the container itself.
            $( container ).attr( "style", "" ) ;
            // Unbind the window resize event handler.
            $( window ).off( "resize", this.windowResizeCallback ) ;
            // Unbind any custom event handlers.
            container.off( options.customEvents, this.customEventsCallback ) ;

            return true ; // Indicate successful destruction.
        } ,

        //
        // "Internal" Methods
        // These methods are used internally by the Freetile object and are not
        // directly exposed via the jQuery plugin interface.
        // _________________________________________________________

        /**
         * Sets up and merges options for the Freetile instance.
         * This function handles default options, stored data, and user-provided options.
         * @param {jQuery} container - The container element.
         * @param {object} options - User-provided options.
         * @returns {object} The merged and processed options object.
         */
        setupOptions : function( container, options )
        {
            // Retrieve any existing Freetile data from the container.
            // If it doesn't exist, it's the first time Freetile is called on this container.
            var containerData = container.data( 'FreetileData' ) ;

            // Generate the final options object by merging defaults, stored data,
            // reset properties, and new user options. The `true` argument
            // ensures a deep merge.
            var newOptions = $.extend( true,
                { } , // Start with an empty object to prevent modifying defaults directly.
                this.defaults , // Base default options.
                containerData , // Previously stored options (if any).
                this.reset , // Options to reset for a new layout pass.
                options // User-provided options, taking highest precedence.
            ) ;

            // Store the newly generated options object back on the container.
            container.data( 'FreetileData', newOptions ) ;

            // Determine if the container has been processed by Freetile before.
            // This is useful for deciding whether to animate or setup bindings.
            newOptions.tiled = ( containerData !== undefined ) ;

            // Calculate the actual animation state (_animate).
            // Animation is only possible if:
            // 1. The 'animate' option is true.
            // 2. The container has been tiled before (not the first run).
            // 3. No new content is being appended (animation for appending is typically handled differently).
            newOptions._animate = newOptions.animate && newOptions.tiled && $.isEmptyObject( newOptions.contentToAppend ) ;

            // Set up the callback function. If 'persistentCallback' is true and a callback
            // is provided, use it; otherwise, use an empty function to prevent errors.
            this.reset.callback = newOptions.persistentCallback && newOptions.callback ? newOptions.callback : function( ) { } ;

            return newOptions ; // Return the complete options object.
        } ,

        /**
         * Callback function for window resize events.
         * This is throttled to prevent excessive re-layouts during resizing.
         * @param {jQuery} container - The container element.
         * @param {number} curWidth - Current window width.
         * @param {number} curHeight - Current window height.
         */
        windowResizeCallback: function( container, curWidth, curHeight )
        {
            // Clear any existing timeout to reset the throttle.
            clearTimeout( container.data( "FreetileTimeout" ) ) ;
            // Set a new timeout to delay the layout call.
            container.data( "FreetileTimeout", setTimeout( function( )
            {
                var win = $( window ) , // Get the window object.
                    newWidth = win.width( ) , // Get current window width.
                    newHeight = win.height( ) ; // Get current window height.

                // Only call the layout function if the window size has actually changed.
                if ( newWidth != curWidth || newHeight != curHeight )
                {
                    curWidth = newWidth ; // Update stored width.
                    curHeight = newHeight ; // Update stored height.
                    container.freetile( 'layout' ) ; // Trigger a re-layout.
                }
            } , 400 ) ) ; // 400ms debounce delay.
        } ,

        /**
         * Callback function for custom events.
         * This is also throttled to prevent rapid, successive re-layouts.
         * 'this' context refers to the container due to $.proxy.
         * @param {jQuery} container - The container element.
         */
        customEventsCallback: function( container )
        {
            // Clear any previous timeout.
            clearTimeout( container.data( "FreetileTimeout" ) ) ;
            // Set a new timeout for layout.
            container.data( "FreetileTimeout", setTimeout( function( ) { container.freetile( 'layout' ) ; } , 400 ) ) ;
        } ,

        /**
         * Sets up event listeners for the container, such as window resize and custom events.
         * These bindings are typically only set up once during the first initialization.
         * @param {jQuery} container - The container element.
         * @param {object} o - The options object.
         * @returns {jQuery} The container element for chaining.
         */
        setupContainerBindings : function( container, o )
        {
            // Bind to window resize event if 'containerResize' option is true.
            if ( o.containerResize )
            {
                var win = $( window ) , // Get the window object.
                    curWidth = win.width( ) , // Initial window width.
                    curHeight = win.height( ) ; // Initial window height.

                // Bind the throttled resize callback, preserving 'this' context and passing initial dimensions.
                win.resize( $.proxy( this.windowResizeCallback, container, container, curWidth, curHeight ) ) ;
            }
            // Bind to custom events if 'customEvents' option is defined.
            if ( o.customEvents )
            {
                // Bind the throttled custom events callback.
                container.bind( o.customEvents, $.proxy( this.customEventsCallback, container, container ) ) ;
            }

            return container ; // Allow chaining.
        } ,

        /**
         * Checks if the provided content is valid and returns it as a jQuery object.
         * @param {string|jQuery|object} content - The content to check.
         * @returns {jQuery|boolean} A jQuery object if content is valid, otherwise false.
         */
        newContent : function( content )
        {
            // Check if content is a non-empty object (jQuery object, plain object)
            // OR if it's a string that selects existing DOM elements.
            if ( ( typeof content === 'object' && !$.isEmptyObject( content ) )
                || ( typeof content === 'string' && $( content ).length ) )
            {
                return $( content ) ; // Convert to jQuery object if not already.
            }

            return false ; // No valid content found.
        } ,

        /**
         * Calculates the optimal positions for all given elements within the container.
         * This is the core layout logic.
         * @param {jQuery} container - The container element.
         * @param {jQuery} elements - The collection of elements to position.
         * @param {object} o - The options object.
         */
        calculatePositions : function( container, elements, o ) // Container, elements, options
        {
            // Position index visualization:
            // |    |   |       Old columns
            // |      |         New column
            // ^        ^
            // Start    End

            // Iterate over each element to calculate its position.
            elements.each( function( i )
            {
                // Variable declaration for the current element's properties and calculation state.
                var $this = $( this ) , // The current element being processed.
                    j = 0 ; // Loop counter for column iteration.

                // Store current element's dimensions.
                o.ElementWidth = $this.outerWidth( true ) ;
                o.ElementHeight = $this.outerHeight( true ) ;

                // Initialize positioning variables for the current element.
                o.ElementTop = 0 ;
                o.ElementIndex = i ; // Index of the element in the current iteration.
                o.IndexStart = 0 ; // Starting column index for the element's span.
                o.IndexEnd = 0 ; // Ending column index for the element's span.
                o.BestScore = 0 ; // Score of the best position found so far.
                o.TestedTop = 0 ; // Top position during testing.
                o.TestedLeft = 0 ; // Left position during testing.


                // 1.   Determine Element Position
                // ___________________________________________________

                // Find out the true top position of the element if placed at the first available column (index 0).
                // This accounts for the element potentially spanning multiple initial columns.
                o.TestedTop = o.currentPos[ 0 ].top ;
                for ( j = 1 ; j < o.currentPos.length && o.currentPos[ j ].left < o.ElementWidth ; j++ )
                {
                    o.TestedTop = Math.max( o.TestedTop, o.currentPos[ j ].top ) ;
                }
                o.ElementTop = o.TestedTop ; // Initial best top position.
                o.IndexEnd = j ; // Initial best ending column index.
                o.BestScore = o.scoreFunction( o ) ; // Calculate the initial score for this position.

                // At this point, the element has been "placed" at position 0, and its score calculated.
                // Now, investigate the rest of the available positions to find a better fit.
                for ( var i = 1 ; ( i < o.currentPos.length ) && ( o.currentPos[ i ].left + o.ElementWidth <= o.containerWidth ) ; i++ )
                {
                    o.TestedLeft = o.currentPos[ i ].left ; // Current left position being tested.
                    o.TestedTop = o.currentPos[ i ].top ; // Current top position being tested.

                    // Check if the element would span multiple columns from the current 'i' position.
                    for ( j = i + 1 ; ( j < o.currentPos.length ) && ( o.currentPos[ j ].left - o.currentPos[ i ].left < o.ElementWidth ) ; j++ )
                    {
                        o.TestedTop = Math.max( o.TestedTop, o.currentPos[ j ].top ) ; // Adjust top if a spanned column is taller.
                    }

                    var NewScore = o.scoreFunction( o ) ; // Calculate score for this new potential position.
                    // If the new position yields a better score, update the best position.
                    if ( NewScore > o.BestScore )
                    {
                        o.IndexStart = i ; // Update starting column index.
                        o.IndexEnd = j ; // Update ending column index.
                        o.ElementTop = o.TestedTop ; // Update best top position.
                        o.BestScore = NewScore ; // Update best score.
                    }
                }
                // At this point, o.IndexEnd is guaranteed to be within valid bounds (1 <= o.IndexEnd <= Len).


                // 2.   Apply Element Position
                // ___________________________________________________

                // Get the current position of the element in the DOM.
                var curpos = $this.position( ) ,

                // Calculate the new, desired position for the element.
                    pos =
                    {
                        left: o.currentPos[ o.IndexStart ].left + o.xPadding ,
                        top: o.ElementTop + o.yPadding
                    } ;

                // Position the element only if its position has actually changed.
                // This optimization avoids unnecessary DOM manipulations/animations
                // when re-arranging an already packed layout where some elements might not move.
                if ( curpos.top != pos.top || curpos.left != pos.left )
                {
                    // Create an animation object to be added to the style queue.
                    var aniObj = { el : $this, f : 'css', d : 0 } ;

                    // Check if animation is possible and requested for this element.
                    if ( o._animate && !$this.hasClass( 'noanim' ) )
                    {
                        // Get current offset for viewport calculation.
                        var curoffset = $this.offset( ) ,

                        // Calculate the new offset based on the new position and current offset.
                        offset =
                        {
                            left: pos.left + ( curoffset.left - curpos.left ) ,
                            top: pos.top + ( curoffset.top - curpos.top )
                        } ;

                        // Animate only if:
                        // 1. The 'animate' option is enabled and possible.
                        // 2. The element does not have the 'noanim' class.
                        // 3. The element is currently within or will move into the viewport.
                        if ( ( curoffset.top + o.ElementHeight > o.viewportY && curoffset.top < o.viewportYH ||
                             offset.top + o.ElementHeight > o.viewportY && offset.top < o.viewportYH ) )
                        {
                            aniObj.f = 'animate' ; // Set function to 'animate'.
                            aniObj.d = o.currentDelay ; // Set delay for staggered animation.

                            ++( o.iteration ) ; // Increment iteration counter (for callback tracking).
                            // Increase the animation delay for the next element, creating a staggered effect.
                            o.currentDelay += o.elementDelay ;
                        }
                    }
                    aniObj.style = pos ; // Assign the calculated style.
                    o.styleQueue.push( aniObj ) ; // Add the animation object to the queue.
                }
                // Decrement the iteration counter. This is crucial for knowing when all animations are done.
                 --( o.iteration ) ;

                // 3.   Reconstruct Columns (Update the 'currentPos' array)
                // ___________________________________________________

                // a.   Store the height of the last element of the span.
                //      If a new insertion point is to be inserted at the end of the
                //      new element's span, it should have this height.
                var LastSpanTop = o.currentPos[ o.IndexEnd - 1 ].top ,
                    // Get the right edge of the span, or container width if it's the last column.
                    LastSpanRight = o.currentPos[ o.IndexEnd ] ? o.currentPos[ o.IndexEnd ].left : o.containerWidth ,
                    // Calculate the right edge of the current element.
                    ElementRight = o.currentPos[ o.IndexStart ].left + o.ElementWidth ;

                // b.   Update the height in the insertion column (the column where the element started).
                // This marks the new available top position in that column.
                o.currentPos[ o.IndexStart ].top = o.ElementTop + o.ElementHeight ;

                // c. If there are columns *after* the insertion point that were covered by the new element,
                //    remove them. Also, if there's leftover space to the right of the element
                //    (i.e., the element doesn't fill the entire spanned width), add a new insertion point.
                if ( ElementRight < LastSpanRight )
                {
                    // Splice: remove covered columns and insert a new point at ElementRight.
                    o.currentPos.splice( o.IndexStart + 1, o.IndexEnd - o.IndexStart - 1, { left: ElementRight, top: LastSpanTop } ) ;
                }
                else
                {
                    // Just remove the covered columns.
                    o.currentPos.splice( o.IndexStart + 1, o.IndexEnd - o.IndexStart - 1 ) ;
                }
            } ) ; // End of elements.each()
        } ,

        /**
         * Prepares elements for positioning by setting their display and position styles.
         * @param {jQuery} container - The container element.
         * @param {jQuery} elements - The collection of elements to prepare.
         * @param {object} o - The options object.
         */
        prepareElements: function( container, elements, o ) // Container, elements, options
        {
            // Set elements display to 'block' (to ensure correct width/height calculation)
            // and position to 'absolute' (for precise positioning).
            elements.each( function( )
            {
                var $this = $( this ) ;
                // Only set display to block if the element is currently visible.
                if ( $this.is( ':visible' ) )
                {
                    $this.css( { 'display' : 'block' } ) ;
                }
            } ).css( { 'position' : 'absolute' } ) ; // Apply absolute positioning to all.
        } ,

        /**
         * Processes the style queue, applying calculated styles/animations to elements.
         * This approach, similar to jQuery Masonry, batches DOM updates for performance.
         * @param {object} o - The options object containing the styleQueue.
         */
        applyStyles : function( o )
        {
            var obj ; // Variable to hold the current object from the queue.
            // Iterate through each object in the style queue.
            for ( var i = 0 , len = o.styleQueue.length ; i < len ; i++ )
            {
                obj = o.styleQueue[ i ] ;

				// Use CSS Transforms (translate3d) if available for smoother animations.
				if ( o.csstransforms3d ) {
					var translate3d = "translate3d(" + obj.style.left + "px," + obj.style.top + "px,0)" ;

					// Apply vendor-prefixed transform styles.
					obj.el.css( "-moz-transform", translate3d ) ;
					obj.el.css( "-webkit-transform", translate3d ) ;
					obj.el.css( "-o-transform", translate3d ) ;
					obj.el.css( "-ms-transform", translate3d ) ;
					obj.el.css( "transform", translate3d ) ;

					// Invoke the callback when the CSS transition ends.
					if ( o.animationOptions.complete != null ) {
						obj.el.on( 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function ( e ) {
							// Remove the event listener to prevent multiple calls.
							$( this ).off( "webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend" ) ;
							// Call the user-defined complete callback.
							o.animationOptions.complete.call( o ) ;
						} ) ;
					}
				}
				// Fallback to jQuery's animate or css method if transforms are not used.
				else {
					if ( obj.f == 'animate' )
					{
						// Apply staggered animation with delay.
						obj.el.delay( obj.d ).animate( obj.style, $.extend( true, { } , o.animationOptions ) ) ;
					}
					else
					{
						// Apply styles directly via CSS.
						obj.el.css( obj.style ) ;
					}
				}
            }
        } ,

        /**
         * Main layout algorithm function. Coordinates the entire layout process.
         * From element retrieval to positioning and style application.
         * _________________________________________________________
         * @param {jQuery} container - The container element.
         * @param {object} o - The options object.
         */
        positionAll : function( container, o )
        {
            //
            // 1. Initialize Layout Process
            //

            // Determine which elements to process based on whether content is being appended.
            var Elements ;
            if ( $.isEmptyObject( o.contentToAppend ) )
            {
                // If no new content, get children based on selector or all children.
                Elements = o.selector ? container.children( o.selector ) : container.children( ) ;
            }
            else
            {
                // If new content is specified, filter it by the selector.
                Elements = o.selector ? o.contentToAppend.filter( o.selector ) : o.contentToAppend ;
            }

            // Count the number of elements found.
            o.ElementsCount = Elements.length ;

            // If the container is empty (no elements to tile), reset its state and return.
            if ( !o.ElementsCount )
            {
                container.data( "FreetilePos", null ) ; // Clear stored positions.
                // Call the user-defined callback if it's a function.
                if ( typeof( o.callback == "function" ) )
                {
                    o.callback( o ) ;
                }
                // Set container height to 0, potentially with animation.
                container[ o._animate && o.containerAnimate ? 'animate' : 'css' ]( { 'height' : '0px' } ) ;
                return container ; // Return container for chaining.
            }

            // Store the container's current display and visibility properties.
            // These might be temporarily altered during layout to prevent flickering.
            var disp = container.css( 'display' ) || '' ;
            var vis = container.css( 'visibility' ) || '' ;

            // ... (rest of positionAll method logic would follow here)
            // The provided code snippet ends abruptly here.
            // A complete implementation would continue with:
            // - Temporarily hiding the container.
            // - Preparing elements (setting display:block, position:absolute).
            // - Calculating column positions.
            // - Calling calculatePositions for each element.
            // - Applying styles from the queue.
            // - Restoring container visibility.
            // - Calling final callback.
        } ,

        // Default options for Freetile.
        defaults :
        {
            // General layout options
            selector            : null,             // Selector for items to be tiled. Defaults to all children.
            animate             : false,            // Enable/disable animations.
            elementDelay        : 0,                // Staggered animation delay between elements.
            containerAnimate    : false,            // Animate container height changes.
            persistentCallback  : false,            // If true, callback is called on every layout pass.
            callback            : function(){},     // Callback function executed after layout completes.
            sortAlgorithm       : null,             // Custom sorting algorithm for elements.
            scoreAlgorithm      : null,             // Custom scoring algorithm for position selection.
            xPadding            : 0,                // Horizontal padding between elements.
            yPadding            : 0,                // Vertical padding between elements.
            containerResize     : true,             // Bind to window resize events for automatic relayout.
            customEvents        : null,             // Custom events that trigger a relayout.
            singleColumn        : false,            // Force a single column layout.
            minColumns          : 1,                // Minimum number of columns.
            maxColumns          : 0,                // Maximum number of columns (0 for unlimited).
            columnWidth         : 0,                // Fixed column width. 0 for fluid.
            gutter              : 0,                // Space between columns.
            buffer              : 0,                // Extra space added to container height.
            loadCheckSelector   : 'img',            // Selector for elements whose images must load before layout.

            // Animation options for jQuery.animate()
            animationOptions    :
            {
                duration: 400,
                easing: 'linear',
                queue: false
            }
        },

        // Options that are reset before each layout pass.
        reset :
        {
            currentPos          : [],               // Current column positions.
            currentDelay        : 0,                // Current animation delay for staggered effects.
            iteration           : 0,                // Counter for active animations/callbacks.
            containerWidth      : 0,                // Width of the container.
            ElementWidth        : 0,                // Width of the current element being processed.
            ElementHeight       : 0,                // Height of the current element.
            ElementTop          : 0,                // Top position of the current element.
            ElementIndex        : 0,                // Index of the current element.
            IndexStart          : 0,                // Starting column index for the current element.
            IndexEnd            : 0,                // Ending column index for the current element.
            BestScore           : 0,                // Best score found for element's position.
            TestedTop           : 0,                // Top position being tested.
            TestedLeft          : 0,                // Left position being tested.
            ElementsCount       : 0,                // Total number of elements.
            styleQueue          : [],               // Queue for applying styles/animations.
            viewportY           : 0,                // Viewport Y coordinate.
            viewportYH          : 0,                // Viewport Y coordinate + height.
            callback            : function(){},     // Placeholder for callback.
            _animate            : false,            // Internal flag for animation state.
            contentToAppend     : null,             // Content to append in the current pass.
            csstransforms3d     : false             // Flag for 3D CSS transforms support.
        }
    } ; // End of Freetile object.

} ) ( jQuery ) ; // Pass jQuery object to the IIFE.