/**
 * jQuery Guided Walkthrough Plugin
 *
 * @description Provides an interactive step-by-step guide for web pages.
 * @author Based on work by alvaro.veliz@gmail.com and Manoela Lic.
 * @version 1.0.1
 *
 * Dependencies:
 * - jQuery (required)
 * - jQuery.scrollTo (recommended for smooth scrolling)
 */
(function(jq) {

  // Default configuration options for the walkthrough guide.
  const defaultGuideSettings = {
    walkthroughData: [], // Array of step objects
    autoStartGuide: false,
    panelPosition: 'TR', // Top-Right, Top-Left, Bottom-Left, Bottom-Right
    welcomeDialog: '<h2>Walkthrough Guide</h2><p>Welcome to this interactive guide!</p>',
    actionButtons: {
      nextStep: 'Next',
      prevStep: 'Previous',
      startGuide: 'Start Guide',
      endGuide: 'End Guide'
    },
    panelStyling: {
      backgroundColor: 'rgba(8, 68, 142, 0.85)',
      textColor: '#fff'
    },
    bubbleStyling: {
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      textColor: '#fff',
    },
    scrollDuration: 400, // Duration for scrolling to target elements
    scrollOffset: -100 // Offset for scrolling
  };

  // Internal state variables for the guide.
  let currentGuideConfig;
  let currentStepIndex = -1;
  let totalGuideSteps = 0;
  let targetElementWidth, targetElementHeight, targetElementLeft, targetElementTop; // Dimensions and position of the current target element
  let isGuideRunning = false;
  let navigationDirection = 'forward'; // 'forward' or 'backward'

  // jQuery elements for the guide's UI components.
  let $guideControlsPanel;
  let $guideInstructionText;
  let $guidePrevBtn;
  let $guideNextBtn;
  let $guideTerminateBtn;

  // The interactive bubble element displaying step content.
  const $stepBubble = jq('<div>', {
    id: 'guideBubble',
    class: 'guide-bubble-cls',
    html: ''
  }).css({
    'display': 'none',
    'padding': '10px 20px',
    'position': 'absolute',
    'font-family': 'sans-serif',
    'border-radius': '5px',
    'font-size': '12px',
    'box-sizing': 'border-box',
    'z-index': 9999 // Ensure bubble is on top
  });

  // Common CSS properties for the control panel.
  const baseControlPanelCss = {
    'display': 'block',
    'position': 'fixed',
    'width': '220px',
    'padding': '12px 22px',
    'border-radius': '8px',
    'font-family': 'sans-serif',
    'z-index': 9998 // Below the bubble but above page content
  };

  // Helper for creating arrow elements for the step bubble.
  const createArrowElement = (type, bgColor) => {
    const arrowBaseCss = {
      'position': 'absolute',
      'display': 'block',
      'width': '0',
      'height': '0',
      'z-index': 10000
    };
    switch (type) {
      case 'up':
        return jq('<div>', {
          class: 'guide-arrow-indicator'
        }).css({ ...arrowBaseCss,
          'border-left': '5px solid transparent',
          'border-right': '5px solid transparent',
          'border-bottom': `5px solid ${bgColor}`
        });
      case 'down':
        return jq('<div>', {
          class: 'guide-arrow-indicator'
        }).css({ ...arrowBaseCss,
          'border-left': '5px solid transparent',
          'border-right': '5px solid transparent',
          'border-top': `5px solid ${bgColor}`
        });
      case 'right':
        return jq('<div>', {
          class: 'guide-arrow-indicator'
        }).css({ ...arrowBaseCss,
          'border-top': '5px solid transparent',
          'border-bottom': '5px solid transparent',
          'border-left': `5px solid ${bgColor}`
        });
      case 'left':
        return jq('<div>', {
          class: 'guide-arrow-indicator'
        }).css({ ...arrowBaseCss,
          'border-top': '5px solid transparent',
          'border-bottom': '5px solid transparent',
          'border-right': `5px solid ${bgColor}`
        });
      default:
        return jq('<div>');
    }
  };

  // Core functions and logic for the walkthrough guide.
  const guideCore = {
    /**
     * Initializes the walkthrough guide.
     * @param {object} customOptions - User-defined options to override defaults.
     */
    initializeGuide: function(customOptions) {
      if (isGuideRunning) {
        console.warn('jqGuidedWalkthrough: Guide is already running. Call "terminateGuide" first.');
        return;
      }

      if (!jq || !jq.fn || !jq.fn.jquery) {
        console.error('jqGuidedWalkthrough: jQuery is not loaded.');
        return;
      }
      if (typeof jq.scrollTo === 'undefined') {
        console.warn('jqGuidedWalkthrough: jQuery.scrollTo plugin is not found. Scrolling to elements might not be smooth.');
      }

      isGuideRunning = true;
      currentGuideConfig = Object.assign({}, defaultGuideSettings, customOptions);

      // Guard clause for empty data
      if (!currentGuideConfig.walkthroughData || currentGuideConfig.walkthroughData.length === 0) {
        console.warn('jqGuidedWalkthrough: No walkthrough data provided. Initializing empty guide.');
        this.terminateGuide();
        return;
      }

      totalGuideSteps = currentGuideConfig.walkthroughData.length;
      currentStepIndex = -1; // Ready for the first 'next' call

      // Construct the control panel HTML using a template literal.
      const controlPanelHtml = `
        <div id="guideControlsPanel">
          <div id="guideInstructionText">${currentGuideConfig.welcomeDialog}</div>
          <div id="guideNavButtons">
            <button id="guidePrevBtn" style="display:none">${currentGuideConfig.actionButtons.prevStep}</button>
            <button id="guideNextBtn">${currentGuideConfig.actionButtons.startGuide}</button>
            <a href="#" id="guideTerminateBtn" style="display:none; color: ${currentGuideConfig.panelStyling.textColor}; text-decoration: underline; font-size: 12px; float: right; margin-top: 5px;">${currentGuideConfig.actionButtons.endGuide}</a>
          </div>
        </div>`;

      $guideControlsPanel = jq(controlPanelHtml)
        .css(baseControlPanelCss)
        .css(currentGuideConfig.panelStyling);

      const panelPosCss = guideCore.determineControlPanelPosition(currentGuideConfig.panelPosition);
      $guideControlsPanel.css(panelPosCss);

      jq('body').append($guideControlsPanel);

      // Cache references to control buttons
      $guideInstructionText = jq('#guideInstructionText');
      $guidePrevBtn = jq('#guidePrevBtn');
      $guideNextBtn = jq('#guideNextBtn');
      $guideTerminateBtn = jq('#guideTerminateBtn');

      $stepBubble.css(currentGuideConfig.bubbleStyling);
      jq('body').prepend($stepBubble);

      guideCore.setupEventListeners();

      if (currentGuideConfig.autoStartGuide) {
        // A small delay for initial rendering before starting the first step
        setTimeout(() => this.advanceStep(), 100);
      }
    },

    /**
     * Sets up event listeners for navigation buttons.
     * This function is called once during initialization.
     */
    setupEventListeners: function() {
      // Use delegated event handling on the control panel itself for efficiency.
      // This also simplifies removal later.
      $guideControlsPanel.on('click.jqGuidedWalkthrough', '#guideNextBtn', () => {
        guideCore.advanceStep();
      });
      $guideControlsPanel.on('click.jqGuidedWalkthrough', '#guidePrevBtn', () => {
        guideCore.revertStep();
      });
      $guideControlsPanel.on('click.jqGuidedWalkthrough', '#guideTerminateBtn', () => {
        guideCore.terminateGuide();
      });
    },

    /**
     * Removes event listeners set up by the guide.
     */
    removeEventListeners: function() {
      if ($guideControlsPanel) {
        $guideControlsPanel.off('.jqGuidedWalkthrough'); // Remove all events with this namespace
      }
    },

    /**
     * Advances the guide to the next step.
     */
    advanceStep: function() {
      navigationDirection = 'forward';
      currentStepIndex++;

      if (currentStepIndex >= totalGuideSteps) {
        guideCore.terminateGuide(); // All steps completed
        return;
      }

      $stepBubble.stop(true, true).fadeOut('fast', () => { // Stop current animation, hide immediately
        const stepData = currentGuideConfig.walkthroughData[currentStepIndex];
        if (!guideCore.validateStepData(stepData)) {
          console.warn(`jqGuidedWalkthrough: Invalid step data at index ${currentStepIndex}. Skipping.`);
          guideCore.advanceStep(); // Try next step
          return;
        }
        guideCore.updateNavigationButtonStates();
        guideCore.displayStepBubble(stepData);
      });
    },

    /**
     * Reverts the guide to the previous step.
     */
    revertStep: function() {
      navigationDirection = 'backward';
      currentStepIndex--;

      if (currentStepIndex < 0) {
        // Reached the beginning, reset to initial state
        guideCore.updateNavigationButtonStates();
        $stepBubble.stop(true, true).fadeOut('fast');
        $guideInstructionText.html(currentGuideConfig.welcomeDialog);
        currentStepIndex = -1; // Reset to pre-start state
        return;
      }

      $stepBubble.stop(true, true).fadeOut('fast', () => {
        const stepData = currentGuideConfig.walkthroughData[currentStepIndex];
        if (!guideCore.validateStepData(stepData)) {
          console.warn(`jqGuidedWalkthrough: Invalid step data at index ${currentStepIndex}. Skipping.`);
          guideCore.revertStep(); // Try previous step
          return;
        }
        guideCore.updateNavigationButtonStates();
        guideCore.displayStepBubble(stepData);
      });
    },

    /**
     * Updates the visibility and text of the navigation buttons based on the current step.
     */
    updateNavigationButtonStates: function() {
      $guidePrevBtn.toggle(currentStepIndex > -1);
      $guideTerminateBtn.toggle(currentStepIndex > -1);

      if (currentStepIndex === totalGuideSteps - 1) {
        $guideNextBtn.text(currentGuideConfig.actionButtons.endGuide);
      } else if (currentStepIndex === -1) {
        $guideNextBtn.text(currentGuideConfig.actionButtons.startGuide);
      } else {
        $guideNextBtn.text(currentGuideConfig.actionButtons.nextStep);
      }
    },

    /**
     * Validates the structure of a step data object.
     * @param {object} stepData - The data object for the current step.
     * @returns {boolean} True if data is valid, false otherwise.
     */
    validateStepData: function(stepData) {
      if (!stepData || !stepData.element || !stepData.bubbleContent) {
        console.error('jqGuidedWalkthrough: Step data missing "element" or "bubbleContent".', stepData);
        return false;
      }
      return true;
    },

    /**
     * Displays the interactive bubble for the current step.
     * @param {object} stepData - The data object for the current step.
     */
    displayStepBubble: function(stepData) {
      const $targetElement = jq(stepData.element);

      if ($targetElement.length === 0) {
        console.warn(`jqGuidedWalkthrough: Target element "${stepData.element}" not found for step ${currentStepIndex}. Skipping.`);
        // Attempt to move to next/prev step if current target is missing
        if (navigationDirection === 'forward') {
          guideCore.advanceStep();
        } else {
          guideCore.revertStep();
        }
        return;
      }

      // Update control panel position if specified for this step.
      if (stepData.panelPosition) {
        guideCore.adjustControlPanelPosition(stepData.panelPosition);
      }

      if (stepData.bubbleContent) {
        $stepBubble.html(stepData.bubbleContent);
        const instructionText = (typeof stepData.instructionText !== 'undefined') ? stepData.instructionText : stepData.bubbleContent;
        $guideInstructionText.html(instructionText);

        const bubblePosition = (typeof stepData.position === 'undefined') ? 'BL' : stepData.position;
        const calculatedPos = guideCore.calculateBubblePosition(bubblePosition, $targetElement);

        $stepBubble.css({
          'top': Math.round(calculatedPos.top) + 'px',
          'left': Math.round(calculatedPos.left) + 'px'
        }).fadeIn('fast');

        // Scroll to the bubble, if scrollTo is available
        if (jq.scrollTo) {
          jq.scrollTo($stepBubble, currentGuideConfig.scrollDuration, {
            offset: currentGuideConfig.scrollOffset
          });
        }
      }

      // Handle step-specific callbacks.
      if (typeof stepData.callback !== 'undefined') {
        if (stepData.callback === 'click') {
          const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
          const urlSlugRegex = /^[a-z0-9-]+$/;

          const href = $targetElement.attr('href');
          if (href && (urlRegex.test(href) || urlSlugRegex.test(href))) {
            location.href = href;
          } else {
            $targetElement.trigger('click');
          }
        } else if (typeof stepData.callback === 'function') {
          // If a function reference is provided, call it directly.
          stepData.callback($targetElement, currentStepIndex);
        } else if (typeof stepData.callback === 'string') {
          // If a string, attempt to execute it as a global function or expression.
          // This is generally unsafe, but kept for compatibility with original logic.
          try {
            // Using Function constructor for dynamic execution, safer than direct eval
            const callbackFunction = new Function('element', 'stepIndex', `return ${stepData.callback}(element, stepIndex);`);
            callbackFunction($targetElement, currentStepIndex);
          } catch (e) {
            console.error(`jqGuidedWalkthrough: Error executing callback "${stepData.callback}":`, e);
          }
        }
      }

      // Auto-advance/revert if 'autoContinue' is set to true for the step.
      if (stepData.autoContinue === true) {
        // Small delay to allow user to perceive the bubble before auto-advancing
        setTimeout(() => {
          if (navigationDirection === 'forward') {
            guideCore.advanceStep();
          } else {
            guideCore.revertStep();
          }
        }, 800);
      }
    },

    /**
     * Adjusts the position of the control panel.
     * @param {string} positionCode - Code indicating the desired position (e.g., 'TR').
     */
    adjustControlPanelPosition: function(positionCode) {
      // Re-create the panel to ensure all styles are applied correctly,
      // especially if a step overrides its position.
      const currentPanelHtml = $guideControlsPanel.html();
      $guideControlsPanel.remove();

      $guideControlsPanel = jq(`
        <div id="guideControlsPanel">
          ${currentPanelHtml}
        </div>`)
        .css(baseControlPanelCss)
        .css(currentGuideConfig.panelStyling);

      const newPositionCss = guideCore.determineControlPanelPosition(positionCode);
      $guideControlsPanel.css(newPositionCss);

      jq('body').append($guideControlsPanel);
    },

    /**
     * Calculates the pixel position for the interactive step bubble.
     * @param {string} posCode - A two-character code for the desired position (e.g., 'BL').
     * @param {jQuery} $targetElement - The jQuery object of the element to which the bubble should be attached.
     * @returns {object} An object with 'top' and 'left' pixel values.
     */
    calculateBubblePosition: function(posCode, $targetElement) {
      targetElementWidth = $targetElement.outerWidth();
      targetElementHeight = $targetElement.outerHeight();
      targetElementLeft = $targetElement.offset().left;
      targetElementTop = $targetElement.offset().top;

      // Calculate bubble dimensions including padding.
      const bubbleTotalWidth = $stepBubble.outerWidth();
      const bubbleTotalHeight = $stepBubble.outerHeight();

      // Remove existing arrow indicators before adding a new one.
      jq('.guide-arrow-indicator').remove();
      const bubbleBgColor = $stepBubble.css('background-color');

      let position = {
        top: 0,
        left: 0
      };
      let arrow;

      // Positioning logic with arrow injection.
      switch (posCode) {
        case 'BL': // Bottom-Left of target
          position = {
            left: targetElementLeft,
            top: targetElementTop + targetElementHeight + 10
          };
          arrow = createArrowElement('up', bubbleBgColor).css({
            top: '-5px',
            left: '48%'
          });
          $stepBubble.prepend(arrow);
          break;

        case 'BR': // Bottom-Right of target
          position = {
            left: targetElementLeft + targetElementWidth - bubbleTotalWidth,
            top: targetElementTop + targetElementHeight + 10
          };
          arrow = createArrowElement('up', bubbleBgColor).css({
            top: '-5px',
            left: '48%'
          });
          $stepBubble.prepend(arrow);
          break;

        case 'TL': // Top-Left of target
          position = {
            left: targetElementLeft,
            top: (targetElementTop - bubbleTotalHeight) - 10
          };
          arrow = createArrowElement('down', bubbleBgColor).css({
            top: bubbleTotalHeight + 'px',
            left: '48%'
          });
          $stepBubble.append(arrow);
          break;

        case 'TR': // Top-Right of target
          position = {
            left: (targetElementLeft + targetElementWidth) - bubbleTotalWidth,
            top: (targetElementTop - bubbleTotalHeight) - 10
          };
          arrow = createArrowElement('down', bubbleBgColor).css({
            top: bubbleTotalHeight + 'px',
            left: '48%'
          });
          $stepBubble.append(arrow);
          break;

        case 'RT': // Right-Top of target
          position = {
            left: targetElementLeft + targetElementWidth + 10,
            top: targetElementTop
          };
          arrow = createArrowElement('left', bubbleBgColor).css({
            left: '-5px',
            top: '5px'
          });
          $stepBubble.prepend(arrow);
          break;

        case 'RB': // Right-Bottom of target
          position = {
            left: targetElementLeft + targetElementWidth + 10,
            top: targetElementTop + targetElementHeight - bubbleTotalHeight
          };
          arrow = createArrowElement('left', bubbleBgColor).css({
            left: '-5px',
            bottom: '5px'
          });
          $stepBubble.prepend(arrow);
          break;

        case 'LT': // Left-Top of target
          position = {
            left: (targetElementLeft - bubbleTotalWidth) - 10,
            top: targetElementTop
          };
          arrow = createArrowElement('right', bubbleBgColor).css({
            right: '-5px',
            top: '5px'
          });
          $stepBubble.prepend(arrow);
          break;

        case 'LB': // Left-Bottom of target
          position = {
            left: (targetElementLeft - bubbleTotalWidth) - 10,
            top: targetElementTop + targetElementHeight - bubbleTotalHeight
          };
          arrow = createArrowElement('right', bubbleBgColor).css({
            right: '-5px',
            bottom: '5px'
          });
          $stepBubble.prepend(arrow);
          break;

        case 'B': // Bottom-Center of target
          position = {
            left: targetElementLeft + targetElementWidth / 2 - bubbleTotalWidth / 2,
            top: (targetElementTop + targetElementHeight) + 10
          };
          arrow = createArrowElement('up', bubbleBgColor).css({
            top: '-5px',
            left: '48%'
          });
          $stepBubble.prepend(arrow);
          break;

        case 'L': // Left-Center of target
          position = {
            left: (targetElementLeft - bubbleTotalWidth) - 10,
            top: targetElementTop + targetElementHeight / 2 - bubbleTotalHeight / 2
          };
          arrow = createArrowElement('right', bubbleBgColor).css({
            right: '-5px',
            top: 'calc(50% - 5px)'
          });
          $stepBubble.prepend(arrow);
          break;

        case 'T': // Top-Center of target
          position = {
            left: targetElementLeft + targetElementWidth / 2 - bubbleTotalWidth / 2,
            top: (targetElementTop - bubbleTotalHeight) - 10
          };
          arrow = createArrowElement('down', bubbleBgColor).css({
            top: bubbleTotalHeight + 'px',
            left: '48%'
          });
          $stepBubble.append(arrow);
          break;

        case 'R': // Right-Center of target
          position = {
            left: (targetElementLeft + targetElementWidth) + 10,
            top: targetElementTop + targetElementHeight / 2 - bubbleTotalHeight / 2
          };
          arrow = createArrowElement('left', bubbleBgColor).css({
            left: '-5px',
            top: 'calc(50% - 5px)'
          });
          $stepBubble.prepend(arrow);
          break;
        default:
          console.warn(`jqGuidedWalkthrough: Unknown bubble position code: ${posCode}. Defaulting to Bottom-Left.`);
          return this.calculateBubblePosition('BL', $targetElement);
      }
      return position;
    },

    /**
     * Determines the fixed position for the control panel.
     * @param {string} posCode - A two-character code for the desired position (e.g., 'TR').
     * @returns {object} CSS properties for positioning.
     */
    determineControlPanelPosition: function(posCode) {
      let positionCss = {};
      switch (posCode) {
        case 'TR':
          positionCss = {
            'top': '15px',
            'right': '15px'
          };
          break;
        case 'TL':
          positionCss = {
            'top': '15px',
            'left': '15px'
          };
          break;
        case 'BL':
          positionCss = {
            'bottom': '15px',
            'left': '15px'
          };
          break;
        case 'BR':
          positionCss = {
            'bottom': '15px',
            'right': '15px'
          };
          break;
        default:
          console.warn(`jqGuidedWalkthrough: Unknown control panel position code: ${posCode}. Defaulting to Top-Right.`);
          return this.determineControlPanelPosition('TR');
      }
      return positionCss;
    },

    /**
     * Terminates and cleans up the walkthrough guide.
     */
    terminateGuide: function() {
      if (!isGuideRunning) return;

      guideCore.removeEventListeners();

      // Remove dynamically added elements.
      jq('#guideControlsPanel').remove();
      jq('#guideBubble').remove();
      jq('.guide-arrow-indicator').remove();

      $stepBubble.stop(true, true).css({
        'display': 'none'
      }).html('');

      // Reset internal state.
      currentStepIndex = -1;
      totalGuideSteps = 0;
      isGuideRunning = false;
      navigationDirection = 'forward';

      // Clear cached jQuery element references.
      $guideControlsPanel = null;
      $guideInstructionText = null;
      $guidePrevBtn = null;
      $guideNextBtn = null;
      $guideTerminateBtn = null;

      console.log('jqGuidedWalkthrough: Guide terminated successfully.');
    }
  };

  // jQuery plugin definition.
  jq.fn.jqGuidedWalkthrough = function(method) {
    if (guideCore[method]) {
      // Call a specific method if it exists.
      return guideCore[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      // If no method is specified or an options object is passed, initialize the guide.
      return guideCore.initializeGuide.apply(this, arguments);
    } else {
      // Handle unknown method calls.
      jq.error('Method ' + method + ' does not exist on jQuery.jqGuidedWalkthrough');
    }
  };

  // Direct access for easier initialization without needing a target element.
  jq.jqGuidedWalkthrough = function(opts) {
    jq.fn.jqGuidedWalkthrough(opts);
  };

})(jQuery);