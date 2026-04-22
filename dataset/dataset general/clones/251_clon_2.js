var _inputValidator = {
	// Internal storage for managed components
	registries: {},
	elements: {},

	checks: {
		match: function(elemKey, checkData) {
			if (typeof checkData.targetVal === 'object') {
				return _inputValidator.elements[elemKey].component.val() == checkData.targetVal.val();
			}
			else {
				return _inputValidator.elements[elemKey].component.val() == checkData.targetVal;
			}
		},
		isLower: function(elemKey, checkData) {
			return _inputValidator.elements[elemKey].component.val().parseInt() < checkData.targetVal;
		},
		isHigher: function(elemKey, checkData) {
			return _inputValidator.elements[elemKey].component.val().parseInt() > checkData.targetVal;
		},
		minChars: function(elemKey, checkData) {
			return _inputValidator.elements[elemKey].component.val().length >= checkData.targetVal;
		},
		maxChars: function(elemKey, checkData) {
			return _inputValidator.elements[elemKey].component.val().length <= checkData.targetVal;
		},
		regexMatch: function(elemKey, checkData) {
			return checkData.targetVal.test(_inputValidator.elements[elemKey].component.val());
		},
		emailFormat: function(elemKey, checkData) {
			let emailPattern = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
			return _inputValidator.checks.regexMatch(elemKey, { targetVal: emailPattern });
		}
	},

	/*
	 * @param elemKey <string> Identifier of the input to verify
	 * @param criteria <Object> Verification rules
	 */
	performCheck: function(elemKey, criteria) {
		var isValid = true;
		var messageArea;

		// Verify if the element's metadata is stored; if not, initialize it.
		if (!_inputValidator.elements[elemKey]) {
			_inputValidator.elements[elemKey] = {
				component: $('#' + elemKey),
				messageArea: $('#issue-for-' + elemKey)
			};
		}

		messageArea = _inputValidator.elements[elemKey].messageArea;

		// Clear prior error messages from the display region, if one exists.
		if (messageArea) {
			messageArea.hide();
			messageArea.children().remove();
		}

		for (var criterion in criteria) {
			// Determine if the current validation condition is met.
			if (!_inputValidator.checks[criterion](elemKey, criteria[criterion])) {
				// Should the check fail, append the corresponding error statement (if a message area is present).
				if (messageArea) {
					if (criteria[criterion].feedback) {
						messageArea.append('<div class="validation-error">' + criteria[criterion].feedback + '</div>');
					}
					messageArea.show();
				}
				isValid = false;
			}
		}

		return isValid;
	},

	/*
	 * @param elementsToCheck <Object> Collection of elements to be verified
	 * @returns <boolean> Returns true if all components pass their checks
	 */
	checkAllElements: function(elementsToCheck) {
		var isValid = true;

		for (var currentElement in elementsToCheck) {
			if (!_inputValidator.performCheck(currentElement, elementsToCheck[currentElement])) {
				isValid = false;
			}
		}

		return isValid;
	}
};

/*
 * @param ruleName <string> Identifier for the new checking rule
 * @param validationFunction <Function> The callback invoked for this specific validation
 */
var registerValidationRule = function(ruleName, validationFunction) {
	_inputValidator.checks[ruleName] = function(componentKey, ruleData) {
		return validationFunction(_inputValidator.elements[componentKey].component, ruleData);
	};
};

/*
 * @param criteria <Object> A map of inputs to their respective validation specifications
 * @param onSuccess <Function> This function executes if all designated fields pass their validation checks
 */
jQuery.prototype.applyValidationScheme = function(criteria, onSuccess) {
	var formId = this.attr('id');

	if (!_inputValidator.registries[formId]) {
		_inputValidator.registries[formId] = {
			htmlForm: this,
			scheme: criteria,
			successHandler: onSuccess
		};

		this.on('submit', function(eventObject) {
			var currentForm = _inputValidator.registries[$(this).attr('id')];

			if (_inputValidator.checkAllElements(currentForm.scheme)) {
				currentForm.successHandler(eventObject);
			}
			else {
				eventObject.preventDefault();
			}
		});
	}
};