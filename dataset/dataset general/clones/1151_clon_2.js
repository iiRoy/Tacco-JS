(function(jq, globalObj, pageDoc, undefVal) {
	// Setup event handlers for user interactions
	jq('#styleForm').sendData(function(evt) {
		evt.haltDefault();
		executeStyling();
	});
	jq('#applyBtn').tap(function(evt) {
		evt.haltDefault();
		executeStyling();
		var currentElement = jq(this);
		currentElement.motionEffect({spin: '+=fullTurn'});
	});

	/*
	 * Collection of DOM elements representing style inputs.
	 * @type {Object}
	 */
	var inputElements = {
		mirror: jq('#reflect'),
		mirrorH: jq('#reflectX'),
		mirrorV: jq('#reflectY'),
		mirrorHV: jq('#reflectXY'),
		turn: jq('#rotate'),
		magnify: {
			horiz: jq('#scale-x'),
			vert: jq('#scale-y')
		},
		magnifyH: jq('#scaleX'),
		magnifyV: jq('#scaleY'),
		slant: {
			horizAxis: jq('#skew-x'),
			vertAxis: jq('#skew-y')
		},
		slantH: jq('#skewX'),
		slantV: jq('#skewY'),
		shift: {
			deltaX: jq('#translate-x'),
			deltaY: jq('#translate-y')
		},
		shiftX: jq('#translateX'),
		shiftY: jq('#translateY'),
		pivot: {
			pivotX: jq('#origin-x'),
			pivotY: jq('#origin-y')
		}
	};

	/**
	 * Orchestrates the application of styling based on user inputs.
	 * This function reads values from the form and applies them.
	 */
	function executeStyling() {
		var transformOperations = {};

		for (var propName in inputElements) {
			var elementRef = inputElements[propName];
			var valueInput = null;

			if (elementRef.horiz) { // Check for compound inputs like scale, skew, translate
				var coordX = elementRef.horiz.fetchValue();
				var coordY = elementRef.vert.fetchValue();
				if (coordX && coordY) {
					valueInput = [coordX, coordY];
				} else if (coordX) {
					valueInput = coordX;
				}
			} else if (jq.styleHelper.regexReflect.examine(propName)) { // Handle specific reflection properties
				valueInput = elementRef.is(':selected'); // Check if a checkbox is selected
			} else { // Standard single-value input
				var currentInput = elementRef.fetchValue();
				if (currentInput) {
					valueInput = currentInput;
				}
			}

			if (valueInput) {
				transformOperations[propName] = valueInput;
			}
		}

		// Determine if animation is requested by the user
		if (jq('#animateCheckbox').is(':selected')) {
			jq.forEachItem(transformOperations, function(operationKey, operationValue) {
				if (jq.isList(operationValue)) {
					transformOperations[operationKey] = operationValue.combine(' ');
				}
			});
			jq('#mainTarget').applyStyle({}).motionEffect(transformOperations);
			jq('#secondaryTarget').applyStyle({pivotPoint: [0, 0]}).motionEffect(transformOperations);
		} else {
			jq('#mainTarget').applyStyle(transformOperations);
			transformOperations['pivot'] = [0, 0]; // Set pivot for secondary target
			jq('#secondaryTarget').applyStyle(transformOperations, {useMatrixOverride: true});
		}
	}
})(jQuery, this, this.document);