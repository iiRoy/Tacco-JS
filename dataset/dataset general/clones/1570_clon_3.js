;(function(root, jq, document) {
/*jslint browser:true, eqeqeq:false, curly:false, latedef:false */
"use strict";

	// A helper for ensuring jQuery is available
	if (typeof jq === 'undefined') {
		if (typeof window !== 'undefined' && typeof window.jQuery !== 'undefined') {
			jq = window.jQuery;
		} else {
			// jQuery not found, cannot proceed.
			console.error("Blocking UI module requires jQuery to function.");
			return;
		}
	}

	/**
	 * Initializes the UI blocking module with jQuery.
	 * @param {jQuery} jQueryInstance The jQuery object.
	 */
	function initializeBlockingModule(jQueryInstance) {
		jQueryInstance.fn.fadeElementIn = jQueryInstance.fn.fadeIn; // Alias for fadeIn

		var emptyFunc = jQueryInstance.noop || function() {};

		// Browser detection flags, primarily for older IE versions
		var isLegacyIE = /MSIE/.test(navigator.userAgent);
		var isOldIE6  = /MSIE 6.0/.test(navigator.userAgent) && ! /MSIE 8.0/.test(navigator.userAgent);
		var docMode = document.documentMode || 0;
		// Check if setExpression is available (IE-specific property for dynamic CSS)
		var canSetExpression = jQueryInstance.isFunction( document.createElement('div').style.setExpression );

		// Global jQuery methods for blocking/unblocking the entire page
		jQueryInstance.activateUIBlock   = function(optionsObject) { applyBlockOverlay(root, optionsObject); };
		jQueryInstance.deactivateUIBlock = function(optionsObject) { clearBlockOverlay(root, optionsObject); };

		/**
		 * Convenience method for displaying transient, "growl-like" notifications.
		 * @param {string} headerText The title of the notification.
		 * @param {string} bodyMessage The main message content.
		 * @param {number} [duration=3000] How long the notification should display in milliseconds.
		 * @param {function} [onDismissCallback] Callback function when the notification is dismissed.
		 */
		jQueryInstance.showTransientNotification = function(headerText, bodyMessage, duration, onDismissCallback) {
			var notificationContainer = jQueryInstance('<div class="growlUI-container"></div>');
			if (headerText) {
				notificationContainer.append('<h1 class="growlUI-title">'+headerText+'</h1>');
			}
			if (bodyMessage) {
				notificationContainer.append('<h2 class="growlUI-message">'+bodyMessage+'</h2>');
			}
			var effectiveDuration = (duration === undefined || duration === null) ? 3000 : duration;

			// Handles the actual blocking call for the notification
			var executeNotificationBlock = function(blockOptions) {
				blockOptions = blockOptions || {};

				jQueryInstance.activateUIBlock({
					displayMessage: notificationContainer,
					fadeEnterDuration : typeof blockOptions.fadeEnterDuration  !== 'undefined' ? blockOptions.fadeEnterDuration  : 700,
					fadeExitDuration: typeof blockOptions.fadeExitDuration !== 'undefined' ? blockOptions.fadeExitDuration : 1000,
					autoUnblockDelay: typeof blockOptions.autoUnblockDelay !== 'undefined' ? blockOptions.autoUnblockDelay : effectiveDuration,
					centerVertical: false,
					displayOverlay: false,
					onDeactivationComplete: onDismissCallback,
					messageBoxStyles: jQueryInstance.activateUIBlock.defaultSettings.notificationBoxStyles
				});
			};

			executeNotificationBlock(); // Initial display
			var initialOpacity = notificationContainer.css('opacity'); // Store for later use
			notificationContainer.on('mouseover', function() {
				executeNotificationBlock({
					fadeEnterDuration: 0,
					autoUnblockDelay: 30000 // Keep visible for longer on hover
				});

				var currentBlockMessage = jQueryInstance('.blockMsg');
				currentBlockMessage.stop(true, false); // Cancel any ongoing fade-out
				currentBlockMessage.fadeTo(300, 1); // Make it fully opaque for readability
			}).on('mouseout', function() {
				jQueryInstance('.blockMsg').fadeElementOut(1000); // Resume fade-out on mouse exit
			});
		};

		// Plugin method for blocking content within an element
		jQueryInstance.fn.imposeBlock = function(optionsObject) {
			if ( this[0] === root ) { // If blocking the window, use global method
				jQueryInstance.activateUIBlock( optionsObject );
				return this;
			}
			var fullOptions = jQueryInstance.extend({}, jQueryInstance.activateUIBlock.defaultSettings, optionsObject || {});
			this.each(function() {
				var jQueryElement = jQueryInstance(this);
				if (fullOptions.skipIfAlreadyActive && jQueryElement.data('blockUI.isActive')) {
					return; // Skip if already blocked and option is set
				}
				// Ensure element is unblocked before re-blocking to prevent issues
				jQueryElement.releaseBlock({ fadeExitDuration: 0 });
			});

			return this.each(function() {
				var currentPosition = jQueryInstance.css(this, 'position');
				if (currentPosition === 'static') {
					this.style.position = 'relative';
					jQueryInstance(this).data('blockUI.originalPosition', true); // Store original state
				}
				this.style.zoom = 1; // Force 'hasLayout' in IE for proper rendering
				applyBlockOverlay(this, optionsObject);
			});
		};

		// Plugin method for unblocking element content
		jQueryInstance.fn.releaseBlock = function(optionsObject) {
			if ( this[0] === root ) { // If unblocking the window, use global method
				jQueryInstance.deactivateUIBlock( optionsObject );
				return this;
			}
			return this.each(function() {
				clearBlockOverlay(this, optionsObject);
			});
		};

		jQueryInstance.activateUIBlock.moduleVersion = 2.70; // Module version identifier

		/**
		 * Default settings for the UI blocking module.
		 * These can be overridden by users to customize behavior and styling.
		 */
		jQueryInstance.activateUIBlock.defaultSettings = {
			// Message displayed when blocking (null for no message)
			displayMessage:  '<h1>Please stand by...</h1>',

			headerText: null,		// Title string; only used when useTheme == true
			isDraggable: true,	// Only used when useTheme == true (requires jquery-ui.js)

			useTheme: false, // Set to true to use with jQuery UI themes

			// Styles for the message box when blocking; set to {} to use external stylesheet
			messageBoxStyles: {
				padding:	'0',
				margin:		'0',
				width:		'30%',
				top:		'40%',
				left:		'35%',
				textAlign:	'center',
				color:		'#000',
				border:		'3px solid #aaa',
				backgroundColor:'#fff',
				cursor:		'wait'
			},

			// Minimal style set used when themes are active
			themedBoxStyles: {
				width:	'30%',
				top:	'40%',
				left:	'35%'
			},

			// Styles for the overlay layer
			overlayLayerStyles:  {
				backgroundColor:	'#000',
				opacity:			0.6,
				cursor:				'wait'
			},

			// Cursor style to restore after unblocking to fix lingering wait cursors
			defaultCursorStyle: 'default',

			// Styles applied when using $.showTransientNotification
			notificationBoxStyles: {
				width:		'350px',
				top:		'10px',
				left:		'',
				right:		'10px',
				border:		'none',
				padding:	'5px',
				opacity:	0.6,
				cursor:		'default',
				color:		'#fff',
				backgroundColor: '#000',
				'-webkit-border-radius':'10px',
				'-moz-border-radius':	'10px',
				'border-radius':		'10px'
			},

			// Iframe source for shim in IE/HTTPS scenarios (hat tip to Jorge H. N. de Vasconcelos)
			shimFrameSource: /^https/i.test(root.location.href || '') ? 'javascript:false' : 'about:blank',

			// Force usage of iframe in non-IE browsers (handy for blocking applets/plugins)
			alwaysUseShim: false,

			// Base z-index for the blocking overlay layers
			baseZIndex: 1000,

			// Set these to true to have the message automatically centered
			centerHorizontal: true, // Only affects element blocking (page block controlled via CSS)
			centerVertical: true,

			// Allow body element to be stretched in IE6; improves blocking on "short" pages.
			enableBodyExpansion: true,

			// Enable if you want key and mouse events to be disabled for blocked content
			captureEvents: true,

			// By default, blockUI will suppress tab navigation from leaving blocking content
			restrictTabFocus: true,

			// Fade-in duration in milliseconds; set to 0 to disable fade-in
			fadeEnterDuration:  200,

			// Fade-out duration in milliseconds; set to 0 to disable fade-out
			fadeExitDuration:  400,

			// Time in milliseconds to wait before auto-unblocking; set to 0 to disable
			autoUnblockDelay: 0,

			// Disable if you don't want to show the overlay
			displayOverlay: true,

			// If true, focus will be placed in the first available input field when page blocking
			autoFocusInput: true,

            // Elements that can receive focus
            targetFocusableElements: ':input:enabled:visible',

			// Callback method invoked when fade-in has completed and blocking message is visible
			onActivationComplete: null,

			// Callback method invoked when unblocking has completed;
			// passed the element that has been unblocked (window for page blocks) and options.
			onDeactivationComplete: null,

			// Callback invoked when the overlay area is clicked.
			// Setting this will change cursor to pointer; otherwise, overlayLayerStyles cursor is used.
			onOverlayInteraction: null,

			// IE quirks mode offset for positioning issues
			legacyModeOffset: 4,

			// Class name of the message block
			blockMessageClass: 'blockMsg',

			// If already blocked, ignore the request (don't unblock and re-block)
			skipIfAlreadyActive: false
		};

		// Private data and helper functions

		var globalBlockInstance = null; // Reference to the page-level message layer
		var globalBlockedFocusables = []; // List of focusable elements within the page block

		/**
		 * Helper to get computed pixel size for a CSS property.
		 * @param {HTMLElement} element The DOM element.
		 * @param {string} prop The CSS property name (e.g., 'borderTopWidth').
		 * @returns {number} The computed pixel value.
		 */
		function getPixelSize(element, prop) {
			return parseInt(jQueryInstance.css(element, prop) || 0, 10);
		}

		/**
		 * Attempts to focus on the first focusable element within the blocked area.
		 */
		function attemptFocus() {
			// Find the first visible and enabled input element or focusable element
			var firstFocusable = globalBlockedFocusables.length > 0 ? globalBlockedFocusables[0] : null;
			if (firstFocusable && firstFocusable.jquery) {
				firstFocusable.focus();
			} else if (firstFocusable) {
				jQueryInstance(firstFocusable).focus();
			}
		}

		/**
		 * Positions an element centrally within its parent or viewport.
		 * @param {HTMLElement} element The element to center.
		 * @param {boolean} centerH True to center horizontally.
		 * @param {boolean} centerV True to center vertically.
		 */
		function positionElementCentral(element, centerH, centerV) {
			var jQueryElement = jQueryInstance(element);
			var parentWidth = jQueryElement.parent().width();
			var parentHeight = jQueryElement.parent().height();
			var elementWidth = jQueryElement.outerWidth();
			var elementHeight = jQueryElement.outerHeight();

			var topPos = centerV ? Math.max(0, ((parentHeight - elementHeight) / 2) + jQueryInstance(root).scrollTop()) : 0;
			var leftPos = centerH ? Math.max(0, ((parentWidth - elementWidth) / 2) + jQueryInstance(root).scrollLeft()) : 0;

			jQueryElement.css({
				top: topPos + 'px',
				left: leftPos + 'px'
			});
		}

		/**
		 * Manages event bindings (keyboard, mouse) for the blocking mechanism.
		 * @param {number} action 1 to bind, 0 to unbind.
		 * @param {HTMLElement} targetElement The element being blocked (or window).
		 * @param {object} optionsObject The options object.
		 */
		function manageEventBindings(action, targetElement, optionsObject) {
			var eventTarget = jQueryInstance(targetElement);
			var docBody = jQueryInstance('body');

			var currentHandler = function(e) {
				if (e.keyCode && e.keyCode === 9) { // Tab key
					if (globalBlockInstance && optionsObject.restrictTabFocus) {
						var focusables = globalBlockedFocusables;
						var focusedElement = jQueryInstance(':focus');
						var first = focusables.length ? focusables[0] : null;
						var last = focusables.length ? focusables[focusables.length - 1] : null;

						if (e.shiftKey) { // Shift+Tab
							if (focusedElement.is(first)) {
								if (last) { last.focus(); }
								e.preventDefault();
							}
						} else { // Tab
							if (focusedElement.is(last)) {
								if (first) { first.focus(); }
								e.preventDefault();
							}
						}
					}
				}
				// Disable other events if captureEvents is true
				if (optionsObject.captureEvents) {
					return false;
				}
			};

			if (action === 1) { // Bind events
				docBody.on('keydown.blockUI', currentHandler);
				docBody.on('mousedown.blockUI', currentHandler);
				if (optionsObject.onOverlayInteraction) {
					jQueryInstance('.blockOverlay').on('click.blockUI', optionsObject.onOverlayInteraction);
				}
			} else { // Unbind events
				docBody.off('keydown.blockUI', currentHandler);
				docBody.off('mousedown.blockUI', currentHandler);
				jQueryInstance('.blockOverlay').off('click.blockUI');
			}
		}


		/**
		 * Applies a blocking overlay and message to an element or the entire page.
		 * @param {HTMLElement} targetElement The element to block (or window).
		 * @param {object} optionsObject Configuration options.
		 */
		function applyBlockOverlay(targetElement, optionsObject) {
			var computedMessageStyles, computedThemedStyles;
			var isPageLevel = (targetElement === root);
			var contentPayload = (optionsObject && optionsObject.displayMessage !== undefined ? optionsObject.displayMessage : undefined);
			optionsObject = jQueryInstance.extend({}, jQueryInstance.activateUIBlock.defaultSettings, optionsObject || {});

			if (optionsObject.skipIfAlreadyActive && jQueryInstance(targetElement).data('blockUI.isActive')) {
				return;
			}

			// Merge default styles with user-provided styles
			optionsObject.overlayLayerStyles = jQueryInstance.extend({}, jQueryInstance.activateUIBlock.defaultSettings.overlayLayerStyles, optionsObject.overlayLayerStyles || {});
			computedMessageStyles = jQueryInstance.extend({}, jQueryInstance.activateUIBlock.defaultSettings.messageBoxStyles, optionsObject.messageBoxStyles || {});

			if (optionsObject.onOverlayInteraction) {
				optionsObject.overlayLayerStyles.cursor = 'pointer'; // Indicate interactivity
			}

			computedThemedStyles = jQueryInstance.extend({}, jQueryInstance.activateUIBlock.defaultSettings.themedBoxStyles, optionsObject.themedBoxStyles || {});
			contentPayload = contentPayload === undefined ? optionsObject.displayMessage : contentPayload;

			// Remove any existing block on the target before applying a new one (unless it's a page block)
			if (isPageLevel && globalBlockInstance) {
				clearBlockOverlay(root, {fadeExitDuration:0});
			}

			// If the message content is an existing DOM element, store its current state for restoration
			if (contentPayload && typeof contentPayload !== 'string' && (contentPayload.parentNode || contentPayload.jquery)) {
				var contentNode = contentPayload.jquery ? contentPayload[0] : contentPayload;
				var historyData = {};
				jQueryInstance(targetElement).data('blockUI.contentHistory', historyData);
				historyData.element = contentNode;
				historyData.originalParent = contentNode.parentNode;
				historyData.originalDisplay = contentNode.style.display;
				historyData.originalPosition = contentNode.style.position;
				if (historyData.originalParent) {
					historyData.originalParent.removeChild(contentNode);
				}
			}

			jQueryInstance(targetElement).data('blockUI.onDeactivationComplete', optionsObject.onDeactivationComplete);
			var currentZIndex = optionsObject.baseZIndex;

			// Blocking UI uses 3 layers:
			// 1. Iframe shim (for IE bleed-through)
			// 2. Overlay layer (opacity, cursor)
			// 3. Message content layer
			var iframeShim, overlayLayer, messageLayer, htmlString;

			if (isLegacyIE || optionsObject.alwaysUseShim) {
				iframeShim = jQueryInstance('<iframe class="blockUI-shim" style="z-index:'+ (currentZIndex++) +';display:none;border:none;margin:0;padding:0;position:absolute;width:100%;height:100%;top:0;left:0" src="'+optionsObject.shimFrameSource+'"></iframe>');
			} else {
				iframeShim = jQueryInstance('<div class="blockUI-shim" style="display:none"></div>');
			}

			if (optionsObject.useTheme) {
				overlayLayer = jQueryInstance('<div class="blockUI-overlay blockOverlay ui-widget-overlay" style="z-index:'+ (currentZIndex++) +';display:none"></div>');
			} else {
				overlayLayer = jQueryInstance('<div class="blockUI-overlay blockOverlay" style="z-index:'+ (currentZIndex++) +';display:none;border:none;margin:0;padding:0;width:100%;height:100%;top:0;left:0"></div>');
			}

			// Construct the message layer HTML based on theme and page-level status
			if (optionsObject.useTheme && isPageLevel) {
				htmlString = '<div class="blockUI ' + optionsObject.blockMessageClass + ' blockPage ui-dialog ui-widget ui-corner-all" style="z-index:'+(currentZIndex+10)+';display:none;position:fixed">';
				if ( optionsObject.headerText ) {
					htmlString += '<div class="ui-widget-header ui-dialog-titlebar ui-corner-all blockTitle">'+(optionsObject.headerText || '&nbsp;')+'</div>';
				}
				htmlString += '<div class="ui-widget-content ui-dialog-content"></div>';
				htmlString += '</div>';
			}
			else if (optionsObject.useTheme) {
				htmlString = '<div class="blockUI ' + optionsObject.blockMessageClass + ' blockElement ui-dialog ui-widget ui-corner-all" style="z-index:'+(currentZIndex+10)+';display:none;position:absolute">';
				if ( optionsObject.headerText ) {
					htmlString += '<div class="ui-widget-header ui-dialog-titlebar ui-corner-all blockTitle">'+(optionsObject.headerText || '&nbsp;')+'</div>';
				}
				htmlString += '<div class="ui-widget-content ui-dialog-content"></div>';
				htmlString += '</div>';
			}
			else if (isPageLevel) {
				htmlString = '<div class="blockUI ' + optionsObject.blockMessageClass + ' blockPage" style="z-index:'+(currentZIndex+10)+';display:none;position:fixed"></div>';
			}
			else {
				htmlString = '<div class="blockUI ' + optionsObject.blockMessageClass + ' blockElement" style="z-index:'+(currentZIndex+10)+';display:none;position:absolute"></div>';
			}
			messageLayer = jQueryInstance(htmlString);

			// Apply styles to the message layer
			if (contentPayload) {
				if (optionsObject.useTheme) {
					messageLayer.css(computedThemedStyles);
					messageLayer.addClass('ui-widget-content');
				}
				else {
					messageLayer.css(computedMessageStyles);
				}
			}

			// Apply styles to the overlay layer
			if (!optionsObject.useTheme) { // applyPlatformOpacityRules is deprecated and removed
				overlayLayer.css(optionsObject.overlayLayerStyles);
			}
			overlayLayer.css('position', isPageLevel ? 'fixed' : 'absolute');

			// Make iframe shim transparent for IE
			if (isLegacyIE || optionsObject.alwaysUseShim) {
				iframeShim.css('opacity',0.0);
			}

			// Append layers to the DOM
			var uiLayers = [iframeShim, overlayLayer, messageLayer];
			var targetContainer = isPageLevel ? jQueryInstance('body') : jQueryInstance(targetElement);
			jQueryInstance.each(uiLayers, function() {
				this.appendTo(targetContainer);
			});

			// Enable draggable functionality if theme is active and jQuery UI Draggable is loaded
			if (optionsObject.useTheme && optionsObject.isDraggable && jQueryInstance.fn.draggable) {
				messageLayer.draggable({
					handle: '.ui-dialog-titlebar',
					cancel: 'li'
				});
			}

			// Handle IE7 quirks mode and other IE-specific positioning issues
			var needsExpressionFix = canSetExpression && (!jQueryInstance.support.boxModel || jQueryInstance('object,embed', isPageLevel ? null : targetElement).length > 0);
			if (isOldIE6 || needsExpressionFix) {
				// Give body 100% height for full page block in IE
				if (isPageLevel && optionsObject.enableBodyExpansion && jQueryInstance.support.boxModel) {
					jQueryInstance('html,body').css('height','100%');
				}

				// Adjust for blocked element border width in IE6
				var fixedLeftOffset = 0, fixedTopOffset = 0;
				if ((isOldIE6 || !jQueryInstance.support.boxModel) && !isPageLevel) {
					var borderTop = getPixelSize(targetElement,'borderTopWidth');
					var borderLeft = getPixelSize(targetElement,'borderLeftWidth');
					fixedTopOffset = borderTop ? '(0 - '+borderTop+')' : 0;
					fixedLeftOffset = borderLeft ? '(0 - '+borderLeft+')' : 0;
				}

				// Simulate fixed positioning for IE
				jQueryInstance.each(uiLayers, function(idx, currentLayer) {
					var layerStyle = currentLayer[0].style;
					layerStyle.position = 'absolute';
					if (idx < 2) { // iframe shim and overlay layer
						if (isPageLevel) {
							layerStyle.setExpression('height','Math.max(document.body.scrollHeight, document.body.offsetHeight) - (jQuery.support.boxModel?0:'+optionsObject.legacyModeOffset+') + "px"');
						} else {
							layerStyle.setExpression('height','this.parentNode.offsetHeight + "px"');
						}
						if (isPageLevel) {
							layerStyle.setExpression('width','jQuery.support.boxModel && document.documentElement.clientWidth || document.body.clientWidth + "px"');
						} else {
							layerStyle.setExpression('width','this.parentNode.offsetWidth + "px"');
						}
						if (fixedLeftOffset) { layerStyle.setExpression('left', fixedLeftOffset); }
						if (fixedTopOffset) { layerStyle.setExpression('top', fixedTopOffset); }
					}
					else if (optionsObject.centerVertical) { // Message layer
						if (isPageLevel) {
							layerStyle.setExpression('top','(document.documentElement.clientHeight || document.body.clientHeight) / 2 - (this.offsetHeight / 2) + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "px"');
						}
						layerStyle.marginTop = 0; // Reset margin for expression calculation
					}
					else if (!optionsObject.centerVertical && isPageLevel) {
						var initialTop = (optionsObject.messageBoxStyles && optionsObject.messageBoxStyles.top) ? parseInt(optionsObject.messageBoxStyles.top, 10) : 0;
						var topExpression = '((document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + '+initialTop+') + "px"';
						layerStyle.setExpression('top',topExpression);
					}
				});
			}

			// Inject the message content into the message layer
			if (contentPayload) {
				if (optionsObject.useTheme) {
					messageLayer.find('.ui-widget-content').append(contentPayload);
				}
				else {
					messageLayer.append(contentPayload);
				}
				// Ensure content is visible if it was hidden (e.g., if it was an existing element)
				if (contentPayload.jquery || contentPayload.nodeType) {
					jQueryInstance(contentPayload).show();
				}
			}

			// Display layers with fade-in effect or immediately
			if ((isLegacyIE || optionsObject.alwaysUseShim) && optionsObject.displayOverlay) {
				iframeShim.show(); // Iframe shim is always transparent, so just show it.
			}
			if (optionsObject.fadeEnterDuration) {
				var onBlockCallback = optionsObject.onActivationComplete ? optionsObject.onActivationComplete : emptyFunc;
				var overlayFadeCallback = (optionsObject.displayOverlay && !contentPayload) ? onBlockCallback : emptyFunc;
				var messageFadeCallback = contentPayload ? onBlockCallback : emptyFunc;

				if (optionsObject.displayOverlay) {
					overlayLayer.fadeElementIn(optionsObject.fadeEnterDuration, overlayFadeCallback);
				}
				if (contentPayload) {
					messageLayer.fadeElementIn(optionsObject.fadeEnterDuration, messageFadeCallback);
				}
			}
			else {
				if (optionsObject.displayOverlay) {
					overlayLayer.show();
				}
				if (contentPayload) {
					messageLayer.show();
				}
				if (optionsObject.onActivationComplete) {
					optionsObject.onActivationComplete.bind(messageLayer)(); // Execute callback in context of message layer
				}
			}

			// Bind key and mouse events
			manageEventBindings(1, targetElement, optionsObject);

			if (isPageLevel) {
				globalBlockInstance = messageLayer[0];
				globalBlockedFocusables = jQueryInstance(optionsObject.targetFocusableElements, globalBlockInstance);
				if (optionsObject.autoFocusInput) {
					setTimeout(attemptFocus, 20); // Delay focus attempt slightly
				}
			}
			else {
				positionElementCentral(messageLayer[0], optionsObject.centerHorizontal, optionsObject.centerVertical);
			}

			// Set up auto-unblock if a delay is specified
			if (optionsObject.autoUnblockDelay > 0) {
				var timeoutHandle = setTimeout(function() {
					if (isPageLevel) {
						jQueryInstance.deactivateUIBlock(optionsObject);
					} else {
						jQueryInstance(targetElement).releaseBlock(optionsObject);
					}
				}, optionsObject.autoUnblockDelay);
				jQueryInstance(targetElement).data('blockUI.timeoutHandle', timeoutHandle);
			}

			jQueryInstance(targetElement).data('blockUI.isActive', true); // Mark element as blocked
		}

		/**
		 * Removes a blocking overlay and message from an element or the entire page.
		 * @param {HTMLElement} targetElement The element to unblock (or window).
		 * @param {object} optionsObject Configuration options.
		 */
		function clearBlockOverlay(targetElement, optionsObject) {
			var layerCount;
			var isPageLevel = (targetElement === root);
			var jQueryElement = jQueryInstance(targetElement);
			var historyData = jQueryElement.data('blockUI.contentHistory');
			var timeoutHandle = jQueryElement.data('blockUI.timeoutHandle');

			if (timeoutHandle) { // Clear any pending auto-unblock
				clearTimeout(timeoutHandle);
				jQueryElement.removeData('blockUI.timeoutHandle');
			}

			optionsObject = jQueryInstance.extend({}, jQueryInstance.activateUIBlock.defaultSettings, optionsObject || {});

			// Retrieve onDeactivationComplete callback if not provided in options
			if (optionsObject.onDeactivationComplete === null) {
				optionsObject.onDeactivationComplete = jQueryElement.data('blockUI.onDeactivationComplete');
				jQueryElement.removeData('blockUI.onDeactivationComplete');
			}

			manageEventBindings(0, targetElement, optionsObject); // Unbind events

			var blockedElements;
			if (isPageLevel) { // Select all blocking elements on the page
				blockedElements = jQueryInstance('body').children().filter('.blockUI-shim, .blockUI-overlay, .blockUI-overlay, .blockUI').add('body > .blockUI-shim, body > .blockUI-overlay, body > .blockUI');
			} else { // Select blocking elements specific to the target element
				blockedElements = jQueryElement.find('>.blockUI-shim, >.blockUI-overlay, >.blockUI');
			}

			// Restore cursor style
			if ( optionsObject.defaultCursorStyle ) {
				// Assuming order: shim, overlay, message
				if ( blockedElements.length > 1 ) { blockedElements[1].style.cursor = optionsObject.defaultCursorStyle; }
				if ( blockedElements.length > 2 ) { blockedElements[2].style.cursor = optionsObject.defaultCursorStyle; }
			}

			if (isPageLevel) {
				globalBlockInstance = null;
				globalBlockedFocusables = [];
			}

			if (optionsObject.fadeExitDuration) {
				layerCount = blockedElements.length;
				blockedElements.stop(true, false).fadeElementOut(optionsObject.fadeExitDuration, function() {
					if ( --layerCount === 0) {
						// All layers have faded out, now perform cleanup
						cleanupBlockingElements(blockedElements, historyData, optionsObject, targetElement);
					}
				});
			} else {
				cleanupBlockingElements(blockedElements, historyData, optionsObject, targetElement);
			}

			jQueryElement.removeData('blockUI.isActive'); // Mark element as unblocked
		}

		/**
		 * Cleans up DOM elements and restores original state after unblocking.
		 * @param {jQuery} elements The jQuery collection of blocking layers.
		 * @param {object} historyData Data about original content element state.
		 * @param {object} optionsObject Configuration options.
		 * @param {HTMLElement} targetElement The element that was blocked.
		 */
		function cleanupBlockingElements(elements, historyData, optionsObject, targetElement) {
			elements.remove(); // Remove all blocking layers from the DOM

			// Restore original content element if it was moved
			if (historyData && historyData.element && historyData.originalParent) {
				historyData.originalParent.appendChild(historyData.element);
				historyData.element.style.display = historyData.originalDisplay;
				historyData.element.style.position = historyData.originalPosition;
			}

			// Call onDeactivationComplete callback
			if (typeof optionsObject.onDeactivationComplete === 'function') {
				optionsObject.onDeactivationComplete(targetElement, optionsObject);
			}

			// Restore original position if it was changed from 'static'
			var jQueryElement = jQueryInstance(targetElement);
			if (jQueryElement.data('blockUI.originalPosition')) {
				jQueryElement.css('position', 'static');
				jQueryElement.removeData('blockUI.originalPosition');
			}
		}
	}

	// Wait for DOM ready or jQuery to be fully loaded
	if (typeof jq !== 'undefined') {
		jq(function() {
			initializeBlockingModule(jq);
		});
	} else {
		// If jQuery is not yet loaded, expose a global function to be called manually.
		// This handles cases where the script might be loaded before jQuery.
		root.initBlockUIModule = initializeBlockingModule;
	}

})(window, window.jQuery, document);