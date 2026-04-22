(function( globalScope, undefined ) {

    const currentDocument = globalScope.document;
    const currentNavigation = globalScope.navigator;

    const InstanceOperations = {
        constructor: function( initialItems, baseContext, rootBase ) {
            initialItems = Array.isArray(initialItems) ? initialItems : (initialItems ? [initialItems] : []);
            initialItems.forEach((item, index) => this[index] = item);
            this.length = initialItems.length;
            this.baseContext = baseContext || currentDocument;
            this.queryExpression = "";
            this.previousSet = null;
        },

        retrieveElements: function( idx ) {
            return idx == null ? Array.prototype.slice.call(this) : (this[idx < 0 ? this.length + idx : idx]);
        },

        processItems: function( callbackFn, args ) {
            Array.prototype.forEach.call(this, (item, index) => callbackFn.call(item, index, item));
            return this;
        },

        selectAtIndex: function( index ) {
            index = +index;
            return this.buildNewSet( Array.prototype.slice.call(this, index, index + 1), "selectAtIndex", index );
        },

        firstElement: function() {
            return this.selectAtIndex(0);
        },

        lastElement: function() {
            return this.selectAtIndex(-1);
        },

        extractSlice: function() {
            return this.buildNewSet( Array.prototype.slice.apply(this, arguments), "extractSlice", Array.prototype.slice.call(arguments).join(",") );
        },

        transformAndCollect: function( mappingFn ) {
            const transformed = Array.prototype.map.call(this, (item, index) => mappingFn.call(item, index, item));
            const flattened = transformed.flat(Infinity);
            return this.buildNewSet(flattened, "transformAndCollect");
        },

        buildNewSet: function( newItems, actionLabel, actionDetails ) {
            const newCollection = new mainDomWrapper.prototype.constructor(newItems);
            newCollection.previousSet = this;
            newCollection.baseContext = this.baseContext;

            if ( actionLabel === "findChild" ) {
                newCollection.queryExpression = this.queryExpression + (this.queryExpression ? " " : "") + actionDetails;
            } else if ( actionLabel ) {
                newCollection.queryExpression = this.queryExpression + "." + actionLabel + "(" + actionDetails + ")";
            }
            return newCollection;
        },

        returnToPrevious: function() {
            return this.previousSet || new mainDomWrapper.prototype.constructor(null);
        },

        appendToSet: Array.prototype.push,
        sortSet: Array.prototype.sort,
        modifySet: Array.prototype.splice
    };

    const mainDomWrapper = function( query, contextParam ) {
        let elementsToWrap = [];
        let currentEffectiveContext = contextParam instanceof mainDomWrapper ? contextParam[0] : contextParam;
        currentEffectiveContext = currentEffectiveContext && currentEffectiveContext.nodeType ? currentEffectiveContext : mainDomWrapper.rootInstance ? mainDomWrapper.rootInstance[0] : currentDocument;

        if ( !query ) {
            return new mainDomWrapper.prototype.constructor(null);
        }

        if ( query.nodeType ) {
            elementsToWrap = [query];
        }

        else if ( query === "body" && !contextParam && currentDocument.body ) {
            elementsToWrap = [currentDocument.body];
        }

        else if ( typeof query === "string" ) {
            let htmlFragment = null;
            let idIdentifier = null;
            const contentPattern = /^(?:[^<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/;
            const resultMatch = contentPattern.exec(query);

            if ( query.charAt(0) === "<" && query.charAt( query.length - 1 ) === ">" && query.length >= 3 ) {
                htmlFragment = query;
            } else if (resultMatch) {
                htmlFragment = resultMatch[1];
                idIdentifier = resultMatch[2];
            }

            if ( htmlFragment ) {
                const tempContainer = currentDocument.createElement('div');
                tempContainer.innerHTML = htmlFragment;
                elementsToWrap = Array.from(tempContainer.children);

                const singleTagRegex = /^<(\w+)\s*\/?>(?:<\/\1>)?$/;
                if ( tempContainer.children.length === 1 && singleTagRegex.test(query) && mainDomWrapper.checkType(contextParam) === 'object' && !contextParam.nodeType ) {
                    const targetElement = elementsToWrap[0];
                    if (targetElement) {
                        Object.keys(contextParam).forEach(attrName => {
                            targetElement.setAttribute(attrName, contextParam[attrName]);
                        });
                    }
                }

            } else if ( idIdentifier && (!contextParam || contextParam === currentDocument || contextParam instanceof mainDomWrapper && contextParam[0] === currentDocument) ) {
                const foundById = currentDocument.getElementById(idIdentifier);
                if ( foundById && foundById.parentNode ) {
                    if ( foundById.id !== idIdentifier ) {
                        elementsToWrap = Array.from( (currentEffectiveContext || currentDocument).querySelectorAll(query) );
                    } else {
                        elementsToWrap = [foundById];
                    }
                } else {
                    elementsToWrap = Array.from( (currentEffectiveContext || currentDocument).querySelectorAll(query) );
                }
            } else {
                try {
                    elementsToWrap = Array.from( (currentEffectiveContext || currentDocument).querySelectorAll(query) );
                } catch (e) {
                    elementsToWrap = [];
                }
            }

        } else if ( mainDomWrapper.isFunctionCall( query ) ) {
            mainDomWrapper.registerDomLoadHandler( query );
            return new mainDomWrapper.prototype.constructor(null);
        }

        else if ( query instanceof mainDomWrapper ) {
            elementsToWrap = Array.prototype.slice.call(query);
        }

        const newInstance = new mainDomWrapper.prototype.constructor(elementsToWrap);
        newInstance.baseContext = currentEffectiveContext;
        newInstance.queryExpression = typeof query === 'string' ? query : (query instanceof mainDomWrapper ? query.queryExpression : "");
        return newInstance;
    };

    mainDomWrapper.prototype = InstanceOperations;
    InstanceOperations.constructor.prototype = InstanceOperations;

    Object.assign(mainDomWrapper, {
        softwareVersion: "1.0.0-alt",
        _oldGlobalDollar: globalScope.$,
        _oldGlobalWrapper: globalScope.mainDomWrapper,

        releaseGlobalIdentifiers: function( fullReleaseFlag ) {
            if ( globalScope.$ === mainDomWrapper ) {
                globalScope.$ = mainDomWrapper._oldGlobalDollar;
            }
            if ( fullReleaseFlag && globalScope.mainDomWrapper === mainDomWrapper ) {
                globalScope.mainDomWrapper = mainDomWrapper._oldGlobalWrapper;
            }
            return mainDomWrapper;
        },

        _domFullyReady: false,
        _readyCallHandlers: [],
        _readyHoldCount: 1,

        signalReadyState: function( releaseHold ) {
            if ( (releaseHold === true && !--mainDomWrapper._readyHoldCount) || (releaseHold !== true && !mainDomWrapper._domFullyReady) ) {
                if ( !currentDocument.body ) {
                    return setTimeout( mainDomWrapper.signalReadyState, 1 );
                }

                mainDomWrapper._domFullyReady = true;

                if ( releaseHold !== true && --mainDomWrapper._readyHoldCount > 0 ) {
                    return;
                }

                mainDomWrapper._readyCallHandlers.forEach(handler => handler.call(currentDocument, mainDomWrapper));
                mainDomWrapper._readyCallHandlers = [];
            }
        },

        registerDomLoadHandler: function( callbackFn ) {
            mainDomWrapper._setupLoadListeners();
            mainDomWrapper._readyCallHandlers.push( callbackFn );
            return this;
        },

        _setupLoadListeners: function() {
            if ( mainDomWrapper._listenersActivated ) {
                return;
            }
            mainDomWrapper._listenersActivated = true;

            if ( currentDocument.readyState === "complete" ) {
                return setTimeout( mainDomWrapper.signalReadyState, 1 );
            }

            if ( currentDocument.addEventListener ) {
                currentDocument.addEventListener( "DOMContentLoaded", () => mainDomWrapper.signalReadyState(), false );
                globalScope.addEventListener( "load", () => mainDomWrapper.signalReadyState(), false );
            } else if ( currentDocument.attachEvent ) {
                currentDocument.attachEvent( "onreadystatechange", () => {
                    if ( currentDocument.readyState === "complete" ) {
                        mainDomWrapper.signalReadyState();
                    }
                });
                globalScope.attachEvent( "onload", () => mainDomWrapper.signalReadyState() );

                let isTopWindow = false;
                try {
                    isTopWindow = globalScope.frameElement == null;
                } catch(e) {}

                if ( currentDocument.documentElement.doScroll && isTopWindow ) {
                    (function checkScrollLoop() {
                        if ( mainDomWrapper._domFullyReady ) return;
                        try {
                            currentDocument.documentElement.doScroll("left");
                        } catch(e) {
                            setTimeout( checkScrollLoop, 1 );
                            return;
                        }
                        mainDomWrapper.signalReadyState();
                    })();
                }
            }
        },

        isFunctionCall: (item) => typeof item === "function",
        isSequenceContainer: (item) => Array.isArray(item),
        isGlobalObject: (item) => item && typeof item === "object" && "setInterval" in item,
        isNumericalValue: (item) => !isNaN( parseFloat(item) ) && isFinite( item ),
        checkType: (item) => {
            if (item == null) return String(item);
            const typeMapping = new Map([
                ['[object Function]', 'function'],
                ['[object Array]', 'array'],
                ['[object Window]', 'window'],
                ['[object Document]', 'document'],
                ['[object Object]', 'object'],
                ['[object String]', 'string'],
                ['[object Number]', 'number'],
                ['[object Boolean]', 'boolean'],
                ['[object Null]', 'null'],
                ['[object Undefined]', 'undefined']
            ]);
            return typeMapping.get(Object.prototype.toString.call(item)) || typeof item;
        },

        mergeProperties: function() {
            let destinationObj = arguments[0] || {};
            let argIndex = 1;
            let totalArgs = arguments.length;
            let deepMergeEnabled = false;

            if ( typeof destinationObj === "boolean" ) {
                deepMergeEnabled = destinationObj;
                destinationObj = arguments[1] || {};
                argIndex = 2;
            }

            if ( typeof destinationObj !== "object" && !mainDomWrapper.isFunctionCall(destinationObj) ) {
                destinationObj = {};
            }

            if ( totalArgs === argIndex ) {
                destinationObj = this;
                argIndex--;
            }

            for ( ; argIndex < totalArgs; argIndex++ ) {
                const sourceObj = arguments[argIndex];
                if ( sourceObj != null ) {
                    for ( const propName in sourceObj ) {
                        if ( Object.prototype.hasOwnProperty.call(sourceObj, propName) ) {
                            const destPropValue = destinationObj[propName];
                            const sourcePropValue = sourceObj[propName];

                            if ( destinationObj === sourcePropValue ) {
                                continue;
                            }

                            if ( deepMergeEnabled && sourcePropValue && ( mainDomWrapper.checkType(sourcePropValue) === 'object' || mainDomWrapper.isSequenceContainer(sourcePropValue) ) ) {
                                let clonedPropValue;
                                if ( mainDomWrapper.isSequenceContainer(sourcePropValue) ) {
                                    clonedPropValue = mainDomWrapper.isSequenceContainer(destPropValue) ? destPropValue : [];
                                } else {
                                    clonedPropValue = mainDomWrapper.checkType(destPropValue) === 'object' ? destPropValue : {};
                                }
                                destinationObj[propName] = mainDomWrapper.mergeProperties( deepMergeEnabled, clonedPropValue, sourcePropValue );
                            } else if ( sourcePropValue !== undefined ) {
                                destinationObj[propName] = sourcePropValue;
                            }
                        }
                    }
                }
            }
            return destinationObj;
        }
    });

    mainDomWrapper.rootInstance = mainDomWrapper(currentDocument);

    globalScope.mainDomWrapper = globalScope.$ = mainDomWrapper;

})( window );