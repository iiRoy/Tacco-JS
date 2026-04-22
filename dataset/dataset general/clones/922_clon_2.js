function MediaPlayer(mediaLocation) {
	/*
	 * Configuration properties for the media player instance.
	 */

	// Path to the main SWF file, relative to the calling script.
	this.mediaResourceLocation = mediaLocation || 'media.swf';

	// Visual customization options.
	this.artworkHue = false;
	this.canvasColor = '#FFFFFF';
	this.playbackUnitDimension = false;
	this.placementLocation = 'after';
	this.trackingDataEnabled = false;

	// Semi-internal properties.
	this.containerElementClass = 'media_embed_wrapper';

	// Internal state variables.
	this.playbackInstanceCount = 1;
	this.swfEngineVersion = 9;

	/*
	 * Public methods for controlling the media player.
	 */

	// Allows setting various options for the player.
	this.configureSettings = function(settingKey, settingValue) {
		if (settingKey === "color") {
			this.artworkHue = settingValue;
		}
		if (settingKey === "background") {
			this.canvasColor = settingValue;
		}
		if (settingKey === "playerSize") {
			this.playbackUnitDimension = settingValue;
		}
		if (settingKey === "position") {
			this.placementLocation = settingValue;
		}
		if (settingKey === "analytics") {
			this.trackingDataEnabled = settingValue;
		}
	};

	// Iterates through matching links and inserts a player for each.
	this.processLinks = function(cssQueryString) {
		var hyperlinks = this.queryDomElements(cssQueryString);
		for (var idx = 0; idx < hyperlinks.length; idx++) {

			// Skip if a player is already associated with this link.
			if (this.elementHasClass(hyperlinks[idx].parentNode, this.containerElementClass)) {
				continue;
			}

			// Ensure only .mp3 files are processed.
			if (hyperlinks[idx].href.substr(hyperlinks[idx].href.length - 4) !== '.mp3') {
				continue;
			}

			this.embedPlaybackWidget(hyperlinks[idx]);
		}
	};

	this.embedPlaybackWidget = function(targetNode) {
		if (!this.playbackUnitDimension) {
			// Automatically determine player size from the element's height.
			this.calculatedWidgetSize = Math.floor(targetNode.scrollHeight * 0.65);
		}

		if (!this.artworkHue) {
			// Auto-detect foreground color from the element's style.
			this.determinedColorCode = this.fetchComputedStyle(targetNode, 'color');
			// Convert 3-digit hex to 6-digit hex for Flash compatibility.
			if (this.determinedColorCode.substr(0, 1) === '#' && this.determinedColorCode.length === 4) {
				this.determinedColorCode = this.determinedColorCode.substr(0, 2) + '0' + this.determinedColorCode.substr(2, 1) + '0' + this.determinedColorCode.substr(3, 1) + '0';
			}
			// Convert RGB(A) to hex if necessary.
			if (this.determinedColorCode.substr(0, 1) !== '#') {
				this.determinedColorCode = this.determinedColorCode.substr(4, this.determinedColorCode.indexOf(')') - 4);
				var colorComponents = new Array();
				colorComponents = this.determinedColorCode.split(', ');
				this.determinedColorCode = '#' + this.hexifyColor(Number(colorComponents[2]), Number(colorComponents[1]), Number(colorComponents[0]));
			}
		}

		// Create a container span to hold the link and the Flash object.
		var widgetContainer = document.createElement('span');
		this.addElementClass(widgetContainer, this.containerElementClass);

		// Prepare a placeholder span where the Flash object will be inserted by its ID.
		var insertionPointId = 'mediaInsert_' + this.playbackInstanceCount;
		var placeholderSpan = document.createElement('span');
		placeholderSpan.setAttribute('id', insertionPointId);

		// Arrange the elements in the DOM.
		targetNode.parentNode.insertBefore(widgetContainer, targetNode);
		if (this.placementLocation === 'before') {
			widgetContainer.appendChild(placeholderSpan);
			widgetContainer.innerHTML += '&nbsp;';
			widgetContainer.appendChild(targetNode);
		} else {
			widgetContainer.appendChild(targetNode);
			widgetContainer.innerHTML += '&nbsp;';
			widgetContainer.appendChild(placeholderSpan);
		}

		// Determine the final size for the SWF object.
		if (!this.playbackUnitDimension) {
			this.finalWidgetSize = this.calculatedWidgetSize;
		} else {
			this.finalWidgetSize = this.playbackUnitDimension;
		}

		// Initialize the SWF embedding object.
		var swfEmbedObject = new SWFObject(
			this.mediaResourceLocation,
			insertionPointId,
			this.finalWidgetSize,
			this.finalWidgetSize,
			this.swfEngineVersion,
			this.canvasColor
		);

		// Set transparent background for the Flash player if specified.
		if (this.canvasColor === 'transparent') {
			swfEmbedObject.addParam('wmode', 'transparent');
		}
		// Apply the determined or specified foreground color.
		if (!this.artworkHue) {
			swfEmbedObject.addVariable('foreColor', this.determinedColorCode);
		} else {
			swfEmbedObject.addVariable('foreColor', this.artworkHue);
		}
		swfEmbedObject.addVariable('analytics', this.trackingDataEnabled);
		swfEmbedObject.addVariable('filename', targetNode.href);

		// Write the Flash object to the DOM.
		swfEmbedObject.write(insertionPointId);
		this.playbackInstanceCount++;
	};

	// Utility to retrieve CSS styles, based on QuirksMode.
	this.fetchComputedStyle = function(targetNode, stylePropertyIdentifier) {
		var computedValue;
		if (targetNode.currentStyle) {
			computedValue = targetNode.currentStyle[stylePropertyIdentifier];
		} else {
			computedValue = document.defaultView.getComputedStyle(targetNode, null).getPropertyValue(stylePropertyIdentifier);
		}
		return computedValue;
	};

	// Converts RGB color components to a hexadecimal string.
	this.hexifyColor = function(redVal, greenVal, blueVal) {
		var decimalColorCode = redVal + 256 * greenVal + 65536 * blueVal;
		return decimalColorCode.toString(16);
	};

	// Custom DOM element selection function based on CSS selectors.
	// Adapted from http://www.openjs.com/scripts/dom/css_selector/
	this.queryDomElements = function(compositeSelectors) {
		var matchedNodes = [];
		if (!document.getElementsByTagName) return matchedNodes;
		compositeSelectors = compositeSelectors.replace(/\s*([^\w])\s*/g, "$1"); // Remove extra whitespace.
		var individualSelectors = compositeSelectors.split(",");

		// Internal helper to find elements by tag within a given context.
		var retrieveMatchingElements = function(scopeNodes, tagNameFilter) {
			if (!tagNameFilter) tagNameFilter = '*';
			var collectionFound = [];
			for (var outerIdx = 0, lenA = scopeNodes.length; currentContextNode = scopeNodes[outerIdx], outerIdx < lenA; outerIdx++) {
				var elementsFromTag;
				if (tagNameFilter === '*') elementsFromTag = currentContextNode.all ? currentContextNode.all : currentContextNode.getElementsByTagName("*");
				else elementsFromTag = currentContextNode.getElementsByTagName(tagNameFilter);

				for (var innerIdx = 0, lenB = elementsFromTag.length; innerIdx < lenB; innerIdx++) collectionFound.push(elementsFromTag[innerIdx]);
			}
			return collectionFound;
		};

		SELECTOR_LOOP:
			for (var loopIdx = 0, len1 = individualSelectors.length; selector = individualSelectors[loopIdx], loopIdx < len1; loopIdx++) {
				var currentContext = [document];
				var selectorParts = selector.split(" ");

				PART_LOOP:
					for (var partIdx = 0, len2 = selectorParts.length; currentPart = selectorParts[partIdx], partIdx < len2; partIdx++) {
						// Check for ID selector, ensuring it's not part of an attribute selector.
						var openBracketPos = currentPart.indexOf("[");
						var closeBracketPos = currentPart.indexOf("]");
						var hashPosition = currentPart.indexOf("#"); // ID
						if (hashPosition + 1 && !(hashPosition > openBracketPos && hashPosition < closeBracketPos)) {
							var componentSegments = currentPart.split("#");
							var tagPrefix = componentSegments[0];
							var elementIdentifier = componentSegments[1];
							var foundElement = document.getElementById(elementIdentifier);
							if (!foundElement || (tagPrefix && foundElement.nodeName.toLowerCase() !== tagPrefix)) { // Specified element not found or tag mismatch.
								continue SELECTOR_LOOP;
							}
							currentContext = [foundElement];
							continue PART_LOOP;
						}

						// Check for Class selector.
						hashPosition = currentPart.indexOf("."); // Class
						if (hashPosition + 1 && !(hashPosition > openBracketPos && hashPosition < closeBracketPos)) {
							var componentSegments = currentPart.split('.');
							var tagPrefix = componentSegments[0];
							var cssClassName = componentSegments[1];

							var collectionFound = retrieveMatchingElements(currentContext, tagPrefix);
							currentContext = [];
							for (var loopC = 0, lenC = collectionFound.length; foundNode = collectionFound[loopC], loopC < lenC; loopC++) {
								if (foundNode.className && foundNode.className.match(new RegExp('(^|\\s)' + cssClassName + '(\\s|$)'))) currentContext.push(foundNode);
							}
							continue PART_LOOP;
						}

						// Check for Attribute selectors (CSS3 style).
						if (currentPart.indexOf('[') + 1) {
							if (currentPart.match(/^(\w*)\[(\w+)([=~\|\^\$\*]?)=?['"]?([^\]'"]*)['"]?\]$/)) {
								var tagPrefix = RegExp.$1;
								var attributeName = RegExp.$2;
								var comparisonOperator = RegExp.$3;
								var attributeValue = RegExp.$4;
							}
							var collectionFound = retrieveMatchingElements(currentContext, tagPrefix);
							currentContext = [];
							for (var loopC = 0, lenC = collectionFound.length; foundNode = collectionFound[loopC], loopC < lenC; loopC++) {
								if (comparisonOperator === '=' && foundNode.getAttribute(attributeName) !== attributeValue) continue;
								if (comparisonOperator === '~' && !foundNode.getAttribute(attributeName).match(new RegExp('(^|\\s)' + attributeValue + '(\\s|$)'))) continue;
								if (comparisonOperator === '|' && !foundNode.getAttribute(attributeName).match(new RegExp('^' + attributeValue + '-?'))) continue;
								if (comparisonOperator === '^' && foundNode.getAttribute(attributeName).indexOf(attributeValue) !== 0) continue;
								if (comparisonOperator === '$' && foundNode.getAttribute(attributeName).lastIndexOf(attributeValue) !== (foundNode.getAttribute(attributeName).length - attributeValue.length)) continue;
								if (comparisonOperator === '*' && !(foundNode.getAttribute(attributeName).indexOf(attributeValue) + 1)) continue;
								else if (!foundNode.getAttribute(attributeName)) continue;
								currentContext.push(foundNode);
							}

							continue PART_LOOP;
						}

						// Default to Tag selectors if no ID, Class, or Attribute specified.
						var collectionFound = retrieveMatchingElements(currentContext, currentPart);
						currentContext = collectionFound;
					}
				for (var finalIdx = 0, lenFinal = currentContext.length; finalIdx < lenFinal; finalIdx++) matchedNodes.push(currentContext[finalIdx]);
			}
		return matchedNodes;
	};


	/*
	 * Helper methods for DOM manipulation.
	 */

	this.elementHasClass = function(targetNode, classNameString) {
		return targetNode.className.match(new RegExp('(^|\\s)' + classNameString + '(\\s|$)'));
	};

	this.addElementClass = function(targetNode, classNameString) {
		if (!this.elementHasClass(targetNode, classNameString)) targetNode.className += " " + classNameString;
	};

	this.removeElementClass = function(targetNode, classNameString) {
		if (this.elementHasClass(targetNode, classNameString)) {
			var regexToRemove = new RegExp('(^|\\s)' + classNameString + '(\\s|$)');
			targetNode.className = targetNode.className.replace(regexToRemove, ' ');
		}
	};

	/*
	 * Event handling utilities.
	 */

	// Ensures a function runs after the DOM is fully loaded.
	this.domContentLoaded = function(callbackFunction) {
		var previousLoadHandler = window.onload;
		if (typeof window.onload !== 'function') {
			window.onload = callbackFunction;
		} else {
			window.onload = function() {
				if (previousLoadHandler) {
					previousLoadHandler();
				}
				callbackFunction();
			};
		}
	};
}