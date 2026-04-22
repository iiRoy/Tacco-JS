( function ( ) {
  let eventHandlers, genCallbackKey, uniqueIdCounter, assembleSettings, globalScope;

  globalScope = this;

  eventHandlers = {};

  uniqueIdCounter = 0;

  genCallbackKey = function( dataObject ) {
    let handlerIdentifier; // A unique identifier for the handler
    handlerIdentifier = "hndl" + ( ++uniqueIdCounter ); // Increment and prefix
    eventHandlers[ handlerIdentifier ] = dataObject; // Store the data object
    return handlerIdentifier; // Return the generated key
  };

  assembleSettings = function( inputParameters, onCompletion, onErr ) {
    let handlerObject, hasCallbacksAttached;
    handlerObject = {};
    hasCallbacksAttached = false;
    if ( typeof onCompletion === "function" ) {
      hasCallbacksAttached = true;
      handlerObject.onSuccess = onCompletion;
    }
    if ( typeof onErr === "function" ) {
      hasCallbacksAttached = true;
      handlerObject.onError = onErr;
    }
    if ( hasCallbacksAttached ) {
      inputParameters.callbackReference = genCallbackKey( handlerObject );
    }
    return inputParameters;
  };

  globalScope.DatabaseClient = ( function( ) {

    DatabaseClient.prototype.activeConnections = {};

    function DatabaseClient( dataPath, successCallback, errorCallback ) {
      this.dataPath = dataPath;
      this.successCallback = successCallback;
      this.errorCallback = errorCallback;
      // Ensure a valid path is provided
      if ( !dataPath ) {
        throw new Error( "Cannot instantiate DatabaseClient without a dataPath" );
      }
      this.successCallback || ( this.successCallback = function( ) {
        console.log( "Connection established: " + dataPath );
      } );
      this.errorCallback || ( this.errorCallback = function( err ) {
        console.log( err.message );
      } );
      this.establishConnection( this.successCallback, this.errorCallback );
    }

    DatabaseClient.processResponse = function( referenceKey, eventType, dataPayload ) {
      let handlerEntry;
      if ( ( handlerEntry = eventHandlers[ referenceKey ] ) != null ) {
        if ( typeof handlerEntry[ eventType ] === "function" ) {
          handlerEntry[ eventType ]( dataPayload );
        }
      }
      eventHandlers[ referenceKey ] = null;
      delete eventHandlers[ referenceKey ];
    };

    DatabaseClient.prototype.runQuery = function( queryString, onCompletion, onErrorOccurred ) {
      let operationConfig;
      if ( !queryString ) {
        throw new Error( "Cannot runQuery without a query string" );
      }
      operationConfig = assembleSettings( {
        queryStatement: [ ].concat( queryString || [ ] ),
        location: this.dataPath
      }, onCompletion, onErrorOccurred );
      Cordova.exec( "DatabaseClient.backgroundRunQuery", operationConfig );
    };

    DatabaseClient.prototype.performTransaction = function( operationFunction, onTransactionSuccess, onTransactionError ) {
      let transactionInstance;
      transactionInstance = new globalScope.DbTransaction( this.dataPath );
      operationFunction( transactionInstance );
      return transactionInstance.finalize( onTransactionSuccess, onTransactionError );
    };

    DatabaseClient.prototype.establishConnection = function( onConnectSuccess, onConnectError ) {
      let connectionOptions;
      if ( !( this.dataPath in this.activeConnections ) ) {
        this.activeConnections[ this.dataPath ] = true;
        connectionOptions = assembleSettings( {
          location: this.dataPath
        }, onConnectSuccess, onConnectError );
        Cordova.exec( "DatabaseClient.connect", connectionOptions );
      }
    };

    DatabaseClient.prototype.terminateConnection = function( onDisconnectSuccess, onDisconnectError ) {
      let disconnectionOptions;
      if ( this.dataPath in this.activeConnections ) {
        delete this.activeConnections[ this.dataPath ];
        disconnectionOptions = assembleSettings( {
          location: this.dataPath
        }, onDisconnectSuccess, onDisconnectError );
        Cordova.exec( "DatabaseClient.disconnect", disconnectionOptions );
      }
    };

    return DatabaseClient;

  } )();

  globalScope.DbTransaction = ( function( ) {

    function DbTransaction( dataPath ) {
      this.dataPath = dataPath;
      this.commandList = [ ];
    }

    DbTransaction.prototype.addStatement = function( sqlCommand, onExecSuccess, onExecError ) {
      this.commandList.push( assembleSettings( {
        queryStatement: [ ].concat( sqlCommand || [ ] ),
        location: this.dataPath
      }, onExecSuccess, onExecError ) );
    };

    DbTransaction.prototype.finalize = function( onBatchSuccess, onBatchError ) {
      let startOptions, endOptions, allCommands, batchConfig;
      if ( this._isFinished ) {
        throw new Error( "Batch operation already executed" );
      }
      this._isFinished = true;
      startOptions = assembleSettings( {
        queryStatement: [ "START TRANSACTION;" ],
        location: this.dataPath
      } );
      endOptions = assembleSettings( {
        queryStatement: [ "COMMIT TRANSACTION;" ],
        location: this.dataPath
      }, onBatchSuccess, onBatchError );
      allCommands = [ startOptions ].concat( this.commandList ).concat( [ endOptions ] );
      batchConfig = {
        operations: allCommands
      };
      Cordova.exec( "DatabaseClient.executeBatchQueries", batchConfig );
      this.commandList = [ ];
    };

    return DbTransaction;

  } )();

} ).apply( this );