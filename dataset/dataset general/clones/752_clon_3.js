(function (jq) {

    /**
     * @module stepNavigator
     * @description A jQuery plugin to create a multi-step form wizard with dynamic navigation.
     * @param {Object} [userConfiguration] - Custom settings to override defaults.
     * @param {Function} [completionHandler] - Callback function executed once the wizard is initialized.
     * @returns {jq} The jQuery object for chaining.
     */
    jq.fn.stepNavigator = function (userConfiguration, completionHandler) {

        // Default configuration for the wizard module.
        const defaultModuleConfiguration = {
            'backControlMarkup': '<button id="wizard-back-control" type="button">Previous Step</button>',
            'forwardControlMarkup': '<button id="wizard-forward-control" type="button">Next Step</button>',
            'currentStepHighlightClass': 'wizard-step-active',
            'stepPanelSelector': 'fieldset',
            'finalSubmitButtonSelector': '[type = "submit"]',
            'initialStepIdentifier': null, // Can be a selector or null for the first step
            'showStepAnimationParams': [0], // Arguments for the .show() method
            'hideStepAnimationParams': [0], // Arguments for the .hide() method
            'inactiveControlVisualClass': 'wizard-control-disabled',
            'wizardWrapperClass': 'multi-step-wizard-container',
            'enableStepTracker': true,
            'trackerItemTitleSelector': 'legend',
            'trackerListStartTag': '<ol>',
            'trackerListEndTag': '</ol>',
            'trackerListVisualClass': 'step-progress-tracker',
            'trackerListItemStartTag': '<li>',
            'trackerListItemEndTag': '</li>',
            'trackerActiveItemVisualClass': 'tracker-item-current',
            'trackerCompletedItemVisualClass': 'tracker-item-done',
            'trackerDisplayPosition': 'before', // 'before' or 'after' the wizard container
            'interactiveTrackerItems': false, // Allow clicking on tracker items to navigate
            'debugMode': false // Enable console logs for debugging
        };

        // Merge user-provided configuration with defaults.
        // Use a deep merge to prevent mutation of defaultModuleConfiguration.
        const effectiveConfig = jq.extend(true, {}, defaultModuleConfiguration, userConfiguration);

        // Normalize the completion handler to always be a function.
        completionHandler = completionHandler || function () { };

        /**
         * @function deactivateNavigationControl
         * @description Disables a navigation control element (e.g., a button).
         * @param {jq} controlHandle - The jQuery object representing the control.
         */
        function deactivateNavigationControl(controlHandle) {
            if (effectiveConfig.debugMode) console.log("stepNavigator: Deactivating control:", controlHandle);
            if (controlHandle.is("button")) {
                controlHandle.prop('disabled', true);
            } else {
                controlHandle.addClass(effectiveConfig.inactiveControlVisualClass);
            }
        }

        /**
         * @function activateNavigationControl
         * @description Enables a navigation control element.
         * @param {jq} controlHandle - The jQuery object representing the control.
         */
        function activateNavigationControl(controlHandle) {
            if (effectiveConfig.debugMode) console.log("stepNavigator: Activating control:", controlHandle);
            if (controlHandle.is("button")) {
                controlHandle.prop('disabled', false);
            } else {
                controlHandle.removeClass(effectiveConfig.inactiveControlVisualClass);
            }
        }


        // Iterate over each selected wizard container element.
        return this.each(function () {

            const wizardModuleElement = jq(this);
            const allWizardPanels = wizardModuleElement.children(effectiveConfig.stepPanelSelector);
            const panelCount = allWizardPanels.length;

            // Early exit if no step panels are found.
            if (panelCount === 0) {
                if (effectiveConfig.debugMode) console.warn("stepNavigator: No step panels found within the wizard container.", wizardModuleElement);
                return;
            }

            const currentPanelSelector = '.' + effectiveConfig.currentStepHighlightClass;
            const finalActionButton = wizardModuleElement.find(effectiveConfig.finalSubmitButtonSelector);

            let internalAnimationCompletionCallback;
            let userDefinedNextStepCallback;
            let startingPanel;
            let stepTrackerDisplay;

            // Determine the initial step panel.
            if (effectiveConfig.initialStepIdentifier === null) {
                startingPanel = allWizardPanels.eq(0);
            } else {
                startingPanel = jq(effectiveConfig.initialStepIdentifier);
                // Validate if the initialStepIdentifier actually points to a panel within this wizard.
                if (!startingPanel.length || !allWizardPanels.is(startingPanel)) {
                    if (effectiveConfig.debugMode) console.warn("stepNavigator: Initial step identifier does not match any existing step panel. Defaulting to the first panel.");
                    startingPanel = allWizardPanels.eq(0);
                }
            }

            // Apply the main wizard wrapper class if specified.
            if (effectiveConfig.wizardWrapperClass) {
                wizardModuleElement.addClass(effectiveConfig.wizardWrapperClass);
            }

            // Set up the step progress tracker (breadcrumb).
            if (effectiveConfig.enableStepTracker) {
                const trackerHtmlParts = [];
                trackerHtmlParts.push(effectiveConfig.trackerListStartTag);

                allWizardPanels.find(effectiveConfig.trackerItemTitleSelector).each(function (panelIndex) {
                    trackerHtmlParts.push(effectiveConfig.trackerListItemStartTag + jq(this).text() + effectiveConfig.trackerListItemEndTag);
                });

                trackerHtmlParts.push(effectiveConfig.trackerListEndTag);
                stepTrackerDisplay = jq(trackerHtmlParts.join(''));

                if (effectiveConfig.trackerDisplayPosition === 'after') {
                    stepTrackerDisplay.insertAfter(wizardModuleElement);
                } else {
                    stepTrackerDisplay.insertBefore(wizardModuleElement);
                }
                stepTrackerDisplay.children().first().addClass(effectiveConfig.trackerActiveItemVisualClass);
                stepTrackerDisplay.addClass(effectiveConfig.trackerListVisualClass);
            }

            // Handle user-defined callback for next step arguments.
            const hideParamsArray = effectiveConfig.hideStepAnimationParams;
            const lastHideParamIndex = hideParamsArray.length - 1;

            if (typeof (hideParamsArray[lastHideParamIndex]) === "function") {
                // If it's a function, store it and replace with our wrapper.
                userDefinedNextStepCallback = hideParamsArray[lastHideParamIndex];
                hideParamsArray[lastHideParamIndex] = function () {
                    internalAnimationCompletionCallback.call(this);
                    userDefinedNextStepCallback.call(this);
                };
            } else {
                // If no function, append our internal callback.
                hideParamsArray.push(function () { internalAnimationCompletionCallback.call(this); });
            }

            // Insert navigation buttons and hide the final submit button initially.
            const backNavigationButton = jq(effectiveConfig.backControlMarkup).insertBefore(finalActionButton);
            const forwardNavigationButton = jq(effectiveConfig.forwardControlMarkup).insertBefore(finalActionButton);
            finalActionButton.hide();

            // Deactivate the back button if the starting panel is the first one.
            if (startingPanel.is(':first-child')) {
                deactivateNavigationControl(backNavigationButton);
            }

            // Hide all panels initially, then show and highlight the starting panel.
            allWizardPanels.hide();
            startingPanel.addClass(effectiveConfig.currentStepHighlightClass).show();

            // Event listener for the forward navigation button.
            forwardNavigationButton.on('click', function () {
                const currentActivePanel = wizardModuleElement.find(currentPanelSelector);
                let isCurrentPanelValid = true;

                // Check for jQuery Validation plugin and apply validation if available.
                if (jq.fn.valid) {
                    isCurrentPanelValid = currentActivePanel.find(":input").valid();
                } else {
                    if (effectiveConfig.debugMode) console.warn("stepNavigator: jQuery Validation plugin not detected. Skipping form validation for current step.");
                }

                // Proceed only if the current panel is valid.
                if (isCurrentPanelValid) {
                    const nextAvailablePanel = currentActivePanel.next(effectiveConfig.stepPanelSelector);

                    if (nextAvailablePanel.length) {
                        currentActivePanel.removeClass(effectiveConfig.currentStepHighlightClass);
                        nextAvailablePanel.addClass(effectiveConfig.currentStepHighlightClass);

                        // Store the current panel's original CSS position before hiding.
                        const originalCssPositionCurrent = currentActivePanel.css('position');
                        internalAnimationCompletionCallback = function () { currentActivePanel.css('position', originalCssPositionCurrent); };

                        // Hide the current panel and show the next panel with animation parameters.
                        currentActivePanel.css('position', 'absolute').hide.apply(currentActivePanel, effectiveConfig.hideStepAnimationParams);
                        nextAvailablePanel.show.apply(nextAvailablePanel, effectiveConfig.showStepAnimationParams);

                        // Update the step progress tracker.
                        if (effectiveConfig.enableStepTracker) {
                            stepTrackerDisplay.find('.' + effectiveConfig.trackerActiveItemVisualClass)
                                .removeClass(effectiveConfig.trackerActiveItemVisualClass)
                                .addClass(effectiveConfig.trackerCompletedItemVisualClass)
                                .next().addClass(effectiveConfig.trackerActiveItemVisualClass);
                        }

                        // Ensure the back button is active.
                        activateNavigationControl(backNavigationButton);
                    }

                    // Check if this is the last step.
                    const panelBeyondNext = nextAvailablePanel.next(effectiveConfig.stepPanelSelector);
                    if (panelBeyondNext.length === 0) {
                        forwardNavigationButton.hide();
                        finalActionButton.show();
                    }
                }
            });

            // Event listener for the back navigation button.
            backNavigationButton.on('click', function () {
                const currentActivePanel = wizardModuleElement.find(currentPanelSelector);
                const previousAvailablePanel = currentActivePanel.prev(effectiveConfig.stepPanelSelector);

                if (previousAvailablePanel.length) {
                    currentActivePanel.removeClass(effectiveConfig.currentStepHighlightClass);
                    previousAvailablePanel.addClass(effectiveConfig.currentStepHighlightClass);

                    // Store the previous panel's original CSS position before showing.
                    const originalCssPositionPrevious = previousAvailablePanel.css('position');
                    internalAnimationCompletionCallback = function () { previousAvailablePanel.css('position', originalCssPositionPrevious); };

                    // Hide the current panel and show the previous panel with animation parameters.
                    currentActivePanel.hide.apply(currentActivePanel, effectiveConfig.hideStepAnimationParams);
                    previousAvailablePanel.css('position', 'absolute').show.apply(previousAvailablePanel, effectiveConfig.showStepAnimationParams);

                    // Update the step progress tracker.
                    if (effectiveConfig.enableStepTracker) {
                        stepTrackerDisplay.find('.' + effectiveConfig.trackerActiveItemVisualClass)
                            .removeClass(effectiveConfig.trackerActiveItemVisualClass)
                            .prev().removeClass(effectiveConfig.trackerCompletedItemVisualClass).addClass(effectiveConfig.trackerActiveItemVisualClass);
                    }

                    // Restore visibility of forward button and hide submit button.
                    forwardNavigationButton.show();
                    finalActionButton.hide();
                }

                // Deactivate the back button if this is now the first step.
                const panelBeforePrevious = previousAvailablePanel.prev(effectiveConfig.stepPanelSelector);
                if (panelBeforePrevious.length === 0) {
                    deactivateNavigationControl(backNavigationButton);
                }
            });

            // Handle clickable step tracker items for direct navigation.
            if (effectiveConfig.enableStepTracker && effectiveConfig.interactiveTrackerItems) {
                stepTrackerDisplay.children().on('click', function (event) {
                    const clickedTrackerItem = jq(this);
                    if (clickedTrackerItem.hasClass(effectiveConfig.trackerActiveItemVisualClass)) {
                        if (effectiveConfig.debugMode) console.log("stepNavigator: Already on this step, no action needed.");
                        return;
                    }

                    const currentActivePanel = wizardModuleElement.find(currentPanelSelector);
                    const targetPanelIndex = clickedTrackerItem.index();
                    const targetPanelElement = allWizardPanels.eq(targetPanelIndex);

                    if (!targetPanelElement.length || targetPanelElement.is(currentActivePanel)) {
                        if (effectiveConfig.debugMode) console.log("stepNavigator: Target panel not found or is the current panel.");
                        return;
                    }

                    currentActivePanel.removeClass(effectiveConfig.currentStepHighlightClass);
                    targetPanelElement.addClass(effectiveConfig.currentStepHighlightClass);

                    // Store current panel's position, then hide it.
                    const originalPositionOfCurrent = currentActivePanel.css('position');
                    internalAnimationCompletionCallback = function () { currentActivePanel.css('position', originalPositionOfCurrent); };
                    currentActivePanel.css('position', 'absolute').hide.apply(currentActivePanel, effectiveConfig.hideStepAnimationParams);

                    // Show the target panel.
                    targetPanelElement.show.apply(targetPanelElement, effectiveConfig.showStepAnimationParams);

                    // Update tracker item classes.
                    stepTrackerDisplay.find('.' + effectiveConfig.trackerActiveItemVisualClass).removeClass(effectiveConfig.trackerActiveItemVisualClass);
                    clickedTrackerItem.addClass(effectiveConfig.trackerActiveItemVisualClass);

                    // Update completed classes for steps before the target.
                    stepTrackerDisplay.children().each(function (idx) {
                        if (idx < targetPanelIndex) {
                            jq(this).addClass(effectiveConfig.trackerCompletedItemVisualClass);
                        } else {
                            jq(this).removeClass(effectiveConfig.trackerCompletedItemVisualClass);
                        }
                    });

                    // Adjust navigation button states.
                    if (targetPanelIndex === 0) {
                        deactivateNavigationControl(backNavigationButton);
                    } else {
                        activateNavigationControl(backNavigationButton);
                    }

                    if (targetPanelIndex === panelCount - 1) {
                        forwardNavigationButton.hide();
                        finalActionButton.show();
                    } else {
                        forwardNavigationButton.show();
                        finalActionButton.hide();
                    }
                });
            }

            // Execute the user-provided completion handler.
            completionHandler.call(this);

        }); // End of .each()

    }; // End of plugin definition

})(jQuery);