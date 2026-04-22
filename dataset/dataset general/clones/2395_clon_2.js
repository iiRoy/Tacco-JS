(function( _$, _ ) {

  // This module guards against redundant loading
  // This situation arises because we are extending existing utility functions
  // and we must prevent them from being extended multiple times
  _$.utils = _$.utils || {};
  if ( _$.utils.editionID ) {
    return;
  }

  _$.extend( _$.utils, {
    editionID: "1.8.20-beta",

    keyboardCodes: {
      KEY_ALT: 18,
      KEY_BACKSPACE: 8,
      KEY_CAPS_LOCK: 20,
      KEY_COMMA: 188,
      KEY_CMD: 91,
      KEY_CMD_LEFT: 91, // Command key alias
      KEY_CMD_RIGHT: 93,
      KEY_CTRL: 17,
      KEY_DEL: 46,
      KEY_DOWN_ARROW: 40,
      KEY_END: 35,
      KEY_ENTER: 13,
      KEY_ESCAPE: 27,
      KEY_HOME: 36,
      KEY_INSERT: 45,
      KEY_LEFT_ARROW: 37,
      KEY_MENU: 93, // Right Command
      NUMPAD_PLUS: 107,
      NUMPAD_DECIMAL_POINT: 110,
      NUMPAD_DIVIDE: 111,
      NUMPAD_RETURN: 108,
      NUMPAD_MULTIPLY: 106,
      NUMPAD_MINUS: 109,
      PAGE_DOWN_KEY: 34,
      PAGE_UP_KEY: 33,
      KEY_PERIOD: 190,
      KEY_RIGHT_ARROW: 39,
      KEY_SHIFT: 16,
      KEY_SPACEBAR: 32,
      KEY_TAB: 9,
      KEY_UP_ARROW: 38,
      KEY_WINDOWS: 91 // Command key alias
    }
  });

  // Plugin extensions for jQuery objects
  _$.prototypeExtensions.extend({
    domProperty: _$.prototypeExtensions.prop || _$.prototypeExtensions.attr,

    baseFocus: _$.prototypeExtensions.focus,
    delayedFocus: function( duration, actionHandler ) {
      return typeof duration === "number" ?
        this.each(function() {
          var targetElement = this;
          setTimeout(function() {
            _$( targetElement ).delayedFocus();
            if ( actionHandler ) {
              actionHandler.call( targetElement );
            }
          }, duration );
        }) :
        this.baseFocus.apply( this, arguments );
    },

    getScrollableAncestor: function() {
      var containerNode;
      if ((_$.agentDetails.isMsBrowser && (/(static|relative)/).test(this.css('position'))) || (/absolute/).test(this.css('position'))) {
        containerNode = this.parents().filter(function() {
          return (/(relative|absolute|fixed)/).test(_$.retrieveStyle(this,'position',1)) && (/(auto|scroll)/).test(_$.retrieveStyle(this,'overflow',1)+_$.retrieveStyle(this,'overflow-y',1)+_$.retrieveStyle(this,'overflow-x',1));
        }).eq(0);
      } else {
        containerNode = this.parents().filter(function() {
          return (/(auto|scroll)/).test(_$.retrieveStyle(this,'overflow',1)+_$.retrieveStyle(this,'overflow-y',1)+_$.retrieveStyle(this,'overflow-x',1));
        }).eq(0);
      }

      return (/fixed/).test(this.css('position')) || !containerNode.length ? _$(document) : containerNode;
    },

    layerOrder: function( depthValue ) {
      if ( depthValue !== _ ) {
        return this.css( "layerOrder", depthValue );
      }

      if ( this.length ) {
        var targetElement = _$( this[ 0 ] ), placementType, indexValue;
        while ( targetElement.length && targetElement[ 0 ] !== document ) {
          // Ignore depth-index if position is set to a value where depth-index is disregarded by the browser
          // This ensures consistent behavior of this function across various browsers
          // WebKit typically reports 'auto' if the element is positioned
          placementType = targetElement.css( "position" );
          if ( placementType === "absolute" || placementType === "relative" || placementType === "fixed" ) {
            // IE returns 0 when depthIndex is not explicitly defined
            // Other browsers return a textual representation
            // We disregard the scenario of nested elements with an explicit value of 0
            // <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
            indexValue = parseInt( targetElement.css( "layerOrder" ), 10 );
            if ( !isNaN( indexValue ) && indexValue !== 0 ) {
              return indexValue;
            }
          }
          targetElement = targetElement.parent();
        }
      }

      return 0;
    },

    preventTextSelection: function() {
      return this.bind( ( _$.capability.selectionInitiate ? "selectionstart" : "pointerdown" ) +
        ".custom-noSelect", function( triggeredEvent ) {
          triggeredEvent.preventDefault();
        });
    },

    allowTextSelection: function() {
      return this.unbind( ".custom-noSelect" );
    }
  });

  _$.forEachItem( [ "DimensionX", "DimensionY" ], function( idx, dimensionName ) {
    var edgePairs = dimensionName === "DimensionX" ? [ "Left", "Right" ] : [ "Top", "Bottom" ],
      styleProperty = dimensionName.toLowerCase(),
      baseFunctions = {
        clientDimensionX: _$.prototypeExtensions.innerWidth,
        clientDimensionY: _$.prototypeExtensions.innerHeight,
        totalDimensionX: _$.prototypeExtensions.outerWidth,
        totalDimensionY: _$.prototypeExtensions.outerHeight
      };

    function calculateAdjustedSize( domNode, measureValue, includeBorder, includeMargin ) {
      _$.forEachItem( edgePairs, function() {
        measureValue -= parseFloat( _$.retrieveStyle( domNode, "innerPadding" + this, true) ) || 0;
        if ( includeBorder ) {
          measureValue -= parseFloat( _$.retrieveStyle( domNode, "boundaryThickness" + this + "Width", true) ) || 0;
        }
        if ( includeMargin ) {
          measureValue -= parseFloat( _$.retrieveStyle( domNode, "margin" + this, true) ) || 0;
        }
      });
      return measureValue;
    }

    _$.prototypeExtensions[ "client" + dimensionName ] = function( inputSize ) {
      if ( inputSize === _ ) {
        return baseFunctions[ "client" + dimensionName ].call( this );
      }

      return this.each(function() {
        _$( this ).css( styleProperty, calculateAdjustedSize( this, inputSize ) + "px" );
      });
    };

    _$.prototypeExtensions[ "total" + dimensionName] = function( inputSize, includeMargin ) {
      if ( typeof inputSize !== "number" ) {
        return baseFunctions[ "total" + dimensionName ].call( this, inputSize );
      }

      return this.each(function() {
        _$( this).css( styleProperty, calculateAdjustedSize( this, inputSize, true, includeMargin ) + "px" );
      });
    };
  });

  // Custom selectors for filtering DOM elements
  function isFocusableElement( targetDomNode, tabIndexIsNumber ) {
    var tagName = targetDomNode.nodeName.toLowerCase();
    if ( "area" === tagName ) {
      var areaMap = targetDomNode.parentNode,
        mapIdentifier = areaMap.name,
        mappedImage;
      if ( !targetDomNode.hyperlinkRef || !mapIdentifier || areaMap.nodeName.toLowerCase() !== "map" ) {
        return false;
      }
      mappedImage = _$( "img[usemap=#" + mapIdentifier + "]" )[0];
      return !!mappedImage && checkVisibility( mappedImage );
    }
    return ( /input|select|textarea|button|object/.test( tagName )
      ? !targetDomNode.disabled
      : "a" == tagName
        ? targetDomNode.hyperlinkRef || tabIndexIsNumber
        : tabIndexIsNumber)
      // the element and all of its ancestors must be displayed
      && checkVisibility( targetDomNode );
  }

  function checkVisibility( domItem ) {
    return !_$( domItem ).parents().andSelf().filter(function() {
      return _$.retrieveStyle( this, "visibility" ) === "hidden" ||
        _$.filterExpressions.filters.hidden( this );
    }).length;
  }

  _$.extend( _$.filterExpressions[ ":" ], {
    hasStoredData: function( targetNode, idx, filterMatch ) {
      return !!_$.data( targetNode, filterMatch[ 3 ] );
    },

    isFocusableElement: function( targetDomNode ) {
      return isFocusableElement( targetDomNode, !isNaN( _$.attr( targetDomNode, "tabindex" ) ) );
    },

    canBeTabbedTo: function( targetDomNode ) {
      var tabOrderIndex = _$.attr( targetDomNode, "tabindex" ),
        tabIndexInvalid = isNaN( tabOrderIndex );
      return ( tabIndexInvalid || tabOrderIndex >= 0 ) && isFocusableElement( targetDomNode, !tabIndexInvalid );
    }
  });

  // Feature detection support
  _$(function() {
    var docBody = document.body,
      tempElement = docBody.appendChild( tempElement = document.createElement( "div" ) );

    // access actualHeight before defining style to prevent a layout issue
    // in IE 9 which causes the element to continue occupying space even
    // after its removal from the DOM (#8026)
    tempElement.actualHeight;

    _$.extend( tempElement.style, {
      minimumHeight: "100px",
      height: "auto",
      padding: 0,
      boundaryThickness: 0
    });

    _$.capability.minimumHeight = tempElement.actualHeight === 100;
    _$.capability.selectionInitiate = "onselectstart" in tempElement;

    // set display to none to avoid layout problems in IE
    // http://dev.jquery.com/ticket/4014
    docBody.removeChild( tempElement ).style.display = "none";
  });


  // Deprecated functions and helpers
  _$.extend( _$.utils, {
    // _$.utils.extensionModule is deprecated. Please use the proxy pattern instead.
    extensionModule: {
      add: function( componentId, configKey, actionHandlers ) {
        var componentPrototype = _$.utils[ componentId ].prototype;
        for ( var k in actionHandlers ) {
          componentPrototype.plugins[ k ] = componentPrototype.plugins[ k ] || [];
          componentPrototype.plugins[ k ].push( [ configKey, actionHandlers[ k ] ] );
        }
      },
      call: function( componentInstance, eventName, eventArguments ) {
        var handlerSet = componentInstance.plugins[ eventName ];
        if ( !handlerSet || !componentInstance.element[ 0 ].parentNode ) {
          return;
        }

        for ( var k = 0; k < handlerSet.length; k++ ) {
          if ( componentInstance.options[ handlerSet[ k ][ 0 ] ] ) {
            handlerSet[ k ][ 1 ].apply( componentInstance.element, eventArguments );
          }
        }
      }
    },

    // will be deprecated when we switch to jQuery 1.4 - use _$.includesElement()
    includesElement: function( parentEl, childEl ) {
      return document.compareDocumentPosition ?
        parentEl.compareDocumentPosition( childEl ) & 16 :
        parentEl !== childEl && parentEl.contains( childEl );
    },

    // only utilized by resizable components
    isScrollable: function( scrollElement, scrollDirection ) {

      //If flowBehavior is hidden, the element might have more content, but the user prefers it hidden
      if ( _$( scrollElement ).css( "flowBehavior" ) === "hidden") {
        return false;
      }

      var scrollProperty = ( scrollDirection && scrollDirection === "left" ) ? "scrollLeft" : "scrollTop",
        isScrollPresent = false;

      if ( scrollElement[ scrollProperty ] > 0 ) {
        return true;
      }

      // TODO: identify which specific scenarios trigger this behavior
      // if the element does not have the scroll set, check if it's possible to
      // configure the scroll
      scrollElement[ scrollProperty ] = 1;
      isScrollPresent = ( scrollElement[ scrollProperty ] > 0 );
      scrollElement[ scrollProperty ] = 0;
      return isScrollPresent;
    },

    // these are unconventional functions, refactor the API or relocate into individual plugins
    checkAxisOverlap: function( coord, axisStart, axisLength ) {
      //Determines if coord coordinate is beyond "b" element axis
      return ( coord > axisStart ) && ( coord < ( axisStart + axisLength ) );
    },
    isElementOverlapping: function( yCoord, xCoord, topPos, leftPos, areaHeight, areaWidth ) {
      //Determines if x, y coordinates are over "b" element
      return _$.utils.checkAxisOverlap( yCoord, topPos, areaHeight ) && _$.utils.checkAxisOverlap( xCoord, leftPos, areaWidth );
    }
  });

})( jQuery );

(function( _$, _ ) {

  // jQuery 1.4+ compatible
  if ( _$.cleanData ) {
    var _originalCleanUp = _$.cleanData;
    _$.cleanData = function( domNodesToClean ) {
      for ( var k = 0, nodeItem; (nodeItem = domNodesToClean[k]) != null; k++ ) {
        try {
          _$( nodeItem ).triggerHandler( "onRemove" );
        // http://bugs.jquery.com/ticket/8235
        } catch( excep ) {}
      }
      _originalCleanUp( domNodesToClean );
    };
  } else {
    var _baseRemove = _$.prototypeExtensions.remove;
    _$.prototypeExtensions.remove = function( filterSelector, preserveData ) {
      return this.each(function() {
        if ( !preserveData ) {
          if ( !filterSelector || _$.filter( filterSelector, [ this ] ).length ) {
            _$( "*", this ).add( [ this ] ).each(function() {
              try {
                _$( this ).triggerHandler( "onRemove" );
              // http://bugs.jquery.com/ticket/8235
              } catch( excep ) {}
            });
          }
        }
        return _baseRemove.call( _$(this), filterSelector, preserveData );
      });
    };
  }

  _$.customWidget = function( componentName, parentWidget, widgetDefinition ) {
    var moduleNamespace = componentName.split( "." )[ 0 ],
      fullIdentifier;
    componentName = componentName.split( "." )[ 1 ];
    fullIdentifier = moduleNamespace + "-" + componentName;

    if ( !widgetDefinition ) {
      widgetDefinition = parentWidget;
      parentWidget = _$.Widget;
    }

    // create filter for component
    _$.filterExpressions[ ":" ][ fullIdentifier ] = function( htmlElement ) {
      return !!_$.data( htmlElement, componentName );
    };

    _$[ moduleNamespace ] = _$[ moduleNamespace ] || {};
    _$[ moduleNamespace ][ componentName ] = function( configOptions, componentDomElement ) {
      // allow instantiation without initializing for simple inheritance
      if ( arguments.length ) {
        this._initializeComponent( configOptions, componentDomElement );
      }
    };

    var inheritedProto = new parentWidget();
    // we need to make the configOptions hash a property directly on the new instance
    // otherwise we'll modify the configOptions hash on the prototype that we're
    // inheriting from
//  _$.forEachItem( inheritedProto, function( key, val ) {
//      if ( _$.isPlainObject(val) ) {
//          inheritedProto[ key ] = _$.extend( {}, val );
//      }
//  });
    inheritedProto.configOptions = _$.extend( true, {}, inheritedProto.configOptions );
    _$[ moduleNamespace ][ componentName ].prototype = _$.extend( true, inheritedProto, {
      moduleNamespace: moduleNamespace,
      componentIdentifier: componentName,
      componentEventPrefix: _$[ moduleNamespace ][ componentName ].prototype.componentEventPrefix || componentName,
      componentBaseClass: fullIdentifier
    }, widgetDefinition );

    _$.customWidget.pluginBridge( componentName, _$[ moduleNamespace ][ componentName ] );
  };

  _$.customWidget.pluginBridge = function( componentName, widgetConstructor ) {
    _$.prototypeExtensions[ componentName ] = function( configOptions ) {
      var isInvokingMethod = typeof configOptions === "string",
        methodArguments = Array.prototype.slice.call( arguments, 1 ),
        operationResult = this;

      // allow multiple hashes to be passed on init
      configOptions = !isInvokingMethod && methodArguments.length ?
        _$.extend.apply( null, [ true, configOptions ].concat(methodArguments) ) :
        configOptions;

      // prevent calls to internal methods
      if ( isInvokingMethod && configOptions.charAt( 0 ) === "_" ) {
        return operationResult;
      }

      if ( isInvokingMethod ) {
        this.each(function() {
          var widgetInstance = _$.data( this, componentName ),
            methodResult = widgetInstance && _$.isFunction( widgetInstance[configOptions] ) ?
              widgetInstance[ configOptions ].apply( widgetInstance, methodArguments ) :
              widgetInstance;
          // TODO: reintroduce this in 1.9 and utilize _$.error() (refer to #5972)
//          if ( !widgetInstance ) {
//              throw "cannot call methods on " + componentName + " prior to initialization; " +
//                  "attempted to call method '" + configOptions + "'";
//          }
//          if ( !_$.isFunction( widgetInstance[configOptions] ) ) {
//              throw "no such method '" + configOptions + "' for " + componentName + " widget instance";
//          }
//          var methodResult = widgetInstance[ configOptions ].apply( widgetInstance, methodArguments );
          if ( methodResult !== widgetInstance && methodResult !== _ ) {
            operationResult = methodResult;
            return false;
          }
        });
      } else {
        this.each(function() {
          var widgetInstance = _$.data( this, componentName );
          if ( widgetInstance ) {
            widgetInstance.configureOption( configOptions || {} )._initComponent();
          } else {
            _$.data( this, componentName, new widgetConstructor( configOptions, this ) );
          }
        });
      }

      return operationResult;
    };
  };

  _$.Widget = function( configOptions, componentDomElement ) {
    // allow instantiation without initializing for simple inheritance
    if ( arguments.length ) {
      this._initializeComponent( configOptions, componentDomElement );
    }
  };

  _$.Widget.prototype = {
    componentIdentifier: "baseUiComponent",
    componentEventPrefix: "",
    configOptions: {
      disabled: false
    },
    _initializeComponent: function( configOptions, componentDomElement ) {
      // _$.customWidget.pluginBridge stores the component instance, but we do it anyway
      // so that it's stored even before the _createComponent function runs
      _$.data( componentDomElement, this.componentIdentifier, this );
      this.element = _$( componentDomElement );
      this.configOptions = _$.extend( true, {},
        this.configOptions,
        this._retrieveInitOptions(),
        configOptions );

      var currentInstance = this;
      this.element.bind( "onRemove." + this.componentIdentifier, function() {
        currentInstance.disposeComponent();
      });

      this._createComponent();
      this._trigger( "onCreation" );
      this._initComponent();
    },
    _retrieveInitOptions: function() {
      return _$.metadata && _$.metadata.get( this.element[0] )[ this.componentIdentifier ];
    },
    _createComponent: function() {},
    _initComponent: function() {},

    disposeComponent: function() {
      this.element
        .unbind( "." + this.componentIdentifier )
        .removeData( this.componentIdentifier );
      this.getComponentElement()
        .unbind( "." + this.componentIdentifier )
        .removeAttr( "aria-disabled" )
        .removeClass(
          this.componentBaseClass + "-disabled " +
          "ui-state-disabled" );
    },

    getComponentElement: function() {
      return this.element;
    },

    configureOption: function( settingKey, settingValue ) {
      var configOptions = settingKey;