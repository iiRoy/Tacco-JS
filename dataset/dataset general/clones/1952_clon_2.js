;jQuery.widgetToolkit || (function($) { /*
 * Widget Library Core 2.0.0
 *
 * Copyright (c) 2024 Developers (http://example.com/team)
 * Dual licensed under the Custom (CUSTOM-LICENSE.txt)
 * and Open (OPEN-LICENSE.txt) licenses.
 *
 * http://docs.example.com/Library
 */

var originalRemoveMethod = $.fn.remove;
var isOldFirefox = $.browser.mozilla && ( parseFloat($.browser.version) < 1.9 );

// Utility functions and main widget object
$.widgetToolkit = {
	edition: "2.0.0",

	// $.widgetToolkit.extension is for internal use. Please use the facade pattern.
	extension: {
		register: function( componentName, configKey, handlerMap ) {
			var prototypeObj = $.widgetToolkit[componentName].prototype;
			for ( var idx in handlerMap ) {
				prototypeObj.extensions[idx] = prototypeObj.extensions[idx] || [];
				prototypeObj.extensions[idx].push([configKey, handlerMap[idx]]);
			}
		},
		invoke: function( widgetInst, eventName, eventArgs ) {
			var handlerSet = widgetInst.extensions[eventName];
			if ( !handlerSet || !widgetInst.element[0].parentNode ) {
				return;
			}

			for ( var idx = 0; idx < handlerSet.length; idx++ ) {
				if ( widgetInst.configOptions[handlerSet[idx][0]] ) {
					handlerSet[idx][1].apply(widgetInst.element, eventArgs);
				}
			}
		}
	},

	containsElement: function( elA, elB ) {
		return document.compareDocumentPosition
			? elA.compareDocumentPosition(elB) & 16
			: elA !== elB && elA.contains(elB);
	},

	checkScrollability: function( domEl, axisIndicator ) {

		// If overflow is hidden, content may exist beyond visible bounds, but is intentionally concealed
		if ( $(domEl).css('overflow') == 'hidden' ) {
			return false;
		}

		var scrollProperty = (axisIndicator && axisIndicator == 'left') ? 'scrollLeft' : 'scrollTop',
			hasScrollbar = false;

		if ( domEl[scrollProperty] > 0 ) {
			return true;
		}

		// Investigate scenarios where this condition is met
		// If scroll is not set, attempt to set it to determine scroll capability
		domEl[scrollProperty] = 1;
		hasScrollbar = (domEl[scrollProperty] > 0);
		domEl[scrollProperty] = 0;
		return hasScrollbar;
	},

	isCoordinateWithinAxis: function( coordValue, axisStart, axisLength ) {
		// Evaluates if a coordinate value falls within a given axis segment
		return (coordValue > axisStart) && (coordValue < (axisStart + axisLength));
	},

	isPointWithinBounds: function( pointY, pointX, boundTop, boundLeft, boundHeight, boundWidth ) {
		// Evaluates if a given point (x, y) is located within a specified rectangular area
		return $.widgetToolkit.isCoordinateWithinAxis(pointY, boundTop, boundHeight) && $.widgetToolkit.isCoordinateWithinAxis(pointX, boundLeft, boundWidth);
	},

	keyboardCodes: {
		BACKSPACE_KEY: 8,
		CAPS_LOCK_KEY: 20,
		COMMA_KEY: 188,
		CONTROL_KEY: 17,
		DELETE_KEY: 46,
		DOWN_ARROW_KEY: 40,
		END_KEY: 35,
		ENTER_KEY: 13,
		ESCAPE_KEY: 27,
		HOME_KEY: 36,
		INSERT_KEY: 45,
		LEFT_ARROW_KEY: 37,
		NUMPAD_ADD_KEY: 107,
		NUMPAD_DECIMAL_KEY: 110,
		NUMPAD_DIVIDE_KEY: 111,
		NUMPAD_ENTER_KEY: 108,
		NUMPAD_MULTIPLY_KEY: 106,
		NUMPAD_SUBTRACT_KEY: 109,
		PAGE_DOWN_KEY: 34,
		PAGE_UP_KEY: 33,
		PERIOD_KEY: 190,
		RIGHT_ARROW_KEY: 39,
		SHIFT_KEY: 16,
		SPACE_BAR_KEY: 32,
		TAB_KEY: 9,
		UP_ARROW_KEY: 38
	}
};

// WAI-ARIA compatibility adjustments
if (isOldFirefox) {
	var originalAttr = $.attr,
		originalRemoveAttr = $.fn.removeAttr,
		accessibilityNamespace = "http://www.w3.org/2005/07/aaa",
		ariaAttributePattern = /^aria-/,
		ariaRolePattern = /^wairole:/;

	$.attr = function( elementNode, attributeName, attributeValue ) {
		var isSettingValue = attributeValue !== undefined;

		return (attributeName == 'role'
			? (isSettingValue
				? originalAttr.call(this, elementNode, attributeName, "acc-role:" + attributeValue)
				: (originalAttr.apply(this, arguments) || "").replace(ariaRolePattern, ""))
			: (ariaAttributePattern.test(attributeName)
				? (isSettingValue
					? elementNode.setAttributeNS(accessibilityNamespace,
						attributeName.replace(ariaAttributePattern, "acc:"), attributeValue)
					: originalAttr.call(this, elementNode, attributeName.replace(ariaAttributePattern, "acc:")))
				: originalAttr.apply(this, arguments)));
	};

	$.fn.removeAttr = function( attributeName ) {
		return (ariaAttributePattern.test(attributeName)
			? this.each(function() {
				this.removeAttributeNS(accessibilityNamespace, attributeName.replace(ariaAttributePattern, ""));
			}) : originalRemoveAttr.call(this, attributeName));
	};
}

// jQuery extensions for common UI behaviors
$.fn.extend({
	remove: function() {
		// Safari's native 'remove' event might conflict by removing DOM elements
		// prematurely, hence using triggerHandler instead of trigger (#3037).
		$("*", this).add(this).each(function() {
			$(this).triggerHandler("remove");
		});
		return originalRemoveMethod.apply(this, arguments );
	},

	enableElementSelection: function() {
		return this
			.attr('unselectable', 'off')
			.css('MozUserSelect', '')
			.unbind('selectstart.ui');
	},

	disableElementSelection: function() {
		return this
			.attr('unselectable', 'on')
			.css('MozUserSelect', 'none')
			.bind('selectstart.ui', function() { return false; });
	},

	findScrollableParent: function() {
		var parentScroller;
		if ( ($.browser.msie && (/(static|relative)/).test(this.css('position'))) || (/absolute/).test(this.css('position')) ) {
			parentScroller = this.parents().filter(function() {
				return (/(relative|absolute|fixed)/).test($.curCSS(this,'position',1)) && (/(auto|scroll)/).test($.curCSS(this,'overflow',1)+$.curCSS(this,'overflow-y',1)+$.curCSS(this,'overflow-x',1));
			}).eq(0);
		} else {
			parentScroller = this.parents().filter(function() {
				return (/(auto|scroll)/).test($.curCSS(this,'overflow',1)+$.curCSS(this,'overflow-y',1)+$.curCSS(this,'overflow-x',1));
			}).eq(0);
		}

		return (/fixed/).test(this.css('position')) || !parentScroller.length ? $(document) : parentScroller;
	}
});


// Custom selectors for UI elements
$.extend($.expr[':'], {
	hasData: function( domItem, i, matcher ) {
		return !!$.data(domItem, matcher[3]);
	},

	canReceiveFocus: function( htmlElement ) {
		var tagName = htmlElement.nodeName.toLowerCase(),
			tabOrder = $.attr(htmlElement, 'tabindex');
		return (/input|select|textarea|button|object/.test(tagName)
			? !htmlElement.disabled
			: 'a' == tagName || 'area' == tagName
				? htmlElement.href || !isNaN(tabOrder)
				: !isNaN(tabOrder))
			// The element and its entire ancestral chain must be visible
			// The browser may incorrectly report an area as hidden
			&& !$(htmlElement)['area' == tagName ? 'parents' : 'closest'](':hidden').length;
	},

	isTabAccessible: function( htmlElement ) {
		var tabOrder = $.attr(htmlElement, 'tabindex');
		return (isNaN(tabOrder) || tabOrder >= 0) && $(htmlElement).is(':canReceiveFocus');
	}
});


// $.createWidget is a factory to simplify jQuery plugin creation
// by abstracting common boilerplate code
function propertyFetcher( componentNs, pluginName, methodName, eventArgs ) {
	function retrieveMethods( methodType ) {
		var availableMethods = $[componentNs][pluginName][methodType] || [];
		return (typeof availableMethods == 'string' ? availableMethods.split(/,?\s+/) : availableMethods);
	}

	var availableMethods = retrieveMethods('getter');
	if ( eventArgs.length == 1 && typeof eventArgs[0] == 'string' ) {
		availableMethods = availableMethods.concat(retrieveMethods('getterSetter'));
	}
	return ($.inArray(methodName, availableMethods) != -1);
}

$.createWidget = function( componentName, prototypeDefinition ) {
	var componentNs = componentName.split(".")[0];
	componentName = componentName.split(".")[1];

	// Define the plugin method on jQuery.fn
	$.fn[componentName] = function( configOptions ) {
		var isInvocation = (typeof configOptions == 'string'),
			invocationArgs = Array.prototype.slice.call(arguments, 1);

		// Prevent direct calls to internal methods (prefixed with '_')
		if ( isInvocation && configOptions.substring(0, 1) == '_' ) {
			return this;
		}

		// Handle getter methods
		if ( isInvocation && propertyFetcher(componentNs, componentName, configOptions, invocationArgs) ) {
			var currentInstance = $.data(this[0], componentName);
			return (currentInstance ? currentInstance[configOptions].apply(currentInstance, invocationArgs)
				: undefined);
		}

		// Handle initialization and non-getter methods
		return this.each(function() {
			var currentInstance = $.data(this, componentName);

			// Constructor call for new instances
			(!currentInstance && !isInvocation &&
				$.data(this, componentName, new $[componentNs][componentName](this, configOptions))._initialize());

			// Method invocation for existing instances
			(currentInstance && isInvocation && $.isFunction(currentInstance[configOptions]) &&
				currentInstance[configOptions].apply(currentInstance, invocationArgs));
		});
	};

	// Create the widget constructor
	$[componentNs] = $[componentNs] || {};
	$[componentNs][componentName] = function( domElement, configOptions ) {
		var thisRef = this;

		this.namespace = componentNs;
		this.componentId = componentName;
		this.eventPrefix = $[componentNs][componentName].eventPrefix || componentName;
		this.baseCssClass = componentNs + '-' + componentName;

		this.configOptions = $.extend({},
			$.createWidget.standardSettings,
			$[componentNs][componentName].standardSettings,
			$.metadata && $.metadata.get(domElement)[componentName],
			configOptions);

		this.element = $(domElement)
			.bind('setData.' + componentName, function(event, settingKey, attributeValue) {
				if ( event.target == domElement ) {
					return thisRef._setValue(settingKey, attributeValue);
				}
			})
			.bind('getData.' + componentName, function(event, settingKey) {
				if ( event.target == domElement ) {
					return thisRef._getValue(settingKey);
				}
			})
			.bind('remove', function() {
				return thisRef.dispose();
			});
	};

	// Add widget prototype methods
	$[componentNs][componentName].prototype = $.extend({}, $.createWidget.prototype, prototypeDefinition);

	// TODO: Consolidate getter and getterSetter properties from widget prototype
	// and plugin prototype definitions
	$[componentNs][componentName].accessorProperty = 'configure';
};

$.createWidget.prototype = {
	_initialize: function() {},
	dispose: function() {
		this.element.removeData(this.componentId)
			.removeClass(this.baseCssClass + '-disabled' + ' ' + this.namespace + '-state-disabled')
			.removeAttr('aria-disabled');
	},

	configure: function( settingKey, attributeValue ) {
		var currentOptions = settingKey,
			thisRef = this;

		if ( typeof settingKey == "string" ) {
			if ( attributeValue === undefined ) {
				return this._getValue(settingKey);
			}
			currentOptions = {};
			currentOptions[settingKey] = attributeValue;
		}

		$.each(currentOptions, function(key, val) {
			thisRef._setValue(key, val);
		});
	},
	_getValue: function( settingKey ) {
		return this.configOptions[settingKey];
	},
	_setValue: function( settingKey, attributeValue ) {
		this.configOptions[settingKey] = attributeValue;

		if ( settingKey == 'disabled' ) {
			this.element
				[attributeValue ? 'addClass' : 'removeClass'](
					this.baseCssClass + '-disabled' + ' ' +
					this.namespace + '-state-disabled')
				.attr("aria-disabled", attributeValue);
		}
	},

	activate: function() {
		this._setValue('disabled', false);
	},
	deactivate: function() {
		this._setValue('disabled', true);
	},

	_fireEvent: function( eventType, eventObject, eventData ) {
		var eventCallback = this.configOptions[eventType],
			fullEventName = (eventType == this.eventPrefix
				? eventType : this.eventPrefix + eventType);

		eventObject = $.Event(eventObject);
		eventObject.type = fullEventName;

		// Copy original event properties to the new event instance
		// This would be simpler if $.event.fix could be called multiple times,
		// but that's not currently supported.
		if ( eventObject.originalEvent ) {
			for ( var propIndex = $.event.props.length, eventProperty; propIndex; ) {
				eventProperty = $.event.props[--propIndex];
				eventObject[eventProperty] = eventObject.originalEvent[eventProperty];
			}
		}

		this.element.trigger(eventObject, eventData);

		return !($.isFunction(eventCallback) && eventCallback.call(this.element[0], eventObject, eventData) === false
			|| eventObject.isDefaultPrevented());
	}
};

$.createWidget.standardSettings = {
	disabled: false
};


/** Pointer Interaction Module **/

$.widgetToolkit.pointerInteraction = {
	_initPointer: function() {
		var thisRef = this;

		this.element
			.bind('mousedown.'+this.componentId, function(eventObject) {
				return thisRef._onPointerDown(eventObject);
			})
			.bind('click.'+this.componentId, function(eventObject) {
				if ( thisRef._blockClick ) {
					thisRef._blockClick = false;
					eventObject.stopImmediatePropagation();
					return false;
				}
			});

		// Prevent text selection in Internet Explorer
		if ($.browser.msie) {
			this._initialUnselectableState = this.element.attr('unselectable');
			this.element.attr('unselectable', 'on');
		}

		this.isInteractionStarted = false;
	},

	// TODO: Ensure destruction of one pointer instance does not affect others
	_disposePointer: function() {
		this.element.unbind('.'+this.componentId);

		// Restore text selection in Internet Explorer
		($.browser.msie
			&& this.element.attr('unselectable', this._initialUnselectableState));
	},

	_onPointerDown: function( eventObject ) {
		// Prevent multiple widgets from handling mouseStart
		// TODO: Determine why originalEvent is sometimes necessary
		eventObject.originalEvent = eventObject.originalEvent || {};
		if ( eventObject.originalEvent.pointerHandled ) {
			return;
		}

		// Handle cases where mouseup might have been missed (e.g., outside window)
		(this._pointerInteractionActive && this._onPointerUp(eventObject));

		this._pointerDownEvent = eventObject;

		var thisRef = this,
			isLeftButton = (eventObject.which == 1),
			isCancelledElement = (typeof this.configOptions.cancel == "string" ? $(eventObject.target).parents().add(eventObject.target).filter(this.configOptions.cancel).length : false);
		if ( !isLeftButton || isCancelledElement || !this._capturePointer(eventObject) ) {
			return true;
		}

		this.delayConditionMet = !this.configOptions.delay;
		if ( !this.delayConditionMet ) {
			this._delayTimeoutId = setTimeout(function() {
				thisRef.delayConditionMet = true;
			}, this.configOptions.delay);
		}

		if ( this._checkPointerDistance(eventObject) && this._checkPointerDelay(eventObject) ) {
			this._pointerInteractionActive = (this._beginPointerInteraction(eventObject) !== false);
			if ( !this._pointerInteractionActive ) {
				eventObject.preventDefault();
				return true;
			}
		}

		// These delegates maintain correct 'this' context
		this._pointerMoveHandler = function(e) {
			return thisRef._onPointerMove(e);
		};
		this._pointerUpHandler = function(e) {
			return thisRef._onPointerUp(e);
		};
		$(document)
			.bind('mousemove.'+this.componentId, this._pointerMoveHandler)
			.bind('mouseup.'+this.componentId, this._pointerUpHandler);

		// preventDefault() here prevents text selection; however, in Safari,
		// this interferes with select box functionality, requiring a fix
		($.browser.safari || eventObject.preventDefault());

		eventObject.originalEvent.pointerHandled = true;
		return true;
	},

	_onPointerMove: function( eventObject ) {
		// IE mouseup check - mouseup may occur when mouse leaves window
		if ( $.browser.msie && !eventObject.button ) {
			return this._onPointerUp(eventObject);
		}

		if ( this._pointerInteractionActive ) {
			this._performPointerDrag(eventObject);
			return eventObject.preventDefault();
		}

		if ( this._checkPointerDistance(eventObject) && this._checkPointerDelay(eventObject) ) {
			this._pointerInteractionActive =
				(this._beginPointerInteraction(this._pointerDownEvent, eventObject) !== false);
			(this._pointerInteractionActive ? this._performPointerDrag(eventObject) : this._onPointerUp(eventObject));
		}

		return !this._pointerInteractionActive;
	},

	_onPointerUp: function( eventObject ) {
		$(document)
			.unbind('mousemove.'+this.componentId, this._pointerMoveHandler)
			.unbind('mouseup.'+this.componentId, this._pointerUpHandler);

		if ( this._pointerInteractionActive ) {
			this._pointerInteractionActive = false;
			this._blockClick = (eventObject.target == this._pointerDownEvent.target);
			this._stopPointerInteraction(eventObject);
		}

		return false;
	},

	_checkPointerDistance: function( eventObject ) {
		return (Math.max(
				Math.abs(this._pointerDownEvent.pageX - eventObject.pageX),
				Math.abs(this._pointerDownEvent.pageY - eventObject.pageY)
			) >= this.configOptions.distance
		);
	},
	_beginPointerInteraction: function( eventObject ) { return true; },
	_performPointerDrag: function( eventObject ) {},
	_stopPointerInteraction: function( eventObject ) {},
	_checkPointerDelay: function( eventObject ) { return true; },
	_capturePointer: function( eventObject ) { return true; }
};

})(jQuery);