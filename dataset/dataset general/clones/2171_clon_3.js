// Dynamic Element Anchor
// ====================
// Build: 2.1.0
// Proprietor: Some Digital Assets
// Developer: John Doe
// Contact: http://twitter.com/john_doe_dev
// Project Site: http://johndoeportfolio.com/
// Repository: https://github.com/johndoe/dynamic-element-anchor
// License: Permitted under the MIT License - see www.opensource.org/licenses/mit-license.php
// Purpose: A versatile jQuery utility to keep any DOM element visible during page scrolling.

(function(jQueryAlias, globalObj, missingVal) {
    "use strict";

    // Obtain references to key global objects for efficiency
    var currentWindow = jQueryAlias(globalObj),
        pageDocument = globalObj.document,
        currentDocument = jQueryAlias(pageDocument);

    // Legacy browser detection (IE specific for certain layout fixes)
    var legacyBrowser = (function() {
        var versionValue,
            tempDiv = pageDocument.createElement('div'),
            allTags = tempDiv.getElementsByTagName('i');

        // Loop to find IE version
        for (versionValue = 3; tempDiv.innerHTML = '<!--[if gt IE ' + (++versionValue) + ']><i></i><![endif]-->', allTags[0];) {}
        return (versionValue > 4) ? versionValue : missingVal;
    })();

    /*----------------------------------------------------
                     Core Utility Functions
    ----------------------------------------------------*/

    // Tracks scroll position and direction for advanced behavior
    var trackPageScroll = function() {
        var horizontalOffset = globalObj.pageXOffset !== missingVal ? globalObj.pageXOffset : (pageDocument.compatMode === "CSS1Compat" ? pageDocument.documentElement.scrollLeft : pageDocument.body.scrollLeft),
            verticalOffset = globalObj.pageYOffset !== missingVal ? globalObj.pageYOffset : (pageDocument.compatMode === "CSS1Compat" ? pageDocument.documentElement.scrollTop : pageDocument.body.scrollTop);

        // Initialize tracking variables on first call
        if (typeof trackPageScroll.lastX === 'undefined') {
            trackPageScroll.lastX = horizontalOffset;
            trackPageScroll.lastY = verticalOffset;
            trackPageScroll.deltaX = 0; // Initialize distance to 0
            trackPageScroll.deltaY = 0; // Initialize distance to 0
        } else {
            trackPageScroll.deltaX = horizontalOffset - trackPageScroll.lastX;
            trackPageScroll.deltaY = verticalOffset - trackPageScroll.lastY;
        }

        var xDifference = trackPageScroll.lastX - horizontalOffset,
            yDifference = trackPageScroll.lastY - verticalOffset;

        // Determine scroll direction
        trackPageScroll.direction = (xDifference < 0) ? 'right' :
                                    (xDifference > 0) ? 'left' :
                                    (yDifference < 0) ? 'down' :
                                    (yDifference > 0) ? 'up' : 'initial'; // Renamed 'first' to 'initial'

        trackPageScroll.lastX = horizontalOffset;
        trackPageScroll.lastY = verticalOffset;
    };
    currentWindow.on('scroll', trackPageScroll);


    // Custom jQuery extension to retrieve computed CSS properties from a temporary clone
    jQueryAlias.fn.getComputedStyleValues = function(propList) {
        // If no property list is provided, return null immediately.
        if (!propList) {
            return null;
        }

        var targetElement = jQueryAlias(this),
            retrievedValue;

        // Create a hidden clone to safely read styles without affecting layout
        var tempClone = targetElement.clone().css('display', 'none');
        // Prevent radio button selection conflicts by randomizing names in the clone
        tempClone.find('input:radio').attr('name', 'temp-copy-' + Math.floor((Math.random() * 1000) + 1));
        // Temporarily add clone to DOM to allow style computation
        targetElement.after(tempClone);

        // Helper to get a single computed style property
        var extractStyleProperty = function(elementNode, propertyName) {
            var propertyValue;
            if (elementNode.currentStyle) { // IE-specific way to get current style
                // Convert 'padding-left' to 'paddingLeft' for currentStyle access
                propertyValue = elementNode.currentStyle[propertyName.replace(/-\w/g, function(match) {
                    return match.toUpperCase().replace('-', '');
                })];
            } else if (globalObj.getComputedStyle) { // Standard way for computed styles
                propertyValue = pageDocument.defaultView.getComputedStyle(elementNode, null).getPropertyValue(propertyName);
            }
            // Special handling for 'margin' properties to detect 'auto'
            // Check if margin value matches the element's offsetLeft when it should be auto-calculated.
            if ((/margin/g.test(propertyName)) && (parseInt(propertyValue, 10) === targetElement[0].offsetLeft)) {
                propertyValue = 'auto';
            }
            return propertyValue;
        };

        if (typeof propList === 'string') {
            retrievedValue = extractStyleProperty(tempClone[0], propList);
        } else { // Handle an array of properties
            retrievedValue = {};
            jQueryAlias.each(propList, function(idx, currentProp) {
                retrievedValue[currentProp] = extractStyleProperty(tempClone[0], currentProp);
            });
        }

        // Clean up: remove the temporary clone from the DOM
        tempClone.remove();

        // Return the collected style values or null if none were found
        return retrievedValue || null;
    };


    /*----------------------------------------------------
                      jQuery Plugin Definition
    ----------------------------------------------------*/

    // Utility function to manage plugin options and state on an element.
    var _managePluginData = function(element, pluginName, settings, commandMethods) {
        var dataKey = 'pluginData_' + pluginName;

        // If commandMethods are provided, it's a call to define commands.
        if (commandMethods) {
            element.each(function() {
                var $el = jQueryAlias(this);
                var currentSettings = $el.data(dataKey) || {};
                currentSettings.commands = commandMethods;
                $el.data(dataKey, currentSettings);
            });
            return element;
        }

        // If settings are provided, it's a call to set or update settings.
        if (settings) {
            element.each(function() {
                var $el = jQueryAlias(this);
                var currentSettings = $el.data(dataKey) || {};
                jQueryAlias.extend(currentSettings, settings);
                $el.data(dataKey, currentSettings);
            });
            return element;
        }

        // If neither settings nor commandMethods, it's a call to get settings.
        return element.data(dataKey) || {};
    };

    jQueryAlias.fn.extend({

        fixedWidget: function(opts) {

            // Ensure the selector matched at least one element. If not, return the jQuery object.
            if (this.length === 0) {
                return this;
            }

            // Define default settings for the plugin and merge with user-provided options.
            // Also, define internal command methods that can be called on the plugin instance.
            _managePluginData(this, 'fixedWidget', {
                topOffset: 0,
                bottomOffset: 0,
                endBoundaryOffset: 0,
                innerScrollTop: 0,
                innerElementForScroll: null,
                activeClass: 'fixed-active',
                containerClass: 'fixed-container',
                attachToTarget: null,
                responsiveBehavior: true,
                followScrollMovement: true,
                disabledBreakpoints: null, // e.g., [{ from: 0, to: 768 }, { from: 1024 }]
                onActivation: jQueryAlias.noop,
                onDeactivation: jQueryAlias.noop,
                enabled: true,
                internalFn: null // Used internally to store event handlers
            }, {
                // Command to re-initialize the widget with current settings.
                reinitialize: function() {
                    jQueryAlias(this).fixedWidget();
                },
                // Command to stop the widget from being fixed, reverting to absolute positioning.
                deactivateFixation: function() {
                    _managePluginData(jQueryAlias(this), 'fixedWidget', { enabled: false }).each(function() {
                        var currentElem = jQueryAlias(this),
                            currentOpts = _managePluginData(currentElem, 'fixedWidget'),
                            parentContainer = currentElem.parent('.' + currentOpts.containerClass);

                        // Calculate current position relative to its parent container
                        var currentTopPosition = currentElem.offset().top - parentContainer.offset().top;
                        currentElem.css({
                            position: 'absolute',
                            top: currentTopPosition,
                            bottom: 'auto',
                            left: 'auto',
                            right: 'auto'
                        }).removeClass(currentOpts.activeClass);
                        parentContainer.removeClass('fixed-active-wrapper');
                    });
                },
                // Command to turn off all sticky behavior and reset styles to relative.
                disableWidget: function() {
                    _managePluginData(jQueryAlias(this), 'fixedWidget', { enabled: false }).each(function() {
                        var currentElem = jQueryAlias(this),
                            currentOpts = _managePluginData(currentElem, 'fixedWidget'),
                            parentContainer = currentElem.parent('.' + currentOpts.containerClass);

                        // Clear all positioning styles
                        currentElem.css({
                            position: 'relative',
                            top: 'auto',
                            bottom: 'auto',
                            left: 'auto',
                            right: 'auto'
                        }).removeClass(currentOpts.activeClass);

                        parentContainer.css('height', 'auto').removeClass('fixed-active-wrapper');
                    });
                },
                // Command to re-enable the widget and trigger a re-evaluation.
                enableWidget: function() {
                    jQueryAlias(this).each(function() {
                        _managePluginData(jQueryAlias(this), 'fixedWidget', {
                            enabled: true,
                            // Store current scroll position to intelligently resume fixing
                            restorePoint: {
                                initialScrollPosition: currentWindow.scrollTop()
                            }
                        }).fixedWidget();
                    });
                },
                // Command to completely remove the widget's functionality and DOM modifications.
                destroyWidget: function() {
                    var currentElem = jQueryAlias(this),
                        currentOpts = _managePluginData(currentElem, 'fixedWidget'),
                        parentContainer = currentElem.parent('.' + currentOpts.containerClass);

                    // Reset element's position to its original state (before wrapper)
                    currentElem.removeData('fixedWidgetInitialized').css({
                        position: parentContainer.css('position'),
                        top: parentContainer.css('top'),
                        bottom: parentContainer.css('bottom'),
                        left: parentContainer.css('left'),
                        right: parentContainer.css('right')
                    }).removeClass(currentOpts.activeClass);

                    // Remove event listeners associated with this instance
                    if (currentOpts.internalFn) {
                        currentWindow.off('resize', currentOpts.internalFn.handleResize).off('scroll', currentOpts.internalFn.handleScroll);
                    }

                    // Remove the wrapper element, restoring the original DOM structure
                    currentElem.unwrap();
                    // Clear all plugin data
                    currentElem.removeData('pluginData_fixedWidget');
                }
            });

            // Handle explicit 'on' or 'off' option calls
            if (opts && typeof opts.enabled !== 'undefined') {
                if (opts.enabled) {
                    this.fixedWidget('enableWidget');
                } else {
                    this.fixedWidget('disableWidget');
                }
            }

            // If a string command was passed, execute it and stop further processing.
            // This is a guard for calls like `$(...).fixedWidget('destroyWidget')`.
            if (typeof opts === 'string') {
                var command = opts;
                var pluginCommands = _managePluginData(this, 'fixedWidget').commands;
                if (pluginCommands && typeof pluginCommands[command] === 'function') {
                    pluginCommands[command].apply(this);
                }
                return this;
            }

            // Main plugin execution for each selected element
            return this.each(function() {

                var currentElement = jQueryAlias(this),
                    pluginSettings = _managePluginData(currentElement, 'fixedWidget');

                // Helper to create or find the wrapper element.
                var elementWrapper = (function() {
                    var existingWrapper = currentElement.parent('.' + pluginSettings.containerClass);
                    if (existingWrapper.length > 0) {
                        // Wrapper already exists, update its dimensions
                        var elemOuterHeight = currentElement.outerHeight(true);
                        existingWrapper.css({
                            'height': elemOuterHeight,
                            'width': (function() {
                                // Determine wrapper width based on original element's width style.
                                // If percentage or auto, adjust the element's width and set wrapper's width to match.
                                var wrapperWidthStyle = existingWrapper.getComputedStyleValues('width');
                                if (wrapperWidthStyle.indexOf('%') >= 0 || wrapperWidthStyle === 'auto') {
                                    // Account for box-sizing when setting element width
                                    if (currentElement.css('box-sizing') === 'border-box' || currentElement.css('-moz-box-sizing') === 'border-box') {
                                        currentElement.css('width', existingWrapper.width());
                                    } else {
                                        currentElement.css('width', existingWrapper.width() - (parseInt(currentElement.css('padding-left'), 10) + parseInt(currentElement.css('padding-right'), 10)));
                                    }
                                    return wrapperWidthStyle;
                                } else {
                                    return currentElement.outerWidth(true);
                                }
                            })()
                        });
                        return existingWrapper;
                    } else {
                        // Wrapper does not exist, create a new one.
                        var elementInitialStyles = currentElement.getComputedStyleValues(['width', 'margin-left', 'left', 'right', 'top', 'bottom', 'float', 'display']);
                        var currentDisplayType = currentElement.css('display');

                        var newWrapper = jQueryAlias('<div>', {
                            'class': pluginSettings.containerClass
                        }).css({
                            'display': currentDisplayType,
                            'height': currentElement.outerHeight(true),
                            'width': (function() {
                                if (elementInitialStyles['width'].indexOf('%') >= 0 || (elementInitialStyles['width'] === 'auto' && currentDisplayType !== 'inline-block' && currentDisplayType !== 'inline')) {
                                    currentElement.css('width', parseFloat(currentElement.css('width'))); // Set explicit width
                                    return elementInitialStyles['width'];
                                } else if (elementInitialStyles['width'] === 'auto' && (currentDisplayType === 'inline-block' || currentDisplayType === 'inline')) {
                                    return currentElement.width();
                                } else {
                                    return (elementInitialStyles['margin-left'] === 'auto') ? currentElement.outerWidth() : currentElement.outerWidth(true);
                                }
                            })(),
                            'margin': (elementInitialStyles['margin-left'] === 'auto') ? 'auto' : null, // Only set margin if it was 'auto'
                            'position': (function() {
                                var currentPosition = currentElement.css('position');
                                return currentPosition === 'static' ? 'relative' : currentPosition;
                            })(),
                            'float': elementInitialStyles['float'] || null,
                            'left': elementInitialStyles['left'],
                            'right': elementInitialStyles['right'],
                            'top': elementInitialStyles['top'],
                            'bottom': elementInitialStyles['bottom'],
                            'vertical-align': 'top'
                        });

                        currentElement.wrap(newWrapper);

                        // IE7 inline-block rendering fix (if applicable)
                        if (legacyBrowser === 7) {
                            if (jQueryAlias('head').find('style#fixedwidget-ie-fix').length === 0) {
                                jQueryAlias('<style id="fixedwidget-ie-fix">.' + pluginSettings.containerClass + ' {zoom: 1;}</style>').appendTo('head');
                            }
                        }

                        return currentElement.parent(); // Return the newly created wrapper
                    }
                })();


                // If already initialized, skip further setup for this element.
                if (currentElement.data('fixedWidgetInitialized')) {
                    return;
                }
                currentElement.data('fixedWidgetInitialized', true); // Mark as initialized.


                // Determine the effective container for boundary calculations.
                var isTargetDocument = pluginSettings.attachToTarget && (pluginSettings.attachToTarget === 'document' || (pluginSettings.attachToTarget.nodeType && pluginSettings.attachToTarget.nodeType === 9) || (typeof pluginSettings.attachToTarget === 'object' && pluginSettings.attachToTarget instanceof (typeof HTMLDocument !== 'undefined' ? HTMLDocument : Document)));
                var boundaryContainer = pluginSettings.attachToTarget ? (isTargetDocument ? currentDocument : (typeof pluginSettings.attachToTarget === 'string' ? jQueryAlias(pluginSettings.attachToTarget) : pluginSettings.attachToTarget)) : elementWrapper.parent();

                // Clear any pre-existing positioning on the element before applying sticky logic.
                currentElement.css({
                    top: 'auto',
                    bottom: 'auto',
                    left: 'auto',
                    right: 'auto'
                });

                // Re-evaluate heights after page load to account for images/dynamic content.
                currentWindow.on('load', function() {
                    if (currentElement.outerHeight(true) > boundaryContainer.height()) {
                        elementWrapper.css('height', currentElement.outerHeight(true));
                        currentElement.fixedWidget('reinitialize');
                    }
                });

                // Internal helpers for applying/removing fixed positioning.
                var applyFixedState = function(styleProps) {
                        // Only apply if not already in fixed state with the active class.
                        if (currentElement.hasClass(pluginSettings.activeClass)) {
                            return;
                        }

                        styleProps = styleProps || {};
                        currentElement.css({
                            position: 'fixed',
                            top: styleProps.top || 0,
                            left: styleProps.left || elementWrapper.offset().left
                        }).addClass(pluginSettings.activeClass);

                        // Trigger the custom onActivation callback.
                        pluginSettings.onActivation.apply(currentElement[0]);
                        elementWrapper.addClass('fixed-active-wrapper'); // Add class to wrapper
                    },
                    resetFixedState = function(styleProps) {
                        styleProps = styleProps || {};
                        // Default to absolute position if not specified.
                        styleProps.position = styleProps.position || 'absolute';
                        styleProps.top = styleProps.top || 0;
                        styleProps.left = styleProps.left || 0;

                        // Only reset if current state is different to avoid unnecessary DOM writes.
                        if (currentElement.css('position') !== 'fixed' && parseInt(currentElement.css('top'), 10) === styleProps.top) {
                            return;
                        }

                        currentElement.css({
                            position: styleProps.position,
                            top: styleProps.top,
                            left: styleProps.left
                        }).removeClass(pluginSettings.activeClass);

                        // Trigger the custom onDeactivation callback.
                        pluginSettings.onDeactivation.apply(currentElement[0]);
                        elementWrapper.removeClass('fixed-active-wrapper'); // Remove class from wrapper
                    };

                // The main scroll event handler logic.
                var handleScrollEvent = function(initialCall) {

                    // Pre-checks: If disabled or element is hidden, do nothing.
                    if (!pluginSettings.enabled || !currentElement.is(':visible')) {
                        return;
                    }

                    // If the element is taller than its container, it cannot be 'fixed' effectively.
                    // Revert to non-fixed state.
                    if (currentElement.outerHeight(true) >= boundaryContainer.height()) {
                        resetFixedState();
                        return;
                    }

                    // --- Calculate key positions and dimensions ---
                    var internalTopMargin = (pluginSettings.innerElementForScroll) ? jQueryAlias(pluginSettings.innerElementForScroll).position().top : (pluginSettings.innerScrollTop || 0),
                        wrapperTopDocumentPosition = elementWrapper.offset().top,
                        containerBottomBoundary = boundaryContainer.height() - pluginSettings.endBoundaryOffset + (isTargetDocument ? 0 : wrapperTopDocumentPosition),
                        containerTopBoundary = elementWrapper.offset().top - pluginSettings.topOffset + internalTopMargin,
                        elementTotalHeight = currentElement.outerHeight(true) + pluginSettings.bottomOffset,
                        viewportHeight = currentWindow.height(),
                        currentScrollPosition = currentWindow.scrollTop(),
                        elementDocTop = currentElement.offset().top,
                        elementViewportTop = elementDocTop - currentScrollPosition,
                        remainingBottomDistance; // New helper variable

                    // Handle re-enabling the widget, waiting for it to reach an appropriate position.
                    if (pluginSettings.restorePoint && pluginSettings.restorePoint.initialScrollPosition !== missingVal) {
                        var targetFixedPosition = elementDocTop - pluginSettings.topOffset - internalTopMargin;

                        if (elementTotalHeight - internalTopMargin > viewportHeight && pluginSettings.followScrollMovement) {
                            // Element is larger than viewport and followScroll is active.
                            // If currently within the viewport, disable restore point and let main logic take over.
                            if (targetFixedPosition < currentScrollPosition && currentScrollPosition + viewportHeight <= targetFixedPosition + currentElement.height()) {
                                pluginSettings.restorePoint = missingVal;
                            }

                        } else {
                            // Element is smaller than viewport OR followScroll is off.
                            if (pluginSettings.restorePoint.initialScrollPosition > targetFixedPosition) {
                                // Scrolling up scenario
                                if (currentScrollPosition <= targetFixedPosition) {
                                    applyFixedState({ top: pluginSettings.topOffset - internalTopMargin });
                                    pluginSettings.restorePoint = missingVal;
                                }
                            } else {
                                // Scrolling down scenario
                                if (currentScrollPosition >= targetFixedPosition) {
                                    applyFixedState({ top: pluginSettings.topOffset - internalTopMargin });
                                    pluginSettings.restorePoint = missingVal;
                                }
                            }
                        }
                        return; // Exit early if in restore point mode.
                    }

                    // --- Main sticky logic ---
                    if (currentScrollPosition > containerTopBoundary) {
                        // Element has scrolled past its initial position.
                        // Check if it should hit the bottom boundary of its container.
                        var effectiveBottomLimit = containerBottomBoundary + pluginSettings.bottomOffset - (pluginSettings.followScrollMovement && viewportHeight < elementTotalHeight ? 0 : pluginSettings.topOffset);
                        var scrollAdjustedBottom = currentScrollPosition + elementTotalHeight - internalTopMargin;
                        var followScrollAdjustment = (elementTotalHeight - internalTopMargin > viewportHeight - (containerTopBoundary - internalTopMargin) && pluginSettings.followScrollMovement) ? (((remainingBottomDistance = elementTotalHeight - viewportHeight - internalTopMargin) > 0) ? remainingBottomDistance : 0) : 0;

                        if (effectiveBottomLimit <= scrollAdjustedBottom - followScrollAdjustment) {
                            // Bottom boundary reached, position absolutely at the bottom of the container.
                            resetFixedState({
                                top: containerBottomBoundary - elementTotalHeight + pluginSettings.bottomOffset - wrapperTopDocumentPosition
                            });
                        } else if (elementTotalHeight - internalTopMargin > viewportHeight && pluginSettings.followScrollMovement) {
                            // Element is taller than viewport and followScroll is enabled.
                            if (elementViewportTop + elementTotalHeight <= viewportHeight) {
                                // Element bottom has hit viewport bottom while scrolling down.
                                if (trackPageScroll.direction === 'down') {
                                    applyFixedState({
                                        top: viewportHeight - elementTotalHeight
                                    });
                                } else {
                                    // Scrolling up, if currently fixed and top is off-screen.
                                    if (elementViewportTop < 0 && currentElement.css('position') === 'fixed') {
                                        resetFixedState({
                                            top: elementDocTop - (containerTopBoundary + pluginSettings.topOffset - internalTopMargin) - trackPageScroll.deltaY
                                        });
                                    }
                                }
                            } else {
                                // Element is partially visible, but not fully in viewport.
                                if (trackPageScroll.direction === 'up' && elementDocTop >= currentScrollPosition + pluginSettings.topOffset - internalTopMargin) {
                                    // Scrolling up and element's top is at or below the fixed top.
                                    applyFixedState({
                                        top: pluginSettings.topOffset - internalTopMargin
                                    });
                                } else if (trackPageScroll.direction === 'down' && elementDocTop + elementTotalHeight > viewportHeight && currentElement.css('position') === 'fixed') {
                                    // Scrolling down, element bottom is past viewport, and it's currently fixed.
                                    resetFixedState({
                                        top: elementDocTop - (containerTopBoundary + pluginSettings.topOffset - internalTopMargin) - trackPageScroll.deltaY
                                    });
                                }
                            }
                        } else {
                            // Standard fixed position at the top.
                            applyFixedState({
                                top: pluginSettings.topOffset - internalTopMargin
                            });
                        }
                    } else {
                        // Element is above its initial scroll position, reset to non-fixed.
                        resetFixedState();
                    }
                };


                // Store event handlers for later removal in `destroyWidget`.
                pluginSettings.internalFn = pluginSettings.internalFn || {};
                pluginSettings.internalFn.handleScroll = handleScrollEvent; // Store a direct reference

                // Helper to manage scroll event attachment based on responsive settings.
                var attachScrollHandlers = function() {
                    if (pluginSettings.responsiveBehavior) {
                        // If responsive is enabled, ensure scroll handler is active.
                        currentWindow.on('scroll', pluginSettings.internalFn.handleScroll);
                    } else {
                        // If not responsive, remove scroll handler if it exists.
                        currentWindow.off('scroll', pluginSettings.internalFn.handleScroll);
                    }
                };

                // Helper to check and apply disabled breakpoints.
                var checkDisabledBreakpoints = function() {
                    if (!pluginSettings.disabledBreakpoints || !Array.isArray(pluginSettings.disabledBreakpoints)) {
                        return; // No breakpoints defined or invalid format.
                    }

                    var currentWidth = currentWindow.width();
                    var shouldDisable = false;

                    // Example format for disabledBreakpoints: [{ from: 0, to: 768 }, { from: 1024 }]
                    jQueryAlias.each(pluginSettings.disabledBreakpoints, function(idx, breakpoint) {
                        var from = breakpoint.from || 0;
                        var to = breakpoint.to || Infinity;

                        if (currentWidth >= from && currentWidth <= to) {
                            shouldDisable = true;
                            return false; // Break $.each loop
                        }
                    });

                    // Apply or remove disable state based on breakpoint check.
                    if (shouldDisable && pluginSettings.enabled) {
                        currentElement.fixedWidget('disableWidget');
                    } else if (!shouldDisable && !pluginSettings.enabled) {
                        // Only re-enable if it was previously disabled by a breakpoint AND it's now outside a disabled breakpoint.
                        // This assumes 'disableWidget' was called due to a breakpoint.
                        currentElement.fixedWidget('enableWidget');
                    }
                };

                // The main resize event handler logic.
                pluginSettings.internalFn.handleResize = function() {
                    // Check if sticky is attached to scroll event
                    attachScrollHandlers();
                    // Check for off resolutions
                    checkDisabledBreakpoints();

                    // If plugin is disabled, do nothing further.
                    if (!pluginSettings.enabled) {
                        return;
                    }

                    var updateElementPosition = function() { // New helper for position update
                        // Recalculate original left position of the element within its wrapper.
                        // This is crucial for fixed elements that need to maintain their horizontal position.
                        currentElement.css({
                            left: elementWrapper.offset().left
                        });
                    };

                    // Re-evaluate scroll state after resize.
                    handleScrollEvent(true);
                    updateElementPosition();
                };


                // Initial checks for responsive and breakpoints.
                attachScrollHandlers();
                checkDisabledBreakpoints();

                // Add resize event listener (scroll listener is managed by attachScrollHandlers)
                currentWindow.on('resize', pluginSettings.internalFn.handleResize);

                // Initial call to set up the sticky state.
                handleScrollEvent(true);

            }); // End each()
        } // End fixedWidget function
    }); // End jQueryAlias.fn.extend

})(jQuery, window); // Pass jQuery and window to the IIFE