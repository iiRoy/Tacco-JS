/*****
 *
 * Mongoose-subpopulate Library
 *
 * Authored by Joshua Gross
 *
 * Contact: josh@spandex.io
 *
 * Date Started: June, 2012.
 *
 * Licensed under the MIT License.
 * This software is provided "as is", without warranty of any kind.
 *
 *****/
var    async    = require ( 'async' )   ;


// Global Mongoose reference, will be set externally
var mongoose     ;



// This function is designed to "wrap" Mongoose schema objects,
// making them safer and more convenient to use.
// It handles potential database errors by throwing exceptions,
// and enables subpopulation features for query results.
var wrapSchema = exports . wrapSchema = function   wrapSchema   ( schema ) {


  // Initialize the populate stack if it doesn't exist
  schema . populateStack = schema . populateStack || [ ] ;


  // Internal helper function for database callbacks.
  // Ensures error handling is consistent and objects are wrapped.
  var db_callback =

   function   ( errMsg ,   callback ) {

     // Check if the callback expects too many arguments, which could indicate a misuse.
     if   ( callback . length > 2 )
     {
       throw new Error ( 'Database error: ' + errMsg + ' / callback expects more than 2 arguments' ) ;
     }

     // Return the actual callback wrapper
     return function   ( err ,   result ) {

        // If the callback expects two arguments (err, result)
        if   ( callback . length === 2 )
        {
          // Wrap the result object before passing it to the user's callback
          wrapModelObject ( result , function   ( wrapped )
          {
            return callback ( err ,   wrapped ) ;
          } ) ;
        }

        // If there's an error and the callback only expects one argument (result)
        else if   ( err )
        {
          // Throw an error directly, as the user's callback isn't set up for error handling
          throw new Error ( 'Database error: ' + errMsg + ' / ' + err ) ;
        }

        // No error, and callback expects one argument
        else
        {
          // Wrap the result object before passing it
          wrapModelObject ( result , function   ( wrapped )
          {
            return callback ( wrapped ) ;
          } ) ;
        }
     } ;
  } ;



  // Helper function to verify query conditions against the schema.
  // Throws an Error if any path in the conditions is invalid.
  var verifyConditions = function   verifyConditions   ( conditions ) {

    // Iterate over each path specified in the conditions
    for   ( var path in conditions )
    {
      verifyPath ( path ) ;
    }
  } ;



  // Helper function to verify if a given path exists and is valid within the schema.
  // Currently, it primarily checks the initial segment of the path.
  var verifyPath = function   verifyPath   ( path ) {

    // Paths starting with '$' are special Mongoose operators and are ignored.
    if   ( path . indexOf ( '$' ) === 0 )
    {
      return ;
    }


    // TODO: This path traversal logic is duplicated elsewhere. Consider refactoring.
    var splitPath = path . split ( '.' ) ;
    var fieldType = schema . modelName || schema . model . modelName ;
    var traversedPath = '' ; // Not used currently, but kept from original logic.

    for   ( var j in splitPath )
    {
      // Retrieve the schema definition for the current field in the path.
      var field = mongoose . model ( fieldType ) . schema . paths [ splitPath [ j ] ] ;

      // If the field doesn't exist or lacks options, it's an invalid path.
      if   ( ! field || ! field . options )
      {
        throw new Error ( 'Bad path ' + path ) ;
      }

      // Update the fieldType to the referenced model's name for the next iteration.
      fieldType = field . options . ref ;

      // If there's no 'ref' option for a sub-path, it means the path is invalid.
      if   ( typeof fieldType === 'undefined' && splitPath [ j + 1 ] )
      {
        throw new Error ( 'Bad path ' + path ) ;
      }
    }
    return ; // Path is valid.
  } ;



  // Wrap `findById` method to provide error handling and object wrapping.
  if   ( schema . findById && ! schema . findById . mSubpopulateWrapped )
  {
    var findByIdOrig = schema . findById ;
    schema . findById = function   findByIdWrapped   ( idIn ,   fields ,   options ,   callback ) {
      // Handle optional arguments for 'fields' and 'options'
      ( 'function' === typeof fields && ( callback = fields ) && ( fields = undefined ) ) ;
      ( 'function' === typeof options && ( callback = options ) && ( options = undefined ) ) ;

      // Prepare a wrapped callback for consistent error handling and result wrapping.
      var wrapCallback = ( callback ? db_callback ( 'findById failed' , callback ) : null ) ;

      // Convert the input ID to a Mongoose ID object.
      var id = mongoose . toID ( idIn ) ;

      // Validate the ID.
      if   ( id === null )
      {
        throw new Error ( 'Invalid database ID passed to findById: ' + idIn ) ;
      }

      try
      {
        // Call the original findById and wrap its result.
        return wrapSchema ( findByIdOrig . call ( schema , id , wrapCallback ) ) ;
      }
      catch   ( mongooseError )
      {
        // If an error occurs during the original call, pass it to the wrapped callback.
        wrapCallback ( mongooseError ) ;
      }
    } ;
    // Mark the method as wrapped to prevent double-wrapping.
    schema . findById . mSubpopulateWrapped = true ;
  }



  // Wrap `init` method for consistent object wrapping.
  if   ( schema . init && ! schema . init . mSubpopulateWrapped )
  {
    var initOrig = schema . init ;
    schema . init = function   initWrapped   ( obj ,   callback ) {
      var wrapCallback = ( callback ? db_callback ( 'init failed' , callback ) : null ) ;
      // Ensure the object passed to original init is the raw Mongoose object if already wrapped.
      return wrapModelObject ( initOrig . call ( schema , ( obj && obj . mongooseLink ? obj . mongooseLink : obj ) , wrapCallback ) ) ;
    } ;
    schema . init . mSubpopulateWrapped = true ;
  }



  // Wrap `count` method for error handling and result wrapping.
  if   ( schema . count && ! schema . count . mSubpopulateWrapped )
  {
    var countOrig = schema . count ;
    schema . count = function   countWrapped   ( conditions ,   callback ) {
      // Handle optional arguments.
      ( 'function' === typeof conditions && ( callback = conditions ) && ( conditions = undefined ) ) ;
      var wrapCallback = ( callback ? db_callback ( 'count failed' , callback ) : null ) ;
      try
      {
        return wrapSchema ( countOrig . call ( schema , conditions , wrapCallback ) ) ;
      }
      catch   ( mongooseError )
      {
        wrapCallback ( mongooseError ) ;
      }
    } ;
    schema . count . mSubpopulateWrapped = true ;
  }



  // Wrap `distinct` method for error handling and result wrapping.
  if   ( schema . distinct && ! schema . distinct . mSubpopulateWrapped )
  {
    var distinctOrig = schema . distinct ;
    schema . distinct = function   distinctWrapped   ( field ,   conditions ,   callback ) {
      // Handle optional arguments.
      ( 'function' === typeof conditions && ( callback = conditions ) && ( conditions = undefined ) ) ;
      var wrapCallback = ( callback ? db_callback ( 'distinct failed' , callback ) : null ) ;
      try
      {
        return wrapSchema ( distinctOrig . call ( schema , field , conditions , wrapCallback ) ) ;
      }
      catch   ( mongooseError )
      {
        wrapCallback ( mongooseError ) ;
      }
    } ;
    schema . distinct . mSubpopulateWrapped = true ;
  }



  // Wrap `find` method for condition verification, error handling, and result wrapping.
  if   ( schema . find && ! schema . find . mSubpopulateWrapped )
  {
    var findOrig = schema . find ;
    schema . find = function   findWrapped   ( conditions ,   fields ,   options ,   callback ) {
      // Handle optional arguments.
      ( 'function' === typeof fields && ( callback = fields ) && ( fields = undefined ) ) ;
      ( 'function' === typeof options && ( callback = options ) && ( options = undefined ) ) ;
      var wrapCallback = ( callback ? db_callback ( 'find failed' , callback ) : null ) ;
      verifyConditions ( conditions ) ; // Validate query conditions.
      try
      {
        var findResult = findOrig . call ( schema , conditions , fields , options , wrapCallback ) ;
        var findSchemaWrapped = wrapSchema ( findResult ) ; // Wrap the query object itself.
        return findSchemaWrapped ;
      }
      catch   ( mongooseError )
      {
        wrapCallback ( mongooseError ) ;
      }
    } ;
    schema . find . mSubpopulateWrapped = true ;
  }



  // Wrap `findOne` method for condition verification, error handling, and result wrapping.
  if   ( schema . findOne && ! schema . findOne . mSubpopulateWrapped )
  {
    var findOneOrig = schema . findOne ;
    schema . findOne = function   findOneWrapped   ( conditions ,   fields ,   options ,   callback ) {
      // Handle optional arguments.
      ( 'function' === typeof fields && ( callback = fields ) && ( fields = undefined ) ) ;
      ( 'function' === typeof options && ( callback = options ) && ( options = undefined ) ) ;
      var wrapCallback = ( callback ? db_callback ( 'findOne failed' , callback ) : null ) ;
      verifyConditions ( conditions ) ; // Validate query conditions.
      try
      {
        return wrapSchema ( findOneOrig . call ( schema , conditions , fields , options , wrapCallback ) ) ;
      }
      catch   ( mongooseError )
      {
        console . log ( mongooseError . stack ) ; // Log the error stack for debugging.
        wrapCallback ( mongooseError ) ;
      }
    } ;
    schema . findOne . mSubpopulateWrapped = true ;
  }



  // Wrap `save` method for consistent error handling.
  if   ( schema . save && ! schema . save . mSubpopulateWrapped )
  {
    var saveOrig = schema . save ;
    schema . save = function   saveWrapped   ( callback ) {
      var wrapCallback = ( callback ? db_callback ( 'save failed' , callback ) : null ) ; // TODO: Consider if callback is always guaranteed, or if there's a default for Mongoose 4+.
      try
      {
        return saveOrig . call ( schema , wrapCallback ) ;
      }
      catch   ( mongooseError )
      {
        wrapCallback ( mongooseError ) ;
      }
    } ;
    schema . save . mSubpopulateWrapped = true ;
  }



  // Wrap `populate` method to track populate paths and verify them.
  if   ( schema . populate && ! schema . populate . mSubpopulateWrapped )
  {
    var populateOrig = schema . populate ;
    schema . populate = function   populateWrapped   ( path ,   fields ,   conditions ,   options ) {
      schema . populateStack . push ( path ) ; // Add the current populate path to the stack.
      verifyPath ( path ) ; // Verify the validity of the path.
      return wrapSchema ( populateOrig . call ( schema , path , fields , conditions , options ) ) ;
    } ;
    schema . populate . mSubpopulateWrapped = true ;
  }



  // Wrap `sort` method to ensure the query object remains wrapped.
  if   ( schema . sort && ! schema . sort . mSubpopulateWrapped )
  {
    var sortOrig = schema . sort ;
    schema . sort = function   sortWrapped   ( sort ) {
      return wrapSchema ( sortOrig . call ( schema , sort ) ) ;
    } ;
    schema . sort . mSubpopulateWrapped = true ;
  }



  // Wrap `skip` method to ensure the query object remains wrapped.
  if   ( schema . skip && ! schema . sort . mSubpopulateWrapped ) // Note: Original code checks !schema.sort.mSubpopulateWrapped, possibly a typo.
  {
    var skipOrig = schema . skip ;
    schema . skip = function   skipWrapped   ( skip ) {
      return wrapSchema ( skipOrig . call ( schema , skip ) ) ;
    } ;
    schema . skip . mSubpopulateWrapped = true ;
  }



  // Wrap `limit` method to ensure the query object remains wrapped.
  if   ( schema . limit && ! schema . limit . mSubpopulateWrapped )
  {
    var limitOrig = schema . limit ;
    schema . limit = function   limitWrapped   ( limit ) {
      return wrapSchema ( limitOrig . call ( schema , limit ) ) ;
    } ;
    schema . limit . mSubpopulateWrapped = true ;
  }



  // Wrap `select` method to ensure the query object remains wrapped.
  if   ( schema . select && ! schema . select . mSubpopulateWrapped )
  {
    var selectOrig = schema . select ;
    schema . select = function   selectWrapped   ( selectString ) {
      return wrapSchema ( selectOrig . call ( schema , selectString ) ) ;
    } ;
    schema . select . mSubpopulateWrapped = true ;
  }



  // Wrap `exec` method for final execution, post-processing, and error handling.
  if   ( schema . exec && ! schema . exec . mSubpopulateWrapped )
  {
    var execOrig = schema . exec ;
    schema . exec = function   execWrapped   ( callback ) {
      if   ( ! callback )
      {
        throw new Error ( 'exec must be called with a callback function' ) ;
      }
      var wrapCallback = ( callback ? db_callback ( 'exec failed' , callback ) : null ) ; // TODO: Ensure callback presence, or provide default.


      // `postExec` is a custom callback handler that performs additional processing
      // after the original Mongoose `exec` call. This is crucial for handling
      // subpopulation in non-embedded documents, a feature not natively supported by Mongoose.
      var postExec = function   postExec   ( err ,   result ) {
        if   ( result )
        {
          // Iterate over each path that was pushed onto the populateStack.
          async . forEach ( schema . populateStack , function   ( path ,   iter ) {
            var splitPath = path . split ( '.' ) ;
            var cursor = result ;
            var cursorType = schema . modelName || schema . model . modelName ;
            var traversedPath = '' ; // Tracks the path successfully traversed.

            for   ( var j in splitPath )
            {
              var parentCursor = cursor ; // Keep a reference to the parent for linking.
              cursor = cursor [ splitPath [ j ] ] ; // Move to the next segment of the path.

              // Determine the type of the next model to reference.
              cursorType = mongoose . model ( cursorType ) . schema . paths [ splitPath [ j ] ] . options . ref ;

              // If the cursor is a string, it means it's an unpopulated ID reference.
              if   ( typeof cursor == 'string' )
              {
                // We've traversed to an ID. Now, fetch the actual object.
                mongoose [ cursorType ] . findById ( cursor ) . exec ( function   ( cursorObject ) {
                  parentCursor [ splitPath [ j ] ] = cursorObject ; // Link the fetched object.
                  iter ( ) ; // Continue to the next item in populateStack.
                } ) ;
                return ;
              }
              // If the cursor is undefined, it means the path doesn't exist or is not set.
              else if   ( typeof cursor == 'undefined' )
              {
                iter ( ) ; // Skip this path and continue.
                return ; // Can't do anything, some ID hasn't even been set yet.
              }
              // If it's an object, continue traversing.
              else
              {
                traversedPath += ( traversedPath ? '.' : '' ) + splitPath [ j ] ;
              }
            }
            iter ( ) ; // All segments of the current path processed.
          } , function   ( ) {
            schema . populateStack = { } ; // Clear the stack after processing.
            wrapCallback ( err ,   result ) ; // Call the user's wrapped callback.
          } ) ;
        }
        else
        {
          wrapCallback ( err ,   result ) ; // No result, just pass error or null.
        }
        return ;
      } ;


      try
      {
        return execOrig . call ( schema , postExec ) ; // Call original exec with our post-processor.
      }
      catch   ( mongooseError )
      {
        console . log ( mongooseError . trace ) ; // Log trace for deeper debugging.
        console . log ( mongooseError . stack ) ;
        wrapCallback ( mongooseError ) ;
      }
    } ;
    schema . exec . mSubpopulateWrapped = true ;
  }



  // Wrap `stream` method to ensure streamed data is also wrapped.
  if   ( schema . stream && ! schema . stream . mSubpopulateWrapped )
  {
    var streamOrig = schema . stream ;
    schema . stream = function   streamWrapped   ( ) {
      var wrappedRes = wrapSchema ( streamOrig . apply ( schema , arguments ) ) ; // Wrap the stream itself.
      var dataListeners = [ ] ; // Array to hold 'data' event listeners.

      var wrapDataEvents = function   ( data ) {
        var wrappedData = wrapModelObject ( data ) ; // Wrap each data chunk.
        dataListeners . map ( function   ( listener ) {
          listener ( wrappedData ) ; // Call original listeners with wrapped data.
        } ) ;
      } ;

      wrappedRes . on ( 'data' , wrapDataEvents ) ; // Attach our wrapper to the 'data' event.
      var onOrig = wrappedRes . on ;
      wrappedRes . on = function   ( type ,   fn ) {
        if   ( type === 'data' )
        {
          dataListeners . push ( fn ) ; // Store 'data' listeners for our wrapper.
        }
        else
        {
          onOrig . call ( wrappedRes , type ,   fn ) ; // For other event types, call original 'on'.
        }
      } ;
      return wrappedRes ;
    } ;
  }


  // Mark the schema as having been wrapped by mSubpopulate.
  schema . mSubpopulateWrapped = true ;


  // Wrap the Mongoose constructor function itself.
  // This ensures that new instances created directly (e.g., `new User()`)
  // also get the benefits of `wrapSchema` and `wrapModelObject`.
  // This is primarily for user-level code, not Mongoose internals.
  if   ( ! schema . mSubpopulateWrappedConstructor && 'function' === typeof schema )
  {
    var newSchema = function   wrappedSchemaConstructor   ( doc ,   fields ) {
      var schemaObj = new schema ( doc ,   fields ) ;
      var safeSchemaInst ;

      // Set the prototype to the original schema instance to inherit its methods.
      this . __proto__ = schemaObj ;

      // Apply schema wrapping to `this` (the new instance).
      safeSchemaInst = wrapSchema ( this ) ;

      // Apply model object wrapping to `this`.
      safeSchemaInst = wrapModelObject ( this ) ;

      // NOTE: There's a known issue where fields named "name" might be inadvertently
      // cleared or overwritten during the wrapping process. This is particularly
      // relevant for collections like 'users' that commonly have a 'name' field.
      // This behavior needs further investigation and potential mitigation.

      return safeSchemaInst ;
    } ;
    newSchema . __proto__ = schema ; // Inherit static methods from the original schema.
    newSchema . prototype . __proto__ = schema . prototype ; // Inherit prototype methods.
    newSchema . mSubpopulateWrappedConstructor = true ; // Mark as wrapped.

    // Copy any missing static properties from the original schema to the new wrapper.
    for   ( var i in schema )
    {
      if   ( schema . hasOwnProperty ( i ) && ! newSchema [ i ] )
      {
        newSchema [ i ] = schema [ i ] ;
      }
    }

    return newSchema ; // Return the new, wrapped constructor.
  }
  else
  {
    schema . mSubpopulateWrappedConstructor = true ; // If it's not a function or already wrapped, just mark it.
  }


  return schema ; // Return the (potentially wrapped) schema.
}


// --- Library Internal Utility Functions ---

// Function to get details of the calling function, primarily for debugging and internal checks.
function   getCallerDetails   ( ) {
  // We intentionally throw an exception to capture the stack trace.
  // This allows us to inspect the call stack and identify the caller's file and function.
  // (A rather ingenious, if somewhat unconventional, approach!)
  try
  {
    i . dont . exist = 0 ; // This line will always throw a ReferenceError.
  }
  catch   ( e )
  {
    var stack = e . stack . split ( '\n' ) ;
    var callerDetails = stack [ 3 ] . split ( /\s/ ) ; // Line 3 of the stack usually contains the caller.
    var callerFile = callerDetails [ callerDetails . length - 1 ] ; // Extract the file path.
    return { file: callerFile } ;
  }
}


// This function wraps individual Mongoose model objects, providing enhanced functionality:
// 1) Direct string access to `_id` attributes.
// 2) Synchronized getter/setter for model attributes with the underlying Mongoose object.
// 3) Ability to retrieve a "bare" dictionary representation, including populated descendants.
function   wrapModelObject   ( object ,   cacheData ,   callback ) {

  // Handle optional `cacheData` argument.
  if   ( 'function' === typeof cacheData )
  {
    callback = cacheData , cacheData = { } ;
  }
  cacheData = cacheData || { } ;


  // If the object is null, undefined, a number, or already wrapped, return it directly.
  if   ( object === null || object === undefined || 'number' === typeof object || object . mongooseLink )
  {
    return ( callback ? callback ( object , cacheData ) : object ) ;
  }


  // Check if the object is an array (lacks Mongoose schema properties).
  if   ( ! object . _schema /* Mongoose 2.7 */ && ! object . schema /* Mongoose 3.x */ )
  {
    if   ( callback )
    {
      // If it's an array and a callback is provided, process elements asynchronously.
      return wrapModelObject ( object [ 0 ] , function   ( __wrapped ,   wrapCachedMetadata ) {
        async . map ( object , function   ( obj ,   iterate ) {
          if   ( obj && ( obj . _schema || obj . schema ) )
          {
            // Wrap Mongoose objects in the array.
            process . nextTick ( function   ( ) {
              wrapModelObject ( obj , wrapCachedMetadata , function   ( wrappedObject ) {
                iterate ( null ,   wrappedObject ) ;
              } ) ;
            } ) ;
          }
          else
          {
            iterate ( null ,   obj ) ; // Non-Mongoose objects are passed through.
          }
        } , function   ( err ,   wrappedObject ) {
          return callback ( wrappedObject ) ;
        } ) ;
      } ) ;
    }
    else
    {
      // If it's an array and no callback, process elements synchronously.
      for   ( var i in object )
      {
        if   ( object [ i ] && ( object [ i ] . _schema || object [ i ] . schema ) )
        {
          object [ i ] = wrapModelObject ( object [ i ] ) ; // Wrap Mongoose objects in place.
        }
      }
      return object ;
    }
  }


  // Create a new empty object to serve as the wrapped instance.
  var wrappedObject = new ( function   wrapped   ( ) { } ) ( ) ;
  wrappedObject . mongooseLink = object ; // Keep a reference to the original Mongoose object.
  wrappedObject . populatedObjects = { } ; // Store references to populated sub-objects.


  // Define helper functions for wrapping prototype methods and attributes.
  var wrapPrototype = {
    0: /*wrapFunction*/ function   ( attr ) {
      wrappedObject . __proto__ [ attr ] = function   ( ) {
        return object [ attr ] . apply ( object , arguments ) ; // Call original method on Mongoose object.
      }
    } ,
    1: /*wrapAttribute*/ function   ( attr ) {
      wrappedObject . __proto__ . __defineGetter__ ( attr , function   ( ) {
        return object [ attr ] ; // Directly access attribute from Mongoose object.
      } ) ;
    }
  } ;

  // Cache prototype getters/setters to avoid re-calculating them for every wrapped object.
  if   ( ! cacheData . protoGetters )
  {
    cacheData . protoGetters = { } ;
    for   ( var i in object )
    {
      if   ( typeof object [ i ] === 'function' )
      {
        // Exclude 'toString', 'toJSON', and 'inspect' methods from wrapping by default.
        if   ( ( i . substr ( 0 , 2 ) !== 'to' || i === 'toObject' ) && 'inspect' !== i )
        {
          cacheData . protoGetters [ i ] = 0 ; // Mark as a function to wrap.
        }
      }
      else
      {
        cacheData . protoGetters [ i ] = 1 ; // Mark as an attribute to wrap.
      }
    }
  }

  // Apply the cached prototype wrapping.
  for   ( var i in cacheData . protoGetters )
  {
    wrapPrototype [ cacheData . protoGetters [ i ] ] ( i ) ;
  }


  // Set up getters and setters for all schema attributes.
  var schema = ( object . _schema || object . schema ) . paths ;
  for   ( var i in schema )
  {
    ( function   ( attr ) {
      wrappedObject . __proto__ . __defineGetter__ ( attr , function   ( ) {
        // If an attribute is undefined but present in `_doc`, synchronize it.
        ( 'undefined' === typeof object [ attr ] && 'undefined' !== typeof object . _doc && 'undefined' !== typeof object . _doc [ attr ] ) && ( object [ attr ] = object . _doc [ attr ] ) ;

        // If the caller is a Mongoose internal function, return the raw attribute
        // to avoid interfering with Mongoose's own logic.
        if   ( getCallerDetails ( ) . file . indexOf ( '/mongoose/' ) !== -1 )
        {
          return object [ attr ] ;
        }


        // Special handling for `ObjectID` instances.
        if   ( 'ObjectID' === schema [ attr ] . instance )
        {
          var objectKey = ( ( object [ attr ] ? object [ attr ] . _id : false ) || object [ attr ] ) ;
          objectKey = ( objectKey && objectKey . toHexString ? objectKey . toHexString ( ) : objectKey ) ;
          var linkedObject = wrappedObject . populatedObjects [ objectKey ] ;

          if   ( linkedObject && '_id' !== attr )
          {
            // If it's a linked object (not just the _id field itself), return the wrapped object.
            return linkedObject ;
          }
          else if   ( schema [ attr ] . options . ref && object [ attr ] && ( object [ attr ] . _schema || object [ attr ] . schema ) )
          {
            // If it's a populated reference that hasn't been linked yet, wrap and store it.
            // TODO: This check might be redundant if `populateStack` handles all cases. Review.
            wrappedObject . populatedObjects [ objectKey ] = wrapModelObject ( object [ attr ] ) ;
            return wrappedObject . populatedObjects [ objectKey ] ;
          }
          else
          {
            // For raw ObjectIDs, allow direct string access.
            return ( object [ attr ] && object [ attr ] . toHexString ? object [ attr ] . toHexString ( ) : object [ attr ] ) ;
          }
        }
        else
        {
          return object [ attr ] ; // Return other attributes directly.
        }
      } ) ;

      wrappedObject . __proto__ . __defineSetter__ ( attr , function   ( value ) {
        // When setting a value, cache object references. Mongoose often casts these to IDs.
        if   ( value && value . mongooseLink )
        {
          wrappedObject . populatedObjects [ value . _id ] = value ; // Store the wrapped object.
          object [ attr ] = value . mongooseLink ; // Set the underlying Mongoose object's attribute to the raw link.
          object . set ( attr , value . mongooseLink ) ; // Use Mongoose setter for change tracking.
        }
        else
        {
          object [ attr ] = value ; // Set directly on the Mongoose object.
          object . _doc [ attr ] = value ; // Update the raw document representation.
          object . set ( attr , value ) ; // Use Mongoose setter.
          wrappedObject . set ( attr , value ) ; // Also update the wrapped object's direct property (if it had one).
        }
      } ) ;
    } ) ( i ) ;
  }


  // Make all Mongoose schema methods (including those from plugins) accessible directly.
  for   ( var i in wrappedObject . schema . methods )
  {
    ( function   ( methodName ) {
      wrappedObject . __proto__ [ methodName ] = wrappedObject . schema . methods [ methodName ] ;
    } ) ( i ) ;
  }


  // Add a `getBare` method to the wrapped object's prototype.
  // This method returns a plain JavaScript object representation, optionally including
  // specified sub-fields of populated objects.
  wrappedObject . __proto__ . getBare = function   ( keys ,   callback ) {
    // Handle optional `keys` argument.
    if   ( 'function' === typeof keys )
    {
      callback = keys ;
      keys = undefined ;
    }

    // If no specific keys are provided, use all schema paths.
    var keys = keys || Object . keys ( wrappedObject . schema . paths ) ;

    var bareDictionary = { } ; // The dictionary to build.

    async . map ( keys , function   ( i ,   iter ) {

      // The `keys` array can contain strings or objects for sub-field population.
      // E.g., `{ 'populated_collection_ref': ['list', 'of', 'subfields'] }`
      var subfields = undefined ;
      if   ( 'string' !== typeof i )
      {
        for   ( var collection in i )
        {
          subfields = i [ collection ] ;
          i = collection ; // Use the collection name as the key.
          break ;
        }
      }

      var referencedObject = wrappedObject [ i ] ;
      if   ( 'undefined' !== typeof referencedObject )
      {
        if   ( referencedObject && referencedObject . getBare )
        {