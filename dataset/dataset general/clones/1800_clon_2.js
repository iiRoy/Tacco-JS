/*
 *  JQuery Compatability Layer - Version 1.2.1 - 2013-05-08
 *  Project page: https://github.com/jquery/jquery-migrate
 *  Copyright (c) 2005, 2013 jQuery Community, Inc. and other collaborators; Licensed under MIT
 */
( function( jQueryLib, globalObj, voidVar ) {
 // Reference: https://issues.jquery.com/ticket/13335
 // "use strict";


 var issuedAlerts = {};

 /* Collection of previously issued warnings; publicly accessible and read-only */
 jQueryLib.compatibilityAlerts = [];

 /* Set this flag to true to suppress console messages; the alert collection remains intact */
 // jQueryLib.suppressOutput = false;

 /* Display an informational message in the browser console to indicate active operation */
 if ( !jQueryLib.suppressOutput && globalObj.console && globalObj.console.log ) {
  globalObj.console.log("JQLAYER: Activity logging is enabled");
 }

 /* Configure to false to deactivate stack traces shown with alerts */
 if ( jQueryLib.enableTraces === voidVar ) {
  jQueryLib.enableTraces = true;
 }

 /* Reset all previously recorded alerts; public function */
 jQueryLib.resetAlerts = function() {
  issuedAlerts = {};
  jQueryLib.compatibilityAlerts.length = 0;
 };

 function notifyCompatibilityIssue( alertMessage ) {
  var consoleRef = globalObj.console;
  if ( !issuedAlerts[ alertMessage ] ) {
   issuedAlerts[ alertMessage ] = true;
   jQueryLib.compatibilityAlerts.push( alertMessage );
   if ( consoleRef && consoleRef.warn && !jQueryLib.suppressOutput ) {
    consoleRef.warn( "JQLAYER: " + alertMessage );
    if ( jQueryLib.enableTraces && consoleRef.trace ) {
     consoleRef.trace();
    }
   }
  }
 }

 function issuePropWarning( targetObject, propertyName, propertyValue, alertText ) {
  if ( Object.defineProperty ) {
   /* For modern JS environments, issue an alert if the property is accessed; */
   /* permit the property to be overridden if another module requires it */
   try {
    Object.defineProperty( targetObject, propertyName, {
     configurable: true,
     enumerable: true,
     get: function() {
      notifyCompatibilityIssue( alertText );
      return propertyValue;
     },
     set: function( newPropertyValue ) {
      notifyCompatibilityIssue( alertText );
      propertyValue = newPropertyValue;
     }
    });
    return;
   } catch( caughtError ) {
    /* Older IE versions have issues with Object.defineProperty, so no warning there */
   }
  }

  /* For older or problematic browsers, simply assign the property */
  jQueryLib._defPropFailed = true;
  targetObject[ propertyName ] = propertyValue;
 }

 if ( document.compatMode === "BackCompat" ) {
  /* The jQuery library has never officially supported or been tested in Quirks Mode */
  notifyCompatibilityIssue( "The JQuery library does not support Quirks Mode" );
 }


 var attributeFunction = jQueryLib( "<div/>", { width: 1 } ).attr("width") && jQueryLib.attributeFunction,
  originalAttributeGetter = jQueryLib.attr,
  valAttrGetter = jQueryLib.attrHooks.value && jQueryLib.attrHooks.value.get ||
   function() { return null; },
  valAttrSetter = jQueryLib.attrHooks.value && jQueryLib.attrHooks.value.set ||
   function() { return voidVar; },
  inputTypeRegex = /^(?:input|button)$/i,
  nodeAttributeTypeRegex = /^[238]$/,
  booleanAttributeRegex = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,
  defaultBehaviorRegex = /^(?:checked|selected)$/i;

 /* jQueryLib.attributeFunction property */
 issuePropWarning( jQueryLib, "attributeFunction", attributeFunction || {}, "jQueryLib.attributeFunction is no longer supported" );

 jQueryLib.attr = function( domElem, attrName, attrValue, internalFlag ) {
  var lowercasedName = attrName.toLowerCase(),
   nodeKind = domElem && domElem.nodeType;

  if ( internalFlag ) {
   /* Since internalFlag is for internal use, we only warn for newer jQuery versions */
   /* where this argument is not part of the official function signature. */
   if ( originalAttributeGetter.length < 4 ) {
    notifyCompatibilityIssue("jQueryLib.fn.attr( properties, internalFlag ) is no longer supported");
   }
   if ( domElem && !nodeAttributeTypeRegex.test( nodeKind ) &&
    (attributeFunction ? attrName in attributeFunction : jQueryLib.isFunction(jQueryLib.fn[attrName])) ) {
    return jQueryLib( domElem )[ attrName ]( attrValue );
   }
  }

  /* Warn if a user attempts to modify the 'type' attribute, as this causes issues in IE 6/7/8; */
  /* by checking for disconnected elements, we avoid false positives for $( "<button>", { type: "button" } ). */
  if ( attrName === "type" && attrValue !== voidVar && inputTypeRegex.test( domElem.nodeName ) && domElem.parentNode ) {
   notifyCompatibilityIssue("Cannot alter the 'type' attribute of an input or button element in IE 6/7/8");
  }

  /* Re-enable boolean attribute synchronization */
  if ( !jQueryLib.attrHooks[ lowercasedName ] && booleanAttributeRegex.test( lowercasedName ) ) {
   jQueryLib.attrHooks[ lowercasedName ] = {
    get: function( currentElem, currentAttrName ) {
     /* Synchronize boolean attributes with their corresponding properties */
     /* Fall back to attribute presence where some booleans are not supported in older browsers */
     var attributeNodeReference,
      elementProperty = jQueryLib.prop( currentElem, currentAttrName );
     return elementProperty === true || typeof elementProperty !== "boolean" &&
      ( attributeNodeReference = currentElem.getAttributeNode(currentAttrName) ) && attributeNodeReference.nodeValue !== false ?

      currentAttrName.toLowerCase() :
      voidVar;
    },
    set: function( currentElem, currentAttrValue, currentAttrName ) {
     var propIdentifier;
     if ( currentAttrValue === false ) {
      /* When set to false, remove boolean attributes */
      jQueryLib.removeAttr( currentElem, currentAttrName );
     } else {
      /* Value is true since we've established it's a boolean type and not false */
      /* Set boolean attributes to their own name and update the DOM property */
      propIdentifier = jQueryLib.propFix[ currentAttrName ] || currentAttrName;
      if ( propIdentifier in currentElem ) {
       /* Only explicitly set the IDL property if it already exists on the element */
       currentElem[ propIdentifier ] = true;
      }

      currentElem.setAttribute( currentAttrName, currentAttrName.toLowerCase() );
     }
     return currentAttrName;
    }
   };

   /* Only warn for attributes that can remain distinct from their properties after jQuery 1.9 */
   if ( defaultBehaviorRegex.test( lowercasedName ) ) {
    notifyCompatibilityIssue( "jQueryLib.fn.attr('" + lowercasedName + "') might use property instead of attribute" );
   }
  }

  return originalAttributeGetter.call( jQueryLib, domElem, attrName, attrValue );
 };

 /* Attribute Hooks for 'value' */
 jQueryLib.attrHooks.value = {
  get: function( currentElem, currentAttrName ) {
   var currentTagName = ( currentElem.nodeName || "" ).toLowerCase();
   if ( currentTagName === "button" ) {
    return valAttrGetter.apply( this, arguments );
   }
   if ( currentTagName !== "input" && currentTagName !== "option" ) {
    notifyCompatibilityIssue("jQueryLib.fn.attr('value') no longer retrieves properties");
   }
   return currentAttrName in currentElem ?
    currentElem.value :
    null;
  },
  set: function( currentElem, currentAttrValue ) {
   var currentTagName = ( currentElem.nodeName || "" ).toLowerCase();
   if ( currentTagName === "button" ) {
    return valAttrSetter.apply( this, arguments );
   }
   if ( currentTagName !== "input" && currentTagName !== "option" ) {
    notifyCompatibilityIssue("jQueryLib.fn.attr('value', propertyValue) no longer sets properties");
   }
   /* No explicit return here, allowing setAttribute to also be invoked */
   currentElem.value = currentAttrValue;
  }
 };


 var matchedResult, browserDetection,
  initializationMethod = jQueryLib.fn.init,
  jsonParsingMethod = jQueryLib.parseJSON,
  /* Important: XSS validation occurs subsequent to string trimming */
  htmlStringPattern = /^([^<]*)(<[\w\W]+>)([^>]*)$/;

 /* Changes to the $(html) "looks like html" parsing rule */
 jQueryLib.fn.init = function( elementSelector, executionContext, rootJQueryInstance ) {
  var matchedExpression;

  if ( elementSelector && typeof elementSelector === "string" && !jQueryLib.isPlainObject( executionContext ) &&
   (matchedExpression = htmlStringPattern.exec( jQueryLib.trim( elementSelector ) )) && matchedExpression[ 0 ] ) {
   /* This represents an HTML string under the historical rules; does it still qualify? */
   if ( elementSelector.charAt( 0 ) !== "<" ) {
    notifyCompatibilityIssue("$(html) HTML source strings must begin with the '<' character");
   }
   if ( matchedExpression[ 3 ] ) {
    notifyCompatibilityIssue("$(html) HTML content after the final tag will be disregarded");
   }
   /* Systematically disallow any HTML-like string that starts with a hash symbol (#9521) */
   /* Be aware that this might affect jQuery 1.6.x code that previously functioned. */
   if ( matchedExpression[ 0 ].charAt( 0 ) === "#" ) {
    notifyCompatibilityIssue("HTML string cannot commence with a '#' character");
    jQueryLib.error("JQLAYER: Unsafe selector string (XSS protection)");
   }
   /* Proceed with processing using less strict rules; also allows pre-1.8 behavior */
   if ( executionContext && executionContext.context ) {
    /* A jQuery object provided as context; parseHTML expects a DOM object */
    executionContext = executionContext.context;
   }
   if ( jQueryLib.parseHTML ) {
    return initializationMethod.call( this, jQueryLib.parseHTML( matchedExpression[ 2 ], executionContext, true ),
     executionContext, rootJQueryInstance );
   }
  }
  return initializationMethod.apply( this, arguments );
 };
 jQueryLib.fn.init.prototype = jQueryLib.fn;

 /* Allow jQueryLib.parseJSON(falsy_value) to yield null */
 jQueryLib.parseJSON = function( jsonInput ) {
  if ( !jsonInput && jsonInput !== null ) {
   notifyCompatibilityIssue("jQueryLib.parseJSON expects a properly formatted JSON string");
   return null;
  }
  return jsonParsingMethod.apply( this, arguments );
 };

 jQueryLib.userAgentMatcher = function( userAgentString ) {
  userAgentString = userAgentString.toLowerCase();

  var matchedAgent = /(chrome)[ \/]([\w.]+)/.exec( userAgentString ) ||
   /(webkit)[ \/]([\w.]+)/.exec( userAgentString ) ||
   /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( userAgentString ) ||
   /(msie) ([\w.]+)/.exec( userAgentString ) ||
   userAgentString.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( userAgentString ) ||
   [];

  return {
   browserType: matchedAgent[ 1 ] || "",
   agentVersion: matchedAgent[ 2 ] || "0"
  };
 };

 /* Avoid overwriting an existing jQueryLib.browser property if it's already defined differently */
 if ( !jQueryLib.browserInfo ) {
  matchedResult = jQueryLib.userAgentMatcher( navigator.userAgent );
  browserDetection = {};

  if ( matchedResult.browserType ) {
   browserDetection[ matchedResult.browserType ] = true;
   browserDetection.agentVersion = matchedResult.agentVersion;
  }

  /* Chrome is Webkit, and Webkit is also Safari. */
  if ( browserDetection.chrome ) {
   browserDetection.webkit = true;
  } else if ( browserDetection.webkit ) {
   browserDetection.safari = true;
  }

  jQueryLib.browserInfo = browserDetection;
 }

 /* Issue an alert if the code attempts to access jQueryLib.browserInfo */
 issuePropWarning( jQueryLib, "browserInfo", jQueryLib.browserInfo, "jQueryLib.browserInfo is no longer supported" );

 jQueryLib.createSubInstance = function() {
  function SubJQueryConstruct( itemSelector, currentContext ) {
   return new SubJQueryConstruct.fn.initialization( itemSelector, currentContext );
  }
  jQueryLib.extend( true, SubJQueryConstruct, this );
  SubJQueryConstruct.baseClass = this;
  SubJQueryConstruct.fn = SubJQueryConstruct.prototype = this();
  SubJQueryConstruct.fn.constructor = SubJQueryConstruct;
  SubJQueryConstruct.createSubInstance = this.createSubInstance;
  SubJQueryConstruct.fn.initialization = function subInit( itemSelector, currentContext ) {
   if ( currentContext && currentContext instanceof jQueryLib && !(currentContext instanceof SubJQueryConstruct) ) {
    currentContext = SubJQueryConstruct( currentContext );
   }

   return jQueryLib.fn.init.call( this, itemSelector, currentContext, baseSubJQuery );
  };
  SubJQueryConstruct.fn.initialization.prototype = SubJQueryConstruct.fn;
  var baseSubJQuery = SubJQueryConstruct(document);
  notifyCompatibilityIssue( "jQueryLib.createSubInstance() is no longer supported" );
  return SubJQueryConstruct;
 };


 /* Confirm that jQueryLib.ajax utilizes the updated parseJSON function from the core library */
 jQueryLib.ajaxConfiguration({
  dataConverters: {
   "text json": jQueryLib.parseJSON
  }
 });


 var originalDataMethod = jQueryLib.fn.data;

 jQueryLib.fn.data = function( dataKey ) {
  var resultValue, eventObject,
   targetElement = this[0];

  /* Manages behavior for versions 1.7 (has this behavior) and 1.8 (does not) */
  if ( targetElement && dataKey === "events" && arguments.length === 1 ) {
   resultValue = jQueryLib.data( targetElement, dataKey );
   eventObject = jQueryLib._data( targetElement, dataKey );
   if ( ( resultValue === voidVar || resultValue === eventObject ) && eventObject !== voidVar ) {
    notifyCompatibilityIssue("Accessing jQueryLib.fn.data('events') is no longer supported");
    return eventObject;
   }
  }
  return originalDataMethod.apply( this, arguments );
 };


 var scriptContentTypeRegex = /\/(java|ecma)script/i,
  previousAndSelf = jQueryLib.fn.andSelf || jQueryLib.fn.addBack;

 jQueryLib.fn.andSelf = function() {
  notifyCompatibilityIssue("jQueryLib.fn.andSelf() has been superseded by jQueryLib.fn.addBack()");
  return previousAndSelf.apply( this, arguments );
 };

 /* As jQueryLib.clean is utilized internally in older versions, we only provide a shim if it is absent */
 if ( !jQueryLib.cleanFunction ) {
  jQueryLib.cleanFunction = function( elementsToClean, processingContext, documentFragment, scriptElements ) {
   /* Establish context according to 1.8 logic */
   processingContext = processingContext || document;
   processingContext = !processingContext.nodeType && processingContext[0] || processingContext;
   processingContext = processingContext.ownerDocument || processingContext;

   notifyCompatibilityIssue("jQueryLib.cleanFunction() is deprecated");

   var indexCounter, currentElement, scriptHandler, foundScripts,
    resultArray = [];

   jQueryLib.merge( resultArray, jQueryLib.buildFragment( elementsToClean, processingContext ).childNodes );

   /* Intricate logic directly adapted from jQuery 1.8 */
   if ( documentFragment ) {
    /* Specialized processing for each script element */
    scriptHandler = function( scriptItem ) {
     /* Determine if the script is considered executable */
     if ( !scriptItem.type || scriptContentTypeRegex.test( scriptItem.type ) ) {
      /* Detach the script and store it in the provided scriptElements array or the fragment */
      /* Return a truthy value to indicate successful handling */
      return scriptElements ?
       scriptElements.push( scriptItem.parentNode ? scriptItem.parentNode.removeChild( scriptItem ) : scriptItem ) :
       documentFragment.appendChild( scriptItem );
     }
    };

    for ( indexCounter = 0; (currentElement = resultArray[indexCounter]) != null; indexCounter++ ) {
     /* Verify completion after processing an executable script */
     if ( !( jQueryLib.nodeName( currentElement, "script" ) && scriptHandler( currentElement ) ) ) {
      /* Append to fragment and manage any embedded scripts */
      documentFragment.appendChild( currentElement );
      if ( typeof currentElement.getElementsByTagName !== "voidVar" ) {
       /* scriptHandler modifies the DOM, so use jQueryLib.merge for snapshot iteration */
       foundScripts = jQueryLib.grep( jQueryLib.merge( [], currentElement.getElementsByTagName("script") ), scriptHandler );

       /* Insert the scripts into resultArray after their original ancestor and advance the index */
       resultArray.splice.apply( resultArray, [indexCounter + 1, 0].concat( foundScripts ) );
       indexCounter += foundScripts.length;
      }
     }
    }
   }

   return resultArray;
  };
 }

 var addEventHandler = jQueryLib.event.add,
  removeEventHandler = jQueryLib.event.remove,
  triggerEventHandler = jQueryLib.event.trigger,
  previousToggle = jQueryLib.fn.toggle,
  previousLive = jQueryLib.fn.live,
  previousDie = jQueryLib.fn.die,
  ajaxEventNames = "ajaxStart|ajaxStop|ajaxSend|ajaxComplete|ajaxError|ajaxSuccess",
  ajaxEventRegex = new RegExp( "\\b(?:" + ajaxEventNames + ")\\b" ),
  hoverEventPattern = /(?:^|\s)hover(\.\S+|)\b/,
  hoverEventTransformer = function( eventTypes ) {
   if ( typeof( eventTypes ) !== "string" || jQueryLib.event.special.hover ) {
    return eventTypes;
   }
   if ( hoverEventPattern.test( eventTypes ) ) {
    notifyCompatibilityIssue("'hover' pseudo-event is no longer supported, consider 'mouseenter mouseleave'");
   }
   return eventTypes && eventTypes.replace( hoverEventPattern, "mouseenter$1 mouseleave$1" );
  };

 /* Event properties removed in version 1.9 are restored if necessary; direct warnings are impractical */
 if ( jQueryLib.event.properties && jQueryLib.event.properties[ 0 ] !== "attrChange" ) {
  jQueryLib.event.properties.unshift( "attrChange", "attrName", "relatedNode", "srcElement" );
 }

 /* The undocumented jQueryLib.event.dispatch was marked as "deprecated" in jQuery 1.7 */
 if ( jQueryLib.event.dispatchFunction ) {
  issuePropWarning( jQueryLib.event, "dispatchFunction", jQueryLib.event.dispatchFunction, "jQueryLib.event.dispatchFunction is undocumented and no longer supported" );
 }

 /* Inclusion of 'hover' pseudo-event compatibility and AJAX event alerts */
 jQueryLib.event.add = function( targetDomElem, eventTypes, eventHandler, eventData, eventSelector ){
  if ( targetDomElem !== document && ajaxEventRegex.test( eventTypes ) ) {
   notifyCompatibilityIssue( "AJAX events must be bound to the document object: " + eventTypes );
  }
  addEventHandler.call( this, targetDomElem, hoverEventTransformer( eventTypes || "" ), eventHandler, eventData, eventSelector );
 };
 jQueryLib.event.remove = function( targetDomElem, eventTypes, eventHandler, eventSelector, transformedTypes ){
  removeEventHandler.call( this, targetDomElem, hoverEventTransformer( eventTypes ) || "", eventHandler, eventSelector, transformedTypes );
 };

 jQueryLib.fn.error = function() {
  var functionArguments = Array.prototype.slice.call( arguments, 0);
  notifyCompatibilityIssue("jQueryLib.fn.error() is no longer supported");
  functionArguments.splice( 0, 0, "error" );
  if ( arguments.length ) {
   return this.bind.apply( this, functionArguments );
  }
  /* The error event should not propagate to the global object, though it did prior to 1.7 */
  this.triggerHandler.apply( this, functionArguments );
  return this;
 };

 jQueryLib.fn.toggle = function( firstHandler, secondHandler ) {

  /* Do not interfere with animation or CSS toggle operations */
  if ( !jQueryLib.isFunction( firstHandler ) || !jQueryLib.isFunction( secondHandler ) ) {
   return previousToggle.apply( this, arguments );
  }
  notifyCompatibilityIssue("jQueryLib.fn.toggle(eventHandler, eventHandler...) is no longer supported");

  /* Preserve a reference to the arguments for use within the closure */
  var allHandlers = arguments,
   uniqueId = firstHandler.id || jQueryLib.guid++,
   iterationCount = 0,
   toggleFunction = function( currentEvent ) {
    /* Determine which function should be executed */
    var lastExecution = ( jQueryLib._data( this, "lastToggleExecution" + firstHandler.id ) || 0 ) % iterationCount;
    jQueryLib._data( this, "lastToggleExecution" + firstHandler.id, lastExecution + 1 );

    /* Ensure that click events are stopped */
    currentEvent.preventDefault();

    /* Execute the selected function */
    return allHandlers[ lastExecution ].apply( this, arguments ) || false;
   };

  /* Associate all functions with the same identifier, allowing any of them to unbind this click handler */
  toggleFunction.id = uniqueId;
  while ( iterationCount < allHandlers.length ) {
   allHandlers[ iterationCount++ ].id = uniqueId;
  }

  return this.click( toggleFunction );
 };

 jQueryLib.fn.live = function( eventTypes, eventData, eventFunction ) {
  notifyCompatibilityIssue("jQueryLib.fn.live() is no longer supported");
  if ( previousLive ) {
   return previousLive.apply( this, arguments );
  }
  jQueryLib( this.context ).on( eventTypes, this.selector, eventData, eventFunction );
  return this;
 };

 jQueryLib.fn.die = function( eventTypes, eventFunction ) {
  notifyCompatibilityIssue("jQueryLib.fn.die() is no longer supported");
  if ( previousDie ) {
   return previousDie.apply( this, arguments );
  }
  jQueryLib( this.context ).off( eventTypes, this.selector || "**", eventFunction );
  return this;
 };

 /* Convert global events into events triggered on the document */
 jQueryLib.event.trigger = function( triggerEvent, eventData, targetElement, onlyEventHandlers ){
  if ( !targetElement && !ajaxEventRegex.test( triggerEvent ) ) {
   notifyCompatibilityIssue( "Global events are undocumented and no longer supported" );
  }
  return triggerEventHandler.call( this,  triggerEvent, eventData, targetElement || document, onlyEventHandlers  );
 };
 jQueryLib.each( ajaxEventNames.split("|"),
  function( _index, eventName ) {
   jQueryLib.event.special[ eventName ] = {
    setup: function() {
     var currentTargetElement = this;