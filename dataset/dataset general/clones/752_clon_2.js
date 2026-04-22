(function (jq) {
    /**
     * Extends jQuery to provide a multi-step form navigation utility.
     * @param {object} config - Configuration options for the navigator.
     * @param {function} onComplete - Callback function executed when setup is done.
     */
    jq.fn.stepNavigator = function (config, onComplete) {

        // Default configuration options for the step navigator
        var pluginConfig = {
            'backBtnMarkup': '<button id="wizard-back-btn" type="button">Go Back</button>',
            'forwardBtnMarkup': '<button id="wizard-forward-btn" type="button">Go Forward</button>',
            'currentStepCls': 'step-active',
            'stepSelector': 'section',
            'finalSubmitBtn': 'input[type="submit"]',
            'initialStep': null,
            'backAnimArgs': [0],
            'forwardAnimArgs': [0],
            'inactiveCls': 'step-disabled',
            'wrapperCls': 'wizard-wrapper-container',
            'showProgressNav': true,
            'progressItemHeader': 'h2',
            'progressListStartTag': '<ul>',
            'progressListEndTag': '</ul>',
            'progressListCls': 'progress-track-list',
            'progressListItemStartTag': '<li>',
            'progressListItemEndTag': '</li>',
            'currentProgressCls': 'track-current-item',
            'doneProgressCls': 'track-completed-item',
            'progressNavPlacement': 'top',
            'enableProgressClicks': false
        };

        // Merge user-provided configuration with defaults
        if (config) {
            jq.extend(pluginConfig, config);
        }

        // Ensure the completion callback is a function
        onComplete = onComplete || function () { };

        /**
         * Disables a given navigation button or adds a disabled class.
         * @param {jQuery} buttonElement - The button element to disable.
         */
        function deactivateBackButton(buttonElement) {
            if (jq(buttonElement).is(":button")) {
                jq(buttonElement).attr('disabled', 'disabled');
            } else {
                jq(buttonElement).addClass(pluginConfig.inactiveCls);
            }
        }

        // Iterate over each selected element to apply the wizard functionality
        return this.each(function () {

            var wizardContainer = jq(this);
            var stepElements = wizardContainer.children(pluginConfig.stepSelector);
            var currentStepSelector = '.' + pluginConfig.currentStepCls;
            var submitControl = wizardContainer.find(pluginConfig.finalSubmitBtn);
            var internalTransitionCb;
            var userTransitionCb;
            var firstVisibleStep;
            var progressNavList;

            // Determine the initial step to display
            if (pluginConfig.initialStep === null) {
                firstVisibleStep = stepElements.first();
            } else {
                firstVisibleStep = jq(pluginConfig.initialStep);
            }

            // Apply the main wrapper class if specified
            if (pluginConfig.wrapperCls !== "") {
                wizardContainer.addClass(pluginConfig.wrapperCls);
            }

            // Set up the progress navigation menu if enabled
            if (pluginConfig.showProgressNav) {
                progressNavList = pluginConfig.progressListStartTag;

                // Build the list items from step headers
                stepElements.find(pluginConfig.progressItemHeader).each(function (idx) {
                    progressNavList += pluginConfig.progressListItemStartTag + jq(this).text() + pluginConfig.progressListItemEndTag;
                });

                progressNavList += pluginConfig.progressListEndTag;

                // Insert the progress navigation list into the DOM
                if (pluginConfig.progressNavPlacement === 'bottom') {
                    progressNavList = jq(progressNavList).insertAfter(wizardContainer);
                } else {
                    progressNavList = jq(progressNavList).insertBefore(wizardContainer);
                }
                // Mark the first item as active
                progressNavList.children().first().addClass(pluginConfig.currentProgressCls);
                // Add the main class to the progress list
                progressNavList.addClass(pluginConfig.progressListCls);
            }

            // Check if the last argument in forwardAnimArgs is a function
            if (typeof (pluginConfig.forwardAnimArgs[pluginConfig.forwardAnimArgs.length - 1]) === "function") {

                // If it is, store the user's provided callback
                userTransitionCb = pluginConfig.forwardAnimArgs[pluginConfig.forwardAnimArgs.length - 1];

                // Then replace it with a wrapper function that calls both our internal function and the user's
                pluginConfig.forwardAnimArgs[pluginConfig.forwardAnimArgs.length - 1] = function () { internalTransitionCb.call(this); userTransitionCb.call(this); };

            } else {

                // If no callback is present, append our internal one
                pluginConfig.forwardAnimArgs[pluginConfig.forwardAnimArgs.length] = function () { internalTransitionCb.call(this); };
            }

            // Insert the previous and next buttons before the submit button and initially hide the submit button
            var backControl = jq(pluginConfig.backBtnMarkup).insertBefore(submitControl);
            var forwardControl = jq(pluginConfig.forwardBtnMarkup).insertBefore(submitControl);
            submitControl.hide();

            // If the initial step is the very first child, disable the back button
            if (firstVisibleStep.is(':first-child')) {
                deactivateBackButton(backControl);
            }

            // Hide all step elements initially, then show and activate the first one
            stepElements.hide();
            firstVisibleStep.toggleClass(pluginConfig.currentStepCls).show();

            // Click handler for the 'Go Forward' button
            jq(forwardControl).on('click', function () {
                var currentPanel = wizardContainer.find(currentStepSelector);

                // Validate inputs within the current step before proceeding
                if (currentPanel.find(":input").valid()) {
                    var nextPanel = currentPanel.next(pluginConfig.stepSelector);
                    var panelAfterNext = nextPanel.next(pluginConfig.stepSelector);

                    if (nextPanel.length) {
                        // Toggle active classes for current and next panels
                        jq(currentPanel).toggleClass(pluginConfig.currentStepCls);
                        jq(nextPanel).toggleClass(pluginConfig.currentStepCls);

                        // Store the current panel's display mode (e.g., 'static', 'relative')
                        currentPanel.data('displayMode', currentPanel.css('position'));

                        // Define our internal callback to restore the display mode after animation
                        internalTransitionCb = function () { currentPanel.css('position', currentPanel.data('displayMode')); };

                        // Hide the current panel and show the next panel with animation arguments
                        currentPanel.css('position', 'absolute').hide.apply(currentPanel, pluginConfig.forwardAnimArgs);
                        nextPanel.show.apply(nextPanel, pluginConfig.backAnimArgs);

                        // Update the progress navigation if enabled
                        if (pluginConfig.showProgressNav) {
                            progressNavList.find('.' + pluginConfig.currentProgressCls).removeClass(pluginConfig.currentProgressCls).addClass(pluginConfig.doneProgressCls).next().addClass(pluginConfig.currentProgressCls);
                        }

                        // Enable the back button if it's a standard button
                        if (jq(backControl).is(":button")) {
                            jq(backControl).removeAttr('disabled');
                        } else {
                            // Otherwise, remove the disabled class
                            jq(backControl).removeClass(pluginConfig.inactiveCls);
                        }
                    }

                    // If there are no more steps after the current one, hide 'Go Forward' and show 'Submit'
                    if (panelAfterNext.length <= 0) {
                        jq(forwardControl).hide();
                        submitControl.show();
                    }
                }
            });

            // Click handler for the 'Go Back' button
            jq(backControl).on('click', function () {
                var currentPanel = wizardContainer.find(currentStepSelector);
                var previousPanel = currentPanel.prev(pluginConfig.stepSelector);
                var panelBeforePrev = previousPanel.prev(pluginConfig.stepSelector);

                if (previousPanel.length) {
                    // Toggle active classes for current and previous panels
                    jq(currentPanel).toggleClass(pluginConfig.currentStepCls);
                    jq(previousPanel).toggleClass(pluginConfig.currentStepCls);

                    // Store previous panel's display mode
                    previousPanel.data('displayMode', previousPanel.css('position'));
                    internalTransitionCb = function () { previousPanel.css('position', previousPanel.data('displayMode')); };

                    // Hide current panel and show previous panel with animation arguments
                    currentPanel.hide.apply(currentPanel, pluginConfig.backAnimArgs);
                    previousPanel.css('position', 'absolute').show.apply(previousPanel, pluginConfig.forwardAnimArgs);

                    // Update the progress navigation if enabled
                    if (pluginConfig.showProgressNav) {
                        progressNavList.find('.' + pluginConfig.currentProgressCls).removeClass(pluginConfig.currentProgressCls).prev().addClass(pluginConfig.currentProgressCls);
                    }

                    // Ensure 'Go Forward' button is visible and 'Submit' is hidden
                    jq(forwardControl).show();
                    submitControl.hide();
                }

                // If the previous step is the very first one, disable the back button
                if (panelBeforePrev.length <= 0) {
                    deactivateBackButton(backControl);
                }
            });

            // Enable clickable progress navigation items if configured
            if (pluginConfig.showProgressNav && pluginConfig.enableProgressClicks) {
                jq('.' + pluginConfig.progressListCls).children().on('click', function () {
                    var currentPanel = wizardContainer.find(currentStepSelector);
                    var clickedPanel = jq(pluginConfig.stepSelector).eq(jq(this).index());

                    var previousPanel = clickedPanel.prev(pluginConfig.stepSelector);
                    var nextPanel = clickedPanel.next(pluginConfig.stepSelector);

                    // Toggle active classes for current and clicked panels
                    jq(currentPanel).toggleClass(pluginConfig.currentStepCls);
                    clickedPanel.toggleClass(pluginConfig.currentStepCls);

                    // Store the current panel's display mode
                    currentPanel.data('displayMode', currentPanel.css('position'));

                    // Set up internal callback to restore display mode
                    internalTransitionCb = function () { currentPanel.css('position', currentPanel.data('displayMode')); };

                    // Hide the old active panel and show the new one
                    currentPanel.css('position', 'absolute').hide.apply(currentPanel, pluginConfig.forwardAnimArgs);
                    clickedPanel.parents().show.apply(clickedPanel, pluginConfig.backAnimArgs);

                    // Update progress navigation active state
                    progressNavList.find('.' + pluginConfig.currentProgressCls).removeClass(pluginConfig.currentProgressCls);
                    jq(this).addClass(pluginConfig.currentProgressCls);

                    // Adjust navigation buttons based on the new active step's position
                    if (previousPanel.length) {
                        jq(forwardControl).show();
                        submitControl.hide();
                    }

                    // Enable the back button if it's a standard button
                    if (jq(backControl).is(":button")) {
                        jq(backControl).removeAttr('disabled');
                    } else {
                        // Otherwise, remove the disabled class
                        jq(backControl).removeClass(pluginConfig.inactiveCls);
                    }

                    // Disable back button if the clicked panel is the first step
                    if (previousPanel.length <= 0) {
                        deactivateBackButton(backControl);
                    }

                    // Hide forward button and show submit if the clicked panel is the last step
                    if (nextPanel.length <= 0) {
                        jq(forwardControl).hide();
                        submitControl.show();
                    }
                });
            }
            onComplete.call(this); // Execute the final completion callback

        });

    };
})(jQuery);