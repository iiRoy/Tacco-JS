(function(jq){
    // This module facilitates touch-based panel navigation for web applications.
    // It's a modernized adaptation of a popular swipe library,
    // enhanced for broader utility and maintainability.
    // Dual-licensed under MIT and GPL.

    var PanelSlider = function(primaryContainer, secondaryNav, customSettings)
    {
        // Internal constants for navigation commands
        const NEXT_PANEL_CMD  = 'advance';
        const PREV_PANEL_CMD  = 'retreat';
        const NAV_PANEL_CMD   = 'showMenu';
        const RESET_POS_CMD   = 'revert';

        var selfRef         = this; // Reference to the plugin instance
        var mainCanvas      = jq(primaryContainer); // The main content area, where panels reside
        var navigationBar   = jq(secondaryNav);     // The fixed navigation element

        // Default configuration options for the slider behavior
        var defaultCfg = {
            transitionDuration  : 180,           // Animation speed in milliseconds
            animationEaseFunc   : 'swing',       // Easing function for jQuery animations
            minSwipeThreshold   : 25,            // Minimum pixels for a swipe to register
            nextButtonSelector  : '#advanceBtn', // Selector for explicit next button (if any)
            prevButtonSelector  : '#retreatBtn',  // Selector for explicit previous button (if any)
        };

        selfRef.configuration = {}; // Stores merged configuration
        selfRef.runtimeStatus = {}; // Holds dynamic state during interactions

        // Initializes the slider component
        var initializeComponent = function() {
            selfRef.configuration = jq.extend({}, defaultCfg, customSettings || {}); // Merge settings
            selfRef.runtimeStatus  = {
                activeTouchPoints       : 0,         // Number of concurrent touch points
                initialTouchX           : 0,         // X-coordinate at touch start
                initialTouchY           : 0,         // Y-coordinate at touch start
                horizontalDisplacement  : 0,         // Cumulative horizontal movement
                canvasInitialPosition   : null,      // Canvas 'left' position before swipe
                currentTouchX           : 0,
                currentTouchY           : 0,
                isVerticalScroll        : null,      // Flag to distinguish scroll from swipe
            };

            // Determine layout based on screen width
            if (document.body.clientWidth > 768) { // Use a slightly higher threshold for 'many panels'
                setupMultiPanelLayout();
            } else {
                setupSinglePanelLayout();
            }
        };

        // Configures the layout for multiple side-by-side panels
        var setupMultiPanelLayout = function() {
            const PANEL_CLASS_PREFIX = "content-segment"; // Class for dynamic panels

            var panelDisplayWidth = Math.min(900, jq(document).width() * 0.95); // Responsive panel width
            var totalContentWidth = 0;
            var linkActionRegistry = {}; // Maps hrefs to click handlers

            navigationBar.find("ul a").each(function(idx) {
                var anchorRef = jq(this);
                var targetHref = anchorRef.attr('href');
                var panelIdentifier = PANEL_CLASS_PREFIX + idx;

                // Register default action for index page
                if (targetHref === "index.html") {
                    linkActionRegistry[targetHref] = function(evt) {
                        evt.preventDefault();
                        shiftCanvas(NAV_PANEL_CMD);
                    };
                }

                // Create a new panel element
                var currentPanel = jq("<div class='" + PANEL_CLASS_PREFIX + "' id='" + panelIdentifier + "'></div>")
                                    .appendTo(mainCanvas)
                                    .css("width", panelDisplayWidth)
                                    .css("left", totalContentWidth);

                totalContentWidth += currentPanel.outerWidth(true); // Include margins/padding

                // Fetch content for the panel asynchronously
                jq.get(targetHref, function(markup) {
                    var $loadedContent = jq(markup);
                    currentPanel.html($loadedContent);
                    bindInternalLinks($loadedContent, linkActionRegistry);
                });

                // Define click handler for navigation link
                var navClickHandler = function(evt) {
                    evt.preventDefault();
                    shiftCanvas('#' + panelIdentifier);
                };

                anchorRef.on({ 'click': navClickHandler });
                linkActionRegistry[targetHref] = navClickHandler; // Store handler for internal links
            });

            mainCanvas.css("width", totalContentWidth);
            shiftCanvas(NAV_PANEL_CMD); // Initially show the navigation panel
            attachTouchListeners(mainCanvas);
        };

        // Configures the layout for a single, dynamic panel
        var setupSinglePanelLayout = function() {
            const SINGLE_PANEL_ID = "primary-view";

            var totalContentWidth = 0;
            var linkActionRegistry = {};
            var activePanel = null;

            // Create the single dynamic panel
            activePanel = jq("<div class='content-segment' id='" + SINGLE_PANEL_ID + "'>")
                            .appendTo(mainCanvas)
                            .css("width", jq(document).width())
                            .css("left", 0)
                            .css("min-height", jq(document).height()); // Ensure it covers viewport

            totalContentWidth += activePanel.outerWidth(true);

            // Set up default action for home link
            linkActionRegistry["index.html"] = function(evt) {
                evt.preventDefault();
                shiftCanvas(NAV_PANEL_CMD);
            };

            navigationBar.find("ul a").each(function() {
                var anchorRef = jq(this);
                var targetHref = anchorRef.attr('href');

                var navClickHandler = function(evt) {
                    evt.preventDefault();
                    activePanel.html("<p class='loading-msg'>Loading content...</p>"); // Show loading indicator
                    jq.get(targetHref, function(markup) {
                        activePanel.scrollTop(0); // Reset scroll position
                        var $loadedContent = jq(markup);
                        activePanel.html($loadedContent);
                        bindInternalLinks($loadedContent, linkActionRegistry);
                        // Android fix for address bar disappearing
                        if(navigator.userAgent.match(/Android/i)){
                            setTimeout(() => window.scrollTo(0,1), 100);
                        }
                    });
                    shiftCanvas('#' + SINGLE_PANEL_ID);
                };

                anchorRef.on({ 'click': navClickHandler });
                linkActionRegistry[targetHref] = navClickHandler;
            });

            mainCanvas.css("width", totalContentWidth);
            shiftCanvas(NAV_PANEL_CMD); // Initially display the navigation menu

            // Load initial content for the single panel from the first nav link
            var firstNavLink = navigationBar.find("ul a:first-child");
            if (firstNavLink.length) {
                jq.get(firstNavLink.attr('href'), function(markup) {
                    var $initialContent = jq(markup);
                    activePanel.html($initialContent);
                    bindInternalLinks($initialContent, linkActionRegistry);
                    shiftCanvas('#' + SINGLE_PANEL_ID);
                    if(navigator.userAgent.match(/Android/i)){
                        setTimeout(() => window.scrollTo(0,1), 100);
                    }
                });
            }

            attachTouchListeners(mainCanvas);
        };

        // Attaches touch event handlers to the given element
        var attachTouchListeners = function(targetElement) {
            if (!targetElement || targetElement.length === 0) return;

            // Standard touch events
            targetElement.on({
                'touchstart': (evt) => handleTouchStart(evt.originalEvent),
                'touchmove': (evt) => handleTouchMove(evt.originalEvent),
                'touchcancel': (evt) => handleTouchCancel(evt.originalEvent),
                'touchend': (evt) => handleTouchEnd(evt.originalEvent)
            });

            // Windows 8+ touch support (MSPointer events)
            if (window.navigator.msPointerEnabled) {
                targetElement.on({
                    'MSPointerCancel': (evt) => handleTouchCancel(evt.originalEvent),
                    'MSPointerDown': (evt) => handleTouchStart(evt.originalEvent),
                    'MSPointerMove': (evt) => handleTouchMove(evt.originalEvent),
                    'MSPointerOut': (evt) => handleTouchCancel(evt.originalEvent),
                    'MSPointerUp': (evt) => handleTouchEnd(evt.originalEvent)
                });
            }
        };

        // Handles the beginning of a touch interaction
        var handleTouchStart = function(touchEvent) {
            var status = selfRef.runtimeStatus;

            // Ensure we have touch points to process
            if (!touchEvent.touches || touchEvent.touches.length === 0) {
                return;
            }

            status.activeTouchPoints = touchEvent.touches.length;

            // Only proceed if a single finger is used for swiping
            if (status.activeTouchPoints === 1) {
                const firstTouch = touchEvent.touches[0];

                status.isVerticalScroll         = null; // Reset scroll detection
                status.horizontalDisplacement   = 0;
                status.initialTouchX            = firstTouch.pageX;
                status.initialTouchY            = firstTouch.pageY;
                status.canvasInitialPosition    = mainCanvas.position().left; // Record current panel position
            } else {
                // Multiple touches detected, cancel potential swipe
                handleTouchCancel(touchEvent);
            }
        };

        // Handles ongoing touch movement
        var handleTouchMove = function(touchEvent) {
            var status = selfRef.runtimeStatus;

            // Process only if a single touch point is active
            if (status.activeTouchPoints === 1) {
                const currentTouch = touchEvent.touches[0];

                status.currentTouchX = currentTouch.pageX;
                status.currentTouchY = currentTouch.pageY;

                status.horizontalDisplacement = status.currentTouchX - status.initialTouchX;
                var verticalDisplacement = status.currentTouchY - status.initialTouchY;

                // Determine if interaction is primarily horizontal (swipe) or vertical (scroll)
                if (status.isVerticalScroll === null) {
                    status.isVerticalScroll = Math.abs(status.horizontalDisplacement) < Math.abs(verticalDisplacement);
                }

                // If it's a swipe, prevent default scrolling behavior and move the canvas
                if (!status.isVerticalScroll) {
                    touchEvent.preventDefault(); // Stop browser from scrolling
                    var newCanvasLeft = status.canvasInitialPosition + status.horizontalDisplacement;
                    mainCanvas.css('left', newCanvasLeft);
                }
            } else {
                // Not a single touch, cancel any ongoing swipe
                handleTouchCancel(touchEvent);
            }
        };

        // Handles the end of a touch interaction
        var handleTouchEnd = function(touchEvent) {
            var status = selfRef.runtimeStatus;

            // Check if a valid swipe occurred (single finger, horizontal movement, not a scroll)
            var isValidSwipeCandidate = !status.isVerticalScroll &&
                                        status.horizontalDisplacement !== 0 &&
                                        status.activeTouchPoints === 1 &&
                                        status.currentTouchX !== 0; // Ensure movement actually registered

            if (isValidSwipeCandidate) {
                // If displacement exceeds minimum threshold, navigate
                if (Math.abs(status.horizontalDisplacement) > selfRef.configuration.minSwipeThreshold) {
                    if (status.horizontalDisplacement > 0) { // Swiped right
                        shiftCanvas(PREV_PANEL_CMD);
                    } else { // Swiped left
                        shiftCanvas(NEXT_PANEL_CMD);
                    }
                } else {
                    // Swipe was too short, revert to original position
                    shiftCanvas(RESET_POS_CMD);
                }
            } else {
                // Not a valid swipe, reset state
                handleTouchCancel(touchEvent);
            }
            // Reset current touch positions after interaction
            status.currentTouchX = 0;
            status.currentTouchY = 0;
        };

        // Handles touch cancellation or invalid states, resetting positions
        var handleTouchCancel = function(touchEvent) {
            var status = selfRef.runtimeStatus;

            // If the canvas has been moved, snap it back
            if (status.canvasInitialPosition !== null && status.canvasInitialPosition !== mainCanvas.position().left) {
                shiftCanvas(RESET_POS_CMD);
            }

            // Clear all touch-related state variables
            jq.extend(status, {
                activeTouchPoints       : 0,
                initialTouchX           : 0,
                initialTouchY           : 0,
                horizontalDisplacement  : 0,
                canvasInitialPosition   : null,
                currentTouchX           : 0,
                currentTouchY           : 0,
                isVerticalScroll        : null,
            });
        };

        // Controls the movement and snapping of the main content canvas
        var shiftCanvas = function(command) {
            var contentPanels = jq('div.content-segment');
            var targetPanelLeft = null; // Desired 'left' position for the canvas

            // Calculate current visible panel boundaries
            var currentOffset = mainCanvas.offset().left;
            var currentLeftmostPanel = null;
            var currentRightmostPanel = null;

            if (currentOffset > 0) { // Navigation panel is visible or partially visible
                currentRightmostPanel = jq(contentPanels[0]);
            } else {
                let cumulativeWidth = 0;
                for (let i = 0; i < contentPanels.length; i++) {
                    let panel = jq(contentPanels[i]);
                    cumulativeWidth += panel.outerWidth(true);
                    if (cumulativeWidth + currentOffset > 10) { // If panel is mostly visible
                        currentLeftmostPanel = panel;
                        if (i + 1 < contentPanels.length) {
                            currentRightmostPanel = jq(contentPanels[i + 1]);
                        }
                        break;
                    }
                }
            }

            // Determine target position based on command
            switch (command) {
                case PREV_PANEL_CMD:
                    if (currentLeftmostPanel && currentLeftmostPanel.length) {
                        targetPanelLeft = -1 * currentLeftmostPanel.position().left;
                    } else if (currentOffset < 0) { // If at first content panel, go to nav
                        targetPanelLeft = navigationBar.outerWidth(true) + navigationBar.position().left;
                    }
                    break;
                case NAV_PANEL_CMD:
                    targetPanelLeft = navigationBar.outerWidth(true) + navigationBar.position().left;
                    break;
                case NEXT_PANEL_CMD:
                    if (currentRightmostPanel && currentRightmostPanel.length) {
                        targetPanelLeft = -1 * currentRightmostPanel.position().left;
                    }
                    break;
                case RESET_POS_CMD:
                    targetPanelLeft = selfRef.runtimeStatus.canvasInitialPosition;
                    break;
                default: // Assume command is a selector for a specific panel
                    let specificPanel = jq(command);
                    if (specificPanel.length) {
                        targetPanelLeft = -1 * specificPanel.position().left;
                    }
                    break;
            }

            // If a valid target position was determined, animate the canvas
            if (targetPanelLeft !== null) {
                animateCanvasToPosition(mainCanvas, targetPanelLeft);
            }
        };

        // Animates the main canvas to a specified 'left' position
        var animateCanvasToPosition = function(targetLayer, finalPosition) {
            // Use jQuery's animate for smooth transition
            return targetLayer.animate(
                { left: finalPosition },
                selfRef.configuration.transitionDuration,
                selfRef.configuration.animationEaseFunc,
                function() {
                    selfRef.runtimeStatus.canvasInitialPosition = finalPosition; // Update stored position
                }
            );
        };

        // Replaces standard links within a content fragment with custom click handlers
        var bindInternalLinks = function(contentFragment, handlerMap) {
            jq.each(handlerMap, function(hrefKey, clickHandler) {
                // Find all anchor elements whose href matches a key in the handler map
                var matchingLinks = jq(contentFragment).find('a[href="' + hrefKey + '"]');
                matchingLinks.off('click').on({ 'click': clickHandler }); // Bind handler, prevent double binding
            });
        };

        initializeComponent(); // Start the component initialization
    };

    // jQuery plugin definition
    jq.fn.panelSlider = function(auxiliaryElement, customSettings)
    {
        return this.each(function() {
           var currentElement = jq(this);

           // Prevent re-initialization if already attached
           if (currentElement.data('panelSliderInstance')) return;

           // Create a new instance of the PanelSlider
           var sliderInstance = new PanelSlider(this, auxiliaryElement, customSettings);

           // Store the instance in the element's data for future reference
           currentElement.data('panelSliderInstance', sliderInstance);
        });
    };
})(jQuery);