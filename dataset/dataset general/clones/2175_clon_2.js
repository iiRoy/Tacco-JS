/*!
 * jQ UI Lock Module
 * Release 2.61.0-2013.06.06
 * @requires jQ v1.7 or later
 *
 * Examples available at: http://malsup.com/jquery/block/
 * Copyright (c) 2007-2013 M. Alsup
 * Licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 * Special thanks to Amir-Hossein Sobhi for valuable input!
 */

;(function(globalRef) {
/*jslint eqeqeq:false curly:false latedef:false */
"use strict";

	function initializeUtility(jQ) {
		jQ.fn.fadeElementIn = jQ.fn.fadeIn;

		var blankFunction = jQ.noop || function() {};

		// This part ensures `setExpression` is only called when appropriate,
		// with additional handling for unusual user agent strings on Vista.
		var isOldIE = /MSIE/.test(navigator.userAgent);
		var isLegacyIE6 = /MSIE 6.0/.test(navigator.userAgent) && ! /MSIE 8.0/.test(navigator.userAgent);
		var documentCompatibilityMode = document.documentMode || 0;
		var canSetExpression = jQ.isFunction( document.createElement('div').style.setExpression );

		// Global jQ methods for locking/unlocking the entire page display
		jQ.uiLock   = function(configuration) { applyLock(globalRef, configuration); };
		jQ.uiUnlock = function(configuration) { releaseLock(globalRef, configuration); };

		// Convenient method for quick growl-style notifications (http://www.google.com/search?q=growl)
		jQ.notifyUI = function(headerText, bodyText, durationMs, completionHandler) {
			var notificationContainer = jQ('<div class="notifBox"></div>');
			if (headerText) notificationContainer.append('<h1>'+headerText+'</h1>');
			if (bodyText) notificationContainer.append('<h2>'+bodyText+'</h2>');
			if (durationMs === undefined) durationMs = 3e3; // Default to 3 seconds
			
			// Added by konapun: Extend timeout to 30 seconds if hovered, like standard toast notifications
			var initiateNotification = function(customOptions) {
				customOptions = customOptions || {};
				
				jQ.uiLock({
					message: notificationContainer,
					fadeEnter : typeof customOptions.fadeEnter  !== 'undefined' ? customOptions.fadeEnter  : 7e2,
					fadeExit: typeof customOptions.fadeExit !== 'undefined' ? customOptions.fadeExit : 1e3,
					displayDuration: typeof customOptions.displayDuration !== 'undefined' ? customOptions.displayDuration : durationMs,
					verticalCenter: false,
					displayShade: false,
					onRelease: completionHandler,
					styleRules: jQ.uiLock.config.notificationStyle
				});
			};
			
			initiateNotification();
			var initialOpacityValue = notificationContainer.css('opacity');
			notificationContainer.mouseover(function() {
				initiateNotification({
					fadeEnter: 0,
					displayDuration: 3e4 // 30 seconds
				});
				
				var currentMessageDisplay = jQ('.uiMessage');
				currentMessageDisplay.stop(); // Halt any ongoing fade-out
				currentMessageDisplay.fadeTo(3e2, 1); // Increase readability by reducing transparency
			}).mouseout(function() {
				jQ('.uiMessage').fadeOut(1e3);
			});
			// End konapun contributions
		};
		
		// Plugin method for locking content of specific elements
		jQ.fn.lockContent = function(configuration) {
			if ( this[0] === globalRef ) {
				jQ.uiLock( configuration );
				return this;
			}
			var mergedOptions = jQ.extend({}, jQ.uiLock.config, configuration || {});
			this.each(function() {
				var targetElement = jQ(this);
				if (mergedOptions.skipIfActive && targetElement.data('uiLock.isActive'))
					return;
				targetElement.unlockContent({ fadeExit: 0 });
			});

			return this.each(function() {
				if (jQ.css(this,'position') === 'static') {
					this.style.position = 'relative';
					jQ(this).data('uiLock.static', true);
				}
				this.style.zoom = 1; // Force 'hasLayout' in IE
				applyLock(this, configuration);
			});
		};

		// Plugin method for unlocking content of specific elements
		jQ.fn.unlockContent = function(configuration) {
			if ( this[0] === globalRef ) {
				jQ.uiUnlock( configuration );
				return this;
			}
			return this.each(function() {
				releaseLock(this, configuration);
			});
		};

		jQ.uiLock.versionNum = 2.60; // Second generation UI locking, no extra charge!

		// Override these in your application to modify default behavior and styling
		jQ.uiLock.config = {
			// Message displayed during locking (use null for no message)
			contentHtml:  '<h1>Loading data...</h1>',

			headerContent: null,		// Header string; only used when `useTheme` is true
			isDraggable: true,	// Only used when `useTheme` is true (requires jQ-ui.js)

			useTheme: false, // Set to true to integrate with jQ UI themes

			// Styles for the message during locking; to disable these and use
			// an external stylesheet, set `jQ.uiLock.config.styleRules = {};`
			styleRules: {
				padding:	0,
				margin:		0,
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
			themedStyleRules: {
				width:	'30%',
				top:	'40%',
				left:	'35%'
			},

			// Styles for the overlay layer
			shadeStyle:  {
				backgroundColor:	'#000',
				opacity:			0.6,
				cursor:				'wait'
			},

			// Style to revert cursor to before unlocking, addressing lingering 'wait' cursor issues
			defaultCursor: 'default',

			// Styles applied when using `jQ.notifyUI`
			notificationStyle: {
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

			// IE compatibility: 'about:blank' fails on HTTPS; javascript:false is slow.
			/*jshint scripturl:true */
			frameSource: /^https/i.test(globalRef.location.href || '') ? 'javascript:false' : 'about:blank',

			// Force usage of iframe in non-IE browsers (useful for blocking applets)
			enforceFrame: false,

			// Z-index for the blocking overlay
			baseZIndex: 1e3,

			// Set these to true to automatically center the message
			horizontalCenter: true, // <-- Only affects element blocking (page block controlled by CSS above)
			verticalCenter: true,

			// Allow body element to expand in IE6; improves blocking appearance on "short" pages.
			// Disable if changes to body height are undesirable.
			stretchBody: true,

			// Enable to disable key and mouse events for blocked content
			attachEvents: true,

			// By default, UI Lock will prevent tab navigation from leaving blocked content
			// (if `attachEvents` is true)
			limitTabNav: true,

			// Fade-in duration in milliseconds; set to 0 to disable fade-in on block
			fadeEnter:  2e2,

			// Fade-out duration in milliseconds; set to 0 to disable fade-out on unblock
			fadeExit:  4e2,

			// Time in milliseconds to wait before automatic unblocking; set to 0 to disable
			displayDuration: 0,

			// Disable if the overlay should not be shown
			displayShade: true,

			// If true, focus will be directed to the first available input field when page blocking
			focusActiveInput: true,
            
            // Elements that can receive focus
            focusableItems: ':input:enabled:visible',

			// Suppresses overlay opacity styles on FF/Linux (due to performance issues);
			// no longer necessary as of 2012.
			// applyPlatformOpacityRules: true,

			// Callback method invoked when fade-in completes and blocking message is visible
			onApply: null,

			// Callback method invoked when unblocking completes; the callback receives
			// the element that was unblocked (which is the window object for page blocks)
			// and the options passed to the unblock call:
			//	onRelease(element, options)
			onRelease: null,

			// Callback method invoked when the overlay area is clicked.
			// Setting this will change the cursor to a pointer; otherwise, cursor defined in `shadeStyle` is used.
			onShadeClick: null,

			// Don't ask; if you must know: http://groups.google.com/group/jquery-en/browse_thread/thread/36640a8730503595/2f6a79a77a78e493#2f6a79a77a78e493
			quirksOffset: 4,

			// CSS class name for the message block
			messageClass: 'uiMessage',

			// If already blocked, ignore the request (do not unblock and re-block)
			skipIfActive: false
		};

		// Private data and functions follow...

		var globalBlockRef = null;
		var globalFocusableElements = [];

		function positionCenter(targetElement, horizontal, vertical) {
			var msg = targetElement;
			var el = msg.parentNode;
			var op = msg.offsetParent;
			var top = ((vertical && el) ? (op.offsetHeight - msg.offsetHeight) / 2 : 0) + (el ? el.scrollTop : 0);
			var left = ((horizontal && el) ? (op.offsetWidth - msg.offsetWidth) / 2 : 0) + (el ? el.scrollLeft : 0);
			msg.style.top = top + 'px';
			msg.style.left = left + 'px';
		}

		function getElementDimension(targetNode, dimensionProp) {
			return parseInt(jQ.css(targetNode, dimensionProp), 10) || 0;
		}

		function manageEvents(action, targetNode, configuration) {
			var evt = 'keydown.uiLocker';
			var target = jQ(targetNode);
			var tabElements = jQ(configuration.focusableItems, globalBlockRef);
			var first = tabElements.filter(':first');
			var last = tabElements.filter(':last');

			if (action) { // Bind events
				target.bind(evt, function(event) {
					// Allow tab navigation if not constrained
					if (event.keyCode && event.keyCode === 9 && configuration.limitTabNav) {
						if (event.shiftKey) { // Shift-Tab
							if (document.activeElement === first[0]) {
								last.focus();
								return false;
							}
						} else { // Tab
							if (document.activeElement === last[0]) {
								first.focus();
								return false;
							}
						}
					}
					// Block all other key events
					if (event.keyCode && event.keyCode !== 9) {
						return false;
					}
				});
				if (configuration.onShadeClick) {
					target.children('.uiShade').bind('click.uiLocker', function(event) {
						configuration.onShadeClick(targetNode, configuration);
					});
				}
			} else { // Unbind events
				target.unbind(evt);
				target.children('.uiShade').unbind('click.uiLocker');
			}
		}

		function setInitialFocus() {
			if (!globalFocusableElements.length) {
				return;
			}
			var firstInput = globalFocusableElements.filter(':input:enabled:visible:first');
			if (firstInput.length) {
				firstInput.focus();
			} else {
				// If no input, focus the block itself to allow tabbing
				globalBlockRef.focus();
			}
		}

		function resetElements(elementSet, storedElementInfo, configuration, targetNode) {
			var target = jQ(targetNode);
			target.data('uiLock.isActive', false);
			elementSet.each(function(idx, el) {
				if (this.parentNode) {
					this.parentNode.removeChild(this);
				}
			});

			if (storedElementInfo && storedElementInfo.el) {
				storedElementInfo.el.style.display = storedElementInfo.initialDisplay;
				storedElementInfo.el.style.position = storedElementInfo.initialPosition;
				if (storedElementInfo.parentContainer) {
					storedElementInfo.parentContainer.appendChild(storedElementInfo.el);
				}
				target.removeData('uiLock.history');
			}

			if (targetNode === globalRef) {
				jQ('html,body').css('height', ''); // Reset body height
			}

			if (configuration.onRelease) {
				configuration.onRelease(targetNode, configuration);
			}
		}

		function applyLock(targetNode, configuration) {
			var styleRules, themedStyleRules;
			var isGlobalBlock = (targetNode === globalRef);
			var displayMessageContent = (configuration && configuration.message !== undefined ? configuration.message : undefined);
			configuration = jQ.extend({}, jQ.uiLock.config, configuration || {});

			if (configuration.skipIfActive && jQ(targetNode).data('uiLock.isActive'))
				return;

			configuration.shadeStyle = jQ.extend({}, jQ.uiLock.config.shadeStyle, configuration.shadeStyle || {});
			styleRules = jQ.extend({}, jQ.uiLock.config.styleRules, configuration.styleRules || {});
			if (configuration.onShadeClick)
				configuration.shadeStyle.cursor = 'pointer';

			themedStyleRules = jQ.extend({}, jQ.uiLock.config.themedStyleRules, configuration.themedStyleRules || {});
			displayMessageContent = displayMessageContent === undefined ? configuration.contentHtml : displayMessageContent;

			// Remove any existing block (if present)
			if (isGlobalBlock && globalBlockRef)
				releaseLock(globalRef, {fadeExit:0});

			// If an existing element is used as the blocking content, capture its
			// current DOM position and display style for restoration during unblock.
			if (displayMessageContent && typeof displayMessageContent !== 'string' && (displayMessageContent.parentNode || displayMessageContent.jquery)) {
				var domElementRef = displayMessageContent.jquery ? displayMessageContent[0] : displayMessageContent;
				var storedElementInfo = {};
				jQ(targetNode).data('uiLock.history', storedElementInfo);
				storedElementInfo.el = domElementRef;
				storedElementInfo.parentContainer = domElementRef.parentNode;
				storedElementInfo.initialDisplay = domElementRef.style.display;
				storedElementInfo.initialPosition = domElementRef.style.position;
				if (storedElementInfo.parentContainer)
					storedElementInfo.parentContainer.removeChild(domElementRef);
			}

			jQ(targetNode).data('uiLock.onRelease', configuration.onRelease);
			var zIndexCounter = configuration.baseZIndex;

			// UI Lock uses three layers for blocking; all are used on every platform for simplicity:
			// overlayFrame: iframe layer to suppress bleed-through of underlying content.
			// overlayLayer: overlay layer with opacity and a wait cursor (by default).
			// messageLayer: message content displayed during blocking.
			var overlayFrame, overlayLayer, messageLayer, markupString;
			if (isOldIE || configuration.enforceFrame)
				overlayFrame = jQ('<iframe class="uiLocker" style="z-index:'+ (zIndexCounter++) +';display:none;border:none;margin:0;padding:0;position:absolute;width:100%;height:100%;top:0;left:0" src="'+configuration.frameSource+'"></iframe>');
			else
				overlayFrame = jQ('<div class="uiLocker" style="display:none"></div>');

			if (configuration.useTheme)
				overlayLayer = jQ('<div class="uiLocker uiShade ui-overlay-base" style="z-index:'+ (zIndexCounter++) +';display:none"></div>');
			else
				overlayLayer = jQ('<div class="uiLocker uiShade" style="z-index:'+ (zIndexCounter++) +';display:none;border:none;margin:0;padding:0;width:100%;height:100%;top:0;left:0"></div>');

			if (configuration.useTheme && isGlobalBlock) {
				markupString = '<div class="uiLocker ' + configuration.messageClass + ' pageLocker ui-dialog-box ui-base-widget ui-rounded-corners" style="z-index:'+(zIndexCounter+10)+';display:none;position:fixed">';
				if ( configuration.headerContent ) {
					markupString += '<div class="ui-base-widget-header ui-dialog-title ui-rounded-corners lockerHeader">'+(configuration.headerContent || '&nbsp;')+'</div>';
				}
				markupString += '<div class="ui-content-base ui-dialog-body"></div>';
				markupString += '</div>';
			}
			else if (configuration.useTheme) {
				markupString = '<div class="uiLocker ' + configuration.messageClass + ' elementLocker ui-dialog-box ui-base-widget ui-rounded-corners" style="z-index:'+(zIndexCounter+10)+';display:none;position:absolute">';
				if ( configuration.headerContent ) {
					markupString += '<div class="ui-base-widget-header ui-dialog-title ui-rounded-corners lockerHeader">'+(configuration.headerContent || '&nbsp;')+'</div>';
				}  
				markupString += '<div class="ui-content-base ui-dialog-body"></div>';
				markupString += '</div>';
			}
			else if (isGlobalBlock) {
				markupString = '<div class="uiLocker ' + configuration.messageClass + ' pageLocker" style="z-index:'+(zIndexCounter+10)+';display:none;position:fixed"></div>';
			}
			else {
				markupString = '<div class="uiLocker ' + configuration.messageClass + ' elementLocker" style="z-index:'+(zIndexCounter+10)+';display:none;position:absolute"></div>';
			}
			messageLayer = jQ(markupString);

			// Apply styles to the message layer if content is present
			if (displayMessageContent) {
				if (configuration.useTheme) {
					messageLayer.css(themedStyleRules);
					messageLayer.addClass('ui-content-base');
				}
				else
					messageLayer.css(styleRules);
			}

			// Style the overlay layer
			if (!configuration.useTheme /*&& (!configuration.applyPlatformOpacityRules)*/)
				overlayLayer.css(configuration.shadeStyle);
			overlayLayer.css('position', isGlobalBlock ? 'fixed' : 'absolute');

			// Make iframe layer transparent in IE
			if (isOldIE || configuration.enforceFrame)
				overlayFrame.css('opacity',0.0);

			//$([overlayFrame[0],overlayLayer[0],messageLayer[0]]).appendTo(isGlobalBlock ? 'body' : targetNode);
			var layers = [overlayFrame,overlayLayer,messageLayer], parentContainer = isGlobalBlock ? jQ('body') : jQ(targetNode);
			jQ.each(layers, function() {
				this.appendTo(parentContainer);
			});

			if (configuration.useTheme && configuration.isDraggable && jQ.fn.draggable) {
				messageLayer.draggable({
					handle: '.ui-dialog-title',
					cancel: 'li'
				});
			}

			// IE7 must use absolute positioning in quirks mode and to handle ActiveX issues (during scrolling)
			var expressionNeeded = canSetExpression && (!jQ.support.boxModel || jQ('object,embed', isGlobalBlock ? null : targetNode).length > 0);
			if (isLegacyIE6 || expressionNeeded) {
				// Ensure body has 100% height
				if (isGlobalBlock && configuration.stretchBody && jQ.support.boxModel)
					jQ('html,body').css('height','100%');

				// Fix IE6 issue when blocked element has a border width
				if ((isLegacyIE6 || !jQ.support.boxModel) && !isGlobalBlock) {
					var topBorderWidth = getElementDimension(targetNode,'borderTopWidth'), leftBorderWidth = getElementDimension(targetNode,'borderLeftWidth');
					var adjustedTop = topBorderWidth ? '(0 - '+topBorderWidth+')' : 0;
					var adjustedLeft = leftBorderWidth ? '(0 - '+leftBorderWidth+')' : 0;
				}

				// Simulate fixed position
				jQ.each(layers, function(idx, currentLayer) {
					var layerStyle = currentLayer[0].style;
					layerStyle.position = 'absolute';
					if (idx < 2) {
						if (isGlobalBlock)
							layerStyle.setExpression('height','Math.max(document.body.scrollHeight, document.body.offsetHeight) - (jQ.support.boxModel?0:'+configuration.quirksOffset+') + "px"');
						else
							layerStyle.setExpression('height','this.parentNode.offsetHeight + "px"');
						if (isGlobalBlock)
							layerStyle.setExpression('width','jQ.support.boxModel && document.documentElement.clientWidth || document.body.clientWidth + "px"');
						else
							layerStyle.setExpression('width','this.parentNode.offsetWidth + "px"');
						if (adjustedLeft) layerStyle.setExpression('left', adjustedLeft);
						if (adjustedTop) layerStyle.setExpression('top', adjustedTop);
					}
					else if (configuration.verticalCenter) {
						if (isGlobalBlock) layerStyle.setExpression('top','(document.documentElement.clientHeight || document.body.clientHeight) / 2 - (this.offsetHeight / 2) + (scrollPos = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "px"');
						layerStyle.marginTop = 0;
					}
					else if (!configuration.verticalCenter && isGlobalBlock) {
						var initialTop = (configuration.styleRules && configuration.styleRules.top) ? parseInt(configuration.styleRules.top, 10) : 0;
						var topExpression = '((document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + '+initialTop+') + "px"';
						layerStyle.setExpression('top',topExpression);
					}
				});
			}

			// Display the message
			if (displayMessageContent) {
				if (configuration.useTheme)
					messageLayer.find('.ui-content-base').append(displayMessageContent);
				else
					messageLayer.append(displayMessageContent);
				if (displayMessageContent.jquery || displayMessageContent.nodeType)
					jQ(displayMessageContent).show();
			}

			if ((isOldIE || configuration.enforceFrame) && configuration.displayShade)
				overlayFrame.show(); // Opacity is zero
			if (configuration.fadeEnter) {
				var onCompletionCallback = configuration.onApply ? configuration.onApply : blankFunction;
				var overlayCompletion = (configuration.displayShade && !displayMessageContent) ? onCompletionCallback : blankFunction;
				var messageCompletion = displayMessageContent ? onCompletionCallback : blankFunction;
				if (configuration.displayShade)
					overlayLayer.fadeElementIn(configuration.fadeEnter, overlayCompletion);
				if (displayMessageContent)
					messageLayer.fadeElementIn(configuration.fadeEnter, messageCompletion);
			}
			else {
				if (configuration.displayShade)
					overlayLayer.show();
				if (displayMessageContent)
					messageLayer.show();
				if (configuration.onApply)
					configuration.onApply();
			}

			// Bind key and mouse events
			manageEvents(1, targetNode, configuration);

			if (isGlobalBlock) {
				globalBlockRef = messageLayer[0];
				globalFocusableElements = jQ(configuration.focusableItems,globalBlockRef);
				if (configuration.focusActiveInput)
					setTimeout(setInitialFocus, 20);
			}
			else
				positionCenter(messageLayer[0], configuration.horizontalCenter, configuration.verticalCenter);

			if (configuration.displayDuration) {
				// Auto-unblock
				var timeoutHandle = setTimeout(function() {
					if (isGlobalBlock)
						jQ.uiUnlock(configuration);
					else
						jQ(targetNode).unlockContent(configuration);
				}, configuration.displayDuration);
				jQ(targetNode).data('uiLock.timeout', timeoutHandle);
			}
			jQ(targetNode).data('uiLock.isActive', true);
		}

		// Remove the block
		function releaseLock(targetNode, configuration) {
			var fadeCount;
			var isGlobalBlock = (targetNode === globalRef);
			var targetElement = jQ(targetNode);
			var storedElementInfo = targetElement.data('uiLock.history');
			var timeoutHandle = targetElement.data('uiLock.timeout');
			if (timeoutHandle) {
				clearTimeout(timeoutHandle);
				targetElement.removeData('uiLock.timeout');
			}
			configuration = jQ.extend({}, jQ.uiLock.config, configuration || {});
			manageEvents(0, targetNode, configuration); // Unbind events

			if (configuration.onRelease === null) {
				configuration.onRelease = targetElement.data('uiLock.onRelease');
				targetElement.removeData('uiLock.onRelease');
			}

			var blockedElementsCollection;
			if (isGlobalBlock) // Peculiar selector to handle odd field errors in IE6/7
				blockedElementsCollection = jQ('body').children().filter('.uiLocker').add('body > .uiLocker');
			else
				blockedElementsCollection = targetElement.find('>.uiLocker');

			// Fix cursor issue
			if ( configuration.defaultCursor ) {
				if ( blockedElementsCollection.length > 1 )
					blockedElementsCollection[1].style.cursor = configuration.defaultCursor;
				if ( blockedElementsCollection.length > 2 )
					blockedElementsCollection[2].style.cursor = configuration.defaultCursor;
			}

			if (isGlobalBlock)
				globalBlockRef = globalFocusableElements = null;

			if (configuration.fadeExit) {
				fadeCount = blockedElementsCollection.length;
				blockedElementsCollection.fadeOut(configuration.fadeExit, function() { 
					if ( --fadeCount === 0)
						resetElements(blockedElementsCollection,storedElementInfo,configuration,targetNode);
				});
			}
			else
				resetElements(blockedElementsCollection, storedElementInfo, configuration, targetNode);
		}

		initializeUtility(jQ);

	} // End of setup function

	if (typeof define === 'function' && define.amd) {
		define(['jquery'], initializeUtility);
	} else {
		initializeUtility(window.jQuery);
	}

})(this);