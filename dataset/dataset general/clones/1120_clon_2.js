$.fn.rapidtour = function(config) {

  // Configuration defaults for the quick tour plugin
  var cfg = {

    // Main selector for tour steps
    targetClass: $(this).selector.replace('.', '').replace('#', ''),

    // Core operational settings
    general: {
      enableKeyNav: (config && config.general && config.general.enableKeyNav) ? config.general.enableKeyNav : true,
      autoScrollToTarget: (config && config.general && config.general.autoScrollToTarget) ? config.general.autoScrollToTarget : true,
      paddingAround: (config && config.general && config.general.paddingAround) ? config.general.paddingAround : '40px',
      animationDuration: (config && config.general && config.general.animationDuration) ? config.general.animationDuration : 0.3,
      minimumViewportHeight: (config && config.general && config.general.minimumViewportHeight) ? config.general.minimumViewportHeight : 400,
    },

    // Backdrop layer properties
    backdrop: {
      cssClass: (config && config.backdrop && config.backdrop.cssClass) ? config.backdrop.cssClass : 'rapidtour-backdrop',
      bgColor: (config && config.backdrop && config.backdrop.bgColor) ? config.backdrop.bgColor : 'rgba(0,0,0,0.8)',
      escapeToClose: (config && config.backdrop && config.backdrop.escapeToClose) ? config.backdrop.escapeToClose : true,
      onBackdropClose: (config && config.backdrop && config.backdrop.onBackdropClose && $.type(config.backdrop.onBackdropClose) === 'function') ? config.backdrop.onBackdropClose : false
    },

    // Navigation and action button definitions
    controls: {

      dismiss: {
        cssClass: 'rapidtour-btn-dismiss',
        labelText: (config && config.controls && config.controls.dismiss && config.controls.dismiss.labelText) ? config.controls.dismiss.labelText : 'Close',
        onDismiss: (config && config.controls && config.controls.dismiss && config.controls.dismiss.onDismiss && $.type(config.controls.dismiss.onDismiss) === 'function') ? config.controls.dismiss.onDismiss : false
      },

      previous: {
        cssClass: 'rapidtour-btn-previous',
        labelText: (config && config.controls && config.controls.previous && config.controls.previous.labelText) ? config.controls.previous.labelText : '&#10094;',
        onPrev: (config && config.controls && config.controls.previous && config.controls.previous.onPrev && $.type(config.controls.previous.onPrev) === 'function') ? config.controls.previous.onPrev : false
      },

      forward: {
        cssClass: 'rapidtour-btn-forward',
        labelText: (config && config.controls && config.controls.forward && config.controls.forward.labelText) ? config.controls.forward.labelText : '&#10095;',
        onNext: (config && config.controls && config.controls.forward && config.controls.forward.onNext && $.type(config.controls.forward.onNext) === 'function') ? config.controls.forward.onNext : false
      }

    },

    // CSS classes utilized by the plugin
    styles: {

      // Tooltip arrow directions
      pointerShapes: {
        pointUp: "rapidtour-bubble-arrow-up",
        pointRight: "rapidtour-bubble-arrow-right",
        pointDown: "rapidtour-bubble-arrow-down",
        pointLeft: "rapidtour-bubble-bubble-left"
      },

      // Content specific classes
      panelElements: {
        controlContainer: "rapidtour-control-area",
        mainPanel: "rapidtour-main-panel",
        messageText: "rapidtour-message-content",
        infoBubble: "rapidtour-info-bubble"
      }

    },

    // Custom data attributes used by the tour
    dataAttrs: {
      stepSequence: "data-rapidtour-step-order",
      originalElemPos: "data-rapidtour-previous-element-position",
      originalFixedPos: "data-rapidtour-previous-position",
      originalZIndex: "data-rapidtour-previous-zindex",
      guideTip: (config && config.dataAttrs && config.dataAttrs.guideTip) ? config.dataAttrs.guideTip : "data-rapidtour-tip"
    },

    // Callback invoked when the tour initializes
    onTourStart: (config && config.onTourStart && $.type(config.onTourStart) === 'function') ? config.onTourStart : false,

    // ID for the main tour container
    mainContainerId: "rapidtour-global-wrapper",

    // Internal state variables for tour operations
    ctx: {
      positionAdjustTimer: false,
      isBlocked: false,
      tourElements: this,
      indexedCount: 0,
      currentElemPosition: 0,
      currentElemHeight: "",
      currentElemLeft: "",
      currentElemOffset: "",
      effectivePadding: "",
      orderedElements: [],
      currentElemCSSPosition: "",
      totalElements: 0,
      currentElemTop: "",
      currentElemWidth: "",
      elemWindowLeftEdge: "",
      elemWindowRightEdge: "",
      elemWindowTopEdge: "",
      currentElemZIndex: 0,
      zIndexDelayTimer: false,
      containerStyleProps: false,
      currentStepNumber: 1,
      currentStepIndex: 0
    }
  };

  // Core tour functionality object
  var tourOps = {
    initializeTour: function() {

      // Check if viewport height meets the minimum requirement
      if ($(window).height() <= cfg.general.minimumViewportHeight) {
        console.log('RapidTour cannot be loaded. Minimum height of ' + cfg.general.minimumViewportHeight + 'px required.');
      } else {

        // Count elements that are part of the tour
        $(cfg.ctx.tourElements).each(function() {

          if ($(this).hasClass(cfg.targetClass) && $(this).attr(cfg.dataAttrs.guideTip)) {
            cfg.ctx.totalElements++;
          }

          if ($(this).attr(cfg.dataAttrs.stepSequence)) {
            cfg.ctx.indexedCount++;
          }

        });

        // Reorder elements if custom sequence is defined
        if (cfg.ctx.indexedCount && cfg.ctx.totalElements) {

          var stepVal = 0;

          $(cfg.ctx.tourElements).each(function() {
            stepVal = (parseInt($(this).attr(cfg.dataAttrs.stepSequence)) - 1);
            cfg.ctx.orderedElements[stepVal] = this;
          });

          cfg.ctx.tourElements = cfg.ctx.orderedElements;

        }

        // Remove any existing tour container
        $("#" + cfg.mainContainerId).remove();

        // Inject the main tour structure into the body
        $('body').append('<div id="' + cfg.mainContainerId + '" class="' + cfg.mainContainerId + '" style="display: none;"><div class="' + cfg.backdrop.cssClass + '"></div><div class="' + cfg.styles.panelElements.mainPanel + '"><div class="' + cfg.styles.panelElements.infoBubble + '"><div class="' + cfg.styles.panelElements.messageText + '"></div><div class="' + cfg.styles.panelElements.controlContainer + '"><a href="#" class="' + cfg.controls.dismiss.cssClass + '">' + cfg.controls.dismiss.labelText + '</a><a href="#" class="' + cfg.controls.previous.cssClass + '">' + cfg.controls.previous.labelText + '</a><a href="#" class="' + cfg.controls.forward.cssClass + '">' + cfg.controls.forward.labelText + '</a></div></div></div></div>');

        // If there are tour elements, proceed with tour display
        if (cfg.ctx.totalElements) {

          // Check if the first tour element is valid
          if ($(cfg.ctx.tourElements[(cfg.ctx.currentStepNumber - 1)]).attr(cfg.dataAttrs.guideTip) && $(cfg.ctx.tourElements[(cfg.ctx.currentStepNumber - 1)]).hasClass(cfg.targetClass)) {

            // Show the initial tour step
            tourOps.showElementInfo(cfg.ctx.tourElements[(cfg.ctx.currentStepNumber - 1)]);
            tourOps.updateNavigationControls(1, cfg.ctx.totalElements);

            // Execute onReady callback if provided
            if (cfg.onTourStart) {
              cfg.onTourStart();
            }

            // Event listener for previous button
            $("." + cfg.controls.previous.cssClass).off('click').on('click', function() {

              tourOps.revertTour(function() {

                if (cfg.controls.previous.onPrev) {
                  cfg.controls.previous.onPrev(cfg.ctx.currentStepIndex, cfg.ctx.tourElements);
                }

              });

              return false;

            });

            // Event listener for next button
            $("." + cfg.controls.forward.cssClass).off('click').on('click', function() {

              tourOps.advanceTour(function() {

                if (cfg.controls.forward.onNext) {
                  cfg.controls.forward.onNext(cfg.ctx.currentStepIndex, cfg.ctx.tourElements);
                }

              });

              return false;

            });

            // Enable keyboard navigation if configured
            if (cfg.general.enableKeyNav == true) {

              $(document).keyup(function(e) {

                if (e.keyCode == 37) { // Left arrow key

                  tourOps.revertTour(function() {

                    if (cfg.controls.previous.onPrev) {
                      cfg.controls.previous.onPrev(cfg.ctx.currentStepIndex, cfg.ctx.tourElements);
                    }

                    return false;

                  });

                } else if (e.keyCode == 39) { // Right arrow key

                  tourOps.advanceTour(function() {

                    if (cfg.controls.forward.onNext) {
                      cfg.controls.forward.onNext(cfg.ctx.currentStepIndex, cfg.ctx.tourElements);
                    }

                    return false;

                  });

                }

              });
            }

            // Event listener for close button
            $("." + cfg.controls.dismiss.cssClass).off('click').on('click', function(event) {

              if (cfg.controls.dismiss.onDismiss && cfg.controls.dismiss.onDismiss()) {
                tourOps.concealTour();
                return false;
              } else {
                tourOps.concealTour();
                return false;
              }

            });

            // Enable escape key to close overlay if configured
            if (cfg.backdrop.escapeToClose == true) {

              $(document).keyup(function(e) {

                if (e.keyCode == 27) { // Escape key

                  if (cfg.backdrop.onBackdropClose) {
                    cfg.backdrop.onBackdropClose();
                  }

                  tourOps.concealTour();

                }

              });

            }

            // Event listener for backdrop click
            $('.' + cfg.backdrop.cssClass).off('click').on('click', function() {

              if (cfg.backdrop.onBackdropClose) {
                cfg.backdrop.onBackdropClose();
              }

              tourOps.concealTour();

              return false;

            });

            // Fade in the tour container
            $("#" + cfg.mainContainerId).fadeIn(200);

          }

        }

      }

    },

    // Displays the info bubble for a specific element
    showElementInfo: function(targetElement) {

      // Ensure the element is valid for a tour step
      if ($(targetElement).html() && $(targetElement).hasClass(cfg.targetClass) && $(targetElement).attr(cfg.dataAttrs.guideTip)) {

        cfg.ctx.currentElemOffset = $(targetElement).offset();
        cfg.ctx.currentElemCSSPosition = $(targetElement).css('position');
        cfg.ctx.effectivePadding = (cfg.general.paddingAround && cfg.general.paddingAround.indexOf() == -1) ? parseInt(cfg.general.paddingAround.replace("px", '')) : 40;
        cfg.ctx.currentElemWidth = parseInt($(targetElement).css('width').replace('px', '')) + (cfg.ctx.effectivePadding);
        cfg.ctx.currentElemHeight = parseInt($(targetElement).css('height').replace('px', '')) + (cfg.ctx.effectivePadding);
        cfg.ctx.currentElemTop = (cfg.ctx.currentElemOffset.top - (cfg.ctx.effectivePadding / 2));
        cfg.ctx.currentElemLeft = (cfg.ctx.currentElemOffset.left - (cfg.ctx.effectivePadding / 2));
        cfg.ctx.elemWindowTopEdge = (cfg.ctx.currentElemTop + cfg.ctx.currentElemHeight);
        cfg.ctx.elemWindowRightEdge = (cfg.ctx.currentElemLeft + cfg.ctx.currentElemWidth);
        cfg.ctx.elemWindowLeftEdge = cfg.ctx.currentElemLeft;
        cfg.ctx.positionAdjustTimer;

        // Define styles for the tour container
        cfg.ctx.containerStyleProps = {
          position: 'absolute',
          width: cfg.ctx.currentElemWidth + 'px',
          height: cfg.ctx.currentElemHeight + 'px',
          top: cfg.ctx.currentElemTop + 'px',
          left: cfg.ctx.currentElemLeft + 'px',
          webkitTransition: 'all ' + cfg.general.animationDuration + 's',
          transition: 'all ' + cfg.general.animationDuration + 's',
          backgroundColor: ($('body').css('backgroundColor')) ? $('body').css('backgroundColor') : '#FFFFFF'
        };

        // Adjust fixed positioned elements to absolute temporarily
        $('*').filter(function() {
          if ($(this).css('position') == 'fixed') {
            $(this).attr(cfg.dataAttrs.originalFixedPos, 'fixed');
            $(this).css('position', 'absolute');
          }
        });

        // Set the message text in the info bubble
        $("." + cfg.styles.panelElements.infoBubble).children('.' + cfg.styles.panelElements.messageText).html($(targetElement).attr(cfg.dataAttrs.guideTip));

        // Restore original z-index for other tour elements
        $(cfg.ctx.tourElements).each(function() {

          if ($(this).attr(cfg.dataAttrs.originalZIndex)) {
            $(this).css('z-index', $(this).attr(cfg.dataAttrs.originalZIndex));
          }

        });

        // Store and update z-index for the current element
        cfg.ctx.currentElemZIndex = $(targetElement).css('z-index');
        cfg.ctx.currentElemPosition = $(targetElement).css('position');

        if (!$(targetElement).attr(cfg.dataAttrs.originalZIndex)) {
          $(targetElement).attr(cfg.dataAttrs.originalZIndex, cfg.ctx.currentElemZIndex);
        }

        if (!$(targetElement).attr(cfg.dataAttrs.originalElemPos)) {
          $(targetElement).attr(cfg.dataAttrs.originalElemPos, cfg.ctx.currentElemPosition);
        }

        // Apply high z-index with a delay
        if (cfg.ctx.zIndexDelayTimer) {
          clearTimeout(cfg.ctx.zIndexDelayTimer);
        }

        cfg.ctx.zIndexDelayTimer = setTimeout(function() {

          $(targetElement).css({
            zIndex: '2147483637',
            position: (cfg.ctx.currentElemPosition === 'static') ? 'relative' : cfg.ctx.currentElemPosition
          }).hide().fadeIn(200);

        }, (cfg.general.animationDuration * 750));

        // Style the tour backdrop
        $('.' + cfg.backdrop.cssClass).css({
          position: 'fixed',
          left: '0px',
          top: '0px',
          right: '0px',
          bottom: '0px',
          backgroundColor: (cfg.backdrop.bgColor) ? cfg.backdrop.bgColor : 'rgba(0,0,0,0.8)'
        });

        // Style the main tour wrapper
        $('.' + cfg.mainContainerId).css({
          position: 'absolute',
          left: '0px',
          top: '0px',
          right: '0px',
          bottom: '0px'
        });

        // Determine tooltip vertical positioning
        if (cfg.ctx.elemWindowTopEdge >= ($(window).height() - 200)) {

          $("." + cfg.styles.panelElements.infoBubble).removeClass(cfg.styles.pointerShapes.pointUp).addClass(cfg.styles.pointerShapes.pointDown).css({
            top: '-' + ($("." + cfg.styles.panelElements.infoBubble).height() + 20) + 'px'
          });

          if (cfg.general.autoScrollToTarget) {
            $("html, body").clearQueue().animate({
              scrollTop: (cfg.ctx.currentElemTop - ($("." + cfg.styles.panelElements.infoBubble).height() + 40))
            }, 500);
          }

        } else {

          $("." + cfg.styles.panelElements.infoBubble).removeClass(cfg.styles.pointerShapes.pointDown).addClass(cfg.styles.pointerShapes.pointUp).css({
            top: (cfg.ctx.currentElemHeight + 20) + 'px'
          });

          if (cfg.general.autoScrollToTarget) {
            $("html, body").clearQueue().animate({
              scrollTop: (cfg.ctx.currentElemTop - 20)
            }, 500);
          }

        }

        // Determine tooltip horizontal positioning
        if (cfg.ctx.elemWindowLeftEdge <= 100) {

          $("." + cfg.styles.panelElements.infoBubble).removeClass(cfg.styles.pointerShapes.pointRight).addClass(cfg.styles.pointerShapes.pointLeft).css({
            left: '0px',
            right: 'auto',
            marginLeft: 'inherit'
          });

        } else if (cfg.ctx.elemWindowRightEdge >= ($(window).width() - 100)) {

          $("." + cfg.styles.panelElements.infoBubble).removeClass(cfg.styles.pointerShapes.pointLeft).addClass(cfg.styles.pointerShapes.pointRight).css({
            left: 'auto',
            right: '0px',
            marginRight: 'inherit'
          });

        } else {

          $("." + cfg.styles.panelElements.infoBubble).removeClass(cfg.styles.pointerShapes.pointLeft).removeClass(cfg.styles.pointerShapes.pointRight).css({
            left: '50%',
            right: 'auto',
            marginLeft: '-' + ($("." + cfg.styles.panelElements.infoBubble).width() / 2) + 'px',
            // No margin-right when centered
          });

        }

        // Apply the container styles to the main panel
        $("." + cfg.styles.panelElements.mainPanel).css(cfg.ctx.containerStyleProps);

      }

    },

    // Updates the visibility and text of navigation buttons
    updateNavigationControls: function(currentStep, totalSteps) {

      $("." + cfg.controls.previous.cssClass).fadeIn(200);
      $("." + cfg.controls.forward.cssClass).fadeIn(200);

      // Hide previous button if on the first step
      if (currentStep == 1) {
        $("." + cfg.controls.previous.cssClass).fadeOut(200);
      }

      // Hide next button if on the last step
      if (currentStep == totalSteps) {
        $("." + cfg.controls.forward.cssClass).fadeOut(200);
      }

      // Update current step index
      cfg.ctx.currentStepIndex = (currentStep - 1);

    },

    // Advances the tour to the next step
    advanceTour: function(onAdvance) {

      if (!cfg.ctx.isBlocked) { // Prevent rapid clicks/key presses
        cfg.ctx.isBlocked = true;

        if (cfg.ctx.totalElements > cfg.ctx.currentStepNumber) {
          cfg.ctx.currentStepNumber++;
          tourOps.showElementInfo(cfg.ctx.tourElements[(cfg.ctx.currentStepNumber - 1)]);
          tourOps.updateNavigationControls(cfg.ctx.currentStepNumber, cfg.ctx.totalElements);
        }

        if (onAdvance) {
          onAdvance();
        }

        setTimeout(function() {
          cfg.ctx.isBlocked = false;
        }, 100); // Small delay to prevent double-trigger

      }

    },

    // Reverts the tour to the previous step
    revertTour: function(onRevert) {

      if (!cfg.ctx.isBlocked) { // Prevent rapid clicks/key presses
        cfg.ctx.isBlocked = true;

        if (cfg.ctx.currentStepNumber > 1) {
          cfg.ctx.currentStepNumber--;
          tourOps.showElementInfo(cfg.ctx.tourElements[(cfg.ctx.currentStepNumber - 1)]);
          tourOps.updateNavigationControls(cfg.ctx.currentStepNumber, cfg.ctx.totalElements);
        }

        if (onRevert) {
          onRevert();
        }

        setTimeout(function() {
          cfg.ctx.isBlocked = false;
        }, 100); // Small delay to prevent double-trigger

      }

    },

    // Hides and cleans up the tour
    concealTour: function() {

      // Restore original z-index and position for all tour elements
      $(cfg.ctx.tourElements).each(function() {

        if ($(this).attr(cfg.dataAttrs.originalZIndex)) {
          $(this).css('z-index', $(this).attr(cfg.dataAttrs.originalZIndex));
        }

        if ($(this).attr(cfg.dataAttrs.originalElemPos)) {
          $(this).css('position', $(this).attr(cfg.dataAttrs.originalElemPos));
        }

      });

      // Restore original position for fixed elements
      $('*').filter(function() {
        if ($(this).attr(cfg.dataAttrs.originalFixedPos)) {
          $(this).css('position', $(this).attr(cfg.dataAttrs.originalFixedPos));
        }
      });

      // Fade out and remove the tour container
      $("#" + cfg.mainContainerId).fadeOut(200, function() {
        $(this).remove();
      });

      // Remove previously stored attributes
      $(cfg.ctx.tourElements).removeAttr(cfg.dataAttrs.originalZIndex).removeAttr(cfg.dataAttrs.originalElemPos);
      $('*').removeAttr(cfg.dataAttrs.originalFixedPos);

    },

    // Aligns the tour container to the current element
    repositionContainer: function() {

      if (cfg.ctx.currentStepNumber) {

        clearTimeout(cfg.ctx.positionAdjustTimer);
        cfg.ctx.positionAdjustTimer = setTimeout(function() {
          tourOps.showElementInfo(cfg.ctx.tourElements[(cfg.ctx.currentStepNumber - 1)]);
        }, 100); // Debounce for resize events

      }

    },

    // Handles window resize events
    handleWindowResize: function() {

      $(window).off('resize.rapidtour').on('resize.rapidtour', function() {
        tourOps.repositionContainer();
      });

    }
  };

  // Initialize the tour and set up resize handling
  tourOps.initializeTour();
  tourOps.handleWindowResize();

};