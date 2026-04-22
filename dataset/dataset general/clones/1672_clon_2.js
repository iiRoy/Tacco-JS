/*! Dynamic Overlay - v1.0.0 - 2023-10-26
* http://example.com/plugins/dynamic-overlay/
* Copyright (c) 2023 Acme Corp; */
;(function(jQry) {

/*>>core*/
/**
 *
 * Dynamic Overlay Core JS script
 *
 */


/**
 * Internal static identifiers
 */
var FINISH_EVT = 'Dismiss',
	PRE_FINISH_EVT = 'BeforeDismiss',
	POST_FINISH_EVT = 'AfterDismiss',
	PRE_INSERT_EVT = 'BeforeInsert',
	STRUCTURE_PARSE_EVT = 'StructureParse',
	BEGIN_EVT = 'Launch',
	MODIFY_EVT = 'Modify',
	popFx = 'dov',
	EVT_NAMESPACE = '.' + popFx,
	ACTIVE_CLASS = 'dov-active',
	DISCARDING_CLASS = 'dov-discarding',
	BLOCK_DISMISS_CLASS = 'dov-block-dismiss';


/**
 * Private scope variables
 */
var pfxInst, // Since we handle only one instance of the PopEffect object, we keep it local to avoid 'this' context issues.
	PopEffect = function(){},
	_isJQLib = !!(window.jQuery),
	_pastState,
	_viewPort = jQry(window),
	_docBody,
	_docRoot,
	_pastContentKind,
	_containerClasses,
	_currentPopKind;


/**
 * Private helper functions
 */


var _pfxListen = function(eventName, handlerFunc) {
		pfxInst.ev.on(popFx + eventName + EVT_NAMESPACE, handlerFunc);
	},
	_buildElement = function(cssClass, targetParent, innerHtml, isRaw) {
		var domElem = document.createElement('div');
		domElem.className = 'dov-' + cssClass;
		if (innerHtml) {
			domElem.innerHTML = innerHtml;
		}
		if (!isRaw) {
			domElem = jQry(domElem);
			if (targetParent) {
				domElem.appendTo(targetParent);
			}
		} else if (targetParent) {
			targetParent.appendChild(domElem);
		}
		return domElem;
	},
	_pfxBroadcast = function(eventObj, eventData) {
		pfxInst.ev.triggerHandler(popFx + eventObj, eventData);

		if (pfxInst.st.callbacks) {
			// Transforms "dovEventName" into "eventName" callback and invokes it if available
			eventObj = eventObj.charAt(0).toLowerCase() + eventObj.slice(1);
			if (pfxInst.st.callbacks[eventObj]) {
				pfxInst.st.callbacks[eventObj].apply(pfxInst, jQry.isArray(eventData) ? eventData : [eventData]);
			}
		}
	},
	_retrieveDismissButton = function(elementType) {
		if (elementType !== _currentPopKind || !pfxInst.currTemplate.closeBtn) {
			pfxInst.currTemplate.closeBtn = jQry( pfxInst.st.dismissMarkup.replace('%button_label%', pfxInst.st.tDismiss ) );
			_currentPopKind = elementType;
		}
		return pfxInst.currTemplate.closeBtn;
	},
	// Ensures the PopEffect instance exists, creating it if necessary
	_ensureSingleton = function() {
		if (!jQry.dynamicOverlay.instance) {
			pfxInst = new PopEffect();
			pfxInst.initialize();
			jQry.dynamicOverlay.instance = pfxInst;
		}
	},
	// Detects CSS transitions availability, inspired by stackoverflow.com/questions/7264899
	canAnimateCSS = function() {
		var styleProp = document.createElement('p').style, // Create a dummy element to check styles
			vendorPrefixes = ['ms','O','Moz','Webkit']; // Common vendor prefixes

		if ( styleProp['transition'] !== undefined ) {
			return true;
		}

		while ( vendorPrefixes.length ) {
			if ( vendorPrefixes.pop() + 'Transition' in styleProp ) {
				return true;
			}
		}

		return false;
	};



/**
 * Public facing methods
 */
PopEffect.prototype = {

	initializer: PopEffect,

	/**
	 * Sets up the Dynamic Overlay plugin.
	 * This method runs once when jQry.fn.dynamicOverlay or jQry.dynamicOverlay is called.
	 */
	initialize: function() {
		var browserVersion = navigator.appVersion;
		pfxInst.isIE7 = browserVersion.indexOf("MSIE 7.") !== -1;
		pfxInst.isIE8 = browserVersion.indexOf("MSIE 8.") !== -1;
		pfxInst.isOlderIE = pfxInst.isIE7 || pfxInst.isIE8;
		pfxInst.isAndroidDevice = (/android/gi).test(browserVersion);
		pfxInst.isIOSDevice = (/iphone|ipad|ipod/gi).test(browserVersion);
		pfxInst.supportsCSSTransitions = canAnimateCSS();

		// We disable fixed positioning for overlays on mobile devices that struggle with it.
		// If there's a better detection method, please share!
		pfxInst.isLikelyMobile = (pfxInst.isAndroidDevice || pfxInst.isIOSDevice || /(Opera Mini)|Kindle|webOS|BlackBerry|(Opera Mobi)|(Windows Phone)|IEMobile/i.test(navigator.userAgent) );
		_docBody = jQry(document.body);
		_docRoot = jQry(document);

		pfxInst.overlayCache = {};
	},

	/**
	 * Displays the overlay
	 * @param  configData Configuration object for the overlay
	 */
	display: function(configData) {

		var idx;

		if (configData.isObj === false) {
			// Convert jQuery collection to a standard array to prevent future conflicts
			pfxInst.contentElements = configData.contentElements.toArray();

			pfxInst.currentIndex = 0;
			var contentItems = configData.contentElements,
				singleItem;
			for (idx = 0; idx < contentItems.length; idx++) {
				singleItem = contentItems[idx];
				if (singleItem.parsed) {
					singleItem = singleItem.el[0];
				}
				if (singleItem === configData.triggerElement[0]) {
					pfxInst.currentIndex = idx;
					break;
				}
			}
		} else {
			pfxInst.contentElements = jQry.isArray(configData.contentElements) ? configData.contentElements : [configData.contentElements];
			pfxInst.currentIndex = configData.startIndex || 0;
		}

		// If the overlay is already visible, just update its content
		if (pfxInst.isActive) {
			pfxInst.refreshContentStructure();
			return;
		}

		pfxInst.elementKinds = [];
		_containerClasses = '';
		if (configData.mainElement && configData.mainElement.length) {
			pfxInst.ev = configData.mainElement.eq(0);
		} else {
			pfxInst.ev = _docRoot;
		}

		if (configData.uniqueKey) {
			if (!pfxInst.overlayCache[configData.uniqueKey]) {
				pfxInst.overlayCache[configData.uniqueKey] = {};
			}
			pfxInst.currTemplate = pfxInst.overlayCache[configData.uniqueKey];
		} else {
			pfxInst.currTemplate = {};
		}



		pfxInst.st = jQry.extend(true, {}, jQry.dynamicOverlay.defaults, configData );
		pfxInst.fixedPositionContent = pfxInst.st.fixedContentPos === 'auto' ? !pfxInst.isLikelyMobile : pfxInst.st.fixedContentPos;

		if (pfxInst.st.isModal) {
			pfxInst.st.dismissOnClickContent = false;
			pfxInst.st.dismissOnClickBg = false;
			pfxInst.st.showDismissButton = false;
			pfxInst.st.enableEscapeKeyPress = false;
		}


		// Constructing the overlay markup
		// Primary containers are created only once
		if (!pfxInst.bgShade) {

			// Dark background layer
			pfxInst.bgShade = _buildElement('background').on('click' + EVT_NAMESPACE, function() {
				pfxInst.dismiss();
			});

			pfxInst.wrapper = _buildElement('wrapper').attr('tabindex', -1).on('click' + EVT_NAMESPACE, function(eventObj) {
				if (pfxInst._checkIfDismiss(eventObj.target)) {
					pfxInst.dismiss();
				}
			});

			pfxInst.contentArea = _buildElement('container', pfxInst.wrapper);
		}

		pfxInst.displayContentContainer = _buildElement('content');
		if (pfxInst.st.showLoader) {
			pfxInst.loader = _buildElement('loader', pfxInst.contentArea, pfxInst.st.tLoadingText);
		}


		// Initializing individual modules
		var plugins = jQry.dynamicOverlay.modules;
		for (idx = 0; idx < plugins.length; idx++) {
			var moduleName = plugins[idx];
			moduleName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
			pfxInst['init' + moduleName].call(pfxInst);
		}
		_pfxBroadcast('BeforeLaunch');


		if (pfxInst.st.showDismissButton) {
			// The button to close the overlay
			if (!pfxInst.st.dismissBtnInside) {
				pfxInst.wrapper.append( _retrieveDismissButton() );
			} else {
				_pfxListen(STRUCTURE_PARSE_EVT, function(eventObj, template, values, singleItem) {
					values.dismiss_replaceWith = _retrieveDismissButton(singleItem.type);
				});
				_containerClasses += ' dov-close-button-in';
			}
		}

		if (pfxInst.st.alignTop) {
			_containerClasses += ' dov-align-to-top';
		}



		if (pfxInst.fixedPositionContent) {
			pfxInst.wrapper.css({
				overflow: pfxInst.st.overflowY,
				overflowX: 'hidden',
				overflowY: pfxInst.st.overflowY
			});
		} else {
			pfxInst.wrapper.css({
				top: _viewPort.scrollTop(),
				position: 'absolute'
			});
		}
		if ( pfxInst.st.fixedBackground === false || (pfxInst.st.fixedBackground === 'auto' && !pfxInst.fixedPositionContent) ) {
			pfxInst.bgShade.css({
				height: _docRoot.height(),
				position: 'absolute'
			});
		}



		if (pfxInst.st.enableEscapeKeyPress) {
			// Close overlay when ESC key is pressed
			_docRoot.on('keyup' + EVT_NAMESPACE, function(eventObj) {
				if (eventObj.keyCode === 27) {
					pfxInst.dismiss();
				}
			});
		}

		_viewPort.on('resize' + EVT_NAMESPACE, function() {
			pfxInst.adjustDimensions();
		});


		if (!pfxInst.st.dismissOnClickContent) {
			_containerClasses += ' dov-auto-cursor';
		}

		if (_containerClasses)
			pfxInst.wrapper.addClass(_containerClasses);


		// This forces a layout recalculation, so we get it once to avoid double triggers
		var viewportHeight = pfxInst.wH = _viewPort.height();


		var viewportStyles = {};

		if ( pfxInst.fixedPositionContent ) {
            if (pfxInst._checkScrollPresent(viewportHeight)){
                var scrollWidth = pfxInst._calcScrollbarWidth();
                if (scrollWidth) {
                    viewportStyles.marginRight = scrollWidth;
                }
            }
        }

		if (pfxInst.fixedPositionContent) {
			if (!pfxInst.isIE7) {
				viewportStyles.overflow = 'hidden';
			} else {
				// IE7 specific double-scroll workaround
				jQry('body, html').css('overflow', 'hidden');
			}
		}



		var additionalClasses = pfxInst.st.primaryClass;
		if (pfxInst.isIE7) {
			additionalClasses += ' dov-ie7';
		}
		if (additionalClasses) {
			pfxInst._addEffectClass( additionalClasses );
		}

		// Insert content into the overlay
		pfxInst.refreshContentStructure();

		_pfxBroadcast('BuildComponents');


		// Remove scrollbar, add margin, etc.
		jQry('html').css(viewportStyles);

		// Append all elements to the DOM
		pfxInst.bgShade.add(pfxInst.wrapper).prependTo( document.body );



		// Store the last element that had focus
		pfxInst._lastActiveElement = document.activeElement;

		// Defer to next cycle for CSS transition processing
		setTimeout(function() {

			if (pfxInst.displayContent) {
				pfxInst._addEffectClass(ACTIVE_CLASS);
				pfxInst._setElementFocus();
			} else {
				// If content isn't loaded/defined, apply class only to the background
				pfxInst.bgShade.addClass(ACTIVE_CLASS);
			}

			// Capture focus within the overlay
			_docRoot.on('focusin' + EVT_NAMESPACE, pfxInst._handleFocusIn);

		}, 16);

		pfxInst.isActive = true;
		pfxInst.adjustDimensions(viewportHeight);
		_pfxBroadcast(BEGIN_EVT);

		return configData;
	},

	/**
	 * Closes the active overlay
	 */
	dismiss: function() {
		if (!pfxInst.isActive) return;
		_pfxBroadcast(PRE_FINISH_EVT);

		pfxInst.isActive = false;
		// For CSS3 animations
		if (pfxInst.st.fadeDelay && !pfxInst.isOlderIE && pfxInst.supportsCSSTransitions ) {
			pfxInst._addEffectClass(DISCARDING_CLASS);
			setTimeout(function() {
				pfxInst._internalDismiss();
			}, pfxInst.st.fadeDelay);
		} else {
			pfxInst._internalDismiss();
		}
	},

	/**
	 * Internal helper for the dismiss() function
	 */
	_internalDismiss: function() {
		_pfxBroadcast(FINISH_EVT);

		var classesToRemove = DISCARDING_CLASS + ' ' + ACTIVE_CLASS + ' ';

		pfxInst.bgShade.detach();
		pfxInst.wrapper.detach();
		pfxInst.contentArea.empty();

		if (pfxInst.st.primaryClass) {
			classesToRemove += pfxInst.st.primaryClass + ' ';
		}

		pfxInst._removeEffectClass(classesToRemove);

		if (pfxInst.fixedPositionContent) {
			var viewportStyles = {marginRight: ''};
			if (pfxInst.isIE7) {
				jQry('body, html').css('overflow', '');
			} else {
				viewportStyles.overflow = '';
			}
			jQry('html').css(viewportStyles);
		}

		_docRoot.off('keyup' + EVT_NAMESPACE + ' focusin' + EVT_NAMESPACE);
		pfxInst.ev.off(EVT_NAMESPACE);

		// Clean up DOM elements that might not be automatically removed
		pfxInst.wrapper.attr('class', 'dov-wrapper').removeAttr('style');
		pfxInst.bgShade.attr('class', 'dov-background');
		pfxInst.contentArea.attr('class', 'dov-container');

		// Remove dismiss button from the target element if necessary
		if (pfxInst.st.showDismissButton &&
		(!pfxInst.st.dismissBtnInside || pfxInst.currTemplate[pfxInst.currentElement.type] === true)) {
			if (pfxInst.currTemplate.closeBtn)
				pfxInst.currTemplate.closeBtn.detach();
		}


		if (pfxInst._lastActiveElement) {
			jQry(pfxInst._lastActiveElement).focus(); // Restore focus to the previously active element
		}
		pfxInst.currentElement = null;
		pfxInst.displayContent = null;
		pfxInst.currTemplate = null;
		pfxInst.previousHeight = 0;

		_pfxBroadcast(POST_FINISH_EVT);
	},

	adjustDimensions: function(viewportHeight) {

		if (pfxInst.isIOSDevice) {
			// Addresses iOS navigation bar issues: https://github.com/dimsemenov/Magnific-Popup/issues/2
			var displayScale = document.documentElement.clientWidth / window.innerWidth;
			var adjustedHeight = window.innerHeight * displayScale;
			pfxInst.wrapper.css('height', adjustedHeight);
			pfxInst.wH = adjustedHeight;
		} else {
			pfxInst.wH = viewportHeight || _viewPort.height();
		}
		// Fix for #84: overlay incorrectly positioned when body has position:relative
		if (!pfxInst.fixedPositionContent) {
			pfxInst.wrapper.css('height', pfxInst.wH);
		}

		_pfxBroadcast('Resized');

	},

	/**
	 * Updates the HTML content of the overlay based on the current index
	 */
	refreshContentStructure: function() {
		var singleItem = pfxInst.contentElements[pfxInst.currentIndex];

		// Detach existing content and then apply modifications
		pfxInst.displayContentContainer.detach();

		if (pfxInst.displayContent)
			pfxInst.displayContent.detach();

		if (!singleItem.parsed) {
			singleItem = pfxInst.parseItem( pfxInst.currentIndex );
		}

		var elementType = singleItem.type;

		_pfxBroadcast('BeforeModify', [pfxInst.currentElement ? pfxInst.currentElement.type : '', elementType]);
		// The BeforeModify event operates as follows:
		// _pfxListen('BeforeModify', function(e, oldType, updatedType) { });

		pfxInst.currentElement = singleItem;
	}
};


jQry.dynamicOverlay = {
	instance: null,
	modules: [],
	defaults: {
		primaryClass: '',
		dismissMarkup: '<button title="%button_label%" type="button" class="dov-dismiss">&times;</button>',
		tDismiss: 'Close (Esc)',
		tLoadingText: 'Loading...',
		fixedContentPos: 'auto',
		fixedBackground: true,
		dismissOnClickContent: true,
		dismissOnClickBg: true,
		showDismissButton: true,
		dismissBtnInside: false,
		enableEscapeKeyPress: true,
		alignTop: false,
		fadeDelay: 300,
		overflowY: 'auto',
		focus: ''
	},
	proto: PopEffect.prototype
};

// Assign utility methods to the prototype for instance access
PopEffect.prototype._checkScrollPresent = function(h) {
	// Checks if the document body has a scrollbar
	if (h === _viewPort.height()) {
		return true;
	}
	return document.body.scrollHeight > h;
};
PopEffect.prototype._calcScrollbarWidth = function() {
	// Calculates the width of the scrollbar to prevent content jump
	var div = document.createElement('div');
	div.style.cssText = 'width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;';
	document.body.appendChild(div);
	var scrollbarWidth = div.offsetWidth - div.clientWidth;
	document.body.removeChild(div);
	return scrollbarWidth;
};
PopEffect.prototype._addEffectClass = function(c) {
	// Adds a class to the main overlay wrapper and body
	pfxInst.bgShade.addClass(c);
	_docBody.addClass(c);
};
PopEffect.prototype._removeEffectClass = function(c) {
	// Removes a class from the main overlay wrapper and body
	pfxInst.bgShade.removeClass(c);
	_docBody.removeClass(c);
};
PopEffect.prototype._setElementFocus = function() {
	// Sets focus to the first focusable element within the overlay
	if(pfxInst.st.focus) {
		pfxInst.contentArea.find(pfxInst.st.focus).focus();
	} else {
		pfxInst.contentArea.find('.dov-close, .dov-dismiss').eq(0).focus();
	}
};
PopEffect.prototype._handleFocusIn = function(eventObj) {
	// Handles focus trapping within the overlay
	if (eventObj.target !== pfxInst.wrapper[0] && !pfxInst.contentArea.has(eventObj.target).length) {
		pfxInst._setElementFocus();
		return false;
	}
};
PopEffect.prototype._checkIfDismiss = function(target) {
	// Checks if a click target should dismiss the overlay
	if (jQry(target).hasClass(BLOCK_DISMISS_CLASS)) {
		return false;
	}
	if (pfxInst.st.dismissOnClickBg) {
		if (target === pfxInst.bgShade[0] || target === pfxInst.wrapper[0]) {
			return pfxInst.st.dismissOnClickBg;
		}
	}
	return jQry(target).parents('.' + popFx + '-content').length === 0 && pfxInst.st.dismissOnClickContent;
};
PopEffect.prototype.parseItem = function(idx) {
	// Parses an item from the contentElements array
	if (idx === undefined) {
		idx = pfxInst.currentIndex;
	}
	var item = pfxInst.contentElements[idx];
	if (!item.el) {
		item = { el: jQry(item).addClass(popFx + '-item') };
	}
	if (!item.type) {
		item.type = item.el.attr('data-' + popFx + '-type') || item.el.attr('type');
		if (!item.type) {
			if (item.el[0].tagName === 'A') {
				item.type = 'image';
			} else {
				item.type = 'inline';
			}
		}
	}
	item.parsed = true;
	pfxInst.contentElements[idx] = item;
	return item;
};
PopEffect.prototype._openIfNoContent = function(params) {
	// Placeholder for open if no content is loaded
	if (pfxInst.displayContent === null) {
		pfxInst.display(params);
	}
};


jQry.fn.dynamicOverlay = function(options) {
	_ensureSingleton();
	var element = jQry(this);
	if (typeof options === 'string') {
		if (options === 'open') {
			var params = {};
			if (element && element.length) {
				params.contentElements = element;
				params.triggerElement = element;
			}
			pfxInst.display(jQry.extend(true, {}, options, params));
		}
	} else {
		pfxInst.display(jQry.extend(true, {}, options, {contentElements: element, triggerElement: element}));
	}
	return this;
};

jQry(document).on('click' + EVT_NAMESPACE, '[data-' + popFx + '-trigger]', function(e) {
	var target = jQry(this);
	var triggerOptions = jQry.extend(true, {}, target.data(popFx + '-options') || {}, {
		contentElements: target.attr('href') || target.attr('data-' + popFx + '-src'),
		triggerElement: target
	});
	_ensureSingleton();
	pfxInst.display(triggerOptions);
	e.preventDefault();
});

}(window.jQuery));