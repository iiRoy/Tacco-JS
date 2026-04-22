(function( $ ){

    "use strict";

    // == FlexMason.js v1.0.0 ==
    // A responsive grid layout manager for jQuery elements.
    //
    // Copyright (c) 2023, Your Name or Organization, All rights reserved.
    // Licensed under the MIT License.
    //
    // This software is provided "as is", without warranty of any kind, express or implied,
    // including but not limited to the warranties of merchantability, fitness for a particular
    // purpose and noninfringement. In no event shall the authors or copyright holders be
    // liable for any claim, damages or other liability, whether in an action of contract,
    // tort or otherwise, arising from or out of or in connection with the software or the
    // use or other dealings in the software.

    // Main entry point for the jQuery plugin.
    // Provides a flexible interface for various layout operations.
    $.fn.flexMason = function( actionCommand )
    {
        // Execute the appropriate command from the internal FlexMason module.
        if ( typeof FlexMason[ actionCommand ] === 'function' )
        {
          // Pass all arguments after the command name.
          return FlexMason[ actionCommand ].apply( this, [].slice.call( arguments, 1 ));
        }
        else if ( typeof actionCommand === 'object' || !actionCommand )
        {
          // If no command is specified or an options object is passed,
          // default to the initialization routine.
          return FlexMason.initializeLayout.apply( this, arguments );
        }
        else
        {
          // Handle unknown commands by throwing an error.
          $.error( 'Command "' +  actionCommand + '" not found in $.fn.flexMason.' );
        }
        // Always return 'this' for jQuery chainability.
        return this;
    };

    var FlexMason =
    {
        // ---------------------------------------------------------
        //  ## Public Facing API Methods ##
        // ---------------------------------------------------------

        // 1. Initial setup and layout, intelligent re-layout or content addition.
        initializeLayout : function( configParams )
        {
            const targetElement = this; // The jQuery object representing the container.
            // Retrieve and merge configuration settings.
            const currentSettings = FlexMason.prepareConfiguration( targetElement, configParams );
            // Check for new elements to append.
            const newContentElements = FlexMason.fetchNewContent( currentSettings.contentToAdd );

            // If this is the first run, set up event listeners for resizing and custom triggers.
            if ( !currentSettings.isInitialized ) {
                FlexMason.bindContainerEvents( targetElement, currentSettings );
            }

            // If new content is available and the container has been previously processed,
            // append the content and then re-position all elements.
            if ( currentSettings.isInitialized && newContentElements && newContentElements.length > 0 )
            {
                targetElement.append( newContentElements );
                // Ensure images within the new content are loaded before positioning.
                newContentElements.filter( currentSettings.itemSelector || '*' )
                                  .filter( currentSettings.imageCheckSelector )
                                  .imagesLoaded( () => {
                                      FlexMason.positionAllItems( targetElement, currentSettings );
                                  });
            }
            // Otherwise, if no new content or first initialization, just position existing elements.
            else
            {
                // Wait for all images in children to load, then lay out.
                targetElement.children( currentSettings.imageCheckSelector ).imagesLoaded( () => {
                    FlexMason.positionAllItems( targetElement, currentSettings );
                });
            }
            return targetElement; // Maintain chainability.
        },

        // 2. Add new items to an existing layout.
        addItems : function( configParams )
        {
            const targetElement = this;
            const currentSettings = FlexMason.prepareConfiguration( targetElement, configParams );
            const newContentElements = FlexMason.fetchNewContent( currentSettings.contentToAdd );

            // Proceed only if new content exists and the layout has been initialized.
            if ( currentSettings.isInitialized && newContentElements && newContentElements.length > 0 )
            {
                targetElement.append( newContentElements );
                // Wait for images in the new items to load, then re-position.
                newContentElements.filter( currentSettings.imageCheckSelector ).imagesLoaded( () => {
                    FlexMason.positionAllItems( targetElement, currentSettings );
                });
            }
            return targetElement;
        },

        // 3. Re-layout all elements without adding or removing any.
        relayout : function( configParams )
        {
            const targetElement = this;
            const currentSettings = FlexMason.prepareConfiguration( targetElement, configParams );

            // Perform the positioning operation.
            FlexMason.positionAllItems( targetElement, currentSettings );
            return targetElement;
        },

        // 4. Remove all event bindings and inline styles applied by FlexMason.
        dispose : function()
        {
            const targetElement = this;
            const storedData = targetElement.data( 'FlexMasonState' );

            if ( !storedData ) return false; // Nothing to dispose if not initialized.

            // Reset styles on all child elements.
            FlexMason.clearItemStyles( targetElement, storedData );
            // Remove inline style attributes from the container.
            targetElement.removeAttr( "style" );
            // Unbind window resize handler.
            $( window ).off( "resize", this.windowResizer );
            // Unbind custom event handlers.
            targetElement.off( storedData.customTriggers, this.eventProcessor );

            // Clear stored data.
            targetElement.removeData( 'FlexMasonState' );
            return true;
        },

        // ---------------------------------------------------------
        //  ## Internal Utility Methods ##
        // ---------------------------------------------------------

        // Merges user options with defaults and stored state.
        prepareConfiguration : function( hostElem, userOverrides )
        {
            // Retrieve any previously stored configuration data from the host element.
            let cachedState = hostElem.data( 'FlexMasonState' ) || {};

            // Deep merge defaults, stored state, and user-provided overrides.
            let mergedSettings = $.extend( true,
                {},
                this.initialOptions, // Base defaults.
                cachedState,          // Previous state, if any.
                this.tempResetConfig, // Temporary reset values for each layout pass.
                userOverrides         // New options provided by the user.
            );

            // Determine if the container has been processed by FlexMason before.
            mergedSettings.isInitialized = ( Object.keys( cachedState ).length > 0 );

            // Calculate the actual animation flag. Animation is only possible if requested,
            // if the container is already initialized, and if no new content is being added.
            mergedSettings._canAnimate = mergedSettings.doAnimation &&
                                         mergedSettings.isInitialized &&
                                         $.isEmptyObject( mergedSettings.contentToAdd );

            // Assign callback function, ensuring it's callable.
            mergedSettings.onComplete = mergedSettings.persistentCallback && mergedSettings.callback ? mergedSettings.callback : $.noop;

            // Store the final merged settings back on the host element.
            hostElem.data( 'FlexMasonState', mergedSettings );

            return mergedSettings;
        },

        // Callback for window resize events, debounced.
        windowResizer: function( boundElement, oldWidth, oldHeight )
        {
            clearTimeout( boundElement.data( "FlexMasonResizeTimer" ) );
            boundElement.data( "FlexMasonResizeTimer", setTimeout( () =>
            {
                const currentWindow = $( window );
                const newWindowWidth = currentWindow.width();
                const newWindowHeight = currentWindow.height();

                // Only trigger a re-layout if the window dimensions have actually changed.
                if ( newWindowWidth !== oldWidth || newWindowHeight !== oldHeight )
                {
                    // Update dimensions for the next check.
                    oldWidth = newWindowWidth;
                    oldHeight = newWindowHeight;
                    // Trigger a re-layout using the plugin's public method.
                    boundElement.flexMason( 'relayout' );
                }
            }, 300 ) ); // Debounce delay.
        },

        // Callback for custom events, also debounced.
        eventProcessor: function( triggeredElement )
        {
            clearTimeout( triggeredElement.data( "FlexMasonEventTimer" ) );
            triggeredElement.data( "FlexMasonEventTimer", setTimeout( () => {
                triggeredElement.flexMason( 'relayout' );
            }, 300 ) );
        },

        // Sets up event listeners for the container element.
        bindContainerEvents : function( parentElem, layoutOptions )
        {
            // Bind to window resize if enabled.
            if ( layoutOptions.responsiveLayout )
            {
                const winRef = $( window );
                let currentWinWidth = winRef.width();
                let currentWinHeight = winRef.height();

                // Use jQuery's proxy to maintain context and pass initial dimensions.
                winRef.on( "resize", $.proxy( this.windowResizer, parentElem, parentElem, currentWinWidth, currentWinHeight ) );
            }
            // Bind to custom events if specified.
            if ( layoutOptions.customTriggers )
            {
                parentElem.on( layoutOptions.customTriggers, $.proxy( this.eventProcessor, parentElem, parentElem ) );
            }
            return parentElem;
        },

        // Determines and retrieves new content to be appended.
        fetchNewContent : function( incomingContent )
        {
            // Check if content is a non-empty object or a valid selector string.
            if ( ( typeof incomingContent === 'object' && Object.keys( incomingContent ).length > 0 ) ||
                 ( typeof incomingContent === 'string' && $( incomingContent ).length > 0 ) )
            {
                return $( incomingContent );
            }
            return null; // Return null if no valid content.
        },

        // Core logic: calculates optimal positions for each item.
        calculateItemPositions : function( parentContainer, itemElements, processConfig ) // Container, elements, options
        {
            // Iterate over each item element to determine its position.
            itemElements.each( function( itemIdx )
            {
                // Local variables for the current item's properties.
                const $currentItem = $( this );
                let columnIndex = 0; // Index for column iteration.

                // Pre-calculate item dimensions for efficiency.
                let itemWidth = $currentItem.outerWidth( true );
                let itemHeight = $currentItem.outerHeight( true );

                // Store current item's context in processConfig for score function.
                processConfig.currentItemWidth = itemWidth;
                processConfig.currentItemHeight = itemHeight;
                processConfig.currentItemIndex = itemIdx;

                // Initialize variables for best position search.
                let startColumnIndex = 0;
                let endColumnIndex = 0;
                let optimalScore = -1; // Lower score is better.
                let candidateTop = 0;
                let candidateLeft = 0;
                let finalItemTop = 0;

                // --- 1. Determine Optimal Placement for the Current Item ---

                // Start by checking the first available column.
                // Find the true top position for placement starting at column 0.
                candidateTop = processConfig.columnPositions[0].top;
                for ( columnIndex = 1;
                      columnIndex < processConfig.columnPositions.length && processConfig.columnPositions[columnIndex].left < itemWidth;
                      columnIndex++ )
                {
                    candidateTop = Math.max( candidateTop, processConfig.columnPositions[columnIndex].top );
                }
                finalItemTop = candidateTop;
                endColumnIndex = columnIndex;
                optimalScore = processConfig.placementEvaluator( processConfig );

                // Now, explore other potential starting columns to find a better fit.
                for ( let i = 1;
                      i < processConfig.columnPositions.length && ( processConfig.columnPositions[i].left + itemWidth <= processConfig.containerBounds.width );
                      i++ )
                {
                    candidateLeft = processConfig.columnPositions[i].left;
                    candidateTop = processConfig.columnPositions[i].top;
                    for ( columnIndex = i + 1;
                          columnIndex < processConfig.columnPositions.length && ( processConfig.columnPositions[columnIndex].left - processConfig.columnPositions[i].left < itemWidth );
                          columnIndex++ )
                    {
                        candidateTop = Math.max( candidateTop, processConfig.columnPositions[columnIndex].top );
                    }
                    // Evaluate the potential new position.
                    let currentPlacementScore = processConfig.placementEvaluator( processConfig, candidateTop );
                    if ( currentPlacementScore > optimalScore ) // Assuming higher score is better.
                    {
                        startColumnIndex = i;
                        endColumnIndex = columnIndex;
                        finalItemTop = candidateTop;
                        optimalScore = currentPlacementScore;
                    }
                }
                // At this point, `startColumnIndex` and `endColumnIndex` define the best span.

                // --- 2. Apply the Determined Position to the Item ---

                // Retrieve current visual position of the item.
                const currentVisualPos = $currentItem.position();

                // Calculate the new target position.
                const targetCoordinates =
                {
                    left: processConfig.columnPositions[startColumnIndex].left + processConfig.horizontalPadding,
                    top: finalItemTop + processConfig.verticalPadding
                };

                // Only update if the position has actually changed to avoid unnecessary DOM operations.
                if ( currentVisualPos.top !== targetCoordinates.top || currentVisualPos.left !== targetCoordinates.left )
                {
                    // Prepare an object to queue the style application.
                    const styleApplication = { elementRef : $currentItem, method : 'css', delayMs : 0 };

                    // Check if animation is enabled and allowed for this item.
                    if ( processConfig._canAnimate && !$currentItem.hasClass( 'no-mason-anim' ) )
                    {
                        const currentPixelOffset = $currentItem.offset();
                        // Calculate new offset for viewport check.
                        const newPixelOffset =
                        {
                            left: targetCoordinates.left + ( currentPixelOffset.left - currentVisualPos.left ),
                            top: targetCoordinates.top + ( currentPixelOffset.top - currentVisualPos.top )
                        };

                        // Animate only if the element is within or moving into the visible viewport.
                        if ( ( currentPixelOffset.top + itemHeight > processConfig.viewportYBounds.start && currentPixelOffset.top < processConfig.viewportYBounds.end ) ||
                             ( newPixelOffset.top + itemHeight > processConfig.viewportYBounds.start && newPixelOffset.top < processConfig.viewportYBounds.end ) )
                        {
                            styleApplication.method = 'animate';
                            styleApplication.delayMs = processConfig.currentAnimationDelay;
                            processConfig.currentAnimationDelay += processConfig.itemAnimationDelay;
                            processConfig.activeAnimations++; // Increment counter for active animations.
                        }
                    }
                    styleApplication.targetStyle = targetCoordinates;
                    processConfig.styleUpdateQueue.push( styleApplication );
                }
                // Decrement active animation counter if this item doesn't animate,
                // or if it animated, the counter will be decremented on animation completion.
                if ( !styleApplication.method === 'animate' ) {
                    processConfig.activeAnimations--;
                }


                // --- 3. Reconstruct Column Tracking Data ---

                // Get the height of the last column span in the current segment.
                const lastSegmentTop = processConfig.columnPositions[endColumnIndex - 1].top;
                const lastSegmentRight = processConfig.columnPositions[endColumnIndex] ? processConfig.columnPositions[endColumnIndex].left : processConfig.containerBounds.width;
                const currentItemRightEdge = processConfig.columnPositions[startColumnIndex].left + itemWidth;

                // Update the height of the starting column.
                processConfig.columnPositions[startColumnIndex].top = finalItemTop + itemHeight;

                // Adjust column definitions based on the item's placement.
                if ( currentItemRightEdge < lastSegmentRight )
                {
                    // If there's a gap to the right, insert a new column definition.
                    processConfig.columnPositions.splice( startColumnIndex + 1, endColumnIndex - startColumnIndex - 1, { left: currentItemRightEdge, top: lastSegmentTop } );
                }
                else
                {
                    // Otherwise, remove the spanned columns.
                    processConfig.columnPositions.splice( startColumnIndex + 1, endColumnIndex - startColumnIndex - 1 );
                }
            });
        },

        // Ensures elements are block-level and absolutely positioned for layout.
        prepareDisplayElements: function( targetHost, targetItems, displayOpts ) // Container, elements, options
        {
            if ( !targetItems || targetItems.length === 0 ) return;

            // Apply essential CSS properties for positioning.
            targetItems.each( function()
            {
                const $thisItem = $( this );
                if ( $thisItem.is( ':visible' ) )
                {
                    $thisItem.css( { 'display' : 'block' } ); // Ensure block display.
                }
            }).css( { 'position' : 'absolute' } ); // Set absolute positioning.
        },

        // Applies collected styles from the queue to elements.
        applyQueuedStyles : function( renderOptions )
        {
            if ( !renderOptions.styleUpdateQueue || renderOptions.styleUpdateQueue.length === 0 ) {
                renderOptions.onComplete( renderOptions ); // Call callback even if no styles.
                return;
            }

            let styleInstruction;
            for ( let i = 0, queueLen = renderOptions.styleUpdateQueue.length; i < queueLen; i++ )
            {
                styleInstruction = renderOptions.styleUpdateQueue[i];

                // Use CSS transforms for animation if supported and preferred.
                if ( renderOptions.useCSSTransforms ) {
                    const transformValue = `translate3d(${styleInstruction.targetStyle.left}px, ${styleInstruction.targetStyle.top}px, 0)`;

                    // Apply vendor-prefixed and standard transforms.
                    styleInstruction.elementRef.css({
                        "-webkit-transform": transformValue,
                        "-moz-transform": transformValue,
                        "-ms-transform": transformValue,
                        "-o-transform": transformValue,
                        "transform": transformValue,
                        "transition-duration": `${renderOptions.animationDuration}ms` // Ensure transition duration is set.
                    });

                    // Invoke the completion callback when the transition ends.
                    // This is only attached once per animating element.
                    if ( renderOptions.animationSettings.complete && styleInstruction.method === 'animate' ) {
                        styleInstruction.elementRef.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', () => {
                            // Decrement animation counter when this specific animation completes.
                            renderOptions.activeAnimations--;
                            if ( renderOptions.activeAnimations <= 0 ) {
                                renderOptions.onComplete( renderOptions );
                            }
                        });
                    } else if (styleInstruction.method === 'css') {
                        renderOptions.activeAnimations--; // Decrement immediately for non-animated.
                    }
                }
                // Fallback to jQuery's animate or css method.
                else {
                    if ( styleInstruction.method === 'animate' )
                    {
                        styleInstruction.elementRef.delay( styleInstruction.delayMs ).animate( styleInstruction.targetStyle, $.extend( true, {}, renderOptions.animationSettings, {
                            complete: () => {
                                // Original complete callback plus decrementing our counter.
                                if ( renderOptions.animationSettings.complete ) {
                                    renderOptions.animationSettings.complete.call( renderOptions );
                                }
                                renderOptions.activeAnimations--;
                                if ( renderOptions.activeAnimations <= 0 ) {
                                    renderOptions.onComplete( renderOptions );
                                }
                            }
                        }));
                    }
                    else
                    {
                        styleInstruction.elementRef.css( styleInstruction.targetStyle );
                        renderOptions.activeAnimations--; // Decrement immediately for non-animated.
                    }
                }
            }

            // If no animations were triggered, call the complete callback immediately.
            if (renderOptions.activeAnimations <= 0) {
                renderOptions.onComplete( renderOptions );
            }
        },

        // Orchestrates the entire layout process.
        positionAllItems : function( parentArea, processingOpts )
        {
            // --- 1. Initialization and Element Acquisition ---

            // Determine which elements to process (all children or only new content).
            let layoutItems;
            if ( $.isEmptyObject( processingOpts.contentToAdd ) )
            {
                layoutItems = processingOpts.itemSelector ? parentArea.children( processingOpts.itemSelector ) : parentArea.children();
            }
            else
            {
                layoutItems = processingOpts.itemSelector ? processingOpts.contentToAdd.filter( processingOpts.itemSelector ) : processingOpts.contentToAdd;
            }

            // Update item count in options.
            processingOpts.itemCount = layoutItems.length;

            // Handle empty container scenario.
            if ( processingOpts.itemCount === 0 )
            {
                parentArea.data( "FlexMasonState", null ); // Clear state if empty.
                processingOpts.onComplete( processingOpts ); // Call callback.
                // Animate or set container height to zero.
                parentArea[ processingOpts._canAnimate && processingOpts.animateContainer ? 'animate' : 'css' ]( { 'height' : '0px' } );
                return parentArea;
            }

            // Cache container's initial display and visibility for restoration later.
            const initialDisplay = parentArea.css( 'display' ) || '';
            const initialVisibility = parentArea.css( 'visibility' ) || '';

            // Temporarily hide container to prevent reflow during calculations.
            if ( initialDisplay === 'inline' ) {
                 parentArea.css( 'display', 'block' );
            }
            parentArea.css( 'visibility', 'hidden' );


            // Ensure items are prepared for absolute positioning.
            FlexMason.prepareDisplayElements( parentArea, layoutItems, processingOpts );

            // Reset column tracking array.
            processingOpts.columnPositions = [ { left: 0, top: 0 } ];
            // Reset style queue.
            processingOpts.styleUpdateQueue = [];
            // Reset animation counter.
            processingOpts.activeAnimations = 0;
            // Reset animation delay.
            processingOpts.currentAnimationDelay = processingOpts.initialAnimationDelay;


            // Store viewport bounds for animation checks.
            const win = $( window );
            processingOpts.viewportYBounds = {
                start: win.scrollTop(),
                end: win.scrollTop() + win.height()
            };

            // Get container's true width after display adjustments.
            processingOpts.containerBounds = { width: parentArea.width(), height: 0 };


            // --- 2. Calculate Positions for All Items ---
            FlexMason.calculateItemPositions( parentArea, layoutItems, processingOpts );


            // --- 3. Determine Final Container Height ---
            let maxHeight = 0;
            for ( let k = 0; k < processingOpts.columnPositions.length; k++ )
            {
                maxHeight = Math.max( maxHeight, processingOpts.columnPositions[k].top );
            }
            processingOpts.containerBounds.height = maxHeight;


            // --- 4. Apply Styles and Restore Visibility ---
            FlexMason.applyQueuedStyles( processingOpts );

            // Animate or set the container's height.
            parentArea[ processingOpts._canAnimate && processingOpts.animateContainer ? 'animate' : 'css' ]( { 'height' : maxHeight + 'px' }, processingOpts.containerAnimationSettings );

            // Restore original display and visibility.
            parentArea.css( { 'display': initialDisplay, 'visibility': initialVisibility } );

            return parentArea;
        },

        // Clears inline styles from child elements.
        clearItemStyles: function( container, currentSettings ) {
            container.children(currentSettings.itemSelector).each(function() {
                $(this).removeAttr('style'); // Remove all inline styles.
            });
        },


        // ---------------------------------------------------------
        //  ## Default Configuration Settings ##
        // ---------------------------------------------------------

        // Default options for FlexMason.
        initialOptions :
        {
            itemSelector: '.flex-item',        // Selector for items to be laid out.
            contentToAdd: null,                // New content to append.
            imageCheckSelector: 'img.loading', // Selector for images to wait for.
            responsiveLayout: true,            // Re-layout on window resize.
            customTriggers: '',                // Custom events to trigger re-layout.
            doAnimation: true,                 // Enable CSS/jQuery animation for item positioning.
            animateContainer: true,            // Animate the container's height.
            horizontalPadding: 10,             // Horizontal spacing between items.
            verticalPadding: 10,               // Vertical spacing between items.
            persistentCallback: true,          // If false, callback only runs on first init.
            callback: $.noop,                  // Function to call after layout completes.
            initialAnimationDelay: 0,          // Starting delay for the first item's animation.
            itemAnimationDelay: 50,            // Additional delay for subsequent items.
            animationDuration: 400,            // Duration of individual item animations.
            animationEasing: 'swing',          // Easing function for jQuery animations.
            useCSSTransforms: true,            // Prefer CSS transforms for animation if available.
            // Function to evaluate placement score (higher is better).
            // Default tries to minimize height and prioritize left-most.
            placementEvaluator: function( config, candidateTopOverride )
            {
                const currentItemHeight = config.currentItemHeight;
                const evaluatedTop = candidateTopOverride !== undefined ? candidateTopOverride : config.columnPositions[config.IndexStart].top;
                // Simple score: negative of the top position (to minimize top).
                // Could be more complex, e.g., considering aspect ratio or gaps.
                return -evaluatedTop;
            },
            // jQuery animation settings.
            animationSettings:
            {
                duration: 400,
                easing: 'swing',
                queue: false // Crucial for independent item animations.
            },
            // Animation settings for the container height.
            containerAnimationSettings:
            {
                duration: 200,
                easing: 'linear'
            }
        },

        // Temporary reset configuration for each layout pass.
        // These properties are reset and calculated anew for every layout operation.
        tempResetConfig :
        {
            _canAnimate: false,               // Internal flag for current animation possibility.
            isInitialized: false,             // Internal flag indicating if plugin is active.
            columnPositions: [],              // Tracks current top and left for each column.
            styleUpdateQueue: [],             // Queue for style changes to apply.
            itemCount: 0,                     // Number of items being processed.
            currentAnimationDelay: 0,         // Current accumulated animation delay.
            activeAnimations: 0,              // Counter for animations in progress.
            containerBounds: { width: 0, height: 0 }, // Current container dimensions.
            viewportYBounds: { start: 0, end: 0 }, // Current viewport Y coordinates.
            currentItemWidth: 0,              // Width of the item currently being positioned.
            currentItemHeight: 0,             // Height of the item currently being positioned.
            currentItemIndex: 0               // Index of the item currently being positioned.
        }
    };

})( jQuery );