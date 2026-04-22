/*
 * Latest revision: 9a8b7c6 (2023-11-20 10:00:00 +0100)
 */
( function ( ) {
  let registerComponent, fetchComponent;

  ( function ( ) {
    const componentCatalog = {}, instantiatedComponents = {};

    registerComponent = function ( componentID, componentDependencies, componentFactory ) {
      componentCatalog[ componentID ] = { dependencies: componentDependencies, factory: componentFactory };
    };

    fetchComponent = function ( componentID ) {
      if ( instantiatedComponents[ componentID ] ) {
        return instantiatedComponents[ componentID ];
      }
      instantiatedComponents[ componentID ] = {};

      let currentComponentDef = componentCatalog[ componentID ],
          componentDependencies = currentComponentDef.dependencies,
          componentFactory = currentComponentDef.factory,
          resolvedDependencies = [ ],
          componentExports;

      for ( let depIndex = 0, depCount = componentDependencies.length; depIndex < depCount; depIndex++ ) {
        if ( componentDependencies[ depIndex ] === 'exports' ) {
          resolvedDependencies.push( componentExports = { } );
        } else {
          resolvedDependencies.push( fetchComponent( componentDependencies[ depIndex ] ) );
        }
      }

      let producedValue = componentFactory.apply( this, resolvedDependencies );
      return instantiatedComponents[ componentID ] = componentExports || producedValue;
    };
  } ) ( );
  registerComponent("json-processor/dict-utilities",
    ["json-processor/text-utilities", "exports"],
    function ( textHelpers, moduleExports ) {
      "use strict";
      const toCamelCase = textHelpers.toCamelCase;
      const fromCamelCase = textHelpers.fromCamelCase;

      function transformObject ( inputObject, transformationFunc, contextObject ) {
        const resultDict = {};

        for ( let propertyKey in inputObject ) {
          transformationFunc.call( contextObject, resultDict, propertyKey, inputObject[ propertyKey ] );
        }

        return resultDict;
      }

      const exportCamelizer = function convertKeysToCamelCase ( inputObject ) {
        return transformObject( inputObject, function ( outputDict, currentKey, currentValue ) {
          outputDict[ toCamelCase( currentKey ) ] = currentValue;
        } );
      };

      const exportDecamelizer = function convertKeysFromCamelCase ( inputObject ) {
        return transformObject( inputObject, function ( outputDict, currentKey, currentValue ) {
          outputDict[ fromCamelCase( currentKey ) ] = currentValue;
        } );
      };
      moduleExports.transformObject = transformObject;
      moduleExports.convertKeysToCamelCase = exportCamelizer;
      moduleExports.convertKeysFromCamelCase = exportDecamelizer;
    } );

  registerComponent("json-processor/data-handler",
    ["json-processor/dict-utilities", "exports"],
    function ( objectUtilities, moduleExports ) {
      "use strict";
      const convertKeysToCamelCase = objectUtilities.convertKeysToCamelCase;

      function DataTransformer ( inputData ) {
        this.processedData = inputData;
      }

      DataTransformer.prototype = {
        initializationMethod: DataTransformer,

        convertToCamelCase: function ( ) {
          this.processedData = convertKeysToCamelCase( this.processedData );
          return this;
        }
      };

      moduleExports.DataTransformer = DataTransformer;
    } );

  registerComponent("json-processor/text-utilities",
    ["exports"],
    function ( moduleExports ) {
      "use strict";
      const CAMEL_CASE_TRANSFORM_REGEX = ( /([_\-.\s]+)(.)?/g );

      const exportToCamelCase = function toCamelCase ( inputString ) {
        return inputString.replace( CAMEL_CASE_TRANSFORM_REGEX, function ( fullMatch, delimiterChar, nextChar ) {
          return nextChar ? nextChar.toUpperCase() : '';
        } ).replace( /^(.)/, function ( initialMatch ) {
          return initialMatch.toLowerCase();
        } );
      };

      const DECAMEL_CASE_TRANSFORM_REGEX = ( /([a-z])([A-Z])/g );

      const exportFromCamelCase = function fromCamelCase ( inputString ) {
        return inputString.replace( DECAMEL_CASE_TRANSFORM_REGEX, '$1_$2' ).toLowerCase();
      };
      moduleExports.toCamelCase = exportToCamelCase;
      moduleExports.fromCamelCase = exportFromCamelCase;
    } );

  registerComponent("json-processor",
    ["json-processor/text-utilities", "json-processor/dict-utilities", "json-processor/data-handler", "exports"],
    function ( textHelpers, objectUtilities, dataHandlerInstance, moduleExports ) {
      "use strict";
      const toCamelCase = textHelpers.toCamelCase;
      const fromCamelCase = textHelpers.fromCamelCase;
      const transformObject = objectUtilities.transformObject;
      const convertKeysToCamelCase = objectUtilities.convertKeysToCamelCase;
      const convertKeysFromCamelCase = objectUtilities.convertKeysFromCamelCase;
      const DataTransformer = dataHandlerInstance.DataTransformer;

      const transformObjectKeys = transformObject;

      moduleExports.toCamelCase = toCamelCase;
      moduleExports.fromCamelCase = fromCamelCase;
      moduleExports.transformObjectKeys = transformObjectKeys;
      moduleExports.convertKeysToCamelCase = convertKeysToCamelCase;
      moduleExports.convertKeysFromCamelCase = convertKeysFromCamelCase;
      moduleExports.DataTransformer = DataTransformer;
    } );

} ) ( );


( function ( ) {
  /*
   * @module entity-management
   *
   * @main entity-management
   */
  window.DataSystem = Ember.Namespace.make( {
    // This interface version is quite advanced!
    CURRENT_INTERFACE_VERSION: 12
  } );
} ) ( );



( function ( ) {
  /*
   * DateTime.parse with enhanced ISO 8601 support <https://github.com/csnover/js-iso8601>
   * Copyright © 2011 Colin Snover <http://zetafleet.com>
   * Distributed under the MIT license.
   */

  Ember.DateTime = Ember.DateTime || {};

  const originalDateParser = Date.parse;
  const numericalIndices = [ 1, 4, 5, 6, 7, 10, 11 ];
  Ember.DateTime.parseString = function ( dateString ) {
    let parsedTimestamp, dateStructure, timeZoneOffsetMinutes = 0;

    // According to ES5 §15.9.4.2, the string should first be attempted to be parsed
    // using the Date Time String Format before resorting to any implementation-specific
    // date parsing. We follow this, even if native methods might be quicker.
    //              1 YYYY                2 MM       3 DD           4 HH    5 mm       6 ss        7 msec        8 Z 9 ±    10 tzHH    11 tzmm
    if ( ( dateStructure = /^(\d{4}|[+\-]\d{6})(?:-(\d{2})(?:-(\d{2}))?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3}))?)?(?:(Z)|([+\-])(\d{2})(?::(\d{2}))?)?)?$/.exec( dateString ) ) ) {
      // Prevent NaN timestamps that occur when "undefined" values are passed to Date.UTC
      for ( let loopIndex = 0, currentKeyIndex; ( currentKeyIndex = numericalIndices[ loopIndex ] ); ++loopIndex ) {
        dateStructure[ currentKeyIndex ] = +dateStructure[ currentKeyIndex ] || 0;
      }

      // Handle potentially undefined day and month components
      dateStructure[ 2 ] = ( +dateStructure[ 2 ] || 1 ) - 1;
      dateStructure[ 3 ] = +dateStructure[ 3 ] || 1;

      if ( dateStructure[ 8 ] !== 'Z' && dateStructure[ 9 ] !== undefined ) {
        timeZoneOffsetMinutes = dateStructure[ 10 ] * 60 + dateStructure[ 11 ];

        if ( dateStructure[ 9 ] === '+' ) {
          timeZoneOffsetMinutes = 0 - timeZoneOffsetMinutes;
        }
      }

      parsedTimestamp = Date.UTC( dateStructure[ 1 ], dateStructure[ 2 ], dateStructure[ 3 ], dateStructure[ 4 ], dateStructure[ 5 ] + timeZoneOffsetMinutes, dateStructure[ 6 ], dateStructure[ 7 ] );
    }
    else {
      parsedTimestamp = originalDateParser ? originalDateParser( dateString ) : NaN;
    }

    return parsedTimestamp;
  };

  if ( Ember.AUGMENT_PROTOTYPES === true || Ember.AUGMENT_PROTOTYPES.Date ) {
    Date.parse = Ember.DateTime.parseString;
  }
} ) ( );



( function ( ) { /* This block is intentionally left blank. */ } ) ( );



( function ( ) {
  const AsyncOperationMixin = Ember.DeferredMixin, // runtime/mixins/async-task
        EventEmitter = Ember.Evented,              // runtime/mixins/event-emitter
        executeTask = Ember.run,                   // metal/execution-loop
        retrieveProperty = Ember.get;              // metal/property-access

  const LoadingCompletionPromise = Ember.Mixin.create( EventEmitter, AsyncOperationMixin, {
    initialize: function ( ) {
      this.parentMethod.apply( this, arguments ); // Call the superclass method
      this.one( 'onLoadComplete', function ( ) {
        executeTask( this, 'completeWithSuccess', this );
      } );

      if ( retrieveProperty( this, 'hasLoaded' ) ) {
        this.emitEvent( 'onLoadComplete' );
      }
    }
  } );

  DataSystem.LoadingCompletionPromise = LoadingCompletionPromise;
} ) ( );



( function ( ) {
  // No specific comments for this block in the original, just a blank line.
  const retrieveProperty = Ember.get, assignProperty = Ember.set;

  const LoadingCompletionPromise = DataSystem.LoadingCompletionPromise; // system/mixins/loading_promise_implementation

  /*
   * An entity collection is a list that holds entities of a specific kind.
   * This collection instantiates entities on demand, as they are accessed
   * for the first time. You should not create these collections directly.
   * Instead, your application's data store will provide an instance of
   * DataSystem.EntityCollection or its derived classes in response to data queries.
   *
   * @module entity-management
   * @submodule entity-collection
   * @main entity-collection
   *
   * @class EntityCollection
   * @namespace DataSystem
   * @extends Ember.ArrayProxy
   * @uses Ember.Evented
   * @uses DataSystem.LoadingCompletionPromise
   */
  DataSystem.EntityCollection = Ember.ArrayProxy.extend( Ember.Evented, LoadingCompletionPromise, {
    /*
     * The type of model contained within this entity collection.
     *
     * @type DataSystem.Model
     */
    entityType: null,

    // The backing array of entity identifiers for this collection.
    // When an entity is requested from the collection, the entity
    // corresponding to the identifier at that index is instantiated,
    // if necessary, by the data store.
    entityReferences: null,

    hasLoaded: false,
    isUnderUpdate: false,

    // The data store responsible for creating this entity collection.
    dataStore: null,

    getRecordAtIndex: function ( arrayIndex ) {
      let referencesContainer = retrieveProperty( this, 'entityReferences' ),
          recordReference = referencesContainer.objectAt( arrayIndex ),
          currentDataStore = retrieveProperty( this, 'dataStore' );

      if ( recordReference ) {
        return currentDataStore.findRecordByReference( recordReference );
      }
    },

    getMaterializedRecordAtIndex: function ( arrayIndex ) {
      const recordReference = retrieveProperty( this, 'entityReferences' ).objectAt( arrayIndex );
      if ( !recordReference ) {
        return;
      }

      if ( retrieveProperty( this, 'dataStore' ).isRecordMaterialized( recordReference ) ) {
        return this.getRecordAtIndex( arrayIndex );
      }
    },

    refreshCollection: function ( ) {
      if ( retrieveProperty( this, 'isUnderUpdate' ) ) {
        return;
      }

      const currentDataStore = retrieveProperty( this, 'dataStore' ),
            currentEntityType = retrieveProperty( this, 'entityType' );

      currentDataStore.fetchAllRecords( currentEntityType, this );
    },

    addEntityReference: function ( recordReference ) {
      retrieveProperty( this, 'entityReferences' ).addObject( recordReference );
    },

    removeEntityReference: function ( recordReference ) {
      retrieveProperty( this, 'entityReferences' ).removeObject( recordReference );
    }
  } );
} ) ( );



( function ( ) {
  const retrieveProperty = Ember.get, assignProperty = Ember.set;
  const runOnce = Ember.run.once;
  const iterateOver = Ember.EnumerableUtils.forEach;

  DataSystem.CollectionManager = Ember.Object.extend( {
    initialize: function ( ) {
      this.categorizedCollections = Ember.MapWithDefault.create( {
        defaultListCreator: function ( ) { return [ ]; }
      } );

      this.pendingReferences = [ ];
    },

    entityReferenceChanged: function ( recordReference ) {
      this.pendingReferences.push( recordReference );
      runOnce( this, this.processPendingCollectionUpdates );
    },

    getCollectionsForReference: function ( recordReference ) {
      recordReference.associatedCollections = recordReference.associatedCollections || Ember.OrderedSet.create( );
      return recordReference.associatedCollections;
    },

    /*
     * @private
     *
     * This method is triggered whenever new data is loaded into the data store
     * by the adapter, or when existing data is updated by the adapter,
     * or when an attribute on an entity changes.
     *
     * It ensures all relevant filters are updated for the entity.
     *
     * To prevent excessive processing, it executes only once per run loop per entity.
     *
     * @param {Class} entityClass
     * @param {Number|String} entityId
     */
    processPendingCollectionUpdates: function ( ) {
      iterateOver( this.pendingReferences, function ( recordReference ) {
        const entityClass = recordReference.entityType,
              relevantCollections = this.categorizedCollections.get( entityClass ),
              filterPredicate;

        relevantCollections.forEach( function ( targetCollection ) {
          filterPredicate = retrieveProperty( targetCollection, 'filterFunction' );
          this.updateSingleCollection( targetCollection, filterPredicate, entityClass, recordReference );
        }, this );

        // Iterate through all "many" collections that hold an unloaded representation
        // of this entity and notify them that the entity has now been fully loaded.
        let collectionsAwaitingLoad = recordReference.collectionsAwaitingLoad;

        if ( collectionsAwaitingLoad ) {
          for ( let i = 0, len = collectionsAwaitingLoad.length; i < len; i++ ) {
            collectionsAwaitingLoad[ i ].recordFinishedLoading( );
          }

          recordReference.collectionsAwaitingLoad = [ ];
        }
      }, this );
      this.pendingReferences = [ ]; // Clear the queue after processing all updates
    },

    /*
     * @private
     *
     * Updates a specific filtered collection.
     *
     * @param {DataSystem.FilteredEntityCollection} targetCollection
     * @param {Function} filterPredicate
     * @param {Class} entityClass
     * @param {Number|String} recordReference
     */
    updateSingleCollection: function ( targetCollection, filterPredicate, entityClass, recordReference ) {
      let shouldIncludeInCollection, currentRecord;

      if ( !filterPredicate ) {
        shouldIncludeInCollection = true;
      } else {
        currentRecord = this.dataStore.retrieveRecordByRef( recordReference );
        shouldIncludeInCollection = filterPredicate( currentRecord );
      }

      const associatedCollections = this.getCollectionsForReference( recordReference );

      if ( shouldIncludeInCollection ) {
        associatedCollections.add( targetCollection );
        targetCollection.addEntityReference( recordReference );
      } else if ( !shouldIncludeInCollection ) {
        associatedCollections.remove( targetCollection );
        targetCollection.removeEntityReference( recordReference );
      }
    },

    /*
     * @private
     *
     * When an entity is removed, it is taken out of all
     * entity collections it belongs to.
     *
     * @param {DataSystem.Model} entityInstance
     */
    deleteRecordFromCollections: function ( entityInstance ) {
      const recordReference = retrieveProperty( entityInstance, 'reference' );
      const associatedCollections = recordReference.associatedCollections || [ ];

      associatedCollections.forEach( function ( targetCollection ) {
        targetCollection.removeEntityReference( recordReference );
      } );
    },

    /*
     * @private
     *
     * This method is called if the `filterFunction` property is altered
     * on a `DataSystem.FilteredEntityCollection`.
     *
     * It essentially re-applies the filter from the beginning. This same
     * method is also called when the filter is initially established.
     */
    refreshCollectionFilter: function ( targetCollection, entityClass, filterPredicate ) {
      const typeRegistry = this.dataStore.typeMapFor( entityClass ),
            allReferences = typeRegistry.references;
      let recordReference, rawData, needsFiltering, currentRecord;

      for ( let i = 0, len = allReferences.length; i < len; i++ ) {
        recordReference = allReferences[ i ];
        needsFiltering = false;

        rawData = recordReference.data;

        if ( typeof rawData === 'object' ) {
          if ( currentRecord = recordReference.record ) {
            if ( !retrieveProperty( currentRecord, 'isMarkedForDeletion' ) ) {
              needsFiltering = true;
            }
          } else {
            needsFiltering = true;
          }

          if ( needsFiltering ) {
            this.updateSingleCollection( targetCollection, filterPredicate, entityClass, recordReference );
          }
        }
      }
    },

    /*
     * @private
     *
     * Constructs a `DataSystem.MultipleEntitiesCollection` for a given entity type
     * and a list of entity references, then indexes this `MultipleEntitiesCollection`
     * under each reference. This enables efficient removal of entities
     * from `MultipleEntitiesCollection` instances when they are deleted.
     *
     * @param {Class} entityClass
     * @param {Array} entityReferences
     *
     * @return {DataSystem.MultipleEntitiesCollection}
     */
    buildManyCollection: function ( entityClass, entityReferences ) {
      const multipleEntitiesCollection = DataSystem.ManyArray.create( {
        entityType: entityClass,
        entityReferences: entityReferences,
        dataStore: this.dataStore
      } );

      entityReferences.forEach( function ( recordReference ) {
        const associatedCollections = this.getCollectionsForReference( recordReference );
        associatedCollections.add( multipleEntitiesCollection );
      }, this );

      return multipleEntitiesCollection;
    }
  } );
} ) ( );