/*
	MassiveClip - A jQuery Plugin for Large Background Videos (and Stills)
	Authored by Jasper Plum (@jasperplum)

	Distributed under dual MIT and GPL licenses.

	Required Libraries: jQuery, jQuery UI (Slider component), Clip.js, ImageLoader
*/

(function (moduleFactory) {
	'use strict';
	if (typeof define === 'function' && define.amd) {
		// Register as an anonymous AMD module for module loaders:
		define([
			'jquery',
			'videojs',
			'imagesloaded',
			'jquery-ui'
		], moduleFactory);
	} else {
		moduleFactory(jQuery, videojs);
	}
})(function(jq, clipEngine) {

	jq.MassiveClip = function(configOpts) {

		var initialOptions = {
			// Set to true if only using a single mp4 source and need Flash for Firefox compatibility
			enableFlashForFirefox:true,
			// If managing a sequence of media, the initial clip won't auto-start on touch devices
			// unless the play event is bound to a user interaction.
			forceInitialPlayback:false,
			displayControls:false,
			shouldLoop:false,
			hostingContainer:jq('body'),
			canShrink:false
		};

		var MassiveClipInstance = {},
			mediaEngine,
			visualElemId = '#massive-clip-element',
			containerWrapper = jq('<div id="massive-clip-wrapper"></div>'),
			mediaObj = jq(''), // Placeholder for internal media object
			aspectRatio = 1.7777, // Pre-calculated 16/9
			clipDurationInfo = '0:00',
			initialAudioLevel = 0.75,
			hasBeenSetup = false,
			isNavigatingTime = false,
			isCurrentlyPlaying = false,
			hasPlaylistActive = false,
			isBackgroundMode = false,
			mediaSequence = [],
			currentSequenceIdx,
			currentContentType;

		var configSettings = jq.extend({}, initialOptions, configOpts);

		function adjustDimensions() {
			var containerWidth = configSettings.hostingContainer.outerWidth() < jq(window).width() ? configSettings.hostingContainer.outerWidth() : jq(window).width(),
				containerHeight = configSettings.hostingContainer.outerHeight() < jq(window).height() ? configSettings.hostingContainer.outerHeight() : jq(window).height(),
				currentContainerRatio = containerWidth/containerHeight;

			// If the main body is the container, adjust its height for proper display.
			if (configSettings.hostingContainer.is(jq('body'))) {
				jq('html,body').css('height',jq(window).height() > jq('body').css('height','auto').height() ? '100%' : 'auto');
			}

			// Determine if the container is taller or wider than the media aspect ratio
			if (currentContainerRatio < aspectRatio) {
				// Taller container, media needs to fill height and potentially overflow width
				if (currentContentType == 'video') {
					mediaEngine
						.width(containerHeight*aspectRatio)
						.height(containerHeight);
					if (!configSettings.canShrink) {
						jq(visualElemId)
							.css('top',0)
							.css('left',-(containerHeight*aspectRatio-containerWidth)/2)
							.css('height',containerHeight);
					} else {
						jq(visualElemId)
							.css('top',-(containerWidth/aspectRatio-containerHeight)/2)
							.css('left',0)
							.css('height',containerWidth/aspectRatio);
					}
					jq(visualElemId+'_html5_api')
						.css('width',containerHeight*aspectRatio)
						.css('height',containerHeight);
					jq(visualElemId+'_flash_api')
						.css('width',containerHeight*aspectRatio)
						.css('height',containerHeight);
				} else {
					// Handling an image (still)
					jq('#massive-clip-still')
						.css({
							width: 'auto',
							height: containerHeight,
							top:0,
							left:-(containerHeight*aspectRatio-containerWidth)/2
						});
				}
			} else {
				// Wider container, media needs to fill width and potentially overflow height
				if (currentContentType == 'video') {
					mediaEngine
						.width(containerWidth)
						.height(containerWidth/aspectRatio);
					jq(visualElemId)
						.css('top',-(containerWidth/aspectRatio-containerHeight)/2)
						.css('left',0)
						.css('height',containerWidth/aspectRatio);
					jq(visualElemId+'_html5_api')
						.css('width',jq(visualElemId+'_html5_api').parent().width()+"px")
						.css('height','auto');
					jq(visualElemId+'_flash_api')
						.css('width',containerWidth)
						.css('height',containerWidth/aspectRatio);
				} else {
					// Handling an image (still)
					jq('#massive-clip-still')
						.css({
							width: containerWidth,
							height: 'auto',
							top:-(containerWidth/aspectRatio-containerHeight)/2,
							left:0
						});
				}
			}
		}

		function initializePlaybackControls() {
			// Construct the HTML for the playback interface
			var controlHtml = ''+
				'<div id="playback-interface-container">'+
					'<div id="playback-interface">'+
						'<a href="#" id="playback-interface-play"></a>'+
						'<div id="playback-interface-middle">'+
							'<div id="playback-interface-bar">'+
								'<div id="playback-interface-bound-left"></div>'+
								'<div id="playback-interface-progress"></div>'+
								'<div id="playback-interface-track"></div>'+
								'<div id="playback-interface-bound-right"></div>'+
							'</div>'+
						'</div>'+
					'	<div id="playback-interface-timer"></div>'+
					'</div>'+
				'</div>';
			configSettings.hostingContainer.append(controlHtml);

			// Initially conceal the controls until video playback begins
			jq('#playback-interface-container').css('display','none');
			jq('#playback-interface-timer').css('display','none');

			// Attach event handlers for control interactions
			jq('#playback-interface-track').slider({
				animate: true,
				step: 0.005, // Finer control step for slider
				slide: function(evt,sliderData) {
					isNavigatingTime = true;
					jq('#playback-interface-progress').css('width',(sliderData.value-0.16)+'%');
					mediaEngine.currentTime((sliderData.value/100)*mediaEngine.duration());
				},
				stop:function(evt,sliderData) {
					isNavigatingTime = false;
					mediaEngine.currentTime((sliderData.value/100)*mediaEngine.duration());
				}
			});
			jq('#playback-interface-bar').click(function(evt) {
				mediaEngine.currentTime((evt.offsetX/jq(this).width())*mediaEngine.duration());
			});
			jq('#playback-interface-play').click(function(evt) {
				evt.preventDefault();
				managePlayback('toggle'); // Toggle play/pause state
			});
			mediaEngine.on('timeupdate', function() {
				if (!isNavigatingTime && (mediaEngine.currentTime()/mediaEngine.duration())) {
					var currentTimeSec = mediaEngine.currentTime();
					var minutesCount = Math.floor(currentTimeSec/60);
					var secondsCount = Math.floor(currentTimeSec) - (60*minutesCount);
					if (secondsCount < 10) secondsCount='0'+secondsCount;
					var currentProgress = mediaEngine.currentTime()/mediaEngine.duration()*100;
					jq('#playback-interface-track').slider('value',currentProgress);
					jq('#playback-interface-progress').css('width',(currentProgress-0.16)+'%');
					jq('#playback-interface-timer').text(minutesCount+':'+secondsCount+'/'+clipDurationInfo);
				}
			});
		}

		function managePlayback(actionType) {
			var specificAction = actionType || 'toggle';
			if (specificAction == 'toggle') specificAction = isCurrentlyPlaying ? 'pause' : 'play';
			if (specificAction == 'pause') {
				mediaEngine.pause();
				jq('#playback-interface-play').css('background-position','-16px'); // Change button icon to play
				isCurrentlyPlaying = false;

			} else if (specificAction == 'play') {
				mediaEngine.play();
				jq('#playback-interface-play').css('background-position','0'); // Change button icon to pause
				isCurrentlyPlaying = true;
			} else if (specificAction == 'skip') {
				advanceToNextMedia(); // Move to the next item in the playlist
			}
		}

		function configureAutoplay() {
			mediaEngine.play();
			configSettings.hostingContainer.off('click',configureAutoplay); // Remove click handler after first play
		}

		function advanceToNextMedia() {
			currentSequenceIdx++;
			if (currentSequenceIdx === mediaSequence.length) currentSequenceIdx=0; // Loop back to start if end reached
			renderVideoContent(mediaSequence[currentSequenceIdx]);
		}

		function renderVideoContent(contentSource) {

			// Ensure video element is visible and any image is cleared
			jq(visualElemId).css('display','block');
			currentContentType = 'video';
			mediaEngine.src(contentSource);
			isCurrentlyPlaying = true;
			if (isBackgroundMode) {
				jq('#playback-interface-container').css('display','none'); // Hide controls for ambient mode
				mediaEngine.ready(function(){
					this.volume(0); // Mute video in ambient mode
				});
				configSettings.shouldLoop = true; // Force looping
			} else {
				jq('#playback-interface-container').css('display','block'); // Show controls for normal playback
				mediaEngine.ready(function(){
					this.volume(initialAudioLevel); // Set default volume
				});
				configSettings.shouldLoop = false; // Disable looping by default if not ambient
			}
			jq('#massive-clip-still').css('display','none');
			jq(visualElemId).css('display','block');
		}

		function displayPosterImage(contentSource) {
			// Remove any existing background image
			jq('#massive-clip-still').remove();

			// Pause video and hide video element and controls
			mediaEngine.pause();
			jq(visualElemId).css('display','none');
			jq('#playback-interface-container').css('display','none');

			// Display the new background image
			currentContentType = 'image';
			var backgroundImageElement = jq('<img id="massive-clip-still" src='+contentSource+' />');
			containerWrapper.append(backgroundImageElement);

			// Once image is loaded, calculate its aspect ratio and update display size
			jq('#massive-clip-still').imagesLoaded(function() {
				aspectRatio = jq('#massive-clip-still').width() / jq('#massive-clip-still').height();
				adjustDimensions();
			});
		}

		MassiveClipInstance.init = function() {
			if (!hasBeenSetup) {
				// Create the video player element and append to the wrapper
				configSettings.hostingContainer.prepend(containerWrapper);
				var autoPlayAttribute = configSettings.forceInitialPlayback ? 'autoplay' : '';
				mediaEngine = jq('<video id="'+visualElemId.substr(1)+'" class="clip-js cjf-standard-theme" height="1" width="1" preload="auto" data-setup="{}" '+autoPlayAttribute+' webkit-playsinline></video>');
				mediaEngine.css('position','absolute');
				containerWrapper.append(mediaEngine);

				// Determine technology order for video.js (HTML5 first, then Flash)
				var techOrderPreference = ['html5','flash'];
				// If using mp4s and on Firefox, prioritize Flash for better compatibility
				var userAgentLower = navigator.userAgent.toLowerCase();
				var isFirefoxBrowser = userAgentLower.indexOf('firefox') != -1;
				if (configSettings.enableFlashForFirefox && (isFirefoxBrowser)) {
					techOrderPreference = ['flash', 'html5'];
				}
				// Initialize video.js player
				mediaEngine = clipEngine(visualElemId.substr(1), {
					controls:false,
					autoplay:true, // Autoplay for video.js internal handling
					preload:'auto',
					techOrder:techOrderPreference
				});

				// If controls are enabled in settings, initialize them
				if (configSettings.displayControls) initializePlaybackControls();

				// Set initial state and adjust size
				adjustDimensions();
				hasBeenSetup = true;
				isCurrentlyPlaying = false;

				// For forced autoplay, attach a click handler to body
				if (configSettings.forceInitialPlayback) {
					jq('body').on('click', configureAutoplay);
				}

				// Apply specific attributes for Flash API for proper scaling
				jq('#massive-clip-element_flash_api')
					.attr('scale','noborder')
					.attr('width','100%')
					.attr('height','100%');

				// Set up event listeners
				jq(window).on('resize.massiveclip', function() {
					adjustDimensions(); // Recalculate dimensions on window resize
				});

				mediaEngine.on('loadedmetadata', function(metadataEvent) {
					// Get aspect ratio from either Flash or HTML5 player
					if (document.getElementById('massive-clip-element_flash_api')) {
						aspectRatio = document.getElementById('massive-clip-element_flash_api').vjs_getProperty('videoWidth')/document.getElementById('massive-clip-element_flash_api').vjs_getProperty('videoHeight');
					} else {
						aspectRatio = jq('#massive-clip-element_html5_api').prop('videoWidth')/jq('#massive-clip-element_html5_api').prop('videoHeight');
					}
					adjustDimensions();
					// Format video duration for display
					var totalSeconds = Math.round(mediaEngine.duration());
					var durationMinutes = Math.floor(totalSeconds/60);
					var remainingSeconds = totalSeconds - durationMinutes*60;
					if (remainingSeconds < 10) remainingSeconds='0'+remainingSeconds;
					clipDurationInfo = durationMinutes+':'+remainingSeconds;
				});

				mediaEngine.on('ended', function() {
					if (configSettings.shouldLoop) {
						mediaEngine.currentTime(0); // Reset to start
						mediaEngine.play(); // Replay
					}
					if (hasPlaylistActive) {
						advanceToNextMedia(); // Play next item in sequence
					}
				});
			}
		};

		/**
		 * Display video or still image content.
		 *
		 * @param contentSource: The media to display. Can be:
		 *		- an array of objects for different video file types (e.g., mp4, webm)
		 *		- a string URL to a single video file (mp4, ogg, etc.)
		 *		- a string URL to an image file (jpg, png, gif)
		 * @param configOpts: An object containing optional settings:
		 *		- boolean "ambient" to enable background looping and mute
		 *		- function onShown callback
		 */
		MassiveClipInstance.show = function(contentSource,configOpts) {
			if (configOpts === undefined) configOpts = {};
			isBackgroundMode = configOpts.ambient === true;
			if (isBackgroundMode || configOpts.doLoop) configSettings.shouldLoop = true;

			if (typeof(contentSource) === 'string') {
				// If a string URL, determine if it's an image or video
				var fileExtension = ( contentSource.lastIndexOf('?') > 0 ) ? contentSource.substring(contentSource.lastIndexOf('.')+1, contentSource.lastIndexOf('?')) : contentSource.substring( contentSource.lastIndexOf('.')+1);
				if (fileExtension == 'jpg' || fileExtension == 'gif' || fileExtension == 'png') {
					displayPosterImage(contentSource);
				} else if (fileExtension == 'mp4' || fileExtension == 'ogg' || fileExtension == 'ogv'|| fileExtension == 'webm') {
					renderVideoContent(contentSource);
					if (configOpts.onShown) configOpts.onShown();
					hasPlaylistActive = false; // Not a playlist, so disable queue
				}
			} else if (jq.isArray(contentSource)) {
				// If an array, pass directly to video renderer
				renderVideoContent(contentSource);
			} else if (typeof(contentSource) === "object" && contentSource.src && contentSource.type) {
				// If an object with src/type, wrap in array for video renderer
				renderVideoContent([contentSource]);
			} else {
				// Throw error for invalid input
				throw("MassiveClip.show received unsuitable input for contentSource parameter");
			}
		};

		/**
		 * Present a sequence of video files.
		 *
		 * @param contentFiles: An array of media elements to play in order.
		 * @param configOpts: An object with optional settings:
		 *		- boolean "ambient" to set video to loop and mute
		 *		- function onShown callback
		 */
		MassiveClipInstance.showPlaylist = function (contentFiles, configOpts) {
			if (!jq.isArray(contentFiles)) {
				throw("MassiveClip.showPlaylist 'contentFiles' parameter expects an array");
			}

			if (configOpts === undefined) configOpts = {};
			isBackgroundMode = configOpts.ambient === true;
			if (isBackgroundMode || configOpts.doLoop) configSettings.shouldLoop = true;

			mediaSequence = contentFiles;
			currentSequenceIdx = 0;
			this.show(mediaSequence[currentSequenceIdx]); // Display the first item
			if (configOpts.onShown) configOpts.onShown();
			hasPlaylistActive = true; // Enable playlist queue management
		};

		// Provide access to the underlying Clip.js player instance
		MassiveClipInstance.getMediaPlayer = function() {
			return mediaEngine;
		};

		// Remove and dispose of the player and associated elements
		MassiveClipInstance.destroy = MassiveClipInstance.clear = function() {
			hasBeenSetup = false;

			containerWrapper.remove(); // Remove the entire wrapper element
			jq(window).off('resize.massiveclip'); // Unbind resize handler

			if(mediaEngine) {
				mediaEngine.off('loadedmetadata'); // Remove metadata event listener
				mediaEngine.off('ended'); // Remove ended event listener
				mediaEngine.dispose(); // Dispose the video.js player
			}
		};

		// Trigger specific actions on the player (e.g., play, pause, skip)
		// Example: MassiveClip.triggerPlayerAction('skip')
		MassiveClipInstance.triggerPlayerAction = function(action){
			managePlayback(action);
		};

		return MassiveClipInstance;

	};
});