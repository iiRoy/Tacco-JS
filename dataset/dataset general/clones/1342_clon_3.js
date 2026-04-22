/*
	Identity Selection Module
	Based on OpenID Selector (http://code.google.com/p/openid-selector/)
	Licensed under the New BSD License.
	This code has been extensively refactored and modified to demonstrate Type III code cloning.
*/

// Global storage for authentication provider configurations
var authProvidersConfiguration;
// The main identity selector object
var identitySelector;

(function ($) {
	// Ensure jQuery is available before proceeding.
	if (typeof $ === 'undefined') {
		console.error("jQuery is not loaded. Identity Selector cannot initialize.");
		return;
	}

	identitySelector = {
		// Private configuration settings for the selector instance
		_settings: {
			libVersion: '2.0-alpha', // Module version identifier
			isDemoModeActive: false, // Flag to indicate if demonstration mode is enabled
			demoMessage: "Demo mode activated. The final URL would be:", // Message for demo mode alerts
			cookieValidityMonths: 6, // Duration for which the provider selection cookie remains valid
			cookieKey: 'selected_auth_provider', // Name of the cookie storing the last chosen provider
			cookieBaseUrl: '/', // Path for the cookie
			imageAssetPath: '/Assets/images/auth_icons/', // Base path for provider images
			currentLocale: 'en-US', // Current localization setting (e.g., from an external script)
			spriteVariant: 'en-US', // Sprite sheet variant, usually matches locale
			submitButtonLabel: 'Continue', // Text displayed on the form's submit button
			renderAllSmall: false, // Force all provider icons to be rendered in small size
			disableSpriteImages: false, // If true, individual images are used instead of sprites
			imageTooltipPattern: 'Login with {provider}', // Pattern for provider image tooltips
			targetInputFieldId: null, // ID of the hidden input field to populate with the OpenID URL
			selectedProviderUrl: null, // URL of the currently selected OpenID provider
			selectedProviderKey: null // Key of the currently selected provider
		},

		// Internal utility methods
		_utils: {
			// Checks if a string is null, undefined, or empty
			isEmptyString: function(str) {
				return str === null || str === undefined || (typeof str === 'string' && str.trim() === '');
			},

			// Generates a unique ID for dynamic elements
			generateUniqueId: function(prefix = 'dyn_') {
				return prefix + Math.random().toString(36).substr(2, 9);
			}
		},

		/**
		 * Initializes the identity selector component.
		 * Sets up provider buttons and handles initial state from cookies.
		 *
		 * @param {string} inputElementId - The ID of the hidden input field where the final OpenID URL will be placed.
		 * @returns {void}
		 */
		initializeSelector: function(inputElementId) {
			const config = this._settings;
			const _self = this; // Capture 'this' for event handlers

			if (this._utils.isEmptyString(inputElementId)) {
				console.error("Initialization failed: A target input field ID must be provided.");
				return;
			}
			config.targetInputFieldId = inputElementId;

			// Aggregate provider data from external sources.
			// Assuming 'majorIdentityProviders' and 'minorIdentityProviders' are globally available.
			if (typeof majorIdentityProviders !== 'object' || majorIdentityProviders === null) {
				console.warn("Global 'majorIdentityProviders' not found or invalid. Using empty object.");
				majorIdentityProviders = {};
			}
			if (typeof minorIdentityProviders !== 'object' || minorIdentityProviders === null) {
				console.warn("Global 'minorIdentityProviders' not found or invalid. Using empty object.");
				minorIdentityProviders = {};
			}
			authProvidersConfiguration = $.extend({}, majorIdentityProviders, minorIdentityProviders);
			
			const providerButtonsContainer = $('#identity_selector_buttons');
			const inputSection = $('#identity_input_section');

			// Display the main selection area.
			$('#identity_selection_area').show();
			inputSection.empty(); // Clear any previous dynamic input elements.

			let currentProviderIndex = 0; // Counter for sprite positioning

			// Add buttons for large providers
			// Changed from `for (id in providers_large)` to `Object.keys().forEach` for better iteration control
			Object.keys(majorIdentityProviders).forEach(providerKey => {
				const details = majorIdentityProviders[providerKey];
				const displaySize = config.renderAllSmall ? 'small' : 'large';
				const buttonMarkup = _self.generateProviderButtonMarkup(providerKey, details, displaySize, currentProviderIndex++);
				providerButtonsContainer.append(buttonMarkup);
			});

			// Add buttons for small providers, if any exist.
			if (Object.keys(minorIdentityProviders).length > 0) {
				providerButtonsContainer.append('<div class="separator_line"></div>'); // Added a separator
				Object.keys(minorIdentityProviders).forEach(providerKey => {
					const details = minorIdentityProviders[providerKey];
					const buttonMarkup = _self.generateProviderButtonMarkup(providerKey, details, 'small', currentProviderIndex++);
					providerButtonsContainer.append(buttonMarkup);
				});
			}

			// Attach event listener to the form for submission
			$('#identity_auth_form').on('submit', function(e) {
				return _self.processSubmission.call(_self, e); // Ensure 'this' context is correct
			});

			// Use event delegation for provider button clicks
			providerButtonsContainer.on('click', '.auth_provider_btn', function(event) {
				event.preventDefault(); // Prevent default anchor behavior
				const clickedProviderKey = $(this).data('provider-key');
				_self.handleProviderSelection(clickedProviderKey, false);
			});

			// Read cookie and pre-select a provider if found
			const lastSelectedKey = this.retrieveSelectionCookie();
			if (lastSelectedKey) {
				this.handleProviderSelection(lastSelectedKey, true); // `true` for initial load
			}
		},

		/**
		 * Generates the HTML markup for a single provider button.
		 * This function uses template literals for cleaner string construction.
		 *
		 * @param {string} providerIdentifier - Unique ID of the provider.
		 * @param {object} providerDetails - Object containing provider information (name, etc.).
		 * @param {string} displaySize - 'small' or 'large' for icon sizing.
		 * @param {number} spriteIndex - Index for calculating background position in a sprite sheet.
		 * @returns {string} HTML string for the button.
		 */
		generateProviderButtonMarkup: function(providerIdentifier, providerDetails, displaySize, spriteIndex) {
			const config = this._settings;
			const tooltip = config.imageTooltipPattern.replace('{provider}', providerDetails["name"]);
			const baseClass = `${providerIdentifier} auth_provider_btn provider_${displaySize}_icon`;

			if (config.disableSpriteImages) {
				// Use individual images
				const imageFileExtension = (displaySize === 'small') ? '.ico.gif' : '.gif';
				const imageUrl = `${config.imageAssetPath}images.${displaySize}/${providerIdentifier}${imageFileExtension}`;
				return `<a title="${tooltip}" href="#" data-provider-key="${providerIdentifier}"
								style="background: #FFF url(${imageUrl}) no-repeat center center;"
								class="${baseClass}"></a>`;
			}

			// Use sprite images
			const backgroundOffsetX = (displaySize === 'small') ? -(spriteIndex * 24) : -(spriteIndex * 100);
			// Changed Y-offset for small icons to be more distinct or aligned differently
			const backgroundOffsetY = (displaySize === 'small') ? -72 : 0; // Adjusted from -60 to -72

			const spriteImageUrl = `${config.imageAssetPath}openid-providers-${config.spriteVariant}.png`;
			return `<a title="${tooltip}" href="#" data-provider-key="${providerIdentifier}"
							style="background: #FFF url(${spriteImageUrl}) no-repeat ${backgroundOffsetX}px ${backgroundOffsetY}px;"
							class="${baseClass}"></a>`;
		},

		/**
		 * Handles the selection of an identity provider.
		 * Updates UI, sets cookie, and prepares for form submission.
		 *
		 * @param {string} selectedProviderKey - The key of the selected provider.
		 * @param {boolean} isInitialLoad - True if called during page load (e.g., from cookie read).
		 * @returns {void}
		 */
		handleProviderSelection: function(selectedProviderKey, isInitialLoad) {
			const config = this._settings;
			const currentProviderDetails = authProvidersConfiguration[selectedProviderKey];

			// Guard clause: If provider details are not found, log error and exit.
			if (!currentProviderDetails) {
				console.warn(`Attempted to select unknown provider: ${selectedProviderKey}`);
				return;
			}

			this.applyHighlightEffect(selectedProviderKey);
			this.storeSelectionCookie(selectedProviderKey);

			config.selectedProviderKey = selectedProviderKey;
			config.selectedProviderUrl = currentProviderDetails['url'];

			// Check if user input is required for this provider.
			if (currentProviderDetails['label']) {
				this.displayDynamicInputField(currentProviderDetails);
			} else {
				$('#identity_input_section').empty(); // Clear any existing input fields.
				if (!isInitialLoad) {
					// Automatically submit the form if no input is needed and it's not an initial page load.
					$('#identity_auth_form').submit();
				}
			}
		},

		/**
		 * Processes the form submission.
		 * Validates and constructs the final OpenID URL.
		 *
		 * @param {Event} event - The form submission event.
		 * @returns {boolean} True to allow form submission, false to prevent it.
		 */
		processSubmission: function(event) {
			const config = this._settings;
			let finalRedirectUrl = config.selectedProviderUrl;

			if (this._utils.isEmptyString(finalRedirectUrl)) {
				console.warn("No provider URL selected for submission.");
				return false; // Prevent submission if no URL is set
			}

			// Replace placeholder for username if present.
			// Changed selector from #openid_username to #user_credential_input
			const usernameInput = $('#user_credential_input');
			if (usernameInput.length && finalRedirectUrl.includes('{username}')) {
				finalRedirectUrl = finalRedirectUrl.replace('{username}', usernameInput.val());
			}
			
			// Set the final URL into the hidden input field.
			this.assignOpenIdUrlToField(finalRedirectUrl);

			if (config.isDemoModeActive) {
				event.preventDefault(); // Prevent actual form submission in demo mode
				alert(`${config.demoMessage}\n${document.getElementById(config.targetInputFieldId).value}`);
				return false;
			}

			// Handle 'javascript:' scheme URLs (use with caution, potentially unsafe)
			if (finalRedirectUrl.startsWith("javascript:")) {
				event.preventDefault(); // Prevent standard form submission
				const jsCode = finalRedirectUrl.substring("javascript:".length);
				try {
					// Using an indirect eval to avoid direct eval scope issues, though still eval.
					(0, eval)(jsCode);
				} catch (e) {
					console.error("Error executing JavaScript URL:", e);
				}
				return false;
			}
			
			return true; // Allow standard form submission
		},

		/**
		 * Sets the final OpenID URL into the designated hidden input field.
		 *
		 * @param {string} url - The OpenID URL to set.
		 * @returns {void}
		 */
		assignOpenIdUrlToField: function(url) {
			const config = this._settings;
			const targetElement = $('#' + config.targetInputFieldId);

			if (targetElement.length) {
				targetElement.val(url);
			} else {
				// If the element doesn't exist, create it and append to the form.
				// Using unique ID for the input to avoid conflicts if `config.targetInputFieldId` is not truly unique.
				const uniqueInputId = this._utils.generateUniqueId('oid_hidden_');
				$('#identity_auth_form').append(
					`<input type="hidden" id="${config.targetInputFieldId}" name="${config.targetInputFieldId}" value="${url}"/>`
				);
				console.log(`Created hidden input field '${config.targetInputFieldId}' with value: ${url}`);
			}
		},

		/**
		 * Applies a visual highlight effect to the selected provider button.
		 *
		 * @param {string} providerKeyToHighlight - The key of the provider to highlight.
		 * @returns {void}
		 */
		applyHighlightEffect: function(providerKeyToHighlight) {
			// Remove any existing highlight wrapper
			$('#selection_highlight_wrapper').children().unwrap();

			// Find the target button and wrap it to apply the highlight
			$(`.auth_provider_btn.${providerKeyToHighlight}`).wrap('<div id="selection_highlight_wrapper"></div>');
		},

		/**
		 * Stores the selected provider key in a cookie.
		 *
		 * @param {string} value - The provider key to store.
		 * @returns {void}
		 */
		storeSelectionCookie: function(value) {
			const config = this._settings;
			const expirationDate = new Date();
			// Calculate expiration based on months, then convert to milliseconds.
			expirationDate.setTime(expirationDate.getTime() + (config.cookieValidityMonths * 30 * 24 * 60 * 60 * 1000));
			const cookieExpiryString = `; expires=${expirationDate.toUTCString()}`; // Changed to toUTCString

			// Ensure the value is URI-encoded for safety
			document.cookie = `${config.cookieKey}=${encodeURIComponent(value)}${cookieExpiryString}; path=${config.cookieBaseUrl}`;
		},

		/**
		 * Reads the stored provider key from a cookie.
		 *
		 * @returns {string|null} The stored provider key, or null if not found.
		 */
		retrieveSelectionCookie: function() {
			const config = this._settings;
			const cookieNamePrefix = `${config.cookieKey}=`;
			const cookieArray = document.cookie.split(';');

			for (let i = 0; i < cookieArray.length; i++) {
				let currentCookiePart = cookieArray[i];
				// Trim leading whitespace
				while (currentCookiePart.charAt(0) === ' ') {
					currentCookiePart = currentCookiePart.substring(1);
				}
				// If this part starts with our cookie name, return its decoded value
				if (currentCookiePart.startsWith(cookieNamePrefix)) {
					return decodeURIComponent(currentCookiePart.substring(cookieNamePrefix.length, currentCookiePart.length));
				}
			}
			return null;
		},

		/**
		 * Displays a dynamic input field and submit button for providers requiring user input.
		 *
		 * @param {object} providerDetails - Details of the selected provider.
		 * @returns {void}
		 */
		displayDynamicInputField: function(providerDetails) {
			const config = this._settings;
			const dynamicInputContainer = $('#identity_input_section');
			let generatedHtml = '';
			let inputFieldId = 'user_credential_input'; // Default ID for username
			let initialInputValue = '';
			let inputFieldStyle = '';
			const inputLabelText = providerDetails['label'];

			// Add a label if provided by the provider configuration.
			if (!this._utils.isEmptyString(inputLabelText)) {
				generatedHtml += `<p class="input_label">${inputLabelText}</p>`;
			}

			// Special handling for generic "OpenID" provider, where the OpenID URL itself is input.
			if (providerDetails['name'] === 'OpenID') {
				inputFieldId = config.targetInputFieldId; // Direct input into the target field
				initialInputValue = 'http://';
				// Updated styling to use a modern SVG/icon-font for background if possible, or keep image.
				inputFieldStyle = `background: #FFF url(${config.imageAssetPath}openid-inputicon.svg) no-repeat scroll 5px 50%; padding-left:24px;`;
			}

			// Construct the input field and submit button HTML.
			generatedHtml += `
				<input id="${inputFieldId}" type="text" style="${inputFieldStyle}"
					name="${inputFieldId}" value="${initialInputValue}" placeholder="Enter your identity..." />
				<input id="auth_submit_button" type="submit" value="${config.submitButtonLabel}"/>
			`;
			dynamicInputContainer.empty().append(generatedHtml);

			// Focus the input field for user convenience.
			$('#' + inputFieldId).focus();
		},

		/**
		 * Configures the demonstration mode.
		 *
		 * @param {boolean} enableDemo - True to activate demo mode, false to disable.
		 * @returns {void}
		 */
		configureDemoMode: function(enableDemo) {
			this._settings.isDemoModeActive = !!enableDemo; // Ensure boolean
		},

		/**
		 * Public method to update a specific setting.
		 * @param {string} key - The setting key to update.
		 * @param {*} value - The new value for the setting.
		 */
		updateSetting: function(key, value) {
			if (this._settings.hasOwnProperty(key)) {
				this._settings[key] = value;
			} else {
				console.warn(`Attempted to update non-existent setting: ${key}`);
			}
		}
	};
})(jQuery);