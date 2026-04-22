var connConfig = { "iceServers": [{ "urls": "stun:stun.l.google.com:19302" }] },
    connOptions = { 'sctp': [{ 'negotiated': true }] };

// This section pertains to the initiating peer, often referred to as 'Alice'.

var peerClientA = new RTCPeerConnection(connConfig, connOptions),
    channelA = null,
    trackA = null;

// The `activeChannel` variable helps manage which data channel instance
// (from either peerClientA or peerClientB) is currently in use for communication.
var activeChannel;

var clientAIceReady = false;

// Initialize UI components to a hidden state
$('#showLocalOffer').modal('hide');
$('#getRemoteAnswer').modal('hide');
$('#waitForConnection').modal('hide');
$('#createOrJoin').modal('show');

// Event handler for the 'Create' button click
$('#createBtn').click(function() {
    $('#showLocalOffer').modal('show');
    generateLocalOffer();
});

// Event handler for the 'Join' button click
$('#joinBtn').click(function() {
    $('#getRemoteOffer').modal('show');
});

// Event handler for confirming the offer has been sent
$('#offerSentBtn').click(function() {
    $('#getRemoteAnswer').modal('show');
});

// Event handler for processing a received offer
$('#offerRecdBtn').click(function() {
    var remoteOfferString = $('#remoteOffer').val();
    var remoteOfferDescriptor = new RTCSessionDescription(JSON.parse(remoteOfferString));
    console.log("Incoming remote offer processed:", remoteOfferDescriptor);
    appendToChatDisplay("Incoming remote offer processed", "text-success");
    processIncomingOffer(remoteOfferDescriptor);
    $('#showLocalAnswer').modal('show');
});

// Event handler for confirming the answer has been sent
$('#answerSentBtn').click(function() {
    $('#waitForConnection').modal('show');
});

// Event handler for processing a received answer
$('#answerRecdBtn').click(function() {
    var remoteAnswerString = $('#remoteAnswer').val();
    var remoteAnswerDescriptor = new RTCSessionDescription(JSON.parse(remoteAnswerString));
    processRemoteAnswer(remoteAnswerDescriptor);
    $('#waitForConnection').modal('show');
});

// Event handler for file selection via input
$('#fileBtn').change(function() {
    var transferFile = this.files[0];
    console.log(transferFile);

    initiateFileTransfer(transferFile);
});

// Callback when a file transfer is successfully completed
function onFileTransferComplete(fileName) {
    console.log(fileName + " transfer completed");
}

// Callback for reporting file transfer progress
function onFileTransferProgress(fileName) {
    console.log(fileName + " transfer progress update");
}

// Function to start the file sending process
function initiateFileTransfer(filePayload) {
    if (filePayload.size) {
        FileTransferUtil.send({
          file: filePayload,
          onFileSent: onFileTransferComplete,
          onFileProgress: onFileTransferProgress,
        });
    }
}

// Function to send a text message through the data channel
function dispatchTextMessage() {
    if ($('#messageTextBox').val()) {
        var msgSession = new DataChannelManager(); // Assuming custom helper class
        appendToChatDisplay($('#messageTextBox').val(), "text-success");
        msgSession.send({message: $('#messageTextBox').val()});
        $('#messageTextBox').val("");

        // Ensure the chat display scrolls to the latest message.
        $('#chatlog').scrollTop($('#chatlog')[0].scrollHeight);
    }

    return false;
};

// Configures the data channel for the sending peer (Alice)
function configureSenderChannel() {
    try {
        var fileReceiverInstanceA = new FileReceptionHandler();
        channelA = peerClientA.createDataChannel('dataStream', { reliable: true });
        activeChannel = channelA;
        console.log("Data channel created for peer A");
        channelA.onopen = function (evt) {
            console.log('Data channel connection established');
            $('#waitForConnection').modal('hide');
            $('#waitForConnection').remove(); // Remove modal after connection
        }
        channelA.onmessage = function (evt) {
            console.log("Message received by peer A:", evt.data);
            if (evt.data.size) {
                fileReceiverInstanceA.receive(evt.data, {});
            }
            else {
                // Special handling for a specific Firefox issue where
                // a literal ASCII 2 byte might be sent initially.
                if (evt.data.charCodeAt(0) == 2) {
                   return;
                }
                console.log(evt);
                var incomingData = JSON.parse(evt.data);
                if (incomingData.type === 'file') {
                    fileReceiverInstanceA.receive(evt.data, {});
                }
                else {
                    appendToChatDisplay(incomingData.message, "text-info");
                    // Scroll chat display to show the newest entry.
                    $('#chatlog').scrollTop($('#chatlog')[0].scrollHeight);
                }
            }
        };
    } catch (err) { console.warn("Error setting up data channel for peer A:", err); }
}

// Creates the local WebRTC offer
function generateLocalOffer() {
    configureSenderChannel();
    peerClientA.createOffer(function (sessionDescription) {
        peerClientA.setLocalDescription(sessionDescription, function () {});
        console.log("Local offer generated:", sessionDescription);
    }, function () {console.warn("Failed to generate local offer");});
}

// Handler for ICE candidate events from peer A
peerClientA.onicecandidate = function (evt) {
    console.log("ICE candidate from peer A:", evt);
    if (evt.candidate == null) {
        $('#localOffer').html(JSON.stringify(peerClientA.localDescription));
    }
};

// Callback when the peer connection is successfully established
function onPeerConnectionEstablished() {
    console.log("Peer connection data channel is now active");
    appendToChatDisplay("Peer connection data channel is now active", "text-success");
    $('#waitForConnection').modal('hide');
    // Removing the modal prevents a race condition if it's re-shown.
    $('#waitForConnection').remove();
    $('#showLocalAnswer').modal('hide');
    $('#messageTextBox').focus();
}

peerClientA.onconnection = onPeerConnectionEstablished;

// Logs changes in the signaling state
function logSignalState(currentState) {
    console.info('Signaling state changed to:', currentState);
}

// Logs changes in the ICE connection state
function logIceConnState(currentState) {
    console.info('ICE connection state changed to:', currentState);
}

// Logs changes in the ICE gathering state
function logIceGatherState(currentState) {
    console.info('ICE gathering state changed to:', currentState);
}

peerClientA.onsignalingstatechange = logSignalState;
peerClientA.oniceconnectionstatechange = logIceConnState;
peerClientA.onicegatheringstatechange = logIceGatherState;

// Processes the answer received from peer B
function processRemoteAnswer(remoteAnswerDescriptor) {
    console.log("Remote answer received:", remoteAnswerDescriptor);
    appendToChatDisplay("Remote answer received", "text-success");
    peerClientA.setRemoteDescription(remoteAnswerDescriptor);
}

// Adds an ICE candidate received from peer B
function addRemoteIceCandidateB(candidateData) {
    peerClientA.addIceCandidate(candidateData);
}


// This section pertains to the answering peer, often referred to as 'Bob'.

var peerClientB = new RTCPeerConnection(connConfig, connOptions),
    channelB = null;

var clientBIceReady = false;

// Handler for when a data channel is received by peer B
peerClientB.ondatachannel = function (evt) {
    var fileReceiverInstanceB = new FileReceptionHandler();
    var incomingDataChannel = evt.channel || evt; // Adapt for browser differences
    console.log("Data channel received by peer B:", arguments);
    channelB = incomingDataChannel;
    activeChannel = channelB;
    channelB.onopen = function (evt) {
        console.log('Data channel connection established');
        $('#waitForConnection').modal('hide');
        $('#waitForConnection').remove();
    }
    channelB.onmessage = function (evt) {
        console.log("Message received by peer B:", evt.data);
        if (evt.data.size) {
            fileReceiverInstanceB.receive(evt.data, {});
        }
        else {
            var incomingData = JSON.parse(evt.data);
            if (incomingData.type === 'file') {
                fileReceiverInstanceB.receive(evt.data, {});
            }
            else {
                appendToChatDisplay(incomingData.message, "text-info");
                // Scroll chat display to show the newest entry.
                $('#chatlog').scrollTop($('#chatlog')[0].scrollHeight);
            }
        }
    };
};

// Processes the offer received from peer A
function processIncomingOffer(offerDescriptor) {
    peerClientB.setRemoteDescription(offerDescriptor);
    peerClientB.createAnswer(function (answerDescriptor) {
        appendToChatDisplay("Local answer created", "text-success");
        console.log("Local answer created:", answerDescriptor);
        peerClientB.setLocalDescription(answerDescriptor);
    }, function () { console.warn("Failed to create answer"); });
}

// Handler for ICE candidate events from peer B
peerClientB.onicecandidate = function (evt) {
    console.log("ICE candidate from peer B:", evt);
    if (evt.candidate == null)
       $('#localAnswer').html(JSON.stringify(peerClientB.localDescription));
};

peerClientB.onsignalingstatechange = logSignalState;
peerClientB.oniceconnectionstatechange = logIceConnState;
peerClientB.onicegatheringstatechange = logIceGatherState;

// Adds an ICE candidate received from peer A
function addRemoteIceCandidateA(candidateData) {
    peerClientB.addIceCandidate(candidateData);
}

// Handler for when a remote media stream is added
peerClientB.onaddstream = function (evt) {
    console.log("Remote media stream received:", evt);
    var audioPlayer = new Audio();
    audioPlayer.autoplay = true;
    attachMediaStream(audioPlayer, evt.stream);
};

peerClientB.onconnection = onPeerConnectionEstablished;

// Utility function to get the current time in a formatted string
function getCurrentTimeFormatted() {
    var totalSeconds = new Date().getTime() / 1000;
    var hours = parseInt(totalSeconds / 3600) % 24;
    var minutes = parseInt(totalSeconds / 60) % 60;
    var seconds = parseInt(totalSeconds % 60);

    var formattedTime = (hours < 10 ? "0" + hours : hours) + "-" +
                 (minutes < 10 ? "0" + minutes : minutes) + "-" +
                 (seconds  < 10 ? "0" + seconds : seconds);

    return formattedTime;
}

// Appends a message to the chat display area
function appendToChatDisplay(messageText, styleClass) {
    document.getElementById('chatlog').innerHTML += '<p class=\"' + styleClass + '\">' + "[" + getCurrentTimeFormatted() + "] " + messageText + '</p>';
}