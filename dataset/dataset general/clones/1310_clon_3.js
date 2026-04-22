;(function (jQuery) {
  // Ensure jQuery is available
  if (typeof jQuery === 'undefined') {
    console.error('jQuery is not loaded. Carousel cannot initialize.');
    return;
  }

  // Define some internal constants for better readability
  const _CAROUSEL_CONSTS = {
    ANIMATION_TYPE_SLIDE: 'slide',
    ANIMATION_TYPE_FADE: 'fade',
    EVENT_TOUCHSTART: 'touchstart',
    EVENT_CLICK: 'click',
    CLASS_ACTIVE: 'active',
    CLASS_DISABLED: 'disabled',
    CLASS_PREV: 'prev',
    CLASS_NEXT: 'next',
    CLASS_PAUSE: 'pause',
    CLASS_PLAY: 'play',
    SELECTOR_SLIDES_WRAPPER: '.slides',
    SELECTOR_SLIDE_ITEMS: '.slides > li',
    SELECTOR_CLONE_CLASS: 'clone',
    SELECTOR_CONTROL_NAV: '.flex-control-nav',
    SELECTOR_CONTROL_NAV_LINKS: '.flex-control-nav li a',
    SELECTOR_DIRECTION_NAV: '.flex-direction-nav',
    SELECTOR_DIRECTION_NAV_LINKS: '.flex-direction-nav li a',
    SELECTOR_PAUSEPLAY_TOGGLE: '.flex-pauseplay',
    SELECTOR_PAUSEPLAY_SPAN: '.flex-pauseplay span'
  };

  /**
   * Primary module constructor for the image carousel.
   * This function initializes a new carousel instance on the given root element.
   * @param {jQuery} rootElement - The jQuery object representing the main carousel container.
   * @param {Object} userOptions - Configuration settings provided by the user.
   */
  jQuery.flexslider = function(rootElement, userOptions) {
    let imageCarousel = rootElement;

    // Validate the root element
    if (!rootElement || rootElement.length === 0) {
      console.warn('Carousel initialization failed: Root element not found.');
      return;
    }

    /**
     * Initializes all internal properties and sets up the carousel.
     * This method is called once to prepare the carousel for interaction.
     */
    imageCarousel.initializeCarousel = function() {
      // Merge default settings with user-provided options
      imageCarousel.currentSettings = jQuery.extend({}, jQuery.flexslider.defaultConfiguration, userOptions);

      // Store a flag on the element indicating it's a flexslider instance
      imageCarousel.data('flexslider-initialized', true);

      // Select and cache essential DOM elements
      imageCarousel.slideContainer = imageCarousel.find(_CAROUSEL_CONSTS.SELECTOR_SLIDES_WRAPPER);
      imageCarousel.imageItems = imageCarousel.find(_CAROUSEL_CONSTS.SELECTOR_SLIDE_ITEMS);
      imageCarousel.totalItems = imageCarousel.imageItems.length;

      // Initialize state variables
      imageCarousel.isMoving = false; // Flag to prevent multiple animations
      imageCarousel.activeSlideIndex = imageCarousel.currentSettings.slideToStart;
      imageCarousel.targetSlideIndex = imageCarousel.activeSlideIndex; // The index the carousel is currently animating towards
      imageCarousel.isAtBoundary = (imageCarousel.activeSlideIndex === 0) || (imageCarousel.activeSlideIndex === (imageCarousel.totalItems - 1));
      imageCarousel.interactionTrigger = ('ontouchstart' in document.documentElement) ? _CAROUSEL_CONSTS.EVENT_TOUCHSTART : _CAROUSEL_CONSTS.EVENT_CLICK;
      imageCarousel.numClonedItems = 0; // Number of cloned slides for seamless looping
      imageCarousel.clonePositionOffset = 0; // Offset due to cloned slides
      imageCarousel.pausedByUser = false; // Flag if user manually paused slideshow
      imageCarousel.isVerticalDirection = (imageCarousel.currentSettings.slideDirection === "vertical");

      // Determine the CSS property for animation (top or marginLeft)
      imageCarousel.cssTransformProperty = imageCarousel.isVerticalDirection ? "top" : "marginLeft";
      imageCarousel.animationArguments = {}; // Object to hold CSS properties for animation

      // Feature detection for CSS3 transitions
      imageCarousel.supportsCSSTransitions = "webkitTransition" in document.body.style || "transition" in document.body.style;
      if (imageCarousel.supportsCSSTransitions) {
        imageCarousel.cssTransformProperty = "-webkit-transform"; // Prefer transform for performance
        if (!("webkitTransition" in document.body.style)) { // Check for standard transition if webkit not present
            imageCarousel.cssTransformProperty = "transform";
        }
      }

      // Check for external controls container
      if (imageCarousel.currentSettings.controlsContainer) {
        imageCarousel.customControlsWrapper = jQuery(imageCarousel.currentSettings.controlsContainer).eq(imageCarousel.find(_CAROUSEL_CONSTS.SELECTOR_SLIDES_WRAPPER).index(imageCarousel.slideContainer));
        imageCarousel.hasCustomControls = imageCarousel.customControlsWrapper.length > 0;
      } else {
        imageCarousel.hasCustomControls = false;
      }

      // Check for custom manual controls (pagination links)
      if (imageCarousel.currentSettings.manualControls) {
        imageCarousel.externalPaginationLinks = jQuery(imageCarousel.currentSettings.manualControls, (imageCarousel.hasCustomControls ? imageCarousel.customControlsWrapper : imageCarousel));
        imageCarousel.hasExternalPagination = imageCarousel.externalPaginationLinks.length > 0;
      } else {
        imageCarousel.hasExternalPagination = false;
      }

      ///////////////////////////////////////////////////////////////////
      // Carousel: Randomize Slide Order (optional)
      if (imageCarousel.currentSettings.randomize) {
        const shuffledItems = imageCarousel.imageItems.toArray().sort(() => (Math.random() - 0.5));
        imageCarousel.slideContainer.empty().append(shuffledItems);
        imageCarousel.imageItems = imageCarousel.find(_CAROUSEL_CONSTS.SELECTOR_SLIDE_ITEMS); // Re-cache after reordering
      }
      ///////////////////////////////////////////////////////////////////

      ///////////////////////////////////////////////////////////////////
      // Carousel: Slide Animation Setup
      if (imageCarousel.currentSettings.animation.toLowerCase() === _CAROUSEL_CONSTS.ANIMATION_TYPE_SLIDE) {
        if (imageCarousel.supportsCSSTransitions) {
          imageCarousel.setTransitionDuration(0); // Initialize with no transition
        }

        // Handle animation looping for slide type
        if (imageCarousel.currentSettings.animationLoop) {
          imageCarousel.numClonedItems = 2;
          imageCarousel.clonePositionOffset = 1;
          imageCarousel.slideContainer
            .append(imageCarousel.imageItems.filter(':first').clone().addClass(_CAROUSEL_CONSTS.SELECTOR_CLONE_CLASS))
            .prepend(imageCarousel.imageItems.filter(':last').clone().addClass(_CAROUSEL_CONSTS.SELECTOR_CLONE_CLASS));
        }

        // Update the collection of all carousel items (including clones)
        imageCarousel.allCarouselItems = imageCarousel.find(_CAROUSEL_CONSTS.SELECTOR_SLIDE_ITEMS);

        // Calculate initial offset based on current slide and clones
        const initialOffsetMultiplier = -1 * (imageCarousel.activeSlideIndex + imageCarousel.clonePositionOffset);

        if (imageCarousel.isVerticalDirection) {
          imageCarousel.allCarouselItems.css({ "display": "block", "width": "100%", "float": "left" });
          // Set container height based on total items (including clones)
          imageCarousel.slideContainer.height((imageCarousel.totalItems + imageCarousel.numClonedItems) * 200 + "%").css("position", "absolute").width("100%");

          // Use a timeout to ensure browser has rendered initial heights correctly
          setTimeout(() => {
            imageCarousel.css({ "position": "relative" }).height(imageCarousel.imageItems.filter(':first').height());
            const currentItemHeight = imageCarousel.height();
            imageCarousel.animationArguments[imageCarousel.cssTransformProperty] = imageCarousel.supportsCSSTransitions
              ? `translate3d(0, ${initialOffsetMultiplier * currentItemHeight}px, 0)`
              : `${initialOffsetMultiplier * currentItemHeight}px`;
            imageCarousel.slideContainer.css(imageCarousel.animationArguments);
          }, 100);

        } else { // Horizontal sliding
          const currentItemWidth = imageCarousel.width();
          imageCarousel.animationArguments[imageCarousel.cssTransformProperty] = imageCarousel.supportsCSSTransitions
            ? `translate3d(${initialOffsetMultiplier * currentItemWidth}px, 0, 0)`
            : `${initialOffsetMultiplier * currentItemWidth}px`;
          imageCarousel.slideContainer.width((imageCarousel.totalItems + imageCarousel.numClonedItems) * 200 + "%").css(imageCarousel.animationArguments);

          setTimeout(() => {
            imageCarousel.allCarouselItems.width(imageCarousel.width()).css({ "float": "left", "display": "block" });
          }, 100);
        }

      } else { // Default to fade animation
        imageCarousel.supportsCSSTransitions = false; // Fade doesn't typically use CSS3 transitions in this context
        imageCarousel.imageItems.css({ "width": "100%", "float": "left", "marginRight": "-100%" });
        imageCarousel.imageItems.eq(imageCarousel.activeSlideIndex).fadeIn(imageCarousel.currentSettings.animationDuration);
      }
      ///////////////////////////////////////////////////////////////////

      ///////////////////////////////////////////////////////////////////
      // Carousel: Pagination Navigation (dots/numbers)
      if (imageCarousel.currentSettings.controlNav) {
        if (imageCarousel.hasExternalPagination) {
          imageCarousel.dotNavigation = imageCarousel.externalPaginationLinks;
        } else {
          let dotNavStructure = jQuery(`<ol class="${_CAROUSEL_CONSTS.SELECTOR_CONTROL_NAV.substring(1)}"></ol>`);
          imageCarousel.imageItems.each(function(idx) {
            dotNavStructure.append(`<li><a>${idx + 1}</a></li>`);
          });

          // Append to custom container or main carousel element
          if (imageCarousel.hasCustomControls) {
            imageCarousel.customControlsWrapper.append(dotNavStructure);
            imageCarousel.dotNavigation = imageCarousel.customControlsWrapper.find(_CAROUSEL_CONSTS.SELECTOR_CONTROL_NAV_LINKS);
          } else {
            imageCarousel.append(dotNavStructure);
            imageCarousel.dotNavigation = imageCarousel.find(_CAROUSEL_CONSTS.SELECTOR_CONTROL_NAV_LINKS);
          }
        }

        imageCarousel.dotNavigation.eq(imageCarousel.activeSlideIndex).addClass(_CAROUSEL_CONSTS.CLASS_ACTIVE);

        // Bind event handler for pagination links
        imageCarousel.dotNavigation.on(imageCarousel.interactionTrigger, function(evt) {
          evt.preventDefault();
          const clickedLink = jQuery(this);
          if (!clickedLink.hasClass(_CAROUSEL_CONSTS.CLASS_ACTIVE)) {
            const newIndex = imageCarousel.dotNavigation.index(clickedLink);
            imageCarousel.direction = (newIndex > imageCarousel.activeSlideIndex) ? _CAROUSEL_CONSTS.CLASS_NEXT : _CAROUSEL_CONSTS.CLASS_PREV;
            imageCarousel.performAnimation(newIndex, imageCarousel.currentSettings.pauseOnAction);
          }
        });
      }
      ///////////////////////////////////////////////////////////////////

      //////////////////////////////////////////////////////////////////
      // Carousel: Direction Navigation (prev/next arrows)
      if (imageCarousel.currentSettings.directionNav) {
        let arrowNavStructure = jQuery(`
          <ul class="${_CAROUSEL_CONSTS.SELECTOR_DIRECTION_NAV.substring(1)}">
            <li><a class="${_CAROUSEL_CONSTS.CLASS_PREV}" href="#">${imageCarousel.currentSettings.prevText}</a></li>
            <li><a class="${_CAROUSEL_CONSTS.CLASS_NEXT}" href="#">${imageCarousel.currentSettings.nextText}</a></li>
          </ul>
        `);

        if (imageCarousel.hasCustomControls) {
          imageCarousel.customControlsWrapper.append(arrowNavStructure);
          imageCarousel.arrowNavigation = imageCarousel.customControlsWrapper.find(_CAROUSEL_CONSTS.SELECTOR_DIRECTION_NAV_LINKS);
        } else {
          imageCarousel.append(arrowNavStructure);
          imageCarousel.arrowNavigation = imageCarousel.find(_CAROUSEL_CONSTS.SELECTOR_DIRECTION_NAV_LINKS);
        }

        // Set initial disabled states for arrows if not looping
        if (!imageCarousel.currentSettings.animationLoop) {
          if (imageCarousel.activeSlideIndex === 0) {
            imageCarousel.arrowNavigation.filter(`.${_CAROUSEL_CONSTS.CLASS_PREV}`).addClass(_CAROUSEL_CONSTS.CLASS_DISABLED);
          } else if (imageCarousel.activeSlideIndex === imageCarousel.totalItems - 1) {
            imageCarousel.arrowNavigation.filter(`.${_CAROUSEL_CONSTS.CLASS_NEXT}`).addClass(_CAROUSEL_CONSTS.CLASS_DISABLED);
          }
        }

        // Bind event handlers for direction arrows
        imageCarousel.arrowNavigation.on(imageCarousel.interactionTrigger, function(evt) {
          evt.preventDefault();
          const isNextButton = jQuery(this).hasClass(_CAROUSEL_CONSTS.CLASS_NEXT);
          const destinationIndex = isNextButton ? imageCarousel.getDestinationIndex(_CAROUSEL_CONSTS.CLASS_NEXT) : imageCarousel.getDestinationIndex(_CAROUSEL_CONSTS.CLASS_PREV);

          if (imageCarousel.canProceed(destinationIndex)) {
            imageCarousel.performAnimation(destinationIndex, imageCarousel.currentSettings.pauseOnAction);
          }
        });
      }
      //////////////////////////////////////////////////////////////////

      //////////////////////////////////////////////////////////////////
      // Carousel: Keyboard Navigation
      if (imageCarousel.currentSettings.keyboardNav && jQuery(_CAROUSEL_CONSTS.SELECTOR_SLIDES_WRAPPER, 'body').length === 1) {
        const handleKeyboardInput = (evt) => {
          if (imageCarousel.isMoving) return; // Prevent input during animation

          const LEFT_ARROW = 37;
          const RIGHT_ARROW = 39;

          if (evt.keyCode !== RIGHT_ARROW && evt.keyCode !== LEFT_ARROW) return;

          let destinationIndex;
          if (evt.keyCode === RIGHT_ARROW) {
            destinationIndex = imageCarousel.getDestinationIndex(_CAROUSEL_CONSTS.CLASS_NEXT);
          } else if (evt.keyCode === LEFT_ARROW) {
            destinationIndex = imageCarousel.getDestinationIndex(_CAROUSEL_CONSTS.CLASS_PREV);
          }

          if (imageCarousel.canProceed(destinationIndex)) {
            imageCarousel.performAnimation(destinationIndex, imageCarousel.currentSettings.pauseOnAction);
          }
        };
        jQuery(document).on('keyup', handleKeyboardInput);
      }
      //////////////////////////////////////////////////////////////////

      ///////////////////////////////////////////////////////////////////
      // Carousel: Mousewheel Interaction
      if (imageCarousel.currentSettings.mousewheel) {
        imageCarousel.scrollEventIdentifier = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
        imageCarousel.on(imageCarousel.scrollEventIdentifier, function(evt) {
          evt.preventDefault();
          const rawEvent = evt.originalEvent || window.event;
          const scrollMagnitude = rawEvent.detail ? rawEvent.detail * -1 : rawEvent.wheelDelta / 40;
          const destinationIndex = (scrollMagnitude < 0) ? imageCarousel.getDestinationIndex(_CAROUSEL_CONSTS.CLASS_NEXT) : imageCarousel.getDestinationIndex(_CAROUSEL_CONSTS.CLASS_PREV);

          if (imageCarousel.canProceed(destinationIndex)) {
            imageCarousel.performAnimation(destinationIndex, imageCarousel.currentSettings.pauseOnAction);
          }
        });
      }
      ///////////////////////////////////////////////////////////////////

      //////////////////////////////////////////////////////////////////
      // Carousel: Slideshow Automation
      if (imageCarousel.currentSettings.slideshow) {
        // Pause on hover functionality
        if (imageCarousel.currentSettings.pauseOnHover) {
          imageCarousel.hover(
            () => imageCarousel.suspendPlayback(),
            () => {
              if (!imageCarousel.pausedByUser) {
                imageCarousel.resumePlayback();
              }
            }
          );
        }

        // Start the automatic slideshow
        imageCarousel.autoAnimatedSlides = setInterval(imageCarousel.autoAdvanceSlides, imageCarousel.currentSettings.slideshowSpeed);
      }
      //////////////////////////////////////////////////////////////////

      //////////////////////////////////////////////////////////////////
      // Carousel: Pause/Play Toggle Button
      if (imageCarousel.currentSettings.pausePlay) {
        let playbackToggleStructure = jQuery(`<div class="${_CAROUSEL_CONSTS.SELECTOR_PAUSEPLAY_TOGGLE.substring(1)}"><span></span></div>`);

        if (imageCarousel.hasCustomControls) {
          imageCarousel.customControlsWrapper.append(playbackToggleStructure);
          imageCarousel.playbackToggle = imageCarousel.customControlsWrapper.find(_CAROUSEL_CONSTS.SELECTOR_PAUSEPLAY_SPAN);
        } else {
          imageCarousel.append(playbackToggleStructure);
          imageCarousel.playbackToggle = imageCarousel.find(_CAROUSEL_CONSTS.SELECTOR_PAUSEPLAY_SPAN);
        }

        let currentPlaybackState = imageCarousel.currentSettings.slideshow ? _CAROUSEL_CONSTS.CLASS_PAUSE : _CAROUSEL_CONSTS.CLASS_PLAY;
        imageCarousel.playbackToggle.addClass(currentPlaybackState).text(
          (currentPlaybackState === _CAROUSEL_CONSTS.CLASS_PAUSE) ? imageCarousel.currentSettings.pauseText : imageCarousel.currentSettings.playText
        );

        imageCarousel.playbackToggle.on(imageCarousel.interactionTrigger, function(evt) {
          evt.preventDefault();
          if (jQuery(this).hasClass(_CAROUSEL_CONSTS.CLASS_PAUSE)) {
            imageCarousel.suspendPlayback();
            imageCarousel.pausedByUser = true;
          } else {
            imageCarousel.resumePlayback();
            imageCarousel.pausedByUser = false;
          }
        });
      }
      //////////////////////////////////////////////////////////////////

      //////////////////////////////////////////////////////////////////
      // Carousel: Touch Swipe Gestures
      // Adapted from various touch-enabled libraries for concepts.
      if ('ontouchstart' in document.documentElement) {
        let touchStartCoordX,
          touchStartCoordY,
          currentSwipeOffset,
          viewportDimension,
          swipeDelta,
          swipeStartTime,
          isSwipeScrolling = false;

        // Attach touch event listeners to the carousel element
        imageCarousel.each(function() {
          this.addEventListener(_CAROUSEL_CONSTS.EVENT_TOUCHSTART, onSwipeStart, false);
        });

        function onSwipeStart(evt) {
          if (imageCarousel.isMoving) {
            evt.preventDefault();
            return;
          }

          if (evt.touches.length === 1) {
            imageCarousel.suspendPlayback(); // Pause slideshow during swipe
            viewportDimension = imageCarousel.isVerticalDirection ? imageCarousel.height() : imageCarousel.width();
            swipeStartTime = Number(new Date());
            currentSwipeOffset = imageCarousel.isVerticalDirection
              ? (imageCarousel.activeSlideIndex + imageCarousel.clonePositionOffset) * imageCarousel.height()
              : (imageCarousel.activeSlideIndex + imageCarousel.clonePositionOffset) * imageCarousel.width();

            touchStartCoordX = imageCarousel.isVerticalDirection ? evt.touches[0].pageY : evt.touches[0].pageX;
            touchStartCoordY = imageCarousel.isVerticalDirection ? evt.touches[0].pageX : evt.touches[0].pageY;

            imageCarousel.setTransitionDuration(0); // Disable transitions during swipe

            this.addEventListener('touchmove', onSwipeMove, false);
            this.addEventListener('touchend', onSwipeEnd, false);
          }
        }

        function onSwipeMove(evt) {
          swipeDelta = imageCarousel.isVerticalDirection
            ? touchStartCoordX - evt.touches[0].pageY
            : touchStartCoordX - evt.touches[0].pageX;

          // Determine if the user is scrolling or swiping
          isSwipeScrolling = imageCarousel.isVerticalDirection
            ? (Math.abs(swipeDelta) < Math.abs(evt.touches[0].pageX - touchStartCoordY))
            : (Math.abs(swipeDelta) < Math.abs(evt.touches[0].pageY - touchStartCoordY));

          if (!isSwipeScrolling) {
            evt.preventDefault();
            if (imageCarousel.currentSettings.animation === _CAROUSEL_CONSTS.ANIMATION_TYPE_SLIDE && imageCarousel.supportsCSSTransitions) {
              if (!imageCarousel.currentSettings.animationLoop) {
                // Apply friction near boundaries if not looping
                const atFirst = imageCarousel.activeSlideIndex === 0 && swipeDelta < 0;
                const atLast = imageCarousel.activeSlideIndex === imageCarousel.totalItems - 1 && swipeDelta > 0;
                if (atFirst || atLast) {
                  swipeDelta /= (Math.abs(swipeDelta) / viewportDimension + 2);
                }
              }
              const newOffset = -currentSwipeOffset - swipeDelta;
              imageCarousel.animationArguments[imageCarousel.cssTransformProperty] = imageCarousel.isVerticalDirection
                ? `translate3d(0, ${newOffset}px, 0)`
                : `translate3d(${newOffset}px, 0, 0)`;
              imageCarousel.slideContainer.css(imageCarousel.animationArguments);
            }
          }
        }

        function onSwipeEnd(evt) {
          imageCarousel.isMoving = false; // Reset animation flag
          if (imageCarousel.targetSlideIndex === imageCarousel.activeSlideIndex && !isSwipeScrolling && swipeDelta !== null) {
            const swipeThreshold = viewportDimension / 2;
            const timeThreshold = 550;
            const minSwipeDistance = 20;

            const shouldAdvance = (Math.abs(swipeDelta) > minSwipeDistance && Number(new Date()) - swipeStartTime < timeThreshold) || Math.abs(swipeDelta) > swipeThreshold;

            if (shouldAdvance) {
              const destinationIndex = (swipeDelta > 0) ? imageCarousel.getDestinationIndex(_CAROUSEL_CONSTS.CLASS_NEXT) : imageCarousel.getDestinationIndex(_CAROUSEL_CONSTS.CLASS_PREV);
              if (imageCarousel.canProceed(destinationIndex)) {
                imageCarousel.performAnimation(destinationIndex, imageCarousel.currentSettings.pauseOnAction);
              } else {
                imageCarousel.performAnimation(imageCarousel.activeSlideIndex, imageCarousel.currentSettings.pauseOnAction); // Snap back
              }
            } else {
              imageCarousel.performAnimation(imageCarousel.activeSlideIndex, imageCarousel.currentSettings.pauseOnAction); // Snap back
            }
          }

          // Clean up touch event listeners
          this.removeEventListener('touchmove', onSwipeMove, false);
          this.removeEventListener('touchend', onSwipeEnd, false);
          touchStartCoordX = null;
          touchStartCoordY = null;
          swipeDelta = null;
          currentSwipeOffset = null;
        }
      }
      //////////////////////////////////////////////////////////////////

      //////////////////////////////////////////////////////////////////
      // Carousel: Responsive Resize Adjustments
      if (imageCarousel.currentSettings.animation.toLowerCase() === _CAROUSEL_CONSTS.ANIMATION_TYPE_SLIDE) {
        jQuery(window).on('resize', function(){
          if (imageCarousel.isMoving) return; // Do not resize during animation

          // Recalculate dimensions and reposition
          const firstItemDimension = imageCarousel.isVerticalDirection
            ? imageCarousel.imageItems.filter(':first').height()
            : imageCarousel.imageItems.filter(':first').width();

          const targetPosition = (-1 * (imageCarousel.activeSlideIndex + imageCarousel.clonePositionOffset)) * firstItemDimension;

          if (imageCarousel.isVerticalDirection) {
            imageCarousel.height(firstItemDimension); // Adjust main carousel height
          } else {
            imageCarousel.allCarouselItems.width(imageCarousel.width()); // Adjust individual slide widths
          }

          imageCarousel.animationArguments[imageCarousel.cssTransformProperty] = imageCarousel.supportsCSSTransitions
            ? (imageCarousel.isVerticalDirection ? `translate3d(0, ${targetPosition}px, 0)` : `translate3d(${targetPosition}px, 0, 0)`)
            : `${targetPosition}px`;

          if (imageCarousel.supportsCSSTransitions) {
            imageCarousel.setTransitionDuration(0); // Instantly snap to new position
          }
          imageCarousel.slideContainer.css(imageCarousel.animationArguments);
        });
      }
      //////////////////////////////////////////////////////////////////

      //////////////////////////////////////////////////////////////////
      // Carousel: Cleanup/Destroy Function (commented out as per original)
      /*
      imageCarousel.destroyCarousel = function() {
        imageCarousel.suspendPlayback();
        if (imageCarousel.dotNavigation && !imageCarousel.currentSettings.manualControls) {
          imageCarousel.dotNavigation.closest(_CAROUSEL_CONSTS.SELECTOR_CONTROL_NAV).remove();
        }
        if (imageCarousel.arrowNavigation) {
          imageCarousel.arrowNavigation.closest(_CAROUSEL_CONSTS.SELECTOR_DIRECTION_NAV).remove();
        }
        if (imageCarousel.currentSettings.pausePlay) {
          imageCarousel.playbackToggle.closest(_CAROUSEL_CONSTS.SELECTOR_PAUSEPLAY_TOGGLE).remove();
        }
        if (imageCarousel.currentSettings.keyboardNav && jQuery(_CAROUSEL_CONSTS.SELECTOR_SLIDES_WRAPPER, 'body').length === 1) {
          jQuery(document).off('keyup', handleKeyboardInput); // Assuming handleKeyboardInput is accessible
        }
        if (imageCarousel.currentSettings.mousewheel) {
          imageCarousel.off(imageCarousel.scrollEventIdentifier);
        }
        if (imageCarousel.supportsCSSTransitions) {
          imageCarousel.each(function(){this.removeEventListener(_CAROUSEL_CONSTS.EVENT_TOUCHSTART, onSwipeStart, false);});
        }
        if (imageCarousel.currentSettings.animation === _CAROUSEL_CONSTS.ANIMATION_TYPE_SLIDE && imageCarousel.currentSettings.animationLoop) {
          imageCarousel.allCarouselItems.filter(`.${_CAROUSEL_CONSTS.SELECTOR_CLONE_CLASS}`).remove();
        }
        if (imageCarousel.isVerticalDirection) {
          imageCarousel.height("auto");
        }
        imageCarousel.imageItems.hide();
        imageCarousel.removeData('flexslider-initialized');
      };
      */
      //////////////////////////////////////////////////////////////////

      // Execute the start callback function
      imageCarousel.currentSettings.start(imageCarousel);
    };

    /**
     * Helper function to set the CSS transition duration.
     * @param {number} duration - The duration in milliseconds.
     */
    imageCarousel.setTransitionDuration = function(duration) {
      if (!imageCarousel.supportsCSSTransitions) return;
      const transitionStyle = duration === 0 ? 'none' : `${duration / 1000}s ease-out`;
      imageCarousel.slideContainer.css({
        '-webkit-transition': transitionStyle,
        'transition': transitionStyle
      });
    };

    /**
     * Determines the next slide index based on direction.
     * @param {string} direction - 'next' or 'prev'.
     * @returns {number} The calculated target slide index.
     */
    imageCarousel.getDestinationIndex = function(direction) {
      if (direction === _CAROUSEL_CONSTS.CLASS_NEXT) {
        return (imageCarousel.activeSlideIndex === imageCarousel.totalItems - 1) && imageCarousel.currentSettings.animationLoop
          ? 0
          : imageCarousel.activeSlideIndex + 1;
      } else { // 'prev'
        return (imageCarousel.activeSlideIndex === 0) && imageCarousel.currentSettings.animationLoop
          ? imageCarousel.totalItems - 1
          : imageCarousel.activeSlideIndex - 1;
      }
    };

    /**
     * Checks if the carousel can advance to the target index.
     * @param {number} targetIndex - The index to check.
     * @returns {boolean} True if advancement is possible, false otherwise.
     */
    imageCarousel.canProceed = function(targetIndex) {
      if (imageCarousel.isMoving) return false; // Already animating

      if (!imageCarousel.currentSettings.animationLoop) {
        if (targetIndex < 0 || targetIndex >= imageCarousel.totalItems) {
          return false; // Cannot go beyond boundaries if not looping
        }
      }
      return true;
    };

    /**
     * Initiates the slide animation to a new target index.
     * @param {number} newTargetIndex - The index of the slide to animate to.
     * @param {boolean} shouldPause - Whether to pause the slideshow after this animation.
     */
    imageCarousel.performAnimation = function(newTargetIndex, shouldPause) {
      if (imageCarousel.isMoving) return;

      imageCarousel.isMoving = true; // Set animating flag
      imageCarousel.targetSlideIndex = newTargetIndex;
      imageCarousel.currentSettings.before(imageCarousel); // Call before animation callback

      if (shouldPause) {
        imageCarousel.suspendPlayback();
      }

      // Update pagination navigation (dots)
      if (imageCarousel.currentSettings.controlNav) {
        imageCarousel.dotNavigation.removeClass(_CAROUSEL_CONSTS.CLASS_ACTIVE).eq(newTargetIndex).addClass(_CAROUSEL_CONSTS.CLASS_ACTIVE);
      }

      // Update boundary status and direction navigation (arrows)
      imageCarousel.isAtBoundary = (newTargetIndex === 0 || newTargetIndex === imageCarousel.totalItems - 1);
      if (!imageCarousel.currentSettings.animationLoop && imageCarousel.currentSettings.directionNav) {
        imageCarousel.arrowNavigation.removeClass(_CAROUSEL_CONSTS.CLASS_DISABLED); // Clear all disabled states
        if (newTargetIndex === 0) {
          imageCarousel.arrowNavigation.filter(`.${_CAROUSEL_CONSTS.CLASS_PREV}`).addClass(_CAROUSEL_CONSTS.CLASS_DISABLED);
        } else if (newTargetIndex === imageCarousel.totalItems - 1) {
          imageCarousel.arrowNavigation.filter(`.${_CAROUSEL_CONSTS.CLASS_NEXT}`).addClass(_CAROUSEL_CONSTS.CLASS_DISABLED);
        }
      }

      // Handle end of non-looping slideshow
      if (!imageCarousel.currentSettings.animationLoop && newTargetIndex === imageCarousel.totalItems - 1) {
        imageCarousel.suspendPlayback();
        imageCarousel.currentSettings.end(imageCarousel); // Call end of cycle callback
      }

      if (imageCarousel.currentSettings.animation.toLowerCase() === _CAROUSEL_CONSTS.ANIMATION_TYPE_SLIDE) {
        const slideDimension = imageCarousel.isVerticalDirection
          ? imageCarousel.imageItems.filter(':first').height()
          : imageCarousel.imageItems.filter(':first').width();

        let finalSlidePosition;

        // Handle looping logic for slide type
        if (imageCarousel.activeSlideIndex === 0 && newTargetIndex === imageCarousel.totalItems - 1 && imageCarousel.currentSettings.animationLoop && imageCarousel.direction !== _CAROUSEL_CONSTS.CLASS_NEXT) {
          finalSlidePosition = "0px"; // Jump to the beginning clone
        } else if (imageCarousel.activeSlideIndex === imageCarousel.totalItems - 1 && newTargetIndex === 0 && imageCarousel.currentSettings.animationLoop && imageCarousel.direction !== _CAROUSEL_CONSTS.CLASS_PREV) {
          finalSlidePosition = (-1 * (imageCarousel.totalItems + 1)) * slideDimension + "px"; // Jump to the end clone
        } else {
          finalSlidePosition = (-1 * (newTargetIndex + imageCarousel.clonePositionOffset)) * slideDimension + "px";
        }

        imageCarousel.animationArguments[imageCarousel.cssTransformProperty] = finalSlidePosition;

        if (imageCarousel.supportsCSSTransitions) {
          imageCarousel.setTransitionDuration(imageCarousel.currentSettings.animationDuration);
          const transformValue = imageCarousel.isVerticalDirection
            ? `translate3d(0, ${finalSlidePosition}, 0)`
            : `translate3d(${finalSlidePosition}, 0, 0)`;
          imageCarousel.animationArguments[imageCarousel.cssTransformProperty] = transformValue;

          // Use 'one' to ensure the event handler is removed after the first trigger
          imageCarousel.slideContainer.css(imageCarousel.animationArguments).one("webkitTransitionEnd transitionend", function(){
            imageCarousel.completeAnimationCycle(slideDimension);
          });
        } else {
          imageCarousel.slideContainer.animate(imageCarousel.animationArguments, imageCarousel.currentSettings.animationDuration, function(){
            imageCarousel.completeAnimationCycle(slideDimension);
          });
        }
      } else { // Default to Fade animation
        imageCarousel.imageItems.eq(imageCarousel.activeSlideIndex).fadeOut(imageCarousel.currentSettings.animationDuration);
        imageCarousel.imageItems.eq(newTargetIndex).fadeIn(imageCarousel.currentSettings.animationDuration, function() {
          imageCarousel.completeAnimationCycle();
        });
      }
    };

    /**
     * Finalizes the animation cycle, performs necessary jumps for looping, and resets flags.
     * @param {number} [slideDimension] - The width/height of a single slide (required for slide animation).
     */
    imageCarousel.completeAnimationCycle = function(slideDimension) {
      if (imageCarousel.currentSettings.animation === _CAROUSEL_CONSTS.ANIMATION_TYPE_SLIDE) {
        // Perform "jump" to actual slide if currently on a clone
        if (imageCarousel.activeSlideIndex === 0 && imageCarousel.targetSlideIndex === imageCarousel.totalItems - 1 && imageCarousel.currentSettings.animationLoop) {
          imageCarousel.animationArguments[imageCarousel.cssTransformProperty] = (-1 * imageCarousel.totalItems) * slideDimension + "px";
          if (imageCarousel.supportsCSSTransitions) {
            imageCarousel.setTransitionDuration(0);
            imageCarousel.animationArguments[imageCarousel.cssTransformProperty] = imageCarousel.isVerticalDirection
              ? `translate3d(0, ${imageCarousel.animationArguments[imageCarousel.cssTransformProperty]}, 0)`
              : `translate3d(${imageCarousel.animationArguments[imageCarousel.cssTransformProperty]}, 0, 0)`;
          }
          imageCarousel.slideContainer.css(imageCarousel.animationArguments);
        } else if (imageCarousel.activeSlideIndex === imageCarousel.totalItems - 1 && imageCarousel.targetSlideIndex === 0 && imageCarousel.currentSettings.animationLoop) {
          imageCarousel.animationArguments[imageCarousel.cssTransformProperty] = -1 * slideDimension + "px";
          if (imageCarousel.supportsCSSTransitions) {
            imageCarousel.setTransitionDuration(0);
            imageCarousel.animationArguments[imageCarousel.cssTransformProperty] = imageCarousel.isVerticalDirection
              ? `translate3d(0, ${imageCarousel.animationArguments[imageCarousel.cssTransformProperty]}, 0)`
              : `translate3d(${imageCarousel.animationArguments[imageCarousel.cssTransformProperty]}, 0, 0)`;
          }
          imageCarousel.slideContainer.css(imageCarousel.animationArguments);
        }
      }
      imageCarousel.isMoving = false; // Reset animation flag
      imageCarousel.activeSlideIndex = imageCarousel.targetSlideIndex; // Update current slide index
      imageCarousel.currentSettings.after(imageCarousel); // Call after animation callback
    };

    /**
     * Advances the slideshow automatically to the next item.
     */
    imageCarousel.autoAdvanceSlides = function() {
      if (!imageCarousel.isMoving) {
        imageCarousel.performAnimation(imageCarousel.getDestinationIndex(_CAROUSEL_CONSTS.CLASS_NEXT));
      }
    };

    /**
     * Pauses the automatic slideshow.
     */
    imageCarousel.suspendPlayback = function() {
      clearInterval(imageCarousel.autoAnimatedSlides);
      if (imageCarousel.currentSettings.pausePlay) {
        imageCarousel.playbackToggle.removeClass(_CAROUSEL_CONSTS.CLASS_PAUSE).addClass(_CAROUSEL_CONSTS.CLASS_PLAY).text(imageCarousel.currentSettings.playText);
      }
    };

    /**
     * Resumes the automatic slideshow.
     */
    imageCarousel.resumePlayback = function() {
      imageCarousel.autoAnimatedSlides = setInterval(imageCarousel.autoAdvanceSlides, imageCarousel.currentSettings.slideshowSpeed);
      if (imageCarousel.currentSettings.pausePlay) {
        imageCarousel.playbackToggle.removeClass(_CAROUSEL_CONSTS.CLASS_PLAY).addClass(_CAROUSEL_CONSTS.CLASS_PAUSE).text(imageCarousel.currentSettings.pauseText);
      }
    };

    // Initialize the carousel when the function is called
    imageCarousel.initializeCarousel();
  };

  // Default configuration settings for the carousel
  jQuery.flexslider.defaultConfiguration = {
    animation: "fade",              // String: Select your animation type, "fade" or "slide"
    slideDirection: "horizontal",   // String: Select the sliding direction, "horizontal" or "vertical"
    slideshow: true,                // Boolean: Animate slider automatically
    slideshowSpeed: 7000,           // Number: Set the speed of the slideshow cycling, in milliseconds
    animationDuration: 600,         // Number: Set the speed of animations, in milliseconds
    directionNav: true,             // Boolean: Create navigation for previous/next navigation? (true/false)
    controlNav: true,               // Boolean: Create navigation for paging control of each slide? (true/false)
    keyboardNav: true,              // Boolean: Allow slider navigating via keyboard left/right keys
    mousewheel: false,              // Boolean: Allow slider navigating via mousewheel
    prevText: "Previous",           // String: Set the text for the "previous" directionNav item
    nextText: "Next",               // String: Set the text for the "next" directionNav item
    pausePlay: false,               // Boolean: Create pause/play dynamic element
    pauseText: 'Pause',             // String: Set the text for the "pause" pausePlay item
    playText: 'Play',               // String: Set the text for the "play" pausePlay item
    randomize: false,               // Boolean: Randomize slide order
    slideToStart: 0,                // Integer: The slide that the slider should start on. Array notation (0 = first slide)
    animationLoop: true,            // Boolean: Should the animation loop? If false, directionNav will disable at ends
    pauseOnAction: true,            // Boolean: Pause the slideshow when interacting with control elements (pagination, direction nav, etc)
    pauseOnHover: false,            // Boolean: Pause the slideshow when hovering over slider, then resume when no longer hovering
    controlsContainer: "",          // jQuery Object/Selector: Selector for container that holds the the FlexSlider controls. If empty, the slider loads control elements inside the jQuery object
    manualControls: "",             // jQuery Object/Selector: Selector for custom control navigation.
    start: function(){},            // Callback: Function executed when the slider is ready
    before: function(){},           // Callback: Function executed before each slide transition
    after: function(){},            // Callback: Function executed after each slide transition
    end: function(){}               // Callback: Function executed when the slider reaches the last slide (only when animationLoop is false)
  };

  // Extend jQuery prototype to allow direct calls like `jQuery('#slider').flexslider();`
  jQuery.fn.flexslider = function (options) {
    return this.each(function () {
      new jQuery.flexslider(jQuery(this), options);
    });
  };

})(jQuery);