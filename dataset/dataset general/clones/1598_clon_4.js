const VisualIndicator = {
    _displayElement: null,
    _createDisplayElement() {
        if (!this._displayElement) {
            this._displayElement = document.createElement('div');
            this._displayElement.id = 'app-momentary-loader';
            this._displayElement.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.7); color: white; padding: 15px; border-radius: 8px; z-index: 10000; display: none; font-family: sans-serif;';
            this._displayElement.innerHTML = '<span class="loading-animation"></span> Loading...';
            document.body.appendChild(this._displayElement);
        }
    },
    showMomentary() {
        this._createDisplayElement();
        this._displayElement.style.display = 'block';
    },
    hideMomentary() {
        if (this._displayElement) {
            this._displayElement.style.display = 'none';
        }
    }
};

const ModalInput = {
    _modalContainer: null,
    _resolvePromise: null,
    _rejectPromise: null,

    _createModalElements() {
        if (!this._modalContainer) {
            this._modalContainer = document.createElement('div');
            this._modalContainer.id = 'dynamic-dialog-overlay';
            this._modalContainer.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 9999; font-family: sans-serif;';
            this._modalContainer.innerHTML = `
                <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2); min-width: 300px;">
                    <h3 id="dialog-title" style="margin-top: 0;"></h3>
                    <div id="dialog-content"></div>
                    <div style="margin-top: 20px; text-align: right;" id="dialog-buttons"></div>
                </div>
            `;
            document.body.appendChild(this._modalContainer);
        }
    },

    presentDialogue(config) {
        return new Promise((resolve, reject) => {
            this._createModalElements();
            this._resolvePromise = resolve;
            this._rejectPromise = reject;

            const dialogTitle = this._modalContainer.querySelector('#dialog-title');
            const dialogContent = this._modalContainer.querySelector('#dialog-content');
            const dialogButtons = this._modalContainer.querySelector('#dialog-buttons');

            dialogTitle.textContent = config.caption || '';
            dialogContent.innerHTML = config.markup || '';
            dialogButtons.innerHTML = '';

            const inputField = dialogContent.querySelector('input[type="text"]');
            if (inputField) {
                setTimeout(() => inputField.focus(), 100);
            }

            config.actionButtons.forEach(btnConfig => {
                const button = document.createElement('button');
                button.textContent = btnConfig.text;
                button.style.cssText = 'margin-left: 10px; padding: 8px 15px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;';
                button.style.backgroundColor = btnConfig.style === 'positive' ? '#28a745' : '#6c757d';
                button.style.color = 'white';

                button.addEventListener('click', () => {
                    const validationResult = btnConfig.validator ? btnConfig.validator(inputField ? inputField.value : null) : true;
                    if (validationResult) {
                        this._modalContainer.style.display = 'none';
                        resolve(inputField ? inputField.value : null);
                    } else {
                        // In a custom modal, e.preventDefault() means not closing and maybe showing an error.
                        // Here, we just don't close the modal.
                        console.warn('Validation failed for modal input.');
                    }
                });
                dialogButtons.appendChild(button);
            });

            this._modalContainer.style.display = 'flex';
        });
    },
    dismissDialogue() {
        if (this._modalContainer) {
            this._modalContainer.style.display = 'none';
            if (this._rejectPromise) {
                this._rejectPromise(new Error('Modal dismissed without action.'));
            }
        }
    }
};

const CommunicationBridge = (function() {
    let _userAlias = '';
    const _messageHistory = [];
    let _typingIndicator = false;

    const _simulateAsync = (data, delay = 300) => new Promise(resolve => setTimeout(() => resolve(data), delay));

    return {
        getIdentity() {
            return _userAlias;
        },
        setIdentity(alias) {
            _userAlias = alias;
        },
        retrievePastExchanges() {
            return [..._messageHistory];
        },
        dispatchExchange(content) {
            if (_userAlias && content) {
                const message = {
                    sender: _userAlias,
                    text: content,
                    timestamp: new Date().toLocaleTimeString()
                };
                _messageHistory.push(message);
                return _simulateAsync(message);
            }
            return Promise.reject('Cannot send empty message or without an alias.');
        },
        signalActiveTyping() {
            _typingIndicator = true;
        },
        haltActiveTyping() {
            _typingIndicator = false;
        },
        queryActiveIdentities() {
            const activeUsers = {
                'participantOne': { status: 'online' },
                'guestVisitor': { status: 'online' },
                'superUser': { status: 'away' },
                [_userAlias]: { status: 'online' }
            };
            return _simulateAsync({ data: activeUsers });
        }
    };
})();

const ScrollMechanic = {
    adjustToBottom(elementIdentifier) {
        const element = document.getElementById(elementIdentifier);
        if (element) {
            element.scrollTop = element.scrollHeight;
        }
    }
};

const EphemeralMessage = {
    _toastElement: null,
    _hideTimeout: null,

    _createToastElement() {
        if (!this._toastElement) {
            this._toastElement = document.createElement('div');
            this._toastElement.id = 'app-toast-message';
            this._toastElement.style.cssText = 'position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: #333; color: white; padding: 10px 20px; border-radius: 5px; z-index: 10001; opacity: 0; transition: opacity 0.3s ease-in-out; pointer-events: none; font-family: sans-serif;';
            document.body.appendChild(this._toastElement);
        }
    },

    displayAlert(content, duration = 3000) {
        this._createToastElement();
        clearTimeout(this._hideTimeout);
        this._toastElement.textContent = content;
        this._toastElement.style.opacity = '1';
        this._hideTimeout = setTimeout(() => this.conceal(), duration);
    },

    conceal() {
        if (this._toastElement) {
            this._toastElement.style.opacity = '0';
        }
    }
};

class RootUserExperience {
    constructor(loaderAgent, dialogAgent, commsHub) {
        this._loader = loaderAgent;
        this._dialog = dialogAgent;
        this._comms = commsHub;
        this._currentAlias = '';
        this._initialAliasCheck();
    }

    displayEphemeralLoader() {
        this._loader.showMomentary();
    }

    concealEphemeralLoader() {
        this._loader.hideMomentary();
    }

    async initiateAliasSelection() {
        try {
            const chosenAlias = await this._dialog.presentDialogue({
                caption: 'Select Your Identifier',
                markup: '<input type="text" id="alias-input" placeholder="Enter your name" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" autofocus>',
                actionButtons: [{
                    text: 'Confirm',
                    style: 'positive',
                    validator: (val) => val && val.trim() !== ''
                }]
            });
            this._comms.setIdentity(chosenAlias);
            this._currentAlias = chosenAlias;
            document.dispatchEvent(new CustomEvent('aliasUpdated', { detail: chosenAlias }));
        } catch (err) {
            console.error('Alias selection cancelled or failed:', err);
            this.initiateAliasSelection();
        }
    }

    _initialAliasCheck() {
        this._currentAlias = this._comms.getIdentity();
        if (!this._currentAlias) {
            this.initiateAliasSelection();
        } else {
            document.dispatchEvent(new CustomEvent('aliasUpdated', { detail: this._currentAlias }));
        }
    }
}

class ConversationManager {
    constructor(scrollAgent, commsHub, alertAgent, messageInputFieldId, messageDisplayAreaId, sendButtonId) {
        this._scroller = scrollAgent;
        this._comms = commsHub;
        this._notifier = alertAgent;
        this._messageInput = document.getElementById(messageInputFieldId);
        this._messageDisplay = document.getElementById(messageDisplayAreaId);
        this._sendButton = document.getElementById(sendButtonId);
        this._exchangeRecords = [];

        this._notifier.conceal();

        this._setupListeners();
        this._refreshDisplay();
        this._scroller.adjustToBottom(messageDisplayAreaId);
    }

    _setupListeners() {
        if (this._messageInput) {
            this._messageInput.addEventListener('input', this._handleTextInput.bind(this));
        }
        if (this._sendButton) {
            this._sendButton.addEventListener('click', this._transmitMessage.bind(this));
        }
        document.addEventListener('aliasUpdated', this._refreshDisplay.bind(this));
    }

    _handleTextInput() {
        const currentText = this._messageInput.value;
        if (currentText.trim() !== '') {
            this._comms.signalActiveTyping();
        } else {
            this._comms.haltActiveTyping();
        }
    }

    async _transmitMessage() {
        const messageContent = this._messageInput.value;
        if (messageContent.trim() !== '') {
            try {
                await this._comms.dispatchExchange(messageContent);
                this._messageInput.value = '';
                this._comms.haltActiveTyping();
                this._refreshDisplay();
                this._scroller.adjustToBottom(this._messageDisplay.id);
            } catch (error) {
                this._notifier.displayAlert(error);
            }
        } else {
            this._notifier.displayAlert('Message cannot be empty!');
        }
    }

    _refreshDisplay() {
        this._exchangeRecords = this._comms.retrievePastExchanges();
        if (this._messageDisplay) {
            this._messageDisplay.innerHTML = '';
            this._exchangeRecords.forEach(msg => {
                const msgElement = document.createElement('div');
                msgElement.textContent = `${msg.timestamp} - ${msg.sender}: ${msg.text}`;
                msgElement.style.cssText = 'padding: 5px; border-bottom: 1px solid #eee; font-family: sans-serif;';
                if (msg.sender === this._comms.getIdentity()) {
                    msgElement.style.textAlign = 'right';
                    msgElement.style.backgroundColor = '#e0f7fa';
                }
                this._messageDisplay.appendChild(msgElement);
            });
            this._scroller.adjustToBottom(this._messageDisplay.id);
        }
    }
}

class OnlineParticipantsRenderer {
    constructor(loaderAgent, commsHub, displayElementId) {
        this._loader = loaderAgent;
        this._comms = commsHub;
        this._displayElement = document.getElementById(displayElementId);
        this._participantList = {};
        this._participantCount = 0;

        this.renderParticipants();
    }

    async renderParticipants() {
        this._loader.showMomentary();
        try {
            const response = await this._comms.queryActiveIdentities();
            this._participantList = response.data;
            this._participantCount = Object.keys(response.data).length;
            this._updateDisplay();
        } catch (error) {
            console.error('Failed to fetch participants:', error);
            if (this._displayElement) {
                this._displayElement.innerHTML = '<p style="font-family: sans-serif;">Error loading participants.</p>';
            }
        } finally {
            this._loader.hideMomentary();
        }
    }

    _updateDisplay() {
        if (this._displayElement) {
            this._displayElement.innerHTML = `<h4 style="font-family: sans-serif;">Online Users (${this._participantCount})</h4>`;
            const ul = document.createElement('ul');
            ul.style.listStyle = 'none';
            ul.style.padding = '0';
            ul.style.fontFamily = 'sans-serif';
            for (const alias in this._participantList) {
                const li = document.createElement('li');
                li.textContent = `${alias} (${this._participantList[alias].status})`;
                li.style.padding = '5px 0';
                ul.appendChild(li);
            }
            this._displayElement.appendChild(ul);
        }
    }
}

class UserProfileViewer {
    constructor(commsHub, displayElementId) {
        this._comms = commsHub;
        this._displayElement = document.getElementById(displayElementId);
        document.addEventListener('aliasUpdated', this.showCurrentIdentity.bind(this));
        this.showCurrentIdentity();
    }

    showCurrentIdentity() {
        const currentAlias = this._comms.getIdentity();
        if (this._displayElement) {
            this._displayElement.textContent = `Current User: ${currentAlias || 'Not Set'}`;
            this._displayElement.style.fontFamily = 'sans-serif';
        }
    }
}

const ApplicationCore = (function() {
    let _rootExperienceInstance;
    let _conversationManagerInstance;
    let _onlineParticipantsRendererInstance;
    let _userProfileViewerInstance;

    function initializeApplication() {
        _rootExperienceInstance = new RootUserExperience(VisualIndicator, ModalInput, CommunicationBridge);

        _conversationManagerInstance = new ConversationManager(
            ScrollMechanic,
            CommunicationBridge,
            EphemeralMessage,
            'chat-input-field',
            'chat-messages-display',
            'send-message-button'
        );

        _onlineParticipantsRendererInstance = new OnlineParticipantsRenderer(
            VisualIndicator,
            CommunicationBridge,
            'people-list-container'
        );

        _userProfileViewerInstance = new UserProfileViewer(
            CommunicationBridge,
            'account-username-display'
        );

        return {
            rootExperience: _rootExperienceInstance,
            conversationManager: _conversationManagerInstance,
            onlineParticipantsRenderer: _onlineParticipantsRendererInstance,
            userProfileViewer: _userProfileViewerInstance
        };
    }

    document.addEventListener('DOMContentLoaded', () => {
        window.app = initializeApplication();
    });

    return {
        initialize: initializeApplication
    };
})();