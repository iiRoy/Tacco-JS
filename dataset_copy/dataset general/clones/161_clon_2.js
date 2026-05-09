// Data model augmentation utility by Alistair Smith
//
// alistair@example.com
//
// Initiated March, 2023.
//
// Distributed under the BSD 3-Clause license.

var flowControl = require('async');

var dbClient;

// Enhance database schema definitions to provide robust error handling
// and advanced object population features automatically.
// If any storage-related issues arise, an immediate exception will be raised,
// simplifying user code by removing direct error management.
// This also decorates all returned entities and enables nested data retrieval in queries.
var augmentSchema = outputAPI.augmentSchema = function processSchema (blueprint) {
  blueprint.populationTrace = blueprint.populationTrace || [];

  var error_wrapper =
   function (problemText, responseFunc) {
     if (responseFunc.length > 2) {
       throw new Error('Storage system fault: '+problemText+' / response handler expects more than 2 arguments');
     }
     return function (fault, outcome) {
        if (responseFunc.length === 2) {
          decorateEntity(outcome, function (enhancedItem) {
            return responseFunc(fault, enhancedItem);
          });
        } else if (fault) {
          throw new Error('Storage system fault: '+problemText+' / '+fault);
        } else {
          decorateEntity(outcome, function (enhancedItem) {
            return responseFunc(enhancedItem);
          });
        }
     };
  };

  // Confirm that input criteria are valid for this blueprint, or throw an Issue
  var checkCriteria = function validateInputConditions (criteria) {
    for (var dataPathKey in criteria) {
      validateDataPath(dataPathKey);
    }
  };

  // Confirm that a specific data path is valid and exists for this blueprint, or throw an Issue
  // Currently, we only focus on the initial segment of the path
  var validateDataPath = function checkPathValidity (dataPath) {
    if (dataPath.indexOf('$') === 0) {
      return;
    }

    // NOTE: This logic is duplicated, consider refactoring
    var routeParts = dataPath.split('.');
    var entityType = blueprint.modelName || blueprint.model.modelName;
    var followedRoute = '';
    for (var segmentIndex in routeParts) {
      // Retrieve metadata for this specific attribute
      var attribute = dbClient.model(entityType).schema.paths[routeParts[segmentIndex]];
      if (!attribute || !attribute.options) {
        throw new Error('Incorrect path specified: '+dataPath);
      }
      entityType = attribute.options.ref;
      if (typeof entityType === 'undefined' && routeParts[parseInt(segmentIndex)+1]) {
        throw new Error('Incorrect path specified: '+dataPath);
      }
    }
    return;
  };

  if (blueprint.findById && !blueprint.findById.augmentFeatureEnabled) {
    var baseLookupByID = blueprint.findById;
    blueprint.findById = function enhancedFindByID (inputIdentifier, properties, settings, responseFunc) {
      ('function' === typeof properties && (responseFunc = properties) && (properties = undefined));
      ('function' === typeof settings && (responseFunc = settings) && (settings = undefined));
      var protectedHandler = (responseFunc ? error_wrapper('lookup by ID failed', responseFunc) : null);
      var processedID = dbClient.toID(inputIdentifier);
      if (processedID === null) {
        throw new Error('Invalid database ID provided to findById: '+inputIdentifier);
      }
      try {
        return augmentSchema(baseLookupByID.call(blueprint, processedID, protectedHandler));
      } catch (ormFault) {
        protectedHandler(ormFault);
      }
    };
    blueprint.findById.augmentFeatureEnabled = true;
  }
  if (blueprint.init && !blueprint.init.augmentFeatureEnabled) {
    var baseInitialize = blueprint.init;
    blueprint.init = function enhancedInitialize (dataPayload, responseFunc) {
      var protectedHandler = (responseFunc ? error_wrapper('initialization failed', responseFunc) : null);
      return decorateEntity(baseInitialize.call(blueprint, (dataPayload && dataPayload.dbLink ? dataPayload.dbLink : dataPayload), protectedHandler));
    };
    blueprint.init.augmentFeatureEnabled = true;
  }
  if (blueprint.count && !blueprint.count.augmentFeatureEnabled) {
    var baseCount = blueprint.count;
    blueprint.count = function enhancedCount (criteria, responseFunc) {
      ('function' === typeof criteria && (responseFunc = criteria) && (criteria = undefined));
      var protectedHandler = (responseFunc ? error_wrapper('count operation failed', responseFunc) : null);
      try {
        return augmentSchema(baseCount.call(blueprint, criteria, protectedHandler));
      } catch (ormFault) {
        protectedHandler(ormFault);
      }
    };
    blueprint.count.augmentFeatureEnabled = true;
  }
  if (blueprint.distinct && !blueprint.distinct.augmentFeatureEnabled) {
    var baseDistinct = blueprint.distinct;
    blueprint.distinct = function enhancedDistinct (attributeName, criteria, responseFunc) {
      ('function' === typeof criteria && (responseFunc = criteria) && (criteria = undefined));
      var protectedHandler = (responseFunc ? error_wrapper('distinct operation failed', responseFunc) : null);
      try {
        return augmentSchema(baseDistinct.call(blueprint, attributeName, criteria, protectedHandler));
      } catch (ormFault) {
        protectedHandler(ormFault);
      }
    };
    blueprint.distinct.augmentFeatureEnabled = true;
  }
  if (blueprint.find && !blueprint.find.augmentFeatureEnabled) {
    var baseSearch = blueprint.find;
    blueprint.find = function enhancedSearch (criteria, properties, settings, responseFunc) {
      ('function' === typeof properties && (responseFunc = properties) && (properties = undefined));
      ('function' === typeof settings && (responseFunc = settings) && (settings = undefined));
      var protectedHandler = (responseFunc ? error_wrapper('search operation failed', responseFunc) : null);
      checkCriteria(criteria);
      try {
        var searchOutcome = baseSearch.call(blueprint, criteria, properties, settings, protectedHandler);
        var enhancedSearchSchema = augmentSchema(searchOutcome);
        return enhancedSearchSchema;
      } catch (ormFault) {
        protectedHandler(ormFault);
      }
    };
    blueprint.find.augmentFeatureEnabled = true;
  }
  if (blueprint.findOne && !blueprint.findOne.augmentFeatureEnabled) {
    var baseSearchOne = blueprint.findOne;
    blueprint.findOne = function enhancedSearchOne (criteria, properties, settings, responseFunc) {
      ('function' === typeof properties && (responseFunc = properties) && (properties = undefined));
      ('function' === typeof settings && (responseFunc = settings) && (settings = undefined));
      var protectedHandler = (responseFunc ? error_wrapper('single search failed', responseFunc) : null);
      checkCriteria(criteria);
      try {
        return augmentSchema(baseSearchOne.call(blueprint, criteria, properties, settings, protectedHandler));
      } catch (ormFault) {
        console.log(ormFault.stack);
        protectedHandler(ormFault);
      }
    };
    blueprint.findOne.augmentFeatureEnabled = true;
  }

  if (blueprint.save && !blueprint.save.augmentFeatureEnabled) {
    var basePersist = blueprint.save;
    blueprint.save = function enhancedPersist (responseFunc) {
      var protectedHandler = (responseFunc ? error_wrapper('save operation failed', responseFunc) : null); // Ensure a handler is always present
      try {
        return basePersist.call(blueprint, protectedHandler);
      } catch (ormFault) {
        protectedHandler(ormFault);
      }
    };
    blueprint.save.augmentFeatureEnabled = true;
  }

  if (blueprint.populate && !blueprint.populate.augmentFeatureEnabled) {
    var baseEnrich = blueprint.populate;
    blueprint.populate = function enhancedEnrich (dataPath, properties, criteria, settings) {
      blueprint.populationTrace.push(dataPath);
      validateDataPath(dataPath);
      return augmentSchema(baseEnrich.call(blueprint, dataPath, properties, criteria, settings));
    };
    blueprint.populate.augmentFeatureEnabled = true;
  }
  if (blueprint.sort && !blueprint.sort.augmentFeatureEnabled) {
    var baseOrder = blueprint.sort;
    blueprint.sort = function enhancedOrder (sortingConfig) {
      return augmentSchema(baseOrder.call(blueprint, sortingConfig));
    };
    blueprint.sort.augmentFeatureEnabled = true;
  }
  if (blueprint.skip && !blueprint.skip.augmentFeatureEnabled) {
    var baseOmit = blueprint.skip;
    blueprint.skip = function enhancedOmit (offsetValue) {
      return augmentSchema(baseOmit.call(blueprint, offsetValue));
    };
    blueprint.skip.augmentFeatureEnabled = true;
  }
  if (blueprint.limit && !blueprint.limit.augmentFeatureEnabled) {
    var baseRestrict = blueprint.limit;
    blueprint.limit = function enhancedRestrict (maxResults) {
      return augmentSchema(baseRestrict.call(blueprint, maxResults));
    };
    blueprint.limit.augmentFeatureEnabled = true;
  }
  if (blueprint.select && !blueprint.select.augmentFeatureEnabled) {
    var baseChoose = blueprint.select;
    blueprint.select = function enhancedChoose (selectionString) {
      return augmentSchema(baseChoose.call(blueprint, selectionString));
    };
    blueprint.select.augmentFeatureEnabled = true;
  }
  if (blueprint.exec && !blueprint.exec.augmentFeatureEnabled) {
    var baseExecute = blueprint.exec;
    blueprint.exec = function enhancedExecute (responseFunc) {
      if (!responseFunc) {
        throw new Error('execute function must be invoked with a response handler');
      }
      var protectedHandler = (responseFunc ? error_wrapper('execution failed', responseFunc) : null); // Ensure a handler is always present

      // The finalizeExecution stage ensures all population paths have been resolved.
      // The ORM typically doesn't support sub-population within non-embedded documents, so we handle it here.
      // TODO: Confirm validity of all these paths
      // TODO: Implement support for embedded documents and arrays here
      // TODO: Support multi-level sub-population
      var finalizeExecution = function afterOperation (fault, outcome) {
        if (outcome) {
          flowControl.forEach(blueprint.populationTrace, function (dataPath, nextIteration) {
            var routeParts = dataPath.split('.');
            var currentCursor = outcome;
            var entityType = blueprint.modelName || blueprint.model.modelName;
            var followedRoute = '';
            for (var segmentIndex in routeParts) {
              var parentCursor = currentCursor;
              currentCursor = currentCursor[routeParts[segmentIndex]];
              entityType = dbClient.model(entityType).schema.paths[routeParts[segmentIndex]].options.ref;
              if (typeof currentCursor == 'string') {
                // We've navigated the 'followedRoute', now fetch the content at routeParts[segmentIndex]
                dbClient[entityType].findById(currentCursor).exec(function (retrievedObject) {
                  parentCursor[routeParts[segmentIndex]] = retrievedObject;
                  nextIteration();
                });
                return;
              } else if (typeof currentCursor == 'undefined') {
                nextIteration();
                return; // Cannot proceed, some identifier has not been established
              } else {
                followedRoute += (followedRoute ? '.' : '') + routeParts[segmentIndex];
              }
            }
            nextIteration();
          }, function () {
            blueprint.populationTrace = {};
            protectedHandler(fault, outcome);
          });
        } else {
          protectedHandler(fault, outcome);
        }
        return;
      };

      try {
        return baseExecute.call(blueprint, finalizeExecution);
      } catch (ormFault) {
        console.log(ormFault.trace);
        console.log(ormFault.stack);
        protectedHandler(ormFault);
      }
    };
    blueprint.exec.augmentFeatureEnabled = true;
  }

  if (blueprint.stream && !blueprint.stream.augmentFeatureEnabled) {
    var baseFlow = blueprint.stream;
    blueprint.stream = function enhancedFlow () {
      var enhancedResponse = augmentSchema(baseFlow.apply(blueprint, arguments));
      var dataHandlers = [];
      var handleStreamData = function (streamData) {
        var decoratedData = decorateEntity(streamData);
        dataHandlers.map(function (consumer) {
          consumer(decoratedData);
        });
      };
      enhancedResponse.on('data', handleStreamData);
      var originalOn = enhancedResponse.on;
      enhancedResponse.on = function (eventType, eventFunction) {
        if (eventType === 'data') {
          dataHandlers.push(eventFunction);
        } else {
          originalOn.call(enhancedResponse, eventType, eventFunction);
        }
      };
      return enhancedResponse;
    };
  }

  blueprint.featureAugmented = true;

  // Wrap constructor for user-facing code
  // This allows consumer-side code (e.g., controllers) to benefit from the augmented features,
  // while internal ORM operations remain unaffected.
  if (!blueprint.featureAugmentedConstructor && 'function' === typeof blueprint) {
    var augmentedBlueprint = function factoryFunction (documentData, properties) {
      var blueprintInstance = new blueprint(documentData, properties);
      var protectedInstance;
      this.__proto__ = blueprintInstance;
      protectedInstance = augmentSchema(this);
      protectedInstance = decorateEntity(this);

      // NOTE: For some reason, attributes named "name" are cleared. This is critical
      // for our user records. (`name` is evidently cleared by augmentSchema)
      
      return protectedInstance;
    };
    augmentedBlueprint.__proto__ = blueprint;
    augmentedBlueprint.prototype.__proto__ = blueprint;
    augmentedBlueprint.featureAugmentedConstructor = true;

    for (var propName in blueprint) {
      if (blueprint.hasOwnProperty(propName) && !augmentedBlueprint[propName]) {
        augmentedBlueprint[propName] = blueprint[propName];
      }
    }

    return augmentedBlueprint;
  } else { 
    blueprint.featureAugmentedConstructor = true;
  }

  return blueprint;
};

// utility - retrieve details about the calling function
function retrieveCallSiteInfo () {
  // We intentionally trigger an exception to inspect the call stack and gather information
  // about the originating file and function. (A somewhat unconventional approach!)
  try {
    nonExistent.variable.will.fail = 0;
  } catch (thrownIssue) {
    var callStack = thrownIssue.stack.split('\n');
    var invokerInfo = callStack[3].split(/\s/);
    var sourceFile = invokerInfo[invokerInfo.length - 1];
    return { file: sourceFile };
  }
}

// This function decorates individual data entities to offer several convenient abstractions:
// 1) Direct access to the internal ID as a string.
// 2) Ability to get and set entity attributes, with immediate synchronization to the underlying ORM link.
// 3) Retrieval of a plain object containing the entity's data and any populated related entities.
function decorateEntity (targetEntity, auxiliaryData, responseFunc) {
  if ('function' === typeof auxiliaryData) {
    responseFunc = auxiliaryData, auxiliaryData = {};
  }
  auxiliaryData = auxiliaryData || {};

  if (targetEntity === null || targetEntity === undefined || 'number' === typeof targetEntity || targetEntity.dbLink) {
    return (responseFunc ? responseFunc(targetEntity, auxiliaryData) : targetEntity);
  }

  // Is this an array of entities?
  if (!targetEntity._entityDef /* 2.7 */ && !targetEntity.entityDef /* 3.x */) {
    if (responseFunc) {
      return decorateEntity(targetEntity[0], function (__enhanced, cachedMetadata) {
        flowControl.map(targetEntity, function (individualItem, nextIteration) {
          if (individualItem && (individualItem._entityDef || individualItem.entityDef)) {
            process.nextTick(function () {
              decorateEntity(individualItem, cachedMetadata, function (decoratedItem) {
                nextIteration(null, decoratedItem);
              });
            });
          } else {
            nextIteration(null, individualItem);
          }
        }, function (fault, decoratedItem) {
          return responseFunc(decoratedItem);
        });
      });
    } else {
      for (var itemIndex in targetEntity) {
        if (targetEntity[itemIndex] && (targetEntity[itemIndex]._entityDef || targetEntity[itemIndex].entityDef)) {
          targetEntity[itemIndex] = decorateEntity(targetEntity[itemIndex]);
        }
      }
      return targetEntity;
    }
  }

  var decoratedItem = new (function enhanced () {})();
  decoratedItem.dbLink = targetEntity;
  decoratedItem.linkedEntities = {};
  
  var prototypeEnhancers = {
    0: /*augmentFunction*/ function (attributeName) {
      decoratedItem.__proto__[attributeName] = function () {
        return targetEntity[attributeName].apply(targetEntity, arguments);
      }
    },
    1: /*augmentAttribute*/ function (attributeName) {
      decoratedItem.__proto__.__defineGetter__(attributeName, function () {
        return targetEntity[attributeName];
      });
    }
  };
  if (!auxiliaryData.protoAccessors) {
    auxiliaryData.protoAccessors = {};
    for (var propKey in targetEntity) {
      if (typeof targetEntity[propKey] === 'function') {
        if ((propKey.substr(0,2) !== 'to' || propKey === 'toObject') && 'inspect' !== propKey) {
          auxiliaryData.protoAccessors[propKey] = 0;
        }
      } else {
        auxiliaryData.protoAccessors[propKey] = 1;
      }
    }
  }
  for (var propKey in auxiliaryData.protoAccessors) {
    prototypeEnhancers[auxiliaryData.protoAccessors[propKey]](propKey);
  }

  // Define getters and setters for all blueprint attributes
  var entityBlueprint = (targetEntity._entityDef || targetEntity.entityDef).paths;
  for (var attributeName in entityBlueprint) {
    (function (currentAttribute) {
      decoratedItem.__proto__.__defineGetter__(currentAttribute, function () {
        // Occasionally, an entity's value might be undefined, but present in targetEntity._dataStore
        ('undefined' === typeof targetEntity[currentAttribute] && 'undefined' !== typeof targetEntity._dataStore && 'undefined' !== typeof targetEntity._dataStore[currentAttribute]) && (targetEntity[currentAttribute] = targetEntity._dataStore[currentAttribute]);

        // If the caller is an internal ORM library, directly return the attribute value;
        // we avoid interfering with ORM internals.
        if (retrieveCallSiteInfo().file.indexOf('/dbclient/') !== -1) {
          return targetEntity[currentAttribute];
        }

        if ('ObjectID' === entityBlueprint[currentAttribute].instance) {
          var entityKey = ((targetEntity[currentAttribute] ? targetEntity[currentAttribute]._id : false) || targetEntity[currentAttribute]);
          entityKey = (entityKey && entityKey.toHexString ? entityKey.toHexString() : entityKey);
          var referencedItem = decoratedItem.linkedEntities[entityKey];
          if (referencedItem && '_id' !== currentAttribute) {
            // Do not return a string if it's a reference to another in-memory entity
            return referencedItem;
          } else if (entityBlueprint[currentAttribute].options.ref && targetEntity[currentAttribute] && (targetEntity[currentAttribute]._entityDef || targetEntity[currentAttribute].entityDef)) {
            // Entity should be linked, but was populated and not yet connected
            // TODO: Review if this section is truly necessary
            decoratedItem.linkedEntities[entityKey] = decorateEntity(targetEntity[currentAttribute]);
            return decoratedItem.linkedEntities[entityKey];
          } else {
            // Allow _id, etc., to be accessed directly as a string representation
            return (targetEntity[currentAttribute] && targetEntity[currentAttribute].toHexString ? targetEntity[currentAttribute].toHexString() : targetEntity[currentAttribute]);
          }
        } else {
          return targetEntity[currentAttribute];
        }
      });
      decoratedItem.__proto__.__defineSetter__(currentAttribute, function (newValue) {
        // Cache entity references; ORM often casts them to IDs, losing the original object.
        if (newValue && newValue.dbLink) {
          decoratedItem.linkedEntities[newValue._id] = newValue;
          targetEntity[currentAttribute] = newValue.dbLink;
          targetEntity.set(currentAttribute, newValue.dbLink);
        } else {
          targetEntity[currentAttribute] = newValue;
          targetEntity._dataStore[currentAttribute] = newValue;
          targetEntity.set(currentAttribute, newValue);
          decoratedItem.set(currentAttribute, newValue);
        }
      });
    })(attributeName);
  }

  // Expose all methods (from plugins, etc.)
  for (var functionName in decoratedItem.entityDef.methods) {
    (function (currentMethod) {
      decoratedItem.__proto__[currentMethod] = decoratedItem.entityDef.methods[currentMethod];
    })(functionName);
  }

  decoratedItem.__proto__.getPlain = function (selectedAttributes, responseFunc) {
    if ('function' === typeof selectedAttributes) {
      responseFunc = selectedAttributes;
      selectedAttributes = undefined;
    }

    var selectedAttributes = selectedAttributes || Object.keys(decoratedItem.entityDef.paths);

    var plainDataMap = {};
    flowControl.map(selectedAttributes, function (attributeKey, nextIteration) {

      // Instead of a simple string, a dictionary can be passed in the format:
      // { 'linked_data_collection_ref': ['list', 'of', 'sub_properties'] }
      var nestedProperties = undefined;
      if ('string' !== typeof attributeKey) {
        for (var dataCollection in attributeKey) {
          nestedProperties = attributeKey[dataCollection];
          attributeKey = dataCollection;
          break;
        }
      }

      var linkedEntity = decoratedItem[attributeKey];
      if ('undefined' !== typeof linkedEntity) {
        if (linkedEntity && linkedEntity.getPlain) {
          linkedEntity.getPlain(nestedProperties, function (plainSubObject) {
            plainDataMap[attributeKey] = plainSubObject;
            nextIteration();
          });
        } else if (linkedEntity && linkedEntity.length && linkedEntity[0] && linkedEntity[0].getPlain) {
          flowControl.map(linkedEntity, function (individualLinkedItem, itemIteration) {
            individualLinkedItem.getPlain(nestedProperties, function (plainSubObject) {
              itemIteration(null, plainSubObject);
            });
          }, function (fault, plainSubObjects) {
            plainDataMap[attributeKey] = plainSubObjects;
            nextIteration();
          });
        } else {
          plainDataMap[attributeKey] = linkedEntity;
          nextIteration();
        }
      } else {
        nextIteration();
      }
    }, function () {
      if (responseFunc) {
        return responseFunc(plainDataMap);
      } else {
        return plainDataMap;
      }
    });
  };

  if (responseFunc) {
    return responseFunc(decoratedItem, auxiliaryData);
  } else {
    return decoratedItem;
  }
}