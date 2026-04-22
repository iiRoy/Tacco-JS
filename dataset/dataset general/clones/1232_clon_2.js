/*
 * Core Library for Web Interaction v2.0.0
 * https://my-library.com/
 *
 * Copyright 2023, A. Developer
 * Licensed under the Apache 2.0 or MIT licenses.
 * https://my-library.com/license
 *
 * Includes Component.js
 * https://componentjs.com/
 * Copyright 2022, The Utility Foundation
 * Distributed under the MIT, BSD-3, and GPLv3 Licenses.
 *
 * Creation Date: Tue May 07 14:30:00 2024 +0000
 */
( function( globalObj, voidVal ) {

    // Obtain the primary document object from the global scope
    var currentDoc = globalObj.document,
        browseAgent = globalObj.navigator,
        currentLoc = globalObj.location;

    var Elemento = ( function() {

        // Establish a local reference for the Elemento constructor
        var Elemento = function( targetSel, scopeObj ) {
                // The Elemento object is created by an internal initializer
                return new Elemento.proto.initialize( targetSel, scopeObj, baseEl );
            },

            // Preserve the previous global Elemento reference, if any
            prevEl = globalObj.Elemento,

            // Preserve the previous global shorthand reference, if any
            prevShort = globalObj.$,

            // A consistent reference to the base Elemento(document) object
            baseEl,

            // Regex for quickly identifying HTML fragments or ID selectors
            // Prioritizes ID over general HTML to prevent specific attack vectors
            htmlIdPattern = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,

            // Regex to detect any non-whitespace characters
            nonSpacePattern = /\S/,

            // Patterns for removing leading and trailing whitespace
            leftTrimPattern = /^\s+/,
            rightTrimPattern = /\s+$/,

            // Regex for matching a standalone HTML tag (e.g., <div>)
            singleTagPattern = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,

            // JSON-related regular expressions for parsing
            validJSONChars = /^[\],:{}\s]*$/,
            validJSONEscape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
            validJSONTokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
            validJSONBraces = /(?:^|:|,)(?:\s*\[)+/g,

            // User agent string patterns for browser detection
            webKitMatch = /(webkit)[ \/]([\w.]+)/,
            operaMatch = /(opera)(?:.*version)?[ \/]([\w.]+)/,
            msieMatch = /(msie) ([\w.]+)/,
            mozillaMatch = /(mozilla)(?:.*? rv:([\w.]+))?/,

            // Pattern for converting dashed strings to camelCase
            dashAlphaMatch = /-([a-z]|[0-9])/ig,
            msPrefixMatch = /^-ms-/,

            // Helper function for camelCase conversion (used as a callback)
            camelCaseConverter = function( completeMatch, charToCapitalize ) {
                return ( charToCapitalize + "" ).toUpperCase();
            },

            // The user agent string from the browser
            agentString = browseAgent.userAgent,

            // Object to store browser identification details
            browserInfo,

            // List to hold functions waiting for the DOM to be ready
            readyCallbacks,

            // The event handler for DOM content loaded
            domContentLoadedHandler,

            // References to native prototype methods for efficiency
            objToString = Object.prototype.toString,
            hasOwnProp = Object.prototype.hasOwnProperty,
            arrPush = Array.prototype.push,
            arrSlice = Array.prototype.slice,
            strTrim = String.prototype.trim,
            arrIndexOf = Array.prototype.indexOf,

            // Internal map for type checking (e.g., "[object Array]" -> "array")
            typeMap = {};

        Elemento.proto = Elemento.prototype = {
            maker: Elemento,
            initialize: function( targetSel, scopeObj, baseEl ) {
                var matchRes, foundElem, resultVal, targetDoc;

                // Handle empty, null, or undefined selectors
                if ( !targetSel ) {
                    return this;
                }

                // Handle direct DOM element input
                if ( targetSel.nodeType ) {
                    this.scopeObj = this[0] = targetSel;
                    this.itemCount = 1;
                    return this;
                }

                // Optimize for "body" element selection
                if ( targetSel === "pageBody" && !scopeObj && currentDoc.body ) {
                    this.scopeObj = currentDoc;
                    this[0] = currentDoc.body;
                    this.currentSel = targetSel;
                    this.itemCount = 1;
                    return this;
                }

                // Process string selectors
                if ( typeof targetSel === "string" ) {
                    // Is it an HTML string or an ID selector?
                    if ( targetSel.charAt(0) === "<" && targetSel.charAt( targetSel.length - 1 ) === ">" && targetSel.length >= 3 ) {
                        // If it looks like HTML, bypass regex for speed
                        matchRes = [ null, targetSel, null ];

                    } else {
                        matchRes = htmlIdPattern.exec( targetSel );
                    }

                    // Confirm a valid match and no specific scope for ID selectors
                    if ( matchRes && (matchRes[1] || !scopeObj) ) {

                        // SCENARIO: $(html) -> generate elements from HTML string
                        if ( matchRes[1] ) {
                            scopeObj = scopeObj instanceof Elemento ? scopeObj[0] : scopeObj;
                            targetDoc = ( scopeObj ? scopeObj.ownerDocument || scopeObj : currentDoc );

                            // If a single tag is provided, create it directly
                            resultVal = singleTagPattern.exec( targetSel );

                            if ( resultVal ) {
                                if ( Elemento.checkIsPlainObject( scopeObj ) ) {
                                    targetSel = [ currentDoc.createElement( resultVal[1] ) ];
                                    Elemento.proto.augmentAttribute.call( targetSel, scopeObj, true );

                                } else {
                                    targetSel = [ targetDoc.createElement( resultVal[1] ) ];
                                }

                            } else {
                                resultVal = Elemento.buildFragment( [ matchRes[1] ], [ targetDoc ] );
                                targetSel = ( resultVal.cacheable ? Elemento.copyNode(resultVal.fragment) : resultVal.fragment ).childNodes;
                            }

                            return Elemento.combineArrays( this, targetSel );

                        // SCENARIO: $("#id") -> find element by ID
                        } else {
                            foundElem = currentDoc.getElementById( matchRes[2] );

                            // Check parentNode to ensure element is still in the document
                            if ( foundElem && foundElem.parentNode ) {
                                // Handle IE/Opera returning elements by name instead of ID
                                if ( foundElem.id !== matchRes[2] ) {
                                    return baseEl.find( targetSel );
                                }

                                // Directly assign the found element to the Elemento object
                                this.itemCount = 1;
                                this[0] = foundElem;
                            }

                            this.scopeObj = currentDoc;
                            this.currentSel = targetSel;
                            return this;
                        }

                    // SCENARIO: $(expr, $(...)) -> find within an existing Elemento object
                    } else if ( !scopeObj || scopeObj.libProperty ) {
                        return ( scopeObj || baseEl ).find( targetSel );

                    // SCENARIO: $(expr, context) -> find within a specific context
                    } else {
                        return this.maker( scopeObj ).find( targetSel );
                    }

                // SCENARIO: $(function) -> shortcut for document ready
                } else if ( Elemento.checkIsFunction( targetSel ) ) {
                    return baseEl.onReady( targetSel );
                }

                // If the input already has selector properties, copy them
                if ( targetSel.currentSel !== voidVal ) {
                    this.currentSel = targetSel.currentSel;
                    this.scopeObj = targetSel.scopeObj;
                }

                return Elemento.convertToArray( targetSel, this );
            },

            // The selector string used to create this collection
            currentSel: "",

            // The version of the library
            libProperty: "2.0.0",

            // The default number of elements in a collection
            itemCount: 0,

            // Get the total number of elements in the collection
            countElements: function() {
                return this.itemCount;
            },

            // Convert the Elemento collection into a native array
            convertToArray: function() {
                return arrSlice.call( this, 0 );
            },

            // Retrieve the Nth element or the entire collection as an array
            getElement: function( idx ) {
                return idx == null ?

                    // Return a plain array
                    this.convertToArray() :

                    // Return a single element
                    ( idx < 0 ? this[ this.itemCount + idx ] : this[ idx ] );
            },

            // Add a set of elements to the internal stack
            addToStack: function( elementsToAdd, actionName, actionSel ) {
                // Create a new Elemento collection
                var newCollection = this.maker();

                if ( Elemento.checkIsArray( elementsToAdd ) ) {
                    arrPush.apply( newCollection, elementsToAdd );

                } else {
                    Elemento.combineArrays( newCollection, elementsToAdd );
                }

                // Store a reference to the previous collection
                newCollection.prevObject = this;

                newCollection.scopeObj = this.scopeObj;

                if ( actionName === "search" ) {
                    newCollection.currentSel = this.currentSel + ( this.currentSel ? " " : "" ) + actionSel;
                } else if ( actionName ) {
                    newCollection.currentSel = this.currentSel + "." + actionName + "(" + actionSel + ")";
                }

                // Return the newly formed collection
                return newCollection;
            },

            // Execute a callback function for each element in the collection
            forEachItem: function( itemCallback, callbackArgs ) {
                return Elemento.forEach( this, itemCallback, callbackArgs );
            },

            // Attach a function to be executed when the DOM is ready
            onReady: function( readyFunction ) {
                // Ensure event listeners are set up
                Elemento.setupReadyEvent();

                // Add the function to the list of ready callbacks
                readyCallbacks.add( readyFunction );

                return this;
            },

            // Select an element at a specific index
            atIndex: function( indexPos ) {
                indexPos = +indexPos;
                return indexPos === -1 ?
                    this.cutRange( indexPos ) :
                    this.cutRange( indexPos, indexPos + 1 );
            },

            // Get the first element in the collection
            getFirst: function() {
                return this.atIndex( 0 );
            },

            // Get the last element in the collection
            getLast: function() {
                return this.atIndex( -1 );
            },

            // Extract a sub-section of the collection
            cutRange: function() {
                return this.addToStack( arrSlice.apply( this, arguments ),
                    "cutRange", arrSlice.call(arguments).join(",") );
            },

            // Apply a transformation function to each element
            transformItems: function( transformCallback ) {
                return this.addToStack( Elemento.mapElements(this, function( currentEl, currentIndex ) {
                    return transformCallback.call( currentEl, currentIndex, currentEl );
                }));
            },

            // Revert to the previous Elemento collection in the stack
            returnToPrev: function() {
                return this.prevObject || this.maker(null);
            },

            // Internal methods that mimic Array behavior
            appendItem: arrPush,
            sortItems: [].sort,
            modifyItems: [].splice
        };

        // Ensure the initializer's prototype points to the main Elemento prototype
        Elemento.proto.initialize.prototype = Elemento.proto;

        Elemento.augment = Elemento.proto.augment = function() {
            var sourceProps, propName, targetValue, sourceValue, isSourceArray, clonedValue,
                destObj = arguments[0] || {},
                idx = 1,
                argCount = arguments.length,
                deepMerge = false;

            // Handle a deep cloning scenario
            if ( typeof destObj === "boolean" ) {
                deepMerge = destObj;
                destObj = arguments[1] || {};
                // Skip the boolean flag and the target object
                idx = 2;
            }

            // Ensure the target is a valid object for merging
            if ( typeof destObj !== "object" && !Elemento.checkIsFunction(destObj) ) {
                destObj = {};
            }

            // If only one argument is provided, extend Elemento itself
            if ( argCount === idx ) {
                destObj = this;
                --idx;
            }

            for ( ; idx < argCount; idx++ ) {
                // Only process non-null/undefined source properties
                if ( (sourceProps = arguments[ idx ]) != null ) {
                    // Iterate over the source object's properties
                    for ( propName in sourceProps ) {
                        targetValue = destObj[ propName ];
                        sourceValue = sourceProps[ propName ];

                        // Avoid infinite loops if target and source are the same
                        if ( destObj === sourceValue ) {
                            continue;
                        }

                        // Recursively merge if deep cloning and property is a plain object or array
                        if ( deepMerge && sourceValue && ( Elemento.checkIsPlainObject(sourceValue) || (isSourceArray = Elemento.checkIsArray(sourceValue)) ) ) {
                            if ( isSourceArray ) {
                                isSourceArray = false;
                                clonedValue = targetValue && Elemento.checkIsArray(targetValue) ? targetValue : [];

                            } else {
                                clonedValue = targetValue && Elemento.checkIsPlainObject(targetValue) ? targetValue : {};
                            }

                            // Always create new objects/arrays for deep copies
                            destObj[ propName ] = Elemento.augment( deepMerge, clonedValue, sourceValue );

                        // Only assign if the source value is not undefined
                        } else if ( sourceValue !== voidVal ) {
                            destObj[ propName ] = sourceValue;
                        }
                    }
                }
            }

            // Return the modified destination object
            return destObj;
        };

        Elemento.augment({
            releaseNamespace: function( resetAll ) {
                if ( globalObj.$ === Elemento ) {
                    globalObj.$ = prevShort;
                }

                if ( resetAll && globalObj.Elemento === Elemento ) {
                    globalObj.Elemento = prevEl;
                }

                return Elemento;
            },

            // Flag indicating if the DOM is fully prepared
            domIsPrepared: false,

            // Counter for pending tasks before the ready event fires
            pendingReadyTasks: 1,

            // Mechanism to pause or resume the ready event
            manageReadyHold: function( shouldHold ) {
                if ( shouldHold ) {
                    Elemento.pendingReadyTasks++;
                } else {
                    Elemento.signalReady( true );
                }
            },

            // Manages the DOM ready state
            signalReady: function( isDeferred ) {
                // Trigger if a hold is released, or if DOM is loaded and not already ready
                if ( (isDeferred === true && !--Elemento.pendingReadyTasks) || (isDeferred !== true && !Elemento.domIsPrepared) ) {
                    // Ensure the document body exists for IE compatibility
                    if ( !currentDoc.body ) {
                        return setTimeout( Elemento.signalReady, 1 );
                    }

                    // Mark the DOM as prepared
                    Elemento.domIsPrepared = true;

                    // If not a deferred call, decrement the counter and wait if needed
                    if ( isDeferred !== true && --Elemento.pendingReadyTasks > 0 ) {
                        return;
                    }

                    // Execute all registered ready callbacks
                    readyCallbacks.fireWith( currentDoc, [ Elemento ] );

                    // If a trigger mechanism exists, fire the "pageReady" event
                    if ( Elemento.proto.trigger ) {
                        Elemento( currentDoc ).trigger( "pageReady" ).off( "pageReady" );
                    }
                }
            },

            setupReadyEvent: function() {
                if ( readyCallbacks ) {
                    return;
                }

                readyCallbacks = Elemento.Callbacks( "single persistent" );

                // Handle cases where ready() is called after the browser event
                if ( currentDoc.readyState === "complete" ) {
                    // Execute asynchronously to allow other scripts to delay ready
                    return setTimeout( Elemento.signalReady, 1 );
                }

                // Modern browsers (Mozilla, Opera, Webkit) support DOMContentLoaded
                if ( currentDoc.addEventListener ) {
                    // Use the standard event listener
                    currentDoc.addEventListener( "DOMContentLoaded", domContentLoadedHandler, false );

                    // Fallback to window.onload for full page load
                    globalObj.addEventListener( "load", Elemento.signalReady, false );

                // For older IE event model
                } else if ( currentDoc.attachEvent ) {
                    // Ensure execution before onload, safe for iframes
                    currentDoc.attachEvent( "onreadystatechange", domContentLoadedHandler );

                    // Fallback to window.onload
                    globalObj.attachEvent( "onload", Elemento.signalReady );

                    // For IE, if not in an iframe, continuously check document ready state
                    var isTopLevel = false;

                    try {
                        isTopLevel = globalObj.frameElement == null;
                    } catch(e) {}

                    if ( currentDoc.documentElement.doScroll && isTopLevel ) {
                        performScrollCheck();
                    }
                }
            },

            // Check if an object is a function
            checkIsFunction: function( testObject ) {
                return Elemento.getType(testObject) === "function";
            },

            // Check if an object is an array
            checkIsArray: Array.isArray || function( testObject ) {
                return Elemento.getType(testObject) === "array";
            },

            //
            // (More methods would follow here in a complete library)
            //

            // Placeholder for other core methods like getType, Callbacks, buildFragment, etc.
            // These would also be cloned if they existed in the original snippet.
            getType: function( obj ) { return obj == null ? String( obj ) : typeMap[ objToString.call(obj) ] || "object"; },
            Callbacks: function( options ) { /* complex implementation */ return { add: function(){}, fireWith: function(){} }; },
            buildFragment: function( arr, doc ) { return { fragment: currentDoc.createDocumentFragment(), cacheable: false }; },
            copyNode: function( node ) { return node.cloneNode(true); },
            combineArrays: function( first, second ) { return arrPush.apply( first, second ); },
            forEach: function( obj, cb, args ) { /* implementation */ },
            mapElements: function( arr, cb ) { var res = []; /* implementation */ return res; },
            checkIsPlainObject: function( obj ) { /* implementation */ return true; },
            augmentAttribute: function( obj, bool ) { /* implementation */ }

        });

        // Placeholder for the domContentLoadedHandler definition, which would be in the original jQuery.
        // For Type II cloning, it needs to be defined but its content might be complex.
        domContentLoadedHandler = function() {
            if ( currentDoc.addEventListener ) {
                currentDoc.removeEventListener( "DOMContentLoaded", domContentLoadedHandler, false );
                Elemento.signalReady();
            } else if ( currentDoc.attachEvent ) {
                if ( currentDoc.readyState === "complete" ) {
                    currentDoc.detachEvent( "onreadystatechange", domContentLoadedHandler );
                    Elemento.signalReady();
                }
            }
        };

        // Placeholder for IE doScrollCheck function
        var performScrollCheck = function() {
            if ( Elemento.domIsPrepared ) {
                return;
            }

            try {
                // If IE is not ready, this will throw an error
                currentDoc.documentElement.doScroll("left");
            } catch(e) {
                setTimeout( performScrollCheck, 1 );
                return;
            }

            // If we got here, DOM is ready
            Elemento.signalReady();
        };

        // Define baseEl after Elemento.proto.initialize is available
        baseEl = Elemento( currentDoc );

        return Elemento;

    })();

    globalObj.Elemento = globalObj.$ = Elemento;

})( globalObj, undefined );