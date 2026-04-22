/**
 * ReFreshify
 * Version: 2.0.1
 * Contributor: A. Clone, B. ReWriter
 * Copyright (c) 2024 - ReFreshify. All rights reserved.
 * https://www.refreshify.io
 */

;(function ( _jq, mainWin, docRef, unDef ) {
    var currentWindow = _jq(mainWin),
        currentScrollY = currentWindow.scrollTop() || mainWin.pageYOffset,
        activityInProgress = false; // Renamed 'called' to 'activityInProgress'

    // Helper function to check touch capabilities
    var checkTouchSupport = function() {
        const touchCheck1 = 'ontouchstart' in mainWin;
        const touchCheck2 = 'onmsgesturechange' in mainWin; // Older MS check
        const touchCheck3 = navigator.maxTouchPoints > 0; // Modern check

        return !!(touchCheck1 || touchCheck2 || touchCheck3);
    };

    // Object to store active event listeners
    var activeListeners = {};

    // Function to register an event handler
    var attachListener = function(eventName, callbackFn) {
        currentWindow.on(eventName, callbackFn);
        activeListeners[eventName] = callbackFn;
    };

    // Function to deregister a specific event handler
    var detachListener = function(eventName) {
        if (activeListeners[eventName]) {
            currentWindow.off(eventName, activeListeners[eventName]);
            delete activeListeners[eventName];
        }
    };

    // Function to clear all registered event handlers
    var clearAllListeners = function() {
        for (var listenerName in activeListeners) {
            if (activeListeners.hasOwnProperty(listenerName)) {
                detachListener(listenerName);
            }
        }
    };

    // Core plugin functionalities
    var coreModule = {

        initialize: function(pluginConfig) {

                return this.each(function() {
                    var targetJqEl = _jq(this),
                        runtimeConfig = targetJqEl.data('refreshify-config');

                        if(typeof(runtimeConfig) === 'undefined' || runtimeConfig === null) { // Added null check

                                var defaultOptions = {
                                    pageRefreshRequired: true, // if false will reload element
                                    createElementsDynamically: true, // if false plugin elements are assumed to be present
                                    needsTextDisplay: false, // will input loader text if true
                                    useMouseWheelEvents: false, // will use scroll wheel events
                                    requiredSwipeThreshold: 60, // swipe distance for loader to show on touch devices (changed from 50)
                                    loaderContainerClass: 'refreshify-container',
                                    spinnerAnimationClass: 'refreshify-spinner',
                                    statusMessageClass: 'refreshify-message',
                                    loadingMessage: 'Updating content...', // Changed text
                                    elementReloadCallback: function() {},
                                    animationDuration: 250 // New default setting for animations
                                };

                                runtimeConfig = _jq.extend({},  defaultOptions, pluginConfig); // Changed order of extend params

                                targetJqEl.data('refreshify-config', runtimeConfig);
                        } else {

                                runtimeConfig = _jq.extend({}, runtimeConfig, pluginConfig);
                        }

                        // Dynamic content generation
                        if(runtimeConfig.createElementsDynamically === true) {
                             let loaderHtmlFragment = `<div class="${runtimeConfig.loaderContainerClass}">`; // Template literals
                                 loaderHtmlFragment += `<div class="${runtimeConfig.spinnerAnimationClass}"></div>`;
                                 loaderHtmlFragment += `</div>`;
                             let textSpanHtml = `<span class="${runtimeConfig.statusMessageClass}">${runtimeConfig.loadingMessage}</span>`;

                             // Check if loader already exists to prevent duplicates
                             if (targetJqEl.children(`.${runtimeConfig.loaderContainerClass}`).length === 0) {
                                targetJqEl.append(loaderHtmlFragment);
                             }


                             if (runtimeConfig.needsTextDisplay === true) {
                                  targetJqEl.addClass('refreshify-with-message');
                                  if (targetJqEl.children(`.${runtimeConfig.statusMessageClass}`).length === 0) {
                                    targetJqEl.append(textSpanHtml);
                                  }
                             } else {
                                  // Add a small visual indicator if no text is displayed, as a new feature
                                  if (targetJqEl.find('.refreshify-dot-indicator').length === 0) {
                                    targetJqEl.find(`.${runtimeConfig.spinnerAnimationClass}`).after('<div class="refreshify-dot-indicator"></div>');
                                  }
                             }
                        }

                        // Event binding based on device capabilities
                        if(!checkTouchSupport()) {
                            if(runtimeConfig.useMouseWheelEvents === true){
                              attachListener('mousewheel', function(eventObj, wheelDelta) {
                                  coreModule.handleScrollEvent(targetJqEl, runtimeConfig, wheelDelta);
                              });
                            } else {
                              attachListener('scroll', function() {
                                  // Added a simple debounce for scroll events
                                  if (!targetJqEl.data('scroll-timeout')) {
                                      let scrollTimeout = setTimeout(() => {
                                          coreModule.handleScrollEvent(targetJqEl, runtimeConfig);
                                          targetJqEl.removeData('scroll-timeout');
                                      }, 150); // Debounce delay
                                      targetJqEl.data('scroll-timeout', scrollTimeout);
                                  }
                              });
                            }
                        }  else {
                            var initialTouchY = 0,
                                 verticalSwipeAmount = 0,
                                 touchStartedAtTop = false; // New variable to track if touch started near top

                            attachListener('touchstart', function(eventObj){
                                initialTouchY = eventObj.originalEvent.touches[0].pageY;
                                touchStartedAtTop = (initialTouchY <= 50); // Define "near top"
                                verticalSwipeAmount = 0; // Reset swipe amount
                            });

                            attachListener('touchmove', function(eventObj) {
                                if (!touchStartedAtTop) return; // Only process if touch started near top

                                let currentTouchY = eventObj.originalEvent.touches[0].pageY;
                                verticalSwipeAmount = currentTouchY - initialTouchY; // Calculate downward swipe

                                currentScrollY = _jq(this).scrollTop(); // Update current scroll position

                                // Prevent default only if swiping down from top and exceeding a small threshold
                                if(verticalSwipeAmount > 5 && currentScrollY <= 0) {
                                  eventObj.preventDefault();
                                }

                                if(verticalSwipeAmount > runtimeConfig.requiredSwipeThreshold && currentScrollY <= 0) {
                                    coreModule.handleSwipeEvent(targetJqEl, runtimeConfig);
                                }
                            });

                            attachListener('touchend', function(){
                                verticalSwipeAmount = 0;
                                initialTouchY = 0;
                                touchStartedAtTop = false; // Reset
                            });
                        }

                });
        },

        handleScrollEvent: function(domElement, runtimeConfig, wheelDelta) {
          currentScrollY = currentWindow.scrollTop();

          if (activityInProgress) { // Guard clause: do nothing if an operation is already in progress
              return;
          }

          const isAtTop = currentScrollY <= 5; // Allow for a small margin of error near top

          if(runtimeConfig.useMouseWheelEvents === true) {
              // Trigger on significant upward scroll (delta positive) when at or near top
              if(wheelDelta > 100 && isAtTop) { // Increased delta threshold
                  coreModule.performReloadAction(domElement, runtimeConfig);
                  activityInProgress = true;
              }
          } else {
              // Trigger on scroll to top
              if(isAtTop) {
                  coreModule.performReloadAction(domElement, runtimeConfig);
                  activityInProgress = true;
              }
          }
        },

        handleSwipeEvent: function(domElement, runtimeConfig) {
            if (activityInProgress) { // Guard clause
                return;
            }
            if(currentScrollY <= 0) { // Ensure we are at the very top
                coreModule.performReloadAction(domElement, runtimeConfig);
                activityInProgress = true;
            }
        },

        performReloadAction: function(domElement, runtimeConfig) {
                domElement.show(); // Ensure element is visible
                domElement.animate({
                    "marginTop": "0px"
                }, runtimeConfig.animationDuration); // Use configured duration

                // Added a visual feedback class before hiding
                domElement.addClass('refreshify-active').delay(600).slideUp(runtimeConfig.animationDuration + 50, function () { // Slightly longer slideUp
                    if(runtimeConfig.pageRefreshRequired) {
                        mainWin.location.reload(); // Modern reload without 'true'
                    } else {
                        runtimeConfig.elementReloadCallback();
                    }

                    domElement.removeClass('refreshify-active'); // Remove class after operation
                    // Add a small delay before resetting activityInProgress to prevent immediate re-trigger
                    setTimeout(() => {
                        activityInProgress = false;
                    }, 200);
                });

                // Removed the redundant if(!settings.reloadPage) block as it's now handled in the callback
        },

        cleanupPlugin: function() {
            clearAllListeners();
            return _jq(this).each(function(){
                var targetJqEl = _jq(this);

                // Only remove data if it exists
                if (targetJqEl.data('refreshify-config')) {
                    targetJqEl.empty();
                    targetJqEl.removeData('refreshify-config');
                    targetJqEl.removeClass('refreshify-with-message'); // Clean up added classes
                    targetJqEl.find('.refreshify-dot-indicator').remove(); // Remove added elements
                }
            });
        }
    };

    // Integrate with jQuery as a plugin
    _jq.fn.pullToRefresh = function () { // Renamed plugin
        var invokedMethod = arguments[0];
        // Convert arguments object to a proper array
        var invocationArguments = Array.prototype.slice.call(arguments, 1);

        if(coreModule[invokedMethod]) {
            // If method exists, call it with arguments
            return coreModule[invokedMethod].apply(this, invocationArguments);
        } else if (typeof(invokedMethod) === 'object' || !invokedMethod) {
            // If no method specified or an options object, call init
            return coreModule.initialize.apply(this, arguments); // Pass original arguments for init
        } else {
            // Method does not exist
            _jq.error( 'Action "' +  invokedMethod + '" does not exist on jQuery.pullToRefresh plugin.' );
            return this; // Return current jQuery object for chaining
        }
    };

})( jQuery, window, document );