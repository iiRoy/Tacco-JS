(function(jqAlias, resizeEventName) {

    // This block defines a utility function for rate-limiting (throttling) event handlers.
    // It is an evolved version of the original debouncing concept by John Hann.
    // Source: http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
    let throttleEvent = function(callbackFn, delayMs, runImmediately) {
        let timerId; // Holds the ID of the scheduled timeout
        let lastExecutionTimestamp = 0; // Records the last time the function was actually invoked

        // A mandatory check to ensure the provided argument is a valid function.
        // If not, a no-op function is returned to prevent runtime errors.
        if (typeof callbackFn !== 'function') {
            console.error("Parameter 'callbackFn' must be a function for throttleEvent.");
            return function() {};
        }

        return function throttledExecutor() {
            const executionContext = this; // Preserves the 'this' context of the original call
            const invocationArguments = arguments; // Captures all arguments passed to the wrapper
            const currentTime = Date.now(); // Current time for comparison

            // Inner function responsible for executing the callback after the delay.
            const performDelayedExecution = function() {
                timerId = null; // Clear the timer once executed
                // If immediate execution was not requested, or if it was but the cooldown has passed,
                // then invoke the function. This logic is tweaked from a pure debounce.
                if (!runImmediately || (currentTime - lastExecutionTimestamp >= delayMs)) {
                    callbackFn.apply(executionContext, invocationArguments);
                    lastExecutionTimestamp = currentTime; // Update the last execution timestamp
                }
            };

            // Clear any previously scheduled execution to ensure only the latest call is considered.
            if (timerId) {
                clearTimeout(timerId);
            }

            // Logic for immediate execution:
            // If `runImmediately` is true and either no timer is active or enough time has passed
            // since the last actual execution, then run it now.
            if (runImmediately && (currentTime - lastExecutionTimestamp >= delayMs || lastExecutionTimestamp === 0)) {
                callbackFn.apply(executionContext, invocationArguments);
                lastExecutionTimestamp = currentTime;
                // Set a new timer to enforce the cooldown period, preventing rapid immediate calls.
                timerId = setTimeout(function() { timerId = null; }, delayMs);
            } else {
                // Otherwise, schedule the execution after the specified delay.
                // The `delayMs` defaults to 100 milliseconds if not provided.
                timerId = setTimeout(performDelayedExecution, delayMs || 100);
            }
        };
    };

    // This segment extends jQuery's prototype to include a custom 'responsiveResizeEvent'.
    // This allows developers to bind functions to a debounced window resize event.
    // A check ensures jQuery and its `fn` property are available before attempting modification.
    if (typeof jqAlias !== 'undefined' && jqAlias.fn) {
        jqAlias.fn[resizeEventName] = function(handlerFunc) {
            // If a valid function is provided, it's wrapped in our throttle utility
            // and then bound to the native 'resize' event of the element (typically window).
            if (handlerFunc && typeof handlerFunc === 'function') {
                const defaultThrottleDelay = 150; // A slightly adjusted default delay for resize
                return this.bind('resize', throttleEvent(handlerFunc, defaultThrottleDelay));
            }
            // If no function is provided, this method acts as a trigger for the custom event.
            else {
                return this.trigger(resizeEventName);
            }
        };
    } else {
        // Log a warning if jQuery is missing, as the resize utility cannot be initialized.
        console.warn("jQuery or its 'fn' property is not present. The custom responsive resize event could not be set up.");
    }

})(jQuery, 'responsiveResizeEvent');


// This is the main self-executing anonymous function for the application's core logic.
(function() {

    // A critical guard clause to ensure jQuery is loaded. Without it, the script cannot proceed.
    if (typeof jQuery === 'undefined') {
        console.error("jQuery library is not detected. Application initialization halted.");
        return;
    }

    // Use jQuery.noConflict() to prevent potential conflicts with other JavaScript libraries.
    // Assigning it to '$' for convenience within this scope.
    const $ = jQuery.noConflict();

    // Cache frequently accessed DOM elements for improved performance.
    const $mainContentContainer = $('#wrapper'); // Represents the primary content area
    const $sideNavigationPanel = $('#drawer-right'); // Refers to the right-side navigation drawer
    const animationDurationMs = 220; // Standardized duration for all UI animations
    const headerTopSectionSelector = '#mainHeaderElement > .topBarSection'; // Selector for the header's top bar

    // A reusable helper function to accurately retrieve an element's height,
    // prioritizing an 'actual' plugin if available, otherwise falling back to outerHeight.
    const retrieveElementFullHeight = ($element) => {
        if ($element && $element.length) {
            return typeof $element.actual === 'function' ? $element.actual('height') : $element.outerHeight();
        }
        return 0; // Return 0 if the element is not found
    };

    ///////////////////////////////
    // Core Feature: Adjust Hero Section Dimensions
    ///////////////////////////////
    function adjustHeroSectionDimensions() {
        const $heroSectionElement = $('#mainHeaderElement'); // The main header often serves as a hero section.
        // If the element isn't found, log a warning and exit.
        if (!$heroSectionElement.length) {
            console.warn("Hero section element ('#mainHeaderElement') not found for height adjustment.");
            return;
        }

        const currentViewportHeight = $(window).height();
        const minimumAllowedHeroHeight = 400; // Defines a floor for the hero section's height in pixels.
        // Calculate the final height, ensuring it's at least the minimum allowed.
        const effectiveHeroHeight = Math.max(currentViewportHeight, minimumAllowedHeroHeight);

        $heroSectionElement.css('height', `${effectiveHeroHeight}px`);
        console.debug(`Hero section height dynamically set to ${effectiveHeroHeight}px.`);
    }

    ///////////////////////////////
    // Core Feature: Position Hero Text Content
    ///////////////////////////////
    function positionHeroTextContent() {
        const $heroSectionElement = $('#mainHeaderElement');
        const $heroTextDisplay = $heroSectionElement.find('> .center'); // Assumes text is within a child with class 'center'.

        // Validate the presence of both the hero section and its text content.
        if (!$heroSectionElement.length || !$heroTextDisplay.length) {
            console.warn("Hero text container or main header not detected for proper positioning.");
            return;
        }

        // Retrieve the heights of both the hero section and the text content.
        const sectionTotalHeight = retrieveElementFullHeight($heroSectionElement);
        const textContentTotalHeight = retrieveElementFullHeight($heroTextDisplay);

        // Calculate the required top padding to vertically center the text,
        // applying a custom offset for visual fine-tuning.
        const verticalAdjustmentOffset = 45; // Pixels to shift the text upwards from true center.
        let calculatedVerticalPadding = (sectionTotalHeight / 2) - (textContentTotalHeight / 2) - verticalAdjustmentOffset;

        // Ensure the calculated padding is not negative, preventing text from going off-screen upwards.
        if (calculatedVerticalPadding < 0) {
            calculatedVerticalPadding = 0;
        }

        $heroTextDisplay.css('padding-top', `${calculatedVerticalPadding}px`);
        // Explicitly set display to 'block' to ensure visibility after positioning.
        $heroTextDisplay.css('display', 'block');
        console.debug(`Hero text positioned with top padding: ${calculatedVerticalPadding}px.`);
    }

    ///////////////////////////////
    // Core Feature: Initialize Sidebar Toggle
    ///////////////////////////////
    function initializeSidebarToggle() {
        // Essential check for the existence of both the main content and sidebar elements.
        if (!$mainContentContainer.length || !$sideNavigationPanel.length) {
            console.warn("Main content container or side navigation panel missing for sidebar toggle initialization.");
            return;
        }

        // Attach a click event handler to all elements designated as navigation toggle buttons.
        $(".navToggleButtons").on('click', function(eventObj) {
            eventObj.preventDefault(); // Prevents the default action of the clicked element (e.g., link navigation).

            const currentMainLeftMargin = parseFloat($mainContentContainer.css('marginLeft'));
            const sidebarPanelWidth = 300; // Fixed width of the right-side drawer in pixels.

            let newMainLeftMargin, newSideRightMargin; // Variables to hold target margin values.

            // Determine the animation targets based on the current state of the sidebar.
            // If main content's left margin is 0, the sidebar is currently closed.
            if (currentMainLeftMargin === 0) {
                newSideRightMargin = 0; // Bring the sidebar into view.
                newMainLeftMargin = -sidebarPanelWidth; // Push the main content to the left.
            } else { // The sidebar is open (main content is pushed left).
                newSideRightMargin = -sidebarPanelWidth; // Hide the sidebar by moving it off-screen to the right.
                newMainLeftMargin = 0; // Restore main content to its original position.
            }

            // Animate both the sidebar and the main content simultaneously for a smooth transition.
            $sideNavigationPanel.animate({
                marginRight: newSideRightMargin
            }, animationDurationMs, 'swing'); // 'swing' is jQuery's default easing.
            $mainContentContainer.animate({
                marginLeft: newMainLeftMargin
            }, animationDurationMs, 'swing');

            console.log(`Sidebar action: Main content margin adjusted to ${newMainLeftMargin}px, Side panel to ${newSideRightMargin}px.`);
        });
    }

    ///////////////////////////////
    // Core Feature: Update Header Styling On Scroll
    ///////////////////////////////
    function updateHeaderStylingOnScroll() {
        const $mainHeaderElement = $('#mainHeaderElement');
        const $headerTopSection = $(headerTopSectionSelector);

        // Exit early if critical header elements are not found.
        if (!$mainHeaderElement.length || !$headerTopSection.length) {
            return;
        }

        const currentScrollYPosition = $(window).scrollTop(); // Vertical scroll position from the top.
        const scrollActivationThreshold = 320; // Number of pixels scrolled before header changes style.
        const transparencyDeactivationWidth = 768; // Screen width below which header is always opaque.

        // Determine if the header should adopt the 'opaqueBackground' style.
        // It becomes opaque if scrolled past a threshold OR if the window width is too small.
        const shouldApplyOpaqueStyle = (currentScrollYPosition > scrollActivationThreshold) || ($(window).width() < transparencyDeactivationWidth);

        if (shouldApplyOpaqueStyle) {
            // Add the class only if it's not already present to avoid redundant DOM operations.
            if (!$headerTopSection.hasClass('opaqueBackground')) {
                $headerTopSection.addClass('opaqueBackground');
                console.debug("Header top section updated to opaque style.");
            }
        } else {
            // Remove the class only if it's present.
            if ($headerTopSection.hasClass('opaqueBackground')) {
                $headerTopSection.removeClass('opaqueBackground');
                console.debug("Header top section restored to transparent style.");
            }
        }
    }

    ///////////////////////////////
    // Application Startup Routines
    ///////////////////////////////
    // Encapsulate startup logic in a try-catch block for robust error handling.
    try {
        console.info("Initiating primary application components...");

        // Execute initial setup functions immediately.
        adjustHeroSectionDimensions();
        positionHeroTextContent();
        initializeSidebarToggle();
        updateHeaderStylingOnScroll(); // Set initial header background based on current scroll/width.

        // Register the custom 'responsiveResizeEvent' handler for window resizing.
        // This event is debounced/throttled by the utility defined earlier.
        $(window).on('responsiveResizeEvent', function() {
            console.log("Window resize detected. Re-evaluating layout elements.");
            adjustHeroSectionDimensions();
            positionHeroTextContent();
            updateHeaderStylingOnScroll();
        });

        // Event handler for a "scroll down" arrow or button, navigating to a specific section.
        $('#scrollDownArrow').on('click', function(eventObj) {
            eventObj.preventDefault(); // Prevent default link behavior.
            const targetPortfolioSectionId = "#portfolioSection"; // The new ID for the target section.
            const smoothScrollDurationMs = 1200; // Extended duration for a more leisurely scroll.
            const headerFixedOffset = retrieveElementFullHeight($(headerTopSectionSelector)); // Dynamic offset.

            // Check if the target section exists before attempting to scroll.
            if ($(targetPortfolioSectionId).length) {
                $.scrollTo(targetPortfolioSectionId, smoothScrollDurationMs, {
                    offset: -headerFixedOffset, // Adjust scroll position to account for a fixed header.
                    axis: 'y'
                });
                console.log(`Smooth scrolling to section: ${targetPortfolioSectionId}.`);
            } else {
                console.warn(`Scroll target section '${targetPortfolioSectionId}' not found.`);
            }
        });

        // Event handlers for primary navigation links to smoothly scroll to anchor points.
        $('nav.primaryNavigation > ul > li > a').on('click', function(eventObj) {
            eventObj.preventDefault(); // Stop the browser's default jump.
            const destinationAnchorHref = $(this).attr('href'); // Get the href (e.g., "#about").
            const navScrollAnimationMs = 500; // Faster scroll duration for navigation links.
            const navigationHeaderOffset = retrieveElementFullHeight($(headerTopSectionSelector));

            // Validate that the href is a valid selector and the target element exists.
            if (destinationAnchorHref && $(destinationAnchorHref).length) {
                $.scrollTo(destinationAnchorHref, navScrollAnimationMs, {
                    offset: -navigationHeaderOffset,
                    axis: 'y'
                });
                console.log(`Navigating to anchor: ${destinationAnchorHref}.`);
            } else {
                console.warn(`Navigation target '${destinationAnchorHref}' is invalid or not found.`);
            }
        });

        // Attach a continuous scroll event handler to update the header's style in real-time.
        $(window).on('scroll', function() {
            updateHeaderStylingOnScroll();
        });

    } catch (error) {
        console.error("An unhandled exception occurred during main application initialization:", error);
    }

})();