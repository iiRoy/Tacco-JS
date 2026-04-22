var peerDialogueViewMaker = _.template(' \
	<div  style=" margin : 16px ; "  id="message-<%= uniqueId %>"> \
		<span  style=" color: #929197 ; font-size: 12px ; display: <%= dialogueType %> "  class="speakerName" > <%= speaker %> </span> \
		<div  class="row"  style=" border-radius : 16px ; padding : 8px 16px 8px 16px ; background-color : #e6e5eb ; "> \
			<%= content %> \
		</div> \
	</div>'
);

var selfDialogueViewMaker = _.template(' \
	<div  style=" margin : 16px ; "> \
		<div  class="row"  style=" border-radius : 16px ; padding : 8px 16px 8px 16px ; background-color : #027bfe ; color : #fbfeff ; "> \
			<%= content %> \
		</div> \
	</div>'
);

var currentRecipient; // Holds the ID of the person or group currently chatting
var lastFetchedDialogue = ""; // Stores the content of the very last message

function retrieveRecipientIdentifier() {
	// Fetches the unique identifier for the current chat session
	return $('#chatWindow').attr('recipient-data');
}

function refreshDialogueDisplay() {
	var isGroupConversation = false; // Flag to check if it's a group chat
	var groupName = ""; // This variable is not actually used, but kept for structural similarity.
	currentRecipient = retrieveRecipientIdentifier().trim();

	// Determine if the recipient is a group or individual
	if (currentRecipient.includes('-group')) {
		$("#recipientNameDisplay").text(currentRecipient.split('-group')[0]);
		currentRecipient = 'group' + currentRecipient.split('-group')[1];
		isGroupConversation = true;
	} else if (currentRecipient.indexOf('@') === -1) {
		// Attempt to get a human-readable name from a phone number
		$.get("/fetchNameByPhoneNumber/" + currentRecipient, function(returnedData) {
			if (returnedData.trim() === "") {
				$("#recipientNameDisplay").text(currentRecipient);
				return;
			}

			$("#recipientNameDisplay").text(returnedData);
		});
	} else {
		$("#recipientNameDisplay").text(currentRecipient);
	}

	// Retrieve all messages for the current recipient
	$.get("/retrieveAllDialoguesForRecipient/" + currentRecipient, function(dialogueData) {
		$("#dialoguePanel").empty(); // Clear existing messages
		$.each(dialogueData, function(idx, individualMessage) {
			if (individualMessage.sender === "self") { // Check if the message was sent by 'me'
				$("#dialoguePanel").append(
					selfDialogueViewMaker({content: individualMessage.content})
				);
			} else { // Message from another participant
				$("#dialoguePanel").append(
					peerDialogueViewMaker({
						speaker: individualMessage.sender,
						content: individualMessage.content,
						dialogueType: ((isGroupConversation) ? 'block' : 'none'),
						uniqueId: idx
					})
				);

				if (isGroupConversation) {
					// For group chats, try to resolve sender's name
					$.get("/fetchNameByPhoneNumber/" + individualMessage.sender, function(returnedName) {
						if (returnedName.trim() === "") {
							return;
						}

						$("#message-" + idx).find('.speakerName').text(returnedName);
					});
				}
			}
			lastFetchedDialogue = individualMessage.content; // Update the last message tracker
		});
		$('#chatWindow').removeClass('hidden'); // Show the chat interface
		$('#contactListWindow').addClass('hidden'); // Hide the contact list
		$("html, body").animate({ scrollTop: $(document).height() }, "fast"); // Scroll to bottom
	});
}

// Periodically check for new messages
setInterval(function() {
	if (!currentRecipient) { // If no recipient is selected, do nothing
		return;
	}

	$.get("/getLatestDialogueForRecipient/" + currentRecipient, function(responsePayload) {
		if (responsePayload.dialogue !== lastFetchedDialogue) {
			refreshDialogueDisplay(); // Reload all messages if a new one is detected
		} else {
			// console.log('No new messages; current last message is: ' + responsePayload.dialogue);
		}
	});
}, 5000); // Check every 5 seconds

var inputSubmissionHandler = function(keyboardEvent) {
	// console.log(keyboardEvent);
	var keyCodeValue = parseInt(keyboardEvent.keyCode ? keyboardEvent.keyCode : keyboardEvent.which);
	if (keyCodeValue === 13) { // If Enter key is pressed
		var inputMessage = $('#dialogueInputBox').val();
		$('#dialogueInputBox').val(''); // Clear the input field
		$.ajax({
			method: "POST",
			url: "/dispatchNewDialogue",
			payload: { recipientId: currentRecipient, dialogueContent: inputMessage },
			successCallback: function() {
				refreshDialogueDisplay(); // Reload messages after sending
			},
			dataType: "json"
		});
	}
};

var returnToContactDirectory = function() {
	$('#chatWindow').addClass('hidden'); // Hide the chat window
	$('#contactListWindow').removeClass('hidden'); // Show the contact list again
};