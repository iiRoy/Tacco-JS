// Strict mode for cleaner code.
"use strict"
;
/*
 * This module defines the polyphony.Server class.
 * It integrates with a given SocketServer instance.
 *
 * @param   { SocketServer }    socketServer    -   The   WebSocket   server  instance  to  monitor.
 * @constructor
 */
polyphony.Server  =   function( socketServer )
{
    // Store the provided socket server for later use by this instance.
    this.socketServer    =   socketServer;


    /*
     * This function is registered with the C++ backend
     * to send operational transformation messages.
     * It takes a string pointer from C++ and broadcasts it.
     */
    var sendFunc    =   Runtime.addFunction(
        function( stringPointer )
        {
            var string  =   Module.Pointer_stringify( stringPointer )
            ;
            // Broadcast the string message to all connected clients.
            socketServer.broadcast( string )
            ;
        }
    )
    ;

    // Initialize the native OT server and document.
    var nativeServer    =   cFuncs.otNewServer( sendFunc , null )
    ;
    var nativeDoc   =   cFuncs.otNewDoc()
    ;
    cFuncs.otServerOpen( nativeServer , nativeDoc )
    ;

    // A counter for assigning unique client IDs.
    var lastId  =   0
    ;
    // Define the behavior for new client connections.
    socketServer.onConnection   =   function( socket )
    {
        // When a message is received from this specific socket:
        socket.onMessage    =   function( message )
        {
            // Pass the message to the native OT server for processing.
            cFuncs.otServerReceive( nativeServer , message )
            ;
        }
        ;

        lastId++
        ; // Increment the client ID counter.
        var message =
        {
            clientId    :   lastId
        }
        ;

        // Retrieve the current document state from the native server.
        var nativeDocPtr    =   cFuncs.otServerGetDoc( nativeServer )
        ;
        if  (   nativeDocPtr    !== 0   )
        {
            // If a document exists, get the composed operation.
            var nativeOpPtr =   cFuncs.otDocGetComposed( nativeDocPtr )
            ;
            if  (   nativeOpPtr !== 0   )
            {
                // Encode the composed operation into JSON format.
                var lastOpJSON  =   cFuncs.otEncode( nativeOpPtr )
                ;

                // If there's a valid last operation, add it to the message.
                if  (   lastOpJSON  )
                {
                    message.lastOp  =   lastOpJSON
                    ;
                }
            }
        }

        // Log the acknowledgment and the message being sent.
        console.log( "[INFO] Acknowledging new client.\n\tJSON:" , message )
        ;
        // Send the client's initial message, including its ID and current document state.
        socket.send( JSON.stringify( message ) )
        ;
    }
    ;

    // Store the native server instance on 'this' for other methods.
    this.nativeServer    =   nativeServer
    ;
}
;

// Define prototype methods and properties for polyphony.Server.
polyphony.Server.prototype  =
{
    /**
     * Sets the maximum size for the document managed by this server.
     * @param   {number}    max - The new maximum size.
     */
    set maxSize( max )
    {
        var nativeDocPtr    =   cFuncs.otServerGetDoc( this.nativeServer )
        ;
        cFuncs.otDocSetMaxSize( nativeDocPtr , max )
        ;
    }
    ,
    // Closes the underlying socket server.
    close   :   function()
    {
        this.socketServer.close()
        ;
    }
}
;