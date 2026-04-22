(function($) {

    /**
     * @typedef {object} FlexiRotatorOptions
     * @property {boolean} showPauseOverlay - Display an animated "Pause" text when paused.
     * @property {boolean} startAutomatically - Begin rotation immediately after initialization.
     * @property {number} transitionDuration - Speed of slide transition in milliseconds.
     * @property {boolean} enableControls - Create and display navigation controls (Play/Pause, Previous, Next).
     * @property {object} buttonLabels - Custom text for control buttons.
     * @property {string} buttonLabels.play - Text for the Play button.
     * @property {string} buttonLabels.pause - Text for the Pause button.
     * @property {string} buttonLabels.next - Text for the Next button.
     * @property {string} buttonLabels.previous - Text for the Previous button.
     * @property {string} customWrapperClass - Additional class to add to the main rotator wrapper.
     * @property {'fade'|'slideLeft'|'none'} animationEffect - Type of transition effect.
     * @property {boolean} pauseOnHover - Pause rotation when the mouse hovers over the rotator.
     * @property {boolean} enablePaging - Create and display numeric links for each slide.
     * @property {number} displayInterval - Time each slide is shown before transitioning, in milliseconds.
     */

    /**
     * FlexiRotator: A versatile jQuery content rotator plugin.
     *
     * @param {FlexiRotatorOptions} [userSettings] - Custom options to override defaults.
     * @returns {jQuery} The jQuery object for chaining.
     */
    $.fn.flexiRotator = function(userSettings) {

        /**
         * Default configuration for the FlexiRotator plugin.
         * @type {FlexiRotatorOptions}
         */
        const defaultOptions = {
            showPauseOverlay: true,
            startAutomatically: true,
            transitionDuration: 600,
            enableControls: true,
            buttonLabels: {
                play: 'Activate',
                pause: 'Suspend',
                next: 'Advance',
                previous: 'Recede'
            },
            customWrapperClass: '',
            animationEffect: 'fade',
            pauseOnHover: true,
            enablePaging: true,
            displayInterval: 3000
        };

        // Merge default settings with user-provided overrides.
        const pluginOptions = $.extend(true, {}, defaultOptions, userSettings);

        // Validate timing settings to prevent visual glitches.
        if (pluginOptions.displayInterval < (pluginOptions.transitionDuration + 50)) {
            console.warn('FlexiRotator: Consider increasing displayInterval. It should be at least 50ms longer than transitionDuration for smooth animations.');
            // Adjust display interval to ensure minimal overlap if it's too short.
            pluginOptions.displayInterval = pluginOptions.transitionDuration + 50;
        }

        // Process each selected element to create a rotator instance.
        return this.each(function() {
            const $hostElement = $(this);
            let slideElements = $hostElement.children().detach(); // Remove children and store them
            let intervalHandle = null;
            let activeSlideIndex = 0;
            const imagePreloader = [];
            const instanceQualifier = `fr-${Math.random().toString(36).substring(2, 9)}`; // Unique ID for this instance
            const additionalClass = pluginOptions.customWrapperClass || '';

            // Setup the main wrapper structure.
            $hostElement.css('position', 'relative').wrap(`<div class="flexi-rotator-wrapper ${instanceQualifier} ${additionalClass}" />`);
            const $outerWrapper = $hostElement.parent('.flexi-rotator-wrapper');
            $outerWrapper.css('position', 'relative'); // Ensure wrapper is positioned for absolute children

            // Add the first slide to the display area.
            if (slideElements.length > 0) {
                $(slideElements[0]).clone().appendTo($hostElement);
            } else {
                $outerWrapper.append('<p class="flexi-rotator-message">No content found for FlexiRotator.</p>');
                console.warn('FlexiRotator: Host element must contain child elements to function.');
                return; // Skip further setup if no slides.
            }

            // Preload images from all slides to improve perceived performance.
            _cacheImages();

            // Initialize controls and paging based on options.
            if (pluginOptions.enableControls) {
                _constructControls();
                if (!pluginOptions.startAutomatically) {
                    $outerWrapper.find(`.${instanceQualifier}-play-btn`).addClass('rotator-state-paused').text(pluginOptions.buttonLabels.play);
                }
            }

            if (pluginOptions.enablePaging) {
                _createPagingLinks();
                $outerWrapper.find(`.${instanceQualifier}-paging-nav a`).eq(0).addClass('rotator-slide-active');
            }

            // Set up hover pause functionality.
            if (pluginOptions.pauseOnHover) {
                $hostElement.hover(
                    () => { if (_isCurrentlyPlaying()) _haltRotation('hover'); },
                    () => { if (_isCurrentlyPlaying()) _beginRotation('hover'); }
                );
            }

            // Start the rotation if configured and there's more than one slide.
            if (pluginOptions.startAutomatically && slideElements.length > 1) {
                _resetRotationTimer();
            }

            /**
             * Handles the visual transition to a new slide.
             * @param {jQuery} contentList - The collection of all slide elements.
             * @param {number} targetIndex - The index of the slide to transition to.
             * @private
             */
            function _shiftToSlide(contentList, targetIndex) {
                const previousIndex = activeSlideIndex;

                // Normalize target index for continuous looping.
                if (targetIndex >= contentList.length) {
                    activeSlideIndex = 0;
                } else if (targetIndex < 0) {
                    activeSlideIndex = contentList.length - 1;
                } else {
                    activeSlideIndex = targetIndex;
                }

                const $currentSlide = $hostElement.children().eq(0);
                const $nextSlide = $(contentList[activeSlideIndex]).clone();

                if (pluginOptions.animationEffect === 'slideLeft') {
                    const slideDirection = (activeSlideIndex >= previousIndex || (activeSlideIndex === 0 && previousIndex === contentList.length - 1)) ? 'left' : 'right';
                    const exitDirection = (slideDirection === 'left') ? 'left' : 'right';

                    $nextSlide.appendTo($hostElement).motionShift({
                        shiftDirection: slideDirection,
                        movementDuration: pluginOptions.transitionDuration
                    });

                    if ($currentSlide.length) {
                        $currentSlide.css('position', 'absolute').motionShift({
                            shiftDirection: exitDirection,
                            visibilityToggle: 'hide',
                            movementDuration: pluginOptions.transitionDuration
                        }, function() { $(this).remove(); });
                    }
                } else if (pluginOptions.animationEffect === 'fade') {
                    $nextSlide.hide().appendTo($hostElement).fadeIn(pluginOptions.transitionDuration, () => {
                        // Clean up IE filter property for better performance/rendering in older IE versions
                        // (though modern browsers don't need this, it's part of the original clone's intent).
                        if (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0) {
                             this.style.removeAttribute('filter');
                        }
                    });

                    if ($currentSlide.length) {
                        $currentSlide.css('position', 'absolute').fadeOut(pluginOptions.transitionDuration, function() { $(this).remove(); });
                    }
                } else if (pluginOptions.animationEffect === 'none') {
                    $nextSlide.appendTo($hostElement);
                    if ($currentSlide.length) {
                        $currentSlide.css('position', 'absolute').remove();
                    }
                }

                _updatePagingUI();
            }

            /**
             * Checks if the rotator is currently in "play" mode.
             * @returns {boolean} True if playing, false if paused.
             * @private
             */
            function _isCurrentlyPlaying() {
                return !$outerWrapper.find(`.${instanceQualifier}-play-btn`).hasClass('rotator-state-paused');
            }

            /**
             * Resets the automatic rotation timer.
             * @private
             */
            function _resetRotationTimer() {
                clearInterval(intervalHandle);
                intervalHandle = setInterval(() => { _beginRotation(); }, pluginOptions.displayInterval);
            }

            /**
             * Starts or resumes the automatic slide rotation.
             * @param {string} [source] - Optional source of the play action ('hover', 'button').
             * @private
             */
            function _beginRotation(source) {
                if (!_isTransitionActive()) {
                    activeSlideIndex++;
                    _shiftToSlide(slideElements, activeSlideIndex);
                    
                    if (source === 'hover' || !_isCurrentlyPlaying()) {
                        _resetRotationTimer();
                    }
                    if (!_isCurrentlyPlaying()) {
                        _updateControlButtons(true); // Update to 'pause' state
                    }
                }
            }

            /**
             * Halts the automatic slide rotation.
             * @param {string} [source] - Optional source of the pause action ('hover', 'button').
             * @private
             */
            function _haltRotation(source) {
                clearInterval(intervalHandle);
                if (!source || source === 'button') {
                    _updateControlButtons(false); // Update to 'play' state

                    if (pluginOptions.showPauseOverlay && source === 'button') {
                        $(`<p class="${instanceQualifier}-pause-text rotator-pause-overlay">${pluginOptions.buttonLabels.pause}</p>`)
                            .css({
                                fontSize: '62%',
                                textAlign: 'center',
                                position: 'absolute',
                                top: '40%',
                                lineHeight: '100%',
                                width: '100%',
                                zIndex: 10 // Ensure it's above other elements
                            })
                            .appendTo($outerWrapper)
                            .animate({
                                fontSize: '600%',
                                top: '30%',
                                opacity: 0
                            }, {
                                duration: 500,
                                complete: function() { $(this).remove(); }
                            });
                    }
                }
            }

            /**
             * Advances to the next slide.
             * @private
             */
            function _advanceSlide() {
                _jumpToSlide(activeSlideIndex + 1);
            }

            /**
             * Recedes to the previous slide.
             * @private
             */
            function _recedeSlide() {
                _jumpToSlide(activeSlideIndex - 1);
            }

            /**
             * Checks if a transition is currently in progress.
             * @returns {boolean} True if animating, false otherwise.
             * @private
             */
            function _isTransitionActive() {
                return $hostElement.children().length > 1;
            }

            /**
             * Jumps to a specific slide index and pauses the rotation.
             * @param {number} index - The index of the slide to jump to.
             * @private
             */
            function _jumpToSlide(index) {
                $hostElement.children().stop(true, true); // Stop any current animations immediately

                // Only transition if the target index is different or if a transition is currently active.
                if (activeSlideIndex !== index || _isTransitionActive()) {
                    // Remove the old slide immediately if it's still animating.
                    if (_isTransitionActive()) {
                        $hostElement.children().eq(0).remove();
                    }
                    _shiftToSlide(slideElements, index);
                    _haltRotation(); // Pause after manual navigation
                    _resetRotationTimer(); // Reset timer to allow auto-play to resume after a delay
                }
            }

            /**
             * Preloads images from all slides into memory.
             * @private
             */
            function _cacheImages() {
                slideElements.each((idx, slide) => {
                    $(slide).find('img').each((imgIdx, img) => {
                        const src = $(img).attr('src');
                        if (src) {
                            imagePreloader.push($('<img>').attr('src', src));
                        }
                    });
                });
            }

            /**
             * Creates and appends navigation controls (Play/Pause, Previous, Next).
             * @private
             */
            function _constructControls() {
                const controlsHtml = `
                    <div class="flexi-rotator-controls ${instanceQualifier}-controls">
                        <button type="button" class="rotator-control-play ${instanceQualifier}-play-btn">${pluginOptions.buttonLabels.pause}</button>
                        <button type="button" class="rotator-control-prev ${instanceQualifier}-prev-btn">${pluginOptions.buttonLabels.previous}</button>
                        <button type="button" class="rotator-control-next ${instanceQualifier}-next-btn">${pluginOptions.buttonLabels.next}</button>
                    </div>
                `;
                $outerWrapper.append(controlsHtml);

                // Bind events to the newly created control buttons.
                $outerWrapper.find(`.${instanceQualifier}-controls button`).on('click', function(e) {
                    e.preventDefault(); // Prevent default link behavior if buttons are links
                    const $btn = $(this);
                    if ($btn.hasClass('rotator-control-play')) {
                        _isCurrentlyPlaying() ? _haltRotation('button') : _beginRotation('button');
                    } else if ($btn.hasClass('rotator-control-prev')) {
                        _recedeSlide();
                    } else if ($btn.hasClass('rotator-control-next')) {
                        _advanceSlide();
                    }
                });
            }

            /**
             * Creates and appends paging links for each slide.
             * @private
             */
            function _createPagingLinks() {
                const $pagingNav = $(`<nav class="flexi-rotator-paging ${instanceQualifier}-paging-nav"></nav>`);
                slideElements.each((idx, slide) => {
                    const linkText = $(slide).attr('title') || `Slide ${idx + 1}`;
                    $(`<a href="#" class="rotator-paging-link rotator-link-${idx} ${instanceQualifier}-link-${idx}">${linkText}</a>`)
                        .data('slide-index', idx) // Store index directly in data
                        .appendTo($pagingNav);
                });
                $outerWrapper.append($pagingNav);

                // Bind click events for paging links.
                $pagingNav.on('click', 'a', function(e) {
                    e.preventDefault();
                    _jumpToSlide($(this).data('slide-index'));
                });
            }

            /**
             * Updates the active class on paging links.
             * @private
             */
            function _updatePagingUI() {
                if (pluginOptions.enablePaging) {
                    $outerWrapper.find(`.${instanceQualifier}-paging-nav .rotator-slide-active`).removeClass('rotator-slide-active');
                    $outerWrapper.find(`.${instanceQualifier}-paging-nav a`).eq(activeSlideIndex).addClass('rotator-slide-active');
                }
            }

            /**
             * Updates the text and class of the play/pause button.
             * @param {boolean} isPlayingState - True if the rotator is now in a playing state, false if paused.
             * @private
             */
            function _updateControlButtons(isPlayingState) {
                const $playBtn = $outerWrapper.find(`.${instanceQualifier}-play-btn`);
                if (isPlayingState) {
                    $playBtn.text(pluginOptions.buttonLabels.pause).removeClass('rotator-state-paused');
                } else {
                    $playBtn.text(pluginOptions.buttonLabels.play).addClass('rotator-state-paused');
                }
            }
        });
    };

})(jQuery);


// --- Utility Plugin for Slide Animations (renamed and refactored) ---

(function($) {

    /**
     * @typedef {object} MotionShiftOptions
     * @property {'left'|'right'|'top'|'bottom'} shiftDirection - The direction for the slide motion.
     * @property {'show'|'hide'} visibilityToggle - Whether to show the element (from off-screen) or hide it (to off-screen).
     * @property {number} movementDuration - Duration of the animation in milliseconds.
     */

    /**
     * MotionShift: A utility plugin for animating elements in/out of view.
     *
     * @param {MotionShiftOptions} [animateConfig] - Configuration for the motion.
     * @param {Function} [onCompleteCallback] - Callback function to execute after animation.
     * @returns {jQuery} The jQuery object for chaining.
     */
    if ($.fn.motionShift === undefined) { // Guard to prevent re-definition
        $.fn.motionShift = function(animateConfig, onCompleteCallback) {

            /**
             * Default configuration for the MotionShift utility.
             * @type {MotionShiftOptions}
             */
            const defaultShiftConfig = {
                shiftDirection: 'left',
                visibilityToggle: 'show',
                movementDuration: 600
            };

            const shiftOptions = $.extend({}, defaultShiftConfig, animateConfig);

            return this.each(function() {
                const $element = $(this);
                // Reset positional CSS to allow new animations to take effect correctly.
                $element.css({left: '', right: '', top: '', bottom: ''});

                // Determine the dimension to measure based on direction.
                const dimension = (shiftOptions.shiftDirection === 'left' || shiftOptions.shiftDirection === 'right') ? $element.outerWidth(true) : $element.outerHeight(true);
                if (dimension <= 0) {
                    console.warn('MotionShift: Element has zero or negative dimension, animation skipped.');
                    if (onCompleteCallback) onCompleteCallback.call(this);
                    return;
                }

                // Prepare initial and final CSS states for the animation.
                const initialStyle = {
                    position: $element.css('position') === 'static' ? 'relative' : $element.css('position')
                };
                const finalStyle = {};

                const offsetValue = `${dimension}px`; // Use template literal for clarity

                if (shiftOptions.visibilityToggle === 'show') {
                    initialStyle[shiftOptions.shiftDirection] = `-${offsetValue}`;
                    finalStyle[shiftOptions.shiftDirection] = '0px';
                } else { // 'hide'
                    initialStyle[shiftOptions.shiftDirection] = '0px';
                    finalStyle[shiftOptions.shiftDirection] = `-${offsetValue}`;
                }
                
                // Apply initial styles and then animate to final styles.
                $element.css(initialStyle).animate(finalStyle, shiftOptions.movementDuration, onCompleteCallback);
            });
        };
    }

})(jQuery);