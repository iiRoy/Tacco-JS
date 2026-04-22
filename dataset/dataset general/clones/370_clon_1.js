/*
 * This module provides functionality to
 * retrieve application data from the Google Play Store.
 * It's designed to scrape public information for a given bundle ID.
 */
var request = require( 'request' ) ; // HTTP client library
var cheerio = require( 'cheerio' ) ; // HTML parsing library
var qs = require( 'querystring' ) ; // Query string parsing utility

// Exported module methods
module.exports = {
	/**
	 * Fetches detailed application data from the Google Play Store.
	 * @param {string} bundleId - The unique identifier of the app (e.g., "com.example.app").
	 * @param {function} cb - Callback function (err, appData).
	 */
	getAppData : function ( bundleId , cb ) {
		// Base URL for Google Play Store app details
		var baseUrl = 'https://play.google.com/store/apps/details?id=' ;

		// Make an HTTP GET request to the Play Store page
		request( baseUrl + bundleId , function ( err , res , html ) {

			// Handle potential network or request errors
			if ( err ) {
				cb( err ) ; // Pass the error to the callback
				return ; // Exit function
			}

			// Check for HTTP 404 Not Found status code
			if ( res.statusCode == 404 ) {
				cb( null , null ) ; // App not found, indicate no error but no data
				return ; // Exit function
			}

			// Initialize an empty object to store app details
			var app = {
				packageId : bundleId , // Store the requested bundle ID
				appName : null ,
				developer : null ,
				category : null ,
				logo : null ,
				price : null ,
				inAppPurchases : null ,
				playStoreUrl : null ,
				description : null ,
				screenshots : null ,
				ratingValue : null ,
				ratingCount : null ,
				score : null ,
				datePublished : null ,
				fileSize : null ,
				numDownloads : null ,
				softwareVersion : null ,
				operatingSystems : null ,
				contentRating : null ,
				developerLinks : null ,
				developerEmail : null
			} ;

			try {
				// Load the HTML content into Cheerio for DOM manipulation
				var $ = cheerio.load( html ) ;
		
				// Extract app name
				app.appName = $( '.document-title div' ).html() ;
				// Extract developer name
				app.developer = $( '.document-subtitle.primary span' ).html() ;
				// Extract app category
				app.category = $( '.document-subtitle.category span' ).html() ;
				// Extract app logo URL
				app.logo = $( '.details-info img.cover-image' ).attr( 'src' ) ;
				
				// --- Price extraction logic ---
				var spans = $( '.info-container .buy-button-container button.price.buy span' ) ; 
				var contents = $( spans[ spans.length - 1 ] ).html() ;
				var idx = contents.indexOf( ' Buy' ) ;
				var price = contents.substr( 0 , idx ) ;

				// Determine price; if empty, it's free
				app.price = price.length > 0 ? price : 'free' ;				
				// --- End price extraction ---

				// Check for in-app purchases presence
				app.inAppPurchases = ! ( ! $( '.inapp-msg' ).html() ) ;
				// Construct the full Play Store URL
				app.playStoreUrl = baseUrl + bundleId ;
				// Extract app description
				app.description = $( '.id-app-orig-desc' ).html() ;
				
				// Initialize screenshots array
				app.screenshots = [ ] ;
				// Iterate through screenshot images and collect their URLs
				$( '.thumbnails img' ).each( function ( i , item ) {
					app.screenshots.push( $( item ).attr( 'src' ) ) ;
				} ) ;

				// Extract rating count
				app.ratingCount = $( '.details-section.reviews meta[itemprop=ratingCount]' ).attr( 'content' ) ;
				// Extract rating value
				app.ratingValue = $( '.details-section.reviews meta[itemprop=ratingValue]' ).attr( 'content' ) ;
				// Extract overall score
				app.score = $( '.details-section.reviews .score' ).html() ;

				/*
				 * Extract various metadata fields from the "Additional Information" section.
				 * This involves iterating through meta-info items and parsing their titles and content.
				 */
				var meta = { } ; // Temporary object to hold parsed meta data
				$( '.meta-info' ).each( function ( i , item ) {
					// Clean and format property name
					var prop = $( '.title' , item ).html().trim().toLowerCase().replace( ' ' , '_' ) ;
					// Clean and format property value
					var val = $( '.content' , item ).html().trim() ;
					
					meta[ prop ] = val ; // Assign to meta object
				} ) ;

				// Map parsed meta data to app object properties
				app.datePublished = meta.updated ;
				app.fileSize = meta.size ;
				app.numDownloads = meta.installs ;
				app.softwareVersion = meta.current_version ;
				app.operatingSystems = meta.require_android ;
				app.contentRating = meta.content_rating ;
				app.developerLinks = [ ] ; // Initialize developer links array

				/*
				 * Process developer contact links.
				 * Differentiate between mailto links (email) and other URLs.
				 */
				$( '.dev-link' ).each( function ( i , item ) {
					var href = $( item ).attr( 'href' ) ;
					// Check if it's an email link
					if ( href && href.indexOf( 'mailto:' ) > -1 ) {
						app.developerEmail = href.substr( 7 ) ; // Extract email address
					} else {
						// Parse other links to get the actual URL
						var parsed = qs.parse( href ) ;						
						app.developerLinks.push( parsed[ 'https://www.google.com/url?q' ] ) ;
					}
				} ) ;		
			} catch ( ex ) {
				// Catch any errors during the scraping process
				var error = new Error( 'Error scraping Play Store' ) ;
				error.inner = ex ; // Attach the original exception for debugging

				cb( error ) ; // Pass the custom error to the callback
				return ; // Exit function
			}

			cb( err , app ) ; // Call back with results (err should be null here if successful)
			return ; // Ensure function exit
		} ) ;
	}
} ;