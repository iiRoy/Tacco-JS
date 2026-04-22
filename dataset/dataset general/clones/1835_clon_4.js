(function( $) {

// New global object for our utilities
var Aegis = Aegis || {};
if ( Aegis.releaseIdentifier ) {
	return; // Prevent duplicate loading if already defined
}

// Versioning
Aegis.releaseIdentifier = "1.8.13-Aegis";

// Key mapping (equivalent to $.ui.keyCode)
Aegis.KeyMap = {
	ALTERNATE: 18,
	BACK_SPACE: 8,
	CAPITAL_LOCK: 20,
	DELIMITER: 188,
	CONTROL_KEY: 91, // Left Command/Windows
	LEFT_CONTROL_KEY: 91,
	RIGHT_CONTROL_KEY: 93,
	MODIFIER: 17, // Ctrl
	ERASE: 46,
	BELOW: 40,
	FINAL: 35,
	EXECUTE: 13,
	ESCAPE_KEY: 27,
	START: 36,
	INSERT_KEY: 45,
	LEFTWARD: 37,
	CONTEXT_MENU: 93, // Right Command/Windows
	NUM_ADD: 107,
	NUM_DECIMAL: 110,
	NUM_DIVIDE: 111,
	NUM_ENTER: 108,
	NUM_MULTIPLY: 106,
	NUM_SUBTRACT: 109,
	PAGE_DOWN_KEY: 34,
	PAGE_UP_KEY: 33,
	DOT: 190,
	RIGHTWARD: 39,
	SHIFT_KEY: 16,
	BLANK_SPACE: 32,
	TABULATOR: 9,
	ABOVE: 38,
	OS_KEY: 91 // Windows/Command
};

// --- DOM Manipulation & Utilities (replacing $.fn extensions) ---
// This provides a new chainable API that wraps jQuery collections.

function ElementOperation(elements) {
    this.collection = elements instanceof $ ? elements : $(elements);
}

ElementOperation.prototype = {
    // Replaces $.fn.focus
    setFocusWithDelay: function(duration, cb) {
        if (typeof duration === "number") {
            this.collection.each(function() {
                var currentElement = this;
                setTimeout(function() {
                    $(currentElement).focus();
                    if (cb) {
                        cb.call(currentElement);
                    }
                }, duration);
            });
            return this;
        } else {
            // Original uses _focus (stored $.fn.focus).
            // Here, we'll just call focus directly on the jQuery collection.
            this.collection.focus.apply(this.collection, arguments);
            return this;
        }
    },

    // Replaces $.fn.scrollParent
    findScrollContainer: function() {
        var firstElement = this.collection.get(0);
        if (!firstElement) return $(document);

        var currentPosition = $(firstElement).css('position');
        var isAbsoluteOrFixed = (/(absolute|fixed)/).test(currentPosition);

        // Recursive function to traverse up the DOM
        var locateScrollableAncestor = function(element) {
            var el = $(element);
            var parent = el.parent();
            if (!parent.length || parent.get(0) === document.documentElement) {
                return $(document); // Reached document root
            }

            var parentPosition = parent.css('position');
            var computedStyle = window.getComputedStyle(parent.get(0));
            var overflowProps = computedStyle.overflow + computedStyle.overflowY + computedStyle.overflowX;
            var hasScroll = (/(auto|scroll)/).test(overflowProps);

            if (isAbsoluteOrFixed) {
                // For absolutely/fixed positioned elements, find a positioned parent with scroll
                if (hasScroll && (/(relative|absolute|fixed)/).test(parentPosition)) {
                    return parent;
                }
            } else {
                // For static/relative elements, find any scrollable parent
                if (hasScroll) {
                    return parent;
                }
            }
            return locateScrollableAncestor(parent);
        };

        var result = locateScrollableAncestor(firstElement);
        // If element is fixed, or no scroll parent found, return document
        if ((/(fixed)/).test(currentPosition) || !result.length) {
            return $(document);
        }
        return result;
    },

    // Replaces $.fn.zIndex
    getOrSetStackOrder: function(value) {
        if (value !== undefined) {
            this.collection.css("zIndex", value);
            return this;
        }

        if (!this.collection.length) {
            return 0;
        }

        var current = $(this.collection.get(0));
        var orderValue;

        while (current.length && current.get(0) !== document) {
            var pos = current.css("position");
            if (pos === "absolute" || pos === "relative" || pos === "fixed") {
                orderValue = parseInt(current.css("zIndex"), 10);
                if (!isNaN(orderValue) && orderValue !== 0) {
                    return orderValue;
                }
            }
            current = current.parent();
        }
        return 0;
    },

    // Replaces $.fn.disableSelection
    preventTextSelection: function() {
        var eventType = Aegis.capabilities.canPreventSelectStart ? "selectstart" : "mousedown";
        this.collection.on(eventType + ".aegis-noSelect", function(evt) {
            evt.preventDefault();
        });
        return this;
    },

    // Replaces $.fn.enableSelection
    allowTextSelection: function() {
        this.collection.off(".aegis-noSelect");
        return this;
    }
};

// Helper for dimension calculations (replaces 'reduce' and part of $.each for Width/Height)
function calculateAdjustedDimension(element, baseSize, includeBorder, includeMargin, dimensionType) {
    var computed = window.getComputedStyle(element);
    var firstSide = dimensionType === 'width' ? 'Left' : 'Top';
    var secondSide = dimensionType === 'width' ? 'Right' : 'Bottom';
    
    var paddingVal = (parseFloat(computed['padding' + firstSide]) || 0) + (parseFloat(computed['padding' + secondSide]) || 0);
    var borderVal = includeBorder ? ((parseFloat(computed['border' + firstSide + 'Width']) || 0) + (parseFloat(computed['border' + secondSide + 'Width']) || 0)) : 0;
    var marginVal = includeMargin ? ((parseFloat(computed['margin' + firstSide]) || 0) + (parseFloat(computed['margin' + secondSide]) || 0)) : 0;

    return baseSize - (paddingVal + borderVal + marginVal);
}

// Dimension methods (replacing innerWidth, outerWidth, innerHeight, outerHeight)
var dimensionNames = ["Width", "Height"];
var originalJQueryDimensionMethods = {
    inner: { Width: $.fn.innerWidth, Height: $.fn.innerHeight },
    outer: { Width: $.fn.outerWidth, Height: $.fn.outerHeight }
};

dimensionNames.forEach(function(dimName) {
    var lowerDimName = dimName.toLowerCase();

    ElementOperation.prototype["fetchInner" + dimName] = function(newSize) {
        if (newSize === undefined) {
            return originalJQueryDimensionMethods.inner[dimName].call(this.collection);
        }
        this.collection.each(function() {
            var finalSize = calculateAdjustedDimension(this, newSize, false, false, lowerDimName);
            $(this).css(lowerDimName, finalSize + "px");
        });
        return this;
    };

    ElementOperation.prototype["fetchOuter" + dimName] = function(newSize, withMargin) {
        if (typeof newSize !== "number") {
            return originalJQueryDimensionMethods.outer[dimName].call(this.collection, newSize);
        }
        this.collection.each(function() {
            var finalSize = calculateAdjustedDimension(this, newSize, true, withMargin, lowerDimName);
            $(this).css(lowerDimName, finalSize + "px");
        });
        return this;
    };
});

// A factory function to create ElementOperation instances
Aegis.operate = function(selector) {
    return new ElementOperation(selector);
};


// --- Selector Predicates (replacing $.expr[ ":" ]) ---

function isElementVisible(targetElement) {
    return !$(targetElement).parents().addBack().filter(function() {
        // Using jQuery's :hidden for consistency with original behavior in this context.
        // A truly native implementation would check getComputedStyle for display/visibility.
        return $(this).css("visibility") === "hidden" || $(this).is(":hidden");
    }).length;
}

function isElementInteractable(currentElement, hasTabIndexAttribute) {
    var tagName = currentElement.nodeName.toLowerCase();

    if ("area" === tagName) {
        var parentMap = currentElement.parentNode;
        var mapIdentifier = parentMap.name;
        if (!currentElement.href || !mapIdentifier || parentMap.nodeName.toLowerCase() !== "map") {
            return false;
        }
        var linkedImage = $( "img[usemap=#" + mapIdentifier + "]" )[0];
        return !!linkedImage && isElementVisible(linkedImage);
    }

    var isInputLike = ( /input|select|textarea|button|object/.test( tagName ) );
    var canReceiveFocus = isInputLike
        ? !currentElement.disabled
        : "a" == tagName
            ? currentElement.href || hasTabIndexAttribute
            : hasTabIndexAttribute;

    return canReceiveFocus && isElementVisible(currentElement);
}

Aegis.selectorFilters = {
    // Replaces :data(key)
    hasData: function(domElement, key) {
        return !!$.data(domElement, key);
    },
    // Replaces :focusable
    canBeFocused: function(domElement) {
        var tabIndexVal = $.attr(domElement, "tabindex");
        return isElementInteractable(domElement, !isNaN(tabIndexVal));
    },
    // Replaces :tabbable
    canBeTabbed: function(domElement) {
        var tabIndexVal = $.attr(domElement, "tabindex");
        var isIndexNotNum = isNaN(tabIndexVal);
        return (isIndexNotNum || tabIndexVal >= 0) && Aegis.selectorFilters.canBeFocused(domElement);
    }
};

// We need to integrate these into jQuery's selector engine in a different way.
// Instead of extending $.expr[':'], we'll create a custom filter function
// or expect users to call Aegis.selectorFilters directly.
// For Type IV, let's make a custom filter utility that wraps jQuery's filter.
Aegis.filterElements = function(elements, filterName, arg) {
    if (Aegis.selectorFilters[filterName]) {
        return $(elements).filter(function() {
            return Aegis.selectorFilters[filterName](this, arg);
        });
    }
    return $(elements); // No custom filter found, return original collection
};


// --- Capability Detection (replacing $.support) ---
Aegis.capabilities = {};
$(function() {
    var testBody = document.body;
    var testDiv = testBody.appendChild(document.createElement("div"));

    Object.assign(testDiv.style, {
        minHeight: "100px",
        height: "auto",
        padding: "0",
        borderWidth: "0"
    });

    Aegis.capabilities.supportsMinHeight = testDiv.offsetHeight === 100;
    Aegis.capabilities.canPreventSelectStart = "onselectstart" in testDiv;

    testBody.removeChild(testDiv).style.display = "none";
});


// --- General Utilities (replacing $.ui deprecated) ---
Aegis.generalUtils = {
    // Replaces $.ui.plugin (very complex, simplified to a proxy pattern)
    componentHook: {
        register: function(componentName, hookOption, callbackList) {
            var proto = Aegis.componentRegistry.getComponentProto(componentName);
            if (!proto) return;
            proto.eventHooks = proto.eventHooks || {};
            for (var eventName in callbackList) {
                proto.eventHooks[eventName] = proto.eventHooks[eventName] || [];
                proto.eventHooks[eventName].push([hookOption, callbackList[eventName]]);
            }
        },
        invoke: function(instanceRef, eventName, args) {
            var hooks = instanceRef.eventHooks && instanceRef.eventHooks[eventName];
            if (!hooks || !instanceRef.domElement[0].parentNode) {
                return;
            }
            for (var i = 0; i < hooks.length; i++) {
                if (instanceRef.settings[hooks[i][0]]) { // Check if option is enabled
                    hooks[i][1].apply(instanceRef.domElement, args);
                }
            }
        }
    },

    // Replaces $.ui.contains
    elementsContain: function(containerNode, childNode) {
        return containerNode.compareDocumentPosition ?
            (containerNode.compareDocumentPosition(childNode) & 16) : // Node.DOCUMENT_POSITION_CONTAINS
            (containerNode !== childNode && containerNode.contains(childNode));
    },

    // Replaces $.ui.hasScroll
    hasScrollableContent: function(targetElement, axis) {
        if ($(targetElement).css("overflow") === "hidden") {
            return false;
        }

        var scrollProp = (axis && axis === "left") ? "scrollLeft" : "scrollTop";
        var hasContent = false;

        if (targetElement[scrollProp] > 0) {
            return true;
        }

        // Test if scroll is possible by temporarily setting it
        targetElement[scrollProp] = 1;
        hasContent = (targetElement[scrollProp] > 0);
        targetElement[scrollProp] = 0;
        return hasContent;
    },

    // Replaces $.ui.isOverAxis
    isPointOverAxis: function(coordinate, boundary, extent) {
        return (coordinate > boundary) && (coordinate < (boundary + extent));
    },

    // Replaces $.ui.isOver
    isPointWithinArea: function(yCoord, xCoord, topBoundary, leftBoundary, areaHeight, areaWidth) {
        return Aegis.generalUtils.isPointOverAxis(yCoord, topBoundary, areaHeight) &&
               Aegis.generalUtils.isPointOverAxis(xCoord, leftBoundary, areaWidth);
    }
};


// --- Component System (replacing $.widget, $.Widget, $.widget.bridge) ---

// Patch for element removal event (replaces $.cleanData or $.fn.remove)
// This is a direct override of jQuery's internal method.
if ( $.fn.jquery && parseFloat($.fn.jquery) >= 1.4 && $.cleanData ) {
	var oldCleanDataRoutine = $.cleanData;
	$.cleanData = function( domElements ) {
		for ( var idx = 0, currentEl; (currentEl = domElements[idx]) != null; idx++ ) {
			$( currentEl ).triggerHandler( "componentRemoved" ); // New event name
		}
		oldCleanDataRoutine( domElements );
	};
} else { // For older jQuery versions or if cleanData is absent
	var oldRemoveRoutine = $.fn.remove;
	$.fn.remove = function( selectorToMatch, preserveData ) {
		return this.each(function() {
			if ( !preserveData ) {
				if ( !selectorToMatch || $.filter( selectorToMatch, [ this ] ).length ) {
					$( "*", this ).add( [ this ] ).each(function() {
						$( this ).triggerHandler( "componentRemoved" );
					});
				}
			}
			return oldRemoveRoutine.call( $(this), selectorToMatch, preserveData );
		});
	};
}

// Base Component (replaces $.Widget)
Aegis.BaseComponent = function( settings, domElement ) {
    if ( arguments.length ) {
        this._initComponent( settings, domElement );
    }
};

Aegis.BaseComponent.prototype = {
    instanceName: "baseComponent",
    eventPrefix: "",
    settings: {
        disabled: false
    },
    _initComponent: function( userSettings, domElement ) {
        $.data( domElement, this.instanceName, this ); // Store instance on element
        this.domElement = $( domElement );
        this.settings = $.extend( true, {},
            this.settings,
            this._getComponentSettings(),
            userSettings );

        var selfRef = this;
        this.domElement.bind( "componentRemoved." + this.instanceName, function() {
            selfRef.dispose();
        });

        this._createImplementation();
        this._triggerComponentEvent( "creation" );
        this._startOperation();
    },
    _getComponentSettings: function() {
        return $.metadata && $.metadata.get( this.domElement[0] )[ this.instanceName ];
    },
    _createImplementation: function() {}, // Placeholder for component specific creation logic
    _startOperation: function() {}, // Placeholder for component specific initialization

    dispose: function() {
        this.domElement
            .unbind( "." + this.instanceName )
            .removeData( this.instanceName );
        this.getComponentRoot()
            .unbind( "." + this.instanceName )
            .removeAttr( "aria-disabled" )
            .removeClass(
                this.baseClass + "-disabled " +
                "ui-state-disabled" ); // Retaining ui-state-disabled for compatibility with jQuery UI themes
    },

    getComponentRoot: function() {
        return this.domElement;
    },

    adjustSettings: function( key, value ) {
        var currentSettings = key;
        if (typeof key === 'string' && value !== undefined) {
             currentSettings = {};
             currentSettings[key] = value;
        }
        this.settings = $.extend(true, {}, this.settings, currentSettings);
        return this;
    },

    _triggerComponentEvent: function( eventName, eventData, originalEvent ) {
        var eventObj = $.Event( originalEvent );
        eventObj.type = ( this.eventPrefix + eventName ).toLowerCase();
        eventObj.target = this.domElement[0];
        var defaultPrevented = this.domElement.triggerHandler( eventObj, eventData );
        return !( defaultPrevented && eventObj.isDefaultPrevented() );
    }
};

// Component Registry (replaces $.widget constructor creation and $.ui.namespace)
Aegis.componentRegistry = {
    _componentMap: {}, // Stores constructors by componentName
    getComponentProto: function(name) {
        var constructor = this._componentMap[name];
        return constructor ? constructor.prototype : null;
    },
    createComponent: function( identifier, baseConstructor, protoDefinition ) {
        var parts = identifier.split( "." );
        var moduleName = parts[0]; // e.g., 'myNamespace'
        var componentName = parts[1]; // e.g., 'myComponent'
        var fullIdentifier = moduleName + "-" + componentName; // e.g., 'myNamespace-myComponent'

        if ( !protoDefinition ) {
            protoDefinition = baseConstructor;
            baseConstructor = Aegis.BaseComponent;
        }

        // Create selector for component (replaces $.expr[':'][fullName])
        $.expr[ ":" ][ fullIdentifier ] = function( el ) {
            return !!$.data( el, componentName );
        };

        // Ensure namespace exists on jQuery object
        $[ moduleName ] = $[ moduleName ] || {};
        // Define the component constructor within the namespace
        $[ moduleName ][ componentName ] = function( userSettings, el ) {
            if ( arguments.length ) {
                this._initComponent( userSettings, el );
            }
        };

        var baseInstance = new baseConstructor();
        baseInstance.settings = $.extend( true, {}, baseInstance.settings ); // Deep clone base settings

        // Merge prototypes to create the new component's prototype
        $[ moduleName ][ componentName ].prototype = $.extend( true, baseInstance, {
            namespaceId: moduleName,
            instanceName: componentName,
            eventPrefix: $[ moduleName ][ componentName ].prototype.eventPrefix || componentName,
            baseClass: fullIdentifier
        }, protoDefinition );

        this._componentMap[componentName] = $[ moduleName ][ componentName ]; // Store constructor for lookup
        Aegis.componentRegistry.registerJQueryBridge( componentName, $[ moduleName ][ componentName ] );
    },

    // JQuery Bridge (replaces $.widget.bridge)
    registerJQueryBridge: function( componentName, componentConstructor ) {
        $.fn[ componentName ] = function( userOptions ) {
            var isMethodCall = typeof userOptions === "string";
            var methodArgs = Array.prototype.slice.call( arguments, 1 );
            var resultValue = this;

            userOptions = !isMethodCall && methodArgs.length ?
                $.extend.apply( null, [ true, userOptions ].concat(methodArgs) ) :
                userOptions;

            if ( isMethodCall && userOptions.charAt( 0 ) === "_" ) {
                return resultValue; // Prevent calls to internal methods (e.g., _internalMethod)
            }

            if ( isMethodCall ) {
                this.each(function() {
                    var componentInstance = $.data( this, componentName );
                    var methodReturn;
                    if ( componentInstance && typeof componentInstance[userOptions] === "function" ) {
                        methodReturn = componentInstance[ userOptions ].apply( componentInstance, methodArgs );
                    }
                    // The original had error throwing for non-existent instances/methods.
                    // For Type IV, we omit the error throwing but maintain the return logic.

                    if ( methodReturn !== componentInstance && methodReturn !== undefined ) {
                        resultValue = methodReturn;
                        return false; // Break .each loop if a non-chainable value is returned
                    }
                });
            } else {
                this.each(function() {
                    var existingInstance = $.data( this, componentName );
                    if ( existingInstance ) {
                        existingInstance.adjustSettings( userOptions || {} )._startOperation();
                    } else {
                        $.data( this, componentName, new componentConstructor( userOptions, this ) );
                    }
                });
            }
            return resultValue;
        };
    }
};

// Expose Aegis globally if not using a module system
// window.Aegis = Aegis; // Uncomment if Aegis needs to be a global variable

})( jQuery );