(function (globalObj, docObj, jq, undef) {
	"use strict";

	// Core application constants and utility variables
	var HT = jq("html"),
		VW = jq(globalObj),
		PG = jq(docObj),
		MB = jq.modalbox = function () {
			MB.launch.apply(this, arguments);
		},
		LEGACY_ENGINE = globalObj.navigator.userAgent.match(/msie/i),
		hasBeenRefreshed = null,
		touchDetected = docObj.createTouch !== undef,

		// Checks if the provided object is a jQuery instance
		isJQueryObj = function (inputObj) {
			return inputObj && inputObj.hasOwnProperty && inputObj instanceof jq;
		},

		// Validates if the input is a string
		isTextVal = function (inputStr) {
			return inputStr && jq.type(inputStr) === "string";
		},

		// Determines if a string represents a percentage value
		isPercentFormat = function (inputStr) {
			return isTextVal(inputStr) && inputStr.indexOf('%') > 0;
		},

		// Checks if an HTML element can be scrolled
		canBeScrolled = function (elementNode) {
			return (elementNode && !(elementNode.style.overflow && elementNode.style.overflow === 'hidden') && ((elementNode.clientWidth && elementNode.scrollWidth > elementNode.clientWidth) || (elementNode.clientHeight && elementNode.scrollHeight > elementNode.clientHeight)));
		},

		// Extracts a numeric scalar value from a string, optionally applying percentage calculation
		extractNumeric = function (originalValue, dimensionKey) {
			var numericValue = parseInt(originalValue, 10) || 0;

			if (dimensionKey && isPercentFormat(originalValue)) {
				numericValue = MB.getVisibleArea()[dimensionKey] / 100 * numericValue;
			}

			return Math.ceil(numericValue);
		},

		// Returns a pixel value string from a raw value
		getPixelValue = function (valueInput, dimensionIdentifier) {
			return extractNumeric(valueInput, dimensionIdentifier) + 'px';
		};

	// Extend the main ModalBox object with its public API and configuration
	jq.extend(MB, {
		// Module release number
		release: '2.1.5',

		// Default configuration settings for all modal instances
		configSettings: {
			innerSpace: 15,
			outerSpace: 20,

			boxWidth: 800,
			boxHeight: 600,
			minBoxWidth: 100,
			minBoxHeight: 100,
			maxBoxWidth: 9999,
			maxBoxHeight: 9999,
			pixelRatio: 1, // Set to 2 for retina display support

			adjustDimensions: true,
			autoFitHeight: false,
			autoFitWidth: false,

			responsiveResize: true,
			centerAutomatically: !touchDetected,
			constrainToView: true,
			keepAspectRatio: false,
			verticalPositionRatio: 0.5,
			horizontalPositionRatio: 0.5,

			scrollBehavior: 'auto', // 'auto', 'yes' or 'no'
			containerStyleClass: '',

			navigationArrows: true,
			closeButtonVisible: true,
			closeOnOverlayClick: false,
			nextOnContentClick: false,
			mouseWheelNav: true,
			slideshowActive: false,
			slideshowInterval: 3000,
			preLoadCount: 3,
			isModalDialog: false,
			loopSlideshow: true,

			ajaxOptions: {
				dataType: 'html',
				headers: { 'X-modalbox': true }
			},
			iframeSettings: {
				scrolling: 'no',
				preload: true
			},
			flashSettings: {
				wmode: 'transparent',
				allowfullscreen: 'true',
				allowscriptaccess: 'always'
			},

			keyboardShortcuts: {
				nextItemKeys: {
					13: 'left', // enter
					34: 'up',   // page down
					39: 'left', // right arrow
					40: 'up'    // down arrow
				},
				prevItemKeys: {
					8: 'right',  // backspace
					33: 'down',   // page up
					37: 'right',  // left arrow
					38: 'down'    // up arrow
				},
				closeKeys: [27], // escape key
				playPauseKeys: [32], // space - start/stop slideshow
				fullscreenToggleKeys: [70]  // letter "f" - toggle fullscreen
			},

			navigationDirections: {
				next: 'left',
				prev: 'right'
			},

			allowScrollOutside: true,

			// Overridable properties for individual items
			currentIndex: 0,
			contentType: null,
			contentSource: null,
			displayContent: null,
			contentTitle: null,

			// HTML template strings for various components
			templateMarkup: {
				containerWrap: '<div class="modalbox-wrap" tabIndex="-1"><div class="modalbox-skin"><div class="modalbox-outer"><div class="modalbox-inner"></div></div></div></div>',
				imageTag: '<img class="modalbox-image" src="{href}" alt="" />',
				iframeTag: '<iframe id="modalbox-frame{rnd}" name="modalbox-frame{rnd}" class="modalbox-iframe" frameborder="0" vspace="0" hspace="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen' + (LEGACY_ENGINE ? ' allowtransparency="true"' : '') + '></iframe>',
				errorMessage: '<p class="modalbox-error">The requested content cannot be loaded.<br/>Please try again later.</p>',
				closeBtnMarkup: '<a title="Close" class="modalbox-item modalbox-close" href="javascript:;"></a>',
				nextNavMarkup: '<a title="Next" class="modalbox-nav modalbox-next" href="javascript:;"><span></span></a>',
				prevNavMarkup: '<a title="Previous" class="modalbox-nav modalbox-prev" href="javascript:;"><span></span></a>'
			},

			// Animation properties for different actions
			entryEffect: 'fade', // 'elastic', 'fade' or 'none'
			entrySpeed: 250,
			entryEasing: 'swing',
			entryOpacity: true,
			entryMethod: 'zoomIn',

			exitEffect: 'fade', // 'elastic', 'fade' or 'none'
			exitSpeed: 250,
			exitEasing: 'swing',
			exitOpacity: true,
			exitMethod: 'zoomOut',

			nextTransitionEffect: 'elastic', // 'elastic', 'fade' or 'none'
			nextTransitionSpeed: 250,
			nextTransitionEasing: 'swing',
			nextTransitionMethod: 'changeIn',

			prevTransitionEffect: 'elastic', // 'elastic', 'fade' or 'none'
			prevTransitionSpeed: 250,
			prevTransitionEasing: 'swing',
			prevTransitionMethod: 'changeOut',

			// Default enabled utility modules
			utilityModules: {
				overlayModule: true,
				titleModule: true
			},

			// Callback functions for various lifecycle events
			onOperationCancelled: jq.noop, // Triggered if an operation is cancelled
			onBeforeContentLoad: jq.noop, // Before content starts loading
			onAfterContentLoad: jq.noop, // After content has loaded
			onBeforeDisplay: jq.noop, // Before the item is shown
			onAfterDisplay: jq.noop, // After the item is fully displayed
			onBeforeItemChange: jq.noop, // Before switching to another item
			onBeforeClosing: jq.noop, // Before the modal starts closing
			onAfterClosing: jq.noop  // After the modal is completely closed
		},

		// Current operational state of the modalbox
		contentGroup: {}, // Collection of items to display
		currentOptions: {}, // Active configuration for the current group
		previousItem: null,  // Refers to the item displayed previously
		loadingItem: null,  // Refers to the item currently being loaded
		activeItem: null,  // Refers to the item currently visible
		isModuleActive: false, // Indicates if the modalbox is in an active state
		isPanelOpen: false, // Indicates if the modalbox is currently open
		hasBeenOpened: false, // True if the modalbox has been opened at least once

		mainContainer: null,
		skinElement: null,
		outerWrapper: null,
		innerContentArea: null,

		slideshowManager: {
			slideshowTimer: null,
			isSlideshowRunning: false
		},

		// Handles for asynchronous operations
		ajaxRequestHandle: null,
		imagePreloader: null,

		// Registries for animations and helper utilities
		animationHandlers: {},
		helperFunctions: {},

		/*
		 *	Static API methods for controlling the modalbox
		 */

		launch: function (contentCollection, displayOptions) {
			// Ensure a content collection is provided
			if (!contentCollection) {
				return;
			}

			// Initialize options if not an object
			if (false === jq.isPlainObject(displayOptions)) {
				displayOptions = {};
			}

			// Close any existing active instance before opening a new one
			if (false === MB.terminate(true)) {
				return;
			}

			// Normalize the content collection into an array
			if (!jq.isArray(contentCollection)) {
				contentCollection = isJQueryObj(contentCollection) ? jq(contentCollection).get() : [contentCollection];
			}

			// Process each element in the collection to determine its type and properties
			jq.each(contentCollection, function (idx, currentElement) {
				var itemObject = {},
					sourceLink,
					itemTitle,
					itemContent,
					contentType,
					matchResult,
					urlSegments,
					contentSelector;

				if (jq.type(currentElement) === "object") {
					// If it's a DOM element, wrap it with jQuery
					if (currentElement.nodeType) {
						currentElement = jq(currentElement);
					}

					if (isJQueryObj(currentElement)) {
						itemObject = {
							contentSource: currentElement.data('modalbox-href') || currentElement.attr('href'),
							itemTitle: currentElement.data('modalbox-title') || currentElement.attr('title'),
							isDom: true,
							element: currentElement
						};

						// Extend with metadata if available
						if (jq.metadata) {
							jq.extend(true, itemObject, currentElement.metadata());
						}

					} else {
						itemObject = currentElement;
					}
				}

				sourceLink = displayOptions.contentSource || itemObject.contentSource || (isTextVal(currentElement) ? currentElement : null);
				itemTitle = displayOptions.itemTitle !== undef ? displayOptions.itemTitle : itemObject.itemTitle || '';

				itemContent = displayOptions.displayContent || itemObject.displayContent;
				contentType = itemContent ? 'html' : (displayOptions.contentType || itemObject.contentType);

				// Attempt to determine content type from data attributes or class names
				if (!contentType && itemObject.isDom) {
					contentType = currentElement.data('modalbox-type');

					if (!contentType) {
						matchResult = currentElement.prop('class').match(/modalbox\.(\w+)/);
						contentType = matchResult ? matchResult[1] : null;
					}
				}

				// Further type guessing based on content source
				if (isTextVal(sourceLink)) {
					if (!contentType) {
						if (MB.isImageFile(sourceLink)) {
							contentType = 'image';

						} else if (MB.isFlashFile(sourceLink)) {
							contentType = 'swf';

						} else if (sourceLink.charAt(0) === '#') {
							contentType = 'inline';

						} else if (isTextVal(currentElement)) {
							contentType = 'html';
							itemContent = currentElement;
						}
					}

					// Handle AJAX content with a selector (e.g., "page.html #id")
					if (contentType === 'ajax') {
						urlSegments = sourceLink.split(/\s+/, 2);
						sourceLink = urlSegments.shift();
						contentSelector = urlSegments.shift();
					}
				}

				// If content is still not defined, try to extract it from the source
				if (!itemContent) {
					if (contentType === 'inline') {
						if (sourceLink) {
							itemContent = jq(isTextVal(sourceLink) ? sourceLink.replace(/.*(?=#[^\s]+$)/, '') : sourceLink); // Strip URL for IE7 compatibility

						} else if (itemObject.isDom) {
							itemContent = currentElement;
						}

					} else if (contentType === 'html') {
						itemContent = sourceLink;

					} else if (!contentType && !sourceLink && itemObject.isDom) {
						contentType = 'inline';
						itemContent = currentElement;
					}
				}

				// Merge all determined properties into the item object
				jq.extend(itemObject, {
					contentSource: sourceLink,
					contentType: contentType,
					displayContent: itemContent,
					itemTitle: itemTitle,
					contentSelector: contentSelector
				});

				contentCollection[idx] = itemObject;
			});

			// Extend the default settings with user-provided options
			MB.currentOptions = jq.extend(true, {}, MB.configSettings, displayOptions);

			// Keys are merged shallowly, not recursively
			if (displayOptions.keyboardShortcuts !== undef) {
				MB.currentOptions.keyboardShortcuts = displayOptions.keyboardShortcuts ? jq.extend({}, MB.configSettings.keyboardShortcuts, displayOptions.keyboardShortcuts) : false;
			}

			MB.contentGroup = contentCollection;

			// Begin the display process with the specified index
			return MB._initiateDisplay(MB.currentOptions.currentIndex);
		},

		// Aborts any ongoing content loading processes
		abortOperation: function () {
			var incomingItem = MB.loadingItem;

			// Trigger a cancellation event
			if (false === MB.emitEvent('onOperationCancelled')) {
				return;
			}

			MB.concealLoader();

			if (!incomingItem) {
				return;
			}

			// Abort AJAX request if active
			if (MB.ajaxRequestHandle) {
				MB.ajaxRequestHandle.abort();
			}

			MB.ajaxRequestHandle = null;

			// Clear image preloader handlers
			if (MB.imagePreloader) {
				MB.imagePreloader.onload = MB.imagePreloader.onerror = null;
			}

			// Stop animations and remove the incoming item's wrap
			if (incomingItem.mainContainer) {
				incomingItem.mainContainer.stop(true, true).trigger('onReset').remove();
			}

			MB.loadingItem = null;

			// If the first item was cancelled, ensure a clean state
			if (!MB.activeItem) {
				MB._finalizeClosure(incomingItem);
			}
		},

		// Initiates the closing sequence for the modalbox
		terminate: function (closeEvent) {
			MB.abortOperation();

			if (false === MB.emitEvent('onBeforeClosing')) {
				return;
			}

			MB.detachAllEvents();

			if (!MB.isModuleActive) {
				return;
			}

			// If already closing or forcefully closing, remove immediately
			if (!MB.isPanelOpen || closeEvent === true) {
				jq('.modalbox-wrap').stop(true).trigger('onReset').remove();

				MB._finalizeClosure();

			} else {
				// Begin the animated closing process
				MB.isPanelOpen = MB.hasBeenOpened = false;
				MB.isClosing = true;

				jq('.modalbox-item, .modalbox-nav').remove();

				MB.mainContainer.stop(true, true).removeClass('modalbox-opened');

				MB.animationHandlers[MB.activeItem.exitMethod]();
			}
		},

		// Manages the slideshow functionality (start, stop, toggle)
		manageSlideshow: function (slideshowAction) {
			var clearTimerFunc = function () {
					clearTimeout(MB.slideshowManager.slideshowTimer);
				},
				setTimerFunc = function () {
					clearTimerFunc();

					if (MB.activeItem && MB.slideshowManager.isSlideshowRunning) {
						MB.slideshowManager.slideshowTimer = setTimeout(MB.showNextContent, MB.activeItem.slideshowInterval);
					}
				},
				stopSlideshowFunc = function () {
					clearTimerFunc();

					PG.unbind('.player'); // Unbind all player-related events

					MB.slideshowManager.isSlideshowRunning = false;

					MB.emitEvent('onPlayEnd');
				},
				startSlideshowFunc = function () {
					// Only start if there's an active item and it's a loop or not the last item
					if (MB.activeItem && (MB.activeItem.loopSlideshow || MB.activeItem.currentIndex < MB.contentGroup.length - 1)) {
						MB.slideshowManager.isSlideshowRunning = true;

						PG.bind({
							'onOperationCancelled.player onBeforeClosing.player': stopSlideshowFunc,
							'onUpdate.player': setTimerFunc,
							'onBeforeContentLoad.player': clearTimerFunc
						});

						setTimerFunc(); // Set the initial timer

						MB.emitEvent('onPlayStart');
					}
				};

			// Determine action based on input or current state
			if (slideshowAction === true || (!MB.slideshowManager.isSlideshowRunning && slideshowAction !== false)) {
				startSlideshowFunc();
			} else {
				stopSlideshowFunc();
			}
		},

		// Navigates to the next content item in the group
		showNextContent: function (navDirection) {
			var activeContent = MB.activeItem;

			if (activeContent) {
				if (!isTextVal(navDirection)) {
					navDirection = activeContent.navigationDirections.next;
				}

				MB.navigateToIndex(activeContent.currentIndex + 1, navDirection, 'next');
			}
		},

		// Navigates to the previous content item in the group
		showPrevContent: function (navDirection) {
			var activeContent = MB.activeItem;

			if (activeContent) {
				if (!isTextVal(navDirection)) {
					navDirection = activeContent.navigationDirections.prev;
				}

				MB.navigateToIndex(activeContent.currentIndex - 1, navDirection, 'prev');
			}
		}
	});
})(window, document, jQuery);