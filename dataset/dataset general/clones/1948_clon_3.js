(function (jq, swiff) {
	// Utility function: Converts an object's string/number properties into HTML attribute key-value pairs.
	// This helper is crucial for constructing the <object> tag's attributes dynamically.
	var generateAttributesString = function (componentSettings) {
		const attributePairs = []; // Array to store individual attribute strings (e.g., 'id="myId"')
		let currentAttributeKey; // Loop variable for iterating object keys

		// Iterate over all enumerable properties of the provided settings object.
		for (currentAttributeKey in componentSettings) {
			// Validate property: must be directly on the object (not prototype) and its value
			// must be a non-empty string or number.
			const propertyValue = componentSettings[currentAttributeKey];
			if (Object.prototype.hasOwnProperty.call(componentSettings, currentAttributeKey) &&
				(typeof propertyValue === 'string' || typeof propertyValue === 'number') &&
				String(propertyValue).trim() !== '') { // Ensure value is not just whitespace
				// Construct the attribute string and add it to our collection.
				attributePairs.push(`${currentAttributeKey}="${propertyValue}"`);
			}
		}

		// Join all collected attribute strings with a space to form a complete attribute list for HTML.
		return attributePairs.join(' ');
	};

	// Utility function: Transforms an object into a series of HTML <param> tags for Flash objects.
	// This includes special handling for nested objects like 'flashvars'.
	var composeParametersString = function (parameterConfiguration) {
		const parameterChunks = []; // Array to hold generated <param> tag strings
		let primaryKey; // Iterator for top-level parameters
		let nestedParameterKey; // Iterator for nested parameters (e.g., within flashvars)

		// Guard clause: Ensure the input is a valid object before proceeding.
		if (typeof parameterConfiguration !== 'object' || parameterConfiguration === null) {
			return ''; // Return an empty string for invalid input, preventing errors.
		}

		// Iterate through the main parameter configuration object.
		for (primaryKey in parameterConfiguration) {
			// Skip properties from the prototype chain.
			if (!Object.prototype.hasOwnProperty.call(parameterConfiguration, primaryKey)) {
				continue;
			}

			let parameterValue = parameterConfiguration[primaryKey];

			// If a parameter value is itself an object, we assume it's a collection of sub-parameters
			// that need to be encoded and joined (typical for 'flashvars').
			if (typeof parameterValue === 'object' && parameterValue !== null) {
				const encodedNestedParams = []; // Stores encoded key=value pairs for nested parameters
				for (nestedParameterKey in parameterValue) {
					if (Object.prototype.hasOwnProperty.call(parameterValue, nestedParameterKey)) {
						// Encode the value to be URL-safe and format as 'key=value'.
						encodedNestedParams.push(`${nestedParameterKey}=${encodeURIComponent(parameterValue[nestedParameterKey])}`);
					}
				}
				// Join nested parameters with '&amp;' and assign the result back to the primary key's value.
				parameterValue = encodedNestedParams.join('&amp;');
			}

			// If the resolved parameter value is not empty, create and store a <param> tag.
			if (parameterValue) {
				parameterChunks.push(`<param name="${primaryKey}" value="${parameterValue}" />`);
			}
		}
		// Join all generated <param> tag strings to form the complete parameters block.
		return parameterChunks.join('');
	};

	// Internal flag to indicate if the Flash Express Install wizard is currently active.
	// This prevents multiple simultaneous express install attempts.
	let isExpressInstallerActive = false;

	// Define frequently used string literals or constants for maintainability.
	const DEFAULT_PLAYER_VERSION_STRING = '0,0,0';
	const JOIN_ARRAY_METHOD = 'join'; // Reference to the array join method name.

	// The main SWIFF object, attached to the jQuery namespace.
	// This IIFE (Immediately Invoked Function Expression) encapsulates the Flash detection logic.
	jq[swiff] = (function () {
		let detectedPlayerVersionStr = DEFAULT_PLAYER_VERSION_STRING;
		let flashPluginDetector = null; // Will hold either ActiveXObject or a navigator.plugins entry.
		let isPlayerAvailable = false;
		let isUsingActiveXControl = false;
		let parsedVersion = { verMajor: 0, verMinor: 0, verRevision: 0 }; // Structured version info.

		try {
			// Attempt to detect Flash Player version.
			// First, try standard browser plugins (for Netscape-style browsers like Chrome, Firefox).
			flashPluginDetector = navigator.plugins['Shockwave Flash'];

			if (flashPluginDetector) {
				detectedPlayerVersionStr = flashPluginDetector.description || DEFAULT_PLAYER_VERSION_STRING;
			} else {
				// If not found as a plugin, try ActiveXObject (primarily for Internet Explorer).
				try {
					flashPluginDetector = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
					// ActiveX objects expose version via GetVariable('$version').
					detectedPlayerVersionStr = flashPluginDetector.GetVariable('$version') || DEFAULT_PLAYER_VERSION_STRING;
					isUsingActiveXControl = true; // Mark as ActiveX if this path succeeds.
				} catch (ieDetectionError) {
					// IE detection failed, likely no ActiveX or security restrictions.
					// console.debug("ActiveX Flash detection failed:", ieDetectionError.message); // Optional: for debugging.
				}
			}
		} catch (generalDetectionError) {
			// Catch any other general errors during the detection process.
			// console.error("General Flash detection error:", generalDetectionError.message); // Optional: for debugging.
		}

		// Regular expression to parse the version string into major, minor, and revision components.
		// Handles formats like "Shockwave Flash 10.3 r183" or "10,0,32,18".
		const versionParsingRegex = /^[A-Za-z\s]*?(\d+)[\.|,](\d+)(?:\s+[d|r]|,)(\d+)/;
		const versionMatchResult = detectedPlayerVersionStr.match(versionParsingRegex);

		// If a valid version string was successfully matched and parsed.
		if (versionMatchResult && versionMatchResult.length >= 4) {
			parsedVersion.verMajor = parseInt(versionMatchResult[1], 10);
			parsedVersion.verMinor = parseInt(versionMatchResult[2], 10);
			parsedVersion.verRevision = parseInt(versionMatchResult[3], 10);
			// Player is considered available if the major version is greater than 0.
			isPlayerAvailable = parsedVersion.verMajor > 0;
		}

		// Public API for SWIFF functionality, exposed via jq[swiff].
		return {
			isPlayerPresent: isPlayerAvailable, // Boolean: Is Flash Player detected?
			isUsingActiveX: isUsingActiveXControl, // Boolean: Is ActiveX control being used?
			expressInstallerPath: 'expressInstall.swf', // Default path for the Express Install SWF.

			// Structured object containing the detected player software version.
			playerSoftwareVersion: {
				verMajor: parsedVersion.verMajor,
				verMinor: parsedVersion.verMinor,
				verRevision: parsedVersion.verRevision
			},

			/**
			 * Checks if the detected Flash Player version meets or exceeds a specified minimum version.
			 * @param {string|number[]} requiredVersionInput - The minimum version to check (e.g., "9.0.124" or [9,0,124]).
			 * @returns {boolean} True if the current player version satisfies the required version.
			 */
			meetsMinimumVersion: function (requiredVersionInput) {
				const currentSystemVersion = this.playerSoftwareVersion; // Reference to the current player version.
				let targetVersionArray = [0, 0, 0]; // Default target version for comparison.

				// Normalize the input `requiredVersionInput` into a consistent array format [major, minor, revision].
				if (typeof requiredVersionInput === 'string' || typeof requiredVersionInput === 'number') {
					targetVersionArray = String(requiredVersionInput).split('.').map(num => parseInt(num, 10));
				} else if (Array.isArray(requiredVersionInput)) {
					targetVersionArray = requiredVersionInput.map(num => parseInt(num, 10));
				}

				// Ensure the targetVersionArray always has 3 elements, filling missing parts with 0.
				// This also allows for partial version checks (e.g., "9" becomes [9,0,0]).
				for (let i = 0; i < 3; i++) {
					if (isNaN(targetVersionArray[i])) { // Handle cases where map results in NaN
						targetVersionArray[i] = 0;
					}
				}


				// Perform version comparison logic:
				// 1. Compare major versions.
				if (targetVersionArray[0] < currentSystemVersion.verMajor) {
					return true; // Current player is newer in major version.
				}
				if (targetVersionArray[0] > currentSystemVersion.verMajor) {
					return false; // Current player is older in major version.
				}

				// 2. If major versions are equal, compare minor versions.
				if (targetVersionArray[1] < currentSystemVersion.verMinor) {
					return true; // Current player is newer in minor version.
				}
				if (targetVersionArray[1] > currentSystemVersion.verMinor) {
					return false; // Current player is older in minor version.
				}

				// 3. If major and minor versions are equal, compare revision/release versions.
				// For revision, 'equal or newer' is sufficient.
				return targetVersionArray[2] <= currentSystemVersion.verRevision;
			},

			/**
			 * Generates the HTML string required to embed a Flash SWF object.
			 * This function intelligently switches between normal embedding and Flash Express Install.
			 * @param {object} swfConfiguration - Configuration object defining the SWF properties.
			 * @returns {string|boolean} The full HTML string for the <object> tag, or `false` if creation fails.
			 */
			constructSwiffObject: function (swfConfiguration) {
				// Pre-checks for early exit:
				// - Is Flash Player even present on the system?
				// - Is an Express Install already in progress?
				// - Is the configuration object valid and does it specify a SWF source?
				if (!jq[swiff].isPlayerPresent || isExpressInstallerActive || typeof swfConfiguration !== 'object' || swfConfiguration === null || !swfConfiguration.swf) {
					return false;
				}

				let finalObjectConfiguration = {}; // The configuration object that will be used to build the HTML.
				const mathUtilities = Math; // Alias for Math object for consistency in renaming.

				// Determine if Flash Express Install is required.
				// This happens if a `hasVersion` requirement is specified and the current player doesn't meet it.
				if (swfConfiguration.hasVersion && !jq[swiff].meetsMinimumVersion(swfConfiguration.hasVersion)) {
					// Configure for Flash Express Install.
					finalObjectConfiguration = {
						swf: swfConfiguration.expressInstall || jq[swiff].expressInstallerPath, // Use custom path or default.
						attrs: {
							id: swfConfiguration.id || 'SWFObjectExprInst',
							name: swfConfiguration.name || 'SWFObjectExpressInstall', // Provide a default name if none given.
							// Ensure minimum dimensions for the Express Install dialog.
							height: mathUtilities.max(swfConfiguration.height || 137, 137),
							width: mathUtilities.max(swfConfiguration.width || 214, 214)
						},
						params: {
							flashvars: {
								MMredirectURL: window.location.href, // Redirect back to current page after install.
								MMplayerType: (jq[swiff].isUsingActiveX) ? 'ActiveX' : 'PlugIn',
								MMdoctitle: document.title.slice(0, 47) + ' - Flash Player Installation' // Title for the install window.
							}
						}
					};
					isExpressInstallerActive = true; // Set the flag to prevent re-triggering.
				} else {
					// Configure for normal SWF embedding.
					// Define default attributes and parameters, then deep merge with user-provided configuration.
					const baseAttributes = {
						id: swfConfiguration.id,
						name: swfConfiguration.name,
						height: swfConfiguration.height || 180,
						width: swfConfiguration.width || 320
					};
					const baseParameters = {
						wmode: swfConfiguration.wmode || 'opaque', // Default wmode for better layering.
						flashvars: swfConfiguration.flashvars
					};

					// Perform a deep merge: default attributes/params are extended by `swfConfiguration`.
					// `jq.extend(true, {}, ...)` creates a new object and merges deeply.
					finalObjectConfiguration = jq.extend(true, {}, {
						attrs: baseAttributes,
						params: baseParameters
					}, swfConfiguration);
				}

				// Apply browser-specific attributes/parameters needed for correct embedding.
				if (jq[swiff].isUsingActiveX) {
					// ActiveX objects require a 'classid' and the SWF path in a 'movie' param.
					finalObjectConfiguration.attrs.classid = finalObjectConfiguration.attrs.classid || 'clsid:D27CDB6E-AE6D-11cf-96B8-444553540000';
					finalObjectConfiguration.params.movie = finalObjectConfiguration.params.movie || finalObjectConfiguration.swf;
				} else {
					// Plugin-style objects use 'type' and 'data' attributes.
					finalObjectConfiguration.attrs.type = finalObjectConfiguration.attrs.type || 'application/x-shockwave-flash';
					finalObjectConfiguration.attrs.data = finalObjectConfiguration.attrs.data || finalObjectConfiguration.swf;
				}

				// Assemble and return the complete <object> HTML tag string.
				const objectHtmlParts = [
					'<object ',
					generateAttributesString(finalObjectConfiguration.attrs),
					'>',
					composeParametersString(finalObjectConfiguration.params),
					'</object>'
				];
				return objectHtmlParts[JOIN_ARRAY_METHOD]('');
			}
		};
	}());

	// Extend jQuery's prototype to provide a `swiff` plugin for easily embedding and interacting with Flash objects.
	jq.fn[swiff] = function (pluginOptions) {
		const jqueryContext = this; // Store reference to the jQuery object for chaining and scope.

		// Branch 1: Handle object configuration (for embedding a new SWF object).
		if (typeof pluginOptions === 'object' && pluginOptions !== null) {
			jqueryContext.each(function () {
				const currentDomElement = this; // The current DOM element from the jQuery selection.
				// Create a temporary container element to parse the HTML string safely.
				const transientDiv = document.createElement('div');
				transientDiv.style.display = 'none'; // Keep it hidden during parsing.

				// Generate the full SWF object HTML string using our `constructSwiffObject` API.
				const generatedSwfHtml = jq[swiff].constructSwiffObject(pluginOptions);

				if (generatedSwfHtml) {
					transientDiv.innerHTML = generatedSwfHtml;
					// Append the first child (which should be the <object> tag)
					// of the temporary div to the current DOM element.
					if (transientDiv.firstChild) {
						currentDomElement.appendChild(transientDiv.firstChild);
					}
				}
				// Note: The `transientDiv` will be garbage collected by the browser.
			});
		}
		// Branch 2: Handle function callback (for interacting with existing SWF objects).
		else if (typeof pluginOptions === 'function') {
			// Find all <object> elements within the current jQuery selection and also include
			// the selection itself if it contains <object> elements.
			jqueryContext.find('object').addBack('object').each(function () {
				const targetFlashElement = this; // The current <object> DOM element.
				const interactionRetryDelayProperty = 'swfInteractionTimeoutMs'; // Custom property key for retry delay.
				const singleRetryIncrement = 66; // Milliseconds to add for each retry attempt.
				const maxAccumulatedDelay = 660; // Maximum total delay before giving up.

				// Initialize or increment the retry delay counter for this specific Flash object.
				targetFlashElement[interactionRetryDelayProperty] = (targetFlashElement[interactionRetryDelayProperty] || 0) + singleRetryIncrement;

				// Check if the Flash object is visibly rendered (has client dimensions).
				// This is a heuristic to determine if the SWF is loaded and ready for interaction.
				if (targetFlashElement.clientWidth > 0 || targetFlashElement.clientHeight > 0) {
					// If visible, execute the callback function in the context of the Flash object.
					pluginOptions.call(targetFlashElement);
					// Reset the retry delay counter after a successful interaction.
					targetFlashElement[interactionRetryDelayProperty] = 0;
				} else if (targetFlashElement[interactionRetryDelayProperty] < maxAccumulatedDelay) {
					// If not yet visible and within the retry limit, schedule another attempt.
					setTimeout(
						function () {
							// Re-call the plugin on the specific Flash element to retry interaction.
							jq(targetFlashElement)[swiff](pluginOptions);
						},
						targetFlashElement[interactionRetryDelayProperty] // Use the accumulated delay for the next retry.
					);
				} else {
					// Optional: Log a warning if interaction failed after maximum retries.
					// console.warn("SWF interaction timed out for element after multiple retries:", targetFlashElement);
				}
			});
		}

		return jqueryContext; // Return the original jQuery object for method chaining.
	};
}(jQuery, 'swiff')); // Pass jQuery and the new plugin name 'swiff'.