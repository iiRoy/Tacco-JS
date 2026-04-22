/*
 * SlideFlow v1.0.0 - Dynamic content presentation module
 * https://example.com/slideflow
 *
 * Primary Developer: AlphaDev
 * Core Contributor: BetaTech
 *
 * Copyright 2023, InnovationLabs - https://innovationlabs.com
 *
 * Licensed under the MIT license - http://opensource.org/licenses/MIT
 */

(function (jq) {
  "use strict";

  // Default configuration for the slider instance
  var baseConfiguration;

  baseConfiguration = {
    // Structural elements and their containers
    mainContainerElement: '<div class="sf-frame" />', // Overall container for everything, including navigation
    contentPaneWrapper: '<div class="sf-item-container" />', // Wrapper for slides and controls
    slideViewportCropper: '<div class="sf-item-crop" />', // Additional wrapper specifically around content items
    baseListClass: 'sf-list', // Class applied to the original unordered list element
    itemSelectors: 'li', // DOM elements that represent individual content items
    activeItemClass: 'sf-current', // Class for the currently displayed slide/item
    intrinsicPlaceholderClass: 'sf-spacer', // Class for an element that maintains aspect ratio
    loadingIndicatorClass: 'sf-loading-state', // Class indicating content is being loaded

    // Behavioral options
    autoAdjustHeight: true, // If true, container height adapts to the current slide's content
    initialSlideIndex: 1, // Starting item index (1-based), or 'random' for a random start
    loopContent: true, // Enables continuous looping (first -> last and last -> first transitions)
    captionSource: 'imageAlt', // 'imageAlt', 'elementTitle' [imagealt takes from img alt/title, elementTitle from slide element's title attribute]
    captionPosition: 'overlay', // Position: 'overlay', 'below', 'custom', or false to disable
    captionElementSelector: '.sf-caption-text', // jQuery selector for the caption display area
    allowSingleItemInit: true, // Initialize slider even if only one content item is present
    responsiveLayout: true,
    resourcePreloadStrategy: 'visible', // 'visible', 'all' | Defines which resources to load before displaying the slider

    // Pagination settings
    showPagination: true,
    paginationClass: 'sf-pagination',

    // Navigation controls settings
    showNavigationControls: true,
    controlsContainerClass: 'sf-nav-controls',
    previousButtonClass: 'sf-prev-btn',
    previousButtonText: 'Backward',
    nextButtonClass: 'sf-next-btn',
    nextButtonText: 'Forward',
    hideControlsAtEnds: true, // Hide prev/next buttons when at first/last slide if not looping

    // Transition effects
    transitionEffect: 'fade', // 'fade', 'horizontalScroll', 'verticalScroll', 'kenburnsEffect', false for instant
    kenburnsZoomLevel: 125, // Maximum zoom for Ken Burns effect (in %)
    itemSpacing: 0, // Percentage of spacing between slides (e.g., 5 for 5% gap)
    transitionInProgressClass: 'sf-in-transition', // Class applied during an active transition
    animationDurationMs: 800, // Time in milliseconds for the transition animation
    animationEasing: 'swing', // Easing function for animations (e.g., 'linear', 'swing')
    seamlessLooping: true, // Enables seamless transitions between first/last slides, requires loopContent: true
    useCSSTransitions: true, // true, false -> falls back to jQuery animate if CSS transitions not supported

    // Autoplay settings
    autoPlay: true,
    autoPlayDirection: 'next',
    pauseOnHover: true,
    pauseOnHoverDelayMs: 150,
    initialAutoPlayDelayMs: 600,
    autoPlayIntervalMs: 4500,

    // Callback functions
    onSliderInitialized: function (currentIndex) { // Triggered when the slider is fully loaded and ready
      return this;
    },
    onSlideChangeStart: function (nextItem, oldIndex, newIndex) { // Before a slide transition begins
      return this;
    },
    onSlideChangeComplete: function (currentItem, oldIndex, newIndex) { // After a slide transition finishes
      return this;
    }
  };

  jq.fn.slideFlow = function (customOptions) {
    var sliderReference, targetElement, setupPlaceholderElement, fetchAspectRatio, initializeSlider,
      updateDisplayCaption, buildPagination, buildNavigationControls,
      markAsReady, onAnimationEnd, detectCSSTransitionEvent,
      setupCaptions, refreshPagination, setPlaceholderDimensions,
      performTransition, updateCurrentItem, displayTargetItem,
      refreshNavigationControls, adjustBoundaryFlags,
      determineCSSSupport, preloadResources, beginSliderAutoPlay,
      extractPropertiesFromSelector;

    // The jQuery object representing the element(s) the plugin is called on
    targetElement = this;

    // If no elements are selected, gracefully exit
    if (targetElement.length === 0) {
      return this;
    }
    // Handle multiple elements by iterating and applying the plugin to each
    if (targetElement.length > 1) {
      targetElement.each(function () {
        jq(this).slideFlow(customOptions);
      });
      return this;
    }

    // Object to store the slider's internal state and configuration
    sliderReference = {};
    sliderReference.internalState = {};

    // Merge default settings with user-provided options
    sliderReference.activeOptions = jq.extend(true, {}, baseConfiguration, customOptions);

    // Utility to detect the correct CSS transition end event name for the browser
    detectCSSTransitionEvent = function () { // Credit: http://stackoverflow.com/a/18672988
      var tmpDiv, eventNames, vendorPrefixes;
      tmpDiv = document.createElement('div');
      vendorPrefixes = {
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'transitionend',
        'MSTransition': 'msTransitionEnd',
        'OTransition': 'oTransitionEnd',
        'transition': 'transitionEnd transitionend'
      };
      for (var prop in vendorPrefixes) {
        if (tmpDiv.style[prop] !== undefined) {
          return vendorPrefixes[prop];
        }
      }
      return null; // No support for CSS transitions
    };

    // Utility to check for CSS property support
    determineCSSSupport = (function () { // Credit: http://net.tutsplus.com/tutorials/html-css-techniques/quick-tip-detect-css-support-in-browsers-with-javascript/
      var testDiv = document.createElement('div'),
        browserVendors = ['Khtml', 'Ms', 'O', 'Moz', 'Webkit'],
        numVendors = browserVendors.length;
      return function (property) {
        if (property in testDiv.style) {
          return true;
        }
        property = property.charAt(0).toUpperCase() + property.substr(1); // Capitalize first letter
        while (numVendors--) {
          if (browserVendors[numVendors] + property in testDiv.style) {
            return true;
          }
        }
        return false;
      };
    }());

    // Helper to create a jQuery element from a selector string, applying ID/class attributes
    extractPropertiesFromSelector = function (selectorString, attributeSource) {
      var attributeParts, newJqElement, idAttribute, classAttribute;
      attributeParts = attributeSource.split('.');
      newJqElement = jq(selectorString);
      idAttribute = '';
      classAttribute = '';

      jq.each(attributeParts, function (idx, part) {
        if (part.indexOf('#') === 0) {
          idAttribute += part.substring(1);
        } else if (part.length > 0) {
          classAttribute += part + ' ';
        }
      });

      if (idAttribute.length) {
        newJqElement.attr('id', idAttribute);
      }
      if (classAttribute.length) {
        newJqElement.attr('class', jq.trim(classAttribute));
      }
      return newJqElement;
    };

    // Applies Ken Burns effect to the active slide
    var applyKenburnsEffect = function () {
      var startPosition, animationDuration, animationProperties, cssProperties;
      animationProperties = {};
      cssProperties = {};
      startPosition = 100 - sliderReference.activeOptions.kenburnsZoomLevel;
      cssProperties.width = sliderReference.activeOptions.kenburnsZoomLevel + '%';

      // Alternate starting positions based on slide index
      if (sliderReference.internalState.currentItem.index() % 2 === 0) {
        cssProperties.left = startPosition + '%';
        cssProperties.top = startPosition + '%';
        animationProperties.left = '0%';
        animationProperties.top = '0%';
      } else {
        cssProperties.left = '0%';
        cssProperties.top = '0%';
        animationProperties.left = startPosition + '%';
        animationProperties.top = startPosition + '%';
      }

      animationDuration = sliderReference.activeOptions.autoPlayIntervalMs + sliderReference.activeOptions.animationDurationMs * 2;
      sliderReference.internalState.currentItem.css(cssProperties);
      sliderReference.internalState.currentItem.animate(animationProperties, { duration: animationDuration, easing: sliderReference.activeOptions.animationEasing, queue: false });
    };

    // Marks the slider as ready after initial setup or placeholder updates
    markAsReady = function () {
      if (sliderReference.internalState.isFirstLoad) {
        sliderReference.internalState.mainContainerElement.removeClass(sliderReference.activeOptions.loadingIndicatorClass);
        sliderReference.internalState.isFirstLoad = false;
        if (sliderReference.activeOptions.autoPlay) {
          targetElement.startAutoPlayback();
        }
        // If CSS transitions are not used and Ken Burns is active, apply it via JS
        if (!sliderReference.activeOptions.useCSSTransitions && sliderReference.activeOptions.transitionEffect === 'kenburnsEffect') {
          applyKenburnsEffect();
        }
        sliderReference.activeOptions.onSliderInitialized.call(undefined, sliderReference.internalState.currentItem.index());
      } else {
        jq('.' + sliderReference.activeOptions.intrinsicPlaceholderClass, sliderReference.internalState.contentPaneWrapper).addClass('ready');
      }
    };

    // Sets the padding-top for the intrinsic placeholder to maintain aspect ratio
    setPlaceholderDimensions = function (widthValue, heightValue) {
      if (heightValue === 0) {
        if (sliderReference.activeOptions.debugMode) {
          console.warn("Attempted to set placeholder dimensions with zero height. Skipping.");
        }
        markAsReady(); // Ensure ready state even if dimensions are problematic
        return;
      }
      var aspectRatio = widthValue / heightValue;
      var paddingTopPercentage = (1 / aspectRatio * 100) + '%'; // Intrinsic ratio trick: http://alistapart.com/article/creating-intrinsic-ratios-for-video
      var placeholderElement = jq('.' + sliderReference.activeOptions.intrinsicPlaceholderClass, sliderReference.internalState.contentPaneWrapper);
      placeholderElement.css({ paddingTop: paddingTopPercentage }); // Responsive resizing without JS
      markAsReady();
    };

    // Fetches the aspect ratio of the active slide or a specified slide
    fetchAspectRatio = function ($slideItem) {
      var itemWidth, itemHeight;
      var slideImage = jq('img', $slideItem);

      if (slideImage.length > 0 && slideImage.attr("src") !== undefined) {
        var tempImage = jq("<img />");
        tempImage.on('load error', function () {
          itemWidth = $slideItem.width();
          itemHeight = $slideItem.height();
          setPlaceholderDimensions(itemWidth, itemHeight);
          tempImage.off('load error'); // Clean up event handlers
        }).attr("src", slideImage.attr("src"));
      } else {
        // For slides without images or with broken image sources,
        // defer calculation slightly to ensure CSS has rendered
        setTimeout(function() {
          itemWidth = $slideItem.width();
          itemHeight = $slideItem.height();
          setPlaceholderDimensions(itemWidth, itemHeight);
        }, 50); // Small delay
      }
    };

    // Prepares the placeholder div to occupy the necessary space for adaptive height
    setupPlaceholderElement = function () {
      var currentPlaceholder = jq('.' + sliderReference.activeOptions.intrinsicPlaceholderClass, sliderReference.internalState.contentPaneWrapper);
      if (currentPlaceholder.length === 0) {
        sliderReference.internalState.contentPaneWrapper.append(jq('<div class="' + sliderReference.activeOptions.intrinsicPlaceholderClass + '" />'));
      }

      if (sliderReference.activeOptions.autoAdjustHeight === true) {
        // If height should adapt, use the active element's dimensions
        fetchAspectRatio(jq('.' + sliderReference.activeOptions.activeItemClass, targetElement));
      } else {
        // Otherwise, find the tallest element to set a fixed height
        var tallestItem, maxHeight, iterationCount;
        maxHeight = 0;
        iterationCount = 0;
        jq(sliderReference.internalState.allItems).each(function () {
          var currentItemHeight = jq(this).height();
          if (currentItemHeight > maxHeight) {
            tallestItem = jq(this);
            maxHeight = currentItemHeight;
          }
          iterationCount++;
          if (iterationCount === sliderReference.internalState.totalItems) {
            // Ensure a fallback if no item has height or all are 0
            if (tallestItem === undefined || maxHeight === 0) {
              tallestItem = jq(sliderReference.internalState.allItems[0]);
            }
            fetchAspectRatio(tallestItem);
          }
        });
      }
    };

    // Updates the visual state of the pagination indicators
    refreshPagination = function () {
      if (sliderReference.activeOptions.showPagination) {
        jq('.' + sliderReference.activeOptions.paginationClass + ' li', sliderReference.internalState.mainContainerElement)
          .removeClass(sliderReference.activeOptions.activeItemClass)
          .eq(sliderReference.internalState.currentItem.index())
          .addClass(sliderReference.activeOptions.activeItemClass);
      }
    };

    // Updates the visibility and state of navigation control buttons
    refreshNavigationControls = function () {
      if (!sliderReference.activeOptions.loopContent && sliderReference.activeOptions.hideControlsAtEnds) {
        var prevButton = jq('.' + sliderReference.activeOptions.previousButtonClass, sliderReference.internalState.mainContainerElement);
        var nextButton = jq('.' + sliderReference.activeOptions.nextButtonClass, sliderReference.internalState.mainContainerElement);

        sliderReference.internalState.atFirstItem ? prevButton.hide() : prevButton.show();
        sliderReference.internalState.atLastItem ? nextButton.hide() : nextButton.show();
      }
    };

    // Updates the displayed caption text based on the current slide
    updateDisplayCaption = function () {
      var captionText, captionContainer;
      if (sliderReference.activeOptions.captionPosition !== false) {
        if (sliderReference.activeOptions.captionSource !== 'imageAlt') {
          captionText = sliderReference.internalState.currentItem.attr('title');
        } else {
          var imgElement = jq('img', sliderReference.internalState.currentItem);
          captionText = imgElement.attr('title') || imgElement.attr('alt');
        }

        if (sliderReference.activeOptions.captionPosition !== 'custom') {
          captionContainer = jq(sliderReference.activeOptions.captionElementSelector, sliderReference.internalState.mainContainerElement);
        } else {
          captionContainer = jq(sliderReference.activeOptions.captionElementSelector);
        }

        if (captionText && captionText.length > 0) {
          captionContainer.html(captionText).show();
        } else {
          captionContainer.hide();
        }
      }
    };

    // Public method to start the automatic slide progression
    targetElement.startAutoPlayback = function () {
      var state = sliderReference.internalState;
      var opts = sliderReference.activeOptions;

      if (state.autoPlayTimer === undefined && state.autoPlayDelayTimer === undefined) {
        state.autoPlayDelayTimer = window.setTimeout(function () {
          state.isAutoPlayDelayed = false;
          state.autoPlayTimer = window.setInterval(function () {
            state.triggerSource = 'auto';
            displayTargetItem(opts.autoPlayDirection);
          }, opts.autoPlayIntervalMs);
        }, state.isAutoPlayDelayed ? opts.pauseOnHoverDelayMs : opts.initialAutoPlayDelayMs);

        if (opts.pauseOnHover) {
          state.contentPaneWrapper.off('mouseenter mouseleave')
            .on('mouseenter', function () {
              if (state.autoPlayTimer !== undefined) {
                state.isHoveringToStop = true;
                targetElement.stopAutoPlayback();
              } else {
                state.isHoveringToStop = false;
              }
            })
            .on('mouseleave', function () {
              if (state.isHoveringToStop) {
                state.isAutoPlayDelayed = true;
                targetElement.startAutoPlayback();
              }
            });
        }
      }
    };

    // Public method to stop the automatic slide progression
    targetElement.stopAutoPlayback = function () {
      window.clearInterval(sliderReference.internalState.autoPlayTimer);
      sliderReference.internalState.autoPlayTimer = undefined;
      window.clearTimeout(sliderReference.internalState.autoPlayDelayTimer);
      sliderReference.internalState.autoPlayDelayTimer = undefined;
    };

    // Public method to re-render slider elements and update their state
    targetElement.reinitializeSliderView = function () {
      sliderReference.internalState.allItems.removeClass(sliderReference.activeOptions.activeItemClass);
      sliderReference.internalState.currentItem.addClass(sliderReference.activeOptions.activeItemClass);
      if (sliderReference.activeOptions.responsiveLayout) {
        setupPlaceholderElement();
      } else {
        markAsReady();
      }
      refreshNavigationControls();
      refreshPagination();
      updateDisplayCaption();
    };

    // Wrapper for reinitializeSliderView
    updateCurrentItem = function () {
      targetElement.reinitializeSliderView();
    };

    // Callback when a CSS or JS transition completes
    onAnimationEnd = function () {
      var state = sliderReference.internalState;
      var opts = sliderReference.activeOptions;

      state.isTransitioning = false;
      state.currentItem.removeClass(opts.transitionInProgressClass);
      if (!state.isFirstLoad) {
        state.previousItem.removeClass('sf-ken-animated'); // Remove Ken Burns class from previous
      }
      state.previousItem.removeClass(opts.transitionInProgressClass);
      opts.onSlideChangeComplete.call(undefined, state.currentItem, state.previousItem.index(), state.currentItem.index());
      if (opts.autoPlay) {
        if (!state.isHoveringToStop || state.isHoveringToStop === undefined) {
          targetElement.startAutoPlayback();
        }
      }
    };

    // Executes the slide transition animation
    performTransition = function () {
      var targetPosition, isJumpTransition, oldPositionLeft, oldPositionValue, kenburnsAnimTime, axisRef, cssProps = {};
      var state = sliderReference.internalState;
      var opts = sliderReference.activeOptions;

      opts.onSlideChangeStart.call(undefined, state.currentItem, state.previousItem.index(), state.currentItem.index());

      if (opts.transitionEffect !== false) {
        state.isTransitioning = true;
        if (opts.transitionEffect === 'fade' || opts.transitionEffect === 'kenburnsEffect') {
          if (state.isFirstLoad) {
            if (opts.useCSSTransitions) {
              state.allItems.css({ transitionDuration: opts.animationDurationMs + 'ms', opacity: 0 });
            } else {
              state.allItems.css({ opacity: 0 });
            }
            state.currentItem.css('opacity', 1);
            if (opts.transitionEffect === 'kenburnsEffect') {
              if (opts.useCSSTransitions) {
                kenburnsAnimTime = opts.autoPlayIntervalMs + opts.animationDurationMs * 2;
                state.allItems.css({ animationDuration: kenburnsAnimTime + 'ms' });
                state.currentItem.addClass('sf-ken-animated');
              }
            }
            onAnimationEnd();
          } else {
            if (opts.useCSSTransitions) {
              state.previousItem.addClass(opts.transitionInProgressClass).css('opacity', 0);
              state.currentItem.addClass(opts.transitionInProgressClass).css('opacity', 1);
              if (opts.transitionEffect === 'kenburnsEffect') {
                state.currentItem.addClass('sf-ken-animated');
              }
              // Bugfix for Safari 7: transitionend might not fire on tab switch
              jq(window).off('focus.slideflow').on('focus.slideflow', function () {
                if (state.isTransitioning) {
                  state.previousItem.trigger(state.cssTransitionEvent);
                }
              });
              state.previousItem.one(state.cssTransitionEvent, function () {
                onAnimationEnd();
              });
            } else {
              if (opts.transitionEffect === 'kenburnsEffect') {
                applyKenburnsEffect();
              }
              state.previousItem.addClass(opts.transitionInProgressClass).animate({
                opacity: 0
              }, opts.animationDurationMs, opts.animationEasing, function () {
                onAnimationEnd();
              });
              state.currentItem.addClass(opts.transitionInProgressClass).css('opacity', 0).animate({
                opacity: 1
              }, opts.animationDurationMs, opts.animationEasing);
            }
          }
          updateCurrentItem();
        } else if (opts.transitionEffect === 'horizontalScroll' || opts.transitionEffect === 'verticalScroll') {
          axisRef = (opts.transitionEffect === 'horizontalScroll') ? 'left' : 'top';
          targetPosition = '-' + state.currentItem.index() * (100 + opts.itemSpacing) + '%';

          if (state.isFirstLoad) {
            targetElement.css(axisRef, targetPosition);
            onAnimationEnd();
          } else {
            if (opts.seamlessLooping && (state.triggerSource === 'controls' || state.triggerSource === 'auto')) {
              isJumpTransition = true;
              oldPositionValue = targetPosition; // Store the final position
              if (state.atFirstItem) { // Transitioning from last to first
                oldPositionLeft = 0; // Where the element was initially
                state.currentItem.css(axisRef, state.totalItems * (100 + opts.itemSpacing) + '%'); // Move new item off-screen to the right
                targetPosition = '-' + state.totalItems * (100 + opts.itemSpacing) + '%'; // Target position for the container
              } else { // Transitioning from first to last
                oldPositionLeft = (state.totalItems - 1) * (100 + opts.itemSpacing) + '%'; // Where the element was initially
                state.currentItem.css(axisRef, -(100 + opts.itemSpacing) + '%'); // Move new item off-screen to the left
                targetPosition = (100 + opts.itemSpacing) + '%'; // Target position for the container
              }
            }
            state.currentItem.addClass(opts.transitionInProgressClass);
            if (opts.useCSSTransitions) {
              cssProps[axisRef] = targetPosition;
              cssProps.transitionDuration = opts.animationDurationMs + 'ms';
              targetElement.addClass(opts.transitionEffect);
              targetElement.css(cssProps);
              jq(window).off('focus.slideflow').on('focus.slideflow', function () { // Bugfix for Safari 7
                if (state.isTransitioning) {
                  targetElement.trigger(state.cssTransitionEvent);
                }
              });
              targetElement.one(state.cssTransitionEvent, function () {
                targetElement.removeClass(opts.transitionEffect);
                if (isJumpTransition) {
                  state.currentItem.css(axisRef, oldPositionLeft);
                  targetElement.css(axisRef, oldPositionValue);
                  // Immediately reset transition duration to 0 for instant jump
                  targetElement.css({ transitionDuration: '0ms' });
                }
                onAnimationEnd();
              });
            } else {
              cssProps[axisRef] = targetPosition;
              targetElement.stop().animate(cssProps, opts.animationDurationMs, opts.animationEasing, function () {
                if (isJumpTransition) {
                  state.currentItem.css(axisRef, oldPositionLeft);
                  targetElement.css(axisRef, oldPositionValue);
                }
                onAnimationEnd();
              });
            }
          }
          updateCurrentItem();
        }
      } else {
        updateCurrentItem();
        onAnimationEnd();
      }
    };

    // Updates flags indicating if the slider is at the first or last item
    adjustBoundaryFlags = function (itemIndex) {
      var state = sliderReference.internalState;
      state.atFirstItem = (itemIndex === 0);
      state.atLastItem = (itemIndex === state.totalItems - 1);
    };

    // Main function to display a specific slide
    displayTargetItem = function (slideIdentifier) {
      var newIndex;
      var state = sliderReference.internalState;
      var opts = sliderReference.activeOptions;

      if (state.isTransitioning) {
        return; // Prevent new transitions while one is active
      }

      // Stop autoplay if interaction is manual
      if (state.triggerSource !== 'auto') {
        targetElement.stopAutoPlayback();
      }

      var currentItemIndex = state.currentItem.index();
      newIndex = currentItemIndex; // Default to current if no change

      if (slideIdentifier === 'prev') {
        if (currentItemIndex > 0) {
          newIndex = currentItemIndex - 1;
        } else if (opts.loopContent) {
          newIndex = state.totalItems - 1;
          state.triggerSource = 'controls'; // Mark as control triggered for seamless loop logic
        }
      } else if (slideIdentifier === 'next') {
        if (currentItemIndex < state.totalItems - 1) {
          newIndex = currentItemIndex + 1;
        } else if (opts.loopContent) {
          newIndex = 0;
          state.triggerSource = 'controls'; // Mark as control triggered for seamless loop logic
        }
      } else if (typeof slideIdentifier === 'number') {
        newIndex = slideIdentifier - 1; // Convert 1-based to 0-based index
      } else {
        if (opts.debugMode) {
          console.warn("Invalid slide identifier provided:", slideIdentifier);
        }
        return;
      }

      // Validate newIndex
      if (newIndex < 0 || newIndex >= state.totalItems) {
        if (!opts.loopContent) {
          if (opts.debugMode) {
            console.info("Slide transition blocked: Reached end/beginning and looping is disabled.");
          }
          return;
        }
        // If looping is enabled, newIndex should already be handled by the logic above.
        // This is a safety catch.
        newIndex = Math.max(0, Math.min(newIndex, state.totalItems - 1));
      }

      // If the target slide is the same as the current one, do nothing
      if (newIndex === currentItemIndex) {
        return;
      }

      state.previousItem = state.currentItem;
      state.currentItem = jq(state.allItems[newIndex]);

      adjustBoundaryFlags(newIndex);
      performTransition();
    };

    // Initial setup of the slider
    initializeSlider = function () {
      var state = sliderReference.internalState;
      var opts = sliderReference.activeOptions;

      state.allItems = targetElement.children(opts.itemSelectors);
      state.totalItems = state.allItems.length;

      // Do not initialize if only one slide and initSingle is false
      if (state.totalItems <= 1 && !opts.allowSingleItemInit) {
        if (opts.debugMode) {
          console.info("SlideFlow: Only one slide found, and 'allowSingleItemInit' is false. Initialization aborted.");
        }
        return;
      }

      // Setup main wrapper and content pane
      targetElement.addClass(opts.baseListClass); // Apply base class to original element
      state.mainContainerElement = extractPropertiesFromSelector('<div />', opts.mainContainerElement);
      state.contentPaneWrapper = extractPropertiesFromSelector('<div />', opts.contentPaneWrapper);
      state.slideViewportCropper = extractPropertiesFromSelector('<div />', opts.slideViewportCropper);

      targetElement.wrap(state.mainContainerElement).wrap(state.contentPaneWrapper).wrap(state.slideViewportCropper);
      state.mainContainerElement = targetElement.parents('.' + jq(opts.mainContainerElement).attr('class'));
      state.contentPaneWrapper = targetElement.parents('.' + jq(opts.contentPaneWrapper).attr('class'));
      state.slideViewportCropper = targetElement.parents('.' + jq(opts.slideViewportCropper).attr('class'));

      state.mainContainerElement.addClass(opts.loadingIndicatorClass); // Add loading class initially

      // Set initial slide
      var startingIndex = (opts.initialSlideIndex === 'random') ?
        Math.floor(Math.random() * state.totalItems) :
        Math.max(0, Math.min(parseInt(opts.initialSlideIndex, 10) - 1, state.totalItems - 1));

      state.currentItem = jq(state.allItems[startingIndex]);
      state.currentItem.addClass(opts.activeItemClass);
      adjustBoundaryFlags(startingIndex);

      // Initialize CSS transition detection
      state.cssTransitionEvent = detectCSSTransitionEvent();
      if (!determineCSSSupport('transition') || !opts.useCSSTransitions) {
        opts.useCSSTransitions = false;
      }

      // Build pagination and controls
      buildPagination();
      buildNavigationControls();
      setupCaptions();

      // Initial update for controls and captions
      refreshNavigationControls();
      updateDisplayCaption();

      // Preload resources and then finish setup
      preloadResources();

      state.isFirstLoad = true; // Flag for initial load state
    };

    // Preload strategy: 'visible' or 'all'
    preloadResources = function () {
      var state = sliderReference.internalState;
      var opts = sliderReference.activeOptions;
      var imagesToLoad = [];

      if (opts.resourcePreloadStrategy === 'all') {
        jq('img', state.allItems).each(function () {
          var src = jq(this).attr('src');
          if (src) imagesToLoad.push(src);
        });
      } else { // 'visible'
        jq('img', state.currentItem).each(function () {
          var src = jq(this).attr('src');
          if (src) imagesToLoad.push(src);
        });
      }

      if (imagesToLoad.length > 0) {
        var loadedCount = 0;
        var totalCount = imagesToLoad.length;

        var onImageLoaded = function () {
          loadedCount++;
          if (loadedCount === totalCount) {
            setupPlaceholderElement();
          }
        };

        imagesToLoad.forEach(function (src) {
          var img = new Image();
          img.onload = onImageLoaded;
          img.onerror = onImageLoaded; // Count even broken images as 'loaded' to prevent infinite wait
          img.src = src;
        });
      } else {
        setupPlaceholderElement(); // No images to preload, proceed
      }
    };


    // Builds the pagination element
    buildPagination = function () {
      var state = sliderReference.internalState;
      var opts = sliderReference.activeOptions;

      if (opts.showPagination) {
        var paginationList = jq('<ul class="' + opts.paginationClass + '" />');
        state.allItems.each(function (idx) {
          var listItem = jq('<li />');
          var anchor = jq('<a />').attr('href', '#').data('slide-index', idx).text(idx + 1);
          listItem.append(anchor).appendTo(paginationList);
        });

        state.mainContainerElement.append(paginationList);
        paginationList.on('click', 'a', function (evt) {
          evt.preventDefault();
          state.triggerSource = 'pager';
          displayTargetItem(jq(this).data('slide-index') + 1); // +1 to convert to 1-based for displayTargetItem
        });
        refreshPagination(); // Set initial active state
      }
    };

    // Builds the navigation control buttons
    buildNavigationControls = function () {
      var state = sliderReference.internalState;
      var opts = sliderReference.activeOptions;

      if (opts.showNavigationControls) {
        var controlsContainer = jq('<div class="' + opts.controlsContainerClass + '" />');
        var prevButton = jq('<a href="#" class="' + opts.previousButtonClass + '">' + opts.previousButtonText + '</a>');
        var nextButton = jq('<a href="#" class="' + opts.nextButtonClass + '">' + opts.nextButtonText + '</a>');

        controlsContainer.append(prevButton).append(nextButton).appendTo(state.mainContainerElement);

        prevButton.on('click', function (evt) {
          evt.preventDefault();
          state.triggerSource = 'controls';
          displayTargetItem('prev');
        });
        nextButton.on('click', function (evt) {
          evt.preventDefault();
          state.triggerSource = 'controls';
          displayTargetItem('next');
        });
      }
    };

    // Sets up the caption display area
    setupCaptions = function () {
      var state = sliderReference.internalState;
      var opts = sliderReference.activeOptions;

      if (opts.captionPosition !== false && opts.captionPosition !== 'custom') {
        var captionWrapper = jq(opts.captionElementSelector, state.mainContainerElement);
        if (captionWrapper.length === 0) {
          // If the caption element doesn't exist within the main container, create it
          captionWrapper = jq('<div />').addClass(jq(opts.captionElementSelector).attr('class') || 'sf-caption-default');
          if (opts.captionPosition === 'overlay') {
            state.slideViewportCropper.append(captionWrapper);
          } else if (opts.captionPosition === 'below') {
            state.mainContainerElement.append(captionWrapper);
          }
        }
      }
    };

    // Kick off the initialization process
    initializeSlider();

    return this; // Maintain chainability
  };

})(jQuery);