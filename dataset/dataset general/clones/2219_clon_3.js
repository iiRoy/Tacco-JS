(function (jQuery) {
    // --- Constants for Animation and Interaction ---
    const ANIMATION_STOP_THRESHOLD_PX = 0.5; // Minimum delta for follower position to continue animation
    const INTERACTION_Y_ADJUSTMENT = 70; // Vertical offset for mouse/touch coordinates, based on original code's magic number

    /**
     * Represents a digital page-turning component for jQuery.
     * @param {jQuery} targetElement - The jQuery-wrapped DOM element to initialize the plugin on.
     * @param {object} userConfiguration - User-provided options to override defaults.
     * @constructor
     */
    function DigitalPageTurner(targetElement, userConfiguration) {
        // Ensure constructor is called with 'new'
        if (!(this instanceof DigitalPageTurner)) {
            return new DigitalPageTurner(targetElement, userConfiguration);
        }

        // --- Default Settings (Type II: Renamed properties, Type III: Slightly modified values/names) ---
        const initialSettings = {
            wrapperClass: 'folio-display-wrapper', // Renamed className
            pageWidth: 500,
            pageHeight: 375,
            animationEaseFactor: 0.5, // Renamed easing
            animationFps: 20, // Renamed fps
            defaultPageBackgroundColor: '#F0F0F0', // Renamed defaultPageColor, changed value
            canvasBackgroundFill: 'white', // Renamed backgroundColor
            interactiveCornerRadius: 50 // Renamed cornerSide
        };

        // Merge user configuration with defaults and perform validation (Type III: Added validation, modern merge)
        this.activeConfiguration = { ...initialSettings, ...userConfiguration };
        this._validateConfiguration(this.activeConfiguration);

        // --- Derived Configuration Properties (Type III: Added intermediate calculations, renamed) ---
        this.activeConfiguration.animationFrameIntervalMs = 1000 / this.activeConfiguration.animationFps;
        this.activeConfiguration.totalSpreadWidth = this.activeConfiguration.pageWidth * 2;
        this.activeConfiguration.pageDiagonalDistance = Math.hypot(this.activeConfiguration.pageWidth, this.activeConfiguration.pageHeight); // Using Math.hypot
        this.activeConfiguration.clippingPanelWidth = this.activeConfiguration.pageWidth;
        this.activeConfiguration.clippingPanelHeight = this.activeConfiguration.pageWidth * 10; // Value kept from original
        this.activeConfiguration.canvasVerticalPadding = this.activeConfiguration.pageDiagonalDistance - this.activeConfiguration.pageHeight; // Renamed pageHeightOffset

        // --- DOM Elements and Drawing Contexts (Type II: Renamed) ---
        let folioContainer = null; // Renamed holder
        let primaryCanvas = null; // Renamed canvas
        let overlayCanvas = null; // Renamed tempCanvas
        let primaryContext = null; // Renamed context
        let overlayContext = null; // Renamed tempContext

        // --- Interaction and Animation State (Type II: Renamed, Type III: Grouped, added flags) ---
        let currentPointerCoordinates = null; // Renamed mousePosition
        let animatedCornerCoordinates = null; // Renamed followerPosition
        let currentFoldAngleRadians = 0; // Renamed pageAngle

        // Fixed spine coordinates (Type II: Renamed, simplified spine top Y)
        const spineCenterlineX = this.activeConfiguration.pageWidth; // Renamed spineTopX
        const spineTopYCoordinate = 0; // Renamed spineTopY
        const spineBaseYCoordinate = this.activeConfiguration.pageHeight; // Renamed spineBottomTop

        // Y-coordinate for the fold line tangent, always at page height
        const foldLineTangentYCoordinate = this.activeConfiguration.pageHeight; // Renamed bisectorTangetY

        // Interaction flags
        let isFlippingLeftPage = false; // Renamed leftIsActive
        let isUserInteracting = false; // Renamed dragging
        let isPageFlipInProgress = false; // Renamed flipInProgress
        let isPotentialClick = false; // Renamed nextMouseUpIsClick

        // Callback for animation sequence completion (Type II: Renamed)
        let onFlipAnimationCompleteCallback = null;

        // --- Page Content Management (Type II: Renamed, Type III: Added explicit asset structure) ---
        let loadedPageAssets = []; // Renamed sourceImages
        let totalDisplayablePages = 0; // Renamed sourceImagesLength
        let activePageIndex = 0; // Renamed imageIndex (represents the left page of the current spread)
        let blankPageAsset = null; // Renamed defaultImage, will be an object representing a blank page

        // --- Private Methods (Type II/III: Renamed, refactored, added validation/helpers) ---

        /**
         * Validates critical configuration properties for the page turner. (Type III: New validation)
         * @param {object} config - The configuration object to validate.
         */
        this._validateConfiguration = function(config) {
            if (config.pageWidth <= 0 || config.pageHeight <= 0) {
                console.error("DigitalPageTurner: Invalid page dimensions. Width and height must be positive.");
                // A more robust implementation might throw an error or set fallbacks.
            }
            if (config.animationEaseFactor <= 0 || config.animationEaseFactor > 1) {
                console.warn("DigitalPageTurner: Animation ease factor should ideally be between 0 (exclusive) and 1 (inclusive) for smooth transitions.");
            }
        };

        /**
         * Initializes the starting coordinates for pointer and animation follower. (Type II: Renamed)
         */
        const initializeInteractionPoints = () => {
            currentPointerCoordinates = { y: this.activeConfiguration.pageHeight, x: this.activeConfiguration.pageWidth * 2 }; // {y, x} instead of {top, left}
            animatedCornerCoordinates = { y: this.activeConfiguration.pageHeight, x: this.activeConfiguration.pageWidth * 2 };
            isFlippingLeftPage = false; // Default to flipping the right page (moving from right to left)
        };

        /**
         * Sets up the main drawing canvas and an overlay canvas for dynamic effects. (Type II: Renamed, Type III: Simplified overlay canvas positioning)
         * @param {jQuery} targetElement - The jQuery-wrapped element after which the canvas holder will be inserted.
         */
        const setupCanvasElements = (targetElement) => {
            const config = this.activeConfiguration;

            folioContainer = jQuery("<div id='pageFolioContainer'></div>"); // Renamed id
            folioContainer
                .insertAfter(targetElement)
                .addClass(config.wrapperClass)
                .attr({ // Combined attribute setting
                    'width': config.totalSpreadWidth,
                    'height': config.pageHeight + config.canvasVerticalPadding * 2
                });

            primaryCanvas = jQuery("<canvas id='mainDrawingCanvas'></canvas>"); // Renamed id
            folioContainer.append(primaryCanvas);

            primaryCanvas.attr({ // Combined attribute setting
                'width': config.totalSpreadWidth,
                'height': config.pageHeight + config.canvasVerticalPadding * 2
            });

            overlayCanvas = jQuery("<canvas id='overlayEffectCanvas'></canvas>"); // Renamed id
            // Simplified positioning: If appended directly to folioContainer, top/left are 0.
            overlayCanvas
                .css({
                    position: 'absolute',
                    top: 0,
                    left: 0
                })
                .attr({
                    'width': primaryCanvas.width(),
                    'height': primaryCanvas.height()
                })
                .appendTo(folioContainer);

            primaryContext = primaryCanvas.get(0).getContext('2d');
            overlayContext = overlayCanvas.get(0).getContext('2d');

            if (!primaryContext || !overlayContext) { // Type III: Added basic error handling
                console.error("DigitalPageTurner: Failed to retrieve 2D rendering context for canvases.");
                return;
            }

            // Draw the spine line as a visual separator (Type III: Added comment)
            primaryContext.strokeStyle = "#aaaaaa";
            primaryContext.beginPath();
            primaryContext.moveTo(config.pageWidth, config.canvasVerticalPadding);
            primaryContext.lineTo(config.pageWidth, config.pageHeight + config.canvasVerticalPadding);
            primaryContext.stroke();
        };

        /**
         * Attaches event listeners for mouse and touch interactions to the overlay canvas and document. (Type II: Renamed, Type III: Used .on(), refactored move handlers)
         */
        const attachInteractionListeners = () => {
            jQuery(overlayCanvas)
                .on('mousemove', handlePointerMovementOnCanvas) // Used .on()
                .on('mouseout', handlePointerExitCanvas)
                .on('mousedown', handleInteractionStart)
                .on('touchstart', handleInteractionStart);

            jQuery(document)
                .on('mousemove', (event) => handleGlobalPointerMove(event, false)) // Refactored to a shared handler
                .on('touchmove', (event) => handleGlobalPointerMove(event, true))
                .on('mouseup', handleInteractionEnd)
                .on('touchend', handleInteractionEnd);
        };

        /**
         * Handles global mouse and touch move events, updating pointer coordinates. (Type III: New shared handler, improved touch handling)
         * @param {Event} event - The DOM event object.
         * @param {boolean} isTouchEvent - True if the event is a touch event.
         */
        const handleGlobalPointerMove = (event, isTouchEvent) => {
            isPotentialClick = false; // Any movement means it's not a simple click
            if (!isPageFlipInProgress && isUserInteracting) {
                const config = this.activeConfiguration;
                let clientX, clientY;

                if (isTouchEvent) {
                    if (event.originalEvent && event.originalEvent.touches.length === 1) {
                        event.preventDefault(); // Prevent default browser actions (e.g., scrolling)
                        const touch = event.originalEvent.touches[0];
                        clientX = touch.screenX;
                        clientY = touch.screenY;
                    } else {
                        return; // Ignore multi-touch or no touch events
                    }
                } else {
                    clientX = event.pageX;
                    clientY = event.pageY;
                }

                // Calculate coordinates relative to the folio container
                currentPointerCoordinates = {
                    x: clientX - jQuery(folioContainer).position().left,
                    y: clientY - config.canvasVerticalPadding + INTERACTION_Y_ADJUSTMENT // Using constant
                };
            }
        };

        /**
         * Clears the overlay canvas for the next drawing frame. (Type II: Renamed)
         */
        const clearOverlayDrawingCanvas = () => {
            overlayContext.clearRect(0, 0, overlayCanvas.width(), overlayCanvas.height());
        };

        /**
         * Handles a click event on the canvas, potentially triggering a full page flip. (Type II: Renamed, Type III: Added early exit conditions, reset pointer logic)
         */
        const handleCanvasClick = () => {
            const config = this.activeConfiguration;

            if (isPageFlipInProgress) {
                completePageFlipSequence(); // Immediately complete any ongoing flip
                clearOverlayDrawingCanvas();
                triggerCanvasRedraw(); // Re-render to reflect final state
                return; // Exit early
            }

            // Determine if clicking on a page that cannot be flipped further
            const attemptingToFlipPastStart = isFlippingLeftPage && activePageIndex === 0;
            const attemptingToFlipPastEnd = !isFlippingLeftPage && activePageIndex === totalDisplayablePages - 2; // -2 for spread

            if (attemptingToFlipPastStart || attemptingToFlipPastEnd) {
                // Cannot flip, snap pointer back to the edge
                currentPointerCoordinates = { y: config.pageHeight, x: isFlippingLeftPage ? config.totalSpreadWidth : 0 };
                return;
            }

            // If a flip is possible, set up target for an automatic flip
            const targetXCoord = isFlippingLeftPage ? config.totalSpreadWidth : 0;
            currentPointerCoordinates = { y: config.pageHeight, x: targetXCoord };
            // Small offset to ensure the animation follower starts moving
            animatedCornerCoordinates = { y: config.pageHeight - 1, x: isFlippingLeftPage ? 1 : config.totalSpreadWidth - 1 };

            isPageFlipInProgress = true;
            onFlipAnimationCompleteCallback = getFlipCompletionHandler(isFlippingLeftPage);
        };

        /**
         * Returns a closure function to handle actions upon completion of a page flip animation. (Type II: Renamed, Type III: Explicit variable names)
         * @param {boolean} animatingLeftPageDirection - True if the animation was for the left page moving right.
         * @returns {Function} - The callback function for animation completion.
         */
        const getFlipCompletionHandler = (animatingLeftPageDirection) => {
            return () => {
                // Adjust the active page index based on flip direction (Type III: Explicit index change)
                activePageIndex += animatingLeftPageDirection ? -2 : 2; // Move two pages at a time (a spread)

                // Reset pointer and animation follower to the new edge
                const resetX = animatingLeftPageDirection ? 0 : this.activeConfiguration.totalSpreadWidth;
                currentPointerCoordinates = { x: resetX, y: this.activeConfiguration.pageHeight };
                animatedCornerCoordinates = { ...currentPointerCoordinates }; // Create a new object for follower

                renderStaticBackgroundPages(); // Redraw static pages with new content
                clearOverlayDrawingCanvas();
                isUserInteracting = false; // Ensure interaction state is reset
            };
        };

        /**
         * Handles the end of a mouse or touch interaction (mouseup/touchend). (Type II: Renamed, Type III: Refactored logic)
         * @param {Event} event - The DOM event object.
         */
        const handleInteractionEnd = (event) => {
            const config = this.activeConfiguration;

            if (isPotentialClick) { // If no movement occurred, treat as a click
                handleCanvasClick();
                return;
            }

            if (!isPageFlipInProgress) {
                isUserInteracting = false; // Interaction has ended

                // Determine if the page should complete its flip or snap back
                const pointerXRelativeToContainer = event.pageX - jQuery(folioContainer).position().left;
                const shouldAutoFlip = isFlippingLeftPage
                    ? pointerXRelativeToContainer > config.pageWidth // If left page, must cross spine to flip
                    : pointerXRelativeToContainer < config.pageWidth; // If right page, must cross spine to flip

                if (shouldAutoFlip) {
                    // Set target for full flip animation
                    currentPointerCoordinates = { x: isFlippingLeftPage ? config.totalSpreadWidth : 0, y: config.pageHeight };
                    isPageFlipInProgress = true;
                    onFlipAnimationCompleteCallback = getFlipCompletionHandler(isFlippingLeftPage);
                } else {
                    // Snap back to the corner
                    currentPointerCoordinates = {
                        x: isFlippingLeftPage ? config.interactiveCornerRadius : config.totalSpreadWidth - config.interactiveCornerRadius,
                        y: config.pageHeight - config.interactiveCornerRadius
                    };
                }
            }
        };

        /**
         * Handles the start of a mouse or touch interaction (mousedown/touchstart). (Type II: Renamed, Type III: Unified coordinate calculation, guard clause)
         * @param {Event} event - The DOM event object.
         */
        const handleInteractionStart = (event) => {
            isPotentialClick = true; // Assume a click until movement is detected
            if (isPageFlipInProgress) {
                return; // Ignore new interactions if an animation is already running
            }

            const config = this.activeConfiguration;
            const containerOffset = jQuery(folioContainer).position();
            let clientX, clientY;

            // Get client coordinates for both mouse and touch events
            if (event.originalEvent && event.originalEvent.touches && event.originalEvent.touches.length === 1) {
                const touch = event.originalEvent.touches[0];
                clientX = touch.screenX;
                clientY = touch.screenY;
            } else {
                clientX = event.pageX;
                clientY = event.pageY;
            }

            // Calculate relative position within the interactive canvas area
            const relativeX = clientX - containerOffset.left;
            const relativeY = clientY - containerOffset.top - config.canvasVerticalPadding;

            // Check if the interaction started within the active page display area
            if (relativeY >= 0 && relativeY < config.pageHeight) {
                event.preventDefault(); // Prevent default browser actions for valid interaction
                isUserInteracting = true;

                if (relativeX >= 0 && relativeX < config.pageWidth) { // Interaction on the left page
                    currentPointerCoordinates = { x: config.interactiveCornerRadius, y: config.pageHeight - config.interactiveCornerRadius };
                    if (!isFlippingLeftPage) { // If previously flipping right, switch to left
                        isFlippingLeftPage = true;
                        animatedCornerCoordinates = { x: 0, y: config.pageHeight };
                    }
                } else if (relativeX >= config.pageWidth && relativeX < config.totalSpreadWidth) { // Interaction on the right page
                    currentPointerCoordinates = { x: config.totalSpreadWidth - config.interactiveCornerRadius, y: config.pageHeight - config.interactiveCornerRadius };
                    if (isFlippingLeftPage) { // If previously flipping left, switch to right
                        isFlippingLeftPage = false;
                        animatedCornerCoordinates = { x: config.totalSpreadWidth, y: config.pageHeight };
                    }
                } else {
                    // Interaction outside active page but within total spread width, snap to edge
                    currentPointerCoordinates = { x: isFlippingLeftPage ? 0 : config.totalSpreadWidth, y: config.pageHeight };
                }
            } else {
                // Interaction started outside the page height, snap pointer to the nearest edge
                currentPointerCoordinates = { x: isFlippingLeftPage ? 0 : config.totalSpreadWidth, y: config.pageHeight };
            }
        };

        /**
         * Handles the pointer leaving the canvas area. (Type II: Renamed)
         */
        const handlePointerExitCanvas = () => {
            if (!isUserInteracting && !isPageFlipInProgress) {
                // If not actively dragging or animating, snap pointer back to the page edge
                currentPointerCoordinates = { x: isFlippingLeftPage ? 0 : this.activeConfiguration.totalSpreadWidth, y: this.activeConfiguration.pageHeight };
            }
        };

        /**
         * Handles pointer movement over the canvas when not dragging. (Type II: Renamed, Type III: Reused logic, guard clause)
         * @param {Event} event - The DOM event object.
         */
        const handlePointerMovementOnCanvas = (event) => {
            isPotentialClick = false; // Movement means it's not a click
            if (!isUserInteracting && !isPageFlipInProgress) {
                const config = this.activeConfiguration;
                const containerOffset = jQuery(folioContainer).position();

                const relativeX = event.pageX - containerOffset.left;
                const relativeY = event.pageY - containerOffset.top - config.canvasVerticalPadding;

                if (relativeY >= 0 && relativeY < config.pageHeight) {
                    if (relativeX >= 0 && relativeX < config.pageWidth) { // Left page area
                        currentPointerCoordinates = { x: config.interactiveCornerRadius, y: config.pageHeight - config.interactiveCornerRadius };
                        if (!isFlippingLeftPage) {
                            isFlippingLeftPage = true;
                            animatedCornerCoordinates = { x: 0, y: config.pageHeight };
                        }
                    } else if (relativeX >= config.pageWidth && relativeX < config.totalSpreadWidth) { // Right page area
                        currentPointerCoordinates = { x: config.totalSpreadWidth - config.interactiveCornerRadius, y: config.pageHeight - config.interactiveCornerRadius };
                        if (isFlippingLeftPage) {
                            isFlippingLeftPage = false;
                            animatedCornerCoordinates = { x: config.totalSpreadWidth, y: config.pageHeight };
                        }
                    } else {
                        // Outside active page, but within spread width - snap to edge
                        currentPointerCoordinates = { x: isFlippingLeftPage ? 0 : config.totalSpreadWidth, y: config.pageHeight };
                    }
                } else {
                    // Outside active page height - snap to edge
                    currentPointerCoordinates = { x: isFlippingLeftPage ? 0 : config.totalSpreadWidth, y: config.pageHeight };
                }
            }
        };

        /**
         * Finalizes a page flip animation, executing the completion callback. (Type II: Renamed, Type III: Added type check)
         */
        const completePageFlipSequence = () => {
            if (typeof onFlipAnimationCompleteCallback === 'function') {
                onFlipAnimationCompleteCallback();
                onFlipAnimationCompleteCallback = null; // Clear the callback
            }
            isPageFlipInProgress = false;
        };

        /**
         * Updates the animated corner's position and calculates page fold geometry. (Type II: Renamed, Type III: Extensive refactoring and new intermediate variables)
         */
        const updateAnimationState = () => {
            if (currentPointerCoordinates === null) {
                return; // Nothing to animate yet
            }

            const config = this.activeConfiguration;

            // Calculate delta for animated corner movement
            let deltaY = (currentPointerCoordinates.y - animatedCornerCoordinates.y) * config.animationEaseFactor;
            let deltaX = (currentPointerCoordinates.x - animatedCornerCoordinates.x) * config.animationEaseFactor;

            // Stop animation if movement is negligible (Type III: Using constant)
            if (Math.abs(deltaX) < ANIMATION_STOP_THRESHOLD_PX && Math.abs(deltaY) < ANIMATION_STOP_THRESHOLD_PX) {
                completePageFlipSequence();
                return;
            }

            // Update animated corner coordinates
            animatedCornerCoordinates.y += deltaY;
            animatedCornerCoordinates.x += deltaX;

            // --- Geometric calculations for page fold ---

            // 1. Calculate angle from spine base to the animated corner
            const spineBaseToCornerDeltaX = animatedCornerCoordinates.x - spineCenterlineX;
            const spineBaseToCornerDeltaY = spineBaseYCoordinate - animatedCornerCoordinates.y;
            const angleToAnimatedCornerFromSpineBase = Math.atan2(spineBaseToCornerDeltaY, spineBaseToCornerDeltaX);

            // 2. Determine the page corner position, potentially clamped by page width circle
            const radiusIntersectionX = Math.cos(angleToAnimatedCornerFromSpineBase) * config.pageWidth + spineCenterlineX;
            const radiusIntersectionY = spineBaseYCoordinate - Math.sin(angleToAnimatedCornerFromSpineBase) * config.pageWidth;

            const distanceToAnimatedCornerFromSpine = Math.hypot(spineBaseToCornerDeltaX, spineBaseToCornerDeltaY);
            const distanceToRadiusIntersection = Math.hypot(radiusIntersectionX - spineCenterlineX, radiusIntersectionY - spineBaseYCoordinate);

            let pageFoldCornerX, pageFoldCornerY;
            if (distanceToRadiusIntersection < distanceToAnimatedCornerFromSpine) {
                pageFoldCornerX = radiusIntersectionX;
                pageFoldCornerY = radiusIntersectionY;
            } else {
                pageFoldCornerX = animatedCornerCoordinates.x;
                pageFoldCornerY = animatedCornerCoordinates.y;
            }

            // 3. Further clamp the page corner if it extends beyond the page diagonal from spine top
            const spineTopToFoldCornerDeltaX = spineCenterlineX - pageFoldCornerX;
            const spineTopToFoldCornerDeltaY = pageFoldCornerY - spineTopYCoordinate;
            const distanceSpineTopToFoldCorner = Math.hypot(spineTopToFoldCornerDeltaX, spineTopToFoldCornerDeltaY);
            const angleSpineTopToFoldCorner = Math.atan2(spineTopToFoldCornerDeltaY, spineTopToFoldCornerDeltaX);

            if (distanceSpineTopToFoldCorner > config.pageDiagonalDistance) {
                pageFoldCornerX = -Math.cos(angleSpineTopToFoldCorner) * config.pageDiagonalDistance + spineCenterlineX;
                pageFoldCornerY = spineTopYCoordinate + Math.sin(angleSpineTopToFoldCorner) * config.pageDiagonalDistance;
            }

            // 4. Calculate the bisector point (midpoint of the fold line) and its tangent
            const bisectorPointX = isFlippingLeftPage
                ? (pageFoldCornerX + spineCenterlineX) / 2
                : (config.totalSpreadWidth - pageFoldCornerX + config.pageWidth) / 2 + pageFoldCornerX; // Adjusted for right page
            const bisectorPointY = (config.pageHeight - pageFoldCornerY) / 2 + pageFoldCornerY;

            const bisectorAngleRaw = Math.atan2(config.pageHeight - bisectorPointY, isFlippingLeftPage ? bisectorPointX : config.totalSpreadWidth - bisectorPointX);
            const bisectorTangentDeltaX = Math.tan(bisectorAngleRaw) * (config.pageHeight - bisectorPointY);
            let foldLineTangentX = bisectorPointX + bisectorTangentDeltaX * (isFlippingLeftPage ? 1 : -1);

            // Clamp the fold line tangent X to be within the canvas boundaries
            foldLineTangentX = Math.max(0, Math.min(config.totalSpreadWidth, foldLineTangentX));

            // 5. Calculate the rotation angle for the flipping page
            const pageAngleDeltaY = foldLineTangentYCoordinate - pageFoldCornerY;
            const pageAngleDeltaX = foldLineTangentX - pageFoldCornerX;
            currentFoldAngleRadians = isFlippingLeftPage
                ? Math.atan2(-pageAngleDeltaY, -pageAngleDeltaX) // Invert deltas for left page perspective
                : Math.atan2(pageAngleDeltaY, pageAngleDeltaX);

            // 6. Calculate the center point for drawing the flipping page
            const pageDrawCenterX = pageFoldCornerX + config.pageWidth / 2 * Math.cos(currentFoldAngleRadians) * (isFlippingLeftPage ? -1 : 1)
                + config.pageHeight / 2 * Math.sin(currentFoldAngleRadians);
            const pageDrawCenterY = pageFoldCornerY - config.pageHeight / 2 * Math.cos(currentFoldAngleRadians)
                + config.pageWidth / 2 * Math.sin(currentFoldAngleRadians) * (isFlippingLeftPage ? -1 : 1);

            // 7. Calculate clipping mask angle and positions (Type III: Re-derived mask angle, explicit offsets)
            // The mask line is perpendicular to the bisector line
            const maskLineDx = bisectorPointX - foldLineTangentX;
            const maskLineDy = config.pageHeight - bisectorPointY;
            const maskRotationAngleRadians = Math.atan2(maskLineDy, maskLineDx) + (Math.PI / 2); // Perpendicular angle

            // Calculate where the clipping rectangle should be centered on the mask line
            const xCoefficient = foldLineTangentYCoordinate - bisectorPointY;
            const yCoefficient = bisectorPointX - foldLineTangentX;
            const freeCoefficient = foldLineTangentX * bisectorPointY - bisectorPointX * foldLineTangentYCoordinate;

            const maskCenterlineX = -(yCoefficient * config.pageHeight / 2 + freeCoefficient) / xCoefficient;
            const maskHalfOffset = config.clippingPanelWidth / 2 / Math.abs(Math.cos(maskRotationAngleRadians)); // Use abs cos for offset

            const primaryMaskOriginX = maskCenterlineX + maskHalfOffset * (isFlippingLeftPage ? 1 : -1);
            const primaryMaskOriginY = config.pageHeight / 2;

            // Position for the secondary clipping mask (revealing the page underneath)
            const secondaryMaskOriginX = primaryMaskOriginX + (isFlippingLeftPage ? -config.clippingPanelWidth : config.clippingPanelWidth);

            renderFlippingPage(pageDrawCenterX, pageDrawCenterY, currentFoldAngleRadians,
                primaryMaskOriginX, primaryMaskOriginY, maskRotationAngleRadians, secondaryMaskOriginX);
        };

        /**
         * Renders the dynamically flipping page and the page revealed underneath. (Type II: Renamed, Type III: Detailed comments, adjusted clipping rect)
         * @param {number} pageCenterX - X-coordinate of the center of the flipping page.
         * @param {number} pageCenterY - Y-coordinate of the center of the flipping page.
         * @param {number} pageRotationAngle - Rotation angle of the flipping page in radians.
         * @param {number} primaryMaskOriginX - X-coordinate for the primary clipping mask's origin.
         * @param {number} primaryMaskOriginY - Y-coordinate for the primary clipping mask's origin.
         * @param {number} maskRotationAngle - Rotation angle for the clipping masks in radians.
         * @param {number} secondaryMaskOriginX - X-coordinate for the secondary clipping mask's origin.
         */
        const renderFlippingPage = (pageCenterX, pageCenterY, pageRotationAngle, primaryMaskOriginX, primaryMaskOriginY, maskRotationAngle, secondaryMaskOriginX) => {
            clearOverlayDrawingCanvas();
            const config = this.activeConfiguration;

            // --- Draw the front side of the flipping page ---
            overlayContext.save();

            // 1. Apply primary clipping mask (defines the visible area of the folding page)
            overlayContext.translate(primaryMaskOriginX, primaryMaskOriginY + config.canvasVerticalPadding);
            overlayContext.rotate(maskRotationAngle);
            overlayContext.beginPath();
            overlayContext.rect(-config.clippingPanelWidth / 2, -config.clippingPanelHeight / 2, config.clippingPanelWidth, config.clippingPanelHeight);
            overlayContext.clip();

            // 2. Undo mask transforms to apply page-specific transforms correctly
            overlayContext.rotate(-maskRotationAngle);
            overlayContext.translate(-primaryMaskOriginX, -primaryMaskOriginY - config.canvasVerticalPadding);

            // 3. Apply flipping page's own transformations (translation and rotation)
            overlayContext.translate(pageCenterX, pageCenterY + config.canvasVerticalPadding);
            overlayContext.rotate(pageRotationAngle);

            // 4. Draw the content of the page that is currently flipping
            drawContentOnContext(overlayContext, getFlippingPageAsset(), -config.pageWidth / 2, -config.pageHeight / 2);

            overlayContext.restore(); // Restore context to remove the first clip path

            // --- Draw the page appearing underneath the flip ---
            overlayContext.save();

            // 1. Apply secondary clipping mask (defines the area of the next page that is revealed)
            overlayContext.translate(secondaryMaskOriginX, primaryMaskOriginY + config.canvasVerticalPadding);
            overlayContext.rotate(maskRotationAngle);
            overlayContext.beginPath();
            // Adjusted rect coordinates to be relative to the mask origin and centered vertically
            overlayContext.rect(0, -config.clippingPanelHeight / 2, config.clippingPanelWidth, config.clippingPanelHeight);
            overlayContext.clip();

            // 2. Undo mask transforms
            overlayContext.rotate(-maskRotationAngle);
            overlayContext.translate(-secondaryMaskOriginX, -primaryMaskOriginY - config.canvasVerticalPadding);

            // 3. Draw the content of the page that is currently appearing underneath
            drawContentOnContext(overlayContext, getAppearingPageAsset(), isFlippingLeftPage ? 0 : config.pageWidth, config.canvasVerticalPadding);

            overlayContext.restore(); // Restore context to remove the second clip path
        };

        /**
         * Starts the continuous animation loop using setTimeout. (Type II: Renamed, Type III: Wrapped in self-executing function)
         */
        const startAnimationLoop = () => {
            const animationLoopFn = () => {
                triggerCanvasRedraw();
                // Using setTimeout for consistency with original, though requestAnimationFrame is often preferred
                setTimeout(animationLoopFn, this.activeConfiguration.animationFrameIntervalMs);
            };
            animationLoopFn(); // Initiate the loop
        };

        /**
         * Triggers a redraw of the animated elements. (Type II: Renamed)
         */
        const triggerCanvasRedraw = () => {
            updateAnimationState();
        };

        /**
         * Initializes the page turner plugin by setting up canvases, loading images, and starting interaction. (Type II: Renamed, Type III: Added robust image loading and initialization checks)
         * @param {jQuery} elementToConvert - The jQuery wrapped element containing the image list.
         */
        this.initializePageTurner = (elementToConvert) => {
            if (folioContainer) { // Type III: Guard against re-initialization
                console.warn("DigitalPageTurner: Plugin already initialized for this element. Skipping re-initialization.");
                return;
            }

            setupCanvasElements(elementToConvert);
            initializeInteractionPoints();
            attachInteractionListeners();
            setupBlankPagePlaceholder(); // Prepare a default asset for blank pages

            // Load all image assets from the provided list items (Type III: Explicit image loading process)
            const imageElements = jQuery('li img', elementToConvert);
            totalDisplayablePages = imageElements.length;

            // Adjust total page count to always be even for spread display, adding a conceptual blank if needed
            if (totalDisplayablePages % 2 !== 0) {
                totalDisplayablePages++;
            }

            // Initialize loadedPageAssets array with blank placeholders
            loadedPageAssets = new Array(totalDisplayablePages).fill(blankPageAsset);

            // Iterate through image elements and preload their sources
            imageElements.each((index, imgDomElement) => {
                preloadPageImageAsset(index, jQuery(imgDomElement).attr('src'));
            });

            renderStaticBackgroundPages(); // Draw the initial visible pages
            startAnimationLoop(); // Begin the animation cycle
        };

        /**
         * Renders the static left and right background pages of the current spread. (Type II: Renamed, Type III: Clearer logic for handling blank/loading pages)
         */
        const renderStaticBackgroundPages = () => {
            const config = this.activeConfiguration;
            const leftVisiblePage = getVisibleLeftPageAsset();
            const rightVisiblePage = getVisibleRightPageAsset();

            // Clear the left side of the main canvas
            primaryContext.clearRect(0, config.canvasVerticalPadding, config.pageWidth, config.pageHeight);
            if (leftVisiblePage !== null && leftVisiblePage.isLoaded) {
                drawContentOnContext(primaryContext, leftVisiblePage, 0, config.canvasVerticalPadding);
            } else {
                // Draw default background if image is not loaded or not available
                primaryContext.fillStyle = config.defaultPageBackgroundColor;
                primaryContext.fillRect(0, config.canvasVerticalPadding, config.pageWidth, config.pageHeight);
            }

            // Clear the right side of the main canvas
            primaryContext.clearRect(config.pageWidth, config.canvasVerticalPadding, config.pageWidth, config.pageHeight);
            if (rightVisiblePage !== null && rightVisiblePage.isLoaded) {
                drawContentOnContext(primaryContext, rightVisiblePage, config.pageWidth, config.canvasVerticalPadding);
            } else {
                // Draw default background if image is not loaded or not available
                primaryContext.fillStyle = config.defaultPageBackgroundColor;
                primaryContext.fillRect(config.pageWidth, config.canvasVerticalPadding, config.pageWidth, config.pageHeight);
            }
        };

        /**
         * Draws an image asset or a fallback color rectangle onto a canvas context. (Type II: Renamed, Type III: Added robust checks and fallback)
         * @param {CanvasRenderingContext2D} ctx - The canvas 2D rendering context.
         * @param {object} asset - An object describing the page content (e.g., image, color).
         * @param {number} xCoord - The X-coordinate to draw the content.
         * @param {number} yCoord - The Y-coordinate to draw the content.
         */
        const drawContentOnContext = (ctx, asset, xCoord, yCoord) => {
            if (!ctx || !asset) { // Type III: Guard clause for invalid inputs
                return;
            }
            const config = this.activeConfiguration;

            if (asset.type === 'image' && asset.data instanceof Image && asset.isLoaded) {
                ctx.drawImage(asset.data, xCoord, yCoord, config.pageWidth, config.pageHeight);
            } else {
                // Fallback: draw a colored rectangle if the asset is not an image or not loaded
                ctx.fillStyle = config.defaultPageBackgroundColor;
                ctx.fillRect(xCoord, yCoord, config.pageWidth, config.pageHeight);
            }
        };

        /**
         * Preloads an image asset and updates its loading status. (Type III: New, explicit image preloading)
         * @param {number} index - The target index in the `loadedPageAssets` array.
         * @param {string} sourceUrl - The URL of the image to load.
         */
        const preloadPageImageAsset = (index, sourceUrl) => {
            const newImage = new Image();
            loadedPageAssets[index] = { type: 'image', data: newImage, isLoaded: false, src: sourceUrl }; // Store asset object

            newImage.onload = () => {
                loadedPageAssets[index].isLoaded = true;
                // If the loaded image is part of the currently visible spread, re-render
                if (index === activePageIndex || index === activePageIndex + 1) {
                    renderStaticBackgroundPages();
                }
            };
            newImage.onerror = () => {
                console.warn(`DigitalPageTurner: Failed to load image for page ${index} from ${sourceUrl}`);
                loadedPageAssets[index].isLoaded = false; // Mark as failed to load
                // The drawContentOnContext will handle fallback to blank page
            };
            newImage.src = sourceUrl;
        };

        /**
         * Creates and sets the default blank page asset. (Type III: New, explicit placeholder setup)
         */
        const setupBlankPagePlaceholder = () => {
            blankPageAsset = {
                type: 'color', // Indicates it's a color fill, not an image
                data: null, // No actual Image object
                isLoaded: true // A color is always 'loaded'
            };
        };

        /**
         * Retrieves the asset for the page that is currently being visually flipped. (Type II: Renamed, Type III: Logic for left/right flip)
         * @returns {object} The asset object for the flipping page.
         */
        const getFlippingPageAsset = () => {
            const indexToRetrieve = isFlippingLeftPage ? activePageIndex : activePageIndex + 1;
            return loadedPageAssets[indexToRetrieve] || blankPageAsset;
        };

        /**
         * Retrieves the asset for the page that is being revealed underneath the flip. (Type II: Renamed, Type III: Logic for left/right flip)
         * @returns {object} The asset object for the appearing page.
         */
        const getAppearingPageAsset = () => {
            const indexToRetrieve = isFlippingLeftPage ? activePageIndex - 1 : activePageIndex + 2;
            return loadedPageAssets[indexToRetrieve] || blankPageAsset;
        };

        /**
         * Retrieves the asset for the statically displayed left page of the current spread. (Type II: Renamed)
         * @returns {object} The asset object for the left static page.
         */
        const getVisibleLeftPageAsset = () => {
            return loadedPageAssets[activePageIndex] || blankPageAsset;
        };

        /**
         * Retrieves the asset for the statically displayed right page of the current spread. (Type II: Renamed)
         * @returns {object} The asset object for the right static page.
         */
        const getVisibleRightPageAsset = () => {
            return loadedPageAssets[activePageIndex + 1] || blankPageAsset;
        };

        // --- Initialize the plugin instance ---
        this.initializePageTurner(targetElement);
    }

    // --- jQuery Plugin Definition ---
    jQuery.fn.digitalPageTurner = function (options) { // Type II: Renamed plugin name
        return this.each(function () {
            // Prevent multiple initializations on the same DOM element (Type III: Added check)
            if (!jQuery.data(this, 'plugin_digitalPageTurner')) {
                jQuery.data(this, 'plugin_digitalPageTurner', new DigitalPageTurner(jQuery(this), options));
            }
        });
    };

})(jQuery);