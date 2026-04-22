(function (jq) {
    // Enforce strict parsing and execution rules for better code quality.
    'use strict';

    // Defines a mapping of custom interaction names to standard DOM event types.
    const interactionEvents = {
        dragEvent: 'mousemove touchmove',
        dragInitiate: 'mousedown touchstart',
        dragFinalize: 'mouseup touchend',
        selectionPrevent: 'selectstart'
    };
    
    // Defines CSS class names used for styling and identifying various components.
    const cssDesignations = {
        activeSorting: 'list-reordering',
        itemComponent: 'list-item-draggable',
        dragHandle: 'list-item-handle',
        itemClone: 'list-item-proxy',
        currentActive: 'list-item-active'
    };

    // Reference to the main document body for global event handling.
    var docBody = jq(document.body);
    // Delay in milliseconds for the throttling mechanism.
    var processingDelay = 5; // Increased from 2ms for subtle change

    /**
     * Creates a throttled version of a function, ensuring it's not called too frequently.
     * @param {Function} actionCallback - The function to be throttled.
     * @param {number} delayMs - The minimum time interval (in milliseconds) between successive calls.
     * @param {boolean} executeImmediately - If true, the function is called immediately on the first trigger.
     * @returns {Function} The throttled function.
     */
    function delayExecution(actionCallback, delayMs, executeImmediately) {
        var timerId; // Holds the timeout ID.
        var lastArgs, lastContext; // Stores the last arguments and context.

        return function () {
            lastContext = this;
            lastArgs = arguments;

            var deferredAction = function () {
                timerId = null; // Clear the timer ID.
                if (!executeImmediately) {
                    actionCallback.apply(lastContext, lastArgs);
                }
            };

            var triggerNow = executeImmediately && !timerId;
            // Always clear any existing timer to reset the delay.
            if (timerId) {
                clearTimeout(timerId);
            }
            
            // Set a new timer for deferred execution.
            timerId = setTimeout(deferredAction, delayMs);

            // Execute immediately if specified and no timer is active.
            if (triggerNow) {
                actionCallback.apply(lastContext, lastArgs);
            }
        };
    }

    /**
     * Constructor for the DraggableList component.
     * Manages drag-and-drop functionality for a list of items.
     * @param {HTMLElement} hostElement - The DOM element hosting the draggable list.
     * @param {Object} configParams - Configuration options for the draggable list.
     */
    function DraggableList(hostElement, configParams) {
        // Merge default settings with provided configuration.
        this.settings = jq.extend({
            itemSelector: '.movable', // Selector for draggable items.
            handleSelector: null,     // Selector for drag handles within items.
            layerIndex: '9500',       // Z-index for the dragged item clone.
            allowHorizontalMove: true, // Enable horizontal dragging.
            allowVerticalMove: true,   // Enable vertical dragging.
            onOrderChange: null,       // Callback for when item order changes.
            onDragInitiate: null,      // Callback for drag start.
            onDragProgress: null,      // Callback for drag progress.
            onDragComplete: null       // Callback for drag end.
        }, configParams);

        // Retrieve a unique identifier for this component instance, typically from Angular scope.
        var componentId = hostElement.scope().$id;

        // Dynamically generate unique CSS class names for this instance.
        this.styleIdentifiers = {};
        for (var classKey in cssDesignations) {
            // Ensure the property belongs to the object itself.
            if (cssDesignations.hasOwnProperty(classKey)) {
                this.styleIdentifiers[classKey] = cssDesignations[classKey] + '-' + componentId;
            }
        }

        this.offsetX = 0; // Horizontal offset during drag.
        this.offsetY = 0; // Vertical offset during drag.

        this.isInteractionEnabled = null; // Flag indicating if drag functionality is active.
        this.currentEventState = null;    // Stores the current event object during drag.
        this.hostContainer = jq(hostElement); // jQuery wrapped host element.
        this.activeMovableItem = null;    // The currently active draggable item.

        // Initialize event handlers and class assignments.
        this.updateInteractionHandlers();
    }

    /**
     * Sets the enabled/disabled status of the draggable list.
     * @param {boolean} statusFlag - True to enable, false to disable.
     */
    DraggableList.prototype.setInteractionStatus = function (statusFlag) {
        this.isInteractionEnabled = statusFlag;
        // Re-apply handlers based on new status.
        this.updateInteractionHandlers();
    };
    
    /**
     * Cleans up all event listeners and resets body attributes.
     * Called when the component is destroyed or refreshed.
     */
    DraggableList.prototype.releaseResources = function () {
        // Restore original body unselectable attribute.
        docBody.attr('unselectable', this.originalBodySelectability || null)
                // Remove global drag/drop event listeners.
                .off(interactionEvents.dragFinalize)
                .off(interactionEvents.dragEvent)
                .off(interactionEvents.selectionPrevent);
        
        // Remove drag start listeners from all draggable items.
        this.retrieveMovableElements().off(interactionEvents.dragInitiate);
    };
    
    /**
     * Retrieves all elements configured as draggable items within the host container.
     * @returns {jQuery} A jQuery collection of draggable items.
     */
    DraggableList.prototype.retrieveMovableElements = function() {
        return jq(this.settings.itemSelector, this.hostContainer);
    };
    
    /**
     * Refreshes the component's state, re-applies classes, and sets up event listeners.
     */
    DraggableList.prototype.updateInteractionHandlers = function () {
        this.releaseResources(); // First, clean up previous handlers.
        
        var instanceRef = this; // Cache 'this' for use in closures.
        var movableElements = this.retrieveMovableElements();
        
        // Apply a fixed class to all draggable items for consistent styling and identification.
        // This class helps ensure that event targets can be reliably identified.
        movableElements.addClass(instanceRef.styleIdentifiers.itemComponent);
        // Prevent text selection on draggable items during interaction.
        movableElements.attr('unselectable', 'on');

        // Only bind drag start events if interaction is enabled and no item is currently being dragged.
        if (this.isInteractionEnabled) {
            if (!this.activeMovableItem) {
                movableElements.on(interactionEvents.dragInitiate, function (e) {
                    // Prevent multiple bindings by unbinding before calling drag start.
                    // This is a specific pattern used in the original code, though `off` before `on` is more common.
                    jq(this).off(e); // Unbinds only this specific item's handler for this event type
                    instanceRef.handleDragStart(e);
                });
            }
        }
    };

    /**
     * A throttled function to detect changes in item order during a drag operation.
     * @param {DraggableList} instanceContext - The DraggableList instance.
     * @param {Event} dragEvent - The current drag event.
     */
    var positionDetector = delayExecution(function (instanceContext, dragEvent) {
        var currentMovableElements = instanceContext.retrieveMovableElements();

        // Cache array length for performance.
        var startIndex = 0, endIndex = currentMovableElements.length;
        var currentItem;

        // Retrieve current position of the dragged proxy element.
        var currentTop = parseInt(instanceContext.draggedProxy.css('top'), 10);
        var currentLeft = parseInt(instanceContext.draggedProxy.css('left'), 10);
        
        // Calculate the shift from the initial drag start position.
        var horizontalShift = currentLeft - instanceContext.initialLeft;
        var verticalShift = currentTop - instanceContext.initialTop;
        
        // Optimization: narrow down the search range based on drag direction.
        if (!instanceContext.settings.allowHorizontalMove) { // Vertical-only drag
            if (verticalShift > 0) {
                startIndex = instanceContext.activeMovableIndex + 1;
            } else if(verticalShift < 0) {
                endIndex = instanceContext.activeMovableIndex;
            } else {
                // No vertical movement, no reordering possible in this axis.
                return;
            }
        } else if (!instanceContext.settings.allowVerticalMove) { // Horizontal-only drag
            if (horizontalShift > 0) {
                startIndex = instanceContext.activeMovableIndex + 1;
            } else if(horizontalShift < 0) {
                endIndex = instanceContext.activeMovableIndex;
            } else {
                // No horizontal movement, no reordering possible in this axis.
                return;
            }
        }

        // Iterate through items to find a potential new position.
        for (; startIndex < endIndex; startIndex++) {
            currentItem = currentMovableElements[startIndex];
            // Skip the item currently being dragged.
            if (startIndex === instanceContext.activeMovableIndex) {
                continue;
            }

            // Check if the dragged proxy overlaps with another item.
            var isOverlappingVertically = instanceContext.settings.allowVerticalMove &&
                                          currentTop > currentItem.offsetTop &&
                                          currentTop < currentItem.offsetTop + currentItem.offsetHeight;
            var isOverlappingHorizontally = instanceContext.settings.allowHorizontalMove &&
                                            currentLeft > currentItem.offsetLeft &&
                                            currentLeft < currentItem.offsetLeft + currentItem.offsetWidth;

            if (isOverlappingVertically || isOverlappingHorizontally) {
                // A new position is found. Trigger the order change callback.
                if (typeof instanceContext.settings.onOrderChange === 'function') {
                    instanceContext.settings.onOrderChange(instanceContext.activeMovableIndex, startIndex);
                } else {
                    console.warn('DraggableList: onOrderChange callback not defined or not a function.');
                }
                
                instanceContext.activeMovableIndex = startIndex; // Update the active index.
                instanceContext.hasMoved = true; // Mark that an actual move occurred.
                instanceContext.initialLeft = currentLeft; // Update reference position.
                instanceContext.initialTop = currentTop;   // Update reference position.
                break; // Stop after finding the first overlap.
            }
        }

    }, processingDelay); // Apply the throttling delay.

    /**
     * Handles the ongoing drag event, updating the position of the dragged item clone.
     * @param {Event} dragProgressEvent - The current drag event object.
     */
    DraggableList.prototype.handleDrag = function (dragProgressEvent) {
        // Prevent further propagation if already stopped.
        if (dragProgressEvent.isPropagationStopped()) {
            return;
        }
        
        // Execute the user-defined drag progress callback.
        if (typeof this.settings.onDragProgress === 'function') {
            this.settings.onDragProgress(dragProgressEvent);
        } else {
            // Provide a no-op if not defined, to prevent errors.
            jq.noop();
        }
        
        // Calculate movement deltas from the previous event state.
        var deltaX = dragProgressEvent.clientX - this.currentEventState.clientX;
        var deltaY = dragProgressEvent.clientY - this.currentEventState.clientY;

        // Update the position of the drag proxy based on allowed axes.
        if(this.settings.allowVerticalMove) {
            this.draggedProxy.css('top', '+=' + deltaY);
        }
        if(this.settings.allowHorizontalMove) {
            this.draggedProxy.css('left', '+=' + deltaX);
        }

        // Detect potential reordering based on new position.
        positionDetector(this, dragProgressEvent);

        // Update the current event state for the next drag event calculation.
        this.currentEventState = dragProgressEvent;
    };

    /**
     * Initiates the drag operation when an item is clicked and dragged.
     * @param {Event} startEvent - The mousedown/touchstart event object.
     */
    DraggableList.prototype.handleDragStart = function (startEvent) {
        // Only proceed if left mouse button (or touch) and event not stopped.
        if (startEvent.which !== 1 || startEvent.isPropagationStopped()) {
            return;
        }
        
        var componentInstance = this; // Cache 'this'.
        this.hasMoved = false; // Reset the moved flag.
        var eventTargetElement = jq(startEvent.target); // The element that triggered the event.
        var allDraggableItems = this.retrieveMovableElements();
        
        // Handle check: if handles are specified, ensure the drag started on a handle.
        if (this.settings.handleSelector) {
            // Apply handle class to all elements matching the handle selector within items.
            // This is done here rather than `refresh` because child nodes might not be ready during refresh.
            allDraggableItems.find(this.settings.handleSelector).addClass(this.styleIdentifiers.dragHandle);
            
            // If the event target or its closest ancestor is not a handle, prevent drag.
            if (!eventTargetElement.closest('.' + this.styleIdentifiers.dragHandle).length) {
                return;
            }
        }

        // Execute the user-defined drag start callback.
        if (typeof this.settings.onDragInitiate === 'function') {
            this.settings.onDragInitiate(startEvent);
        } else {
            jq.noop();
        }

        // Determine the actual draggable item that initiated the drag.
        // This ensures `event.target` refers to the draggable item itself, not a child.
        startEvent.target = (function () {
            if (eventTargetElement.hasClass(componentInstance.styleIdentifiers.itemComponent)) {
                return startEvent.target;
            }
            else {
                // Find the closest parent that is a draggable item.
                var closestItem = eventTargetElement.closest('.' + componentInstance.styleIdentifiers.itemComponent);
                return closestItem.length ? closestItem[0] : startEvent.target; // Fallback to original target if none found.
            }
        })();

        // Store original body unselectable state and then disable selection on body.
        this.originalBodySelectability = docBody.attr('unselectable');
        docBody.attr('unselectable', 'on');

        // Mark the active item and store its reference.
        this.activeMovableItem = jq(startEvent.target).addClass(componentInstance.styleIdentifiers.currentActive);
        var itemPosition = this.activeMovableItem.position();

        // Get the index of the active item within the list.
        this.activeMovableIndex = Array.prototype.indexOf.call(allDraggableItems, this.activeMovableItem[0]);

        // Store initial position for delta calculations.
        this.initialTop = itemPosition.top;
        this.initialLeft = itemPosition.left;

        // Create a clone of the active item to be dragged.
        // This clone is visually moved, while the original item stays in place (or is hidden).
        this.draggedProxy = jq(startEvent.target).clone()
                .css({
                    'z-index': this.settings.layerIndex,
                    width: this.activeMovableItem[0].offsetWidth,
                    height: this.activeMovableItem[0].offsetHeight,
                    top: itemPosition.top,
                    left: itemPosition.left,
                    position: 'absolute', // Ensure the clone is absolutely positioned
                    'pointer-events': 'none' // Prevent clone from interfering with event capturing
                })
                .removeClass(componentInstance.styleIdentifiers.itemComponent)
                .addClass(componentInstance.styleIdentifiers.itemClone)
                .appendTo(startEvent.target.parentNode); // Append to the same parent as the original item.

        // Add a sorting class to the host element.
        this.hostContainer.addClass(componentInstance.styleIdentifiers.activeSorting);

        // Temporarily disable drag start on all items to prevent multiple drags.
        this.retrieveMovableElements().off(interactionEvents.dragInitiate);

        // Bind global drag and drag end events to the document body.
        docBody.on(interactionEvents.dragEvent, function (e) {
            componentInstance.handleDrag(e);
        })
        .on(interactionEvents.dragFinalize, function (e) {
            // Unbind these global events immediately after drag end.
            docBody.off(interactionEvents.dragEvent)
                   .off(interactionEvents.dragFinalize);
            componentInstance.handleDragEnd(e);
        })
        .on(interactionEvents.selectionPrevent, function (e) {
            // Prevent text selection during drag.
            e.preventDefault();
            return false;
        });

        // Store the current event state for delta calculations in subsequent drag events.
        this.currentEventState = startEvent;
    };

    /**
     * Finalizes the drag operation, cleaning up and re-enabling normal interactions.
     * @param {Event} endEvent - The mouseup/touchend event object.
     */
    DraggableList.prototype.handleDragEnd = function (endEvent) {
        if (endEvent.isPropagationStopped()) {
            return;
        }
        
        var instanceRef = this;
        instanceRef.activeMovableIndex = null; // Clear the active index.
        var allMovableElements = this.retrieveMovableElements();
        
        // Restore body unselectable attribute and remove global event listeners.
        docBody.attr('unselectable', instanceRef.originalBodySelectability || null)
                .off(interactionEvents.selectionPrevent); // This one might be redundant if already cleared in dragstart's dragend handler.
        
        // Re-enable drag start listeners on all items.
        allMovableElements.on(interactionEvents.dragInitiate, function (e) {
            // Unbind specific event before calling drag start to prevent duplicate handlers.
            jq(this).off(e);
            return instanceRef.handleDragStart(e);
        });

        // If no actual movement occurred, simulate a click on the original target.
        if (!this.hasMoved) {
            if (this.currentEventState && this.currentEventState.originalEvent && this.currentEventState.originalEvent.target) {
                 this.currentEventState.originalEvent.target.click();
            } else {
                console.warn('DraggableList: Could not simulate click, original event target not found.');
            }
        } else {
            // Execute the user-defined drag end callback if a move happened.
            if (typeof this.settings.onDragComplete === 'function') {
                 this.settings.onDragComplete(endEvent);
            } else {
                jq.noop();
            }
        }

        // Remove active class from the original item.
        if (this.activeMovableItem) {
            this.activeMovableItem.removeClass(this.styleIdentifiers.currentActive);
            this.activeMovableItem = null;
        } else {
             console.warn('DraggableList: No active item found at drag end.');
        }

        // Remove the sorting class from the host container.
        this.hostContainer.removeClass(this.styleIdentifiers.activeSorting);

        // Remove the dragged clone element from the DOM.
        if (this.draggedProxy) {
            this.draggedProxy.remove();
            this.draggedProxy = null;
        } else {
            console.warn('DraggableList: Dragged proxy element was already removed or never created.');
        }
    };

    /**
     * Safely applies changes within an Angular scope, handling digest cycles.
     * @param {Object} targetScope - The Angular scope.
     * @param {Function} actionCallback - The function containing scope modifications.
     */
    var applyScopeChanges = function (targetScope, actionCallback) {
        var currentPhase = targetScope.$root.$$phase;
        if (currentPhase === '$apply' || currentPhase === '$digest') {
            // If already in a digest cycle, just execute the callback.
            if (actionCallback && typeof actionCallback === 'function') {
                actionCallback();
            }
        } else {
            // Otherwise, wrap in $apply to trigger a digest.
            targetScope.$root.$apply(actionCallback);
        }
    };

    // Ensure angular is available before attempting to define the module.
    if (typeof angular !== 'undefined') {
        angular.module('draggableComponents', [])
            // Factory for default draggable component options.
            .factory('movableConfigDefaults', function () {
                return {
                    // Default options can be specified here.
                };
            })
            // Directive for making lists draggable.
            .directive('movableList', ['movableConfigDefaults', function (movableConfigDefaults) {
                return {
                    restrict: 'A', // Attribute directive.
                    scope: {
                        movableData: '=',           // The array of data items to be reordered.
                        moveDirection: '@',         // 'horizontal' or 'vertical'
                        itemSelectors: '@',         // Custom selector for draggable items.
                        handleSelectors: '@',       // Custom selector for drag handles.
                        zIndexLevel: '@',           // Z-index for the dragged proxy.
                        disableMovement: '=',       // Boolean to enable/disable dragging.
                        onOrderUpdate: '=',         // Callback for order change.
                        onDragging: '=',            // Callback for drag progress.
                        onDragInitiation: '=',      // Callback for drag start.
                        onDragFinalized: '='        // Callback for drag end.
                    },
                    link: function (scopeCtx, elementNode, attributeSet) {
                        var dataCollection = scopeCtx.movableData;

                        // Initialize data collection if it's not provided.
                        if (!dataCollection) {
                            dataCollection = [];
                            console.warn('movableList: No movableData provided, initializing an empty array.');
                        }

                        /**
                         * Handles the actual reordering of the data array in the scope.
                         * @param {number} sourceIndex - Original index of the dragged item.
                         * @param {number} destinationIndex - New index of the dragged item.
                         */
                        function handleOrderChange(sourceIndex, destinationIndex) {
                            applyScopeChanges(scopeCtx, function () {
                                // Perform the array reordering.
                                var movedItem = dataCollection.splice(sourceIndex, 1);
                                dataCollection.splice(destinationIndex, 0, movedItem[0]);
                                
                                // Call specific directive callback if defined.
                                if (scopeCtx.onOrderUpdate) {
                                    scopeCtx.onOrderUpdate(sourceIndex, destinationIndex);
                                } 
                                // Fallback to global default callback if directive-specific is not defined.
                                else if (movableConfigDefaults.onOrderChange) {
                                    movableConfigDefaults.onOrderChange(sourceIndex, destinationIndex);
                                }
                            });
                        }

                        // Determine the movement axis.
                        var movementAxis = scopeCtx.moveDirection || movableConfigDefaults.direction;
                        var isHorizontalOnly = (movementAxis === 'horizontal');
                        var isVerticalOnly = (movementAxis === 'vertical');

                        // Assemble configuration for the DraggableList instance.
                        var componentConfiguration = {
                            itemSelector: scopeCtx.itemSelectors || movableConfigDefaults.itemSelector,
                            handleSelector: scopeCtx.handleSelectors || movableConfigDefaults.handleSelector,
                            layerIndex: scopeCtx.zIndexLevel || movableConfigDefaults.layerIndex,
                            onOrderChange: handleOrderChange, // Our custom handler for array reordering.
                            onDragProgress: scopeCtx.onDragging || movableConfigDefaults.onDragProgress || function(){},
                            onDragInitiate: scopeCtx.onDragInitiation || movableConfigDefaults.onDragInitiate || function(){},
                            onDragComplete: scopeCtx.onDragFinalized || movableConfigDefaults.onDragFinalized || function(){},
                            allowHorizontalMove: !isVerticalOnly,
                            allowVerticalMove: !isHorizontalOnly
                        };

                        // Create a new instance of the DraggableList.
                        var draggableInstance = new DraggableList(elementNode, componentConfiguration);

                        // Watch for changes in the disableMovement flag to enable/disable the component.
                        scopeCtx.$watch('disableMovement', function (isDisabled) {
                            // Convert to boolean explicitly, as watch value might be anything.
                            draggableInstance.setInteractionStatus(!Boolean(isDisabled));
                        });

                        // Watch for changes in the number of draggable items to trigger a refresh.
                        scopeCtx.$watch(function(){ 
                            return elementNode.find('.' + draggableInstance.styleIdentifiers.itemComponent).length; 
                        }, function (newCount, oldCount) {
                            if (newCount !== oldCount) {
                                console.log('movableList: Item count changed from ' + oldCount + ' to ' + newCount + '. Refreshing handlers.');
                                draggableInstance.updateInteractionHandlers();
                            }
                        });
                        
                        // Clean up resources when the directive's scope is destroyed.
                        elementNode.on('$destroy', function(){
                            console.log('movableList: Directive destroyed, releasing resources.');
                            draggableInstance.releaseResources();
                        });
                    }
                };
            }]);
    } else {
        console.error('AngularJS not found. The draggableComponents module cannot be initialized.');
    }

}(jQuery));