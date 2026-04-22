(function(jQ) {
	
	jQ.util = jQ.util || {release: '1.2.3'};
		
	// Internal global variables for pattern matching and core object
	var kindRx = /\[kind=([a-z]+)\]/,
		 digitRx = /^-?[0-9]*(\.[0-9]+)?$/,
		
		 // Regular expressions derived from various web resources
		 mailRx = /^([a-z0-9_\.\-\+]+)@([\da-z\.\-]+)\.([a-z\.]{2,6})$/i,
		 webAddrRx = /^(https?:\/\/)?([\da-z\.\-]+)\.([a-z\.]{2,6})([\/\w \.\-]*)*\/?$/i,
		 chkObj;
		 
	chkObj = jQ.util.formVerificator = {
		
		options: {
			groupErrors: false, 			// Display all validation alerts together within a designated area 
			displayEffect: 'standard',	// Visual effect for showing/hiding validation messages. 'standard' is built-in only
			errorFieldClass: 'invalid-input',// CSS class applied to an input element when validation fails		
			
			// Timing for validity checks
			inputTrigger: null,				// 'change', 'blur', 'keyup', or null to disable
			errorInputTrigger: 'keyup',  // 'change', 'blur', 'keyup', or null for error fields
			formTrigger: 'submit',       // 'submit' or null
			locale: 'en',						// Default language for alert messages 
			alertTemplate: '<div/>', // HTML structure for the alert message container
			alertAttribute: 'data-custom-alert', // Attribute name for custom error messages
			alertClass: 'error-msg',		// CSS class for the validation alert element
			offsetCoords: [0, 0], 
			placement: 'center right',
			singleIssueMode: false, 		// Validate only the first failing input
			animationSpeed: 'medium'		// Speed for message fade-in animation			
		},


		/* Centralized Error Messages */
		feedback: {
			"*": { en: "Kindly rectify this entry" }
		},
		
		adaptLocale: function(localeCode, localeAlerts) {
			jQ.each(localeAlerts, function(propKey, alertTxt) {
				chkObj.feedback[propKey] = chkObj.feedback[propKey] || {};
				chkObj.feedback[propKey][localeCode] = alertTxt;
			});
		},
		
		extendLocaleFn: function(propKey, localeAlerts) {
			chkObj.feedback[propKey] = chkObj.feedback[propKey] || {};
			jQ.extend(chkObj.feedback[propKey], localeAlerts);
		},
		
		/** 
		 * Registers a new validation rule 
		 */
		registerCheck: function(ruleMatcher, alertTxt, checkAction) {
			
			// No alert message was provided
			if (jQ.isFunction(alertTxt)) {
				checkAction = alertTxt;
				
			// Alert message(s) are provided as the second argument
			} else {
				if (typeof alertTxt == 'string') { alertTxt = {en: alertTxt}; }
				this.feedback[ruleMatcher.propKey || ruleMatcher] = alertTxt;
			}

			// Look for "[kind=xxx]" (not natively supported by jQ)
			var ruleTest = kindRx.exec(ruleMatcher);                                    
			if (ruleTest) { ruleMatcher = checkKind(ruleTest[1]); }				
			
			// Add the validator to our collection
			checkFuncs.push([ruleMatcher, checkAction]);
		},

		/* Add a new show/hide visual routine */
		appendVisual: function(routineName, displayAction, hideAction) {
			visualRoutines[routineName] = [displayAction, hideAction];
		}
		
	};
	
	/* Calculates the display position for an alert message relative to an input field */  	
	function calcMsgPosition(sourceElem, alertEl, opts) {
		
		// Get initial top/left coordinates 
		var topCoord = sourceElem.offset().top, 
			 leftCoord = sourceElem.offset().left,	 
			 posParts = opts.placement.split(/,?\s+/),
			 yAxis = posParts[0],
			 xAxis = posParts[1];
		
		topCoord -= alertEl.outerHeight() - opts.offsetCoords[0];
		leftCoord += sourceElem.outerWidth() + opts.offsetCoords[1];
		
		// Adjust Y-axis
		var combinedHeight = alertEl.outerHeight() + sourceElem.outerHeight();
		if (yAxis == 'center') 	{ topCoord += combinedHeight / 2; }
		if (yAxis == 'bottom') 	{ topCoord += combinedHeight; }
		
		// Adjust X-axis
		var sourceWidth = sourceElem.outerWidth();
		if (xAxis == 'center') 	{ leftCoord -= (sourceWidth  + alertEl.outerWidth()) / 2; }
		if (xAxis == 'left')  	{ leftCoord -= sourceWidth; }	 
		
		return {top: topCoord, left: leftCoord};
	}	
	

	
	// jQ.is("[kind=xxx]") or jQ.filter("[kind=xxx]") not functioning in jQ 1.3.2 or 1.4.2
	function checkKind(dataType) {
		function internalCheck() {
			return this.getAttribute("kind") == dataType;  	
		} 
		internalCheck.propKey = "[kind=" + dataType + "]";
		return internalCheck;
	}	

	
	var checkFuncs = [], visualRoutines = {
		
		'standard' : [
			
			// Function to display validation errors
			function(problemSet) {
				
				var currentOptions = this.retrieveOptions();
				
				// Iterate through all detected problems
				jQ.each(problemSet, function(idx, errorEntry) {
						
					// Apply error class to the input
					var fieldElem = errorEntry.input;					
					fieldElem.addClass(currentOptions.errorFieldClass);
					
					// Get reference to the error message container
					var alertEl = fieldElem.data("alert.element");
					
					// Create it if it doesn't exist
					if (!alertEl) { 
						alertEl = jQ(currentOptions.alertTemplate).addClass(currentOptions.alertClass).appendTo(document.body);
						fieldElem.data("alert.element", alertEl);
					}  
					
					// Clear previous content
					alertEl.css({visibility: 'hidden'}).find("span").remove();
					
					// Populate with new messages
					jQ.each(errorEntry.messages, function(idx, text) {
						jQ("<span/>").html(text).appendTo(alertEl);			
					});
					
					// Ensure width is sensible (not body's width)
					if (alertEl.outerWidth() == alertEl.parent().width()) {
						alertEl.add(alertEl.find("p")).css({display: 'inline'});		
					}
					
					// Place it at the correct position (relative to the field)
					var finalPos = calcMsgPosition(fieldElem, alertEl, currentOptions); 
					 
					alertEl.css({ visibility: 'visible', position: 'absolute', top: finalPos.top, left: finalPos.left })
						.fadeIn(currentOptions.animationSpeed);     
				});
						
				
			// Function to hide validation errors
			}, function(fieldElements) {

				var currentOptions = this.retrieveOptions();				
				fieldElements.removeClass(currentOptions.errorFieldClass).each(function() {
					var alertEl = jQ(this).data("alert.element");
					if (alertEl) { alertEl.css({visibility: 'hidden'}); }
				});
			}
		]  
	};

	
	/* Special selectors for HTML5 input types */
	jQ.each("email,url,number".split(","), function(idx, itemKey) {
		jQ.expr[':'][itemKey] = function(domEl) {
			return domEl.getAttribute("kind") === itemKey;
		};
	});
	

	/* 
		onProblem() jQ plugin. 
		Usage: jQ("input:eq(2)").onProblem(function() { ... });
	*/
	jQ.fn.onProblem = function( handlerFn ){
		return this[handlerFn ? "bind" : "trigger"]("OI", handlerFn);
	};
	
	
	/******* Core HTML5 standard validation rules *********/
	
	chkObj.registerCheck(":email", "Kindly provide a valid email address", function(inputEl, fieldValue) {
		return !fieldValue || mailRx.test(fieldValue);
	});
	
	chkObj.registerCheck(":url", "Kindly provide a valid URL", function(inputEl, fieldValue) {
		return !fieldValue || webAddrRx.test(fieldValue);
	});
	
	chkObj.registerCheck(":number", "Kindly provide a numeric entry.", function(inputEl, fieldValue) {
		return digitRx.test(fieldValue);			
	});
	
	chkObj.registerCheck("[max]", "Kindly provide a value smaller than $1", function(inputEl, fieldValue) {
			
		// Skip date inputs
		if (jQ.util.dateinput && inputEl.is(":date")) { return true; }
		
		var maxValue = inputEl.attr("max");
		return parseFloat(fieldValue) <= parseFloat(maxValue) ? true : [maxValue];
	});
	
	chkObj.registerCheck("[min]", "Kindly provide a value larger than $1", function(inputEl, fieldValue) {
			
		// Skip date inputs
		if (jQ.util.dateinput && inputEl.is(":date")) { return true; }
		
		var minValue = inputEl.attr("min");
		return parseFloat(fieldValue) >= parseFloat(minValue) ? true : [minValue];
	});
	
	chkObj.registerCheck("[required]", "Kindly complete this required field.", function(inputEl, fieldValue) {
		if (inputEl.is(":checkbox"))  { return inputEl.is(":checked"); }
		return !!fieldValue; 			
	});
	
	chkObj.registerCheck("[pattern]", function(inputEl) {
		var fieldPattern = new RegExp("^" + inputEl.attr("pattern") + "$");  
		return fieldPattern.test(inputEl.val()); 			
	});

	
	function FormVerifier(formFields, targetForm, options) {		
		
		// Private instance variables
		var verifierInst = this, 
			 triggerSource = targetForm.add(verifierInst);

		// Ensure there are input fields available for validation
		formFields = formFields.not(":button, :image, :reset, :submit");			 

		// Helper function to append a message to the list
		function addFeedbackEntry(messageTarget, ruleMatcher, resultValue) {
			
			// Only allow one message if not grouped
			if (!options.groupErrors && messageTarget.length) { return; }
			
			// The actual error message text
			var alertContent;
			
			// Substitutions are returned as an array
			if (resultValue === false || jQ.isArray(resultValue)) {
				alertContent = chkObj.feedback[ruleMatcher.propKey || ruleMatcher] || chkObj.feedback["*"];
				alertContent = alertContent[options.locale] || chkObj.feedback["*"].en;

				// Perform substitution for placeholders
				var placeholders = alertContent.match(/\$\d/g);
				
				if (placeholders && jQ.isArray(resultValue)) {
					jQ.each(placeholders, function(idx) {
						alertContent = alertContent.replace(this, resultValue[idx]);
					});
				} 					 
				
			// Error message is returned directly
			} else {
				alertContent = resultValue[options.locale] || resultValue;
			}
			
			messageTarget.push(alertContent);
		}
		
		
		// Public API methods  
		jQ.extend(verifierInst, {

			retrieveOptions: function() {
				return options;	
			},
			
			fetchForm: function() {
				return targetForm;		
			},
			
			obtainFields: function() {
				return formFields;	
			},		
			
			/* @param evtObj - for internal usage only */
			reportIssues: function(problemSet, evtObj) {
				
				// Errors provided manually: { fieldName1: 'message1', fieldName2: 'message2' }
				if (!evtObj) {
					var detectedErrors = [];
					jQ.each(problemSet, function(fieldKey, valueTxt) {
						var currentField = formFields.filter("[name=" + fieldKey + "]");
						if (currentField.length) {
							
							// Trigger HTML5 onProblem event
							currentField.trigger("OI", [valueTxt]);
							
							detectedErrors.push({ input: currentField, messages: [valueTxt]});				
						}
					});

				  	problemSet = detectedErrors; 
					evtObj = jQ.Event();
				}
				
				// onFail callback
				evtObj.type = "onFail";					
				triggerSource.trigger(evtObj, [problemSet]); 
				
				// Invoke the visual routine
				if (!evtObj.isDefaultPrevented()) {						
					visualRoutines[options.displayEffect][0].call(verifierInst, problemSet, evtObj);													
				}
				
				return verifierInst;
			},
			
			clearState: function(elementsToClear) {
				elementsToClear = elementsToClear || formFields;
				elementsToClear.removeClass(options.errorFieldClass).each(function()  {
					var alertEl = jQ(this).data("alert.element");
					if (alertEl) {
						alertEl.remove();
						jQ(this).data("alert.element", null);
					}
				}).unbind(options.errorInputTrigger || '');
				return verifierInst;
			},
			
			deactivate: function() { 
				targetForm.unbind(options.formTrigger).unbind("reset.V"); 
				formFields.unbind(options.inputTrigger || '').unbind("change.V");
				return verifierInst.clearState();	
			}, 
			
			
//{{{  performValidation() - the core functionality of this utility
						
			/* @returns boolean indicating overall validity */
			performValidation: function(elementsToValidate, evtObj) {
				
				elementsToValidate = elementsToValidate || formFields;    
				elementsToValidate = elementsToValidate.not(":disabled");
				if (!elementsToValidate.length) { return true; }

				evtObj = evtObj || jQ.Event();

				// onBeforeValidate event
				evtObj.type = "onBeforeValidate";
				triggerSource.trigger(evtObj, [elementsToValidate]);				
				if (evtObj.isDefaultPrevented()) { return evtObj.result; }				
					
				var problemSet = [], 
					 inputEvtName = options.errorInputTrigger + ".v";
 
				// Iterate through the input elements
				elementsToValidate.each(function() {
						
					// Current field and its associated alert message list						
					var fieldAlerts = [], 
						 currentField = jQ(this).unbind(inputEvtName).data("messages", fieldAlerts);					
					
					// Iterate through all registered validator functions
					jQ.each(checkFuncs, function() {
						var validationFn = this, matcherRule = validationFn[0]; 
					
						// If a match is found for the current field
						if (currentField.filter(matcherRule).length)  {  
							
							// Execute the validator function
							var checkResult = validationFn[1].call(verifierInst, currentField, currentField.val());
							
							
							// If validation failed. Multiple substitutions can be returned with an array
							if (checkResult !== true) {								
								
								// onBeforeFail event
								evtObj.type = "onBeforeFail";
								triggerSource.trigger(evtObj, [currentField, matcherRule]);
								if (evtObj.isDefaultPrevented()) { return false; }
								
								// Check for an overridden custom message
								var customAlert = currentField.attr(options.alertAttribute);
								if (customAlert) { 
									fieldAlerts = [customAlert];
									return false;
								} else {
									addFeedbackEntry(fieldAlerts, matcherRule, checkResult);
								}
							}							
						}
					});
					
					if (fieldAlerts.length) { 
						
						problemSet.push({input: currentField, messages: fieldAlerts});  
						
						// Trigger HTML5 onProblem event
						currentField.trigger("OI", [fieldAlerts]);
						
						// Start re-validating upon error input event (e.g., keyup) 
						if (options.errorInputTrigger) {
							currentField.bind(inputEvtName, function(eventObj) {
								verifierInst.performValidation(currentField, eventObj);		
							});							
						} 					
					}
					
					if (options.singleIssueMode && problemSet.length) { return false; }
					
				});
				
				
				// Validation complete. Now ensure we have a valid display routine.
				var displayRoutine = visualRoutines[options.displayEffect];
				if (!displayRoutine) { throw "FormVerifier: cannot locate visual routine \"" + options.displayEffect + "\""; }
				
				// Errors were found
				if (problemSet.length) {					 
					verifierInst.reportIssues(problemSet, evtObj); 
					return false;
					
				// No errors detected
				} else {		
					
					// Call the hide routine
					displayRoutine[1].call(verifierInst, elementsToValidate, evtObj);
					
					// onSuccess callback
					evtObj.type = "onSuccess";					
					triggerSource.trigger(evtObj, [elementsToValidate]);
					
					elementsToValidate.unbind(inputEvtName);
				}
				
				return true;				
			}
//}}} 
			
		});
		
		// Callback binding	
		jQ.each("onBeforeValidate,onBeforeFail,onFail,onSuccess".split(","), function(idx, callbackName) {
				
			// Configuration setup
			if (jQ.isFunction(options[callbackName]))  {
				jQ(verifierInst).bind(callbackName, options[callbackName]);	
			}
			
			// API method exposure				
			verifierInst[callbackName] = function(handlerFunc) {
				jQ(verifierInst).bind(callbackName, handlerFunc);
				return verifierInst;
			};
		});	
		
		
		// Form submission validation
		if (options.formTrigger) {
			targetForm.bind(options.formTrigger, function(evtObj) {
				if (!verifierInst.performValidation(null, evtObj)) { 
					return evtObj.preventDefault(); 
				}
			});
		}
		
		// Form reset handling
		targetForm.bind("reset.V", function()  {
			verifierInst.clearState();			
		});
		
		// Disable browser's native validation mechanism
		if (formFields[0] && formFields[0].validity) {
			formFields.each(function()  {
				this.oninvalid = function() { 
					return false; 
				};
			});
		}
		
	}
	
	// jQ plugin definition
	jQ.fn.verifier = function(customOptions) {
		
		var inst = this.data("verifier");
		
		// If an instance already exists, return it
		if (inst) { inst.deactivate(); }
		
		// If no elements are selected, return this for chaining
		if (this.is(":input")) { customOptions = {inputTrigger: customOptions}; }
		
		// Create a new instance of the FormVerifier
		var newInst = new FormVerifier(this, this.closest("form"), jQ.extend(true, {}, chkObj.options, customOptions));
		this.data("verifier", newInst);
		return newInst;
	};
	
})(jQuery);