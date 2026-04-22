/**
 * @license Interactive Workflow Module 4.1.0 (20-MAR-2023)
 *
 * Copyright (c) 2023 Alex Smith (alex.smith[at]example.com)
 *
 * http://www.example.com/workflow
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 */

(function(jQuery){
	jQuery.widget("ui.stepNavigator", {

		// Default configuration for the component
		settings: {
	   		browserHistoryTracking	: false,
			inputValidationActive : false,
			validationSettings : undefined,
			ajaxFormSubmissionActive : false,
			stepLinkSelector	: ".link-target",
			finalSubmissionClass : "completion_stage",
			backBtnSelector : ".back-action",
			nextBtnSelector : ".next-action",
			submitButtonText : 'Complete',
			nextButtonText : 'Proceed',
			backButtonText : 'Return',
			remoteAjaxConfig : undefined,
			enterAnimation : {opacity: 'show'},
			exitAnimation: {opacity: 'hide'},
			enterDuration : 350, // Slightly faster animation
			exitDuration: 350,
			animationEasing: 'easeInOutQuad', // Custom easing
			autoFocusFirstInput : true,
			disableInputsOnInactiveSteps : true,
			submissionOptions : {
				clearForm: true, // Renamed from reset
				successCallback: function(data) {
					// Placeholder for successful form submission
					if (typeof console !== 'undefined' && console.info) {
						console.info("Form submission handled successfully by module.");
					}
				}
			},
			omitDefaultStyles : false,
			debugMode: false // New option for debugging messages
		},

		/**
		 * Initializes the step navigator component.
		 * Sets up internal state, binds events, and applies initial styling.
		 * @private
		 */
		_initializeComponent: function() {
			const self = this; // Use 'self' for consistent context
			const elementId = jQuery(this.element).prop('id');

			// Store original form submission callbacks to chain them
			const originalSuccess = this.settings.submissionOptions.successCallback;
			const originalComplete = this.settings.submissionOptions.complete;
			const originalBeforeSend = this.settings.submissionOptions.beforeSend;
			const originalBeforeSubmit = this.settings.submissionOptions.beforeSubmit;
			const originalBeforeSerialize = this.settings.submissionOptions.beforeSerialize;

			// Augment form submission options with internal logic
			this.settings.submissionOptions = jQuery.extend(true, {}, this.settings.submissionOptions, {
				success	: function(responsePayload, statusText, xhr){
					if(originalSuccess){
						originalSuccess(responsePayload, statusText, xhr);
					}
					// Check for resetForm property or if it's not explicitly set
					const shouldReset = self.settings.submissionOptions && self.settings.submissionOptions.clearForm !== false;
					if(shouldReset){
						self._clearFormState();
					}
				},
				complete : function(xhr, statusText){
					if(originalComplete){
						originalComplete(xhr, statusText);
					}
					self._activateControls();
					self._logMessage("Submission complete, navigation re-enabled.");
				},
				beforeSubmit : function(formDataArray, targetForm, options) {
					if(originalBeforeSubmit){
						const proceedSubmit = originalBeforeSubmit(formDataArray, targetForm, options);
						if(!proceedSubmit) {
							self._activateControls(); // Re-enable if user's callback prevented submission
							self._logMessage("User's beforeSubmit callback prevented form submission.");
						}
						return proceedSubmit;
					}
					return true; // Default to allowing submission
				},
				beforeSend : function(xhr) {
					if(originalBeforeSend){
						const proceedSend = originalBeforeSend(xhr);
						if(!proceedSend) {
							self._activateControls(); // Re-enable if user's callback prevented send
							self._logMessage("User's beforeSend callback prevented AJAX send.");
						}
						return proceedSend;
					}
					return true; // Default to allowing send
				},
				beforeSerialize: function(targetForm, options) {
					if(originalBeforeSerialize){
						const proceedSerialize = originalBeforeSerialize(targetForm, options);
						if(!proceedSerialize) {
							self._activateControls(); // Re-enable if user's callback prevented serialization
							self._logMessage("User's beforeSerialize callback prevented form serialization.");
						}
						return proceedSerialize;
					}
					return true; // Default to allowing serialization
				}
			});

			// Initialize browser history tracking if enabled
			if (this.settings.browserHistoryTracking) {
				// Remove any lingering state for this component's ID
				jQuery.bbq.removeState("_" + elementId);
				this._logMessage("Browser history tracking enabled. Initializing state.");
			}

			// Discover step elements within the component
			this.stepElements = jQuery(this.element).find(".step").hide();
			if (this.stepElements.length === 0) {
				console.error("StepNavigator: No step elements found. Ensure elements with class 'step' exist within the widget.");
				return; // Exit if no steps are found
			}

			// Set initial step identifiers and state
			this.initialStepId = this.stepElements.eq(0).prop("id");
			this.visitedStepsStack = []; // Use array literal
			this.isLastStageReached = false;
			this.previousStageId = undefined;
			this.currentStageId = this.stepElements.eq(0).prop("id");

			// Configure and bind navigation buttons
			this.forwardButton = jQuery(this.element).find(this.settings.nextBtnSelector);
			this.initialForwardBtnValue = this.forwardButton.prop("value");
			this.forwardButton.prop("value", this.settings.nextButtonText)
					.on('click.stepNavigator', function() { // Use namespaced event
						return self._advanceStep();
					});

			this.backwardButton = jQuery(this.element).find(this.settings.backBtnSelector);
			this.initialBackwardBtnValue = this.backwardButton.prop("value");
			this.backwardButton.prop("value", this.settings.backButtonText)
					.on('click.stepNavigator', function() { // Use namespaced event
						self._revertStep();
						return false; // Prevent default form submission
					});

			// Check for validation plugin
			if(this.settings.inputValidationActive && typeof jQuery.fn.validate === 'undefined'){
				this.settings.inputValidationActive = false;
				this._logWarning("inputValidationActive option set, but jQuery Validation plugin is not included.");
			} else if(this.settings.inputValidationActive){
				jQuery(this.element).validate(this.settings.validationSettings);
				this._logMessage("jQuery Validation plugin initialized.");
			}

			// Check for form plugin
			if(this.settings.ajaxFormSubmissionActive && typeof jQuery.fn.ajaxSubmit === 'undefined'){
				this.settings.ajaxFormSubmissionActive = false;
				this._logWarning("ajaxFormSubmissionActive option set, but jQuery Form plugin is not included.");
			} else if (this.settings.ajaxFormSubmissionActive) {
				this._logMessage("jQuery Form plugin detected.");
			}

			// Disable inputs on inactive steps if configured
			if(this.settings.disableInputsOnInactiveSteps === true){
				jQuery(this.stepElements).find(":input:not('.wizard-ignore')").prop("disabled", true);
				this._logMessage("Inputs on inactive steps disabled.");
			}

			// Bind hashchange event for history tracking
			if(this.settings.browserHistoryTracking){
				jQuery(window).on('hashchange.stepNavigator', function(event){
					const hashTargetStep = event.getState( "_" + elementId ) || self.initialStepId;

					if(hashTargetStep && hashTargetStep !== self.currentStageId){
						// If validation is active and we're trying to navigate forward via history
						// we need to re-validate the current step before allowing the change.
						if(self.settings.inputValidationActive && hashTargetStep === self._determineNextTarget(self.currentStageId)){
							if(!jQuery(self.element).valid()){
								self._updateBrowserHistoryState(self.currentStageId); // Revert history state
								jQuery(self.element).validate().focusInvalid();
								self._logMessage("Validation failed during history navigation. Reverted state.");
								return false;
							}
						}
						// Only display if the target step is different from the current one
						if(hashTargetStep !== self.currentStageId) {
							self._displayStep(hashTargetStep);
						}
					}
				});
				this._logMessage("Hashchange event bound for history tracking.");
			}

			// Apply base CSS classes
			jQuery(this.element).addClass("ui-workflow-container");
			jQuery(this.element).find(":input").addClass("ui-workflow-input");
			jQuery(this.stepElements).addClass("ui-workflow-stage");
			jQuery(this.backwardButton).addClass("ui-workflow-button ui-workflow-input");
			jQuery(this.forwardButton).addClass("ui-workflow-button ui-workflow-input");

			// Apply jQuery UI styles if not omitted
			if(!this.settings.omitDefaultStyles){
				jQuery(this.element).addClass("ui-helper-reset ui-widget ui-widget-content ui-corner-all");
				jQuery(this.element).find(":input").addClass("ui-helper-reset ui-state-default");
				jQuery(this.stepElements).addClass("ui-helper-reset ui-corner-all");
				jQuery(this.backwardButton).addClass("ui-helper-reset ui-state-default");
				jQuery(this.forwardButton).addClass("ui-helper-reset ui-state-default");
				this._logMessage("Default UI styles applied.");
			}

			// Display the first step upon initialization
			this._displayStep(undefined); // Pass undefined to show first step and trigger initial state.
			return jQuery(this);
		},

		/**
		 * Handles the logic for advancing to the next step.
		 * Performs validation, remote AJAX checks, and then progresses.
		 * @private
		 * @returns {boolean} False if navigation is prevented, true if form is submitted (final step without AJAX form plugin).
		 */
		_advanceStep : function(){
			// Guard clause for validation
			if(this.settings.inputValidationActive && !jQuery(this.element).valid()){
				jQuery(this.element).validate().focusInvalid();
				this._logMessage("Validation failed for current step. Cannot advance.");
				return false;
			}

			// Handle remote AJAX configuration for the current step
			if(this.settings.remoteAjaxConfig !== undefined){
				const currentStepConfig = this.settings.remoteAjaxConfig[this.currentStageId];
				const self = this; // Maintain context for callbacks

				if(currentStepConfig !== undefined){
					const originalRemoteSuccess = currentStepConfig.success;
					const originalRemoteBeforeSend = currentStepConfig.beforeSend;
					const originalRemoteComplete = currentStepConfig.complete;

					// Extend remote AJAX options with internal callbacks
					const ajaxOptions = jQuery.extend(true, {}, currentStepConfig, {
						success: function(data, statusText){
							let proceedAfterRemote = true;
							if(originalRemoteSuccess !== undefined) {
								proceedAfterRemote = originalRemoteSuccess(data, statusText);
							}
							if(proceedAfterRemote !== false){ // Only proceed if user's callback doesn't explicitly return false
								self._processStepProgression();
							} else {
								self._logMessage("Remote AJAX success callback prevented step progression.");
							}
						},
						beforeSend : function(xhr){
							self._deactivateControls();
							if(originalRemoteBeforeSend !== undefined) {
								originalRemoteBeforeSend(xhr);
							}
							jQuery(self.element).trigger('before_remote_ajax_call', {"currentStepId" : self.currentStageId});
							self._logMessage("Remote AJAX beforeSend triggered.");
						},
						complete : function(xhr, statusText){
							if(originalRemoteComplete !== undefined) {
								originalRemoteComplete(xhr, statusText);
							}
							jQuery(self.element).trigger('after_remote_ajax_call', {"currentStepId" : self.currentStageId});
							self._activateControls();
							self._logMessage("Remote AJAX complete triggered. Controls re-enabled.");
						}
					});
					jQuery(this.element).ajaxSubmit(ajaxOptions);
					return false; // Prevent default form submission as AJAX is handling it
				}
			}

			// If no remote AJAX or it completed successfully, continue to next step
			return this._processStepProgression();
		},

		/**
		 * Handles the logic for navigating back to the previous step.
		 * @private
		 * @returns {boolean} Always false to prevent default form submission.
		 */
		_revertStep : function(){
			// Ensure there are steps to go back to
			if(this.visitedStepsStack.length > 1){ // Need at least two to go back one
				const targetStepId = this.visitedStepsStack[this.visitedStepsStack.length - 2]; // Get the step before the current one

				if(this.settings.browserHistoryTracking){
					this._updateBrowserHistoryState(targetStepId);
					this._logMessage(`Navigating back to step: ${targetStepId} via history.`);
				} else {
					this._displayStep(targetStepId, true); // True indicates backward navigation
					this._logMessage(`Navigating back to step: ${targetStepId} directly.`);
				}
			} else {
				this._logMessage("Cannot go back, already on the first step or no history.");
			}
			return false;
		},

		/**
		 * Core logic for determining and displaying the next step.
		 * Handles final form submission if on the last step.
		 * @private
		 * @returns {boolean} False if navigation is handled internally, true if form is submitted without AJAX plugin.
		 */
		_processStepProgression : function(){
			// If on the last step, handle form submission
			if(this.isLastStageReached){
				// Re-enable all inputs in visited steps before final submission
				for(let i = 0; i < this.visitedStepsStack.length; i++){
					const stepId = this.visitedStepsStack[i];
					jQuery(this.stepElements).filter("#" + stepId).find(":input").not(".wizard-ignore").prop("disabled", false);
				}
				this._logMessage("Final step reached. All visited inputs re-enabled.");

				if(!this.settings.ajaxFormSubmissionActive){
					this._logMessage("Form submitted normally (no AJAX Form plugin).");
					return true; // Allow default form submission
				} else {
					this._deactivateControls();
					jQuery(this.element).ajaxSubmit(this.settings.submissionOptions);
					this._logMessage("Form submitted via AJAX Form plugin.");
					return false; // Prevent default form submission
				}
			}

			// Determine the next step ID
			const nextStageId = this._determineNextTarget(this.currentStageId);

			// If no actual change in step, prevent further action
			if(nextStageId === this.currentStageId){
				this._logMessage("Next stage is the same as current stage. No progression.");
				return false;
			}

			// Update browser history or directly display the next step
			if(this.settings.browserHistoryTracking){
				this._updateBrowserHistoryState(nextStageId);
				this._logMessage(`Progressing to step: ${nextStageId} via history.`);
			} else {
				this._displayStep(nextStageId, false); // False indicates forward navigation
				this._logMessage(`Progressing to step: ${nextStageId} directly.`);
			}
			return false;
		},

		/**
		 * Updates the browser's history state with the current step ID.
		 * @private
		 * @param {string} targetStepId - The ID of the step to record in history.
		 */
		_updateBrowserHistoryState : function(targetStepId){
			const historyState = {};
			historyState["_" + jQuery(this.element).prop('id')] = targetStepId;
			jQuery.bbq.pushState(historyState);
			this._logMessage(`Browser history updated to step: ${targetStepId}.`);
		},

		/**
		 * Disables navigation buttons and potentially adjusts their styles.
		 * @private
		 */
		_deactivateControls : function(){
			this.forwardButton.prop("disabled", true);
			this.backwardButton.prop("disabled", true);
			if(!this.settings.omitDefaultStyles){
				this.forwardButton.removeClass("ui-state-active").addClass("ui-state-disabled");
				this.backwardButton.removeClass("ui-state-active").addClass("ui-state-disabled");
			}
			this._logMessage("Navigation controls deactivated.");
		},

		/**
		 * Enables navigation buttons and adjusts their styles based on current step.
		 * @private
		 */
		_activateControls : function(){
			// Update next button text based on whether it's the last step
			if(this.isLastStageReached){
				this.forwardButton.prop("value", this.settings.submitButtonText);
			} else {
				this.forwardButton.prop("value", this.settings.nextButtonText);
			}

			// Enable back button if not on the first step
			if(jQuery.trim(this.currentStageId) !== this.stepElements.eq(0).prop("id")){
				this.backwardButton.prop("disabled", false);
				if(!this.settings.omitDefaultStyles){
					this.backwardButton.removeClass("ui-state-disabled").addClass("ui-state-active");
				}
			} else {
				// Ensure back button is disabled on the first step
				this.backwardButton.prop("disabled", true);
				if(!this.settings.omitDefaultStyles){
					this.backwardButton.removeClass("ui-state-active").addClass("ui-state-disabled");
				}
			}

			// Always enable the forward button (its text changes for final step)
			this.forwardButton.prop("disabled", false);
			if(!this.settings.omitDefaultStyles){
				this.forwardButton.removeClass("ui-state-disabled").addClass("ui-state-active");
			}
			this._logMessage("Navigation controls activated.");
		},

		/**
		 * Animates the transition between steps.
		 * @private
		 * @param {string} previousStepId - The ID of the step currently being hidden.
		 * @param {string} newStepId - The ID of the step being shown.
		 * @param {Function} transitionCompleteCallback - Callback to execute after animations complete.
		 */
		_transitionSteps : function(previousStepId, newStepId, transitionCompleteCallback){
			this._deactivateControls(); // Disable controls during animation

			const oldStepElement = jQuery(this.stepElements).filter("#" + previousStepId);
			const newStepElement = jQuery(this.stepElements).filter("#" + newStepId);

			if (oldStepElement.length === 0 || newStepElement.length === 0) {
				this._logWarning(`Attempted transition between non-existent steps: ${previousStepId} to ${newStepId}.`);
				transitionCompleteCallback.apply(this); // Call callback even if animation fails
				return;
			}

			// Disable inputs on the old step, enable on the new step
			if (this.settings.disableInputsOnInactiveSteps) {
				oldStepElement.find(":input").not(".wizard-ignore").prop("disabled", true);
				newStepElement.find(":input").not(".wizard-ignore").prop("disabled", false);
			}

			const self = this;
			oldStepElement.animate(self.settings.exitAnimation, self.settings.exitDuration, self.settings.animationEasing, function(){
				newStepElement.animate(self.settings.enterAnimation, self.settings.enterDuration, self.settings.animationEasing, function(){
					if(self.settings.autoFocusFirstInput) {
						newStepElement.find(":input:visible:first").focus(); // Focus on first visible input
					}
					self._activateControls(); // Re-enable controls after animation
					transitionCompleteCallback.apply(self);
					self._logMessage(`Animated transition from ${previousStepId} to ${newStepId} completed.`);
				});
			});
		},

		/**
		 * Checks if the given step ID corresponds to the last step in the sequence.
		 * @private
		 * @param {string} stepToCheckId - The ID of the step to evaluate.
		 */
		_evaluateFinalStepStatus : function(stepToCheckId){
			this.isLastStageReached = false;
			// A step is considered final if it has the finalSubmissionClass or is the last discovered step
			if(jQuery("#" + stepToCheckId).hasClass(this.settings.finalSubmissionClass) || this.stepElements.filter(":last").prop("id") === stepToCheckId){
				this.isLastStageReached = true;
				this._logMessage(`Step '${stepToCheckId}' identified as the final stage.`);
			}
		},

		/**
		 * Retrieves the target step ID from a link element within the current step.
		 * @private
		 * @param {string} currentStepId - The ID of the current step.
		 * @returns {string|undefined} The ID of the target step, or undefined if no link found.
		 */
		_retrieveNavigationTarget : function(currentStepId){
			let targetLinkValue = undefined;
			const links = jQuery(this.stepElements).filter("#" + currentStepId).find(this.settings.stepLinkSelector);

			if(links.length > 0){
				if(links.filter(":radio,:checkbox").length > 0){
					targetLinkValue = links.filter(this.settings.stepLinkSelector + ":checked").val();
				}else{
					targetLinkValue = links.val();
				}
			}
			return targetLinkValue;
		},

		/**
		 * Determines the ID of the next step based on links or sequential order.
		 * @private
		 * @param {string} currentStepId - The ID of the current step.
		 * @returns {string} The ID of the next step, or the current step ID if no valid next step found.
		 */
		_determineNextTarget : function(currentStepId){
			const linkedTarget = this._retrieveNavigationTarget(currentStepId);

			if(linkedTarget !== undefined && linkedTarget !== "" && linkedTarget !== null){
				// If a link is defined and points to an existing step, use it
				if(jQuery(this.stepElements).filter("#" + linkedTarget).length > 0){
					this._logMessage(`Navigation target determined by link: ${linkedTarget}.`);
					return linkedTarget;
				}
				this._logWarning(`Linked target '${linkedTarget}' does not correspond to an existing step.`);
			}

			// If no valid link, determine the next sequential step
			if(!this.isLastStageReached){
				const nextSequentialStep = jQuery(this.stepElements).filter("#" + currentStepId).next().prop("id");
				if (nextSequentialStep) {
					this._logMessage(`Navigation target determined sequentially: ${nextSequentialStep}.`);
					return nextSequentialStep;
				}
			}

			// If no link and no sequential next step (or it's the last step), stay on current
			this._logMessage(`No valid next navigation target found. Staying on step: ${currentStepId}.`);
			return currentStepId;
		},

		/**
		 * Displays a specific step, handling history, state updates, and animation.
		 * @private
		 * @param {string|undefined} targetStepId - The ID of the step to show. If undefined, shows the initial step.
		 * @param {boolean} [isBackwardNav=false] - True if navigating backwards.
		 */
		_displayStep : function(targetStepId, isBackwardNav = false){
			const triggerEvents = targetStepId !== undefined; // Only trigger events if not initial display

			// Handle initial display or navigation
			if(targetStepId === undefined || targetStepId === ""){
				this.visitedStepsStack = []; // Clear stack for initial display
				targetStepId = this.initialStepId;
				this.visitedStepsStack.push(targetStepId);
				this._logMessage(`Displaying initial step: ${targetStepId}.`);
			} else {
				const stepIndex = this.visitedStepsStack.indexOf(targetStepId);
				if(stepIndex > -1){ // Step already visited, implies backward navigation
					// Trim stack to the target step
					this.visitedStepsStack = this.visitedStepsStack.slice(0, stepIndex + 1);
					isBackwardNav = true; // Ensure flag is true if navigating to an earlier visited step
					this._logMessage(`Navigating to previously visited step: ${targetStepId}. Stack trimmed.`);
				} else { // New step, add to stack
					this.visitedStepsStack.push(targetStepId);
					this._logMessage(`Navigating to new step: ${targetStepId}. Added to stack.`);
				}
			}

			// Only proceed if the target step is different from the current one (or it's the very first display)
			if(this.currentStageId !== targetStepId || targetStepId === this.initialStepId){
				this.previousStageId = this.currentStageId;
				this._evaluateFinalStepStatus(targetStepId);
				this.currentStageId = targetStepId;

				const self = this;
				const stepTransitionCallback = function(){
					if(triggerEvents){
						jQuery(self.element).trigger('step_displayed', jQuery.extend({"isBackNavigation" : isBackwardNav}, self._getCurrentStateDetails()));
						self._logMessage(`'step_displayed' event triggered for step: ${targetStepId}.`);
					}
				};

				if(triggerEvents){
					jQuery(self.element).trigger('before_step_display', jQuery.extend({"isBackNavigation" : isBackwardNav}, self._getCurrentStateDetails()));
					self._logMessage(`'before_step_display' event triggered for step: ${targetStepId}.`);
				}

				this._transitionSteps(this.previousStageId, targetStepId, stepTransitionCallback);
			} else {
				this._logMessage(`Attempted to display step '${targetStepId}' which is already active.`);
			}
		},

		/**
		 * Resets the form and the component's internal state to its initial condition.
		 * @private
		 */
	   _clearFormState : function(){
			// Reset the form using jQuery Form Plugin's resetForm method
			jQuery(this.element).resetForm();
			// Clear validation error classes and messages
			jQuery("label.error, .error-message", this.element).removeClass("error").hide();
			jQuery(":input.error", this.element).removeClass("error");

			// Hide all steps and disable their inputs
			for(const stepId of this.visitedStepsStack){
				jQuery(this.stepElements).filter("#" + stepId).hide().find(":input").prop("disabled", true);
			}
			this._logMessage("Form reset and inputs disabled on all steps.");

			this.visitedStepsStack = []; // Reset visited steps
			this.previousStageId = undefined;
			this.isLastStageReached = false;

			if(this.settings.browserHistoryTracking){
				this._updateBrowserHistoryState(this.initialStepId);
			}else{
				this._displayStep(this.initialStepId);
			}
			this._logMessage("Component state cleared and reset to initial step.");
		},

		/**
		 * Retrieves the current state of the component.
		 * @private
		 * @param {string} [key] - Optional key to retrieve a specific state property.
		 * @returns {object|any} The full state object or a specific property value.
		 */
		_getCurrentStateDetails : function(key){
			const componentState = {
				"currentSettings" : this.settings,
				"visitedSteps" : [...this.visitedStepsStack], // Clone array
				"isFinalStage" : this.isLastStageReached,
				"isFirstStage" : this.currentStageId === this.initialStepId,
				"lastVisitedStage" : this.previousStageId,
				"activeStageId" : this.currentStageId,
				"backwardControl" : this.backwardButton,
				"forwardControl" : this.forwardButton,
				"allStepElements" : this.stepElements,
				"firstStageId" : this.initialStepId,
				"totalSteps" : this.stepElements.length
			};

			if(key !== undefined) {
				return componentState[key];
			}

			return componentState;
		},

		/**
		 * Logs a message to the console if debugMode is enabled.
		 * @private
		 * @param {string} message - The message to log.
		 */
		_logMessage: function(message) {
			if (this.settings.debugMode && typeof console !== 'undefined' && console.log) {
				console.log(`[StepNavigator Debug] ${message}`);
			}
		},

		/**
		 * Logs a warning message to the console.
		 * @private
		 * @param {string} message - The warning message to log.
		 */
		_logWarning: function(message) {
			if (typeof console !== 'undefined' && console.warn) {
				console.warn(`[StepNavigator Warning] ${message}`);
			}
		},

	  /* Public Methods */

		/**
		 * Public method to show a specific step.
		 * @param {string} stepId - The ID of the step to display.
		 */
		showStep : function(stepId){
			if(this.settings.browserHistoryTracking){
				this._updateBrowserHistoryState(stepId);
			}else{
				this._displayStep(stepId);
			}
		},

		/**
		 * Public method to get the current state or a specific part of it.
		 * @param {string} [key] - Optional key to retrieve a specific state property.
		 * @returns {object|any} The full state object or a specific property value.
		 */
		getComponentState : function(key){
			return this._getCurrentStateDetails(key);
		},

		/**
		 * Public method to reset the component.
		 */
		resetComponent : function(){
			this._clearFormState();
		},

		/**
		 * Public method to advance to the next step programmatically.
		 */
		nextStep : function(){
			this._advanceStep();
		},

		/**
		 * Public method to go back to the previous step programmatically.
		 */
		previousStep : function(){
			this._revertStep();
		},

		/**
		 * Cleans up the component, unbinding events and removing added classes.
		 * @private
		 */
		_cleanupAndDestroy: function() {
			const $element = jQuery(this.element);

			// Re-enable all inputs and show all steps
			$element.find("*").prop("disabled", false).show();

			// Unbind button events and restore initial values/styles
			this.forwardButton.off('.stepNavigator').prop("value", this.initialForwardBtnValue)
				.removeClass("ui-state-disabled").addClass("ui-state-active");
			this.backwardButton.off('.stepNavigator').prop("value", this.initialBackwardBtnValue)
				.removeClass("ui-state-disabled").addClass("ui-state-active");

			// Unbind window hashchange event
			jQuery(window).off('hashchange.stepNavigator');

			// Remove all custom classes and jQuery UI classes
			$element.removeClass("ui-workflow-container ui-helper-reset ui-widget ui-widget-content ui-corner-all");
			$element.find(":input").removeClass("ui-workflow-input ui-helper-reset ui-state-default");
			this.stepElements.removeClass("ui-workflow-stage ui-helper-reset ui-corner-all");
			this.backwardButton.removeClass("ui-workflow-button ui-workflow-input ui-helper-reset ui-state-default");
			this.forwardButton.removeClass("ui-workflow-button ui-workflow-input ui-helper-reset ui-state-default");

			// Clear internal references
			this.initialForwardBtnValue = undefined;
			this.initialBackwardBtnValue = undefined;
			this.visitedStepsStack = undefined;
			this.previousStageId = undefined;
			this.currentStageId = undefined;
			this.isLastStageReached = undefined;
			this.settings = undefined; // Clear settings reference
			this.forwardButton = undefined;
			this.backwardButton = undefined;
			this.stepElements = undefined;
			this.initialStepId = undefined;

			// Call base widget destroy method
			jQuery.Widget.prototype.destroy.call(this);
			this._logMessage("Component destroyed and resources released.");
		},

		/**
		 * Public method to refresh the list of step elements.
		 * Useful if steps are dynamically added or removed.
		 */
		refreshSteps : function(){
			this.stepElements = jQuery(this.element).find(".step").addClass("ui-workflow-stage");
			this.initialStepId = this.stepElements.eq(0).prop("id");

			// Hide all steps except the current one and disable their inputs
			jQuery(this.stepElements).not("#" + this.currentStageId).hide().find(":input").addClass("ui-workflow-input").prop("disabled", true);

			this._evaluateFinalStepStatus(this.currentStageId);
			this._activateControls(); // Re-evaluate navigation buttons

			if(!this.settings.omitDefaultStyles){
				this.stepElements.addClass("ui-helper-reset ui-corner-all");
				jQuery(this.stepElements).find(":input").addClass("ui-helper-reset ui-state-default");
			}
			this._logMessage("Step elements refreshed and re-initialized.");
		}
	});
})(jQuery);