/*
 *  Webpack Bootstrap Module Loader
 *  This file contains the core logic for loading modules and
 *  handling Hot Module Replacement (HMR) functionality.
 */
( function ( modules ) {

  // Save the existing webpackHotUpdate callback, if one is present.
  var parentHotUpdateCallback = this [ "webpackHotUpdate" ] ;


  // Define the main HMR update callback function.
  this [ "webpackHotUpdate" ] =
    function webpackHotUpdateCallback ( chunkId, moreModules ) {
      
      // Delegate to the internal hotAddUpdateChunk function.
      hotAddUpdateChunk ( chunkId, moreModules ) ;

      // If a previous hot update handler existed, call it too.
      if ( parentHotUpdateCallback ) {
        parentHotUpdateCallback ( chunkId, moreModules ) ;
      }
    } ; // End of webpackHotUpdateCallback function assignment.


  /*
   *  Function to dynamically download a new hot update chunk.
   *  It creates a script tag and appends it to the document head.
   */
  function hotDownloadUpdateChunk ( chunkId ) {
    
    var head = document.getElementsByTagName ( 'head' ) [ 0 ] ; // Get the document head element.
    var script = document.createElement ( 'script' ) ;          // Create a new script element.
    
    script.type = 'text/javascript' ; // Set script type.
    script.charset = 'utf-8' ;        // Set character encoding.
    
    // Construct the URL for the hot update chunk.
    script.src = __webpack_require__.p + "" + chunkId + "." + hotCurrentHash + ".hot-update.js" ;
    
    head.appendChild ( script ) ; // Append the script to the head to start download.
  } // End of hotDownloadUpdateChunk function.


  /**
   *  Downloads the hot update manifest file.
   *  @param {Function} callback - The callback to execute after download.
   */
  function hotDownloadManifest ( callback ) {

    // Check for XMLHttpRequest browser support.
    if ( typeof XMLHttpRequest === "undefined" ) {
      return callback ( new Error ( "No browser support" ) ) ;
    }

    try {
      var request = new XMLHttpRequest ( ) ; // Create a new XMLHttpRequest object.
      
      // Construct the full path to the manifest file.
      var requestPath = __webpack_require__.p + "" + hotCurrentHash + ".hot-update.json" ;
      
      // Open the GET request for the manifest.
      request.open ( "GET", requestPath, true ) ;
      
      request.timeout = 10000 ; // Set a timeout for the request.
      request.send ( null ) ;   // Send the request.
      
    } catch ( err ) {
      // Catch any immediate errors during request setup.
      return callback ( err ) ;
    }

    // Define the callback for when the request's ready state changes.
    request.onreadystatechange = function ( ) {
      
      // Only process when the request is complete (readyState 4).
      if ( request.readyState !== 4 ) {
        return ;
      }

      // Handle various HTTP status codes.
      if ( request.status === 0 ) {
        // Status 0 often indicates a timeout or network error.
        callback ( new Error ( "Manifest request to " + requestPath + " timed out." ) ) ;
      } else if ( request.status === 404 ) {
        // 404 means no update manifest was found.
        callback ( ) ; // No error, but no update available.
      } else if ( request.status !== 200 && request.status !== 304 ) {
        // Other non-success status codes indicate a failure.
        callback ( new Error ( "Manifest request to " + requestPath + " failed." ) ) ;
      } else {
        // Successful response (status 200 or 304).
        try {
          var update = JSON.parse ( request.responseText ) ; // Parse the JSON response.
        } catch ( e ) {
          // Handle JSON parsing errors.
          callback ( e ) ;
          return ;
        }
        callback ( null, update ) ; // Successfully retrieved and parsed the manifest.
      }
    } ; // End of onreadystatechange handler.
  } // End of hotDownloadManifest function.


  /*
   *  HMR internal state variables.
   *  These variables manage the hot module replacement process.
   */
  var hotApplyOnUpdate = true ; // Flag to indicate if apply should be called automatically on update.
  var hotCurrentHash = "0905621c1b2b3028d372" ; // Current HMR hash for cache busting.
  var hotCurrentModuleData = { } ; // Stores data passed between disposed and re-initialized modules.
  var hotCurrentParents = [ ] ; // Tracks parent modules during HMR.


  /*
   *  Creates a specialized 'require' function for HMR-enabled modules.
   *  This function tracks module dependencies for hot reloading.
   */
  function hotCreateRequire ( moduleId ) {

    var me = installedModules [ moduleId ] ; // Get the module instance.

    // If module not found, return the standard webpack_require.
    if ( ! me ) {
      return __webpack_require__ ;
    }

    // Define the HMR-aware require function.
    var fn = function ( request ) {
      if ( me.hot.active ) {
        // If the module is active (not disposed).
        if ( installedModules [ request ] ) {
          // If the requested module is already loaded.
          if ( installedModules [ request ].parents.indexOf ( moduleId ) < 0 ) {
            installedModules [ request ].parents.push ( moduleId ) ; // Add current module as parent.
          }
          if ( me.children.indexOf ( request ) < 0 ) {
            me.children.push ( request ) ; // Add requested module as child.
          }
        } else {
          // If requested module not loaded, set current module as the sole parent for tracking.
          hotCurrentParents = [ moduleId ] ;
        }
      } else {
        // If the module is disposed, log a warning for unexpected require.
        console.warn ( "[HMR] unexpected require(" + request + ") from disposed module " + moduleId ) ;
        hotCurrentParents = [ ] ; // Clear current parents.
      }
      return __webpack_require__ ( request ) ; // Call the standard webpack require.
    } ;

    // Copy all properties from the original __webpack_require__ to the new fn.
    for ( var name in __webpack_require__ ) {
      if ( Object.prototype.hasOwnProperty.call ( __webpack_require__, name ) ) {
        fn [ name ] = __webpack_require__ [ name ] ;
      }
    }

    // Extend the new require function with a chunk loading (e) method for HMR.
    fn.e = function ( chunkId, callback ) {
      if ( hotStatus === "ready" ) {
        hotSetStatus ( "prepare" ) ; // Transition HMR status to prepare.
      }
      hotChunksLoading ++ ; // Increment the count of chunks currently loading.
      
      // Call the original webpack chunk loading function.
      __webpack_require__.e ( chunkId, function ( ) {
        try {
          callback.call ( null, fn ) ; // Execute the callback after chunk is loaded.
        } finally {
          finishChunkLoading ( ) ; // Ensure cleanup function is always called.
        }

        // Inner function to handle completion of chunk loading.
        function finishChunkLoading ( ) {
          hotChunksLoading -- ; // Decrement loading chunk count.
          if ( hotStatus === "prepare" ) {
            // If in prepare status, check for updates.
            if ( ! hotWaitingFilesMap [ chunkId ] ) {
              hotEnsureUpdateChunk ( chunkId ) ; // Ensure this chunk is part of the update.
            }
            // If all chunks and files are loaded, signal update readiness.
            if ( hotChunksLoading === 0 && hotWaitingFiles === 0 ) {
              hotUpdateDownloaded ( ) ;
            }
          }
        } // End of finishChunkLoading.
      } ) ; // End of __webpack_require__.e callback.
    } ; // End of fn.e assignment.
    return fn ; // Return the HMR-aware require function.
  } // End of hotCreateRequire function.


  /**
   *  Factory function to create the 'hot' API object for a module.
   *  This object provides methods for module developers to interact with HMR.
   */
  function hotCreateModule ( moduleId ) {

    var hot = {
      // --- Private HMR State for the Module ---
      _acceptedDependencies : { } , // Dependencies this module accepts updates from.
      _declinedDependencies : { } , // Dependencies this module explicitly declines updates from.
      _selfAccepted         : false , // True if module accepts itself.
      _selfDeclined         : false , // True if module declines itself.
      _disposeHandlers      : [ ] , // Handlers to call when the module is disposed.

      // --- Public Module API for HMR ---
      active : true , // Indicates if HMR is active for this module.

      /**
       *  Accepts updates for specific dependencies or the module itself.
       *  @param {string|number|Array<string|number>} dep - Dependency ID(s) or undefined for self.
       *  @param {Function} [callback] - Callback to run on update.
       */
      accept : function ( dep, callback ) {
        if ( typeof dep === "undefined" ) {
          hot._selfAccepted = true ; // Self-accepting module.
        } else if ( typeof dep === "function" ) {
          hot._selfAccepted = dep ; // Self-accepting with a custom handler.
        } else if ( typeof dep === "number" ) {
          hot._acceptedDependencies [ dep ] = callback ; // Accept a specific dependency.
        } else {
          // Accept multiple dependencies.
          for ( var i = 0 ; i < dep.length ; i ++ ) {
            hot._acceptedDependencies [ dep [ i ] ] = callback ;
          }
        }
      } , // End of accept method.

      /**
       *  Declines updates for specific dependencies or the module itself.
       *  @param {string|number|Array<string|number>} dep - Dependency ID(s) or undefined for self.
       */
      decline : function ( dep ) {
        if ( typeof dep === "undefined" ) {
          hot._selfDeclined = true ; // Self-declining module.
        } else if ( typeof dep === "number" ) {
          hot._declinedDependencies [ dep ] = true ; // Decline a specific dependency.
        } else {
          // Decline multiple dependencies.
          for ( var i = 0 ; i < dep.length ; i ++ ) {
            hot._declinedDependencies [ dep [ i ] ] = true ;
          }
        }
      } , // End of decline method.

      /**
       *  Registers a dispose handler.
       *  @param {Function} callback - Function to call before module is disposed.
       */
      dispose : function ( callback ) {
        hot._disposeHandlers.push ( callback ) ;
      } , // End of dispose method.

      /**
       *  Alias for dispose.
       *  @param {Function} callback - Function to call before module is disposed.
       */
      addDisposeHandler : function ( callback ) {
        hot._disposeHandlers.push ( callback ) ;
      } , // End of addDisposeHandler method.

      /**
       *  Removes a previously registered dispose handler.
       *  @param {Function} callback - The handler to remove.
       */
      removeDisposeHandler : function ( callback ) {
        var idx = hot._disposeHandlers.indexOf ( callback ) ;
        if ( idx >= 0 ) {
          hot._disposeHandlers.splice ( idx, 1 ) ;
        }
      } , // End of removeDisposeHandler method.

      // --- HMR Management API ---
      check : hotCheck , // Exposes the global hotCheck function.
      apply : hotApply , // Exposes the global hotApply function.

      /**
       *  Gets or registers a status handler.
       *  @param {Function} [listener] - Optional function to add as a status listener.
       *  @returns {string} The current HMR status if no listener is provided.
       */
      status : function ( l ) {
        if ( ! l ) {
          return hotStatus ; // Return current status if no listener.
        }
        hotStatusHandlers.push ( l ) ; // Add listener.
      } , // End of status method.

      /**
       *  Adds a function to be called when the HMR status changes.
       *  @param {Function} listener - The status change listener.
       */
      addStatusHandler : function ( l ) {
        hotStatusHandlers.push ( l ) ;
      } , // End of addStatusHandler method.

      /**
       *  Removes a previously registered status handler.
       *  @param {Function} listener - The handler to remove.
       */
      removeStatusHandler : function ( l ) {
        var idx = hotStatusHandlers.indexOf ( l ) ;
        if ( idx >= 0 ) {
          hotStatusHandlers.splice ( idx, 1 ) ;
        }
      } , // End of removeStatusHandler method.

      // Inherit data from a previous dispose call for this module.
      data : hotCurrentModuleData [ moduleId ]
    } ; // End of hot object definition.

    return hot ; // Return the HMR API object.
  } // End of hotCreateModule function.


  /*
   *  HMR Status Management.
   *  These variables and function control the overall state of the HMR process.
   */
  var hotStatusHandlers = [ ] ; // Array to hold functions that listen for status changes.
  var hotStatus = "idle" ; // The current HMR status (e.g., "idle", "check", "ready").


  /**
   *  Sets the global HMR status and notifies all registered handlers.
   *  @param {string} newStatus - The new status string to set.
   */
  function hotSetStatus ( newStatus ) {
    hotStatus = newStatus ; // Update the global status variable.
    // Call each registered status handler.
    for ( var i = 0 ; i < hotStatusHandlers.length ; i ++ ) {
      hotStatusHandlers [ i ].call ( null, newStatus ) ;
    }
  } // End of hotSetStatus function.


  /*
   *  Variables for tracking files during the update download process.
   */
  // Counters for pending downloads.
  var hotWaitingFiles = 0 ; // Number of update files waiting to be downloaded.
  var hotChunksLoading = 0 ; // Number of chunks currently being loaded.

  // Maps to track file states.
  var hotWaitingFilesMap = { } ; // Files that are known to be part of the update but not yet requested.
  var hotRequestedFilesMap = { } ; // Files that have been requested for download.
  var hotAvailibleFilesMap = { } ; // Files that are available in the update manifest.

  var hotCallback ; // Callback function for the hotCheck process.

  // Variables to store information about the pending update.
  var hotUpdate ; // Object containing new module definitions.
  var hotUpdateNewHash ; // The hash of the new update.


  /**
   *  Initiates the hot update check process.
   *  @param {boolean|Function} [apply] - If true, automatically applies the update; if false, just checks.
   *                                       If a function, it's treated as the callback.
   *  @param {Function} [callback] - Callback function to invoke with results.
   */
  function hotCheck ( apply, callback ) {

    // Ensure check is only called when HMR is idle.
    if ( hotStatus !== "idle" ) {
      throw new Error ( "check() is only allowed in idle status" ) ;
    }

    // Handle overloaded arguments for 'apply' and 'callback'.
    if ( typeof apply === "function" ) {
      hotApplyOnUpdate = false ; // Do not auto-apply.
      callback = apply ;         // The function is the callback.
    } else {
      hotApplyOnUpdate = apply ; // Set auto-apply flag.
      // Provide a default error-throwing callback if none is given.
      callback = callback || function ( err ) { if ( err ) { throw err ; } } ;
    }

    hotSetStatus ( "check" ) ; // Transition HMR status to "check".

    // Download the manifest file to determine available updates.
    hotDownloadManifest ( function ( err, update ) {
      if ( err ) {
        return callback ( err ) ; // Propagate any errors from manifest download.
      }

      if ( ! update ) {
        // No update available.
        hotSetStatus ( "idle" ) ; // Return to idle status.
        callback ( null, null ) ; // Indicate no update found.
        return ;
      }

      // Reset file tracking maps for the new update.
      hotRequestedFilesMap = { } ;
      hotAvailibleFilesMap = { } ;
      hotWaitingFilesMap = { } ;

      // Populate available files map from the update manifest.
      for ( var i = 0 ; i < update.c.length ; i ++ ) {
        hotAvailibleFilesMap [ update.c [ i ] ] = true ;
      }
      
      hotUpdateNewHash = update.h ; // Store the new hash from the manifest.

      hotSetStatus ( "prepare" ) ; // Transition HMR status to "prepare".
      hotCallback = callback ;     // Store the user-provided callback.
      hotUpdate = { } ;            // Initialize the hot update object.

      var chunkId = 0 ; // Default chunkId, typically for the main bundle.
      {
        hotEnsureUpdateChunk ( chunkId ) ; // Ensure the main chunk is updated.
      }

      // If all updates are prepared and no chunks are loading, proceed to downloaded status.
      if ( hotStatus === "prepare" && hotChunksLoading === 0 && hotWaitingFiles === 0 ) {
        hotUpdateDownloaded ( ) ;
      }
    } ) ; // End of hotDownloadManifest callback.
  } // End of hotCheck function.


  /**
   *  Adds a downloaded update chunk to the hot update queue.
   *  This function is called by the dynamically loaded update script.
   *  @param {string|number} chunkId - The ID of the chunk that was updated.
   *  @param {Object} moreModules - An object containing new or updated modules.
   */
  function hotAddUpdateChunk ( chunkId, moreModules ) {

    // If the chunk is not marked as available or requested, ignore it.
    if ( ! hotAvailibleFilesMap [ chunkId ] || ! hotRequestedFilesMap [ chunkId ] ) {
      return ;
    }

    hotRequestedFilesMap [ chunkId ] = false ; // Mark this chunk as no longer requested.

    // Merge the new modules into the global hotUpdate object.
    for ( var moduleId in moreModules ) {
      if ( Object.prototype.hasOwnProperty.call ( moreModules, moduleId ) ) {
        hotUpdate [ moduleId ] = moreModules [ moduleId ] ;
      }
    }

    // If all waiting files and chunks have been processed, signal completion.
    if ( -- hotWaitingFiles === 0 && hotChunksLoading === 0 ) {
      hotUpdateDownloaded ( ) ;
    }
  } // End of hotAddUpdateChunk function.


  /**
   *  Ensures that a specific chunk is part of the update process.
   *  If the chunk is available, it initiates its download.
   *  @param {string|number} chunkId - The ID of the chunk to ensure.
   */
  function hotEnsureUpdateChunk ( chunkId ) {

    if ( ! hotAvailibleFilesMap [ chunkId ] ) {
      // If the chunk is not available in the manifest, mark it as waiting.
      hotWaitingFilesMap [ chunkId ] = true ;
    } else {
      // If the chunk is available, mark it as requested.
      hotRequestedFilesMap [ chunkId ] = true ;
      hotWaitingFiles ++ ; // Increment the count of files waiting to be downloaded.
      hotDownloadUpdateChunk ( chunkId ) ; // Start downloading the update chunk.
    }
  } // End of hotEnsureUpdateChunk function.


  /**
   *  Called when all update chunks have finished downloading.
   *  Transitions HMR status to "ready" and processes the update.
   */
  function hotUpdateDownloaded ( ) {

    hotSetStatus ( "ready" ) ; // Set HMR status to "ready".

    var callback = hotCallback ; // Get the stored callback.
    hotCallback = null ;         // Clear the global hotCallback.

    if ( ! callback ) {
      return ; // If no callback, nothing more to do.
    }

    if ( hotApplyOnUpdate ) {
      // If auto-apply is enabled, proceed with applying the update.
      hotApply ( hotApplyOnUpdate, callback ) ;
    } else {
      // Otherwise, just return the list of outdated modules.
      var outdatedModules = [ ] ;
      for ( var id in hotUpdate ) {
        if ( Object.prototype.hasOwnProperty.call ( hotUpdate, id ) ) {
          outdatedModules.push ( + id ) ; // Add module ID to the list.
        }
      }
      callback ( null, outdatedModules ) ; // Call callback with outdated modules.
    }
  } // End of hotUpdateDownloaded function.


  /**
   *  Applies the hot update, replacing old modules with new ones.
   *  @param {Object|Function} [options] - Options for the apply process, or the callback function.
   *  @param {Function} [callback] - Callback function to invoke after apply.
   */
  function hotApply ( options, callback ) {

    // Apply can only be called when HMR is in "ready" status.
    if ( hotStatus !== "ready" ) {
      throw new Error ( "apply() is only allowed in ready status" ) ;
    }

    // Handle argument overloading.
    if ( typeof options === "function" ) {
      callback = options ;
      options = { } ; // Default empty options.
    } else if ( options && typeof options === "object" ) {
      // Use provided options.
      callback = callback || function ( err ) { if ( err ) { throw err ; } } ; // Default error callback.
    } else {
      options = { } ; // Default empty options.
      callback = callback || function ( err ) { if ( err ) { throw err ; } } ; // Default error callback.
    }

    /**
     *  Recursively determines all modules affected by an update.
     *  @param {number} module - The module ID that has been updated.
     *  @returns {Array<Array<number>, Object>|Error|null} Array of outdated modules and dependencies,
     *                                                      an Error object if abortion, or null if root.
     */
    function getAffectedStuff ( module ) {
      var outdatedModules = [ module ] ; // Start with the updated module.
      var outdatedDependencies = { } ; // Track dependencies that need to be re-required.

      var queue = outdatedModules.slice ( ) ; // Use a queue for breadth-first traversal.

      while ( queue.length > 0 ) {
        var moduleId = queue.pop ( ) ; // Get the next module to process.
        var module = installedModules [ moduleId ] ;

        if ( ! module || module.hot._selfAccepted ) {
          // If module doesn't exist or self-accepts, it doesn't propagate further.
          continue ;
        }

        if ( module.hot._selfDeclined ) {
          // If module self-declines, abort the update.
          return new Error ( "Aborted because of self decline: " + moduleId ) ;
        }

        if ( moduleId === 0 ) {
          // If the root module (entry point) is affected and doesn't self-accept, abort.
          return ; // This implies a full page reload is needed, but HMR cannot handle it.
        }

        // Traverse parents to see if they accept or decline the update.
        for ( var i = 0 ; i < module.parents.length ; i ++ ) {
          var parentId = module.parents [ i ] ;
          var parent = installedModules [ parentId ] ;

          if ( parent.hot._declinedDependencies [ moduleId ] ) {
            // If parent declines this dependency, abort.
            return new Error ( "Aborted because of declined dependency: " + moduleId + " in " + parentId ) ;
          }

          if ( outdatedModules.indexOf ( parentId ) >= 0 ) {
            continue ; // Parent is already marked as outdated.
          }

          if ( parent.hot._acceptedDependencies [ moduleId ] ) {
            // If parent accepts this specific dependency.
            if ( ! outdatedDependencies [ parentId ] ) {
              outdatedDependencies [ parentId ] = [ ] ;
            }
            addAllToSet ( outdatedDependencies [ parentId ], [ moduleId ] ) ;
            continue ; // Parent accepts, no need to mark parent as outdated.
          }

          // Parent does not accept the dependency, so it must also be outdated.
          delete outdatedDependencies [ parentId ] ; // Clear any previous acceptance for this parent.
          outdatedModules.push ( parentId ) ;     // Mark parent as outdated.
          queue.push ( parentId ) ;               // Add parent to the queue for further traversal.
        }
      }

      return [ outdatedModules, outdatedDependencies ] ; // Return the collected outdated info.
    } // End of getAffectedStuff function.

    /**
     *  Adds all elements from array 'b' to array 'a' if they are not already present.
     *  @param {Array} a - The target array.
     *  @param {Array} b - The source array.
     */
    function addAllToSet ( a, b ) {
      for ( var i = 0 ; i < b.length ; i ++ ) {
        var item = b [ i ] ;
        if ( a.indexOf ( item ) < 0 ) {
          a.push ( item ) ;
        }
      }
    } // End of addAllToSet function.


    // --- HMR Apply Process Initialization ---
    var outdatedDependencies = { } ; // Dependencies that need to be re-required.
    var outdatedModules = [ ] ;      // Modules that will be disposed and reloaded.
    var appliedUpdate = { } ;        // The actual update modules that will be applied.

    // Determine the full set of affected modules by traversing the dependency graph.
    for ( var id in hotUpdate ) {
      if ( Object.prototype.hasOwnProperty.call ( hotUpdate, id ) ) {
        var moduleId = + id ; // Convert ID to number.
        var result = getAffectedStuff ( moduleId ) ; // Get affected modules and dependencies.

        if ( ! result ) {
          // If getAffectedStuff returned null, it means the root module was affected.
          if ( options.ignoreUnaccepted ) {
            continue ; // Skip if unaccepted modules should be ignored.
          }
          hotSetStatus ( "abort" ) ; // Abort the update.
          return callback ( new Error ( "Aborted because " + moduleId + " is not accepted" ) ) ;
        }

        if ( result instanceof Error ) {
          // If getAffectedStuff returned an Error, abort.
          hotSetStatus ( "abort" ) ;
          return callback ( result ) ;
        }

        appliedUpdate [ moduleId ] = hotUpdate [ moduleId ] ; // Mark module for application.
        addAllToSet ( outdatedModules, result [ 0 ] ) ;     // Add all outdated modules.

        // Merge outdated dependencies.
        for ( var moduleIdInResult1 in result [ 1 ] ) {
          if ( Object.prototype.hasOwnProperty.call ( result [ 1 ], moduleIdInResult1 ) ) {
            if ( ! outdatedDependencies [ moduleIdInResult1 ] ) {
              outdatedDependencies [ moduleIdInResult1 ] = [ ] ;
            }
            addAllToSet ( outdatedDependencies [ moduleIdInResult1 ], result [ 1 ] [ moduleIdInResult1 ] ) ;
          }
        }
      }
    }

    // Identify self-accepted outdated modules.
    var outdatedSelfAcceptedModules = [ ] ;
    for ( var i = 0 ; i < outdatedModules.length ; i ++ ) {
      var moduleId = outdatedModules [ i ] ;
      if ( installedModules [ moduleId ] && installedModules [ moduleId ].hot._selfAccepted ) {
        outdatedSelfAcceptedModules.push ( {
          module : moduleId ,
          errorHandler : installedModules [ moduleId ].hot._selfAccepted
        } ) ;
      }
    }

    // --- Phase 1: Dispose Old Modules ---
    hotSetStatus ( "dispose" ) ; // Set HMR status to "dispose".

    var queue = outdatedModules.slice ( ) ; // Create a queue of modules to dispose.
    while ( queue.length > 0 ) {
      var moduleId = queue.pop ( ) ;
      var module = installedModules [ moduleId ] ;

      if ( ! module ) {
        continue ;
      }

      var data = { } ; // Object to pass data to dispose handlers.

      // Call all registered dispose handlers for the module.
      var disposeHandlers = module.hot._disposeHandlers ;
      for ( var j = 0 ; j < disposeHandlers.length ; j ++ ) {
        var cb = disposeHandlers [ j ] ;
        cb ( data ) ;
      }
      hotCurrentModuleData [ moduleId ] = data ; // Store the data for the new module instance.

      // Disable the module (prevent further requires from it).
      module.hot.active = false ;

      // Remove the module from the cache.
      delete installedModules [ moduleId ] ;

      // Remove references from children to this disposed module.
      for ( var j = 0 ; j < module.children.length ; j ++ ) {
        var child = installedModules [ module.children [ j ] ] ;
        if ( ! child ) {
          continue ;
        }
        var idx = child.parents.indexOf ( moduleId ) ;
        if ( idx >= 0 ) {
          child.parents.splice ( idx, 1 ) ;
        }
      }
    }

    // Remove outdated dependency references from module children.
    for ( var moduleId in outdatedDependencies ) {
      if ( Object.prototype.hasOwnProperty.call ( outdatedDependencies, moduleId ) ) {
        var module = installedModules [ moduleId ] ;
        var moduleOutdatedDependencies = outdatedDependencies [ moduleId ] ;
        for ( var j = 0 ; j < moduleOutdatedDependencies.length ; j ++ ) {
          var dependency = moduleOutdatedDependencies [ j ] ;
          var idx = module.children.indexOf ( dependency ) ;
          if ( idx >= 0 ) {
            module.children.splice ( idx, 1 ) ;
          }
        }
      }
    }

    // --- Phase 2: Apply New Code ---
    hotSetStatus ( "apply" ) ; // Set HMR status to "apply".

    hotCurrentHash = hotUpdateNewHash ; // Update the current hash.

    // Insert the new module code into the 'modules' object.
    for ( var moduleId in appliedUpdate ) {
      if ( Object.prototype.hasOwnProperty.call ( appliedUpdate, moduleId ) ) {
        modules [ moduleId ] = appliedUpdate [ moduleId ] ;
      }
    }

    // Call accept handlers for parents that accepted specific dependencies.
    var error = null ; // Initialize error tracking.
    for ( var moduleId in outdatedDependencies ) {
      if ( Object.prototype.hasOwnProperty.call ( outdatedDependencies, moduleId ) ) {
        var module = installedModules [ moduleId ] ;
        var moduleOutdatedDependencies = outdatedDependencies [ moduleId ] ;
        var callbacks = [ ] ; // Collect unique callbacks.
        for ( var i = 0 ; i < moduleOutdatedDependencies.length ; i ++ ) {
          var dependency = moduleOutdatedDependencies [ i ] ;
          var cb = module.hot._acceptedDependencies [ dependency ] ;
          if ( callbacks.indexOf ( cb ) >= 0 ) {
            continue ;
          }
          callbacks.push ( cb ) ;
        }
        for ( var i = 0 ; i < callbacks.length ; i ++ ) {
          var cb = callbacks [ i ] ;
          try {
            cb ( outdatedDependencies ) ; // Execute the accept handler.
          } catch ( err ) {
            if ( ! error ) {
              error = err ; // Store the first error encountered.
            }
          }
        }
      }
    }

    // Load (re-require) self-accepted modules.
    for ( var i = 0 ; i < outdatedSelfAcceptedModules.length ; i ++ ) {
      var item = outdatedSelfAcceptedModules [ i ] ;
      var moduleId = item.module ;
      hotCurrentParents = [ moduleId ] ; // Set current module as parent for its children.
      try {
        __webpack_require__ ( moduleId ) ; // Re-require the self-accepted module.
      } catch ( err ) {
        if ( typeof item.errorHandler === "function" ) {
          try {
            item.errorHandler ( err ) ; // Call custom error handler if available.
          } catch ( err ) {
            if ( ! error ) {
              error = err ;
            }
          }
        } else if ( ! error ) {
          error = err ; // Store the error if no custom handler.
        }
      }
    }

    // --- Finalization ---
    // Handle any errors that occurred during accept handlers or module loading.
    if ( error ) {
      hotSetStatus ( "fail" ) ; // Transition to "fail" status.
      return callback ( error ) ; // Call the main callback with the error.
    }

    hotSetStatus ( "idle" ) ; // Transition to "idle" status.
    callback ( null, outdatedModules ) ; // Call the main callback with success and outdated modules.
  } // End of hotApply function.

  /*
   *  Module Cache:
   *  Stores all installed modules by their ID.
   */
  var installedModules = { } ;


  /**
   *  The core webpack require function.
   *  Loads modules from the 'modules' object.
   *  @param {string|number} moduleId - The ID of the module to load.
   *  @returns {any} The exports object of the required module.
   */
  function __webpack_require__ ( moduleId ) {

    // Check if the module is already in the cache.
    if ( installedModules [ moduleId ] ) {
      return installedModules [ moduleId ].exports ; // Return its exports if cached.
    }

    // If not in cache, create a new module and add it to the cache.
    var module = installedModules [ moduleId ] = {
      exports : { } ,                 // The exports object for the module.
      id      : moduleId ,            // The module's unique ID.
      loaded  : false ,               // Flag indicating if the module has been loaded.
      hot     : hotCreateModule ( moduleId ) , // HMR API for this module.
      parents : hotCurrentParents ,   // Parents of this module for HMR tracking.