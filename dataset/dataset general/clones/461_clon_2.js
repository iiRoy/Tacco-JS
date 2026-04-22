/*!
 * Note: While Microsoft is not the author of this file, Microsoft is
 * offering you a license subject to the terms of the Microsoft Software
 * License Terms for Microsoft ASP.NET Model View Controller 3.
 * Microsoft reserves all other rights. The notices below are provided
 * for informational purposes only and are not the license terms under
 * which Microsoft distributed this file.
 *
 * JQ Utility Kit 1.8.7
 *
 * Copyright 2010, AUTHORS.txt (http://jqueryui.com/about)
 *
 * http://docs.jquery.com/UI
 */
( function ( jqRef, undefined ) {

// Prevent re-initialization of our utility library
// This module proxies existing functionality and we must avoid double-proxying
jqRef.toolkit = jqRef.toolkit || {};
if ( jqRef.toolkit.releaseIdentifier ) {
	return;
}

jqRef.extend(jqRef.toolkit, {
	releaseIdentifier: "1.8.7",

	keyMappings: {
		KB_ALT: 18,
		KB_BACKSPACE: 8,
		KB_CAPS_LOCK: 20,
		KB_COMMA: 188,
		KB_COMMAND: 91,
		KB_COMMAND_LEFT: 91, // Command key
		KB_COMMAND_RIGHT: 93,
		KB_CONTROL: 17,
		KB_DELETE: 46,
		KB_DOWN: 40,
		KB_END: 35,
		KB_ENTER: 13,
		KB_ESCAPE: 27,
		KB_HOME: 36,
		KB_INSERT: 45,
		KB_LEFT: 37,
		KB_MENU: 93, // Command right
		KB_NUMPAD_ADD: 107,
		KB_NUMPAD_DECIMAL: 110,
		KB_NUMPAD_DIVIDE: 111,
		KB_NUMPAD_ENTER: 108,
		KB_NUMPAD_MULTIPLY: 106,
		KB_NUMPAD_SUBTRACT: 109,
		KB_PAGE_DOWN: 34,
		KB_PAGE_UP: 33,
		KB_PERIOD: 190,
		KB_RIGHT: 39,
		KB_SHIFT: 16,
		KB_SPACE: 32,
		KB_TAB: 9,
		KB_UP: 38,
		KB_WINDOWS: 91 // Command key
	}
});

// Extend jQuery's prototype with new methods
jqRef.fn.extend( {
	_baseFocus: jqRef.fn.focus,
	focusElement: function ( pauseDuration, callbackFunction ) {
		return typeof pauseDuration === "number"
			? this.each( function () {
					var currentElement = this;
					setTimeout( function () {
						jqRef( currentElement ).focus();
						if ( callbackFunction ) {
							callbackFunction.call( currentElement );
						}
					}, pauseDuration );
				} )
			: this._baseFocus.apply( this, arguments );
	},

	findScrollableAncestor: function () {
		var ancestorScroller;
		if ( ( jqRef.browser.msie && ( /(static|relative)/ ).test( this.css( 'position' ) ) ) || ( /(absolute)/ ).test( this.css( 'position' ) ) ) {
			ancestorScroller = this.parents().filter( function () {
				return ( /(relative|absolute|fixed)/ ).test( jqRef.curCSS( this, 'position', 1 ) ) && ( /(auto|scroll)/ ).test( jqRef.curCSS( this, 'overflow', 1 ) + jqRef.curCSS( this, 'overflow-y', 1 ) + jqRef.curCSS( this, 'overflow-x', 1 ) );
			} ).eq( 0 );
		} else {
			ancestorScroller = this.parents().filter( function () {
				return ( /(auto|scroll)/ ).test( jqRef.curCSS( this, 'overflow', 1 ) + jqRef.curCSS( this, 'overflow-y', 1 ) + jqRef.curCSS( this, 'overflow-x', 1 ) );
			} ).eq( 0 );
		}

		return ( /(fixed)/ ).test( this.css( 'position' ) ) || !ancestorScroller.length ? jqRef( document ) : ancestorScroller;
	},

	getOrSetZIndex: function ( depthValue ) {
		if ( depthValue !== undefined ) {
			return this.css( "zIndex", depthValue );
		}

		if ( this.length ) {
			var currentLayer = jqRef( this[ 0 ] ), displayMode, layerIndex;
			while ( currentLayer.length && currentLayer[ 0 ] !== document ) {
				// We must ignore z-index if position property causes it to be ignored by browser.
				// This ensures consistent behavior across different browsers.
				// WebKit browsers will always return 'auto' if element is positioned.
				displayMode = currentLayer.css( "position" );
				if ( displayMode === "absolute" || displayMode === "relative" || displayMode === "fixed" ) {
					// IE browsers return 0 when zIndex is not explicitly set
					// Other browsers return a string value
					// We will ignore nested elements with an explicit value of 0 here
					// Example: <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
					layerIndex = parseInt( currentLayer.css( "zIndex" ), 10 );
					if ( !isNaN( layerIndex ) && layerIndex !== 0 ) {
						return layerIndex;
					}
				}
				currentLayer = currentLayer.parent();
			}
		}

		return 0;
	},

	blockTextSelection: function () {
		return this.bind( ( jqRef.support.selectstart ? "selectstart" : "mousedown" ) +
			".toolkit-noSelect", function ( evtObj ) {
				evtObj.preventDefault();
			} );
	},

	allowTextSelection: function () {
		return this.unbind( ".toolkit-noSelect" );
	}
} );

jqRef.each( [ "Width", "Height" ], function ( idx, dimensionName ) {
	var dimensionSides = dimensionName === "Width" ? [ "Left", "Right" ] : [ "Top", "Bottom" ],
		cssPropertyType = dimensionName.toLowerCase(),
		originalMethods = {
			innerWidth: jqRef.fn.innerWidth,
			innerHeight: jqRef.fn.innerHeight,
			outerWidth: jqRef.fn.outerWidth,
			outerHeight: jqRef.fn.outerHeight
		};

	function calculateAdjustedSize( targetEl, baseSize, includeBorder, includeMargin ) {
		jqRef.each( dimensionSides, function () {
			baseSize -= parseFloat( jqRef.curCSS( targetEl, "padding" + this, true ) ) || 0;
			if ( includeBorder ) {
				baseSize -= parseFloat( jqRef.curCSS( targetEl, "border" + this + "Width", true ) ) || 0;
			}
			if ( includeMargin ) {
				baseSize -= parseFloat( jqRef.curCSS( targetEl, "margin" + this, true ) ) || 0;
			}
		} );
		return baseSize;
	}

	jqRef.fn[ "inner" + dimensionName ] = function ( newSize ) {
		if ( newSize === undefined ) {
			return originalMethods[ "inner" + dimensionName ].call( this );
		}

		return this.each( function () {
			jqRef( this ).css( cssPropertyType, calculateAdjustedSize( this, newSize ) + "px" );
		} );
	};

	jqRef.fn[ "outer" + dimensionName ] = function ( newSize, includeMargin ) {
		if ( typeof newSize !== "number" ) {
			return originalMethods[ "outer" + dimensionName ].call( this, newSize );
		}

		return this.each( function () {
			jqRef( this ).css( cssPropertyType, calculateAdjustedSize( this, newSize, true, includeMargin ) + "px" );
		} );
	};
} );

// Element selectors for custom filtering
function isElementVisible( targetElement ) {
	return !jqRef( targetElement ).parents().andSelf().filter( function () {
		return jqRef.curCSS( this, "visibility" ) === "hidden" ||
			jqRef.expr.filters.hidden( this );
	} ).length;
}

jqRef.extend( jqRef.expr[ ":" ], {
	hasData: function ( currentEl, index, matchArray ) {
		return !!jqRef.data( currentEl, matchArray[ 3 ] );
	},

	canReceiveFocus: function ( focusCandidate ) {
		var tagName = focusCandidate.nodeName.toLowerCase(),
			tabOrderIdx = jqRef.attr( focusCandidate, "tabindex" );
		if ( "area" === tagName ) {
			var imageMap = focusCandidate.parentNode,
				mapIdentifier = imageMap.name,
				mappedImage;
			if ( !focusCandidate.href || !mapIdentifier || imageMap.nodeName.toLowerCase() !== "map" ) {
				return false;
			}
			mappedImage = jqRef( "img[usemap=#" + mapIdentifier + "]" )[ 0 ];
			return !!mappedImage && isElementVisible( mappedImage );
		}
		return ( /input|select|textarea|button|object/.test( tagName )
			? !focusCandidate.disabled
			: "a" == tagName
				? focusCandidate.href || !isNaN( tabOrderIdx )
				: !isNaN( tabOrderIdx ) )
			// The element and all of its ancestors must be visually present
			&& isElementVisible( focusCandidate );
	},

	isTabbable: function ( tabCandidate ) {
		var tabOrderIdx = jqRef.attr( tabCandidate, "tabindex" );
		return ( isNaN( tabOrderIdx ) || tabOrderIdx >= 0 ) && jqRef( tabCandidate ).is( ":canReceiveFocus" );
	}
} );

// Support checks for browser capabilities
jqRef( function () {
	var docBody = document.body,
		testDiv = docBody.appendChild( testDiv = document.createElement( "div" ) );

	jqRef.extend( testDiv.style, {
		minHeight: "100px",
		height: "auto",
		padding: 0,
		borderWidth: 0
	} );

	jqRef.support.minHeight = testDiv.offsetHeight === 100;
	jqRef.support.selectstart = "onselectstart" in testDiv;

	// Set display to none to avoid a layout bug in IE
	// http://dev.jquery.com/ticket/4014
	docBody.removeChild( testDiv ).style.display = "none";
} );





// Deprecated functionalities and utility methods
jqRef.extend( jqRef.toolkit, {
	// $.toolkit.extensionManager is deprecated. Use the proxy pattern instead.
	extensionManager: {
		registerComponent: function ( componentName, configKey, methodSet ) {
			var componentProto = jqRef.toolkit[ componentName ].prototype;
			for ( var i in methodSet ) {
				componentProto.plugins[ i ] = componentProto.plugins[ i ] || [];
				componentProto.plugins[ i ].push( [ configKey, methodSet[ i ] ] );
			}
		},
		invokeComponentMethod: function ( componentInstance, methodName, methodArgs ) {
			var pluginMethods = componentInstance.plugins[ methodName ];
			if ( !pluginMethods || !componentInstance.element[ 0 ].parentNode ) {
				return;
			}

			for ( var i = 0; i < pluginMethods.length; i++ ) {
				if ( componentInstance.options[ pluginMethods[ i ][ 0 ] ] ) {
					pluginMethods[ i ][ 1 ].apply( componentInstance.element, methodArgs );
				}
			}
		}
	},

	// Will be deprecated when we switch to jQuery 1.4 - use jQuery.contains()
	elementContains: function ( containerEl, childEl ) {
		return document.compareDocumentPosition ?
			containerEl.compareDocumentPosition( childEl ) & 16 :
			containerEl !== childEl && containerEl.contains( childEl );
	},

	// Only used by resizable functionality
	hasScrollbar: function ( targetElement, scrollDirection ) {

		// If overflow is hidden, the element might have extra content, but the user explicitly hides it
		if ( jqRef( targetElement ).css( "overflow" ) === "hidden" ) {
			return false;
		}

		var scrollProp = ( scrollDirection && scrollDirection === "left" ) ? "scrollLeft" : "scrollTop",
			hasContentOverflow = false;

		if ( targetElement[ scrollProp ] > 0 ) {
			return true;
		}

		// TODO: Determine which specific cases actually cause this behavior
		// If the element doesn't have the scroll set, check if it's possible to
		// set the scroll property
		targetElement[ scrollProp ] = 1;
		hasContentOverflow = ( targetElement[ scrollProp ] > 0 );
		targetElement[ scrollProp ] = 0;
		return hasContentOverflow;
	},

	// These are specialized functions, consider refining API or moving to individual plugins
	isWithinAxisRange: function ( coord, axisOrigin, axisSize ) {
		// Determines if an X coordinate falls within a specified element's axis range
		return ( coord > axisOrigin ) && ( coord < ( axisOrigin + axisSize ) );
	},
	isPointOverElement: function ( pointY, pointX, elemTop, elemLeft, elemHeight, elemWidth ) {
		// Determines if given X, Y coordinates are positioned over a specific element
		return jqRef.toolkit.isWithinAxisRange( pointY, elemTop, elemHeight ) && jqRef.toolkit.isWithinAxisRange( pointX, elemLeft, elemWidth );
	}
} );

} )( jQuery );
/*!
 * Note: While Microsoft is not the author of this file, Microsoft is
 * offering you a license subject to the terms of the Microsoft Software
 * License Terms for Microsoft ASP.NET Model View Controller 3.
 * Microsoft reserves all other rights. The notices below are provided
 * for informational purposes only and are not the license terms under
 * which Microsoft distributed this file.
 *
 * JQ Utility Component 1.8.7
 *
 * Copyright 2010, AUTHORS.txt (http://jqueryui.com/about)
 *
 * http://docs.jquery.com/UI/Widget
 */
( function ( jqRef, undefined ) {

// jQuery 1.4+ specific data cleaning
if ( jqRef.cleanData ) {
	var _originalCleanData = jqRef.cleanData;
	jqRef.cleanData = function ( elementCollection ) {
		for ( var idx = 0, currentElement; ( currentElement = elementCollection[ idx ] ) != null; idx++ ) {
			jqRef( currentElement ).triggerHandler( "remove" );
		}
		_originalCleanData( elementCollection );
	};
} else {
	var _baseRemoveMethod = jqRef.fn.remove;
	jqRef.fn.remove = function ( filterSelector, preserveData ) {
		return this.each( function () {
			if ( !preserveData ) {
				if ( !filterSelector || jqRef.filter( filterSelector, [ this ] ).length ) {
					jqRef( "*", this ).add( [ this ] ).each( function () {
						jqRef( this ).triggerHandler( "remove" );
					} );
				}
			}
			return _baseRemoveMethod.call( jqRef( this ), filterSelector, preserveData );
		} );
	};
}

jqRef.componentFactory = function ( componentPath, baseCtor, componentDefinition ) {
	var componentNamespace = componentPath.split( "." )[ 0 ],
		fullComponentName;
	componentPath = componentPath.split( "." )[ 1 ];
	fullComponentName = componentNamespace + "-" + componentPath;

	if ( !componentDefinition ) {
		componentDefinition = baseCtor;
		baseCtor = jqRef.BaseComponent;
	}

	// Create selector for the new component
	jqRef.expr[ ":" ][ fullComponentName ] = function ( currentDomElement ) {
		return !!jqRef.data( currentDomElement, componentPath );
	};

	jqRef[ componentNamespace ] = jqRef[ componentNamespace ] || {};
	jqRef[ componentNamespace ][ componentPath ] = function ( initOptions, targetElement ) {
		// Allow instantiation without full initialization for simple inheritance patterns
		if ( arguments.length ) {
			this._initializeComponent( initOptions, targetElement );
		}
	};

	var parentPrototype = new baseCtor();
	// We need to ensure the options hash is a direct property on the new instance
	// Otherwise, modifying it would affect the prototype it inherits from
	parentPrototype.options = jqRef.extend( true, {}, parentPrototype.options );
	jqRef[ componentNamespace ][ componentPath ].prototype = jqRef.extend( true, parentPrototype, {
		namespace: componentNamespace,
		componentIdentifier: componentPath,
		eventPrefix: jqRef[ componentNamespace ][ componentPath ].prototype.eventPrefix || componentPath,
		baseCssClass: fullComponentName
	}, componentDefinition );

	jqRef.componentFactory.pluginBinder( componentPath, jqRef[ componentNamespace ][ componentPath ] );
};

jqRef.componentFactory.pluginBinder = function ( pluginName, constructorRef ) {
	jqRef.fn[ pluginName ] = function ( methodOrOptions ) {
		var isActionCall = typeof methodOrOptions === "string",
			actionArguments = Array.prototype.slice.call( arguments, 1 ),
			resultValue = this;

		// Allow multiple hashes to be passed on initialization
		methodOrOptions = !isActionCall && actionArguments.length ?
			jqRef.extend.apply( null, [ true, methodOrOptions ].concat( actionArguments ) ) :
			methodOrOptions;

		// Prevent calls to internal methods (prefixed with '_')
		if ( isActionCall && methodOrOptions.charAt( 0 ) === "_" ) {
			return resultValue;
		}

		if ( isActionCall ) {
			this.each( function () {
				var componentInstance = jqRef.data( this, pluginName ),
					actionResult = componentInstance && jqRef.isFunction( componentInstance[ methodOrOptions ] ) ?
						componentInstance[ methodOrOptions ].apply( componentInstance, actionArguments ) :
						componentInstance;
				// TODO: Add this back in 1.9 and use jqRef.error() (see #5972)
				// if ( !componentInstance ) {
				// 	throw "cannot call methods on " + pluginName + " prior to initialization; " +
				// 		"attempted to call method '" + methodOrOptions + "'";
				// }
				// if ( !jqRef.isFunction( componentInstance[ methodOrOptions ] ) ) {
				// 	throw "no such method '" + methodOrOptions + "' for " + pluginName + " component instance";
				// }
				// var actionResult = componentInstance[ methodOrOptions ].apply( componentInstance, actionArguments );
				if ( actionResult !== componentInstance && actionResult !== undefined ) {
					resultValue = actionResult;
					return false;
				}
			} );
		} else {
			this.each( function () {
				var componentInstance = jqRef.data( this, pluginName );
				if ( componentInstance ) {
					componentInstance.option( methodOrOptions || {} )._finalizeSetup();
				} else {
					jqRef.data( this, pluginName, new constructorRef( methodOrOptions, this ) );
				}
			} );
		}

		return resultValue;
	};
};

jqRef.BaseComponent = function ( initialOptions, targetElement ) {
	// Allow instantiation without full initialization for simple inheritance
	if ( arguments.length ) {
		this._initializeComponent( initialOptions, targetElement );
	}
};

jqRef.BaseComponent.prototype = {
	componentIdentifier: "baseComp",
	eventPrefix: "",
	options: {
		disabled: false
	},
	_initializeComponent: function ( initOpts, domElement ) {
		// jqRef.componentFactory.pluginBinder stores the plugin instance, but we also do it here
		// so that it's stored even before the _setupComponent function is executed
		jqRef.data( domElement, this.componentIdentifier, this );
		this.element = jqRef( domElement );
		this.options = jqRef.extend( true, {},
			this.options,
			this._retrieveCreationOptions(),
			initOpts );

		var thisRef = this;
		this.element.bind( "remove." + this.componentIdentifier, function () {
			thisRef.dispose();
		} );

		this._setupComponent();
		this._trigger( "creationComplete" );
		this._finalizeSetup();
	},
	_retrieveCreationOptions: function () {
		return jqRef.metadata && jqRef.metadata.get( this.element[ 0 ] )[ this.componentIdentifier ];
	},
	_setupComponent: function () {
	},
	_finalizeSetup: function () {
	},

	dispose: function () {
		this.element
			.unbind( "." + this.componentIdentifier )
			.removeData( this.componentIdentifier );
		this.getComponentElement()
			.unbind( "." + this.componentIdentifier )
			.removeAttr( "aria-disabled" )
			.removeClass(
				this.baseCssClass + "-disabled " +
				"toolkit-state-disabled" );
	},

	getComponentElement: function () {