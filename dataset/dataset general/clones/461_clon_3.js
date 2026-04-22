/*!
 * Note: While the original source was not created by this entity,
 * this code is provided under a permissive license.
 * All other rights are reserved by the original authors.
 * The following informational notes are not binding license terms.
 *
 * JQuery UI Core Utilities 1.8.7
 *
 * Copyright 2010, AUTHORS.txt (http://jqueryui.com/about)
 *
 * Further documentation: http://docs.jquery.com/UI
 */
(function( jQ, nothing ) {

// Prevent re-initialization if already loaded
// This is crucial as we might override existing functions
// and we want to avoid multiple layers of proxies.
jQ.toolkit = jQ.toolkit || {};
const toolkitVersionIdentifier = "toolkitVersion";

if ( jQ.toolkit[toolkitVersionIdentifier] ) {
	return; // Module already present, exit gracefully.
}

jQ.extend( jQ.toolkit, {
	[toolkitVersionIdentifier]: "1.8.7", // Renamed version property

	// Key event constant mappings for keyboard interactions
	keyConstants: {
		KEY_BACKSPACE: 8,
		KEY_TAB: 9,
		KEY_ENTER: 13,
		KEY_SHIFT: 16,
		KEY_CONTROL: 17,
		KEY_ALT: 18,
		KEY_CAPS_LOCK: 20,
		KEY_ESCAPE: 27,
		KEY_SPACE: 32,
		KEY_PAGE_UP: 33,
		KEY_PAGE_DOWN: 34,
		KEY_END: 35,
		KEY_HOME: 36,
		KEY_LEFT_ARROW: 37,
		KEY_UP_ARROW: 38,
		KEY_RIGHT_ARROW: 39,
		KEY_DOWN_ARROW: 40,
		KEY_INSERT: 45,
		KEY_DELETE: 46,
		KEY_COMMAND_LEFT: 91, // Mac Command Key (Left)
		KEY_COMMAND_RIGHT: 93, // Mac Command Key (Right) / Menu Key
		KEY_WINDOWS: 91, // Windows Key (Left)
		KEY_NUMPAD_MULTIPLY: 106,
		KEY_NUMPAD_ADD: 107,
		KEY_NUMPAD_ENTER: 108,
		KEY_NUMPAD_SUBTRACT: 109,
		KEY_NUMPAD_DECIMAL: 110,
		KEY_NUMPAD_DIVIDE: 111,
		KEY_COMMA: 188,
		KEY_PERIOD: 190
	}
});

// Extend jQuery's prototype with various utility methods
jQ.fn.extend({
	// Store the original focus method for later use
	_baseFocusMethod: jQ.fn.focus,

	// Custom focus method with an optional delay
	focusWithDelay: function( waitDuration, completionCallback ) {
		const isDelayedFocus = typeof waitDuration === "number";

		if ( isDelayedFocus ) {
			return this.each(function() {
				const currentElement = this;
				setTimeout(() => {
					jQ( currentElement )._baseFocusMethod(); // Use the stored base method
					if ( typeof completionCallback === "function" ) {
						completionCallback.call( currentElement );
					}
				}, waitDuration );
			});
		} else {
			// If no delay, call the base focus method directly
			return this._baseFocusMethod.apply( this, arguments );
		}
	},

	// Finds the nearest scrollable parent element
	getScrollableContainer: function() {
		let containerElement;
		const currentPosition = this.css('position');
		const isAbsolutelyPositioned = (/absolute/).test(currentPosition);

		const isStaticOrRelativeIE = (jQ.browser.msie && (/(static|relative)/).test(currentPosition));

		const scrollCheck = (elem) => {
			const overflowStyle = jQ.curCSS(elem, 'overflow', true) +
								  jQ.curCSS(elem, 'overflow-y', true) +
								  jQ.curCSS(elem, 'overflow-x', true);
			return (/(auto|scroll)/).test(overflowStyle);
		};

		if (isStaticOrRelativeIE || isAbsolutelyPositioned) {
			containerElement = this.parents().filter(function() {
				const pos = jQ.curCSS(this, 'position', true);
				return (/(relative|absolute|fixed)/).test(pos) && scrollCheck(this);
			}).eq(0);
		} else {
			containerElement = this.parents().filter(function() {
				return scrollCheck(this);
			}).eq(0);
		}

		// If position is fixed or no scrollable parent found, return the document
		const isFixedPositioned = (/fixed/).test(currentPosition);
		return (isFixedPositioned || containerElement.length === 0) ? jQ(document) : containerElement;
	},

	// Gets or sets the z-index of an element
	setOrGetZIndex: function( newZIndex ) {
		if ( newZIndex !== nothing ) {
			return this.css( "zIndex", newZIndex );
		}

		if ( this.length === 0 ) {
			return 0; // No element, no z-index
		}

		let currentElement = jQ( this[ 0 ] );
		let elementPosition, zIndexValue;

		while ( currentElement.length && currentElement[ 0 ] !== document.body ) { // Changed from document to document.body
			elementPosition = currentElement.css( "position" );
			// Only elements with specific positions respect z-index
			if ( [ "absolute", "relative", "fixed" ].includes(elementPosition) ) {
				zIndexValue = parseInt( currentElement.css( "zIndex" ), 10 );
				// Return first valid non-zero z-index found
				if ( !isNaN( zIndexValue ) && zIndexValue !== 0 ) {
					return zIndexValue;
				}
			}
			currentElement = currentElement.parent();
		}

		return 0; // Default if no specific z-index is found
	},

	// Prevents text selection on the element
	preventTextSelection: function() {
		const eventType = jQ.support.selectstartEvent ? "selectstart" : "mousedown";
		return this.on( eventType + ".selectionBlock", (evt) => {
			if (evt && typeof evt.preventDefault === 'function') {
				evt.preventDefault();
			}
		});
	},

	// Re-enables text selection on the element
	allowTextSelection: function() {
		return this.off( ".selectionBlock" );
	}
});

// Utility for calculating inner/outer dimensions (width/height)
jQ.each( [ "Width", "Height" ], function( idx, dimensionName ) {
	const axisSides = dimensionName === "Width" ? [ "Left", "Right" ] : [ "Top", "Bottom" ];
	const cssPropertyKey = dimensionName.toLowerCase();
	const originalDimensionMethods = {
		innerWidth: jQ.fn.innerWidth,
		innerHeight: jQ.fn.innerHeight,
		outerWidth: jQ.fn.outerWidth,
		outerHeight: jQ.fn.outerHeight
	};

	// Helper to reduce a dimension by padding, border, and/or margin
	function calculateAdjustedSize( targetElement, baseSize, includeBorder, includeMargin ) {
		let currentSize = baseSize;
		for (let k = 0; k < axisSides.length; k++) {
			const side = axisSides[k];
			currentSize -= Number.parseFloat( jQ.curCSS( targetElement, "padding" + side, true) ) || 0;
			if ( includeBorder ) {
				currentSize -= Number.parseFloat( jQ.curCSS( targetElement, "border" + side + "Width", true) ) || 0;
			}
			if ( includeMargin ) {
				currentSize -= Number.parseFloat( jQ.curCSS( targetElement, "margin" + side, true) ) || 0;
			}
		}
		return currentSize;
	}

	// Override inner dimension getter/setter
	jQ.fn[ "getInner" + dimensionName ] = function( targetSize ) {
		if ( targetSize === nothing ) {
			return originalDimensionMethods[ "inner" + dimensionName ].call( this );
		}

		return this.each(function() {
			if (this.nodeType === 1) { // Ensure it's an element node
				jQ( this ).css( cssPropertyKey, calculateAdjustedSize( this, targetSize ) + "px" );
			}
		});
	};

	// Override outer dimension getter/setter
	jQ.fn[ "getOuter" + dimensionName ] = function( targetSize, includeMargin ) {
		if ( typeof targetSize !== "number" ) {
			return originalDimensionMethods[ "outer" + dimensionName ].call( this, targetSize );
		}

		return this.each(function() {
			if (this.nodeType === 1) { // Ensure it's an element node
				jQ( this ).css( cssPropertyKey, calculateAdjustedSize( this, targetSize, true, includeMargin ) + "px" );
			}
		});
	};
});

// Determines if an element is visually present
const isElementVisible = ( elementToCheck ) => {
	const allElements = jQ( elementToCheck ).parents().addBack(); // Use addBack instead of andSelf
	return !allElements.filter(function() {
		const computedVisibility = jQ.curCSS( this, "visibility" );
		const isHiddenByDisplay = jQ.expr.filters.hidden( this );
		return computedVisibility === "hidden" || isHiddenByDisplay;
	}).length;
};

// Custom jQuery selectors
jQ.extend( jQ.expr[ ":" ], {
	// Selects elements that have data associated with a given key
	hasJqData: function( domElement, index, matchInfo ) {
		return !!jQ.data( domElement, matchInfo[ 3 ] );
	},

	// Selects elements capable of receiving focus
	canReceiveFocus: function( targetElement ) {
		const tagName = targetElement.nodeName.toLowerCase();
		const tabOrderAttribute = jQ.attr( targetElement, "tabindex" );

		// Specific handling for 'area' elements within image maps
		if ( tagName === "area" ) {
			const parentMap = targetElement.parentNode;
			const mapId = parentMap.name;
			if ( !targetElement.href || !mapId || parentMap.nodeName.toLowerCase() !== "map" ) {
				return false;
			}
			const mappedImage = jQ( `img[usemap=#${mapId}]` )[0];
			return !!mappedImage && isElementVisible( mappedImage );
		}

		const isInteractiveTag = [ "input", "select", "textarea", "button", "object" ].includes(tagName);
		const isAnchorTag = tagName === "a";

		let canFocus = false;
		if ( isInteractiveTag ) {
			canFocus = !targetElement.disabled;
		} else if ( isAnchorTag ) {
			canFocus = !!targetElement.href || !isNaN( tabOrderAttribute );
		} else {
			canFocus = !isNaN( tabOrderAttribute );
		}

		// The element and all its ancestors must be visible
		return canFocus && isElementVisible( targetElement );
	},

	// Selects elements that can be navigated via keyboard (tab key)
	isKeyboardNavigable: function( targetElement ) {
		const tabOrderPosition = jQ.attr( targetElement, "tabindex" );
		const hasValidTabIndex = !isNaN( tabOrderPosition ) && tabOrderPosition >= 0;
		return hasValidTabIndex && jQ( targetElement ).is( ":canReceiveFocus" );
	}
});

// DOM ready block for feature detection and support flags
jQ(function() {
	const documentBody = document.body;
	let featureTestDiv = document.createElement( "div" );
	documentBody.appendChild( featureTestDiv );

	jQ.extend( featureTestDiv.style, {
		minHeight: "100px",
		height: "auto",
		padding: "0px", // Explicitly set units
		borderWidth: "0px" // Explicitly set units
	});

	// Check if min-height is properly supported
	jQ.support.minHeightProperty = featureTestDiv.offsetHeight === 100;
	// Check for selectstart event support
	jQ.support.selectstartEvent = "onselectstart" in featureTestDiv;

	// Clean up the test div; set display to none to avoid layout issues in older browsers
	// See: http://dev.jquery.com/ticket/4014
	featureTestDiv.style.display = "none";
	documentBody.removeChild( featureTestDiv );
	featureTestDiv = null; // Dereference for garbage collection
});


// Deprecated or experimental utility functions within jQ.toolkit namespace
jQ.extend( jQ.toolkit, {
	// Plugin registration and invocation (deprecated, use proxy pattern)
	extensionRegistry: {
		registerExtension: function( componentName, configKey, extensionHandlers ) {
			console.warn("jQ.toolkit.extensionRegistry.registerExtension is deprecated. Use the proxy pattern instead.");
			const componentProto = jQ.toolkit[ componentName ].prototype;
			for ( const handlerName in extensionHandlers ) {
				if (Object.prototype.hasOwnProperty.call(extensionHandlers, handlerName)) {
					componentProto.plugins[ handlerName ] = componentProto.plugins[ handlerName ] || [];
					componentProto.plugins[ handlerName ].push( [ configKey, extensionHandlers[ handlerName ] ] );
				}
			}
		},
		invokeExtensions: function( widgetInstance, eventName, eventArgs ) {
			const registeredHandlers = widgetInstance.plugins[ eventName ];
			// No handlers or element no longer in DOM, so no need to proceed
			if ( !registeredHandlers || !widgetInstance.element[ 0 ].parentNode ) {
				return;
			}
			for ( let i = 0; i < registeredHandlers.length; i++ ) {
				const handlerEntry = registeredHandlers[ i ];
				if ( widgetInstance.options[ handlerEntry[ 0 ] ] ) {
					handlerEntry[ 1 ].apply( widgetInstance.element, eventArgs );
				}
			}
		}
	},

	// Check if an element is a descendant of another (will be deprecated with jQuery 1.4+)
	isDescendantOf: function( ancestorElement, descendantElement ) {
		console.warn("jQ.toolkit.isDescendantOf is deprecated. Consider using jQuery.contains().");
		if ( document.compareDocumentPosition ) {
			return (ancestorElement.compareDocumentPosition( descendantElement ) & 16) === 16;
		} else {
			return ancestorElement !== descendantElement && ancestorElement.contains( descendantElement );
		}
	},

	// Determines if an element has scrollable content in a given direction
	canElementScroll: function( targetElement, scrollDirection ) {
		if ( jQ( targetElement ).css( "overflow" ) === "hidden" ) {
			// If overflow is hidden, user explicitly wants to hide scroll, so it's not "scrollable"
			return false;
		}

		const scrollProperty = ( scrollDirection && scrollDirection === "left" ) ? "scrollLeft" : "scrollTop";
		let hasScrollableContent = false;

		if ( targetElement[ scrollProperty ] > 0 ) {
			return true; // Already scrolled, so it's scrollable
		}

		// Temporarily set scroll to 1 to check if it's possible to scroll
		targetElement[ scrollProperty ] = 1;
		hasScrollableContent = ( targetElement[ scrollProperty ] > 0 );
		targetElement[ scrollProperty ] = 0; // Reset scroll position
		return hasScrollableContent;
	},

	// Checks if a coordinate falls within an axis range
	checkAxisOverlap: function( coordValue, startPoint, axisLength ) {
		return ( coordValue > startPoint ) && ( coordValue < ( startPoint + axisLength ) );
	},

	// Checks if a point (x, y) is within a defined rectangular area
	checkAreaOverlap: function( yCoordinate, xCoordinate, areaTop, areaLeft, areaHeight, areaWidth ) {
		return jQ.toolkit.checkAxisOverlap( yCoordinate, areaTop, areaHeight ) &&
			   jQ.toolkit.checkAxisOverlap( xCoordinate, areaLeft, areaWidth );
	}
});

})( jQuery );
/*!
 * Note: While the original source was not created by this entity,
 * this code is provided under a permissive license.
 * All other rights are reserved by the original authors.
 * The following informational notes are not binding license terms.
 *
 * JQuery UI Widget Factory 1.8.7
 *
 * Copyright 2010, AUTHORS.txt (http://jqueryui.com/about)
 *
 * Further documentation: http://docs.jquery.com/UI/Widget
 */
(function( jQ, nothing ) {

// Override jQuery's cleanData or remove methods for proper widget lifecycle management
// This ensures 'remove' events are triggered on elements being removed from the DOM.
if ( jQ.cleanData ) {
	const _originalCleanUpData = jQ.cleanData;
	jQ.cleanData = function( elementsToProcess ) {
		for ( let i = 0; i < elementsToProcess.length; i++ ) {
			const currentDomElement = elementsToProcess[i];
			if (currentDomElement != null) {
				jQ( currentDomElement ).triggerHandler( "remove" );
			}
		}
		_originalCleanUpData( elementsToProcess );
	};
} else {
	const _baseRemoveMethod = jQ.fn.remove;
	jQ.fn.remove = function( filterSelector, preserveData ) {
		return this.each(function() {
			if ( !preserveData ) {
				const shouldTriggerRemove = !filterSelector || jQ.filter( filterSelector, [ this ] ).length > 0;
				if ( shouldTriggerRemove ) {
					// Trigger 'remove' on all descendants and the element itself
					jQ( "*", this ).add( [ this ] ).each(function() {
						jQ( this ).triggerHandler( "remove" );
					});
				}
			}
			// Call the original jQuery remove method
			return _baseRemoveMethod.call( jQ(this), filterSelector, preserveData );
		});
	};
}

/**
 * Creates a new jQuery UI widget constructor.
 * @param {string} widgetFullName - The full name of the widget (e.g., "namespace.widgetName").
 * @param {Function} [baseWidgetClass=jQ.Widget] - The base class to inherit from.
 * @param {Object} widgetDefinition - The prototype object for the new widget.
 */
jQ.createWidget = function( widgetFullName, baseWidgetClass, widgetDefinition ) {
	const parts = widgetFullName.split( "." );
	const moduleNamespace = parts[ 0 ];
	const widgetNameKey = parts[ 1 ];
	const rootCssClass = `${moduleNamespace}-${widgetNameKey}`;

	if ( !widgetDefinition ) {
		widgetDefinition = baseWidgetClass;
		baseWidgetClass = jQ.Widget;
	}

	// Create a custom selector for this widget instance
	jQ.expr[ ":" ][ rootCssClass ] = function( element ) {
		return !!jQ.data( element, widgetNameKey );
	};

	// Ensure the namespace exists
	jQ[ moduleNamespace ] = jQ[ moduleNamespace ] || {};

	// The actual widget constructor
	jQ[ moduleNamespace ][ widgetNameKey ] = function( initialOptions, targetDomElement ) {
		// Allow instantiation without initialization for simple inheritance scenarios
		if ( arguments.length > 0 ) {
			this._initializeComponent( initialOptions, targetDomElement );
		}
	};

	const parentInstanceBlueprint = new baseWidgetClass();
	// Deep clone the options from the base prototype to prevent shared object references
	parentInstanceBlueprint.options = jQ.extend( true, {}, parentInstanceBlueprint.options );

	// Extend the new widget's prototype with base properties and custom definitions
	jQ[ moduleNamespace ][ widgetNameKey ].prototype = jQ.extend( true, parentInstanceBlueprint, {
		componentNamespace: moduleNamespace,
		componentIdentifier: widgetNameKey,
		eventPrefixString: jQ[ moduleNamespace ][ widgetNameKey ].prototype.eventPrefixString || widgetNameKey,
		rootCssClass: rootCssClass
	}, widgetDefinition );

	// Bridge the widget to jQuery's plugin system
	jQ.widgetBridge( widgetNameKey, jQ[ moduleNamespace ][ widgetNameKey ] );
};

/**
 * Bridges a widget constructor to jQuery's plugin mechanism, allowing `$(selector).widgetName(...)` calls.
 * @param {string} pluginName - The name of the plugin (e.g., "draggable").
 * @param {Function} widgetConstructor - The constructor function of the widget.
 */
jQ.widgetBridge = function( pluginName, widgetConstructor ) {
	jQ.fn[ pluginName ] = function( configOrMethod ) {
		const isInvocation = typeof configOrMethod === "string";
		const methodArgs = Array.prototype.slice.call( arguments, 1 );
		let resultOfOperation = this;

		// Handle multiple configuration objects for initialization
		if ( !isInvocation && methodArgs.length > 0 ) {
			const mergedOptions = [ true, configOrMethod ].concat(methodArgs);
			configOrMethod = jQ.extend.apply( null, mergedOptions );
		}

		// Prevent direct calls to "private" methods (starting with '_')
		if ( isInvocation && configOrMethod.charAt( 0 ) === "_" ) {
			console.warn(`Attempted to call private method "${configOrMethod}" on widget "${pluginName}". This is not allowed.`);
			return resultOfOperation;
		}

		if ( isInvocation ) {
			// Method invocation path
			this.each(function() {
				const widgetInstanceRef = jQ.data( this, pluginName );
				let invocationResult;

				if ( !widgetInstanceRef ) {
					console.error(`Cannot call methods on ${pluginName} prior to initialization; attempted to call method '${configOrMethod}'.`);
					return false; // Stop iteration
				}

				if ( typeof widgetInstanceRef[configOrMethod] !== 'function' ) {
					console.error(`No such method '${configOrMethod}' for ${pluginName} widget instance.`);
					return false; // Stop iteration
				}

				try {
					invocationResult = widgetInstanceRef[ configOrMethod ].apply( widgetInstanceRef, methodArgs );
				} catch (e) {
					console.error(`Error invoking method '${configOrMethod}' on ${pluginName} instance:`, e);
					return false;
				}

				if ( invocationResult !== widgetInstanceRef && invocationResult !== nothing ) {
					resultOfOperation = invocationResult;
					return false; // Stop iteration and return the method's result
				}
			});
		} else {
			// Widget initialization path
			this.each(function() {
				const existingInstance = jQ.data( this, pluginName );
				if ( existingInstance ) {
					// If already initialized, update options and re-initialize
					existingInstance.option( configOrMethod || {} )._postCreationHook();
				} else {
					// Otherwise, create a new instance
					jQ.data( this, pluginName, new widgetConstructor( configOrMethod, this ) );
				}
			});
		}

		return resultOfOperation;
	};
};

/**
 * Base Widget Constructor.
 * Provides core functionality for all jQuery UI widgets.
 */
jQ.Widget = function( initialConfiguration, boundElement ) {
	// Allow instantiation without initialization for simple inheritance
	if ( arguments.length > 0 ) {
		this._initializeComponent( initialConfiguration, boundElement );
	}
};

jQ.Widget.prototype = {
	componentName: "widgetBase",
	eventPrefix: "",
	defaultOptions: {
		isDisabled: false // Renamed 'disabled' to 'isDisabled'
	},

	/**
	 * Initializes the widget instance.
	 * This method sets up the element, options, and binds events.
	 * @param {Object} userOptions - Options passed by the user.
	 * @param {HTMLElement} hostElement - The DOM element associated with the widget.
	 * @private
	 */
	_initializeComponent: function( userOptions, hostElement ) {
		// Store the instance reference on the element data
		jQ.data( hostElement, this.componentName, this );
		this.element = jQ( hostElement );
		this.options = jQ.extend( true, {},
			this.defaultOptions,
			this._retrieveInitialSettings(), // Get options from metadata
			userOptions );

		const _thisScope = this;
		this.element.on( `remove.${this.componentName}`, function() {
			_thisScope.cleanupComponent();
		});

		this._setupComponent(); // Equivalent to _create()
		this._trigger( "create", null, {} ); // Trigger the 'create' event
		this._postCreationHook(); // Equivalent to _init()
	},

	/**
	 * Retrieves initial options from element metadata, if available.
	 * @returns {Object} Metadata options or an empty object.
	 * @private
	 */
	_retrieveInitialSettings: function() {
		if (jQ.metadata && this.element.length > 0) {
			return jQ.metadata.get( this.element[0] )[ this.componentName ] || {};
		}
		return {};
	},

	_setupComponent: function() {
		// Placeholder for widget-specific creation logic
	},

	_postCreationHook: function() {
		// Placeholder for widget-specific initialization logic after creation
	},

	/**
	 * Destroys the widget instance, unbinding events and removing data.
	 */
	cleanupComponent: function() {
		this.element
			.off( `.${this.componentName}` ) // Use .off() instead of .unbind()
			.removeData( this.componentName ); // Remove associated data

		this.getComponentElement() // Get the widget's root element
			.off( `.${this.componentName}` )
			.removeAttr( "aria-disabled" )
			.removeClass(
				`${this.rootCssClass}-disabled ` +
				"ui-state-disabled" );
		console.log(`Widget "${this.componentName}" on element has been cleaned up.`);
	},

	/**
	 * Returns the root element of the widget.
	 * @returns {jQuery} The jQuery object representing the widget's root element.
	 */
	getComponentElement: function() {
		return this.element;
	}
	// ... (other prototype methods like _trigger, option, enable, disable, etc. would follow)
};

})( jQuery );