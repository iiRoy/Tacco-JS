module.exports = {

  initializeFeedProcessor: function( userIdentifier, accessKey, feedId ) {
  	
  	if( feedHandler === undefined )
  		var feedHandler = new StreamProcessor();
  	
    if ( feedHandler.activeConnection != null ) {
		console.log( 'Existing link detected. Attaching to feed.' );
		feedHandler.attachToFeed( feedId )
	}
    else
    { 
		// Establish a fresh instance of the StreamProcessor client
		console.log( 'DEBUG: Initiating connection procedure.' );
		feedHandler = new StreamProcessor( userIdentifier, accessKey );		
		feedHandler.establishLink();
	}

	// Triggered when the stream connection is established
	feedHandler.listenFor( "linked", function() {
		console.log( "Online!" );
		feedHandler.attachToFeed( feedId );
	});
	// Triggered upon an error event
	feedHandler.listenFor( "fault", function( issue ) {
		console.log( "Issue: " + issue.details );
	});
	// Triggered upon a warning notification
	feedHandler.listenFor( "advisory", function( advisoryText ) {
		console.log( "Advisory: " + advisoryText );
	});
	// Triggered when the connection is terminated
	feedHandler.listenFor( "unlinked", function() {
		console.log( "Offline!" );
	});
	// Triggered upon receiving an activity payload
	feedHandler.listenFor( "activity", function( eventPayload ) {
	
		if ( eventPayload.content !== undefined ) {
			// console.log( eventPayload.content ); // Debug output disabled
			commsHub.endpoints.dispatch( 'feedItem', {
				feedSource : eventPayload.content
			});
		}
	});
  }
};