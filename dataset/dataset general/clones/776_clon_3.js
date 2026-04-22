/*
 * FlexSlider Core Plugin - Revamped for Modern Web
 * Copyright 2023, YourName/YourCompany
 * Licensed under the Apache 2.0 License.
 * https://www.apache.org/licenses/LICENSE-2.0
 */


(function ($) {
  'use strict';

  // Utility function to locate the primary image within an element.
  // Returns the first image found, prioritizing direct children.
  $.fn.locatePrimaryImage = function () {
    // Look for an image directly within the first matched element,
    // or if the element itself is an image.
    return this.eq(0).find('img').addBack('img').first();
  };

  // Main slider configuration and core logic object.
  var SLIDER_CORE = {

    // Default settings for the slider behavior.
    config: {
      transitionEffect: 'horizontal-push', // 'fade', 'horizontal-slide', 'vertical-slide', 'horizontal-push', 'vertical-push'
      effectDuration: 600,             // Speed of slide transitions in milliseconds.
      autoPlay: true,                  // Enable or disable automatic slide progression.
      intervalMs: 4000,                // Time between automatic transitions (if autoPlay is true).
      pauseOnInteraction: false,       // Pause autoPlay when mouse hovers over the slider.
      resumeOnMouseLeave: false,       // Resume autoPlay after mouse leaves the slider area.
      resumeDelayMs: 1000,             // Delay in milliseconds before resuming autoPlay after mouse leave.
      showArrows: true,                // Display directional navigation arrows.
      rightArrowLabel: 'Next Item',    // Accessibility label for the right arrow.
      leftArrowLabel: 'Previous Item', // Accessibility label for the left arrow.
      displayCaptions: true,           // Show descriptive captions for slides.
      captionTransition: 'fade',       // 'fade', 'slideOpen', 'none' for caption animations.
      captionDuration: 600,            // Speed of caption animations.
      resetTimerOnManualNav: false,    // Reset autoPlay timer on arrow/pip clicks.
      showPips: false,                 // Display bullet/pip navigation.
      pipsAsThumbs: false,             // Use thumbnails for pips instead of numbers.
      pipThumbBaseUrl: '',             // Base URL for thumbnail images if pipsAsThumbs is true.
      onSlideTransitionEnd: $.noop,    // Callback executed after each slide transition completes.
      onSliderReady: $.noop,           // Callback executed once the slider is fully initialized and loaded.
      responsive: true,                // Adjust slider dimensions to parent container.
      centerPips: true                 // Center the pip navigation using JavaScript.
    },

    currentPanelIdx: 0,        // Index of the currently active slide panel.
    totalPanels: 0,            // Total number of slide panels.
    sliderWidth: null,         // Current calculated width of the slider.
    sliderHeight: null,        // Current calculated height of the slider.
    isTransitioning: null,     // Flag to prevent multiple transitions simultaneously.
    isAutoPlaying: null,       // Flag indicating if autoPlay is currently active.
    timerProgressDegrees: 0,   // Current rotation degree for the autoPlay progress indicator.
    autoPlayClock: null,       // Interval ID for the autoPlay timer.
    resumeTimeout: null,       // Timeout ID for delaying autoPlay resume.

    // HTML templates for various slider components.
    containerMarkup: '<div class="flex-slider-viewport" />',
    autoPlayIndicatorMarkup: '<div class="autoplay-indicator"><span class="progress-mask"><span class="progress-rotator"></span></span><span class="play-pause-toggle"></span></div>',
    captionAreaMarkup: '<div class="slider-caption-area"></div>',
    arrowNavMarkup: '<div class="slider-directional-nav"><span class="nav-right"></span><span class="nav-left"></span></div>',
    pipNavMarkup: '<ul class="slider-pips"></ul>',

    /**
     * Initializes the slider instance.
     * @param {HTMLElement} targetElement - The DOM element to transform into a slider.
     * @param {Object} userOptions - User-defined options to override defaults.
     */
    initialize: function (targetElement, userOptions) {
      if (!targetElement) {
        console.warn("FlexSlider: No target element provided for initialization.");
        return;
      }
      var $panelImages,
          loadedImageCount = 0,
          instance = this; // Store reference to `this` for use in callbacks.

      // Bind methods to the correct context to ensure `this` refers to the SLIDER_CORE instance.
      this.handleIndicatorClick = $.proxy(this.handleIndicatorClick, this);
      this.createPip = $.proxy(this.createPip, this);
      this.finalizeTransition = $.proxy(this.finalizeTransition, this);
      this.haltAutoPlay = $.proxy(this.haltAutoPlay, this);
      this.startResumeTimer = $.proxy(this.startResumeTimer, this);
      this.clearResumeTimer = $.proxy(this.clearResumeTimer, this);
      this.updateTimerIndicator = $.proxy(this.updateTimerIndicator, this);

      // Merge user options with default configuration.
      this.options = $.extend(true, {}, this.config, userOptions);

      // Coerce string booleans to actual booleans if necessary (legacy support).
      if (typeof this.options.autoPlay === 'string') this.options.autoPlay = (this.options.autoPlay === 'true');
      if (typeof this.options.displayCaptions === 'string') this.options.displayCaptions = (this.options.displayCaptions === 'true');
      if (typeof this.options.showArrows === 'string') this.options.showArrows = (this.options.showArrows === 'true');

      this.$mainElement = $(targetElement);
      if (this.$mainElement.data('flexslider-initialized')) {
        console.warn("FlexSlider: Element already initialized.", targetElement);
        return; // Prevent double initialization
      }
      this.$mainElement.data('flexslider-initialized', true);

      // Wrap the main element with the slider viewport container.
      this.$outerContainer = this.$mainElement.wrap(this.containerMarkup).parent();
      // Select all potential slide panels (images, links, divs).
      this.$panels = this.$mainElement.children('img, a, div');

      // Setup custom event listeners for slider control.
      this._setupEvents();

      // Filter for image panels to track loading status.
      $panelImages = this.$panels.filter('img');

      // If no images are present or all images are loaded via imageready plugin.
      if ($panelImages.length === 0) {
        this.onContentReady();
      } else {
        // Use imageready to ensure all images are loaded before setup.
        $panelImages.on('imageready', function () {
          loadedImageCount++;
          if (loadedImageCount === $panelImages.length) {
            instance.onContentReady();
          }
        });
      }
    },

    /**
     * Centralized event binding for internal slider events.
     * @private
     */
    _setupEvents: function() {
      var instance = this;
      this.$mainElement.on({
        'slider.next': function () { instance.transitionToPanel('next'); },
        'slider.prev': function () { instance.transitionToPanel('prev'); },
        'slider.goto': function (e, idx) { instance.transitionToPanel(idx); },
        'slider.start': function () { instance.activateAutoPlay(); },
        'slider.stop': function () { instance.haltAutoPlay(); }
      });
    },

    /**
     * Callback executed once all content (especially images) is loaded.
     * Initiates the full slider setup.
     */
    onContentReady: function () {
      this.$mainElement
        .addClass('flex-slider-initialized')
        .css({width: '1px', height: '1px', position: 'relative'}); // Ensure positioning context

      this.$panels.addClass('slider-panel').css({position: 'absolute', top: 0, left: 0, display: 'none'});

      this.adjustDimensions();
      this.disableFeaturesForSinglePanel();
      this.initializeFirstPanel();

      if (this.options.autoPlay) {
        this.setupAutoPlayIndicator();
        this.activateAutoPlay();
      }

      if (this.options.displayCaptions) {
        this.configureCaptions();
      }

      if (this.options.showArrows) {
        this.configureArrowNavigation();
      }

      if (this.options.showPips) {
        this.configurePipNavigation();
        this.highlightActivePip();
      }

      // Execute user-defined callback for slider readiness.
      this.options.onSliderReady.call(this);

      // If Holder.js is used for placeholders, trigger it (assuming it's globally available).
      if (typeof Holder !== 'undefined' && Holder.run) {
        Holder.run();
      }
    },

    /**
     * Retrieves the currently active slide panel.
     * @returns {jQuery} The jQuery object for the current panel.
     */
    getCurrentPanel: function () {
      return this.$panels.eq(this.currentPanelIdx);
    },

    /**
     * Sets the slider dimensions based on the largest slide panel.
     */
    adjustDimensions: function () {
      var instance = this,
          $responsiveImagePlaceholder;

      // Initialize dimensions with the first panel's size.
      this.sliderWidth = this.$panels.first().outerWidth();
      this.sliderHeight = this.$panels.first().height();
      this.$mainElement.add(this.$outerContainer).width(this.sliderWidth);
      this.$mainElement.add(this.$outerContainer).height(this.sliderHeight);

      // Clone the first image for responsive placeholder, or create a new one.
      $responsiveImagePlaceholder = this.$panels.first().locatePrimaryImage().clone();

      // Iterate through all panels to find the maximum width and height.
      this.$panels.each(function () {
        var $panel = $(this),
            panelWidth = $panel.outerWidth(),
            panelHeight = $panel.height();

        if (panelWidth > instance.sliderWidth) {
          instance.sliderWidth = panelWidth;
        }
        if (panelHeight > instance.sliderHeight) {
          instance.sliderHeight = panelHeight;
          $responsiveImagePlaceholder = $(this).locatePrimaryImage().clone(); // Update placeholder if a taller image is found.
        }
        instance.totalPanels++;
      });

      // Apply max dimensions to the slider container.
      this.$mainElement.add(this.$outerContainer).width(this.sliderWidth);
      this.$mainElement.add(this.$outerContainer).height(this.sliderHeight);


      // Handle responsive behavior.
      if (this.options.responsive) {
        if (typeof this.options.responsive === "string") {
          // If responsive is a string (e.g., "300x200"), use Holder.js with it.
          $responsiveImagePlaceholder = $("<img>").attr("data-src", "holder.js/" + this.options.responsive);
        }

        this.$mainElement.prepend($responsiveImagePlaceholder);
        $responsiveImagePlaceholder.addClass('responsive-placeholder').css({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0 // Ensure it's behind content
        });
        this.$mainElement.add(this.$outerContainer).css({width: 'inherit', height: 'inherit'}); // Allow CSS to control dimensions

        // Recalculate dimensions on window resize.
        $(window).on('resize.flexslider', function () {
          instance.sliderWidth = instance.$mainElement.outerWidth();
          instance.sliderHeight = instance.$mainElement.height();
        });
      }
    },

    // Animation locking functions.
    lock: function () {
      this.isTransitioning = true;
    },

    unlock: function () {
      this.isTransitioning = false;
    },

    /**
     * Disables certain features if there's only one slide.
     */
    disableFeaturesForSinglePanel: function () {
      if (this.$panels.length <= 1) {
        this.options.showArrows = false;
        this.options.autoPlay = false;
        this.options.showPips = false;
        // Also ensure captions are off unless explicitly needed for a single static image.
        this.options.displayCaptions = false;
      }
    },

    /**
     * Prepares and displays the first slide panel.
     */
    initializeFirstPanel: function () {
      var instance = this;
      this.$panels.eq(0)
        .css({ "z-index": 3, "display": "block", "opacity": 0 }) // Initially hidden
        .animate({ opacity: 1 }, this.options.effectDuration, function() {
          // Ensure all other slides are block-level but hidden for layout calculations.
          instance.$panels.not(this).css({"display": "block", "opacity": 0});
        });
    },

    /**
     * Activates the automatic slide progression.
     */
    activateAutoPlay: function () {
      var instance = this;

      if (!this.options.autoPlay || this.isAutoPlaying) {
        return false; // Do nothing if autoPlay is disabled or already running.
      }

      // If the timer indicator is not visible, use a simple interval.
      if (this.$autoPlayIndicator && this.$autoPlayIndicator.is(':hidden')) {
        this.autoPlayClock = setInterval(function () {
          instance.$mainElement.trigger('slider.next');
        }, this.options.intervalMs);
      } else {
        // If timer indicator is visible, use the rotating visual timer.
        this.isAutoPlaying = true;
        this.$playPauseToggle && this.$playPauseToggle.removeClass('active');
        // Calculate interval for rotation steps to complete in `intervalMs`.
        // 180 steps for 360 degrees (2 degrees per step).
        var rotationStepInterval = this.options.intervalMs / 180;
        this.autoPlayClock = setInterval(this.updateTimerIndicator, rotationStepInterval);
      }
    },

    /**
     * Updates the visual progress indicator for autoPlay.
     * @param {boolean} [reset=false] - If true, resets the timer progress immediately.
     */
    updateTimerIndicator: function (reset) {
      if (!this.$rotator || !this.$progressMask) return; // Guard against missing elements

      var degreeCSS = "rotate(" + this.timerProgressDegrees + "deg)";
      this.timerProgressDegrees += 2; // Increment by 2 degrees for visual effect.

      this.$rotator.css({
        "-webkit-transform": degreeCSS,
        "-moz-transform": degreeCSS,
        "-o-transform": degreeCSS,
        "-ms-transform": degreeCSS,
        "transform": degreeCSS // Standard property
      });

      // Apply 'move' class for visual effect after 180 degrees.
      if (this.timerProgressDegrees > 180) {
        this.$rotator.addClass('move');
        this.$progressMask.addClass('move');
      }

      // If a full rotation is complete (360 degrees) or reset is requested.
      if (this.timerProgressDegrees > 360 || reset) {
        this.$rotator.removeClass('move');
        this.$progressMask.removeClass('move');
        this.timerProgressDegrees = 0; // Reset progress.
        this.$mainElement.trigger('slider.next'); // Trigger next slide.
      }
    },

    /**
     * Stops the automatic slide progression.
     */
    haltAutoPlay: function () {
      if (!this.options.autoPlay) {
        return false;
      } else {
        this.isAutoPlaying = false;
        clearInterval(this.autoPlayClock);
        this.$playPauseToggle && this.$playPauseToggle.addClass('active'); // Indicate paused state.
      }
    },

    /**
     * Sets up the visual autoPlay progress indicator and its event listeners.
     */
    setupAutoPlayIndicator: function () {
      this.$autoPlayIndicator = $(this.autoPlayIndicatorMarkup);
      this.$outerContainer.append(this.$autoPlayIndicator);

      this.$rotator = this.$autoPlayIndicator.find('.progress-rotator');
      this.$progressMask = this.$autoPlayIndicator.find('.progress-mask');
      this.$playPauseToggle = this.$autoPlayIndicator.find('.play-pause-toggle');

      this.$autoPlayIndicator.on('click', this.handleIndicatorClick);

      if (this.options.resumeOnMouseLeave) {
        this.$outerContainer.on('mouseleave.flexslider', this.startResumeTimer);
        this.$outerContainer.on('mouseenter.flexslider', this.clearResumeTimer);
      }

      if (this.options.pauseOnInteraction) {
        this.$outerContainer.on('mouseenter.flexslider', this.haltAutoPlay);
      }
    },

    /**
     * Starts a timer to resume autoPlay after a delay when mouse leaves.
     */
    startResumeTimer: function () {
      var instance = this;
      this.resumeTimeout = setTimeout(function() {
        if (!instance.isAutoPlaying) { // Only resume if not already playing
          instance.activateAutoPlay();
        }
      }, this.options.resumeDelayMs);
    },

    /**
     * Clears any pending autoPlay resume timer.
     */
    clearResumeTimer: function () {
      clearTimeout(this.resumeTimeout);
    },

    /**
     * Handles clicks on the autoPlay indicator to toggle play/pause.
     */
    handleIndicatorClick: function () {
      if (!this.isAutoPlaying) {
          this.activateAutoPlay();
      } else {
          this.haltAutoPlay();
      }
    },

    /**
     * Sets up the caption area for the slider.
     */
    configureCaptions: function () {
      this.$captionArea = $(this.captionAreaMarkup);
      this.$outerContainer.append(this.$captionArea);
      this.updateCaptionDisplay(); // Display initial caption
    },

    /**
     * Updates the caption display based on the current slide.
     */
    updateCaptionDisplay: function () {
      if (!this.options.displayCaptions || !this.$captionArea) {
        return false;
      }

      var captionSource = this.getCurrentPanel().attr('data-caption-id'),
          captionContent = '';

      if (captionSource && $(captionSource).length) {
        // If a caption source element is found, retrieve its HTML.
        captionContent = $(captionSource).html();
        // Only show if content is not empty.
        if ($.trim(captionContent).length > 0){
          this.$captionArea.html(captionContent);
          // Animate caption entrance.
          switch (this.options.captionTransition) {
            case 'none':
              this.$captionArea.show();
              break;
            case 'fade':
              this.$captionArea.fadeIn(this.options.captionDuration);
              break;
            case 'slideOpen':
              this.$captionArea.slideDown(this.options.captionDuration);
              break;
          }
        } else {
          // If caption source is empty, hide the caption area.
          this.hideCaptionArea();
        }
      } else {
        // If no caption source is defined, hide the caption area.
        this.hideCaptionArea();
      }
    },

    /**
     * Helper to hide the caption area with animation.
     */
    hideCaptionArea: function() {
      switch (this.options.captionTransition) {
        case 'none':
          this.$captionArea.hide();
          break;
        case 'fade':
          this.$captionArea.fadeOut(this.options.captionDuration);
          break;
        case 'slideOpen':
          this.$captionArea.slideUp(this.options.captionDuration);
          break;
      }
    },

    /**
     * Sets up the directional navigation arrows.
     */
    configureArrowNavigation: function () {
      var instance = this,
          $arrowNav = $(this.arrowNavMarkup);

      $arrowNav.find('.nav-right').html(this.options.rightArrowLabel);
      $arrowNav.find('.nav-left').html(this.options.leftArrowLabel);

      this.$outerContainer.append($arrowNav);

      // Event listeners for arrow clicks.
      this.$outerContainer.find('.nav-left').on('click.flexslider', function () {
        instance.haltAutoPlay();
        if (instance.options.resetTimerOnManualNav) {
          instance.updateTimerIndicator(true); // Reset visual timer
          instance.activateAutoPlay();
        }
        instance.$mainElement.trigger('slider.prev');
      });

      this.$outerContainer.find('.nav-right').on('click.flexslider', function () {
        instance.haltAutoPlay();
        if (instance.options.resetTimerOnManualNav) {
          instance.updateTimerIndicator(true); // Reset visual timer
          instance.activateAutoPlay();
        }
        instance.$mainElement.trigger('slider.next');
      });
    },

    /**
     * Sets up the bullet/pip navigation.
     */
    configurePipNavigation: function () {
      this.$pips = $(this.pipNavMarkup);
      this.$outerContainer.append(this.$pips);
      this.$panels.each(this.createPip); // Create a pip for each panel.
      this.$mainElement.addClass('with-pips');
      if (this.options.centerPips) {
        // Center pips dynamically.
        this.$pips.css('margin-left', -this.$pips.outerWidth() / 2);
      }
    },

    /**
     * Creates a single navigation pip for a slide panel.
     * @param {number} index - The index of the slide panel.
     * @param {HTMLElement} panelElement - The DOM element of the slide panel.
     */
    createPip: function (index, panelElement) {
      var displayPosition = index + 1,
          $pipItem = $('<li>' + (displayPosition) + '</li>'),
          thumbnailName,
          instance = this;

      if (this.options.pipsAsThumbs) {
        thumbnailName = $(panelElement).attr('data-thumbnail');
        if (thumbnailName) {
          $pipItem
            .addClass('has-thumbnail')
            .css({background: "url(" + this.options.pipThumbBaseUrl + thumbnailName + ") no-repeat center center"});
        }
      }
      this.$pips.append($pipItem);
      $pipItem.data('panel-index', index); // Store the index for later retrieval.
      $pipItem.on('click.flexslider', function () {
        instance.haltAutoPlay();
        if (instance.options.resetTimerOnManualNav) {
          instance.updateTimerIndicator(true);
          instance.activateAutoPlay();
        }
        instance.$mainElement.trigger('slider.goto', [$(this).data('panel-index')]);
      });
    },

    /**
     * Highlights the active pip in the navigation.
     */
    highlightActivePip: function () {
      if (!this.options.showPips || !this.$pips) { return false; }
      this.$pips.find('li')
        .removeClass('active-pip')
        .eq(this.currentPanelIdx)
        .addClass('active-pip');
    },

    /**
     * Resets Z-index and unlocks the slider after a transition.
     */
    finalizeTransition: function () {
      this.$panels
        .eq(this.previousPanelIdx)
        .css({"z-index": 1, "display": "none"}); // Hide previous panel after transition

      this.unlock();
      // Execute user-defined callback for slide change.
      this.options.onSlideTransitionEnd.call(this, this.$panels.eq(this.previousPanelIdx), this.$panels.eq(this.currentPanelIdx));
    },

    /**
     * Calculates the target panel index based on direction or direct index.
     * @param {string|number} direction - 'next', 'prev', or a numeric index.
     * @returns {number} The calculated target panel index.
     * @private
     */
    _getPanelIndex: function(direction) {
      let targetIndex = this.currentPanelIdx;
      if (typeof direction === 'number') {
        targetIndex = direction;
      } else if (direction === 'next') {
        targetIndex++;
        if (targetIndex >= this.totalPanels) {
          targetIndex = 0;
        }
      } else if (direction === 'prev') {
        targetIndex--;
        if (targetIndex < 0) {
          targetIndex = this.totalPanels - 1;
        }
      }
      return targetIndex;
    },

    /**
     * Initiates a transition to a new slide panel.
     * @param {string|number} targetDirection - 'next', 'prev', or the numeric index of the target panel.
     */
    transitionToPanel: function (targetDirection) {
      if (this.totalPanels <= 1 || this.isTransitioning) {
        return false; // Prevent transition if only one panel or already transitioning.
      }

      this.previousPanelIdx = this.currentPanelIdx;
      this.currentPanelIdx = this._getPanelIndex(targetDirection);

      // Exit if the target panel is already the active one.
      if (this.previousPanelIdx === this.currentPanelIdx) {
        return false;
      }

      this.lock(); // Lock the slider during transition.

      // Highlight the correct navigation pip.
      this.highlightActivePip();
      // Update the caption display.
      this.updateCaptionDisplay();

      // Set z-index for the previous slide to be below the incoming slide.
      this.$panels.eq(this.previousPanelIdx).css({"z-index": 2});
      this.$panels.eq(this.currentPanelIdx).css({"z-index": 3, "display": "block"}); // Ensure new panel is visible for animation

      // Perform the specified animation effect.
      this._applyTransitionEffect();
    },

    /**
     * Applies the selected transition effect between panels.
     * @private
     */
    _applyTransitionEffect: function() {
      var instance = this,
          $currentPanel = this.$panels.eq(this.currentPanelIdx),
          $previousPanel = this.$panels.eq(this.previousPanelIdx);

      // Determine the direction of the animation for horizontal/vertical slides.
      // This is simplified, assuming 'next' is right/down and 'prev' is left/up.
      let animationDirection = 'next';
      if (this.previousPanelIdx > this.currentPanelIdx ||
         (this.previousPanelIdx === 0 && this.currentPanelIdx === this.totalPanels - 1)) {
        animationDirection = 'prev';
      }

      switch (this.options.transitionEffect) {
        case "fade":
          $currentPanel.css({opacity: 0})
                       .animate({opacity: 1}, this.options.effectDuration, this.finalizeTransition);
          break;

        case "horizontal-slide":
        case "horizontal-push":
          var offset = (animationDirection === 'next') ? this.sliderWidth : -this.sliderWidth;
          $currentPanel.css({left: offset, opacity: 1}); // Position new panel off-screen

          $currentPanel.animate({left: 0}, this.options.effectDuration);
          if (this.options.transitionEffect === "horizontal-push") {
            $previousPanel.animate({left: -offset}, this.options.effectDuration, this.finalizeTransition);
          } else {
            $previousPanel.animate({left: -offset}, this.options.effectDuration, function() {
              $(this).css({left: 0}); // Reset previous panel's position
              instance.finalizeTransition();
            });
          }
          break;

        case "vertical-slide":
        case "vertical-push":
          var verticalOffset = (animationDirection === 'next') ? this.sliderHeight : -this.sliderHeight;
          $currentPanel.css({top: verticalOffset, opacity: 1});

          $currentPanel.animate({top: 0}, this.options.effectDuration);
          if (this.options.transitionEffect === "vertical-push") {
            $previousPanel.animate({top: -verticalOffset}, this.options.effectDuration, this.finalizeTransition);
          } else {
            $previousPanel.animate({top: -verticalOffset}, this.options.effectDuration, function() {
              $(this).css({top: 0});
              instance.finalizeTransition();
            });
          }
          break;

        default: // Default to fade if unknown or unsupported
          $currentPanel.css({opacity: 0})
                       .animate({opacity: 1}, this.options.effectDuration, this.finalizeTransition);
          break;
      }
    },

    /**
     * Destroys the slider instance, removing all added elements and event listeners.
     */
    destroy: function() {
      this.haltAutoPlay();
      this.clearResumeTimer();
      clearInterval(this.autoPlayClock); // Ensure timer is cleared

      // Remove event listeners
      this.$mainElement.off('.flexslider');
      this.$outerContainer.off('.flexslider');
      $(window).off('resize.flexslider');

      // Remove added classes and data attributes
      this.$mainElement.removeClass('flex-slider-initialized with-pips').removeData('flexslider-initialized');
      this.$panels.removeClass('slider-panel').css({
        position: '', top: '', left: '', zIndex: '', display: '', opacity: ''
      });

      // Unwrap the main element, removing the wrapper and all its contents
      this.$mainElement.unwrap();

      // Remove dynamically added elements
      this.$autoPlayIndicator && this.$autoPlayIndicator.remove();
      this.$captionArea && this.$captionArea.remove();
      this.$pips && this.$pips.remove();
      this.$outerContainer.find('.slider-directional-nav').remove();
      this.$outerContainer.find('.responsive-placeholder').remove();

      // Reset internal state
      this.currentPanelIdx = 0;
      this.totalPanels = 0;
      this.sliderWidth = null;
      this.sliderHeight = null;
      this.isTransitioning = null;
      this.isAutoPlaying = null;
      this.timerProgressDegrees = 0;
      this.autoPlayClock = null;
      this.resumeTimeout = null;

      console.log("FlexSlider: Instance destroyed for", this.$mainElement[0]);
    }
  };

  // Attach the plugin to jQuery's prototype.
  $.fn.flexSlider = function (options) {
    // Iterate over each selected element to apply the plugin.
    return this.each(function () {
      // Create a new instance of the slider core for each element.
      // Use $.extend to create a fresh object, preventing shared state issues.
      var sliderInstance = $.extend(true, {}, SLIDER_CORE);
      sliderInstance.initialize(this, options);
      // Store the instance on the element's data for later access (e.g., for destroy method).
      $(this).data('flexSliderInstance', sliderInstance);
    });
  };

})(jQuery);