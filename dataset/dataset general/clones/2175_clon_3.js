/*!
 * Custom Overlay & Notification Module
 * Derived from jQuery blockUI plugin, heavily modified.
 * Version 1.0.0-alpha
 * @requires jQuery v1.7 or later
 *
 * This version includes structural and stylistic changes.
 *
 * (c) 2023 Your Name/Company
 * Licensed under MIT.
 */

;(function(globalScope, $lib) {
"use strict";

    // --- Internal Utility Functions ---

    // Retrieves a numeric style value, ensuring it's an integer.
    function getNumericStyleValue(domElement, styleAttribute) {
        if (!domElement || !styleAttribute) {
            return 0;
        }
        let parsedValue = parseInt($lib.css(domElement, styleAttribute), 10);
        return isNaN(parsedValue) ? 0 : parsedValue;
    }

    // Checks if the target element represents the global window or document body.
    function isGlobalTarget(targetNode) {
        return targetNode && (targetNode === globalScope || targetNode === globalScope.document.body);
    }

    // Centers a jQuery element within its parent container.
    function positionElementCenter(elementToCenter, centerHorizontally, centerVertically) {
        let $element = $lib(elementToCenter);
        if (!$element.length) {
            return;
        }

        let $parent = $element.parent();
        let parentDimension = { width: $parent.outerWidth(), height: $parent.outerHeight() };
        let elementDimension = { width: $element.outerWidth(), height: $element.outerHeight() };

        if (centerHorizontally) {
            $element.css('left', Math.max(0, (parentDimension.width - elementDimension.width) / 2) + 'px');
        }
        if (centerVertically) {
            $element.css('top', Math.max(0, (parentDimension.height - elementDimension.height) / 2) + 'px');
        }
    }

    // Attempts to set focus on the first focusable element within a specified container.
    function setInitialFocus(containerElement, focusableSelector) {
        if (!containerElement || !focusableSelector) {
            return;
        }
        let $focusableItems = $lib(focusableSelector, containerElement);
        if ($focusableItems.length) {
            $focusableItems[0].focus();
        }
    }

    // Manages event binding/unbinding for the blocking layers.
    let activeEventBindings = []; // Stores references to bound events for cleanup.

    function manageInteractionEvents(activate, targetElement, interactionConfig) {
        let $body = $lib('body');
        let overlayLayerData = $lib(targetElement).data('overlayLayerReferences');

        function handleTabNavigation(event) {
            if (interactionConfig.restrictTabNavigation && event.keyCode === 9) { // Tab key
                let $focusableElements = $lib(interactionConfig.interactiveElementsSelector, overlayLayerData.messageLayer);
                let firstElement = $focusableElements[0], lastElement = $focusableElements[$focusableElements.length - 1];

                if (event.target === lastElement && !event.shiftKey) {
                    firstElement.focus();
                    event.preventDefault();
                } else if (event.target === firstElement && event.shiftKey) {
                    lastElement.focus();
                    event.preventDefault();
                }
            }
        }

        if (activate) {
            if (interactionConfig.captureEvents && overlayLayerData) {
                // Prevent event propagation from overlay layers
                overlayLayerData.overlayLayer.bind('mousedown mouseup keydown', (e) => e.stopPropagation());
                overlayLayerData.messageLayer.bind('contextmenu', (e) => e.preventDefault()); // Disable right-click

                if (interactionConfig.restrictTabNavigation) {
                    $body.bind('keydown.overlayNav', handleTabNavigation);
                    activeEventBindings.push({
                        target: $body,
                        event: 'keydown.overlayNav',
                        handler: handleTabNavigation
                    });
                }

                if (interactionConfig.onBackdropClick) {
                    overlayLayerData.overlayLayer.on('click', interactionConfig.onBackdropClick);
                }
            }
        } else {
            // Deactivate: Unbind events
            if (interactionConfig.captureEvents && overlayLayerData) {
                overlayLayerData.overlayLayer.unbind('mousedown mouseup keydown');
                overlayLayerData.messageLayer.unbind('contextmenu');

                // Remove specific keydown handler using stored references
                activeEventBindings = activeEventBindings.filter(binding => {
                    if (binding.event === 'keydown.overlayNav') {
                        binding.target.unbind(binding.event, binding.handler);
                        return false;
                    }
                    return true;
                });

                if (interactionConfig.onBackdropClick) {
                    overlayLayerData.overlayLayer.off('click');
                }
            }
        }
    }

    // Cleans up the overlay layers and restores the target element's state.
    function cleanupLayers(allLayers, historicalData, releaseConfig, targetElement) {
        let $target = $lib(targetElement);
        $target.removeData('overlayLayerReferences'); // Remove custom data reference

        // Restore original content if it was temporarily moved
        if (historicalData && historicalData.contentNode && historicalData.originalParent) {
            $lib(historicalData.originalParent).append(historicalData.contentNode);
            $lib(historicalData.contentNode).css({
                display: historicalData.originalDisplay,
                position: historicalData.originalPosition
            });
        }

        // Remove the overlay layers from the DOM
        allLayers.remove();

        // Restore body height if it was modified for IE6 quirks mode
        if (browserDetect.isIE6Legacy && releaseConfig.stretchBody) {
            $lib('html,body').css('height', '');
        }

        // Execute the onCoverReleased callback
        if (releaseConfig.onCoverReleased && typeof releaseConfig.onCoverReleased === 'function') {
            releaseConfig.onCoverReleased(targetElement, releaseConfig);
        }
    }

    // --- Main Plugin Initialization ---

    function initializeOverlayPlugin($context) {
        // Alias original jQuery methods to prevent recursive calls if they are overridden globally
        $context.fn.originalFadeIn = $context.fn.fadeIn;
        $context.fn.originalFadeOut = $context.fn.fadeOut;

        const emptyFunction = () => {}; // A no-operation function

        // Detailed browser detection for legacy IE compatibility
        const userAgentInfo = navigator.userAgent || '';
        const browserDetect = {
            isLegacyIE: /MSIE/.test(userAgentInfo),
            isIE6Legacy: /MSIE 6.0/.test(userAgentInfo) && !/MSIE 8.0/.test(userAgentInfo),
            documentCompatibilityMode: document.documentMode || 0,
            canSetExpression: $context.isFunction(document.createElement('div').style.setExpression)
        };

        // Global methods for full-page blocking/unblocking
        $context.applyPageOverlay = function(options) { applyContentOverlay(globalScope, options); };
        $context.releasePageOverlay = function(options) { clearContentOverlay(globalScope, options); };

        // Convenience method for "growl"-like toast notifications
        $context.displayToastNotification = function(headerText, bodyMessage, displayDurationMs, onDismiss) {
            let $notificationPanel = $context('<div class="growlNotification"></div>');
            if (headerText) $notificationPanel.append(`<h3>${headerText}</h3>`);
            if (bodyMessage) $notificationPanel.append(`<p>${bodyMessage}</p>`);
            displayDurationMs = (displayDurationMs === undefined || displayDurationMs === null) ? 3000 : displayDurationMs;

            const triggerOverlay = function(customOptions) {
                let currentOptions = $context.extend({}, customOptions || {});

                $context.applyPageOverlay({
                    contentHTML: $notificationPanel,
                    animationInDuration: typeof currentOptions.animationInDuration !== 'undefined' ? currentOptions.animationInDuration : 700,
                    animationOutDuration: typeof currentOptions.animationOutDuration !== 'undefined' ? currentOptions.animationOutDuration : 1000,
                    autoReleaseDelay: typeof currentOptions.autoReleaseDelay !== 'undefined' ? currentOptions.autoReleaseDelay : displayDurationMs,
                    centerVertically: false,
                    displayBackdrop: false,
                    onCoverReleased: onDismiss,
                    contentStyles: $context.applyPageOverlay.configuration.toastStyles
                });
            };

            triggerOverlay(); // Initial display of the toast
            // Store initial opacity, though it's not strictly used later in this refactor
            // let initialOpacity = $notificationPanel.css('opacity');

            $notificationPanel.on('mouseover', function() {
                triggerOverlay({
                    animationInDuration: 0,
                    autoReleaseDelay: 30000 // Extend duration significantly on hover
                });
                let $activeMessageBlock = $context('.coverMsg');
                $activeMessageBlock.stop(true, true).fadeTo(300, 1); // Stop ongoing fadeOut, set full opacity
            }).on('mouseout', function() {
                $context('.coverMsg').originalFadeOut(1000); // Resume fadeOut after mouse leaves
            });
        };

        // Plugin method for blocking content of specific elements
        $context.fn.overlayContent = function(options) {
            if (isGlobalTarget(this[0])) {
                $context.applyPageOverlay(options);
                return this;
            }

            let combinedConfiguration = $context.extend({}, $context.applyPageOverlay.configuration, options || {});
            this.each(function() {
                let $currentElement = $context(this);
                if (combinedConfiguration.skipIfAlreadyCovered && $currentElement.data('overlayStatus.isActive')) {
                    return; // Guard: Skip if already covered and option enabled
                }
                $currentElement.releaseContent({ animationOutDuration: 0 }); // Ensure clean slate
            });

            return this.each(function() {
                // For absolute overlay layers, the parent must have a non-static position
                if ($context.css(this, 'position') === 'static') {
                    this.style.position = 'relative';
                    $context(this).data('overlayStatus.originalStatic', true);
                }
                this.style.zoom = 1; // Force 'hasLayout' for IE for proper rendering
                applyContentOverlay(this, options);
            });
        };

        // Plugin method for unblocking element content
        $context.fn.releaseContent = function(options) {
            if (isGlobalTarget(this[0])) {
                $context.releasePageOverlay(options);
                return this;
            }
            return this.each(function() {
                clearContentOverlay(this, options);
            });
        };

        // Current version of the overlay module
        $context.applyPageOverlay.moduleVersion = '1.0.0-alpha';

        // Default configuration options, can be overridden globally via $context.applyPageOverlay.configuration
        $context.applyPageOverlay.configuration = {
            contentHTML: '<h1>Processing...</h1>', // Default message displayed
            headerText: null, // Optional title string for themed overlays
            isDraggable: true, // Only if theme is true and jQuery UI Draggable is loaded
            useTheme: false, // Set to true to integrate with jQuery UI themes

            contentStyles: { // CSS styles for the message content container
                padding:    0,
                margin:     0,
                width:      '30%',
                top:        '40%',
                left:       '35%',
                textAlign:  'center',
                color:      '#000',
                border:     '3px solid #aaa',
                backgroundColor:'#fff',
                cursor:     'wait'
            },

            themedContentStyles: { // Minimal styles when jQuery UI themes are active
                width:  '30%',
                top:    '40%',
                left:   '35%'
            },

            backdropStyles:  { // Styles for the overlay background layer
                backgroundColor:    '#000',
                opacity:            0.6,
                cursor:             'wait'
            },

            defaultCursor: 'default', // Cursor to reset to after overlay is removed

            toastStyles: { // Specific styles for growl-like notifications
                width:      '350px',
                top:        '10px',
                left:       '',
                right:      '10px',
                border:     'none',
                padding:    '5px',
                opacity:    0.6,
                cursor:     'default',
                color:      '#fff',
                backgroundColor: '#000',
                '-webkit-border-radius':'10px',
                '-moz-border-radius':   '10px',
                'border-radius':        '10px'
            },

            // Iframe source, primarily for IE to prevent content bleed-through
            frameSource: /^https/i.test(globalScope.location.href || '') ? 'javascript:false' : 'about:blank',
            alwaysUseIframe: false, // Force iframe usage even in non-IE browsers

            baseZIndex: 1000, // Starting Z-index for overlay layers

            centerHorizontally: true, // Automatically center message horizontally
            centerVertically: true, // Automatically center message vertically

            stretchBody: true, // Allow body height adjustment in IE6
            captureEvents: true, // Disable mouse and keyboard events on blocked content
            restrictTabNavigation: true, // Keep tab focus within the overlay

            animationInDuration: 200, // Duration for fade-in animation (ms)
            animationOutDuration: 400, // Duration for fade-out animation (ms)
            autoReleaseDelay: 0, // Time in ms before auto-unblocking (0 disables)

            displayBackdrop: true, // Whether to show the semi-transparent overlay
            focusFirstInput: true, // Attempt to focus on the first input field
            interactiveElementsSelector: ':input:enabled:visible', // Selector for focusable elements

            onCoverApplied: null, // Callback after overlay is fully visible
            onCoverReleased: null, // Callback after overlay is removed (args: element, options)
            onBackdropClick: null, // Callback when the overlay background is clicked

            quirksModeAdjust: 4, // Offset adjustment for IE quirks mode

            coverMessageClass: 'coverMsg', // CSS class for the message block
            skipIfAlreadyCovered: false // If true, new overlay requests are ignored if already active
        };

        // Private variables to maintain state for global (page-level) overlays
        let pageGlobalCoverElement = null; // Reference to the message layer for page block
        let pageGlobalFocusableElements = []; // Focusable elements within the page block

        // Core function to apply the blocking overlay to an element or the page.
        function applyContentOverlay(targetElement, overlayOptions) {
            let isPageLevel = isGlobalTarget(targetElement);
            let messageContent = (overlayOptions && overlayOptions.contentHTML !== undefined ? overlayOptions.contentHTML : undefined);
            let effectiveConfig = $context.extend({}, $context.applyPageOverlay.configuration, overlayOptions || {});

            if (effectiveConfig.skipIfAlreadyCovered && $context(targetElement).data('overlayStatus.isActive')) {
                return; // Guard: Do not re-apply if already active and option set
            }

            // Merge styles, giving precedence to passed options
            effectiveConfig.backdropStyles = $context.extend({}, $context.applyPageOverlay.configuration.backdropStyles, effectiveConfig.backdropStyles || {});
            effectiveConfig.contentStyles = $context.extend({}, $context.applyPageOverlay.configuration.contentStyles, effectiveConfig.contentStyles || {});
            if (effectiveConfig.onBackdropClick) {
                effectiveConfig.backdropStyles.cursor = 'pointer';
            }
            effectiveConfig.themedContentStyles = $context.extend({}, $context.applyPageOverlay.configuration.themedContentStyles, effectiveConfig.themedContentStyles || {});

            messageContent = messageContent === undefined ? effectiveConfig.contentHTML : messageContent;

            // If a global block is already present, remove it first (with no fade)
            if (isPageLevel && pageGlobalCoverElement) {
                clearContentOverlay(globalScope, { animationOutDuration: 0 });
            }

            // Capture original DOM state if the content is an existing DOM element
            let historicalData = null;
            if (messageContent && typeof messageContent !== 'string' && (messageContent.parentNode || messageContent.jquery)) {
                let contentNode = messageContent.jquery ? messageContent[0] : messageContent;
                historicalData = {
                    contentNode: contentNode,
                    originalParent: contentNode.parentNode,
                    originalDisplay: contentNode.style.display,
                    originalPosition: contentNode.style.position
                };
                $context(targetElement).data('overlayStatus.history', historicalData);
                if (historicalData.originalParent) {
                    historicalData.originalParent.removeChild(contentNode);
                }
            }

            $context(targetElement).data('overlayStatus.onReleaseCallback', effectiveConfig.onCoverReleased);
            let currentZIndex = effectiveConfig.baseZIndex;

            // Construct the three blocking layers: iframe, backdrop, message container
            let $iframeLayer, $backdropLayer, $messageLayer;

            // Iframe layer for IE z-index issues (prevents select boxes / applets from bleeding through)
            if (browserDetect.isLegacyIE || effectiveConfig.alwaysUseIframe) {
                $iframeLayer = $context(`<iframe class="blockingIframe" style="z-index:${currentZIndex++};display:none;border:none;margin:0;padding:0;position:absolute;width:100%;height:100%;top:0;left:0" src="${effectiveConfig.frameSource}"></iframe>`);
            } else {
                $iframeLayer = $context('<div class="blockingIframe" style="display:none"></div>'); // Non-IE placeholder
            }

            // Backdrop layer (the semi-transparent background)
            if (effectiveConfig.useTheme) {
                $backdropLayer = $context(`<div class="blockingBackdrop ui-widget-overlay" style="z-index:${currentZIndex++};display:none"></div>`);
            } else {
                $backdropLayer = $context(`<div class="blockingBackdrop" style="z-index:${currentZIndex++};display:none;border:none;margin:0;padding:0;width:100%;height:100%;top:0;left:0"></div>`);
            }

            // Message layer (the container for the actual content)
            let messageLayerHtmlString;
            if (effectiveConfig.useTheme && isPageLevel) {
                messageLayerHtmlString = `<div class="contentOverlay ${effectiveConfig.coverMessageClass} pageOverlay ui-dialog ui-widget ui-corner-all" style="z-index:${currentZIndex+10};display:none;position:fixed">`;
                if (effectiveConfig.headerText) {
                    messageLayerHtmlString += `<div class="ui-widget-header ui-dialog-titlebar ui-corner-all overlayHeader">${effectiveConfig.headerText || '&nbsp;'}</div>`;
                }
                messageLayerHtmlString += '<div class="ui-widget-content ui-dialog-content"></div>';
                messageLayerHtmlString += '</div>';
            } else if (effectiveConfig.useTheme) {
                messageLayerHtmlString = `<div class="contentOverlay ${effectiveConfig.coverMessageClass} elementOverlay ui-dialog ui-widget ui-corner-all" style="z-index:${currentZIndex+10};display:none;position:absolute">`;
                if (effectiveConfig.headerText) {
                    messageLayerHtmlString += `<div class="ui-widget-header ui-dialog-titlebar ui-corner-all overlayHeader">${effectiveConfig.headerText || '&nbsp;'}</div>`;
                }
                messageLayerHtmlString += '<div class="ui-widget-content ui-dialog-content"></div>';
                messageLayerHtmlString += '</div>';
            } else if (isPageLevel) {
                messageLayerHtmlString = `<div class="contentOverlay ${effectiveConfig.coverMessageClass} pageOverlay" style="z-index:${currentZIndex+10};display:none;position:fixed"></div>`;
            } else {
                messageLayerHtmlString = `<div class="contentOverlay ${effectiveConfig.coverMessageClass} elementOverlay" style="z-index:${currentZIndex+10};display:none;position:absolute"></div>`;
            }
            $messageLayer = $context(messageLayerHtmlString);

            // Apply styles based on theme or custom CSS
            if (messageContent) {
                if (effectiveConfig.useTheme) {
                    $messageLayer.css(effectiveConfig.themedContentStyles);
                    $messageLayer.addClass('ui-widget-content');
                } else {
                    $messageLayer.css(effectiveConfig.contentStyles);
                }
            }
            if (!effectiveConfig.useTheme) {
                $backdropLayer.css(effectiveConfig.backdropStyles);
            }
            $backdropLayer.css('position', isPageLevel ? 'fixed' : 'absolute');

            // Make iframe layer fully transparent in IE
            if ((browserDetect.isLegacyIE || effectiveConfig.alwaysUseIframe) && $iframeLayer) {
                $iframeLayer.css('opacity', 0.0);
            }

            // Append all layers to the appropriate parent
            let $parentContainer = isPageLevel ? $context('body') : $context(targetElement);
            let allOverlayLayers = [$iframeLayer, $backdropLayer, $messageLayer];
            allOverlayLayers.forEach($layer => $layer.appendTo($parentContainer));

            // Enable draggable functionality for themed message layers if jQuery UI Draggable is available
            if (effectiveConfig.useTheme && effectiveConfig.isDraggable && $context.fn.draggable) {
                $messageLayer.draggable({
                    handle: '.ui-dialog-titlebar',
                    cancel: 'li'
                });
            }

            // IE6/7 compatibility: Use CSS expressions for dynamic positioning/sizing
            let needsLegacyExpressionFix = browserDetect.canSetExpression && (!$context.support.boxModel || $context('object,embed', isPageLevel ? null : targetElement).length > 0);
            if (browserDetect.isIE6Legacy || needsLegacyExpressionFix) {
                if (isPageLevel && effectiveConfig.stretchBody && $context.support.boxModel) {
                    $context('html,body').css('height', '100%');
                }

                let adjustedTopOffset = 0, adjustedLeftOffset = 0;
                if ((browserDetect.isIE6Legacy || !$context.support.boxModel) && !isPageLevel) {
                    let borderTopWidth = getNumericStyleValue(targetElement, 'borderTopWidth');
                    let borderLeftWidth = getNumericStyleValue(targetElement, 'borderLeftWidth');
                    adjustedTopOffset = borderTopWidth ? `(0 - ${borderTopWidth})` : 0;
                    adjustedLeftOffset = borderLeftWidth ? `(0 - ${borderLeftWidth})` : 0;
                }

                allOverlayLayers.forEach(($layer, index) => {
                    let layerStyle = $layer[0].style;
                    layerStyle.position = 'absolute';
                    if (index < 2) { // Iframe and backdrop layers
                        if (isPageLevel) {
                            layerStyle.setExpression('height', 'Math.max(document.body.scrollHeight, document.body.offsetHeight) - (jQuery.support.boxModel?0:' + effectiveConfig.quirksModeAdjust + ') + "px"');
                        } else {
                            layerStyle.setExpression('height', 'this.parentNode.offsetHeight + "px"');
                        }
                        if (isPageLevel) {
                            layerStyle.setExpression('width', 'jQuery.support.boxModel && document.documentElement.clientWidth || document.body.clientWidth + "px"');
                        } else {
                            layerStyle.setExpression('width', 'this.parentNode.offsetWidth + "px"');
                        }
                        if (adjustedLeftOffset) layerStyle.setExpression('left', adjustedLeftOffset);
                        if (adjustedTopOffset) layerStyle.setExpression('top', adjustedTopOffset);
                    } else if (effectiveConfig.centerVertically) { // Message layer vertical centering
                        if (isPageLevel) layerStyle.setExpression('top', '(document.documentElement.clientHeight || document.body.clientHeight) / 2 - (this.offsetHeight / 2) + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "px"');
                        layerStyle.marginTop = 0;
                    } else if (!effectiveConfig.centerVertically && isPageLevel) { // Message layer fixed top
                        let topCssValue = (effectiveConfig.contentStyles && effectiveConfig.contentStyles.top) ? parseInt(effectiveConfig.contentStyles.top, 10) : 0;
                        let topExpression = `((document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + ${topCssValue}) + "px"`;
                        layerStyle.setExpression('top', topExpression);
                    }
                });
            }

            // Insert content into message layer and ensure it's visible
            if (messageContent) {
                if (effectiveConfig.useTheme) {
                    $messageLayer.find('.ui-widget-content').append(messageContent);
                } else {
                    $messageLayer.append(messageContent);
                }
                $context(messageContent).show();
            }

            // Store references to layers and mark element as active
            $context(targetElement).data('overlayLayerReferences', {
                iframeLayer: $iframeLayer,
                overlayLayer: $backdropLayer,
                messageLayer: $messageLayer
            });
            $context(targetElement).data('overlayStatus.isActive', true);

            // Handle fade-in animation
            if (effectiveConfig.animationInDuration > 0) {
                let onBlockCallback = effectiveConfig.onCoverApplied || emptyFunction;
                let overlayFadeComplete = (effectiveConfig.displayBackdrop && !messageContent) ? onBlockCallback : emptyFunction;
                let messageFadeComplete = messageContent ? onBlockCallback : emptyFunction;

                if (effectiveConfig.displayBackdrop) {
                    $iframeLayer.originalFadeIn(effectiveConfig.animationInDuration);
                    $backdropLayer.originalFadeIn(effectiveConfig.animationInDuration, overlayFadeComplete);
                }
                if (messageContent) {
                    $messageLayer.originalFadeIn(effectiveConfig.animationInDuration, messageFadeComplete);
                }
            } else {
                if (effectiveConfig.displayBackdrop) {
                    $iframeLayer.show();
                    $backdropLayer.show();
                }
                if (messageContent) {
                    $messageLayer.show();
                }
                if (effectiveConfig.onCoverApplied) {
                    effectiveConfig.onCoverApplied();
                }
            }

            // Bind events (tab trapping, click handlers)
            manageInteractionEvents(true, targetElement, effectiveConfig);

            if (isPageLevel) {
                pageGlobalCoverElement = $messageLayer[0];
                pageGlobalFocusableElements = $context(effectiveConfig.interactiveElementsSelector, pageGlobalCoverElement);
                if (effectiveConfig.focusFirstInput) {
                    setTimeout(() => setInitialFocus(pageGlobalCoverElement, effectiveConfig.interactiveElementsSelector), 20);
                }
            } else {
                positionElementCenter($messageLayer[0], effectiveConfig.centerHorizontally, effectiveConfig.centerVertically);
            }

            // Set up auto-release if a delay is specified
            if (effectiveConfig.autoReleaseDelay > 0) {
                let timeoutId = setTimeout(function() {
                    if (isPageLevel) {
                        $context.releasePageOverlay(effectiveConfig);
                    } else {
                        $context(targetElement).releaseContent(effectiveConfig);
                    }
                }, effectiveConfig.autoReleaseDelay);
                $context(targetElement).data('overlayStatus.timeoutId', timeoutId);
            }
        }

        // Core function to remove the blocking overlay.
        function clearContentOverlay(targetElement, releaseOptions) {
            let isPageLevel = isGlobalTarget(targetElement);
            let $target = $context(targetElement);
            let historicalData = $target.data('overlayStatus.history');
            let timeoutId = $target.data('overlayStatus.timeoutId');

            if (timeoutId) {
                clearTimeout(timeoutId);
                $target.removeData('overlayStatus.timeoutId');
            }

            let effectiveConfig = $context.extend({}, $context.applyPageOverlay.configuration, releaseOptions || {});
            manageInteractionEvents(false, targetElement, effectiveConfig); // Unbind all related events

            // If onCoverReleased was not passed, use the one stored during applyContentOverlay
            if (effectiveConfig.onCoverReleased === null) {
                effectiveConfig.onCoverReleased = $target.data('overlayStatus.onReleaseCallback');
                $target.removeData('overlayStatus.onReleaseCallback');
            }

            let $allBlockingLayers;
            if (isPageLevel) {
                // Select all layers created by the plugin that are direct children of body
                $allBlockingLayers = $context('body').children().filter('.blockingIframe, .blockingBackdrop, .contentOverlay');
            } else {
                // Select layers within the specific element
                $allBlockingLayers = $target.find('>.blockingIframe, >.blockingBackdrop, >.contentOverlay');
            }

            // Reset cursor style on all relevant layers
            if (effectiveConfig.defaultCursor && $allBlockingLayers.length > 0) {
                $allBlockingLayers.each(function() {
                    this.style.cursor = effectiveConfig.defaultCursor;
                });
            }

            if (isPageLevel) {
                pageGlobalCoverElement = null;
                pageGlobalFocusableElements = [];
            }

            $target.removeData('overlayStatus.isActive'); // Mark element as inactive

            // Handle fade-out animation
            if (effectiveConfig.animationOutDuration > 0) {
                let layersRemaining = $allBlockingLayers.length;
                $allBlockingLayers.originalFadeOut(effectiveConfig.animationOutDuration, function() {
                    if (--layersRemaining === 0) {
                        cleanupLayers($allBlockingLayers, historicalData, effectiveConfig, targetElement);
                    }
                });
            } else {
                cleanupLayers($allBlockingLayers, historicalData, effectiveConfig, targetElement);
            }
        }
    }

    // Guard clause: Ensure jQuery is available before initializing the plugin
    if (typeof $lib === 'undefined' || !$lib.fn || !$lib.fn.jquery) {
        console.error("The Custom Overlay & Notification Module requires jQuery to be loaded.");
        return;
    }

    // Initialize the plugin, passing jQuery as the context
    initializeOverlayPlugin($lib);

})(window, jQuery);