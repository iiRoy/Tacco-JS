/*
 * ContentFlow
 * A dynamic component for displaying content blocks
 *
 * Copyright (c) 2014 Johann Heyne
 *
 * Terms of use:
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 */

var contentFlow = {};
contentFlow.mediaReady = false;
contentFlow.mediaLoaded = false;

function onVideoPlatformAPIReady() {

	contentFlow.mediaReady = true;
}

function ContentFlow() {

	var inst = this;

	inst.config = {

		// file paths
		baseAssetPath: '/',

		// main container selector
		containerSelector: '.yerslider',

		// loaded content types
		mediaLoadedTargets: [ 'slide', 'thumbs' ], /* [ 'slider', 'slide', 'thumbs' ] */
		messageDisplayDelay: 30,

		// item spacing
		itemSpacing: 0,

		// movement increment
		moveIncrement: undefined,

		// item grouping
		itemGroupSize: 1,
		responsiveGroupMap: {},

		// gesture control
		enableSwipe: false,
		swipeWithMouse: false,
		swipeAndNavButtons: false,
		swipeTransitionSpeed: 300,

		// visual animation
		transitionStyle: 'ease', /* ease, ease-in-out, ease-in, ease-out, linear */
		transitionDuration: 1000,

		// looping behavior
		loopBehavior: 'none', /* infinite, rollback */
		swipeLoopBehavior: 'none', /* infinite */

		// automatic progression
		autoAdvance: false, /* true */
		autoAdvanceInterval: 3000, /* integer ms, 0 */
		minAdvancePause: 10, /* integer ms, 0 */
		advancePauseDuration: false, /* integer ms, 0 */
		initialAdvanceDelay: 0, /* integer ms, 0 */
		pauseOnHover: true,

		continuousAdvance: false, /* true */
		continuousAdvanceSpeed: 10000,
		continuousPauseOnHover: true,

		// component classes
		mainContainerClass: '.yerslider',
		wrapperClass: '.yerslider-wrap',
		viewportClass: '.yerslider-viewport',
		maskClass: '.yerslider-mask',
		itemsContainerClass: '.yerslider-slider',
		itemClass: '.yerslider-slide',
		loadingIndicatorClass: '.yerslider-loading',

		// navigation controls
		showNextButton: true,
		showPrevButton: true,
		navButtonPlacement: 'inside', // inside, outside,
		navButtonBaseClass: '.yerslider-prevnext',
		nextButtonClass: '.yerslider-next',
		prevButtonClass: '.yerslider-prev',
		nextButtonDisabledClass: '.yerslider-next-inactive',
		prevButtonDisabledClass: '.yerslider-prev-inactive',
		extraNextButtonClass: '',
		extraPrevButtonClass: '',

		// key bindings
		nextKeybind: 13,
		prevKeybind: 14,

		// pointer indicators
		showPointers: false,
		pointerPlacement: 'outside', // inside, outside,
		clickablePointers: true,
		wrapperHasPointersClass: '.yerslider-has-bullets',
		pointerWrapperClass: '.yerslider-bullets-wrap',
		pointerClass: '.yerslider-bullet',
		currentPointerClass: '.yerslider-bullet-current',

		// thumbnail navigation
		showThumbnails: false,
		hideThumbsIfFew: 2,
		thumbnailPlacement: 'outside', // inside, outside,
		thumbnailTemplates: {},
		clickableThumbnails: true,
		wrapperHasThumbnailsClass: '.yerslider-has-thumbs',
		thumbnailWrapperClass: '.yerslider-thumbs-wrap',
		thumbnailViewportClass: '.yerslider-thumbs-viewport',
		thumbnailMaskClass: '.yerslider-thumbs-mask',
		thumbnailItemsClass: '.yerslider-thumbs-items',
		thumbnailItemClass: '.yerslider-thumbs-item',
		thumbnailsReadyCallback: undefined, // a function that will call after thumbs are ready

		// media settings
		useSublimeVideo: false,
		autoLoadVideoAPI: true,
		closeVideoAfterPlay: true,

		// scroll behavior
		scrollToTopOnNav: false,
		scrollTopOffset: 0,
		scrollTopDuration: 500,

		// itemDisplayTime: 500,
		loadDependenciesAutomatically: true,

		// event callbacks
		flowReadyCallback: undefined,

		// detachment settings
		detachBehavior: undefined,

		fadeInDuration: 'slow'
	};

	inst.status = {
		maxGroupSize: 1,
		currentGroupSize: 1,
		currentItemIndex: 0,
		currentItemPosition: 0,
		itemCount: 0,
		maskWidth: 0,
		itemWidth: 0,
		isTransitioning: false,
		isSwiping: false,
		lastInteractionType: false,
		nextEnabled: false,
		prevEnabled: false,
		pointerCount: 0,
		pointerCountCache: 0,
		currentPointer: 0,
		pointersUpdated: false,
		movingLeft: false,
		movingRight: false,
		isResizing: false,
		cssTransitionsEnabled: false,
		isEventTriggered: false,
		isTouchDevice: false,
		interactionEventType: 'click',
		isAppleDevice: false,
		isViewportResizing: false,
		visibleItemsStartIndex: false,
		visibleItemsEndIndex: false,
		visibleItemsIndexes: false,
		autoAdvanceTimer: false,
		autoAdvanceActive: false,
		videoIdentifierIndex: 0,
		videoPlayerIndex: 0,
		lastPlayedMedia: false,
		mediaIsPlaying: false,
		currentLoopMode: false,
		loadedModuleCount: 0,
		totalModuleCount: 0,
		detectedBrowserFeatures: [],
		loadingTimer: false,
		isLoadingContent: false,
	};

	inst.elements = {
		mainContainer: undefined,
		wrapper: undefined,
		viewport: undefined,
		mask: undefined,
		itemsContainer: undefined,
		itemElements: undefined,
		pointerWrapper: undefined,
		pointerElements: undefined,
		prevButton: undefined,
		nextButton: undefined,
		mediaPlayers: {},
		itemMediaPlayers: {},
		thumbnailWrapper: undefined,
		thumbnailViewport: undefined,
		thumbnailItemsContainer: undefined,
		thumbnailItemElements: undefined,
		visibleItemElements: undefined,
	};

	// Initialize the component
	inst.initialize = function ( userSettings ) {

		inst.initializeConfig( userSettings );

		inst.detectBrowserCapabilities();

		inst.setupTouchDetection();

		inst.adjustConfiguration();

		// Check if the main container element exists
		if ( $( inst.config.containerSelector ).length > 0 ) {

			inst.loadRequiredModules();

			// WHEN ALL NECESSARY MODULES ARE LOADED, EXECUTE THE MAIN WORKFLOW {

				inst.utility.awaitCondition( inst.status, {
					flagKey: 'loadedModuleCount',
					targetValue: inst.status.totalModuleCount,
					onConditionMet: inst.startSystemFlow,
				} );

			// }
		}
	};

	inst.detectBrowserCapabilities = function () {

		inst.status.detectedBrowserFeatures = $('html').attr('class').split(/\s+/);
	};

	inst.loadRequiredModules = function () {

		// LOAD DEPENDENCIES IF NOT ALREADY PRESENT {

			if ( inst.config.loadDependenciesAutomatically ) {

				// YouTube iframe API {

					if ( typeof VideoProviderAPI === 'undefined' && inst.config.autoLoadVideoAPI && !contentFlow.mediaLoaded ) {

						$.getScript( 'https://www.youtube.com/iframe_api', function() {

							inst.status.loadedModuleCount++;
							contentFlow.mediaLoaded = true;
						} );
					}
					else {

						inst.status.loadedModuleCount++;
					}

				// }

				// imagesLoaded plugin {

					if ( typeof $.fn.imagesLoaded === 'undefined' ) {

							inst.loadModuleScript( {

								scriptPath: inst.config.baseAssetPath + 'dependencies/imagesloaded.js',
							} );
					}
					else {

						inst.status.loadedModuleCount++;
					}

				// }

				// TouchSwipe plugin {

					if ( typeof $.fn.swipe === 'undefined'
					&& ( $.inArray( 'touch', inst.status.detectedBrowserFeatures ) !== -1 || inst.config.swipeWithMouse === true )
					&& inst.config.enableSwipe === true ) {

						inst.loadModuleScript( {

							scriptPath: inst.config.baseAssetPath + 'dependencies/jquery.touchSwipe.js',
						} );
					}
					else {

						inst.status.loadedModuleCount++;
					}

				// }

				inst.status.totalModuleCount = 3;
			}

		// }

	};

	inst.loadModuleScript = function ( settings ) {

		$.ajax( {
			url: settings.scriptPath,
			dataType: 'script',
			cache: true,
			async: true,
			success: function () {

				inst.status.loadedModuleCount++;
			}
		});
	};

	inst.startSystemFlow = function () {

		inst.setupAnimationDetection();

		inst.detectAppleDevice();

		inst.cacheDOMElements();

		inst.applyInitialStyles();

		inst.elements.wrapper.css( {
			'opacity': '0',
		} );

		inst.updateMaskWidth();
		inst.updateItemCount();
		inst.updateItemGroupSize();
		inst.updateMaxGroupSize();
		inst.updateVisibleItems();
		inst.updateCurrentItemIndexes();
		inst.updateItemWidth();
		inst.updateItemHeight();

		inst.cloneItems();

		inst.setupNavButtons();

		inst.setupKeyboardNavigation();

		inst.initializeThumbnails();

		inst.initializePointers();

		inst.setupDetachment();

		inst.setupSwipeGestures();

		inst.handleAppleResizeBug();

		inst.displayItems();

		inst.initializeMediaPlayers();

		inst.ensureEqualItemHeight();

		inst.revealFlowContainer();

		// }
	};

	inst.triggerFlowReady = function () {

		if ( typeof inst.config.flowReadyCallback === 'function' ) {

			inst.elements.itemsContainer.imagesLoaded()
				.always( function( instance ) {

					var callbackData = {
						elements: inst.elements,
						config: inst.config,
					};

					inst.config.flowReadyCallback( callbackData );
				});
		}

	};

	inst.initializeConfig = function ( incomingConfig ) {

		/* retrieve default configuration */

		inst.config = inst.utility.mergeConfigurations( {
			user: incomingConfig,
			defaults: inst.config
		} );

		// retrieve global parameters {

			if ( typeof FlowSystemDefaults !== 'undefined' ) {

				$.extend( true, inst.config, FlowSystemDefaults.config );
			}

		// }

		// VALIDATE AUTO ADVANCE INTERVAL {

			if ( inst.config.advancePauseDuration ) {

				inst.config.autoAdvanceInterval = inst.config.transitionDuration + inst.config.advancePauseDuration;
			}

			if ( inst.config.autoAdvanceInterval <= inst.config.transitionDuration ) {

				inst.config.autoAdvanceInterval = inst.config.transitionDuration + inst.config.minAdvancePause;
			}

		// }

	};

	inst.setupAnimationDetection = function () {

		/* detect CSS animation capabilities */

		var htmlElement = $('html');

		if ( htmlElement.hasClass( 'csstransitions' ) && htmlElement.hasClass( 'csstransforms3d' ) && htmlElement.hasClass( 'cssanimations' ) && inst.config.itemGroupSize > 0 ) {

			inst.status.cssTransitionsEnabled = true;
		}

	};

	inst.setupTouchDetection = function () {

		/* touch device detection */

		if ( $('html').hasClass('touch') || inst.config.swipeWithMouse === true ) {

			inst.status.isTouchDevice = true;
			inst.status.interactionEventType = 'touchend';
		}

		if ( inst.status.isTouchDevice && inst.config.enableSwipe && !inst.config.swipeAndNavButtons ) {

			inst.config.showNextButton = false;
			inst.config.showPrevButton = false;
		}
	};

	inst.adjustConfiguration = function () {

		// set inst.status.currentLoopMode {

			inst.status.currentLoopMode = inst.config.loopBehavior;

			if ( inst.status.isTouchDevice && inst.config.enableSwipe ) {

				inst.status.currentLoopMode = inst.config.swipeLoopBehavior;
			}

		// }

		// automatic dependency loading {

			if ( typeof inst.config.loadDependenciesAutomatically === 'object' ) {

				inst.status.loadDependenciesAutomatically = inst.config.loadDependenciesAutomatically;
			}

		// }
	};

	inst.detectAppleDevice = function () {

		/* check for iOS devices */

		if ( navigator.userAgent.match(/(iPod|iPhone|iPad)/) ) {

			inst.status.isAppleDevice = true;
		}
	};

	inst.cacheDOMElements = function () {

		/* define main component elements */

		inst.elements.mainContainer = $( inst.config.containerSelector );
		inst.elements.wrapper = $( inst.config.containerSelector );
		inst.elements.viewport = $( inst.config.containerSelector + ' ' + inst.config.viewportClass );
		inst.elements.mask = $( inst.config.containerSelector + ' ' + inst.config.maskClass );
		inst.elements.itemsContainer = $( inst.config.containerSelector + ' ' + inst.config.itemsContainerClass );
		inst.elements.itemElements = $( inst.config.containerSelector + ' ' + inst.config.itemClass );
	};

	inst.applyInitialStyles = function () {

		/* apply base styles to the component */

		inst.elements.wrapper.css({
			position: 'relative',
			//width: '100%'