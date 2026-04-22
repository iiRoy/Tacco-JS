/*
 * This file contains a JavaScript implementation for STOMP client functionality.
 * It was initially derived from existing work and has been modified for clarity.
 *
 * All original identifiers, variables, functions, and expressions are preserved.
 * Extensive modifications to whitespace and comments have been applied.
 *
 * @author A. Developer
 * @version 1.0.1
 * @license MIT
 */

(function()
{

  // Define local variables for the Client class and Stomp object.
  // Also, cache a reference to Object.prototype.hasOwnProperty for performance.
  var Client, Stomp, __hasProp = Object.prototype.hasOwnProperty;


  // The Stomp object provides core STOMP protocol utilities,
  // including frame creation, unmarshalling, and marshaling.
  Stomp = {

    // Creates a STOMP frame object with the given command, headers, and body.
    // Headers and body are optional and default to empty values.
    frame: function( command, headers, body )
    {
      // Ensure headers and body are initialized, if not provided.
      if ( headers == null )
        headers = [];

      if ( body == null )
      {
        body = '';
      }

      // Return a frame object with various properties and a toString method.
      return {
        command: command,
        headers: headers,
        body: body,

        // Common STOMP header aliases for convenience.
        id: headers.id,
        receipt: headers.receipt,
        transaction: headers.transaction,
        destination: headers.destination,
        subscription: headers.subscription,

        // Placeholder for potential error messages.
        error: null,

        // Converts the frame object into a STOMP protocol string format.
        toString: function()
        {
          var lines, name, value;

          // Start with the command line.
          lines = [command];

          // Iterate over headers and add them to the lines array.
          for ( name in headers )
          {
            // Only process own properties, not inherited ones.
            if ( !__hasProp.call( headers, name ) )
            {
              continue;
            }
            value = headers[name];
            lines.push( "" + name + ":" + value );
          }

          // Add a newline separator and the body content.
          lines.push( '\n' + body );

          // Join all parts with newlines to form the final string.
          return lines.join( '\n' );
        } // End of toString method
      }; // End of frame object literal
    }, // End of Stomp.frame

    // Unmarshals a raw STOMP message string into a frame object.
    unmarshal: function( data )
    {
      var body, chr, command, divider, headerLines, headers, i, idx, line, trim, _ref, _ref2, _ref3;

      // Find the separator between headers and body.
      divider = data.search( /\n\n/ );

      // Extract header lines and the command.
      headerLines = data.substring( 0, divider ).split( '\n' );
      command = headerLines.shift();

      // Initialize headers and body.
      headers = {};
      body = '';

      // Helper function to trim whitespace from strings.
      trim = function( str )
      {
        return str.replace( /^\s+/g, '' ).replace( /\s+$/g, '' );
      };

      // Loop through header lines to parse key-value pairs.
      line = idx = null;
      for ( i = 0, _ref = headerLines.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i-- )
      {
        line = headerLines[i];
        idx = line.indexOf( ':' );
        headers[trim( line.substring( 0, idx ) )] = trim( line.substring( idx + 1 ) );
      }

      // Extract the body content, stopping at the null character.
      chr = null;
      for ( i = _ref2 = divider + 2, _ref3 = data.length; _ref2 <= _ref3 ? i < _ref3 : i > _ref3; _ref2 <= _ref3 ? i++ : i-- )
      {
        chr = data.charAt( i );
        if ( chr === '\0' )
          break;
        body += chr;
      }

      // Return a new frame object from the parsed components.
      return Stomp.frame( command, headers, body );
    }, // End of Stomp.unmarshal

    // Marshals a STOMP command, headers, and body into a protocol string,
    // appending a null terminator.
    marshal: function( command, headers, body )
    {
      return Stomp.frame( command, headers, body ).toString() + '\0';
    }, // End of Stomp.marshal

    // Factory method to create a new STOMP client instance.
    client: function( url )
    {
      return new Client( url );
    } // End of Stomp.client

  }; // End of Stomp object


  // The Client class represents a STOMP client connection.
  Client = (function()
  {
    // Constructor for the Client.
    function Client( url )
    {
      this.url = url;
      this.counter = 0; // Used for unique subscription IDs.
      this.connected = false;
      this.subscriptions = {}; // Stores subscription callbacks.
    }

    // Prototype method to transmit a STOMP frame over the WebSocket.
    Client.prototype._transmit = function( command, headers, body )
    {
      var out;

      // Marshal the frame into a string.
      out = Stomp.marshal( command, headers, body );

      // Log the outgoing message if debug is enabled.
      if ( typeof this.debug === "function" )
        this.debug( ">>> " + out );

      // Send the marshaled message via the WebSocket.
      return this.ws.send( out );
    }; // End of Client.prototype._transmit

    // Establishes a connection to the STOMP server via WebSocket.
    Client.prototype.connect = function( login_, passcode_, connectCallback, errorCallback )
    {
      var klass, _this = this;

      // Log the connection attempt.
      if ( typeof this.debug === "function" )
      {
        this.debug( "Opening Web Socket..." );
      }

      // Use WebSocketStompMock if available for testing, otherwise use native WebSocket.
      klass = WebSocketStompMock || WebSocket;
      this.ws = new klass( this.url, void 0, {
        debug: true,
        devel: true
      } );

      // Configure WebSocket to handle binary data.
      this.ws.binaryType = "arraybuffer";

      // Set up the message handler for incoming WebSocket messages.
      this.ws.onmessage = function( evt )
      {
        var data, frame, i, onreceive, view;

        // Process incoming data, converting ArrayBuffer to string if necessary.
        data = (function()
        {
          var _i, _len;

          if ( typeof ArrayBuffer !== 'undefined' && evt.data instanceof ArrayBuffer )
          {
            view = new Uint8Array( evt.data );
            if ( typeof this.debug === "function" )
            {
              this.debug( '--- got data length: ' + view.length );
            }
            data = "";
            for ( _i = 0, _len = view.length; _i < _len; _i++ )
            {
              i = view[_i];
              data += String.fromCharCode( i );
            }
            return data;
          }
          else
          {
            // If not ArrayBuffer, return data as is.
            return evt.data;
          }
        }).call( _this );

        // Log the incoming message.
        if ( typeof _this.debug === "function" )
          _this.debug( '<<< ' + data );

        // Unmarshal the message into a STOMP frame.
        frame = Stomp.unmarshal( data );

        // Handle CONNECTED frame.
        if ( frame.command === "CONNECTED" && connectCallback )
        {
          _this.connected = true;
          return connectCallback( frame );
        }
        else if ( frame.command === "MESSAGE" )
        {
          // Handle MESSAGE frame and dispatch to the appropriate subscription callback.
          onreceive = _this.subscriptions[frame.headers.subscription];
          return typeof onreceive === "function" ? onreceive( frame ) : void 0;
        }
      }; // End of ws.onmessage

      // Set up the WebSocket close handler.
      this.ws.onclose = function()
      {
        var msg;
        msg = "Whoops! Lost connection to " + _this.url;
        if ( typeof _this.debug === "function" )
          _this.debug( msg );

        // Invoke the error callback if provided.
        return typeof errorCallback === "function" ? errorCallback( msg ) : void 0;
      }; // End of ws.onclose

      // Set up the WebSocket open handler.
      this.ws.onopen = function()
      {
        if ( typeof _this.debug === "function" )
          _this.debug( 'Web Socket Opened...' );

        // Transmit the CONNECT frame with login credentials.
        return _this._transmit( "CONNECT", {
          login: login_,
          passcode: passcode_
        } );
      }; // End of ws.onopen

      // Store the connect callback.
      return this.connectCallback = connectCallback;
    }; // End of Client.prototype.connect

    // Disconnects the STOMP client.
    Client.prototype.disconnect = function( disconnectCallback )
    {
      // Transmit a DISCONNECT frame.
      this._transmit( "DISCONNECT" );

      // Close the underlying WebSocket.
      this.ws.close();

      // Update connection status.
      this.connected = false;

      // Invoke the disconnect callback if provided.
      return typeof disconnectCallback === "function" ? disconnectCallback() : void 0;
    }; // End of Client.prototype.disconnect

    // Sends a message to a STOMP destination.
    Client.prototype.send = function( destination, headers, body )
    {
      if ( headers == null )
        headers = {};

      if ( body == null )
      {
        body = '';
      }

      // Set the destination header.
      headers.destination = destination;

      // Transmit the SEND frame.
      return this._transmit( "SEND", headers, body );
    }; // End of Client.prototype.send

    // Subscribes to a STOMP destination.
    Client.prototype.subscribe = function( destination, callback, headers )
    {
      var id;

      if ( headers == null )
        headers = {};

      // Generate a unique subscription ID.
      id = "sub-" + this.counter++;

      // Set destination and ID headers.
      headers.destination = destination;
      headers.id = id;

      // Store the callback for this subscription.
      this.subscriptions[id] = callback;

      // Transmit the SUBSCRIBE frame.
      this._transmit( "SUBSCRIBE", headers );

      // Return the subscription ID.
      return id;
    }; // End of Client.prototype.subscribe

    // Unsubscribes from a STOMP destination using its ID.
    Client.prototype.unsubscribe = function( id, headers )
    {
      if ( headers == null )
        headers = {};

      // Set the ID header.
      headers.id = id;

      // Remove the subscription callback.
      delete this.subscriptions[id];

      // Transmit the UNSUBSCRIBE frame.
      return this._transmit( "UNSUBSCRIBE", headers );
    }; // End of Client.prototype.unsubscribe

    // Begins a STOMP transaction.
    Client.prototype.begin = function( transaction, headers )
    {
      if ( headers == null )
        headers = {};

      // Set the transaction header.
      headers.transaction = transaction;

      // Transmit the BEGIN frame.
      return this._transmit( "BEGIN", headers );
    }; // End of Client.prototype.begin

    // Commits a STOMP transaction.
    Client.prototype.commit = function( transaction, headers )
    {
      if ( headers == null )
        headers = {};

      // Set the transaction header.
      headers.transaction = transaction;

      // Transmit the COMMIT frame.
      return this._transmit( "COMMIT", headers );
    }; // End of Client.prototype.commit

    // Aborts a STOMP transaction.
    Client.prototype.abort = function( transaction, headers )
    {
      if ( headers == null )
        headers = {};

      // Set the transaction header.
      headers.transaction = transaction;

      // Transmit the ABORT frame.
      return this._transmit( "ABORT", headers );
    }; // End of Client.prototype.abort

    // Acknowledges a message receipt.
    Client.prototype.ack = function( message_id, headers )
    {
      if ( headers == null )
        headers = {};

      // Set the message-id header.
      headers["message-id"] = message_id;

      // Transmit the ACK frame.
      return this._transmit( "ACK", headers );
    }; // End of Client.prototype.ack

    return Client;

  })(); // End of Client IIFE


  // Expose Stomp globally if running in a browser environment,
  // otherwise export it for Node.js or similar environments.
  if ( typeof window !== "undefined" && window !== null )
  {
    window.Stomp = Stomp;
  }
  else
  {
    exports.Stomp = Stomp;
  }

}).call( this ); // Invoke the IIFE, passing 'this' (global object) as context.