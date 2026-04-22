// This file contains the BigVideo jQuery Plugin's core logic.
// It was developed by John Polacek (@johnpolacek).

// This software is provided under a dual license: MIT and GPL.

// Key dependencies for this plugin include:
// - jQuery: For DOM manipulation and utility functions.
// - jQuery UI (Slider): Used for the video progress bar.
// - Video.js: The primary video player library.
// - ImagesLoaded: To handle image loading events.


( function  (    factory    )   {

	'use strict' ; // Enforce strict mode for cleaner code.

	// Check for AMD (Asynchronous Module Definition) environment.
	if  (  typeof define   ===   'function'  &&  define.amd  )  {
		// Register the plugin as an anonymous AMD module.
		// This allows it to be loaded by AMD loaders like RequireJS.
		define ( [

			'jquery'    ,
			'videojs'   ,
			'imagesloaded'  ,
			'jquery-ui'

		] , factory ) ;

	} else {
		// If no AMD is found, assume a global environment
		// and pass jQuery and videojs directly to the factory function.
		factory ( jQuery , videojs ) ;
	}

} ) ( function ( $ , videojs ) { // The main factory function where the plugin is defined.


	// Define the BigVideo plugin as a jQuery extension.
	$.BigVideo = function ( options ) {


		// Default configuration settings for the BigVideo plugin.
		var defaults = {
			// If set to true, Firefox will use Flash for MP4 playback.
			// This can be useful for broader compatibility with specific codecs.
			useFlashForFirefox : true ,

			// If a playlist is used, and it's a touchscreen device,
			// the video might not autoplay without a user interaction.
			// Setting this to true forces a click event handler.
			forceAutoplay : false ,

			// Determines whether the default video controls (play/pause, progress) are displayed.
			controls : false ,

			// If true, the video will loop indefinitely once it reaches its end.
			doLoop : false ,

			// The container element where the video/image will be placed.
			// Defaults to the entire body of the document.
			container : $ ( 'body' ) ,

			// If true, the video will shrink to fit the container without cropping.
			// Otherwise, it will cover the container, potentially cropping.
			shrinkable : false
		} ;


		// Private variables used within the BigVideo instance.
		var BigVideo = { } , // The object that will be returned, exposing public methods.
			player ,          // Reference to the Video.js player instance.

			vidEl = '#big-video-vid' , // The ID selector for the video element.

			wrap = $ ( '<div id="big-video-wrap"></div>' ) , // The wrapper div for the video/image.

			video = $ ( '' ) , // An unused jQuery object, possibly a leftover or placeholder.

			mediaAspect = 16 / 9 , // Default aspect ratio for media (16:9 widescreen).

			vidDur = 0 , // Stores the formatted duration of the current video.

			defaultVolume = 0.8 , // Default playback volume for videos.

			isInitialized = false , // Flag to track if the plugin has been initialized.

			isSeeking = false , // Flag to indicate if the user is currently seeking in the video.

			isPlaying = false , // Flag to track the current playback state (playing or paused).

			isQueued = false , // Flag to indicate if a playlist is currently active.

			isAmbient = false , // Flag to indicate if the video is playing in ambient mode (muted, looping).

			playlist = [ ] , // Array to store video sources for playlist functionality.

			currMediaIndex , // Index of the currently playing media in the playlist.

			currMediaType ; // Type of the currently displayed media ('video' or 'image').


		// Merge default settings with user-provided options.
		var settings = $.extend ( { } , defaults , options ) ;


		/**
		 * Adjusts the size and position of the video or image to fit the container.
		 * This function is called on initialization and whenever the window is resized.
		 */
		function updateSize ( ) {

			// Determine the effective width and height of the container.
			// It takes the minimum of the container's outer dimensions and the window's dimensions.
			var containerW = settings.container.outerWidth ( ) < $ ( window ).width ( ) ? settings.container.outerWidth ( ) : $ ( window ).width ( ) ,
				containerH = settings.container.outerHeight ( ) < $ ( window ).height ( ) ? settings.container.outerHeight ( ) : $ ( window ).height ( ) ,
				containerAspect = containerW / containerH ; // Calculate the aspect ratio of the container.


			// If the container is the body, ensure HTML and body heights are correctly set.
			// This handles cases where body height might not be 100% initially.
			if ( settings.container.is ( $ ( 'body' ) ) ) {
				$ ( 'html,body' ).css ( 'height' , $ ( window ).height ( ) > $ ( 'body' ).css ( 'height' , 'auto' ).height ( ) ? '100%' : 'auto' ) ;
			}


			// Logic to resize media based on aspect ratio comparison.
			if ( containerAspect < mediaAspect ) {
				// The container is taller (or narrower) than the media.
				// Media needs to be scaled by height to cover the container.

				if ( currMediaType == 'video' ) {
					// Resize the video player.
					player
						.width ( containerH * mediaAspect ) // Calculate width to maintain aspect ratio based on container height.
						.height ( containerH ) ;            // Set height to container height.

					if ( ! settings.shrinkable ) {
						// If not shrinkable, position to cover the container (crop edges).
						$ ( vidEl )
							.css ( 'top' , 0 )
							.css ( 'left' , - ( containerH * mediaAspect - containerW ) / 2 ) // Center horizontally.
							.css ( 'height' , containerH ) ;
					} else {
						// If shrinkable, fit within the container (letterbox).
						$ ( vidEl )
							.css ( 'top' , - ( containerW / mediaAspect - containerH ) / 2 ) // Center vertically.
							.css ( 'left' , 0 )
							.css ( 'height' , containerW / mediaAspect ) ;
					}

					// Ensure HTML5 and Flash API elements also scale correctly.
					$ ( vidEl + '_html5_api' )
						.css ( 'width' , containerH * mediaAspect )
						.css ( 'height' , containerH ) ;

					$ ( vidEl + '_flash_api' )
						.css ( 'width' , containerH * mediaAspect )
						.css ( 'height' , containerH ) ;

				} else {
					// Current media is an image.
					$ ( '#big-video-image' )
						.css ( {
							width : 'auto' ,
							height : containerH ,
							top : 0 ,
							left : - ( containerH * mediaAspect - containerW ) / 2 // Center horizontally.
						} ) ;
				}

			} else {
				// The container is wider (or shorter) than the media.
				// Media needs to be scaled by width to cover the container.

				if ( currMediaType == 'video' ) {
					// Resize the video player.
					player
						.width ( containerW )                  // Set width to container width.
						.height ( containerW / mediaAspect ) ; // Calculate height to maintain aspect ratio based on container width.

					$ ( vidEl )
						.css ( 'top' , - ( containerW / mediaAspect - containerH ) / 2 ) // Center vertically.
						.css ( 'left' , 0 )
						.css ( 'height' , containerW / mediaAspect ) ;

					// Ensure HTML5 and Flash API elements also scale correctly.
					$ ( vidEl + '_html5_api' )
						.css ( 'width' , $ ( vidEl + '_html5_api' ).parent ( ).width ( ) + "px" )
						.css ( 'height' , 'auto' ) ;

					$ ( vidEl + '_flash_api' )
						.css ( 'width' , containerW )
						.css ( 'height' , containerW / mediaAspect ) ;

				} else {
					// Current media is an image.
					$ ( '#big-video-image' )
						.css ( {
							width : containerW ,
							height : 'auto' ,
							top : - ( containerW / mediaAspect - containerH ) / 2 , // Center vertically.
							left : 0
						} ) ;
				}
			}
		}


		/**
		 * Initializes the video playback control elements and their event handlers.
		 * This includes the play/pause button, progress bar, and timer.
		 */
		function initPlayControl ( ) {

			// HTML markup for the video controls interface.
			var markup =
				'<div id="big-video-control-container">' +
					'<div id="big-video-control">' +
						'<a href="#" id="big-video-control-play"></a>' +
						'<div id="big-video-control-middle">' +
							'<div id="big-video-control-bar">' +
								'<div id="big-video-control-bound-left"></div>' +
								'<div id="big-video-control-progress"></div>' +
								'<div id="big-video-control-track"></div>' +
								'<div id="big-video-control-bound-right"></div>' +
							'</div>' +
						'</div>' +
						'<div id="big-video-control-timer"></div>' +
					'</div>' +
				'</div>' ;

			// Append the generated control markup to the specified container.
			settings.container.append ( markup ) ;


			// Initially hide the control container and timer.
			// They will be shown when a video is played, unless it's in ambient mode.
			$ ( '#big-video-control-container' ).css ( 'display' , 'none' ) ;
			$ ( '#big-video-control-timer' ).css ( 'display' , 'none' ) ;


			// Set up the jQuery UI slider for the video progress bar.
			$ ( '#big-video-control-track' ).slider ( {
				animate : true , // Enable animation for slider transitions.
				step : 0.01 ,    // Granularity of the slider's step value.

				// Event handler for when the slider is being dragged.
				slide : function ( e , ui ) {
					isSeeking = true ; // Set seeking flag to true.
					$ ( '#big-video-control-progress' ).css ( 'width' , ( ui.value - 0.16 ) + '%' ) ; // Update progress bar width.
					player.currentTime ( ( ui.value / 100 ) * player.duration ( ) ) ; // Set video current time.
				} ,

				// Event handler for when the user stops dragging the slider.
				stop : function ( e , ui ) {
					isSeeking = false ; // Reset seeking flag.
					player.currentTime ( ( ui.value / 100 ) * player.duration ( ) ) ; // Final update of video current time.
				}
			} ) ;

			// Click handler for the progress bar area to seek directly.
			$ ( '#big-video-control-bar' ).click ( function ( e ) {
				// Calculate new current time based on click position relative to bar width.
				player.currentTime ( ( e.offsetX / $ ( this ).width ( ) ) * player.duration ( ) ) ;
			} ) ;

			// Click handler for the play/pause button.
			$ ( '#big-video-control-play' ).click ( function ( e ) {
				e.preventDefault ( ) ; // Prevent default anchor link behavior.
				playControl ( 'toggle' ) ; // Toggle play/pause state.
			} ) ;

			// Event listener for the video player's 'timeupdate' event.
			player.on ( 'timeupdate' , function ( ) {
				// Only update if not currently seeking and duration is available.
				if ( ! isSeeking && ( player.currentTime ( ) / player.duration ( ) ) ) {
					var currTime = player.currentTime ( ) ; // Current playback time in seconds.
					var minutes = Math.floor ( currTime / 60 ) ; // Calculate minutes.
					var seconds = Math.floor ( currTime ) - ( 60 * minutes ) ; // Calculate remaining seconds.

					if ( seconds < 10 ) seconds = '0' + seconds ; // Pad seconds with leading zero if less than 10.

					var progress = player.currentTime ( ) / player.duration ( ) * 100 ; // Calculate progress as a percentage.

					$ ( '#big-video-control-track' ).slider ( 'value' , progress ) ; // Update slider position.
					$ ( '#big-video-control-progress' ).css ( 'width' , ( progress - 0.16 ) + '%' ) ; // Update progress bar visual width.
					$ ( '#big-video-control-timer' ).text ( minutes + ':' + seconds + '/' + vidDur ) ; // Update timer display.
				}
			} ) ;
		}


		/**
		 * Controls video playback (play, pause, toggle, skip).
		 * @param {string} a - The action to perform ('toggle', 'play', 'pause', 'skip').
		 */
		function playControl ( a ) {
			var action = a || 'toggle' ; // Default action is 'toggle' if none is provided.

			// If action is 'toggle', determine actual action based on current state.
			if ( action == 'toggle' ) action = isPlaying ? 'pause' : 'play' ;

			if ( action == 'pause' ) {
				player.pause ( ) ; // Pause the video.
				$ ( '#big-video-control-play' ).css ( 'background-position' , '-16px' ) ; // Update play button icon to 'play'.
				isPlaying = false ; // Update playing state.

			} else if ( action == 'play' ) {
				player.play ( ) ; // Play the video.
				$ ( '#big-video-control-play' ).css ( 'background-position' , '0' ) ; // Update play button icon to 'pause'.
				isPlaying = true ; // Update playing state.

			} else if ( action == 'skip' ) {
				nextMedia ( ) ; // Skip to the next media in the playlist.
			}
		}


		/**
		 * Sets up autoplay for touch devices by playing the video
		 * and then removing the click listener.
		 */
		function setUpAutoPlay ( ) {
			player.play ( ) ; // Start video playback.
			settings.container.off ( 'click' , setUpAutoPlay ) ; // Remove the click listener after first play.
		}


		/**
		 * Advances to the next media item in the playlist.
		 * If at the end of the playlist, it loops back to the beginning.
		 */
		function nextMedia ( ) {
			currMediaIndex ++ ; // Increment the current media index.

			// If the index exceeds the playlist length, reset to the first item.
			if ( currMediaIndex === playlist.length ) currMediaIndex = 0 ;

			playVideo ( playlist [ currMediaIndex ] ) ; // Play the next video in the playlist.
		}


		/**
		 * Plays a video from the given source.
		 * @param {string|Array} source - The video source(s) to play.
		 */
		function playVideo ( source ) {

			// Ensure the video element is visible.
			$ ( vidEl ).css ( 'display' , 'block' ) ;
			currMediaType = 'video' ; // Set current media type to video.
			player.src ( source ) ; // Set the video source for the player.
			isPlaying = true ; // Mark as playing.

			if ( isAmbient ) {
				// If ambient mode, hide controls and mute volume.
				$ ( '#big-video-control-container' ).css ( 'display' , 'none' ) ;
				player.ready ( function ( ) {
					player.volume ( 0 ) ; // Mute the volume.
				} ) ;
				settings.doLoop = true ; // Ensure looping is enabled for ambient video.
			} else {
				// If not ambient, show controls and set default volume.
				$ ( '#big-video-control-container' ).css ( 'display' , 'block' ) ;
				player.ready ( function ( ) {
					player.volume ( defaultVolume ) ; // Set to default volume.
				} ) ;
				settings.doLoop = false ; // Disable looping unless explicitly set.
			}

			// Hide any previously displayed image and show the video element.
			$ ( '#big-video-image' ).css ( 'display' , 'none' ) ;
			$ ( vidEl ).css ( 'display' , 'block' ) ;
		}


		/**
		 * Displays a poster image.
		 * @param {string} source - The URL of the image to display.
		 */
		function showPoster ( source ) {
			// Remove any existing background image.
			$ ( '#big-video-image' ).remove ( ) ;

			// Pause the video and hide video elements and controls.
			player.pause ( ) ;
			$ ( vidEl ).css ( 'display' , 'none' ) ;
			$ ( '#big-video-control-container' ).css ( 'display' , 'none' ) ;

			// Create and append the new image element.
			currMediaType = 'image' ; // Set current media type to image.
			var bgImage = $ ( '<img id="big-video-image" src=' + source + ' />' ) ;
			wrap.append ( bgImage ) ;

			// Once the image is loaded, calculate its aspect ratio and update size.
			$ ( '#big-video-image' ).imagesLoaded ( function ( ) {
				mediaAspect = $ ( '#big-video-image' ).width ( ) / $ ( '#big-video-image' ).height ( ) ;
				updateSize ( ) ; // Adjust the display size based on the new image's aspect ratio.
			} ) ;
		}


		/**
		 * Initializes the BigVideo plugin, setting up the video player and event listeners.
		 * This method should be called once to prepare the environment.
		 */
		BigVideo.init = function ( ) {
			if ( ! isInitialized ) { // Only initialize if not already done.

				// Create the video player elements.
				settings.container.prepend ( wrap ) ; // Prepend the wrapper div to the container.
				var autoPlayString = settings.forceAutoplay ? 'autoplay' : '' ; // Determine if autoplay attribute should be added.

				// Create the video.js player element.
				player = $ ( '<video id="' + vidEl.substr ( 1 ) + '" class="video-js vjs-default-skin" height="1" width="1" preload="auto" data-setup="{}" ' + autoPlayString + ' webkit-playsinline></video>' ) ;
				player.css ( 'position' , 'absolute' ) ; // Position the video absolutely.
				wrap.append ( player ) ; // Append the video element to the wrapper.


				// Determine the technology order for Video.js (HTML5 first, then Flash).
				var videoTechOrder = [ 'html5' , 'flash' ] ;
				// Special handling for Firefox if using MP4s, to force Flash fallback.
				var ua = navigator.userAgent.toLowerCase ( ) ;
				var isFirefox = ua.indexOf ( 'firefox' ) != -1 ;
				if ( settings.useFlashForFirefox && ( isFirefox ) ) {
					videoTechOrder = [ 'flash' , 'html5' ] ;
				}

				// Initialize Video.js player.
				player = videojs ( vidEl.substr ( 1 ) , {
					controls : false , // Hide default Video.js controls.
					autoplay : true ,  // Enable autoplay (Video.js handles this, not the HTML attribute).
					preload : 'auto' , // Preload video metadata and a portion of the file.
					techOrder : videoTechOrder // Set the preferred technology order.
				} ) ;


				// If controls are enabled in settings, initialize custom play controls.
				if ( settings.controls ) initPlayControl ( ) ;

				// Set initial state flags.
				updateSize ( ) ;      // Perform initial size adjustment.
				isInitialized = true ; // Mark plugin as initialized.
				isPlaying = false ;   // Initially, video is not playing.


				// If forceAutoplay is enabled, attach a click handler to body to initiate playback.
				if ( settings.forceAutoplay ) {
					$ ( 'body' ).on ( 'click' , setUpAutoPlay ) ;
				}


				// Specific attributes for the Flash API object to ensure proper scaling.
				$ ( '#big-video-vid_flash_api' )
					.attr ( 'scale' , 'noborder' )
					.attr ( 'width' , '100%' )
					.attr ( 'height' , '100%' ) ;


				// Register window resize event handler.
				$ ( window ).on ( 'resize.bigvideo' , function ( ) {
					updateSize ( ) ; // Recalculate and adjust media size on window resize.
				} ) ;


				// Event listener for when video metadata is loaded.
				player.on ( 'loadedmetadata' , function ( data ) {
					// Get the actual media aspect ratio from either Flash or HTML5 player.
					if ( document.getElementById ( 'big-video-vid_flash_api' ) ) {
						// Use Flash API properties.
						mediaAspect = document.getElementById ( 'big-video-vid_flash_api' ).vjs_getProperty ( 'videoWidth' ) / document.getElementById ( 'big-video-vid_flash_api' ).vjs_getProperty ( 'videoHeight' ) ;
					} else {
						// Use HTML5 player properties.
						mediaAspect = $ ( '#big-video-vid_html5_api' ).prop ( 'videoWidth' ) / $ ( '#big-video-vid_html5_api' ).prop ( 'videoHeight' ) ;
					}
					updateSize ( ) ; // Adjust size based on the actual media aspect ratio.

					// Format and store video duration.
					var dur = Math.round ( player.duration ( ) ) ;
					var durMinutes = Math.floor ( dur / 60 ) ;
					var durSeconds = dur - durMinutes * 60 ;
					if ( durSeconds < 10 ) durSeconds = '0' + durSeconds ;
					vidDur = durMinutes + ':' + durSeconds ;
				} ) ;


				// Event listener for when the video ends.
				player.on ( 'ended' , function ( ) {
					if ( settings.doLoop ) {
						player.currentTime ( 0 ) ; // Reset to beginning.
						player.play ( ) ;          // Play again.
					}
					if ( isQueued ) {
						nextMedia ( ) ; // If a playlist is active, play the next item.
					}
				} ) ;
			}
		} ;


		/**
		 * Public method to show a video or an image.
		 *
		 * @param {string|Array|Object} source - The media source. Can be:
		 *   - An array of objects for different video file types (e.g., [{src: 'video.mp4', type: 'video/mp4'}]).
		 *   - A string URL to a single video file (e.g., 'video.mp4').
		 *   - A string URL to an image file (e.g., 'image.jpg').
		 *   - An object with 'src' and 'type' attributes (e.g., {src: 'video.webm', type: 'video/webm'}).
		 * @param {Object} [options] - Optional settings for this specific media.
		 *   - {boolean} "ambient": If true, the video will be muted and loop.
		 *   - {function} onShown: A callback function to execute after the media is shown.
		 */
		BigVideo.show = function ( source , options ) {
			if ( options === undefined ) options = { } ; // Ensure options object exists.
			isAmbient = options.ambient === true ;       // Set ambient flag.
			if ( isAmbient || options.doLoop ) settings.doLoop = true ; // Enable looping if ambient or doLoop is true.

			if ( typeof ( source ) === 'string' ) {
				// If the source is a string, determine if it's an image or video based on extension.
				var ext = ( source.lastIndexOf ( '?' ) > 0 ) ? source.substring ( source.lastIndexOf ( '.' ) + 1 , source.lastIndexOf ( '?' ) ) : source.substring ( source.lastIndexOf ( '.' ) + 1 ) ;

				if ( ext == 'jpg' || ext == 'gif' || ext == 'png' ) {
					showPoster ( source ) ; // Show as an image.
				} else if ( ext == 'mp4' || ext == 'ogg' || ext == 'ogv' || ext == 'webm' ) {
					playVideo ( source ) ; // Play as a video.
					if ( options.onShown ) options.onShown ( ) ; // Execute onShown callback if provided.
					isQueued = false ; // Not part of a playlist queue.
				}
			} else if ( $.isArray ( source ) ) {
				// If the input is an array, pass it directly to videojs for multi-source video playback.
				playVideo ( source ) ;
			} else if ( typeof ( source ) === "object" && source.src && source.type ) {
				// If the input is a valid object with src and type, wrap it in an array and play.
				playVideo ( [ source ] ) ;
			} else {
				// Throw an error for invalid source input.
				throw ( "BigVideo.show received invalid input for parameter source" ) ;
			}
		} ;


		/**
		 * Public method to show a playlist of video files.
		 *
		 * @param {Array} files - An array of media sources (strings or objects) to be played in sequence.
		 * @param {Object} [options] - Optional settings for the playlist.
		 *   - {boolean} "ambient": If true, all videos in the playlist will be muted and loop.
		 *   - {function} onShown: A callback function to execute after the first media item is shown.
		 */
		BigVideo.showPlaylist = function ( files , options ) {
			if ( ! $.isArray ( files ) ) {
				throw ( "BigVideo.showPlaylist parameter files accepts only arrays" ) ;
			}

			if ( options === undefined ) options = { } ; // Ensure options object exists.
			isAmbient = options.ambient === true ;       // Set ambient flag.
			if ( isAmbient || options.doLoop ) settings.doLoop = true ; // Enable looping if ambient or doLoop is true.

			playlist = files ; // Store the provided files as the playlist.
			currMediaIndex = 0 ; // Start with the first item in the playlist.
			this.show ( playlist [ currMediaIndex ] ) ; // Show the first item.
			if ( options.onShown ) options.onShown ( ) ; // Execute onShown callback if provided.
			isQueued = true ; // Mark that a playlist is active.
		} ;


		/**
		 * Public method to get the underlying Video.js player instance.
		 * This allows direct interaction with the Video.js API.
		 * @returns {Object} The Video.js player object.
		 */
		BigVideo.getPlayer = function ( ) {
			return player ;
		} ;


		/**
		 * Public method to remove and dispose of the BigVideo player and its elements.
		 * This cleans up the DOM and event listeners.
		 */
		BigVideo.remove = BigVideo.dispose = function ( ) {
			isInitialized = false ; // Reset initialization flag.

			wrap.remove ( ) ; // Remove the main wrapper element from the DOM.
			$ ( window ).off ( 'resize.bigvideo' ) ; // Remove the window resize event listener.

			if ( player ) {
				player.off ( 'loadedmetadata' ) ; // Remove loadedmetadata event listener.
				player.off ( 'ended' ) ;          // Remove ended event listener.
				player.dispose ( ) ;             // Dispose of the Video.js player instance.
			}
		} ;


		/**
		 * Public method to trigger actions on the player, such as play, pause, or skip.
		 * @param {string} action - The action to perform ('play', 'pause', 'skip').
		 *   'skip' is only applicable if a playlist is loaded.
		 */
		BigVideo.triggerPlayer = function ( action ) {
			playControl ( action ) ; // Delegate to the internal playControl function.
		} ;


		return BigVideo ; // Return the public BigVideo API object.

	} ;
} ) ;