/*
 * This file is part of the Simple OpenID Plugin.
 * Project homepage: http://code.google.com/p/openid-selector/
 *
 * It is distributed under the terms of the New BSD License.
 * Please see the project website for full license details.
 *
 * This script provides a user-friendly way to select an OpenID provider
 * and manage the authentication flow.
 */

var providers; // Global variable to store combined OpenID providers.
var openid;    // The main OpenID object, containing all core functionalities.

// Immediately invoked function expression (IIFE) to encapsulate the OpenID logic
// and prevent global scope pollution, passing jQuery as an argument.
( function ( $ ) {

openid = {
	version : '1.3', // Current version of the OpenID selector script.
	demo : false, // Flag to enable/disable demo mode for testing purposes.
	demo_text : null, // Text to display when in demo mode, typically a message.
	cookie_expires : 6 * 30, // Cookie expiration time in days (6 months calculation).
	cookie_name : 'openid_provider', // Name of the cookie used to store the last selected provider.
	cookie_path : '/', // Path for which the cookie is valid, usually the root.

	img_path : '/img/', // Base path for provider images.
	locale : null, // Localization setting, typically loaded from a separate locale file (e.g., 'en', 'de').
	sprite : null, // Sprite image identifier, also set by locale files.
	// This variable usually matches the locale setting for image selection.
	signin_text : null, // Text displayed on the submit button within the form.
	all_small : false, // If true, all providers (even those typically large) will use small icons.
	no_sprite : false, // If true, individual images will be used instead of a combined sprite.
	image_title : '{provider}', // Template for the image title attribute, where {provider} is replaced by the provider's name.

	input_id : null, // ID of the hidden input field where the OpenID URL will be placed.
	provider_url : null, // URL of the currently selected OpenID provider.
	provider_id : null, // ID of the currently selected OpenID provider.

	/**
	 * Class constructor for the OpenID selector.
	 * Initializes the OpenID selector functionality on the page by rendering provider buttons
	 * and setting up event handlers.
	 *
	 * @param {String} input_id The ID of the input field where the OpenID URL will be placed.
	 * @return {Void} No explicit return value.
	 */
	init : function ( input_id ) {
		// Combine large and small providers into a single 'providers' object for easy lookup.
		providers = $.extend( {}, providers_large, providers_small );
		// Get a reference to the container element for OpenID buttons.
		var openid_btns = $( '#openid_btns' );
		this.input_id = input_id; // Store the provided input field ID.
		$( '#openid_choice' ).show(); // Make the OpenID choice section visible to the user.
		$( '#openid_input_area' ).empty(); // Clear any existing content in the input area.

		var i = 0; // Initialize a counter for sprite positioning (or image indexing).

		// Iterate through large providers and add a button for each.
		for ( id in providers_large ) {
			box = this.getBoxHTML(
				id,
				providers_large[id],
				( this.all_small ? 'small' : 'large' ), // Determine box size based on 'all_small' flag.
				i++
			);
			openid_btns.append( box ); // Append the generated HTML for the provider button.
		}

		// If small providers are defined, add a line break and then their buttons.
		if ( providers_small ) {
			openid_btns.append( '<br/>' ); // Add a line break for visual separation between large and small providers.
			for ( id in providers_small ) {
				box = this.getBoxHTML( id, providers_small[id], 'small', i++ );
				openid_btns.append( box ); // Append the HTML for small provider buttons.
			}
		}

		// Attach the submit handler to the OpenID form.
		$( '#openid_form' ).submit( this.submit );

		// Attempt to read the last selected provider from a cookie.
		var box_id = this.readCookie();
		if ( box_id ) {
			this.signin( box_id, true ); // Automatically select the last used provider if found (onload).
		}
	},

	/**
	 * Generates the HTML string for a single provider box/button.
	 * This method decides whether to use sprite images or individual image files based on configuration.
	 *
	 * @param {String} box_id The unique identifier of the provider.
	 * @param {Object} provider The provider object containing name, URL, etc.
	 * @param {String} box_size The desired display size of the box ('small' or 'large').
	 * @param {Number} index The index of the provider, primarily used for calculating sprite background positions.
	 * @return {String} The HTML string representing the provider button.
	 */
	getBoxHTML : function ( box_id, provider, box_size, index ) {
		// Check if sprite images should be avoided based on 'no_sprite' configuration.
		if ( this.no_sprite ) {
			var image_ext = box_size == 'small' ? '.ico.gif' : '.gif'; // Determine image extension based on size.
			// Return HTML for a button using individual image files.
			return '<a title="'
				+ this.image_title.replace( '{provider}', provider["name"] ) // Replace placeholder with provider name.
				+ '" href="javascript:openid.signin(\''
				+ box_id
				+ '\');"'
				+ ' style="background: #FFF url('
				+ this.img_path
				+ '../images.'
				+ box_size
				+ '/'
				+ box_id
				+ image_ext
				+ ') no-repeat center center" ' // Inline style for background image.
				+ 'class="'
				+ box_id
				+ ' openid_'
				+ box_size
				+ '_btn"></a>'; // CSS classes for styling.
		}
		// Calculate background position for sprite image.
		var x = box_size == 'small' ? -index * 24 : -index * 100; // X-coordinate for background position.
		var y = box_size == 'small' ? -60 : 0; // Y-coordinate for background position.
		// Return HTML for a button using a sprite image.
		return '<a title="'
			+ this.image_title.replace( '{provider}', provider["name"] )
			+ '" href="javascript:openid.signin(\''
			+ box_id
			+ '\');"'
			+ ' style="background: #FFF url('
			+ this.img_path
			+ 'openid-providers-'
			+ this.sprite
			+ '.png); background-position: '
			+ x
			+ 'px '
			+ y
			+ 'px" ' // Inline style for sprite background position.
			+ 'class="'
			+ box_id
			+ ' openid_'
			+ box_size
			+ '_btn"></a>';
	},

	/**
	 * Handles the click event for a provider image/button.
	 * This function selects a provider, highlights it, stores it in a cookie,
	 * and prepares the input area based on the provider's requirements.
	 *
	 * @param {String} box_id The ID of the clicked provider.
	 * @param {Boolean} onload A flag indicating if this function is called on page load (true) or user interaction (false).
	 * @return {Void} No explicit return value.
	 */
	signin : function ( box_id, onload ) {
		var provider = providers[box_id]; // Retrieve detailed information for the selected provider.
		if ( !provider ) {
			return; // Exit if the provider ID is not valid or provider not found.
		}
		this.highlight( box_id ); // Visually highlight the selected provider button.
		this.setCookie( box_id ); // Store the selected provider's ID in a cookie for future use.
		this.provider_id = box_id; // Set the current provider's ID in the OpenID object.
		this.provider_url = provider['url']; // Set the current provider's base URL.

		// Check if the provider requires user input (e.g., username, custom OpenID URL).
		if ( provider['label'] ) {
			this.useInputBox( provider ); // Display an input box for user credentials.
		} else {
			$( '#openid_input_area' ).empty(); // Clear the input area if no user input is needed.
			if ( !onload ) {
				// If not called on page load, automatically submit the form.
				$( '#openid_form' ).submit();
			}
		}
	},

	/**
	 * Handles the submission of the OpenID form.
	 * This method constructs the final OpenID URL, handles demo mode, and executes JavaScript URLs.
	 *
	 * @return {Boolean} Returns true to allow form submission, false to prevent it.
	 */
	submit : function () {
		var url = openid.provider_url; // Get the base URL for the currently selected provider.
		if ( url ) {
			// Replace the '{username}' placeholder with the actual value from the input field.
			url = url.replace( '{username}', $( '#openid_username' ).val() );
			openid.setOpenIdUrl( url ); // Set the constructed OpenID URL into the hidden input field.
		}

		// Handle demo mode: display an alert instead of submitting the form.
		if ( openid.demo ) {
			alert( openid.demo_text + "\r\n" + document.getElementById( openid.input_id ).value );
			return false; // Prevent actual form submission in demo mode.
		}

		// Handle JavaScript URLs: execute the embedded JavaScript code.
		if ( url.indexOf( "javascript:" ) == 0 ) {
			url = url.substr( "javascript:".length ); // Extract the JavaScript code part.
			eval( url ); // Execute the extracted JavaScript code.
			return false; // Prevent form submission after executing JavaScript.
		}
		return true; // Allow normal form submission to proceed.
	},

	/**
	 * Sets the final OpenID URL into a hidden input field.
	 * If the target input field does not exist, it will be dynamically created within the form.
	 *
	 * @param {String} url The OpenID URL to be set.
	 * @return {Void} No explicit return value.
	 */
	setOpenIdUrl : function ( url ) {
		var hidden = document.getElementById( this.input_id ); // Get a reference to the hidden input element.
		if ( hidden != null ) {
			hidden.value = url; // If the input exists, update its value.
		} else {
			// If the input does not exist, create a new hidden input and append it to the form.
			$( '#openid_form' ).append(
				'<input type="hidden" id="'
				+ this.input_id
				+ '" name="'
				+ this.input_id
				+ '" value="'
				+ url
				+ '"/>'
			);
		}
	},

	/**
	 * Highlights the currently selected OpenID provider button.
	 * This involves removing any previous highlight and applying a new one to the current selection.
	 *
	 * @param {String} box_id The ID of the provider button to highlight.
	 * @return {Void} No explicit return value.
	 */
	highlight : function ( box_id ) {
		// Remove any existing highlight.
		var highlight = $( '#openid_highlight' );
		if ( highlight ) {
			highlight.replaceWith( $( '#openid_highlight a' )[0] ); // Restore the original element by replacing the highlight wrapper.
		}
		// Apply new highlight by wrapping the selected provider button in a new div with a specific ID.
		$( '.' + box_id ).wrap( '<div id="openid_highlight"></div>' );
	},

	/**
	 * Sets a cookie to remember the last selected OpenID provider.
	 * The cookie's expiration and path are configured globally within the openid object.
	 *
	 * @param {String} value The ID of the provider to store in the cookie.
	 * @return {Void} No explicit return value.
	 */
	setCookie : function ( value ) {
		var date = new Date(); // Get the current date and time.
		// Calculate the expiration time for the cookie.
		date.setTime( date.getTime() + ( this.cookie_expires * 24 * 60 * 60 * 1000 ) );
		var expires = "; expires=" + date.toGMTString(); // Format the expiration date for the cookie string.
		// Set the cookie with the provider ID, expiration, and path.
		document.cookie = this.cookie_name
			+ "="
			+ value
			+ expires
			+ "; path="
			+ this.cookie_path;
	},

	/**
	 * Reads the stored OpenID provider ID from a cookie.
	 * It parses the document's cookies to find the one matching 'cookie_name'.
	 *
	 * @return {String|null} The ID of the last selected provider, or null if the cookie is not found.
	 */
	readCookie : function () {
		var nameEQ = this.cookie_name + "="; // The prefix to search for in the cookie string.
		var ca = document.cookie.split( ';' ); // Split the entire cookie string into an array of individual cookies.
		for ( var i = 0; i < ca.length; i++ ) {
			var c = ca[i];
			// Remove leading whitespace from the cookie string.
			while ( c.charAt( 0 ) == ' ' )
				c = c.substring( 1, c.length );
			// Check if this cookie starts with the desired name.
			if ( c.indexOf( nameEQ ) == 0 )
				return c.substring( nameEQ.length, c.length ); // Return the value of the cookie.
		}
		return null; // Return null if the cookie was not found.
	},

	/**
	 * Displays an input box for the user to enter their OpenID credentials (e.g., username, full OpenID URL).
	 * This is typically used for providers that require specific user input before redirection.
	 *
	 * @param {Object} provider The provider object for which to display the input box.
	 * @return {Void} No explicit return value.
	 */
	useInputBox : function ( provider ) {
		var input_area = $( '#openid_input_area' ); // Get the container for the input area.
		var html = ''; // Initialize an empty string to build the HTML for the input box.
		var id = 'openid_username'; // Default ID for the input field.
		var value = ''; // Default value for the input field.
		var label = provider['label']; // Label text to display above the input box.
		var style = ''; // Inline CSS style for the input field.

		if ( label ) {
			html = '<p>' + label + '</p>'; // Add a paragraph with the label if it exists.
		}

		// Special handling for the generic 'OpenID' provider, which requires a full URL.
		if ( provider['name'] == 'OpenID' ) {
			id = this.input_id; // Use the main input_id for the generic OpenID field.
			value = 'http://'; // Pre-fill the input with 'http://'.
			// Apply a specific background style for the generic OpenID input field.
			style = 'background: #FFF url('
				+ this.img_path
				+ 'openid-inputicon.gif) no-repeat scroll 0 50%; padding-left:18px;';
		}

		// Construct the HTML for the input field and the submit button.
		html += '<input id="'
			+ id
			+ '" type="text" style="'
			+ style
			+ '" name="'
			+ id
			+ '" value="'
			+ value
			+ '" />'
			+ '<input id="openid_submit" type="submit" value="'
			+ this.signin_text
			+ '"/>';

		input_area.empty(); // Clear any existing content in the input area.
		input_area.append( html ); // Append the newly constructed HTML for the input box and button.
		$( '#' + id ).focus(); // Set focus to the newly created input field for user convenience.
	},

	/**
	 * Toggles the demo mode for the OpenID selector.
	 * When in demo mode, the form submission is intercepted and an alert is shown.
	 *
	 * @param {Boolean} demoMode Set to true to enable demo mode, false to disable it.
	 * @return {Void} No explicit return value.
	 */
	setDemoMode : function ( demoMode ) {
		this.demo = demoMode; // Update the internal demo mode flag.
	}
};
} )( jQuery ); // End of the IIFE, passing jQuery as the argument.


/*
 * This section defines the list of large OpenID providers.
 * Each provider object contains details such as its display name,
 * the OpenID URL, and an optional label if user input is required.
 */
var providers_large = {
	google : {
		name : 'Google', // Display name for Google.
		url : 'https://www.google.com/accounts/o8/id' // OpenID URL for Google.
	},
	yahoo : {
		name : 'Yahoo',
		url : 'http://me.yahoo.com/'
	},
	aol : {
		name : 'AOL',
		label : 'Enter your AOL screenname.', // Label indicating user input is needed.
		url : 'http://openid.aol.com/{username}' // URL with a placeholder for the username.
	},
	myopenid : {
		name : 'MyOpenID',
		label : 'Enter your MyOpenID username.',
		url : 'http://{username}.myopenid.com/'
	},
	openid : {
		name : 'OpenID',
		label : 'Enter your OpenID.', // Generic OpenID requires a full URL from the user.
		url : null // URL is null as it will be provided by the user.
	}
};

/*
 * This section defines the list of small OpenID providers.
 * These providers are typically displayed with smaller icons or in a secondary list.
 * Similar structure to large providers, with name, URL, and optional label.
 * Some providers are commented out, indicating they are not actively used or are optional.
 */
var providers_small = {
	livejournal : {
		name : 'LiveJournal',
		label : 'Enter your Livejournal username.',
		url : 'http://{username}.livejournal.com/'
	},
	/*
	// Example of a commented-out provider: Flickr
	flickr : {
		name : 'Flickr',
		label : 'Enter your Flickr username.',
		url : 'http://flickr.com/{username}/'
	},
	// Example of a commented-out provider: Technorati
	technorati : {
		name : 'Technorati',
		label : 'Enter your Technorati username.',
		url : 'http://technorati.com/people/technorati/{username}/'
	},
	*/
	wordpress : {
		name : 'Wordpress',
		label : 'Enter your Wordpress.com username.',
		url : 'http://{username}.wordpress.com/'
	},
	blogger : {
		name : 'Blogger',
		label : 'Your Blogger account',
		url : 'http://{username}.blogspot.com/'
	},
	verisign : {
		name : 'Verisign',
		label : 'Your Verisign username',
		url : 'http://{username}.pip.verisignlabs.com/'
	},
	/*
	// Another commented-out provider: Vidoop
	vidoop : {
		name : 'Vidoop',
		label : 'Your Vidoop username',
		url : 'http://{username}.myvidoop.com/'
	},
	// Another commented-out provider: Launchpad
	launchpad : {
		name : 'Launchpad',
		label : 'Your Launchpad username',
		url : 'https://launchpad.net/~{username}'
	},
	*/
	claimid : {
		name : 'ClaimID',
		label : 'Your ClaimID username',
		url : 'http://claimid.com/{username}'
	},
	clickpass : {
		name : 'ClickPass',
		label : 'Enter your ClickPass username',
		url : 'http://clickpass.com/public/{username}'
	},
	google_profile : {
		name : 'Google Profile',
		label : 'Enter your Google Profile username',
		url : 'http://www.google.com/profiles/{username}'
	}
};

// --- Initialization of OpenID selector global settings ---
// These settings are applied after the main 'openid' object is defined.

// Set the localization for the OpenID selector.
openid.locale = 'en';
// Set the sprite image to use, often matches the locale for consistency.
openid.sprite = 'en'; // This sprite is reused in German and Japanese localizations.
// Define the text to show in demo mode, guiding the user about the expected action.
openid.demo_text = 'In client demo mode. Normally would have submitted OpenID:';
// Define the default text for the sign-in button, used in the input area.
openid.signin_text = 'Sign-In';
// Define the template for the image title attribute, which provides hover text for provider icons.
openid.image_title = 'log in with {provider}';