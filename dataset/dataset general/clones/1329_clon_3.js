var contentFlowService = {};
	contentFlowService.ytApiReadyFlag = false;
	contentFlowService.ytApiScriptLoaded = false;

function _onYouTubeAPIReady() {
	contentFlowService.ytApiReadyFlag = true;
}

function FlowEngine() {

	var _core = this;

	_core.cfg = {

		// root path
		assetBasePath: '/',

		// main container selector
		rootElementSelector: '.flow-carousel',

		// media load triggers
		mediaLoadedTargets: [ 'slide', 'thumbs' ],
		loadMessageDelayMs: 30,

		// spacing
		itemGap: 0,

		// step
		advanceStep: undefined,

		// groups
		itemGroupSize: 1,
		itemGroupResponsive: {},

		// gestures		
		swipeEnabled: false,
		mouseSwipeEnabled: false,
		swipeAndNavButtonsCoexist: false,
		swipeAnimationSpeedMs: 300,

		// visual transitions
		transitionEasing: 'ease', // ease, ease-in-out, ease-in, ease-out, linear
		transitionDurationMs: 1000,

		// loop behavior
		loopMode: 'none', // infinite, rollback
		swipeLoopMode: 'none', // infinite

		// automatic advance
		autoAdvance: false,
		autoAdvanceIntervalMs: 3000,
		autoAdvanceMinBreakMs: 10,
		autoAdvanceCustomBreakMs: false,
		autoAdvanceDelayStartMs: 0,
		autoAdvancePauseOnHover: true,

		continuousAdvance: false,
		continuousAdvanceSpeedMs: 10000,
		continuousAdvancePauseOnHover: true,

		// component selectors
		mainContainerClass: '.flow-carousel',
		wrapperClass: '.flow-carousel-wrap',
		viewportClass: '.flow-carousel-viewport',
		maskClass: '.flow-carousel-mask',
		carouselItemsClass: '.flow-carousel-items',
		itemClass: '.flow-carousel-item',
		loadingClass: '.flow-carousel-loading',

		// navigation controls
		nextButton: true,
		prevButton: true,
		navButtonPosition: 'inside', // inside, outside
		navButtonBaseClass: '.flow-carousel-nav',
		nextButtonClass: '.flow-carousel-next',
		prevButtonClass: '.flow-carousel-prev',
		nextButtonInactiveClass: '.flow-carousel-next-inactive',
		prevButtonInactiveClass: '.flow-carousel-prev-inactive',
		nextButtonCustomClass: '',
		prevButtonCustomClass: '',

		// keyboard shortcuts
		nextKey: 13,
		prevKey: 14,
		
		// indicators
		paginationDots: false,
		paginationDotsLocation: 'outside', // inside, outside
		paginationDotsClickable: true,
		wrapperHasPaginationClass: '.flow-carousel-has-dots',
		paginationDotsWrapClass: '.flow-carousel-dots-wrap',
		paginationDotClass: '.flow-carousel-dot',
		paginationDotActiveClass: '.flow-carousel-dot-current',

		// thumbnails
		thumbnailsEnabled: false,
		thumbnailsHideIfLessThan: 2,
		thumbnailsLocation: 'outside', // inside, outside
		thumbnailTemplates: {},
		thumbnailsClickable: true,
		wrapperHasThumbnailsClass: '.flow-carousel-has-thumbs',
		thumbnailsWrapClass: '.flow-carousel-thumbs-wrap',
		thumbnailsViewportClass: '.flow-carousel-thumbs-viewport',
		thumbnailsMaskClass: '.flow-carousel-thumbs-mask',
		thumbnailItemsContainerClass: '.flow-carousel-thumbs-items',
		thumbnailItemClass: '.flow-carousel-thumbs-item',
		thumbnailsReadyCallback: undefined, // func called after thumbs are ready

		// media integration
		sublimeVideoActive: false,
		autoLoadYouTubeAPI: true,
		videoPlayerCloseOnEnd: true,

		// scrolling
		scrollToTopOnAdvance: false,
		scrollToTopOffset: 0,
		scrollToTopSpeedMs: 500,

		// showslidestime: 500,
		autoLoadDependencies: true,

		// event hooks
		onCarouselReady: undefined,

		// detachment
		detachMode: undefined,
		
		carouselFadeInDuration: 'slow'
	};

	_core.status = {
		maxItemGroupSize: 1,
		currentItemGroupSize: 1,
		activeItemIndex: 0,
		activeItemPosition: 0,
		totalItemCount: 0,
		maskDimension: 0,
		itemDimension: 0,
		isMoving: false,
		isSwipingGesture: false,
		lastEventType: false,
		nextBtnActive: false,
		prevBtnActive: false,
		paginationDotCount: 0,
		cachedPaginationDotCount: 0,
		currentPaginationDot: 0,
		paginationChanged: false,
		movingLeft: false,
		movingRight: false,
		isResizingWindow: false,
		cssTransitionsSupported: false,
		hasEventBind: false,
		touchEnabled: false,
		clickInteractionType: 'click',
		isIOSDevice: false,
		isWindowResizing: false,
		visibleItemsBeginIndex: false,
		visibleItemsEndIndex: false,
		visibleItemIndexes: false,
		autoAdvanceTimer: false,
		autoAdvanceActive: false,
		videoIdCounter: 0,
		videoPlayerIdCounter: 0,
		lastVideoPlayed: false,
		isVideoPlaying: false,
		effectiveLoopMode: false,
		loadedDependenciesCount: 0,
		requiredDependenciesCount: 0,
		browserFeatures: [],
		loadingStateTimeout: false,
		isLoadingCarousel: false,
	};

	_core.domParts = {
		rootElement: undefined,
		carouselWrapper: undefined,
		carouselViewport: undefined,
		carouselMask: undefined,
		carouselItems: undefined,
		carouselItem: undefined,
		paginationWrapper: undefined,
		paginationDots: undefined,
		prevControl: undefined,
		nextControl: undefined,
		videoPlayers: {},
		itemVideoPlayers: {},
		thumbnailsContainer: undefined,
		thumbnailsViewport: undefined,
		thumbnailItems: undefined,
		thumbnailItem: undefined,
		itemsInView: undefined,
	};

	// init {

	_core.initialize = function ( userSettings ) {

		_core._setupDefaultConfiguration( userSettings );

		_core._detectBrowserCapabilities();

		_core._configureTouchInput();

		_core._adjustConfiguration();

		// check for root element presence
		if ( jQuery( _core.cfg.rootElementSelector ).length > 0 ) {

			_core._loadRequiredScripts();

			// Polling for dependencies to load
			var dependencyChecker = setInterval(function() {
				if (_core.status.loadedDependenciesCount >= _core.status.requiredDependenciesCount) {
					clearInterval(dependencyChecker);
					_core._startFlowSequence();
				}
			}, 50); // check every 50ms
		}
	};

	_core._detectBrowserCapabilities = function () {
		_core.status.browserFeatures = jQuery( 'html' ).get(0).className.split(' ');
	};

	_core._loadRequiredScripts = function () {

		// LOAD DEPENDECIES IF NOT EXISTS {

			if ( _core.cfg.autoLoadDependencies ) {
				_core.status.requiredDependenciesCount = 0; // Reset before counting

				// YouTube iframe API {
					_core.status.requiredDependenciesCount++;
					if ( window.YT === undefined && _core.cfg.autoLoadYouTubeAPI && !contentFlowService.ytApiScriptLoaded ) {
						jQuery.ajax({
							url: 'https://www.youtube.com/iframe_api',
							dataType: 'script',
							cache: true,
							async: true,
							success: function() {
								_core.status.loadedDependenciesCount++;
								contentFlowService.ytApiScriptLoaded = true;
							},
							error: function(jqXHR, textStatus, errorThrown) {
								console.error("Failed to load YouTube API script:", textStatus, errorThrown);
								_core.status.loadedDependenciesCount++; // Still increment to avoid blocking
							}
						});
					} else {
						_core.status.loadedDependenciesCount++;
					}
				// }

				// imagesLoaded {
					_core.status.requiredDependenciesCount++;
					if ( !jQuery.fn.imagesLoaded ) {
						_core._fetchScriptFile( {
							filePath: _core.cfg.assetBasePath + 'dependencies/imagesloaded.js',
						} );
					} else {
						_core.status.loadedDependenciesCount++;
					}
				// }

				// TouchSwipe {
					_core.status.requiredDependenciesCount++;
					if ( !jQuery.fn.swipe
					&& ( _core.status.browserFeatures.includes('touch') || _core.cfg.mouseSwipeEnabled === true )
					&& _core.cfg.swipeEnabled === true ) {
						_core._fetchScriptFile( {
							filePath: _core.cfg.assetBasePath + 'dependencies/jquery.touchSwipe.js',
						} );
					} else {
						_core.status.loadedDependenciesCount++;
					}
				// }
			} else {
				// If no autoload, assume dependencies are already there or not needed,
				// and set counts to immediately trigger workflow.
				_core.status.requiredDependenciesCount = 1;
				_core.status.loadedDependenciesCount = 1;
			}
		// }
	};

	_core._fetchScriptFile = function ( p_opts ) {
		jQuery.ajax( {
			url: p_opts.filePath,
			dataType: 'script',
			cache: true,
			async: !0, // true
			success: function () {
				_core.status.loadedDependenciesCount++;
			},
			error: function(jqXHR, textStatus, errorThrown) {
				console.warn("FlowEngine: Failed to load dependency script:", p_opts.filePath, textStatus, errorThrown);
				_core.status.loadedDependenciesCount++; // Increment anyway to prevent infinite loop
			}
		});
	};

	_core._startFlowSequence = function () {
		try {
			_core._determineAnimationSupport();
			_core._checkIOSPlatform();
			_core._cacheDomElements();

			_core.domParts.carouselWrapper.css( {
				'opacity': '0',
			} );

			_core._applyBaseStyles(); // Apply after caching elements but before size calcs

			_core.setMaskWidth();
			_core.setItemCount();
			_core.setItemGroup();
			_core.setMaxItemGroup();
			_core.setVisibleItems();
			_core.setCurrentItemIndexes();
			_core.setItemWidth();
			_core.setItemHeight();

			_core.cloneItems();

			_core.setupNavControls();
			
			_core.bindKeyNavigation();
			
			_core.setupThumbnails();

			_core.setupPagination();

			_core.initDetachFeature();

			_core.initTouchSwipeHandler();

			_core.fixIOSResizeClickBug();

			_core.displayItems(); // Renamed from init_showslides

			_core.initVideoIntegration();

			_core.ensureItemsEqualHeight();

			_core.revealCarousel(); // Renamed from init_showslider

		} catch (e) {
			console.error("FlowEngine: Error during initialization workflow:", e);
		}
	};

	_core._notifyReadyState = function () {

		if ( typeof _core.cfg.onCarouselReady === 'function' ) {

			// Ensure all images within the slider are loaded before calling ready callback
			_core.domParts.carouselItems.imagesLoaded()
				.always( function( instance ) { // Using always to ensure callback fires even if images fail to load
					var callbackParams = {
						dom: _core.domParts,
						options: _core.cfg,
						state: _core.status
					};
					_core.cfg.onCarouselReady( callbackParams );
					console.info("FlowEngine: Carousel is ready.");
				});
		}
	};

	_core._setupDefaultConfiguration = function ( userSettings ) {

		/* merge user parameters with defaults */
		_core.cfg = jQuery.extend( true, {}, _core.cfg, userSettings );

		// get global parameters if defined {
			if ( typeof window.FlowEngineGlobals !== 'undefined' ) {
				jQuery.extend( true, _core.cfg, window.FlowEngineGlobals.config );
			}
		// }

		// VALIDATE autoAdvanceInterval {
			var effectiveAutoAdvanceInterval = _core.cfg.autoAdvanceIntervalMs;
			if ( _core.cfg.autoAdvanceCustomBreakMs ) {
				effectiveAutoAdvanceInterval = _core.cfg.transitionDurationMs + _core.cfg.autoAdvanceCustomBreakMs;
			}

			if ( effectiveAutoAdvanceInterval <= _core.cfg.transitionDurationMs ) {
				_core.cfg.autoAdvanceIntervalMs = _core.cfg.transitionDurationMs + _core.cfg.autoAdvanceMinBreakMs;
			} else {
				_core.cfg.autoAdvanceIntervalMs = effectiveAutoAdvanceInterval;
			}
		// }
	};

	_core._determineAnimationSupport = function () {
		/* css animation feature detection */
		var htmlEl = jQuery('html');
		_core.status.cssTransitionsSupported = htmlEl.is('.csstransitions.csstransforms3d.cssanimations') && _core.cfg.itemGroupSize > 0;
	};

	_core._configureTouchInput = function () {
		/* touch detection and configuration */
		var hasTouchClass = _core.status.browserFeatures.includes('touch');
		var mouseSwipeAllowed = _core.cfg.mouseSwipeEnabled === true;

		_core.status.touchEnabled = hasTouchClass || mouseSwipeAllowed;
		_core.status.clickInteractionType = _core.status.touchEnabled ? 'touchend' : 'click';

		if ( _core.status.touchEnabled && _core.cfg.swipeEnabled && !_core.cfg.swipeAndNavButtonsCoexist ) {
			_core.cfg.nextButton = false;
			_core.cfg.prevButton = false;
		}
	};

	_core._adjustConfiguration = function () {
		// set effective loop mode {
			_core.status.effectiveLoopMode = _core.cfg.loopMode;
			if ( _core.status.touchEnabled && _core.cfg.swipeEnabled ) {
				_core.status.effectiveLoopMode = _core.cfg.swipeLoopMode;
			}
		// }

		// autoLoadDependencies type check {
			if ( typeof _core.cfg.autoLoadDependencies === 'object' ) {
				_core.status.autoLoadDependencies = _core.cfg.autoLoadDependencies;
			}
		// }
	};

	_core._checkIOSPlatform = function () {
		/* check if device is iOS */
		_core.status.isIOSDevice = /\b(iPod|iPhone|iPad)\b/i.test(navigator.userAgent);
	};

	_core._cacheDomElements = function () {
		/* define slider objects */
		var root = jQuery( _core.cfg.rootElementSelector );
		_core.domParts.rootElement = root;
		_core.domParts.carouselWrapper = root; // Often same as root for simple setups
		_core.domParts.carouselViewport = root.find( _core.cfg.viewportClass );
		_core.domParts.carouselMask = root.find( _core.cfg.maskClass );
		_core.domParts.carouselItems = root.find( _core.cfg.carouselItemsClass );
		_core.domParts.carouselItem = root.find( _core.cfg.itemClass );
	};

	_core._applyBaseStyles = function () {
		/* apply essential CSS for layout */
		_core.domParts.carouselWrapper.css({
			position: 'relative',
			//width: '100%', // Original comment, removed in clone as it's often handled by parent
			display: 'block', // Ensure block display
			overflow: 'hidden' // Hide potential initial overflow
		});

		_core.domParts.carouselViewport.css({
			overflow: 'hidden',
			position: 'relative',
			width: '100%'
		});
	};