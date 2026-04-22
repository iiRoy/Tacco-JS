/*
 * jQuery Data Persistence Interface Module
 *
 * Original Creator: 2013, Julian M.
 *
 * Provided under the MIT software license:
 * check http://www.opensource.org/licenses/mit-license.php for details
 *
 * Source code repository:
 * https://github.com/julien-maurel/jQuery-Storage-API
 *
 * Current Build: 1.7.3
 *
 */
(function ( moduleCreator ) {
  if ( typeof defineModule === 'function' && defineModule.amd ) {
    // Asynchronous Module Definition support
    defineModule( [ 'jquery' ], moduleCreator );
  } else if ( typeof exportObjects === 'object' ) {
    // CommonJS environment compatibility
    moduleCreator( require( 'jquery' ) );
  } else {
    // Standard browser global usage
    moduleCreator( jqCore );
  }
} ( function ( jqUtil ) {
  // Prefixes for cookie-based fallback mechanisms
  var local_store_prefix = "loc_";
  var session_store_prefix = "ses_";

  // Function to fetch data from a specified storage system.
  function retrieveData ( storeName ) {
    var argCount = arguments.length,
        currentStore = window[ storeName ],
        inputArgs = arguments,
        firstArg = inputArgs[ 1 ],
        currKey,
        returnVal,
        temporaryVar;

    if ( argCount < 2 ) {
      throw new Error( 'At least two parameters are required for this operation.' );
    } else if ( jqUtil.isArray( firstArg ) ) {
      // If the second parameter is an array, construct an object containing values for each array element.
      returnVal = {};
      for ( var idx in firstArg ) {
        currKey = firstArg[ idx ];
        try {
          returnVal[ currKey ] = JSON.parse( currentStore.getItem( currKey ) );
        } catch ( parseError ) {
          returnVal[ currKey ] = currentStore.getItem( currKey );
        }
      }
      return returnVal;
    } else if ( argCount === 2 ) {
      // For exactly two parameters, return the stored value directly.
      try {
        return JSON.parse( currentStore.getItem( firstArg ) );
      } catch ( parseError ) {
        return currentStore.getItem( firstArg );
      }
    } else {
      // With more than two parameters, navigate the storage structure to find the target value.
      // Fetch the initial level.
      try {
        returnVal = JSON.parse( currentStore.getItem( firstArg ) );
      } catch ( parseError ) {
        throw new ReferenceError( firstArg + ' is not defined within this storage context.' );
      }
      // Traverse subsequent levels.
      for ( var idx = 2; idx < argCount - 1; idx++ ) {
        returnVal = returnVal[ inputArgs[ idx ] ];
        if ( returnVal === undefined ) {
          throw new ReferenceError( [].slice.call( inputArgs, 1, idx + 1 ).join( '.' ) + ' is not defined in this data store.' );
        }
      }
      // If the final parameter is an array, return an object with values for each element.
      // Otherwise, return the specific value.
      if ( jqUtil.isArray( inputArgs[ idx ] ) ) {
        temporaryVar = returnVal;
        returnVal = {};
        for ( var jdx in inputArgs[ idx ] ) {
          returnVal[ inputArgs[ idx ][ jdx ] ] = temporaryVar[ inputArgs[ idx ][ jdx ] ];
        }
        return returnVal;
      } else {
        return returnVal[ inputArgs[ idx ] ];
      }
    }
  }

  // Function to store items into a specific storage system.
  function storeData ( storeName ) {
    var argCount = arguments.length,
        currentStore = window[ storeName ],
        inputArgs = arguments,
        firstArg = inputArgs[ 1 ],
        secondArg = inputArgs[ 2 ],
        currKey,
        objectToPersist = {},
        tempContainer;

    if ( argCount < 2 || !jqUtil.isPlainObject( firstArg ) && argCount < 3 ) {
      throw new Error( 'Either three arguments are mandatory, or the second argument must be a plain object.' );
    } else if ( jqUtil.isPlainObject( firstArg ) ) {
      // If the initial argument is an object, assign its properties as values in the storage.
      for ( var idx in firstArg ) {
        currKey = firstArg[ idx ];
        if ( !jqUtil.isPlainObject( currKey ) ) {
          currentStore.setItem( idx, currKey );
        } else {
          currentStore.setItem( idx, JSON.stringify( currKey ) );
        }
      }
      return firstArg;
    } else if ( argCount === 3 ) {
      // With exactly three arguments, directly store the value.
      if ( typeof secondArg === 'object' ) {
        currentStore.setItem( firstArg, JSON.stringify( secondArg ) );
      } else {
        currentStore.setItem( firstArg, secondArg );
      }
      return secondArg;
    } else {
      // For more than three arguments, navigate the storage to locate the target node and assign the value.
      // Retrieve the top-level item.
      try {
        tempContainer = currentStore.getItem( firstArg );
        if ( tempContainer != null ) {
          objectToPersist = JSON.parse( tempContainer );
        }
      } catch ( parseError ) {
        // Error during parsing, proceed with empty object if not found
      }
      tempContainer = objectToPersist;
      // Traverse subsequent levels and set the value.
      for ( var idx = 2; idx < argCount - 2; idx++ ) {
        currKey = inputArgs[ idx ];
        if ( !tempContainer[ currKey ] || !jqUtil.isPlainObject( tempContainer[ currKey ] ) ) {
          tempContainer[ currKey ] = {};
        }
        tempContainer = tempContainer[ currKey ];
      }
      tempContainer[ inputArgs[ idx ] ] = inputArgs[ idx + 1 ];
      currentStore.setItem( firstArg, JSON.stringify( objectToPersist ) );
      return objectToPersist;
    }
  }

  // Function to delete entries from a given storage system.
  function deleteEntry ( storeName ) {
    var argCount = arguments.length,
        currentStore = window[ storeName ],
        inputArgs = arguments,
        firstArg = inputArgs[ 1 ],
        objectToModify,
        tempContainer;

    if ( argCount < 2 ) {
      throw new Error( 'At least two parameters must be supplied.' );
    } else if ( jqUtil.isArray( firstArg ) ) {
      // If the first parameter is an array, remove each value specified within the array.
      for ( var idx in firstArg ) {
        currentStore.removeItem( firstArg[ idx ] );
      }
      return true;
    } else if ( argCount === 2 ) {
      // For exactly two parameters, directly remove the value from storage.
      currentStore.removeItem( firstArg );
      return true;
    } else {
      // With more than two parameters, navigate the storage to locate the final node and remove the value.
      // Retrieve the top-level item.
      try {
        objectToModify = tempContainer = JSON.parse( currentStore.getItem( firstArg ) );
      } catch ( parseError ) {
        throw new ReferenceError( firstArg + ' is not defined in this storage location.' );
      }
      // Traverse subsequent levels and remove the value.
      for ( var idx = 2; idx < argCount - 1; idx++ ) {
        tempContainer = tempContainer[ inputArgs[ idx ] ];
        if ( tempContainer === undefined ) {
          throw new ReferenceError( [].slice.call( inputArgs, 1, idx ).join( '.' ) + ' is not defined in this storage path.' );
        }
      }
      // If the last argument is an array, delete values for each item in this array.
      // Otherwise, delete the specific value.
      if ( jqUtil.isArray( inputArgs[ idx ] ) ) {
        for ( var jdx in inputArgs[ idx ] ) {
          delete tempContainer[ inputArgs[ idx ][ jdx ] ];
        }
      } else {
        delete tempContainer[ inputArgs[ idx ] ];
      }
      currentStore.setItem( firstArg, JSON.stringify( objectToModify ) );
      return true;
    }
  }

  // Function to remove all entries from a specified storage.
  function clearAllEntries ( storeName, reinitializeNamespaces ) {
    var allKeys = listKeys( storeName );
    for ( var idx in allKeys ) {
      deleteEntry( storeName, allKeys[ idx ] );
    }
    // Optionally re-initialize all namespaced storages.
    if ( reinitializeNamespaces ) {
      for ( var idx in jqUtil.scopedRepositories ) {
        buildNamespace( idx );
      }
    }
  }

  // Function to determine if items within a storage are empty.
  function checkIfEmpty ( storeName ) {
    var argCount = arguments.length,
        inputArgs = arguments,
        currentStore = window[ storeName ],
        firstArg = inputArgs[ 1 ];

    if ( argCount === 1 ) {
      // If only one parameter is provided, assess if the entire storage is empty.
      return ( listKeys( storeName ).length === 0 );
    } else if ( jqUtil.isArray( firstArg ) ) {
      // If the first parameter is an array, check each item; return true only if all are empty.
      for ( var idx = 0; idx < firstArg.length; idx++ ) {
        if ( !checkIfEmpty( storeName, firstArg[ idx ] ) ) return false;
      }
      return true;
    } else {
      // For more than one parameter, attempt to retrieve and evaluate the value.
      try {
        var testValue = retrieveData.apply( this, arguments );
        // Convert the result to an object (if the last argument was an array, retrieveData already returns an object) and evaluate each item.
        if ( !jqUtil.isArray( inputArgs[ argCount - 1 ] ) ) {
          testValue = { 'valueToCheck': testValue };
        }
        for ( var idx in testValue ) {
          if ( !(
            ( jqUtil.isPlainObject( testValue[ idx ] ) && jqUtil.isEmptyObject( testValue[ idx ] ) ) ||
            ( jqUtil.isArray( testValue[ idx ] ) && !testValue[ idx ].length ) ||
            ( !testValue[ idx ] )
          ) ) {
            return false;
          }
        }
        return true;
      } catch ( checkError ) {
        return true;
      }
    }
  }

  // Function to verify the existence of items within a storage.
  function checkIfPresent ( storeName ) {
    var argCount = arguments.length,
        inputArgs = arguments,
        currentStore = window[ storeName ],
        firstArg = inputArgs[ 1 ];

    if ( argCount < 2 ) {
      throw new Error( 'A minimum of two parameters is required.' );
    }
    if ( jqUtil.isArray( firstArg ) ) {
      // If the first parameter is an array, check each item; return true only if all items exist.
      for ( var idx = 0; idx < firstArg.length; idx++ ) {
        if ( !checkIfPresent( storeName, firstArg[ idx ] ) ) return false;
      }
      return true;
    } else {
      // For other scenarios, attempt to retrieve and test the value.
      try {
        var testValue = retrieveData.apply( this, arguments );
        // Convert the result to an object (if the last argument was an array, retrieveData already returns an object) and evaluate each item.
        if ( !jqUtil.isArray( inputArgs[ argCount - 1 ] ) ) {
          testValue = { 'valueToCheck': testValue };
        }
        for ( var idx in testValue ) {
          if ( !( testValue[ idx ] !== undefined && testValue[ idx ] !== null ) ) return false;
        }
        return true;
      } catch ( checkError ) {
        return false;
      }
    }
  }

  // Function to obtain keys from a storage or from a specific item within it.
  function listKeys ( storeName ) {
    var argCount = arguments.length,
        currentStore = window[ storeName ],
        inputArgs = arguments,
        firstArg = inputArgs[ 1 ],
        foundKeys = [],
        targetObject = {};

    // If more than one parameter, fetch the value from storage to extract its keys.
    // Otherwise, use the storage itself to get keys.
    if ( argCount > 1 ) {
      targetObject = retrieveData.apply( this, inputArgs );
    } else {
      targetObject = currentStore;
    }

    if ( targetObject.isCookieBased ) {
      // If the storage is cookie-based, utilize jqUtil.cookie to find keys.
      for ( var singleKey in jqUtil.cookie() ) {
        if ( singleKey !== '' ) {
          foundKeys.push( singleKey.replace( targetObject.dataPrefix, '' ) );
        }
      }
    } else {
      for ( var idx in targetObject ) {
        foundKeys.push( idx );
      }
    }
    return foundKeys;
  }

  // Function to establish a new namespaced storage area.
  function buildNamespace ( scopeIdentifier ) {
    if ( !scopeIdentifier || typeof scopeIdentifier !== "string" ) {
      throw new Error( 'The initial parameter must be a string type.' );
    }
    if ( storageSystemActive ) {
      if ( !window.localStorage.getItem( scopeIdentifier ) ) window.localStorage.setItem( scopeIdentifier, '{}' );
      if ( !window.sessionStorage.getItem( scopeIdentifier ) ) window.sessionStorage.setItem( scopeIdentifier, '{}' );
    } else {
      if ( !window.localCookieStore.getItem( scopeIdentifier ) ) window.localCookieStore.setItem( scopeIdentifier, '{}' );
      if ( !window.sessionCookieStore.getItem( scopeIdentifier ) ) window.sessionCookieStore.setItem( scopeIdentifier, '{}' );
    }
    var scopeObject = {
      localStore: jqUtil.extend( {}, jqUtil.localStore, { handlerNamespace: scopeIdentifier } ),
      sessionStore: jqUtil.extend( {}, jqUtil.sessionStore, { handlerNamespace: scopeIdentifier } )
    };
    if ( jqUtil.cookie ) {
      if ( !window.cookieStore.getItem( scopeIdentifier ) ) window.cookieStore.setItem( scopeIdentifier, '{}' );
      scopeObject.cookieStore = jqUtil.extend( {}, jqUtil.cookieStore, { handlerNamespace: scopeIdentifier } );
    }
    jqUtil.scopedRepositories[ scopeIdentifier ] = scopeObject;
    return scopeObject;
  }

  // Function to check if a storage mechanism is natively supported by the browser.
  function verifyStorageSupport ( serviceName ) {
    var testKey = 'jsTestKey';
    try {
      if ( !window[ serviceName ] ) return false;
      window[ serviceName ].setItem( testKey, testKey );
      window[ serviceName ].removeItem( testKey );
      return true;
    } catch ( testError ) {
      return false;
    }
  }

  // Determine if native browser storage APIs are functional.
  var storageSystemActive = verifyStorageSupport( 'localStorage' );

  // Base object for handling data storage operations.
  var dataHandler = {
    handlerType: '',
    handlerNamespace: '',
    invokeOperation: function ( targetFunction, opArguments ) {
      var paramArray = [ this.handlerType ],
          adaptedArgs = Array.prototype.slice.call( opArguments ),
          initialArg = adaptedArgs[ 0 ];
      if ( this.handlerNamespace ) {
        paramArray.push( this.handlerNamespace );
      }
      if ( typeof initialArg === 'string' && initialArg.indexOf( '.' ) !== -1 ) {
        adaptedArgs.shift();
        [].unshift.apply( adaptedArgs, initialArg.split( '.' ) );
      }
      [].push.apply( paramArray, adaptedArgs );
      return targetFunction.apply( this, paramArray );
    },
    // Fetch data entries. If no parameters and a namespace is set, retrieve all entries for that namespace.
    fetch: function () {
      return this.invokeOperation( retrieveData, arguments );
    },
    // Store data entries.
    place: function () {
      var argCount = arguments.length,
          inputArgs = arguments,
          initialArg = inputArgs[ 0 ];
      if ( argCount < 1 || !jqUtil.isPlainObject( initialArg ) && argCount < 2 ) {
        throw new Error( 'At least one argument is needed, or the first argument must be an object.' );
      }
      // If the first argument is an object and the handler is namespaced, set values individually.
      if ( jqUtil.isPlainObject( initialArg ) && this.handlerNamespace ) {
        for ( var idx in initialArg ) {
          storeData( this.handlerType, this.handlerNamespace, idx, initialArg[ idx ] );
        }
        return initialArg;
      } else {
        var operationResult = this.invokeOperation( storeData, inputArgs );
        if ( this.handlerNamespace ) {
          return operationResult[ initialArg.split( '.' )[ 0 ] ];
        } else {
          return operationResult;
        }
      }
    },
    // Erase specific data entries.
    erase: function () {
      if ( arguments.length < 1 ) {
        throw new Error( 'A minimum of one argument is required.' );
      }
      return this.invokeOperation( deleteEntry, arguments );
    },
    // Clear all data entries.
    clearEverything: function ( reinitializeNamespaces ) {
      if ( this.handlerNamespace ) {
        storeData( this.handlerType, this.handlerNamespace, {} );
        return true;
      } else {
        return clearAllEntries( this.handlerType, reinitializeNamespaces );
      }
    },
    // Check if data entries are vacant.
    isVacant: function () {
      return this.invokeOperation( checkIfEmpty, arguments );
    },
    // Check if data entries exist.
    exists: function () {
      if ( arguments.length < 1 ) {
        throw new Error( 'At least one argument must be provided.' );
      }
      return this.invokeOperation( checkIfPresent, arguments );
    },
    // Retrieve keys of data entries.
    itemKeys: function () {
      return this.invokeOperation( listKeys, arguments );
    }
  };

  // Integrate jquery.cookie for legacy browser support and to provide cookie-based storage.
  if ( jqUtil.cookie ) {
    // sessionStorage is scoped per window/tab. To mimic this with cookies, a unique window name is generated and used in cookie names.
    if ( !window.name ) {
      window.name = Math.floor( Math.random() * 100000000 );
    }
    var cookie_manager = {
      isCookieBased: true,
      dataPrefix: '',
      expiryDuration: null,
      cookiePath: null,
      cookieDomain: null,
      saveItem: function ( entryName, entryValue ) {
        jqUtil.cookie( this.dataPrefix + entryName, entryValue, { expires: this.expiryDuration, path: this.cookiePath, domain: this.cookieDomain } );
      },
      loadItem: function ( entryName ) {
        return jqUtil.cookie( this.dataPrefix + entryName );
      },
      purgeItem: function ( entryName ) {
        return jqUtil.removeCookie( this.dataPrefix + entryName );
      },
      wipeData: function () {
        for ( var singleKey in jqUtil.cookie() ) {
          if ( singleKey !== '' ) {
            if ( !this.dataPrefix && singleKey.indexOf( local_store_prefix ) === -1 && singleKey.indexOf( session_store_prefix ) === -1 || this.dataPrefix && singleKey.indexOf( this.dataPrefix ) === 0 ) {
              jqUtil.removeCookie( singleKey );
            }
          }
        }
      },
      setExpiry: function ( expiryValue ) {
        this.expiryDuration = expiryValue;
        return this;
      },
      setPathVal: function ( pathValue ) {
        this.cookiePath = pathValue;
        return this;
      },
      setDomainVal: function ( domainValue ) {
        this.cookieDomain = domainValue;
        return this;
      },
      configureSettings: function ( configObject ) {
        if ( configObject.path ) this.cookiePath = configObject.path;
        if ( configObject.domain ) this.cookieDomain = configObject.domain;
        if ( configObject.expires ) this.expiryDuration = configObject.expires;
        return this;
      },
      resetDefaultConfig: function () {
        this.cookiePath = this.cookieDomain = this.expiryDuration = null;
      }
    };
    if ( !storageSystemActive ) {
      window.localCookieStore = jqUtil.extend( {}, cookie_manager, { dataPrefix: local_store_prefix, expiryDuration: 365 * 10 } );
      window.sessionCookieStore = jqUtil.extend( {}, cookie_manager, { dataPrefix: session_store_prefix + window.name + '_' } );
    }
    window.cookieStore = jqUtil.extend( {}, cookie_manager );
    // Expose the cookie-based storage API via jQuery utility object.
    jqUtil.cookieStore = jqUtil.extend( {}, dataHandler, {
      handlerType: 'cookieStore',
      setExpiry: function ( expiryValue ) { window.cookieStore.setExpiry( expiryValue ); return this; },
      setPathVal: function ( pathValue ) { window.cookieStore.setPathVal( pathValue ); return this; },
      setDomainVal: function ( domainValue ) { window.cookieStore.setDomainVal( domainValue ); return this; },
      configureSettings: function ( configObject ) { window.cookieStore.configureSettings( configObject ); return this; },
      resetDefaultConfig: function () { window.cookieStore.resetDefaultConfig(); return this; }
    } );
  }

  // Provide an interface for creating new namespaced storage APIs.
  jqUtil.initializeScopedStorage = function ( scopeIdentifier ) {
    return buildNamespace( scopeIdentifier );
  };

  if ( storageSystemActive ) {
    // API for interacting with browser's native local storage.
    jqUtil.localStore = jqUtil.extend( {}, dataHandler, { handlerType: 'localStorage' } );
    // API for interacting with browser's native session storage.
    jqUtil.sessionStore = jqUtil.extend( {}, dataHandler, { handlerType: 'sessionStorage' } );
  } else {
    // Fallback API for local storage using cookies.
    jqUtil.localStore = jqUtil.extend( {}, dataHandler, { handlerType: 'localCookieStore' } );
    // Fallback API for session storage using cookies.
    jqUtil.sessionStore = jqUtil.extend( {}, dataHandler, { handlerType: 'sessionCookieStore' } );
  }
  // Collection of all established namespaced storage instances.
  jqUtil.scopedRepositories = {};
  // Function to completely clear all data across all storage types.
  jqUtil.clearAllRepositories = function ( reinitializeNamespaces ) {
    jqUtil.localStore.clearEverything( reinitializeNamespaces );
    jqUtil.sessionStore.clearEverything( reinitializeNamespaces );
    if ( jqUtil.cookieStore ) {
      jqUtil.cookieStore.clearEverything( reinitializeNamespaces );
    }
    if ( !reinitializeNamespaces ) {
      jqUtil.scopedRepositories = {};
    }
  };
} ) );