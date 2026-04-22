const domAccessor = {
    fetchElement: function(elementId) {
        return document.getElementById(elementId);
    },
    displayElement: function(element) {
        if (element) element.style.display = 'block';
    },
    concealElement: function(element) {
        if (element) element.style.display = 'none';
    }
};

class RtcSessionManager {
    constructor(localVideoId, remoteVideoId, signalingFacility) {
        this.mediaSource = domAccessor.fetchElement(localVideoId);
        this.targetSource = domAccessor.fetchElement(remoteVideoId);
        this.channelLink = signalingFacility;
        this.peerBridge = null;
        this.mediaFlow = null;
        this.distantFlow = null;
        this.distantUserIdentifier = null;
        this.mediaReadyState = false;

        this.channelLink.onMessage(this.processIncomingSignal.bind(this));
        this.obtainMedia(() => {
            this.mediaReadyState = true;
        });
    }

    obtainMedia(completionHandler) {
        if (this.mediaFlow) {
            completionHandler && completionHandler();
            return;
        }

        navigator.mediaDevices.getUserMedia({ audio: true, video: true })
            .then(stream => {
                console.info("Local media access granted.");
                this.mediaFlow = stream;
                this.mediaSource.srcObject = stream;
                this.mediaSource.play();
                completionHandler && completionHandler();
            })
            .catch(error => {
                console.error("Failed to acquire local media:", error);
            });
    }

    haltMedia() {
        if (this.mediaFlow) {
            this.mediaFlow.getTracks().forEach(track => track.stop());
            this.mediaFlow = null;
            this.mediaSource.srcObject = null;
            domAccessor.concealElement(this.mediaSource);
        }
        this.concludeLink();
    }

    transmitSignal(payload) {
        this.channelLink.sendMessage({
            to: this.distantUserIdentifier,
            rtc: payload
        });
    }

    commenceLink(peerId) {
        domAccessor.displayElement(this.mediaSource);
        if (this.distantUserIdentifier) {
            return;
        }
        this.distantUserIdentifier = peerId;

        if (!this.peerBridge) {
            this.formPeerBridge();
        }
        if (this.mediaFlow) {
            this.mediaFlow.getTracks().forEach(track => this.peerBridge.addTrack(track, this.mediaFlow));
        }

        this.peerBridge.createOffer()
            .then(offer => this.peerBridge.setLocalDescription(offer))
            .then(() => {
                this.transmitSignal({ type: "offer", data: this.peerBridge.localDescription.toJSON() });
            })
            .catch(error => console.error("Error creating/sending offer:", error));
    }

    concludeLink() {
        if (this.distantFlow) {
            this.distantFlow = null;
        }
        if (this.peerBridge) {
            this.peerBridge.close();
            this.peerBridge = null;
        }
        this.transmitSignal({ type: "hangup" });
        this.distantUserIdentifier = null;
        domAccessor.concealElement(this.targetSource);
        domAccessor.concealElement(this.mediaSource);
    }

    formPeerBridge() {
        this.peerBridge = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        this.peerBridge.onicecandidate = event => {
            if (event.candidate) {
                this.transmitSignal({ type: "icecandidate", data: event.candidate.toJSON() });
            } else {
                console.debug("ICE candidate gathering finished.");
            }
        };

        this.peerBridge.ontrack = event => {
            console.info("Distant track received.");
            if (event.streams && event.streams[0]) {
                this.distantFlow = event.streams[0];
                this.targetSource.srcObject = this.distantFlow;
                this.targetSource.play();
                domAccessor.displayElement(this.targetSource);
            }
        };

        this.peerBridge.onremovetrack = () => {
            console.info("Distant track removed.");
            this.targetSource.srcObject = null;
        };
    }

    processIncomingSignal(messageEnvelope) {
        if (messageEnvelope.data.rtc && messageEnvelope.data.to == localIdStorage.id) {
            const receivedSignal = messageEnvelope.data.rtc;
            if (receivedSignal.type === 'hangup') {
                this.concludeLink();
            } else if (receivedSignal.type === 'offer' && !this.distantUserIdentifier) {
                this.distantUserIdentifier = messageEnvelope.user;
                console.log('Received connection offer:', receivedSignal);
                if (!this.peerBridge) {
                    this.formPeerBridge();
                }
                if (this.mediaFlow) {
                    this.mediaFlow.getTracks().forEach(track => this.peerBridge.addTrack(track, this.mediaFlow));
                }

                const connectionOffer = new RTCSessionDescription(receivedSignal.data);
                this.peerBridge.setRemoteDescription(connectionOffer)
                    .then(() => this.peerBridge.createAnswer())
                    .then(answer => this.peerBridge.setLocalDescription(answer))
                    .then(() => {
                        this.transmitSignal({ type: "answer", data: this.peerBridge.localDescription.toJSON() });
                    })
                    .catch(error => console.error("Error processing offer or creating response:", error));

            } else if (receivedSignal.type === "answer") {
                console.log('Received connection response:', receivedSignal);
                const connectionResponse = new RTCSessionDescription(receivedSignal.data);
                this.peerBridge.setRemoteDescription(connectionResponse)
                    .catch(error => console.error("Error setting distant response:", error));
            } else if (receivedSignal.type === "icecandidate") {
                const iceComponent = new RTCIceCandidate(receivedSignal.data);
                this.peerBridge.addIceCandidate(iceComponent)
                    .catch(error => console.error("Error adding ICE component:", error));
            }
        }
    }
}

(function() {
    let communicationManager;

    function activateComms(targetIdentifier) {
        if (!communicationManager) {
            communicationManager = new RtcSessionManager('local', 'remote', commsHub);
        }
        communicationManager.commenceLink(targetIdentifier);
    }

    function deactivateComms() {
        if (communicationManager) {
            communicationManager.concludeLink();
        }
    }

    function releaseLocalResources() {
        if (communicationManager) {
            communicationManager.haltMedia();
        }
    }

    window.initiateP2PCall = activateComms;
    window.endP2PCall = deactivateComms;
    window.releaseLocalMedia = releaseLocalResources;
})();