/*
 * Validation Utility for jQuery - Enhanced and Refactored
 *
 * This code is a modified version, designed for clarity and robustness.
 * NO EXPLICIT LICENSES OR COPYRIGHTS. Use as you see fit.
 *
 * Origin: Inspired by flowplayer.org/tools/form/validator/
 * Date:    2023-10-27
 */
/*jslint evil: true */
(function(jQuery) {

	// Ensure jQuery is available
	if (typeof jQuery === 'undefined') {
		console.error("Validation Utility requires jQuery to be loaded.");
		return;
	}

	jQuery.tools = jQuery.tools || {}; // Ensure jQuery.tools namespace exists

	// Internal regular expressions for validation rules
	const typePattern = /\[type=([a-z]+)\]/;
	const numberPattern = /^-?[0-9]*(\.[0-9]+)?$/;
	const emailPattern = /^([a-z0-9_\.\-\+]+)@([\da-z\.\-]+)\.([a-z\.]{2,6})$/i;
	const urlPattern = /^(https?:\/\/)?([\da-z\.\-]+)\.([a-z\.]{2,6})([\/\w \.\-]*)*\/?$/i;

	let validationEngine; // Main validation engine instance

	// Core validation engine configuration and API
	validationEngine = jQuery.tools.validator = {

		// Default configuration settings
		options: {
			groupedErrors: false, 					// Display all error messages simultaneously within a container
			feedbackEffect: 'default',				// Visual feedback effect for error messages. 'default' is built-in.
			errorCssClass: 'validation-error',		// CSS class for input fields with validation errors

			// Event triggers for validation checks
			inputValidationEvent: null,				// e.g., 'change', 'blur', 'keyup', or null to disable
			errorInputValidationEvent: 'keyup',		// Validation event for fields already in error state
			formSubmissionEvent: 'submit',			// Form validation trigger event, e.g., 'submit', or null to disable

			defaultLanguage: 'en',					// Default language for error messages
			messageTemplate: '<div/>',				// HTML template for error message container
			customMessageAttribute: 'data-validation-message', // Attribute for overriding default error messages
			messageCssClass: 'validation-message',	// CSS class for the error message element
			messageOffset: [0, 0],					// Pixel offset for message positioning [top, left]
			messagePlacement: 'center right',		// Position relative to the input field
			singleFieldError: false, 				// Stop validation on first error per field (not global)
			animationSpeed: 'normal'				// Speed for message fade-in/out
		},

		// Standard error messages organized by rule and language
		localizationData: {
			"*": { en: "Please correct the value provided." }
		},

		/**
		 * Registers localized messages for validation rules.
		 * @param {string} languageCode - The language code (e.g., 'en', 'fr').
		 * @param {object} messagesObject - Key-value pairs of rule-id to message string.
		 */
		registerLocale: function(languageCode, messagesObject) {
			jQuery.each(messagesObject, function(ruleKey, messageText) {
				validationEngine.localizationData[ruleKey] = validationEngine.localizationData[ruleKey] || {};
				validationEngine.localizationData[ruleKey][languageCode] = messageText;
			});
		},

		/**
		 * Extends existing localized messages for a specific rule.
		 * @param {string} ruleKey - The identifier for the validation rule.
		 * @param {object} languageMessages - Key-value pairs of languageCode to message string.
		 */
		extendLocale: function(ruleKey, languageMessages) {
			validationEngine.localizationData[ruleKey] = validationEngine.localizationData[ruleKey] || {};
			jQuery.extend(validationEngine.localizationData[ruleKey], languageMessages);
		},

		/**
		 * Defines a new validation rule.
		 * @param {string|object} ruleIdentifier - Selector string (e.g., ":email", "[required]") or an object with `key`.
		 * @param {string|object|function} ruleMessage - Default message, a language map, or the validation function.
		 * @param {function} [validationLogic] - The actual validation function (el, value) => boolean|array.
		 */
		defineRule: function(ruleIdentifier, ruleMessage, validationLogic) {

			// Handle overloaded arguments: ruleMessage can be the function
			if (jQuery.isFunction(ruleMessage)) {
				validationLogic = ruleMessage;
				ruleMessage = undefined; // Clear for later processing
			}

			// If a message is provided, register it
			if (ruleMessage !== undefined) {
				if (typeof ruleMessage === 'string') {
					ruleMessage = {en: ruleMessage};
				}
				this.localizationData[ruleIdentifier.key || ruleIdentifier] = ruleMessage;
			}

			// Special handling for "[type=xxx]" selectors not fully supported by jQuery's filter/is
			const typeMatch = typePattern.exec(ruleIdentifier);
			if (typeMatch) {
				ruleIdentifier = createTypeMatcher(typeMatch[1]);
			}

			// Add the new rule to the registry
			validationRulesRegistry.push([ruleIdentifier, validationLogic]);
		},

		/**
		 * Registers a new feedback effect for error display.
		 * @param {string} effectName - Name of the effect.
		 * @param {function} showFn - Function to display errors (errorList, event).
		 * @param {function} hideFn - Function to hide errors (inputElements, event).
		 */
		registerFeedbackEffect: function(effectName, showFn, hideFn) {
			feedbackEffects[effectName] = [showFn, hideFn];
		}
	};

	/* --- Helper Functions --- */

	/**
	 * Calculates the absolute position for an error message relative to its input.
	 * @param {jQuery} triggerElement - The input element.
	 * @param {jQuery} messageElement - The error message container.
	 * @param {object} configSettings - The current validator configuration.
	 * @returns {{top: number, left: number}} - Absolute top and left coordinates.
	 */
	function calculateMessagePlacement(triggerElement, messageElement, configSettings) {

		// Get current position of the input field
		let elementTop = triggerElement.offset().top;
		let elementLeft = triggerElement.offset().left;

		// Parse desired placement (e.g., "center right")
		const positionParts = configSettings.messagePlacement.split(/,?\s+/);
		const verticalAlign = positionParts[0];
		const horizontalAlign = positionParts[1];

		// Apply base offset and position relative to input's right edge
		elementTop -= messageElement.outerHeight() - configSettings.messageOffset[0];
		elementLeft += triggerElement.outerWidth() + configSettings.messageOffset[1];

		// Adjust vertical position
		const totalHeight = messageElement.outerHeight() + triggerElement.outerHeight();
		if (verticalAlign === 'center') { elementTop += totalHeight / 2; }
		if (verticalAlign === 'bottom') { elementTop += totalHeight; }

		// Adjust horizontal position
		const triggerWidth = triggerElement.outerWidth();
		if (horizontalAlign === 'center') { elementLeft -= (triggerWidth + messageElement.outerWidth()) / 2; }
		if (horizontalAlign === 'left') { elementLeft -= triggerWidth; }

		return { top: elementTop, left: elementLeft };
	}

	/**
	 * Creates a jQuery selector function for attributes like `[type=text]`.
	 * This is a workaround for older jQuery versions or specific selector behaviors.
	 * @param {string} typeValue - The value of the 'type' attribute.
	 * @returns {function} A function suitable for jQuery filter/is methods.
	 */
	function createTypeMatcher(typeValue) {
		function typeFilterFn() {
			return this.getAttribute("type") === typeValue;
		}
		typeFilterFn.key = "[type=" + typeValue + "]"; // Store the original key for message lookup
		return typeFilterFn;
	}

	/* --- Global Rule & Effect Registries --- */
	const validationRulesRegistry = [];
	const feedbackEffects = {

		'default': [

			// Function to display errors
			function(problematicInputs) {
				const currentSettings = this.getConf();

				// Iterate through each input that has errors
				jQuery.each(problematicInputs, function(idx, errorDetails) {

					const affectedInput = errorDetails.input;
					affectedInput.addClass(currentSettings.errorCssClass);

					// Retrieve or create the error message container for this input
					let errorDisplayElement = affectedInput.data("validation.msg.container");

					if (!errorDisplayElement || !errorDisplayElement.parent().length) { // Check if it exists and is still in DOM
						errorDisplayElement = jQuery(currentSettings.messageTemplate)
							.addClass(currentSettings.messageCssClass)
							.appendTo(document.body); // Append to body initially
						affectedInput.data("validation.msg.container", errorDisplayElement);
					}

					// Clear previous messages and prepare for new ones
					errorDisplayElement.css({visibility: 'hidden'}).empty();

					// Populate the message container with individual error messages
					jQuery.each(errorDetails.messages, function(msgIdx, messageText) {
						jQuery("<span/>").html(messageText).appendTo(errorDisplayElement);
					});

					// Adjust width if the message container is taking full parent width
					if (errorDisplayElement.outerWidth() === errorDisplayElement.parent().width()) {
						errorDisplayElement.add(errorDisplayElement.find("p")).css({display: 'inline-block'});
					}

					// Position the message relative to the input field
					const position = calculateMessagePlacement(affectedInput, errorDisplayElement, currentSettings);

					errorDisplayElement.css({
						visibility: 'visible',
						position: 'absolute',
						top: position.top,
						left: position.left
					}).fadeIn(currentSettings.animationSpeed);
				});
			},

			// Function to hide errors
			function(validatedElements) {
				const currentSettings = this.getConf();
				validatedElements.removeClass(currentSettings.errorCssClass).each(function() {
					const errorDisplayElement = jQuery(this).data("validation.msg.container");
					if (errorDisplayElement) {
						errorDisplayElement.remove(); // Remove the element entirely
						jQuery(this).removeData("validation.msg.container"); // Clear the data
					}
				});
			}
		]
	};

	/* --- jQuery Extensions for Special Selectors --- */
	jQuery.each("email,url,number".split(","), function(idx, key) {
		jQuery.expr[':'][key] = function(element) {
			return element.getAttribute("type") === key;
		};
	});

	/*
		jQuery plugin to trigger/bind custom 'oninvalid' event.
		Usage: jQuery("input:eq(2)").onValidationFail(function() { ... });
	*/
	jQuery.fn.onValidationFail = function(eventHandler) {
		return this[eventHandler ? "bind" : "trigger"]("validation.fail", eventHandler);
	};

	/* --- Built-in HTML5-inspired Validators --- */

	validationEngine.defineRule(":email", "Please provide a valid email address.", function(element, value) {
		return !value || emailPattern.test(value);
	});

	validationEngine.defineRule(":url", "Please provide a valid URL.", function(element, value) {
		return !value || urlPattern.test(value);
	});

	validationEngine.defineRule(":number", "Please enter a numerical value.", function(element, value) {
		return numberPattern.test(value);
	});

	validationEngine.defineRule("[max]", "Please enter a value not greater than $1.", function(element, value) {
		// Skip for date inputs if dateinput tool is present (e.g., jQuery Tools Dateinput)
		if (jQuery.tools.dateinput && element.is(":date")) { return true; }

		const maxValue = element.attr("max");
		return parseFloat(value) <= parseFloat(maxValue) ? true : [maxValue];
	});

	validationEngine.defineRule("[min]", "Please enter a value not less than $1.", function(element, value) {
		// Skip for date inputs if dateinput tool is present
		if (jQuery.tools.dateinput && element.is(":date")) { return true; }

		const minValue = element.attr("min");
		return parseFloat(value) >= parseFloat(minValue) ? true : [minValue];
	});

	validationEngine.defineRule("[required]", "This field is mandatory. Please complete it.", function(element, value) {
		if (element.is(":checkbox")) { return element.is(":checked"); }
		return !!value;
	});

	validationEngine.defineRule("[pattern]", function(element) {
		const regex = new RegExp("^" + element.attr("pattern") + "$");
		return regex.test(element.val());
	});

	/**
	 * Constructor for the FormValidationHandler.
	 * Manages validation for a set of input elements within a form.
	 * @param {jQuery} inputElements - The jQuery collection of input fields to validate.
	 * @param {jQuery} targetForm - The jQuery object representing the parent form.
	 * @param {object} currentOptions - Configuration options for this validator instance.
	 */
	function FormValidationHandler(inputElements, targetForm, currentOptions) {

		const thisManager = this;
		const eventEmitter = targetForm.add(thisManager); // For triggering custom events

		// Filter out non-input elements that shouldn't be validated
		const relevantInputs = inputElements.not(":button, :image, :reset, :submit");

		if (!relevantInputs.length) {
			// console.warn("FormValidationHandler initialized with no relevant inputs. Validation might not occur.");
		}

		/**
		 * Helper to format and push an error message into an array.
		 * @param {Array<string>} messageCollection - Array to push messages into.
		 * @param {string|object} ruleMatchIdentifier - The identifier of the failed rule.
		 * @param {boolean|Array<string>} validationResult - The return value from the validator function.
		 * @param {object} settings - Current validator settings.
		 */
		function compileErrorMessage(messageCollection, ruleMatchIdentifier, validationResult, settings) {

			// If grouped errors are disabled and a message already exists, do not add more for this field
			if (!settings.groupedErrors && messageCollection.length) { return; }

			let formattedMessage;
			let ruleKey = ruleMatchIdentifier.key || ruleMatchIdentifier;

			if (validationResult === false || jQuery.isArray(validationResult)) {
				// Retrieve message from localization data
				let baseMessage = validationEngine.localizationData[ruleKey] || validationEngine.localizationData["*"];
				formattedMessage = baseMessage[settings.defaultLanguage] || validationEngine.localizationData["*"].en;

				// Perform substitutions if the result is an array
				if (jQuery.isArray(validationResult)) {
					const placeholders = formattedMessage.match(/\$\d/g);
					if (placeholders) {
						jQuery.each(placeholders, function(idx) {
							formattedMessage = formattedMessage.replace(this, validationResult[idx]);
						});
					}
				}
			} else {
				// Direct message returned by validator (e.g., object with language keys)
				formattedMessage = validationResult[settings.defaultLanguage] || validationResult;
			}
			messageCollection.push(formattedMessage);
		}

		// Public API methods for the FormValidationHandler instance
		jQuery.extend(thisManager, {

			getConf: function() {
				return currentOptions;
			},

			getForm: function() {
				return targetForm;
			},

			getInputs: function() {
				return relevantInputs;
			},

			/**
			 * Manually invalidates specific fields or triggers a global invalidation.
			 * @param {object|Array<object>} errorMapOrList - Either {fieldName: 'message'} or [{input: jQuery, messages: ['msg']}]
			 * @param {jQuery.Event} [triggerEvent] - The event object that initiated the invalidation.
			 * @returns {FormValidationHandler} The current instance.
			 */
			signalInvalidation: function(errorMapOrList, triggerEvent) {

				let processedErrors = [];
				if (!jQuery.isArray(errorMapOrList)) { // Manual errors provided as {name: msg}
					jQuery.each(errorMapOrList, function(fieldName, messageValue) {
						const matchingInput = relevantInputs.filter("[name='" + fieldName + "']");
						if (matchingInput.length) {
							matchingInput.onValidationFail([messageValue]); // Trigger custom fail event
							processedErrors.push({ input: matchingInput, messages: [messageValue] });
						}
					});
					errorMapOrList = processedErrors; // Convert to standard error list format
					triggerEvent = triggerEvent || jQuery.Event(); // Ensure an event object exists
				}

				triggerEvent.type = "onFailure"; // Custom event type
				eventEmitter.trigger(triggerEvent, [errorMapOrList]);

				// If no default prevention, call the registered feedback effect
				if (!triggerEvent.isDefaultPrevented()) {
					const activeEffect = feedbackEffects[currentOptions.feedbackEffect];
					if (activeEffect && activeEffect[0]) {
						activeEffect[0].call(thisManager, errorMapOrList, triggerEvent);
					} else {
						console.warn(`Validation: Feedback effect "${currentOptions.feedbackEffect}" not found.`);
					}
				}
				return thisManager;
			},

			/**
			 * Resets the validation state for specified (or all) input elements.
			 * Removes error classes, messages, and unbinds error-specific events.
			 * @param {jQuery} [elementsToReset] - Specific elements to reset; defaults to all managed inputs.
			 * @returns {FormValidationHandler} The current instance.
			 */
			resetValidationState: function(elementsToReset) {
				elementsToReset = elementsToReset || relevantInputs;
				elementsToReset.removeClass(currentOptions.errorCssClass).each(function() {
					const inputElement = jQuery(this);
					const msgElement = inputElement.data("validation.msg.container");
					if (msgElement) {
						msgElement.remove(); // Remove message element from DOM
						inputElement.removeData("validation.msg.container"); // Clear associated data
					}
				}).unbind(currentOptions.errorInputValidationEvent || ''); // Unbind error state event
				return thisManager;
			},

			/**
			 * Destroys this validator instance, unbinding all events.
			 * @returns {FormValidationHandler} The current instance.
			 */
			destroy: function() {
				targetForm.unbind(currentOptions.formSubmissionEvent).unbind("reset.validation");
				relevantInputs.unbind(currentOptions.inputValidationEvent || '').unbind("change.validation");
				return thisManager.resetValidationState(); // Also resets inputs
			},

			/**
			 * Performs validation on the specified (or all) input elements.
			 * @param {jQuery} [elementsToCheck] - Specific elements to validate; defaults to all managed inputs.
			 * @param {jQuery.Event} [triggerEvent] - The event object that initiated validation.
			 * @returns {boolean} True if all elements are valid, false otherwise.
			 */
			performValidation: function(elementsToCheck, triggerEvent) {

				elementsToCheck = elementsToCheck || relevantInputs;
				elementsToCheck = elementsToCheck.not(":disabled"); // Do not validate disabled fields

				if (!elementsToCheck.length) { return true; } // Nothing to validate, so it's "valid"

				triggerEvent = triggerEvent || jQuery.Event();

				// Trigger onBeforeValidation event
				triggerEvent.type = "onBeforeValidation";
				eventEmitter.trigger(triggerEvent, [elementsToCheck]);
				if (triggerEvent.isDefaultPrevented()) { return triggerEvent.result; }

				const accumulatedErrors = [];
				const errorChangeEvent = currentOptions.errorInputValidationEvent + ".validation";

				// Iterate through each input element to validate
				elementsToCheck.each(function() {

					const currentInput = jQuery(this);
					let currentInputMessages = []; // Messages specific to this input

					// Unbind previous error change event handlers before re-evaluating
					currentInput.unbind(errorChangeEvent).data("validation.messages", currentInputMessages);

					// Iterate through all registered validation rules
					jQuery.each(validationRulesRegistry, function(ruleIndex, ruleEntry) {
						const ruleSelector = ruleEntry[0];
						const validationLogic = ruleEntry[1];

						// Check if the current input matches this rule's selector
						if (currentInput.filter(ruleSelector).length) {

							// Execute the validation function
							const validationResult = validationLogic.call(thisManager, currentInput, currentInput.val());

							// If validation failed for this rule
							if (validationResult !== true) {

								// Trigger onBeforeRuleFailure event
								triggerEvent.type = "onBeforeRuleFailure";
								eventEmitter.trigger(triggerEvent, [currentInput, ruleSelector]);
								if (triggerEvent.isDefaultPrevented()) { return false; } // Stop processing rules for this input

								// Check for an overridden custom message attribute
								const customMessage = currentInput.attr(currentOptions.customMessageAttribute);
								if (customMessage) {
									currentInputMessages = [customMessage]; // Overwrite any previous messages
									return false; // Stop processing further rules for this input
								} else {
									compileErrorMessage(currentInputMessages, ruleSelector, validationResult, currentOptions);
								}
							}
						}
					});

					// If this input has accumulated errors
					if (currentInputMessages.length) {
						accumulatedErrors.push({ input: currentInput, messages: currentInputMessages });

						// Trigger the custom 'onValidationFail' event for this specific input
						currentInput.onValidationFail(currentInputMessages);

						// If an error input event is configured, re-bind it to re-validate this field
						if (currentOptions.errorInputValidationEvent) {
							currentInput.bind(errorChangeEvent, function(e) {
								thisManager.performValidation(currentInput, e);
							});
						}

						// If singleFieldError is true, stop collecting errors after the first field with issues
						if (currentOptions.singleFieldError && accumulatedErrors.length) {
							return false; // Break out of the jQuery.each loop for elementsToCheck
						}
					}
				});

				// After iterating all inputs, determine the overall validation outcome

				const activeFeedbackEffect = feedbackEffects[currentOptions.feedbackEffect];
				if (!activeFeedbackEffect) {
					throw new Error(`Validation: Cannot find feedback effect "${currentOptions.feedbackEffect}".`);
				}

				// If errors were found
				if (accumulatedErrors.length) {
					thisManager.signalInvalidation(accumulatedErrors, triggerEvent); // Trigger global invalidation
					return false; // Form is invalid
				} else {
					// No errors found
					activeFeedbackEffect[1].call(thisManager, elementsToCheck, triggerEvent); // Call hide effect
					triggerEvent.type = "onValidationSuccess"; // Trigger global success event
					eventEmitter.trigger(triggerEvent, [elementsToCheck]);
					elementsToCheck.unbind(errorChangeEvent); // Unbind error state events
				}

				return true; // Form is valid
			}
		});

		// Bind custom callback functions based on configuration
		jQuery.each("onBeforeValidation,onBeforeRuleFailure,onFailure,onValidationSuccess".split(","), function(idx, eventName) {

			// If a function is provided in options, bind it directly
			if (jQuery.isFunction(currentOptions[eventName])) {
				jQuery(thisManager).bind(eventName, currentOptions[eventName]);
			}

			// Provide a public API method for binding these events
			thisManager[eventName] = function(callbackFn) {
				jQuery(thisManager).bind(eventName, callbackFn);
				return thisManager;
			};
		});

		// Handle form submission event
		if (currentOptions.formSubmissionEvent) {
			targetForm.bind(currentOptions.formSubmissionEvent, function(submitEvent) {
				if (!thisManager.performValidation(null, submitEvent)) {
					return submitEvent.preventDefault(); // Prevent form submission if validation fails
				}
			});
		}

		// Handle form reset event
		targetForm.bind("reset.validation", function() {
			thisManager.resetValidationState();
		});

		// Disable browser's native HTML5 validation to use custom one
		if (relevantInputs[0] && relevantInputs[0].validity) {
			relevantInputs.each(function() {
				this.oninvalid = function() {
					return false; // Prevent default HTML5 invalid UI
				};
			});
		}
	}

})(jQuery);