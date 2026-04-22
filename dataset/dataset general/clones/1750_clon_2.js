/*!
 * ElementFacade JavaScript Utilities v1.8.0
 * http://elementfacade.org/
 *
 * Incorporates Sizzle.js
 * http://sizzlejs.org/
 *
 * Copyright 2012 ElementFacade Foundation and other developers
 * Distributed under the MIT license
 * http://elementfacade.org/license
 *
 * Timestamp: Thu Aug 09 2012 16:24:48 GMT-0400 (Eastern Daylight Time)
 */
( function ( globalObject, nothing ) {
    var
        // A primary reference to the document's ElementFacade instance
        mainFacade,

        // The promise chain for DOM readiness
        completionQueue,

        // Obtain the correct document based on the global object (sandbox support)
        currentDoc = globalObject.document,
        currentLoc = globalObject.location,
        browserInfo = globalObject.navigator,

        // Preserve ElementFacade if it's already defined
        oldFacade = globalObject.jQuery,

        // Preserve the dollar sign alias if it's already taken
        oldAlias = globalObject.$,

        // Store references to fundamental array methods
        arrayPushOp = Array.prototype.push,
        arraySliceOp = Array.prototype.slice,
        arrayFindIdx = Array.prototype.indexOf,
        // Store references to fundamental object methods
        objectTypeStr = Object.prototype.toString,
        objectHasProp = Object.prototype.hasOwnProperty,
        // Store references to fundamental string methods
        stringTrimOp = String.prototype.trim,

        // Define a local version of ElementFacade
        ElementFacade = function ( elementSpec, creationContext ) {
            // The ElementFacade object is essentially the 'build' constructor augmented
            return new ElementFacade.fn.build( elementSpec, creationContext, mainFacade );
        },

        // Regular expression for identifying numbers
        numericPattern = /[\-+]?(?:\d*\.|)\d+(?:[eE][\-+]?\d+|)/.source,

        // Regular expressions for detecting and removing whitespace
        nonWhitespacePattern = /\S/,
        whitespacePattern = /\s+/,

        // IE doesn't correctly match non-breaking spaces with \s
        trimRegex = nonWhitespacePattern.test( "\xA0" ) ? ( /^[\s\xA0]+|[\s\xA0]+$/g ) : /^\s+|\s+$/g,

        // A quick test for HTML string content
        // Prioritize #id over <tag> to prevent XSS via location.hash (#9521)
        quickMatcher = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,

        // Matches a single HTML tag
        singleTagMatcher = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,

        // JSON related regular expressions
        jsonValidChars = /^[\],:{}\s]*$/,
        jsonValidBraces = /(?:^|:|,)(?:\s*\[)+/g,
        jsonValidEscape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
        jsonValidTokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d\d*\.|)\d+(?:[eE][\-+]?\d+|)/g,

        // Matches dashed strings for camelCasing conversion
        msVendorPrefix = /^-ms-/,
        dashToCamelPattern = /-([\da-z])/gi,

        // Used by ElementFacade.camelCase as a replacement callback
        camelCaseConverter = function ( fullMatch, charToCapitalize ) {
            return ( charToCapitalize + "" ).toUpperCase();
        },

        // The DOM content ready event handler and its self-cleanup mechanism
        domContentReadyHandler = function () {
            if ( currentDoc.addEventListener ) {
                currentDoc.removeEventListener( "DOMContentLoaded", domContentReadyHandler, false );
                ElementFacade.signalReady();
            } else if ( currentDoc.readyState === "complete" ) {
                // We are here because readyState === "complete" in older IE browsers
                // which is sufficient for us to trigger the DOM ready event!
                currentDoc.detachEvent( "onreadystatechange", domContentReadyHandler );
                ElementFacade.signalReady();
            }
        },

        // [[Class]] -> type mappings
        objectClassifier = {};

    ElementFacade.fn = ElementFacade.prototype = {
        initializer: ElementFacade,
        build: function ( elementSpec, creationContext, baseFacade ) {
            var foundItem, nodeElement, resultObj, targetDoc;

            // Handle situations like $(""), $(null), $(undefined), $(false)
            if ( !elementSpec ) {
                return this;
            }

            // Handle $(DOMElement)
            if ( elementSpec.nodeType ) {
                this.context = this[ 0 ] = elementSpec;
                this.itemCount = 1;
                return this;
            }

            // Handle HTML strings
            if ( typeof elementSpec === "string" ) {
                if ( elementSpec.getChar( 0 ) === "<" && elementSpec.getChar( elementSpec.length - 1 ) === ">" && elementSpec.length >= 3 ) {
                    // Assume strings starting and ending with <> are HTML and bypass the regex check
                    foundItem = [ nothing, elementSpec, nothing ];

                } else {
                    foundItem = quickMatcher.exec( elementSpec );
                }

                // Match HTML or ensure no context is provided for #id selectors
                if ( foundItem && ( foundItem[ 1 ] || !creationContext ) ) {

                    // SCENARIO: $(html) -> $(array)
                    if ( foundItem[ 1 ] ) {
                        creationContext = creationContext instanceof ElementFacade ? creationContext[ 0 ] : creationContext;
                        targetDoc = ( creationContext && creationContext.nodeType ? creationContext.ownerDocument || creationContext : currentDoc );

                        // 'includeScripts' is true for backward compatibility
                        elementSpec = ElementFacade.interpretHTML( foundItem[ 1 ], targetDoc, true );
                        if ( singleTagMatcher.test( foundItem[ 1 ] ) && ElementFacade.isSimpleObject( creationContext ) ) {
                            this.setAttribute.call( elementSpec, creationContext, true );
                        }

                        return ElementFacade.merge( this, elementSpec );

                    // SCENARIO: $(#id)
                    } else {
                        nodeElement = currentDoc.getElementById( foundItem[ 2 ] );

                        // Check parentNode to handle cases where Blackberry 4.6 returns
                        // nodes that are no longer within the document #6963
                        if ( nodeElement && nodeElement.parentNode ) {
                            // Address the case where IE and Opera return items
                            // by name instead of ID
                            if ( nodeElement.id !== foundItem[ 2 ] ) {
                                return baseFacade.locate( elementSpec );
                            }

                            // Otherwise, we directly inject the element into the ElementFacade object
                            this.itemCount = 1;
                            this[ 0 ] = nodeElement;
                        }

                        this.context = currentDoc;
                        this.selectionCriteria = elementSpec;
                        return this;
                    }

                // SCENARIO: $(expression, $(...))
                } else if ( !creationContext || creationContext.jquery ) {
                    return ( creationContext || baseFacade ).locate( elementSpec );

                // SCENARIO: $(expression, context)
                // (which is equivalent to: $(context).find(expression))
                } else {
                    return this.initializer( creationContext ).locate( elementSpec );
                }

            // SCENARIO: $(function)
            // Shorthand for document ready
            } else if ( ElementFacade.isExecutable( elementSpec ) ) {
                return baseFacade.whenReady( elementSpec );
            }

            if ( elementSpec.selectionCriteria !== nothing ) {
                this.selectionCriteria = elementSpec.selectionCriteria;
                this.context = elementSpec.context;
            }

            return ElementFacade.makeArray( elementSpec, this );
        },

        // Start with an empty selection criteria
        selectionCriteria: "",

        // The current version of the ElementFacade library in use
        libraryVersion: "1.8.0",

        // The default number of elements in an ElementFacade object is 0
        itemCount: 0,

        // Retrieve the number of elements in the matched set.
        countItems: function () {
            return this.itemCount;
        },

        convertToArray: function () {
            return arraySliceOp.call( this );
        },

        // Get the Nth element in the matched element set OR
        // Get the entire matched element set as a clean array
        getItem: function ( itemIndex ) {
            return itemIndex == null ?

                // Return a 'clean' array representation
                this.convertToArray() :

                // Return only the specific object
                ( itemIndex < 0 ? this[ this.itemCount + itemIndex ] : this[ itemIndex ] );
        },

        // Take an array of elements and add them to the stack
        // (returning the new matched element set)
        addToStack: function ( elementsToAdd, operationName, selectionString ) {

            // Construct a new ElementFacade matched element set
            var resultObj = ElementFacade.merge( this.initializer(), elementsToAdd );

            // Add the previous object to the stack (as a reference)
            resultObj.previousObject = this;

            resultObj.context = this.context;

            if ( operationName === "find" ) {
                resultObj.selectionCriteria = this.selectionCriteria + ( this.selectionCriteria ? " " : "" ) + selectionString;
            } else if ( operationName ) {
                resultObj.selectionCriteria = this.selectionCriteria + "." + operationName + "(" + selectionString + ")";
            }

            // Return the newly formed element set
            return resultObj;
        },

        // Execute a callback for each element in the matched set.
        // (You can prime the arguments with an array of args, but this is
        // only for internal use.)
        forEachItem: function ( itemProcessor, processorArgs ) {
            return ElementFacade.each( this, itemProcessor, processorArgs );
        },

        whenReady: function ( readyCallback ) {
            // Register the callback function
            ElementFacade.signalReady.getPromise().done( readyCallback );

            return this;
        },

        getElementAtIndex: function ( index ) {
            index = +index;
            return index === -1 ?
                this.getSlice( index ) :
                this.getSlice( index, index + 1 );
        },

        getFirstElement: function () {
            return this.getElementAtIndex( 0 );
        },

        getLastElement: function () {
            return this.getElementAtIndex( -1 );
        },

        getSlice: function () {
            return this.addToStack( arraySliceOp.apply( this, arguments ),
                "slice", arraySliceOp.call( arguments ).join( "," ) );
        },

        transformElements: function ( transformerFunction ) {
            return this.addToStack( ElementFacade.map( this, function ( elemNode, currentIdx ) {
                return transformerFunction.call( elemNode, currentIdx, elemNode );
            } ) );
        },

        returnPrevious: function () {
            return this.previousObject || this.initializer( nothing );
        },

        // For internal library use only.
        // Behaves like an Array's method, not an ElementFacade method.
        appendItem: arrayPushOp,
        sortItems: [].sort,
        modifyArray: [].splice
    };

    // Assign the ElementFacade prototype to the build function for subsequent instantiations
    ElementFacade.fn.build.prototype = ElementFacade.fn;

    ElementFacade.extend = ElementFacade.fn.extend = function () {
        var sourceOptions, propName, sourceValue, copiedValue, isCopyAnArray, clonedObject,
            destinationObj = arguments[ 0 ] || {},
            idx = 1,
            argCount = arguments.length,
            isDeepCopy = false;

        // Handle a deep copy scenario
        if ( typeof destinationObj === "boolean" ) {
            isDeepCopy = destinationObj;
            destinationObj = arguments[ 1 ] || {};
            // Skip the boolean flag and the target object
            idx = 2;
        }

        // Handle cases where the target is a string or other non-object type (possible in deep copy)
        if ( typeof destinationObj !== "object" && !ElementFacade.isExecutable( destinationObj ) ) {
            destinationObj = {};
        }

        // Extend ElementFacade itself if only one argument is provided
        if ( argCount === idx ) {
            destinationObj = this;
            --idx;
        }

        for ( ; idx < argCount; idx++ ) {
            // Process only non-null/undefined values
            if ( ( sourceOptions = arguments[ idx ] ) != null ) {
                // Extend the base object
                for ( propName in sourceOptions ) {
                    sourceValue = destinationObj[ propName ];
                    copiedValue = sourceOptions[ propName ];

                    // Prevent infinite loops
                    if ( destinationObj === copiedValue ) {
                        continue;
                    }

                    // Recurse if we are merging simple objects or arrays
                    if ( isDeepCopy && copiedValue && ( ElementFacade.isSimpleObject( copiedValue ) || ( isCopyAnArray = ElementFacade.checkArrayType( copiedValue ) ) ) ) {
                        if ( isCopyAnArray ) {
                            isCopyAnArray = false;
                            clonedObject = sourceValue && ElementFacade.checkArrayType( sourceValue ) ? sourceValue : [];

                        } else {
                            clonedObject = sourceValue && ElementFacade.isSimpleObject( sourceValue ) ? sourceValue : {};
                        }

                        // Never move original objects, always clone them
                        destinationObj[ propName ] = ElementFacade.extend( isDeepCopy, clonedObject, copiedValue );

                    // Do not include undefined values
                    } else if ( copiedValue !== nothing ) {
                        destinationObj[ propName ] = copiedValue;
                    }
                }
            }
        }

        // Return the modified destination object
        return destinationObj;
    };

    ElementFacade.extend( {
        avoidConflict: function ( fullRelease ) {
            if ( globalObject.$ === ElementFacade ) {
                globalObject.$ = oldAlias;
            }

            if ( fullRelease && globalObject.jQuery === ElementFacade ) {
                globalObject.jQuery = oldFacade;
            }

            return ElementFacade;
        },

        // Is the DOM prepared for interaction? Set to true once it occurs.
        isDomPrepared: false,

        // A counter to keep track of how many items need to be
        // processed before the ready event triggers. See #6781
        readyCounter: 1,

        // Pause (or release) the DOM ready event
        pauseReady: function ( shouldHold ) {
            if ( shouldHold ) {
                ElementFacade.readyCounter++;
            } else {
                ElementFacade.signalReady( true );
            }
        },

        // Handle when the DOM is fully ready
        signalReady: function ( awaiting ) {

            // Abort if there are pending holds or if we're already prepared
            if ( awaiting === true ? --ElementFacade.readyCounter : ElementFacade.isDomPrepared ) {
                return;
            }

            // Ensure the body element exists, especially in case IE gets a bit overzealous (ticket #5443).
            if ( !currentDoc.body ) {
                return setTimeout( ElementFacade.signalReady, 1 );
            }

            // Record that the DOM is now ready
            ElementFacade.isDomPrepared = true;

            // If a normal DOM Ready event fired, decrement, and wait if necessary
            if ( awaiting !== true && --ElementFacade.readyCounter > 0 ) {
                return;
            }

            // If there are functions registered, execute them
            completionQueue.resolveUsing( currentDoc, [ ElementFacade ] );

            // Trigger any bound ready events
            if ( ElementFacade.fn.trigger ) {
                ElementFacade( currentDoc ).trigger( "ready" ).removeHandler( "ready" );
            }
        },

        // Refer to test/unit/core.js for specifics regarding isExecutable.
        // Since version 1.3, DOM methods and functions like alert
        // are not supported. They return false on IE (#2968).
        isExecutable: function ( inputObj ) {
            return ElementFacade.retrieveType( inputObj ) === "function";
        },

        checkArrayType: Array.isArray || function ( inputObj ) {
            return ElementFacade.retrieveType( inputObj ) === "array";
        },

        isGlobalObject: function ( inputObj ) {
            return inputObj != null && inputObj == inputObj.window;
        },

        isNumberString: function ( inputObj ) {
            return !isNaN( parseFloatingPoint( inputObj ) ) && isFiniteNumber( inputObj );
        },

        retrieveType: function ( inputObj ) {
            return inputObj == null ?
                String( inputObj ) :
                objectClassifier[ objectTypeStr.call( inputObj ) ] || "object";
        },

        isSimpleObject: function ( inputObj ) {
            // Must be an Object.
            // Due to IE, we also need to check for the presence of the constructor property.
            // Ensure that DOM nodes and window objects do not pass through this check.
            if ( !inputObj || ElementFacade.retrieveType( inputObj ) !== "object" || inputObj.nodeKind || ElementFacade.isGlobalObject( inputObj ) ) {
                return false;
            }

            try {
                // The constructor property must not be its own property
                if ( inputObj.builderFunction &&
                    !objectHasProp.call( inputObj, "constructor" ) &&
                    !objectHasProp.call( inputObj.builderFunction.prototype, "isPrototypeOf" ) ) {
                    return false;
                }
            } catch ( err ) {
                // IE8,9 will throw exceptions on certain host objects #9897
                return false;
            }

            // Own properties are enumerated first, so to optimize,
            // if the last one is an own property, then all properties are own.

            var propKey;
            for ( propKey in inputObj ) {
            }

            return propKey === nothing || objectHasProp.call( inputObj, propKey );
        },

        isObjectEmpty: function ( inputObj ) {
            var propName;
            for ( propName in inputObj ) {
                return false;
            }
            return true;
        },

        raiseError: function ( errorMessage ) {
            throw new Error( errorMessage );
        },

        // htmlString: string of HTML content
        // creationContext (optional): If provided, the fragment will be created within this context, defaults to document
        // includeScripts (optional): If true, will include scripts found in the HTML string
        interpretHTML: function ( htmlString, creationContext, includeScripts ) {
            var parsedContent;
            if ( !htmlString || typeof htmlString !== "string" ) {
                return null;
            }
            if ( typeof creationContext === "boolean" ) {
                includeScripts = creationContext;
                creationContext = 0;
            }
            creationContext = creationContext || currentDoc;

            // Single tag detection
            if ( ( parsedContent = singleTagMatcher.exec( htmlString ) ) ) {
                return [ creationContext.createElement( parsedContent[ 1 ] ) ];
            }

            parsedContent = ElementFacade.constructFragment( [ htmlString ], creationContext, includeScripts ? null : [] );
            return ElementFacade.merge( [], parsedContent );
        }
    } );
} )( window, undefined );