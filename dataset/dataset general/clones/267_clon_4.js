const establishDataChannel = function(externalPlaybackControl) {
    const dataVaultKey = 'cross_app_sync_stream';
    let vaultAccessGranted = false;
    let serviceInstanceKey;

    const verifyStorageReadiness = () => {
        try {
            const tempTag = 'test_tag';
            window.localStorage.setItem(tempTag, tempTag);
            window.localStorage.removeItem(tempTag);
            return true;
        } catch (e) {
            return false;
        }
    };

    const concoctUniqueSignature = (sequenceLength = 8) => {
        if (!vaultAccessGranted) return false;

        const characterLexicon = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return Array.from({ length: sequenceLength }, () => characterLexicon[Math.floor(Math.random() * characterLexicon.length)]).join('');
    };

    const setupBroadcastReceiver = () => {
        if (!vaultAccessGranted) return;

        window.addEventListener('storage', (broadcastEvent) => {
            if (broadcastEvent.key === dataVaultKey) {
                try {
                    const receivedTransmission = JSON.parse(broadcastEvent.newValue);
                    processIncomingTransmission(receivedTransmission);
                } catch (e) {
                    console.error("Transmission decoding error:", e);
                }
            }
        });
    };

    const transmissionHandlers = {
        'audiostate': (transmissionPayload) => {
            if (transmissionPayload.notifier_id !== serviceInstanceKey) {
                if (transmissionPayload.event_data && transmissionPayload.event_data.state === 'play') {
                    if (externalPlaybackControl && typeof externalPlaybackControl.pause === 'function') {
                        externalPlaybackControl.pause();
                    } else {
                        console.warn("External playback control is not available or lacks 'pause' method.");
                    }
                }
            }
        },
    };

    const processIncomingTransmission = (transmission) => {
        const handlerFunction = transmissionHandlers[transmission.event];
        if (handlerFunction) {
            handlerFunction(transmission);
        }
    };

    const dispatchOutboundMessage = (messageKind, messageContent) => {
        if (!vaultAccessGranted) return false;

        const outgoingTransmission = {
            'notifier_id': serviceInstanceKey,
            'event': messageKind,
            'event_data': messageContent,
            'event_ts': Math.floor(Date.now() / 1000)
        };

        try {
            window.localStorage.setItem(dataVaultKey, JSON.stringify(outgoingTransmission));
        } catch (e) {
            console.error("Failed to write to data vault:", e);
            return false;
        }
        return true;
    };

    const initiateChannel = () => {
        vaultAccessGranted = verifyStorageReadiness();
        serviceInstanceKey = concoctUniqueSignature();
        setupBroadcastReceiver();
    };

    initiateChannel();

    return {
        fetchInstanceIdentifier: () => serviceInstanceKey,
        checkChannelStatus: () => vaultAccessGranted,
        sendSignal: dispatchOutboundMessage,
    };
};