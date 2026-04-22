/**
 * LargeCanvas - A jQuery Plugin for Comprehensive Background Media Management (Video and Images)
 * by John Polacek (@johnpolacek) - extensively refactored and diversified.
 *
 * This software is distributed under both the MIT and GPL licenses.
 *
 * Core Dependencies: jQuery, jQuery UI (Slider component), Video.js, ImagesLoaded library.
 */

(function (moduleCreator) {
	'use strict';
	// Check for AMD loader and register as an anonymous module.
	if (typeof define === 'function' && define.amd) {
		define([
			'jquery',
			'videojs',
			'imagesloaded',
			'jquery-ui' // Ensure jQuery UI is loaded for the slider.
		], moduleCreator);
	} else {
		// Fallback for non-AMD environments: attach to global jQuery and videojs.
		moduleCreator(jQuery, videojs);
	}
})(function(jq, vjPlayer) {

	/**
	 * Main constructor for the VisualCanvasManager.
	 * Initializes and manages background video/image display.
	 * @param {object} componentSettings - Configuration options for the manager.
	 */
	jq.VisualCanvasManager = function(componentSettings) {

		// Default configuration options.
		const presetOptions = {
			// Enable Flash fallback for Firefox when using MP4 sources.
			firefoxFlashSupport: true,
			// Automatically start playback, especially useful for touch devices.
			compelAutoPlay: false,
			// Display playback controls.
			playbackControls: false,
			// Should the media loop indefinitely?
			repeatContent: false,
			// The container element where the media will be displayed.
			viewportContainer: jq('body'),
			// Allow the media to shrink to fit the container.
			adaptiveFit: false
		};

		// Internal state variables for the media manager.
		let VisualCanvas = {},
			playbackCore, // The Video.js player instance.
			mediaDisplayId = '#bg-visual-media', // ID for the video element.
			contentFrame = jq('<div id="bg-visual-wrapper"></div>'), // Wrapper for video/image.
			contentRatio = 16/9, // Aspect ratio of the current media.
			playbackLengthInfo = '00:00', // Formatted string for total media duration.
			initialAudioLevel = 0.8, // Default volume level.
			hasBeenSetup = false, // Flag indicating if the component has been initialized.
			isTimeScrubbing = false, // Flag for user seeking through the timeline.
			playbackActive = false, // Flag indicating if media is currently playing.
			queueActive = false, // Flag for when a playlist is active.
			ambientPlayback = false, // Flag for background (muted, looping) playback.
			mediaQueue = [], // Array storing the media playlist.
			activeMediaPos, // Current index in the media playlist.
			currentVisualType; // 'video' or 'image'.

		// Merge default options with user-provided settings.
		const activeOptions = jq.extend({}, presetOptions, componentSettings);

		// A small utility for calculating aspect ratio.
		const getAspectRatio = (width, height) => (height === 0) ? 0 : width / height;

		/**
		 * Adjusts the size and position of the media to fit the container.
		 * This function is called on window resize and media load.
		 */
		function reconfigureDisplayLayout() {
			// Ensure the component is initialized before attempting layout adjustments.
			if (!hasBeenSetup) return;

			// Determine the effective dimensions of the host container.
			// It should not exceed window dimensions unless explicitly larger.
			const frameWidth = Math.min(activeOptions.viewportContainer.outerWidth(), jq(window).width());
			const frameHeight = Math.min(activeOptions.viewportContainer.outerHeight(), jq(window).height());
			const viewportAspect = getAspectRatio(frameWidth, frameHeight);

			// If the container is the body, ensure HTML/body height is properly set.
			if (activeOptions.viewportContainer[0] === document.body) {
				jq('html, body').css('height', jq(window).height() > jq('body').css('height', 'auto').height() ? '100%' : 'auto');
			}

			// Apply styling based on aspect ratio comparison.
			const mediaElement = jq(mediaDisplayId);
			const html5Api = jq(mediaDisplayId + '_html5_api');
			const flashApi = jq(mediaDisplayId + '_flash_api');

			if (viewportAspect < contentRatio) {
				// Container is taller than media aspect ratio (media is wider relative to its height).
				if (currentVisualType === 'video') {
					const newWidth = frameHeight * contentRatio;
					playbackCore
						.width(newWidth)
						.height(frameHeight);

					const leftOffset = -(newWidth - frameWidth) / 2;
					const topOffset = (activeOptions.adaptiveFit) ? -(frameWidth / contentRatio - frameHeight) / 2 : 0;

					mediaElement
						.css({ top: topOffset, left: leftOffset, height: (activeOptions.adaptiveFit) ? frameWidth / contentRatio : frameHeight });

					html5Api.css({ width: newWidth, height: frameHeight });
					flashApi.css({ width: newWidth, height: frameHeight });
				} else {
					// Current media is an image.
					jq('#bg-visual-poster')
						.css({
							width: 'auto',
							height: frameHeight,
							top: 0,
							left: -(frameHeight * contentRatio - frameWidth) / 2
						});
				}
			} else {
				// Container is wider than media aspect ratio (media is taller relative to its width).
				if (currentVisualType === 'video') {
					const newHeight = frameWidth / contentRatio;
					playbackCore
						.width(frameWidth)
						.height(newHeight);

					const topOffset = -(newHeight - frameHeight) / 2;
					const leftOffset = 0;

					mediaElement
						.css({ top: topOffset, left: leftOffset, height: newHeight });

					html5Api.css({ width: html5Api.parent().width() + "px", height: 'auto' });
					flashApi.css({ width: frameWidth, height: newHeight });
				} else {
					// Current media is an image.
					jq('#bg-visual-poster')
						.css({
							width: frameWidth,
							height: 'auto',
							top: -(frameWidth / contentRatio - frameHeight) / 2,
							left: 0
						});
				}
			}
		}

		/**
		 * Creates and attaches the playback control interface to the container.
		 */
		function establishInterfaceElements() {
			if (!activeOptions.playbackControls) return; // Only proceed if controls are enabled.

			// HTML markup for the playback control bar.
			const controlPanelHTML = `
				<div id="bg-visual-control-panel">
					<div id="bg-visual-control-bar">
						<a href="#" id="bg-visual-play-toggle" class="bv-play-button"></a>
						<div id="bg-visual-progress-area">
							<div id="bg-visual-progress-left-bound"></div>
							<div id="bg-visual-progress-fill"></div>
							<div id="bg-visual-seek-track"></div>
							<div id="bg-visual-progress-right-bound"></div>
						</div>
						<div id="bg-visual-current-time"></div>
					</div>
				</div>`;
			activeOptions.viewportContainer.append(controlPanelHTML);

			// Initially hide controls until playback begins.
			jq('#bg-visual-control-panel').hide();
			jq('#bg-visual-current-time').hide();

			// Initialize the jQuery UI Slider for seeking.
			jq('#bg-visual-seek-track').slider({
				animate: true,
				step: 0.01,
				slide: function(event, ui) {
					isTimeScrubbing = true;
					jq('#bg-visual-progress-fill').css('width', (ui.value - 0.16) + '%');
					if (playbackCore) {
						playbackCore.currentTime((ui.value / 100) * playbackCore.duration());
					}
				},
				stop: function(event, ui) {
					isTimeScrubbing = false;
					if (playbackCore) {
						playbackCore.currentTime((ui.value / 100) * playbackCore.duration());
					}
				}
			});

			// Click event on the progress bar to seek.
			jq('#bg-visual-progress-area').on('click', function(event) {
				if (playbackCore && playbackCore.duration()) {
					playbackCore.currentTime((event.offsetX / jq(this).width()) * playbackCore.duration());
				}
			});

			// Play/Pause button toggle.
			jq('#bg-visual-play-toggle').on('click', function(event) {
				event.preventDefault();
				managePlaybackState('toggle');
			});

			// Update progress bar and timer on time update.
			playbackCore.on('timeupdate', function() {
				if (!isTimeScrubbing && playbackCore.duration()) {
					const currentPlayTime = playbackCore.currentTime();
					const minPart = Math.floor(currentPlayTime / 60);
					let secPart = Math.floor(currentPlayTime) - (60 * minPart);
					if (secPart < 10) secPart = '0' + secPart;

					const progressPercentage = (currentPlayTime / playbackCore.duration()) * 100;
					jq('#bg-visual-seek-track').slider('value', progressPercentage);
					jq('#bg-visual-progress-fill').css('width', (progressPercentage - 0.16) + '%');
					jq('#bg-visual-current-time').text(`${minPart}:${secPart}/${playbackLengthInfo}`);
				}
			});
		}

		/**
		 * Manages the playback state (play, pause, toggle, skip).
		 * @param {string} action - The action to perform ('play', 'pause', 'toggle', 'skip').
		 */
		function managePlaybackState(action) {
			const effectiveAction = action || 'toggle';
			const playToggleBtn = jq('#bg-visual-play-toggle');

			if (effectiveAction === 'toggle') {
				managePlaybackState(playbackActive ? 'pause' : 'play');
				return;
			}

			if (!playbackCore) {
				console.warn("VisualCanvasManager: Playback core not available for action:", effectiveAction);
				return;
			}

			if (effectiveAction === 'pause') {
				playbackCore.pause();
				playToggleBtn.removeClass('bv-pause-button').addClass('bv-play-button');
				playbackActive = false;
			} else if (effectiveAction === 'play') {
				playbackCore.play();
				playToggleBtn.removeClass('bv-play-button').addClass('bv-pause-button');
				playbackActive = true;
			} else if (effectiveAction === 'skip') {
				advanceContentSequence();
			} else {
				console.warn("VisualCanvasManager: Unknown playback action:", effectiveAction);
			}
		}

		let autoplayAttemptCount = 0;
		/**
		 * Handler for deferred autoplay activation, typically after a user interaction.
		 */
		function activateDeferredAutoplay() {
			if (!playbackCore) return;
			autoplayAttemptCount++;
			console.log(`Attempting autoplay activation (attempt #${autoplayAttemptCount})...`);
			playbackCore.play();
			activeOptions.viewportContainer.off('click', activateDeferredAutoplay); // Remove handler after first attempt.
		}

		/**
		 * Advances to the next media item in the playlist.
		 */
		function advanceContentSequence() {
			if (!mediaQueue || mediaQueue.length === 0) {
				console.warn("No media queue available to advance.");
				return;
			}
			activeMediaPos = (activeMediaPos + 1) % mediaQueue.length; // Cycle through the playlist.
			renderVisualContent(mediaQueue[activeMediaPos]);
			console.log(`Advancing to media item at index: ${activeMediaPos}`);
		}

		/**
		 * Renders a video asset.
		 * @param {string|object|Array<object>} mediaSource - The video source(s).
		 */
		function renderVisualContent(mediaSource) {
			// Ensure the video element is visible and hide any active poster image.
			jq(mediaDisplayId).show();
			currentVisualType = 'video';

			// Prepare the source for Video.js.
			let sourcesToLoad = [];
			if (typeof mediaSource === 'string') {
				sourcesToLoad.push({ src: mediaSource, type: 'video/mp4' }); // Assume mp4 for single string.
			} else if (Array.isArray(mediaSource)) {
				sourcesToLoad = mediaSource;
			} else if (typeof mediaSource === 'object' && mediaSource.src) {
				sourcesToLoad.push(mediaSource);
			} else {
				console.error("Invalid video source provided:", mediaSource);
				return;
			}

			playbackCore.src(sourcesToLoad);
			playbackActive = true;

			// Configure playback behavior based on ambient mode.
			if (ambientPlayback) {
				jq('#bg-visual-control-panel').hide();
				playbackCore.ready(function(){
					this.volume(0); // Mute for ambient playback.
				});
				activeOptions.repeatContent = true; // Ensure looping for ambient.
			} else {
				jq('#bg-visual-control-panel').show();
				playbackCore.ready(function(){
					this.volume(initialAudioLevel);
				});
				activeOptions.repeatContent = componentSettings.repeatContent || false; // Reset to original setting.
			}

			jq('#bg-visual-poster').hide(); // Hide any active poster.
			jq(mediaDisplayId).show(); // Ensure video element is visible.
		}

		/**
		 * Displays a static image as a background poster.
		 * @param {string} imagePath - Path to the image file.
		 */
		function displayStaticPoster(imagePath) {
			// Remove any previously displayed image.
			jq('#bg-visual-poster').remove();

			// Pause video and hide video elements.
			if (playbackCore) playbackCore.pause();
			jq(mediaDisplayId).hide();
			jq('#bg-visual-control-panel').hide();

			// Create and append the new image element.
			currentVisualType = 'image';
			const posterImageObject = jq(`<img id="bg-visual-poster" src="${imagePath}" />`);
			contentFrame.append(posterImageObject);

			// Once the image is loaded, update its size and position.
			jq('#bg-visual-poster').imagesLoaded(function() {
				contentRatio = getAspectRatio(jq(this).width(), jq(this).height());
				reconfigureDisplayLayout();
			});
		}

		/**
		 * Initializes the VisualCanvasManager component.
		 * Sets up the Video.js player, controls, and event listeners.
		 */
		VisualCanvas.initializeComponent = function() {
			if (hasBeenSetup) {
				console.warn("VisualCanvasManager already initialized.");
				return;
			}

			// Prepend the wrapper to the container.
			activeOptions.viewportContainer.prepend(contentFrame);

			// Create the video element dynamically.
			const videoElement = document.createElement('video');
			videoElement.id = mediaDisplayId.substring(1);
			videoElement.className = 'video-js vjs-default-skin';
			videoElement.height = 1;
			videoElement.width = 1;
			videoElement.preload = 'auto';
			videoElement.setAttribute('data-setup', '{}'); // Required by Video.js.
			videoElement.setAttribute('webkit-playsinline', ''); // For iOS inline playback.

			// Add autoplay attribute if configured.
			if (activeOptions.compelAutoPlay) {
				videoElement.setAttribute('autoplay', '');
			}
			jq(videoElement).css('position', 'absolute');
			contentFrame.append(videoElement);

			// Determine video technology order (HTML5 first, then Flash).
			let technologyPriorities = ['html5', 'flash'];
			const browserAgent = navigator.userAgent.toLowerCase();
			const isMozillaBrowser = browserAgent.includes('firefox');

			// If Firefox and Flash support is enabled, prioritize Flash.
			if (activeOptions.firefoxFlashSupport && isMozillaBrowser) {
				technologyPriorities = ['flash', 'html5'];
			}

			// Initialize Video.js player.
			playbackCore = vjPlayer(mediaDisplayId.substring(1), {
				controls: false, // We use custom controls if enabled.
				autoplay: activeOptions.compelAutoPlay,
				preload: 'auto',
				techOrder: technologyPriorities
			});

			// Set up custom controls if enabled.
			if (activeOptions.playbackControls) {
				establishInterfaceElements();
			}

			// Set initial layout state.
			reconfigureDisplayLayout();
			hasBeenSetup = true;
			playbackActive = false;

			// If autoplay is forced, attach a click handler to body to trigger it.
			if (activeOptions.compelAutoPlay) {
				jq('body').on('click', activateDeferredAutoplay);
			}

			// Configure Flash fallback attributes.
			jq('#bg-visual-media_flash_api')
				.attr('scale', 'noborder')
				.attr('width', '100%')
				.attr('height', '100%');

			// Attach window resize event listener.
			const resizeHandler = function() {
				reconfigureDisplayLayout();
			};
			jq(window).on('resize.visualcanvas', resizeHandler);

			// Event listener for when media metadata is loaded.
			playbackCore.on('loadedmetadata', function() {
				let effectiveWidth, effectiveHeight;
				// Check which API is active to get correct dimensions.
				const flashPlayer = document.getElementById(mediaDisplayId.substring(1) + '_flash_api');
				const html5Player = jq(mediaDisplayId + '_html5_api')[0];

				if (flashPlayer && typeof flashPlayer.vjs_getProperty === 'function') {
					effectiveWidth = flashPlayer.vjs_getProperty('videoWidth');
					effectiveHeight = flashPlayer.vjs_getProperty('videoHeight');
				} else if (html5Player) {
					effectiveWidth = html5Player.videoWidth;
					effectiveHeight = html5Player.videoHeight;
				} else {
					console.warn("Could not retrieve video dimensions from any player API.");
					effectiveWidth = 16; // Fallback to default ratio.
					effectiveHeight = 9;
				}

				contentRatio = getAspectRatio(effectiveWidth, effectiveHeight);
				reconfigureDisplayLayout();

				const totalSeconds = Math.round(playbackCore.duration());
				const minPart = Math.floor(totalSeconds / 60);
				let secPart = totalSeconds - minPart * 60;
				if (secPart < 10) secPart = '0' + secPart;
				playbackLengthInfo = `${minPart}:${secPart}`;
			});

			// Event listener for when media playback ends.
			playbackCore.on('ended', function() {
				if (activeOptions.repeatContent) {
					playbackCore.currentTime(0);
					playbackCore.play();
				}
				if (queueActive) {
					advanceContentSequence();
				}
			});
		};

		/**
		 * Presents a single media file (video or image).
		 * @param {string|object|Array<object>} resourcePath - The media source.
		 * @param {object} [displayOptions] - Additional display options.
		 * @param {boolean} [displayOptions.ambient] - If true, media plays muted and loops.
		 * @param {function} [displayOptions.onShown] - Callback function once media is shown.
		 */
		VisualCanvas.presentMedia = function(resourcePath, displayOptions) {
			const currentDisplayOpts = displayOptions || {};
			ambientPlayback = currentDisplayOpts.ambient === true;
			if (ambientPlayback || currentDisplayOpts.repeatContent) {
				activeOptions.repeatContent = true;
			} else {
				activeOptions.repeatContent = presetOptions.repeatContent; // Reset to default.
			}

			if (!resourcePath) {
				console.error("VisualCanvasManager.presentMedia: No media source provided.");
				return;
			}

			if (typeof resourcePath === 'string') {
				// Attempt to determine file type by extension.
				const queryPos = resourcePath.lastIndexOf('?');
				const dotPos = resourcePath.lastIndexOf('.');
				const resourceSuffix = (queryPos > dotPos) ? resourcePath.substring(dotPos + 1, queryPos) : resourcePath.substring(dotPos + 1);

				const imageExtensions = ['jpg', 'jpeg', 'gif', 'png', 'webp'];
				const videoExtensions = ['mp4', 'ogg', 'ogv', 'webm', 'mov'];

				if (imageExtensions.includes(resourceSuffix.toLowerCase())) {
					displayStaticPoster(resourcePath);
				} else if (videoExtensions.includes(resourceSuffix.toLowerCase())) {
					renderVisualContent(resourcePath);
					if (currentDisplayOpts.onShown) currentDisplayOpts.onShown();
					queueActive = false;
				} else {
					console.warn(`VisualCanvasManager: Unknown file type for source: ${resourcePath}. Attempting to play as video.`);
					renderVisualContent(resourcePath);
					if (currentDisplayOpts.onShown) currentDisplayOpts.onShown();
					queueActive = false;
				}
			} else if (Array.isArray(resourcePath) || (typeof resourcePath === "object" && resourcePath.src && resourcePath.type)) {
				// If it's an array of sources or a video.js source object.
				renderVisualContent(resourcePath);
				if (currentDisplayOpts.onShown) currentDisplayOpts.onShown();
				queueActive = false;
			} else {
				// Invalid input type.
				throw new Error("VisualCanvasManager.presentMedia received invalid input for parameter 'resourcePath'.");
			}
		};

		/**
		 * Displays a sequence of media files as a playlist.
		 * @param {Array<string|object>} mediaList - An array of media sources.
		 * @param {object} [listOptions] - Options for the playlist.
		 * @param {boolean} [listOptions.ambient] - If true, media plays muted and loops.
		 * @param {function} [listOptions.onShown] - Callback function when the first item is shown.
		 */
		VisualCanvas.loadMediaSequence = function (mediaList, listOptions) {
			if (!Array.isArray(mediaList)) {
				throw new Error("VisualCanvasManager.loadMediaSequence parameter 'mediaList' accepts only arrays.");
			}

			const currentListOpts = listOptions || {};
			ambientPlayback = currentListOpts.ambient === true;
			if (ambientPlayback || currentListOpts.repeatContent) {
				activeOptions.repeatContent = true;
			} else {
				activeOptions.repeatContent = presetOptions.repeatContent; // Reset to default.
			}

			mediaQueue = mediaList;
			activeMediaPos = 0;
			this.presentMedia(mediaQueue[activeMediaPos]);
			if (currentListOpts.onShown) currentListOpts.onShown();
			queueActive = true;
		};

		/**
		 * Retrieves the underlying Video.js player instance.
		 * @returns {videojs.Player} The Video.js player object.
		 */
		VisualCanvas.getPlaybackInstance = function() {
			return playbackCore;
		};

		/**
		 * Cleans up and disposes of the VisualCanvasManager and its associated elements.
		 * Removes event listeners and DOM elements.
		 */
		VisualCanvas.destroy = function() {
			if (!hasBeenSetup) {
				console.warn("VisualCanvasManager is not initialized or already destroyed.");
				return;
			}
			hasBeenSetup = false;

			contentFrame.remove(); // Remove the main wrapper element.
			jq(window).off('resize.visualcanvas'); // Deregister resize listener.

			if (playbackCore) {
				// Remove all specific event listeners to prevent memory leaks.
				playbackCore.off('loadedmetadata');
				playbackCore.off('ended');
				playbackCore.off('timeupdate');
				playbackCore.dispose(); // Dispose the Video.js player instance.
				playbackCore = null;
			}

			// Clean up any custom control elements.
			jq('#bg-visual-control-panel').remove();
			jq('body').off('click', activateDeferredAutoplay);

			console.log("VisualCanvasManager components successfully destroyed.");
		};

		// Alias for destroy for convenience.
		VisualCanvas.cleanup = VisualCanvas.destroy;

		/**
		 * Triggers a specific action on the playback core (e.g., 'play', 'pause', 'skip').
		 * @param {string} playerAction - The action to perform.
		 */
		VisualCanvas.controlPlayback = function(playerAction){
			managePlaybackState(playerAction);
		};

		return VisualCanvas;
	};
});