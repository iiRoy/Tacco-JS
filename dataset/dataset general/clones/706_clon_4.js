class DataStreamReceiver {
    receive(payload, options) {
        console.log("DataStreamReceiver: input received", payload, options);
        if (typeof payload === 'string') {
            try {
                const parsedContent = JSON.parse(payload);
                if (parsedContent.type === 'file') {
                    console.log(`DataStreamReceiver: Preparing for file transfer: ${parsedContent.name} (${parsedContent.size} bytes)`);
                }
            } catch (errorParsing) {
            }
        } else {
             console.log(`DataStreamReceiver: Acquired binary segment of size ${payload.size || payload.byteLength}`);
        }
    }
}

class DataStreamSender {
    static send(transmissionParameters) {
        console.log("DataStreamSender: transmitting file", transmissionParameters.file.name);
        if (transmissionParameters.onFileSent) transmissionParameters.onFileSent(transmissionParameters.file.name);
        if (transmissionParameters.onFileProgress) transmissionParameters.onFileProgress(transmissionParameters.file.name);
    }
}

class MultiSessionProcessor {
    constructor() {
        this.communicationChannel = window.activeTransmissionPipe;
    }
    send(dataPayload) {
        if (this.communicationChannel && this.communicationChannel.readyState === 'open') {
            this.communicationChannel.send(JSON.stringify(dataPayload));
            console.log("MultiSessionProcessor: dispatched message", dataPayload);
        } else {
            console.warn("MultiSessionProcessor: Data conduit not established, transmission failed.");
        }
    }
}

const peerConfigParameters = { "iceServers": [{ "url": "stun:23.21.150.121" }] };
const peerOptionSettings = { 'optional': [{ 'DtlsSrtpKeyAgreement': true }] };

let activeTransmissionPipe = null;

const interfaceManager = {
    retrieveElement: (selector) => document.querySelector(selector),
    retrieveElementById: (id) => document.getElementById(id),
    registerEvent: (element, eventType, handler) => {
        if (element) element.addEventListener(eventType, handler);
    },
    updateDisplayContent: (element, content) => {
        if (element) element.innerHTML = content;
    },
    obtainInputValue: (element) => element ? element.value : '',
    setInputText: (element, textValue) => {
        if (element) element.value = textValue;
    },
    togglePanelVisibility: (panelId, makeVisible) => {
        const panel = interfaceManager.retrieveElement(panelId);
        if (panel) {
            panel.style.display = makeVisible ? 'block' : 'none';
            panel.setAttribute('aria-hidden', makeVisible ? 'false' : 'true');
            if (makeVisible) {
                panel.classList.add('show');
            } else {
                panel.classList.remove('show');
            }
        }
    },
    removePanel: (selector) => {
        const panel = interfaceManager.retrieveElement(selector);
        if (panel && panel.parentNode) {
            panel.parentNode.removeChild(panel);
        }
    },
    scrollContainerBottom: (container) => {
        if (container) container.scrollTop = container.scrollHeight;
    },
    activateFocus: (element) => {
        if (element) element.focus();
    }
};

const obtainTimeMarker = () => {
    const timeReference = new Date();
    const hours = String(timeReference.getHours()).padStart(2, '0');
    const minutes = String(timeReference.getMinutes()).padStart(2, '0');
    const seconds = String(timeReference.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
};

const appendToCommHistory = (messageContent, displayClass) => {
    const historyContainer = interfaceManager.retrieveElementById('chatlog');
    if (historyContainer) {
        const messageEntry = document.createElement('p');
        messageEntry.className = displayClass;
        messageEntry.textContent = `[${obtainTimeMarker()}] ${messageContent}`;
        historyContainer.appendChild(messageEntry);
    }
};

const binaryPayloadSent = (fileName) => {
    console.log(`${fileName} transfer completed.`);
};

const binaryPayloadProgress = (fileName) => {
    console.log(`${fileName} transfer ongoing.`);
};

const dispatchBinaryPayload = (payloadInfo) => {
    if (payloadInfo && payloadInfo.size) {
        DataStreamSender.send({
            file: payloadInfo,
            onFileSent: binaryPayloadSent,
            onFileProgress: binaryPayloadProgress,
        });
    }
};

const dispatchTextMessage = () => {
    const messageInputBox = interfaceManager.retrieveElementById('messageTextBox');
    const messageData = interfaceManager.obtainInputValue(messageInputBox);

    if (messageData) {
        const commService = new MultiSessionProcessor();
        appendToCommHistory(messageData, "text-success");
        commService.send({ message: messageData });
        interfaceManager.setInputText(messageInputBox, "");
        interfaceManager.scrollContainerBottom(interfaceManager.retrieveElementById('chatlog'));
    }
    return false;
};

class PeerCommEntity {
    constructor(isInitiatorRole, configSettings, optionalSettings, historyUpdateCallback) {
        this.connectionInstance = new RTCPeerConnection(configSettings, optionalSettings);
        this.isInitiatorRole = isInitiatorRole;
        this.dataLink = null;
        this.dataStreamReceiver = new DataStreamReceiver();
        this.historyUpdateCallback = historyUpdateCallback;

        this.configureConnectionHandlers();
    }

    configureConnectionHandlers() {
        this.connectionInstance.onicecandidate = (event) => {
            console.log("ICE candidate event (PeerCommEntity)", event);
            if (event.candidate === null) {
                if (this.isInitiatorRole) {
                    interfaceManager.updateDisplayContent(interfaceManager.retrieveElementById('localOffer'), JSON.stringify(this.connectionInstance.localDescription));
                } else {
                    interfaceManager.updateDisplayContent(interfaceManager.retrieveElementById('localAnswer'), JSON.stringify(this.connectionInstance.localDescription));
                }
            }
        };

        this.connectionInstance.ondatachannel = (event) => {
            console.log("Incoming data channel (PeerCommEntity)", event);
            this.dataLink = event.channel || event;
            window.activeTransmissionPipe = this.dataLink;
            this.setupDataLink(this.dataLink);
        };

        this.connectionInstance.onsignalingstatechange = (event) => {
            console.info('Signaling state altered:', this.connectionInstance.signalingState);
        };
        this.connectionInstance.oniceconnectionstatechange = (event) => {
            console.info('ICE connection state altered:', this.connectionInstance.iceConnectionState);
            if (this.connectionInstance.iceConnectionState === 'connected') {
                this.onCommLinkEstablished();
            }
        };
        this.connectionInstance.onicegatheringstatechange = (event) => {
            console.info('ICE gathering state altered:', this.connectionInstance.iceGatheringState);
        };
        this.connectionInstance.onaddstream = (event) => {
            console.log("Received remote media stream", event);
            const mediaOutput = new Audio();
            mediaOutput.autoplay = true;
            if (typeof attachMediaStream !== 'undefined') {
                attachMediaStream(mediaOutput, event.stream);
            } else {
                mediaOutput.srcObject = event.stream;
            }
        };
    }

    setupDataLink(link) {
        link.onopen = () => {
            console.log('Data channel fully open');
            this.historyUpdateCallback("Data channel fully open", "text-success");
            interfaceManager.togglePanelVisibility('#waitForConnection', false);
            interfaceManager.removePanel('#waitForConnection');
            if (this.isInitiatorRole) {
                interfaceManager.togglePanelVisibility('#showLocalAnswer', false);
            }
            interfaceManager.activateFocus(interfaceManager.retrieveElementById('messageTextBox'));
        };

        link.onmessage = (event) => {
            console.log("Received data (PeerCommEntity)", event.data);
            if (event.data.size) {
                this.dataStreamReceiver.receive(event.data, {});
            } else {
                if (typeof event.data === 'string' && event.data.charCodeAt(0) === 2) {
                    return;
                }
                try {
                    const incomingData = JSON.parse(event.data);
                    if (incomingData.type === 'file') {
                        this.dataStreamReceiver.receive(event.data, {});
                    } else {
                        this.historyUpdateCallback(incomingData.message, "text-info");
                        interfaceManager.scrollContainerBottom(interfaceManager.retrieveElementById('chatlog'));
                    }
                } catch (e) {
                    console.warn("Failed to decode message as JSON:", e, event.data);
                    this.historyUpdateCallback(`Raw data: ${event.data}`, "text-info");
                }
            }
        };

        link.onclose = () => console.log('Data channel terminated');
        link.onerror = (error) => console.error('Data channel malfunction:', error);
    }

    onCommLinkEstablished() {
        console.log("Communication link fully operational");
        this.historyUpdateCallback("Communication link fully operational", "text-success");
        interfaceManager.togglePanelVisibility('#waitForConnection', false);
        interfaceManager.removePanel('#waitForConnection');
        interfaceManager.togglePanelVisibility('#showLocalAnswer', false);
        interfaceManager.activateFocus(interfaceManager.retrieveElementById('messageTextBox'));
    }

    initiateCommOffer() {
        this.dataLink = this.connectionInstance.createDataChannel('test', { reliable: true });
        window.activeTransmissionPipe = this.dataLink;
        console.log("Initiated data channel (initiator)");
        this.setupDataLink(this.dataLink);

        this.connectionInstance.createOffer()
            .then(descriptor => {
                this.connectionInstance.setLocalDescription(descriptor);
                console.log("Generated local offer", descriptor);
            })
            .catch(error => console.warn("Could not generate offer", error));
    }

    processRemoteCommOffer(remoteDescriptor) {
        this.connectionInstance.setRemoteDescription(remoteDescriptor)
            .then(() => this.connectionInstance.createAnswer())
            .then(descriptor => {
                this.connectionInstance.setLocalDescription(descriptor);
                this.historyUpdateCallback("Generated local response", "text-success");
                console.log("Generated local response:", descriptor);
            })
            .catch(error => console.warn("Failed to generate response", error));
    }

    processRemoteCommResponse(remoteDescriptor) {
        console.log("Received remote response: ", remoteDescriptor);
        this.historyUpdateCallback("Received remote response", "text-success");
        this.connectionInstance.setRemoteDescription(remoteDescriptor);
    }

    assimilateIceCandidate(iceCandidate) {
        this.connectionInstance.addIceCandidate(iceCandidate)
            .catch(e => console.error("Error integrating received ICE candidate:", e));
    }
}

class PeerApplicationOrchestrator {
    constructor() {
        this.initiatorPeer = null;
        this.responderPeer = null;
        this.setupUserInterface();
    }

    setupUserInterface() {
        ['#showLocalOffer', '#getRemoteAnswer', '#waitForConnection', '#getRemoteOffer', '#showLocalAnswer'].forEach(id => {
            interfaceManager.togglePanelVisibility(id, false);
        });
        interfaceManager.togglePanelVisibility('#createOrJoin', true);

        interfaceManager.registerEvent(interfaceManager.retrieveElementById('createBtn'), 'click', () => {
            interfaceManager.togglePanelVisibility('#showLocalOffer', true);
            this.initiatorPeer = new PeerCommEntity(true, peerConfigParameters, peerOptionSettings, appendToCommHistory);
            this.initiatorPeer.initiateCommOffer();
        });

        interfaceManager.registerEvent(interfaceManager.retrieveElementById('joinBtn'), 'click', () => {
            interfaceManager.togglePanelVisibility('#getRemoteOffer', true);
            this.responderPeer = new PeerCommEntity(false, peerConfigParameters, peerOptionSettings, appendToCommHistory);
        });

        interfaceManager.registerEvent(interfaceManager.retrieveElementById('offerSentBtn'), 'click', () => {
            interfaceManager.togglePanelVisibility('#getRemoteAnswer', true);
        });

        interfaceManager.registerEvent(interfaceManager.retrieveElementById('offerRecdBtn'), 'click', () => {
            const offerText = interfaceManager.obtainInputValue(interfaceManager.retrieveElementById('remoteOffer'));
            try {
                const offerDescriptor = new RTCSessionDescription(JSON.parse(offerText));
                console.log("Received remote offer", offerDescriptor);
                appendToCommHistory("Received remote offer", "text-success");
                if (this.responderPeer) {
                    this.responderPeer.processRemoteCommOffer(offerDescriptor);
                    interfaceManager.togglePanelVisibility('#showLocalAnswer', true);
                } else {
                    console.error("Responder peer not initialized to process offer.");
                }
            } catch (e) {
                console.error("Invalid offer received:", e);
            }
        });

        interfaceManager.registerEvent(interfaceManager.retrieveElementById('answerSentBtn'), 'click', () => {
            interfaceManager.togglePanelVisibility('#waitForConnection', true);
        });

        interfaceManager.registerEvent(interfaceManager.retrieveElementById('answerRecdBtn'), 'click', () => {
            const answerText = interfaceManager.obtainInputValue(interfaceManager.retrieveElementById('remoteAnswer'));
            try {
                const answerDescriptor = new RTCSessionDescription(JSON.parse(answerText));
                if (this.initiatorPeer) {
                    this.initiatorPeer.processRemoteCommResponse(answerDescriptor);
                    interfaceManager.togglePanelVisibility('#waitForConnection', true);
                } else {
                    console.error("Initiator peer not initialized to process response.");
                }
            } catch (e) {
                console.error("Invalid response received:", e);
            }
        });

        interfaceManager.registerEvent(interfaceManager.retrieveElementById('fileBtn'), 'change', (event) => {
            const selectedFile = event.target.files[0];
            if (selectedFile) {
                console.log("Selected file for transfer:", selectedFile);
                dispatchBinaryPayload(selectedFile);
            }
        });

        interfaceManager.registerEvent(interfaceManager.retrieveElementById('messageSendBtn'), 'click', (event) => {
             event.preventDefault();
             dispatchTextMessage();
        });
        interfaceManager.registerEvent(interfaceManager.retrieveElementById('messageTextBox'), 'keypress', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                dispatchTextMessage();
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PeerApplicationOrchestrator();
});

if (typeof attachMediaStream === 'undefined') {
    window.attachMediaStream = function(element, stream) {
        element.srcObject = stream;
    };
}