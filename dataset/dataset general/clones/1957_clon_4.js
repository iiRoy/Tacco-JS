(function( globalScope, undefinedAlias ) {

    const operationRegistry = {};
    const reusableIdStore = [];
    const versionIdentifier = "1.10.2";

    const arrayCombiner = reusableIdStore.concat;
    const arrayAppender = reusableIdStore.push;
    const arraySectioner = reusableIdStore.slice;
    const arraySearcher = reusableIdStore.indexOf;
    const objectCategorizer = operationRegistry.toString;
    const ownPropertyVerifier = operationRegistry.hasOwnProperty;
    const stringWhitespaceRemover = String.prototype.trim;

    const numericValuePattern = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source;
    const nonWhitespacePattern = /\S+/g;
    const boundaryWhitespacePattern = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
    const quickHtmlOrIdPattern = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/;
    const standaloneTagPattern = /^<(\w+)\s*\/?>(?:<\/\1>|)$/;
    const jsonStructuralPattern = /^[\],:{}\s]*$/;
    const jsonBracePattern = /(?:^|:|,)(?:\s*\[)+/g;
    const jsonEscapePattern = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g;
    const jsonTokenPattern = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g;
    const msPrefixPattern = /^-ms-/;
    const dashAlphaPattern = /-([\da-z])/gi;

    const dashToCamelConverter = function( _match, character ) {
        return character.toUpperCase();
    };

    let documentReadyPromiseContainer;
    let initialElementWrapper;
    let readyStateMonitor;
    let listenerRemover;

    const originalJQuery = globalScope.jQuery;
    const originalDollar = globalScope.$;

    const currentDocument = globalScope.document;
    const currentRootElement = currentDocument.documentElement;
    const currentWindowLocation = globalScope.location;

    const jQuery = function( selectorInput, contextInput ) {
        return new jQuery.fn.init( selectorInput, contextInput, initialElementWrapper );
    };

    jQuery.fn = jQuery.prototype = {
        jquery: versionIdentifier,
        constructor: jQuery,

        init: function( selectorArgument, contextArgument, rootElementArgument ) {
            let matchedResult, targetElement;

            if ( !selectorArgument ) {
                return this;
            }

            if ( typeof selectorArgument === "string" ) {
                if ( selectorArgument.charAt(0) === "<" && selectorArgument.charAt( selectorArgument.length - 1 ) === ">" && selectorArgument.length >= 3 ) {
                    matchedResult = [ null, selectorArgument, null ];
                } else {
                    matchedResult = quickHtmlOrIdPattern.exec( selectorArgument );
                }

                if ( matchedResult && (matchedResult[1] || !contextArgument) ) {
                    if ( matchedResult[1] ) {
                        let effectiveContext = contextArgument instanceof jQuery ? contextArgument[0] : contextArgument;
                        effectiveContext = effectiveContext && effectiveContext.nodeType ? effectiveContext.ownerDocument || effectiveContext : currentDocument;

                        const tempContainer = currentDocument.createElement('div');
                        tempContainer.innerHTML = matchedResult[1];
                        const createdElements = arraySectioner.call(tempContainer.children);

                        collectionCombiner( this, createdElements );

                        if ( standaloneTagPattern.test( matchedResult[1] ) && isPlainObjectAlt( contextArgument ) ) {
                            for ( const propKey in contextArgument ) {
                                if ( ownPropertyVerifier.call( contextArgument, propKey ) ) {
                                    if ( typeof this[ propKey ] === "function" ) {
                                        this[ propKey ]( contextArgument[ propKey ] );
                                    } else {
                                        if (this.attr) { // Assuming attr method exists in full jQuery.fn
                                            this.attr( propKey, contextArgument[ propKey ] );
                                        } else if (this[0]) {
                                            this[0][propKey] = contextArgument[propKey];
                                        }
                                    }
                                }
                            }
                        }

                        return this;

                    } else {
                        targetElement = currentDocument.getElementById( matchedResult[2] );

                        if ( targetElement && targetElement.parentNode ) {
                            if ( targetElement.id !== matchedResult[2] ) {
                                return rootElementArgument.find( selectorArgument );
                            }

                            this.length = 1;
                            this[0] = targetElement;
                        }

                        this.context = currentDocument;
                        this.selector = selectorArgument;
                        return this;
                    }

                } else if ( !contextArgument || contextArgument.jquery ) {
                    return ( contextArgument || rootElementArgument ).find( selectorArgument );

                } else {
                    return this.constructor( contextArgument ).find( selectorArgument );
                }

            } else if ( selectorArgument.nodeType ) {
                this.context = this[0] = selectorArgument;
                this.length = 1;
                return this;

            } else if ( typeof selectorArgument === "function" ) {
                return rootElementArgument.ready( selectorArgument );
            }

            if ( selectorArgument.selector !== undefinedAlias ) {
                this.selector = selectorArgument.selector;
                this.context = selectorArgument.context;
            }

            return collectionPreparer( selectorArgument, this );
        },

        selector: "",
        length: 0,

        toArray: function() {
            return arraySectioner.call( this );
        },

        get: function( indexValue ) {
            return ( indexValue == null )
                ? this.toArray()
                : ( ( indexValue < 0 ) ? this[ this.length + indexValue ] : this[ indexValue ] );
        },

        pushStack: function( elementCollection ) {
            const newInstance = collectionCombiner( this.constructor(), elementCollection );
            newInstance.prevObject = this;
            newInstance.context = this.context;
            return newInstance;
        },

        each: function( iterationCallback, additionalArgs ) {
            return collectionIterator( this, iterationCallback, additionalArgs );
        },

        ready: function( callbackFunction ) {
            obtainReadyPromise().then( callbackFunction );
            return this;
        },

        slice: function() {
            return this.pushStack( arraySectioner.apply( this, arguments ) );
        },

        first: function() {
            return this.eq( 0 );
        },

        last: function() {
            return this.eq( -1 );
        },

        eq: function( targetIndex ) {
            const currentLength = this.length;
            const effectiveIndex = +targetIndex + ( targetIndex < 0 ? currentLength : 0 );
            return this.pushStack( ( effectiveIndex >= 0 && effectiveIndex < currentLength ) ? [ this[ effectiveIndex ] ] : [] );
        },

        map: function( transformCallback ) {
            const mappedResults = collectionMapper( this, function( elementItem, indexVal ) {
                return transformCallback.call( elementItem, indexVal, elementItem );
            });
            return this.pushStack( mappedResults );
        },

        end: function() {
            return this.prevObject || this.constructor(null);
        },

        push: arrayAppender,
        sort: Array.prototype.sort,
        splice: Array.prototype.splice
    };

    jQuery.fn.init.prototype = jQuery.fn;

    jQuery.extend = jQuery.fn.extend = function() {
        let sourceObject, isArrayCopy, currentCopy, propName, optionsSource, clonedObject,
            targetDestination = arguments[0] || {},
            startIndex = 1,
            argCount = arguments.length,
            isDeepMerge = false;

        if ( typeof targetDestination === "boolean" ) {
            isDeepMerge = targetDestination;
            targetDestination = arguments[1] || {};
            startIndex = 2;
        }

        if ( typeof targetDestination !== "object" && typeof targetDestination !== "function" ) {
            targetDestination = {};
        }

        if ( argCount === startIndex ) {
            targetDestination = this;
            startIndex--;
        }

        for ( ; startIndex < argCount; startIndex++ ) {
            if ( (optionsSource = arguments[ startIndex ]) != null ) {
                for ( propName in optionsSource ) {
                    sourceObject = targetDestination[ propName ];
                    currentCopy = optionsSource[ propName ];

                    if ( targetDestination === currentCopy ) {
                        continue;
                    }

                    if ( isDeepMerge && currentCopy && ( isPlainObjectAlt(currentCopy) || (isArrayCopy = Array.isArray(currentCopy)) ) ) {
                        if ( isArrayCopy ) {
                            isArrayCopy = false;
                            clonedObject = sourceObject && Array.isArray(sourceObject) ? sourceObject : [];
                        } else {
                            clonedObject = sourceObject && isPlainObjectAlt(sourceObject) ? sourceObject : {};
                        }
                        targetDestination[ propName ] = jQuery.extend( isDeepMerge, clonedObject, currentCopy );
                    } else if ( currentCopy !== undefinedAlias ) {
                        targetDestination[ propName ] = currentCopy;
                    }
                }
            }
        }
        return targetDestination;
    };

    jQuery.extend({
        expando: "Lib" + ( versionIdentifier + Math.random() ).replace( /\D/g, "" ),

        noConflict: function( deepConflict ) {
            if ( globalScope.$ === jQuery ) {
                globalScope.$ = originalDollar;
            }
            if ( deepConflict && globalScope.jQuery === jQuery ) {
                globalScope.jQuery = originalJQuery;
            }
            return jQuery;
        },

        isReady: false,
        readyWait: 1,

        holdReady: function( shouldHold ) {
            if ( shouldHold ) {
                jQuery.readyWait++;
            } else {
                jQuery.ready( true );
            }
        },

        ready: function( bypassWait ) {
            if ( bypassWait === true ? --jQuery.readyWait : jQuery.isReady ) {
                return;
            }

            if ( !currentDocument.body ) {
                return setTimeout( jQuery.ready );
            }

            jQuery.isReady = true;

            if ( bypassWait !== true && --jQuery.readyWait > 0 ) {
                return;
            }

            documentReadyPromiseContainer.resolveWith( currentDocument, [ jQuery ] );

            if ( jQuery.fn.trigger ) {
                jQuery( currentDocument ).trigger("ready").off("ready");
            }
        },

        isFunction: function( candidate ) {
            return typeof candidate === "function";
        },

        isArray: Array.isArray || function( candidate ) {
            return objectCategorizer.call(candidate) === "[object Array]";
        },

        isWindow: function( candidate ) {
            return candidate != null && candidate == candidate.globalScope; // Mimicking original logic
        },

        isNumeric: function( candidate ) {
            return !Number.isNaN( Number.parseFloat(candidate) ) && Number.isFinite( candidate );
        },

        type: function( candidate ) {
            if ( candidate == null ) {
                return String( candidate );
            }
            const classification = objectCategorizer.call(candidate);
            switch (classification) {
                case "[object HTMLDocument]": return "document";
                case "[object Window]": return "window";
                case "[object Array]": return "array";
                case "[object Function]": return "function";
                case "[object Object]": return "object";
                case "[object Number]": return "number";
                case "[object String]": return "string";
                case "[object Boolean]": return "boolean";
                case "[object Date]": return "date";
                case "[object RegExp]": return "regexp";
                case "[object Error]": return "error";
                default:
                    return typeof candidate === "object" || typeof candidate === "function" ? "object" : typeof candidate;
            }
        },

        isPlainObject: function( candidate ) {
            if ( !candidate || typeof candidate !== "object" || candidate.nodeType || jQuery.isWindow( candidate ) ) {
                return false;
            }
            const prototype = Object.getPrototypeOf(candidate);
            return prototype === null || prototype.constructor === Object;
        }
    });

    function deferredPromiseFactory() {
        let resolve, reject;
        const promise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });
        return {
            promise: () => promise,
            resolve: resolve,
            reject: reject,
            resolveWith: function( context, args ) {
                resolve.apply( context, args );
            }
        };
    }
    documentReadyPromiseContainer = deferredPromiseFactory();

    readyStateMonitor = function( eventSignal ) {
        if ( currentDocument.addEventListener || eventSignal.type === "load" || currentDocument.readyState === "complete" ) {
            listenerRemover();
            jQuery.ready();
        }
    };

    listenerRemover = function() {
        if ( currentDocument.addEventListener ) {
            currentDocument.removeEventListener( "DOMContentLoaded", readyStateMonitor, false );
            globalScope.removeEventListener( "load", readyStateMonitor, false );
        } else {
            currentDocument.detachEvent( "onreadystatechange", readyStateMonitor );
            globalScope.detachEvent( "onload", readyStateMonitor );
        }
    };

    if ( currentDocument.readyState === "complete" ) {
        setTimeout( jQuery.ready );
    } else {
        if ( currentDocument.addEventListener ) {
            currentDocument.addEventListener( "DOMContentLoaded", readyStateMonitor, false );
            globalScope.addEventListener( "load", readyStateMonitor, false );
        } else {
            currentDocument.attachEvent( "onreadystatechange", readyStateMonitor );
            globalScope.attachEvent( "onload", readyStateMonitor );
        }
    }

    function collectionCombiner( targetArray, sourceArray ) {
        const targetLength = targetArray.length;
        let sourceIndex = 0;
        const sourceLength = sourceArray.length;
        for ( ; sourceIndex < sourceLength; sourceIndex++ ) {
            targetArray[ targetLength + sourceIndex ] = sourceArray[ sourceIndex ];
        }
        targetArray.length = targetLength + sourceLength;
        return targetArray;
    }

    function collectionIterator( collection, callback, argumentsArray ) {
        let currentIdx = 0;
        let collectionLength = collection.length;
        let isArrayLike = collectionLength === +collectionLength;

        if ( isArrayLike ) {
            for ( ; currentIdx < collectionLength; currentIdx++ ) {
                if ( callback.apply( collection[ currentIdx ], argumentsArray || [ currentIdx, collection[ currentIdx ] ] ) === false ) {
                    break;
                }
            }
        } else {
            for ( currentIdx in collection ) {
                if ( callback.apply( collection[ currentIdx ], argumentsArray || [ currentIdx, collection[ currentIdx ] ] ) === false ) {
                    break;
                }
            }
        }
        return collection;
    }

    function collectionMapper( collection, callback ) {
        const results = [];
        let index = 0;
        const length = collection.length;
        if ( length === +length ) {
            for ( ; index < length; index++ ) {
                const value = callback( collection[ index ], index );
                if ( value != null ) {
                    results.push( value );
                }
            }
        } else {
            for ( index in collection ) {
                const value = callback( collection[ index ], index );
                if ( value != null ) {
                    results.push( value );
                }
            }
        }
        return collectionCombiner( [], results );
    }

    function collectionPreparer( input, existingCollection ) {
        let resultingArray = [];

        if ( Array.isArray( input ) ) {
            resultingArray = arraySectioner.call( input );
        } else if ( typeof input.length === "number" && input.length > 0 && ( input.length - 1 ) in input ) {
            resultingArray = arraySectioner.call( input );
        } else {
            resultingArray.push( input );
        }

        return collectionCombiner( existingCollection, resultingArray );
    }

    function obtainReadyPromise() {
        return documentReadyPromiseContainer.promise();
    }

    function isPlainObjectAlt( obj ) {
        if ( !obj || typeof obj !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
            return false;
        }
        const prototype = Object.getPrototypeOf(obj);
        return prototype === null || prototype.constructor === Object;
    }

    globalScope.jQuery = globalScope.$ = jQuery;

})( window, undefined );