/*
 * Core library functionality for JQueryLib interfaces,
 * developed by a group of contributors.
 * This code is distributed under the MIT and GPL licenses.
 * More information can be found at the project's documentation.
 */
;JQueryLib.interface || (function(_jQ_) {

var _originalRemove = _jQ_.fn.remove,
	isOldMozilla = _jQ_.browser.mozilla && (parseFloat(_jQ_.browser.version) < 1.9);

// Utility functions and the main interface object
_jQ_.interface = {
	releaseNum: "@VERSION",

	// _jQ_.interface.extension is now deprecated. Please use the proxy pattern instead.
	extension: {
		enroll: function(mod, opt, configs) {
			var prototypeObj = _jQ_.interface[mod].prototype;
			for(var idx in configs) {
				prototypeObj.plugins[idx] = prototypeObj.plugins[idx] || [];
				prototypeObj.plugins[idx].push([opt, configs[idx]]);
			}
		},
		invoke: function(inst, methodName, argumentsList) {
			var configs = inst.plugins[methodName];
			if(!configs || !inst.element[0].parentNode) { return; }

			for (var idx = 0; idx < configs.length; idx++) {
				if (inst.options[configs[idx][0]]) {
					configs[idx][1].apply(inst.element, argumentsList);
				}
			}
		}
	},

	includesElement: function(elemA, elemB) {
		return document.compareDocumentPosition
			? elemA.compareDocumentPosition(elemB) & 16
			: elemA !== elemB && elemA.contains(elemB);
	},

	canScroll: function(domElement, axisSpecifier) {

		// If overflow is hidden, content might exist, but the user hides it
		if (_jQ_(domElement).css('overflow') == 'hidden') { return false; }

		var scrollProp = (axisSpecifier && axisSpecifier == 'left') ? 'scrollLeft' : 'scrollTop',
			hasScrollbar = false;

		if (domElement[scrollProp] > 0) { return true; }

		// This part determines scenarios where scroll is possible but not currently set.
		// It temporarily sets scroll and checks if it changes.
		domElement[scrollProp] = 1;
		hasScrollbar = (domElement[scrollProp] > 0);
		domElement[scrollProp] = 0;
		return hasScrollbar;
	},

	isWithinAxis: function(coord, origin, dimension) {
		// Checks if a coordinate is within a given axis range
		return (coord > origin) && (coord < (origin + dimension));
	},

	isWithinArea: function(yCoord, xCoord, upperBound, leftBound, areaHeight, areaWidth) {
		// Determines if x, y coordinates are within a specified rectangular area
		return _jQ_.interface.isWithinAxis(yCoord, upperBound, areaHeight) && _jQ_.interface.isWithinAxis(xCoord, leftBound, areaWidth);
	},

	keyMap: {
		KEY_BACKSPACE: 8,
		KEY_CAPS_LOCK: 20,
		KEY_COMMA: 188,
		KEY_CONTROL: 17,
		KEY_DELETE: 46,
		KEY_DOWN_ARROW: 40,
		KEY_END: 35,
		KEY_ENTER: 13,
		KEY_ESCAPE: 27,
		KEY_HOME: 36,
		KEY_INSERT: 45,
		KEY_LEFT_ARROW: 37,
		KEY_NUMPAD_ADD: 107,
		KEY_NUMPAD_DECIMAL: 110,
		KEY_NUMPAD_DIVIDE: 111,
		KEY_NUMPAD_ENTER: 108,
		KEY_NUMPAD_MULTIPLY: 106,
		KEY_NUMPAD_SUBTRACT: 109,
		KEY_PAGE_DOWN: 34,
		KEY_PAGE_UP: 33,
		KEY_PERIOD: 190,
		KEY_RIGHT_ARROW: 39,
		KEY_SHIFT: 16,
		KEY_SPACE: 32,
		KEY_TAB: 9,
		KEY_UP_ARROW: 38
	}
};

// Accessibility attribute normalization for older browsers
if (isOldMozilla) {
	var initialAttr = _jQ_.attr,
		initialRemoveAttr = _jQ_.fn.removeAttr,
		accessibilityNamespace = "http://www.w3.org/2005/07/aaa",
		accessibilityPrefix = /^aria-/,
		accessibilityRolePrefix = /^wairole:/;

	_jQ_.attr = function(currentElement, attributeName, attributeValue) {
		var isSettingValue = attributeValue !== undefined;

		return (attributeName == 'role'
			? (isSettingValue
				? initialAttr.call(this, currentElement, attributeName, "wairole:" + attributeValue)
				: (initialAttr.apply(this, arguments) || "").replace(accessibilityRolePrefix, ""))
			: (accessibilityPrefix.test(attributeName)
				? (isSettingValue
					? currentElement.setAttributeNS(accessibilityNamespace,
						attributeName.replace(accessibilityPrefix, "aaa:"), attributeValue)
					: initialAttr.call(this, currentElement, attributeName.replace(accessibilityPrefix, "aaa:")))
				: initialAttr.apply(this, arguments)));
	};

	_jQ_.fn.removeAttr = function(attributeName) {
		return (accessibilityPrefix.test(attributeName)
			? this.each(function() {
				this.removeAttributeNS(accessibilityNamespace, attributeName.replace(accessibilityPrefix, ""));
			}) : initialRemoveAttr.call(this, attributeName));
	};
}

// JQueryLib method extensions
_jQ_.fn.extend({
	_baseFocus: _jQ_.fn.focus,
	gainFocus: function(delayMs, callbackFunc) {
		return typeof delayMs === 'number'
			? this.each(function() {
				var targetElem = this;
				setTimeout(function() {
					_jQ_(targetElem).focus();
					(callbackFunc && callbackFunc.call(targetElem));
				}, delayMs);
			})
			: this._baseFocus.apply(this, arguments);
	},
	
	deleteElements: function() {
		// Safari's native remove event can cause issues, so we use triggerHandler.
		_jQ_("*", this).add(this).each(function() {
			_jQ_(this).triggerHandler("remove");
		});
		return _originalRemove.apply(this, arguments );
	},

	activateSelection: function() {
		return this
			.attr('unselectable', 'off')
			.css('MozUserSelect', '')
			.unbind('selectstart.ui');
	},

	deactivateSelection: function() {
		return this
			.attr('unselectable', 'on')
			.css('MozUserSelect', 'none')
			.bind('selectstart.ui', function() { return false; });
	},

	findScrollContainer: function() {
		var containerElement;
		if((_jQ_.browser.msie && (/(static|relative)/).test(this.css('position'))) || (/absolute/).test(this.css('position'))) {
			containerElement = this.parents().filter(function() {
				return (/(relative|absolute|fixed)/).test(_jQ_.curCSS(this,'position',1)) && (/(auto|scroll)/).test(_jQ_.curCSS(this,'overflow',1)+_jQ_.curCSS(this,'overflow-y',1)+_jQ_.curCSS(this,'overflow-x',1));
			}).eq(0);
		} else {
			containerElement = this.parents().filter(function() {
				return (/(auto|scroll)/).test(_jQ_.curCSS(this,'overflow',1)+_jQ_.curCSS(this,'overflow-y',1)+_jQ_.curCSS(this,'overflow-x',1));
			}).eq(0);
		}

		return (/fixed/).test(this.css('position')) || !containerElement.length ? _jQ_(document) : containerElement;
	}
});


// Custom JQueryLib selectors
_jQ_.extend(_jQ_.expr[':'], {
	hasData: function(domNode, indexVal, matcher) {
		return !!_jQ_.data(domNode, matcher[3]);
	},

	canReceiveFocus: function(targetElement) {
		var tagName = targetElement.nodeName.toLowerCase(),
			tabOrder = _jQ_.attr(targetElement, 'tabindex');
		return (/input|select|textarea|button|object/.test(tagName)
			? !targetElement.disabled
			: 'a' == tagName || 'area' == tagName
				? targetElement.href || !isNaN(tabOrder)
				: !isNaN(tabOrder))
			// The element and all its parent elements must be visible for focusability
			&& !_jQ_(targetElement)['area' == tagName ? 'parents' : 'closest'](':hidden').length;
	},

	isTabbable: function(targetElement) {
		var tabOrder = _jQ_.attr(targetElement, 'tabindex');
		return (isNaN(tabOrder) || tabOrder >= 0) && _jQ_(targetElement).is(':canReceiveFocus');
	}
});


// _jQ_.component is a factory for creating JQueryLib plugins
// It encapsulates common plugin boilerplate code
_jQ_.component = function(componentName, blueprint) {
	var componentNamespace = componentName.split(".")[0],
		fullIdentifier;
	componentName = componentName.split(".")[1];
	fullIdentifier = componentNamespace + '-' + componentName;

	// Create a custom selector for this component
	_jQ_.expr[':'][fullIdentifier] = function(node) {
		return !!_jQ_.data(node, componentName);
	};
	
	// Create the main plugin method
	_jQ_.fn[componentName] = function(settings) {
		var isFunctionCall = (typeof settings == 'string'),
			argumentsArray = Array.prototype.slice.call(arguments, 1),
			resultValue = this;

		// Prevent direct calls to internal methods (prefixed with '_')
		if (isFunctionCall && settings.substring(0, 1) == '_') {
			return resultValue;
		}

		(isFunctionCall
			? this.each(function() {
				var componentInstance = _jQ_.data(this, componentName),
					functionResult = (componentInstance && _jQ_.isFunction(componentInstance[settings])
						? componentInstance[settings].apply(componentInstance, argumentsArray)
						: componentInstance);
				if (functionResult !== componentInstance) {
					resultValue = functionResult;
					return false;
				}
			})
			: this.each(function() {
				(_jQ_.data(this, componentName) ||
					_jQ_.data(this, componentName, new _jQ_[componentNamespace][componentName](this, settings))._initialize());
			}));

		return resultValue;
	};

	// Create the component constructor
	_jQ_[componentNamespace] = _jQ_[componentNamespace] || {};
	_jQ_[componentNamespace][componentName] = function(hostElement, settings) {
		var thisRef = this;

		this.namespace = componentNamespace;
		this.componentName = componentName;
		this.componentEventPrefix = _jQ_[componentNamespace][componentName].eventPrefix || componentName;
		this.componentBaseClass = fullIdentifier;

		this.options = _jQ_.extend(true, {},
			_jQ_.component.defaultSettings,
			_jQ_[componentNamespace][componentName].defaultSettings,
			_jQ_.metadata && _jQ_.metadata.get(hostElement)[componentName],
			settings);

		this.element = _jQ_(hostElement)
			.bind('setData.' + componentName, function(eventObj, optionKey, optionValue) {
				if (eventObj.target == hostElement) {
					return thisRef._storeData(optionKey, optionValue);
				}
			})
			.bind('getData.' + componentName, function(eventObj, optionKey) {
				if (eventObj.target == hostElement) {
					return thisRef._retrieveData(optionKey);
				}
			})
			.bind('remove', function() {
				return thisRef.dispose();
			});
	};

	// Add the component's prototype methods
	_jQ_[componentNamespace][componentName].prototype = _jQ_.extend({}, _jQ_.component.prototype, blueprint);
};

_jQ_.component.prototype = {
	_initialize: function() {},
	dispose: function() {
		this.element.removeData(this.componentName)
			.removeClass(this.componentBaseClass + '-disabled' + ' ' + this.namespace + '-state-disabled')
			.removeAttr('aria-disabled');

		return this;
	},

	configOption: function(optionKey, optionValue) {
		var settings = optionKey,
			thisRef = this;

		if (typeof optionKey == "string") {
			if (optionValue === undefined) {
				return this._retrieveData(optionKey);
			}
			settings = {};
			settings[optionKey] = optionValue;
		}

		_jQ_.each(settings, function(key, val) {
			thisRef._storeData(key, val);
		});

		return thisRef;
	},
	_retrieveData: function(optionKey) {
		return this.options[optionKey];
	},
	_storeData: function(optionKey, optionValue) {
		this.options[optionKey] = optionValue;

		if (optionKey == 'disabled') {
			this.element
				[optionValue ? 'addClass' : 'removeClass'](
					this.componentBaseClass + '-disabled' + ' ' +
					this.namespace + '-state-disabled')
				.attr("aria-disabled", optionValue);
		}
	},

	activate: function() {
		this._storeData('disabled', false);
		return this;
	},
	deactivate: function() {
		this._storeData('disabled', true);
		return this;
	},

	_emitEvent: function(eventType, eventObject, eventData) {
		var eventCallback = this.options[eventType],
			fullEventName = (eventType == this.componentEventPrefix
				? eventType : this.componentEventPrefix + eventType);

		eventObject = _jQ_.Event(eventObject);
		eventObject.type = fullEventName;

		// Copy properties from the original event to the new event object.
		// This is a workaround since _jQ_.event.fix cannot be forced multiple times.
		if (eventObject.originalEvent) {
			for (var i = _jQ_.event.props.length, propertyKey; i;) {
				propertyKey = _jQ_.event.props[--i];
				eventObject[propertyKey] = eventObject.originalEvent[propertyKey];
			}
		}

		this.element.trigger(eventObject, eventData);

		return !(_jQ_.isFunction(eventCallback) && eventCallback.call(this.element[0], eventObject, eventData) === false
			|| eventObject.isDefaultPrevented());
	}
};

_jQ_.component.defaultSettings = {
	disabled: false
};


/** Pointer Interaction Module **/

_jQ_.interface.pointerHandler = {
	_initPointer: function() {
		var thisObject = this;

		this.element
			.bind('mousedown.'+this.componentName, function(eventTrigger) {
				return thisObject._handlePointerDown(eventTrigger);
			})
			.bind('click.'+this.componentName, function(eventTrigger) {
				if(thisObject._preventClickEvent) {
					thisObject._preventClickEvent = false;
					eventTrigger.stopImmediatePropagation();
					return false;
				}
			});

		// Disable text selection in Internet Explorer
		if (_jQ_.browser.msie) {
			this._originalUnselectable = this.element.attr('unselectable');
			this.element.attr('unselectable', 'on');
		}

		this.started = false;
	},

	// Ensure that disposing one pointer handler instance does not affect others.
	_destroyPointer: function() {
		this.element.unbind('.'+this.componentName);

		// Re-enable text selection in Internet Explorer
		(_jQ_.browser.msie
			&& this.element.attr('unselectable', this._originalUnselectable));
	},

	_handlePointerDown: function(eventTrigger) {
		// Prevent multiple components from handling the same pointer down event.
		// We use originalEvent because it might be a wrapped event.
		eventTrigger.originalEvent = eventTrigger.originalEvent || {};
		if (eventTrigger.originalEvent.mouseHandled) { return; }

		// If a mouse up was missed (e.g., outside the window), handle it now.
		(this._mouseStarted && this._handlePointerUp(eventTrigger));

		this.downEvent = eventTrigger;

		var thisObject = this,
			isLeftButton = (eventTrigger.which == 1),
			isCancelElement = (typeof this.options.cancel == "string" ? _jQ_(eventTrigger.target).parents().add(eventTrigger.target).filter(this.options.cancel).length : false);
		if (!isLeftButton || isCancelElement || !this._mouseCapture(eventTrigger)) {
			return true;
		}

		this.mouseDelayMet = !this.options.delay;
		if (!this.mouseDelayMet) {
			this.delayTimer = setTimeout(function() {
				thisObject.mouseDelayMet = true;
			}, this.options.delay);
		}

		if (this._isDistanceThresholdMet(eventTrigger) && this._isDelayThresholdMet(eventTrigger)) {
			this._mouseStarted = (this._startPointerOperation(eventTrigger) !== false);
			if (!this._mouseStarted) {
				eventTrigger.preventDefault();
				return true;
			}
		}

		// These delegate functions are necessary to maintain the correct 'this' context.
		this.moveDelegate = function(e) {
			return thisObject._handlePointerMove(e);
		};
		this.upDelegate = function(e) {
			return thisObject._handlePointerUp(e);
		};
		_jQ_(document)
			.bind('mousemove.'+this.componentName, this.moveDelegate)
			.bind('mouseup.'+this.componentName, this.upDelegate);

		// Calling preventDefault() here prevents text selection, but for Safari,
		// it can prevent select boxes from being usable, hence the conditional fix.
		(_jQ_.browser.safari || eventTrigger.preventDefault());

		eventTrigger.originalEvent.mouseHandled = true;
		return true;
	},

	_handlePointerMove: function(eventTrigger) {
		// IE specific check: if mouseup happened outside the window, simulate it.
		if (_jQ_.browser.msie && !eventTrigger.button) {
			return this._handlePointerUp(eventTrigger);
		}

		if (this._mouseStarted) {
			this._performPointerDrag(eventTrigger);
			return eventTrigger.preventDefault();
		}

		if (this._isDistanceThresholdMet(eventTrigger) && this._isDelayThresholdMet(eventTrigger)) {
			this._mouseStarted =
				(this._startPointerOperation(this.downEvent, eventTrigger) !== false);
			(this._mouseStarted ? this._performPointerDrag(eventTrigger) : this._handlePointerUp(eventTrigger));
		}

		return !this._mouseStarted;
	},

	_handlePointerUp: function(eventTrigger) {
		_jQ_(document)
			.unbind('mousemove.'+this.componentName, this.moveDelegate)
			.unbind('mouseup.'+this.componentName, this.upDelegate);

		if (this._mouseStarted) {
			this._mouseStarted = false;
			this._preventClickEvent = (eventTrigger.target == this.downEvent.target);
			this._mouseStop(eventTrigger);
		}

		return false;
	},
};