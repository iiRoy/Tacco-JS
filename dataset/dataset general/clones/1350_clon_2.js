(function ( jQ, globalObj, domRoot, undefVal ) {

    // Main viewport reference for event binding
    var currView = jQ(this);

    // Current vertical scroll position or page offset
    var scrollPos = currView.scrollTop() || globalObj.pageYOffset;

    // Flag to prevent multiple reloads
    var operationActive = false;


    /**
     * Checks if the device supports touch events.
     * @returns {boolean} True if touch events are supported, false otherwise.
     */
    var supportsTouchEvents = function() {
        return !!('ontouchstart' in globalObj) || !!('onmsgesturechange' in globalObj);
    };


    // Map to store currently bound event handlers
    var eventRegistry = {};


    /**
     * Registers an event handler on the viewport.
     * @param {string} eventName - The name of the event to bind.
     * @param {Function} callbackFn - The function to execute when the event fires.
     */
    var registerEvent = function( eventName, callbackFn ) {
        currView.on( eventName, callbackFn );
        eventRegistry[ eventName ] = callbackFn;
    };


    /**
     * Unregisters a specific event handler from the viewport.
     * @param {string} eventName - The name of the event to unbind.
     * @param {Function} callbackFn - The function to unbind (optional, uses stored if omitted).
     */
    var unregisterEvent = function( eventName, callbackFn ) {
        currView.off( eventName, eventRegistry[ eventName ] );
        delete eventRegistry[ eventName ];
    };


    /**
     * Clears all registered event handlers.
     */
    var clearAllEvents = function() {
        for ( var evtName in eventRegistry ) {
            unregisterEvent( evtName );
        }
    };


    // Core functionalities of the component
    var pluginActions = {

        /**
         * Initializes the pull-to-refresh component on selected elements.
         * @param {object} configParams - Configuration options for the component.
         * @returns {jQuery} The jQuery object for chaining.
         */
        init: function( configParams ) {

            return this.each( function() {

                var targetElement = jQ(this);

                var componentConfig = targetElement.data('pullToRefresh');

                // Check if component is already initialized
                if ( typeof(componentConfig) === 'undefined' ) {

                    // Define default settings for the component
                    var baseConfig = {
                        shouldReloadEntirePage: true, // If false, reloads the element's content
                        createElementsDynamically: true, // If false, assumes loader elements are pre-existing
                        showLoaderText: false, // Displays "Reloading..." text if true
                        enableMouseWheel: false, // Activates mouse wheel detection for reload
                        pullThreshold: 60, // Minimum swipe distance to trigger reload on touch devices
                        loadingIndicatorClass: 'pull-indicator',
                        spinnerAnimationClass: 'spin-animation',
                        loadingMessageClass: 'status-msg',
                        loadingMessage: 'Refreshing...',
                        customReloadFunction: function() {} // Custom function to call on element reload
                    };

                    // Merge defaults with provided options
                    componentConfig = jQ.extend({}, baseConfig, configParams);

                    // Store the merged settings with the element
                    targetElement.data('pullToRefresh', componentConfig);

                } else {

                    // Update existing settings with new options
                    componentConfig = jQ.extend({}, componentConfig, configParams);

                }

                // Dynamically create loader elements if enabled
                if ( componentConfig.createElementsDynamically === true ) {
                    var loadingContainer = '<div class=' + componentConfig.loadingIndicatorClass + '>';
                    loadingContainer += '<div class=' + componentConfig.spinnerAnimationClass + '/>';
                    loadingContainer += '</div>';

                    var messageSpan = '<span class=' + componentConfig.loadingMessageClass + '>' + componentConfig.loadingMessage + '</span>';

                    targetElement.append( loadingContainer );

                    if ( componentConfig.showLoaderText === true ) {
                        targetElement.addClass('has-msg-display');
                        targetElement.append( messageSpan );
                    }
                }

                // Bind events based on device capabilities
                if ( !supportsTouchEvents() ) {
                    if ( componentConfig.enableMouseWheel === true ) {
                        registerEvent('mousewheel', function( eventObj, scrollDelta ) {
                            pluginActions.handleScroll( targetElement, componentConfig, scrollDelta );
                        });
                    } else {
                        registerEvent('scroll', function() {
                            pluginActions.handleScroll( targetElement, componentConfig );
                        });
                    }
                } else {
                    var initialTouchY = 0;
                    var currentSwipeDelta = 0;

                    registerEvent('touchstart', function( eventObj ) {
                        initialTouchY = eventObj.originalEvent.touches[0].pageY;
                    });

                    registerEvent('touchmove', function( eventObj ) {
                        currentSwipeDelta = eventObj.originalEvent.touches[0].pageY - initialTouchY;
                        scrollPos = jQ(this).scrollTop();

                        if ( currentSwipeDelta < componentConfig.pullThreshold && scrollPos <= 0 ) {
                            eventObj.preventDefault(); // Prevent page scrolling if within threshold
                        }


                        if ( currentSwipeDelta > componentConfig.pullThreshold && initialTouchY <= 30 ) {
                            pluginActions.handleSwipe( targetElement, componentConfig );
                        }
                    });

                    registerEvent('touchend', function() {
                        currentSwipeDelta = 0; // Reset swipe tracking
                    });
                }

            }); // End this.each
        }, // End init method


        /**
         * Handles scroll events to trigger reload.
         * @param {jQuery} elementRef - The jQuery element.
         * @param {object} currentConfig - The element's configuration.
         * @param {number} [scrollDelta] - Mouse wheel delta value (optional).
         */
        handleScroll: function( elementRef, currentConfig, scrollDelta ) {
            scrollPos = currView.scrollTop();

            // Mouse wheel specific logic
            if ( currentConfig.enableMouseWheel === true && (scrollDelta >= 180 && scrollPos <= 0) ) {
                if ( operationActive === false ) {
                    pluginActions.performReload( elementRef, currentConfig );
                    operationActive = true;
                }
            }

            // General scroll logic (for non-mousewheel, or when at top)
            if ( currentConfig.enableMouseWheel === false && scrollPos <= 0 ) {
                if ( operationActive === false ) {
                    pluginActions.performReload( elementRef, currentConfig );
                    operationActive = true;
                }
            }
        },


        /**
         * Handles swipe events to trigger reload.
         * @param {jQuery} elementRef - The jQuery element.
         * @param {object} currentConfig - The element's configuration.
         */
        handleSwipe: function( elementRef, currentConfig ) {
            if ( scrollPos <= 0 ) {
                pluginActions.performReload( elementRef, currentConfig );
            }
        },


        /**
         * Executes the reload animation and action.
         * @param {jQuery} elementRef - The jQuery element.
         * @param {object} currentConfig - The element's configuration.
         */
        performReload: function( elementRef, currentConfig ) {
            elementRef.show();
            elementRef.animate({
                "marginTop": "0px"
            }, 250); // Animation duration

            elementRef.delay(600).slideUp(250, function () {
                if ( currentConfig.shouldReloadEntirePage ) {
                    globalObj.location.reload(true); // Full page reload
                }

                operationActive = false; // Reset flag after reload
            });

            if ( !currentConfig.shouldReloadEntirePage ) {
                currentConfig.customReloadFunction(); // Call custom function for element reload
            }
        },


        /**
         * Destroys the pull-to-refresh component.
         * Removes event handlers and cleanup data.
         * @returns {jQuery} The jQuery object for chaining.
         */
        destroy: function() {
            clearAllEvents(); // Unbind all registered events
            return jQ(this).each(function(){
                var targetElement = jQ(this);

                targetElement.empty(); // Remove any dynamically added loader elements
                targetElement.removeData('pullToRefresh'); // Clear stored data
            });
        }

    }; // End pluginActions


    // Register the component as a jQuery plugin
    jQ.fn.pullToRefresh = function () {
        var actionName = arguments[0]; // First argument is the method name

        // Check if the method exists in pluginActions
        if ( pluginActions[actionName] ) {
            actionName = pluginActions[actionName];
            // Shift arguments to pass to the method
            arguments = Array.prototype.slice.call( arguments, 1 );
        } else if ( typeof(actionName) === 'object' || !actionName ) {
            // Default to 'init' if no method name or an options object is passed
            actionName = pluginActions.init;
        } else {
            // Handle unknown method calls
            jQ.error( 'Routine ' + actionName + ' does not exist on jQ.pullToRefreshComponent' );
            return this;
        }

        // Apply the method with the current context and arguments
        return actionName.apply( this, arguments );
    };


})( jQ, window, document );