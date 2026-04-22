/*
 * LayoutGrid.js v0.3.1
 * A flexible grid layout solution for web pages.
 */

//
//  Copyright (c) 2010-2013, Ioannis (Yannis) Chatzikonstantinou, All rights reserved.
//  http://www.yconst.com
//
//  This software is provided under the terms of the BSD 3-Clause License.
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

( function( $ )
{
    "use strict"; // Enforce stricter parsing and error handling.

    //
    // Plugin Initialization Point for jQuery
    // _________________________________________________________

    $.fn.gridArrange = function( instruction )
    {
        // Logic for dispatching calls to internal methods.
        if ( typeof LayoutManager[ instruction ] === 'function' )
        {
            // Call the specified method on the LayoutManager object.
            return LayoutManager[ instruction ].apply( this, Array.prototype.slice.call( arguments, 1 ) );
        }
        else if ( typeof instruction === 'object' || !instruction )
        {
            // If no specific method is given or an options object is passed,
            // default to the initialization method.
            return LayoutManager.beginLayout.apply( this, arguments );
        }
        else
        {
            // Inform the user about an invalid method call.
            $.error( 'Operation "' + instruction + '" is not recognized by $.GridArrangement.' );
        }

        // Return the jQuery object for chaining.
        return this;
    };

    var LayoutManager =
    {
        //
        // Externally Accessible Routines
        // _________________________________________________________

        // Routine 1.
        // A versatile method that intelligently decides whether to
        // initialize, re-arrange, or append new items.
        beginLayout : function( userConfig )
        {
            var parentContainer = this, // The jQuery object representing the container.
                currentConfig = LayoutManager.prepareConfiguration( parentContainer, userConfig ),
                newElements = LayoutManager.obtainContent( currentConfig.itemsToAdd );

            // Set up event handlers for the container if it hasn't been processed yet.
            if ( !currentConfig.hasBeenLaidOut ) LayoutManager.establishEventHandlers( parentContainer, currentConfig );

            // If there's new content and the container is already arranged,
            // proceed in append mode.
            if ( currentConfig.hasBeenLaidOut && newElements )
            {
                parentContainer.append( newElements ); // Add new items to the DOM.
                newElements.filter( currentConfig.elementFilter || '*' ).filter( currentConfig.mediaCheckSelector ).mediaReady( function()
                {
                    // Once media in new elements are loaded, arrange everything.
                    LayoutManager.placeAllItems( parentContainer, currentConfig );
                } );
            }
            // Otherwise, arrange existing elements and then re-layout if any
            // images are still loading.
            else
            {
                parentContainer.children( currentConfig.mediaCheckSelector ).mediaReady( function()
                {
                    // Arrange all items after their media content is loaded.
                    LayoutManager.placeAllItems( parentContainer, currentConfig );
                } );
            }
            return parentContainer; // Allow chaining.
        },

        // Routine 2.
        // Similar to Routine 1, but only acts if there's content to append.
        addContent : function( userConfig )
        {
            var parentContainer = this,
                currentConfig = LayoutManager.prepareConfiguration( parentContainer, userConfig ),
                newElements = LayoutManager.obtainContent( currentConfig.itemsToAdd );

            // If new elements exist and the layout is active, append them.
            if ( currentConfig.hasBeenLaidOut && newElements )
            {
                parentContainer.append( newElements );
                newElements.filter( currentConfig.mediaCheckSelector ).mediaReady( function()
                {
                    // Rearrange the grid once new content is loaded.
                    LayoutManager.placeAllItems( parentContainer, currentConfig );
                } );
            }
            return parentContainer;
        },

        // Routine 3.
        // Arranges all elements just once. A one-shot operation.
        // No other actions are performed.
        arrangeItems : function( userConfig )
        {
            var parentContainer = this,
                currentConfig = LayoutManager.prepareConfiguration( parentContainer, userConfig );

            // Proceed to position all grid elements.
            LayoutManager.placeAllItems( parentContainer, currentConfig );
            return parentContainer;
        },

        // Routine 4.
        // Eliminates all associated event handlers and styles.
        cleanup : function()
        {
            var parentContainer = this,
                storedSettings = parentContainer.data( 'LayoutData' );

            // Remove inline styles from all child elements.
            LayoutManager.resetItemStyles( parentContainer, storedSettings );
            // Clear the container's inline styles.
            $( parentContainer ).attr( "style", "" );
            // Unbind the window resize event listener.
            $( window ).off( "resize", this.handleWindowResize );
            // Unbind any custom events.
            parentContainer.off( storedSettings.customTriggers, this.processCustomEvent );
            return true; // Indicate successful cleanup.
        },

        //
        // Internal Utility Methods
        // _________________________________________________________

        // Merges and prepares configuration object.
        // _________________________________________________________

        prepareConfiguration : function( parentContainer, inputOptions )
        {
            // Retrieve existing data from the container. If none, it's the first call.
            var containerState = parentContainer.data( 'LayoutData' );

            // Construct the final options object by merging defaults, stored data,
            // temporary overrides, and user-provided options.
            var effectiveConfig = $.extend( true,
                {},
                this.standardOptions,
                containerState,
                this.transientOverrides,
                inputOptions
            );

            // Save the newly formed configuration back to the container.
            parentContainer.data( 'LayoutData', effectiveConfig );

            // Flag to indicate if the container has previously undergone layout processing.
            effectiveConfig.hasBeenLaidOut = ( containerState !== undefined );

            // Determine if animation is possible and requested.
            // `internalAnimationFlag` depends on user preference, if it's not the first call,
            // and if content isn't being appended.
            effectiveConfig.internalAnimationFlag = effectiveConfig.enableTransitions && effectiveConfig.hasBeenLaidOut && $.isObjectEmpty( effectiveConfig.itemsToAdd );
            this.transientOverrides.completionCallback = effectiveConfig.stickyCallback && effectiveConfig.completionCallback ? effectiveConfig.completionCallback : function() {};
            return effectiveConfig;
        },

        // Callback for window resize events, debounced.
        // _________________________________________________________

        handleWindowResize: function( parentContainer, currentWidth, currentHeight )
        {
            clearTimeout( parentContainer.data( "LayoutDelayTimer" ) );
            parentContainer.data( "LayoutDelayTimer", setTimeout( function()
            {
                var browserWindow = $( window ),
                    freshWidth = browserWindow.width(),
                    freshHeight = browserWindow.height();

                // Only re-layout if the window dimensions have actually changed.
                if ( freshWidth !== currentWidth || freshHeight !== currentHeight )
                {
                    currentWidth = freshWidth;
                    currentHeight = freshHeight;
                    parentContainer.gridArrange( 'arrangeItems' ); // Trigger a re-layout.
                }
            }, 400 ) ); // Debounce time of 400ms.
        },

        // Callback for custom events, also debounced.
        // `this` refers to the container in this context.
        // _________________________________________________________

        processCustomEvent: function( parentContainer )
        {
            clearTimeout( parentContainer.data( "LayoutDelayTimer" ) );
            parentContainer.data( "LayoutDelayTimer", setTimeout( function() { parentContainer.gridArrange( 'arrangeItems' ); }, 400 ) );
        },

        // Attaches event listeners to the container and window.
        // _________________________________________________________

        establishEventHandlers : function( parentContainer, opts )
        {
            // Bind to window resize if enabled in options.
            if ( opts.containerResize )
            {
                var browserWindow = $( window ),
                    currentWidth = browserWindow.width(),
                    currentHeight = browserWindow.height();

                browserWindow.resize( $.proxy( this.handleWindowResize, parentContainer, parentContainer, currentWidth, currentHeight ) );
            }
            // Bind to custom events if specified.
            if ( opts.customTriggers )
            {
                parentContainer.bind( opts.customTriggers, $.proxy( this.processCustomEvent, parentContainer, parentContainer ) );
            }
            return parentContainer;
        },

        // Retrieves and wraps content destined for appending.
        // _________________________________________________________

        obtainContent : function( contentData )
        {
            if ( ( typeof contentData === 'object' && !$.isObjectEmpty( contentData ) )
                || ( typeof contentData === 'string' && $( contentData ).length ) )
            {
                return $( contentData ); // Return content as a jQuery object.
            }
            return false; // No valid content to append.
        },

        // Computes optimal positions for a set of elements.
        // _________________________________________________________

        determineElementCoordinates : function( parentContainer, itemsToPlace, opts ) // Container, elements, options
        {
            // Position index visualization:
            // |    |   |       Old columns
            // |      |         New column
            // ^        ^
            // Start    End

            itemsToPlace.each( function( i )
            {
                // Variable declarations for the current item.
                var currentItem = $( this ),
                    colCounter = 0; // Iterator for column positions.

                opts.boxWidth = currentItem.outerWidth( true );
                opts.boxHeight = currentItem.outerHeight( true );
                opts.itemTopPosition = 0;
                opts.itemIteration = i;
                opts.beginColumn = 0;
                opts.finalColumn = 0;
                opts.optimalScore = 0;
                opts.potentialTop = 0;
                opts.potentialLeft = 0;


                // 1.   Establish Initial Item Placement
                // ___________________________________________________

                // Find the highest `top` position for the initial column span.
                opts.potentialTop = opts.columnPositions[0].top;
                for ( colCounter = 1; colCounter < opts.columnPositions.length && opts.columnPositions[colCounter].left < opts.boxWidth; colCounter++ )
                {
                    opts.potentialTop = Math.max( opts.potentialTop, opts.columnPositions[colCounter].top );
                }
                opts.itemTopPosition = opts.potentialTop;
                opts.finalColumn = colCounter;
                opts.optimalScore = opts.positionEvaluator( opts );

                // The item has an initial placement. Now, check other possible positions
                // to find a better fit based on the scoring function.
                for ( var k = 1; ( k < opts.columnPositions.length ) && ( opts.columnPositions[k].left + opts.boxWidth <= opts.parentAreaWidth ); k++ )
                {
                    opts.potentialLeft = opts.columnPositions[k].left;
                    opts.potentialTop = opts.columnPositions[k].top;
                    for ( colCounter = k + 1; ( colCounter < opts.columnPositions.length ) && ( opts.columnPositions[colCounter].left - opts.columnPositions[k].left < opts.boxWidth ); colCounter++ )
                    {
                        opts.potentialTop = Math.max( opts.potentialTop, opts.columnPositions[colCounter].top );
                    }
                    var calculatedScore = opts.positionEvaluator( opts );
                    if ( calculatedScore > opts.optimalScore )
                    {
                        opts.beginColumn = k;
                        opts.finalColumn = colCounter;
                        opts.itemTopPosition = opts.potentialTop;
                        opts.optimalScore = calculatedScore;
                    }
                }
                // At this stage, 1 <= opts.finalColumn <= columnPositions.length.


                // 2.   Apply the Determined Position
                // ___________________________________________________

                // Current visual position of the element.
                var existingCoords = currentItem.position(),

                // The new, calculated position.
                    targetCoords =
                    {
                        left: opts.columnPositions[opts.beginColumn].left + opts.horizontalSpacing,
                        top: opts.itemTopPosition + opts.verticalSpacing
                    };

                // Apply the position only if it's different from the current one.
                // This prevents unnecessary DOM updates for already correctly placed items.
                if ( existingCoords.top !== targetCoords.top || existingCoords.left !== targetCoords.left )
                {
                    var transitionData = { elementRef : currentItem, methodName : 'css', delayDuration : 0 };

                    if ( opts.internalAnimationFlag && !currentItem.hasClass( 'no-transition' ) )
                    {
                        // Get current offset for animation calculations.
                        var initialOffset = currentItem.offset(),

                        // Calculate target offset without complex re-calculations.
                        finalOffset =
                        {
                            left: targetCoords.left + ( initialOffset.left - existingCoords.left ),
                            top: targetCoords.top + ( initialOffset.top - existingCoords.top )
                        };

                        // Animate only if:
                        // 1. Animation is globally enabled and allowed for this element.
                        // 2. The item's y-position (current or target) is within the viewport.
                        if ( ( initialOffset.top + opts.boxHeight > opts.visibleAreaTop && initialOffset.top < opts.visibleAreaBottom ) ||
                             ( finalOffset.top + opts.boxHeight > opts.visibleAreaTop && finalOffset.top < opts.visibleAreaBottom ) )
                        {

                            transitionData.methodName = 'animate';
                            transitionData.delayDuration = opts.accumulatedDelay;

                            ++( opts.activeTransitions ); // Increment active animation counter.
                            // Increase the delay for the next animated element.
                            opts.accumulatedDelay += opts.itemAnimationInterval;
                        }
                    }
                    transitionData.targetStyle = targetCoords;
                    opts.pendingStyleChanges.push( transitionData );
                }
                // Decrement the counter for elements that have been processed.
                --( opts.activeTransitions );

                // 3.   Reconstruct Layout Grid
                // ___________________________________________________

                // a.   Capture the 'top' of the last column involved in the span.
                //      This height is used if a new insertion point is created.
                var spanEndHeight = opts.columnPositions[opts.finalColumn - 1].top,
                    spanEndRight = opts.columnPositions[opts.finalColumn] ? opts.columnPositions[opts.finalColumn].left : opts.parentAreaWidth,
                    itemRightEdge = opts.columnPositions[opts.beginColumn].left + opts.boxWidth;

                // b.   Update the height in the column where the element was placed.
                opts.columnPositions[opts.beginColumn].top = opts.itemTopPosition + opts.boxHeight;

                // c. If there are columns beyond the insertion point,
                //    remove them. If there's a gap, add a new insertion point.
                if ( itemRightEdge < spanEndRight )
                {
                    opts.columnPositions.splice( opts.beginColumn + 1, opts.finalColumn - opts.beginColumn - 1, { left: itemRightEdge, top: spanEndHeight } );
                }
                else
                {
                    opts.columnPositions.splice( opts.beginColumn + 1, opts.finalColumn - opts.beginColumn - 1 );
                }
            } );
        },

        // Sets initial display and positioning styles for elements.
        setupInitialItemStyles: function( parentContainer, itemsToPlace, opts ) // Container, elements, options
        {
            // Ensure elements are block-level and absolutely positioned for layout.
            itemsToPlace.each( function()
            {
                var currentItem = $( this );
                if ( currentItem.is( ':visible' ) )
                {
                    currentItem.css( { 'display' : 'block' } );
                }
            } ).css( { 'position' : 'absolute' } );
        },

        // Processes the queue of style changes and applies them to elements.
        // This batch processing improves performance.
        // _________________________________________________________

        implementVisualStyles : function( opts )
        {
            var styleInstruction;
            for ( var i = 0, totalInstructions = opts.pendingStyleChanges.length; i < totalInstructions; i++ )
            {
                styleInstruction = opts.pendingStyleChanges[i];

				// Prioritize CSS 3D transforms for smoother animations if available.
				if ( opts.supports3DTransforms )
                {
					var transformValue = "translate3d(" + styleInstruction.targetStyle.left + "px," + styleInstruction.targetStyle.top + "px,0)";

					styleInstruction.elementRef.css( "-moz-transform", transformValue );
					styleInstruction.elementRef.css( "-webkit-transform", transformValue );
					styleInstruction.elementRef.css( "-o-transform", transformValue );
					styleInstruction.elementRef.css( "-ms-transform", transformValue );
					styleInstruction.elementRef.css( "transform", transformValue );

					// Execute the completion callback when the CSS transition finishes.
					if ( opts.transitionOptions.complete !== null )
                    {
						styleInstruction.elementRef.on( 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function ( e )
                        {
							$( this ).off( "webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend" );
							opts.transitionOptions.complete.call( opts );
						} );
					}
				}
				else // Fallback to jQuery's animate or css method.
                {
					if ( styleInstruction.methodName === 'animate' )
                    {
						styleInstruction.elementRef.delay( styleInstruction.delayDuration ).animate( styleInstruction.targetStyle, $.extend( true, {}, opts.transitionOptions ) );
					}
					else
                    {
						styleInstruction.elementRef.css( styleInstruction.targetStyle );
					}
				}
            }
        },

        // Main algorithm for laying out all elements within the container.
        // _________________________________________________________

        placeAllItems : function( parentContainer, opts )
        {
            //
            // 1. Setup and Initialization
            //

            // Identify the elements to be laid out.
            if ( $.isObjectEmpty( opts.itemsToAdd ) )
            {
                var allItems = opts.elementFilter ? parentContainer.children( opts.elementFilter ) : parentContainer.children();
            }
            else
            {
                var allItems = opts.elementFilter ? opts.itemsToAdd.filter( opts.elementFilter ) : opts.itemsToAdd;
            }

            // Get the total number of items.
            opts.totalItems = allItems.length;

            // If the container is empty, reset its height, call the callback, and exit.
            if ( !opts.totalItems )
            {
                parentContainer.data( "LayoutGridPositions", null );
                if ( typeof( opts.completionCallback === "function" ) )
                {
                    opts.completionCallback( opts );
                }
                parentContainer[ opts.internalAnimationFlag && opts.containerAnimate ? 'animate' : 'css' ]( { 'height' : '0px' } );
                return parentContainer;
            }

            // Store the container's initial visibility and display properties.
            var initialDisplay = parentContainer.css( 'display' ) || '';
            var initialVisibility = parentContainer.css( 'visibility' ) || '';

            // If the container is hidden, make it visible temporarily to get accurate dimensions.
            if ( initialDisplay === 'none' )
            {
                parentContainer.css( 'display', 'block' );
            }
            if ( initialVisibility === 'hidden' )
            {
                parentContainer.css( 'visibility', 'visible' );
            }

            // Reset current layout state.
            opts.columnPositions = [ { left: 0, top: 0 } ]; // Represents available insertion points.
            opts.parentAreaWidth = parentContainer.width();
            opts.accumulatedDelay = opts.initialDelay;
            opts.activeTransitions = 0; // Counter for ongoing animations.
            opts.pendingStyleChanges = []; // Queue for batching style updates.

            // Get viewport dimensions for animation visibility checks.
            var browserWindow = $( window );
            opts.visibleAreaTop = browserWindow.scrollTop();
            opts.visibleAreaBottom = opts.visibleAreaTop + browserWindow.height();

            // Prepare elements (set display: block, position: absolute).
            LayoutManager.setupInitialItemStyles( parentContainer, allItems, opts );

            //
            // 2. Compute Element Positions
            //
            LayoutManager.determineElementCoordinates( parentContainer, allItems, opts );

            //
            // 3. Update Container Height and Apply Styles
            //

            // Find the maximum height among all columns to set container's height.
            var maxGridHeight = 0;
            for ( var i = 0, len = opts.columnPositions.length; i < len; i++ )
            {
                maxGridHeight = Math.max( maxGridHeight, opts.columnPositions[i].top );
            }

            // Apply all accumulated style changes to the elements.
            LayoutManager.implementVisualStyles( opts );

            // Update the container's height.
            parentContainer[ opts.internalAnimationFlag && opts.containerAnimate ? 'animate' : 'css' ](
            {
                'height' : maxGridHeight + 'px'
            },
            opts.transitionOptions // Use animation options if animating.
            );

            // Restore original display/visibility if they were changed.
            if ( initialDisplay === 'none' )
            {
                parentContainer.css( 'display', initialDisplay );
            }
            if ( initialVisibility === 'hidden' )
            {
                parentContainer.css( 'visibility', initialVisibility );
            }

            // Store the final column positions for future reference.
            parentContainer.data( "LayoutGridPositions", opts.columnPositions );

            // Execute the completion callback if no animations are pending.
            if ( !opts.activeTransitions && typeof( opts.completionCallback === "function" ) )
            {
                opts.completionCallback( opts );
            }

            return parentContainer;
        },

        // Removes inline styles applied by the plugin.
        resetItemStyles: function( parentContainer, opts )
        {
            var elementsToReset = opts.elementFilter ? parentContainer.children( opts.elementFilter ) : parentContainer.children();
            elementsToReset.each( function()
            {
                var currentItem = $( this );
                currentItem.attr( "style", "" ); // Clear all inline styles.
            } );
            return parentContainer;
        },

        //
        // Default Configuration Values
        // _________________________________________________________

        standardOptions :
        {
            animate             : true,      // Should elements animate into position?
            containerResize     : true,      // Should the layout react to window resize?
            containerAnimate    : true,      // Should the container height animate?
            customTriggers      : null,      // Custom event names to trigger re-layout.
            elementFilter       : null,      // Selector for items to be laid out (children of container by default).
            mediaCheckSelector  : 'img',     // Selector for images to wait for (within items).
            initialDelay        : 0,         // Initial delay before the first element animates.
            itemAnimationInterval : 100,     // Delay increment between animated items.
            horizontalSpacing   : 0,         // Horizontal padding between items.
            verticalSpacing     : 0,         // Vertical padding between items.
            stickyCallback      : false,     // Should the callback be preserved across calls?
            completionCallback  : function() {}, // Function called after layout completion.
            positionEvaluator   : function( opts )
            {
                // Default scoring: prioritize minimal element top position.
                return -opts.itemTopPosition;
            },
            transitionOptions   :            // Options for jQuery's .animate() method.
            {
                queue    : false,
                duration : 400,
                easing   : 'linear'
            }
        },

        // Transient options that override defaults only for the current call.
        transientOverrides :
        {
            itemsToAdd          : null,      // Content to append.
            columnPositions     : null,      // Internal: Tracks available column positions.
            parentAreaWidth     : null,      // Internal: Width of the container.
            accumulatedDelay    : null,      // Internal: Running animation delay.
            activeTransitions   : null,      // Internal: Count of ongoing animations.
            pendingStyleChanges : null,      // Internal: Queue for style updates.
            visibleAreaTop      : null,      // Internal: Top of the visible viewport.
            visibleAreaBottom   : null,      // Internal: Bottom of the visible viewport.
            boxWidth            : null,      // Internal: Width of the current item being placed.
            boxHeight           : null,      // Internal: Height of the current item being placed.
            itemTopPosition     : null,      // Internal: Calculated top position of current item.
            itemIteration       : null,      // Internal: Index of the current item in the iteration.
            beginColumn         : null,      // Internal: Starting column index for the current item.
            finalColumn         : null,      // Internal: Ending column index for the current item.
            optimalScore        : null,      // Internal: Best score found for current item's placement.
            potentialTop        : null,      // Internal: Candidate top position during scoring.
            potentialLeft       : null,      // Internal: Candidate left position during scoring.
            totalItems          : null,      // Internal: Total number of items being processed.
            supports3DTransforms: null       // Internal: Flag for CSS 3D transform support.
        }
    };

} )( jQuery ); // Pass jQuery to the immediately invoked function.