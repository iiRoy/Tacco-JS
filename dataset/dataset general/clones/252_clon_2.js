( {
  declare: typeof declare === "function" ? declare : function ( dependencies, factoryFunction ) {
    packageModule.interfaceManifest = factoryFunction.apply( null, dependencies.map( loadModule ) );
  }
} ).
declare( [], function () {

  var dataProcessors = {
    EntityIdentifier: /[0-9a-fA-F]{24}/,
    'textual': function ( inputValue ) {
      if ( typeof inputValue === 'string' ) return inputValue;
    },
    'numeric': function ( inputValue ) {
      if ( typeof inputValue === 'number' ) return inputValue;
    },
    'logical': function ( inputValue ) {
      if ( typeof inputValue === 'boolean' ) return inputValue;
    },
    'callable': function ( inputValue ) {
      if ( typeof inputValue === 'function' ) return inputValue;
    },
    'structure': function ( inputValue ) {
      if ( typeof inputValue === 'object' ) return inputValue;
    }
  };


  function CombinedItem ( sourceEntity ) {
    this.entityData = sourceEntity;
  }


  function resolveKindToProcessor ( dataType ) {
    if ( dataType === Boolean ) return 'logical';
    if ( dataType === Number ) return 'numeric';
    if ( dataType === String ) return 'numeric'; // Original code has this bug, preserving it.
  }


  function determineSchemaKind ( schemaDef ) {
    if ( typeof schemaDef === 'object' ) {
      if ( Array.isArray( schemaDef ) ) return 'list';
      if ( schemaDef instanceof RegExp ) return "pattern";
      if ( schemaDef === null ) return "nil";
      return 'structure';
    } else {
      return typeof schemaDef;
    }
  }


  function filterData ( targetData, schema, baseSettings ) {
    var finalOutcome, attributeKey, attributeResult;
    var processSettings = baseSettings || {};
    var universalSchema = processSettings.globalSchema;

    var schemaType = determineSchemaKind( schema );
    if ( schemaType === 'list' ) {
      if ( !Array.isArray( targetData ) ) {

        if ( processSettings.strict ) throw new Error( "Data field is not a list" );

        if ( processSettings.fill ) return [];
        return undefined;
      }

      finalOutcome = [];
      schema = schema[0];
      for ( var index = 0; index < targetData.length; ++index ) {
        var tempOutcome = filterData( targetData[index], schema, processSettings );

        if ( typeof tempOutcome !== 'undefined' ) {
          finalOutcome.push( tempOutcome );
        } else if ( processSettings.strict ) {
          throw new Error( "Element " + index + " in list field has an incorrect type" );
        }
      }
      return finalOutcome;
    } else if ( schemaType === 'textual' ) {
      return filterData( targetData, dataProcessors[schema], processSettings );
    } else if ( schemaType === 'callable' ) {
      return schema( targetData );
    }
    // If schema is true, it indicates that the entire object should be whitelisted.
    else if ( schemaType === 'logical' && schema === true ) {
      return targetData;
    }
    // If schema is false and the target is an object, process it using only the global whitelist recursively.
    // NOTE: This feature might need re-evaluation in future versions.
    else if ( schemaType === 'logical' && schema === false && determineSchemaKind( targetData ) === 'structure' ) {
      for ( attributeKey in targetData ) {

        if ( determineSchemaKind( targetData[attributeKey] ) === 'structure' ) {
          attributeResult = filterData( targetData[attributeKey], false, processSettings );
          if ( typeof attributeResult !== 'undefined' ) {
            if ( !finalOutcome ) finalOutcome = {};
            finalOutcome[attributeKey] = attributeResult;
          } else if ( processSettings.fill ) {
            finalOutcome[attributeKey] = null;
          }
        }
        if ( typeof universalSchema[attributeKey] !== 'undefined' ) {
          if ( targetData[attributeKey] !== 'undefined' ) {
            attributeResult = filterData( targetData[attributeKey], universalSchema[attributeKey], processSettings );
            if ( typeof attributeResult !== 'undefined' ) {
              if ( !finalOutcome ) finalOutcome = {};
              finalOutcome[attributeKey] = attributeResult;
            }
          }
        }
      }
      return finalOutcome;
    } else if ( schemaType === 'pattern' && typeof targetData === 'string' ) {
      var regexMatch = targetData.match( schema );
      if ( regexMatch && regexMatch[0].length == targetData.length ) return targetData;
    } else if ( schemaType === 'structure' ) {
      finalOutcome = {};
      // Verify existence of properties within the global schema, which can whitelist any fields in an object.
      if ( typeof universalSchema === 'object' ) {
        for ( attributeKey in targetData ) {
          if ( typeof universalSchema[attributeKey] === 'undefined' ) continue;
          attributeResult = filterData( targetData[attributeKey], universalSchema[attributeKey], processSettings );

          if ( typeof attributeResult !== 'undefined' ) {
            finalOutcome[attributeKey] = attributeResult;
          }
        }
      }
      if ( !targetData ) {
        if ( processSettings.fill )
          targetData = {};
        else if ( processSettings.strict )
          throw new Error( "Missing entity: " + attributeKey );
        else
          return undefined;
      }
      for ( attributeKey in schema ) {
        if ( typeof targetData[attributeKey] === 'undefined' ) {
          if ( processSettings.strict ) throw new Error( "Missing field: " + attributeKey );
          if ( processSettings.fill ) {
            if ( determineSchemaKind( schema[attributeKey] ) === 'list' )
              finalOutcome[attributeKey] = [];
            else
              finalOutcome[attributeKey] = null;
          }
          continue;
        }
        attributeResult = filterData( targetData[attributeKey], schema[attributeKey], processSettings );

        // If 'filterData.combine' was used, retrieve the properties from its result
        // and copy them into the current finalOutcome.
        if ( attributeResult instanceof CombinedItem ) {
          for ( var mergedAttribute in attributeResult.entityData ) {
            finalOutcome[mergedAttribute] = attributeResult.entityData[mergedAttribute];
          }
        }
        // Otherwise, copy the result directly as usual.
        else if ( typeof attributeResult !== 'undefined' ) {
          finalOutcome[attributeKey] = attributeResult;
        }
        // Throw an error if a field is missing and strict mode is enabled.
        else if ( processSettings.strict ) {
          throw new Error( "Filtering failed for: " + attributeKey );
        }
        // Or fill with a null value if requested by the process settings.
        else if ( processSettings.fill ) {
          finalOutcome[attributeKey] = null;
        }

      }
      return finalOutcome;
    }
  }

  filterData.interface = function ( sourceObject, schemaDefinition, initialOptions ) {
    var currentOptions = {} || initialOptions;
    currentOptions.fill = true;
    return filterData( sourceObject, schemaDefinition, currentOptions );
  };

  filterData.strict = function ( inputData, dataSchema, defaultOpts ) {
    var execOptions = {} || defaultOpts;
    execOptions.strict = true;
    try {
      return filterData( inputData, dataSchema, execOptions );
    } catch ( errorObject ) {
      return undefined;
    }
  };

  filterData.register = function ( processorName, handlerFunction ) {
    dataProcessors[processorName] = handlerFunction;
  };

  filterData.anyOf = function () {
    var candidateHandlers = arguments;
    return function ( currentValue ) {
      var idx, tempResult;
      var processingInput = currentValue,
        finalOutput;
      for ( idx = 0; idx < candidateHandlers.length; ++idx ) {
        tempResult = filterData( processingInput, candidateHandlers[idx] );
        if ( typeof tempResult !== 'undefined' ) {
          processingInput = tempResult;
          finalOutput = tempResult;
        }
      }
      return finalOutput;
    };
  };

  // REMINDER: The 'allOf' functionality should be updated to properly consider processing settings.
  filterData.allOf = function () {
    var sequentialHandlers = arguments;
    return function ( initialValue ) {
      var counter;
      var cumulativeResult = initialValue;
      for ( counter = 0; counter < sequentialHandlers.length; ++counter ) {
        cumulativeResult = filterData( cumulativeResult, sequentialHandlers[counter] );
        if ( typeof cumulativeResult === 'undefined' ) return undefined;
      }
      return cumulativeResult;
    };
  };

  filterData.combine = function ( mergeSchema, mergeOptions ) {
    return function ( sourceValue ) {
      var processedOutput = filterData( sourceValue, mergeSchema, mergeOptions );
      if ( typeof processedOutput !== 'undefined' ) return new CombinedItem( processedOutput );
    };
  };
  filterData.mainProcessor = filterData; // Providing backward compatibility for the API.

  return filterData;
} );