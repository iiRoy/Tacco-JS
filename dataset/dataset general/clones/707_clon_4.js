class CommunicationPortal {
    #participantIdentifier = null;
    #previousSpeaker = null;
    #protocolStateSubscription = null;
    #linkStatus = false;

    // DOM element references
    #entryDisplay;
    #activeDisplay;
    #identifierField;
    #alternativeServerField;
    #messageField;
    #entryAction;
    #exitAction;
    #transmitAction;
    #conversationLogArea;
    #memberListing;

    constructor() {
        this.#acquireDomElements();
        this.#bindEventListeners();
        this.#startApplicationDisplay();
        window.addEventListener('beforeunload', this.#terminateParticipation.bind(this));
    }

    #acquireDomElements() {
        this.#entryDisplay = document.getElementById('join');
        this.#activeDisplay = document.getElementById('joined');
        this.#identifierField = document.getElementById('username');
        this.#alternativeServerField = document.getElementById('altServer');
        this.#messageField = document.getElementById('phrase');
        this.#entryAction = document.getElementById('joinB');
        this.#exitAction = document.getElementById('leaveB');
        this.#transmitAction = document.getElementById('sendB');
        this.#conversationLogArea = document.getElementById('chat');
        this.#memberListing = document.getElementById('members');
    }

    #bindEventListeners() {
        this.#entryAction.addEventListener('click', this.#commenceParticipation.bind(this));
        this.#exitAction.addEventListener('click', this.#terminateParticipation.bind(this));
        this.#identifierField.addEventListener('keyup', (activity) => {
            if (activity.key === 'Enter') {
                this.#commenceParticipation();
                activity.preventDefault();
            }
        });
        this.#messageField.addEventListener('keyup', (activity) => {
            if (activity.key === 'Enter') {
                this.#dispatchContent();
                activity.preventDefault();
            }
        });
        this.#transmitAction.addEventListener('click', this.#dispatchContent.bind(this));
    }

    #startApplicationDisplay() {
        this.#entryDisplay.style.display = 'block';
        this.#activeDisplay.style.display = 'none';
        this.#messageField.focus();
        this.#alternativeServerField.setAttribute('autocomplete', 'off');
        this.#identifierField.setAttribute('autocomplete', 'off');
        this.#messageField.setAttribute('autocomplete', 'off');
    }

    #commenceParticipation() {
        this.#participantIdentifier = this.#identifierField.value.trim();
        if (!this.#participantIdentifier) {
            window.alert('Participant identity is required!');
            return;
        }

        const designatedServiceEndpoint = this.#alternativeServerField.value.trim();
        const serviceNodeLocation =
            `${document.location.protocol}//` +
            (designatedServiceEndpoint.length > 0 ? designatedServiceEndpoint : document.location.hostname) +
            `:${document.location.port}/cometd`;
        console.log('CometD communications initiating to ' + serviceNodeLocation);

        window.globalCometInterface.establishConnection(serviceNodeLocation);
        this.#linkStatus = true;

        this.#entryDisplay.style.display = 'none';
        this.#activeDisplay.style.display = 'block';
        this.#identifierField.focus();

        window.globalCometInterface.initiateBatchOperations();
        window.globalCometInterface.registerSubscription('/chat/demo', this.#processIncomingPayload.bind(this));
        window.globalCometInterface.publishMessage('/chat/demo', {
            user: this.#participantIdentifier,
            join: true,
            chat: `${this.#participantIdentifier} has entered the discussion.`
        });
        window.globalCometInterface.concludeBatchOperations();

        if (this.#protocolStateSubscription) {
            window.globalCometInterface.deregisterSubscription(this.#protocolStateSubscription);
        }
        this.#protocolStateSubscription = window.globalCometInterface.registerSubscription('/cometd/meta', (eventManifest) => {
            if (eventManifest.action === 'handshake') {
                if (eventManifest.reestablish) {
                    if (eventManifest.successful) {
                        window.globalCometInterface.registerSubscription('/chat/demo', this.#processIncomingPayload.bind(this));
                        window.globalCometInterface.publishMessage('/chat/demo', {
                            user: this.#participantIdentifier,
                            join: true,
                            chat: `${this.#participantIdentifier} has rejoined the discussion.`
                        });
                    }
                    this.#processIncomingPayload({
                        data: {
                            join: true,
                            user: 'SYSTEM',
                            chat: `Handshake process: ${eventManifest.successful ? 'Completed' : 'Failed'}`
                        }
                    });
                }
            } else if (eventManifest.action === 'connect') {
                if (eventManifest.successful && !this.#linkStatus) {
                    this.#processIncomingPayload({
                        data: {
                            join: true,
                            user: 'SYSTEM',
                            chat: 'Network link re-established!'
                        }
                    });
                }
                if (!eventManifest.successful && this.#linkStatus) {
                    this.#processIncomingPayload({
                        data: {
                            leave: true,
                            user: 'SYSTEM',
                            chat: 'Network link interrupted!'
                        }
                    });
                }
                this.#linkStatus = eventManifest.successful;
            }
        });
    }

    #dispatchContent() {
        const textInput = this.#messageField;
        const currentText = textInput.value.trim();
        textInput.value = '';

        if (!currentText) {
            return false;
        }

        window.globalCometInterface.publishMessage('/chat/demo', {
            user: this.#participantIdentifier,
            chat: currentText
        });
    }

    #processIncomingPayload(receivedManifest) {
        if (!receivedManifest.data) {
            window.console && console.warn('Invalid incoming data format: ' + receivedManifest);
            return;
        }

        if (Array.isArray(receivedManifest.data)) {
            let participantListMarkup = receivedManifest.data.map(item => `<div>${item}</div>`).join('');
            this.#memberListing.innerHTML = participantListMarkup;
        } else {
            const discussionArea = this.#conversationLogArea;
            const originIdentity = receivedManifest.data.user;
            const isSystemEvent = receivedManifest.data.join || receivedManifest.data.leave;
            const messageBody = receivedManifest.data.chat;
            if (!messageBody) {
                return;
            }

            let renderedIdentity = originIdentity;
            if (!isSystemEvent && originIdentity === this.#previousSpeaker) {
                renderedIdentity = '...';
            } else {
                this.#previousSpeaker = originIdentity;
                renderedIdentity += ':';
            }

            let contentFragment;
            if (isSystemEvent) {
                contentFragment = `<span class="alert"><span class="from">${renderedIdentity}&nbsp;</span><span class="text">${messageBody}</span></span><br/>`;
                this.#previousSpeaker = '';
            } else {
                contentFragment = `<span class="from">${renderedIdentity}&nbsp;</span><span class="text">${messageBody}</span><br/>`;
            }
            discussionArea.insertAdjacentHTML('beforeend', contentFragment);

            discussionArea.scrollTop = discussionArea.scrollHeight - discussionArea.clientHeight;
        }
    }

    #terminateParticipation() {
        if (!this.#participantIdentifier) {
            return;
        }

        if (this.#protocolStateSubscription) {
            window.globalCometInterface.deregisterSubscription(this.#protocolStateSubscription);
        }
        this.#protocolStateSubscription = null;

        window.globalCometInterface.initiateBatchOperations();
        window.globalCometInterface.deregisterSubscription('/chat/demo', this.#processIncomingPayload.bind(this));
        window.globalCometInterface.publishMessage('/chat/demo', {
            user: this.#participantIdentifier,
            leave: true,
            chat: `${this.#participantIdentifier} has departed the discussion.`
        });
        window.globalCometInterface.concludeBatchOperations();

        this.#entryDisplay.style.display = 'block';
        this.#activeDisplay.style.display = 'none';
        this.#identifierField.focus();
        this.#participantIdentifier = null;
        window.globalCometInterface.severConnection();
        this.#memberListing.innerHTML = '';
    }
}

window.globalCometInterface = {
    _channelSubscribers: {},
    _activeConnection: false,
    _batchMode: false,
    _queuedMessages: [],

    establishConnection: function(targetUrl) {
        console.log(`[GlobalCometInterface] Establishing link to ${targetUrl}`);
        this._activeConnection = true;
    },
    severConnection: function() {
        console.log('[GlobalCometInterface] Disconnecting link');
        this._activeConnection = false;
        this._channelSubscribers = {};
    },
    registerSubscription: function(topic, handlerFunction) {
        if (!this._channelSubscribers[topic]) {
            this._channelSubscribers[topic] = [];
        }
        this._channelSubscribers[topic].push(handlerFunction);
        console.log(`[GlobalCometInterface] Subscribed to topic: ${topic}`);
        return { topic: topic, handler: handlerFunction };
    },
    deregisterSubscription: function(handleObject) {
        if (handleObject && this._channelSubscribers[handleObject.topic]) {
            this._channelSubscribers[handleObject.topic] = this._channelSubscribers[handleObject.topic].filter(
                cb => cb !== handleObject.handler
            );
            console.log(`[GlobalCometInterface] Unsubscribed from topic: ${handleObject.topic}`);
        }
    },
    publishMessage: function(topic, content) {
        if (this._batchMode) {
            this._queuedMessages.push({ topic, content });
        } else {
            console.log(`[GlobalCometInterface] Publishing to topic ${topic}:`, content);
        }
    },
    initiateBatchOperations: function() {
        this._batchMode = true;
        this._queuedMessages = [];
        console.log('[GlobalCometInterface] Batch operations initiated.');
    },
    concludeBatchOperations: function() {
        this._batchMode = false;
        console.log('[GlobalCometInterface] Batch operations concluded. Transmitting queued messages.');
        this._queuedMessages.forEach(({ topic, content }) => this.publishMessage(topic, content));
        this._queuedMessages = [];
    }
};

document.addEventListener('DOMContentLoaded', () => {
    new CommunicationPortal();
});