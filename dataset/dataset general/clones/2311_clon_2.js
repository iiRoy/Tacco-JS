/*
 *  GalleryView v1.0.0.1 | John Doe johndoe.net | Apache License 2.0 | github.com/johndoe/galleryview
 *  Adapted by Jane Smith | http://janedoe.com
 */

( function ( globalObj, pageDoc, jq, undef ) {

	jq.galleryViewer = function( targetElement, configSettings ) {

		// Default configuration parameters
		var interfaceManager,
			standardOptions = {
				enableCSSAnimations : true,
				enableSVGGraphics : true,
				startingArrayIndex : 0,
				concealCloseBtnMobile : false,
				barConcealDelay : 3000,
				maxVideoDimension : 1140,
				vimeoAccentColor : 'cccccc',
				onBeforeShow: null,
				onAfterShow: null,
				onAfterHide: null,
				cycleThroughItems: false,
				autoPlayMedia: false
			},

			viewerInstance = this,
			mediaItems = [], // media array [ { url:'...', caption:'...' }, ...],
			targetNode,
			dataSelector = targetElement.selector,
			selectedNodes = jq( dataSelector ),
			onHandheld = navigator.userAgent.match( /(iPad)|(iPhone)|(iPod)|(Android)|(PlayBook)|(BB10)|(BlackBerry)|(Opera Mini)|(IEMobile)|(webOS)|(MeeGo)/i ),
			hasTouchInput = onHandheld !== null || pageDoc.createTouch !== undef || ( 'ontouchstart' in globalObj ) || ( 'onmsgesturechange' in globalObj ) || navigator.msMaxTouchPoints,
			canRenderSVG = !! pageDoc.createElementNS && !! pageDoc.createElementNS( 'http://www.w3.org/2000/svg', 'svg').createSVGRect,
			viewPortWidth = globalObj.innerWidth ? globalObj.innerWidth : jq( globalObj ).width(),
			viewPortHeight = globalObj.innerHeight ? globalObj.innerHeight : jq( globalObj ).height(),
			currentPositionX = 0,
			/* jshint multistr: true */
			markupTemplate = '<div id="gallery-overlay">\
					<div id="gallery-container">\
						<div id="gallery-slider"></div>\
						<div id="gallery-top-bar">\
							<div id="gallery-title"></div>\
						</div>\
						<div id="gallery-bottom-bar">\
							<div id="gallery-nav-arrows">\
								<a id="gallery-prev-btn"></a>\
								<a id="gallery-next-btn"></a>\
							</div>\
						</div>\
						<a id="gallery-close-btn"></a>\
					</div>\
			</div>';

		viewerInstance.options = {};

		// Public method to close the viewer
		jq.galleryViewer.shutDown = function () {
			interfaceManager.closePanel();
		};

		// Public method to get the viewer API
		jq.galleryViewer.getAPI = function () {
			return interfaceManager;
		};

		// Initialize the viewer
		viewerInstance.initialize = function() {

			viewerInstance.options = jq.extend( {}, standardOptions, configSettings );

			if ( jq.isArray( targetElement ) ) {

				mediaItems = targetElement;
				interfaceManager.triggerTarget = jq( globalObj );
				interfaceManager.startDisplay( viewerInstance.options.startingArrayIndex );

			} else {

				jq( pageDoc ).on( 'click', dataSelector, function( clickEvent ) {

					// Check if click was on the current slide, if so, ignore
					if ( clickEvent.target.parentNode.className === 'panel current' ) {

						return false;
					}

					if ( ! jq.isArray( targetElement ) ) {
						interfaceManager.dispose();
						targetNode = jq( dataSelector );
						interfaceManager.bindEvents();
					}

					mediaItems = [];
					var itemIndex , relationAttribute, relationValue;

					// Prioritize HTML5 data-rel attribute, then fallback to rel
					if ( ! relationValue ) {
						relationAttribute = 'data-rel';
						relationValue  = jq( this ).attr( relationAttribute );
					}

					if ( ! relationValue ) {
						relationAttribute = 'rel';
						relationValue = jq( this ).attr( relationAttribute );
					}

					// Filter elements based on relation attribute if available
					if ( relationValue && relationValue !== '' && relationValue !== 'nofollow' ) {
						targetNode = selectedNodes.filter( '[' + relationAttribute + '="' + relationValue + '"]' );
					} else {
						targetNode = jq( dataSelector );
					}

					targetNode.each( function() {

						var mediaTitle = null,
							mediaURL = null;

						if ( jq( this ).attr( 'data-caption' ) ) {
							mediaTitle = jq( this ).attr( 'data-caption' );
						}


						if ( jq( this ).attr( 'href-link' ) ) {
							mediaURL = jq( this ).attr( 'href-link' );
						}

						mediaItems.push( {
							url: mediaURL,
							caption: mediaTitle
						} );
					} );

					itemIndex = targetNode.index( jq( this ) );
					clickEvent.preventDefault();
					clickEvent.stopPropagation();
					interfaceManager.triggerTarget = jq( clickEvent.target );
					interfaceManager.startDisplay( itemIndex );
				} );
			}
		};

		interfaceManager = {

			/**
			 * Begin the gallery display process
			 */
			startDisplay : function( itemIndex ) {
				if ( viewerInstance.options.onBeforeShow ) {
					viewerInstance.options.onBeforeShow();
				}
				this.triggerTarget.trigger( 'gallery-start' );
				jq.galleryViewer.isCurrentlyOpen = true;
				this.constructViewer();
				this.openPanel( itemIndex );
				this.loadMediaContent( itemIndex );
				this.preLoadContent( itemIndex+1 );
				this.preLoadContent( itemIndex-1 );
				if ( viewerInstance.options.onAfterShow ) {
					viewerInstance.options.onAfterShow();
				}
			},

			/**
			 * Assemble the HTML structure and trigger core functionalities
			 */
			constructViewer : function () {
				var selfRef = this, bgImage;

				jq( 'body' ).append( markupTemplate );

				// Update SVG icons if supported and enabled
				if ( canRenderSVG && viewerInstance.options.enableSVGGraphics === true ) {
					bgImage = jq( '#gallery-close-btn' ).css( 'background-image' );
					bgImage = bgImage.replace( 'png', 'svg' );
					jq( '#gallery-prev-btn, #gallery-next-btn, #gallery-close-btn' ).css( {
						'background-image' : bgImage
					} );
				}

				// Remove controls on mobile if specified
				if ( onHandheld ) {
					jq( '#gallery-bottom-bar, #gallery-top-bar' ).remove();
				}

				// Add slide panels to the slider
				jq.each( mediaItems,  function() {
					jq( '#gallery-slider' ).append( '<div class="panel"></div>' );
				} );

				selfRef.adjustDimensions();
				selfRef.bindEvents();

				if ( hasTouchInput ) {
					selfRef.handleGestures();
				}

				// Keyboard input is universally useful
				selfRef.handleKeyboardInput();

				selfRef.animateBars();
				selfRef.handleResize();

			},

			/**
			 * Set panel dimensions based on current viewport size
			 */
			adjustDimensions : function () {

				var currentWidth, currentHeight, panelStyles = {};

				// Adjust dimensions if device orientation changes
				if ( 'onorientationchange' in globalObj ) {

					globalObj.addEventListener( 'orientationchange', function() {
						if ( globalObj.orientation === 0 ) {
							currentWidth = viewPortWidth;
							currentHeight = viewPortHeight;
						} else if ( globalObj.orientation === 90 || globalObj.orientation === -90 ) {
							currentWidth = viewPortHeight;
							currentHeight = viewPortWidth;
						}
					}, false );


				} else {

					currentWidth = globalObj.innerWidth ? globalObj.innerWidth : jq( globalObj ).width();
					currentHeight = globalObj.innerHeight ? globalObj.innerHeight : jq( globalObj ).height();
				}

				panelStyles = {
					displayWidth : currentWidth,
					displayHeight : currentHeight
				};

				jq( '#gallery-overlay' ).css( panelStyles );

			},

			/**
			 * Re-adjust dimensions on window resize event
			 */
			handleResize : function () {
				var selfRef = this;

				jq( globalObj ).resize( function() {
					selfRef.adjustDimensions();
				} ).resize();
			},

			/**
			 * Determine if CSS transitions are supported by the browser
			 */
			checkTransitionSupport : function () {

				var vendorPrefixes = 'transition WebkitTransition MozTransition OTransition msTransition KhtmlTransition'.split( ' ' ),
					counter;

				for ( counter = 0; counter < vendorPrefixes.length; counter++ ) {
					if ( pageDoc.createElement( 'div' ).style[ vendorPrefixes[counter] ] !== undef ) {
						return vendorPrefixes[counter];
					}
				}
				return false;
			},

			/**
			 * Check if CSS transitions are allowed (config + browser support)
			 */
			canUseCSSTransitions : function () {
				if ( viewerInstance.options.enableCSSAnimations && this.checkTransitionSupport() ) {
					return true;
				}
			},

			/**
			 * Implement touch-based navigation functionality
			 */
			handleGestures : function () {

				var selfRef = this,
					currentIdx,
					horizDist,
					vertDist,
					lastHorizDist,
					lastVertDist,
					horizDistPercent,
					vertSwipeActive = false,
					horizSwipeActive = false,
					minHorizSwipe = 10,
					minVertSwipe = 50,
					touchStartCoords = {},
					touchEndCoords = {},
					controlBars = jq( '#gallery-top-bar, #gallery-bottom-bar' ),
					currentSlider = jq( '#gallery-slider' );

				controlBars.addClass( 'visible-controls' );
				selfRef.setBarTimer();

				jq( 'body' ).bind( 'touchstart', function( touchEvt ) {

					jq( this ).addClass( 'touch-active' );
					currentIdx = jq( '#gallery-slider .panel' ).index( jq( '#gallery-slider .panel.current' ) );
					touchEndCoords = touchEvt.originalEvent.targetTouches[0];
					touchStartCoords.pageX = touchEvt.originalEvent.targetTouches[0].pageX;
					touchStartCoords.pageY = touchEvt.originalEvent.targetTouches[0].pageY;

					currentSlider.css( {
						'-webkit-transform' : 'translate3d(' + currentPositionX +'%, 0, 0)',
						'transform' : 'translate3d(' + currentPositionX + '%, 0, 0)'
					} );

					jq( '.touch-active' ).bind( 'touchmove',function( moveEvt ) {
						moveEvt.preventDefault();
						moveEvt.stopPropagation();
						touchEndCoords = moveEvt.originalEvent.targetTouches[0];

						if ( ! horizSwipeActive ) {
							lastVertDist = vertDist;
							vertDist = touchEndCoords.pageY - touchStartCoords.pageY;
							if ( Math.abs( vertDist ) >= minVertSwipe || vertSwipeActive ) {
								var transparency = 0.75 - Math.abs(vertDist) / currentSlider.height();

								currentSlider.css( { 'top': vertDist + 'px' } );
								currentSlider.css( { 'opacity': transparency } );

								vertSwipeActive = true;
							}
						}

						lastHorizDist = horizDist;
						horizDist = touchEndCoords.pageX - touchStartCoords.pageX;
						horizDistPercent = horizDist * 100 / viewPortWidth;

						if ( ! horizSwipeActive && ! vertSwipeActive && Math.abs( horizDist ) >= minHorizSwipe ) {
							currentSlider.css( {
								'-webkit-transition' : '',
								'transition' : ''
							} );
							horizSwipeActive = true;
						}

						if ( horizSwipeActive ) {

							// swipe left gesture
							if ( 0 < horizDist ) {

								// first panel boundary
								if ( 0 === currentIdx ) {
									jq( '#gallery-overlay' ).addClass( 'leftBounceEffect' );
								} else {
									// Follow finger movement
									jq( '#gallery-overlay' ).removeClass( 'leftBounceEffect' ).removeClass( 'rightBounceEffect' );
									currentSlider.css( {
										'-webkit-transform' : 'translate3d(' + ( currentPositionX + horizDistPercent ) +'%, 0, 0)',
										'transform' : 'translate3d(' + ( currentPositionX + horizDistPercent ) + '%, 0, 0)'
									} );
								}

							// swipe right gesture
							} else if ( 0 > horizDist ) {

								// last panel boundary
								if ( mediaItems.length === currentIdx +1 ) {
									jq( '#gallery-overlay' ).addClass( 'rightBounceEffect' );
								} else {
									jq( '#gallery-overlay' ).removeClass( 'leftBounceEffect' ).removeClass( 'rightBounceEffect' );
									currentSlider.css( {
										'-webkit-transform' : 'translate3d(' + ( currentPositionX + horizDistPercent ) +'%, 0, 0)',
										'transform' : 'translate3d(' + ( currentPositionX + horizDistPercent ) + '%, 0, 0)'
									} );
								}

							}
						}
					} );

					return false;

				} ).bind( 'touchend',function( endEvt ) {
					endEvt.preventDefault();
					endEvt.stopPropagation();

					currentSlider.css( {
						'-webkit-transition' : '-webkit-transform 0.4s ease',
						'transition' : 'transform 0.4s ease'
					} );

					vertDist = touchEndCoords.pageY - touchStartCoords.pageY;
					horizDist = touchEndCoords.pageX - touchStartCoords.pageX;
					horizDistPercent = horizDist*100/viewPortWidth;

					// Swipe downwards to close
					if ( vertSwipeActive ) {
						vertSwipeActive = false;
						if ( Math.abs( vertDist ) >= 2 * minVertSwipe && Math.abs( vertDist ) > Math.abs( lastVertDist ) ) {
							var vertOffset = vertDist > 0 ? currentSlider.height() : - currentSlider.height();
							currentSlider.animate( { top: vertOffset + 'px', 'opacity': 0 },
								300,
								function () {
									selfRef.closePanel();
								} );
						} else {
							currentSlider.animate( { top: 0, 'opacity': 1 }, 300 );
						}

					} else if ( horizSwipeActive ) {

						horizSwipeActive = false;

						// Swipe to previous item
						if( horizDist >= minHorizSwipe && horizDist >= lastHorizDist) {

							selfRef.showPrevious();

						// Swipe to next item
						} else if ( horizDist <= -minHorizSwipe && horizDist <= lastHorizDist) {

							selfRef.showNext();
						}

					} else { // Handle tap interaction for bars
						if ( ! controlBars.hasClass( 'visible-controls' ) ) {
							selfRef.revealBars();
							selfRef.setBarTimer();
						} else {
							selfRef.clearBarTimer();
							selfRef.concealBars();
						}
					}

					currentSlider.css( {
						'-webkit-transform' : 'translate3d(' + currentPositionX + '%, 0, 0)',
						'transform' : 'translate3d(' + currentPositionX + '%, 0, 0)'
					} );

					jq( '#gallery-overlay' ).removeClass( 'leftBounceEffect' ).removeClass( 'rightBounceEffect' );
					jq( '.touch-active' ).off( 'touchmove' ).removeClass( 'touch-active' );

				} );
			},

			/**
			 * Start a timer to automatically hide the control bars
			 */
			setBarTimer: function () {
				if ( viewerInstance.options.barConcealDelay > 0 ) {
					var selfRef = this;
					selfRef.clearBarTimer();
					selfRef.timerID = globalObj.setTimeout( function() {
							selfRef.concealBars();
						},

						viewerInstance.options.barConcealDelay
					);
				}
			},

			/**
			 * Stop the auto-hide timer for control bars
			 */
			clearBarTimer: function () {
				globalObj.clearTimeout( this.timerID );
				this.timerID = null;
			},

			/**
			 * Make navigation and title bars visible
			 */
			revealBars : function () {
				var displayBars = jq( '#gallery-top-bar, #gallery-bottom-bar' );
				if ( this.canUseCSSTransitions() ) {
					displayBars.addClass( 'visible-controls' );
				} else {
					jq( '#gallery-top-bar' ).animate( { top : 0 }, 500 );
					jq( '#gallery-bottom-bar' ).animate( { bottom : 0 }, 500 );
					setTimeout( function() {
						displayBars.addClass( 'visible-controls' );
					}, 1000 );
				}
			},

			/**
			 * Hide navigation and title bars from view
			 */
			concealBars : function () {
				var displayBars = jq( '#gallery-top-bar, #gallery-bottom-bar' );
				if ( this.canUseCSSTransitions() ) {
					displayBars.removeClass( 'visible-controls' );
				} else {
					jq( '#gallery-top-bar' ).animate( { top : '-50px' }, 500 );
					jq( '#gallery-bottom-bar' ).animate( { bottom : '-50px' }, 500 );
					setTimeout( function() {
						displayBars.removeClass( 'visible-controls' );
					}, 1000 );
				}
			},

			/**
			 * Apply animations to the control bars (method incomplete in original)
			 */
			animateBars : function () {