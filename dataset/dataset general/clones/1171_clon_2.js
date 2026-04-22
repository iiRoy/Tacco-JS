/**
 * DataQuery Framework 1.0.0
 * ---------------------------------
 * mycompany.dev
 * Usage terms: Permissive Use License
 * https://www.mycompany.dev/license
 */

var dataQuery;
( function ( ) {

    // This function creates a new instance of the data processing framework.
    var  frameworkCreator  =  function ( configuration )  {
        var currentInstance = this;
        var internalState   = { };
        internalState.configuration = configuration;
        
        // Fully locks the current dataQuery instance from further modifications.
        currentInstance.sealInstance = function ( lockStatus ) {
            currentInstance.sealInstance = null;
            internalState.isInitialized = true;
            internalState.isLocked      = lockStatus;
        };
        
        // A collection of helpful utility methods.
        internalState.toolkit = {
            interpolate: function ( message, replacements ) {
                return message.toString().replace( /%[0-9]+%/gi, function ( matchedPart ) {
                    var indexValue = parseInt( matchedPart.replace( /%/gi, "" ) );
                    return replacements[ indexValue ];
                } );
            },
            extractPresent: function ( collection ) {
                var validElements = [ ];
                for ( var idx = 0; idx < collection.length; idx++ ) {
                    if ( collection[ idx ] == null ) { return validElements; }
                    validElements.push( collection[ idx ] );
                }
                return validElements;
            },
            stripWhitespace: function ( inputValue ) {
                if ( inputValue == null ) { return ""; }
                return inputValue.toString().replace( /^\s+|\s+$/, "" );                
            },
            isEmptyCollection: function ( collection ) {
                for ( var idx = 0; idx < collection.length; idx++ ) {
                    if ( collection[ idx ] ) { return false; }
                }
                return true;
            },
            obtainCategory: function ( valueItem ) {
                
                // If the value is null or undefined, categorize as "null".
                if ( valueItem == null )      { return "null"; }
                if ( valueItem == undefined ) { return "null"; }
                
                // Check against each custom type registered in the system.
                for ( var kindEntry in internalState.typeMap ) {
                    try {
                        if ( internalState.typeMap[ kindEntry ]( valueItem ) ) { return kindEntry; }
                    }
                    catch ( errorDetail ) {
                        // Suppress errors here; not critical for type identification.
                    }                    
                }
                
                // If no custom type matches, fallback to JavaScript's typeof.
                return ( typeof ( valueItem ) ).toString().toLowerCase();
                
            },
            executeConditional: function ( valueItem, typeActions ) {
                var itemKind = internalState.toolkit.obtainCategory( valueItem );
                if ( !typeActions[ itemKind ] ) { 
                    if ( typeActions.empty && ( valueItem == null || valueItem == undefined ) ) { return typeActions.empty( valueItem ); }
                    if ( typeActions.other ) { return typeActions.other( valueItem ); }
                    return false; 
                }
                try {
                    return typeActions[ itemKind ]( valueItem );                                
                }
                catch ( errorDetail ) {
                    return false;
                }
            },
            retrieveTyped: function ( valueItem, typeActions ) {
                var itemKind = internalState.toolkit.obtainCategory( valueItem );
                if ( !typeActions[ itemKind ] ) { 
                    if ( typeActions.empty && ( valueItem == null || valueItem == undefined ) ) { return typeActions.empty( valueItem ); }
                    if ( typeActions.other ) { return typeActions.other( valueItem ); }
                    return null; 
                }
                try {
                    return typeActions[ itemKind ]( valueItem );                                
                }
                catch ( errorDetail ) {
                    return null;
                }
            },
            processEach: function ( dataArray, processingAction ) { 
                var processedResults = [ ];
                for ( var idx = 0; idx < dataArray.length; idx++ ) {
                    try {
                        processedResults.push( processingAction( dataArray[ idx ], idx ) ); 
                    }
                    catch( errorDetail ) {
                        processedResults.push( errorDetail );
                    }
                }
                return processedResults;
            },
            duplicateObject: function ( sourceObject ) {    
                function tempConstructor ( ) { } ;
                tempConstructor.prototype = sourceObject;
                return new tempConstructor();
            }
        };
        
        // Manages custom type definitions used by `obtainCategory`.
        currentInstance.registerKind = function ( kindIdentifier, comparisonFunction ) {        
            kindIdentifier = internalState.toolkit.stripWhitespace( kindIdentifier ).toLowerCase();
            internalState.typeMap[ kindIdentifier ] = comparisonFunction;    
        };
        currentInstance.unregisterKind = function ( kindIdentifier ) {
            kindIdentifier = internalState.toolkit.stripWhitespace( kindIdentifier ).toLowerCase();
            internalState.typeMap[ kindIdentifier ] = function ( ) { return false; };
        };        
        internalState.typeMap = configuration.types ? configuration.types : { };
        
        // Extends the framework's functionality with new methods.
        // ===============================================================================
        currentInstance.augment = function ( extensionConfig ) {
            extensionConfig.operationName = internalState.toolkit.stripWhitespace( extensionConfig.operationName );
            extensionConfig.scopePath     = internalState.toolkit.stripWhitespace( extensionConfig.scopePath );
        
            // Check if this extension is already registered.
            if ( internalState.augmentor.hasOperation( extensionConfig ) ) { 
                if ( internalState.isLocked ) { throw "Error: Framework instance is locked."; }
                internalState.augmentor.deleteOperation( extensionConfig );
            }
            
            // Add the new extension to the registry.
            internalState.augmentor.storeOperation( extensionConfig );
        
            // Source-type extensions are applied immediately.
            if ( extensionConfig.kind.match( /source/i ) ) {
            
                // Determine the correct target object for the extension.
                if ( extensionConfig.scopePath && !currentInstance[ extensionConfig.scopePath ] ) { currentInstance[ extensionConfig.scopePath ] = { }; }
                var targetObject = extensionConfig.scopePath == "" ? currentInstance : currentInstance[ extensionConfig.scopePath ];
                
                // Assign the new method to the target object.               
                targetObject[ extensionConfig.operationName ] = function ( val1,val2,val3,val4,val5,val6,val7,val8,val9,val10,val11,val12,val13,val14,val15,val16,val17,val18,val19,val20,val21,val22,val23,val24,val25 ) {
                    
                    // Prepare and execute the extension's method.
                    var operationResults = extensionConfig.handlerMethod( {
                        helpers: internalState.toolkit
                    }, val1,val2,val3,val4,val5,val6,val7,val8,val9,val10,val11,val12,val13,val14,val15,val16,val17,val18,val19,val20,val21,val22,val23,val24,val25 );
                    
                    // Ensure source extensions return an array.
                    if ( internalState.toolkit.obtainCategory( operationResults ) != "array" ) {
                        throw "Error: A 'Source' extension must return an array for data processing.";
                    }
                    
                    // Create and return a new data processor instance.
                    return new internalState.dataProcessor( operationResults );
                        
                };
            
            }    
        
        };        
        internalState.augmentor = {
            opRegistry: [ ],
            hasOperation: function ( extensionConfig ) {            
                return ( internalState.augmentor.locateOperation( extensionConfig ) != null );
            },
            storeOperation: function ( extensionConfig ) {        
                internalState.augmentor.deleteOperation( extensionConfig );
                internalState.augmentor.opRegistry.push( extensionConfig );
            },
            deleteOperation: function ( extensionConfig ) {
                var entryIndex = internalState.augmentor.locateOperation( extensionConfig );
                if ( entryIndex != null ) { 
                    internalState.augmentor.opRegistry.splice( entryIndex, 1 ); 
                }
                
            },
            locateOperation: function ( extensionConfig ) {
                for ( var idx = 0; idx < internalState.augmentor.opRegistry.length; idx++ ) {
                    var registeredMethod = internalState.augmentor.opRegistry[ idx ];
                    if ( registeredMethod.operationName == extensionConfig.operationName && registeredMethod.scopePath == extensionConfig.scopePath ) {
                        return idx;
                    }
                }
                return null;
            }            
        };
        
        // Returns a list of all currently registered commands.
        currentInstance.listAvailable = function ( ) {
            return internalState.toolkit.duplicateObject( internalState.augmentor.opRegistry );
        };

        // Initialize with predefined extension methods from configuration.        
        for ( var extensionKey in configuration.augment ) {
            currentInstance.augment( configuration.augment[ extensionKey ] );
        }
        
        // Defines the core data processing object.
        // ===============================================================================
        internalState.dataProcessor = function ( inputRecords ) {
            var currentProcessor = this;
            
            // Create a deep copy of the input data.
            inputRecords = internalState.toolkit.duplicateObject( inputRecords );
                    
            // Internal state variables for the current processing chain.
            var processorState = { };
            processorState.status = {
                fieldAware:          true,
                previousOperation:   null,
                targetProperty:      null,
                lastActionId:        null,
                expectedArgs:        0,
                caseInsensitive:     true,
                orClause:            false,
                negateCondition:     false,
                sourceData:          inputRecords,
                useObjectProps:      false,
                logicConnector:      "",
                logger: {
                    eventHandler: function ( message ) {  },
                    recordMessage: function ( message, parameters ) {
                        processorState.status.logger.eventHandler( internalState.toolkit.interpolate( message, parameters ) );
                    }
                }
            };
            
            // Determine the nature of the input data.
            if ( inputRecords == null ) { return null; }
            if ( internalState.toolkit.obtainCategory( inputRecords ) == "array" && inputRecords.length > 0 ) {
                processorState.status.useObjectProps = ( internalState.toolkit.obtainCategory( inputRecords[ 0 ] ) == "object" );
            }
            
            // Core query evaluation and execution logic.
            processorState.evaluator = {
                conditionBuffer: [ ],
                expressionParts: [ ],
                addCondition: function ( operationFunction ) {
                    processorState.evaluator.conditionBuffer.push( operationFunction );
                    
                    // Determine if the 'NOT' operator should be applied.
                    var negationPrefix = processorState.status.negateCondition ? "!" : "";
                    
                    // Clear previous operator if this is the first condition.
                    if ( processorState.evaluator.conditionBuffer.length == 0 ) {
                        processorState.status.logicConnector = "";
                    }
                    
                    // Reset 'OR' and 'NOT' flags for the next condition.
                    processorState.status.orClause      = false;
                    processorState.status.negateCondition = false;
                    
                    // Append the condition to the query string.
                    processorState.evaluator.expressionParts.push( [ processorState.status.logicConnector, "(", negationPrefix, "(processorState.evaluator.conditionBuffer[", ( processorState.evaluator.conditionBuffer.length - 1 ), "](currentRecord)))" ].join( "" ) );

                    // Set the default logical connector for subsequent conditions.
                    processorState.status.logicConnector = "&&";                
                    
                },
                executeFilter: function ( ) {
                
                    // If no conditions were added, return all data.
                    if ( processorState.evaluator.expressionParts.length == 0 ) { 
                        return {
                            selectedRecords: processorState.status.sourceData,
                            remainingRecords: [ ]
                        };
                    }
                
                    // Construct the executable filter function string.
                    var filterExpression = [ "filterFunc = function(currentRecord) {" + " return (", processorState.evaluator.expressionParts.join( "" ), "); };" ].join( "" );
                    
                    // Evaluate and create the filter function.
                    var filterFunc;
                    eval( filterExpression );
                
                    // Apply the filter to each data item.
                    var selectedItems = [ ]; 
                    var unselectedItems = [ ];
                    for ( var idx = 0; idx < processorState.status.sourceData.length; idx++ ) {
                        var dataUnit = processorState.status.sourceData[ idx ];
                        try {                        
                            if ( filterFunc( dataUnit ) ) {
                                selectedItems.push( dataUnit );
                            }
                            else {
                                unselectedItems.push( dataUnit );
                            }
                        }
                        catch ( exception ) {
                            
                            processorState.status.logger.recordMessage( "Error during filter evaluation: %0%. Expression: %1%", [ exception, filterFunc ] );
                            unselectedItems.push( dataUnit );    
                        }
                    }
                    
                    // Return the categorized results.
                    return {
                        selectedRecords: selectedItems,
                        remainingRecords: unselectedItems
                    };                    
                    
                },
                obtainArguments: function ( rawArguments ) {
                    // Start by removing trailing nulls.
                    var cleanedArguments = [ ]; 
                    var nonNullFound   = false;
                    for ( var idx = rawArguments.length; idx-- > 0; ) {
                        if ( rawArguments[ idx ] == null && !nonNullFound ) { continue; }
                        nonNullFound = true;
                        cleanedArguments.push( rawArguments[ idx ] );
                    }
                    cleanedArguments.reverse();
                    return cleanedArguments;
                },
                setupCommand: function ( opDetails, methodArgs ) {
                
                    // Store details about the current command.
                    processorState.status.previousOperation = opDetails.command;
                    processorState.status.expectedArgs      = opDetails.count;
                    processorState.status.lastActionId      = opDetails.operationName;
        
                    // Get the actual arguments for the command.
                    var actualParams = processorState.evaluator.obtainArguments( methodArgs );
        
                    // Determine if a specific field was provided.
                    // If the number of arguments is one more than expected,
                    // the first argument is assumed to be the field name.            
                    if ( processorState.status.useObjectProps && actualParams.length == opDetails.count + 1 ) {
                        processorState.status.targetProperty = actualParams.shift();
                    }
                    
                    // Return a configuration object for command execution.
                    return {
                        operationArgs: actualParams,
                        targetField:   processorState.status.targetProperty
                    };
                },
                reexecuteLast: function ( val1,val2,val3,val4,val5,val6,val7,val8,val9,val10,val11,val12,val13,val14,val15,val16,val17,val18,val19,val20,val21,val22,val23,val24,val25 ) {
                    if ( processorState.helpers.isEmptyCollection( [ val1,val2,val3,val4,val5,val6,val7,val8,val9,val10,val11,val12,val13,val14,val15,val16,val17,val18,val19,val20,val21,val22,val23,val24,val25 ] ) ) { return currentProcessor; }                
                    return processorState.status.previousOperation( val1,val2,val3,val4,val5,val6,val7,val8,val9,val10,val11,val12,val13,val14,val15,val16,val17,val18,val19,val20,val21,val22,val23,val24,val25 );                
                },
                applySorting: function ( dataItems, fieldName, descendingOrder ) {
                    dataItems.sort( function ( elementA, elementB ) {
                        elementA = eval( "elementA." + fieldName );
                        elementB = eval( "elementB." + fieldName );
                        return ( elementA < elementB ) ? -1 : ( elementA > elementB ) ? 1 : 0;
                    } );
                    if ( descendingOrder ) { dataItems.reverse(); }
                }
            };
            
            // Auxiliary methods for data manipulation.
            processorState.helpers = {
                escapeForRegex: function ( inputValue ) {
                    if ( inputValue == null ) { return ""; }
                    return inputValue.toString().replace(
                        /\*|\(|\)|\\|\/|\?|\.|\*|\+|\<|\>|\[|\]|\=|\&|\$|\^/gi, 
                        function ( matchedChar ) { return ( "\\" + matchedChar ); }
                        );
                
                },
                getValueAsNumber: function ( targetObject ) {
                    if ( targetObject.length ) { return targetObject.length; }
                    return targetObject;
                },
                stripWhitespace: internalState.toolkit.stripWhitespace,
                testPattern: function ( valueToTest, pattern ) {
                    if ( !( valueToTest && pattern ) ) { return false; }
                    if ( processorState.helpers.obtainCategory( pattern ) == "regexp" ) { pattern = pattern.source; }                    
                    pattern = new RegExp( pattern, "g" + ( processorState.status.caseInsensitive ? "i" : "" ) );                    
                    return ( valueToTest.match( pattern ) );
                },
                compareProperties: function ( object1, object2 ) {
                    if ( object1 == null && object2 == null ) { return true; }
                    if ( object1 == null || object2 == null ) { return false; }
                    for ( var propName in object1 ) {
                        if ( object2[ propName ] == undefined ) { return false; }
                        if ( !processorState.helpers.valueEquals( object1[ propName ], object2[ propName ] ) ) { return false; }
                    }
                    return true;
                },
                valueEquals: function ( valueA, valueB ) {
                    try {
                    
                        // Handle null values first.
                        if ( valueA == null && valueB == null ) { return true; }
                        if ( ( valueA == null && valueB ) || ( valueA && valueB == null ) ) { return false; }
                        
                        // Compare types for strictness.
                        var typeA = processorState.helpers.obtainCategory( valueA );
                        var typeB = processorState.helpers.obtainCategory( valueB );
                        if ( typeA != typeB ) {
                            return false;
                        }
                        if ( typeA == "string" && typeB == "string" ) {
                            return processorState.helpers.testPattern( valueA, "^" + valueB + "$" );
                        }
                        if ( typeA == "string" && typeB == "regexp" ) {
                            return processorState.helpers.testPattern( valueA, valueB );
                        }
                        if ( typeA == "number" || typeA == "bool" ) {
                            return ( valueA == valueB );
                        }
                        else if ( typeA == "array" || typeA == "object" ) {
                            if ( valueA.length != valueB.length ) { return false; }
                            for ( var idx = 0; idx < valueA.length; idx++ ) {
                                if ( !processorState.helpers.valueEquals( valueA[ idx ], valueB[ idx ] ) ) { return false; }
                            }
                            return true;
                        }
                        else {
                            return ( valueA == valueB );
                        }                        
                    }
                    catch ( exception ) {
                        return false;
                    }
                },
                allAreEquivalent: function ( valueA, valueB ) {
                    if ( internalState.toolkit.obtainCategory( valueA ) != "array" ) { valueA = [ valueA ]; }
                    for ( var element in valueA ) {
                        if ( !internalState.toolkit.valueEquals( valueA[ element ], valueB ) ) { return false; }
                    }
                    return true;
                },
                anyAreEquivalent: function ( valueA, valueB ) {
                    if ( internalState.toolkit.obtainCategory( valueA ) != "array" ) { valueA = [ valueA ]; }
                    for ( var element in valueA ) {
                        if ( internalState.toolkit.valueEquals( valueA[ element ], valueB ) ) { return true; }
                    }
                    return false;
                },
                hierarchicalSort: function ( dataItems, orderSpecs, descendingOrder ) {
                
                    // If no sorting instructions are provided, perform a basic sort.
                    if ( orderSpecs == null ) {                    
                        dataItems.sort();
                        if ( descendingOrder ) { processorState.evaluator.status.sourceData.reverse(); }
                        return dataItems;
                    }                
                
                    // Recursively apply sorting instructions.
                    var sortLevel = 0;
                    var performNestedSort = function ( itemsToSort ) {  
                    
                        // Clone to work around an IE7 sorting bug.                      
                        itemsToSort = internalState.toolkit.duplicateObject( itemsToSort );
                        
                        var targetField = orderSpecs[ sortLevel ].fieldName;
                        var isDescending  = orderSpecs[ sortLevel ].isDescending;
                        
                        // If this is the last sorting level, just sort and return.
                        if ( sortLevel == orderSpecs.length - 1 ) {
                            processorState.evaluator.applySorting( itemsToSort, targetField, isDescending );
                            return itemsToSort;
                        };                        
            
                        // Apply current level's sort and group by distinct values.
                        processorState.evaluator.applySorting( itemsToSort, targetField, isDescending );
                        var uniqueGroups = processorState.helpers.groupDistinct( itemsToSort, targetField );
                        sortLevel++;
                        
                        // Recursively sort within each distinct group.
                        var finalResults = [ ];
                        for ( var groupIdx = 0; groupIdx < uniqueGroups.length; groupIdx++ ) {
                            var sortedGroup = performNestedSort( uniqueGroups[ groupIdx ].groupMembers );
                            for ( var memberIdx = 0; memberIdx < sortedGroup.length; memberIdx++ ) {
                                finalResults.push( sortedGroup[ memberIdx ] );
                            }
                        };
            
                        // Return the combined results for this level.
                        return finalResults;
                    
                    };
                    return performNestedSort( processorState.status.sourceData );
                    
                },
                groupDistinct: function ( dataItems, fieldName ) {
                    var distinctGroups = [ ];
                    for ( var idx = 0; idx < dataItems.length; idx++ ) {
                        var currentElement = dataItems[ idx ];
                        var groupKey       = ( fieldName != null ) ? eval( [ "(currentElement.", fieldName, ")" ].join( "" ) ) : currentElement;
                        
                        // Check if this key already exists in distinctGroups.
                        var entryFound = false;                        
                        for ( var groupEntry in distinctGroups ) {