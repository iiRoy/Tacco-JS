/*
 * Core JavaScript Utility Library v1.0.0
 * For general DOM manipulation and event handling.
 *
 * Copyright 2023, Your Name Here
 * Distributed under the MIT License.
 *
 * This utility includes elements inspired by Sizzle.js
 * (originally Copyright 2011, The Dojo Foundation, MIT/BSD/GPL licensed)
 *
 * Build Date: Tue Oct 24 10:00:00 2023 +0000
 */

// Encapsulate the entire library within an anonymous function to prevent global scope pollution.
(function( globalScope, undefined ) {

    // Ensure we have a valid window object to operate within.
    if ( typeof globalScope === 'undefined' || globalScope.document === undefined ) {
        throw new Error("This utility requires a window object with a document.");
    }

    // Establish local references for frequently used global objects.
    const currentDocument = globalScope.document;
    const navAgent = globalScope.navigator;
    const currentURL = globalScope.location;

    // The main factory function, essentially our library's entry point.
    const JQLite = (function() {

        // Internal constructor-like function for creating JQLite instances.
        const JQLiteConstructor = function( selectorArgument, contextObject ) {
            // Simply delegates to the main initialization routine.
            return new JQLiteConstructor.prototype.initializer( selectorArgument, contextObject, rootJQLiteInstance );
        };

        // Preserve original global variables in case of overwrites.
        const previousJQLite = globalScope.JQLite;
        const previousDollar = globalScope.$;

        // A reference to the JQLite object representing the document itself.
        let rootJQLiteInstance;

        // Regular expressions for quick parsing of selectors.
        // Identifies simple HTML tags or ID selectors.
        const fastSelectorPattern = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/;

        // Checks for the presence of non-whitespace characters.
        const nonWhitespacePattern = /\S/;

        // Patterns for trimming leading and trailing whitespace.
        const leadTrimPattern = /^\s+/;
        const trailTrimPattern = /\s+$/;

        // Matches a single HTML tag, e.g., `<div>` or `<br/>`.
        const singleTagPattern = /^<(\w+)\s*\/?>(?:<\/\1>)?$/;

        // JSON-related regular expressions for parsing and validation.
        const jsonValidChars = /^[\],:{}\s]*$/;
        const jsonEscapedChars = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
        const jsonValidTokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
        const jsonValidBraces = /(?:^|:|,)(?:\s*\[)+/g;

        // Browser user-agent detection patterns.
        const webkitAgent = /(webkit)[ \/]([\w.]+)/;
        const operaAgent = /(opera)(?:.*version)?[ \/]([\w.]+)/;
        const ieAgent = /(msie) ([\w.]+)/;
        const mozillaAgent = /(mozilla)(?:.*? rv:([\w.]+))?/;

        // Used to convert dashed strings (e.g., 'font-size') to camelCase ('fontSize').
        const dashToCamelPattern = /-([a-z]|[0-9])/ig;
        const msVendorPrefix = /^-ms-/;

        // Callback function for camelCase conversion.
        const toUpperConverter = function( _ignoredMatch, charToConvert ) {
            return String( charToConvert ).toUpperCase();
        };

        // Store the browser's user agent string.
        const usrAgentInfo = navAgent.userAgent;

        // Object to hold browser matching results.
        let browserIdentifier;

        // Manages functions to be executed when the DOM is ready.
        let domReadyCallbacks;

        // The handler for the native DOMContentLoaded event.
        let domContentReadyHandler;

        // Cache references to native object prototype methods for efficiency.
        const objToString = Object.prototype.toString;
        const objHasOwn = Object.prototype.hasOwnProperty;
        const arrPush = Array.prototype.push;
        const arrSlice = Array.prototype.slice;
        const strTrim = String.prototype.trim;
        const arrIndexOf = Array.prototype.indexOf;

        // A mapping of internal [[Class]] values to more readable type strings.
        const typeMap = {};

        // Define the JQLite prototype object, aliased as 'fn' for convenience.
        JQLiteConstructor.fn = JQLiteConstructor.prototype = {
            constructor: JQLiteConstructor,

            // The actual initialization logic for creating JQLite objects.
            initializer: function( selectionInput, initialContext, rootElement ) {
                let matchResult, foundElement, processedResult, targetDocument;

                // Handle null, undefined, or empty string inputs gracefully.
                if ( selectionInput == null || selectionInput === '' ) {
                    return this;
                }

                // If the input is a DOM element, wrap it directly.
                if ( selectionInput.nodeType ) {
                    this.initialContext = this[0] = selectionInput;
                    this.length = 1;
                    return this;
                }

                // Special handling for the 'body' element for performance.
                if ( selectionInput === "body" && !initialContext && currentDocument.body ) {
                    this.initialContext = currentDocument;
                    this[0] = currentDocument.body;
                    this.currentSelector = selectionInput;
                    this.length = 1;
                    return this;
                }

                // Process string selectors or HTML fragments.
                if ( typeof selectionInput === "string" ) {
                    // Check if it's likely an HTML string (starts and ends with < >).
                    const inputLength = selectionInput.length;
                    if ( selectionInput[0] === "<" && selectionInput[inputLength - 1] === ">" && inputLength >= 3 ) {
                        // Optimistically treat as HTML, skip regex for performance.
                        matchResult = [ null, selectionInput, null ];
                    } else {
                        // Otherwise, use the fast selector pattern.
                        matchResult = fastSelectorPattern.exec( selectionInput );
                    }

                    // If a match is found and no context is specified for IDs.
                    if ( matchResult && (matchResult[1] || !initialContext) ) {

                        // Handle HTML string input.
                        if ( matchResult[1] ) {
                            // Determine the document context for element creation.
                            targetDocument = ( initialContext && initialContext.nodeType ) ? ( initialContext.ownerDocument || initialContext ) : currentDocument;
                            if ( initialContext instanceof JQLiteConstructor ) {
                                targetDocument = initialContext[0].ownerDocument || initialContext[0];
                            }

                            // If it's a single tag, create it directly.
                            const singleTagMatch = singleTagPattern.exec( selectionInput );
                            if ( singleTagMatch ) {
                                const tagName = singleTagMatch[1];
                                try {
                                    const newElement = targetDocument.createElement( tagName );
                                    // If context is a plain object, assume it contains attributes.
                                    if ( JQLiteConstructor.isPlainObject( initialContext ) ) {
                                        JQLiteConstructor.fn.attr.call( [ newElement ], initialContext, true );
                                    }
                                    selectionInput = [ newElement ];
                                } catch (e) {
                                    console.error("Error creating element:", e);
                                    selectionInput = []; // Fallback to empty if creation fails.
                                }
                            } else {
                                // For more complex HTML, build a document fragment.
                                processedResult = JQLiteConstructor.buildFragment( [ matchResult[1] ], [ targetDocument ] );
                                selectionInput = ( processedResult.cacheable ? JQLiteConstructor.clone(processedResult.fragment) : processedResult.fragment ).childNodes;
                            }
                            return JQLiteConstructor.merge( this, selectionInput );

                        // Handle ID selector input.
                        } else {
                            foundElement = currentDocument.getElementById( matchResult[2] );
                            // Ensure the found element is still in the document.
                            if ( foundElement && foundElement.parentNode ) {
                                // Edge case: IE/Opera returning elements by name for getElementById.
                                if ( foundElement.id !== matchResult[2] ) {
                                    return rootJQLiteInstance.find( selectionInput );
                                }
                                this.length = 1;
                                this[0] = foundElement;
                            } else {
                                this.length = 0; // No element found or invalid.
                            }
                            this.initialContext = currentDocument;
                            this.currentSelector = selectionInput;
                            return this;
                        }

                    // Handle selector with existing JQLite context (e.g., $(expr, $(...))).
                    } else if ( !initialContext || initialContext.jqliteId ) { // 'jqliteId' is a custom property for Type III
                        return ( initialContext || rootJQLiteInstance ).find( selectionInput );

                    // Handle selector with a plain DOM context (e.g., $(expr, context)).
                    } else {
                        // Delegate to creating a JQLite object from the context, then finding.
                        return this.constructor( initialContext ).find( selectionInput );
                    }

                // Handle function input (document ready shortcut).
                } else if ( JQLiteConstructor.isFunction( selectionInput ) ) {
                    return rootJQLiteInstance.onReady( selectionInput );
                }

                // If the input is already a JQLite object, preserve its selector/context.
                if ( selectionInput.currentSelector !== undefined ) {
                    this.currentSelector = selectionInput.currentSelector;
                    this.initialContext = selectionInput.initialContext;
                }
                // Convert the input to an array of elements and merge into this JQLite object.
                return JQLiteConstructor.toArray( selectionInput, this );
            },

            // The selector string used to create this JQLite object.
            currentSelector: "",

            // A custom identifier for JQLite objects.
            jqliteId: "1.0.0", // Renamed from 'jquery' to 'jqliteId' and version changed

            // The number of elements currently in the set.
            length: 0,

            // Get the current number of elements.
            size: function() {
                return this.length;
            },

            // Convert the JQLite object to a plain JavaScript array.
            toNativeArray: function() { // Renamed from toArray
                return arrSlice.call( this, 0 );
            },

            // Get an element by its index, or the entire set as an array.
            fetch: function( indexNum ) { // Renamed from get
                if ( indexNum == null ) {
                    return this.toNativeArray();
                }
                return ( indexNum < 0 ? this[ this.length + indexNum ] : this[ indexNum ] );
            },

            // Add a new set of elements to the JQLite stack.
            stackPush: function( elements, operationName, operationArgs ) { // Renamed from pushStack
                const newSet = this.constructor();

                if ( JQLiteConstructor.isElementArray( elements ) ) { // Renamed from isArray
                    arrPush.apply( newSet, elements );
                } else {
                    JQLiteConstructor.merge( newSet, elements );
                }

                newSet.previousObject = this; // Renamed from prevObject
                newSet.initialContext = this.initialContext;

                if ( operationName === "find" ) {
                    newSet.currentSelector = this.currentSelector + ( this.currentSelector ? " " : "" ) + operationArgs;
                } else if ( operationName ) {
                    newSet.currentSelector = this.currentSelector + "." + operationName + "(" + operationArgs + ")";
                }

                return newSet;
            },

            // Iterate over each element in the set, executing a callback.
            forEachElement: function( processingCallback, extraArguments ) { // Renamed from each
                return JQLiteConstructor.forEach( this, processingCallback, extraArguments );
            },

            // Attach a function to be executed when the DOM is ready.
            onReady: function( handlerFunction ) { // Renamed from ready
                JQLiteConstructor.ensureReadyBindings(); // Renamed from bindReady
                domReadyCallbacks.add( handlerFunction );
                return this;
            },

            // Get the element at a specific index.
            atIndex: function( index ) { // Renamed from eq
                index = Number(index); // Ensure numeric
                return index === -1 ?
                    this.sliceElements( index ) : // Renamed from slice
                    this.sliceElements( index, index + 1 );
            },

            // Get the first element in the set.
            getFirst: function() { // Renamed from first
                return this.atIndex( 0 );
            },

            // Get the last element in the set.
            getLast: function() { // Renamed from last
                return this.atIndex( -1 );
            },

            // Extract a subset of elements.
            sliceElements: function() { // Renamed from slice
                // Using Array.from for arguments for clarity.
                const argsArray = Array.from(arguments);
                return this.stackPush( arrSlice.apply( this, argsArray ),
                    "sliceElements", argsArray.join(",") );
            },

            // Map each element to a new value.
            mapElements: function( mappingCallback ) { // Renamed from map
                return this.stackPush( JQLiteConstructor.map(this, function( currentElem, idx ) {
                    return mappingCallback.call( currentElem, idx, currentElem );
                }));
            },

            // Revert to the previous JQLite set in the stack.
            revert: function() { // Renamed from end
                return this.previousObject || this.constructor(null);
            },

            // Expose native array methods directly on the JQLite object.
            add: arrPush, // Renamed from push
            order: [].sort, // Renamed from sort
            cut: [].splice // Renamed from splice
        };

        // Ensure that the initializer's prototype points to the main JQLite prototype.
        JQLiteConstructor.fn.initializer.prototype = JQLiteConstructor.fn;

        // Utility function for extending objects, similar to `Object.assign` but with deep cloning.
        JQLiteConstructor.extend = JQLiteConstructor.fn.extend = function() {
            let configOptions, propName, sourceVal, copyVal, isCopyArray, deepCloneFlag,
                targetObject = arguments[0] || {},
                argIndex = 1,
                totalArgs = arguments.length,
                isDeep = false;

            // Handle deep copy flag if it's the first argument.
            if ( typeof targetObject === "boolean" ) {
                isDeep = targetObject;
                targetObject = arguments[1] || {};
                argIndex = 2; // Skip boolean and target.
            }

            // Ensure target is an object if it's not already.
            if ( typeof targetObject !== "object" && !JQLiteConstructor.isFunction(targetObject) ) {
                targetObject = {};
            }

            // If only one argument is provided (or two with deep flag), extend JQLite itself.
            if ( totalArgs === argIndex ) {
                targetObject = this;
                argIndex--; // Process from index 0 or 1.
            }

            // Iterate through source objects.
            for ( ; argIndex < totalArgs; argIndex++ ) {
                // Only process non-null/undefined sources.
                if ( (configOptions = arguments[ argIndex ]) !== null && configOptions !== undefined ) {
                    for ( propName in configOptions ) {
                        sourceVal = targetObject[ propName ];
                        copyVal = configOptions[ propName ];

                        // Prevent infinite loops for circular references.
                        if ( targetObject === copyVal ) {
                            continue;
                        }

                        // Recursively merge if deep cloning and copying objects/arrays.
                        if ( isDeep && copyVal && ( JQLiteConstructor.isPlainObject(copyVal) || (isCopyArray = JQLiteConstructor.isElementArray(copyVal)) ) ) {
                            if ( isCopyArray ) {
                                isCopyArray = false;
                                deepCloneFlag = sourceVal && JQLiteConstructor.isElementArray(sourceVal) ? sourceVal : [];
                            } else {
                                deepCloneFlag = sourceVal && JQLiteConstructor.isPlainObject(sourceVal) ? sourceVal : {};
                            }

                            // Do not modify original objects, clone them.
                            targetObject[ propName ] = JQLiteConstructor.extend( isDeep, deepCloneFlag, copyVal );

                        // Otherwise, copy if the value is defined.
                        } else if ( copyVal !== undefined ) {
                            targetObject[ propName ] = copyVal;
                        }
                    }
                }
            }

            return targetObject;
        };

        // Add static utility methods to the JQLite object.
        JQLiteConstructor.extend({
            // Restore previous global JQLite and $ variables.
            releaseConflict: function( fullRestore ) { // Renamed from noConflict
                if ( globalScope.$ === JQLiteConstructor ) {
                    globalScope.$ = previousDollar;
                }
                if ( fullRestore && globalScope.JQLite === JQLiteConstructor ) {
                    globalScope.JQLite = previousJQLite;
                }
                return JQLiteConstructor;
            },

            // Flag indicating if the DOM is ready.
            domHasLoaded: false, // Renamed from isReady

            // Counter for pending ready tasks.
            pendingReadyTasks: 1, // Renamed from readyWait

            // Control the DOM ready event.
            pauseReady: function( shouldHold ) { // Renamed from holdReady
                if ( shouldHold ) {
                    JQLiteConstructor.pendingReadyTasks++;
                } else {
                    JQLiteConstructor.fireReady( true ); // Renamed from ready
                }
            },

            // Trigger the DOM ready event.
            fireReady: function( isWaitReleased ) { // Renamed from ready
                // Check if a hold is released, or if it's a native DOM ready event and not already processed.
                if ( (isWaitReleased === true && !--JQLiteConstructor.pendingReadyTasks) || (isWaitReleased !== true && !JQLiteConstructor.domHasLoaded) ) {
                    // Ensure the document body is available, particularly for older IE.
                    if ( !currentDocument.body ) {
                        return globalScope.setTimeout( JQLiteConstructor.fireReady, 1 );
                    }

                    // Mark DOM as ready.
                    JQLiteConstructor.domHasLoaded = true;

                    // If a non-release trigger, decrement wait counter and return if tasks are still pending.
                    if ( isWaitReleased !== true && --JQLiteConstructor.pendingReadyTasks > 0 ) {
                        return;
                    }

                    // Execute registered ready callbacks.
                    domReadyCallbacks.trigger( currentDocument, [ JQLiteConstructor ] ); // Renamed fireWith to trigger

                    // If a trigger method exists, fire a custom 'ready' event.
                    if ( JQLiteConstructor.fn.trigger ) {
                        JQLiteConstructor( currentDocument ).trigger( "ready" ).off( "ready" );
                    }
                }
            },

            // Set up event listeners for the DOM ready event.
            ensureReadyBindings: function() { // Renamed from bindReady
                if ( domReadyCallbacks ) {
                    return; // Already bound.
                }

                // Initialize a simple callback manager (mimicking jQuery.Callbacks).
                domReadyCallbacks = (function() {
                    let list = [];
                    let fired = false;
                    let memoryArgs = null;

                    return {
                        add: function( fn ) {
                            if ( typeof fn === 'function' ) {
                                if ( fired && memoryArgs ) {
                                    fn.apply( memoryArgs[0], memoryArgs[1] );
                                } else {
                                    list.push( fn );
                                }
                            }
                        },
                        trigger: function( context, args ) {
                            if ( !fired ) {
                                fired = true;
                                memoryArgs = [ context, args ];
                                for ( let i = 0; i < list.length; i++ ) {
                                    list[i].apply( context, args );
                                }
                                list = []; // Clear list after firing
                            }
                        }
                    };
                })();


                // Check if the document is already complete.
                if ( currentDocument.readyState === "complete" ) {
                    // Schedule ready handler asynchronously to allow other scripts to load.
                    return globalScope.setTimeout( JQLiteConstructor.fireReady, 1 );
                }

                // Modern browsers: use DOMContentLoaded.
                if ( currentDocument.addEventListener ) {
                    domContentReadyHandler = function() {
                        // Remove this specific listener once fired to prevent duplicates.
                        currentDocument.removeEventListener( "DOMContentLoaded", domContentReadyHandler, false );
                        JQLiteConstructor.fireReady();
                    };
                    currentDocument.addEventListener( "DOMContentLoaded", domContentReadyHandler, false );
                    // Fallback to window.onload for full page load.
                    globalScope.addEventListener( "load", JQLiteConstructor.fireReady, false );

                // Older IE: use attachEvent.
                } else if ( currentDocument.attachEvent ) {
                    currentDocument.attachEvent( "onreadystatechange", function() {
                        if ( currentDocument.readyState === "complete" || currentDocument.readyState === "interactive" ) {
                            JQLiteConstructor.fireReady();
                        }
                    });
                    globalScope.attachEvent( "onload", JQLiteConstructor.fireReady );

                    // For IE, continually check if the document is ready via doScroll.
                    // This specific check was problematic and is simplified/removed in Type III clone.
                    // Original: if ( currentDocument.documentElement.doScroll && toplevel ) { doScrollCheck(); }
                    // Simplified: We'll rely on onreadystatechange and onload primarily.
                    // Or, add a minimal polling check if absolutely necessary without a complex doScroll.
                    // For this clone, we'll omit the doScroll check as it's highly browser-specific and less critical for core functionality resemblance.
                }
            },

            // Determine if an object is a function.
            isFunction: function( candidate ) {
                return JQLiteConstructor.getType(candidate) === "function";
            },

            // Determine if an object is an array.
            isElementArray: Array.isArray || function( candidate ) { // Renamed from isArray
                return JQLiteConstructor.getType(candidate) === "array";
            },

            // A no-operation function.
            noop: function() {},

            // Simple type determination (mimics jQuery.type).
            getType: function( obj ) {
                if ( obj == null ) {
                    return String( obj );
                }
                // Rely on `objToString` for most types.
                return typeMap[ objToString.call(obj) ] || "object";
            },

            // Check if an object is a plain object (created by `{}` or `new Object()`).
            isPlainObject: function( obj ) {
                // Not an object or a host object.
                if ( JQLiteConstructor.getType(obj) !== "object" || obj.nodeType || JQLiteConstructor.isFunction(obj) ) {
                    return false;
                }
                // No `hasOwnProperty` method means it's likely a host object.
                if ( !objHasOwn.call( obj, "constructor" ) ) {
                    return true;
                }
                // Check if the constructor is `Object` and it's not a native object like `Date`.
                const proto = Object.getPrototypeOf(obj);
                return proto === null || proto.constructor === Object && objToString.call(obj) === '[object Object]';
            },

            // Convert an array-like object to a true array.
            toArray: function( arrayLike, result ) {
                let i = 0,
                    len = arrayLike.length;
                result = result || [];
                if ( len == null || typeof len !== "number" || len < 0 || len % 1 ) {
                    // Not an array-like object, treat as single element if not null/undefined.
                    if ( arrayLike != null ) {
                        result.push(arrayLike);
                    }
                } else {
                    for ( ; i < len; i++ ) {
                        result.push( arrayLike[i] );
                    }
                }
                return result;
            },

            // Merge two arrays or array-like objects.
            merge: function( firstArray, secondArray ) {
                let i = firstArray.length,
                    j = 0;
                if ( typeof secondArray.length === "number" ) {
                    for ( let len = secondArray.length; j < len; j++ ) {
                        firstArray[ i++ ] = secondArray[ j ];
                    }
                } else {
                    while ( secondArray[j] !== undefined ) {
                        firstArray[ i++ ] = secondArray[ j++ ];
                    }
                }
                firstArray.length = i;
                return firstArray;
            },

            // Generic iterator for objects and arrays.
            forEach: function( collection, callback, args ) {
                let i = 0,
                    length = collection.length,
                    isArr = length === undefined || JQLiteConstructor.isFunction(collection);

                if ( isArr ) {
                    for ( const key in collection ) {
                        if ( callback.apply( collection[ key ], args || [ key, collection[ key ] ] ) === false ) {
                            break;
                        }
                    }
                } else {
                    for ( ; i < length; i++ ) {
                        if ( callback.apply( collection[ i ], args || [ i, collection[ i ] ] ) === false ) {
                            break;
                        }
                    }
                }
                return collection;
            }
        });

        // Initialize the `typeMap` for `getType` function.
        JQLiteConstructor.forEach("Boolean Number String Function Array Date RegExp Object".split(" "), function( i, name ) {
            typeMap[ "[object " + name + "]" ] = name.toLowerCase();
        });

        // Placeholder for `buildFragment` and `clone` which are more complex DOM manipulation.
        // For a Type III clone, these can be simplified or just stubbed to maintain structure.
        JQLiteConstructor.buildFragment = function( html, ownerDocs ) {
            // A simplified stub for functionality, actual implementation is complex.
            const tempDiv = ownerDocs[0].createElement('div');
            tempDiv.innerHTML = html[0];
            return {
                fragment: tempDiv,
                cacheable: false
            };
        };
        JQLiteConstructor.clone = function( node ) {
            // Simple clone for demonstration. Real clone is more robust.
            return node.cloneNode(true);
        };
        JQLiteConstructor.fn.attr = function( /* attr, value */ ) {
            // Stub for attribute manipulation.
            console.warn("JQLite.fn.attr is a stub in this clone.");
            return this;
        };


        // The document ready state is crucial.
        // We set the root JQLite instance to represent the document.
        // This is done after `JQLiteConstructor` and its prototype are fully defined.
        rootJQLiteInstance = JQLiteConstructor( currentDocument );

        return JQLiteConstructor;
    })();

    // Expose JQLite to the global scope under its own name and as '$'.
    globalScope.JQLite = globalScope.$ = JQLite;

})( window );