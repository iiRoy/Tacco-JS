/*
 * multimedia-display-overlay.js v2.1
 *
 * A robust MooTools-based solution for presenting video content
 * (e.g., QuickTime, YouTube, Vimeo, Vevo) within a modal overlay.
 * Part of the 'Blossom' UI framework.
 *
 * This component is inspired by earlier overlay implementations,
 * specifically those by Christophe Beyls and Aaron Newton.
 *
 * Prerequisites:
 * + MooTools Core v1.2.x+
 * + blossom-modal-overlay v1.0+
 *
 * Licensed under a modified BSD license.
 * Copyright (c) 2024, Blossom Innovations. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this list
 *    of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice, this list
 *    of conditions and the following disclaimer in the documentation and/or other materials
 *    provided with the distribution.
 * 3. Neither the name of Blossom Innovations nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 * NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

var MediaPresenter = new Class({
	// This class manages the display of various media types (videos)
	// within a modal overlay. It supports direct video files (.mov, .mp4)
	// and popular streaming platforms like YouTube, Vimeo, and Vevo.
	// The component is designed for automatic initialization on relevant links.

	Extends: MediaOverlay,
	Implements: [Options, Events],

	// Default configuration parameters for the media presenter.
	options: {
		titleText: '', // Text displayed in the caption area
		mediaElementId: 'mediaDisplay_' + $random(10000, 99999), // Unique ID for the embedded media player
		displayControls: 'false', // Whether to show playback controls for direct media files
		fadeOpacityLevel: 0.88, // Opacity of the background overlay (0-1)
		overlayBackgroundColor: '#111111', // Color of the modal background
		contentAreaBgColor: '#000000', // Background color for the media content space
		captionLinkColor: '#cccccc', // Color for links within the caption
		captionLinkHoverColor: '#eeeeee', // Hover color for caption links
		mainTextColor: '#ffffff', // Default text color for captions
		borderThicknessPx: 8, // Border width around the media content area
		defaultMediaWidth: 640, // Standard width for media display
		defaultMediaHeight: 360, // Standard height for media display, adjusted for aspect ratios
		enableLogging: false // Set to true to see debug messages
	},

	// Internal state constants for clarity
	_ModuleState: {
		UNINITIALIZED: 0,
		HIDDEN: 1,
		VISIBLE: 11
	},

	initialize: function(componentOptions) {
		this.moduleName = 'mediaPresenter';
		this.revision = 2.1;
		this.suppressDebugLogs = !this.options.enableLogging; // Control logging based on options
		this.activeMedia = null; // Reference to the currently embedded media element
		this.mediaSourceUrl = null; // URL of the media being displayed

		// Access the global utility service
		this.globalHelpers = globalRegistry.retrieveComponent('utilityService');
		if (!this.globalHelpers) {
			console.error('MediaPresenter: Utility service not found in globalRegistry.');
			return; // Abort if critical dependency is missing
		}

		this.currentStatus = this._ModuleState.UNINITIALIZED; // Initial state
		this.setOptions(componentOptions); // Apply user-defined options
		this.displayWidth = this.options.defaultMediaWidth;
		this.displayHeight = this.options.defaultMediaHeight;

		// Detect necessary browser plugins
		this.flashPluginAvailable = this.globalHelpers.checkPluginPresence('Flash');
		this.quicktimePluginAvailable = this.globalHelpers.checkPluginPresence('QuickTime');
		this.isMobileDevice = this.globalHelpers.isDeviceMobile(); // Check for mobile environments

		if (!this.suppressDebugLogs) {
			console.log('MediaPresenter initialized. Flash detected: ' + this.flashPluginAvailable + ', QT detected: ' + this.quicktimePluginAvailable);
		}

		this._setupKeyboardHandlers(); // Set up global keyboard event listeners
	},

	// Attaches an event handler to an anchor element to display its linked media.
	// It analyzes the link's URL and 'rev' attribute for media type and dimensions.
	linkToMediaItem: function(anchorElement) {
		if (this.isMobileDevice) {
			if (!this.suppressDebugLogs) {
				console.info('MediaPresenter: Skipping attachment for mobile device.');
			}
			return; // Do not attach on mobile
		}

		var targetLink = anchorElement.getProperty('href'),
			targetLinkLower = targetLink.toLowerCase(),
			linkTitle = anchorElement.getProperty('title') || this.options.titleText,
			linkRevAttribute = anchorElement.getProperty('rev'),
			calculatedWidth = this.displayWidth,
			calculatedHeight = this.displayHeight,
			detectedMediaType = false,
			revConfig = {}; // Object to store parsed rev attributes

		// Parse 'rev' attribute for custom dimensions or settings
		if (linkRevAttribute && linkRevAttribute.contains('media-display:')) {
			var configString = linkRevAttribute.substring(linkRevAttribute.indexOf('media-display:') + 14);
			configString.split(',').each(function(pair) {
				var parts = pair.split('=');
				if (parts.length === 2) {
					revConfig[parts[0].trim()] = parts[1].trim();
				}
			});
			if (revConfig.width) {
				calculatedWidth = parseInt(revConfig.width, 10) || calculatedWidth;
			}
			if (revConfig.height) {
				calculatedHeight = parseInt(revConfig.height, 10) || calculatedHeight;
			}
		}

		// Determine media type based on URL and plugin availability
		if ((targetLinkLower.includes('.mov') || targetLinkLower.includes('.mp4')) && this.quicktimePluginAvailable) {
			detectedMediaType = 'quicktime';
			// Adjust height for QuickTime controls if enabled
			if (this.options.displayControls === 'true') {
				calculatedHeight += 24; // Add a bit more for controls
			}
		} else if (targetLinkLower.includes('youtube.com/watch?v=')) {
			detectedMediaType = 'youtube';
			// YouTube videos typically have a 16:9 aspect ratio + player chrome
			calculatedHeight = (calculatedWidth * 9 / 16).round() + 30;
		} else if (targetLinkLower.test(/vimeo.com\/\d+/)) {
			detectedMediaType = 'vimeo';
			// Vimeo also commonly uses 16:9
			calculatedHeight = (calculatedWidth * 9 / 16).round();
		} else if (targetLinkLower.includes('vevo.com/watch') && this.flashPluginAvailable) {
			detectedMediaType = 'vevo';
			calculatedHeight = (calculatedWidth * 9 / 16).round() + 20; // Vevo might need a bit extra
		}

		// If a supported media type is found, attach the click event
		if (detectedMediaType) {
			anchorElement.removeEvents('click'); // Clear existing click handlers
			anchorElement.addEvent('click', function(evt) {
				this.presentMedia(detectedMediaType, linkTitle, targetLink, calculatedWidth, calculatedHeight);
				evt.stop(); // Prevent default link navigation
			}.bind(this));
			if (!this.suppressDebugLogs) {
				console.log('MediaPresenter: Attached handler for ' + detectedMediaType + ' link: ' + targetLink);
			}
		} else {
			if (!this.suppressDebugLogs) {
				console.warn('MediaPresenter: No supported media type detected for link: ' + targetLink);
			}
		}
	},

	// Initiates the display of a specified media item in the overlay.
	// This method can be called directly or via an attached anchor click.
	presentMedia: function(mediaKind, mediaCaption, mediaURL, mediaDisplayWidth, mediaDisplayHeight) {
		this.currentMediaType = mediaKind;
		this.activeCaption = mediaCaption;
		this.mediaSourceUrl = mediaURL;
		this.displayWidth = mediaDisplayWidth;
		this.displayHeight = mediaDisplayHeight;

		// If the overlay hasn't been initialized yet, create its DOM elements
		if (this.currentStatus === this._ModuleState.UNINITIALIZED) {
			this.constructDisplayElements(); // Call parent method to build overlay structure
			// Customize the close button text
			if (this.closeButtonElement) {
				this.closeButtonElement.set('html', 'close <small>[esc]</small>');
			}
			this.currentStatus = this._ModuleState.HIDDEN; // Set state to ready but hidden
		}
		this.activateOverlay(); // Trigger the overlay to become visible
	},

	// Overrides parent method: ensures overlay is hidden before activation.
	activateOverlay: function() {
		if (this.currentStatus === this._ModuleState.HIDDEN) {
			// Check for and pause any active audio playback
			if (typeof globalRegistry === 'object') {
				var audioManager = globalRegistry.retrieveComponent('audioManager');
				if (audioManager && audioManager.suspendPlayback) {
					audioManager.suspendPlayback();
					if (!this.suppressDebugLogs) {
						console.log('MediaPresenter: Audio playback suspended.');
					}
				}
			}
			this.parent(); // Call the parent MediaOverlay's activateOverlay method
			// The state will be updated to VISIBLE in renderContent() after media is loaded
		} else {
			if (!this.suppressDebugLogs) {
				console.warn('MediaPresenter: Overlay not in HIDDEN state, cannot activate.');
			}
		}
	},

	// Overrides parent method: populates the content area with the selected media.
	// Uses direct HTML injection for compatibility with various embedding types.
	renderContent: function() {
		var mediaMarkup = '';
		if (!this.contentContainerElement) {
			console.error('MediaPresenter: Content container element not found.');
			return;
		}

		// Generate HTML markup based on media type
		switch (this.currentMediaType) {
			case 'quicktime':
				// QuickTime embedding differs between IE and other browsers
				if (Browser.Engine.trident) {
					mediaMarkup = '<object classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" standby="Loading QuickTime..." ' +
						'codebase="http://www.apple.com/qtactivex/qtplugin.cab" width="' + this.displayWidth + '" height="' + this.displayHeight + '" ' +
						'id="' + this.options.mediaElementId + '"><param name="src" value="' + this.mediaSourceUrl + '" />' +
						'<param name="scale" value="aspect" /><param name="controller" value="' + this.options.displayControls + '" />' +
						'<param name="cache" value="false" /><param name="autoplay" value="true" />' +
						'<param name="bgcolor" value="' + this.options.contentAreaBgColor + '" /><param name="enablejavascript" value="true" /></object>';
				} else {
					mediaMarkup = '<object id="' + this.options.mediaElementId + '" standby="Loading QuickTime..." type="video/quicktime" ' +
						'codebase="http://www.apple.com/qtactivex/qtplugin.cab" data="' + this.mediaSourceUrl + '" ' +
						'width="' + this.displayWidth + '" height="' + this.displayHeight + '"><param name="src" value="' + this.mediaSourceUrl + '" />' +
						'<param name="scale" value="aspect" /><param name="controller" value="' + this.options.displayControls + '" />' +
						'<param name="cache" value="false" /><param name="autoplay" value="true" />' +
						'<param name="bgcolor" value="' + this.options.contentAreaBgColor + '" /><param name="enablejavascript" value="true" /></object>';
				}
				this.contentContainerElement.set('html', mediaMarkup);
				this.activeMedia = document.id(this.options.mediaElementId);
				// Delay state update to allow QuickTime player to fully initialize
				(function() {
					this.currentStatus = this._ModuleState.VISIBLE;
					if (!this.suppressDebugLogs) {
						console.log('MediaPresenter: QuickTime media rendered and visible.');
					}
				}.bind(this)).delay(1500); // Increased delay slightly
				break;

			case 'youtube':
			case 'vimeo':
				var embedSourceURL = this.normalizeMediaSource(this.mediaSourceUrl, this.currentMediaType);
				if (!embedSourceURL) {
					console.error('MediaPresenter: Failed to normalize URL for ' + this.currentMediaType + ': ' + this.mediaSourceUrl);
					this.deactivateOverlay(); // Close overlay if URL parsing fails
					return;
				}
				mediaMarkup = '<iframe src="' + embedSourceURL + '" width="' + this.displayWidth + '" height="' + this.displayHeight + '" ' +
					'frameborder="0" allow="autoplay; fullscreen" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
				this.contentContainerElement.set('html', mediaMarkup);
				this.activeMedia = this.contentContainerElement.getElement('iframe'); // Get the iframe element
				this.currentStatus = this._ModuleState.VISIBLE;
				if (!this.suppressDebugLogs) {
					console.log('MediaPresenter: ' + this.currentMediaType + ' media rendered and visible.');
				}
				break;

			case 'vevo':
				var vevoEmbedURL = this.normalizeMediaSource(this.mediaSourceUrl, this.currentMediaType);
				if (!vevoEmbedURL) {
					console.error('MediaPresenter: Failed to normalize URL for Vevo: ' + this.mediaSourceUrl);
					this.deactivateOverlay();
					return;
				}
				mediaMarkup = '<object id="' + this.options.mediaElementId + '" standby="Loading Vevo video..." type="application/x-shockwave-flash" ' +
					'width="' + this.displayWidth + '" height="' + this.displayHeight + '" data="' + vevoEmbedURL + '">' +
					'<param name="movie" value="' + vevoEmbedURL + '" /><param name="bgcolor" value="' + this.options.contentAreaBgColor + '" />' +
					'<param name="allowFullScreen" value="true" /><param name="wmode" value="opaque" /><param name="allowScriptAccess" value="always" /></object>';
				this.contentContainerElement.set('html', mediaMarkup);
				this.activeMedia = document.id(this.options.mediaElementId);
				this.currentStatus = this._ModuleState.VISIBLE;
				if (!this.suppressDebugLogs) {
					console.log('MediaPresenter: Vevo media rendered and visible.');
				}
				break;

			default:
				console.warn('MediaPresenter: Unsupported media type for rendering: ' + this.currentMediaType);
				this.deactivateOverlay(); // Close overlay for unsupported types
				return;
		}

		this.alignCaptionDisplay(); // Position the caption below the content
		this.broadcastEvent('mediaRendered', this.activeMedia); // Notify listeners
	},

	// Transforms a given media URL into an embeddable format suitable for iframes or object tags.
	normalizeMediaSource: function(rawURL, mediaType) {
		var processedURL = false,
			lowerCaseURL = rawURL.toLowerCase(),
			urlSegmentIndex;

		switch (mediaType) {
			case 'youtube':
				if (lowerCaseURL.includes('youtube.com/watch?v=')) {
					processedURL = rawURL.replace(/watch\?v\=/i, 'embed/');
					// Remove any additional URL parameters after the video ID
					urlSegmentIndex = processedURL.indexOf('&');
					if (urlSegmentIndex > -1) {
						processedURL = processedURL.substring(0, urlSegmentIndex);
					}
					processedURL += '?autoplay=1&rel=0&hd=1&modestbranding=1'; // Additional YouTube parameters
				}
				break;
			case 'vimeo':
				if (lowerCaseURL.test(/vimeo.com\/\d+/)) {
					var cleanedUrl = rawURL.replace('www.', ''); // Remove 'www.' if present
					processedURL = cleanedUrl.replace('vimeo.com/', 'player.vimeo.com/video/');
					processedURL += '?title=0&byline=0&portrait=0&autoplay=1&loop=0'; // Vimeo embed parameters
				}
				break;
			case 'vevo':
				if (lowerCaseURL.includes('vevo.com/watch')) {
					processedURL = 'http://www.vevo.com/VideoPlayer/Embedded?videoId=';
					urlSegmentIndex = lowerCaseURL.lastIndexOf('/') + 1;
					processedURL += lowerCaseURL.substring(urlSegmentIndex, lowerCaseURL.length);
					processedURL += '&autoplay=1&playerType=embedded&playlist=false';
				}
				break;
			default:
				if (!this.suppressDebugLogs) {
					console.warn('MediaPresenter: normalizeMediaSource called with unknown mediaType: ' + mediaType);
				}
				break;
		}
		return processedURL;
	},

	// Overrides parent method: ensures overlay is visible before deactivation.
	// Handles specific media player cleanup (stopping playback, releasing resources).
	deactivateOverlay: function() {
		// Only proceed if the overlay is currently visible
		if (this.currentStatus === this._ModuleState.VISIBLE) {
			// Perform media-specific cleanup
			if (this.activeMedia) {
				if (this.currentMediaType === 'quicktime') {
					// QuickTime requires specific stop command for some browsers
					if (Browser.Engine.webkit || Browser.Engine.trident) {
						if (this.activeMedia.Stop) { // Check if method exists
							this.activeMedia.Stop();
						}
						// Hide element in IE to prevent lingering audio/video
						this.activeMedia.setStyle('display', 'none');
					}
				} else if (this.currentMediaType === 'vevo') {
					// For Vevo Flash objects, dispose might be problematic in IE
					if (!Browser.Engine.trident && this.activeMedia.dispose) {
						this.activeMedia.dispose();
					}
				}
				// Clear the reference to the active media
				this.activeMedia = null;
			}

			// Clear the content container's HTML to remove the player
			if (this.contentContainerElement) {
				this.contentContainerElement.empty();
			}
			this.currentMediaType = false; // Reset media type

			this.parent(); // Call the parent MediaOverlay's deactivateOverlay method
			this.currentStatus = this._ModuleState.HIDDEN; // Set state to hidden
			if (!this.suppressDebugLogs) {
				console.log('MediaPresenter: Overlay deactivated and media cleared.');
			}
		} else {
			if (!this.suppressDebugLogs) {
				console.warn('MediaPresenter: Overlay not in VISIBLE state, cannot deactivate.');
			}
		}
	},

	// Internal method to set up keyboard event listeners (e.g., ESC key to close).
	_setupKeyboardHandlers: function() {
		document.addEvent('keydown', function(event) {
			if (event.key === 'esc' && this.currentStatus === this._ModuleState.VISIBLE) {
				event.stop(); // Prevent default browser action
				this.deactivateOverlay();
				if (!this.suppressDebugLogs) {
					console.log('MediaPresenter: ESC key pressed, overlay deactivated.');
				}
			}
		}.bind(this));
	}
});

// Global initialization for MediaPresenter on DOM ready.
window.addEvent('domready', function() {
	var presenterInstance;

	// Check if a global registry exists to manage components
	if (typeof(globalRegistry) === 'object' && globalRegistry.registerComponent) {
		presenterInstance = new MediaPresenter({
			enableLogging: false // Configure logging here for initial instance
		});
		globalRegistry.registerComponent(presenterInstance, 'mediaPresenter');
		if (presenterInstance.suppressDebugLogs === false) {
			console.info('MediaPresenter registered with globalRegistry.');
		}
	} else {
		// Fallback for standalone usage without a global registry
		presenterInstance = new MediaPresenter({
			enableLogging: true // Enable logging for standalone instances by default
		});
		console.warn('MediaPresenter: globalRegistry not found. Initializing in standalone mode.');
	}

	// Auto-link all supported media anchor tags on the page
	// Expanded selectors for various media types and protocols (http/https)
	$$('a[href$=".mov"], a[href$=".mp4"], a[href$=".MOV"], a[href$=".MP4"], ' +
		'a[href^="http://www.youtube.com/watch?v="], a[href^="https://www.youtube.com/watch?v="], ' +
		'a[href^="http://youtube.com/watch?v="], a[href^="https://youtube.com/watch?v="], ' +
		'a[href^="http://vimeo.com/"], a[href^="https://vimeo.com/"], ' +
		'a[href^="http://www.vimeo.com/"], a[href^="https://www.vimeo.com/"], ' +
		'a[href^="http://vevo.com/watch"], a[href^="https://vevo.com/watch"], ' +
		'a[href^="http://www.vevo.com/watch"], a[href^="https://www.vevo.com/watch"]'
	).each(function(element) {
		presenterInstance.linkToMediaItem(element);
	});
});