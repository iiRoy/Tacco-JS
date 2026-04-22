/*
 * PointerPal v1.0 - Enhanced Cursor Effects Library
 * LICENSE: MIT
 *
 * This library provides a collection of dynamic visual effects for mouse pointers
 * within web applications, offering a more interactive user experience.
 */

// Define the global namespace for PointerPal functionalities.
// It acts as a factory function to create new instances of cursor effect handlers.
const PointerPal = function( initialSelection ) {
    // Ensure the function is called with 'new' for proper instance creation.
    if ( !( this instanceof PointerPal ) ) {
        return new PointerPal( initialSelection );
    }

    let targetNodes;

    // Handle different types of initial input for selection.
    if ( typeof initialSelection === 'string' ) {
        // If a string, treat it as a CSS selector and query all matching elements.
        targetNodes = document.querySelectorAll( initialSelection );
        if ( targetNodes.length === 0 ) {
            console.warn(`PointerPal: No elements found for selector "${initialSelection}".`);
            // Return an instance with an empty NodeList to avoid errors.
            return new PointerPal.Instance( [] );
        }
    } else if ( initialSelection instanceof HTMLElement ) {
        // If a single HTML element, wrap it in an array for consistent processing.
        targetNodes = [ initialSelection ];
    } else if ( initialSelection instanceof NodeList || Array.isArray( initialSelection ) ) {
        // If already a NodeList or array of elements, use directly.
        targetNodes = initialSelection;
    } else {
        // Default to the document body if no valid selection is provided.
        console.info('PointerPal: No valid elements provided, defaulting to document body.');
        targetNodes = [ document.body ];
    }

    // Return a new instance of the PointerPal handler.
    return new PointerPal.Instance( Array.from( targetNodes ) );
};

// --- Global Utilities and Configuration ---

// Store global mouse coordinates, updated by a single document-wide event listener.
let _globalPointerX = 0;
let _globalPointerY = 0;

// Attach a listener to track the cursor's absolute position on the page.
document.addEventListener('mousemove', (evt) => {
    _globalPointerX = evt.clientX;
    _globalPointerY = evt.clientY;
}, { passive: true }); // Use passive listener for performance, as we don't preventDefault.

/**
 * Iterates over a collection of DOM nodes, applying a callback function to each.
 * This is a robust internal utility for consistent element processing.
 * @param {Array<HTMLElement>} nodeCollection - The array of HTML elements to iterate.
 * @param {Function} processingCallback - The function to execute for each element.
 */
PointerPal.processElements = ( nodeCollection, processingCallback ) => {
    if ( !Array.isArray( nodeCollection ) || !processingCallback ) {
        console.error('PointerPal.processElements: Invalid arguments provided.');
        return;
    }
    nodeCollection.forEach( processingCallback );
};

// --- Effect Registry and Dispatcher ---

/**
 * The main container for all defined effect categories and their implementations.
 * Custom effects can be added here.
 */
PointerPal.effectRegistry = {
    pointerTrail: {},
    textOverlay: {},
    imageOverlay: {}
};

/**
 * Dispatches an effect based on its category and name.
 * This allows external modules or users to trigger predefined effects.
 * @param {string} effectCategory - The category of the effect (e.g., 'textOverlay').
 * @param {object} effectDetails - An object containing the effect name and any specific options.
 * @param {Array<HTMLElement>} targetElements - The elements on which the effect should be applied.
 * @returns {*} The result of the effect function, often a cleanup reference.
 */
PointerPal.triggerEffect = ( effectCategory, effectDetails, targetElements ) => {
    if ( !effectCategory || !effectDetails || !effectDetails.name ) {
        console.error('PointerPal.triggerEffect: Missing category or effect name.');
        return;
    }

    const categoryHandlers = PointerPal.effectRegistry[ effectCategory ];
    if ( categoryHandlers ) {
        const effectHandler = categoryHandlers[ effectDetails.name ];
        if ( typeof effectHandler === 'function' ) {
            return effectHandler( targetElements, effectDetails );
        } else {
            console.warn(`PointerPal: Effect "${effectDetails.name}" not found in category "${effectCategory}".`);
        }
    } else {
        console.warn(`PointerPal: Effect category "${effectCategory}" not found.`);
    }
    return null;
};


/*
 * AVAILABLE CURSOR BEHAVIORS:
 *
 *  - `chasePointer`: Element scrolls to follow the mouse.
 *  - `toggleVisibility`: Cursor blinks at a set interval.
 *  - `delayedChange`: Cursor changes after a timeout, optionally reverting.
 *  - `cycleCursors`: Cursor alternates between two styles repeatedly.
 *  - `addShadow`: Appends a graphical shadow/trail to the cursor.
 *  - `addTextOverlay`: Displays text following the cursor.
 *  - `addImageOverlay`: Displays an image following the cursor.
 *  - `onHover`: Attaches a mouseover event listener.
 *  - `onClick`: Attaches a click event listener.
 */

/**
 * The core prototype for PointerPal instances.
 * Contains all the methods for applying cursor effects.
 * @param {Array<HTMLElement>} selectedNodes - An array of DOM elements this instance operates on.
 * @param {Array<object>} [cleanupReferences=[]] - An optional array to store references
 *                                                  needed for stopping/cleaning up effects.
 */
PointerPal.Instance = function( selectedNodes, cleanupReferences = [] ) {
    this.targetElements = selectedNodes;
    this.activeResources = cleanupReferences; // Stores event listeners, interval IDs, created elements for cleanup.
};

// Define the methods available on a PointerPal instance.
PointerPal.Instance.prototype = {

    /**
     * Makes the target elements scroll to keep the mouse pointer in view.
     * This creates a "chase" effect where the viewport follows the cursor.
     * @returns {PointerPal.Instance} The current instance for chaining.
     */
    chasePointer: function() {
        const activeListeners = [];

        PointerPal.processElements( this.targetElements, ( currentItem ) => {
            const scrollHandler = ( eventObject ) => {
                const
                    viewportScrollY = window.scrollY || document.documentElement.scrollTop,
                    viewportScrollX = window.scrollX || document.documentElement.scrollLeft,
                    elementVisualWidth = currentItem.offsetWidth,
                    elementVisualHeight = currentItem.offsetHeight;

                // Calculate the target scroll position based on global cursor coordinates
                // and a scaling factor to make it work across different element sizes.
                const targetScrollX = ( _globalPointerX - viewportScrollX ) * ( elementVisualWidth / 700 );
                const targetScrollY = ( _globalPointerY - viewportScrollY ) * ( elementVisualHeight / 700 );

                window.scroll( targetScrollX, targetScrollY );
            };

            currentItem.addEventListener('mousemove', scrollHandler, { passive: true });
            activeListeners.push({
                type: 'event',
                eventType: 'mousemove',
                handler: scrollHandler,
                targetNode: currentItem
            });
        });

        return new PointerPal.Instance( this.targetElements, this.activeResources.concat( activeListeners ) );
    },

    /**
     * Makes the cursor on the target elements blink (toggle between visible and hidden).
     * @param {number} [cycleDurationMs=300] - The time in milliseconds for each blink cycle.
     * @param {string} [defaultPointerStyle='default'] - The cursor style to revert to when visible.
     * @returns {PointerPal.Instance} The current instance for chaining.
     */
    toggleVisibility: function( cycleDurationMs = 300, defaultPointerStyle = 'default' ) {
        const timerHandles = [];

        PointerPal.processElements( this.targetElements, ( currentItem ) => {
            let isVisible = true; // State tracker for the cursor visibility.

            const toggleCursor = () => {
                if ( isVisible ) {
                    currentItem.style.cursor = 'none';
                    isVisible = false;
                } else {
                    currentItem.style.cursor = defaultPointerStyle;
                    isVisible = true;
                }
            };

            const intervalId = setInterval( toggleCursor, cycleDurationMs );
            timerHandles.push({
                type: 'interval',
                id: intervalId,
                targetNode: currentItem
            });
        });

        return new PointerPal.Instance( this.targetElements, this.activeResources.concat( timerHandles ) );
    },

    /**
     * Changes the cursor style after a specified delay, with an option to revert.
     * @param {string} newPointerStyle - The cursor style to apply after the delay.
     * @param {number} [initialDelayMs=300] - The delay before applying the new cursor style.
     * @param {string|boolean} [revertTo='original'] - If a string, revert to that cursor style.
     *                                                  If true, revert to the original cursor.
     *                                                  If false, no reversion.
     * @returns {PointerPal.Instance} The current instance for chaining.
     */
    delayedChange: function( newPointerStyle, initialDelayMs = 300, revertTo = false ) {
        PointerPal.processElements( this.targetElements, ( currentItem ) => {
            const originalCursorStyle = currentItem.style.cursor;

            setTimeout(() => {
                currentItem.style.cursor = newPointerStyle || 'pointer';

                if ( revertTo ) {
                    const finalRevertStyle = (typeof revertTo === 'string') ? revertTo : originalCursorStyle;
                    setTimeout(() => {
                        currentItem.style.cursor = finalRevertStyle;
                    }, initialDelayMs); // Use the same delay for reversion.
                }
            }, initialDelayMs);
        });

        // This effect doesn't require explicit cleanup via activeResources as it uses setTimeout.
        return this;
    },

    /**
     * Cycles the cursor style between two specified values at a regular interval.
     * @param {string} styleOne - The first cursor style.
     * @param {string} styleTwo - The second cursor style.
     * @param {number} [cycleDurationMs=300] - The time in milliseconds for each cycle phase.
     * @returns {PointerPal.Instance} The current instance for chaining.
     */
    cycleCursors: function( styleOne, styleTwo, cycleDurationMs = 300 ) {
        const timerHandles = [];

        PointerPal.processElements( this.targetElements, ( currentItem ) => {
            let currentPhase = 0; // 0 for styleOne, 1 for styleTwo.

            const switchCursor = () => {
                if ( currentPhase === 0 ) {
                    currentItem.style.cursor = styleOne;
                    currentPhase = 1;
                } else {
                    currentItem.style.cursor = styleTwo;
                    currentPhase = 0;
                }
            };

            const intervalId = setInterval( switchCursor, cycleDurationMs );
            timerHandles.push({
                type: 'interval',
                id: intervalId,
                targetNode: currentItem
            });
        });

        return new PointerPal.Instance( this.targetElements, this.activeResources.concat( timerHandles ) );
    },

    /**
     * Adds a graphical "shadow" or "trail" canvas element that follows the cursor.
     * @param {number} [offsetX=0] - Horizontal offset from the cursor.
     * @param {number} [offsetY=0] - Vertical offset from the cursor.
     * @param {string} [fillColor='black'] - The fill color for the shadow shape.
     * @param {number} [animationDelayMs=0] - Delay before the shadow updates its position.
     * @param {object} [customEffect] - An object defining a custom effect from PointerPal.effectRegistry.pointerTrail.
     * @param {string} [cssClass='pointerpal-shadow'] - Custom CSS class for the shadow element.
     * @returns {PointerPal.Instance} The current instance for chaining.
     */
    addShadow: function( offsetX = 0, offsetY = 0, fillColor = 'black', animationDelayMs = 0, customEffect, cssClass = 'pointerpal-shadow' ) {
        const createdElements = [];

        PointerPal.processElements( this.targetElements, ( currentItem ) => {
            const shadowCanvas = document.createElement('canvas');
            shadowCanvas.width = 14;
            shadowCanvas.height = 21;
            shadowCanvas.style.position = 'absolute';
            shadowCanvas.style.display = 'none';
            shadowCanvas.style.pointerEvents = 'none'; // Ensure canvas doesn't interfere with mouse events.
            shadowCanvas.className = cssClass;
            shadowCanvas.style.zIndex = '9999'; // Ensure it's on top.

            const drawingContext = shadowCanvas.getContext('2d');
            drawingContext.fillStyle = fillColor;

            // Simplified default cursor shape (Ubuntu-like, as in original)
            drawingContext.beginPath();
            drawingContext.moveTo( 0, 0);
            drawingContext.lineTo( 13.5, 14);
            drawingContext.lineTo( 8, 14.5);
            drawingContext.lineTo( 10, 20);
            drawingContext.lineTo( 8, 20.5);
            drawingContext.lineTo( 5, 15.5);
            drawingContext.lineTo( 0, 18.5);
            drawingContext.closePath(); // Close the path to fill.
            drawingContext.fill();

            currentItem.appendChild( shadowCanvas );

            const mouseMoveHandler = () => {
                shadowCanvas.style.display = 'block';

                setTimeout( () => {
                    shadowCanvas.style.top = ( _globalPointerY + offsetY + 1 ) + 'px';
                    shadowCanvas.style.left = ( _globalPointerX + offsetX + 1 ) + 'px';
                }, animationDelayMs );
            };

            const mouseLeaveHandler = () => {
                shadowCanvas.style.display = 'none';
            };

            currentItem.addEventListener('mousemove', mouseMoveHandler, { passive: true });
            currentItem.addEventListener('mouseleave', mouseLeaveHandler, { passive: true });

            createdElements.push({
                type: 'dom',
                element: shadowCanvas,
                parentNode: currentItem,
                listeners: [
                    { eventType: 'mousemove', handler: mouseMoveHandler },
                    { eventType: 'mouseleave', handler: mouseLeaveHandler }
                ]
            });
        });

        if ( customEffect ) {
            PointerPal.triggerEffect( 'pointerTrail', customEffect, createdElements.map( ref => ref.element ) );
        }

        return new PointerPal.Instance( this.targetElements, this.activeResources.concat( createdElements ) );
    },

    /**
     * Displays a floating text element that follows the cursor.
     * @param {string} textContent - The text to display.
     * @param {object} [inlineStyles={}] - An object of CSS properties to apply directly.
     * @param {number} [offsetX=0] - Horizontal offset from the cursor.
     * @param {number} [offsetY=0] - Vertical offset from the cursor.
     * @param {object} [customEffect] - An object defining a custom effect from PointerPal.effectRegistry.textOverlay.
     * @param {string} [cssClass='pointerpal-text'] - Custom CSS class for the text element.
     * @returns {PointerPal.Instance} The current instance for chaining.
     */
    addTextOverlay: function( textContent, inlineStyles = {}, offsetX = 0, offsetY = 0, customEffect, cssClass = 'pointerpal-text' ) {
        const createdElements = [];

        PointerPal.processElements( this.targetElements, ( currentItem ) => {
            const floatingText = document.createElement('span');
            floatingText.textContent = textContent;
            floatingText.style.position = 'absolute';
            floatingText.style.display = 'none';
            floatingText.style.pointerEvents = 'none';
            floatingText.style.whiteSpace = 'nowrap';
            floatingText.style.zIndex = '9999';
            floatingText.className = cssClass;

            Object.assign( floatingText.style, inlineStyles );

            currentItem.appendChild( floatingText );

            const mouseMoveHandler = () => {
                floatingText.style.display = 'block';
                floatingText.style.top = ( _globalPointerY + 21 + offsetY ) + 'px';
                floatingText.style.left = ( _globalPointerX + 14 + offsetX ) + 'px';
            };

            const mouseLeaveHandler = () => {
                floatingText.style.display = 'none';
            };

            currentItem.addEventListener('mousemove', mouseMoveHandler, { passive: true });
            currentItem.addEventListener('mouseleave', mouseLeaveHandler, { passive: true });

            createdElements.push({
                type: 'dom',
                element: floatingText,
                parentNode: currentItem,
                listeners: [
                    { eventType: 'mousemove', handler: mouseMoveHandler },
                    { eventType: 'mouseleave', handler: mouseLeaveHandler }
                ]
            });
        });

        if ( customEffect ) {
            PointerPal.triggerEffect( 'textOverlay', customEffect, createdElements.map( ref => ref.element ) );
        }

        return new PointerPal.Instance( this.targetElements, this.activeResources.concat( createdElements ) );
    },

    /**
     * Displays a floating image element that follows the cursor.
     * @param {string} imageUrl - The URL of the image to display.
     * @param {object} [inlineStyles={}] - An object of CSS properties to apply directly.
     * @param {number} [offsetX=0] - Horizontal offset from the cursor.
     * @param {number} [offsetY=0] - Vertical offset from the cursor.
     * @param {object} [customEffect] - An object defining a custom effect from PointerPal.effectRegistry.imageOverlay.
     * @param {string} [cssClass='pointerpal-image'] - Custom CSS class for the image element.
     * @returns {PointerPal.Instance} The current instance for chaining.
     */
    addImageOverlay: function( imageUrl, inlineStyles = {}, offsetX = 0, offsetY = 0, customEffect, cssClass = 'pointerpal-image' ) {
        const createdElements = [];

        PointerPal.processElements( this.targetElements, ( currentItem ) => {
            const floatingImage = document.createElement('img');
            floatingImage.src = imageUrl;
            floatingImage.style.position = 'absolute';
            floatingImage.style.display = 'none';
            floatingImage.style.pointerEvents = 'none';
            floatingImage.style.zIndex = '9999';
            floatingImage.className = cssClass;

            Object.assign( floatingImage.style, inlineStyles );

            currentItem.appendChild( floatingImage );

            const mouseMoveHandler = () => {
                floatingImage.style.display = 'block';
                floatingImage.style.top = ( _globalPointerY + 21 + offsetY ) + 'px';
                floatingImage.style.left = ( _globalPointerX + 14 + offsetX ) + 'px';
            };

            const mouseLeaveHandler = () => {
                floatingImage.style.display = 'none';
            };

            currentItem.addEventListener('mousemove', mouseMoveHandler, { passive: true });
            currentItem.addEventListener('mouseleave', mouseLeaveHandler, { passive: true });

            createdElements.push({
                type: 'dom',
                element: floatingImage,
                parentNode: currentItem,
                listeners: [
                    { eventType: 'mousemove', handler: mouseMoveHandler },
                    { eventType: 'mouseleave', handler: mouseLeaveHandler }
                ]
            });
        });

        if ( customEffect ) {
            PointerPal.triggerEffect( 'imageOverlay', customEffect, createdElements.map( ref => ref.element ) );
        }

        return new PointerPal.Instance( this.targetElements, this.activeResources.concat( createdElements ) );
    },

    /**
     * Attaches an event handler for the 'mouseover' event to all target elements.
     * @param {Function} handlerFunction - The function to execute on mouseover.
     * @returns {PointerPal.Instance} The current instance for chaining.
     */
    onHover: function( handlerFunction ) {
        const registeredHandlers = [];

        PointerPal.processElements( this.targetElements, ( currentItem ) => {
            currentItem.addEventListener('mouseover', handlerFunction);
            registeredHandlers.push({
                type: 'event',
                eventType: 'mouseover',
                handler: handlerFunction,
                targetNode: currentItem
            });
        });

        return new PointerPal.Instance( this.targetElements, this.activeResources.concat( registeredHandlers ) );
    },

    /**
     * Attaches an event handler for the 'click' event to all target elements.
     * @param {Function} handlerFunction - The function to execute on click.
     * @returns {PointerPal.Instance} The current instance for chaining.
     */
    onClick: function( handlerFunction ) {
        const registeredHandlers = [];

        PointerPal.processElements( this.targetElements, ( currentItem ) => {
            currentItem.addEventListener('click', handlerFunction);
            registeredHandlers.push({
                type: 'event',
                eventType: 'click',
                handler: handlerFunction,
                targetNode: currentItem
            });
        });

        return new PointerPal.Instance( this.targetElements, this.activeResources.concat( registeredHandlers ) );
    },

    /**
     * Returns the current absolute coordinates of the mouse pointer on the screen.
     * @returns {{x: number, y: number}} An object with x and y coordinates.
     */
    getAbsolutePosition: function() {
        return { x: _globalPointerX, y: _globalPointerY };
    },

    /**
     * Returns the current relative coordinates of the mouse pointer within the first target element.
     * @returns {{x: number, y: number}} An object with x and y coordinates relative to the element.
     */
    getRelativePosition: function() {
        if ( !this.targetElements || this.targetElements.length === 0 ) {
            console.warn('PointerPal: Cannot get relative position, no target elements.');
            return { x: 0, y: 0 };
        }
        const firstElement = this.targetElements[0];
        const rect = firstElement.getBoundingClientRect();

        return {
            x: _globalPointerX - rect.left,
            y: _globalPointerY - rect.top
        };
    },

    /**
     * Stops and cleans up all resources (event listeners, intervals, DOM elements)
     * associated with a previously applied effect instance.
     * @param {PointerPal.Instance} effectInstance - The instance returned by a previous effect method call.
     */
    stopEffect: function( effectInstance ) {
        if ( !effectInstance || !Array.isArray( effectInstance.activeResources ) ) {
            console.warn('PointerPal.stopEffect: Invalid effect instance provided for cleanup.');
            return;
        }

        effectInstance.activeResources.forEach( ( resource ) => {
            switch ( resource.type ) {
                case 'event':
                    if ( resource.targetNode && resource.eventType && resource.handler ) {
                        resource.targetNode.removeEventListener( resource.eventType, resource.handler );
                    }
                    break;
                case 'interval':
                    if ( resource.id ) {
                        clearInterval( resource.id );
                    }
                    break;
                case 'dom':
                    if ( resource.element && resource.parentNode ) {
                        resource.parentNode.removeChild( resource.element );
                        // Also clean up any listeners attached directly to the created DOM element
                        if (Array.isArray(resource.listeners)) {
                            resource.listeners.forEach(listener => {
                                resource.element.removeEventListener(listener.eventType, listener.handler);
                            });
                        }
                    }
                    break;
                default:
                    console.warn(`PointerPal.stopEffect: Unknown resource type for cleanup: ${resource.type}`);
            }
        });

        // Clear the active resources array for the stopped instance.
        effectInstance.activeResources.length = 0;
    }
};

// --- Custom Effect Implementations (Example: Heartbeat) ---

/**
 * Example custom text effect: a 'heartbeat' animation for text overlays.
 * This function will be called by PointerPal.triggerEffect.
 * @param {Array<HTMLElement>} elementsToAnimate - The text elements to apply the effect to.
 * @param {object} options - Configuration options for the heartbeat effect.
 * @param {number} [options.minSize=11] - Minimum font size in pixels.
 * @param {number} [options.maxSize=25] - Maximum font size in pixels.
 * @param {number} [options.animationSpeed=30] - Base interval speed in ms.
 * @returns {Array<object>} An array of interval cleanup references.
 */
PointerPal.effectRegistry.textOverlay.heartbeat = ( elementsToAnimate, options = {} ) => {
    const minSize = options.minSize || 11;
    const maxSize = options.maxSize || 25;
    const baseSpeed = options.animationSpeed || 30;
    const cleanupRefs = [];

    PointerPal.processElements( elementsToAnimate, ( textNode ) => {
        let currentFontSize = parseInt( textNode.style.fontSize ) || minSize;
        let growing = true; // True for growing, false for shrinking.

        const animateHeartbeat = () => {
            if ( growing ) {
                currentFontSize++;
                if ( currentFontSize > maxSize ) {
                    growing = false;
                }
            } else {
                currentFontSize--;
                if ( currentFontSize < minSize ) {
                    growing = true;
                }
            }
            textNode.style.fontSize = currentFontSize + 'px';
        };

        const intervalId = setInterval( animateHeartbeat, baseSpeed );
        cleanupRefs.push({
            type: 'interval',
            id: intervalId,
            targetNode: textNode // Associate interval with the element for potential future cleanup
        });
    });

    return cleanupRefs; // Return references for potential external cleanup.
};