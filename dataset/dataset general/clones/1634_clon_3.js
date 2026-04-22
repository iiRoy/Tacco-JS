(function( appContext, jQ ){
    // Core state variables for the communication module.
    // 'linkActive' indicates if a WebRTC connection is currently established.
    let linkActive = false;

    // References to the HTML video elements for local and remote streams.
    let myVideoElement,
        partnerVideoElement;

    // The MediaStream object obtained from the local user's camera/microphone.
    let myMediaStream;

    // The MediaStream object received from the remote peer.
    let partnerMediaStream;

    // The WebRTC PeerConnection object, central to the communication.
    let rtcEndpoint;

    // A flag to ensure media access is ready before initiating calls.
    let systemIsPrepared = false;

    // Identifier of the remote peer currently in communication or being called.
    let currentRemotePeerId;

    // Configuration for ICE servers, using Google's STUN server for NAT traversal.
    const iceServerConfiguration = {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    };

    // --- Initialization and Cleanup Functions ---

    // Immediately attempt to get user media when the script loads.
    // This pre-fetches permission and stream, marking the system as prepared.
    requestUserMediaAccess(function() {
        systemIsPrepared = true;
        updateStatusDisplay('Ready to connect.');
    });

    // Shuts down the local media stream and ends any active call.
    function endLocalMediaAndCall() {
        if (myMediaStream) {
            myMediaStream.getTracks().forEach(track => track.stop()); // Stop all tracks (audio/video)
            myMediaStream = null;
            jQ('#local-media-display').attr('src', '').hide(); // Clear and hide local video
        }
        terminateActiveCall(); // Ensure call is also ended
    }

    // Requests access to the user's camera and microphone.
    // Uses modern `navigator.mediaDevices.getUserMedia` with fallback for older browsers.
    function requestUserMediaAccess(callbackOnSuccess) {
        myVideoElement = jQ('#local-media-display')[0];
        partnerVideoElement = jQ('#remote-media-display')[0];

        // If a stream is already active, just invoke the callback.
        if (myMediaStream) {
            callbackOnSuccess && callbackOnSuccess();
            return;
        }

        const mediaConstraints = { audio: true, video: true };

        // Attempt to use the modern promise-based API.
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia(mediaConstraints)
                .then(function(stream) {
                    console.log("[RTC] Local media stream acquired successfully.");
                    myMediaStream = stream;
                    myVideoElement.srcObject = stream; // Assign stream directly to video element
                    myVideoElement.play();
                    callbackOnSuccess && callbackOnSuccess();
                })
                .catch(function(err) {
                    console.error(`[RTC] Failed to get local media: ${err.name} - ${err.message}`);
                    updateStatusDisplay(`Media access denied: ${err.name}`);
                    // Potentially inform user or retry.
                });
        } else {
            // Fallback for older browsers using deprecated `getUserMedia`.
            const legacyGetUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
            if (!legacyGetUserMedia) {
                console.error("[RTC] getUserMedia is not supported by this browser.");
                updateStatusDisplay('Browser does not support media access.');
                return;
            }

            legacyGetUserMedia.call(navigator, mediaConstraints,
                function(stream) {
                    console.log("[RTC] Legacy local media stream obtained.");
                    myMediaStream = stream;
                    myVideoElement.src = URL.createObjectURL(stream); // Use URL.createObjectURL for legacy streams
                    myVideoElement.play();
                    callbackOnSuccess && callbackOnSuccess();
                },
                function(error) {
                    console.error("[RTC] Legacy media access failed. Error code: " + error.code);
                    updateStatusDisplay(`Legacy media access failed: ${error.code}`);
                }
            );
        }
        console.debug("[RTC] Initiating request for local media access.");
    }

    // --- Signaling and Peer Connection Management ---

    // Sends a signaling message to the remote peer via the application's connection.
    function dispatchSignalingMessage(payload) {
        if (!appContext.signalingChannel || !currentRemotePeerId) {
            console.warn("[RTC] Cannot send signaling message: Channel or remote peer ID not set.");
            updateStatusDisplay('Signaling channel not ready.');
            return;
        }
        // Assuming appContext.signalingChannel has a method like 'postMessage'
        appContext.signalingChannel.postMessage({
            recipient: currentRemotePeerId, // Renamed 'to' to 'recipient'
            rtcPayload: payload // Renamed 'rtc' to 'rtcPayload'
        });
    }

    // Initiates a WebRTC call to a specific user.
    appContext.startVideoCall = function(targetUserId) { // Renamed 'call' to 'startVideoCall'
        if (!systemIsPrepared) {
            console.warn("[RTC] System not prepared: media access not ready.");
            updateStatusDisplay('Media not ready, please wait.');
            return;
        }
        if (currentRemotePeerId && currentRemotePeerId !== targetUserId) {
            console.warn("[RTC] A call is already active or being initiated with a different peer.");
            updateStatusDisplay('Call already in progress with another user.');
            return;
        }
        if (currentRemotePeerId === targetUserId && rtcEndpoint) {
             console.info("[RTC] Already connected to this user or call in progress.");
             return;
        }

        currentRemotePeerId = targetUserId;
        jQ('#local-media-display').show(); // Ensure local video is visible
        updateStatusDisplay(`Calling ${currentRemotePeerId}...`);

        if (!rtcEndpoint) {
            initializePeerConnection();
        }

        // Add local media tracks to the peer connection.
        if (myMediaStream) {
            myMediaStream.getTracks().forEach(track => rtcEndpoint.addTrack(track, myMediaStream));
        } else {
            console.error("[RTC] Local media stream missing when attempting to add to peer connection. This should not happen if systemIsPrepared is true.");
            updateStatusDisplay('Local media stream unavailable.');
            return;
        }

        // Create an SDP offer and send it.
        rtcEndpoint.createOffer()
            .then(offer => rtcEndpoint.setLocalDescription(offer))
            .then(() => {
                dispatchSignalingMessage({ type: "sdp_offer", sdp: rtcEndpoint.localDescription }); // Renamed 'type' and 'data'
                updateStatusDisplay('Offer sent, awaiting answer.');
            })
            .catch(error => {
                console.error("[RTC] Error creating or setting local offer: ", error);
                updateStatusDisplay('Failed to send offer.');
                terminateActiveCall(); // Clean up on failure
            });
    };

    // Terminates the current active WebRTC call.
    appContext.terminateActiveCall = function() { // Renamed 'hangup' to 'terminateActiveCall'
        if (partnerMediaStream) {
            partnerMediaStream.getTracks().forEach(track => track.stop());
            partnerMediaStream = null;
        }
        if (rtcEndpoint) {
            rtcEndpoint.close();
            rtcEndpoint = null;
        }
        dispatchSignalingMessage({ type: "call_end_request" }); // Changed message type
        currentRemotePeerId = null;
        jQ('#remote-media-display').attr('src', '').hide(); // Clear and hide remote video
        jQ('#local-media-display').hide(); // Hide local video too
        linkActive = false; // Reset connection status
        updateStatusDisplay('Call ended.');
    };

    // Initializes the RTCPeerConnection object and sets up event handlers.
    function initializePeerConnection () { // Renamed 'createPeerConnection'
        rtcEndpoint = new RTCPeerConnection(iceServerConfiguration);

        // Handler for when ICE candidates are generated.
        rtcEndpoint.onicecandidate = function(event) {
            if (event.candidate) {
                dispatchSignalingMessage({ type: "ice_candidate", candidate: event.candidate });
            } else {
                console.log("[RTC] ICE gathering complete (all candidates sent/generated).");
            }
        };

        // Handler for when a remote track (audio/video) is received.
        rtcEndpoint.ontrack = function(event) {
            console.log("[RTC] Remote track received.", event);
            if (partnerVideoElement.srcObject !== event.streams[0]) {
                partnerVideoElement.srcObject = event.streams[0];
                partnerVideoElement.play();
                jQ('#remote-media-display').show();
                partnerMediaStream = event.streams[0]; // Store the remote stream
                updateStatusDisplay('Remote stream received.');
            }
        };

        // Handler for changes in the peer connection's overall state.
        rtcEndpoint.onconnectionstatechange = () => {
            console.log(`[RTC] Peer connection state changed: ${rtcEndpoint.connectionState}`);
            updateStatusDisplay(`Connection state: ${rtcEndpoint.connectionState}`);
            if (rtcEndpoint.connectionState === 'connected') {
                linkActive = true;
                console.log('[RTC] WebRTC connection successfully established.');
                updateStatusDisplay('Call established.');
            } else if (['disconnected', 'failed', 'closed'].includes(rtcEndpoint.connectionState)) {
                console.warn('[RTC] WebRTC connection lost, failed, or closed.');
                // Auto-terminate the call if connection drops unexpectedly.
                if (linkActive) { // Only if it was previously active
                    appContext.terminateActiveCall();
                }
            }
        };

        // Deprecated, but good for structural similarity to original.
        rtcEndpoint.onremovestream = function(event) {
            console.warn("[RTC] Remote stream removed (using deprecated onremovestream event).");
            partnerVideoElement.src = '';
            jQ('#remote-media-display').hide();
            updateStatusDisplay('Remote stream removed.');
        };
    }

    // --- Incoming Message Handling ---

    // Handler for incoming signaling messages from the application's connection.
    appContext.signalingChannel.onReceiveMessage(function(incomingMsg) { // Renamed 'onMessage' to 'onReceiveMessage'
        let remoteSdp,
            remoteIceCandidate,
            parsedRtcContent;

        // Verify message is for this client and contains RTC data.
        if (incomingMsg.rtcPayload && incomingMsg.recipient === localStorage.getItem('currentUserId')) { // Using localStorage.getItem for robustness
            parsedRtcContent = incomingMsg.rtcPayload;

            switch (parsedRtcContent.type) {
                case 'call_end_request': // Changed type
                    console.log('[RTC] Received hangup request.');
                    appContext.terminateActiveCall();
                    break;

                case 'sdp_offer': // Changed type
                    if (currentRemotePeerId && currentRemotePeerId !== incomingMsg.sender) {
                        console.warn(`[RTC] Ignoring offer from ${incomingMsg.sender} as already in call with ${currentRemotePeerId}`);
                        dispatchSignalingMessage({ type: 'busy_signal', to: incomingMsg.sender }); // Add new message type
                        return;
                    }
                    if (!systemIsPrepared) {
                        console.warn("[RTC] System not prepared for incoming offer.");
                        dispatchSignalingMessage({ type: 'not_ready', to: incomingMsg.sender });
                        return;
                    }

                    currentRemotePeerId = incomingMsg.sender; // Set remote ID from sender
                    console.log('[RTC] Received SDP offer:', parsedRtcContent.sdp);
                    updateStatusDisplay(`Incoming call from ${currentRemotePeerId}...`);

                    if (!rtcEndpoint) {
                        initializePeerConnection();
                    }

                    // Add local media tracks to the peer connection if not already added.
                    if (myMediaStream && rtcEndpoint.getSenders().length === 0) { // Check if tracks are already added
                        myMediaStream.getTracks().forEach(track => rtcEndpoint.addTrack(track, myMediaStream));
                    }

                    // Set remote description and create/send answer.
                    rtcEndpoint.setRemoteDescription(new RTCSessionDescription(parsedRtcContent.sdp))
                        .then(() => rtcEndpoint.createAnswer())
                        .then(answer => rtcEndpoint.setLocalDescription(answer))
                        .then(() => {
                            dispatchSignalingMessage({ type: "sdp_answer", sdp: rtcEndpoint.localDescription }); // Changed type and data
                            jQ('#local-media-display').show(); // Show local video on answer
                            updateStatusDisplay('Answer sent.');
                        })
                        .catch(error => {
                            console.error("[RTC] Error processing offer or creating answer: ", error);
                            updateStatusDisplay('Failed to answer call.');
                            appContext.terminateActiveCall(); // Clean up on failure
                        });
                    break;

                case 'sdp_answer': // Changed type
                    console.log('[RTC] Received SDP answer:', parsedRtcContent.sdp);
                    rtcEndpoint.setRemoteDescription(new RTCSessionDescription(parsedRtcContent.sdp))
                        .then(() => {
                            console.log('[RTC] Remote answer description set successfully.');
                            updateStatusDisplay('Call connected.');
                        })
                        .catch(error => {
                            console.error("[RTC] Error setting remote answer description: ", error);
                            updateStatusDisplay('Failed to set answer.');
                            appContext.terminateActiveCall(); // Clean up on failure
                        });
                    break;

                case 'ice_candidate': // Changed type
                    remoteIceCandidate = new RTCIceCandidate(parsedRtcContent.candidate);
                    rtcEndpoint.addIceCandidate(remoteIceCandidate)
                        .then(() => {
                            console.debug("[RTC] Added received ICE candidate.");
                        })
                        .catch(error => {
                            console.error("[RTC] Error adding received ICE candidate: ", error);
                        });
                    break;

                case 'busy_signal': // New message type
                    console.log(`[RTC] Remote peer ${incomingMsg.sender} is busy.`);
                    updateStatusDisplay(`${incomingMsg.sender} is busy.`);
                    appContext.terminateActiveCall();
                    break;

                case 'not_ready': // New message type
                    console.log(`[RTC] Remote peer ${incomingMsg.sender} is not ready.`);
                    updateStatusDisplay(`${incomingMsg.sender} is not ready.`);
                    appContext.terminateActiveCall();
                    break;

                default:
                    console.log("[RTC] Unhandled RTC message type:", parsedRtcContent.type);
                    break;
            }
        }
    });

    // --- UI Helper Functions ---

    // Updates a central status message displayed to the user.
    function updateStatusDisplay(message) {
        jQ('#rtc-status-indicator').text(`Status: ${message}`);
        console.log(`[UI Status] ${message}`);
    }

    // --- DOM Ready Setup ---

    // Execute when the DOM is fully loaded.
    jQ(function() {
        // Create a dedicated status display element if it doesn't exist.
        if (jQ('#rtc-status-indicator').length === 0) {
            jQ('body').prepend('<div id="rtc-status-indicator" style="position:fixed; top:10px; right:10px; background:rgba(0,0,0,0.8); color:white; padding:8px 12px; border-radius:5px; font-family:sans-serif; font-size:14px; z-index:1000;">Status: Initializing...</div>');
        }

        // Set initial visibility for video elements.
        jQ('#local-media-display').hide().css({
            'width': '300px', 'height': '225px', 'background': '#333', 'border': '1px solid #555',
            'position': 'fixed', 'bottom': '20px', 'right': '20px', 'z-index': '999', 'object-fit': 'cover'
        });
        jQ('#remote-media-display').hide().css({
            'width': '640px', 'height': '480px', 'background': '#000', 'border': '2px solid #0f0',
            'position': 'fixed', 'top': '0', 'left': '0', 'width': '100%', 'height': '100%', 'z-index': '998', 'object-fit': 'contain'
        });

        updateStatusDisplay('Application loaded.');
    });

})( window, window.jQuery );