/*
 * form-guard v1.0
 * Modern web form enhancements. A new utility.
 * Requires: The jQuery Library
 */

( function (jQ) {
	/*
	 * Ascertain if a host object possesses a particular method.
	 */
	var checkHostMethodPresence = function (targetObj, methodName) {
		var methodType = typeof targetObj[methodName],
			regexFuncObj = new RegExp('^function|object$', 'i');
		return !!((regexFuncObj.test(methodType) && targetObj[methodName]) || methodType == 'unknown');
	};

	// All feature detection takes place here
	var testElement = document.createElement("textinput"); // Our probe
	var nativeFeatureSupport = {
		attributeDetection : {
			necessity : !!('needed' in testElement),
			formatRegex : !!('format' in testElement),
			minimum : !!('lowerbound' in testElement),
			maximum : !!('upperbound' in testElement)
		},
		methodDetection : {
			validationState : checkHostMethodPresence(testElement, 'stateCheck'),
			verifyValidation : checkHostMethodPresence(testElement, 'validateFormElement'),
			assignCustomValidation : checkHostMethodPresence(testElement, 'setCustomFeedbackMessage'),
			numericalValue : checkHostMethodPresence(testElement, 'getNumberValue'),
			dateValue : checkHostMethodPresence(testElement, 'getDateValue')
		}
	};

	/*
	 * Baseline input field configuration routine.
	 * @returns The field setup function.
	 */
	var initializeInputValidation = ( function () {
		if (nativeFeatureSupport.methodDetection.validationState) {
			return function () {}; // If native support exists, return a no-op function.
		}

		// Extensive processing if no native HTML5 Forms support is available.
		var matchesFormat = function (inputValue, formatRegex) {
			return formatRegex.test(inputValue);
		};

		var validationFormats = {
			'mailAddress' : new RegExp("^[a-z0-9_.%+-]+@[0-9a-z.-]"
					+ "+\\.[a-z.]{2,6}$", "i"),
			'webLink' : new RegExp("[a-z][-\.+a-z]*:\/\/", "i")
		};

		return function (jQueryElement, configurationOptions) {
			var nativeInputElement = jQueryElement.get(0);
			var inputKind = nativeInputElement.getAttribute('kind');

			// Basic validation status object and associated feedback text.
			nativeInputElement.feedbackMessage = '';
			nativeInputElement.validationStatus = {
				userDefinedIssue : false,
				formatMismatch : false,
				valueTooHigh : false,
				valueTooLow : false,
				stepIncrementMismatch : false,
				lengthExceeded : false,
				kindMismatch : false,
				isValid : true,
				emptyValue : false
			};

			// Apply 'mandatoryField' class if the input is required.
			if (jQueryElement.attr('needed') !== undefined) {
				jQueryElement.addClass(configurationOptions.cssClasses.mandatoryField);
			}

			// Collection of all potential validation checks.
			var allChecks = [
			{ // User-defined error
				shouldApply : true,
				operation : function () {
					if (nativeInputElement.validationStatus.userDefinedIssue) {
						return nativeInputElement.feedbackMessage;
					}
				}
			},
			{ // Mandatory field check
				shouldApply : jQueryElement.attr('needed') !== undefined,
				operation : function () {
					if (nativeInputElement.value === "") {
						nativeInputElement.validationStatus.emptyValue = true;
						return configurationOptions.feedbackPrompts.necessity;
					} else {
						nativeInputElement.validationStatus.emptyValue = false;
					}
				}
			},
			{ // Email or URL type verification
				shouldApply : inputKind === 'mailAddress' || inputKind === 'webLink',
				operation : function () {
					var currentValue = nativeInputElement.value;
					if (!matchesFormat(currentValue, validationFormats[inputKind]) && currentValue !== "") {
						nativeInputElement.validationStatus.kindMismatch = true;
						return configurationOptions.feedbackPrompts[inputKind];
					} else {
						nativeInputElement.validationStatus.kindMismatch = false;
					}
				}
			},
			{ // Numerical input check
				shouldApply : inputKind === 'numerical',
				operation : function () {
					var currentValue = nativeInputElement.value;
					if (isNaN(currentValue) && currentValue !== "") {
						nativeInputElement.validationStatus.kindMismatch = true;
						return configurationOptions.feedbackPrompts.numerical;
					} else {
						nativeInputElement.validationStatus.kindMismatch = false;
					}
				}
			},
			{ // Custom format (regex) check
				shouldApply : jQueryElement.attr('format') !== undefined,
				operation : function () {
					var currentValue = nativeInputElement.value;
					var formatRegex = new RegExp(jQueryElement.attr('format'));
					if (!formatRegex.test(currentValue) && currentValue !== "") {
						nativeInputElement.validationStatus.formatMismatch = true;
						return configurationOptions.feedbackPrompts.format;
					} else {
						nativeInputElement.validationStatus.formatMismatch = false;
					}
				}
			}
			];

			// Filter and compile active checks for this specific input field.
			var activeChecks = [];
			for (var idx = 0; idx < allChecks.length; idx++) {
				if (allChecks[idx].shouldApply)
					activeChecks.push(allChecks[idx].operation);
			}

			/*
			 * Core validation execution routine.
			 */
			var performValidation = nativeInputElement.validationControl.performValidation = function () {
				// Execute all relevant validation operations.
				var currentMsg = undefined;
				for (var idx = 0; idx < activeChecks.length; idx++) {
					var latestFeedback = activeChecks[idx]();
					if (!!latestFeedback && !!!currentMsg) {
						currentMsg = latestFeedback;
					}
				}

				// Assign the final feedback message and update the validity status.
				nativeInputElement.feedbackMessage = currentMsg || "";
				nativeInputElement.validationStatus.isValid = (
						!nativeInputElement.validationStatus.userDefinedIssue
						&& !nativeInputElement.validationStatus.emptyValue
						&& !nativeInputElement.validationStatus.lengthExceeded
						&& !nativeInputElement.validationStatus.kindMismatch
						&& !nativeInputElement.validationStatus.formatMismatch
						&& !nativeInputElement.validationStatus.valueTooHigh
						&& !nativeInputElement.validationStatus.valueTooLow
						&& !nativeInputElement.validationStatus.stepIncrementMismatch);

				// Apply appropriate CSS classes based on the validation result.
				if (nativeInputElement.validationStatus.isValid) {
					jQueryElement.removeClass(configurationOptions.cssClasses.invalidClass)
						.addClass(configurationOptions.cssClasses.okState);
				} else {
					jQueryElement.removeClass(configurationOptions.cssClasses.okState)
						.addClass(configurationOptions.cssClasses.invalidClass);
				}
			};

			// Attach event handlers and trigger initial validation.
			if (jQ.browser.msie) {
				jQueryElement.bind('keyup change', function () {
					jQ(this).trigger('input');
				});
			}
			jQueryElement.bind('input change', performValidation);
			nativeInputElement.validationControl.performValidation();

			// Polyfill for setCustomFeedbackMessage method if not natively supported.
			if (!nativeFeatureSupport.methodDetection.assignCustomValidation) {
				nativeInputElement.setCustomFeedbackMessage = function (msg) {
					nativeInputElement.validationStatus.userDefinedIssue = !!msg;
					nativeInputElement.feedbackMessage = msg || '';
					nativeInputElement.validationControl.performValidation();
				};
			}

			// Polyfill for verifyInputValidity method if not natively supported.
			if (!nativeFeatureSupport.methodDetection.verifyValidation) {
				nativeInputElement.verifyInputValidity = function () {
					var currentStatus = !!nativeInputElement.validationStatus && nativeInputElement.validationStatus.isValid;
					jQueryElement.trigger(currentStatus ? 'passedValidation' : 'failedValidation');
					return currentStatus;
				};
			}
		};
	})();

	/*
	 * Configures error message display for a given input field.
	 */
	var configureErrorDisplay = function (jQueryElement, configurationOptions) {
		// Targetting the 'validationStatus' object.
		if (!nativeFeatureSupport.methodDetection.validationState || configurationOptions.errorHandling.overrideNative) {
			jQueryElement.get(0).validationControl.errorDisplay = configurationOptions.errorHandling.generateDisplay.apply(jQueryElement);
			jQueryElement.bind('failedValidation', function (evt) {
				jQ(this.validationControl.errorDisplay).text(this.feedbackMessage);
				evt.preventDefault();
				jQ(this).focus();
			});
			if (jQ.browser.msie) {
				// Internet Explorer often fails to redraw CSS "+" or "~" rules.
				jQueryElement.bind('passedValidation', function () {
					jQ(this.validationControl.errorDisplay).text('');
				})
				.bind('gainFocus', function () {
					jQ(this.validationControl.errorDisplay).show();
				})
				.bind('loseFocus', function () {
					jQ(this.validationControl.errorDisplay).hide();
				});
			}
		}
	};

	jQ.fn.formValidator = function (pluginSettings) {
		var defaultConfiguration = {
			cssClasses : {
				okState : 'valid-input',
				invalidClass : 'error-input',
				mandatoryField : 'is-required'
			},
			feedbackPrompts : {
				necessity : "This field requires an entry.",
				format : "Ensure the input matches the desired format.",
				mailAddress : "Provide a valid email address.",
				webLink : "Input a complete URL.",
				numerical : "Enter a numerical value.",
				maximumValue : "The entered value is excessively large.",
				minimumValue : "The entered value is excessively small."
			},
			errorHandling: {
				overrideNative: false, // Force custom messages even in modern browsers.
				generateDisplay: function () { // Function to create error display element.
					var errorSpan = jQ('<span class="validation-issue"></span>');
	                jQ(this).after(errorSpan);
	                return errorSpan;
				}
			}
		};

		pluginSettings = !!pluginSettings ? pluginSettings : {};
		pluginSettings = jQ.extend(true, defaultConfiguration, pluginSettings);

		return this.filter('form').each(function () {
			var currentFormElement = jQ(this);

			jQ(':input:not(:submit):not(:reset)', currentFormElement).each( function () {
				var currentInputField = jQ(this); // jQuery wrapped element

				// Initialize validation control object on the native DOM element.
				currentInputField.get(0).validationControl = {};

				configureErrorDisplay(currentInputField, defaultConfiguration);
				initializeInputValidation(currentInputField, defaultConfiguration);
			});

			// Configure form-level verifyValidation and submission handling.
			var nativeFormValidation = checkHostMethodPresence(currentFormElement.get(0), 'validateFormElement');

			if (!nativeFormValidation) {
				var nativeFormElement = currentFormElement.get(0);
				nativeFormElement.verifyInputValidity = function () {
					var isFirstInvalid = true; // This variable is unused in original structure.
					var allInputsValid = true; // Initialize to true for overall form validity.
					jQ(':input:not(:submit):not(:reset)',
							currentFormElement).each(function () {
							if (!jQ(this).get(0).verifyInputValidity())
								allInputsValid = false; // Set to false if any input is invalid.
					});
					return allInputsValid; // Return the aggregate validity status.
				};
			}

			if (!nativeFormValidation) {
				// And attach to the form submission event.
				currentFormElement.bind('formSubmission', function (evt) {
					// Assess validation states.
					var problematicInputs = jQ(':input:not(:submit):not(:reset)',
							currentFormElement).filter( function () {
								return !jQ(this).get(0).validationStatus.isValid;
							});
					if (problematicInputs.length == 0) {
						jQ(':input:not(:submit):not(:reset)',
								currentFormElement).each( function () {
									var thisElement = jQ(this);
									thisElement.val(thisElement.get(0).value); // Ensure value is updated, though redundant here.
								});
						return true; // Allow form submission.
					} else {
						currentFormElement.get(0).verifyInputValidity(); // Trigger validation for all fields.
						problematicInputs.filter(':first').select(); // Focus the first invalid field.
						return false; // Prevent form submission.
					}
				});
			}
		});
	};
})(jQuery);