(function($) {
    if (typeof $ === 'undefined' || typeof $.fn === 'undefined') {
        console.error("jQuery is not available. Script execution halted.");
        return;
    }

    $(document).on('DOMContentLoaded', function() {

        /*--- App Core Component References ---*/
        /*--- Gathering DOM Elements for Interaction ---*/

        const oNavToggleBtn = $('.hamburger-icon'); // Formerly $hamburger
        const oInteractiveSurface = $('.has-parallax'); // Formerly $item
        const oActionTriggerButton = $('.follow button'); // Formerly $btn
        const oContentRotator = $('.carousel'); // Formerly $carousel
        const oCarouselControls = $('.nav'); // Formerly $nav
        const oMediaPlayerIcon = $('.audio .play'); // Formerly $play
        const oBackgroundMusicElement = $('audio').get(0); // Formerly $audio, direct access
        const oVisualDataBars = $('.bars'); // Formerly $bars
        const oNumericalReadouts = $('.count'); // Formerly $count

        /*--- User Interface State Manager ---*/

        oNavToggleBtn.on('click', function(e) {
            // Preventing default action if the element is an anchor or button
            if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') {
                e.preventDefault();
            }
            $(this).toggleClass('state-active'); // Changed class from 'active' to 'state-active'
            console.info('Navigation toggle state altered.'); // Added a log for interaction
        });


        /*--- Dynamic Background Effect Controller ---*/

        oInteractiveSurface.on({
            'mousemove.dynamicShift': function(event) { // Namespaced event
                const currentTarget = $(this);
                const shiftableElement = currentTarget.find('.is-parallax');

                // Verify element existence and Velocity.js availability
                if (shiftableElement.length === 0 || typeof $.fn.velocity === 'undefined') {
                    return;
                }

                const targetOffset = currentTarget.offset();
                const targetWidth = currentTarget.outerWidth(); // Using outerWidth for robustness
                const targetHeight = currentTarget.outerHeight(); // Using outerHeight

                const cursorX = event.pageX - targetOffset.left;
                const cursorY = event.pageY - targetOffset.top;

                const midWidth = targetWidth / 2;
                const midHeight = targetHeight / 2;

                const shiftX = Math.ceil((cursorX - midWidth) * 0.7); // Altered multiplier and Math.ceil
                const shiftY = Math.ceil((cursorY - midHeight) * 0.7); // Altered multiplier

                shiftableElement.velocity({
                    translateZ: 0,
                    translateX: shiftX,
                    translateY: shiftY,
                    scale: '1.8' // Changed scale value
                }, {
                    duration: 380, // Slightly modified duration
                    easing: [0.42, 0, 0.58, 1.0], // Custom cubic-bezier easing
                    queue: false
                });
            },
            'mouseleave.dynamicShift': function() { // Namespaced event
                const currentTarget = $(this);
                const shiftableElement = currentTarget.find('.is-parallax');

                if (shiftableElement.length === 0 || typeof $.fn.velocity === 'undefined') {
                    return;
                }

                shiftableElement.velocity({
                    translateZ: 0,
                    translateX: 0,
                    translateY: 0,
                    scale: '1.0' // Changed scale value
                }, {
                    duration: 1100, // Modified duration
                    easing: 'easeOutElastic', // Different easing
                    queue: false
                });
            }
        });

        /*--- Visual Feedback Mechanism ---*/

        oActionTriggerButton.on('click', function(triggerEvent) {
            triggerEvent.preventDefault();

            const clickedElement = $(this);
            const elementPosition = clickedElement.offset();

            // Ensure element has dimensions before attempting ripple
            if (clickedElement.width() <= 0 || clickedElement.height() <= 0) {
                console.warn("Target element has no valid dimensions for ripple effect.");
                return;
            }

            // Attempt to reuse an existing ripple overlay or create a new one
            let rippleOverlay = clickedElement.children('.dynamic-ripple-overlay').first();
            if (rippleOverlay.length === 0) {
                rippleOverlay = $('<span class="dynamic-ripple-overlay"></span>');
                clickedElement.append(rippleOverlay);
            }

            const clientXAdjusted = triggerEvent.pageX - elementPosition.left;
            const clientYAdjusted = triggerEvent.pageY - elementPosition.top;

            const maxDimension = Math.max(clickedElement.outerWidth(), clickedElement.outerHeight());
            const rippleDiameter = maxDimension * 1.6; // Slightly larger ripple

            // Initialize ripple state
            rippleOverlay.css({
                width: rippleDiameter,
                height: rippleDiameter,
                top: clientYAdjusted - (rippleDiameter / 2),
                left: clientXAdjusted - (rippleDiameter / 2),
                opacity: 0,
                transform: 'scale(0)'
            });

            // Animate the ripple effect
            rippleOverlay.stop(true, true) // Stop any previous animation and jump to end
                .animate({
                    opacity: 1,
                    transform: 'scale(1)'
                }, {
                    duration: 450, // Initial expansion speed
                    easing: 'easeOutSine'
                })
                .animate({
                    opacity: 0,
                    transform: 'scale(1.2)' // Fade out with slight overscale
                }, {
                    duration: 650, // Fade out speed
                    easing: 'easeInCubic',
                    complete: function() {
                        // Reset properties for potential reuse
                        $(this).css({
                            transform: 'scale(0)',
                            opacity: 0
                        });
                    }
                });

            // Optional: Add a brief class for button feedback
            clickedElement.addClass('ripple-active-state');
            setTimeout(() => clickedElement.removeClass('ripple-active-state'), 150);
        });


        /*--- Automated Content Display System ---*/

        // Check for Owl Carousel plugin availability
        if (typeof $.fn.owlCarousel === 'undefined') {
            console.warn("Owl Carousel plugin not detected. Carousel features will be inactive.");
        } else {
            oContentRotator.owlCarousel({
                navigation: false,
                slideSpeed: 310, // Changed value
                paginationSpeed: 410, // Changed value
                singleItem: true,
                autoPlay: 4000, // Added autoPlay with duration
                stopOnHover: true, // Added stopOnHover
                lazyLoad: true // Added lazyLoad
            });

            /*--- Carousel Directional Navigators ---*/
            oCarouselControls.on('click', function(evt) {
                evt.preventDefault(); // Ensure links don't navigate
                const directionElement = $(this);

                if (directionElement.hasClass('carousel-next')) { // Changed class name
                    oContentRotator.trigger('owl.next');
                } else if (directionElement.hasClass('carousel-prev')) { // Changed class name
                    oContentRotator.trigger('owl.prev');
                } else {
                    console.log('Unknown carousel navigation action.');
                }
            });
        }

        /*--- Audio Playback Controller ---*/

        let isSoundPlaying = false; // Changed from counter to boolean flag

        oMediaPlayerIcon.on('click', function() {
            const currentControl = $(this);

            if (!oBackgroundMusicElement) {
                console.warn("Background audio element is missing or not properly initialized.");
                currentControl.attr('title', 'Audio Unavailable').css('cursor', 'not-allowed'); // Provide feedback
                return;
            }

            isSoundPlaying = !isSoundPlaying; // Toggle the state

            if (isSoundPlaying) {
                currentControl.removeClass('icon-play-arrow').addClass('icon-pause');
                oBackgroundMusicElement.play();
                oBackgroundMusicElement.volume = 0.6; // Set a default volume
            } else {
                currentControl.removeClass('icon-pause').addClass('icon-play-arrow');
                oBackgroundMusicElement.pause();
                oBackgroundMusicElement.currentTime = 0; // Reset audio to beginning on pause
            }
        });

        /*--- Data Visuals Initializer ---*/

        // Apply animation class to visual data bars after a short delay
        setTimeout(() => {
            oVisualDataBars.addClass('active-chart-animation'); // Changed class name
        }, 200); // Added a delay for animation trigger


        /*--- Animated Numeric Display Plugin ---*/

        // Custom jQuery method for animating number increments
        $.fn.animateValueTransition = function(options) {
            // Deep merge default settings with user-provided options
            const settings = $.extend(true, {}, $.fn.animateValueTransition.defaults, options);

            // Calculate animation steps and increment
            const totalSteps = Math.floor(settings.totalDuration / settings.intervalFrequency);
            const valuePerStep = (settings.finalValue - settings.initialValue) / totalSteps;

            return this.each(function() {
                const targetDisplay = $(this);
                let currentStep = 0;
                let currentVisualValue = settings.initialValue;

                const animationTimer = setInterval(() => {
                    currentVisualValue += valuePerStep;
                    currentStep++;

                    // Update display with formatted value
                    targetDisplay.html(processNumericFormat(currentVisualValue, settings.decimalPrecision));

                    // Execute update callback if provided
                    if (typeof settings.onUpdateHandler === 'function') {
                        settings.onUpdateHandler.call(targetDisplay[0], currentVisualValue);
                    }

                    // Check for animation completion
                    if (currentStep >= totalSteps) {
                        clearInterval(animationTimer);
                        currentVisualValue = settings.finalValue; // Ensure exact final value

                        targetDisplay.html(processNumericFormat(currentVisualValue, settings.decimalPrecision)); // Final display update

                        // Execute completion callback if provided
                        if (typeof settings.onCompletionHandler === 'function') {
                            settings.onCompletionHandler.call(targetDisplay[0], currentVisualValue);
                        }
                    }
                }, settings.intervalFrequency);
            });
        };

        // Default configuration for the numeric animation plugin
        $.fn.animateValueTransition.defaults = {
            initialValue: 0,
            finalValue: 100,
            totalDuration: 1800, // Renamed and modified default duration
            intervalFrequency: 80, // Renamed and modified default interval
            decimalPrecision: 0, // Renamed
            onUpdateHandler: null, // Renamed
            onCompletionHandler: null, // Renamed
        };

        /*--- Utility for Number Display Formatting ---*/

        function processNumericFormat(numericalInput, decimals = 0) { // Renamed, added default for decimals
            if (isNaN(numericalInput)) return 'N/A'; // Guard clause for invalid input

            const fixedNumber = numericalInput.toFixed(decimals);
            const parts = fixedNumber.split('.');
            let integerPart = parts[0];
            const fractionalPart = parts.length > 1 ? '.' + parts[1] : '';

            // Add thousands separators (e.g., 1,234,567)
            integerPart = integerPart.split('').reverse().reduce((accumulator, digit, index) => {
                return digit + (index > 0 && index % 3 === 0 ? ',' : '') + accumulator;
            }, '');

            return integerPart + fractionalPart;
        }

        /*--- Triggering Numeric Animations ---*/

        oNumericalReadouts.each(function() {
            const currentElement = $(this);
            const startVal = parseFloat(currentElement.data('initial-value')) || 0; // Changed data attribute name, added parseFloat and default
            const endVal = parseFloat(currentElement.data('target-value')) || 0; // Changed data attribute name, added parseFloat and default

            // Only proceed with animation if values are valid and make sense
            if (!isNaN(startVal) && !isNaN(endVal) && endVal > startVal) {
                currentElement.animateValueTransition({
                    initialValue: startVal,
                    finalValue: endVal,
                    totalDuration: 2100, // Modified duration
                    intervalFrequency: 55 // Modified frequency
                });
            } else {
                // If data is invalid or animation not applicable, just display final value
                currentElement.html(processNumericFormat(endVal, 0));
                console.warn(`Numeric display for element ${currentElement.attr('class')} had invalid data. Displayed static value.`);
            }
        });

    }); // End of DOMContentLoaded
})(jQuery); // Isolation of jQuery scope