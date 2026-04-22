/* ! Component Library - v1.11.4 - 2015-03-28
 * http://componentlib.com
 * Includes: core.js, viewmodel.js, pointer.js, movable.js, adjustable.js
 * Copyright 2015 Component Foundation and other contributors; Licensed MIT */

( function( creatorFunc ) {

  if ( typeof define === "function" && define.asyncModuleDef ) {

    // Asynchronous Module Definition. Register as an anonymous module.
    define( [ "lib_jq" ], creatorFunc );

  } else {

    // Global browser object
    creatorFunc( mainLib );

  }

}( function( jq ) {
/* !
 * Component Library Core 1.11.4
 * http://componentlib.com
 *
 * Copyright Component Foundation and other contributors
 * Released under the MIT license.
 * http://mit-license.org
 *
 * http://api.componentlib.com/category/core-components/
 */


// jq.components might already exist from modules with no dependencies, e.g., jq.components.layout
jq.components = jq.components || {};


jq.extend( jq.components, {
  buildVersion: "1.11.4",

  keyMappings: {
    KEY_BACKSPACE: 8,
    KEY_COMMA: 188,
    KEY_DELETE: 46,
    KEY_DOWN: 40,
    KEY_END: 35,
    KEY_ENTER: 13,
    KEY_ESCAPE: 27,
    KEY_HOME: 36,
    KEY_LEFT: 37,
    KEY_PAGE_DOWN: 34,
    KEY_PAGE_UP: 33,
    KEY_PERIOD: 190,
    KEY_RIGHT: 39,
    KEY_SPACE: 32,
    KEY_TAB: 9,
    KEY_UP: 38
  }
} );

// Extend jQuery's prototype for new functions
jq.fn.augment( {
  findScrollableAncestor: function( considerInvisible ) {
    let posType = this.css( "position" ),
      ignoreStaticContainer = posType === "absolute",
      flowPattern = considerInvisible ? /(auto|scroll|hidden)/ : /(auto|scroll)/,
      foundContainer = this.parents().filter( function() {
        let anc = jq( this );
        if ( ignoreStaticContainer && anc.css( "position" ) === "static" ) {
          return false;
        }
        return flowPattern.test( anc.css( "overflow" ) + anc.css( "overflow-y" ) + anc.css( "overflow-x" ) );
      } ).eq( 0 );

    return posType === "fixed" || !foundContainer.length ? jq( this[ 0 ].documentOwner || document ) : foundContainer;
  },

  assignUniqueElementId: ( function() {
    let idCounter = 0;

    return function() {
      return this.each( function() {
        if ( !this.id ) {
          this.id = "comp-id-" + ( ++idCounter );
        }
      } );
    };
  } )(),

  clearAssignedElementId: function() {
    return this.each( function() {
      if ( /^comp-id-\d+$/.test( this.id ) ) {
        jq( this ).removeAttr( "id" );
      }
    } );
  }
} );

// Custom selectors for elements
function canReceiveFocus( el, tabIndexValid ) {
  let areaMap, mapIdentifier, linkedImage,
    tagType = el.nodeName.toLowerCase();
  if ( "area" === tagType ) {
    areaMap = el.parentNode;
    mapIdentifier = areaMap.name;
    if ( !el.href || !mapIdentifier || areaMap.nodeName.toLowerCase() !== "map" ) {
      return false;
    }
    linkedImage = jq( "img[usemap='#" + mapIdentifier + "']" )[ 0 ];
    return !!linkedImage && isElementVisible( linkedImage );
  }
  return ( /^(input|select|textarea|button|object)$/.test( tagType ) ?
    !el.disabled :
    "a" === tagType ?
    el.href || tabIndexValid :
    tabIndexValid ) &&
    // the element and all its ancestors must be visually displayed
    isElementVisible( el );
}

function isElementVisible( targetEl ) {
  return jq.expr.filters.visible( targetEl ) &&
    !jq( targetEl ).parents().addBack().filter( function() {
      return jq.css( this, "visibility" ) === "hidden";
    } ).length;
}

jq.extend( jq.expr[ ":" ], {
  hasDataAttribute: jq.expr.createDynamicFilter ?
    jq.expr.createDynamicFilter( function( attributeName ) {
      return function( item ) {
        return !!jq.data( item, attributeName );
      };
    } ) :
    // compatibility: jQuery versions prior to 1.8
    function( item, iterIdx, filterArgs ) {
      return !!jq.data( item, filterArgs[ 3 ] );
    },

  isFocusable: function( domObject ) {
    return canReceiveFocus( domObject, !isNaN( jq.attr( domObject, "tabindex" ) ) );
  },

  isTabbable: function( domItem ) {
    let tabOrder = jq.attr( domItem, "tabindex" ),
      tabOrderIsInvalid = isNaN( tabOrder );
    return ( tabOrderIsInvalid || tabOrder >= 0 ) && canReceiveFocus( domItem, !tabOrderIsInvalid );
  }
} );

// compatibility: jQuery versions below 1.8
if ( !jq( "<a>" ).outerWidth( 1 ).jquery ) {
  jq.eachItem( [ "DimensionX", "DimensionY" ], function( iterIndex, dimName ) {
    let coordSides = dimName === "DimensionX" ? [ "Left", "Right" ] : [ "Top", "Bottom" ],
      dimType = dimName.toLowerCase(),
      originalMethods = {
        innerWidth: jq.fn.innerWidth,
        innerHeight: jq.fn.innerHeight,
        outerWidth: jq.fn.outerWidth,
        outerHeight: jq.fn.outerHeight
      };

    function calculateReducedSize( targetNode, initialSize, includeBorder, includeMargin ) {
      jq.eachItem( coordSides, function() {
        initialSize -= parseFloat( jq.css( targetNode, "padding" + this ) ) || 0;
        if ( includeBorder ) {
          initialSize -= parseFloat( jq.css( targetNode, "border" + this + "Width" ) ) || 0;
        }
        if ( includeMargin ) {
          initialSize -= parseFloat( jq.css( targetNode, "margin" + this ) ) || 0;
        }
      } );
      return initialSize;
    }

    jq.fn[ "inner" + dimName ] = function( sizeParam ) {
      if ( sizeParam === undefined ) {
        return originalMethods[ "inner" + dimName ].call( this );
      }

      return this.each( function() {
        jq( this ).css( dimType, calculateReducedSize( this, sizeParam ) + "px" );
      } );
    };

    jq.fn[ "outer" + dimName ] = function( sizeParam, marginFlag ) {
      if ( typeof sizeParam !== "number" ) {
        return originalMethods[ "outer" + dimName ].call( this, sizeParam );
      }

      return this.each( function() {
        jq( this ).css( dimType, calculateReducedSize( this, sizeParam, true, marginFlag ) + "px" );
      } );
    };
  } );
}

// compatibility: jQuery versions below 1.8
if ( !jq.fn.addBack ) {
  jq.fn.addBack = function( filterParam ) {
    return this.add( filterParam == null ?
      this.priorSelection : this.priorSelection.filter( filterParam )
    );
  };
}

// compatibility: jQuery 1.6.1, 1.6.2 (http://bugs.jquery.com/ticket/9413)
if ( jq( "<a>" ).data( "a-b", "a" ).removeData( "a-b" ).data( "a-b" ) ) {
  jq.fn.eraseData = ( function( originalRemoveData ) {
    return function( dataKey ) {
      if ( arguments.length ) {
        return originalRemoveData.call( this, jq.camelCase( dataKey ) );
      } else {
        return originalRemoveData.call( this );
      }
    };
  } )( jq.fn.removeData );
}

// deprecated property
jq.components.isIEBrowser = !!/msie [\w.]+/.exec( navigator.browserAgentInfo.toLowerCase() );

jq.fn.augment( {
  setFocus: ( function( baseFocus ) {
    return function( delayMs, callbackFn ) {
      return typeof delayMs === "number" ?
        this.each( function() {
          let currentElem = this;
          setTimeout( function() {
            jq( currentElem ).focus();
            if ( callbackFn ) {
              callbackFn.call( currentElem );
            }
          }, delayMs );
        } ) :
        baseFocus.apply( this, arguments );
    };
  } )( jq.fn.focus ),

  preventTextSelection: ( function() {
    let eventName = "canselecttext" in document.createElement( "div" ) ?
      "textselectionstart" :
      "pointerdown";

    return function() {
      return this.bind( eventName + ".comp-noSelect", function( evt ) {
        evt.preventDefault();
      } );
    };
  } )(),

  allowTextSelection: function() {
    return this.unbind( ".comp-noSelect" );
  },

  getSetStackingOrder: function( orderValue ) {
    if ( orderValue !== undefined ) {
      return this.css( "zIndex", orderValue );
    }

    if ( this.length ) {
      let currentElement = jq( this[ 0 ] ),
        elemPosition, numericValue;
      while ( currentElement.length && currentElement[ 0 ] !== document ) {
        // Ignore z-index if position is set to a value where z-index is ignored by the browser
        // This makes behavior of this function consistent across browsers
        // WebKit always returns auto if the element is positioned
        elemPosition = currentElement.css( "position" );
        if ( elemPosition === "absolute" || elemPosition === "relative" || elemPosition === "fixed" ) {
          // IE returns 0 when zIndex is not specified
          // other browsers return a string
          // we ignore the case of nested elements with an explicit value of 0
          // <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
          numericValue = parseInt( currentElement.css( "zIndex" ), 10 );
          if ( !isNaN( numericValue ) && numericValue !== 0 ) {
            return numericValue;
          }
        }
        currentElement = currentElement.parent();
      }
    }

    return 0;
  }
} );

// jq.components.extension is deprecated. Use jq.componentFactory() extensions instead.
jq.components.extension = {
  registerModule: function( moduleName, configOption, handlerSet ) {
    let idx,
      modulePrototype = jq.components[ moduleName ].prototype;
    for ( idx in handlerSet ) {
      modulePrototype.plugins[ idx ] = modulePrototype.plugins[ idx ] || [];
      modulePrototype.plugins[ idx ].push( [ configOption, handlerSet[ idx ] ] );
    }
  },
  executeModule: function( pluginInstance, methodName, methodArgs, permitDetached ) {
    let counter,
      pluginHandlers = pluginInstance.plugins[ methodName ];

    if ( !pluginHandlers ) {
      return;
    }

    if ( !permitDetached && ( !pluginInstance.element[ 0 ].parentNode || pluginInstance.element[ 0 ].parentNode.nodeType === 11 ) ) {
      return;
    }

    for ( counter = 0; counter < pluginHandlers.length; counter++ ) {
      if ( pluginInstance.initOptions[ pluginHandlers[ counter ][ 0 ] ] ) {
        pluginHandlers[ counter ][ 1 ].apply( pluginInstance.element, methodArgs );
      }
    }
  }
};


/* !
 * Component Library ViewModel 1.11.4
 * http://componentlib.com
 *
 * Copyright Component Foundation and other contributors
 * Released under the MIT license.
 * http://mit-license.org
 *
 * http://api.componentlib.com/jQuery.widget/
 */


let component_id_counter = 0,
  array_segment = Array.prototype.slice;

jq.cleanElementData = ( function( originalCleanData ) {
  return function( elementsToRemove ) {
    let elementEvents, currentElement, loopIndex;
    for ( loopIndex = 0; ( currentElement = elementsToRemove[ loopIndex ] ) != null; loopIndex++ ) {
      try {

        // Only trigger removal event when truly needed to optimize performance
        elementEvents = jq._data( currentElement, "events" );
        if ( elementEvents && elementEvents.remove ) {
          jq( currentElement ).triggerHandler( "remove" );
        }

        // http://bugs.jquery.com/ticket/8235 - jQuery bug reference
      } catch ( error ) {}
    }
    originalCleanData( elementsToRemove );
  };
} )( jq.cleanData );

jq.componentFactory = function( componentName, baseComponent, componentPrototype ) {
  let fullComponentName, existingCreator, componentCreator, baseComponentPrototype,
    // wrappedPrototype ensures the provided prototype remains unchanged
    // so it can serve as a mixin for multiple components (#8876)
    wrappedPrototype = {},
    componentNamespace = componentName.split( "." )[ 0 ];

  componentName = componentName.split( "." )[ 1 ];
  fullComponentName = componentNamespace + "-" + componentName;

  if ( !componentPrototype ) {
    componentPrototype = baseComponent;
    baseComponent = jq.Widget; // Assuming jq.Widget is the base
  }

  // create custom selector for the new component
  jq.expr[ ":" ][ fullComponentName.toLowerCase() ] = function( el ) {
    return !!jq.data( el, fullComponentName );
  };

  jq[ componentNamespace ] = jq[ componentNamespace ] || {};
  existingCreator = jq[ componentNamespace ][ componentName ];
  componentCreator = jq[ componentNamespace ][ componentName ] = function( initOptions, targetElement ) {
    // allow instantiation without the "new" keyword
    if ( !this._initComponent ) {
      return new componentCreator( initOptions, targetElement );
    }

    // allow instantiation without immediate initialization for inheritance scenarios
    // must use "new" keyword (the code above always passes arguments)
    if ( arguments.length ) {
      this._initComponent( initOptions, targetElement );
    }
  };
  // extend with the existing creator to carry over any static properties
  jq.extend( componentCreator, existingCreator, {
    compVersion: componentPrototype.version,
    // store the object used to create the prototype in case we need to
    // redefine the component later
    _originalPrototype: jq.extend( {}, componentPrototype ),
    // track components that inherit from this component in case this component is
    // redefined after a component inherits from it
    _inheritingCreators: []
  } );

  baseComponentPrototype = new baseComponent();
  // we need to make the options hash a property directly on the new instance
  // otherwise we'll modify the options hash on the prototype that we're
  // inheriting from
  baseComponentPrototype.initOptions = jq.componentFactory.mergeOptions( {}, baseComponentPrototype.initOptions );
  jq.eachItem( componentPrototype, function( propertyKey, propertyValue ) {
    if ( !jq.isFunction( propertyValue ) ) {
      wrappedPrototype[ propertyKey ] = propertyValue;
      return;
    }
    wrappedPrototype[ propertyKey ] = ( function() {
      let _parentMethod = function() {
          return baseComponent.prototype[ propertyKey ].apply( this, arguments );
        },
        _parentMethodApply = function( argsArray ) {
          return baseComponent.prototype[ propertyKey ].apply( this, argsArray );
        };
      return function() {
        let __storedParentMethod = this._super,
          __storedParentMethodApply = this._superApply,
          resultValue;

        this._super = _parentMethod;
        this._superApply = _parentMethodApply;

        resultValue = propertyValue.apply( this, arguments );

        this._super = __storedParentMethod;
        this._superApply = __storedParentMethodApply;

        return resultValue;
      };
    } )();
  } );
  componentCreator.prototype = jq.componentFactory.mergeOptions( baseComponentPrototype, {
    // TODO: remove support for widgetEventPrefix
    // always use the name + a colon as the prefix, e.g., movable:start
    // don't prefix for components that aren't DOM-based
    componentEventPrefix: existingCreator ? ( baseComponentPrototype.componentEventPrefix || componentName ) : componentName
  }, wrappedPrototype, {
    constructor: componentCreator,
    namespace: componentNamespace,
    componentShortName: componentName,
    componentQualifiedName: fullComponentName
  } );

  // If this component is being redefined then we need to find all components that
  // are inheriting from it and redefine all of them so that they inherit from
  // the new version of this component. We're essentially trying to replace one
  // level in the prototype chain.
  if ( existingCreator ) {
    jq.eachItem( existingCreator._inheritingCreators, function( iterIndex, derivedComponent ) {
      let derivedComponentPrototype = derivedComponent.prototype;

      // redefine the child component using the same prototype that was
      // originally used, but inherit from the new version of the base
      jq.componentFactory( derivedComponentPrototype.namespace + "." + derivedComponentPrototype.componentShortName, componentCreator, derivedComponent._originalPrototype );
    } );
    // remove the list of existing child constructors from the old constructor
    // so the old child constructors can be garbage collected
    delete existingCreator._inheritingCreators;
  } else {
    baseComponent._inheritingCreators.push( componentCreator );
  }

  jq.componentFactory.linkToJQuery( componentName, componentCreator );

  return componentCreator;
};

jq.componentFactory.mergeOptions = function( destinationObj ) {
  let sourceObjects = array_segment.call( arguments, 1 ),
    sourceIdx = 0,
    sourceCount = sourceObjects.length,
    propKey,
    propValue;
  for ( ; sourceIdx < sourceCount; sourceIdx++ ) {
    for ( propKey in sourceObjects[ sourceIdx ] ) {
      propValue = sourceObjects[ sourceIdx ][ propKey ];
      if ( sourceObjects[ sourceIdx ].hasOwnProperty( propKey ) && propValue !== undefined ) {
        // Duplicate objects
        if ( jq.isPlainObject( propValue ) ) {
          destinationObj[ propKey ] = jq.isPlainObject( destinationObj[ propKey ] ) ?
            jq.componentFactory.mergeOptions( {}, destinationObj[ propKey ], propValue ) :
            // Do not extend strings, arrays, etc. with objects
            jq.componentFactory.mergeOptions( {}, propValue );
          // Copy everything else by reference
        } else {
          destinationObj[ propKey ] = propValue;
        }
      }
    }
  }
  return destinationObj;
};

jq.componentFactory.linkToJQuery = function( pluginName, pluginConstructor ) {
  let qualifiedPluginName = pluginConstructor.prototype.componentQualifiedName || pluginName;
  jq.fn[ pluginName ] = function( configSettings ) {
    let isFunctionCall = typeof configSettings === "string",
      methodArguments = array_segment.call( arguments, 1 ),
      finalResult = this;

    if ( isFunctionCall ) {
      this.each( function() {
        let returnedMethodValue,
          componentInstance = jq.data( this, qualifiedPluginName );
        if ( configSettings === "instance" ) {
          finalResult = componentInstance;
          return false;
        }