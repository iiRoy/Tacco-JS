jQuery( document ).on( 'DOMContentLoaded', function ( ) {

	// This module handles displaying and dismissing a cookie consent banner.
	// It checks for a policy link and user's prior consent.

	/**
	 * Retrieves the status of the consent cookie.
	 * @returns {string|null} The cookie's value if found, otherwise null.
	 */
	function retrieveConsentStatus( ) {
		var allCookies = document.cookie.split( ';' );

		for ( var cookieIndex = 0; cookieIndex < allCookies.length; cookieIndex++ ) {
			var currentCookieString = allCookies[cookieIndex];

			// Trim leading whitespace
			while ( currentCookieString.charAt( 0 ) === ' ' ) {
				currentCookieString = currentCookieString.substring( 1, currentCookieString.length );
			}

			// Check if this is our consent cookie
			if ( currentCookieString.indexOf( "notice_viewed=" ) === 0 ) {
				return currentCookieString.substring( "notice_viewed=".length, currentCookieString.length );
			}
		}
		return null;
	}


	// Identify the URL for the cookie policy document from a specific link tag.
	var policyDocumentURL = jQuery( "link[data-policy-type='cookies']" ).attr( "href" );

	// Proceed only if a policy URL has been configured.
	if ( policyDocumentURL ) {

		// If the user hasn't previously acknowledged the cookie notice, display it.
		if ( !retrieveConsentStatus( ) ) {

			// Calculate the new top margin for the body to accommodate the banner.
			var initialBodyOffset = parseInt( jQuery( "body" ).css( "margin-top" ) ) + 38;

			// Construct the HTML content for the cookie notification banner.
			var bannerContentHTML = "<div id='cookie-notice-banner'><p>This website uses cookies to enhance your experience. Review our <a href='" + policyDocumentURL + "'>cookie policy</a> for details. By continuing to use our site, you consent to our use of cookies.</p><button title='Close Notification'><span>Close</span></button></div>";

			// Define the CSS styles for the notification banner and body adjustment.
			var bannerStylesCSS = "<style>body.cookie-active { margin-top: " + initialBodyOffset + "px !important; } #cookie-notice-banner { position: fixed; z-index: 2147483647; left: 0; top: 0; width: 100%; min-height: 34px; border-top: 1px solid #FFFFFF; border-bottom: 1px solid #CCCCCC; background-color: #EBEBEB; background-image:-moz-linear-gradient(50% 0% -90deg,rgb(236,236,236) 0%,rgb(225,225,225) 100%); background-image:-webkit-gradient(linear,50% 0%,50% 100%,color-stop(0, rgb(236,236,236)),color-stop(1, rgb(225,225,225))); background-image:-webkit-linear-gradient(-90deg,rgb(236,236,236) 0%,rgb(225,225,225) 100%); background-image:linear-gradient(-90deg,rgb(236,236,236) 0%,rgb(225,225,225) 100%); } #cookie-notice-banner p { margin: 0 20px 0 0; padding: 10px; color: #000000; font-size: 12px; text-align: left; } @media (max-width: 480px) { #cookie-notice-banner p { margin: 0 40px 0 0; } } #cookie-notice-banner button { position: absolute; top: 10px; right: 10px; background-color: transparent; width: 15px; height: 15px; padding: 0; margin: 0; border: none; box-shadow: none; cursor: pointer; background-image: url('https://example.com/assets/close-icon.png'); background-position: 0 0; background-repeat: no-repeat; } @media (max-width: 480px) { #cookie-notice-banner button { margin: 0; padding: 0; width: 30px; height: 30px; background-position: -20px 0; } } #cookie-notice-banner button:hover { background-position: 0 -30px; } @media (max-width: 480px) { #cookie-notice-banner button:hover { background-position: -20px -30px; } } #cookie-notice-banner button span { display: none; }</style>";

			// Apply the necessary class to the body and insert the CSS and HTML.
			jQuery( 'body' ).addClass( 'cookie-active' );
			jQuery( 'head' ).append( bannerStylesCSS );
			jQuery( 'body' ).prepend( bannerContentHTML );

			// Attach an event handler to the dismiss button to hide the banner and set a cookie.
			jQuery( '#cookie-notice-banner button' ).on( 'click', function( ) {
				var durationDays = 365 * 10; // Cookie valid for 10 years
				document.cookie = "notice_viewed=1; max-age=" + ( durationDays * 24 * 60 * 60 ) + "; path=/";
				jQuery( 'body' ).removeClass( 'cookie-active' );
				jQuery( '#cookie-notice-banner' ).toggle( );
			} );

		}

	} else {
		// Notify the developer if the cookie policy URL is missing.
		alert( "Error: A required cookie policy URL was not found in the document's head section." );
	}

} );