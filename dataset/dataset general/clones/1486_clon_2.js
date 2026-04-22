function adjustMediaDisplay() {
	var currentDisplayWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

	// Acquire all image elements on the page
	var visualElements = document.getElementsByTagName('body')[0].getElementsByTagName('img');
	if (visualElements.length === 0) {
		return;
	}

	// Utility for checking element attributes
	var checkElementProperty;
	if (!visualElements[0].hasAttribute) { // Compatibility for older browsers (e.g., IE7)
		checkElementProperty = function (domElement, attributeKey) { // IE lacks Object.Prototype methods
			return domElement.getAttribute(attributeKey) !== null;
		};
	} else {
		checkElementProperty = function (domElement, attributeKey) {
			return domElement.hasAttribute(attributeKey);
		};
	}

	// Determine if the current display is high-density (Retina)
	var highDPIEnabled = window.devicePixelRatio ? (window.devicePixelRatio >= 1.2 ? 1 : 0) : 0;

	// Iterate through each detected visual element
	for (var idx = 0; idx < visualElements.length; idx++) {
		var currentVisual = visualElements[idx];

		// Define which source attribute to check based on DPI
		var sourceAttributeKey = (highDPIEnabled && checkElementProperty(currentVisual, 'data-src2x')) ? 'data-src2x' : 'data-src';
		var basePathAttributeKey = (highDPIEnabled && checkElementProperty(currentVisual, 'data-src-base2x')) ? 'data-src-base2x' : 'data-src-base';

		// Skip if the required source attribute is not present
		if (!checkElementProperty(currentVisual, sourceAttributeKey)) {
			continue;
		}

		var resourceBase = checkElementProperty(currentVisual, basePathAttributeKey) ? currentVisual.getAttribute(basePathAttributeKey) : '';

		// Retrieve the list of responsive query definitions
		var queryDefinitions = currentVisual.getAttribute(sourceAttributeKey);

		// Split the comma-separated query definitions into an array
		var definitionList = queryDefinitions.split(',');

		// Process each query definition
		for (var defIdx = 0; defIdx < definitionList.length; defIdx++) {
			// Parse the individual query string (e.g., "condition:response")
			var singleDefinition = definitionList[defIdx].replace(':', '||').split('||');

			// Extract the sizing constraint and the corresponding asset path
			var sizeConstraint = singleDefinition[0];
			var assetPath = singleDefinition[1];

			// Initialize variables for constraint evaluation
			var constraintValue;
			var constraintMet;

			// Check if the condition specifies a maximum width (e.g., "<500")
			if (sizeConstraint.indexOf('<') !== -1) {
				constraintValue = sizeConstraint.split('<');

				// If there's a previous query, apply a range constraint
				if (definitionList[(defIdx - 1)]) {
					var priorDefinition = definitionList[(defIdx - 1)].split(/:(.+)/);
					var priorConstraint = priorDefinition[0].split('<');
					constraintMet = (currentDisplayWidth <= constraintValue[1] && currentDisplayWidth > priorConstraint[1]);
				} else {
					// Otherwise, apply only the maximum width constraint
					constraintMet = (currentDisplayWidth <= constraintValue[1]);
				}
			} else {
				// Condition specifies a minimum width (e.g., ">1000")
				constraintValue = sizeConstraint.split('>');

				// If there's a subsequent query, apply a range constraint
				if (definitionList[(defIdx + 1)]) {
					var subsequentDefinition = definitionList[(defIdx + 1)].split(/:(.+)/);
					var subsequentConstraint = subsequentDefinition[0].split('>');

					constraintMet = (currentDisplayWidth >= constraintValue[1] && currentDisplayWidth < subsequentConstraint[1]);
				} else {
					// Otherwise, apply only the minimum width constraint
					constraintMet = (currentDisplayWidth >= constraintValue[1]);
				}
			}

			// If the current viewport width satisfies the condition
			if (constraintMet) {
				var isExternalResource = assetPath.indexOf('//') !== -1 ? 1 : 0;

				var updatedSourceURL;
				if (isExternalResource === 1) {
					updatedSourceURL = assetPath;
				} else {
					updatedSourceURL = resourceBase + assetPath;
				}

				// Update the image source only if it's different
				if (currentVisual.src !== updatedSourceURL) {
					// Assign the new source to the image
					currentVisual.setAttribute('src', updatedSourceURL);
				}

				// Stop processing queries for this image once a match is found
				break;
			}
		}
	}
}

if (window.addEventListener) {
	window.addEventListener('load', adjustMediaDisplay, false);
	window.addEventListener('resize', adjustMediaDisplay, false);
} else { // Fallback for older Internet Explorer versions
	window.attachEvent('onload', adjustMediaDisplay);
	window.attachEvent('onresize', adjustMediaDisplay);
}