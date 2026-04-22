/*
 *  @license jQuery wizard plug-in v3.0.7 (Released on September 18, 2012)
 *
 *  A flexible and extensible wizard plugin for jQuery UI.
 *
 *  Copyright (c) 2012 Jan Sundman (jan.sundman[at]aland.net) - All rights reserved.
 *
 *  Project homepage: http://www.thecodemine.org
 *
 *  Licensed under the MIT License:
 *  http://www.opensource.org/licenses/mit-license.php
 *
 *  This software is provided "as is", without warranty of any kind, express or implied.
 *  Use at your own risk.
 */


( function ( $ ) { /* Self-executing anonymous function to encapsulate the plugin */

	// Define the jQuery UI widget for the form wizard.
	$.widget( "ui.formwizard" , {

		// The _init method is called once when the widget is created.
		_init : function ( ) {

			// Store a reference to the wizard instance.
			var wizard = this ;
			// Back up original formOptions callbacks to chain them later.
			var formOptionsSuccess = this.options.formOptions.success ;
			var formOptionsComplete = this.options.formOptions.complete ;
			var formOptionsBeforeSend = this.options.formOptions.beforeSend ;
			var formOptionsBeforeSubmit = this.options.formOptions.beforeSubmit ;
			var formOptionsBeforeSerialize = this.options.formOptions.beforeSerialize ;

			// Extend the form options with custom logic for the wizard.
			this.options.formOptions = $.extend( this.options.formOptions , {

				success	: function ( responseText , textStatus , xhr ) {
					// Execute original success callback if it exists.
					if ( formOptionsSuccess ) {
						formOptionsSuccess ( responseText , textStatus , xhr ) ;
					}
					// Reset the form if configured or if no custom form options are provided.
					if ( wizard.options.formOptions && wizard.options.formOptions.resetForm || ! wizard.options.formOptions ) {
						wizard._reset ( ) ; // Call internal reset method.
					}
				} ,

				complete : function ( xhr , textStatus ) {
					// Execute original complete callback.
					if ( formOptionsComplete ) {
						formOptionsComplete ( xhr , textStatus ) ;
					}
					// Re-enable navigation buttons after form submission.
					wizard._enableNavigation ( ) ;
				} ,

				beforeSubmit : function ( arr , theForm , options ) {
					// Execute original beforeSubmit callback.
					if ( formOptionsBeforeSubmit ) {
						var shouldSubmit = formOptionsBeforeSubmit ( arr , theForm , options ) ;
						// If original callback prevents submission, re-enable navigation.
						if ( ! shouldSubmit )
							wizard._enableNavigation ( ) ;
						return shouldSubmit ; // Return its result.
					}
					// If no original callback, allow submission.
					return true;
				} ,

				beforeSend : function ( xhr ) {
					// Execute original beforeSend callback.
					if ( formOptionsBeforeSend ) {
						var shouldSubmit = formOptionsBeforeSend ( xhr ) ;
						// If original callback prevents submission, re-enable navigation.
						if ( ! shouldSubmit )
							wizard._enableNavigation ( ) ;
						return shouldSubmit ; // Return its result.
					}
					return true;
				} ,

				beforeSerialize : function ( form , options ) {
					// Execute original beforeSerialize callback.
					if ( formOptionsBeforeSerialize ) {
						var shouldSubmit = formOptionsBeforeSerialize ( form , options ) ;
						// If original callback prevents serialization, re-enable navigation.
						if ( ! shouldSubmit )
							wizard._enableNavigation ( ) ;
						return shouldSubmit ; // Return its result.
					}
					return true;
				}

			} ) ; // End of $.extend call.

			// Check if history tracking is enabled for the wizard.
			if ( this.options.historyEnabled ) {
				// Remove any previous state associated with this wizard instance.
				$.bbq.removeState ( "_" + $ ( this.element ).attr ( 'id' ) ) ;
			}


			this.steps = this.element.find ( ".step" ).hide ( ) ; // Find all steps and hide them initially.

			this.firstStep = this.steps.eq ( 0 ).attr ( "id" ) ; // Get the ID of the first step.
			this.activatedSteps = new Array ( ) ; // Initialize an array to keep track of visited steps.
			this.isLastStep = false ; // Flag to indicate if the current step is the last one.
			this.previousStep = undefined ; // Stores the ID of the previously active step.
			this.currentStep = this.steps.eq ( 0 ).attr ( "id" ) ; // Set the initial current step.

			// Initialize the 'Next' button handler.
			this.nextButton	= this.element.find ( this.options.next )
					.click ( function ( ) {
						return wizard._next ( ) ; // Call the internal _next method.
					} ) ;

			this.nextButtonInitinalValue = this.nextButton.val ( ) ; // Store original value of next button.
			this.nextButton.val ( this.options.textNext ) ; // Set button text to 'Next'.

			// Initialize the 'Back' button handler.
			this.backButton	= this.element.find ( this.options.back )
					.click ( function ( ) {
						wizard._back ( ) ; return false ; // Call _back and prevent default action.
					} ) ;

			this.backButtonInitinalValue = this.backButton.val ( ) ; // Store original value of back button.
			this.backButton.val ( this.options.textBack ) ; // Set button text to 'Back'.

			// Handle validation plugin integration.
			if ( this.options.validationEnabled && jQuery ( ) . validate == undefined ) {
				this.options.validationEnabled = false ; // Disable validation if plugin not found.
				if ( ( window [ 'console' ] !== undefined ) ) { // Check for console availability.
					console.log ( "%s" , "validationEnabled option set, but the validation plugin is not included" ) ;
				}
			} else if ( this.options.validationEnabled ) {
				this.element.validate ( this.options.validationOptions ) ; // Initialize validation.
			}

			// Handle form plugin integration.
			if ( this.options.formPluginEnabled && jQuery ( ) . ajaxSubmit == undefined ) {
				this.options.formPluginEnabled = false ; // Disable form plugin if not found.
				if ( ( window [ 'console' ] !== undefined ) ) {
					console.log ( "%s" , "formPluginEnabled option set but the form plugin is not included" ) ;
				}
			}

			// Disable input fields in inactive steps if configured.
			if ( this.options.disableInputFields == true ) {
				$ ( this.steps ).find ( ":input:not('.wizard-ignore')" ).attr ( "disabled" , "disabled" ) ;
			}

			// Set up history tracking with jQuery BBQ plugin.
			if ( this.options.historyEnabled ) {
				$ ( window ) . bind ( 'hashchange' , undefined , function ( event ) {
					// Retrieve the step from the URL hash or default to the first step.
					var hashStep = event.getState ( "_" + $ ( wizard.element ).attr ( 'id' ) ) || wizard.firstStep ;
					// If hash step is different from current step, navigate.
					if ( hashStep !== wizard.currentStep ) {
						// If validation is enabled and trying to navigate forward.
						if ( wizard.options.validationEnabled && hashStep === wizard._navigate ( wizard.currentStep ) ) {
							if ( ! wizard.element.valid ( ) ) {
								wizard._updateHistory ( wizard.currentStep ) ; // Revert history.
								wizard.element.validate ( ) . focusInvalid ( ) ; // Focus on invalid field.

								return false ; // Prevent hash change.
							}
						}
						// If still different (e.g., validation passed or not applicable), show the step.
						if ( hashStep !== wizard.currentStep )
							wizard._show ( hashStep ) ;
					}
				} ) ;
			}

			// Add base CSS classes to wizard elements.
			this.element.addClass ( "ui-formwizard" ) ;
			this.element.find ( ":input" ).addClass ( "ui-wizard-content" ) ;
			this.steps.addClass ( "ui-formwizard-content" ) ;
			this.backButton.addClass ( "ui-formwizard-button ui-wizard-content" ) ;
			this.nextButton.addClass ( "ui-formwizard-button ui-wizard-content" ) ;

			// Apply jQuery UI styles if not disabled.
			if ( ! this.options.disableUIStyles ) {
				this.element.addClass ( "ui-helper-reset ui-widget ui-widget-content ui-helper-reset ui-corner-all" ) ;
				this.element.find ( ":input" ).addClass ( "ui-helper-reset ui-state-default" ) ;
				this.steps.addClass ( "ui-helper-reset ui-corner-all" ) ;
				this.backButton.addClass ( "ui-helper-reset ui-state-default" ) ;
				this.nextButton.addClass ( "ui-helper-reset ui-state-default" ) ;
			}

			this._show ( undefined ) ; // Display the first step.
			return $ ( this ) ; // Return the jQuery object for chaining.
		} , // End of _init method.

		// Handles navigation to the next step.
		_next : function ( ) {
			// Perform validation if enabled.
			if ( this.options.validationEnabled ) {
				if ( ! this.element.valid ( ) ) {
					this.element.validate ( ) . focusInvalid ( ) ;
					return false ; // Stop if validation fails.
				}
			}

			// Handle remote AJAX submission if configured for the current step.
			if ( this.options.remoteAjax != undefined ) {
				var options = this.options.remoteAjax [ this.currentStep ] ;
				var wizard = this ; // Keep context for callbacks.
				if ( options !== undefined ) {
					var success = options.success ; // Store original success callback.
					var beforeSend = options.beforeSend ; // Store original beforeSend callback.
					var complete = options.complete ; // Store original complete callback.

					// Extend AJAX options with wizard-specific logic.
					options = $.extend ( { } , options , {
						success : function ( data , statusText ) {
							// If original success returns true or is undefined, continue to next step.
							if ( ( success !== undefined && success ( data , statusText ) ) || ( success == undefined ) ) {
								wizard._continueToNextStep ( ) ;
							}
						} ,
						beforeSend : function ( xhr ) {
							wizard._disableNavigation ( ) ; // Disable buttons during AJAX.
							if ( beforeSend !== undefined )
								beforeSend ( xhr ) ; // Call original beforeSend.
							// Trigger a custom event for remote AJAX start.
							$ ( wizard.element ) . trigger ( 'before_remote_ajax' , { "currentStep" : wizard.currentStep } ) ;
						} ,
						complete : function ( xhr , statusText ) {
							if ( complete !== undefined )
								complete ( xhr , statusText ) ; // Call original complete.
							// Trigger a custom event for remote AJAX completion.
							$ ( wizard.element ) . trigger ( 'after_remote_ajax' , { "currentStep" : wizard.currentStep } ) ;
							wizard._enableNavigation ( ) ; // Re-enable buttons.
						}
					} ) ;
					this.element.ajaxSubmit ( options ) ; // Submit form via AJAX.
					return false ; // Prevent normal form submission.
				}
			}

			// If no remote AJAX or it's handled, continue to the next step directly.
			return this._continueToNextStep ( ) ;
		} , // End of _next method.

		// Handles navigation to the previous step.
		_back : function ( ) {
			// Ensure there are steps in the activated history.
			if ( this.activatedSteps.length > 0 ) {
				if ( this.options.historyEnabled ) {
					// Update browser history for back navigation.
					this._updateHistory ( this.activatedSteps [ this.activatedSteps.length - 2 ] ) ;
				} else {
					// Directly show the previous step without history.
					this._show ( this.activatedSteps [ this.activatedSteps.length - 2 ] , true ) ;
				}
			}
			return false ; // Prevent default button action.
		} , // End of _back method.

		// Logic to proceed to the next step, considering final submission.
		_continueToNextStep : function ( ) {
			// If it's the last step, handle final form submission.
			if ( this.isLastStep ) {
				// Re-enable disabled input fields from activated steps.
				for ( var i = 0 ; i < this.activatedSteps.length ; i ++ ) {
					this.steps.filter ( "#" + this.activatedSteps [ i ] ) . find ( ":input" ) . not ( ".wizard-ignore" ) . removeAttr ( "disabled" ) ;
				}
				// If form plugin is not enabled, allow native form submission.
				if ( ! this.options.formPluginEnabled ) {
					return true ;
				} else {
					// Otherwise, use AJAX form submission.
					this._disableNavigation ( ) ; // Disable buttons during submission.
					this.element.ajaxSubmit ( this.options.formOptions ) ;
					return false ; // Prevent native form submission.
				}
			}

			// Determine the next step based on navigation rules.
			var step = this._navigate ( this.currentStep ) ;
			// If navigation doesn't change the step, something is wrong or no next step.
			if ( step == this.currentStep ) {
				return false ;
			}
			// Update history or directly show the next step.
			if ( this.options.historyEnabled ) {
				this._updateHistory ( step ) ;
			} else {
				this._show ( step , true ) ;
			}
			return false ; // Prevent default action.
		} , // End of _continueToNextStep.

		// Updates the browser history with the current step.
		_updateHistory : function ( step ) {
			var state = { } ; // Create a state object.
			state [ "_" + $ ( this.element ) . attr ( 'id' ) ] = step ; // Set the step for the current wizard.
			$.bbq.pushState ( state ) ; // Push the new state to history.
		} , // End of _updateHistory.

		// Disables navigation buttons and applies UI styles.
		_disableNavigation : function ( ) {
			this.nextButton.attr ( "disabled" , "disabled" ) ; // Disable next button.
			this.backButton.attr ( "disabled" , "disabled" ) ; // Disable back button.
			// Apply disabled UI styles if not disabled.
			if ( ! this.options.disableUIStyles ) {
				this.nextButton.removeClass ( "ui-state-active" ) . addClass ( "ui-state-disabled" ) ;
				this.backButton.removeClass ( "ui-state-active" ) . addClass ( "ui-state-disabled" ) ;
			}
		} , // End of _disableNavigation.

		// Enables navigation buttons and adjusts their text/styles.
		_enableNavigation : function ( ) {
			// Change next button text based on whether it's the last step.
			if ( this.isLastStep ) {
				this.nextButton.val ( this.options.textSubmit ) ;
			} else {
				this.nextButton.val ( this.options.textNext ) ;
			}

			// Enable back button if not on the first step.
			if ( $.trim ( this.currentStep ) !== this.steps.eq ( 0 ) . attr ( "id" ) ) {
				this.backButton.removeAttr ( "disabled" ) ;
				if ( ! this.options.disableUIStyles ) {
					this.backButton.removeClass ( "ui-state-disabled" ) . addClass ( "ui-state-active" ) ;
				}
			}

			this.nextButton.removeAttr ( "disabled" ) ; // Always enable next button.
			if ( ! this.options.disableUIStyles ) {
				this.nextButton.removeClass ( "ui-state-disabled" ) . addClass ( "ui-state-active" ) ;
			}
		} , // End of _enableNavigation.

		// Handles the animation between steps.
		_animate : function ( oldStep , newStep , stepShownCallback ) {
			this._disableNavigation ( ) ; // Disable navigation during animation.
			var old = this.steps.filter ( "#" + oldStep ) ; // Get the old step element.
			var current = this.steps.filter ( "#" + newStep ) ; // Get the new step element.

			old.find ( ":input" ) . not ( ".wizard-ignore" ) . attr ( "disabled" , "disabled" ) ; // Disable inputs in old step.
			current.find ( ":input" ) . not ( ".wizard-ignore" ) . removeAttr ( "disabled" ) ; // Enable inputs in new step.

			var wizard = this ; // Reference to the wizard instance.
			old.animate ( wizard.options.outAnimation , wizard.options.outDuration , wizard.options.easing , function ( ) {
				current.animate ( wizard.options.inAnimation , wizard.options.inDuration , wizard.options.easing , function ( ) {
					// Focus on the first input field of the new step if configured.
					if ( wizard.options.focusFirstInput )
						current.find ( ":input:first" ) . focus ( ) ;
					wizard._enableNavigation ( ) ; // Re-enable navigation after animation.

					stepShownCallback.apply ( wizard ) ; // Execute the callback for step shown.
				} ) ;
				return ; // Ensure animate callback completes.
			} ) ;
		} , // End of _animate.

		// Checks if a given step is the last step.
		_checkIflastStep : function ( step ) {
			this.isLastStep = false ; // Reset last step flag.
			// Check if step has 'submit_step' class or is the very last step element.
			if ( $ ( "#" + step ) . hasClass ( this.options.submitStepClass ) || this.steps.filter ( ":last" ) . attr ( "id" ) == step ) {
				this.isLastStep = true ;
			}
		} , // End of _checkIflastStep.

		// Retrieves the link (next step ID) from the current step's link elements.
		_getLink : function ( step ) {
			var link = undefined ; // Initialize link variable.
			var links = this.steps.filter ( "#" + step ) . find ( this.options.linkClass ) ; // Find link elements.

			if ( links != undefined ) {
				if ( links.filter ( ":radio,:checkbox" ) . size ( ) > 0 ) {
					link = links.filter ( this.options.linkClass + ":checked" ) . val ( ) ; // Get value of checked radio/checkbox.
				} else {
					link = $ ( links ) . val ( ) ; // Get value of other link elements.
				}
			}
			return link ; // Return the determined link.
		} , // End of _getLink.

		// Determines the next step to navigate to.
		_navigate : function ( step ) {
			var link = this._getLink ( step ) ; // Get explicit link from step.
			if ( link != undefined ) {
				// If link is valid and refers to an existing step.
				if ( ( link != "" && link != null && link != undefined ) && this.steps.filter ( "#" + link ) . attr ( "id" ) != undefined ) {
					return link ; // Navigate to the explicit link.
				}
				return this.currentStep ; // Otherwise, stay on current step.
			} else if ( link == undefined && ! this.isLastStep ) {
				var step1 = this.steps.filter ( "#" + step ) . next ( ) . attr ( "id" ) ; // Get the next sibling step.
				return step1 ;
			}
			return undefined;
		} , // End of _navigate.

		// Displays a specific step.
		_show : function ( step ) {
			var backwards = false ; // Flag for backward navigation.
			var triggerStepShown = step !== undefined ; // Flag to trigger step_shown event.

			// Handle initial display or reset to first step.
			if ( step == undefined || step == "" ) {
					this.activatedSteps.pop ( ) ; // Remove last activated step if undefined.
					step = this.firstStep ; // Set to first step.
					this.activatedSteps.push ( step ) ; // Add first step to activated.
			} else {
				// If step is already in activated history, it's a backward navigation.
				if ( $.inArray ( step , this.activatedSteps ) > -1 ) {
					backwards = true ;
					this.activatedSteps.pop ( ) ; // Remove the current step from history.
				} else {
					this.activatedSteps.push ( step ) ; // Add new step to history.
				}
			}

			// Only proceed if the step is different from the current one or it's the very first display.
			if ( this.currentStep !== step || step === this.firstStep ) {
				this.previousStep = this.currentStep ; // Store current as previous.
				this._checkIflastStep ( step ) ; // Check if the new step is the last.
				this.currentStep = step ; // Update current step.

				// Define the callback to be executed after step animation.
				var stepShownCallback = function ( ) {
					if ( triggerStepShown ) {
						$ ( this.element ) . trigger ( 'step_shown' , $.extend ( { "isBackNavigation" : backwards } , this._state ( ) ) ) ;
					}
				} ;

				// Trigger 'before_step_shown' event.
				if ( triggerStepShown ) {
					$ ( this.element ) . trigger ( 'before_step_shown' , $.extend ( { "isBackNavigation" : backwards } , this._state ( ) ) ) ;
				}
				// Animate the transition between steps.
				this._animate ( this.previousStep , step , stepShownCallback ) ;
			} ;
		} , // End of _show.

	   // Resets the wizard to its initial state.
		_reset : function ( ) {
			this.element.resetForm ( ) ; // Reset the form fields.
			$ ( "label,:input,textarea" , this ) . removeClass ( "error" ) ; // Remove error classes.
			// Hide all activated steps and disable their inputs.
			for ( var i = 0 ; i < this.activatedSteps.length ; i ++ ) {
				this.steps.filter ( "#" + this.activatedSteps [ i ] ) . hide ( ) . find ( ":input" ) . attr ( "disabled" , "disabled" ) ;
			}
			this.activatedSteps = new Array ( ) ; // Clear activated steps history.
			this.previousStep = undefined ; // Reset previous step.
			this.isLastStep = false ; // Reset last step flag.
			// Navigate to the first step, updating history if enabled.
			if ( this.options.historyEnabled ) {
				this._updateHistory ( this.firstStep ) ;
			} else {
				this._show ( this.firstStep ) ;
			}
		} , // End of _reset.

		// Returns the current state of the wizard.
		_state : function ( state ) {
			var currentState = { // Compile current state properties.
				"settings" : this.options ,
				"activatedSteps" : this.activatedSteps ,
				"isLastStep" : this.isLastStep ,
				"isFirstStep" : this.currentStep === this.firstStep ,
				"previousStep" : this.previousStep ,
				"currentStep" : this.currentStep ,
				"backButton" : this.backButton ,
				"nextButton" : this.nextButton ,
				"steps" : this.steps ,
				"firstStep" : this.firstStep
			} ;

			if ( state !== undefined )
				return currentState [ state ] ; // Return specific state property if requested.

			return currentState ; // Return the full state object.
		} , // End of _state.

	  /* Public Methods */

		// Public method to show a specific step.
		show : function ( step ) {
			if ( this.options.historyEnabled ) {
				this._updateHistory ( step ) ; // Use history for navigation.
			} else {
				this._show ( step ) ; // Direct show.
			}
		} , // End of show.

		// Public method to get the current state or a specific state property.
		state : function ( state ) {
			return this._state ( state ) ;
		} , // End of state.

		// Public method to reset the wizard.
		reset : function ( ) {
			this._reset ( ) ;
		} , // End of reset.

		// Public method to advance to the next step.
		next : function ( ) {
			this._next ( ) ;
		} , // End of next.

		// Public method to go back to the previous step.
		back : function ( ) {
			this._back ( ) ;
		} , // End of back.

		// Cleans up the widget instance.
		destroy : function ( ) {
			this.element.find ( "*" ) . removeAttr ( "disabled" ) . show ( ) ; // Re-enable all elements.
			this.nextButton.unbind ( "click" ) . val ( this.nextButtonInitinalValue ) . removeClass ( "ui-state-disabled" ) . addClass ( "ui-state-active" ) ;
			this.backButton.unbind ( "click" ) . val ( this.backButtonInitinalValue ) . removeClass ( "ui-state-disabled" ) . addClass ( "ui-state-active" ) ;
			// Clear all internal references.
			this.backButtonInitinalValue = undefined ;
			this.nextButtonInitinalValue = undefined ;
			this.activatedSteps = undefined ;
			this.previousStep = undefined ;
			this.currentStep = undefined ;
			this.isLastStep = undefined ;
			this.options = undefined ;
			this.nextButton = undefined ;
			this.backButton = undefined ;
			this.formwizard = undefined ;
			this.element = undefined ;
			this.steps = undefined ;
			this.firstStep = undefined ;
		} , // End of destroy.

		// Updates the steps collection after dynamic changes.
		update_steps : function ( ) {
			this.steps = this.element.find ( ".step" ) . addClass ( "ui-formwizard-content" ) ; // Re-find steps.
			this.firstStep = this.steps.eq ( 0 ) . attr ( "id" ) ; // Re-determine first step.
			// Hide all steps except current and disable their inputs.
			this.steps.not ( "#" + this.currentStep ) . hide ( ) . find ( ":input" ) . addClass ( "ui-wizard-content" ) . attr ( "disabled" , "disabled" ) ;
			this._checkIflastStep ( this.currentStep ) ; // Re-check if current is last.
			this._enableNavigation ( ) ; // Re-enable navigation.
			// Re-apply UI styles if not disabled.
			if ( ! this.options.disableUIStyles ) {
				this.steps.addClass ( "ui-helper-reset ui-corner-all" ) ;
				this.steps.find ( ":input" ) . addClass ( "ui-helper-reset ui-state-default" ) ;
			}
		} , // End of update_steps.

		// Default options for the wizard plugin.
		options : {
	   		historyEnabled	: false , // Enable/disable browser history integration.
			validationEnabled : false , // Enable/disable client-side validation.
			validationOptions : undefined , // Options for the validation plugin.
			formPluginEnabled : false , // Enable/disable jQuery Form plugin integration.
			linkClass	: ".link" , // Selector for step navigation links.
			submitStepClass : "submit_step" , // Class indicating a step that triggers form submission.
			back : ":reset" , // Selector for the back button.
			next : ":submit" , // Selector for the next/submit button.
			textSubmit : 'Submit' , // Text for the submit button.
			textNext : 'Next' , // Text for the next button.
			textBack : 'Back' , // Text for the back button.
			remoteAjax : undefined , // Configuration for AJAX calls on a per-step basis.
			inAnimation : { opacity : 'show' } , // Animation for showing steps.
			outAnimation : { opacity : 'hide' } , // Animation for hiding steps.
			inDuration : 400 , // Duration of the 'in' animation.
			outDuration : 400 , // Duration of the 'out' animation.
			easing : 'swing' , // Easing function for animations.
			focusFirstInput : false , // Whether to focus on the first input of a new step.
			disableInputFields : true , // Disable inputs in inactive steps.
			formOptions : { reset : true , success : function ( data ) { if ( ( window [ 'console' ] !== undefined ) ) { console.log ( "%s" , "form submit successful" ) ; } } } ,
			disableUIStyles : false // Disable default jQuery UI styling.
		}
   } ) ; // End of $.widget call.

} ) ( jQuery ) ; // End of IIFE.