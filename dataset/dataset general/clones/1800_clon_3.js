// This module provides compatibility shims and deprecation warnings for older JavaScript patterns.
// Version 1.0.0, Last updated: 2023-10-27
// Developed by a benevolent entity; Licensed under a permissive open-source license.
(function( compatibilityLib, globalObject, missingType ) {
    // Ensuring strict mode for modern execution, though parts might mimic older behaviors.
    // "use strict";

    // A registry to keep track of unique deprecation messages that have already been displayed.
    const issuedNoticesTracker = {};
    let totalWarningsCount = 0; // New fragment: A counter for all warnings issued.

    // Exposed array for logging all deprecation notices. This array is intended to be read-only externally.
    compatibilityLib.deprecationLogEntries = [];

    // Flag to suppress console output of deprecation warnings. Log entries are still maintained regardless of this flag.
    // compatibilityLib.suppressDeprecationOutput = false;

    // Initial check: if console logging is active and not muted, notify the developer about active logging.
    if ( !compatibilityLib.suppressDeprecationOutput && globalObject.console && globalObject.console.log ) {
        globalObject.console.log("OLDJS_COMPAT: Deprecation logging is currently active.");
    }

    // Determine if call stack traces should accompany warnings. If not explicitly set, default to true.
    if ( compatibilityLib.showWarningCallStacks === missingType ) {
        compatibilityLib.showWarningCallStacks = true;
    }

    // Public method to clear all recorded warnings and reset the internal tracker.
    compatibilityLib.resetDeprecationState = function() {
        // Clear the object tracking issued notices.
        Object.keys(issuedNoticesTracker).forEach(key => delete issuedNoticesTracker[key]);
        // Reset the array of log entries.
        compatibilityLib.deprecationLogEntries.length = 0;
        // Reset the total warnings counter.
        totalWarningsCount = 0;
    };

    /**
     * Emits a deprecation notification to the console and logs it internally.
     * Only unique messages are displayed and logged once.
     * @param {string} messageText - The deprecation message to display.
     */
    function emitDeprecationNotification( messageText ) {
        const currentConsole = globalObject.console;
        // Check if this specific message has already been warned about.
        if ( !issuedNoticesTracker[ messageText ] ) {
            issuedNoticesTracker[ messageText ] = true; // Mark this message as warned.
            compatibilityLib.deprecationLogEntries.push( messageText ); // Add the message to the public log.
            totalWarningsCount++; // Increment the global warning counter.

            // If console's warn method is available and output is not suppressed, display the warning.
            if ( currentConsole?.warn && !compatibilityLib.suppressDeprecationOutput ) {
                currentConsole.warn( `OLDJS_COMPAT: ${messageText}` );
                // If stack traces are enabled and console.trace is available, display a trace.
                if ( compatibilityLib.showWarningCallStacks && currentConsole.trace ) {
                    currentConsole.trace();
                }
            }
        }
    }

    /**
     * Defines a property on an object that emits a deprecation warning upon access or modification.
     * This allows tracking usage of deprecated properties.
     * @param {object} targetObject - The object on which to define the property.
     * @param {string} propertyName - The name of the property to deprecate.
     * @param {*} initialValue - The initial value of the property.
     * @param {string} deprecationMessage - The message to display when the property is accessed/modified.
     */
    function establishDeprecatedPropertyNotifier( targetObject, propertyName, initialValue, deprecationMessage ) {
        // Check for the availability of Object.defineProperty, a feature introduced in ECMAScript 5.
        if ( globalObject.Object?.defineProperty ) {
            try {
                // Attempt to define the property with custom getter and setter functions.
                globalObject.Object.defineProperty( targetObject, propertyName, {
                    configurable: true, // Allows the property to be redefined or deleted.
                    enumerable: true,   // Makes the property appear during enumeration (e.g., `for...in`).
                    get: function() {
                        emitDeprecationNotification( deprecationMessage );
                        return initialValue; // Return the stored value.
                    },
                    set: function( newValue ) {
                        emitDeprecationNotification( deprecationMessage );
                        initialValue = newValue; // Update the stored value.
                    }
                });
                return; // Property successfully defined, exit function.
            } catch( definitionError ) {
                // Catch errors during property definition, common in older IE versions with broken implementations.
                // globalObject.console.error("OLDJS_COMPAT: Failed to define deprecated property notifier:", definitionError); // Optional: Add specific error logging.
                compatibilityLib.propertyDefinitionUnsupported = true; // Mark this feature as problematic.
            }
        }

        // Fallback for environments lacking proper Object.defineProperty support or if an error occurred.
        targetObject[ propertyName ] = initialValue;
        // New fragment: If defineProperty failed and we're falling back, issue a general warning.
        if ( compatibilityLib.propertyDefinitionUnsupported ) {
             emitDeprecationNotification(`Cannot properly track access to '${propertyName}' due to lack of Object.defineProperty support.`);
        }
    }

    // Check if the document is in Quirks Mode, which is generally not supported by modern libraries.
    const documentMode = globalObject.document?.compatMode;
    if ( documentMode === "BackCompat" ) {
        emitDeprecationNotification( "The compatibility library detects Quirks Mode, which is not officially supported." );
    }

    // --- Core functionality modifications ---

    // Regular expressions for various attribute-related checks and validations.
    const inputButtonElementIdentifier = /^(?:input|button)$/i; // Identifies input or button elements.
    const validAttributeNodeTypes = /^[238]$/; // Matches attribute, text, and comment nodes.
    const commonBooleanAttributes = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i; // Common boolean attributes.
    const defaultPropUsageAttributes = /^(?:checked|selected)$/i; // Boolean attributes that often use properties instead.

    // Store references to original methods before potential overrides.
    const originalAttributeSupport = compatibilityLib.attr;
    // Safely access original getter/setter for 'value' attribute hook, providing no-op fallbacks.
    const originalValueAttrGetter = compatibilityLib.attrHooks?.value?.get || (() => null);
    const originalValueAttrSetter = compatibilityLib.attrHooks?.value?.set || (() => missingType);

    // Determine the presence and value of the legacy `attrFn` property.
    // New fragment: Split the `attrFn` check for improved readability.
    let legacyAttrFnSupport = null;
    const testElementForAttrFn = compatibilityLib( `<input/>`, { size: 1 } );
    if (testElementForAttrFn.attr("size")) {
        legacyAttrFnSupport = compatibilityLib.attrFn;
    }

    // Deprecate `compatibilityLib.attrFn` by wrapping it with a notifier.
    establishDeprecatedPropertyNotifier( compatibilityLib, "attrFn", legacyAttrFnSupport || {}, "compatibilityLib.attrFn is deprecated and should not be used." );

    // Override `compatibilityLib.attr` to incorporate deprecation warnings and compatibility fixes.
    compatibilityLib.attr = function( elementNode, attributeName, attributeValue, internalFlag ) {
        const lowerCaseAttributeName = attributeName.toLowerCase();
        const elementNodeType = elementNode?.nodeType;

        // Handle the `internalFlag` parameter, which is deprecated in newer versions.
        if ( internalFlag ) {
            // New fragment: Add a more specific condition before warning about the argument count.
            if ( originalAttributeSupport.length < 4 && compatibilityLib.isFunction(compatibilityLib.fn[attributeName]) ) {
                emitDeprecationNotification( "compatibilityLib.fn.attr( properties, internalFlag ) is deprecated; direct use of 'internalFlag' is discouraged." );
            }
            // If the attribute name corresponds to a function, call it on the element.
            if ( elementNode && !validAttributeNodeTypes.test( elementNodeType ) &&
                ( legacyAttrFnSupport ? attributeName in legacyAttrFnSupport : compatibilityLib.isFunction(compatibilityLib.fn[attributeName]) ) ) {
                return compatibilityLib( elementNode )[ attributeName ]( attributeValue );
            }
        }

        // Warn about changing the 'type' attribute for input/button elements in older IE browsers.
        const nodeNameLower = elementNode?.nodeName?.toLowerCase();
        const isInputOrButton = inputButtonElementIdentifier.test( nodeNameLower );
        if ( attributeName === "type" && attributeValue !== missingType && isInputOrButton && elementNode.parentNode ) {
            emitDeprecationNotification( `Attempting to change the 'type' attribute on an ${nodeNameLower} element might lead to issues in older browser versions.` );
        }

        // Restore or shim boolean attribute hooks for consistent behavior.
        if ( !compatibilityLib.attrHooks[ lowerCaseAttributeName ] && commonBooleanAttributes.test( lowerCaseAttributeName ) ) {
            compatibilityLib.attrHooks[ lowerCaseAttributeName ] = {
                get: function( currentElem, attrName ) {
                    // Align boolean attributes with their corresponding DOM properties.
                    const propValue = compatibilityLib.prop( currentElem, attrName );
                    let attributeNodeReference; // New fragment: clearer variable naming for the attribute node.

                    // Return the attribute name if the property is strictly true, or if the property isn't boolean
                    // and an attribute node exists and its value is not false.
                    return propValue === true || ( typeof propValue !== "boolean" &&
                        ( attributeNodeReference = currentElem.getAttributeNode(attrName) ) && attributeNodeReference.nodeValue !== false ) ?
                        attrName.toLowerCase() :
                        missingType; // Return undefined if no match.
                },
                set: function( currentElem, valueToSet, attrName ) {
                    let propertyTargetName;
                    if ( valueToSet === false ) {
                        // Remove the boolean attribute if its value is explicitly false.
                        compatibilityLib.removeAttr( currentElem, attrName );
                    } else {
                        // For true values, ensure the corresponding DOM property is set.
                        propertyTargetName = compatibilityLib.propFix[ attrName ] || attrName;
                        if ( propertyTargetName in currentElem ) {
                            // Set the IDL property only if it's already present on the element.
                            currentElem[ propertyTargetName ] = true;
                        }
                        currentElem.setAttribute( attrName, attrName.toLowerCase() ); // Set the attribute.
                    }
                    return attrName; // Return the attribute name, consistent with original behavior.
                }
            };

            // Warn specifically for attributes like 'checked' or 'selected' that might behave differently post-1.9.
            if ( defaultPropUsageAttributes.test( lowerCaseAttributeName ) ) {
                emitDeprecationNotification( `compatibilityLib.fn.attr('${lowerCaseAttributeName}') might now prioritize the property over the attribute value.` );
            }
        }

        // Call the original `attr` method with the processed arguments.
        return originalAttributeSupport.call( compatibilityLib, elementNode, attributeName, attributeValue );
    };

    // Override `compatibilityLib.attrHooks.value` to handle deprecation warnings related to property access.
    compatibilityLib.attrHooks.value = {
        get: function( targetElement, attributeName ) {
            const elementNodeName = ( targetElement.nodeName || "" ).toLowerCase();
            if ( elementNodeName === "button" ) {
                return originalValueAttrGetter.apply( this, arguments ); // Defer to original for buttons.
            }
            // Warn if 'value' is accessed on elements other than input or option.
            if ( elementNodeName !== "input" && elementNodeName !== "option" ) {
                emitDeprecationNotification( "compatibilityLib.fn.attr('value') no longer retrieves properties for this specific element type." );
            }
            // Return the element's `value` property if it exists, otherwise null.
            return attributeName in targetElement ? targetElement.value : null;
        },
        set: function( targetElement, newValue ) {
            const elementNodeName = ( targetElement.nodeName || "" ).toLowerCase();
            if ( elementNodeName === "button" ) {
                return originalValueAttrSetter.apply( this, arguments ); // Defer to original for buttons.
            }
            // Warn if 'value' is set on elements other than input or option.
            if ( elementNodeName !== "input" && elementNodeName !== "option" ) {
                emitDeprecationNotification( `compatibilityLib.fn.attr('value', '${newValue}') no longer sets properties for this specific element type.` );
            }
            // Directly set the element's `value` property.
            targetElement.value = newValue;
            // New fragment: Explicitly return the new value for consistency, though original might not have.
            return newValue;
        }
    };

    // --- HTML parsing and JSON handling adjustments ---

    let matchedAgentData, browserDetailsContainer;
    const baseInitializer = compatibilityLib.fn.init; // Store original `init` method.
    const baseParseJSON = compatibilityLib.parseJSON; // Store original `parseJSON` method.
    const htmlStringParsePattern = /^([^<]*)(<[\w\W]+>)([^>]*)$/; // Regex to identify HTML strings for parsing.

    // Override `compatibilityLib.fn.init` to implement HTML string parsing rule changes and warnings.
    compatibilityLib.fn.init = function( inputSelector, creationContext, rootLibObject ) {
        let regexMatchResult; // Variable to store the result of regex execution.

        // New fragment: Introduce an intermediate variable for the trimmed selector string.
        const trimmedInput = typeof inputSelector === "string" ? compatibilityLib.trim( inputSelector ) : null;

        // Check if the selector is a string that conforms to the "old" HTML string rules.
        if ( trimmedInput && typeof trimmedInput === "string" && !compatibilityLib.isPlainObject( creationContext ) &&
            ( regexMatchResult = htmlStringParsePattern.exec( trimmedInput ) ) && regexMatchResult[ 0 ] ) {

            // Issue deprecation warnings for specific HTML string patterns.
            if ( trimmedInput.charAt( 0 ) !== "<" ) {
                emitDeprecationNotification( "HTML string selectors must now explicitly begin with a '<' character." );
            }
            if ( regexMatchResult[ 3 ] ) {
                emitDeprecationNotification( "Any textual content found after the final HTML tag in a selector string will be ignored." );
            }
            // Consistently reject HTML-like strings starting with '#' to prevent potential XSS vulnerabilities.
            if ( regexMatchResult[ 0 ].charAt( 0 ) === "#" ) {
                emitDeprecationNotification( "HTML string selectors are not allowed to commence with a '#' character (potential XSS risk)." );
                compatibilityLib.error( "OLDJS_COMPAT: Invalid selector string (XSS protection triggered)." );
            }

            // If the context is a compatibilityLib object, extract the underlying DOM object.
            if ( creationContext && creationContext.context ) {
                creationContext = creationContext.context;
            }

            // Use `compatibilityLib.parseHTML` for safer parsing if available.
            if ( compatibilityLib.parseHTML ) {
                return baseInitializer.call( this, compatibilityLib.parseHTML( regexMatchResult[ 2 ], creationContext, true ),
                    creationContext, rootLibObject );
            }
        }
        // For all other cases, fall back to the original `init` method.
        return baseInitializer.apply( this, arguments );
    };
    compatibilityLib.fn.init.prototype = compatibilityLib.fn; // Ensure the prototype chain is maintained.

    // Override `compatibilityLib.parseJSON` to handle falsy inputs more explicitly.
    compatibilityLib.parseJSON = function( jsonString ) {
        // New fragment: Explicitly check for an empty string as well as null/undefined.
        if ( !jsonString && jsonString !== null && jsonString !== "" ) {
            emitDeprecationNotification( "compatibilityLib.parseJSON now mandates a valid JSON string; non-null falsy values (like empty string) are no longer processed." );
            return null; // Return null for invalid input.
        }
        return baseParseJSON.apply( this, arguments ); // Call the original `parseJSON` method.
    };

    // --- User Agent Matching ---

    compatibilityLib.userAgentMatcher = function( userAgentString ) {
        const lowerCaseAgent = userAgentString.toLowerCase();

        // Regular expression patterns to match various browsers and extract their versions.
        const chromePattern = /(chrome)[ \/]([\w.]+)/.exec( lowerCaseAgent );
        const webkitPattern = /(webkit)[ \/]([\w.]+)/.exec( lowerCaseAgent );
        const operaPattern = /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( lowerCaseAgent );
        const msiePattern = /(msie) ([\w.]+)/.exec( lowerCaseAgent );
        // Mozilla pattern, ensuring it's not compatible with older IE.
        const mozillaPattern = lowerCaseAgent.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( lowerCaseAgent );

        // Prioritize matches in a specific order.
        const activeMatch = chromePattern || webkitPattern || operaPattern || msiePattern || mozillaPattern || [];

        return {
            browserId: activeMatch[ 1 ] || "", // Renamed property for browser identifier.
            browserVer: activeMatch[ 2 ] || "0" // Renamed property for browser version.
        };
    };

    // Create `compatibilityLib.browser` object if it doesn't already exist.
    if ( !compatibilityLib.browser ) {
        // New fragment: Guard against `navigator.userAgent` being undefined or null.
        const agentInfo = globalObject.navigator?.userAgent;
        if (agentInfo) {
            matchedAgentData = compatibilityLib.userAgentMatcher( agentInfo );
            browserDetailsContainer = {}; // Initialize the container for browser details.

            if ( matchedAgentData.browserId ) {
                browserDetailsContainer[ matchedAgentData.browserId ] = true;
                browserDetailsContainer.version = matchedAgentData.browserVer;
            }

            // Apply specific browser relationship logic (e.g., Chrome is Webkit).
            if ( browserDetailsContainer.chrome ) {
                browserDetailsContainer.webkit = true;
            } else if ( browserDetailsContainer.webkit ) {
                browserDetailsContainer.safari = true;
            }

            compatibilityLib.browser = browserDetailsContainer;
        } else {
            // New fragment: If user agent information is unavailable, initialize `browser` as an empty object.
            compatibilityLib.browser = {};
            emitDeprecationNotification("Could not determine browser details: navigator.userAgent is unavailable in this environment.");
        }
    }

    // Deprecate `compatibilityLib.browser` as it's an outdated feature.
    establishDeprecatedPropertyNotifier( compatibilityLib, "browser", compatibilityLib.browser, "compatibilityLib.browser is deprecated; consider modern feature detection techniques." );

    // --- Sub-library creation ---

    compatibilityLib.createSubInstance = function() {
        // Define a new constructor function for the sub-library.
        function SubToolClass( currentSelector, currentContext ) {
            return new SubToolClass.prototype.init( currentSelector, currentContext );
        }
        compatibilityLib.extend( true, SubToolClass, this ); // Extend properties from the parent library.
        SubToolClass.superclass = this;
        SubToolClass.prototype = SubToolClass.fn = this(); // Set prototype and `fn` property.
        SubToolClass.prototype.constructor = SubToolClass;
        SubToolClass.sub = this.createSubInstance; // Reference the new sub method.

        // Override the `init` method specifically for the sub-library.
        SubToolClass.prototype.init = function subInit( currentSelector, currentContext ) {
            // If the context is a parent compatibilityLib object, wrap it within the sub-library.
            if ( currentContext && currentContext instanceof compatibilityLib && !(currentContext instanceof SubToolClass) ) {
                currentContext = SubToolClass( currentContext );
            }
            // Call the parent's `init` method with the adjusted context.
            return compatibilityLib.fn.init.call( this, currentSelector, currentContext, rootSubToolElement );
        };
        SubToolClass.prototype.init.prototype = SubToolClass.prototype; // Maintain the prototype chain for the sub-library's init.

        const rootSubToolElement = SubToolClass(globalObject.document); // Create a root element for the sub-library.
        emitDeprecationNotification( "compatibilityLib.sub() is deprecated; prefer modular design patterns over sub-libraries." );
        return SubToolClass;
    };

    // --- AJAX setup ---

    // Ensure `compatibilityLib.ajax` uses the new `parseJSON` definition.
    compatibilityLib.ajaxSetup({
        converters: {
            "text json": compatibilityLib.parseJSON // Use the overridden `parseJSON`.
        }
    });

    // --- Data method modifications ---

    const baseFnDataMethod = compatibilityLib.fn.data; // Store reference to the original `data` method.

    compatibilityLib.fn.data = function( dataKey ) {
        let retrievedData, eventSpecificData;
        const firstElementInSet = this[0]; // Get the first element from the current set.

        // Specific handling for the 'events' data key, which had behavior changes in older versions.
        if ( firstElementInSet && dataKey === "events" && arguments.length === 1 ) {
            retrievedData = compatibilityLib.data( firstElementInSet, dataKey );
            eventSpecificData = compatibilityLib._data( firstElementInSet, dataKey );

            // If the retrieved data is undefined or matches the internal `_data`, and internal `_data` is defined.
            if ( ( retrievedData === missingType || retrievedData === eventSpecificData ) && eventSpecificData !== missingType ) {
                emitDeprecationNotification( "Direct retrieval of 'events' using compatibilityLib.fn.data() is deprecated." );
                return eventSpecificData;
            }
        }
        return baseFnDataMethod.apply( this, arguments ); // Call the original `data` method for all other cases.
    };

    // --- Element manipulation and event handling ---

    const scriptTypePattern = /\/(java|ecma)script/i; // Regex to identify script types.
    // Store original `andSelf` or fallback to `addBack` (newer equivalent).
    const originalAndSelfMethod = compatibilityLib.fn.andSelf || compatibilityLib.fn.addBack;

    compatibilityLib.fn.andSelf = function() {
        emitDeprecationNotification( "compatibilityLib.fn.andSelf() is deprecated; use compatibilityLib.fn.addBack() instead for better compatibility." );
        return originalAndSelfMethod.apply( this, arguments );
    };

    // Shim `compatibilityLib.clean` if it's missing (used internally in older versions).
    if ( !compatibilityLib.clean ) {
        compatibilityLib.htmlFragmentCleaner = function( inputElements, processingContext, outputFragment, scriptCollection ) {
            // Normalize the context for fragment creation.
            let effectiveContext = processingContext || globalObject.document;
            effectiveContext = effectiveContext.nodeType ? effectiveContext : (effectiveContext[0] || effectiveContext);
            effectiveContext = effectiveContext.ownerDocument || effectiveContext;

            emitDeprecationNotification( "compatibilityLib.clean() is an internal and deprecated function; avoid direct usage." );

            let elementIndex, currentElement, scriptProcessor, discoveredScripts;
            const processedElements = [];

            // New fragment: Early exit if no elements are provided for processing.
            if (!inputElements || inputElements.length === 0) {
                return processedElements;
            }

            compatibilityLib.merge( processedElements, compatibilityLib.buildFragment( inputElements, effectiveContext ).childNodes );

            if ( outputFragment ) {
                // Define the script handling logic as an arrow function for clarity.
                scriptProcessor = ( elementNode ) => {
                    // Check if the element is a script and considered executable.
                    if ( !elementNode.type || scriptTypePattern.test( elementNode.type ) ) {
                        // If a script collection is provided, move the script there; otherwise, append to the fragment.
                        return scriptCollection ?
                            scriptCollection.push( elementNode.parentNode ? elementNode.parentNode.removeChild( elementNode ) : elementNode ) :
                            outputFragment.appendChild( elementNode );
                    }
                    return false; // Indicate that the script was not handled by this processor.
                };

                for ( elementIndex = 0; (currentElement = processedElements[elementIndex]) != null; elementIndex++ ) {
                    // If the current element is a script and successfully handled by the processor, skip to next.
                    if ( compatibilityLib.nodeName( currentElement, "script" ) && scriptProcessor( currentElement ) ) {
                        continue;
                    }

                    outputFragment.appendChild( currentElement ); // Append the current element to the output fragment.
                    if ( typeof currentElement.getElementsByTagName !== missingType ) {
                        // Find and process any embedded scripts within the current element.
                        const embeddedScripts = compatibilityLib.grep(
                            compatibilityLib.merge( [], currentElement.getElementsByTagName("script") ),
                            scriptProcessor
                        );

                        // Insert the processed embedded scripts back into the `processedElements` array after their parent.
                        // New fragment: Using spread operator for concise splice.
                        processedElements.splice( elementIndex + 1, 0, ...embeddedScripts );
                        elementIndex += embeddedScripts.length; // Adjust the loop index to account for newly added scripts.
                    }
                }
            }
            return processedElements;
        };
        compatibilityLib.clean = compatibilityLib.htmlFragmentCleaner; // Alias the old name to the new function.
    }

    // --- Event system overrides ---

    const baseEventAdder = compatibilityLib.event.add; // Original `event.add` method.
    const baseEventRemover = compatibilityLib.event.remove; // Original `event.remove` method.
    const baseEventTrigger = compatibilityLib.event.trigger; // Original `event.trigger` method.
    const originalToggleMethod = compatibilityLib.fn.toggle; // Original `fn.toggle` method.
    const baseLiveMethod = compatibilityLib.fn.live; // Original `fn.live` method.
    const baseDieMethod = compatibilityLib.fn.die; // Original `fn.die` method.

    const ajaxEventNamesString = "ajaxStart|ajaxStop|ajaxSend|ajaxComplete|ajaxError|ajaxSuccess";
    // New fragment: Using template literal for regex pattern construction.
    const ajaxEventNamePattern = new RegExp( `\\b(?:${ajaxEventNamesString})\\b` );
    const hoverEventPattern = /(?:^|\s)hover(\.\S+|)\b/; // Regex to match 'hover' pseudo-event.

    /**
     * Processes event type strings, specifically converting 'hover' to 'mouseenter mouseleave' and issuing a warning.
     * @param {string} eventTypes - The raw event type string.
     * @returns {string} The processed event type string.
     */
    const processHoverEventNames = ( eventTypes ) => {
        // If not a string or if a special 'hover' event handler is already defined, return as is.
        if ( typeof eventTypes !== "string" || compatibilityLib.event.special.hover ) {
            return eventTypes;
        }
        if ( hoverEventPattern.test( eventTypes ) ) {
            emitDeprecationNotification( "The 'hover' pseudo-event is deprecated; please use 'mouseenter mouseleave' for equivalent functionality." );
        }
        // Replace 'hover' with 'mouseenter mouseleave', preserving any namespace.
        return eventTypes ? eventTypes.replace( hoverEventPattern, "mouseenter$1 mouseleave$1" ) : eventTypes;
    };

    // Restore event properties that were removed in 1.9 for compatibility. No practical way to warn about these.
    if ( compatibilityLib.event.props && compatibilityLib.event.props[ 0 ] !== "attrChange" ) {
        // New fragment: Use `concat` to create a new array instead of `unshift` for potentially better immutability.
        compatibilityLib.event.props = ["attrChange", "attrName", "relatedNode", "srcElement"].concat(compatibilityLib.event.props);
    }

    // Deprecate `compatibilityLib.event.dispatch` (an undocumented and removed internal property).
    if ( compatibilityLib.event.dispatch ) {
        establishDeprecatedPropertyNotifier( compatibilityLib.event, "handle", compatibilityLib.event.dispatch, "compatibilityLib.event.handle is an undocumented and deprecated internal property." );
    }

    // Override `compatibilityLib.event.add` for AJAX event warnings and 'hover' conversion.
    compatibilityLib.event.add = function( targetElem, eventTypes, eventHandler, handlerData, eventSelector ){
        // Warn if AJAX events are attached to elements other than the `document`.
        if ( targetElem !== globalObject.document && ajaxEventNamePattern.test( eventTypes ) ) {
            emitDeprecationNotification( `AJAX events (${eventTypes}) should ideally be attached exclusively to the document object.` );
        }
        // New fragment: Add a guard clause to warn if the event handler is not a function.
        if (typeof eventHandler !== 'function') {
            emitDeprecationNotification(`Attempted to register a non-function as an event handler for '${eventTypes}'.`);
        }
        baseEventAdder.call( this, targetElem, processHoverEventNames( eventTypes || "" ), eventHandler, handlerData, eventSelector );
    };

    // Override `compatibilityLib.event.remove` for 'hover' conversion.
    compatibilityLib.event.remove = function( targetElem, eventTypes, eventHandler, eventSelector, mappedTypes ){
        baseEventRemover.call( this, targetElem, processHoverEventNames( eventTypes ) || "", eventHandler, eventSelector, mappedTypes );
    };

    // Override `compatibilityLib.fn.error` for deprecation.
    compatibilityLib.fn.errorHandler = function() {
        // Convert `arguments` object to a real array.
        const invocationArgs = Array.prototype.slice.call( arguments, 0);
        emitDeprecationNotification( "compatibilityLib.fn.error() method is deprecated; consider using .on('error', handler) for better event management." );
        invocationArgs.unshift( "error" ); // Prepend 'error' event type to the arguments.

        // If additional arguments (handlers) are provided, bind the event; otherwise, trigger it.
        return invocationArgs.length > 1 ?
            this.bind.apply( this, invocationArgs ) :
            this.triggerHandler.apply( this, invocationArgs );
    };
    // New fragment: Create an alias so the old name still points to the new function.
    compatibilityLib.fn.error = compatibilityLib.fn.errorHandler;


    // Override `compatibilityLib.fn.toggle` for deprecation (specifically the function overload version).
    compatibilityLib.fn.toggle = function( handlerOne, handlerTwo ) {
        // If not two function arguments, defer to the original `toggle` method (e.g., for animation or CSS toggles).
        if ( !(compatibilityLib.isFunction( handlerOne ) && compatibilityLib.isFunction( handlerTwo )) ) {
            return originalToggleMethod.apply( this, arguments );
        }
        emitDeprecationNotification( "compatibilityLib.fn.toggle(handler1, handler2, ...) for click sequencing is deprecated and should be refactored." );

        const allHandlers = arguments; // Capture all provided handler functions.
        const uniqueId = handlerOne.guid || compatibilityLib.guid++; // Generate a unique ID for this toggle instance.
        let handlerIndex = 0;

        // Define the toggler function that will be executed on click.
        const toggleExecutor = function( eventObject ) {
            // Determine which function to execute based on the last executed handler.
            // New fragment: Use a template literal for the data key for consistency.
            const lastToggleIndex = ( compatibilityLib._data( this, `lastToggle:${uniqueId}` ) || 0 ) % allHandlers.length;
            compatibilityLib._data( this, `lastToggle:${uniqueId}`, lastToggleIndex + 1 );

            eventObject.preventDefault(); // Prevent the default action of the event (e.g., link navigation).

            // Execute the appropriate handler function.
            return allHandlers[ lastToggleIndex ].apply( this, arguments ) || false;
        };

        // Link all handler functions to the same unique ID, allowing them to be unbound together.
        while ( handlerIndex < allHandlers.length ) {
            allHandlers[ handlerIndex++ ].guid = uniqueId;
        }

        return this.click( toggleExecutor ); // Attach the custom toggler to the click event.
    };

    // Override `compatibilityLib.fn.live` for deprecation.
    compatibilityLib.fn.attachLiveHandler = function( eventTypes, eventData, eventHandler ) {
        emitDeprecationNotification( "compatibilityLib.fn.live() is deprecated; use compatibilityLib.on() with event delegation for better performance and maintainability." );
        // If the original `live` method exists, use it as a fallback.
        if ( baseLiveMethod ) {
            return baseLiveMethod.apply( this, arguments );
        }
        // Emulate `live` behavior using `compatibilityLib.on` with event delegation.
        compatibilityLib( this.context ).on( eventTypes, this.selector, eventData, eventHandler );
        return this;
    };
    compatibilityLib.fn.live = compatibilityLib.fn.attachLiveHandler; // Alias the old name to the new function.


    // Override `compatibilityLib.fn.die` for deprecation.
    compatibilityLib.fn.detachLiveHandler = function( eventTypes, eventHandler ) {
        emitDeprecationNotification( "compatibilityLib.fn.die() is deprecated; use compatibilityLib.off() with event delegation for explicit event removal." );
        // If the original `die` method exists, use it as a fallback.
        if ( baseDieMethod ) {
            return baseDieMethod.apply( this, arguments );
        }
        // Emulate `die` behavior using `compatibilityLib.off` with event delegation.
        compatibilityLib( this.context ).off( eventTypes, this.selector || "**", eventHandler ); // Use "**" to target all descendants.
        return this;
    };
    compatibilityLib.fn.die = compatibilityLib.fn.detachLiveHandler; // Alias the old name to the new function.


    // Override `compatibilityLib.event.trigger` for global event warnings.
    compatibilityLib.event.initiateTrigger = function( eventObject, eventData, targetElement, onlyHandlersFlag  ){
        // If no specific element is targeted and the event is not an AJAX event, warn about global events.
        if ( !targetElement && !ajaxEventNamePattern.test( eventObject ) ) {
            emitDeprecationNotification( "Global events are undocumented, deprecated, and should be avoided in favor of targeted event triggers." );
        }
        // Call the base trigger method, defaulting the target element to `document` if none is provided.
        return baseEventTrigger.call( this,  eventObject, eventData, targetElement || globalObject.document, onlyHandlersFlag  );
    };
    compatibilityLib.event.trigger = compatibilityLib.event.initiateTrigger; // Alias the old name to the new function.


    // Set up special event handlers for AJAX events by iterating through the names.
    ajaxEventNamesString.split("|").forEach(
        (eventName) => {
            compatibilityLib.event.special[ eventName ] = {
                setup: function() {
                    // The 'this' context here refers to the element the event is being bound to.
                    // No further changes needed for this specific setup function in terms of functionality.
                    const boundElement = this; // Retain reference to the bound element.
                    // Additional custom setup logic for each AJAX event could be inserted here if required.
                }
            };
        }
    );

})( jQuery, window, undefined );