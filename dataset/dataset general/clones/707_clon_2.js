// This file initializes a client-side chat interface.

DomManipulator(function(pageQuery) {

  // Declare core application state variables
  var participantName,
    previousSpeaker,
    connectionMetaData,
    isConnectedState = false;

  initializeApplication();
  pageQuery(window).unload(exitChatRoom);

  function initializeApplication() {
    pageQuery("#lobbyScreen").show();
    pageQuery("#chatRoomInterface").hide();
    pageQuery('#messageInput').focus();
    pageQuery('#alternativeServiceHost').attr('autocomplete', 'DISABLED');

    pageQuery("#joinButton").click(function(eventObject) {
      enterChatRoom();
      eventObject.preventDefault();
    });
    pageQuery("#leaveButton").click(exitChatRoom);

    pageQuery("#participantName").attr({
      "autocomplete": "DISABLED"
    }).keyup(function(eventObject) {
      if (eventObject.keyCode === 13) {
        enterChatRoom();
        eventObject.preventDefault();
      }
    });

    pageQuery("#messageInput").attr({
      "autocomplete": "DISABLED"
    }).keyup(function(eventObject) {
      if (eventObject.keyCode === 13) {
        dispatchMessage();
        eventObject.preventDefault();
      }
    });
    pageQuery("#sendButton").click(dispatchMessage);
  }

  function enterChatRoom() {
    participantName = pageQuery('#participantName').val();
    if (!participantName) {
      alert('Participant name is required!');
      return;
    }

    var alternativeServiceHost = pageQuery('#alternativeServiceHost').val();
    var serviceEndpoint =
      document.location.protocol + "//" +
      (alternativeServiceHost.length > 0 ? alternativeServiceHost : document.location.hostname) +
      ":" + document.location.port + "/cometd";

    console.log('Comet connection attempt to: ' + serviceEndpoint);

    pageQuery.comet.connect(serviceEndpoint);

    isConnectedState = true;

    pageQuery("#lobbyScreen").hide();
    pageQuery("#chatRoomInterface").show();
    pageQuery('#participantName').focus();

    // Set up subscriptions and initial join message
    pageQuery.comet.startBatch();
    pageQuery.comet.subscribe("/dialogue/sample", ingestMessage);
    pageQuery.comet.publish("/dialogue/sample", {
      participant: participantName,
      joined: true,
      dialogue: participantName + " has joined the conversation"
    });
    pageQuery.comet.endBatch();

    // Handle connection status updates
    if (connectionMetaData) {
      pageQuery.comet.unsubscribe(connectionMetaData);
    }
    connectionMetaData = pageQuery.comet.subscribe("/cometd/status", function(eventObject) {
      // debug: console.debug(eventObject);
      if (eventObject.action === "connectionHandshake") {
        if (eventObject.reconnectionAttempt) {
          if (eventObject.operationSuccessful) {
            pageQuery.comet.subscribe("/dialogue/sample", ingestMessage);
            pageQuery.comet.publish("/dialogue/sample", {
              participant: participantName,
              joined: true,
              dialogue: participantName + " has re-joined the conversation"
            });
          }
          ingestMessage({
            data: {
              joined: true,
              participant: "SYSTEM_AGENT",
              dialogue: "connectionHandshake " + (eventObject.operationSuccessful ? "Initial connection established" : "Connection failed")
            }
          });
        }
      } else if (eventObject.action === "connectionAttempt") {
        if (eventObject.operationSuccessful && !isConnectedState) {
          ingestMessage({
            data: {
              joined: true,
              participant: "SYSTEM_AGENT",
              dialogue: "Re-established connection!"
            }
          });
        }
        if (!eventObject.operationSuccessful && isConnectedState) {
          ingestMessage({
            data: {
              departed: true,
              participant: "SYSTEM_AGENT",
              dialogue: "Connection lost!"
            }
          });
        }
        isConnectedState = eventObject.operationSuccessful;
      }
    });
  }

  function dispatchMessage() {
    var messageInput = pageQuery("#messageInput");
    var messageContent = messageInput.val();
    messageInput.val("");

    if (!messageContent || !messageContent.length) {
      return false;
    }

    pageQuery.comet.publish("/dialogue/sample", {
      participant: participantName,
      dialogue: messageContent
    });
  }

  function ingestMessage(incomingPacket) {
    if (!incomingPacket.data) {
      window.console && console.warn("Malformed message packet " + incomingPacket);
      return;
    }

    if (incomingPacket.data instanceof Array) {
      var participantListHtml = "";
      for (var idx in incomingPacket.data) {
        participantListHtml += incomingPacket.data[idx] + "<br/>";
      }
      pageQuery('#active-participants').html(participantListHtml);
    } else {
      var conversationDisplay = pageQuery('#conversationDisplay');

      var senderIdentity = incomingPacket.data.participant;
      var isSystemNotification = incomingPacket.data.joined || incomingPacket.data.departed;
      var dialogueContent = incomingPacket.data.dialogue;

      if (!dialogueContent) {
        return;
      }

      if (!isSystemNotification && senderIdentity === previousSpeaker) {
        senderIdentity = "...";
      } else {
        previousSpeaker = senderIdentity;
        senderIdentity += ":";
      }

      if (isSystemNotification) {
        conversationDisplay.append("<span class=\"system-alert\"><span class=\"source-id\">" + senderIdentity + "&nbsp;</span><span class=\"content-text\">" + dialogueContent + "</span></span><br/>");
        previousSpeaker = "";
      } else {
        conversationDisplay.append("<span class=\"source-id\">" + senderIdentity + "&nbsp;</span><span class=\"content-text\">" + dialogueContent + "</span><br/>");
      }

      // Ensure the chat display scrolls to the latest message
      conversationDisplay[0].scrollTop = conversationDisplay[0].scrollHeight - conversationDisplay[0].clientHeight;
    }
  }

  function exitChatRoom() {
    if (!participantName) {
      return;
    }

    if (connectionMetaData) {
      pageQuery.comet.unsubscribe(connectionMetaData);
    }
    connectionMetaData = null;

    pageQuery.comet.startBatch();
    pageQuery.comet.unsubscribe("/dialogue/sample", ingestMessage);
    pageQuery.comet.publish("/dialogue/sample", {
      participant: participantName,
      departed: true,
      dialogue: participantName + " has left the conversation"
    });
    pageQuery.comet.endBatch();

    // Reset UI and connection state
    pageQuery("#lobbyScreen").show();
    pageQuery("#chatRoomInterface").hide();
    pageQuery('#participantName').focus();
    participantName = null;
    pageQuery.comet.disconnect();
    pageQuery('#active-participants').html("");
  }
});