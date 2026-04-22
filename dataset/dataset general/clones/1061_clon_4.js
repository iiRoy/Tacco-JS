const injectTextAtCursorPosition = (targetElement, contentString) => {
    const originalScrollPosition = targetElement.scrollTop;
    let cursorPosition = 0;
    const isFirefox = (targetElement.selectionStart || targetElement.selectionStart === 0);
    const isIE = document.selection;

    if (isIE) {
        targetElement.focus();
        const range = document.selection.createRange();
        range.moveStart('character', -targetElement.value.length);
        cursorPosition = range.text.length;
    } else if (isFirefox) {
        cursorPosition = targetElement.selectionStart;
    }

    const startPart = targetElement.value.substring(0, cursorPosition);
    const endPart = targetElement.value.substring(cursorPosition, targetElement.value.length);
    targetElement.value = startPart + contentString + endPart;
    cursorPosition += contentString.length;

    if (isIE) {
        targetElement.focus();
        const range = document.selection.createRange();
        range.moveStart('character', -targetElement.value.length);
        range.moveStart('character', cursorPosition);
        range.moveEnd('character', 0);
        range.select();
    } else if (isFirefox) {
        targetElement.selectionStart = cursorPosition;
        targetElement.selectionEnd = cursorPosition;
        targetElement.focus();
    }
    targetElement.scrollTop = originalScrollPosition;
};

const dispatchMessageToSystem = () => {
    const messageInput = document.querySelector('[data-chat-id="composer"]');
    if (!messageInput || messageInput.value.trim() === '') return; // Prevent sending empty messages

    messageCollection.insert({
        content: messageInput.value,
        originator: getCurrentUserIdentifier(),
        context: getCurrentLocationPath()
    });
    messageInput.value = '';
};

const ensureScrollAtBottom = () => {
    requestAnimationFrame(() => {
        try {
            const dialogueContainer = document.querySelector('[data-chat-id="feed"]');
            if (dialogueContainer) {
                dialogueContainer.scrollTop = dialogueContainer.scrollHeight;
            }
        } catch (error) {
            console.error('Failed to adjust scroll position:', error);
        }
    });
};

const ChatroomInterface = {
    retrieveMessages: () => {
        return messageCollection.find();
    },

    fetchParticipantProfile: (participantIdentifier) => {
        try {
            return userRegistry.findOne(participantIdentifier).participantData;
        } catch (error) {
            // Original code catches and ignores, so we do too.
        }
    },

    getOnlineParticipants: () => {
        const activePresences = onlinePresence.find({ participantIdentifier: { $exists: true } }).fetch();
        const activeIdentifiers = activePresences.map(presence => presence.participantIdentifier);
        const participantQuery = [];

        if (activeIdentifiers.length === 0) {
            return;
        }

        for (const id of activeIdentifiers) {
            participantQuery.push({ _id: id });
        }

        return userRegistry.find({ $or: participantQuery });
    },

    setupInitialDisplay: () => {
        const messageComposerElement = document.querySelector('[data-chat-id="composer"]');
        const messageFeedElement = document.querySelector('[data-chat-id="feed"]');
        const participantListElement = document.querySelector('[data-chat-id="participant-list"]');

        let keyPressListenerActive = false;

        const handleGlobalKeyPress = (e) => {
            if (e.target !== messageComposerElement) return;

            if (e.key === 'Enter') {
                if (e.shiftKey) {
                    injectTextAtCursorPosition(messageComposerElement, '\n');
                    e.preventDefault();
                    return false;
                } else {
                    if (messageComposerElement && messageComposerElement.disabled !== true) {
                        dispatchMessageToSystem();
                    }
                    e.preventDefault();
                    return false;
                }
            }
        };

        const handleComposerFocus = () => {
            if (!keyPressListenerActive) {
                document.addEventListener('keydown', handleGlobalKeyPress);
                keyPressListenerActive = true;
            }
        };

        const handleComposerBlur = () => {
            if (keyPressListenerActive) {
                document.removeEventListener('keydown', handleGlobalKeyPress);
                keyPressListenerActive = false;
            }
        };

        if (messageComposerElement) {
            messageComposerElement.addEventListener('focus', handleComposerFocus);
            messageComposerElement.addEventListener('blur', handleComposerBlur);
        }

        try {
            const applyCustomScrollStyles = (element) => {
                if (!element) return;
                element.style.overflowY = 'auto';
                element.style.scrollbarWidth = 'thin'; // Firefox
                element.style.scrollbarColor = 'rgba(0,0,0,0.3) rgba(0,0,0,0.1)'; // Firefox
            };

            applyCustomScrollStyles(messageFeedElement);
            applyCustomScrollStyles(participantListElement);

            // Webkit specific scrollbar styling (Chrome, Safari)
            if (!document.getElementById('custom-scroll-styles')) {
                const styleEl = document.createElement('style');
                styleEl.id = 'custom-scroll-styles';
                styleEl.textContent = `
                    [data-chat-id="feed"]::-webkit-scrollbar { width: 8px; }
                    [data-chat-id="feed"]::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
                    [data-chat-id="feed"]::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,0.3); border-radius: 4px; border: 2px solid rgba(0,0,0,0.1); }
                    [data-chat-id="participant-list"]::-webkit-scrollbar { width: 8px; }
                    [data-chat-id="participant-list"]::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
                    [data-chat-id="participant-list"]::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,0.3); border-radius: 4px; border: 2px solid rgba(0,0,0,0.1); }
                `;
                document.head.appendChild(styleEl);
            }
        } catch (error) {
            console.error('Failed to apply custom scrollbar styles to chatroom elements:', error);
        }

        ensureScrollAtBottom();
    },

    attachInteractionHandlers: () => {
        const messageComposerElement = document.querySelector('[data-chat-id="composer"]');
        const sendActionButton = document.querySelector('[data-chat-action="send"]');
        const charCountDisplayElement = document.querySelector('[data-chat-id="char-counter"]');
        const authFeedbackContainer = document.querySelector('[data-auth-id="controls"]');
        const participantTogglerButton = document.querySelector('[data-chat-action="toggle-participants"]');
        const participantListElement = document.querySelector('[data-chat-id="participant-list"]');

        if (sendActionButton) {
            sendActionButton.addEventListener('click', dispatchMessageToSystem);
        }

        if (messageComposerElement) {
            messageComposerElement.addEventListener('keyup', (e) => {
                const currentText = e.target.value;
                const textLength = currentText.length;
                const maxLength = 500;

                if (textLength > maxLength) {
                    e.target.value = currentText.substring(0, maxLength);
                } else if (charCountDisplayElement) {
                    charCountDisplayElement.textContent = maxLength - textLength;
                }
            });

            const showAuthPopover = () => {
                if (!authFeedbackContainer) return;
                let popoverElement = authFeedbackContainer.querySelector('.simple-auth-feedback-popover');
                if (!popoverElement) {
                    popoverElement = document.createElement('div');
                    popoverElement.className = 'simple-auth-feedback-popover';
                    popoverElement.style.position = 'absolute';
                    popoverElement.style.backgroundColor = '#f9f9f9';
                    popoverElement.style.border = '1px solid #ccc';
                    popoverElement.style.padding = '5px';
                    popoverElement.style.zIndex = '100';
                    popoverElement.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
                    popoverElement.style.borderRadius = '3px';
                    popoverElement.style.bottom = '100%'; // Position above the element
                    popoverElement.style.left = '0';
                    popoverElement.style.marginBottom = '5px';
                    authFeedbackContainer.appendChild(popoverElement);
                    authFeedbackContainer.style.position = 'relative';
                }
                popoverElement.textContent = 'You first need to login before sending messages.';
                popoverElement.style.display = 'block';
                authFeedbackContainer.dataset.popoverVisible = 'true';
            };

            const hideAuthPopover = () => {
                if (!authFeedbackContainer) return;
                const popoverElement = authFeedbackContainer.querySelector('.simple-auth-feedback-popover');
                if (popoverElement) {
                    popoverElement.style.display = 'none';
                }
                delete authFeedbackContainer.dataset.popoverVisible;
            };

            messageComposerElement.addEventListener('focus', () => {
                if (Meteor.user()) {
                    hideAuthPopover();
                    return;
                }
                showAuthPopover();
            });

            messageComposerElement.addEventListener('blur', () => {
                hideAuthPopover();
            });
        }

        if (participantTogglerButton && participantListElement) {
            participantTogglerButton.addEventListener('click', () => {
                if (participantListElement.style.display === 'none') {
                    participantListElement.style.display = '';
                } else {
                    participantListElement.style.display = 'none';
                }
            });
        }
    }
};

const observeUserPrivileges = () => {
    Meteor.autorun(() => {
        const activeUser = Meteor.user();
        const msgComposer = document.querySelector('[data-chat-id="composer"]');
        const sendControl = document.querySelector('[data-chat-action="send"]');

        if (activeUser && typeof activeUser.profile.canConverse !== 'undefined' && !activeUser.profile.canConverse) {
            if (msgComposer) {
                msgComposer.setAttribute('disabled', 'disabled');
                msgComposer.value = 'You are restricted from sending messages for 60s due to excessive activity.';
            }
            if (sendControl) {
                sendControl.setAttribute('disabled', 'disabled');
            }
        } else {
            if (msgComposer) {
                msgComposer.removeAttribute('disabled');
                msgComposer.value = '';
            }
            if (sendControl) {
                sendControl.removeAttribute('disabled');
            }
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {
    ChatroomInterface.setupInitialDisplay();
    ChatroomInterface.attachInteractionHandlers();
    observeUserPrivileges();
});

// Assuming these Meteor-related variables/functions are available in the global scope
// and are part of the underlying framework, not the application logic being cloned.
// Renamed for Type IV adherence where applicable to the application's interaction.
const messageCollection = typeof superChatMsgs !== 'undefined' ? superChatMsgs : new Mongo.Collection('mockChatMsgs');
const userRegistry = typeof Meteor !== 'undefined' && Meteor.users ? Meteor.users : new Mongo.Collection('mockUsers');
const onlinePresence = typeof Meteor !== 'undefined' && Meteor.presences ? Meteor.presences : new Mongo.Collection('mockPresences');
const getCurrentUserIdentifier = typeof Meteor !== 'undefined' && Meteor.userId ? Meteor.userId : () => 'mockUserId';
const getCurrentLocationPath = typeof Path !== 'undefined' ? Path : () => '/mock/path';
// Meteor.user() and Meteor.autorun are assumed to be directly available as core Meteor APIs.