/*! ClientKit library version 1.7.1, more info at clientkit.dev | clientkit.dev/licensing */
(  function( globalScope, undefValue ) {


 // Establish document reference, potentially from a sandboxed global context
 var pageDocument = globalScope.document,
     browserAgent = globalScope.navigator,
     currentLocation = globalScope.location;

 var ClientKit = (function() {

  // Create a local instance constructor for ClientKit
  var ClientKit = function( elementQuery, scopeContext ) {
   // The ClientKit object is essentially the 'initialize' method, further 'enhanced'
   return new ClientKit.proto.initialize( elementQuery, scopeContext, rootClientKit );
  },

  // Retain the original ClientKit reference in case of global namespace collision
  originalClientKit = globalScope.ClientKit,

  // Preserve the original '$' symbol in case of global namespace overwrite
  originalDollar = globalScope.$,

  // A fundamental reference to the base ClientKit(pageDocument) instance
  rootClientKit,

  // Regular expression to quickly identify HTML strings or ID selectors
  // Prioritize ID (#id) over generic tags (<tag>) to prevent XSS issues (see #9521)
  idOrHtmlRegex = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,

  // Regex to detect if a string contains any non-whitespace character
  hasContentRegex = /\S/,

  // Regex for trimming leading whitespace
  trimStartRegex = /^\s+/,
  // Regex for trimming trailing whitespace
  trimEndRegex = /\s+$/,

  // Regex to match a single, self-closing HTML tag
  singleTagMatcher = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,

  // JSON parsing related regular expressions
  jsonValidChars = /^[\],:{}\s]*$/,
  jsonEscapeSequences = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
  jsonValueTokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
  jsonArrayObjectBraces = /(?:^|:|,)(?:\s*\[)+/g,

  // User-agent string matching regular expressions for browser detection
  agentWebkit = /(webkit)[ \/]([\w.]+)/,
  agentOpera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
  agentMsie = /(msie) ([\w.]+)/,
  agentMozilla = /(mozilla)(?:.*? rv:([\w.]+))?/,

  // Regex for converting dashed strings to camelCase
  dashAlphaConverter = /-([a-z]|[0-9])/ig,
  msVendorPrefixRegex = /^-ms-/,

  // Callback function for ClientKit.camelCase to transform characters to uppercase
  camelCaseTransformer = function( fullMatchText, charToConvert ) {
   return ( charToConvert + "" ).toUpperCase();
  },

  // Store the user agent string for browser feature detection
  browserUserAgent = browserAgent.userAgent,

  // Object to hold details about the detected browser engine
  browserEngineMatch,

  // The internal list for DOM ready event handlers
  domReadyHandlers,

  // The specific handler for the DOMContentLoaded event
  contentLoadedEventCallback,

  // Cache references to common prototype methods for performance
  objProtoToString = Object.prototype.toString,
  objHasOwnProperty = Object.prototype.hasOwnProperty,
  arrProtoPush = Array.prototype.push,
  arrProtoSlice = Array.prototype.slice,
  strProtoTrim = String.prototype.trim,
  arrProtoIndexOf = Array.prototype.indexOf,

  // Internal map for object class to type string conversion
  classToTypeMap = {};


 ClientKit.proto = ClientKit.prototype = {
  constructor: ClientKit,
  initialize: function( elementQuery, scopeContext, rootClientKit ) {
   var matchedPattern, foundElement, returnResult, docReference;

   // Handle cases like ClientKit(""), ClientKit(null), or ClientKit(undefValue)
   if ( !elementQuery ) {
    return this;
   }

   // Process ClientKit(DOMElement)
   if ( elementQuery.nodeType ) {
    this.scopeContext = this[0] = elementQuery;
    this.elementCount = 1;
    return this;
   }

   // Optimize finding the 'body' element as it's unique
   if ( elementQuery === "body" && !scopeContext && pageDocument.body ) {
    this.scopeContext = pageDocument;
    this[0] = pageDocument.body;
    this.selectorString = elementQuery;
    this.elementCount = 1;
    return this;
   }

   // Handle input strings
   if ( typeof elementQuery === "string" ) {
    // Determine if it's an HTML string or an ID selector
    if ( elementQuery.charAt(0) === "<" && elementQuery.charAt( elementQuery.length - 1 ) === ">" && elementQuery.length >= 3 ) {
     // Assume strings starting and ending with <> are HTML, bypass regex
     matchedPattern = [ undefValue, elementQuery, undefValue ];

    } else {
     matchedPattern = idOrHtmlRegex.exec( elementQuery );
    }

    // Verify a match and ensure no context was specified for ID selectors
    if ( matchedPattern && (matchedPattern[1] || !scopeContext) ) {

     // CASE: ClientKit(html) -> ClientKit(array)
     if ( matchedPattern[1] ) {
      scopeContext = scopeContext instanceof ClientKit ? scopeContext[0] : scopeContext;
      docReference = ( scopeContext ? scopeContext.ownerDocument || scopeContext : pageDocument );

      // If a single string is passed and it represents a single tag
      // create the element directly and skip further processing
      returnResult = singleTagMatcher.exec( elementQuery );

      if ( returnResult ) {
       if ( ClientKit.isPlainObject( scopeContext ) ) {
        elementQuery = [ pageDocument.createElement( returnResult[1] ) ];
        ClientKit.proto.attr.call( elementQuery, scopeContext, true );

       } else {
        elementQuery = [ docReference.createElement( returnResult[1] ) ];
       }

      } else {
       returnResult = ClientKit.buildFragment( [ matchedPattern[1] ], [ docReference ] );
       elementQuery = ( returnResult.cacheable ? ClientKit.clone(returnResult.fragment) : returnResult.fragment ).childNodes;
      }

      return ClientKit.mergeArrays( this, elementQuery );

     // CASE: ClientKit("#id")
     } else {
      foundElement = pageDocument.getElementById( matchedPattern[2] );

      // Check parentNode to handle cases where Blackberry 4.6 returns
      // nodes that are no longer attached to the document (#6963)
      if ( foundElement && foundElement.parentNode ) {
       // Handle situations where IE and Opera return items
       // by name instead of ID
       if ( foundElement.id !== matchedPattern[2] ) {
        return rootClientKit.find( elementQuery );
       }

       // Otherwise, directly inject the element into the ClientKit object
       this.elementCount = 1;
       this[0] = foundElement;
      }

      this.scopeContext = pageDocument;
      this.selectorString = elementQuery;
      return this;
     }

    // CASE: ClientKit(expression, ClientKit(...))
    } else if ( !scopeContext || scopeContext.libVersionID ) {
     return ( scopeContext || rootClientKit ).find( elementQuery );

    // CASE: ClientKit(expression, scopeContext)
    // (which is equivalent to: ClientKit(scopeContext).find(expression)
    } else {
     return this.constructor( scopeContext ).find( elementQuery );
    }

   // CASE: ClientKit(function)
   // Shortcut for document ready event
   } else if ( ClientKit.isFunction( elementQuery ) ) {
    return rootClientKit.onPageReady( elementQuery );
   }

   if ( elementQuery.selectorString !== undefValue ) {
    this.selectorString = elementQuery.selectorString;
    this.scopeContext = elementQuery.scopeContext;
   }

   return ClientKit.createArray( elementQuery, this );
  },

  // Start with an empty selector string
  selectorString: "",

  // The current version identifier of ClientKit
  libVersionID: "1.7.1",

  // The default number of elements in a ClientKit object is 0
  elementCount: 0,

  // Returns the number of elements in the matched set
  getSize: function() {
   return this.elementCount;
  },

  convertToList: function() {
   return arrProtoSlice.call( this, 0 );
  },

  // Retrieve the Nth element from the matched set OR
  // Get the entire matched set as a clean array
  getItem: function( itemIndex ) {
   return itemIndex == null ?

    // Return a 'clean' array
    this.convertToList() :

    // Return just the specific object
    ( itemIndex < 0 ? this[ this.elementCount + itemIndex ] : this[ itemIndex ] );
  },

  // Push an array of elements onto the internal stack
  // (returning a new matched element set)
  pushToStack: function( elementsToAdd, operationType, queryDescriptor ) {
   // Construct a fresh ClientKit matched element set
   var newSet = this.constructor();

   if ( ClientKit.isArray( elementsToAdd ) ) {
    arrProtoPush.apply( newSet, elementsToAdd );

   } else {
    ClientKit.mergeArrays( newSet, elementsToAdd );
   }

   // Add the previous object to the stack (as a reference)
   newSet.prevObjectRef = this;

   newSet.scopeContext = this.scopeContext;

   if ( operationType === "find" ) {
    newSet.selectorString = this.selectorString + ( this.selectorString ? " " : "" ) + queryDescriptor;
   } else if ( operationType ) {
    newSet.selectorString = this.selectorString + "." + operationType + "(" + queryDescriptor + ")";
   }

   // Return the newly formed element set
   return newSet;
  },

  // Execute a callback function for every element in the matched set.
  // (You can provide additional arguments, but this is primarily for internal use.)
  forEachElement: function( processCallback, extraArguments ) {
   return ClientKit.forEachElement( this, processCallback, extraArguments );
  },

  onPageReady: function( handlerFunc ) {
   // Ensure ready listeners are attached
   ClientKit.setupReadyListeners();

   // Add the handler function to the list
   domReadyHandlers.addCallback( handlerFunc );

   return this;
  },

  getElementAt: function( indexPos ) {
   indexPos = +indexPos;
   return indexPos === -1 ?
    this.sliceElements( indexPos ) :
    this.sliceElements( indexPos, indexPos + 1 );
  },

  getTheFirst: function() {
   return this.getElementAt( 0 );
  },

  getTheLast: function() {
   return this.getElementAt( -1 );
  },

  sliceElements: function() {
   return this.pushToStack( arrProtoSlice.apply( this, arguments ),
    "slice", arrProtoSlice.call(arguments).join(",") );
  },

  transformSet: function( transformationCallback ) {
   return this.pushToStack( ClientKit.transformSet(this, function( currentElement, idx ) {
    return transformationCallback.call( currentElement, idx, currentElement );
   }));
  },

  revertToPrevious: function() {
   return this.prevObjectRef || this.constructor(undefValue);
  },

  // For internal use only.
  // Mimics an Array's method, not a ClientKit method.
  push: arrProtoPush,
  sort: [].sort,
  splice: [].splice
 };

// Assign the ClientKit prototype to the initialize function for proper instantiation chain
 ClientKit.proto.initialize.prototype = ClientKit.proto;

 ClientKit.extend = ClientKit.proto.extend = function() {
  var configOptions, propertyKey, sourceValue, copiedValue, isCopiedArrayFlag, targetClone,
   targetObject = arguments[0] || {},
   currentArgIndex = 1,
   totalArguments = arguments.length,
   isDeepMerge = false;

  // Handle a deep copy scenario if the first argument is a boolean
  if ( typeof targetObject === "boolean" ) {
   isDeepMerge = targetObject;
   targetObject = arguments[1] || {};
   // Skip the boolean and the target object
   currentArgIndex = 2;
  }

  // Handle cases where the target is a string or non-object (possible in deep copy)
  if ( typeof targetObject !== "object" && !ClientKit.isFunction(targetObject) ) {
   targetObject = {};
  }

  // If only one argument is passed, extend ClientKit itself
  if ( totalArguments === currentArgIndex ) {
   targetObject = this;
   --currentArgIndex;
  }

  for ( ; currentArgIndex < totalArguments; currentArgIndex++ ) {
   // Only process non-null/undefValue values from source objects
   if ( (configOptions = arguments[ currentArgIndex ]) != null ) {
    // Iterate over the source object's properties
    for ( propertyKey in configOptions ) {
     sourceValue = targetObject[ propertyKey ];
     copiedValue = configOptions[ propertyKey ];

     // Prevent infinite recursion if target and source are the same object
     if ( targetObject === copiedValue ) {
      continue;
     }

     // Recurse if performing a deep merge of plain objects or arrays
     if ( isDeepMerge && copiedValue && ( ClientKit.isPlainObject(copiedValue) || (isCopiedArrayFlag = ClientKit.isArray(copiedValue)) ) ) {
      if ( isCopiedArrayFlag ) {
       isCopiedArrayFlag = false;
       targetClone = sourceValue && ClientKit.isArray(sourceValue) ? sourceValue : [];

      } else {
       targetClone = sourceValue && ClientKit.isPlainObject(sourceValue) ? sourceValue : {};
      }

      // Always clone objects, never move originals
      targetObject[ propertyKey ] = ClientKit.extend( isDeepMerge, targetClone, copiedValue );

     // Do not copy undefValue values
     } else if ( copiedValue !== undefValue ) {
      targetObject[ propertyKey ] = copiedValue;
     }
    }
   }
  }

  // Return the modified target object
  return targetObject;
 };

 ClientKit.extend({
  releaseConflicts: function( deepCleanup ) {
   if ( globalScope.$ === ClientKit ) {
    globalScope.$ = originalDollar;
   }

   if ( deepCleanup && globalScope.ClientKit === ClientKit ) {
    globalScope.ClientKit = originalClientKit;
   }

   return ClientKit;
  },

  // Indicates if the DOM is ready for interaction. Set to true once it occurs.
  domIsReady: false,

  // A counter to manage how many items to wait for before
  // the ready event is triggered. See #6781
  readyWaitCounter: 1,

  // Control (hold or release) the DOM ready event
  manageReadyState: function( shouldHoldEvent ) {
   if ( shouldHoldEvent ) {
    ClientKit.readyWaitCounter++;
   } else {
    ClientKit.onPageReady( true );
   }
  },

  // Handler for when the DOM is fully prepared
  onPageReady: function( isDeferredWait ) {
   // Trigger if a hold is released OR a DOM ready/load event occurs AND not yet ready
   if ( (isDeferredWait === true && !--ClientKit.readyWaitCounter) || (isDeferredWait !== true && !ClientKit.domIsReady) ) {
    // Ensure pageDocument.body exists, especially for overly zealous IE (ticket #5443).
    if ( !pageDocument.body ) {
     return setTimeout( ClientKit.onPageReady, 1 );
    }

    // Mark the DOM as ready
    ClientKit.domIsReady = true;

    // If a standard DOM Ready event fired, decrement counter, and wait if needed
    if ( isDeferredWait !== true && --ClientKit.readyWaitCounter > 0 ) {
     return;
    }

    // Execute any bound ready event functions
    domReadyHandlers.fireWithContext( pageDocument, [ ClientKit ] );

    // Trigger any bound 'ready' events on the document
    if ( ClientKit.proto.trigger ) {
     ClientKit( pageDocument ).trigger( "prepared" ).off( "prepared" );
    }
   }
  },

  setupReadyListeners: function() {
   if ( domReadyHandlers ) {
    return;
   }

   domReadyHandlers = ClientKit.CallbackList( "once singleUse" );

   // Handle cases where ClientKit(pageDocument).onPageReady() is called after
   // the browser's ready event has already occurred.
   if ( pageDocument.readyState === "complete" ) {
    // Process asynchronously to allow scripts to potentially delay the ready state
    return setTimeout( ClientKit.onPageReady, 1 );
   }

   // Modern browsers (Mozilla, Opera, Webkit nightlies) support this event
   if ( pageDocument.addEventListener ) {
    // Use the native DOMContentLoaded event
    pageDocument.addEventListener( "DOMContentLoaded", contentLoadedEventCallback, false );

    // Fallback to window.onload, which is universally supported
    globalScope.addEventListener( "load", ClientKit.onPageReady, false );

   // For older IE event model
   } else if ( pageDocument.attachEvent ) {
    // Ensure firing before onload,
    // safe for iframes but potentially late
    pageDocument.attachEvent( "onreadystatechange", contentLoadedEventCallback );

    // Fallback to window.onload
    globalScope.attachEvent( "onload", ClientKit.onPageReady );

    // For IE and non-frame environments
    // continuously poll the document ready state
    var isTopLevelFrame = false;

    try {
     isTopLevelFrame = globalScope.frameElement == null;
    } catch(err) {}

    if ( pageDocument.documentElement.doScroll && isTopLevelFrame ) {
     initScrollCheck();
    }
   }
  },

  // See test/unit/core.js for details on isFunction.
  // Since v1.3, DOM methods/functions like alert are not supported;
  // they return false in IE (#2968).
  isFunction: function( candidateObject ) {
   return ClientKit.getType(candidateObject) === "function";
  },

  isArray: Array.isArray || function( candidateObject ) {
   return ClientKit.getType(candidateObject) === "array";
  },

  // A basic check to determine if an object is a browser window
  isWindowObject: function( candidateObject ) {
   return candidateObject && typeof candidateObject === "object" && "setInterval" in candidateObject;
  },

  isNumericalValue: function( candidateObject ) {
   return !isNaN( parseFloat(candidateObject) ) && isFinite( candidateObject );
  },

  getType: function( candidateObject ) {
   return candidateObject == null ?
    String( candidateObject ) :
    classToTypeMap[ objProtoToString.call(candidateObject) ] || "object";
  },