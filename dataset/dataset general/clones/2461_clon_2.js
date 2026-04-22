/*!
 * LightView - JS Component
 * Version: 3.0.1 (Thu, 28 Nov 2024)
 * Needs jQuery v1.8 or later
 *
 * Usage examples at http://viewapps.net/lightview/
 * License: viewapps.net/lightview/#license
 *
 * Copyright 2024 Alex Smith - alex@viewapps.net
 *
 */

;(function (winView, docElem, $, undefined) {
	"use strict"; /* Enforce strict JavaScript parsing and execution rules */

	var
		docRoot = $("html"),
		winViewPort = $(winView),
		docBody = $(docElem),

		MV = $.lightView = function () { MV.launchView.apply( this, arguments ); }, /* Main LightView object */

		isOldBrowser =  navigator.userAgent.match(/msie/i), /* Checks for Internet Explorer */

		hasBeenUpdated	= null, /* Flag to check if any update happened */
		isTouchScreen		= docElem.createTouch !== undefined, /* Detects touch device capabilities */

		isJQueryObj	= function(elem) { /* Determines if an object is a jQuery instance */
			return elem && elem.hasOwnProperty && elem instanceof $;
		},
		isTextVal = function(val) { /* Checks if a given value is a string */
			return val && $.type(val) === "string";
		},
		isPercentFormat = function(val) { /* Verifies if a string represents a percentage */
			return isTextVal(val) && val.indexOf('%') > 0;
		},
		canScroll = function(elem) { /* Ascertains if an element has scrollable content */
			return (elem && !(elem.style.overflow && elem.style.overflow === 'hidden') && ((elem.clientWidth && elem.scrollWidth > elem.clientWidth) || (elem.clientHeight && elem.scrollHeight > elem.clientHeight)));
		},
		getNumericValue = function(input, dimension) { /* Extracts a numeric scalar from a string */
			var calculatedValue = parseInt(input, 10) || 0; /* Parse integer, default to 0 */

			if (dimension && isPercentFormat(input)) { /* If dimension specified and input is percentage */
				calculatedValue = MV.getViewport()[ dimension ] / 100 * calculatedValue; /* Calculate based on viewport dimension */
			}

			return Math.ceil(calculatedValue); /* Round up to nearest integer */
		},
		getPixelValue = function(inputVal, dimensionType) { /* Returns a pixel value string */
			return getNumericValue(inputVal, dimensionType) + 'px';
		};

	$.extend(MV, {
		// The current version of LightView component
		componentVersion: '3.0.1',

		configOptions: {
			padSpace : 15, /* Internal spacing */
			outerSpace  : 20, /* External margin */

			viewWidth     : 800, /* Default content width */
			viewHeight    : 600, /* Default content height */
			minViewWidth  : 100, /* Minimum allowed width */
			minViewHeight : 100, /* Minimum allowed height */
			maxViewWidth  : 9999, /* Maximum allowed width */
			maxViewHeight : 9999, /* Maximum allowed height */
			displayRatio: 1, /* Pixel ratio for high-DPI displays */

			autoFit   : true, /* Automatically adjust size */
			autoFitHeight : false, /* Automatically adjust height */
			autoFitWidth  : false, /* Automatically adjust width */

			autoResize  : true, /* Enable automatic resizing */
			autoCenter  : !isTouchScreen, /* Center automatically, unless touch device */
			adjustToViewport   : true, /* Fit content within viewport */
			keepAspect : false, /* Maintain aspect ratio */
			verticalPosRatio    : 0.5, /* Vertical positioning ratio */
			horizontalPosRatio   : 0.5, /* Horizontal positioning ratio */

			scrollBehavior : 'auto', /* 'auto', 'yes' or 'no' for content scrolling */
			containerClass   : '', /* Custom CSS class for the main container */

			navArrows     : true, /* Show navigation arrows */
			closeButton   : true, /* Show close button */
			closeItemClick : false, /* Close on click of item */
			nextItemClick  : false, /* Navigate to next on item click */
			wheelNavigation : true, /* Enable mouse wheel navigation */
			slideshowEnabled   : false, /* Autoplay slideshow */
			slideshowInterval  : 3000, /* Slideshow speed in ms */
			preLoadCount    : 3, /* Number of items to preload */
			isModal      : false, /* Make it a modal dialog */
			loopSlideshow       : true, /* Loop slideshow at ends */

			asyncRequest  : { /* AJAX settings */
				dataType : 'html', /* Expected data type */
				headers  : { 'X-LightView': true } /* Custom headers */
			},
			embeddedFrame : { /* Iframe settings */
				scrollBehavior : 'auto', /* Iframe scrolling behavior */
				preLoad   : true /* Preload iframe content */
			},
			flashContent : { /* SWF settings */
				wmode: 'transparent', /* Window mode for Flash */
				allowfullscreen   : 'true', /* Allow full screen */
				allowscriptaccess : 'always' /* Allow script access */
			},

			keyboardShortcuts  : { /* Keyboard navigation keys */
				nextKey : {
					13 : 'left', /* enter */
					34 : 'up',   /* page down */
					39 : 'left', /* right arrow */
					40 : 'up'    /* down arrow */
				},
				prevKey : {
					8  : 'right', /* backspace */
					33 : 'down',  /* page up */
					37 : 'right', /* left arrow */
					38 : 'down'   /* up arrow */
				},
				closeKey  : [27], /* escape key */
				playKey   : [32], /* space - start/stop slideshow */
				toggleKey : [70]  /* letter "f" - toggle fullscreen */
			},

			navDirection : { /* Navigation directions for keys */
				next : 'left',
				prev : 'right'
			},

			allowScrollOutside  : true, /* Allow page scrolling when LightView is open */

			// Override some properties
			itemIndex   : 0, /* Starting index for group */
			contentType    : null, /* Type of content (image, ajax, etc.) */
			sourceUrl    : null, /* URL for content */
			displayContent : null, /* Direct content to display */
			itemTitle   : null, /* Title of the content */

			// HTML templates for various elements
			templates: {
				containerMarkup     : '<div class="lightview-wrap" tabIndex="-1"><div class="lightview-skin"><div class="lightview-outer"><div class="lightview-inner"></div></div></div></div>',
				imageMarkup    : '<img class="lightview-image" src="{sourceUrl}" alt="" />',
				frameMarkup   : '<iframe id="lightview-frame{rnd}" name="lightview-frame{rnd}" class="lightview-iframe" frameborder="0" vspace="0" hspace="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen' + (isOldBrowser ? ' allowtransparency="true"' : '') + '></iframe>',
				errorMarkup    : '<p class="lightview-error">The requested content cannot be loaded.<br/>Please try again later.</p>',
				closeButtonMarkup : '<a title="Close" class="lightview-item lightview-close" href="javascript:;"></a>',
				nextNavMarkup     : '<a title="Next" class="lightview-nav lightview-next" href="javascript:;"><span></span></a>',
				prevNavMarkup     : '<a title="Previous" class="lightview-nav lightview-prev" href="javascript:;"><span></span></a>'
			},

			// Animation properties for different actions
			entryEffect  : 'fade', /* 'elastic', 'fade' or 'none' */
			entryDuration   : 250, /* Speed for opening animation */
			entryEasing  : 'swing', /* Easing for opening */
			entryOpacity : true, /* Use opacity for opening */
			entryTransition  : 'zoomIn', /* Method for opening */

			exitEffect  : 'fade', /* 'elastic', 'fade' or 'none' */
			exitDuration   : 250, /* Speed for closing animation */
			exitEasing  : 'swing', /* Easing for closing */
			exitOpacity : true, /* Use opacity for closing */
			exitTransition  : 'zoomOut', /* Method for closing */

			nextEffectType : 'elastic', /* 'elastic', 'fade' or 'none' */
			nextItemDuration  : 250, /* Speed for next item transition */
			nextItemEasing : 'swing', /* Easing for next item */
			nextItemTransition : 'changeIn', /* Method for next item */

			prevEffectType : 'elastic', /* 'elastic', 'fade' or 'none' */
			prevItemDuration  : 250, /* Speed for previous item transition */
			prevItemEasing : 'swing', /* Easing for previous item */
			prevItemTransition : 'changeOut', /* Method for previous item */

			// Enable default utility modules
			utilityModules : {
				showOverlay : true,
				showTitle   : true
			},

			// Callback functions for lifecycle events
			onDismiss     : $.noop, /* On canceling the view */
			preLoad   : $.noop, /* Before content loading */
			postLoad    : $.noop, /* After content loading */
			preDisplay   : $.noop, /* Before showing content */
			postDisplay    : $.noop, /* After content is shown */
			preChange : $.noop, /* Before changing to another item */
			preClose  : $.noop, /* Before closing the view */
			postClose  : $.noop  /* After closing the view */
		},

		// Current operational state of LightView
		itemGroup    : {}, /* The collection of items to display */
		currentOptions     : {}, /* Merged options for the current group */
		prevItem : null,  /* Reference to the previously displayed item */
		incomingItem   : null,  /* Reference to the item currently being loaded */
		activeItem  : null,  /* Reference to the currently active/displayed item */
		isCurrentlyActive : false, /* Indicates if LightView is active */
		isCurrentlyOpen   : false, /* Indicates if LightView is open */
		hasOpenedFully : false, /* Indicates if LightView has fully opened at least once */

		mainContainer  : null, /* The main wrapper element */
		visualSkin  : null, /* The skin element */
		outerWrapper : null, /* The outer content wrapper */
		innerContent : null, /* The inner content wrapper */

		slideshowManager : { /* Manages the slideshow functionality */
			slideTimer    : null, /* Timer for slideshow transitions */
			slideshowActive : false /* Flag indicating if slideshow is running */
		},

		// Asynchronous loaders
		xhrRequest   : null, /* For AJAX content loading */
		imageLoader : null, /* For image preloading */

		// Various collections of handlers
		animationHandlers : {}, /* Registered animation transition methods */
		helperUtilities     : {}, /* Registered helper modules */

		/*
		 *	Public API methods
		 */

		launchView: function (itemCollection, viewOptions) {
			if (!itemCollection) {
				return; /* Nothing to display */
			}

			if (!$.isPlainObject(viewOptions)) {
				viewOptions = {}; /* Initialize options if not an object */
			}

			// If already active, close it first
			if (false === MV.shutView(true)) {
				return;
			}

			// Normalize the input collection
			if (!$.isArray(itemCollection)) {
				itemCollection = isJQueryObj(itemCollection) ? $(itemCollection).get() : [itemCollection];
			}

			// Process each element in the collection to determine content type and properties
			$.each(itemCollection, function(idx, currentElement) {
				var itemObj = {},
					itemSrc,
					itemLabel,
					actualContent,
					contentTypeId,
					matchResult,
					srcParts,
					contentSelector;

				if ($.type(currentElement) === "object") {
					// Check if it's a DOM element
					if (currentElement.nodeType) {
						currentElement = $(currentElement);
					}

					if (isJQueryObj(currentElement)) {
						itemObj = {
							sourceUrl    : currentElement.data('lightview-href') || currentElement.attr('href'),
							itemTitle   : $('<div/>').text( currentElement.data('lightview-title') || currentElement.attr('title') ).html(),
							isDom   : true,
							element : currentElement
						};

						if ($.metadata) {
							$.extend(true, itemObj, currentElement.metadata());
						}

					} else {
						itemObj = currentElement;
					}
				}

				itemSrc  = viewOptions.sourceUrl  || itemObj.sourceUrl || (isTextVal(currentElement) ? currentElement : null);
				itemLabel = viewOptions.itemTitle !== undefined ? viewOptions.itemTitle : itemObj.itemTitle || '';

				actualContent = viewOptions.displayContent || itemObj.displayContent;
				contentTypeId    = actualContent ? 'html' : (viewOptions.contentType  || itemObj.contentType);

				if (!contentTypeId && itemObj.isDom) {
					contentTypeId = currentElement.data('lightview-type');

					if (!contentTypeId) {
						matchResult  = currentElement.prop('class').match(/lightview\.(\w+)/);
						contentTypeId = matchResult ? matchResult[1] : null;
					}
				}

				if (isTextVal(itemSrc)) {
					// Attempt to infer the content type from the URL
					if (!contentTypeId) {
						if (MV.isImage(itemSrc)) {
							contentTypeId = 'image';

						} else if (MV.isSWF(itemSrc)) {
							contentTypeId = 'swf';

						} else if (itemSrc.charAt(0) === '#') {
							contentTypeId = 'inline';

						} else if (isTextVal(currentElement)) {
							contentTypeId    = 'html';
							actualContent = currentElement;
						}
					}

					// Split URL into source and content selector, e.g.,
					// "/mypage.html #my_id" will load "/mypage.html" and display element with id "my_id"
					if (contentTypeId === 'ajax') {
						srcParts = itemSrc.split(/\s+/, 2);
						itemSrc      = srcParts.shift();
						contentSelector  = srcParts.shift();
					}
				}

				if (!actualContent) {
					if (contentTypeId === 'inline') {
						if (itemSrc) {
							actualContent = $( isTextVal(itemSrc) ? itemSrc.replace(/.*(?=#[^\s]+$)/, '') : itemSrc ); /* Strip for IE7 compatibility */

						} else if (itemObj.isDom) {
							actualContent = currentElement;
						}

					} else if (contentTypeId === 'html') {
						actualContent = itemSrc;

					} else if (!contentTypeId && !itemSrc && itemObj.isDom) {
						contentTypeId    = 'inline';
						actualContent = currentElement;
					}
				}

				$.extend(itemObj, {
					sourceUrl     : itemSrc,
					contentType     : contentTypeId,
					displayContent  : actualContent,
					itemTitle     : itemLabel,
					contentSelector : contentSelector
				});

				itemCollection[ idx ] = itemObj; /* Update the group item */
			});

			// Merge the default configuration with user-provided options
			MV.currentOptions = $.extend(true, {}, MV.configOptions, viewOptions);

			// Keyboard shortcuts are merged shallowly, not recursively
			if (viewOptions.keyboardShortcuts !== undefined) {
				MV.currentOptions.keyboardShortcuts = viewOptions.keyboardShortcuts ? $.extend({}, MV.configOptions.keyboardShortcuts, viewOptions.keyboardShortcuts) : false;
			}

			MV.itemGroup = itemCollection; /* Store the processed item group */

			return MV._beginDisplay(MV.currentOptions.itemIndex); /* Start the display process */
		},

		// Cancel loading image or abort AJAX request
		dismissView: function () {
			var currentIncoming = MV.incomingItem;

			if (currentIncoming && false === MV.trigger('onDismiss')) {
				return; /* Abort if callback prevents dismissal */
			}

			MV.hideLoading(); /* Hide loading indicator */

			if (!currentIncoming) {
				return; /* No item was incoming */
			}

			if (MV.xhrRequest) {
				MV.xhrRequest.abort(); /* Abort active AJAX request */
			}

			MV.xhrRequest = null; /* Clear AJAX request reference */

			if (MV.imageLoader) {
				MV.imageLoader.onload = MV.imageLoader.onerror = null; /* Clear image loader events */
			}

			if (currentIncoming.mainContainer) {
				currentIncoming.mainContainer.stop(true, true).trigger('onReset').remove(); /* Stop animations, reset, and remove container */
			}

			MV.incomingItem = null; /* Clear incoming item reference */

			// If the very first item was canceled, clean up everything
			if (!MV.activeItem) {
				MV._afterZoomOut( currentIncoming );
			}
		},

		// Initiate closing animation if open; remove immediately if in process of opening/closing
		shutView: function (forceClose) {
			MV.dismissView(); /* Cancel any ongoing loading */

			if (false === MV.trigger('preClose')) {
				return; /* Abort if callback prevents closing */
			}

			MV.unbindEvents(); /* Detach all event handlers */

			if (!MV.isCurrentlyActive) {
				return; /* Not active, nothing to close */
			}

			if (!MV.isCurrentlyOpen || forceClose === true) { /* If not fully open or forced close */
				$('.lightview-wrap').stop(true).trigger('onReset').remove(); /* Immediately remove wrapper */

				MV._afterZoomOut(); /* Perform post-zoom out cleanup */

			} else {
				MV.isCurrentlyOpen = MV.hasOpenedFully = false; /* Update state flags */
				MV.isClosing = true; /* Indicate closing process */

				$('.lightview-item, .lightview-nav').remove(); /* Remove all active items and navigation */

				MV.mainContainer.stop(true, true).removeClass('lightview-opened'); /* Stop animations, remove 'opened' class */

				MV.animationHandlers[ MV.activeItem.exitTransition ](); /* Trigger exit animation */
			}
		},

		// Control slideshow:
		//   $.lightView.manageSlideshow(); - toggle slideshow
		//   $.lightView.manageSlideshow( true ); - start
		//   $.lightView.manageSlideshow( false ); - stop
		manageSlideshow: function ( actionFlag ) {
			var clearTimer = function () { /* Clears the slideshow timer */
					clearTimeout(MV.slideshowManager.slideTimer);
				},
				setTimer = function () { /* Sets or resets the slideshow timer */
					clearTimer();

					if (MV.activeItem && MV.slideshowManager.slideshowActive) {
						MV.slideshowManager.slideTimer = setTimeout(MV.advanceItem, MV.activeItem.slideshowInterval);
					}
				},
				stopSlideshow = function () { /* Stops the slideshow */
					clearTimer();

					docBody.unbind('.player'); /* Unbind player-related events */

					MV.slideshowManager.slideshowActive = false; /* Set active flag to false */

					MV.trigger('onPlayEnd'); /* Trigger slideshow end event */
				},
				startSlideshow = function () { /* Starts the slideshow */
					if (MV.activeItem && (MV.activeItem.loopSlideshow || MV.activeItem.itemIndex < MV.itemGroup.length - 1)) {
						MV.slideshowManager.slideshowActive = true; /* Set active flag to true */

						docBody.bind({
							'onDismiss.player preClose.player' : stopSlideshow, /* Stop slideshow on dismiss or close */
							'onUpdate.player'   : setTimer, /* Reset timer on update */
							'preLoad.player' : clearTimer /* Clear timer before loading new item */
						});

						setTimer(); /* Initialize the timer */

						MV.trigger('onPlayStart'); /* Trigger slideshow start event */
					}
				};

			if (actionFlag === true || (!MV.slideshowManager.slideshowActive && actionFlag !== false)) {
				startSlideshow(); /* Start if explicitly true or not active and not explicitly false */
			} else {
				stopSlideshow(); /* Otherwise, stop the slideshow */
			}
		},

		// Advance to the next gallery item
		advanceItem: function ( movementDirection ) {
			var currentDisplay = MV.activeItem;

			if (currentDisplay) {
				if (!isTextVal(movementDirection)) {
					movementDirection = currentDisplay.navDirection.next; /* Use default next direction */
				}

				MV.navigateToIndex(currentDisplay.itemIndex + 1, movementDirection, 'next'); /* Navigate to next index */
			}
		},

		// Revert to the previous gallery item
		recedeItem: function ( movementDirection ) {
			var currentDisplay = MV.activeItem;

			if (currentDisplay) {
				if (!isTextVal(movementDirection)) {
					movementDirection = currentDisplay.navDirection.prev; /* Use default previous direction */
				}

				MV.navigateToIndex(currentDisplay.itemIndex - 1, movementDirection, 'prev'); /* Navigate to previous index */
			}
		}
	});