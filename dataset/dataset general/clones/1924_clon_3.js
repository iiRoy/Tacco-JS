/*!
 * Overview Navigator - A lightweight jQuery plugin for content navigation.
 * Copyright (c) 2024 Your Name or Company. All rights reserved.
 * Licensed under the MIT License.
 */

(function(jqRef, undefined) {

    "use strict";

    // Utility function to apply vendor prefixes for transforms
    const applyTransformStyles = (elem, transformValue) => {
        elem.css({
            '-webkit-transform': transformValue,
            '-moz-transform': transformValue,
            '-ms-transform': transformValue,
            '-o-transform': transformValue,
            'transform': transformValue
        });
    };

    jqRef.fn.viewportOverview = function(initialOptions) {
        const primaryContent = this;
        const viewport = jqRef(window);
        const noop = () => {};
        let isOverviewVisible = true; // Renamed from 'shown'
        let isInitialized = false; // Added: Initialization flag

        const defaultConfiguration = {
            verticalScaleFactor: 0.6, // Renamed from heightRatio
            horizontalScaleFactor: 0.05, // Renamed from widthRatio
            verticalOffsetPercent: 0.035, // Renamed from offsetHeightRatio
            horizontalOffsetPercent: 0.035, // Renamed from offsetWidthRatio
            placementSide: "right", // Renamed from position
            enableTouchGestures: true, // Renamed from touch
            smoothScrollingEnabled: true, // Renamed from smoothScroll
            scrollAnimationInterval: 200, // Renamed from smoothScrollDelay
            onViewPortUpdate: noop // Renamed from onPreviewChange
        };

        const currentConfiguration = jqRef.extend({}, defaultConfiguration, initialOptions);
        const validPlacementSides = ["right", "left"]; // Renamed from 'position'

        // Helper for input validation logic
        const validateSetting = (propName, propValue) => {
            switch (propName) {
                case 'verticalScaleFactor':
                    if (!Number.isFinite(propValue) || propValue <= 0.0 || propValue > 1.0) {
                        throw new Error(`Invalid 'verticalScaleFactor': ${propValue}. Must be a number between 0 (exclusive) and 1 (inclusive).`);
                    }
                    break;
                case 'horizontalScaleFactor':
                    if (!Number.isFinite(propValue) || propValue <= 0.0 || propValue > 0.5) {
                        throw new Error(`Invalid 'horizontalScaleFactor': ${propValue}. Must be a number between 0 (exclusive) and 0.5 (inclusive).`);
                    }
                    break;
                case 'verticalOffsetPercent':
                    if (!Number.isFinite(propValue) || propValue < 0.0 || propValue > 0.9) {
                        throw new Error(`Invalid 'verticalOffsetPercent': ${propValue}. Must be a number between 0 (inclusive) and 0.9 (inclusive).`);
                    }
                    break;
                case 'horizontalOffsetPercent':
                    if (!Number.isFinite(propValue) || propValue < 0.0 || propValue > 0.9) {
                        throw new Error(`Invalid 'horizontalOffsetPercent': ${propValue}. Must be a number between 0 (inclusive) and 0.9 (inclusive).`);
                    }
                    break;
                case 'placementSide':
                    const normalizedSide = String(propValue).trim().toLowerCase();
                    if (!validPlacementSides.includes(normalizedSide)) {
                        throw new Error(`Invalid 'placementSide': ${propValue}. Expected 'right' or 'left'.`);
                    }
                    currentConfiguration.placementSide = normalizedSide; // Update immediately
                    break;
                case 'scrollAnimationInterval':
                    if (!Number.isInteger(propValue) || propValue < 10) { // Changed minimum to 10ms
                        throw new Error(`Invalid 'scrollAnimationInterval': ${propValue}. Must be an integer >= 10.`);
                    }
                    break;
                case 'enableTouchGestures':
                case 'smoothScrollingEnabled':
                    if (typeof propValue !== 'boolean') {
                         throw new Error(`Invalid '${propName}': ${propValue}. Expected a boolean value.`);
                    }
                    break;
                case 'onViewPortUpdate':
                    if (!propValue || typeof propValue !== 'function') {
                        throw new Error(`Invalid 'onViewPortUpdate': ${propValue}. Expected a function.`);
                    }
                    break;
                default:
                    // Added: Warn for unknown properties but don't throw to allow future extensibility
                    console.warn(`Unknown configuration property: ${propName}. It will be ignored.`);
                    break;
            }
        };

        // Perform initial validation of all configuration properties
        for (const prop in currentConfiguration) {
            if (Object.prototype.hasOwnProperty.call(currentConfiguration, prop)) {
                validateSetting(prop, currentConfiguration[prop]);
            }
        }

        // Clone the content for the overview, including deep copy of data and events
        const overviewClone = primaryContent.clone(true, true); // Renamed from miniElement
        overviewClone.find('.viewport-overview.no-select').remove(); // Ensure no nested overview clones
        overviewClone.find('.scroll-region-marker').remove(); // Ensure no nested region markers
        overviewClone.addClass('viewport-overview no-select');

        // Disable pointer events on children to prevent interaction with the overview clone itself
        overviewClone.children().each((idx, child) => {
            jqRef(child).css({ 'pointer-events': 'none' });
        });

        // Create the scroll region indicator
        const scrollRegionIndicator = jqRef('<div>', { class: 'scroll-region-marker' }); // Renamed from region

        // Append the overview and indicator to the body
        jqRef('body').append(scrollRegionIndicator);
        jqRef('body').append(overviewClone);

        // Calculates the scaling factors for width and height
        const calculateCurrentScale = () => {
            const currentViewportWidth = viewport.width();
            const currentViewportHeight = viewport.height();
            const contentOriginalWidth = primaryContent.width();
            const contentOriginalHeight = primaryContent.height();

            return {
                x: (currentViewportWidth / contentOriginalWidth) * currentConfiguration.horizontalScaleFactor,
                y: (currentViewportHeight / contentOriginalHeight) * currentConfiguration.verticalScaleFactor
            };
        };

        // Handles window resize events to update the overview's position and size
        const handleWindowResize = () => {
            if (!isOverviewVisible) {
                return; // Guard clause
            }

            const currentScale = calculateCurrentScale();
            const transformString = `scale(${currentScale.x}, ${currentScale.y})`;
            const viewportHeight = viewport.height();
            const viewportWidth = viewport.width();

            const calculatedOffsetTop = viewportHeight * currentConfiguration.verticalOffsetPercent;
            const calculatedOffsetSide = viewportWidth * currentConfiguration.horizontalOffsetPercent;

            // Calculate overview clone's position and dimensions
            const cloneVerticalPos = (primaryContent.height() * (currentScale.y - 1) / 2) + calculatedOffsetTop;
            const cloneHorizontalPos = (primaryContent.width() * (currentScale.x - 1) / 2) + calculatedOffsetSide;
            const cloneWidth = viewportWidth * (1 / currentScale.x) * currentConfiguration.horizontalScaleFactor;
            const cloneHeight = viewportHeight * (1 / currentScale.y) * currentConfiguration.verticalScaleFactor;

            const overviewStyles = {
                'top': cloneVerticalPos,
                'width': cloneWidth,
                'height': cloneHeight,
                'margin': '0px',
                'padding': '0px'
            };
            overviewStyles[currentConfiguration.placementSide] = cloneHorizontalPos;
            applyTransformStyles(overviewClone, transformString);
            overviewClone.css(overviewStyles);

            // Calculate scroll region indicator's position and dimensions
            const regionVerticalPos = primaryContent.offset().top * currentScale.y;
            const regionStyles = {
                width: overviewClone.width() * currentScale.x,
                height: viewportHeight * currentScale.y,
                margin: '0px',
                top: (viewport.scrollTop() * currentScale.y) + calculatedOffsetTop - regionVerticalPos + 'px'
            };
            regionStyles[currentConfiguration.placementSide] = calculatedOffsetSide + 'px';
            scrollRegionIndicator.css(regionStyles);

            // Trigger the custom callback if defined
            if (typeof currentConfiguration.onViewPortUpdate === 'function') {
                currentConfiguration.onViewPortUpdate(overviewClone, currentScale);
            }
        };

        // Handles window scroll events to update the scroll region indicator's position
        const handleViewportScroll = () => {
            if (!isOverviewVisible) {
                return; // Guard clause
            }

            const currentScale = calculateCurrentScale();
            const calculatedOffsetTop = viewport.height() * currentConfiguration.verticalOffsetPercent;
            const contentTopScaled = primaryContent.offset().top * currentScale.y;
            const currentScrollPosScaled = viewport.scrollTop() * currentScale.y;
            const indicatorHeight = scrollRegionIndicator.outerHeight(true);
            const contentBottomScaled = primaryContent.outerHeight(true) * currentScale.y + contentTopScaled;

            // Check if the scroll indicator is outside the primary content area in the overview
            const isIndicatorOutOfView = (currentScrollPosScaled + indicatorHeight + calculatedOffsetTop < contentTopScaled) ||
                                         (currentScrollPosScaled > contentBottomScaled);

            if (isIndicatorOutOfView) {
                scrollRegionIndicator.css({ display: 'none' });
            } else {
                scrollRegionIndicator.css({
                    top: currentScrollPosScaled + calculatedOffsetTop - contentTopScaled + 'px',
                    display: 'block'
                });
            }
        };

        let isSmoothScrollingActive = false; // Renamed from onSmoothScroll
        let isMousePressed = false; // Renamed from mousedown

        // Scrolls the main viewport to a target position based on a click/drag on the overview
        const navigateToPosition = (eventObject) => {
            if (!isOverviewVisible) {
                return; // Guard clause
            }

            const currentScale = calculateCurrentScale();
            const calculatedOffsetTop = viewport.height() * currentConfiguration.verticalOffsetPercent;
            const contentTopScaled = primaryContent.offset().top * currentScale.y;
            // Calculate the target scroll position in the main content
            let targetScrollY = (eventObject.clientY - calculatedOffsetTop + contentTopScaled) / currentScale.y;

            // Ensure targetScrollY is within valid bounds of the primary content
            const maxScrollableHeight = primaryContent.outerHeight(true) - viewport.height();
            targetScrollY = Math.max(0, Math.min(targetScrollY, maxScrollableHeight));

            if (eventObject.type === 'click' && currentConfiguration.smoothScrollingEnabled) {
                let currentScrollY = viewport.scrollTop();
                const scrollDistance = Math.abs(currentScrollY - targetScrollY);
                const animationDuration = currentConfiguration.scrollAnimationInterval;

                // Avoid division by zero if already at target or very small distance
                if (scrollDistance < 1 || animationDuration < 10) {
                    viewport.scrollTop(targetScrollY);
                    return;
                }

                const framesPerSecond = 60; // Target 60 FPS for animation
                const totalFrames = Math.ceil(animationDuration / (1000 / framesPerSecond));
                if (totalFrames === 0) { // Safety check
                    viewport.scrollTop(targetScrollY);
                    return;
                }
                const scrollStep = (targetScrollY - currentScrollY) / totalFrames;

                isSmoothScrollingActive = true;
                let frameCount = 0;

                const animateScroll = () => {
                    if (frameCount >= totalFrames) {
                        viewport.scrollTop(targetScrollY); // Ensure it lands exactly on target
                        isSmoothScrollingActive = false;
                        return;
                    }

                    currentScrollY += scrollStep;
                    viewport.scrollTop(currentScrollY);
                    frameCount++;
                    requestAnimationFrame(animateScroll); // Use rAF for smoother animation
                };
                requestAnimationFrame(animateScroll);

            } else {
                // Instant scroll
                viewport.scrollTop(targetScrollY);
            }
            eventObject.stopPropagation();
        };

        // Event handlers for mouse interactions on the overview
        const handleMouseRelease = () => {
            isMousePressed = false;
        };

        const handleMouseMove = (e) => {
            if (!isMousePressed || isSmoothScrollingActive) {
                return;
            }
            navigateToPosition(e);
        };

        const handleRegionClick = (e) => {
            navigateToPosition(e);
            isMousePressed = false; // Ensure mouse state is reset after click
        };

        const handleMousePress = () => {
            isMousePressed = true;
        };

        // Initial setup and event binding
        handleWindowResize(); // Perform initial layout calculation

        viewport.on('resize', handleWindowResize);
        viewport.on('scroll', handleViewportScroll);

        // Bind mouse events to both the region indicator and the overview clone
        [scrollRegionIndicator, overviewClone].forEach(elem => {
            elem.on('mousedown', handleMousePress);
            elem.on('mouseup', handleMouseRelease);
            elem.on('mousemove', handleMouseMove);
            elem.on('click', handleRegionClick);
        });

        let previousTouchEventType = ''; // Renamed from lastTouchType

        // Simulates mouse events from touch events for broader compatibility
        const simulateMouseEventFromTouch = (touchEvent) => {
            const touches = touchEvent.changedTouches;

            // Ignore multi-touch gestures
            if (touches.length !== 1) {
                return;
            }

            const touch = touches[0];
            const touchEventTypes = ["touchstart", "touchmove", "touchend"];
            const simulatedMouseTypes = ["mousedown", "mousemove", "mouseup"];
            const currentTouchIndex = touchEventTypes.indexOf(touchEvent.type);

            if (currentTouchIndex === -1) {
                return; // Not a recognized touch event
            }

            let simulatedType = simulatedMouseTypes[currentTouchIndex];
            // If it's a touchend after a touchstart, simulate a click
            if (touchEvent.type === touchEventTypes[2] && previousTouchEventType === touchEventTypes[0]) {
                simulatedType = "click";
            }

            const customMouseEvent = document.createEvent("MouseEvent");
            customMouseEvent.initMouseEvent(
                simulatedType,
                true, // bubbles
                true, // cancelable
                window,
                1, // detail
                touch.screenX, touch.screenY,
                touch.clientX, touch.clientY,
                false, false, false, false, // ctrlKey, altKey, shiftKey, metaKey
                0, // button
                null // relatedTarget
            );

            touch.target.dispatchEvent(customMouseEvent);
            touchEvent.preventDefault(); // Prevent default touch behavior (e.g., scrolling)
            previousTouchEventType = touchEvent.type;
        };

        // Enable touch event listeners if configured
        if (currentConfiguration.enableTouchGestures) {
            // Added: Options object for passive listeners, important for performance
            const touchOptions = { passive: false };
            document.addEventListener("touchstart", simulateMouseEventFromTouch, touchOptions);
            document.addEventListener("touchmove", simulateMouseEventFromTouch, touchOptions);
            document.addEventListener("touchend", simulateMouseEventFromTouch, touchOptions);
            document.addEventListener("touchcancel", simulateMouseEventFromTouch, touchOptions); // Added touchcancel
        }

        // Public API functions
        const setOverviewPlacement = (newSide) => {
            const oldSide = currentConfiguration.placementSide;
            validateSetting('placementSide', newSide); // This will update currentConfiguration.placementSide internally
            if (oldSide !== currentConfiguration.placementSide) {
                // Clear old position style and re-calculate
                const resetCss = {};
                resetCss[oldSide] = '';
                scrollRegionIndicator.css(resetCss);
                overviewClone.css(resetCss);
                handleWindowResize(); // Redraw with new position
            }
        };

        const createPropertySetter = (propertyName, requiresRedraw = false) => {
            return (newValue) => {
                validateSetting(propertyName, newValue);
                // For 'placementSide', validation already updates `currentConfiguration.placementSide`
                // For other properties, update here:
                if (propertyName !== 'placementSide') {
                    currentConfiguration[propertyName] = newValue;
                }
                if (requiresRedraw) {
                    handleWindowResize();
                }
            };
        };

        const displayOverview = () => {
            if (isOverviewVisible) {
                return;
            }
            overviewClone.show();
            scrollRegionIndicator.show();
            isOverviewVisible = true;
            handleWindowResize(); // Ensure correct positioning after showing
        };

        const hideOverview = () => {
            if (!isOverviewVisible) {
                return;
            }
            overviewClone.hide();
            scrollRegionIndicator.hide();
            isOverviewVisible = false;
        };

        const toggleOverviewVisibility = () => {
            if (isOverviewVisible) {
                hideOverview();
            } else {
                displayOverview();
            }
        };

        // Mark as initialized
        isInitialized = true;

        // Return a public interface for controlling the overview
        return jqRef.extend({}, this, {
            "setOverviewPlacement": setOverviewPlacement,
            "setVerticalScaleFactor": createPropertySetter('verticalScaleFactor', true),
            "setHorizontalScaleFactor": createPropertySetter('horizontalScaleFactor', true),
            "setVerticalOffsetPercent": createPropertySetter('verticalOffsetPercent', true),
            "setHorizontalOffsetPercent": createPropertySetter('horizontalOffsetPercent', true),
            "setSmoothScrollingEnabled": createPropertySetter('smoothScrollingEnabled'),
            "setScrollAnimationInterval": createPropertySetter('scrollAnimationInterval'),
            "showOverview": displayOverview,
            "hideOverview": hideOverview,
            "toggleVisibility": toggleOverviewVisibility
        });
    };

}(jQuery));