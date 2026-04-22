/*
	Identity Provider Selection Module
	Developed for simplified authentication flows.

	This software is provided under the Revised BSD License.
*/

var idPServices;

var authSelector;

( function(jQ) {

authSelector = {
	revNum : '1.3', /* Current version identifier */
	testMode : false, // Flag for demonstration environment
	testMessage : null, // Message for demo mode
	cookieDuration : 6 * 30, // Cookie validity in days (6 months).
	cookieId : 'auth_provider_choice', // Unique name for the preference cookie
	cookieLocation : '/', // Path for cookie storage

	assetPath : '/assets/img/', // Base directory for image resources
	languageCode : null, // Set during localization
	iconSprite : null, // Often aligns with languageCode for sprite sheets
	loginButtonText : null, // Text for the authentication submission button
	useSmallIcons : false, // Render all providers with smaller icons
	disableSprite : false, // Opt out of using sprite images
	iconCaption : '{service}', // Template for image tooltip

	targetElementId : null, // ID of the hidden input field for the selected URL
	selectedServiceUrl : null, // URL of the currently chosen identity provider
	selectedServiceId : null, // Identifier of the currently chosen identity provider

	/**
	 * Initializes the authentication selection interface.
	 * 
	 * @param {string} targetInputId ID of the form input to update.
	 * @returns {void}
	 */
	initializePanel : function(targetInputId) {
		idPServices = jQ.extend( {}, majorAuthServices, minorAuthServices );

		var serviceButtonsContainer = jQ('#openid_btns');
		this.targetElementId = targetInputId;

		jQ('#openid_choice').show(); // Display the main selection area
		jQ('#openid_input_area').empty(); // Clear any previous input fields

		var currentButtonIndex = 0; // Counter for button positioning
		// Generate and append buttons for prominent providers
		for ( var serviceKey in majorAuthServices ) {
			var buttonHTML = this.generateButtonMarkup(
				serviceKey,
				majorAuthServices[serviceKey],
				( this.useSmallIcons ? 'small' : 'large' ),
				currentButtonIndex++
			);
			serviceButtonsContainer.append(buttonHTML);
		}

		if ( minorAuthServices ) { // If there are smaller providers
			serviceButtonsContainer.append('<br/>'); // Add a line break for separation
			for ( var serviceKey in minorAuthServices ) {
				var buttonHTML = this.generateButtonMarkup(
					serviceKey,
					minorAuthServices[serviceKey],
					'small', // Always 'small' for minor services
					currentButtonIndex++
				);
				serviceButtonsContainer.append(buttonHTML);
			}
		}

		jQ('#openid_form').submit(this.handleFormSubmission); // Bind form submission event
		var lastSelectedKey = this.retrieveSelection(); // Check for a previously selected provider
		if ( lastSelectedKey ) {
			this.selectService(lastSelectedKey, true); // Re-select the last provider if found
		}
	},

	/**
	 * Creates the HTML markup for a provider button.
	 * 
	 * @param {string} serviceIdentifier The unique ID of the identity provider.
	 * @param {object} serviceDetails Provider configuration details.
	 * @param {string} buttonSize 'small' or 'large' for icon sizing.
	 * @param {number} itemIndex The index of the button in its group for sprite positioning.
	 * @returns {string} The HTML string for the button.
	 */
	generateButtonMarkup : function(serviceIdentifier, serviceDetails, buttonSize, itemIndex) {
		if ( this.disableSprite ) {
			var imageSuffix = buttonSize == 'small' ? '.ico.gif' : '.gif';
			return '<a title="' + this.iconCaption.replace('{service}', serviceDetails["displayName"]) + '" href="javascript:authSelector.selectService(\'' + serviceIdentifier + '\');"'
					+ ' style="background: #FFF url(' + this.assetPath + '../images.' + buttonSize + '/' + serviceIdentifier + imageSuffix + ') no-repeat center center" '
					+ 'class="' + serviceIdentifier + ' auth_' + buttonSize + '_btn"></a>';
		}
		var bgPosX = buttonSize == 'small' ? -itemIndex * 24 : -itemIndex * 100; // X-position for sprite
		var bgPosY = buttonSize == 'small' ? -60 : 0; // Y-position for sprite
		return '<a title="' + this.iconCaption.replace('{service}', serviceDetails["displayName"]) + '" href="javascript:authSelector.selectService(\'' + serviceIdentifier + '\');"'
				+ ' style="background: #FFF url(' + this.assetPath + 'auth-providers-' + this.iconSprite + '.png); background-position: ' + bgPosX + 'px ' + bgPosY + 'px" '
				+ 'class="' + serviceIdentifier + ' auth_' + buttonSize + '_btn"></a>';
	},

	/**
	 * Handles the click event for an identity provider button.
	 * 
	 * @param {string} serviceKeyToSelect The ID of the chosen provider.
	 * @param {boolean} isPageLoad True if called on page load from cookie.
	 * @returns {void}
	 */
	selectService : function(serviceKeyToSelect, isPageLoad) {
		var currentService = idPServices[serviceKeyToSelect];
		if ( !currentService ) {
			return; // Exit if provider not found
		}
		this.markSelected(serviceKeyToSelect); // Visually highlight the chosen provider
		this.storeSelection(serviceKeyToSelect); // Save choice to cookie
		this.selectedServiceId = serviceKeyToSelect;
		this.selectedServiceUrl = currentService['endpointUrl'];

		// Prompt user for additional input if required by provider
		if ( currentService['inputPrompt'] ) {
			this.renderInputField(currentService);
		} else {
			jQ('#openid_input_area').empty(); // Clear any existing input fields
			if ( !isPageLoad ) {
				jQ('#openid_form').submit(); // Automatically submit if no input needed
			}
		}
	},

	/**
	 * Manages the form submission process.
	 * 
	 * @returns {boolean} True if form should proceed, false otherwise.
	 */
	handleFormSubmission : function() {
		var redirectUrl = authSelector.selectedServiceUrl;
		if ( redirectUrl ) {
			// Replace placeholder with user-entered username
			redirectUrl = redirectUrl.replace('{username}', jQ('#authUsernameField').val());
			authSelector.updateAuthUrl(redirectUrl); // Set the final authentication URL
		}

		if ( authSelector.testMode ) {
			alert(authSelector.testMessage + "\r\n" + document.getElementById(authSelector.targetElementId).value);
			return false; // Prevent actual form submission in demo mode
		}

		if ( redirectUrl.indexOf("javascript:") == 0 ) {
			// Execute JavaScript directly if URL starts with "javascript:"
			redirectUrl = redirectUrl.substr("javascript:".length);
			eval(redirectUrl);
			return false; // Prevent form submission
		}
		return true; // Allow form submission
	},

	/**
	 * Sets the final authentication URL in a hidden input field.
	 * 
	 * @param {string} finalAuthUrl The URL to be set.
	 * @returns {void}
	 */
	updateAuthUrl : function(finalAuthUrl) {
		var hiddenInputElem = document.getElementById(this.targetElementId);
		if ( hiddenInputElem != null ) {
			hiddenInputElem.value = finalAuthUrl; // Update existing input
		} else {
			// Create new hidden input if it doesn't exist
			jQ('#openid_form').append('<input type="hidden" id="' + this.targetElementId + '" name="' + this.targetElementId + '" value="' + finalAuthUrl + '"/>');
		}
	},

	/**
	 * Applies a visual highlight to the selected provider button.
	 * 
	 * @param {string} serviceToHighlight The ID of the service to highlight.
	 * @returns {void}
	 */
	markSelected : function(serviceToHighlight) {
		// Remove highlight from any previously selected item.
		var prevHighlightWrapper = jQ('#selectedWrapper');
		if ( prevHighlightWrapper.length ) { // Check if element exists
			prevHighlightWrapper.replaceWith(jQ('#selectedWrapper a')[0]); // Unwrap the old highlight
		}
		// Add new highlight wrapper around the current selection.
		jQ('.' + serviceToHighlight).wrap('<div id="selectedWrapper"></div>');
	},

	/**
	 * Stores the selected provider's ID in a browser cookie.
	 * 
	 * @param {string} cookieValue The ID of the provider to store.
	 * @returns {void}
	 */
	storeSelection : function(cookieValue) {
		var expirationDate = new Date();
		expirationDate.setTime(expirationDate.getTime() + (this.cookieDuration * 24 * 60 * 60 * 1000));
		var cookieExpiresStr = "; expires=" + expirationDate.toGMTString();
		document.cookie = this.cookieId + "=" + cookieValue + cookieExpiresStr + "; path=" + this.cookieLocation;
	},

	/**
	 * Retrieves the ID of the last selected provider from a cookie.
	 * 
	 * @returns {string|null} The provider ID or null if not found.
	 */
	retrieveSelection : function() {
		var cookieNamePrefix = this.cookieId + "=";
		var allCookies = document.cookie.split(';'); // Split all cookies
		for ( var i = 0; i < allCookies.length; i++ ) {
			var currentCookie = allCookies[i];
			while ( currentCookie.charAt(0) == ' ' )
				currentCookie = currentCookie.substring(1, currentCookie.length); // Trim leading spaces
			if ( currentCookie.indexOf(cookieNamePrefix) == 0 )
				return currentCookie.substring(cookieNamePrefix.length, currentCookie.length); // Return the value
		}
		return null; // No cookie found
	},

	/**
	 * Dynamically generates and displays an input field for user credentials.
	 * 
	 * @param {object} serviceConfig Configuration for the selected service.
	 * @returns {void}
	 */
	renderInputField : function(serviceConfig) {
		var dynamicInputContainer = jQ('#openid_input_area');
		var markupContent = '';
		var inputFieldId = 'authUsernameField';
		var initialValue = '';
		var fieldLabel = serviceConfig['inputPrompt'];
		var inputStyle = '';

		if ( fieldLabel ) {
			markupContent = '<p>' + fieldLabel + '</p>'; // Add a descriptive label
		}

		if ( serviceConfig['displayName'] == 'OpenID' ) {
			inputFieldId = this.targetElementId; // Use the main target ID for generic OpenID
			initialValue = 'http://';
			inputStyle = 'background: #FFF url(' + this.assetPath + 'auth-field-icon.gif) no-repeat scroll 0 50%; padding-left:18px;';
		}

		markupContent += '<input id="' + inputFieldId + '" type="text" style="' + inputStyle + '" name="' + inputFieldId + '" value="' + initialValue + '" />'
				+ '<input id="submitAuthButton" type="submit" value="' + this.loginButtonText + '"/>';

		dynamicInputContainer.empty(); // Clear previous input elements
		dynamicInputContainer.append(markupContent); // Insert the new input field and button
		jQ('#' + inputFieldId).focus(); // Set focus to the new input field
	},

	/**
	 * Toggles the demonstration mode for the selector.
	 * 
	 * @param {boolean} isTestEnv True to enable demo mode, false to disable.
	 * @returns {void}
	 */
	configureTestMode : function(isTestEnv) {
		this.testMode = isTestEnv;
	}
};
})(jQuery);


/*
	Identity Provider Data
	Structured information for various authentication services.
	
	This data is licensed under the New BSD License.
*/

var majorAuthServices = {
	google : {
		displayName : 'Google',
		endpointUrl : 'https://www.google.com/accounts/o8/id'
	},
	yahoo : {
		displayName : 'Yahoo',
		endpointUrl : 'http://me.yahoo.com/'
	},
	aol : {
		displayName : 'AOL',
		inputPrompt : 'Enter your AOL screenname.',
		endpointUrl : 'http://openid.aol.com/{username}'
	},
	myopenid : {
		displayName : 'MyOpenID',
		inputPrompt : 'Enter your MyOpenID username.',
		endpointUrl : 'http://{username}.myopenid.com/'
	},
	openid : {
		displayName : 'OpenID',
		inputPrompt : 'Enter your OpenID.',
		endpointUrl : null
	}
};

var minorAuthServices = {
	livejournal : {
		displayName : 'LiveJournal',
		inputPrompt : 'Enter your Livejournal username.',
		endpointUrl : 'http://{username}.livejournal.com/'
	},
	/* flickr_id: {
		displayName: 'Flickr',
		inputPrompt: 'Enter your Flickr username.',
		endpointUrl: 'http://flickr.com/{username}/'
	}, */
	/* tech_blog: {
		displayName: 'Technorati',
		inputPrompt: 'Enter your Technorati username.',
		endpointUrl: 'http://technorati.com/people/technorati/{username}/'
	}, */
	wordpress : {
		displayName : 'Wordpress',
		inputPrompt : 'Enter your Wordpress.com username.',
		endpointUrl : 'http://{username}.wordpress.com/'
	},
	blogger : {
		displayName : 'Blogger',
		inputPrompt : 'Your Blogger account',
		endpointUrl : 'http://{username}.blogspot.com/'
	},
	verisign : {
		displayName : 'Verisign',
		inputPrompt : 'Your Verisign username',
		endpointUrl : 'http://{username}.pip.verisignlabs.com/'
	},
	/* vidoop_id: {
		displayName: 'Vidoop',
		inputPrompt: 'Your Vidoop username',
		endpointUrl: 'http://{username}.myvidoop.com/'
	}, */
	/* launchpad_id: {
		displayName: 'Launchpad',
		inputPrompt: 'Your Launchpad username',
		endpointUrl: 'https://launchpad.net/~{username}'
	}, */
	claimid : {
		displayName : 'ClaimID',
		inputPrompt : 'Your ClaimID username',
		endpointUrl : 'http://claimid.com/{username}'
	},
	clickpass : {
		displayName : 'ClickPass',
		inputPrompt : 'Enter your ClickPass username',
		endpointUrl : 'http://clickpass.com/public/{username}'
	},
	google_profile : {
		displayName : 'Google Profile',
		inputPrompt : 'Enter your Google Profile username',
		endpointUrl : 'http://www.google.com/profiles/{username}'
	}
};

authSelector.languageCode = 'en';
authSelector.iconSprite = 'en'; // Reused for German & Japanese localizations
authSelector.testMessage = 'Operating in client demonstration mode. Normally, this would have submitted the OpenID:';
authSelector.loginButtonText = 'Proceed to Login';
authSelector.iconCaption = 'authenticate with {service}';