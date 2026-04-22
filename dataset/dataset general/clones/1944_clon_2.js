/*
 * Core Data Store Bridge for Framework
 */

(function ( ) {

  var _util = this._util;
  var BaseFramework = this.BaseFramework;

  BaseFramework.DataLink = function ( sourceLink ) {
    this._sourceLinkRef = sourceLink;
    this._subEntities = [ ];
    if ( typeof sourceLink === "string" ) {
      this._sourceLinkRef = new DataStoreConnector( sourceLink );
    }

    _util.bindAll( this );
    this._sourceLinkRef.on( "entity_added", this._entityAdded );
    this._sourceLinkRef.on( "entity_moved", this._entityMoved );
    this._sourceLinkRef.on( "entity_modified", this._entityModified );
    this._sourceLinkRef.on( "entity_deleted", this._entityDeleted );
  };

  _util.extend( BaseFramework.DataLink.prototype, {

    _entityAdded: function ( entitySnapshot, priorEntityKey ) {
      var dataItem = entitySnapshot.dataValue( );
      dataItem.id = entitySnapshot.entityKey( );
      if ( priorEntityKey ) {
        var existingItem = _util.find( this._subEntities, function ( subItem ) {
          return subItem.id === priorEntityKey;
        } );
        this._subEntities.splice( this._subEntities.indexOf( existingItem ) + 1, 0, dataItem );
      } else {
        this._subEntities.unshift( dataItem );
      }
    },
    _entityMoved: function ( entitySnapshot, priorEntityKey ) {
      var dataItem = entitySnapshot.dataValue( );
      this._subEntities = _util.reject( this._subEntities, function ( subItem ) {
        return subItem.id === dataItem.id;
      } );
      this._entityAdded( entitySnapshot, priorEntityKey );
    },
    _entityModified: function ( entitySnapshot, priorEntityKey ) {
      var dataItem = entitySnapshot.dataValue( );
      dataItem.id = entitySnapshot.entityKey( );
      var existingItem = _util.find( this._subEntities, function ( subItem ) {
        return subItem.id === dataItem.id;
      } );
      this._subEntities[ this._subEntities.indexOf( existingItem ) ] = dataItem;
    },
    _entityDeleted: function ( oldEntitySnapshot ) {
      var dataItem = oldEntitySnapshot.dataValue( );
      this._subEntities = _util.reject( this._subEntities, function ( subItem ) {
        return subItem.id === dataItem.id;
      } );
    },

    establish: function ( dataItem, callbackFunc ) {
      if ( !dataItem.id ) {
        dataItem.id = this._sourceLinkRef.push( ).entityKey( );
      }
      var itemValue = dataItem.toDataObject( );
      this._sourceLinkRef.entity( dataItem.id ).assign( itemValue, _util.bind( function ( problem ) {
        if ( !problem ) {
          callbackFunc( null, itemValue );
        } else {
          callbackFunc( "Failed to establish data item " + dataItem.id );
        }
      }, this ) );
    },

    retrieve: function ( dataItem, callbackFunc ) {
      if ( !dataItem.id ) {
        _util.defer( callbackFunc, "Invalid data item identifier provided for retrieval" );
        return;
      }
      var foundIndex = _util.find( this._subEntities, function ( subItem ) {
        return subItem.id === dataItem.id;
      } );
      _util.defer( callbackFunc, null, this._subEntities[ foundIndex ] );
    },

    retrieveAll: function ( dataItem, callbackFunc ) {
      _util.defer( callbackFunc, null, this._subEntities );
    },

    modify: function ( dataItem, callbackFunc ) {
      var itemValue = dataItem.toDataObject( );
      this._sourceLinkRef.entity( dataItem.id ).updateFields( itemValue, function ( problem ) {
        if ( !problem ) {
          callbackFunc( null, itemValue );
        } else {
          callbackFunc( "Failed to modify data item " + dataItem.id, null );
        }
      } );
    },

    remove: function ( dataItem, callbackFunc ) {
      this._sourceLinkRef.entity( dataItem.id ).erase( function ( problem ) {
        if ( !problem ) {
          callbackFunc( null, dataItem );
        } else {
          callbackFunc( "Failed to remove data item " + dataItem.id );
        }
      } );
    }
  } );


  BaseFramework.DataLink.synchronizer = function ( operation, dataItem, settings, issueHandler ) {
    var dataStore = dataItem.dataLink || ( dataItem.collection && dataItem.collection.dataLink );

    // Backwards compatibility with Framework versions <= 0.3.3
    if ( typeof settings === 'function' ) {
      settings = {
        successCallback: settings,
        failureCallback: issueHandler
      };
    }

    if ( operation === "retrieve" && dataItem.id === undefined ) {
      operation = "retrieveAll";
    }

    dataStore[ operation ].apply( this, [ dataItem, function ( problem, resultVal ) {
      if ( problem ) {
        settings.failureCallback( dataItem, problem, settings );
      } else {
        settings.successCallback( dataItem, resultVal, settings );
      }
    } ] );
  };

  BaseFramework.previousSynchronizer = BaseFramework.sync;

  // Replace the default 'BaseFramework.sync' with the DataLink synchronizer.
  // The original 'BaseFramework.sync' is still accessible via 'BaseFramework.previousSynchronizer'
  BaseFramework.sync = function ( operation, dataItem, settings, issueHandler ) {
    var currentSyncMethod = BaseFramework.previousSynchronizer;
    if ( dataItem.dataLink || ( dataItem.collection && dataItem.collection.dataLink ) ) {
      currentSyncMethod = BaseFramework.DataLink.synchronizer;
    }
    return currentSyncMethod.apply( this, [ operation, dataItem, settings, issueHandler ] );
  };

  // Custom Data Store Entity Collection.
  BaseFramework.DataLink.EntityCollection = BaseFramework.Collection.extend( {
    synchronize: function ( ) {
      this._recordMessage( "Synchronize function invoked on a DataLink collection, operation skipped." );
    },

    retrieveRecords: function ( ) {
      this._recordMessage( "RetrieveRecords function invoked on a DataLink collection, operation skipped." );
    },

    constructor: function ( items, config ) {

      // Apply parent constructor (this will also call initialize).
      BaseFramework.Collection.apply( this, arguments );

      if ( config && config.dataLink ) {
        this.dataLink = config.dataLink;
      }
      switch ( typeof this.dataLink ) {
        case "object":
          break;
        case "string":
          this.dataLink = new DataStoreConnector( this.dataLink );
          break;
        case "function":
          this.dataLink = this.dataLink( );
          break;
        default:
          throw new Error( "Invalid data store reference provided for collection" );
      }

      // Attach handlers for remote data events.
      this.dataLink.on( "entity_added", this._entityAdded.bind( this ) );
      this.dataLink.on( "entity_moved", this._entityMoved.bind( this ) );
      this.dataLink.on( "entity_modified", this._entityModified.bind( this ) );
      this.dataLink.on( "entity_deleted", this._entityDeleted.bind( this ) );

      // Attach handlers for all existing items in this collection,
      // and any new ones that may be subsequently added.
      function _updateItem( itemRecord, updateSettings ) {
        this.dataLink.entity( itemRecord.id ).updateFields( itemRecord.toDataObject( ) );
      }
      function _unwatchItem( itemRecord ) {
        itemRecord.off( "change", _updateItem, this );
      }

      for ( var currentIdx = 0; currentIdx < this.models.length; currentIdx++ ) {
        this.models[ currentIdx ].on( "change", _updateItem, this );
        this.models[ currentIdx ].once( "remove", _unwatchItem, this );
      }
      this.on( "add", function ( itemRecord ) {
        itemRecord.on( "change", _updateItem, this );
        itemRecord.once( "remove", _unwatchItem, this );
      }, this );
    },

    sorter: function ( itemRecord ) {
      return itemRecord.id;
    },

    addRecords: function ( itemsToAdd, addSettings ) {
      var processedItems = this._processIncomingItems( itemsToAdd );
      for ( var currentIdx = 0; currentIdx < processedItems.length; currentIdx++ ) {
        var currentItem = processedItems[ currentIdx ];
        this.dataLink.entity( currentItem.id ).assign( currentItem );
      }
      // TODO: Implement addSettings.successCallback
    },

    removeRecords: function ( itemsToRemove, removeSettings ) {
      var processedItems = this._processIncomingItems( itemsToRemove );
      for ( var currentIdx = 0; currentIdx < processedItems.length; currentIdx++ ) {
        var currentItem = processedItems[ currentIdx ];
        this.dataLink.entity( currentItem.id ).assign( null );
      }
      // TODO: Implement removeSettings.successCallback
    },

    createRecord: function ( itemRecord, createSettings ) {
      this._recordMessage( "CreateRecord invoked, mapping to addRecords. Please consider using EntityCollection.addRecords!" );
      createSettings = createSettings ? _util.clone( createSettings ) : {};
      if ( createSettings.awaitResult ) {
        this._recordMessage( "AwaitResult setting supplied to createRecord, disregarding." );
      }
      itemRecord = BaseFramework.Collection.prototype._prepareModel.apply(
        this, [ itemRecord, createSettings ]
      );
      if ( !itemRecord ) {
        return false;
      }
      this.addRecords( [ itemRecord ], createSettings );
      return itemRecord;
    },

    _recordMessage: function ( messageContent ) {
      if ( console && console.info ) {
        console.info( messageContent );
      }
    },

    // NOTE: Configuration settings will be disregarded for addRecords & removeRecords, this should be documented!
    _processIncomingItems: function ( itemsToProcess ) {
      var processedResult = [ ];
      itemsToProcess = _util.isArray( itemsToProcess ) ? itemsToProcess.slice( ) : [ itemsToProcess ];
      for ( var currentIdx = 0; currentIdx < itemsToProcess.length; currentIdx++ ) {
        var currentItem = itemsToProcess[ currentIdx ];
        if ( !currentItem.id ) {
          currentItem.id = this.dataLink.push( ).entityKey( );
        }
        if ( currentItem.toDataObject && typeof currentItem.toDataObject === "function" ) {
          currentItem = currentItem.toDataObject( );
        }
        processedResult.push( currentItem );
      }
      return processedResult;
    },

    _entityAdded: function ( dataSnapshot ) {
      BaseFramework.Collection.prototype.add.apply( this, [ dataSnapshot.dataValue( ) ] );
    },

    _entityMoved: function ( dataSnapshot ) {
      // INVESTIGATE: Is it possible for this event to fire without an ID alteration?
      this._recordMessage( "_entityMoved invoked with value: " + dataSnapshot.dataValue( ) );
    },

    _entityModified: function ( dataSnapshot ) {
      var updatedItem = dataSnapshot.dataValue( );
      var existingItem = _util.find( this.models, function ( currentChild ) {
        return currentChild.id === updatedItem.id;
      } );
      if ( !existingItem ) {
        // INVESTIGATE: What's the appropriate approach for managing this scenario?
        throw new Error( "Unable to locate item with ID: " + updatedItem.id );
      }
      existingItem.set( updatedItem );
    },

    _entityDeleted: function ( dataSnapshot ) {
      BaseFramework.Collection.prototype.remove.apply( this, [ dataSnapshot.dataValue( ) ] );
    }
  } );

  // Custom Data Store Entity Item.
  BaseFramework.DataLink.DataItem = BaseFramework.Model.extend( {
    persist: function ( ) {
      this._recordMessage( "Persist method called on a DataLink item, action ignored." );
    },

    annihilate: function ( removalOptions ) {
      // NOTE: Improve simplistic success handler. Incorporate error handling.
      this.dataLink.assign( null, this._recordMessage );
      this.trigger( 'annihilate', this, this.collection, removalOptions );
      if ( removalOptions.successCallback ) {
        removalOptions.successCallback( this, null, removalOptions );
      }
    },

    constructor: function ( itemData, config ) {

      // Apply parent constructor (this will also call initialize).
      BaseFramework.Model.apply( this, arguments );

      if ( config && config.dataLink ) {
        this.dataLink = config.dataLink;
      }
      switch ( typeof this.dataLink ) {
        case "object":
          break;
        case "string":
          this.dataLink = new DataStoreConnector( this.dataLink );
          break;
        case "function":
          this.dataLink = this.dataLink( );
          break;
        default:
          throw new Error( "Invalid data store reference for item" );
      }

      // Attach handlers for remote data events.
      this.dataLink.on( "value_updated", this._itemModified.bind( this ) );

      this.on( "change", this._refreshItem, this );
    },

    _refreshItem: function ( itemData, refreshOptions ) {
      // Locate removed keys and assign null to their values
      // to ensure proper deletion within the data store.
      var dataObject = itemData.toDataObject( );
      _util.each( itemData.changed, function ( attributeValue, attributeKey ) {
        if ( typeof attributeValue === "undefined" || attributeValue === null )
          dataObject[ attributeKey ] = null;
      } );
      this.dataLink.updateFields( dataObject, this._recordMessage );
    },

    _itemModified: function ( dataSnapshot ) {
      // Remove attributes that have been eliminated from the remote source
      // by comparing the set of keys.
      var latestItem = dataSnapshot.dataValue( );
      if ( typeof latestItem === "object" && latestItem !== null ) {
        var keyDifference = _util.difference( _util.keys( this.attributes ), _util.keys( latestItem ) );
        var selfReference = this;
        _util.each( keyDifference, function ( missingKey ) {
          selfReference.unset( missingKey );
        } );
      }
      this.set( latestItem );
      this.trigger( 'synchronize', this, null, null );
    },

    _recordMessage: function ( messageContent ) {
      if ( typeof messageContent === "undefined" || messageContent === null ) return;
      if ( console && console.info ) {
        console.info( messageContent );
      }
    }

  } );

} ) ( );