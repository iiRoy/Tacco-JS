;(function(jq, win, doc, undef) {
	'use strict';

	const PLUGIN_NAME = "MusicPulse";
	const DEFAULT_SETTINGS = {
		apiKey: '',
		userName: '',
		fetchCount: 5,
		dataType: 'recentTracks',
		artworkSize: 'medium',
		enableTooltips: true,
		themeClass: null,
		openNewTab: true,
		autoRefresh: true,
		refreshIntervalMs: 600000,
		noArtworkUrl: 'http://placehold.it/250x250&text=No Art',
		emptyResultsMsg: 'No activity found...',
		onDataFetched: function () {},
		onHtmlRendered: function () {}
	};

	function AudioPulseConstructor(targetElement, userOptions) {
		this.targetElement = targetElement;
		this.pluginOptions = jq.extend(true, {}, DEFAULT_SETTINGS, userOptions);
		this.internalDefaults = DEFAULT_SETTINGS;
		this.pluginIdentifier = PLUGIN_NAME;
		this.initialize();
	}

	AudioPulseConstructor.prototype = {
		initialize: function () {
			const currentOptions = this.pluginOptions;
			if (!this.performValidation(currentOptions)) {
				this.logMessage("Plugin initialization failed due to validation errors.");
				return;
			}
			this.retrieveActivity(this.targetElement, currentOptions);
		},

		performValidation: function (opts) {
			if (!opts.apiKey || opts.apiKey.trim() === '') {
				this.logMessage("Please provide a valid Last.fm API key.");
				return false;
			}
			if (!opts.userName || opts.userName.trim() === '') {
				this.logMessage("Please provide a valid Last.fm username.");
				return false;
			}
			const allowedDataTypes = ['recentTracks', 'lovedTracks', 'topAlbums', 'topTracks', 'topArtists', 'weeklyArtistChart', 'weeklyAlbumChart', 'weeklyTrackChart'];
			if (!allowedDataTypes.includes(opts.dataType)) {
				this.logMessage(`Invalid dataType specified: "${opts.dataType}". Falling back to 'recentTracks'.`);
				opts.dataType = 'recentTracks';
			}
			return true;
		},

		constructApiUrl: function (opts) {
			const baseUrl = 'http://ws.audioscrobbler.com/2.0/';
			let methodSegment = `method=user.get${opts.dataType}`;
			return `${baseUrl}?${methodSegment}&user=${opts.userName}&api_key=${opts.apiKey}&limit=${opts.fetchCount}&format=json`;
		},

		constructDetailsUrl: function (entityType, opts, mbidValue) {
			const baseUrl = 'http://ws.audioscrobbler.com/2.0/';
			return `${baseUrl}?method=${entityType}.getinfo&api_key=${opts.apiKey}&mbid=${mbidValue}&format=json`;
		},

		retrieveActivity: function (containerEl, opts) {
			const self = this;
			const itemTypeMap = {
				'recentTracks': 'track',
				'lovedTracks': 'track',
				'topAlbums': 'album',
				'topTracks': 'track',
				'topArtists': 'artist',
				'weeklyAlbumChart': 'album',
				'weeklyArtistChart': 'artist',
				'weeklyTrackChart': 'track'
			};
			let collectedItems = [];
			const primaryItemKey = itemTypeMap[opts.dataType];
			const requestUrl = this.constructApiUrl(opts);

			jq.ajax({
				url: requestUrl,
				type: "GET",
				context: this,
				async: false,
				error: function (xhr, status, errorMsg) {
					self.logMessage(`API request failed: ${status} - ${errorMsg}`);
					collectedItems.push('NO_RESULTS_MARKER');
				},
				dataType: 'json',
				success : function (apiResponse) {
					const responseKey = opts.dataType.toLowerCase();
					if (!apiResponse[responseKey] || (apiResponse[responseKey].total !== undefined && apiResponse[responseKey].total === "0")) {
						collectedItems.push('NO_RESULTS_MARKER');
						return;
					}

					let rawDataCollection = apiResponse[responseKey][primaryItemKey];
					if (!rawDataCollection) {
						collectedItems.push('NO_RESULTS_MARKER');
						return;
					}
					if (!Array.isArray(rawDataCollection)) {
						rawDataCollection = [rawDataCollection];
					}

					const itemsToProcess = rawDataCollection.slice(0, opts.fetchCount);

					jq.each(itemsToProcess, function(idx, rawItem) {
						const processedItem = self.processRawData(opts, rawItem);
						if (processedItem) {
							collectedItems.push(processedItem);
						}
					});

					if (typeof opts.onDataFetched === 'function'){
						opts.onDataFetched.call(this, collectedItems);
					}
					self.renderHtmlOutput(collectedItems, containerEl, opts);

					if (opts.autoRefresh) {
						let effectiveRefreshInterval = opts.refreshIntervalMs;
						if (effectiveRefreshInterval < 10000) {
							self.logMessage("Refresh interval too low, setting to minimum 10 seconds.");
							effectiveRefreshInterval = 10000;
						}
						setTimeout(() => {
							jq(containerEl).find('#musicPulseDisplay').remove();
							self.retrieveActivity(containerEl, opts);
						}, effectiveRefreshInterval);
					}
				}
			});
		},

		getOptimalImageUrl: function(imageArray, preferredSize) {
			if (!imageArray || !Array.isArray(imageArray) || imageArray.length === 0) {
				return null;
			}

			const sizeMap = {
				'small': 0,
				'medium': 1,
				'large': 2,
				'extralarge': 3,
				'mega': 4
			};
			
			// Prioritize larger images if available, starting from the largest down
			for (let i = 4; i >= 0; i--) {
				if (imageArray[i] && imageArray[i]['#text']) {
					return imageArray[i]['#text'];
				}
			}
			return null;
		},

		processRawData: function (opts, rawJsonItem) {
			let processed = {
				originalItem: rawJsonItem,
				itemLink: rawJsonItem.url,
				mbid: rawJsonItem.mbid,
				isPlaying: false,
				playCount: null,
				itemName: '',
				albumDetails: null,
				itemArtwork: null
			};

			const artistName = rawJsonItem.artist ? (rawJsonItem.artist.name || rawJsonItem.artist['#text']) : '';
			const trackName = rawJsonItem.name;
			const albumName = rawJsonItem.album ? (rawJsonItem.album.name || rawJsonItem.album['#text']) : '';

			switch (opts.dataType) {
				case 'recentTracks':
					processed.isPlaying = (rawJsonItem['@attr'] && rawJsonItem['@attr']['nowplaying'] === 'true');
					processed.itemName = `'${trackName}' by ${artistName}`;
					processed.albumDetails = rawJsonItem.album;
					processed.itemArtwork = rawJsonItem.image;
					break;
				case 'lovedTracks':
					processed.itemName = `'${trackName}' by ${artistName}`;
					processed.itemArtwork = rawJsonItem.image;
					break;
				case 'topAlbums':
					processed.itemName = `'${albumName}' by ${artistName}`;
					processed.playCount = rawJsonItem.playcount;
					processed.itemArtwork = rawJsonItem.image;
					break;
				case 'topTracks':
					processed.playCount = rawJsonItem.playcount;
					processed.itemArtwork = rawJsonItem.image;
					processed.itemName = `'${trackName}' by ${artistName}`;
					break;
				case 'topArtists':
					processed.itemArtwork = rawJsonItem.image;
					processed.itemName = artistName;
					processed.playCount = rawJsonItem.playcount;
					break;
				case 'weeklyAlbumChart':
					processed.itemName = `'${albumName}' by ${artistName}`;
					processed.playCount = rawJsonItem.playcount;
					if (processed.mbid) {
						const albumInfoUrl = this.constructDetailsUrl('album', opts, processed.mbid);
						jq.ajax({ url: albumInfoUrl, type: "GET", async: false, dataType: 'json',
							success : function (resp) {
								if (resp && resp.album && resp.album.image) {
									processed.itemArtwork = resp.album.image;
								}
							}
						});
					}
					break;
				case 'weeklyArtistChart':
					processed.playCount = rawJsonItem.playcount;
					if (processed.mbid) {
						const artistInfoUrl = this.constructDetailsUrl('artist', opts, processed.mbid);
						jq.ajax({ url: artistInfoUrl, type: "GET", async: false, dataType: 'json',
							success : function (resp) {
								if (resp && resp.artist && resp.artist.image) {
									processed.itemArtwork = resp.artist.image;
								}
							}
						});
					}
					processed.itemName = artistName;
					break;
				case 'weeklyTrackChart':
					processed.itemArtwork = rawJsonItem.image;
					processed.itemName = `'${trackName}' by ${artistName}`;
					processed.playCount = rawJsonItem.playcount;
					break;
				default:
					this.logMessage(`Unknown dataType in processRawData: ${opts.dataType}`);
					return null;
			}
			return processed;
		},

		renderHtmlOutput: function (dataItems, containerEl, opts) {
			const self = this;
			let finalArtworkUrl = opts.noArtworkUrl;

			const displayWrapperId = 'musicPulseDisplay';
			const initialHtml = `<ul id="${displayWrapperId}" class="${opts.themeClass || ''} pulseItemSize_${opts.artworkSize}"></ul>`;
			jq(containerEl).append(initialHtml);

			const targetList = jq(containerEl).find(`#${displayWrapperId}`);

			if (dataItems.includes('NO_RESULTS_MARKER') || dataItems.length === 0) {
				targetList.addClass('pulseError').append(`<li>${opts.emptyResultsMsg}</li>`);
				targetList.append('<li class="pulseErrorIcon">⚠️</li>');
			} else {
				jq.each(dataItems, function (idx, item) {
					finalArtworkUrl = self.getOptimalImageUrl(item.itemArtwork, opts.artworkSize) || opts.noArtworkUrl;

					const tooltipContent = opts.enableTooltips && item.itemName
						? `data-tip="${item.itemName}${item.playCount ? ` (${item.playCount} plays)` : ''}"`
						: '';
					const nowPlayingClass = item.isPlaying ? ' nowplaying' : '';
					const targetBlankAttr = opts.openNewTab ? ' target="_blank"' : '';

					const listItemHtml = `
						<li style="z-index: ${500 - idx}">
							<a href="${item.itemLink}" ${tooltipContent} class="itemCase${nowPlayingClass}"${targetBlankAttr}>
								<div class="visualOverlay"></div>
								<div class="coverArt"><img src="${finalArtworkUrl}" alt="${item.itemName || 'No Art'}"/></div>
								<div class="decorativeVinyl"></div>
								${item.isPlaying ? '<div class="playingIndicator">▶️</div>' : ''}
							</a>
						</li>
					`;
					targetList.append(listItemHtml);
				});
			}

			if (typeof opts.onHtmlRendered === 'function'){
				opts.onHtmlRendered.call(this);
			}
		},

		logMessage: function (msg) {
			if (typeof console === 'object' && console.log) {
				console.log(`[${this.pluginIdentifier}]: ${msg}`);
			} else if (typeof win.opera === 'object' && win.opera.postError) {
				win.opera.postError(`[${this.pluginIdentifier}]: ${msg}`);
			}
		}
	};

	jq.fn[PLUGIN_NAME] = function (optionsObject) {
		return this.each(function() {
			const pluginDataKey = `plugin_${PLUGIN_NAME}`;
			if ( !jq.data( this, pluginDataKey ) ) {
				jq.data( this, pluginDataKey, new AudioPulseConstructor( this, optionsObject ) );
			}
		});
	};

})(jQuery, window, document);