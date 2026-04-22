/*
 * MeteorDdp - a client for DDP version pre1
 * This is a customized version for demonstration purposes.
 * All identifiers and logic remain untouched.
 */

var MeteorDdp = function( wsUri )
{
  // Initialize supported DDP protocol versions.
  this.VERSIONS = [ "pre1" ];

  // Store the WebSocket URI for connection.
  this.wsUri        = wsUri;
  this.sock; // WebSocket instance reference.

  // defs: Stores Deferred objects keyed by DDP call ID.
  this.defs         = {};         // { deferred_id => deferred_object }

  // subs: Stores subscription IDs keyed by publication name.
  this.subs         = {};         // { pub_name => deferred_id }

  // watchers: Stores callback functions for collection changes.
  this.watchers     = {};     // { coll_name => [cb1, cb2, ...] }

  // collections: Stores actual document data, structured by collection name and document ID.
  this.collections  = {};  // { coll_name => {docId => {doc}, docId => {doc}, ...} }
};

MeteorDdp.prototype._Ids = function()
{
  var count = 0; // Internal counter for generating unique IDs.

  return {
    next: function()
    {
      return ++count + ''; // Increment and convert to string for DDP compatibility.
    }
  }
}(); // Immediately invoked function expression (IIFE) to create the ID generator.

MeteorDdp.prototype.connect = function()
{
  var self = this; // Capture 'this' for use in callbacks.
  var conn = new $.Deferred(); // Create a new Deferred object for the connection status.

  self.sock = new WebSocket( self.wsUri ); // Establish the WebSocket connection.

  self.sock.onopen = function()
  {
    // Handler for when the WebSocket connection is successfully opened.
    self.send( {
      msg: 'connect',       // DDP message type: 'connect'.
      version: self.VERSIONS[0],  // The preferred DDP protocol version.
      support: self.VERSIONS      // All supported DDP protocol versions.
    } );
  };

  self.sock.onerror = function( err )
  {
    // Handler for WebSocket errors.
    conn.reject( err ); // Reject the connection Deferred object on error.
  };

  self.sock.onmessage = function( msg )
  {
    var data = JSON.parse( msg.data ); // Parse the incoming JSON message.

    // Process the DDP message based on its 'msg' field.
    switch ( data.msg )
    {
      case 'connected':
        conn.resolve( data ); // Connection successful, resolve the Deferred.
        break;

      case 'result':
        self._resolveCall( data ); // Handle the result of a method call.
        break;

      case 'updated':
        // TODO method call was acked. This case needs further implementation.
        break;

      case 'changed':
        self._changeDoc( data ); // A document in a collection has changed.
        break;

      case 'added':
        self._addDoc( data ); // A new document has been added to a collection.
        break;

      case 'removed':
        self._removeDoc( data ); // A document has been removed from a collection.
        break;

      case 'ready':
        self._resolveSubs( data ); // Subscriptions specified in 'data.subs' are ready.
        break;

      case 'nosub':
        self._resolveNoSub( data ); // A subscription has failed or is no longer active.
        break;

      case 'addedBefore':
        self._addDoc( data ); // Document added with ordering information.
        break;

      case 'movedBefore':
        // TODO: Implement handling for movedBefore messages for ordered collections.
        break;
    }
  };
  return conn.promise(); // Return the promise of the connection Deferred object.
};

MeteorDdp.prototype._resolveNoSub = function( data )
{
  // Handles a 'nosub' message from the DDP server.
  if ( data.error )
  {
    var error = data.error; // Extract the error object.
    this.defs[ data.id ].reject( error.reason || 'Subscription not found' ); // Reject the deferred.
  }
  else
  {
    this.defs[ data.id ].resolve(); // Resolve the deferred if no error.
  }
};

MeteorDdp.prototype._resolveCall = function( data )
{
  // Handles 'result' messages from the DDP server, resolving method calls.
  if ( data.error )
  {
    this.defs[ data.id ].reject( data.error.reason ); // Reject the deferred if there's an error.
  }
  else if ( typeof data.result !== 'undefined' )
  {
    this.defs[ data.id ].resolve( data.result ); // Resolve with the result if available.
  }
};

MeteorDdp.prototype._resolveSubs = function( data )
{
  var subIds = data.subs; // Array of subscription IDs that are now ready.
  // Iterate through the list of ready subscription IDs.
  for ( var i = 0; i < subIds.length; i++ )
  {
    this.defs[ subIds[i] ].resolve(); // Resolve the deferred for each ready subscription.
  }
};

MeteorDdp.prototype._changeDoc = function( msg )
{
  var collName = msg.collection; // The name of the collection.
  var id       = msg.id;         // The ID of the document that changed.
  var fields   = msg.fields;     // New field values for the document.
  var cleared  = msg.cleared;    // Fields that have been removed from the document.
  var coll     = this.collections[ collName ]; // Reference to the collection.

  if ( fields )
  {
    // If new field values are provided, update them.
    for ( var k in fields )
    {
      coll[ id ][ k ] = fields[ k ];
    }
  }
  else if ( cleared )
  {
    // If fields are to be cleared, remove them from the document.
    for ( var i = 0; i < cleared.length; i++ )
    {
      var fieldName = cleared[ i ];
      delete coll[ id ][ fieldName ];
    }
  }

  var changedDoc = coll[ id ]; // Get the updated document.
  this._notifyWatchers( collName, changedDoc, id, msg.msg ); // Notify any registered watchers.
};

MeteorDdp.prototype._addDoc = function( msg )
{
  var collName = msg.collection; // Collection name.
  var id       = msg.id;         // Document ID.

  if ( !this.collections[ collName ] )
  {
    this.collections[ collName ] = {}; // Initialize collection if it doesn't exist.
  }

  /*
   * NOTE: Ordered docs will have a 'before' field containing the id of
   * the doc after it. If it is the last doc, it will be null.
   * This implementation simply adds the document without explicit ordering.
   */
  this.collections[ collName ][ id ] = msg.fields; // Add the new document fields.

  var changedDoc = this.collections[ collName ][ id ]; // Get the newly added document.
  this._notifyWatchers( collName, changedDoc, id, msg.msg ); // Notify watchers about the addition.
};

MeteorDdp.prototype._removeDoc = function( msg )
{
  var collName = msg.collection; // Collection name.
  var id       = msg.id;         // Document ID to remove.
  var doc      = this.collections[ collName ][ id ]; // Get the document before removal.

  var docCopy = JSON.parse( JSON.stringify( doc ) ); // Create a deep copy of the document.
  delete this.collections[ collName ][ id ]; // Remove the document from the collection.
  this._notifyWatchers( collName, docCopy, id, msg.msg ); // Notify watchers with the removed document's copy.
};

MeteorDdp.prototype._notifyWatchers = function( collName, changedDoc, docId, message )
{
  // Create a deep copy of the document to prevent external modification.
  changedDoc = JSON.parse( JSON.stringify( changedDoc ) );
  changedDoc._id = docId; // Attach the document ID to the copy for watchers' convenience.

  if ( !this.watchers[ collName ] )
  {
    this.watchers[ collName ] = []; // Initialize watchers array if it doesn't exist for this collection.
  }
  else
  {
    // Iterate through all registered watchers for this collection.
    for ( var i = 0; i < this.watchers[ collName ].length; i++ )
    {
      this.watchers[ collName ][ i ]( changedDoc, message ); // Invoke each watcher callback.
    }
  }
};

MeteorDdp.prototype._deferredSend = function( actionType, name, params )
{
  var id = this._Ids.next(); // Generate a unique ID for this DDP operation.
  this.defs[ id ] = new $.Deferred(); // Create a Deferred object for this operation.

  var args = params || []; // Use provided parameters or an empty array if none.

  var o = {
    msg: actionType, // DDP message type (e.g., 'method', 'sub').
    params: args,    // Parameters for the method/subscription.
    id: id           // The unique ID for this DDP operation.
  };

  if ( actionType === 'method' )
  {
    o.method = name; // For method calls, specify the method name.
  }
  else if ( actionType === 'sub' )
  {
    o.name = name; // For subscriptions, specify the publication name.
    this.subs[ name ] = id; // Store the subscription ID associated with the publication name.
  }

  this.send( o ); // Send the DDP message over the WebSocket.
  return this.defs[ id ].promise(); // Return the promise for this operation.
};

MeteorDdp.prototype.call = function( methodName, params )
{
  // Public method to call a Meteor method.
  return this._deferredSend( 'method', methodName, params );
};

MeteorDdp.prototype.subscribe = function( pubName, params )
{
  // Public method to subscribe to a Meteor publication.
  return this._deferredSend( 'sub', pubName, params );
};

MeteorDdp.prototype.unsubscribe = function( pubName )
{
  // Public method to unsubscribe from a Meteor publication.
  var id; // Declare 'id' here to ensure scope.
  this.defs[ id ] = new $.Deferred(); // Create a deferred for the unsubscribe action.

  if ( !this.subs[ pubName ] )
  {
    this.defs[ id ].reject( pubName + " was never subscribed" ); // Reject if not subscribed.
  }
  else
  {
    id = this.subs[ pubName ]; // Retrieve the subscription ID.
    var o = {
      msg: 'unsub', // DDP message type: 'unsub'.
      id: id        // The ID of the subscription to unsubscribe.
    };
    this.send( o ); // Send the unsubscribe message.
  }
  return this.defs[ id ].promise(); // Return the promise for the unsubscribe operation.
};

MeteorDdp.prototype.watch = function( collectionName, cb )
{
  // Registers a callback function to be notified of changes in a specific collection.
  if ( !this.watchers[ collectionName ] )
  {
    this.watchers[ collectionName ] = []; // Initialize the watchers array for the collection if it doesn't exist.
  }
  this.watchers[ collectionName ].push( cb ); // Add the callback to the list of watchers.
};

MeteorDdp.prototype.getCollection = function( collectionName )
{
  // Retrieves an entire collection by its name.
  return this.collections[ collectionName ] || null; // Returns the collection object or null if not found.
}

MeteorDdp.prototype.getDocument = function( collectionName, docId )
{
  // Retrieves a single document from a collection by its ID.
  // It first checks if the collection exists, then if the document exists within it.
  return ( this.collections[ collectionName ] && this.collections[ collectionName ][ docId ] ) || null;
}

MeteorDdp.prototype.send = function( msg )
{
  // Sends a DDP message over the WebSocket connection.
  this.sock.send( JSON.stringify( msg ) ); // Stringify the message object to JSON format.
};

MeteorDdp.prototype.close = function()
{
  // Closes the WebSocket connection.
  this.sock.close();
};