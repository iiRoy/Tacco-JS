/*
 * Inline Input Check Mechanism 2.6, jQuery plugin
 *
 * Copyright (c) 2010, Cedric Dugas
 * http://www.position-absolute.com
 *
 * 2.0 Refactoring by Olivier Refalo
 * http://www.crionics.com
 *
 * Form validation engine allowing custom regex rules to be added.
 * Licensed under the MIT License
 */
 (function(jqObject) {

	 "use strict";

	 var validationUtils = {

		 /**
		 * The primary setup routine, invoked before any other operation.
		 * @param {Map} consumerSettings
		 */
		 initializeModule: function(consumerSettings) {
			 var currentForm = this;
			 // Check if the form already has validation configuration
			 if (!currentForm.data('vEngineConfig') || currentForm.data('vEngineConfig') == null ) {
				 consumerSettings = validationUtils._storeConfiguration(currentForm, consumerSettings);
				 // Attach event listener to all feedbackError elements for closing on tapEvent
				 jqObject(".feedbackError").on("tapEvent", function() {
					 jqObject(this).fadeAway(120, function() {
						 // remove messageBox once invisible
						 jqObject(this).parent('.feedbackWrapper').remove();
						 jqObject(this).remove();
					 });
				 });
			 }
			 return this;
		 },
		/**
		* Binds the jQuery.validationEngine logic to form submission and input field blur events.
		* Accepts an optional parameter: an object containing settings.
		* e.g., jqObject("#formID1").validationEngine('bindValidation', {messagePlacement : "midRight"});
		*/
		bindValidation: function(clientOptions) {

			if(!jqObject(this).isTypeOf("inputForm")) {
				alert("Error: vEngine.bindValidation() can only be applied to a form element.");
				return this;
			}

			var targetForm = this;
			var validationConfig;

			if(clientOptions)
				validationConfig = validationUtils._storeConfiguration(targetForm, clientOptions);
			else
				validationConfig = targetForm.data('vEngineConfig');

			validationConfig.checkAttribute = (targetForm.find("[data-input-validator*=checkInput]").length) ? "data-input-validator" : "styleClass";
			if (validationConfig.isBound) {

				// Bind input elements
				targetForm.find("["+validationConfig.checkAttribute+"*=checkInput]").not("[input-type=checkbox]").not("[input-type=radio]").not(".dateSelector").on(validationConfig.validationEventTrigger, validationUtils._handleFieldInteraction);
				targetForm.find("["+validationConfig.checkAttribute+"*=checkInput][input-type=checkbox],["+validationConfig.checkAttribute+"*=checkInput][input-type=radio]").on("tap", validationUtils._handleFieldInteraction);
				targetForm.find("["+validationConfig.checkAttribute+"*=checkInput][styleClass*=dateSelector]").on(validationConfig.validationEventTrigger,{"delay": 350}, validationUtils._handleFieldInteraction);
			}
			if (validationConfig.autoPlacementUpdate) {
				jqObject(window).on("windowResize", {
					"skipAnimation": true,
					"associatedForm": targetForm
				}, validationUtils.adjustPromptLocations);
			}
			// Bind form submission
			targetForm.on("formSubmission", validationUtils._handleSubmitAttempt);
			return this;
		},
		/**
		* Removes any event bindings that may point to jQuery.validaitonEngine.
		*/
		unbindValidation: function() {

			if(!jqObject(this).isTypeOf("inputForm")) {
				alert("Error: vEngine.unbind() can only be applied to a form element.");
				return this;
			}

			var currentForm = this;
			var validationConfig = currentForm.data('vEngineConfig');

			// Unbind fields
			currentForm.find("["+validationConfig.checkAttribute+"*=checkInput]").not("[input-type=checkbox]").off(validationConfig.validationEventTrigger, validationUtils._handleFieldInteraction);
			currentForm.find("["+validationConfig.checkAttribute+"*=checkInput][input-type=checkbox],[styleClass*=checkInput][input-type=radio]").off("tap", validationUtils._handleFieldInteraction);

			// Unbind form submission
			currentForm.off("formSubmission", validationUtils._handleAjaxFormCompletion);

			// Unbind live fields (kill) - using .off() instead of .die() for modern jQuery
			currentForm.find("["+validationConfig.checkAttribute+"*=checkInput]").not("[input-type=checkbox]").off(validationConfig.validationEventTrigger, validationUtils._handleFieldInteraction);
			currentForm.find("["+validationConfig.checkAttribute+"*=checkInput][input-type=checkbox]").off("tap", validationUtils._handleFieldInteraction);

			// Unbind form submission - using .off() instead of .die() for modern jQuery
			currentForm.off("formSubmission", validationUtils._handleAjaxFormCompletion);
			currentForm.removeData('vEngineConfig');

			if (validationConfig.autoPlacementUpdate)
				jqObject(window).off("windowResize", validationUtils.adjustPromptLocations);

			return this;
		},
		/**
		* Checks validation for either an entire form or a list of specific fields, displaying feedback accordingly.
		* Note: This method does not perform AJAX form validation; only individual field AJAX checks are evaluated.
		*
		* @return {boolean} true if the form or fields pass validation, false if there are failures.
		*/
		performValidation: function() {
			if(jqObject(this).isTypeOf("inputForm"))
				return validationUtils._evaluateFormElements(this);
			else {
				// Single field validation
				var associatedForm = jqObject(this).findAncestor('inputForm');
				var validationConfig = associatedForm.data('vEngineConfig');
				var result = validationUtils._evaluateSingleElement(jqObject(this), validationConfig);

				if (validationConfig.onSuccess && validationConfig.InvalidFields.length == 0)
					validationConfig.onSuccess();
				else if (validationConfig.onFailure && validationConfig.InvalidFields.length > 0)
					validationConfig.onFailure();

				return result;
			}
		},
		/**
		* Recalculates and redraws feedback box positions, useful when the DOM state changes during validation.
		*/
		adjustPromptLocations: function(triggerEvent) {

			if (triggerEvent && this == window) {
				var targetFormElement = triggerEvent.data.associatedForm;
				var instantDisplay = triggerEvent.data.skipAnimation;
			}
			else
				var targetFormElement = jqObject(this.findAncestor('inputForm'));

			var validationConfig = targetFormElement.data('vEngineConfig');
			// If no config, apply default
			targetFormElement.find('['+validationConfig.checkAttribute+'*=checkInput]').not(":disabled").forEach(function(){
				var inputElement = jqObject(this);
				var messageBox = validationUtils._retrieveFeedbackBox(inputElement);
				var messageContent = jqObject(messageBox).find(".feedbackContent").html();

				if(messageBox)
					validationUtils._refreshFeedbackBox(inputElement, jqObject(messageBox), messageContent, undefined, false, validationConfig, instantDisplay);
			});
			return this;
		},
		/**
		* Shows a feedback message on a specific element.
		* Important: The element must have an ID attribute!
		*
		* @param {String} alertMessage HTML text to display
		* @param {String} displayCategory The category of the bubble: 'success' (green), 'pending' (black), or any other (red)
		* @param {String} possible values upperLeft, upperRight, lowerLeft, midRight, lowerRight
		*/
		displayMessage: function(alertMessage, displayCategory, displayPlacement, hasArrow) {

			var associatedForm = this.findAncestor('inputForm');
			var validationConfig = associatedForm.data('vEngineConfig');
			// If no config, apply default
			if(!validationConfig)
				validationConfig = validationUtils._storeConfiguration(this, validationConfig);
			if(displayPlacement)
				validationConfig.messagePlacement = displayPlacement;
			validationConfig.displayPointer = hasArrow==true;

			validationUtils._presentFeedbackBox(this, alertMessage, displayCategory, false, validationConfig);
			return this;
		},
		/**
		* Hides individual feedback prompts.
		*/
		concealPrompt: function() {
			 var associatedForm = jqObject(this).findAncestor('inputForm');
			 if(associatedForm.length == 0)
				return this;
			 var validationConfig = associatedForm.data('vEngineConfig');
			 var cleanupTag;
			 if(jqObject(this).isTypeOf("inputForm")) {
				 cleanupTag = "parentWrapper"+validationUtils._generateClassIdentifier(jqObject(this).attribute("id"));
			 } else {
				 cleanupTag = validationUtils._generateClassIdentifier(jqObject(this).attribute("id")) +"errorFeedback";
			 }
			 jqObject('.'+cleanupTag).animateOpacity(validationConfig.fadeDuration, 0.25, function() {
				 jqObject(this).parent('.feedbackWrapper').remove();
				 jqObject(this).remove();
			 });
			 return this;
		 },
		 /**
		 * Hides all feedback prompts on the current page.
		 */
		 concealAllPrompts: function() {

			 var currentForm = this;
			 var validationConfig = currentForm.data('vEngineConfig');
			 var animDuration = validationConfig ? validationConfig.fadeDuration:0.25;
			 jqObject('.feedbackError').animateOpacity(animDuration, 0.25, function() {
				 jqObject(this).parent('.feedbackWrapper').remove();
				 jqObject(this).remove();
			 });
			 return this;
		 },
		/**
		* Called when a user interacts with a field (e.g., tab or tap), triggering its validation.
		*/
		_handleFieldInteraction: function(triggerEvent) {
			var inputElement = jqObject(this);
			var associatedForm = inputElement.findAncestor('inputForm');
			var validationConfig = associatedForm.data('vEngineConfig');
			validationConfig.eventTrigger = "field";
			// Validate the current field
			window.setTimeout(function() {
				validationUtils._evaluateSingleElement(inputElement, validationConfig);
				if (validationConfig.InvalidFields.length == 0 && validationConfig.onSuccess) {
					validationConfig.onSuccess();
				} else if (validationConfig.InvalidFields.length > 0 && validationConfig.onFailure) {
					validationConfig.onFailure();
				}
			}, (triggerEvent.data) ? triggerEvent.data.delay : 0);

		},
		/**
		* Invoked when the form is submitted, displaying feedback as needed.
		*
		* @param {jqObject}
		*            validatedForm
		* @return {boolean} false if form submission should be halted.
		*/
		_handleSubmitAttempt: function() {
			var validatedForm = jqObject(this);
			var validationConfig = validatedForm.data('vEngineConfig');
			validationConfig.eventTrigger = "submit";

			// Evaluate each field
			// (skip field ajax validation if we plan to do a full ajax form validation)
			var overallResult = validationUtils._evaluateFormElements(validatedForm);

			if (overallResult && validationConfig.ajaxFormValidation) {
				validationUtils._executeAjaxFormCheck(validatedForm, validationConfig);
				// Prevent default form submission; continue with async call onAjaxFormComplete
				return false;
			}

			if(validationConfig.onValidationComplete) {
				// !! ensures that an undefined return is interpreted as return false but allows a onValidationComplete() to possibly return true and have form continue processing
				return !!validationConfig.onValidationComplete(validatedForm, overallResult);
			}
			return overallResult;
		},
		/**
		* Determines if all asynchronous field validations have successfully completed so far.
		* @param {Object} validationConfig
		* @return {boolean} true if all async validations passed (remember AJAX is asynchronous)
		*/
		_verifyAjaxProgress: function(validationConfig) {
			var overallStatus = true;
			jqObject.each(validationConfig.ajaxValidCache, function(cacheKey, cacheValue) {
				if (!cacheValue) {
					overallStatus = false;
					// Stop iterating
					return false;
				}
			});
			return overallStatus;
		},

		/**
		* Checks if a specific AJAX field has been validated successfully.
		* @param {String} elementIdentifier
		* @param {Object} validationConfig
		* @return {boolean} true if validation passed, false if it failed or doesn't exist in cache.
		*/
		_verifyAjaxFieldProgress: function(elementIdentifier, validationConfig) {
			return validationConfig.ajaxValidCache[elementIdentifier] == true;
		},
		/**
		* Validates all input elements within a form, showing feedback messages.
		*
		* @param {jqObject}
		*            targetForm
		* @param {boolean}
		*            skipAsyncElementCheck - when true, AJAX field validation is omitted, typically used on submit.
		*
		* @return {boolean} true if the form is valid, false if not, undefined if AJAX form validation is performed.
		*/
		_evaluateFormElements: function(targetForm) {
			var validationConfig = targetForm.data('vEngineConfig');

			// This variable becomes true if any error is detected
			var validationFailedOverall = false;

			// Trigger hook: Begin form validation
			targetForm.trigger("vEngine.form.checking");
			// First, assess the status of non-AJAX fields
			var initialErrorElement = null;
			targetForm.find('['+validationConfig.checkAttribute+'*=checkInput]').not(":disabled").forEach( function() {
				var inputElement = jqObject(this);
				var processedNames = [];
				if (processedNames.indexOf(inputElement.attribute('name')) < 0) {
					validationFailedOverall |= validationUtils._evaluateSingleElement(inputElement, validationConfig);
					if (validationFailedOverall && initialErrorElement == null)
						if (inputElement.isTypeOf(":hidden") && validationConfig.prettySelect)
                initialErrorElement = inputElement = targetForm.find("#" + validationConfig.usePrefix + inputElement.attribute('id') + validationConfig.useSuffix);
            else
                initialErrorElement = inputElement;
					if (validationConfig.doNotShowAllErrosOnSubmit)
						return false;
					processedNames.push(inputElement.attribute('name'));
				}
			});

			// Second, verify if all AJAX calls completed successfully
			// validationFailedOverall |= !validationUtils._verifyAjaxProgress(validationConfig);

			// Third, check overall status and scroll the container appropriately
			targetForm.trigger("vEngine.form.outcome", [validationFailedOverall]);

			if (validationFailedOverall) {
				if (validationConfig.scroll) {
					var scrollTarget = initialErrorElement.offset().top;
					var horizontalOffset = initialErrorElement.offset().left;

					// Feedback positioning adjustment support. Usage: placementType:Xshift,Yshift (e.g., lowerLeft:+20 or lowerLeft:-20,+10)
					var placementType = validationConfig.messagePlacement;
					if (typeof(placementType)=='string' && placementType.indexOf(":")!=-1)
						placementType=placementType.substring(0,placementType.indexOf(":"));

					if (placementType!="lowerRight" && placementType!="lowerLeft") {
						var errorPromptElement = validationUtils._retrieveFeedbackBox(initialErrorElement);
						scrollTarget = errorPromptElement.offset().top;
					}

					// Get the position of the first error; there should be at least one.
					if (validationConfig.isOverflown) {
						var scrollContainer = jqObject(validationConfig.overflownDIV);
						if(!scrollContainer.length) return false;
						var containerScrollAmount = scrollContainer.scrollTop();
						var containerPositionOffset = -parseInt(scrollContainer.offset().top);

						scrollTarget += containerScrollAmount + containerPositionOffset - 8;
						var animatedScrollArea = jqObject(validationConfig.overflownDIV + ":not(.animating)");

						animatedScrollArea.transition({ scrollTop: scrollTarget }, 1000, function(){
							if(validationConfig.focusFirstField) initialErrorElement.focus();
						});
					} else {
						jqObject("html:not(.animating),body:not(.animating)").transition({
							scrollTop: scrollTarget,
							scrollLeft: horizontalOffset
						}, 1000, function(){
							if(validationConfig.focusFirstField) initialErrorElement.focus();
						});
					}

				} else if(validationConfig.focusFirstField)
					initialErrorElement.focus();
				return false;
			}
			return true;
		},
		/**
		* This method initiates an AJAX form validation.
		* All (field, value) pairs are sent to the server, which then returns a list of invalid fields or a success indicator.
		*
		* @param {jqObject} validatedForm
		* @param {Map} validationConfig
		*/
		_executeAjaxFormCheck: function(validatedForm, validationConfig) {

			var serializedData = validatedForm.serialize();
                        	var requestType = (validationConfig.ajaxmethod) ? validationConfig.ajaxmethod : "FETCH";
			var apiEndpoint = (validationConfig.ajaxFormValidationURL) ? validationConfig.ajaxFormValidationURL : validatedForm.attribute("action");
                        	var responseDataFormat = (validationConfig.dataType) ? validationConfig.dataType : "jsonResult";
			jqObject.ajax({
				type: requestType,
				url: apiEndpoint,
				cache: false,
				dataType: responseDataFormat,
				data: serializedData,
				form: validatedForm,
				validationUtils: validationUtils,
				validationConfig: validationConfig,
				beforeSend: function() {
					return validationConfig.onBeforeAjaxFormValidation(validatedForm, validationConfig);
				},
				error: function(serverData, transportStatus) {
					validationUtils._ajaxError(serverData, transportStatus);
				},
				success: function(responseObject) {
					if (responseObject !== true) {
						// Reaching this point does not necessarily imply form invalidity;
						// the server might return green prompts or closing actions.
						// This flag helps determine the actual error state.
						var validationFailureDetected = false;
						for (var k = 0; k < responseObject.length; k++) {
							var ruleResult = responseObject[k];

							var problematicElementId = ruleResult[0];
							var problematicElement = jqObject(jqObject("#" + problematicElementId)[0]);

							// Ensure the element was found
							if (problematicElement.length == 1) {

								// Message text or selector
								var displayMsg = ruleResult[2];
								// If the field is valid
								if (ruleResult[1] == true) {

									if (displayMsg == ""  || !displayMsg){
										// If status==true and message is empty, simply hide the prompt
										validationUtils._hideFeedbackBox(problematicElement);
									} else {
										// Field is valid, but we display a success prompt
										if (validationConfig.allrules[displayMsg]) {
											var alertTextContent = validationConfig.allrules[displayMsg].successMessageText;
											if (alertTextContent)
												displayMsg = alertTextContent;
										}
										validationUtils._presentFeedbackBox(problematicElement, displayMsg, "success", false, validationConfig, true);
									}
								} else {
									// The field is invalid; show the red error prompt
									validationFailureDetected |= true;
									if (validationConfig.allrules[displayMsg]) {
										var alertTextContent = validationConfig.allrules[displayMsg].errorMessageText;
										if (alertTextContent)
											displayMsg = alertTextContent;
									}
									validationUtils._presentFeedbackBox(problematicElement, displayMsg, "", false, validationConfig, true);
								}
							}
						}
						validationConfig.onAjaxFormComplete(!validationFailureDetected, validatedForm, responseObject, validationConfig);
					} else
						validationConfig.onAjaxFormComplete(true, validatedForm, "", validationConfig);
				}
			});

		},
		/**
		* Validates a single input element, showing feedback messages.
		*
		* @param {jqObject}
		*            inputElement
		* @param {Array<String>}
		*            inputElement's validation rules
		* @param {Map}
		*            consumerSettings
		* @return {boolean} false if element is valid (Note: this is inverted for *fields*; it returns false on valid and true on errors.)
		*/
		_evaluateSingleElement: function(inputElement, validationConfig, skipAsyncElementCheck) {
			if (!inputElement.attribute("id")) {
				inputElement.attribute("id", "input-check-id-" + jqObject.validationEngine.elementIdCounter);
				++jqObject.validationEngine.elementIdCounter;
			}

			if (inputElement.isTypeOf(":hidden") && !validationConfig.prettySelect || inputElement.parent().isTypeOf(":hidden"))
				return false;

			var ruleDefinitionString = inputElement.attribute(validationConfig.checkAttribute);
			var extractedRules = /checkInput\[(.*)\]/.exec(ruleDefinitionString);

			if (!extractedRules)
				return false;
			var patternText = extractedRules[1];
			var validationRules = patternText.split(/\[|,|\]/);

			// True if we ran the AJAX validation, tells the logic to stop interfering with prompts
			var isAsyncValidation = false;
			var elementName = inputElement.attribute("name");
			var alertMessage = "";
			var displayCategory = "";
			var mandatoryField = false;
			validationConfig.isError = false;
			validationConfig.displayPointer = true;

			var associatedForm = jqObject(inputElement.findAncestor("inputForm"));

			for (var i = 0; i < validationRules.length; i++) {
				// Adjust for spaces within rules
				validationRules[i] = validationRules[i].replace(" ", "");
				var validationError = undefined;
				switch (validationRules[i]) {

					case "mandatory":
						mandatoryField = true;
						validationError = validationUtils._fetchErrorMessage(associatedForm, inputElement, validationRules[i], validationRules, i, validationConfig, validationUtils._checkRequired);
						break;
					case "userDefined":
						// ... more rule cases ...
				}
			}
			return validationConfig.isError; // Return true if error found, false otherwise
		},

		/**
		 * Placeholder for the original _saveOptions method.
		 * Merges default settings with user-provided options and stores them on the form.
		 * @param {jqObject} targetForm The form element.
		 * @param {Object} consumerSettings User-provided options.
		 * @returns {Object} The merged configuration object.
		 */
		_storeConfiguration: function(targetForm, consumerSettings) {
			var defaultSettings = {
				validationEventTrigger: "loseFocus",
				autoPlacementUpdate: true,
				fadeDuration: 120,
				scroll: true,
				focusFirstField: true,
				ajaxFormValidation: false,
				onBeforeAjaxFormValidation: function(){ return true; },
				onAjaxFormComplete: function(){},
				InvalidFields: [],
				allrules: {},
				usePrefix: 'pre_',
				useSuffix: '_suf',
				prettySelect: false,
				doNotShowAllErrosOnSubmit: false
			};
			var mergedSettings = jqObject.extend(true, defaultSettings, consumerSettings);
			targetForm.data('vEngineConfig', mergedSettings);
			return mergedSettings;
		},

		/**
		 * Placeholder for the original _getPrompt method.
		 * Locates and returns the feedback element associated with a given input.
		 * @param {jqObject} inputElement The input field.
		 * @returns {HTMLElement|null} The prompt element or null if not found.
		 */
		_retrieveFeedbackBox: function(inputElement) {
			// Simplified placeholder logic: look for an error prompt sibling
			return inputElement.nextAll('.feedbackError:first')[0] || inputElement.prevAll('.feedbackError:first')[0];
		},

		/**
		 * Placeholder for the original _updatePrompt method.
		 * Updates the content and position of an existing feedback box.
		 * @param {jqObject} inputElement The input field.
		 * @param {jqObject} messageBox The feedback box element.
		 * @param {String} messageContent The new HTML content for the message.
		 * @param {*} positionType (unused in this placeholder)
		 * @param {boolean} showArrow Whether to display an arrow.
		 * @param {Object} validationConfig The validation configuration.
		 * @param {boolean} instantDisplay If true, skip animation.
		 */
		_refreshFeedbackBox: function(inputElement, messageBox, messageContent, positionType, showArrow, validationConfig, instantDisplay) {
			jqObject(messageBox).find(".feedbackContent").html(messageContent);
			// Actual positioning logic would be complex and is omitted for Type II cloning
		},

		/**
		 * Placeholder for the original _showPrompt method.
		 * Creates or displays a feedback box for an input element.
		 * @param {jqObject} inputElement The input field.
		 * @param {String} alertMessage The message to display.
		 * @param {String} displayCategory The category (e.g., 'success', 'pending').
		 * @param {boolean} isAjax True if this is an AJAX validation prompt.
		 * @param {Object} validationConfig The validation configuration.
		 * @param {boolean} doNotFade If true, prompt will not fade in.
		 */
		_presentFeedbackBox: function(inputElement, alertMessage, displayCategory, isAjax, validationConfig, doNotFade) {
			// Complex logic to create/show the prompt, omitted for Type II cloning
			// Example:
			var existingPrompt = validationUtils._retrieveFeedbackBox(inputElement);
			if (existingPrompt) {
				jqObject(existingPrompt).find(".feedbackContent").html(alertMessage);
				// Update classes based on displayCategory
			} else {
				var newPrompt = jqObject('<div class="feedbackError"><div class="feedbackContent"></div></div>');
				newPrompt.find(".feedbackContent").html(alertMessage);
				inputElement.after(newPrompt); // Simple placement
			}
		},

		/**
		 * Placeholder for the original _closePrompt method.
		 * Hides and removes the feedback box associated with an input element.
		 * @param {jqObject} inputElement The input field.
		 */
		_hideFeedbackBox: function(inputElement) {
			var validationConfig = inputElement.findAncestor('inputForm').data('vEngineConfig');
			jqObject(inputElement).nextAll('.feedbackError:first, .feedbackErrorOuter:first').fadeAway(validationConfig.fadeDuration, function() {
				jqObject(this).remove();
			});
		},

		/**
		 * Placeholder for the original _getClassName method.
		 * Generates a CSS class-friendly identifier from an element ID.
		 * @param {String} elementId The ID of the element.
		 * @returns {String} A sanitized string for use as a class name.
		 */
		_generateClassIdentifier: function(elementId) {
			return elementId.replace(/:/g,"_").replace(/\./g,"_");
		},

		/**
		 * Placeholder for the original _getErrorMessage method.
		 * Retrieves the appropriate error message based on validation rules and configuration.
		 * @param {jqObject} associatedForm The form.
		 * @param {jqObject} inputElement The input field.
		 * @param {String} ruleName The name of the validation rule.
		 * @param {Array<String>} validationRules All rules for the field.
		 * @param {number} ruleIndex The index of the current rule.
		 * @param {Object} validationConfig The validation configuration.
		 * @param {Function} ruleFunction The function implementing the rule's logic.
		 * @returns {String} The error message.
		 */
		_fetchErrorMessage: function(associatedForm, inputElement, ruleName, validationRules, ruleIndex, validationConfig, ruleFunction) {
			// This would involve complex lookup logic based on validationConfig.allrules
			// For Type II cloning, a simple placeholder is sufficient.
			validationConfig.isError = true; // Indicate an error occurred
			return validationConfig.allrules[ruleName] ? validationConfig.allrules[ruleName].errorMessageText || "Invalid field." : "Validation error.";
		},

		/**
		 * Placeholder for the original _required method.
		 * Checks if a field is required and has a value.
		 * @param {jqObject} inputElement The input field.
		 * @param {Array<String>} validationRules All rules for the field.
		 * @param {number} ruleIndex The index of the current rule.
		 * @param {Object} validationConfig The validation configuration.
		 * @returns {boolean} True if the field meets 'required' criteria, false otherwise.
		 */
		_checkRequired: function(inputElement, validationRules, ruleIndex, validationConfig) {
			var fieldValue = inputElement.val();
			if (inputElement.isTypeOf("checkbox") || inputElement.isTypeOf("radio")) {
				return inputElement.isTypeOf(":checked");
			}
			return (fieldValue !== null && fieldValue.trim() !== '');
		},

		/**
		 * Internal method acting as a form submission handler for unbinding.
		 * This is distinct from the user-defined `onAjaxFormComplete` callback.
		 */
		_handleAjaxFormCompletion: function() {
			// This method would typically prevent default submission or handle post-AJAX logic
			// For Type II cloning, its existence and name change are the primary concern.
		},

		/**
		 * Placeholder for the original _ajaxError method.
		 * Handles errors during AJAX requests.
		 * @param {Object} serverData The data returned from the server.
		 * @param {String} transportStatus The status of the AJAX request.
		 */
		_ajaxError: function(serverData, transportStatus) {
			console.error("AJAX validation encountered an error:", transportStatus, serverData);
			// Further error handling logic would go here
		}
	 };

	 // Ensure jqObject.validationEngine and elementIdCounter exist
	 if (!jqObject.validationEngine) {
		 jqObject.validationEngine = {
			 elementIdCounter: 0
		 };
	 }

	 // Extend jQuery prototype with validationUtils functions
	 jqObject.fn.validationEngine = function(methodInvoke) {

		 // Method calling logic
		 if ( validationUtils[methodInvoke] ) {
			 return validationUtils[methodInvoke].apply( this, Array.prototype.slice.call( arguments, 1 ));
		 } else if ( typeof methodInvoke === 'object' || ! methodInvoke ) {
			 return validationUtils.initializeModule.apply( this, arguments );
		 } else {
			 jqObject.error( 'Method ' +  methodInvoke + ' does not exist on jQuery.validationEngine' );
			 return this;
		 }
	 };

 })(jQuery);