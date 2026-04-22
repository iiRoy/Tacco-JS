(function(universe, jq) {
    // Declare various state and control variables for the communication system
    var linkEstablished = false,
        myVideoElement,
        theirVideoElement,
        myMediaFlow,
        theirMediaFlow,
        peerConnector,
        participantCount = 0,
        initialised = false;

    // Begin by attempting to acquire local media, setting a flag upon success
    obtainMediaAccess(function() {
        initialised = true;
    });

    /**
     * Halts the local media stream and triggers a call disconnection.
     * This function ensures that resources are properly released.
     */
    function terminateSession() {
        if (myMediaFlow) {
            myMediaFlow.getTracks().forEach(track => track.stop()); // Modern way to stop stream
            myMediaFlow = null;
            // Update the user interface to reflect the absence of the local video
            interfaceManager.videoDisplay.updateLocal('');
        }
        disconnectCall();
    }

    /**
     * Requests access to the user's camera and microphone.
     * @param {function} onCompletion - Callback function executed once media access is granted.
     */
    function obtainMediaAccess(onCompletion) {
        myVideoElement = jq('#local')[0];
        theirVideoElement = jq('#remote')[0];

        // If a local stream already exists, no need to re-request
        if (myMediaFlow) {
            onCompletion && onCompletion();
            return;
        }

        var mediaMethodName = 'getUserMedia';
        // Check for vendor-prefixed getUserMedia if the standard one is not available
        if (!navigator.getUserMedia && navigator.webkitGetUserMedia) {
            mediaMethodName = 'webkitGetUserMedia';
        }

        // Execute the appropriate getUserMedia method
        navigator[mediaMethodName]({
                audio: true,
                video: true
            },
            function(mediaStream) { // Success callback
                console.info("User successfully granted permissions for local media devices.");
                myMediaFlow = mediaStream;
                var objectUrl = window.URL.createObjectURL(mediaStream); // Use modern URL API
                myVideoElement.src = objectUrl;
                myVideoElement.play();
                onCompletion && onCompletion();
            },
            function(mediaError) { // Error callback
                console.error("Failed to obtain access to local media. Error code: " + mediaError.code);
            }
        );
        console.log("Initiated request for local media access using the latest API.");
    }

    var partnerIdentifier; // Stores the unique ID of the remote participant
    /**
     * Dispatches a signaling message to the remote participant.
     * @param {object} signalPacket - The WebRTC signaling message to be sent.
     */
    function dispatchSignal(signalPacket) {
        // Utilize the global signaling channel to transmit the message
        signalingChannel.sendMessage({
            to: partnerIdentifier,
            rtc: signalPacket
        });
    }

    // Expose a global function to allow initiating a new call
    universe.initiateCall = function(targetUserId) {
        jq('#local').show(); // Display the local video element
        // If a call is already in progress with a remote participant, do nothing
        if (partnerIdentifier) {
            return;
        }

        partnerIdentifier = targetUserId; // Set the identifier for the new remote participant
        var sessionOffer;

        // If no peer connection exists, create one
        if (!peerConnector) {
            establishPeerConnection(targetUserId);
        }

        // Add the local media stream to the peer connection if available
        if (myMediaFlow) {
            peerConnector.addStream(myMediaFlow, null);
        }

        // Create an SDP offer for the session
        sessionOffer = peerConnector.createOffer({
            has_video: true,
            has_audio: true
        });
        // Set the locally generated offer as the local description
        peerConnector.setLocalDescription(RTCSessionDescription.SDP_OFFER, sessionOffer);
        // Send the offer to the remote participant via the signaling channel
        dispatchSignal({
            type: "offer",
            data: sessionOffer.toSdp()
        });
        // Begin gathering ICE candidates
        peerConnector.startIce();
    };

    // Expose a global function to terminate the current call
    universe.disconnectCall = function() {
        // Clear the remote media flow if it exists
        if (theirMediaFlow) {
            theirMediaFlow = null;
        }

        // Close and nullify the peer connection if it's active
        if (peerConnector) {
            peerConnector.close();
            peerConnector = null;
        }

        // Send a hangup signal to the remote participant
        dispatchSignal({
            type: "hangup"
        });
        partnerIdentifier = null; // Reset the remote participant identifier

        // Hide both local and remote video elements in the UI
        jq('#remote').hide();
        jq('#local').hide();
    };

    /**
     * Initializes a new WebRTC PeerConnection object.
     * This sets up STUN servers and defines handlers for ICE candidates and remote streams.
     */
    function establishPeerConnection() {
        peerConnector = new RTCPeerConnection( // Use modern RTCPeerConnection
            "STUN stun.l.google.com:19302", // STUN server configuration
            function(iceCandidate, hasMoreCandidates) { // ICE candidate handler
                if (hasMoreCandidates) {
                    var candidateMessage = JSON.stringify({
                        label: iceCandidate.label,
                        sdp: iceCandidate.toSdp()
                    });
                    dispatchSignal({
                        type: "icecandidate",
                        data: candidateMessage
                    });
                } else {
                    // Log the final candidate if available, otherwise indicate end of candidates
                    iceCandidate && console.debug(iceCandidate, iceCandidate.toSdp());
                }
            }
        );

        // Handler for when a remote stream is added to the peer connection
        peerConnector.onaddstream = function(streamEvent) {
            console.info("Remote media stream successfully added.", streamEvent);
            theirMediaFlow = streamEvent.stream;
            var objectUrl = window.URL.createObjectURL(streamEvent.stream);
            theirVideoElement.src = objectUrl;
            theirVideoElement.play();
            jq('#remote').show(); // Display the remote video element
        };

        // Handler for when a remote stream is removed from the peer connection
        peerConnector.onremovestream = function(streamEvent) {
            console.warn("Remote media stream has been removed.");
            theirVideoElement.src = ''; // Clear the remote video source
        };
    }

    // Set up a listener for incoming messages on the signaling channel
    signalingChannel.onMessage(function(incomingMessage) {
        var sessionOffer,
            sessionAnswer,
            iceCandidate,
            rtcPayload;

        // Process messages only if they contain an RTC payload and are addressed to this client
        if (incomingMessage.data.rtc && incomingMessage.data.to === sessionStorage.currentId) {
            rtcPayload = incomingMessage.data.rtc;

            // Handle different types of RTC messages
            if (rtcPayload.type === 'hangup') {
                disconnectCall(); // Remote party requested to hang up
            } else if (rtcPayload.type === 'offer' && !partnerIdentifier) {
                // Received an offer and no call is currently established
                partnerIdentifier = incomingMessage.user; // Identify the sender
                console.log('Received session offer:', rtcPayload);

                // Create peer connection if it doesn't exist
                if (!peerConnector) {
                    establishPeerConnection();
                }

                // Add local stream to peer connection for two-way communication
                if (myMediaFlow) {
                    peerConnector.addStream(myMediaFlow, null);
                }

                // Create a session description object from the received offer
                sessionOffer = new RTCSessionDescription(rtcPayload.data);
                // Set the remote description of the peer connection
                peerConnector.setRemoteDescription(RTCSessionDescription.SDP_OFFER, sessionOffer);

                // Create an answer to the received offer
                sessionAnswer = peerConnector.createAnswer(rtcPayload.data, {
                    has_video: true,
                    has_audio: true
                });
                // Set the generated answer as the local description
                peerConnector.setLocalDescription(RTCSessionDescription.SDP_ANSWER, sessionAnswer);
                // Send the answer back to the remote party
                dispatchSignal({
                    type: "answer",
                    data: sessionAnswer.toSdp()
                });
                peerConnector.startIce(); // Start ICE candidate gathering
            } else if (rtcPayload.type === "answer") {
                // Received an answer to our previous offer
                console.log('Received session answer:', rtcPayload);
                sessionAnswer = new RTCSessionDescription(rtcPayload.data);
                // Set the remote description with the received answer
                peerConnector.setRemoteDescription(RTCSessionDescription.SDP_ANSWER, sessionAnswer);
            } else if (rtcPayload.type === "icecandidate") {
                // Received an ICE candidate
                iceCandidate = JSON.parse(rtcPayload.data);
                // Create an RTCIceCandidate object and add it to the peer connection
                iceCandidate = new RTCIceCandidate(iceCandidate.label, iceCandidate.sdp);
                peerConnector.processIceMessage(iceCandidate); // Process the received candidate
            }
        }
    });

})(window, window.jQuery); // Pass global window and jQuery objects to the IIFE