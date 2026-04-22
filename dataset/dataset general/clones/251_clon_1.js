var __formValidation = {
	// "Cache" for forms and inputs
	forms: {},
	  inputs: {},


	validations: {
		equal: function ( input , data ) {
			if (typeof data.value === 'object')
			{
				return __formValidation.inputs[input].input.val() == data.value.val();
			}
			else
			{
				return __formValidation.inputs[input].input.val() == data.value;
			}
		},

		lessThan: function ( input , data ) {
			return __formValidation.inputs[input].input.val().parseInt() < data.value;
		},

		greaterThan: function ( input , data ) {
			return __formValidation.inputs[input].input.val().parseInt() > data.value;
		},

		minLength: function ( input , data ) {
			return __formValidation.inputs[input].input.val().length >= data.value;
		},

		maxLength: function ( input , data ) {
			return __formValidation.inputs[input].input.val().length <= data.value;
		},

		regularExpression: function ( input , data ) {
			return data.value.test(__formValidation.inputs[input].input.val());
		},

		email: function ( input , data ) {
			// This is a standard email regex pattern
			var emailExpression = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
			return __formValidation.validations.regularExpression(input, { value: emailExpression });
		}
	}, // End of validations object


	/*
	 * Method to validate a single input element
	 *
	 * @param input  Id of the input field
	 * @param rules  Validation rules object
	 */
	validate: function ( input , rules ) {
		var ok = true;
		var errorDiv;


		// Check if the input object is in our "cache"
		// If it's not, then we need to add it to the cache
		if ( ! __formValidation.inputs[input] ) {
			__formValidation.inputs[input] = {
				input:    $('#' + input),
				errorDiv: $('#error-' + input)
			};
		}

		errorDiv = __formValidation.inputs[input].errorDiv;

		// Removing any previously displayed errors from the
		// error div, but only if the error div actually exists.
		if ( errorDiv ) {
			errorDiv.hide();
			errorDiv.children().remove();
		}

		for ( var rule in rules ) {
			// Now, let's check if the current rule is satisfied
			if ( !__formValidation.validations[rule](input, rules[rule]) ) {
				// If the rule is not satisfied, then we add the error message
				// This only happens if an error div is available
				if ( errorDiv ) {
					if ( rules[rule].message ) {
						errorDiv.append('<div>' + rules[rule].message + '</div>');
					}
					errorDiv.show();
				}
				ok = false; // Mark validation as failed
			}
		}

		return ok;
	}, // End of validate function


	/*
	 * Validates all inputs provided in the 'inputs' object
	 *
	 * @param inputs    An object containing inputs and their validation rules
	 * @return          True if all inputs are successfully validated, false otherwise
	 */
	validateAllInputs: function ( inputs ) {
		var ok = true; // Assume everything is OK initially

		for ( var input in inputs ) {
			if ( !__formValidation.validate(input, inputs[input]) ) {
				ok = false; // If any input fails, set ok to false
			}
		}

		return ok;
	} // End of validateAllInputs function
};


/*
 * Allows adding a custom validation function to the system
 *
 * @param name  The name of the new validation rule
 * @param fn    The function that will perform the validation
 */
var addCustomFormValidation = function ( name , fn ) {
	__formValidation.validations[name] = function ( input , data ) {
		return fn(__formValidation.inputs[input].input, data);
	};
};


/*
 * Attaches validation rules to a jQuery form element
 *
 * @param rules     An object defining validation rules for various inputs
 * @param callback  A function to be called if all form fields pass validation
 */
jQuery.prototype.setValidationRules = function ( rules , callback ) {
	var id = this.attr('id');

	if ( !__formValidation.forms[id] ) {
		__formValidation.forms[id] = {
			form:     this,
			data:     rules,
			fn:       callback
		};

		this.on('submit', function ( e ) {
			var _this = __formValidation.forms[$(this).attr('id')];

			if ( __formValidation.validateAllInputs(_this.data) ) {
				_this.fn(e); // Execute the callback if validation passes
			} else {
				e.preventDefault(); // Prevent form submission if validation fails
			}
		});
	}
};