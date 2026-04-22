/*
 * This file has been created to support design-time code completion for development environments.
 * It is not intended for execution in a live browser environment; its sole
 * purpose is for design-time assistance. For production deployments, please use the
 * standard web utility library.
 *
 * Tooling version: 1.7.1
 */

/*
 * Web Utility Library v1.7.1
 * http://webutil.org/
 *
 * Distributed in its entirety under the terms of the MIT License.
 *
 * Copyright 2010, Alex Smith
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Application"), to deal in the Application without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Application, and to
 * permit persons to whom the Application is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Application.
 *
 * THE APPLICATION IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE APPLICATION OR THE USE OR OTHER DEALINGS IN THE APPLICATION.
 *
 * Integrates SelectorEngine.js
 * http://selectorengine.org/
 * Copyright 2010, The Code Alliance
 * Released under the MIT and BSD Licenses.
 */

(function( globalObj, unknownValue ) {

 var DomManipulator = function( targetIdentifier, scopeElement ) {
  /// <summary>
  ///     1: Accepts a string containing a CSS selector, then matches a set of elements.
  ///     <para>    1.1 - $(targetIdentifier, scopeElement) </para>
  ///     <para>    1.2 - $(domNode) </para>
  ///     <para>    1.3 - $(plainObject) </para>
  ///     <para>    1.4 - $(nodeArray) </para>
  ///     <para>    1.5 - $(DomManipulator object) </para>
  ///     <para>    1.6 - $()</para>
  ///     <para>2: Generates DOM elements dynamically from a raw HTML string.</para>
  ///     <para>    2.1 - $(markup, owningDocument) </para>
  ///     <para>    2.2 - $(markup, properties)</para>
  ///     <para>3: Attaches a function to execute once the DOM has fully loaded.</para>
  ///     <para>    3.1 - $(readyCallback)</para>
  /// </summary>
  /// <param name="targetIdentifier" type="String">
  ///     A string containing a selector expression.
  /// </param>
  /// <param name="scopeElement" type="DomManipulator">
  ///     A DOM Element, Document, or DomManipulator object to use as the search context.
  /// </param>
  /// <returns type="DomManipulator" />

  // The DomManipulator object is effectively the 'initializer' constructor, enhanced.
  return new DomManipulator.prototype.initializer( targetIdentifier, scopeElement, baseDomObj );
 };


 DomManipulator.EventHandlers = function( configOptions ) {
  /// <summary>
  ///     A versatile event handler list object that offers robust callback management.
  /// </summary>
  /// <param name="configOptions" type="String">
  ///     An optional string of space-separated flags that alter the list's behavior.
  /// </param>

  // Convert flags from string format to object format
  // (check cache first for efficiency)
  configOptions = configOptions ? ( optionStore[ configOptions ] || generateOptions( configOptions ) ) : {};

  var // The actual list of handlers
   handlerList = [],
   // A stack for fire calls in repeatable lists
   invocationStack = [],
   // The last value passed during a 'fire' (for non-forgettable lists)
   lastInvocationData,
   // Flag indicating if the list is currently invoking handlers
   isInvoking,
   // The starting index for handler invocation (used by registerHandlers and triggerWithContext)
   invocationStartIndex,
   // The ending index for the current invocation loop
   invocationCount,
   // The index of the handler currently being invoked (adjusted by remove if necessary)
   currentInvocationIndex,

   // Function to add one or multiple handlers to the list
   registerHandlers = function( handlerArguments ) {
    var i,
     length,
     itemEntry,
     entryType,
     actualEntry;
    for ( i = 0, length = handlerArguments.length; i < length; i++ ) {
     itemEntry = handlerArguments[ i ];
     entryType = DomManipulator.determineType( itemEntry );
     if ( entryType === "array" ) {
      // Recursively inspect nested arrays
      registerHandlers( itemEntry );
     } else if ( entryType === "function" ) {
      // Add if not in unique mode and the handler is not already present
      if ( !configOptions.unique || !callbackManager.contains( itemEntry ) ) {
       handlerList.push( itemEntry );
      }
     }
    }
   },

   // Function to trigger the handlers
   triggerHandlers = function( executionContext, passedArguments ) {
    passedArguments = passedArguments || [];
    lastInvocationData = !configOptions.memory || [ executionContext, passedArguments ];
    isInvoking = true;
    currentInvocationIndex = invocationStartIndex || 0;
    invocationStartIndex = 0;
    invocationCount = handlerList.length;

    for ( ; handlerList && currentInvocationIndex < invocationCount; currentInvocationIndex++ ) {
     if ( handlerList[ currentInvocationIndex ].apply( executionContext, passedArguments ) === false && configOptions.haltOnError ) {
      lastInvocationData = true; // Mark as having stopped
      break;
     }
    }
    isInvoking = false;
    if ( handlerList ) {
     if ( !configOptions.invokeOnce ) {
      if ( invocationStack && invocationStack.length ) {
       lastInvocationData = invocationStack.shift();
       callbackManager.triggerWithContext( lastInvocationData[ 0 ], lastInvocationData[ 1 ] );
      }
     } else if ( lastInvocationData === true ) {
      callbackManager.deactivate();
     } else {
      handlerList = [];
     }
    }
   },

   // The actual Callbacks object interface
   callbackManager = {
    // Add a single handler or a collection of handlers to the list
    add: function() {
     if ( handlerList ) {
      var currentLength = handlerList.length;
      registerHandlers( arguments );
      // Do we need to include the new handlers in the
      // current invocation batch?
      if ( isInvoking ) {
       invocationCount = handlerList.length;
      // With memory enabled, if we're not currently invoking,
      // we should call immediately, unless a previous
      // invocation was halted (haltOnError)
      } else if ( lastInvocationData && lastInvocationData !== true ) {
       invocationStartIndex = currentLength;
       triggerHandlers( lastInvocationData[ 0 ], lastInvocationData[ 1 ] );
      }
     }
     return this;
    },

    // Remove a handler from the list
    remove: function() {
     if ( handlerList ) {
      var removeArguments = arguments,
       argIterator = 0,
       argCount = removeArguments.length;
      for ( ; argIterator < argCount ; argIterator++ ) {
       for ( var j = 0; j < handlerList.length; j++ ) {
        if ( removeArguments[ argIterator ] === handlerList[ j ] ) {
         // Adjust currentInvocationIndex and invocationCount
         if ( isInvoking ) {
          if ( j <= invocationCount ) {
           invocationCount--;
           if ( j <= currentInvocationIndex ) {
            currentInvocationIndex--;
           }
          }
         }
         // Remove the specific element
         handlerList.splice( j--, 1 );
         // If a unique property is set, we only need to do this once
         if ( configOptions.unique ) {
          break;
         }
        }
       }
      }
     }
     return this;
    },

    // Check if a specific handler is present in the list
    has: function( handlerFunc ) {
     if ( handlerList ) {
      var k = 0,
       totalLength = handlerList.length;
      for ( ; k < totalLength; k++ ) {
       if ( handlerFunc === handlerList[ k ] ) {
        return true;
       }
      }
     }
     return false;
    },

    // Clear all handlers from the list
    empty: function() {
     handlerList = [];
     return this;
    },

    // Make the list inactive and perform no further actions
    deactivate: function() {
     handlerList = invocationStack = lastInvocationData = unknownValue;
     return this;
    },

    // Check if the list is inactive
    isDeactivated: function() {
     return !handlerList;
    },

    // Prevent any further changes to the list's state
    preventFurtherCalls: function() {
     invocationStack = unknownValue;
     if ( !lastInvocationData || lastInvocationData === true ) {
      callbackManager.deactivate();
     }
     return this;
    },

    // Check if the list is locked
    isLocked: function() {
     return !invocationStack;
    },

    // Invoke all handlers with a specified context and arguments
    triggerWithContext: function( executionContext, passedArguments ) {
     if ( invocationStack ) {
      if ( isInvoking ) {
       if ( !configOptions.invokeOnce ) {
        invocationStack.push( [ executionContext, passedArguments ] );
       }
      } else if ( !( configOptions.invokeOnce && lastInvocationData ) ) {
       triggerHandlers( executionContext, passedArguments );
      }
     }
     return this;
    },

    // Invoke all handlers with the provided arguments
    trigger: function() {
     callbackManager.triggerWithContext( this, arguments );
     return this;
    },

    // Determine if the handlers have been invoked at least once
    hasTriggered: function() {
     return !!lastInvocationData;
    }
   };

  return callbackManager;
 };


 DomManipulator.PromiseObject = function( initialAction ) {

  var successHandlers = DomManipulator.EventHandlers( "once memory" ),
   failureHandlers = DomManipulator.EventHandlers( "once memory" ),
   progressReporters = DomManipulator.EventHandlers( "memory" ),
   currentStatus = "pending",
   handlerCollections = {
    complete: successHandlers,
    fail: failureHandlers,
    updateProgress: progressReporters
   },
   resultPromise = {
    onCompletion: successHandlers.add,
    onFailure: failureHandlers.add,
    onProgress: progressReporters.add,

    status: function() {
     return currentStatus;
    },

    // Marked for deprecation
    hasCompleted: successHandlers.hasTriggered,
    hasFailed: failureHandlers.hasTriggered,

    chainPromises: function( successCallbacks, failCallbacks, progressCallbacks ) {
     primaryDeferred.onCompletion( successCallbacks ).onFailure( failCallbacks ).onProgress( progressCallbacks );
     return this;
    },
    onFinish: function() {
     primaryDeferred.onCompletion.apply( primaryDeferred, arguments ).onFailure.apply( primaryDeferred, arguments );
     return this;
    },
    transformResult: function( fnSuccess, fnFail, fnProgress ) {
     return DomManipulator.PromiseObject(function( newPromiseObj ) {
      DomManipulator.forEach( {
       onCompletion: [ fnSuccess, "complete" ],
       onFailure: [ fnFail, "fail" ],
       onProgress: [ fnProgress, "updateProgress" ]
      }, function( callbackType, handlerInfo ) {
       var callbackFunction = handlerInfo[ 0 ],
        resultAction = handlerInfo[ 1 ],
        returnValue;
       if ( DomManipulator.isCallable( callbackFunction ) ) {
        primaryDeferred[ callbackType ](function() {
         returnValue = callbackFunction.apply( this, arguments );
         if ( returnValue && DomManipulator.isCallable( returnValue.getPromise ) ) {
          returnValue.getPromise().chainPromises( newPromiseObj.complete, newPromiseObj.fail, newPromiseObj.updateProgress );
         } else {
          newPromiseObj[ resultAction + "With" ]( this === primaryDeferred ? newPromiseObj : this, [ returnValue ] );
         }
        });
       } else {
        primaryDeferred[ callbackType ]( newPromiseObj[ resultAction ] );
       }
      });
     }).getPromise();
    },
    // Obtain a promise interface for this deferred object
    // If targetObject is provided, the promise aspects are added to it
    getPromise: function( targetObject ) {
     if ( targetObject == null ) {
      targetObject = resultPromise;
     } else {
      for ( var propName in resultPromise ) {
       targetObject[ propName ] = resultPromise[ propName ];
      }
     }
     return targetObject;
    }
   },
   primaryDeferred = resultPromise.getPromise({}),
   propKey;

  for ( propKey in handlerCollections ) {
   primaryDeferred[ propKey ] = handlerCollections[ propKey ].trigger;
   primaryDeferred[ propKey + "With" ] = handlerCollections[ propKey ].triggerWithContext;
  }

  // Manage the state transitions
  primaryDeferred.onCompletion( function() {
   currentStatus = "resolved";
  }, failureHandlers.deactivate, progressReporters.preventFurtherCalls ).onFailure( function() {
   currentStatus = "rejected";
  }, successHandlers.deactivate, progressReporters.preventFurtherCalls );

  // Invoke the initial function if provided
  if ( initialAction ) {
   initialAction.invoke( primaryDeferred, primaryDeferred );
  }

  // All setup is complete!
  return primaryDeferred;
 };


 DomManipulator.CustomEvent = function( sourceEvent, eventProperties ) {

  // Allow instantiation without the 'new' keyword
  if ( !(this instanceof DomManipulator.CustomEvent) ) {
   return new DomManipulator.CustomEvent( sourceEvent, eventProperties );
  }

  // Event object details
  if ( sourceEvent && sourceEvent.eventType ) {
   this.baseEvent = sourceEvent;
   this.eventType = sourceEvent.eventType;

   // Events propagating up the DOM tree might have had their default action prevented
   // by a handler lower down; reflect the correct state.
   this.isActionPrevented = ( sourceEvent.defaultActionPrevented || sourceEvent.returnStatus === false ||
    sourceEvent.getPreventedDefault && sourceEvent.getPreventedDefault() ) ? alwaysTrue : alwaysFalse;

  // Event type string
  } else {
   this.eventType = sourceEvent;
  }

  // Apply explicitly provided properties onto the event object
  if ( eventProperties ) {
   DomManipulator.assignProperties( this, eventProperties );
  }

  // Generate a timestamp if the incoming event lacks one
  this.eventTimestamp = sourceEvent && sourceEvent.eventTimestamp || DomManipulator.currentTime();

  // Mark this event as processed
  this[ DomManipulator.uniqueId ] = true;
 };


 DomManipulator.internalData = function( targetElement, dataKey, valueToStore ) {

  return DomManipulator.externalData( targetElement, dataKey, valueToStore, true );
 };


 DomManipulator.setInternalMark = function( targetElement, markType ) {

  if ( targetElement ) {
   markType = ( markType || "animation" ) + "mark";
   DomManipulator.internalData( targetElement, markType, (DomManipulator.internalData( targetElement, markType ) || 0) + 1 );
  }
 };


 DomManipulator.clearInternalMark = function( forceRemoval, targetElement, markType ) {

  if ( forceRemoval !== true ) {
   markType = targetElement;
   targetElement = forceRemoval;
   forceRemoval = false;
  }
  if ( targetElement ) {
   markType = markType || "animation";
   var markIdentifier = markType + "mark",
    markCount = forceRemoval ? 0 : ( (DomManipulator.internalData( targetElement, markIdentifier ) || 1) - 1 );
   if ( markCount ) {
    DomManipulator.internalData( targetElement, markIdentifier, markCount );
   } else {
    DomManipulator.eraseData( targetElement, markIdentifier, true );
    processQueueMarkDeferred( targetElement, markType, "mark" );
   }
  }
 };


 DomManipulator.canStoreData = function( testElement ) {

  if ( testElement.tagIdentifier ) {
   var nodeRestriction = DomManipulator.dataExclusions[ testElement.tagIdentifier.toLower() ];

   if ( nodeRestriction ) {
    return !(nodeRestriction === true || testElement.fetchAttribute("classIdAttr") !== nodeRestriction);
   }
  }

  return true;
 };


 DomManipulator.manageAttribute = function( elementCollection, attributeName, attributeValue, executeFunction, accessorFunction, passContext ) {

  var collectionLength = elementCollection.length;

  // Setting multiple attributes
  if ( checkType( attributeName ) === "object" ) {
   for ( var attributeKey in attributeName ) {
    DomManipulator.manageAttribute( elementCollection, attributeKey, attributeName[attributeKey], executeFunction, accessorFunction, attributeValue );
   }
   return elementCollection;
  }

  // Setting a single attribute
  if ( attributeValue !== unknownValue ) {
   // Optionally, function values are executed if executeFunction is true
   executeFunction = !passContext && executeFunction && DomManipulator.isCallable(attributeValue);

   for ( var i = 0; i < collectionLength; i++ ) {
    accessorFunction( elementCollection[i], attributeName, executeFunction ? attributeValue.invoke( elementCollection[i], i, accessorFunction( elementCollection[i], attributeName ) ) : attributeValue, passContext );
   }

   return elementCollection;
  }

  // Retrieving an attribute
  return collectionLength ? accessorFunction( elementCollection[0], attributeName ) : unknownValue;
 };


 DomManipulator.activeRequests = 0;


 DomManipulator.makeHttpRequest = function( resourceAddress, requestOptions ) {
  /// <summary>
  ///     Execute an asynchronous HTTP (Ajax) request.
  ///     <para>1 - DomManipulator.makeHttpRequest(resourceAddress, requestOptions) </para>
  ///     <para>2 - DomManipulator.makeHttpRequest(requestOptions)</para>
  /// </summary>
  /// <param name="resourceAddress" type="String">
  ///     A string containing the URL to which the request will be sent.
  /// </param>
  /// <param name="requestOptions" type="Object">
  ///     A set of key/value pairs that configure the Ajax request. All settings are optional. Default values can be set for any option using DomManipulator.configureAjax(). Refer to DomManipulator.makeHttpRequest( requestOptions ) below for a full list of all available settings.
  /// </param>

  // If resourceAddress is an object, simulate pre-1.5 signature
  if ( checkType( resourceAddress ) === "object" ) {
   requestOptions = resourceAddress;
   resourceAddress = unknownValue;
  }

  // Ensure requestOptions is an object
  requestOptions = requestOptions || {};

  var // Construct the final options object
   finalSettings = DomManipulator.configureAjax( {}, requestOptions ),
   // Context for callbacks
   invocationContext = finalSettings.context || finalSettings,
   // Context for global events
   // This is invocationContext if provided in options and if it's a DOM node or a DomManipulator collection
   globalEventContext = invocationContext !== finalSettings &&
    ( invocationContext.domNodeType || invocationContext instanceof DomManipulator ) ?
     DomManipulator( invocationContext ) : DomManipulator.eventEmitter,
   // Deferred objects
   requestDeferred = DomManipulator.PromiseObject(),
   completionHandlers = DomManipulator.EventHandlers( "once memory" ),
   // Callbacks based on status
   statusCallbacks = finalSettings.statusCode || {},
   // Key for ifModified check
   etagCheckKey,
   // HTTP Headers (sent all at once)
   httpHeaders = {};