/*
 * This JavaScript file contains the implementation for a WebRTC peer-to-peer
 * communication application. It supports both the caller (Alice) and the
 * answerer (Bob) roles within the same codebase.
 *
 * The application leverages RTCPeerConnection for establishing media
 * and data channels, and jQuery for DOM manipulation and event handling.
 *
 * Initial setup involves defining ICE servers and connection constraints.
 *
 * Further details regarding WebRTC basics can be found at:
 *   - http://www.html5rocks.com/en/tutorials/webrtc/basics/
 *   - https://code.google.com/p/webrtc-samples/source/browse/trunk/apprtc/index.html
 *   - https://webrtc-demos.appspot.com/html/pc1.html
 *
 * Please note that this code is designed for demonstration purposes.
 * Error handling and robustness might require further enhancements
 * for production environments.
 */


//  Configuration object for RTCPeerConnection.
//  Specifies ICE servers (e.g., STUN servers) for NAT traversal.
var cfg = { "iceServers": [ { "url": "stun:23.21.150.121" } ] }
//  Connection constraints for RTCPeerConnection.
//  Includes optional settings like DtlsSrtpKeyAgreement.
, con = { 'optional': [ { 'DtlsSrtpKeyAgreement': true } ] };


/*
 * THIS SECTION OF THE CODE HANDLES THE CALLER/SENDER ROLE, OFTEN REFERRED TO AS ALICE.
 * It initializes the peer connection and data channel for the initiating party.
 */


//  RTCPeerConnection instance for the caller (Alice).
var pc1 = new RTCPeerConnection(cfg, con)
//  DataChannel instance for pc1, initially null.
, dc1 = null
//  Another data channel variable, not used in this specific example but declared.
, tn1 = null;


//  A variable to keep track of the currently active data channel.
//  This is useful when handling multiple possible data channels in a single file.
var activedc;


//  Flag to indicate if ICE candidates for pc1 have been completely gathered.
var pc1icedone = false;


//  Hide various modal dialogs upon application startup.
//  These will be shown dynamically based on user interaction.
$('#showLocalOffer').modal('hide');
$('#getRemoteAnswer').modal('hide');
$('#waitForConnection').modal('hide');

//  Display the 'createOrJoin' modal to allow the user to choose their role.
$('#createOrJoin').modal('show');


//  Event handler for the 'Create' button click.
//  When clicked, it shows the 'showLocalOffer' modal and initiates the
//  process of creating a local WebRTC offer.
$('#createBtn').click(function() {
  $('#showLocalOffer').modal('show');
  createLocalOffer();
});


//  Event handler for the 'Join' button click.
//  When clicked, it displays the 'getRemoteOffer' modal, prompting the user
//  to input a remote offer.
$('#joinBtn').click(function() {
  $('#getRemoteOffer').modal('show');
});


//  Event handler for the 'Offer Sent' button click.
//  After the local offer has been generated and presumably sent to the remote peer,
//  this button transitions the UI to wait for the remote answer.
$('#offerSentBtn').click(function() {
  $('#getRemoteAnswer').modal('show');
});


//  Event handler for the 'Offer Received' button click.
//  This function processes the remote offer received from the caller.
$('#offerRecdBtn').click(function() {
  //  Retrieve the remote offer string from the input field.
  var offer = $('#remoteOffer').val();
  //  Parse the offer string and create an RTCSessionDescription object.
  var offerDesc = new RTCSessionDescription(JSON.parse(offer));

  //  Log the received offer for debugging purposes.
  console.log("Received remote offer", offerDesc);
  //  Write a message to the chat log indicating the receipt of the offer.
  writeToChatLog("Received remote offer", "text-success");

  //  Handle the offer, which typically involves setting it as the remote description
  //  and then creating a local answer.
  handleOfferFromPC1(offerDesc);

  //  Show the modal for displaying the local answer.
  $('#showLocalAnswer').modal('show');
});


//  Event handler for the 'Answer Sent' button click.
//  After the local answer has been generated and sent, this button
//  indicates that the application is waiting for the connection to establish.
$('#answerSentBtn').click(function() {
  $('#waitForConnection').modal('show');
});


//  Event handler for the 'Answer Received' button click.
//  This function processes the remote answer provided by the answerer.
$('#answerRecdBtn').click(function() {
  //  Get the remote answer string from the input field.
  var answer = $('#remoteAnswer').val();
  //  Parse the answer string and create an RTCSessionDescription object.
  var answerDesc = new RTCSessionDescription(JSON.parse(answer));

  //  Process the remote answer.
  handleAnswerFromPC2(answerDesc);

  //  Show the 'waitForConnection' modal, indicating that the connection is being established.
  $('#waitForConnection').modal('show');
});


//  Event handler for the file input change event.
//  Triggered when a user selects a file to send.
$('#fileBtn').change(function() {
  //  Get the first selected file.
  var file = this.files[0];
  //  Log the file object to the console for inspection.
  console.log(file);

  //  Initiate the file sending process.
  sendFile(file);
});


//  Callback function executed when a file has been successfully sent.
//  @param {File} file - The file that was sent.
function fileSent(file) {
  console.log(file + " sent");
}


//  Callback function executed to report progress during file transfer.
//  @param {File} file - The file for which progress is being reported.
function fileProgress(file) {
  console.log(file + " progress");
}


//  Function to send a file over the data channel.
//  @param {Blob|File} data - The file or blob data to be sent.
function sendFile(data) {
  //  Check if the data has a size, indicating it's a valid file or blob.
  if (data.size) {
    //  Use the FileSender utility to handle the file transfer.
    FileSender.send({
      file: data,
      onFileSent: fileSent,
      onFileProgress: fileProgress,
    });
  }
}


//  Function to send a text message via the data channel.
//  This function is typically triggered by a form submission or button click.
function sendMessage() {
  //  Check if the message text box contains any content.
  if ($('#messageTextBox').val()) {
    //  Create a new RTCMultiSession channel (assuming this is a custom utility).
    var channel = new RTCMultiSession();
    //  Write the message to the local chat log.
    writeToChatLog($('#messageTextBox').val(), "text-success");
    //  Send the message through the channel.
    channel.send({
      message: $('#messageTextBox').val()
    });
    //  Clear the message text box after sending.
    $('#messageTextBox').val("");

    //  Scroll the chat log to the bottom to display the latest message.
    $('#chatlog').scrollTop($('#chatlog')[0].scrollHeight);
  }

  //  Prevent default form submission behavior.
  return false;
}


//  Function to set up DataChannel 1 (dc1) for the caller (pc1).
//  This includes creating the data channel and defining its event handlers.
function setupDC1() {
  try {
    //  Initialize a FileReceiver instance to handle incoming file chunks.
    var fileReceiver1 = new FileReceiver();
    //  Create a reliable data channel named 'test' on pc1.
    dc1 = pc1.createDataChannel('test', {
      reliable: true
    });
    //  Set the active data channel to dc1.
    activedc = dc1;
    console.log("Created datachannel (pc1)");

    //  Define the 'onopen' event handler for dc1.
    //  This fires when the data channel connection is established.
    dc1.onopen = function(e) {
      console.log('data channel connect');
      //  Hide and remove the 'waitForConnection' modal once connected.
      $('#waitForConnection').modal('hide');
      $('#waitForConnection').remove();
    }

    //  Define the 'onmessage' event handler for dc1.
    //  This fires when data is received over the channel.
    dc1.onmessage = function(e) {
      console.log("Got message (pc1)", e.data);
      //  If the received data has a 'size' property, it's likely a file chunk.
      if (e.data.size) {
        fileReceiver1.receive(e.data, {});
      }
      //  Otherwise, it's a text message or control data.
      else {
        //  Special handling for an ASCII 2 character, observed in Firefox.
        //  This character can cause JSON.parse to fail.
        if (e.data.charCodeAt(0) == 2) {
          //  Ignoring this specific character.
          return;
        }

        //  Log the event for debugging.
        console.log(e);
        //  Attempt to parse the incoming data as JSON.
        var data = JSON.parse(e.data);

        //  If the data indicates a file transfer, pass it to the file receiver.
        if (data.type === 'file') {
          fileReceiver1.receive(e.data, {});
        }
        //  Otherwise, assume it's a chat message and display it.
        else {
          writeToChatLog(data.message, "text-info");
          //  Scroll the chat log to the bottom to show the newest message.
          $('#chatlog').scrollTop($('#chatlog')[0].scrollHeight);
        }
      }
    };
  } catch (e) {
    //  Catch and log any errors during data channel setup.
    console.warn("No data channel (pc1)", e);
  }
}


//  Function to create a local WebRTC offer for pc1.
//  This involves setting up the data channel and then initiating the offer creation.
function createLocalOffer() {
  setupDC1(); //  First, set up the data channel.

  //  Create the offer, providing success and error callbacks.
  pc1.createOffer(function(desc) {
    //  On successful offer creation, set it as the local description.
    pc1.setLocalDescription(desc, function() {});
    console.log("created local offer", desc);
  }, function() {
    //  Log a warning if offer creation fails.
    console.warn("Couldn't create offer");
  });
}


//  Event handler for pc1's 'onicecandidate' event.
//  This is triggered when a new ICE candidate is found.
pc1.onicecandidate = function(e) {
  console.log("ICE candidate (pc1)", e);
  //  If e.candidate is null, it signifies that ICE gathering is complete.
  if (e.candidate == null) {
    //  Display the complete local description (including ICE candidates) in the UI.
    $('#localOffer').html(JSON.stringify(pc1.localDescription));
  }
};


//  Function called when the data channel connection is established.
//  It updates the UI and logs the connection status.
function handleOnconnection() {
  console.log("Datachannel connected");
  writeToChatLog("Datachannel connected", "text-success");
  //  Hide the 'waitForConnection' modal.
  $('#waitForConnection').modal('hide');
  //  Remove the modal from the DOM to prevent re-showing issues.
  //  This prevents a race condition where it might be shown again
  //  if the 'answerSentBtn' is clicked before this handler runs.
  $('#waitForConnection').remove();
  //  Hide the 'showLocalAnswer' modal if it's still visible.
  $('#showLocalAnswer').modal('hide');
  //  Set focus on the message input box for immediate typing.
  $('#messageTextBox').focus();
}


//  Assign the 'handleOnconnection' function to pc1's 'onconnection' event.
//  Note: 'onconnection' is a deprecated event, typically replaced by
//  checking 'iceConnectionState' or 'dataChannel.onopen'.
pc1.onconnection = handleOnconnection;


//  Event handler for signaling state changes.
//  Logs the current signaling state of the peer connection.
function onsignalingstatechange(state) {
  console.info('signaling state change:', state);
}


//  Event handler for ICE connection state changes.
//  Logs the current ICE connection state.
function oniceconnectionstatechange(state) {
  console.info('ice connection state change:', state);
}


//  Event handler for ICE gathering state changes.
//  Logs the current ICE gathering state.
function onicegatheringstatechange(state) {
  console.info('ice gathering state change:', state);
}


//  Assign the state change handlers to pc1's corresponding events.
pc1.onsignalingstatechange = onsignalingstatechange;
pc1.oniceconnectionstatechange = oniceconnectionstatechange;
pc1.onicegatheringstatechange = onicegatheringstatechange;


//  Function to handle receiving a remote answer from PC2 (Bob).
//  @param {RTCSessionDescription} answerDesc - The session description for the answer.
function handleAnswerFromPC2(answerDesc) {
  console.log("Received remote answer: ", answerDesc);
  writeToChatLog("Received remote answer", "text-success");
  //  Set the received answer as the remote description for pc1.
  pc1.setRemoteDescription(answerDesc);
}


//  Function to handle receiving an ICE candidate from PC2 (Bob).
//  @param {RTCIceCandidate} iceCandidate - The ICE candidate to add.
function handleCandidateFromPC2(iceCandidate) {
  pc1.addIceCandidate(iceCandidate);
}


/*
 * THIS SECTION OF THE CODE HANDLES THE ANSWERER/RECEIVER ROLE, OFTEN REFERRED TO AS BOB.
 * It initializes the peer connection and listens for incoming data channels and offers.
 */


//  RTCPeerConnection instance for the answerer (Bob).
var pc2 = new RTCPeerConnection(cfg, con)
//  DataChannel instance for pc2, initially null.
, dc2 = null;


//  Flag to indicate if ICE candidates for pc2 have been completely gathered.
var pc2icedone = false;


//  Event handler for pc2's 'ondatachannel' event.
//  This is triggered when a remote data channel is opened by the peer.
pc2.ondatachannel = function(e) {
  //  Initialize a FileReceiver to handle incoming files on this channel.
  var fileReceiver2 = new FileReceiver();
  //  Extract the data channel object from the event.
  //  Chrome sends an event object, Firefox sends the raw channel.
  var datachannel = e.channel || e;
  console.log("Received datachannel (pc2)", arguments);

  //  Assign the received channel to dc2 and set it as the active channel.
  dc2 = datachannel;
  activedc = dc2;

  //  Define the 'onopen' event handler for the received data channel.
  dc2.onopen = function(e) {
    console.log('data channel connect');
    //  Hide and remove the 'waitForConnection' modal once connected.
    $('#waitForConnection').modal('hide');
    $('#waitForConnection').remove();
  }

  //  Define the 'onmessage' event handler for the received data channel.
  dc2.onmessage = function(e) {
    console.log("Got message (pc2)", e.data);
    //  If the received data has a 'size' property, treat it as a file chunk.
    if (e.data.size) {
      fileReceiver2.receive(e.data, {});
    }
    //  Otherwise, it's a text message or control data.
    else {
      //  Parse the incoming data as JSON.
      var data = JSON.parse(e.data);
      //  If the data indicates a file transfer, pass it to the file receiver.
      if (data.type === 'file') {
        fileReceiver2.receive(e.data, {});
      }
      //  Otherwise, assume it's a chat message and display it.
      else {
        writeToChatLog(data.message, "text-info");
        //  Scroll the chat log to the bottom for the latest message.
        $('#chatlog').scrollTop($('#chatlog')[0].scrollHeight);
      }
    }
  };
};


//  Function to handle receiving a remote offer from PC1 (Alice).
//  @param {RTCSessionDescription} offerDesc - The session description for the offer.
function handleOfferFromPC1(offerDesc) {
  //  Set the received offer as the remote description for pc2.
  pc2.setRemoteDescription(offerDesc);

  //  Create a local answer to the received offer.
  pc2.createAnswer(function(answerDesc) {
    writeToChatLog("Created local answer", "text-success");
    console.log("Created local answer: ", answerDesc);
    //  Set the created answer as the local description for pc2.
    pc2.setLocalDescription(answerDesc);
  }, function() {
    //  Log a warning if answer creation fails.
    console.warn("No create answer");
  });
}


//  Event handler for pc2's 'onicecandidate' event.
//  This is triggered when a new ICE candidate is found for pc2.
pc2.onicecandidate = function(e) {
  console.log("ICE candidate (pc2)", e);
  //  If e.candidate is null, it means ICE gathering is complete.
  if (e.candidate == null)
  //  Display the complete local description (including ICE candidates) in the UI.
    $('#localAnswer').html(JSON.stringify(pc2.localDescription));
};


//  Assign the common state change handlers to pc2's corresponding events.
pc2.onsignalingstatechange = onsignalingstatechange;
pc2.oniceconnectionstatechange = oniceconnectionstatechange;
pc2.onicegatheringstatechange = onicegatheringstatechange;


//  Function to handle receiving an ICE candidate from PC1 (Alice).
//  @param {RTCIceCandidate} iceCandidate - The ICE candidate to add.
function handleCandidateFromPC1(iceCandidate) {
  pc2.addIceCandidate(iceCandidate);
}


//  Event handler for pc2's 'onaddstream' event.
//  This is triggered when a remote media stream is added to the connection.
pc2.onaddstream = function(e) {
  console.log("Got remote stream", e);
  //  Create a new audio element.
  var el = new Audio();
  //  Enable autoplay for the audio element.
  el.autoplay = true;
  //  Attach the remote media stream to the audio element.
  //  Note: 'attachMediaStream' is a non-standard helper function.
  attachMediaStream(el, e.stream);
};


//  Assign the 'handleOnconnection' function to pc2's 'onconnection' event.
//  This is for handling the data channel connection status.
pc2.onconnection = handleOnconnection;


//  Helper function to generate a formatted timestamp (HH:MM:SS).
//  This timestamp is used for logging chat messages.
function getTimestamp() {
  //  Get the current time in milliseconds and convert to total seconds.
  var totalSec = new Date().getTime() / 1000;
  //  Calculate hours, minutes, and seconds.
  var hours = parseInt(totalSec / 3600) % 24;
  var minutes = parseInt(totalSec / 60) % 60;
  var seconds = parseInt(totalSec % 60);

  //  Format the time components with leading zeros if necessary.
  var result = (hours < 10 ? "0" + hours : hours) + ":" +
    (minutes < 10 ? "0" + minutes : minutes) + ":" +
    (seconds < 10 ? "0" + seconds : seconds);

  return result;
}


//  Function to write a message to the chat log displayed in the UI.
//  @param {string} message - The text message to display.
//  @param {string} message_type - CSS class to apply for styling (e.g., "text-success", "text-info").
function writeToChatLog(message, message_type) {
  //  Append a new paragraph element with the message and timestamp to the chat log.
  //  The message_type class is applied for visual differentiation.
  document.getElementById('chatlog').innerHTML += '<p class=\"' + message_type + '\">' + "[" + getTimestamp() + "] " + message + '</p>';
}