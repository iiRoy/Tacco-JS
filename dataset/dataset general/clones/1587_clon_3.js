/*
 * JQuery Frame Cycler v1.0.0
 * Project Home: https://example.com/labs/framecycler/
 *
 * Copyright (C) 2023, Your Name <your.email@example.com>
 *
 * This software is distributed under the terms of the MIT License.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

(function($) {

    // Extending jQuery's prototype to add our new image rotator functionality.
    $.fn.extend({
        berrySwiper: function(userPrefs) {

            // Define the foundational configuration values for the component.
            // These can be overridden by the user's preferences.
            const initialSettings = {
                autoChangeInterval: 5000,   // Delay in milliseconds before next slide
                animationDuration: 500,     // Time for slide transition effect
                verticalScaleFactor: 1,     // Multiplier for height calculation (original `lineheight`)
                containerHeight: 'auto',    // Reserved for future dynamic height control
                suspendOnMouseOver: false,  // Pause auto-advance when mouse hovers
                enablePaging: true,         // Display navigation dots/indicators
                showArrows: true,           // Reserved for directional navigation buttons
                keyboardControl: true       // Allow keyboard arrow keys to navigate
            };

            // Merge default settings with any user-provided options.
            const componentConfig = $.extend({}, initialSettings, userPrefs);

            // Iterate over each selected DOM element to apply the slider.
            return this.each(function() {
                const currentConfig = componentConfig; // Local reference to the effective config.
                const targetElement = $(this);        // The main container for this slider instance.

                // Pre-check: Ensure the container element is valid.
                if (!targetElement.length) {
                    console.warn("Frame Cycler: Target element not found or invalid.");
                    return;
                }

                // Identify the individual content panels and navigation dots within the container.
                const contentFrames = $('.slides li', targetElement);
                let navIndicators = $('.pager li', targetElement);

                // If there are no content frames, there's nothing to slide.
                if (contentFrames.length === 0) {
                    console.info("Frame Cycler: No content slides found in the target element.");
                    return;
                }

                // Initialize indices for the currently active and upcoming frames.
                let activeIdx = 0; // Index of the frame currently displayed.
                let futureIdx = activeIdx + 1; // Index of the frame that will be shown next.

                // Retrieve dimensions of the first image to calculate aspect ratio.
                const firstImage = contentFrames.eq(activeIdx).find('img');
                let mediaHeight = 0;
                let mediaWidth = 0;
                let aspectRatio = 1; // Default to 1 to prevent division by zero.

                // Validate image existence and retrieve dimensions.
                if (firstImage.length) {
                    mediaHeight = firstImage.height();
                    mediaWidth = firstImage.width();
                    if (mediaHeight > 0) {
                        aspectRatio = mediaWidth / mediaHeight;
                    } else {
                        console.warn("Frame Cycler: First image has zero height, aspect ratio might be incorrect.");
                    }
                } else {
                    console.info("Frame Cycler: No image found in the first slide for aspect ratio calculation.");
                }

                // Variables for dynamic resizing operations.
                let viewportWidth = 0;
                let adjustedHeight = 0;

                // Initially hide all content frames, then display the first one
                // and mark it as active.
                contentFrames.hide().eq(activeIdx).fadeIn(currentConfig.animationDuration).addClass('active');

                // Logic for setting up the navigation pager (dots).
                // If existing pager elements are found, use them. Otherwise, create new ones.
                if (navIndicators.length) {
                    // An existing pager was found, just activate the first item.
                    navIndicators.eq(activeIdx).addClass('active');
                } else if (currentConfig.enablePaging) {
                    // No pager found, but it's enabled, so generate it.
                    const pagerContainer = $('<ul class="pager"></ul>');
                    targetElement.append(pagerContainer);
                    contentFrames.each(function(idx) {
                        // Create a list item for each content frame.
                        pagerContainer.append('<li><a href="#"><span>' + (idx + 1) + '</span></a></li>');
                    });
                    // Re-select the newly created pager items.
                    navIndicators = $('.pager li', targetElement);
                    // Mark the first pager item as active.
                    navIndicators.eq(activeIdx).addClass('active');
                }

                // Attach click handlers to the navigation indicators if they exist.
                if (navIndicators.length) {
                    targetElement.on('click', '.pager a', function(event) {
                        event.preventDefault(); // Prevent default link behavior.
                        // Stop any ongoing auto-advance timer.
                        clearTimeout(targetElement.data('autoAdvanceHandle'));

                        // Determine the index of the clicked pager item.
                        const clickedIndex = $(this).parent().index();

                        // Only advance if the clicked index is different from the current one.
                        if (clickedIndex !== activeIdx) {
                            futureIdx = clickedIndex;
                            shiftView(); // Trigger the slide transition.
                        }
                    });
                }

                // Core function to transition between content frames.
                const shiftView = function() {
                    // Update the visual state: fade out current, fade in next.
                    contentFrames.eq(activeIdx).fadeOut(currentConfig.animationDuration).removeClass('active')
                        .end().eq(futureIdx).fadeIn(currentConfig.animationDuration).addClass('active').queue(function(nextFn) {
                            // After the animation completes, schedule the next auto-advance.
                            // This ensures animations don't stack up.
                            scheduleNextFrame();
                            nextFn(); // Continue jQuery's internal queue.
                        });

                    // Update the active state of navigation indicators.
                    if (navIndicators.length) {
                        navIndicators.eq(activeIdx).removeClass('active')
                            .end().eq(futureIdx).addClass('active');
                    }

                    // Update the internal indices for the next cycle.
                    activeIdx = futureIdx;
                    futureIdx = (activeIdx >= contentFrames.length - 1) ? 0 : activeIdx + 1;
                };

                // Function to set up the timer for automatic frame advancement.
                const scheduleNextFrame = function() {
                    // Clear any existing timer to prevent duplicates.
                    clearTimeout(targetElement.data('autoAdvanceHandle'));
                    // Set a new timer to call shiftView after the configured interval.
                    const timerId = setTimeout(function() {
                        shiftView(); // Trigger the slide transition.
                    }, currentConfig.autoChangeInterval);
                    // Store the timer ID on the target element for future clearing.
                    targetElement.data('autoAdvanceHandle', timerId);
                };

                // Initiate the auto-advance sequence for the first time.
                scheduleNextFrame();

                // Implement pause-on-hover functionality if enabled.
                if (currentConfig.suspendOnMouseOver) {
                    targetElement.on('mouseenter', '.slides li', function() {
                        // On mouse entry, stop the auto-advance timer.
                        clearTimeout(targetElement.data('autoAdvanceHandle'));
                    }).on('mouseleave', '.slides li', function() {
                        // On mouse exit, restart the auto-advance timer.
                        scheduleNextFrame();
                    });
                }

                // Function to dynamically adjust the slider's height based on its width and content's aspect ratio.
                const adjustDimensions = function() {
                    // Get the current width of the main content area.
                    viewportWidth = $('.slides', targetElement).width();

                    // Calculate the desired height based on aspect ratio and a scaling factor.
                    // This ensures images maintain their proportions within the slider.
                    const rawCalculatedHeight = (viewportWidth / aspectRatio);
                    adjustedHeight = Math.floor(rawCalculatedHeight / currentConfig.verticalScaleFactor) * currentConfig.verticalScaleFactor;

                    // Apply the calculated height to the content container.
                    $('.slides', targetElement).css({ height: adjustedHeight + 'px' });
                };

                // Perform an initial dimension adjustment.
                adjustDimensions();

                // Re-adjust dimensions whenever the browser window is resized.
                $(window).on('resize', function() {
                    adjustDimensions();
                });

                // Add keyboard navigation support if enabled.
                if (currentConfig.keyboardControl) {
                    $(document).on('keyup', function(event) {
                        // Ensure the event originated from the document, not an input field.
                        if (event.target.tagName.toLowerCase() === 'input' || event.target.tagName.toLowerCase() === 'textarea') {
                            return; // Do not interfere with text input.
                        }

                        let shouldShift = false; // Flag to indicate if a shift is needed.

                        switch (event.which) {
                            case 39: // Right arrow key
                            case 32: // Spacebar
                                // Advance to the next frame.
                                futureIdx = (activeIdx >= contentFrames.length - 1) ? 0 : activeIdx + 1;
                                shouldShift = true;
                                break;
                            case 37: // Left arrow key
                                // Go back to the previous frame.
                                futureIdx = (activeIdx <= 0) ? contentFrames.length - 1 : activeIdx - 1;
                                shouldShift = true;
                                break;
                        }

                        if (shouldShift) {
                            // Stop current auto-advance and perform the shift.
                            clearTimeout(targetElement.data('autoAdvanceHandle'));
                            shiftView();
                            // Re-schedule auto-advance after manual interaction.
                            scheduleNextFrame();
                        }
                    });
                }
            });
        }
    });

})(jQuery);