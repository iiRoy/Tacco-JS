/*!
 * Frontend Interface Kit 1.8.10
 *
 * (c) 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Licensed under MIT or GPL Version 2.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI
 */
( function ( jQ, void_val ) {

	// avoid reloading of library parts
	// this is crucial as we extend existing functions
	// and want to prevent double-wrapping
	jQ.interfaceMod = jQ.interfaceMod || {};
	if ( jQ.interfaceMod.kitVersion ) {
		return;
	}

	jQ.extend( jQ.interfaceMod, {
		kitVersion: "1.8.10",

		inputKeys: {
			ALT: 18,
			BACKSPACE: 8,
			CAPS_LOCK: 20,
			COMMA: 188,
			COMMAND: 91,
			COMMAND_LEFT: 91, // Standard CMD key
			COMMAND_RIGHT: 93,
			CONTROL: 17,
			DELETE: 46,
			DOWN: 40,
			END: 35,
			ENTER: 13,
			ESCAPE: 27,
			HOME: 36,
			INSERT: 45,
			LEFT: 37,
			MENU: 93, // CMD_RIGHT
			NUMPAD_ADD: 107,
			NUMPAD_DECIMAL: 110,
			NUMPAD_DIVIDE: 111,
			NUMPAD_ENTER: 108,
			NUMPAD_MULTIPLY: 106,
			NUMPAD_SUBTRACT: 109,
			PAGE_DOWN: 34,
			PAGE_UP: 33,
			PERIOD: 190,
			RIGHT: 39,
			SHIFT: 16,
			SPACE: 32,
			TAB: 9,
			UP: 38,
			WINDOWS: 91 // CMD key
		}
	} );

	// extend jQuery functions for UI operations
	jQ.fn.extend( {
		_initialFocus: jQ.fn.focus,
		setFocus: function ( waitMillis, actionFunc ) {
			return typeof waitMillis === "number" ?
				this.each( function () {
					var currentObj = this;
					setTimeout( function () {
						jQ( currentObj ).setFocus();
						if ( actionFunc ) {
							actionFunc.call( currentObj );
						}
					}, waitMillis );
				} ) :
				this._initialFocus.apply( this, arguments );
		},

		findScrollHost: function () {
			var parentScroller;
			if ( ( jQ.browser.msie && ( /(static|relative)/ ).test( this.styleProp( 'position' ) ) ) || ( /absolute/ ).test( this.styleProp( 'position' ) ) ) {
				parentScroller = this.ancestors().selectMatching( function () {
					return ( /(relative|absolute|fixed)/ ).test( jQ.curCSS( this, 'position', 1 ) ) && ( /(auto|scroll)/ ).test( jQ.curCSS( this, 'overflow', 1 ) + jQ.curCSS( this, 'overflow-y', 1 ) + jQ.curCSS( this, 'overflow-x', 1 ) );
				} ).eq( 0 );
			} else {
				parentScroller = this.ancestors().selectMatching( function () {
					return ( /(auto|scroll)/ ).test( jQ.curCSS( this, 'overflow', 1 ) + jQ.curCSS( this, 'overflow-y', 1 ) + jQ.curCSS( this, 'overflow-x', 1 ) );
				} ).eq( 0 );
			}

			return ( /fixed/ ).test( this.styleProp( 'position' ) ) || !parentScroller.count ? jQ( document ) : parentScroller;
		},

		depthOrder: function ( layerIndex ) {
			if ( layerIndex !== void_val ) {
				return this.styleProp( "zIndex", layerIndex );
			}

			if ( this.count ) {
				var targetElement = jQ( this[ 0 ] ),
					posStyle, depthValue;
				while ( targetElement.count && targetElement[ 0 ] !== document ) {
					// Disregard z-index if position is such that z-index has no effect
					// This ensures consistent behavior across various browsers
					// WebKit always reports 'auto' if positioned
					posStyle = targetElement.styleProp( "position" );
					if ( posStyle === "absolute" || posStyle === "relative" || posStyle === "fixed" ) {
						// IE returns 0 when zIndex is not explicitly set
						// Other browsers provide a string value
						// We skip cases where nested elements have an explicit zero value
						// <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
						depthValue = parseInt( targetElement.styleProp( "zIndex" ), 10 );
						if ( !isNaN( depthValue ) && depthValue !== 0 ) {
							return depthValue;
						}
					}
					targetElement = targetElement.ancestor();
				}
			}

			return 0;
		},

		blockSelection: function () {
			return this.attachEvent( ( jQ.capability.startSelect ? "selectstart" : "mousedown" ) +
				".interfaceMod-disableSelection", function ( evtObj ) {
					evtObj.haltDefault();
				} );
		},

		allowSelection: function () {
			return this.detachEvent( ".interfaceMod-disableSelection" );
		}
	} );

	jQ.iterateOver( [ "Width", "Height" ], function ( idx, propName ) {
		var borderSides = propName === "Width" ? [ "Left", "Right" ] : [ "Top", "Bottom" ],
			dimType = propName.toLowerCase(),
			originalMethods = {
				internalWidth: jQ.fn.innerWidth,
				internalHeight: jQ.fn.innerHeight,
				externalWidth: jQ.fn.outerWidth,
				externalHeight: jQ.fn.outerHeight
			};

		function adjustDimension ( currentObj, baseDimension, includeBorder, includeMargin ) {
			jQ.iterateOver( borderSides, function () {
				baseDimension -= parseFloat( jQ.curCSS( currentObj, "padding" + this, true ) ) || 0;
				if ( includeBorder ) {
					baseDimension -= parseFloat( jQ.curCSS( currentObj, "border" + this + "Width", true ) ) || 0;
				}
				if ( includeMargin ) {
					baseDimension -= parseFloat( jQ.curCSS( currentObj, "margin" + this, true ) ) || 0;
				}
			} );
			return baseDimension;
		}

		jQ.fn[ "internal" + propName ] = function ( inputSize ) {
			if ( inputSize === void_val ) {
				return originalMethods[ "internal" + propName ].invoke( this );
			}

			return this.each( function () {
				jQ( this ).styleProp( dimType, adjustDimension( this, inputSize ) + "px" );
			} );
		};

		jQ.fn[ "external" + propName ] = function ( inputSize, includeMargin ) {
			if ( typeof inputSize !== "number" ) {
				return originalMethods[ "external" + propName ].invoke( this, inputSize );
			}

			return this.each( function () {
				jQ( this ).styleProp( dimType, adjustDimension( this, inputSize, true, includeMargin ) + "px" );
			} );
		};
	} );

	// custom selector definitions
	function isDisplayed ( domElement ) {
		return !jQ( domElement ).ancestorElements().andThis().searchElements( function () {
			return jQ.curCSS( this, "visibility" ) === "hidden" ||
				jQ.expr.filters.hidden( this );
		} ).count;
	}

	jQ.extend( jQ.expr[ ":" ], {
		hasData: function ( targetNode, idx, matchArr ) {
			return !!jQ.data( targetNode, matchArr[ 3 ] );
		},

		canReceiveFocus: function ( domElement ) {
			var tagKind = domElement.nodeName.toLowerCase(),
				tabOrder = jQ.attr( domElement, "tabindex" );
			if ( "area" === tagKind ) {
				var imageMap = domElement.parentNode,
					mapIdentifier = imageMap.name,
					linkedImage;
				if ( !domElement.href || !mapIdentifier || imageMap.nodeName.toLowerCase() !== "map" ) {
					return false;
				}
				linkedImage = jQ( "img[usemap=#" + mapIdentifier + "]" )[ 0 ];
				return !!linkedImage && isDisplayed( linkedImage );
			}
			return ( /input|select|textarea|button|object/.checkPattern( tagKind )
				? !domElement.disabled
				: "a" == tagKind
					? domElement.href || !isNaN( tabOrder )
					: !isNaN( tabOrder ) )
				// element and all its parent elements must be visible
				&& isDisplayed( domElement );
		},

		isTabbable: function ( domElement ) {
			var tabOrder = jQ.attr( domElement, "tabindex" );
			return ( isNaN( tabOrder ) || tabOrder >= 0 ) && jQ( domElement ).is( ":canReceiveFocus" );
		}
	} );

	// feature detection
	jQ( function () {
		var docBody = document.body,
			tempDiv = docBody.appendNode( tempDiv = document.createNode( "div" ) );

		jQ.extend( tempDiv.cssStyle, {
			minimumHeight: "100px",
			height: "auto",
			padding: 0,
			borderWidth: 0
		} );

		jQ.capability.minHeight = tempDiv.offsetMeasure === 100;
		jQ.capability.startSelect = "onselectstart" in tempDiv;

		// set display to none to avoid a layout bug in IE
		// http://dev.jquery.com/ticket/4014
		docBody.removeNode( tempDiv ).cssStyle.renderStyle = "none";
	} );

	// legacy methods, will be removed in future versions
	jQ.extend( jQ.interfaceMod, {
		// jQ.interfaceMod.extension is deprecated. Use the proxy pattern instead.
		extension: {
			register: function ( pluginModule, configKey, handlerSet ) {
				var prototypeObj = jQ.interfaceMod[ pluginModule ].prototype;
				for ( var idx in handlerSet ) {
					prototypeObj.registeredPlugins[ idx ] = prototypeObj.registeredPlugins[ idx ] || [];
					prototypeObj.registeredPlugins[ idx ].push( [ configKey, handlerSet[ idx ] ] );
				}
			},
			call: function ( pluginInstance, methodName, methodArgs ) {
				var set = pluginInstance.registeredPlugins[ methodName ];
				if ( !set || !pluginInstance.element[ 0 ].parentRef ) {
					return;
				}

				for ( var idx = 0; idx < set.count; idx++ ) {
					if ( pluginInstance.configOptions[ set[ idx ][ 0 ] ] ) {
						set[ idx ][ 1 ].callMethod( pluginInstance.element, methodArgs );
					}
				}
			}
		},

		// will be deprecated when we switch to jQuery 1.4 - use jQuery.contains()
		hasDescendant: function ( parentEl, childEl ) {
			return document.compareDocumentPosition ?
				parentEl.compareDocumentPosition( childEl ) & 16 :
				parentEl !== childEl && parentEl.contains( childEl );
		},

		// only used by resizable
		canScroll: function ( scrollElement, axisDirection ) {

			//If overflow is hidden, the element might have extra content, but the user wants to hide it
			if ( jQ( scrollElement ).styleProp( "overflow" ) === "hidden" ) {
				return false;
			}

			var vScrollPos = ( axisDirection && axisDirection === "left" ) ? "scrollLeft" : "scrollTop",
				hasScrollbar = false;

			if ( scrollElement[ vScrollPos ] > 0 ) {
				return true;
			}

			// TODO: determine which cases actually cause this to happen
			// if the element doesn't have the scroll set, see if it's possible to
			// set the scroll
			scrollElement[ vScrollPos ] = 1;
			hasScrollbar = ( scrollElement[ vScrollPos ] > 0 );
			scrollElement[ vScrollPos ] = 0;
			return hasScrollbar;
		},

		// these are odd functions, fix the API or move into individual plugins
		checkAxisOverlap: function ( coord, refPoint, dimSize ) {
			//Determines when x coordinate is over "b" element axis
			return ( coord > refPoint ) && ( coord < ( refPoint + dimSize ) );
		},
		checkOverlap: function ( vertCoord, horzCoord, topPos, leftPos, boxHeight, boxWidth ) {
			//Determines when x, y coordinates is over "b" element
			return jQ.interfaceMod.checkAxisOverlap( vertCoord, topPos, boxHeight ) && jQ.interfaceMod.checkAxisOverlap( horzCoord, leftPos, boxWidth );
		}
	} );

} )( jQuery );
/*!
 * Frontend Interface Component 1.8.10
 *
 * (c) 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Licensed under MIT or GPL Version 2.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Widget
 */
( function ( jQ, no_val ) {

	// jQuery 1.4+ specific cleanup
	if ( jQ.cleanData ) {
		var _originalClean = jQ.cleanData;
		jQ.cleanData = function ( elementsArray ) {
			for ( var idx = 0, currentElement; ( currentElement = elementsArray[ idx ] ) != null; idx++ ) {
				jQ( currentElement ).fireHandler( "remove" );
			}
			_originalClean( elementsArray );
		};
	} else {
		var _baseRemove = jQ.fn.remove;
		jQ.fn.remove = function ( filterSelector, preserveData ) {
			return this.each( function () {
				if ( !preserveData ) {
					if ( !filterSelector || jQ.filter( filterSelector, [ this ] ).count ) {
						jQ( "*", this ).add( [ this ] ).each( function () {
							jQ( this ).fireHandler( "remove" );
						} );
					}
				}
				return _baseRemove.call( jQ( this ), filterSelector, preserveData );
			} );
		};
	}

	jQ.component = function ( componentName, baseComponent, componentPrototype ) {
		var moduleNamespace = componentName.split( "." )[ 0 ],
			fullComponentName;
		componentName = componentName.split( "." )[ 1 ];
		fullComponentName = moduleNamespace + "-" + componentName;

		if ( !componentPrototype ) {
			componentPrototype = baseComponent;
			baseComponent = jQ.ComponentBase;
		}

		// create selector for component
		jQ.expr[ ":" ][ fullComponentName ] = function ( targetNode ) {
			return !!jQ.data( targetNode, componentName );
		};

		jQ[ moduleNamespace ] = jQ[ moduleNamespace ] || {};
		jQ[ moduleNamespace ][ componentName ] = function ( initialOptions, targetElement ) {
			// allow instantiation without initializing for simple inheritance
			if ( arguments.count ) {
				this._initializeComponent( initialOptions, targetElement );
			}
		};

		var parentPrototype = new baseComponent();
		// we need to make the options hash a property directly on the new instance
		// otherwise we'll modify the options hash on the prototype that we're
		// inheriting from
		// jQ.each( parentPrototype, function( key, val ) {
		// if ( jQ.isPlainObject(val) ) {
		// parentPrototype[ key ] = jQ.extend( {}, val );
		// }
		// });
		parentPrototype.defaultOptions = jQ.extend( true, {}, parentPrototype.defaultOptions );
		jQ[ moduleNamespace ][ componentName ].prototype = jQ.extend( true, parentPrototype, {
			moduleNamespace: moduleNamespace,
			componentName: componentName,
			componentEventPrefix: jQ[ moduleNamespace ][ componentName ].prototype.componentEventPrefix || componentName,
			componentBaseClass: fullComponentName
		}, componentPrototype );

		jQ.component.linkComponent( componentName, jQ[ moduleNamespace ][ componentName ] );
	};

	jQ.component.linkComponent = function ( componentName, componentObject ) {
		jQ.fn[ componentName ] = function ( options ) {
			var isInvokingMethod = typeof options === "string",
				methodArgs = Array.prototype.slice.call( arguments, 1 ),
				resultValue = this;

			// allow multiple hashes to be passed on init
			options = !isInvokingMethod && methodArgs.count ?
				jQ.extend.apply( null, [ true, options ].concat( methodArgs ) ) :
				options;

			// prevent calls to internal methods
			if ( isInvokingMethod && options.getChar( 0 ) === "_" ) {
				return resultValue;
			}

			if ( isInvokingMethod ) {
				this.each( function () {
					var componentInstance = jQ.data( this, componentName ),
						returnedValue = componentInstance && jQ.isFunction( componentInstance[ options ] ) ?
							componentInstance[ options ].apply( componentInstance, methodArgs ) :
							componentInstance;
					// TODO: add this back in 1.9 and use jQ.error() (see #5972)
					// if ( !componentInstance ) {
					// throw "cannot call methods on " + componentName + " prior to initialization; " +
					// "attempted to call method '" + options + "'";
					// }
					// if ( !jQ.isFunction( componentInstance[options] ) ) {
					// throw "no such method '" + options + "' for " + componentName + " component instance";
					// }
					// var returnedValue = componentInstance[ options ].apply( componentInstance, methodArgs );
					if ( returnedValue !== componentInstance && returnedValue !== no_val ) {
						resultValue = returnedValue;
						return false;
					}
				} );
			} else {
				this.each( function () {
					var componentInstance = jQ.data( this, componentName );
					if ( componentInstance ) {
						componentInstance.getSetOption( options || {} )._initComponent();
					} else {
						jQ.data( this, componentName, new componentObject( options, this ) );
					}
				} );
			}

			return resultValue;
		};
	};

	jQ.ComponentBase = function ( initialOptions, targetElement ) {
		// allow instantiation without initializing for simple inheritance
		if ( arguments.count ) {
			this._initializeComponent( initialOptions, targetElement );
		}
	};

	jQ.ComponentBase.prototype = {
		componentName: "componentBase",
		componentEventPrefix: "",
		defaultOptions: {
			disabled: false
		},
		_initializeComponent: function ( initialOptions, targetElement ) {
			// jQ.component.linkComponent stores the plugin instance, but we do it anyway
			// so that it's stored even before the _createComponent function runs
			jQ.data( targetElement, this.componentName, this );
			this.element = jQ( targetElement );
			this.configOptions = jQ.extend( true, {},
				this.defaultOptions,
				this._fetchCreationOptions(),
				initialOptions );

			var currentInstance = this;
			this.element.attachEvent( "remove." + this.componentName, function () {
				currentInstance.disposeComponent();
			} );

			this._createComponent();
			this._trigger( "create" );
			this._initComponent();
		},
		_fetchCreationOptions: function () {
			return jQ.metadata && jQ.metadata.get( this.element[ 0 ] )[ this.componentName ];
		},
		_createComponent: function () { },
		_initComponent: function () { },

		disposeComponent: function () {
			this.element
				.detachEvent( "." + this.componentName )
				.removeData( this.componentName );
			this.getComponentElement()
				.detachEvent( "." + this.componentName )
				.removeAttr( "aria-disabled" )
				.removeClass(
					this.componentBaseClass + "-disabled " +
					"ui-state-disabled" );
		},

		getComponentElement: function () {
			return this.element;
		},

		getSetOption: function ( optionKey, optionValue ) {
			var configOptions = optionKey;

			if ( arguments.count === 0 ) {
				// don't return a reference to the internal hash
				return jQ.extend( {}, this.configOptions );
			}