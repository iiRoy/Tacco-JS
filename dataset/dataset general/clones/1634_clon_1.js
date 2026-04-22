( function( global, $ )
{
  /*
   * This section declares all the essential variables
   * required for managing the WebRTC connection state
   * and streams within the application.
   */
  var connected = false, /* Indicates if a peer connection is established */
      local, /* Reference to the local video element */
      remote, /* Reference to the remote video element */
      localStream, /* The media stream from the local user's camera/mic */
      remoteStream, /* The media stream from the remote user */
      pc, /* The RTCPeerConnection object */
      peers = 0, /* Counter for connected peers (though mostly used for single peer here) */
      ready = false; /* Flag indicating if local media access is ready */


  // Immediately attempt to get user media access upon script load.
  // Once media access is granted, set the 'ready' flag.
  getUserMedia( function( )
  {
    ready = true;
  } );


  /**
   * Stops the local media stream and initiates the hangup process.
   * This function ensures that the local video is no longer playing
   * and cleans up resources associated with the call.
   */
  function stop( )
  {
    // Check if a local stream exists before attempting to stop it.
    if ( localStream )
    {
      localStream.stop( ); // Stop the media tracks.
      localStream = null; // Clear the reference to the stream.
      // Update the UI to reflect that the local video is no longer active.
      app.$ui.videos.set( 'local', '' );
    }

    // Proceed to hang up the call, regardless of local stream status.
    hangup( );
  }


  /*
   * This function is responsible for requesting access to the user's
   * camera and microphone, initializing the local video elements,
   * and creating an object URL for the media stream.
   */
  function getUserMedia( callback )
  {
    // Obtain references to the local and remote video elements in the DOM.
    local = $( '#local' )[0];
    remote = $( '#remote' )[0];

    // If a local stream is already active, simply invoke the callback
    // and exit, avoiding redundant media requests.
    if ( localStream )
    {
      callback && callback( );
      return;
    }

    // Determine the correct `getUserMedia` prefix based on the browser.
    var get = 'getUserMedia';
    if ( !navigator.getUserMedia && navigator.webkitGetUserMedia )
    {
      get = 'webkitGetUserMedia';
    }

    // Request media access for both audio and video.
    navigator[get]( { audio: true, video: true },
      // Success callback: executed when media access is granted.
      function( stream )
      {
        console.log( "User has granted access to local media." );
        localStream = stream; // Store the granted stream.
        // Create a URL for the stream to be used as the video source.
        var url = webkitURL.createObjectURL( stream );
        local.src = url; // Assign the URL to the local video element.
        local.play( ); // Start playing the local video.
        callback && callback( ); // Invoke the provided callback function.
      },
      // Error callback: executed if media access is denied or fails.
      function( error )
      {
        console.log( "Failed to get access to local media. Error code was " + error.code );
        // An alert could be added here for user notification, but is currently commented out.
        //alert("Failed to get access to local media. Error code was " + error.code + ".");
      }
    );
    // Log that the request for local media access has been made.
    console.log( "Requested access to local media with new syntax." );
  }


  var remoteId; // Identifier for the remote peer.

  /*
   * Sends a message through the established connection to the remote peer.
   * The message is wrapped in an RTC-specific payload.
   */
  function send( message )
  {
    connection.sendMessage( {
      to: remoteId, // Target recipient.
      rtc: message // The actual WebRTC message payload.
    } );
  }


  // Exposes a global function to initiate a call to a specific user.
  window.call = function( userId )
  {
    // Ensure the local video element is visible when initiating a call.
    $( '#local' ).show( );

    // If a remote ID is already set, a call is likely in progress or
    // already established, so exit to prevent multiple calls.
    if ( remoteId )
    {
      return;
    }

    remoteId = userId; // Set the target remote user ID.

    var offer; // Variable to hold the SDP offer.

    // If no PeerConnection exists, create one.
    if ( !pc )
    {
      createPeerConnection( userId );
    }

    // If a local stream is available, add it to the PeerConnection.
    if ( localStream )
    {
      pc.addStream( localStream, null );
    }

    // Create an SDP offer for a video and audio call.
    offer = pc.createOffer( { has_video: true, has_audio: true } );

    // Set the local description of the PeerConnection with the created offer.
    pc.setLocalDescription( webkitPeerConnection00.SDP_OFFER, offer );

    // Send the offer to the remote peer via the signaling channel.
    send( { type: "offer", data: offer.toSdp( ) } );

    // Start gathering ICE candidates.
    pc.startIce( );
  }


  // Exposes a global function to terminate the current call.
  window.hangup = function( )
  {
    // Clear the remote stream if it exists.
    if ( remoteStream )
    {
      remoteStream = null;
    }

    // Close the PeerConnection if it exists and nullify its reference.
    if ( pc )
    {
      pc.close( );
      pc = null;
    }

    // Send a hangup message to the remote peer.
    send( { type: "hangup" } );

    remoteId = null; // Clear the remote peer ID.

    // Hide both local and remote video elements.
    $( '#remote' ).hide( );
    $( '#local' ).hide( );
  }


  /*
   * Initializes the RTCPeerConnection object, setting up STUN servers
   * and defining handlers for ICE candidates and remote media streams.
   */
  function createPeerConnection( )
  {
    pc = new webkitPeerConnection00(
      // STUN server configuration for NAT traversal.
      "STUN stun.l.google.com:19302",
      // Callback function for ICE candidates.
      function( candidate, moreToFollow )
      {
        // If there are more candidates to follow, send the current one.
        if ( moreToFollow )
        {
          var msg = JSON.stringify( { label: candidate.label, sdp: candidate.toSdp( ) } );
          send( { type: "icecandidate", data: msg } );
        }
        else
        {
          // Log the candidate if it exists when no more candidates are expected.
          candidate && console.log( candidate, candidate.toSdp( ) );
          // Original code had a commented-out log:
          //console.log("Received end of candidates (more_to_follow == false)");
        }
      }
    );

    // Event handler for when a remote stream is added to the PeerConnection.
    pc.onaddstream = function( event )
    {
      console.log( "Remote stream added.", event );
      remoteStream = event.stream; // Store the remote stream.
      var url = webkitURL.createObjectURL( event.stream ); // Create an object URL for the stream.
      remote.src = url; // Assign the URL to the remote video element.
      remote.play( ); // Start playing the remote video.
      $( '#remote' ).show( ); // Make the remote video element visible.
    };

    // Event handler for when a remote stream is removed.
    pc.onremovestream = function( event )
    {
      console.log( "Remote stream removed." );
      remote.src = ''; // Clear the remote video source.
    }
  }


  // Sets up a listener for incoming messages on the signaling channel.
  connection.onMessage( function( msg )
  {
    var offer, // Variable to store SDP offer.
        answer, // Variable to store SDP answer.
        candidate, c, // Variables for ICE candidates.
        message; // The WebRTC message payload.

    // Process messages only if they contain RTC data and are addressed to this client.
    if ( msg.data.rtc && msg.data.to == localStorage.id )
    {
      message = msg.data.rtc; // Extract the RTC message.

      // Handle different types of RTC messages.
      if ( message.type == 'hangup' )
      {
        hangup( ); // If it's a hangup message, terminate the call.
      }
      else if ( message.type == 'offer' && !remoteId )
      {
        // If it's an offer and no remote call is currently active.
        remoteId = msg.user; // Set the remote user ID from the message sender.
        console.log( 'offer', message );

        // If PeerConnection doesn't exist, create it.
        if ( !pc )
        {
          createPeerConnection( );
        }

        // Add local stream to the PeerConnection if available.
        if ( localStream )
          pc.addStream( localStream, null );

        // Create a SessionDescription object from the received offer data.
        offer = new SessionDescription( message.data );

        // Set the remote description of the PeerConnection with the received offer.
        pc.setRemoteDescription( webkitPeerConnection00.SDP_OFFER, offer );

        // Create an SDP answer based on the received offer.
        answer = pc.createAnswer( message.data, { has_video: true, has_audio: true } );

        // Set the local description of the PeerConnection with the created answer.
        pc.setLocalDescription( webkitPeerConnection00.SDP_ANSWER, answer );

        // Send the answer back to the remote peer.
        send( { type: "answer", data: answer.toSdp( ) } );

        // Start gathering ICE candidates.
        pc.startIce( );
      }
      else if ( message.type == "answer" )
      {
        // If it's an answer message.
        console.log( 'answer', message );
        answer = new SessionDescription( message.data ); // Create SessionDescription from answer data.
        // Set the remote description of the PeerConnection with the received answer.
        pc.setRemoteDescription( webkitPeerConnection00.SDP_ANSWER, answer );
      }
      else if ( message.type == "icecandidate" )
      {
        // If it's an ICE candidate message.
        candidate = JSON.parse( message.data ); // Parse the candidate data.
        // Original code had a commented-out log:
        //console.log("ice", candiate);
        // Create an IceCandidate object.
        candidate = new IceCandidate( candidate.label, candidate.sdp );
        // Process the received ICE candidate.
        pc.processIceMessage( candidate );
      }
    }
  } );
} )( window, window.jQuery )