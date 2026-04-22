(function (jQ) {
  "use strict";
  var configParams;

  configParams = {
    // Core structural elements and containers
    outerContainer: '<div class="caro-main" />', // Principal container for all components, including indicators
    paneHolder: '<div class="caro-items-wrap" />', // Container for the individual content panes and navigation
    paneViewport: '<div class="caro-items-crop" />', // Inner container specifically for cropping content panes
    rootClass: 'caro-list', // CSS class applied to the original element
    itemSelector: 'li', // HTML elements that hold the individual content panes
    currentClass: 'caro-active', // Class marking the currently displayed content pane
    aspectRatioSpacerClass: 'caro-spacer', // Class for the element that maintains the aspect ratio
    initialLoadClass: 'caro-loading', // Class applied during the initial loading phase

    // Operational parameters
    dynamicHeight: true, // Content pane height adjusts to the current pane's content
    initialIndex: 1, // Starting index (0-based or 1-based, here 1-based), or 'random'
    cyclicNavigation: true, // Allows navigation from first to last pane and vice-versa
    descriptionSource: 'img', // Source for pane descriptions: 'img' (alt/title attribute), 'el' (title of pane element)
    descriptionPosition: 'overlay', // Placement of descriptions: 'overlay', 'below', 'custom', false
    descriptionTarget: '.caro-caption', // jQ selector for the description container
    activateSingle: true, // Initialize even if there's only one content pane
    fluidLayout: true, // Enable responsive design adjustments
    resourcePreload: 'visible', // 'visible', 'all' | Specifies which resources to load before displaying the component

    // Page indicator settings
    pageIndicators: true, // Enable or disable pagination dots/numbers
    indicatorClass: 'caro-pagination', // Class for the pagination container

    // Navigation control settings
    navControls: true, // Enable or disable previous/next navigation buttons
    navControlGroupClass: 'caro-nav-controls', // Class for the navigation control wrapper
    prevControlClass: 'caro-prev', // Class for the 'previous' button
    prevControlText: 'Prior', // Text for the 'previous' button
    nextControlClass: 'caro-next', // Class for the 'next' button
    nextControlText: 'Following', // Text for the 'next' button
    concealEndControls: true, // Hide navigation buttons when at first/last pane (if not cyclic)

    // Animation and transition settings
    animationType: 'fade', // Type of transition: 'fade', 'horizontal', 'vertical', 'zoomEffect', false
    zoomEffectMagnitude: 125, // Maximum zoom level for 'zoomEffect' (in percent)
    itemSpacing: 0, // Space between content panes (in percent)
    animatingClass: 'anim-active', // Class applied to elements during an animation
    animationDuration: 750, // Time duration of the animation (in milliseconds)
    animationEasing: 'easeOutQuad', // Easing function for animations (requires jQuery UI or similar)
    seamlessTransition: true, // Enables seamless transitions between first/last panes (only with cyclicNavigation)
    useCSSTransitions: true, // true, false -> falls back to JS animations if no CSS support

    // Autoplay settings
    autoAdvance: true, // Enable automatic content pane advancement
    autoAdvanceDirection: 'next', // Direction for auto-advancement: 'next' or 'prev'
    pauseOnHover: true, // Pause auto-advancement when hovering over the component
    hoverPauseDelay: 120, // Delay before pausing auto-advancement on hover
    initialAutoDelay: 600, // Initial delay before auto-advancement starts
    autoAdvanceInterval: 3800, // Interval between automatic content pane changes

    // Callback functions for lifecycle events
    onComponentReady: function () { // Triggered when the component has finished loading
      return this;
    },
    onItemTransitionStart: function () { // Triggered before a content pane transition begins
      return this;
    },
    onItemTransitionEnd: function () {  // Triggered after a content pane transition has completed
      return this;
    }
  };

  jQ.fn.chameleon = function (configOptions) {
    var componentInstance, targetElement, prepareAspectRatioSpacer, fetchSpacerDimensions, initializeComponent, refreshDescription, setupPageIndicators, setupNavControls, componentReady, animationComplete, detectTransitionEvent,
      setupDescriptions, refreshPageIndicators, applySpacerDimensions, executeAnimation, refreshItemDisplay, navigateToItem, refreshNavControls, updateItemPositionStatus, checkCSSSupport, handlePreload, beginComponent, createElementFromSelector, performZoomEffect;

    // Store a reference to the jQuery object that invoked this plugin
    targetElement = this;

    // If no elements are selected, simply return without action
    if (targetElement.length === 0) {
      return this;
    }
    // Handle multiple selected elements by iterating and applying the plugin to each
    if (targetElement.length > 1) {
      targetElement.each(function () {
        jQ(this).chameleon(configOptions);
      });
      return this;
    }

    // Initialize an object to hold the component's internal state and configurations
    componentInstance = {};
    componentInstance.state = {};

    detectTransitionEvent = function () { // Credit: http://stackoverflow.com/a/18672988
      var propKey, testDiv, transitionEvents;
      testDiv = document.createElement('div');
      transitionEvents = {
        'WebkitTransition' : 'webkitTransitionEnd',
        'MozTransition'    : 'transitionend',
        'MSTransition'     : 'msTransitionEnd',
        'OTransition'      : 'oTransitionEnd',
        'transition'       : 'transitionEnd transitionend'
      };
      for (propKey in transitionEvents) {
        if (testDiv.style[propKey] !== undefined) {
          return transitionEvents[propKey];
        }
      }
    };

    checkCSSSupport = (function () {  // Credit: http://net.tutsplus.com/tutorials/html-css-techniques/quick-tip-detect-css-support-in-browsers-with-javascript/
      var tempDiv = document.createElement('div'),
        vendorPrefixes = ['Khtml', 'Ms', 'O', 'Moz', 'Webkit'],
        prefixCount = vendorPrefixes.length;
      return function (cssProperty) {
        if (cssProperty in tempDiv.style) {
          return true;
        }
        cssProperty = cssProperty.replace(/^[a-z]/, function (charVal) {
          return charVal.toUpperCase();
        });
        while (prefixCount--) {
          if (vendorPrefixes[prefixCount] + cssProperty in tempDiv.style) {
            return true;
          }
        }
        return false;
      };
    }());

    createElementFromSelector = function (selectorStr, cssPropertyStr) {
      var propertyParts, newJqElement, elementId, elementClasses;
      propertyParts = cssPropertyStr.split('.');
      newJqElement = jQ(selectorStr);
      elementId = '';
      elementClasses = '';
      jQ.each(propertyParts, function (idx, currentPart) {
        if (currentPart.indexOf('#') >= 0) {
          elementId += currentPart.replace(/^#/, '');
        } else {
          elementClasses += currentPart + ' ';
        }
      });
      if (elementId.length) {
        newJqElement.attr('id', elementId);
      }
      if (elementClasses.length) {
        newJqElement.attr('class', jQ.trim(elementClasses));
      }
      return newJqElement;
    };

    performZoomEffect = function () {
      var zoomStartValue, zoomDuration, animationProperties, cssProperties;
      animationProperties = {};
      cssProperties = {};
      zoomStartValue = 100 - componentInstance.settings.zoomEffectMagnitude;
      cssProperties.width = componentInstance.settings.zoomEffectMagnitude + '%';
      if (componentInstance.state.activeItem.index() % 2 === 0) { // Alternating start positions
        cssProperties.left = zoomStartValue + '%';
        cssProperties.top = zoomStartValue + '%';
        animationProperties.left = '0%';
        animationProperties.top = '0%';
      } else {
        cssProperties.left = '0%';
        cssProperties.top = '0%';
        animationProperties.left = zoomStartValue + '%';
        animationProperties.top = zoomStartValue + '%';
      }
      zoomDuration = componentInstance.settings.autoAdvanceInterval + componentInstance.settings.animationDuration * 2;
      componentInstance.state.activeItem.css(cssProperties);
      componentInstance.state.activeItem.animate(animationProperties, {duration: zoomDuration, easing: componentInstance.settings.animationEasing, queue: false});
    };

    componentReady = function () {
      if (componentInstance.state.isFreshLoad) {
        componentInstance.state.outerContainerRef.removeClass(componentInstance.settings.initialLoadClass);
        componentInstance.state.isFreshLoad = false;
        if (componentInstance.settings.autoAdvance) {
          targetElement.initiateAutoAdvance();
        }
        if (!componentInstance.settings.useCSSTransitions && componentInstance.settings.animationType === 'zoomEffect') {
          performZoomEffect();
        }
        componentInstance.settings.onComponentReady.call(undefined, componentInstance.state.activeItem.index());
      } else {
        jQ('.' + componentInstance.settings.aspectRatioSpacerClass, componentInstance.state.paneHolder).addClass('ready-state');
      }
    };

    applySpacerDimensions = function (elemWidth, elemHeight) {
      var aspectRatio, paddingPercentage, currentSpacer;
      aspectRatio = elemWidth / elemHeight;
      paddingPercentage = (1 / aspectRatio * 100) + '%';  // Clever intrinsic ratio trick: http://alistapart.com/article/creating-intrinsic-ratios-for-video
      currentSpacer = jQ('.' + componentInstance.settings.aspectRatioSpacerClass, componentInstance.state.paneHolder);
      currentSpacer.css({paddingTop: paddingPercentage}); // Dynamic resizing without JS, enabling true responsiveness
      componentReady();
    };

    fetchSpacerDimensions = function (currentPane) {
      var paneWidth, paneHeight;
      // Check if the pane contains an image with a src attribute
      if ((jQ('img', currentPane).attr("src") !== undefined)) {
        // Create a temporary image to load and get its dimensions
        jQ("<img />").load(function () {
          paneWidth = currentPane.width();
          paneHeight = currentPane.height();
          applySpacerDimensions(paneWidth, paneHeight);
        }).attr("src", jQ('img', currentPane).attr("src"));
      } else {
        // If no image, get dimensions directly from the pane
        paneWidth = currentPane.width();
        paneHeight = currentPane.height();
        applySpacerDimensions(paneWidth, paneHeight);
      }
    };

    prepareAspectRatioSpacer = function () {
      // Create the aspect ratio spacer if it doesn't exist
      if (jQ('.' + componentInstance.settings.aspectRatioSpacerClass, componentInstance.state.paneHolder).length === 0) {
        componentInstance.state.paneHolder.append(jQ('<div class="' + componentInstance.settings.aspectRatioSpacerClass + '" />'));
      }
      // Determine how to set the spacer's proportions
      if (componentInstance.settings.dynamicHeight === true) {  // If panes should always adapt to their content
        fetchSpacerDimensions(jQ('.' + componentInstance.settings.currentClass, targetElement));  // Use active pane's dimensions
      } else {  // Otherwise, find the tallest pane to set a consistent height
        var tallestPane, maxHeight, iterationCounter;
        maxHeight = 0;
        iterationCounter = 0;
        jQ(componentInstance.state.allItems).each(function () {
          if (jQ(this).height() > maxHeight) {
            tallestPane = jQ(this);
            maxHeight = tallestPane.height();
          }
          iterationCounter = iterationCounter + 1;
          if (iterationCounter === componentInstance.state.itemCount) {
            // Fallback if no tallest pane was found (e.g., empty slider)
            if (tallestPane === undefined) {
              tallestPane = jQ(componentInstance.state.allItems[0]);
            }
            fetchSpacerDimensions(tallestPane);
          }
        });
      }
    };

    refreshPageIndicators = function () {
      if (componentInstance.settings.pageIndicators) {
        // Remove active class from all pagination items
        jQ('.' + componentInstance.settings.indicatorClass + ' li', componentInstance.state.outerContainerRef).removeClass(componentInstance.settings.currentClass);
        // Add active class to the current page's indicator
        jQ(jQ('.' + componentInstance.settings.indicatorClass + ' li', componentInstance.state.outerContainerRef)[componentInstance.state.activeItem.index()]).addClass(componentInstance.settings.currentClass);
      }
    };

    refreshNavControls = function () {
      // Only apply this logic if looping is disabled and controls should hide at ends
      if (!componentInstance.settings.cyclicNavigation && componentInstance.settings.concealEndControls) {
        // Show/hide previous button based on whether it's the first item
        jQ('.' + componentInstance.settings.prevControlClass, componentInstance.state.outerContainerRef)[componentInstance.state.isFirstItem ? 'hide' : 'show']();
        // Show/hide next button based on whether it's the last item
        jQ('.' + componentInstance.settings.nextControlClass, componentInstance.state.outerContainerRef)[componentInstance.state.isLastItem ? 'hide' : 'show']();
      }
    };

    refreshDescription = function () {
      var descriptionText, descriptionContainer;
      // Proceed only if descriptions are enabled
      if (componentInstance.settings.descriptionPosition !== false) {
        // Determine the source of the description text
        if (componentInstance.settings.descriptionSource !== 'img') {
          descriptionText = componentInstance.state.activeItem.attr('title');
        } else {
          // Get title or alt attribute from image within the active item
          descriptionText = jQ('img', componentInstance.state.activeItem).attr('title') !== undefined ? jQ('img', componentInstance.state.activeItem).attr('title') : jQ('img', componentInstance.state.activeItem).attr('alt');
        }
        // Select the appropriate container for the description
        if (componentInstance.settings.descriptionPosition !== 'custom') {
          descriptionContainer = jQ(componentInstance.settings.descriptionTarget, componentInstance.state.outerContainerRef);
        } else {
          descriptionContainer = jQ(componentInstance.settings.descriptionTarget);
        }
        // Update container content and visibility based on description availability
        if ((descriptionText !== undefined) && (descriptionText !== '')) {
          descriptionContainer.html(descriptionText).show();
        } else {
          descriptionContainer.hide();
        }
      }
    };

    targetElement.initiateAutoAdvance = function () {
      // Start auto-advancement only if no timer or delay is currently active
      if ((componentInstance.state.autoTimer === undefined) && (componentInstance.state.autoDelayRef === undefined)) {
        componentInstance.state.autoDelayRef = window.setTimeout(function () {
          componentInstance.state.isAutoDelayActive = false;
          componentInstance.state.autoTimer = window.setInterval(function () {
            componentInstance.state.lastTrigger = 'auto';
            navigateToItem(componentInstance.settings.autoAdvanceDirection);
          }, componentInstance.settings.autoAdvanceInterval);
        }, componentInstance.state.isAutoDelayActive ? componentInstance.settings.hoverPauseDelay : componentInstance.settings.initialAutoDelay);

        // If pause on hover is enabled, set up hover event listeners
        if (componentInstance.settings.pauseOnHover) {
          componentInstance.state.paneHolder.unbind('mouseenter').unbind('mouseleave').bind('mouseenter', function () {
            if (componentInstance.state.autoTimer !== undefined) {
              componentInstance.state.hoverInterruptedAuto = true;
              targetElement.haltAutoAdvance();
            } else {
              componentInstance.state.hoverInterruptedAuto = false;
            }
          }).bind('mouseleave', function () {
            if (componentInstance.state.hoverInterruptedAuto) {
              componentInstance.state.isAutoDelayActive = true;
              targetElement.initiateAutoAdvance();
            }
          });
        }
      }
    };

    targetElement.haltAutoAdvance = function () {
      window.clearInterval(componentInstance.state.autoTimer);
      componentInstance.state.autoTimer = undefined;
      window.clearTimeout(componentInstance.state.autoDelayRef);
      componentInstance.state.autoDelayRef = undefined;
    };

    targetElement.refreshComponent = function () {
      componentInstance.state.allItems.removeClass(componentInstance.settings.currentClass);
      componentInstance.state.activeItem.addClass(componentInstance.settings.currentClass);
      if (componentInstance.settings.fluidLayout) {
        prepareAspectRatioSpacer();
      } else {
        componentReady();
      }
      refreshNavControls();
      refreshPageIndicators();
      refreshDescription();
    };

    refreshItemDisplay = function () {
      targetElement.refreshComponent();
    };

    animationComplete = function () {
      componentInstance.state.isAnimating = false;
      componentInstance.state.activeItem.removeClass(componentInstance.settings.animatingClass);
      if (!componentInstance.state.isFreshLoad) {
        componentInstance.state.previousItem.removeClass('caro-zoom'); // Specific class for zoom effect
      }
      componentInstance.state.previousItem.removeClass(componentInstance.settings.animatingClass);
      componentInstance.settings.onItemTransitionEnd.call(undefined, componentInstance.state.activeItem, componentInstance.state.previousItem.index(), componentInstance.state.activeItem.index());
      if (componentInstance.settings.autoAdvance) {
        if (!componentInstance.state.hoverInterruptedAuto || componentInstance.state.hoverInterruptedAuto === undefined){
          targetElement.initiateAutoAdvance();
        }
      }
    };

    executeAnimation = function () {
      var targetPosition, shouldJump, prevOffset, initialPosition, zoomTransitionTime, axisReference, dynamicCSSProps;
      componentInstance.settings.onItemTransitionStart.call(undefined, componentInstance.state.activeItem, componentInstance.state.previousItem.index(), componentInstance.state.activeItem.index());

      // Only perform animation if a transition type is specified
      if (componentInstance.settings.animationType !== false) {
        componentInstance.state.isAnimating = true;

        // Handle 'fade' or 'zoomEffect' transitions
        if ((componentInstance.settings.animationType === 'fade') || (componentInstance.settings.animationType === 'zoomEffect')) {
          if (componentInstance.state.isFreshLoad) { // Initial load state
            if (componentInstance.settings.useCSSTransitions) {
              componentInstance.state.allItems.css({transitionDuration: componentInstance.settings.animationDuration + 'ms', opacity: 0});
            } else {
              componentInstance.state.allItems.css({opacity: 0});
            }
            componentInstance.state.activeItem.css('opacity', 1);
            if (componentInstance.settings.animationType === 'zoomEffect') {
              if (componentInstance.settings.useCSSTransitions) {
                zoomTransitionTime = componentInstance.settings.autoAdvanceInterval + componentInstance.settings.animationDuration * 2;
                componentInstance.state.allItems.css({animationDuration: zoomTransitionTime + 'ms'});
                componentInstance.state.activeItem.addClass('caro-zoom');
              }
            }
            animationComplete(); // Mark animation as complete immediately
          } else { // Subsequent transitions
            if (componentInstance.settings.useCSSTransitions) {
              componentInstance.state.previousItem.addClass(componentInstance.settings.animatingClass).css('opacity', 0);
              componentInstance.state.activeItem.addClass(componentInstance.settings.animatingClass).css('opacity', 1);
              if (componentInstance.settings.animationType === 'zoomEffect') {
                componentInstance.state.activeItem.addClass('caro-zoom');
              }
              // Bugfix for Safari 7: re-trigger transitionEnd on focus if animation is stuck
              jQ(window).off('focus').on('focus', function () {
                if (componentInstance.state.isAnimating) {
                  componentInstance.state.previousItem.trigger(componentInstance.state.transitionEventName);
                }
              });
              // Wait for the transition to end on the old item
              componentInstance.state.previousItem.one(componentInstance.state.transitionEventName, function () {
                animationComplete();
                return this;
              });
            } else { // Fallback to jQuery animate for non-CSS transitions
              if (componentInstance.settings.animationType === 'zoomEffect') {
                performZoomEffect();
              }
              componentInstance.state.previousItem.addClass(componentInstance.settings.animatingClass).animate({
                opacity: 0
              }, componentInstance.settings.animationDuration, componentInstance.settings.animationEasing, function () {
                animationComplete();
              });
              componentInstance.state.activeItem.addClass(componentInstance.settings.animatingClass).css('opacity', 0).animate({
                opacity: 1
              }, componentInstance.settings.animationDuration, componentInstance.settings.animationEasing);
            }
          }
          refreshItemDisplay();
        } else if ((componentInstance.settings.animationType === 'horizontal') || (componentInstance.settings.animationType === 'vertical')) {
          axisReference = (componentInstance.settings.animationType === 'horizontal') ? 'left' : 'top';
          targetPosition = '-' + componentInstance.state.activeItem.index() * (100 + componentInstance.settings.itemSpacing) + '%';

          if (componentInstance.state.isFreshLoad) {
            targetElement.css(axisReference, targetPosition);
            animationComplete();
          } else {
            dynamicCSSProps = {};
            if (componentInstance.settings.seamlessTransition) {
              if (componentInstance.state.didJump && ((componentInstance.state.lastTrigger === 'controls') || (componentInstance.state.lastTrigger === 'auto'))) {
                shouldJump = true;
                initialPosition = targetPosition; // Store the actual target position
                if (componentInstance.state.isFirstItem) { // Transition from last to first
                  prevOffset = 0;
                  componentInstance.state.activeItem.css(axisReference, componentInstance.state.itemCount * (100 + componentInstance.settings.itemSpacing) + '%');
                  targetPosition = '-' + componentInstance.state.itemCount * (100 + componentInstance.settings.itemSpacing) + '%'; // Move element to fake end
                } else { // Transition from first to last
                  prevOffset = (componentInstance.state.itemCount - 1) * (100 + componentInstance.settings.itemSpacing) + '%';
                  componentInstance.state.activeItem.css(axisReference, -(100 + componentInstance.settings.itemSpacing) + '%');
                  targetPosition = (100 + componentInstance.settings.itemSpacing) + '%'; // Move element to fake start
                }
              }
            }
            componentInstance.state.activeItem.addClass(componentInstance.settings.animatingClass);
            if (componentInstance.settings.useCSSTransitions) {
              dynamicCSSProps[axisReference] = targetPosition;
              dynamicCSSProps.transitionDuration = componentInstance.settings.animationDuration + 'ms';
              targetElement.addClass(componentInstance.settings.animationType);
              targetElement.css(dynamicCSSProps);
              jQ(window).off('focus').on('focus', function () { // bugfix for safari 7 which doesn't always trigger ontransitionend when switching tab
                if (componentInstance.state.isAnimating) {
                  targetElement.trigger(componentInstance.state.transitionEventName);
                }
              });
              targetElement.one(componentInstance.state.transitionEventName, function () {
                targetElement.removeClass(componentInstance.settings.animationType);
                if (shouldJump) {
                  componentInstance.state.activeItem.css(axisReference, prevOffset);
                  dynamicCSSProps[axisReference] = initialPosition;
                  dynamicCSSProps.transitionDuration = '0ms'; // Reset for instant jump
                  targetElement.css(dynamicCSSProps);
                }
                animationComplete();
                return this;
              });
            } else { // Fallback to jQuery animate
              dynamicCSSProps[axisReference] = targetPosition;
              targetElement.stop().animate(dynamicCSSProps, componentInstance.settings.animationDuration, componentInstance.settings.animationEasing, function () {
                if (shouldJump) {
                  componentInstance.state.activeItem.css(axisReference, prevOffset);
                  targetElement.css(axisReference, initialPosition);
                }
                animationComplete();
                return this;
              });
            }
          }
          refreshItemDisplay();
        }
      } else { // No transition specified, just update display
        refreshItemDisplay();
        animationComplete();
      }
    };

    updateItemPositionStatus = function (itemIndex) {
      componentInstance.state.isFirstItem = componentInstance.state.isLastItem = false;
      if ((itemIndex === 'prev') || (itemIndex === 0)) {
        componentInstance.state.isFirstItem = true;
      } else if ((itemIndex === 'next') || (itemIndex === componentInstance.state.itemCount - 1)) {
        componentInstance.state.isLastItem = true;
      }
    };

    navigateToItem = function (targetItem) {
      var currentItemIndex;
      // Prevent navigation if an animation is already in progress
      if (!componentInstance.state.isAnimating) {
        // If not triggered by auto-advance, stop auto-advance
        if (componentInstance.state.lastTrigger !== 'auto') {
          targetElement.haltAutoAdvance();
        }
        currentItemIndex = componentInstance.state.activeItem.index();

        if (targetItem === 'prev') {
          if (currentItemIndex > 0) {
            targetItem = currentItemIndex - 1;
          } else if (componentInstance.settings.cyclicNavigation) {
            targetItem = componentInstance.state.itemCount - 1; // Loop to the last item
            componentInstance.state.didJump = true; // Mark as jump for seamless
          }
        } else if (targetItem === 'next') {
          if (currentItemIndex < componentInstance.state.itemCount - 1) {
            targetItem = currentItemIndex + 1;
          } else if (componentInstance.settings.cyclicNavigation) {
            targetItem = 0; // Loop to the first item
            componentInstance.state.didJump = true; // Mark as jump for seamless
          }
        }

        // Only proceed with transition if the target item is different from the current one
        // and is a valid index (or if it was a prev/next command that resulted in a loop)
        if (targetItem !== currentItemIndex && (typeof targetItem === 'number')) {
          componentInstance.state.previousItem = componentInstance.state.activeItem;
          componentInstance.state.activeItem = jQ(componentInstance.state.allItems[targetItem]);
          updateItemPositionStatus(targetItem);
          executeAnimation();
        } else if (componentInstance.state.didJump) { // Handle case where loop makes targetItem appear same, but it's a 'jump'
             componentInstance.state.previousItem = componentInstance.state.activeItem;
             componentInstance.state.activeItem = jQ(componentInstance.state.allItems[targetItem]);
             updateItemPositionStatus(targetItem);
             executeAnimation();
        }
      }
    };

    // The rest of the plugin initialization logic would go here,
    // including merging options, setting up DOM, initial slide, etc.
    // This part is omitted as it was not present in the original snippet.

    return this; // Maintain chainability
  };
})(jQuery);