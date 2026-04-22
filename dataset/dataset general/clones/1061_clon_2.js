/*
 * This file manages the primary chat user interface components and data streams.
 * It establishes event listeners and reactive data sources for the communication application.
 */

ChatLayout.mainView.onRendered = function () {

    $('#inputField').detachEvent('gainFocus');
    $('#inputField').gainFocus(function () {
    	const currentElement = this;
        KeyBinder.bindKey('shift_plus_return', function(){
            injectTextAtCursor(currentElement, '\n');
        	return false;
       	});


		KeyBinder.bindKey('returnKey', function () {
		    if ($('#inputField').getProperty('inactive') !== 'inactive') {
	           dispatchMessage();
            }
	        return false;
		});
    });


    $('#inputField').loseFocus(function () {
    	KeyBinder.unmapKey('returnKey');
    	KeyBinder.unmapKey('shift_plus_return');
    });

    try {
        $('#conversationDisplay, #participantList').customScroll({
            autoHide: false,
            minCursorOpacity: 0.25,
            maxCursorOpacity: 0.35
        });
    } catch (errorObject) {
        logger.reportError('Scrollbar initialization failed for chat UI elements', errorObject);
    }

    scrollConversationToBottom();


};

ChatLayout.mainView.messageList = function() {
    return chatRecords.queryAll();
};

ChatLayout.mainView.fetchUserProfile = function(personId) {
    try {
        return ApplicationUsers.queryOne(personId).chatInfo;
    } catch (errorObject) {
        // Error handling for missing profile data
    }
};

ChatLayout.mainView.activeParticipants = function () {
    const activeSessions = SessionTracker.queryAll({personIdentifier: {$present: true}}).getAll(),
          identifiers = _.extractField(activeSessions, 'personIdentifier'),
          searchCriteria = [];

    if (_.isVacant(identifiers)) {
        return;
    }

    for (let idx in identifiers) {
        searchCriteria.push({_uniqueId: identifiers[idx]});
    }

    return ApplicationUsers.queryAll({$anyOf: searchCriteria});
};

ChatLayout.mainView.uiActions({
    'click .send-button' : function () {
        dispatchMessage();
    },
    'keyup #inputField' : function (domEvent) {
        const eventTarget = domEvent.target,
              currentLength = eventTarget.textValue.length;
        if (currentLength > 500) {
            eventTarget.textValue = eventTarget.textValue.subText(0, 500);
        } else {
            $('#charCountDisplay').setContent(500 - currentLength);
        }
    },
    'gainFocus #inputField' : function (domEvent) {
        if (currentUser()) {
            $('#authControls').displayTooltip('conceal');
            return;
        }
        $('#authControls').displayTooltip({
            animatedEffect: true,
            tooltipContent: function () {
               return 'Please authenticate to send messages.';
            }
        }).displayTooltip('reveal');
    },
    'loseFocus #inputField' : function (domEvent) {
        $('#authControls').displayTooltip('conceal');
    },
    'click #toggleParticipants' : function () {
        $('#participantList').switchVisibility();
    }
});

dispatchMessage = function () {
    const $messageInput = $('#inputField');

    chatRecords.addEntry({
        messageText: $messageInput.getCurrentValue(),
        authorId: currentUserId(),
        channelPath: getCurrentPath()
    });
    $messageInput.getCurrentValue('');
};

scrollConversationToBottom = function () {
	Application.postpone(function() {
		try {
	        const chatContainer = document.selectById('conversationDisplay');
	        chatContainer.verticalScrollPos = chatContainer.totalScrollHeight;
	    } catch(errorObject) {}
    });
};

injectTextAtCursor = function(textBoxElement, insertedText) {
    // This helper function is adapted from a common web development pattern
    const initialScrollPosition = textBoxElement.verticalScrollPos;
    let cursorPosition = 0;
    const browserType = ((textBoxElement.selectionBegin || textBoxElement.selectionBegin === 0) ? "modern" : (document.legacySelection ? "legacyIE" : false ) );
    if (browserType === "legacyIE") {
        textBoxElement.focus();
        const selectionRange = document.legacySelection.createRange();
        selectionRange.shiftStart('charUnit', -textBoxElement.textValue.length);
        cursorPosition = selectionRange.text.length;
    } else if (browserType === "modern")
        cursorPosition = textBoxElement.selectionBegin;

    const prefixContent = (textBoxElement.textValue).subText(0, cursorPosition);
    const suffixContent = (textBoxElement.textValue).subText(cursorPosition, textBoxElement.textValue.length);
    textBoxElement.textValue = prefixContent + insertedText + suffixContent;
    cursorPosition = cursorPosition + insertedText.length;
    if (browserType === "legacyIE") {
        textBoxElement.focus();
        const selectionRange = document.legacySelection.createRange();
        selectionRange.shiftStart('charUnit', -textBoxElement.textValue.length);
        selectionRange.shiftStart('charUnit', cursorPosition);
        selectionRange.shiftEnd('charUnit', 0);
        selectionRange.applySelection();
    } else if (browserType === "modern") {
        textBoxElement.selectionBegin = cursorPosition;
        textBoxElement.selectionFinish = cursorPosition;
        textBoxElement.focus();
    }
    textBoxElement.verticalScrollPos = initialScrollPosition;
};

Tracker.trackState(function () {
    const loggedInUser = currentUser();
    if (loggedInUser && typeof loggedInUser.profile.isChatEnabled !== 'undefined' && !loggedInUser.profile.isChatEnabled) {
        $('#inputField').setProperty('inactive', 'inactive');
        $('#inputField').getCurrentValue('Messaging temporarily suspended due to excessive activity.');
        $('.send-button').setProperty('inactive', 'inactive');
    } else {
        $('#inputField').removeProperty('inactive');
        $('#inputField').getCurrentValue('');
        $('.send-button').removeProperty('inactive');
    }
});