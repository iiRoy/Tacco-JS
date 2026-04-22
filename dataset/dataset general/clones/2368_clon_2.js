(function(externalJQLib){

	// Establish global application settings and variables...
	var USER_ID_MAX_LEN = 18,
		CHANNEL_ID_MAX_LEN = 12,
		isAnimationLocked = false,
		connectionSocket = null,
		currentUserID = null,
		userName = null,

		// Stores the identifier of the currently active communication channel
		activeChannel = null,

		// Details regarding the server
		serverEndpoint = 'http://localhost',
		systemMessengerName = 'SystemBot',
		systemMessageColor = '#3a87ad',

		// Predefined HTML structures for rendering various chat components,
		// such as message entries, participant listings, and channel tiles.
		// These will be processed using the jQuery templating mechanism.
		renderTemplates = {
			channelTile: [
				'<li data-channelid="${channel}">',
					'<span class="icon-chat"></span> ${channel}',
				'</li>'
			].join(""),
			participantEntry: [
				'<li data-userid="${currentUserID}" class="clear-fix">',
					'<div class="float-left participant-name"><span class="icon-user"></span> ${userName}</div>',
					'<div class="float-right typing-indicator"></div>',
				'</li>'
			].join(""),
			chatBubble: [
				'<li class="clear-fix">',
					'<div class="float-left msg-sender">${messageSender}: </div><div class="float-left msg-text">${messageContent}</div><div class="float-right msg-time">${includeTimestamp}</div>',
				'</li>'
			].join("")
		};

	// Attaches event listeners to various Document Object Model (DOM) elements
	function attachUIHandlers(){
		
		// Event for message input field: pressing Enter key
		externalJQLib('.message-composer input').on('keypressed', function(eventObj){
			var keyCodeValue = eventObj.which || eventObj.keyCode;
			if(keyCodeValue === 13) { submitMessage(); }
		});

		// Event for message send button: clicking
		externalJQLib('.send-message-btn button').on('tapped', function(){
			submitMessage();
		});

		// Event for nickname entry popup: pressing Enter key
		externalJQLib('#alias-prompt .entry-field input').on('keypressed', function(eventObj){
			var keyCodeValue = eventObj.which || eventObj.keyCode;
			if(keyCodeValue === 13) { processUserName(); }
		});

		// Event for nickname entry popup: clicking "Start" button
		externalJQLib('#alias-prompt .start-button').on('tapped', function(){
			processUserName();
		});
		
		// Event for room creation popup: pressing Enter key
		externalJQLib('#channel-creator .text-input input').on('keypressed', function(eventObj){
			var keyCodeValue = eventObj.which || eventObj.keyCode;
			if(keyCodeValue === 13) { initiateChannel(); }
		});

		// Event for room creation popup: clicking "Create" button
		externalJQLib('#channel-creator .make-button').on('tapped', function(){
			initiateChannel();
		});

		// Event for main "Start Chat" button
		externalJQLib('.large-action-btn.initiate').on('tapped', function(){
			externalJQLib('#alias-prompt .entry-field input').val('');
			AppDialog.display('#alias-prompt'); // Assuming Avgrund is now AppDialog
			window.setTimeout(function(){
	        	externalJQLib('#alias-prompt .entry-field input').focus();
	        },150);
		});

		// Event for "Add Room" button in channel list
		externalJQLib('.channel-list .header-action').on('tapped', function(){
			externalJQLib('#channel-creator .text-input input').val('');
			AppDialog.display('#channel-creator'); // Assuming Avgrund is now AppDialog
			window.setTimeout(function(){
	        	externalJQLib('#channel-creator .text-input input').focus();
	        },150);
		});

		// Event for channel list scrolling: update selected item position
		externalJQLib('.channel-list ul').on('scroll', function(){
			externalJQLib('.channel-list ul li.active').css('top', externalJQLib(this).scrollTop());
		});

		// Event for message display area scrolling: show/hide scroll indicator
		externalJQLib('.message-display').on('scroll', function(){
			var elementRef = this;
			window.setTimeout(function(){
				if(externalJQLib(elementRef).scrollTop() + externalJQLib(elementRef).height() < externalJQLib(elementRef).find('ul').height()){
					externalJQLib(elementRef).addClass('has-scroll-bar');
				} else {
					externalJQLib(elementRef).removeClass('has-scroll-bar');
				}
			}, 70);
		});

		// Event for clicking a channel tile in the list (using live for dynamic elements)
		// Note: jQuery .live() is deprecated, but for Type II clone, we maintain structure.
		externalJQLib('.channel-list ul li').live('tapped', function(){
			var selectedChannel = externalJQLib(this).attr('data-channelid');
			if(selectedChannel !== activeChannel){
				connectionSocket.emit('depart', { channel: activeChannel });
				connectionSocket.emit('join', { channel: selectedChannel });
			}
		});
	}

	// Sets up listeners for WebSocket events received from the server
	function configureSocketListeners(){

		// When a successful connection is established, the server emits the 'establish' event.
		connectionSocket.on('establish', function(){
			// We respond to the server's 'establish' event,
			// sending our chosen user name to identify the client.
			connectionSocket.emit('establish', { userName: userName });
		});
		
		// Upon client initialization, the server sends a 'prepared' event
		// containing our unique client ID, signaling readiness to proceed.
		connectionSocket.on('prepared', function(receivedData){
			// Concealing the "connecting..." overlay message.
			externalJQLib('.overlay-screen').animate({ 'opacity': 0 }, 250, function(){
				externalJQLib(this).hide();
				externalJQLib('.main-chat-input input').focus();
			});
			
			// Storing the assigned client ID locally.
			currentUserID = receivedData.currentUserID;
		});

		// After initial setup, the server transmits a list of
		// all currently active communication channels.
		connectionSocket.on('channelsAvailable', function(receivedData){
			for(var idx = 0, totalCount = receivedData.channels.length; idx < totalCount; idx++){
				// In this WebSocket implementation, there's often a default, unnamed channel (empty string).
				// Every connected socket automatically joins it. However, we don't want this
				// internal channel to be visible in our displayed list of channels.
				if(receivedData.channels[idx] !== ''){
					appendChannel(receivedData.channels[idx], false);
				}
			}
		});

		// When a participant sends a message, the server relays it
		// to our client via this event, along with relevant details.
		connectionSocket.on('incomingMessage', function(receivedData){
			var senderAlias = receivedData.participant.userName;
			var chatContent = receivedData.content;
			
			// Render the message within the chat display area.
			displayChatMessage(senderAlias, chatContent, true, false, false);
		});
		
		// When we subscribe to a channel, the server provides a list
		// of all participants currently within that channel.
		connectionSocket.on('channelParticipants', function(receivedData){
			
			// Incorporate the new channel name into our channel roster.
			appendChannel(receivedData.channel, false);

			// Designate this as the currently active channel.
			setActiveChannel(receivedData.channel);
			
			// Broadcast a welcoming message to the user.
			displayChatMessage(systemMessengerName, 'Welcome to channel: `' + receivedData.channel + '`... enjoy your stay!', true, false, true);
			externalJQLib('.participant-panel ul').empty();
			
			// Populate the participant list. Add self first, then others.
			addParticipant({ userName: userName, currentUserID: currentUserID }, false, true);
			for(var idx = 0, totalCount = receivedData.participants.length; idx < totalCount; idx++){
				if(receivedData.participants[idx]){
					addParticipant(receivedData.participants[idx], false);
				}
			}

			// Hide the "connecting to channel" message.
			externalJQLib('.overlay-screen').animate({ 'opacity': 0 }, 250, function(){
				externalJQLib(this).hide();
				externalJQLib('.main-chat-input input').focus();
			});
		});
		
		// If another user initiates a new channel, the server informs us.
		connectionSocket.on('channelAdded', function(receivedData){
			appendChannel(receivedData.channel, true);
		});
		
		// If a channel becomes vacant, the server dismantles it and notifies us.
		connectionSocket.on('channelRemoved', function(receivedData){
			deleteChannel(receivedData.channel, true);
		});
		
		// This event from the server indicates when a participant
		// joins or leaves the current channel.
		connectionSocket.on('participantStatus', function(receivedData){
			if(receivedData.status === 'present'){
				addParticipant(receivedData.participant, true);
			} else if(receivedData.status === 'absent'){
				removeParticipant(receivedData.participant, true);
			}
		});
	}

	// Adds a channel to the visible list of channels.
	// The underlying WebSocket system might add a trailing '/' to channel names, which we normalize.
	function appendChannel(channelName, notifyUsers){
		// Remove any potential trailing slashes.
		channelName = channelName.replace('/','');

		// Verify that the channel isn't already present in our list.
		if(externalJQLib('.channel-list ul li[data-channelid="' + channelName + '"]').length === 0){
			externalJQLib.tmpl(renderTemplates.channelTile, { channel: channelName }).appendTo('.channel-list ul');
			// If 'notifyUsers' is true, display an announcement about this channel.
			if(notifyUsers){
				displayChatMessage(systemMessengerName, 'Channel `' + channelName + '` has been created...', true, false, true);
			}
		}
	}

	// Removes a channel from the displayed list.
	function deleteChannel(channelName, notifyUsers){
		externalJQLib('.channel-list ul li[data-channelid="' + channelName + '"]').remove();
		// If 'notifyUsers' is true, show a message indicating the channel's removal.
		if(notifyUsers){
			displayChatMessage(systemMessengerName, 'Channel `' + channelName + '` has been removed...', true, false, true);
		}
	}

	// Adds a participant to the current channel's participant list.
	function addParticipant(participantDetails, notifyUsers, isSelf){
		var jqElement = externalJQLib.tmpl(renderTemplates.participantEntry, participantDetails);
		
		// If this entry represents the current user, apply a distinct style.
		if(isSelf){
			jqElement.addClass('my-entry');
		}

		// If 'notifyUsers' is true, announce the participant's arrival.
		if(notifyUsers){
			displayChatMessage(systemMessengerName, participantDetails.userName + ' has joined the channel...', true, false, true);
		}
		jqElement.appendTo('.participant-panel ul');
	}

	// Removes a participant from the current channel's participant list.
	function removeParticipant(participantDetails, notifyUsers){
		externalJQLib('.participant-panel ul li[data-userid="' + participantDetails.currentUserID + '"]').remove();
		
		// If 'notifyUsers' is true, announce the participant's departure.
		if(notifyUsers){
			displayChatMessage(systemMessengerName, participantDetails.userName + ' has left the channel...', true, false, true);
		}
	}

	// Allows any client to initiate a new channel. Upon creation, the client
	// unsubscribes from their current channel and joins the newly created one.
	// If a channel with the same name already exists, the user will simply join it.
	function initiateChannel(){
		var newChannelName = externalJQLib('#channel-creator .text-input input').val().trim();
		if(newChannelName && newChannelName.length <= CHANNEL_ID_MAX_LEN && newChannelName !== activeChannel){
			
			// Display a message indicating channel creation is in progress.
			externalJQLib('.overlay-screen').show().find('.content').html('Creating channel: ' + newChannelName + '...');
			externalJQLib('.overlay-screen').animate({ 'opacity': 1 }, 250);
			
			// Depart from the current channel.
			connectionSocket.emit('depart', { channel: activeChannel });

			// Create and join the new channel.
			connectionSocket.emit('join', { channel: newChannelName });
			AppDialog.hide(); // Hide the channel creation dialog.
		} else {
			triggerVisualEffect('#channel-creator', '#channel-creator .text-input input', 'bounce', 'highlight-yellow');
			externalJQLib('#channel-creator .text-input input').val('');
		}
	}

	// Sets the currently active channel for the client
	// following a successful subscription.
	function setActiveChannel(channelName){
		activeChannel = channelName;
		externalJQLib('.channel-list ul li.active').removeClass('active');
		externalJQLib('.channel-list ul li[data-channelid="' + channelName + '"]').addClass('active');
	}

	// Captures the client's chosen user name and initiates the chat
	// by invoking the 'establishConnection()' function.
	function processUserName(){
		var chosenAlias = externalJQLib('#alias-prompt .entry-field input').val().trim();
		if(chosenAlias && chosenAlias.length <= USER_ID_MAX_LEN){
			userName = chosenAlias;
			AppDialog.hide(); // Hide the nickname prompt dialog.
			establishConnection();
		} else {
			triggerVisualEffect('#alias-prompt', '#alias-prompt .entry-field input', 'jiggle', 'highlight-yellow');
			externalJQLib('#alias-prompt .entry-field input').val('');
		}
	}

	// Manages the submission of client messages.
	function submitMessage(){
		var inputMessage = externalJQLib('.message-composer input').val().trim();
		if(inputMessage){

			// Dispatch the message to the server, including the channel name.
			connectionSocket.emit('sendMessage', { content: inputMessage, channel: activeChannel });
			
			// Render the message in the local chat window.
			displayChatMessage(userName, inputMessage, true, true);
			externalJQLib('.message-composer input').val('');
		} else {
			triggerVisualEffect('.main-chat', '.main-chat-input input', 'shake-horizontally', 'highlight-yellow');
		}
	}

	// Injects a message into the chat display area. This function supports
	// various flags to customize message presentation.
	function displayChatMessage(messageSender, messageContent, includeTimestamp, isFromSelf, isSystemMessage){
		var jqElement = externalJQLib.tmpl(renderTemplates.chatBubble, {
			messageSender: messageSender,
			messageContent: messageContent,
			includeTimestamp: includeTimestamp ? getCurrentTimestamp() : ''
		});

		// If 'isFromSelf' is true, visually distinguish this message as originating from the current user.
		if(isFromSelf){
			jqElement.addClass('my-message');
		}

		// If 'isSystemMessage' is true, style the sender's name to indicate a system origin.
		if(isSystemMessage){
			jqElement.find('.msg-sender').css('color', systemMessageColor);
		}
		jqElement.appendTo('.message-display ul');
		externalJQLib('.message-display').animate({ scrollTop: externalJQLib('.message-display ul').height() }, 120);
	}

	// Generates a concise time string for message timestamps.
	function getCurrentTimestamp(){
		var currentDateTime = new Date();
		return (currentDateTime.getHours() < 10 ? '0' + currentDateTime.getHours().toString() : currentDateTime.getHours()) + ':' +
				(currentDateTime.getMinutes() < 10 ? '0' + currentDateTime.getMinutes().toString() : currentDateTime.getMinutes());
	}

	// Implements a visual "shake" effect for UI elements, primarily for input validation.
	function triggerVisualEffect(domContainer, domInput, visualEffect, backgroundColor){
		if(!isAnimationLocked){
			isAnimationLocked = true;
			externalJQLib(domContainer).addClass(visualEffect);
			externalJQLib(domInput).addClass(backgroundColor);
			window.setTimeout(function(){
				externalJQLib(domContainer).removeClass(visualEffect);
				externalJQLib(domInput).removeClass(backgroundColor);
				externalJQLib(domInput).focus();
				isAnimationLocked = false;
			}, 1800);
		}
	}
	
	// After a user name is provided, this function is called
	// to initialize the connection to the WebSocket server.
	function establishConnection(){
		// Display a "connecting..." message.
		externalJQLib('.overlay-screen .content').html('Establishing Connection...');
		
		// Initiate the WebSocket connection and store the socket instance.
		connectionSocket = socketManager.establish(serverEndpoint); // Assuming io is now socketManager
		
		// With the socket now available, set up its event handlers.
		configureSocketListeners();
	}

	// Execute this function once the entire DOM is loaded and ready.
	externalJQLib(function(){
		attachUIHandlers();
	});

})(jQuery);