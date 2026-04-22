/*
 * SwirlSlider - Version: 1.0.0
 * http://example.com/swirlslider
 * Copyright (c) 2023 Acme Corp; Licensed: MIT
 * Requires: jQuery v1.9 or later
 * Author: AI Assistant
 */
(function($) {
    "use strict"; // Enforce stricter parsing and error handling

    // Ensure jQuery is loaded
    if (typeof $ === 'undefined') {
        console.error("SwirlSlider requires jQuery to be loaded.");
        return;
    }

    $.fn.swirlSlider = function(userOptions) {
        // Default configuration for the slider behavior
        var initialConfig = {
            slideUnitCls: 'swirl-slide-unit',
            slideMediaCls: 'swirl-slide-media',
            slideContainerCls: 'swirl-slides-container',
            navDotCls: 'swirl-nav-dot',
            nextBtnCls: 'swirl-nav-next',
            prevBtnCls: 'swirl-nav-prev',
            currentCls: 'is-current',
            clippedCls: 'is-clipped',
            resizedCls: 'is-resized',
            unitSpacingMode: 'css', // 'css' or a pixel value
            transitionDurationMs: 750,
            itemAlignment: 'center', // 'left', 'center', 'right'
            virtualCopiesCount: 1, // Number of virtual sets on each side for infinite loop
            heightDetermination: 'auto', // 'shortest', 'tallest', 'fixed_value'
            resizeStrategy: 'clipped', // 'clipped' or 'resized'
            debugMode: false // Enable verbose logging
        };

        // Merge user-provided options with the default configuration
        var currentConfig = $.extend({}, initialConfig, userOptions);

        // Iterate over each selected element to initialize a slider
        return this.each(function() {
            var $sliderContainer = $(this);

            // If the container is already initialized, skip
            if ($sliderContainer.data('swirl-initialized')) {
                if (currentConfig.debugMode) {
                    console.log('SwirlSlider: Skipping already initialized container.', $sliderContainer[0]);
                }
                return;
            }
            $sliderContainer.data('swirl-initialized', true);

            // --- Class & Attribute Constants ---
            var SLIDE_UNIT_CLASS = currentConfig.slideUnitCls;
            var BASE_UNIT_CLASS = SLIDE_UNIT_CLASS + '-base'; // Original items class
            var MEDIA_ELEMENT_CLASS = currentConfig.slideMediaCls;
            var SLIDES_WRAPPER_CLASS = currentConfig.slideContainerCls;
            var NAV_DOT_CLASS = currentConfig.navDotCls;
            var ACTIVE_STATE_CLASS = currentConfig.currentCls;
            var CROPPED_STATE_CLASS = currentConfig.clippedCls;
            var SCALED_STATE_CLASS = currentConfig.resizedCls;
            var VIDEO_PLACEHOLDER_CLASS = 'swirl-vid-placeholder';
            var VIDEO_MEDIA_CLASS = 'swirl-vid-active';
            var VISIBLE_UNIT_CLASS = 'swirl-unit-visible';
            var UNIT_INDEX_PREFIX = SLIDE_UNIT_CLASS + '-idx-'; // Prefix for item index class

            var ASPECT_RATIO_ATTR = 'data-aspect-ratio'; // Attribute for storing original aspect ratio
            var UNIT_NUMBER_ATTR = 'data-unit-number'; // Attribute for storing item's original index

            // --- jQuery Cached Selectors ---
            var $allSlideUnits = $sliderContainer.find(`.${SLIDE_UNIT_CLASS}`);
            var $baseSlideUnits; // Will be set after cloning
            var $navigationDots = $sliderContainer.next().find(`.${NAV_DOT_CLASS}`);
            var $activeNavigationDot;
            var $slidesWrapper = $sliderContainer.children(`.${SLIDES_WRAPPER_CLASS}`);
            var $currentActiveUnit;
            var $nextControl = $sliderContainer.find(`.${currentConfig.nextBtnCls}`);
            var $prevControl = $sliderContainer.find(`.${currentConfig.prevBtnCls}`);

            // --- State Booleans ---
            var isRetinaDisplay = false;
            var isTransitioning = false;
            var hasBeenClipped = false;
            var hasBeenResized = false;
            var hasThumbNavigation = false;
            var isSliderReady = false; // Flag to indicate initial setup is complete

            // --- Dimensional & Positional Integers ---
            var currentWindowHeight;
            var currentWindowWidth;
            var sliderViewportWidth = 0;
            var fullSetWidth = 0;
            var individualUnitWidth = 0;
            var individualUnitHeight = 0;
            var sliderViewportHeight = 0;
            var slidesWrapperTotalWidth = 0;
            var totalOriginalItems = -1; // Count of items in the original set (0-indexed)
            var currentTransitionOffset = 0;
            var finalAnimationTarget = 0;
            var currentActiveUnitIndex = 0;
            var alignmentCorrectionValue = 0;
            var firstUnitAlignmentOffset = 0;
            var lastUnitAlignmentOffset = 0;
            var loadedImageCount = 0;
            var virtualSetsEachSide = currentConfig.virtualCopiesCount;
            var effectiveSliderHeight = 0;
            var unitSpacing = currentConfig.unitSpacingMode;
            var animationSpeedMs = currentConfig.transitionDurationMs;

            // --- Miscellaneous ---
            var baseMarkupStore; // Stores the HTML of the original slide units
            var heightPolicy = currentConfig.heightDetermination;
            var resizePolicy = currentConfig.resizeStrategy;

            // --- Data Structures ---
            var unitDimensionData = []; // Array to store dimensions and positions of each unit

            /*========================================================================
            =            Initial Setup Procedures            =
            ========================================================================*/
            if (currentConfig.debugMode) {
                console.log('SwirlSlider: Initializing slider on', $sliderContainer[0]);
            }

            // Step 1: Detect display characteristics
            determineDisplayDensity();
            // Step 2: Convert unit spacing if needed
            normalizeUnitSpacing();
            // Step 3: Check for thumbnail navigation presence
            verifyThumbnailNav();
            // Step 4: Prepare height calculation
            resetSliderHeightReference();
            // Step 5: Process initial video elements
            assignVideoMediaClass();
            // Step 6: Apply base styling to original items
            applyBaseUnitStyling();
            // Step 7: Process original items for dimensions and data
            processOriginalSlides();
            // Step 8: Measure the slider's container
            measureSliderViewport();
            // Step 9: Initialize video elements (after dimensions are known)
            initializeVideoElements();
            // Step 10: Calculate dimensions for all items (including clones)
            recalculateItemDimensions();
            // Step 11: Adjust video scaling
            adjustVideoScaling();
            // Step 12: Cache the original slides' HTML for cloning
            cacheOriginalMarkup();

            // Step 13: Create virtual copies for infinite loop effect
            for (var i = 0; i < virtualSetsEachSide; i++) {
                addVirtualSet('prepend'); // Add to the beginning
                addVirtualSet('append'); // Add to the end
            }

            // Step 14: Refresh unit references after cloning
            updateSlideUnitReferences();
            // Step 15: Set the overall slider height
            setOverallSliderHeight();
            // Step 16: Position slider to the starting point
            navigateToStartPoint();
            // Step 17: Set up click handlers for thumbnail/dot navigation
            setupThumbnailNavigation();
            // Step 18: Set up click handlers for next/prev controls
            setupDirectionalControls();
            // Step 19: Make the slider visible
            revealSliderContent();

            isSliderReady = true;

            /*========================================================================
            =            Responsive Design Handling            =
            ========================================================================*/

            // Listen for window resize events
            var resizeHandler = function() {
                $(window).one("resize", function() {
                    // Check for actual dimension changes to prevent unnecessary recalculations
                    var newWindowHeight = window.innerHeight || $(window).height();
                    var newWindowWidth = $(window).width();

                    if (newWindowWidth !== currentWindowWidth || newWindowHeight !== currentWindowHeight) {
                        fetchDisplayMetrics(); // Update global window dimensions
                        measureSliderViewport(); // Update slider container dimensions
                        recalculateItemDimensions(); // Recalculate all slide dimensions
                        adjustVideoScaling(); // Re-scale videos
                        setOverallSliderHeight(); // Re-set slider height
                        updateSlidesWrapperDimensions(); // Adjust wrapper width
                        determineAnimationOffset(currentActiveUnitIndex); // Recalculate target position
                        executeAnimation(0); // Jump to position instantly
                    }
                    // Re-bind the listener after a short delay to debounce
                    setTimeout(resizeHandler, 150);
                });
            };
            fetchDisplayMetrics(); // Initial call to set dimensions
            resizeHandler(); // Start the resize listener

            /*========================================================================
            =            Core Utility Functions            =
            ========================================================================*/

            /**
             * Updates global window height and width variables.
             */
            function fetchDisplayMetrics() {
                currentWindowHeight = window.innerHeight || $(window).height();
                currentWindowWidth = $(window).width();
                if (currentConfig.debugMode) {
                    console.log(`SwirlSlider: Window dimensions updated: ${currentWindowWidth}x${currentWindowHeight}`);
                }
            }

            /**
             * Checks if thumbnail navigation elements exist.
             */
            function verifyThumbnailNav() {
                if ($sliderContainer.find(`.${NAV_DOT_CLASS}`).length > 0) {
                    hasThumbNavigation = true;
                    if (currentConfig.debugMode) {
                        console.log('SwirlSlider: Thumbnail navigation detected.');
                    }
                }
            }

            /**
             * Updates the jQuery collection of slide units.
             */
            function updateSlideUnitReferences() {
                $allSlideUnits = $sliderContainer.find(`.${SLIDE_UNIT_CLASS}`);
            }

            /**
             * Adds the media class to iframe elements within slides.
             */
            function assignVideoMediaClass() {
                $allSlideUnits.find('iframe').addClass(MEDIA_ELEMENT_CLASS);
            }

            /**
             * Initializes video scaling for all iframes.
             */
            function initializeVideoElements() {
                $allSlideUnits.find('iframe').each(function() {
                    var $videoFrame = $(this);
                    scaleVideoElement($videoFrame, true); // true for initial setup
                });
            }

            /**
             * Re-scales video elements based on current slider dimensions.
             */
            function adjustVideoScaling() {
                $baseSlideUnits.each(function(index) {
                    var $baseItem = $(this);
                    var $videoFrame = $baseItem.find('iframe');
                    if ($videoFrame.length) {
                        // Find the corresponding video in the currently active clone set
                        // This logic needs to be robust for multiple clones.
                        // For simplicity, we adjust based on the base unit's video,
                        // assuming all clones will have similar styling applied by CSS.
                        // A more precise implementation would target all visible clones.
                        var $adjustedItem = $sliderContainer.find(`.${UNIT_INDEX_PREFIX}${index}`);
                        $videoFrame = $adjustedItem.find('iframe');
                        scaleVideoElement($videoFrame);
                    }
                });
            }

            /**
             * Scales a given video iframe to fit the slider height while maintaining aspect ratio.
             * @param {jQuery} $videoFrame - The iframe element to scale.
             * @param {boolean} isInitial - True if this is the first time scaling this video.
             */
            function scaleVideoElement($videoFrame, isInitial) {
                var videoAspectRatio = parseFloat($videoFrame.attr(ASPECT_RATIO_ATTR));
                if (isNaN(videoAspectRatio) || videoAspectRatio === 0) {
                    // If aspect ratio not set, calculate it.
                    var frameWidth = parseInt($videoFrame.attr('width'), 10);
                    var frameHeight = parseInt($videoFrame.attr('height'), 10);
                    if (frameWidth && frameHeight) {
                        videoAspectRatio = frameWidth / frameHeight;
                        $videoFrame.attr(ASPECT_RATIO_ATTR, videoAspectRatio.toFixed(3));
                    } else {
                        // Fallback: assume common 16:9 if no dimensions provided
                        videoAspectRatio = 16 / 9;
                        $videoFrame.attr(ASPECT_RATIO_ATTR, videoAspectRatio.toFixed(3));
                        if (currentConfig.debugMode) {
                            console.warn('SwirlSlider: Video element missing dimensions, assuming 16:9 aspect ratio.', $videoFrame[0]);
                        }
                    }
                }

                var newVideoWidth = Math.round(effectiveSliderHeight * videoAspectRatio);
                $videoFrame.attr('height', effectiveSliderHeight);
                $videoFrame.attr('width', newVideoWidth);

                if (isInitial) {
                    createVideoPlaceholder($videoFrame, newVideoWidth);
                }
            }

            /**
             * Stops playback of a video when its slide is no longer active.
             * @param {jQuery} $slideElement - The slide container element.
             * @param {number} slideIndex - The index of the slide.
             */
            function pauseVideoPlayback($slideElement, slideIndex) {
                // Prevent resetting video if it's the current active slide (e.g., on resize)
                if (slideIndex !== currentActiveUnitIndex) {
                    var $videoFrame = $slideElement.find('iframe');
                    if ($videoFrame.length) {
                        // Resetting src attribute effectively stops and reloads the video
                        var videoSource = $videoFrame.attr('src');
                        if (videoSource) { // Ensure src exists before attempting to reset
                            $videoFrame.attr('src', '');
                            $videoFrame.attr('src', videoSource);
                            if (currentConfig.debugMode) {
                                console.log('SwirlSlider: Paused video on slide', slideIndex);
                            }
                        }
                    }
                }
            }

            /**
             * Creates an invisible placeholder for video elements to help with layout.
             * @param {jQuery} $videoFrame - The iframe element.
             * @param {number} placeholderWidth - The calculated width for the placeholder.
             */
            function createVideoPlaceholder($videoFrame, placeholderWidth) {
                var placeholderHtml = `<div style="width:${placeholderWidth}px; height:${effectiveSliderHeight}px;" class="${VIDEO_PLACEHOLDER_CLASS}"></div>`;
                $videoFrame
                    .before(placeholderHtml)
                    .addClass(VIDEO_MEDIA_CLASS);
            }

            /**
             * Resets the effective slider height based on the configured height policy.
             */
            function resetSliderHeightReference() {
                if (heightPolicy === 'shortest') {
                    effectiveSliderHeight = 99999; // Start with a very large number
                } else if (heightPolicy === 'tallest') {
                    effectiveSliderHeight = 0; // Start with zero
                } else if (typeof heightPolicy === 'number') {
                    effectiveSliderHeight = heightPolicy; // Fixed height
                } else {
                    // Default to auto (tallest) or a sensible fallback
                    effectiveSliderHeight = 0;
                    if (currentConfig.debugMode) {
                        console.warn('SwirlSlider: Invalid heightDetermination, defaulting to tallest.');
                    }
                }
            }

            /**
             * Applies initial styling and class to original carousel items.
             */
            function applyBaseUnitStyling() {
                $allSlideUnits.addClass(BASE_UNIT_CLASS);
                $baseSlideUnits = $sliderContainer.find(`.${BASE_UNIT_CLASS}`);

                // Apply spacing if not handled by CSS
                if (unitSpacing !== 'css') {
                    $baseSlideUnits.css({
                        'margin-right': unitSpacing + 'px'
                    });
                }
            }

            /**
             * Designates a slide as the current active item.
             * @param {jQuery} $itemToActivate - The slide unit to set as active.
             */
            function designateCurrentItem($itemToActivate) {
                if (!$itemToActivate || $itemToActivate.length === 0) {
                    if (currentConfig.debugMode) {
                        console.warn('SwirlSlider: Attempted to activate a non-existent item.');
                    }
                    return;
                }
                $currentActiveUnit = $itemToActivate;
                $currentActiveUnit.siblings().removeClass(ACTIVE_STATE_CLASS);
                $currentActiveUnit.addClass(ACTIVE_STATE_CLASS);
                currentActiveUnitIndex = parseInt($currentActiveUnit.attr(UNIT_NUMBER_ATTR), 10);

                if (hasThumbNavigation) {
                    $navigationDots.removeClass(ACTIVE_STATE_CLASS);
                    $navigationDots.eq(currentActiveUnitIndex).addClass(ACTIVE_STATE_CLASS);
                }
                if (currentConfig.debugMode) {
                    console.log('SwirlSlider: Active unit set to index', currentActiveUnitIndex);
                }
            }

            /**
             * Positions the slider to the first item on initialization.
             */
            function navigateToStartPoint() {
                var $firstUnit = $sliderContainer.find(`.${SLIDE_UNIT_CLASS}`).first();
                designateCurrentItem($firstUnit);
                determineAnimationOffset(0); // Calculate target for the first item
                executeAnimation(0); // Jump to position instantly
            }

            /**
             * Initiates an animated transition to a specific slide.
             * @param {number} targetUnitIndex - The index of the unit to navigate to.
             * @param {string} [direction] - 'forwards' or 'backwards' for virtual cloning logic.
             */
            function animateSliderTransition(targetUnitIndex, direction) {
                if (isTransitioning) {
                    if (currentConfig.debugMode) {
                        console.log('SwirlSlider: Transition already in progress, ignoring new request.');
                    }
                    return;
                }
                determineAnimationOffset(targetUnitIndex, direction);
                executeAnimation(animationSpeedMs);
            }

            /**
             * Calculates the `left` CSS value for the slides wrapper to position the active item.
             * @param {number} targetUnitIndex - The index of the unit to make active.
             * @param {string} [direction] - 'forwards' or 'backwards' for virtual cloning logic.
             */
            function determineAnimationOffset(targetUnitIndex, direction) {
                var $previousActiveUnit = $currentActiveUnit;
                var previousActiveUnitIndex = currentActiveUnitIndex;
                var currentUnitStartPos = 0; // Position from the start of the original set

                // --- Handle virtual cloning for infinite loop effect ---
                // If moving forwards past the last item of the original set
                if (direction === 'forwards' && previousActiveUnitIndex === totalOriginalItems) {
                    designateCurrentItem($baseSlideUnits.first()); // Set active to the first base item
                    calculateAlignmentShift('last'); // Calculate alignment for the last item (before jump)
                    jumpToVirtualEnd(); // Instantly jump to the start of the virtual set
                    currentTransitionOffset = (-fullSetWidth * virtualSetsEachSide);
                    finalAnimationTarget = (-fullSetWidth * virtualSetsEachSide) + alignmentCorrectionValue;
                    if (currentConfig.debugMode) {
                        console.log('SwirlSlider: Virtual jump forwards from end.');
                    }
                }
                // If moving backwards before the first item of the original set
                else if (direction === 'backwards' && previousActiveUnitIndex === 0) {
                    designateCurrentItem($baseSlideUnits.last()); // Set active to the last base item
                    calculateAlignmentShift('first'); // Calculate alignment for the first item (before jump)
                    jumpToVirtualStart(); // Instantly jump to the end of the virtual set
                    currentTransitionOffset = -fullSetWidth - (fullSetWidth * virtualSetsEachSide) + unitDimensionData[totalOriginalItems].unitWidth;
                    finalAnimationTarget = currentTransitionOffset + alignmentCorrectionValue;
                    if (currentConfig.debugMode) {
                        console.log('SwirlSlider: Virtual jump backwards from start.');
                    }
                }
                // Standard navigation within the cloned sets
                else {
                    if (targetUnitIndex > 0) {
                        currentUnitStartPos = unitDimensionData[targetUnitIndex - 1].unitOffsetFromStart;
                    }
                    // Assign the new active item (find it among all slides, including clones)
                    designateCurrentItem($sliderContainer.find(`.${BASE_UNIT_CLASS}.${UNIT_INDEX_PREFIX}${targetUnitIndex}`));
                    calculateAlignmentShift(); // Calculate alignment for the new active item
                    currentTransitionOffset = -(currentUnitStartPos + (fullSetWidth * virtualSetsEachSide));
                    finalAnimationTarget = currentTransitionOffset + alignmentCorrectionValue;
                }
                pauseVideoPlayback($previousActiveUnit, previousActiveUnitIndex); // Stop video on the previous active slide
            }

            /**
             * Calculates the pixel offset needed to align the active item based on `itemAlignment`.
             * @param {string} [specialCase] - 'first' or 'last' for calculating alignment for boundary items.
             */
            function calculateAlignmentShift(specialCase) {
                var currentUnitWidth = unitDimensionData[currentActiveUnitIndex].unitWidth;
                var alignmentTargetWidth = sliderViewportWidth;

                if (currentConfig.itemAlignment === 'center') {
                    alignmentCorrectionValue = (alignmentTargetWidth / 2) - (currentUnitWidth / 2);
                    if (specialCase === 'first') {
                        firstUnitAlignmentOffset = (alignmentTargetWidth / 2) - (unitDimensionData[0].unitWidth / 2);
                    } else if (specialCase === 'last') {
                        lastUnitAlignmentOffset = (alignmentTargetWidth / 2) - (unitDimensionData[totalOriginalItems].unitWidth / 2);
                    }
                } else if (currentConfig.itemAlignment === 'right') {
                    alignmentCorrectionValue = alignmentTargetWidth - currentUnitWidth;
                    if (specialCase === 'first') {
                        firstUnitAlignmentOffset = alignmentTargetWidth - unitDimensionData[0].unitWidth;
                    } else if (specialCase === 'last') {
                        lastUnitAlignmentOffset = alignmentTargetWidth - unitDimensionData[totalOriginalItems].unitWidth;
                    }
                } else { // 'left' or default
                    alignmentCorrectionValue = 0;
                    firstUnitAlignmentOffset = 0;
                    lastUnitAlignmentOffset = 0;
                }
            }

            /**
             * Instantly jumps the slides wrapper to the position corresponding to the last item
             * in the virtual set preceding the original set. This maintains the illusion of infinite scrolling.
             */
            function jumpToVirtualEnd() {
                // This position is effectively the end of the cloned set that appears before the original set
                var targetPosition = -fullSetWidth + unitDimensionData[totalOriginalItems].unitWidth + lastUnitAlignmentOffset;
                $slidesWrapper.css({
                    'left': targetPosition + 'px'
                });
                if (currentConfig.debugMode) {
                    console.log('SwirlSlider: Instant jump to virtual end at', targetPosition);
                }
            }

            /**
             * Instantly jumps the slides wrapper to the position corresponding to the first item
             * in the virtual set following the original set. This maintains the illusion of infinite scrolling.
             */
            function jumpToVirtualStart() {
                // This position is effectively the start of the cloned set that appears after the original set
                var targetPosition = -fullSetWidth - (fullSetWidth * virtualSetsEachSide) + firstUnitAlignmentOffset;
                $slidesWrapper.css({
                    'left': targetPosition + 'px'
                });
                if (currentConfig.debugMode) {
                    console.log('SwirlSlider: Instant jump to virtual start at', targetPosition);
                }
            }

            /**
             * Executes the animation of the slides wrapper to its final calculated position.
             * @param {number} customDuration - The duration of the animation in milliseconds. 0 for instant jump.
             */
            function executeAnimation(customDuration) {
                isTransitioning = true;
                var duration = typeof customDuration !== 'undefined' ? customDuration : animationSpeedMs;

                var animationProperties = {
                    'left': finalAnimationTarget + 'px'
                };

                if (duration === 0) {
                    $slidesWrapper.css(animationProperties);
                    handleTransitionEnd(); // Manually call end handler for instant transitions
                } else {
                    $slidesWrapper.stop(true, false).animate(animationProperties, duration, 'swing', handleTransitionEnd);
                }
                if (currentConfig.debugMode) {
                    console.log('SwirlSlider: Executing animation to', finalAnimationTarget, 'with duration', duration);
                }
            }

            /**
             * Callback function executed after an animation completes.
             */
            function handleTransitionEnd() {
                isTransitioning = false;
                if (currentConfig.debugMode) {
                    console.log('SwirlSlider: Animation complete.');
                }
                // Any post-animation tasks can go here (e.g., triggering custom events)
            }

            /**
             * Processes each original slide unit to gather initial data and load images.
             */
            function processOriginalSlides() {
                $baseSlideUnits.each(function() {
                    var $unit = $(this);
                    var $mediaElement = $unit.find(`.${MEDIA_ELEMENT_CLASS}`);
                    assignSlideIndex($unit, totalOriginalItems += 1); // Assign an index (0-based)
                    storeItemAspectRatio($unit, $mediaElement); // Store aspect ratio
                    preloadVisuals($unit); // Load images
                    // Update effective slider height based on policy
                    if (heightPolicy === 'shortest' || heightPolicy === 'tallest') {
                        updateEffectiveSliderHeight($unit);
                    }
                });
            }

            /**
             * Stores the aspect ratio of a media item in a data attribute.
             * @param {jQuery} $containerItem - The parent slide unit.
             * @param {jQuery} $mediaElement - The media element (img or iframe).
             */
            function storeItemAspectRatio($containerItem, $mediaElement) {
                var itemRatio;
                if ($mediaElement.is('img')) {
                    // For images, use natural dimensions if available, fallback to attr
                    var naturalWidth = $mediaElement[0].naturalWidth;
                    var naturalHeight = $mediaElement[0].naturalHeight;
                    if (naturalWidth && naturalHeight) {
                        itemRatio = naturalWidth / naturalHeight;
                    } else if ($mediaElement.attr('width') && $mediaElement.attr('height')) {
                        itemRatio = parseInt($mediaElement.attr('width'), 10) / parseInt($mediaElement.attr('height'), 10);
                    } else {
                        // Fallback: If no dimensions, assume 16:9 or use container's ratio
                        itemRatio = $containerItem.width() / $containerItem.height() || (16 / 9);
                        if (currentConfig.debugMode) {
                            console.warn('SwirlSlider: Image element missing dimensions, using container ratio or 16:9 fallback.', $mediaElement[0]);
                        }
                    }
                } else if ($mediaElement.is('iframe')) {
                    // For iframes, try to get from attributes or assume 16:9
                    if ($mediaElement.attr('width') && $mediaElement.attr('height')) {
                        itemRatio = parseInt($mediaElement.attr('width'), 10) / parseInt($mediaElement.attr('height'), 10);
                    } else {
                        itemRatio = 16 / 9; // Common video aspect ratio
                        if (currentConfig.debugMode) {
                            console.warn('SwirlSlider: Iframe element missing dimensions, assuming 16:9 aspect ratio.', $mediaElement[0]);
                        }
                    }
                } else {
                    // For other elements, use container's ratio
                    itemRatio = $containerItem.width() / $containerItem.height();
                }

                if (itemRatio && !isNaN(itemRatio)) {
                    $mediaElement.attr(ASPECT_RATIO_ATTR, itemRatio.toFixed(3));
                } else {
                    $mediaElement.attr(ASPECT_RATIO_ATTR, (16 / 9).toFixed(3)); // Default fallback
                    if (currentConfig.debugMode) {
                        console.warn('SwirlSlider: Could not determine aspect ratio for media element, defaulting to 16:9.', $mediaElement[0]);
                    }
                }
            }

            /**
             * Assigns a unique data attribute and class to each slide unit based on its index.
             * @param {jQuery} $unitElement - The slide unit element.
             * @param {number} index - The index to assign.
             */
            function assignSlideIndex($unitElement, index) {
                $unitElement.attr(UNIT_NUMBER_ATTR, index);
                $unitElement.addClass(`${UNIT_INDEX_PREFIX}${index}`);
            }

            /**
             * Loads images for a given slide unit, handling retina displays.
             * @param {jQuery} $unitElement - The slide unit element containing the image.
             */
            function preloadVisuals($unitElement) {
                var $img = $unitElement.find(`img.${MEDIA_ELEMENT_CLASS}`);
                if ($img.length === 0) return;

                var hiResSrc = $img.attr('data-src-2x');
                var lowResSrc = $img.attr('data-src');
                var finalSrc = lowResSrc;

                if (isRetinaDisplay && hiResSrc) {
                    finalSrc = hiResSrc;
                } else if (!lowResSrc && hiResSrc) {
                    finalSrc = hiResSrc; // Use 2x if 1x is missing
                } else if (!lowResSrc && !hiResSrc) {
                    if (currentConfig.debugMode) {
                        console.warn('SwirlSlider: Image element missing data-src attributes.', $img[0]);
                    }
                    return; // No image source to load
                }

                // Create a temporary image to check if src is valid before setting
                $('<img>').attr('src', finalSrc).on('load error', function(e) {
                    if (e.type === 'load') {
                        $img.attr('src', finalSrc);
                        $img.removeAttr('data-src').removeAttr('data-src-2x');
                        if (currentConfig.debugMode) {
                            console.log('SwirlSlider: Image loaded:', finalSrc);
                        }
                    } else {
                        if (currentConfig.debugMode) {
                            console.error('SwirlSlider: Failed to load image:', finalSrc, $img[0]);
                        }
                        // Fallback to lowResSrc if hiResSrc failed, or a placeholder
                        if (isRetinaDisplay && hiResSrc === finalSrc && lowResSrc) {
                            $img.attr('src', lowResSrc);
                            $img.removeAttr('data-src').removeAttr('data-src-2x');
                            if (currentConfig.debugMode) {
                                console.log('SwirlSlider: Falling back to low-res image:', lowResSrc);
                            }
                        }
                    }
                });
            }

            /**
             * Caches the HTML content of the original slides wrapper.
             */
            function cacheOriginalMarkup() {
                baseMarkupStore = $slidesWrapper.html();
                // Remove the base unit class from the cached markup to avoid duplication issues
                baseMarkupStore = baseMarkupStore.replace(new RegExp(` ${BASE_UNIT_CLASS}`, 'g'), '');
            }

            /**
             * Recalculates dimensions and positions for all slide items, including cloned ones.
             */
            function recalculateItemDimensions() {
                unitDimensionData = []; // Clear previous data
                fullSetWidth = 0; // Reset full set width

                // Reset height if policy requires re-evaluation
                if ((heightPolicy === 'shortest' && hasBeenResized) || (heightPolicy === 'tallest' && hasBeenResized)) {
                    resetSliderHeightReference();
                }

                // First pass: Calculate individual item widths and update effective slider height
                $baseSlideUnits.each(function(index) {
                    var $item = $(this);
                    // Ensure item is visible to get correct dimensions
                    $item.css({ 'visibility': 'hidden', 'display': 'block' });
                    individualUnitWidth = $item.outerWidth(true); // Includes margin
                    individualUnitHeight = $item.outerHeight(true);

                    // Store dimensions for original items
                    unitDimensionData[index] = {
                        unitWidth: individualUnitWidth,
                        unitHeight: individualUnitHeight,
                        unitOffsetFromStart: fullSetWidth // This will be the start position of this item
                    };

                    fullSetWidth += individualUnitWidth; // Accumulate total width of one set

                    // Re-evaluate effective slider height if policy is dynamic
                    if (heightPolicy === 'shortest') {
                        effectiveSliderHeight = Math.min(effectiveSliderHeight, individualUnitHeight);
                    } else if (heightPolicy === 'tallest') {
                        effectiveSliderHeight = Math.max(effectiveSliderHeight, individualUnitHeight);
                    }
                    $item.css({ 'visibility': '', 'display': '' }); // Reset visibility
                });

                // Second pass: Adjust item widths based on resize strategy if height is fixed
                if (heightPolicy !== 'auto' && resizePolicy === 'resized') {
                    $baseSlideUnits.each(function(index) {
                        var $item = $(this);
                        var $media = $item.find(`.${MEDIA_ELEMENT_CLASS}`);
                        var aspectRatio = parseFloat($media.attr(ASPECT_RATIO_ATTR));

                        if (aspectRatio && effectiveSliderHeight > 0) {
                            var newWidth = Math.round(effectiveSliderHeight * aspectRatio);
                            $item.width(newWidth); // Set new width
                            unitDimensionData[index].unitWidth = newWidth + (unitSpacing !== 'css' ? parseInt(unitSpacing, 10) : 0); // Update stored width
                        }
                    });
                    // Recalculate fullSetWidth after width adjustments
                    fullSetWidth = 0;
                    for (var i = 0; i <= totalOriginalItems; i++) {
                        fullSetWidth += unitDimensionData[i].unitWidth;
                    }
                    hasBeenResized = true;
                } else if (resizePolicy === 'clipped') {
                    hasBeenClipped = true;
                }

                if (currentConfig.debugMode) {
                    console.log('SwirlSlider: Item dimensions recalculated. Full set width:', fullSetWidth, 'Effective height:', effectiveSliderHeight);
                }
            }

            /**
             * Determines if the current display is retina (high-DPI).
             */
            function determineDisplayDensity() {
                if (window.matchMedia) {
                    var mq = window.matchMedia("(-webkit-min-device-pixel-ratio: 1.5), (min--moz-device-pixel-ratio: 1.5), (-o-min-device-pixel-ratio: 3/2), (min-device-pixel-ratio: 1.5), (min-resolution: 1.5dppx)");
                    isRetinaDisplay = (mq && mq.matches);
                } else if (window.devicePixelRatio && window.devicePixelRatio > 1) {
                    isRetinaDisplay = true;
                }
                if (currentConfig.debugMode) {
                    console.log('SwirlSlider: Retina display detected:', isRetinaDisplay);
                }
            }

            /**
             * Converts the unit spacing setting if it's a number.
             */
            function normalizeUnitSpacing() {
                if (typeof unitSpacing === 'number' && unitSpacing >= 0) {
                    // Already a number, nothing to do
                } else if (typeof unitSpacing === 'string' && !isNaN(parseInt(unitSpacing, 10))) {
                    unitSpacing = parseInt(unitSpacing, 10);
                } else {
                    unitSpacing = 'css'; // Default to CSS handling
                    if (currentConfig.debugMode) {
                        console.warn('SwirlSlider: Invalid unitSpacing, defaulting to "css".');
                    }
                }
            }

            /**
             * Measures the width and height of the main slider container viewport.
             */
            function measureSliderViewport() {
                sliderViewportWidth = $sliderContainer.width();
                sliderViewportHeight = $sliderContainer.height(); // May be 0 if height is dynamic
                if (currentConfig.debugMode) {
                    console.log('SwirlSlider: Slider viewport dimensions:', sliderViewportWidth, 'x', sliderViewportHeight);
                }
            }

            /**
             * Updates the effective slider height based on `heightPolicy`.
             * @param {jQuery} $item - The current slide item being evaluated.
             */
            function updateEffectiveSliderHeight($item) {
                var itemHeight = $item.outerHeight();
                if (heightPolicy === 'shortest') {
                    effectiveSliderHeight = Math.min(effectiveSliderHeight, itemHeight);
                } else if (heightPolicy === 'tallest') {
                    effectiveSliderHeight = Math.max(effectiveSliderHeight, itemHeight);
                }
            }

            /**
             * Sets the overall height of the slider container and its wrapper.
             */
            function setOverallSliderHeight() {
                if (heightPolicy === 'shortest' || heightPolicy === 'tallest') {
                    $sliderContainer.height(effectiveSliderHeight);
                    $slidesWrapper.height(effectiveSliderHeight);
                    if (currentConfig.debugMode) {
                        console.log('SwirlSlider: Slider height set to effective height:', effectiveSliderHeight);
                    }
                } else if (typeof heightPolicy === 'number' && heightPolicy > 0) {
                    $sliderContainer.height(heightPolicy);
                    $slidesWrapper.height(heightPolicy);
                    effectiveSliderHeight = heightPolicy; // Ensure effective height is updated
                    if (currentConfig.debugMode) {
                        console.log('SwirlSlider: Slider height set to fixed value:', heightPolicy);
                    }
                }
                // If heightPolicy is 'auto' (default for tallest) or 'css', height is determined by content/CSS
                updateSlidesWrapperDimensions();
            }

            /**
             * Adjusts the width of the slides wrapper to accommodate all slides and their clones.
             */
            function updateSlidesWrapperDimensions() {
                // Total width = (Number of original items + 2 * virtual copies) * width of one original set
                slidesWrapperTotalWidth = fullSetWidth * (totalOriginalItems + 1 + (2 * virtualSetsEachSide));
                $slidesWrapper.width(slidesWrapperTotalWidth);
                if (currentConfig.debugMode) {
                    console.log('SwirlSlider: Slides wrapper total width set to:', slidesWrapperTotalWidth);
                }
            }

            /**
             * Adds a virtual set of slides to either the beginning or end of the wrapper.
             * @param {string} position - 'prepend' or 'append'.
             */
            function addVirtualSet(position) {
                // Use the cached original markup to create clones
                var $clonedSet = $(baseMarkupStore);
                $clonedSet.removeClass(BASE_UNIT_CLASS); // Clones should not have the base class
                if (position === 'prepend') {
                    $slidesWrapper.prepend($clonedSet);
                } else {
                    $slidesWrapper.append($clonedSet);
                }
                if (currentConfig.debugMode) {
                    console.log('SwirlSlider: Added virtual set to', position);
                }
            }

            /**
             * Sets up click handlers for thumbnail/dot navigation.
             */
            function setupThumbnailNavigation() {
                if (hasThumbNavigation) {
                    $navigationDots.on('click', function(event) {
                        event.preventDefault();
                        if (isTransitioning) return;

                        var targetIndex = $(this).index(); // Assuming dots are in order
                        if (currentConfig.debugMode) {
                            console.log('SwirlSlider: Thumbnail navigation clicked, target index:', targetIndex);
                        }
                        animateSliderTransition(targetIndex);
                    });
                }
            }

            /**
             * Sets up click handlers for next and previous directional controls.
             */
            function setupDirectionalControls() {
                $nextControl.on('click', function(event) {
                    event.preventDefault();
                    if (isTransitioning) return;

                    var nextIndex = (currentActiveUnitIndex + 1) % (totalOriginalItems + 1);
                    if (currentConfig.debugMode) {
                        console.log('SwirlSlider: Next control clicked, target index:', nextIndex);
                    }
                    animateSliderTransition(nextIndex, 'forwards');
                });

                $prevControl.on('click', function(event) {
                    event.preventDefault();
                    if (isTransitioning) return;

                    var prevIndex = (currentActiveUnitIndex - 1 + (totalOriginalItems + 1)) % (totalOriginalItems + 1);
                    if (currentConfig.debugMode) {
                        console.log('SwirlSlider: Previous control clicked, target index:', prevIndex);
                    }
                    animateSliderTransition(prevIndex, 'backwards');
                });
            }

            /**
             * Makes the carousel visible after all initial calculations and positioning.
             */
            function revealSliderContent() {
                $sliderContainer.css('visibility', 'visible');
                if (currentConfig.debugMode) {
                    console.log('SwirlSlider: Content revealed.');
                }
            }

            // Accessibility: Add ARIA attributes
            function setupAccessibility() {
                $sliderContainer.attr({
                    'role': 'region',
                    'aria-roledescription': 'carousel',
                    'aria-label': 'Image Slider' // Or a more descriptive label
                });
                $slidesWrapper.attr('aria-live', 'polite'); // Announce changes to screen readers

                $baseSlideUnits.each(function(index) {
                    $(this).attr({
                        'role': 'group',
                        'aria-label': `Slide ${index + 1} of ${totalOriginalItems + 1}`
                    });
                });

                $nextControl.attr('aria-label', 'Next slide');
                $prevControl.attr('aria-label', 'Previous slide');

                if (hasThumbNavigation) {
                    $navigationDots.each(function(index) {
                        $(this).attr({
                            'role': 'button',
                            'aria-controls': $sliderContainer.attr('id') || `swirl-slider-${$sliderContainer.index()}`,
                            'aria-label': `Go to slide ${index + 1}`
                        });
                    });
                }
                if (currentConfig.debugMode) {
                    console.log('SwirlSlider: Accessibility attributes applied.');
                }
            }
            setupAccessibility(); // Run accessibility setup after all elements are processed
        });
    };
})(jQuery);