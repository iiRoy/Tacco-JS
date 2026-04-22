( function () {
    // Declare all essential components for the application logic
    var redGhost, eventCount, enemySprites, webEngine, socketBridge, playerAvatar, pinkGhost, dataStore, dataStoreClient, webServer, commChannel;

    // Initialize core modules
    webEngine = require( 'http' ); // Web server module
    socketBridge = require( 'socket.io' ); // WebSocket module
    dataStore = require( 'redis' ); // Data storage module

    // Create a client for the data store
    dataStoreClient = dataStore.createClient();

    // Set up error handling for the data store connection
    dataStoreClient.on( 'error',
    function( fault ) {
        return console.warn( 'Data storage issue: ' + fault );
    }
    );

    // Instantiate the web server
    webServer = webEngine.createServer();
    // Start the server on a specific port
    webServer.listen( 8080 );

    // Attach the WebSocket functionality to the web server
    commChannel = socketBridge.listen( webServer );

    // Define the main player's initial state
    playerAvatar = {
        kind: 'position',
        xCoord: 450,
        yCoord: 150,
        visualID: 'playerAvatar'
    };

    // Define initial positions for individual enemy units
    redGhost = {
        xCoord: 10,
        yCoord: 60
    };
    pinkGhost = {
        xCoord: 10,
        yCoord: 30
    };

    // List of available enemy visual identifiers
    enemySprites = [ 'orange', 'blue', 'red', 'pink' ];

    // Initialize a general event counter
    eventCount = 0;

    // Handle new client connections via the communication channel
    commChannel.on( 'connection',
    function( userSession ) {
        var retrieveVisual, currentEnemy;

        // Helper function to fetch and send sprite data from the data store
        retrieveVisual = function( entityName ) {
            return dataStoreClient.get( entityName,
            function( fetchError, payload ) {
                if ( !payload ) {
                    return; // No data found, exit
                }
                console.error( 'Fetch error:', fetchError ); // Log potential fetch errors
                console.info( 'Parsed payload:', JSON.parse( payload ) ); // Log the parsed data

                payload = JSON.parse( payload ); // Parse JSON string to object
                return userSession.send( {
                    kind: 'position',
                    visualID: entityName,
                    xCoord: payload.xCoord,
                    yCoord: payload.yCoord
                } );
            } );
        };

        // Assign an enemy sprite to the connecting client
        currentEnemy = enemySprites.pop();
        console.log( 'Assigned enemy:', currentEnemy );

        // Inform the client about their assigned enemy
        userSession.send( {
            kind: 'enemyAssignment',
            assignedName: currentEnemy
        } );

        // Notify other clients about the new ghost joining
        userSession.broadcast( {
            kind: 'newEnemyJoined'
        } );

        // Process incoming messages from the client
        userSession.on( 'message',
        function( incomingMsg ) {
            console.log( 'Incoming transmission:', incomingMsg );

            // Act based on the message type
            switch ( incomingMsg.kind ) {
                case 'position':
                    // Store the enemy's new position in the data store
                    dataStoreClient.set( incomingMsg.enemy, JSON.stringify( {
                        xCoord: incomingMsg.xCoord,
                        yCoord: incomingMsg.yCoord
                    } ) );
                    // Broadcast the new position to all other clients
                    return userSession.broadcast( {
                        kind: 'position',
                        visualID: incomingMsg.enemy,
                        xCoord: incomingMsg.xCoord,
                        yCoord: incomingMsg.yCoord
                    } );
                case 'victory':
                    // Notify other clients about a victory event
                    userSession.broadcast( {
                        kind: 'victory',
                        enemyUnit: currentEnemy
                    } );
                    // Confirm victory to the winning client
                    return userSession.send( {
                        kind: 'victory',
                        enemyUnit: currentEnemy
                    } );
            }
        } );

        // Handle client disconnection events
        return userSession.on( 'disconnect',
        function() {
            console.log( 'Client session terminated.' );
            // Return the assigned enemy sprite back to the available pool
            enemySprites.push( currentEnemy );
            console.log( 'Re-adding enemy ' + currentEnemy + ' to pool.' );

            // Broadcast that the disconnected enemy is removed from view
            return userSession.broadcast( {
                kind: 'position',
                visualID: currentEnemy,
                xCoord: -100,
                yCoord: -100
            } );
        } );
    } );
} ).call( this ); // Execute the anonymous function immediately with the global context