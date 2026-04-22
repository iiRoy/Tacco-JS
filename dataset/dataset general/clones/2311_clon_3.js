;( function ( globalScope, currentDocument, jQuery, undefined ) {

	// Ensure jQuery is available
	if ( typeof jQuery === 'undefined' ) {
		console.error( 'jQuery is required for lightboxPro to function.' );
		return;
	}

	jQuery.lightboxPro = function( triggerElement, configOptions ) {

		// Core interface handler and module instance
		let interfaceHandler,
			// Default configuration settings
			defaultSettings = {
				useCSSTransitions : true,
				useSVGIcons : true,
				startingItemIndex : 0,
				hideCloserOnMobile : false,
				autoHideControlsDelay : 3000,
				maxVideoDisplayWidth : 1140,
				vimeoAccentColor : 'cccccc',
				onBeforeShow: null,
				onAfterShow: null,
				onAfterHide: null,
				loopSlides: false,
				autoPlayContent: false,
				keyboardNavigation: true, // New option
				allowVerticalClose: true  // New option
			},

			moduleInstance = this,
			mediaItems = [], // Array to hold media objects: [ { src:'...', caption:'...' }, ...],
			$targetElements,
			triggerSelector = triggerElement.selector,
			$triggerCollection = jQuery( triggerSelector ),
			isHandheldDevice = /(iPad|iPhone|iPod|Android|PlayBook|BB10|BlackBerry|Opera Mini|IEMobile|webOS|MeeGo)/i.test( navigator.userAgent ),
			hasTouchInput = isHandheldDevice || ( 'ontouchstart' in globalScope ) || ( 'onmsgesturechange' in globalScope ) || ( navigator.msMaxTouchPoints > 0 ),
			canRenderSVG = !! currentDocument.createElementNS && !! currentDocument.createElementNS( 'http://www.w3.org/2000/svg', 'svg').createSVGRect,
			viewportWidth = globalScope.innerWidth || jQuery( globalScope ).width(),
			viewportHeight = globalScope.innerHeight || jQuery( globalScope ).height(),
			currentTranslationX = 0, // Current X-axis translation for the carousel
			// Markup for the lightbox overlay and its components
			overlayMarkup = '<div id="lightbox-wrapper">\
					<div id="lightbox-container">\
						<div id="media-carousel"></div>\
						<div id="header-controls">\
							<div id="media-caption"></div>\
						</div>\
						<div id="footer-controls">\
							<div id="navigation-arrows">\
								<a id="arrow-previous"></a>\
								<a id="arrow-next"></a>\
							</div>\
						</div>\
						<a id="close-button"></a>\
					</div>\
			</div>';

		// Public settings accessible via moduleInstance
		moduleInstance.settings = {};

		// Helper to check if a value is defined (not null or undefined)
		const isDefined = val => val !== undefined && val !== null;

		// Public API method to close the lightbox
		jQuery.lightboxPro.close = function () {
			interfaceHandler.shutDownDisplay();
		};

		// Public API method to extend the interface handler (expose internal methods)
		jQuery.lightboxPro.exposeAPI = function () {
			return interfaceHandler;
		};

		// Main initialization function for the module
		moduleInstance.initialize = function() {

			// Merge default settings with user-provided options
			moduleInstance.settings = jQuery.extend( {}, defaultSettings, configOptions );

			// Determine if media items are provided as an array or via a selector
			if ( jQuery.isArray( triggerElement ) ) {

				mediaItems = triggerElement;
				interfaceHandler.eventTarget = jQuery( globalScope ); // Target for custom events
				interfaceHandler.initializeLightbox( moduleInstance.settings.startingItemIndex );

			} else {

				// Bind click event to the trigger selector
				jQuery( currentDocument ).on( 'click', triggerSelector, function( event ) {

					// Prevent opening if the clicked element is already the current slide
					if ( jQuery( event.currentTarget ).parent().hasClass( 'slide current' ) ) {
						return false;
					}

					// Destroy previous instance if not an array of elements
					if ( ! jQuery.isArray( triggerElement ) ) {
						interfaceHandler.destroyLightbox();
						$targetElements = jQuery( triggerSelector ); // Re-select elements
						interfaceHandler.bindActions(); // Re-bind actions
					}

					// Clear previous media items and populate new ones
					mediaItems = [];
					let itemIndex , relationAttributeName, relationAttributeValue;

					// Prioritize HTML5 data-rel attribute, then standard rel
					relationAttributeName = jQuery( event.currentTarget ).attr( 'data-rel' ) ? 'data-rel' : ( jQuery( event.currentTarget ).attr( 'rel' ) ? 'rel' : null );
					relationAttributeValue = relationAttributeName ? jQuery( event.currentTarget ).attr( relationAttributeName ) : null;

					// Filter elements based on relation attribute if available and valid
					if ( relationAttributeValue && relationAttributeValue !== '' && relationAttributeValue !== 'nofollow' ) {
						$targetElements = $triggerCollection.filter( '[' + relationAttributeName + '="' + relationAttributeValue + '"]' );
					} else {
						$targetElements = jQuery( triggerSelector );
					}

					// Populate the mediaItems array
					$targetElements.each( function() {
						const $thisItem = jQuery( this );
						const mediaCaption = $thisItem.attr( 'data-title' ) || $thisItem.attr( 'title' ) || null;
						const mediaSource = $thisItem.attr( 'href' ) || null;

						if (mediaSource) { // Only add if a source is available
							mediaItems.push( {
								src: mediaSource,
								caption: mediaCaption
							} );
						}
					} );

					// Get the index of the clicked element within the filtered collection
					itemIndex = $targetElements.index( jQuery( event.currentTarget ) );
					event.preventDefault();
					event.stopPropagation();
					interfaceHandler.eventTarget = jQuery( event.currentTarget );
					interfaceHandler.initializeLightbox( itemIndex );
				} );
			}
		};

		// The core interface handler object
		interfaceHandler = {

			// Custom event target (usually the element that triggered the lightbox)
			eventTarget : jQuery( globalScope ),
			timeoutId : null, // For controlling the auto-hide timer

			/**
			 * Initialize the lightbox display.
			 * @param {number} initialIndex - The index of the media item to start with.
			 */
			initializeLightbox : function( initialIndex ) {
				// Guard clause: do not initialize if no media items
				if ( mediaItems.length === 0 ) {
					console.warn('lightboxPro: No media items found to display.');
					return;
				}

				if ( moduleInstance.settings.onBeforeShow ) {
					moduleInstance.settings.onBeforeShow();
				}
				this.eventTarget.trigger( 'lightboxPro-start' );
				jQuery.lightboxPro.isOpen = true;
				jQuery( 'body' ).addClass( 'lightboxPro-active' ); // Add a class to body
				this.constructUI();
				this.activateSlide( initialIndex );
				this.loadMediaContent( initialIndex );
				this.prefetchMediaContent( initialIndex + 1 );
				this.prefetchMediaContent( initialIndex - 1 );
				if ( moduleInstance.settings.onAfterShow ) {
					moduleInstance.settings.onAfterShow();
				}
			},

			/**
			 * Build the HTML structure for the lightbox.
			 */
			constructUI : function () {
				const self = this;
				let currentBgImage;

				jQuery( 'body' ).append( overlayMarkup );

				// Update SVG icons if supported and enabled
				if ( canRenderSVG && moduleInstance.settings.useSVGIcons === true ) {
					const $closeButton = jQuery( '#close-button' );
					currentBgImage = $closeButton.css( 'background-image' );
					// Replace .png with .svg in the background-image URL
					if (currentBgImage && currentBgImage.includes('url(')) {
						currentBgImage = currentBgImage.replace( /url\((['"]?)(.*?)\.(png|gif)\1\)/i, 'url($1$2.svg$1)' );
						jQuery( '#arrow-previous, #arrow-next, #close-button' ).css( {
							'background-image' : currentBgImage
						} );
					}
				}

				// Remove top/bottom bars on mobile if configured
				if ( isHandheldDevice && moduleInstance.settings.hideCloserOnMobile ) {
					jQuery( '#footer-controls, #header-controls' ).remove();
				}

				// Append slide containers for each media item
				mediaItems.forEach( function() {
					jQuery( '#media-carousel' ).append( '<div class="slide-item"></div>' );
				} );

				self.adjustDimensions();
				self.bindActions(); // Bind event listeners

				if ( hasTouchInput ) {
					self.handleGestures();
				}

				// Devices can have both touch and keyboard input so always allow key events
				if (moduleInstance.settings.keyboardNavigation) {
					self.handleKeyboardInput();
				}

				self.animateControls();
				self.handleResize(); // Attach resize handler
			},

			/**
			 * Update viewport dimensions helper function.
			 */
			updateViewportMetrics: function() {
				viewportWidth = globalScope.innerWidth || jQuery( globalScope ).width();
				viewportHeight = globalScope.innerHeight || jQuery( globalScope ).height();
			},

			/**
			 * Set dimensions of the lightbox overlay based on viewport size.
			 */
			adjustDimensions : function () {
				let currentWidth, currentHeight, overlayStyles = {};

				// Reset dimensions on mobile orientation change
				if ( 'onorientationchange' in globalScope ) {
					globalScope.addEventListener( 'orientationchange', function() {
						interfaceHandler.updateViewportMetrics(); // Update global viewport vars
						if ( globalScope.orientation === 0 || globalScope.orientation === 180 ) { // Portrait
							currentWidth = viewportWidth;
							currentHeight = viewportHeight;
						} else if ( globalScope.orientation === 90 || globalScope.orientation === -90 ) { // Landscape
							currentWidth = viewportHeight; // Swap width and height for landscape
							currentHeight = viewportWidth;
						}
						jQuery( '#lightbox-wrapper' ).css( { width: currentWidth, height: currentHeight } );
					}, false );
				} else {
					this.updateViewportMetrics();
					currentWidth = viewportWidth;
					currentHeight = viewportHeight;
				}

				overlayStyles = {
					width : currentWidth,
					height : currentHeight
				};

				jQuery( '#lightbox-wrapper' ).css( overlayStyles );
			},

			/**
			 * Respond to window resize events to adjust lightbox dimensions.
			 */
			handleResize : function () {
				const self = this;
				jQuery( globalScope ).on( 'resize.lightboxPro', function() { // Namespace event
					self.adjustDimensions();
				} ).trigger( 'resize.lightboxPro' ); // Trigger immediately on load
			},

			/**
			 * Determine the correct CSS transition property for the browser.
			 * @returns {string|boolean} The prefixed transition property or false if not supported.
			 */
			checkCSSTransitions : function () {
				const transitionPrefixes = 'transition WebkitTransition MozTransition OTransition msTransition KhtmlTransition'.split( ' ' );
				for ( let idx = 0; idx < transitionPrefixes.length; idx++ ) {
					if ( currentDocument.createElement( 'div' ).style[ transitionPrefixes[idx] ] !== undefined ) {
						return transitionPrefixes[idx];
					}
				}
				return false;
			},

			/**
			 * Check if CSS transitions are enabled and supported.
			 * @returns {boolean} True if CSS transitions can be used.
			 */
			useCSSTransitions : function () {
				return moduleInstance.settings.useCSSTransitions && this.checkCSSTransitions();
			},

			/**
			 * Handle touch gestures for navigation and closing.
			 */
			handleGestures : function () {

				const self = this,
					minHorizontalSwipeDistance = 10, // Minimum pixels for horizontal swipe detection
					minVerticalSwipeDistance = 50,    // Minimum pixels for vertical swipe detection
					$controlBars = jQuery( '#header-controls, #footer-controls' ),
					$contentSlider = jQuery( '#media-carousel' );

				let currentItemIndex,
					horizontalDelta = 0,
					verticalDelta = 0,
					prevHorizontalDelta = 0,
					prevVerticalDelta = 0,
					horizontalDeltaPercent = 0,
					isVerticalSwipe = false,
					isHorizontalSwipe = false,
					touchStartCoordinates = {},
					touchEndCoordinates = {};

				$controlBars.addClass( 'visible-controls' );
				self.startControlTimer();

				jQuery( 'body' ).on( 'touchstart.lightboxPro', function( event ) {
					const touch = event.originalEvent.targetTouches[0];
					if (!touch) return; // Guard against no touch data

					jQuery( this ).addClass( 'is-touching' );
					currentItemIndex = jQuery( '#media-carousel .slide-item' ).index( jQuery( '#media-carousel .slide-item.current' ) );
					touchEndCoordinates = touch; // Initialize end with start
					touchStartCoordinates.pageX = touch.pageX;
					touchStartCoordinates.pageY = touch.pageY;

					// Apply current transform without transition for immediate response
					$contentSlider.css( {
						'-webkit-transform' : 'translate3d(' + currentTranslationX +'%, 0, 0)',
						'transform' : 'translate3d(' + currentTranslationX + '%, 0, 0)'
					} );

					jQuery( '.is-touching' ).on( 'touchmove.lightboxPro',function( moveEvent ) {
						moveEvent.preventDefault();
						moveEvent.stopPropagation();
						const moveTouch = moveEvent.originalEvent.targetTouches[0];
						if (!moveTouch) return;

						touchEndCoordinates = moveTouch;

						// Vertical swipe logic (for closing)
						if ( ! isHorizontalSwipe && moduleInstance.settings.allowVerticalClose) {
							prevVerticalDelta = verticalDelta;
							verticalDelta = touchEndCoordinates.pageY - touchStartCoordinates.pageY;
							if ( Math.abs( verticalDelta ) >= minVerticalSwipeDistance || isVerticalSwipe ) {
								const currentOpacity = 0.75 - Math.abs(verticalDelta) / $contentSlider.height();
								$contentSlider.css( { 'top': verticalDelta + 'px', 'opacity': currentOpacity } );
								isVerticalSwipe = true;
							}
						}

						// Horizontal swipe logic (for navigation)
						prevHorizontalDelta = horizontalDelta;
						horizontalDelta = touchEndCoordinates.pageX - touchStartCoordinates.pageX;
						horizontalDeltaPercent = horizontalDelta * 100 / viewportWidth;

						if ( ! isHorizontalSwipe && ! isVerticalSwipe && Math.abs( horizontalDelta ) >= minHorizontalSwipeDistance ) {
							$contentSlider.css( {
								'-webkit-transition' : '', // Remove transition for smooth dragging
								'transition' : ''
							} );
							isHorizontalSwipe = true;
						}

						if ( isHorizontalSwipe ) {
							// Swipe left (dragging right)
							if ( horizontalDelta > 0 ) {
								// First slide
								if ( currentItemIndex === 0 && !moduleInstance.settings.loopSlides ) {
									jQuery( '#lightbox-wrapper' ).addClass( 'left-spring-effect' );
								} else {
									jQuery( '#lightbox-wrapper' ).removeClass( 'left-spring-effect right-spring-effect' );
									$contentSlider.css( {
										'-webkit-transform' : 'translate3d(' + ( currentTranslationX + horizontalDeltaPercent ) +'%, 0, 0)',
										'transform' : 'translate3d(' + ( currentTranslationX + horizontalDeltaPercent ) + '%, 0, 0)'
									} );
								}
							// Swipe right (dragging left)
							} else if ( horizontalDelta < 0 ) {
								// Last slide
								if ( mediaItems.length === currentItemIndex + 1 && !moduleInstance.settings.loopSlides ) {
									jQuery( '#lightbox-wrapper' ).addClass( 'right-spring-effect' );
								} else {
									jQuery( '#lightbox-wrapper' ).removeClass( 'left-spring-effect right-spring-effect' );
									$contentSlider.css( {
										'-webkit-transform' : 'translate3d(' + ( currentTranslationX + horizontalDeltaPercent ) +'%, 0, 0)',
										'transform' : 'translate3d(' + ( currentTranslationX + horizontalDeltaPercent ) + '%, 0, 0)'
									} );
								}
							}
						}
					} );

					return false; // Prevent default browser scrolling
				} ).on( 'touchend.lightboxPro',function( endEvent ) {
					endEvent.preventDefault();
					endEvent.stopPropagation();

					// Re-enable transitions for the snap-back effect
					$contentSlider.css( {
						'-webkit-transition' : '-webkit-transform 0.4s ease',
						'transition' : 'transform 0.4s ease'
					} );

					verticalDelta = touchEndCoordinates.pageY - touchStartCoordinates.pageY;
					horizontalDelta = touchEndCoordinates.pageX - touchStartCoordinates.pageX;
					horizontalDeltaPercent = horizontalDelta * 100 / viewportWidth;

					// Vertical swipe to close
					if ( isVerticalSwipe && moduleInstance.settings.allowVerticalClose) {
						isVerticalSwipe = false;
						// Check for significant downward/upward swipe
						if ( Math.abs( verticalDelta ) >= minVerticalSwipeDistance * 2 && Math.abs( verticalDelta ) > Math.abs( prevVerticalDelta ) ) {
							const verticalOffset = verticalDelta > 0 ? $contentSlider.height() : - $contentSlider.height();
							$contentSlider.animate( { top: verticalOffset + 'px', 'opacity': 0 },
								300,
								function () {
									self.shutDownDisplay();
								} );
						} else {
							// Snap back to original position
							$contentSlider.animate( { top: 0, 'opacity': 1 }, 300 );
						}

					} else if ( isHorizontalSwipe ) { // Horizontal swipe to navigate
						isHorizontalSwipe = false;

						// Swipe right (to previous item)
						if( horizontalDelta >= minHorizontalSwipeDistance && horizontalDelta >= prevHorizontalDelta) {
							self.showPreviousItem();
						// Swipe left (to next item)
						} else if ( horizontalDelta <= -minHorizontalSwipeDistance && horizontalDelta <= prevHorizontalDelta) {
							self.showNextItem();
						} else {
							// No significant swipe, snap back to current item
							$contentSlider.css( {
								'-webkit-transform' : 'translate3d(' + currentTranslationX + '%, 0, 0)',
								'transform' : 'translate3d(' + currentTranslationX + '%, 0, 0)'
							} );
						}

					} else { // No swipe, consider as a tap event
						if ( ! $controlBars.hasClass( 'visible-controls' ) ) {
							self.displayControls();
							self.startControlTimer();
						} else {
							self.stopControlTimer();
							self.concealControls();
						}
					}

					// Reset spring effects and remove touching class
					jQuery( '#lightbox-wrapper' ).removeClass( 'left-spring-effect right-spring-effect' );
					jQuery( '.is-touching' ).off( 'touchmove.lightboxPro' ).removeClass( 'is-touching' );

				} );
			},

			/**
			 * Set a timer to automatically hide the control bars.
			 */
			startControlTimer: function () {
				if ( moduleInstance.settings.autoHideControlsDelay > 0 ) {
					const self = this;
					self.stopControlTimer(); // Clear any existing timer
					self.timeoutId = globalScope.setTimeout( function() {
							self.concealControls();
						},
						moduleInstance.settings.autoHideControlsDelay
					);
				}
			},

			/**
			 * Clear the auto-hide timer.
			 */
			stopControlTimer: function () {
				globalScope.clearTimeout( this.timeoutId );
				this.timeoutId = null;
			},

			/**
			 * Display the navigation and title bars.
			 */
			displayControls : function () {
				const $controlBars = jQuery( '#header-controls, #footer-controls' );
				if ( this.useCSSTransitions() ) {
					$controlBars.addClass( 'visible-controls' );
				} else {
					jQuery( '#header-controls' ).animate( { top : 0 }, 500 );
					jQuery( '#footer-controls' ).animate( { bottom : 0 }, 500 );
					// Ensure class is added after animation for consistency
					setTimeout( function() {
						$controlBars.addClass( 'visible-controls' );
					}, 1000 );
				}
			},

			/**
			 * Hide the navigation and title bars.
			 */
			concealControls : function () {
				const $controlBars = jQuery( '#header-controls, #footer-controls' );
				if ( this.useCSSTransitions() ) {
					$controlBars.removeClass( 'visible-controls' );
				} else {
					jQuery( '#header-controls' ).animate( { top : '-50px' }, 500 );
					jQuery( '#footer-controls' ).animate( { bottom : '-50px' }, 500 );
					// Ensure class is removed after animation
					setTimeout( function() {
						$controlBars.removeClass( 'visible-controls' );
					}, 1000 );
				}
			},

			/**
			 * Animate the entry of the navigation and top bars.
			 */
			animateControls : function () {
				// This function was empty in original, can be used for initial animation
				// For Type III, let's make it actually animate something on initial build.
				const $header = jQuery( '#header-controls' );
				const $footer = jQuery( '#footer-controls' );
				const $closeBtn = jQuery( '#close-button' );

				if ( this.useCSSTransitions() ) {
					// Use CSS transitions for initial display
					$header.addClass('visible-controls');
					$footer.addClass('visible-controls');
					$closeBtn.addClass('visible-controls');
				} else {
					// Fallback to jQuery animate
					$header.css({ top: -50, opacity: 0 }).animate({ top: 0, opacity: 1 }, 500);
					$footer.css({ bottom: -50, opacity: 0 }).animate({ bottom: 0, opacity: 1 }, 500);
					$closeBtn.css({ right: -50, opacity: 0 }).animate({ right: 0, opacity: 1 }, 500);
				}
			},

			/**
			 * Bind all click and keyboard actions to the lightbox.
			 */
			bindActions : function () {
				const self = this;
				const $overlay = jQuery( '#lightbox-wrapper' );
				const $closeBtn = jQuery( '#close-button' );
				const $prevArrow = jQuery( '#arrow-previous' );
				const $nextArrow = jQuery( '#arrow-next' );

				// Close button
				$closeBtn.on( 'click.lightboxPro', function( event ) {
					event.preventDefault();
					self.shutDownDisplay();
				} );

				// Previous arrow
				$prevArrow.on( 'click.lightboxPro', function( event ) {
					event.preventDefault();
					self.showPreviousItem();
				} );

				// Next arrow
				$nextArrow.on( 'click.lightboxPro', function( event ) {
					event.preventDefault();
					self.showNextItem();
				} );

				// Hide bars on click outside current slide (if not mobile)
				if ( ! isHandheldDevice ) {
					$overlay.on( 'click.lightboxPro', function( event ) {
						// Only hide if clicked on overlay directly, not children
						if ( jQuery( event.target ).is( $overlay ) ) {
							if ( $controlBars.hasClass( 'visible-controls' ) ) {
								self.concealControls();
								self.stopControlTimer();
							} else {
								self.displayControls();
								self.startControlTimer();
							}
						}
					} );
				}
			},

			/**
			 * Handle keyboard input for navigation and closing.
			 */
			handleKeyboardInput : function () {
				const self = this;
				jQuery( currentDocument ).on( 'keydown.lightboxPro', function( event ) {
					if ( jQuery.lightboxPro.isOpen ) { // Only respond if lightbox is open
						if ( event.keyCode === 37 ) { // Left arrow
							event.preventDefault();
							self.showPreviousItem();
						} else if ( event.keyCode === 39 ) { // Right arrow
							event.preventDefault();
							self.showNextItem();
						} else if ( event.keyCode === 27 ) { // Escape key
							event.preventDefault();
							self.shutDownDisplay();
						}
					}
				} );
			},

			/**
			 * Open a specific slide item.
			 * @param {number} itemIndex - The index of the slide to open.
			 */
			activateSlide : function ( itemIndex ) {
				const $carousel = jQuery( '#media-carousel' );
				const $slides = $carousel.find( '.slide-item' );

				// Ensure index is within bounds, or loop if enabled
				if ( itemIndex < 0 ) {
					itemIndex = moduleInstance.settings.loopSlides ? mediaItems.length - 1 : 0;
				} else if ( itemIndex >= mediaItems.length ) {
					itemIndex = moduleInstance.settings.loopSlides ? 0 : mediaItems.length - 1;
				}

				// Update current translation for the carousel
				currentTranslationX = -itemIndex * 100;
				if ( this.useCSSTransitions() ) {
					$carousel.css( {
						'-webkit-transform' : 'translate3d(' + currentTranslationX + '%, 0, 0)',
						'transform' : 'translate3d(' + currentTranslationX + '%, 0, 0)'
					} );
				} else {
					$carousel.animate( { left : -itemIndex * 100 + '%' }, 300 );
				}

				// Update active slide class
				$slides.removeClass( 'current is-active' ).eq( itemIndex ).addClass( 'current is-active' );
				this.updateCaption( mediaItems[itemIndex].caption );
			},

			/**
			 * Update the displayed caption.
			 * @param {string} captionText - The text for the caption.
			 */
			updateCaption : function( captionText ) {
				const $captionElement = jQuery( '#media-caption' );
				if ( isDefined( captionText ) && captionText.trim() !== '' ) {
					$captionElement.text( captionText ).show();
				} else {
					$captionElement.empty().hide();
				}
			},

			/**
			 * Load media content for a given slide index.
			 * @param {number} itemIndex - The index of the media item to load.
			 */
			loadMediaContent : function ( itemIndex ) {
				const self = this;
				const $currentSlide = jQuery( '#media-carousel .slide-item' ).eq( itemIndex );
				const media = mediaItems[itemIndex];

				if ( ! media || $currentSlide.hasClass( 'loaded' ) ) {
					return; // Already loaded or no media item
				}

				$currentSlide.addClass( 'loaded' ); // Mark as loaded

				// Display loading indicator (Type III addition)
				$currentSlide.html( '<div class="lightboxPro-loader"></div>' );

				// Determine media type (image, video, iframe)
				let contentHTML;
				if ( media.src.match( /(^\.mp4$)|(^\.webm$)|(^\.ogg$)/i ) ) { // Simple video check, can be expanded
					contentHTML = `<video controls autoplay="${moduleInstance.settings.autoPlayContent}" src="${media.src}" class="lightboxPro-video"></video>`;
				} else if ( media.src.match( /\.(jpeg|jpg|gif|png|webp|svg)$/i ) ) {
					contentHTML = `<img src="${media.src}" class="lightboxPro-image" alt="${media.caption || ''}">`;
				} else if ( media.src.includes( 'youtube.com/watch' ) || media.src.includes( 'youtu.be/' ) ) {
					const videoId = media.src.match( /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i );
					if ( videoId && videoId[1] ) {
						contentHTML = `<iframe src="//www.youtube.com/embed/${videoId[1]}?autoplay=${moduleInstance.settings.autoPlayContent ? 1 : 0}" frameborder="0" allowfullscreen class="lightboxPro-youtube"></iframe>`;
					}
				} else if ( media.src.includes( 'vimeo.com/' ) ) {
					const videoId = media.src.match( /(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|video\/|)(\d+)/i );
					if ( videoId && videoId[1] ) {
						contentHTML = `<iframe src="//player.vimeo.com/video/${videoId[1]}?byline=0&portrait=0&color=${moduleInstance.settings.vimeoAccentColor}&autoplay=${moduleInstance.settings.autoPlayContent ? 1 : 0}" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen class="lightboxPro-vimeo"></iframe>`;
					}
				} else {
					// Fallback to iframe for other content
					contentHTML = `<iframe src="${media.src}" frameborder="0" allowfullscreen class="lightboxPro-iframe"></iframe>`;
				}

				if (contentHTML) {
					$currentSlide.html( contentHTML );
					// Optional: Add a subtle fade-in for content
					$currentSlide.children().css({ opacity: 0 }).animate({ opacity: 1 }, 300);
				} else {
					$currentSlide.html( '<p class="lightboxPro-error">Could not load content.</p>' );
				}
			},

			/**
			 * Preload media content for adjacent slides.
			 * @param {number} itemIndex - The index of the media item to preload.
			 */
			prefetchMediaContent : function ( itemIndex ) {
				if ( itemIndex < 0 || itemIndex >= mediaItems.length ) {
					return; // Out of bounds
				}
				this.loadMediaContent( itemIndex );
			},

			/**
			 * Navigate to the previous media item.
			 */
			showPreviousItem : function () {
				let currentIdx = jQuery( '#media-carousel .slide-item' ).index( jQuery( '#media-carousel .slide-item.current' ) );
				if ( currentIdx > 0 ) {
					this.activateSlide( currentIdx - 1 );
				} else if ( moduleInstance.settings.loopSlides ) {
					this.activateSlide( mediaItems.length - 1 );
				}
			},

			/**
			 * Navigate to the next media item.
			 */
			showNextItem : function () {
				let currentIdx = jQuery( '#media-carousel .slide-item' ).index( jQuery( '#media-carousel .slide-item.current' ) );
				if ( currentIdx < mediaItems.length - 1 ) {
					this.activateSlide( currentIdx + 1 );
				} else if ( moduleInstance.settings.loopSlides ) {
					this.activateSlide( 0 );
				}
			},

			/**
			 * Destroy the lightbox instance and clean up.
			 */
			destroyLightbox : function () {
				jQuery( currentDocument ).off( '.lightboxPro' ); // Unbind all namespaced events
				jQuery( 'body' ).removeClass( 'lightboxPro-active' );
				jQuery( '#lightbox-wrapper' ).remove();
				this.stopControlTimer();
				jQuery.lightboxPro.isOpen = false;
				this.eventTarget.trigger( 'lightboxPro-end' );
				if ( moduleInstance.settings.onAfterHide ) {
					moduleInstance.settings.onAfterHide();
				}
			},

			/**
			 * Close the lightbox display.
			 */
			shutDownDisplay : function () {
				const self = this;
				const $overlay = jQuery( '#lightbox-wrapper' );

				if ( this.useCSSTransitions() ) {
					$overlay.addClass( 'is-closing' ); // Add a closing animation class
					$overlay.one( 'transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function() {
						self.destroyLightbox();
					} );
				} else {
					$overlay.fadeOut( 300, function() {
						self.destroyLightbox();
					} );
				}
			}
		};

		// Initialize the module when `$.lightboxPro` is called
		moduleInstance.initialize();

	}; // End of jQuery.lightboxPro definition

	// Add an empty object to jQuery for tracking lightbox state
	jQuery.lightboxPro.isOpen = false;

} ( window, document, jQuery ) );