//
//	Audio Stream Player : v. 2.0.0
//	https://github.com/bluetidepro/jquery.JamCity
//	Copyright (c) 2012 Zach Reed (http://iamzachreed.com).
//	MIT licensed
//

;(function($, window, document, undefined) {
	'use strict'; // Enforce stricter parsing and error handling

	/*
	 *	@configuration_options
	 *
	 *	Mandatory parameters:
	 *		- [string] accessKey: Your Last.fm API key (obtain freely: http://www.last.fm/api/account )
	 *		- [string] userAccount: Your Last.fm username (e.g., http://www.last.fm/user/(USERACCOUNT) )
	 *
	 *	Optional parameters:
	 *		- [integer] countToRetrieve: The quantity of media items to fetch/display. Default is 5.
	 *		- [string] mediaCategory: The type of content to show; accepted values are recentTracks, lovedTracks, topAlbums, topTracks, topArtists, weeklyArtistChart, weeklyAlbumChart, and weeklyTrackChart. Default is recentTracks.
	 *		- [string] artworkSize: The size of album art to use; accepted values are small, medium, and large. Default is medium.
	 *		- [boolean] displayTooltips: Show item details (name/plays) in a CSS-based tooltip. Default is true.
	 *		- [string] stylingClass: The CSS class applied to the displayed content. Use playerTheme_lightVinyl for the built-in light theme. Can be customized. Default is null (implies a dark theme). (NOTE: If custom, ensure your CSS file is updated)
	 *		- [boolean] newWindowLinks: Open all content links in a new browser window/tab. Default is true.
	 *		- [boolean] autoRefresh: Automatically update content with new results without page reload. Default is true.
	 *		- [integer] refreshIntervalMs: If autoRefresh is true, this sets the frequency (in milliseconds) for new data pulls. Default is 600000 (10 minutes). (NOTE: To protect against Last.FM API abuse, this cannot be less than 10000ms)
	 *		- [string] fallbackArtImage: The default image URL if no album art is available for an item. Default is http://placehold.it/250x250&text=No Art.
	 *		- [string] emptyResultsMessage: Text to display when no media results are found. Default is 'Sorry, nothing was found...'.
	 *		- [function] onDataAcquired: Callback function executed after media data has been successfully fetched.
	 *		- [function] onDisplayRendered: Callback function executed after the HTML display has been constructed.
	 */

	var _audioPlayerTag = "AudioPlayer",
	initialSettings = {
		accessKey: '',
		userAccount: '',
		countToRetrieve: 5,
		mediaCategory: 'recentTracks',
		artworkSize: 'medium',
		displayTooltips: true,
		stylingClass: null,
		newWindowLinks: true,
		autoRefresh: true,
		refreshIntervalMs: 600000,
		fallbackArtImage: 'http://placehold.it/250x250&text=No Art',
		emptyResultsMessage: 'Sorry, nothing was found...',
		onDataAcquired: function () {},
		onDisplayRendered: function () {}
	};

	// The primary plugin constructor function
	function AudioPlayerModule(domElement, configParams) {
		this.hostElement = domElement; // Store the DOM element
		this.currentConfig = $.extend({}, initialSettings, configParams); // Merge defaults with user options
		this._baseSettings = initialSettings; // Keep a reference to the original defaults
		this._moduleID = _audioPlayerTag; // Store the plugin's identifier
		this.initialize(); // Start the module
	}

	AudioPlayerModule.prototype = {
		initialize: function() {
			var currentOptions = this.currentConfig,
				targetElement = this.hostElement;

			// Perform initial validation checks
			this.verifyParameters(currentOptions);
			// Begin fetching media items
			this.retrieveMedia(targetElement, currentOptions);
		},

		// Validates essential configuration parameters
		verifyParameters: function(currentOptions) {
			if (!currentOptions.accessKey) {
				this.logIssue("Please provide a valid Last.fm API key.");
				return false;
			}
			if (!currentOptions.userAccount) {
				this.logIssue("Please provide a valid Last.fm username.");
				return false;
			}
			return true;
		},

		// Constructs the Last.fm API URL for user data
		composeApiEndpoint: function(currentOptions) {
			var serviceUrl = 'http://ws.audioscrobbler.com/2.0/?method=user.get' + currentOptions.mediaCategory + '&user=' + currentOptions.userAccount + '&api_key=' + currentOptions.accessKey + '&limit=' + currentOptions.countToRetrieve + '&format=json';
			return serviceUrl;
		},

		// Generates an API URL for fetching detailed item information
		generateItemDetailsUrl: function(kind, currentOptions, itemIdentifier) {
			var detailUrl = 'http://ws.audioscrobbler.com/2.0/?method=' + kind + '.getinfo&api_key=' + currentOptions.accessKey + '&mbid=' + itemIdentifier + '&format=json';
			return detailUrl;
		},

		// Fetches media data from the Last.fm API
		retrieveMedia: function(targetElement, currentOptions) {
			var playerInstance = this,
				mediaTypeMappings = {
					'recentTracks': 'track',
					'lovedTracks': 'track',
					'topAlbums': 'album',
					'topTracks': 'track',
					'topArtists': 'artist',
					'weeklyAlbumChart': 'album',
					'weeklyArtistChart': 'artist',
					'weeklyTrackChart': 'track'
				},
				resultItems = [],
				shortMediaType = mediaTypeMappings[currentOptions.mediaCategory],
				currentMediaType = currentOptions.mediaCategory.toLowerCase(),
				serviceUrl = 'http://ws.audioscrobbler.com/2.0/?method=user.get' + currentOptions.mediaCategory + '&user=' + currentOptions.userAccount + '&api_key=' + currentOptions.accessKey + '&limit=' + currentOptions.countToRetrieve + '&format=json';

			$.ajax({
				url: serviceUrl,
				type: "GET",
				context: this, // Set the context for callbacks
				async: false, // Synchronous request (consider changing for better UX)
				error: function() { /* Handle API errors silently or log them */ },
				dataType: 'json',
				success: function(apiResponse) {
					// Check if no results were found
					if (apiResponse[currentMediaType] && apiResponse[currentMediaType].total === "0") {
						resultItems.push('playerError'); // Signal no results for rendering
					} else {
						var payloadData = apiResponse[currentMediaType][shortMediaType],
							remainingItems = payloadData.length - 1;

						$(payloadData).each(function(idx, rawJsonEntry) {
							var mediaEntry = playerInstance.formatRecordData(currentOptions, rawJsonEntry);
							resultItems.push(mediaEntry);
							// Adjust count if an item is currently playing
							if (mediaEntry.entryIsPlaying) {
								remainingItems = remainingItems - 1;
							}
							// Stop processing if we've reached the desired count (or near it)
							if (idx === remainingItems) {
								return false; // Break out of $.each
							}
						});
					}

					// Execute the onDataAcquired callback
					if ($.isFunction(currentOptions.onDataAcquired)) {
						currentOptions.onDataAcquired.call(this);
						playerInstance.constructDisplay(resultItems, targetElement, currentOptions);
					}

					// Handle automatic refresh functionality
					if (currentOptions.autoRefresh) {
						// Ensure minimum refresh interval is met
						if (currentOptions.refreshIntervalMs < 10000) {
							currentOptions.refreshIntervalMs = 10000;
						}
						// Set a timeout to re-fetch data
						setTimeout(function() {
							$(targetElement).find('#audioPlayerContainer').remove(); // Clear previous display
							playerInstance.retrieveMedia(targetElement, currentOptions); // Recursively call to refresh
						}, currentOptions.refreshIntervalMs);
					}
				}
			});
		},

		// Formats raw JSON data into a structured object for display
		formatRecordData: function(currentOptions, rawJsonEntry) {
			var formattedEntry = []; // Using array for object-like access, but could be {}
			formattedEntry.item = rawJsonEntry;
			formattedEntry.entryLink = rawJsonEntry.url;
			formattedEntry.entryMusicbrainzID = rawJsonEntry.mbid;
			formattedEntry.entryIsPlaying = null;
			formattedEntry.entryPlayCount = null;

			// Determine data fields based on media category
			switch (currentOptions.mediaCategory) {
				case 'recentTracks':
					if (rawJsonEntry['@attr']) {
						formattedEntry.entryIsPlaying = rawJsonEntry['@attr']['nowplaying'];
					}
					formattedEntry.entryTitle = '\'' + rawJsonEntry.name + '\' by ' + rawJsonEntry.artist['#text'];
					formattedEntry.entryAlbum = rawJsonEntry.album;
					formattedEntry.entryArtwork = rawJsonEntry.image;
					break;
				case 'lovedTracks':
					formattedEntry.entryTitle = '\'' + rawJsonEntry.name + '\' by ' + rawJsonEntry.artist.name;
					formattedEntry.entryAlbum = rawJsonEntry.album; // May be undefined
					formattedEntry.entryArtwork = rawJsonEntry.image;
					break;
				case 'topAlbums':
					formattedEntry.entryTitle = '\'' + rawJsonEntry.name + '\' by ' + rawJsonEntry.artist.name;
					formattedEntry.entryPlayCount = rawJsonEntry.playcount;
					formattedEntry.entryArtwork = rawJsonEntry.image;
					break;
				case 'topTracks':
					formattedEntry.entryPlayCount = rawJsonEntry.playcount;
					formattedEntry.entryArtwork = rawJsonEntry.image;
					formattedEntry.entryTitle = '\'' + rawJsonEntry.name + '\' by ' + rawJsonEntry.artist.name;
					break;
				case 'topArtists':
					formattedEntry.entryArtwork = rawJsonEntry.image;
					formattedEntry.entryTitle = rawJsonEntry.name;
					formattedEntry.entryPlayCount = rawJsonEntry.playcount;
					break;
				case 'weeklyAlbumChart':
					formattedEntry.entryTitle = '\'' + rawJsonEntry.name + '\' by ' + rawJsonEntry.artist['#text'];
					formattedEntry.entryPlayCount = rawJsonEntry.playcount;
					if (formattedEntry.entryMusicbrainzID) {
						var getAlbumDetailsUrl = this.generateItemDetailsUrl('album', currentOptions, formattedEntry.entryMusicbrainzID);
						$.ajax({
							url: getAlbumDetailsUrl,
							type: "GET",
							async: false,
							dataType: 'json',
							success: function(apiResponse) {
								formattedEntry.entryArtwork = apiResponse.album.image;
							}
						});
					}
					break;
				case 'weeklyArtistChart':
					formattedEntry.entryPlayCount = rawJsonEntry.playcount;
					if (formattedEntry.entryMusicbrainzID) {
						var getArtistDetailsUrl = this.generateItemDetailsUrl('artist', currentOptions, formattedEntry.entryMusicbrainzID);
						$.ajax({
							url: getArtistDetailsUrl,
							type: "GET",
							async: false,
							dataType: 'json',
							success: function(apiResponse) {
								formattedEntry.entryArtwork = apiResponse.artist.image;
							}
						});
					}
					formattedEntry.entryTitle = rawJsonEntry.name;
					break;
				case 'weeklyTrackChart':
					formattedEntry.entryArtwork = rawJsonEntry.image;
					formattedEntry.entryTitle = '\'' + rawJsonEntry.name + '\' by ' + rawJsonEntry.artist['#text'];
					formattedEntry.entryPlayCount = rawJsonEntry.playcount;
					break;
				default:
					// No specific action for default
			}
			return formattedEntry;
		},

		// Constructs and appends the HTML display to the DOM
		constructDisplay: function(resultItems, targetElement, currentOptions) {
			var playerInstance = this,
				artworkSource = null;

			$(targetElement).append('<ul id="audioPlayerContainer" class="' + currentOptions.stylingClass + ' playerSize_' + currentOptions.artworkSize + '"></ul>');

			// Handle case where no results were found
			if (resultItems == 'playerError') {
				$(targetElement).find('#audioPlayerContainer').addClass('playerEmptyState').append('<li>' + currentOptions.emptyResultsMessage + '</li>');
			} else {
				// Iterate through fetched items and build list elements
				$.each(resultItems, function(idx, mediaEntry) {
					if (mediaEntry.entryArtwork) {
						// Prioritize larger image sizes
						if (mediaEntry.entryArtwork[4]) {
							artworkSource = mediaEntry.entryArtwork[4]['#text'];
						} else if (mediaEntry.entryArtwork[3]) {
							artworkSource = mediaEntry.entryArtwork[3]['#text'];
						} else if (mediaEntry.entryArtwork[2]) {
							artworkSource = mediaEntry.entryArtwork[2]['#text'];
						} else if (mediaEntry.entryArtwork[1]) {
							artworkSource = mediaEntry.entryArtwork[1]['#text'];
						} else {
							artworkSource = currentOptions.fallbackArtImage;
						}
					} else {
						artworkSource = currentOptions.fallbackArtImage; // Use fallback if no artwork
					}

					// Append the list item with all its components
					$(targetElement).find('#audioPlayerContainer').append(
						'<li style="z-index: ' + (500 - idx) + '">' +
						'<a href="' + mediaEntry.entryLink + '" ' +
						((currentOptions.displayTooltips && mediaEntry.entryTitle) ? 'data-hint="' + mediaEntry.entryTitle + (mediaEntry.entryPlayCount ? ' (' + mediaEntry.entryPlayCount + ' listens)' : '') + '"' : '') +
						'class="mediaItem' + (mediaEntry.entryIsPlaying ? ' activeTrack' : '') + '"' + (currentOptions.newWindowLinks ? ' target="_blank"' : '') + '>' +
						'<div class="coverOverlay"></div>' +
						'<div class="albumCover"><img src="' + artworkSource + '"/></div>' +
						'<div class="vinylDisc"></div>' +
						'</a>' +
						'</li>'
					);
					// Limit the number of items displayed to `countToRetrieve`
					if (idx === (currentOptions.countToRetrieve - 1)) {
						return false; // Break out of $.each loop
					}
				});
			}

			// Execute the onDisplayRendered callback
			if ($.isFunction(currentOptions.onDisplayRendered)) {
				currentOptions.onDisplayRendered.call(this);
			}
		},

		// Provides console logging for issues or debugging
		logIssue: function(issueText) {
			if (typeof console == 'object') {
				console.log(issueText);
			} else if (typeof opera == 'object') {
				opera.postError(issueText); // Fallback for Opera
			}
		}
	};

	// Attach the plugin to jQuery's prototype
	$.fn[_audioPlayerTag] = function(configParams) {
		return this.each(function() {
			// Prevent multiple instances on the same element
			if (!$.data(this, "player_" + _audioPlayerTag)) {
				$.data(this, "player_" + _audioPlayerTag, new AudioPlayerModule(this, configParams));
			}
		});
	};

})(jQuery, window, document);