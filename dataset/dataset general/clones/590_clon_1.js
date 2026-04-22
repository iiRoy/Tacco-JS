/*
 *
 *	JamCity jQuery Plugin
 *	Version: 2.0.0
 *	Source: https://github.com/bluetidepro/jquery.JamCity
 *	Copyright (c) 2012 Zach Reed (http://iamzachreed.com). All rights reserved.
 *	Licensed under the MIT license.
 *
 */
; ( function ( $, window, document, undefined ) {

	// Enforce strict mode for cleaner code and fewer errors.
	'use strict';

	// The following comment block outlines the various parameters available for the JamCity plugin.
	// These parameters control behavior such as API keys, usernames, data fetching, and display options.

	/*
	 *	@params: Configuration parameters for the JamCity plugin.
	 *
	 *	Required parameters:
	 *		- [string] apiKey: Your Last.fm API key. Obtain one easily and for free at: http://www.last.fm/api/account
	 *		- [string] username: Your Last.fm username (e.g., if your profile is http://www.last.fm/user/myusername, then 'myusername' is your username).
	 *
	 *	Optional parameters:
	 *		- [integer] fetch: The maximum number of tracks or items to retrieve and display. Default value is 5.
	 *		- [string] contentType: Defines the type of Last.fm content to fetch. Valid options include:
	 *		  'recentTracks', 'lovedTracks', 'topAlbums', 'topTracks', 'topArtists',
	 *		  'weeklyArtistChart', 'weeklyAlbumChart', and 'weeklyTrackChart'.
	 *		  The default content type is 'recentTracks'.
	 *		- [string] artSize: Specifies the desired size for album art images. Accepted values are 'small', 'medium', and 'large'. 'medium' is the default.
	 *		- [boolean] cssTooltips: If true, displays content details (name, play count, etc.) using CSS tooltips on hover. Default is true.
	 *		- [string] cssThemeClass: A CSS class to apply to the displayed content wrapper.
	 *		  Use 'jamCityTheme_whiteVinyl' for the built-in white theme.
	 *		  Can be customized with your own class. Default is null (which results in a dark theme).
	 *		  (NOTE: If you use a custom class, ensure your CSS file is updated accordingly.)
	 *		- [boolean] _blankLinks: If true, all generated links within the content will open in a new browser window or tab. Default is true.
	 *		- [boolean] refreshResults: If true, the plugin will automatically refresh the content at intervals to display new results without a full page reload. Default is true.
	 *		- [integer] refreshResultsInterval: The interval (in milliseconds) at which to refresh results, provided 'refreshResults' is true.
	 *		  Default is 600000 milliseconds (10 minutes).
	 *		  (NOTE: To protect against Last.FM API abuse, this value cannot be set below 10000 milliseconds, or 10 seconds.)
	 *		- [string] noAlbumArtImg: The URL of a default image to use when no album art is available for a track or item.
	 *		  Default is 'http://placehold.it/250x250&text=No Art'.
	 *		- [string] noResults: The text message to display when no results are found by the API. Default is 'Sorry, nothing was found...'.
	 *		- [function] songsFetched: A callback function that executes once the song/item data has been successfully fetched from the Last.fm API.
	 *		- [function] htmlBuilt: A callback function that executes after the HTML for the fetched content has been fully constructed and appended to the DOM.
	 */

	// Define a constant for the plugin name, used for internal references and data storage.
	var $JamCity = "JamCity",

	// Set up the default configuration options for the plugin.
	defaults = {
		apiKey: '', // Last.fm API key, required.
		username: '', // Last.fm username, required.
		fetch: 5, // Number of items to fetch.
		contentType: 'recentTracks', // Type of content (e.g., recent, loved, top).
		artSize: 'medium', // Size of album art images.
		cssTooltips: true, // Enable/disable CSS tooltips.
		cssThemeClass: null, // Custom CSS theme class.
		_blankLinks: true, // Open links in new tabs/windows.
		refreshResults: true, // Enable/disable automatic refreshing.
		refreshResultsInterval: 600000, // Refresh interval in milliseconds.
		noAlbumArtImg: 'http://placehold.it/250x250&text=No Art', // Default image for missing art.
		noResults: 'Sorry, nothing was found...', // Message for no results.
		songsFetched: function () {}, // Callback for when songs are fetched.
		htmlBuilt: function () {} // Callback for when HTML is built.
	};

	// The main plugin constructor function.
	function JamCity_Construct ( element, options ) {

		this.element = element; // The DOM element the plugin is attached to.

		// Extend default settings with user-provided options.
		this.settings = $.extend( {}, defaults, options );

		this._defaults = defaults; // Store original defaults.
		this._name = $JamCity; // Store plugin name.

		this.init(); // Initialize the plugin instance.
	}

	// Prototype methods for the JamCity_Construct object.
	JamCity_Construct.prototype = {

		// Initialization method.
		init: function () {

			var options = this.settings, // Current settings for this instance.
				el = this.element; // The DOM element.

			this.validate(options); // Validate essential options.
			this.fetchSongs(el, options); // Begin fetching songs/data.
		},

		// Validates required options (API key and username).
		validate: function (options) {

			if ( !options.apiKey ) { // Check if API key is provided.
				this.debug("Please enter a valid API key.");
				return false;
			}

			if ( !options.username ) { // Check if username is provided.
				this.debug("Please enter a valid username.");
				return false;
			}

			return true; // All required options are present.
		},

		// Constructs the Last.fm API URL based on content type and user options.
		buildLastfmUrl: function (options) {

			var apiUrl = 'http://ws.audioscrobbler.com/2.0/?method=user.get' +
						options.contentType + // e.g., 'recentTracks'
						'&user=' + options.username + // Last.fm username
						'&api_key=' + options.apiKey + // Your API key
						'&limit=' + options.fetch + // Number of items to fetch
						'&format=json'; // Request JSON format.

			return apiUrl;
		},

		// Constructs an API URL for fetching detailed info (album, artist, track).
		buildInfoUrl: function (type, options, mbid) {

			var InfoUrl = 'http://ws.audioscrobbler.com/2.0/?method=' + type + // e.g., 'album', 'artist'
						'.getinfo&api_key=' + options.apiKey + // Your API key
						'&mbid=' + mbid + // MusicBrainz ID for the item
						'&format=json'; // Request JSON format.

			return InfoUrl;
		},

		// Fetches song/data items from the Last.fm API.
		fetchSongs: function (el, options) {

			var jamCity = this, // Reference to the plugin instance.

				// Mapping of contentType to the short name used in Last.fm JSON responses.
				contentTypeNames = {
					'recentTracks': 'track',
					'lovedTracks': 'track',
					'topAlbums': 'album',
					'topTracks': 'track',
					'topArtists': 'artist',
					'weeklyAlbumChart': 'album',
					'weeklyArtistChart': 'artist',
					'weeklyTrackChart': 'track'
				},

				items = [], // Array to store processed item data.

				// Determine the short name for the current content type.
				contentTypeShortName = contentTypeNames[options.contentType],

				// Convert content type to lowercase for API response key.
				contentType = options.contentType.toLowerCase(),

				// Construct the primary API URL for fetching user data.
				apiUrl = 'http://ws.audioscrobbler.com/2.0/?method=user.get' + options.contentType +
						'&user=' + options.username + '&api_key=' + options.apiKey +
						'&limit=' + options.fetch + '&format=json';

			// Make the AJAX call to the Last.fm API.
			$.ajax({
				url: apiUrl, // The constructed API URL.
				type: "GET", // HTTP GET request.
				context: this, // Set the context for success/error callbacks to the plugin instance.
				async: false, // Synchronous request (might block UI, consider changing for large datasets).
				error: function () { /* Handle AJAX errors here if needed. */ }, // Error callback, currently empty.
				dataType: 'json', // Expect JSON response.
				success : function (response) { // Success callback.

					// Check if the response indicates no results found.
					if ( response[contentType] && response[contentType].total === "0" ) {

						items.push('jamCityError'); // Add a flag to indicate no results.

					} else {

						// Extract the relevant data array from the response.
						var data = response[contentType][contentTypeShortName],
							track_Count = data.length - 1; // Used for iteration control.

						// Iterate through each item in the data array.
						$(data).each(function(i, el) {

							var item = jamCity.templateData(options, el); // Process data for templating.
							items.push(item); // Add processed item to the items array.

							// If the item is currently playing, adjust the track count.
							if ( item.item_nowplaying ) {
								track_Count = track_Count - 1;
							}

							// Break out of the loop if the desired number of items is reached.
							if ( i === track_Count ) {
								return false;
							}
						});
					}

					// Execute the 'songsFetched' callback if it's a function.
					if ( $.isFunction(options.songsFetched) ) {
						options.songsFetched.call(this); // Call the callback in the context of the plugin.
						jamCity.buildHTML(items, el, options); // Proceed to build the HTML.
					}

					// Handle refreshing results if enabled.
					if ( options.refreshResults ) {

						// Ensure refresh interval is not below the minimum allowed.
						if ( options.refreshResultsInterval < 10000 ) {
							options.refreshResultsInterval = 10000;
						}

						// Set a timeout to clear existing content and fetch new results.
						setTimeout(function() {
							$(el).find('#jamCityWrapper').remove(); // Remove old wrapper.
							jamCity.fetchSongs(el, options); // Fetch new songs.
						}, options.refreshResultsInterval);
					}
				}
			});
		},

		// Processes raw JSON item data into a standardized object for templating.
		templateData: function (options, json_item) {

			var o = []; // Object to hold processed item data.

			o.item = json_item; // Store the original JSON item.
			o.item_url = json_item.url; // URL of the item.
			o.item_mbid = json_item.mbid; // MusicBrainz ID.
			o.item_nowplaying = null; // Flag for currently playing item.
			o.item_playcount = null; // Play count for the item.

			// Use a switch statement to handle different content types.
			switch ( options.contentType ) {

				case 'recentTracks':
					// Check if '@attr' exists (indicates currently playing).
					if ( json_item['@attr'] ) {
						o.item_nowplaying = json_item['@attr']['nowplaying'];
					}
					o.item_name = '\'' + json_item.name + '\'  by ' + json_item.artist['#text'];
					o.item_album = json_item.album;
					o.item_image = json_item.image;
					break;

				case 'lovedTracks':
					o.item_name = '\'' + json_item.name + '\'  by ' + json_item.artist.name;
					o.item_album = json_item.album; // Note: album info often undefined for lovedTracks
					o.item_image = json_item.image;
					break;

				case 'topAlbums':
					o.item_name = '\'' + json_item.name + '\'  by ' + json_item.artist.name;
					o.item_playcount = json_item.playcount;
					o.item_image = json_item.image;
					break;

				case 'topTracks':
					o.item_playcount = json_item.playcount;
					o.item_image = json_item.image;
					o.item_name = '\'' + json_item.name + '\'  by ' + json_item.artist.name;
					break;

				case 'topArtists':
					o.item_image = json_item.image;
					o.item_name = json_item.name;
					o.item_playcount = json_item.playcount;
					break;

				case 'weeklyAlbumChart':
					o.item_name = '\'' + json_item.name + '\'  by ' + json_item.artist['#text'];
					o.item_playcount = json_item.playcount;
					// Fetch album image if MBID is available.
					if ( o.item_mbid ) {
						var getAlbumInfo = this.buildInfoUrl('album', options, o.item_mbid);
						$.ajax({
							url: getAlbumInfo,
							type: "GET",
							async: false,
							dataType: 'json',
							success : function (response) {
								o.item_image = response.album.image;
							}
						});
					}
					break;

				case 'weeklyArtistChart':
					o.item_playcount = json_item.playcount;
					// Fetch artist image if MBID is available.
					if ( o.item_mbid ) {
						var getArtistInfo = this.buildInfoUrl('artist', options, o.item_mbid);
						$.ajax({
							url: getArtistInfo,
							type: "GET",
							async: false,
							dataType: 'json',
							success : function (response) {
								o.item_image = response.artist.image;
							}
						});
					}
					o.item_name = json_item.name;
					break;

				case 'weeklyTrackChart':
					o.item_image = json_item.image;
					o.item_name = '\'' + json_item.name + '\' by ' + json_item.artist['#text'];
					o.item_playcount = json_item.playcount;
					break;

				default:
					// No specific handling for other content types, or error case.
			}

			return o; // Return the processed item object.
		},

		// Builds and appends the HTML structure for the fetched items.
		buildHTML: function (items, el, options) {

			var jamcity = this, // Reference to the plugin instance.
				item_image = null; // Variable to hold the selected image URL.

			// Append the main wrapper unordered list to the target element.
			$(el).append('<ul id="jamCityWrapper" class="' + options.cssThemeClass + ' jamCitySize_' + options.artSize + '"></ul>');

			// Check if there was an error or no results.
			if ( items == 'jamCityError' ) {
				$(el).find('#jamCityWrapper').addClass('jamCityError').append('<li>' + options.noResults + '</li>');
			} else {
				// Iterate through each processed item.
				$.each(items, function (i, item) {

					// Determine the appropriate image size to use.
					if ( item.item_image ) {
						if ( item.item_image[4] ) { // 'extralarge' size.
							item_image = item.item_image[4]['#text'];
						} else if ( item.item_image[3] ) { // 'large' size.
							item_image = item.item_image[3]['#text'];
						} else if ( item.item_image[2] ) { // 'medium' size.
							item_image = item.item_image[2]['#text'];
						} else if ( item.item_image[1] ) { // 'small' size.
							item_image = item.item_image[1]['#text'];
						} else {
							item_image = options.noAlbumArtImg; // Fallback to default no art image.
						}
					} else {
						item_image = options.noAlbumArtImg; // Fallback if no image array exists.
					}

					// Append each item's HTML to the wrapper.
					$(el).find('#jamCityWrapper').append(
						'<li style="z-index: ' + (500 - i) + '">' + // Apply z-index for stacking effect.
							'<a href="' + item.item_url + '" ' +
								// Conditionally add data-tip for tooltips.
								( (options.cssTooltips && item.item_name) ?
									'data-tip="' + item.item_name + (item.item_playcount ? ' (' + item.item_playcount + ' plays)' : '') + '"' :
									''
								) +
								// Add 'nowplaying' class if applicable.
								'class="case' + (item.item_nowplaying ? ' nowplaying' : '') + '"' +
								// Conditionally add target="_blank".
								(options._blankLinks ? ' target="_blank"' : '') + '>' +
								'<div class="overlay"></div>' + // Overlay for visual effects.
								'<div class="cover"><img src="' + item_image + '"/></div>' + // Album cover image.
								'<div class="vinyl"></div>' + // Vinyl record visual.
							'</a>' +
						'</li>'
					);

					// Stop iterating if the desired 'fetch' limit has been reached.
					if ( i === (options.fetch - 1) ) {
						return false;
					}
				});
			}

			// Execute the 'htmlBuilt' callback if it's a function.
			if ( $.isFunction(options.htmlBuilt) ) {
				options.htmlBuilt.call(this); // Call the callback in the context of the plugin.
			}
		},

		// A utility method for debugging messages.
		debug: function (error) {
			// Check for existence of console object.
			if ( typeof console == 'object' ) {
				console.log(error); // Log to browser console.
			}
			// Check for existence of opera object (for older Opera browsers).
			else if ( typeof opera == 'object' ) {
				opera.postError(error); // Post error to Opera's error console.
			}
		}
	};

	// jQuery plugin integration.
	// This makes the plugin available via `$(selector).JamCity()`.
	$.fn[$JamCity] = function ( options ) {

		return this.each(function() {
			// Prevent multiple instantiations on the same element.
			if ( !$.data( this, "plugin_" + $JamCity ) ) {
				// Attach a new instance of the plugin to the element's data.
				$.data( this, "plugin_" + $JamCity, new JamCity_Construct( this, options ) );
			}
		});
	};

})(jQuery, window, document); // Pass jQuery, window, and document as arguments for scope.