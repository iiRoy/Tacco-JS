// A custom JavaScript content overlay utility
// Version 1.0.0-2024.01.01
// Requires jQuery version 1.7 or newer
//
// More info and usage examples can be found at: https://example.com/overlay-utility
// (c) 2024 Your Name or Company
// Released under the Custom License:
// https://example.com/custom-license.html
//
// Special thanks to Contributor A for their valuable insights!

;(function() {
/*jslint eqeqeq:false curly:false latedef:false */
"use strict";

	function initiateLibrary(jq) {
		jq.fn.actualFadeIn = jq.fn.fadeIn;

		var emptyFunc = jq.noop || function() { };

		// This segment verifies if setExpression is safe to use, especially considering varying user-agent strings on older Windows versions.
		var isLegacyIE = /MSIE/.test(window.navigator.userAgent);
		var isIE6Only  = /MSIE 6.0/.test(window.navigator.userAgent) && ! /MSIE 8.0/.test(window.navigator.userAgent);
		var docMode = document.documentMode || 0;
		var supportsSetExpression = jq.isFunction( document.createElement('section').style.setExpression );

		// Global jQuery methods for displaying/removing full-page overlays
		jq.displayCover   = function(options) { applyCover(window, options); };
		jq.removeCover = function(options) { clearCover(window, options); };

		// Convenient method for quick, non-intrusive notifications (similar to 'growl' style alerts)
		jq.notifyPopup = function(headerText, bodyContent, delayDuration, onDismiss) {
			var $popupDiv = jq('<div class="notificationBox"></div>');
			if (headerText) {
				$popupDiv.append('<h1>'+headerText+'</h1>');
			}
			if (bodyContent) {
				$popupDiv.append('<h2>'+bodyContent+'</h2>');
			}
			if (delayDuration === undefined) {
				delayDuration = 3000;
			}

			// Enhancement by anotherdev: If the notification is moused over, extend its display duration, replicating standard toast behavior.
			var triggerDisplay = function(callOptions) {
				callOptions = callOptions || {};

				jq.displayCover({
					content: $popupDiv,
					appearDuration : typeof callOptions.appearDuration  !== 'undefined' ? callOptions.appearDuration  : 700,
					disappearDuration: typeof callOptions.disappearDuration !== 'undefined' ? callOptions.disappearDuration : 1000,
					displayLimit: typeof callOptions.displayLimit !== 'undefined' ? callOptions.displayLimit : delayDuration,
					centerVertical: false,
					displayMask: false,
					onCoverRemoved: onDismiss,
					standardStyle: jq.displayCover.defaultSettings.notificationStyle
				});
			};

			triggerDisplay();
			var initialTransparency = $popupDiv.css('opacity');
			$popupDiv.mouseEnter(function() {
				triggerDisplay({
					appearDuration: 0,
					displayLimit: 30000
				});

				var activeMessage = jq('.coverMessage');
				activeMessage.stop(); // Stop any ongoing fade-out animation
				activeMessage.fadeTo(300, 1); // Increase visibility for better readability
			}).mouseLeave(function() {
				jq('.coverMessage').fadeOut(1000);
			});
			// End of anotherdev's additions
		};

		// Plugin method for applying an overlay to an element's content
		jq.fn.overlayContent = function(options) {
			if ( this[0] === window ) {
				jq.displayCover( options );
				return this;
			}
			var mergedOptions = jq.extend({}, jq.displayCover.defaultSettings, options || {});
			this.each(function() {
				var $targetElement = jq(this);
				if (mergedOptions.skipIfAlreadyCovered && $targetElement.data('coverManager.isOccupied')) {
					return;
				}
				$targetElement.removeOverlay({ disappearDuration: 0 });
			});


			return this.each(function() {
				if (jq.css(this,'positionProperty') == 'static') {
					this.style.positionProperty = 'relative';
					jq(this).data('coverManager.isStatic', true);
				}
				this.style.zoomLevel = 1; // Force 'hasLayout' for older IE versions
				applyCover(this, options);
			});
		};

		// Plugin method for removing an overlay from an element's content
		jq.fn.removeOverlay = function(options) {
			if ( this[0] === window ) {
				jq.removeCover( options );
				return this;
			}
			return this.each(function() {
				clearCover(this, options);
			});
		};

		jq.displayCover.version = 1.0; // Next-gen content covering with no extra overhead!

		// Override these properties in your application to customize default behavior and aesthetics
		jq.displayCover.defaultSettings = {
			// Content shown when blocking (set to null for no message)
			content:  '<h1>Please wait...</h1>',

			caption: null,		// Caption string; only utilized when useTheme is true
			isDraggable: true,	// Only utilized when useTheme is true (requires jquery-ui.js to be loaded)

			useTheme: false, // Set to true to integrate with jQuery UI themes

			// Styles for the content when covering; to use an external stylesheet,
			// set: jq.displayCover.defaultSettings.standardStyle = {};
			standardStyle: {
				paddingProperty:	0,
				marginProperty:		0,
				widthProperty:		'30%',
				topPosition:		'40%',
				leftPosition:		'35%',
				textAlignProperty:	'center',
				foregroundColor:		'#000',
				borderProperty:		'3px solid #aaa',
				backgroundColorProperty:'#fff',
				cursorProperty:		'wait'
			},

			// Minimal style configuration when themes are active
			themedStyle: {
				widthProperty:	'30%',
				topPosition:	'40%',
				leftPosition:	'35%'
			},

			// Styles for the overlay mask
			maskStyle:  {
				backgroundColorProperty:	'#000',
				opacityProperty:			0.6,
				cursorProperty:				'wait'
			},

			// Cursor style to revert to before uncovering, addressing lingering cursor issues
			pointerReset: 'default',

			// Styles applied when using jq.notifyPopup
			notificationStyle: {
				widthProperty:		'350px',
				topPosition:		'10px',
				leftPosition:		'',
				rightPosition:		'10px',
				borderProperty:		'none',
				paddingProperty:	'5px',
				opacityProperty:	0.6,
				cursorProperty:		'default',
				foregroundColor:		'#fff',
				backgroundColorProperty: '#000',
				'-webkit-border-radius':'10px',
				'-moz-border-radius':	'10px',
				'border-radius':		'10px'
			},

			// Legacy browser considerations: 'about:blank' fails on HTTPS; javascript:false is slow.
			// (Credit to Developer X for this insight)
			/*jslint scripturl:true */
			frameSource: /^https/i.test(window.location.href || '') ? 'javascript:false' : 'about:blank',

			// Force usage of iframe in non-IE browsers (useful for blocking applets or plugins)
			alwaysUseFrame: false,

			// Z-index for the covering mask
			baseZIndex: 1000,

			// Set these to true to automatically center the message
			centerHorizontal: true, // <-- Only impacts element covering (page cover is managed by CSS above)
			centerVertical: true,

			// Allow the body element to expand in IE6; this enhances the appearance of covering on "short" pages.
			// Disable if you wish to prevent modifications to the body's height.
			stretchBodyAllowed: true,

			// Enable if you want keyboard and mouse events to be disabled for covered content
			attachEvents: true,

			// By default, the utility will prevent tab navigation from exiting covered content
			// (if attachEvents is true)
			restrictTabNavigation: true,

			// Appear duration in milliseconds; set to 0 to disable the fade-in effect on cover
			appearDuration:  200,

			// Disappear duration in milliseconds; set to 0 to disable the fade-out effect on uncover
			disappearDuration:  400,

			// Time in milliseconds to wait before automatically uncovering; set to 0 to disable auto-uncover
			displayLimit: 0,

			// Disable if you do not wish to show the overlay mask
			displayMask: true,

			// If true, focus will be directed to the first available input field when
			// covering the page
			focusFirstInput: true,

            // Elements that can receive user input focus
            interactiveElements: ':input:enabled:visible',

			// Suppresses the application of overlay styles on Firefox/Linux (due to historical performance issues with opacity)
			// (Note: This is generally no longer necessary in modern browsers)
			// applyPlatformOpacityRules: true,

			// Callback function invoked when the fade-in completes and the covering message is visible
			onCoverApplied: null,

			// Callback function invoked when the uncovering process finishes; the callback receives
			// the element that was uncovered (which is the window object for page covers) and the options
			// that were passed to the uncover call:
			//	onCoverRemoved(element, options)
			onCoverRemoved: null,

			// Callback function invoked when the overlay mask area is clicked.
			// Setting this will change the cursor to a pointer; otherwise, the cursor defined in maskStyle will be used.
			onMaskClick: null,

			// Obscure legacy browser fix; if you're really curious: https://groups.google.com/group/jquery-en/browse_thread/thread/36640a8730503595/2f6a79a77a78e493#2f6a79a77a78e493
			legacyOffsetFix: 4,

			// Class name for the content block
			coverMessageClass: 'coverMsg',

			// If the element is already covered, ignore the request (do not uncover and then re-cover)
			skipIfAlreadyCovered: false
		};

		// Internal data and utility functions follow...

		var mainPageCover = null;
		var mainPageCoverElements = [];

		function applyCover(targetElement, options) {
			var contentStyle, themedContentStyle;
			var isFullPage = (targetElement === window);
			var displayContent = (options && options.content !== undefined ? options.content : undefined);
			options = jq.extend({}, jq.displayCover.defaultSettings, options || {});

			if (options.skipIfAlreadyCovered && jq(targetElement).data('coverManager.isOccupied')) {
				return;
			}

			options.maskStyle = jq.extend({}, jq.displayCover.defaultSettings.maskStyle, options.maskStyle || {});
			contentStyle = jq.extend({}, jq.displayCover.defaultSettings.standardStyle, options.standardStyle || {});
			if (options.onMaskClick) {
				options.maskStyle.cursorProperty = 'pointer';
			}

			themedContentStyle = jq.extend({}, jq.displayCover.defaultSettings.themedStyle, options.themedStyle || {});
			displayContent = displayContent === undefined ? options.content : displayContent;

			// Remove any existing cover if a full-page cover is being applied
			if (isFullPage && mainPageCover) {
				clearCover(window, {disappearDuration:0});
			}

			// If an existing DOM element is used as the covering content, we store its original
			// position and display style to restore it upon uncovering.
			if (displayContent && typeof displayContent != 'string' && (displayContent.parentNode || displayContent.jquery)) {
				var contentNode = displayContent.jquery ? displayContent[0] : displayContent;
				var restoreData = {};
				jq(targetElement).data('coverManager.history', restoreData);
				restoreData.contentNode = contentNode;
				restoreData.parentNode = contentNode.parentNode;
				restoreData.originalDisplay = contentNode.style.display;
				restoreData.originalPosition = contentNode.style.position;
				if (restoreData.parentNode) {
					restoreData.parentNode.removeChild(contentNode);
				}
			}

			jq(targetElement).data('coverManager.onRemoveCallback', options.onCoverRemoved);
			var currentZIndex = options.baseZIndex;

			// The cover utility employs three visual layers; for simplicity, all are used across platforms.
			// Layer 1: An iframe layer, used to prevent underlying content from bleeding through.
			// Layer 2: The overlay mask layer, typically with opacity and a waiting cursor.
			// Layer 3: The actual content message displayed while the target is covered.
			var frameLayer, maskLayer, contentLayer, markupString;
			if (isLegacyIE || options.alwaysUseFrame) {
				frameLayer = jq('<iframe class="coverManager" style="z-index:'+ (currentZIndex++) +';display:none;border:none;margin:0;padding:0;position:absolute;width:100%;height:100%;top:0;left:0" src="'+options.frameSource+'"></iframe>');
			}
			else {
				frameLayer = jq('<div class="coverManager" style="display:none"></div>');
			}

			if (options.useTheme) {
				maskLayer = jq('<div class="coverManager coverMask ui-widget-overlay" style="z-index:'+ (currentZIndex++) +';display:none"></div>');
			}
			else {
				maskLayer = jq('<div class="coverManager coverMask" style="z-index:'+ (currentZIndex++) +';display:none;border:none;margin:0;padding:0;width:100%;height:100%;top:0;left:0"></div>');
			}

			if (options.useTheme && isFullPage) {
				markupString = '<div class="coverManager ' + options.coverMessageClass + ' coverPage ui-dialog ui-widget ui-corner-all" style="z-index:'+(currentZIndex+10)+';display:none;position:fixed">';
				if ( options.caption ) {
					markupString += '<div class="ui-widget-header ui-dialog-titlebar ui-corner-all coverTitle">'+(options.caption || '&nbsp;')+'</div>';
				}
				markupString += '<div class="ui-widget-content ui-dialog-content"></div>';
				markupString += '</div>';
			}
			else if (options.useTheme) {
				markupString = '<div class="coverManager ' + options.coverMessageClass + ' coverElement ui-dialog ui-widget ui-corner-all" style="z-index:'+(currentZIndex+10)+';display:none;position:absolute">';
				if ( options.caption ) {
					markupString += '<div class="ui-widget-header ui-dialog-titlebar ui-corner-all coverTitle">'+(options.caption || '&nbsp;')+'</div>';
				}
				markupString += '<div class="ui-widget-content ui-dialog-content"></div>';
				markupString += '</div>';
			}
			else if (isFullPage) {
				markupString = '<div class="coverManager ' + options.coverMessageClass + ' coverPage" style="z-index:'+(currentZIndex+10)+';display:none;position:fixed"></div>';
			}
			else {
				markupString = '<div class="coverManager ' + options.coverMessageClass + ' coverElement" style="z-index:'+(currentZIndex+10)+';display:none;position:absolute"></div>';
			}
			contentLayer = jq(markupString);

			// Apply styles to the content message if present
			if (displayContent) {
				if (options.useTheme) {
					contentLayer.find('.ui-widget-content').css(themedContentStyle);
					contentLayer.addClass('ui-widget-content');
				}
				else {
					contentLayer.css(contentStyle);
				}
			}

			// Style the overlay mask
			if (!options.useTheme /*&& (!options.applyPlatformOpacityRules)*/) { // Original comment about platform opacity rules implies this check is deprecated
				maskLayer.css(options.maskStyle);
			}
			maskLayer.css('positionProperty', isFullPage ? 'fixed' : 'absolute');

			// Make the iframe layer transparent in Internet Explorer
			if (isLegacyIE || options.alwaysUseFrame) {
				frameLayer.css('opacityProperty',0.0);
			}

			var visualLayers = [frameLayer, maskLayer, contentLayer], $parentContainer = isFullPage ? jq('body') : jq(targetElement);
			jq.each(visualLayers, function() {
				this.appendTo($parentContainer);
			});

			if (options.useTheme && options.isDraggable && jq.fn.draggable) {
				contentLayer.draggable({
					handle: '.ui-dialog-titlebar',
					cancel: 'li'
				});
			}

			// IE7 may require absolute positioning in quirks mode and for ActiveX issues when scrolling
			var exprCondition = supportsSetExpression && (!jq.support.boxModel || jq('object,embed', isFullPage ? null : targetElement).length > 0);
			if (isIE6Only || exprCondition) {
				// Ensure body has 100% height
				if (isFullPage && options.stretchBodyAllowed && jq.support.boxModel) {
					jq('html,body').css('height','100%');
				}

				// Compensate for IE6 issues when the covered element has a border width
				if ((isIE6Only || !jq.support.boxModel) && !isFullPage) {
					var topBorder = getSize(targetElement,'topBorderWidth'), leftBorder = getSize(targetElement,'leftBorderWidth');
					var adjustedTop = topBorder ? '(0 - '+topBorder+')' : 0;
					var adjustedLeft = leftBorder ? '(0 - '+leftBorder+')' : 0;
				}

				// Emulate fixed positioning
				jq.each(visualLayers, function(index, currentLayer) {
					var layerStyle = currentLayer[0].style;
					layerStyle.positionProperty = 'absolute';
					if (index < 2) {
						if (isFullPage) {
							layerStyle.setCSSExpression('height','Math.max(document.body.scrollHeight, document.body.offsetHeight) - (jQuery.support.boxModel?0:'+options.legacyOffsetFix+') + "px"');
						}
						else {
							layerStyle.setCSSExpression('height','this.parentNode.offsetHeight + "px"');
						}
						if (isFullPage) {
							layerStyle.setCSSExpression('width','jQuery.support.boxModel && document.documentElement.clientWidth || document.body.clientWidth + "px"');
						}
						else {
							layerStyle.setCSSExpression('width','this.parentNode.offsetWidth + "px"');
						}
						if (adjustedLeft) {
							layerStyle.setCSSExpression('leftPosition', adjustedLeft);
						}
						if (adjustedTop) {
							layerStyle.setCSSExpression('topPosition', adjustedTop);
						}
					}
					else if (options.centerVertical) {
						if (isFullPage) {
							layerStyle.setCSSExpression('topPosition','(document.documentElement.clientHeight || document.body.clientHeight) / 2 - (this.offsetHeight / 2) + (scrollOffset = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "px"');
						}
						layerStyle.marginTop = 0;
					}
					else if (!options.centerVertical && isFullPage) {
						var topValue = (options.standardStyle && options.standardStyle.topPosition) ? parseInt(options.standardStyle.topPosition, 10) : 0;
						var expressionString = '((document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + '+topValue+') + "px"';
						layerStyle.setCSSExpression('topPosition',expressionString);
					}
				});
			}

			// Display the content message
			if (displayContent) {
				if (options.useTheme) {
					contentLayer.find('.ui-widget-content').append(displayContent);
				}
				else {
					contentLayer.append(displayContent);
				}
				if (displayContent.jquery || displayContent.nodeType) {
					jq(displayContent).show();
				}
			}

			if ((isLegacyIE || options.alwaysUseFrame) && options.displayMask) {
				frameLayer.show(); // Opacity is zero for this layer
			}
			if (options.appearDuration) {
				var onBlockCallback = options.onCoverApplied ? options.onCoverApplied : emptyFunc;
				var firstCallback = (options.displayMask && !displayContent) ? onBlockCallback : emptyFunc;
				var secondCallback = displayContent ? onBlockCallback : emptyFunc;
				if (options.displayMask) {
					maskLayer.actualFadeIn(options.appearDuration, firstCallback);
				}
				if (displayContent) {
					contentLayer.actualFadeIn(options.appearDuration, secondCallback);
				}
			}
			else {
				if (options.displayMask) {
					maskLayer.show();
				}
				if (displayContent) {
					contentLayer.show();
				}
				if (options.onCoverApplied) {
					options.onCoverApplied.bind(contentLayer)();
				}
			}

			// Attach keyboard and mouse event handlers
			manageEvents(true, targetElement, options);

			if (isFullPage) {
				mainPageCover = contentLayer[0];
				mainPageCoverElements = jq(options.interactiveElements,mainPageCover);
				if (options.focusFirstInput) {
					setTimeout(setFocus, 20);
				}
			}
			else {
				positionElement(contentLayer[0], options.centerHorizontal, options.centerVertical);
			}

			if (options.displayLimit) {
				// Initiate auto-uncover
				var timerId = setTimeout(function() {
					if (isFullPage) {
						jq.removeCover(options);
					}
					else {
						jq(targetElement).removeOverlay(options);
					}
				}, options.displayLimit);
				jq(targetElement).data('coverManager.timer', timerId);
			}
		}

		// Remove the cover from an element or the page
		function clearCover(targetElement, options) {
			var layerCount;
			var isFullPage = (targetElement === window);
			var $targetElement = jq(targetElement);
			var historicalData = $targetElement.data('coverManager.history');
			var timerId = $targetElement.data('coverManager.timer');
			if (timerId) {
				clearTimeout(timerId);
				$targetElement.removeData('coverManager.timer');
			}
			options = jq.extend({}, jq.displayCover.defaultSettings, options || {});
			manageEvents(false, targetElement, options); // Detach events

			if (options.onCoverRemoved === null) {
				options.onCoverRemoved = $targetElement.data('coverManager.onRemoveCallback');
				$targetElement.removeData('coverManager.onRemoveCallback');
			}

			var coverElements;
			if (isFullPage) // Complex selector to handle field errors in older IE versions
				coverElements = jq('body').children().filter('.coverManager').add('body > .coverManager');
			else
				coverElements = $targetElement.find('>.coverManager');

			// Address cursor persistence issue
			if ( options.pointerReset ) {
				if ( coverElements.length > 1 ) {
					coverElements[1].style.cursorProperty = options.pointerReset;
				}
				if ( coverElements.length > 2 ) {
					coverElements[2].style.cursorProperty = options.pointerReset;
				}
			}

			if (isFullPage) {
				mainPageCover = mainPageCoverElements = null;
			}

			if (options.disappearDuration) {
				layerCount = coverElements.length;
				coverElements.stop().fadeOut(options.disappearDuration, function() {
					if ( --layerCount === 0) {
						restoreState(coverElements,historicalData,options,targetElement);
					}
				});
			}
			else {
				restoreState(coverElements, historicalData, options, targetElement);
			}
		}

		//  ------------------------------------
		//  Internal helper functions follow
		//  ------------------------------------

		// Rebind/Unbind events
		function manageEvents(enable, targetElement, options) {
			var pageContent = targetElement === window;
			// Don't rebind if not specified or already bound/unbound
			if ((!enable && !options.attachEvents) || (enable && !options.attachEvents)) {
				return;
			}

			var eventSource = pageContent ? jq('body') : jq(targetElement);
			var eventType = enable ? 'keydown.coverManager' : 'unbind.coverManager';

			eventSource[eventType]('keydown.coverManager', function(e) {
				if (options.restrictTabNavigation && e.keyCode && e.keyCode === 9) { // TAB key
					var focused = jq(e.target);
					var focusable = pageContent ? mainPageCoverElements : jq(':input:enabled:visible', targetElement);
					var first = focusable.first();
					var last = focusable.last();

					if (focused.parents('body').hasClass('coverManager') && !focused.parents('.coverManager').hasClass('coverPage')) {
						// This is a special case for element covers where focusable elements may be outside the cover.
						// We need to check if the focused element is within the _actual_ cover message.
						// If it's outside, we redirect focus to the first element within the cover.
						if (!focused.closest('.' + options.coverMessageClass).length) {
							first.focus();
							return false;
						}
					}


					if (e.shiftKey) { // Shift + Tab
						if (focused.is(first) || !focusable.length) {
							last.focus();
							return false;
						}
					} else { // Tab
						if (focused.is(last) || !focusable.length) {
							first.focus();
							return false;
						}
					}
				}
			});

			// If the mask is clickable, attach a click handler
			if (options.onMaskClick) {
				eventSource[eventType]('mousedown.coverManager', function(e) {
					if (e.target === maskLayer[0]) { // Ensure the click is directly on the mask layer
						options.onMaskClick();
					}
				});
			}
		}

		// Set focus to the first interactive element within the covered area
		function setFocus() {
			if (mainPageCoverElements.length > 0) {
				mainPageCoverElements.first().focus();
			}
		}

		// Center the content element (used for element-level covers)
		function positionElement(elementToPosition, centerH, centerV) {
			var $element = jq(elementToPosition);
			var parentWidth = $element.parent().outerWidth();
			var parentHeight = $element.parent().outerHeight();
			var elementWidth = $element.outerWidth();
			var elementHeight = $element.outerHeight();

			var top = (parentHeight - elementHeight) / 2;
			var left = (parentWidth - elementWidth) / 2;

			if (centerH) {
				$element.css('left', left + 'px');
			}
			if (centerV) {
				$element.css('top', top + 'px');
			}
		}

		// Get computed style property (e.g., borderTopWidth)
		function getSize(element, property) {
			return parseInt(jq.css(element, property), 10) || 0;
		}

		// Restore element state and remove cover elements
		function restoreState(elementsToClear, historicalData, options, originalTarget) {
			// If there's historical data, re-insert the original content element
			if (historicalData && historicalData.contentNode) {
				if (historicalData.parentNode) {
					historicalData.parentNode.appendChild(historicalData.contentNode);
				}
				historicalData.contentNode.style.display = historicalData.originalDisplay;
				historicalData.contentNode.style.position = historicalData.originalPosition;
			}

			// Clean up the cover elements from the DOM
			elementsToClear.remove();

			// If the element was originally static and we changed its position, restore it
			if (originalTarget !== window && jq(originalTarget).data('coverManager.isStatic')) {
				jq(originalTarget).css('position','static');
				jq(originalTarget).removeData('coverManager.isStatic');
			}

			// Execute the onCoverRemoved callback if defined
			if (options.onCoverRemoved && jq.isFunction(options.onCoverRemoved)) {
				options.onCoverRemoved(originalTarget, options);
			}
		}

		// Bind the setup function to jQuery's ready event or call immediately if ready
		jq(function() {
			initiateLibrary(jq);
		});

	}

	// This ensures the setup function is called with the global jQuery object
	// Handle AMD (Asynchronous Module Definition) environments like RequireJS
	if (typeof define === 'function' && define.amd && define.amd.jQuery) {
		define(['jquery'], initiateLibrary);
	} else {
		// Fallback for environments without AMD, using the global jQuery object
		initiateLibrary(jQuery);
	}

})();