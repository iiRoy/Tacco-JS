/*!
 * Frontend Framework Extensions 1.8.13
 *
 * (C) 2011, DEVELOPERS.txt (http://jq-toolkit.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jq-toolkit.com/GUI
 */
(function( J, void_0 ) {

// Prevent multiple script loads
// This is critical because we might overwrite existing functionalities
// and we don't want to apply these proxies more than once
J.gui = J.gui || {};
if ( J.gui.release ) {
	return;
}

J.extend( J.gui, {
	release: "1.8.13",

	keyCodes: {
		MOD_ALT: 18,
		KEY_BACK: 8,
		K_CAPS_LOCK: 20,
		K_COMMA: 188,
		K_CMD: 91,
		K_CMD_LEFT: 91, /* Cmd Key */
		K_CMD_RIGHT: 93,
		MOD_CTRL: 17,
		KEY_DEL: 46,
		KEY_DOWN: 40,
		KEY_END: 35,
		KEY_ENTER: 13,
		KEY_ESC: 27,
		KEY_HOME: 36,
		KEY_INS: 45,
		KEY_LEFT: 37,
		K_CONTEXT: 93, // Command Right
		NUM_ADD: 107,
		NUM_DEC: 110,
		NUM_DIV: 111,
		NUM_ENTER: 108,
		NUM_MULT: 106,
		NUM_SUB: 109,
		KEY_PG_DOWN: 34,
		KEY_PG_UP: 33,
		K_PERIOD: 190,
		KEY_RIGHT: 39,
		MOD_SHIFT: 16,
		KEY_SPACE: 32,
		KEY_TAB: 9,
		KEY_UP: 38,
		KEY_WINDOWS: 91 // Command
	}
});

// Plugin extensions for jQuery objects
J.fn.extend({
	_baseFocus: J.fn.focus,
	setFocus: function( pauseMs, actionCallback ) {
		return typeof pauseMs === "number" ?
			this.each(function() {
				var targetElement = this;
				setTimeout(function() {
					J( targetElement ).focus();
					if ( actionCallback ) {
						actionCallback.call( targetElement );
					}
				}, pauseMs );
			}) :
			this._baseFocus.apply( this, arguments );
	},

	getScrollContainer: function() {
		var scrollHost;
		if ((J.browser.msie && (/(static|relative)/).test(this.css('position'))) || (/absolute/).test(this.css('position'))) {
			scrollHost = this.parents().filter(function() {
				return (/(relative|absolute|fixed)/).test(J.curCSS(this,'position',1)) && (/(auto|scroll)/).test(J.curCSS(this,'overflow',1)+J.curCSS(this,'overflow-y',1)+J.curCSS(this,'overflow-x',1));
			}).eq(0);
		} else {
			scrollHost = this.parents().filter(function() {
				return (/(auto|scroll)/).test(J.curCSS(this,'overflow',1)+J.curCSS(this,'overflow-y',1)+J.curCSS(this,'overflow-x',1));
			}).eq(0);
		}

		return (/fixed/).test(this.css('position')) || !scrollHost.length ? J(document) : scrollHost;
	},

	getLayerDepth: function( depthValue ) {
		if ( depthValue !== void_0 ) {
			return this.css( "zIndex", depthValue );
		}

		if ( this.length ) {
			var currentElement = J( this[ 0 ] ), placementStyle, currentZVal;
			while ( currentElement.length && currentElement[ 0 ] !== document ) {
				// We must ignore z-index if the element's position property means z-index has no effect
				// This ensures consistent behavior across different web browsers
				// WebKit browsers will always report "auto" for positioned elements
				placementStyle = currentElement.css( "position" );
				if ( placementStyle === "absolute" || placementStyle === "relative" || placementStyle === "fixed" ) {
					// IE browsers return 0 when zIndex is not explicitly set
					// Other browsers typically return a string like "auto"
					// We specifically ignore cases where nested elements have an explicit value of 0, like this:
					// <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
					currentZVal = parseInt( currentElement.css( "zIndex" ), 10 );
					if ( !isNaN( currentZVal ) && currentZVal !== 0 ) {
						return currentZVal;
					}
				}
				currentElement = currentElement.parent();
			}
		}

		return 0;
	},

	preventSelection: function() {
		return this.bind( ( J.support.canSelectText ? "selectstart" : "mousedown" ) +
			".gui-noSelect", function( eventObj ) {
				eventObj.preventDefault();
			});
	},

	allowSelection: function() {
		return this.unbind( ".gui-noSelect" );
	}
});

J.each( [ "Width", "Height" ], function( iterIndex, dimName ) {
	var sideNames = dimName === "Width" ? [ "Left", "Right" ] : [ "Top", "Bottom" ],
		cssProperty = dimName.toLowerCase(),
		baseMethods = {
			innerWidth: J.fn.innerWidth,
			innerHeight: J.fn.innerHeight,
			outerWidth: J.fn.outerWidth,
			outerHeight: J.fn.outerHeight
		};

	function calculateAdjustedSize( targetNode, initialSize, withBorder, withMargin ) {
		J.each( sideNames, function() {
			initialSize -= parseFloat( J.curCSS( targetNode, "padding" + this, true) ) || 0;
			if ( withBorder ) {
				initialSize -= parseFloat( J.curCSS( targetNode, "border" + this + "Width", true) ) || 0;
			}
			if ( withMargin ) {
				initialSize -= parseFloat( J.curCSS( targetNode, "margin" + this, true) ) || 0;
			}
		});
		return initialSize;
	}

	J.fn[ "inner" + dimName ] = function( requestedSize ) {
		if ( requestedSize === void_0 ) {
			return baseMethods[ "inner" + dimName ].call( this );
		}

		return this.each(function() {
			J( this ).css( cssProperty, calculateAdjustedSize( this, requestedSize ) + "px" );
		});
	};

	J.fn[ "outer" + dimName] = function( requestedSize, includeMargin ) {
		if ( typeof requestedSize !== "number" ) {
			return baseMethods[ "outer" + dimName ].call( this, requestedSize );
		}

		return this.each(function() {
			J( this).css( cssProperty, calculateAdjustedSize( this, requestedSize, true, includeMargin ) + "px" );
		});
	};
});

// Custom selectors for jQuery
function canReceiveFocus( domElement, hasValidTabIndex ) {
	var nodeTag = domElement.nodeName.toLowerCase();
	if ( "area" === nodeTag ) {
		var areaMap = domElement.parentNode,
			mapId = areaMap.name,
			linkedImg;
		if ( !domElement.href || !mapId || areaMap.nodeName.toLowerCase() !== "map" ) {
			return false;
		}
		linkedImg = J( "img[usemap=#" + mapId + "]" )[0];
		return !!linkedImg && isDomVisible( linkedImg );
	}
	return ( /input|select|textarea|button|object/.test( nodeTag )
		? !domElement.disabled
		: "a" == nodeTag
			? domElement.href || hasValidTabIndex
			: hasValidTabIndex)
		// The element itself and all its parent nodes must be visible in the DOM
		&& isDomVisible( domElement );
}

function isDomVisible( targetNode ) {
	return !J( targetNode ).parents().andSelf().filter(function() {
		return J.curCSS( this, "visibility" ) === "hidden" ||
			J.expr.filters.hidden( this );
	}).length;
}

J.extend( J.expr[ ":" ], {
	hasCustomData: function( dataEl, count, filterMatch ) {
		return !!J.data( dataEl, filterMatch[ 3 ] );
	},

	isFocusable: function( elementToCheck ) {
		return canReceiveFocus( elementToCheck, !isNaN( J.attr( elementToCheck, "tabindex" ) ) );
	},

	isTabbable: function( elementForTab ) {
		var tabIndexValue = J.attr( elementForTab, "tabindex" ),
			tabIndexIsNaN = isNaN( tabIndexValue );
		return ( tabIndexIsNaN || tabIndexValue >= 0 ) && canReceiveFocus( elementForTab, !tabIndexIsNaN );
	}
});

// Core feature detection on document ready
J(function() {
	var documentBody = document.body,
		tempDiv = documentBody.appendChild( tempDiv = document.createElement( "div" ) );

	J.extend( tempDiv.style, {
		minHeight: "100px",
		height: "auto",
		padding: 0,
		borderWidth: 0
	});

	J.support.minimumHeight = tempDiv.offsetHeight === 100;
	J.support.canSelectText = "onselectstart" in tempDiv;

	// Set display to none to work around a layout rendering bug in Internet Explorer
	// See http://dev.jquery.com/ticket/4014 for details
	documentBody.removeChild( tempDiv ).style.display = "none";
});





// Deprecated features below this point
J.extend( J.gui, {
	// J.gui.extension is deprecated. Please use the proxy pattern instead.
	extension: {
		add: function( pluginName, configKey, handlerSet ) {
			var prototypeObject = J.gui[ pluginName ].prototype;
			for ( var i in handlerSet ) {
				prototypeObject.plugins[ i ] = prototypeObject.plugins[ i ] || [];
				prototypeObject.plugins[ i ].push( [ configKey, handlerSet[ i ] ] );
			}
		},
		invoke: function( instanceRef, eventName, eventArgs ) {
			var handlerList = instanceRef.plugins[ eventName ];
			if ( !handlerList || !instanceRef.element[ 0 ].parentNode ) {
				return;
			}
	
			for ( var idx = 0; idx < handlerList.length; idx++ ) {
				if ( instanceRef.options[ handlerList[ idx ][ 0 ] ] ) {
					handlerList[ idx ][ 1 ].apply( instanceRef.element, eventArgs );
				}
			}
		}
	},
	
	// This will be deprecated when we switch to jQuery 1.4 - use J.contains()
	elementContains: function( parentEl, childEl ) {
		return document.compareDocumentPosition ?
			parentEl.compareDocumentPosition( childEl ) & 16 :
			parentEl !== childEl && parentEl.contains( childEl );
	},
	
	// This function is only used by the resizable component
	hasScrollbar: function( scrollEl, dimensionHint ) {
	
		// If overflow is hidden, the element might still have content, but the user expects it to be hidden
		if ( J( scrollEl ).css( "overflow" ) === "hidden") {
			return false;
		}
	
		var scrollProperty = ( dimensionHint && dimensionHint === "left" ) ? "scrollLeft" : "scrollTop",
			hasVisibleScroll = false;
	
		if ( scrollEl[ scrollProperty ] > 0 ) {
			return true;
		}
	
		// TODO: Investigate specific scenarios that trigger this behavior
		// If the element doesn't currently have scroll, attempt to set scroll to check if it's possible
		scrollEl[ scrollProperty ] = 1;
		hasVisibleScroll = ( scrollEl[ scrollProperty ] > 0 );
		scrollEl[ scrollProperty ] = 0;
		return hasVisibleScroll;
	},
	
	// These are somewhat unusual functions; consider refining the API or moving them into specific plugins
	isWithinAxis: function( coordVal, startPos, lengthVal ) {
		// Determines if a given coordinate is within a specified axis range
		return ( coordVal > startPos ) && ( coordVal < ( startPos + lengthVal ) );
	},
	isOverlapping: function( yCoord, xCoord, topEdge, leftEdge, vertExtent, horizExtent ) {
		// Determines if a pair of X, Y coordinates is within a given element's bounds
		return J.gui.isWithinAxis( yCoord, topEdge, vertExtent ) && J.gui.isWithinAxis( xCoord, leftEdge, horizExtent );
	}
});

})( jQuery );
/*!
 * Frontend Framework Widget 1.8.13
 *
 * (C) 2011, DEVELOPERS.txt (http://jq-toolkit.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jq-toolkit.com/GUI/Component
 */
(function( J, void_0 ) {

// For jQuery 1.4+ environments
if ( J.cleanData ) {
	var _originalClean = J.cleanData;
	J.cleanData = function( elementsToClean ) {
		for ( var iter = 0, currentEl; (currentEl = elementsToClean[iter]) != null; iter++ ) {
			J( currentEl ).triggerHandler( "remove" );
		}
		_originalClean( elementsToClean );
	};
} else {
	var _baseRemove = J.fn.remove;
	J.fn.remove = function( filterSelector, preserveData ) {
		return this.each(function() {
			if ( !preserveData ) {
				if ( !filterSelector || J.filter( filterSelector, [ this ] ).length ) {
					J( "*", this ).add( [ this ] ).each(function() {
						J( this ).triggerHandler( "remove" );
					});
				}
			}
			return _baseRemove.call( J(this), filterSelector, preserveData );
		});
	};
}

J.component = function( componentId, baseClass, componentPrototype ) {
	var moduleNamespace = componentId.split( "." )[ 0 ],
		fullComponentId;
	componentId = componentId.split( "." )[ 1 ];
	fullComponentId = moduleNamespace + "-" + componentId;

	if ( !componentPrototype ) {
		componentPrototype = baseClass;
		baseClass = J.Component;
	}

	// create a selector for this particular plugin
	J.expr[ ":" ][ fullComponentId ] = function( domEl ) {
		return !!J.data( domEl, componentId );
	};

	J[ moduleNamespace ] = J[ moduleNamespace ] || {};
	J[ moduleNamespace ][ componentId ] = function( initialOptions, targetDomElement ) {
		// Allow creation without full initialization for inheritance purposes
		if ( arguments.length ) {
			this._initializeComponent( initialOptions, targetDomElement );
		}
	};

	var parentPrototype = new baseClass();
	// We must ensure the options hash is a direct property of the new instance
	// Otherwise, we risk modifying the options hash on the shared prototype
	// from which we are inheriting
//	J.each( parentPrototype, function( propKey, propVal ) {
//		if ( J.isPlainObject(propVal) ) {
//			parentPrototype[ propKey ] = J.extend( {}, propVal );
//		}
//	});
	parentPrototype.options = J.extend( true, {}, parentPrototype.options );
	J[ moduleNamespace ][ componentId ].prototype = J.extend( true, parentPrototype, {
		namespace: moduleNamespace,
		componentName: componentId,
		eventPrefix: J[ moduleNamespace ][ componentId ].prototype.eventPrefix || componentId,
		baseCssClass: fullComponentId
	}, componentPrototype );

	J.component.bridge( componentId, J[ moduleNamespace ][ componentId ] );
};

J.component.bridge = function( pluginKey, componentClass ) {
	J.fn[ pluginKey ] = function( pluginConfiguration ) {
		var isMethodInvocation = typeof pluginConfiguration === "string",
			methodArguments = Array.prototype.slice.call( arguments, 1 ),
			operationResult = this;

		// Allow multiple configuration objects to be passed during initialization
		pluginConfiguration = !isMethodInvocation && methodArguments.length ?
			J.extend.apply( null, [ true, pluginConfiguration ].concat(methodArguments) ) :
			pluginConfiguration;

		// Prevent direct calls to internal methods (those starting with '_')
		if ( isMethodInvocation && pluginConfiguration.charAt( 0 ) === "_" ) {
			return operationResult;
		}

		if ( isMethodInvocation ) {
			this.each(function() {
				var componentInstance = J.data( this, pluginKey ),
					returnedMethodVal = componentInstance && J.isFunction( componentInstance[pluginConfiguration] ) ?
						componentInstance[ pluginConfiguration ].apply( componentInstance, methodArguments ) :
						componentInstance;
				// TODO: Re-enable this in 1.9 and use J.error() for better messaging (see #5972)
//				if ( !componentInstance ) {
//					throw "Cannot call methods on " + pluginKey + " prior to initialization; " +
//						"attempted to call method '" + pluginConfiguration + "'";
//				}
//				if ( !J.isFunction( componentInstance[pluginConfiguration] ) ) {
//					throw "No such method '" + pluginConfiguration + "' for " + pluginKey + " component instance";
//				}
//				var returnedMethodVal = componentInstance[ pluginConfiguration ].apply( componentInstance, methodArguments );
				if ( returnedMethodVal !== componentInstance && returnedMethodVal !== void_0 ) {
					operationResult = returnedMethodVal;
					return false;
				}
			});
		} else {
			this.each(function() {
				var componentInstance = J.data( this, pluginKey );
				if ( componentInstance ) {
					componentInstance.setGetOption( pluginConfiguration || {} )._initComponent();
				} else {
					J.data( this, pluginKey, new componentClass( pluginConfiguration, this ) );
				}
			});
		}

		return operationResult;
	};
};

J.Component = function( initialOpts, targetDomElement ) {
	// Allow instantiation without full initialization for simple inheritance
	if ( arguments.length ) {
		this._initializeComponent( initialOpts, targetDomElement );
	}
};

J.Component.prototype = {
	componentName: "component",
	eventPrefix: "",
	options: {
		disabled: false
	},
	_initializeComponent: function( initialOpts, targetDomElement ) {
		// J.component.bridge already stores the plugin instance, but we do it again here
		// so that it's stored even before the _createComponent function runs
		J.data( targetDomElement, this.componentName, this );
		this.element = J( targetDomElement );
		this.options = J.extend( true, {},
			this.options,
			this._fetchCreationConfig(),
			initialOpts );

		var thisRef = this;
		this.element.bind( "remove." + this.componentName, function() {
			thisRef.disposeComponent();
		});

		this._createComponent();
		this._trigger( "create" );
		this._initComponent();
	},
	_fetchCreationConfig: function() {
		return J.metadata && J.metadata.get( this.element[0] )[ this.componentName ];
	},
	_createComponent: function() {},
	_initComponent: function() {},

	disposeComponent: function() {
		this.element
			.unbind( "." + this.componentName )
			.removeData( this.componentName );
		this.getWidgetElement()
			.unbind( "." + this.componentName )
			.removeAttr( "aria-disabled" )
			.removeClass(
				this.baseCssClass + "-disabled " +
				"gui-state-disabled" );
	},

	getWidgetElement: function() {
		return this.element;
	},

	setGetOption: function( optionKey, optionValue ) {
		var configOptions = optionKey;