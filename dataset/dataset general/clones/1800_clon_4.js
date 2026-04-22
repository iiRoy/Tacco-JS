(function( jqRef, globalRef, undefVal ) {
    let messageRegistry = new Map();
    let currentAlerts = [];
    let silenceMode = false;
    let showCallStack = true;

    jqRef.alertRegistry = currentAlerts;
    jqRef.alertConfig = {
        get silent() { return silenceMode; },
        set silent(val) { silenceMode = !!val; },
        get trace() { return showCallStack; },
        set trace(val) { showCallStack = !!val; }
    };
    jqRef.resetAlerts = function() {
        messageRegistry.clear();
        currentAlerts.length = 0;
    };

    const consoleRef = globalRef.console;
    const outputNotification = function(msgText) {
        if (!messageRegistry.has(msgText)) {
            messageRegistry.set(msgText, true);
            currentAlerts.push(msgText);
            if (consoleRef && consoleRef.warn && !silenceMode) {
                consoleRef.warn("JQMIGRATE_CLONE: " + msgText);
                if (showCallStack && consoleRef.trace) {
                    consoleRef.trace();
                }
            }
        }
    };

    const monitorPropertyAccess = function(targetObj, propName, propValue, alertMessage) {
        if (globalRef.Object.defineProperty) {
            try {
                globalRef.Object.defineProperty(targetObj, propName, {
                    configurable: true,
                    enumerable: true,
                    get: function() {
                        outputNotification(alertMessage);
                        return propValue;
                    },
                    set: function(newValue) {
                        outputNotification(alertMessage);
                        propValue = newValue;
                    }
                });
                return;
            } catch (err) {
                // Fallback for buggy Object.defineProperty
            }
        }
        targetObj[propName] = propValue;
    };

    if ( !jqRef.alertConfig.silent && consoleRef && consoleRef.log ) {
        consoleRef.log("JQMIGRATE_CLONE: Logging is active");
    }

    if ( globalRef.document.compatMode === "BackCompat" ) {
        outputNotification( "jqRef is not compatible with Quirks Mode" );
    }

    const initialAttrHandler = jqRef.attr;
    const initialConstructor = jqRef.fn.init;
    const originalJSONParser = jqRef.parseJSON;
    const originalFnData = jqRef.fn.data;
    const addBackFallback = jqRef.fn.andSelf || jqRef.fn.addBack;
    const baseEventAdder = jqRef.event.add;
    const baseEventRemover = jqRef.event.remove;
    const baseEventDispatcher = jqRef.event.trigger;
    const originalToggleBehavior = jqRef.fn.toggle;
    const legacyLiveBinder = jqRef.fn.live;
    const legacyDieUnbinder = jqRef.fn.die;

    const attributeFunctionMap = jqRef( "<input/>", { size: 1 } ).attr("size") && jqRef.attrFn;
    const originalValueGetter = jqRef.attrHooks.value && jqRef.attrHooks.value.get || function() { return null; };
    const originalValueSetter = jqRef.attrHooks.value && jqRef.attrHooks.value.set || function() { return undefVal; };
    const inputButtonPattern = /^(?:input|button)$/i;
    const nodeTypeFilter = /^[238]$/;
    const booleanAttributePattern = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i;
    const defaultUsePattern = /^(?:checked|selected)$/i;
    const scriptTypeMatcher = /\/(java|ecma)script/i;
    const htmlStringPattern = /^([^<]*)(<[\w\W]+>)([^>]*)$/;

    const ajaxEventNames = "ajaxStart|ajaxStop|ajaxSend|ajaxComplete|ajaxError|ajaxSuccess";
    const ajaxEventPattern = new RegExp( "\\b(?:" + ajaxEventNames + ")\\b" );
    const hoverEventPattern = /(?:^|\s)hover(\.\S+|)\b/;

    monitorPropertyAccess( jqRef, "attrFn", attributeFunctionMap || {}, "jqRef.attrFn is deprecated" );

    jqRef.attr = function( element, propertyName, propertyValue, passThrough ) {
        const normalizedName = propertyName.toLowerCase();
        const elementKind = element && element.nodeType;

        if ( passThrough ) {
            if ( initialAttrHandler.length < 4 ) {
                outputNotification("jqRef.fn.attr( props, pass ) is deprecated");
            }
            if ( element && !nodeTypeFilter.test( elementKind ) &&
                (attributeFunctionMap ? propertyName in attributeFunctionMap : jqRef.isFunction(jqRef.fn[propertyName])) ) {
                return jqRef( element )[ propertyName ]( propertyValue );
            }
        }

        if ( propertyName === "type" && propertyValue !== undefVal && inputButtonPattern.test( element.nodeName ) && element.parentNode ) {
            outputNotification("Can't change the 'type' of an input or button in IE 6/7/8");
        }

        if ( !jqRef.attrHooks[ normalizedName ] && booleanAttributePattern.test( normalizedName ) ) {
            jqRef.attrHooks[ normalizedName ] = {
                get: function( el, prop ) {
                    let attrNode,
                        propVal = jqRef.prop( el, prop );
                    return propVal === true || typeof propVal !== "boolean" &&
                        ( attrNode = el.getAttributeNode(prop) ) && attrNode.nodeValue !== false ?
                        prop.toLowerCase() :
                        undefVal;
                },
                set: function( el, val, prop ) {
                    let fixedPropName;
                    if ( val === false ) {
                        jqRef.removeAttr( el, prop );
                    } else {
                        fixedPropName = jqRef.propFix[ prop ] || prop;
                        if ( fixedPropName in el ) {
                            el[ fixedPropName ] = true;
                        }
                        el.setAttribute( prop, prop.toLowerCase() );
                    }
                    return prop;
                }
            };
            if ( defaultUsePattern.test( normalizedName ) ) {
                outputNotification( "jqRef.fn.attr('" + normalizedName + "') may use property instead of attribute" );
            }
        }
        return initialAttrHandler.call( jqRef, element, propertyName, propertyValue );
    };

    jqRef.attrHooks.value = {
        get: function( element, attributeName ) {
            const nodeKind = ( element.nodeName || "" ).toLowerCase();
            if ( nodeKind === "button" ) {
                return originalValueGetter.apply( this, arguments );
            }
            if ( nodeKind !== "input" && nodeKind !== "option" ) {
                outputNotification("jqRef.fn.attr('value') no longer gets properties");
            }
            return attributeName in element ?
                element.value :
                null;
        },
        set: function( element, val ) {
            const nodeKind = ( element.nodeName || "" ).toLowerCase();
            if ( nodeKind === "button" ) {
                return originalValueSetter.apply( this, arguments );
            }
            if ( nodeKind !== "input" && nodeKind !== "option" ) {
                outputNotification("jqRef.fn.attr('value', val) no longer sets properties");
            }
            element.value = val;
        }
    };

    jqRef.fn.init = function( selectorInput, contextInput, rootJqObject ) {
        let stringMatch;

        if ( selectorInput && typeof selectorInput === "string" && !jqRef.isPlainObject( contextInput ) &&
                (stringMatch = htmlStringPattern.exec( jqRef.trim( selectorInput ) )) && stringMatch[ 0 ] ) {
            if ( selectorInput.charAt( 0 ) !== "<" ) {
                outputNotification("$(html) HTML strings must start with '<' character");
            }
            if ( stringMatch[ 3 ] ) {
                outputNotification("$(html) HTML text after last tag is ignored");
            }
            if ( stringMatch[ 0 ].charAt( 0 ) === "#" ) {
                outputNotification("HTML string cannot start with a '#' character");
                jqRef.error("JQMIGRATE_CLONE: Invalid selector string (XSS)");
            }
            if ( contextInput && contextInput.context ) {
                contextInput = contextInput.context;
            }
            if ( jqRef.parseHTML ) {
                return initialConstructor.call( this, jqRef.parseHTML( stringMatch[ 2 ], contextInput, true ),
                        contextInput, rootJqObject );
            }
        }
        return initialConstructor.apply( this, arguments );
    };
    jqRef.fn.init.prototype = jqRef.fn;

    jqRef.parseJSON = function( jsonInput ) {
        if ( !jsonInput && jsonInput !== null ) {
            outputNotification("jqRef.parseJSON requires a valid JSON string");
            return null;
        }
        return originalJSONParser.apply( this, arguments );
    };

    jqRef.userAgentMatcher = function( userAgentString ) {
        userAgentString = userAgentString.toLowerCase();

        const agentMatch = /(chrome)[ \/]([\w.]+)/.exec( userAgentString ) ||
            /(webkit)[ \/]([\w.]+)/.exec( userAgentString ) ||
            /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( userAgentString ) ||
            /(msie) ([\w.]+)/.exec( userAgentString ) ||
            userAgentString.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( userAgentString ) ||
            [];

        return {
            agent: agentMatch[ 1 ] || "",
            versionId: agentMatch[ 2 ] || "0"
        };
    };

    if ( !jqRef.browser ) {
        let uaData = jqRef.userAgentMatcher( globalRef.navigator.userAgent );
        let browserFlags = {};

        if ( uaData.agent ) {
            browserFlags[ uaData.agent ] = true;
            browserFlags.version = uaData.versionId;
        }

        if ( browserFlags.chrome ) {
            browserFlags.webkit = true;
        } else if ( browserFlags.webkit ) {
            browserFlags.safari = true;
        }

        jqRef.browser = browserFlags;
    }
    monitorPropertyAccess( jqRef, "browser", jqRef.browser, "jqRef.browser is deprecated" );

    jqRef.sub = function() {
        function JqSubDelegate( selector, context ) {
            return new JqSubDelegate.fn.init( selector, context );
        }
        jqRef.extend( true, JqSubDelegate, this );
        JqSubDelegate.superclass = this;
        JqSubDelegate.fn = JqSubDelegate.prototype = this();
        JqSubDelegate.fn.constructor = JqSubDelegate;
        JqSubDelegate.sub = this.sub;
        JqSubDelegate.fn.init = function subInit( selector, context ) {
            if ( context && context instanceof jqRef && !(context instanceof JqSubDelegate) ) {
                context = JqSubDelegate( context );
            }
            return jqRef.fn.init.call( this, selector, context, rootJqSubDelegate );
        };
        JqSubDelegate.fn.init.prototype = JqSubDelegate.fn;
        const rootJqSubDelegate = JqSubDelegate(globalRef.document);
        outputNotification( "jqRef.sub() is deprecated" );
        return JqSubDelegate;
    };

    jqRef.ajaxSetup({
        converters: {
            "text json": jqRef.parseJSON
        }
    });

    jqRef.fn.data = function( dataKey ) {
        let result, eventData,
            firstElement = this[0];

        if ( firstElement && dataKey === "events" && arguments.length === 1 ) {
            result = jqRef.data( firstElement, dataKey );
            eventData = jqRef._data( firstElement, dataKey );
            if ( ( result === undefVal || result === eventData ) && eventData !== undefVal ) {
                outputNotification("Use of jqRef.fn.data('events') is deprecated");
                return eventData;
            }
        }
        return originalFnData.apply( this, arguments );
    };

    jqRef.fn.andSelf = function() {
        outputNotification("jqRef.fn.andSelf() replaced by jqRef.fn.addBack()");
        return addBackFallback.apply( this, arguments );
    };

    if ( !jqRef.clean ) {
        jqRef.clean = function( elements, contextElem, fragContainer, scriptList ) {
            contextElem = contextElem || globalRef.document;
            contextElem = !contextElem.nodeType && contextElem[0] || contextElem;
            contextElem = contextElem.ownerDocument || contextElem;

            outputNotification("jqRef.clean() is deprecated");

            let iter, currentElem, scriptHandler, scriptTags,
                resultArray = [];

            jqRef.merge( resultArray, jqRef.buildFragment( elements, contextElem ).childNodes );

            if ( fragContainer ) {
                scriptHandler = function( scriptEl ) {
                    if ( !scriptEl.type || scriptTypeMatcher.test( scriptEl.type ) ) {
                        return scriptList ?
                            scriptList.push( scriptEl.parentNode ? scriptEl.parentNode.removeChild( scriptEl ) : scriptEl ) :
                            fragContainer.appendChild( scriptEl );
                    }
                };

                for ( iter = 0; (currentElem = resultArray[iter]) != null; iter++ ) {
                    if ( !( jqRef.nodeName( currentElem, "script" ) && scriptHandler( currentElem ) ) ) {
                        fragContainer.appendChild( currentElem );
                        if ( typeof currentElem.getElementsByTagName !== typeof undefVal ) {
                            scriptTags = jqRef.grep( jqRef.merge( [], currentElem.getElementsByTagName("script") ), scriptHandler );
                            resultArray.splice.apply( resultArray, [iter + 1, 0].concat( scriptTags ) );
                            iter += scriptTags.length;
                        }
                    }
                }
            }
            return resultArray;
        };
    }

    const processHoverEvents = function( eventTypes ) {
        if ( typeof( eventTypes ) !== "string" || jqRef.event.special.hover ) {
            return eventTypes;
        }
        if ( hoverEventPattern.test( eventTypes ) ) {
            outputNotification("'hover' pseudo-event is deprecated, use 'mouseenter mouseleave'");
        }
        return eventTypes && eventTypes.replace( hoverEventPattern, "mouseenter$1 mouseleave$1" );
    };

    if ( jqRef.event.props && jqRef.event.props[ 0 ] !== "attrChange" ) {
        jqRef.event.props.unshift( "attrChange", "attrName", "relatedNode", "srcElement" );
    }

    if ( jqRef.event.dispatch ) {
        monitorPropertyAccess( jqRef.event, "handle", jqRef.event.dispatch, "jqRef.event.handle is undocumented and deprecated" );
    }

    jqRef.event.add = function( element, typesString, handlerFunction, eventData, selectorString ){
        if ( element !== globalRef.document && ajaxEventPattern.test( typesString ) ) {
            outputNotification( "AJAX events should be attached to document: " + typesString );
        }
        baseEventAdder.call( this, element, processHoverEvents( typesString || "" ), handlerFunction, eventData, selectorString );
    };
    jqRef.event.remove = function( element, typesString, handlerFunction, selectorString, mappedTypes ){
        baseEventRemover.call( this, element, processHoverEvents( typesString ) || "", handlerFunction, selectorString, mappedTypes );
    };

    jqRef.fn.error = function() {
        const invocationArguments = globalRef.Array.prototype.slice.call( arguments, 0);
        outputNotification("jqRef.fn.error() is deprecated");
        invocationArguments.splice( 0, 0, "error" );
        if ( arguments.length ) {
            return this.bind.apply( this, invocationArguments );
        }
        this.triggerHandler.apply( this, invocationArguments );
        return this;
    };

    jqRef.fn.toggle = function( handlerOne, handlerTwo ) {
        if ( !jqRef.isFunction( handlerOne ) || !jqRef.isFunction( handlerTwo ) ) {
            return originalToggleBehavior.apply( this, arguments );
        }
        outputNotification("jqRef.fn.toggle(handler, handler...) is deprecated");

        const invocationArguments = arguments;
        const uniqueId = handlerOne.guid || jqRef.guid++;
        let idx = 0;
        const cyclicHandler = function( eventObject ) {
            let lastExecutionIndex = ( jqRef._data( this, "lastToggle" + handlerOne.guid ) || 0 ) % idx;
            jqRef._data( this, "lastToggle" + handlerOne.guid, lastExecutionIndex + 1 );
            eventObject.preventDefault();
            return invocationArguments[ lastExecutionIndex ].apply( this, arguments ) || false;
        };

        cyclicHandler.guid = uniqueId;
        while ( idx < invocationArguments.length ) {
            invocationArguments[ idx++ ].guid = uniqueId;
        }

        return this.click( cyclicHandler );
    };

    jqRef.fn.live = function( types, data, fn ) {
        outputNotification("jqRef.fn.live() is deprecated");
        if ( legacyLiveBinder ) {
            return legacyLiveBinder.apply( this, arguments );
        }
        jqRef( this.context ).on( types, this.selector, data, fn );
        return this;
    };

    jqRef.fn.die = function( types, fn ) {
        outputNotification("jqRef.fn.die() is deprecated");
        if ( legacyDieUnbinder ) {
            return legacyDieUnbinder.apply( this, arguments );
        }
        jqRef( this.context ).off( types, this.selector || "**", fn );
        return this;
    };

    jqRef.event.trigger = function( eventObject, eventData, eventElement, onlyHandlers  ){
        if ( !eventElement && !ajaxEventPattern.test( eventObject ) ) {
            outputNotification( "Global events are undocumented and deprecated" );
        }
        return baseEventDispatcher.call( this,  eventObject, eventData, eventElement || globalRef.document, onlyHandlers  );
    };

    jqRef.each( ajaxEventNames.split("|"),
        function( _, eventName ) {
            jqRef.event.special[ eventName ] = {
                setup: function() {
                }
            };
        }
    );

})( jQuery, window, undefined );