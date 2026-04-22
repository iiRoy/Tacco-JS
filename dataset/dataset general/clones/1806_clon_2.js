var flashEmbedder = function() {

	var NO_VAL = "undefined",
		OBJ_TYPE = "object",
		FLASH_PLUGIN_NAME = "Shockwave Flash",
		FLASH_ACTIVE_X_NAME = "ShockwaveFlash.ShockwaveFlash",
		FLASH_MIME = "application/x-shockwave-flash",
		EXPRESS_INSTALLER_ELEMENT_ID = "SWFObjectExprInst",

		globalWindow = window,
		currentDocument = document,
		browserNavigator = navigator,

		hasPlugin = false,
		registeredObjects = [],
		objectIDs = [],
		cachedAltContent,
		cachedAltContentID,
		cachedCallbackFunction,
		cachedCallbackObject,
		autoDisplayToggle = true,

	/*
	 * Core utility for browser environment details.
	 * Determines browser capabilities and OS specifics.
	 * This module runs immediately for performance.
	 */
	browserInfo = function() {
		var domAvailable = typeof currentDocument.getElementById != NO_VAL && typeof currentDocument.getElementsByTagName != NO_VAL && typeof currentDocument.createElement != NO_VAL,
			userAgentString = browserNavigator.userAgent.toLowerCase(),
			platformString = browserNavigator.platform.toLowerCase(),
			isWindows = platformString ? /win/.test(platformString) : /win/.test(userAgentString),
			isMac = platformString ? /mac/.test(platformString) : /mac/.test(userAgentString),
			webkitVersion = /webkit/.test(userAgentString) ? parseFloat(userAgentString.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : false, // WebKit version or false
			isIE = !+"\v1", // IE detection magic
			currentFlashVersion = [0,0,0],
			pluginDescription = null;

		if (typeof browserNavigator.plugins != NO_VAL && typeof browserNavigator.plugins[FLASH_PLUGIN_NAME] == OBJ_TYPE) {
			pluginDescription = browserNavigator.plugins[FLASH_PLUGIN_NAME].description;
			if (pluginDescription && !(typeof browserNavigator.mimeTypes != NO_VAL && browserNavigator.mimeTypes[FLASH_MIME] && !browserNavigator.mimeTypes[FLASH_MIME].enabledPlugin)) {
				// MimeType check for Safari 3+ plugin enablement
				hasPlugin = true;
				isIE = false; // Overwrite IE flag if non-IE plugin found
				pluginDescription = pluginDescription.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
				currentFlashVersion[0] = parseInt(pluginDescription.replace(/^(.*)\..*$/, "$1"), 10);
				currentFlashVersion[1] = parseInt(pluginDescription.replace(/^.*\.(.*)\s.*$/, "$1"), 10);
				currentFlashVersion[2] = /[a-zA-Z]/.test(pluginDescription) ? parseInt(pluginDescription.replace(/^.*[a-zA-Z]+(.*)$/, "$1"), 10) : 0;
			}
		}
		else if (typeof globalWindow.ActiveXObject != NO_VAL) {
			try {
				var activeXObject = new ActiveXObject(FLASH_ACTIVE_X_NAME);
				if (activeXObject) { // Object might be null if ActiveX is disabled
					pluginDescription = activeXObject.GetVariable("$version");
					if (pluginDescription) {
						isIE = true; // Confirm IE
						pluginDescription = pluginDescription.split(" ")[1].split(",");
						currentFlashVersion = [parseInt(pluginDescription[0], 10), parseInt(pluginDescription[1], 10), parseInt(pluginDescription[2], 10)];
					}
				}
			}
			catch(err) {}
		}
		return { w3:domAvailable, pv:currentFlashVersion, wk:webkitVersion, ie:isIE, win:isWindows, mac:isMac };
	}()

	/*
	 * Primary function to be invoked once the DOM is ready.
	 * Falls back to window.onload if necessary.
	 */
	function initializeEmbedder() {
		if (hasPlugin) { verifyFlashPlayer(); }
		else { matchVersions(); } // Placeholder, original SWFObject had more logic here
	}

	/*
	 * Determines the Flash Player version for non-IE browsers.
	 * This method is more accurate than checking navigator.plugins.
	 * It relies on DOM availability.
	 */
	function verifyFlashPlayer() {
		var documentBody = currentDocument.getElementsByTagName("body")[0];
		var tempObject = createDomElement(OBJ_TYPE);
		tempObject.setAttribute("type", FLASH_MIME);
		var testElement = documentBody.appendChild(tempObject);
		if (testElement) {
			var retryCount = 0;
			(function(){
				if (typeof testElement.GetVariable != NO_VAL) {
					var desc = testElement.GetVariable("$version");
					if (desc) {
						desc = desc.split(" ")[1].split(",");
						browserInfo.pv = [parseInt(desc[0], 10), parseInt(desc[1], 10), parseInt(desc[2], 10)];
					}
				}
				else if (retryCount < 10) {
					retryCount++;
					setTimeout(arguments.callee, 10);
					return;
				}
				documentBody.removeChild(tempObject);
				testElement = null;
				matchVersions(); // Placeholder, original SWFObject had more logic here
			})();
		}
		else {
			matchVersions(); // Placeholder
		}
	}


	/*
	 * Creates a Flash object dynamically across browsers.
	 */
	function constructFlashObject(attributesData, parametersData, targetElementId) {
		var resultObject, targetElement = getDomElementById(targetElementId);
		if (browserInfo.wk && browserInfo.wk < 312) { return resultObject; } // Older WebKit versions might have issues
		if (targetElement) {
			if (typeof attributesData.id == NO_VAL) {
				// Inherit ID from the alternative content if not specified
				attributesData.id = targetElementId;
			}
			if (browserInfo.ie && browserInfo.win) { // Special handling for Internet Explorer on Windows
				var attributeString = "";
				for (var attrKey in attributesData) {
					if (attributesData[attrKey] != Object.prototype[attrKey]) { // Filter out prototype chain properties
						if (attrKey.toLowerCase() == "data") {
							parametersData.movie = attributesData[attrKey];
						}
						else if (attrKey.toLowerCase() == "styleclass") { // 'class' is a reserved keyword
							attributeString += ' class="' + attributesData[attrKey] + '"';
						}
						else if (attrKey.toLowerCase() != "classid") {
							attributeString += ' ' + attrKey + '="' + attributesData[attrKey] + '"';
						}
					}
				}
				var parameterString = "";
				for (var paramKey in parametersData) {
					if (parametersData[paramKey] != Object.prototype[paramKey]) { // Filter prototype properties
						parameterString += '<param name="' + paramKey + '" value="' + parametersData[paramKey] + '" />';
					}
				}
				targetElement.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + attributeString + '>' + parameterString + '</object>';
				objectIDs[objectIDs.length] = attributesData.id; // Store ID for cleanup on unload
				resultObject = getDomElementById(attributesData.id);
			}
			else { // Standard-compliant browsers
				var newObjectElement = createDomElement(OBJ_TYPE);
				newObjectElement.setAttribute("type", FLASH_MIME);
				for (var attrKey2 in attributesData) {
					if (attributesData[attrKey2] != Object.prototype[attrKey2]) { // Filter prototype properties
						if (attrKey2.toLowerCase() == "styleclass") {
							newObjectElement.setAttribute("class", attributesData[attrKey2]);
						}
						else if (attrKey2.toLowerCase() != "classid") { // IE-specific attribute, ignore for others
							newObjectElement.setAttribute(attrKey2, attributesData[attrKey2]);
						}
					}
				}
				for (var paramKey2 in parametersData) {
					if (parametersData[paramKey2] != Object.prototype[paramKey2] && paramKey2.toLowerCase() != "movie") { // Filter prototype properties and IE-specific param
						appendObjectParameter(newObjectElement, paramKey2, parametersData[paramKey2]);
					}
				}
				targetElement.parentNode.replaceChild(newObjectElement, targetElement);
				resultObject = newObjectElement;
			}
		}
		return resultObject;
	}

	function appendObjectParameter(parentElem, paramName, paramValue) {
		var paramElem = createDomElement("param");
		paramElem.setAttribute("name", paramName);
		paramElem.setAttribute("value", paramValue);
		parentElem.appendChild(paramElem);
	}

	/*
	 * Dummy function for version matching.
	 * Original SWFObject had a full `matchVersions` function here.
	 */
	function matchVersions() { /* No operation needed in this modified version */ }

	/*
	 * Retrieves a DOM element by its ID.
	 * Includes error handling.
	 */
	function getDomElementById(elementIdentifier) {
		var foundElement = null;
		try {
			foundElement = currentDocument.getElementById(elementIdentifier);
		}
		catch (err) {}
		return foundElement;
	}

	/*
	 * Creates a new DOM element.
	 */
	function createDomElement(tagName) {
		return currentDocument.createElement(tagName);
	}

	/*
	 * Compares the installed Flash Player version with a required version.
	 */
	function checkPlayerCompatibility(requiredVersionString) {
		var installedVersion = browserInfo.pv, requiredVersionArray = requiredVersionString.split(".");
		requiredVersionArray[0] = parseInt(requiredVersionArray[0], 10);
		requiredVersionArray[1] = parseInt(requiredVersionArray[1], 10) || 0; // Support short notation (e.g., "9")
		requiredVersionArray[2] = parseInt(requiredVersionArray[2], 10) || 0;
		return (installedVersion[0] > requiredVersionArray[0] || (installedVersion[0] == requiredVersionArray[0] && installedVersion[1] > requiredVersionArray[1]) || (installedVersion[0] == requiredVersionArray[0] && installedVersion[1] == requiredVersionArray[1] && installedVersion[2] >= requiredVersionArray[2])) ? true : false;
	}


	/*
	 * Encodes a URL string if it contains unsafe characters.
	 */
	function safeUrlEncode(inputString) {
		var unsafeCharRegex = /[\\\"<>\.;]/;
		var containsForbiddenChars = unsafeCharRegex.exec(inputString) != null;
		return containsForbiddenChars && typeof encodeURIComponent != NO_VAL ? encodeURIComponent(inputString) : inputString;
	}

	return {
		/*
		 * Public interface for embedding Flash content.
		 * See official documentation for usage.
		 */

		placeFlashContent: function(contentUrl, targetId, desiredWidth, desiredHeight, minVersion, flashVariables, objectParameters, objectAttributes, completionCallback) {
			var resultObjectInfo = {success:false, id:targetId};
			if (browserInfo.w3 && !(browserInfo.wk && browserInfo.wk < 312) && contentUrl && targetId && desiredWidth && desiredHeight && minVersion) {
              desiredWidth += ""; // Ensure string type
              desiredHeight += "";
              var attributesCopy = {};
              if (objectAttributes && typeof objectAttributes === OBJ_TYPE) {
                for (var attrProp in objectAttributes) { // Deep copy to prevent reference issues
                  attributesCopy[attrProp] = objectAttributes[attrProp];
                }
              }
              attributesCopy.data = contentUrl;
              attributesCopy.width = desiredWidth;
              attributesCopy.height = desiredHeight;
              var parametersCopy = {};
              if (objectParameters && typeof objectParameters === OBJ_TYPE) {
                for (var paramProp in objectParameters) { // Deep copy
                  parametersCopy[paramProp] = objectParameters[paramProp];
                }
              }
              if (flashVariables && typeof flashVariables === OBJ_TYPE) {
                for (var flashVarProp in flashVariables) { // Append flashvars
                  if (typeof parametersCopy.flashvars != NO_VAL) {
                    parametersCopy.flashvars += "&" + flashVarProp + "=" + flashVariables[flashVarProp];
                  }
                  else {
                    parametersCopy.flashvars = flashVarProp + "=" + flashVariables[flashVarProp];
                  }
                }
              }
              if (checkPlayerCompatibility(minVersion)) { // Create the Flash object
                var createdObject = constructFlashObject(attributesCopy, parametersCopy, targetId);
                resultObjectInfo.success = true;
                resultObjectInfo.ref = createdObject;
              }
              if (completionCallback) { completionCallback(resultObjectInfo); }
			}
			else if (completionCallback) { completionCallback(resultObjectInfo); }
		},

		browserInfo: browserInfo,

		fetchPlayerVersion: function() {
			return { major:browserInfo.pv[0], minor:browserInfo.pv[1], release:browserInfo.pv[2] };
		},

		checkPlayerCompatibility: checkPlayerCompatibility,

		buildFlashObject: function(attributesData, parametersData, targetElementId) {
			if (browserInfo.w3) {
				return constructFlashObject(attributesData, parametersData, targetElementId);
			}
			else {
				return undefined;
			}
		},

		retrieveQueryParameter: function(parameterName) {
			var queryString = currentDocument.location.search || currentDocument.location.hash;
			if (queryString) {
				if (/\?/.test(queryString)) { queryString = queryString.split("?")[1]; } // Remove leading question mark
				if (parameterName == null) {
					return safeUrlEncode(queryString);
				}
				var queryPairs = queryString.split("&");
				for (var pairIndex = 0; pairIndex < queryPairs.length; pairIndex++) {
					if (queryPairs[pairIndex].substring(0, queryPairs[pairIndex].indexOf("=")) == parameterName) {
						return safeUrlEncode(queryPairs[pairIndex].substring((queryPairs[pairIndex].indexOf("=") + 1)));
					}
				}
			}
			return "";
		}
	};
}();