var redis = require ( 'redis' ) ;
var sockjs = require ( 'sockjs' ) ;
var _ = require ( 'underscore' ) ;
var validator = require ( 'validator' ) ;


/*
 * This module exports a Worker class responsible for handling
 * SockJS connections and managing channels.
 * It communicates with a parent process for certain events.
 */
module.exports = ( function ( ) {


	// Stores active channels. Each channel holds subscribers and message history.
	var channels = { } ;


	// Reference to the SockJS server instance.
	var sockjsServer ;


	/*
	 * Worker constructor.
	 * Initializes the SockJS server and begins listening for client connections.
	 *
	 * @param {Number} port The network port for the server to listen on.
	 * @param {String} [sockjsClientUrl] Optional URL for the SockJS client library.
	 * @param {Object} [sslOptions] Optional SSL configuration for HTTPS.
	 * @constructor
	 */
	function Worker ( port , sockjsClientUrl , sslOptions )
	{
		// Defines which log severities from SockJS should be outputted.
		var allowedLogs = [ 'error' ] ;

		// Configuration object for the SockJS server.
		var sockjsOptions = { } ;


		// Custom logging function for SockJS events.
		sockjsOptions . log = function ( severity , message )
		{
			if ( allowedLogs . indexOf ( severity ) > -1 )
			{
				console . log ( severity + "\t" + message ) ;
			}
		} ;


		// If a custom client URL is specified, apply it to SockJS options.
		if ( sockjsClientUrl )
		{
			sockjsOptions . sockjs_url = sockjsClientUrl ;
		}


		// Create the actual SockJS server instance.
		sockjsServer = sockjs . createServer ( sockjsOptions ) ;

		// Begin listening for connections using the configured server.
		listen ( port , sslOptions ) ;
	}


	/*
	 * Prototype method for the Worker.
	 * Triggers specific actions based on 'down' events received from the parent process.
	 *
	 * @param {String} type The type of the event (e.g., 'down-publish').
	 * @param {Object} data The payload associated with the event.
	 */
	Worker . prototype . triggerEventDown = function ( type , data )
	{
		switch ( type )
		{
			case 'down-publish' :
				// Instructs the worker to publish a message to a channel.
				sendDownPublish ( data . channel , data . event , data . data ) ;
				break ;

			case 'down-status-request' :
				// Responds to a status request by sending current channel data back.
				sendUpStatusRequest ( data . requestId , getChannelsData ( ) ) ;
				break ;

			default :
				// Log an error for any unhandled or invalid event types.
				console . log ( "Invalid down event type: `" + type + "`" ) ;
				break ;
		}
	} ;


	/*
	 * Sends a message to all subscribers of a given channel.
	 * This function is invoked when a 'down-publish' event is received.
	 *
	 * @param {String} channelId The identifier of the channel.
	 * @param {String} event The name of the event to publish.
	 * @param {Object} data The data payload of the event.
	 */
	var sendDownPublish = function ( channelId , event , data )
	{
		var channel = channels [ channelId ] ;
		if ( ! channel )
		{
			// If the channel does not exist, there's nothing to publish to.
			return ;
		}

		var content = { channel : channelId , event : event , data : data } ;

		// Store the message in the channel's history.
		channel . msgs . push ( { timestamp : new Date ( ) . getTime ( ) , content : content } ) ;

		// Ensure message history does not exceed 10 entries.
		if ( channel . msgs . length > 10 )
		{
			channel . msgs . splice ( 0 , channel . msgs . length - 10 )
		}

		// Iterate through all subscribers and send them the message.
		_ . each ( channel . subscribers , function ( subscriber )
		{
			subscriber . connection . write ( JSON . stringify ( content ) ) ;
		} ) ;
	} ;


	/*
	 * Sends an 'up-message' event to the parent process.
	 * This typically originates from a client-side message.
	 *
	 * @param {String} clientKey The unique key identifying the client.
	 * @param {Object} data The message data from the client.
	 */
	var sendUpMessage = function ( clientKey , data )
	{
		process . send ( { type : 'up-message' , data : { clientKey : clientKey , data : data } } ) ;
	} ;


	/*
	 * Sends an 'up-subscribe' event to the parent process.
	 * Notifies the parent that a client has subscribed to a channel.
	 *
	 * @param {String} channel The ID of the channel being subscribed to.
	 * @param {String} clientKey The key of the subscribing client.
	 * @param {Object} data Any additional data associated with the subscription.
	 */
	var sendUpSubscribe = function ( channel , clientKey , data )
	{
		process . send ( { type : 'up-subscribe' , data : { channel : channel , clientKey : clientKey , data : data } } ) ;
	} ;


	/*
	 * Sends an 'up-unsubscribe' event to the parent process.
	 * Informs the parent that a client has unsubscribed from a channel.
	 *
	 * @param {String} channel The ID of the channel being unsubscribed from.
	 * @param {String} clientKey The key of the unsubscribing client.
	 */
	var sendUpUnsubscribe = function ( channel , clientKey )
	{
		process . send ( { type : 'up-unsubscribe' , data : { channel : channel , clientKey : clientKey } } ) ;
	} ;


	/*
	 * Sends an 'up-status-request' event to the parent process.
	 * This is a response to a 'down-status-request', containing current channel states.
	 *
	 * @param {Number} requestId The ID of the original request.
	 * @param {Object} channels An object containing data about all active channels.
	 */
	var sendUpStatusRequest = function ( requestId , channels )
	{
		process . send ( { type : 'up-status-request' , data : { requestId : requestId , channels : channels } } ) ;
	} ;


	/*
	 * Gathers and returns structured data about all currently active channels.
	 *
	 * @return {Object} An object mapping channel IDs to arrays of subscriber info.
	 */
	var getChannelsData = function ( )
	{
		var channelsData = { } ;

		// Iterate over each channel in the 'channels' object.
		_ . each ( channels , function ( channel , channelId )
		{
			// For each channel, map its subscribers to a simplified data structure.
			channelsData [ channelId ] = _ . map ( channel . subscribers , function ( subscriber )
			{
				return { clientKey : subscriber . connection . id , data : subscriber . data , subscribeStamp : subscriber . subscribeStamp } ;
			} ) ;
		} ) ;
		return channelsData ;
	} ;


	/*
	 * Configures and starts the underlying HTTP/HTTPS server for SockJS.
	 *
	 * @param {Number} port The port number for the server.
	 * @param {Object} [sslOptions] Optional SSL options for secure connections.
	 */
	var listen = function ( port , sslOptions )
	{
		var self = this ; // This variable is declared but not used in the original.

		// Event listener for new client connections to the SockJS server.
		sockjsServer . on ( 'connection' , function ( connection )
		{
			// Guard against empty WebSocket connections (known issue #41).
			if ( ! connection )
			{
				console . error ( 'Empty WebSocket connection' ) ;
				return ;
			}

			// Array to keep track of channel IDs this specific connection is subscribed to.
			var connectionChannelIds = [ ] ;


			/*
			 * Unsubscribes the current client connection from a specified channel.
			 *
			 * @param {String} channelId The ID of the channel to unsubscribe from.
			 */
			var unsubscribe = function ( channelId )
			{
				// Remove the channel ID from the connection's active subscriptions list.
				connectionChannelIds = _ . without ( connectionChannelIds , channelId ) ;

				var channel = channels [ channelId ] ;
				if ( ! channel )
				{
					// If the channel doesn't exist, there's nothing to unsubscribe from.
					return ;
				}

				// Notify the parent process about the unsubscription.
				sendUpUnsubscribe ( channelId , connection . id ) ;

				// Remove the subscriber entry that matches the current connection.
				channel . subscribers = _ . reject ( channel . subscribers , function ( subscriber )
				{
					return subscriber . connection === connection ;
				} ) ;

				// If no subscribers are left, set a timeout to eventually delete the channel.
				if ( channel . subscribers . length == 0 )
				{
					channel . closeTimeout = setTimeout ( function ( )
					{
						delete channels [ channelId ] ;
					} , 10000 ) ; // 10-second delay before deleting the channel.
				}
			} ;


			/*
			 * Subscribes the current client connection to a specified channel.
			 *
			 * @param {String} channelId The ID of the channel to subscribe to.
			 * @param {String} data Client-specific data associated with the subscription.
			 * @param {Number} [msgStartTime] Optional timestamp to receive messages published after this time.
			 */
			var subscribe = function ( channelId , data , msgStartTime )
			{
				// Prevent duplicate subscriptions for the same channel by the same client.
				if ( _ . contains ( connectionChannelIds , channelId ) )
				{
					return ;
				}

				// Default `msgStartTime` to current time if not provided.
				msgStartTime = msgStartTime || new Date ( ) . getTime ( ) ;

				// Add the channel ID to the connection's list of subscriptions.
				connectionChannelIds . push ( channelId ) ;

				// If the channel doesn't exist yet, initialize it.
				if ( ! channels [ channelId ] )
				{
					channels [ channelId ] = { subscribers : [ ] , msgs : [ ] , closeTimeout : null } ;
				}
				var channel = channels [ channelId ] ;

				// Clear any pending close timeout for this channel, as it now has active subscribers.
				clearTimeout ( channel . closeTimeout ) ;

				// Add the current connection as a new subscriber to the channel.
				channel . subscribers . push ( { connection : connection , data : data , subscribeStamp : new Date ( ) . getTime ( ) } ) ;

				// Send any historical messages (since `msgStartTime`) to the new subscriber.
				_ . each ( channel . msgs , function ( msg )
				{
					if ( msg . timestamp > msgStartTime )
					{
						connection . write ( JSON . stringify ( msg . content ) ) ;
					}
				} ) ;

				// Notify the parent process about the new subscription.
				sendUpSubscribe ( channelId , connection . id , data ) ;
			} ;


			/*
			 * Handles client-initiated publish requests, forwarding them to the parent process.
			 *
			 * @param {String} channelId The ID of the channel to publish to.
			 * @param {String} event The event name, which will be prefixed with 'client-'.
			 * @param {Object} data The data payload for the event.
			 */
			var publish = function ( channelId , event , data )
			{
				// Prepend 'client-' to the event name to distinguish client-originated events.
				event = 'client-' + event ;

				// If the channel doesn't exist, this publish request is ignored.
				if ( ! channels [ channelId ] )
				{
					return ;
				}

				// Send the publish request to the parent process for further handling.
				process . send ( { type : 'publish' , data : { channel : channelId , event : event , data : data } } ) ;
			} ;


			/*
			 * Handles client-initiated messages, forwarding them to the parent process.
			 *
			 * @param {String} clientKey The unique identifier of the client.
			 * @param {Object} data The message data from the client.
			 */
			var message = function ( clientKey , data )
			{
				sendUpMessage ( clientKey , data ) ;
			} ;


			// Listener for incoming data messages from the client connection.
			connection . on ( 'data' , function ( data )
			{
				try
				{
					// Attempt to parse the incoming data as JSON.
					data = JSON . parse ( data ) ;

					// Validate that the 'event' field exists in the parsed data.
					if ( validator . isNull ( data . event ) )
					{
						throw new Error ( 'Missing `data.event`: `' + JSON . stringify ( data ) + '`' )
					}
					var eventData = data . data ;

					// Process different types of client events.
					switch ( data . event )
					{
						case 'subscribe' :
							// Validate required fields for a subscribe event.
							if ( validator . isNull ( eventData . channel ) || validator . isNull ( eventData . data ) || ! validator . isInt ( eventData . start ) )
							{
								throw new Error ( 'Missing data: `' + JSON . stringify ( eventData ) + '`' )
							}

							subscribe ( eventData . channel , eventData . data , eventData . start ) ;
							break ;

						case 'unsubscribe' :
							// Validate required fields for an unsubscribe event.
							if ( validator . isNull ( eventData . channel ) )
							{
								throw new Error ( 'Missing `data.channel`: `' + JSON . stringify ( eventData ) + '`' )
							}

							unsubscribe ( eventData . channel ) ;
							break ;

						case 'message' :
							// Validate required fields for a message event.
							if ( validator . isNull ( eventData . data ) )
							{
								throw new Error ( 'Missing `data.data`: `' + JSON . stringify ( eventData ) + '`' )
							}

							message ( connection . id , eventData . data ) ;
							break ;

						case 'publish' :
							// Validate required fields for a publish event.
							if ( validator . isNull ( eventData . channel ) || validator . isNull ( eventData . data ) || validator . isNull ( eventData . event ) )
							{
								throw new Error ( 'Missing data: `' + JSON . stringify ( eventData ) + '`' )
							}

							publish ( eventData . channel , eventData . event , eventData . data ) ;
							break ;
					}
				}
				catch ( error )
				{
					// Log any errors encountered during data parsing or event processing.
					console . error ( 'Error processing WebSocket data: ' + error ) ;
				}
			} ) ;

			// Listener for the client connection closing.
			connection . on ( 'close' , function ( )
			{
				// When a connection closes, unsubscribe it from all channels it was part of.
				_ . each ( connectionChannelIds , function ( channelId )
				{
					unsubscribe ( channelId ) ;
				} ) ;
			} ) ;
		} ) ;


		var server ;
		// Create either an HTTPS or HTTP server based on whether SSL options are provided.
		if ( sslOptions )
		{
			server = require ( 'https' ) . createServer ( sslOptions ) ;
		}
		else
		{
			server = require ( 'http' ) . createServer ( ) ;
		}

		// Install the SockJS handlers onto the created HTTP/HTTPS server.
		sockjsServer . installHandlers ( server ) ;

		// Start the server, making it listen on the specified port.
		server . listen ( port ) ;
	} ;


	// The IIFE returns the Worker constructor, making it the module's export.
	return Worker ;

} ) ( ) ;