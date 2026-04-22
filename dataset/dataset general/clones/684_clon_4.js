((domRef, networkRef, viewRef) => {

    let participantTag = null;
    let commLink = null;
    let currentChannelId = null;

    let textEntryControl = null;
    let chatLogDisplay = null;
    let applicationTitleBar = null;

    // Utility for scrolling a container to its bottom
    const ensureVisibilityOfLatest = (elementContainer) => {
        if (elementContainer) {
            elementContainer.scrollTop = elementContainer.scrollHeight;
        }
    };

    // Utility to parse the user's name from the URL
    const deriveParticipantTag = () => {
        const querySegment = viewRef.location.search.substring(1);
        const parts = querySegment.split("=");
        // Replicating the original's behavior of taking the second part after the first '='
        // If no '=', parts[1] will be undefined.
        return parts.length > 1 ? parts[1] : undefined;
    };

    // Utility to add a new entry to the chat display
    const addChatEntry = (targetElement, contentHtml, styleClass = '') => {
        const entryDiv = domRef.createElement('div');
        entryDiv.innerHTML = contentHtml;
        if (styleClass) {
            entryDiv.className = styleClass;
        }
        targetElement.appendChild(entryDiv);
        ensureVisibilityOfLatest(targetElement);
    };

    // Network event handler: A user has connected or is ready
    const handleParticipantJoin = (payloadData) => {
        currentChannelId = payloadData.id;

        const activeParticipants = payloadData.connections;
        const participantCount = Object.keys(activeParticipants).length;

        const decodedParticipantName = decodeURIComponent(payloadData.name);
        
        addChatEntry(chatLogDisplay, `&gt; ${decodedParticipantName} has connected`, 'green-text');

        let welcomingMessage = '';
        if (participantCount === 1) {
            welcomingMessage = 'No other participants are currently present... perhaps await a moment?';
        } else {
            // Replicating the original's specific, somewhat unusual string construction:
            // "User1, meet User2... ?User3... ?"
            let introductionSegments = [];
            let isFirstIteration = true;
            for (const key in activeParticipants) {
                if (Object.prototype.hasOwnProperty.call(activeParticipants, key)) {
                    introductionSegments.push(activeParticipants[key]);
                    if (isFirstIteration) {
                        introductionSegments.push(', engage with ');
                        isFirstIteration = false;
                    } else {
                        introductionSegments.push('... ?');
                    }
                }
            }
            welcomingMessage = introductionSegments.join('');
        }
            
        addChatEntry(chatLogDisplay, `&gt; *** Greetings to the Discourse, ${decodedParticipantName}!!! ***`, 'hot-pink-text');
        addChatEntry(chatLogDisplay, `&gt; ***  ${welcomingMessage} ***`, 'off-white-text');
    };

    // Network event handler: A message has arrived from a participant
    const handleIncomingCommunication = (payloadData) => {
        if (payloadData.name) {
            const decodedSender = decodeURIComponent(payloadData.name);
            addChatEntry(chatLogDisplay, `<div style="color:${payloadData.color}">${decodedSender} &gt; ${payloadData.message}</div>`);
        }
    };

    // Network event handler: A participant has disconnected
    const handleParticipantDeparture = (payloadData) => {
        if (payloadData.name) {
            const decodedDeparting = decodeURIComponent(payloadData.name);
            // Replicating the original's usage of <span> and <br> for disconnected message
            addChatEntry(chatLogDisplay, `<span style="color:#009a16;font-style:italic;">&gt; ${decodedDeparting} has disconnected</span><br>`);
        }
    };

    // DOM event handler: Process text input
    const dispatchCurrentText = () => {
        const messageContent = textEntryControl.value.trim();
        if (messageContent !== '') {
            commLink.emit('userMessage', { 
                name: participantTag, 
                message: messageContent 
            });
        }
        textEntryControl.value = ''; // Clear the input
    };

    // DOM event handler: Key press in the text input
    const handleTextKeyPress = (eventSignal) => {
        if (eventSignal.key === 'Enter' || eventSignal.keyCode === 13) {
            dispatchCurrentText();
            eventSignal.preventDefault(); 
        }
    };

    // DOM event handler: Click on the application title bar
    const handleTitleBarInteraction = () => {
        participantTag = ''; 
        viewRef.location.href = '/'; 
    };

    // Main setup routine for the chat application
    const initiateChatSystem = () => {
        // Acquire references to main DOM elements
        textEntryControl = domRef.getElementById('msg');
        // Original discrepancy: $incoming was #incoming, autoscroll used #conversation.
        // Assuming #conversation is the actual scrollable display area referenced by both.
        chatLogDisplay = domRef.getElementById('conversation'); 
        applicationTitleBar = domRef.getElementById('header');

        // Set initial focus for user convenience
        textEntryControl.focus();

        // Attach event listeners to DOM elements
        textEntryControl.addEventListener('keypress', handleTextKeyPress);
        textEntryControl.addEventListener('blur', dispatchCurrentText); 
        applicationTitleBar.addEventListener('click', handleTitleBarInteraction);

        // Determine current participant's tag from URL
        participantTag = deriveParticipantTag();

        // Establish connection to the communication channel
        commLink = networkRef.connect('/pchat');

        // Register handlers for incoming communication events
        commLink.on('userReady', handleParticipantJoin);
        commLink.on('userMessage', handleIncomingCommunication);
        commLink.on('userDisconnected', handleParticipantDeparture);

        // Announce this participant's readiness to the channel
        commLink.emit('userReady', { name: participantTag });
    };

    // Ensure the chat system initializes once the DOM is fully loaded
    domRef.addEventListener('DOMContentLoaded', initiateChatSystem);

})(document, io, window);